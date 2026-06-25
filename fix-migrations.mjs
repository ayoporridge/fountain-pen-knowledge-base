import { createClient } from "@libsql/client";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  throw new Error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN first.");
}

const db = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

const migrations = [
  '001_init.sql',
  '002_schema.sql',
  '003_tags.sql',
  '004_links.sql',
  '005_sources.sql',
  '006_fts.sql',
  '007_tag_hierarchy.sql',
  '008_fix_fk.sql',
];

for (const name of migrations) {
  try {
    await db.execute({
      sql: "INSERT OR IGNORE INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
      args: [name],
    });
    console.log(`Recorded: ${name}`);
  } catch (e) {
    console.error(`Failed ${name}: ${e.message}`);
  }
}

const result = await db.execute('SELECT * FROM migrations');
console.log('\nMigrations table:');
console.log(result.rows);
