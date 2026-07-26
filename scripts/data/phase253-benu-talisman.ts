import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE252_BENU_BRAND_ID,
  PHASE252_EUPHORIA_ID,
  phase252BenuEuphoriaPacks,
} from "./phase252-benu-euphoria";

const RETRIEVED = "2026-07-26";
export const PHASE253_BENU_BRAND_ID = PHASE252_BENU_BRAND_ID;
export const PHASE253_TALISMAN_ID = "p253BenuTalisman";
export const PHASE253_TALISMAN_SLUG = "benu-talisman";
const SCOPE = "phase253-benu-talisman-scope";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
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
    registryKey: "fountain-pen-graph-editorial-phase253",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase253",
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

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, extra: Array<{ key: string; sourceKey: string; locator: string }> = []): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass: predicate === "maintenance_boundary" ? "editorial" : "core",
    confidence: 0.97,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey: SCOPE, locator }, ...extra.map((item) => ({ ...item, scopeKey: SCOPE }))],
  };
}

function specEvidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  edelweiss: web({
    key: "phase253-benu-talisman-edelweiss",
    title: "BENU official Edelweiss Talisman",
    url: "https://www.benupens.com/shop/product/edelweiss",
    registryKey: "benu-official-phase253",
    registryName: "BENU official store",
    sourceType: "official",
    tier: "primary",
    summary: "官方 Edelweiss 商品页把产品归入 Talisman，确认标准国际转换器、长蓝墨囊和可作 eyedropper 的说明，并声明花瓣材料不代表超自然功效。",
    locator: "Talisman collection, filling and disclaimer sections",
  }),
  moonstone: web({
    key: "phase253-benu-talisman-moonstone",
    title: "BENU official Moonstone Talisman",
    url: "https://www.benupens.com/shop/product/moonstone",
    registryKey: "benu-official-phase253",
    registryName: "BENU official store",
    sourceType: "official",
    tier: "primary",
    summary: "官方 Moonstone 商品页提供 Talisman 当前商品与真实月光石主题、供墨和颜色差异边界。",
    locator: "Moonstone product description and filling",
  }),
  northern: web({
    key: "phase253-benu-talisman-northern-gold",
    title: "BENU official Northern Gold Talisman",
    url: "https://www.benupens.com/shop/product/northern-gold",
    registryKey: "benu-official-phase253",
    registryName: "BENU official store",
    sourceType: "official",
    tier: "primary",
    summary: "官方 Northern Gold 商品页确认 Talisman、手绘版本、标准国际转换器／长墨囊和可作 eyedropper 的说明。",
    locator: "Northern Gold product description and handmade variation",
  }),
  terms: web({
    key: "phase253-benu-talisman-terms",
    title: "BENU official terms and conditions",
    url: "https://www.benupens.com/terms-and-conditions",
    registryKey: "benu-official-phase253",
    registryName: "BENU official store",
    sourceType: "official",
    tier: "primary",
    summary: "官方条款将商店运营者列为 BENU LLC（Yerevan），并提醒手工产品存在颜色差异、小瑕疵、停产和有限版状态变化。",
    locator: "BENU LLC Yerevan, product variation and warranty sections",
  }),
  parka: web({
    key: "phase253-benu-talisman-parka",
    title: "Parka Blogs: BENU Foxglove Talisman",
    url: "https://www.parkablogs.com/index.php/content/review-benu-foxglove-fountain-pen-talisman-series",
    registryKey: "parka-blogs-phase253-benu-talisman",
    registryName: "Parka Blogs",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2021 Foxglove 样本记录约 13.8 cm、21 g、旋盖、后插争议、树脂和 #6 Schmidt F/M/B 尖；体验只归因该样本。",
    locator: "2021 Foxglove review: dimensions, weight, posting and nib",
  }),
  chalet: web({
    key: "phase253-benu-talisman-chalet",
    title: "Pen Chalet: BENU Talisman reviews",
    url: "https://www.penchalet.com/product_reviews/Fountain%2BPens/Benu/Talisman/page/1",
    registryKey: "pen-chalet-phase253-benu-talisman",
    registryName: "Pen Chalet",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "零售商长期用户评测页补充 Talisman 的清洁便利、出墨和握持体验；只作用户体验旁证，不升级为固定规格。",
    locator: "Talisman review excerpts and user observations",
  }),
  svg: diagram(
    "phase253-benu-talisman-svg",
    "BENU Talisman structure factual diagram",
    "/images/library/site-original/phase253/benu/talisman.svg",
    "本站原创 factual SVG：表达多面树脂、#6 钢尖和国际规格供墨；非产品照片、非 Logo、非比例图、非颜色校样。",
  ),
} as const;

