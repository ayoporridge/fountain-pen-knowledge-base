import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import { PHASE59_BRIOLETTE_ID, phase59BenuNahvalurPacks } from "./phase59-benu-nahvalur";
import { phase427BrandDepthRefreshPacks } from "./phase427-brand-depth-refresh";

const RETRIEVED = "2026-08-09";
export const PHASE557_BENU_ID = "s59BENU";
export const PHASE557_BRIOLETTE_ID = PHASE59_BRIOLETTE_ID;
export const PHASE557_BRIOLETTE_SLUG = "benu-briolette";

const base = phase59BenuNahvalurPacks.find(
  (pack) => pack.entityId === PHASE557_BRIOLETTE_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 557 BENU Briolette prerequisite is missing.");

const benuBrand = phase427BrandDepthRefreshPacks.find(
  (pack) => pack.entityId === PHASE557_BENU_ID && pack.expectedType === "brand",
);
if (!benuBrand) throw new Error("Phase 557 BENU brand preflight pack is missing.");

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
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  return {
    ...input,
    homepageUrl: new URL(input.url).origin,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

const diagram = base.sources.find((source) => source.key === "phase59-benu-briolette-svg");
if (!diagram) throw new Error("Phase 557 Briolette diagram source is missing.");

const S = {
  about: web({
    key: "phase557-benu-about",
    title: "About BENU Pens｜BENU 官方品牌资料",
    url: "https://www.benupens.com/about-us",
    registryKey: "benu-official-about-phase557",
    registryName: "BENU official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "benu-official",
    summary:
      "官方 About Us 将 BENU 定位为来自亚美尼亚的设计品牌，记录 2016 年 1 月品牌起点与 2016 年 10 月首个笔系列；不能代替 Briolette 的具体首发证明。",
    locator: "About Us: January 2016 origin, first collection October 2016, Armenian brand context",
  }),
  product: web({
    key: "phase557-benu-briolette-rubyforest",
    title: "Ruby Forest｜BENU Briolette 官方商品页",
    url: "https://www.benupens.com/shop/product/rubyforest",
    registryKey: "benu-official-rubyforest-phase557",
    registryName: "BENU official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "benu-product",
    summary:
      "当前 Ruby Forest 页确认 Briolette collection、红色底与绿金闪点、gold-plated nib、standard international converter、long blue cartridge 与 eyedropper 边界；价格和库存只属检索快照。",
    locator: "Ruby Forest product title, collection, material description, filling and stock/price snapshot",
  }),
  size: web({
    key: "phase557-benu-size-chart",
    title: "Pens Size Comparison Chart｜BENU 官方尺寸图",
    url: "https://www.benupens.com/pens-size-comparison-chart",
    registryKey: "benu-official-size-chart-phase557",
    registryName: "BENU official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "benu-official",
    summary:
      "官方尺寸对比图给出 Briolette 约 13.8 cm、最大直径约 1.7 cm，并与 Euphoria、Minima、Talisman 分列。",
    locator: "Briolette size chart card: 13.8 cm length and 1.7 cm diameter",
  }),
  nibs: web({
    key: "phase557-benu-nibs",
    title: "BENU Fountain Pen Nibs｜尖单元与兼容表",
    url: "https://www.benupens.com/benu-fountain-pen-nibs",
    registryKey: "benu-official-nibs-phase557",
    registryName: "BENU official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "benu-support",
    summary:
      "官方尖表说明 BENU 使用德国制造 Schmidt 不锈钢尖；Briolette 出现在 #5 FH 241S/FH 241G 兼容列表，表中 EF/F/M/B 是宽度参考，具体 SKU 仍需核对。",
    locator: "BENU Fountain Pen Nibs: Schmidt construction, nib widths and Briolette compatibility lists",
  }),
  accessories: web({
    key: "phase557-benu-accessories",
    title: "Nibs, cartridges, converters｜BENU 官方配件目录",
    url: "https://www.benupens.com/shop/category/nibs-cartridges-converters",
    registryKey: "benu-official-accessories-phase557",
    registryName: "BENU official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "benu-support",
    summary:
      "官方配件页将短／长墨囊、converter 与替换尖分列，并要求购买前按 compatibility chart 核对。",
    locator: "official accessories category: cartridges, converter and replacement nib compatibility reminder",
  }),
  warranty: web({
    key: "phase557-benu-warranty",
    title: "Unlimited Warranty｜BENU 官方保修政策",
    url: "https://www.benupens.com/warranty",
    registryKey: "benu-official-warranty-phase557",
    registryName: "BENU official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "benu-support",
    summary:
      "官方保修页说明 2020-01-01 后购买的 BENU 产品针对材料和工艺缺陷享有 unlimited warranty，同时排除日常维护、磨损、误用、改装、未经授权维修和不适合钢笔的墨水损坏。",
    locator: "Unlimited Warranty: purchase date, defects, exclusions and service responsibilities",
  }),
  terms: web({
    key: "phase557-benu-terms",
    title: "Terms and Conditions｜BENU 官方条款",
    url: "https://www.benupens.com/terms-and-conditions",
    registryKey: "benu-official-terms-phase557",
    registryName: "BENU official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "benu-support",
    summary:
      "官方条款确认 BENU LLC 在 Yerevan 运营，手工产品可能有自然小瑕疵和照片色差，产品可更新或停产；这些边界不等于具体 Briolette 批次证明。",
    locator: "Terms: Yerevan operation, handmade/color disclaimers, updates and discontinuation",
  }),
  collection: web({
    key: "phase557-benu-collection",
    title: "BENU Collections｜Briolette collection description",
    url: "https://benupens.com/collections/collection?collections=collection&filter_hand-painted=no&yith_wcan=1",
    registryKey: "benu-estore-collection-phase557",
    registryName: "BENU eStore archive",
    sourceType: "retailer",
    tier: "contemporary_archive",
    independenceGroup: "benu-collection-archive",
    summary:
      "BENU eStore collection 资料把 Briolette 解释为 striking faceted contour，长切面帮助防滚并展现材料颜色和光泽；同时将 Talisman、Euphoria、Minima 分开。",
    locator: "collection navigation and Briolette description",
  }),
  parka: web({
    key: "phase557-benu-parka",
    title: "Review: Island Breeze from Briolette collection｜Parka Blogs",
    url: "https://www.parkablogs.com/index.php/content/review-island-breeze-briolette-collection-benu-fountain-pen",
    registryKey: "parka-benu-briolette-phase557",
    registryName: "Parka Blogs",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "parka-blogs",
    summary:
      "2018 Island Breeze 样本记录多面树脂、防滚、不可后插、#5 Schmidt F/M/B、偏硬无 flex、握段和纸面反馈；均标为单支样本。",
    locator: "review dated 2018-02-23: faceted body, cap/posting, nib, grip and writing observations",
    author: "Teoh Yi Chie",
    publishedAt: "2018-02-23",
  }),
  penchalet: web({
    key: "phase557-benu-penchalet",
    title: "BENU Briolette Review｜Pen Chalet",
    url: "https://www.penchalet.com/blog/benu-briolette-review-fountain-pen/",
    registryKey: "pen-chalet-benu-briolette-phase557",
    registryName: "Pen Chalet",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-chalet",
    summary:
      "2020 Snow Season 样本记录树脂、M 尖、轻量、不可后插、converter、握位和连续出墨；包装和尖感不外推到所有颜色。",
    locator: "review dated 2020-05-19: Snow Season sample, resin, nib, converter, grip and writing behavior",
    author: "Pen Chalet",
    publishedAt: "2020-05-19",
  }),
} satisfies Record<string, CuratedSource>;

const scope: CuratedScope = {
  key: "phase557-benu-briolette-current-depth",
  scopeKey: "phase557-benu-briolette-current-depth",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "BENU official store and compatibility chart, cross-checked with dated professional samples",
  nibScope:
    "German-made Schmidt #5 stainless nib context; official chart lists FH 241S/FH 241G EF/F/M/B compatibility, while exact nib availability remains SKU-specific",
  materialScope:
    "faceted resin body/cap; current Ruby Forest page gives a red base with green/gold sparkle and gold-plated nib, not a universal color/material rule",
  editionScope:
    "BENU Briolette family; Ruby Forest, Island Breeze, Snow Season, Luminous and other names remain color/variant or dated sample scopes",
};

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: CuratedClaim["factClass"] = "core",
  confidence = 0.98,
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence,
    sourceKey,
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey: scope.scopeKey,
        locator,
      },
    ],
  };
}

