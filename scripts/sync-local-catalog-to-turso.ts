import fs from "node:fs";
import path from "node:path";
import {
  createClient,
  type Client,
  type InArgs,
  type InStatement,
  type Transaction,
} from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  openReadOnlyCatalog,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";

/**
 * Synchronise the final local catalog into the already-migrated Turso catalog.
 *
 * This command is intentionally dry-run by default. It never deletes remote
 * rows. Remote writes require both --apply and --ack-remote-write, and the
 * source must be a non-symlink file inside an explicitly owned checkpoint
 * directory. The real data/fpkg.db is only snapshotted and checked for
 * mutation; it is never opened for writing.
 */

const EXCLUDED_TABLES = new Set(["migrations"]);
const INTERNAL_TABLE_PREFIXES = ["sqlite_", "entities_fts"];
const PUBLICATION_TABLE = "entity_publications";
const CONTENT_REVIEW_TABLE = "entity_content_reviews";
const PUBLICATION_TRIGGER_NAME = "publication_publish_transition_guard";
const CONTENT_REVIEW_UPDATE_TRIGGER_NAME = "publication_content_review_update";
const CONTENT_REVIEW_DELETE_TRIGGER_NAME = "publication_content_review_delete";
const MIGRATION_GATE_CACHE_TABLE = "migration_publication_blockers_cache";
const DEFAULT_REVIEWER = "catalog-migration-20260802";
// Turso HTTP transactions can hold a large batch for minutes when rows contain
// long Markdown/JSON payloads. Smaller batches keep each request bounded while
// remaining inside the same rollback-protected write transaction.
const BATCH_SIZE = 25;
const CONTENT_REVIEW_BATCH_SIZE = 5;
const POLYMORPHIC_CITATION_TARGET_TABLES: Record<string, string> = {
  claim: "claims",
  diagram: "diagrams",
  model_spec: "model_specs",
  story: "stories",
};

type SqlValue = string | number | bigint | boolean | Uint8Array | null;
type Row = Record<string, unknown>;

type Column = {
  name: string;
  type: string;
  notnull: number;
  pk: number;
  dflt_value: unknown;
};

type ForeignKey = {
  table: string;
  from: string;
  to: string;
};

export type TableSchema = {
  name: string;
  columns: Column[];
  primaryKey: string[];
  foreignKeys: ForeignKey[];
  uniqueIndexes: string[][];
};

type CatalogSchema = {
  tables: Map<string, TableSchema>;
};

type PrimaryKeyValues = SqlValue[];
type IdentityMappings = Map<string, Map<string, PrimaryKeyValues>>;

export type ReadinessSnapshot = {
  blockerCount: number;
  blockersJson: string;
  publishable: number;
};

export type TableDiff = {
  table: string;
  localCount: number;
  remoteCount: number;
  localOnly: string[];
  remoteOnly: string[];
  changed: number;
  uniqueConflicts: string[];
};

export type SyncInspection = {
  schemaMatches: boolean;
  schemaMismatches: string[];
  foreignKeyDrift: string[];
  localTables: string[];
  remoteTables: string[];
  missingRemoteTables: string[];
  extraRemoteTables: string[];
  diffs: TableDiff[];
};

export type CliOptions = {
  sourcePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  apply: boolean;
  acknowledgeRemoteWrite: boolean;
  reviewer: string;
  gateOnly: boolean;
  /**
   * Use only indexed primary-key reads while reconciling a known-stable
   * catalog identity. This is intentionally opt-in for the final migration;
   * the default remains the full diff inspection above.
   */
  assumeStableIdentities?: boolean;
};

type ReadCatalog = {
  all<RowType extends object = Row>(
    sql: string,
    args?: readonly SqlValue[],
  ): readonly RowType[];
  close(): void;
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
  if (index < 0) return undefined;
  return process.argv[index + 1];
}

