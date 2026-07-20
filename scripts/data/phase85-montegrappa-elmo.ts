import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE85_MONTEGRAPPA_BRAND_ID = "phase85-brand-montegrappa";
export const PHASE85_ELMO_01_ID = "phase85-pen-montegrappa-elmo-01";
export const PHASE85_ELMO_01_SLUG = "montegrappa-elmo-01";

const RETRIEVED = "2026-07-20";

function live(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator" | "independenceGroup">): CuratedSource {
  return {
    ...input,
    homepageUrl: input.url,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
    independenceGroup: input.registryKey,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase85",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase85",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false`,
  };
}

const SOURCES = {
  history: live({
    key: "phase85-montegrappa-official-history",
    registryKey: "montegrappa-official-phase85",
    registryName: "Montegrappa official",
    sourceType: "official",
    tier: "primary",
    title: "Montegrappa: La nostra storia",
    url: "https://www.montegrappa.com/en/storia.html",
    summary: "品牌官方历史页给出 Bassano del Grappa 的早期制笔背景与 Montegrappa 名称发展的历史语境；历史不能替代当前 SKU 规格。",
  }),
  catalog: live({
    key: "phase85-montegrappa-official-catalog",
    registryKey: "montegrappa-official-phase85",
    registryName: "Montegrappa official",
    sourceType: "official",
    tier: "primary",
    title: "Explore Montegrappa catalogue",
    url: "https://www.montegrappa.com/en/catalog/",
    summary: "当前官网目录将 Elmo 01、Elmo 02、Elmo 02 Plus、Extra 1930 与 Zero 作为独立开放系列入口，不能由同名或相似外形合并。",
  }),
  elmo01: live({
    key: "phase85-montegrappa-elmo-01-official",
    registryKey: "montegrappa-official-phase85",
    registryName: "Montegrappa official",
    sourceType: "official",
    tier: "primary",
    title: "Elmo 01 Fountain Pen, Black",
    url: "https://www.montegrappa.com/it/collections/edizioni-regolari/elmo01-1041.html",
    summary: "官方 Elmo 01 商品页列树脂、钢制金属件、钢尖、cartridge/converter、两支墨囊和 converter、142 mm、14.8 mm、26.6 g，以及 EF/F/M/B/ST1/ST5 选项。",
  }),
  penChalet: live({
    key: "phase85-montegrappa-elmo-01-penchalet",
    registryKey: "penchalet-phase85",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    title: "Montegrappa Elmo 01 Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/montegrappa_elmo_01_fountain_pens.html",
    summary: "独立零售商将 Elmo 01 标为树脂、#6 不锈钢尖、标准国际墨囊／转换器和螺纹帽；零售测量与品牌 SKU 的数值不同，不能覆盖官方 142 mm、14.8 mm、26.6 g。",
  }),
  brandSvg: diagram("phase85-montegrappa-brand-svg", "Montegrappa 型号关系事实图", "/images/library/site-original/montegrappa-elmo/montegrappa-brand-map.svg"),
  elmoSvg: diagram("phase85-montegrappa-elmo-01-svg", "Montegrappa Elmo 01 身份与规格边界事实图", "/images/library/site-original/montegrappa-elmo/montegrappa-elmo-01.svg"),
} satisfies Record<string, CuratedSource>;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(key: string, title: string, source: CuratedSource) {
  return [{
    key,
    title,
    sourceKey: source.key,
    localPath: source.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、树脂纹理、库存、笔尖、刻字或具体 SKU。",
    sourceUrl: source.url,
    usageStatus: "primary" as const,
  }];
}

export function phase85MontegrappaElmoPacks(): CuratedEntityPack[] {
  const brandScope = "phase85-montegrappa-brand-current-catalog";
  const elmoScope = "phase85-montegrappa-elmo-01-current-sku";
  return [
    {
      key: "phase85-montegrappa-brand-v1",
      entityId: PHASE85_MONTEGRAPPA_BRAND_ID,
      expectedType: "brand",
      expectedSlug: "montegrappa",
      canonicalName: "Montegrappa",
      publicationIntent: "publish",
      publicationBlockers: [],
      markdownFile: ".planning/content-research/phase85-montegrappa-brand.md",
      storyTitle: "Montegrappa：先按型号与供墨读，再谈意大利设计语境",
      primarySourceKey: SOURCES.catalog.key,
      depthTier: "A",
      aliases: [
        { alias: "Montegrappa", language: "en", sourceKey: SOURCES.catalog.key },
        { alias: "蒙特格拉帕", language: "zh", sourceKey: SOURCES.catalog.key },
      ],
      sources: [SOURCES.history, SOURCES.catalog, SOURCES.penChalet, SOURCES.brandSvg],
      scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "current", editionScope: "本页只以当前官方目录的独立型号作为导航；历史笔、颜色、笔尖和非钢笔书写工具另按精确实体处理。" }],
      claims: [
        {
          key: "phase85-montegrappa-brand-navigation",
          predicate: "brand_navigation_boundary",
          objectText: "当前目录把 Elmo 01、Elmo 02、Elmo 02 Plus、Zero 和 Extra 1930 分列；同名历史语境、颜色、笔尖或滚珠笔不能代替型号关系。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.catalog.key,
          locator: SOURCES.catalog.summary,
          evidence: [
            { key: "phase85-montegrappa-catalog-official", sourceKey: SOURCES.catalog.key, scopeKey: brandScope, locator: SOURCES.catalog.summary },
            { key: "phase85-montegrappa-catalog-secondary", sourceKey: SOURCES.penChalet.key, scopeKey: brandScope, locator: SOURCES.penChalet.summary },
          ],
        },
        {
          key: "phase85-montegrappa-history-boundary",
          predicate: "history_boundary",
          objectText: "Bassano del Grappa 的历史脉络可解释品牌设计语境，却不能用来代替今天任一型号的尺寸、笔尖或供墨证明。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.history.key,
          locator: SOURCES.history.summary,
          evidence: [{ key: "phase85-montegrappa-history-official", sourceKey: SOURCES.history.key, scopeKey: brandScope, locator: SOURCES.history.summary }],
        },
      ],
      media: media("phase85-montegrappa-brand-media", "Montegrappa 型号关系事实图（非产品照片）", SOURCES.brandSvg),
      timeline: [
        { key: "phase85-montegrappa-history", title: "品牌历史的 Bassano del Grappa 语境", eventType: "brand_founded", startDate: "1912", circa: false, description: "官方历史页记录早期 Bassano del Grappa 制笔背景；本条不把历史起点扩写为当前 SKU 的生产日期。", sourceKey: SOURCES.history.key },
        { key: "phase85-montegrappa-current-catalog", title: "当前目录的型号分列", eventType: "design_milestone", startDate: "2026", circa: true, description: "官网目录将 Elmo 01、Elmo 02、Elmo 02 Plus 等列为不同开放系列入口。", sourceKey: SOURCES.catalog.key },
      ],
    },
    {
      key: "phase85-montegrappa-elmo-01-v1",
      entityId: PHASE85_ELMO_01_ID,
      expectedType: "pen",
      expectedSlug: PHASE85_ELMO_01_SLUG,
      canonicalName: "Montegrappa Elmo 01",
      publicationIntent: "publish",
      publicationBlockers: [],
      markdownFile: ".planning/content-research/phase85-montegrappa-elmo-01.md",
      storyTitle: "Montegrappa Elmo 01：把历史名字留在设计里，把日常结构说清楚",
      primarySourceKey: SOURCES.elmo01.key,
      depthTier: "A",
      aliases: [
        { alias: "Montegrappa Elmo 01", language: "en", sourceKey: SOURCES.elmo01.key },
        { alias: "蒙特格拉帕 Elmo 01", language: "zh", sourceKey: SOURCES.elmo01.key },
      ],
      sources: [SOURCES.elmo01, SOURCES.catalog, SOURCES.penChalet, SOURCES.elmoSvg],
      scopes: [{ key: elmoScope, scopeKey: elmoScope, productionState: "current", editionScope: "当代 Elmo 01 钢笔；颜色、笔尖宽度与地区库存按当前精确商品核验，不能混入 Elmo 02／Elmo 02 Plus。" }],
      claims: [
        {
          key: "phase85-elmo-01-identity",
          predicate: "model_identity",
          objectText: "Elmo 01 是当前目录中的独立型号，使用树脂、钢尖和 cartridge/converter；它不是 Elmo 02 或活塞上墨的 Elmo 02 Plus。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.elmo01.key,
          locator: SOURCES.elmo01.summary,
          evidence: [
            { key: "phase85-elmo-01-official", sourceKey: SOURCES.elmo01.key, scopeKey: elmoScope, locator: SOURCES.elmo01.summary },
            { key: "phase85-elmo-01-secondary", sourceKey: SOURCES.penChalet.key, scopeKey: elmoScope, locator: SOURCES.penChalet.summary },
          ],
        },
        {
          key: "phase85-elmo-01-use-boundary",
          predicate: "maintenance_boundary",
          objectText: "换色或长期不用时以常温清水清洗并自然晾干；异常阻力、渗漏或持续断墨不应靠蛮力拆解处理。",
          factClass: "editorial",
          confidence: 0.96,
          sourceKey: SOURCES.penChalet.key,
          locator: SOURCES.penChalet.summary,
          evidence: [{ key: "phase85-elmo-01-care-secondary", sourceKey: SOURCES.penChalet.key, scopeKey: elmoScope, locator: SOURCES.penChalet.summary }],
        },
      ],
      variants: [
        { key: "phase85-elmo-01-current-colours", name: "Elmo 01 Black / Frost / Peach Fuzz 等", releaseYear: "当前商品页", notes: "颜色与库存是商品差异；仍以同一 Elmo 01 C/C 平台核对，不把它们拆成独立基础型号。", sourceKey: SOURCES.elmo01.key, variantKind: "color" },
        { key: "phase85-elmo-01-nib-options", name: "Elmo 01 EF / F / M / B / ST1 / ST5", releaseYear: "当前商品页", notes: "笔尖宽度/用途选项；并非另一支 Elmo 型号。", sourceKey: SOURCES.elmo01.key, variantKind: "nib" },
      ],
      spec: {
        brandEntityId: PHASE85_MONTEGRAPPA_BRAND_ID,
        values: {
          series_name: "Elmo 01",
          release_year: "当前官网目录可见；首发年份待可靠档案核实",
          origin_country: "意大利品牌产品线；具体制造批次按商品核验",
          nib: "钢尖；当前商品页列 EF/F/M/B/ST1/ST5",
          fill_system: "cartridge/converter；随附两支墨囊与 converter",
          material: "树脂笔身、钢制金属件",
          dimensions: "闭帽 142 mm，直径 14.8 mm",
          weight: "26.6 g",
          status: "当前 Montegrappa 官方目录可见；颜色、笔尖和地区库存按 SKU",
        },
        evidence: [
          evidence("brand_entity_id", "phase85-elmo-brand", SOURCES.catalog.key, elmoScope, "official catalog family context"),
          evidence("series_name", "phase85-elmo-series", SOURCES.elmo01.key, elmoScope, "official product title"),
          evidence("release_year", "phase85-elmo-release", SOURCES.catalog.key, elmoScope, "current catalog presence; no unsupported first-release year"),
          evidence("origin_country", "phase85-elmo-origin", SOURCES.history.key, elmoScope, "Bassano del Grappa brand context"),
          evidence("nib", "phase85-elmo-nib", SOURCES.elmo01.key, elmoScope, "official nib and writing-grade list"),
          evidence("fill_system", "phase85-elmo-fill", SOURCES.elmo01.key, elmoScope, "official cartridge/converter and included accessories"),
          evidence("material", "phase85-elmo-material", SOURCES.elmo01.key, elmoScope, "official materials and trim"),
          evidence("dimensions", "phase85-elmo-dimensions", SOURCES.elmo01.key, elmoScope, "official length and diameter"),
          evidence("weight", "phase85-elmo-weight", SOURCES.elmo01.key, elmoScope, "official 26.60 g"),
          evidence("status", "phase85-elmo-status", SOURCES.catalog.key, elmoScope, "current official catalog entry"),
        ],
      },
      media: media("phase85-elmo-01-media", "Montegrappa Elmo 01 身份与规格事实图（非产品照片）", SOURCES.elmoSvg),
      timeline: [
        { key: "phase85-elmo-01-current-catalog", title: "Elmo 01 的当前产品资料范围", eventType: "design_milestone", startDate: "2026", circa: true, description: "官网当前商品页明确列出 Elmo 01 的树脂、钢尖、墨囊／转换器、142 mm、14.8 mm 和 26.6 g；不倒推首发年份。", sourceKey: SOURCES.elmo01.key },
      ],
    },
  ];
}
