import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE291_ESTERBROOK_BRAND_ID = "b6DYMF38zz1B";
export const PHASE291_MODEL_J_ID = "phase291-esterbrook-model-j";
export const PHASE291_MODEL_J_SLUG = "esterbrook-model-j";

const RETRIEVED = "2026-07-28";
const SCOPE = "phase291-esterbrook-model-j";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
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

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase291/esterbrook/model-j.svg";
  return {
    key: "phase291-model-j-diagram",
    registryKey: "fountain-pen-graph-editorial-phase291",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase291",
    title: "Esterbrook Model J factual structure diagram",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；表达现代 ebonite、螺纹帽、JoWo #6 和国际 C/C 边界，不是产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false`,
  };
}

const officialGuide = web({
  key: "phase291-model-j-official-guide",
  title: "A Guide to Esterbrook Pen Models: Estie, Model J, and JR Pocket Pen",
  url: "https://www.esterbrookpens.com/blogs/news/a-guide-to-esterbrook-pen-models-estie-model-j-and-jr-pocket-pen-1",
  registryKey: "esterbrook-official-model-guide-phase291",
  registryName: "Esterbrook Pens",
  summary: "官方型号指南把 Estie、Model J、JR 分开，并说明现代 Model J 是对历史 J 轮廓的重新诠释，使用现代上墨与德国制笔尖。",
  locator: "Model J: The Return of a Legend",
});

const officialCollection = web({
  key: "phase291-model-j-official-collection",
  title: "The Old-Fashioned Collection: Ebonite Model J and JR",
  url: "https://www.esterbrookpens.com/products/the-old-fashioned-collection-ebonite-model-j-and-jr",
  registryKey: "esterbrook-official-old-fashioned-phase291",
  registryName: "Esterbrook Pens",
  summary: "官方产品页确认 ebonite Model J 与 JR 的尺寸/笔尖边界、标准国际墨囊或 converter，以及 ebonite 的保养禁忌。",
  locator: "Quick Features; What Refills; The Classic Design of Model J; JR: The Portable Hero",
});

const officialNibs = web({
  key: "phase291-model-j-official-nibs",
  title: "Learn About Our Nibs",
  url: "https://www.esterbrookpens.com/pages/learn-about-our-nibs",
  registryKey: "esterbrook-official-nibs-phase291",
  registryName: "Esterbrook Pens",
  summary: "官方尖指南说明 Esterbrook 使用 JoWo #6，Model J 与 Estie 在现代尖生态中共享兼容范围，并列出 EF 至 Stub/Flex 的选择。",
  locator: "Fast Facts; Industry Standard; Standard Nib Sizes",
});

const sbrebrown = web({
  key: "phase291-model-j-sbrebrown",
  title: "Esterbrook Model J Fountain Pen Review",
  url: "https://www.sbrebrown.com/2024/01/esterbrook-model-j-fountain-pen-review/",
  registryKey: "sbrebrown-model-j-phase291",
  registryName: "SBREBrown",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立评测给出一支现代 Model J 的合帽、未上帽、后插尺寸与重量；这些数字绑定评测样本，不外推成所有 SKU 的固定公差。",
  locator: "Measurements section",
});

const goulet = web({
  key: "phase291-model-j-goulet",
  title: "Esterbrook Model J Fountain Pen - Lotus Green",
  url: "https://www.gouletpens.com/products/esterbrook-model-j-fountain-pen-lotus-green",
  registryKey: "goulet-model-j-phase291",
  registryName: "The Goulet Pen Company",
  sourceType: "retailer",
  tier: "professional_secondary",
  summary: "专业零售页提供 Lotus Green SKU 的材质、JoWo #6、国际 C/C、螺纹帽、尺寸、重量、容量和自然纹理差异。",
  locator: "Details; Technical Specs; product photography note",
});

