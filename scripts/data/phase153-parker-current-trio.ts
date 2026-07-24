import type {
  CuratedClaimEvidence,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import { phase146ParkerIngenuityUrbanPacks } from "./phase146-parker-ingenuity-urban-batch";

export const PHASE153_RETRIEVED = "2026-07-24";
export const PHASE153_IDS = {
  brand: "vhqNYqDChhiN",
  jotter: "lmNEK_3PuF_t",
  im: "TFGZtGLytVIN",
  sonnet: "nnagD4xc_3vG",
} as const;
export const PHASE153_SLUGS = {
  brand: "parker",
  jotter: "派克-parker-乔特-jotter",
  im: "派克-parker-im丽雅",
  sonnet: "派克-parker-卓尔-sonnet",
} as const;

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
  publishedAt?: string;
}): CuratedSource {
  return {
    ...input,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: PHASE153_RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${PHASE153_RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase153",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase153",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: PHASE153_RETRIEVED,
    summary: `${summary}；本站原创 factual SVG，示意图，非产品照片。`,
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  jotterOfficial: web({
    key: "phase153-parker-jotter-2030947",
    title: "Parker Jotter Fountain Pen — SKU 2030947",
    url: "https://www.parkerpen.com/writing-types/collections/jotter/jotter-fountain-pen/SAP_2030947.html",
    registryKey: "parker-official-phase153",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official-phase153",
    summary: "官方产品页列出 Bond Street Black、Medium 不锈钢尖、拉丝不锈钢帽、两支蓝色墨囊和 SKU 2030947。",
    locator: "Jotter Fountain Pen page; item 2030947; features and specifications blocks",
  }),
  jotterHistory: web({
    key: "phase153-parker-jotter-originals",
    title: "Parker Jotter: Find Your Original",
    url: "https://www.parkerpen.com/parker-news-jotter-originals.html",
    registryKey: "parker-official-phase153",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official-phase153",
    summary: "Parker 官方新闻稿记载 Jotter 1954 年起点，以及 2019 年 Jotter Originals 增加 Fountain Pen、Rollerball 和 Gel。",
    locator: "1 September 2019 news; Original Since '54; Exploring New Territories",
    publishedAt: "2019-09-01",
  }),
  jotterReview: web({
    key: "phase153-parker-jotter-well-appointed-desk",
    title: "The Well-Appointed Desk — Parker Jotter Fountain Pen review",
    url: "https://www.wellappointeddesk.com/2020/02/fountain-pen-review-parker-jotter-fountain-pen/",
    registryKey: "well-appointed-desk-phase153",
    registryName: "The Well-Appointed Desk",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "well-appointed-desk-phase153",
    summary: "独立评测记录 Jotter 钢笔的细长外形、Parker 专用墨囊／转换器和握位边界；只作体验与接口交叉参考。",
    locator: "Parker Jotter Fountain Pen review; proprietary cartridge/converter and stainless-steel sample observations",
  }),
  imOfficial: web({
    key: "phase153-parker-im-1931644",
    title: "Parker IM Fountain Pen — SKU 1931644",
    url: "https://www.parkerpen.com/writing-types/collections/parker-im/parker-im-fountain-pen/SP_1416663.html?isSelector=true&mainProductID=SAP_1931658",
    registryKey: "parker-official-phase153",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official-phase153",
    summary: "官方 IM 黑漆镀铬样本列 SKU 1931644、Fine、不锈钢尖、lacquer on brass 帽材和蓝色长款 QUINK 墨囊。",
    locator: "Parker IM Fountain Pen page; item 1931644; features and specifications",
  }),
  imBlue: web({
    key: "phase153-parker-im-1931647",
    title: "Parker IM Fountain Pen — SKU 1931647",
    url: "https://www.parkerpen.com/writing-types/collections/parker-im/parker-im-fountain-pen/SAP_1931647.html",
    registryKey: "parker-official-phase153",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official-phase153",
    summary: "官方蓝漆镀铬样本用于交叉确认 IM 家族的 finish／SKU 变化，不把蓝色配置回填到黑漆样本。",
    locator: "Parker IM blue lacquer page; item 1931647; finish and nib fields",
  }),
  imGrey: web({
    key: "phase153-parker-im-2213776",
    title: "Parker IM Fountain Pen — Grey Lacquer Gold Trim SKU 2213776",
    url: "https://www.parkerpen.com/writing-types/collections/parker-im/parker-im-fountain-pen/SP_1416663.html",
    registryKey: "parker-official-phase153",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official-phase153",
    summary: "官方灰漆金饰页面用于确认较新 finish 和 item number 2213776 的边界。",
    locator: "Parker IM selector page; item 2213776; grey lacquer gold trim specifications",
  }),
  imReview: web({
    key: "phase153-parker-im-jetpens",
    title: "JetPens Parker IM Premium Fountain Pen specifications",
    url: "https://www.jetpens.com/Parker-IM-Premium-Fountain-Pen-Emerald-Pearl-Medium-Nib/pd/12988",
    registryKey: "jetpens-phase153",
    registryName: "JetPens",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "jetpens-phase153",
    summary: "专业零售页记录旧 IM Premium 样本的约 137 mm 闭帽、152 mm 帖帽、金属笔身和 Parker 专用 cartridge/converter；仅作样本资料。",
    locator: "Product specifications table; model 1906732; dimensions and filling mechanism",
  }),
  imPenAddict: web({
    key: "phase153-parker-im-penaddict",
    title: "The Pen Addict — Parker IM Fountain Pen review",
    url: "https://penaddict.squarespace.com/blog/2019/4/18/parker-im-fountain-pen-review",
    registryKey: "pen-addict-phase153",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict-phase153",
    summary: "独立评测用于交叉核对 IM 的 Parker 墨囊／转换器、金属握位和实际写感限制，不替代官方 SKU。",
    locator: "Filling system, grip and nib observations in Parker IM review",
  }),
  sonnetSteel: web({
    key: "phase153-parker-sonnet-1931505",
    title: "Parker Sonnet Stainless Steel Fountain Pen — SKU 1931505",
    url: "https://www.parkerpen.com/writing-types/collections/sonnet/sonnet-fountain-pen/SP_1416973.html",
    registryKey: "parker-official-phase153",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official-phase153",
    summary: "官方 Sonnet 不锈钢样本列 SKU 1931505、Medium、不锈钢尖、钢帽和 23K 金色细节。",
    locator: "Sonnet Stainless Steel page; item 1931505; features and specifications",
  }),
  sonnetCisele: web({
    key: "phase153-parker-sonnet-1931489",
    title: "Parker Sonnet Ciselé Fountain Pen — SKU 1931489",
    url: "https://www.parkerpen.com/writing-types/collections/sonnet/sonnet-cisel%C3%A9-fountain-pen/SP_1416990.html",
    registryKey: "parker-official-phase153",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official-phase153",
    summary: "官方 Ciselé 样本列 SKU 1931489、sterling silver 帽／笔身和 18K Gold 尖，并展示其 Fine 配置。",
    locator: "Sonnet Ciselé page; item 1931489; nib and cap material specifications",
  }),
  sonnetPremium: web({
    key: "phase153-parker-sonnet-2119788",
    title: "Parker Sonnet Premium Fountain Pen — SKU 2119788",
    url: "https://www.parkerpen.com/writing-types/collections/sonnet/sonnet-premium-fountain-pen/SAP_2119788.html",
    registryKey: "parker-official-phase153",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official-phase153",
    summary: "官方 Premium 页面用于确认金尖和高级 finish 仍是 Sonnet 的独立配置，不覆盖普通钢尖版本。",
    locator: "Sonnet Premium page; item 2119788; 18K gold nib and grey satin finish",
  }),
  sonnetHistory: web({
    key: "phase153-parker-sonnet-2019-catalogue",
    title: "Parker 2019 trade catalogue",
    url: "https://assets.parkerpen.com/is/content/NewellRubbermaid/FWLA/Parker/1.%20Brand%20assets/Catalogue/2020/prkr_trdctlg_2019.pdf",
    registryKey: "parker-official-catalogues-phase153",
    registryName: "Parker official catalogues",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-catalogues-phase153",
    summary: "Parker 2019 目录把 Sonnet 记为自 1994 年起的系列，并列出后期 Laque、Premiere 等版本语境。",
    locator: "catalogue section describing Sonnet as Parker symbol since 1994 and later Laque/Premiere variants",
    publishedAt: "2019",
  }),
  sonnetCollector: web({
    key: "phase153-parkercollector-sonnet",
    title: "ParkerCollector — Sonnet history",
    url: "https://www.parkercollector.com/sonnet.html",
    registryKey: "parkercollector-phase153",
    registryName: "ParkerCollector",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "parkercollector-phase153",
    summary: "专业收藏参考页用于交叉核对 Sonnet 1990 年代后期 Laque 与 Premiere 版本边界，不代替当前官方 SKU。",
    locator: "Sonnet introduction in 1994 and late-1990s Laque/Premiere history",
  }),
  care: web({
    key: "phase153-parker-care",
    title: "Parker Fountain Pen Care Guide",
    url: "https://www.parkerpen.com/fountain-pen-care-guides.html",
    registryKey: "parker-official-care-phase153",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official-care-phase153",
    summary: "官方维护指南说明换墨前冲洗、凉水浸泡、转换器上墨、尖朝上存放和维修边界。",
    locator: "How to clean; refill with converter; cartridge change; storage and nib exchange sections",
  }),
  refills: web({
    key: "phase153-parker-refills",
    title: "Parker Refills FAQ",
    url: "https://www.parkerpen.com/support?cfid=refills",
    registryKey: "parker-official-care-phase153",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official-care-phase153",
    summary: "官方 FAQ 给出墨囊和转换器安装、回吸、清洁和存放点尖朝上的步骤。",
    locator: "Refills FAQ; cartridge insert, converter insert, cleaning and storage instructions",
  }),
  jotterDiagram: diagram("phase153-parker-jotter-diagram", "Parker Jotter fountain pen identity boundary", "/images/library/site-original/phase153/parker/jotter.svg", "1954 家族设计、2019 钢笔扩展与 SKU 2030947 的关系"),
  imDiagram: diagram("phase153-parker-im-diagram", "Parker IM family and SKU boundary", "/images/library/site-original/phase153/parker/im.svg", "IM 系列与 finish、尖号、SKU 的边界"),
  sonnetDiagram: diagram("phase153-parker-sonnet-diagram", "Parker Sonnet variant boundary", "/images/library/site-original/phase153/parker/sonnet.svg", "1994 系列起点、钢尖样本与 Ciselé 金尖样本"),
} as const;

const PARKER_SCOPE = "phase153-parker-current-fountain-pens";
const BRAND_SCOPE = "phase153-parker-brand-navigation";

function evidence(key: string, fieldKey: CuratedSpecEvidence["fieldKey"], sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: PARKER_SCOPE, locator, qualifies: true };
}

function claimEvidence(key: string, sourceKey: string, locator: string, scopeKey = PARKER_SCOPE): CuratedClaimEvidence {
  return { key, sourceKey, scopeKey, locator };
}

function makePen(input: {
  key: string;
  entityId: string;
  slug: string;
  name: string;
  title: string;
  markdownFile: string;
  primarySourceKey: string;
  aliases: string[];
  sources: CuratedSource[];
  diagram: CuratedSource;
  summaryClaim: string;
  boundaryClaim: string;
  specValues: Record<string, string>;
  specEvidence: CuratedSpecEvidence[];
  variants: CuratedEntityPack["variants"];
}): CuratedEntityPack {
  return {
    key: input.key,
    entityId: input.entityId,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.title,
    primarySourceKey: input.primarySourceKey,
    depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primarySourceKey })),
    sources: [...input.sources, input.diagram],
    scopes: [{ key: PARKER_SCOPE, scopeKey: PARKER_SCOPE, validFrom: PHASE153_RETRIEVED, productionState: "current", editionScope: `${input.name} 钢笔及本批核实 SKU；其他 writing mode、地区版和历史变体不继承。` }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summaryClaim, factClass: "core", confidence: 0.99, sourceKey: input.primarySourceKey, locator: input.summaryClaim, evidence: [claimEvidence(`${input.key}-identity-evidence`, input.primarySourceKey, input.summaryClaim)] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundaryClaim, factClass: "core", confidence: 0.98, sourceKey: input.primarySourceKey, locator: input.boundaryClaim, evidence: [claimEvidence(`${input.key}-boundary-evidence`, input.primarySourceKey, input.boundaryClaim)] },
      { key: `${input.key}-care`, predicate: "maintenance", objectText: "Parker 官方建议换墨前以凉水冲洗尖和握位，按具体墨囊／转换器接口上墨并在不用时尖朝上存放。", factClass: "core", confidence: 0.99, sourceKey: "phase153-parker-care", locator: "official care guide cleaning and storage sections", evidence: [claimEvidence(`${input.key}-care-evidence`, "phase153-parker-care", "official care guide cleaning and storage sections")] },
    ],
    variants: input.variants,
    spec: { brandEntityId: PHASE153_IDS.brand, values: input.specValues, evidence: input.specEvidence },
    media: [{ key: `${input.key}-primary`, title: `${input.name} 事实示意图（非产品照片）`, sourceKey: input.diagram.key, localPath: input.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: input.diagram.url, usageStatus: "primary" }],
  };
}

