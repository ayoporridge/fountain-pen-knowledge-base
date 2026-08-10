import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import {
  PHASE563_849_ID,
  PHASE563_849_NAME,
  PHASE563_849_SLUG,
  PHASE563_CARAN_BRAND_ID,
  phase563CaranDache849FountainPenPacks,
} from "./data/phase563-caran-dache-849-fountain-pen";

export type ApplyPhase563Options = ApplyPhase22Options;
export type ApplyPhase563Result = ApplyPhase22Result;

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 563 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertIdentity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  if (
    packs.length !== 2 ||
    !packs.some((pack) => pack.entityId === PHASE563_CARAN_BRAND_ID) ||
    !packs.some((pack) => pack.entityId === PHASE563_849_ID)
  ) {
    throw new Error("Phase 563 Caran d’Ache packs are incomplete.");
  }
  const brand = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [
    PHASE563_CARAN_BRAND_ID,
    "caran-dache",
  ]);
  if (
    brand.length !== 1 ||
    brand[0]?.id !== PHASE563_CARAN_BRAND_ID ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "caran-dache" ||
    brand[0]?.name !== "Caran d’Ache"
  ) {
    throw new Error(`Phase 563 Caran d’Ache brand identity mismatch: ${JSON.stringify(brand)}`);
  }
  const model = packs.find((pack) => pack.entityId === PHASE563_849_ID);
  if (!model) throw new Error("Phase 563 849 pack is missing.");
  const existing = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
    [PHASE563_849_ID, PHASE563_849_SLUG],
  );
  if (
    existing.length > 1 ||
    (existing.length === 1 &&
      (existing[0]?.id !== PHASE563_849_ID ||
        existing[0]?.type !== model.expectedType ||
        existing[0]?.slug !== model.expectedSlug ||
        existing[0]?.name !== model.canonicalName))
  ) {
    throw new Error(`Phase 563 849 identity collision: ${JSON.stringify(existing)}`);
  }
  const names = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE lower(name)=lower(?) AND id<>?",
    [PHASE563_849_NAME, PHASE563_849_ID],
  );
  if (names.length > 0) throw new Error(`Phase 563 849 name collision: ${JSON.stringify(names)}`);
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const existing = await rows(
      tx,
      "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
      [PHASE563_849_ID, PHASE563_849_SLUG],
    );
    if (existing.length === 0) {
      await tx.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)",
        args: [PHASE563_849_ID, PHASE563_849_SLUG, PHASE563_849_NAME],
      });
    } else if (
      existing.length !== 1 ||
      String(existing[0]?.id) !== PHASE563_849_ID ||
      String(existing[0]?.type) !== "pen" ||
      String(existing[0]?.slug) !== PHASE563_849_SLUG ||
      String(existing[0]?.name) !== PHASE563_849_NAME
    ) {
      throw new Error("Phase 563 refuses a conflicting Caran d’Ache 849 identity.");
    }
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE563_849_ID, PHASE563_CARAN_BRAND_ID],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [
        "phase563-made-by-caran-dache-849",
        PHASE563_849_ID,
        PHASE563_CARAN_BRAND_ID,
        "Phase 563 verified Caran d’Ache 849 Fountain Pen maker relation",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        "phase563-reverse-caran-dache-849",
        PHASE563_CARAN_BRAND_ID,
        PHASE563_849_ID,
        "Phase 563 Caran d’Ache brand public model navigation",
      ],
    });
    const maker = await rows(
      tx,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [PHASE563_849_ID],
    );
    if (maker.length !== 1 || maker[0]?.target_id !== PHASE563_CARAN_BRAND_ID) {
      throw new Error("Phase 563 849 maker topology is ambiguous.");
    }
    const reverse = await rows(
      tx,
      "SELECT source_id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      [PHASE563_CARAN_BRAND_ID, PHASE563_849_ID],
    );
    if (reverse.length !== 1) throw new Error("Phase 563 849 reverse navigation is ambiguous.");
    const publication = await rows(
      tx,
      "SELECT status FROM entity_publications WHERE entity_id=?",
      [PHASE563_849_ID],
    );
    if (
      publication.length !== 1 ||
      !["draft", "in_review", "published"].includes(String(publication[0]?.status))
    ) {
      throw new Error("Phase 563 expects a draft, in-review, or already-published publication row.");
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase563CaranDache849FountainPen(
  client: Client,
  options: ApplyPhase563Options,
): Promise<ApplyPhase563Result> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase563CaranDache849FountainPenPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  await assertIdentity(client, packs);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, phase563CaranDache849FountainPenPacks);
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
      "Usage: tsx scripts/apply-phase563-caran-dache-849-fountain-pen.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase563CaranDache849FountainPen(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase563-caran-dache-849",
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
