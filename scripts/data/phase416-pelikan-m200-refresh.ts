import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE248_M200_ID,
  PHASE248_PELIKAN_ID,
  phase248PelikanM200TwistPacks,
} from "./phase248-pelikan-m200-twist";

export const PHASE416_PELIKAN_BRAND_ID = PHASE248_PELIKAN_ID;
export const PHASE416_M200_ID = PHASE248_M200_ID;
export const PHASE416_M200_SLUG = "pelikan-m200";
export const PHASE416_M200_NAME = "百利金 Pelikan M200";

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
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://www.pelikan.com/" : new URL(input.url).origin),
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

const EXTRA_SOURCES: CuratedSource[] = [
  web({
    key: "phase416-pelikan-m200-mam",
    registryKey: "pelikan-mam-m200-808811-phase416",
    registryName: "Pelikan MAM product archive",
    title: "Classic M200 Brown-Marbled M — product 808811",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/808811",
    summary:
      "官方 MAM 产品档案明确写出 Classic M200 的 Pelikan piston mechanism 与 gold-plated stainless-steel M nib；它是具体棕色条纹商品和尖号样本。",
  }),
  web({
    key: "phase416-pelikan-m200-mam-table",
    registryKey: "pelikan-mam-m200-table-phase416",
    registryName: "Pelikan MAM product table",
    title: "Pelikan Classic M200 product records",
    url: "https://mam.pelikan.com/mam/en/pelikan/products",
    summary:
      "官方 MAM 产品表用于把 M200 颜色、尖幅和产品号分开记录，避免把每个 SKU 拆成一个型号或把颜色当作尖材。",
  }),
  web({
    key: "phase416-pelikan-classic-200-folder",
    registryKey: "pelikan-classic-200-folder-phase416",
    registryName: "Pelikan Fine Writing official",
    title: "Classic 200 product information",
    url: "https://mam.pelikan.com/en/pelikan/media/947831/download",
    publishedAt: "2021",
    summary:
      "官方 Classic 200 资料说明装饰元素镀金、M200 钢尖常见 EF/F/M/B，并把 M200 放在活塞 Classic 200 路线。",
  }),
  web({
    key: "phase416-pelikan-catalog-2025-m200",
    registryKey: "pelikan-fine-writing-catalog-2025-m200-phase416",
    registryName: "Pelikan Fine Writing current catalogue",
    title: "Fine Writing Instruments 2025 catalogue",
    url: "https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf",
    publishedAt: "2025",
    summary:
      "官方当前目录用于 Classic M200 的约 14.7 cm、12.3 mm、14 g、约 1.3 ml、镀金不锈钢尖和当期家族位置。",
  }),
  web({
    key: "phase416-pelikan-m200-green",
    registryKey: "pelikan-mam-m200-green-983403-phase416",
    registryName: "Pelikan MAM product archive",
    title: "Classic M200 Green-Marbled M — product 983403",
    url: "https://mam.pelikan.com/mam/de/pelikan/products/983403",
    summary:
      "官方 MAM 的绿色条纹 M200 商品记录，用于核对颜色 SKU 与 M 尖配置，不把单个产品号扩展成所有绿条年份。",
  }),
  web({
    key: "phase416-pelikan-m200-rose-gold",
    registryKey: "pelikan-classic-m200-copper-rose-gold-phase416",
    registryName: "Pelikan Fine Writing official",
    title: "Classic M200 Copper Rose Gold product information",
    url: "https://mam.pelikan.com/de/pelikan/media/1074083/download",
    publishedAt: "2023",
    summary:
      "官方特别版资料把 Copper Rose Gold 作为 Classic M200 的饰件/表面版本，并保留不锈钢尖路线；不把 Rose Gold 解释成 M250 金尖。",
  }),
  web({
    key: "phase416-pelikan-collectibles-m200",
    registryKey: "pelikan-collectibles-m200-phase416",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    author: "Dominic Rothemel",
    title: "Pelikan M200 & M205 Colours and Variants",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Classic-Series/M200-Basis/index.html",
    summary:
      "专业收藏档案记录 M200 1985 起点、1985–1997 Old Style、1997 后改款、钢尖/M250 金尖边界、颜色和公司订单。",
  }),
  web({
    key: "phase416-pelikan-nib-units",
    registryKey: "pelikan-collectibles-nib-units-phase416",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    author: "Dominic Rothemel",
    title: "Pelikan nib units since 1929",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Nibs/Nib-units-since-1929/index.html",
    summary:
      "专业零件档案说明 M200/M250 等型号可换尖单元；换尖属于维修/个性化动作，不会自动改写整支笔的型号与年代。",
  }),
  web({
    key: "phase416-pelikan-perch-m200",
    registryKey: "the-pelikans-perch-m200-phase416",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    author: "Joshua Danley",
    title: "M200 model database",
    url: "https://thepelikansperch.com/database/fountain-pens/m2xx/m200/",
    summary:
      "专业型号资料补充 M200 两代帽顶、帽环、活塞旋钮环、镀金钢尖和旧式约 1.20 ml 参考容量。",
  }),
  web({
    key: "phase416-pelikan-care",
    registryKey: "pelikan-official-care-m200-phase416",
    registryName: "Pelikan official care",
    title: "Pelikan writing instruments care instructions",
    url: "https://www.pelikan.com/int/products/writing-instruments/care-instructions.html",
    summary:
      "官方护理资料用于冷水吸排、禁用热水/肥皂/酒精和长期存放前排空；不把护理页写成二手保修承诺。",
  }),
  web({
    key: "phase416-pelikan-purepens",
    registryKey: "pure-pens-pelikan-m200-specials-phase416",
    registryName: "Pure Pens Pelikan reference",
    sourceType: "retailer",
    tier: "retailer",
    author: "Pure Pens editorial team",
    title: "Pelikan M200 and M205 Special Editions",
    url: "https://www.pelikanpens.co.uk/blogs/news/m200-and-m205-special-editions",
    summary:
      "可靠零售编辑列出 Red Marble、Smoky Quartz 等 M200/M205 特别版，作为版本导航，不替代品牌产品号和同期目录。",
  }),
  web({
    key: "phase416-pelikan-goulet",
    registryKey: "goulet-pelikan-classic-200-family-phase416",
    registryName: "Goulet Pens",
    sourceType: "retailer",
    tier: "retailer",
    title: "Pelikan Souverän and Classic family comparison",
    url: "https://www.gouletpens.com/blogs/fountain-pen-blog/pelikan-souveran-fountain-pen-comparison",
    summary:
      "可靠零售编辑用于 M200 与 M400/M600 的家族和尺寸导航，不回填相邻型号的金尖、银色饰件或活塞数字。",
  }),
  web({
    key: "phase416-pelikan-twist-official",
    registryKey: "pelikan-twist-official-phase416",
    registryName: "Pelikan Fine Writing official",
    title: "Pelikan Twist fountain pens",
    url: "https://www.pelikan.com/de/produkte/schreiben/184-fuellhalter/207-twist.html",
    summary:
      "官方 Twist 页面说明扭转三角人体工学握位和墨囊学生路线，用于与 M200 活塞身份做边界导航。",
  }),
  web({
    key: "phase416-pelikan-catalog-index",
    registryKey: "pelikan-catalog-index-phase416",
    registryName: "Pelikan official catalogue index",
    title: "Pelikan catalog download index",
    url: "https://www.pelikan.com/es/servicios/catalogos.html",
    summary:
      "品牌目录索引用于确认当前目录入口和版本，不以零售页面替代当前官方目录。",
  }),
];

