import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE310_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE310_SILVER_ID = "phase310-sailor-pgs21-silver-112152";
export const PHASE310_SILVER_SLUG = "sailor-professional-gear-slim-21-silver";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase310-sailor-pgs21-silver-112152";

function web(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  tier?: CuratedSource["tier"];
  sourceType?: CuratedSource["sourceType"];
  registryKey?: string;
  registryName?: string;
  homepageUrl?: string;
  author?: string;
}): CuratedSource {
  const registryKey = input.registryKey ?? "sailor-official-phase310";
  return {
    key: input.key,
    registryKey,
    registryName:
      input.registryName ??
      (input.sourceType === "official"
        ? "The Sailor Pen Co., Ltd."
        : "Fountain Pen Graph editorial studio"),
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (input.sourceType === "official" ? "https://sailor.co.jp/" : "/"),
    itemType: input.sourceType === "user_submission" ? "image" : "web_page",
    author:
      input.author ??
      (input.sourceType === "official"
        ? "セーラー万年筆株式会社"
        : "Fountain Pen Graph editorial"),
    retrievedAt: RETRIEVED,
    allowedUse: input.sourceType === "user_submission" ? "store_full" : "summary_only",
    license: input.sourceType === "user_submission" ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator:
      input.sourceType === "user_submission"
        ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
        : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }],
  };
}

function specEvidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  official: web({
    key: "phase310-sailor-pgs21-silver-official",
    title: "プロフェッショナルギア スリム 21 シルバートリム万年筆 — 11-2152",
    url: "https://sailor.co.jp/product/11-2152/",
    summary:
      "Sailor 日本官网把 11-2152 列为 Professional Gear Slim 21 Silver Trim，2026-03-14 发售；白色组和黑色组各有 EF/F/MF/M/B/Z/MS 七种代码，21K 中型双色尖、两用式、PMMA、nickel chrome、φ17×124 mm、16.8 g，包装 PG-03B [99-1337-040]。",
    locator: "official product page title, release date, item-code groups and basic specification fields",
  }),
  gold: web({
    key: "phase310-sailor-pgs21-gold-boundary",
    title: "プロフェッショナルギア スリム 21 万年筆 — 11-2151",
    url: "https://sailor.co.jp/product/11-2151/",
    summary:
      "同日发布的 Gold Trim 11-2151 使用 Gold IP；与本页 11-2152 的 nickel chrome 和白/黑两组代码不同。两者共享 21K 中型、φ17×124 mm、16.8 g 的 Slim 结构，但不能压成一个 SKU。",
    locator: "11-2151 Gold IP specification and seven-code group",
  }),
  oldSlim: web({
    key: "phase310-sailor-pgs-old-slim",
    title: "プロフェッショナルギア スリム 金 万年筆 — 11-1221",
    url: "https://sailor.co.jp/product/11-1221/",
    summary:
      "旧 Professional Gear Slim 11-1221 是 14K 中型版本；只用于排除旧 14K 身份，不把旧评测规格倒灌到 2026 年的 11-2152。",
    locator: "old 11-1221 nib and Slim identity fields",
  }),
  mini: web({
    key: "phase310-sailor-pgs-mini",
    title: "プロフェッショナルギア スリムミニ 金 万年筆 — 11-1503",
    url: "https://sailor.co.jp/product/11-1503/",
    summary:
      "旧 Slim Mini 11-1503 为 14K 中型、闭合 109.5 mm、16.4 g 并使用 Mini converter；用于排除短身 Mini，不覆盖标准 Slim 21。",
    locator: "11-1503 Mini length, weight and converter fields",
  }),
  refill: web({
    key: "phase310-sailor-refill",
    title: "万年筆のインク補充方法",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary: "Sailor 官方说明墨囊与上墨器的安装、吸墨和耗材边界，并将 Realo 尾栓路线分开。",
    locator: "cartridge/converter refill steps and Realo distinction",
  }),
  care: web({
    key: "phase310-sailor-care",
    title: "万年筆のお手入れ方法",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary: "Sailor 官方维护说明给出清水吸排与晾干建议，并提醒材料和浸泡边界。",
    locator: "official cleaning and maintenance guidance",
  }),
  retailer: web({
    key: "phase310-sailor-pgs21-silver-retailer",
    title: "SAILOR プロフェッショナルギアスリム21 シルバートリム — 11-2152",
    url: "https://www.pen-house.net/item/48420.html",
    summary:
      "Pen House 日本零售页独立列出 Silver Trim 11-2152，并显示黑色 EF 11-2152-120 等商品代码；只用于交叉确认市场 SKU，不替代官网的规格与价格口径。",
    locator: "retailer title and 11-2152 item-code examples",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "pen-house-phase310",
    registryName: "Pen House",
    homepageUrl: "https://www.pen-house.net/",
    author: "Pen House",
  }),
  diagram: web({
    key: "phase310-sailor-pgs21-silver-svg",
    title: "Sailor Professional Gear Slim 21 Silver Trim 11-2152 factual diagram",
    url: "/images/library/site-original/phase310/sailor/professional-gear-slim-21-silver-112152.svg",
    summary: "本站原创事实 SVG；只呈现 11-2152 的颜色、代码与规格边界，非产品照片。",
    locator: "site-original factual SVG metadata",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase310",
  }),
} as const;

