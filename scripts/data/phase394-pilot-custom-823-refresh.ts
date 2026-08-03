import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE47_PILOT_823_ID,
  PHASE47_PILOT_BRAND_ID,
  phase47PilotCustom823Packs,
} from "./phase47-pilot-custom-823";

export const PHASE394_PILOT_BRAND_ID = PHASE47_PILOT_BRAND_ID;
export const PHASE394_PILOT_823_ID = PHASE47_PILOT_823_ID;
export const PHASE394_PILOT_823_DUPLICATE_ID = "xQ-15uqtdMGA";
export const PHASE394_PILOT_823_SLUG = "pilot-custom-823";
export const PHASE394_PILOT_823_NAME = "百乐 Pilot Custom 823";

const RETRIEVED = "2026-08-03";
const SCOPE = "pilot-custom-823-phase394-current";

const baseModel = phase47PilotCustom823Packs.find(
  (pack) => pack.entityId === PHASE47_PILOT_823_ID,
);
if (!baseModel) throw new Error("Phase 394 Pilot Custom 823 base pack missing.");
const sourceCatalog = baseModel.sources;
const baseBrand = phase47PilotCustom823Packs.find(
  (pack) => pack.entityId === PHASE394_PILOT_BRAND_ID && pack.expectedType === "brand",
);
if (!baseBrand) throw new Error("Phase 394 Pilot brand base pack missing.");

function deriveSource(
  previousKey: string,
  key: string,
  overrides: Partial<CuratedSource> = {},
): CuratedSource {
  const previous = sourceCatalog.find((source) => source.key === previousKey);
  if (!previous) throw new Error(`Phase 394 Pilot source missing: ${previousKey}`);
  return {
    ...structuredClone(previous),
    key,
    retrievedAt: RETRIEVED,
    ...overrides,
  };
}

const SOURCES = {
  japan: deriveSource("phase47-pilot823-japan", "phase394-pilot823-japan", {
    title: "Pilot 日本网页目录：Custom 823 FKK-3MRP-NCF",
    summary:
      "日本官方目录列出 FKK-3MRP-NCF 透明 F、14K 15 号、plunger 吸墨、148.4 mm、15.7 mm、29.5 g，并列透明黑、棕色与 F/M/B/S SKU。",
    archiveLocator:
      "current Japan catalogue: FKK-3MRP-NCF product code, nib, filling, dimensions, weight and color table",
  }),
  lineup: deriveSource("phase41-pilot-custom-823-lineup", "phase394-pilot823-lineup", {
    title: "Pilot Custom 官方 lineup：CUSTOM823",
    summary:
      "Pilot Custom 官方产品页将 CUSTOM823 列为 FKK-3MRP，采用 plunger-type filling、14K No.15，并列 F/M/B/S 尖号。",
    archiveLocator:
      "official CUSTOM823 product block: FKK-3MRP, plunger filling, 14K No.15 and nib options",
  }),
  history: deriveSource("phase47-pilot823-history", "phase394-pilot823-history", {
    title: "Pilot Custom 官方 history：2000 CUSTOM823",
    summary:
      "官方历史页把 CUSTOM823 放在 2000 年，并说明 plunger-type 直接入桶和约 1.5 ml 的大容量定位。",
    archiveLocator:
      "2000 CUSTOM823 milestone, plunger-type mechanism and approximate 1.5 ml ink volume",
  }),
  support: deriveSource("phase47-pilot823-support", "phase394-pilot823-support", {
    title: "Pilot 官方支持：CUSTOM 823 使用与保养",
    summary:
      "官方说明给出 FKK-3MRP/FKKE-3MRP、真空填充、尾端约 2 mm 供墨、清水吸排、墨水限制、不可自行维修与禁带飞机。",
    archiveLocator:
      "official filling sequence, writing valve gap, cleaning, ink compatibility, no-air-travel and no-repair guidance",
  }),
  brochure: deriveSource("phase47-pilot823-brochure", "phase394-pilot823-brochure", {
    title: "Pilot US Fine Writing brochure：Custom 823",
    summary:
      "美国官方 brochure 以大容量真空 plunger 和 demonstrator-style 语境介绍 Custom 823，并提供 smoke/amber 的市场颜色语境。",
    archiveLocator:
      "PDF Custom 823 product entry: vacuum plunger, reservoir and US color context",
  }),
  review: deriveSource("phase47-pilot823-review", "phase394-pilot823-review", {
    title: "The Pen Addict：Pilot Custom 823 review",
    summary:
      "专业评测补充真空填充、墨仓可视性与 No.15 F 尖的书写观察；仅作评测语境，不替代官方规格。",
    archiveLocator:
      "professional review observations on vacuum filling, reservoir and No.15 F writing experience",
  }),
  review2: deriveSource("phase47-pilot823-review2", "phase394-pilot823-review2", {
    title: "The Gentleman Stationer：Pilot Custom 823",
    summary:
      "专业评测记录 823 不使用 piston 或 cartridge/converter，并讨论 smoke、clear 与地区供货差异。",
    archiveLocator:
      "professional review boundary for filling mechanism, colors and regional availability",
  }),
  svg: deriveSource("phase47-pilot823-svg", "phase394-pilot823-svg", {
    title: "Pilot Custom 823 事实卡（本站原创示意图）",
    summary:
      "本站原创 factual SVG 只表达 FKK-3MRP、真空活塞、14K No.15、1.5 ml、当前目录尺寸与市场配色边界；非产品照片。",
    archiveLocator:
      "project-public-asset:/images/library/site-original/pilot-custom-823-v2.svg;site-original=true;factual-svg=true;product-photo=false",
  }),
};

