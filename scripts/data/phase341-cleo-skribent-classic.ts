import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-02";
export const PHASE341_CLEO_BRAND_ID = "phase341-cleo-skribent";
export const PHASE341_CLEO_BRAND_SLUG = "cleo-skribent";
export const PHASE341_CLEO_IDS = {
  gold: "phase341-cleo-classic-gold",
  palladium: "phase341-cleo-classic-palladium",
  metall: "phase341-cleo-classic-metall",
} as const;
export const PHASE341_CLEO_SLUGS = {
  gold: "cleo-skribent-classic-gold",
  palladium: "cleo-skribent-classic-palladium",
  metall: "cleo-skribent-classic-metall",
} as const;

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
  itemType?: string;
  group?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.group ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.itemType ?? "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase341",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase341",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1200x720`,
  };
}

const company = web({
  key: "phase341-cleo-official-company",
  title: "Cleo Skribent official：Fine writing instruments made in Germany",
  url: "https://www.cleo-skribent.de/en/our-company.html",
  registryKey: "cleo-official-company-phase341",
  registryName: "Cleo Skribent official",
  sourceType: "official",
  tier: "primary",
  summary: "官方公司页把 Cleo Skribent 放在 Bad Wilsnack 的德国制造语境，说明家族企业、最多 26 个部件、模具／注塑／笔尖加工与质量控制。",
  locator: "manufacturing, Bad Wilsnack, family enterprise, up to 26 parts and lifetime guarantee",
});

const collection = web({
  key: "phase341-cleo-official-collection",
  title: "Cleo Skribent official collection",
  url: "https://www.cleo-skribent.de/en/collection.html",
  registryKey: "cleo-official-collection-phase341",
  registryName: "Cleo Skribent official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 collection 将 Natura、Aura、Skribent Gold/Platinum、Classic Gold、Classic Palladium、Classic Metall 等路线并列，避免把 Classic 当成单一 SKU。",
  locator: "collection list: Classic Gold, Classic Palladium, Classic Metall and adjacent collections",
});

const catalog = web({
  key: "phase341-cleo-catalog-2025",
  title: "Cleo Skribent 2025 catalogue",
  url: "https://www.cleo-skribent.de/fileadmin/cleo/Dateien/Downloads/Katalog_2025_Web.pdf",
  registryKey: "cleo-official-catalog-phase341",
  registryName: "Cleo Skribent official catalog",
  sourceType: "book",
  tier: "contemporary_archive",
  itemType: "catalog_pdf",
  summary: "官方 2025 目录给出三条 Classic 路线的树脂、饰件、帽材、尖材与 piston／cartridge-converter 表；Gold 为 14 K，Palladium/Metall 基础路线为钢尖。",
  locator: "catalog pages 25-27: Classic Palladium, Classic Gold and Classic Metall specification tables",
});

const history = web({
  key: "phase341-cleo-brandenburg-80-years",
  title: "Brandenburg government：80 years of Cleo Schreibgeräte Bad Wilsnack",
  url: "https://brandenburg.de/cms/detail.php/brandenburg_06.c.887756.de",
  registryKey: "brandenburg-cleoskribent-phase341",
  registryName: "Land Brandenburg",
  sourceType: "official",
  tier: "professional_secondary",
  summary: "州政府 2025 年周年报道独立记录 Cleo 1945 年起源、Bad Wilsnack 后院车库、家族企业与德国制造历史语境。",
  locator: "80th anniversary history, 1945 origin, Bad Wilsnack and family enterprise",
});

const goldShop = web({
  key: "phase341-cleo-shop-gold",
  title: "Cleo official shop：Classic Gold",
  url: "https://shop.cleo-skribent.de/Kollektion/Classic-Gold/",
  registryKey: "cleo-official-shop-gold-phase341",
  registryName: "Cleo official shop",
  sourceType: "official",
  tier: "primary",
  summary: "官方商城把 Classic Gold 的黑、白、Bordeaux 与 piston／cartridge-converter 商品分列，支持当前路线和颜色变体边界。",
  locator: "Classic Gold collection: piston and cartridge/converter fountain pen listings and colors",
});

