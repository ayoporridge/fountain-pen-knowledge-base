import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE42_PLATINUM_BRAND_ID } from "./data/phase42-lamy-platinum";
import { PHASE296_TRAVIA_ID, PHASE296_TRAVIA_NAME, PHASE296_TRAVIA_SLUG, phase296Platinum3776TraviaPacks } from "./data/phase296-platinum-3776-travia";

export type ApplyPhase296Options = ApplyPhase22Options;
export type ApplyPhase296Result = ApplyPhase22Result;

function digest(value: string): string {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `phase296-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

async function ensureIdentityAndMaker(client: Client): Promise<void> {
  const brand = await client.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE42_PLATINUM_BRAND_ID] });
  if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "platinum") {
    throw new Error("Phase 296 Platinum brand identity mismatch.");
  }
  const existing = await client.execute({ sql: "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id", args: [PHASE296_TRAVIA_ID, PHASE296_TRAVIA_SLUG] });
  if (existing.rows.length === 0) {
    const tx = await client.transaction("write");
    try {
      await tx.execute({ sql: "INSERT INTO entities (id,type,slug,name) VALUES (?, 'pen', ?, ?)", args: [PHASE296_TRAVIA_ID, PHASE296_TRAVIA_SLUG, PHASE296_TRAVIA_NAME] });
      await tx.execute({ sql: "INSERT INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?, ?, ?, 'made_by', ?)", args: [digest(`${PHASE296_TRAVIA_ID}:made_by:${PHASE42_PLATINUM_BRAND_ID}`), PHASE296_TRAVIA_ID, PHASE42_PLATINUM_BRAND_ID, "Phase 296 canonical Platinum maker relationship"] });
      await tx.commit();
    } catch (error) {
      if (!tx.closed) await tx.rollback();
      throw error;
    }
    return;
  }
  if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== PHASE296_TRAVIA_ID || String(existing.rows[0]?.type) !== "pen" || String(existing.rows[0]?.slug) !== PHASE296_TRAVIA_SLUG || String(existing.rows[0]?.name) !== PHASE296_TRAVIA_NAME) {
    throw new Error(`Phase 296 Travia identity collision: ${JSON.stringify(existing.rows)}`);
  }
  const makers = await client.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE296_TRAVIA_ID] });
  if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== PHASE42_PLATINUM_BRAND_ID) throw new Error("Phase 296 Travia maker topology mismatch.");
}

export async function applyPhase296Platinum3776TraviaContent(client: Client, options: ApplyPhase296Options): Promise<ApplyPhase296Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 296 reviewer must not be empty.");
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  if (!workspaceRoot.endsWith("/fountain-pen-graph")) throw new Error("Phase 296 requires the verified fountain-pen-graph workspace.");
  await ensureIdentityAndMaker(client);
  const result = await applyCuratedContentPacks(client, options, phase296Platinum3776TraviaPacks);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }

async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase296-platinum-3776-travia-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase296Platinum3776TraviaContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase296-platinum-3776-travia", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
