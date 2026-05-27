import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");
const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

// Ensure data dir
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Run migrations
db.exec(
  "CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL)",
);
const applied = new Set(
  (db.prepare("SELECT name FROM migrations").all() as Array<{ name: string }>).map(
    (r) => r.name,
  ),
);
for (const file of fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort()) {
  if (applied.has(file)) continue;
  db.exec(fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8"));
  db.prepare("INSERT INTO migrations (name, applied_at) VALUES (?, datetime('now'))").run(
    file,
  );
  console.log(`Applied migration: ${file}`);
}

// Seed data
interface SeedEntity {
  type: string;
  slug: string;
  name: string;
  summary: string;
  body_md: string;
  attributes: Record<string, string>;
}

const seeds: SeedEntity[] = [
  {
    type: "pen",
    slug: "pilot-custom-823",
    name: "百乐 Custom 823",
    summary: "百乐旗舰级钢笔，经典真空活塞上墨，书写体验极佳",
    body_md:
      "百乐 Custom 823 是百乐 Custom 系列的旗舰产品，采用真空活塞上墨系统，储墨量极大。14K 金尖提供出色的弹性与书写反馈。笔身采用高品质树脂，透明款可观察墨水存量。是日系钢笔中活塞上墨的代表作。",
    attributes: {
      nib_size: "F/M/B",
      fill_system: "真空活塞",
      body_material: "树脂",
      origin_country: "日本",
      price_range: "¥1000-2000",
      writing_style: "顺滑、弹性适中",
      nib_material: "14K 金",
    },
  },
  {
    type: "pen",
    slug: "pelikan-souveran-m800",
    name: "百利金 Souverän M800",
    summary: "德系经典活塞钢笔，标志性的条纹笔身，书写粗犷有力",
    body_md:
      "百利金 M800 是德国钢笔的经典之作，以其标志性的条纹赛璐璐笔身闻名。活塞上墨系统稳定可靠，18K 双色金尖提供略带弹性的书写体验。笔身尺寸适中偏大，适合手较大的用户。是德系钢笔的入门标杆。",
    attributes: {
      nib_size: "EF/F/M/B",
      fill_system: "活塞上墨",
      body_material: "赛璐璐",
      origin_country: "德国",
      price_range: "¥2000-4000",
      writing_style: "顺滑、出墨充沛",
      nib_material: "18K 金",
    },
  },
  {
    type: "pen",
    slug: "sailor-pro-gear",
    name: "写乐 Pro Gear",
    summary: "日系三金之一，笔尖反馈独特，被誉为铅笔般的书写感",
    body_md:
      "写乐 Pro Gear 是日系三金（百乐、白金、写乐）中写乐的代表作。21K 金尖提供独特的阻尼感，被形容为'铅笔感'。旋转上墨系统经典可靠。笔身材质为 PMMA 树脂，质感温润。适合追求书写反馈感的用户。",
    attributes: {
      nib_size: "MF/M/B",
      fill_system: "旋转上墨",
      body_material: "PMMA 树脂",
      origin_country: "日本",
      price_range: "¥1000-2000",
      writing_style: "铅笔感、阻尼适中",
      nib_material: "21K 金",
    },
  },
  {
    type: "brand",
    slug: "pilot",
    name: "百乐 (Pilot)",
    summary: "日本最大的钢笔制造商，创立于 1918 年",
    body_md:
      "百乐（Pilot Corporation）创立于 1918 年，是日本最大的书写工具制造商。产品线从入门级的笑脸钢笔到旗舰 Custom Urushi，覆盖所有价位。旗下拥有 Namiki 品牌制作顶级漆艺钢笔。以技术创新著称，率先推出可擦墨水、按出式钢笔等。",
    attributes: {
      founded: "1918",
      origin_country: "日本",
      description: "日本最大书写工具制造商，技术创新先锋",
    },
  },
  {
    type: "concept",
    slug: "piston-filler",
    name: "活塞上墨",
    summary: "通过旋转笔尾活塞直接从墨水瓶吸墨的上墨方式",
    body_md:
      "活塞上墨是一种经典的钢笔上墨方式，通过旋转笔尾的旋钮驱动笔杆内的活塞运动，产生负压从墨水瓶中直接吸墨。优点是储墨量大（整支笔杆都是墨仓）、结构可靠、使用方便。代表品牌有百利金（Pelikan）和 TWSBI。与之对比的是墨囊/转换器上墨方式，储墨量较小但更换方便。",
    attributes: {
      description: "大储墨量、直接瓶装上墨、结构经典可靠",
    },
  },
];

// Clear existing data
db.exec("DELETE FROM entity_attributes");
db.exec("DELETE FROM entities");

const insertEntity = db.prepare(
  "INSERT INTO entities (id, type, slug, name, summary, body_md, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
);
const insertAttr = db.prepare(
  "INSERT INTO entity_attributes (id, entity_id, key, value) VALUES (?, ?, ?, ?)",
);

for (const seed of seeds) {
  const id = nanoid(12);
  insertEntity.run(id, seed.type, seed.slug, seed.name, seed.summary, seed.body_md);

  for (const [key, value] of Object.entries(seed.attributes)) {
    insertAttr.run(nanoid(12), id, key, value);
  }

  console.log(`✅ Created: ${seed.name} (/${seed.type}/${seed.slug})`);
}

console.log(`\n🌱 Seeded ${seeds.length} entities successfully!`);
db.close();
