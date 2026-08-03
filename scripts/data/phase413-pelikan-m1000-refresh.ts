import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE32_M1000_ID,
  PHASE32_PELIKAN_ID,
  phase32PelikanP0Packs,
} from "./phase32-pelikan-p0";

export const PHASE413_PELIKAN_BRAND_ID = PHASE32_PELIKAN_ID;
export const PHASE413_M1000_ID = PHASE32_M1000_ID;
export const PHASE413_M1000_SLUG = "pelikan-souveran-m1000";
export const PHASE413_M1000_NAME = "Pelikan Souverän M1000";

const RETRIEVED = "2026-08-03";
const CURRENT_SCOPE = "phase413-pelikan-m1000-current-2026-08-03";
const NIB_SCOPE = "phase413-pelikan-m1000-nib-options";
const FILL_SCOPE = "phase413-pelikan-m1000-piston-fill";
const HISTORY_SCOPE = "phase413-pelikan-m1000-history";
const MATERIAL_SCOPE = "phase413-pelikan-m1000-material-finish";
const M1005_SCOPE = "phase413-pelikan-m1005-boundary";
const M1050_SCOPE = "phase413-pelikan-m1050-boundary";
const SPECIAL_SCOPE = "phase413-pelikan-m1000-special-editions";
const CARE_SCOPE = "phase413-pelikan-m1000-care";
const SAMPLE_SCOPE = "phase413-pelikan-m1000-samples";
const COMMERCIAL_SCOPE = "phase413-pelikan-m1000-commercial";
const MEDIA_SCOPE = "phase413-pelikan-m1000-media";

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
  itemType?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const homepageUrl = sourceType === "official"
    ? "https://www.pelikan.com/"
    : new URL(input.url).origin;
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl,
    itemType: input.itemType ?? (input.url.toLowerCase().includes(".pdf") ? "pdf" : "web_page"),
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function photo(): CuratedSource {
  const localPath = "/images/library/wikimedia/pelikan-p0/pelikan-m1000-ii-m-dreibelbis.jpg";
  return {
    key: "phase413-pelikan-m1000-wikimedia-photo",
    registryKey: "wikimedia-commons-m-dreibelbis-phase413",
    registryName: "Wikimedia Commons — M Dreibelbis",
    sourceType: "wikimedia",
    tier: "primary",
    independenceGroup: "wikimedia-m-dreibelbis-m1000-2017",
    title: "File:Pelikan M1000 II (36753113884).jpg",
    url: "https://commons.wikimedia.org/wiki/File:Pelikan_M1000_II_(36753113884).jpg",
    homepageUrl: "https://commons.wikimedia.org/",
    itemType: "image",
    author: "M Dreibelbis",
    publishedAt: "2017-10-02",
    retrievedAt: RETRIEVED,
    summary: "M Dreibelbis 于 2017-10-02 拍摄的一支 M1000；Flickr 原图转入 Wikimedia Commons，CC BY 2.0，经授权审查。",
    allowedUse: "store_full",
    license: "cc-by-2.0",
    archiveUrl: localPath,
    archiveLocator: "project-public-asset:/images/library/wikimedia/pelikan-p0/pelikan-m1000-ii-m-dreibelbis.jpg;source-original=https://upload.wikimedia.org/wikipedia/commons/5/5b/Pelikan_M1000_II_%2836753113884%29.jpg;source-author=M_Dreibelbis;photo-date=2017-10-02;source-license=CC-BY-2.0;commons-review=FlickreviewR_2_2018-06-16;dimensions=5216x3632;resize=false;crop=false;color-edit=false",
  };
}

