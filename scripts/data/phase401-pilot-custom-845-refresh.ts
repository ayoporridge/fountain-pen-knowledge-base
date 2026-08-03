import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import { phase60PilotP0Packs } from "./phase60-pilot-p0";

export const PHASE401_PILOT_ID = "Zt-PbXkE7UHM";
export const PHASE401_CUSTOM_845_ID = "2_L9OS-kqqQV";
export const PHASE401_CUSTOM_845_SLUG = "pilot-custom-845";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase401-pilot-custom-845-current";

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
    key: "phase401-pilot-845-exact-sku",
    registryKey: "pilot-webcatalog-845-phase401",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-845-phase401",
    title: "FKV-5MR-B-F｜カスタム845｜PILOTウェブカタログ",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000103&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "当前日本官方 exact SKU 页列出 FKV-5MR-B-F：漆黑 F、18K No.15、硬橡胶蝋色漆、CON-40/CON-70N、全长 147 mm、最大径 15.9 mm、重量 28 g、含税建议零售价 132,000 日元，并展开三色四尖幅 lineup。",
  }),
  support: source({
    key: "phase401-pilot-845-support",
    registryKey: "pilot-support-845-phase401",
    registryName: "PILOT official support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-support-845-phase401",
    title: "カスタム 845 FKV-5MR 使用说明与保管",
    url: "https://www.pilot.co.jp/support/warranty/jp/fountain/custom845.html",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/jp/fountain/",
    summary:
      "官方支持页把 Custom 845 绑定到 FKV-5MR，说明 Pilot 墨囊、CON-40、CON-70N、清水吸排、漆面溶剂禁忌和不可自行维修边界。",
  }),
  history: source({
    key: "phase401-pilot-custom-history",
    registryKey: "pilot-custom-history-phase401",
    registryName: "PILOT CUSTOM official",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-custom-history-phase401",
    title: "PILOT CUSTOM History",
    url: "https://www.pilot-custom.jp/en/history/",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    summary:
      "官方历史将 CUSTOM845 FKV-5MR 放在 2002 年，并说明其与公司早期加工硬橡胶上漆传统的关系；同时区分 823、743 与 2016 年 URUSHI。",
  }),
  highclass: source({
    key: "phase401-pilot-custom-highclass",
    registryKey: "pilot-custom-highclass-phase401",
    registryName: "PILOT CUSTOM official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-custom-highclass-phase401",
    title: "Representing the pinnacle of PILOT’s black glossy lacquer finish series",
    url: "https://www.pilot-custom.jp/en/lineup/highclass.html",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    summary:
      "官方最高级型号页把 845 与 URUSHI 放在蝋色漆/加工硬橡胶路线中，同时保持 No.15 与 No.30 的型号边界。",
  }),
  manual: source({
    key: "phase401-pilot-fountain-manual",
    registryKey: "pilot-fountain-manual-phase401",
    registryName: "PILOT official manual",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-fountain-manual-phase401",
    title: "PILOT Fountain Pen Manual",
    url: "https://www.pilot.co.jp/support/manual/fountain/fountain_jp.pdf",
    homepageUrl: "https://www.pilot.co.jp/support/manual/",
    summary:
      "Pilot 通用万年笔说明书补充竖直吸墨、CON-70N 推压和清水清洗边界；漆面专属警告仍以 Custom 845 支持页为准。",
    itemType: "pdf",
  }),
  priceHistory: source({
    key: "phase401-pilot-845-price-history",
    registryKey: "pilot-price-list-2024-phase401",
    registryName: "PILOT official information",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-price-list-2024-phase401",
    title: "価格改定表 2024.10.01",
    url: "https://www.pilot.co.jp/information/price-list20241001.pdf",
    homepageUrl: "https://www.pilot.co.jp/information/",
    summary:
      "官方历史价格表只用于说明价格会随时间调整，不覆盖当前 FKV-5MR-B-F SKU 页的 132,000 日元数字。",
    itemType: "pdf",
  }),
  gouletOverview: source({
    key: "phase401-goulet-custom-overview",
    registryKey: "goulet-custom-overview-phase401",
    registryName: "Goulet Pen Company",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "goulet-custom-overview-phase401",
    title: "Pilot Custom Pens Explained",
    url: "https://www.gouletpens.com/blogs/fountain-pen-blog/pilot-custom-pens-explained",
    homepageUrl: "https://www.gouletpens.com/",
    author: "Goulet Pen Company",
    summary:
      "专业零售商资料用于比较 Custom 845、823、743、742 与 URUSHI 的尖号、材质和供墨，不替代官方 SKU 数字。",
  }),
  gouletProduct: source({
    key: "phase401-goulet-845-product",
    registryKey: "goulet-845-product-phase401",
    registryName: "Goulet Pen Company",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "goulet-845-product-phase401",
    title: "Pilot Custom 845 Urushi Fountain Pen - Black",
    url: "https://www.gouletpens.com/products/pilot-custom-845-urushi-fountain-pen-black",
    homepageUrl: "https://www.gouletpens.com/",
    author: "Goulet Pen Company",
    summary:
      "经销商产品页补充当前海外商品名称、漆杆与 C/C 使用语境；颜色、库存和评价只保留为市场次级资料。",
  }),
  gentleman: source({
    key: "phase401-gentleman-custom-overview",
    registryKey: "gentleman-custom-overview-phase401",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-custom-overview-phase401",
    title: "The Pilot Custom Series: An Overview",
    url: "https://www.gentlemanstationer.com/blog/2026/3/14/pilot-custom-series-an-overview-of-some-of-my-favorite-fountain-pens",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "The Gentleman Stationer",
    publishedAt: "2026-03-14",
    summary:
      "专业横向文章把 845 视为 Pilot Urushi 路线的入口之一，并与 823、URUSHI 等型号比较体量、颜色和购买取向。",
  }),
  fpn: source({
    key: "phase401-fpn-845-review",
    registryKey: "fpn-845-review-phase401",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    independenceGroup: "fpn-845-review-phase401",
    title: "Pilot Custom 845 Fountain Pen Review",
    url: "https://www.fountainpennetwork.com/forum/topic/58403-pilot-custom-845/",
    homepageUrl: "https://www.fountainpennetwork.com/",
    author: "Fountain Pen Network member review",
    summary:
      "早期实物评测提供漆杆、尺寸和书写观察，只作为社区样本记录，不覆盖当前价格、颜色库存或原厂批次。",
  }),
  scrively: source({
    key: "phase401-scrively-845-review",
    registryKey: "scrively-845-review-phase401",
    registryName: "Scrively",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "scrively-845-review-phase401",
    title: "Video Review: Pilot Custom 845 Urushi",
    url: "https://scrively.org/video-review-pilot-custom-845-urushi/",
    homepageUrl: "https://scrively.org/",
    author: "Scrively",
    summary:
      "独立试写页面用于补充握持、漆面和使用过程观察，主观感受不写成所有 845 的普遍保证。",
  }),
  diagram: source({
    key: "phase401-pilot-845-svg",
    registryKey: "fountain-pen-graph-editorial-phase401",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase401",
    title: "Pilot Custom 845 事实示意图（非产品照片）",
    url: "/images/library/site-original/pilot-p0/custom-845.svg",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    summary:
      "本站原创 factual SVG 只解释 18K No.15、蝋色漆和 cartridge/converter；明确不是产品照片、比例图或颜色校样。",
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

const base = phase60PilotP0Packs.find(
  (pack) => pack.entityId === PHASE401_CUSTOM_845_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 60 Pilot Custom 845 prerequisite missing.");

const colorGroups = [
  { key: "black", label: "漆黑", code: "B" },
  { key: "vermilion", label: "朱", code: "R" },
  { key: "konjyo", label: "紺青", code: "L" },
] as const;
const nibs = ["F", "M", "B", "BB"] as const;
const variants: CuratedVariant[] = colorGroups.flatMap((color) => [
  {
    key: `phase401-845-${color.key}`,
    name: `${color.label}颜色组`,
    productCode: `FKV-5MR-${color.code}`,
    releaseYear: "现行",
    notes: `官方当前目录的 ${color.label} edition group；F、M、B、BB 子 SKU 另列。颜色不产生新的钢笔实体。`,
    sourceKey: S.exact.key,
    variantKind: "edition_group",
    market: "Pilot Japan",
  },
  ...nibs.map((nib) => ({
    key: `phase401-845-${color.key}-${nib.toLowerCase()}`,
    name: `${color.label} ${nib} 尖`,
    productCode: `FKV-5MR-${color.code}-${nib}`,
    releaseYear: "现行",
    notes: `当前官方 lineup 的 ${color.label} ${nib} 尖 SKU；尺寸和价格不因未单独展开的页面而外推。`,
    sourceKey: S.exact.key,
    variantKind: "market_sku" as const,
    parentVariantKey: `phase401-845-${color.key}`,
    market: "Pilot Japan",
  })),
]);

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase401-pilot-custom-845-refresh-v1",
  entityId: PHASE401_CUSTOM_845_ID,
  expectedSlug: PHASE401_CUSTOM_845_SLUG,
  canonicalName: "百乐 Pilot Custom 845",
  markdownFile: ".planning/content-research/pilot-custom-845-phase401.md",
  storyTitle: "Pilot Custom 845：FKV-5MR 的 No.15、蝋色漆与十二个当前 SKU",
  primarySourceKey: S.exact.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot Custom 845", language: "en", sourceKey: S.exact.key },
    { alias: "PILOT CUSTOM 845", language: "en", sourceKey: S.exact.key },
    { alias: "カスタム845", language: "ja", sourceKey: S.support.key },
    { alias: "FKV-5MR", language: "und", sourceKey: S.support.key },
    { alias: "百乐 845", language: "zh", sourceKey: S.gentleman.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Pilot Japan current FKV-5MR listing, with official history and professional sibling comparison",
      nibScope: "18K No.15；官方当前 lineup 为 F、M、B、BB；实际写感仍受单支调校影响",
      materialScope: "帽与轴为切削硬橡胶并施蝋色漆；颜色和尖幅按 SKU 下沉",
      editionScope: "Custom 845 fountain pen；不吸收 Custom URUSHI、823、743、742、912 或同名非钢笔产品",
    },
  ],
  claims: [
    claim(
      "phase401-identity",
      "model_identity",
      "Pilot Custom 845 是官方产品号 FKV-5MR 的独立钢笔型号；当前 Web Catalog 以 FKV-5MR-B-F 为 exact SKU，并把其他颜色与尖幅留在同一产品族下。",
      S.exact,
      "current exact page title, product code and lineup",
      [S.support, S.history],
    ),
    claim(
      "phase401-history",
      "release_history",
      "PILOT CUSTOM 官方历史将 CUSTOM845 FKV-5MR 放在 2002 年，并说明它帮助延续公司早期在加工硬橡胶上施漆的传统；这是型号历史节点，不是每支实物的生产批次证明。",
      S.history,
      "2002 CUSTOM845 FKV-5MR timeline entry",
      [S.highclass],
    ),
    claim(
      "phase401-material",
      "construction",
      "当前官方 SKU 以 ebonite 作帽与轴的基材，再施蝋色漆完成；硬橡胶、漆面与金色饰件是 845 的产品识别组合，不能泛化成所有黑色 Pilot 的材质。",
      S.exact,
      "official material table: ebonite and 蝋色漆仕上げ",
      [S.highclass, S.gouletProduct],
    ),
    claim(
      "phase401-nib",
      "nib_boundary",
      "官方当前页面列 18K No.15，并展开 F、M、B、BB 四种尖幅；线宽和实际反馈仍受纸张、墨水、握笔和单支调校影响，不能把专业试写变成普遍保证。",
      S.exact,
      "18K 15号 field and F/M/B/BB lineup",
      [S.gentleman, S.fpn],
    ),
    claim(
      "phase401-filling",
      "filling_system",
      "FKV-5MR 采用 Pilot 墨囊／转换器路线，官方支持列出 CON-40 与 CON-70N，当前 FKV-5MR-B-F 页面标明随附 CON-70N；它不是 Custom 823 的真空结构。",
      S.support,
      "official cartridge, CON-40 and CON-70N instructions",
      [S.exact, S.history],
    ),
    claim(
      "phase401-sku",
      "sku_boundary",
      "当前官方 lineup 为漆黑、朱、紺青三组颜色，每组各有 F、M、B、BB；颜色组只是同一 FKV-5MR 型号下的 edition，完整产品号仍应写到颜色前缀和尖幅。",
      S.exact,
      "official lineup links FKV-5MR-B/R/L with F/M/B/BB",
      [S.gentleman],
    ),
    claim(
      "phase401-size",
      "current_dimensions",
      "当前日本官方 FKV-5MR-B-F SKU 给出全长 147 mm、最大径 φ15.9 mm、重量 28 g；这些数字只作用于该 exact SKU，不外推到所有颜色、尖幅或加装附件。",
      S.exact,
      "official size and weight table",
      [S.fpn],
    ),
    claim(
      "phase401-price",
      "current_price_scope",
      "当前 FKV-5MR-B-F 的日本官方建议零售价为含税 ¥132,000、税前 ¥120,000；价格会随时间、地区、库存和 SKU 改变，历史价格表不覆盖当前页面。",
      S.exact,
      "official current list price and exact SKU scope",
      [S.priceHistory],
    ),
    claim(
      "phase401-urushi-boundary",
      "sibling_boundary",
      "Custom URUSHI 是 FKV-88SR、18K No.30 的独立型号；它与 845 同属硬橡胶漆面语境，却不能共享尺寸、重量、尖号或写感承诺。",
      S.highclass,
      "official highclass page separates CUSTOM URUSHI and CUSTOM845",
      [S.history, S.gentleman],
    ),
    claim(
      "phase401-823-boundary",
      "sibling_boundary",
      "Custom 823 是 FKK-3MRP 的 plunger／vacuum 结构；845 的 C/C 供墨不可写成 823 的漆面版本，也不能把真空尾杆清洗方法移植过来。",
      S.history,
      "official history 2000 CUSTOM823 entry",
      [S.gouletOverview],
    ),
    claim(
      "phase401-743-boundary",
      "sibling_boundary",
      "Custom 743 虽然也采用 No.15，但属于独立的树脂杆 C/C 型号；742 和 Custom Heritage 912 也各有独立产品号，不能因 Custom 名称相近而并入 845。",
      S.gouletOverview,
      "professional Custom sibling comparison",
      [S.history, S.exact],
    ),
    claim(
      "phase401-care",
      "maintenance_boundary",
      "Pilot 要求长期停用前排尽墨水，用清水多次吸排；避免高低温、直射日光、酒精与强溶剂，不要清洗帽和轴或自行维修。漆制品不可使用 Pilot 颜料墨水强色。",
      S.support,
      "official care, storage and solvent/pigment-ink warnings",
      [S.manual],
    ),
    claim(
      "phase401-selection",
      "selection_guidance",
      "845 适合把漆杆质感、No.15 金尖和可换墨结构放在一起考虑的使用者；想要大容量应比较 823，想要 No.30 和更大体量应比较 URUSHI，最终写感应以试写为准。",
      S.gentleman,
      "professional series selection comparison",
      [S.gouletOverview, S.scrively],
      "editorial",
    ),
    claim(
      "phase401-media",
      "media_identity_boundary",
      "本站主图是原创事实示意图，标注 18K No.15、蝋色漆和 C/C；它不是产品照片、比例图、颜色校样或真伪鉴定图。",
      S.diagram,
      "site-original SVG attribution and non-product-photo boundary",
      [],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE401_PILOT_ID,
    values: {
      series_name: "Pilot Custom 845 / FKV-5MR",
      release_year: "2002（PILOT CUSTOM 官方历史）",
      origin_country: "日本 Pilot CUSTOM 产品线；具体批次按官方资料和实物核对",
      nib: "18K No.15；当前官方 lineup：F、M、B、BB",
      fill_system: "Pilot 墨囊、CON-40 或 CON-70N；当前 FKV-5MR-B-F 随附 CON-70N",
      material: "切削硬橡胶（ebonite）帽与轴，蝋色漆仕上",
      dimensions: "当前 FKV-5MR-B-F SKU：全长 147 mm；最大径 φ15.9 mm",
      weight: "当前 FKV-5MR-B-F SKU：28 g",
      price_range: "当前日本官方 FKV-5MR-B-F：含税 ¥132,000／税前 ¥120,000；不外推至其他 SKU",
      status: "当前 FKV-5MR；漆黑、朱、紺青三组 × F/M/B/BB 十二个市场 SKU",
    },
    evidence: [
      specEvidence("phase401-spec-brand", "brand_entity_id", S.exact, "official Pilot product context"),
      specEvidence("phase401-spec-series", "series_name", S.exact, "official title and FKV-5MR code"),
      specEvidence("phase401-spec-release", "release_year", S.history, "2002 CUSTOM845 timeline entry"),
      specEvidence("phase401-spec-origin", "origin_country", S.highclass, "official CUSTOM Japan product context"),
      specEvidence("phase401-spec-nib", "nib", S.exact, "18K No.15 and F/M/B/BB lineup"),
      specEvidence("phase401-spec-fill", "fill_system", S.exact, "CON-40/CON-70N and included CON-70N"),
      specEvidence("phase401-spec-material", "material", S.exact, "ebonite and 蝋色漆 material table"),
      specEvidence("phase401-spec-dimensions", "dimensions", S.exact, "147 mm and maximum φ15.9 mm"),
      specEvidence("phase401-spec-weight", "weight", S.exact, "28 g official weight"),
      specEvidence("phase401-spec-price", "price_range", S.exact, "¥132,000 tax-included / ¥120,000 pre-tax"),
      specEvidence("phase401-spec-status", "status", S.exact, "current B/R/L F/M/B/BB SKU lineup"),
    ],
  },
  media: [
    {
      key: "phase401-pilot-845-primary-svg",
      title: "Pilot Custom 845 事实示意图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、漆色、刻字、笔尖或任何批次。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase401-845-origin",
      title: "CUSTOM845 FKV-5MR 进入 Pilot 最高级漆面路线",
      eventType: "model_released",
      startDate: "2002",
      circa: false,
      description: "PILOT CUSTOM 官方历史把 CUSTOM845 FKV-5MR 放在 2002 年，并说明其延续加工硬橡胶上漆传统。",
      sourceKey: S.history.key,
    },
    {
      key: "phase401-845-current-lineup",
      title: "当前日本目录展开三色四尖幅",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前日本 Web Catalog 展开漆黑、朱、紺青及 F/M/B/BB 的 FKV-5MR SKU 组合；具体价格和尺寸以 exact SKU 为准。",
      sourceKey: S.exact.key,
    },
  ],
  conflicts: [],
};

export const phase401PilotCustom845RefreshPacks: CuratedEntityPack[] = [pack];
