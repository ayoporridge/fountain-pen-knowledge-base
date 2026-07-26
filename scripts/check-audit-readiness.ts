import {
  spawn,
  spawnSync,
  type ChildProcess,
} from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
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
  copyCheckpointedCatalogToDisposableCopy,
  openReadOnlyCatalog,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  captureInventoryAuditProvenance,
  captureSourceInventoryProvenance,
  runReadinessAudit,
  type InventoryAuditProvenance,
  type InventoryAuditRow,
  type InventoryAuditSummary,
  type InventoryAuditVerdict,
} from "../src/lib/audit/readiness-audit";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
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
const ARTIFACT_PROBE_SCRIPT_PATH = path.resolve(process.argv[1] ?? SCRIPT_PATH);
const MIGRATIONS_DIR = path.join(ROOT, "migrations");
const MIGRATION_030 = "030_publication_gate.sql";
const MIGRATION_031 = "031_evidence_readiness_v2.sql";
const MIGRATION_032 = "032_taxonomy_identity.sql";
const MIGRATIONS_THROUGH_030 = [
  "001_init.sql",
  "002_schema.sql",
  "003_tags.sql",
  "004_links.sql",
  "005_sources.sql",
  "006_fts.sql",
  "007_tag_hierarchy.sql",
  "008_fix_fk.sql",
  "009_brands_and_concepts.sql",
  "010_fix_summaries.sql",
  "011_library_schema.sql",
  "012_public_identity_cleanup.sql",
  "013_public_reference_status_consistency.sql",
  "014_public_media_cleanup.sql",
  "015_restore_reusable_media.sql",
  "016_article_import_residue_cleanup.sql",
  "017_article_structure_cleanup.sql",
  "018_article_summaries.sql",
  "019_reclassify_knowledge_articles.sql",
  "020_article_summaries_after_reclass.sql",
  "021_public_specs_and_relations.sql",
  "022_concept_public_contract.sql",
  "023_retire_template_stories.sql",
  "024_phase15_contract_cleanup.sql",
  "025_article_reclass_residue_cleanup.sql",
  "026_public_reference_deduplication.sql",
  "027_remove_source_navigation_residue.sql",
  "028_remove_remaining_translation_wrappers.sql",
  "029_online_campus_source_contract.sql",
  MIGRATION_030,
] as const;
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
const REAL_CATALOG_PATH = path.join(ROOT, "data", "fpkg.db");
const FINAL_ARTIFACT_DIRECTORY = path.join(
  ROOT,
  ".planning",
  "phases",
  "19-real-audit-evidence",
  "artifacts",
);
const LOCKED_REAL_CATALOG_FINGERPRINT = {
  main: {
    optional: false,
    size: "50999296",
    inode: "73526207",
    mtimeNs: "1785094491872216395",
    sha256: "ca33741563b88292d49d4339c177360dfd93a090b63fa40a9af5d59c95d4a3b1",
  },
  wal: {
    optional: true,
    size: "0",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  shm: {
    optional: true,
    size: "32768",
    sha256: "fd4c9fda9cd3f9ae7c962b0ddf37232294d55580e1aa165aa06129b8549389eb",
  },
} as const;
const LOCKED_SOURCE_INVENTORY_SNAPSHOT_ID =
  "sha256:17e1f1bc8cc4bfdcf490c7a7f48d97154d6449e0800f60cc3e9a9e88f9177ba4";
const LOCKED_MIGRATION_030_CHECKSUM =
  "1737d53f29c6f8d1c947f93d2a71bf9dd672de150d75dd81b150c48749d21e4a";
const LOCKED_MIGRATION_031_CHECKSUM =
  "abe240f9e4911682636e1b681fbb6a6b6ca31c3abe2cfe9bcc13f0221b04660b";
const LOCKED_LEGACY_EXCLUSIONS = [
  "brand:banju",
  "brand:saier",
  "brand:shanghai",
  "brand:yongxu",
  "pen:百乐-pilot-custom-823",
  "pen:百利金-pelikan-m800",
  "pen:派克-parker-51-经典-vintage",
  "pen:写乐-sailor-21k-pro-gear-大鱼雷",
  "pen:奥罗拉-aurora",
] as const;
const LOCKED_MISSING_MADE_BY_SLUGS = [
  "the-camel-pen",
  "the-j-g-rider-fountain-pen",
  "the-john-hancock-cartridge-pen",
  "the-postal-reservoir-pen",
  "the-security-pen",
] as const;
const LOCKED_MULTIPLE_MADE_BY_TARGETS = [
  "LIfzzmbCfFPt:英雄 (Hero):brand",
  "qpcW25Dw0fxW:英雄派迪 (Hero Paddy):brand",
] as const;

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

function compareStableText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
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
    // The made_by edge is part of the brand publication payload and its
    // insertion intentionally demotes a previously published brand. Re-run
    // the brand approval after the relationship exists so this fixture tests
    // the intended exactly-one/public-brand disposition.
    await approveAndPublish(client, brand.entityId);
    await approveAndPublish(client, pen.entityId);
    await seedLedgerRelationshipShells(client);
    // The fixture ledger adds reverse navigation shells after publication;
    // those inserts are part of the brand payload and require one final
    // review before the read-only audit.
    await approveAndPublish(client, brand.entityId);
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
  assertCondition(
    MIGRATIONS_THROUGH_030.at(-1) === MIGRATION_030 &&
      !new Set<string>(MIGRATIONS_THROUGH_030).has(MIGRATION_031),
    "Pre-031 migration fixture did not end exactly at migration 030.",
  );
  for (const file of MIGRATIONS_THROUGH_030) {
    assertCondition(
      fs.existsSync(path.join(MIGRATIONS_DIR, file)),
      `Pre-031 migration fixture is missing ${file}.`,
    );
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
    const copied = copyCheckpointedCatalogToDisposableCopy(
      sourcePath,
      auditPath,
      tempRoot,
      { expectedSourceSnapshot: sourceBefore },
    );
    assertCondition(
      copied.destinationPath === auditPath &&
        copied.destinationSnapshot.main.sha256 === sourceBefore.main.sha256,
      "Pre-031 source checkpointed copy did not complete inside the owned root.",
    );

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
        provenance.audit_schema_max_migration === 32 &&
          provenance.audit_schema_migration_name === MIGRATION_032 &&
          provenance.audit_schema_migration_checksum ===
            sha256File(path.join(MIGRATIONS_DIR, MIGRATION_032)) &&
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
    "Audit checkpointed-copy migration passed: source provenance is exact migration 030, readiness runs only on the owned canonical latest copy, and source main/WAL/SHM remain unchanged.",
  );
}

type AuditCliJson = {
  provenance: InventoryAuditProvenance;
  summary: InventoryAuditSummary;
  verdict: InventoryAuditVerdict;
  exit_code: number;
  console_row_count: number;
  rows: InventoryAuditRow[];
};

