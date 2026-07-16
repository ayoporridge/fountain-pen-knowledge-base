import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { migrateDatabase } from "../src/lib/db";
import type {
  AuditReadClient,
  CatalogSnapshot,
} from "../src/lib/audit/audit-contracts";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  openReadOnlyCatalog,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  assertLockedInventoryBaseline,
  captureInventoryAuditProvenance,
  captureSourceInventoryProvenance,
  inventoryAuditVerdict,
  runReadinessAudit,
  serializeInventoryCsv,
  serializeInventoryNdjson,
  serializeInventorySummary,
  type InventoryAuditResult,
} from "../src/lib/audit/readiness-audit";

const ARTIFACT_FILES = {
  ndjson: "inventory-readiness-v2.ndjson",
  csv: "inventory-readiness-v2.csv",
  summary: "inventory-readiness-v2-summary.json",
} as const;
const REMOTE_DATABASE_URL = /^[a-z][a-z\d+.-]*:\/\//i;

type CliOptions = {
  databasePath: string;
  outDir: string;
  limit: number | null;
  json: boolean;
  inventoryOnly: boolean;
  verifyBaseline: boolean;
  signalProbeReport: string | null;
};

export type ReadinessOwnedCopyOptions = {
  signalProbeReport?: string | null;
};

type ReadinessOwnedWorkspace = {
  ownedRoot: string;
  auditPath: string;
  sourceBefore: CatalogSnapshot;
  preMigrationCopy: AuditReadClient | null;
  writableCopy: Client | null;
  migratedCopy: AuditReadClient | null;
  cleaned: boolean;
};

type ExistingFileIdentity = {
  path: string;
  device: bigint;
  inode: bigint;
};

