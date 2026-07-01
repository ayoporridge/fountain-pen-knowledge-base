import { createClient, type Client, type InArgs } from "@libsql/client";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const USE_TURSO = process.argv.includes("--turso");
const FORCE_BRAND_STORIES = process.argv.includes("--force-brand-stories");
const REWRITE_LEGACY_BRAND_STORIES = process.argv.includes(
  "--rewrite-legacy-brand-stories",
);
const SKIP_BRAND_STORIES = process.argv.includes("--skip-brand-stories");
const TODAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
}).format(new Date());
const REPORT_PATH = path.join(
  process.cwd(),
  "docs/content",
  `public-library-surface-cleanup-${TODAY}.md`,
);

const WARM_ATLAS_DIR = path.join(
  process.cwd(),
  "public/images/library/warm-pen-atlas",
);
const WARM_ATLAS_PUBLIC_DIR = "/images/library/warm-pen-atlas";

const HIDDEN_ARTICLE_MARKERS = [
  "品牌资料索引",
  "品牌索引",
  "品牌泛称",
  "泛称页",
  "泛称引用",
  "不代表单一钢笔型号",
  "索引条目",
];

const HIDDEN_BRAND_SLUGS = new Set(["banju", "saier", "shanghai", "yongxu"]);

const POLLUTED_BRAND_RE =
  /适合从品牌背景|页面下方列出的资料|型号页会把|索引入口|来源缺口|后续补|先以|页面先以|公开检索资料|代表型号进入|先看品牌背景|用户口碑/;

type Row = Record<string, unknown>;

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  body_md?: string | null;
};

type StoryRow = {
  id: string;
  entity_id: string;
  title: string;
  summary: string | null;
  body_md: string;
  source_notes: string | null;
};

type ModelRow = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  nib: string | null;
  fill_system: string | null;
  material: string | null;
  price_range: string | null;
  release_year: string | null;
};

type SourceRow = {
  source_name: string;
  source_type: string;
  title: string;
};

type WarmAtlasImage = {
  file: string;
  imageUrl: string;
  localPath: string;
};