type CanonicalSummaryArtifact = {
  artifact_contract_version: number;
  provenance: InventoryAuditProvenance;
  summary: InventoryAuditSummary;
  verdict: InventoryAuditVerdict;
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
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
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

function decodeCsvFormulaProtection(value: string): string {
  return value.startsWith("'") && /^[=+\-@]/.test(value.slice(1))
    ? value.slice(1)
    : value;
}

function canonicalizePotentialLocalPath(inputPath: string): string {
  let existingAncestor = path.resolve(inputPath);
  const missingSegments: string[] = [];
  while (!fs.existsSync(existingAncestor)) {
    const parent = path.dirname(existingAncestor);
    assertCondition(
      parent !== existingAncestor,
      `Cannot resolve an existing ancestor for ${inputPath}.`,
    );
    missingSegments.unshift(path.basename(existingAncestor));
    existingAncestor = parent;
  }
  return path.join(
    fs.realpathSync.native(existingAncestor),
    ...missingSegments,
  );
}

function assertLockedRealCatalogFingerprint(snapshot: CatalogSnapshot): void {
  const expectedSourcePath = fs.realpathSync.native(REAL_CATALOG_PATH);
  assertCondition(
    snapshot.sourcePath === expectedSourcePath,
    `Real artifact source must be the locked catalog ${expectedSourcePath}; received ${snapshot.sourcePath}.`,
  );
  for (const kind of ["main", "wal", "shm"] as const) {
    const actual = snapshot[kind];
    const expected = LOCKED_REAL_CATALOG_FINGERPRINT[kind];
    const matches = !actual.exists
      ? expected.optional
      : actual.size === expected.size &&
        actual.sha256 === expected.sha256 &&
        (expected.optional ||
          (actual.inode === expected.inode &&
            actual.mtimeNs === expected.mtimeNs));
    assertCondition(
      matches,
      `Locked real catalog ${kind} fingerprint mismatch: ${JSON.stringify(actual)}.`,
    );
  }
}

function assertSourceStillLocked(before: CatalogSnapshot): void {
  const after = snapshotCatalogFiles(before.sourcePath);
  assertCatalogSnapshotUnchanged(before, after);
  assertLockedRealCatalogFingerprint(after);
}

function assertExactRealProvenance(
  provenance: InventoryAuditProvenance,
): void {
  assertCondition(
    sha256File(path.join(MIGRATIONS_DIR, MIGRATION_030)) ===
      LOCKED_MIGRATION_030_CHECKSUM &&
      sha256File(path.join(MIGRATIONS_DIR, MIGRATION_031)) ===
        LOCKED_MIGRATION_031_CHECKSUM,
    "Canonical migration files no longer match the locked 030/031 checksums.",
  );
  assertCondition(
    provenance.source_inventory_snapshot_id ===
      LOCKED_SOURCE_INVENTORY_SNAPSHOT_ID &&
      provenance.source_schema_max_migration === 30 &&
      provenance.source_schema_migration_name === MIGRATION_030 &&
      provenance.source_schema_migration_checksum ===
        LOCKED_MIGRATION_030_CHECKSUM &&
      provenance.audit_schema_max_migration === 31 &&
      provenance.audit_schema_migration_name === MIGRATION_031 &&
      provenance.audit_schema_migration_checksum ===
        LOCKED_MIGRATION_031_CHECKSUM &&
      provenance.audit_database_kind ===
        "owned_disposable_migrated_copy",
    `Real artifact provenance mismatch: ${JSON.stringify(provenance)}.`,
  );
}

function assertArtifactBuffersEqual(
  left: ReadonlyMap<string, Buffer>,
  right: ReadonlyMap<string, Buffer>,
  label: string,
): void {
  for (const file of ARTIFACT_FILES) {
    const leftBytes = left.get(file);
    const rightBytes = right.get(file);
    assertCondition(leftBytes && rightBytes, `${label} is missing ${file}.`);
    assertCondition(
      leftBytes.equals(rightBytes),
      `${label} bytes differ for ${file}.`,
    );
    assertCondition(
      createHash("sha256").update(leftBytes).digest("hex") ===
        createHash("sha256").update(rightBytes).digest("hex"),
      `${label} SHA-256 differs for ${file}.`,
    );
  }
}

function assertRowProvenance(
  row: InventoryAuditRow,
  provenance: InventoryAuditProvenance,
): void {
  assertCondition(
    row.source_inventory_snapshot_id ===
      provenance.source_inventory_snapshot_id &&
      row.source_schema_max_migration ===
        provenance.source_schema_max_migration &&
      row.source_schema_migration_name ===
        provenance.source_schema_migration_name &&
      row.source_schema_migration_checksum ===
        provenance.source_schema_migration_checksum &&
      row.audit_schema_max_migration ===
        provenance.audit_schema_max_migration &&
      row.audit_schema_migration_name ===
        provenance.audit_schema_migration_name &&
      row.audit_schema_migration_checksum ===
        provenance.audit_schema_migration_checksum &&
      row.audit_database_kind === provenance.audit_database_kind,
    `Inventory row ${row.entity_id} does not carry the complete artifact provenance.`,
  );
}

function assertRealReverseAndMadeBy(rows: readonly InventoryAuditRow[]): void {
  const identities = new Map(rows.map((row) => [row.entity_id, row]));
  const penRows = rows.filter((row) => row.entity_type === "pen");
  const reverseByBrand = new Map<
    string,
    Array<{ entity_id: string; slug: string; is_public: boolean }>
  >();
  const dispositionCounts = new Map<string, number>();

  for (const pen of penRows) {
    const targetCount = pen.made_by_target_ids.length;
    assertCondition(
      pen.made_by_target_names.length === targetCount &&
        pen.made_by_target_types.length === targetCount,
      `made_by target columns differ in width for ${pen.slug}.`,
    );
    const expectedDisposition =
      targetCount === 0
        ? "missing"
        : targetCount > 1
          ? "multiple"
          : pen.made_by_target_types[0] === "brand"
            ? "exactly_one"
            : "noncanonical";
    assertCondition(
      pen.made_by_status === expectedDisposition,
      `made_by disposition mismatch for ${pen.slug}: ${pen.made_by_status}/${expectedDisposition}.`,
    );
    dispositionCounts.set(
      pen.made_by_status,
      (dispositionCounts.get(pen.made_by_status) ?? 0) + 1,
    );

    const seenBrandTargets = new Set<string>();
    for (let index = 0; index < targetCount; index += 1) {
      const targetId = pen.made_by_target_ids[index]!;
      const targetName = pen.made_by_target_names[index]!;
      const targetType = pen.made_by_target_types[index]!;
      if (targetType !== "brand") continue;
      const target = identities.get(targetId);
      assertCondition(
        target?.entity_type === "brand" && target.name === targetName,
        `made_by target ${targetId} for ${pen.slug} does not match a raw brand identity.`,
      );
      if (seenBrandTargets.has(targetId)) continue;
      seenBrandTargets.add(targetId);
      const models = reverseByBrand.get(targetId) ?? [];
      models.push({
        entity_id: pen.entity_id,
        slug: pen.slug,
        is_public: pen.is_public,
      });
      reverseByBrand.set(targetId, models);
    }

    if (expectedDisposition === "exactly_one") {
      const brand = identities.get(pen.made_by_target_ids[0]!);
      assertCondition(
        pen.canonical_brand_id === brand?.entity_id &&
          pen.canonical_brand_slug === brand.slug,
        `Canonical made_by projection mismatch for ${pen.slug}.`,
      );
    } else {
      assertCondition(
        pen.canonical_brand_id === null && pen.canonical_brand_slug === null,
        `Noncanonical made_by row ${pen.slug} exposed a canonical brand.`,
      );
    }
  }

  assertCondition(
    dispositionCounts.get("exactly_one") === 230 &&
      dispositionCounts.get("missing") === 5 &&
      dispositionCounts.get("multiple") === 1 &&
      (dispositionCounts.get("noncanonical") ?? 0) === 0,
    `Real made_by counts mismatch: ${JSON.stringify(Object.fromEntries(dispositionCounts))}.`,
  );
  assertSetEqual(
    penRows
      .filter((row) => row.made_by_status === "missing")
      .map((row) => row.slug),
    LOCKED_MISSING_MADE_BY_SLUGS,
    "Real missing made_by slugs",
  );
  const multiple = penRows.filter((row) => row.made_by_status === "multiple");
  assertCondition(
    multiple.length === 1 && multiple[0]?.slug === "英雄派迪-一体尖",
    `Real multiple made_by identity mismatch: ${JSON.stringify(multiple)}.`,
  );
  assertSetEqual(
    multiple[0]!.made_by_target_ids.map(
      (id, index) =>
        `${id}:${multiple[0]!.made_by_target_names[index]}:${multiple[0]!.made_by_target_types[index]}`,
    ),
    LOCKED_MULTIPLE_MADE_BY_TARGETS,
    "Real multiple made_by targets",
  );

  for (const brand of rows.filter((row) => row.entity_type === "brand")) {
    const expectedRaw = (reverseByBrand.get(brand.entity_id) ?? []).sort(
      (left, right) =>
        compareStableText(left.slug, right.slug) ||
        compareStableText(left.entity_id, right.entity_id),
    );
    const expectedPublic = expectedRaw.filter((model) => model.is_public);
    const publicIds = new Set(expectedPublic.map((model) => model.entity_id));
    const expectedDifference = expectedRaw.filter(
      (model) => !publicIds.has(model.entity_id),
    );
    assertSetEqual(
      brand.raw_reverse_model_ids,
      expectedRaw.map((model) => model.entity_id),
      `Raw reverse model IDs for ${brand.slug}`,
    );
    assertSetEqual(
      brand.raw_reverse_model_slugs,
      expectedRaw.map((model) => model.slug),
      `Raw reverse model slugs for ${brand.slug}`,
    );
    assertSetEqual(
      brand.public_reverse_model_ids,
      expectedPublic.map((model) => model.entity_id),
      `Public reverse model IDs for ${brand.slug}`,
    );
    assertSetEqual(
      brand.public_reverse_model_slugs,
      expectedPublic.map((model) => model.slug),
      `Public reverse model slugs for ${brand.slug}`,
    );
    assertSetEqual(
      brand.reverse_model_diff_ids,
      expectedDifference.map((model) => model.entity_id),
      `Reverse model difference IDs for ${brand.slug}`,
    );
    assertSetEqual(
      brand.reverse_model_diff_slugs,
      expectedDifference.map((model) => model.slug),
      `Reverse model difference slugs for ${brand.slug}`,
    );
  }
}

function assertRealArtifactContract(
  artifacts: ReadonlyMap<string, Buffer>,
  cli: AuditCliJson,
): void {
  const ndjsonBytes = artifacts.get("inventory-readiness-v2.ndjson");
  const csvBytes = artifacts.get("inventory-readiness-v2.csv");
  const summaryBytes = artifacts.get("inventory-readiness-v2-summary.json");
  assertCondition(
    ndjsonBytes && csvBytes && summaryBytes,
    "Canonical real artifact set is incomplete.",
  );
  for (const [file, bytes] of artifacts) {
    const text = bytes.toString("utf8");
    assertCondition(
      !text.includes("applied_at") && !text.includes("schema_migrations"),
      `${file} leaked forbidden migration runtime metadata.`,
    );
  }
  const rows = ndjsonBytes
    .toString("utf8")
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line) as InventoryAuditRow);
  const summary = JSON.parse(
    summaryBytes.toString("utf8"),
  ) as CanonicalSummaryArtifact;
  assertExactRealProvenance(summary.provenance);
  assertCondition(
    JSON.stringify(cli.provenance) === JSON.stringify(summary.provenance),
    "CLI and summary provenance differ.",
  );
  assertCondition(
    rows.length === 305 && new Set(rows.map((row) => row.entity_id)).size === 305,
    "Real NDJSON must contain exactly 305 unique identities.",
  );
  assertCondition(
    rows.filter((row) => row.entity_type === "brand").length === 69 &&
      rows.filter((row) => row.entity_type === "pen").length === 236,
    "Real NDJSON inventory split must be 69 brands and 236 pens.",
  );
  const expectedOrder = [...rows].sort(
    (left, right) =>
      compareStableText(left.entity_type, right.entity_type) ||
      compareStableText(left.slug, right.slug) ||
      compareStableText(left.entity_id, right.entity_id),
  );
  assertCondition(
    rows.every((row, index) => row.entity_id === expectedOrder[index]?.entity_id),
    "Real NDJSON rows are not in deterministic type/slug/id order.",
  );
  for (const row of rows) assertRowProvenance(row, summary.provenance);
  assertCondition(
    rows.every(
      (row) =>
        row.publication_status === "draft" &&
        !row.is_public &&
        !row.content_ready,
    ),
    "Locked real ledger must remain all-draft, non-public, and blocked.",
  );
  assertSetEqual(
    rows
      .filter((row) => !row.in_legacy_public_baseline)
      .map((row) => `${row.entity_type}:${row.slug}`),
    LOCKED_LEGACY_EXCLUSIONS,
    "Real legacy exclusions",
  );
  assertRealReverseAndMadeBy(rows);

  const expectedSummary: InventoryAuditSummary = {
    inventory_audited: 305,
    brand_inventory_audited: 69,
    pen_inventory_audited: 236,
    legacy_public_baseline: 296,
    content_ready: 0,
    published: 0,
    public_entities: 0,
    published_blockers: 0,
    public_blockers: 0,
    backlog: 305,
  };
  const expectedVerdict: InventoryAuditVerdict = {
    inventory_complete: true,
    content_complete: false,
    public_clean: true,
    complete: false,
  };
  assertCondition(
    summary.artifact_contract_version === 1 &&
      JSON.stringify(summary.summary) === JSON.stringify(expectedSummary) &&
      JSON.stringify(summary.verdict) === JSON.stringify(expectedVerdict) &&
      JSON.stringify(cli.summary) === JSON.stringify(expectedSummary) &&
      JSON.stringify(cli.verdict) === JSON.stringify(expectedVerdict),
    `Real summary or verdict mismatch: ${summaryBytes.toString("utf8")}.`,
  );
  assertCondition(
    JSON.stringify(cli.rows) === JSON.stringify(rows),
    "Unlimited CLI rows differ from canonical NDJSON rows.",
  );

  const csvRecords = parseCsv(csvBytes.toString("utf8"));
  const header = csvRecords[0] ?? [];
  const entityIndex = header.indexOf("entity_id");
  const typeIndex = header.indexOf("entity_type");
  const slugIndex = header.indexOf("slug");
  assertCondition(
    csvRecords.length === 306 &&
      entityIndex >= 0 &&
      typeIndex >= 0 &&
      slugIndex >= 0 &&
      csvRecords.every((record) => record.length === header.length),
    "Real CSV must contain one fixed-width header plus 305 logical rows.",
  );
  assertSetEqual(
    csvRecords
      .slice(1)
      .map(
        (record) =>
          `${decodeCsvFormulaProtection(record[typeIndex]!)}:${decodeCsvFormulaProtection(record[slugIndex]!)}:${decodeCsvFormulaProtection(record[entityIndex]!)}`,
      ),
    rows.map((row) => `${row.entity_type}:${row.slug}:${row.entity_id}`),
    "Real CSV/NDJSON identities",
  );
}

function assertCanonicalFinalOutDir(finalOutDir: string): void {
  assertCondition(
    path.isAbsolute(finalOutDir),
    "--final-out-dir must be an explicit absolute path.",
  );
  const actual = canonicalizePotentialLocalPath(finalOutDir);
  const expected = canonicalizePotentialLocalPath(FINAL_ARTIFACT_DIRECTORY);
  assertCondition(
    path.resolve(finalOutDir) === path.resolve(FINAL_ARTIFACT_DIRECTORY) &&
      actual === expected,
    `--final-out-dir must be the fixed Phase 19 artifact directory: ${FINAL_ARTIFACT_DIRECTORY}.`,
  );
}

