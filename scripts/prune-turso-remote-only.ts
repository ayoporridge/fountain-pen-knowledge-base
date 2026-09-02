import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { createClient, type Client, type InArgs, type InStatement } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";

/**
 * Remove only the stale Turso rows left by the pre-existing remote snapshot.
 *
 * This command is intentionally read-only by default.  It requires both
 * --apply and --ack-remote-delete before issuing exact primary-key DELETEs.
 * The remote-only backup is treated as a compare-and-delete fence: changed or
 * unexpected rows abort the run, while rows already absent are resumable.
 */

const EXPECTED_SOURCE_SHA256 =
  "00ddd2dc6e1a9bde275920eed3d0d82e251be1e7d8b48bb1e27b6619e080d4c4";
const EXPECTED_PROTECTED_SHA256 = EXPECTED_SOURCE_SHA256;
const DELETE_BATCH_SIZE = 25;
const EXCLUDED_TABLES = new Set(["migrations"]);
const INTERNAL_TABLE_PREFIXES = ["sqlite_", "entities_fts"];
// Review rows are append-only audit history in the existing publication
// contract.  Deleting them invokes the blocker-backed publication trigger and
// can make the remote database exhaust its SQLite memory budget; keep them as
// the explicit, documented remote-history exception.
const PRESERVE_HISTORY_TABLES = new Set(["entity_content_reviews"]);

type SqlValue = string | number | bigint | boolean | Uint8Array | null;
export type Row = Record<string, unknown>;
type Column = {
  name: string;
  type: string;
  notnull: number;
  pk: number;
};
type ForeignKey = {
  table: string;
  from: string;
  to: string;
  onDelete?: string;
};
export type TableSchema = {
  name: string;
  columns: Column[];
  primaryKey: string[];
  foreignKeys: ForeignKey[];
  uniqueIndexes: string[][];
};
export type IdentityMappings = Map<string, Map<string, SqlValue[]>>;
type BackupTable = {
  name: string;
  columns: string[];
  primaryKey: string[];
  rows: Row[];
};
type BackupFile = {
  createdAt: string;
  sourcePath: string;
  tables: BackupTable[];
  total: number;
};
type CliOptions = {
  sourcePath: string;
  sourceRoot: string;
  backupPath: string;
  backupRoot: string;
  protectedCatalogPath: string;
  reportPath?: string;
  apply: boolean;
  acknowledgeRemoteDelete: boolean;
};

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
  const backupPath = cliValue("--backup");
  const backupRoot = cliValue("--backup-root");
  const protectedCatalogPath = cliValue("--protected-catalog");
  if (!sourcePath || !sourceRoot || !backupPath || !backupRoot || !protectedCatalogPath) {
    throw new Error(
      "Usage: tsx scripts/prune-turso-remote-only.ts --source <owned-copy> --owned-root <source-root> --backup <remote-only.json> --backup-root <backup-root> --protected-catalog <data/fpkg.db> [--report <json>] [--apply --ack-remote-delete]",
    );
  }
  return {
    sourcePath: path.resolve(sourcePath),
    sourceRoot: path.resolve(sourceRoot),
    backupPath: path.resolve(backupPath),
    backupRoot: path.resolve(backupRoot),
    protectedCatalogPath: path.resolve(protectedCatalogPath),
    reportPath: cliValue("--report")
      ? path.resolve(cliValue("--report") as string)
      : undefined,
    apply: process.argv.includes("--apply"),
    acknowledgeRemoteDelete: process.argv.includes("--ack-remote-delete"),
  };
}

function quoteIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function isInternalTable(name: string): boolean {
  return INTERNAL_TABLE_PREFIXES.some((prefix) => name.startsWith(prefix));
}

function isSyncTable(name: string): boolean {
  return !EXCLUDED_TABLES.has(name) && !isInternalTable(name);
}

function isWithin(root: string, target: string): boolean {
  return target === root || target.startsWith(`${root}${path.sep}`);
}

