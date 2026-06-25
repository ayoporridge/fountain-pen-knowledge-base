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

// Test basic queries
const entities = await db.execute('SELECT COUNT(*) as c FROM entities');
const tags = await db.execute('SELECT COUNT(*) as c FROM tags');
const pen = await db.execute("SELECT name, summary FROM entities WHERE slug = '百乐-pilot-custom-74'");

console.log('Entities:', entities.rows[0].c);
console.log('Tags:', tags.rows[0].c);
console.log('Sample pen:', pen.rows[0]);

// Test join
const penTags = await db.execute(`
  SELECT t.name, t.dimension 
  FROM entity_tags et 
  JOIN tags t ON et.tag_id = t.id 
  JOIN entities e ON et.entity_id = e.id 
  WHERE e.slug = '百乐-pilot-custom-74'
`);
console.log('Pen tags:', penTags.rows);
