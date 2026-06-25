import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InArgs } from "@libsql/client";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");
const WRITE = process.argv.includes("--write");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));

type EntityRow = {
  id: string;
  name: string;
  slug: string;
};

type SourceItemRow = {
  id: string;
  title: string;
};

type DiagramSeed = {
  id: string;
  slug: string;
  entitySlug: string;
  sourceItemId: string;
  title: string;
  diagramType:
    | "structure"
    | "mechanism"
    | "timeline"
    | "family_tree"
    | "size_compare"
    | "relationship";
  svg: string;
  hotspots: Array<{
    label: string;
    x: number;
    y: number;
    explanation: string;
  }>;
  sourceNote: string;
  citationNote: string;
};

function diagramShell(title: string, subtitle: string, body: string) {
  return `<svg viewBox="0 0 920 520" role="img" aria-labelledby="title desc" xmlns="http://www.w3.org/2000/svg">
  <title id="title">${title}</title>
  <desc id="desc">${subtitle}</desc>
  <style>
    .bg{fill:#f8f5ef}.panel{fill:#fffdfa;stroke:#d8cbbb;stroke-width:2}.ink{fill:#2a2118}.muted{fill:#756b5f}.line{stroke:#8a6f4d;stroke-width:4;stroke-linecap:round}.soft{fill:#efe6d9}.accent{fill:#8a4f2b}.chip{fill:#e6f0ec;stroke:#8ab0a1;stroke-width:2}.warn{fill:#fff5da;stroke:#cf9f3a;stroke-width:2}.small{font:500 22px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.tiny{font:500 18px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.label{font:700 26px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.title{font:800 34px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  </style>
  <rect class="bg" width="920" height="520" rx="28"/>
  <text class="title ink" x="46" y="58">${title}</text>
  <text class="small muted" x="46" y="92">${subtitle}</text>
  ${body}
</svg>`;
}

