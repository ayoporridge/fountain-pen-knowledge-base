import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-23";
export const PHASE144_IDS = {
  brand: "phase144-otto-hutt-brand",
  design04: "phase144-otto-hutt-design04",
  design07: "phase144-otto-hutt-design07",
} as const;
export const PHASE144_SLUGS = {
  brand: "otto-hutt",
  design04: "otto-hutt-design04",
  design07: "otto-hutt-design07",
} as const;

function web(input: {
  key: string;
  title: string;
  url: string;
  registry: string;
  name: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registry,
    registryName: input.name,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registry,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    author: input.name,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase144",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase144",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  brand: web({ key: "phase144-otto-hutt-brand", title: "Otto Hutt 官方主页与历史", url: "https://oldwww.ottohutt.com/en/", registry: "otto-hutt-official-brand-phase144", name: "Otto Hutt GmbH", summary: "官方主页记录 Pforzheim 制造语境、1920 建立、1965 以 Otto Hutt 命名、2016 恢复 Otto Hutt GmbH 与 2018 relaunch。" }),
  design04: web({ key: "phase144-otto-hutt-design04-official", title: "Otto Hutt design04 官方页", url: "https://oldwww.ottohutt.com/en/projects/design04/", registry: "otto-hutt-official-design04-phase144", name: "Otto Hutt GmbH", summary: "官方确认 design04 线性美学、紧凑握持、PVD 钢尖或 18 ct 金尖，以及不同 guilloché、漆面和饰件变体。" }),
  design04Shop: web({ key: "phase144-otto-hutt-design04-shop", title: "Otto Hutt design04 商店目录", url: "https://www.ottohutt.com/product-category/designs-en/design04-en/?lang=en", registry: "otto-hutt-shop-design04-phase144", name: "Otto Hutt online shop", summary: "官方商店同时列出 design04 钢笔的亮面、checked、wave、silver 与不同饰件，证明颜色和工艺是 SKU/variant 边界。" }),
  design04Review: web({ key: "phase144-otto-hutt-design04-review", title: "The Pencilcase Blog design04 评测", url: "https://www.pencilcaseblog.com/2017/09/otto-hutt-design-04-fountain-pen-review.html", registry: "pencilcaseblog-otto-hutt-design04-phase144", name: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", summary: "独立评测只用于一支金属 steel-nib 样本的约 13.3 cm、约 35 g、细握位与 cartridge/converter 体验，不覆盖所有版本。" }),
  design04PenAddict: web({ key: "phase144-otto-hutt-design04-penaddict", title: "The Pen Addict design04 Wave Blue 评测", url: "https://www.penaddict.com/blog/2021/4/12/otto-hutt-design-04-wave-blue-fountain-pen-review", registry: "penaddict-otto-hutt-design04-phase144", name: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", summary: "独立专业评测提供 Wave Blue 具体样本的书写语境，不能替代官方材料与 SKU 边界。" }),
  design07: web({ key: "phase144-otto-hutt-design07-official", title: "Otto Hutt design07 官方页", url: "https://oldwww.ottohutt.com/en/projects/design07/", registry: "otto-hutt-official-design07-phase144", name: "Otto Hutt GmbH", summary: "官方把 design07 定位旗舰路线，区分 sterling silver 与漆面黄铜两种笔身，均有 fountain pen/roller ball。" }),
  design07Review: web({ key: "phase144-otto-hutt-design07-review", title: "The Gentleman Stationer design07 评测", url: "https://www.gentlemanstationer.com/blog/2021/3/26/pen-review-otto-hutt-design07", registry: "gentleman-stationer-otto-hutt-design07-phase144", name: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", summary: "独立评测的 sterling silver 样本约 64 g 闭盖、32 g 去帽，强调帽盖重量与不后插体验；只作样本边界。" }),
  design07Pencilcase: web({ key: "phase144-otto-hutt-design07-pencilcase", title: "The Pencilcase Blog design07 评测", url: "https://www.pencilcaseblog.com/2020/08/review-otto-hutt-design-07-fountain-pen.html", registry: "pencilcaseblog-otto-hutt-design07-phase144", name: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", summary: "独立漆面样本记录 18K JoWo、大号尖与 cartridge/converter 体验，不把其配置外推至所有 design07。" }),
  design07Retail: web({ key: "phase144-otto-hutt-design07-retail", title: "Appelboom design07 sterling silver 产品档案", url: "https://appelboom.com/otto-hutt-design-07-sterling-silver-fountain-pen/", registry: "appelboom-otto-hutt-design07-phase144", name: "Appelboom", sourceType: "retailer", tier: "retailer", summary: "零售档案用于交叉核对 silver 版本的 18K、cartridge/converter、约 140 mm/66 g 等商品字段；不是全部版本主源。" }),
  brandSvg: diagram("phase144-otto-hutt-brand-svg", "Otto Hutt brand navigation", "/images/library/site-original/phase144/otto-hutt/brand.svg"),
  design04Svg: diagram("phase144-otto-hutt-design04-svg", "Otto Hutt design04 factual diagram", "/images/library/site-original/phase144/otto-hutt/design04.svg"),
  design07Svg: diagram("phase144-otto-hutt-design07-svg", "Otto Hutt design07 factual diagram", "/images/library/site-original/phase144/otto-hutt/design07.svg"),
};

function ev(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function makeBrand(): CuratedEntityPack {
  const scope = "phase144-otto-hutt-brand-scope";
  return {
    key: "phase144-otto-hutt-brand-v1",
    entityId: PHASE144_IDS.brand,
    expectedType: "brand",
    expectedSlug: PHASE144_SLUGS.brand,
    canonicalName: "Otto Hutt",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/otto-hutt-brand-phase144.md",
    storyTitle: "Otto Hutt：德国制造书写工具与 design 系列导航",
    primarySourceKey: S.brand.key,
    depthTier: "A",
    aliases: ["Otto Hutt", "Otto Hutt GmbH", "奥托·胡特"].map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: S.brand.key })),
    sources: [S.brand, S.design04, S.design07, S.design07Review, S.brandSvg],
    scopes: [{ key: scope, scopeKey: scope, validFrom: RETRIEVED, productionState: "current", editionScope: "Otto Hutt brand history and explicitly published design04/design07 fountain-pen navigation only." }],
    claims: [
      { key: "phase144-otto-hutt-identity", predicate: "brand_identity", objectText: "Otto Hutt 是以 Pforzheim 工艺传统和德国生产为品牌语境的书写工具品牌；官方历史页将 1920 记为 Karl Hutt 建立公司的年份。", factClass: "core", confidence: 0.99, sourceKey: S.brand.key, locator: S.brand.summary, evidence: [{ key: "phase144-otto-hutt-identity-evidence", sourceKey: S.brand.key, scopeKey: scope, locator: S.brand.summary }] },
      { key: "phase144-otto-hutt-history", predicate: "historical_context", objectText: "1965 以 Otto Hutt 命名、2016 恢复 Otto Hutt GmbH、2018 relaunch 均来自官方时间线，不被写成新的品牌创立。", factClass: "core", confidence: 0.98, sourceKey: S.brand.key, locator: S.brand.summary, evidence: [{ key: "phase144-otto-hutt-history-evidence", sourceKey: S.brand.key, scopeKey: scope, locator: S.brand.summary }] },
      { key: "phase144-otto-hutt-navigation", predicate: "series_navigation", objectText: "本批只把有独立来源的 design04 与 design07 作为公开钢笔导航；其他 design line 不继承两者规格。", factClass: "core", confidence: 0.98, sourceKey: S.design04.key, locator: S.design04.summary, evidence: [{ key: "phase144-otto-hutt-navigation-evidence", sourceKey: S.design04.key, scopeKey: scope, locator: S.design04.summary }, { key: "phase144-otto-hutt-navigation-design07", sourceKey: S.design07.key, scopeKey: scope, locator: S.design07.summary }] },
      { key: "phase144-otto-hutt-independent-context", predicate: "independent_context", objectText: "独立评测把 design07 视为德国金属书写工具的具体样本，只用于重量、握持和笔尖语境，不覆盖 Otto Hutt 品牌历史或其他 design line。", factClass: "core", confidence: 0.9, sourceKey: S.design07Review.key, locator: S.design07Review.summary, evidence: [{ key: "phase144-otto-hutt-independent-context-evidence", sourceKey: S.design07Review.key, scopeKey: scope, locator: S.design07Review.summary }] },
    ],
    timeline: [
      { key: "phase144-otto-hutt-founded", title: "Karl Hutt 在 Pforzheim 建立公司", eventType: "brand_founded", startDate: "1920", circa: false, description: "官方历史页把 1920 记为公司建立与贵金属书写工具生产的起点。", sourceKey: S.brand.key },
      { key: "phase144-otto-hutt-renamed", title: "公司以 Otto Hutt 命名", eventType: "design_milestone", startDate: "1965", circa: false, description: "官方时间线记录品牌以 Otto Hutt 之名延续。", sourceKey: S.brand.key },
      { key: "phase144-otto-hutt-relaunch", title: "Otto Hutt GmbH relaunch", eventType: "revival", startDate: "2018", circa: false, description: "官方记录 2018 年品牌重新定位；不推断具体 design line 的首发日期。", sourceKey: S.brand.key },
    ],
    media: [{ key: "phase144-otto-hutt-brand-primary", title: "Otto Hutt 品牌导航事实图（非产品照片）", sourceKey: S.brandSvg.key, localPath: S.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: S.brandSvg.url, usageStatus: "primary" }],
  };
}

function makeModel(input: { id: string; slug: string; name: string; markdownFile: string; storyTitle: string; primary: CuratedSource; secondary: CuratedSource; extra: CuratedSource[]; svg: CuratedSource; aliases: string[]; identity: string; boundary: string; values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>; variants: NonNullable<CuratedEntityPack["variants"]> }): CuratedEntityPack {
  const scope = `phase144-${input.slug}-scope`;
  const fields = Object.keys(input.values) as Array<Exclude<SpecFieldKey, "brand_entity_id">>;
  const sources = [...new Map([input.primary, input.secondary, ...input.extra, input.svg].map((source) => [source.key, source])).values()];
  return {
    key: `phase144-${input.slug}-v1`, entityId: input.id, expectedType: "pen", expectedSlug: input.slug, canonicalName: input.name, publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile, storyTitle: input.storyTitle, primarySourceKey: input.primary.key, depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primary.key })), sources,
    scopes: [{ key: scope, scopeKey: scope, validFrom: RETRIEVED, productionState: "current", materialScope: "Exact Otto Hutt design line; fountain pen only; finish and nib options do not inherit across design lines.", editionScope: input.boundary }],
    claims: [
      { key: `${input.slug}-identity`, predicate: "model_identity", objectText: input.identity, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [{ key: `${input.slug}-identity-evidence`, sourceKey: input.primary.key, scopeKey: scope, locator: input.primary.summary }] },
      { key: `${input.slug}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.98, sourceKey: input.secondary.key, locator: input.secondary.summary, evidence: [{ key: `${input.slug}-boundary-evidence`, sourceKey: input.secondary.key, scopeKey: scope, locator: input.secondary.summary }] },
      { key: `${input.slug}-care`, predicate: "maintenance_boundary", objectText: "金属、镀层、漆面和 guilloché 应以室温清水和柔软布料维护；不要用强溶剂、硬刷、金属抛光膏或蛮力处理笔尖和表面。", factClass: "core", confidence: 0.96, sourceKey: input.primary.key, locator: "official material and finish boundary", evidence: [{ key: `${input.slug}-care-evidence`, sourceKey: input.primary.key, scopeKey: scope, locator: "official finish boundary" }] },
    ],
    variants: input.variants,
    spec: { brandEntityId: PHASE144_IDS.brand, values: input.values, evidence: [ev("brand_entity_id", `${input.slug}-brand`, input.primary.key, scope, "verified Otto Hutt maker relation"), ...fields.map((field) => ev(field, `${input.slug}-${field}`, input.primary.key, scope, `official/dated source boundary for ${field}`))] },
    timeline: [{ key: `${input.slug}-catalogue`, title: `${input.name} 官方页面范围`, eventType: "design_milestone", startDate: RETRIEVED, circa: true, description: "检索日可访问官方 design 页面；不把页面访问日当作首发年份。", sourceKey: input.primary.key }],
    media: [{ key: `${input.slug}-primary`, title: `${input.name} 事实图（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: input.svg.url, usageStatus: "primary" }],
  };
}

export const phase144Packs: CuratedEntityPack[] = [
  makeBrand(),
  makeModel({ id: PHASE144_IDS.design04, slug: PHASE144_SLUGS.design04, name: "Otto Hutt design04", markdownFile: ".planning/content-research/otto-hutt-design04-phase144.md", storyTitle: "Otto Hutt design04：线性设计、guilloché 与两种笔尖路线", primary: S.design04, secondary: S.design04Review, extra: [S.brand, S.design04Shop, S.design04PenAddict], svg: S.design04Svg, aliases: ["Otto Hutt design04", "Otto Hutt Design 04", "奥托·胡特 design04"], identity: "design04 是 Otto Hutt 以线性美学、紧凑轮廓和多种手工 finish 建立的独立钢笔 design line；官方允许 PVD 涂层钢尖或 18 ct 金尖。", boundary: "checked、wave、Scribble、All Black、silver thread 等是 design04 的 finish/material/nib variants；滚珠笔与圆珠笔不继承钢笔规格，design04 也不与 design07 合并。", values: { series_name: "Otto Hutt design04", release_year: "当前官方 design04 页面；首发年份未由本批确认", origin_country: "Germany", nib: "PVD-coated steel 或 18 ct gold；尖号随 SKU", fill_system: "cartridge/converter 体验由独立样本记录；随附耗材按当前 SKU 核对", material: "黄铜、漆面、guilloché 或部分 sterling silver；按 finish variant", dimensions: "官方称 compact dimensions；约 13.3 cm/约 35 g 仅属于独立金属样本", status: "官方 design line 页面可访问；颜色、库存与笔尖组合按 SKU" }, variants: [{ key: "phase144-design04-nib", name: "PVD steel / 18 ct gold", notes: "官方钢笔笔尖路线；尖号与具体颜色/市场 SKU 另核对。", sourceKey: S.design04.key, variantKind: "nib" }, { key: "phase144-design04-finish", name: "Uni / checked / wave / silver thread", notes: "亮面、格纹、波纹、银制纹理和 All Black 属 finish/edition，不拆 duplicate。", sourceKey: S.design04Shop.key, variantKind: "edition_group" }] }),
  makeModel({ id: PHASE144_IDS.design07, slug: PHASE144_SLUGS.design07, name: "Otto Hutt design07", markdownFile: ".planning/content-research/otto-hutt-design07-phase144.md", storyTitle: "Otto Hutt design07：银制与漆面旗舰路线", primary: S.design07, secondary: S.design07Review, extra: [S.brand, S.design07Pencilcase, S.design07Retail], svg: S.design07Svg, aliases: ["Otto Hutt design07", "Otto Hutt Design 07", "奥托·胡特 design07"], identity: "design07 是 Otto Hutt 的旗舰 design line；官方明确区分 sterling silver 与漆面黄铜两种钢笔路线，并为银制版本配置大型金尖。", boundary: "Silver 与 Lacquer 是 design07 的 material variants；18K/JoWo、EF/M、约 64 g 等由独立样本或零售档案记录，不能外推至所有年份和市场 SKU。", values: { series_name: "Otto Hutt design07", release_year: "当前官方 design07 页面；首发年份未由本批确认", origin_country: "Germany", nib: "Silver 版官方称大型 gold nib；具体 18K/尖号按 SKU 或样本", fill_system: "cartridge/converter（独立样本）；随附耗材按当前 SKU 核对", material: "Silver：sterling silver；Lacquer：solid brass + platinized + 多层漆", dimensions: "官方页面未给统一全版本数字；约 140 mm/66 g 或 64 g 只属于 dated sample", status: "官方 design line 页面可访问；在售、库存和地区版按 SKU" }, variants: [{ key: "phase144-design07-silver", name: "Silver", notes: "笔身与笔帽 sterling silver、thread guilloché、大型 gold nib。", sourceKey: S.design07.key, variantKind: "material" }, { key: "phase144-design07-lacquer", name: "Lacquer", notes: "solid brass、platinum、两层黑色半透明漆与七层透明漆；同名滚珠笔不进入钢笔 payload。", sourceKey: S.design07.key, variantKind: "material" }, { key: "phase144-design07-nib", name: "18K/JoWo sample configurations", notes: "独立评测与零售档案的具体样本配置；不覆盖所有市场。", sourceKey: S.design07Pencilcase.key, variantKind: "nib" }] }),
];
