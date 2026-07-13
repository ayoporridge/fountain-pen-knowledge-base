import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  type Client,
  createClient,
  type InArgs,
  type InStatement,
  type ResultSet,
  type Transaction,
} from "@libsql/client";

// Local SQLite file path (for local dev)
const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");
const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

let _client: Client | null = null;

const REMOTE_READ_RETRY_DELAYS_MS = [150, 500] as const;
const TRANSIENT_DATABASE_CODES = new Set([
  "NETWORK_ERROR",
  "HRANA_WEBSOCKET_ERROR",
]);
const TRANSIENT_DATABASE_STATUSES = new Set([429, 500, 502, 503, 504]);

export function isTransientDatabaseError(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current = error;

  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const details = current as {
      cause?: unknown;
      code?: unknown;
      status?: unknown;
    };
    const code = String(details.code || "").toUpperCase();
    const status = Number(details.status);
    if (
      TRANSIENT_DATABASE_CODES.has(code) ||
      TRANSIENT_DATABASE_STATUSES.has(status)
    ) {
      return true;
    }
    current = details.cause;
  }

  return false;
}

export async function retryTransientDatabaseRead<T>(
  operation: () => Promise<T>,
  retryDelays: readonly number[] = process.env.TURSO_DATABASE_URL
    ? REMOTE_READ_RETRY_DELAYS_MS
    : [],
): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const delay = retryDelays[attempt];
      if (delay === undefined || !isTransientDatabaseError(error)) throw error;
      const jitter = delay > 0 ? Math.floor(Math.random() * 75) : 0;
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }
}

export function createReadinessGuard(
  check: () => Promise<void>,
): () => Promise<void> {
  let pending: Promise<void> | null = null;
  return () => {
    if (!pending) {
      pending = check().catch((error) => {
        pending = null;
        throw error;
      });
    }
    return pending;
  };
}

/**
 * Get or create a database client.
 * - In production (TURSO_URL set): connects to Turso cloud
 * - In development: uses local SQLite file
 *
 * Schema migrations are intentionally not run here. Build workers and serverless
 * functions may initialize this module concurrently, so database writes belong
 * in the explicit `pnpm migrate` / `pnpm migrate:remote` deployment step.
 */
export function getDb(): Client {
  if (_client) return _client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url) {
    // Production: connect to Turso
    _client = createClient({ url, authToken, concurrency: 4 });
  } else {
    // Development: use local file
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    _client = createClient({ url: `file:${DB_PATH}` });
  }

  return _client;
}

export interface MigrationResult {
  applied: string[];
  skipped: string[];
}

interface MigrationOptions {
  migrationsDir?: string;
}

function migrationFiles(migrationsDir = MIGRATIONS_DIR): string[] {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
}

/**
 * Some historical migration files contain their own outer transaction. Each
 * file is now executed inside a libSQL write transaction so its SQL and its
 * migration marker commit atomically. Trigger-body `BEGIN` / `END` statements
 * are not affected because they do not use the standalone `BEGIN;` form.
 */
function removeOuterTransaction(sql: string): string {
  return sql.replace(/^\s*BEGIN;\s*$/gim, "").replace(/^\s*COMMIT;\s*$/gim, "");
}

function migrationChecksum(sql: string): string {
  return createHash("sha256").update(sql).digest("hex");
}

async function rollbackQuietly(transaction: Transaction): Promise<void> {
  if (transaction.closed) return;
  try {
    await transaction.rollback();
  } catch {
    // Preserve the migration error that caused the rollback.
  }
}

/**
 * Apply all pending migrations, in filename order.
 *
 * The pending check is performed after acquiring the write transaction. This
 * makes concurrent invocations safe: a second process observes the marker
 * written by the first instead of executing the same migration again.
 */
