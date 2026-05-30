import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
  tagsCreated: number;
}

// Default column mapping for 钢笔品牌型号索引库.csv
const DEFAULT_MAPPING: Record<string, string> = {
  "品牌": "brand",
  "型号": "name",
  "产地": "origin_country",
  "笔尖材质": "nib_material",
  "笔尖尺寸": "nib_size",
  "上墨方式": "fill_system",
  "价位段(元)": "price_range",
  "外形特点": "description",
  "材质手感": "body_material",
  "笔尖特性": "writing_style",
  "社交媒体口碑": "summary",
};

interface MappingConfig {
  nameColumn: string;
  typeOverride?: string;
  skipColumns: string[];
  attributeColumns: Record<string, string>; // csvHeader -> attrKey
  tagColumns: string[];
  tagDimension: Record<string, string>;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || "";
    }
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // remove parenthetical
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function importCSV(
  csvPath: string,
  config: Partial<MappingConfig> = {},
  options: { onConflict?: "skip" | "update" | "error" } = {},
): ImportResult {
  const { onConflict = "skip" } = options;
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Run source migration if needed
  try {
    db.prepare("SELECT source_url FROM entities LIMIT 1").get();
  } catch {
    console.log("Running source migration...");
    const migration = fs.readFileSync(
      path.join(process.cwd(), "migrations", "005_sources.sql"),
      "utf-8",
    );
    for (const stmt of migration.split(";").filter((s) => s.trim())) {
      db.exec(stmt);
    }
  }

  const mapping: MappingConfig = {
    nameColumn: config.nameColumn || "型号",
    typeOverride: config.typeOverride || "pen",
    skipColumns: config.skipColumns || ["图片目录", "相关文章"],
    attributeColumns: config.attributeColumns || DEFAULT_MAPPING,
    tagColumns: config.tagColumns || ["笔尖材质", "上墨方式", "产地", "价位段(元)"],
    tagDimension: config.tagDimension || {
      "笔尖材质": "nib_material",
      "上墨方式": "fill_system",
      "产地": "origin",
      "价位段(元)": "price",
    },
  };

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);

  console.log(`Parsed ${rows.length} rows from CSV`);

  const result: ImportResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    tagsCreated: 0,
  };

  const insertEntity = db.prepare(`
    INSERT INTO entities (id, type, slug, name, summary, body_md, source_file, imported_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const updateEntity = db.prepare(`
    UPDATE entities SET name = ?, summary = ?, source_file = ?, imported_at = datetime('now'), updated_at = datetime('now')
    WHERE slug = ? AND type = ?
  `);

  const checkSlug = db.prepare(
    "SELECT id FROM entities WHERE slug = ? AND type = ?",
  );

  const insertAttr = db.prepare(
    "INSERT OR REPLACE INTO entity_attributes (id, entity_id, key, value) VALUES (?, ?, ?, ?)",
  );

  const insertTag = db.prepare(
    "INSERT OR IGNORE INTO tags (id, name, slug, dimension) VALUES (?, ?, ?, ?)",
  );
  const findTag = db.prepare(
    "SELECT id FROM tags WHERE slug = ? AND dimension = ?",
  );
  const insertEntityTag = db.prepare(
    "INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id) VALUES (?, ?, ?)",
  );

  const relPath = path.basename(csvPath);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const name = row[mapping.nameColumn];
      if (!name) {
        result.errors.push({ row: i + 1, error: "Missing name column" });
        continue;
      }

      // Build slug from brand + name
      const brand = row["品牌"] || "";
      const fullName = brand ? `${brand} ${name}` : name;
      const slug = slugify(fullName);
      const type = mapping.typeOverride || "pen";

      // Check existence
      const existing = checkSlug.get(slug, type) as
        | { id: string }
        | undefined;

      if (existing) {
        if (onConflict === "skip") {
          result.skipped++;
          continue;
        }
        if (onConflict === "update") {
          updateEntity.run(fullName, row["社交媒体口碑"] || "", relPath, slug, type);
          result.updated++;
          continue;
        }
        result.errors.push({
          row: i + 1,
          error: `Duplicate slug: ${slug}`,
        });
        continue;
      }

      // Create entity
      const id = nanoid(12);
      const summary = row["社交媒体口碑"] || row["外形特点"] || "";

      // Build body from all fields
      const bodyParts: string[] = [];
      bodyParts.push(`# ${fullName}\n`);
      if (brand) bodyParts.push(`**品牌:** ${brand}`);
      for (const [csvCol, attrKey] of Object.entries(mapping.attributeColumns)) {
        if (row[csvCol] && attrKey !== "brand" && attrKey !== "name" && attrKey !== "summary") {
          const label = csvCol;
          bodyParts.push(`**${label}:** ${row[csvCol]}`);
        }
      }

      insertEntity.run(
        id,
        type,
        slug,
        fullName,
        summary,
        bodyParts.join("\n\n"),
        relPath,
        new Date().toISOString(),
      );
      result.created++;

      // Insert attributes
      for (const [csvCol, attrKey] of Object.entries(mapping.attributeColumns)) {
        if (row[csvCol] && attrKey !== "brand" && attrKey !== "name" && attrKey !== "summary") {
          insertAttr.run(nanoid(12), id, attrKey, row[csvCol]);
        }
      }

      // Create tags
      const findTagByName = db.prepare(
        "SELECT id FROM tags WHERE name = ? AND dimension = ?",
      );

      for (const tagCol of mapping.tagColumns) {
        const value = row[tagCol];
        if (!value) continue;

        const dimension = mapping.tagDimension[tagCol] || tagCol;

        // Split multi-value fields (e.g. "上墨器/墨囊" → two tags)
        const values = value.split(/[/|、]/).map((v: string) => v.trim()).filter(Boolean);

        for (const v of values) {
          const tagSlug = slugify(v);

          // Try to find existing tag by slug first, then by name
          let tag = findTag.get(tagSlug, dimension) as { id: string } | undefined;
          if (!tag) {
            tag = findTagByName.get(v, dimension) as { id: string } | undefined;
          }
          if (!tag) {
            // Create new tag
            insertTag.run(nanoid(12), v, tagSlug, dimension);
            tag = findTag.get(tagSlug, dimension) as { id: string } | undefined;
          }
          if (tag) {
            try {
              insertEntityTag.run(nanoid(12), id, tag.id);
              result.tagsCreated++;
            } catch {
              // duplicate, ignore
            }
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push({ row: i + 1, error: msg });
    }
  }

  db.close();
  return result;
}

// CLI
const args = process.argv.slice(2);
const csvPath = args[0];
const onConflict = (args.find((a) => a.startsWith("--on-conflict="))?.split("=")[1] || "skip") as "skip" | "update" | "error";

if (!csvPath) {
  console.log("Usage: tsx scripts/import-csv.ts <file.csv> [--on-conflict=skip|update|error]");
  process.exit(1);
}

const absPath = path.resolve(csvPath);
if (!fs.existsSync(absPath)) {
  console.error(`File not found: ${absPath}`);
  process.exit(1);
}

const result = importCSV(absPath, {}, { onConflict });

console.log("\n📊 CSV Import Report:");
console.log(`  ✅ Created: ${result.created}`);
console.log(`  🔄 Updated: ${result.updated}`);
console.log(`  ⏭  Skipped: ${result.skipped}`);
console.log(`  🏷  Tags created: ${result.tagsCreated}`);
if (result.errors.length > 0) {
  console.log(`  ❌ Errors: ${result.errors.length}`);
  for (const err of result.errors.slice(0, 10)) {
    console.log(`    - Row ${err.row}: ${err.error}`);
  }
  if (result.errors.length > 10) {
    console.log(`    ... and ${result.errors.length - 10} more`);
  }
}
