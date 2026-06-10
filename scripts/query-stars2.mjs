import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const types = await db.execute("SELECT type, COUNT(*) as cnt FROM entities GROUP BY type ORDER BY cnt DESC");
  console.log("Type counts:", types.rows);
  
  const pens = await db.execute("SELECT name, slug FROM entities WHERE type='pen' ORDER BY created_at DESC LIMIT 5");
  console.log("Recent pens:", pens.rows);
  
  const brands = await db.execute("SELECT name, slug FROM entities WHERE type='brand' ORDER BY created_at DESC LIMIT 5");
  console.log("Recent brands:", brands.rows);
  
  const concepts = await db.execute("SELECT name, slug FROM entities WHERE type='concept' ORDER BY created_at DESC LIMIT 5");
  console.log("Recent concepts:", concepts.rows);
  
  const articles = await db.execute("SELECT name, slug FROM entities WHERE type='article' ORDER BY created_at DESC LIMIT 5");
  console.log("Recent articles:", articles.rows);
  
  const total = await db.execute("SELECT COUNT(*) as cnt FROM entities");
  console.log("Total entities:", total.rows[0].cnt);
  
  const tags = await db.execute("SELECT COUNT(*) as cnt FROM tags");
  console.log("Total tags:", tags.rows[0].cnt);
  
  // Featured: entries with entity_tags (tagged entries)
  const featured = await db.execute(`
    SELECT e.type, e.name, e.slug, e.summary, COUNT(DISTINCT et.tag_id) as tag_count
    FROM entities e
    LEFT JOIN entity_tags et ON et.entity_id = e.id
    GROUP BY e.id
    HAVING tag_count >= 1
    ORDER BY tag_count DESC, e.created_at DESC
    LIMIT 8
  `);
  console.log("Featured:", featured.rows);
}

main().catch(console.error);
