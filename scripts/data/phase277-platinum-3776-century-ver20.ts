import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase84PlatinumPilotP0V3BrandPacks } from "./phase84-platinum-pilot-p0-v3";

const RETRIEVED = "2026-07-27";
export const PHASE277_PLATINUM_ID = "e51tJpejEkXY";
export const PHASE277_VER20_ID = "phase277-platinum-3776-century-ver20";
export const PHASE277_VER20_SLUG = "platinum-3776-century-ver-2-0-pnb-450";
const MODEL_SCOPE = "phase277-platinum-ver20";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; group: string; summary: string; locator: string }): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.group,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.url.endsWith(".pdf") ? "pdf" : "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string): CuratedSource {
  const url = "/images/library/site-original/phase277/platinum/3776-century-ver20.svg";
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase277",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase277",
    title: "Platinum #3776 Century Ver.2.0 事实图",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: MODEL_SCOPE, locator }],
  };
}

function evidence(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const officialBrief = web({
  key: "phase277-platinum-ver20-official-brief",
  title: "Platinum #3776 Century Ver.2.0 official brief",
  url: "https://www.platinum-pen.co.jp/common/pdf/demonstrator_en.pdf",
  registryKey: "platinum-ver20-official-brief",
  registryName: "Platinum Pen official",
  sourceType: "official",
  tier: "primary",
  group: "platinum-official",
  summary: "官方说明给出 2026 Ver.2.0 的 Slip & Seal 改动、50°C/40% RH 九周加速测试、PNB-450、#6 Prism Crystal、F/M/B 14K 14-26、139.5 mm、15.4 mm、20.0 g、附件与 2,000 支限量。",
  locator: "all product specifications, mechanism changes, accelerated-test conditions and quantity",
});
const officialNews = web({
  key: "phase277-platinum-ver20-official-news",
  title: "Platinum official news: #3776 Century Ver.2.0",
  url: "https://www.platinum-pen.co.jp/news/13321/",
  registryKey: "platinum-official-news",
  registryName: "Platinum Pen official",
  sourceType: "official",
  tier: "contemporary_archive",
  group: "platinum-official",
  summary: "官方新闻稿确认 2026-02-05 发售、PNB-450、#6 Prism Crystal、世界 2,000 支与密封性能提升的发布语境。",
  locator: "release date, model number, demonstrator edition and anniversary context",
});
const kyodo = web({
  key: "phase277-platinum-ver20-kyodo",
  title: "Kyodo News PR Wire: PNB-450 release notice",
  url: "https://kyodonewsprwire.jp/release/202601273131",
  registryKey: "kyodo-prwire-platinum-ver20",
  registryName: "Kyodo News PR Wire",
  sourceType: "retailer",
  tier: "contemporary_archive",
  group: "kyodo-prwire",
  summary: "新闻稿转载保留厂商发布的日期、价格、PNB-450、尺寸重量、14K F/M/B、Converter-800A、蓝黑墨囊及 2,000 支限量信息；价格只作历史发布记录。",
  locator: "2026-01-29 release, 2026-02-05 launch, product specification block",
});
const yoseka = web({
  key: "phase277-platinum-ver20-yoseka",
  title: "Yoseka Stationery: Platinum Century 3776 Ver.2.0",
  url: "https://yosekastationery.com/products/platinum-century-3776-ver-2-0-fountain-pen-demonstrator-limited-edition-coming-soon",
  registryKey: "yoseka-platinum-ver20",
  registryName: "Yoseka Stationery",
  sourceType: "retailer",
  tier: "professional_secondary",
  group: "yoseka-retailer",
  summary: "独立零售页交叉记录透明 demonstrator、2,000 支、139.5 mm、15.4 mm、20 g、14K 金尖、Converter 与蓝黑墨囊，并描述可视墨仓与帽内结构。",
  locator: "product description, included accessories and limited-edition quantity",
});
const pensachi = web({
  key: "phase277-platinum-ver20-pensachi",
  title: "PenSachi: Platinum #3776 Century Ver.2.0 Demonstrator",
  url: "https://www.pensachi.com/products/platinum-3776-century-ver-2-0-fountain-pen-demonstrator",
  registryKey: "pensachi-platinum-ver20",
  registryName: "PenSachi",
  sourceType: "retailer",
  tier: "retailer",
  group: "pensachi-retailer",
  summary: "独立零售页用于交叉核对 PNB-450 #6 Prism Crystal 的商品命名和地区销售边界；库存、价格和发货状态不作为永久事实。",
  locator: "product identity, demonstrator naming and market availability",
});
const svg = diagram("phase277-platinum-ver20-svg");

const pack: CuratedEntityPack = {
  key: "phase277-platinum-3776-century-ver20-v1",
  entityId: PHASE277_VER20_ID,
  expectedType: "pen",
  expectedSlug: PHASE277_VER20_SLUG,
  canonicalName: "Platinum #3776 Century Ver.2.0 Prism Crystal",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/platinum-3776-century-ver20-phase277.md",
  storyTitle: "Platinum #3776 Century Ver.2.0：PNB-450 Prism Crystal 的密封改版",
  primarySourceKey: officialBrief.key,
  depthTier: "A",
  aliases: [
    { alias: "Platinum #3776 Century Ver.2.0", language: "en", sourceKey: officialBrief.key },
    { alias: "PNB-450", language: "en", sourceKey: officialBrief.key },
    { alias: "#6 Prism Crystal", language: "en", sourceKey: officialBrief.key },
    { alias: "白金 #3776 Century Ver.2.0", language: "zh", sourceKey: officialNews.key },
    { alias: "白金 PNB-450 棱镜水晶", language: "zh", sourceKey: yoseka.key },
  ],
  sources: [officialBrief, officialNews, kyodo, yoseka, pensachi, svg],
  scopes: [{ key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, market: "Platinum 2026 limited demonstrator", productionState: "current", nibScope: "14K 14-26 wide nib; F/M/B only in official brief", materialScope: "Prism Crystal resin body/cap/grip/crown with metal trim", editionScope: "PNB-450 #6 Prism Crystal; excludes ordinary PNB-15000, DECADE and Travia" }],
  claims: [
    claim("ver20-identity", "model_identity", "PNB-450 #6 Prism Crystal 是 2026 年 #3776 Century Ver.2.0 的独立限量 demonstrator，不是普通 PNB-15000 的透明颜色。", officialBrief.key, "product name, number and barrel color"),
    claim("ver20-quantity", "edition_boundary", "官方资料将 PNB-450 限定为 2,000 支；这是该 demonstrator 的限量数量，不是整个 #3776 Century 家族的产量。", officialBrief.key, "quantity for sale"),
    claim("ver20-seal", "mechanism_change", "Ver.2.0 改良 Slip & Seal，并在 50°C、40% 湿度、水平合帽九周的加速测试中宣称超过三年；官方注明加速结果可能与实际存放不同。", officialBrief.key, "accelerated and actual test methods"),
    claim("ver20-structure", "design_revision", "官方说明透明帽内取消可见螺母、笔杆内壁改平以减少反光、尾部接合增加橡胶环、握位重新设计，笔尖雕刻也更新。", officialBrief.key, "streamlined crown, ink visibility, rear seal, grip and nib sections"),
    claim("ver20-spec", "physical_specification", "PNB-450 官方规格为全长 139.5 mm、最大直径 15.4 mm、重量 20.0 g；胴、鞘、握位和冠饰为树脂，环与笔夹为金属。", officialBrief.key, "specifications and material block"),
    claim("ver20-nib", "nib", "官方列大型 14K 14-26 金尖，F、M、B 三种货号；不能把普通 Century 的 UEF、EF、SF 或 C 尖回填到本限量版。", officialBrief.key, "nib and product-code table"),
    claim("ver20-filling", "filling_system", "PNB-450 随附 Converter-800A 与一支蓝黑墨囊，属于 Platinum 墨囊/转换器路线；Slip & Seal 是笔帽密封机制，不是活塞或真空上墨。", officialBrief.key, "accessories and refill list"),
    claim("ver20-market", "market_boundary", "Yoseka 与 PenSachi 的零售页将其作为 2026 透明 demonstrator 销售；价格、库存和地区发货会变化，只用于交叉核对身份。", yoseka.key, "independent retail identity and availability"),
    claim("ver20-selection", "selection_guidance", "购买时应核对 PNB-450、#6 Prism Crystal、14K 14-26、F/M/B、盒卡与 Converter-800A；只写透明 3776 的商品不能据照片确认 Ver.2.0。", officialNews.key, "product identification and release context", "editorial"),
  ],
  variants: [
    { key: "ver20-f", name: "PNB-450 F（1005062）", releaseYear: "2026", productCode: "1005062", notes: "14K 14-26 大型尖，Prism Crystal。", sourceKey: officialBrief.key, variantKind: "nib", market: "global" },
    { key: "ver20-m", name: "PNB-450 M（1005063）", releaseYear: "2026", productCode: "1005063", notes: "14K 14-26 大型尖，Prism Crystal。", sourceKey: officialBrief.key, variantKind: "nib", market: "global" },
    { key: "ver20-b", name: "PNB-450 B（1005064）", releaseYear: "2026", productCode: "1005064", notes: "14K 14-26 大型尖，Prism Crystal。", sourceKey: officialBrief.key, variantKind: "nib", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE277_PLATINUM_ID,
    values: {
      series_name: "Platinum #3776 Century Ver.2.0 Prism Crystal",
      release_year: "2026-02-05",
      origin_country: "Platinum Pen 日本品牌；PNB-450 的制造地未在本页扩写",
      nib: "大型 14K 14-26；F/M/B",
      fill_system: "Platinum 墨囊／Converter-800A；Slip & Seal 笔帽密封",
      material: "#6 Prism Crystal 树脂笔身、笔帽、握位和冠饰；金属环与笔夹",
      dimensions: "全长 139.5 mm；最大直径 15.4 mm；20.0 g",
      weight: "20.0 g",
      status: "2026 年限量 2,000 支；PNB-450；独立于普通 PNB-15000",
    },
    evidence: [
      evidence("ver20", "brand_entity_id", officialBrief.key, "Platinum maker identity"),
      evidence("ver20", "series_name", officialBrief.key, "product name and PNB-450"),
      evidence("ver20", "release_year", officialNews.key, "2026-02-05 release date"),
      evidence("ver20", "origin_country", officialNews.key, "Platinum Pen company release context"),
      evidence("ver20", "nib", officialBrief.key, "14K 14-26 and F/M/B product codes"),
      evidence("ver20", "fill_system", officialBrief.key, "Converter-800A, cartridge and Slip & Seal context"),
      evidence("ver20", "material", officialBrief.key, "resin and metal material table"),
      evidence("ver20", "dimensions", officialBrief.key, "139.5 mm, 15.4 mm and 20.0 g"),
      evidence("ver20", "weight", officialBrief.key, "standard weight"),
      evidence("ver20", "status", officialBrief.key, "limited quantity and model boundary"),
    ],
  },
  timeline: [{ key: "ver20-release", title: "#3776 Century Ver.2.0 PNB-450 发布", eventType: "model_released", startDate: "2026-02-05", circa: false, description: "Platinum 官方新闻稿记录 PNB-450 #6 Prism Crystal 作为 2,000 支限量 demonstrator 发售。", sourceKey: officialNews.key }],
  media: [{ key: "ver20-media", title: "Platinum Ver.2.0 事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不复制 Platinum 官方摄影，不表现真实比例、Logo 或透明材质。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const brand = structuredClone(phase84PlatinumPilotP0V3BrandPacks[0]);
if (!brand || brand.entityId !== PHASE277_PLATINUM_ID) throw new Error("Phase 277 Platinum brand pack missing.");
brand.key = "phase277-platinum-brand-v1";

export const phase277PlatinumVer20Packs: CuratedEntityPack[] = [brand, pack];