function specEvidence(
  key: string,
  fieldKey: CuratedSpecEvidence["fieldKey"],
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: scope.scopeKey, locator, qualifies: true };
}

const depthClaims: CuratedClaim[] = [
  claim(
    "phase557-briolette-identity",
    "model_identity",
    "BENU Briolette 是以长切面轮廓为识别边界的小尺寸树脂钢笔 family；Ruby Forest、Island Breeze、Snow Season 和 Luminous 名称落在颜色、树脂配方或样本 variant，不是第二个 canonical 型号。",
    S.collection.key,
    "official collection description and sibling navigation",
  ),
  claim(
    "phase557-briolette-size",
    "specification_boundary",
    "BENU 官方尺寸图给出 Briolette 约 13.8 cm 长、最大直径约 1.7 cm；图中 Euphoria、Minima、Talisman 另列，因此不能互借其尺寸。",
    S.size.key,
    "official Briolette card: 13.8 cm and 1.7 cm",
  ),
  claim(
    "phase557-briolette-product",
    "current_variant_boundary",
    "当前 Ruby Forest 商品页把一个具体 Briolette SKU 描述为红色树脂底、绿金闪点、金色镀层尖，并提醒图片颜色会受灯光和显示器影响；价格、库存、尖号选项和包装只绑定该次商品快照。",
    S.product.key,
    "Ruby Forest product description, product state and color-variation disclaimer",
  ),
  claim(
    "phase557-briolette-nib",
    "nib_compatibility",
    "BENU 官方尖表说明使用德国制造 Schmidt 不锈钢尖；Briolette 出现在 #5 FH 241S 银色与 FH 241G 金色单元兼容列表中，表中的 EF/F/M/B 是宽度参考，不保证每个当前色款同时有货。",
    S.nibs.key,
    "official nib chart: Schmidt steel, #5 units, Briolette compatibility and widths",
  ),
  claim(
    "phase557-briolette-filling",
    "filling_system",
    "Ruby Forest 当前商品页随附 standard international converter 与一支 long blue ink cartridge，并允许在确认密封后改作 eyedropper；这不是内置 piston 或 vacuum，也不能覆盖旧包装的配件差异。",
    S.product.key,
    "current product filling description and eyedropper allowance",
  ),
  claim(
    "phase557-briolette-sample-nib",
    "review_sample_boundary",
    "Parka 2018 的 Island Breeze 样本记录 #5 F/M/B 尖偏硬、无 flex；Pen Chalet 2020 的 Snow Season M 尖样本记录顺滑和连续出墨。两项均是具体笔、墨水和纸张条件下的观察，不是所有 Briolette 的承诺。",
    S.parka.key,
    "dated Parka and Pen Chalet sample reviews with explicit sample scope",
    "editorial",
    0.9,
  ),
  claim(
    "phase557-briolette-posting",
    "ergonomic_boundary",
    "两篇独立样本都记录 Briolette 帽子不能后插；这能帮助判断便携长度和重心，但若后期 SKU 的官方结构不同，应以具体实物和商品资料为准。",
    S.penchalet.key,
    "Snow Season sample cap/posting observation cross-checked with Island Breeze review",
    "editorial",
    0.9,
  ),
  claim(
    "phase557-briolette-history",
    "history_boundary",
    "BENU 官方品牌资料记录 2016 年 1 月品牌起点和 2016 年 10 月首个笔系列；Parka 2018 年公开评测已将 Briolette称为新系列。资料不足以给 Briolette 一个官方精确首发日，因此正文只保留时间锚，不伪造发布日期。",
    S.about.key,
    "BENU About Us date context and 2018 public Briolette sample review",
  ),
  claim(
    "phase557-briolette-sibling-boundary",
    "family_boundary",
    "Briolette 必须与 BENU Talisman、Euphoria、Minima 分开：共享树脂或国际规格供墨不等于共享笔体、尖号、是否后插和图片。颜色名不能把 sibling 变成独立型号。",
    S.collection.key,
    "official collection navigation and Briolette description",
  ),
  claim(
    "phase557-briolette-care",
    "maintenance_boundary",
    "换墨使用室温清水吸排并让握段自然干燥；不要用酒精、热水、研磨材料、尖锐工具或强拆处理树脂、尖和密封。eyedropper 改装、拆 feed 或未经授权维修可能超出 BENU 保修范围。",
    S.warranty.key,
    "official warranty exclusions and conservative care boundary",
  ),
  claim(
    "phase557-briolette-warranty",
    "warranty_boundary",
    "BENU 官方保修页将 2020-01-01 后购买的产品纳入针对材料和工艺缺陷的 unlimited warranty，同时排除日常维护、磨损、误用、改装、未经授权维修和不适合钢笔的墨水损坏；运输成本按政策处理。",
    S.warranty.key,
    "official unlimited warranty date, coverage and exclusions",
  ),
];
const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase557-benu-briolette-depth-v1",
  expectedType: "pen",
  expectedSlug: PHASE557_BRIOLETTE_SLUG,
  canonicalName: "BENU Briolette",
  markdownFile: ".planning/content-research/benu-briolette-phase557.md",
  storyTitle: "BENU Briolette：切面树脂、#5 Schmidt 尖与颜色版本边界",
  primarySourceKey: S.product.key,
  sources: [...base.sources, ...Object.values(S)].filter(
    (source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index,
  ),
  scopes: [...(base.scopes ?? []), scope],
  claims: [...base.claims, ...depthClaims],
  spec: {
    ...base.spec!,
    values: {
      ...base.spec!.values,
      series_name: "BENU Briolette",
      release_year:
        "BENU brand history: January 2016 origin and October 2016 first collection; Briolette public sample documented 2018; exact launch date unconfirmed",
      origin_country: "Armenia; BENU LLC Yerevan operation and manufacturing context",
      nib: "German-made Schmidt #5 stainless; FH 241S/FH 241G chart context, EF/F/M/B reference widths; exact SKU options vary",
      fill_system: "Standard international converter and long cartridge; current Ruby Forest page permits eyedropper conversion after seal check",
      material: "Faceted resin body and cap; color, sparkle, transparency and handmade variation remain SKU-specific",
      dimensions: "Official comparison chart: approximately 13.8 cm long and 1.7 cm maximum diameter",
      weight: "Approximately 19–20 g in dated Island Breeze sample; not an official fixed family weight",
      price_range:
        "No stable price asserted; Ruby Forest page was a dated product snapshot and price/stock can change",
      status: "Current Briolette collection with changing colors, editions and stock; exact SKU must be rechecked",
    },
    evidence: [
      ...base.spec!.evidence,
      specEvidence("phase557-briolette-brand", "brand_entity_id", S.about.key, "BENU official brand identity"),
      specEvidence("phase557-briolette-series", "series_name", S.collection.key, "Briolette collection description"),
      specEvidence("phase557-briolette-release", "release_year", S.about.key, "2016 BENU brand timeline; no unsupported Briolette launch year"),
      specEvidence("phase557-briolette-origin", "origin_country", S.terms.key, "BENU LLC Yerevan operation in official terms"),
      specEvidence("phase557-briolette-nib", "nib", S.nibs.key, "Schmidt #5 compatibility chart and width table"),
      specEvidence("phase557-briolette-fill", "fill_system", S.product.key, "Ruby Forest converter, long cartridge and eyedropper statement"),
      specEvidence("phase557-briolette-material", "material", S.product.key, "current Ruby Forest faceted resin and color description"),
      specEvidence("phase557-briolette-dimensions", "dimensions", S.size.key, "official 13.8 cm and 1.7 cm comparison chart"),
      specEvidence("phase557-briolette-weight", "weight", S.parka.key, "dated Island Breeze sample weight context"),
      specEvidence("phase557-briolette-price", "price_range", S.product.key, "dated Ruby Forest price/stock snapshot, not stable global price"),
      specEvidence("phase557-briolette-status", "status", S.product.key, "current product page and collection context"),
    ],
  },
  timeline: [
    ...(base.timeline ?? []),
    {
      key: "phase557-briolette-recheck",
      title: "Briolette official identity and compatibility rechecked",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Official BENU product, size chart, nib compatibility, accessories and warranty pages were rechecked; dated reviews remain sample-scoped.",
      sourceKey: S.product.key,
    },
  ],
};

// The shared curated-content contract expects a brand pack in each pen batch.
// This is the already-canonical Phase 427 BENU brand pack; no brand entity is created.
export const phase557BenuBrioletteDepthPacks: CuratedEntityPack[] = [
  structuredClone(benuBrand),
  pack,
];