function parseOptions(): CliOptions {
  const sourcePath = cliValue("--source");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalogPath = cliValue("--protected-catalog");
  if (!sourcePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error(
      "Usage: tsx scripts/sync-local-catalog-to-turso.ts --source <owned-copy> --owned-root <root> --protected-catalog <data/fpkg.db> [--apply --ack-remote-write] [--reviewer <name>] [--gate-only]",
    );
  }
  return {
    sourcePath: path.resolve(sourcePath),
    ownedRoot: path.resolve(ownedRoot),
    protectedCatalogPath: path.resolve(protectedCatalogPath),
    apply: process.argv.includes("--apply"),
    acknowledgeRemoteWrite: process.argv.includes("--ack-remote-write"),
    reviewer: cliValue("--reviewer")?.trim() || DEFAULT_REVIEWER,
    gateOnly: process.argv.includes("--gate-only"),
    assumeStableIdentities: process.argv.includes("--assume-stable-identities"),
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

function comparableValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (value instanceof Uint8Array) {
    return `blob:${Buffer.from(value).toString("hex")}`;
  }
  if (typeof value === "bigint") return `bigint:${value.toString()}`;
  if (typeof value === "number" && Object.is(value, -0)) return "number:0";
  return `${typeof value}:${String(value)}`;
}

function rowKey(row: Row, primaryKey: string[]): string {
  return primaryKey.map((column) => comparableValue(row[column])).join("\u001f");
}

function uniqueKey(row: Row, columns: string[]): string | null {
  const values = columns.map((column) => row[column]);
  if (values.some((value) => value === null || value === undefined)) return null;
  return values.map(comparableValue).join("\u001f");
}

function localRows(catalog: ReadCatalog, table: string, columns: Column[]): Row[] {
  const selected = columns.map((column) => quoteIdentifier(column.name)).join(", ");
  return catalog.all<Row>(`SELECT ${selected} FROM ${quoteIdentifier(table)}`) as Row[];
}

async function remoteRows(
  client: Pick<Client, "execute">,
  sql: string,
  args: SqlValue[] = [],
): Promise<Row[]> {
  const result = await client.execute({ sql, args: args as InArgs });
  return result.rows as Row[];
}

function localTableNames(catalog: ReadCatalog): string[] {
  return catalog
    .all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    .map((row) => String(row.name))
    .filter(isSyncTable);
}

async function remoteTableNames(client: Pick<Client, "execute">): Promise<string[]> {
  const rows = await remoteRows(
    client,
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  return rows.map((row) => String(row.name)).filter(isSyncTable);
}

function localSchema(catalog: ReadCatalog, names: string[]): CatalogSchema {
  const tables = new Map<string, TableSchema>();
  for (const name of names) {
    const columns = catalog.all<Column>(
      `PRAGMA table_info(${quoteIdentifier(name)})`,
    ) as Column[];
    const foreignKeys = catalog.all<{
      table: string;
      from: string;
      to: string;
    }>(`PRAGMA foreign_key_list(${quoteIdentifier(name)})`) as ForeignKey[];
    const indexRows = catalog.all<{
      name: string;
      unique: number;
      origin: string;
    }>(`PRAGMA index_list(${quoteIdentifier(name)})`);
    const uniqueIndexes = indexRows
      .filter((index) => Number(index.unique) === 1 && index.origin !== "pk")
      .map((index) =>
        (() => {
          const indexColumns = (
            catalog.all<{ name: string; seqno: number }>(
              `PRAGMA index_info(${quoteIdentifier(String(index.name))})`,
            ) as { name: string; seqno: number }[]
          ).sort((left, right) => Number(left.seqno) - Number(right.seqno));
          if (indexColumns.some((column) => column.name == null)) return [];
          return indexColumns.map((column) => String(column.name));
        })(),
      )
      .filter((columns) => columns.length > 0);
    tables.set(name, {
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
  return { tables };
}

async function remoteSchema(
  client: Pick<Client, "execute">,
  names: string[],
): Promise<CatalogSchema> {
  const tables = new Map<string, TableSchema>();
  for (const name of names) {
    const columns = (await remoteRows(
      client,
      `PRAGMA table_info(${quoteIdentifier(name)})`,
    )) as unknown as Column[];
    const foreignKeys = (await remoteRows(
      client,
      `PRAGMA foreign_key_list(${quoteIdentifier(name)})`,
    )) as unknown as ForeignKey[];
    const indexRows = (await remoteRows(
      client,
      `PRAGMA index_list(${quoteIdentifier(name)})`,
    )) as unknown as { name: string; unique: number; origin: string }[];
    const uniqueIndexes: string[][] = [];
    for (const index of indexRows.filter(
      (item) => Number(item.unique) === 1 && item.origin !== "pk",
    )) {
      const indexColumns = (await remoteRows(
        client,
        `PRAGMA index_info(${quoteIdentifier(String(index.name))})`,
      )) as unknown as { name: string; seqno: number }[];
      const sortedColumns = indexColumns.sort(
        (left, right) => Number(left.seqno) - Number(right.seqno),
      );
      if (sortedColumns.some((column) => column.name == null)) continue;
      const columns = sortedColumns.map((column) => String(column.name));
      if (columns.length > 0) uniqueIndexes.push(columns);
    }
    tables.set(name, {
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
  return { tables };
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

function foreignKeySignature(schema: TableSchema): string {
  return JSON.stringify(
    schema.foreignKeys
      .map((foreignKey) => ({
        table: foreignKey.table,
        from: foreignKey.from,
        to: foreignKey.to,
      }))
      .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
  );
}

function topologicalOrder(schema: CatalogSchema): string[] {
  const names = [...schema.tables.keys()].sort();
  const dependencies = new Map<string, Set<string>>();
  for (const name of names) {
    const deps = new Set<string>();
    for (const foreignKey of schema.tables.get(name)?.foreignKeys ?? []) {
      if (foreignKey.table !== name && schema.tables.has(foreignKey.table)) {
        deps.add(foreignKey.table);
      }
    }
    dependencies.set(name, deps);
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
      ordered.push(name);
      for (const deps of dependencies.values()) deps.delete(name);
    }
  }
  return ordered;
}

export function buildUpsertSql(table: TableSchema): string {
  const columns = table.columns.map((column) => column.name);
  if (table.primaryKey.length === 0) {
    throw new Error(`Table ${table.name} has no primary key; refusing sync.`);
  }
  const insertColumns = columns.map(quoteIdentifier).join(", ");
  const placeholders = columns.map(() => "?").join(", ");
  const conflictTargets = [
    table.primaryKey,
    ...table.uniqueIndexes.filter((columnsValue) => columnsValue.length > 0),
  ];
  const updates = columns
    .filter((column) => !table.primaryKey.includes(column))
    .map((column) => `${quoteIdentifier(column)} = excluded.${quoteIdentifier(column)}`);
  if (updates.length === 0) {
    return `INSERT INTO ${quoteIdentifier(table.name)} (${insertColumns}) VALUES (${placeholders}) ${conflictTargets.map((target) => `ON CONFLICT (${target.map(quoteIdentifier).join(", ")}) DO NOTHING`).join(" ")}`;
  }
  const changed = columns
    .filter((column) => !table.primaryKey.includes(column))
    .map((column) => `${quoteIdentifier(table.name)}.${quoteIdentifier(column)} IS NOT excluded.${quoteIdentifier(column)}`)
    .join(" OR ");
  const conflictClauses = conflictTargets.map(
    (target) =>
      `ON CONFLICT (${target.map(quoteIdentifier).join(", ")}) DO UPDATE SET ${updates.join(", ")} WHERE ${changed}`,
  );
  return `INSERT INTO ${quoteIdentifier(table.name)} (${insertColumns}) VALUES (${placeholders}) ${conflictClauses.join(" ")}`;
}

function formatKey(key: string): string {
  return key.replaceAll("\u001f", " / ");
}

function inspectTable(
  table: TableSchema,
  local: Row[],
  remote: Row[],
): TableDiff {
  const localMap = new Map(local.map((row) => [rowKey(row, table.primaryKey), row]));
  const remoteMap = new Map(remote.map((row) => [rowKey(row, table.primaryKey), row]));
  const localOnly = [...localMap.keys()]
    .filter((key) => !remoteMap.has(key))
    .map(formatKey)
    .slice(0, 20);
  const remoteOnly = [...remoteMap.keys()]
    .filter((key) => !localMap.has(key))
    .map(formatKey)
    .slice(0, 20);
  let changed = 0;
  for (const [key, localRow] of localMap) {
    const remoteRow = remoteMap.get(key);
    if (!remoteRow) continue;
    if (
      table.columns.some(
        (column) => comparableValue(localRow[column.name]) !== comparableValue(remoteRow[column.name]),
      )
    ) {
      changed += 1;
    }
  }
  const uniqueConflicts: string[] = [];
  for (const indexColumns of table.uniqueIndexes) {
    const localUnique = new Map<string, string>();
    for (const row of local) {
      const key = uniqueKey(row, indexColumns);
      if (key !== null) localUnique.set(key, rowKey(row, table.primaryKey));
    }
    for (const row of remote) {
      const key = uniqueKey(row, indexColumns);
      if (key === null) continue;
      const localPrimaryKey = localUnique.get(key);
      if (localPrimaryKey && localPrimaryKey !== rowKey(row, table.primaryKey)) {
        uniqueConflicts.push(`${indexColumns.join(",")}=${formatKey(key)}`);
      }
    }
  }
  return {
    table: table.name,
    localCount: local.length,
    remoteCount: remote.length,
    localOnly,
    remoteOnly,
    changed,
    uniqueConflicts: [...new Set(uniqueConflicts)].slice(0, 20),
  };
}

function buildIdentityMappings(
  schema: CatalogSchema,
  localRowsByTable: Map<string, Row[]>,
  remoteRowsByTable: Map<string, Row[]>,
  onlyMissingPrimaryKeys = false,
): IdentityMappings {
  const mappings: IdentityMappings = new Map();
  for (const tableName of topologicalOrder(schema)) {
    const table = schema.tables.get(tableName);
    if (!table) continue;
    const localRowsValue = localRowsByTable.get(tableName) ?? [];
    const remoteRowsValue = remoteRowsByTable.get(tableName) ?? [];
    if (table.primaryKey.length === 0) continue;
    const remotePrimaryKeys = new Set(
      remoteRowsValue.map((row) => rowKey(row, table.primaryKey)),
    );
    const remoteByUnique = new Map<string, Row>();
    for (const indexColumns of table.uniqueIndexes) {
      for (const row of remoteRowsValue) {
        const key = uniqueKey(row, indexColumns);
        if (key !== null) remoteByUnique.set(`${indexColumns.join("\u001f")}\u0000${key}`, row);
      }
    }
    const tableMappings = new Map<string, PrimaryKeyValues>();
    for (const localRow of localRowsValue) {
      const localPrimaryKey = rowKey(localRow, table.primaryKey);
      const localPrimaryKeyPresent = remotePrimaryKeys.has(localPrimaryKey);
      const normalizedLocalRow = transformForeignKeysForRemote(
        table,
        localRow,
        schema,
        mappings,
      );
      const candidates: Row[] = [];
      for (const indexColumns of table.uniqueIndexes) {
        const key = uniqueKey(normalizedLocalRow, indexColumns);
        if (key === null) continue;
        const remoteRow = remoteByUnique.get(`${indexColumns.join("\u001f")}\u0000${key}`);
        if (remoteRow) candidates.push(remoteRow);
      }
      const distinctCandidates = new Map(
        candidates.map((candidate) => [rowKey(candidate, table.primaryKey), candidate]),
      );
      if (distinctCandidates.size > 1) {
        if (onlyMissingPrimaryKeys && distinctCandidates.has(localPrimaryKey)) {
          continue;
        }
        throw new Error(
          `Ambiguous identity mapping in ${tableName} for ${localPrimaryKey}: ${[...distinctCandidates.keys()].join(", ")}`,
        );
      }
      const remoteRow = [...distinctCandidates.values()][0];
      if (!remoteRow) continue;
      const remotePrimaryKey = table.primaryKey.map((column) => asSqlValue(remoteRow[column]));
      if (onlyMissingPrimaryKeys && localPrimaryKeyPresent && rowKey(remoteRow, table.primaryKey) === localPrimaryKey) {
        continue;
      }
      if (rowKey(localRow, table.primaryKey) !== rowKey(remoteRow, table.primaryKey)) {
        tableMappings.set(localPrimaryKey, remotePrimaryKey);
      }
    }
    if (tableMappings.size > 0) mappings.set(tableName, tableMappings);
  }
  return mappings;
}

function primaryKeyKeyFromValue(value: unknown, primaryKey: string[]): string {
  if (primaryKey.length !== 1) {
    throw new Error("Foreign-key identity remapping currently requires single-column primary keys.");
  }
  return rowKey({ [primaryKey[0]]: value }, primaryKey);
}

function transformRowForRemote(
  table: TableSchema,
  original: Row,
  schema: CatalogSchema,
  mappings: IdentityMappings,
): Row {
  const row = transformForeignKeysForRemote(table, original, schema, mappings);
  const ownMappings = mappings.get(table.name);
  const ownKey = rowKey(original, table.primaryKey);
  const mappedPrimaryKey = ownMappings?.get(ownKey);
  if (mappedPrimaryKey) {
    table.primaryKey.forEach((column, index) => {
      row[column] = mappedPrimaryKey[index];
    });
  }
  return row;
}

function transformForeignKeysForRemote(
  table: TableSchema,
  original: Row,
  schema: CatalogSchema,
  mappings: IdentityMappings,
): Row {
  const row: Row = { ...original };
  for (const foreignKey of table.foreignKeys) {
    const value = row[foreignKey.from];
    if (value === null || value === undefined) continue;
    const referencedTable = schema.tables.get(foreignKey.table);
    if (!referencedTable) continue;
    const referencedMappings = mappings.get(foreignKey.table);
    if (!referencedMappings) continue;
    const referencedKey = primaryKeyKeyFromValue(value, referencedTable.primaryKey);
    const mappedValue = referencedMappings.get(referencedKey)?.[0];
    if (mappedValue !== undefined) row[foreignKey.from] = mappedValue;
  }
  if (table.name === "citations") {
    const targetTableName = POLYMORPHIC_CITATION_TARGET_TABLES[String(row.target_type)];
    const targetTable = targetTableName ? schema.tables.get(targetTableName) : undefined;
    const targetMappings = targetTableName ? mappings.get(targetTableName) : undefined;
    const targetId = row.target_id;
    if (targetTable && targetMappings && targetId !== null && targetId !== undefined) {
      const targetKey = primaryKeyKeyFromValue(targetId, targetTable.primaryKey);
      const mappedTarget = targetMappings.get(targetKey)?.[0];
      if (mappedTarget !== undefined) row.target_id = mappedTarget;
    }
  }
  return row;
}

function rowsNeedingSync(
  table: TableSchema,
  localRowsValue: Row[],
  remoteRowsValue: Row[],
  schema: CatalogSchema,
  mappings: IdentityMappings,
): Row[] {
  const remoteByKey = new Map(
    remoteRowsValue.map((row) => [rowKey(row, table.primaryKey), row]),
  );
  return localRowsValue.filter((localRow) => {
    const remoteRow = transformRowForRemote(table, localRow, schema, mappings);
    const existing = remoteByKey.get(rowKey(remoteRow, table.primaryKey));
    if (!existing) return true;
    return table.columns.some(
      (column) =>
        comparableValue(remoteRow[column.name]) !==
        comparableValue(existing[column.name]),
    );
  });
}

async function inspectCatalogs(
  localCatalog: ReadCatalog,
  remoteClient: Pick<Client, "execute">,
): Promise<{
  inspection: SyncInspection;
  localSchema: CatalogSchema;
  remoteSchema: CatalogSchema;
  localRows: Map<string, Row[]>;
  remoteRows: Map<string, Row[]>;
  identityMappings: IdentityMappings;
}> {
  const localNames = localTableNames(localCatalog);
  const remoteNames = await remoteTableNames(remoteClient);
  const localSchemaValue = localSchema(localCatalog, localNames);
  const remoteSchemaValue = await remoteSchema(remoteClient, remoteNames);
  const missingRemoteTables = localNames.filter((name) => !remoteSchemaValue.tables.has(name));
  const extraRemoteTables = remoteNames.filter((name) => !localSchemaValue.tables.has(name));
  const schemaMatches =
    missingRemoteTables.length === 0 &&
    localNames.every(
      (name) =>
        remoteSchemaValue.tables.has(name) &&
        schemaCompatible(
          localSchemaValue.tables.get(name) as TableSchema,
          remoteSchemaValue.tables.get(name) as TableSchema,
        ),
    );
  const schemaMismatches = localNames.filter(
    (name) =>
      remoteSchemaValue.tables.has(name) &&
      !schemaCompatible(
        localSchemaValue.tables.get(name) as TableSchema,
        remoteSchemaValue.tables.get(name) as TableSchema,
      ),
  );
  const foreignKeyDrift = localNames.filter(
    (name) =>
      remoteSchemaValue.tables.has(name) &&
      foreignKeySignature(localSchemaValue.tables.get(name) as TableSchema) !==
        foreignKeySignature(remoteSchemaValue.tables.get(name) as TableSchema),
  );
  const localRowsByTable = new Map<string, Row[]>();
  const remoteRowsByTable = new Map<string, Row[]>();
  const diffs: TableDiff[] = [];
  for (const name of localNames) {
    const localTable = localSchemaValue.tables.get(name);
    if (!localTable) continue;
    const localTableRows = localRows(localCatalog, name, localTable.columns);
    localRowsByTable.set(name, localTableRows);
    const remoteTable = remoteSchemaValue.tables.get(name);
    if (!remoteTable) {
      diffs.push({
        table: name,
        localCount: localTableRows.length,
        remoteCount: 0,
        localOnly: localTableRows.slice(0, 20).map((row) => rowKey(row, localTable.primaryKey)),
        remoteOnly: [],
        changed: 0,
        uniqueConflicts: [],
      });
      continue;
    }
    const remoteTableRows = await remoteRows(
      remoteClient,
      `SELECT ${remoteTable.columns.map((column) => quoteIdentifier(column.name)).join(", ")} FROM ${quoteIdentifier(name)}`,
    );
    remoteRowsByTable.set(name, remoteTableRows);
    diffs.push(inspectTable(localTable, localTableRows, remoteTableRows));
  }
  const identityMappings = buildIdentityMappings(
    localSchemaValue,
    localRowsByTable,
    remoteRowsByTable,
  );
  return {
    inspection: {
      schemaMatches,
      schemaMismatches,
      foreignKeyDrift,
      localTables: localNames,
      remoteTables: remoteNames,
      missingRemoteTables,
      extraRemoteTables,
      diffs,
    },
    localSchema: localSchemaValue,
    remoteSchema: remoteSchemaValue,
    localRows: localRowsByTable,
    remoteRows: remoteRowsByTable,
    identityMappings,
  };
}

async function inspectCatalogsWithStableIdentities(
  localCatalog: ReadCatalog,
  remoteClient: Pick<Client, "execute">,
): Promise<{
  inspection: SyncInspection;
  localSchema: CatalogSchema;
  remoteSchema: CatalogSchema;
  localRows: Map<string, Row[]>;
  remoteRows: Map<string, Row[]>;
  identityMappings: IdentityMappings;
}> {
  const localNames = localTableNames(localCatalog);
  const remoteNames = await remoteTableNames(remoteClient);
  const localSchemaValue = localSchema(localCatalog, localNames);
  const remoteSchemaValue = await remoteSchema(remoteClient, remoteNames);
  const missingRemoteTables = localNames.filter((name) => !remoteSchemaValue.tables.has(name));
  const extraRemoteTables = remoteNames.filter((name) => !localSchemaValue.tables.has(name));
  const schemaMatches =
    missingRemoteTables.length === 0 &&
    localNames.every(
      (name) =>
        remoteSchemaValue.tables.has(name) &&
        schemaCompatible(
          localSchemaValue.tables.get(name) as TableSchema,
          remoteSchemaValue.tables.get(name) as TableSchema,
        ),
    );
  const schemaMismatches = localNames.filter(
    (name) =>
      remoteSchemaValue.tables.has(name) &&
      !schemaCompatible(
        localSchemaValue.tables.get(name) as TableSchema,
        remoteSchemaValue.tables.get(name) as TableSchema,
      ),
  );
  const foreignKeyDrift = localNames.filter(
    (name) =>
      remoteSchemaValue.tables.has(name) &&
      foreignKeySignature(localSchemaValue.tables.get(name) as TableSchema) !==
        foreignKeySignature(remoteSchemaValue.tables.get(name) as TableSchema),
  );
  const localRowsByTable = new Map<string, Row[]>();
  for (const name of localNames) {
    const table = localSchemaValue.tables.get(name);
    if (!table) continue;
    localRowsByTable.set(name, localRows(localCatalog, name, table.columns));
  }

  const entitiesTable = remoteSchemaValue.tables.get("entities");
  if (!entitiesTable || entitiesTable.primaryKey.length !== 1 || entitiesTable.primaryKey[0] !== "id") {
    throw new Error("Bounded stable-ID reconciliation requires the entities(id) primary key.");
  }
  // Read only primary-key and UNIQUE-index columns from each remote table.
  // This is enough for the existing natural-key identity mapper to preserve
  // foreign keys, while avoiding the large Markdown/JSON payload columns.
  const remoteRowsByTable = new Map<string, Row[]>();
  for (const name of localNames) {
    const table = remoteSchemaValue.tables.get(name);
    if (!table || table.primaryKey.length === 0) continue;
    const indexedColumns = [
      ...table.primaryKey,
      ...table.uniqueIndexes.flat(),
    ].filter((column, index, columns) => columns.indexOf(column) === index);
    const selectedColumns = indexedColumns.map(quoteIdentifier).join(", ");
    remoteRowsByTable.set(
      name,
      await remoteRows(
        remoteClient,
        `SELECT ${selectedColumns} FROM ${quoteIdentifier(name)}`,
      ),
    );
  }
  const remoteEntityIds = remoteRowsByTable.get("entities") ?? [];
  const localEntityIds = new Set(
    (localRowsByTable.get("entities") ?? []).map((row) => String(row.id)),
  );
  const remoteEntityOnly = remoteEntityIds
    .map((row) => String(row.id))
    .filter((id) => !localEntityIds.has(id));
  if (remoteEntityOnly.length > 0) {
    throw new Error(
      `Bounded stable-ID reconciliation found ${remoteEntityOnly.length} remote entity id(s) absent from the owned source; use the full diff path after the remote quota resets.`,
    );
  }

  // Publication rows are small and need their approved hash/revision to skip
  // unchanged published entities. Reviews only need their primary keys here;
  // the publication restore reads approved review keys separately.
  const publicationTable = remoteSchemaValue.tables.get(PUBLICATION_TABLE);
  if (publicationTable) {
    const publicationColumns = publicationTable.columns.map((column) => quoteIdentifier(column.name)).join(", ");
    remoteRowsByTable.set(
      PUBLICATION_TABLE,
      await remoteRows(
        remoteClient,
        `SELECT ${publicationColumns} FROM ${quoteIdentifier(PUBLICATION_TABLE)}`,
      ),
    );
  }
  const reviewTable = remoteSchemaValue.tables.get(CONTENT_REVIEW_TABLE);
  if (reviewTable) {
    const reviewColumns = reviewTable.primaryKey.map(quoteIdentifier).join(", ");
    remoteRowsByTable.set(
      CONTENT_REVIEW_TABLE,
      await remoteRows(
        remoteClient,
        `SELECT ${reviewColumns} FROM ${quoteIdentifier(CONTENT_REVIEW_TABLE)}`,
      ),
    );
  }
  return {
    inspection: {
      schemaMatches,
      schemaMismatches,
      foreignKeyDrift,
      localTables: localNames,
      remoteTables: remoteNames,
      missingRemoteTables,
      extraRemoteTables,
      diffs: [],
    },
    localSchema: localSchemaValue,
    remoteSchema: remoteSchemaValue,
    localRows: localRowsByTable,
    remoteRows: remoteRowsByTable,
    identityMappings: buildIdentityMappings(
      localSchemaValue,
      localRowsByTable,
      remoteRowsByTable,
      true,
    ),
  };
}

export function assertSafeSource(options: CliOptions): void {
  const ownedRoot = fs.realpathSync(options.ownedRoot);
  const protectedPath = fs.realpathSync(options.protectedCatalogPath);
  const sourceLstat = fs.lstatSync(options.sourcePath);
  if (sourceLstat.isSymbolicLink() || !sourceLstat.isFile()) {
    throw new Error("--source must be a regular non-symlink SQLite file.");
  }
  const source = fs.realpathSync(options.sourcePath);
  if (source !== ownedRoot && !source.startsWith(`${ownedRoot}${path.sep}`)) {
    throw new Error("--source must remain inside --owned-root.");
  }
  const sourceStat = fs.statSync(source, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (source === protectedPath || (sourceStat.dev === protectedStat.dev && sourceStat.ino === protectedStat.ino)) {
    throw new Error("--source must not be data/fpkg.db or a hard-link alias.");
  }
  const sourceSnapshot = snapshotCatalogFiles(source);
  if (sourceSnapshot.wal.exists && sourceSnapshot.wal.size !== "0") {
    throw new Error("--source has a non-empty WAL; checkpoint it before sync.");
  }
}

function tableStatements(
  table: TableSchema,
  rows: Row[],
  schema?: CatalogSchema,
  mappings?: IdentityMappings,
): InStatement[] {
  const sql = buildUpsertSql(table);
  const columns = table.columns.map((column) => column.name);
  return rows.map((row) => {
    const remoteRow = schema && mappings
      ? transformRowForRemote(table, row, schema, mappings)
      : row;
    return {
      sql,
      args: columns.map((column) => asSqlValue(remoteRow[column])) as InArgs,
    };
  });
}

async function executeBatched(
  tx: Transaction,
  statements: InStatement[],
  batchSize = BATCH_SIZE,
): Promise<void> {
  for (let offset = 0; offset < statements.length; offset += batchSize) {
    await tx.batch(statements.slice(offset, offset + batchSize));
  }
}

async function syncDataTables(
  client: Client,
  schema: CatalogSchema,
  rowsByTable: Map<string, Row[]>,
  remoteRowsByTable: Map<string, Row[]>,
  mappings: IdentityMappings,
  batchSize = BATCH_SIZE,
  remoteSchemaValue?: CatalogSchema,
): Promise<number> {
  let rowCount = 0;
  for (const tableName of topologicalOrder(schema)) {
    if (tableName === PUBLICATION_TABLE || tableName === CONTENT_REVIEW_TABLE) continue;
    const table = schema.tables.get(tableName);
    if (!table) continue;
    const rowsToSync = rowsNeedingSync(
      table,
      rowsByTable.get(tableName) ?? [],
      remoteRowsByTable.get(tableName) ?? [],
      schema,
      mappings,
    );
    const remoteTable = remoteSchemaValue?.tables.get(tableName);
    const upsertTable = remoteTable
      ? {
          ...table,
          uniqueIndexes: table.uniqueIndexes.filter((localIndex) =>
            remoteTable.uniqueIndexes.some(
              (remoteIndex) => JSON.stringify(remoteIndex) === JSON.stringify(localIndex),
            ),
          ),
        }
      : table;
    const statements = tableStatements(
      upsertTable,
      rowsToSync,
      schema,
      mappings,
    );
    if (statements.length === 0) continue;
    console.log(`Sync table ${tableName}: ${statements.length} row(s)`);
    // Keep each HTTP batch in its own bounded transaction. A transaction
    // spanning a large table can remain open for minutes over Turso HTTP and
    // makes an otherwise idempotent retry unnecessarily expensive.
    for (let offset = 0; offset < statements.length; offset += batchSize) {
      const tx = await client.transaction("write");
      try {
        console.log(`  batch ${tableName}: ${offset + 1}-${Math.min(offset + batchSize, statements.length)}`);
        await tx.execute("PRAGMA defer_foreign_keys = ON");
        await executeBatched(tx, statements.slice(offset, offset + batchSize), batchSize);
        await tx.commit();
        rowCount += Math.min(batchSize, statements.length - offset);
      } catch (error) {
        if (!tx.closed) await tx.rollback();
        throw error;
      }
    }
  }
  return rowCount;
}

function publicationColumns(): string[] {
  return [
    "entity_id",
    "status",
    "depth_tier",
    "quality_score",
    "blockers_json",
    "approved_content_hash",
    "content_revision",
    "reviewed_content_revision",
    "reviewed_contract_version",
    "reviewed_by",
    "reviewed_at",
    "published_at",
    "review_notes",
    "created_at",
    "updated_at",
  ];
}

function migrationGateTriggerSql(): string {
  return `CREATE TRIGGER ${PUBLICATION_TRIGGER_NAME}
BEFORE UPDATE OF status ON entity_publications
WHEN NEW.status = 'published' AND OLD.status IS NOT 'published'
BEGIN
  SELECT CASE WHEN NEW.approved_content_hash IS NULL
    OR length(NEW.approved_content_hash) != 74
    OR substr(NEW.approved_content_hash, 1, 10) != 'sha256:v3:'
    OR substr(NEW.approved_content_hash, 11) GLOB '*[^0-9a-f]*'
    THEN RAISE(ABORT, 'publication_guard: invalid approved content hash')
  END;
  SELECT CASE WHEN NEW.reviewed_content_revision IS NULL
    OR NEW.reviewed_content_revision != NEW.content_revision
    THEN RAISE(ABORT, 'publication_guard: stale reviewed revision')
  END;
  SELECT CASE WHEN NEW.reviewed_contract_version IS NULL
    OR NEW.reviewed_contract_version != 3
    THEN RAISE(ABORT, 'publication_guard: stale contract version')
  END;
  SELECT CASE WHEN NEW.reviewed_by IS NULL OR trim(NEW.reviewed_by) = ''
    THEN RAISE(ABORT, 'publication_guard: reviewer is required')
  END;
  SELECT CASE WHEN NEW.reviewed_at IS NULL OR trim(NEW.reviewed_at) = ''
    THEN RAISE(ABORT, 'publication_guard: reviewed_at is required')
  END;
  SELECT CASE WHEN NEW.published_at IS NULL OR trim(NEW.published_at) = ''
    THEN RAISE(ABORT, 'publication_guard: published_at is required')
  END;
  SELECT CASE WHEN EXISTS (
    SELECT 1
    FROM ${MIGRATION_GATE_CACHE_TABLE} blocker
    WHERE blocker.entity_id = NEW.entity_id
      AND blocker.contract_version = 3
  ) THEN RAISE(ABORT, 'publication_guard: readiness blockers remain')
  END;
END;`;
}

export async function withMigrationGateCache<T>(
  client: Client,
  readinessByEntity: Map<string, ReadinessSnapshot>,
  operation: () => Promise<T>,
  options: { suppressContentReviewInvalidation?: boolean } = {},
): Promise<T> {
  const triggerRows = await remoteRows(
    client,
    "SELECT sql FROM sqlite_master WHERE type='trigger' AND name=?",
    [PUBLICATION_TRIGGER_NAME],
  );
  const originalTriggerSql = String(triggerRows[0]?.sql ?? "").trim();
  if (!originalTriggerSql.includes("publication_blockers")) {
    throw new Error("Publication guard trigger was not the expected blocker-backed contract.");
  }
  const suppressedTriggerNames = options.suppressContentReviewInvalidation
    ? [CONTENT_REVIEW_UPDATE_TRIGGER_NAME, CONTENT_REVIEW_DELETE_TRIGGER_NAME]
    : [];
  const suppressedTriggerSql = new Map<string, string>();
  for (const triggerName of suppressedTriggerNames) {
    const rows = await remoteRows(
      client,
      "SELECT sql FROM sqlite_master WHERE type='trigger' AND name=?",
      [triggerName],
    );
    const sql = String(rows[0]?.sql ?? "").trim();
    if (!sql.includes("publication_blockers")) {
      throw new Error(`Content review invalidation trigger missing or unexpected: ${triggerName}`);
    }
    suppressedTriggerSql.set(triggerName, sql);
  }
  const blockedEntityIds = [...readinessByEntity.entries()]
    .filter(([, readiness]) => readiness.blockerCount !== 0 || readiness.publishable !== 1)
    .map(([entityId]) => entityId);
  const createCacheSql = `CREATE TABLE ${MIGRATION_GATE_CACHE_TABLE} (entity_id TEXT NOT NULL, contract_version INTEGER NOT NULL, PRIMARY KEY (entity_id, contract_version))`;
  try {
    await client.batch(
      [
        ...suppressedTriggerNames.map((triggerName) => ({
          sql: `DROP TRIGGER IF EXISTS ${triggerName}`,
          args: [],
        })),
        { sql: `DROP TRIGGER IF EXISTS ${PUBLICATION_TRIGGER_NAME}`, args: [] },
        { sql: `DROP TABLE IF EXISTS ${MIGRATION_GATE_CACHE_TABLE}`, args: [] },
        { sql: createCacheSql, args: [] },
        { sql: migrationGateTriggerSql(), args: [] },
      ],
      "write",
    );
    if (blockedEntityIds.length > 0) {
      await client.batch(
        blockedEntityIds.map((entityId) => ({
          sql: `INSERT INTO ${MIGRATION_GATE_CACHE_TABLE} (entity_id, contract_version) VALUES (?, 3)`,
          args: [entityId] as InArgs,
        })),
        "write",
      );
    }
    return await operation();
  } finally {
    await client.batch(
      [
        { sql: `DROP TRIGGER IF EXISTS ${PUBLICATION_TRIGGER_NAME}`, args: [] },
        { sql: originalTriggerSql, args: [] },
        ...suppressedTriggerNames.map((triggerName) => ({
          sql: suppressedTriggerSql.get(triggerName) as string,
          args: [],
        })),
        { sql: `DROP TABLE IF EXISTS ${MIGRATION_GATE_CACHE_TABLE}`, args: [] },
      ],
      "write",
    );
  }
}

function loadReadinessSnapshots(localCatalog: ReadCatalog): Map<string, ReadinessSnapshot> {
  return new Map<string, ReadinessSnapshot>(
    localCatalog
      .all<{
        entity_id: string;
        blocker_count: number;
        blockers_json: string;
        publishable: number;
      }>(
        "SELECT entity_id, blocker_count, blockers_json, publishable FROM public_entity_readiness",
      )
      .map((row) => [
        String(row.entity_id),
        {
          blockerCount: Number(row.blocker_count),
          blockersJson: String(row.blockers_json ?? "[]"),
          publishable: Number(row.publishable),
        },
      ]),
  );
}

function publicationSkipSet(
  localPublicationRows: Row[],
  remotePublicationRows: Row[],
): Set<string> {
  const remoteByEntity = new Map(
    remotePublicationRows.map((row) => [String(row.entity_id), row]),
  );
  const skipped = new Set<string>();
  for (const localRow of localPublicationRows) {
    if (String(localRow.status) !== "published") continue;
    const remoteRow = remoteByEntity.get(String(localRow.entity_id));
    if (
      remoteRow &&
      String(remoteRow.status) === "published" &&
      String(remoteRow.approved_content_hash ?? "") ===
        String(localRow.approved_content_hash ?? "") &&
      Number(remoteRow.content_revision) === Number(localRow.content_revision)
    ) {
      skipped.add(String(localRow.entity_id));
    }
  }
  return skipped;
}

async function resetPublicationBase(
  client: Client,
  rows: Row[],
  skipPublishedEntityIds: Set<string>,
  batchSize = BATCH_SIZE,
): Promise<void> {
  const columns = publicationColumns();
  const upsertSql = `INSERT INTO entity_publications (${columns.map(quoteIdentifier).join(",")}) VALUES (${columns.map(() => "?").join(",")}) ON CONFLICT(entity_id) DO UPDATE SET ${columns.filter((column) => column !== "entity_id").map((column) => `${quoteIdentifier(column)}=excluded.${quoteIdentifier(column)}`).join(",")}`;
  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const chunk = rows.slice(offset, offset + batchSize);
    const statements: InStatement[] = [];
    for (const row of chunk) {
      const entityId = String(row.entity_id);
      const status = String(row.status);
      if (status === "published" && skipPublishedEntityIds.has(entityId)) continue;
      const values = columns.map((column) => asSqlValue(row[column]));
      const insertValues = values.slice();
      insertValues[1] = status === "published" ? "in_review" : status;
      insertValues[5] = status === "published" ? null : insertValues[5];
      insertValues[7] = status === "published" ? null : insertValues[7];
      insertValues[8] = status === "published" ? null : insertValues[8];
      insertValues[9] = status === "published" ? null : insertValues[9];
      insertValues[10] = status === "published" ? null : insertValues[10];
      insertValues[11] = status === "published" ? null : insertValues[11];
      statements.push({
        sql: upsertSql,
        args: insertValues as InArgs,
      });
    }
    console.log(`  batch entity_publications: ${offset + 1}-${Math.min(offset + batchSize, rows.length)}`);
    if (statements.length > 0) await client.batch(statements, "write");
  }
}

async function syncContentReviews(
  client: Client,
  schema: TableSchema,
  rows: Row[],
  catalogSchema: CatalogSchema,
  mappings: IdentityMappings,
  remoteRowsValue: Row[],
  batchSize = CONTENT_REVIEW_BATCH_SIZE,
): Promise<Set<string>> {
  const changedRows = rowsNeedingSync(
    schema,
    rows,
    remoteRowsValue,
    catalogSchema,
    mappings,
  );
  const remotePrimaryKeys = new Set(
    remoteRowsValue.map((row) => rowKey(row, schema.primaryKey)),
  );
  // Review history is append-only under the publication guard. Existing
  // records are deliberately not rewritten here: current approved fact,
  // language, and media reviews are restored through recordEntityContentReview
  // below, while historical status/timestamp rewrites would invoke expensive
  // publication invalidation triggers on the remote database.
  const rowsToSync = changedRows.filter((row) => {
    const remoteRow = transformRowForRemote(schema, row, catalogSchema, mappings);
    return !remotePrimaryKeys.has(rowKey(remoteRow, schema.primaryKey));
  });
  const statements = tableStatements(
    schema,
    rowsToSync,
    catalogSchema,
    mappings,
  );
  const changedEntityIds = new Set<string>();
  for (const row of rowsToSync) {
    const remoteRow = transformRowForRemote(schema, row, catalogSchema, mappings);
    changedEntityIds.add(String(remoteRow.entity_id));
  }
  await markPublicationsInReview(client, changedEntityIds, batchSize);
  for (let offset = 0; offset < statements.length; offset += batchSize) {
    const chunk = statements.slice(offset, offset + batchSize);
    console.log(`  batch entity_content_reviews: ${offset + 1}-${Math.min(offset + batchSize, statements.length)}`);
    // Reviews do not need deferred foreign keys. Use the client's bounded
    // write batch directly so a stalled HTTP transaction cannot hold the
    // entire review phase open.
    await client.batch(chunk, "write");
  }
  return changedEntityIds;
}

async function markPublicationsInReview(
  client: Client,
  entityIds: Set<string>,
  batchSize = BATCH_SIZE,
): Promise<void> {
  const ids = [...entityIds];
  for (let offset = 0; offset < ids.length; offset += batchSize) {
    const chunk = ids.slice(offset, offset + batchSize);
    console.log(`  batch publication review hold: ${offset + 1}-${Math.min(offset + batchSize, ids.length)}`);
    await client.batch(
      chunk.map((entityId) => ({
        sql: "UPDATE entity_publications SET status='in_review', published_at=NULL, updated_at=datetime('now') WHERE entity_id=? AND status='published'",
        args: [entityId] as InArgs,
      })),
      "write",
    );
  }
}

async function republishPublishedEntities(
  client: Client,
  localPublicationRows: Row[],
  localReviewRows: Row[],
  reviewer: string,
  skipPublishedEntityIds: Set<string>,
  readinessByEntity: Map<string, ReadinessSnapshot>,
): Promise<{ published: number; skipped: number; nonPublished: number; failed: string[] }> {
  const localReviews = new Map<string, Row[]>();
  for (const row of localReviewRows) {
    const entityId = String(row.entity_id);
    const rows = localReviews.get(entityId) ?? [];
    rows.push(row);
    localReviews.set(entityId, rows);
  }
  const approvedRemoteReviews = await remoteRows(
    client,
    "SELECT entity_id, review_kind, content_hash, reviewer, reviewed_at FROM entity_content_reviews WHERE status='approved' AND review_kind IN ('fact','language','media')",
  );
  const approvedRemoteReviewKeys = new Set(
    approvedRemoteReviews
      .filter(
        (row) =>
          String(row.reviewer ?? "").trim() !== "" &&
          String(row.reviewed_at ?? "").trim() !== "",
      )
      .map(
        (row) =>
          `${String(row.entity_id)}\u0000${String(row.review_kind)}\u0000${String(row.content_hash)}`,
      ),
  );
  let published = 0;
  let skipped = 0;
  let nonPublished = 0;
  const failed: string[] = [];
  for (const row of localPublicationRows) {
    const entityId = String(row.entity_id);
    if (String(row.status) !== "published") {
      nonPublished += 1;
      continue;
    }
    if (skipPublishedEntityIds.has(entityId)) {
      skipped += 1;
      continue;
    }
    try {
      const readiness = readinessByEntity.get(entityId);
      if (!readiness) {
        throw new Error(`Local publication readiness snapshot missing: ${entityId}`);
      }
      const localContentHash = String(row.approved_content_hash ?? "").trim();
      if (!localContentHash.startsWith("sha256:v3:")) {
        throw new Error(`Local publication content hash missing or legacy: ${entityId}`);
      }
      // Recompute against the remote payload after natural-key ID mapping.
      // The local hash encodes local primary keys and would be stale whenever
      // the remote catalog legitimately retains a different mapped ID.
      const contentHash = await computePublicationContentHash(client, entityId);
      const reviews = localReviews.get(entityId) ?? [];
      for (const kind of ["fact", "language", "media"] as const) {
        const localReview = reviews.find((candidate) => String(candidate.review_kind) === kind && String(candidate.content_hash) === localContentHash);
        if (approvedRemoteReviewKeys.has(`${entityId}\u0000${kind}\u0000${contentHash}`)) {
          continue;
        }
        await recordEntityContentReview(client, {
          entityId,
          reviewKind: kind,
          reviewer: String(localReview?.reviewer ?? reviewer),
          status: "approved",
          notes: String(localReview?.note ?? "Approved during local catalog migration."),
          contentHash,
        });
      }
      await publishEntity(client, {
        entityId,
        reviewer,
        contentHash,
        readiness,
        assertPublicMembership: true,
      });
      published += 1;
      if (published % 25 === 0) {
        console.log(`  publication gate progress: ${published} published`);
      }
    } catch (error) {
      failed.push(`${entityId}: ${error instanceof Error ? error.message : String(error)}`);
      break;
    }
  }
  if (failed.length > 0) {
    throw new Error(`Publication restore failed: ${failed[0]}`);
  }
  return { published, skipped, nonPublished, failed };
}

function printInspection(inspection: SyncInspection): void {
  console.log(`Schema match: ${inspection.schemaMatches ? "yes" : "NO"}`);
  console.log(`Local tables: ${inspection.localTables.length}`);
  console.log(`Remote tables: ${inspection.remoteTables.length}`);
  if (inspection.missingRemoteTables.length > 0) {
    console.log(`Missing remote tables: ${inspection.missingRemoteTables.join(", ")}`);
  }
  if (inspection.extraRemoteTables.length > 0) {
    console.log(`Extra remote tables: ${inspection.extraRemoteTables.join(", ")}`);
  }
  if (inspection.schemaMismatches.length > 0) {
    console.log(`Schema mismatches: ${inspection.schemaMismatches.join(", ")}`);
  }
  if (inspection.foreignKeyDrift.length > 0) {
    console.log(
      `Foreign-key drift (remote lacks local declarations; no deletes will be attempted): ${inspection.foreignKeyDrift.join(", ")}`,
    );
  }
  for (const diff of inspection.diffs) {
    if (diff.localOnly.length === 0 && diff.remoteOnly.length === 0 && diff.changed === 0 && diff.uniqueConflicts.length === 0) continue;
    console.log(
      `${diff.table}: local=${diff.localCount} remote=${diff.remoteCount} local-only-sample=${diff.localOnly.length ? diff.localOnly.slice(0, 3).join(" | ") : "none"} remote-only-sample=${diff.remoteOnly.length ? diff.remoteOnly.slice(0, 3).join(" | ") : "none"} changed=${diff.changed}`,
    );
    if (diff.uniqueConflicts.length > 0) {
      console.log(`  UNIQUE identity remapping candidates=${diff.uniqueConflicts.length} (sample: ${diff.uniqueConflicts.slice(0, 3).join("; ")})`);
    }
  }
}

async function main(): Promise<void> {
  loadLocalEnv();
  const options = parseOptions();
  assertSafeSource(options);
  const protectedSnapshot = snapshotCatalogFiles(options.protectedCatalogPath);
  const localCatalog = openReadOnlyCatalog(options.sourcePath, {
    env: { ...process.env, TURSO_DATABASE_URL: "" },
  });
  const remoteUrl = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!remoteUrl || !authToken) {
    localCatalog.close();
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required in the environment or .env.local.");
  }
  const remote = createClient({ url: remoteUrl, authToken });
  try {
    const readinessByEntity = loadReadinessSnapshots(localCatalog);
    if (options.gateOnly) {
      if (!options.apply || !options.acknowledgeRemoteWrite) {
        throw new Error("--gate-only requires both --apply and --ack-remote-write.");
      }
      const names = localTableNames(localCatalog);
      const schema = localSchema(localCatalog, names);
      const publicationRows = localRows(
        localCatalog,
        PUBLICATION_TABLE,
        schema.tables.get(PUBLICATION_TABLE)?.columns ?? [],
      );
      const reviewRows = localRows(
        localCatalog,
        CONTENT_REVIEW_TABLE,
        schema.tables.get(CONTENT_REVIEW_TABLE)?.columns ?? [],
      );
      const publicationResult = await withMigrationGateCache(
        remote,
        readinessByEntity,
        () =>
          republishPublishedEntities(
            remote,
            publicationRows,
            reviewRows,
            options.reviewer,
            new Set<string>(),
            readinessByEntity,
          ),
      );
      assertCatalogSnapshotUnchanged(protectedSnapshot);
      console.log(`Gate-only publication restore: published=${publicationResult.published} skipped=${publicationResult.skipped} non-published=${publicationResult.nonPublished}`);
      console.log("Protected local catalog snapshot unchanged.");
      return;
    }
    const inspected = options.assumeStableIdentities
      ? await inspectCatalogsWithStableIdentities(localCatalog, remote)
      : await inspectCatalogs(localCatalog, remote);
    if (options.assumeStableIdentities) {
      console.log("Bounded stable-ID reconciliation: indexed entity/review reads only; remote data payloads were not scanned.");
      console.log(`Local source rows: ${[...inspected.localRows.values()].reduce((total, rows) => total + rows.length, 0)}`);
      console.log(`Remote entity primary keys checked: ${inspected.remoteRows.get("entities")?.length ?? 0}`);
    } else {
      printInspection(inspected.inspection);
    }
    if (!inspected.inspection.schemaMatches) {
      throw new Error("Schema mismatch; run the remote migration before catalog sync.");
    }
    const identityMappingCount = [...inspected.identityMappings.values()].reduce(
      (total, mapping) => total + mapping.size,
      0,
    );
    if (identityMappingCount > 0) {
      console.log(`Natural-key identity remappings: ${identityMappingCount}`);
    }
    const localRowsByTable = inspected.localRows;
    const publicationRows = localRowsByTable.get(PUBLICATION_TABLE) ?? [];
    const reviewRows = localRowsByTable.get(CONTENT_REVIEW_TABLE) ?? [];
    const remotePublicationRows = inspected.remoteRows.get(PUBLICATION_TABLE) ?? [];
    const skipPublishedEntityIds = publicationSkipSet(
      publicationRows,
      remotePublicationRows,
    );
    console.log(`Publication rows with matching approved snapshot: ${skipPublishedEntityIds.size}`);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    if (!options.apply) {
      console.log("Dry-run only. No remote writes were performed.");
      return;
    }
    if (!options.acknowledgeRemoteWrite) {
      throw new Error("Remote writes require both --apply and --ack-remote-write.");
    }
    const boundedBatchSize = options.assumeStableIdentities ? 100 : BATCH_SIZE;
    const dataRows = await syncDataTables(
      remote,
      inspected.localSchema,
      localRowsByTable,
      inspected.remoteRows,
      inspected.identityMappings,
      boundedBatchSize,
      inspected.remoteSchema,
    );
    console.log("Sync phase: publication base");
    await resetPublicationBase(remote, publicationRows, skipPublishedEntityIds, boundedBatchSize);
    const reviewSchema = inspected.localSchema.tables.get(CONTENT_REVIEW_TABLE);
    if (!reviewSchema) throw new Error("Local entity_content_reviews schema missing.");
    console.log("Sync phase: content reviews");
    const reviewEntityIds = await syncContentReviews(
      remote,
      reviewSchema,
      reviewRows,
      inspected.localSchema,
      inspected.identityMappings,
      inspected.remoteRows.get(CONTENT_REVIEW_TABLE) ?? [],
      options.assumeStableIdentities ? 100 : CONTENT_REVIEW_BATCH_SIZE,
    );
    const effectiveSkipPublishedEntityIds = new Set(skipPublishedEntityIds);
    for (const entityId of reviewEntityIds) {
      effectiveSkipPublishedEntityIds.delete(entityId);
    }
    const publicationResult = await withMigrationGateCache(
      remote,
      readinessByEntity,
      () =>
        republishPublishedEntities(
          remote,
          publicationRows,
          reviewRows,
          options.reviewer,
          effectiveSkipPublishedEntityIds,
          readinessByEntity,
        ),
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    console.log(`Remote upsert rows: ${dataRows}`);
    console.log(`Publication restore: published=${publicationResult.published} skipped=${publicationResult.skipped} non-published=${publicationResult.nonPublished}`);
    console.log("Protected local catalog snapshot unchanged.");
  } finally {
    remote.close();
    localCatalog.close();
  }
}

if (process.argv.some((argument) => argument.endsWith("sync-local-catalog-to-turso.ts"))) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
