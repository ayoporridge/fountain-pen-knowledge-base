import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE311_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE311_PIZ_ID = "phase311-platinum-izumo-piz-150000pw";
export const PHASE311_PIZ_SLUG = "platinum-izumo-piz-150000pw";
const RETRIEVED = "2026-07-28";
const CURRENT_SCOPE = "phase311-piz-150000pw-current";
const BOUNDARY_SCOPE = "phase311-piz-150000pw-izumo-boundary";
const CARE_SCOPE = "phase311-piz-150000pw-care";
const MEDIA_SCOPE = "phase311-piz-150000pw-media";

function web(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  registryKey?: string;
  registryName?: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? "platinum-official-phase311";
  return {
    key: input.key,
    registryKey,
    registryName:
      input.registryName ??
      (sourceType === "official"
        ? "Platinum Pen Co., Ltd."
        : "Fountain Pen Graph editorial studio"),
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (sourceType === "official" ? "https://www.platinum-pen.co.jp/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author:
      input.author ??
      (sourceType === "official"
        ? "Platinum Pen Co., Ltd."
        : "Fountain Pen Graph editorial"),
    publishedAt: input.publishedAt ?? null,
    retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator:
      sourceType === "user_submission"
        ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
        : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
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
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: CURRENT_SCOPE, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: CURRENT_SCOPE, locator, qualifies: true };
}

const S = {
  officialEn: web({
    key: "phase311-piz-150000pw-official-en",
    title: "IZUMO new series, Precious Wood — PIZ-150000PW",
    url: "https://www.platinum-pen.co.jp/en/news/detail/?pid=13050",
    publishedAt: "2025-08-19",
    summary:
      "Platinum 官方英文发布稿确认 Precious Wood 首作 PIZ-150000PW，花梨瘤 Amboyna burl 木轴与笔盖、树脂握位、无笔夹、18K F/M/B、166 mm、18.4 mm、平均 26.7 g 及附件。",
    locator: "Precious Wood heading; PIZ-150000PW product number; nib, material, size, weight and accessory fields",
  }),
  officialJp: web({
    key: "phase311-piz-150000pw-official-jp",
    title: "出云品牌新系列銘木：花梨瘤 PIZ-150000PW",
    url: "https://www.platinum-pen.co.jp/news/13050/",
    publishedAt: "2025-08-19",
    summary:
      "Platinum 日文发布稿补充 2025-08-25 发售、全球限定 50 支、含税 ¥165,000、花梨瘤自然纹理与接受凹痕划痕的木轴使用边界。",
    locator: "发布日、世界限定 50 本、价格、花梨瘤说明和产品规格区块",
  }),
  family: web({
    key: "phase311-piz-izumo-family-boundary",
    title: "Platinum IZUMO brand lineup",
    url: "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70",
    summary:
      "Platinum Izumo 品牌页把 Yakumonuri、Raden、Precious Wood 等材料和产品号分开；用于确认 PIZ-150000PW 不能回填 PIZ-80000N 或其他漆艺型号。",
    locator: "IZUMO lineup cards and separate PIZ product-number labels",
  }),
  maintenance: web({
    key: "phase311-piz-izumo-maintenance",
    title: "Common practices on how to ensure long-term use of Izumo",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf",
    summary:
      "Platinum Izumo 手册说明墨囊/转换器取下、清水或温水冲洗笔尖及使用原厂替换品的边界；本页只把它用于供墨清洁，不宣称木轴耐久保证。",
    locator: "Izumo long-term-use manual; cartridge/converter removal and nib rinse steps",
  }),
  retailer: web({
    key: "phase311-piz-150000pw-goldspot",
    title: "Platinum Izumo Precious Wood Fountain Pen in Karin-Kobu",
    url: "https://goldspot.com/products/platinum-izumo-precious-wood-fountain-pen-in-karin-kobu",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "goldspot-phase311",
    registryName: "Goldspot Pens",
    homepageUrl: "https://goldspot.com/",
    author: "Goldspot Pens",
    summary:
      "Goldspot 专业经销页以 PIZ-150000PW 与 Karin-Kobu/Amboyna burl 名称列出该限量款；只用于市场 SKU 与材料名称交叉核对，不替代 Platinum 的官方规格。",
    locator: "product title, PIZ-150000PW SKU and Karin-Kobu/Amboyna burl description",
  }),
  diagram: web({
    key: "phase311-piz-150000pw-svg",
    title: "PIZ-150000PW Karin-Kobu factual diagram",
    url: "/images/library/site-original/phase311/platinum/izumo-piz-150000pw.svg",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase311",
    summary: "本站原创事实 SVG，标出 PIZ-150000PW 的无夹、花梨瘤木轴、18K 尖与尺寸边界；非产品照片。",
    locator: "site-original factual SVG metadata",
  }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find(
  (pack) => pack.entityId === PHASE311_PLATINUM_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 311 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase311-platinum-izumo-piz-150000pw-v1",
  entityId: PHASE311_PIZ_ID,
  expectedType: "pen",
  expectedSlug: PHASE311_PIZ_SLUG,
  canonicalName: "Platinum Izumo Precious Wood PIZ-150000PW 花梨瘤",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/platinum-izumo-piz-150000pw-phase311.md",
  storyTitle: "Platinum Izumo PIZ-150000PW：花梨瘤木轴的 Precious Wood 首作",
  primarySourceKey: S.officialEn.key,
  depthTier: "A",
  aliases: [
    { alias: "Platinum Izumo Precious Wood PIZ-150000PW", language: "en", sourceKey: S.officialEn.key },
    { alias: "PIZ-150000PW Karin-Kobu", language: "en", sourceKey: S.officialJp.key },
    { alias: "白金 出云 銘木 花梨瘤", language: "zh", sourceKey: S.officialJp.key },
  ],
  sources: [S.officialEn, S.officialJp, S.family, S.maintenance, S.retailer, S.diagram],
  scopes: [
    {
      key: CURRENT_SCOPE,
      scopeKey: CURRENT_SCOPE,
      market: "Platinum Japan Precious Wood first edition",
      validFrom: "2025-08-25",
      productionState: "current",
      nibScope: "Large 18K F/M/B",
      materialScope: "Amboyna burl oil-finished barrel and cap; resin grip; no clip",
      editionScope: "#1 Karin-Kobu, PIZ-150000PW, worldwide limited 50 pieces",
    },
    {
      key: BOUNDARY_SCOPE,
      scopeKey: BOUNDARY_SCOPE,
      productionState: "current",
      editionScope: "Independent from PIZ-80000N Yakumonuri, PIZ-160000 Galaxy Raden and PIZ-150000C lacquer/bamboo routes",
    },
    {
      key: CARE_SCOPE,
      scopeKey: CARE_SCOPE,
      productionState: "current",
      editionScope: "Platinum cartridge/converter cleaning; no wood refinishing or solvent claim",
    },
    {
      key: MEDIA_SCOPE,
      scopeKey: MEDIA_SCOPE,
      productionState: "current",
      editionScope: "Site-original factual SVG; not a product photograph or wood-grain proof",
    },
  ],
  claims: [
    claim(
      "phase311-piz-identity",
      "model_identity",
      "PIZ-150000PW 是 Platinum Izumo Precious Wood 系列 2025 年首作花梨瘤（Karin-Kobu）独立型号，不是 PIZ-80000N 的木纹颜色别名。",
      S.officialEn.key,
      "Precious Wood series and PIZ-150000PW product number",
    ),
    claim(
      "phase311-piz-release",
      "release_and_limit",
      "官方日文发布稿列发售日 2025-08-25、全球限定 50 支和含税 ¥165,000；这些是发布时点快照。",
      S.officialJp.key,
      "発売日、世界限定50本、価格 fields",
    ),
    claim(
      "phase311-piz-material",
      "material_and_form",
      "胴轴与笔盖为花梨瘤 Amboyna burl 木轴油仕上，握位为树脂，刻意取消笔夹并减少顶涂层；凹痕、划痕和木纹个体差异属于材料边界。",
      S.officialEn.key,
      "barrel/cap material, resin grip, no clip and aging description",
    ),
    claim(
      "phase311-piz-spec",
      "specification",
      "官方规格为大型 18K F/M/B 尖、全长 166 mm、最大径 18.4 mm、平均重量 26.7 g；随附 Converter、墨囊、20 ml 墨水、桐箱和护理布。",
      S.officialEn.key,
      "nib, size, weight and accessory fields",
    ),
    claim(
      "phase311-piz-boundary",
      "identity_boundaries",
      "PIZ-150000PW 与基础 PIZ-80000N Yakumonuri、Raden Galaxy 和其他 Izumo 漆艺/竹材产品保持独立身份，不共享尺寸、材质或图片。",
      S.family.key,
      "IZUMO lineup product-number and material cards",
    ),
    claim(
      "phase311-piz-care",
      "maintenance_guidance",
      "使用 Platinum 墨囊或 Converter-800A，换墨时以清水清洁笔尖并充分晾干；Izumo 手册不提供木轴自行上漆、打磨或长期浸泡的依据。",
      S.maintenance.key,
      "cartridge/converter removal and water rinse guidance",
    ),
    claim(
      "phase311-piz-retailer-crosscheck",
      "market_sku_crosscheck",
      "Goldspot 也以 PIZ-150000PW 和 Karin-Kobu/Amboyna burl 列出该款；零售页用于交叉核对市场名称，不替代官方限量、规格或维护口径。",
      S.retailer.key,
      "retailer title, SKU and material naming",
    ),
    claim(
      "phase311-piz-media",
      "media_identity_boundary",
      "主图是本站原创事实 SVG，非产品照片，不证明真实木纹、颜色、比例、光泽、刻字、库存或包装批次。",
      S.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase311-piz-karin-kobu",
      name: "#1 Karin-Kobu 花梨瘤",
      releaseYear: "2025-08-25",
      notes: "Precious Wood 首作，花梨瘤木轴/笔盖、无夹；纹理和颜色为天然个体差异，不拆成多个型号。",
      sourceKey: S.officialJp.key,
      variantKind: "material",
      productCode: "PIZ-150000PW",
      market: "日本；全球限定",
    },
    {
      key: "phase311-piz-nibs",
      name: "大型 18K F / M / B",
      notes: "同一 PIZ-150000PW 材料路线下的字幅选择，不是独立型号。",
      sourceKey: S.officialEn.key,
      variantKind: "nib",
      productCode: "PIZ-150000PW",
      market: "日本",
    },
  ],
  spec: {
    brandEntityId: PHASE311_PLATINUM_BRAND_ID,
    values: {
      series_name: "Platinum Izumo Precious Wood PIZ-150000PW 花梨瘤",
      release_year: "2025-08-25",
      origin_country: "日本品牌；官方资料未外推具体木轴工坊",
      nib: "大型 18K 金尖；F、M、B",
      fill_system: "Platinum 墨囊／Converter-800A 两用式",
      material: "花梨瘤 Amboyna burl 木轴与笔盖油仕上；树脂握位；无笔夹",
      dimensions: "全长 166 mm × 最大径 18.4 mm",
      weight: "平均 26.7 g",
      price_range: "官方发布时含税 ¥165,000；世界限定 50 支",
      status: "2025-08-25 发布的 Precious Wood 首作；PIZ-150000PW #1 Karin-Kobu",
    },
    evidence: [
      evidence("phase311-brand", "brand_entity_id", S.officialEn.key, "Izumo/Platinum product identity"),
      evidence("phase311-series", "series_name", S.officialEn.key, "Precious Wood and PIZ-150000PW title"),
      evidence("phase311-release", "release_year", S.officialJp.key, "2025-08-25 release date"),
      evidence("phase311-origin", "origin_country", S.officialEn.key, "Platinum Japan official context; no factory inference"),
      evidence("phase311-nib", "nib", S.officialEn.key, "Large 18K F/M/B nib field"),
      evidence("phase311-fill", "fill_system", S.officialEn.key, "Converter and cartridge accessory fields"),
      evidence("phase311-material", "material", S.officialEn.key, "Amboyna burl barrel/cap, resin grip and no clip"),
      evidence("phase311-dimensions", "dimensions", S.officialEn.key, "166 mm x 18.4 mm size field"),
      evidence("phase311-weight", "weight", S.officialEn.key, "average 26.7 g weight field"),
      evidence("phase311-price", "price_range", S.officialJp.key, "¥165,000 and worldwide limited 50"),
      evidence("phase311-status", "status", S.officialJp.key, "PIZ-150000PW release and first-edition scope"),
    ],
  },
  timeline: [
    {
      key: "phase311-piz-release-event",
      title: "Izumo Precious Wood 花梨瘤首作发布",
      eventType: "model_released",
      startDate: "2025-08-25",
      circa: false,
      description: "Platinum 官方日文发布稿列 PIZ-150000PW 的发售日、限量数量和花梨瘤规格。",
      sourceKey: S.officialJp.key,
    },
  ],
  media: [
    {
      key: "phase311-piz-primary-media",
      title: "PIZ-150000PW 花梨瘤事实卡（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
};

export const phase311PlatinumIzumoPiz150000PwPacks: CuratedEntityPack[] = [
  inheritedBrand,
  model,
];