const EXTRA_VARIANTS: CuratedVariant[] = [
  {
    key: "m200-black-current",
    name: "M200 Black（现行黑色）",
    releaseYear: "1997 后",
    notes: "Classic M200 黑色产品路线；具体尖幅、产品号和帽顶年代逐项核对。",
    sourceKey: "phase416-pelikan-m200-mam-table",
    variantKind: "color",
    parentVariantKey: "m200-post97",
  },
  {
    key: "m200-grey-marbled",
    name: "M200 Grey-Marbled",
    releaseYear: "1988–1997；改款后亦有记录",
    notes: "灰大理石颜色档案跨越年代，不用颜色单独判定 Old Style 或后期改款。",
    sourceKey: "phase416-pelikan-collectibles-m200",
    variantKind: "color",
  },
  {
    key: "m200-blue-marbled",
    name: "M200 Blue-Marbled",
    releaseYear: "1988–1997；改款后亦有记录",
    notes: "蓝大理石档案；帽顶、帽环和徽标须与颜色一起交叉。",
    sourceKey: "phase416-pelikan-collectibles-m200",
    variantKind: "color",
  },
  {
    key: "m200-green-marbled",
    name: "M200 Green-Marbled",
    releaseYear: "1988、1995–1997；后期至 2014 亦有档案",
    notes: "绿色条纹既有历史颜色记录，也有 MAM 产品 SKU；产品号不替代生产年份。",
    sourceKey: "phase416-pelikan-m200-green",
    variantKind: "color",
  },
  {
    key: "m200-burgundy",
    name: "M200 Burgundy",
    releaseYear: "1980s–1990s 档案；后续市场记录依来源",
    notes: "酒红色 Classic 200 记录；不得把相邻 M250 Burgundy 的金尖写入 M200。",
    sourceKey: "phase416-pelikan-collectibles-m200",
    variantKind: "color",
  },
  {
    key: "m200-red-marble-2025",
    name: "M200 Red Marble",
    releaseYear: "2025",
    notes: "可靠零售特别版清单中的 Red Marble；具体市场库存和尖号按产品页核对。",
    sourceKey: "phase416-pelikan-purepens",
    variantKind: "color",
    parentVariantKey: "m200-post97",
  },
  {
    key: "m200-smoky-quartz-2017",
    name: "M200 Smoky Quartz",
    releaseYear: "2017",
    notes: "特别版清单中的 Smoky Quartz；颜色和饰件边界独立记录，仍属于 M200 钢尖活塞平台。",
    sourceKey: "phase416-pelikan-purepens",
    variantKind: "color",
    parentVariantKey: "m200-post97",
  },
  {
    key: "m200-nib-ef",
    name: "M200 镀金钢尖 EF",
    releaseYear: "现行产品表",
    notes: "EF 是尖幅选项，不是独立型号；实际线宽受纸张、墨水和调校影响。",
    sourceKey: "phase416-pelikan-classic-200-folder",
    variantKind: "nib",
    parentVariantKey: "m200-post97",
  },
  {
    key: "m200-nib-f",
    name: "M200 镀金钢尖 F",
    releaseYear: "现行产品表",
    notes: "F 是尖幅选项，不改写 M200 的活塞和树脂平台身份。",
    sourceKey: "phase416-pelikan-classic-200-folder",
    variantKind: "nib",
    parentVariantKey: "m200-post97",
  },
  {
    key: "m200-nib-m",
    name: "M200 镀金钢尖 M",
    releaseYear: "现行产品表",
    notes: "MAM 产品 808811 是 M 尖样本；不要把单个产品号外推为所有 M200 的唯一尖幅。",
    sourceKey: "phase416-pelikan-m200-mam",
    variantKind: "nib",
    parentVariantKey: "m200-post97",
    productCode: "808811",
  },
  {
    key: "m200-nib-b",
    name: "M200 镀金钢尖 B",
    releaseYear: "现行产品表",
    notes: "B 是尖幅选项；二手笔仍需实写确认线宽和调校状态。",
    sourceKey: "phase416-pelikan-classic-200-folder",
    variantKind: "nib",
    parentVariantKey: "m200-post97",
  },
  {
    key: "m250-gold-nib-boundary",
    name: "M250 金尖相邻型号",
    releaseYear: "1985–1997 等历史记录",
    notes: "与 M200 共享部分外形，但以金尖路线区分；不把换尖后的个体自动更名。",
    sourceKey: "phase416-pelikan-collectibles-m200",
    variantKind: "edition_group",
  },
  {
    key: "m205-silver-trim-boundary",
    name: "M205 银色饰件相邻型号",
    releaseYear: "Classic 200 family",
    notes: "银色/镀铬色饰件路线；它的特别版和价格不回填给金色饰件 M200。",
    sourceKey: "phase416-pelikan-collectibles-m200",
    variantKind: "edition_group",
  },
  {
    key: "p200-p205-cartridge-boundary",
    name: "P200/P205 墨囊相邻路线",
    releaseYear: "2014 起的档案路线",
    notes: "外形接近 Classic 200，但使用墨囊/转换器；不把其上墨系统写成 M200 活塞。",
    sourceKey: "phase416-pelikan-goulet",
    variantKind: "edition_group",
  },
  {
    key: "twist-p457-boundary",
    name: "Twist P457 扭转握位相邻路线",
    releaseYear: "2019 起资料路线",
    notes: "学生/日用墨囊路线，握位和上墨均独立；仅作品牌导航。",
    sourceKey: "phase416-pelikan-twist-official",
    variantKind: "edition_group",
  },
  {
    key: "m481-predecessor-boundary",
    name: "M481 过渡型号边界",
    releaseYear: "1983–1985 档案",
    notes: "M200 前期相近外形与摩擦配合供墨线索；不把 M481 的过渡件回填成标准 M200。",
    sourceKey: "phase416-pelikan-collectibles-m200",
    variantKind: "edition_group",
  },
];