function writeFileExclusivelyAndSync(filePath: string, bytes: Buffer): void {
  const descriptor = fs.openSync(filePath, "wx", 0o600);
  try {
    fs.writeFileSync(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}

type ArtifactPublicationWindow = "after-backup" | "after-first-install";

class ArtifactPublicationInterrupted extends Error {
  readonly exitCode: number;

  constructor(readonly signal: "SIGINT" | "SIGTERM") {
    super(`Canonical artifact publication interrupted by ${signal}.`);
    this.name = "ArtifactPublicationInterrupted";
    this.exitCode = signal === "SIGINT" ? 130 : 143;
  }
}

class ArtifactProbeHarnessInterrupted extends Error {
  readonly exitCode: number;

  constructor(readonly signal: "SIGINT" | "SIGTERM") {
    super(`Artifact probe harness interrupted by ${signal}.`);
    this.name = "ArtifactProbeHarnessInterrupted";
    this.exitCode = signal === "SIGINT" ? 130 : 143;
  }
}

async function installCanonicalArtifactSet(
  finalOutDir: string,
  artifacts: ReadonlyMap<string, Buffer>,
  validateInstalledSet: () => void,
  pauseAtWindow?: (window: ArtifactPublicationWindow) => Promise<void>,
): Promise<void> {
  fs.mkdirSync(finalOutDir, { recursive: true });
  assertCondition(
    fs.statSync(finalOutDir).isDirectory() &&
      !fs.lstatSync(finalOutDir).isSymbolicLink(),
    "Final artifact path must be a real directory, not a symlink.",
  );
  const token = `${process.pid}-${Date.now()}`;
  const temporary = new Map<string, string>();
  const backups = new Map<string, string>();
  const installed = new Set<string>();
  let completed = false;
  let rejectInterruption: ((error: ArtifactPublicationInterrupted) => void) | null =
    null;
  const interruption = new Promise<never>((_resolve, reject) => {
    rejectInterruption = reject;
  });
  const onSigint = () =>
    rejectInterruption?.(new ArtifactPublicationInterrupted("SIGINT"));
  const onSigterm = () =>
    rejectInterruption?.(new ArtifactPublicationInterrupted("SIGTERM"));
  const yieldAtWindow = async (
    window: ArtifactPublicationWindow,
  ): Promise<void> => {
    await Promise.race([
      (async () => {
        await pauseAtWindow?.(window);
        await new Promise<void>((resolve) => setImmediate(resolve));
      })(),
      interruption,
    ]);
  };
  process.on("SIGINT", onSigint);
  process.on("SIGTERM", onSigterm);
  try {
    for (const file of ARTIFACT_FILES) {
      const bytes = artifacts.get(file);
      assertCondition(bytes, `Verified artifact bytes missing for ${file}.`);
      const target = path.join(finalOutDir, file);
      if (fs.existsSync(target)) {
        assertCondition(
          fs.lstatSync(target).isFile() &&
            !fs.lstatSync(target).isSymbolicLink(),
          `Existing artifact target is not a regular file: ${target}.`,
        );
      }
      const temp = path.join(finalOutDir, `.${file}.${token}.tmp`);
      writeFileExclusivelyAndSync(temp, bytes);
      temporary.set(target, temp);
    }
    for (const target of temporary.keys()) {
      if (!fs.existsSync(target)) continue;
      const backup = `${target}.${token}.backup`;
      fs.renameSync(target, backup);
      backups.set(target, backup);
    }
    await yieldAtWindow("after-backup");
    let installCount = 0;
    for (const [target, temp] of temporary) {
      fs.renameSync(temp, target);
      installed.add(target);
      installCount += 1;
      if (installCount === 1) {
        await yieldAtWindow("after-first-install");
      }
    }
    assertArtifactBuffersEqual(
      artifacts,
      readArtifacts(finalOutDir),
      "Final canonical artifact set",
    );
    validateInstalledSet();
    completed = true;
  } finally {
    try {
      if (!completed) {
        for (const target of installed) {
          if (fs.existsSync(target)) fs.rmSync(target, { force: true });
        }
        for (const [target, backup] of [...backups].reverse()) {
          if (fs.existsSync(backup)) fs.renameSync(backup, target);
        }
      }
      for (const temp of temporary.values()) {
        if (fs.existsSync(temp)) fs.rmSync(temp, { force: true });
      }
      if (completed) {
        for (const backup of backups.values()) {
          if (fs.existsSync(backup)) fs.rmSync(backup, { force: true });
        }
      }
    } finally {
      process.off("SIGINT", onSigint);
      process.off("SIGTERM", onSigterm);
    }
  }
}

async function publishCanonicalArtifactSet(
  finalOutDir: string,
  artifacts: ReadonlyMap<string, Buffer>,
  validateInstalledSet: () => void,
): Promise<void> {
  assertCanonicalFinalOutDir(finalOutDir);
  await installCanonicalArtifactSet(
    finalOutDir,
    artifacts,
    validateInstalledSet,
  );
}

async function runRealArtifactsContract(
  databasePath: string,
  finalOutDir: string,
): Promise<void> {
  assertCondition(
    path.isAbsolute(databasePath),
    "--database-path must be an explicit absolute path.",
  );
  assertCondition(
    fs.realpathSync.native(databasePath) ===
      fs.realpathSync.native(REAL_CATALOG_PATH),
    `--real-artifacts accepts only the locked catalog ${REAL_CATALOG_PATH}.`,
  );
  assertCanonicalFinalOutDir(finalOutDir);
  const sourceBefore = snapshotCatalogFiles(databasePath);
  assertLockedRealCatalogFingerprint(sourceBefore);

  await withOwnedTempRoot("fpkg-phase19-real-artifacts-", async (tempRoot) => {
    const unlimitedOut = path.join(tempRoot, "unlimited");
    const limitedOut = path.join(tempRoot, "limit-1");
    const common = [
      "--database-path",
      sourceBefore.sourcePath,
      "--json",
      "--verify-baseline",
    ];
    const unlimited = runAuditCli([
      ...common,
      "--out-dir",
      unlimitedOut,
    ]);
    assertSourceStillLocked(sourceBefore);
    const limited = runAuditCli([
      ...common,
      "--out-dir",
      limitedOut,
      "--limit",
      "1",
    ]);
    assertSourceStillLocked(sourceBefore);
    assertCondition(
      unlimited.status === 1 && limited.status === 1,
      `Real audit must report content-incomplete exit 1, received ${unlimited.status}/${limited.status}: ${unlimited.stderr}${limited.stderr}`,
    );
    assertCondition(
      unlimited.json && limited.json,
      `Real audit CLI did not emit JSON: ${unlimited.stderr}${limited.stderr}`,
    );
    assertCondition(
      unlimited.json.exit_code === 1 &&
        limited.json.exit_code === 1 &&
        unlimited.json.console_row_count === 305 &&
        unlimited.json.rows.length === 305 &&
        limited.json.console_row_count === 1 &&
        limited.json.rows.length === 1 &&
        JSON.stringify(limited.json.rows[0]) ===
          JSON.stringify(unlimited.json.rows[0]),
      "Real audit limit changed exit semantics or did not remain terminal-only.",
    );
    assertCondition(
      JSON.stringify(unlimited.json.provenance) ===
        JSON.stringify(limited.json.provenance) &&
        JSON.stringify(unlimited.json.summary) ===
          JSON.stringify(limited.json.summary) &&
        JSON.stringify(unlimited.json.verdict) ===
          JSON.stringify(limited.json.verdict),
      "Unlimited and limit=1 real audit metadata differ.",
    );
    const unlimitedArtifacts = readArtifacts(unlimitedOut);
    const limitedArtifacts = readArtifacts(limitedOut);
    assertArtifactBuffersEqual(
      unlimitedArtifacts,
      limitedArtifacts,
      "Unlimited/limit=1 real artifacts",
    );
    assertRealArtifactContract(unlimitedArtifacts, unlimited.json);
    assertRealArtifactContract(limitedArtifacts, {
      ...limited.json,
      rows: unlimited.json.rows,
    });

    assertSourceStillLocked(sourceBefore);
    await publishCanonicalArtifactSet(finalOutDir, unlimitedArtifacts, () => {
      assertSourceStillLocked(sourceBefore);
    });
    assertArtifactBuffersEqual(
      unlimitedArtifacts,
      readArtifacts(finalOutDir),
      "Verified/final real artifacts",
    );
    console.log(
      `Real audit artifacts passed: inventory=305 brands=69 pens=236 legacy=296 content_ready=0 published=0 public_clean=true hashes=${artifactHashes(unlimitedArtifacts).join(",")}.`,
    );
  });
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

type ArtifactSignalProbeReport = {
  phase: "ready" | "cleaned";
  tempRoot: string;
  finalOutDir: string;
  signal: "SIGINT" | "SIGTERM";
  window: ArtifactPublicationWindow;
  restoredHashes?: string[];
};

type ArtifactParentSignalProbeReport = {
  phase: "ready" | "cleaned";
  childPid: number;
  tempRoot: string;
  signal: "SIGINT" | "SIGTERM";
};

type ArtifactProbeIdentity = {
  readonly dev: string;
  readonly ino: string;
  readonly nlink: string;
};

type ArtifactProbeOwnershipManifest = {
  readonly version: 2;
  readonly nonce: string;
  readonly scopeRoot: string;
  readonly tempRoot: string;
  readonly reportFile: string;
  readonly nonceFile: string;
  readonly root: ArtifactProbeIdentity;
  readonly work: ArtifactProbeIdentity;
  readonly report: ArtifactProbeIdentity;
  readonly nonceIdentity: ArtifactProbeIdentity;
};

type ArtifactProbeOwnership = {
  readonly nonce: string;
  readonly scopeRoot: string;
  readonly tempRoot: string;
  readonly reportFile: string;
  readonly nonceFile: string;
  readonly rootDescriptor: number;
  readonly workDescriptor: number;
  readonly reportDescriptor: number;
  readonly nonceDescriptor: number;
  readonly root: ArtifactProbeIdentity;
  readonly work: ArtifactProbeIdentity;
  readonly report: ArtifactProbeIdentity;
  readonly nonceIdentity: ArtifactProbeIdentity;
  readonly ownsDescriptors: boolean;
  descriptorsClosed: boolean;
};

const ARTIFACT_PROBE_CAPABILITY_CLEANUP_SOURCE = String.raw`
import json
import os
import stat
import sys

ROOT_FD = 3
PARENT_FD = 4
name = sys.argv[1]
expected = (int(sys.argv[2]), int(sys.argv[3]))
ident = lambda info: (info.st_dev, info.st_ino)
emit = lambda status, **fields: print(
    json.dumps({"status": status, **fields}, separators=(",", ":"))
)

def clear(directory_fd):
    for entry in sorted(os.listdir(directory_fd)):
        initial = os.stat(entry, dir_fd=directory_fd, follow_symlinks=False)
        if stat.S_ISDIR(initial.st_mode):
            child_fd = os.open(
                entry, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW,
                dir_fd=directory_fd,
            )
            try:
                opened = os.fstat(child_fd)
                if ident(opened) != ident(initial):
                    raise RuntimeError("directory_identity_changed_before_open")
                clear(child_fd)
                current = os.stat(entry, dir_fd=directory_fd, follow_symlinks=False)
                if ident(current) != ident(opened) or os.listdir(child_fd):
                    raise RuntimeError("directory_identity_changed_before_rmdir")
                os.rmdir(entry, dir_fd=directory_fd)
            finally:
                os.close(child_fd)
        elif stat.S_ISREG(initial.st_mode) and initial.st_nlink == 1:
            current = os.stat(entry, dir_fd=directory_fd, follow_symlinks=False)
            if ident(current) != ident(initial) or current.st_nlink != 1:
                raise RuntimeError("file_identity_changed_before_unlink")
            os.unlink(entry, dir_fd=directory_fd)
        else:
            raise RuntimeError("unsafe_or_shared_entry")

def main():
    if not name or name in (".", "..") or os.path.basename(name) != name:
        raise RuntimeError("invalid_quarantine_name")
    root_before = os.fstat(ROOT_FD)
    parent = os.fstat(PARENT_FD)
    if not stat.S_ISDIR(root_before.st_mode) or not stat.S_ISDIR(parent.st_mode):
        raise RuntimeError("inherited_descriptor_is_not_directory")
    if ident(root_before) != expected:
        raise RuntimeError("root_descriptor_identity_changed")
    clear(ROOT_FD)
    if os.listdir(ROOT_FD):
        raise RuntimeError("root_not_empty_after_cleanup")
    try:
        entry = os.stat(name, dir_fd=PARENT_FD, follow_symlinks=False)
    except FileNotFoundError:
        emit("retained", reason="entry_missing")
        raise SystemExit(17)
    if ident(entry) != ident(root_before):
        emit("retained", reason="entry_identity_changed")
        raise SystemExit(17)
    os.rmdir(name, dir_fd=PARENT_FD)
    try:
        os.stat(name, dir_fd=PARENT_FD, follow_symlinks=False)
    except FileNotFoundError:
        pass
    else:
        emit("retained", reason="entry_reappeared_after_rmdir")
        raise SystemExit(18)
    root_after = os.fstat(ROOT_FD)
    emit(
        "removed",
        entry_absent=True,
        root_dev=str(root_after.st_dev),
        root_ino=str(root_after.st_ino),
        root_nlink_before=str(root_before.st_nlink),
        root_nlink_after=str(root_after.st_nlink),
    )

try:
    main()
except Exception as error:
    emit("retained", reason=f"{type(error).__name__}:{error}")
    raise SystemExit(19)
`;

type ArtifactProbeCapabilityCleanupReport = {
  readonly status: "removed" | "retained";
  readonly reason?: string;
  readonly entry_absent?: boolean;
  readonly root_dev?: string;
  readonly root_ino?: string;
  readonly root_nlink_before?: string;
  readonly root_nlink_after?: string;
};

function artifactProbeIdentity(stats: fs.BigIntStats): ArtifactProbeIdentity {
  return {
    dev: stats.dev.toString(),
    ino: stats.ino.toString(),
    nlink: stats.nlink.toString(),
  };
}

function sameArtifactProbeIdentity(
  left: ArtifactProbeIdentity,
  right: ArtifactProbeIdentity,
): boolean {
  return left.dev === right.dev && left.ino === right.ino;
}

function readArtifactProbeDescriptor(descriptor: number): string {
  const stats = fs.fstatSync(descriptor, { bigint: true });
  assertCondition(
    stats.isFile() && stats.size >= 0n && stats.size <= 64n * 1024n,
    "Artifact probe authority descriptor is not a bounded regular file.",
  );
  const bytes = Buffer.alloc(Number(stats.size));
  let offset = 0;
  while (offset < bytes.length) {
    const count = fs.readSync(
      descriptor,
      bytes,
      offset,
      bytes.length - offset,
      offset,
    );
    assertCondition(count > 0, "Artifact probe authority descriptor ended early.");
    offset += count;
  }
  return bytes.toString("utf8");
}

function writeArtifactProbeDescriptor(
  descriptor: number,
  contents: string,
): void {
  const bytes = Buffer.from(contents, "utf8");
  fs.ftruncateSync(descriptor, 0);
  let offset = 0;
  while (offset < bytes.length) {
    offset += fs.writeSync(
      descriptor,
      bytes,
      offset,
      bytes.length - offset,
      offset,
    );
  }
  fs.fsyncSync(descriptor);
}

function assertArtifactProbeIdentityShape(
  value: unknown,
  label: string,
): asserts value is ArtifactProbeIdentity {
  const identity = value as Partial<ArtifactProbeIdentity> | null;
  assertCondition(
    identity !== null &&
      typeof identity === "object" &&
      typeof identity.dev === "string" &&
      /^\d+$/.test(identity.dev) &&
      typeof identity.ino === "string" &&
      /^\d+$/.test(identity.ino) &&
      typeof identity.nlink === "string" &&
      /^\d+$/.test(identity.nlink),
    `Artifact probe ${label} identity is malformed.`,
  );
}

function parseArtifactProbeManifest(
  descriptor: number,
): ArtifactProbeOwnershipManifest {
  const parsed = JSON.parse(
    readArtifactProbeDescriptor(descriptor),
  ) as Partial<ArtifactProbeOwnershipManifest>;
  assertCondition(
    parsed.version === 2 &&
      typeof parsed.nonce === "string" &&
      /^[0-9a-f-]{36}$/.test(parsed.nonce) &&
      typeof parsed.scopeRoot === "string" &&
      typeof parsed.tempRoot === "string" &&
      typeof parsed.reportFile === "string" &&
      typeof parsed.nonceFile === "string",
    "Artifact probe inherited nonce manifest is malformed.",
  );
  assertArtifactProbeIdentityShape(parsed.root, "root");
  assertArtifactProbeIdentityShape(parsed.work, "work");
  assertArtifactProbeIdentityShape(parsed.report, "report");
  assertArtifactProbeIdentityShape(parsed.nonceIdentity, "nonce");
  return parsed as ArtifactProbeOwnershipManifest;
}

function assertArtifactProbePathDescriptor(
  filePath: string,
  descriptor: number,
  expected: ArtifactProbeIdentity,
  kind: "directory" | "file",
  requireSingleLink: boolean,
  requireOriginalLinkCount: boolean,
): void {
  const pathStats = fs.lstatSync(filePath, { bigint: true });
  const descriptorStats = fs.fstatSync(descriptor, { bigint: true });
  const expectedKind =
    kind === "directory"
      ? pathStats.isDirectory() && descriptorStats.isDirectory()
      : pathStats.isFile() && descriptorStats.isFile();
  const pathIdentity = artifactProbeIdentity(pathStats);
  const descriptorIdentity = artifactProbeIdentity(descriptorStats);
  assertCondition(
    expectedKind &&
      !pathStats.isSymbolicLink() &&
      sameArtifactProbeIdentity(pathIdentity, descriptorIdentity) &&
      sameArtifactProbeIdentity(pathIdentity, expected),
    `Artifact probe ${kind} capability does not match its inherited descriptor.`,
  );
  if (requireSingleLink) {
    assertCondition(
      pathStats.nlink === 1n && descriptorStats.nlink === 1n,
      "Artifact probe regular-file capability must have exactly one link.",
    );
  }
  if (requireOriginalLinkCount) {
    assertCondition(
      pathIdentity.nlink === expected.nlink &&
        descriptorIdentity.nlink === expected.nlink,
      `Artifact probe ${kind} link count changed after authority creation: ${filePath} expected=${expected.nlink} path=${pathIdentity.nlink} descriptor=${descriptorIdentity.nlink}.`,
    );
  }
}

function assertArtifactProbeAuthority(
  ownership: ArtifactProbeOwnership,
): void {
  assertCondition(
    !ownership.descriptorsClosed,
    "Artifact probe authority descriptors are already closed.",
  );
  const temporaryDirectory = fs.realpathSync.native(os.tmpdir());
  assertCondition(
    path.dirname(ownership.scopeRoot) === temporaryDirectory &&
      path.basename(ownership.scopeRoot).startsWith(
        "fpkg-artifact-signal-probe-",
      ) &&
      ownership.tempRoot === path.join(ownership.scopeRoot, "work") &&
      ownership.reportFile === path.join(ownership.scopeRoot, "report.json") &&
      ownership.nonceFile === path.join(ownership.scopeRoot, ".authority"),
    "Artifact probe authority paths are outside the owned temporary namespace.",
  );
  assertArtifactProbePathDescriptor(
    ownership.scopeRoot,
    ownership.rootDescriptor,
    ownership.root,
    "directory",
    false,
    true,
  );
  assertArtifactProbePathDescriptor(
    ownership.tempRoot,
    ownership.workDescriptor,
    ownership.work,
    "directory",
    false,
    false,
  );
  assertArtifactProbePathDescriptor(
    ownership.reportFile,
    ownership.reportDescriptor,
    ownership.report,
    "file",
    true,
    true,
  );
  assertArtifactProbePathDescriptor(
    ownership.nonceFile,
    ownership.nonceDescriptor,
    ownership.nonceIdentity,
    "file",
    true,
    true,
  );
  const manifest = parseArtifactProbeManifest(ownership.nonceDescriptor);
  assertCondition(
    manifest.nonce === ownership.nonce &&
      manifest.scopeRoot === ownership.scopeRoot &&
      manifest.tempRoot === ownership.tempRoot &&
      manifest.reportFile === ownership.reportFile &&
      manifest.nonceFile === ownership.nonceFile &&
      sameArtifactProbeIdentity(manifest.root, ownership.root) &&
      sameArtifactProbeIdentity(manifest.work, ownership.work) &&
      sameArtifactProbeIdentity(manifest.report, ownership.report) &&
      sameArtifactProbeIdentity(
        manifest.nonceIdentity,
        ownership.nonceIdentity,
      ),
    "Artifact probe nonce manifest does not match the inherited capabilities.",
  );
}

type ArtifactProbeTreeEntry = {
  readonly relativePath: string;
  readonly kind: "directory" | "file";
  readonly identity: ArtifactProbeIdentity;
};

function snapshotArtifactProbeTree(root: string): ArtifactProbeTreeEntry[] {
  const entries: ArtifactProbeTreeEntry[] = [];
  const identities = new Set<string>();
  const visit = (current: string, relativePath: string): void => {
    const stats = fs.lstatSync(current, { bigint: true });
    assertCondition(
      !stats.isSymbolicLink(),
      `Artifact probe tree contains a nested symlink: ${relativePath}.`,
    );
    const kind = stats.isDirectory()
      ? "directory"
      : stats.isFile()
        ? "file"
        : null;
    assertCondition(
      kind !== null,
      `Artifact probe tree contains a non-file entry: ${relativePath}.`,
    );
    if (kind === "file") {
      assertCondition(
        stats.nlink === 1n,
        `Artifact probe tree contains a shared-link file: ${relativePath}.`,
      );
    }
    const identity = artifactProbeIdentity(stats);
    const key = `${identity.dev}:${identity.ino}`;
    assertCondition(
      !identities.has(key),
      `Artifact probe tree contains an inode alias: ${relativePath}.`,
    );
    identities.add(key);
    entries.push({ relativePath, kind, identity });
    if (kind === "directory") {
      for (const name of fs.readdirSync(current).sort(compareStableText)) {
        visit(
          path.join(current, name),
          relativePath === "." ? name : path.join(relativePath, name),
        );
      }
    }
  };
  visit(root, ".");
  return entries;
}

function assertInitialArtifactProbeTree(
  ownership: ArtifactProbeOwnership,
): void {
  assertArtifactProbeAuthority(ownership);
  const tree = snapshotArtifactProbeTree(ownership.scopeRoot);
  assertCondition(
    JSON.stringify(tree.map((entry) => entry.relativePath)) ===
      JSON.stringify([".", ".authority", "report.json", "work"]),
    "Artifact probe work root was not exclusively empty at handoff.",
  );
}

function createArtifactProbeOwnership(): ArtifactProbeOwnership {
  const nonce = randomUUID();
  const scopeRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-artifact-signal-probe-"),
    ),
  );
  fs.chmodSync(scopeRoot, 0o700);
  const tempRoot = path.join(scopeRoot, "work");
  const reportFile = path.join(scopeRoot, "report.json");
  const nonceFile = path.join(scopeRoot, ".authority");
  const descriptors: number[] = [];
  try {
    fs.mkdirSync(tempRoot, { recursive: false, mode: 0o700 });
    const reportDescriptor = fs.openSync(
      reportFile,
      fs.constants.O_RDWR |
        fs.constants.O_CREAT |
        fs.constants.O_EXCL |
        fs.constants.O_NOFOLLOW,
      0o600,
    );
    descriptors.push(reportDescriptor);
    const nonceDescriptor = fs.openSync(
      nonceFile,
      fs.constants.O_RDWR |
        fs.constants.O_CREAT |
        fs.constants.O_EXCL |
        fs.constants.O_NOFOLLOW,
      0o600,
    );
    descriptors.push(nonceDescriptor);
    const rootDescriptor = fs.openSync(
      scopeRoot,
      fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
    );
    descriptors.push(rootDescriptor);
    const workDescriptor = fs.openSync(
      tempRoot,
      fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
    );
    descriptors.push(workDescriptor);
    const ownership: ArtifactProbeOwnership = {
      nonce,
      scopeRoot,
      tempRoot,
      reportFile,
      nonceFile,
      rootDescriptor,
      workDescriptor,
      reportDescriptor,
      nonceDescriptor,
      root: artifactProbeIdentity(
        fs.fstatSync(rootDescriptor, { bigint: true }),
      ),
      work: artifactProbeIdentity(
        fs.fstatSync(workDescriptor, { bigint: true }),
      ),
      report: artifactProbeIdentity(
        fs.fstatSync(reportDescriptor, { bigint: true }),
      ),
      nonceIdentity: artifactProbeIdentity(
        fs.fstatSync(nonceDescriptor, { bigint: true }),
      ),
      ownsDescriptors: true,
      descriptorsClosed: false,
    };
    const manifest: ArtifactProbeOwnershipManifest = {
      version: 2,
      nonce,
      scopeRoot,
      tempRoot,
      reportFile,
      nonceFile,
      root: ownership.root,
      work: ownership.work,
      report: ownership.report,
      nonceIdentity: ownership.nonceIdentity,
    };
    writeArtifactProbeDescriptor(nonceDescriptor, JSON.stringify(manifest));
    assertInitialArtifactProbeTree(ownership);
    return ownership;
  } catch (error) {
    for (const descriptor of descriptors.reverse()) {
      try {
        fs.closeSync(descriptor);
      } catch {
        // Preserve the original authority-creation error.
      }
    }
    if (fs.existsSync(scopeRoot)) {
      fs.rmSync(scopeRoot, { recursive: true, force: true });
    }
    throw error;
  }
}

const INHERITED_ARTIFACT_ROOT_FD = 3;
const INHERITED_ARTIFACT_WORK_FD = 4;
const INHERITED_ARTIFACT_REPORT_FD = 5;
const INHERITED_ARTIFACT_NONCE_FD = 6;

function loadInheritedArtifactProbeOwnership(): ArtifactProbeOwnership {
  const manifest = parseArtifactProbeManifest(INHERITED_ARTIFACT_NONCE_FD);
  const ownership: ArtifactProbeOwnership = {
    nonce: manifest.nonce,
    scopeRoot: manifest.scopeRoot,
    tempRoot: manifest.tempRoot,
    reportFile: manifest.reportFile,
    nonceFile: manifest.nonceFile,
    rootDescriptor: INHERITED_ARTIFACT_ROOT_FD,
    workDescriptor: INHERITED_ARTIFACT_WORK_FD,
    reportDescriptor: INHERITED_ARTIFACT_REPORT_FD,
    nonceDescriptor: INHERITED_ARTIFACT_NONCE_FD,
    root: manifest.root,
    work: manifest.work,
    report: manifest.report,
    nonceIdentity: manifest.nonceIdentity,
    ownsDescriptors: false,
    descriptorsClosed: false,
  };
  assertInitialArtifactProbeTree(ownership);
  const cwdIdentity = artifactProbeIdentity(
    fs.lstatSync(".", { bigint: true }),
  );
  assertCondition(
    sameArtifactProbeIdentity(cwdIdentity, ownership.work),
    "Artifact probe child cwd does not match its inherited work descriptor.",
  );
  return ownership;
}

function closeArtifactProbeDescriptors(ownership: ArtifactProbeOwnership): void {
  if (ownership.descriptorsClosed || !ownership.ownsDescriptors) return;
  ownership.descriptorsClosed = true;
  for (const descriptor of [
    ownership.nonceDescriptor,
    ownership.reportDescriptor,
    ownership.workDescriptor,
    ownership.rootDescriptor,
  ]) {
    try {
      fs.closeSync(descriptor);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EBADF") throw error;
    }
  }
}

function assertQuarantinedArtifactProbeRoot(
  ownership: ArtifactProbeOwnership,
  quarantinePath: string,
  expectedTree: readonly ArtifactProbeTreeEntry[],
): void {
  const pathStats = fs.lstatSync(quarantinePath, { bigint: true });
  const descriptorStats = fs.fstatSync(ownership.rootDescriptor, {
    bigint: true,
  });
  assertCondition(
    pathStats.isDirectory() &&
      !pathStats.isSymbolicLink() &&
      sameArtifactProbeIdentity(
        artifactProbeIdentity(pathStats),
        ownership.root,
      ) &&
      sameArtifactProbeIdentity(
        artifactProbeIdentity(descriptorStats),
        ownership.root,
      ),
    "Artifact probe quarantine root changed after ownership verification.",
  );
  const actualTree = snapshotArtifactProbeTree(quarantinePath);
  assertCondition(
    JSON.stringify(actualTree) === JSON.stringify(expectedTree),
    "Artifact probe quarantine tree changed after ownership verification.",
  );
}

function removeQuarantinedArtifactProbeRoot(
  ownership: ArtifactProbeOwnership,
  parentDescriptor: number,
  quarantinePath: string,
): void {
  const cleanup = spawnSync(
    "python3",
    [
      "-c",
      ARTIFACT_PROBE_CAPABILITY_CLEANUP_SOURCE,
      path.basename(quarantinePath),
      ownership.root.dev,
      ownership.root.ino,
    ],
    {
      cwd: ROOT,
      env: {
        PATH: process.env.PATH,
      },
      stdio: [
        "ignore",
        "pipe",
        "pipe",
        ownership.rootDescriptor,
        parentDescriptor,
      ],
      encoding: "utf8",
      timeout: 10_000,
      maxBuffer: 64 * 1024,
    },
  );
  let report: ArtifactProbeCapabilityCleanupReport | null = null;
  try {
    report = JSON.parse(
      typeof cleanup.stdout === "string" ? cleanup.stdout.trim() : "",
    ) as ArtifactProbeCapabilityCleanupReport;
  } catch {
    // A missing or failed helper is reported below without another path operation.
  }
  const removed =
    !cleanup.error &&
    cleanup.status === 0 &&
    cleanup.signal === null &&
    report?.status === "removed" &&
    report.entry_absent === true &&
    report.root_dev === ownership.root.dev &&
    report.root_ino === ownership.root.ino &&
    typeof report.root_nlink_before === "string" &&
    typeof report.root_nlink_after === "string";
  if (removed) return;

  const reason =
    report?.reason ??
    cleanup.error?.code ??
    cleanup.signal ??
    (cleanup.status === null ? "helper_did_not_exit" : `helper_exit_${cleanup.status}`);
  const stderr =
    typeof cleanup.stderr === "string" ? cleanup.stderr.trim() : "";
  throw new Error(
    `Artifact probe capability cleanup failed closed (${reason}); the quarantine was retained without pathname-recursive deletion.${stderr ? ` helper stderr=${JSON.stringify(stderr)}` : ""}`,
    { cause: cleanup.error },
  );
}

function cleanupArtifactProbeOwnership(
  ownership: ArtifactProbeOwnership,
  afterQuarantineVerification?: (quarantinePath: string) => void,
  afterFinalQuarantineVerification?: (quarantinePath: string) => void,
): void {
  if (ownership.descriptorsClosed) return;
  let quarantinePath: string | null = null;
  let parentDescriptor: number | null = null;
  try {
    assertArtifactProbeAuthority(ownership);
    const expectedTree = snapshotArtifactProbeTree(ownership.scopeRoot);
    const parent = path.dirname(ownership.scopeRoot);
    parentDescriptor = fs.openSync(
      parent,
      fs.constants.O_RDONLY |
        fs.constants.O_DIRECTORY |
        fs.constants.O_NOFOLLOW,
    );
    const parentPathStats = fs.lstatSync(parent, { bigint: true });
    const parentDescriptorStats = fs.fstatSync(parentDescriptor, {
      bigint: true,
    });
    assertCondition(
      parentPathStats.isDirectory() &&
        parentDescriptorStats.isDirectory() &&
        sameArtifactProbeIdentity(
          artifactProbeIdentity(parentPathStats),
          artifactProbeIdentity(parentDescriptorStats),
        ),
      "Artifact probe quarantine parent does not match its held descriptor.",
    );
    quarantinePath = path.join(
      parent,
      `.${path.basename(ownership.scopeRoot)}.quarantine-${randomUUID()}`,
    );
    assertCondition(
      !fs.existsSync(quarantinePath),
      "Artifact probe random quarantine path unexpectedly exists.",
    );
    fs.renameSync(ownership.scopeRoot, quarantinePath);
    assertQuarantinedArtifactProbeRoot(
      ownership,
      quarantinePath,
      expectedTree,
    );
    afterQuarantineVerification?.(quarantinePath);
    assertQuarantinedArtifactProbeRoot(
      ownership,
      quarantinePath,
      expectedTree,
    );
    afterFinalQuarantineVerification?.(quarantinePath);
    removeQuarantinedArtifactProbeRoot(
      ownership,
      parentDescriptor,
      quarantinePath,
    );
  } finally {
    if (parentDescriptor !== null) fs.closeSync(parentDescriptor);
    closeArtifactProbeDescriptors(ownership);
  }
}

function writeArtifactProbeReport(
  ownership: ArtifactProbeOwnership,
  report: ArtifactSignalProbeReport | ArtifactParentSignalProbeReport,
): void {
  assertArtifactProbeAuthority(ownership);
  const identity = artifactProbeIdentity(
    fs.fstatSync(ownership.reportDescriptor, { bigint: true }),
  );
  assertCondition(
    sameArtifactProbeIdentity(identity, ownership.report) &&
      identity.nlink === "1",
    "Artifact probe report inode changed before descriptor write.",
  );
  writeArtifactProbeDescriptor(
    ownership.reportDescriptor,
    JSON.stringify(report),
  );
}

function readArtifactProbeReportContents(
  ownership: ArtifactProbeOwnership,
): string {
  assertArtifactProbeAuthority(ownership);
  return readArtifactProbeDescriptor(ownership.reportDescriptor);
}

function artifactSignalProbeBytes(label: string): Map<string, Buffer> {
  return new Map(
    ARTIFACT_FILES.map((file, index) => [
      file,
      Buffer.from(`${label}:${index}:${file}\n`, "utf8"),
    ]),
  );
}

async function runArtifactSignalProbe(
  signal: "SIGINT" | "SIGTERM",
  window: ArtifactPublicationWindow,
  ownership: ArtifactProbeOwnership,
): Promise<void> {
  assertInitialArtifactProbeTree(ownership);
  const { tempRoot } = ownership;
  const finalOutDir = ".";
  const reportedOutDir = tempRoot;
  const originalArtifacts = artifactSignalProbeBytes("original");
  const replacementArtifacts = artifactSignalProbeBytes("replacement");
  for (const [file, bytes] of originalArtifacts) {
    writeFileExclusivelyAndSync(path.join(finalOutDir, file), bytes);
  }
  snapshotArtifactProbeTree(ownership.scopeRoot);
  try {
    await installCanonicalArtifactSet(
      finalOutDir,
      replacementArtifacts,
      () => undefined,
      async (currentWindow) => {
        if (currentWindow !== window) return;
        const report: ArtifactSignalProbeReport = {
          phase: "ready",
          tempRoot,
          finalOutDir: reportedOutDir,
          signal,
          window,
        };
        writeArtifactProbeReport(ownership, report);
        await new Promise<void>((resolve) => {
          const timer = setInterval(() => undefined, 1_000);
          const release = () => {
            clearInterval(timer);
            process.off("SIGINT", release);
            process.off("SIGTERM", release);
            resolve();
          };
          process.once("SIGINT", release);
          process.once("SIGTERM", release);
        });
      },
    );
    throw new Error("Artifact signal probe completed without a signal.");
  } catch (error) {
    if (!(error instanceof ArtifactPublicationInterrupted)) throw error;
    assertArtifactBuffersEqual(
      originalArtifacts,
      readArtifacts(finalOutDir),
      `${signal} ${window} restored artifact set`,
    );
    const residue = fs
      .readdirSync(finalOutDir)
      .filter((entry) => entry.endsWith(".tmp") || entry.endsWith(".backup"));
    assertCondition(
      residue.length === 0,
      `${signal} ${window} left publication residue: ${residue.join(", ")}.`,
    );
    const cleanedReport: ArtifactSignalProbeReport = {
      phase: "cleaned",
      tempRoot,
      finalOutDir: reportedOutDir,
      signal,
      window,
      restoredHashes: artifactHashes(originalArtifacts),
    };
    snapshotArtifactProbeTree(ownership.scopeRoot);
    writeArtifactProbeReport(ownership, cleanedReport);
    throw error;
  }
}

async function readArtifactSignalProbeReport(
  ownership: ArtifactProbeOwnership,
  expectedPhase: ArtifactSignalProbeReport["phase"],
  timeoutMs: number,
): Promise<ArtifactSignalProbeReport> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const report = JSON.parse(
        readArtifactProbeReportContents(ownership),
      ) as ArtifactSignalProbeReport;
      if (report.phase === expectedPhase) return report;
    } catch {
      // The child may still be truncating and rewriting the authorized report descriptor.
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(
    `Timed out waiting for artifact signal probe phase ${expectedPhase}.`,
  );
}

