import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import { phase105PilotCustomUrushiPack } from "./phase105-pilot-custom-urushi";

export const PHASE400_PILOT_ID = "Zt-PbXkE7UHM";
export const PHASE400_URUSHI_ID = "s105PILOT_URUSHI";
export const PHASE400_URUSHI_SLUG = "pilot-custom-urushi";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase400-custom-urushi-current";

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
  publishedAt?: string;
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
    license: input.license,
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const S = {
  exact: source({
    key: "phase400-pilot-urushi-exact",
    registryKey: "pilot-webcatalog-urushi-phase400",
    registryName: "PILOT Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-urushi-phase400",
    title: "カスタムURUSHI FKV-88SR-LFM",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100004091&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "现行日本官方 exact SKU 页列 FKV-88SR-LFM：18K 30 号 FM、エボナイト蝋色漆、CON-40/CON-70N、全长 155 mm、最大径 20 mm、44 g，并列出黑/朱/紺青九个 SKU。",
  }),
  catalogue: source({
    key: "phase400-pilot-urushi-catalogue-pdf",
    registryKey: "pilot-catalogue-urushi-phase400",
    registryName: "PILOT Web Catalog PDF",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-catalogue-urushi-phase400",
    title: "PILOT 万年筆综合目录 PDF（Custom URUSHI）",
    url: "https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016469&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "官方目录页把 FKV-88SR 的黑、朱、紺青与 FM/M/B 组合及 JAN/尺寸/重量列在同一型号下，适合核对 SKU 而不扩大颜色差异。",
  }),
  release: source({
    key: "phase400-pilot-urushi-konjyo-release",
    registryKey: "pilot-press-urushi-konjyo-phase400",
    registryName: "PILOT official press",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-press-urushi-konjyo-phase400",
    title: "万年筆『カスタムURUSHI』新色「紺青」発売",
    url: "https://www.pilot.co.jp/press_release/2024/10/23/urushi.html",
    homepageUrl: "https://www.pilot.co.jp/press_release/",
    publishedAt: "2024-10-23",
    summary:
      "Pilot 2024-10-23 新闻稿说明既有漆黑/朱、新增紺青，写明硬橡胶、蝋色漆、18K 大型 30 号尖及 2024 年 11 月上市。",
  }),
  support: source({
    key: "phase400-pilot-urushi-support",
    registryKey: "pilot-support-urushi-fkv88sr-phase400",
    registryName: "PILOT official support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-support-urushi-fkv88sr-phase400",
    title: "カスタム URUSHI FKV-88SR 使用说明与保管",
    url: "https://www.pilot.co.jp/support/warranty/jp/fountain/custom_urushi.html",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/jp/fountain/",
    summary:
      "官方支持页把 Custom URUSHI 绑定到 FKV-88SR，逐步说明墨囊、CON-40、CON-70N、清水清洗、漆面溶剂/颜料墨水禁忌与不可自行维修。",
  }),
  manual: source({
    key: "phase400-pilot-fountain-manual-jp",
    registryKey: "pilot-fountain-manual-phase400",
    registryName: "PILOT official manual",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-fountain-manual-phase400",
    title: "PILOT 万年筆使用说明书（日文 PDF）",
    url: "https://www.pilot.co.jp/support/manual/fountain/fountain_jp.pdf",
    homepageUrl: "https://www.pilot.co.jp/support/manual/",
    summary:
      "Pilot 通用万年笔说明书补充竖直吸墨、CON-70N 推压五至六次、墨囊直插、Pilot 墨水与漆器颜料墨水边界。",
    itemType: "pdf",
  }),
  converter: source({
    key: "phase400-pilot-con70n",
    registryKey: "pilot-con70n-phase400",
    registryName: "PILOT Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-con70n-phase400",
    title: "CON-70N 推式转换器",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100002533&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "官方 CON-70N 页面列推压式、80 mm、约 1.1 ml，并提示适用于 Pilot cartridge-ink fountain pens；兼容性仍以具体型号页为准。",
  }),
  customSite: source({
    key: "phase400-pilot-custom-site",
    registryKey: "pilot-custom-site-urushi-phase400",
    registryName: "PILOT CUSTOM official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-custom-site-urushi-phase400",
    title: "CUSTOM 系列最高级型号介绍（CUSTOM URUSHI）",
    url: "https://www.pilot-custom.jp/en/lineup/highclass.html",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    summary:
      "Pilot CUSTOM 英文专题把 FKV-88SR 置于蝋色漆/硬橡胶传统中，列 18K No.30、FM/M/B，并将 845 的 No.15 单独列出。",
  }),
  gentleman2026: source({
    key: "phase400-gentleman-stationer-custom-overview",
    registryKey: "gentleman-stationer-custom-overview-phase400",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer-custom-overview-phase400",
    title: "The Pilot Custom Series: An Overview",
    url: "https://www.gentlemanstationer.com/blog/2026/3/14/pilot-custom-series-an-overview-of-some-of-my-favorite-fountain-pens",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "The Gentleman Stationer",
    publishedAt: "2026-03-14",
    summary:
      "专业零售商的 2026 年横向文章把 Custom Urushi 与 823/845/743/912 并排比较，强调 No.30、体量、漆工艺和主观手感应与规格分开。",
  }),
  goulet: source({
    key: "phase400-goulet-custom-overview",
    registryKey: "goulet-custom-overview-phase400",
    registryName: "Goulet Pen Company",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "goulet-custom-overview-phase400",
    title: "Pilot Custom Pens Explained",
    url: "https://www.gouletpens.com/blogs/fountain-pen-blog/pilot-custom-pens-explained",
    homepageUrl: "https://www.gouletpens.com/",
    author: "Goulet Pen Company",
    summary:
      "专业经销商资料以 2016 为 Custom Urushi 型号起点的资料锚，描述 No.30、硬橡胶漆面、c/c 与约 43 g；年份和体验保留为二手资料层级。",
  }),
  gentlemanReview: source({
    key: "phase400-gentleman-stationer-urushi-review",
    registryKey: "gentleman-stationer-urushi-review-phase400",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer-urushi-review-phase400",
    title: "Ultra Luxury Options: The Pilot Custom Urushi Fountain Pen",
    url: "https://www.gentlemanstationer.com/blog/2021/7/3/ultra-luxury-options-the-pilot-custom-urushi-fountain-pen",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "Joe Crace",
    publishedAt: "2021-07-03",
    summary:
      "独立专业评测以实物交叉核对 oversized ebonite、urushi、No.30 18K 和 cartridge/converter；笔感只归于作者，不写成普遍承诺。",
  }),
  lensky: source({
    key: "phase400-lenskiy-urushi-review",
    registryKey: "lenskiy-urushi-review-phase400",
    registryName: "Andrew Lensky",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "lenskiy-urushi-review-phase400",
    title: "(modern) Pilot Custom Urushi Vermillion",
    url: "https://lenskiy.org/2024/07/modern-pilot-custom-urushi-vermillion/",
    homepageUrl: "https://lenskiy.org/",
    author: "Andrew Lensky",
    publishedAt: "2024-07-07",
    summary:
      "独立实物记录展示 FKV-88SR-R-FM、18K 750、30 号刻字与漆杆使用语境；页面受访问限制，故只保留链接和已核对的型号级摘要。",
  }),
  diagram: source({
    key: "phase400-pilot-urushi-svg",
    registryKey: "fountain-pen-graph-editorial-phase400",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase400",
    title: "Pilot Custom URUSHI 事实示意图（非产品照片）",
    url: "/images/library/site-original/pilot/custom-urushi.svg",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    summary:
      "本站原创 factual SVG，帮助读者辨认 No.30、硬橡胶蝋色漆与 cartridge/converter；示意图，不是产品照片、比例图或颜色校样。",
    allowedUse: "store_full",
    license: "site-original",
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
    confidence: factClass === "core" ? 0.99 : 0.94,
    sourceKey: primary.key,
    locator,
    evidence: [primary, ...extra].map((item, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: item.key,
      scopeKey: SCOPE,
      locator: index === 0 ? locator : item.summary,
    })),
  };
}