const EXTRA_SCOPES: CuratedScope[] = [
  {
    key: "phase416-current",
    scopeKey: "pelikan-m200-current-platform-2025",
    variantKey: "m200-post97",
    validFrom: "2025",
    productionState: "current",
    nibScope: "gold-plated stainless steel; EF, F, M, B",
    materialScope: "resin body, transparent ink window and gold-plated trim; finish-specific",
    editionScope: "current Classic M200 platform",
  },
  {
    key: "phase416-old-style",
    scopeKey: "pelikan-m200-old-style-1985-1997",
    variantKey: "m200-old",
    validFrom: "1985",
    validTo: "1997-08-31",
    productionState: "historical",
    nibScope: "steel, gold-plated; exact width and replacement status require inspection",
    materialScope: "resin body and transparent ink window; colors vary",
    editionScope: "derby cap, two cap bands, no piston-knob trim ring as common cues",
  },
  {
    key: "phase416-black",
    scopeKey: "pelikan-m200-black-current",
    variantKey: "m200-black-current",
    validFrom: "1997",
    productionState: "current",
    materialScope: "black resin and gold-plated trim; product SKU and nib width vary",
    editionScope: "black Classic M200 records",
  },
  {
    key: "phase416-marble-colors",
    scopeKey: "pelikan-m200-marbled-color-records",
    variantKey: "m200-grey-marbled",
    validFrom: "1988",
    validTo: "2014",
    productionState: "historical",
    materialScope: "grey, blue and green marbled resin records",
    editionScope: "dated color records; structure still decides Old/New style",
  },
  {
    key: "phase416-burgundy",
    scopeKey: "pelikan-m200-burgundy-records",
    variantKey: "m200-burgundy",
    productionState: "historical",
    materialScope: "burgundy resin color records",
    editionScope: "M200 color route; exclude M250 gold nib",
  },
  {
    key: "phase416-red",
    scopeKey: "pelikan-m200-red-marble-2025",
    variantKey: "m200-red-marble-2025",
    validFrom: "2025",
    productionState: "current",
    materialScope: "special-edition red marble finish; exact product and market vary",
    editionScope: "M200 Red Marble retailer-indexed special edition",
  },
  {
    key: "phase416-nibs",
    scopeKey: "pelikan-m200-current-nib-options",
    variantKey: "m200-post97",
    validFrom: "1997-09",
    productionState: "current",
    nibScope: "EF, F, M, B gold-plated stainless steel options",
    editionScope: "nib width variants, not separate models",
  },
  {
    key: "phase416-m250",
    scopeKey: "pelikan-m250-gold-nib-boundary",
    variantKey: "m250-gold-nib-boundary",
    validFrom: "1985",
    productionState: "historical",
    nibScope: "gold nib route; not M200 steel nib data",
    editionScope: "M250 neighboring model",
  },
  {
    key: "phase416-m205",
    scopeKey: "pelikan-m205-silver-trim-boundary",
    variantKey: "m205-silver-trim-boundary",
    productionState: "current",
    editionScope: "M205 silver/chrome trim neighboring model",
  },
  {
    key: "phase416-cartridge",
    scopeKey: "pelikan-p200-p205-cartridge-boundary",
    variantKey: "p200-p205-cartridge-boundary",
    validFrom: "2014",
    productionState: "current",
    editionScope: "cartridge/converter neighboring route",
  },
  {
    key: "phase416-twist",
    scopeKey: "pelikan-twist-p457-boundary",
    variantKey: "twist-p457-boundary",
    validFrom: "2019",
    productionState: "current",
    editionScope: "Twist cartridge route and triangular grip",
  },
  {
    key: "phase416-m481",
    scopeKey: "pelikan-m481-transition-boundary",
    variantKey: "m481-predecessor-boundary",
    validFrom: "1983",
    validTo: "1985",
    productionState: "historical",
    nibScope: "transition steel nib and friction-fit clues",
    editionScope: "M481 transition boundary, not standard M200 data",
  },
  {
    key: "phase416-care",
    scopeKey: "pelikan-m200-care-2026",
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "cold-water piston flushing; repair actions remain separate",
  },
  {
    key: "phase416-media",
    scopeKey: "pelikan-m200-generations-factual-svg-2026-08-03",
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "site-original factual SVG; non-product photo and not to scale",
  },
];