export function comparableValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (value instanceof Uint8Array) {
    return `blob:${Buffer.from(value).toString("hex")}`;
  }
  if (typeof value === "bigint") return `bigint:${value.toString()}`;
  if (typeof value === "number" && Object.is(value, -0)) return "number:0";
  return `${typeof value}:${String(value)}`;
}

export function rowKey(row: Row, primaryKey: string[]): string {
  return primaryKey.map((column) => comparableValue(row[column])).join("\u001f");
}

export function uniqueKey(row: Row, columns: string[]): string | null {
  const values = columns.map((column) => row[column]);
  if (values.some((value) => value === null || value === undefined)) return null;
  return values.map(comparableValue).join("\u001f");
}

function asSqlValue(value: unknown): SqlValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (value instanceof Uint8Array) return value;
  if (value === undefined) return null;
  throw new Error(`Unsupported SQLite value type: ${typeof value}`);
}

function decodeBackupValue(value: unknown): unknown {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "__blob" in value &&
    typeof (value as { __blob?: unknown }).__blob === "string"
  ) {
    return Uint8Array.from(Buffer.from((value as { __blob: string }).__blob, "base64"));
  }
  return value;
}

function decodeBackup(input: unknown): BackupFile {
  if (!input || typeof input !== "object") throw new Error("Remote-only backup is not an object.");
  const value = input as Partial<BackupFile>;
  if (!Array.isArray(value.tables) || typeof value.sourcePath !== "string") {
    throw new Error("Remote-only backup has an invalid shape.");
  }
  const tables = value.tables.map((table) => {
    if (
      !table ||
      typeof table !== "object" ||
      typeof table.name !== "string" ||
      !Array.isArray(table.columns) ||
      !Array.isArray(table.primaryKey) ||
      !Array.isArray(table.rows)
    ) {
      throw new Error("Remote-only backup contains an invalid table entry.");
    }
    return {
      name: table.name,
      columns: table.columns.map(String),
      primaryKey: table.primaryKey.map(String),
      rows: table.rows.map((row) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) {
          throw new Error(`Remote-only backup row is invalid in ${table.name}.`);
        }
        return Object.fromEntries(
          Object.entries(row).map(([key, item]) => [key, decodeBackupValue(item)]),
        );
      }),
    };
  });
  return {
    createdAt: String(value.createdAt ?? ""),
    sourcePath: path.resolve(value.sourcePath),
    tables,
    total: Number(value.total ?? tables.reduce((sum, table) => sum + table.rows.length, 0)),
  };
}

export function localTableNames(database: Database.Database): string[] {
  return database
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    .all()
    .map((row) => String((row as { name: string }).name))
    .filter(isSyncTable);
}

export function readLocalSchema(database: Database.Database, names: string[]): Map<string, TableSchema> {
  const schemas = new Map<string, TableSchema>();
  for (const name of names) {
    const columns = database
      .prepare(`PRAGMA table_info(${quoteIdentifier(name)})`)
      .all() as Column[];
    const foreignKeys = database
      .prepare(`PRAGMA foreign_key_list(${quoteIdentifier(name)})`)
      .all()
      .map((row) => {
        const value = row as ForeignKey & { on_delete?: string };
        return {
          table: String(value.table),
          from: String(value.from),
          to: String(value.to),
          onDelete: String(value.on_delete ?? "NO ACTION"),
        };
      });
    const uniqueIndexes: string[][] = [];
    const indexes = database
      .prepare(`PRAGMA index_list(${quoteIdentifier(name)})`)
      .all() as Array<{ name: string; unique: number; origin: string }>;
    for (const index of indexes.filter((item) => Number(item.unique) === 1 && item.origin !== "pk")) {
      const columns = (
        database.prepare(`PRAGMA index_info(${quoteIdentifier(index.name)})`).all() as Array<{
          name: string;
          seqno: number;
        }>
      )
        .sort((left, right) => Number(left.seqno) - Number(right.seqno))
        .map((item) => String(item.name));
      if (columns.length > 0) uniqueIndexes.push(columns);
    }
    schemas.set(name, {
      name,
      columns,
      primaryKey: columns
        .filter((column) => Number(column.pk) > 0)
        .sort((left, right) => Number(left.pk) - Number(right.pk))
        .map((column) => column.name),
      foreignKeys,
      uniqueIndexes,
    });
  }
  return schemas;
}

