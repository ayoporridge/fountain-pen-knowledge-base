import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function main() {
  if (!TURSO_URL || !TURSO_TOKEN) {
    throw new Error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN first.");
  }

  const client = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  // First, drop all existing tables
  try {
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream_%' AND name NOT LIKE 'libsql_%'"
    );
    for (const row of tables.rows) {
      await client.execute(`DROP TABLE IF EXISTS ${row.name}`);
      console.log(`Dropped table: ${row.name}`);
    }
  } catch (e) {
    console.log("Cleanup:", e.message);
  }

  // Read the SQL file
  const sql = readFileSync("/tmp/fpkg-clean.sql", "utf-8");

  // Split into individual statements
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("/*") && !s.startsWith("--"));

  // Separate CREATE TABLE and INSERT statements
  const createStatements = statements.filter((s) =>
    s.toUpperCase().startsWith("CREATE TABLE") || s.toUpperCase().startsWith("CREATE VIRTUAL TABLE")
  );
  const insertStatements = statements.filter((s) =>
    s.toUpperCase().startsWith("INSERT")
  );
  const otherStatements = statements.filter((s) =>
    !s.toUpperCase().startsWith("CREATE") && !s.toUpperCase().startsWith("INSERT")
  );

  console.log(`CREATE statements: ${createStatements.length}`);
  console.log(`INSERT statements: ${insertStatements.length}`);
  console.log(`Other statements: ${otherStatements.length}`);

  // Execute CREATE TABLE statements first
  console.log("\n=== Creating tables ===");
  for (const stmt of createStatements) {
    try {
      await client.execute(stmt);
      const tableName = stmt.match(/CREATE\s+(?:VIRTUAL\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?/i)?.[1];
      console.log(`Created table: ${tableName}`);
    } catch (error) {
      console.error(`Error creating table:`, error.message);
    }
  }

  // Execute INSERT statements in batches
  console.log("\n=== Inserting data ===");
  const batchSize = 100;
  let executed = 0;
  let errors = 0;

  for (let i = 0; i < insertStatements.length; i += batchSize) {
    const batch = insertStatements.slice(i, i + batchSize);
    try {
      for (const stmt of batch) {
        await client.execute(stmt);
        executed++;
      }
      if (executed % 1000 === 0 || executed === insertStatements.length) {
        console.log(`Inserted ${executed}/${insertStatements.length} rows`);
      }
    } catch (error) {
      errors++;
      if (errors <= 5) {
        console.error(`Error at row ${i}:`, error.message);
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total inserted: ${executed}`);
  console.log(`Errors: ${errors}`);

  // Verify counts
  const tables = ["entities", "tags", "entity_links", "entity_attributes", "entity_tags", "concept_rules", "concept_matches"];
  for (const table of tables) {
    try {
      const result = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${result.rows[0].count}`);
    } catch (e) {
      console.log(`${table}: error - ${e.message}`);
    }
  }
}

main().catch(console.error);