export async function migrateDatabase(
  db: Client,
  options: MigrationOptions = {},
): Promise<MigrationResult> {
  const migrationsDir = options.migrationsDir ?? MIGRATIONS_DIR;
  const files = migrationFiles(migrationsDir);
  const result: MigrationResult = { applied: [], skipped: [] };

  await db.execute("PRAGMA foreign_keys = ON");
  await db.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now')),
      checksum TEXT
    );
  `);
  const migrationColumns = await db.execute("PRAGMA table_info(migrations)");
  if (!migrationColumns.rows.some((row) => String(row.name) === "checksum")) {
    await db.execute("ALTER TABLE migrations ADD COLUMN checksum TEXT");
  }

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const checksum = migrationChecksum(sql);
    const transaction = await db.transaction("write");

    try {
      const existing = await transaction.execute({
        sql: "SELECT checksum FROM migrations WHERE name = ? LIMIT 1",
        args: [file],
      });

      if (existing.rows.length > 0) {
        const recordedChecksum = existing.rows[0]?.checksum;
        if (recordedChecksum && String(recordedChecksum) !== checksum) {
          throw new Error(
            `Applied migration checksum mismatch: ${file}. Restore the applied SQL instead of rewriting history.`,
          );
        }
        if (!recordedChecksum) {
          await transaction.execute({
            sql: "UPDATE migrations SET checksum = ? WHERE name = ?",
            args: [checksum, file],
          });
        }
        await transaction.commit();
        result.skipped.push(file);
        continue;
      }

      await transaction.executeMultiple(removeOuterTransaction(sql));
      await transaction.execute({
        sql: "INSERT INTO migrations (name, applied_at, checksum) VALUES (?, datetime('now'), ?)",
        args: [file, checksum],
      });
      await transaction.commit();
      result.applied.push(file);
    } catch (error) {
      await rollbackQuietly(transaction);
      throw new Error(`Migration failed: ${file}`, { cause: error });
    }
  }

  return result;
}

/**
 * Read-only startup guard. It never repairs the database: a missing or pending
 * migration fails the request/build with an actionable error instead.
 */
export async function assertDatabaseReady(
  db: Client,
  options: MigrationOptions = {},
): Promise<void> {
  const files = migrationFiles(options.migrationsDir ?? MIGRATIONS_DIR);

  await db.execute("PRAGMA foreign_keys = ON");

  let appliedRows: ResultSet;
  try {
    appliedRows = await db.execute("SELECT name, checksum FROM migrations");
  } catch (error) {
    if (isTransientDatabaseError(error)) throw error;
    throw new Error(
      "Database schema is not initialized. Run `pnpm migrate` locally or `pnpm migrate:remote` before building/starting the app.",
      { cause: error },
    );
  }

  const applied = new Map(
    appliedRows.rows.map((row) => [String(row.name), row.checksum]),
  );
  const pending = files.filter((file) => !applied.has(file));

  if (pending.length > 0) {
    throw new Error(
      `Database schema is out of date (${pending.length} pending: ${pending.join(", ")}). Run \`pnpm migrate\` locally or \`pnpm migrate:remote\` before building/starting the app.`,
    );
  }

  const changed = files.filter((file) => {
    const recordedChecksum = applied.get(file);
    if (!recordedChecksum) return false;
    const sql = fs.readFileSync(
      path.join(options.migrationsDir ?? MIGRATIONS_DIR, file),
      "utf8",
    );
    return String(recordedChecksum) !== migrationChecksum(sql);
  });
  if (changed.length > 0) {
    throw new Error(
      `Applied migration files changed (${changed.join(", ")}). Restore the applied SQL instead of rewriting history.`,
    );
  }
}

const databaseReady = createReadinessGuard(() =>
  retryTransientDatabaseRead(() => assertDatabaseReady(getDb())),
);

interface QueuedRead {
  statement: InStatement;
  resolve: (rows: unknown[]) => void;
  reject: (error: unknown) => void;
}

let queuedReads: QueuedRead[] = [];
let readFlushScheduled = false;

async function flushQueuedReads(): Promise<void> {
  readFlushScheduled = false;
  const pending = queuedReads;
  queuedReads = [];
  if (pending.length === 0) return;

  try {
    const db = getDb();
    if (pending.length === 1) {
      const result = await retryTransientDatabaseRead(() =>
        db.execute(pending[0].statement),
      );
      pending[0].resolve(result.rows as unknown[]);
      return;
    }

    const results = await retryTransientDatabaseRead(() =>
      db.batch(
        pending.map((item) => item.statement),
        "read",
      ),
    );
    pending.forEach((item, index) => {
      item.resolve((results[index]?.rows || []) as unknown[]);
    });
  } catch (error) {
    for (const item of pending) item.reject(error);
  }
}

function enqueueRead(sql: string, args: unknown[]): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    queuedReads.push({
      statement: { sql, args: args as InArgs },
      resolve,
      reject,
    });
    if (readFlushScheduled) return;
    readFlushScheduled = true;
    queueMicrotask(() => void flushQueuedReads());
  });
}

/**
 * Compatibility wrapper: mimics better-sqlite3's db.prepare().all() / .run() API
 * Usage: const rows = queryAll("SELECT * FROM entities WHERE type = ?", [type])
 */
export async function queryAll(
  sql: string,
  args: unknown[] = [],
): Promise<unknown[]> {
  await databaseReady();
  return enqueueRead(sql, args);
}

export async function queryOne(
  sql: string,
  args: unknown[] = [],
): Promise<unknown | undefined> {
  const rows = await queryAll(sql, args);
  return rows[0];
}

export async function execute(
  sql: string,
  args: unknown[] = [],
): Promise<void> {
  await databaseReady();
  const db = getDb();
  await db.execute({ sql, args: args as InArgs });
}

export async function execBatch(sqls: string[]): Promise<void> {
  await databaseReady();
  const db = getDb();
  for (const sql of sqls) {
    await db.execute(sql);
  }
}
