import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE63_JINHAO_BRAND_ID } from "./data/phase63-jinhao-split";
import { PHASE90_JINHAO_82_ID, PHASE90_JINHAO_82_SLUG, PHASE90_JINHAO_9019_ID, PHASE90_JINHAO_9019_SLUG, phase90JinhaoPacks } from "./data/phase90-jinhao-82-9019";
export type ApplyPhase90Options = ApplyPhase22Options; export type ApplyPhase90Result = ApplyPhase22Result;
const id=(p:string,v:string)=>`${p}-${createHash("sha256").update(v).digest("hex").slice(0,24)}`;
const inside=(p:string,r:string)=>{const x=path.relative(r,p);return x!==""&&!x.startsWith("..")&&!path.isAbsolute(x)};
async function owned(c:Client,o:ApplyPhase90Options){for(const k of ["TURSO_DATABASE_URL","TURSO_AUTH_TOKEN","FPKG_DATABASE_URL"] as const)if((o.env??process.env)[k]?.trim())throw new Error(`Phase 90 refuses remote selection: ${k}.`);assertCatalogSnapshotUnchanged(o.protectedCatalogSnapshot);const r=fs.realpathSync.native(o.ownedRoot),d=fs.realpathSync.native(o.databasePath),p=fs.realpathSync.native(o.protectedCatalogPath);if(!fs.statSync(r).isDirectory()||!fs.statSync(d).isFile()||fs.lstatSync(o.databasePath).isSymbolicLink()||!inside(d,r))throw new Error("Phase 90 owned catalog authority check failed.");const a=fs.statSync(d,{bigint:true}),b=fs.statSync(p,{bigint:true});if(d===p||(a.dev===b.dev&&a.ino===b.ino))throw new Error("Phase 90 refuses protected catalog.");const q=await c.execute("PRAGMA database_list");if(fs.realpathSync.native(String(q.rows.find(x=>String(x.name)==="main")?.file??""))!==d)throw new Error("Phase 90 client is not bound to owned copy.");if((await c.execute({sql:"SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",args:["032_taxonomy_identity.sql"]})).rows.length!==1)throw new Error("Phase 90 requires migration 032.");}
async function topology(c:Client){const t=await c.transaction("write");try{const brand=await t.execute({sql:"SELECT type,slug FROM entities WHERE id=?",args:[PHASE63_JINHAO_BRAND_ID]});if(brand.rows.length!==1||String(brand.rows[0]?.type)!=="brand"||String(brand.rows[0]?.slug)!=="jinhao")throw new Error("Phase 90 Jinhao brand mismatch.");for(const p of [{id:PHASE90_JINHAO_82_ID,slug:PHASE90_JINHAO_82_SLUG,name:"Jinhao 82"},{id:PHASE90_JINHAO_9019_ID,slug:PHASE90_JINHAO_9019_SLUG,name:"Jinhao 9019 Dadao"}]){const a=await t.execute({sql:"SELECT id,type FROM entities WHERE id=? OR slug=?",args:[p.id,p.slug]});if(a.rows.length===0)await t.execute({sql:"INSERT INTO entities (id,type,slug,name) VALUES (?,'pen',?,?)",args:[p.id,p.slug,p.name]});else if(a.rows.length!==1||String(a.rows[0]?.id)!==p.id||String(a.rows[0]?.type)!=="pen")throw new Error(`Phase 90 identity collision: ${p.slug}.`);else await t.execute({sql:"UPDATE entities SET slug=?,name=? WHERE id=?",args:[p.slug,p.name,p.id]});await t.execute({sql:"DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",args:[p.id,PHASE63_JINHAO_BRAND_ID]});await t.execute({sql:"INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'made_by',?)",args:[id("phase90-maker",p.id),p.id,PHASE63_JINHAO_BRAND_ID,"Phase 90 exact Jinhao model maker relation"]});await t.execute({sql:"INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'reverse',?)",args:[id("phase90-reverse",p.id),PHASE63_JINHAO_BRAND_ID,p.id,"Phase 90 Jinhao model navigation"]});}await t.commit()}catch(e){if(!t.closed)await t.rollback();throw e}}
async function capturePublicEntities(c: Client): Promise<string[]> {
  const rows = await c.execute({
    sql: `SELECT publication.entity_id
            FROM entity_publications publication
            JOIN public_entities public ON public.id = publication.entity_id
            JOIN entities entity ON entity.id = publication.entity_id
           WHERE publication.status = 'published'
           ORDER BY CASE WHEN entity.type = 'brand' THEN 0 ELSE 1 END, publication.entity_id`,
  });
  return rows.rows
    .map((row) => String(row.entity_id))
    .filter((entityId) => ![PHASE63_JINHAO_BRAND_ID, PHASE90_JINHAO_82_ID, PHASE90_JINHAO_9019_ID].includes(entityId));
}