const S = {
  catalog: web({
    key: "phase413-pelikan-current-catalog",
    registryKey: "pelikan-fine-writing-current-catalog-phase413",
    registryName: "Pelikan Fine Writing current catalogue",
    title: "Fine Writing Instruments current catalog",
    url: "https://www.pelikan.com/images/assets/catalogs/fine-writing-instruments-current-catalog-en.pdf",
    summary: "官方当前目录列 M1000 的活塞、18K/750 双色 EF/F/M/B、约 1.35 ml、黑／黑绿条纹、尺寸级别和产品编号。",
  }),
  faq: web({
    key: "phase413-pelikan-faq",
    registryKey: "pelikan-official-faq-phase413",
    registryName: "Pelikan official FAQ",
    title: "Pelikan Fine Writing FAQ",
    url: "https://www.pelikan.com/int/frequently-asked-questions.html",
    summary: "官方 FAQ 给出 M1000 14.7 cm 闭帽、17.5 cm 套帽、14.1 mm、32.6 g，并说明活塞填充、清洁和维修边界。",
  }),
  product: web({
    key: "phase413-pelikan-m1000-black-product",
    registryKey: "pelikan-passion-m1000-product-phase413",
    registryName: "Pelikan official product page",
    title: "Souverän 1000 Black product page",
    url: "https://www.pelikan-passion.com/co/escritura/premium/souveraen/souveran-1000-black.html",
    summary: "官方黑色 M1000 产品页列当前身份、闭帽约 14.6 cm、32.6 g 和标准黑色金饰路线。",
  }),
  warranty: web({
    key: "phase413-pelikan-warranty-care",
    registryKey: "pelikan-warranty-care-phase413",
    registryName: "Pelikan official warranty and care",
    title: "Fine writing instruments warranty and care",
    url: "https://www.pelikan-passion.com/images/assets/fwi_warranty_current.pdf",
    tier: "contemporary_archive",
    summary: "官方服务资料用于保修、冷水吸排、清洁和送修条件；不把保修变成二手笔无条件承诺。",
  }),
  collectibles: web({
    key: "phase413-pelikan-collectibles-m1000",
    registryKey: "pelikan-collectibles-m1000-phase413",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    author: "Dominic Rothemel",
    title: "Pelikan M1000 & M1005 Souverän",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M1000-Basis/index.html",
    summary: "权威收藏资料把 M1000 标为 1997 起、18 ct 金尖和黑／黑绿条纹，并独立列出 M1005、M1050、2024 Renaissance Brown 与艺术特别版。",
  }),
  blackDetail: web({
    key: "phase413-pelikan-m1000-black-detail",
    registryKey: "pelikan-collectibles-m1000-black-phase413",
    registryName: "Pelikan Collectibles M1000 detail",
    sourceType: "blog",
    tier: "professional_secondary",
    author: "Dominic Rothemel",
    title: "Pelikan M1000 Black detail",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M1000-Basis/M1000/M1000-Black/index.html",
    summary: "收藏资料的黑色标准生产款细节页，用于核对黑色、金饰和型号组边界。",
  }),
  renaissanceBrief: web({
    key: "phase413-pelikan-renaissance-brown-brief",
    registryKey: "pelikan-renaissance-brown-official-phase413",
    registryName: "Pelikan official Renaissance Brown brief",
    title: "Souverän 1000 Renaissance Brown",
    url: "https://mam.pelikan.com/en/pelikan/media/1099522/download",
    publishedAt: "2024-05",
    tier: "contemporary_archive",
    summary: "官方 2024 简报列棕色大理石 acrylic、18K 尖 EF/F/M/B、2024-05、€820 含税建议价和三年保修表述。",
  }),
  catalog2022: web({
    key: "phase413-pelikan-catalog-2022",
    registryKey: "pelikan-catalog-2022-phase413",
    registryName: "Pelikan historical catalogue archive",
    title: "Fine Writing Instruments 2022 catalog",
    url: "https://www.pelikan.com/images/assets/catalogs/fine-writing-instruments-2022-catalog-en.pdf",
    publishedAt: "2022",
    tier: "contemporary_archive",
    summary: "2022 官方目录交叉核对 M1000 黑／黑绿产品号、活塞和约 1.35 ml 容量，不替代当前目录。",
  }),
  perch: web({
    key: "phase413-pelikan-perch-m1000",
    registryKey: "the-pelikans-perch-m1000-phase413",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    author: "Joshua Danley",
    publishedAt: "2015-11-05",
    title: "Review: M1000 Green Striped (1997-Present)",
    url: "https://thepelikansperch.com/2015/11/05/pelikan-m1000-review/",
    summary: "专业评测补充 1997 历史、条纹透光、帽盖、黄铜活塞、尺寸和反向螺纹；明确完整拆活塞不属于例行维护。",
  }),
  renaissanceReview: web({
    key: "phase413-pelikan-perch-renaissance",
    registryKey: "the-pelikans-perch-renaissance-phase413",
    registryName: "The Pelikan's Perch Renaissance review",
    sourceType: "blog",
    tier: "professional_secondary",
    author: "Joshua Danley",
    publishedAt: "2024-09-02",
    title: "A Closer Look at the M1000 Renaissance Brown",
    url: "https://thepelikansperch.com/2024/09/02/pelikan-m1000-renaissance-brown-review/",
    summary: "2024 Renaissance Brown 独立评测，补充特别版的大尺寸、18K 尖和桌面使用语境；不替代官方价格和产品号。",
  }),
  goulet: web({
    key: "phase413-pelikan-goulet-comparison",
    registryKey: "goulet-pelikan-comparison-phase413",
    registryName: "Goulet Pens",
    sourceType: "retailer",
    tier: "retailer",
    title: "Pelikan Souverän fountain pen comparison",
    url: "https://www.gouletpens.com/blogs/fountain-pen-blog/pelikan-souveran-fountain-pen-comparison",
    summary: "零售编辑资料比较 M1000/M1005 的金银饰件、18K 尖和 Souverän 尺寸阶梯，用于导航，不替代官方型号表。",
  }),
  penAddict: web({
    key: "phase413-pelikan-penaddict",
    registryKey: "pen-addict-pelikan-m1000-phase413",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    author: "The Pen Addict",
    publishedAt: "2015-03-17",
    title: "Pelikan Souveran M1000 Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2015/3/17/pelikan-souveran-m1000-fountain-pen-review",
    summary: "独立样本提供出墨、尖端和使用体验；不把单支评测泛化为所有年份和尖号。",
  }),
  fpn: web({
    key: "phase413-pelikan-fpn-review",
    registryKey: "fountain-pen-network-m1000-phase413",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    author: "Fountain Pen Network reviewer",
    publishedAt: "2018-01-01",
    title: "Pelikan M1000 Review",
    url: "https://www.fountainpennetwork.com/forum/topic/333700-pelikan-m1000-review/",
    summary: "社群长评记录大尺寸、轻树脂、绿条纹和购买价值语境，只作个人样本与选购问题提示。",
  }),
  photo: photo(),
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
    key: "phase413-m1000-standard-black",
    name: "M1000 Black 标准黑色金饰款",
    releaseYear: "1997–",
    productCode: "M1000",
    notes: "标准 M1000 路线；黑色笔身、黑帽、金色饰件、18K 金尖和差动活塞。",
    sourceKey: S.product.key,
    variantKind: "edition_group",
  },
  {
    key: "phase413-m1000-green-striped",
    name: "M1000 Green-striped 黑绿条纹金饰款",
    releaseYear: "1997–",
    productCode: "M1000",
    notes: "标准生产条纹路线；透光度和条纹批次按实物与年代核对，不创建新的基础型号。",
    sourceKey: S.collectibles.key,
    variantKind: "color",
    parentVariantKey: "phase413-m1000-standard-black",
  },
  {
    key: "phase413-m1000-renaissance-brown",
    name: "M1000 Renaissance Brown（2024）",
    releaseYear: "2024",
    productCode: "M1000 Renaissance Brown",
    notes: "棕色／奶油色大理石 acrylic 特别版；EF/F/M/B、2024-05、€820 建议价只属于此版本。",
    sourceKey: S.renaissanceBrief.key,
    variantKind: "edition_group",
  },
  {
    key: "phase413-m1005-boundary",
    name: "M1005 银色饰件 sibling",
    releaseYear: "2011–",
    productCode: "M1005",
    notes: "独立银色饰件路线；部分版本使用镀铑 18K 尖，不回填 M1000 金色饰件和产品号。",
    sourceKey: S.collectibles.key,
    variantKind: "edition_group",
  },
  {
    key: "phase413-m1050-boundary",
    name: "M1050 Vermeil 历史 sibling",
    releaseYear: "1997–2001",
    productCode: "M1050",
    notes: "金银 vermeil 帽盖／饰件历史路线，独立型号，不回填标准 M1000 饰件或价格。",
    sourceKey: S.collectibles.key,
    variantKind: "edition_group",
  },
  {
    key: "phase413-m1000-makie-raden-boundary",
    name: "M1000 Maki-e／Raden 艺术特别版边界",
    releaseYear: "2002–",
    productCode: "M1000 special editions",
    notes: "以 M1000 为基础的漆艺、螺钿和限量款，材料、发行量、价格和护理另行核对。",
    sourceKey: S.collectibles.key,
    variantKind: "edition_group",
  },
  {
    key: "phase413-m800-family-boundary",
    name: "M800/M805 Souverän 尺寸 sibling",
    releaseYear: "家族对照",
    productCode: "M800/M805",
    notes: "同属 Souverän 活塞家族但尺寸、重量和尖号不同；只作选购对照，不是 M1000 变体。",
    sourceKey: S.goulet.key,
    variantKind: "edition_group",
  },
  {
    key: "phase413-m1000-period-finish",
    name: "M1000 历史 logo／条纹批次",
    releaseYear: "1997–",
    productCode: "M1000 period finish",
    notes: "帽顶 logo、条纹透光和包装可能随年代变化；没有多来源时不以单一细节断定年份。",
    sourceKey: S.perch.key,
    variantKind: "edition_group",
  },
];

