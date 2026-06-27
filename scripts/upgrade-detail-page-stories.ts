import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");
const FORCE = process.argv.includes("--force");

type EntityType = "brand" | "pen";

type StoryRow = {
  storyId: string;
  storyType: string;
  title: string;
  summary: string | null;
  bodyMd: string;
  status: string;
  entityId: string;
  entityType: EntityType;
  slug: string;
  name: string;
  entitySummary: string | null;
};

type SourceInfo = {
  title: string;
  itemType: string;
  sourceName: string;
  sourceType: string;
};

type ModelSpec = {
  seriesName: string | null;
  releaseYear: string | null;
  originCountry: string | null;
  nib: string | null;
  fillSystem: string | null;
  material: string | null;
  dimensions: string | null;
  weight: string | null;
  priceRange: string | null;
  status: string | null;
  brandId: string | null;
  brandName: string | null;
  brandSlug: string | null;
};

type RelatedEntity = {
  id: string;
  type: string;
  slug: string;
  name: string;
  linkType: string | null;
};

type TagInfo = {
  name: string;
  slug: string;
  dimension: string;
};

const BAD_COPY_PATTERN =
  /^把|这一页是一个|索引入口|方便读者确认|公开来源没有直接支撑|未由来源支撑|名称与已知线索|名称边界和已知线索|来源缺口|研究入口|资料缺口|缺口|待核验|需核验|核验|待补|待拆分|待重分类|待合并|待别名|当前档案|当前页面|当前草稿|后续应|后续补|下一步应|不把.+写成|写成确定事实|只建立|先建立|可以先放在|规格暂用|等待官网|等待产品页|等待独立|证据边界|来源边界|队列|做成|放进|拆成|整理成|反推|适合从名称、关系|名称、关系和公开资料|不适合按单一型号|作为型号入口|作为.*研究页|研究页|需要.*来源|需要.*确认|需要.*复核|来源支撑|来源归因|复核|归因|档案|围绕.*组织|currently needs|verified facts|direct product|review sources|library treats|value claims|research-queue|public-web research index|merge into|split into|candidate|identity pending|brand[- ]?generic|retractable entry|artwork|分开阅读|按类型区分|型号 的定位|系列：型号|笔身材质|等 理解|、等|；。|：\/|产品线 里|产品线 中|线索|二级来源|\bentry\b/;

const UNSUITABLE_READER_SUMMARY =
  /块钱|觉得|口碑|圈里|入坑|体验装|链接|可作为|可以作为|应把|后续|提示|来源|待补|核验|线索|没有直接支撑|公开来源|Agent/i;

const INTERNAL_PHRASES = [
  /这一页是一个[^。]*。?/g,
  /页面把名称[^。]*。?/g,
  /公开来源没有直接支撑[^。]*。?/g,
  /阅读顺序很简单[^。]*。?/g,
  /未由来源支撑[^。]*。?/g,
  /只展示已有来源能支持的信息/g,
  /规格以可靠来源为准，规格以可靠来源为准/g,
  /真实书写体验书写体验/g,
  /后续应[^。]*。?/g,
  /下一步应[^。]*。?/g,
  /等待官网[^。]*。?/g,
  /等待产品页[^。]*。?/g,
  /等待独立[^。]*。?/g,
  /待核验/g,
  /需核验/g,
  /待补来源/g,
  /研究队列/g,
  /资料补证/g,
  /来源缺口/g,
];

const GENERIC_SPEC_VALUES = new Set([
  "型号",
  "笔尖",
  "上墨",
  "上墨方式",
  "材料",
  "笔身材质",
  "价位",
  "尺寸",
  "重量",
  "取决于搭载笔款",
  "不适合按单一笔款填写",
]);

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