const svg = diagram();

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
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
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }],
  } satisfies CuratedEntityPack["claims"][number];
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
) {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

export const phase291EsterbrookModelJPacks: CuratedEntityPack[] = [
  {
    key: "phase291-esterbrook-model-j-v1",
    entityId: PHASE291_MODEL_J_ID,
    expectedType: "pen",
    expectedSlug: PHASE291_MODEL_J_SLUG,
    canonicalName: "Esterbrook Model J",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/esterbrook-model-j-phase291.md",
    storyTitle: "Esterbrook Model J：把历史轮廓改成现代 C/C 钢笔",
    primarySourceKey: officialGuide.key,
    depthTier: "A",
    aliases: [
      { alias: "Esterbrook Model J", language: "en", sourceKey: officialGuide.key },
      { alias: "Modern Esterbrook Model J", language: "en", sourceKey: officialGuide.key },
      { alias: "Esterbrook Ebonite Model J", language: "en", sourceKey: officialCollection.key },
      { alias: "Esterbrook Model J 现代款", language: "zh", sourceKey: officialGuide.key },
    ],
    sources: [officialGuide, officialCollection, officialNibs, sbrebrown, goulet, svg],
    scopes: [
      {
        key: SCOPE,
        scopeKey: SCOPE,
        productionState: "current",
        market: "现代复兴 Esterbrook Model J 及其 ebonite/颜色 SKU",
        nibScope: "JoWo #6 steel nib；尖宽和 custom grind 随 SKU/订单变化",
        materialScope: "SEM ebonite 与金色饰件为代表路线；颜色、装饰和限量版按 SKU",
        editionScope: "不包含历史 Double Jewel J、JR pocket pen、Estie 或 ballpoint/rollerball",
      },
    ],
    claims: [
      claim("phase291-model-j-identity", "model_identity", "现代 Esterbrook Model J 是对历史 J 轮廓的重新诠释，使用现代材料、螺纹帽和 cartridge/converter；不是历史杠杆 J 的同一生产世代。", officialGuide.key, "Model J: The Return of a Legend"),
      claim("phase291-model-j-boundary", "identity_boundary", "Model J、JR 和 Estie 是现代品牌的不同产品线；Model J 为全尺寸 #6，JR 为更短的 #5 pocket pen，Estie 则是独立的现代亚克力家族。", officialCollection.key, "Model J and JR comparison; official model guide"),
      claim("phase291-model-j-material", "material", "代表配置使用 SEM ebonite；官方说明 ebonite 是硫化天然橡胶形成的硬质材料，需避开长时间阳光、热源与酒精类清洁剂。", officialCollection.key, "What Is Ebonite; How Do I Care for My Ebonite Pen"),
      claim("phase291-model-j-nib", "nib", "现代 Model J 使用 JoWo #6 钢尖，标准 EF 至 Stub 1.1 及部分 Flex/custom grinds；具体尖宽和研磨随库存与订单。", officialNibs.key, "Fast Facts; Industry Standard; Standard Nib Sizes"),
      claim("phase291-model-j-fill", "filling_system", "供墨为标准国际规格 cartridge/converter；官方产品页同时说明墨囊或 converter，不把历史橡胶墨囊、活塞或 eyedropper 归给本型号。", officialCollection.key, "What Refills does my pen take"),
      claim("phase291-model-j-size", "dimensions", "SBREBrown 样本约 137.1 mm 合帽、123.9 mm 未上帽、166.3 mm 后插；Goulet Lotus Green SKU 给出约 13.9 mm 笔身直径和 137.1/166.4 mm 长度。", sbrebrown.key, "Measurements; retailer technical specs"),
      claim("phase291-model-j-weight", "weight", "评测与零售样本总重约 25–26 g，笔身约 16–16.5 g、笔帽约 9–9.5 g；材质和 converter 配置会造成差异。", goulet.key, "Technical Specs; sample measurements"),
      claim("phase291-model-j-care", "maintenance_guidance", "换墨用常温清水冲洗并充分干燥；避免酒精、热水、研磨剂和暴晒，螺纹帽或尖座异常时不要强拆。", officialCollection.key, "Ebonite care; cartridge/converter cleaning", "editorial"),
      claim("phase291-model-j-buying", "selection_guidance", "选购时核对 ebonite 颜色、尖宽/定制研磨、converter、纹理随机性与退换政策；喜欢便携 #5 尖应比较 JR，喜欢亚克力家族与限定色应比较 Estie。", goulet.key, "SKU options and natural pattern variation", "editorial"),
    ],
    variants: [
      { key: "phase291-model-j-ebonite", name: "Ebonite standard body", notes: "现代 Model J 的代表材料路线；色纹和深浅绑定具体 SKU。", sourceKey: officialCollection.key, variantKind: "material" },
      { key: "phase291-model-j-custom-nibs", name: "JoWo #6 standard/custom nibs", notes: "EF/F/M/B/Stub 与 Journaler、Scribe、Needle Point 等选项随订单和库存。", sourceKey: officialNibs.key, variantKind: "nib" },
      { key: "phase291-model-j-lotus-green", name: "Lotus Green", notes: "Goulet 的具体 ebonite SKU；商品照片不能保证每支纹理完全相同。", sourceKey: goulet.key, variantKind: "color", market: "retailer SKU" },
    ],
    spec: {
      brandEntityId: PHASE291_ESTERBROOK_BRAND_ID,
      values: {
        series_name: "Esterbrook Model J",
        release_year: "现代复兴后的在售型号；官方指南未给精确首发日",
        origin_country: "美国品牌语境；Model J ebonite 材料和 JoWo 尖的具体供应地按 SKU/包装确认",
        nib: "JoWo #6 gold-plated steel；EF/F/M/B/Stub 1.1 与 custom grind 按 SKU",
        fill_system: "标准国际 cartridge/converter",
        material: "SEM ebonite 为代表路线，颜色和饰件随 SKU",
        dimensions: "样本约 137.1 mm 合帽、123.9 mm 未上帽、166.3–166.4 mm 后插；笔身直径约 13.9 mm",
        weight: "样本约 25–26 g；笔身约 16–16.5 g，笔帽约 9–9.5 g",
        status: "现代复兴产品线；颜色、限量和尖宽库存随销售渠道变化",
      },
      evidence: [
        evidence("phase291-brand", "brand_entity_id", officialGuide.key, "official Esterbrook model guide"),
        evidence("phase291-series", "series_name", officialGuide.key, "Model J: The Return of a Legend"),
        evidence("phase291-release", "release_year", officialGuide.key, "modern reimagining; no exact launch date asserted"),
        evidence("phase291-origin", "origin_country", officialCollection.key, "modern Esterbrook product and material boundary; no factory inference"),
        evidence("phase291-nib", "nib", officialNibs.key, "JoWo #6 and nib range"),
        evidence("phase291-fill", "fill_system", officialCollection.key, "standard international cartridge or converter"),
        evidence("phase291-material", "material", officialCollection.key, "ebonite and care section"),
        evidence("phase291-dimensions", "dimensions", goulet.key, "technical specs; sample measurements"),
        evidence("phase291-weight", "weight", goulet.key, "technical specs; sample weight"),
        evidence("phase291-status", "status", officialGuide.key, "current three-model guide and special edition boundary"),
      ],
    },
    media: [
      {
        key: "phase291-model-j-primary-media",
        title: "Esterbrook Model J 结构事实图（非产品照片）",
        sourceKey: svg.key,
        localPath: svg.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、刻字、库存或具体限量版。",
        sourceUrl: svg.url,
        usageStatus: "primary",
      },
    ],
  },
];
