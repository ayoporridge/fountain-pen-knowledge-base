import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import type { ApplyPhase22Options } from "./apply-phase22-content";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";

export const PHASE237_SOURCE_KEY = "phase237-orphan-citation-cleanup";

export type Phase237CitationTarget = "claim" | "story";
export interface Phase237OrphanCitation {
  id: string;
  targetType: Phase237CitationTarget;
  targetId: string;
  sourceItemId: string;
}

export const PHASE237_ORPHAN_CITATIONS: readonly Phase237OrphanCitation[] = [
  { id: "cite-claim-wancher-dream-pen-ebonite-material-source-wancher-dream-pen-official", targetType: "claim", targetId: "claim-wancher-dream-pen-ebonite-material", sourceItemId: "source-wancher-dream-pen-official" },
  { id: "cite-claim-wancher-dream-pen-craft-context-source-wancher-dream-pen-official", targetType: "claim", targetId: "claim-wancher-dream-pen-craft-context", sourceItemId: "source-wancher-dream-pen-official" },
  { id: "cite-claim-montblanc-writers-edition-annual-source-montblanc-writers-edition-official", targetType: "claim", targetId: "claim-montblanc-writers-edition-annual", sourceItemId: "source-montblanc-writers-edition-official" },
  { id: "cite-claim-montblanc-writers-edition-homage-source-montblanc-writers-edition-official", targetType: "claim", targetId: "claim-montblanc-writers-edition-homage", sourceItemId: "source-montblanc-writers-edition-official" },
  { id: "cite-claim-montblanc-patron-888-limitation-source-montblanc-patron-of-art-official", targetType: "claim", targetId: "claim-montblanc-patron-888-limitation", sourceItemId: "source-montblanc-patron-of-art-official" },
  { id: "cite-claim-montblanc-patron-art-context-source-montblanc-patron-of-art-official", targetType: "claim", targetId: "claim-montblanc-patron-art-context", sourceItemId: "source-montblanc-patron-of-art-official" },
  { id: "cite-claim-sailor-1911-series-official-family-source-sailor-1911-series-official", targetType: "claim", targetId: "claim-sailor-1911-series-official-family", sourceItemId: "source-sailor-1911-series-official" },
  { id: "cite-claim-sailor-1911-profit-source-boundary-source-sailor-1911-series-official", targetType: "claim", targetId: "claim-sailor-1911-profit-source-boundary", sourceItemId: "source-sailor-1911-series-official" },
  { id: "cite-claim-hongdian-black-forest-pro-source-boundary-source-hongdian-black-forest-pro-public-search", targetType: "claim", targetId: "claim-hongdian-black-forest-pro-source-boundary", sourceItemId: "source-hongdian-black-forest-pro-public-search" },
  { id: "cite-story-model-platinum-izumo-research-source-platinum-izumo-public-search", targetType: "story", targetId: "story-model-platinum-izumo-research", sourceItemId: "source-platinum-izumo-public-search" },
  { id: "cite-story-model-platinum-fuji-shunkei-pnb13000-research-source-platinum-fuji-shunkei-pnb13000-public-search", targetType: "story", targetId: "story-model-platinum-fuji-shunkei-pnb13000-research", sourceItemId: "source-platinum-fuji-shunkei-pnb13000-public-search" },
  { id: "cite-story-model-platinum-preppy-pq200-research-source-platinum-preppy-pq200-public-search", targetType: "story", targetId: "story-model-platinum-preppy-pq200-research", sourceItemId: "source-platinum-preppy-pq200-public-search" },
  { id: "cite-story-model-platinum-president-research-source-platinum-president-public-search", targetType: "story", targetId: "story-model-platinum-president-research", sourceItemId: "source-platinum-president-public-search" },
  { id: "cite-story-model-platinum-makie-series-research-source-platinum-makie-series-public-search", targetType: "story", targetId: "story-model-platinum-makie-series-research", sourceItemId: "source-platinum-makie-series-public-search" },
  { id: "cite-story-model-pilot-88g-research-source-pilot-88g-public-search", targetType: "story", targetId: "story-model-pilot-88g-research", sourceItemId: "source-pilot-88g-public-search" },
  { id: "e468de49-0478-4937-947f-9f2169a9ae94", targetType: "story", targetId: "story-model-platinum-izumo-research", sourceItemId: "source-platinum-pen-usa-izumo-collection" },
  { id: "8d321e68-a4e6-45a5-b13d-1635e4fb3cc2", targetType: "story", targetId: "story-model-platinum-izumo-research", sourceItemId: "source-endlesspens-platinum-izumo-18k" },
  { id: "be6501a3-222b-4514-ac51-eda2821bac0d", targetType: "story", targetId: "story-model-platinum-president-research", sourceItemId: "source-commerce-pensachi-567ce8ec0fcec5" },
  { id: "85b24302-b4b2-4038-ac0f-6aee3f231753", targetType: "story", targetId: "story-model-platinum-preppy-pq200-research", sourceItemId: "source-product-awesomepens-24d9492bca29a9" },
  { id: "07f3e9d2-f0ee-429b-886d-c55a5cd5758b", targetType: "story", targetId: "story-model-platinum-makie-series-research", sourceItemId: "source-commerce-goldspot-a1e29d341d524a" },
  { id: "a1713e3d-8103-4087-b817-a1a7267c6c78", targetType: "story", targetId: "story-model-pilot-88g-research", sourceItemId: "source-commerce-ttpen-fb336290bb253b" },
];

