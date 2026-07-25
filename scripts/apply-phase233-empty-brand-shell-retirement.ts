import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import type { ApplyPhase22Options } from "./apply-phase22-content";

type Target = { id: string; slug: string; name: string; sourceKey: string; note: string };

export const PHASE233_EMPTY_BRANDS: readonly Target[] = [
  {
    id: "S3JHYQtqJExx",
    slug: "banju",
    name: "半句 (BanJu)",
    sourceKey: "phase233-banju-empty-brand-shell-retirement",
    note: "BanJu 只有 deprecated research-gap story，没有 pen、nib 或有效型号关系；保留实体和历史引用，但不公开空品牌页。",
  },
  {
    id: "uppuHJzvuw5k",
    slug: "shanghai",
    name: "上海 (ShangHai)",
    sourceKey: "phase233-shanghai-empty-brand-shell-retirement",
    note: "ShangHai 没有 pen、nib、article 反向关系或可核实目录；保留实体和历史引用，但不公开空品牌页。",
  },
] as const;

export interface ApplyPhase233Options extends ApplyPhase22Options {}
export interface ApplyPhase233Result { entityId: string; slug: string; outcome: "retired" | "noop"; }

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 233 refuses inherited remote selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase233Options): Promise<void> {
  assertNoRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 233 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 233 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 233 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 233 owned copy must be migrated through 032.");
}

async function retireTarget(tx: Transaction, target: Target): Promise<ApplyPhase233Result> {
  const identity = await tx.execute({ sql: "SELECT type, slug, name FROM entities WHERE id = ?", args: [target.id] });
  if (identity.rows.length !== 1 || String(identity.rows[0]?.type) !== "brand" || String(identity.rows[0]?.slug) !== target.slug || String(identity.rows[0]?.name) !== target.name) throw new Error(`Phase 233 identity mismatch for ${target.slug}.`);
  const sourcePath = `/brand/${target.slug}`;
  const redirect = await tx.execute({ sql: "SELECT redirect_kind, target_path FROM entity_redirects WHERE source_path = ?", args: [sourcePath] });
  const action = await tx.execute({ sql: "SELECT id FROM taxonomy_actions WHERE source_row_key = ? AND action_kind = 'retire'", args: [target.sourceKey] });
  const publication = await tx.execute({ sql: "SELECT status FROM entity_publications WHERE entity_id = ?", args: [target.id] });
  const outgoing = await tx.execute({ sql: "SELECT count(*) AS value FROM entity_links l JOIN entities other ON other.id = CASE WHEN l.source_id = ? THEN l.target_id ELSE l.source_id END WHERE (l.source_id = ? OR l.target_id = ?) AND other.type NOT IN ('article')", args: [target.id, target.id, target.id] });
  const stories = await tx.execute({ sql: "SELECT count(*) AS value FROM stories WHERE entity_id = ? AND status = 'published'", args: [target.id] });
  if (Number(outgoing.rows[0]?.value ?? 0) !== 0 || Number(stories.rows[0]?.value ?? 0) !== 0) throw new Error(`Phase 233 refuses non-empty public topology for ${target.slug}.`);
  if (action.rows.length === 1 && redirect.rows.length === 1 && String(redirect.rows[0]?.redirect_kind) === "hard_404" && redirect.rows[0]?.target_path == null && String(publication.rows[0]?.status) === "retired") return { entityId: target.id, slug: target.slug, outcome: "noop" };
  const batchId = stableId("phase233-batch", target.sourceKey);
  const actionId = stableId("phase233-action", target.sourceKey);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, target.sourceKey, digest(target.sourceKey), target.note] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'retire', ?, ?, NULL, 'applied', ?)", args: [actionId, batchId, target.sourceKey, digest(`${target.sourceKey}\0${target.id}\0retire`), target.id, target.note] });
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? OR target_id = ?", args: [target.id, target.id] });
  await tx.execute({ sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ?", args: ['["taxonomy_identity_unresolved"]', target.note, target.id] });
  if (redirect.rows.length > 0 && (redirect.rows.length !== 1 || String(redirect.rows[0]?.redirect_kind) !== "hard_404" || redirect.rows[0]?.target_path != null)) throw new Error(`Phase 233 conflicting redirect for ${target.slug}.`);
  if (redirect.rows.length === 0) await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, NULL, 'hard_404', ?)", args: [stableId("phase233-redirect", sourcePath), batchId, actionId, sourcePath, "empty_brand_shell_retired; no verified model or brand topology"] });
  return { entityId: target.id, slug: target.slug, outcome: "retired" };
}

export async function applyPhase233EmptyBrandShellRetirement(client: Client, options: ApplyPhase233Options): Promise<ApplyPhase233Result[]> {
  await assertOwned(client, options);
  const tx = await client.transaction("write");
  try { const result = []; for (const target of PHASE233_EMPTY_BRANDS) result.push(await retireTarget(tx, target)); await tx.commit(); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result; }
  catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase233-empty-brand-shell-retirement.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase233EmptyBrandShellRetirement(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase233-empty-brand-shell-retirement", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