const palladiumShop = web({
  key: "phase341-cleo-shop-palladium",
  title: "Cleo official shop：Classic Palladium",
  url: "https://shop.cleo-skribent.de/Kollektion/Classic-Palladium/",
  registryKey: "cleo-official-shop-palladium-phase341",
  registryName: "Cleo official shop",
  sourceType: "official",
  tier: "primary",
  summary: "官方商城列 Classic Palladium 的 piston、cartridge/converter 与 14K gold-nib 商品，颜色包括黑、白和 Bordeaux。",
  locator: "Classic Palladium collection: piston, cartridge/converter and gold-nib listings",
});

const metallShop = web({
  key: "phase341-cleo-shop-metall",
  title: "Cleo official shop：Classic Metall",
  url: "https://shop.cleo-skribent.de/Kollektion/Classic-Metall/",
  registryKey: "cleo-official-shop-metall-phase341",
  registryName: "Cleo official shop",
  sourceType: "official",
  tier: "primary",
  summary: "官方商城列 Classic Metall 的 piston 与 cartridge/converter 商品及黑、白、Bordeaux 颜色，单支商品页显示钢尖基础路线。",
  locator: "Classic Metall collection: piston, cartridge/converter fountain pen listings and colors",
});

const penAddict = web({
  key: "phase341-cleo-penaddict-palladium",
  title: "The Pen Addict：Cleo Skribent Classic Palladium review",
  url: "https://www.penaddict.com/blog/2017/1/2/cleo-skribent-classic-palladium-fountain-pen-review",
  registryKey: "penaddict-cleoskribent-phase341",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立评测只描述一支 Classic Palladium 钢尖活塞样笔的盲帽、透明墨窗、轻量与书写体验；不外推所有年份、颜色或尖材。",
  locator: "review sample: piston filler, blind cap, clear ink window and steel nib",
});

const gentleman = web({
  key: "phase341-cleo-gentleman-stationer",
  title: "The Gentleman Stationer：Cleo Skribent Classic and Colour",
  url: "https://www.gentlemanstationer.com/blog/2017/5/3/pen-review-cleo-skribent-classic-and-colour",
  registryKey: "gentleman-stationer-cleoskribent-phase341",
  registryName: "The Gentleman Stationer",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立评测区分 Classic piston 版的大墨窗与盲帽和 cartridge/converter 版的结构差异，保留为样本级证据。",
  locator: "Classic piston filler versus cartridge/converter version; sample construction observations",
});

const paperMind = web({
  key: "phase341-cleo-paper-mind-14k",
  title: "The Paper Mind：Classic Palladium 14K gold nib",
  url: "https://thepapermind.com/products/cleo-skribent-classic-palladium-14k-gold-nib-fountain-pen-piston-white",
  registryKey: "paper-mind-cleoskribent-phase341",
  registryName: "The Paper Mind",
  sourceType: "retailer",
  tier: "retailer",
  summary: "独立零售商商品页记录一支白色 Classic Palladium 14K 活塞样本；仅用于 14K 升级变体与实物测量边界，不替代官方基础钢尖目录。",
  locator: "white Classic Palladium piston 14K sample; material, trim, filling and measurements",
});

const goldSvg = diagram(
  "phase341-cleo-gold-svg",
  "Cleo Classic Gold identity boundary factual SVG",
  "/images/library/site-original/phase341/cleo/classic-gold.svg",
  "本站原创 factual SVG；表达 Classic Gold 的树脂、镀金饰件、14 K 尖与两种供墨路径。",
);
const palladiumSvg = diagram(
  "phase341-cleo-palladium-svg",
  "Cleo Classic Palladium identity boundary factual SVG",
  "/images/library/site-original/phase341/cleo/classic-palladium.svg",
  "本站原创 factual SVG；表达 Palladium 基础钢尖与 14 K 变体、树脂和钯色饰件。",
);
const metallSvg = diagram(
  "phase341-cleo-metall-svg",
  "Cleo Classic Metall identity boundary factual SVG",
  "/images/library/site-original/phase341/cleo/classic-metall.svg",
  "本站原创 factual SVG；表达 Metall 的树脂笔身、哑光铬黄铜帽与供墨／尖材边界。",
);
const brandSvg = diagram(
  "phase341-cleo-brand-svg",
  "Cleo Skribent brand and Classic routes factual SVG",
  "/images/library/site-original/phase341/cleo/brand.svg",
  "本站原创 factual SVG；表达 Cleo Schreibgeräte、Cleo Skribent 与 Classic 三条路线导航。",
);

