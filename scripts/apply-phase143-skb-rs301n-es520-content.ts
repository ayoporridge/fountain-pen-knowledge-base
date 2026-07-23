import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, type Transaction, createClient } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE143_BRAND_ID, PHASE143_IDS, PHASE143_LEGACY_ID, PHASE143_SLUGS, phase143Packs } from "./data/phase143-skb-rs301n-es520-batch";

export type ApplyPhase143Options = ApplyPhase22Options;
export type ApplyPhase143Result = ApplyPhase22Result;
function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(options: ApplyPhase143Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 143 refuses inherited remote database selection: ${key}.`); }
async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }
async function assertAuthority(client: Client, options: ApplyPhase143Options): Promise<void> {
  assertNoRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!inside(database, ownedRoot) || fs.lstatSync(options.databasePath).isSymbolicLink()) throw new Error("Phase 143 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true }); if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 143 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 143 client is not bound to owned copy.");
}
async function preflight(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [PHASE143_BRAND_ID]); if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== PHASE143_SLUGS.brand) throw new Error("Phase 143 SKB brand identity mismatch.");
  const legacy = await rows(client, "SELECT type,slug,name FROM entities WHERE id=?", [PHASE143_LEGACY_ID]); if (legacy.length !== 1 || legacy[0]?.type !== "pen" || legacy[0]?.slug !== PHASE143_SLUGS.legacy || legacy[0]?.name !== "SKB派顿 F10 / F21") throw new Error("Phase 143 mixed SKB/Penton identity changed before retirement.");
  for (const pack of packs.filter((candidate) => candidate.expectedType === "pen")) {
    const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [pack.entityId, pack.expectedSlug]);
    if (existing.length === 0) continue;
    const row = existing[0];
    if (existing.length !== 1 || row?.id !== pack.entityId || row.type !== pack.expectedType || row.slug !== pack.expectedSlug || row.name !== pack.canonicalName) {
      throw new Error(`Phase 143 new SKU identity collision: ${JSON.stringify(existing)}`);
    }
  }
}
async function retireMixedLegacy(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const batchId = stableId("phase143-batch", "skb-penton-mixed-retire"); const actionId = stableId("phase143-action", "skb-penton-mixed-retire");
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)", args: [batchId, "phase143-skb-penton-mixed-retire", createHash("sha256").update("phase143-skb-penton-mixed-retire").digest("hex"), "Retire identity-unresolved SKB/Penton F10/F21 mixed page; it is not a Taiwan SKB model."] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'retire',?,?,?,?,?)", args: [actionId, batchId, "phase143-skb-penton-mixed-retire", createHash("sha256").update(`${PHASE143_LEGACY_ID}:retire`).digest("hex"), PHASE143_LEGACY_ID, PHASE143_BRAND_ID, "applied", "Identity unresolved; do not redirect to Taiwan SKB or an unverified Penton brand."] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? OR target_id=?", args: [PHASE143_LEGACY_ID, PHASE143_LEGACY_ID] });
    await tx.execute({ sql: "UPDATE entity_publications SET status='retired',blockers_json=?,approved_content_hash=NULL,reviewed_content_revision=NULL,reviewed_contract_version=NULL,reviewed_by=NULL,reviewed_at=NULL,published_at=NULL,review_notes=?,updated_at=datetime('now') WHERE entity_id=? AND status<>'retired'", args: ['["identity_unresolved"]', "SKB/Penton F10/F21 mixed identity retired; no redirect to Taiwan SKB.", PHASE143_LEGACY_ID] });
    const redirect = await tx.execute({ sql: "SELECT redirect_kind,target_path FROM entity_redirects WHERE source_path=?", args: [`/pen/${PHASE143_SLUGS.legacy}`] });
    if (redirect.rows.length === 0) await tx.execute({ sql: "INSERT INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,?,NULL,'hard_404',?)", args: [stableId("phase143-redirect", PHASE143_SLUGS.legacy), batchId, actionId, `/pen/${PHASE143_SLUGS.legacy}`, "identity_unresolved; not a Taiwan SKB model"] });
    else if (String(redirect.rows[0]?.redirect_kind) !== "hard_404" || redirect.rows[0]?.target_path != null) throw new Error("Phase 143 conflicting legacy redirect.");
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
async function prepareTopology(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const tx = await client.transaction("write");
  try {
    for (const pack of packs.filter((candidate) => candidate.expectedType === "pen")) {
      await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [pack.entityId, pack.expectedSlug, pack.canonicalName] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [stableId("phase143-made-by", `${pack.entityId}:${PHASE143_BRAND_ID}`), pack.entityId, PHASE143_BRAND_ID, "Phase 143 verified Taiwan SKB maker relation"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [stableId("phase143-reverse", `${PHASE143_BRAND_ID}:${pack.entityId}`), PHASE143_BRAND_ID, pack.entityId, "Phase 143 public SKB model navigation"] });
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase143SkbRs301nEs520Content(client: Client, options: ApplyPhase143Options): Promise<ApplyPhase143Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 143 reviewer must not be empty.");
  await assertAuthority(client, options); const workspaceRoot = fs.realpathSync.native(options.workspaceRoot); const packs = phase143Packs.map((pack) => loadCuratedEntityPack(workspaceRoot, pack)); await preflight(client, packs); await retireMixedLegacy(client); await prepareTopology(client, packs);
  const result = await applyCuratedContentPacks(client, options, packs); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> { const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase143-skb-rs301n-es520-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]"); const client = createClient({ url: `file:${path.resolve(database)}` }); try { const result = await applyPhase143SkbRs301nEs520Content(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase143-skb", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); } }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
