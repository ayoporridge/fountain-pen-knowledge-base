import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type Transaction } from "@libsql/client";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";

export const PHASE616_REVIEWER = "phase616-parker-vector-xl-reader-rewrite";

export const PHASE616_TARGET = {
  entityId: "P7LgZR6-DDPi",
  slug: "parker-vector-xl-fountain-pen",
  name: "Parker Vector XL",
  storyId: "curated-story-97b95ce7ec0256c7a429c051",
  markdownFile: ".planning/content-research/parker-vector-xl-publishable-content-2026-07-19.md",
  storyTitle: "Parker Vector XL：2159746 与经典 Vector 怎么分",
} as const;

export interface ApplyPhase616Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase616Result {
  entityId: string;
  slug: string;
  outcome: "published" | "noop";
  contentHash: string;
  changed: boolean;
}

interface ReviewedCopy {
  summary: string;
  bodyMd: string;
}

interface TargetState extends ReviewedCopy {
  entityBodyMd: string;
  entitySource: string;
  storyBodyMd: string;
  storyTitle: string;
  storySummary: string;
  storySourceNotes: string;
  relationFingerprint: string;
  contentRevision: number;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 616 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(
  db: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await db.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

function readReviewedCopy(workspaceRoot: string): ReviewedCopy {
  const root = path.resolve(workspaceRoot);
  const file = path.resolve(root, PHASE616_TARGET.markdownFile);
  if (!inside(file, root)) throw new Error("Phase 616 reviewed copy escapes the workspace.");
  const markdown = fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
  const summaryMatch = /^## summary\s*\n([\s\S]*?)(?=^## model_specs\s*$)/m.exec(markdown);
  const bodyMatch = /^## body_md\s*\n([\s\S]*?)(?=^## 来源\s*$)/m.exec(markdown);
  if (!summaryMatch?.[1] || !bodyMatch?.[1]) {
    throw new Error("Phase 616 reviewed copy must contain summary, model_specs, body_md and 来源.");
  }
  const summary = summaryMatch[1].trim();
  const bodyMd = bodyMatch[1].trim();
  const summaryLength = Array.from(summary).length;
  if (summaryLength < 60 || summaryLength > 180) {
    throw new Error(`Phase 616 summary length is invalid: ${summaryLength}.`);
  }
  if (Array.from(bodyMd).length < 2_800) {
    throw new Error("Phase 616 reader copy is shorter than 2,800 Unicode characters.");
  }
  if (/当前页面|当前档案|资料不足|研究队列|型号档案记录了|现有来源包括/.test(bodyMd)) {
    throw new Error("Phase 616 reader copy still contains a disallowed template phrase.");
  }
  if (!/2159746[\s\S]*135 mm[\s\S]*157 mm[\s\S]*11\.5 mm[\s\S]*20 g/.test(bodyMd)) {
    throw new Error("Phase 616 reader copy is missing the scoped 2159746 measurements.");
  }
  if (!/converter compatible[\s\S]*需另购/.test(bodyMd)) {
    throw new Error("Phase 616 reader copy is missing the converter boundary.");
  }
  return { summary, bodyMd };
}

async function assertOwnedAuthority(client: Client, options: ApplyPhase616Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 616 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const databaseLstat = fs.lstatSync(options.databasePath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(database).isFile() ||
    databaseLstat.isSymbolicLink() ||
    !inside(database, ownedRoot)
  ) {
    throw new Error("Phase 616 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    owned.nlink !== BigInt(1) ||
    database === protectedPath ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 616 refuses the protected catalog or a hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 616 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 616 owned copy must be migrated through 032.");
}

async function relationFingerprint(client: Client): Promise<string> {
  const links = await rows(client, `SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id`, [PHASE616_TARGET.entityId, PHASE616_TARGET.entityId]);
  const references = await rows(client, `SELECT id,entity_id,source_item_id,relation_type,note,review_status FROM entity_references WHERE entity_id=? ORDER BY id`, [PHASE616_TARGET.entityId]);
  const media = await rows(client, `SELECT id,title,asset_type,image_url,thumbnail_url,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status FROM media_assets WHERE entity_id=? ORDER BY id`, [PHASE616_TARGET.entityId]);
  const specs = await rows(client, `SELECT id,brand_entity_id,series_name,release_year,origin_country,nib,fill_system,material,dimensions,weight,price_range,status,review_status FROM model_specs WHERE entity_id=? ORDER BY id`, [PHASE616_TARGET.entityId]);
  const variants = await rows(client, `SELECT id,variant_name,release_year,notes,source_item_id,review_status,variant_kind,parent_variant_id,product_code,market FROM model_variants WHERE model_entity_id=? ORDER BY id`, [PHASE616_TARGET.entityId]);
  return JSON.stringify({ links, references, media, specs, variants });
}

async function loadState(client: Client, workspaceRoot: string): Promise<TargetState> {
  const reviewed = readReviewedCopy(workspaceRoot);
  const entity = (await rows(client, `SELECT id,type,slug,name,body_md,source FROM entities WHERE id=?`, [PHASE616_TARGET.entityId]))[0];
  if (!entity || String(entity.type) !== "pen" || String(entity.slug) !== PHASE616_TARGET.slug || String(entity.name) !== PHASE616_TARGET.name) {
    throw new Error("Phase 616 Parker Vector XL identity mismatch.");
  }
  const story = (await rows(client, `SELECT id,title,summary,body_md,source_notes,status FROM stories WHERE id=? AND entity_id=? AND story_type='model_story'`, [PHASE616_TARGET.storyId, PHASE616_TARGET.entityId]))[0];
  if (!story || String(story.status) !== "published") throw new Error("Phase 616 expected one published Parker Vector XL model story.");
  const publication = (await rows(client, `SELECT status,content_revision FROM entity_publications WHERE entity_id=?`, [PHASE616_TARGET.entityId]))[0];
  if (!publication) throw new Error("Phase 616 publication row is missing.");
  return {
    ...reviewed,
    entityBodyMd: String(entity.body_md ?? ""),
    entitySource: String(entity.source ?? ""),
    storyBodyMd: String(story.body_md ?? ""),
    storyTitle: String(story.title ?? ""),
    storySummary: String(story.summary ?? ""),
    storySourceNotes: String(story.source_notes ?? ""),
    relationFingerprint: await relationFingerprint(client),
    contentRevision: Number(publication.content_revision),
  };
}

function sourceMarker(copy: ReviewedCopy): string {
  const digest = createHash("sha256").update(`${PHASE616_TARGET.entityId}\0${copy.summary}\0${copy.bodyMd}\0${PHASE616_TARGET.storyTitle}`).digest("hex");
  return `curated-content:phase616-parker-vector-xl-reader-rewrite:${digest}`;
}

async function updateCopy(client: Client, state: TargetState): Promise<boolean> {
  const marker = sourceMarker(state);
  const alreadyApplied = state.entityBodyMd === state.bodyMd && state.storyBodyMd === state.bodyMd && state.entitySource === marker && state.storyTitle === PHASE616_TARGET.storyTitle && state.storySummary === state.summary && state.storySourceNotes === marker;
  if (alreadyApplied) return false;
  if (state.entityBodyMd !== state.storyBodyMd) throw new Error("Phase 616 found an unexpected existing Parker Vector XL story state.");
  const transaction = await client.transaction("write");
  try {
    const entityUpdate = await transaction.execute({
      sql: `UPDATE entities SET summary=?,body_md=?,source=?,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=? AND body_md=?`,
      args: [state.summary, state.bodyMd, marker, PHASE616_TARGET.entityId, PHASE616_TARGET.slug, state.entityBodyMd],
    });
    if (entityUpdate.rowsAffected !== 1) throw new Error("Phase 616 entity changed concurrently.");
    const storyUpdate = await transaction.execute({
      sql: `UPDATE stories SET title=?,summary=?,body_md=?,source_notes=?,updated_at=datetime('now') WHERE id=? AND entity_id=? AND story_type='model_story' AND status='published' AND body_md=?`,
      args: [PHASE616_TARGET.storyTitle, state.summary, state.bodyMd, marker, PHASE616_TARGET.storyId, PHASE616_TARGET.entityId, state.storyBodyMd],
    });
    if (storyUpdate.rowsAffected !== 1) throw new Error("Phase 616 story changed concurrently.");
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  return true;
}

async function reviewAndPublish(client: Client, options: ApplyPhase616Options, changed: boolean): Promise<ApplyPhase616Result> {
  const contentHash = await computePublicationContentHash(client, PHASE616_TARGET.entityId);
  const publication = (await rows(client, `SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?`, [PHASE616_TARGET.entityId]))[0];
  const reviewRows = await rows(client, `SELECT review_kind FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media')`, [PHASE616_TARGET.entityId, contentHash]);
  const reviewedKinds = new Set(reviewRows.map((row) => String(row.review_kind)));
  const needsPublish = String(publication?.status) !== "published" || String(publication?.approved_content_hash ?? "") !== contentHash || ["fact", "language", "media"].some((kind) => !reviewedKinds.has(kind));
  if (!needsPublish) return { entityId: PHASE616_TARGET.entityId, slug: PHASE616_TARGET.slug, outcome: "noop", contentHash, changed };
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE616_TARGET.entityId,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      contentHash,
      notes: `Phase 616 ${reviewKind} review; Teal 2159746 facts surfaced from existing approved sources; links, references, specs, variants and media retained.`,
    });
  }
  const published = await publishEntity(client, { entityId: PHASE616_TARGET.entityId, reviewer: options.reviewer, contentHash });
  return { entityId: PHASE616_TARGET.entityId, slug: PHASE616_TARGET.slug, outcome: "published", contentHash: published.contentHash, changed };
}

async function verify(client: Client, state: TargetState, result: ApplyPhase616Result): Promise<void> {
  const row = (await rows(client, `SELECT entity.body_md,entity.source AS entity_source,story.body_md AS story_body,story.title AS story_title,story.summary AS story_summary,story.source_notes AS story_source_notes,publication.status,publication.content_revision,publication.reviewed_content_revision,publication.approved_content_hash,readiness.blocker_count,readiness.publishable,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN stories story ON story.id=? AND story.entity_id=entity.id AND story.story_type='model_story' AND story.status='published' JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3 LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?`, [PHASE616_TARGET.storyId, PHASE616_TARGET.entityId]))[0];
  const hash = await computePublicationContentHash(client, PHASE616_TARGET.entityId);
  const reviews = await rows(client, `SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind`, [PHASE616_TARGET.entityId, hash]);
  const duplicateBodies = await rows(client, `SELECT body_md,count(*) AS count FROM public_entities GROUP BY body_md HAVING count(*)>1`);
  const marker = sourceMarker(state);
  if (!row || String(row.body_md) !== state.bodyMd || String(row.story_body) !== state.bodyMd || String(row.entity_source) !== marker || String(row.story_title) !== PHASE616_TARGET.storyTitle || String(row.story_summary) !== state.summary || String(row.story_source_notes) !== marker || String(row.status) !== "published" || Number(row.content_revision) !== Number(row.reviewed_content_revision) || String(row.approved_content_hash) !== hash || Number(row.blocker_count) !== 0 || Number(row.publishable) !== 1 || Number(row.is_public) !== 1 || (await relationFingerprint(client)) !== state.relationFingerprint || duplicateBodies.length > 0 || JSON.stringify(reviews) !== JSON.stringify([{ review_kind: "fact", status: "approved" }, { review_kind: "language", status: "approved" }, { review_kind: "media", status: "approved" }, { review_kind: "publication", status: "approved" }])) {
    throw new Error("Phase 616 post-publication verification failed.");
  }
  if (result.contentHash !== hash) throw new Error("Phase 616 result hash does not match the final payload.");
}

export async function applyPhase616ParkerVectorXLReaderRewrite(client: Client, options: ApplyPhase616Options): Promise<ApplyPhase616Result> {
  await assertOwnedAuthority(client, options);
  const state = await loadState(client, options.workspaceRoot);
  const changed = await updateCopy(client, state);
  const result = await reviewAndPublish(client, options, changed);
  await verify(client, state, result);
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase616-parker-vector-xl-reader-rewrite.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase616ParkerVectorXLReaderRewrite(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? PHASE616_REVIEWER,
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

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
