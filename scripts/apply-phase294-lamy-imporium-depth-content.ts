import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE294_IMPORIUM_ID, PHASE294_IMPORIUM_SLUG, phase294LamyImporiumDepthPacks } from "./data/phase294-lamy-imporium-depth";

export type ApplyPhase294Options = ApplyPhase22Options;
export type ApplyPhase294Result = ApplyPhase22Result;

function ensureExistingIdentity(client: Client): Promise<void> {
  return client.execute({ sql: "SELECT type,slug,name FROM entities WHERE id=?", args: [PHASE294_IMPORIUM_ID] }).then((result) => {
    const row = result.rows[0];
    if (result.rows.length !== 1 || String(row?.type) !== "pen" || String(row?.slug) !== PHASE294_IMPORIUM_SLUG || String(row?.name) !== "LAMY imporium") {
      throw new Error(`Phase 294 refuses missing or mismatched existing LAMY imporium identity: ${JSON.stringify(result.rows)}`);
    }
  });
}

function assertWorkspacePair(workspaceRoot: string): void {
  const resolved = fs.realpathSync.native(workspaceRoot);
  if (!resolved.endsWith("/fountain-pen-graph")) throw new Error("Phase 294 requires the verified fountain-pen-graph workspace.");
}

export async function applyPhase294LamyImporiumDepthContent(client: Client, options: ApplyPhase294Options): Promise<ApplyPhase294Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 294 reviewer must not be empty.");
  assertWorkspacePair(options.workspaceRoot);
  await ensureExistingIdentity(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase294LamyImporiumDepthPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  const result = await applyCuratedContentPacks(client, options, packs);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase294-lamy-imporium-depth-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase294LamyImporiumDepthContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase294-lamy-imporium-depth",
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