type ArtifactProbeProcessScope = {
  child?: ChildProcess;
  ownership: ArtifactProbeOwnership;
  cleanup?: Promise<void>;
};

type ArtifactProbeWait = <T>(pending: Promise<T>) => Promise<T>;

async function cleanupArtifactProbeProcess(
  scope: ArtifactProbeProcessScope,
  signal: "SIGINT" | "SIGTERM",
): Promise<void> {
  if (scope.cleanup) return scope.cleanup;
  scope.cleanup = (async () => {
    if (scope.child && !hasExited(scope.child)) {
      scope.child.kill(signal);
      if (!(await waitForChildExit(scope.child, 8_000))) {
        scope.child.kill("SIGKILL");
        assertCondition(
          await waitForChildExit(scope.child, 2_000),
          `Owned artifact probe child ${scope.child.pid ?? "unknown"} did not exit.`,
        );
      }
    }
    assertCondition(
      !scope.child || hasExited(scope.child),
      `Owned artifact probe child ${scope.child?.pid ?? "unknown"} was not reaped.`,
    );
    cleanupArtifactProbeOwnership(scope.ownership);
  })();
  return scope.cleanup;
}

async function withSignalManagedArtifactProbe<T>(
  scope: ArtifactProbeProcessScope,
  run: (wait: ArtifactProbeWait) => Promise<T>,
): Promise<T> {
  let receivedSignal: "SIGINT" | "SIGTERM" | null = null;
  let rejectInterruption:
    | ((error: ArtifactProbeHarnessInterrupted) => void)
    | null = null;
  const interruption = new Promise<never>((_resolve, reject) => {
    rejectInterruption = reject;
  });
  const absorb = (signal: "SIGINT" | "SIGTERM") => {
    if (receivedSignal) return;
    receivedSignal = signal;
    rejectInterruption?.(new ArtifactProbeHarnessInterrupted(signal));
  };
  const onSigint = () => absorb("SIGINT");
  const onSigterm = () => absorb("SIGTERM");
  const wait: ArtifactProbeWait = (pending) =>
    Promise.race([pending, interruption]);
  process.on("SIGINT", onSigint);
  process.on("SIGTERM", onSigterm);
  try {
    return await run(wait);
  } finally {
    try {
      await cleanupArtifactProbeProcess(
        scope,
        receivedSignal ?? "SIGTERM",
      );
    } finally {
      process.off("SIGINT", onSigint);
      process.off("SIGTERM", onSigterm);
    }
  }
}

