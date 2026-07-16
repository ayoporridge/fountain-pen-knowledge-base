import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type {
  AuditReadClient,
  AuditSqlValue,
  CatalogBackupResult,
  CatalogFileKind,
  CatalogFileSnapshot,
  CatalogSnapshot,
} from "./audit-contracts";

export type OpenReadOnlyCatalogOptions = {
  env?: NodeJS.ProcessEnv;
};

type OpenCatalogState = {
  database: Database.Database;
  sourcePath: string;
  sourceSnapshotAtOpen: CatalogSnapshot;
  closed: boolean;
};

const openCatalogs = new WeakMap<AuditReadClient, OpenCatalogState>();
const REMOTE_DATABASE_URL = /^[a-z][a-z\d+.-]*:\/\//i;

function assertFilesystemPath(inputPath: string): void {
  if (REMOTE_DATABASE_URL.test(inputPath)) {
    throw new Error(
      "Audit catalog path rejected: remote database URLs are forbidden.",
    );
  }
  if (!path.isAbsolute(inputPath)) {
    throw new Error(
      "Audit catalog path must be an explicit absolute local filesystem path.",
    );
  }
}

function canonicalizePotentialPath(inputPath: string): string {
  assertFilesystemPath(inputPath);
  let existingAncestor = path.resolve(inputPath);
  const missingSegments: string[] = [];

  while (!fs.existsSync(existingAncestor)) {
    const parent = path.dirname(existingAncestor);
    if (parent === existingAncestor) break;
    missingSegments.unshift(path.basename(existingAncestor));
    existingAncestor = parent;
  }

  const canonicalAncestor = fs.existsSync(existingAncestor)
    ? fs.realpathSync.native(existingAncestor)
    : existingAncestor;
  return path.join(canonicalAncestor, ...missingSegments);
}

function resolveExistingCatalogPath(inputPath: string): string {
  assertFilesystemPath(inputPath);
  if (!fs.existsSync(inputPath)) {
    throw new Error("Audit catalog path does not exist.");
  }
  const sourcePath = fs.realpathSync.native(inputPath);
  const sourceStat = fs.statSync(sourcePath);
  if (!sourceStat.isFile()) {
    throw new Error("Audit catalog path must identify a regular SQLite file.");
  }
  if (sourcePath.endsWith("-wal") || sourcePath.endsWith("-shm")) {
    throw new Error("Audit catalog path must identify the main SQLite file.");
  }
  return sourcePath;
}

function sha256File(filePath: string): string | null {
  try {
    return createHash("sha256")
      .update(fs.readFileSync(filePath))
      .digest("hex");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EACCES" || code === "EPERM") return null;
    throw error;
  }
}

function snapshotFile(
  kind: CatalogFileKind,
  filePath: string,
): CatalogFileSnapshot {
  if (!fs.existsSync(filePath)) {
    return {
      kind,
      path: filePath,
      realPath: null,
      exists: false,
      size: null,
      device: null,
      inode: null,
      mode: null,
      uid: null,
      gid: null,
      mtimeNs: null,
      ctimeNs: null,
      birthtimeNs: null,
      sha256: null,
    };
  }

  const realPath = fs.realpathSync.native(filePath);
  const stat = fs.statSync(realPath, { bigint: true });
  if (!stat.isFile()) {
    throw new Error(`Catalog ${kind} snapshot target is not a regular file.`);
  }
  return {
    kind,
    path: filePath,
    realPath,
    exists: true,
    size: stat.size.toString(),
    device: stat.dev.toString(),
    inode: stat.ino.toString(),
    mode: stat.mode.toString(),
    uid: stat.uid.toString(),
    gid: stat.gid.toString(),
    mtimeNs: stat.mtimeNs.toString(),
    ctimeNs: stat.ctimeNs.toString(),
    birthtimeNs: stat.birthtimeNs.toString(),
    sha256: sha256File(realPath),
  };
}

