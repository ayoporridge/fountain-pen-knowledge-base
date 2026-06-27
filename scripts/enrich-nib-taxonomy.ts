import { randomUUID } from "node:crypto";
import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");

type TagSeed = {
  slug: string;
  name: string;
  dimension: "nib_type" | "nib_material";
  description: string;
};

type PenRow = {
  id: string;
  slug: string;
  name: string;
  specNib: string | null;
  seriesName: string | null;
  material: string | null;
  attrText: string | null;
};

const TAGS: TagSeed[] = [
  {
    slug: "nib-standard",
    name: "标准圆尖",
    dimension: "nib_type",
    description: "日常钢笔最常见的圆形点尖，适合多数书写角度。",
  },
  {
    slug: "nib-open",
    name: "明尖",
    dimension: "nib_type",
    description: "笔尖主体外露，现代钢笔最常见的结构形态。",
  },
  {
    slug: "nib-hooded",
    name: "暗尖/包尖",
    dimension: "nib_type",
    description: "笔尖大部分被笔握包覆，常见于 Parker 51 一类设计。",
  },
  {
    slug: "nib-semi-hooded",
    name: "半包尖",
    dimension: "nib_type",
    description: "介于明尖和暗尖之间，只有部分笔尖外露。",
  },
  {
    slug: "nib-inlaid",
    name: "嵌入式笔尖",
    dimension: "nib_type",
    description: "笔尖嵌入笔握或笔身线条，常见于 Sheaffer 和 Waterman 设计。",
  },
  {
    slug: "nib-round",
    name: "圆珠尖",
    dimension: "nib_type",
    description: "球形点尖，各方向书写都相对顺滑。",
  },
  {
    slug: "nib-soft",
    name: "软尖",
    dimension: "nib_type",
    description: "下压时反馈更柔和，但不一定以大幅线宽变化为目标。",
  },
  {
    slug: "nib-flex",
    name: "弹性尖",
    dimension: "nib_type",
    description: "下压时可产生一定粗细变化，使用时需要控制力度。",
  },
  {
    slug: "nib-superflex",
    name: "超弹性尖",
    dimension: "nib_type",
    description: "弹性变化更大的书法向笔尖，通常需要更高书写控制。",
  },
  {
    slug: "nib-stub",
    name: "Stub 平头尖",
    dimension: "nib_type",
    description: "横细竖粗但边缘较圆，日常可用性高于锐利书法尖。",
  },
  {
    slug: "nib-italic",
    name: "Italic 斜体尖",
    dimension: "nib_type",
    description: "边缘更锐利的宽尖，线宽变化明显，更偏书法用途。",
  },
  {
    slug: "nib-oblique",
    name: "Oblique 斜切尖",
    dimension: "nib_type",
    description: "笔尖端部斜切，用来适配特定握笔角度。",
  },
  {
    slug: "nib-music",
    name: "音乐尖",
    dimension: "nib_type",
    description: "宽而湿的特殊尖，最初面向乐谱和粗线书写。",
  },
  {
    slug: "nib-fude",
    name: "美工弯尖/飞机尖",
    dimension: "nib_type",
    description: "笔尖前端上翘或弯折，改变角度可写出不同线宽。",
  },
  {
    slug: "nib-architect",
    name: "刀锋尖/Architect",
    dimension: "nib_type",
    description: "横粗竖细的特种研磨，常见于定制研磨语境。",
  },
  {
    slug: "nib-naginata",
    name: "长刀研",
    dimension: "nib_type",
    description: "Sailor 代表性的特种研磨，角度变化会影响线宽。",
  },
  {
    slug: "nib-zoom",
    name: "Zoom 变焦尖",
    dimension: "nib_type",
    description: "书写角度不同，线宽变化明显的特种笔尖。",
  },
  {
    slug: "nib-posting",
    name: "PO 硬细尖",
    dimension: "nib_type",
    description: "Pilot Posting 一类下弯硬细尖，适合小字和较薄纸张。",
  },
  {
    slug: "nib-waverly",
    name: "WA 上扬尖",
    dimension: "nib_type",
    description: "笔尖端部上扬，减轻刮纸并扩大可用书写角度。",
  },
  {
    slug: "nib-replaceable",
    name: "可替换笔尖",
    dimension: "nib_type",
    description: "笔尖单元可以较方便更换，常见于模块化或老式可换尖系统。",
  },
  {
    slug: "nib-dual-sided",
    name: "双面/双尖",
    dimension: "nib_type",
    description: "同一支笔提供双面或双端书写能力。",
  },
  {
    slug: "nib-custom-ground",
    name: "手磨尖",
    dimension: "nib_type",
    description: "经由定制打磨形成的特殊书写效果。",
  },
  {
    slug: "nibmat-steel",
    name: "钢尖",
    dimension: "nib_material",
    description: "不锈钢或钢制笔尖，维护成本低，常见于日用和入门款。",
  },
  {
    slug: "nibmat-gold",
    name: "金尖",
    dimension: "nib_material",
    description: "金合金笔尖；具体成色需看 14K、18K、21K 等标识。",
  },
  {
    slug: "nibmat-14k",
    name: "14K 金",
    dimension: "nib_material",
    description: "常见金合金笔尖材质，兼顾耐用和弹性。",
  },
  {
    slug: "nibmat-18k",
    name: "18K 金",
    dimension: "nib_material",
    description: "高含金量金合金笔尖，常见于中高端型号。",
  },
  {
    slug: "nibmat-21k",
    name: "21K 金",
    dimension: "nib_material",
    description: "Sailor 等品牌常见的高含金量金尖配置。",
  },
  {
    slug: "nibmat-bicolor",
    name: "双色金尖",
    dimension: "nib_material",
    description: "通过双色镀层或双色装饰呈现的金合金笔尖。",
  },
  {
    slug: "nibmat-titanium",
    name: "钛尖",
    dimension: "nib_material",
    description: "钛或钛合金笔尖，反馈和弹性不同于钢尖与金尖。",
  },
  {
    slug: "nibmat-palladium",
    name: "钯金尖",
    dimension: "nib_material",
    description: "钯或钯合金笔尖，常见于少数高端或特定年代产品。",
  },
  {
    slug: "nibmat-gold-plated-steel",
    name: "镀金钢尖",
    dimension: "nib_material",
    description: "钢尖外观做金色或镀金处理，不等同于金合金笔尖。",
  },
  {
    slug: "nibmat-iridium-tipped",
    name: "铱粒/硬质合金点尖",
    dimension: "nib_material",
    description: "笔尖端部的耐磨点尖材料，中文常泛称铱粒。",
  },
];

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  return createClient({ url: "file:data/fpkg.db" });
}