function runArtifactAuthorityCheck(
  ownership?: ArtifactProbeOwnership,
  descriptors: Partial<{
    root: number;
    work: number;
    report: number;
    nonce: number;
  }> = {},
): ReturnType<typeof spawnSync> {
  const stdio = ownership
    ? [
        "ignore",
        "pipe",
        "pipe",
        descriptors.root ?? ownership.rootDescriptor,
        descriptors.work ?? ownership.workDescriptor,
        descriptors.report ?? ownership.reportDescriptor,
        descriptors.nonce ?? ownership.nonceDescriptor,
      ]
    : ["ignore", "pipe", "pipe"];
  return spawnSync(
    process.execPath,
    [
      ...process.execArgv,
      ARTIFACT_PROBE_SCRIPT_PATH,
      "--artifact-authority-check",
    ],
    {
      cwd: ownership?.tempRoot ?? ROOT,
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
        PUBLICATION_GATE_FIXTURE: "",
      },
      stdio,
      encoding: "utf8",
      timeout: 10_000,
    },
  );
}

function assertArtifactProbeCapabilityRejection(): void {
  const noDescriptors = runArtifactAuthorityCheck();
  assertCondition(
    noDescriptors.status === 1 && noDescriptors.signal === null,
    "Artifact hidden probe accepted CLI-declared authority without inherited descriptors.",
  );

  const positive = createArtifactProbeOwnership();
  try {
    const accepted = runArtifactAuthorityCheck(positive);
    assertCondition(
      accepted.status === 0 && accepted.signal === null,
      `Artifact hidden probe rejected parent-held descriptors: ${accepted.stderr || accepted.stdout}`,
    );
  } finally {
    cleanupArtifactProbeOwnership(positive);
  }

  const forgedDescriptor = createArtifactProbeOwnership();
  const forgedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-artifact-forged-root-")),
  );
  const forgedSentinel = path.join(forgedRoot, "sentinel.txt");
  fs.writeFileSync(forgedSentinel, "must-remain", { flag: "wx" });
  const forgedRootDescriptor = fs.openSync(
    forgedRoot,
    fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
  );
  try {
    const rejected = runArtifactAuthorityCheck(forgedDescriptor, {
      root: forgedRootDescriptor,
    });
    assertCondition(
      rejected.status === 1 &&
        fs.readFileSync(forgedSentinel, "utf8") === "must-remain",
      "Artifact hidden probe accepted a forged root descriptor.",
    );
  } finally {
    fs.closeSync(forgedRootDescriptor);
    cleanupArtifactProbeOwnership(forgedDescriptor);
    fs.rmSync(forgedRoot, { recursive: true, force: true });
  }

  const sharedLink = createArtifactProbeOwnership();
  const sharedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-artifact-shared-link-")),
  );
  const reportAlias = path.join(sharedRoot, "report-alias.json");
  fs.linkSync(sharedLink.reportFile, reportAlias);
  try {
    const rejected = runArtifactAuthorityCheck(sharedLink);
    assertCondition(
      rejected.status === 1 && fs.existsSync(reportAlias),
      "Artifact hidden probe accepted a shared-link authority file.",
    );
  } finally {
    fs.rmSync(reportAlias, { force: true });
    cleanupArtifactProbeOwnership(sharedLink);
    fs.rmSync(sharedRoot, { recursive: true, force: true });
  }

  const nestedAlias = createArtifactProbeOwnership();
  const aliasVictim = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-artifact-alias-victim-")),
  );
  const victimFile = path.join(aliasVictim, "must-remain.txt");
  const aliasPath = path.join(nestedAlias.tempRoot, "nested-alias");
  fs.writeFileSync(victimFile, "must-remain", { flag: "wx" });
  fs.symlinkSync(aliasVictim, aliasPath, "dir");
  try {
    const rejected = runArtifactAuthorityCheck(nestedAlias);
    assertCondition(
      rejected.status === 1 &&
        fs.readFileSync(victimFile, "utf8") === "must-remain",
      "Artifact hidden probe accepted a nested work-path alias.",
    );
  } finally {
    fs.rmSync(aliasPath, { force: true });
    cleanupArtifactProbeOwnership(nestedAlias);
    fs.rmSync(aliasVictim, { recursive: true, force: true });
  }

  for (const afterFinalCheck of [false, true]) {
    const replacementWindow = createArtifactProbeOwnership();
    const historicalRoot = fs.realpathSync.native(
      fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-artifact-probe-history-")),
    );
    const historicalSentinel = path.join(historicalRoot, "must-remain.txt");
    fs.writeFileSync(historicalSentinel, "must-remain", { flag: "wx" });
    let displacedRoot = "";
    let replacementRoot = "";
    const replaceQuarantine = (quarantinePath: string) => {
      displacedRoot = `${quarantinePath}.displaced`;
      replacementRoot = quarantinePath;
      fs.renameSync(quarantinePath, displacedRoot);
      fs.mkdirSync(replacementRoot, { mode: 0o700 });
      fs.writeFileSync(path.join(replacementRoot, "replacement.txt"), "stay", {
        flag: "wx",
      });
    };
    try {
      expectThrow(
        () =>
          cleanupArtifactProbeOwnership(
            replacementWindow,
            afterFinalCheck ? undefined : replaceQuarantine,
            afterFinalCheck ? replaceQuarantine : undefined,
          ),
        afterFinalCheck ? "entry_identity_changed" : "quarantine root changed",
      );
      assertCondition(
        fs.readFileSync(path.join(replacementRoot, "replacement.txt"), "utf8") ===
          "stay" &&
          fs.existsSync(displacedRoot) &&
          (!afterFinalCheck || fs.readdirSync(displacedRoot).length === 0) &&
          fs.readFileSync(historicalSentinel, "utf8") === "must-remain",
        "Artifact cleanup deleted a replacement or historical probe sibling.",
      );
    } finally {
      if (replacementRoot) {
        fs.rmSync(replacementRoot, { recursive: true, force: true });
      }
      if (displacedRoot) {
        fs.rmSync(displacedRoot, { recursive: true, force: true });
      }
      fs.rmSync(historicalRoot, { recursive: true, force: true });
    }
  }

  const unavailableHelperWindow = createArtifactProbeOwnership();
  const originalPath = process.env.PATH;
  let unavailableHelperQuarantine = "";
  try {
    expectThrow(
      () =>
        cleanupArtifactProbeOwnership(
          unavailableHelperWindow,
          undefined,
          (quarantinePath) => {
            unavailableHelperQuarantine = quarantinePath;
            process.env.PATH = "";
          },
        ),
      "ENOENT",
    );
    assertCondition(
      fs.existsSync(unavailableHelperQuarantine),
      "Artifact cleanup removed its quarantine when the capability helper was unavailable.",
    );
  } finally {
    if (originalPath === undefined) delete process.env.PATH;
    else process.env.PATH = originalPath;
    if (unavailableHelperQuarantine) {
      fs.rmSync(unavailableHelperQuarantine, { recursive: true, force: true });
    }
  }
}

