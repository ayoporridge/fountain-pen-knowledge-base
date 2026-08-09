import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
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
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";
import {
  PHASE559_ALUMINUM_CLASSIC_ID,
  PHASE559_ALUMINUM_CLASSIC_NAME,
  PHASE559_ALUMINUM_CLASSIC_SLUG,
  PHASE559_WANCHER_BRAND_ID,
  phase559WancherDreamPenAluminumClassicPacks,
} from "./data/phase559-wancher-dream-pen-aluminum-classic";

export type ApplyPhase559Options = ApplyPhase22Options;
export type ApplyPhase559Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 559 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase559Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 559 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, ownedRoot)
  ) {
    throw new Error("Phase 559 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 559 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 559 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 559 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  if (
    packs.length !== 2 ||
    !packs.some((pack) => pack.entityId === PHASE559_WANCHER_BRAND_ID) ||
    !packs.some((pack) => pack.entityId === PHASE559_ALUMINUM_CLASSIC_ID)
  ) {
    throw new Error("Phase 559 Wancher packs are incomplete.");
  }
  const brand = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?",
    [PHASE559_WANCHER_BRAND_ID, "wancher"],
  );
  if (
    brand.length !== 1 ||
    brand[0]?.id !== PHASE559_WANCHER_BRAND_ID ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "wancher" ||
    brand[0]?.name !== "Wancher"
  ) {
    throw new Error(`Phase 559 Wancher brand identity mismatch: ${JSON.stringify(brand)}`);
  }
  const model = packs.find((pack) => pack.entityId === PHASE559_ALUMINUM_CLASSIC_ID);
  if (!model) throw new Error("Phase 559 Aluminum Classic pack is missing.");
  const existing = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
    [PHASE559_ALUMINUM_CLASSIC_ID, PHASE559_ALUMINUM_CLASSIC_SLUG],
  );
  if (
    existing.length > 1 ||
    (existing.length === 1 &&
      (existing[0]?.id !== PHASE559_ALUMINUM_CLASSIC_ID ||
        existing[0]?.type !== model.expectedType ||
        existing[0]?.slug !== model.expectedSlug ||
        existing[0]?.name !== model.canonicalName))
  ) {
    throw new Error(`Phase 559 Aluminum Classic identity collision: ${JSON.stringify(existing)}`);
  }
  const names = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE lower(name)=lower(?) AND id<>?",
    [PHASE559_ALUMINUM_CLASSIC_NAME, PHASE559_ALUMINUM_CLASSIC_ID],
  );
  if (names.length > 0) {
    throw new Error(`Phase 559 Aluminum Classic name collision: ${JSON.stringify(names)}`);
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const existing = await rows(
      tx,
      "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
      [PHASE559_ALUMINUM_CLASSIC_ID, PHASE559_ALUMINUM_CLASSIC_SLUG],
    );
    if (existing.length === 0) {
      await tx.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)",
        args: [PHASE559_ALUMINUM_CLASSIC_ID, PHASE559_ALUMINUM_CLASSIC_SLUG, PHASE559_ALUMINUM_CLASSIC_NAME],
      });
    } else if (
      existing.length !== 1 ||
      String(existing[0]?.id) !== PHASE559_ALUMINUM_CLASSIC_ID ||
      String(existing[0]?.type) !== "pen" ||
      String(existing[0]?.slug) !== PHASE559_ALUMINUM_CLASSIC_SLUG ||
      String(existing[0]?.name) !== PHASE559_ALUMINUM_CLASSIC_NAME
    ) {
      throw new Error("Phase 559 refuses a conflicting Aluminum Classic identity.");
    }

    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE559_ALUMINUM_CLASSIC_ID, PHASE559_WANCHER_BRAND_ID],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [
        "phase559-made-by-wancher-aluminum-classic",
        PHASE559_ALUMINUM_CLASSIC_ID,
        PHASE559_WANCHER_BRAND_ID,
        "Phase 559 verified Wancher Dream Pen Aluminum Classic maker relation",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        "phase559-reverse-wancher-aluminum-classic",
        PHASE559_WANCHER_BRAND_ID,
        PHASE559_ALUMINUM_CLASSIC_ID,
        "Phase 559 Wancher brand public model navigation",
      ],
    });
    const maker = await rows(
      tx,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [PHASE559_ALUMINUM_CLASSIC_ID],
    );
    if (maker.length !== 1 || maker[0]?.target_id !== PHASE559_WANCHER_BRAND_ID) {
      throw new Error("Phase 559 Aluminum Classic maker topology is ambiguous.");
    }
    const reverse = await rows(
      tx,
      "SELECT source_id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      [PHASE559_WANCHER_BRAND_ID, PHASE559_ALUMINUM_CLASSIC_ID],
    );
    if (reverse.length !== 1) {
      throw new Error("Phase 559 Aluminum Classic reverse navigation is ambiguous.");
    }
    const publication = await rows(
      tx,
      "SELECT status FROM entity_publications WHERE entity_id=?",
      [PHASE559_ALUMINUM_CLASSIC_ID],
    );
    if (
      publication.length !== 1 ||
      !["draft", "in_review", "published"].includes(String(publication[0]?.status))
    ) {
      throw new Error("Phase 559 expects a draft, in-review, or already-published publication row.");
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase559WancherDreamPenAluminumClassic(
  client: Client,
  options: ApplyPhase559Options,
): Promise<ApplyPhase559Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase559WancherDreamPenAluminumClassicPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  await assertIdentity(client, packs);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase559WancherDreamPenAluminumClassicPacks,
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
      "Usage: tsx scripts/apply-phase559-wancher-dream-pen-aluminum-classic.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase559WancherDreamPenAluminumClassic(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase559-wancher-aluminum-classic",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
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
