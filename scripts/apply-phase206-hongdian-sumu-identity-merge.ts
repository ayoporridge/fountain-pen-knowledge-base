import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import type { ApplyPhase22Options, ApplyPhase22Result } from "./apply-phase22-content";
import { publishEntity, recordEntityContentReview } from "../src/lib/publication";

export type ApplyPhase206Options = ApplyPhase22Options;
export type ApplyPhase206Result = ApplyPhase22Result;
const OLD_ID = "km3uuSerw-AL";
const OLD_SLUG = "弘典-hongdian-苏木";
const CANONICAL_ID = "1cA0oEMF7d1u";
const CANONICAL_SLUG = "弘典-hongdian-1866";
const BRAND_ID = "4yRpvovXFoWh";
const SOURCE_KEY = "phase206-hongdian-sumu-merge-into-1866";
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function noRemote(options: ApplyPhase206Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 206 refuses inherited remote database selection: ${key}.`); }
async function authority(client: Client, options: ApplyPhase206Options): Promise<void> { noRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath); if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 206 requires an owned, non-symlink catalog copy."); const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true }); if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 206 refuses the protected catalog or hard-link alias."); const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 206 client is not bound to the authorized owned copy."); const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 206 owned copy must be migrated through 032."); }
async function merge(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    const old = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [OLD_ID] });
    const canonical = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [CANONICAL_ID] });
    const brand = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [BRAND_ID] });
    if (old.rows.length !== 1 || String(old.rows[0]?.type) !== "pen" || String(old.rows[0]?.slug) !== OLD_SLUG) throw new Error("Phase 206 old HongDian Sumu identity mismatch.");
    if (canonical.rows.length !== 1 || String(canonical.rows[0]?.type) !== "pen" || String(canonical.rows[0]?.slug) !== CANONICAL_SLUG) throw new Error("Phase 206 canonical HongDian 1866 identity mismatch.");
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "hongdian") throw new Error("Phase 206 HongDian brand identity mismatch.");
    const batchId = stableId("phase206-batch", SOURCE_KEY);
    const actionId = stableId("phase206-action", SOURCE_KEY);
    const checksum = digest(`${SOURCE_KEY}\0${OLD_ID}\0${CANONICAL_ID}`);
    const note = "Merge the old HongDian Sumu research placeholder into the sourced canonical 1866 model; the name is retained as an alias, not a separate SKU.";
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)", args: [batchId, SOURCE_KEY, digest(SOURCE_KEY), note] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'merge',?,?,?,?,?)", args: [actionId, batchId, SOURCE_KEY, checksum, OLD_ID, CANONICAL_ID, "applied", note] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage(id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind,fallback_reason) VALUES(?,?,?, ?,?,'merge',?)", args: [stableId("phase206-lineage", SOURCE_KEY), batchId, actionId, OLD_ID, CANONICAL_ID, "canonical_model_identity"] });
    const provenance = await tx.execute({ sql: "SELECT source_id,source_item_id FROM entity_aliases WHERE entity_id=? AND review_status='approved' AND source_id IS NOT NULL AND source_item_id IS NOT NULL LIMIT 1", args: [CANONICAL_ID] });
    const sourceId = String(provenance.rows[0]?.source_id ?? "");
    const sourceItemId = String(provenance.rows[0]?.source_item_id ?? "");
    if (!sourceId || !sourceItemId) throw new Error("Phase 206 canonical 1866 has no approved alias provenance to reuse.");
    for (const [alias, language] of [["HongDian Sumu", "en"], ["Hong Dian Sumu", "en"], ["弘典 苏木", "zh"]] as const) {
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,source_item_id,review_status) VALUES(?,?,?,?,?,'alias',?,'approved')", args: [stableId("phase206-alias", `${language}:${alias}`), CANONICAL_ID, alias, language, sourceId, sourceItemId] });
    }
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=?", args: [OLD_ID] });
    await tx.execute({ sql: "UPDATE entity_publications SET status='retired', blockers_json=?, approved_content_hash=NULL, reviewed_content_revision=NULL, reviewed_contract_version=NULL, reviewed_by=NULL, reviewed_at=NULL, published_at=NULL, review_notes=?, updated_at=datetime('now') WHERE entity_id=? AND status<>'retired'", args: ['["taxonomy_merged"]', "HongDian Sumu is an old research placeholder merged into /pen/弘典-hongdian-1866.", OLD_ID] });
    const redirect = await tx.execute({ sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?", args: [`/pen/${OLD_SLUG}`] });
    const target = `/pen/${CANONICAL_SLUG}`;
    if (redirect.rows.length === 0) await tx.execute({ sql: "INSERT INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,?,?,'permanent',?)", args: [stableId("phase206-redirect", OLD_SLUG), batchId, actionId, `/pen/${OLD_SLUG}`, target, "duplicate_canonical_merge"] });
    else if (redirect.rows.length === 1 && String(redirect.rows[0]?.target_path ?? "") === target && String(redirect.rows[0]?.redirect_kind ?? "") === "permanent") await tx.execute({ sql: "UPDATE entity_redirects SET batch_id=?,action_id=?,fallback_reason=? WHERE source_path=?", args: [batchId, actionId, "duplicate_canonical_merge", `/pen/${OLD_SLUG}`] });
    else throw new Error("Phase 206 found a conflicting Sumu redirect.");
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase206HongdianSumuIdentityMerge(client: Client, options: ApplyPhase206Options): Promise<ApplyPhase206Result> {
  await authority(client, options);
  await merge(client);
  for (const entityId of [BRAND_ID, CANONICAL_ID]) {
    for (const reviewKind of ["fact", "language", "media"] as const) await recordEntityContentReview(client, { entityId, reviewKind, reviewer: options.reviewer, status: "approved", notes: `${SOURCE_KEY}; ${reviewKind} review after canonical identity merge.` });
    await publishEntity(client, { entityId, reviewer: options.reviewer });
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities: [{ entityId: OLD_ID, outcome: "noop", contentHash: "identity-merge-only" }, { entityId: CANONICAL_ID, outcome: "published", contentHash: "identity-merge-republished" }] };
}
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> { const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase206-hongdian-sumu-identity-merge.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]"); const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` }); try { const result = await applyPhase206HongdianSumuIdentityMerge(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase206-hongdian-sumu-identity-merge", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); } }
const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null; const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url)); if (invokedPath === modulePath) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