async function assertArtifactPublicationSignalSafety(
  parentCheckpoint?: (
    child: ChildProcess,
    ready: ArtifactSignalProbeReport,
  ) => Promise<void>,
  skipParentContract = false,
): Promise<void> {
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    for (const window of ["after-backup", "after-first-install"] as const) {
      const output: string[] = [];
      const ownership = createArtifactProbeOwnership();
      const scope: ArtifactProbeProcessScope = { ownership };
      try {
        await withSignalManagedArtifactProbe(scope, async (wait) => {
          const child = spawn(
            process.execPath,
            [
              ...process.execArgv,
              ARTIFACT_PROBE_SCRIPT_PATH,
              "--artifact-signal-probe",
              "--signal",
              signal,
              "--window",
              window,
            ],
            {
              cwd: ownership.tempRoot,
              env: {
                ...process.env,
                TURSO_DATABASE_URL: "",
                TURSO_AUTH_TOKEN: "",
                FPKG_DATABASE_URL: "",
                PUBLICATION_GATE_FIXTURE: "",
              },
              stdio: [
                "ignore",
                "pipe",
                "pipe",
                ownership.rootDescriptor,
                ownership.workDescriptor,
                ownership.reportDescriptor,
                ownership.nonceDescriptor,
              ],
            },
          );
          scope.child = child;
          child.stdout?.on("data", (chunk) => output.push(String(chunk)));
          child.stderr?.on("data", (chunk) => output.push(String(chunk)));
          const ready = await wait(
            readArtifactSignalProbeReport(ownership, "ready", 10_000),
          );
          assertCondition(
            ready.tempRoot === ownership.tempRoot &&
              fs.existsSync(ready.finalOutDir),
            `${signal} ${window} did not reach the requested owned publication window.`,
          );
          if (
            parentCheckpoint &&
            signal === "SIGINT" &&
            window === "after-backup"
          ) {
            await wait(parentCheckpoint(child, ready));
          }
          child.kill(signal);
          assertCondition(
            await wait(waitForChildExit(child, 8_000)),
            `${signal} ${window} publication probe did not exit.`,
          );
          const cleaned = await wait(
            readArtifactSignalProbeReport(ownership, "cleaned", 1_000),
          );
          assertCondition(
            child.signalCode === null &&
              child.exitCode === (signal === "SIGINT" ? 130 : 143) &&
              fs.existsSync(cleaned.tempRoot) &&
              cleaned.restoredHashes?.length === ARTIFACT_FILES.length,
            `${signal} ${window} did not restore the complete artifact set through its owned descriptors.`,
          );
        });
      } catch (error) {
        if (error instanceof ArtifactProbeHarnessInterrupted) throw error;
        throw new Error(
          `Artifact publication ${signal} ${window} probe failed: ${
            error instanceof Error ? error.message : String(error)
          }. ${output.join("")}`,
          { cause: error },
        );
      }
    }
  }
  if (!skipParentContract) {
    await assertArtifactParentHarnessSignalSafety();
    assertArtifactProbeCapabilityRejection();
  }
}

