import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE114_AURORA_BRAND_ID,
  PHASE114_TARGET_ID,
  PHASE114_TARGET_SLUG,
  PHASE114_TARGET_NAME,
  phase114AuroraOttantottoResina800Pack,
} from "./phase114-aurora-88-family-ottantotto-resina-800";

export const PHASE410_800_ID = PHASE114_TARGET_ID;
export const PHASE410_AURORA_ID = PHASE114_AURORA_BRAND_ID;
export const PHASE410_800_SLUG = PHASE114_TARGET_SLUG;
export const PHASE410_800_NAME = PHASE114_TARGET_NAME;

const RETRIEVED = "2026-08-03";
const CURRENT_SCOPE = "phase410-aurora-800-current-2026-08-03";
const FAMILY_SCOPE = "phase410-aurora-88-family-history";
const CATALOG_SCOPE = "phase410-aurora-800-catalog-2025";
const SAMPLE_SCOPE = "phase410-aurora-800-c-sample-2007";
const PRICE_SCOPE = "phase410-aurora-800-price-italy-2026-08-03";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  title: string;
  url: string;
  homepageUrl: string;
  summary: string;
  itemType?: string;
  author?: string;
  allowedUse?: CuratedSource["allowedUse"];
  license?: string;
}): CuratedSource {
  const siteOriginal = input.sourceType === "user_submission";
  return {
    ...input,
    itemType: input.itemType ?? (siteOriginal ? "image" : "web_page"),
    author: input.author ?? input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: input.allowedUse ?? (siteOriginal ? "store_full" : "summary_only"),
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const S = {
  exact: source({
    key: "phase410-aurora-800-exact-current",
    registryKey: "aurora-web-800-phase410",
    registryName: "Aurora official shop",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "aurora-web-800-phase410",
    title: "Ottantotto Resina - Stilografica｜商品号 800",
    url: "https://aurorapen.it/shop/ottantotto-resina-stilografica/",
    homepageUrl: "https://aurorapen.it/",
    summary:
      "当前商品卡列 800、黑色树脂帽与笔身、金色饰件、活塞、EF/F/M/B，意大利市场价格 €650，检索日显示可购且不含运费。",
  }),
  family: source({
    key: "phase410-aurora-88-category",
    registryKey: "aurora-category-ottantotto-phase410",
    registryName: "Aurora official collections",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "aurora-category-ottantotto-phase410",
    title: "Ottantotto｜Aurora 官方系列页",
    url: "https://aurorapen.it/categoria-prodotto/alto-di-gamma/ottantotto/",
    homepageUrl: "https://aurorapen.it/",
    summary:
      "官方系列页以 Marcello Nizzoli 与经典延续为主线，并列 Ottantotto Millerighe 与 Ottantotto Resina 商品入口。",
  }),
  history: source({
    key: "phase410-aurora-history",
    registryKey: "aurora-history-phase410",
    registryName: "Aurora official history",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "aurora-history-phase410",
    title: "La Nostra Storia｜Aurora 官方历史",
    url: "https://aurorapen.it/la-nostra-storia/",
    homepageUrl: "https://aurorapen.it/",
    summary:
      "官方历史页写明 Aurora 1919 年在都灵成立，1947 年 Marcello Nizzoli 创造 88，并称家族至今仍在生产。",
  }),
  faq: source({
    key: "phase410-aurora-faq-nib-piston",
    registryKey: "aurora-faq-phase410",
    registryName: "Aurora official FAQ",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "aurora-faq-phase410",
    title: "FAQ｜Aurora 笔尖、隐藏备用墨仓与活塞装墨",
    url: "https://aurorapen.it/faq/",
    homepageUrl: "https://aurorapen.it/",
    summary:
      "FAQ 将 88 等高端线置于 14K（585‰）笔尖语境，说明隐藏备用墨仓、活塞吸墨及 Aurora K/S 墨囊与 converter 流程。",
  }),
  catalog: source({
    key: "phase410-aurora-high-end-catalog",
    registryKey: "aurora-high-end-catalog-2025-phase410",
    registryName: "Aurora official catalogue",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "aurora-high-end-catalog-2025-phase410",
    title: "Catalogo Alto di Gamma｜Ottantotto Resina 编号与尖材语境",
    url: "https://aurorapen.it/wp-content/uploads/2025/07/Catalogo-Alto-di-Gamma.pdf",
    homepageUrl: "https://aurorapen.it/",
    itemType: "pdf",
    summary:
      "官方高端目录在 Ottantotto Resina 页列 800、800-C、810、830 等编号，区分金色／铬色饰件，并给出 14K 实金尖与铑处理 14K 语境。",
  }),
  shop: source({
    key: "phase410-aurora-shop-overview",
    registryKey: "aurora-shop-overview-phase410",
    registryName: "Aurora official shop",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "aurora-shop-overview-phase410",
    title: "Shop｜Aurora 当前商品导航",
    url: "https://aurorapen.it/shop/",
    homepageUrl: "https://aurorapen.it/",
    summary:
      "官方商店导航把 Ottantotto Resina、Millerighe、Optima 和其他 Aurora 产品分列，并显示商品价格与可购状态的时间性。",
  }),
  resinaCategory: source({
    key: "phase410-aurora-resina-category",
    registryKey: "aurora-resina-category-phase410",
    registryName: "Aurora official collections",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "aurora-resina-category-phase410",
    title: "Ottantotto Resina｜Aurora 官方子分类",
    url: "https://aurorapen.it/categoria-prodotto/alto-di-gamma/ottantotto/ottantotto-resina",
    homepageUrl: "https://aurorapen.it/",
    summary:
      "官方子分类把 Ottantotto Resina 钢笔与同名圆珠笔分开，说明本页只承载钢笔商品入口。",
  }),
  chronology: source({
    key: "phase410-aurora-chronology",
    registryKey: "fountainpen-it-aurora-phase410",
    registryName: "FountainPen.it contributors",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "fountainpen-it-aurora-phase410",
    title: "Aurora chronology｜FountainPen.it",
    url: "https://www.fountainpen.it/Aurora/en",
    homepageUrl: "https://www.fountainpen.it/",
    author: "FountainPen.it contributors",
    summary:
      "独立资料用于交叉核对 88 早期家族和 1946／1947 日期差异，不覆盖当前商品号 800 的规格。",
  }),
  fpn: source({
    key: "phase410-aurora-800c-fpn",
    registryKey: "fountain-pen-network-aurora-800c-phase410",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    independenceGroup: "fountain-pen-network-aurora-800c-phase410",
    title: "Aurora 88 Modern 800/C｜Fountain Pen Network",
    url: "https://www.fountainpennetwork.com/forum/topic/45704-aurora-88-modern/",
    homepageUrl: "https://www.fountainpennetwork.com/",
    author: "Fountain Pen Network forum contributors",
    summary:
      "2007 讨论明确是 800/C chrome-trim 样本；容量、尺寸、墨窗和写感只保留为历史样本，不能覆盖当前 gold-trim 800。",
  }),
  penAddict: source({
    key: "phase410-aurora-88-sole-review",
    registryKey: "pen-addict-aurora-88-sole-phase410",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict-aurora-88-sole-phase410",
    title: "Aurora 88 Sole Fountain Pen review｜The Pen Addict",
    url: "https://www.penaddict.com/blog/2016/9/30/aurora-88-sole-fountain-pen-a-review",
    homepageUrl: "https://www.penaddict.com/",
    author: "Brad Dowdy",
    summary:
      "独立评测记录 Aurora 88 Sole 限量样本的活塞、约 1.1 ml 观察和笔尖反馈；不转写为 Resina 800 的稳定规格。",
  }),
  sbre: source({
    key: "phase410-aurora-88-satin-review",
    registryKey: "sbrebrown-aurora-88-phase410",
    registryName: "SBRE Brown",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "sbrebrown-aurora-88-phase410",
    title: "Aurora 88 Black Satin Rose Gold review｜SBRE Brown",
    url: "https://www.sbrebrown.com/2017/01/aurora-88-black-satin-rose-gold-fountain-pen-review/",
    homepageUrl: "https://www.sbrebrown.com/",
    author: "SBRE Brown",
    summary:
      "独立样本评测给出黑色缎面玫瑰金 88 的测量和写感，作为同家族体验参考，不回填商品号 800 尺寸。",
  }),
  pencilcase: source({
    key: "phase410-aurora-88-anniversario-review",
    registryKey: "pencilcase-aurora-88-phase410",
    registryName: "The Pencilcase Blog",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pencilcase-aurora-88-phase410",
    title: "Aurora 88 Ottantotto Anniversario review｜The Pencilcase Blog",
    url: "https://www.pencilcaseblog.com/2017/07/aurora-88-ottantotto-anniversario.html",
    homepageUrl: "https://www.pencilcaseblog.com/",
    author: "The Pencilcase Blog",
    summary:
      "独立文章以 Anniversario 样本比较 Aurora 88 与 Optima 的长度和轮廓，适合家族体验与相邻型号边界。",
  }),
  diagram: source({
    key: "phase410-aurora-800-factual-svg",
    registryKey: "fountain-pen-graph-editorial-phase410",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase410",
    title: "Aurora Ottantotto Resina 800 事实示意图（非产品照片）",
    url: "/images/library/site-original/phase114/aurora/aurora-ottantotto-resina-800.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    summary:
      "本站原创 factual SVG 区分当前 gold-trim 800、Millerighe、800/C 历史样本和系列级 14K 语境；非产品照片、非比例图。",
  }),
} satisfies Record<string, CuratedSource>;

function claim(
  key: string,
  predicate: string,
  objectText: string,
  primary: CuratedSource,
  locator: string,
  extra: CuratedSource[] = [],
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.99 : 0.93,
    sourceKey: primary.key,
    locator,
    evidence: [primary, ...extra].map((item, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: item.key,
      scopeKey:
        item.key === S.fpn.key
          ? SAMPLE_SCOPE
          : item.key === S.catalog.key
            ? CATALOG_SCOPE
            : item.key === S.chronology.key
              ? FAMILY_SCOPE
              : CURRENT_SCOPE,
      locator: index === 0 ? locator : item.summary,
    })),
  };
}