const brandScope = "phase341-cleo-skribent-brand";
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}
function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
) {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  } satisfies CuratedEntityPack["claims"][number];
}
function media(key: string, title: string, source: CuratedSource) {
  return [{
    key,
    title,
    sourceKey: source.key,
    localPath: source.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。",
    sourceUrl: source.url,
    usageStatus: "primary" as const,
  }];
}

const brand: CuratedEntityPack = {
  key: "phase341-cleo-skribent-brand-v1",
  entityId: PHASE341_CLEO_BRAND_ID,
  expectedType: "brand",
  expectedSlug: PHASE341_CLEO_BRAND_SLUG,
  canonicalName: "Cleo Skribent",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-cleo-skribent-classic/brand.md",
  storyTitle: "Cleo Skribent：Bad Wilsnack 的德国制笔与 Classic 三路线",
  primarySourceKey: company.key,
  depthTier: "A",
  aliases: [
    { alias: "Cleo Skribent", language: "en", sourceKey: company.key },
    { alias: "Cleo Schreibgeräte", language: "de", sourceKey: history.key, kind: "producer_name" },
    { alias: "克莱奥 Cleo Skribent", language: "zh", sourceKey: company.key },
  ],
  sources: [company, collection, catalog, history, penAddict, brandSvg],
  scopes: [{ key: brandScope, scopeKey: brandScope, market: "Cleo Skribent brand and Classic collection", productionState: "current", editionScope: "品牌导航只链接已核对的 Classic Gold、Classic Palladium、Classic Metall；Natura、Aura、Skribent Gold/Platinum 等路线另行展开" }],
  claims: [
    claim("cleo-brand-identity", "brand_identity", "Cleo Schreibgeräte 是 Bad Wilsnack 的公司与制造主体，Cleo Skribent 是其面向消费者的品牌名称；两者不是两个互不相关的制笔厂。", company.key, brandScope, "company name, Bad Wilsnack and Cleo Skribent brand context"),
    claim("cleo-brand-history", "brand_history", "Cleo 的企业与品牌历史从 1945 年起展开；2025 年官网与 Brandenburg 州政府报道分别记录八十周年节点。", history.key, brandScope, "1945 origin and 2025 80th anniversary"),
    claim("cleo-brand-origin", "manufacturing_origin", "官方公司页将生产地点放在德国 Bad Wilsnack，并把品牌定位为德国制造的家族企业。", company.key, brandScope, "Bad Wilsnack manufactury and family enterprise"),
    claim("cleo-brand-craft", "manufacturing_process", "官方资料说明制笔包含模具、精密注塑、笔尖加工和多道手工工序，一支工具最多处理二十六个独立部件；不能改写成每支笔完全手工。", company.key, brandScope, "up to 26 parts, tooling, injection molding and nib finishing"),
    claim("cleo-brand-collection", "collection_navigation", "官方 collection 将 Classic Gold、Classic Palladium、Classic Metall 与 Natura、Aura、Skribent Gold/Platinum 等路线并列；Classic 三路线的饰件、尖材和供墨不可互相覆盖。", collection.key, brandScope, "collection list and Classic route separation"),
    claim("cleo-brand-classic-boundary", "classic_family_boundary", "Classic Gold 是镀金饰件与 14 K 尖，Classic Palladium 是钯色饰件基础钢尖并有 14 K 变体，Classic Metall 另有哑光铬黄铜帽；三者分别建页。", catalog.key, brandScope, "2025 catalog Classic specification tables"),
  ],
  media: media("phase341-cleo-brand-media", brandSvg.title, brandSvg),
  timeline: [
    { key: "cleo-1945", title: "Cleo 企业起源", eventType: "brand_founded", startDate: "1945", circa: false, description: "Brandenburg 州政府与官方资料把 Cleo 的企业历史放在 1945 年起的 Bad Wilsnack。", sourceKey: history.key },
    { key: "cleo-2025", title: "Cleo 80 周年节点", eventType: "design_milestone", startDate: "2025", circa: false, description: "官方首页与州政府周年报道将 2025 年作为 Cleo 80 周年节点；不把它当作 Classic 型号首发年。", sourceKey: history.key },
  ],
};