function normalizeWhitespace(text: string) {
  return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function stripMarkdownLinks(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`>]/g, "")
    .trim();
}

function cleanText(value: string | null | undefined) {
  if (!value) return "";

  let text = stripMarkdownLinks(value);
  for (const phrase of INTERNAL_PHRASES) {
    text = text.replace(phrase, "");
  }

  text = text
    .replace(/品牌馆以/g, "可以从")
    .replace(/页面以/g, "可以从")
    .replace(/档案以/g, "可以从")
    .replace(/档案围绕/g, "围绕")
    .replace(/记录官网能支撑的/g, "看")
    .replace(/谨慎入口/g, "入口")
    .replace(/谨慎对照/g, "对照")
    .replace(/作为 collection 级档案处理/g, "可以按系列阅读")
    .replace(/作为 cautiously sourced/g, "作为")
    .replace(/保留型号入口/g, "适合作为型号入口")
    .replace(/保留名称、关系和公开来源线索/g, "适合从名称、关系和公开资料入手")
    .replace(/标出品牌主体、型号参数和/g, "连接品牌主体和型号信息")
    .replace(/identity pending/gi, "")
    .replace(/hooded-nib line/gi, "暗尖系列")
    .replace(/vacuum filler/gi, "负压上墨")
    .replace(/capless/gi, "按动钢笔")
    .replace(/retractable/gi, "按动钢笔")
    .replace(/brand[- ]?generic entry/gi, "")
    .replace(/brandgeneric entry/gi, "")
    .replace(/artwork identity pending/gi, "")
    .replace(/artwork/gi, "图案主题")
    .replace(/retractable entry/gi, "按动钢笔")
    .replace(/\bentry\b/gi, "")
    .replace(/public-web research index/gi, "公开资料")
    .replace(/（官方[^）]*具体型号搭配）/g, "（搭配具体型号）")
    .replace(/（官方[^）]*具体尖号）/g, "（具体尖号随版本变化）")
    .replace(/（官方[^）]*配件兼容）/g, "（配件兼容随版本变化）")
    .replace(/官方[^，。；）]*口径，?/g, "")
    .replace(/具体型号搭配/g, "搭配具体型号")
    .replace(/Merge into[^。；;]*/gi, "")
    .replace(/Split into[^。；;]*/gi, "")
    .replace(/candidate/gi, "")
    .replace(/不适合按单一型号填写/g, "")
    .replace(/不适合按单一笔款填写/g, "")
    .replace(/身份分开阅读/g, "版本关系")
    .replace(/按类型区分/g, "")
    .replace(/分开阅读/g, "")
    .replace(/具体型号\/?/g, "")
    .replace(/分开阅读型号/g, "")
    .replace(/待确认/g, "")
    .replace(/需以[^；。,.，]*/g, "")
    .replace(/需要[^；。,.，]*/g, "")
    .replace(/核验/g, "确认")
    .replace(/线索/g, "")
    .replace(/证据边界/g, "资料范围")
    .replace(/来源边界/g, "资料范围")
    .replace(/品牌层面，/g, "品牌层面")
    .replace(/（?[^（）]*二级来源[^（）]*）?/g, "")
    .replace(/（）/g, "")
    .replace(/\(\)/g, "")
    .replace(/；/g, "；")
    .replace(/^；\s*/g, "")
    .replace(/，。/g, "。")
    .replace(/；。/g, "。")
    .replace(/[；;]\s*$/g, "")
    .replace(/：名称与已知线索/g, "")
    .replace(/：名称边界和已知线索/g, "")
    .replace(/\s+\/\s*$/g, "")
    .replace(/^\s*\/\s*/g, "")
    .replace(/([^/，、；。]+)\s*\/\s*\1/g, "$1")
    .replace(/\s*\/\s*的定位/g, "的定位")
    .replace(/\/\s*的定位/g, "的定位")
    .replace(/\s+里的/g, "里的")
    .replace(/\s+中的/g, "中的")
    .replace(/\s+中/g, "中")
    .replace(/\s+/g, " ")
    .trim();

  return normalizeWhitespace(text);
}

function displayName(value: string) {
  return cleanText(value).replace(/\s*[—-]\s*$/, "").trim() || cleanText(value) || value;
}

function isUsableSentence(text: string) {
  return (
    text.length >= 24 &&
    !BAD_COPY_PATTERN.test(text) &&
    !UNSUITABLE_READER_SUMMARY.test(text)
  );
}

function firstUsableSentence(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const cleaned = cleanText(value);
    const first = cleaned
      .split(/(?<=[。！？.!?])\s*/)
      .find((sentence) => isUsableSentence(sentence));
    if (first) return first;
  }

  return "";
}

function joinChinese(items: string[], limit = 5) {
  const cleaned = [...new Set(items.map((item) => cleanText(item)).filter(Boolean))];
  if (cleaned.length === 0) return "";
  return cleaned.slice(0, limit).join("、");
}

function sourcePhrase(sources: SourceInfo[]) {
  if (sources.length === 0) {
    return "";
  }

  const official = sources.filter(
    (source) =>
      source.sourceType === "official" || source.itemType.startsWith("official"),
  );
  const specialist = sources.filter(
    (source) =>
      source.sourceType !== "official" &&
      /reference|history|review|profile|blog|forum|collector|wikidata|patent/i.test(
        `${source.itemType} ${source.sourceType}`,
      ),
  );

  const sourceNames = (items: SourceInfo[]) =>
    items.map((source) =>
      source.sourceName === "Public web research index"
        ? "公开检索资料"
        : source.sourceName,
    );

  const officialNames = joinChinese(
    sourceNames(official),
    3,
  );
  const specialistNames = joinChinese(
    sourceNames(specialist),
    3,
  );

  if (officialNames && specialistNames) {
    return `官方资料（${officialNames}）和专业资料/评测（${specialistNames}）`;
  }
  if (officialNames) return `官方资料（${officialNames}）`;
  if (specialistNames) return `专业资料、评测或收藏资料（${specialistNames}）`;

  return joinChinese(
    sources.map((source) =>
      source.sourceName === "Public web research index"
        ? "公开检索资料"
        : source.sourceName || source.title,
    ),
    4,
  );
}

function sourceGuidance(sources: SourceInfo[]) {
  const label = sourcePhrase(sources);
  if (!label) return "";

  return `页面下方列出的资料主要来自${label}。继续阅读时，可以优先看来源里的产品图片、规格表、评测细节和收藏资料，再结合自己的使用场景判断版本、价格和成色。`;
}

function titleFor(row: StoryRow, spec: ModelSpec | null) {
  const cleaned = cleanText(row.title);
  if (cleaned && !BAD_COPY_PATTERN.test(row.title)) return cleaned;
  const name = displayName(row.name);

  if (row.entityType === "brand") {
    return `${name}：品牌脉络与代表型号`;
  }

  const series = cleanText(spec?.seriesName || "");
  if (
    series &&
    !GENERIC_SPEC_VALUES.has(series) &&
    !BAD_COPY_PATTERN.test(series) &&
    !name.includes(series)
  ) {
    return `${name}：${series} 的定位与使用场景`;
  }

  return `${name}：结构、定位与使用场景`;
}

function brandSummary(row: StoryRow, models: RelatedEntity[], sources: SourceInfo[]) {
  const name = displayName(row.name);
  const existing = firstUsableSentence(row.summary, row.entitySummary);
  if (existing) return existing;

  const modelNames = joinChinese(
    models.filter((model) => model.type === "pen").map((model) => model.name),
    3,
  );
  if (modelNames) {
    return `${name} 可以从 ${modelNames} 等代表型号进入：先看品牌背景，再看设计语言、上墨系统和用户口碑。`;
  }

  const sourcesLabel = sourcePhrase(sources);
  if (sourcesLabel) {
    return `${name} 可以从已登记的${sourcesLabel}进入，适合先了解品牌背景、常见型号和资料出处。`;
  }

  return `${name} 适合先从品牌名称、相关型号和书写工具类别入手，逐步了解它在钢笔资料中的位置。`;
}

function specHighlights(spec: ModelSpec | null) {
  if (!spec) return [];

  const pairs: Array<[string, string | null]> = [
    ["系列", spec.seriesName],
    ["年份/时期", spec.releaseYear],
    ["产地", spec.originCountry],
    ["笔尖", spec.nib],
    ["上墨", spec.fillSystem],
    ["材质", spec.material],
    ["尺寸", spec.dimensions],
    ["重量", spec.weight],
    ["价位", spec.priceRange],
    ["状态", spec.status],
  ];

  return pairs
    .map(([label, value]) => {
      const cleaned = cleanText(value);
      if (label === "价位" && /^\d+$/.test(cleaned)) return "";
      if (
        label === "状态" &&
        /可能|复核|核验|重分类|拆为|供应.*不明/.test(cleaned)
      ) {
        return "";
      }
      if (GENERIC_SPEC_VALUES.has(cleaned)) return "";
      if (!cleaned || BAD_COPY_PATTERN.test(cleaned)) return "";
      return `${label}：${cleaned}`;
    })
    .filter(Boolean);
}

function nibTaxonomySentence(tags: TagInfo[]) {
  const materials = joinChinese(
    tags
      .filter((tag) => tag.dimension === "nib_material")
      .map((tag) => tag.name),
    4,
  );
  const types = joinChinese(
    tags.filter((tag) => tag.dimension === "nib_type").map((tag) => tag.name),
    5,
  );

  if (!materials && !types) return "";

  const parts = [];
  if (materials) {
    parts.push(`材质上可以先看 ${materials}`);
  }
  if (types) {
    parts.push(`形态或研磨上可以先看 ${types}`);
  }

  return `笔尖信息建议分两层读：${parts.join("；")}。材质更多影响反馈、耐用和维护成本，形态与研磨则会直接改变线宽、顺滑度、入纸角度和适合的书写场景。`;
}

function specNibReading(spec: ModelSpec | null) {
  const nib = cleanText(spec?.nib || "");
  if (!nib || GENERIC_SPEC_VALUES.has(nib) || BAD_COPY_PATTERN.test(nib)) {
    return "";
  }

  if (/笔尖规格|尖号|规格/.test(nib)) {
    return "这页目前适合把笔尖当作版本识别信息：先确认明尖、暗尖、嵌入式或可换尖系统，再到来源页核对具体尖号。";
  }

  return `规格里的笔尖描述是“${nib}”。阅读时不要只看一个尖号：同一型号在不同年份、地区或版本里，可能会同时出现不同材质、宽度和调校。`;
}

function modelSummary(row: StoryRow, spec: ModelSpec | null, brand: RelatedEntity | null) {
  const name = displayName(row.name);
  const highlights = specHighlights(spec);
  if (highlights.length > 0) {
    return `${name} 的重点在于${joinChinese(highlights, 3)}。`;
  }

  const existing = firstUsableSentence(row.entitySummary, row.summary);
  if (existing) return existing;

  if (brand) {
    return `${name} 可以放在 ${displayName(brand.name)} 的产品线中理解，重点看外形、笔尖、上墨方式和实际使用场景。`;
  }

  return `${name} 适合从名称、外形、笔尖和上墨方式入手理解，再和相近型号放在一起比较。`;
}

function brandBody(
  row: StoryRow,
  models: RelatedEntity[],
  sources: SourceInfo[],
) {
  const name = displayName(row.name);
  const summary = brandSummary(row, models, sources);
  const modelNames = joinChinese(
    models.filter((model) => model.type === "pen").map((model) => model.name),
    8,
  );
  const sourcesLabel = sourcePhrase(sources);

  const paragraphs = [
    `**${name}** 适合从品牌背景、代表型号和实际书写场景三条线一起看。${summary}`,
  ];

  if (modelNames) {
    paragraphs.push(
      `如果你是普通用户，最容易进入这个品牌的方式，是先看它和 ${modelNames} 这些条目的关系。型号页会把笔尖、上墨、材料和尺寸拆开；品牌页则帮助你理解这些型号为什么会被放在同一条产品线或历史脉络里。`,
    );
  } else {
    paragraphs.push(
      `如果你只是想快速判断这个品牌，先看它的名称、所属地区、常见产品类型和下方来源；再顺着关联条目去比较具体型号。冷门品牌的资料往往分散在目录、论坛、评测和收藏页面里，单看一个搜索结果很容易误判。`,
    );
  }

  if (sourcesLabel) {
    paragraphs.push(
      sourceGuidance(sources),
    );
  } else {
    paragraphs.push(
      `继续深入时，建议把这个品牌和同名型号、相近中文译名一起检索。中文旧品牌、出口品牌和现代复兴品牌经常会出现重名或别名，确认包装、笔帽刻字和产品目录比只看名称更可靠。`,
    );
  }

  return paragraphs.join("\n\n");
}

function modelBody(
  row: StoryRow,
  spec: ModelSpec | null,
  brand: RelatedEntity | null,
  siblings: RelatedEntity[],
  variants: string[],
  sources: SourceInfo[],
  nibTags: TagInfo[],
) {
  const name = displayName(row.name);
  const summary = modelSummary(row, spec, brand);
  const highlights = specHighlights(spec);
  const siblingNames = joinChinese(siblings.map((entity) => entity.name), 5);
  const variantNames = joinChinese(variants, 4);
  const sourcesLabel = sourcePhrase(sources);
  const nibTaxonomy = nibTaxonomySentence(nibTags);
  const nibReading = specNibReading(spec);

  const route = [
    cleanText(spec?.seriesName || ""),
    cleanText(spec?.fillSystem || ""),
    cleanText(spec?.nib || ""),
  ].filter((item) => item && !GENERIC_SPEC_VALUES.has(item));
  const routeText = joinChinese(route, 4);
  const brandText = brand ? `${displayName(brand.name)} 的产品线` : "同类钢笔";

  const paragraphs = [
    `**${name}** 最值得先看的，是它在 ${brandText}中的位置${routeText ? `，以及 ${routeText}` : ""}。${summary}`,
  ];

  if (highlights.length > 0) {
    paragraphs.push(
      `从使用角度看，最值得先看的信息是 ${joinChinese(highlights, 6)}。这些点会直接影响握持重量、日常维护、储墨量、适合的纸张和它更偏日用还是收藏。`,
    );
  } else {
    paragraphs.push(
      `从使用角度看，可以先观察四件事：笔尖形态、上墨方式、笔身材料和尺寸重量。它们比单纯的型号名更能说明这支笔适合长写、随身携带、练字，还是作为收藏和机制样本。`,
    );
  }

  if (nibTaxonomy || nibReading) {
    paragraphs.push([nibTaxonomy, nibReading].filter(Boolean).join(" "));
  }

  if (variantNames || siblingNames) {
    const comparisons = [
      variantNames ? `常见版本/支线包括 ${variantNames}` : "",
      siblingNames ? `同品牌或相近条目可以和 ${siblingNames} 放在一起比较` : "",
    ].filter(Boolean);

    paragraphs.push(
      `${comparisons.join("；")}。如果你在考虑购买、收藏或查历史，建议把这些页面一起打开看：它们通常能解释为什么同一个品牌会有不同的上墨系统、尺寸、材料或价位。`.replace(
        /等\s+放在/g,
        "等放在",
      ),
    );
  }

  if (sourcesLabel) {
    paragraphs.push(
      sourceGuidance(sources),
    );
  } else {
    paragraphs.push(
      `如果下方来源较少，阅读时可以先把它当作一个辨认入口：确认品牌、系列名和外观特征，再用这些关键词去找包装、说明书、目录图或长期评测。`,
    );
  }

  return paragraphs.join("\n\n");
}

async function getStories(db: Client) {
  return execute<StoryRow>(
    db,
    `SELECT
       s.id AS storyId,
       s.story_type AS storyType,
       s.title,
       s.summary,
       s.body_md AS bodyMd,
       s.status,
       e.id AS entityId,
       e.type AS entityType,
       e.slug,
       e.name,
       e.summary AS entitySummary
     FROM stories s
     JOIN entities e ON e.id = s.entity_id
     WHERE e.type IN ('brand', 'pen')
     ORDER BY e.type, e.slug`,
  );
}

async function getSources(db: Client, row: StoryRow, brandId?: string | null) {
  return execute<SourceInfo>(
    db,
    `SELECT DISTINCT si.title, si.item_type AS itemType, sr.name AS sourceName, sr.source_type AS sourceType
     FROM source_items si
     JOIN source_registry sr ON sr.id = si.source_id
     WHERE si.id IN (
       SELECT source_item_id FROM citations WHERE source_item_id IS NOT NULL AND target_type = 'story' AND target_id = ?
       UNION
       SELECT source_item_id FROM citations WHERE source_item_id IS NOT NULL AND target_type = 'entity' AND target_id = ?
       UNION
       SELECT source_item_id FROM claims WHERE source_item_id IS NOT NULL AND subject_entity_id = ?
       UNION
       SELECT source_item_id FROM timeline_events WHERE source_item_id IS NOT NULL AND entity_id = ?
       UNION
       SELECT c.source_item_id
       FROM citations c
       JOIN stories bs ON bs.id = c.target_id AND c.target_type = 'story'
       WHERE c.source_item_id IS NOT NULL AND bs.entity_id = ?
     )
     LIMIT 10`,
    [row.storyId, row.entityId, row.entityId, row.entityId, brandId || ""],
  );
}

async function getSpec(db: Client, entityId: string) {
  const rows = await execute<ModelSpec>(
    db,
    `SELECT
       ms.series_name AS seriesName,
       ms.release_year AS releaseYear,
       ms.origin_country AS originCountry,
       ms.nib,
       ms.fill_system AS fillSystem,
       ms.material,
       ms.dimensions,
       ms.weight,
       ms.price_range AS priceRange,
       ms.status,
       b.id AS brandId,
       b.name AS brandName,
       b.slug AS brandSlug
     FROM model_specs ms
     LEFT JOIN entities b ON b.id = ms.brand_entity_id
     WHERE ms.entity_id = ?
     LIMIT 1`,
    [entityId],
  );
  return rows[0] || null;
}

async function getBrandForPen(db: Client, row: StoryRow, spec: ModelSpec | null) {
  if (spec?.brandId && spec.brandName && spec.brandSlug) {
    return {
      id: spec.brandId,
      type: "brand",
      slug: spec.brandSlug,
      name: spec.brandName,
      linkType: "made_by",
    };
  }

  const rows = await execute<RelatedEntity>(
    db,
    `SELECT b.id, b.type, b.slug, b.name, l.link_type AS linkType
     FROM entity_links l
     JOIN entities b ON b.id = l.target_id
     WHERE l.source_id = ? AND b.type = 'brand'
     ORDER BY CASE l.link_type WHEN 'made_by' THEN 0 WHEN 'brand_model' THEN 1 ELSE 2 END
     LIMIT 1`,
    [row.entityId],
  );

  return rows[0] || null;
}

async function getBrandModels(db: Client, entityId: string) {
  return execute<RelatedEntity>(
    db,
    `SELECT DISTINCT p.id, p.type, p.slug, p.name, l.link_type AS linkType
     FROM entity_links l
     JOIN entities p ON p.id = l.target_id
     WHERE l.source_id = ? AND p.type = 'pen' AND l.link_type != 'reverse'
     ORDER BY p.name
     LIMIT 12`,
    [entityId],
  );
}

async function getSiblingModels(
  db: Client,
  row: StoryRow,
  brand: RelatedEntity | null,
) {
  if (!brand) return [];
  return execute<RelatedEntity>(
    db,
    `SELECT DISTINCT p.id, p.type, p.slug, p.name, l.link_type AS linkType
     FROM entity_links l
     JOIN entities p ON p.id = l.target_id
     WHERE l.source_id = ? AND p.type = 'pen' AND p.id != ? AND l.link_type != 'reverse'
     ORDER BY p.name
     LIMIT 8`,
    [brand.id, row.entityId],
  );
}

async function getVariants(db: Client, entityId: string) {
  const rows = await execute<{ variantName: string }>(
    db,
    `SELECT variant_name AS variantName
     FROM model_variants
     WHERE model_entity_id = ?
     ORDER BY variant_name
     LIMIT 8`,
    [entityId],
  );
  return rows.map((row) => row.variantName);
}

async function getNibTags(db: Client, entityId: string) {
  return execute<TagInfo>(
    db,
    `SELECT t.name, t.slug, t.dimension
     FROM entity_tags et
     JOIN tags t ON t.id = et.tag_id
     WHERE et.entity_id = ?
       AND t.dimension IN ('nib_type', 'nib_material')
     ORDER BY
       CASE t.dimension WHEN 'nib_material' THEN 0 ELSE 1 END,
       t.name`,
    [entityId],
  );
}

async function getClaimTexts(db: Client, entityId: string) {
  const rows = await execute<{ text: string }>(
    db,
    `SELECT coalesce(obj.name, c.object_text) AS text
     FROM claims c
     LEFT JOIN entities obj ON obj.id = c.object_entity_id
     WHERE c.subject_entity_id = ?
     ORDER BY c.confidence DESC
     LIMIT 6`,
    [entityId],
  );
  return rows
    .map((row) => cleanText(row.text))
    .filter((text) => text && !BAD_COPY_PATTERN.test(text));
}

function needsUpgrade(row: StoryRow) {
  return (
    BAD_COPY_PATTERN.test(row.title) ||
    BAD_COPY_PATTERN.test(row.summary || "") ||
    BAD_COPY_PATTERN.test(row.bodyMd || "") ||
    row.bodyMd.length < 420
  );
}

function badCopyMatches(update: {
  title: string;
  summary: string;
  bodyMd: string;
}) {
  return [
    ["title", update.title],
    ["summary", update.summary],
    ["body", update.bodyMd],
  ]
    .map(([field, value]) => {
      const match = String(value).match(BAD_COPY_PATTERN);
      return match ? `${field}:${match[0].slice(0, 30)}` : "";
    })
    .filter(Boolean);
}

async function upgradeStory(db: Client, row: StoryRow) {
  const spec = row.entityType === "pen" ? await getSpec(db, row.entityId) : null;
  const brand =
    row.entityType === "pen" ? await getBrandForPen(db, row, spec) : null;
  const sources = await getSources(db, row, brand?.id);

  if (row.entityType === "brand") {
    const models = await getBrandModels(db, row.entityId);
    return {
      title: titleFor(row, null),
      summary: brandSummary(row, models, sources),
      bodyMd: brandBody(row, models, sources),
    };
  }

  const siblings = await getSiblingModels(db, row, brand);
  const variants = await getVariants(db, row.entityId);
  const nibTags = await getNibTags(db, row.entityId);
  return {
    title: titleFor(row, spec),
    summary: modelSummary(row, spec, brand),
    bodyMd: modelBody(row, spec, brand, siblings, variants, sources, nibTags),
  };
}

async function main() {
  const db = getClient();
  const stories = await getStories(db);
  const targets = FORCE ? stories : stories.filter(needsUpgrade);

  console.log(
    WRITE
      ? "Detail story upgrade: write mode"
      : "Detail story upgrade: dry run",
  );
  console.log(`Force refresh: ${FORCE ? "yes" : "no"}`);
  console.log(`Stories scanned: ${stories.length}`);
  console.log(`Stories needing upgrade: ${targets.length}`);

  let written = 0;
  for (const row of targets) {
    const update = await upgradeStory(db, row);
    const badOutput =
      BAD_COPY_PATTERN.test(update.title) ||
      BAD_COPY_PATTERN.test(update.summary) ||
      BAD_COPY_PATTERN.test(update.bodyMd);

    if (badOutput) {
      console.warn(
        `Skip ${row.slug}: generated text still contains bad copy (${badCopyMatches(update).join(", ")})`,
      );
      continue;
    }

    if (WRITE) {
      await db.execute({
        sql: `UPDATE stories
              SET title = ?, summary = ?, body_md = ?, status = CASE WHEN status = 'published' THEN status ELSE 'reviewed' END, updated_at = datetime('now')
              WHERE id = ?`,
        args: [update.title, update.summary, update.bodyMd, row.storyId],
      });
    }

    console.log(`${row.slug} -> ${update.title}`);
    written += 1;
  }

  const remaining = await execute<{ count: number }>(
    db,
    `SELECT COUNT(*) AS count
     FROM stories
     WHERE title LIKE '%名称与已知线索%'
        OR title LIKE '%名称边界和已知线索%'
        OR summary LIKE '%方便读者确认%'
        OR summary LIKE '%未由来源支撑%'
        OR body_md LIKE '%方便读者确认%'
        OR body_md LIKE '%公开来源没有直接支撑%'
        OR body_md LIKE '%未由来源支撑%'
        OR body_md LIKE '%这一页是一个%索引入口%'`,
  );

  console.log(`${WRITE ? "Written" : "Would write"}: ${written}`);
  console.log(`Remaining generic story copy: ${remaining[0]?.count || 0}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
