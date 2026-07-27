import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { computePublicationContentHash, publishEntity, recordEntityContentReview } from "../src/lib/publication";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE58_FABER_BRAND_ID, PHASE58_CLASSIC_ID } from "./data/phase58-faber-castell";
import { PHASE307_GVFC_BRAND_ID, PHASE307_GVFC_BRAND_SLUG, PHASE307_GVFC_CLASSIC_ID, PHASE307_INTUITION_ID, PHASE307_INTUITION_SLUG, phase307GvfcIntuitionBrandSplitPacks } from "./data/phase307-gvfc-intuition-brand-split";

export type ApplyPhase307Options = ApplyPhase22Options;
export type ApplyPhase307Result = ApplyPhase22Result;
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(options: ApplyPhase307Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 307 refuses inherited remote database selection: ${key}.`); }
async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }
async function authority(client: Client, options: ApplyPhase307Options): Promise<void> {
  assertNoRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 307 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true }); if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 307 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 307 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 307 owned copy must be migrated through 032.");
}
async function identity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const oldBrand = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [PHASE58_FABER_BRAND_ID]); if (oldBrand.length !== 1 || oldBrand[0]?.type !== "brand" || oldBrand[0]?.slug !== "faber-castell") throw new Error(`Phase 307 ordinary Faber-Castell identity mismatch: ${JSON.stringify(oldBrand)}`);
  const newBrand = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE307_GVFC_BRAND_ID, PHASE307_GVFC_BRAND_SLUG]); if (newBrand.length > 1 || (newBrand.length === 1 && (newBrand[0]?.id !== PHASE307_GVFC_BRAND_ID || newBrand[0]?.type !== "brand" || newBrand[0]?.slug !== PHASE307_GVFC_BRAND_SLUG || newBrand[0]?.name !== "Graf von Faber-Castell"))) throw new Error(`Phase 307 GvFC brand identity collision: ${JSON.stringify(newBrand)}`);
  const classic = packs.find((pack) => pack.entityId === PHASE307_GVFC_CLASSIC_ID); if (!classic) throw new Error("Phase 307 Classic pack missing.");
  const classicRow = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [PHASE307_GVFC_CLASSIC_ID]); if (classicRow.length !== 1 || classicRow[0]?.type !== classic.expectedType || classicRow[0]?.slug !== classic.expectedSlug || classicRow[0]?.name !== classic.canonicalName) throw new Error(`Phase 307 Classic identity mismatch: ${JSON.stringify(classicRow)}`);
  const intuition = packs.find((pack) => pack.entityId === PHASE307_INTUITION_ID); if (!intuition) throw new Error("Phase 307 Intuition pack missing.");
  const intuitionRow = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE307_INTUITION_ID, PHASE307_INTUITION_SLUG]); if (intuitionRow.length > 0 && (intuitionRow.length !== 1 || intuitionRow[0]?.id !== PHASE307_INTUITION_ID || intuitionRow[0]?.type !== intuition.expectedType || intuitionRow[0]?.slug !== intuition.expectedSlug || intuitionRow[0]?.name !== intuition.canonicalName)) throw new Error(`Phase 307 Intuition identity collision: ${JSON.stringify(intuitionRow)}`);
}
async function topology(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'brand', ?, ?)", args: [PHASE307_GVFC_BRAND_ID, PHASE307_GVFC_BRAND_SLUG, "Graf von Faber-Castell"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [PHASE307_INTUITION_ID, PHASE307_INTUITION_SLUG, "Graf von Faber-Castell Intuition"] });
    const classicLinks = await tx.execute({ sql: "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? AND target_id=?) OR (source_id=? AND target_id=?)", args: [PHASE307_GVFC_CLASSIC_ID, PHASE307_GVFC_BRAND_ID, PHASE307_GVFC_BRAND_ID, PHASE307_GVFC_CLASSIC_ID] });
    const classicReady = classicLinks.rows.length === 2 && classicLinks.rows.some((row) => String(row.source_id) === PHASE307_GVFC_CLASSIC_ID && String(row.target_id) === PHASE307_GVFC_BRAND_ID && String(row.link_type) === "made_by") && classicLinks.rows.some((row) => String(row.source_id) === PHASE307_GVFC_BRAND_ID && String(row.target_id) === PHASE307_GVFC_CLASSIC_ID && String(row.link_type) === "reverse");
    if (!classicReady) {
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type IN ('made_by','reverse')", args: [PHASE307_GVFC_CLASSIC_ID] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type IN ('made_by','reverse')", args: [PHASE58_FABER_BRAND_ID, PHASE307_GVFC_CLASSIC_ID] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type IN ('made_by','reverse')", args: [PHASE307_GVFC_BRAND_ID, PHASE307_GVFC_CLASSIC_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: ["phase307-made-by-gvfc-classic", PHASE307_GVFC_CLASSIC_ID, PHASE307_GVFC_BRAND_ID, "Phase 307 reclassified Graf von Faber-Castell Classic into the independent GvFC brand"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: ["phase307-reverse-gvfc-classic", PHASE307_GVFC_BRAND_ID, PHASE307_GVFC_CLASSIC_ID, "Phase 307 GvFC brand navigation to Classic"] });
    }
    const intuitionLinks = await tx.execute({ sql: "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? AND target_id=?) OR (source_id=? AND target_id=?)", args: [PHASE307_INTUITION_ID, PHASE307_GVFC_BRAND_ID, PHASE307_GVFC_BRAND_ID, PHASE307_INTUITION_ID] });
    const intuitionReady = intuitionLinks.rows.length === 2 && intuitionLinks.rows.some((row) => String(row.source_id) === PHASE307_INTUITION_ID && String(row.target_id) === PHASE307_GVFC_BRAND_ID && String(row.link_type) === "made_by") && intuitionLinks.rows.some((row) => String(row.source_id) === PHASE307_GVFC_BRAND_ID && String(row.target_id) === PHASE307_INTUITION_ID && String(row.link_type) === "reverse");
    if (!intuitionReady) {
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type IN ('made_by','reverse') AND target_id<>?", args: [PHASE307_INTUITION_ID, PHASE307_GVFC_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: ["phase307-made-by-gvfc-intuition", PHASE307_INTUITION_ID, PHASE307_GVFC_BRAND_ID, "Phase 307 verified Graf von Faber-Castell Intuition maker relation"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: ["phase307-reverse-gvfc-intuition", PHASE307_GVFC_BRAND_ID, PHASE307_INTUITION_ID, "Phase 307 GvFC brand navigation to Intuition"] });
    }
    const classicMaker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE307_GVFC_CLASSIC_ID] }); if (classicMaker.rows.length !== 1 || String(classicMaker.rows[0]?.target_id) !== PHASE307_GVFC_BRAND_ID) throw new Error("Phase 307 Classic maker topology is ambiguous.");
    const intuitionMaker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE307_INTUITION_ID] }); if (intuitionMaker.rows.length !== 1 || String(intuitionMaker.rows[0]?.target_id) !== PHASE307_GVFC_BRAND_ID) throw new Error("Phase 307 Intuition maker topology is ambiguous.");
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
async function refreshOrdinaryFaberBrand(client: Client, reviewer: string): Promise<void> {
  const contentHash = await computePublicationContentHash(client, PHASE58_FABER_BRAND_ID);
  const current = await rows(client, "SELECT publication.status, publication.approved_content_hash, readiness.blocker_count FROM entity_publications publication JOIN public_entity_readiness readiness ON readiness.entity_id=publication.entity_id AND readiness.contract_version=3 WHERE publication.entity_id=?", [PHASE58_FABER_BRAND_ID]);
  if (current.length === 1 && String(current[0]?.status) === "published" && String(current[0]?.approved_content_hash) === contentHash && Number(current[0]?.blocker_count) === 0) return;
  for (const reviewKind of ["fact", "language", "media"] as const) await recordEntityContentReview(client, { entityId: PHASE58_FABER_BRAND_ID, reviewKind, reviewer, status: "approved", notes: `Phase 307 relation reclassification; ${reviewKind} review of the unchanged ordinary Faber-Castell brand copy.` });
  await publishEntity(client, { entityId: PHASE58_FABER_BRAND_ID, reviewer, contentHash });
}
export async function applyPhase307GvfcIntuitionBrandSplitContent(client: Client, options: ApplyPhase307Options): Promise<ApplyPhase307Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 307 reviewer must not be empty."); await authority(client, options); const workspaceRoot = fs.realpathSync.native(options.workspaceRoot); const rawPacks = phase307GvfcIntuitionBrandSplitPacks; const packs = rawPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack)); await identity(client, packs); await topology(client); const result = await applyCuratedContentPacks(client, options, rawPacks); await refreshOrdinaryFaberBrand(client, options.reviewer); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase307-gvfc-intuition-brand-split-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { const result = await applyPhase307GvfcIntuitionBrandSplitContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase307-gvfc-intuition-brand-split", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
