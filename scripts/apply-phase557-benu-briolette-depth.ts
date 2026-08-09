import fs from "node:fs";
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
  PHASE557_BENU_ID,
  PHASE557_BRIOLETTE_ID,
  PHASE557_BRIOLETTE_SLUG,
  phase557BenuBrioletteDepthPacks,
} from "./data/phase557-benu-briolette-depth";

export type ApplyPhase557Options = ApplyPhase22Options;
export type ApplyPhase557Result = ApplyPhase22Result;

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}
function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 557 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwnedCatalog(client: Client, options: ApplyPhase557Options): Promise<void> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 557 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error("Phase 557 requires a non-symlink catalog inside the owned root.");
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (
    databasePath === protectedCatalog ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino) ||
    Number(owned.nlink) !== 1
  ) {
    throw new Error("Phase 557 refuses the protected catalog or a hard-link alias.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 557 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 557 owned copy must be migrated through 032.");
  }
}

async function assertIdentityPreflight(client: Client): Promise<void> {
  const rows = await client.execute({
    sql: "SELECT id,type,slug FROM entities WHERE id IN (?,?) OR slug=? ORDER BY id",
    args: [PHASE557_BENU_ID, PHASE557_BRIOLETTE_ID, PHASE557_BRIOLETTE_SLUG],
  });
  const brand = rows.rows.filter((row) => String(row.id) === PHASE557_BENU_ID);
  const pen = rows.rows.filter((row) => String(row.id) === PHASE557_BRIOLETTE_ID);
  if (
    brand.length !== 1 ||
    String(brand[0]?.type) !== "brand" ||
    String(brand[0]?.slug) !== "benu" ||
    pen.length !== 1 ||
    String(pen[0]?.type) !== "pen" ||
    String(pen[0]?.slug) !== PHASE557_BRIOLETTE_SLUG ||
    rows.rows.length !== 2
  ) {
    throw new Error("Phase 557 BENU Briolette identity preflight failed.");
  }
}

export async function applyPhase557BenuBrioletteDepth(
  client: Client,
  options: ApplyPhase557Options,
): Promise<ApplyPhase557Result> {
  await assertOwnedCatalog(client, options);
  await assertIdentityPreflight(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    structuredClone(phase557BenuBrioletteDepthPacks),
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
      "Usage: tsx scripts/apply-phase557-benu-briolette-depth.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtectedCatalog = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase557BenuBrioletteDepth(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase557-benu-briolette-depth",
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
