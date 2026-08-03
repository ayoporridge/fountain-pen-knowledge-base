import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase50WatermanCareneExpertPacks } from "./phase50-waterman-carene-expert";

export const PHASE397_WATERMAN_BRAND_ID = "zkAu9PePDdqJ";
export const PHASE397_HEMISPHERE_ID = "gwKClNnwt3V3";
export const PHASE397_HEMISPHERE_SLUG = "waterman-hemisphere";
export const PHASE397_HEMISPHERE_NAME = "威迪文 Waterman Hémisphère";

const RETRIEVED = "2026-08-03";
const SCOPE = "waterman-hemisphere-phase397-current-and-history";
const baseBrand = phase50WatermanCareneExpertPacks.find(
  (pack) => pack.entityId === PHASE397_WATERMAN_BRAND_ID && pack.expectedType === "brand",
);
if (!baseBrand) throw new Error("Phase 397 Waterman brand base pack missing.");

function source(
  input: Omit<CuratedSource, "key" | "retrievedAt"> & { key: string },
): CuratedSource {
  return { ...input, retrievedAt: RETRIEVED };
}

const SOURCES = {
  collection: source({
    key: "phase397-waterman-hemisphere-collection",
    registryKey: "waterman-official-current-hemisphere",
    registryName: "Waterman official current Hémisphère collection",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-hemisphere-collection",
    title: "Hémisphère Luxury Pens",
    url: "https://www.waterman.com/pens/h%C3%A9misph%C3%A8re/",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方 collection 将 Hémisphère fountain pen、rollerball、ballpoint 分开，并列出 Colour Blocking、L’Essence du Bleu、Reflections of Paris、Opéra、Understated Edit 等 family/主题入口。",
    archiveUrl: "https://www.waterman.com/pens/h%C3%A9misph%C3%A8re/",
    archiveLocator: "current collection filters, writing-type separation, colour and theme entries",
  }),
  product: source({
    key: "phase397-waterman-hemisphere-blue-ct",
    registryKey: "waterman-official-hemisphere-2214204",
    registryName: "Waterman official Hémisphère Blue CT product",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-hemisphere-blue-ct-2214204",
    title: "Hémisphère Fountain Pen Blue CT, item 2214204",
    url: "https://www.waterman.com/pens/h%C3%A9misph%C3%A8re/h%C3%A9misph%C3%A8re/h%C3%A9misph%C3%A8re-fountain-pen/SAP_2214204.html",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "当前商品页列 2214204、深蓝 lacquer cap/barrel、palladium-coated two-prong clip/trims、black resin shell、brass with lacquer cap、Waterman W stainless-steel nib、法国手工组装、两年国际保修及当前缺货状态。",
    archiveUrl: "https://www.waterman.com/pens/h%C3%A9misph%C3%A8re/h%C3%A9misph%C3%A8re/h%C3%A9misph%C3%A8re-fountain-pen/SAP_2214204.html",
    archiveLocator: "product description, features, item number 2214204, material, nib, assembly and warranty",
  }),
  history: source({
    key: "phase397-waterman-heritage",
    registryKey: "waterman-official-heritage",
    registryName: "Waterman official heritage timeline",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-heritage",
    title: "Waterman Heritage",
    url: "https://www.waterman.com/waterman-history.html",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方品牌史把 Hémisphère 放在 1994，并将 Expert 1990–92、Carène 1997 列为相邻现代系列时间锚点。",
    archiveUrl: "https://www.waterman.com/waterman-history.html",
    archiveLocator: "1994 Hémisphère entry and adjacent Waterman series dates",
  }),
  filling: source({
    key: "phase397-waterman-filling-support",
    registryKey: "waterman-official-support-filling",
    registryName: "Waterman official filling support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-support-filling",
    title: "Fountain pen ink filling instructions",
    url: "https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方说明 Waterman 墨囊插入、converter 吸墨、笔尖浸入、回滴三滴、吸入少量空气和软布擦拭余墨。",
    archiveUrl: "https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions",
    archiveLocator: "official cartridge and converter filling sequence",
  }),
  cleaning: source({
    key: "phase397-waterman-cleaning-support",
    registryKey: "waterman-official-support-cleaning",
    registryName: "Waterman official storage and cleaning support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-support-cleaning",
    title: "Fountain pen storage and cleaning recommendations",
    url: "https://www.waterman.com/support?cfid=fountain-pen-storage-and-cleaning-recommendations",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方建议尖朝上收纳；每次换墨之间以凉水浸泡、冲洗和吹出余水，再装新墨囊或 converter。",
    archiveUrl: "https://www.waterman.com/support?cfid=fountain-pen-storage-and-cleaning-recommendations",
    archiveLocator: "official point-up storage and cool-water cleaning guidance",
  }),
  catalogue: source({
    key: "phase397-waterman-catalogue-2021",
    registryKey: "waterman-official-trade-catalogue",
    registryName: "Waterman official trade catalogue",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "waterman-official-catalogue",
    title: "Waterman Trade Catalogue 2021",
    url: "https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方贸易目录保留 Hémisphère 的商品、尖幅和饰面档案语境，用于交叉核对，不替代当前地区库存。",
    archiveUrl: "https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021",
    archiveLocator: "Hémisphère catalogue pages, finishes and nib listings",
  }),
  penchalet: source({
    key: "phase397-penchalet-hemisphere",
    registryKey: "penchalet-waterman-hemisphere",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "penchalet-hemisphere",
    title: "Waterman Hemisphere Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/waterman_hemisphere_fountain_pen.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    allowedUse: "summary_only",
    summary:
      "专业零售页记录常规 Hémisphère 约 136.5 mm 合帽、152.4 mm 后套、9.5 mm 直径、19.84 g、不锈钢尖和 cartridge 填充；数字只绑定该样本。",
    archiveUrl: "https://www.penchalet.com/fine_pens/fountain_pens/waterman_hemisphere_fountain_pen.html",
    archiveLocator: "specific Hémisphère dimensions, weight, nib and fill mechanism",
  }),
  fpn: source({
    key: "phase397-fpn-hemisphere-review",
    registryKey: "fountain-pennetwork-hemisphere",
    registryName: "The Fountain Pen Network",
    sourceType: "forum",
    tier: "professional_secondary",
    independenceGroup: "fountain-pennetwork-hemisphere",
    title: "Waterman Hémisphère Review - Blue - Medium Nib",
    url: "https://www.fountainpennetwork.com/forum/topic/331517-waterman-h%C3%A9misph%C3%A8re-review-blue-medium-nib/",
    homepageUrl: "https://www.fountainpennetwork.com/",
    author: "The Fountain Pen Network",
    allowedUse: "summary_only",
    summary:
      "专业钢笔论坛的实物评测把 Hémisphère 放在 1994 之后的细身、轻量路线，记录 Blue Medium 样本和随盒墨囊/转换器边界；个人手感不替代官方规格。",
    archiveUrl: "https://www.fountainpennetwork.com/forum/topic/331517-waterman-h%C3%A9misph%C3%A8re-review-blue-medium-nib/",
    archiveLocator: "review introduction, slim profile, medium nib and included cartridge/converter notes",
  }),
  wasserman: source({
    key: "phase397-wasserman-hemisphere-sku",
    registryKey: "wasserman-hemisphere-sku",
    registryName: "Wasserman.eu",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "wasserman-hemisphere-sku",
    title: "Waterman Hemisphere Black CT S0920530",
    url: "https://www.wasserman.eu/en/p/fountain-pen-fp-hemisphere-black-lacquer-ct-m-s0920530-waterman-899155",
    homepageUrl: "https://www.wasserman.eu/",
    author: "Wasserman.eu",
    allowedUse: "summary_only",
    summary:
      "专业零售商为 Black CT S0920530 记录黑色漆面、钢尖、M 尖、Waterman cartridges 或另配 piston、约 137 mm 和 20 g；该数值只绑定具体商品。",
    archiveUrl: "https://www.wasserman.eu/en/p/fountain-pen-fp-hemisphere-black-lacquer-ct-m-s0920530-waterman-899155",
    archiveLocator: "specific Black CT SKU S0920530 material, nib, fill and measurement table",
  }),
  svg: source({
    key: "phase397-waterman-hemisphere-svg",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Waterman Hémisphère 事实卡（本站原创示意图）",
    url: "/images/library/site-original/waterman-current/waterman-hemisphere-current.svg",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    itemType: "image",
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG 表达 Hémisphère 细身轮廓、Waterman W 钢尖和 CT/GT 饰件边界；示意图，非产品照片。",
    archiveUrl: "/images/library/site-original/waterman-current/waterman-hemisphere-current.svg",
    archiveLocator: "project-public-asset:/images/library/site-original/waterman-current/waterman-hemisphere-current.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  }),
} satisfies Record<string, CuratedSource>;

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceItem: CuratedSource,
  locator: string,
  factClass: "core" | "editorial" = "core",
  extra: CuratedSource[] = [],
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey: sourceItem.key,
    locator,
    evidence: [sourceItem, ...extra].map((item, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: item.key,
      scopeKey: SCOPE,
      locator: index === 0 ? locator : item.summary,
    })),
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceItem: CuratedSource,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey: sourceItem.key, scopeKey: SCOPE, locator, qualifies: true };
}

