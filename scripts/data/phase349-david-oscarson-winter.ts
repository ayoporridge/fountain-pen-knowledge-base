import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-02";
export const PHASE349_DAVID_OSCARSON_BRAND_ID = "phase349-david-oscarson-brand";
export const PHASE349_WINTER_ID = "phase349-david-oscarson-winter";
export const PHASE349_WINTER_SLUG = "david-oscarson-winter";
const BRAND_SCOPE = "David Oscarson limited writing instruments, artist-led craft, and collection navigation";
const WINTER_SCOPE = "David Oscarson Winter Collection fountain pen/roller ball limited route, craft, nib, filling, and quota";

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
    registryKey: "fountain-pen-graph-editorial-phase349",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase349",
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

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.95,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }],
  };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const story = web({
  key: "phase349-david-oscarson-story",
  title: "David Oscarson official Our Story",
  url: "https://www.davidoscarson.com/our-story",
  registryKey: "david-oscarson-official-story-phase349",
  registryName: "David Oscarson official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "david-oscarson-official-story-phase349",
  summary: "官方 Our Story 记载品牌自 2000 年制作限量书写工具，并以银、Guilloché、窑烧热珐琅和 David Oscarson 署名说明品牌路线。",
  locator: "Our Story opening, craft commitment and signature",
});

const craft = web({
  key: "phase349-david-oscarson-craft",
  title: "David Oscarson official Craftsmanship",
  url: "https://www.davidoscarson.com/craftsmanship",
  registryKey: "david-oscarson-official-craft-phase349",
  registryName: "David Oscarson official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "david-oscarson-official-craft-phase349",
  summary: "官方 Craftsmanship 说明 18K gold／.925 silver、Guilloché、热珐琅、三种供墨、O-ring、18K 尖、ebonite feeder 和 F/M/B。",
  locator: "Guilloche, Hard Enamel, Filling System and Nib and Feeder sections",
});

const winter = web({
  key: "phase349-david-oscarson-winter-official",
  title: "David Oscarson official Winter Collection",
  url: "https://www.davidoscarson.com/writing-instruments/winter-collection",
  registryKey: "david-oscarson-official-winter-phase349",
  registryName: "David Oscarson official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "david-oscarson-official-winter-phase349",
  summary: "官方 Winter 页确认第二个限量系列、四种颜色、每色 128 件（fountain pen 与 roller ball 合计）、三层 Guilloché、热珐琅、18K／银件、Heidelberg 尖与 F/M/B。",
  locator: "Winter description, Guilloche, Hard Enamel, Nib and Feeder, and color options",
});

const faq = web({
  key: "phase349-david-oscarson-faq",
  title: "David Oscarson official Contact and filling FAQ",
  url: "https://www.davidoscarson.com/contact-us",
  registryKey: "david-oscarson-official-faq-phase349",
  registryName: "David Oscarson official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "david-oscarson-official-faq-phase349",
  summary: "官方 FAQ 分步说明 cartridge、piston converter、eyedropper 三种填充与额外 O-ring，并建议通过邮件查询授权经销商。",
  locator: "FAQ purchase and how-to-fill sections",
});

const artDeco = web({
  key: "phase349-david-oscarson-art-deco",
  title: "David Oscarson official 15th Anniversary American Art Deco",
  url: "https://www.davidoscarson.com/writing-instruments/15th-anniversary-american-art-deco",
  registryKey: "david-oscarson-official-art-deco-phase349",
  registryName: "David Oscarson official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "david-oscarson-official-art-deco-phase349",
  summary: "官方 Art Deco 页面列出过去系列导航、15 段 Guilloché、银与硬珐琅及每色 150 件合计的另一限量口径。",
  locator: "collection history, craft and production quota",
});

const reflection = web({
  key: "phase349-david-oscarson-reflection",
  title: "David Oscarson: A Reflection",
  url: "https://www.davidoscarson.com/post/david-oscarson-a-reflection",
  registryKey: "david-oscarson-reflection-phase349",
  registryName: "Suzanne C. Lee",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "david-oscarson-reflection-phase349",
  summary: "Suzanne C. Lee 的 25 年回顾交叉描述银、珐琅和 Guilloché 的品牌工艺延续，不将其 25th Anniversary 规格混入 Winter。",
  locator: "25th Anniversary and craft reflection sections",
});