function claim(
  key: string,
  predicate: string,
  objectText: string,
  source: CuratedSource,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey: source.key,
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey: source.key,
        scopeKey: SCOPE,
        locator,
      },
    ],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  source: CuratedSource,
  locator: string,
): CuratedSpecEvidence {
  return {
    key,
    fieldKey,
    sourceKey: source.key,
    scopeKey: SCOPE,
    locator,
    qualifies: true,
  };
}

const pilot823: CuratedEntityPack = {
  key: "phase394-pilot-custom-823-refresh-v1",
  entityId: PHASE394_PILOT_823_ID,
  expectedType: "pen",
  expectedSlug: PHASE394_PILOT_823_SLUG,
  canonicalName: PHASE394_PILOT_823_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pilot-custom-823-phase394.md",
  storyTitle: "Pilot Custom 823：把 FKK-3MRP 真空活塞读成一支可维护的 No.15 钢笔",
  primarySourceKey: SOURCES.japan.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot Custom 823", language: "en", sourceKey: SOURCES.lineup.key },
    { alias: "PILOT CUSTOM823", language: "en", sourceKey: SOURCES.lineup.key },
    { alias: "百乐 Pilot Custom 823", language: "zh", sourceKey: SOURCES.japan.key },
    { alias: "百乐 Custom 823", language: "zh", sourceKey: SOURCES.japan.key },
    { alias: "百乐 823", language: "zh", sourceKey: SOURCES.japan.key },
    { alias: "FKK-3MRP", language: "en", kind: "alias", sourceKey: SOURCES.japan.key },
    {
      alias: "FKKE-3MRP",
      language: "en",
      kind: "regional_name",
      market: "Pilot international support listing",
      sourceKey: SOURCES.support.key,
    },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Pilot Custom 823 current catalogue and official support references; market color names kept separate",
      nibScope: "14K No.15；日本目录 F/M/B/S，实际供货按地区 SKU",
      materialScope: "树脂笔身与透明或半透明墨仓；饰件和盒装按市场记录",
      editionScope: "FKK-3MRP Custom 823；透明、透明黑、棕色及 smoke/amber 为市场或颜色记录，不拆主型号",
    },
  ],
  claims: [
    claim(
      `${SCOPE}-identity`,
      "model_identity",
      "Pilot Custom 823／CUSTOM823 是 FKK-3MRP 真空 plunger 型钢笔，官方 lineup 将其配为 14K No.15 尖；保修页另列 FKKE-3MRP 地区代码。",
      SOURCES.lineup,
      "official CUSTOM823 product block and support model codes",
    ),
    claim(
      `${SCOPE}-history`,
      "release_history",
      "Pilot Custom 官方历史页把 CUSTOM823 放在 2000 年，并把它描述为向 Custom 系列加入 plunger-type 大容量吸墨机构的节点。",
      SOURCES.history,
      "official history 2000 CUSTOM823 entry",
    ),
    claim(
      `${SCOPE}-filling`,
      "filling_system",
      "823 通过拉杆、密封件和气压变化把墨水直接吸入后段墨仓；它不是 piston filler，也不能按 cartridge/converter 型号装配。",
      SOURCES.support,
      "official filling mechanism and cartridge/converter boundary",
    ),
    claim(
      `${SCOPE}-capacity`,
      "ink_capacity",
      "官方历史页以约 1.5 ml 描述这套 plunger 大容量定位；实际每次吸入量会随残墨、液面与操作变化，不应写成固定实验室数值。",
      SOURCES.history,
      "official approximate 1.5 ml statement",
    ),
    claim(
      `${SCOPE}-nib`,
      "nib_options",
      "官方 lineup 与日本目录列 14K No.15 金尖，F、M、B、S 是当前目录可核对的尖号；尖幅和市场供货按完整 SKU 记录。",
      SOURCES.japan,
      "Japan catalogue nib and color table",
    ),
    claim(
      `${SCOPE}-dimensions`,
      "current_dimensions",
      "日本当前目录的透明 F FKK-3MRP-NCF 为全长约 148.4 mm、最大径约 15.7 mm、重量约 29.5 g；这些数字绑定该目录 SKU。",
      SOURCES.japan,
      "FKK-3MRP-NCF official dimensions and weight",
    ),
    claim(
      `${SCOPE}-sku`,
      "market_sku_variants",
      "日本目录把透明、透明黑、棕色与 F/M/B/S 后缀拆成 SKU；后缀是目录核对字段，不代表全球供货或年份规则。",
      SOURCES.japan,
      "official Japan color/SKU table",
    ),
    claim(
      `${SCOPE}-market-boundary`,
      "market_boundary",
      "Pilot US brochure 与专业资料使用 smoke、amber、clear 等美国市场颜色语境；它们与日本目录的 transparent、transparent-black、brown 作为地区记录并存，不强行一一对齐。",
      SOURCES.brochure,
      "US brochure color context, bounded against Japan catalogue",
    ),
    claim(
      `${SCOPE}-care`,
      "maintenance_guidance",
      "官方要求按 plunger 顺序填充、写字时打开尾端约 2 mm、换色前清水吸排，不自行拆修；长期不用排空并清洗。",
      SOURCES.support,
      "official filling, writing valve, cleaning and no-repair guidance",
    ),
    claim(
      `${SCOPE}-ink`,
      "ink_compatibility",
      "官方建议使用 PILOT 钢笔墨水和 INK-70 瓶装墨，提醒 Tsuwairo 颜料墨水不兼容，也不要混合其他墨水或旧墨。",
      SOURCES.support,
      "official ink compatibility and cleaning-before-color-change guidance",
    ),
    claim(
      `${SCOPE}-air-pressure`,
      "travel_boundary",
      "官方提醒气压变化可能造成漏墨或喷墨，因此不要把装墨状态的 823 带上飞机；这是其真空墨仓与阀门的专门保养边界。",
      SOURCES.support,
      "official no-air-travel warning",
    ),
    claim(
      `${SCOPE}-siblings`,
      "sibling_model_boundary",
      "Custom 74、845、Heritage 912 与 823 同属 Custom 家族但供墨、尖号或材质不同；不能把相邻型号的容量、converter 或漆面规格回填到 823。",
      SOURCES.history,
      "official Custom history sibling milestones",
    ),
    claim(
      `${SCOPE}-writing-boundary`,
      "writing_observation_boundary",
      "专业评测可补充 No.15 F、真空填充和地区颜色的使用语境，但写感属于具体尖号、墨水、纸张与评测者条件，不替代官方规格。",
      SOURCES.review,
      "professional review observations bounded to reviewer sample",
    ),
    claim(
      `${SCOPE}-media-boundary`,
      "media_identity_boundary",
      "本站原创事实卡只表达 FKK-3MRP、真空活塞、14K No.15、约 1.5 ml、目录尺寸和市场配色边界，明确是非产品照片的示意图。",
      SOURCES.svg,
      "site-original factual SVG attribution and non-photo boundary",
      "editorial",
    ),
  ],
  variants: [
    ["NCF", "日本透明 F", "14K No.15 F；日本目录代码 FKK-3MRP-NCF"],
    ["NCM", "日本透明 M", "14K No.15 M；日本目录代码 FKK-3MRP-NCM"],
    ["NCB", "日本透明 B", "14K No.15 B；日本目录代码 FKK-3MRP-NCB"],
    ["NCS", "日本透明 S", "14K No.15 S；日本目录代码 FKK-3MRP-NCS"],
    ["TBF", "日本透明黑 F", "14K No.15 F；日本目录代码 FKK-3MRP-TBF"],
    ["TBM", "日本透明黑 M", "14K No.15 M；日本目录代码 FKK-3MRP-TBM"],
    ["TBB", "日本透明黑 B", "14K No.15 B；日本目录代码 FKK-3MRP-TBB"],
    ["TBS", "日本透明黑 S", "14K No.15 S；日本目录代码 FKK-3MRP-TBS"],
    ["BNF", "日本棕色 F", "14K No.15 F；日本目录代码 FKK-3MRP-BNF"],
    ["BNM", "日本棕色 M", "14K No.15 M；日本目录代码 FKK-3MRP-BNM"],
    ["BNB", "日本棕色 B", "14K No.15 B；日本目录代码 FKK-3MRP-BNB"],
    ["BNS", "日本棕色 S", "14K No.15 S；日本目录代码 FKK-3MRP-BNS"],
  ].map(([code, name, notes]) => ({
    key: `${SCOPE}-${code.toLowerCase()}`,
    name,
    releaseYear: "现行日本目录",
    notes,
    sourceKey: SOURCES.japan.key,
    variantKind: "market_sku" as const,
    productCode: `FKK-3MRP-${code}`,
    market: "日本 Pilot 网页目录",
  })),
  spec: {
    brandEntityId: PHASE394_PILOT_BRAND_ID,
    values: {
      series_name: "Pilot Custom 823／CUSTOM823",
      release_year: "2000",
      origin_country: "日本 Pilot Custom 产品线；地区供应与包装按目录核对",
      nib: "14K gold No.15；日本目录 F/M/B/S，具体市场按 SKU",
      fill_system: "vacuum plunger filling（真空活塞／真空柱塞）",
      material: "树脂笔身与透明或半透明墨仓；饰件随市场与版本记录",
      dimensions: "日本当前透明 F SKU：全长约 148.4 mm、最大径约 15.7 mm、29.5 g；官方历史约 1.5 ml",
      status: "现行型号；透明、透明黑、棕色与 smoke/amber 为市场或颜色记录，不与 Custom 74、845、912 混写",
    },
    evidence: [
      evidence(`${SCOPE}-brand`, "brand_entity_id", SOURCES.japan, "Pilot official catalogue maker context"),
      evidence(`${SCOPE}-series`, "series_name", SOURCES.lineup, "official CUSTOM823 title and code"),
      evidence(`${SCOPE}-release`, "release_year", SOURCES.history, "official 2000 history entry"),
      evidence(`${SCOPE}-origin`, "origin_country", SOURCES.japan, "Pilot Japan catalogue context"),
      evidence(`${SCOPE}-nib`, "nib", SOURCES.japan, "14K No.15 and F/M/B/S table"),
      evidence(`${SCOPE}-fill`, "fill_system", SOURCES.history, "plunger-type filling history"),
      evidence(`${SCOPE}-material`, "material", SOURCES.japan, "official resin/body catalogue field"),
      evidence(`${SCOPE}-dimensions`, "dimensions", SOURCES.japan, "current NCF dimensions and weight"),
      evidence(`${SCOPE}-status`, "status", SOURCES.support, "current support model and care boundaries"),
    ],
  },
  media: [
    {
      key: `${SCOPE}-primary-media`,
      title: "Pilot Custom 823 事实卡（非产品照片）",
      sourceKey: SOURCES.svg.key,
      localPath: SOURCES.svg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不表现真实比例、颜色校样、Logo 或刻字。",
      sourceUrl: SOURCES.svg.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: `${SCOPE}-release-event`,
      title: "CUSTOM823 进入 Pilot Custom 产品线",
      eventType: "model_released",
      startDate: "2000",
      circa: false,
      description:
        "Pilot Custom 官方历史页把 CUSTOM823 的系列节点放在 2000 年，并与 plunger-type 大容量吸墨机制关联。",
      sourceKey: SOURCES.history.key,
    },
  ],
  conflicts: [],
};

const pilotBrand: CuratedEntityPack = structuredClone(baseBrand);
pilotBrand.key = "phase394-pilot-brand-v1";

export const phase394PilotCustom823RefreshPacks: CuratedEntityPack[] = [pilotBrand, pilot823];
