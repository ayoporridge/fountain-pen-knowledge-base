import {
  spawn,
  spawnSync,
  type ChildProcess,
} from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import Database from "better-sqlite3";
import { migrateDatabase, resolveDatabaseConnection } from "../src/lib/db";
import {
  assertCatalogSnapshotUnchanged,
  backupCatalogToDisposableCopy,
  openReadOnlyCatalog,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  captureInventoryAuditProvenance,
  captureSourceInventoryProvenance,
  runReadinessAudit,
} from "../src/lib/audit/readiness-audit";
import {
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  cleanupPhase19Fixture,
  createPhase19Fixture,
  installPhase19FixtureSignalHandlers,
  seedQualifiedPublicationFixture,
  snapshotRealCatalogInvariant,
  withPhase19Fixture,
} from "./lib/phase19-fixtures";

const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, "scripts", "check-audit-readiness.ts");
const MIGRATIONS_DIR = path.join(ROOT, "migrations");
const MIGRATION_030 = "030_publication_gate.sql";
const MIGRATION_031 = "031_evidence_readiness_v2.sql";
const AUDIT_CLI_PATH = path.join(ROOT, "scripts", "audit-readiness-v2.ts");
const LIBRARY_CONTRACT_PATH = path.join(
  ROOT,
  "scripts",
  "check-library-contract.ts",
);
const ARTIFACT_FILES = [
  "inventory-readiness-v2.ndjson",
  "inventory-readiness-v2.csv",
  "inventory-readiness-v2-summary.json",
] as const;
const CSV_FORMULA_NAME = '=SUM(1,2), "quoted"\r\nnext line';

type ProbeRow = {
  id: number;
  label: string;
};

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}

function expectThrow(run: () => unknown, messageFragment: string): Error {
  try {
    run();
  } catch (error) {
    assertCondition(error instanceof Error, "Expected an Error instance.");
    assertCondition(
      error.message.includes(messageFragment),
      `Expected rejection containing ${JSON.stringify(messageFragment)}, received: ${error.message}`,
    );
    return error;
  }
  throw new Error(`Expected rejection containing: ${messageFragment}`);
}

async function expectAsyncThrow(
  run: () => Promise<unknown>,
  messageFragment: string,
): Promise<Error> {
  try {
    await run();
  } catch (error) {
    assertCondition(error instanceof Error, "Expected an Error instance.");
    assertCondition(
      error.message.includes(messageFragment),
      `Expected rejection containing ${JSON.stringify(messageFragment)}, received: ${error.message}`,
    );
    return error;
  }
  throw new Error(`Expected rejection containing: ${messageFragment}`);
}

async function withOwnedTempRoot<T>(
  prefix: string,
  run: (tempRoot: string) => Promise<T> | T,
): Promise<T> {
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  try {
    return await run(tempRoot);
  } finally {
    if (fs.existsSync(tempRoot)) {
      fs.chmodSync(tempRoot, 0o700);
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function sorted(values: Iterable<string>): string[] {
  return [...values].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
}

function assertSetEqual(
  actualValues: Iterable<string>,
  expectedValues: Iterable<string>,
  label: string,
): void {
  const actual = new Set(actualValues);
  const expected = new Set(expectedValues);
  const actualOnly = sorted([...actual].filter((value) => !expected.has(value)));
  const expectedOnly = sorted(
    [...expected].filter((value) => !actual.has(value)),
  );
  assertCondition(
    actualOnly.length === 0 && expectedOnly.length === 0,
    `${label} set mismatch; actual-only=${actualOnly.join(",") || "none"}; expected-only=${expectedOnly.join(",") || "none"}.`,
  );
}

async function approveAndPublish(client: Client, entityId: string): Promise<void> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId,
      reviewKind,
      reviewer: `audit-${reviewKind}-reviewer`,
      status: "approved",
      notes: "Audit ledger fixture approval.",
    });
  }
  await publishEntity(client, {
    entityId,
    reviewer: "audit-publication-reviewer",
  });
}

async function seedLedgerRelationshipShells(client: Client): Promise<void> {
  await client.execute(`
    INSERT INTO entities (id, type, slug, name, summary, body_md, source)
    VALUES
      ('audit-second-brand', 'brand', 'audit-second-brand', 'Audit second brand', '', '', 'audit-fixture'),
      ('audit-no-publication', 'brand', 'audit-no-publication', 'Audit no publication', '', '', 'audit-fixture'),
      ('audit-missing-pen', 'pen', '百乐-pilot-custom-823', 'Audit missing pen', '', '', 'audit-fixture'),
      ('audit-multiple-pen', 'pen', 'audit-multiple-pen', 'Audit multiple pen', '', '', 'audit-fixture'),
      ('audit-noncanonical-pen', 'pen', 'audit-noncanonical-pen', 'Audit noncanonical pen', '', '', 'audit-fixture'),
      ('audit-nonbrand-target', 'concept', 'audit-nonbrand-target', 'Audit non-brand target', '', '', 'audit-fixture')
  `);
  await client.execute(
    "DELETE FROM entity_publications WHERE entity_id = 'audit-no-publication'",
  );
  await client.execute(`
    INSERT INTO entity_links (id, source_id, target_id, link_type)
    VALUES
      ('audit-multiple-maker-a', 'audit-multiple-pen', 'audit-public-brand', 'made_by'),
      ('audit-multiple-maker-b', 'audit-multiple-pen', 'audit-second-brand', 'made_by'),
      ('audit-noncanonical-maker', 'audit-noncanonical-pen', 'audit-nonbrand-target', 'made_by')
  `);
}

async function runInventoryContract(): Promise<void> {
  await withPhase19Fixture(async ({ client, databasePath }) => {
    const initialInventory = await client.execute(`
      SELECT id
      FROM entities
      WHERE type IN ('brand', 'pen')
      ORDER BY type, slug, id
    `);
    const brand = await seedQualifiedPublicationFixture(client, {
      entityId: "audit-public-brand",
      entityType: "brand",
    });
    await approveAndPublish(client, brand.entityId);
    const pen = await seedQualifiedPublicationFixture(client, {
      entityId: "audit-public-pen",
      entityType: "pen",
      brandEntityId: brand.entityId,
    });
    await approveAndPublish(client, pen.entityId);
    await seedLedgerRelationshipShells(client);
    const legacyExcluded = await client.execute(`
      SELECT id, slug
      FROM entities
      WHERE slug IN ('banju', '百乐-pilot-custom-823')
      ORDER BY slug, id
    `);
    assertCondition(
      legacyExcluded.rows.length === 2,
      "Audit fixture is missing the locked legacy-exclusion identities.",
    );
    await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");

    const auditClient = openReadOnlyCatalog(databasePath, { env: {} });
    try {
      const source = captureSourceInventoryProvenance(auditClient);
      const provenance = captureInventoryAuditProvenance(auditClient, source);
      const result = runReadinessAudit(auditClient, provenance);
      const addedIds = [
        "audit-public-brand",
        "audit-public-pen",
        "audit-second-brand",
        "audit-no-publication",
        "audit-missing-pen",
        "audit-multiple-pen",
        "audit-noncanonical-pen",
      ];
      const expectedIds = [
        ...initialInventory.rows.map((row) => String(row.id)),
        ...addedIds,
      ];
      assertSetEqual(
        result.rows.map((row) => row.entity_id),
        expectedIds,
        "Inventory ledger identities",
      );
      assertCondition(
        result.rows.length === expectedIds.length &&
          new Set(result.rows.map((row) => row.entity_id)).size === result.rows.length,
        "Inventory ledger did not return exactly one row per raw identity.",
      );

      const byId = new Map(result.rows.map((row) => [row.entity_id, row]));
      const noPublication = byId.get("audit-no-publication");
      assertCondition(
        noPublication?.publication_status === "missing" &&
          noPublication.blocker_codes.includes("missing_publication"),
        "Raw entity without a publication row was omitted or misclassified.",
      );
      assertCondition(
        byId.get("audit-missing-pen")?.made_by_status === "missing" &&
          byId.get("audit-public-pen")?.made_by_status === "exactly_one" &&
          byId.get("audit-multiple-pen")?.made_by_status === "multiple" &&
          byId.get("audit-noncanonical-pen")?.made_by_status === "noncanonical",
        "The four made_by dispositions were not preserved.",
      );
      assertCondition(
        legacyExcluded.rows.every(
          (row) => byId.get(String(row.id))?.in_legacy_public_baseline === false,
        ),
        "Locked legacy exclusions were not traced independently from the audit universe.",
      );

      const reverse = byId.get("audit-public-brand");
      assertSetEqual(
        reverse?.raw_reverse_model_ids ?? [],
        ["audit-public-pen", "audit-multiple-pen"],
        "Brand raw reverse models",
      );
      assertSetEqual(
        reverse?.public_reverse_model_ids ?? [],
        ["audit-public-pen"],
        "Brand public reverse models",
      );
      assertSetEqual(
        reverse?.reverse_model_diff_ids ?? [],
        ["audit-multiple-pen"],
        "Brand reverse model difference",
      );
      assertCondition(
        result.summary.inventory_audited === expectedIds.length &&
          result.summary.content_ready === 2 &&
          result.summary.published === 2 &&
          result.summary.published_blockers === 0 &&
          result.summary.backlog === expectedIds.length - 2,
        `Inventory/content/public summary dimensions were conflated: ${JSON.stringify(result.summary)}.`,
      );
      assertCondition(
        result.rows.every(
          (row) => row.content_ready === (row.blocker_count === 0),
        ),
        "A hard blocker was offset instead of failing the row.",
      );
    } finally {
      auditClient.close();
    }
  });

  console.log(
    "Audit inventory contract passed: every raw brand/pen has one deterministic row, all relationship dispositions are explicit, and summary dimensions stay separate.",
  );
}

