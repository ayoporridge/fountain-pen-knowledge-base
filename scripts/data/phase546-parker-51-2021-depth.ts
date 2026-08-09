import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
} from "../lib/curated-content-pack";
import { phase426BrandDepthRefreshPacks } from "./phase426-brand-depth-refresh";
import { phase28Parker51Packs } from "./phase28-parker-51";

const RETRIEVED = "2026-08-09";
const MODERN_ID = "jy_bRVs1hdMo";

const officialProduct: CuratedSource = {
  key: "parker-51-official-product-2123491",
  registryKey: "parker-official",
  registryName: "Parker official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "parker-newell-official",
  title: "Parker 51 Black CT Fountain Pen — item 2123491",
  url: "https://www.parkerpen.com/writing-types/collections/parker-51/parker-51-fountain-pen/SAP_2123491.html",
  homepageUrl: "https://www.parkerpen.com/",
  author: "Parker / Newell Brands",
  publishedAt: null,
  retrievedAt: RETRIEVED,
  summary:
    "Parker 官方 Black CT 单品页，确认一个具体 SKU 的不锈钢包覆式笔尖、树脂笔身、金属笔帽、随盒 Quink 墨囊与两年保修；不外推全系列材料。",
  allowedUse: "summary_only",
  archiveUrl:
    "https://www.parkerpen.com/writing-types/collections/parker-51/parker-51-fountain-pen/SAP_2123491.html",
  archiveLocator:
    "live-source-not-frozen; retrieved=2026-08-09; external_archive=false; raw_source_stored=false; locator=item 2123491 features and specifications",
};

const modernHeritage: CuratedSource = {
  key: "parker-51-modern-heritage-japan-2022",
  registryKey: "newell-brands-japan",
  registryName: "Newell Brands Japan / PR TIMES",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "newell-brands-japan-parker-release",
  title: "PARKER51 MH（Modern Heritage）日本发布稿",
  url: "https://prtimes.jp/main/html/rd/p/000000005.000089351.html",
  homepageUrl: "https://prtimes.jp/",
  author: "ニューウェルブランズ・ジャパン合同会社",
  publishedAt: "2022-06-08",
  retrievedAt: RETRIEVED,
  summary:
    "Newell Brands Japan 的 2022 年发布稿，记录 PARKER51 MH（Modern Heritage）在日本上市及其复古颜色、现代帽盖和包覆式笔尖叙事。",
  allowedUse: "summary_only",
  archiveUrl: "https://prtimes.jp/main/html/rd/p/000000005.000089351.html",
  archiveLocator:
    "live-source-not-frozen; retrieved=2026-08-09; external_archive=false; raw_source_stored=false; locator=2022-06-08 launch headline and product description",
};

function evidence(
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
): CuratedClaim["evidence"][number] {
  return { key, sourceKey, scopeKey, locator };
}

const scopes: CuratedScope[] = [
  {
    key: "phase546-current-sku",
    scopeKey: "parker-51-modern-black-ct-sku-2123491",
    validFrom: "2021",
    productionState: "current",
    market: "official product page",
    materialScope: "Black CT sample only",
    editionScope: "one official modern Parker 51 SKU; not the whole Core／Deluxe range",
  },
  {
    key: "phase546-modern-heritage-japan",
    scopeKey: "parker-51-modern-heritage-japan-2022",
    validFrom: "2022-06-08",
    productionState: "current",
    market: "Japan",
    nibScope: "hooded-nib product description; exact SKU configurations remain market-specific",
    editionScope: "PARKER51 MH Modern Heritage regional release",
  },
];