type RouteKey = keyof typeof PHASE341_CLEO_IDS;
const ROUTES: Record<RouteKey, {
  id: string;
  slug: string;
  name: string;
  title: string;
  summary: string;
  markdownFile: string;
  shop: CuratedSource;
  svg: CuratedSource;
  material: string;
  nib: string;
  fill: string;
  variantNotes: string;
  routeBoundary: string;
  aliases: string[];
}> = {
  gold: {
    id: PHASE341_CLEO_IDS.gold,
    slug: PHASE341_CLEO_SLUGS.gold,
    name: "Cleo Skribent Classic Gold",
    title: "Cleo Skribent Classic Gold：14 K 金尖与镀金饰件",
    summary: "Cleo Skribent Classic Gold 是 Classic 家族的金色饰件路线：precious resin、gold-plated fittings、14 K 金尖，官方目录同时列 piston 与 cartridge/converter。",
    markdownFile: ".planning/quick/260802-cleo-skribent-classic/classic-gold.md",
    shop: goldShop,
    svg: goldSvg,
    material: "precious resin；gold-plated fittings",
    nib: "14 K gold；EF/F/M/B 依官方目录与具体 SKU",
    fill: "piston filling 或 cartridge/converter",
    variantNotes: "黑、白、Bordeaux 等颜色；piston 与 cartridge/converter 变体；14 K EF/F/M/B",
    routeBoundary: "Gold 是镀金饰件与 14 K 尖路线；不是所有金色 Cleo，也不与 Palladium/Metall 合并",
    aliases: ["Cleo Skribent Classic Gold", "Cleo Classic Gold", "克莱奥 Classic Gold"],
  },
  palladium: {
    id: PHASE341_CLEO_IDS.palladium,
    slug: PHASE341_CLEO_SLUGS.palladium,
    name: "Cleo Skribent Classic Palladium",
    title: "Cleo Skribent Classic Palladium：钯色饰件与钢尖基础路线",
    summary: "Cleo Skribent Classic Palladium 是 Classic 家族的钯色饰件路线：precious resin、palladium-plated fittings 与基础不锈钢尖，商城另有 14 K 金尖变体。",
    markdownFile: ".planning/quick/260802-cleo-skribent-classic/classic-palladium.md",
    shop: palladiumShop,
    svg: palladiumSvg,
    material: "precious resin；palladium-plated fittings",
    nib: "基础 stainless steel F/M/B；另有 14 K gold variant",
    fill: "piston filling 或 cartridge/converter",
    variantNotes: "黑、白、Bordeaux 等颜色；基础钢尖与 14 K 变体；piston 与 cartridge/converter",
    routeBoundary: "Palladium 是钯色饰件路线；基础钢尖与商城 14 K 变体要分开，不等于 Metall 的哑光铬黄铜帽",
    aliases: ["Cleo Skribent Classic Palladium", "Cleo Classic Palladium", "克莱奥 Classic Palladium"],
  },
  metall: {
    id: PHASE341_CLEO_IDS.metall,
    slug: PHASE341_CLEO_SLUGS.metall,
    name: "Cleo Skribent Classic Metall",
    title: "Cleo Skribent Classic Metall：树脂笔身与哑光铬黄铜帽",
    summary: "Cleo Skribent Classic Metall 是 Classic 家族的金属帽路线：precious resin、palladium-plated fittings、matt chrome-plated brass cap 与不锈钢尖。",
    markdownFile: ".planning/quick/260802-cleo-skribent-classic/classic-metall.md",
    shop: metallShop,
    svg: metallSvg,
    material: "precious resin；palladium-plated fittings；matt chrome-plated brass cap",
    nib: "基础 stainless steel F/M/B；另有 14 K gold variant",
    fill: "piston filling 或 cartridge/converter",
    variantNotes: "黑、白、Bordeaux 等颜色；钢尖与 14 K 变体；piston 与 cartridge/converter",
    routeBoundary: "Metall 的金属边界是哑光铬镀黄铜帽，不是整支金属笔身；与 Gold/Palladium 分开",
    aliases: ["Cleo Skribent Classic Metall", "Cleo Classic Metall", "克莱奥 Classic Metall"],
  },
};