function createMigrationsThrough030(tempRoot: string): string {
  const targetDir = path.join(tempRoot, "migrations-through-030");
  fs.mkdirSync(targetDir);
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => {
      const match = file.match(/^(\d{3})_.*\.sql$/);
      return Boolean(match && Number(match[1]) <= 30);
    })
    .sort();
  assertCondition(
    files.includes(MIGRATION_030) && !files.includes(MIGRATION_031),
    "Pre-031 migration fixture did not end exactly at migration 030.",
  );
  for (const file of files) {
    fs.copyFileSync(path.join(MIGRATIONS_DIR, file), path.join(targetDir, file));
  }
  return targetDir;
}

async function runBackupMigrationContract(): Promise<void> {
  await withOwnedTempRoot("fpkg-audit-030-031-", async (tempRoot) => {
    const migrationsThrough030 = createMigrationsThrough030(tempRoot);
    const sourcePath = path.join(tempRoot, "source-030.db");
    const auditPath = path.join(tempRoot, "audit-031.db");
    const sourceClient = createClient({ url: `file:${sourcePath}` });
    try {
      await migrateDatabase(sourceClient, {
        migrationsDir: migrationsThrough030,
      });
    } finally {
      sourceClient.close();
    }

    const normalizeSource = new Database(sourcePath);
    try {
      normalizeSource.pragma("wal_checkpoint(TRUNCATE)");
      normalizeSource.pragma("journal_mode = DELETE");
    } finally {
      normalizeSource.close();
    }
    const sourceBefore = snapshotCatalogFiles(sourcePath);
    const source = openReadOnlyCatalog(sourcePath, { env: {} });
    try {
      const backup = await backupCatalogToDisposableCopy(
        source,
        auditPath,
        tempRoot,
      );
      assertCondition(
        backup.destinationPath === auditPath && backup.remainingPages === 0,
        "Pre-031 source online backup did not complete inside the owned root.",
      );
    } finally {
      source.close();
    }

    const preMigrationCopy = openReadOnlyCatalog(auditPath, { env: {} });
    let sourceProvenance;
    try {
      sourceProvenance = captureSourceInventoryProvenance(preMigrationCopy);
      assertCondition(
        preMigrationCopy.get(
          "SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'schema_migrations'",
        ) === undefined,
        "Audit provenance invented a schema_migrations table.",
      );
    } finally {
      preMigrationCopy.close();
    }

    const writableCopy = createClient({ url: `file:${auditPath}` });
    try {
      await migrateDatabase(writableCopy);
      await writableCopy.execute("PRAGMA wal_checkpoint(TRUNCATE)");
    } finally {
      writableCopy.close();
    }

    const migratedCopy = openReadOnlyCatalog(auditPath, { env: {} });
    try {
      const provenance = captureInventoryAuditProvenance(
        migratedCopy,
        sourceProvenance,
      );
      const result = runReadinessAudit(migratedCopy, provenance);
      assertCondition(
        provenance.source_schema_max_migration === 30 &&
          provenance.source_schema_migration_name === MIGRATION_030 &&
          provenance.source_schema_migration_checksum ===
            sha256File(path.join(MIGRATIONS_DIR, MIGRATION_030)),
        `Source migration provenance is not exact 030: ${JSON.stringify(provenance)}.`,
      );
      assertCondition(
        provenance.audit_schema_max_migration === 31 &&
          provenance.audit_schema_migration_name === MIGRATION_031 &&
          provenance.audit_schema_migration_checksum ===
            sha256File(path.join(MIGRATIONS_DIR, MIGRATION_031)) &&
          provenance.audit_database_kind ===
            "owned_disposable_migrated_copy",
        `Audit migration provenance is not exact 031: ${JSON.stringify(provenance)}.`,
      );
      assertCondition(
        result.rows.length > 0 &&
          result.rows.every(
            (row) =>
              row.source_inventory_snapshot_id ===
              provenance.source_inventory_snapshot_id,
          ),
        "Post-migration readiness did not retain the pre-migration inventory snapshot identity.",
      );
    } finally {
      migratedCopy.close();
    }

    assertCatalogSnapshotUnchanged(sourceBefore, snapshotCatalogFiles(sourcePath));
  });

  console.log(
    "Audit backup migration passed: source provenance is exact migration 030, readiness runs only on the owned canonical 031 copy, and source main/WAL/SHM remain unchanged.",
  );
}

type AuditCliJson = {
  summary: {
    inventory_audited: number;
    backlog: number;
  };
  verdict: {
    inventory_complete: boolean;
    content_complete: boolean;
    public_clean: boolean;
  };
  exit_code: number;
  console_row_count: number;
  rows: Array<{ entity_id: string }>;
};

type AuditCliResult = {
  status: number;
  stdout: string;
  stderr: string;
  json: AuditCliJson | null;
};

function runAuditCli(
  args: readonly string[],
  envOverrides: NodeJS.ProcessEnv = {},
): AuditCliResult {
  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  const child = spawnSync(process.execPath, [tsxCli, AUDIT_CLI_PATH, ...args], {
    cwd: ROOT,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
      PUBLICATION_GATE_FIXTURE: "",
      ...envOverrides,
    },
    encoding: "utf8",
    timeout: 30_000,
  });
  assertCondition(
    !child.error,
    `Audit CLI failed to start: ${child.error?.message ?? "unknown error"}.`,
  );
  assertCondition(
    child.signal === null,
    `Audit CLI exited by signal: ${child.signal ?? "unknown"}.`,
  );
  const stdout = child.stdout ?? "";
  const stderr = child.stderr ?? "";
  let json: AuditCliJson | null = null;
  const finalLine = stdout.trim().split("\n").at(-1);
  if (finalLine?.startsWith("{")) {
    json = JSON.parse(finalLine) as AuditCliJson;
  }
  return { status: child.status ?? -1, stdout, stderr, json };
}

