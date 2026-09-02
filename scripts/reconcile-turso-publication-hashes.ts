import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { createClient, type Client } from "@libsql/client";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  buildIdentityMappings,
  localTableNames,
  readLocalSchema,
  readRemoteRows,
  readRemoteSchema,
  rowKey,
  type IdentityMappings,
  type Row,
  type TableSchema,
} from "./prune-turso-remote-only";
import {
  withMigrationGateCache,
  type ReadinessSnapshot,
} from "./sync-local-catalog-to-turso";

/**
 * Reconcile publication hashes after a Turso identity mapping.
 *
 * The remote catalog may retain an existing natural-key primary key while the
 * owned local source uses a newer ID.  Data rows are semantically identical,
 * but the contract-v3 hash includes IDs.  This command computes the hash of
 * the mapped remote payload without writing the local database, then uses the
 * existing review and publication APIs to authorize that exact remote hash.
 */

const EXPECTED_SOURCE_SHA256 =
  "00ddd2dc6e1a9bde275920eed3d0d82e251be1e7d8b48bb1e27b6619e080d4c4";
const EXPECTED_PROTECTED_SHA256 = EXPECTED_SOURCE_SHA256;
const REVIEWER = "catalog-migration-20260902";
const MAPPED_ID_FIELDS = new Set([
  "id",
  "tag_id",
  "source_id",
  "source_item_id",
  "claim_id",
  "scope_id",
  "model_spec_id",
  "variant_id",
  "parent_variant_id",
  "citation_id",
  "conflict_id",
  "action_id",
  "batch_id",
]);

type CliOptions = {
  sourcePath: string;
  sourceRoot: string;
  protectedCatalogPath: string;
  reportPath?: string;
  writeLimit?: number;
  apply: boolean;
  acknowledgeRemoteWrite: boolean;
};

const REMOTE_WRITE_CHUNK_SIZE = 20;

function loadLocalEnv(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!process.env[key]) {
      process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
    }
  }
}

function cliValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

function parseOptions(): CliOptions {
  const sourcePath = cliValue("--source");
  const sourceRoot = cliValue("--owned-root");
  const protectedCatalogPath = cliValue("--protected-catalog");
  if (!sourcePath || !sourceRoot || !protectedCatalogPath) {
    throw new Error(
      "Usage: tsx scripts/reconcile-turso-publication-hashes.ts --source <owned-copy> --owned-root <source-root> --protected-catalog <data/fpkg.db> [--report <json>] [--limit <n>] [--apply --ack-remote-write]",
    );
  }
  const rawWriteLimit = cliValue("--limit");
  const writeLimit = rawWriteLimit === undefined ? undefined : Number(rawWriteLimit);
  if (
    writeLimit !== undefined &&
    (!Number.isSafeInteger(writeLimit) || writeLimit < 1)
  ) {
    throw new Error("--limit must be a positive integer.");
  }
  return {
    sourcePath: path.resolve(sourcePath),
    sourceRoot: path.resolve(sourceRoot),
    protectedCatalogPath: path.resolve(protectedCatalogPath),
    reportPath: cliValue("--report")
      ? path.resolve(cliValue("--report") as string)
      : undefined,
    writeLimit,
    apply: process.argv.includes("--apply"),
    acknowledgeRemoteWrite: process.argv.includes("--ack-remote-write"),
  };
}

function quoteIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function isWithin(root: string, target: string): boolean {
  return target === root || target.startsWith(`${root}${path.sep}`);
}

function readLocalRows(
  database: Database.Database,
  schemas: Map<string, TableSchema>,
): Map<string, Row[]> {
  const rows = new Map<string, Row[]>();
  for (const [name, schema] of schemas) {
    const columns = schema.columns.map((column) => quoteIdentifier(column.name)).join(", ");
    rows.set(
      name,
      database
        .prepare(`SELECT ${columns} FROM ${quoteIdentifier(name)}`)
        .all() as Row[],
    );
  }
  return rows;
}

function buildIdMaps(
  schemas: Map<string, TableSchema>,
  localRows: Map<string, Row[]>,
  mappings: IdentityMappings,
): { forward: Map<string, string>; reverse: Map<string, string> } {
  const forward = new Map<string, string>();
  const reverse = new Map<string, string>();
  for (const [tableName, tableMappings] of mappings) {
    const schema = schemas.get(tableName);
    if (!schema || schema.primaryKey.length !== 1) continue;
    for (const localRow of localRows.get(tableName) ?? []) {
      const mapped = tableMappings.get(rowKey(localRow, schema.primaryKey));
      const localValue = localRow[schema.primaryKey[0]];
      const remoteValue = mapped?.[0];
      if (typeof localValue !== "string" || typeof remoteValue !== "string") continue;
      forward.set(localValue, remoteValue);
      reverse.set(remoteValue, localValue);
    }
  }
  return { forward, reverse };
}

