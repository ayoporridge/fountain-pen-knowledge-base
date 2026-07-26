import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-26";
export const PHASE255_LAMY_BRAND_ID = "ySwGGq4bhvOA";
export const PHASE255_LAMY_ID = "phase255-lamy-ideos";
export const PHASE255_LAMY_SLUG = "lamy-ideos";
const SCOPE = "phase255-lamy-ideos-current";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.independenceGroup,
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

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase255",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase255",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.95,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey: SCOPE, locator }],
  };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const official = web({
  key: "phase255-lamy-ideos-official",
  title: "LAMY official ideos Pd Fountain Pen",
  url: "https://www.lamy.com/en-us/p/lamy-ideos-pd-fountain-pen/50723089776974",
  registryKey: "lamy-official-phase255",
  registryName: "LAMY",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "lamy-official-phase255",
  summary: "官方页面确认 ideos palladium 款的水滴状截面、EOOS 设计、钯色黄铜、铬色握位、抛光不锈钢夹、Z 53 钢尖、T 10/Z 27、14×12×143 mm 与 28 g。",
  locator: "product title; palladium; description; EOOS; fountain-pen specification paragraph; Data size and weight",
});

const catalog = web({
  key: "phase255-lamy-fountain-catalog",
  title: "LAMY official Fountain Pens category",
  url: "https://www.lamy.com/en-us/writing-tools/fountain-pens",
  registryKey: "lamy-official-catalog-phase255",
  registryName: "LAMY",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "lamy-official-catalog-phase255",
  summary: "官方钢笔目录把 ideos 作为 fountain pen 入口，与其他书写模式分开，支持型号存在和模式边界。",
  locator: "Fountain Pens category and model listing",
});

const retailer = web({
  key: "phase255-jetpens-ideos",
  title: "JetPens LAMY ideos Fountain Pen - Palladium",
  url: "https://www.jetpens.com/LAMY-ideos-Fountain-Pen-Palladium-Broad/pd/33352",
  registryKey: "jetpens-ideos-phase255",
  registryName: "JetPens",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "jetpens-ideos-phase255",
  summary: "专业零售商资料提供 ideos 黄铜、钢尖、T 10/Z 27、握位与重量等旁证，并明确属于商品样本字段，不替代官方规格。",
  locator: "features and product specifications: brass, steel nib, cartridge/converter, grip and weight",
});

const forum = web({
  key: "phase255-fpn-ideos",
  title: "Fountain Pen Network: LAMY Ideos Palladium Fountain Pen",
  url: "https://www.fountainpennetwork.com/forum/topic/363040-lamy-ideos-palladium-fountain-pen/",
  registryKey: "fountain-pen-network-ideos-phase255",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fountain-pen-network-ideos-phase255",
  summary: "社区样本记录 ideos 的长度、重量、握位轮廓和后插体验；仅用于样本边界，不升级为统一工程规格。",
  locator: "review sample: capped/uncapped/posted length, width and weight",
});

const svg = diagram(
  "phase255-lamy-ideos-svg",
  "LAMY ideos structure factual diagram",
  "/images/library/site-original/phase255/lamy/lamy-ideos.svg",
);

