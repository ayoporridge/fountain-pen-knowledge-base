import type {
  CuratedClaimEvidence,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-26";

export const PHASE241_PILOT_ID = "Zt-PbXkE7UHM";
export const PHASE241_PEN_ID = "p241PilotCustomHeritageSE";
export const PHASE241_PEN_SLUG = "pilot-custom-heritage-se";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup?: string;
  itemType?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.independenceGroup ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.itemType,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase241",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase241",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary,
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  category: web({
    key: "phase241-pilot-catalog-category",
    title: "PILOT 日本万年筆当前目录",
    url: "https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004",
    registryKey: "pilot-catalog-phase241",
    registryName: "PILOT web catalog",
    independenceGroup: "pilot-official",
    summary: "日本官方当前目录把 Custom Heritage SE 与 91、92、912 等列为独立条目，用于品牌导航和当前产品存在性核验。",
  }),
  product: web({
    key: "phase241-pilot-custom-heritage-se-product",
    title: "PILOT Custom Heritage SE FKVH-3MR-MABF 官方产品页",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000247&volumeName=00004",
    registryKey: "pilot-custom-heritage-se-product-phase241",
    registryName: "PILOT web catalog",
    independenceGroup: "pilot-official",
    summary: "exact SKU 页面列 FKVH-3MR-MABF、14K No.5 F、树脂轴帽、14.7 mm、135 mm、22 g、CON-40/CON-70N、随附 CON-70N、五色 F/M line-up 与含税 44,000 日元建议零售价。",
  }),
  heritage: web({
    key: "phase241-pilot-custom-heritage-lineup",
    title: "Pilot Custom Heritage 系列官方页面",
    url: "https://www.pilot-custom.jp/en/lineup/heritage.html",
    registryKey: "pilot-custom-heritage-phase241",
    registryName: "Pilot Custom",
    independenceGroup: "pilot-official",
    summary: "官方英文页面把 SE、912、91、92、CR 分列，确认 SE 使用 FKVH-3MR、14K No.5、F/M，并解释 SE 来自法语 seul 与独特大理石纹样。",
  }),
  care: web({
    key: "phase241-pilot-fountain-care",
    title: "PILOT 钢笔使用与清洁说明",
    url: "https://www.pilot.co.jp/support/warranty/jp/warranty_assets/pdf/fountain_type_p_jp.pdf",
    registryKey: "pilot-care-phase241",
    registryName: "PILOT Japan support",
    independenceGroup: "pilot-official",
    itemType: "pdf",
    summary: "官方通用说明支持使用常温清水清洁、避免高低温和直晒、不用溶剂或酒精、不自行拆修，并建议使用 Pilot 墨水；仅用于维护边界。",
  }),
  retailer: web({
    key: "phase241-pilot-custom-heritage-se-retailer",
    title: "Iguanasell Pilot Custom Heritage SE FKVH-3MR",
    url: "https://www.iguanasell.com/products/pilot-custom-heritage-se-fountain-pen-resin-orange-fkvh-3mr-mao",
    registryKey: "iguanasell-pilot-custom-heritage-se-phase241",
    registryName: "Iguanasell",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "iguanasell",
    summary: "独立钢笔零售商以 FKVH-3MR 的颜色与尖宽后缀销售 Custom Heritage SE，可作为型号和市场 SKU 的旁证；价格、库存和包装不覆盖日本官方字段。",
  }),
  brandSvg: diagram(
    "phase241-pilot-brand-svg",
    "Pilot brand and Custom Heritage navigation factual diagram",
    "/images/library/site-original/phase241/pilot/brand.svg",
    "本站原创 factual SVG；表达 Pilot 品牌导航、Custom Heritage 分支与 SE 型号边界。",
  ),
  penSvg: diagram(
    "phase241-pilot-custom-heritage-se-svg",
    "Pilot Custom Heritage SE factual diagram",
    "/images/library/site-original/phase241/pilot/custom-heritage-se.svg",
    "本站原创 factual SVG；表达 FKVH-3MR、No.5 14K、F/M、十个颜色尖宽 SKU 和官方规格边界。",
  ),
} as const;

