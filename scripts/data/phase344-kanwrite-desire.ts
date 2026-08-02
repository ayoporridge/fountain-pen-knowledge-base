import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase259KanwriteHeritagePacks } from "./phase259-kanwrite-heritage";

const RETRIEVED = "2026-08-02";
export const PHASE344_KANWRITE_BRAND_ID = "phase259-brand-kanwrite";
export const PHASE344_DESIRE_ID = "phase344-kanwrite-desire";
export const PHASE344_DESIRE_SLUG = "kanwrite-desire";
const DESIRE_SCOPE = "Kanwrite Desire current family, 2025 official specification, and versioned nib/fill options";

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
    registryKey: "fountain-pen-graph-editorial-phase344",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase344",
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

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.95,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey: DESIRE_SCOPE, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: DESIRE_SCOPE, locator, qualifies: true };
}

const desirePage = web({
  key: "phase344-kanwrite-desire-official",
  title: "Kanwrite Desire official family page",
  url: "https://kanwrite.com/fountain-pens/desire/",
  registryKey: "kanwrite-official-desire-phase344",
  registryName: "Kanwrite official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kanwrite-official-desire-phase344",
  summary: "官方家族页确认 Desire 的 resin 主体、#6 尖、EF/F/M/EF-Flex/F-Flex 选项、cartridge/converter/eyedropper 三种上墨和 Noir/Marble/Crystal/Solid 主题。",
  locator: "Desire features, themes and filling mechanism",
});

const solidBlack = web({
  key: "phase344-kanwrite-desire-solid-black",
  title: "Kanwrite Desire Solid Black official product",
  url: "https://kanwrite.com/product/desire-solid-black/",
  registryKey: "kanwrite-official-desire-solid-black-phase344",
  registryName: "Kanwrite official shop",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kanwrite-official-desire-solid-black-phase344",
  summary: "官方 Solid Black 商品页给出 SKU KW-DS-09、140 mm、10.8 mm、16.2/10.3 g，以及尖材、尖幅、feed 和旋帽字段。",
  locator: "SKU, specifications and selectable nib/feed options",
});

const catalog = web({
  key: "phase344-kanwrite-catalog",
  title: "Kanwrite Full Catalog 2025 PDF",
  url: "https://kanwrite.com/wp-content/uploads/2025/07/Kanwrite-Full-Catalog-wp-v03072025_compressed.pdf",
  registryKey: "kanwrite-official-catalog-phase344",
  registryName: "Kanwrite official catalog",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kanwrite-official-catalog-phase344",
  summary: "2025 官方目录把 Desire 的 0.8 ml converter、screw-on 可换尖单元、#6（35 mm）、feed 和尺寸重量列成独立规格，并把 Noir Desire 分开。",
  locator: "PDF pp. 4-5 Desire and Noir Desire specification tables",
});

const about = web({
  key: "phase344-kanwrite-about",
  title: "Kanwrite official About Us",
  url: "https://kanwrite.com/about-us/",
  registryKey: "kanwrite-official-about-phase344",
  registryName: "Kanwrite official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kanwrite-official-about-phase344",
  summary: "官方沿革记载 Kanpur Writers 约 1986 年起点、2012 年 KANWRITE 自有品牌形成和 Kanpur 制造语境。",
  locator: "company history, brand formation and Kanpur context",
});

const portfolio = web({
  key: "phase344-kanwrite-portfolio",
  title: "Kanwrite official fountain pen portfolio",
  url: "https://kanwrite.com/fountain-pens/",
  registryKey: "kanwrite-official-portfolio-phase344",
  registryName: "Kanwrite official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kanwrite-official-portfolio-phase344",
  summary: "官方目录把 Desire 与 Heritage、Legacy、Emperor、Divine、Mammoth 等路线并列，避免跨型号回填结构和尖号。",
  locator: "Fountain Pen Models navigation",
});

const writerShelf = web({
  key: "phase344-writershelf-desire",
  title: "Kanwrite Desire — Square in the Sweet Spot",
  url: "https://www.writershelf.com/article/kanwrite-desire-square-in-the-sweet-spot?prne=roa",
  registryKey: "writershelf-kanwrite-desire-phase344",
  registryName: "WriterShelf / EDC",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "writershelf-kanwrite-desire-phase344",
  summary: "独立实物评测记录新版 Desire 的 #6 尖、139/126/159 mm、样本重量、树脂、套帽、滴入边界和可换尖；手感只归于作者样本。",
  locator: "2019/2020 sample sections on dimensions, materials, filling and nib unit",
});