function specEvidence(
  key: string,
  fieldKey: CuratedSpecEvidence["fieldKey"],
  sourceItem: CuratedSource,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey: sourceItem.key, scopeKey: SCOPE, locator, qualifies: true };
}

const pack: CuratedEntityPack = {
  ...structuredClone(phase105PilotCustomUrushiPack),
  key: "phase400-pilot-custom-urushi-refresh-v1",
  entityId: PHASE400_URUSHI_ID,
  expectedSlug: PHASE400_URUSHI_SLUG,
  canonicalName: "百乐 Pilot Custom URUSHI",
  markdownFile: ".planning/content-research/pilot-custom-urushi-phase400.md",
  storyTitle: "Pilot Custom URUSHI：FKV-88SR 的 No.30 笔尖、蝋色漆与九个现行 SKU",
  primarySourceKey: S.exact.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot Custom URUSHI", language: "en", sourceKey: S.exact.key },
    { alias: "カスタム URUSHI", language: "ja", sourceKey: S.release.key },
    { alias: "FKV-88SR", language: "und", sourceKey: S.support.key },
    { alias: "Pilot Custom Urushi", language: "en", sourceKey: S.gentleman2026.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Pilot Japan current FKV-88SR listing, with secondary history and sibling comparison",
      nibScope: "18K No.30；官方当前列 FM、M、B，‘soft’ 是产品定位，不等于可重压 flex 改尖",
      materialScope: "帽与轴为切削硬橡胶并施蝋色漆；颜色与尖幅分别按 FKV-88SR SKU 记录",
      editionScope: "Custom URUSHI fountain pen；不吸收 Custom 845、823、743、912 或同名非钢笔产品",
    },
  ],
  claims: [
    claim(
      "phase400-identity",
      "model_identity",
      "Pilot Custom URUSHI 是官方产品号 FKV-88SR 的独立钢笔型号；Pilot 支持页、当前 Web Catalog 与 CUSTOM 专题都将它与 Custom 845 分开列示。",
      S.exact,
      "current exact page title, product code FKV-88SR-LFM and line-up",
      [S.support, S.customSite],
    ),
    claim(
      "phase400-construction",
      "construction",
      "当前 FKV-88SR 以切削硬橡胶（ebonite）作帽与轴的基材，再施蝋色漆；它的辨识重点是漆杆材质与 No.30 尖的组合，而不是泛称‘Pilot 漆笔’。",
      S.exact,
      "official material table: ebonite cap/barrel and 蝋色漆仕上",
      [S.release, S.customSite, S.gentlemanReview],
    ),
    claim(
      "phase400-nib",
      "nib_boundary",
      "官方当前列 18K 30 号尖，FM、M、B 三种尖幅；官方专题称其为软触感，专业资料记录弹性与出墨体验，但实际线条仍受尖幅、纸张、墨水和个体调校影响。",
      S.exact,
      "18K 30号 FM exact item and FM/M/B line-up",
      [S.customSite, S.goulet, S.gentleman2026],
    ),
    claim(
      "phase400-size",
      "current_dimensions",
      "当前日本官方 SKU 页给出全长 155 mm、最大径 φ20 mm、重量 44 g；这些数字属于 FKV-88SR 当前目录范围，不把零售商对旧批次或未注明是否含帽的测量扩大为统一值。",
      S.exact,
      "official size and weight table",
      [S.catalogue, S.goulet],
    ),
    claim(
      "phase400-filling",
      "filling_system",
      "FKV-88SR 是 Pilot 墨囊／转换器路线，官方列出 CON-40 与 CON-70N，当前页标明随附 CON-70N；它不是 Custom 823 的真空上墨结构。",
      S.support,
      "official cartridge, CON-40 and CON-70N instructions",
      [S.exact, S.converter, S.gentleman2026],
    ),
    claim(
      "phase400-sku-boundary",
      "sku_boundary",
      "当前目录把漆黑、朱、紺青作为 FKV-88SR 的颜色组，每组各有 FM、M、B；颜色不改变型号身份，产品号仍应写到 B/R/L 前缀与尖幅。",
      S.catalogue,
      "official PDF line-up and JAN table for B/R/L FM/M/B",
      [S.exact, S.release],
    ),
    claim(
      "phase400-konjyo",
      "release_history",
      "Pilot 2024 年 10 月 23 日发布紺青，说明该色于 2024 年 11 月上市；它是既有 Custom URUSHI 的颜色 variant，不是新平台或新型号。",
      S.release,
      "2024-10-23 press release product overview",
      [S.catalogue],
    ),
    claim(
      "phase400-urushi-tradition",
      "finish_context",
      "Pilot CUSTOM 专题把这条线放在公司沿用的 Luccanite 漆工艺语境中：漆施于加工硬橡胶，形成黑色高光触感；具体颜色仍以当前 SKU 页为准，不把工艺介绍写成每支笔的手工工序证明。",
      S.customSite,
      "official CUSTOM site Luccanite and lacquered ebonite description",
      [S.release],
    ),
    claim(
      "phase400-history-boundary",
      "history_boundary",
      "Goulet 的专业系列资料以 2016 作为 Custom Urushi 型号起点；Pilot 当前官方页未在产品表直接给出上市年份，因此年份应标为二手资料锚点，而不能当作官方生产批次规则。",
      S.goulet,
      "professional series overview launch-year statement",
      [S.customSite],
    ),
    claim(
      "phase400-sibling-boundary",
      "sibling_boundary",
      "Custom 845 使用 18K No.15、与 URUSHI 同属漆杆语境；Custom 823 使用 No.15 与 vacuum/plunger；743 使用 No.15 c/c；912 使用 No.10。它们可以作为选购参照，但不能互换笔尖、尺寸或补墨规格。",
      S.gentleman2026,
      "professional side-by-side Custom overview and sibling filling/nib comparison",
      [S.goulet, S.exact],
    ),
    claim(
      "phase400-care",
      "maintenance_boundary",
      "Pilot 要求长期停用前排尽墨水，用清水多次吸排清洁；帽和轴不可浸洗，不要自行维修，避开直射日光、高低温、酒精等溶剂和强烈冲击。漆制品不可使用 Pilot 颜料墨水‘强色’。",
      S.support,
      "official care, storage and solvent/pigment-ink warnings",
      [S.manual],
    ),
    claim(
      "phase400-writing-selection",
      "selection_guidance",
      "专业资料反复把体量、No.30 软弹触感和价格列为购买前要确认的条件；是否适合某只手、某种纸张或长时间携带，只能通过实际试写与个人偏好判断，不能写成型号承诺。",
      S.gentlemanReview,
      "professional review and 2026 Custom comparison selection boundary",
      [S.gentleman2026, S.goulet],
      "editorial",
    ),
    claim(
      "phase400-media-boundary",
      "media_identity_boundary",
      "本站主图只用来解释硬橡胶、漆杆、No.30 与 c/c 的关系；它明确标注为事实示意图，不是产品照片、比例图、颜色校样或真伪鉴定图。",
      S.diagram,
      "site-original SVG attribution and non-product-photo boundary",
      [],
      "editorial",
    ),
  ],
  variants: [
    { key: "phase400-urushi-black", name: "漆黑颜色组", productCode: "FKV-88SR-B", releaseYear: "现行", notes: "官方当前目录的黑色 edition group；FM、M、B 子 SKU 另列。", sourceKey: S.exact.key, variantKind: "edition_group", market: "Pilot Japan" },
    { key: "phase400-urushi-vermilion", name: "朱颜色组", productCode: "FKV-88SR-R", releaseYear: "现行", notes: "官方当前目录的朱色 edition group；FM、M、B 子 SKU 另列。", sourceKey: S.exact.key, variantKind: "edition_group", market: "Pilot Japan" },
    { key: "phase400-urushi-konjyo", name: "紺青颜色组", productCode: "FKV-88SR-L", releaseYear: "2024-11", notes: "2024 年 11 月新增的深蓝 edition group；FM、M、B 子 SKU 另列。", sourceKey: S.release.key, variantKind: "edition_group", market: "Pilot Japan" },
    { key: "phase400-urushi-bfm", name: "漆黑 FM", productCode: "FKV-88SR-BFM", releaseYear: "现行", notes: "漆黑 18K No.30 FM；产品号写到尖幅。", sourceKey: S.catalogue.key, variantKind: "market_sku", parentVariantKey: "phase400-urushi-black", market: "Pilot Japan" },
    { key: "phase400-urushi-bm", name: "漆黑 M", productCode: "FKV-88SR-BM", releaseYear: "现行", notes: "漆黑 18K No.30 M。", sourceKey: S.catalogue.key, variantKind: "market_sku", parentVariantKey: "phase400-urushi-black", market: "Pilot Japan" },
    { key: "phase400-urushi-bb", name: "漆黑 B", productCode: "FKV-88SR-BB", releaseYear: "现行", notes: "漆黑 18K No.30 B。", sourceKey: S.catalogue.key, variantKind: "market_sku", parentVariantKey: "phase400-urushi-black", market: "Pilot Japan" },
    { key: "phase400-urushi-rfm", name: "朱 FM", productCode: "FKV-88SR-RFM", releaseYear: "现行", notes: "朱 18K No.30 FM。", sourceKey: S.catalogue.key, variantKind: "market_sku", parentVariantKey: "phase400-urushi-vermilion", market: "Pilot Japan" },
    { key: "phase400-urushi-rm", name: "朱 M", productCode: "FKV-88SR-RM", releaseYear: "现行", notes: "朱 18K No.30 M。", sourceKey: S.catalogue.key, variantKind: "market_sku", parentVariantKey: "phase400-urushi-vermilion", market: "Pilot Japan" },
    { key: "phase400-urushi-rb", name: "朱 B", productCode: "FKV-88SR-RB", releaseYear: "现行", notes: "朱 18K No.30 B。", sourceKey: S.catalogue.key, variantKind: "market_sku", parentVariantKey: "phase400-urushi-vermilion", market: "Pilot Japan" },
    { key: "phase400-urushi-lfm", name: "紺青 FM", productCode: "FKV-88SR-LFM", releaseYear: "2024-11", notes: "紺青 18K No.30 FM；当前 exact SKU 页。", sourceKey: S.exact.key, variantKind: "market_sku", parentVariantKey: "phase400-urushi-konjyo", market: "Pilot Japan" },
    { key: "phase400-urushi-lm", name: "紺青 M", productCode: "FKV-88SR-LM", releaseYear: "2024-11", notes: "紺青 18K No.30 M。", sourceKey: S.exact.key, variantKind: "market_sku", parentVariantKey: "phase400-urushi-konjyo", market: "Pilot Japan" },
    { key: "phase400-urushi-lb", name: "紺青 B", productCode: "FKV-88SR-LB", releaseYear: "2024-11", notes: "紺青 18K No.30 B。", sourceKey: S.exact.key, variantKind: "market_sku", parentVariantKey: "phase400-urushi-konjyo", market: "Pilot Japan" },
  ],
  spec: {
    brandEntityId: PHASE400_PILOT_ID,
    values: {
      series_name: "Pilot Custom URUSHI / FKV-88SR",
      release_year: "2016（专业资料型号起点）；2024-11 紺青新增",
      origin_country: "日本；Pilot CUSTOM 专题的 Made-entirely-in-Japan 语境，具体批次仍按官方资料核对",
      nib: "18K No.30；当前 FM、M、B；官方称大型 soft nib",
      fill_system: "Pilot cartridge/converter；CON-40、CON-70N；当前页随附 CON-70N",
      material: "切削硬橡胶（ebonite）帽与轴，蝋色漆仕上",
      dimensions: "全长 155 mm；最大径 φ20 mm",
      weight: "44 g",
      price_range: "日本官方当前页：含税 ¥165,000／税前 ¥150,000；价格随地区和时间变化",
      status: "当前 FKV-88SR；漆黑、朱、紺青三色组，FM/M/B 九个 SKU",
    },
    evidence: [
      specEvidence("phase400-spec-brand", "brand_entity_id", S.exact, "official Pilot product catalogue identity"),
      specEvidence("phase400-spec-series", "series_name", S.exact, "official exact product title and FKV-88SR code"),
      specEvidence("phase400-spec-release", "release_year", S.release, "2024-10-23 release month and professional 2016 boundary"),
      specEvidence("phase400-spec-origin", "origin_country", S.customSite, "official CUSTOM site made-entirely-in-Japan context"),
      specEvidence("phase400-spec-nib", "nib", S.exact, "18K 30号 and FM/M/B line-up"),
      specEvidence("phase400-spec-fill", "fill_system", S.exact, "CON-40/CON-70N and included CON-70N"),
      specEvidence("phase400-spec-material", "material", S.exact, "ebonite and 蝋色漆 material table"),
      specEvidence("phase400-spec-dimensions", "dimensions", S.exact, "155 mm and maximum φ20 mm"),
      specEvidence("phase400-spec-weight", "weight", S.exact, "44 g official weight"),
      specEvidence("phase400-spec-price", "price_range", S.exact, "¥165,000 tax-included / ¥150,000 pre-tax"),
      specEvidence("phase400-spec-status", "status", S.catalogue, "current B/R/L FM/M/B SKU table"),
    ],
  },
  media: [
    {
      key: "phase400-pilot-urushi-primary-svg",
      title: "Pilot Custom URUSHI 事实示意图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、漆色、光泽、刻字、笔尖或任何批次。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase400-urushi-model-origin",
      title: "Custom Urushi 型号进入 Pilot Custom 最高级路线",
      eventType: "model_released",
      startDate: "2016",
      circa: true,
      description: "Goulet 的专业系列资料把 Custom Urushi 标为 2016 年起的型号；Pilot 当前产品页未给出精确上市日，故保留为二手资料时间锚。",
      sourceKey: S.goulet.key,
    },
    {
      key: "phase400-urushi-konjyo-release",
      title: "Custom URUSHI 新增紺青",
      eventType: "model_released",
      startDate: "2024-11",
      circa: false,
      description: "Pilot 2024-10-23 新闻稿宣布紺青作为既有漆黑、朱之外的新色，上市月为 2024 年 11 月。",
      sourceKey: S.release.key,
    },
  ],
  conflicts: [],
};

export const phase400PilotCustomUrushiRefreshPacks: CuratedEntityPack[] = [pack];