const jotter = makePen({
  key: "phase153-parker-jotter-v1",
  entityId: PHASE153_IDS.jotter,
  slug: PHASE153_SLUGS.jotter,
  name: "派克 Parker 乔特 Jotter",
  title: "Parker Jotter 钢笔：2019 扩展与 2030947 样本",
  markdownFile: ".planning/content-research/parker-jotter-phase153.md",
  primarySourceKey: S.jotterOfficial.key,
  aliases: ["Parker Jotter", "Parker Jotter Fountain Pen", "派克乔特", "Jotter Originals Fountain Pen"],
  sources: [S.jotterOfficial, S.jotterHistory, S.jotterReview, S.care, S.refills],
  diagram: S.jotterDiagram,
  summaryClaim: "Parker Jotter 钢笔是 Jotter Originals 在 2019 年加入的 Fountain Pen 模式；2030947 是本页的 Bond Street Black、Medium 不锈钢尖官方样本。",
  boundaryClaim: "Jotter 的圆珠笔按动机构、滚珠笔 refill 和其他颜色不继承 2030947 的钢笔尖与墨囊规格；颜色按 SKU 记录。",
  specValues: { series_name: "Jotter Fountain Pen", release_year: "2019（Jotter Originals 钢笔扩展）", nib: "Medium stainless steel nib（SKU 2030947）", fill_system: "Parker cartridge/converter；随附两支蓝色墨囊", material: "拉丝不锈钢帽、Bond Street Black lacquer barrel、chrome-coated trim", status: "当前／地区库存随 SKU" },
  specEvidence: [evidence("jotter-brand", "brand_entity_id", S.jotterOfficial.key, "official Jotter Fountain Pen item page"), evidence("jotter-series", "series_name", S.jotterOfficial.key, "official product title"), evidence("jotter-release", "release_year", S.jotterHistory.key, "2019 news release"), evidence("jotter-nib", "nib", S.jotterOfficial.key, "Medium stainless steel nib"), evidence("jotter-fill", "fill_system", S.jotterOfficial.key, "two small blue cartridges; fountain pen configuration"), evidence("jotter-material", "material", S.jotterOfficial.key, "finish and cap material fields"), evidence("jotter-status", "status", S.jotterOfficial.key, "current item 2030947 page")],
  variants: [{ key: "jotter-2030947", name: "Bond Street Black Fountain Pen", productCode: "2030947", notes: "官方样本：Medium 不锈钢尖、拉丝不锈钢帽、两支蓝色墨囊。", sourceKey: S.jotterOfficial.key, variantKind: "market_sku" }, { key: "jotter-originals-family", name: "Jotter Originals 其他颜色与 writing mode", notes: "2019 新闻稿确认有八色和 Fountain Pen／Rollerball／Gel 扩展；颜色和模式不并入本页规格。", sourceKey: S.jotterHistory.key, variantKind: "edition_group" }],
});
jotter.claims.push({ key: "phase153-parker-jotter-independent", predicate: "independent_context", objectText: "The Well-Appointed Desk 的独立评测把 Jotter 钢笔记录为 Parker 专用墨囊／转换器结构和细长握位样本；该体验资料不覆盖所有颜色或 SKU。", factClass: "core", confidence: 0.9, sourceKey: S.jotterReview.key, locator: "independent Jotter review filling-system and form observations", evidence: [claimEvidence("phase153-parker-jotter-independent-evidence", S.jotterReview.key, "independent Jotter review filling-system and form observations")] });