const hemisphere: CuratedEntityPack = {
  key: "phase397-waterman-hemisphere-refresh-v1",
  entityId: PHASE397_HEMISPHERE_ID,
  expectedType: "pen",
  expectedSlug: PHASE397_HEMISPHERE_SLUG,
  canonicalName: PHASE397_HEMISPHERE_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/waterman-hemisphere-phase397.md",
  storyTitle: "Waterman Hémisphère：1994 起的细身路线，当前 2214204 与旧款边界",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Waterman Hémisphère", language: "en", sourceKey: SOURCES.collection.key },
    { alias: "Waterman Hemisphere", language: "en", sourceKey: SOURCES.collection.key },
    { alias: "威迪文 Hémisphère", language: "zh", sourceKey: SOURCES.collection.key },
    { alias: "Hémisphère Fountain Pen", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Waterman H1 2214204", language: "en", sourceKey: SOURCES.product.key, market: "Waterman UK current product" },
  ],
  sources: Object.values(SOURCES),
  scopes: [{
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    market: "Waterman current Hémisphère collection and Blue CT item 2214204, with historical/secondary comparison",
    nibScope: "current Waterman W stainless-steel nib; Fine/Medium and historical/plated variants remain SKU-bound",
    materialScope: "2214204 deep-blue lacquer, palladium-coated trims, black resin shell and brass-with-lacquer cap; other finishes separately checked",
    editionScope: "Hémisphère fountain pen family only; excludes same-name rollerball, ballpoint and Charleston/Expert/Carène identities",
  }],
  claims: [
    claim(`${SCOPE}-identity`, "model_identity", "Waterman Hémisphère 是官方当前 collection 中的 fountain-pen family；Blue CT 当前商品号为 2214204，rollerball 与 ballpoint 分列。", SOURCES.product, "official writing type and item 2214204", "core", [SOURCES.collection]),
    claim(`${SCOPE}-history`, "release_history", "Waterman Heritage 官方时间线把 Hémisphère 放在 1994，并将 Expert 1990–92、Carène 1997 列为相邻现代系列时间锚点。", SOURCES.history, "official 1994 Hémisphère entry", "core"),
    claim(`${SCOPE}-current-material`, "sku_material_boundary", "Blue CT item 2214204 的深蓝 lacquer cap/barrel、palladium-coated two-prong clip/trims、black resin shell 与 brass-with-lacquer cap 只绑定当前 SKU。", SOURCES.product, "official 2214204 materials and finish", "core"),
    claim(`${SCOPE}-current-nib`, "sku_nib_boundary", "2214204 使用带环形 W 标记的 Waterman stainless-steel nib；当前页面显示 Medium，collection 另列 Fine，字幅依商品核对。", SOURCES.product, "official nib feature and size selector", "core", [SOURCES.collection]),
    claim(`${SCOPE}-assembly`, "manufacturing_boundary", "当前商品页称 Hémisphère 在法国 Waterman 工艺中心手工组装，并提供两年国际保修；旧款个体的工厂和凭证另核。", SOURCES.product, "official hand-assembled France and warranty wording", "core"),
    claim(`${SCOPE}-filling`, "filling_system", "Hémisphère fountain pen 使用 Waterman cartridge/converter；官方说明墨囊刺破、converter 吸墨、回滴三滴和软布擦拭。", SOURCES.filling, "official cartridge/converter instructions", "core"),
    claim(`${SCOPE}-care`, "maintenance_guidance", "官方建议换墨之间用凉水清洁，尖朝上收纳；细身旧款还需检查握位裂纹、帽内干墨和转换器密封。", SOURCES.cleaning, "official point-up storage and cool-water cleaning; old-pen checks are bounded guidance", "core", [SOURCES.filling]),
    claim(`${SCOPE}-dimensions`, "variant_measurement", "Pen Chalet 常规款记录合帽 136.5 mm、后套 152.4 mm、直径 9.5 mm、19.84 g；Wasserman Black CT S0920530 约 137 mm、20 g，均不代表全系统一值。", SOURCES.penchalet, "professional retailer measurement table", "core", [SOURCES.wasserman]),
    claim(`${SCOPE}-generation`, "version_boundary", "1994 起的历史 Hémisphère、当前 2214204、Colour Blocking、L’Essence du Bleu、Opéra 和 Understated Edit 需按年份、颜色、饰件和商品号分开；不能用无日期二手图替代当前 SKU。", SOURCES.history, "official heritage and current collection boundary", "core", [SOURCES.collection, SOURCES.fpn]),
    claim(`${SCOPE}-family`, "sibling_boundary", "Hémisphère 与 Expert、Carène、Allure、Charleston 是不同 Waterman 身份；细身钢尖不能吸收 Carène 的 18K inset 尖或 Expert 的饱满尺寸。", SOURCES.history, "official heritage sequence and current pens navigation", "core", [SOURCES.collection]),
    claim(`${SCOPE}-media`, "media_identity_boundary", "本站原创 SVG 只表达 Hémisphère 的细身轮廓、W 钢尖和 CT/GT 饰件关系；它是示意图，不是具体产品照片或颜色校样。", SOURCES.svg, "site-original factual SVG attribution and non-photo boundary", "editorial"),
  ],
  variants: [
    { key: `${SCOPE}-blue-ct`, name: "Blue CT fountain pen（item 2214204）", releaseYear: "现行官网 SKU", notes: "深蓝 lacquer cap/barrel、palladium-coated two-prong clip/trims、black resin shell；Waterman W stainless-steel nib，当前页面显示 Medium。", sourceKey: SOURCES.product.key, variantKind: "market_sku", productCode: "2214204", market: "Waterman UK current product page" },
    { key: `${SCOPE}-colour-blocking`, name: "Colour Blocking 多色漆面", releaseYear: "现行 collection SKU", notes: "浅紫、浅蓝、浅粉、浅绿等颜色先作为 Hémisphère family 变体；尖、材料、礼盒和库存按商品号核对。", sourceKey: SOURCES.collection.key, variantKind: "color", market: "Waterman current collection" },
    { key: `${SCOPE}-theme`, name: "L’Essence du Bleu、Opéra、Reflections、Understated Edit", releaseYear: "现行与地区主题 SKU", notes: "主题、饰件或礼盒名称不自动表示结构换代；钢笔与滚珠/圆珠商品要分开。", sourceKey: SOURCES.collection.key, variantKind: "edition_group", market: "Waterman current collection" },
    { key: `${SCOPE}-historical`, name: "1994 起的历史与地区 Hémisphère", releaseYear: "1994–现行市场", notes: "帽环、尖刻字、漆面、夹子和包装可能随年代变化；没有目录或实物证据时不写精确换代年。", sourceKey: SOURCES.history.key, variantKind: "edition_group", market: "Waterman heritage and secondary review" },
  ],
  spec: {
    brandEntityId: PHASE397_WATERMAN_BRAND_ID,
    values: {
      series_name: "Waterman Hémisphère",
      release_year: "1994",
      origin_country: "当前 2214204 页面称法国 Waterman 工艺中心手工组装；历史个体和地区 SKU 另核",
      nib: "当前 2214204：Waterman W stainless-steel nib；collection 另列 Fine/Medium；历史镀层或特别尖按 SKU 核对",
      fill_system: "Waterman cartridge/converter；包装是否含 converter 依市场和商品",
      material: "当前 2214204：深蓝 lacquer cap/barrel、palladium-coated trims、black resin shell、brass with lacquer cap；其他饰面另核",
      dimensions: "Pen Chalet 常规款参照：合帽 136.5 mm、后套 152.4 mm、直径 9.5 mm、19.84 g；特别版可不同",
      status: "当前 Hémisphère fountain-pen collection 与 1994 起历史/地区版本并存；同名 rollerball/ballpoint 分列",
    },
    evidence: [
      evidence(`${SCOPE}-brand`, "brand_entity_id", SOURCES.product, "Waterman official product family context"),
      evidence(`${SCOPE}-series`, "series_name", SOURCES.collection, "current Hémisphère collection title"),
      evidence(`${SCOPE}-release`, "release_year", SOURCES.history, "official 1994 heritage entry"),
      evidence(`${SCOPE}-origin`, "origin_country", SOURCES.product, "official hand-assembled France statement"),
      evidence(`${SCOPE}-nib`, "nib", SOURCES.product, "2214204 Waterman W stainless-steel nib"),
      evidence(`${SCOPE}-fill`, "fill_system", SOURCES.filling, "official cartridge/converter instructions"),
      evidence(`${SCOPE}-material`, "material", SOURCES.product, "2214204 lacquer, palladium, resin and brass fields"),
      evidence(`${SCOPE}-dimensions`, "dimensions", SOURCES.penchalet, "professional retailer dimensions and weight"),
      evidence(`${SCOPE}-status`, "status", SOURCES.collection, "current collection and writing-type separation"),
    ],
  },
  media: [{
    key: `${SCOPE}-primary-media`,
    title: "Waterman Hémisphère 事实卡（非产品照片）",
    sourceKey: SOURCES.svg.key,
    localPath: SOURCES.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不代表真实比例、颜色、Logo、刻字、库存或具体版本。",
    sourceUrl: SOURCES.svg.url,
    usageStatus: "primary",
  }],
  timeline: [{
    key: `${SCOPE}-release-event`,
    title: "Hémisphère 进入 Waterman 现代品牌史",
    eventType: "model_released",
    startDate: "1994",
    circa: false,
    description: "Waterman Heritage 官方时间线把 Hémisphère 放在 1994，并称其设计结合技术巧思与优雅。",
    sourceKey: SOURCES.history.key,
  }],
  conflicts: [],
};

const watermanBrand: CuratedEntityPack = structuredClone(baseBrand);
watermanBrand.key = "phase397-waterman-brand-v1";

export const phase397WatermanHemisphereRefreshPacks: CuratedEntityPack[] = [
  watermanBrand,
  hemisphere,
];