function artifactPaths(outDir: string): string[] {
  return ARTIFACT_FILES.map((file) => path.join(outDir, file));
}

function readArtifacts(outDir: string): Map<string, Buffer> {
  const result = new Map<string, Buffer>();
  for (const file of ARTIFACT_FILES) {
    const filePath = path.join(outDir, file);
    assertCondition(fs.existsSync(filePath), `Missing audit artifact: ${filePath}.`);
    result.set(file, fs.readFileSync(filePath));
  }
  return result;
}

function artifactHashes(artifacts: ReadonlyMap<string, Buffer>): string[] {
  return ARTIFACT_FILES.map((file) =>
    createHash("sha256").update(artifacts.get(file) ?? Buffer.alloc(0)).digest("hex"),
  );
}

function parseCsv(csv: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]!;
    if (quoted) {
      if (character === '"') {
        if (csv[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }
    if (character === '"' && field === "") {
      quoted = true;
    } else if (character === ",") {
      record.push(field);
      field = "";
    } else if (character === "\r" && csv[index + 1] === "\n") {
      record.push(field);
      records.push(record);
      record = [];
      field = "";
      index += 1;
    } else if (character === "\n") {
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += character;
    }
  }
  assertCondition(!quoted, "CSV parser ended inside a quoted field.");
  assertCondition(
    record.length === 0 && field === "",
    "CSV artifact did not end on a complete record boundary.",
  );
  return records;
}

async function seedArtifactFixture(client: Client): Promise<void> {
  await client.execute({
    sql: `
      INSERT INTO entities (id, type, slug, name, summary, body_md, source)
      VALUES ('audit-csv-formula', 'brand', 'audit-csv-formula', ?, '', '', 'audit-fixture')
    `,
    args: [CSV_FORMULA_NAME],
  });
  await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");
}

async function runArtifactsLimitContract(): Promise<void> {
  assertCondition(
    fs.existsSync(AUDIT_CLI_PATH),
    "Canonical readiness artifact CLI is not implemented.",
  );
  await withPhase19Fixture(async ({ client, databasePath, tempRoot }) => {
    await seedArtifactFixture(client);
    const outUnlimited = path.join(tempRoot, "artifacts-unlimited");
    const outRepeat = path.join(tempRoot, "artifacts-repeat");
    const outLimited = path.join(tempRoot, "artifacts-limit-1");
    const common = ["--database-path", databasePath, "--json"];
    const unlimited = runAuditCli([...common, "--out-dir", outUnlimited]);
    const repeat = runAuditCli([...common, "--out-dir", outRepeat]);
    const limited = runAuditCli([
      ...common,
      "--out-dir",
      outLimited,
      "--limit",
      "1",
    ]);
    assertCondition(
      unlimited.status === 1 && repeat.status === 1 && limited.status === 1,
      `Content-gate exit semantics diverged: ${unlimited.status}/${repeat.status}/${limited.status}.`,
    );
    assertCondition(
      unlimited.json && repeat.json && limited.json,
      `Audit CLI did not emit JSON: ${unlimited.stderr}${repeat.stderr}${limited.stderr}`,
    );
    const unlimitedArtifacts = readArtifacts(outUnlimited);
    const repeatArtifacts = readArtifacts(outRepeat);
    const limitedArtifacts = readArtifacts(outLimited);
    assertCondition(
      JSON.stringify(artifactHashes(unlimitedArtifacts)) ===
        JSON.stringify(artifactHashes(repeatArtifacts)) &&
        JSON.stringify(artifactHashes(unlimitedArtifacts)) ===
          JSON.stringify(artifactHashes(limitedArtifacts)),
      "Repeat and limit=1 canonical artifact hashes differ.",
    );
    assertCondition(
      JSON.stringify(unlimited.json.summary) ===
        JSON.stringify(limited.json.summary) &&
        JSON.stringify(unlimited.json.verdict) ===
          JSON.stringify(limited.json.verdict) &&
        unlimited.json.exit_code === limited.json.exit_code,
      "Limit changed summary, verdict, or exit semantics.",
    );
    assertCondition(
      unlimited.json.console_row_count ===
        unlimited.json.summary.inventory_audited &&
        limited.json.console_row_count === 1 &&
        limited.json.rows.length === 1,
      "Limit did not remain isolated to terminal preview rows.",
    );

    const ndjson = String(
      unlimitedArtifacts.get("inventory-readiness-v2.ndjson"),
    );
    assertCondition(ndjson.endsWith("\n"), "NDJSON lacks a trailing newline.");
    const ndjsonRows = ndjson
      .trimEnd()
      .split("\n")
      .map((line) => JSON.parse(line) as { entity_id: string; name: string });
    assertCondition(
      ndjsonRows.length === unlimited.json.summary.inventory_audited &&
        new Set(ndjsonRows.map((row) => row.entity_id)).size === ndjsonRows.length,
      "NDJSON is not exactly one row per complete inventory identity.",
    );
    assertCondition(
      ndjsonRows.find((row) => row.entity_id === "audit-csv-formula")?.name ===
        CSV_FORMULA_NAME,
      "NDJSON did not preserve the canonical formula-like text.",
    );

    const csvRecords = parseCsv(
      String(unlimitedArtifacts.get("inventory-readiness-v2.csv")),
    );
    const header = csvRecords[0] ?? [];
    assertCondition(
      csvRecords.length === ndjsonRows.length + 1 &&
        csvRecords.every((record) => record.length === header.length),
      "CSV logical row count or fixed-column width differs from NDJSON.",
    );
    const entityIndex = header.indexOf("entity_id");
    const nameIndex = header.indexOf("name");
    const formulaRecord = csvRecords.find(
      (record) => record[entityIndex] === "audit-csv-formula",
    );
    assertCondition(
      formulaRecord?.[nameIndex] === `'${CSV_FORMULA_NAME}`,
      "CSV formula protection or comma/quote/CRLF escaping failed.",
    );
    const summaryBytes = String(
      unlimitedArtifacts.get("inventory-readiness-v2-summary.json"),
    );
    assertCondition(
      !/(checked_at|timestamp|hostname|out_dir|output_path)/i.test(summaryBytes),
      "Canonical summary contains run-specific clock, host, or output path metadata.",
    );
  });

  console.log(
    "Audit artifact contract passed: repeat and limit=1 bytes, hashes, summary, verdict, and exit semantics are identical; only terminal preview is limited.",
  );
}

function assertCliFailure(
  args: readonly string[],
  expectedMessage: string,
  watchedPaths: readonly string[],
  envOverrides: NodeJS.ProcessEnv = {},
): void {
  const before = watchedPaths.map((filePath) => ({
    filePath,
    exists: fs.existsSync(filePath),
    hash:
      fs.existsSync(filePath) && fs.statSync(filePath).isFile()
        ? sha256File(filePath)
        : null,
  }));
  const result = runAuditCli(args, envOverrides);
  assertCondition(result.status !== 0, `Invalid CLI input unexpectedly passed: ${args.join(" ")}.`);
  assertCondition(
    `${result.stderr}\n${result.stdout}`.includes(expectedMessage),
    `Invalid CLI input did not report ${JSON.stringify(expectedMessage)}: ${result.stderr}${result.stdout}`,
  );
  for (const item of before) {
    assertCondition(
      fs.existsSync(item.filePath) === item.exists,
      `Invalid CLI input changed path existence: ${item.filePath}.`,
    );
    if (item.exists && item.hash) {
      assertCondition(
        sha256File(item.filePath) === item.hash,
        `Invalid CLI input changed existing file bytes: ${item.filePath}.`,
      );
    }
  }
}

async function runCliInputsContract(): Promise<void> {
  assertCondition(
    fs.existsSync(AUDIT_CLI_PATH),
    "Canonical readiness artifact CLI is not implemented.",
  );
  await withPhase19Fixture(async ({ tempRoot }) => {
    const inputSource = createCheckpointedWalFixture(tempRoot);
    const { databasePath } = inputSource;
    const sourcePaths = [
      databasePath,
      `${databasePath}-wal`,
      `${databasePath}-shm`,
    ];
    assertCondition(
      sourcePaths.every((filePath) => fs.existsSync(filePath)),
      "CLI input fixture requires main/WAL/SHM source files.",
    );
    try {
      const validOut = path.join(tempRoot, "valid-out");
      const base = ["--database-path", databasePath, "--out-dir", validOut];
      assertCliFailure(
        ["--database-path", databasePath],
        "--out-dir is required",
        sourcePaths,
      );
      assertCliFailure(
        ["--database-path", databasePath, "--out-dir", "relative-output"],
        "--out-dir must be absolute",
        sourcePaths,
      );
      assertCliFailure(
        ["--database-path", "relative.db", "--out-dir", validOut],
        "--database-path must be absolute",
        sourcePaths,
      );
      for (const invalidLimit of [
        "0",
        "-1",
        "1.5",
        "NaN",
        "Infinity",
        "1000001",
      ]) {
        assertCliFailure(
          [...base, "--limit", invalidLimit],
          "--limit must be a decimal integer from 1 to 1000000",
          [...sourcePaths, ...artifactPaths(validOut)],
        );
      }

      const databaseSymlink = path.join(tempRoot, "database-link.db");
      fs.symlinkSync(databasePath, databaseSymlink);
      assertCliFailure(
        ["--database-path", databaseSymlink, "--out-dir", validOut],
        "--database-path must not be a symlink",
        sourcePaths,
      );
      const escapeRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "fpkg-audit-out-escape-"),
      );
      try {
        const outputSymlink = path.join(tempRoot, "output-link");
        fs.symlinkSync(escapeRoot, outputSymlink, "dir");
        assertCliFailure(
          ["--database-path", databasePath, "--out-dir", outputSymlink],
          "--out-dir must not traverse a symlink",
          sourcePaths,
        );
      } finally {
        fs.rmSync(escapeRoot, { recursive: true, force: true });
      }

      const aliasCases = [
        [sourcePaths[0]!, ARTIFACT_FILES[0]],
        [sourcePaths[1]!, ARTIFACT_FILES[1]],
        [sourcePaths[2]!, ARTIFACT_FILES[2]],
      ] as const;
      for (const [sourcePath, artifactFile] of aliasCases) {
        const aliasOut = path.join(tempRoot, `alias-${artifactFile}`);
        fs.mkdirSync(aliasOut);
        const aliasTarget = path.join(aliasOut, artifactFile);
        fs.linkSync(sourcePath, aliasTarget);
        const aliasSnapshot = snapshotCatalogFiles(databasePath);
        assertCliFailure(
          ["--database-path", databasePath, "--out-dir", aliasOut],
          "artifact target aliases the source database family",
          [...sourcePaths, ...artifactPaths(aliasOut)],
        );
        assertCatalogSnapshotUnchanged(
          aliasSnapshot,
          snapshotCatalogFiles(databasePath),
        );
      }

      const nonFileOut = path.join(tempRoot, "non-file-target");
      fs.mkdirSync(nonFileOut);
      fs.mkdirSync(path.join(nonFileOut, ARTIFACT_FILES[0]));
      assertCliFailure(
        ["--database-path", databasePath, "--out-dir", nonFileOut],
        "artifact target must be a regular file",
        sourcePaths,
      );
      const symlinkTargetOut = path.join(tempRoot, "symlink-target");
      fs.mkdirSync(symlinkTargetOut);
      fs.symlinkSync(
        databasePath,
        path.join(symlinkTargetOut, ARTIFACT_FILES[0]),
      );
      assertCliFailure(
        ["--database-path", databasePath, "--out-dir", symlinkTargetOut],
        "artifact target must not be a symlink",
        sourcePaths,
      );
      const finalSourceSnapshot = snapshotCatalogFiles(databasePath);
      assertCliFailure(
        base,
        "Turso database selection is forbidden",
        sourcePaths,
        { TURSO_DATABASE_URL: "libsql://example.invalid" },
      );
      assertCatalogSnapshotUnchanged(
        finalSourceSnapshot,
        snapshotCatalogFiles(databasePath),
      );
    } finally {
      inputSource.database.close();
    }
  });

  console.log(
    "Audit CLI input contract passed: invalid limits, implicit/relative/symlink paths, and DB/WAL/SHM aliases all fail before artifact writes.",
  );
}