const im = makePen({
  key: "phase153-parker-im-v1",
  entityId: PHASE153_IDS.im,
  slug: PHASE153_SLUGS.im,
  name: "派克 Parker IM丽雅",
  title: "Parker IM：现代漆面系列与 SKU 边界",
  markdownFile: ".planning/content-research/parker-im-phase153.md",
  primarySourceKey: S.imOfficial.key,
  aliases: ["Parker IM", "Parker IM Fountain Pen", "Parker IM丽雅", "派克 IM 钢笔"],
  sources: [S.imOfficial, S.imBlue, S.imGrey, S.imReview, S.imPenAddict, S.care, S.refills],
  diagram: S.imDiagram,
  summaryClaim: "Parker IM 是现代漆面日用钢笔系列；官方黑漆镀铬 Fine 样本 1931644 作为本页身份锚点，其他 finish 和尖号按 SKU 分开。",
  boundaryClaim: "1931644 的黑漆、Fine、lacquer on brass 和蓝色墨囊不覆盖 1931647、2213776 或旧 IM Premium 的颜色、饰件、尺寸与附件。",
  specValues: { series_name: "Parker IM Fountain Pen", release_year: "当前系列；本批未确认统一首发年", nib: "Fine stainless steel（SKU 1931644；地区页面可有 Medium）", fill_system: "Parker proprietary cartridge/converter；随附长款蓝色 QUINK 墨囊", material: "黑色 lacquer on brass、chrome-coated trim、stainless steel nib", dimensions: "约 137 mm 闭帽、152 mm 帖帽、12.7 mm 最大直径（旧 IM Premium 样本）", status: "当前／地区 SKU 变化" },
  specEvidence: [evidence("im-brand", "brand_entity_id", S.imOfficial.key, "official IM Fountain Pen page"), evidence("im-series", "series_name", S.imOfficial.key, "official product title"), evidence("im-release", "release_year", S.imOfficial.key, "current page; no launch-year claim"), evidence("im-nib", "nib", S.imOfficial.key, "Fine stainless steel nib"), evidence("im-fill", "fill_system", S.imOfficial.key, "long blue QUINK cartridge and fountain pen configuration"), evidence("im-material", "material", S.imOfficial.key, "black lacquer/chrome and cap material fields"), evidence("im-dimensions", "dimensions", S.imReview.key, "retailer sample dimensions"), evidence("im-status", "status", S.imOfficial.key, "current item 1931644 page")],
  variants: [{ key: "im-1931644", name: "Black lacquer Chrome Trim", productCode: "1931644", notes: "官方 Fine、不锈钢尖样本，随长款蓝色 QUINK 墨囊。", sourceKey: S.imOfficial.key, variantKind: "market_sku" }, { key: "im-1931647", name: "Blue lacquer Chrome Trim", productCode: "1931647", notes: "官方蓝漆样本；finish 与 item number 单独记录。", sourceKey: S.imBlue.key, variantKind: "color" }, { key: "im-2213776", name: "Grey lacquer Gold Trim", productCode: "2213776", notes: "官方灰漆金饰样本；不回填黑漆 SKU 的饰件。", sourceKey: S.imGrey.key, variantKind: "color" }],
});