function claimEvidence(key: string, sourceKey: string, scopeKey: string, locator: string): CuratedClaimEvidence {
  return { key, sourceKey, scopeKey, locator };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function media(source: CuratedSource, key: string, title: string, localPath: string) {
  return [{
    key,
    title,
    sourceKey: source.key,
    localPath,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
    sourceUrl: localPath,
    usageStatus: "primary" as const,
  }];
}

const brandScope = "phase241-pilot-brand-navigation";
const penScope = "phase241-pilot-custom-heritage-se-current";

const brand: CuratedEntityPack = {
  key: "phase241-pilot-brand-v1",
  entityId: PHASE241_PILOT_ID,
  expectedType: "brand",
  expectedSlug: "pilot",
  canonicalName: "百乐 Pilot",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pilot-brand-phase241.md",
  storyTitle: "Pilot：从完整产品导航到 Custom Heritage SE",
  primarySourceKey: S.category.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot", language: "en", sourceKey: S.category.key },
    { alias: "百乐", language: "zh", sourceKey: S.category.key },
    { alias: "PILOT Corporation", language: "en", sourceKey: S.category.key },
  ],
  sources: [S.category, S.product, S.heritage, S.care, S.retailer, S.brandSvg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "Pilot 日本当前万年笔目录与 Custom Heritage SE 导航；不将地区库存视为全球在售承诺。",
  }],
  claims: [
    {
      key: "phase241-pilot-brand-identity",
      predicate: "brand_identity",
      objectText: "Pilot（百乐）是日本钢笔制造品牌；当前日本目录把 Custom、Custom Heritage、Capless、Elite、Elabo、Cavalier、Prera、Cocoon、Lightive、Kakuno 等作为不同产品路线展示。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.category.key,
      locator: S.category.summary,
      evidence: [claimEvidence("phase241-pilot-brand-identity-category", S.category.key, brandScope, S.category.summary)],
    },
    {
      key: "phase241-pilot-custom-heritage-navigation",
      predicate: "brand_model_navigation",
      objectText: "品牌导航保留 Custom Heritage 91、92、912 与新建 SE 四个独立入口；SE 对应 FKVH-3MR，不能被当作 91、92 或 912 的颜色变体。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.heritage.key,
      locator: S.heritage.summary,
      evidence: [claimEvidence("phase241-pilot-custom-heritage-navigation-heritage", S.heritage.key, brandScope, S.heritage.summary), claimEvidence("phase241-pilot-custom-heritage-navigation-product", S.product.key, brandScope, S.product.summary)],
    },
    {
      key: "phase241-pilot-se-boundary",
      predicate: "model_identity_boundary",
      objectText: "Custom Heritage SE 是 FKVH-3MR 平台；大理石黑、红、蓝、橙、绿与 F/M 形成市场 SKU 层，官方说明每支纹样不同，但不能因此拆成十个功能不同的型号。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase241-pilot-se-boundary-product", S.product.key, brandScope, S.product.summary), claimEvidence("phase241-pilot-se-boundary-retailer", S.retailer.key, brandScope, S.retailer.summary)],
    },
    {
      key: "phase241-pilot-regional-availability",
      predicate: "regional_availability_boundary",
      objectText: "日本官方目录能够证明 FKVH-3MR 的产品存在；海外零售商的库存和地区分销状态必须按市场与检索日期理解，不能覆盖日本官方型号身份。",
      factClass: "editorial",
      confidence: 0.96,
      sourceKey: S.retailer.key,
      locator: S.retailer.summary,
      evidence: [claimEvidence("phase241-pilot-regional-availability-product", S.product.key, brandScope, S.product.summary), claimEvidence("phase241-pilot-regional-availability-retailer", S.retailer.key, brandScope, S.retailer.summary)],
    },
  ],
  timeline: [
    {
      key: "phase241-pilot-current-directory",
      title: "Custom Heritage SE 出现在日本当前目录",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "PILOT 日本当前万年笔目录列出 Custom Heritage SE，并以 exact product page 承担型号与规格字段。",
      sourceKey: S.category.key,
    },
    {
      key: "phase241-pilot-se-exact-sku",
      title: "FKVH-3MR exact SKU 规格可核验",
      eventType: "model_released",
      startDate: RETRIEVED,
      circa: true,
      description: "官方产品页可核验 FKVH-3MR-MABF、大理石颜色尾缀、No.5 14K、CON-40/CON-70N、135 mm 与 22 g；此检索日期不倒推首发年份。",
      sourceKey: S.product.key,
    },
  ],
  media: media(S.brandSvg, "phase241-pilot-brand-primary", "Pilot Custom Heritage 导航事实图（非产品照片）", "/images/library/site-original/phase241/pilot/brand.svg"),
};