type LegacyAuditJson = {
  summary: { inventory_audited: number; backlog: number };
  rows: Array<{
    entity_id: string;
    blocker_count: number;
    content_ready: boolean;
  }>;
  counts?: Record<string, number>;
  summaries?: unknown[];
  priorityBrands?: unknown[];
  priorityPens?: unknown[];
};

function runLegacyAuditScript(
  scriptName: "audit-entity-quality.ts" | "audit-library-coverage.ts",
  databasePath: string,
  limit: number | null,
): { status: number; json: LegacyAuditJson; stderr: string } {
  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  const args = [
    tsxCli,
    path.join(ROOT, "scripts", scriptName),
    "--database-path",
    databasePath,
    "--json",
  ];
  if (limit !== null) args.push(`--limit=${limit}`);
  const child = spawnSync(process.execPath, args, {
    cwd: ROOT,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
      PUBLICATION_GATE_FIXTURE: "",
    },
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    timeout: 30_000,
  });
  assertCondition(!child.error, `Legacy audit failed to start: ${child.error?.message}.`);
  assertCondition(child.signal === null, `Legacy audit exited by ${child.signal}.`);
  const finalLine = (child.stdout ?? "").trim().split("\n").at(-1);
  assertCondition(finalLine?.startsWith("{"), `Legacy audit emitted no JSON: ${child.stderr}.`);
  return {
    status: child.status ?? -1,
    json: JSON.parse(finalLine) as LegacyAuditJson,
    stderr: child.stderr ?? "",
  };
}

async function seedLegacyStatusFixtures(client: Client): Promise<void> {
  await client.execute(`
    INSERT INTO entities (id, type, slug, name, summary, body_md, source)
    VALUES
      ('legacy-deprecated', 'brand', 'legacy-deprecated', 'Legacy deprecated', '', '', 'audit-fixture'),
      ('legacy-pending', 'brand', 'legacy-pending', 'Legacy pending', '', '', 'audit-fixture'),
      ('legacy-needs-source', 'pen', 'legacy-needs-source', 'Legacy needs source', '', '', 'audit-fixture'),
      ('legacy-candidate', 'brand', 'legacy-candidate', 'Legacy candidate', '', '', 'audit-fixture'),
      ('legacy-draft', 'brand', 'legacy-draft', 'Legacy draft', '', '', 'audit-fixture')
  `);
  await client.execute(`
    INSERT INTO stories (id, entity_id, title, story_type, body_md, status)
    VALUES ('legacy-deprecated-story', 'legacy-deprecated', 'Deprecated',
            'brand_story', 'Deprecated status must remain backlog.', 'deprecated')
  `);
  await client.execute(`
    INSERT INTO claims (
      id, subject_entity_id, predicate, object_text, review_status, fact_class
    ) VALUES (
      'legacy-pending-claim', 'legacy-pending', 'status', 'pending evidence',
      'pending', 'core'
    )
  `);
  await client.execute(`
    INSERT INTO model_specs (id, entity_id, series_name, review_status)
    VALUES ('legacy-needs-source-spec', 'legacy-needs-source', 'Unqualified',
            'needs_source')
  `);
  await client.execute(`
    INSERT INTO media_assets (
      id, entity_id, title, asset_type, image_url, license,
      review_status, usage_status
    ) VALUES (
      'legacy-candidate-media', 'legacy-candidate', 'Candidate media', 'image',
      '/images/candidate.png', 'cc-by', 'approved', 'candidate'
    )
  `);
}

