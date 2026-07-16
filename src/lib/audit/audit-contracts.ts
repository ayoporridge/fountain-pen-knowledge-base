export type AuditEntityType = "brand" | "pen";

export type AuditSqlValue = string | number | bigint | Buffer | null;

/**
 * The real-catalog surface is intentionally smaller than either better-sqlite3
 * or libSQL. It can return rows and close its connection, but it cannot expose
 * write, transaction, pragma-mutation, or migration capabilities.
 */
export interface AuditReadClient {
  all<Row extends object = Record<string, unknown>>(
    sql: string,
    args?: readonly AuditSqlValue[],
  ): readonly Row[];
  get<Row extends object = Record<string, unknown>>(
    sql: string,
    args?: readonly AuditSqlValue[],
  ): Row | undefined;
  close(): void;
}

export interface AuditSchemaProvenance {
  sourceCatalogPath: string;
  sourceSchemaVersion: number | null;
  sourceMigrationNames: readonly string[];
  auditContractVersion: number;
  auditSchemaVersion: number | null;
}

export interface InventoryAuditRow {
  entityId: string;
  entityType: AuditEntityType;
  slug: string;
  name: string;
  publicationStatus: string;
  isPublic: boolean;
  blockerCodes: readonly string[];
  disposition: string;
}

export interface InventoryAuditSummary {
  totalRows: number;
  brandRows: number;
  penRows: number;
  publicRows: number;
  blockedRows: number;
  publishableRows: number;
  hasBlockers: boolean;
}

/**
 * `rows` is always the complete inventory. `consoleRows` is the only limited
 * projection, so a presentation limit cannot alter summary or exit semantics.
 */
export interface InventoryAuditResult {
  rows: readonly InventoryAuditRow[];
  consoleRows: readonly InventoryAuditRow[];
  consoleLimit: number | null;
  summary: InventoryAuditSummary;
  exitCode: 0 | 1;
  provenance: AuditSchemaProvenance;
}

export type CatalogFileKind = "main" | "wal" | "shm";

export interface CatalogFileSnapshot {
  kind: CatalogFileKind;
  path: string;
  realPath: string | null;
  exists: boolean;
  size: string | null;
  device: string | null;
  inode: string | null;
  mode: string | null;
  uid: string | null;
  gid: string | null;
  mtimeNs: string | null;
  ctimeNs: string | null;
  birthtimeNs: string | null;
  sha256: string | null;
}

export interface CatalogSnapshot {
  sourcePath: string;
  main: CatalogFileSnapshot;
  wal: CatalogFileSnapshot;
  shm: CatalogFileSnapshot;
}

export interface CatalogBackupResult {
  sourcePath: string;
  destinationPath: string;
  ownedRoot: string;
  totalPages: number;
  remainingPages: number;
  sourceSnapshotBefore: CatalogSnapshot;
  sourceSnapshotAfter: CatalogSnapshot;
}

export interface CatalogCheckpointedCopyResult {
  sourcePath: string;
  destinationPath: string;
  ownedRoot: string;
  sourceSnapshotBefore: CatalogSnapshot;
  sourceSnapshotAfter: CatalogSnapshot;
  destinationSnapshot: CatalogSnapshot;
}