function parseArguments(argv: readonly string[]): CliOptions {
  const args = argv.filter((arg) => arg !== "--");
  const values = new Map<string, string>();
  const flags = new Set<string>();
  const valueOptions = new Set([
    "--database-path",
    "--out-dir",
    "--limit",
    "--signal-probe-report",
  ]);
  const booleanOptions = new Set([
    "--json",
    "--inventory-only",
    "--verify-baseline",
  ]);
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (valueOptions.has(argument)) {
      if (values.has(argument)) {
        throw new Error(`Duplicate CLI option: ${argument}.`);
      }
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a value.`);
      }
      values.set(argument, value);
      index += 1;
      continue;
    }
    if (booleanOptions.has(argument)) {
      if (flags.has(argument)) {
        throw new Error(`Duplicate CLI flag: ${argument}.`);
      }
      flags.add(argument);
      continue;
    }
    throw new Error(`Unknown audit readiness option: ${argument}.`);
  }

  const databasePath = values.get("--database-path");
  const outDir = values.get("--out-dir");
  if (!databasePath) throw new Error("--database-path is required.");
  if (!outDir) throw new Error("--out-dir is required.");
  const limitValue = values.get("--limit");
  let limit: number | null = null;
  if (limitValue !== undefined) {
    if (!/^[1-9]\d*$/.test(limitValue)) {
      throw new Error(
        "--limit must be a decimal integer from 1 to 1000000.",
      );
    }
    limit = Number(limitValue);
    if (!Number.isSafeInteger(limit) || limit > 1_000_000) {
      throw new Error(
        "--limit must be a decimal integer from 1 to 1000000.",
      );
    }
  }
  return {
    databasePath,
    outDir,
    limit,
    json: flags.has("--json"),
    inventoryOnly: flags.has("--inventory-only"),
    verifyBaseline: flags.has("--verify-baseline"),
    signalProbeReport: values.get("--signal-probe-report") ?? null,
  };
}

function validateDatabasePath(inputPath: string): string {
  if (REMOTE_DATABASE_URL.test(inputPath)) {
    throw new Error("--database-path must be an explicit local file.");
  }
  if (!path.isAbsolute(inputPath)) {
    throw new Error("--database-path must be absolute.");
  }
  if (!fs.existsSync(inputPath)) {
    throw new Error("--database-path does not exist.");
  }
  const lstat = fs.lstatSync(inputPath);
  if (lstat.isSymbolicLink()) {
    throw new Error("--database-path must not be a symlink.");
  }
  if (!lstat.isFile()) {
    throw new Error("--database-path must identify a regular SQLite file.");
  }
  if (inputPath.endsWith("-wal") || inputPath.endsWith("-shm")) {
    throw new Error("--database-path must identify the SQLite main file.");
  }
  return fs.realpathSync.native(inputPath);
}

function canonicalizeOutputDirectory(inputPath: string): string {
  if (!path.isAbsolute(inputPath)) {
    throw new Error("--out-dir must be absolute.");
  }
  const resolved = path.resolve(inputPath);
  const parsed = path.parse(resolved);
  const segments = resolved
    .slice(parsed.root.length)
    .split(path.sep)
    .filter(Boolean);
  let current = parsed.root;
  let missing = false;
  const missingSegments: string[] = [];
  for (const segment of segments) {
    current = path.join(current, segment);
    if (missing || !fs.existsSync(current)) {
      missing = true;
      missingSegments.push(segment);
      continue;
    }
    const lstat = fs.lstatSync(current);
    if (lstat.isSymbolicLink()) {
      throw new Error("--out-dir must not traverse a symlink.");
    }
    if (!lstat.isDirectory()) {
      throw new Error("--out-dir path components must be directories.");
    }
  }
  if (!missing) return fs.realpathSync.native(resolved);
  let existingAncestor = resolved;
  for (let index = 0; index < missingSegments.length; index += 1) {
    existingAncestor = path.dirname(existingAncestor);
  }
  return path.join(
    fs.realpathSync.native(existingAncestor),
    ...missingSegments,
  );
}

function fileIdentity(filePath: string): ExistingFileIdentity | null {
  if (!fs.existsSync(filePath)) return null;
  const lstat = fs.lstatSync(filePath);
  if (lstat.isSymbolicLink()) {
    throw new Error(`Source database family must not contain a symlink: ${filePath}.`);
  }
  if (!lstat.isFile()) {
    throw new Error(`Source database family must contain regular files: ${filePath}.`);
  }
  const stat = fs.statSync(filePath, { bigint: true });
  return { path: path.resolve(filePath), device: stat.dev, inode: stat.ino };
}

function sourceFamily(databasePath: string): ExistingFileIdentity[] {
  return [databasePath, `${databasePath}-wal`, `${databasePath}-shm`]
    .map(fileIdentity)
    .filter((identity): identity is ExistingFileIdentity => identity !== null);
}

function artifactTargetPaths(outDir: string): string[] {
  return Object.values(ARTIFACT_FILES).map((file) => path.join(outDir, file));
}

function validateArtifactTargets(
  outDir: string,
  family: readonly ExistingFileIdentity[],
): string[] {
  const targets = artifactTargetPaths(outDir);
  for (const target of targets) {
    const resolved = path.resolve(target);
    if (family.some((source) => source.path === resolved)) {
      throw new Error("Audit artifact target aliases the source database family.");
    }
    if (!fs.existsSync(target)) continue;
    const lstat = fs.lstatSync(target);
    if (lstat.isSymbolicLink()) {
      throw new Error("Audit artifact target must not be a symlink.");
    }
    if (!lstat.isFile()) {
      throw new Error("Audit artifact target must be a regular file.");
    }
    const stat = fs.statSync(target, { bigint: true });
    if (
      family.some(
        (source) => source.device === stat.dev && source.inode === stat.ino,
      )
    ) {
      throw new Error("Audit artifact target aliases the source database family.");
    }
  }
  return targets;
}

function validateInputs(options: CliOptions): {
  databasePath: string;
  outDir: string;
  family: ExistingFileIdentity[];
} {
  const databasePath = validateDatabasePath(options.databasePath);
  const outDir = canonicalizeOutputDirectory(options.outDir);
  const family = sourceFamily(databasePath);
  validateArtifactTargets(outDir, family);
  if (process.env.TURSO_DATABASE_URL?.trim()) {
    throw new Error(
      "Turso database selection is forbidden for explicit audit reads.",
    );
  }
  return { databasePath, outDir, family };
}

function writeArtifacts(
  outDir: string,
  family: readonly ExistingFileIdentity[],
  contents: readonly [string, string, string],
): string[] {
  fs.mkdirSync(outDir, { recursive: true });
  const canonicalOutDir = fs.realpathSync.native(outDir);
  if (canonicalOutDir !== outDir) {
    throw new Error("--out-dir canonical path changed before artifact write.");
  }
  const targets = validateArtifactTargets(outDir, family);
  const temporaryFiles: string[] = [];
  try {
    for (let index = 0; index < targets.length; index += 1) {
      const temporary = path.join(
        outDir,
        `.${path.basename(targets[index]!)}.${process.pid}.${index}.tmp`,
      );
      if (fs.existsSync(temporary)) {
        throw new Error(`Audit artifact temporary path already exists: ${temporary}.`);
      }
      fs.writeFileSync(temporary, contents[index]!, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      });
      temporaryFiles.push(temporary);
    }
    for (let index = 0; index < targets.length; index += 1) {
      fs.renameSync(temporaryFiles[index]!, targets[index]!);
    }
    temporaryFiles.length = 0;
    return targets;
  } finally {
    for (const temporary of temporaryFiles) {
      fs.rmSync(temporary, { force: true });
    }
  }
}

function validateSignalProbeReport(
  reportPath: string | null | undefined,
  sourcePath: string,
): string | null {
  if (!reportPath) return null;
  if (!path.isAbsolute(reportPath)) {
    throw new Error("--signal-probe-report must be absolute.");
  }
  if (fs.existsSync(reportPath)) {
    throw new Error("--signal-probe-report must not already exist.");
  }
  const parent = path.dirname(reportPath);
  if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory()) {
    throw new Error("--signal-probe-report parent must be an existing directory.");
  }
  const canonicalParent = fs.realpathSync.native(parent);
  if (canonicalParent !== path.resolve(parent)) {
    throw new Error("--signal-probe-report must not traverse a symlink.");
  }
  const canonicalReport = path.join(canonicalParent, path.basename(reportPath));
  if (
    [sourcePath, `${sourcePath}-wal`, `${sourcePath}-shm`].includes(
      canonicalReport,
    )
  ) {
    throw new Error("--signal-probe-report must not alias the source catalog.");
  }
  return canonicalReport;
}

function cleanupReadinessWorkspace(workspace: ReadinessOwnedWorkspace): void {
  if (workspace.cleaned) return;
  workspace.cleaned = true;
  const cleanupErrors: unknown[] = [];
  for (const key of [
    "migratedCopy",
    "writableCopy",
    "preMigrationCopy",
  ] as const) {
    try {
      workspace[key]?.close();
    } catch (error) {
      cleanupErrors.push(error);
    } finally {
      workspace[key] = null;
    }
  }
  try {
    const canonicalRoot = fs.existsSync(workspace.ownedRoot)
      ? fs.realpathSync.native(workspace.ownedRoot)
      : workspace.ownedRoot;
    if (
      path.dirname(canonicalRoot) !== fs.realpathSync.native(os.tmpdir()) ||
      !path.basename(canonicalRoot).startsWith("fpkg-readiness-v2-")
    ) {
      throw new Error("Readiness audit cleanup refused an unmanaged root.");
    }
    fs.rmSync(canonicalRoot, { recursive: true, force: true });
  } catch (error) {
    cleanupErrors.push(error);
  }
  try {
    assertCatalogSnapshotUnchanged(
      workspace.sourceBefore,
      snapshotCatalogFiles(workspace.sourceBefore.sourcePath),
    );
  } catch (error) {
    cleanupErrors.push(error);
  }
  if (cleanupErrors.length > 0) {
    throw new AggregateError(
      cleanupErrors,
      "Readiness audit owned workspace cleanup failed closed.",
    );
  }
}

export async function runReadinessAuditOnOwnedCopy(
  databasePath: string,
  options: ReadinessOwnedCopyOptions = {},
): Promise<InventoryAuditResult> {
  if (process.env.TURSO_DATABASE_URL?.trim()) {
    throw new Error(
      "Turso database selection is forbidden for explicit readiness audits.",
    );
  }
  const sourceBefore = snapshotCatalogFiles(databasePath);
  const signalProbeReport = validateSignalProbeReport(
    options.signalProbeReport,
    sourceBefore.sourcePath,
  );
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-readiness-v2-")),
  );
  const workspace: ReadinessOwnedWorkspace = {
    ownedRoot,
    auditPath: path.join(ownedRoot, "audit-copy.db"),
    sourceBefore,
    preMigrationCopy: null,
    writableCopy: null,
    migratedCopy: null,
    cleaned: false,
  };
  let signalCleanupStarted = false;
  const signalHandlers = new Map<NodeJS.Signals, () => void>();
  for (const [signal, exitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const) {
    const handler = () => {
      if (signalCleanupStarted) return;
      signalCleanupStarted = true;
      try {
        cleanupReadinessWorkspace(workspace);
        process.exit(exitCode);
      } catch {
        process.exit(1);
      }
    };
    signalHandlers.set(signal, handler);
    process.once(signal, handler);
  }

  try {
    copyCheckpointedCatalogToDisposableCopy(
      databasePath,
      workspace.auditPath,
      ownedRoot,
      { expectedSourceSnapshot: sourceBefore },
    );

    let sourceProvenance;
    workspace.preMigrationCopy = openReadOnlyCatalog(workspace.auditPath, {
      env: {},
    });
    try {
      if (
        workspace.preMigrationCopy.get(
          "SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'schema_migrations'",
        )
      ) {
        throw new Error(
          "Readiness audit rejects legacy schema_migrations provenance.",
        );
      }
      sourceProvenance = captureSourceInventoryProvenance(
        workspace.preMigrationCopy,
      );
    } finally {
      workspace.preMigrationCopy.close();
      workspace.preMigrationCopy = null;
    }

    workspace.writableCopy = createClient({
      url: `file:${workspace.auditPath}`,
    });
    try {
      await migrateDatabase(workspace.writableCopy);
      await workspace.writableCopy.execute("PRAGMA wal_checkpoint(TRUNCATE)");
      const quickCheck = await workspace.writableCopy.execute(
        "PRAGMA quick_check",
      );
      if (
        quickCheck.rows.length !== 1 ||
        String(quickCheck.rows[0]?.quick_check) !== "ok"
      ) {
        throw new Error("Audit owned copy failed PRAGMA quick_check.");
      }
      const foreignKeys = await workspace.writableCopy.execute(
        "PRAGMA foreign_key_check",
      );
      if (foreignKeys.rows.length > 0) {
        throw new Error(
          `Audit owned copy has ${foreignKeys.rows.length} foreign-key violation(s).`,
        );
      }
    } finally {
      workspace.writableCopy.close();
      workspace.writableCopy = null;
    }

    if (signalProbeReport) {
      fs.writeFileSync(
        signalProbeReport,
        JSON.stringify({
          tempRoot: workspace.ownedRoot,
          databasePath: workspace.auditPath,
        }),
        { encoding: "utf8", flag: "wx", mode: 0o600 },
      );
      await new Promise<never>(() => {
        setInterval(() => undefined, 1_000);
      });
    }

    workspace.migratedCopy = openReadOnlyCatalog(workspace.auditPath, {
      env: {},
    });
    try {
      if (
        workspace.migratedCopy.get(
          "SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'schema_migrations'",
        )
      ) {
        throw new Error(
          "Canonical audit copy unexpectedly contains schema_migrations.",
        );
      }
      const provenance = captureInventoryAuditProvenance(
        workspace.migratedCopy,
        sourceProvenance,
      );
      return runReadinessAudit(workspace.migratedCopy, provenance);
    } finally {
      workspace.migratedCopy.close();
      workspace.migratedCopy = null;
    }
  } finally {
    try {
      cleanupReadinessWorkspace(workspace);
    } finally {
      for (const [signal, handler] of signalHandlers) {
        process.off(signal, handler);
      }
    }
  }
}

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));
  const validated = validateInputs(options);
  const sourceBefore = snapshotCatalogFiles(validated.databasePath);
  const result = await runReadinessAuditOnOwnedCopy(validated.databasePath, {
    signalProbeReport: options.signalProbeReport,
  });
  assertCatalogSnapshotUnchanged(
    sourceBefore,
    snapshotCatalogFiles(validated.databasePath),
  );
  if (options.verifyBaseline) assertLockedInventoryBaseline(result);

  const verdict = inventoryAuditVerdict(result);
  const artifacts = [
    serializeInventoryNdjson(result),
    serializeInventoryCsv(result),
    serializeInventorySummary(result),
  ] as const;
  const outputPaths = writeArtifacts(
    validated.outDir,
    validated.family,
    artifacts,
  );
  const exitCode = options.inventoryOnly
    ? verdict.inventory_complete
      ? 0
      : 1
    : verdict.complete
      ? 0
      : 1;
  const previewRows = result.rows.slice(0, options.limit ?? result.rows.length);

  if (options.json) {
    console.log(
      JSON.stringify({
        provenance: result.provenance,
        summary: result.summary,
        verdict,
        exit_code: exitCode,
        console_row_count: previewRows.length,
        rows: previewRows,
        artifacts: outputPaths,
      }),
    );
  } else {
    for (const row of previewRows) {
      console.log(
        `${row.entity_type}:${row.slug}\t${row.publication_status}\t${row.content_ready ? "ready" : "blocked"}\t${row.disposition}`,
      );
    }
    console.log(
      `inventory=${result.summary.inventory_audited} content_ready=${result.summary.content_ready} published=${result.summary.published} published_blockers=${result.summary.published_blockers} backlog=${result.summary.backlog}`,
    );
  }
  process.exitCode = exitCode;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