const DIAGRAM_SEEDS: DiagramSeed[] = [
  {
    id: "diagram-sailor-pro-gear-family-map",
    slug: "sailor-pro-gear-family-map",
    entitySlug: "sailor-pro-gear",
    sourceItemId: "source-sailor-pro-gear-official",
    title: "Sailor Pro Gear 系列关系示意",
    diagramType: "relationship",
    svg: diagramShell(
      "Sailor Pro Gear 系列关系示意",
      "站内原创图：以官方 Professional Gear 系列页为证据锚点",
      `<rect class="panel" x="62" y="132" width="796" height="298" rx="22"/>
  <rect class="soft" x="108" y="220" width="250" height="118" rx="22"/>
  <text class="label ink" x="140" y="270">Professional Gear</text>
  <text class="tiny muted" x="140" y="306">平顶笔帽 · anchor 标识语境</text>
  <path class="line" d="M358 279 H456"/>
  <rect class="chip" x="470" y="142" width="312" height="62" rx="18"/>
  <text class="small ink" x="500" y="181">21K / 14K 金尖，随版本变化</text>
  <rect class="chip" x="470" y="229" width="312" height="62" rx="18"/>
  <text class="small ink" x="500" y="268">上墨器 / 墨囊系统</text>
  <rect class="chip" x="470" y="316" width="312" height="62" rx="18"/>
  <text class="small ink" x="500" y="355">Slim · Standard · King 等支线</text>
  <circle class="accent" cx="254" cy="190" r="18"/>
  <path d="M238 190h32M254 174v32" stroke="#fffdfa" stroke-width="5" stroke-linecap="round"/>
  <text class="tiny muted" x="108" y="472">注：尺寸、重量和地区供应仍需按具体型号页继续核验。</text>`,
    ),
    hotspots: [
      {
        label: "1 系列入口",
        x: 25,
        y: 54,
        explanation: "把 Pro Gear 当作系列入口，后续再拆 Slim、Standard、King 等独立型号。",
      },
      {
        label: "2 笔尖",
        x: 67,
        y: 33,
        explanation: "官方系列页可支撑 21K 或 14K 金尖这一层级的描述。",
      },
      {
        label: "3 上墨",
        x: 66,
        y: 50,
        explanation: "官方系列页可支撑上墨器/墨囊系统的基础描述。",
      },
    ],
    sourceNote:
      "站内原创系列关系图；仅使用官方 Professional Gear 系列页可支撑的系列、笔尖和上墨系统信息，具体尺寸与地区供应保留为待核验。",
    citationNote:
      "Diagram summarizes Sailor official Professional Gear series context without copying product artwork.",
  },
  {
    id: "diagram-platinum-3776-century-archive",
    slug: "platinum-3776-century-archive-map",
    entitySlug: "白金-platinum-3776-century",
    sourceItemId: "source-platinum-3776-century-official",
    title: "Platinum #3776 Century 档案拆解图",
    diagramType: "structure",
    svg: diagramShell(
      "Platinum #3776 Century 档案拆解图",
      "站内原创图：先画可核验的型号档案骨架",
      `<rect class="panel" x="68" y="136" width="782" height="292" rx="24"/>
  <path d="M146 286 C232 220 360 220 450 286 C360 352 232 352 146 286Z" fill="#fbf6e8" stroke="#9c7d51" stroke-width="4"/>
  <path d="M224 286 H452" stroke="#9c7d51" stroke-width="4" stroke-linecap="round"/>
  <circle cx="284" cy="286" r="16" fill="#9c7d51"/>
  <rect class="chip" x="512" y="158" width="260" height="60" rx="18"/>
  <text class="small ink" x="542" y="197">14K 金尖</text>
  <rect class="chip" x="512" y="244" width="260" height="60" rx="18"/>
  <text class="small ink" x="542" y="283">墨囊 / 上墨器</text>
  <rect class="warn" x="512" y="330" width="260" height="60" rx="18"/>
  <text class="small ink" x="542" y="369">尺寸重量按版本核验</text>
  <text class="tiny muted" x="126" y="390">Chartres Blue · Bourgogne · Chenonceau White 等支线需继续拆档。</text>`,
    ),
    hotspots: [
      {
        label: "1 笔尖",
        x: 31,
        y: 55,
        explanation: "当前档案用官方 collection 页支撑 14K 金尖描述。",
      },
      {
        label: "2 上墨",
        x: 70,
        y: 53,
        explanation: "官方 collection 页可作为墨囊/上墨器字段的来源锚点。",
      },
      {
        label: "3 版本",
        x: 70,
        y: 70,
        explanation: "不同配色和材质支线不应混写，需要按版本继续补来源。",
      },
    ],
    sourceNote:
      "站内原创档案拆解图；只把官方 #3776 Century collection 页已经支撑的笔尖、上墨和版本拆分方向画入图中。",
    citationNote:
      "Diagram uses the official #3776 Century collection page as a cautious archive anchor.",
  },
  {
    id: "diagram-kaweco-sport-size-map",
    slug: "kaweco-sport-size-map",
    entitySlug: "kaweco-sport",
    sourceItemId: "source-kaweco-classic-sport-official",
    title: "Kaweco Sport 口袋笔比例示意",
    diagramType: "size_compare",
    svg: diagramShell(
      "Kaweco Sport 口袋笔比例示意",
      "站内原创图：用比例解释 pocket-sized 设计",
      `<rect class="panel" x="58" y="134" width="804" height="300" rx="24"/>
  <text class="small ink" x="102" y="188">闭合状态</text>
  <rect x="236" y="164" width="240" height="46" rx="23" fill="#29445a"/>
  <rect x="442" y="164" width="84" height="46" rx="23" fill="#416882"/>
  <text class="tiny muted" x="550" y="194">约 10.5 cm</text>
  <text class="small ink" x="102" y="294">插帽书写</text>
  <rect x="236" y="270" width="380" height="44" rx="22" fill="#29445a"/>
  <path d="M616 292 L758 244 L758 340 Z" fill="#f7df9e" stroke="#9c7d51" stroke-width="4"/>
  <path d="M662 292 H758" stroke="#9c7d51" stroke-width="4"/>
  <rect class="chip" x="236" y="360" width="206" height="52" rx="17"/>
  <text class="tiny ink" x="262" y="393">Classic Sport</text>
  <rect class="chip" x="470" y="360" width="206" height="52" rx="17"/>
  <text class="tiny ink" x="506" y="393">AL / Brass 等支线</text>
  <text class="tiny muted" x="102" y="474">注：材质、重量、短上墨器兼容性需分支线继续核验。</text>`,
    ),
    hotspots: [
      {
        label: "1 闭合",
        x: 41,
        y: 36,
        explanation: "官方 Classic Sport 页可支撑闭合约 10.5 cm 的口袋笔定位。",
      },
      {
        label: "2 插帽",
        x: 61,
        y: 56,
        explanation: "插帽后接近标准书写长度，是 Sport 作为口袋笔的关键阅读点。",
      },
      {
        label: "3 支线",
        x: 62,
        y: 74,
        explanation: "Classic、AL、Brass 等支线需要分开处理材质和重量。",
      },
    ],
    sourceNote:
      "站内原创比例示意图；以官方 Classic Sport 页面中的 pocket-sized 和闭合约 10.5 cm 信息为证据锚点。",
    citationNote:
      "Diagram summarizes Kaweco official Classic Sport pocket-pen positioning and size context.",
  },
  {
    id: "diagram-montblanc-149-evidence-boundary",
    slug: "montblanc-149-evidence-boundary",
    entitySlug: "万宝龙-montblanc-大班149-meisterst-ck",
    sourceItemId: "source-montblanc-origin-149-official",
    title: "Montblanc 149 证据边界图",
    diagramType: "relationship",
    svg: diagramShell(
      "Montblanc 149 证据边界图",
      "站内原创图：把当前官方页面与历史型号研究分开",
      `<rect class="panel" x="68" y="132" width="784" height="306" rx="24"/>
  <rect class="chip" x="112" y="188" width="286" height="92" rx="22"/>
  <text class="small ink" x="146" y="226">当前官方商品页</text>
  <text class="tiny muted" x="146" y="258">The Origin Collection 149</text>
  <path class="line" d="M412 234 H506"/>
  <rect class="warn" x="522" y="168" width="266" height="132" rx="22"/>
  <text class="small ink" x="556" y="210">历史 149 档案</text>
  <text class="tiny muted" x="556" y="244">目录 · 维修资料 · 收藏研究</text>
  <text class="tiny muted" x="556" y="272">仍需继续补来源</text>
  <rect class="soft" x="158" y="334" width="566" height="54" rx="18"/>
  <text class="tiny ink" x="188" y="368">原则：不能用一个当前纪念款页面覆盖全部 149 历史版本。</text>`,
    ),
    hotspots: [
      {
        label: "1 官方页",
        x: 28,
        y: 45,
        explanation: "当前来源只适合作为 149/Meisterstück 官方语境锚点。",
      },
      {
        label: "2 边界",
        x: 71,
        y: 46,
        explanation: "历史版本、笔尖、feed、活塞等细节需要更多目录和维修来源。",
      },
      {
        label: "3 原则",
        x: 49,
        y: 69,
        explanation: "图书馆页面要明确证据边界，避免把纪念款资料泛化为所有 149。",
      },
    ],
    sourceNote:
      "站内原创证据边界图；当前只用 Montblanc 官方 The Origin Collection 149 页面确认官方产品语境，不扩写未经核验的历史细节。",
    citationNote:
      "Diagram cites the Montblanc official Origin Collection 149 page only as a current official context anchor.",
  },
];

