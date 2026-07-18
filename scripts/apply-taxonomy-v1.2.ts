import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client } from "@libsql/client";
import {
  applyTaxonomyPlan,
  resolveTaxonomyPlan,
} from "../src/lib/taxonomy/apply-taxonomy";
import { migrateDatabase } from "../src/lib/db";
import { loadTaxonomyPlan } from "../src/lib/taxonomy/identity-plan";

const MARKER_SUFFIX = ".taxonomy-owned-copy.json";
const PROTECTED_CATALOG = path.resolve(process.cwd(), "data", "fpkg.db");

interface CliOptions {
  database: string;
  manifest: string;
  apply: boolean;
  ackOwnedCopy: boolean;
}

interface OwnedCopyIdentity {
  databasePath: string;
  device: string;
  inode: string;
}

function takeValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires one explicit value.`);
  }
  return value;
}

function parseArgs(args: string[]): CliOptions {
  let database: string | null = null;
  let manifest: string | null = null;
  let apply = false;
  let ackOwnedCopy = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--database") {
      if (database) throw new Error("--database may be supplied only once.");
      database = takeValue(args, index, arg);
      index += 1;
    } else if (arg === "--manifest") {
      if (manifest) throw new Error("--manifest may be supplied only once.");
      manifest = takeValue(args, index, arg);
      index += 1;
    } else if (arg === "--apply") {
      apply = true;
    } else if (arg === "--ack-owned-copy") {
      ackOwnedCopy = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!database || !manifest) {
    throw new Error("Both --database and --manifest are required.");
  }
  if (apply && !ackOwnedCopy) {
    throw new Error("--apply requires explicit --ack-owned-copy.");
  }
  if (!apply && ackOwnedCopy) {
    throw new Error("--ack-owned-copy is valid only together with --apply.");
  }
  return { database, manifest, apply, ackOwnedCopy };
}

function rejectInheritedDatabaseAuthority(): void {
  if (
    process.env.TURSO_DATABASE_URL?.trim() ||
    process.env.TURSO_AUTH_TOKEN?.trim() ||
    process.env.FPKG_DATABASE_URL?.trim()
  ) {
    throw new Error(
      "Remote or inherited database credentials are forbidden for taxonomy apply.",
    );
  }
}

function localPath(value: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    if (!value.startsWith("file:")) {
      throw new Error("Taxonomy apply accepts only a local owned-copy database.");
    }
    if (/[?#]/.test(value)) {
      throw new Error("Local file URLs may not contain query or fragment data.");
    }
    return fileURLToPath(new URL(value));
  }
  if (!path.isAbsolute(value)) {
    throw new Error("--database must be an absolute local path or file URL.");
  }
  return value;
}

function regularSingleLink(filePath: string, label: string): fs.Stats {
  const stats = fs.lstatSync(filePath);
  if (
    !stats.isFile() ||
    stats.isSymbolicLink() ||
    stats.nlink !== 1 ||
    fs.realpathSync.native(filePath) !== path.resolve(filePath)
  ) {
    throw new Error(`${label} must be one canonical regular single-link file.`);
  }
  return stats;
}

function validateOwnedCopy(databaseInput: string): OwnedCopyIdentity {
  const resolved = path.resolve(localPath(databaseInput));
  const parent = path.dirname(resolved);
  const parentStats = fs.lstatSync(parent);
  if (
    !parentStats.isDirectory() ||
    parentStats.isSymbolicLink() ||
    fs.realpathSync.native(parent) !== parent
  ) {
    throw new Error("Owned-copy parent must be one canonical local directory.");
  }
  const stats = regularSingleLink(resolved, "Owned-copy database");
  if (
    fs.existsSync(PROTECTED_CATALOG) &&
    fs.realpathSync.native(resolved) ===
      fs.realpathSync.native(PROTECTED_CATALOG)
  ) {
    throw new Error("The protected catalog is never a taxonomy apply target.");
  }

  const markerPath = `${resolved}${MARKER_SUFFIX}`;
  regularSingleLink(markerPath, "Owned-copy marker");
  const raw = JSON.parse(fs.readFileSync(markerPath, "utf8")) as Record<
    string,
    unknown
  >;
  if (
    raw.schemaVersion !== 1 ||
    (raw.kind !== "taxonomy-fixture" && raw.kind !== "checkpoint-copy") ||
    raw.databasePath !== resolved ||
    raw.device !== String(stats.dev) ||
    raw.inode !== String(stats.ino)
  ) {
    throw new Error("Owned-copy marker does not match the database identity.");
  }
  return {
    databasePath: resolved,
    device: String(stats.dev),
    inode: String(stats.ino),
  };
}

function revalidateOwnedCopy(identity: OwnedCopyIdentity): void {
  const stats = regularSingleLink(identity.databasePath, "Owned-copy database");
  if (
    String(stats.dev) !== identity.device ||
    String(stats.ino) !== identity.inode
  ) {
    throw new Error("Owned-copy database identity changed during preflight.");
  }
}

function loadManifest(manifestInput: string) {
  const manifestPath = path.resolve(manifestInput);
  regularSingleLink(manifestPath, "Taxonomy manifest");
  return loadTaxonomyPlan(JSON.parse(fs.readFileSync(manifestPath, "utf8")));
}

export async function runTaxonomyApplyCli(
  argv: string[] = process.argv.slice(2),
): Promise<void> {
  const options = parseArgs(argv);
  rejectInheritedDatabaseAuthority();
  const identity = validateOwnedCopy(options.database);
  const plan = loadManifest(options.manifest);
  let client: Client | null = null;
  try {
    client = createClient({ url: `file:${identity.databasePath}` });
    await migrateDatabase(client);
    revalidateOwnedCopy(identity);
    const resolved = await resolveTaxonomyPlan(client, plan);
    if (resolved.blockers.length > 0) {
      throw new Error(
        `Taxonomy preflight returned ${resolved.blockers.length} blocker(s): ${resolved.blockers
          .map((item) => item.code)
          .join(", ")}`,
      );
    }
    if (!options.apply) {
      process.stdout.write(
        `${JSON.stringify({
          mode: "dry-run",
          sourceRowCount: resolved.sourceRowCount,
          actionCount: resolved.actions.length,
          delegatedCount: resolved.delegated.length,
        })}\n`,
      );
      return;
    }
    revalidateOwnedCopy(identity);
    const result = await applyTaxonomyPlan(client, resolved);
    process.stdout.write(
      `${JSON.stringify({
        mode: "apply",
        replay: result.replay,
        batchId: result.batchId,
        sourceChecksum: result.sourceChecksum,
        actionCounts: result.actionCounts,
      })}\n`,
    );
  } finally {
    client?.close();
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  runTaxonomyApplyCli().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Taxonomy apply failed: ${message}\n`);
    process.exitCode = 1;
  });
}