const claims: CuratedClaim[] = [
  {
    key: "phase546-official-sku-identity",
    predicate: "official_sku_boundary",
    objectText:
      "Parker 官方单品页的 Black CT 样本货号为 2123491；该货号只证明 Black CT 这一具体现代 SKU，不代表所有 Core／Deluxe 颜色和饰面。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: officialProduct.key,
    locator: "item 2123491 and Black CT product description",
    evidence: [
      evidence(
        "phase546-sku-evidence",
        officialProduct.key,
        "phase546-current-sku",
        "item number 2123491; Black CT product page",
      ),
    ],
  },
  {
    key: "phase546-black-ct-materials",
    predicate: "sample_material_boundary",
    objectText:
      "Black CT 2123491 页面明确写出黑色耐用树脂笔身、不锈钢笔帽、钯色饰件与不锈钢包覆式笔尖；不能把该单品的材料描述回填为所有版本统一规格。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: officialProduct.key,
    locator: "features and specifications for Black CT",
    evidence: [
      evidence(
        "phase546-material-evidence",
        officialProduct.key,
        "phase546-current-sku",
        "Black precious resin, stainless-steel cap, palladium trims, stainless-steel nib",
      ),
    ],
  },
  {
    key: "phase546-modern-heritage-boundary",
    predicate: "regional_follow_on",
    objectText:
      "2022-06-08 日本发布的 PARKER51 MH（Modern Heritage）是现代平台的地区化后续产品叙事；它延续 1941 设计与配色语境，但不改变本页与 vintage Parker 51 的身份分离。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: modernHeritage.key,
    locator: "2022-06-08 launch headline and Modern Heritage description",
    evidence: [
      evidence(
        "phase546-mh-evidence",
        modernHeritage.key,
        "phase546-modern-heritage-japan",
        "PARKER51 MH launch date and modernized heritage-design description",
      ),
    ],
  },
  {
    key: "phase546-official-warranty-boundary",
    predicate: "warranty_boundary",
    objectText:
      "官方 Black CT 单品页列出自原始购买日起两年材料与工艺保修；二手、改装或跨地区购买仍需按购买凭证和当地条款确认服务资格。",
    factClass: "editorial",
    confidence: 0.97,
    sourceKey: officialProduct.key,
    locator: "warranty section for product 2123491",
    evidence: [
      evidence(
        "phase546-warranty-evidence",
        officialProduct.key,
        "phase546-current-sku",
        "two-year warranty from date of original purchase",
      ),
    ],
  },
  {
    key: "phase546-care-not-vintage-repair",
    predicate: "maintenance_boundary",
    objectText:
      "现代 Parker 51 的清洗按 Parker 墨囊／上墨器 care guide 处理；官方现代清洗流程不能替代 vintage Vacumatic 或 Aero-metric 的隔膜、囊管和 collector 维修。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "parker-care-guide",
    locator: "modern fountain-pen filling and cleaning guidance",
    evidence: [
      evidence(
        "phase546-care-evidence",
        "parker-care-guide",
        "modern-care",
        "remove cartridge or converter; flush with cool water; dry before refilling",
      ),
    ],
  },
];

const base = phase28Parker51Packs.find((pack) => pack.entityId === MODERN_ID);
if (!base) throw new Error("Phase 546 Parker 51 modern base pack is missing.");
const parkerBrand = phase426BrandDepthRefreshPacks.find(
  (pack) => pack.entityId === "vhqNYqDChhiN" && pack.expectedType === "brand",
);
if (!parkerBrand) throw new Error("Phase 546 Parker brand navigation pack is missing.");

export const PHASE546_PARKER_51_2021_ID = MODERN_ID;
export const PHASE546_PARKER_BRAND_ID = parkerBrand.entityId;

const parker51Depth: CuratedEntityPack = {
  ...base,
  key: "phase546-parker-51-2021-depth-v1",
  markdownFile:
    ".planning/content-research/parker-51-2021-depth-publishable-content-2026-08-09.md",
  storyTitle: "Parker 51（2021）：现代版本、复古外形与购买边界",
  sources: [...base.sources, officialProduct, modernHeritage],
  scopes: [...base.scopes, ...scopes],
  claims: [...base.claims, ...claims],
  timeline: [
    ...(base.timeline ?? []),
    {
      key: "phase546-modern-heritage-japan-2022",
      title: "日本发布 PARKER51 MH（Modern Heritage）",
      eventType: "revival",
      startDate: "2022-06-08",
      circa: false,
      description:
        "现代 Parker 51 平台的日本地区化后续发布；保留复古设计与配色叙事，不并入 vintage 生产线。",
      sourceKey: modernHeritage.key,
    },
  ],
};

export const phase546Parker512021DepthPacks: CuratedEntityPack[] = [
  parkerBrand,
  parker51Depth,
];
