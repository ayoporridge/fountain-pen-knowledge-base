import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase175SailorClassicKoPacks, PHASE175_SAILOR_BRAND_ID } from "./phase175-sailor-classic-ko";

const RETRIEVED = "2026-07-25";
export const PHASE200_SAILOR_BRAND_ID = PHASE175_SAILOR_BRAND_ID;
export const PHASE200_LECOULE_POWER_STONE_ID = "67U-NLL0isp6";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase200", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase200", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明真实颜色、比例、刻字、包装或库存。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  official: live({ key: "phase200-sailor-lecoule-official", title: "Sailor 官方：LECOULE POWER STONE COLOR Fountain Pen（11-0311）", url: "https://en.sailor.co.jp/product/11-0311/", registryName: "The Sailor Pen Co., Ltd.", sourceType: "official", tier: "primary", summary: "官方页面确认 11-0311 Power Stone Color 系列与末三位颜色编号；用于型号身份和现行产品语境。", locator: "product title, item code 11-0311 and color variants" }),
  japanese: live({ key: "phase200-sailor-lecoule-japanese", title: "Sailor 官方日文：レクル万年筆 パワーストーンカラー", url: "https://sailor.co.jp/product/11-0311/", registryName: "セーラー万年筆株式会社", sourceType: "official", tier: "contemporary_archive", summary: "日文页面列出五种宝石名和 11-0311-310/320/330/331/340 的中细尖编号。", locator: "series naming and item-code list" }),
  catalogue: live({ key: "phase200-sailor-lecoule-catalogue", title: "Sailor 2021–2022 官方目录：Lecoule Power Stone Color", url: "https://sailor.co.jp/book_2021-2022/pageindices/index78.html", registryName: "セーラー万年筆株式会社", sourceType: "official", tier: "contemporary_archive", summary: "官方目录给出不锈钢 MF、PMMA/AS、镍铬镀层、φ17×123 mm、轴径 φ12 mm、12.4 g 和五种颜色。", locator: "Power Stone catalog specification block" }),
  clearCatalogue: live({ key: "phase200-sailor-lecoule-clear-catalogue", title: "Sailor 2019–2020 官方目录：Lecoule Clear 与相邻型号", url: "https://sailor.co.jp/book_2019-2020/pageindices/index77.html", registryName: "セーラー万年筆株式会社", sourceType: "official", tier: "contemporary_archive", summary: "目录将 11-0313 Lecoule Clear 与 11-0311 Power Stone 分开，避免透明款混入宝石色系列。", locator: "11-0313 Clear and adjacent model entries" }),
  pchome: live({ key: "phase200-sailor-lecoule-pchome", title: "PChome：Sailor Lecoule 宝石系列／转运石", url: "https://24h.pchome.com.tw/prod/QFBU8C-B900914A6", registryName: "PChome 24h 購物", sourceType: "retailer", tier: "retailer", summary: "零售标题提供中文转运石命名与 11-0313 透明款 SKU 线索；不替代 11-0311 官方规格。", locator: "Chinese retail naming and adjacent Clear SKU" }),
  reddit: live({ key: "phase200-sailor-lecoule-reddit", title: "Reddit：Would you buy these Sailor Lecoule?", url: "https://www.reddit.com/r/fountainpens/comments/tnjndf", registryName: "Reddit r/fountainpens participants", sourceType: "reddit", tier: "community", summary: "用户讨论把 Lecoule 放在约 30 美元的钢尖入门语境，并提醒颜色选择和价格定位是个人取舍。", locator: "Lecoule price positioning and user experience discussion" }),
  lapisRetail: live({ key: "phase200-sailor-lecoule-lapis-retailer", title: "Sailor Pen Romania：Lecoule Power Stone Lapis Lazuli 11-0311-340", url: "https://www.sailorpen.ro/game-sailor/lecoule/power-stone-lapis-lazuli-blue-ct/stilou-13", registryName: "Sailor Pen Romania", sourceType: "retailer", tier: "professional_secondary", summary: "专业经销商页面以 11-0311-340 标识青金石蓝色样本，用于交叉确认末三位和颜色命名。", locator: "11-0311-340 Lapis Lazuli product code" }),
  svg: diagram("phase200-sailor-lecoule-power-stone-svg", "Sailor Lecoule Power Stone 11-0311 事实示意", "/images/library/site-original/phase200/sailor/lecoule-power-stone.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.9, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}
function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "sailor-lecoule-power-stone-model";
const pen: CuratedEntityPack = {
  key: "phase200-sailor-lecoule-power-stone",
  entityId: PHASE200_LECOULE_POWER_STONE_ID,
  expectedType: "pen",
  expectedSlug: "写乐-sailor-转运石",
  canonicalName: "写乐 Sailor Lecoule Power Stone Color（转运石）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-lecoule-power-stone-phase200.md",
  storyTitle: "写乐 Sailor Lecoule Power Stone：宝石色钢尖入门款",
  primarySourceKey: S.official.key,
  depthTier: "A",
  aliases: [{ alias: "Sailor Lecoule Power Stone Color", language: "en", sourceKey: S.official.key }, { alias: "11-0311", language: "en", sourceKey: S.official.key }, { alias: "写乐 转运石", language: "zh", sourceKey: S.pchome.key }, { alias: "レクル パワーストーンカラー", language: "ja", sourceKey: S.japanese.key }],
  sources: [S.official, S.japanese, S.catalogue, S.clearCatalogue, S.pchome, S.reddit, S.lapisRetail, S.svg],
  scopes: [{ key: scope, scopeKey: "sailor-lecoule-power-stone-11-0311", productionState: "historical", editionScope: "Sailor Lecoule Power Stone Color 11-0311 五种颜色；不覆盖相邻 11-0313 Clear、11-0332/0333 或金尖 Pro Gear/Profit。" }],
  claims: [
    claim("sailor-lecoule-power-stone-identity", "model_identity", "写乐“转运石”对应 Lecoule Power Stone Color（11-0311）钢尖系列；Power Stone 是颜色主题系列名，不是 21K 金尖或独立品牌。", S.official.key, scope, "official 11-0311 product title"),
    claim("sailor-lecoule-power-stone-colors", "variant_boundary", "官方目录列 Pearl 310、Morion/Black Crystal 320、Garnet 330、Rose Quartz 331、Lapis Lazuli 340；五者共享 11-0311 平台，末三位用于核对颜色。", S.catalogue.key, scope, "2021–2022 catalog color/code list"),
    claim("sailor-lecoule-power-stone-nib", "nib_boundary", "系列规格为不锈钢 MF（中细）尖；单支尖缝、反馈、流量和调校仍需验收，不能把写乐高阶金尖的柔软度回填到本系列。", S.catalogue.key, scope, "stainless steel MF catalog field"),
    claim("sailor-lecoule-power-stone-material", "material_boundary", "官方目录列盖与笔杆 PMMA、握位 AS 树脂、镍铬镀层金属件；宝石名是树脂配色，不证明天然矿石或贵金属。", S.catalogue.key, scope, "PMMA/AS resin and nickel-chrome plating fields"),
    claim("sailor-lecoule-power-stone-size", "sample_measurement", "官方目录给出含夹约 φ17×123 mm、轴径约 φ12 mm、约 12.4 g；数值是系列规格，不把装墨或后插长度混入。", S.catalogue.key, scope, "size, barrel diameter and weight"),
    claim("sailor-lecoule-power-stone-fill", "filling_system", "Lecoule Power Stone 采用墨囊／上墨器路线；它不是内置活塞、真空或大容量高阶上墨结构，接口和随盒内容按市场包装核对。", S.official.key, scope, "Lecoule product filling context and catalog family"),
    claim("sailor-lecoule-power-stone-boundary", "sibling_boundary", "11-0313 Lecoule Clear 在官方目录中独立列出；透明款、普通 Lecoule 与 Profit Jr./Professional Gear 不应因外形或“转运石”营销名合并。", S.clearCatalogue.key, scope, "11-0313 Clear separate catalog entry"),
    claim("sailor-lecoule-power-stone-care", "maintenance_guidance", "换墨用常温清水吸排，浅色树脂要避免热水、酒精和强溶剂；镀层和树脂有异常时停止强拆并按单支检查。", S.catalogue.key, scope, "material and filling maintenance boundary"),
    claim("sailor-lecoule-power-stone-selection", "selection_guidance", "选购时核对 11-0311 末三位、尖面、上墨器、颜色实物和退换条件；不要只凭“21K”“天然宝石”或通用图片判断。", S.lapisRetail.key, scope, "11-0311-340 retailer code and inspection checklist"),
  ],
  variants: [{ key: "sailor-lecoule-power-stone-pearl", name: "Pearl 珍珠（11-0311-310）", notes: "官方编号和颜色名；珠光强度按实物与批次观察。", sourceKey: S.catalogue.key, variantKind: "color" }, { key: "sailor-lecoule-power-stone-morion", name: "Morion／Black Crystal 黑水晶（11-0311-320）", notes: "黑色主题配色，不等于黑色天然矿石材料。", sourceKey: S.catalogue.key, variantKind: "color" }, { key: "sailor-lecoule-power-stone-garnet", name: "Garnet 石榴石（11-0311-330）", notes: "酒红主题配色，颜色翻译随市场变化。", sourceKey: S.catalogue.key, variantKind: "color" }, { key: "sailor-lecoule-power-stone-rose", name: "Rose Quartz 粉水晶（11-0311-331）", notes: "粉色主题配色，不证明天然粉晶。", sourceKey: S.catalogue.key, variantKind: "color" }, { key: "sailor-lecoule-power-stone-lapis", name: "Lapis Lazuli 青金石（11-0311-340）", notes: "青金石蓝主题配色；经销商页面可交叉核对末三位。", sourceKey: S.lapisRetail.key, variantKind: "color" }],
  spec: {
    brandEntityId: PHASE200_SAILOR_BRAND_ID,
    values: { series_name: "Sailor Lecoule Power Stone Color / 11-0311", release_year: "至少在 2019–2022 官方目录中出现；确切首发年待品牌档案核实", origin_country: "日本；Sailor 官方产品与目录型号", nib: "不锈钢 MF（中细）尖；具体尖缝、刻字和调校按单支核对", fill_system: "墨囊／上墨器（cartridge/converter）", material: "PMMA 树脂盖／杆、AS 树脂握位、镍铬镀层金属件", dimensions: "含夹约 φ17×123 mm；轴径约 φ12 mm（官方目录系列值）", weight: "约 12.4 g（官方目录系列值；不含墨水的标准语境）", status: "历史／部分地区流通的 Lecoule 入门系列；库存和包装按地区卖家复核" },
    evidence: [ev("sailor-lecoule-power-stone", "brand_entity_id", S.official.key, scope, "Sailor official brand/product page"), ev("sailor-lecoule-power-stone", "series_name", S.official.key, scope, "11-0311 product title"), ev("sailor-lecoule-power-stone", "release_year", S.catalogue.key, scope, "2019–2022 catalog window"), ev("sailor-lecoule-power-stone", "origin_country", S.official.key, scope, "Sailor Japan official context"), ev("sailor-lecoule-power-stone", "nib", S.catalogue.key, scope, "stainless steel MF"), ev("sailor-lecoule-power-stone", "fill_system", S.official.key, scope, "Lecoule filling family"), ev("sailor-lecoule-power-stone", "material", S.catalogue.key, scope, "PMMA/AS and plating"), ev("sailor-lecoule-power-stone", "dimensions", S.catalogue.key, scope, "φ17×123 mm and φ12 mm"), ev("sailor-lecoule-power-stone", "weight", S.catalogue.key, scope, "12.4 g"), ev("sailor-lecoule-power-stone", "status", S.official.key, scope, "availability requires authorised vendor check")],
  },
  media: [{ key: "sailor-lecoule-power-stone-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表真实颜色、比例、刻字、包装或库存。", sourceUrl: S.svg.url, usageStatus: "primary" }],
  timeline: [{ key: "sailor-lecoule-power-stone-catalog-window", title: "Lecoule Power Stone 官方目录窗口", eventType: "design_milestone", startDate: "2019", circa: false, description: "2019–2022 官方目录持续记录 11-0311 五种宝石色与钢尖规格；目录时间不等同确切首发年。", sourceKey: S.catalogue.key }],
};

const existingBrand = phase175SailorClassicKoPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE200_SAILOR_BRAND_ID);
if (!existingBrand) throw new Error("Phase 200 requires the existing curated Sailor brand pack.");
pen.sources = [...pen.sources, ...existingBrand.sources.filter((source) => source.sourceType === "official")];
export const phase200SailorLecoulePowerStonePacks: CuratedEntityPack[] = [existingBrand, pen];
