import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";

export const PHASE278_BRAND_ID = "phase254-brand-st-dupont";
export const PHASE278_LINE_D_ID = "phase254-st-dupont-line-d-eternity";
export const PHASE278_D_INITIAL_ID = "phase273-st-dupont-initial";
export type ApplyPhase278Options = { databasePath: string; ownedRoot: string; protectedCatalogPath: string; protectedCatalogSnapshot: ReturnType<typeof snapshotCatalogFiles>; reviewer: string; env?: NodeJS.ProcessEnv };
export type ApplyPhase278Result = { outcome: "applied" | "noop"; reverseLinkId: string };

function stableId(value: string): string { return `phase278-reverse-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertAuthority(options: ApplyPhase278Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 278 refuses inherited remote database selection: ${key}.`);
  if (!options.reviewer.trim()) throw new Error("Phase 278 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 278 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || Number(own.nlink) !== 1 || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 278 refuses the protected catalog or hard-link alias.");
}

export async function applyPhase278StDupontReverseLink(client: Client, options: ApplyPhase278Options): Promise<ApplyPhase278Result> {
  assertAuthority(options);
  const tx: Transaction = await client.transaction("write");
  const linkId = stableId(`${PHASE278_BRAND_ID}:${PHASE278_LINE_D_ID}`);
  try {
    const entities = await tx.execute({ sql: "SELECT id,type,slug FROM entities WHERE id IN (?, ?, ?) ORDER BY id", args: [PHASE278_BRAND_ID, PHASE278_LINE_D_ID, PHASE278_D_INITIAL_ID] });
    const byId = new Map(entities.rows.map((row) => [String(row.id), row]));
    if (byId.get(PHASE278_BRAND_ID)?.type !== "brand" || byId.get(PHASE278_BRAND_ID)?.slug !== "st-dupont") throw new Error("Phase 278 S.T. Dupont brand identity mismatch.");
    for (const id of [PHASE278_LINE_D_ID, PHASE278_D_INITIAL_ID]) if (byId.get(id)?.type !== "pen") throw new Error(`Phase 278 model identity mismatch: ${id}`);
    const madeBy = await tx.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", args: [PHASE278_LINE_D_ID, PHASE278_BRAND_ID] });
    if (Number(madeBy.rows[0]?.value ?? 0) !== 1) throw new Error("Phase 278 Line D Eternity must retain exactly one made_by relation.");
    const existing = await tx.execute({ sql: "SELECT id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", args: [PHASE278_BRAND_ID, PHASE278_LINE_D_ID] });
    if (existing.rows.length === 1) { await tx.commit(); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return { outcome: "noop", reverseLinkId: String(existing.rows[0]?.id) }; }
    if (existing.rows.length > 1) throw new Error("Phase 278 found duplicate S.T. Dupont Line D reverse links.");
    await tx.execute({ sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [linkId, PHASE278_BRAND_ID, PHASE278_LINE_D_ID, "Phase 278 complete S.T. Dupont brand navigation"] });
    await tx.commit();
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { outcome: "applied", reverseLinkId: linkId };
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase278-st-dupont-reverse-link.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { const result = await applyPhase278StDupontReverseLink(client, { databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), reviewer: value("--reviewer") ?? "phase278-st-dupont", env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null; const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url)); if (invokedPath === modulePath) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