const sonnet = makePen({
  key: "phase153-parker-sonnet-v1",
  entityId: PHASE153_IDS.sonnet,
  slug: PHASE153_SLUGS.sonnet,
  name: "派克 Parker 卓尔 Sonnet",
  title: "Parker Sonnet：钢尖、Ciselé 与 18K 金尖版本",
  markdownFile: ".planning/content-research/parker-sonnet-phase153.md",
  primarySourceKey: S.sonnetSteel.key,
  aliases: ["Parker Sonnet", "Parker Sonnet Fountain Pen", "派克卓尔", "Parker Sonnet Ciselé"],
  sources: [S.sonnetSteel, S.sonnetCisele, S.sonnetPremium, S.sonnetHistory, S.sonnetCollector, S.care, S.refills],
  diagram: S.sonnetDiagram,
  summaryClaim: "Parker Sonnet 是 1994 年起发展的长期钢笔系列；1931505 不锈钢钢尖和 1931489 Ciselé 18K Gold 是两个官方对照样本。",
  boundaryClaim: "Sonnet 的钢尖、18K 金尖、普通漆面、Ciselé 雕刻银和 Premium finish 必须按 item number 分开；圆珠笔与滚珠笔不继承钢笔规格。",
  specValues: { series_name: "Parker Sonnet Fountain Pen", release_year: "1994（系列起点）", nib: "Stainless steel Medium（1931505）或 18K Gold Fine 页面配置（1931489）", fill_system: "Parker cartridge/converter；具体礼盒附件按 SKU", material: "钢、不锈钢、漆面或 sterling silver Ciselé；金属细节随 variant", status: "当前与历史 SKU 并存" },
  specEvidence: [evidence("sonnet-brand", "brand_entity_id", S.sonnetSteel.key, "official Sonnet Fountain Pen page"), evidence("sonnet-series", "series_name", S.sonnetSteel.key, "official product title"), evidence("sonnet-release", "release_year", S.sonnetHistory.key, "2019 catalogue states Sonnet symbol since 1994"), evidence("sonnet-nib", "nib", S.sonnetCisele.key, "18K Gold Ciselé sample and steel sample comparison"), evidence("sonnet-fill", "fill_system", S.refills.key, "official Parker cartridge/converter instructions"), evidence("sonnet-material", "material", S.sonnetCisele.key, "sterling silver and 18K Gold fields"), evidence("sonnet-status", "status", S.sonnetSteel.key, "current item 1931505 page")],
  variants: [{ key: "sonnet-1931505", name: "Stainless Steel GT", productCode: "1931505", notes: "官方不锈钢帽／笔身、23K 金色细节和不锈钢 Medium 尖。", sourceKey: S.sonnetSteel.key, variantKind: "market_sku" }, { key: "sonnet-1931489", name: "Ciselé Sterling Silver", productCode: "1931489", notes: "官方雕刻 sterling silver、18K Gold 尖样本；页面展示 Fine 配置。", sourceKey: S.sonnetCisele.key, variantKind: "material" }, { key: "sonnet-2119788", name: "Premium Metal & Grey Satin", productCode: "2119788", notes: "官方 Premium 页面列 18K Gold 尖和独立 finish，不并入普通钢尖。", sourceKey: S.sonnetPremium.key, variantKind: "edition_group" }],
});
sonnet.claims.push({ key: "phase153-parker-sonnet-independent", predicate: "independent_context", objectText: "ParkerCollector 的 Sonnet 资料用于交叉核对 1990 年代后期 Laque 与 Premiere 版本边界；收藏参考不替代当前官方 SKU。", factClass: "core", confidence: 0.9, sourceKey: S.sonnetCollector.key, locator: "Sonnet history page, late-1990s Laque/Premiere boundary", evidence: [claimEvidence("phase153-parker-sonnet-independent-evidence", S.sonnetCollector.key, "Sonnet history page, late-1990s Laque/Premiere boundary")] });