const inheritedBrand = phase252BenuEuphoriaPacks.find(
  (pack) => pack.entityId === PHASE253_BENU_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 253 BENU brand pack missing.");
const inheritedEuphoria = phase252BenuEuphoriaPacks.find(
  (pack) => pack.entityId === PHASE252_EUPHORIA_ID && pack.expectedType === "pen",
);
const inheritedEuphoriaGoulet = inheritedEuphoria?.sources.find(
  (source) => source.key === "phase252-benu-euphoria-goulet",
);
if (!inheritedEuphoriaGoulet) throw new Error("Phase 253 inherited Euphoria Goulet source missing.");

const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase253-benu-brand-v3";
brand.markdownFile = ".planning/content-research/benu-brand-phase253.md";
brand.sources = [...brand.sources, inheritedEuphoriaGoulet, S.edelweiss, S.moonstone, S.northern, S.terms, S.parka, S.chalet, S.svg];
brand.scopes = [
  ...brand.scopes.map((scope) => ({
    ...scope,
    editionScope: "品牌历史与 Briolette、Talisman、Euphoria 型号导航；具体树脂、尖号、尺寸和供墨下沉到型号页。",
  })),
  { key: SCOPE, scopeKey: SCOPE, productionState: "current", editionScope: "本条只扩展 BENU 品牌页对 Talisman 的型号导航，不把主题材料、手绘位置或联名商品参数回填到品牌页。" },
];
brand.claims = [
  ...brand.claims,
  claim(
    "phase253-talisman-navigation",
    "brand_model_navigation",
    "BENU 品牌页新增 Talisman 通用型号入口；Edelweiss、Moonstone、Northern Gold、Foxglove 等是系列 variant，Talisman True Unicorn 仍是独立 Gourmet Pens 联名页。",
    S.edelweiss.key,
    S.edelweiss.summary,
    [
      { key: "phase253-talisman-navigation-moonstone", sourceKey: S.moonstone.key, locator: S.moonstone.summary },
      { key: "phase253-talisman-navigation-parka", sourceKey: S.parka.key, locator: S.parka.summary },
    ],
  ),
];
brand.media = [{
  key: "phase253-benu-brand-media",
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
    key: "phase253-talisman-series",
    title: "Talisman 作为 BENU 独立 collection 进入公开目录",
    eventType: "model_released",
    startDate: "2021",
    circa: true,
    description: "2021 Foxglove 评测已记录 Talisman 系列，官方当前商品页持续列出多种主题与颜色；精确首发日未在当前资料中固定。",
    sourceKey: S.parka.key,
  },
];

const pen: CuratedEntityPack = {
  key: "phase253-benu-talisman-v1",
  entityId: PHASE253_TALISMAN_ID,
  expectedType: "pen",
  expectedSlug: PHASE253_TALISMAN_SLUG,
  canonicalName: "BENU Talisman",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/benu-talisman-phase253.md",
  storyTitle: "BENU Talisman：多面树脂、主题材料与 #6 尖",
  primarySourceKey: S.edelweiss.key,
  depthTier: "A",
  aliases: [
    { alias: "BENU Talisman", language: "en", sourceKey: S.edelweiss.key },
    { alias: "Benu Talisman fountain pen", language: "en", sourceKey: S.parka.key },
    { alias: "BENU Talisman 钢笔", language: "zh", sourceKey: S.edelweiss.key },
  ],
  sources: [S.edelweiss, S.moonstone, S.northern, S.terms, S.parka, S.chalet, S.svg],
  scopes: [{
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    market: "BENU 官方商品页与公开专业评测；主题色和库存随商品页变化",
    nibScope: "常规 #6 Schmidt 不锈钢尖 F/M/B；其他尖单元按具体 SKU 核对",
    materialScope: "多面树脂；植物、矿物、手绘和闪粉主题只绑定对应 variant",
    editionScope: "Talisman 通用型号与色款；True Unicorn 联名保留独立 entity，不覆盖其他 BENU collection",
  }],
  claims: [
    claim("phase253-talisman-identity", "model_identity", "BENU Talisman 是独立的多面树脂钢笔系列，主题来自神话、植物和材料故事；Edelweiss、Moonstone、Northern Gold、Foxglove 等不是互相独立的品牌或供墨型号。", S.edelweiss.key, S.edelweiss.summary, [{ key: "phase253-talisman-identity-parka", sourceKey: S.parka.key, locator: S.parka.summary }]),
    claim("phase253-talisman-filling", "filling_system", "Talisman 商品页确认标准国际转换器和长蓝墨囊；部分具体页面允许在确认密封后作 eyedropper，改装责任不能跨 SKU 推广。", S.edelweiss.key, S.edelweiss.summary, [{ key: "phase253-talisman-filling-northern", sourceKey: S.northern.key, locator: S.northern.summary }]),
    claim("phase253-talisman-nib", "nib_boundary", "Foxglove 样本使用 #6 Schmidt 不锈钢尖，常见 F/M/B；其他独家色的尖宽或尖座若不同，应作为 SKU variant，不凭外形推断互换。", S.parka.key, S.parka.summary, [{ key: "phase253-talisman-nib-chalet", sourceKey: S.chalet.key, locator: S.chalet.summary }]),
    claim("phase253-talisman-size", "specification_boundary", "Foxglove 公开样本约闭帽 138 mm、约 21 g；其他 Talisman 的主题材料、饰件和转换器会影响尺寸与重量，不能把该样本当作全系列工程值。", S.parka.key, S.parka.summary, [{ key: "phase253-talisman-size-terms", sourceKey: S.terms.key, locator: S.terms.summary }]),
    claim("phase253-talisman-versions", "version_boundary", "Edelweiss、Moonstone、Northern Gold、Foxglove、Mandrake 等是不同树脂、主题材料、手绘或独家配置；Talisman True Unicorn 已有独立联名页，不在本页合并。", S.moonstone.key, S.moonstone.summary, [{ key: "phase253-talisman-versions-northern", sourceKey: S.northern.key, locator: S.northern.summary }, { key: "phase253-talisman-versions-existing", sourceKey: S.edelweiss.key, locator: S.edelweiss.summary }]),
    claim("phase253-talisman-posting", "handling_boundary", "Talisman 具体商品可能标注可后插，但 Foxglove 样本实际后插不可靠；后插平衡应按具体笔检查，不能写成全系列硬规则。", S.parka.key, S.parka.summary, [{ key: "phase253-talisman-posting-chalet", sourceKey: S.chalet.key, locator: S.chalet.summary }]),
    claim("phase253-talisman-care", "maintenance_boundary", "换墨以室温清水为主；树脂、手绘表面、螺纹和尖座出现阻力时不要用酒精、热水、研磨剂或尖锐工具强拆，eyedropper 改装前须核对具体 SKU。", S.edelweiss.key, S.edelweiss.summary, [{ key: "phase253-talisman-care-terms", sourceKey: S.terms.key, locator: S.terms.summary }]),
  ],
  variants: [
    { key: "phase253-talisman-edelweiss", name: "Edelweiss", releaseYear: "现行官方商品记录", notes: "主题材料与花瓣叙事只属于该商品；官方明确不宣称超自然功效。", sourceKey: S.edelweiss.key, variantKind: "color" },
    { key: "phase253-talisman-moonstone", name: "Moonstone", releaseYear: "现行官方商品记录", notes: "官方商品描述使用真实月光石主题；颜色和颗粒分布不作为全系列固定值。", sourceKey: S.moonstone.key, variantKind: "color" },
    { key: "phase253-talisman-northern", name: "Northern Gold", releaseYear: "现行官方商品记录", notes: "官方独家商品；手绘元素位置每支有差异，不能用一张图片作色票。", sourceKey: S.northern.key, variantKind: "edition_group" },
    { key: "phase253-talisman-foxglove", name: "Foxglove", releaseYear: "2021 评测样本", notes: "Parka 样本约 138 mm、21 g、#6 Schmidt；尺寸与后插观察只绑定样本。", sourceKey: S.parka.key, variantKind: "color" },
  ],
  spec: {
    brandEntityId: PHASE253_BENU_BRAND_ID,
    values: {
      series_name: "BENU Talisman",
      release_year: "约 2021 前后；已有公开系列评测，精确首发日未确认",
      origin_country: "BENU LLC／亚美尼亚 Yerevan 运营语境；本页不推断具体工厂",
      nib: "常规 #6 Schmidt 不锈钢尖 F/M/B；具体独家 SKU 按页面核对",
      fill_system: "标准国际短／长墨囊、转换器；部分商品页允许确认后作 eyedropper",
      material: "多面树脂；植物、矿物、手绘、闪粉和颜色按具体主题 variant",
      dimensions: "Foxglove 样本闭帽约 138 mm；其他色款按商品页核对",
      weight: "Foxglove 样本约 21 g；主题材料、饰件和转换器会影响实测",
    },
    evidence: [
      specEvidence("phase253-talisman-brand", "brand_entity_id", S.edelweiss.key, "BENU product maker context"),
      specEvidence("phase253-talisman-series", "series_name", S.edelweiss.key, "Talisman collection label"),
      specEvidence("phase253-talisman-release", "release_year", S.parka.key, "2021 Talisman series review"),
      specEvidence("phase253-talisman-origin", "origin_country", S.terms.key, "BENU LLC Yerevan operation; no factory inference"),
      specEvidence("phase253-talisman-nib-spec", "nib", S.parka.key, "Foxglove #6 Schmidt F/M/B sample"),
      specEvidence("phase253-talisman-fill-spec", "fill_system", S.edelweiss.key, "international converter, long cartridge and eyedropper description"),
      specEvidence("phase253-talisman-material", "material", S.moonstone.key, "themed resin/material product description"),
      specEvidence("phase253-talisman-dimensions", "dimensions", S.parka.key, "Foxglove sample dimensions"),
      specEvidence("phase253-talisman-weight", "weight", S.parka.key, "Foxglove sample weight"),
    ],
  },
  media: [{
    key: "phase253-talisman-media",
    title: "BENU Talisman 多面树脂与供墨事实图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、包装或零件兼容性。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [{
    key: "phase253-talisman-release-event",
    title: "Talisman 进入公开系列资料",
    eventType: "model_released",
    startDate: "2021",
    circa: true,
    description: "2021 Foxglove 独立评测已记录 Talisman 系列，官方当前商品页持续列出不同主题与树脂；首发日未在当前资料中固定。",
    sourceKey: S.parka.key,
  }],
};

export const phase253BenuTalismanPacks: CuratedEntityPack[] = [brand, pen];