const vancouver = web({
  key: "phase344-vancouver-pen-club-desire",
  title: "Vancouver Pen Club Desire show-and-tell",
  url: "https://www.vancouverpenclub.com/2022/03/newest-acquisitions-virtual-show-tell_26.html",
  registryKey: "vancouver-pen-club-kanwrite-desire-phase344",
  registryName: "Vancouver Pen Club",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "vancouver-pen-club-kanwrite-desire-phase344",
  summary: "笔会持有者记录 Desire 的 Fire Blast Marble、Opaque Pearl Brown 等树脂命名和 EF/F/M/B/BB 选择，属于具体购买样本。",
  locator: "Desire nib widths, resin color names and owner sample",
});

const fpn = web({
  key: "phase344-fpn-desire",
  title: "Fountain Pen Network Kanwrite Desire review",
  url: "https://www.fountainpennetwork.com/forum/topic/314412-kanwrite-desire-a-beautiful-entry-level-fountain-pen/",
  registryKey: "fpn-kanwrite-desire-phase344",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fpn-kanwrite-desire-phase344",
  summary: "社区文章提供早期 Desire 的价格和 flex 样本背景，仅用于年代与使用观察，不覆盖当前官方规格。",
  locator: "2016 Desire entry-level and flex sample discussion",
});

const svg = diagram(
  "phase344-kanwrite-desire-svg",
  "Kanwrite Desire filling and nib factual diagram",
  "/images/library/site-original/phase344/kanwrite/desire.svg",
);