export async function readRemoteSchema(
  client: Pick<Client, "execute">,
  names: string[],
): Promise<Map<string, TableSchema>> {
  const schemas = new Map<string, TableSchema>();
  for (const name of names) {
    const columns = (await client.execute(`PRAGMA table_info(${quoteIdentifier(name)})`)).rows as unknown as Column[];
    const foreignKeys = (await client.execute(`PRAGMA foreign_key_list(${quoteIdentifier(name)})`)).rows.map((row) => {
      const value = row as unknown as ForeignKey & { on_delete?: string };
      return {
        table: String(value.table),
        from: String(value.from),
        to: String(value.to),
        onDelete: String(value.on_delete ?? "NO ACTION"),
      };
    });
    const uniqueIndexes: string[][] = [];
    const indexes = (await client.execute(`PRAGMA index_list(${quoteIdentifier(name)})`)).rows as unknown as Array<{
      name: string;
      unique: number;
      origin: string;
    }>;
    for (const index of indexes.filter((item) => Number(item.unique) === 1 && item.origin !== "pk")) {
      const columns = ((await client.execute(`PRAGMA index_info(${quoteIdentifier(index.name)})`)).rows as unknown as Array<{
        name: string;
        seqno: number;
      }>)
        .sort((left, right) => Number(left.seqno) - Number(right.seqno))
        .map((item) => String(item.name));
      if (columns.length > 0) uniqueIndexes.push(columns);
    }
    schemas.set(name, {
      name,
      columns,
      primaryKey: columns
        .filter((column) => Number(column.pk) > 0)
        .sort((left, right) => Number(left.pk) - Number(right.pk))
        .map((column) => column.name),
      foreignKeys,
      uniqueIndexes,
    });
  }
  return schemas;
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

export function topologicalOrder(schemas: Map<string, TableSchema>): string[] {
  const dependencies = new Map<string, Set<string>>();
  for (const name of [...schemas.keys()].sort()) {
    dependencies.set(
      name,
      new Set(
        (schemas.get(name)?.foreignKeys ?? [])
          .filter((foreignKey) => foreignKey.table !== name && schemas.has(foreignKey.table))
          .map((foreignKey) => foreignKey.table),
      ),
    );
  }
  const ordered: string[] = [];
  while (dependencies.size > 0) {
    const ready = [...dependencies.entries()]
      .filter(([, deps]) => deps.size === 0)
      .map(([name]) => name)
      .sort();
    const batch = ready.length > 0 ? ready : [[...dependencies.keys()].sort()[0]];
    for (const name of batch) {
      if (!name || !dependencies.has(name)) continue;
      dependencies.delete(name);
      for (const deps of dependencies.values()) deps.delete(name);
      ordered.push(name);
    }
  }
  return ordered;
}

function transformForeignKeys(
  table: TableSchema,
  original: Row,
  schemas: Map<string, TableSchema>,
  mappings: IdentityMappings,
): Row {
  const row = { ...original };
  for (const foreignKey of table.foreignKeys) {
    const value = row[foreignKey.from];
    if (value === null || value === undefined) continue;
    const referenced = schemas.get(foreignKey.table);
    const referencedMappings = mappings.get(foreignKey.table);
    if (!referenced || !referencedMappings || referenced.primaryKey.length !== 1) continue;
    const mapped = referencedMappings.get(
      rowKey({ [referenced.primaryKey[0]]: value }, referenced.primaryKey),
    );
    if (mapped?.[0] !== undefined) row[foreignKey.from] = mapped[0];
  }
  return row;
}

export function buildIdentityMappings(
  schemas: Map<string, TableSchema>,
  localRows: Map<string, Row[]>,
  remoteRows: Map<string, Row[]>,
): IdentityMappings {
  const mappings: IdentityMappings = new Map();
  for (const tableName of topologicalOrder(schemas)) {
    const table = schemas.get(tableName);
    if (!table || table.primaryKey.length === 0) continue;
    const local = localRows.get(tableName) ?? [];
    const remote = remoteRows.get(tableName) ?? [];
    const remotePrimaryKeys = new Set(remote.map((row) => rowKey(row, table.primaryKey)));
    const remoteByUnique = new Map<string, Row>();
    for (const columns of table.uniqueIndexes) {
      for (const row of remote) {
        const key = uniqueKey(row, columns);
        if (key !== null) remoteByUnique.set(`${columns.join("\u001f")}\u0000${key}`, row);
      }
    }
    const tableMappings = new Map<string, SqlValue[]>();
    for (const localRow of local) {
      const localPrimaryKey = rowKey(localRow, table.primaryKey);
      const normalized = transformForeignKeys(table, localRow, schemas, mappings);
      const candidates: Row[] = [];
      for (const columns of table.uniqueIndexes) {
        const key = uniqueKey(normalized, columns);
        if (key === null) continue;
        const remoteRow = remoteByUnique.get(`${columns.join("\u001f")}\u0000${key}`);
        if (remoteRow) candidates.push(remoteRow);
      }
      const distinct = new Map(candidates.map((row) => [rowKey(row, table.primaryKey), row]));
      if (distinct.size > 1) {
        throw new Error(`Ambiguous identity mapping in ${tableName}: ${localPrimaryKey}`);
      }
      const remoteRow = [...distinct.values()][0];
      if (!remoteRow || remotePrimaryKeys.has(localPrimaryKey)) continue;
      if (rowKey(localRow, table.primaryKey) !== rowKey(remoteRow, table.primaryKey)) {
        tableMappings.set(
          localPrimaryKey,
          table.primaryKey.map((column) => asSqlValue(remoteRow[column])),
        );
      }
    }
    if (tableMappings.size > 0) mappings.set(tableName, tableMappings);
  }
  return mappings;
}

function backupByTable(backup: BackupFile): Map<string, BackupTable> {
  const result = new Map<string, BackupTable>();
  for (const table of backup.tables) {
    if (result.has(table.name)) throw new Error(`Duplicate backup table: ${table.name}`);
    result.set(table.name, table);
  }
  return result;
}

function assertBackupMatchesCurrent(
  backup: BackupFile,
  localSchemas: Map<string, TableSchema>,
  localRows: Map<string, Row[]>,
  remoteSchemas: Map<string, TableSchema>,
  remoteRows: Map<string, Row[]>,
): {
  deletions: Map<string, Set<string>>;
  mappedPreserved: Map<string, number>;
  preservedHistory: Map<string, number>;
} {
  const backupTables = backupByTable(backup);
  const deletions = new Map<string, Set<string>>();
  const mappedPreserved = new Map<string, number>();
  const preservedHistory = new Map<string, number>();
  // Reconstruct the pre-prune identity surface by adding any backup rows that
  // have already disappeared during a resumable earlier attempt.  Without
  // this union, a mapped legacy primary key could be mistaken for a stale row
  // after its child rows were removed.
  const mappingRows = new Map<string, Row[]>();
  for (const [name, schema] of localSchemas) {
    const byKey = new Map(
      (remoteRows.get(name) ?? []).map((row) => [rowKey(row, schema.primaryKey), row]),
    );
    for (const row of backupTables.get(name)?.rows ?? []) {
      const key = rowKey(row, schema.primaryKey);
      if (!byKey.has(key)) byKey.set(key, row);
    }
    mappingRows.set(name, [...byKey.values()]);
  }
  const mappings = buildIdentityMappings(localSchemas, localRows, mappingRows);

  for (const [name, schema] of localSchemas) {
    const remoteSchema = remoteSchemas.get(name);
    if (!remoteSchema) throw new Error(`Remote table is missing: ${name}`);
    if (!schemaCompatible(schema, remoteSchema)) throw new Error(`Remote schema mismatch: ${name}`);
    const backupTable =
      backupTables.get(name) ?? {
        name,
        columns: schema.columns.map((column) => column.name),
        primaryKey: schema.primaryKey,
        rows: [],
      };
    if (JSON.stringify(backupTable.primaryKey) !== JSON.stringify(schema.primaryKey)) {
      throw new Error(`Remote-only backup primary key mismatch: ${name}`);
    }
    const localKeys = new Set((localRows.get(name) ?? []).map((row) => rowKey(row, schema.primaryKey)));
    const currentRemoteRows = remoteRows.get(name) ?? [];
    const currentRemoteKeys = new Set(currentRemoteRows.map((row) => rowKey(row, schema.primaryKey)));
    const backupRowsByKey = new Map(backupTable.rows.map((row) => [rowKey(row, schema.primaryKey), row]));
    const backupRemoteOnlyKeys = new Set(backupRowsByKey.keys());
    const mappedTargets = new Set(
      [...(mappings.get(name)?.values() ?? [])].map((values) => values.map(comparableValue).join("\u001f")),
    );
    const mappedLocalKeys = new Set(mappings.get(name)?.keys() ?? []);
    const currentRemoteOnly = [...currentRemoteKeys].filter((key) => !localKeys.has(key));
    const unexpectedRemoteOnly = currentRemoteOnly.filter((key) => !backupRemoteOnlyKeys.has(key));
    if (unexpectedRemoteOnly.length > 0) {
      throw new Error(`Unexpected current remote-only rows in ${name}: ${unexpectedRemoteOnly.slice(0, 3).join(" | ")}`);
    }
    const missingExpected = [...backupRemoteOnlyKeys].filter((key) => !currentRemoteKeys.has(key));
    const missingMapped = missingExpected.filter((key) => mappedTargets.has(key));
    if (missingMapped.length > 0) {
      throw new Error(`Mapped remote row disappeared in ${name}: ${missingMapped.slice(0, 3).join(" | ")}`);
    }
    const missingLocal = [...localKeys].filter(
      (key) => !currentRemoteKeys.has(key) && !mappedLocalKeys.has(key),
    );
    if (missingLocal.length > 0) {
      throw new Error(`Required local-key row disappeared in ${name}: ${missingLocal.slice(0, 3).join(" | ")}`);
    }
    for (const remoteRow of currentRemoteRows) {
      const key = rowKey(remoteRow, schema.primaryKey);
      const backupRow = backupRowsByKey.get(key);
      if (!backupRow) continue;
      const changed = schema.columns.some(
        (column) => comparableValue(remoteRow[column.name]) !== comparableValue(backupRow[column.name]),
      );
      if (changed) throw new Error(`Remote-only row changed since backup in ${name}: ${key}`);
    }
    const deletable = new Set(
      PRESERVE_HISTORY_TABLES.has(name)
        ? []
        : currentRemoteOnly.filter((key) => !mappedTargets.has(key)),
    );
    deletions.set(name, deletable);
    mappedPreserved.set(
      name,
      currentRemoteOnly.filter((key) => mappedTargets.has(key)).length,
    );
    if (PRESERVE_HISTORY_TABLES.has(name) && currentRemoteOnly.length > 0) {
      preservedHistory.set(name, currentRemoteOnly.length);
    }
    if (missingExpected.some((key) => mappedTargets.has(key))) {
      throw new Error(`Unexpected missing remote-only row in ${name}.`);
    }
  }

  for (const table of backup.tables) {
    if (!localSchemas.has(table.name)) throw new Error(`Backup contains unknown table: ${table.name}`);
  }
  return { deletions, mappedPreserved, preservedHistory };
}

function assertNoRetainedReferences(
  schemas: Map<string, TableSchema>,
  rows: Map<string, Row[]>,
  deletions: Map<string, Set<string>>,
): void {
  const failures: string[] = [];
  for (const [childName, childSchema] of schemas) {
    const childDeletes = deletions.get(childName) ?? new Set<string>();
    for (const foreignKey of childSchema.foreignKeys) {
      const parentSchema = schemas.get(foreignKey.table);
      const parentDeletes = deletions.get(foreignKey.table);
      if (!parentSchema || !parentDeletes || parentSchema.primaryKey.length !== 1) continue;
      if (parentSchema.primaryKey[0] !== foreignKey.to) {
        throw new Error(`Composite or non-primary foreign key is unsupported: ${childName}.${foreignKey.from}`);
      }
      for (const row of rows.get(childName) ?? []) {
        if (childDeletes.has(rowKey(row, childSchema.primaryKey))) continue;
        const foreignValue = row[foreignKey.from];
        if (foreignValue === null || foreignValue === undefined) continue;
        const parentKey = comparableValue(foreignValue);
        if (parentDeletes.has(parentKey)) {
          failures.push(`${childName}.${foreignKey.from}->${foreignKey.table}:${parentKey}`);
          if (failures.length >= 8) break;
        }
      }
      if (failures.length >= 8) break;
    }
    if (failures.length >= 8) break;
  }
  if (failures.length > 0) {
    throw new Error(`Retained rows reference deletable remote parents: ${failures.join("; ")}`);
  }
}

export async function readRemoteRows(
  client: Pick<Client, "execute">,
  schemas: Map<string, TableSchema>,
): Promise<Map<string, Row[]>> {
  const result = new Map<string, Row[]>();
  for (const [name, schema] of schemas) {
    const columns = schema.columns.map((column) => quoteIdentifier(column.name)).join(", ");
    result.set(name, (await client.execute(`SELECT ${columns} FROM ${quoteIdentifier(name)}`)).rows as Row[]);
  }
  return result;
}

function writeReport(reportPath: string | undefined, report: unknown): void {
  if (!reportPath) return;
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

async function deleteRows(
  client: Client,
  schemas: Map<string, TableSchema>,
  rows: Map<string, Row[]>,
  deletions: Map<string, Set<string>>,
): Promise<number> {
  let attempted = 0;
  const reverseOrder = topologicalOrder(schemas).reverse();
  for (const tableName of reverseOrder) {
    const deleteKeys = deletions.get(tableName) ?? new Set<string>();
    const schema = schemas.get(tableName);
    if (deleteKeys.size === 0) continue;
    if (!schema || schema.primaryKey.length !== 1) {
      throw new Error(`Exact remote deletion requires a single-column primary key: ${tableName}`);
    }
    const values = (rows.get(tableName) ?? [])
      .filter((row) => deleteKeys.has(rowKey(row, schema.primaryKey)))
      .map((row) => asSqlValue(row[schema.primaryKey[0]]));
    if (values.length === 0) continue;
    const sql = `DELETE FROM ${quoteIdentifier(tableName)} WHERE ${quoteIdentifier(schema.primaryKey[0])}=?`;
    // Link/review deletes run publication invalidation triggers.  Keep those
    // requests one statement at a time; other tables use bounded batches.
    const batchSize =
      tableName === "entity_links" || tableName === "entity_content_reviews"
        ? 1
        : DELETE_BATCH_SIZE;
    for (let offset = 0; offset < values.length; offset += batchSize) {
      const chunk = values.slice(offset, offset + batchSize);
      const statements: InStatement[] = chunk.map((key) => ({
        sql,
        args: [key] as InArgs,
      }));
      await client.batch(statements, "write");
      attempted += chunk.length;
      console.log(`Delete table ${tableName}: ${offset + 1}-${Math.min(offset + batchSize, values.length)}`);
    }
  }
  return attempted;
}

async function main(): Promise<void> {
  loadLocalEnv();
  const options = parseOptions();
  const sourceRoot = fs.realpathSync(options.sourceRoot);
  const backupRoot = fs.realpathSync(options.backupRoot);
  const sourcePath = fs.realpathSync(options.sourcePath);
  const backupPath = fs.realpathSync(options.backupPath);
  const protectedPath = fs.realpathSync(options.protectedCatalogPath);
  if (!isWithin(sourceRoot, sourcePath)) throw new Error("--source must remain inside --owned-root.");
  if (!isWithin(backupRoot, backupPath)) throw new Error("--backup must remain inside --backup-root.");
  if (fs.lstatSync(options.sourcePath).isSymbolicLink()) throw new Error("--source must not be a symlink.");
  if (fs.lstatSync(options.backupPath).isSymbolicLink()) throw new Error("--backup must not be a symlink.");
  if (!fs.statSync(sourcePath).isFile() || !fs.statSync(backupPath).isFile()) {
    throw new Error("--source and --backup must be regular files.");
  }
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
  const backup = decodeBackup(JSON.parse(fs.readFileSync(backupPath, "utf8")));
  if (backup.sourcePath !== sourcePath) {
    throw new Error(`Remote-only backup source mismatch: ${backup.sourcePath}`);
  }
  const database = new Database(sourcePath, { readonly: true });
  const localNames = localTableNames(database);
  const localSchemas = readLocalSchema(database, localNames);
  const localRows = new Map<string, Row[]>();
  for (const [name, schema] of localSchemas) {
    const columns = schema.columns.map((column) => quoteIdentifier(column.name)).join(", ");
    localRows.set(name, database.prepare(`SELECT ${columns} FROM ${quoteIdentifier(name)}`).all() as Row[]);
  }
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
    const { deletions, mappedPreserved, preservedHistory } = assertBackupMatchesCurrent(
      backup,
      localSchemas,
      localRows,
      remoteSchemas,
      remoteRows,
    );
    assertNoRetainedReferences(remoteSchemas, remoteRows, deletions);
    const deletionCounts = Object.fromEntries(
      [...deletions.entries()].filter(([, keys]) => keys.size > 0).map(([name, keys]) => [name, keys.size]),
    );
    const preservedCounts = Object.fromEntries(
      [...mappedPreserved.entries()].filter(([, count]) => count > 0),
    );
    const preservedHistoryCounts = Object.fromEntries(
      [...preservedHistory.entries()].filter(([, count]) => count > 0),
    );
    const totalDeletions = Object.values(deletionCounts).reduce((sum, count) => sum + count, 0);
    console.log(`Remote-only backup rows: ${backup.total}`);
    console.log(`Mapped remote rows preserved: ${Object.values(preservedCounts).reduce((sum, count) => sum + count, 0)}`);
    console.log(`Append-only history rows preserved: ${Object.values(preservedHistoryCounts).reduce((sum, count) => sum + count, 0)}`);
    console.log(`Exact stale rows ${options.apply ? "to delete" : "eligible for deletion"}: ${totalDeletions}`);
    for (const [name, count] of Object.entries(deletionCounts)) console.log(`  ${name}: ${count}`);
    const report: Record<string, unknown> = {
      checkedAt: new Date().toISOString(),
      mode: options.apply && options.acknowledgeRemoteDelete ? "apply" : "dry-run",
      sourcePath,
      sourceSha256: sourceSnapshot.main.sha256,
      protectedCatalogPath: protectedPath,
      protectedSha256Before: protectedSnapshot.main.sha256,
      backupPath,
      backupCreatedAt: backup.createdAt,
      backupTotal: backup.total,
      mappedPreserved: preservedCounts,
      preservedHistory: preservedHistoryCounts,
      deletionCounts,
      totalDeletions,
    };
    if (!options.apply) {
      writeReport(options.reportPath, report);
      console.log("Dry-run only. No remote deletes were performed.");
      return;
    }
    if (!options.acknowledgeRemoteDelete) {
      throw new Error("Remote deletes require both --apply and --ack-remote-delete.");
    }
    const deleted = await deleteRows(client, remoteSchemas, remoteRows, deletions);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    report.deletedStatements = deleted;
    report.protectedSha256After = snapshotCatalogFiles(protectedPath).main.sha256;
    writeReport(options.reportPath, report);
    console.log(`Remote exact delete statements issued: ${deleted}`);
    console.log("Protected local catalog snapshot unchanged.");
  } finally {
    client.close();
    database.close();
  }
}

if (process.argv.some((argument) => argument.endsWith("prune-turso-remote-only.ts"))) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
