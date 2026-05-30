import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ file: string; error: string }>;
  linksCreated: number;
}

interface Frontmatter {
  title?: string;
  source?: string;
  category?: string;
  category_zh?: string;
  date?: string;
  type?: string;
  slug?: string;
  summary?: string;
  tags?: string[];
}

function parseFrontmatter(content: string): {
  meta: Frontmatter;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const yamlStr = match[1];
  const body = match[2];
  const meta: Frontmatter = {};

  for (const line of yamlStr.split("\n")) {
    const m = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/);
    if (m) {
      const [, key, val] = m;
      if (key === "tags") {
        meta.tags = val.split(",").map((t) => t.trim());
      } else {
        (meta as Record<string, string>)[key] = val;
      }
    }
  }

  return { meta, body: body.trim() };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractWikiLinks(body: string): string[] {
  const links: string[] = [];
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    links.push(match[1]);
  }
  return [...new Set(links)];
}

function inferTypeFromCategory(categoryZh?: string): string {
  if (!categoryZh) return "concept";
  const map: Record<string, string> = {
    钢笔解剖: "concept",
    设计特征: "concept",
    笔尖与笔舌: "nib",
    上墨系统: "fill_system",
    经典型号档案: "pen",
    保养与维护: "concept",
    钢笔与历史: "concept",
    术语表: "concept",
    考古发掘: "pen",
    钢笔展会: "concept",
    钢笔医生: "concept",
    修复冒险: "concept",
    修复指南: "concept",
    杂谈: "concept",
    研究工具: "concept",
  };
  return map[categoryZh] || "concept";
}

export function importMarkdownDir(
  dirPath: string,
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

  const result: ImportResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    linksCreated: 0,
  };

  // Collect all .md files recursively
  const mdFiles: string[] = [];
  function walkDir(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith(".md") && !entry.name.startsWith(".")) {
        mdFiles.push(fullPath);
      }
    }
  }
  walkDir(dirPath);

  console.log(`Found ${mdFiles.length} markdown files in ${dirPath}`);

  const insertEntity = db.prepare(`
    INSERT INTO entities (id, type, slug, name, summary, body_md, source_url, source_file, imported_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const updateEntity = db.prepare(`
    UPDATE entities SET name = ?, summary = ?, body_md = ?, source_url = ?, source_file = ?, imported_at = datetime('now'), updated_at = datetime('now')
    WHERE slug = ? AND type = ?
  `);

  const checkSlug = db.prepare(
    "SELECT id FROM entities WHERE slug = ? AND type = ?",
  );

  const insertLink = db.prepare(
    "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, ?)",
  );

  const findEntityBySlug = db.prepare(
    "SELECT id, type, slug FROM entities WHERE slug = ?",
  );

  // First pass: create/update all entities
  for (const filePath of mdFiles) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { meta, body } = parseFrontmatter(raw);

      const title =
        meta.title ||
        path.basename(filePath, ".md").replace(/^\d+_/, "").replace(/_/g, " ");
      const slug = meta.slug || slugify(title);
      const type = meta.type || inferTypeFromCategory(meta.category_zh);
      const summary = meta.summary || body.slice(0, 200).replace(/[#*\n]/g, " ").trim();
      const sourceUrl = meta.source || "";
      const relPath = path.relative(dirPath, filePath);

      const existing = checkSlug.get(slug, type) as
        | { id: string }
        | undefined;

      if (existing) {
        if (onConflict === "skip") {
          result.skipped++;
          continue;
        }
        if (onConflict === "update") {
          updateEntity.run(title, summary, body, sourceUrl, relPath, slug, type);
          result.updated++;
          continue;
        }
        // onConflict === "error"
        result.errors.push({
          file: relPath,
          error: `Duplicate slug: ${slug} (type: ${type})`,
        });
        continue;
      }

      const id = nanoid(12);
      insertEntity.run(
        id,
        type,
        slug,
        title,
        summary,
        body,
        sourceUrl,
        relPath,
        new Date().toISOString(),
      );
      result.created++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push({ file: path.relative(dirPath, filePath), error: msg });
    }
  }

  // Second pass: create links from [[wiki-links]]
  for (const filePath of mdFiles) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { meta, body } = parseFrontmatter(raw);
      const title =
        meta.title ||
        path.basename(filePath, ".md").replace(/^\d+_/, "").replace(/_/g, " ");
      const slug = meta.slug || slugify(title);
      const type = meta.type || inferTypeFromCategory(meta.category_zh);

      const source = checkSlug.get(slug, type) as { id: string } | undefined;
      if (!source) continue;

      const links = extractWikiLinks(body);
      for (const linkSlug of links) {
        const targetSlug = slugify(linkSlug);
        const target = findEntityBySlug.get(targetSlug) as
          | { id: string }
          | undefined;
        if (target && target.id !== source.id) {
          const linkId = nanoid(12);
          try {
            insertLink.run(linkId, source.id, target.id, "wiki");
            result.linksCreated++;
          } catch {
            // duplicate or self-link, ignore
          }
        }
      }
    } catch {
      // errors already captured in first pass
    }
  }

  db.close();
  return result;
}

// CLI
const args = process.argv.slice(2);
const dirPath = args[0];
const onConflict = (args.find((a) => a.startsWith("--on-conflict="))?.split("=")[1] || "skip") as "skip" | "update" | "error";

if (!dirPath) {
  console.log("Usage: tsx scripts/import-markdown.ts <directory> [--on-conflict=skip|update|error]");
  process.exit(1);
}

const absDir = path.resolve(dirPath);
if (!fs.existsSync(absDir)) {
  console.error(`Directory not found: ${absDir}`);
  process.exit(1);
}

const result = importMarkdownDir(absDir, { onConflict });

console.log("\n📊 Import Report:");
console.log(`  ✅ Created: ${result.created}`);
console.log(`  🔄 Updated: ${result.updated}`);
console.log(`  ⏭  Skipped: ${result.skipped}`);
console.log(`  🔗 Links created: ${result.linksCreated}`);
if (result.errors.length > 0) {
  console.log(`  ❌ Errors: ${result.errors.length}`);
  for (const err of result.errors) {
    console.log(`    - ${err.file}: ${err.error}`);
  }
}