async function runArtifactParentSignalTarget(
  signal: "SIGINT" | "SIGTERM",
  ownership: ArtifactProbeOwnership,
): Promise<void> {
  let checkpoint: ArtifactParentSignalProbeReport | null = null;
  try {
    await assertArtifactPublicationSignalSafety(
      async (child, ready) => {
        assertCondition(child.pid, "Artifact parent signal target child has no PID.");
        checkpoint = {
          phase: "ready",
          childPid: child.pid,
          tempRoot: ready.tempRoot,
          signal,
        };
        writeArtifactProbeReport(ownership, checkpoint);
        await new Promise<void>((resolve) => {
          const timer = setInterval(() => undefined, 1_000);
          const release = () => {
            clearInterval(timer);
            process.off("SIGINT", release);
            process.off("SIGTERM", release);
            resolve();
          };
          process.once("SIGINT", release);
          process.once("SIGTERM", release);
        });
      },
      true,
    );
  } catch (error) {
    if (!(error instanceof ArtifactProbeHarnessInterrupted) || !checkpoint) {
      throw error;
    }
    assertCondition(
      !processIsAlive(checkpoint.childPid) &&
        !fs.existsSync(checkpoint.tempRoot),
      `${signal} parent signal target did not clean its owned child/root.`,
    );
    writeArtifactProbeReport(ownership, {
      ...checkpoint,
      phase: "cleaned",
    });
    throw error;
  }
}

