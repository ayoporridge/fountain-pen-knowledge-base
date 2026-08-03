import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
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
  PHASE394_PILOT_823_DUPLICATE_ID,
  PHASE394_PILOT_823_ID,
  PHASE394_PILOT_823_NAME,
  PHASE394_PILOT_823_SLUG,
  PHASE394_PILOT_BRAND_ID,
  phase394PilotCustom823RefreshPacks,
} from "./data/phase394-pilot-custom-823-refresh";

export type ApplyPhase394Options = ApplyPhase22Options;
export type ApplyPhase394Result = ApplyPhase22Result;

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(`${prefix}\0${value}`).slice(0, 24)}`;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 394 refuses inherited remote database selection: ${key}.`);
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

async function assertAuthority(client: Client, options: ApplyPhase394Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 394 reviewer must not be empty.");
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
    throw new Error("Phase 394 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(own.nlink) !== 1 ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 394 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 394 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 394 owned copy must be migrated through 032.");
  }
}

async function installRedirect(
  tx: Transaction,
  sourcePath: string,
  targetPath: string,
  actionId: string,
  batchId: string,
): Promise<void> {
  const existing = await tx.execute({
    sql: "SELECT redirect_kind,target_path FROM entity_redirects WHERE source_path=?",
    args: [sourcePath],
  });
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (
      String(row?.redirect_kind) !== "permanent" ||
      String(row?.target_path) !== targetPath
    ) {
      throw new Error(`Phase 394 conflicting redirect for ${sourcePath}.`);
    }
    return;
  }
  await tx.execute({
    sql: "INSERT INTO entity_redirects (id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES (?,?,?,?,?,'permanent',?)",
    args: [
      stableId("phase394-redirect", sourcePath),
      batchId,
      actionId,
      sourcePath,
      targetPath,
      "duplicate_canonical_merge",
    ],
  });
}

async function assertIdentity(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  const brandPack = packs.find(
    (pack) => pack.entityId === PHASE394_PILOT_BRAND_ID && pack.expectedType === "brand",
  );
  const modelPack = packs.find(
    (pack) => pack.entityId === PHASE394_PILOT_823_ID && pack.expectedType === "pen",
  );
  if (
    packs.length !== 2 ||
    !brandPack ||
    !modelPack ||
    modelPack.expectedSlug !== PHASE394_PILOT_823_SLUG
  ) {
    throw new Error("Phase 394 Pilot Custom 823 pack identity is incomplete.");
  }
  const brand = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=?",
    [PHASE394_PILOT_BRAND_ID],
  );
  if (
    brand.length !== 1 ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "pilot" ||
    brand[0]?.name !== "百乐 Pilot"
  ) {
    throw new Error(`Phase 394 Pilot brand identity mismatch: ${JSON.stringify(brand)}`);
  }
  const canonical = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=?",
    [PHASE394_PILOT_823_ID],
  );
  if (
    canonical.length !== 1 ||
    canonical[0]?.type !== "pen" ||
    canonical[0]?.slug !== PHASE394_PILOT_823_SLUG ||
    canonical[0]?.name !== PHASE394_PILOT_823_NAME
  ) {
    throw new Error(`Phase 394 Pilot canonical identity mismatch: ${JSON.stringify(canonical)}`);
  }
  const duplicate = await rows(
    client,
    "SELECT id,type,slug FROM entities WHERE id=?",
    [PHASE394_PILOT_823_DUPLICATE_ID],
  );
  if (
    duplicate.length !== 1 ||
    duplicate[0]?.type !== "pen" ||
    duplicate[0]?.slug !== "百乐-pilot-custom-823"
  ) {
    throw new Error(`Phase 394 Pilot duplicate identity mismatch: ${JSON.stringify(duplicate)}`);
  }
}

async function prepareIdentity(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const batchKey = "phase394-pilot-custom-823-refresh-merge";
    const batchId = stableId("phase394-batch", batchKey);
    const actionId = stableId("phase394-action", batchKey);
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches (id,source_key,source_checksum,status,note) VALUES (?,?,?,'applied',?)",
      args: [
        batchId,
        batchKey,
        digest(batchKey),
        "Keep the existing Pilot Custom 823 canonical identity and retire the duplicate route.",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_actions (id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES (?,?,?,'merge',?,?,?,?,?)",
      args: [
        actionId,
        batchId,
        batchKey,
        digest(`${batchKey}\0${PHASE394_PILOT_823_DUPLICATE_ID}\0${PHASE394_PILOT_823_ID}`),
        PHASE394_PILOT_823_DUPLICATE_ID,
        PHASE394_PILOT_823_ID,
        "applied",
        "Pilot Custom 823 verified facts remain on the existing canonical model page.",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_lineage (id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind,fallback_reason) VALUES (?,?,?,?,?,'merge',NULL)",
      args: [
        stableId("phase394-lineage", batchKey),
        batchId,
        actionId,
        PHASE394_PILOT_823_DUPLICATE_ID,
        PHASE394_PILOT_823_ID,
      ],
    });
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=?",
      args: [PHASE394_PILOT_823_DUPLICATE_ID],
    });
    await tx.execute({
      sql: "UPDATE entity_publications SET status='retired',blockers_json=?,approved_content_hash=NULL,reviewed_content_revision=NULL,reviewed_contract_version=NULL,reviewed_by=NULL,reviewed_at=NULL,published_at=NULL,review_notes=?,updated_at=datetime('now') WHERE entity_id=? AND status<>'retired'",
      args: [
        '["taxonomy_merged"]',
        "Duplicate Pilot Custom 823 identity; use /pen/pilot-custom-823.",
        PHASE394_PILOT_823_DUPLICATE_ID,
      ],
    });
    await installRedirect(
      tx,
      "/pen/百乐-pilot-custom-823",
      "/pen/pilot-custom-823",
      actionId,
      batchId,
    );
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE394_PILOT_823_ID, PHASE394_PILOT_BRAND_ID],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'made_by',?)",
      args: [
        stableId("phase394-maker", PHASE394_PILOT_823_ID),
        PHASE394_PILOT_823_ID,
        PHASE394_PILOT_BRAND_ID,
        "Phase 394 verified Pilot Custom 823 maker relation",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'reverse',?)",
      args: [
        stableId("phase394-reverse", PHASE394_PILOT_823_ID),
        PHASE394_PILOT_BRAND_ID,
        PHASE394_PILOT_823_ID,
        "Phase 394 Pilot brand model navigation",
      ],
    });
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase394PilotCustom823Refresh(
  client: Client,
  options: ApplyPhase394Options,
): Promise<ApplyPhase394Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase394PilotCustom823RefreshPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  await assertIdentity(client, packs);
  await prepareIdentity(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase394PilotCustom823RefreshPacks,
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
      "Usage: tsx scripts/apply-phase394-pilot-custom-823-refresh.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase394PilotCustom823Refresh(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase394-pilot-custom-823",
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
