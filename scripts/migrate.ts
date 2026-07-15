import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import {
  migrateDatabase,
  resolveDatabaseConnection,
} from "../src/lib/db";

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

  const connection = remote
    ? resolveDatabaseConnection(process.env)
    : resolveDatabaseConnection({
        ...process.env,
        TURSO_DATABASE_URL: undefined,
        TURSO_AUTH_TOKEN: undefined,
      });

  if (remote && !process.env.TURSO_DATABASE_URL) {
    throw new Error(
      "TURSO_DATABASE_URL is required. Set it in the environment or .env.local before running `pnpm migrate:remote`.",
    );
  }

  if (remote && !connection.authToken) {
    throw new Error(
      "TURSO_AUTH_TOKEN is required before running `pnpm migrate:remote`.",
    );
  }

  if (!remote && connection.localPath) {
    fs.mkdirSync(path.dirname(connection.localPath), { recursive: true });
  }

  const client = createClient({
    url: connection.url,
    authToken: remote ? connection.authToken : undefined,
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
