import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE59_BENU_BRAND_ID,
  phase59BenuNahvalurPacks,
} from "./phase59-benu-nahvalur";

const RETRIEVED = "2026-07-26";
export const PHASE252_BENU_BRAND_ID = PHASE59_BENU_BRAND_ID;
export const PHASE252_EUPHORIA_ID = "p252BenuEuphoria";
export const PHASE252_EUPHORIA_SLUG = "benu-euphoria";
const SCOPE = "phase252-benu-euphoria-scope";

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
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase252",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase252",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  extra: Array<{ key: string; sourceKey: string; locator: string }> = [],
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass: predicate === "maintenance_boundary" ? "editorial" : "core",
    confidence: 0.97,
    sourceKey,
    locator,
    evidence: [
      { key: `${key}-e`, sourceKey, scopeKey: SCOPE, locator },
      ...extra.map((item) => ({ ...item, scopeKey: SCOPE })),
    ],
  };
}

function specEvidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  product: web({
    key: "phase252-benu-euphoria-product",
    title: "BENU official Milk & Honey Euphoria product",
    url: "https://www.benupens.com/shop/product/milk-honey",
    registryKey: "benu-official-phase252",
    registryName: "BENU official store",
    sourceType: "official",
    tier: "primary",
    summary: "BENU 官方 Milk & Honey 商品页把它归入 Euphoria，确认标准国际转换器、长蓝墨囊和可作 eyedropper 的商品说明；颜色纹理不作为固定色票。",
    locator: "Euphoria collection, filling description and color disclaimer",
  }),
  catalog: web({
    key: "phase252-benu-euphoria-catalog",
    title: "BENU official fountain pen catalogue",
    url: "https://www.benupens.com/shop/category/fountain-pens",
    registryKey: "benu-official-phase252",
    registryName: "BENU official store",
    sourceType: "official",
    tier: "primary",
    summary: "官方钢笔目录提供 Euphoria collection 导航，证明它不是 Briolette 或 Talisman 的颜色别名。",
    locator: "fountain pen collection navigation",
  }),
  terms: web({
    key: "phase252-benu-euphoria-terms",
    title: "BENU official terms and conditions",
    url: "https://www.benupens.com/terms-and-conditions",
    registryKey: "benu-official-phase252",
    registryName: "BENU official store",
    sourceType: "official",
    tier: "primary",
    summary: "官方条款将商店运营者列为 BENU LLC（Yerevan），并提醒手工产品存在颜色差异、小瑕疵、停产和有限版状态变化。",
    locator: "BENU LLC Yerevan, product variation and warranty sections",
  }),
  parka: web({
    key: "phase252-benu-euphoria-parka",
    title: "Parka Blogs: BENU Ocean Breeze Euphoria",
    url: "https://www.parkablogs.com/content/review-benu-ocean-breeze-pen-euphoria-series",
    registryKey: "parka-blogs-phase252-benu-euphoria",
    registryName: "Parka Blogs",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2021 独立评测记录 Ocean Breeze 样本约 26 g、十面树脂、可后插、#6 Schmidt 尖和转换器另购；体验只归因该样本。",
    locator: "2021 Ocean Breeze review: facets, weight, posting, nib and converter",
  }),
  goulet: web({
    key: "phase252-benu-euphoria-goulet",
    title: "Goulet Pens: BENU Euphoria Earl Grey",
    url: "https://www.gouletpens.com/products/benu-euphoria-fountain-pen-earl-grey-special-edition",
    registryKey: "goulet-phase252-benu-euphoria",
    registryName: "The Goulet Pen Company",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "Goulet 商品档案给出 Earl Grey 的树脂、尺寸、26 g、F/M/B Schmidt 与 1.1 stub/Flex JoWo 尖座不可互换边界。",
    locator: "technical specs and nib-unit compatibility for Earl Grey",
  }),
  smruti: web({
    key: "phase252-benu-euphoria-smruti",
    title: "Smruti Pens: BENU Euphoria review",
    url: "https://smrutipens.com/63f520bb5943f",
    registryKey: "smruti-phase252-benu-euphoria",
    registryName: "Smruti Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2023 Tropical Voyage 样本补充十面树脂、标准国际供墨、#6 Schmidt 钢尖和可后插观察；线宽与顺滑度不外推。",
    locator: "Tropical Voyage sample construction and writing experience",
  }),
  svg: diagram(
    "phase252-benu-euphoria-svg",
    "BENU Euphoria structure factual diagram",
    "/images/library/site-original/phase252/benu/euphoria.svg",
    "本站原创 factual SVG：表达多面树脂、#6 钢尖和国际规格供墨；非产品照片、非 Logo、非比例图、非颜色校样。",
  ),
} as const;

