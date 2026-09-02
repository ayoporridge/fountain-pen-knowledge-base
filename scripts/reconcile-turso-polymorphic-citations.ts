import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { createClient, type Client, type InArgs } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";

/**
 * Reconcile citations.target_id for the polymorphic model_spec target type.
 *
 * The ordinary foreign-key mapper cannot transform citations.target_id because
 * that column is intentionally polymorphic. This command derives the exact
 * local-spec -> remote-spec map from the stable model_specs.entity_id key and
 * issues guarded primary-key updates only where the old local id remains.
 */

const EXPECTED_SOURCE_SHA256 =
  "00ddd2dc6e1a9bde275920eed3d0d82e251be1e7d8b48bb1e27b6619e080d4c4";
const EXPECTED_PROTECTED_SHA256 = EXPECTED_SOURCE_SHA256;
const DEFAULT_BATCH_SIZE = 10;
const CITATION_UPDATE_TRIGGER_NAMES = [
  "publication_citation_update_old",
  "publication_citation_update_new",
] as const;
const PUBLICATION_HOLD_BATCH_SIZE = 25;

type CliOptions = {
  sourcePath: string;
  sourceRoot: string;
  protectedCatalogPath: string;
  reportPath?: string;
  writeLimit?: number;
  batchSize: number;
  apply: boolean;
  acknowledgeRemoteWrite: boolean;
};

type SpecRow = { id: string; entity_id: string };
type CitationRow = { id: string; target_id: string };

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
      "Usage: tsx scripts/reconcile-turso-polymorphic-citations.ts --source <owned-copy> --owned-root <source-root> --protected-catalog <data/fpkg.db> [--batch-size <n>] [--limit <n>] [--report <json>] [--apply --ack-remote-write]",
    );
  }
  const rawBatchSize = cliValue("--batch-size");
  const batchSize = rawBatchSize === undefined ? DEFAULT_BATCH_SIZE : Number(rawBatchSize);
  if (!Number.isSafeInteger(batchSize) || batchSize < 1) {
    throw new Error("--batch-size must be a positive integer.");
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
    batchSize,
    apply: process.argv.includes("--apply"),
    acknowledgeRemoteWrite: process.argv.includes("--ack-remote-write"),
  };
}

function isWithin(root: string, target: string): boolean {
  return target === root || target.startsWith(`${root}${path.sep}`);
}