const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : DIAGRAM_SEEDS.length;

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function execute(db: Client, sql: string, args: unknown[] = []) {
  await db.execute({ sql, args: args as InArgs });
}

async function runMigrations(db: Client) {
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  );

  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  const appliedRows = await db.execute("SELECT name FROM migrations");
  const applied = new Set(appliedRows.rows.map((row) => String(row.name)));
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const hasLegacySchema =
    (
      await db.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'entities'",
      )
    ).rows.length > 0;

  for (const file of files) {
    if (applied.has(file)) continue;
    if (hasLegacySchema && file !== "011_library_schema.sql") {
      await execute(
        db,
        "INSERT OR IGNORE INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
        [file],
      );
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    await db.executeMultiple(sql);
    await execute(
      db,
      "INSERT INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
      [file],
    );
    console.log(`Applied migration: ${file}`);
  }
}

async function findEntity(
  db: Client,
  type: string,
  slug: string,
): Promise<EntityRow | null> {
  const result = await db.execute({
    sql: "SELECT id, slug, name FROM entities WHERE type = ? AND slug = ? LIMIT 1",
    args: [type, slug],
  });
  return (result.rows[0] as EntityRow | undefined) || null;
}

async function findSourceItem(
  db: Client,
  id: string,
): Promise<SourceItemRow | null> {
  const result = await db.execute({
    sql: "SELECT id, title FROM source_items WHERE id = ? LIMIT 1",
    args: [id],
  });
  return (result.rows[0] as SourceItemRow | undefined) || null;
}

async function writeDiagram(
  db: Client,
  seed: DiagramSeed,
  entity: EntityRow,
  sourceItem: SourceItemRow,
) {
  await execute(
    db,
    `INSERT INTO diagrams
      (id, entity_id, slug, title, diagram_type, svg, hotspots_json, source_note, license, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'site-original', 'draft', datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      entity_id = excluded.entity_id,
      slug = excluded.slug,
      title = excluded.title,
      diagram_type = excluded.diagram_type,
      svg = excluded.svg,
      hotspots_json = excluded.hotspots_json,
      source_note = excluded.source_note,
      license = excluded.license,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      seed.id,
      entity.id,
      seed.slug,
      seed.title,
      seed.diagramType,
      seed.svg,
      JSON.stringify(seed.hotspots),
      seed.sourceNote,
    ],
  );

  await execute(
    db,
    `INSERT INTO citations
      (id, target_type, target_id, source_item_id, note)
     VALUES (?, 'diagram', ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      source_item_id = excluded.source_item_id,
      note = excluded.note`,
    [
      `cite-${seed.id}-${sourceItem.id}`.slice(0, 160),
      seed.id,
      sourceItem.id,
      seed.citationNote,
    ],
  );
}

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  if (WRITE) await runMigrations(db);

  const seeds = DIAGRAM_SEEDS.slice(0, LIMIT);
  console.log(
    WRITE
      ? "Official model diagram import: write mode"
      : "Official model diagram import: dry run",
  );

  for (const seed of seeds) {
    const entity = await findEntity(db, "pen", seed.entitySlug);
    const sourceItem = await findSourceItem(db, seed.sourceItemId);

    if (!entity) {
      console.warn(`Skip ${seed.entitySlug}: model entity not found`);
      continue;
    }
    if (!sourceItem) {
      console.warn(`Skip ${seed.slug}: source item ${seed.sourceItemId} not found`);
      continue;
    }

    console.log(`${entity.name} -> ${seed.title} | ${sourceItem.title}`);
    if (WRITE) await writeDiagram(db, seed, entity, sourceItem);
  }

  if (!WRITE) {
    console.log("Dry run only. Re-run with --write to store diagrams.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