function specEvidence(
  key: string,
  fieldKey: CuratedSpecEvidence["fieldKey"],
  sourceItem: CuratedSource,
  scopeKey: string,
  locator: string,
  qualifies = true,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey: sourceItem.key, scopeKey, locator, qualifies };
}

const variants: CuratedVariant[] = [
  {
    key: "phase410-aurora-800-edition",
    name: "Ottantotto Resina 800 黑色树脂金色饰件组",
    productCode: "800",
    releaseYear: "当前目录",
    notes:
      "商品号 800 的当前 Resina 钢笔组；黑色树脂、金色饰件与活塞属于本组，800-C chrome trim 与 Millerighe 不并入。",
    sourceKey: S.exact.key,
    variantKind: "edition_group",
    market: "Aurora Italy",
  },
  ...(["EF", "F", "M", "B"] as const).map((nib) => ({
    key: `phase410-aurora-800-${nib.toLowerCase()}`,
    name: `商品号 800 ${nib} 尖选项`,
    releaseYear: "当前商品页选项",
    notes:
      `${nib} 是官方商品页列出的笔尖选项，不创建未经官方给出独立商品号的子型号；库存与实际线宽需按日期和实物核对。`,
    sourceKey: S.exact.key,
    variantKind: "market_sku" as const,
    parentVariantKey: "phase410-aurora-800-edition",
    market: "Aurora Italy",
  })),
];