function writeReport(reportPath: string | undefined, report: unknown): void {
  if (!reportPath) return;
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

async function applyUpdates(
  client: Client,
  updates: Array<{ citationId: string; oldTargetId: string; newTargetId: string }>,
  affectedEntityIds: string[],
  batchSize: number,
): Promise<number> {
  const triggerSql = new Map<string, string>();
  for (const triggerName of CITATION_UPDATE_TRIGGER_NAMES) {
    const rows = await client.execute({
      sql: "SELECT sql FROM sqlite_master WHERE type='trigger' AND name=?",
      args: [triggerName],
    });
    const sql = String(rows.rows[0]?.sql ?? "").trim();
    if (!sql.includes("publication_invalidation_citation_entities")) {
      throw new Error(`Citation update trigger missing or unexpected: ${triggerName}`);
    }
    triggerSql.set(triggerName, sql);
  }
  // Move affected publications out of published before suppressing the
  // citation invalidation triggers. This records one content-revision change
  // per entity and makes a partial retry fail closed rather than silently
  // leaving an old published snapshot.
  for (let offset = 0; offset < affectedEntityIds.length; offset += PUBLICATION_HOLD_BATCH_SIZE) {
    const chunk = affectedEntityIds.slice(offset, offset + PUBLICATION_HOLD_BATCH_SIZE);
    await client.batch(
      chunk.map((entityId) => ({
        sql: `UPDATE entity_publications
             SET status='in_review', published_at=NULL,
                 content_revision=content_revision+1,
                 updated_at=datetime('now')
             WHERE entity_id=? AND status='published'`,
        args: [entityId] as InArgs,
      })),
      "write",
    );
  }
  await client.batch(
    CITATION_UPDATE_TRIGGER_NAMES.map((triggerName) => ({
      sql: `DROP TRIGGER IF EXISTS ${triggerName}`,
      args: [],
    })),
    "write",
  );
  let updated = 0;
  try {
    for (let offset = 0; offset < updates.length; offset += batchSize) {
      const chunk = updates.slice(offset, offset + batchSize);
      await client.batch(
        chunk.map((update) => ({
          sql: `UPDATE citations
               SET target_id = ?
               WHERE id = ?
                 AND target_type = 'model_spec'
                 AND target_id = ?`,
          args: [update.newTargetId, update.citationId, update.oldTargetId] as InArgs,
        })),
        "write",
      );
      updated += chunk.length;
      console.log(
        `  polymorphic citation progress: ${Math.min(offset + chunk.length, updates.length)}/${updates.length}`,
      );
    }
  } finally {
    await client.batch(
      CITATION_UPDATE_TRIGGER_NAMES.map((triggerName) => ({
        sql: triggerSql.get(triggerName) as string,
        args: [],
      })),
      "write",
    );
  }
  return updated;
}

async function main(): Promise<void> {
  loadLocalEnv();
  const options = parseOptions();
  const sourceRoot = fs.realpathSync(options.sourceRoot);
  const sourcePath = fs.realpathSync(options.sourcePath);
  const protectedPath = fs.realpathSync(options.protectedCatalogPath);
  if (!isWithin(sourceRoot, sourcePath)) {
    throw new Error("--source must remain inside --owned-root.");
  }
  if (fs.lstatSync(options.sourcePath).isSymbolicLink()) {
    throw new Error("--source must not be a symlink.");
  }
  if (!fs.statSync(sourcePath).isFile()) {
    throw new Error("--source must be a regular file.");
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

  const database = new Database(sourcePath, { readonly: true });
  const localSpecs = database
    .prepare("SELECT id, entity_id FROM model_specs ORDER BY id")
    .all() as SpecRow[];
  const remoteUrl = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!remoteUrl || !authToken) {
    database.close();
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required in .env.local or the environment.");
  }
  const client = createClient({ url: remoteUrl, authToken });
  try {
    const remoteSpecs = (await client.execute(
      "SELECT id, entity_id FROM model_specs ORDER BY id",
    )).rows as unknown as SpecRow[];
    const remoteByEntity = new Map(remoteSpecs.map((row) => [row.entity_id, row]));
    const remoteSpecIds = new Set(remoteSpecs.map((row) => row.id));
    const localToRemote = new Map<string, string>();
    for (const localSpec of localSpecs) {
      const remoteSpec = remoteByEntity.get(localSpec.entity_id);
      if (!remoteSpec) {
        throw new Error(`Remote model_spec missing for entity ${localSpec.entity_id}`);
      }
      localToRemote.set(localSpec.id, remoteSpec.id);
    }

    const citations = (await client.execute(
      "SELECT id, target_id FROM citations WHERE target_type='model_spec' ORDER BY id",
    )).rows as unknown as CitationRow[];
    const updates = citations.flatMap((citation) => {
      const newTargetId = localToRemote.get(citation.target_id);
      if (!newTargetId || newTargetId === citation.target_id) return [];
      return [
        {
          citationId: citation.id,
          oldTargetId: citation.target_id,
          newTargetId,
        },
      ];
    });
    const updatesToApply =
      options.writeLimit === undefined
        ? updates
        : updates.slice(0, options.writeLimit);
    const remoteEntityBySpecId = new Map(remoteSpecs.map((row) => [row.id, row.entity_id]));
    const affectedEntityIds = [
      ...new Set(
        updatesToApply
          .map((update) => localToRemote.get(update.oldTargetId))
          .map((remoteSpecId) => (remoteSpecId ? remoteEntityBySpecId.get(remoteSpecId) : undefined))
          .filter((entityId): entityId is string => Boolean(entityId)),
      ),
    ];
    const unmappedLocalTargets = [
      ...new Set(
        citations
          .map((citation) => citation.target_id)
          .filter((targetId) => !localToRemote.has(targetId) && !remoteSpecIds.has(targetId)),
      ),
    ];
    if (unmappedLocalTargets.length > 0) {
      throw new Error(
        `Model-spec citation target(s) do not resolve locally or remotely: ${unmappedLocalTargets.slice(0, 5).join(", ")}`,
      );
    }
    const report: Record<string, unknown> = {
      checkedAt: new Date().toISOString(),
      mode: options.apply && options.acknowledgeRemoteWrite ? "apply" : "dry-run",
      sourcePath,
      sourceSha256: sourceSnapshot.main.sha256,
      protectedCatalogPath: protectedPath,
      protectedSha256Before: protectedSnapshot.main.sha256,
      localModelSpecCount: localSpecs.length,
      remoteModelSpecCount: remoteSpecs.length,
      modelSpecEntityMappings: localToRemote.size,
      modelSpecCitationsChecked: citations.length,
      staleCitationCount: updates.length,
      writeLimit: options.writeLimit ?? null,
      affectedEntityCount: affectedEntityIds.length,
      staleCitationSamples: updates.slice(0, 12),
      batchSize: options.batchSize,
    };
    console.log(`Model-spec entity mappings: ${localToRemote.size}`);
    console.log(`Model-spec citations checked: ${citations.length}`);
    console.log(`Stale polymorphic citation targets: ${updates.length}`);
    if (!options.apply) {
      writeReport(options.reportPath, report);
      console.log("Dry-run only. No remote citation writes were performed.");
      return;
    }
    if (!options.acknowledgeRemoteWrite) {
      throw new Error("Remote citation writes require both --apply and --ack-remote-write.");
    }
    const updated = await applyUpdates(
      client,
      updatesToApply,
      affectedEntityIds,
      options.batchSize,
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    report.updatedCitationCount = updated;
    report.protectedSha256After = snapshotCatalogFiles(protectedPath).main.sha256;
    writeReport(options.reportPath, report);
    console.log(`Polymorphic citation targets updated: ${updated}`);
    console.log("Protected local catalog snapshot unchanged.");
  } finally {
    client.close();
    database.close();
  }
}

if (process.argv.some((argument) => argument.endsWith("reconcile-turso-polymorphic-citations.ts"))) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
