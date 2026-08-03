import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  loadPhase142Packs,
  PHASE142_BRANDS,
  PHASE142_IDS,
} from "./phase142-franklin-birmingham-batch";

export const PHASE411_FC_BRAND_ID = PHASE142_BRANDS.franklinChristoph;
export const PHASE411_MODEL20_ID = PHASE142_IDS.model20;
export const PHASE411_MODEL20_SLUG = "franklin-christoph-model-20-marietta";
export const PHASE411_MODEL20_NAME = "Franklin-Christoph Model 20 Marietta";

const RETRIEVED = "2026-08-03";
const CURRENT_SCOPE = "phase411-fc-model20-current-2026-08-03";
const NIB_SCOPE = "phase411-fc-model20-nib-options";
const POCKET_SCOPE = "phase411-fc-model20-pocket-boundary";
const HISTORY_SCOPE = "phase411-fc-history";
const SAMPLE_SCOPE = "phase411-fc-model20-independent-samples";
const COMMERCIAL_SCOPE = "phase411-fc-model20-commercial-2026-08-03";
const CARE_SCOPE = "phase411-fc-model20-care";

function web(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  author?: string;
  publishedAt?: string;
  summary: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const tier = input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary");
  const homepageUrl = sourceType === "official"
    ? "https://www.franklin-christoph.com/"
    : new URL(input.url).origin;
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl,
    itemType: "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(): CuratedSource {
  const localPath = "/images/library/site-original/phase142/franklin-christoph/model20-marietta.svg";
  return {
    key: "phase411-fc-model20-factual-svg",
    registryKey: "fountain-pen-graph-editorial-phase411-fc-model20",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase411-fc-model20",
    title: "Franklin-Christoph Model 20 Marietta 事实示意图（非产品照片）",
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "沿用本站原创 factual SVG，说明全尺寸 Marietta、滑盖、凹入式 #6 单元与 pocket 20 边界；非照片、非 logo、非比例图。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  exact: web({
    key: "phase411-fc-model20-exact",
    registryKey: "franklin-christoph-model20-official-phase411",
    registryName: "Franklin-Christoph official Model 20 collection",
    title: "Model 20 Marietta official collection",
    url: "https://www.franklin-christoph.com/collections/model-20-marietta",
    summary: "官方集合页说明 slip cap、recessed nib、无外露螺纹、三种上墨、#6 笔尖、3.5 ml 近似滴入容量、尺寸重量、配件与当前起价。",
  }),
  sku: web({
    key: "phase411-fc-model20-jade-sku",
    registryKey: "franklin-christoph-model20-jade-phase411",
    registryName: "Franklin-Christoph official Jade SKU",
    title: "Model 20 Marietta Fountain Pen - Jade",
    url: "https://www.franklin-christoph.com/collections/model-20-marietta/jade",
    summary: "Jade 商品页提供当前 SKU、USD 155 起价和检索时 sold out 状态；颜色与库存是日期快照。",
  }),
  nib: web({
    key: "phase411-fc-nib-info",
    registryKey: "franklin-christoph-nibs-phase411",
    registryName: "Franklin-Christoph FP Nib Info",
    title: "FP Nib Info",
    url: "https://www.franklin-christoph.com/pages/fp-nib-details-and-info",
    summary: "官方笔尖页将大型型号列为 #6，并说明 nib、feed、housing 单元可旋下，在相同尺寸的 F-C 钢笔间互换。",
  }),
  history: web({
    key: "phase411-fc-history",
    registryKey: "franklin-christoph-history-phase411",
    registryName: "Franklin-Christoph official history",
    title: "History",
    url: "https://www.franklin-christoph.com/pages/history",
    summary: "官方历史页记录 1901 The Franklin Co.、2001 品牌重塑与 IPO、2007 Model 1901、2011 Model 02 等沿革，不提供 Model 20 首发年。",
  }),
  design: web({
    key: "phase411-fc-model20-design-video",
    registryKey: "franklin-christoph-model20-design-phase411",
    registryName: "Franklin-Christoph official design video",
    title: "Model 20 Design Video",
    url: "https://www.franklin-christoph.com/pages/model-20-design-video",
    summary: "官方设计视频页由 Scott Franklin 讲解 Model 20 Marietta 结构，并提醒早期版本存在细节变化。",
  }),
  pocket: web({
    key: "phase411-fc-pocket20",
    registryKey: "franklin-christoph-pocket20-phase411",
    registryName: "Franklin-Christoph official pocket 20",
    title: "pocket 20 collection",
    url: "https://www.franklin-christoph.com/collections/pocket-20",
    summary: "官方把 pocket 20 单独列为较短笔形；其长度、重量、上墨和配件条件不回填到全尺寸 Marietta。",
  }),
  warranty: web({
    key: "phase411-fc-warranty",
    registryKey: "franklin-christoph-warranty-phase411",
    registryName: "Franklin-Christoph official warranty",
    title: "Warranty",
    url: "https://www.franklin-christoph.com/pages/warranty",
    summary: "官方售后页用于核对 lifetime warranty 的当前条款；适用范围仍取决于订单、渠道、地区和是否有改装。",
  }),
  tips: web({
    key: "phase411-fc-quick-tips",
    registryKey: "franklin-christoph-quick-tips-phase411",
    registryName: "Franklin-Christoph official quick tips",
    title: "Quick Tips on Pens",
    url: "https://www.franklin-christoph.com/pages/quick-tips",
    summary: "官方快速提示页提供钢笔装墨、清洁和日常使用的通用提醒；本页只把它作为维护边界，不扩写成 Model 20 专属规格。",
  }),
  penAddict: web({
    key: "phase411-fc-model20-penaddict",
    registryKey: "pen-addict-fc-model20-phase411",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    author: "Susan M. Pigott",
    publishedAt: "2015-07-10",
    title: "Franklin-Christoph Model 20 Marietta in Vintage Green: A Review",
    url: "https://www.penaddict.com/blog/2015/7/10/franklin-christoph-model-20-marietta-in-vintage-green-a-review",
    summary: "Vintage Green 个人样本记录 127／138.43 mm、22.7 g、滑盖无螺纹握位、converter／eyedropper 和 18K Masuyama 尖型体验。",
  }),
  sbre: web({
    key: "phase411-fc-model20-sbre",
    registryKey: "sbrebrown-fc-model20-phase411",
    registryName: "SBRE Brown",
    sourceType: "blog",
    tier: "professional_secondary",
    author: "SBRE Brown",
    publishedAt: "2017-01-18",
    title: "Franklin-Christoph Model 20 Marietta Fountain Pen Review",
    url: "https://www.sbrebrown.com/2017/01/franklin-christoph-model-20-marietta-fountain-pen-review/",
    summary: "独立样本记录 123.5／139.2／152.3 mm、16 g 和 1.9 mm Christoph music nib；量测与写感不替代当前官方规格。",
  }),
  penChalet: web({
    key: "phase411-fc-model20-penchalet",
    registryKey: "penchalet-fc-model20-phase411",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "retailer",
    title: "Franklin-Christoph Model 20 fountain pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/franklin_christoph_model_20_fountain_pens.html",
    summary: "零售目录用于交叉核对 Model 20 的市场命名与材料批次；不以零售库存或图片替代官网结构规格。",
  }),
  fpc: web({
    key: "phase411-fc-model20-fpc",
    registryKey: "fountain-pen-companion-fc-model20-phase411",
    registryName: "Fountain Pen Companion",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Model 20 Marietta model index",
    url: "https://www.fountainpencompanion.com/pen_brands/35-franklin-christoph/pen_models/196-model-20-marietta",
    summary: "独立钢笔数据库用于交叉核对 Model 20 Marietta 的型号索引，不替代官方当前材料、价格和尖型。",
  }),
  diagram: diagram(),
} as const;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  source: CuratedSource,
  locator: string,
  scopeKey: string,
  extra: CuratedSource[] = [],
  factClass: CuratedClaim["factClass"] = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.99 : 0.93,
    sourceKey: source.key,
    locator,
    evidence: [source, ...extra].map((item, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: item.key,
      scopeKey,
      locator: index === 0 ? locator : item.summary,
    })),
  };
}