const pack: CuratedEntityPack = {
  key: "phase255-lamy-ideos-v1",
  entityId: PHASE255_LAMY_ID,
  expectedType: "pen",
  expectedSlug: PHASE255_LAMY_SLUG,
  canonicalName: "LAMY ideos",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/lamy-ideos-phase255.md",
  storyTitle: "LAMY ideos：水滴截面与钯色金属的现代钢笔",
  primarySourceKey: official.key,
  depthTier: "A",
  aliases: [
    { alias: "LAMY ideos", language: "en", sourceKey: official.key },
    { alias: "Lamy Ideos", language: "en", sourceKey: retailer.key },
    { alias: "凌美 ideos", language: "zh", sourceKey: official.key },
  ],
  sources: [official, catalog, retailer, forum, svg],
  scopes: [{ key: SCOPE, scopeKey: SCOPE, productionState: "current", editionScope: "官方 ideos Pd Fountain Pen palladium；尖宽、地区库存和其他书写模式逐 SKU 核对。" }],
  claims: [
    claim("ideos-identity", "model_identity", "LAMY ideos 是 EOOS 设计的金属钢笔型号；本页不把同名 ballpoint 或 rollerball 合并。", official.key, "product title, fountain-pen category and EOOS design record"),
    claim("ideos-section", "design_geometry", "官方以 triangle meets circle 和 stylised drop shape 描述 ideos 的非对称水滴截面；它是识别和握持方向线索，不是强制握笔角度。", official.key, "Symbiotic perfection in form description"),
    claim("ideos-material", "material_finish", "官方 ideos Pd Fountain Pen 使用钯色处理的黄铜笔身、铬色握位与抛光不锈钢夹。", official.key, "fountain-pen product description and material paragraph"),
    claim("ideos-nib", "nib", "该钢笔使用 polished LAMY Z 53 steel nib；官方还说明其设计语境与 2017 年 aion 特别笔尖相关。", official.key, "fountain-pen specification paragraph: polished LAMY Z 53 steel nib"),
    claim("ideos-fill", "filling_system", "官方随笔列 LAMY T 10 蓝色墨囊，并写明可使用 LAMY Z 27 转换器。", official.key, "fountain-pen specification paragraph: T 10 and Z 27"),
    claim("ideos-design", "designer", "LAMY ideos 的设计署名为 EOOS；设计团队身份不等同于制造商或笔尖供应商。", official.key, "Design: EOOS record"),
    claim("ideos-secondary", "professional_sample_boundary", "JetPens 的尺寸、重量和结构字段以及 FPN 的长度/握位记录是商品或单支样本旁证，不覆盖官方锚点或全批次体验。", retailer.key, "retailer specifications and independent sample boundary", "core"),
    claim("ideos-care", "maintenance_boundary", "金属镀层、握位、夹子和 bayonet catch 应采用温和清洁；卡口或尖座异常时停止施力并交由官方或销售方维修。", official.key, "official product construction and LAMY care-service boundary", "editorial"),
  ],
  variants: [{ key: "ideos-palladium-standard", name: "ideos Pd Fountain Pen palladium", productCode: "11235463", notes: "官方美国页的 palladium 钢笔入口；页面当前尖宽和库存是地区快照。", sourceKey: official.key, variantKind: "market_sku", market: "US" }],
  spec: {
    brandEntityId: PHASE255_LAMY_BRAND_ID,
    values: {
      series_name: "LAMY ideos",
      release_year: "当前官方商品页可见；未将页面观察年份写作首发年份",
      origin_country: "LAMY 德国品牌产品线；该 SKU 页面未给出工厂产地，故不外推制造地",
      nib: "polished LAMY Z 53 steel nib",
      fill_system: "LAMY T 10 cartridge / LAMY Z 27 converter",
      material: "黄铜笔身钯色处理、铬色自由曲面握位、抛光不锈钢夹",
      dimensions: "约 14 × 12 × 143 mm（官方 Data）",
      weight: "28 g（官方 Data）",
    },
    evidence: [
      evidence("ideos-brand", "brand_entity_id", official.key, "official LAMY product page"),
      evidence("ideos-series", "series_name", official.key, "LAMY ideos Pd Fountain Pen product title"),
      evidence("ideos-release", "release_year", catalog.key, "current fountain-pen category visibility; no launch year asserted"),
      evidence("ideos-origin", "origin_country", official.key, "LAMY product context; exact factory intentionally not asserted"),
      evidence("ideos-nib-spec", "nib", official.key, "polished LAMY Z 53 steel nib"),
      evidence("ideos-fill-spec", "fill_system", official.key, "LAMY T 10 blue cartridge and Z 27 converter"),
      evidence("ideos-material-spec", "material", official.key, "palladium-finished brass body, chrome-plated grip and polished stainless-steel clip"),
      evidence("ideos-dimensions", "dimensions", official.key, "Data: 14 x 12 x 143 mm"),
      evidence("ideos-weight", "weight", official.key, "Data: 28 g"),
    ],
  },
  media: [{ key: "ideos-primary-svg", title: "LAMY ideos 结构事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase255LamyIdeosPacks: CuratedEntityPack[] = [pack];
