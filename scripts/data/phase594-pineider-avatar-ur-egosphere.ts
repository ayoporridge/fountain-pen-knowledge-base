import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE593_PINEIDER_BRAND_ID,
  phase593PineiderBrandPack,
} from "./phase593-pineider-avatar-anniversary-mini";

export const PHASE594_PINEIDER_BRAND_ID = PHASE593_PINEIDER_BRAND_ID;

export const PHASE594_IDS = {
  avatarUr: "phase140-pineider-avatar-ur",
  egosphere: "phase594-pineider-egosphere",
} as const;

export const PHASE594_SLUGS = {
  avatarUr: "pineider-avatar-ur",
  egosphere: "pineider-egosphere-1056-1058",
} as const;

const RETRIEVED = "2026-08-11";

function web(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
  > & { locator: string },
): CuratedSource {
  const { locator, ...source } = input;
  return {
    ...source,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}`,
  };
}

function official(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  publishedAt?: string;
}): CuratedSource {
  return web({
    ...input,
    registryKey: "pineider-official-phase594",
    registryName: "Pineider 1774",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pineider-official",
    homepageUrl: "https://www.pineider.com/",
    author: "Pineider 1774",
  });
}

function secondary(input: {
  key: string;
  registryKey: string;
  registryName: string;
  independenceGroup: string;
  title: string;
  url: string;
  homepageUrl: string;
  author: string;
  summary: string;
  locator: string;
  publishedAt?: string;
  sourceType?: "blog" | "retailer";
  tier?: "professional_secondary" | "contemporary_archive";
}): CuratedSource {
  return web({
    ...input,
    sourceType: input.sourceType ?? "blog",
    tier: input.tier ?? "professional_secondary",
  });
}

function editorial(input: {
  key: string;
  registryKey: string;
  title: string;
  localPath: string;
  summary: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: input.localPath,
    archiveLocator: `project-public-asset:${input.localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function specEvidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
  note?: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies, note };
}