async function republishPreservedEntities(c: Client, entityIds: string[], reviewer: string): Promise<void> {
  for (const entityId of entityIds) {
    const state = await c.execute({
      sql: `SELECT publication.status, publication.approved_content_hash,
                   publication.reviewed_content_revision, publication.content_revision,
                   publication.reviewed_contract_version, readiness.publishable,
                   readiness.blocker_count, readiness.blockers_json,
                   CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
              FROM entity_publications publication
              LEFT JOIN public_entity_readiness readiness
                ON readiness.entity_id = publication.entity_id AND readiness.contract_version = 3
              LEFT JOIN public_entities public ON public.id = publication.entity_id
             WHERE publication.entity_id = ?`,
      args: [entityId],
    });
    const row = state.rows[0];
    const reviewOnlyBlockers = new Set([
      "stale_reviewed_revision",
      "missing_fact_review",
      "missing_language_review",
      "missing_media_review",
      "missing_publication_review",
    ]);
    const blockers = row
      ? (JSON.parse(String(row.blockers_json ?? "[]")) as string[])
      : [];
    if (!row || blockers.some((blocker) => !reviewOnlyBlockers.has(blocker))) {
      throw new Error(`Phase 90 preserved public entity became unpublishable: ${entityId}`);
    }
    // A pristine published row cannot have changed content without a revision
    // bump; avoid rebuilding its full publication hash during the preservation scan.
    if (
      String(row.status) === "published" &&
      String(row.approved_content_hash ?? "").length > 0 &&
      Number(row.reviewed_content_revision) === Number(row.content_revision) &&
      Number(row.reviewed_contract_version) === 3 &&
      Number(row.is_public) === 1 &&
      blockers.length === 0
    ) continue;
    const currentHash = await computePublicationContentHash(c, entityId);
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(c, {
        entityId,
        reviewKind,
        reviewer,
        status: "approved",
        notes: "Phase 90 re-approves unchanged public content after Jinhao source and identity cleanup invalidation.",
      });
    }
    await publishEntity(c, { entityId, reviewer });
  }
}

export async function applyPhase90JinhaoContent(c:Client,o:ApplyPhase90Options):Promise<ApplyPhase90Result>{await owned(c,o);const preservedPublicEntities=await capturePublicEntities(c);await topology(c);const r=await applyCuratedContentPacks(c,o,structuredClone(phase90JinhaoPacks()));await republishPreservedEntities(c,preservedPublicEntities,o.reviewer);assertCatalogSnapshotUnchanged(o.protectedCatalogSnapshot);return r;}
const val=(n:string)=>{const i=process.argv.indexOf(n);return i<0?null:process.argv[i+1]??null};
async function main(){const database=val("--database"),ownedRoot=val("--owned-root"),protectedCatalog=val("--protected-catalog");if(!database||!ownedRoot||!protectedCatalog)throw new Error("Usage: tsx scripts/apply-phase90-jinhao-82-9019-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>");const {createClient}=await import("@libsql/client");const c=createClient({url:`file:${path.resolve(database)}`});try{console.log(JSON.stringify(await applyPhase90JinhaoContent(c,{workspaceRoot:process.cwd(),reviewer:val("--reviewer")??"phase90-jinhao",databasePath:path.resolve(database),ownedRoot:path.resolve(ownedRoot),protectedCatalogPath:path.resolve(protectedCatalog),protectedCatalogSnapshot:snapshotCatalogFiles(path.resolve(protectedCatalog)),env:{...process.env,TURSO_DATABASE_URL:"",TURSO_AUTH_TOKEN:"",FPKG_DATABASE_URL:""}}),null,2))}finally{c.close()}}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)void main().catch(e=>{console.error(e instanceof Error?e.message:String(e));process.exitCode=1});