const pack: CuratedEntityPack = {
  ...structuredClone(phase114AuroraOttantottoResina800Pack),
  key: "phase410-aurora-ottantotto-resina-800-refresh-v1",
  entityId: PHASE410_800_ID,
  expectedSlug: PHASE410_800_SLUG,
  canonicalName: PHASE410_800_NAME,
  markdownFile: ".planning/content-research/aurora-ottantotto-resina-800-phase410.md",
  storyTitle: "Aurora Ottantotto Resina 800：黑树脂、金色饰件与证据边界",
  primarySourceKey: S.exact.key,
  aliases: [
    { alias: "Aurora Ottantotto Resina 800", language: "en", sourceKey: S.exact.key },
    { alias: "Aurora 88 Resina 800", language: "en", sourceKey: S.exact.key },
    { alias: "Aurora 800", language: "en", kind: "alias", sourceKey: S.catalog.key },
    { alias: "Aurora 800-C", language: "en", kind: "alias", sourceKey: S.catalog.key },
  ],
  sources: [
    S.exact,
    S.family,
    S.history,
    S.faq,
    S.catalog,
    S.shop,
    S.resinaCategory,
    S.chronology,
    S.fpn,
    S.penAddict,
    S.sbre,
    S.pencilcase,
    S.diagram,
  ],
  scopes: [
    {
      key: CURRENT_SCOPE,
      scopeKey: CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "当前商品页列 EF/F/M/B；目录与 FAQ 的 14K 为高端 88 线路径说明。",
      materialScope: "商品号 800：黑色树脂帽与笔身、金色饰件。",
      editionScope: "意大利官网当前商品卡；价格与 Disponibile 为日期快照。",
    },
    {
      key: FAMILY_SCOPE,
      scopeKey: FAMILY_SCOPE,
      validFrom: "1919",
      productionState: "historical",
      editionScope: "Aurora 品牌与 1947 Nizzoli 88 家族背景；不转移早期 SKU 规格。",
    },
    {
      key: CATALOG_SCOPE,
      scopeKey: CATALOG_SCOPE,
      validFrom: "2025",
      productionState: "current",
      nibScope: "高端目录列 800／800-C 等编号与 14K 实金／铑处理尖语境；具体年份和选项仍按商品卡。",
      editionScope: "Ottantotto Resina 目录页，区分金色与铬色饰件以及相邻编号。",
    },
    {
      key: SAMPLE_SCOPE,
      scopeKey: SAMPLE_SCOPE,
      validFrom: "2007",
      validTo: "2007",
      productionState: "historical",
      materialScope: "800/C chrome-trim sample；不代表当前 800 gold trim。",
      editionScope: "容量、测量与书写体验只作为 dated sample observation。",
    },
    {
      key: PRICE_SCOPE,
      scopeKey: PRICE_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "意大利官网商品页 €650；不含运费，不能外推其他市场或未来价格。",
    },
  ],
  claims: [
    claim(
      "phase410-aurora-800-identity",
      "current_exact_identity",
      "Aurora Ottantotto Resina 商品号 800 是当前意大利官网列出的黑色树脂、金色饰件活塞钢笔，官方商品页列 EF、F、M、B；它是 Aurora 88 家族中的具体商品入口。",
      S.exact,
      "product title, SKU 800, description and EF/F/M/B option selectors",
      [S.family, S.resinaCategory],
    ),
    claim(
      "phase410-aurora-800-material",
      "material_finish",
      "商品号 800 的当前商品描述为黑色树脂帽与笔身、金色饰件；目录另列 800-C 的铬色饰件，不能将二者外观混写。",
      S.exact,
      "black resin cap/body and gold-coloured trim",
      [S.catalog],
    ),
    claim(
      "phase410-aurora-800-filling",
      "filling_system",
      "商品号 800 使用活塞供墨；Aurora FAQ 给出高端活塞的吸墨、排出几滴与清洁动作，并将隐藏备用墨仓置于高端线语境。",
      S.exact,
      "stilografica a pistone",
      [S.faq],
    ),
    claim(
      "phase410-aurora-800-nib",
      "nib_options",
      "当前商品页列 EF、F、M、B 四个笔尖选项；FAQ 将 88 等高端线置于 14K（585‰）语境，官方目录再列 800／800-C 及 14K 实金或铑处理尖的相邻编号边界。",
      S.exact,
      "EF/F/M/B selectors and current product scope",
      [S.faq, S.catalog],
    ),
    claim(
      "phase410-aurora-800-price",
      "commercial_snapshot",
      "检索日意大利官网商品页显示 €650，并注明价格仅适用于意大利市场且不含运费；Disponibile 也只是当日库存快照。",
      S.exact,
      "€650, Italy-only price note and Disponibile state",
      [S.shop],
    ),
    claim(
      "phase410-aurora-800-history",
      "family_history",
      "Aurora 官方历史将品牌创立置于 1919 年，并写明 1947 年 Marcello Nizzoli 创造 88；这是家族历史锚点，不是商品号 800 的首次上市年份。",
      S.history,
      "1919 foundation and 1947 Marcello Nizzoli 88 entry",
      [S.family, S.chronology],
    ),
    claim(
      "phase410-aurora-800-sample-boundary",
      "dated_sample_boundary",
      "Fountain Pen Network 的 2007 文章明确讨论 800/C chrome-trim 样本；其容量、尺寸、墨窗和写感不覆盖当前 gold-trim 800。",
      S.fpn,
      "2007 Aurora 88 Modern 800/C sample",
      [S.penAddict, S.sbre],
      "editorial",
    ),
    claim(
      "phase410-aurora-800-siblings",
      "sibling_boundary",
      "Ottantotto Millerighe、800-C、Ebanite、Black Mamba、Optima 和历史 88 是相邻家族或具体版本，不因共享 Aurora 88 轮廓、活塞或 14K 语境而合并为商品号 800。",
      S.family,
      "parallel Millerighe/Resina navigation and family description",
      [S.catalog, S.resinaCategory, S.pencilcase],
    ),
    claim(
      "phase410-aurora-800-care",
      "maintenance_boundary",
      "按 Aurora FAQ 的活塞步骤吸墨与排出几滴；换色时以清水反复吸排并自然沥干，避免热水、酒精、强溶剂、强压旋钮和自行拆解活塞。",
      S.faq,
      "piston loading steps and Aurora original-ink guidance",
      [S.exact],
    ),
    claim(
      "phase410-aurora-800-selection",
      "selection_guidance",
      "选购先核对商品号 800、Resina、金色饰件、EF/F/M/B 与意大利价格作用域；需要条纹帽、铬色饰件或特殊材质时跳转对应 sibling，不要把二手标题里的 Aurora 88 自动当成 800。",
      S.exact,
      "SKU, material, trim, nib option and market scope",
      [S.catalog, S.family],
      "editorial",
    ),
    claim(
      "phase410-aurora-800-media",
      "media_identity_boundary",
      "本站主图是原创 factual SVG，明确非产品照片、非比例图、非颜色校样，不代表真实 800 的刻字、纹理、库存或尖材。",
      S.diagram,
      "site-original SVG attribution and non-product-photo boundary",
      [],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE410_AURORA_ID,
    values: {
      series_name: "Aurora Ottantotto Resina / SKU 800",
      release_year: "1947 为 88 家族历史锚点；当前商品卡检索于 2026-08-03，不断言 800 首次上市年份",
      origin_country: "Aurora 都灵／意大利产品线；具体实物制造标记按笔身核对",
      nib: "当前页面 EF/F/M/B；Aurora FAQ 与高端目录将 88／800 路线置于 14K 语境，具体尖材按同 SKU 实物与目录核对",
      fill_system: "活塞；Aurora FAQ 提供高端活塞吸墨与隐藏备用墨仓说明",
      material: "当前 SKU 800：黑色树脂帽与笔身、金色饰件",
      price_range: "意大利官网检索日 €650；不含运费，价格与库存可变",
      status: "当前商品卡显示 Disponibile；市场与日期作用域受限",
    },
    evidence: [
      specEvidence("phase410-aurora-800-spec-brand", "brand_entity_id", S.exact, CURRENT_SCOPE, "Aurora exact product and existing brand identity"),
      specEvidence("phase410-aurora-800-spec-series", "series_name", S.exact, CURRENT_SCOPE, "Ottantotto Resina and product number 800"),
      specEvidence("phase410-aurora-800-spec-release", "release_year", S.history, FAMILY_SCOPE, "1947 family history; current retrieval is not launch year"),
      specEvidence("phase410-aurora-800-spec-origin", "origin_country", S.history, FAMILY_SCOPE, "Aurora Turin and Italian history context"),
      specEvidence("phase410-aurora-800-spec-nib", "nib", S.exact, CURRENT_SCOPE, "EF/F/M/B selectors", true),
      specEvidence("phase410-aurora-800-spec-nib-14k", "nib", S.catalog, CATALOG_SCOPE, "800/800-C 14K catalogue context; exact width/material pairing remains scoped", true),
      specEvidence("phase410-aurora-800-spec-fill", "fill_system", S.exact, CURRENT_SCOPE, "stilografica a pistone"),
      specEvidence("phase410-aurora-800-spec-material", "material", S.exact, CURRENT_SCOPE, "black resin cap/body and gold trim"),
      specEvidence("phase410-aurora-800-spec-price", "price_range", S.exact, PRICE_SCOPE, "€650 Italy-only price snapshot"),
      specEvidence("phase410-aurora-800-spec-status", "status", S.exact, CURRENT_SCOPE, "Disponibile on retrieval date"),
    ],
  },
  timeline: [
    {
      key: "phase410-aurora-88-1947",
      title: "Aurora 官方将 88 家族锚定在 1947 年",
      eventType: "design_milestone",
      startDate: "1947",
      circa: false,
      description: "Aurora 历史页写 Marcello Nizzoli 创造 88；这是家族史，不是商品号 800 的上市年份。",
      sourceKey: S.history.key,
    },
    {
      key: "phase410-aurora-800-current",
      title: "当前商品页列出 Ottantotto Resina 商品号 800",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "黑色树脂、金色饰件、活塞、EF/F/M/B 与意大利价格 €650 在检索日页面可见。",
      sourceKey: S.exact.key,
    },
    {
      key: "phase410-aurora-800c-2007",
      title: "独立资料记录 800/C chrome-trim 样本",
      eventType: "community_event",
      startDate: "2007",
      circa: false,
      description: "容量、尺寸与写感作为历史样本保留，不回填当前 gold-trim 800。",
      sourceKey: S.fpn.key,
    },
  ],
  conflicts: [],
  media: [
    {
      key: "phase410-aurora-800-primary-svg",
      title: "Aurora Ottantotto Resina 800 事实示意图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；非产品照片、非比例图、非颜色校样，不表现真实刻字、Logo 或库存。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
};

export const phase410AuroraOttantottoResina800RefreshPacks: CuratedEntityPack[] = [pack];