const variants: CuratedVariant[] = [
  {
    key: "phase411-fc-model20-current",
    name: "Model 20 Marietta 全尺寸笔形",
    notes: "当前官方集合的基础身份；滑盖、凹入式 #6 单元和三种上墨路径属于此笔形，首发年份不从当前页面倒推。",
    sourceKey: S.exact.key,
    variantKind: "edition_group",
  },
  {
    key: "phase411-fc-model20-colour-skus",
    name: "Onyx、Black Cathedral、Copper Rising、Emerald、Jade 等颜色／树脂 SKU",
    notes: "颜色、纹理和限量名称按具体商品页记录，不改变 Model 20 身份，也不证明所有批次拥有同一尖型或配件。",
    sourceKey: S.sku.key,
    variantKind: "color",
    parentVariantKey: "phase411-fc-model20-current",
  },
  {
    key: "phase411-fc-model20-nib-options",
    name: "#6 factory、SIG、Nagahara 与 custom ground 尖型",
    notes: "笔尖是订单级选择；官方 #6 单元互换边界不等于任意第三方零件或某一支评测研磨的全系固定配置。",
    sourceKey: S.nib.key,
    variantKind: "nib",
    parentVariantKey: "phase411-fc-model20-current",
  },
  {
    key: "phase411-fc-model20-pocket-sibling",
    name: "pocket 20（独立 sibling）",
    notes: "短笔形，仅用于导航边界；其尺寸、重量、converter 条件和图片不回填到 Marietta。",
    sourceKey: S.pocket.key,
    variantKind: "edition_group",
  },
  {
    key: "phase411-fc-model20-model02-boundary",
    name: "Model 02 Intrinsic（独立型号边界）",
    notes: "Model 02 的收腰和深插帽结构不属于 Model 20；本页不借用其规格或体验。",
    sourceKey: S.design.key,
    variantKind: "edition_group",
  },
  {
    key: "phase411-fc-model20-model31-boundary",
    name: "Model 31 Omnis（独立型号边界）",
    notes: "Model 31 与 Marietta 共享大型笔尖语境但不是同一笔形；不将其材料、尺寸或图片并入本页。",
    sourceKey: S.design.key,
    variantKind: "edition_group",
  },
];

