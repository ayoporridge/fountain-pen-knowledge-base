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
import {
  phase551SchneiderRayCurrentDepthPacks,
} from "./data/phase551-schneider-ray-current-depth";

export type ApplyPhase551Options = ApplyPhase22Options;
export type ApplyPhase551Result = ApplyPhase22Result;

export async function applyPhase551SchneiderRayCurrentDepthContent(
  client: Client,
  options: ApplyPhase551Options,
): Promise<ApplyPhase551Result> {
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase551SchneiderRayCurrentDepthPacks,
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
      "Usage: tsx scripts/apply-phase551-schneider-ray-current-depth.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtectedCatalog = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase551SchneiderRayCurrentDepthContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase551-schneider-ray-current-depth",
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