async function runLegacyAuditsContract(): Promise<void> {
  await withPhase19Fixture(async ({ client, databasePath }) => {
    const brand = await seedQualifiedPublicationFixture(client, {
      entityId: "legacy-ready-brand",
      entityType: "brand",
    });
    await approveAndPublish(client, brand.entityId);
    const pen = await seedQualifiedPublicationFixture(client, {
      entityId: "legacy-ready-pen",
      entityType: "pen",
      brandEntityId: brand.entityId,
    });
    await approveAndPublish(client, pen.entityId);
    const singleBlocker = await seedQualifiedPublicationFixture(client, {
      entityId: "legacy-single-blocker",
      entityType: "brand",
    });
    await approveAndPublish(client, singleBlocker.entityId);
    await client.execute({
      sql: `UPDATE entity_content_reviews
            SET status = 'revoked', updated_at = datetime('now')
            WHERE entity_id = ? AND review_kind = 'fact' AND status = 'approved'`,
      args: [singleBlocker.entityId],
    });
    await seedLegacyStatusFixtures(client);
    await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");

    const auditClient = openReadOnlyCatalog(databasePath, { env: {} });
    try {
      const source = captureSourceInventoryProvenance(auditClient);
      const provenance = captureInventoryAuditProvenance(auditClient, source);
      const result = runReadinessAudit(auditClient, provenance);
      const byId = new Map(result.rows.map((row) => [row.entity_id, row]));
      assertCondition(
        byId.get("legacy-ready-brand")?.content_ready === true &&
          byId.get("legacy-ready-pen")?.content_ready === true,
        "Qualified contract-v2 fixtures were not ready.",
      );
      assertCondition(
        byId.get("legacy-single-blocker")?.blocker_count === 1 &&
          byId.get("legacy-single-blocker")?.blocker_codes[0] ===
            "missing_fact_review" &&
          byId.get("legacy-single-blocker")?.content_ready === false,
        "One hard blocker was offset by otherwise complete content.",
      );
      assertCondition(
        byId.get("legacy-deprecated")?.published_story_count === 0 &&
          byId.get("legacy-deprecated")?.backlog_story_count === 1 &&
          byId.get("legacy-pending")?.qualified_core_claim_count === 0 &&
          byId.get("legacy-pending")?.backlog_claim_count === 1 &&
          byId.get("legacy-needs-source")?.approved_model_spec_count === 0 &&
          byId.get("legacy-needs-source")?.backlog_model_spec_count === 1 &&
          byId.get("legacy-candidate")?.qualified_primary_media_count === 0 &&
          byId.get("legacy-draft")?.publication_status === "draft",
        "Deprecated/pending/needs_source/candidate/draft status inflated qualification.",
      );
    } finally {
      auditClient.close();
    }

    for (const scriptName of [
      "audit-entity-quality.ts",
      "audit-library-coverage.ts",
    ] as const) {
      const unlimited = runLegacyAuditScript(scriptName, databasePath, null);
      const limited = runLegacyAuditScript(scriptName, databasePath, 1);
      assertCondition(
        unlimited.status === 1 && limited.status === 1,
        `${scriptName} limit changed complete failure exit semantics: ${unlimited.status}/${limited.status}.`,
      );
      assertCondition(
        JSON.stringify(unlimited.json) === JSON.stringify(limited.json),
        `${scriptName} limit changed JSON scan, summary, or complete rows.`,
      );
      assertCondition(
        unlimited.json.rows.length === unlimited.json.summary.inventory_audited,
        `${scriptName} JSON omitted canonical inventory rows.`,
      );
    }

    const libraryModule = await import("../src/lib/library");
    const modelSpec = await libraryModule.getModelSpec("legacy-ready-pen");
    assertCondition(modelSpec, "Qualified public model spec was not returned.");
    const specFieldMap = {
      series_name: modelSpec.series_name,
      release_year: modelSpec.release_year,
      origin_country: modelSpec.origin_country,
      nib: modelSpec.nib,
      fill_system: modelSpec.fill_system,
      material: modelSpec.material,
      dimensions: modelSpec.dimensions,
      weight: modelSpec.weight,
      price_range: modelSpec.price_range,
      status: modelSpec.status,
      brand_entity_id: modelSpec.brand_slug,
    } as const;
    for (const [fieldKey, value] of Object.entries(specFieldMap)) {
      if (value === null || value === undefined) continue;
      const evidence = await client.execute({
        sql: `SELECT 1
              FROM publication_v2_field_evidence
              WHERE model_spec_id = ? AND field_key = ?
              LIMIT 1`,
        args: [modelSpec.id, fieldKey],
      });
      assertCondition(
        evidence.rows.length === 1,
        `getModelSpec leaked an unqualified field: ${fieldKey}.`,
      );
    }
    assertCondition(
      (await libraryModule.getModelSpec("legacy-needs-source")) === undefined,
      "getModelSpec bypassed public_entities for a blocked owner.",
    );
    const coverage = await libraryModule.getLibraryCoverageReport(1_000_000);
    const coverageRows = [
      ...coverage.priorityBrands,
      ...coverage.priorityPens,
    ];
    const coverageById = new Map(coverageRows.map((row) => [row.id, row]));
    assertCondition(
      coverageById.get("legacy-ready-brand")?.coverage_status === "ready" &&
        coverageById.get("legacy-ready-pen")?.coverage_status === "ready" &&
        coverageById.get("legacy-single-blocker")?.coverage_status !== "ready",
      "Library coverage used a score instead of hard-blocker readiness truth.",
    );
    assertCondition(
      coverageById.get("legacy-deprecated")?.story_count === 0 &&
        coverageById.get("legacy-pending")?.claim_count === 0 &&
        coverageById.get("legacy-needs-source")?.model_spec_count === 0 &&
        coverageById.get("legacy-candidate")?.media_count === 0,
      "Library coverage counted an unqualified legacy status.",
    );
  });

  console.log(
    "Legacy audit contract passed: entity/library reports share complete contract-v2 truth, one blocker fails, limit changes console only, and public specs expose qualified fields only.",
  );
}

function libraryContractTempRoots(): Set<string> {
  return new Set(
    fs
      .readdirSync(os.tmpdir())
      .filter((entry) => entry.startsWith("fpkg-library-contract-"))
      .map((entry) => path.join(os.tmpdir(), entry)),
  );
}

function runLibraryContractChild(
  args: readonly string[],
  env: NodeJS.ProcessEnv = {},
): ReturnType<typeof spawnSync> {
  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  return spawnSync(process.execPath, [tsxCli, LIBRARY_CONTRACT_PATH, ...args], {
    cwd: ROOT,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
      PUBLICATION_GATE_FIXTURE: "",
      ...env,
    },
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    timeout: 30_000,
  });
}

