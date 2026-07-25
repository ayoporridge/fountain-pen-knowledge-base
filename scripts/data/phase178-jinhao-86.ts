import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase63JinhaoPacks } from "./phase63-jinhao-split";

export const PHASE178_JINHAO_BRAND_ID = "Yulxwu7PuQAU";
export const PHASE178_86_ID = "QDTizFrfcTbS";
const RETRIEVED = "2026-07-25";
const SCOPE = "phase178-jinhao-86-scope";

function source(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  const absolute = input.url.startsWith("http");
  return { ...input, independenceGroup: input.registryKey, homepageUrl: absolute ? new URL(input.url).origin : "/", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

const official = source({
  key: "phase178-jinhao-official-86",
  title: "Jinhao 官方产品站",
  url: "https://jinhaoproducts.com/",
  registryKey: "jinhaoproducts-phase178-86",
  registryName: "Jinhao Products",
  sourceType: "official",
  tier: "contemporary_archive",
  summary: "Jinhao 产品站提供当代产品线与 converter 使用语境；本页只用于品牌与配件边界，不据此补写公司沿革或每个型号的统一规格。",
  locator: "Jinhao product catalogue and converter context",
});
const supplier = source({
  key: "phase178-jinhao-86-alibaba",
  title: "Alibaba：Jinhao 86 Arrow Gold Clip Hooded Nib 产品资料",
  url: "https://www.alibaba.com/product-detail/jinhao-86-arrow-gold-clip-hooded_1601006555956.html",
  registryKey: "alibaba-jinhao-86-phase178",
  registryName: "Alibaba supplier listing",
  sourceType: "retailer",
  tier: "retailer",
  summary: "供应资料列 Jinhao 86、树脂手柄、钢尖、约 0.5 mm、twist converter 与上海产地字段；这是供应渠道样本，不升级为全批次目录公差。",
  locator: "model number 86; resin handle; stainless nib; 0.5 mm; twist converter; Shanghai origin field",
});
const fpn = source({
  key: "phase178-jinhao-86-fpn",
  title: "Fountain Pen Network：JinHao 86 长期使用讨论",
  url: "https://www.fountainpennetwork.com/forum/topic/367166-jinhao-86-well-dang/",
  registryKey: "fpn-jinhao-86-phase178",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "community",
  summary: "长期使用者记录 86 的树脂颜色、螺纹帽、converter、O-ring、可插帽和个体密封体验；只作为样本与维护风险旁证。",
  locator: "resin colors; screw cap; converter; O-ring; postability; individual sealing observations",
});
const fpnCompare = source({
  key: "phase178-jinhao-86-85-fpn",
  title: "Fountain Pen Network：Jinhao 86 与 85 比较",
  url: "https://www.fountainpennetwork.com/forum/topic/368960-jinhao-86-vs-85-question/",
  registryKey: "fpn-jinhao-86-85-phase178",
  registryName: "Fountain Pen Network community",
  sourceType: "forum",
  tier: "community",
  summary: "讨论记录 86 相比 85 的笔身与可插帽差异，并提供与 Wing Sung 601 的尺寸旁证；不替代型号的工厂规格。",
  locator: "86 versus 85; postability; slightly longer and larger than Wing Sung 601 sample",
});
const professional = source({
  key: "phase178-jinhao-86-dale",
  title: "Dale Thele：Jinhao 86 Resin Fountain Pen",
  url: "https://www.dalethele.com/post/jinhao-86-resin-fountain-pen",
  registryKey: "dalethele-jinhao-86-phase178",
  registryName: "Dale Thele",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立评测以实物照片和书写记录说明 86 的树脂护尖路线；手感与颜色只代表评测样本，不推广为每个 SKU 的固定事实。",
  locator: "Jinhao 86 resin body, hooded nib and writing sample",
});
const svg: CuratedSource = {
  key: "phase178-jinhao-86-svg",
  title: "Jinhao 86 结构事实图（本站原创）",
  url: "/images/library/site-original/phase178/jinhao/86.svg",
  registryKey: "fountain-pen-graph-editorial-phase178",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase178",
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  allowedUse: "store_full",
  license: "site-original",
  summary: "本站原创 factual SVG；示意图，非产品照片，不证明比例、颜色、重量或库存。",
  archiveUrl: "/images/library/site-original/phase178/jinhao/86.svg",
  archiveLocator: "project-public-asset:/images/library/site-original/phase178/jinhao/86.svg;factual-svg=true;product-photo=false;not-to-scale=true",
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, locator: string) { return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true }; }
const baseBrand = phase63JinhaoPacks.find((pack) => pack.expectedType === "brand");
if (!baseBrand) throw new Error("Phase 178 Jinhao brand prerequisite is missing.");
const brand = structuredClone(baseBrand);
brand.entityId = PHASE178_JINHAO_BRAND_ID;
brand.key = "phase178-jinhao-brand-navigation-v1";

export const phase178Jinhao86Packs: CuratedEntityPack[] = [
  brand,
  {
    key: "phase178-jinhao-86-v1",
    entityId: PHASE178_86_ID,
    expectedType: "pen",
    expectedSlug: "金豪-jinhao-86",
    canonicalName: "金豪 Jinhao 86",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/jinhao-86-phase178.md",
    storyTitle: "Jinhao 86：树脂笔身、金属帽与护尖路线",
    primarySourceKey: supplier.key,
    depthTier: "B",
    aliases: [
      { alias: "Jinhao 86", language: "en", sourceKey: supplier.key },
      { alias: "金豪 86", language: "zh", sourceKey: supplier.key },
      { alias: "Jinhao 86 Hooded Nib", language: "en", sourceKey: official.key },
    ],
    sources: [official, supplier, fpn, fpnCompare, professional, svg],
    scopes: [{ key: SCOPE, scopeKey: SCOPE, validFrom: RETRIEVED, productionState: "current", materialScope: "树脂笔身、金属帽与护尖结构按当前产品与评测样本记录；颜色、批次和饰件不互相继承。", nibScope: "商品样本约 0.38–0.5 mm EF／M 字段不等于所有 SKU 的统一线宽。", editionScope: "当代市场型号；颜色、帽色、converter 与库存按渠道核对。" }],
    claims: [
      {
        key: "phase178-jinhao-86-identity",
        predicate: "model_identity",
        objectText: "Jinhao 86 是独立的树脂笔身、金属帽、护尖与 converter 型号；它常被拿来与 Parker 51 或 Wing Sung 601 比较，但不等同于这些品牌或型号，也不与 85、911、51A 合并。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: supplier.key,
        locator: supplier.summary,
        evidence: [
          { key: "phase178-jinhao-86-identity-supplier", sourceKey: supplier.key, scopeKey: SCOPE, locator: "Jinhao 86 model number and product fields" },
          { key: "phase178-jinhao-86-identity-official", sourceKey: official.key, scopeKey: SCOPE, locator: "Jinhao product-line context" },
          { key: "phase178-jinhao-86-identity-review", sourceKey: professional.key, scopeKey: SCOPE, locator: "independent resin 86 review" },
        ],
      },
      {
        key: "phase178-jinhao-86-structure",
        predicate: "hooded_nib_filling_boundary",
        objectText: "86 的常见组合是树脂笔身、金属帽、护尖、螺纹帽和 twist converter；可插帽与多圈旋合是使用边界，不将 911 的按压帽事实移植过来。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: supplier.key,
        locator: supplier.summary,
        evidence: [
          { key: "phase178-jinhao-86-structure-supplier", sourceKey: supplier.key, scopeKey: SCOPE, locator: "resin handle, stainless nib and twist converter" },
          { key: "phase178-jinhao-86-structure-fpn", sourceKey: fpn.key, scopeKey: SCOPE, locator: "screw cap, O-ring and converter sample" },
        ],
      },
      {
        key: "phase178-jinhao-86-nib",
        predicate: "nib_boundary",
        objectText: "86 的市场尖号常见 EF，供应页写约 0.5 mm、玩家样本写约 0.38 mm；这些差异说明线宽必须绑定 SKU 和实物，不能宣称单一全系标准。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: supplier.key,
        locator: supplier.summary,
        evidence: [
          { key: "phase178-jinhao-86-nib-supplier", sourceKey: supplier.key, scopeKey: SCOPE, locator: "0.5 mm writing width and stainless nib field" },
          { key: "phase178-jinhao-86-nib-fpn", sourceKey: fpn.key, scopeKey: SCOPE, locator: "0.38 mm sample and individual writing context" },
        ],
      },
      {
        key: "phase178-jinhao-86-boundary",
        predicate: "version_boundary",
        objectText: "86 的颜色、帽色和尖号属于变体或市场 SKU；85、911、51A、Hero 329 与 Wing Sung 601 是相邻比较对象，不能用其材料、帽型、尺寸或品牌关系覆盖 86。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: fpnCompare.key,
        locator: fpnCompare.summary,
        evidence: [
          { key: "phase178-jinhao-86-boundary-compare", sourceKey: fpnCompare.key, scopeKey: SCOPE, locator: "86 versus 85 and Wing Sung 601" },
          { key: "phase178-jinhao-86-boundary-review", sourceKey: professional.key, scopeKey: SCOPE, locator: "resin 86 sample boundary" },
        ],
      },
      {
        key: "phase178-jinhao-86-care",
        predicate: "maintenance_boundary",
        objectText: "converter 与护尖换墨以常温清水吸排为主，避免热水、酒精、研磨剂和硬针；螺纹或接口发涩先软化清洁，不用胶水、纸团或蛮力改变密封。",
        factClass: "editorial",
        confidence: 0.95,
        sourceKey: official.key,
        locator: official.summary,
        evidence: [{ key: "phase178-jinhao-86-care-evidence", sourceKey: official.key, scopeKey: SCOPE, locator: "brand cleaning and converter context" }],
      },
    ],
    variants: [
      { key: "phase178-jinhao-86-ef", name: "86 EF 护尖", notes: "市场常见尖号；线宽按具体样本核对。", sourceKey: supplier.key, variantKind: "nib", market: "Global" },
      { key: "phase178-jinhao-86-colors", name: "彩色树脂与银色帽版本", notes: "khaki、peacock blue 等颜色为市场叫法，不拆成独立型号。", sourceKey: fpn.key, variantKind: "color", market: "Global" },
      { key: "phase178-jinhao-85-boundary", name: "Jinhao 85（相邻型号，不并入）", notes: "金属／黄铜路线和帽型资料不同。", sourceKey: fpnCompare.key, variantKind: "edition_group" },
    ],
    spec: {
      brandEntityId: PHASE178_JINHAO_BRAND_ID,
      values: {
        series_name: "Jinhao 86",
        release_year: "当代市场型号；首发年份未由可靠来源固定",
        origin_country: "Jinhao 中国产品线；具体批次按实物与渠道核对",
        nib: "常见 EF 护尖，商品样本约 0.38–0.5 mm；尖号按 SKU 核对",
        fill_system: "twist converter；墨囊兼容性按接口与市场核对",
        material: "树脂笔身、金属笔帽与夹子、钢制护尖组件",
        dimensions: "独立评测指向比 Wing Sung 601 略长、略粗；统一目录尺寸未固定",
        weight: "树脂笔身与金属帽的中等重量路线；具体批次按实物核对",
        status: "当代市场可见；颜色、尖号和库存随渠道变化",
      },
      evidence: [
        evidence("brand_entity_id", "phase178-jinhao-86-brand", supplier.key, "Jinhao maker context"),
        evidence("series_name", "phase178-jinhao-86-series", supplier.key, "86 model number"),
        evidence("release_year", "phase178-jinhao-86-release", professional.key, "dated review; launch year withheld"),
        evidence("origin_country", "phase178-jinhao-86-origin", supplier.key, "Shanghai/China product field"),
        evidence("nib", "phase178-jinhao-86-nib", supplier.key, "stainless nib and writing width field"),
        evidence("fill_system", "phase178-jinhao-86-fill", supplier.key, "twist converter field"),
        evidence("material", "phase178-jinhao-86-material", supplier.key, "resin handle and metal cap context"),
        evidence("dimensions", "phase178-jinhao-86-dimensions", fpnCompare.key, "relative sample dimension boundary"),
        evidence("weight", "phase178-jinhao-86-weight", fpn.key, "metal cap and resin body sample balance"),
        evidence("status", "phase178-jinhao-86-status", official.key, "current product-line context"),
      ],
    },
    timeline: [{ key: "phase178-jinhao-86-current", title: "86 当代型号记录", eventType: "model_released", startDate: RETRIEVED, circa: true, description: "资料检索日仍可见 86 产品与评测记录；不是首发年份声明。", sourceKey: supplier.key }],
    media: [{ key: "phase178-jinhao-86-primary-media", title: "Jinhao 86 结构事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: svg.url, usageStatus: "primary" }],
  },
];