const S = {
  avatarExact: official({
    key: "phase594-pineider-avatar-ur-pp2101-600-official",
    title: "Avatar UR Fountain Pen",
    url: "https://www.pineider.com/us/products/avatar-ur-fountain-pen-600",
    summary:
      "当前 exact 页面确认 PP2101／600、148 mm、Ø14.2 mm、Italy、UltraResin、镀钯不锈钢 EF／F／M、Magnetic Lock 与 cartridge／converter；当前选择器八色对应二十四个 child SKU。",
    locator:
      "H1 and Model PP2101/600; DETAILS 148 MM, diameter 14.2 MM and Italy; description states UltraResin, palladium-plated stainless-steel nib, Magnetic Lock and cartridge/converter; selector HTML maps eight named colours to 24 selectable SKUs",
  }),
  avatarCollection: official({
    key: "phase594-pineider-avatar-collection",
    title: "Pineider Avatar collection",
    url: "https://www.pineider.com/en/pens/collections/avatar",
    summary:
      "Avatar 家族页说明 UltraResin、羽毛形笔夹、佛罗伦萨天际线帽环与磁吸结构，并把不同 Avatar 产品入口分开。",
    locator:
      "Avatar family prose identifies UltraResin, marine-steel feather clip, Florence skyline ring and magnetic closure; product grid separates family products",
  }),
  wadAvatar: secondary({
    key: "phase594-wad-pineider-avatar-ur",
    registryKey: "well-appointed-desk-phase594-avatar-ur",
    registryName: "The Well-Appointed Desk",
    independenceGroup: "well-appointed-desk",
    title: "Fountain Pen Review: Pineider Avatar UR Fountain",
    url: "https://www.wellappointeddesk.com/2021/05/fountain-pen-review-pineider-avatar-ur-fountain/",
    homepageUrl: "https://www.wellappointeddesk.com/",
    author: "The Well-Appointed Desk",
    publishedAt: "2021-05-11",
    summary:
      "Abalone Green 样笔文章给出约 14.5 cm 合帽、13.5 cm 开帽与约 30 g 的样笔值，并记录金属握位的使用感；不代表官网公称规格。",
    locator:
      "reviewed Abalone Green sample; dimensions approximately 14.5 cm capped and 13.5 cm uncapped; total sample weight approximately 30 g; handling observations are sample-scoped",
  }),
  poorPenmanAvatar: secondary({
    key: "phase594-poor-penman-pineider-avatar-ur",
    registryKey: "poor-penman-phase594-avatar-ur",
    registryName: "The Poor Penman",
    independenceGroup: "the-poor-penman",
    title: "Pineider Avatar UR Fountain Pen Review",
    url: "https://thepoorpenman.com/2020/05/25/pineider-avatar-ur-fountain-pen-review/",
    homepageUrl: "https://thepoorpenman.com/",
    author: "The Poor Penman",
    publishedAt: "2020-05-25",
    summary:
      "自购 Amber demonstrator 旧样本记录 converter、钢尖、磁吸帽与较早软触感握位，并提示后续握位变化；仅支撑代际样本边界。",
    locator:
      "self-purchased Amber demonstrator review; converter, steel nib, magnetic cap and earlier soft-touch grip; text notes later grip treatment changed",
  }),
  penthusiastAvatar: secondary({
    key: "phase594-penthusiast-pineider-avatar-ur",
    registryKey: "penthusiast-phase594-avatar-ur",
    registryName: "Penthusiast",
    independenceGroup: "penthusiast",
    title: "Pineider Avatar UR",
    url: "https://penthusiast.net/pineider-avatar-ur/",
    homepageUrl: "https://penthusiast.net/",
    author: "Penthusiast",
    summary:
      "两支 M 尖样笔被描述为出墨偏湿；文章另记录磁吸帽内部凝露与金属件维护观察。两支样本不能代表全系列质量分布。",
    locator:
      "two medium-nib samples described as wet writers; magnetic-cap condensation and metal-component maintenance observations remain sample-scoped",
  }),
  egosphere1056: official({
    key: "phase594-pineider-egosphere-1056-official",
    title: "Egosphere Fountain Pen",
    url: "https://www.pineider.com/us/products/egosphere-fountain-pen-1056",
    summary:
      "当前页面确认 S000S008445056／1056、NERO、Italy 与 out of stock；正文列手工车削实心树脂、925 银中环、铑镀层、压印珐琅与绿色嵌石。",
    locator:
      "H1 Egosphere Fountain Pen; Model S000S008445056/1056; NERO; Origin Italy; out of stock; description states hand-turned solid resin, solid 925 sterling-silver central band, rhodium plating, coining/enameling and green stone",
  }),
  egosphere1058: official({
    key: "phase594-pineider-egopshere-1058-official",
    title: "Egopshere Fountain Pen",
    url: "https://www.pineider.com/us/products/egopshere-fountain-pen-1058",
    summary:
      "当前英文页标题误拼 Egopshere，正文仍写 Egosphere；页面确认 S000S088831060／1058、VERDE、Italy、out of stock 与 Ghibelline merlon 设计语境。",
    locator:
      "H1 typo Egopshere Fountain Pen while description says Egosphere; Model S000S088831060/1058; VERDE; Origin Italy; out of stock; Ghibelline merlon and Tuscan tower context",
  }),
  egosphere1058It: official({
    key: "phase594-pineider-egosphere-1058-italian-official",
    title: "Penna Stilografica Egosphere",
    url: "https://www.pineider.com/it/prodotti/penna-stilografica-egosphere-1058",
    summary:
      "意大利语 exact 页面说明 1058 笔夹处绿色石材为厄尔巴岛碧玉，并以托斯卡纳中世纪塔楼与 Ghibelline merlon 解释装饰。",
    locator:
      "Italian description identifies the green clip-base stone as jasper from Elba island and links the Ghibelline merlon form to Tuscan medieval towers",
  }),
  trenti: web({
    key: "phase594-luigi-trenti-egosphere",
    registryKey: "luigi-trenti-design-archive",
    registryName: "Luigi Trenti",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "luigi-trenti",
    title: "Egosphere / Nuova 1949",
    url: "https://www.trenti.design/",
    homepageUrl: "https://www.trenti.design/",
    author: "Luigi Trenti",
    summary:
      "设计者档案把 Egosphere 放在 1999 年，说明帽部从棱角截面渐变为圆形的 morphing 概念，并称其后来成为 Pineider institutional pen。",
    locator:
      "portfolio entry Egosphere/Nuova 1949; 1999; morphing introduced on cap from angular section to circular form; described as institutional Pineider pen",
  }),
  mudeto: secondary({
    key: "phase594-mudeto-luigi-trenti-egosphere",
    registryKey: "museo-design-toscano-phase594",
    registryName: "Museo del Design Toscano",
    independenceGroup: "museo-del-design-toscano",
    title: "Interviste sul progetto — Luigi Trenti",
    url: "https://www.mudeto.it/img/lesena/interviste_sul_progetto.pdf",
    homepageUrl: "https://www.mudeto.it/",
    author: "Museo del Design Toscano",
    summary:
      "专业访谈确认 Luigi Trenti 为 Pineider 设计 Egosphere，并把它描述为品牌象征性钢笔；只支撑设计归属与地位。",
    locator:
      "Luigi Trenti interview section identifies Egosphere as his Pineider design and describes the pen as a brand symbol",
  }),
  historicCatalog: secondary({
    key: "phase594-pineider-historic-catalog-egosphere",
    registryKey: "pineider-historic-catalog-mirror-phase594",
    registryName: "Pineider historical catalog mirror",
    independenceGroup: "pineider-historic-catalog",
    title: "Pineider Catalogo",
    url: "https://thisbugslife.com/wp-content/uploads/2015/03/catalogo-pineider.pdf",
    homepageUrl: "https://thisbugslife.com/",
    author: "Pineider",
    summary:
      "历史目录称 Egosphere 系列曾整体更新，并列 classic black、Makassar 与 Vanilla；只证明旧系列范围，不证明当前 1056／1058 配置。",
    locator:
      "historical Egosphere catalog section describes a revised line and lists classic black, Makassar and Vanilla finishes",
    tier: "contemporary_archive",
  }),
  arcadia: secondary({
    key: "phase594-arcadia-egosphere-edizione-autore",
    registryKey: "arcadia-auction-phase594-egosphere",
    registryName: "Arcadia Casa d'Aste",
    independenceGroup: "arcadia-auction",
    title: "Penne da Collezione e Accessori da Scrivania",
    url: "https://www.astearcadia.com/uploads/auctions/1090-379360-asta-0095-ID-1090--Asta-a-Tempo-Penne-da-Collezione-e-Accessori-da-Scrivania.PDF",
    homepageUrl: "https://www.astearcadia.com/",
    author: "Arcadia Casa d'Aste",
    summary:
      "专业拍卖目录的 Egosphere Edizione d'Autore 旧样本列黑色树脂、金色饰件、绿色碧玉、18K M 尖与 100 支编号；不得覆盖当前 exact pages。",
    locator:
      "Egosphere Edizione d'Autore lot describes black resin, gold trim, green jasper, 18K medium nib and numbered edition of 100; no current 1056/1058 code",
  }),
};

