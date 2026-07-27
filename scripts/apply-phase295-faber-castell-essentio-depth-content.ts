import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE295_ESSENTIO_ID, PHASE295_ESSENTIO_SLUG, phase295FaberCastellEssentioDepthPacks } from "./data/phase295-faber-castell-essentio-depth";

export type ApplyPhase295Options = ApplyPhase22Options;
export type ApplyPhase295Result = ApplyPhase22Result;

async function ensureExistingIdentity(client: Client): Promise<void> {
  const result = await client.execute({ sql: "SELECT type,slug,name FROM entities WHERE id=?", args: [PHASE295_ESSENTIO_ID] });
  const row = result.rows[0];
  if (result.rows.length !== 1 || String(row?.type) !== "pen" || String(row?.slug) !== PHASE295_ESSENTIO_SLUG || String(row?.name) !== "Faber-Castell Essentio") throw new Error(`Phase 295 refuses missing or mismatched Essentio identity: ${JSON.stringify(result.rows)}`);
}

export async function applyPhase295FaberCastellEssentioDepthContent(client: Client, options: ApplyPhase295Options): Promise<ApplyPhase295Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 295 reviewer must not be empty.");
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  if (!workspaceRoot.endsWith("/fountain-pen-graph")) throw new Error("Phase 295 requires the verified fountain-pen-graph workspace.");
  await ensureExistingIdentity(client);
  const packs = phase295FaberCastellEssentioDepthPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  const result = await applyCuratedContentPacks(client, options, packs);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }

async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase295-faber-castell-essentio-depth-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { const result = await applyPhase295FaberCastellEssentioDepthContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase295-faber-castell-essentio-depth", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
