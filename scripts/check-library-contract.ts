import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { migrateDatabase } from "../src/lib/db";
import type { AuditReadClient, CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  openReadOnlyCatalog,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";

const ROOT = process.cwd();
const DEFAULT_DATABASE_PATH = path.join(ROOT, "data", "fpkg.db");
const REMOTE_DATABASE_URL = /^[a-z][a-z\d+.-]*:\/\//i;
const TEMP_PREFIX = "fpkg-library-contract-";

const REQUIRED_TABLES = [
  "source_registry",
  "source_items",
  "entity_aliases",
  "external_ids",
  "claims",
  "citations",
  "media_assets",
  "stories",
  "timeline_events",
  "model_specs",
  "model_variants",
  "diagrams",
  "community_summaries",
  "entity_references",
  "exhibits",
  "exhibit_sections",
] as const;

type CliOptions = {
  databasePath: string;
  explicitDatabasePath: boolean;
  signalProbeReport: string | null;
};

type OwnedWorkspace = {
  tempRoot: string;
  databasePath: string;
  sourceBefore: CatalogSnapshot;
  writer: Client | null;
  reader: AuditReadClient | null;
  cleanupPromise: Promise<void> | null;
};

function parseArguments(argv: readonly string[]): CliOptions {
  const args = argv.filter((arg) => arg !== "--");
  const values = new Map<string, string>();
  const valueOptions = new Set(["--database-path", "--signal-probe-report"]);
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (!valueOptions.has(argument)) {
      throw new Error(`Unknown library contract option: ${argument}.`);
    }
    if (values.has(argument)) {
      throw new Error(`Duplicate library contract option: ${argument}.`);
    }
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`${argument} requires a value.`);
    }
    values.set(argument, value);
    index += 1;
  }
  const explicitDatabasePath = values.has("--database-path");
  const signalProbeReport = values.get("--signal-probe-report") ?? null;
  if (signalProbeReport && !explicitDatabasePath) {
    throw new Error(
      "--signal-probe-report requires an explicit disposable --database-path.",
    );
  }
  return {
    databasePath: values.get("--database-path") ?? DEFAULT_DATABASE_PATH,
    explicitDatabasePath,
    signalProbeReport,
  };
}

function validateSourcePath(inputPath: string): string {
  if (process.env.TURSO_DATABASE_URL?.trim()) {
    throw new Error(
      "Turso database selection is forbidden for the library contract check.",
    );
  }
  if (REMOTE_DATABASE_URL.test(inputPath)) {
    throw new Error("--database-path must identify an explicit local file.");
  }
  if (!path.isAbsolute(inputPath)) {
    throw new Error("--database-path must be absolute.");
  }
  if (!fs.existsSync(inputPath)) {
    throw new Error("--database-path does not exist.");
  }
  for (const familyPath of [inputPath, `${inputPath}-wal`, `${inputPath}-shm`]) {
    if (!fs.existsSync(familyPath)) continue;
    const lstat = fs.lstatSync(familyPath);
    if (lstat.isSymbolicLink()) {
      throw new Error("Library contract source family must not be a symlink.");
    }
    if (!lstat.isFile()) {
      throw new Error("Library contract source family must contain regular files.");
    }
  }
  if (inputPath.endsWith("-wal") || inputPath.endsWith("-shm")) {
    throw new Error("--database-path must identify the SQLite main file.");
  }
  return fs.realpathSync.native(inputPath);
}

function validateSignalReportPath(reportPath: string, sourcePath: string): string {
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
  if (canonicalParent !== parent) {
    throw new Error("--signal-probe-report must not traverse a symlink.");
  }
  const canonicalPath = path.join(canonicalParent, path.basename(reportPath));
  if (
    [sourcePath, `${sourcePath}-wal`, `${sourcePath}-shm`].includes(
      canonicalPath,
    )
  ) {
    throw new Error("--signal-probe-report must not alias the source catalog.");
  }
  return canonicalPath;
}

function createOwnedWorkspace(sourceBefore: CatalogSnapshot): OwnedWorkspace {
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), TEMP_PREFIX)),
  );
  return {
    tempRoot,
    databasePath: path.join(tempRoot, "library-contract.db"),
    sourceBefore,
    writer: null,
    reader: null,
    cleanupPromise: null,
  };
}