const avatarDiagram = editorial({
  key: "phase594-pineider-avatar-ur-diagram",
  registryKey: "fountain-pen-graph-editorial-phase594-avatar-ur",
  title: "Pineider Avatar UR PP2101／600 身份与二十四个 SKU 边界事实图",
  localPath: "/images/library/site-original/phase140/pineider/avatar-ur.svg",
  summary:
    "本站原创事实示意图，非产品照片；沿用已审核且路径唯一的 Phase 140 资产，只表达标准 Avatar UR 的事实轴与 sibling 排除。",
});

const egosphereDiagram = editorial({
  key: "phase594-pineider-egosphere-diagram",
  registryKey: "fountain-pen-graph-editorial-phase594-egosphere",
  title: "Pineider Egosphere 1056／1058 身份与历史样本边界事实图",
  localPath:
    "/images/library/site-original/phase594/pineider/pineider-egosphere.svg",
  summary:
    "本站原创事实示意图，非产品照片；用双代码、morphing 轨迹与未知字段表达身份，不复刻品牌标识、商品照片、真实笔形、颜色、石纹或比例。",
});

const avatarCurrent = "phase594-pineider-avatar-ur-current-pp2101-600";
const avatarMain = "phase594-pineider-avatar-ur-main";
const avatarHidden = "phase594-pineider-avatar-ur-hidden-selector-codes";
const avatarWadSample = "phase594-pineider-avatar-ur-wad-sample";
const avatarHistoric = "phase594-pineider-avatar-ur-historic-sample";
const avatarReview = "phase594-pineider-avatar-ur-two-m-samples";
const avatarSibling = "phase594-pineider-avatar-ur-sibling-products";

const AVATAR_SKUS = [
  ["e039", "Orange 039 Extra Fine", "SPP2101E039"],
  ["f039", "Orange 039 Fine", "SPP2101F039"],
  ["m039", "Orange 039 Medium", "SPP2101M039"],
  ["e422", "Riace Bronze 422 Extra Fine", "SSAEXPP2101422"],
  ["f422", "Riace Bronze 422 Fine", "SSAFXPP2101422"],
  ["m422", "Riace Bronze 422 Medium", "SSAMXPP2101422"],
  ["e423", "Abalone Green 423 Extra Fine", "SSAEXPP2101423"],
  ["f423", "Abalone Green 423 Fine", "SSAFXPP2101423"],
  ["m423", "Abalone Green 423 Medium", "SSAMXPP2101423"],
  ["e420", "Devil Red 420 Extra Fine", "SSAEXPP2101420"],
  ["f420", "Devil Red 420 Fine", "SSAFXPP2101420"],
  ["m420", "Devil Red 420 Medium", "SSAMXPP2101420"],
  ["e421", "Graphene Black 421 Extra Fine", "SSAEXPP2101421"],
  ["f421", "Graphene Black 421 Fine", "SSAFXPP2101421"],
  ["m421", "Graphene Black 421 Medium", "SSAMXPP2101421"],
  ["e325", "Foresta 325 Extra Fine", "SSAEXPP2101325"],
  ["f325", "Foresta 325 Fine", "SSAFXPP2101325"],
  ["m325", "Foresta 325 Medium", "SSAMXPP2101325"],
  ["e419", "Angel Skin 419 Extra Fine", "SSAEXPP2101419"],
  ["f419", "Angel Skin 419 Fine", "SSAFXPP2101419"],
  ["m419", "Angel Skin 419 Medium", "SSAMXPP2101419"],
  ["e424", "Neptune Blue 424 Extra Fine", "SSAEXPP2101424"],
  ["f424", "Neptune Blue 424 Fine", "SSAFXPP2101424"],
  ["m424", "Neptune Blue 424 Medium", "SSAMXPP2101424"],
] as const;

