import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE35_M400_ID,
  PHASE35_PELIKAN_ID,
  phase35PelikanSouveranVariantPacks,
} from "./phase35-pelikan-souveran-variants";

export const PHASE415_PELIKAN_BRAND_ID = PHASE35_PELIKAN_ID;
export const PHASE415_M400_ID = PHASE35_M400_ID;
export const PHASE415_M400_SLUG = "pelikan-souveran-m400";
export const PHASE415_M400_NAME = "Pelikan Souverän M400";

const RETRIEVED = "2026-08-03";

function web(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  author?: string;
  publishedAt?: string;
  homepageUrl?: string;
  itemType?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const url = input.url;
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.registryKey,
    title: input.title,
    url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://www.pelikan.com/" : new URL(url).origin),
    itemType: input.itemType ?? (url.toLowerCase().includes(".pdf") ? "pdf" : "web_page"),
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const EXTRA_SOURCES: CuratedSource[] = [
  web({
    key: "phase415-pelikan-m400-mam",
    registryKey: "pelikan-mam-m400-994863-phase415",
    registryName: "Pelikan MAM product archive",
    title: "Souverän M400 Black-Green M — product 994863",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/994863",
    summary:
      "官方 MAM 产品档案：黑绿 M400 使用条纹 cellulose acetate 与树脂部件，活塞、14K/585 双色 EF/F/M/B、24K 镀金饰件、德国制造；页面保留约 €430 价格快照。",
  }),
  web({
    key: "phase415-pelikan-m400-mam-table",
    registryKey: "pelikan-mam-m400-product-table-phase415",
    registryName: "Pelikan MAM product table",
    title: "Pelikan M400 product records",
    url: "https://mam.pelikan.com/mam/en/pelikan/products",
    summary:
      "官方 MAM 产品表把 M400 的 EF、F、M、B 作为同一型号的尖号记录，支持把尖号写成选项而不是拆成四个型号。",
  }),
  web({
    key: "phase415-pelikan-m400-faq",
    registryKey: "pelikan-official-faq-m400-phase415",
    registryName: "Pelikan official FAQ",
    title: "Pelikan Fine Writing FAQ",
    url: "https://www.pelikan.com/int/145-international/services/541-faq.html",
    summary:
      "官方 FAQ 用于核对 Pelikan 活塞笔的上墨、清洗与日常使用边界；不把 FAQ 的通用动作外推成某支旧笔的维修保证。",
  }),
  web({
    key: "phase415-pelikan-m400-catalog-2022",
    registryKey: "pelikan-fine-writing-catalog-2022-m400-phase415",
    registryName: "Pelikan historical catalogue archive",
    title: "Fine Writing Instruments 2022 catalogue",
    url: "https://www.pelikan.com/images/assets/catalogs/fine-writing-instruments-2022-catalog-en.pdf",
    publishedAt: "2022",
    tier: "contemporary_archive",
    summary:
      "2022 官方目录用于交叉核对 M400 在 Souverän 活塞家族中的位置和金尖路线，不替代 2025 目录的当前数字。",
  }),
  web({
    key: "phase415-pelikan-m400-catalog-1997",
    registryKey: "pelikan-fine-writing-catalog-1997-m400-phase415",
    registryName: "Pelikan historical catalogue archive",
    title: "Fine Writing Instruments 1997 catalogue",
    url: "https://www.pelikan.com/images/assets/catalogs/1997_fine_writing_instruments.pdf",
    publishedAt: "1997",
    tier: "contemporary_archive",
    summary:
      "1997 年前后官方目录用于约束 Old Style 到 New Style 的时期图像和尖号/饰件过渡，不能单独证明某支二手笔的日期。",
  }),
  web({
    key: "phase415-pelikan-collectibles-m400-black",
    registryKey: "pelikan-collectibles-m400-black-phase415",
    registryName: "Pelikan Collectibles M400 Black",
    sourceType: "blog",
    author: "Dominic Rothemel",
    title: "Pelikan M400 Black detail",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M400-Basis/M400/M400-Black/index.html",
    summary:
      "收藏档案用于核对黑色标准款的 M400 家族位置、饰件和新版平台，不把黑色外观误写成独立尺寸型号。",
  }),
  web({
    key: "phase415-pelikan-collectibles-m400-blue",
    registryKey: "pelikan-collectibles-m400-blue-phase415",
    registryName: "Pelikan Collectibles M400 Blue",
    sourceType: "blog",
    author: "Dominic Rothemel",
    title: "Pelikan M400 Blue detail",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M400-Basis/M400/M400-Blue/index.html",
    summary:
      "蓝条档案记录跨越 1997 改版线的年份范围，用于证明颜色不能单独断代。",
  }),
  web({
    key: "phase415-pelikan-perch-400-m400",
    registryKey: "the-pelikans-perch-400-m400-phase415",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    author: "Joshua Danley",
    publishedAt: "2019-03-21",
    title: "How To Differentiate The Pelikan 400 From The M400",
    url: "https://thepelikansperch.com/2019/03/21/pelikan-400-versus-m400/",
    summary:
      "专业型号资料比较 1950 年代 Pelikan 400 与现代 M400 的供墨鳍片、活塞尾端、笔身和帽环线索。",
  }),
  web({
    key: "phase415-pelikan-perch-buying",
    registryKey: "the-pelikans-perch-buying-m400-phase415",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    author: "Joshua Danley",
    publishedAt: "2015-06-22",
    title: "A Guide to Buying Pelikan",
    url: "https://thepelikansperch.com/2015/06/22/choosing-pelikan-fountain-pen/",
    summary:
      "专业选购资料用于二手笔的活塞、尖端、笔帽和饰件验看，并提醒旧款维修史会造成零件跨代。",
  }),
  web({
    key: "phase415-pelikan-care",
    registryKey: "pelikan-official-care-m400-phase415",
    registryName: "Pelikan official warranty and care",
    title: "Fine writing instruments warranty and care",
    url: "https://www.pelikan-passion.com/images/assets/fwi_warranty_current.pdf",
    tier: "contemporary_archive",
    summary:
      "官方护理资料要求日常用冷水吸排，避免热水、肥皂和酒精；长期不用先排空，不把保养建议写成二手保修承诺。",
  }),
  web({
    key: "phase415-pelikan-goulet-family",
    registryKey: "goulet-pelikan-souveran-family-phase415",
    registryName: "Goulet Pens",
    sourceType: "retailer",
    tier: "retailer",
    title: "Pelikan Souverän fountain pen comparison",
    url: "https://www.gouletpens.com/blogs/fountain-pen-blog/pelikan-souveran-fountain-pen-comparison",
    summary:
      "可靠零售编辑对比 M400、M600、M800、M1000 的尺寸和活塞家族，用于导航和选购，不替代官方当前规格。",
  }),
  web({
    key: "phase415-pelikan-purepens-specials",
    registryKey: "pure-pens-pelikan-specials-phase415",
    registryName: "Pure Pens Pelikan reference",
    sourceType: "retailer",
    tier: "retailer",
    author: "Pure Pens editorial team",
    title: "Pelikan M400 and M600 special editions",
    url: "https://www.pelikanpens.co.uk/blogs/news/m400-m600-special-editions",
    summary:
      "可靠零售编辑资料把 M400/M600 特别版与相邻型号分开，作为颜色和型号边界的选购导航，不回填规格。",
  }),
  web({
    key: "phase415-pelikan-catalog-2025-m400",
    registryKey: "pelikan-fine-writing-catalog-2025-m400-phase415",
    registryName: "Pelikan Fine Writing current catalogue",
    title: "Fine Writing Instruments 2025 catalogue",
    url: "https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf",
    publishedAt: "2025",
    summary:
      "官方当前目录用于现行 M400 的 S 号、闭帽 12.7 cm、直径 11.7 mm、14.9 g、约 1.3 ml 和当期家族位置。",
  }),
];

const EXTRA_VARIANTS: CuratedVariant[] = [
  {
    key: "black-green-current",
    name: "M400 Black-Green（现行黑绿）",
    releaseYear: "2025",
    notes: "官方 MAM 产品号 994863 的当前黑绿样本；条纹 cellulose acetate 与树脂部件、金色饰件，不拆成新平台。",
    sourceKey: "phase415-pelikan-m400-mam",
    variantKind: "color",
    parentVariantKey: "new-style-1997-present",
    productCode: "994863",
  },
  {
    key: "blue-cross-generation",
    name: "M400 Blue（蓝条跨代记录）",
    releaseYear: "1995–1997；1997 后续有新版记录",
    notes: "蓝条横跨 Old Style 和 New Style；必须回到帽口、握位饰环和笔尖判断具体一支。",
    sourceKey: "phase415-pelikan-collectibles-m400-blue",
    variantKind: "color",
  },
  {
    key: "brown-tortoise-old",
    name: "M400 Brown Tortoise（Old Style）",
    releaseYear: "1984–1997",
    notes: "棕色龟纹 Old Style 档案；颜色只表示记录范围，不替代结构识别。",
    sourceKey: "phase35-pelikan-collectibles-m400",
    variantKind: "color",
    parentVariantKey: "old-style-1982-1997",
  },
  {
    key: "brown-tortoise-new",
    name: "M400 Brown Tortoise（New Style）",
    releaseYear: "1998–2006",
    notes: "棕色龟纹新版档案；与 1984–1997 Old Style 颜色记录分开。",
    sourceKey: "phase415-pelikan-collectibles-m400-blue",
    variantKind: "color",
    parentVariantKey: "new-style-1997-present",
  },
  {
    key: "nib-ef-current",
    name: "M400 14K/585 EF",
    releaseYear: "1997-09 后",
    notes: "现行 MAM 产品表中的 EF 选项；具体线宽仍受纸张、墨水与个体调校影响。",
    sourceKey: "phase415-pelikan-m400-mam-table",
    variantKind: "nib",
    parentVariantKey: "new-style-1997-present",
  },
  {
    key: "nib-f-current",
    name: "M400 14K/585 F",
    releaseYear: "1997-09 后",
    notes: "现行 MAM 产品表中的 F 选项；不是独立型号。",
    sourceKey: "phase415-pelikan-m400-mam-table",
    variantKind: "nib",
    parentVariantKey: "new-style-1997-present",
  },
  {
    key: "nib-m-current",
    name: "M400 14K/585 M",
    releaseYear: "1997-09 后",
    notes: "现行 MAM 产品表中的 M 选项；MAM 黑绿产品号 994863 即为 M。",
    sourceKey: "phase415-pelikan-m400-mam",
    variantKind: "nib",
    parentVariantKey: "new-style-1997-present",
    productCode: "994863",
  },
  {
    key: "nib-b-current",
    name: "M400 14K/585 B",
    releaseYear: "1997-09 后",
    notes: "现行 MAM 产品表中的 B 选项；实际线宽不由字母单独保证。",
    sourceKey: "phase415-pelikan-m400-mam-table",
    variantKind: "nib",
    parentVariantKey: "new-style-1997-present",
  },
  {
    key: "japan-market-500",
    name: "日本市场 #500 / M500 标签",
    releaseYear: "早期市场记录",
    notes: "特定市场的编号线索，保留为市场 SKU，不设为 M400 的通用别名或新型号。",
    sourceKey: "phase35-pelikan-collectibles-m400",
    variantKind: "market_sku",
    market: "Japan",
    parentVariantKey: "old-style-1982-1997",
  },
  {
    key: "m405-boundary",
    name: "M405 银色/镀钯饰件相邻型号",
    releaseYear: "1997 后家族记录",
    notes: "用于防止把 M405 的银色饰件、颜色和价格回填给金色饰件的 M400；不是本页的 M400 版本。",
    sourceKey: "phase415-pelikan-collectibles-m400-black",
    variantKind: "edition_group",
  },
  {
    key: "m200-family-boundary",
    name: "M200/M215 钢尖家族边界",
    releaseYear: "相邻家族",
    notes: "同样可能使用活塞但属于不同钢尖树脂路线；仅作选购导航。",
    sourceKey: "phase415-pelikan-goulet-family",
    variantKind: "edition_group",
  },
  {
    key: "pelikan-400-predecessor",
    name: "1950–1965 Pelikan 400（前代边界）",
    releaseYear: "1950–1965",
    notes: "历史前代，硬橡胶四纵鳍片和活塞尾端线索与 1982 M400 不同；不把其规格写入 M400。",
    sourceKey: "phase415-pelikan-perch-400-m400",
    variantKind: "edition_group",
  },
];

const EXTRA_SCOPES: CuratedScope[] = [
  {
    key: "phase415-current-platform",
    scopeKey: "pelikan-m400-current-platform-2025",
    variantKey: "new-style-1997-present",
    validFrom: "2025",
    productionState: "current",
    nibScope: "14K/585 bi-color; EF, F, M, B",
    materialScope: "current finish is product-specific; Black-Green MAM record uses striped cellulose acetate and resin",
    editionScope: "current standard Souverän M400 catalogue platform",
  },
  {
    key: "phase415-black-green",
    scopeKey: "pelikan-m400-black-green-994863",
    variantKey: "black-green-current",
    validFrom: "2025",
    productionState: "current",
    nibScope: "14K/585 bi-color M in product 994863; family table also lists EF/F/B",
    materialScope: "striped cellulose acetate and resin; 24K gold-plated furniture",
    editionScope: "MAM Black-Green product record 994863",
  },
  {
    key: "phase415-blue",
    scopeKey: "pelikan-m400-blue-cross-generation",
    variantKey: "blue-cross-generation",
    validFrom: "1995",
    validTo: "1997-12-31",
    productionState: "historical",
    materialScope: "blue striped finish; exact generation requires structural checks",
    editionScope: "blue records straddle Old Style and New Style",
  },
  {
    key: "phase415-brown-old",
    scopeKey: "pelikan-m400-brown-tortoise-old-style",
    variantKey: "brown-tortoise-old",
    validFrom: "1984",
    validTo: "1997",
    productionState: "historical",
    nibScope: "Old Style 14 ct monotone record",
    editionScope: "Brown Tortoise Old Style",
  },
  {
    key: "phase415-brown-new",
    scopeKey: "pelikan-m400-brown-tortoise-new-style",
    variantKey: "brown-tortoise-new",
    validFrom: "1998",
    validTo: "2006",
    productionState: "historical",
    nibScope: "New Style 14K/585 bi-color family record",
    editionScope: "Brown Tortoise New Style",
  },
  {
    key: "phase415-current-nibs",
    scopeKey: "pelikan-m400-current-nib-options",
    variantKey: "new-style-1997-present",
    validFrom: "1997-09",
    productionState: "current",
    nibScope: "EF, F, M, B options in 14K/585 bi-color family",
    editionScope: "nib width variants, not separate models",
  },
  {
    key: "phase415-market-label",
    scopeKey: "pelikan-m400-japan-market-500-label",
    variantKey: "japan-market-500",
    market: "Japan",
    productionState: "historical",
    editionScope: "#500/M500 market label only",
  },
  {
    key: "phase415-m405-boundary",
    scopeKey: "pelikan-m405-adjacent-model-boundary",
    variantKey: "m405-boundary",
    productionState: "current",
    editionScope: "M405 silver/palladium-colored trim is a neighboring model",
  },
  {
    key: "phase415-m200-boundary",
    scopeKey: "pelikan-m200-m215-adjacent-family-boundary",
    variantKey: "m200-family-boundary",
    productionState: "current",
    editionScope: "M200/M215 steel-nib neighboring family",
  },
  {
    key: "phase415-predecessor",
    scopeKey: "pelikan-400-1950s-predecessor-boundary",
    variantKey: "pelikan-400-predecessor",
    validFrom: "1950",
    validTo: "1965",
    productionState: "historical",
    nibScope: "historical Pelikan 400; not M400 nib data",
    materialScope: "historical hard-rubber feed cues",
    editionScope: "predecessor identity boundary",
  },
  {
    key: "phase415-care",
    scopeKey: "pelikan-m400-care-2026",
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "cold-water piston flushing; repair and warranty remain separate questions",
  },
  {
    key: "phase415-commercial",
    scopeKey: "pelikan-m400-mam-price-snapshot-994863",
    variantKey: "black-green-current",
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "MAM page price snapshot; market and time specific",
  },
  {
    key: "phase415-media",
    scopeKey: "pelikan-m400-generations-factual-svg-2026-08-03",
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "site-original factual SVG; not a product photograph or scale reference",
  },
];

const EXTRA_CLAIMS: CuratedClaim[] = [
  {
    key: "phase415-modern-identity",
    predicate: "modern_model_identity",
    objectText:
      "Pelikan Souverän M400 的现代生产起点是 1982；1950–1965 Pelikan 400 是前代历史型号，不能合并为同一条 M400 记录。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase415-pelikan-perch-400-m400",
    locator: "400 versus M400 identity and feed/piston comparison",
    evidence: [
      {
        key: "phase415-modern-identity-collectibles",
        sourceKey: "phase35-pelikan-collectibles-m400",
        scopeKey: "old-style",
        locator: "M400 Old Style 1982–1997 table",
      },
      {
        key: "phase415-modern-identity-400",
        sourceKey: "phase415-pelikan-perch-400-m400",
        scopeKey: "phase415-predecessor",
        locator: "1950s Pelikan 400 versus 1982 M400 feed and piston cues",
      },
    ],
  },
  {
    key: "phase415-current-configuration",
    predicate: "current_configuration",
    objectText:
      "MAM 黑绿 M400 产品号 994863 记录活塞、14K/585 双色金尖、M 尖、条纹 cellulose acetate 与树脂部件、24K 镀金饰件和德国制造。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase415-pelikan-m400-mam",
    locator: "product 994863 description and feature list",
    evidence: [
      {
        key: "phase415-current-configuration-mam",
        sourceKey: "phase415-pelikan-m400-mam",
        scopeKey: "phase415-black-green",
        locator: "Black-Green M product 994863: piston, 14-carat bi-color, cellulose acetate, Germany",
      },
    ],
  },
  {
    key: "phase415-current-nib-options",
    predicate: "current_nib_options",
    objectText:
      "现行 M400 的常规尖号为 EF、F、M、B，均属于 14K/585 双色金尖家族；尖号不是固定毫米线宽，也不是独立型号。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: "phase415-pelikan-m400-mam-table",
    locator: "M400 EF/F/M/B product records",
    evidence: [
      {
        key: "phase415-current-nib-options-table",
        sourceKey: "phase415-pelikan-m400-mam-table",
        scopeKey: "phase415-current-nibs",
        locator: "official product table lists EF, F, M and B",
      },
      {
        key: "phase415-current-nib-options-catalog",
        sourceKey: "phase415-pelikan-catalog-2025-m400",
        scopeKey: "phase415-current-platform",
        locator: "2025 catalogue M400 current nib row",
      },
    ],
  },
  {
    key: "phase415-structure-boundary",
    predicate: "generation_structure_boundary",
    objectText:
      "1997 年 9 月后的 New Style 增加握位饰环、尾钮双环和帽口双环，并把标准尖外观改为双色；帽顶徽记在 2003 和约 2010 左右仍有后续变化。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: "phase415-pelikan-perch-400-m400",
    locator: "M400 generation comparison: trim, cap top and nib",
    evidence: [
      {
        key: "phase415-structure-collectibles",
        sourceKey: "phase35-pelikan-collectibles-m400",
        scopeKey: "post-1997",
        locator: "M400 since 09/1997 model table",
      },
      {
        key: "phase415-structure-perch",
        sourceKey: "phase415-pelikan-perch-400-m400",
        scopeKey: "phase415-current-platform",
        locator: "visual Old Style/New Style trim and nib comparison",
      },
    ],
  },
  {
    key: "phase415-current-measurements",
    predicate: "current_measurements",
    objectText:
      "2025 官方目录给现行 M400 的闭帽长度 12.7 cm、直径 11.7 mm、重量 14.9 g 和容量约 1.3 ml；收藏平台表保留 125 mm、15.3 g 与 1.30 ml 的另一口径。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase415-pelikan-catalog-2025-m400",
    locator: "2025 catalogue M400 S row",
    evidence: [
      {
        key: "phase415-current-measurements-catalog",
        sourceKey: "phase415-pelikan-catalog-2025-m400",
        scopeKey: "phase415-current-platform",
        locator: "12.7 cm, 11.7 mm, 14.9 g and 1.3 ml",
      },
      {
        key: "phase415-current-measurements-archive",
        sourceKey: "phase35-pelikan-collectibles-m400",
        scopeKey: "post-1997",
        locator: "post-1997 collector table 125 mm, 15.3 g and 1.30 ml",
      },
    ],
  },
  {
    key: "phase415-material-boundary",
    predicate: "material_scope_boundary",
    objectText:
      "条纹 cellulose acetate 的表述只适用于 MAM 黑绿产品档案和相应配色；不能把所有年代、颜色或特别版一概写成同一种笔身材料。",
    factClass: "editorial",
    confidence: 0.97,
    sourceKey: "phase415-pelikan-m400-mam",
    locator: "Black-Green product material description",
    evidence: [
      {
        key: "phase415-material-scope",
        sourceKey: "phase415-pelikan-m400-mam",
        scopeKey: "phase415-black-green",
        locator: "striped cellulose acetate and resin components",
      },
    ],
  },
  {
    key: "phase415-color-crossing",
    predicate: "color_generation_boundary",
    objectText:
      "蓝条和棕色龟纹都跨过 1997 改版线：蓝条有 1995–1997 Old Style 与 1997 后记录，棕龟有 1984–1997 与 1998–2006 记录；颜色不能单独断代。",
    factClass: "editorial",
    confidence: 0.98,
    sourceKey: "phase415-pelikan-collectibles-m400-blue",
    locator: "Blue detail and dated M400 color tables",
    evidence: [
      {
        key: "phase415-color-blue",
        sourceKey: "phase415-pelikan-collectibles-m400-blue",
        scopeKey: "phase415-blue",
        locator: "blue records straddling 1997 transition",
      },
      {
        key: "phase415-color-brown",
        sourceKey: "phase35-pelikan-collectibles-m400",
        scopeKey: "phase415-brown-old",
        locator: "Brown Tortoise Old Style 1984–1997 and New Style 1998–2006",
      },
    ],
  },
  {
    key: "phase415-market-label",
    predicate: "market_label_boundary",
    objectText:
      "早期日本市场的 #500 或 M500 是市场编号线索，不是 M400 的通用别名，也不应仅凭盒标另建一个型号。",
    factClass: "editorial",
    confidence: 0.97,
    sourceKey: "phase35-pelikan-collectibles-m400",
    locator: "early Japanese-market #500 / M500 note",
    evidence: [
      {
        key: "phase415-market-label-archive",
        sourceKey: "phase35-pelikan-collectibles-m400",
        scopeKey: "phase415-market-label",
        locator: "Japan market label table note",
      },
    ],
  },
  {
    key: "phase415-care-boundary",
    predicate: "care_boundary",
    objectText:
      "官方日常保养是排空后用冷水吸排，避免热水、肥皂和酒精；拆尖、润滑活塞或镀层维修属于另一个维修判断，不是每次换墨的必做动作。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase415-pelikan-care",
    locator: "official care PDF cold-water and no-soap/no-alcohol guidance",
    evidence: [
      {
        key: "phase415-care-official",
        sourceKey: "phase415-pelikan-care",
        scopeKey: "phase415-care",
        locator: "care section: empty ink, flush with cold water, no hot water/soap/alcohol",
      },
    ],
  },
  {
    key: "phase415-adjacent-models",
    predicate: "adjacent_model_boundary",
    objectText:
      "M405 的银色/镀钯色饰件、M200/M215 的钢尖树脂路线和 M600 的更大平台都是相邻导航，不把它们的价格、容量或重量回填到 M400。",
    factClass: "editorial",
    confidence: 0.96,
    sourceKey: "phase415-pelikan-goulet-family",
    locator: "Souverän family comparison and neighboring model navigation",
    evidence: [
      {
        key: "phase415-adjacent-models-goulet",
        sourceKey: "phase415-pelikan-goulet-family",
        scopeKey: "phase415-m405-boundary",
        locator: "M400/M600/M800/M1000 size and family comparison",
      },
      {
        key: "phase415-adjacent-models-purepens",
        sourceKey: "phase415-pelikan-purepens-specials",
        scopeKey: "phase415-m200-boundary",
        locator: "M400/M600 special-edition naming boundaries",
      },
    ],
  },
  {
    key: "phase415-buying-checks",
    predicate: "second_hand_buying_checks",
    objectText:
      "二手 M400 应交叉检查帽环、握位饰环、尾钮、笔尖、供墨鳍片、活塞行程、渗漏和维修史；颜色、徽记或单个尖号不能独立证明年份和原装状态。",
    factClass: "editorial",
    confidence: 0.96,
    sourceKey: "phase415-pelikan-perch-buying",
    locator: "buying guide inspection advice for nib, piston, cap and trim",
    evidence: [
      {
        key: "phase415-buying-checks-perch",
        sourceKey: "phase415-pelikan-perch-buying",
        scopeKey: "phase415-current-platform",
        locator: "inspection and repair-history guidance",
      },
    ],
  },
  {
    key: "phase415-price-snapshot",
    predicate: "commercial_snapshot",
    objectText:
      "MAM 黑绿 M400 产品号 994863 页面保留约 €430 的价格快照；它只说明页面、地区与时间，不代表所有市场的今日统一零售价。",
    factClass: "core",
    confidence: 0.97,
    sourceKey: "phase415-pelikan-m400-mam",
    locator: "MAM product 994863 price field",
    evidence: [
      {
        key: "phase415-price-mam",
        sourceKey: "phase415-pelikan-m400-mam",
        scopeKey: "phase415-commercial",
        locator: "MAM page UVP/price snapshot approximately €430",
      },
    ],
  },
  {
    key: "phase415-media-role",
    predicate: "editorial_media_scope",
    objectText:
      "本站原创 M400 两代事实图只用于并列展示代际结构和参考数字，明确非产品照片、不按比例，不能作为颜色或真伪证据。",
    factClass: "editorial",
    confidence: 0.99,
    sourceKey: "phase35-m400-site-original",
    locator: "SVG title and description: factual comparison, non-product photo, not to scale",
    evidence: [
      {
        key: "phase415-media-role-svg",
        sourceKey: "phase35-m400-site-original",
        scopeKey: "phase415-media",
        locator: "SVG desc and footer: 非产品照片、不按比例",
      },
    ],
  },
];

const EXTRA_SPEC_EVIDENCE: CuratedSpecEvidence[] = [
  {
    key: "phase415-brand",
    fieldKey: "brand_entity_id",
    sourceKey: "phase415-pelikan-m400-mam",
    scopeKey: "phase415-black-green",
    locator: "Pelikan MAM product 994863 brand and product title",
  },
  {
    key: "phase415-series",
    fieldKey: "series_name",
    sourceKey: "phase415-pelikan-m400-mam",
    scopeKey: "phase415-current-platform",
    locator: "official product name Souverän M400",
  },
  {
    key: "phase415-release",
    fieldKey: "release_year",
    sourceKey: "phase35-pelikan-collectibles-m400",
    scopeKey: "old-style",
    locator: "M400 Old Style 1982–1997 table",
  },
  {
    key: "phase415-origin",
    fieldKey: "origin_country",
    sourceKey: "phase415-pelikan-m400-mam",
    scopeKey: "phase415-black-green",
    locator: "Made in Germany in official product record",
  },
  {
    key: "phase415-nib",
    fieldKey: "nib",
    sourceKey: "phase415-pelikan-m400-mam-table",
    scopeKey: "phase415-current-nibs",
    locator: "14K/585 bi-color EF/F/M/B product table",
  },
  {
    key: "phase415-fill",
    fieldKey: "fill_system",
    sourceKey: "phase415-pelikan-m400-mam",
    scopeKey: "phase415-black-green",
    locator: "piston filling mechanism",
  },
  {
    key: "phase415-material",
    fieldKey: "material",
    sourceKey: "phase415-pelikan-m400-mam",
    scopeKey: "phase415-black-green",
    locator: "striped cellulose acetate and resin",
  },
  {
    key: "phase415-dimensions",
    fieldKey: "dimensions",
    sourceKey: "phase415-pelikan-catalog-2025-m400",
    scopeKey: "phase415-current-platform",
    locator: "12.7 cm, 11.7 mm and S in 2025 catalogue",
  },
  {
    key: "phase415-weight",
    fieldKey: "weight",
    sourceKey: "phase415-pelikan-catalog-2025-m400",
    scopeKey: "phase415-current-platform",
    locator: "14.9 g in 2025 catalogue",
  },
  {
    key: "phase415-price",
    fieldKey: "price_range",
    sourceKey: "phase415-pelikan-m400-mam",
    scopeKey: "phase415-commercial",
    locator: "MAM product 994863 page price snapshot approximately €430",
  },
  {
    key: "phase415-status",
    fieldKey: "status",
    sourceKey: "phase415-pelikan-catalog-2025-m400",
    scopeKey: "phase415-current-platform",
    locator: "M400 listed in current 2025 catalogue; historical Old/New split retained",
  },
];

const BASE_M400 = phase35PelikanSouveranVariantPacks.find(
  (pack) => pack.entityId === PHASE415_M400_ID && pack.expectedType === "pen",
);

if (!BASE_M400) {
  throw new Error("Phase 415 requires the reviewed Phase 35 Pelikan M400 pack.");
}

const refreshedM400: CuratedEntityPack = {
  ...structuredClone(BASE_M400),
  key: "phase415-pelikan-m400-refresh-v1",
  markdownFile: ".planning/content-research/pelikan-m400-phase415.md",
  storyTitle: "Pelikan M400：1982 Old Style、1997 改版与现行规格的分层识别",
  primarySourceKey: "phase415-pelikan-m400-mam",
  sources: [...BASE_M400.sources, ...EXTRA_SOURCES],
  aliases: [
    ...BASE_M400.aliases,
    {
      alias: "M 400",
      language: "en",
      sourceKey: "phase415-pelikan-m400-mam",
    },
    {
      alias: "#500",
      language: "en",
      kind: "alias",
      sourceKey: "phase35-pelikan-collectibles-m400",
      market: "Japan",
    },
    {
      alias: "M500",
      language: "en",
      kind: "alias",
      sourceKey: "phase35-pelikan-collectibles-m400",
      market: "Japan",
    },
  ],
  variants: [...(BASE_M400.variants ?? []), ...EXTRA_VARIANTS],
  scopes: [...BASE_M400.scopes, ...EXTRA_SCOPES],
  claims: [...BASE_M400.claims, ...EXTRA_CLAIMS],
  spec: BASE_M400.spec
    ? {
        ...BASE_M400.spec,
        values: {
          ...BASE_M400.spec.values,
          series_name: "Souverän M400",
          release_year: "1982；1997-09 改版",
          origin_country: "德国",
          nib: "Old Style 14 ct 单色；现行 14K/585 双色 EF/F/M/B",
          fill_system: "内置活塞；现行目录约 1.3 ml，历史平台表约 1.40 ml",
          material: "现行黑绿款为条纹 cellulose acetate 饰带与树脂部件；其他配色逐版核对",
          dimensions: "2025 官方：闭帽 12.7 cm、直径 11.7 mm、S；收藏表约 125 mm",
          weight: "2025 官方 14.9 g；Old Style 14.0 g；1997+ 收藏表 15.3 g",
          price_range: "MAM 黑绿产品号 994863 页面约 €430 价格快照；地区与时间相关",
          status: "现行型号；按 1982 Old Style 与 1997-09 后 New Style 分代",
        },
        evidence: [...BASE_M400.spec.evidence, ...EXTRA_SPEC_EVIDENCE],
      }
    : undefined,
  media: BASE_M400.media,
};

export const phase415PelikanM400RefreshPacks: CuratedEntityPack[] = [refreshedM400];
