import { createClient, type Client } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

// Local SQLite file path (for local dev)
const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");
const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

let _client: Client | null = null;

/**
 * Get or create a database client.
 * - In production (TURSO_URL set): connects to Turso cloud
 * - In development: uses local SQLite file
 */
export function getDb(): Client {
  if (_client) return _client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url) {
    // Production: connect to Turso
    _client = createClient({ url, authToken });
  } else {
    // Development: use local file
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    _client = createClient({ url: `file:${DB_PATH}` });
  }

  // Enable foreign keys
  _client.execute("PRAGMA foreign_keys = ON");

  runMigrations(_client);

  return _client;
}

/**
 * Compatibility wrapper: mimics better-sqlite3's db.prepare().all() / .run() API
 * Usage: const rows = queryAll("SELECT * FROM entities WHERE type = ?", [type])
 */
export async function queryAll(sql: string, args: unknown[] = []): Promise<unknown[]> {
  const db = getDb();
  const result = await db.execute({ sql, args: args as any[] });
  return result.rows;
}

export async function queryOne(sql: string, args: unknown[] = []): Promise<unknown | undefined> {
  const rows = await queryAll(sql, args);
  return rows[0];
}

export async function execute(sql: string, args: unknown[] = []): Promise<void> {
  const db = getDb();
  await db.execute({ sql, args: args as any[] });
}

export async function execBatch(sqls: string[]): Promise<void> {
  const db = getDb();
  for (const sql of sqls) {
    await db.execute(sql);
  }
}

function runMigrations(db: Client): void {
  // Create migrations table
  db.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `).catch(() => {});

  // Get applied migrations and run new ones
  (async () => {
    try {
      const result = await db.execute("SELECT name FROM migrations");
      const applied = new Set(result.rows.map((row) => row.name as string));

      if (!fs.existsSync(MIGRATIONS_DIR)) return;

      const files = fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((f) => f.endsWith(".sql"))
        .sort();

      for (const file of files) {
        if (applied.has(file)) continue;

        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
        await db.executeMultiple(sql);
        await db.execute({
          sql: "INSERT INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
          args: [file],
        });
        console.log(`Applied migration: ${file}`);
      }
    } catch (err) {
      console.error("Migration error:", err);
    }
  })();
}
