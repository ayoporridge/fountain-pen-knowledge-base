import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { phase547KawecoLiliputDepthPacks } from "./data/phase547-kaweco-liliput-depth";

export type ApplyPhase547Options = ApplyPhase22Options;
export type ApplyPhase547Result = ApplyPhase22Result;

export async function applyPhase547KawecoLiliputDepthContent(
  client: Client,
  options: ApplyPhase547Options,
): Promise<ApplyPhase547Result> {
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase547KawecoLiliputDepthPacks,
  );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase547-kaweco-liliput-depth.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtectedCatalog = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase547KawecoLiliputDepthContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase547-kaweco-liliput-depth",
      databasePath: resolvedDatabase,
      ownedRoot: resolvedOwnedRoot,
      protectedCatalogPath: resolvedProtectedCatalog,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtectedCatalog),
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
