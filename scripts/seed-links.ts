import Database from "better-sqlite3";
import path from "node:path";
import { nanoid } from "nanoid";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");

function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Get all entities
  const entities = db
    .prepare("SELECT id, slug, name, type FROM entities")
    .all() as Array<{
    id: string;
    slug: string;
    name: string;
    type: string;
  }>;

  console.log(`Found ${entities.length} entities:`);
  for (const e of entities) {
    console.log(`  - ${e.name} (${e.type}, ${e.slug})`);
  }

  const bySlug = new Map(entities.map((e) => [e.slug, e]));

  // Define relationships: [source_slug, target_slug, link_type]
  const relationships: Array<[string, string, string]> = [
    // Pens belong to brand Pilot
    ["pilot-custom-823", "pilot", "brand_of"],
    // Pens use piston filler concept
    ["pilot-custom-823", "piston-filler", "uses"],
    ["pelikan-souveran-m800", "piston-filler", "uses"],
    // Pens relate to each other (Japanese pen comparison)
    ["pilot-custom-823", "sailor-pro-gear", "related"],
    ["pilot-custom-823", "pelikan-souveran-m800", "related"],
    // Brand makes pens
    ["pilot", "pilot-custom-823", "makes"],
    // Concept relates to pen
    ["piston-filler", "pilot-custom-823", "implemented_in"],
    ["piston-filler", "pelikan-souveran-m800", "implemented_in"],
  ];

  const insertLink = db.prepare(
    "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, ?)",
  );

  let created = 0;
  let skipped = 0;

  for (const [srcSlug, tgtSlug, linkType] of relationships) {
    const src = bySlug.get(srcSlug);
    const tgt = bySlug.get(tgtSlug);

    if (!src || !tgt) {
      console.log(`  ⚠ Skipping: ${srcSlug} → ${tgtSlug} (entity not found)`);
      skipped++;
      continue;
    }

    const id = nanoid(12);
    try {
      insertLink.run(id, src.id, tgt.id, linkType);
      console.log(`  ✅ ${src.name} → ${tgt.name} (${linkType})`);
      created++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("UNIQUE")) {
        console.log(`  ⏭ ${src.name} → ${tgt.name} (already exists)`);
        skipped++;
      } else {
        throw err;
      }
    }
  }

  console.log(`\nDone: ${created} links created, ${skipped} skipped`);
  db.close();
}

main();