function buildMappedLocalClient(
  database: Database.Database,
  forward: Map<string, string>,
  reverse: Map<string, string>,
): { execute(statement: { sql: string; args?: readonly unknown[] }): Promise<{ rows: Row[] }> } {
  const mapRow = (row: Row): Row =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        MAPPED_ID_FIELDS.has(key) && typeof value === "string"
          ? forward.get(value) ?? value
          : value,
      ]),
    );
  const unmapArgument = (value: unknown): unknown =>
    typeof value === "string" ? reverse.get(value) ?? value : value;
  return {
    execute: async ({ sql, args = [] }) => ({
      rows: database
        .prepare(sql)
        .all(...args.map(unmapArgument))
        .map((row) => mapRow(row as Row)),
    }),
  };
}

function writeReport(reportPath: string | undefined, report: unknown): void {
  if (!reportPath) return;
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

async function reconcileRemoteHashes(
  client: Client,
  mismatches: Array<{
    entityId: string;
    remoteHash: string;
    readiness: ReadinessSnapshot;
  }>,
): Promise<number> {
  let published = 0;
  for (const mismatch of mismatches) {
    const transaction = await client.transaction("write");
    try {
      for (const reviewKind of ["fact", "language", "media"] as const) {
        await recordEntityContentReview(client, {
          entityId: mismatch.entityId,
          reviewKind,
          reviewer: REVIEWER,
          status: "approved",
          notes: "Approved against the mapped Turso publication payload.",
          contentHash: mismatch.remoteHash,
          transaction,
        });
      }
      await publishEntity(client, {
        entityId: mismatch.entityId,
        reviewer: REVIEWER,
        contentHash: mismatch.remoteHash,
        readiness: mismatch.readiness,
        assertPublicMembership: true,
        transaction,
      });
      await transaction.commit();
      published += 1;
      if (published % 25 === 0) console.log(`  mapped-hash gate progress: ${published}`);
    } catch (error) {
      if (!transaction.closed) await transaction.rollback();
      throw error;
    }
  }
  return published;
}

async function reconcileRemoteHashesInChunks(
  remoteUrl: string,
  authToken: string,
  readinessByEntity: Map<string, ReadinessSnapshot>,
  mismatches: Array<{
    entityId: string;
    remoteHash: string;
    readiness: ReadinessSnapshot;
  }>,
): Promise<number> {
  let published = 0;
  for (let offset = 0; offset < mismatches.length; offset += REMOTE_WRITE_CHUNK_SIZE) {
    const chunk = mismatches.slice(offset, offset + REMOTE_WRITE_CHUNK_SIZE);
    const chunkClient = createClient({ url: remoteUrl, authToken });
    try {
      const chunkPublished = await withMigrationGateCache(
        chunkClient,
        readinessByEntity,
        () => reconcileRemoteHashes(chunkClient, chunk),
        // Readiness was snapshotted from the owned catalog; suppress only the
        // redundant blocker-view invalidation trigger while the API records
        // the current hash, then restore it in withMigrationGateCache.
        { suppressContentReviewInvalidation: true },
      );
      published += chunkPublished;
      console.log(
        `  mapped-hash chunk complete: ${Math.min(offset + chunk.length, mismatches.length)}/${mismatches.length}`,
      );
    } finally {
      chunkClient.close();
    }
  }
  return published;
}

async function main(): Promise<void> {
  loadLocalEnv();
  const options = parseOptions();
  const sourceRoot = fs.realpathSync(options.sourceRoot);
  const sourcePath = fs.realpathSync(options.sourcePath);
  const protectedPath = fs.realpathSync(options.protectedCatalogPath);
  if (!isWithin(sourceRoot, sourcePath)) throw new Error("--source must remain inside --owned-root.");
  if (fs.lstatSync(options.sourcePath).isSymbolicLink()) throw new Error("--source must not be a symlink.");
  if (!fs.statSync(sourcePath).isFile()) throw new Error("--source must be a regular file.");
  const sourceSnapshot = snapshotCatalogFiles(sourcePath);
  const protectedSnapshot = snapshotCatalogFiles(protectedPath);
  if (sourceSnapshot.main.sha256 !== EXPECTED_SOURCE_SHA256) {
    throw new Error(`Owned source SHA mismatch: ${sourceSnapshot.main.sha256}`);
  }
  if (protectedSnapshot.main.sha256 !== EXPECTED_PROTECTED_SHA256) {
    throw new Error(`Protected local catalog SHA mismatch: ${protectedSnapshot.main.sha256}`);
  }
  if (sourceSnapshot.wal.exists && sourceSnapshot.wal.size !== "0") {
    throw new Error("Owned source has a non-empty WAL.");
  }
  if (protectedSnapshot.wal.exists && protectedSnapshot.wal.size !== "0") {
    throw new Error("Protected local catalog has a non-empty WAL.");
  }

  const database = new Database(sourcePath, { readonly: true });
  const localNames = localTableNames(database);
  const localSchemas = readLocalSchema(database, localNames);
  const localRows = readLocalRows(database, localSchemas);
  const remoteUrl = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!remoteUrl || !authToken) {
    database.close();
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required in .env.local or the environment.");
  }
  const client = createClient({ url: remoteUrl, authToken });
  try {
    const remoteSchemas = await readRemoteSchema(client, localNames);
    for (const name of localNames) {
      if (!schemaCompatible(localSchemas.get(name) as TableSchema, remoteSchemas.get(name) as TableSchema)) {
        throw new Error(`Remote schema mismatch: ${name}`);
      }
    }
    const remoteRows = await readRemoteRows(client, remoteSchemas);
    const mappings = buildIdentityMappings(localSchemas, localRows, remoteRows);
    const { forward, reverse } = buildIdMaps(localSchemas, localRows, mappings);
    const mappedClient = buildMappedLocalClient(database, forward, reverse);
    const readiness = new Map<string, ReadinessSnapshot>();
    const readinessRows = database
      .prepare(
        "SELECT entity_id, blocker_count, blockers_json, publishable FROM public_entity_readiness WHERE contract_version=3",
      )
      .all() as Row[];
    for (const row of readinessRows) {
      readiness.set(String(row.entity_id), {
        blockerCount: Number(row.blocker_count),
        blockersJson: String(row.blockers_json ?? "[]"),
        publishable: Number(row.publishable),
      });
    }
    const publicationRows = localRows.get("entity_publications") ?? [];
    const remotePublicationRows = new Map(
      (remoteRows.get("entity_publications") ?? []).map((row) => [String(row.entity_id), row]),
    );
    const mismatches: Array<{
      entityId: string;
      localHash: string;
      remoteStoredHash: string;
      remoteHash: string;
      readiness: ReadinessSnapshot;
    }> = [];
    for (const row of publicationRows) {
      if (String(row.status) !== "published") continue;
      const entityId = String(row.entity_id);
      const currentRemote = remotePublicationRows.get(entityId);
      const expectedReadiness = readiness.get(entityId);
      if (!currentRemote || !expectedReadiness) {
        throw new Error(`Publication/readiness row missing for ${entityId}`);
      }
      const remoteHash = await computePublicationContentHash(mappedClient, entityId);
      const localHash = String(row.approved_content_hash ?? "");
      const remoteStoredHash = String(currentRemote.approved_content_hash ?? "");
      if (remoteStoredHash !== remoteHash) {
        mismatches.push({
          entityId,
          localHash,
          remoteStoredHash,
          remoteHash,
          readiness: expectedReadiness,
        });
      }
    }
    const report: Record<string, unknown> = {
      checkedAt: new Date().toISOString(),
      mode: options.apply && options.acknowledgeRemoteWrite ? "apply" : "dry-run",
      sourcePath,
      sourceSha256: sourceSnapshot.main.sha256,
      protectedCatalogPath: protectedPath,
      protectedSha256Before: protectedSnapshot.main.sha256,
      identityMappingCount: [...mappings.values()].reduce((sum, mapping) => sum + mapping.size, 0),
      mappedIdCount: forward.size,
      publishedEntitiesChecked: publicationRows.filter((row) => String(row.status) === "published").length,
      hashMismatchCount: mismatches.length,
      writeLimit: options.writeLimit ?? null,
      hashMismatchSamples: mismatches.slice(0, 12).map(({ entityId, localHash, remoteStoredHash, remoteHash }) => ({
        entityId,
        localHash,
        remoteStoredHash,
        mappedRemoteHash: remoteHash,
      })),
    };
    console.log(`Identity mappings used: ${report.identityMappingCount}`);
    console.log(`Published entities checked: ${report.publishedEntitiesChecked}`);
    console.log(`Remote payload hash mismatches: ${mismatches.length}`);
    if (!options.apply) {
      writeReport(options.reportPath, report);
      console.log("Dry-run only. No remote hash writes were performed.");
      return;
    }
    if (!options.acknowledgeRemoteWrite) {
      throw new Error("Remote hash writes require both --apply and --ack-remote-write.");
    }
    const mismatchesToWrite =
      options.writeLimit === undefined
        ? mismatches
        : mismatches.slice(0, options.writeLimit);
    const readinessByEntity = new Map(
      [...readiness.entries()].map(([entityId, value]) => [entityId, value]),
    );
    const published = await reconcileRemoteHashesInChunks(
      remoteUrl,
      authToken,
      readinessByEntity,
      mismatchesToWrite,
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    report.republishedWithMappedHash = published;
    report.protectedSha256After = snapshotCatalogFiles(protectedPath).main.sha256;
    writeReport(options.reportPath, report);
    console.log(`Mapped-hash publication restore: published=${published}`);
    console.log("Protected local catalog snapshot unchanged.");
  } finally {
    client.close();
    database.close();
  }
}

function schemaCompatible(local: TableSchema, remote: TableSchema): boolean {
  if (JSON.stringify(local.primaryKey) !== JSON.stringify(remote.primaryKey)) return false;
  const remoteColumns = new Map(remote.columns.map((column) => [column.name, column]));
  return local.columns.every((column) => {
    const remoteColumn = remoteColumns.get(column.name);
    return (
      remoteColumn !== undefined &&
      String(remoteColumn.type) === String(column.type) &&
      Number(remoteColumn.notnull) === Number(column.notnull) &&
      Number(remoteColumn.pk) === Number(column.pk)
    );
  });
}

if (process.argv.some((argument) => argument.endsWith("reconcile-turso-publication-hashes.ts"))) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