export interface ApplyPhase237Options extends ApplyPhase22Options {}
export interface ApplyPhase237Result { removed: number; outcome: "cleaned" | "noop"; }

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 237 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase237Options): Promise<void> {
  assertNoRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 237 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 237 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 237 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 237 owned copy must be migrated through 032.");
}

async function orphanCitationRows(client: Client | Transaction): Promise<Record<string, unknown>[]> {
  const sql = `SELECT c.id,c.target_type,c.target_id,c.source_item_id
    FROM citations c
    LEFT JOIN source_items si ON si.id=c.source_item_id
    WHERE (c.source_item_id IS NOT NULL AND si.id IS NULL)
       OR (c.target_type='entity' AND NOT EXISTS (SELECT 1 FROM entities e WHERE e.id=c.target_id))
       OR (c.target_type='story' AND NOT EXISTS (SELECT 1 FROM stories s WHERE s.id=c.target_id))
       OR (c.target_type='timeline_event' AND NOT EXISTS (SELECT 1 FROM timeline_events t WHERE t.id=c.target_id))
       OR (c.target_type='diagram' AND NOT EXISTS (SELECT 1 FROM diagrams d WHERE d.id=c.target_id))
       OR (c.target_type='model_spec' AND NOT EXISTS (SELECT 1 FROM model_specs m WHERE m.id=c.target_id))
       OR (c.target_type='exhibit' AND NOT EXISTS (SELECT 1 FROM exhibits e WHERE e.id=c.target_id))
       OR (c.target_type='claim' AND NOT EXISTS (SELECT 1 FROM claims cl WHERE cl.id=c.target_id))
       OR (c.claim_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM claims cl WHERE cl.id=c.claim_id))`;
  return (await client.execute(sql)).rows.map((row) => ({ ...row }));
}

async function clean(tx: Transaction): Promise<ApplyPhase237Result> {
  const listed = await tx.execute({ sql: `SELECT id,target_type,target_id,source_item_id FROM citations WHERE id IN (${PHASE237_ORPHAN_CITATIONS.map(() => "?").join(",")})`, args: PHASE237_ORPHAN_CITATIONS.map((row) => row.id) });
  const expected = new Map(PHASE237_ORPHAN_CITATIONS.map((row) => [row.id, row]));
  for (const row of listed.rows) {
    const spec = expected.get(String(row.id));
    if (!spec || row.target_type !== spec.targetType || row.target_id !== spec.targetId || row.source_item_id !== spec.sourceItemId) throw new Error(`Phase 237 citation identity mismatch: ${JSON.stringify(row)}`);
    const target = await tx.execute({ sql: spec.targetType === "claim" ? "SELECT 1 FROM claims WHERE id=?" : "SELECT 1 FROM stories WHERE id=?", args: [spec.targetId] });
    if (target.rows.length !== 0) throw new Error(`Phase 237 refuses to delete an existing ${spec.targetType} target: ${spec.targetId}`);
  }
  const before = await orphanCitationRows(tx);
  for (const row of before) if (!expected.has(String(row.id))) throw new Error(`Phase 237 found an unlisted orphan citation: ${JSON.stringify(row)}`);
  if (before.length === 0) return { removed: 0, outcome: "noop" };
  await tx.execute({ sql: `DELETE FROM citations WHERE id IN (${PHASE237_ORPHAN_CITATIONS.map(() => "?").join(",")})`, args: PHASE237_ORPHAN_CITATIONS.map((row) => row.id) });
  const after = await orphanCitationRows(tx);
  if (after.length !== 0) throw new Error(`Phase 237 orphan citation cleanup incomplete: ${JSON.stringify(after)}`);
  return { removed: before.length, outcome: "cleaned" };
}

export async function applyPhase237OrphanCitationCleanup(client: Client, options: ApplyPhase237Options): Promise<ApplyPhase237Result> {
  await assertOwned(client, options);
  const tx = await client.transaction("write");
  try {
    const result = await clean(tx);
    await tx.commit();
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return result;
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase237-orphan-citation-cleanup.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    process.stdout.write(`${JSON.stringify(await applyPhase237OrphanCitationCleanup(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? PHASE237_SOURCE_KEY, databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`);
  } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
