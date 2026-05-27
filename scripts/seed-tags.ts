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

// ─── Dimension definitions ───────────────────────────────────────────
interface TagDef {
  name: string;
  slug: string;
  description?: string;
}

interface DimensionDef {
  dimension: string;
  label: string;
  tags: TagDef[];
}

const DIMENSIONS: DimensionDef[] = [
  {
    dimension: "nib_type",
    label: "笔尖类型",
    tags: [
      { name: "标准尖", slug: "nib-standard", description: "普通硬笔尖，无弹性" },
      { name: "弹性尖", slug: "nib-flex", description: "有弹性，可产生粗细变化" },
      { name: "超弹性尖", slug: "nib-superflex", description: "高弹性，适合书法表现" },
      { name: "音乐尖", slug: "nib-music", description: "扁平宽尖，适合乐谱书写" },
      { name: "斜尖", slug: "nib-italic", description: "斜面切割的宽尖" },
      { name: "圆珠尖", slug: "nib-round", description: "球形打磨，各方向顺滑" },
      { name: "长刀研", slug: "nib-naginata", description: "日式长刀型笔尖，适合汉字书写" },
      { name: "手磨尖", slug: "nib-custom-ground", description: "定制打磨的特殊笔尖" },
    ],
  },
  {
    dimension: "fill_system",
    label: "上墨方式",
    tags: [
      { name: "活塞上墨", slug: "fill-piston", description: "旋转笔尾驱动活塞吸墨" },
      { name: "真空上墨", slug: "fill-vacuum", description: "真空活塞，大储墨量" },
      { name: "旋转上墨", slug: "fill-twist", description: "旋转转换器上墨" },
      { name: "墨囊", slug: "fill-cartridge", description: "一次性墨囊" },
      { name: "转换器", slug: "fill-converter", description: "可重复使用的转换器" },
      { name: "滴入式", slug: "fill-eyedropper", description: "整支笔杆作为墨仓" },
      { name: "按压上墨", slug: "fill-squeeze", description: "按压墨囊上墨" },
      { name: "按钮上墨", slug: "fill-button", description: "按按钮驱动上墨机构" },
    ],
  },
  {
    dimension: "body_material",
    label: "笔身材质",
    tags: [
      { name: "树脂", slug: "mat-resin", description: "高品质树脂，轻便耐用" },
      { name: "PMMA 树脂", slug: "mat-pmma", description: "有机玻璃树脂，透明度高" },
      { name: "赛璐璐", slug: "mat-celluloid", description: "经典材质，纹理独特" },
      { name: "黄铜", slug: "mat-brass", description: "金属笔身，有分量感" },
      { name: "不锈钢", slug: "mat-steel", description: "不锈钢材质，坚固耐用" },
      { name: "铝", slug: "mat-aluminum", description: "铝合金笔身，轻量金属" },
      { name: "漆器", slug: "mat-lacquer", description: "传统漆艺，高级感" },
      { name: "碳纤维", slug: "mat-carbon-fiber", description: "现代材质，轻量高强度" },
      { name: "木", slug: "mat-wood", description: "木质笔身，自然质感" },
    ],
  },
  {
    dimension: "origin",
    label: "产地",
    tags: [
      { name: "日本", slug: "origin-japan", description: "日本制造" },
      { name: "德国", slug: "origin-germany", description: "德国制造" },
      { name: "意大利", slug: "origin-italy", description: "意大利制造" },
      { name: "美国", slug: "origin-usa", description: "美国制造" },
      { name: "中国", slug: "origin-china", description: "中国制造" },
      { name: "法国", slug: "origin-france", description: "法国制造" },
      { name: "英国", slug: "origin-uk", description: "英国制造" },
      { name: "台湾", slug: "origin-taiwan", description: "台湾制造" },
    ],
  },
  {
    dimension: "price",
    label: "价位",
    tags: [
      { name: "入门级 (¥0-200)", slug: "price-entry", description: "适合初学者的平价钢笔" },
      { name: "进阶 (¥200-500)", slug: "price-mid", description: "品质提升的中档钢笔" },
      { name: "中高端 (¥500-1000)", slug: "price-upper-mid", description: "准专业级钢笔" },
      { name: "高端 (¥1000-2000)", slug: "price-high", description: "高品质金尖钢笔" },
      { name: "旗舰 (¥2000-5000)", slug: "price-flagship", description: "品牌旗舰级产品" },
      { name: "顶级 (¥5000+)", slug: "price-ultra", description: "顶级工艺和材质" },
    ],
  },
  {
    dimension: "usage",
    label: "用途",
    tags: [
      { name: "日常书写", slug: "use-daily", description: "适合日常笔记和书写" },
      { name: "签字", slug: "use-signing", description: "适合正式签字场合" },
      { name: "书法", slug: "use-calligraphy", description: "适合书法创作" },
      { name: "绘画", slug: "use-drawing", description: "适合绘画和速写" },
      { name: "笔记", slug: "use-notes", description: "适合课堂或会议笔记" },
      { name: "收藏", slug: "use-collection", description: "收藏级钢笔" },
      { name: "送礼", slug: "use-gift", description: "适合作为礼品" },
      { name: "办公", slug: "use-office", description: "适合办公场景" },
    ],
  },
  {
    dimension: "nib_material",
    label: "笔尖材质",
    tags: [
      { name: "钢尖", slug: "nibmat-steel", description: "不锈钢笔尖，经济实惠" },
      { name: "14K 金", slug: "nibmat-14k", description: "14K 金尖，弹性适中" },
      { name: "18K 金", slug: "nibmat-18k", description: "18K 金尖，更软更弹" },
      { name: "21K 金", slug: "nibmat-21k", description: "21K 金尖，极软弹" },
      { name: "钛", slug: "nibmat-titanium", description: "钛合金笔尖，独特弹性" },
      { name: "金合金双色", slug: "nibmat-bicolor", description: "双色金尖，美观" },
    ],
  },
  {
    dimension: "brand_tier",
    label: "品牌定位",
    tags: [
      { name: "大众品牌", slug: "tier-mass", description: "面向大众市场的品牌" },
      { name: "专业品牌", slug: "tier-pro", description: "面向书写爱好者的专业品牌" },
      { name: "奢侈品牌", slug: "tier-luxury", description: "顶级奢侈品牌" },
      { name: "独立制笔", slug: "tier-indie", description: "小众独立制笔工坊" },
      { name: "国产品牌", slug: "tier-domestic", description: "中国本土品牌" },
    ],
  },
  {
    dimension: "era",
    label: "年代",
    tags: [
      { name: "经典复刻", slug: "era-vintage-reissue", description: "复刻经典设计" },
      { name: "现代", slug: "era-modern", description: "当代在产产品" },
      { name: "停产绝版", slug: "era-discontinued", description: "已停产的经典款" },
      { name: "限量版", slug: "era-limited", description: "限量发行" },
      { name: "古董笔", slug: "era-antique", description: "具有年代价值的古董笔" },
    ],
  },
  {
    dimension: "size",
    label: "尺寸",
    tags: [
      { name: "紧凑便携", slug: "size-compact", description: "小巧便携，适合口袋" },
      { name: "标准", slug: "size-standard", description: "标准尺寸，适合大多数手型" },
      { name: "大号", slug: "size-large", description: "大号笔身，手大用户友好" },
      { name: "超大", slug: "size-oversize", description: "超大号，气场十足" },
    ],
  },
  {
    dimension: "ink_type",
    label: "墨水类型",
    tags: [
      { name: "染料墨水", slug: "ink-dye", description: "普通染料基墨水" },
      { name: "颜料墨水", slug: "ink-pigment", description: "防水耐光的颜料墨水" },
      { name: "铁胆墨水", slug: "ink-iron-gall", description: "传统铁胆墨水，防水" },
      { name: "碳素墨水", slug: "ink-carbon", description: "碳素颗粒，极防水" },
      { name: "快干墨水", slug: "ink-quick-dry", description: "速干配方" },
    ],
  },
  {
    dimension: "style",
    label: "风格",
    tags: [
      { name: "简约现代", slug: "style-minimal", description: "简洁现代的设计语言" },
      { name: "复古经典", slug: "style-vintage", description: "复古设计元素" },
      { name: "商务正式", slug: "style-business", description: "正式商务场合风格" },
      { name: "文艺", slug: "style-artsy", description: "文艺范设计" },
      { name: "运动休闲", slug: "style-sporty", description: "年轻活力风格" },
    ],
  },
];

// ─── Insert tags ─────────────────────────────────────────────────────
const insertTag = db.prepare(
  "INSERT OR IGNORE INTO tags (id, name, slug, dimension, level, description) VALUES (?, ?, ?, ?, ?, ?)",
);

let inserted = 0;
for (const dim of DIMENSIONS) {
  for (const tag of dim.tags) {
    const result = insertTag.run(
      nanoid(12),
      tag.name,
      tag.slug,
      dim.dimension,
      "atom",
      tag.description || null,
    );
    if (result.changes > 0) {
      inserted++;
    }
  }
  console.log(`✅ ${dim.label} (${dim.dimension}): ${dim.tags.length} tags`);
}

console.log(`\n🌱 Seeded ${inserted} atomic tags across ${DIMENSIONS.length} dimensions!`);
db.close();
