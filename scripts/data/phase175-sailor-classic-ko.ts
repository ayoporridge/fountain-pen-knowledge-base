import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase31SailorP0Packs } from "./phase31-sailor-p0";

export const PHASE175_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE175_CLASSIC_KO_ID = "MaxO_o9P4CXR";
const RETRIEVED = "2026-07-25";
const SCOPE = "phase175-sailor-classic-ko-dots-scope";

function source(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  const absolute = input.url.startsWith("http");
  return {
    ...input,
    homepageUrl: absolute ? new URL(input.url).origin : "/",
    independenceGroup: input.registryKey,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

const official = source({
  key: "phase175-sailor-classic-ko-official",
  title: "Sailor 官方产品页：Classic Ko Fountain Pen Dot's（10-8069）",
  url: "https://en.sailor.co.jp/product/10-8069/",
  registryKey: "sailor-official-classic-ko-phase175",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  summary:
    "官方产品页列 Dot's、商品代码 10-8069-310（MF）、21K Gold with Gold plating、Converter & Cartridge type、PMMA Resin、φ18×129 mm（含夹）、21.6 g 和桐箱，并说明 Classic Ko 与加贺蒔絵工房的关系。",
  locator:
    "product title; item code 10-8069-310; nib; filling; material; size; weight; package; Classic Ko and Oshita Kosen Kobo description",
});

const news = source({
  key: "phase175-sailor-classic-ko-news-2023",
  title: "Sailor 官方新闻：Classic Ko 灰轴与系列时间线",
  url: "https://sailor.co.jp/news/20230222/",
  registryKey: "sailor-official-news-classic-ko-phase175",
  registryName: "セーラー万年筆株式会社",
  sourceType: "official",
  tier: "contemporary_archive",
  summary:
    "官方新闻记载 2023 年灰轴上市，并把 Classic Ko 描述为加贺蒔絵工房大下香仙工房的珠宝品牌；同时说明 2020 年第一弹、2021 年加入圆珠笔和 2023 年第三弹的系列边界。",
  locator:
    "2023-02-22 release; first release 2020; second release 2021; third release gray axis; Oshita Kosen Kobo history",
});

const pdf = source({
  key: "phase175-sailor-classic-ko-ala-pdf",
  title: "Sailor 官方新闻稿 PDF：Classic Ko Ala SV（系列第四弹）",
  url: "https://sailor.co.jp/wp-content/uploads/2024/06/240612_ClassicKo_Ala_Sv-1.pdf",
  registryKey: "sailor-official-pdf-classic-ko-phase175",
  registryName: "セーラー万年筆株式会社",
  sourceType: "official",
  tier: "contemporary_archive",
  summary:
    "官方 PDF 记录 2024 年 Classic Ko 第四弹 Ala SV，写出 21K 大型尖、PMMA 清透灰轴、蒔絵与螺钿、φ18×129 mm 和 20.2 g；只用于证明系列变体边界，不把 Ala SV 规格移植给 Dot's。",
  locator:
    "2024-06-12 press release; series fourth release; PMMA; 21K large nib; dimensions and weight; Ala SV boundary",
});

const retailer = source({
  key: "phase175-sailor-classic-ko-nagasawa",
  title: "NAGASAWA 文具中心：Classic Ko Dot's／Mist／Deco Lotus 商品记录",
  url: "https://www.nagasawa-shop.jp/shopdetail/000000001405/",
  registryKey: "nagasawa-sailor-classic-ko-phase175",
  registryName: "NAGASAWA Stationery Center",
  sourceType: "retailer",
  tier: "professional_secondary",
  summary:
    "专业文具零售页将 Dot's、Mist 与 Deco Lotus line 分列为 Sailor 与 Classic Ko 的合作蒔絵款；用于确认具体装饰名的市场辨识和选购边界，不替代官方技术字段。",
  locator: "Classic Ko Dot's, Mist and Deco Lotus line product names; Sailor collaboration context",
});

const svg = source({
  key: "phase175-sailor-classic-ko-svg",
  title: "Sailor Classic Ko Dot's 结构事实图（本站原创）",
  url: "/images/library/site-original/phase175/sailor/classic-ko-dots.svg",
  registryKey: "fountain-pen-graph-editorial-phase175",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  summary:
    "本站原创 factual SVG；示意 Dot's 的蒔絵装饰、21K MF 尖、PMMA、两用供墨和桐箱关系，不是产品照片，不证明真实比例、漆色、金粉或库存。",
  locator: "project-public-asset:phase175/sailor/classic-ko-dots.svg;factual-svg=true;product-photo=false;not-to-scale=true",
});

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const existingBrand = phase31SailorP0Packs.find((pack) => pack.expectedType === "brand");
if (!existingBrand) throw new Error("Phase 175 Sailor brand prerequisite is missing.");
const brand = structuredClone(existingBrand);
brand.entityId = PHASE175_SAILOR_BRAND_ID;
brand.key = "phase175-sailor-brand-navigation-v1";

export const phase175SailorClassicKoPacks: CuratedEntityPack[] = [
  brand,
  {
    key: "phase175-sailor-classic-ko-dots-v1",
    entityId: PHASE175_CLASSIC_KO_ID,
    expectedType: "pen",
    expectedSlug: "写乐-sailor-classic-ko",
    canonicalName: "写乐 Sailor Classic Ko",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/sailor-classic-ko-phase175.md",
    storyTitle: "Sailor Classic Ko Dot's：蒔絵文房钢笔的身份与规格边界",
    primarySourceKey: official.key,
    depthTier: "B",
    aliases: [
      { alias: "Sailor Classic Ko Dot's", language: "en", sourceKey: official.key },
      { alias: "Classic Ko Dot's Fountain Pen", language: "en", sourceKey: official.key },
      { alias: "Classic Ko 文房蒔絵万年筆 Dot's", language: "ja", sourceKey: news.key },
      { alias: "写乐 Classic Ko Dot's", language: "zh", sourceKey: official.key },
    ],
    sources: [official, news, pdf, retailer, svg],
    scopes: [
      {
        key: SCOPE,
        scopeKey: SCOPE,
        validFrom: RETRIEVED,
        productionState: "historical",
        materialScope: "Dot's 主体按官方 PMMA Resin 与黑金蒔絵/漆艺装饰记录；Ala SV 等其他 Classic Ko 变体不继承其颜色和重量。",
        nibScope: "固定官方商品代码 10-8069-310 的 MF、21K Gold with Gold plating；不外推长刀研、特殊尖或普通 Profit 尖感。",
        editionScope: "当代合作/限定系列记录；不同市场可售性、包装附件和规格以授权渠道为准。",
      },
    ],
    claims: [
      {
        key: "phase175-classic-ko-identity",
        predicate: "model_identity",
        objectText: "Sailor Classic Ko Dot's 是 Sailor 与大下香仙工房合作的蒔絵文房钢笔，官方商品代码为 10-8069-310（MF）；Bamboo mesh、Floret dot、Ala SV、Profit 蒔絵和普通 1911/Profit 不合并。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: official.key,
        locator: official.summary,
        evidence: [
          { key: "phase175-classic-ko-identity-official", sourceKey: official.key, scopeKey: SCOPE, locator: "Dot's title, item code and Classic Ko description" },
          { key: "phase175-classic-ko-identity-retailer", sourceKey: retailer.key, scopeKey: SCOPE, locator: "independent Dot's/Mist/Deco Lotus product separation" },
        ],
      },
      {
        key: "phase175-classic-ko-craft",
        predicate: "craft_and_history_boundary",
        objectText: "Classic Ko 为大下香仙工房的珠宝品牌，工房资料追溯至 1894 年；Sailor 2023 新闻把 2020、2021、2023 记录为系列发行节点，不冒充 Dot's 单品首发年。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: news.key,
        locator: news.summary,
        evidence: [
          { key: "phase175-classic-ko-craft-news", sourceKey: news.key, scopeKey: SCOPE, locator: "1894 workshop and 2020/2021/2023 series timeline" },
          { key: "phase175-classic-ko-craft-pdf", sourceKey: pdf.key, scopeKey: SCOPE, locator: "2024 fourth release and workshop boundary" },
        ],
      },
      {
        key: "phase175-classic-ko-spec",
        predicate: "nib_material_fill_spec",
        objectText: "官方 Dot's 页面列 21K Gold with Gold plating、MF、PMMA Resin、Converter & Cartridge type、φ18×129 mm（含夹）、21.6 g 和桐箱。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: official.key,
        locator: official.summary,
        evidence: [
          { key: "phase175-classic-ko-spec-official", sourceKey: official.key, scopeKey: SCOPE, locator: "official product details fields" },
          { key: "phase175-classic-ko-spec-pdf-boundary", sourceKey: pdf.key, scopeKey: SCOPE, locator: "Ala SV has separate 20.2 g specification; do not transfer to Dot's" },
        ],
      },
      {
        key: "phase175-classic-ko-variant",
        predicate: "version_boundary",
        objectText: "Dot's 以黑金水滴主题为主记录；Bamboo mesh SV、Floret dot SV、Deco Lotus line 和 Ala SV 是 Classic Ko 的相邻设计或后续批次，应按各自商品代码和官方页面区分。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: news.key,
        locator: news.summary,
        evidence: [
          { key: "phase175-classic-ko-variant-news", sourceKey: news.key, scopeKey: SCOPE, locator: "Dot's theme and Bamboo/Floret design names" },
          { key: "phase175-classic-ko-variant-pdf", sourceKey: pdf.key, scopeKey: SCOPE, locator: "Ala SV fourth-release boundary" },
        ],
      },
      {
        key: "phase175-classic-ko-care",
        predicate: "maintenance_boundary",
        objectText: "漆艺和蒔絵表面以柔软干布轻拭，避免酒精、研磨剂、热水和长时间浸泡；converter 以常温清水吸排，出现漏墨或发涩先检查密封，不强行拆解装饰结构。",
        factClass: "editorial",
        confidence: 0.94,
        sourceKey: official.key,
        locator: "conservative care derived from lacquer/PMMA decoration and converter filling",
        evidence: [{ key: "phase175-classic-ko-care-evidence", sourceKey: official.key, scopeKey: SCOPE, locator: "PMMA, lacquer decoration, converter/cartridge boundary" }],
      },
    ],
    variants: [
      { key: "phase175-classic-ko-dots", name: "Dot's（10-8069-310）", notes: "黑金水滴图案，MF；本实体主记录。", sourceKey: official.key, variantKind: "market_sku", productCode: "10-8069-310", market: "JP/Global" },
      { key: "phase175-classic-ko-bamboo-boundary", name: "Bamboo mesh SV（边界）", notes: "官方新闻列出的相邻 Classic Ko 设计，不并入 Dot's。", sourceKey: news.key, variantKind: "edition_group" },
      { key: "phase175-classic-ko-ala-boundary", name: "Ala SV（系列第四弹边界）", notes: "2024 官方 PDF 的清透灰、银蒔絵与螺钿设计，尺寸与重量另计。", sourceKey: pdf.key, variantKind: "edition_group" },
    ],
    spec: {
      brandEntityId: PHASE175_SAILOR_BRAND_ID,
      values: {
        series_name: "Sailor Classic Ko 蒔絵文房",
        release_year: "系列第一弹 2020；Dot's 单品首发年份未由官方单独固定",
        origin_country: "日本；Sailor 官方产品与加贺蒔絵工房合作资料",
        nib: "21K Gold with Gold plating，MF（10-8069-310）",
        fill_system: "Converter & Cartridge type",
        material: "PMMA Resin；Classic Ko Dot's 黑金蒔絵／漆艺装饰",
        dimensions: "φ18×129 mm（含夹）",
        weight: "21.6 g",
        status: "当代限定/合作系列；可售性和规格以授权渠道为准",
      },
      evidence: [
        evidence("brand_entity_id", "phase175-classic-ko-brand", official.key, "Sailor product context"),
        evidence("series_name", "phase175-classic-ko-series", official.key, "Classic Ko Dot's product title"),
        evidence("release_year", "phase175-classic-ko-release", news.key, "2020 first release; single-item year withheld"),
        evidence("origin_country", "phase175-classic-ko-origin", news.key, "Sailor and Kaga workshop official release"),
        evidence("nib", "phase175-classic-ko-nib", official.key, "21K Gold with Gold plating; MF item code"),
        evidence("fill_system", "phase175-classic-ko-fill", official.key, "Converter & Cartridge type"),
        evidence("material", "phase175-classic-ko-material", official.key, "PMMA Resin and lacquer/maki-e description"),
        evidence("dimensions", "phase175-classic-ko-dimensions", official.key, "φ18×129 mm including clip"),
        evidence("weight", "phase175-classic-ko-weight", official.key, "21.6 g"),
        evidence("status", "phase175-classic-ko-status", official.key, "market availability disclaimer"),
      ],
    },
    timeline: [
      { key: "phase175-classic-ko-first-series", title: "Classic Ko 系列第一弹", eventType: "model_released", startDate: "2020", circa: true, description: "官方新闻称 Classic Ko 文房系列于 2020 年推出第一弹；不等同于 Dot's 单品首发年。", sourceKey: news.key },
      { key: "phase175-classic-ko-current-record", title: "Dot's 官方商品记录", eventType: "model_released", startDate: RETRIEVED, circa: true, description: "该事件表示资料检索日仍可见 Dot's 官方产品页，不是重新发布公告。", sourceKey: official.key },
    ],
    media: [
      {
        key: "phase175-classic-ko-primary-media",
        title: "Sailor Classic Ko Dot's 结构事实图（非产品照片）",
        sourceKey: svg.key,
        localPath: svg.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText: "本站原创 factual SVG；示意图，非产品照片；non-photo、non-logo、not-to-scale、non-colour-proof。",
        sourceUrl: svg.url,
        usageStatus: "primary",
      },
    ],
  },
];