function loadEnv() {
  if (!USE_TURSO || !existsSync(".env.local")) return;
  const text = readFileSync(".env.local", "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function createDb() {
  loadEnv();
  if (USE_TURSO) {
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error("--turso requires TURSO_DATABASE_URL in .env.local");
    }
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function all<T extends Row>(
  db: Client,
  sql: string,
  args: unknown[] = [],
) {
  const result = await db.execute({ sql, args: args as InArgs });
  return result.rows as T[];
}

async function run(db: Client, sql: string, args: unknown[] = []) {
  if (!WRITE) return;
  await db.execute({ sql, args: args as InArgs });
}

function safeIdPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanSentence(value: string) {
  return value
    .replace(/\*\*/g, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstSentence(value: string | null | undefined) {
  const text = cleanSentence(String(value || ""));
  if (!text) return "";
  const match = text.match(/^(.{12,180}?[。！？!?])\s*/);
  const sentence = match ? match[1].trim() : text.slice(0, 120).trim();
  return sentence.replace(/[。！？!?]+$/, "");
}

function stripBadPublicPhrases(value: string) {
  return value
    .replace(/适合从品牌背景、代表型号和实际书写场景三条线一起看。?/g, "")
    .replace(/[^。]*代表型号进入：先看品牌背景，再看设计语言、上墨系统和用户口碑。?/g, "")
    .replace(/页面下方列出的资料主要来自/g, "可参考的公开资料包括")
    .replace(/型号页会把笔尖、上墨、材料和尺寸拆开；?/g, "")
    .replace(/品牌页则帮助你理解/g, "这些条目能帮助读者理解")
    .replace(/继续阅读时，可以优先看/g, "进一步判断时，先看")
    .replace(/公开检索资料/g, "公开资料")
    .replace(/\s+/g, " ")
    .trim();
}

function summaryLead(entity: EntityRow) {
  const summary = firstSentence(entity.summary);
  if (summary) {
    if (/品牌|制造商|公司|厂/.test(summary)) {
      return `${entity.name} 是${summary}。`;
    }
    return `${entity.name} 的公开资料里，最先能确认的是：${summary}。`;
  }
  return `${entity.name} 目前保留为钢笔资料馆里的品牌房间。`;
}

function extractLead(story: StoryRow, entity: EntityRow) {
  if (String(story.source_notes || "").includes("已改写为读者可直接阅读")) {
    return summaryLead(entity);
  }

  const candidates = story.body_md
    .split(/\n+/)
    .flatMap((para) => para.split(/(?<=。)/))
    .map(stripBadPublicPhrases)
    .map(cleanSentence)
    .filter((line) => line.length >= 18)
    .filter((line) => !POLLUTED_BRAND_RE.test(line))
    .filter((line) => !line.includes("Public web research index"))
    .filter((line) => !line.includes("公开资料里目前最有用的一条"))
    .filter((line) => !line.includes("现有资料主要是公开检索入口"))
    .filter((line) => !line.includes("馆内已经整理"))
    .filter((line) => !line.includes("馆内暂时"))
    .filter((line) => !line.includes("这些型号放在一起"))
    .filter((line) => !line.includes("真正选择"))
    .filter((line) => !line.includes("遇到写着"))
    .filter((line) => !line.includes("来源卡片"))
    .filter((line) => !line.includes("品牌名只能解决"))
    .filter((line) => !line.startsWith("- "))
    .filter((line) => !line.includes("日用购买"))
    .filter((line) => !line.includes("如果你是普通用户"));

  const lead = candidates[0];
  if (!lead) {
    return summaryLead(entity);
  }

  return lead
    .replace(/(.+?)的品牌阅读入口是/, "$1最容易被记住的线索是")
    .replace(/(.+?)的品牌入口是/, "$1可以先看")
    .replace(/作为入口/, "读起")
    .replace(/为入口/, "读起");
}

function sourceSentence(sources: SourceRow[]) {
  if (sources.length === 0) return "";
  const official = sources.find((source) => source.source_type === "official");
  const professional = sources.find((source) =>
    ["blog", "wikimedia", "book", "patent"].includes(source.source_type),
  );
  const picked = official || professional || sources[0];
  if (picked.source_type === "user_submission") {
    return "现有资料主要是公开检索入口，适合用来确认名称、关联型号和进一步查证方向。";
  }
  const label =
    picked.source_type === "official"
      ? "官方资料"
      : picked.source_type === "blog"
        ? "专业资料"
        : picked.source_type === "retailer"
          ? "经销商资料"
          : "公开资料";
  return `${label}里目前最有用的一条，是 ${picked.source_name} 的《${picked.title}》。`;
}

function modelFeature(model: ModelRow) {
  const summary = firstSentence(model.summary);
  const specs = [
    model.nib ? `笔尖记录为${model.nib}` : "",
    model.fill_system ? `上墨方式为${model.fill_system}` : "",
    model.material ? `材料线索是${model.material}` : "",
    model.release_year ? `年份线索是${model.release_year}` : "",
  ].filter(Boolean);

  const detail = summary || specs.join("，") || "馆内已有基础型号记录";
  return `**${model.name}**：${detail}`;
}

function buildBrandCopy({
  entity,
  story,
  models,
  sources,
}: {
  entity: EntityRow;
  story: StoryRow;
  models: ModelRow[];
  sources: SourceRow[];
}) {
  const lead = extractLead(story, entity);
  const sourceLine = sourceSentence(sources);
  const visibleModels = models.slice(0, 6);
  const modelNames = visibleModels.map((model) => model.name);

  const title =
    modelNames.length > 0
      ? `${entity.name}：从${modelNames.slice(0, 2).join("、")}读起`
      : `${entity.name}：从公开资料读品牌线索`;

  const summary =
    modelNames.length > 0
      ? `${entity.name} 的品牌馆以 ${modelNames.slice(0, 3).join("、")} 为入口，帮助读者理解品牌定位、代表型号和使用差异。`
      : `${entity.name} 的品牌馆先整理可确认的公开资料，帮助读者分清品牌名、产品线索和后续可查的具体型号。`;

  const firstPara = `${lead} ${
    sourceLine ||
    "现阶段更可靠的读法，是把品牌名、具体型号和实物资料放在一起看。"
  }`.trim();

  const modelPara =
    visibleModels.length > 0
      ? `馆内已经整理出的代表型号可以这样读：\n\n${visibleModels
          .map(modelFeature)
          .map((line) => `- ${line}`)
          .join("\n")}\n\n这些型号放在一起，读者能看出 ${entity.name} 在外观、笔尖、上墨方式和价格区间上的主要分布。`
      : `馆内暂时没有把它拆成具体钢笔型号。遇到写着 ${entity.name} 的实物或商品页时，先核对笔帽刻字、笔尖标识、包装名称和卖家给出的型号，再回到来源卡片确认它到底是品牌名、系列名，还是某个市场里的销售名称。`;

  const buyingPara = `真正选择 ${entity.name} 时，品牌名只能解决第一步。日用购买要看具体型号的笔尖、供墨、重量和耗材；收藏或二手交易还要看版本、盒证、成色和来源是否说得清楚。资料少的型号可以短一点读，但零散传闻不能当成确定历史。`;

  return {
    title,
    summary,
    body: [firstPara, modelPara, buyingPara].join("\n\n"),
  };
}

function getWarmAtlasImages() {
  return readdirSync(WARM_ATLAS_DIR)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
    .sort()
    .map((name) => ({
      file: name,
      imageUrl: `${WARM_ATLAS_PUBLIC_DIR}/${name}`,
      localPath: `public/images/library/warm-pen-atlas/${name}`,
    }));
}

function sourceItemIdForImage(image: WarmAtlasImage) {
  return `source-warm-pen-atlas-${safeIdPart(image.file.replace(/\.[^.]+$/, ""))}`;
}

function pickImage(
  images: WarmAtlasImage[],
  entity: EntityRow,
  index: number,
) {
  const preferred =
    entity.type === "concept" || entity.type === "fill_system"
      ? images.find((image) => image.file.includes("mechanism"))
      : entity.type === "nib"
        ? images.find((image) => image.file.includes("library-hero"))
        : null;
  return preferred || images[index % images.length];
}

async function ensureWarmAtlasSourceItem(db: Client, image: WarmAtlasImage) {
  await run(
    db,
    `INSERT INTO source_registry
     (id, name, source_type, allowed_use, reliability, license, attribution,
      homepage_url, fetch_method, notes, last_checked_at, created_at, updated_at)
     VALUES ('warm-pen-atlas-generated', 'Warm Pen Atlas generated artwork',
      'user_submission', 'store_full', 'medium', 'site-original',
      'Project editorial direction with OpenAI image generation',
      '/library/media', 'generated_then_curated',
      'Site-original bitmap illustrations in the Warm Pen Atlas style.',
      ?, datetime('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      updated_at = datetime('now'),
      last_checked_at = excluded.last_checked_at`,
    [TODAY],
  );

  const sourceItemId = sourceItemIdForImage(image);
  await run(
    db,
    `INSERT INTO source_items
     (id, source_id, title, url, item_type, license, author, published_at,
      retrieved_at, summary, raw_metadata_json, allowed_use, review_status,
      created_at, updated_at)
     VALUES (?, 'warm-pen-atlas-generated', ?, ?, 'site_original_image',
      'site-original', 'Project editorial direction with OpenAI image generation',
      NULL, ?, ?, NULL, 'store_full', 'approved', datetime('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      url = excluded.url,
      license = excluded.license,
      author = excluded.author,
      retrieved_at = excluded.retrieved_at,
      summary = excluded.summary,
      allowed_use = excluded.allowed_use,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      sourceItemId,
      `Warm Pen Atlas: ${image.file.replace(/\.[^.]+$/, "")}`,
      image.imageUrl,
      TODAY,
      `Site-original Warm Pen Atlas card artwork: ${image.file}.`,
    ],
  );
  return sourceItemId;
}

async function assignCardImages(db: Client) {
  const images = getWarmAtlasImages();
  if (images.length === 0) {
    throw new Error("No warm-pen-atlas images found");
  }

  const entities = await all<EntityRow>(
    db,
    `SELECT e.id, e.type, e.slug, e.name, e.summary
     FROM entities e
     WHERE e.type IN ('article', 'concept', 'fill_system', 'nib')
       AND NOT EXISTS (
         SELECT 1
         FROM media_assets ma
         WHERE ma.entity_id = e.id
           AND ma.asset_type = 'image'
           AND ma.image_url IS NOT NULL
           AND ma.review_status = 'approved'
           AND ma.usage_status IN ('primary', 'gallery')
       )
     ORDER BY e.type, e.slug`,
  );

  let index = 0;
  for (const entity of entities) {
    const image = pickImage(images, entity, index);
    index += 1;
    const id = `warm-pen-atlas-card-${entity.type}-${safeIdPart(entity.slug)}`;
    const sourceItemId = await ensureWarmAtlasSourceItem(db, image);
    await run(
      db,
      `INSERT INTO media_assets
       (id, entity_id, title, asset_type, image_url, thumbnail_url, local_path,
        author, license, attribution_text, source_url, source_item_id,
        review_status, usage_status, created_at, updated_at)
       VALUES (?, ?, ?, 'image', ?, NULL, ?, 'OpenAI image generation',
        'site-original', '站内生成图，用于馆藏卡片视觉占位。', ?, ?,
        'approved', 'primary', datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
        entity_id = excluded.entity_id,
        title = excluded.title,
        image_url = excluded.image_url,
        local_path = excluded.local_path,
        attribution_text = excluded.attribution_text,
        source_url = excluded.source_url,
        source_item_id = excluded.source_item_id,
        review_status = 'approved',
        usage_status = 'primary',
        updated_at = datetime('now')`,
      [
        id,
        entity.id,
        `Warm Pen Atlas: ${entity.name} 卡片图`,
        image.imageUrl,
        image.localPath,
        image.imageUrl,
        sourceItemId,
      ],
    );
  }

  return entities.length;
}

async function repairGeneratedMediaSourceLinks(db: Client) {
  const images = getWarmAtlasImages();
  const byUrl = new Map(images.map((image) => [image.imageUrl, image]));
  const rows = await all<{ image_url: string; cnt: number }>(
    db,
    `SELECT image_url, COUNT(*) as cnt
     FROM media_assets
     WHERE id LIKE 'warm-pen-atlas-card-%'
       AND source_item_id IS NULL
       AND image_url IS NOT NULL
     GROUP BY image_url
     ORDER BY image_url`,
  );

  let repaired = 0;
  for (const row of rows) {
    const image = byUrl.get(String(row.image_url || ""));
    if (!image) continue;
    const sourceItemId = await ensureWarmAtlasSourceItem(db, image);
    await run(
      db,
      `UPDATE media_assets
       SET source_item_id = ?, source_url = ?, updated_at = datetime('now')
       WHERE id LIKE 'warm-pen-atlas-card-%'
         AND source_item_id IS NULL
         AND image_url = ?`,
      [sourceItemId, image.imageUrl, image.imageUrl],
    );
    repaired += Number(row.cnt || 0);
  }
  return repaired;
}

async function getBrandModels(db: Client, brandId: string) {
  const linked = await all<ModelRow>(
    db,
    `SELECT DISTINCT p.id, p.slug, p.name, p.summary,
            ms.nib, ms.fill_system, ms.material, ms.price_range, ms.release_year
     FROM entity_links el
     JOIN entities p ON (
       (el.source_id = ? AND p.id = el.target_id)
       OR (el.target_id = ? AND p.id = el.source_id)
     )
     LEFT JOIN model_specs ms ON ms.entity_id = p.id
     WHERE p.type = 'pen'
       AND el.link_type != 'reverse'
     ORDER BY p.name`,
    [brandId, brandId],
  );

  const bySpec = await all<ModelRow>(
    db,
    `SELECT DISTINCT p.id, p.slug, p.name, p.summary,
            ms.nib, ms.fill_system, ms.material, ms.price_range, ms.release_year
     FROM model_specs ms
     JOIN entities p ON p.id = ms.entity_id
     WHERE ms.brand_entity_id = ?
       AND p.type = 'pen'
     ORDER BY p.name`,
    [brandId],
  );

  const deduped = new Map<string, ModelRow>();
  for (const model of [...linked, ...bySpec]) {
    deduped.set(model.id, model);
  }
  return [...deduped.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function getBrandSources(db: Client, brandId: string) {
  return all<SourceRow>(
    db,
    `SELECT sr.name as source_name, sr.source_type, si.title
     FROM entity_references er
     JOIN source_items si ON si.id = er.source_item_id
     JOIN source_registry sr ON sr.id = si.source_id
     WHERE er.entity_id = ?
     ORDER BY
       CASE sr.source_type
         WHEN 'official' THEN 0
         WHEN 'blog' THEN 1
         WHEN 'wikimedia' THEN 2
         WHEN 'retailer' THEN 3
         ELSE 4
       END,
       sr.name,
       si.title`,
    [brandId],
  );
}

async function rewriteBrandStories(db: Client) {
  const rows = await all<EntityRow & StoryRow>(
    db,
    `SELECT e.id, e.type, e.slug, e.name, e.summary, e.body_md,
            s.id as story_id, s.entity_id, s.title, s.summary as story_summary,
            s.body_md as story_body, s.source_notes
     FROM entities e
     JOIN stories s ON s.entity_id = e.id AND s.story_type = 'brand_story'
     WHERE e.type = 'brand'
     ORDER BY e.slug`,
  );

  const rewritten: string[] = [];
  for (const row of rows) {
    if (HIDDEN_BRAND_SLUGS.has(row.slug)) continue;
    const story = {
      id: String(row.story_id),
      entity_id: String(row.entity_id),
      title: String(row.title),
      summary: row.story_summary ? String(row.story_summary) : null,
      body_md: String(row.story_body || ""),
      source_notes: row.source_notes ? String(row.source_notes) : null,
    };

    const shouldRewrite =
      FORCE_BRAND_STORIES ||
      POLLUTED_BRAND_RE.test(
        `${story.title}\n${story.summary || ""}\n${story.body_md}`,
      ) ||
      String(story.source_notes || "").includes("已改写为读者可直接阅读");

    if (!shouldRewrite) {
      continue;
    }

    const entity = {
      id: String(row.id),
      type: String(row.type),
      slug: String(row.slug),
      name: String(row.name),
      summary: row.summary ? String(row.summary) : null,
      body_md: row.body_md ? String(row.body_md) : null,
    };
    const [models, sources] = await Promise.all([
      getBrandModels(db, entity.id),
      getBrandSources(db, entity.id),
    ]);
    const copy = buildBrandCopy({ entity, story, models, sources });

    await run(
      db,
      `UPDATE stories
       SET title = ?, summary = ?, body_md = ?,
           source_notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        copy.title,
        copy.summary,
        copy.body,
        "已改写为读者可直接阅读的品牌介绍；事实范围限定在馆内来源、代表型号和已登记规格内。",
        story.id,
      ],
    );
    rewritten.push(`${entity.slug}｜${entity.name}｜${models.length} 个代表型号`);
  }

  return rewritten;
}

async function findHiddenArticles(db: Client) {
  const where = HIDDEN_ARTICLE_MARKERS.map(
    () =>
      "(COALESCE(name, '') LIKE ? OR COALESCE(summary, '') LIKE ? OR COALESCE(body_md, '') LIKE ?)",
  ).join(" OR ");
  const args = HIDDEN_ARTICLE_MARKERS.flatMap((marker) => [
    `%${marker}%`,
    `%${marker}%`,
    `%${marker}%`,
  ]);
  return all<EntityRow>(
    db,
    `SELECT id, type, slug, name, summary
     FROM entities
     WHERE type = 'article'
       AND (${where})
     ORDER BY slug`,
    args,
  );
}

async function main() {
  const db = createDb();
  try {
    const [hiddenArticles, cardImageCount, rewrittenBrands] = await Promise.all(
      [
        findHiddenArticles(db),
        assignCardImages(db),
        SKIP_BRAND_STORIES || !REWRITE_LEGACY_BRAND_STORIES
          ? Promise.resolve([])
          : rewriteBrandStories(db),
      ],
    );
    const repairedMediaLinks = await repairGeneratedMediaSourceLinks(db);

    const report = [
      `# Public Library Surface Cleanup (${TODAY})`,
      "",
      `- database: ${USE_TURSO ? "turso" : "local"}`,
      `- mode: ${WRITE ? "write" : "dry-run"}`,
      `- index-like articles filtered from public UI: ${hiddenArticles.length}`,
      `- generated card images assigned: ${cardImageCount}`,
      `- generated media source links repaired: ${repairedMediaLinks}`,
      `- brand stories rewritten: ${rewrittenBrands.length}`,
      `- legacy brand story rewrite enabled: ${REWRITE_LEGACY_BRAND_STORIES ? "yes" : "no"}`,
      "",
      "## Hidden article URLs",
      "",
      ...hiddenArticles.map((item) => `- /article/${item.slug} — ${item.name}`),
      "",
      "## Hidden brand URLs",
      "",
      ...[...HIDDEN_BRAND_SLUGS].map((slug) => `- /brand/${slug}`),
      "",
      "## Rewritten brand stories",
      "",
      ...(rewrittenBrands.length > 0
        ? rewrittenBrands.map((item) => `- ${item}`)
        : ["- None"]),
      "",
    ].join("\n");

    if (WRITE && !USE_TURSO) {
      mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
      writeFileSync(REPORT_PATH, report);
    }

    console.log(
      JSON.stringify(
        {
          database: USE_TURSO ? "turso" : "local",
          mode: WRITE ? "write" : "dry-run",
          hiddenArticles: hiddenArticles.length,
          cardImageCount,
          repairedMediaLinks,
          rewrittenBrandCount: rewrittenBrands.length,
          reportPath: WRITE && !USE_TURSO ? REPORT_PATH : null,
        },
        null,
        2,
      ),
    );
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