const pen: CuratedEntityPack = {
  key: "phase241-pilot-custom-heritage-se-v1",
  entityId: PHASE241_PEN_ID,
  expectedType: "pen",
  expectedSlug: PHASE241_PEN_SLUG,
  canonicalName: "百乐 Pilot Custom Heritage SE",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pilot-custom-heritage-se-phase241.md",
  storyTitle: "Pilot Custom Heritage SE：FKVH-3MR 的大理石纹样与 No.5 尖",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot Custom Heritage SE", language: "en", sourceKey: S.heritage.key },
    { alias: "FKVH-3MR", language: "en", sourceKey: S.product.key },
    { alias: "Custom Heritage SE 大理石", language: "zh", sourceKey: S.product.key },
    { alias: "百乐 Custom Heritage SE", language: "zh", sourceKey: S.product.key },
  ],
  sources: [S.product, S.category, S.heritage, S.care, S.retailer, S.penSvg],
  scopes: [{
    key: penScope,
    scopeKey: penScope,
    market: "Japan current catalog",
    validFrom: RETRIEVED,
    productionState: "current",
    nibScope: "官方系列页列 F/M；具体 exact SKU FKVH-3MR-MABF 为 F。",
    materialScope: "官方产品页列树脂轴与帽；大理石纹样是外观 variant，不是独立底材型号。",
    editionScope: "FKVH-3MR Custom Heritage SE；不与 91、92、912 或 Custom 74/742/743 合并。",
  }],
  claims: [
    {
      key: "phase241-se-identity",
      predicate: "model_identity",
      objectText: "Pilot Custom Heritage SE 的平台代码为 FKVH-3MR；官方 exact SKU FKVH-3MR-MABF 对应大理石黑 F，SE 是 Custom Heritage 中独立的平顶树脂型号。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase241-se-identity-product", S.product.key, penScope, S.product.summary), claimEvidence("phase241-se-identity-heritage", S.heritage.key, penScope, S.heritage.summary)],
    },
    {
      key: "phase241-se-nib",
      predicate: "nib_specification",
      objectText: "官方列 14K No.5；Custom Heritage 系列页列 F/M，exact FKVH-3MR-MABF 为 F。不能把 912 的 FA、PO、WA 或 92 的结构写入 SE。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase241-se-nib-product", S.product.key, penScope, S.product.summary), claimEvidence("phase241-se-nib-heritage", S.heritage.key, penScope, S.heritage.summary)],
    },
    {
      key: "phase241-se-fill",
      predicate: "filling_system",
      objectText: "官方产品页列 Pilot cartridge/converter 平台，兼容 CON-40 与 CON-70N，具体 FKVH-3MR-MABF 随附 CON-70N；这与 92 的活塞或 823 的真空结构不同。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase241-se-fill-product", S.product.key, penScope, S.product.summary)],
    },
    {
      key: "phase241-se-marble-variants",
      predicate: "market_variants",
      objectText: "官方 line-up 列大理石黑、红、蓝、橙、绿，每色均有 F/M；尾缀分别为 MABF/MABM、MARF/MARM、MALF/MALM、MAOF/MAOM、MAGF/MAGM。纹样个体差异不构成十个独立型号。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase241-se-marble-variants-product", S.product.key, penScope, S.product.summary), claimEvidence("phase241-se-marble-variants-retailer", S.retailer.key, penScope, S.retailer.summary)],
    },
    {
      key: "phase241-se-dimensions",
      predicate: "physical_specification",
      objectText: "日本官方 exact product page 列最大直径 14.7 mm、全长 135 mm、重量 22 g；零售商包装或含墨称重不能覆盖该官方字段。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase241-se-dimensions-product", S.product.key, penScope, S.product.summary)],
    },
    {
      key: "phase241-se-care",
      predicate: "maintenance_boundary",
      objectText: "按 Pilot 通用说明用常温清水清洁并充分干燥，避开酒精、溶剂、高低温和直晒；树脂裂纹、漏墨、螺纹异常或尖端错位时停止施力并联系官方或专业维修。",
      factClass: "editorial",
      confidence: 0.97,
      sourceKey: S.care.key,
      locator: S.care.summary,
      evidence: [claimEvidence("phase241-se-care-official", S.care.key, penScope, S.care.summary)],
    },
    {
      key: "phase241-se-buying",
      predicate: "buying_boundary",
      objectText: "购买或收二手时应核对 FKVH-3MR 平台、颜色与 F/M 尾缀、尖刻和 converter；日本目录证明型号存在，海外库存与价格按地区和日期重新确认。",
      factClass: "editorial",
      confidence: 0.96,
      sourceKey: S.retailer.key,
      locator: S.retailer.summary,
      evidence: [claimEvidence("phase241-se-buying-retailer", S.retailer.key, penScope, S.retailer.summary), claimEvidence("phase241-se-buying-product", S.product.key, penScope, S.product.summary)],
    },
  ],
  variants: [
    ["MABF", "Marble Black / F"],
    ["MABM", "Marble Black / M"],
    ["MARF", "Marble Red / F"],
    ["MARM", "Marble Red / M"],
    ["MALF", "Marble Blue / F"],
    ["MALM", "Marble Blue / M"],
    ["MAOF", "Marble Orange / F"],
    ["MAOM", "Marble Orange / M"],
    ["MAGF", "Marble Green / F"],
    ["MAGM", "Marble Green / M"],
  ].map(([suffix, name]) => ({
    key: `phase241-se-variant-${suffix.toLowerCase()}`,
    name,
    notes: `FKVH-3MR market SKU suffix ${suffix}; official product page states marble pattern differs between individual pens.`,
    sourceKey: S.product.key,
    variantKind: "market_sku" as const,
    productCode: `FKVH-3MR-${suffix}`,
    market: "Japan",
  })),
  spec: {
    brandEntityId: PHASE241_PILOT_ID,
    values: {
      series_name: "Pilot Custom Heritage SE / FKVH-3MR",
      release_year: "官方当前目录可见；exact SKU 页面未公布首发年份",
      origin_country: "日本；Pilot Custom Heritage 产品线",
      nib: "14K No.5；官方系列页列 F/M，FKVH-3MR-MABF 为 F",
      fill_system: "Pilot cartridge/converter；兼容 CON-40、CON-70N，FKVH-3MR-MABF 随附 CON-70N",
      material: "树脂轴与笔帽；大理石纹样为外观 variant",
      dimensions: "最大径 14.7 mm、全长 135 mm",
      weight: "22 g（日本官方产品页）",
      price_range: "日本官方检索日建议零售价含税 44,000 日元；地区价格与库存会变动",
      status: "日本官方目录可核验；地区分销和库存按市场重新确认",
    },
    evidence: [
      evidence("phase241-se-spec-brand", "brand_entity_id", S.category.key, penScope, "PILOT official current category"),
      evidence("phase241-se-spec-series", "series_name", S.product.key, penScope, "official title and FKVH-3MR platform"),
      evidence("phase241-se-spec-year", "release_year", S.product.key, penScope, "current catalog; launch year withheld"),
      evidence("phase241-se-spec-origin", "origin_country", S.category.key, penScope, "Japanese Pilot catalog context"),
      evidence("phase241-se-spec-nib", "nib", S.product.key, penScope, "14K No.5 and F/M line-up"),
      evidence("phase241-se-spec-fill", "fill_system", S.product.key, penScope, "CON-40/CON-70N and supplied CON-70N"),
      evidence("phase241-se-spec-material", "material", S.product.key, penScope, "resin barrel and cap; marble finish"),
      evidence("phase241-se-spec-dimensions", "dimensions", S.product.key, penScope, "14.7 mm maximum diameter and 135 mm length"),
      evidence("phase241-se-spec-weight", "weight", S.product.key, penScope, "22 g official product field"),
      evidence("phase241-se-spec-price", "price_range", S.product.key, penScope, "44,000 yen including tax at retrieval"),
      evidence("phase241-se-spec-status", "status", S.product.key, penScope, "Japan current directory; regional availability boundary"),
    ],
  },
  media: media(S.penSvg, "phase241-pilot-se-primary", "Pilot Custom Heritage SE 事实图（非产品照片）", "/images/library/site-original/phase241/pilot/custom-heritage-se.svg"),
};

export const phase241PilotCustomHeritageSEPacks: CuratedEntityPack[] = [brand, pen];
