import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { migrateDatabase } from "../src/lib/db";

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

async function main(): Promise<void> {
  const remote = process.argv.includes("--remote");
  if (remote) loadLocalEnv();
  const localDatabasePath = path.join(process.cwd(), "data", "fpkg.db");
  const databaseUrl = remote
    ? process.env.TURSO_DATABASE_URL
    : `file:${localDatabasePath}`;

  if (!databaseUrl) {
    throw new Error(
      "TURSO_DATABASE_URL is required. Set it in the environment or .env.local before running `pnpm migrate:remote`.",
    );
  }

  if (remote && !process.env.TURSO_AUTH_TOKEN) {
    throw new Error(
      "TURSO_AUTH_TOKEN is required before running `pnpm migrate:remote`.",
    );
  }

  if (!remote) {
    fs.mkdirSync(path.dirname(localDatabasePath), { recursive: true });
  }

  const client = createClient({
    url: databaseUrl,
    authToken: remote ? process.env.TURSO_AUTH_TOKEN : undefined,
  });

  try {
    const result = await migrateDatabase(client);
    const target = remote ? "remote Turso" : "local SQLite";

    console.log(`Migration target: ${target}`);
    console.log(`Applied: ${result.applied.length}`);
    for (const file of result.applied) console.log(`  + ${file}`);
    console.log(`Already applied: ${result.skipped.length}`);
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
