import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { computePublicationContentHash, publishEntity, recordEntityContentReview } from "../src/lib/publication";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import {
  PHASE292_METROPOLITAN_ID,
  PHASE292_METROPOLITAN_SLUG,
  PHASE292_PILOT_BRAND_ID,
  phase292PilotMetropolitanPacks,
} from "./data/phase292-pilot-metropolitan";

export type ApplyPhase292Options = ApplyPhase22Options;
export type ApplyPhase292Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 292 refuses inherited remote database selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase292Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) {
    throw new Error("Phase 292 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || Number(own.nlink) !== 1 || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 292 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 292 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 292 owned copy must be migrated through 032.");
}

async function ensureIdentity(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT id,type,slug FROM entities WHERE id=?", args: [PHASE292_PILOT_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "pilot") throw new Error("Phase 292 Pilot brand identity mismatch.");
    const collisions = await tx.execute({ sql: "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id", args: [PHASE292_METROPOLITAN_ID, PHASE292_METROPOLITAN_SLUG] });
    if (collisions.rows.length === 0) {
      await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [PHASE292_METROPOLITAN_ID, PHASE292_METROPOLITAN_SLUG, "Pilot MR Metropolitan"] });
    } else if (collisions.rows.length !== 1 || String(collisions.rows[0]?.id) !== PHASE292_METROPOLITAN_ID || String(collisions.rows[0]?.type) !== "pen" || String(collisions.rows[0]?.slug) !== PHASE292_METROPOLITAN_SLUG || String(collisions.rows[0]?.name) !== "Pilot MR Metropolitan") {
      throw new Error(`Phase 292 Metropolitan identity collision: ${JSON.stringify(collisions.rows)}`);
    }
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE292_METROPOLITAN_ID, PHASE292_PILOT_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?, ?, ?, 'made_by', ?)", args: [`phase292-made-by-${PHASE292_METROPOLITAN_ID}`, PHASE292_METROPOLITAN_ID, PHASE292_PILOT_BRAND_ID, "Phase 292 exact Pilot MR Metropolitan maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?, ?, ?, 'reverse', ?)", args: [`phase292-reverse-${PHASE292_METROPOLITAN_ID}`, PHASE292_PILOT_BRAND_ID, PHASE292_METROPOLITAN_ID, "Phase 292 Pilot brand-to-model navigation"] });
    const makers = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE292_METROPOLITAN_ID] });
    if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== PHASE292_PILOT_BRAND_ID) throw new Error(`Phase 292 maker topology remains ambiguous: ${JSON.stringify(makers.rows)}`);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function republishPilotBrand(client: Client, reviewer: string): Promise<void> {
  const current = await client.execute({
    sql: "SELECT publication.status, readiness.publishable, readiness.blocker_count, CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entity_publications publication LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=publication.entity_id AND readiness.contract_version=3 LEFT JOIN public_entities public ON public.id=publication.entity_id WHERE publication.entity_id=?",
    args: [PHASE292_PILOT_BRAND_ID],
  });
  if (current.rows.length !== 1) throw new Error("Phase 292 Pilot brand publication state is missing.");
  const row = current.rows[0];
  if (String(row?.status) === "published" && Number(row?.publishable) === 1 && Number(row?.blocker_count) === 0 && Number(row?.is_public) === 1) return;
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, { entityId: PHASE292_PILOT_BRAND_ID, reviewKind, reviewer, status: "approved", notes: "Phase 292 re-approves the unchanged Pilot brand page after adding the exact Metropolitan model relation." });
  }
  await publishEntity(client, { entityId: PHASE292_PILOT_BRAND_ID, reviewer });
}

async function replay(client: Client, pack: ReturnType<typeof loadCuratedEntityPack>): Promise<ApplyPhase292Result | null> {
  const row = await client.execute({ sql: "SELECT entity.source, publication.status, publication.approved_content_hash, publication.content_revision, publication.reviewed_content_revision, publication.reviewed_contract_version FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id WHERE entity.id=?", args: [pack.entityId] });
  const current = row.rows[0];
  if (!current || String(current.source ?? "") !== pack.sourceMarker || String(current.status) !== "published" || String(current.approved_content_hash ?? "") === "" || Number(current.reviewed_content_revision) !== Number(current.content_revision) || Number(current.reviewed_contract_version) !== 3) return null;
  return { entities: [{ entityId: pack.entityId, outcome: "noop", contentHash: String(current.approved_content_hash) }] };
}

export async function applyPhase292PilotMetropolitanContent(client: Client, options: ApplyPhase292Options): Promise<ApplyPhase292Result> {
  await assertOwned(client, options);
  await ensureIdentity(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase292PilotMetropolitanPacks.map((item) => loadCuratedEntityPack(workspaceRoot, item));
  const pack = packs.find((item) => item.entityId === PHASE292_METROPOLITAN_ID);
  if (!pack) throw new Error("Phase 292 Metropolitan pack is missing.");
  const replayResult = await replay(client, pack);
  if (replayResult) {
    await republishPilotBrand(client, options.reviewer.trim());
    return replayResult;
  }
  const result = await applyCuratedContentPacks(client, options, packs);
  await republishPilotBrand(client, options.reviewer.trim());
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase292-pilot-metropolitan-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase292PilotMetropolitanContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase292-pilot-metropolitan",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
}