const EXTRA_CLAIMS: CuratedClaim[] = [
  {
    key: "phase416-identity",
    predicate: "model_identity",
    objectText:
      "Pelikan M200 于 1985 年进入 Classic 200，是树脂瓶装活塞钢尖路线；它不能与墨囊 Twist P457 或 P200/P205 合并。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase416-pelikan-collectibles-m200",
    locator: "M200 introduction, Classic 200 family and filling system boundary",
    evidence: [
      {
        key: "phase416-identity-archive",
        sourceKey: "phase416-pelikan-collectibles-m200",
        scopeKey: "phase416-old-style",
        locator: "M200 introduced 1985 and Old Style table",
      },
      {
        key: "phase416-identity-mam",
        sourceKey: "phase416-pelikan-m200-mam",
        scopeKey: "phase416-current",
        locator: "MAM product description: Pelikan piston mechanism",
      },
    ],
  },
  {
    key: "phase416-old-new",
    predicate: "generation_boundary",
    objectText:
      "1985–1997 为 Old Style；1997 年 9 月后常见 crown 帽顶、简化帽环和活塞旋钮饰环，徽标又在 2003 年左右变化。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: "phase416-pelikan-collectibles-m200",
    locator: "Old Style and post-1997 redesign tables",
    evidence: [
      {
        key: "phase416-old-new-archive",
        sourceKey: "phase416-pelikan-collectibles-m200",
        scopeKey: "phase416-old-style",
        locator: "1985–1997 Old Style and after 1997 redesign",
      },
      {
        key: "phase416-old-new-perch",
        sourceKey: "phase416-pelikan-perch-m200",
        scopeKey: "phase416-current",
        locator: "derby/crown cap and trim-ring comparison",
      },
    ],
  },
  {
    key: "phase416-current-config",
    predicate: "current_configuration",
    objectText:
      "现行 Classic M200 以镀金不锈钢尖、内置活塞、树脂笔杆和透明墨窗为核心；官方资料常列 EF、F、M、B。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase416-pelikan-classic-200-folder",
    locator: "Classic 200 product information and nib/filling fields",
    evidence: [
      {
        key: "phase416-current-config-folder",
        sourceKey: "phase416-pelikan-classic-200-folder",
        scopeKey: "phase416-current",
        locator: "gold-plated decoration, steel EF/F/M/B nib and piston family",
      },
      {
        key: "phase416-current-config-mam",
        sourceKey: "phase416-pelikan-m200-mam",
        scopeKey: "phase416-current",
        locator: "808811: piston mechanism and gold-plated stainless-steel M nib",
      },
    ],
  },
  {
    key: "phase416-measurements",
    predicate: "platform_measurements",
    objectText:
      "2025 官方目录约列闭帽 14.7 cm、直径 12.3 mm、14 g、约 1.3 ml；Old Style 收藏表另列约 127 mm、14 g、1.20 ml，按日期和口径分别保留。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase416-pelikan-catalog-2025-m200",
    locator: "2025 catalogue Classic M200 row",
    evidence: [
      {
        key: "phase416-measurements-current",
        sourceKey: "phase416-pelikan-catalog-2025-m200",
        scopeKey: "phase416-current",
        locator: "14.7 cm, 12.3 mm, 14 g and approximately 1.3 ml",
      },
      {
        key: "phase416-measurements-old",
        sourceKey: "phase416-pelikan-collectibles-m200",
        scopeKey: "phase416-old-style",
        locator: "Old Style 127 mm, 14 g, 1.20 ml table",
      },
    ],
  },
  {
    key: "phase416-m250-boundary",
    predicate: "nib_material_boundary",
    objectText:
      "M200 使用镀金不锈钢尖，M250 是外形相近的金尖路线；可换尖不等于整支笔自动换型号。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase416-pelikan-collectibles-m200",
    locator: "M200 steel nib versus M250 gold nib table",
    evidence: [
      {
        key: "phase416-m250-boundary-archive",
        sourceKey: "phase416-pelikan-collectibles-m200",
        scopeKey: "phase416-m250",
        locator: "M200/M250 same-shape, different nib material note",
      },
      {
        key: "phase416-m250-boundary-units",
        sourceKey: "phase416-pelikan-nib-units",
        scopeKey: "phase416-current",
        locator: "replaceable nib units for M200 and M250",
      },
    ],
  },
  {
    key: "phase416-m205-boundary",
    predicate: "trim_boundary",
    objectText:
      "M205 属于银色/镀铬色饰件的 Classic 200 相邻路线；它的特别版、颜色和商业记录不能回填为金色饰件 M200。",
    factClass: "editorial",
    confidence: 0.97,
    sourceKey: "phase416-pelikan-collectibles-m200",
    locator: "M200 & M205 family and trim sections",
    evidence: [
      {
        key: "phase416-m205-boundary-archive",
        sourceKey: "phase416-pelikan-collectibles-m200",
        scopeKey: "phase416-m205",
        locator: "M205 silver/chrome trim family distinction",
      },
    ],
  },
  {
    key: "phase416-cartridge-boundary",
    predicate: "filling_system_boundary",
    objectText:
      "P200/P205 和 Twist P457 使用墨囊/转换器或 Twist 墨囊平台；M200 的活塞、透明墨窗和 1.2–1.3 ml 参考容量不能复制到它们。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: "phase416-pelikan-goulet",
    locator: "Classic and Souverän family comparison used as navigation boundary",
    evidence: [
      {
        key: "phase416-cartridge-p200",
        sourceKey: "phase416-pelikan-goulet",
        scopeKey: "phase416-cartridge",
        locator: "family comparison: Classic 200 and neighboring routes",
      },
      {
        key: "phase416-cartridge-twist",
        sourceKey: "phase416-pelikan-twist-official",
        scopeKey: "phase416-twist",
        locator: "official Twist family listing and ergonomic cartridge route",
      },
    ],
  },
  {
    key: "phase416-colors",
    predicate: "color_variant_boundary",
    objectText:
      "黑色、灰/蓝/绿大理石、酒红、透明和企业订单颜色来自不同档案；颜色和产品号是版本线索，不能单独给出 M200 的年份或稀有度。",
    factClass: "editorial",
    confidence: 0.97,
    sourceKey: "phase416-pelikan-collectibles-m200",
    locator: "M200 color and company-order variant entries",
    evidence: [
      {
        key: "phase416-colors-archive",
        sourceKey: "phase416-pelikan-collectibles-m200",
        scopeKey: "phase416-marble-colors",
        locator: "grey/blue/green marbled and company-order records",
      },
      {
        key: "phase416-colors-mam",
        sourceKey: "phase416-pelikan-m200-green",
        scopeKey: "phase416-black",
        locator: "specific Green-Marbled product 983403",
      },
    ],
  },
  {
    key: "phase416-specials",
    predicate: "special_edition_scope",
    objectText:
      "Red Marble、Smoky Quartz 和 Copper Rose Gold 等特别版仍需先确认 M200 钢尖活塞平台，再分别记录颜色、饰件和产品号；Rose Gold 不等于 M250 金尖。",
    factClass: "editorial",
    confidence: 0.97,
    sourceKey: "phase416-pelikan-purepens",
    locator: "M200/M205 special-edition list and current product information",
    evidence: [
      {
        key: "phase416-specials-purepens",
        sourceKey: "phase416-pelikan-purepens",
        scopeKey: "phase416-red",
        locator: "Red Marble 2025 and Smoky Quartz 2017 entries",
      },
      {
        key: "phase416-specials-rose",
        sourceKey: "phase416-pelikan-m200-rose-gold",
        scopeKey: "phase416-current",
        locator: "Copper Rose Gold Classic M200 product information",
      },
    ],
  },
  {
    key: "phase416-care",
    predicate: "care_boundary",
    objectText:
      "官方日常保养是排空后用冷水吸排，避免热水、肥皂和酒精；拆尖、润滑活塞和密封维修不属于每次换墨的必做动作。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase416-pelikan-care",
    locator: "official care instructions for piston fountain pens",
    evidence: [
      {
        key: "phase416-care-official",
        sourceKey: "phase416-pelikan-care",
        scopeKey: "phase416-care",
        locator: "cold-water flushing; no hot water, soap or alcohol",
      },
    ],
  },
  {
    key: "phase416-buying",
    predicate: "second_hand_identification",
    objectText:
      "二手 M200 应交叉检查活塞、透明墨窗、帽顶、帽环、旋钮环、尖材、尖幅和维修史；颜色、徽标或一枚金色尖都不能单独证明年份和原装状态。",
    factClass: "editorial",
    confidence: 0.97,
    sourceKey: "phase416-pelikan-perch-m200",
    locator: "M200 database trim and nib identification cues",
    evidence: [
      {
        key: "phase416-buying-perch",
        sourceKey: "phase416-pelikan-perch-m200",
        scopeKey: "phase416-current",
        locator: "M200 cap, knob, nib and ink-capacity records",
      },
    ],
  },
  {
    key: "phase416-media",
    predicate: "editorial_media_scope",
    objectText:
      "本站原创 M200 SVG 只并列展示 Old Style/1997 后改款、钢尖与活塞边界，明确非产品照片、不按比例，不作为颜色、尺寸或真伪证据。",
    factClass: "editorial",
    confidence: 0.99,
    sourceKey: "phase248-pelikan-m200-svg",
    locator: "SVG title and description: factual diagram, non-product photo, not to scale",
    evidence: [
      {
        key: "phase416-media-svg",
        sourceKey: "phase248-pelikan-m200-svg",
        scopeKey: "phase416-media",
        locator: "SVG description and footer",
      },
    ],
  },
];