const prior = loadPhase142Packs("").find(
  (pack) => pack.entityId === PHASE411_MODEL20_ID && pack.expectedType === "pen",
);
if (!prior) throw new Error("Phase 411 requires the existing Phase 142 Model 20 identity.");

const pack: CuratedEntityPack = {
  ...structuredClone(prior),
  key: "phase411-franklin-christoph-model20-refresh-v1",
  entityId: PHASE411_MODEL20_ID,
  expectedType: "pen",
  expectedSlug: PHASE411_MODEL20_SLUG,
  canonicalName: PHASE411_MODEL20_NAME,
  markdownFile: ".planning/content-research/franklin-christoph-model20-marietta-phase411.md",
  storyTitle: "Franklin-Christoph Model 20 Marietta：滑盖、凹入式笔尖与 #6 单元",
  primarySourceKey: S.exact.key,
  publicationIntent: "publish",
  publicationBlockers: [],
  aliases: [
    { alias: "Franklin-Christoph Model 20 Marietta", language: "en", sourceKey: S.exact.key },
    { alias: "Franklin-Christoph Model 20", language: "en", kind: "former_name", sourceKey: S.exact.key },
    { alias: "F-C Model 20", language: "en", sourceKey: S.exact.key },
    { alias: "F-C Marietta", language: "en", sourceKey: S.sku.key },
    { alias: "富兰克林-克里斯托弗 Model 20 Marietta", language: "zh", sourceKey: S.exact.key },
    { alias: "富兰克林-克里斯托夫 Model 20 Marietta", language: "zh", sourceKey: S.exact.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: CURRENT_SCOPE,
      scopeKey: CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "#6 单元；尖宽、尖材和研磨按具体 SKU。",
      materialScope: "当前集合的硬质 acrylic；颜色和树脂批次按商品页。",
      editionScope: "全尺寸 Model 20 Marietta；不含 pocket 20、Model 02、Model 31。",
    },
    {
      key: NIB_SCOPE,
      scopeKey: NIB_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "factory、SIG、Nagahara 与 custom ground 选项的分类范围。",
      editionScope: "#6 nib/feed/housing 单元互换的同尺寸边界。",
    },
    {
      key: POCKET_SCOPE,
      scopeKey: POCKET_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "pocket 20 作为独立 sibling；不回填其长度、重量或 converter 条件。",
    },
    {
      key: HISTORY_SCOPE,
      scopeKey: HISTORY_SCOPE,
      validFrom: "1901",
      productionState: "historical",
      editionScope: "The Franklin Co.、2001 品牌重塑与产品线日期；不推断 Model 20 首发年。",
    },
    {
      key: SAMPLE_SCOPE,
      scopeKey: SAMPLE_SCOPE,
      validFrom: "2015",
      validTo: "2017",
      productionState: "historical",
      editionScope: "Vintage Green 与独立评测样本；测量和写感不覆盖所有 SKU。",
    },
    {
      key: COMMERCIAL_SCOPE,
      scopeKey: COMMERCIAL_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "Jade 商品页的 USD 155 起价与 sold out 状态，属于日期快照。",
    },
    {
      key: CARE_SCOPE,
      scopeKey: CARE_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "滑盖、凹入式笔尖、converter 与 eyedropper 的保守维护边界。",
    },
  ],
  claims: [
    claim(
      "phase411-fc-model20-identity",
      "model_identity",
      "Model 20 Marietta 是 Franklin-Christoph 的全尺寸 slip-cap 笔形，采用 recessed nib；它与 pocket 20、Model 02 和 Model 31 是分开的型号身份。",
      S.exact,
      "official collection title and design description",
      CURRENT_SCOPE,
      [S.pocket, S.design],
    ),
    claim(
      "phase411-fc-model20-structure",
      "cap_structure",
      "帽盖以受控摩擦套合，没有外露螺纹和握位肩部；帽内的压力分配与释压设计用于降低帽口应力和拔帽时的喷墨风险，但不是永不漏墨承诺。",
      S.exact,
      "no exterior threads, no shoulder, pressure distribution and pressure release description",
      CURRENT_SCOPE,
      [S.design],
    ),
    claim(
      "phase411-fc-model20-dimensions",
      "official_dimensions",
      "官方当前测量口径为 127 mm 无帽、138.43 mm 带帽、150 mm 套帽；帽长 55.25 mm、帽径 14.61 mm、笔杆径 12.95 mm、最细握位 10.41 mm。",
      S.exact,
      "official dimensions block",
      CURRENT_SCOPE,
      [S.penAddict],
    ),
    claim(
      "phase411-fc-model20-weight",
      "official_weight",
      "官方给出装入 converter、未注墨时约 19.28 g；独立样本的 16 g 与 22.7 g 受笔尖和称量口径影响，不覆盖全型号。",
      S.exact,
      "weight with converter inserted but not ink",
      CURRENT_SCOPE,
      [S.penAddict, S.sbre],
    ),
    claim(
      "phase411-fc-model20-filling",
      "filling_system",
      "Marietta 可用短国际墨囊、piston converter 或 eyedropper；官方把约 3.5 ml 写成滴入时的近似容量，不是必须滴入或无限期储墨许可。",
      S.exact,
      "filled three ways and approximately 3.5ml barrel capacity",
      CURRENT_SCOPE,
      [S.penAddict],
    ),
    claim(
      "phase411-fc-model20-nib",
      "nib_unit",
      "Model 20 使用 #6 尺寸笔尖单元；官方说明 nib、feed、housing 可旋下并在同尺寸 F-C 钢笔间互换，具体尖宽、尖材和研磨须按订单核对。",
      S.nib,
      "#6 model list and interchangeable nib/feed/housing unit",
      NIB_SCOPE,
      [S.exact],
    ),
    claim(
      "phase411-fc-model20-material",
      "material_boundary",
      "当前 Model 20 集合包含硬质 acrylic 与多种颜色／树脂批次；颜色名或 Antique Glass 名称不自动构成新的基础型号，也不能证明所有批次同一纹理和配件。",
      S.exact,
      "current colour and material collection context",
      CURRENT_SCOPE,
      [S.penChalet, S.fpc],
    ),
    claim(
      "phase411-fc-model20-pocket-boundary",
      "sibling_boundary",
      "pocket 20 是独立短笔形，其长度、重量、上墨和 converter 条件不能回填到全尺寸 Marietta；Model 02 与 Model 31 也不共享本页结构规格。",
      S.pocket,
      "separate official pocket 20 collection and model menu",
      POCKET_SCOPE,
      [S.design],
    ),
    claim(
      "phase411-fc-model20-history",
      "brand_history_boundary",
      "官方历史页记录 1901 The Franklin Co.、2001 品牌重塑与 IPO、2007 Model 1901、2011 Model 02；这些是品牌和产品线沿革，不是 Model 20 的首发年份。",
      S.history,
      "official important dates",
      HISTORY_SCOPE,
    ),
    claim(
      "phase411-fc-model20-commercial",
      "commercial_snapshot",
      "检索日 Jade 商品页显示 Model 20 Marietta 起价 USD 155 且 sold out；笔尖另计，价格、颜色库存和配件随日期、市场与 SKU 变化。",
      S.sku,
      "current Jade SKU price and stock state",
      COMMERCIAL_SCOPE,
      [S.warranty],
    ),
    claim(
      "phase411-fc-model20-maintenance",
      "maintenance_boundary",
      "滑盖应平正推入和拔出；换色用室温清水吸排并晾干，异常渗漏、断墨、裂纹或笔尖错位时停止强拆，先保留条件记录并寻求品牌或专业维修判断。",
      S.tips,
      "official quick tips plus model-specific conservative handling",
      CARE_SCOPE,
      [S.exact, S.warranty],
    ),
    claim(
      "phase411-fc-model20-sample-experience",
      "independent_sample",
      "The Pen Addict 与 SBRE Brown 的样本都把 Marietta 描述为修长、可戴帽或不戴帽使用；其写感分别来自特定颜色、尖型、墨水和纸张，只作体验语境。",
      S.penAddict,
      "independent review sample description and measurements",
      SAMPLE_SCOPE,
      [S.sbre],
      "editorial",
    ),
    claim(
      "phase411-fc-model20-buying",
      "selection_guidance",
      "购买顺序应是先确认全尺寸 Marietta 身份，再核对颜色／材料、#6 尖型、converter 与商业条款；需要短尺寸的人应直接查看 pocket 20，而不是把 Marietta 当成短笔替代品。",
      S.exact,
      "model menu and current product options",
      CURRENT_SCOPE,
      [S.pocket, S.sku],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE411_FC_BRAND_ID,
    values: {
      series_name: PHASE411_MODEL20_NAME,
      release_year: "当前官方目录；首发年份待官方档案核实",
      origin_country: "United States；当前官方页面使用 Made in USA 表述",
      nib: "#6 可更换笔尖单元；factory、SIG、Nagahara、custom ground 与具体尖宽按 SKU",
      fill_system: "短国际墨囊、piston converter 或 eyedropper；官方近似约 3.5 ml",
      material: "硬质 acrylic；颜色、纹理和限量批次按具体 SKU",
      dimensions: "约 127 mm 无帽、138.43 mm 带帽、150 mm 套帽；帽径 14.61 mm、笔杆径 12.95 mm、最细握位 10.41 mm",
      weight: "约 19.28 g（含 converter、未注墨；独立样本会因口径而异）",
      price_range: "当前官网起价 USD 155；笔尖、市场与日期会改变最终价格",
      status: "当前型号集合；颜色、库存、尖型和商业条款按日期核对",
    },
    evidence: [
      evidence("brand_entity_id", "phase411-fc-model20-brand", S.exact.key, CURRENT_SCOPE, "verified existing Franklin-Christoph maker relation"),
      evidence("series_name", "phase411-fc-model20-series", S.exact.key, CURRENT_SCOPE, "official Model 20 Marietta collection title"),
      evidence("release_year", "phase411-fc-model20-release", S.history.key, HISTORY_SCOPE, "official history does not state Model 20 first release"),
      evidence("origin_country", "phase411-fc-model20-origin", S.exact.key, CURRENT_SCOPE, "Made in USA wording on current collection"),
      evidence("nib", "phase411-fc-model20-nib-spec", S.nib.key, NIB_SCOPE, "official #6 unit and nib options"),
      evidence("fill_system", "phase411-fc-model20-fill-spec", S.exact.key, CURRENT_SCOPE, "official three filling paths and approximate capacity"),
      evidence("material", "phase411-fc-model20-material-spec", S.exact.key, CURRENT_SCOPE, "current acrylic colour collection"),
      evidence("dimensions", "phase411-fc-model20-dimensions-spec", S.exact.key, CURRENT_SCOPE, "official dimensions block"),
      evidence("weight", "phase411-fc-model20-weight-spec", S.exact.key, CURRENT_SCOPE, "official converter-inserted uninked weight"),
      evidence("price_range", "phase411-fc-model20-price-spec", S.sku.key, COMMERCIAL_SCOPE, "current Jade price snapshot"),
      evidence("status", "phase411-fc-model20-status-spec", S.sku.key, COMMERCIAL_SCOPE, "current SKU stock snapshot"),
    ],
  },
  timeline: [
    { key: "phase411-fc-1901", title: "The Franklin Co. 起源", eventType: "brand_founded", startDate: "1901", circa: false, description: "官方历史页记录 The Franklin Co. 于 1901 年起步；不推断 Model 20 年份。", sourceKey: S.history.key },
    { key: "phase411-fc-2001", title: "Franklin-Christoph 品牌重塑", eventType: "design_milestone", startDate: "2001", circa: false, description: "官方历史页记录品牌重塑并推出 IPO；不把 IPO 当作 Model 20。", sourceKey: S.history.key },
    { key: "phase411-fc-model20-current", title: "Model 20 Marietta 当前集合资料窗口", eventType: "model_released", startDate: RETRIEVED, circa: true, description: "检索日官方集合仍将全尺寸 Model 20 Marietta 作为独立型号呈现；检索日期不是首发年份。", sourceKey: S.exact.key },
  ],
  media: [
    {
      key: "phase411-fc-model20-primary-media",
      title: "Franklin-Christoph Model 20 Marietta 事实图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
};

export const phase411FranklinChristophModel20RefreshPacks: CuratedEntityPack[] = [pack];