function makeBrand(): CuratedEntityPack {
  const existing = phase146ParkerIngenuityUrbanPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE153_IDS.brand);
  if (!existing) throw new Error("Phase 153 Parker prerequisite brand pack is missing.");
  const brand = structuredClone(existing);
  brand.key = "phase153-parker-brand-navigation-v1";
  const sourceMap = new Map(brand.sources.map((source) => [source.key, source]));
  for (const source of [S.jotterOfficial, S.jotterHistory, S.imOfficial, S.imBlue, S.imGrey, S.sonnetSteel, S.sonnetCisele, S.sonnetPremium, S.sonnetHistory]) sourceMap.set(source.key, source);
  brand.sources = [...sourceMap.values()];
  brand.scopes = [...brand.scopes, { key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, validFrom: PHASE153_RETRIEVED, productionState: "current", editionScope: "Parker Jotter、IM、Sonnet 的 Fountain Pen 导航；其他 writing mode 不继承。" }];
  brand.claims = [...brand.claims,
    { key: "phase153-parker-jotter-navigation", predicate: "model_navigation", objectText: "Parker 当前钢笔导航包含 Jotter Fountain Pen；Jotter 的圆珠、滚珠和 Gel 模式保持独立。", factClass: "core", confidence: 0.99, sourceKey: S.jotterOfficial.key, locator: "official Jotter Fountain Pen page", evidence: [claimEvidence("phase153-jotter-navigation-evidence", S.jotterOfficial.key, "official Jotter Fountain Pen page", BRAND_SCOPE)] },
    { key: "phase153-parker-im-navigation", predicate: "model_navigation", objectText: "Parker 当前钢笔导航包含 IM Fountain Pen；finish 和尖号按 SKU 分开，不能将 IM 圆珠或滚珠规格继承到钢笔。", factClass: "core", confidence: 0.99, sourceKey: S.imOfficial.key, locator: "official IM Fountain Pen page", evidence: [claimEvidence("phase153-im-navigation-evidence", S.imOfficial.key, "official IM Fountain Pen page", BRAND_SCOPE)] },
    { key: "phase153-parker-sonnet-navigation", predicate: "model_navigation", objectText: "Parker 当前钢笔导航包含 Sonnet Fountain Pen；钢尖、18K 金尖、Ciselé 和 Premium 作为独立版本维度。", factClass: "core", confidence: 0.99, sourceKey: S.sonnetSteel.key, locator: "official Sonnet Fountain Pen pages", evidence: [claimEvidence("phase153-sonnet-navigation-evidence", S.sonnetSteel.key, "official Sonnet Fountain Pen pages", BRAND_SCOPE)] },
  ];
  return brand;
}

export const phase153ParkerCurrentTrioPacks: CuratedEntityPack[] = [makeBrand(), jotter, im, sonnet];
export const phase153ParkerCurrentTrioPenPacks = [jotter, im, sonnet];