function modelPack(routeKey: RouteKey): CuratedEntityPack {
  const route = ROUTES[routeKey];
  const scopeKey = `phase341-cleo-${routeKey}-scope`;
  const sources = [company, collection, catalog, history, route.shop, penAddict, gentleman, ...(routeKey === "palladium" ? [paperMind] : []), route.svg];
  return {
    key: `phase341-cleo-${routeKey}-v1`,
    entityId: route.id,
    expectedType: "pen",
    expectedSlug: route.slug,
    canonicalName: route.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: route.markdownFile,
    storyTitle: route.title,
    primarySourceKey: catalog.key,
    depthTier: "A",
    aliases: route.aliases.map((alias, index) => ({ alias, language: index === 2 ? "zh" : "en", sourceKey: index === 0 ? route.shop.key : collection.key })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, market: `Cleo Skribent ${route.name} current and historical catalog records`, productionState: "current", nibScope: route.nib, materialScope: route.material, editionScope: `${route.routeBoundary}；具体颜色、尖幅、金尖升级和供墨变体按 SKU 核对` }],
    claims: [
      claim(`${routeKey}-identity`, "model_identity", `${route.name} 是 Cleo Skribent Classic 家族的独立路线；它的饰件、笔尖或帽材边界不能被其他 Classic 路线替代。`, collection.key, scopeKey, "Classic route identity and collection boundary"),
      claim(`${routeKey}-material`, "material_finish", route.material, catalog.key, scopeKey, "2025 catalog material and fittings field"),
      claim(`${routeKey}-nib`, "nib", route.nib, catalog.key, scopeKey, "2025 catalog nib table and product-level variants"),
      claim(`${routeKey}-fill`, "filling_system", route.fill, catalog.key, scopeKey, "2025 catalog piston and cartridge/converter entries"),
      claim(`${routeKey}-shop`, "current_listing", `官方商城当前将 ${route.name} 的颜色与 piston／cartridge-converter 商品按路线分列；库存和价格不作为稳定规格。`, route.shop.key, scopeKey, "official shop collection listings"),
      claim(`${routeKey}-manufacturing`, "origin", "Cleo 官方公司页将品牌生产放在德国 Bad Wilsnack；它是制造语境，不为每支二手笔保证所有部件未更换。", company.key, scopeKey, "Bad Wilsnack German manufacturing context"),
      claim(`${routeKey}-piston-sample`, "piston_structure", "独立评测把 Classic piston 样本描述为尾端盲帽、透明墨窗与轻量结构；此观察只用于理解结构，不外推每一支商品。", penAddict.key, scopeKey, "review sample: blind cap, ink window and piston"),
      claim(`${routeKey}-converter-boundary`, "version_boundary", "The Gentleman Stationer 的样本区分 piston 版与 cartridge/converter 版；后者不能因后配转换器而变成内置活塞。", gentleman.key, scopeKey, "piston versus cartridge/converter sample boundary"),
      ...(routeKey === "palladium" ? [claim(`${routeKey}-gold-variant`, "nib_variant", "商城独立列出 Classic Palladium 14 K gold-nib 变体；它与官方目录基础钢尖路线并存，不能覆盖默认配置。", paperMind.key, scopeKey, "14 K Palladium piston sample", "editorial")] : []),
      claim(`${routeKey}-care`, "maintenance_guidance", "piston 版用室温清水吸排并避免强拧；cartridge/converter 版先卸下耗材再清洗握位。树脂、镀层和金属帽均应避开热水、酒精、研磨剂。", company.key, scopeKey, "conservative care derived from construction and official manufacturing context", "editorial"),
      claim(`${routeKey}-buying`, "selection_guidance", `购买 ${route.name} 时先核对供墨、笔尖刻字、饰件／帽材与颜色，再检查盲帽、墨窗、螺纹和维修记录；不要用价格或单支尺寸替代路线身份。`, route.shop.key, scopeKey, "current route and variant identification", "editorial"),
    ],
    variants: [
      { key: `${routeKey}-piston`, name: "Piston filling", notes: "官方目录列出的内置活塞路线；尾端旋钮、盲帽和墨窗按具体版本核对。", sourceKey: catalog.key, variantKind: "variant" },
      { key: `${routeKey}-cartridge-converter`, name: "Cartridge / converter", notes: "官方目录列出的墨囊／转换器路线；不与内置活塞版合并。", sourceKey: catalog.key, variantKind: "variant" },
      { key: `${routeKey}-colors`, name: "Black / White / Bordeaux and other colors", notes: route.variantNotes, sourceKey: route.shop.key, variantKind: "color" },
      ...(routeKey === "palladium" || routeKey === "metall" ? [{ key: `${routeKey}-14k`, name: "14 K gold nib upgrade", notes: "官方商城或目录出现的商品级金尖变体；基础路线仍以钢尖表为准。", sourceKey: routeKey === "palladium" ? paperMind.key : catalog.key, variantKind: "nib" as const }] : []),
    ],
    spec: {
      brandEntityId: PHASE341_CLEO_BRAND_ID,
      values: {
        series_name: route.name,
        release_year: "官方 2025 catalog 与当前商城在售路线；未据此倒推单支首发年",
        origin_country: "德国 Bad Wilsnack；官方公司页的制造语境",
        nib: route.nib,
        fill_system: route.fill,
        material: route.material,
        dimensions: "官方选定目录未给统一长度、重量与容量公差；按具体实物测量",
        weight: "官方选定目录未给统一克重；样本测量不外推全系",
        status: route.routeBoundary,
      },
      evidence: [
        evidence(`${routeKey}-brand`, "brand_entity_id", company.key, scopeKey, "Cleo Skribent maker identity"),
        evidence(`${routeKey}-series`, "series_name", collection.key, scopeKey, "Classic route name"),
        evidence(`${routeKey}-release`, "release_year", catalog.key, scopeKey, "current 2025 catalog route"),
        evidence(`${routeKey}-origin`, "origin_country", company.key, scopeKey, "Bad Wilsnack manufacturing context"),
        evidence(`${routeKey}-nib-field`, "nib", catalog.key, scopeKey, "nib and width table"),
        evidence(`${routeKey}-fill-field`, "fill_system", catalog.key, scopeKey, "piston and cartridge/converter table"),
        evidence(`${routeKey}-material-field`, "material", catalog.key, scopeKey, "material, fittings and cap table"),
        evidence(`${routeKey}-dimensions`, "dimensions", penAddict.key, scopeKey, "no uniform dimension claimed; sample boundary"),
        evidence(`${routeKey}-weight`, "weight", penAddict.key, scopeKey, "no uniform weight claimed; sample boundary"),
        evidence(`${routeKey}-status`, "status", route.shop.key, scopeKey, "current route and variant listing"),
      ],
    },
    timeline: [{ key: `${routeKey}-current-catalog`, title: `${route.name} current catalog route`, eventType: "design_milestone", startDate: "2025", circa: true, description: "官方 2025 catalog 与商城列出该 Classic 路线；页面不据此倒推更早的单支首发年。", sourceKey: catalog.key }],
    media: media(`${routeKey}-primary-media`, route.svg.title, route.svg),
  };
}

export const phase341CleoSkribentClassicPacks: CuratedEntityPack[] = [
  brand,
  modelPack("gold"),
  modelPack("palladium"),
  modelPack("metall"),
];