const EXTRA_SPEC_EVIDENCE: CuratedSpecEvidence[] = [
  {
    key: "phase416-brand",
    fieldKey: "brand_entity_id",
    sourceKey: "phase416-pelikan-m200-mam",
    scopeKey: "phase416-current",
    locator: "Pelikan MAM Classic M200 product title",
  },
  {
    key: "phase416-series",
    fieldKey: "series_name",
    sourceKey: "phase416-pelikan-classic-200-folder",
    scopeKey: "phase416-current",
    locator: "Classic 200 family and M200 model entry",
  },
  {
    key: "phase416-release",
    fieldKey: "release_year",
    sourceKey: "phase416-pelikan-collectibles-m200",
    scopeKey: "phase416-old-style",
    locator: "M200 introduced 1985; Old Style 1985–1997",
  },
  {
    key: "phase416-origin",
    fieldKey: "origin_country",
    sourceKey: "phase416-pelikan-catalog-2025-m200",
    scopeKey: "phase416-current",
    locator: "Pelikan brand/catalog context; no factory inference",
  },
  {
    key: "phase416-nib",
    fieldKey: "nib",
    sourceKey: "phase416-pelikan-classic-200-folder",
    scopeKey: "phase416-nibs",
    locator: "gold-plated stainless EF/F/M/B steel nib options",
  },
  {
    key: "phase416-fill",
    fieldKey: "fill_system",
    sourceKey: "phase416-pelikan-m200-mam",
    scopeKey: "phase416-current",
    locator: "Pelikan piston mechanism in product 808811",
  },
  {
    key: "phase416-material",
    fieldKey: "material",
    sourceKey: "phase416-pelikan-m200-mam",
    scopeKey: "phase416-current",
    locator: "Classic M200 resin body and product construction",
  },
  {
    key: "phase416-dimensions",
    fieldKey: "dimensions",
    sourceKey: "phase416-pelikan-catalog-2025-m200",
    scopeKey: "phase416-current",
    locator: "14.7 cm and 12.3 mm current catalogue values",
  },
  {
    key: "phase416-weight",
    fieldKey: "weight",
    sourceKey: "phase416-pelikan-catalog-2025-m200",
    scopeKey: "phase416-current",
    locator: "14 g current catalogue value",
  },
  {
    key: "phase416-status",
    fieldKey: "status",
    sourceKey: "phase416-pelikan-collectibles-m200",
    scopeKey: "phase416-current",
    locator: "current and historical M200 records",
  },
];