async function execute<T extends Record<string, unknown> = Record<string, unknown>>(
  db: Client,
  sql: string,
  args: unknown[] = [],
) {
  return db.execute({ sql, args: args as InArgs }).then((result) =>
    result.rows.map((row) => row as T),
  );
}

function normalize(value: string | null | undefined) {
  return (value || "")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0),
    )
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function addTag(tags: Set<string>, slug: string) {
  if (TAGS.some((tag) => tag.slug === slug)) tags.add(slug);
}

function classifyPen(row: PenRow) {
  const nibText = normalize(
    [row.specNib, row.attrText].filter(Boolean).join(" | "),
  );
  const contextText = normalize(
    [row.name, row.slug, row.seriesName, row.material, row.specNib, row.attrText]
      .filter(Boolean)
      .join(" | "),
  );
  const lowerNib = nibText.toLowerCase();
  const lowerContext = contextText.toLowerCase();
  const materialTags = new Set<string>();
  const typeTags = new Set<string>();

  if (hasAny(lowerNib, [/21\s*k|21k|21\s*kt|21\s*金|21k金|大型 21k/])) {
    addTag(materialTags, "nibmat-21k");
    addTag(materialTags, "nibmat-gold");
  }
  if (hasAny(lowerNib, [/18\s*k|18k|18\s*kt|18\s*金|18k金|au\s*750/])) {
    addTag(materialTags, "nibmat-18k");
    addTag(materialTags, "nibmat-gold");
  }
  if (
    hasAny(lowerNib, [
      /14\s*k|14k|14\s*kt|14\s*金|14k金|au\s*585|585\s*\/?\s*14/,
    ])
  ) {
    addTag(materialTags, "nibmat-14k");
    addTag(materialTags, "nibmat-gold");
  }
  if (hasAny(lowerNib, [/钯|palladium|23\s*k.*palladium|23k钯/])) {
    addTag(materialTags, "nibmat-palladium");
  }
  if (hasAny(lowerNib, [/钛.*尖|titanium.*nib|nib.*titanium/])) {
    addTag(materialTags, "nibmat-titanium");
  }
  if (
    hasAny(lowerNib, [
      /双色|two[- ]?tone|bi[- ]?color|bicolor|镀铑|rhodium|镀铂|platinum coated/,
    ])
  ) {
    addTag(materialTags, "nibmat-bicolor");
  }
  if (hasAny(lowerNib, [/金色钢尖|镀金钢尖|gold[- ]?plated steel/])) {
    addTag(materialTags, "nibmat-gold-plated-steel");
    addTag(materialTags, "nibmat-steel");
  }
  if (hasAny(lowerNib, [/铱金|铱粒|iridium|iridosmine/])) {
    addTag(materialTags, "nibmat-iridium-tipped");
  }
  if (
    hasAny(lowerNib, [
      /钢尖|不锈钢|steel|jowo|bock|re-new-point|addipoint|铱金\/钢尖/,
    ])
  ) {
    addTag(materialTags, "nibmat-steel");
  }
  if (
    materialTags.size === 0 &&
    hasAny(lowerNib, [/金尖|gold nib|gold.*尖|au\s*\d+/])
  ) {
    addTag(materialTags, "nibmat-gold");
  }

  if (hasAny(lowerContext, [/暗尖|包尖|hooded|parker.*51|hero.*616|hero.*329|wingsung.*601/])) {
    addTag(typeTags, "nib-hooded");
  }
  if (hasAny(lowerContext, [/半暗|半包|semi[- ]?hooded|taperite|lamy.*2000/])) {
    addTag(typeTags, "nib-semi-hooded");
  }
  if (hasAny(lowerContext, [/嵌入式|inlaid|一体尖|integrated|targa|pfm|car[èe]ne|帝国元首/])) {
    addTag(typeTags, "nib-inlaid");
  }
  if (hasAny(lowerContext, [/露尖|明尖|open nib|大明尖/])) {
    addTag(typeTags, "nib-open");
  }
  if (hasAny(lowerContext, [/长刀|naginata/])) addTag(typeTags, "nib-naginata");
  if (hasAny(lowerContext, [/音乐|music|\bms\b/])) addTag(typeTags, "nib-music");
  if (hasAny(lowerContext, [/zoom|变焦/])) addTag(typeTags, "nib-zoom");
  if (hasAny(lowerContext, [/美工|弯尖|飞机尖|fude|bent nib/])) {
    addTag(typeTags, "nib-fude");
  }
  if (hasAny(lowerContext, [/刀锋|architect|blade grind|blade nib/])) {
    addTag(typeTags, "nib-architect");
  }
  if (hasAny(lowerContext, [/stub|1\.1|1\.5|1\.9|平头尖/])) addTag(typeTags, "nib-stub");
  if (hasAny(lowerContext, [/italic|斜体|书法尖/])) addTag(typeTags, "nib-italic");
  if (hasAny(lowerContext, [/oblique|斜切/])) addTag(typeTags, "nib-oblique");
  if (hasAny(lowerContext, [/\bpo\b|posting|硬细尖|po尖/])) addTag(typeTags, "nib-posting");
  if (hasAny(lowerContext, [/\bwa\b|waverly|上扬尖/])) addTag(typeTags, "nib-waverly");
  if (hasAny(lowerContext, [/超弹|super[- ]?flex/])) addTag(typeTags, "nib-superflex");
  if (hasAny(lowerContext, [/弹性|软弹|flex|falcon|\bfa\b/])) addTag(typeTags, "nib-flex");
  if (hasAny(lowerContext, [/软尖|软调|\bsf\b|\bsfm\b|\bsm\b|soft/])) {
    addTag(typeTags, "nib-soft");
  }
  if (hasAny(lowerContext, [/可替换|可换笔尖|re-new-point|addipoint|replaceable/])) {
    addTag(typeTags, "nib-replaceable");
  }
  if (hasAny(lowerContext, [/双面|双尖|double[- ]?sided|two[- ]?way/])) {
    addTag(typeTags, "nib-dual-sided");
  }
  if (hasAny(lowerContext, [/圆珠尖|round nib|球形打磨/])) {
    addTag(typeTags, "nib-round");
  }
  if (hasAny(lowerContext, [/手磨|custom grind|定制研磨/])) {
    addTag(typeTags, "nib-custom-ground");
  }

  const hasSpecialType = [...typeTags].some(
    (slug) => slug !== "nib-open" && slug !== "nib-round",
  );
  if (
    !hasSpecialType &&
    (materialTags.size > 0 ||
      hasAny(lowerContext, [/ef|fm|mf|bb|\bf\b|\bm\b|\bb\b|笔尖规格|尖号/]))
  ) {
    addTag(typeTags, "nib-standard");
  }

  return [...materialTags, ...typeTags];
}