async function assertArtifactParentHarnessSignalSafety(): Promise<void> {
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    const output: string[] = [];
    const ownership = createArtifactProbeOwnership();
    const scope: ArtifactProbeProcessScope = { ownership };
    try {
      await withSignalManagedArtifactProbe(scope, async (wait) => {
        const target = spawn(
          process.execPath,
          [
            ...process.execArgv,
            ARTIFACT_PROBE_SCRIPT_PATH,
            "--artifact-parent-signal-target",
            "--signal",
            signal,
          ],
          {
            cwd: ownership.tempRoot,
            env: {
              ...process.env,
              TURSO_DATABASE_URL: "",
              TURSO_AUTH_TOKEN: "",
              FPKG_DATABASE_URL: "",
              PUBLICATION_GATE_FIXTURE: "",
            },
            stdio: [
              "ignore",
              "pipe",
              "pipe",
              ownership.rootDescriptor,
              ownership.workDescriptor,
              ownership.reportDescriptor,
              ownership.nonceDescriptor,
            ],
          },
        );
        scope.child = target;
        target.stdout?.on("data", (chunk) => output.push(String(chunk)));
        target.stderr?.on("data", (chunk) => output.push(String(chunk)));
        const report = (await wait(
          readArtifactSignalProbeReport(ownership, "ready", 10_000),
        )) as ArtifactParentSignalProbeReport;
        assertCondition(
          report.signal === signal &&
            processIsAlive(report.childPid) &&
            fs.existsSync(report.tempRoot),
          `${signal} parent probe did not expose its strictly owned child/root.`,
        );
        target.kill(signal);
        assertCondition(
          await wait(waitForChildExit(target, 8_000)),
          `${signal} parent artifact harness did not exit.`,
        );
        const cleaned = (await wait(
          readArtifactSignalProbeReport(ownership, "cleaned", 1_000),
        )) as ArtifactParentSignalProbeReport;
        assertCondition(
          target.signalCode === null &&
            target.exitCode === (signal === "SIGINT" ? 130 : 143) &&
            !processIsAlive(cleaned.childPid) &&
            !fs.existsSync(cleaned.tempRoot),
          `${signal} parent artifact harness did not clean and reap its child/root.`,
        );
      });
    } catch (error) {
      if (error instanceof ArtifactProbeHarnessInterrupted) throw error;
      throw new Error(
        `Artifact parent harness ${signal} probe failed: ${
          error instanceof Error ? error.message : String(error)
        }. ${output.join("")}`,
        { cause: error },
      );
    }
  }
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

  await assertArtifactPublicationSignalSafety();

  console.log(
    "Audit artifact contract passed: repeat and limit=1 bytes, hashes, summary, verdict, and exit semantics are identical; SIGINT/SIGTERM restore the complete artifact set at backup/install windows and the parent harness reaps its owned child/root; only terminal preview is limited.",
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
    is_public: boolean;
    publication_status: string;
  }>;
  counts?: Record<string, number>;
  summaries?: unknown[];
  priorityBrands?: Array<{ id: string; coverage_status: string }>;
  priorityPens?: Array<{ id: string; coverage_status: string }>;
  thinEntities?: Array<{ entity: { entity_id: string } }>;
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
    await approveAndPublish(client, brand.entityId);
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
    const qualifiedDraft = await seedQualifiedPublicationFixture(client, {
      entityId: "legacy-qualified-draft",
      entityType: "brand",
    });
    await approveAndPublish(client, qualifiedDraft.entityId);
    await client.execute({
      sql: `UPDATE entity_publications
            SET status = 'draft', updated_at = datetime('now')
            WHERE entity_id = ?`,
      args: [qualifiedDraft.entityId],
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
        byId.get("legacy-qualified-draft")?.content_ready === true &&
          byId.get("legacy-qualified-draft")?.is_public === false &&
          byId.get("legacy-qualified-draft")?.publication_status === "draft",
        "Qualified draft fixture did not isolate publication state from content readiness.",
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
      if (scriptName === "audit-entity-quality.ts") {
        assertCondition(
          unlimited.json.thinEntities?.some(
            (item) => item.entity.entity_id === "legacy-qualified-draft",
          ),
          "Entity quality marked a fully evidenced draft as complete.",
        );
      } else {
        const priorities = [
          ...(unlimited.json.priorityBrands ?? []),
          ...(unlimited.json.priorityPens ?? []),
        ];
        assertCondition(
          priorities.find((row) => row.id === "legacy-qualified-draft")
            ?.coverage_status !== "ready",
          "Library coverage marked a fully evidenced draft as ready.",
        );
      }
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
        coverageById.get("legacy-qualified-draft")?.coverage_status !==
          "ready" &&
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

function readinessAuditTempRoots(): Set<string> {
  return new Set(
    fs
      .readdirSync(os.tmpdir())
      .filter((entry) => entry.startsWith("fpkg-readiness-v2-"))
      .map((entry) => path.join(os.tmpdir(), entry)),
  );
}

type ReadinessOwnedCopyScript =
  | "audit-readiness-v2.ts"
  | "audit-entity-quality.ts"
  | "audit-library-coverage.ts";

function readinessScriptArguments(
  scriptName: ReadinessOwnedCopyScript,
  databasePath: string,
  outputRoot: string,
): string[] {
  const args = [
    path.join(ROOT, "scripts", scriptName),
    "--database-path",
    databasePath,
  ];
  if (scriptName === "audit-readiness-v2.ts") {
    fs.mkdirSync(outputRoot, { recursive: true });
    args.push("--out-dir", outputRoot);
  }
  return args;
}

async function assertReadinessSignalCleanup(
  scriptName: ReadinessOwnedCopyScript,
  signal: "SIGINT" | "SIGTERM",
  databasePath: string,
  fixtureRoot: string,
): Promise<void> {
  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  const suffix = `${scriptName.replace(/\.ts$/, "")}-${signal.toLowerCase()}`;
  const outputRoot = path.join(fixtureRoot, `${suffix}-out`);
  const reportFile = path.join(fixtureRoot, `${suffix}-report.json`);
  const args = [
    tsxCli,
    ...readinessScriptArguments(
      scriptName,
      databasePath,
      outputRoot,
    ),
    "--signal-probe-report",
    reportFile,
  ];
  const output: string[] = [];
  const child = spawn(process.execPath, args, {
    cwd: ROOT,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
      PUBLICATION_GATE_FIXTURE: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout?.on("data", (chunk) => output.push(String(chunk)));
  child.stderr?.on("data", (chunk) => output.push(String(chunk)));
  try {
    await waitForFile(reportFile, 15_000);
    const report = JSON.parse(fs.readFileSync(reportFile, "utf8")) as {
      tempRoot: string;
      databasePath: string;
    };
    assertCondition(
      fs.existsSync(report.tempRoot) && fs.existsSync(report.databasePath),
      `${scriptName} ${signal} probe did not expose its owned copy.`,
    );
    child.kill(signal);
    assertCondition(
      await waitForChildExit(child, 8_000),
      `${scriptName} did not exit after ${signal}.`,
    );
    assertCondition(
      !fs.existsSync(report.tempRoot),
      `${scriptName} ${signal} left its owned root behind.`,
    );
  } catch (error) {
    await stopChild(child);
    throw new Error(
      `${scriptName} ${signal} cleanup failed: ${
        error instanceof Error ? error.message : String(error)
      }. ${output.join("")}`,
      { cause: error },
    );
  } finally {
    fs.rmSync(reportFile, { force: true });
  }
}

function assertReadinessFailureCleanup(
  scriptName: ReadinessOwnedCopyScript,
  databasePath: string,
  fixtureRoot: string,
): void {
  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  const outputRoot = path.join(
    fixtureRoot,
    `${scriptName.replace(/\.ts$/, "")}-failure-out`,
  );
  const child = spawnSync(
    process.execPath,
    [
      tsxCli,
      ...readinessScriptArguments(
        scriptName,
        databasePath,
        outputRoot,
      ),
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
      encoding: "utf8",
      timeout: 30_000,
    },
  );
  assertCondition(
    !child.error && child.status === 1 && child.signal === null,
    `${scriptName} failure probe did not fail closed: ${child.stderr || child.stdout}`,
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

async function runCheckpointedCopyContract(): Promise<void> {
  await withOwnedTempRoot("fpkg-checkpointed-copy-", async (tempRoot) => {
    const sourcePath = path.join(tempRoot, "source.db");
    const sourceDatabase = new Database(sourcePath);
    try {
      sourceDatabase.pragma("journal_mode = DELETE");
      sourceDatabase.exec(
        "CREATE TABLE source_probe(id INTEGER PRIMARY KEY, label TEXT NOT NULL); INSERT INTO source_probe(label) VALUES ('checkpointed');",
      );
    } finally {
      sourceDatabase.close();
    }
    fs.writeFileSync(`${sourcePath}-wal`, "");
    fs.writeFileSync(`${sourcePath}-shm`, Buffer.alloc(32_768));
    const sourceBefore = snapshotCatalogFiles(sourcePath);
    const ownedRoot = path.join(tempRoot, "owned");
    fs.mkdirSync(ownedRoot);
    const destinationPath = path.join(ownedRoot, "copy.db");
    const copied = copyCheckpointedCatalogToDisposableCopy(
      sourcePath,
      destinationPath,
      ownedRoot,
      { expectedSourceSnapshot: sourceBefore },
    );
    assertCatalogSnapshotUnchanged(
      sourceBefore,
      snapshotCatalogFiles(sourcePath),
    );
    assertCondition(
      copied.destinationPath === destinationPath &&
        copied.destinationSnapshot.main.sha256 === sourceBefore.main.sha256 &&
        copied.destinationSnapshot.main.inode !== sourceBefore.main.inode,
      "Checkpointed copy did not create an independent byte-identical main file.",
    );
    const copiedDatabase = new Database(destinationPath, {
      readonly: true,
      fileMustExist: true,
    });
    try {
      const probe = copiedDatabase
        .prepare("SELECT label FROM source_probe")
        .get() as { label: string };
      assertCondition(
        probe.label === "checkpointed",
        "Checkpointed copy omitted source data.",
      );
    } finally {
      copiedDatabase.close();
    }

    fs.writeFileSync(`${sourcePath}-wal`, "pending");
    expectThrow(
      () =>
        copyCheckpointedCatalogToDisposableCopy(
          sourcePath,
          path.join(ownedRoot, "non-empty-wal.db"),
          ownedRoot,
        ),
      "non-empty WAL",
    );
    fs.writeFileSync(`${sourcePath}-wal`, "");

    fs.writeFileSync(`${sourcePath}-journal`, "hot rollback state");
    expectThrow(
      () =>
        copyCheckpointedCatalogToDisposableCopy(
          sourcePath,
          path.join(ownedRoot, "rollback-journal.db"),
          ownedRoot,
        ),
      "rollback journal artifacts",
    );
    fs.rmSync(`${sourcePath}-journal`);

    const mainSymlink = path.join(tempRoot, "main-link.db");
    fs.symlinkSync(sourcePath, mainSymlink);
    expectThrow(
      () =>
        copyCheckpointedCatalogToDisposableCopy(
          mainSymlink,
          path.join(ownedRoot, "main-symlink.db"),
          ownedRoot,
        ),
      "must not be a symlink",
    );
    fs.rmSync(`${sourcePath}-wal`);
    fs.symlinkSync(sourcePath, `${sourcePath}-wal`);
    expectThrow(
      () =>
        copyCheckpointedCatalogToDisposableCopy(
          sourcePath,
          path.join(ownedRoot, "wal-symlink.db"),
          ownedRoot,
        ),
      "must not be a symlink",
    );
    fs.rmSync(`${sourcePath}-wal`);
    fs.linkSync(sourcePath, `${sourcePath}-wal`);
    expectThrow(
      () =>
        copyCheckpointedCatalogToDisposableCopy(
          sourcePath,
          path.join(ownedRoot, "family-hardlink.db"),
          ownedRoot,
        ),
      "hardlink aliases",
    );
    fs.rmSync(`${sourcePath}-wal`);
    fs.writeFileSync(`${sourcePath}-wal`, "");

    const hardlinkDestination = path.join(ownedRoot, "hardlink-destination.db");
    fs.linkSync(sourcePath, hardlinkDestination);
    expectThrow(
      () =>
        copyCheckpointedCatalogToDisposableCopy(
          sourcePath,
          hardlinkDestination,
          ownedRoot,
        ),
      "link count one",
    );
    fs.rmSync(hardlinkDestination);

    const walOwnerPath = path.join(tempRoot, "wal-owner.db");
    const walOwner = new Database(walOwnerPath);
    try {
      walOwner.pragma("journal_mode = WAL");
      walOwner.pragma("wal_autocheckpoint = 0");
      walOwner.exec(
        "CREATE TABLE wal_probe(id INTEGER PRIMARY KEY); INSERT INTO wal_probe DEFAULT VALUES;",
      );
      assertCondition(
        fs.statSync(`${walOwnerPath}-wal`).size > 0,
        "Hardlink bypass fixture did not retain a non-empty WAL.",
      );
      const hiddenWalAlias = path.join(tempRoot, "hidden-wal-alias.db");
      fs.linkSync(walOwnerPath, hiddenWalAlias);
      expectThrow(
        () =>
          copyCheckpointedCatalogToDisposableCopy(
            hiddenWalAlias,
            path.join(ownedRoot, "hidden-wal-copy.db"),
            ownedRoot,
          ),
        "link count one",
      );
    } finally {
      walOwner.close();
    }
    const existingDestination = path.join(ownedRoot, "existing.db");
    fs.writeFileSync(existingDestination, "existing");
    expectThrow(
      () =>
        copyCheckpointedCatalogToDisposableCopy(
          sourcePath,
          existingDestination,
          ownedRoot,
        ),
      "must not already exist",
    );
    assertCondition(
      fs.readFileSync(existingDestination, "utf8") === "existing",
      "Rejected destination overwrite deleted or changed the caller file.",
    );

    const outsideRoot = path.join(tempRoot, "outside");
    fs.mkdirSync(outsideRoot);
    const escapeLink = path.join(ownedRoot, "escape");
    fs.symlinkSync(outsideRoot, escapeLink, "dir");
    expectThrow(
      () =>
        copyCheckpointedCatalogToDisposableCopy(
          sourcePath,
          path.join(escapeLink, "escaped.db"),
          ownedRoot,
        ),
      "inside the caller-owned root",
    );

    const staleSnapshot = snapshotCatalogFiles(sourcePath);
    const now = new Date(Date.now() + 2_000);
    fs.utimesSync(sourcePath, now, now);
    expectThrow(
      () =>
        copyCheckpointedCatalogToDisposableCopy(
          sourcePath,
          path.join(ownedRoot, "stale-snapshot.db"),
          ownedRoot,
          { expectedSourceSnapshot: staleSnapshot },
        ),
      "snapshot changed",
    );

    const concurrentPath = path.join(tempRoot, "concurrent.db");
    fs.writeFileSync(concurrentPath, Buffer.alloc(32 * 1024 * 1024));
    fs.writeFileSync(`${concurrentPath}-wal`, "");
    fs.writeFileSync(`${concurrentPath}-shm`, Buffer.alloc(32_768));
    const readyFile = path.join(tempRoot, "concurrent-ready");
    const mutator = spawn(
      process.execPath,
      [
        "-e",
        `const fs=require('node:fs');const p=${JSON.stringify(concurrentPath)};const r=${JSON.stringify(readyFile)};const fd=fs.openSync(p,'r+');let n=0;fs.writeFileSync(r,'ready');setInterval(()=>{fs.writeSync(fd,Buffer.from([n++%256]),0,1,0);},1);`,
      ],
      { cwd: ROOT, stdio: "ignore" },
    );
    try {
      await waitForFile(readyFile, 5_000);
      let concurrentRejected = false;
      try {
        copyCheckpointedCatalogToDisposableCopy(
          concurrentPath,
          path.join(ownedRoot, "concurrent-copy.db"),
          ownedRoot,
        );
      } catch (error) {
        concurrentRejected =
          error instanceof Error && error.message.includes("changed");
      }
      assertCondition(
        concurrentRejected,
        "Checkpointed copy did not reject a concurrently changing source.",
      );
    } finally {
      await stopChild(mutator);
    }
    assertCondition(
      !fs.existsSync(path.join(ownedRoot, "concurrent-copy.db")),
      "Rejected concurrent copy left a partial destination.",
    );
  });
}

async function runLibraryContractSafety(): Promise<void> {
  const checkerSource = fs.readFileSync(LIBRARY_CONTRACT_PATH, "utf8");
  assertCondition(
    checkerSource.includes("copyCheckpointedCatalogToDisposableCopy") &&
      checkerSource.includes("snapshotCatalogFiles") &&
      checkerSource.includes("--database-path"),
    "Library contract checker has not adopted the protected online-backup seam.",
  );

  const realBefore = snapshotRealCatalogInvariant();
  await runCheckpointedCopyContract();
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

    const require = createRequire(import.meta.url);
    const tsxCli = require.resolve("tsx/cli");
    for (const signal of ["SIGINT", "SIGTERM"] as const) {
      const reportFile = path.join(
        fixture.tempRoot,
        `library-${signal.toLowerCase()}-${process.pid}.json`,
      );
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
        signalChild.kill(signal);
        assertCondition(
          await waitForChildExit(signalChild, 8_000),
          `Library contract signal probe did not exit after ${signal}.`,
        );
        assertCondition(
          !fs.existsSync(report.tempRoot),
          `Library contract ${signal} cleanup left its owned root behind.`,
        );
      } catch (error) {
        await stopChild(signalChild);
        throw new Error(
          `Library contract ${signal} cleanup failed: ${
            error instanceof Error ? error.message : String(error)
          }. ${signalOutput.join("")}`,
          { cause: error },
        );
      } finally {
        fs.rmSync(reportFile, { force: true });
      }
    }

    const readinessRootsBefore = readinessAuditTempRoots();
    const readinessCorruptPath = path.join(
      fixture.tempRoot,
      "readiness-corrupt.db",
    );
    fs.writeFileSync(readinessCorruptPath, "not a sqlite database");
    const readinessCorruptBefore = snapshotCatalogFiles(readinessCorruptPath);
    for (const scriptName of [
      "audit-readiness-v2.ts",
      "audit-entity-quality.ts",
      "audit-library-coverage.ts",
    ] as const) {
      assertReadinessFailureCleanup(
        scriptName,
        readinessCorruptPath,
        fixture.tempRoot,
      );
      for (const signal of ["SIGINT", "SIGTERM"] as const) {
        await assertReadinessSignalCleanup(
          scriptName,
          signal,
          fixture.databasePath,
          fixture.tempRoot,
        );
      }
    }
    assertCatalogSnapshotUnchanged(
      readinessCorruptBefore,
      snapshotCatalogFiles(readinessCorruptPath),
    );
    assertCondition(
      JSON.stringify([...readinessRootsBefore].sort()) ===
        JSON.stringify([...readinessAuditTempRoots()].sort()),
      "Readiness/legacy failure or signal probes leaked an owned root.",
    );

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
    "Shared audit safety passed: checkpointed exclusive copy/migration, remote/symlink/hardlink/WAL/journal/overwrite rejection, concurrent-change failure, success/failure/SIGINT/SIGTERM cleanup, and current real main/WAL/SHM snapshot preservation.",
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
  if (args[0] === "--artifact-authority-check") {
    assertCondition(
      args.length === 1,
      "--artifact-authority-check accepts inherited descriptors only.",
    );
    loadInheritedArtifactProbeOwnership();
    return;
  }
  if (args[0] === "--artifact-parent-signal-target") {
    const signalIndex = args.indexOf("--signal");
    const signal = args[signalIndex + 1];
    assertCondition(
      args.length === 3 && (signal === "SIGINT" || signal === "SIGTERM"),
      "--artifact-parent-signal-target requires --signal SIGINT|SIGTERM and inherited authority descriptors.",
    );
    await runArtifactParentSignalTarget(
      signal,
      loadInheritedArtifactProbeOwnership(),
    );
    return;
  }
  if (args[0] === "--artifact-signal-probe") {
    const signalIndex = args.indexOf("--signal");
    const windowIndex = args.indexOf("--window");
    const signal = args[signalIndex + 1];
    const window = args[windowIndex + 1];
    assertCondition(
      args.length === 5 &&
        (signal === "SIGINT" || signal === "SIGTERM") &&
        (window === "after-backup" || window === "after-first-install"),
      "--artifact-signal-probe requires --signal SIGINT|SIGTERM --window after-backup|after-first-install and inherited authority descriptors.",
    );
    await runArtifactSignalProbe(
      signal,
      window,
      loadInheritedArtifactProbeOwnership(),
    );
    return;
  }
  if (args[0] === "--signal-probe") {
    const reportIndex = args.indexOf("--report");
    const reportFile = reportIndex >= 0 ? args[reportIndex + 1] : undefined;
    if (!reportFile) {
      throw new Error("--signal-probe requires --report <path>.");
    }
    await runSignalProbe(reportFile);
    return;
  }
  if (args[0] === "--real-artifacts") {
    assertCondition(
      args.length === 5 &&
        args.filter((arg) => arg === "--database-path").length === 1 &&
        args.filter((arg) => arg === "--final-out-dir").length === 1,
      "Usage: pnpm check:audit-readiness -- --real-artifacts --database-path <absolute-fpkg.db> --final-out-dir <absolute-artifact-directory>.",
    );
    const databaseIndex = args.indexOf("--database-path");
    const finalOutIndex = args.indexOf("--final-out-dir");
    const databasePath = args[databaseIndex + 1];
    const finalOutDir = args[finalOutIndex + 1];
    assertCondition(
      databaseIndex > 0 &&
        finalOutIndex > 0 &&
        databasePath &&
        finalOutDir &&
        !databasePath.startsWith("--") &&
        !finalOutDir.startsWith("--"),
      "--real-artifacts requires explicit values for --database-path and --final-out-dir.",
    );
    await runRealArtifactsContract(databasePath, finalOutDir);
    return;
  }
  if (args.length === 1 && args[0] === "--fixture") {
    await runInventoryContract();
    await runBackupMigrationContract();
    await runCliInputsContract();
    await runLegacyAuditsContract();
    await runLibraryContractSafety();
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
      "Usage: pnpm exec tsx scripts/check-audit-readiness.ts --readonly-isolation|--readonly-backup|--fixture-isolation|--fixture|--real-artifacts --database-path <absolute-fpkg.db> --final-out-dir <absolute-artifact-directory>|[--inventory] [--backup-migration] [--artifacts-limit] [--cli-inputs] [--legacy-audits] [--library-contract-safety]",
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
  process.exitCode =
    error instanceof ArtifactPublicationInterrupted ||
    error instanceof ArtifactProbeHarnessInterrupted
      ? error.exitCode
      : 1;
});