const BASE_M200 = phase248PelikanM200TwistPacks.find(
  (pack) => pack.entityId === PHASE416_M200_ID && pack.expectedType === "pen",
);

if (!BASE_M200) throw new Error("Phase 416 requires the reviewed Phase 248 Pelikan M200 pack.");

const refreshedM200: CuratedEntityPack = {
  ...structuredClone(BASE_M200),
  key: "phase416-pelikan-m200-refresh-v1",
  canonicalName: PHASE416_M200_NAME,
  markdownFile: ".planning/content-research/pelikan-m200-phase416.md",
  storyTitle: "Pelikan M200：1985 Old Style、1997 改款与现行 Classic 200 边界",
  primarySourceKey: "phase416-pelikan-m200-mam",
  sources: [...BASE_M200.sources, ...EXTRA_SOURCES],
  aliases: [
    ...BASE_M200.aliases,
    { alias: "M 200", language: "en", sourceKey: "phase416-pelikan-m200-mam" },
    { alias: "Pelikan Classic M200", language: "en", sourceKey: "phase416-pelikan-classic-200-folder" },
  ],
  variants: [...(BASE_M200.variants ?? []), ...EXTRA_VARIANTS],
  scopes: [...BASE_M200.scopes, ...EXTRA_SCOPES],
  claims: [...BASE_M200.claims, ...EXTRA_CLAIMS],
  spec: BASE_M200.spec
    ? {
        ...BASE_M200.spec,
        values: {
          ...BASE_M200.spec.values,
          series_name: "Pelikan Classic M200",
          release_year: "1985；1997-09 后改款",
          origin_country: "德国品牌；具体制造地按目录或包装核对",
          nib: "镀金不锈钢尖；EF/F/M/B，具体年代与替换尖需核对",
          fill_system: "内置 Pelikan 活塞；当前目录约 1.3 ml，Old Style 档案约 1.20 ml",
          material: "树脂笔杆、透明墨窗与金色饰件；颜色、特别版和年代逐版核对",
          dimensions: "2025 官方约闭帽 14.7 cm、直径 12.3 mm；Old Style 档案约 127 mm",
          weight: "当前目录与 Old Style 档案均约 14 g；测量是否含笔帽需看口径",
          status: "Classic 200 现行与历史版本并存；1985–1997 Old Style，1997 后改款",
        },
        evidence: [...BASE_M200.spec.evidence, ...EXTRA_SPEC_EVIDENCE],
      }
    : undefined,
  media: BASE_M200.media,
};

export const phase416PelikanM200RefreshPacks: CuratedEntityPack[] = [refreshedM200];
