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
  PHASE560_ALUMINUM_CONTEMPORARY_ID,
  PHASE560_ALUMINUM_CONTEMPORARY_NAME,
  PHASE560_ALUMINUM_CONTEMPORARY_SLUG,
  PHASE560_WANCHER_BRAND_ID,
  phase560WancherDreamPenAluminumContemporaryPacks,
} from "./data/phase560-wancher-dream-pen-aluminum-contemporary";

export type ApplyPhase560Options = ApplyPhase22Options;
export type ApplyPhase560Result = ApplyPhase22Result;

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 560 refuses inherited remote database selection: ${key}.`);
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

async function assertIdentity(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  if (
    packs.length !== 2 ||
    !packs.some((pack) => pack.entityId === PHASE560_WANCHER_BRAND_ID) ||
    !packs.some((pack) => pack.entityId === PHASE560_ALUMINUM_CONTEMPORARY_ID)
  ) {
    throw new Error("Phase 560 Wancher packs are incomplete.");
  }
  const brand = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?",
    [PHASE560_WANCHER_BRAND_ID, "wancher"],
  );
  if (
    brand.length !== 1 ||
    brand[0]?.id !== PHASE560_WANCHER_BRAND_ID ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "wancher" ||
    brand[0]?.name !== "Wancher"
  ) {
    throw new Error(`Phase 560 Wancher brand identity mismatch: ${JSON.stringify(brand)}`);
  }
  const model = packs.find((pack) => pack.entityId === PHASE560_ALUMINUM_CONTEMPORARY_ID);
  if (!model) throw new Error("Phase 560 Aluminum Contemporary pack is missing.");
  const existing = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
    [PHASE560_ALUMINUM_CONTEMPORARY_ID, PHASE560_ALUMINUM_CONTEMPORARY_SLUG],
  );
  if (
    existing.length > 1 ||
    (existing.length === 1 &&
      (existing[0]?.id !== PHASE560_ALUMINUM_CONTEMPORARY_ID ||
        existing[0]?.type !== model.expectedType ||
        existing[0]?.slug !== model.expectedSlug ||
        existing[0]?.name !== model.canonicalName))
  ) {
    throw new Error(`Phase 560 Aluminum Contemporary identity collision: ${JSON.stringify(existing)}`);
  }
  const names = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE lower(name)=lower(?) AND id<>?",
    [PHASE560_ALUMINUM_CONTEMPORARY_NAME, PHASE560_ALUMINUM_CONTEMPORARY_ID],
  );
  if (names.length > 0) {
    throw new Error(`Phase 560 Aluminum Contemporary name collision: ${JSON.stringify(names)}`);
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const existing = await rows(
      tx,
      "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
      [PHASE560_ALUMINUM_CONTEMPORARY_ID, PHASE560_ALUMINUM_CONTEMPORARY_SLUG],
    );
    if (existing.length === 0) {
      await tx.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)",
        args: [
          PHASE560_ALUMINUM_CONTEMPORARY_ID,
          PHASE560_ALUMINUM_CONTEMPORARY_SLUG,
          PHASE560_ALUMINUM_CONTEMPORARY_NAME,
        ],
      });
    } else if (
      existing.length !== 1 ||
      String(existing[0]?.id) !== PHASE560_ALUMINUM_CONTEMPORARY_ID ||
      String(existing[0]?.type) !== "pen" ||
      String(existing[0]?.slug) !== PHASE560_ALUMINUM_CONTEMPORARY_SLUG ||
      String(existing[0]?.name) !== PHASE560_ALUMINUM_CONTEMPORARY_NAME
    ) {
      throw new Error("Phase 560 refuses a conflicting Aluminum Contemporary identity.");
    }
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE560_ALUMINUM_CONTEMPORARY_ID, PHASE560_WANCHER_BRAND_ID],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [
        "phase560-made-by-wancher-aluminum-contemporary",
        PHASE560_ALUMINUM_CONTEMPORARY_ID,
        PHASE560_WANCHER_BRAND_ID,
        "Phase 560 verified Wancher Dream Pen Aluminum Contemporary maker relation",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        "phase560-reverse-wancher-aluminum-contemporary",
        PHASE560_WANCHER_BRAND_ID,
        PHASE560_ALUMINUM_CONTEMPORARY_ID,
        "Phase 560 Wancher brand public model navigation",
      ],
    });
    const maker = await rows(
      tx,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [PHASE560_ALUMINUM_CONTEMPORARY_ID],
    );
    if (maker.length !== 1 || maker[0]?.target_id !== PHASE560_WANCHER_BRAND_ID) {
      throw new Error("Phase 560 Aluminum Contemporary maker topology is ambiguous.");
    }
    const reverse = await rows(
      tx,
      "SELECT source_id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      [PHASE560_WANCHER_BRAND_ID, PHASE560_ALUMINUM_CONTEMPORARY_ID],
    );
    if (reverse.length !== 1) {
      throw new Error("Phase 560 Aluminum Contemporary reverse navigation is ambiguous.");
    }
    const publication = await rows(
      tx,
      "SELECT status FROM entity_publications WHERE entity_id=?",
      [PHASE560_ALUMINUM_CONTEMPORARY_ID],
    );
    if (
      publication.length !== 1 ||
      !["draft", "in_review", "published"].includes(String(publication[0]?.status))
    ) {
      throw new Error("Phase 560 expects a draft, in-review, or already-published publication row.");
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase560WancherDreamPenAluminumContemporary(
  client: Client,
  options: ApplyPhase560Options,
): Promise<ApplyPhase560Result> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase560WancherDreamPenAluminumContemporaryPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  await assertIdentity(client, packs);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase560WancherDreamPenAluminumContemporaryPacks,
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
      "Usage: tsx scripts/apply-phase560-wancher-dream-pen-aluminum-contemporary.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase560WancherDreamPenAluminumContemporary(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase560-wancher-aluminum-contemporary",
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
