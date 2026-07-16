import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type {
  AuditReadClient,
  AuditSqlValue,
  CatalogBackupResult,
  CatalogCheckpointedCopyResult,
  CatalogFileKind,
  CatalogFileSnapshot,
  CatalogSnapshot,
} from "./audit-contracts";

export type OpenReadOnlyCatalogOptions = {
  env?: NodeJS.ProcessEnv;
};

export type CopyCheckpointedCatalogOptions = {
  expectedSourceSnapshot?: CatalogSnapshot;
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
    return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
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

function fileIdentity(snapshot: CatalogFileSnapshot): string | null {
  if (!snapshot.exists || snapshot.device === null || snapshot.inode === null) {
    return null;
  }
  return `${snapshot.device}:${snapshot.inode}`;
}

function resolveCheckpointedSource(inputPath: string): CatalogSnapshot {
  assertFilesystemPath(inputPath);
  if (!fs.existsSync(inputPath)) {
    throw new Error("Checkpointed catalog source does not exist.");
  }
  const inputLstat = fs.lstatSync(inputPath);
  if (inputLstat.isSymbolicLink()) {
    throw new Error(
      "Checkpointed catalog source family must not be a symlink.",
    );
  }
  if (!inputLstat.isFile()) {
    throw new Error("Checkpointed catalog source main must be a regular file.");
  }
  const sourcePath = fs.realpathSync.native(inputPath);
  if (sourcePath.endsWith("-wal") || sourcePath.endsWith("-shm")) {
    throw new Error("Checkpointed catalog source must identify the main file.");
  }
  for (const familyPath of [
    sourcePath,
    `${sourcePath}-wal`,
    `${sourcePath}-shm`,
  ]) {
    if (!pathEntryExists(familyPath)) continue;
    const lstat = fs.lstatSync(familyPath);
    if (lstat.isSymbolicLink()) {
      throw new Error(
        "Checkpointed catalog source family must not be a symlink.",
      );
    }
    if (!lstat.isFile()) {
      throw new Error(
        "Checkpointed catalog source family must contain only regular files.",
      );
    }
  }
  const snapshot = snapshotCatalogFiles(sourcePath);
  if (!snapshot.main.exists || snapshot.main.sha256 === null) {
    throw new Error("Checkpointed catalog source main is not readable.");
  }
  const identities = [snapshot.main, snapshot.wal, snapshot.shm]
    .map(fileIdentity)
    .filter((identity): identity is string => identity !== null);
  if (new Set(identities).size !== identities.length) {
    throw new Error(
      "Checkpointed catalog source family contains hardlink aliases.",
    );
  }
  if (snapshot.wal.exists && snapshot.wal.size !== "0") {
    throw new Error(
      "Checkpointed catalog source has a non-empty WAL; recovery is forbidden.",
    );
  }
  return snapshot;
}

function resolveCheckpointedCopyDestination(
  destinationPath: string,
  ownedRootPath: string,
  sourceSnapshot: CatalogSnapshot,
): { destinationPath: string; ownedRoot: string } {
  assertFilesystemPath(destinationPath);
  assertFilesystemPath(ownedRootPath);
  if (!fs.existsSync(ownedRootPath)) {
    throw new Error("Checkpointed catalog owned root does not exist.");
  }
  const ownedRootLstat = fs.lstatSync(ownedRootPath);
  if (ownedRootLstat.isSymbolicLink() || !ownedRootLstat.isDirectory()) {
    throw new Error(
      "Checkpointed catalog owned root must be a non-symlink directory.",
    );
  }
  const ownedRoot = fs.realpathSync.native(ownedRootPath);
  const resolvedInput = path.resolve(destinationPath);
  const sourceFamilyPaths = [
    sourceSnapshot.sourcePath,
    `${sourceSnapshot.sourcePath}-wal`,
    `${sourceSnapshot.sourcePath}-shm`,
  ];
  if (sourceFamilyPaths.includes(resolvedInput)) {
    throw new Error(
      "Checkpointed catalog destination must not be the source or a sidecar.",
    );
  }
  if (pathEntryExists(resolvedInput)) {
    const destinationLstat = fs.lstatSync(resolvedInput);
    if (!destinationLstat.isSymbolicLink()) {
      const destinationStat = fs.statSync(resolvedInput, { bigint: true });
      const destinationIdentity = `${destinationStat.dev}:${destinationStat.ino}`;
      const sourceIdentities = [
        sourceSnapshot.main,
        sourceSnapshot.wal,
        sourceSnapshot.shm,
      ].map(fileIdentity);
      if (sourceIdentities.includes(destinationIdentity)) {
        throw new Error(
          "Checkpointed catalog destination is a hardlink alias of the source family.",
        );
      }
    }
    throw new Error("Checkpointed catalog destination must not already exist.");
  }
  const parentPath = path.dirname(resolvedInput);
  if (!fs.existsSync(parentPath)) {
    throw new Error("Checkpointed catalog destination parent does not exist.");
  }
  const canonicalParent = fs.realpathSync.native(parentPath);
  const canonicalDestination = path.join(
    canonicalParent,
    path.basename(resolvedInput),
  );
  if (!pathInsideRoot(canonicalDestination, ownedRoot)) {
    throw new Error(
      "Checkpointed catalog destination must remain inside the caller-owned root.",
    );
  }
  if (sourceFamilyPaths.includes(canonicalDestination)) {
    throw new Error(
      "Checkpointed catalog destination must not be the source or a sidecar.",
    );
  }
  return { destinationPath: canonicalDestination, ownedRoot };
}

function copyMainFileExclusive(
  sourceSnapshot: CatalogSnapshot,
  destinationPath: string,
): void {
  const sourceFlags = fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW;
  const destinationFlags =
    fs.constants.O_WRONLY |
    fs.constants.O_CREAT |
    fs.constants.O_EXCL |
    fs.constants.O_NOFOLLOW;
  let sourceDescriptor: number | null = null;
  let destinationDescriptor: number | null = null;
  try {
    sourceDescriptor = fs.openSync(sourceSnapshot.sourcePath, sourceFlags);
    destinationDescriptor = fs.openSync(
      destinationPath,
      destinationFlags,
      0o600,
    );
    const sourceStatBefore = fs.fstatSync(sourceDescriptor, { bigint: true });
    if (
      !sourceStatBefore.isFile() ||
      sourceStatBefore.dev.toString() !== sourceSnapshot.main.device ||
      sourceStatBefore.ino.toString() !== sourceSnapshot.main.inode
    ) {
      throw new Error("Checkpointed catalog source changed before copy.");
    }

    const digest = createHash("sha256");
    const buffer = Buffer.allocUnsafe(1024 * 1024);
    let sourceOffset = 0;
    while (true) {
      const bytesRead = fs.readSync(
        sourceDescriptor,
        buffer,
        0,
        buffer.length,
        sourceOffset,
      );
      if (bytesRead === 0) break;
      digest.update(buffer.subarray(0, bytesRead));
      let written = 0;
      while (written < bytesRead) {
        written += fs.writeSync(
          destinationDescriptor,
          buffer,
          written,
          bytesRead - written,
        );
      }
      sourceOffset += bytesRead;
    }
    fs.fsyncSync(destinationDescriptor);
    const sourceStatAfter = fs.fstatSync(sourceDescriptor, { bigint: true });
    const stableFields = [
      "dev",
      "ino",
      "mode",
      "uid",
      "gid",
      "size",
      "mtimeNs",
      "ctimeNs",
      "birthtimeNs",
    ] as const;
    if (
      stableFields.some(
        (field) =>
          sourceStatAfter[field].toString() !==
          sourceSnapshot.main[
            field === "dev" ? "device" : field === "ino" ? "inode" : field
          ],
      ) ||
      digest.digest("hex") !== sourceSnapshot.main.sha256
    ) {
      throw new Error("Checkpointed catalog source changed during copy.");
    }
  } finally {
    if (destinationDescriptor !== null) fs.closeSync(destinationDescriptor);
    if (sourceDescriptor !== null) fs.closeSync(sourceDescriptor);
  }
}

export function copyCheckpointedCatalogToDisposableCopy(
  sourcePath: string,
  destinationPath: string,
  ownedRootPath: string,
  options: CopyCheckpointedCatalogOptions = {},
): CatalogCheckpointedCopyResult {
  const sourceSnapshotBefore = resolveCheckpointedSource(sourcePath);
  if (options.expectedSourceSnapshot) {
    assertCatalogSnapshotUnchanged(
      options.expectedSourceSnapshot,
      sourceSnapshotBefore,
    );
  }
  const destination = resolveCheckpointedCopyDestination(
    destinationPath,
    ownedRootPath,
    sourceSnapshotBefore,
  );
  try {
    copyMainFileExclusive(sourceSnapshotBefore, destination.destinationPath);
    const sourceSnapshotAfter = resolveCheckpointedSource(
      sourceSnapshotBefore.sourcePath,
    );
    assertCatalogSnapshotUnchanged(sourceSnapshotBefore, sourceSnapshotAfter);
    const destinationSnapshot = snapshotCatalogFiles(
      destination.destinationPath,
    );
    const destinationIdentity = fileIdentity(destinationSnapshot.main);
    if (
      !destinationSnapshot.main.exists ||
      destinationSnapshot.main.sha256 !== sourceSnapshotBefore.main.sha256 ||
      destinationIdentity === fileIdentity(sourceSnapshotBefore.main)
    ) {
      throw new Error(
        "Checkpointed catalog destination does not match the source main file.",
      );
    }
    return {
      sourcePath: sourceSnapshotBefore.sourcePath,
      destinationPath: fs.realpathSync.native(destination.destinationPath),
      ownedRoot: destination.ownedRoot,
      sourceSnapshotBefore,
      sourceSnapshotAfter,
      destinationSnapshot,
    };
  } catch (error) {
    if (
      pathInsideRoot(destination.destinationPath, destination.ownedRoot) &&
      pathEntryExists(destination.destinationPath)
    ) {
      fs.rmSync(destination.destinationPath, { force: true });
    }
    throw error;
  }
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