const base = phase32PelikanP0Packs.find(
  (pack) => pack.entityId === PHASE413_M1000_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 413 requires the existing Pelikan M1000 identity.");

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase413-pelikan-m1000-refresh-v1",
  entityId: PHASE413_M1000_ID,
  expectedType: "pen",
  expectedSlug: PHASE413_M1000_SLUG,
  canonicalName: PHASE413_M1000_NAME,
  markdownFile: ".planning/content-research/pelikan-m1000-phase413.md",
  storyTitle: "Pelikan Souverän M1000：旗舰尺寸、1997 起点与活塞维护",
  primarySourceKey: S.catalog.key,
  publicationIntent: "publish",
  publicationBlockers: [],
  aliases: [
    { alias: "Pelikan M1000", language: "en", sourceKey: S.catalog.key },
    { alias: "Pelikan Souverän M1000", language: "de", sourceKey: S.catalog.key },
    { alias: "Pelikan Souveran M1000", language: "en", sourceKey: S.catalog.key },
    { alias: "Pelikan 1000", language: "en", sourceKey: S.collectibles.key },
    { alias: "百利金 M1000", language: "zh", sourceKey: S.product.key },
    { alias: "百利金 Souverän M1000", language: "zh", sourceKey: S.catalog.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: CURRENT_SCOPE,
      scopeKey: CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "18K/750 双色金尖；EF、F、M、B。",
      materialScope: "标准黑色或黑绿条纹金饰 M1000；条纹透光和批次需按实物核对。",
      editionScope: "标准 M1000；不含 M1005、M1050、Raden/Maki-e 和其他特别版。",
    },
    {
      key: NIB_SCOPE,
      scopeKey: NIB_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "EF、F、M、B；尖宽不直接等于跨品牌毫米线宽。",
      editionScope: "标准 M1000 当前目录尖号和个体调校边界。",
    },
    {
      key: FILL_SCOPE,
      scopeKey: FILL_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "内置差动活塞，约 1.35 ml 型号级近似容量；无原厂墨囊／converter 路线。",
    },
    {
      key: HISTORY_SCOPE,
      scopeKey: HISTORY_SCOPE,
      validFrom: "1997",
      productionState: "historical",
      editionScope: "M1000 1997 起点、历史 logo／条纹和后续特别版节点。",
    },
    {
      key: MATERIAL_SCOPE,
      scopeKey: MATERIAL_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      materialScope: "标准黑色／黑绿条纹；Renaissance Brown acrylic 与艺术漆艺另立。",
      editionScope: "颜色、饰件、透光和批次边界。",
    },
    {
      key: M1005_SCOPE,
      scopeKey: M1005_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "M1005 银色饰件 sibling；不回填 M1000 金色饰件和尖面。",
    },
    {
      key: M1050_SCOPE,
      scopeKey: M1050_SCOPE,
      validFrom: "1997",
      validTo: "2001",
      productionState: "historical",
      editionScope: "M1050 Vermeil 历史 sibling；不作为标准 M1000 颜色。",
    },
    {
      key: SPECIAL_SCOPE,
      scopeKey: SPECIAL_SCOPE,
      validFrom: "2002",
      productionState: "current",
      editionScope: "M1000 Maki-e、Raden 和其他限量特别版的基础平台边界。",
    },
    {
      key: CARE_SCOPE,
      scopeKey: CARE_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "清水吸排、自然干燥、活塞和笔尖单元的保守维护边界。",
    },
    {
      key: SAMPLE_SCOPE,
      scopeKey: SAMPLE_SCOPE,
      validFrom: "2015",
      productionState: "historical",
      editionScope: "专业评测和社群单支样本；不覆盖所有尖号、年份和颜色。",
    },
    {
      key: COMMERCIAL_SCOPE,
      scopeKey: COMMERCIAL_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "international",
      editionScope: "Renaissance Brown €820 官方 2024 价格快照；标准款按地区与日期报价。",
    },
    {
      key: MEDIA_SCOPE,
      scopeKey: MEDIA_SCOPE,
      validFrom: "2017-10-02",
      productionState: "historical",
      editionScope: "Wikimedia M1000 实物照片；只代表被拍摄样本。",
    },
  ],
  claims: [
    claim(
      "phase413-m1000-identity",
      "model_identity",
      "本页主体是标准 Pelikan Souverän M1000：黑色或黑绿条纹、金色饰件、18K 金尖和内置差动活塞；M1005、M1050 和艺术特别版另立。",
      S.catalog,
      "current M1000 listing and family separation",
      CURRENT_SCOPE,
      [S.product, S.collectibles],
    ),
    claim(
      "phase413-m1000-history",
      "release_history",
      "Pelikan Collectibles 与 The Pelikan's Perch 都把标准 M1000 的生产起点放在 1997 年；这不是每个颜色或特别版的首发年份。",
      S.collectibles,
      "M1000 production since 1997",
      HISTORY_SCOPE,
      [S.perch],
    ),
    claim(
      "phase413-m1000-dimensions",
      "current_dimensions",
      "当前官方资料给出闭帽约 14.6–14.7 cm、套帽约 17.5 cm、直径约 14.1 mm；FAQ 与产品页的 1 mm 长度差异保留为来源口径。",
      S.faq,
      "M1000 size comparison and current black product page",
      CURRENT_SCOPE,
      [S.product, S.catalog],
    ),
    claim(
      "phase413-m1000-weight-capacity",
      "weight_and_capacity",
      "当前目录／FAQ 口径约 32.6 g，官方型号表约 1.35 ml；实际装入量会受残墨、液面和操作影响。",
      S.catalog,
      "M1000 weight and approximate ink capacity",
      CURRENT_SCOPE,
      [S.faq, S.catalog2022],
    ),
    claim(
      "phase413-m1000-nib",
      "nib_options",
      "标准 M1000 使用 18K/750 双色金尖，当前目录列 EF、F、M、B；尖号不是跨品牌固定毫米线宽，个体调校和墨纸会改变体验。",
      S.catalog,
      "18K/750 bi-color EF/F/M/B listing",
      NIB_SCOPE,
      [S.renaissanceBrief, S.penAddict],
    ),
    claim(
      "phase413-m1000-filling",
      "filling_system",
      "M1000 采用内置差动活塞，从瓶中吸墨；完成填充时回滴少量并把尾钮转回闭合位置，不是墨囊／converter 型号。",
      S.faq,
      "official plunger system and fill guidance",
      FILL_SCOPE,
      [S.warranty, S.perch],
    ),
    claim(
      "phase413-m1000-material",
      "material_and_finish",
      "标准路线包括黑色与黑绿条纹金饰款；条纹透光度、logo、包装和批次可能变化，不能以单一照片推断所有年份和材料。",
      S.collectibles,
      "standard black and green-striped M1000 entries",
      MATERIAL_SCOPE,
      [S.blackDetail, S.perch],
    ),
    claim(
      "phase413-m1005-boundary",
      "related_model_boundary",
      "M1005 是银色饰件 sibling，部分版本使用镀铑 18K 尖；它不是标准 M1000 的银色颜色 variant。",
      S.collectibles,
      "separate M1005 model and silver trim entries",
      M1005_SCOPE,
      [S.goulet],
    ),
    claim(
      "phase413-m1050-boundary",
      "historical_model_boundary",
      "M1050 是 1997–2001 的 vermeil 帽盖／饰件历史路线，独立于标准 M1000。",
      S.collectibles,
      "M1050 production period and vermeil entries",
      M1050_SCOPE,
    ),
    claim(
      "phase413-m1000-special-editions",
      "special_edition_boundary",
      "M1000 平台被用于 Maki-e、Raden 和其他艺术特别版；发行量、表面漆层、价格和护理不能回填标准黑／绿条纹款。",
      S.collectibles,
      "M1000 limited editions and Maki-e sections",
      SPECIAL_SCOPE,
      [S.renaissanceBrief],
    ),
    claim(
      "phase413-m1000-maintenance",
      "maintenance_boundary",
      "活塞和笔尖单元虽可维修或旋出，但完整拆卸不是日常保养；换色先以清水吸排、自然干燥，异常时交由专业维修。",
      S.perch,
      "threaded piston assembly and not routine maintenance",
      CARE_SCOPE,
      [S.warranty, S.faq],
    ),
    claim(
      "phase413-m1000-renaissance",
      "commercial_snapshot",
      "2024 Renaissance Brown 官方简报列棕色大理石 acrylic、EF/F/M/B、2024-05、€820 含税建议价和三年保修表述；这些只属于该特别版的时间快照。",
      S.renaissanceBrief,
      "official Renaissance Brown brief price and availability",
      COMMERCIAL_SCOPE,
      [S.renaissanceReview],
    ),
    claim(
      "phase413-m1000-sample",
      "independent_sample",
      "专业评测和社群长评把 M1000 写成大尺寸、较湿、适合不套帽桌面书写的笔；这些观察绑定特定尖、墨水、纸张和手型。",
      S.perch,
      "independent writing and balance observations",
      SAMPLE_SCOPE,
      [S.penAddict, S.fpn, S.renaissanceReview],
      "editorial",
    ),
    claim(
      "phase413-m1000-photo",
      "primary_media_identity",
      "主图是 M Dreibelbis 于 2017-10-02 拍摄的一支 M1000，CC BY 2.0；只代表照片样本，不代表所有饰面、年代和尖号。",
      S.photo,
      "Commons file metadata, Flickr provenance and CC BY 2.0 review",
      MEDIA_SCOPE,
      [],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE413_PELIKAN_BRAND_ID,
    values: {
      series_name: "Pelikan Souverän 1000（标准 M1000；不含 M1005）",
      release_year: "1997",
      origin_country: "Germany",
      nib: "18K/750 双色金尖；EF、F、M、B",
      fill_system: "内置差动活塞；官方型号表约 1.35 ml",
      material: "黑色或黑绿条纹；材料、透明度和特别版按具体饰面核对",
      dimensions: "闭帽约 14.6–14.7 cm；套帽约 17.5 cm；直径约 14.1 mm",
      weight: "约 32.6 g（当前 FAQ／目录口径）",
      price_range: "2024 Renaissance Brown 官方简报建议 €820 含税；标准款按地区与日期报价",
      status: "标准 M1000 现行；M1005、M1050、Raden、Maki-e 和其他特别版另立",
    },
    evidence: [
      evidence("brand_entity_id", "phase413-m1000-brand", S.catalog.key, CURRENT_SCOPE, "verified existing Pelikan maker relation"),
      evidence("series_name", "phase413-m1000-series", S.catalog.key, CURRENT_SCOPE, "current Souverän M1000 listing"),
      evidence("release_year", "phase413-m1000-release", S.collectibles.key, HISTORY_SCOPE, "M1000 since 1997"),
      evidence("origin_country", "phase413-m1000-origin", S.catalog.key, CURRENT_SCOPE, "Pelikan German fine-writing production context"),
      evidence("nib", "phase413-m1000-nib-spec", S.catalog.key, NIB_SCOPE, "18K/750 EF/F/M/B"),
      evidence("fill_system", "phase413-m1000-fill-spec", S.faq.key, FILL_SCOPE, "official plunger system"),
      evidence("material", "phase413-m1000-material-spec", S.collectibles.key, MATERIAL_SCOPE, "black and green-striped standard finishes"),
      evidence("dimensions", "phase413-m1000-dimensions-spec", S.faq.key, CURRENT_SCOPE, "14.7 cm, 17.5 cm, 14.1 mm"),
      evidence("weight", "phase413-m1000-weight-spec", S.faq.key, CURRENT_SCOPE, "32.6 g"),
      evidence("price_range", "phase413-m1000-price-spec", S.renaissanceBrief.key, COMMERCIAL_SCOPE, "2024 Renaissance Brown €820 recommendation"),
      evidence("status", "phase413-m1000-status-spec", S.catalog.key, CURRENT_SCOPE, "current catalogue listing"),
    ],
  },
  timeline: [
    {
      key: "phase413-m1000-1997",
      title: "标准 M1000 进入 Souverän 家族",
      eventType: "model_released",
      startDate: "1997",
      circa: false,
      description: "收藏资料和专业历史资料把标准 M1000 的生产起点放在 1997 年。",
      sourceKey: S.collectibles.key,
    },
    {
      key: "phase413-m1005-2011",
      title: "M1005 银色饰件路线出现",
      eventType: "model_released",
      startDate: "2011",
      circa: false,
      description: "M1005 作为独立银色饰件特别版记录，不回填到金色饰件 M1000。",
      sourceKey: S.collectibles.key,
    },
    {
      key: "phase413-renaissance-2024",
      title: "M1000 Renaissance Brown 资料发布",
      eventType: "model_released",
      startDate: "2024-05",
      circa: false,
      description: "官方简报列棕色大理石 acrylic、EF/F/M/B 和 €820 含税建议价；只属于该特别版。",
      sourceKey: S.renaissanceBrief.key,
    },
  ],
  media: [
    {
      key: "phase413-m1000-primary-photo",
      title: "Pelikan M1000 实物样本（2017；M Dreibelbis）",
      sourceKey: S.photo.key,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Pelikan_M1000_II_%2836753113884%29.jpg",
      localPath: S.photo.archiveUrl,
      author: "M Dreibelbis",
      license: "cc-by-2.0",
      attributionText: "M Dreibelbis / Flickr / Wikimedia Commons，CC BY 2.0；2017-10-02 拍摄，本站保存原文件，未裁切、未缩放、未改色。只代表照片中的一支 M1000。",
      sourceUrl: S.photo.url,
      usageStatus: "primary",
    },
  ],
};

export const phase413PelikanM1000RefreshPacks: CuratedEntityPack[] = [pack];