async function upsertTags(db: Client) {
  for (const tag of TAGS) {
    const existing = await execute<{ id: string }>(
      db,
      `SELECT id FROM tags WHERE slug = ? LIMIT 1`,
      [tag.slug],
    );
    if (existing[0]) {
      if (WRITE) {
        await db.execute({
          sql: `UPDATE tags
                SET name = ?, dimension = ?, level = 'atom', description = ?
                WHERE slug = ?`,
          args: [tag.name, tag.dimension, tag.description, tag.slug],
        });
      }
    } else if (WRITE) {
      await db.execute({
        sql: `INSERT INTO tags (id, name, slug, dimension, level, description)
              VALUES (?, ?, ?, ?, 'atom', ?)`,
        args: [randomUUID(), tag.name, tag.slug, tag.dimension, tag.description],
      });
    }
  }
}

async function main() {
  const db = getClient();
  await upsertTags(db);

  const pens = await execute<PenRow>(
    db,
    `SELECT
       e.id,
       e.slug,
       e.name,
       ms.nib AS specNib,
       ms.series_name AS seriesName,
       ms.material,
       (
         SELECT group_concat(ea.key || ':' || ea.value, ' | ')
         FROM entity_attributes ea
         WHERE ea.entity_id = e.id
           AND ea.key IN ('nib_material', 'nib_size', 'writing_style')
       ) AS attrText
     FROM entities e
     LEFT JOIN model_specs ms ON ms.entity_id = e.id
     WHERE e.type = 'pen'
     ORDER BY e.slug`,
  );

  const slugToTagId = new Map<string, string>();
  const tagRows = await execute<{ id: string; slug: string }>(
    db,
    `SELECT id, slug FROM tags WHERE dimension IN ('nib_type', 'nib_material')`,
  );
  for (const row of tagRows) slugToTagId.set(row.slug, row.id);

  const assignments = pens.map((pen) => ({
    pen,
    tags: classifyPen(pen).filter((slug) => slugToTagId.has(slug)),
  }));

  if (WRITE) {
    await db.execute(`
      DELETE FROM entity_tags
      WHERE entity_id IN (SELECT id FROM entities WHERE type = 'pen')
        AND tag_id IN (
          SELECT id FROM tags WHERE dimension IN ('nib_type', 'nib_material')
        )
    `);

    for (const item of assignments) {
      for (const slug of item.tags) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id)
                VALUES (?, ?, ?)`,
          args: [randomUUID(), item.pen.id, slugToTagId.get(slug)],
        });
      }
    }
  }

  const counts: Record<string, number> = {};
  const noTags: string[] = [];
  for (const item of assignments) {
    if (item.tags.length === 0) noTags.push(`${item.pen.slug}: ${item.pen.name}`);
    for (const slug of item.tags) counts[slug] = (counts[slug] || 0) + 1;
  }

  console.log(`${WRITE ? "Updated" : "Would update"} nib taxonomy for ${pens.length} pens.`);
  console.log(`Pens without nib tags: ${noTags.length}`);
  for (const [slug, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`${slug}: ${count}`);
  }
  if (noTags.length > 0) {
    console.log("Examples without nib tags:");
    for (const item of noTags.slice(0, 20)) console.log(`  - ${item}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
