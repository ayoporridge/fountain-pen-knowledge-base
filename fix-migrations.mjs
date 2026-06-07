import { createClient } from '@libsql/client';

const db = createClient({
  url: 'libsql://fpkg-arjoxu.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODA4MjE1NTQsImlkIjoiMDE5ZWEwODYtYWEwMS03MWZiLTk2NjMtMGUzMTA2MGI2OTg1IiwicmlkIjoiNzg0YjIyNzEtYTExYy00ZThhLWEyYjYtMzNiMTBjMWM2YTk2In0.nulsmSgn7kpDZXSHDuVXTf-OeR8Ad5uCOcSAwUCmJqx4A3Q8uiqoUWpCWxZ8a656oZSgUn81dyNjxGhXQdwLCQ',
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