async function runLibraryContractSafety(): Promise<void> {
  const checkerSource = fs.readFileSync(LIBRARY_CONTRACT_PATH, "utf8");
  assertCondition(
    checkerSource.includes("backupCatalogToDisposableCopy") &&
      checkerSource.includes("snapshotCatalogFiles") &&
      checkerSource.includes("--database-path"),
    "Library contract checker has not adopted the protected online-backup seam.",
  );

  const realBefore = snapshotRealCatalogInvariant();
  await withPhase19Fixture(async (fixture) => {
    await fixture.client.execute("PRAGMA wal_checkpoint(TRUNCATE)");
    fixture.client.close();
    const sourceBefore = snapshotCatalogFiles(fixture.databasePath);
    const rootsBefore = libraryContractTempRoots();

    const success = runLibraryContractChild([
      "--database-path",
      fixture.databasePath,
    ]);
    assertCondition(
      !success.error && success.status === 0 && success.signal === null,
      `Library contract owned-copy success probe failed: ${success.stderr || success.stdout}`,
    );
    assertCatalogSnapshotUnchanged(
      sourceBefore,
      snapshotCatalogFiles(fixture.databasePath),
    );

    const corruptPath = path.join(fixture.tempRoot, "corrupt-source.db");
    fs.writeFileSync(corruptPath, "not a sqlite database");
    const corruptBefore = snapshotCatalogFiles(corruptPath);
    const failure = runLibraryContractChild([
      "--database-path",
      corruptPath,
    ]);
    assertCondition(
      !failure.error && failure.status === 1 && failure.signal === null,
      "Library contract failure probe did not fail closed.",
    );
    assertCatalogSnapshotUnchanged(
      corruptBefore,
      snapshotCatalogFiles(corruptPath),
    );

    const symlinkPath = path.join(fixture.tempRoot, "catalog-link.db");
    fs.symlinkSync(fixture.databasePath, symlinkPath);
    const symlink = runLibraryContractChild(["--database-path", symlinkPath]);
    assertCondition(
      symlink.status === 1 &&
        `${symlink.stdout}\n${symlink.stderr}`.includes("must not be a symlink"),
      "Library contract checker accepted a source symlink.",
    );
    const remote = runLibraryContractChild([
      "--database-path",
      "libsql://example.invalid/catalog",
    ]);
    assertCondition(
      remote.status === 1 &&
        `${remote.stdout}\n${remote.stderr}`.includes("local file"),
      "Library contract checker accepted a remote database URL.",
    );
    const remoteEnvironment = runLibraryContractChild(
      ["--database-path", fixture.databasePath],
      {
        TURSO_DATABASE_URL: "libsql://example.invalid/catalog",
        TURSO_AUTH_TOKEN: "must-not-appear",
      },
    );
    const remoteEnvironmentOutput = `${remoteEnvironment.stdout}\n${remoteEnvironment.stderr}`;
    assertCondition(
      remoteEnvironment.status === 1 &&
        remoteEnvironmentOutput.includes("Turso database selection is forbidden") &&
        !remoteEnvironmentOutput.includes("must-not-appear"),
      "Library contract checker did not reject remote environment selection safely.",
    );

    const reportFile = path.join(
      fixture.tempRoot,
      `library-signal-${process.pid}.json`,
    );
    const require = createRequire(import.meta.url);
    const tsxCli = require.resolve("tsx/cli");
    const signalOutput: string[] = [];
    const signalChild = spawn(
      process.execPath,
      [
        tsxCli,
        LIBRARY_CONTRACT_PATH,
        "--database-path",
        fixture.databasePath,
        "--signal-probe-report",
        reportFile,
      ],
      {
        cwd: ROOT,
        env: {
          ...process.env,
          TURSO_DATABASE_URL: "",
          TURSO_AUTH_TOKEN: "",
          FPKG_DATABASE_URL: "",
          PUBLICATION_GATE_FIXTURE: "",
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    signalChild.stdout?.on("data", (chunk) => signalOutput.push(String(chunk)));
    signalChild.stderr?.on("data", (chunk) => signalOutput.push(String(chunk)));
    try {
      await waitForFile(reportFile, 10_000);
      const report = JSON.parse(fs.readFileSync(reportFile, "utf8")) as {
        tempRoot: string;
        databasePath: string;
      };
      assertCondition(
        fs.existsSync(report.tempRoot) && fs.existsSync(report.databasePath),
        "Library contract signal probe did not expose its owned copy.",
      );
      signalChild.kill("SIGTERM");
      assertCondition(
        await waitForChildExit(signalChild, 8_000),
        "Library contract signal probe did not exit after SIGTERM.",
      );
      assertCondition(
        !fs.existsSync(report.tempRoot),
        "Library contract SIGTERM cleanup left its owned root behind.",
      );
    } catch (error) {
      await stopChild(signalChild);
      throw new Error(
        `Library contract signal cleanup failed: ${
          error instanceof Error ? error.message : String(error)
        }. ${signalOutput.join("")}`,
        { cause: error },
      );
    } finally {
      fs.rmSync(reportFile, { force: true });
    }

    assertCatalogSnapshotUnchanged(
      sourceBefore,
      snapshotCatalogFiles(fixture.databasePath),
    );
    const rootsAfter = libraryContractTempRoots();
    assertCondition(
      JSON.stringify([...rootsBefore].sort()) ===
        JSON.stringify([...rootsAfter].sort()),
      "Library contract probes leaked an owned temporary root.",
    );
  });
  snapshotRealCatalogInvariant(realBefore);

  console.log(
    "Library contract safety passed: protected backup/migration, real/remote/symlink rejection, failure cleanup, SIGTERM cleanup, and current real main/WAL/SHM snapshot preservation.",
  );
}

function createCheckpointedWalFixture(tempRoot: string): {
  database: Database.Database;
  databasePath: string;
} {
  const databasePath = path.join(tempRoot, "readonly-source.db");
  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.exec(
    "CREATE TABLE probe_rows(id INTEGER PRIMARY KEY, label TEXT NOT NULL)",
  );
  database.prepare("INSERT INTO probe_rows(label) VALUES (?)").run("alpha");
  database.pragma("wal_checkpoint(TRUNCATE)");
  return { database, databasePath };
}

function createCrashWalFixture(tempRoot: string): string {
  const databasePath = path.join(tempRoot, "wal-source.db");
  const childSource = `
    const Database = require("better-sqlite3");
    const database = new Database(${JSON.stringify(databasePath)});
    database.pragma("journal_mode = WAL");
    database.pragma("wal_autocheckpoint = 0");
    database.exec("CREATE TABLE probe_rows(id INTEGER PRIMARY KEY, label TEXT NOT NULL)");
    database.prepare("INSERT INTO probe_rows(label) VALUES (?)").run("wal-only-row");
    process.exit(0);
  `;
  const child = spawnSync(process.execPath, ["-e", childSource], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  assertCondition(
    child.status === 0,
    `WAL fixture child failed: ${child.stderr || child.stdout}`,
  );
  assertCondition(
    fs.statSync(`${databasePath}-wal`).size > 0,
    "WAL fixture did not retain uncheckpointed rows.",
  );
  assertCondition(
    fs.existsSync(`${databasePath}-shm`),
    "WAL fixture did not retain its shared-memory sidecar.",
  );

  for (const filePath of [
    databasePath,
    `${databasePath}-wal`,
    `${databasePath}-shm`,
  ]) {
    fs.chmodSync(filePath, 0o444);
  }
  fs.chmodSync(tempRoot, 0o555);
  return databasePath;
}

async function runReadOnlyIsolation(): Promise<void> {
  await withOwnedTempRoot("fpkg-audit-readonly-", async (tempRoot) => {
    const fixture = createCheckpointedWalFixture(tempRoot);
    try {
      const missingPath = path.join(tempRoot, "missing.db");
      expectThrow(
        () => openReadOnlyCatalog("data/fpkg.db", { env: {} }),
        "absolute local filesystem path",
      );
      for (const remotePath of [
        "libsql://example.invalid/catalog",
        "https://example.invalid/catalog.db",
        "http://example.invalid/catalog.db",
      ]) {
        expectThrow(
          () => openReadOnlyCatalog(remotePath, { env: {} }),
          "remote database URLs are forbidden",
        );
      }
      expectThrow(
        () => openReadOnlyCatalog(missingPath, { env: {} }),
        "does not exist",
      );
      const tursoError = expectThrow(
        () =>
          openReadOnlyCatalog(fixture.databasePath, {
            env: {
              TURSO_DATABASE_URL: "libsql://example.invalid",
              TURSO_AUTH_TOKEN: "must-not-appear",
            },
          }),
        "Turso database selection is forbidden",
      );
      assertCondition(
        !tursoError.message.includes("example.invalid") &&
          !tursoError.message.includes("must-not-appear"),
        "Turso rejection leaked credential-bearing environment values.",
      );

      const before = snapshotCatalogFiles(fixture.databasePath);
      const client = openReadOnlyCatalog(fixture.databasePath, { env: {} });
      assertCondition(
        JSON.stringify(Object.keys(client).sort()) ===
          JSON.stringify(["all", "close", "get"]),
        `AuditReadClient exposed an unexpected runtime surface: ${Object.keys(client).sort().join(", ")}`,
      );
      try {
        const queryOnly = client.get<{ query_only: number }>("PRAGMA query_only");
        assertCondition(
          Number(queryOnly?.query_only) === 1,
          "Read-only catalog did not verify PRAGMA query_only=ON.",
        );
        const rows = client.all<ProbeRow>(
          "SELECT id, label FROM probe_rows WHERE label = ? ORDER BY id",
          ["alpha"],
        );
        assertCondition(
          rows.length === 1 && rows[0]?.label === "alpha",
          "Parameterized read did not return the fixture row.",
        );

        for (const sql of [
          "INSERT INTO probe_rows(label) VALUES ('forbidden')",
          "UPDATE probe_rows SET label = 'forbidden'",
          "CREATE TABLE forbidden_write(id INTEGER)",
        ]) {
          expectThrow(() => client.all(sql), "read-only statements");
        }
      } finally {
        client.close();
      }
      expectThrow(() => client.all("SELECT 1"), "closed");

      const after = snapshotCatalogFiles(fixture.databasePath);
      assertCatalogSnapshotUnchanged(before, after);
      assertCondition(
        after.wal.exists && after.shm.exists,
        "Read-only cleanup removed a pre-existing WAL or SHM sidecar.",
      );
    } finally {
      fixture.database.close();
    }
  });

  console.log(
    "Audit readonly isolation passed: explicit local reads only; remote/write paths rejected; main/WAL/SHM unchanged.",
  );
}

async function runReadOnlyBackup(): Promise<void> {
  await withOwnedTempRoot("fpkg-audit-wal-source-", async (sourceRoot) => {
    const sourcePath = createCrashWalFixture(sourceRoot);
    const sourceBefore = snapshotCatalogFiles(sourcePath);

    await withOwnedTempRoot("fpkg-audit-backup-", async (ownedRoot) => {
      await withOwnedTempRoot("fpkg-audit-escape-", async (escapeRoot) => {
        const outsideDestination = path.join(escapeRoot, "outside.db");
        const symlinkParent = path.join(ownedRoot, "escape-link");
        fs.symlinkSync(escapeRoot, symlinkParent, "dir");

        const client = openReadOnlyCatalog(sourcePath, { env: {} });
        try {
          await expectAsyncThrow(
            () =>
              backupCatalogToDisposableCopy(
                client,
                outsideDestination,
                ownedRoot,
              ),
            "inside the caller-owned root",
          );
          await expectAsyncThrow(
            () => backupCatalogToDisposableCopy(client, sourcePath, sourceRoot),
            "must not be the source catalog or a sidecar",
          );
          await expectAsyncThrow(
            () =>
              backupCatalogToDisposableCopy(
                client,
                path.join(symlinkParent, "escaped.db"),
                ownedRoot,
              ),
            "inside the caller-owned root",
          );

          const existingDestination = path.join(ownedRoot, "existing.db");
          fs.writeFileSync(existingDestination, "owned-but-not-disposable");
          await expectAsyncThrow(
            () =>
              backupCatalogToDisposableCopy(
                client,
                existingDestination,
                ownedRoot,
              ),
            "must not already exist",
          );

          const destinationPath = path.join(ownedRoot, "catalog-backup.db");
          const result = await backupCatalogToDisposableCopy(
            client,
            destinationPath,
            ownedRoot,
          );
          assertCondition(
            result.destinationPath === fs.realpathSync.native(destinationPath),
            "Backup result did not return the canonical destination path.",
          );
          assertCatalogSnapshotUnchanged(
            result.sourceSnapshotBefore,
            result.sourceSnapshotAfter,
          );

          const backup = new Database(destinationPath, {
            readonly: true,
            fileMustExist: true,
          });
          try {
            const rows = backup
              .prepare("SELECT id, label FROM probe_rows ORDER BY id")
              .all() as ProbeRow[];
            assertCondition(
              rows.length === 1 && rows[0]?.label === "wal-only-row",
              "SQLite online backup omitted the source WAL row.",
            );
          } finally {
            backup.close();
          }

          const copyClient = createClient({ url: `file:${destinationPath}` });
          try {
            await migrateDatabase(copyClient);
            await copyClient.execute({
              sql: "INSERT INTO probe_rows(label) VALUES (?)",
              args: ["copy-only-row"],
            });
          } finally {
            copyClient.close();
          }
        } finally {
          client.close();
        }
      });
    });

    const sourceAfter = snapshotCatalogFiles(sourcePath);
    assertCatalogSnapshotUnchanged(sourceBefore, sourceAfter);
    assertCondition(
      sourceAfter.wal.exists && sourceAfter.shm.exists,
      "Backup cleanup removed the source WAL or SHM sidecar.",
    );
  });

  console.log(
    "Audit readonly backup passed: WAL state copied online inside an owned root; copy migration/write left source main/WAL/SHM unchanged.",
  );
}

function hasExited(child: ChildProcess): boolean {
  return child.exitCode !== null || child.signalCode !== null;
}

function waitForChildExit(
  child: ChildProcess,
  timeoutMs: number,
): Promise<boolean> {
  if (hasExited(child)) return Promise.resolve(true);
  return new Promise((resolve) => {
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off("exit", onExit);
      resolve(false);
    }, timeoutMs);
    child.once("exit", onExit);
  });
}

async function stopChild(child: ChildProcess): Promise<void> {
  if (hasExited(child)) return;
  child.kill("SIGTERM");
  if (await waitForChildExit(child, 1_500)) return;
  child.kill("SIGKILL");
  await waitForChildExit(child, 1_500);
}

function processIsAlive(pid: number): boolean {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

async function assertClientClosed(client: Client): Promise<void> {
  try {
    await client.execute("SELECT 1");
  } catch {
    return;
  }
  throw new Error("Phase 19 fixture cleanup left its client usable.");
}

async function waitForFile(filePath: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(filePath)) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Timed out waiting for the Phase 19 signal report.");
}

async function assertSignalCleanup(
  signal: "SIGINT" | "SIGTERM",
): Promise<void> {
  const reportFile = path.join(
    os.tmpdir(),
    `fpkg-phase19-${signal.toLowerCase()}-${process.pid}-${Date.now()}.json`,
  );
  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  const output: string[] = [];
  const child = spawn(
    process.execPath,
    [tsxCli, SCRIPT_PATH, "--signal-probe", "--report", reportFile],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "libsql://example.invalid",
        TURSO_AUTH_TOKEN: "must-not-appear",
        FPKG_DATABASE_URL: "",
        PUBLICATION_GATE_FIXTURE: "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout?.on("data", (chunk) => output.push(String(chunk)));
  child.stderr?.on("data", (chunk) => output.push(String(chunk)));

  try {
    await waitForFile(reportFile, 10_000);
    const report = JSON.parse(fs.readFileSync(reportFile, "utf8")) as {
      tempRoot: string;
      databasePath: string;
      childPid: number;
      remoteCleared: boolean;
    };
    assertCondition(
      fs.existsSync(report.databasePath) && processIsAlive(report.childPid),
      "Signal probe did not create both its fixture database and child.",
    );
    assertCondition(
      report.remoteCleared,
      "Signal probe did not clear inherited remote database selection.",
    );

    child.kill(signal);
    if (!(await waitForChildExit(child, 8_000))) {
      child.kill("SIGKILL");
      throw new Error(`Signal probe did not exit after ${signal}.`);
    }
    assertCondition(
      !fs.existsSync(report.tempRoot),
      `${signal} left its fixture root behind.`,
    );
    assertCondition(
      !processIsAlive(report.childPid),
      `${signal} left its registered child alive.`,
    );
  } catch (error) {
    await stopChild(child);
    throw new Error(
      `Phase 19 ${signal} cleanup probe failed: ${
        error instanceof Error ? error.message : String(error)
      }. ${output.join("")}`,
      { cause: error },
    );
  } finally {
    fs.rmSync(reportFile, { force: true });
  }
}

async function runFixtureIsolation(): Promise<void> {
  const realBefore = snapshotRealCatalogInvariant();
  const realCatalogPath = path.join(ROOT, "data", "fpkg.db");

  expectThrow(
    () =>
      resolveDatabaseConnection({
        TURSO_DATABASE_URL: "libsql://example.invalid",
        FPKG_DATABASE_URL: "file:/tmp/phase19-fixture.db",
      }),
    "mutually exclusive",
  );
  expectThrow(
    () =>
      resolveDatabaseConnection({
        PUBLICATION_GATE_FIXTURE: "1",
        FPKG_DATABASE_URL: "libsql://example.invalid",
      }),
    "must be a file:",
  );
  expectThrow(
    () =>
      resolveDatabaseConnection({
        PUBLICATION_GATE_FIXTURE: "1",
        FPKG_DATABASE_URL: `file:${realCatalogPath}`,
      }),
    "may not use the real data/fpkg.db",
  );

  let successRoot = "";
  let successClient: Client | null = null;
  await withPhase19Fixture(async (fixture) => {
    successRoot = fixture.tempRoot;
    successClient = fixture.client;
    assertCondition(
      process.env.TURSO_DATABASE_URL === "" &&
        process.env.TURSO_AUTH_TOKEN === "" &&
        process.env.FPKG_DATABASE_URL === fixture.databaseUrl &&
        process.env.PUBLICATION_GATE_FIXTURE === "1",
      "Phase 19 fixture did not install its fail-closed environment.",
    );
    const connection = resolveDatabaseConnection();
    assertCondition(
      connection.localPath === fixture.databasePath,
      "Fixture resolver did not select the owned database.",
    );
    const migrations = await fixture.client.execute(
      "SELECT COUNT(*) AS count FROM migrations",
    );
    assertCondition(
      Number(migrations.rows[0]?.count) > 0,
      "Phase 19 fixture did not receive canonical migrations.",
    );
  });
  assertCondition(
    !fs.existsSync(successRoot) && successClient,
    "Successful fixture lifecycle did not remove its temp root.",
  );
  await assertClientClosed(successClient);

  let failureRoot = "";
  let failureClient: Client | null = null;
  let failureChildPid = 0;
  let expectedFailure = false;
  try {
    await withPhase19Fixture(async (fixture) => {
      failureRoot = fixture.tempRoot;
      failureClient = fixture.client;
      const child = fixture.registerChild(
        process.execPath,
        ["-e", "setInterval(() => {}, 1000)"],
        { cwd: ROOT, stdio: "ignore" },
      );
      assertCondition(child.pid, "Failure fixture child has no PID.");
      failureChildPid = child.pid;
      throw new Error("deliberate Phase 19 fixture failure");
    });
  } catch (error) {
    expectedFailure =
      error instanceof Error &&
      error.message === "deliberate Phase 19 fixture failure";
  }
  assertCondition(
    expectedFailure &&
      !fs.existsSync(failureRoot) &&
      !processIsAlive(failureChildPid) &&
      failureClient,
    "Failed fixture lifecycle leaked its root, child, or client.",
  );
  await assertClientClosed(failureClient);

  await assertSignalCleanup("SIGINT");
  await assertSignalCleanup("SIGTERM");
  snapshotRealCatalogInvariant(realBefore);

  console.log(
    "Audit fixture isolation passed: success, failure, SIGINT, and SIGTERM cleaned owned clients, children, and roots; real main/WAL/SHM unchanged.",
  );
}

async function runSignalProbe(reportFile: string): Promise<void> {
  installPhase19FixtureSignalHandlers();
  const fixture = await createPhase19Fixture("fpkg-phase19-signal-probe-");
  try {
    const child = fixture.registerChild(
      process.execPath,
      ["-e", "setInterval(() => {}, 1000)"],
      { cwd: ROOT, stdio: "ignore" },
    );
    assertCondition(child.pid, "Signal fixture child has no PID.");
    fs.writeFileSync(
      reportFile,
      JSON.stringify({
        tempRoot: fixture.tempRoot,
        databasePath: fixture.databasePath,
        childPid: child.pid,
        remoteCleared:
          process.env.TURSO_DATABASE_URL === "" &&
          process.env.TURSO_AUTH_TOKEN === "",
      }),
    );
    await new Promise(() => undefined);
  } catch (error) {
    await cleanupPhase19Fixture(fixture);
    throw error;
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  if (args[0] === "--signal-probe") {
    const reportIndex = args.indexOf("--report");
    const reportFile = reportIndex >= 0 ? args[reportIndex + 1] : undefined;
    if (!reportFile) {
      throw new Error("--signal-probe requires --report <path>.");
    }
    await runSignalProbe(reportFile);
    return;
  }
  const modes = new Set(args);
  const inventoryModes = [
    "--inventory",
    "--backup-migration",
    "--artifacts-limit",
    "--cli-inputs",
    "--legacy-audits",
    "--library-contract-safety",
  ];
  if (
    args.length > 0 &&
    args.every((arg) => inventoryModes.includes(arg))
  ) {
    if (modes.has("--inventory")) await runInventoryContract();
    if (modes.has("--backup-migration")) await runBackupMigrationContract();
    if (modes.has("--artifacts-limit")) await runArtifactsLimitContract();
    if (modes.has("--cli-inputs")) await runCliInputsContract();
    if (modes.has("--legacy-audits")) await runLegacyAuditsContract();
    if (modes.has("--library-contract-safety")) {
      await runLibraryContractSafety();
    }
    return;
  }
  if (args.length !== 1) {
    throw new Error(
      "Usage: pnpm exec tsx scripts/check-audit-readiness.ts --readonly-isolation|--readonly-backup|--fixture-isolation|[--inventory] [--backup-migration] [--artifacts-limit] [--cli-inputs] [--legacy-audits] [--library-contract-safety]",
    );
  }
  if (args[0] === "--readonly-isolation") {
    await runReadOnlyIsolation();
    return;
  }
  if (args[0] === "--readonly-backup") {
    await runReadOnlyBackup();
    return;
  }
  if (args[0] === "--fixture-isolation") {
    await runFixtureIsolation();
    return;
  }
  throw new Error(`Unknown audit readiness mode: ${args[0]}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
