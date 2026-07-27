import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE312_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE312_GALAXY_ID = "phase312-platinum-izumo-piz-160000-galaxy";
export const PHASE312_GALAXY_SLUG = "platinum-izumo-piz-160000-galaxy";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase312-piz-160000-galaxy-current";
const BOUNDARY_SCOPE = "phase312-piz-160000-galaxy-boundaries";
const CARE_SCOPE = "phase312-piz-160000-galaxy-care";
const MEDIA_SCOPE = "phase312-piz-160000-galaxy-media";

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
  const registryKey = input.registryKey ?? "platinum-official-phase312";
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
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }],
  };
}

function specEvidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  official: web({
    key: "phase312-piz-160000-official",
    title: "New Product Specifications Izumo Raden Galaxy — PIZ-160000",
    url: "https://www.platinum-pen.co.jp/en/news/detail/?pid=10342",
    publishedAt: "2021-09-24",
    summary:
      "Platinum 官方发布稿确认 Izumo Raden Galaxy 产品号 PIZ-160000、#56 Galaxy、Raden on ebonite、Urushi、18K 铑饰 F/M/B 尖、153 mm、13.8 mm、34.4 g 和附件。",
    locator: "2021-09-24 release heading; product code; nib; size/weight; material and accessory fields",
  }),
  family: web({
    key: "phase312-piz-izumo-family",
    title: "Platinum IZUMO brand lineup",
    url: "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70",
    summary:
      "Platinum Izumo 品牌页把 Yakumonuri、Raden、Precious Wood 和 Maki-e 产品号分开；用于确认 Galaxy 不能与 PIZ-80000N 或 PIZ-150000PW 合并。",
    locator: "IZUMO lineup headings and separate PIZ product cards",
  }),
  maintenance: web({
    key: "phase312-piz-izumo-maintenance",
    title: "Common practices on how to ensure long-term use of Izumo",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf",
    summary:
      "Platinum Izumo 手册支持定期取下墨囊/转换器、以清水或温水冲洗笔尖和使用原厂替换耗材；不把它扩写为 Raden 漆层长期浸泡保证。",
    locator: "Izumo manual long-term-use heading; cartridge/converter removal and nib rinse",
  }),
  retailer: web({
    key: "phase312-piz-160000-bookbinders",
    title: "Platinum Izumo Raden Galaxy Fountain Pen",
    url: "https://www.bookbindersdesign.com.au/products/platinum-fountain-pen-izumo-raden-galaxy",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "bookbinders-phase312",
    registryName: "Bookbinders Design",
    homepageUrl: "https://www.bookbindersdesign.com.au/",
    author: "Bookbinders Design",
    summary:
      "Bookbinders 专业经销页把 Raden Galaxy 列为 PIZ-160000，交叉记录 F/M/B、18K 金尖、墨囊/转换器和桐箱；不替代 Platinum 官方的材料与日期口径。",
    locator: "Code PIZ-160000, nib, filling system and gift-box fields",
  }),
  retailer2: web({
    key: "phase312-piz-160000-fookhing",
    title: "Izumo Raden Galaxy — PIZ-160000 #56",
    url: "https://fookhing.com.sg/products/platinum/izumo-raden-galaxy/",
    sourceType: "retailer",
    tier: "retailer",
    registryKey: "fookhing-phase312",
    registryName: "Fook Hing Trading Co",
    homepageUrl: "https://fookhing.com.sg/",
    author: "Fook Hing Trading Co",
    summary:
      "Fook Hing 零售页以 PIZ-160000 #56 Galaxy 和银灰笔袋、30 ml 墨水、墨囊、转换器、桐箱列出商品；只作附件和市场名称辅助。",
    locator: "PIZ-160000 #56 title and package/accessory list",
  }),
  diagram: web({
    key: "phase312-piz-160000-svg",
    title: "PIZ-160000 Raden Galaxy factual diagram",
    url: "/images/library/site-original/phase312/platinum/izumo-piz-160000-galaxy.svg",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase312",
    summary: "本站原创事实 SVG，标出 PIZ-160000 Galaxy 的 Raden/Urushi/ebonite、规格和型号边界；非产品照片。",
    locator: "site-original factual SVG metadata",
  }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find(
  (pack) => pack.entityId === PHASE312_PLATINUM_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 312 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase312-platinum-izumo-piz-160000-galaxy-v1",
  entityId: PHASE312_GALAXY_ID,
  expectedType: "pen",
  expectedSlug: PHASE312_GALAXY_SLUG,
  canonicalName: "Platinum Izumo Raden Galaxy PIZ-160000（#56）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/platinum-izumo-piz-160000-galaxy-phase312.md",
  storyTitle: "Platinum Izumo Raden Galaxy PIZ-160000：黑底螺钿的 #56",
  primarySourceKey: S.official.key,
  depthTier: "A",
  aliases: [
    { alias: "Platinum Izumo Raden Galaxy PIZ-160000", language: "en", sourceKey: S.official.key },
    { alias: "Izumo Raden Galaxy #56", language: "en", sourceKey: S.retailer.key },
    { alias: "白金 出云 螺钿 银河 PIZ-160000", language: "zh", sourceKey: S.official.key },
  ],
  sources: [S.official, S.family, S.maintenance, S.retailer, S.retailer2, S.diagram],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Platinum Japan Izumo Raden Galaxy",
      validFrom: "2021-09-24",
      productionState: "current",
      nibScope: "18K gold and rhodium plated; F/M/B",
      materialScope: "Raden and Urushi on ebonite barrel/cap; AS resin grip; gold-plated beryllium copper clip",
      editionScope: "PIZ-160000, barrel colour #56 Galaxy",
    },
    {
      key: BOUNDARY_SCOPE,
      scopeKey: BOUNDARY_SCOPE,
      productionState: "current",
      editionScope: "Independent from PIZ-80000N Yakumonuri, PIZ-150000PW Precious Wood and PIZ-150000C Maki-e/bamboo routes",
    },
    {
      key: CARE_SCOPE,
      scopeKey: CARE_SCOPE,
      productionState: "current",
      editionScope: "Platinum cartridge/converter cleaning; no solvent, polishing or long-soak claim for Raden lacquer",
    },
    {
      key: MEDIA_SCOPE,
      scopeKey: MEDIA_SCOPE,
      productionState: "current",
      editionScope: "Site-original factual SVG; not a product photograph or Raden pattern proof",
    },
  ],
  claims: [
    claim(
      "phase312-galaxy-identity",
      "model_identity",
      "PIZ-160000 是 Platinum Izumo Raden Galaxy 独立型号，官方 #56 GALAXY；它不是 PIZ-80000N 或 PIZ-150000PW 的配色别名。",
      S.official.key,
      "product code PIZ-160000 and #56 GALAXY fields",
    ),
    claim(
      "phase312-galaxy-release",
      "release_context",
      "官方发布稿日期为 2021-09-24；当前价格、库存和销售地区不由这条历史发布稿固定。",
      S.official.key,
      "2021.9.24 Pressrelease heading",
    ),
    claim(
      "phase312-galaxy-material",
      "material_and_craft",
      "Galaxy 在 ebonite 笔身与笔盖上施 Raden 和 Urushi，握位为 AS 树脂，笔夹为镀金铍铜；黑底星点来自装饰工艺而非普通树脂颜色。",
      S.official.key,
      "Raden/Urushi process and barrel/cap, clip, grip material fields",
    ),
    claim(
      "phase312-galaxy-spec",
      "specification",
      "官方规格为 18K 铑饰尖 F/M/B、全长 153 mm、最大径 13.8 mm、重量 34.4 g，供墨为墨囊/Converter-800A。",
      S.official.key,
      "nib, size, weight, converter and cartridge fields",
    ),
    claim(
      "phase312-galaxy-boundary",
      "identity_boundaries",
      "Galaxy 与 PIZ-80000N 银线/研金八云涂、PIZ-150000PW 花梨瘤无夹木轴及其他 Izumo Maki-e 产品保持独立身份，不共享图片或规格。",
      S.family.key,
      "Izumo lineup product-number and material separation",
    ),
    claim(
      "phase312-galaxy-care",
      "maintenance_guidance",
      "按 Izumo 手册定期取下墨囊/转换器并用清水或温水冲洗笔尖；Raden 漆面不应接触强溶剂、研磨剂或长期浸泡。",
      S.maintenance.key,
      "cartridge/converter removal and nib rinse guidance",
    ),
    claim(
      "phase312-galaxy-retailer-crosscheck",
      "market_sku_crosscheck",
      "Bookbinders 以 PIZ-160000 记录 Galaxy 的 F/M/B、18K 金尖和墨囊/转换器，作为独立市场资料交叉核对，不替代官方工艺与规格来源。",
      S.retailer.key,
      "Code, nib, filling and package fields",
    ),
    claim(
      "phase312-galaxy-media",
      "media_identity_boundary",
      "主图是本站原创事实 SVG，非产品照片，不证明真实螺钿星点、颜色、比例、光泽、刻字、库存或包装批次。",
      S.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase312-galaxy-56",
      name: "#56 Galaxy",
      releaseYear: "2021-09-24",
      notes: "官方发布稿列出的黑色 Galaxy Raden 路线；不拆成星点颜色或照片版本。",
      sourceKey: S.official.key,
      variantKind: "material",
      productCode: "PIZ-160000",
      market: "日本/国际经销",
    },
    {
      key: "phase312-galaxy-nibs",
      name: "18K 铑饰 F / M / B",
      notes: "同一 PIZ-160000 型号下的字幅选择，不是独立实体。",
      sourceKey: S.official.key,
      variantKind: "nib",
      productCode: "PIZ-160000",
      market: "日本/国际经销",
    },
  ],
  spec: {
    brandEntityId: PHASE312_PLATINUM_BRAND_ID,
    values: {
      series_name: "Platinum Izumo Raden Galaxy PIZ-160000（#56）",
      release_year: "2021-09-24",
      origin_country: "日本品牌；官方未外推具体漆艺工坊",
      nib: "18K 金、铑饰；F、M、B",
      fill_system: "Platinum 墨囊／Converter-800A 两用式",
      material: "Raden/Urushi on ebonite；AS resin grip；gold-plated beryllium copper clip",
      dimensions: "全长 153 mm × 最大径 13.8 mm",
      weight: "34.4 g",
      price_range: "官方发布页未固定现价；零售价格/库存按日期核对",
      status: "PIZ-160000 #56 Galaxy 独立 Raden 型号",
    },
    evidence: [
      specEvidence("phase312-brand", "brand_entity_id", S.official.key, "Izumo/Platinum product identity"),
      specEvidence("phase312-series", "series_name", S.official.key, "PIZ-160000 and #56 Galaxy title"),
      specEvidence("phase312-release", "release_year", S.official.key, "2021-09-24 release date"),
      specEvidence("phase312-origin", "origin_country", S.official.key, "Platinum Japan official context; no factory inference"),
      specEvidence("phase312-nib", "nib", S.official.key, "18K rhodium-plated F/M/B nib field"),
      specEvidence("phase312-fill", "fill_system", S.official.key, "Converter-800A and cartridge fields"),
      specEvidence("phase312-material", "material", S.official.key, "Raden/Urushi ebonite, AS grip and clip fields"),
      specEvidence("phase312-dimensions", "dimensions", S.official.key, "153 mm x 13.8 mm size field"),
      specEvidence("phase312-weight", "weight", S.official.key, "34.4 g weight field"),
      specEvidence("phase312-price", "price_range", S.retailer.key, "retailer price is date-bound; no official current price claim"),
      specEvidence("phase312-status", "status", S.official.key, "PIZ-160000 #56 Galaxy release scope"),
    ],
  },
  timeline: [
    {
      key: "phase312-galaxy-release-event",
      title: "Izumo Raden Galaxy #56 发布",
      eventType: "model_released",
      startDate: "2021-09-24",
      circa: false,
      description: "Platinum 官方发布稿列出 PIZ-160000、Galaxy Raden 工艺与规格。",
      sourceKey: S.official.key,
    },
  ],
  media: [
    {
      key: "phase312-galaxy-primary-media",
      title: "PIZ-160000 Raden Galaxy 事实卡（非产品照片）",
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

export const phase312PlatinumIzumoPiz160000GalaxyPacks: CuratedEntityPack[] = [
  inheritedBrand,
  model,
];
