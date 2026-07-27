import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase75SheafferLegacyHeritagePacks } from "./phase75-sheaffer-legacy-heritage";

export const PHASE308_SHEAFFER_ID = "tVXnzDSFCcPP";
export const PHASE308_LEGACY_9064_ID = "phase308-sheaffer-legacy-9064";
export const PHASE308_LEGACY_9064_SLUG = "sheaffer-legacy-9064";

const RETRIEVED = "2026-07-28";

function live(
  input: Omit<
    CuratedSource,
    | "retrievedAt"
    | "allowedUse"
    | "homepageUrl"
    | "archiveUrl"
    | "archiveLocator"
    | "independenceGroup"
  >,
): CuratedSource {
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
    registryKey: "fountain-pen-graph-editorial-phase308",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase308",
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
  official: live({
    key: "phase308-sheaffer-current-legacy-9064",
    registryKey: "sheaffer-current-legacy-9064-phase308",
    registryName: "Sheaffer official",
    sourceType: "official",
    tier: "primary",
    title: "Sheaffer Legacy 9064 Glossy Black Inlaid Nib Fountain Pen",
    url: "https://sheaffer.com/products/sheaffer-legacy-9064-glossy-black-inlaid-nib-fountain-pen-with-chrome-plated-trims",
    summary:
      "官方当前产品页列出 Legacy 9064 的 SKU E0906453/SH36076 与 Fine、Medium、Broad 选择，并明确 black lacquer、chrome-plated trims、stainless-steel inlaid nib、snap-on cap、Sheaffer Classic converter、两支墨囊、清洁布与皮套；页面没有统一尺寸重量或制造地字段。",
  }),
  catalogue: live({
    key: "phase308-sheaffer-2006-catalogue-boundary",
    registryKey: "sheaffer-2006-catalogue-archive",
    registryName: "Sheaffer 2006 catalogue archive",
    sourceType: "official",
    tier: "contemporary_archive",
    title: "Sheaffer Catalogue 2006",
    url: "https://www.sheaffer.ro/cataloage1/Sheaffer/Catalog2006.pdf",
    summary:
      "保存的 Sheaffer 2006 catalogue 用于历史边界：Heritage 是宽笔身系列，笔尖为 18K gold、palladium-plated inlaid nib，并列出 9030/9031/9035/9040/9041/9046 饰面组；它不反向证明当前 9064 的钢笔尖或 SKU。",
  }),
  history: live({
    key: "phase308-sheaffer-legacy-history",
    registryKey: "sheaffer-targa-legacy-history",
    registryName: "Sheaffer Targa / Legacy history",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Sheaffer Legacy history",
    url: "https://www.sheaffertarga.com/Legacy/Legacy%20history.html",
    summary:
      "收藏史料把 Legacy I 的 1995 年 9 月、Legacy II 的 1999 年与 Heritage 的 2003 年第三代位置分开，并记录前两代 Touchdown 路线与 Heritage cartridge/converter 的代际差异。",
  }),
  penhero: live({
    key: "phase308-penhero-pfm-legacy-boundary",
    registryKey: "penhero-pfm-legacy-boundary",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Sheaffer PFM: The Pen For Men 1959–1968",
    url: "https://www.penhero.com/PenGallery/Sheaffer/SheafferPFM.htm",
    summary:
      "PenHero 将 PFM 定义为 1959–1968 的 Snorkel 大型型号，并说明后来的 Legacy 是借鉴其轮廓语言的 Touchdown 设计；共享嵌入尖外观不构成同一型号身份。",
  }),
  diagram: diagram(
    "phase308-sheaffer-legacy-9064-svg",
    "Sheaffer Legacy 9064 current revival factual identity map",
    "/images/library/site-original/phase308/sheaffer/legacy-9064.svg",
  ),
} satisfies Record<string, CuratedSource>;

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function legacy9064Pack(): CuratedEntityPack {
  const scopeKey = "phase308-sheaffer-legacy-9064-scope";
  return {
    key: "phase308-sheaffer-legacy-9064-v1",
    entityId: PHASE308_LEGACY_9064_ID,
    expectedType: "pen",
    expectedSlug: PHASE308_LEGACY_9064_SLUG,
    canonicalName: "Sheaffer Legacy 9064",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/sheaffer-legacy-9064-phase308.md",
    storyTitle: "Sheaffer Legacy 9064：把嵌入尖的传统换成现行钢尖复兴版",
    primarySourceKey: SOURCES.official.key,
    depthTier: "A",
    aliases: [
      { alias: "Sheaffer Legacy 9064", language: "en", sourceKey: SOURCES.official.key },
      { alias: "Legacy 9064", language: "en", sourceKey: SOURCES.official.key },
      { alias: "犀飞利 Legacy 9064", language: "zh", sourceKey: SOURCES.official.key },
    ],
    sources: [
      SOURCES.official,
      SOURCES.catalogue,
      SOURCES.history,
      SOURCES.penhero,
      SOURCES.diagram,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        market: "Sheaffer official current product page",
        productionState: "current",
        nibScope: "Current 9064 official selector: Fine / Medium / Broad; stainless-steel inlaid nib",
        materialScope: "Brass body, glossy black lacquer and chrome-plated trims",
        editionScope: "Exact current glossy-black, chrome-trim product page and SKU E0906453/SH36076",
      },
    ],
    claims: [
      {
        key: "phase308-9064-identity",
        predicate: "model_identity",
        objectText:
          "当前官方页上的 Sheaffer Legacy 9064 是黑色高光漆、镀铬饰件的大笔身复兴款，页面 SKU 为 E0906453/SH36076；它必须与历史 Heritage 及早期 Legacy I/II 分开建模。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.official.key,
        locator: SOURCES.official.summary,
        evidence: [
          { key: "phase308-9064-official-identity", sourceKey: SOURCES.official.key, scopeKey, locator: SOURCES.official.summary },
          { key: "phase308-9064-history-boundary", sourceKey: SOURCES.history.key, scopeKey, locator: SOURCES.history.summary },
        ],
      },
      {
        key: "phase308-9064-nib",
        predicate: "nib",
        objectText:
          "9064 当前页明确为 stainless-steel inlaid nib，并提供 Fine、Medium、Broad 三种选择；嵌入式结构不能被翻译成 Heritage 的 18K 笔尖。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.official.key,
        locator: SOURCES.official.summary,
        evidence: [
          { key: "phase308-9064-steel-nib", sourceKey: SOURCES.official.key, scopeKey, locator: SOURCES.official.summary },
          { key: "phase308-9064-heritage-nib-boundary", sourceKey: SOURCES.catalogue.key, scopeKey, locator: SOURCES.catalogue.summary },
        ],
      },
      {
        key: "phase308-9064-fill",
        predicate: "fill_system",
        objectText:
          "当前盒装路线是 Sheaffer Classic converter 加黑、蓝墨囊各一支；这不是 Legacy I/II 的 Touchdown converter，也不是 PFM 的 Snorkel。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: SOURCES.official.key,
        locator: SOURCES.official.summary,
        evidence: [
          { key: "phase308-9064-classic-converter", sourceKey: SOURCES.official.key, scopeKey, locator: SOURCES.official.summary },
          { key: "phase308-9064-touchdown-boundary", sourceKey: SOURCES.history.key, scopeKey, locator: SOURCES.history.summary },
          { key: "phase308-9064-pfm-boundary", sourceKey: SOURCES.penhero.key, scopeKey, locator: SOURCES.penhero.summary },
        ],
      },
      {
        key: "phase308-9064-material",
        predicate: "material_finish",
        objectText:
          "官方当前页所示版本为黄铜笔身、黑色高光漆与镀铬饰件；这些是当前页面的具体 finish，不应扩展成所有历史 Legacy 饰面的材质。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: SOURCES.official.key,
        locator: SOURCES.official.summary,
        evidence: [
          { key: "phase308-9064-current-finish", sourceKey: SOURCES.official.key, scopeKey, locator: SOURCES.official.summary },
        ],
      },
      {
        key: "phase308-9064-care",
        predicate: "maintenance_boundary",
        objectText:
          "9064 按普通 cartridge/converter 钢笔维护：拆下 converter 后以室温清水吸排并自然晾干；不要拆嵌入式笔尖，也不要把早期 Touchdown 的气密维修当作本款日常保养。",
        factClass: "editorial",
        confidence: 0.94,
        sourceKey: SOURCES.official.key,
        locator: SOURCES.official.summary,
        evidence: [
          { key: "phase308-9064-care-editorial", sourceKey: SOURCES.official.key, scopeKey, locator: "Official converter and cartridge configuration; maintenance wording is editorial guidance." },
          { key: "phase308-9064-care-boundary", sourceKey: SOURCES.history.key, scopeKey, locator: SOURCES.history.summary },
        ],
      },
      {
        key: "phase308-9064-selection",
        predicate: "selection_guidance",
        objectText:
          "购买时先核对官方 SKU、笔尖字样、笔帽卡合、漆面和 Classic converter；若目标是 Heritage 的 18K 嵌入尖或 Legacy I/II 的 Touchdown，应转看对应历史页。",
        factClass: "editorial",
        confidence: 0.95,
        sourceKey: SOURCES.official.key,
        locator: SOURCES.official.summary,
        evidence: [
          { key: "phase308-9064-selection-sku", sourceKey: SOURCES.official.key, scopeKey, locator: SOURCES.official.summary },
          { key: "phase308-9064-selection-catalogue", sourceKey: SOURCES.catalogue.key, scopeKey, locator: SOURCES.catalogue.summary },
        ],
      },
    ],
    variants: [
      { key: "phase308-9064-fine", name: "Fine（F）", notes: "官方当前页笔尖选择器中的 Fine；与具体库存和市场供货一起核对。", sourceKey: SOURCES.official.key, variantKind: "nib", market: "official current product page" },
      { key: "phase308-9064-medium", name: "Medium（M）", notes: "官方当前页笔尖选择器中的 Medium；与具体库存和市场供货一起核对。", sourceKey: SOURCES.official.key, variantKind: "nib", market: "official current product page" },
      { key: "phase308-9064-broad", name: "Broad（B）", notes: "官方当前页笔尖选择器中的 Broad；与具体库存和市场供货一起核对。", sourceKey: SOURCES.official.key, variantKind: "nib", market: "official current product page" },
      { key: "phase308-9064-black-chrome-sku", name: "Glossy Black / Chrome-Plated Trims", notes: "当前官方页的具体 finish；SKU E0906453/SH36076，不扩展为所有 Legacy 饰面。", sourceKey: SOURCES.official.key, variantKind: "market_sku", productCode: "E0906453/SH36076", market: "Sheaffer official" },
    ],
    spec: {
      brandEntityId: PHASE308_SHEAFFER_ID,
      values: {
        series_name: "Sheaffer Legacy 9064",
        release_year: "当前官方产品页所示的现行复兴版；官方当前页未明确首发年份",
        origin_country: "官方当前页未提供具体制造地",
        nib: "不锈钢嵌入式笔尖；Fine / Medium / Broad",
        fill_system: "Sheaffer Classic converter；盒内另附黑、蓝墨囊各一支",
        material: "黄铜笔身，黑色高光漆，镀铬饰件",
        status: "官方当前产品页在售信息；SKU E0906453/SH36076",
      },
      evidence: [
        evidence("brand_entity_id", "phase308-9064-brand", SOURCES.official.key, scopeKey, "Sheaffer official Legacy 9064 product context"),
        evidence("series_name", "phase308-9064-series", SOURCES.official.key, scopeKey, "Official product title and SKU"),
        evidence("release_year", "phase308-9064-current-state", SOURCES.official.key, scopeKey, "Current product page; no debut year stated"),
        evidence("origin_country", "phase308-9064-origin", SOURCES.official.key, scopeKey, "Current product page does not state a manufacturing country"),
        evidence("nib", "phase308-9064-nib-spec", SOURCES.official.key, scopeKey, "Stainless-steel inlaid nib and F/M/B selector"),
        evidence("fill_system", "phase308-9064-fill-spec", SOURCES.official.key, scopeKey, "Classic converter and two cartridges"),
        evidence("material", "phase308-9064-material-spec", SOURCES.official.key, scopeKey, "Brass body, glossy black lacquer, chrome-plated trims"),
        evidence("status", "phase308-9064-status", SOURCES.official.key, scopeKey, "Current official page and SKU E0906453/SH36076"),
      ],
    },
    media: [
      {
        key: "phase308-9064-media",
        title: "Sheaffer Legacy 9064 当前复兴版身份示意图（非产品照片）",
        sourceKey: SOURCES.diagram.key,
        localPath: SOURCES.diagram.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、笔尖、材质、库存、具体 SKU 或实际墨量。",
        sourceUrl: SOURCES.diagram.url,
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "phase308-9064-revival",
        title: "Legacy 9064 当前复兴版产品页",
        eventType: "revival",
        startDate: "2026",
        circa: true,
        description: "当前官方产品页展示 Legacy 9064 的钢制嵌入式笔尖、F/M/B 选择与 Classic converter；页面未明确首发年份，本日期仅表示本次资料核验年份。",
        sourceKey: SOURCES.official.key,
      },
    ],
  };
}

export const phase308SheafferLegacy9064Packs: CuratedEntityPack[] = [
  (() => {
    const brandPack = structuredClone(phase75SheafferLegacyHeritagePacks[0]!);
    const converterSource = phase75SheafferLegacyHeritagePacks[1]?.sources.find(
      (source) => source.key === "phase75-penhero-converter-history",
    );
    if (!converterSource) throw new Error("Phase 308 could not load Sheaffer converter source.");
    brandPack.sources.push(converterSource);
    return brandPack;
  })(),
  legacy9064Pack(),
];
