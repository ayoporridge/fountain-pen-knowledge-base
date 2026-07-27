import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { createClient, type Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE297_AHAB_ID, PHASE297_AHAB_SLUG, PHASE297_NOODLERS_BRAND_ID, phase297NoodlersAhabPacks } from "./data/phase297-noodlers-ahab";

export type ApplyPhase297Options = ApplyPhase22Options;
export type ApplyPhase297Result = ApplyPhase22Result;

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

async function ensureIdentity(client: Client): Promise<void> {
  const brand = await client.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE297_NOODLERS_BRAND_ID] });
  if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "noodlers") {
    throw new Error("Phase 297 Noodler's brand identity mismatch.");
  }
  const rows = await client.execute({ sql: "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id", args: [PHASE297_AHAB_ID, PHASE297_AHAB_SLUG] });
  if (rows.rows.length === 0) {
    const tx = await client.transaction("write");
    try {
      await tx.execute({ sql: "INSERT INTO entities (id,type,slug,name) VALUES (?, 'pen', ?, ?)", args: [PHASE297_AHAB_ID, PHASE297_AHAB_SLUG, "Noodler's Ahab"] });
      await tx.execute({ sql: "INSERT INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?, ?, ?, 'made_by', ?)", args: [`phase297-maker-${digest(PHASE297_AHAB_ID)}`, PHASE297_AHAB_ID, PHASE297_NOODLERS_BRAND_ID, "Phase 297 canonical Noodler's maker relationship"] });
      await tx.commit();
    } catch (error) {
      if (!tx.closed) await tx.rollback();
      throw error;
    }
    return;
  }
  if (rows.rows.length !== 1 || String(rows.rows[0]?.id) !== PHASE297_AHAB_ID || String(rows.rows[0]?.type) !== "pen" || String(rows.rows[0]?.slug) !== PHASE297_AHAB_SLUG || String(rows.rows[0]?.name) !== "Noodler's Ahab") {
    throw new Error(`Phase 297 Ahab identity collision: ${JSON.stringify(rows.rows)}`);
  }
  const maker = await client.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE297_AHAB_ID] });
  if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE297_NOODLERS_BRAND_ID) throw new Error("Phase 297 Ahab maker topology mismatch.");
}

export async function applyPhase297NoodlersAhabContent(client: Client, options: ApplyPhase297Options): Promise<ApplyPhase297Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 297 reviewer must not be empty.");
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 297 refuses inherited remote database selection: ${key}.`);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  if (!workspaceRoot.endsWith("/fountain-pen-graph")) throw new Error("Phase 297 requires the verified fountain-pen-graph workspace.");
  await ensureIdentity(client);
  const result = await applyCuratedContentPacks(client, options, phase297NoodlersAhabPacks);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }

async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase297-noodlers-ahab-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase297NoodlersAhabContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase297-noodlers-ahab", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