export const phase594PineiderAvatarUrPack: CuratedEntityPack = {
  key: "phase594-pineider-avatar-ur-v1",
  entityId: PHASE594_IDS.avatarUr,
  expectedType: "pen",
  expectedSlug: PHASE594_SLUGS.avatarUr,
  canonicalName: "Pineider Avatar UR",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pineider-avatar-ur-phase594.md",
  storyTitle: "Pineider Avatar UR：PP2101／600 与二十四个当前 child SKU",
  primarySourceKey: S.avatarExact.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Avatar UR PP2101/600",
      language: "en",
      sourceKey: S.avatarExact.key,
    },
    {
      alias: "Pineider Avatar UltraResin",
      language: "en",
      sourceKey: S.avatarExact.key,
    },
    {
      alias: "皮内德 Avatar UR 钢笔",
      language: "zh",
      sourceKey: S.avatarExact.key,
    },
  ],
  sources: [
    S.avatarExact,
    S.avatarCollection,
    S.wadAvatar,
    S.poorPenmanAvatar,
    S.penthusiastAvatar,
    avatarDiagram,
  ],
  scopes: [
    {
      key: avatarCurrent,
      scopeKey: avatarCurrent,
      variantKey: avatarMain,
      market: "current PP2101/600 exact page; eight named colours",
      productionState: "current",
      nibScope: "Palladium-plated stainless steel; EF, F and M.",
      materialScope: "UltraResin with metal grip and Magnetic Lock.",
      editionScope: "Standard full-size Avatar UR; 24 selector-backed SKUs.",
    },
    {
      key: avatarHidden,
      scopeKey: avatarHidden,
      market: "hidden HTML codes ending 381, 597 and 681",
      productionState: "unknown",
      editionScope:
        "No current selector label maps these suffixes to a colour; excluded from canonical current variants.",
    },
    {
      key: avatarWadSample,
      scopeKey: avatarWadSample,
      market: "The Well-Appointed Desk Abalone Green sample",
      productionState: "historical",
      editionScope:
        "Approximate 14.5 cm capped, 13.5 cm uncapped and 30 g are sample measurements.",
    },
    {
      key: avatarHistoric,
      scopeKey: avatarHistoric,
      market: "2020 Amber demonstrator sample",
      productionState: "historical",
      materialScope: "Earlier soft-touch grip treatment; not current PP2101 spec.",
    },
    {
      key: avatarReview,
      scopeKey: avatarReview,
      market: "Penthusiast two medium-nib samples",
      productionState: "unknown",
      nibScope: "Two M samples described as wet writers.",
      editionScope: "Condensation observation is maintenance context only.",
    },
    {
      key: avatarSibling,
      scopeKey: avatarSibling,
      market: "Avatar sibling products",
      productionState: "unknown",
      editionScope:
        "Deluxe 14K, Demo, Demo Metal, Black Edition, Twin Tank Touchdown, Anniversary and Mini remain separate.",
    },
  ],
  claims: [
    {
      key: "phase594-avatar-exact-identity",
      predicate: "exact_product_identity",
      objectText:
        "Avatar UR is PP2101/600 with 24 selectable child SKUs across eight named colours, each in EF, F or M.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.avatarExact.key,
      locator: S.avatarExact.summary,
      evidence: [
        {
          key: "phase594-avatar-exact-identity-evidence",
          sourceKey: S.avatarExact.key,
          scopeKey: avatarCurrent,
          locator: S.avatarExact.summary,
        },
      ],
    },
    {
      key: "phase594-avatar-current-configuration",
      predicate: "current_configuration",
      objectText:
        "The exact page specifies 148 mm by 14.2 mm, Italy, UltraResin, a palladium-plated stainless-steel EF/F/M nib, Magnetic Lock and cartridge/converter filling.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.avatarExact.key,
      locator: S.avatarExact.summary,
      evidence: [
        {
          key: "phase594-avatar-current-configuration-evidence",
          sourceKey: S.avatarExact.key,
          scopeKey: avatarCurrent,
          locator: S.avatarExact.summary,
        },
        {
          key: "phase594-avatar-family-context-evidence",
          sourceKey: S.avatarCollection.key,
          scopeKey: avatarCurrent,
          locator: S.avatarCollection.summary,
        },
      ],
    },
    {
      key: "phase594-avatar-hidden-code-boundary",
      predicate: "variant_scope_boundary",
      objectText:
        "Hidden HTML codes ending 381, 597 and 681 have no current named selector mapping and are excluded from the canonical 24-SKU set.",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.avatarExact.key,
      locator: S.avatarExact.summary,
      evidence: [
        {
          key: "phase594-avatar-hidden-code-evidence",
          sourceKey: S.avatarExact.key,
          scopeKey: avatarHidden,
          locator:
            "HTML contains stale or hidden 381, 597 and 681 code suffixes, while the current named selector exposes only 039, 422, 423, 420, 421, 325, 419 and 424.",
        },
      ],
    },
    {
      key: "phase594-avatar-wad-sample",
      predicate: "professional_sample_measurement",
      objectText:
        "A reviewed Abalone Green sample measured approximately 14.5 cm capped, 13.5 cm uncapped and 30 g; these are not official nominal values.",
      factClass: "editorial",
      confidence: 0.9,
      sourceKey: S.wadAvatar.key,
      locator: S.wadAvatar.summary,
      evidence: [
        {
          key: "phase594-avatar-wad-sample-evidence",
          sourceKey: S.wadAvatar.key,
          scopeKey: avatarWadSample,
          locator: S.wadAvatar.summary,
        },
      ],
    },
    {
      key: "phase594-avatar-generation-boundary",
      predicate: "generation_boundary",
      objectText:
        "A 2020 Amber demonstrator sample used an earlier soft-touch grip treatment; it does not replace the current PP2101/600 exact-page configuration.",
      factClass: "editorial",
      confidence: 0.9,
      sourceKey: S.poorPenmanAvatar.key,
      locator: S.poorPenmanAvatar.summary,
      evidence: [
        {
          key: "phase594-avatar-generation-boundary-evidence",
          sourceKey: S.poorPenmanAvatar.key,
          scopeKey: avatarHistoric,
          locator: S.poorPenmanAvatar.summary,
        },
      ],
    },
    {
      key: "phase594-avatar-sample-writing-maintenance",
      predicate: "professional_observation",
      objectText:
        "Two medium-nib samples were wet writers, and magnetic-cap condensation was observed; both remain sample-scoped use and maintenance context.",
      factClass: "editorial",
      confidence: 0.86,
      sourceKey: S.penthusiastAvatar.key,
      locator: S.penthusiastAvatar.summary,
      evidence: [
        {
          key: "phase594-avatar-sample-writing-maintenance-evidence",
          sourceKey: S.penthusiastAvatar.key,
          scopeKey: avatarReview,
          locator: S.penthusiastAvatar.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: avatarMain,
      name: "Avatar UR PP2101／600 current fountain pen",
      notes:
        "Current standard full-size edition group with eight named colours and three nib widths.",
      sourceKey: S.avatarExact.key,
      variantKind: "edition_group",
      productCode: "PP2101/600",
      market: "global",
    },
    ...AVATAR_SKUS.map(([key, name, productCode]) => ({
      key: `phase594-avatar-sku-${key}`,
      name,
      notes:
        "Exact current child SKU from the official PP2101/600 named selector.",
      sourceKey: S.avatarExact.key,
      variantKind: "market_sku" as const,
      parentVariantKey: avatarMain,
      productCode,
      market: "global",
    })),
  ],
  spec: {
    brandEntityId: PHASE594_PINEIDER_BRAND_ID,
    values: {
      series_name: "Avatar UR",
      origin_country: "Italy",
      nib: "Palladium-plated stainless steel; Extra Fine, Fine or Medium",
      fill_system: "Cartridge or converter",
      material: "UltraResin with metal grip and Magnetic Lock",
      dimensions:
        "Official 148 mm and diameter 14.2 mm; reviewed sample about 145 mm capped and 135 mm uncapped",
      weight: "About 30 g reviewed Abalone Green sample; no official nominal weight",
      status:
        "Current PP2101/600 exact page; eight named colours and 24 selector-backed child SKUs",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase594-avatar-spec-brand",
        S.avatarExact.key,
        avatarCurrent,
        "Official exact page identifies the product as Pineider PP2101/600.",
      ),
      ...([
        ["series_name", "series", "H1 Avatar UR Fountain Pen and Model PP2101/600."],
        ["origin_country", "origin", "DETAILS states Origin Italy."],
        ["nib", "nib", "Description and selector state palladium-plated stainless steel in EF/F/M."],
        ["fill_system", "fill", "Description states cartridge and converter filling."],
        ["material", "material", "Description states UltraResin and Magnetic Lock."],
        ["dimensions", "dimensions", "DETAILS states 148 MM and diameter 14.2 MM."],
        ["status", "status", "Current named selector maps eight colours to 24 child SKUs."],
      ] as const).map(([field, key, locator]) =>
        specEvidence(
          field,
          `phase594-avatar-spec-${key}`,
          S.avatarExact.key,
          avatarCurrent,
          locator,
        ),
      ),
      specEvidence(
        "dimensions",
        "phase594-avatar-rejected-sample-dimensions",
        S.wadAvatar.key,
        avatarWadSample,
        "Reviewed sample was approximately 14.5 cm capped and 13.5 cm uncapped.",
        false,
        "Sample measurements are retained but do not override official 148 mm nominal length.",
      ),
      specEvidence(
        "weight",
        "phase594-avatar-spec-sample-weight",
        S.wadAvatar.key,
        avatarWadSample,
        "Reviewed Abalone Green sample weighed approximately 30 g.",
        true,
        "Sample-only value; official nominal weight remains unavailable.",
      ),
      specEvidence(
        "material",
        "phase594-avatar-rejected-historic-grip",
        S.poorPenmanAvatar.key,
        avatarHistoric,
        "Earlier Amber demonstrator sample had a soft-touch grip treatment.",
        false,
        "Historic sample treatment does not override current exact-page material scope.",
      ),
      specEvidence(
        "status",
        "phase594-avatar-rejected-hidden-codes",
        S.avatarExact.key,
        avatarHidden,
        "Hidden codes ending 381, 597 and 681 lack current named selector labels.",
        false,
        "Unresolved hidden HTML evidence is excluded from the current canonical variant set.",
      ),
    ],
  },
  conflicts: [
    {
      key: "phase594-avatar-nominal-vs-sample-dimensions",
      fieldKey: "dimensions",
      scopeKey: avatarCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Pineider's 148 mm remains the canonical nominal value; WAD measurements remain labelled to one Abalone Green sample.",
      members: [
        {
          citationKey: "phase594-avatar-spec-dimensions",
          assertedValue: "Official nominal length 148 mm",
        },
        {
          citationKey: "phase594-avatar-rejected-sample-dimensions",
          assertedValue: "Reviewed sample approximately 145 mm capped",
        },
      ],
    },
    {
      key: "phase594-avatar-hidden-selector-boundary",
      fieldKey: "status",
      scopeKey: avatarCurrent,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote:
        "Only eight named current selector colours and their 24 selectable SKUs qualify. Hidden 381, 597 and 681 suffixes remain unresolved and rejected.",
      members: [
        {
          citationKey: "phase594-avatar-spec-status",
          assertedValue: "Eight named colours and 24 current child SKUs",
        },
        {
          citationKey: "phase594-avatar-rejected-hidden-codes",
          assertedValue: "Unlabelled hidden suffixes 381, 597 and 681",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase594-pineider-avatar-ur-primary",
      title:
        "Pineider Avatar UR PP2101／600 身份与二十四个 SKU 边界事实图（非产品照片）",
      sourceKey: avatarDiagram.key,
      localPath: avatarDiagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、UltraResin 纹理、外形、比例、商标、帽环、笔夹、握位或磁吸机构。",
      sourceUrl: avatarDiagram.url,
      usageStatus: "primary",
    },
  ],
};

const egosphere1056 = "phase594-pineider-egosphere-current-1056";
const egosphere1058 = "phase594-pineider-egosphere-current-1058";
const egosphereDesign = "phase594-pineider-egosphere-design-1999";
const egosphereHistory = "phase594-pineider-egosphere-historic-catalog";
const egosphereAuction = "phase594-pineider-egosphere-auction-sample";

export const phase594PineiderEgospherePack: CuratedEntityPack = {
  key: "phase594-pineider-egosphere-v1",
  entityId: PHASE594_IDS.egosphere,
  expectedType: "pen",
  expectedSlug: PHASE594_SLUGS.egosphere,
  canonicalName: "Pineider Egosphere Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pineider-egosphere-phase594.md",
  storyTitle: "Pineider Egosphere：1056、1058 与 1999 morphing 设计边界",
  primarySourceKey: S.egosphere1056.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Egosphere",
      language: "en",
      sourceKey: S.egosphere1056.key,
    },
    {
      alias: "Pineider Egopshere Fountain Pen",
      language: "en",
      kind: "alias",
      sourceKey: S.egosphere1058.key,
    },
    {
      alias: "Pineider Egosphere 1056/1058",
      language: "en",
      sourceKey: S.egosphere1056.key,
    },
    {
      alias: "皮内德 Egosphere 钢笔",
      language: "zh",
      sourceKey: S.egosphere1056.key,
    },
  ],
  sources: [
    S.egosphere1056,
    S.egosphere1058,
    S.egosphere1058It,
    S.trenti,
    S.mudeto,
    S.historicCatalog,
    S.arcadia,
    egosphereDiagram,
  ],
  scopes: [
    {
      key: egosphere1056,
      scopeKey: egosphere1056,
      variantKey: "phase594-egosphere-edition-1056",
      market: "current US exact page; Black/NERO",
      productionState: "unknown",
      materialScope:
        "Solid resin, solid 925 sterling-silver central band, rhodium-plated fittings, coining/enameling and green stone.",
      editionScope:
        "Page accessible and out of stock on 2026-08-11; nib, filling, dimensions, weight and closure undisclosed.",
    },
    {
      key: egosphere1058,
      scopeKey: egosphere1058,
      variantKey: "phase594-egosphere-edition-1058",
      market: "current US and Italian exact pages; Green/VERDE",
      productionState: "unknown",
      materialScope: "Green stone identified as Elba-island jasper on Italian page.",
      editionScope:
        "US title misspells Egopshere; page accessible and out of stock on 2026-08-11; nib, filling, dimensions and weight undisclosed.",
    },
    {
      key: egosphereDesign,
      scopeKey: egosphereDesign,
      market: "Luigi Trenti design archive",
      validFrom: "1999",
      productionState: "historical",
      editionScope:
        "Morphing cap-form concept and design attribution; not a release-year claim for current codes.",
    },
    {
      key: egosphereHistory,
      scopeKey: egosphereHistory,
      market: "historical Pineider catalog",
      productionState: "historical",
      materialScope: "Classic black, Makassar and Vanilla historical finishes.",
    },
    {
      key: egosphereAuction,
      scopeKey: egosphereAuction,
      market: "Arcadia Egosphere Edizione d'Autore auction sample",
      productionState: "historical",
      nibScope: "18K medium nib on one historic sample.",
      materialScope: "Black resin, gold trim and green jasper on one sample.",
      editionScope: "Numbered edition of 100 on one sample; no 1056/1058 code.",
    },
  ],
  claims: [
    {
      key: "phase594-egosphere-canonical-identity",
      predicate: "exact_product_identity",
      objectText:
        "Egosphere is one canonical model with Black S000S008445056/1056 and Green S000S088831060/1058 edition children; Egopshere is the official 1058 title typo.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.egosphere1056.key,
      locator: S.egosphere1056.summary,
      evidence: [
        {
          key: "phase594-egosphere-identity-1056-evidence",
          sourceKey: S.egosphere1056.key,
          scopeKey: egosphere1056,
          locator: S.egosphere1056.summary,
        },
        {
          key: "phase594-egosphere-identity-1058-evidence",
          sourceKey: S.egosphere1058.key,
          scopeKey: egosphere1058,
          locator: S.egosphere1058.summary,
        },
      ],
    },
    {
      key: "phase594-egosphere-1056-material",
      predicate: "edition_configuration",
      objectText:
        "The Black 1056 exact page specifies hand-worked solid resin, a solid 925 sterling-silver central band, rhodium-plated fittings, coining/enameling and a green stone.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.egosphere1056.key,
      locator: S.egosphere1056.summary,
      evidence: [
        {
          key: "phase594-egosphere-1056-material-evidence",
          sourceKey: S.egosphere1056.key,
          scopeKey: egosphere1056,
          locator: S.egosphere1056.summary,
        },
      ],
    },
    {
      key: "phase594-egosphere-1058-design",
      predicate: "edition_configuration",
      objectText:
        "The Green 1058 exact pages connect its Ghibelline merlon form to Tuscan towers and identify the green clip-base stone as jasper from Elba island.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.egosphere1058It.key,
      locator: S.egosphere1058It.summary,
      evidence: [
        {
          key: "phase594-egosphere-1058-design-us-evidence",
          sourceKey: S.egosphere1058.key,
          scopeKey: egosphere1058,
          locator: S.egosphere1058.summary,
        },
        {
          key: "phase594-egosphere-1058-design-it-evidence",
          sourceKey: S.egosphere1058It.key,
          scopeKey: egosphere1058,
          locator: S.egosphere1058It.summary,
        },
      ],
    },
    {
      key: "phase594-egosphere-current-state",
      predicate: "availability_boundary",
      objectText:
        "Both exact pages were accessible but out of stock on 2026-08-11; that state proves neither permanent discontinuation nor future availability.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.egosphere1056.key,
      locator: S.egosphere1056.summary,
      evidence: [
        {
          key: "phase594-egosphere-current-state-1056-evidence",
          sourceKey: S.egosphere1056.key,
          scopeKey: egosphere1056,
          locator: S.egosphere1056.summary,
        },
        {
          key: "phase594-egosphere-current-state-1058-evidence",
          sourceKey: S.egosphere1058.key,
          scopeKey: egosphere1058,
          locator: S.egosphere1058.summary,
        },
      ],
    },
    {
      key: "phase594-egosphere-design-history",
      predicate: "design_history",
      objectText:
        "Luigi Trenti dates the Egosphere morphing cap concept to 1999; a professional museum interview independently confirms his design attribution and its symbolic role for Pineider.",
      factClass: "core",
      confidence: 0.96,
      sourceKey: S.trenti.key,
      locator: S.trenti.summary,
      evidence: [
        {
          key: "phase594-egosphere-design-primary-evidence",
          sourceKey: S.trenti.key,
          scopeKey: egosphereDesign,
          locator: S.trenti.summary,
        },
        {
          key: "phase594-egosphere-design-secondary-evidence",
          sourceKey: S.mudeto.key,
          scopeKey: egosphereDesign,
          locator: S.mudeto.summary,
        },
      ],
    },
    {
      key: "phase594-egosphere-historic-sample-boundary",
      predicate: "historic_sample_boundary",
      objectText:
        "Historic catalog finishes and an auctioned 18K piston-era numbered sample do not supply the missing nib, filling, size or weight fields for current 1056/1058.",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.historicCatalog.key,
      locator: S.historicCatalog.summary,
      evidence: [
        {
          key: "phase594-egosphere-historic-catalog-evidence",
          sourceKey: S.historicCatalog.key,
          scopeKey: egosphereHistory,
          locator: S.historicCatalog.summary,
        },
        {
          key: "phase594-egosphere-auction-boundary-evidence",
          sourceKey: S.arcadia.key,
          scopeKey: egosphereAuction,
          locator: S.arcadia.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase594-egosphere-edition-1056",
      name: "Egosphere Black 1056",
      notes:
        "Current accessible Black/NERO exact page; out of stock on 2026-08-11.",
      sourceKey: S.egosphere1056.key,
      variantKind: "edition_group",
      productCode: "S000S008445056/1056",
      market: "US",
    },
    {
      key: "phase594-egosphere-edition-1058",
      name: "Egosphere Green 1058",
      notes:
        "Current accessible Green/VERDE exact page; US H1 typo Egopshere; out of stock on 2026-08-11.",
      sourceKey: S.egosphere1058.key,
      variantKind: "edition_group",
      productCode: "S000S088831060/1058",
      market: "US/Italy",
    },
  ],
  spec: {
    brandEntityId: PHASE594_PINEIDER_BRAND_ID,
    values: {
      series_name: "Egosphere",
      release_year:
        "1999 design concept; current 1056/1058 exact-code release years undisclosed",
      origin_country: "Italy",
      nib:
        "Current exact pages do not disclose nib material or widths; historic auction sample 18K M is noncanonical",
      fill_system:
        "Current exact pages do not disclose filling system; historic piston sample evidence is noncanonical",
      material:
        "1056: solid resin, solid 925 sterling-silver central band and rhodium-plated fittings; 1058: Elba-island jasper design context",
      dimensions: "Current exact pages do not disclose dimensions",
      weight: "Current exact pages do not disclose weight",
      status:
        "1056 and 1058 pages accessible but out of stock on 2026-08-11; production status unknown",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase594-egosphere-spec-brand",
        S.egosphere1056.key,
        egosphere1056,
        "Official exact page identifies Egosphere as a Pineider product.",
      ),
      specEvidence(
        "series_name",
        "phase594-egosphere-spec-series",
        S.egosphere1056.key,
        egosphere1056,
        "H1 Egosphere; 1058 body also uses Egosphere despite H1 typo.",
      ),
      specEvidence(
        "release_year",
        "phase594-egosphere-spec-design-year",
        S.trenti.key,
        egosphereDesign,
        "Designer portfolio dates the morphing Egosphere concept to 1999.",
        true,
        "Design-concept year only; not the release year of current codes.",
      ),
      specEvidence(
        "origin_country",
        "phase594-egosphere-spec-origin-1056",
        S.egosphere1056.key,
        egosphere1056,
        "DETAILS states Origin Italy.",
      ),
      specEvidence(
        "origin_country",
        "phase594-egosphere-spec-origin-1058",
        S.egosphere1058.key,
        egosphere1058,
        "DETAILS states Origin Italy.",
      ),
      specEvidence(
        "material",
        "phase594-egosphere-spec-material-1056",
        S.egosphere1056.key,
        egosphere1056,
        "Description states solid resin, 925 silver central band, rhodium plating, coining/enameling and green stone.",
      ),
      specEvidence(
        "material",
        "phase594-egosphere-spec-material-1058",
        S.egosphere1058It.key,
        egosphere1058,
        "Italian exact page identifies the green stone as jasper from Elba island.",
      ),
      ...(["nib", "fill_system", "dimensions", "weight"] as const).map(
        (field) =>
          specEvidence(
            field,
            `phase594-egosphere-spec-current-unknown-${field}`,
            S.egosphere1056.key,
            egosphere1056,
            `Current 1056 and 1058 exact pages do not disclose ${field.replace("_", " ")}.`,
            true,
            "Explicit current-source unknown; no historical sample value is promoted.",
          ),
      ),
      specEvidence(
        "status",
        "phase594-egosphere-spec-status",
        S.egosphere1056.key,
        egosphere1056,
        "Both exact pages were accessible and out of stock on 2026-08-11.",
      ),
      specEvidence(
        "nib",
        "phase594-egosphere-rejected-historic-nib",
        S.arcadia.key,
        egosphereAuction,
        "Auction sample states 18K medium nib.",
        false,
        "Historic Edizione d'Autore sample without current code; noncanonical for 1056/1058.",
      ),
      specEvidence(
        "fill_system",
        "phase594-egosphere-rejected-historic-fill",
        S.arcadia.key,
        egosphereAuction,
        "Historic-market samples are described with piston filling.",
        false,
        "Historic sample evidence does not fill the current exact-page unknown.",
      ),
      specEvidence(
        "dimensions",
        "phase594-egosphere-rejected-historic-dimensions",
        S.arcadia.key,
        egosphereAuction,
        "Historic sample measurements around 150 by 17 mm are not tied to current codes.",
        false,
        "Historic sample value retained only as a conflict boundary.",
      ),
      specEvidence(
        "status",
        "phase594-egosphere-rejected-historic-limited-count",
        S.arcadia.key,
        egosphereAuction,
        "Edizione d'Autore auction sample is numbered from 100.",
        false,
        "One historic edition count is not the status of current 1056/1058.",
      ),
    ],
  },
  conflicts: [
    {
      key: "phase594-egosphere-current-vs-historic-configuration",
      fieldKey: "nib",
      scopeKey: egosphere1056,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Current 1056/1058 nib and filling fields remain unknown. The 18K M, piston, dimensions and numbered count stay rejected historic-sample evidence.",
      members: [
        {
          citationKey: "phase594-egosphere-spec-current-unknown-nib",
          assertedValue: "Current exact pages do not disclose nib",
        },
        {
          citationKey: "phase594-egosphere-rejected-historic-nib",
          assertedValue: "Historic auction sample 18K M",
        },
      ],
    },
    {
      key: "phase594-egosphere-current-vs-historic-fill",
      fieldKey: "fill_system",
      scopeKey: egosphere1056,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Current filling system remains unknown; historic piston wording is not transferred.",
      members: [
        {
          citationKey: "phase594-egosphere-spec-current-unknown-fill_system",
          assertedValue: "Current exact pages do not disclose filling system",
        },
        {
          citationKey: "phase594-egosphere-rejected-historic-fill",
          assertedValue: "Historic sample piston filling",
        },
      ],
    },
  ],
  timeline: [
    {
      key: "phase594-egosphere-1999-design",
      title: "Luigi Trenti dates the Egosphere morphing concept",
      eventType: "design_milestone",
      startDate: "1999",
      circa: false,
      description:
        "The designer archive dates the angular-to-circular cap morphing concept to 1999; this is not a current-code release date.",
      sourceKey: S.trenti.key,
    },
  ],
  media: [
    {
      key: "phase594-pineider-egosphere-primary",
      title:
        "Pineider Egosphere 1056／1058 身份与历史样本边界事实图（非产品照片）",
      sourceKey: egosphereDiagram.key,
      localPath: egosphereDiagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、树脂与石材纹理、外形、比例、商标、笔夹、饰件或内部机构。",
      sourceUrl: egosphereDiagram.url,
      usageStatus: "primary",
    },
  ],
};

function mergeSources(
  base: readonly CuratedSource[],
  extras: readonly CuratedSource[],
): CuratedSource[] {
  const byKey = new Map(base.map((source) => [source.key, source]));
  for (const source of extras) {
    const previous = byKey.get(source.key);
    if (previous && JSON.stringify(previous) !== JSON.stringify(source)) {
      throw new Error(`Phase 594 conflicting source definition: ${source.key}.`);
    }
    byKey.set(source.key, source);
  }
  return [...byKey.values()];
}

const brandScope = phase593PineiderBrandPack.scopes[0]?.scopeKey;
if (!brandScope) {
  throw new Error("Phase 594 Pineider brand pack requires a canonical scope.");
}

export const phase594PineiderBrandPack: CuratedEntityPack = {
  ...phase593PineiderBrandPack,
  key: "phase594-pineider-brand-depth-refresh-v1",
  markdownFile: ".planning/content-research/pineider-brand-phase594.md",
  storyTitle: "Pineider：十四条公开型号入口与 Avatar UR／Egosphere 边界",
  publicationIntent: "publish",
  publicationBlockers: [],
  sources: mergeSources(phase593PineiderBrandPack.sources, [
    S.avatarExact,
    S.avatarCollection,
    S.wadAvatar,
    S.poorPenmanAvatar,
    S.penthusiastAvatar,
    S.egosphere1056,
    S.egosphere1058,
    S.egosphere1058It,
    S.trenti,
    S.mudeto,
    S.historicCatalog,
    S.arcadia,
  ]),
  claims: [
    ...phase593PineiderBrandPack.claims,
    {
      key: "phase594-pineider-brand-fourteen-model-navigation",
      predicate: "series_navigation",
      objectText:
        "Pineider now has fourteen public model nodes: the existing Avatar UR is refreshed in place as PP2101/600, while Egosphere 1056 and typo-title 1058 form one new canonical model rather than duplicates.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.avatarExact.key,
      locator: S.avatarExact.summary,
      evidence: [
        {
          key: "phase594-pineider-brand-avatar-evidence",
          sourceKey: S.avatarExact.key,
          scopeKey: brandScope,
          locator: S.avatarExact.summary,
        },
        {
          key: "phase594-pineider-brand-egosphere-1056-evidence",
          sourceKey: S.egosphere1056.key,
          scopeKey: brandScope,
          locator: S.egosphere1056.summary,
        },
        {
          key: "phase594-pineider-brand-egosphere-1058-evidence",
          sourceKey: S.egosphere1058.key,
          scopeKey: brandScope,
          locator: S.egosphere1058.summary,
        },
        {
          key: "phase594-pineider-brand-design-evidence",
          sourceKey: S.mudeto.key,
          scopeKey: brandScope,
          locator: S.mudeto.summary,
        },
      ],
    },
  ],
};

export const phase594PineiderPacks: CuratedEntityPack[] = [
  phase594PineiderBrandPack,
  phase594PineiderAvatarUrPack,
  phase594PineiderEgospherePack,
];

if (
  phase594PineiderPacks.length !== 3 ||
  new Set(phase594PineiderPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 594 must contain one brand and two unique model packs.");
}
