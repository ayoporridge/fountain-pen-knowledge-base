import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  // Get star entries per type (most linked)
  const starEntries = await db.execute(`
    SELECT e.type, e.name, e.slug, COUNT(l.id) as link_count
    FROM entities e
    LEFT JOIN entity_links l ON l.source_id = e.id OR l.target_id = e.id
    GROUP BY e.id
    ORDER BY link_count DESC
    LIMIT 20
  `);
  console.log("=== Star Entries (most linked) ===");
  for (const row of starEntries.rows) {
    console.log(`${row.type}: ${row.name} (${row.link_count} entity_links) [${row.slug}]`);
  }

  // Get type breakdown with 2 star names each
  console.log("\n=== Types with star entries ===");
  const types = await db.execute("SELECT DISTINCT type FROM entities");
  for (const t of types.rows) {
    const stars = await db.execute({
      sql: `SELECT e.name, COUNT(l.id) as lc FROM entities e
            LEFT JOIN entity_links l ON l.source_id = e.id OR l.target_id = e.id
            WHERE e.type = ?
            GROUP BY e.id ORDER BY lc DESC LIMIT 2`,
      args: [String(t.type)],
    });
    const names = stars.rows.map((r) => r.name).join("、");
    console.log(`${t.type}: ${names}`);
  }

  // Get featured entries for homepage (high link count, diverse types)
  console.log("\n=== Featured (for homepage) ===");
  const featured = await db.execute(`
    SELECT e.type, e.name, e.slug, e.summary, COUNT(l.id) as link_count
    FROM entities e
    LEFT JOIN entity_links l ON l.source_id = e.id OR l.target_id = e.id
    GROUP BY e.id
    HAVING link_count >= 2
    ORDER BY link_count DESC
    LIMIT 8
  `);
  for (const row of featured.rows) {
    console.log(`[${row.type}] ${row.name} — ${row.summary || "(no summary)"} (${row.link_count} entity_links)`);
  }
}

main().catch(console.error);