export function snapshotCatalogFiles(databasePath: string): CatalogSnapshot {
  const sourcePath = canonicalizePotentialPath(databasePath);
  return {
    sourcePath,
    main: snapshotFile("main", sourcePath),
    wal: snapshotFile("wal", `${sourcePath}-wal`),
    shm: snapshotFile("shm", `${sourcePath}-shm`),
  };
}

function changedCatalogFiles(
  before: CatalogSnapshot,
  after: CatalogSnapshot,
): CatalogFileKind[] {
  const changed: CatalogFileKind[] = [];
  for (const kind of ["main", "wal", "shm"] as const) {
    if (JSON.stringify(before[kind]) !== JSON.stringify(after[kind])) {
      changed.push(kind);
    }
  }
  return changed;
}

export function assertCatalogSnapshotUnchanged(
  before: CatalogSnapshot,
  after: CatalogSnapshot = snapshotCatalogFiles(before.sourcePath),
): void {
  if (before.sourcePath !== after.sourcePath) {
    throw new Error("Catalog snapshot comparison used different source paths.");
  }
  const changed = changedCatalogFiles(before, after);
  if (changed.length > 0) {
    throw new Error(
      `Catalog snapshot changed for: ${changed.join(", ")}. The audit source is no longer safe to use.`,
    );
  }
}

function pathIsWritable(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.W_OK);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EACCES" || code === "EPERM") return false;
    throw error;
  }
}

function assertWalSnapshotCannotBeMutated(snapshot: CatalogSnapshot): void {
  if (!snapshot.wal.exists || snapshot.wal.size === "0") return;
  if (!snapshot.shm.exists) {
    throw new Error(
      "Audit catalog with a non-empty WAL requires an existing SHM sidecar.",
    );
  }

  const writable = [
    snapshot.main.path,
    snapshot.wal.path,
    snapshot.shm.path,
    path.dirname(snapshot.sourcePath),
  ].some(pathIsWritable);
  if (writable) {
    throw new Error(
      "Audit catalog with a non-empty WAL must be filesystem-immutable before it can be opened read-only.",
    );
  }
}

function assertOpen(state: OpenCatalogState): void {
  if (state.closed || !state.database.open) {
    throw new Error("AuditReadClient is closed.");
  }
}

function prepareReadStatement(
  state: OpenCatalogState,
  sql: string,
): Database.Statement<AuditSqlValue[], unknown> {
  assertOpen(state);
  const statement = state.database.prepare<AuditSqlValue[], unknown>(sql);
  if (!statement.reader || !statement.readonly) {
    throw new Error("AuditReadClient accepts read-only statements only.");
  }
  return statement;
}

export function openReadOnlyCatalog(
  databasePath: string,
  options: OpenReadOnlyCatalogOptions = {},
): AuditReadClient {
  const env = options.env ?? process.env;
  if (env.TURSO_DATABASE_URL?.trim()) {
    throw new Error(
      "Turso database selection is forbidden for explicit audit reads.",
    );
  }

  const sourcePath = resolveExistingCatalogPath(databasePath);
  const sourceSnapshotAtOpen = snapshotCatalogFiles(sourcePath);
  assertWalSnapshotCannotBeMutated(sourceSnapshotAtOpen);

  const database = new Database(sourcePath, {
    readonly: true,
    fileMustExist: true,
  });
  try {
    database.pragma("query_only = ON");
    const queryOnly = Number(database.pragma("query_only", { simple: true }));
    if (!database.readonly || queryOnly !== 1) {
      throw new Error(
        "Audit catalog did not enter verified readonly/query_only mode.",
      );
    }
  } catch (error) {
    database.close();
    throw error;
  }

  const state: OpenCatalogState = {
    database,
    sourcePath,
    sourceSnapshotAtOpen,
    closed: false,
  };
  const client: AuditReadClient = Object.freeze({
    all<Row extends object = Record<string, unknown>>(
      sql: string,
      args: readonly AuditSqlValue[] = [],
    ): readonly Row[] {
      const statement = prepareReadStatement(state, sql);
      return statement.all(...args) as Row[];
    },
    get<Row extends object = Record<string, unknown>>(
      sql: string,
      args: readonly AuditSqlValue[] = [],
    ): Row | undefined {
      const statement = prepareReadStatement(state, sql);
      return statement.get(...args) as Row | undefined;
    },
    close(): void {
      if (state.closed) return;
      state.database.close();
      state.closed = true;
    },
  });
  openCatalogs.set(client, state);
  return client;
}

