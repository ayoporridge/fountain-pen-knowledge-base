import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase77HongdianN7RabbitPacks } from "./phase77-hongdian-n7-rabbit";

export const PHASE174_HONGDIAN_BRAND_ID = "4yRpvovXFoWh";
export const PHASE174_M2_ID = "CCUWJJaN7snC";
const RETRIEVED = "2026-07-25";
const SCOPE = "phase174-hongdian-m2-scope";

function web(input: {
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
  return {
    ...input,
    independenceGroup: input.registryKey,
    homepageUrl: input.url.startsWith("http") ? new URL(input.url).origin : "/",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

const official = web({
  key: "phase174-hongdian-m2-official",
  title: "Hongdian Pens：M2 及清洁说明",
  url: "https://hongdianpens.com/",
  registryKey: "hongdianpens-site-phase174",
  registryName: "Hongdian Pens product site",
  sourceType: "official",
  tier: "contemporary_archive",
  summary:
    "品牌型商品站把 M2 列入 M-Series Pocket Pens，写明铝制笔身、约 4.13 英寸、约 13 mm 直径、约 12 g 不含帽、约 0.85 oz 带帽、螺旋帽、弹簧夹、附 converter 和清洁建议；站点混列多个系列，型号字段只按 M2 选择器读取。",
  locator:
    "Hongdian M2 Black Forest Mini; 4.13-inch; 13 mm; 12 g uncapped; 0.85 oz capped; aluminum; screw cap; converter; M-Series Pocket Pens; cleaning FAQ",
});

const review = web({
  key: "phase174-hongdian-m2-fabulous-scientist",
  title: "The Fabulous Scientist：Discover the Hongdian M2: A Pocket Pen Review",
  url: "https://thefabulousscientist.com/2026/02/09/discover-the-hongdian-m2-a-pocket-pen-review/",
  registryKey: "fabulous-scientist-hongdian-m2-phase174",
  registryName: "The Fabulous Scientist",
  sourceType: "blog",
  tier: "professional_secondary",
  summary:
    "独立评测把 M2 作为口袋笔，记录铝制笔身、螺旋帽、EF 细尖的铅笔感反馈、可拆洗尖单元、附 converter 与包装；触感属于作者样本，不升级为全批次品质保证。",
  locator:
    "M2 pocket pen; aluminum; screw cap; EF nib feedback; screwable nib unit; included converter; colors",
});

const retailer = web({
  key: "phase174-hongdian-m2-desertcart",
  title: "Desertcart：Hongdian M2 商品记录与用户反馈",
  url: "https://www.desertcart.us/products/598564335-hongdian-m2",
  registryKey: "desertcart-hongdian-m2-phase174",
  registryName: "Desertcart",
  sourceType: "retailer",
  tier: "professional_secondary",
  summary:
    "商品记录与用户反馈显示 M2 有铝制、黄铜等材质 SKU，附 converter、螺旋帽和夹子；不同材质的重量、尖号和颜色不应合并为单一固定值。",
  locator:
    "Hongdian M2 model; aluminum and brass boundary; converter; screw cap; clip; material-specific user reports",
});

const svg = web({
  key: "phase174-hongdian-m2-svg",
  title: "HongDian M2 结构事实图（本站原创）",
  url: "/images/library/site-original/phase174/hongdian/m2.svg",
  registryKey: "fountain-pen-graph-editorial-phase174",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  summary:
    "本站原创 factual SVG；只示意短身铝制笔、螺旋帽、夹子、converter 和细尖关系，不是产品照片，不证明真实比例、颜色、Logo、刻字或库存。",
  locator:
    "project-public-asset:phase174/hongdian/m2.svg;site-original=true;factual-svg=true;product-photo=false;not-to-scale=true",
});

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  locator: string,
) {
  return {
    key,
    fieldKey,
    sourceKey,
    scopeKey: SCOPE,
    locator,
    qualifies: true,
  };
}

const existingBrand = phase77HongdianN7RabbitPacks(
  PHASE174_HONGDIAN_BRAND_ID,
  "phase77-pen-hongdian-n7-rabbit",
).find((pack) => pack.expectedType === "brand");
if (!existingBrand) throw new Error("Phase 174 HongDian brand prerequisite is missing.");
const brand = structuredClone(existingBrand);
brand.key = "phase174-hongdian-brand-navigation-v1";

export const phase174HongdianM2Packs: CuratedEntityPack[] = [
  brand,
  {
    key: "phase174-hongdian-m2-v1",
    entityId: PHASE174_M2_ID,
    expectedType: "pen",
    expectedSlug: "弘典-hongdian-m2迷你",
    canonicalName: "弘典 HongDian M2迷你",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/hongdian-m2-phase174.md",
    storyTitle: "HongDian M2：短身铝制口袋笔的型号边界",
    primarySourceKey: official.key,
    depthTier: "B",
    aliases: [
      { alias: "HongDian M2", language: "en", sourceKey: official.key },
      { alias: "Hongdian M2 Mini", language: "en", sourceKey: official.key },
      { alias: "HongDian M2 Pocket", language: "en", sourceKey: review.key },
      { alias: "弘典 M2 迷你", language: "zh", sourceKey: official.key },
    ],
    sources: [official, review, retailer, svg],
    scopes: [
      {
        key: SCOPE,
        scopeKey: SCOPE,
        validFrom: RETRIEVED,
        productionState: "current",
        materialScope:
          "主实体固定铝制 M2；黄铜、钛合金和 fude/bent 尖作为相邻市场 SKU，不继承铝制版重量或手感。",
        nibScope:
          "EF／F 等尖号按具体商品选择器和到手尖面核对；独立评测的反馈是样本体验，不是全批次保证。",
        editionScope:
          "当代市场记录；首发年份、停产状态和工厂沿革未被可靠资料固定。",
      },
    ],
    claims: [
      {
        key: "phase174-m2-identity",
        predicate: "model_identity",
        objectText:
          "HongDian M2 是 M-Series Pocket Pens 中的短身铝制口袋笔；M2 Brass、M2 Titanium、全尺寸 Black Forest 和其他 HongDian 型号不合并到本实体。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: official.key,
        locator: official.summary,
        evidence: [
          {
            key: "phase174-m2-identity-official",
            sourceKey: official.key,
            scopeKey: SCOPE,
            locator: "M2 Black Forest Mini product identity and M-Series Pocket Pens listing",
          },
          {
            key: "phase174-m2-identity-review",
            sourceKey: review.key,
            scopeKey: SCOPE,
            locator: "independent review names the Hongdian M2 as a pocket pen",
          },
        ],
      },
      {
        key: "phase174-m2-structure",
        predicate: "filling_material_boundary",
        objectText:
          "铝制笔身配螺旋笔帽、夹子和随附 converter；可用瓶装墨水，具体墨囊兼容性按 SKU 核对，不把 M2 改写成 eyedropper 或内置活塞笔。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: official.key,
        locator: official.summary,
        evidence: [
          {
            key: "phase174-m2-structure-official",
            sourceKey: official.key,
            scopeKey: SCOPE,
            locator: "aluminum body; screw cap; clip; included converter",
          },
          {
            key: "phase174-m2-structure-retailer",
            sourceKey: retailer.key,
            scopeKey: SCOPE,
            locator: "M2 product record and converter/clip details",
          },
        ],
      },
      {
        key: "phase174-m2-nib",
        predicate: "nib_boundary",
        objectText:
          "官方页列 extra-fine soft，独立评测以 EF 细尖为主；soft 代表该页面的尖感描述，不能升级为 flex、金尖或持续大幅变线保证。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: official.key,
        locator: official.summary,
        evidence: [
          {
            key: "phase174-m2-nib-official",
            sourceKey: official.key,
            scopeKey: SCOPE,
            locator: "extra-fine soft nib option",
          },
          {
            key: "phase174-m2-nib-review",
            sourceKey: review.key,
            scopeKey: SCOPE,
            locator: "EF nib and pencil-like feedback in independent sample",
          },
        ],
      },
      {
        key: "phase174-m2-variants",
        predicate: "version_boundary",
        objectText:
          "官方页面列绿色、棕色、紫色和灰色等铝制颜色；市场还出现黑色、黄铜、钛合金与 fude/bent 尖 SKU，材质、重量和尖号必须分开核对。",
        factClass: "core",
        confidence: 0.95,
        sourceKey: official.key,
        locator: official.summary,
        evidence: [
          {
            key: "phase174-m2-variants-official",
            sourceKey: official.key,
            scopeKey: SCOPE,
            locator: "M2 color options and aluminum construction",
          },
          {
            key: "phase174-m2-variants-retailer",
            sourceKey: retailer.key,
            scopeKey: SCOPE,
            locator: "aluminum and brass material-specific records",
          },
        ],
      },
      {
        key: "phase174-m2-care",
        predicate: "maintenance_boundary",
        objectText:
          "换墨使用常温清水吸排并完全晾干；阳极氧化铝和电镀夹子避免热水、酒精、研磨剂与金属刷，螺纹或 converter 发涩时先停止用力。",
        factClass: "editorial",
        confidence: 0.94,
        sourceKey: official.key,
        locator: "conservative care derived from official cleaning guidance and aluminum/converter boundary",
        evidence: [
          {
            key: "phase174-m2-care-official",
            sourceKey: official.key,
            scopeKey: SCOPE,
            locator: "Hongdian cleaning FAQ: room-temperature water; avoid hot water",
          },
        ],
      },
    ],
    variants: [
      {
        key: "phase174-m2-aluminum-colors",
        name: "M2 铝制颜色 SKU",
        notes:
          "官方型商品站列绿色、棕色、紫色、灰色等颜色；颜色是市场选择，不改变主实体的铝制材质边界。",
        sourceKey: official.key,
        variantKind: "color",
      },
      {
        key: "phase174-m2-brass-boundary",
        name: "M2 Brass（相邻材质版本）",
        notes:
          "零售记录出现黄铜版；密度和重量不同，不继承铝制 M2 的 12 g 数字。",
        sourceKey: retailer.key,
        variantKind: "material",
      },
      {
        key: "phase174-m2-titanium-boundary",
        name: "M2 Titanium（相邻材质版本）",
        notes:
          "市场记录出现钛合金版本；需以具体 SKU、尖号和包装核对，不与铝制版合并。",
        sourceKey: retailer.key,
        variantKind: "material",
      },
    ],
    spec: {
      brandEntityId: PHASE174_HONGDIAN_BRAND_ID,
      values: {
        series_name: "HongDian M-Series Pocket Pens / M2 Mini",
        release_year: "当代商品记录；首发年份未独立核实",
        origin_country:
          "品牌型商品站与零售记录指向中国制造语境；未据此推断具体工厂沿革",
        nib: "官方页列 extra-fine soft；独立评测以 EF 细尖为主，soft 不等于 flex",
        fill_system:
          "附 converter，使用瓶装墨水；墨囊兼容性按具体 SKU 复核",
        material: "铝制笔身与金属夹；黄铜、钛合金版本另作 variant",
        dimensions:
          "官方约 4.13 英寸（约 105 mm）短身、约 13 mm 直径；未统一拆分闭合/书写长度",
        weight:
          "官方约 12 g 不含帽、约 0.85 oz 带帽；测量口径与材质 SKU 需核对",
        status: "当代市场型号；颜色、尖号、库存和价格随渠道变化",
      },
      evidence: [
        evidence("brand_entity_id", "phase174-m2-brand", official.key, "HongDian product context"),
        evidence("series_name", "phase174-m2-series", official.key, "M-Series Pocket Pens and M2 product title"),
        evidence("release_year", "phase174-m2-release", official.key, "current product page; launch year withheld"),
        evidence("origin_country", "phase174-m2-origin", official.key, "brand and retailer manufacturing context"),
        evidence("nib", "phase174-m2-nib-spec", official.key, "extra-fine soft option; independent EF sample"),
        evidence("fill_system", "phase174-m2-fill", official.key, "included converter and bottled ink guidance"),
        evidence("material", "phase174-m2-material", official.key, "aluminum construction; adjacent material variants"),
        evidence("dimensions", "phase174-m2-dimensions", official.key, "4.13-inch and 13 mm product fields"),
        evidence("weight", "phase174-m2-weight", official.key, "12 g uncapped and 0.85 oz capped fields"),
        evidence("status", "phase174-m2-status", retailer.key, "current retail snapshot; availability may change"),
      ],
    },
    timeline: [
      {
        key: "phase174-m2-current-record",
        title: "当代市场记录核对",
        eventType: "model_released",
        startDate: RETRIEVED,
        circa: true,
        description: "该事件表示资料检索日仍可见 M2 商品记录，不是型号首发年份。",
        sourceKey: official.key,
      },
    ],
    media: [
      {
        key: "phase174-m2-primary-media",
        title: "HongDian M2 结构事实图（非产品照片）",
        sourceKey: svg.key,
        localPath: svg.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创 factual SVG；示意图，非产品照片；non-photo、non-logo、not-to-scale、non-colour-proof。",
        sourceUrl: svg.url,
        usageStatus: "primary",
      },
    ],
  },
];