const inheritedBrand = phase33Sailor2026CurrentPacks.find(
  (pack) => pack.expectedType === "brand" && pack.expectedSlug === "sailor",
);
if (!inheritedBrand) throw new Error("Phase 310 Sailor brand pack missing.");

const model: CuratedEntityPack = {
  key: "phase310-sailor-pgs21-silver-112152-v1",
  entityId: PHASE310_SILVER_ID,
  expectedType: "pen",
  expectedSlug: PHASE310_SILVER_SLUG,
  canonicalName: "Sailor Professional Gear Slim 21 Silver Trim（11-2152）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-professional-gear-slim-21-silver-112152-phase310.md",
  storyTitle: "Sailor Professional Gear Slim 21 Silver Trim：白／黑两色的 11-2152",
  primarySourceKey: S.official.key,
  depthTier: "A",
  aliases: [
    { alias: "Sailor Professional Gear Slim 21 Silver Trim", language: "en", sourceKey: S.official.key },
    { alias: "Professional Gear Slim 21 11-2152", language: "en", sourceKey: S.official.key },
    { alias: "プロフェッショナルギア スリム 21 シルバートリム", language: "ja", sourceKey: S.official.key },
    { alias: "写乐 Professional Gear Slim 21 银饰款", language: "zh", sourceKey: S.official.key },
  ],
  sources: [S.official, S.gold, S.oldSlim, S.mini, S.refill, S.care, S.retailer, S.diagram],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Sailor Japan official current product page",
      validFrom: "2026-03-14",
      productionState: "current",
      nibScope: "21K medium bicolor EF/F/MF/M/B/Z/MS",
      materialScope: "PMMA body and nickel chrome plated metal parts",
      editionScope: "11-2152 white and black groups only",
    },
    {
      key: "phase310-pgs21-silver-boundaries",
      scopeKey: "phase310-pgs21-silver-boundaries",
      productionState: "current",
      editionScope: "excludes 11-2151 Gold IP, old 11-1221, Mini 11-1503 and full-size Pro Gear",
    },
    {
      key: "phase310-pgs21-silver-care",
      scopeKey: "phase310-pgs21-silver-care",
      productionState: "current",
      editionScope: "standard Sailor cartridge/converter care; not Realo tail-knob filling",
    },
    {
      key: "phase310-pgs21-silver-media",
      scopeKey: "phase310-pgs21-silver-media",
      productionState: "current",
      editionScope: "site-original factual SVG; not a product photo",
    },
  ],
  claims: [
    claim(
      "phase310-silver-identity",
      "model_identity",
      "11-2152 是 2026-03-14 发售的 Professional Gear Slim 21 Silver Trim 独立型号，包含白色和黑色两组代码；它不是 11-2151 Gold Trim 的颜色别名。",
      S.official.key,
      "release date, Silver Trim title and separate white/black code groups",
    ),
    claim(
      "phase310-silver-codes",
      "product_codes",
      "白色组使用 11-2152-110/210/310/410/610/710/910，黑色组使用 11-2152-120/220/320/420/620/720/920，对应 EF/F/MF/M/B/Z/MS。",
      S.official.key,
      "official product-code list",
    ),
    claim(
      "phase310-silver-spec",
      "specification",
      "官方规格为 21K 中型双色尖、墨囊／上墨器两用式、PMMA 笔盖／笔杆／大先、nickel chrome plating、φ17×124 mm（含笔夹）和 16.8 g。",
      S.official.key,
      "nib, filling, body material, metal finish, dimensions and weight fields",
    ),
    claim(
      "phase310-silver-boundary",
      "identity_boundaries",
      "11-2152 与 Gold IP 的 11-2151、旧 14K Slim 11-1221、短身 Mini 11-1503 及 21K 大型全尺寸 Pro Gear 均保持独立身份；相似平顶外观不足以合并。",
      S.gold.key,
      "sibling and historical product specifications",
    ),
    claim(
      "phase310-silver-care",
      "maintenance_guidance",
      "使用 Sailor 墨囊或标准上墨器；清洗时以室温清水反复吸排并自然晾干，不套用 Realo 尾栓或 Slim Mini 专用步骤。",
      S.care.key,
      "official maintenance and refill instructions",
    ),
    claim(
      "phase310-silver-selection",
      "selection_guidance",
      "购买时先核对主代码、白／黑颜色组、尾码和 nickel chrome 处理；若页面写 Gold IP、21K 大型或 109.5 mm Mini，应转到相应 sibling 页面。",
      S.official.key,
      "code groups and material fields",
      "editorial",
    ),
    claim(
      "phase310-silver-retailer-crosscheck",
      "market_sku_crosscheck",
      "Pen House 的商品页也把 Silver Trim 标为 11-2152，并以黑色 EF 的 11-2152-120 作为市场商品代码示例；该页只用于交叉核对 SKU，不替代官网规格。",
      S.retailer.key,
      "retailer title and black EF 11-2152-120 item-code example",
    ),
    claim(
      "phase310-silver-media",
      "media_identity_boundary",
      "主图是本站原创事实 SVG，不是产品照片，不复制 Sailor logo、锚形商标或产品刻字，也不证明实际色泽、比例或批次。",
      S.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    { key: "phase310-silver-white", name: "White（白色笔身）", notes: "EF/F/MF/M/B/Z/MS 对应 11-2152-110/210/310/410/610/710/910。", sourceKey: S.official.key, variantKind: "market_sku", productCode: "11-2152-110/210/310/410/610/710/910", market: "日本" },
    { key: "phase310-silver-black", name: "Black（黑色笔身）", notes: "EF/F/MF/M/B/Z/MS 对应 11-2152-120/220/320/420/620/720/920。", sourceKey: S.official.key, variantKind: "market_sku", productCode: "11-2152-120/220/320/420/620/720/920", market: "日本" },
    { key: "phase310-silver-nibs", name: "21K 中型双色尖", notes: "EF、F、MF、M、B、Zoom、Music 七种尖号；材料相同但线宽和用途不同。", sourceKey: S.official.key, variantKind: "nib", market: "日本" },
  ],
  spec: {
    brandEntityId: PHASE310_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor Professional Gear Slim 21 Silver Trim（11-2152）",
      release_year: "2026-03-14",
      origin_country: "日本品牌；本页未由产品页外推具体制造工厂",
      nib: "21K 中型双色金尖；EF、F、MF、M、B、Z、MS",
      fill_system: "Sailor 墨囊／上墨器两用式",
      material: "PMMA 树脂；金属部件为 nickel chrome plating",
      dimensions: "最大径 φ17 mm × 全长 124 mm（含笔夹）",
      weight: "16.8 g",
      price_range: "日本官网 2026-07-28 快照：EF/F/MF/M/B 为 ¥66,000；Z/MS 为 ¥68,200",
      status: "日本官网现行 11-2152；白／黑两组 Silver Trim SKU",
    },
    evidence: [
      specEvidence("phase310-silver-brand", "brand_entity_id", S.official.key, "official Sailor product page"),
      specEvidence("phase310-silver-series", "series_name", S.official.key, "product title and 11-2152 codes"),
      specEvidence("phase310-silver-release", "release_year", S.official.key, "2026-03-14 release field"),
      specEvidence("phase310-silver-origin", "origin_country", S.official.key, "Sailor Japan page; no factory inference"),
      specEvidence("phase310-silver-nib", "nib", S.official.key, "21K medium bicolor and seven widths"),
      specEvidence("phase310-silver-fill", "fill_system", S.official.key, "converter/cartridge field"),
      specEvidence("phase310-silver-material", "material", S.official.key, "PMMA and nickel chrome fields"),
      specEvidence("phase310-silver-dimensions", "dimensions", S.official.key, "φ17×124 mm including clip"),
      specEvidence("phase310-silver-weight", "weight", S.official.key, "16.8 g"),
      specEvidence("phase310-silver-price", "price_range", S.official.key, "JPY 66,000 and 68,200 official price fields"),
      specEvidence("phase310-silver-status", "status", S.official.key, "live 11-2152 page retrieved 2026-07-28"),
    ],
  },
  timeline: [{ key: "phase310-silver-release", title: "Professional Gear Slim 21 Silver Trim 11-2152 在日本发售", eventType: "model_released", startDate: "2026-03-14", circa: false, description: "Sailor 日本官网列出的 11-2152 白色与黑色 Silver Trim 发售日。", sourceKey: S.official.key }],
  media: [{ key: "phase310-silver-primary-media", title: "Professional Gear Slim 21 Silver Trim 11-2152 事实卡（非产品照片）", sourceKey: S.diagram.key, localPath: S.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.diagram.url, usageStatus: "primary" }],
};

export const phase310SailorProfessionalGearSlim21SilverPacks: CuratedEntityPack[] = [inheritedBrand, model];
