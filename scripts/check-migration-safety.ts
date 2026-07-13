import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";
import { assertDatabaseReady, migrateDatabase } from "../src/lib/db";

async function main(): Promise<void> {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-migrations-"));
  const migrationsDir = path.join(tempRoot, "migrations");
  const databasePath = path.join(tempRoot, "test.db");

  fs.mkdirSync(migrationsDir);
  fs.writeFileSync(
    path.join(migrationsDir, "001_create.sql"),
    "CREATE TABLE sample (id INTEGER PRIMARY KEY, value TEXT NOT NULL);",
  );
  fs.writeFileSync(
    path.join(migrationsDir, "002_transaction.sql"),
    "BEGIN;\nINSERT INTO sample (value) VALUES ('kept');\nCOMMIT;\n",
  );

  const client = createClient({ url: `file:${databasePath}` });

  try {
    const first = await migrateDatabase(client, { migrationsDir });
    if (first.applied.length !== 2 || first.skipped.length !== 0) {
      throw new Error(`Unexpected first migration result: ${JSON.stringify(first)}`);
    }

    const second = await migrateDatabase(client, { migrationsDir });
    if (second.applied.length !== 0 || second.skipped.length !== 2) {
      throw new Error(`Migrations were not idempotent: ${JSON.stringify(second)}`);
    }

    await assertDatabaseReady(client, { migrationsDir });

    fs.appendFileSync(
      path.join(migrationsDir, "002_transaction.sql"),
      "\n-- checksum drift",
    );
    let driftWasRejected = false;
    try {
      await migrateDatabase(client, { migrationsDir });
    } catch (error) {
      driftWasRejected =
        error instanceof Error && error.message.includes("002_transaction.sql");
    }
    if (!driftWasRejected) {
      throw new Error("An applied migration rewrite was not rejected.");
    }
    fs.writeFileSync(
      path.join(migrationsDir, "002_transaction.sql"),
      "BEGIN;\nINSERT INTO sample (value) VALUES ('kept');\nCOMMIT;\n",
    );

    fs.writeFileSync(
      path.join(migrationsDir, "003_failure.sql"),
      "INSERT INTO sample (value) VALUES ('rolled back');\nINSERT INTO table_that_does_not_exist VALUES (1);",
    );

    let failed = false;
    try {
      await migrateDatabase(client, { migrationsDir });
    } catch (error) {
      failed = error instanceof Error && error.message.includes("003_failure.sql");
    }

    if (!failed) throw new Error("A broken migration did not fail the command.");

    const marker = await client.execute({
      sql: "SELECT 1 FROM migrations WHERE name = ?",
      args: ["003_failure.sql"],
    });
    if (marker.rows.length !== 0) {
      throw new Error("A failed migration was incorrectly recorded as applied.");
    }

    const rolledBackWrite = await client.execute(
      "SELECT 1 FROM sample WHERE value = 'rolled back'",
    );
    if (rolledBackWrite.rows.length !== 0) {
      throw new Error("A write before a migration failure was not rolled back.");
    }

    let pendingWasRejected = false;
    try {
      await assertDatabaseReady(client, { migrationsDir });
    } catch (error) {
      pendingWasRejected =
        error instanceof Error && error.message.includes("003_failure.sql");
    }

    if (!pendingWasRejected) {
      throw new Error("Runtime schema guard did not reject a pending migration.");
    }

    const replayDatabasePath = path.join(tempRoot, "full-replay.db");
    const replayClient = createClient({ url: `file:${replayDatabasePath}` });
    try {
      await migrateDatabase(replayClient);
      await assertDatabaseReady(replayClient);
      const foreignKeys = await replayClient.execute("PRAGMA foreign_key_check");
      if (foreignKeys.rows.length > 0) {
        throw new Error(
          `Fresh migration replay left ${foreignKeys.rows.length} foreign-key violation(s).`,
        );
      }
    } finally {
      replayClient.close();
    }

    console.log("Migration safety check passed, including a fresh full replay.");
  } finally {
    client.close();
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