const retailer = web({
  key: "phase349-david-oscarson-pleasure",
  title: "The Pleasure of Writing David Oscarson Winter",
  url: "https://thepleasureofwriting.com/collections/david-oscarson-fountain-pens/products/dav-wba",
  registryKey: "pleasure-of-writing-david-oscarson-phase349",
  registryName: "The Pleasure of Writing",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "pleasure-of-writing-david-oscarson-phase349",
  summary: "专业零售页交叉确认 Winter fountain pen 的 Fine、Medium、Broad 字幅；库存和价格不入正文。",
  locator: "Winter product description and nib options",
});

const svg = diagram("phase349-david-oscarson-winter-svg", "David Oscarson Winter craft and filling factual diagram", "/images/library/site-original/phase349/david-oscarson/winter.svg");

const brand: CuratedEntityPack = {
  key: "phase349-david-oscarson-brand-v1",
  entityId: PHASE349_DAVID_OSCARSON_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "david-oscarson",
  canonicalName: "David Oscarson 大卫·奥斯卡森",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-david-oscarson-winter/brand.md",
  storyTitle: "David Oscarson：把钢笔做成可书写的金属与珐琅作品",
  primarySourceKey: story.key,
  depthTier: "A",
  aliases: [
    { alias: "David Oscarson Writing Instruments", language: "en", sourceKey: story.key },
    { alias: "David Oscarson pens", language: "en", sourceKey: craft.key },
    { alias: "大卫·奥斯卡森钢笔", language: "zh", sourceKey: reflection.key },
  ],
  sources: [story, craft, winter, faq, artDeco, reflection, svg],
  scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "current", editionScope: "Artist-led limited writing instruments; collections, fountain pen/roller ball styles, metals and enamel finishes remain distinct." }],
  claims: [
    claim("oscarson-founded", "brand_history", "官方 Our Story 说 David Oscarson 自 2000 年起制作限量书写工具。", story.key, BRAND_SCOPE, "Our Story since-2000 statement"),
    claim("oscarson-materials", "craft_materials", "官方把 sterling silver、18K gold、Guilloché 和 hot enamel 作为品牌核心材料与工艺语境。", craft.key, BRAND_SCOPE, "Craftsmanship materials and process"),
    claim("oscarson-guilloche", "craft_process", "Guilloché 在贵金属上经过多阶段精密雕刻，热珐琅逐层涂布并窑烧成玻璃层；不扩写成固定加工工时。", craft.key, BRAND_SCOPE, "Guilloche and Hard Enamel sections"),
    claim("oscarson-filling", "filling_scope", "官方通用工艺页支持 cartridge、converter、eyedropper 三种供墨，并用 O-ring 组成密封逻辑。", craft.key, BRAND_SCOPE, "Filling System section"),
    claim("oscarson-nib", "nib_scope", "官方写 18K gold nib、ebonite feeder、rhodium plating、iridium tipping 和 F/M/B；不把 Heidelberg 工艺语境写成整支笔产地。", craft.key, BRAND_SCOPE, "Nib and Feeder section"),
    claim("oscarson-navigation", "brand_model_navigation", "Winter、Crystal、Harvest、Celestial、15th／25th Anniversary 等是不同 collection；每个系列的主题、颜色和配额分别核对。", artDeco.key, BRAND_SCOPE, "collection history and navigation"),
    claim("oscarson-availability", "purchase_boundary", "官方 FAQ 建议通过邮件查找授权经销商；价格、库存和二手稀有度不作为品牌固定事实。", faq.key, BRAND_SCOPE, "authorized dealer FAQ"),
    claim("oscarson-review-boundary", "professional_secondary_boundary", "Suzanne C. Lee 的 25 年回顾补充品牌工艺连续性，但 25th Anniversary 的颜色／编号不能覆盖 Winter。", reflection.key, BRAND_SCOPE, "independent reflection boundary"),
    claim("oscarson-care", "maintenance_guidance", "贵金属、硬珐琅、Guilloché、O-ring 和不同供墨路径要分别维护；品牌页只提供通用边界。", faq.key, BRAND_SCOPE, "filling and surface-care boundary", "editorial"),
  ],
  variants: [{ key: "oscarson-collections", name: "Winter、Crystal、Harvest、Celestial、Art Deco、25th Anniversary 等", notes: "官方 collection 导航中的限量路线；颜色、配额、图案和供墨按各页核对。", sourceKey: artDeco.key, variantKind: "edition_group", market: "global" }],
  timeline: [
    { key: "oscarson-2000", title: "限量书写工具品牌起点", eventType: "brand_founded", startDate: "2000", circa: false, description: "官方 Our Story 的 since-2000 叙述；不把它改写成每个 collection 的首发年份。", sourceKey: story.key },
    { key: "oscarson-winter", title: "Winter 成为第二个限量系列", eventType: "design_milestone", startDate: "2000", circa: true, description: "官方 Winter 页称其为第二个 series，但页面未提供单独首发年份；时间线只保留系列顺序。", sourceKey: winter.key },
    { key: "oscarson-25", title: "25 年 Silver Anniversary 回顾", eventType: "design_milestone", startDate: "2024", circa: true, description: "Suzanne C. Lee 的回顾文章呈现 25th Anniversary 工艺语境，不把它与 Winter 合并。", sourceKey: reflection.key },
  ],
  media: [{ key: "oscarson-brand-svg", title: "David Oscarson 与 Winter 工艺路线事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase349-david-oscarson-winter-v1",
  entityId: PHASE349_WINTER_ID,
  expectedType: "pen",
  expectedSlug: PHASE349_WINTER_SLUG,
  canonicalName: "David Oscarson Winter Collection",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/david-oscarson-winter-phase349.md",
  storyTitle: "David Oscarson Winter Collection：每一层珐琅下面都有一套雕刻",
  primarySourceKey: winter.key,
  depthTier: "A",
  aliases: [
    { alias: "David Oscarson Winter Fountain Pen", language: "en", sourceKey: retailer.key },
    { alias: "Winter Collection", language: "en", sourceKey: winter.key },
    { alias: "David Oscarson Winter 冬季系列", language: "zh", sourceKey: winter.key },
  ],
  sources: [winter, craft, faq, retailer, artDeco, reflection, svg],
  scopes: [{ key: WINTER_SCOPE, scopeKey: WINTER_SCOPE, productionState: "current", editionScope: "Winter Collection; fountain pen and roller ball styles share each colour's 128-piece quota, while four colours and F/M/B nibs remain variants." }],
  claims: [
    claim("winter-identity", "model_identity", "Winter Collection 是 David Oscarson 的第二个限量书写工具系列；fountain pen 与 roller ball 是同色配额中的两种书写工具，不混成一个供墨型号。", winter.key, WINTER_SCOPE, "official Winter collection identity and quota"),
    claim("winter-quota", "limited_edition", "官方写每种颜色限量 128 件，且数量包含 fountain pens 与 roller balls；不能写成每色 128 支 fountain pen。", winter.key, WINTER_SCOPE, "128-piece quota parenthetical"),
    claim("winter-colours", "variant_boundary", "官方列出 Winter Blue、Opaque Black/Translucent White、Translucent Grey、Translucent White 四种颜色／珐琅方案。", winter.key, WINTER_SCOPE, "official color options"),
    claim("winter-guilloche", "craft_process", "Winter 首次在每件 collection piece 上使用三层 Guilloché，形成冰纹高浮雕、条纹背景和霜冻维度。", winter.key, WINTER_SCOPE, "three levels of Guilloche description"),
    claim("winter-enamel", "material", "Winter 使用 18K gold 与 .925 sterling silver 贵金属组件，覆盖半透明／不透明硬珐琅；珐琅通过超过 1,000°F 窑烧形成玻璃层。", winter.key, WINTER_SCOPE, "Guilloche, Hard Enamel and metal sections"),
    claim("winter-nib", "nib", "官方写 Heidelberg, Germany 工艺语境的 18K gold nib，配 ebonite feeder、rhodium plating、iridium tipping，F/M/B；专业零售页交叉列 F/M/B。", craft.key, WINTER_SCOPE, "Nib and Feeder and retailer nib menu"),
    claim("winter-fill", "filling_system", "品牌通用系统支持 cartridge、piston converter、eyedropper；eyedropper 方式需要额外 O-ring，FAQ 给出实际安装步骤。", faq.key, WINTER_SCOPE, "official filling FAQ"),
    claim("winter-size", "physical_specification", "Winter 官方页未发布统一闭帽、套帽、桶径或重量；不同贵金属／珐琅版本应向授权渠道索取单支资料。", winter.key, WINTER_SCOPE, "absence of published dimensions and weight", "editorial"),
    claim("winter-release", "release_boundary", "官方称 Winter 为第二个系列，但型号页未给出独立首发年份；页面保留系列顺序而不虚构年份。", winter.key, WINTER_SCOPE, "second-series wording and no launch year"),
    claim("winter-secondary", "professional_secondary_boundary", "Suzanne C. Lee 的 25 年回顾把 David Oscarson 的银、珐琅与 Guilloché 视为持续工艺语境；它不替 Winter 增加官方未公布的尺寸或数量。", reflection.key, WINTER_SCOPE, "25th Anniversary craft reflection and Winter boundary"),
    claim("winter-care", "maintenance_guidance", "Guilloché、硬珐琅、贵金属和 O-ring 需要避免研磨剂、热水、酒精、漂白剂和硬拧；供墨清洁按官方 FAQ 操作。", faq.key, WINTER_SCOPE, "conservative surface and filling care", "editorial"),
    claim("winter-buying", "selection_guidance", "选购先确认 fountain pen／roller ball、四种颜色、编号是否落在 128 件合计配额、F/M/B 尖幅、converter／滴管／O-ring 配件与授权渠道。", winter.key, WINTER_SCOPE, "collection and purchase boundary", "editorial"),
  ],
  variants: [
    { key: "winter-colour-options", name: "Winter Blue / Opaque Black-White / Translucent Grey / Translucent White", notes: "官方四种颜色／珐琅方案；每色 128 件配额包含 fountain pen 与 roller ball。", sourceKey: winter.key, variantKind: "color", market: "global" },
    { key: "winter-nib-options", name: "Fine / Medium / Broad", notes: "官方与专业零售页的 fountain pen 字幅选项；不推断更多尖型。", sourceKey: retailer.key, variantKind: "nib", market: "global" },
    { key: "winter-writing-tools", name: "Fountain pen / Roller ball", notes: "同一颜色配额中的两种书写工具；本页以 fountain pen 为规格主体。", sourceKey: winter.key, variantKind: "market_sku", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE349_DAVID_OSCARSON_BRAND_ID,
    values: {
      series_name: "Winter Collection",
      release_year: "官方称第二个限量系列，但 Winter 页未发布独立首发年份",
      origin_country: "官方 Winter 页未给出统一制造国；18K 尖仅注明 Heidelberg, Germany 工艺语境",
      nib: "18K gold, rhodium plated, iridium tipped, ebonite feeder; Fine/Medium/Broad",
      fill_system: "Cartridge / piston converter / eyedropper with O-ring path",
      material: "18K gold and .925 sterling silver with three-level Guilloché and kiln-fired hard enamel",
      dimensions: "Official Winter page does not publish a unified size; obtain single-piece measurements from authorized channel",
      weight: "Official Winter page does not publish a unified weight; precious-metal and enamel variants may differ",
      status: "Official collection page available; availability is by inquiry and collection quota",
    },
    evidence: [
      evidence("winter-brand", "brand_entity_id", story.key, WINTER_SCOPE, "official David Oscarson brand story"),
      evidence("winter-series", "series_name", winter.key, WINTER_SCOPE, "official Winter Collection page"),
      evidence("winter-release", "release_year", winter.key, WINTER_SCOPE, "second-series wording with no standalone launch year"),
      evidence("winter-origin", "origin_country", winter.key, WINTER_SCOPE, "official page's origin boundary and Heidelberg nib wording"),
      evidence("winter-nib-spec", "nib", craft.key, WINTER_SCOPE, "18K nib, ebonite feeder and F/M/B"),
      evidence("winter-fill-spec", "fill_system", faq.key, WINTER_SCOPE, "three filling methods and O-ring"),
      evidence("winter-material-spec", "material", winter.key, WINTER_SCOPE, "18K/silver, Guilloche and hard enamel"),
      evidence("winter-dimensions", "dimensions", winter.key, WINTER_SCOPE, "dimensions not published on official page"),
      evidence("winter-weight", "weight", winter.key, WINTER_SCOPE, "weight not published on official page"),
      evidence("winter-status", "status", winter.key, WINTER_SCOPE, "official availability inquiry and quota"),
    ],
  },
  timeline: [{ key: "winter-current", title: "Winter Collection 官方页核对", eventType: "model_released", startDate: "2000", circa: true, description: "官方称 Winter 为第二个限量系列，但没有单独首发年份；2026-08-02 以当前页面与 FAQ 核对结构和供墨。", sourceKey: winter.key }],
  media: [{ key: "winter-svg", title: "David Oscarson Winter Guilloché／珐琅与供墨事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase349DavidOscarsonWinterPacks: CuratedEntityPack[] = [brand, model];