function cleanupWorkspace(workspace: OwnedWorkspace): Promise<void> {
  if (workspace.cleanupPromise) return workspace.cleanupPromise;
  workspace.cleanupPromise = Promise.resolve().then(() => {
    const cleanupErrors: unknown[] = [];
    for (const key of ["reader", "writer"] as const) {
      try {
        workspace[key]?.close();
      } catch (error) {
        cleanupErrors.push(error);
      } finally {
        workspace[key] = null;
      }
    }
    try {
      const canonicalTempRoot = fs.existsSync(workspace.tempRoot)
        ? fs.realpathSync.native(workspace.tempRoot)
        : workspace.tempRoot;
      const expectedParent = fs.realpathSync.native(os.tmpdir());
      if (
        path.dirname(canonicalTempRoot) !== expectedParent ||
        !path.basename(canonicalTempRoot).startsWith(TEMP_PREFIX)
      ) {
        throw new Error("Library contract cleanup refused an unmanaged root.");
      }
      fs.rmSync(canonicalTempRoot, { recursive: true, force: true });
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
        "Library contract workspace cleanup failed closed.",
      );
    }
  });
  return workspace.cleanupPromise;
}

async function withOwnedMigratedCopy<T>(
  sourcePath: string,
  signalProbeReport: string | null,
  run: (database: AuditReadClient) => Promise<T>,
): Promise<T> {
  const sourceBefore = snapshotCatalogFiles(sourcePath);
  const workspace = createOwnedWorkspace(sourceBefore);
  let signalCleanupStarted = false;
  const signalHandlers = new Map<NodeJS.Signals, () => void>();
  for (const [signal, exitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const) {
    const handler = () => {
      if (signalCleanupStarted) return;
      signalCleanupStarted = true;
      void cleanupWorkspace(workspace).then(
        () => process.exit(exitCode),
        () => process.exit(1),
      );
    };
    signalHandlers.set(signal, handler);
    process.once(signal, handler);
  }

  try {
    copyCheckpointedCatalogToDisposableCopy(
      sourcePath,
      workspace.databasePath,
      workspace.tempRoot,
      { expectedSourceSnapshot: workspace.sourceBefore },
    );

    workspace.writer = createClient({ url: `file:${workspace.databasePath}` });
    await migrateDatabase(workspace.writer);
    await workspace.writer.execute("PRAGMA wal_checkpoint(TRUNCATE)");
    const quickCheck = await workspace.writer.execute("PRAGMA quick_check");
    if (
      quickCheck.rows.length !== 1 ||
      String(quickCheck.rows[0]?.quick_check) !== "ok"
    ) {
      throw new Error("Library contract owned copy failed PRAGMA quick_check.");
    }
    const foreignKeys = await workspace.writer.execute("PRAGMA foreign_key_check");
    if (foreignKeys.rows.length > 0) {
      throw new Error(
        `Library contract owned copy has ${foreignKeys.rows.length} foreign-key violation(s).`,
      );
    }
    workspace.writer.close();
    workspace.writer = null;

    if (signalProbeReport) {
      fs.writeFileSync(
        signalProbeReport,
        JSON.stringify({
          tempRoot: workspace.tempRoot,
          databasePath: workspace.databasePath,
        }),
        { encoding: "utf8", flag: "wx", mode: 0o600 },
      );
      await new Promise<never>(() => {
        setInterval(() => undefined, 1_000);
      });
    }

    workspace.reader = openReadOnlyCatalog(workspace.databasePath, { env: {} });
    return await run(workspace.reader);
  } finally {
    try {
      await cleanupWorkspace(workspace);
    } finally {
      for (const [signal, handler] of signalHandlers) {
        process.off(signal, handler);
      }
    }
  }
}

async function scalar(db: AuditReadClient, sql: string): Promise<number> {
  const row = db.get<{ value: number | string | bigint | null }>(sql);
  return Number(row?.value ?? 0);
}

async function runLibraryContract(db: AuditReadClient): Promise<void> {
  const tableRows = db.all<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table'",
  );
  const tables = new Set(tableRows.map((row) => String(row.name)));
  const missingTables = REQUIRED_TABLES.filter((table) => !tables.has(table));

  if (missingTables.length > 0) {
    console.error(`Missing library tables: ${missingTables.join(", ")}`);
    throw new Error(`Missing library tables: ${missingTables.join(", ")}`);
  }

  const problems: string[] = [];
  const warnings: string[] = [];

  const badSources = await scalar(db, `
    SELECT COUNT(*) as value
    FROM source_registry
    WHERE source_type IS NULL OR allowed_use IS NULL OR reliability IS NULL
  `);
  if (badSources > 0) {
    problems.push(`${badSources} source_registry rows are missing policy fields.`);
  }

  const badSourceItems = await scalar(db, `
    SELECT COUNT(*) as value
    FROM source_items si
    LEFT JOIN source_registry sr ON sr.id = si.source_id
    WHERE sr.id IS NULL OR si.url IS NULL OR si.title IS NULL
  `);
  if (badSourceItems > 0) {
    problems.push(`${badSourceItems} source_items rows have broken source links or missing titles.`);
  }

  const badExternalIds = await scalar(db, `
    SELECT COUNT(*) as value
    FROM external_ids ex
    LEFT JOIN entities e ON e.id = ex.entity_id
    WHERE e.id IS NULL
      OR length(trim(ex.provider)) = 0
      OR length(trim(ex.external_id)) = 0
  `);
  if (badExternalIds > 0) {
    problems.push(`${badExternalIds} external_ids rows have broken entity links or empty identifiers.`);
  }

  const badAliases = await scalar(db, `
    SELECT COUNT(*) as value
    FROM entity_aliases ea
    LEFT JOIN entities e ON e.id = ea.entity_id
    WHERE e.id IS NULL OR length(trim(ea.alias)) = 0
  `);
  if (badAliases > 0) {
    problems.push(`${badAliases} entity_aliases rows have broken entity links or empty aliases.`);
  }

  const badStories = await scalar(db, `
    SELECT COUNT(*) as value
    FROM stories
    WHERE length(trim(body_md)) < 40
  `);
  if (badStories > 0) {
    problems.push(`${badStories} stories are too short to be useful.`);
  }

  const badDiagrams = await scalar(db, `
    SELECT COUNT(*) as value
    FROM diagrams
    WHERE svg NOT LIKE '<svg%' OR license IS NULL OR length(trim(title)) = 0
  `);
  if (badDiagrams > 0) {
    problems.push(`${badDiagrams} diagrams have invalid SVG, title, or license data.`);
  }

  const badMedia = await scalar(db, `
    SELECT COUNT(*) as value
    FROM media_assets
    WHERE length(trim(title)) = 0
      OR review_status NOT IN ('pending', 'approved', 'rejected', 'needs_license')
      OR usage_status NOT IN ('candidate', 'primary', 'gallery', 'hidden')
  `);
  if (badMedia > 0) {
    problems.push(`${badMedia} media_assets rows have invalid title or status data.`);
  }

  const badMediaLinks = await scalar(db, `
    SELECT COUNT(*) as value
    FROM media_assets ma
    LEFT JOIN source_items si ON si.id = ma.source_item_id
    WHERE (ma.source_item_id IS NOT NULL AND si.id IS NULL)
      OR (ma.asset_type = 'image' AND (
        ma.source_url IS NULL
        OR ma.source_item_id IS NULL
        OR (ma.image_url IS NULL AND ma.thumbnail_url IS NULL AND ma.local_path IS NULL)
      ))
  `);
  if (badMediaLinks > 0) {
    problems.push(`${badMediaLinks} media_assets rows have broken source links or missing image metadata.`);
  }

  const badCommunitySummaries = await scalar(db, `
    SELECT COUNT(*) as value
    FROM community_summaries cs
    LEFT JOIN entities e ON e.id = cs.entity_id
    LEFT JOIN source_registry sr ON sr.id = cs.source_id
    WHERE e.id IS NULL
      OR sr.id IS NULL
      OR length(trim(cs.summary_md)) < 40
      OR cs.status NOT IN ('draft', 'reviewed', 'published', 'deprecated')
  `);
  if (badCommunitySummaries > 0) {
    problems.push(
      `${badCommunitySummaries} community_summaries rows have invalid links, status, or summary text.`,
    );
  }

  const badExhibitSections = await scalar(db, `
    SELECT COUNT(*) as value
    FROM exhibit_sections es
    LEFT JOIN exhibits e ON e.id = es.exhibit_id
    WHERE e.id IS NULL OR length(trim(es.body_md)) < 40
  `);
  if (badExhibitSections > 0) {
    problems.push(`${badExhibitSections} exhibit sections are missing exhibit links or useful body text.`);
  }

  const pendingWithoutSource = await scalar(db, `
    SELECT COUNT(*) as value
    FROM claims
    WHERE review_status IN ('approved', 'pending') AND source_item_id IS NULL
  `);
  if (pendingWithoutSource > 0) {
    problems.push(`${pendingWithoutSource} claims have no source_item_id.`);
  }

  const badClaimLinks = await scalar(db, `
    SELECT COUNT(*) as value
    FROM claims c
    LEFT JOIN entities se ON se.id = c.subject_entity_id
    LEFT JOIN source_items si ON si.id = c.source_item_id
    WHERE se.id IS NULL
      OR (c.source_item_id IS NOT NULL AND si.id IS NULL)
      OR length(trim(c.predicate)) = 0
      OR (c.object_text IS NOT NULL AND length(trim(c.object_text)) = 0)
  `);
  if (badClaimLinks > 0) {
    problems.push(`${badClaimLinks} claims have broken links or empty fields.`);
  }

  const badCitations = await scalar(db, `
    SELECT COUNT(*) as value
    FROM citations c
    LEFT JOIN source_items si ON si.id = c.source_item_id
    LEFT JOIN claims cl ON cl.id = c.claim_id
    WHERE (c.source_item_id IS NOT NULL AND si.id IS NULL)
      OR (c.claim_id IS NOT NULL AND cl.id IS NULL)
      OR (c.target_type = 'entity' AND NOT EXISTS (
        SELECT 1 FROM entities e WHERE e.id = c.target_id
      ))
      OR (c.target_type = 'story' AND NOT EXISTS (
        SELECT 1 FROM stories s WHERE s.id = c.target_id
      ))
      OR (c.target_type = 'timeline_event' AND NOT EXISTS (
        SELECT 1 FROM timeline_events te WHERE te.id = c.target_id
      ))
      OR (c.target_type = 'diagram' AND NOT EXISTS (
        SELECT 1 FROM diagrams d WHERE d.id = c.target_id
      ))
      OR (c.target_type = 'model_spec' AND NOT EXISTS (
        SELECT 1 FROM model_specs ms WHERE ms.id = c.target_id
      ))
      OR (c.target_type = 'exhibit' AND NOT EXISTS (
        SELECT 1 FROM exhibits ex WHERE ex.id = c.target_id
      ))
      OR (c.target_type = 'claim' AND NOT EXISTS (
        SELECT 1 FROM claims tc WHERE tc.id = c.target_id
      ))
  `);
  if (badCitations > 0) {
    problems.push(`${badCitations} citations have broken targets, claims, or source links.`);
  }

  const counts = {
    sources: await scalar(db, "SELECT COUNT(*) as value FROM source_registry"),
    sourceItems: await scalar(db, "SELECT COUNT(*) as value FROM source_items"),
    claims: await scalar(db, "SELECT COUNT(*) as value FROM claims"),
    citations: await scalar(db, "SELECT COUNT(*) as value FROM citations"),
    stories: await scalar(db, "SELECT COUNT(*) as value FROM stories"),
    events: await scalar(db, "SELECT COUNT(*) as value FROM timeline_events"),
    diagrams: await scalar(db, "SELECT COUNT(*) as value FROM diagrams"),
    media: await scalar(db, "SELECT COUNT(*) as value FROM media_assets"),
    community: await scalar(
      db,
      "SELECT COUNT(*) as value FROM community_summaries",
    ),
    exhibits: await scalar(db, "SELECT COUNT(*) as value FROM exhibits"),
    externalIds: await scalar(db, "SELECT COUNT(*) as value FROM external_ids"),
    aliases: await scalar(db, "SELECT COUNT(*) as value FROM entity_aliases"),
    commonsMedia: await scalar(db, `
      SELECT COUNT(*) as value
      FROM media_assets ma
      JOIN source_items si ON si.id = ma.source_item_id
      WHERE si.source_id = 'wikimedia-commons' AND ma.asset_type = 'image'
    `),
  };

  if (counts.sources < 9) warnings.push("source_registry has fewer than 9 sources.");
  if (counts.claims < 10) warnings.push("claims has fewer than 10 seed facts.");
  if (counts.citations < 15) warnings.push("citations has fewer than 15 source bindings.");
  if (counts.diagrams < 5) warnings.push("diagrams has fewer than 5 starter diagrams.");
  if (counts.media < 2) warnings.push("media_assets has fewer than 2 media candidates.");
  if (counts.community < 2) {
    warnings.push("community_summaries has fewer than 2 community summaries.");
  }
  if (counts.exhibits < 3) warnings.push("exhibits has fewer than 3 draft exhibits.");
  if (counts.externalIds < 5) {
    warnings.push("external_ids has fewer than 5 Wikidata brand IDs.");
  }
  if (counts.aliases < 20) {
    warnings.push("entity_aliases has fewer than 20 aliases.");
  }
  if (counts.commonsMedia < 1) {
    warnings.push("No file-level Wikimedia Commons media candidates imported yet.");
  }

  console.log("Library contract counts:");
  for (const [key, value] of Object.entries(counts)) {
    console.log(`  ${key}: ${value}`);
  }

  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }

  if (problems.length > 0) {
    throw new Error(problems.map((problem) => `Problem: ${problem}`).join("\n"));
  }

  console.log("Library contract OK");
}

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));
  const sourcePath = validateSourcePath(options.databasePath);
  const signalProbeReport = options.signalProbeReport
    ? validateSignalReportPath(options.signalProbeReport, sourcePath)
    : null;
  if (
    signalProbeReport &&
    sourcePath === fs.realpathSync.native(DEFAULT_DATABASE_PATH)
  ) {
    throw new Error(
      "--signal-probe-report refuses the real data/fpkg.db source.",
    );
  }
  await withOwnedMigratedCopy(sourcePath, signalProbeReport, runLibraryContract);
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