function pathEntryExists(filePath: string): boolean {
  try {
    fs.lstatSync(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function pathInsideRoot(candidatePath: string, ownedRoot: string): boolean {
  return (
    candidatePath !== ownedRoot &&
    candidatePath.startsWith(`${ownedRoot}${path.sep}`)
  );
}

function resolveBackupDestination(
  destinationPath: string,
  ownedRootPath: string,
  sourcePath: string,
): { destinationPath: string; ownedRoot: string } {
  assertFilesystemPath(destinationPath);
  assertFilesystemPath(ownedRootPath);
  if (!fs.existsSync(ownedRootPath)) {
    throw new Error("Catalog backup owned root does not exist.");
  }
  const ownedRoot = fs.realpathSync.native(ownedRootPath);
  if (!fs.statSync(ownedRoot).isDirectory()) {
    throw new Error("Catalog backup owned root must be a directory.");
  }

  const resolvedInput = path.resolve(destinationPath);
  if (
    [sourcePath, `${sourcePath}-wal`, `${sourcePath}-shm`].includes(
      resolvedInput,
    )
  ) {
    throw new Error(
      "Catalog backup destination must not be the source catalog or a sidecar.",
    );
  }
  if (pathEntryExists(resolvedInput)) {
    throw new Error("Catalog backup destination must not already exist.");
  }

  const parentPath = path.dirname(resolvedInput);
  if (!fs.existsSync(parentPath)) {
    throw new Error("Catalog backup destination parent does not exist.");
  }
  const canonicalParent = fs.realpathSync.native(parentPath);
  const canonicalDestination = path.join(
    canonicalParent,
    path.basename(resolvedInput),
  );
  if (!pathInsideRoot(canonicalDestination, ownedRoot)) {
    throw new Error(
      "Catalog backup destination must remain inside the caller-owned root.",
    );
  }
  if (
    [sourcePath, `${sourcePath}-wal`, `${sourcePath}-shm`].includes(
      canonicalDestination,
    )
  ) {
    throw new Error(
      "Catalog backup destination must not be the source catalog or a sidecar.",
    );
  }
  return { destinationPath: canonicalDestination, ownedRoot };
}

export async function backupCatalogToDisposableCopy(
  client: AuditReadClient,
  destinationPath: string,
  ownedRootPath: string,
): Promise<CatalogBackupResult> {
  const state = openCatalogs.get(client);
  if (!state) {
    throw new Error("Catalog backup requires an open AuditReadClient.");
  }
  assertOpen(state);
  const destination = resolveBackupDestination(
    destinationPath,
    ownedRootPath,
    state.sourcePath,
  );

  let metadata: Database.BackupMetadata;
  try {
    metadata = await state.database.backup(destination.destinationPath);
  } catch (error) {
    if (
      pathInsideRoot(destination.destinationPath, destination.ownedRoot) &&
      pathEntryExists(destination.destinationPath)
    ) {
      fs.rmSync(destination.destinationPath, { force: true });
    }
    throw error;
  }

  const canonicalDestination = fs.realpathSync.native(
    destination.destinationPath,
  );
  const sourceSnapshotAfter = snapshotCatalogFiles(state.sourcePath);
  assertCatalogSnapshotUnchanged(
    state.sourceSnapshotAtOpen,
    sourceSnapshotAfter,
  );
  return {
    sourcePath: state.sourcePath,
    destinationPath: canonicalDestination,
    ownedRoot: destination.ownedRoot,
    totalPages: metadata.totalPages,
    remainingPages: metadata.remainingPages,
    sourceSnapshotBefore: state.sourceSnapshotAtOpen,
    sourceSnapshotAfter,
  };
}