const inheritedBrand = phase59BenuNahvalurPacks.find(
  (pack) => pack.entityId === PHASE252_BENU_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 252 BENU brand pack missing.");

const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase252-benu-brand-v2";
brand.markdownFile = ".planning/content-research/benu-brand-phase252.md";
brand.sources = [...brand.sources, S.product, S.catalog, S.terms, S.parka, S.smruti, S.svg];
brand.scopes = [
  ...brand.scopes.map((scope) => ({
    ...scope,
    editionScope: "品牌历史与 Briolette、Talisman、Euphoria 型号导航；具体树脂、尖号、尺寸和供墨下沉到型号页。",
  })),
  {
    key: SCOPE,
    scopeKey: SCOPE,
    productionState: "current",
    editionScope: "本条只扩展 BENU 品牌页对 Euphoria 的型号导航，不把某个颜色或联名商品的参数回填到品牌页。",
  },
];
brand.claims = [
  ...brand.claims,
  claim(
    "phase252-euphoria-navigation",
    "brand_model_navigation",
    "BENU 品牌页新增 Euphoria 型号入口；它与 Briolette、Talisman True Unicorn 分属不同笔体，颜色、闪粉和联名仍记录为 variant。",
    S.catalog.key,
    S.catalog.summary,
    [
      { key: "phase252-euphoria-navigation-product", sourceKey: S.product.key, locator: S.product.summary },
      { key: "phase252-euphoria-navigation-goulet", sourceKey: S.goulet.key, locator: S.goulet.summary },
    ],
  ),
];
brand.media = [{
  key: "phase252-benu-brand-media",
  title: "BENU collection navigation factual diagram（非产品照片）",
  sourceKey: S.svg.key,
  localPath: S.svg.url,
  author: "Fountain Pen Graph editorial",
  license: "site-original",
  attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、包装或零件兼容性。",
  sourceUrl: S.svg.url,
  usageStatus: "primary",
}];
brand.timeline = [
  ...(brand.timeline ?? []),
  {
    key: "phase252-euphoria-series",
    title: "Euphoria 作为 BENU 独立 collection 进入公开目录",
    eventType: "model_released",
    startDate: "2020",
    circa: true,
    description: "2021 独立评测已将 Euphoria 描述为新系列，官方当前目录仍将其作为独立 collection；精确首发日未在当前资料中固定。",
    sourceKey: S.parka.key,
  },
];

const pen: CuratedEntityPack = {
  key: "phase252-benu-euphoria-v1",
  entityId: PHASE252_EUPHORIA_ID,
  expectedType: "pen",
  expectedSlug: PHASE252_EUPHORIA_SLUG,
  canonicalName: "BENU Euphoria",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/benu-euphoria-phase252.md",
  storyTitle: "BENU Euphoria：多面树脂、大号 #6 尖与国际规格供墨",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "BENU Euphoria", language: "en", sourceKey: S.catalog.key },
    { alias: "Benu Euphoria fountain pen", language: "en", sourceKey: S.parka.key },
    { alias: "BENU Euphoria 钢笔", language: "zh", sourceKey: S.product.key },
  ],
  sources: [S.product, S.catalog, S.terms, S.parka, S.goulet, S.smruti, S.svg],
  scopes: [{
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    market: "BENU 官方店铺与公开专业零售／评测资料；颜色和库存随商品页变化",
    nibScope: "常规 #6 Schmidt 不锈钢尖 F/M/B；部分 SKU 的 1.1 stub/Flex 使用 JoWo 尖座，按商品区分",
    materialScope: "多面树脂／亚克力类树脂；具体透明度、闪粉、发光和手工纹理按 variant",
    editionScope: "Euphoria 主型号及其色款／联名；不覆盖 Briolette、Talisman 或其他 BENU collection",
  }],
  claims: [
    claim("phase252-euphoria-identity", "model_identity", "BENU Euphoria 是独立的大尺寸多面树脂钢笔系列，与 Briolette、Talisman、Minima 等 collection 分开；颜色名称不生成新型号。", S.catalog.key, S.catalog.summary, [{ key: "phase252-euphoria-identity-product", sourceKey: S.product.key, locator: S.product.summary }]),
    claim("phase252-euphoria-filling", "filling_system", "Euphoria 使用标准国际规格墨囊／转换器；官方 Milk & Honey 商品页允许在确认螺纹与密封后作 eyedropper，但改装责任属于使用者。", S.product.key, S.product.summary, [{ key: "phase252-euphoria-filling-goulet", sourceKey: S.goulet.key, locator: S.goulet.summary }]),
    claim("phase252-euphoria-nib", "nib_boundary", "常规 Euphoria 使用 #6 Schmidt 不锈钢尖，F/M/B 是稳定选项；部分零售 SKU 的 1.1 mm stub/Flex 是 #6 JoWo 尖座，不能与 Schmidt 单元直接互换。", S.goulet.key, S.goulet.summary, [{ key: "phase252-euphoria-nib-parka", sourceKey: S.parka.key, locator: S.parka.summary }]),
    claim("phase252-euphoria-size", "specification_boundary", "Earl Grey 公开 SKU 约闭帽 150 mm、加帽 180.8 mm、笔身 138 mm、最大径 15.3 mm、握位 9.8 mm、约 26 g；其他树脂和测量口径可能不同。", S.goulet.key, S.goulet.summary, [{ key: "phase252-euphoria-size-parka", sourceKey: S.parka.key, locator: S.parka.summary }]),
    claim("phase252-euphoria-versions", "version_boundary", "Milk & Honey、Ocean Breeze、Tropical Voyage、Earl Grey 等是颜色、树脂配方或联名版；闪粉、荧光效果和纹理不能跨版本互借，Earl Grey 的茶叶主题只属于该 SKU。", S.product.key, S.product.summary, [{ key: "phase252-euphoria-versions-goulet", sourceKey: S.goulet.key, locator: S.goulet.summary }, { key: "phase252-euphoria-versions-terms", sourceKey: S.terms.key, locator: S.terms.summary }]),
    claim("phase252-euphoria-posting", "handling_boundary", "Euphoria 盖子可以后插，但大尺寸笔体后插会增加尾部长度和后重；Parka 与 Smruti 的感受只归因各自样本，选购时应先试未后插姿势。", S.parka.key, S.parka.summary, [{ key: "phase252-euphoria-posting-smruti", sourceKey: S.smruti.key, locator: S.smruti.summary }]),
    claim("phase252-euphoria-care", "maintenance_boundary", "换墨以室温清水为主；树脂、螺纹、转换器和尖座出现阻力或渗漏时不要用热水、酒精、尖锐工具或强力拆解，eyedropper 改装前须先确认具体 SKU 密封边界。", S.product.key, S.product.summary, [{ key: "phase252-euphoria-care-terms", sourceKey: S.terms.key, locator: S.terms.summary }]),
  ],
  variants: [
    { key: "phase252-euphoria-milk-honey", name: "Milk & Honey", releaseYear: "现行官方商品记录", notes: "官方 Euphoria 商品示例；奶白与半透明琥珀色纹理会因光线和手工树脂而不同。", sourceKey: S.product.key, variantKind: "color" },
    { key: "phase252-euphoria-ocean-breeze", name: "Ocean Breeze", releaseYear: "2021 评测样本", notes: "Parka 评测的青蓝到紫色渐变、闪粉和发光配方样本；样本纹理不能代表全部批次。", sourceKey: S.parka.key, variantKind: "color" },
    { key: "phase252-euphoria-tropical-voyage", name: "Tropical Voyage", releaseYear: "2023 评测样本", notes: "Smruti 评测的紫、青、绿闪粉树脂样本；评测中的 B 尖体验不推广到所有尖号。", sourceKey: S.smruti.key, variantKind: "color" },
    { key: "phase252-euphoria-earl-grey", name: "Earl Grey（Goulet Refreshment 独家）", releaseYear: "现行／历史独家商品记录", notes: "茶叶主题树脂和 Goulet 独家身份；商品页的 F/M/B Schmidt 与 1.1 stub/Flex JoWo 属于不同尖座配置。", sourceKey: S.goulet.key, variantKind: "edition_group", productCode: "BN-05-2-58-5-0-M" },
  ],
  spec: {
    brandEntityId: PHASE252_BENU_BRAND_ID,
    values: {
      series_name: "BENU Euphoria",
      release_year: "约 2020 前后；2021 已有独立系列评测，精确首发日未确认",
      origin_country: "BENU LLC／亚美尼亚 Yerevan 运营语境；本页不推断具体工厂",
      nib: "常规 #6 Schmidt 不锈钢尖 F/M/B；部分 SKU 有 #6 JoWo 1.1 mm stub/Flex",
      fill_system: "标准国际短／长墨囊、转换器；具体商品页允许确认后作 eyedropper",
      material: "多面树脂／亚克力类树脂；透明度、闪粉、发光和纹理按具体配方",
      dimensions: "Earl Grey SKU：闭帽约 150 mm、加帽约 180.8 mm、笔身约 138 mm、最大径约 15.3 mm、握位约 9.8 mm",
      weight: "Earl Grey 与独立样本约 26 g；转换器、饰件和树脂配方会影响实测",
    },
    evidence: [
      specEvidence("phase252-euphoria-brand", "brand_entity_id", S.catalog.key, "BENU collection maker context"),
      specEvidence("phase252-euphoria-series", "series_name", S.catalog.key, "Euphoria collection navigation"),
      specEvidence("phase252-euphoria-release", "release_year", S.parka.key, "2021 review calls Euphoria a new series"),
      specEvidence("phase252-euphoria-origin", "origin_country", S.terms.key, "BENU LLC Yerevan operation; no factory inference"),
      specEvidence("phase252-euphoria-nib-spec", "nib", S.goulet.key, "Schmidt and JoWo nib-unit specification"),
      specEvidence("phase252-euphoria-fill-spec", "fill_system", S.product.key, "international converter, long cartridge and eyedropper description"),
      specEvidence("phase252-euphoria-material", "material", S.goulet.key, "resin body and grip material"),
      specEvidence("phase252-euphoria-dimensions", "dimensions", S.goulet.key, "Earl Grey technical measurements"),
      specEvidence("phase252-euphoria-weight", "weight", S.goulet.key, "Earl Grey 26 g technical measurement"),
    ],
  },
  media: [{
    key: "phase252-euphoria-media",
    title: "BENU Euphoria 多面树脂与供墨事实图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、包装或零件兼容性。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [{
    key: "phase252-euphoria-release-event",
    title: "Euphoria 进入公开系列资料",
    eventType: "model_released",
    startDate: "2020",
    circa: true,
    description: "2021 独立评测已记录 Euphoria 系列，官方当前商品页持续列出不同树脂配方；首发日未在当前资料中固定。",
    sourceKey: S.parka.key,
  }],
};

export const phase252BenuEuphoriaPacks: CuratedEntityPack[] = [brand, pen];