const model: CuratedEntityPack = {
  key: "phase344-kanwrite-desire-v1",
  entityId: PHASE344_DESIRE_ID,
  expectedType: "pen",
  expectedSlug: PHASE344_DESIRE_SLUG,
  canonicalName: "Kanwrite Desire",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/kanwrite-desire-phase344.md",
  storyTitle: "Kanwrite Desire：一支把 #6 尖和三种上墨方式放进日用树脂杆的笔",
  primarySourceKey: desirePage.key,
  depthTier: "A",
  aliases: [
    { alias: "Kanwrite Desire Fountain Pen", language: "en", sourceKey: desirePage.key },
    { alias: "Desire Noir", language: "en", sourceKey: catalog.key },
    { alias: "Kanwrite Desire 日用树脂钢笔", language: "zh", sourceKey: solidBlack.key },
  ],
  sources: [desirePage, solidBlack, catalog, about, portfolio, writerShelf, vancouver, fpn, svg],
  scopes: [{
    key: DESIRE_SCOPE,
    scopeKey: DESIRE_SCOPE,
    productionState: "current",
    editionScope: "Desire family；Noir、Marble、Crystal、Solid 是颜色／饰件主题，尖幅和 feed 按商品 SKU 核对。",
  }],
  claims: [
    claim("desire-identity", "model_identity", "Kanwrite Desire 是 Kanwrite 独立的日用树脂钢笔路线；不与 Heritage、Legacy、Emperor 或单独销售的尖单元合并。", desirePage.key, "Desire family page and official portfolio"),
    claim("desire-material", "material", "官方家族页与商品页将主体写为 resin／engineered acrylic resin；Noir 使用黑色路线，不能把所有颜色写成同一树脂配方。", solidBlack.key, "body material and Desire themes"),
    claim("desire-nib", "nib", "Desire 使用 #6 尖单元；官方列 EF、F、M、EF-Flex、F-Flex，商品菜单还显示 regular、flex、ultra-flex、steel、钛和 14K 等配置。", desirePage.key, "#6 options and current product menu"),
    claim("desire-nib-unit", "nib_interchange", "官方目录写明尖单元为 screw-on、可更换；这支持 Desire 平台内的换尖，不证明任意品牌 #6 尖都能无条件互换。", catalog.key, "screw-on interchangeable nib unit"),
    claim("desire-fill", "filling_system", "官方把 cartridge、converter 与 eyedropper 并列为 3-in-1 filling mechanism；2025 目录把 converter 标为约 0.8 ml。", catalog.key, "three filling systems and converter capacity"),
    claim("desire-cap", "cap_mechanism", "官方 Solid Black 规格将帽型列为 screw on；独立样本约两圈拆帽，后者属于评测观察。", solidBlack.key, "cap type; independent turns are sample-specific"),
    claim("desire-size", "physical_specification", "官方 Solid Black 给出闭帽 140 mm、握位直径 10.8 mm、带帽 16.2 g、不带帽 10.3 g；独立 2019 样本的 139/126/159 mm 与 16.6 g 单独标注。", solidBlack.key, "official specification and sample boundary"),
    claim("desire-variants", "variant_boundary", "Noir、Marble、Crystal、Solid 是官方家族主题；Solid Black 的 KW-DS-09 是商品 SKU，不应扩成新的机械型号。", desirePage.key, "four themes and Solid Black SKU"),
    claim("desire-origin", "origin_country", "Kanwrite 官方沿革把品牌置于印度 Kanpur Writers 体系；这说明品牌与制造语境，不外推每个外购零件的产地。", about.key, "Kanpur Writers history and address"),
    claim("desire-secondary", "professional_secondary_boundary", "WriterShelf 与 Vancouver Pen Club 的文章承担具体样本的尺寸、颜色和书写观察；不把作者的轻重、顺滑或 flex 感受泛化为全系承诺。", writerShelf.key, "independent sample boundary"),
    claim("desire-care", "maintenance_guidance", "卡水／converter 换墨先以室温清水清洗；滴入前擦干螺纹、薄涂 silicone grease，并避免热水、酒精、长时间浸泡和强拧尖座。", desirePage.key, "conservative resin, thread and eyedropper care", "editorial"),
    claim("desire-buying", "selection_guidance", "选购先确认 Desire 主题、尖幅、feed 和上墨方式，再核对具体 SKU；不要仅凭颜色昵称、ultra-flex 宣传或相似外形推断批次和通用兼容性。", solidBlack.key, "variant and nib selection boundary", "editorial"),
  ],
  variants: [
    { key: "desire-noir", name: "Desire Noir", notes: "黑色 PVD 尖与饰件路线；官方目录单列，不改变 Desire 的三种上墨边界。", sourceKey: catalog.key, variantKind: "edition_group", market: "global" },
    { key: "desire-marble", name: "Desire Marble", notes: "树脂混色／marble 主题；具体颜色按商品页面和批次核对。", sourceKey: desirePage.key, variantKind: "edition_group", market: "global" },
    { key: "desire-crystal", name: "Desire Crystal", notes: "透明树脂主题；不等同于另一种供墨机构。", sourceKey: desirePage.key, variantKind: "edition_group", market: "global" },
    { key: "desire-solid", name: "Desire Solid", notes: "经典纯色主题；Solid Black KW-DS-09 是其中一个商品样本。", sourceKey: solidBlack.key, variantKind: "edition_group", market: "global" },
    { key: "desire-solid-black", name: "Desire Solid Black", productCode: "KW-DS-09", notes: "官方商品 SKU；饰件、尖面、尖幅和 feed 从当期菜单选择。", sourceKey: solidBlack.key, variantKind: "market_sku", market: "India/global" },
  ],
  spec: {
    brandEntityId: PHASE344_KANWRITE_BRAND_ID,
    values: {
      series_name: "Desire",
      release_year: "官方当前目录可核对；2019 独立文章称评测的是新版／重新推出样本，不把它写作唯一首发年份",
      origin_country: "印度 Kanpur Writers／Kanwrite 官方制造语境",
      nib: "#6 (35 mm) screw-on interchangeable unit；EF/F/M、EF-Flex/F-Flex，商品可选 regular/flex/ultra-flex、SS/Ti/14K",
      fill_system: "Cartridge／converter（约 0.8 ml）／eyedropper 三选一",
      material: "resin／engineered acrylic resin；Noir 为黑色路线",
      dimensions: "官方闭帽 140 mm；section diameter 10.8 mm；独立样本 139 mm capped、126 mm uncapped、159 mm posted",
      weight: "官方 16.2 g capped、10.3 g uncapped；独立墨水状态样本约 16.6 g",
      status: "当前官方产品家族与商品页可见；价格、库存、颜色和尖菜单随市场变化",
    },
    evidence: [
      evidence("desire-brand", "brand_entity_id", portfolio.key, "Kanwrite official family navigation"),
      evidence("desire-series", "series_name", desirePage.key, "Desire family page"),
      evidence("desire-release", "release_year", writerShelf.key, "2019 revised/current sample; no single launch-year assertion"),
      evidence("desire-origin", "origin_country", about.key, "Kanpur Writers / Kanwrite official history"),
      evidence("desire-nib-spec", "nib", catalog.key, "#6 (35 mm), screw-on unit and nib options"),
      evidence("desire-fill-spec", "fill_system", catalog.key, "cartridge, converter 0.8 ml and eyedropper"),
      evidence("desire-material-spec", "material", solidBlack.key, "engineered acrylic resin"),
      evidence("desire-dimensions", "dimensions", solidBlack.key, "140 mm and 10.8 mm official specifications"),
      evidence("desire-weight", "weight", solidBlack.key, "16.2 g / 10.3 g official specifications"),
      evidence("desire-status", "status", desirePage.key, "current family and product route"),
    ],
  },
  timeline: [{
    key: "desire-current",
    title: "Desire 官方规格核对",
    eventType: "model_released",
    startDate: RETRIEVED,
    circa: false,
    description: "2026-08-02 可访问的官方家族页、商品页和 2025 目录共同构成当前规格范围；不把评测年份当作产品首发年份。",
    sourceKey: desirePage.key,
  }],
  media: [{
    key: "desire-svg",
    title: "Kanwrite Desire 三种上墨与 #6 尖事实图（非产品照片）",
    sourceKey: svg.key,
    localPath: svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。",
    sourceUrl: svg.url,
    usageStatus: "primary",
  }],
};

export const phase344KanwriteDesirePacks: CuratedEntityPack[] = [phase259KanwriteHeritagePacks[0]!, model];
