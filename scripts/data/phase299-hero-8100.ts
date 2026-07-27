import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase55HeroPaidiPacks } from "./phase55-hero-paidi";

export const PHASE299_HERO_BRAND_ID = "LIfzzmbCfFPt";
export const PHASE299_HERO_8100_ID = "phase299-hero-8100";
export const PHASE299_HERO_8100_SLUG = "hero-8100";
const RETRIEVED = "2026-07-28";
const MODEL_SCOPE = "phase299-hero-8100-model";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase299/hero/8100.svg";
  return {
    key: "phase299-hero-8100-svg",
    registryKey: "fountain-pen-graph-editorial-phase299",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase299",
    title: "Hero 8100 型 18K 金笔工艺事实卡",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意官方型号、18K 命名和花丝镶嵌工艺，非产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;not-to-scale=true;colour-proof=false`,
  };
}

const S = {
  officialProduct: web({
    key: "phase299-hero-8100-official-product",
    title: "上海英雄（集团）有限公司：英雄8100型18K金笔",
    url: "https://hero.com.cn/product-detail/4.html",
    registryKey: "hero-official-8100-phase299",
    registryName: "上海英雄（集团）有限公司",
    summary: "官方产品详情页确认“英雄8100型18K金笔”独立标题，并说明由花丝镶嵌第三代传承人袁长君大师打造；页面没有公开尺寸、重量、供墨或笔尖细节。",
  }),
  officialHome: web({
    key: "phase299-hero-home",
    title: "上海英雄（集团）有限公司官方网站",
    url: "https://hero.com.cn/",
    registryKey: "hero-official-home-phase299",
    registryName: "上海英雄（集团）有限公司",
    summary: "官网提供 Hero 集团、上海英雄金笔厂与产品展示导航，作为品牌关系与目录语境旁证，不承担 8100 的具体规格。",
  }),
  jdIndex: web({
    key: "phase299-hero-8100-jd-index",
    title: "京东：英雄 8100/18K 金笔商品索引",
    url: "https://www.jd.com/hprm/6706c6c4501ae0b14a4.html?electedExtAttrSet=2756%2C&extAttrValue=expand_name%2C%4098494%3A%3A2756&sort_type=sort_default",
    registryKey: "jd-hero-8100-phase299",
    registryName: "京东商品索引",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "零售索引出现 Hero 8100 万年限定、明尖和 0.5 mm 等具体商品文案；仅用于记录市场 SKU 线索，不外推为基础型号统一规格。",
  }),
  svg: diagram(),
} satisfies Record<string, CuratedSource>;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, extra: string[] = []) {
  return {
    key,
    predicate,
    objectText,
    factClass: "core" as const,
    confidence: 0.94,
    sourceKey,
    locator,
    evidence: [sourceKey, ...extra].map((item, index) => ({ key: `${key}-evidence-${index + 1}`, sourceKey: item, scopeKey: MODEL_SCOPE, locator })),
  } satisfies CuratedEntityPack["claims"][number];
}

function ev(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const sourceBrand = phase55HeroPaidiPacks.find((pack) => pack.entityId === PHASE299_HERO_BRAND_ID && pack.expectedType === "brand");
if (!sourceBrand) throw new Error("Phase 299 requires the existing Hero brand pack.");
const brand = structuredClone(sourceBrand);
brand.key = "phase299-hero-brand-v1";

const model: CuratedEntityPack = {
  key: "phase299-hero-8100-v1",
  entityId: PHASE299_HERO_8100_ID,
  expectedType: "pen",
  expectedSlug: PHASE299_HERO_8100_SLUG,
  canonicalName: "英雄 Hero 8100 型 18K 金笔",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/hero-8100-phase299.md",
  storyTitle: "英雄 Hero 8100 型 18K 金笔：把工艺身份和规格边界分开",
  primarySourceKey: S.officialProduct.key,
  depthTier: "A",
  aliases: [
    { alias: "Hero 8100", language: "en", sourceKey: S.officialProduct.key },
    { alias: "英雄 8100", language: "zh", sourceKey: S.officialProduct.key },
    { alias: "英雄8100型18K金笔", language: "zh", sourceKey: S.officialProduct.key },
  ],
  sources: [S.officialProduct, S.officialHome, S.jdIndex, S.svg],
  scopes: [
    { key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "current", materialScope: "官方只确认 18K 金笔命名与花丝镶嵌工艺语境；具体材质按实物/批次核对。", editionScope: "不覆盖 Hero 8101、8102、100、849、850 或零售商自行命名的其他 Hero 金笔。" },
    { key: `${MODEL_SCOPE}-retail`, scopeKey: `${MODEL_SCOPE}-retail-sku`, productionState: "unknown", editionScope: "京东索引中的万年限定、明尖/0.5 mm、银丝编织等市场文案，只作 SKU 研究线索。" },
  ],
  claims: [
    claim("8100-identity", "model_identity", "Hero 官方目录把 8100 单列为“英雄8100型18K金笔”，是现有英雄 Hero 品牌下的独立型号。", S.officialProduct.key, "official product title and catalogue entry", [S.officialHome.key]),
    claim("8100-maker", "craft_attribution", "官方产品页说明该型号由中华传统工艺大师、非物质文化遗产花丝镶嵌第三代传承人袁长君大师打造；这确认工艺与创作者语境，不等于完整材质表。", S.officialProduct.key, "official maker and craft description"),
    claim("8100-naming", "18k_naming_boundary", "“18K金笔”是官方产品名称的一部分；当前页面没有把 18K 拆成笔尖、笔夹或装饰件的检测证明，因此不擅自写成固定 18K 金尖。", S.officialProduct.key, "official product title; absent assay/spec table"),
    claim("8100-sibling", "sibling_boundary", "官方导航把 8100 与相邻的 8102 铱金笔分开列出；8100 不应被当作 8102 的颜色或礼盒变体，也不应与 8101 木笔合并。", S.officialProduct.key, "previous/next product navigation", [S.officialHome.key]),
    claim("8100-retail", "market_sku_boundary", "零售索引出现“万年限定”“明尖”“0.5 mm”和银丝编织等 8100 文案；这些是具体市场 SKU 线索，不能外推到所有批次。", S.jdIndex.key, "retailer search index product labels"),
    claim("8100-unknowns", "specification_boundary", "官方公开页未给出合盖/开盖尺寸、重量、供墨机构、笔尖号、笔帽结构或墨囊兼容性；这些字段应保留未公开状态，不能从其他 Hero 型号回填。", S.officialProduct.key, "official page absence of technical table", [S.jdIndex.key]),
    claim("8100-care", "maintenance_guidance", "在上墨机构和嵌饰材质未确认前，先以清水短测、避免强拧尾钮；金属丝/嵌饰只用柔软布轻拭，不用热水、酒精、超声波或含磨粒抛光剂。", S.officialProduct.key, "craft surface care boundary; conservative editorial guidance", [S.officialHome.key]),
    claim("8100-selection", "selection_guidance", "选购时核对笔身刻字、证书、包装、笔尖与供墨结构；把限定版、银丝编织和线宽文案作为 market SKU 记录，不另建同名基础实体。", S.jdIndex.key, "retail variant labels and purchase boundary", [S.officialProduct.key]),
  ],
  variants: [
    { key: "8100-official-catalogue", name: "8100 官方目录条目", notes: "官方产品页只确认型号名称、18K 金笔命名与花丝镶嵌工艺传承；技术规格待实物或说明书补证。", sourceKey: S.officialProduct.key, variantKind: "market_sku" },
    { key: "8100-wannian-retail", name: "8100 万年限定珍藏版（零售文案）", notes: "京东索引出现该称呼；当前仅作为市场 SKU 线索，不能证明与基础目录条目的完整结构差异。", sourceKey: S.jdIndex.key, variantKind: "edition_group" },
    { key: "8100-silver-wire-retail", name: "8100 古典银丝编织（零售文案）", notes: "零售索引出现银丝编织称呼；材质、装饰范围和生产批次需以实物及凭证核对。", sourceKey: S.jdIndex.key, variantKind: "material" },
  ],
  spec: {
    brandEntityId: PHASE299_HERO_BRAND_ID,
    values: {
      series_name: "8100 型 18K 金笔",
      release_year: "官方当前目录可见；首发年份未公开",
      origin_country: "中国品牌产品线语境；本包不据此推断具体制造地或批次",
      nib: "官方页面未公开；零售索引出现明尖/0.5 mm 文案，仅绑定具体 SKU",
      fill_system: "未公开；购买前按实物确认活塞、转换器、墨囊或其他结构",
      material: "官方确认花丝镶嵌工艺语境；笔杆、装饰与 18K 部件的具体材质未公开",
      dimensions: "未公开",
      weight: "未公开",
      status: "官方产品目录可见；不同礼盒/零售 SKU 的库存与规格待核对",
    },
    evidence: [
      ev("8100-brand", "brand_entity_id", S.officialHome.key, "Hero group and Shanghai Hero Pen Factory navigation"),
      ev("8100-series", "series_name", S.officialProduct.key, "official product title"),
      ev("8100-release", "release_year", S.officialProduct.key, "current catalogue visibility; launch year not asserted"),
      ev("8100-origin", "origin_country", S.officialHome.key, "brand context only; no factory inference"),
      ev("8100-nib", "nib", S.officialProduct.key, "official page has no nib specification; retailer wording scoped separately"),
      ev("8100-fill", "fill_system", S.officialProduct.key, "official page has no filling specification"),
      ev("8100-material", "material", S.officialProduct.key, "craft attribution without material overclaim"),
      ev("8100-dimensions", "dimensions", S.officialProduct.key, "official page has no dimensions"),
      ev("8100-weight", "weight", S.officialProduct.key, "official page has no weight"),
      ev("8100-status", "status", S.officialProduct.key, "current catalogue visibility"),
    ],
  },
  media: [{ key: "8100-primary-media", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实材质、比例、颜色、Logo、刻字、库存或具体笔尖。", sourceUrl: S.svg.url, usageStatus: "primary" }],
  timeline: [{ key: "8100-current-catalogue", title: "8100 作为 Hero 官方目录型号可见", eventType: "model_released", startDate: "2026", circa: true, description: "截至研究日，Hero 官方产品页仍单列英雄8100型18K金笔；首发年份与生产起止未公开。", sourceKey: S.officialProduct.key }],
};

export const phase299Hero8100Packs: CuratedEntityPack[] = [brand, model];
