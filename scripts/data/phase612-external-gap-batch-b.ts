import type {
  CuratedEntityPack,
  CuratedSource,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-14";

export const PHASE612_BATCH_B_BRANDS = {
  endless: "phase612-brand-endless",
  leboeuf: "phase612-brand-leboeuf",
  marlen: "phase612-brand-marlen",
  sensa: "phase612-brand-sensa",
  tomHessin: "phase612-brand-tom-hessin",
  zebra: "phase612-brand-zebra",
} as const;

export const PHASE612_BATCH_B_PENS = {
  endless: "phase612-pen-endless-phantom-retractable",
  leboeuf: "phase612-pen-leboeuf-pilgrim-heritage",
  marlen: "phase612-pen-marlen-m20",
  sensa: "phase612-pen-sensa-sensagraph",
  tomHessin: "phase612-pen-tom-hessin-charles",
  zebra: "phase612-pen-zebra-fountain-pen",
} as const;

export const PHASE612_BATCH_B_SLUGS = {
  endlessBrand: "endless",
  endlessPen: "endless-phantom-retractable",
  leboeufBrand: "leboeuf",
  leboeufPen: "leboeuf-pilgrim-heritage",
  marlenBrand: "marlen",
  marlenPen: "marlen-m20",
  sensaBrand: "sensa",
  sensaPen: "sensa-sensagraph",
  tomHessinBrand: "tom-hessin",
  tomHessinPen: "tom-hessin-charles",
  zebraBrand: "zebra",
  zebraPen: "zebra-fountain-pen",
} as const;

function web(input: {
  key: string;
  title: string;
  url: string;
  registry: string;
  name: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  publishedAt?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registry,
    registryName: input.name,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registry,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    author: input.name,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

type DefinitionKey = keyof typeof PHASE612_BATCH_B_BRANDS;

function diagram(key: DefinitionKey, kind: "brand" | "model"): CuratedSource {
  const folder = key === "tomHessin" ? "tom-hessin" : key;
  const registrySuffix = key === "tomHessin" ? "tom-hessin" : key;
  const localPath = `/images/library/site-original/phase612/batch-b/${folder}/${kind}.svg`;
  return {
    key: `phase612-b-${key}-${kind}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase612-b-${registrySuffix}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase612-b-${registrySuffix}`,
    title: `Phase 612 Batch B ${key} ${kind} factual diagram`,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图；非产品照片、Logo、颜色校样、纹理复刻或比例图。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function cite(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

const S = {
  endlessBrand: web({
    key: "phase612-b-endless-home",
    title: "Endless Stationery",
    url: "https://www.madebyendless.com/",
    registry: "endless-official-phase612-b",
    name: "Endless Stationery",
    summary:
      "官网目录同时列纸品、墨水、钢笔与配件，并把 Phantom 明确列为 retractable fountain pen。",
  }),
  endlessModel: web({
    key: "phase612-b-endless-phantom",
    title: "Endless Phantom Retractable Fountain Pen",
    url: "https://www.madebyendless.com/collections/endless-phantom-retractable-fountain-pen/products/phantom-retractable-fountain-pen",
    registry: "endless-official-phase612-b",
    name: "Endless Stationery",
    summary:
      "商品页确认 click-action、密封设计、EF/F/M、软木盒兼笔座和当前 Clear Chrome SKU。",
  }),
  endlessReview: web({
    key: "phase612-b-endless-review",
    title: "Stationery Review 227 - Endless Phantom Retractable Fountain Pen",
    url: "https://www.thelifesway.com/2025/06/stationery-review-227-endless-phantom.html",
    registry: "the-lifes-way-phase612-b",
    name: "The Life's Way",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2025-06-24",
    summary:
      "独立早期量产样本记录 Chennai 品牌背景、约20 g、墨囊/转换器、EF尖与机构实际感受。",
  }),
  leboeufBrand: web({
    key: "phase612-b-leboeuf-about",
    title: "About LeBoeuf Pens",
    url: "https://leboeufpens.com/pages/about",
    registry: "leboeuf-official-phase612-b",
    name: "LeBoeuf Pens",
    summary:
      "官网区分1919年原品牌、百年复兴、历史 celluloid 与当代 vintage-inspired 产品。",
  }),
  leboeufModel: web({
    key: "phase612-b-leboeuf-pilgrim-heritage",
    title: "The LeBoeuf Pilgrim Heritage Collection",
    url: "https://leboeufpens.com/collections/the-leboeuf-pilgrim-heritage-collection",
    registry: "leboeuf-official-phase612-b",
    name: "LeBoeuf Pens",
    summary:
      "系列页确认当代复兴、vintage-inspired acrylic、四种颜色、德国镀金钢尖F/M/B及钢笔/roller并列。",
  }),
  leboeufRetail: web({
    key: "phase612-b-leboeuf-coloradopen",
    title: "LeBoeuf Pilgrim Heritage Admiral Blue Fountain Pen",
    url: "https://coloradopen.com/products/leboeuf-pilgrim-blue-fountain-pen",
    registry: "colorado-pen-phase612-b",
    name: "Colorado Pen",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "专业零售 exact 钢笔页交叉确认 Pilgrim Heritage Fountain Pen 身份，并与 roller 商品分开。",
  }),
  marlenBrand: web({
    key: "phase612-b-marlen-about",
    title: "Who We Are - Marlen Pens",
    url: "https://www.marlenpens.com/en/pages/chi-siamo",
    registry: "marlen-official-phase612-b",
    name: "Marlen Pens",
    summary:
      "官网确认1982年创立于Campania、全线Made in Italy、第二代经营与多材料手工制造范围。",
  }),
  marlenModel: web({
    key: "phase612-b-marlen-m20",
    title: "Marlen M20 current product handle",
    url: "https://www.marlenpens.com/en/products/marlen-m20",
    registry: "marlen-official-phase612-b",
    name: "Marlen Pens",
    summary:
      "当前 handle 与变体确认 M20、钢尖钢笔F/M/B、多色和roller并存；标题/描述冲突不作为主题证据。",
  }),
  marlenCatalog: web({
    key: "phase612-b-marlen-distributor-catalog",
    title: "Marlen Pens - Special Edition distributor catalogue",
    url: "https://pubhtml5.com/eggh/tggp/basic/",
    registry: "bespoke-selections-phase612-b",
    name: "Bespoke Selections",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "经销目录以M20产品代码分列fountain pen steel/18K与roller，支持平台和书写类型边界。",
  }),
  sensaBrand: web({
    key: "phase612-b-sensa-home",
    title: "Sensa Pens",
    url: "https://sensapensofficial.com/",
    registry: "sensa-official-phase612-b",
    name: "Sensa Pens",
    summary:
      "官网说明品牌以1990年代Plasmium缓冲握位和人体工学舒适定位建立产品线。",
  }),
  sensaModel: web({
    key: "phase612-b-sensa-sensagraph",
    title: "The Sensagraph Collection",
    url: "https://sensapensofficial.com/collections/the-sensagraph-collection",
    registry: "sensa-official-phase612-b",
    name: "Sensa Pens",
    summary:
      "系列页确认六边形铝身、四种表面、Plasmium、EF/F/M/B不锈钢尖、墨囊/转换器与ballpoint sibling。",
  }),
  sensaRetail: web({
    key: "phase612-b-sensa-goldspot",
    title: "Sensa Sensagraph Fountain Pen in Antique Brass",
    url: "https://goldspot.com/products/sensa-sensagraph-fountain-pen-in-antique-brass",
    registry: "goldspot-pens-phase612-b",
    name: "Goldspot Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "授权零售 exact 页交叉确认铝身、Plasmium、不锈钢EF/F/M/B、墨囊/转换器、可后插与无笔夹。",
  }),
  tomHessinBrand: web({
    key: "phase612-b-tom-hessin-story",
    title: "Tom Hessin Story",
    url: "https://www.tomhessin.com/pages/tom-hessin-story",
    registry: "tom-hessin-official-phase612-b",
    name: "Tom Hessin",
    summary:
      "官网将品牌故事追溯到1870年Birmingham的T. Hessin & Co.，并说明Charles-Stockbridge家族五代复兴。",
  }),
  tomHessinModel: web({
    key: "phase612-b-tom-hessin-charles",
    title: "Charles Collection",
    url: "https://www.tomhessin.com/collections/charles-collection",
    registry: "tom-hessin-official-phase612-b",
    name: "Tom Hessin",
    summary:
      "官网集合页确认Charles钢笔及Castle Claret、Highland Green、Signature Blue、Birmingham Noir等颜色。",
  }),
  tomHessinRetail: web({
    key: "phase612-b-tom-hessin-goldspot",
    title: "Tom Hessin Charles Fountain Pen in Exhibition Red",
    url: "https://goldspot.com/products/tom-hessin-charles-fountain-pen-in-exhibition-red",
    registry: "goldspot-pens-phase612-b",
    name: "Goldspot Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "专业零售 exact 页给出欧洲树脂、#6钢尖选项、标准国际上墨、142/132/163 mm、13.5 mm与28 g。",
  }),
  zebraBrand: web({
    key: "phase612-b-zebra-fountain-page",
    title: "Zebra Fountain Pen",
    url: "https://www.zebrapen.com/pages/zebra-fountain-pen",
    registry: "zebra-pen-official-phase612-b",
    name: "Zebra Pen",
    summary:
      "官方页确认不锈钢0.6 mm Fine、七色、无墨囊固定墨水系统和AP approved。",
  }),
  zebraCatalog: web({
    key: "phase612-b-zebra-2025-catalog",
    title: "The Path to Self Expression - 2025 Zebra Product Catalog",
    url: "https://zebrapen.s3.us-east-1.amazonaws.com/zebra-product-catalog-2025/2025_Zebra_Catalog.pdf",
    registry: "zebra-pen-official-phase612-b",
    name: "Zebra Pen",
    summary:
      "官方目录将48311/48312/48304/48307/48310列为同一Fountain Pen的不同包装，并确认48307是七色包。",
  }),
  zebraRetail: web({
    key: "phase612-b-zebra-bluedogink",
    title: "Zebra Fountain Pen 0.6 mm 7/Pack 48307",
    url: "https://www.bluedogink.com/zebra-fountain-pen-fine-06-mm-assorted-ink-colors-assorted-7-pack-48307.html",
    registry: "bluedogink-phase612-b",
    name: "BlueDogInk",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "独立办公用品零售规格确认48307、0.6 mm、七色、stick、fountain nib、不可补充墨水。",
  }),
};

interface Definition {
  key: DefinitionKey;
  brandSlug: string;
  brandName: string;
  brandFile: string;
  brandAliases: string[];
  brandClaim: string;
  modelSlug: string;
  modelName: string;
  modelFile: string;
  modelAliases: string[];
  brandSource: CuratedSource;
  modelSource: CuratedSource;
  secondarySource: CuratedSource;
  modelClaim: string;
  boundary: string;
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
  variants: CuratedVariant[];
}

const definitions: Definition[] = [
  {
    key: "endless",
    brandSlug: PHASE612_BATCH_B_SLUGS.endlessBrand,
    brandName: "Endless Stationery",
    brandFile: ".planning/content-research/phase612-b-endless-brand.md",
    brandAliases: ["Endless", "Endless Works", "Endless 文具"],
    brandClaim:
      "Endless是印度Chennai文具品牌，当前产品横跨纸品、墨水、钢笔和配件。",
    modelSlug: PHASE612_BATCH_B_SLUGS.endlessPen,
    modelName: "Endless Phantom Retractable",
    modelFile:
      ".planning/content-research/phase612-b-endless-phantom-retractable.md",
    modelAliases: ["Endless Phantom", "Phantom Retractable Fountain Pen"],
    brandSource: S.endlessBrand,
    modelSource: S.endlessModel,
    secondarySource: S.endlessReview,
    modelClaim: "Phantom是按动出尖、前端密封的可伸缩钢笔，当前标准尖为EF/F/M。",
    boundary:
      "Creator、Captiva、Maze不是Phantom版本；UltraGrind附加尖与众筹配置不得覆盖当前标准商品。",
    values: {
      series_name: "Endless Phantom Retractable Fountain Pen",
      release_year: "2024 Kickstarter 项目；当前零售页于2026-08-14核实",
      origin_country: "印度 Chennai 品牌；整笔制造国未由当前官方页明确",
      nib: "当前标准商品页提供 Extra Fine、Fine、Medium；UltraGrind 等附加尖为另购配置",
      fill_system: "墨囊／随附转换器，独立量产样本交叉确认",
      material:
        "轻量聚合物主体；官方仅写 high-grade materials，不据此虚构具体树脂",
      weight: "独立早期量产样本约20 g；不同批次需复核",
      status: "当前官方在售",
    },
    variants: [
      {
        key: "phase612-b-endless-clear-chrome",
        name: "Clear Chrome",
        notes: "当前颜色SKU，不拆family。",
        sourceKey: S.endlessModel.key,
        variantKind: "color",
      },
      {
        key: "phase612-b-endless-nebula-blue",
        name: "Nebula Blue Chrome",
        notes: "当前颜色SKU，不拆family。",
        sourceKey: S.endlessModel.key,
        variantKind: "color",
      },
    ],
  },
  {
    key: "leboeuf",
    brandSlug: PHASE612_BATCH_B_SLUGS.leboeufBrand,
    brandName: "LeBoeuf",
    brandFile: ".planning/content-research/phase612-b-leboeuf-brand.md",
    brandAliases: ["LeBoeuf Pens", "LeBoeuf Fountain Pen Company", "勒伯夫"],
    brandClaim: "LeBoeuf把1919年历史品牌与百年后的当代复兴产品明确区分。",
    modelSlug: PHASE612_BATCH_B_SLUGS.leboeufPen,
    modelName: "LeBoeuf Pilgrim Heritage",
    modelFile:
      ".planning/content-research/phase612-b-leboeuf-pilgrim-heritage.md",
    modelAliases: ["Pilgrim Heritage Fountain Pen", "LeBoeuf Heritage Pilgrim"],
    brandSource: S.leboeufBrand,
    modelSource: S.leboeufModel,
    secondarySource: S.leboeufRetail,
    modelClaim:
      "Pilgrim Heritage是以1930年代轮廓为灵感的当代acrylic墨囊/转换器钢笔。",
    boundary:
      "同页rollerball、Pilgrim Pearl、早期Pilgrim与历史原件均不可继承本款钢笔机构和规格。",
    values: {
      series_name: "LeBoeuf Pilgrim Heritage Collection",
      release_year:
        "当代复兴系列；当前页面于2026-08-14核实，不把1930年代当作本款首发年",
      origin_country: "历史品牌源自美国；当前页面未明确整笔制造国",
      nib: "德国制造镀金钢尖，Fine、Medium、Broad",
      fill_system: "墨囊／转换器",
      material: "premium vintage-inspired acrylic；不同颜色饰件分别核对",
      status: "当前官方系列页在售",
    },
    variants: [
      "Candy Apple Red",
      "Forest Green",
      "Licorice Black",
      "Admiral/Sapphire Blue",
    ].map((name, index) => ({
      key: `phase612-b-leboeuf-color-${index + 1}`,
      name,
      notes: "Pilgrim Heritage颜色版本；蓝色市场命名需按订单确认。",
      sourceKey: S.leboeufModel.key,
      variantKind: "color",
    })),
  },
  {
    key: "marlen",
    brandSlug: PHASE612_BATCH_B_SLUGS.marlenBrand,
    brandName: "Marlen",
    brandFile: ".planning/content-research/phase612-b-marlen-brand.md",
    brandAliases: ["Marlen Pens", "Marlen Line", "马伦"],
    brandClaim:
      "Marlen于1982年创立于Campania，官网声明当前书写工具在意大利制造。",
    modelSlug: PHASE612_BATCH_B_SLUGS.marlenPen,
    modelName: "Marlen M20",
    modelFile: ".planning/content-research/phase612-b-marlen-m20.md",
    modelAliases: ["Marlen M20 Fountain Pen", "M20 Stilografica"],
    brandSource: S.marlenBrand,
    modelSource: S.marlenModel,
    secondarySource: S.marlenCatalog,
    modelClaim:
      "M20当前商品路径和变体确认钢尖钢笔与roller并存，本页只覆盖fountain pen。",
    boundary:
      "当前官网标题/描述与M20 handle冲突；Hippocrates主题、roller尺寸和18K选项不得覆盖所有M20钢笔。",
    values: {
      series_name: "Marlen M20",
      release_year: "当前商品路径于2026-08-14核实；首发年份未确认",
      origin_country: "Marlen 官方声明全线 Made in Italy；品牌位于 Sant’Arpino",
      nib: "当前 M20 商品选项列钢尖 Fine、Medium、Broad",
      fill_system: "墨囊／转换器；当前商品描述与经销目录交叉支持",
      material: "意大利树脂主体；颜色与主题装饰按具体版本核对",
      dimensions: "不采用 roller 拍卖尺寸作为钢笔规格",
      status: "当前官方路径可下单，但标题／描述与 M20 handle 存在冲突",
    },
    variants: [
      {
        key: "phase612-b-marlen-m20-steel",
        name: "M20 Fountain Pen - steel nib",
        notes: "本页收录的钢笔书写类型。",
        sourceKey: S.marlenModel.key,
        variantKind: "nib",
      },
      {
        key: "phase612-b-marlen-m20-roller",
        name: "M20 Roller",
        notes: "同平台独立书写类型，不并入钢笔规格。",
        sourceKey: S.marlenCatalog.key,
        variantKind: "market_sku",
      },
    ],
  },
  {
    key: "sensa",
    brandSlug: PHASE612_BATCH_B_SLUGS.sensaBrand,
    brandName: "Sensa",
    brandFile: ".planning/content-research/phase612-b-sensa-brand.md",
    brandAliases: ["Sensa Pens", "Sensa Pen", "森萨"],
    brandClaim: "Sensa以1990年代推出的Plasmium缓冲握位建立舒适书写品牌身份。",
    modelSlug: PHASE612_BATCH_B_SLUGS.sensaPen,
    modelName: "Sensa Sensagraph",
    modelFile: ".planning/content-research/phase612-b-sensa-sensagraph.md",
    modelAliases: ["Sensagraph Fountain Pen", "Sensa Sensagraph Fountain Pen"],
    brandSource: S.sensaBrand,
    modelSource: S.sensaModel,
    secondarySource: S.sensaRetail,
    modelClaim:
      "Sensagraph钢笔采用六边形铝身、Plasmium、不锈钢EF/F/M/B和墨囊/转换器。",
    boundary:
      "同名Sensagraph Ballpoint共享外观但使用旋转机构与替芯，不能并入钢笔。",
    values: {
      series_name: "Sensa Sensagraph Collection",
      release_year: "当代 Sensagraph 页面于2026-08-14核实；首发年份未声明",
      origin_country: "美国品牌当前产品；整笔制造国未由官方系列页明确",
      nib: "不锈钢，Extra Fine、Fine、Medium、Broad",
      fill_system: "标准墨囊／瓶装墨转换器系统",
      material: "轻量实心铝制六边形帽身，阳极漆面，Plasmium 缓冲握位",
      status: "当前官方系列页在售",
    },
    variants: [
      "Raven Black",
      "Antique Brass",
      "Cardinal Burgundy",
      "Lapis Blue",
    ].map((name, index) => ({
      key: `phase612-b-sensa-color-${index + 1}`,
      name,
      notes: "Sensagraph Fountain Pen颜色版本。",
      sourceKey: S.sensaModel.key,
      variantKind: "color",
    })),
  },
  {
    key: "tomHessin",
    brandSlug: PHASE612_BATCH_B_SLUGS.tomHessinBrand,
    brandName: "Tom Hessin",
    brandFile: ".planning/content-research/phase612-b-tom-hessin-brand.md",
    brandAliases: ["T. Hessin & Co.", "Tom Hessin Pens", "汤姆·赫辛"],
    brandClaim:
      "Tom Hessin将1870年Birmingham钢笔尖事业与Charles-Stockbridge家族五代复兴相连。",
    modelSlug: PHASE612_BATCH_B_SLUGS.tomHessinPen,
    modelName: "Tom Hessin Charles",
    modelFile: ".planning/content-research/phase612-b-tom-hessin-charles.md",
    modelAliases: ["Charles Fountain Pen", "Tom Hessin Charles Collection"],
    brandSource: S.tomHessinBrand,
    modelSource: S.tomHessinModel,
    secondarySource: S.tomHessinRetail,
    modelClaim:
      "Charles是现代欧洲树脂、#6钢尖、标准国际上墨的Tom Hessin复兴系列。",
    boundary:
      "Tom Hessin与Tom's Studio是独立品牌；1870不是Charles首发年，各颜色故事不互相继承。",
    values: {
      series_name: "Tom Hessin Charles Collection",
      release_year: "当前复兴系列；页面于2026-08-14核实，1870不是本款首发年",
      origin_country:
        "英国设计；官方零售资料仅写 assembled with precision components，不虚构整笔制造国",
      nib: "#6 不锈钢；常见 Extra Fine Flex、Fine、Medium、Broad、1.5 mm Stub，按颜色与库存核对",
      fill_system: "标准国际墨囊／转换器，两者随 Exhibition Red 零售样本提供",
      material: "high-grade European resin，具体颜色和饰件按版本",
      dimensions:
        "Exhibition Red 样本：合帽约142 mm，开帽约132 mm，盖帽后约163 mm，最大杆径约13.5 mm，握位约10–11 mm",
      weight: "Exhibition Red 样本合帽约28 g",
      status: "当前官方 Charles Collection 在售",
    },
    variants: [
      "Castle Claret",
      "Highland Green",
      "Signature Blue",
      "Birmingham Noir",
      "Exhibition Red",
      "Thames Blue",
    ].map((name, index) => ({
      key: `phase612-b-tom-hessin-color-${index + 1}`,
      name,
      notes: "Charles颜色/叙事版本；exact SKU库存分别核对。",
      sourceKey: index < 4 ? S.tomHessinModel.key : S.tomHessinRetail.key,
      variantKind: "color",
    })),
  },
  {
    key: "zebra",
    brandSlug: PHASE612_BATCH_B_SLUGS.zebraBrand,
    brandName: "Zebra Pen",
    brandFile: ".planning/content-research/phase612-b-zebra-brand.md",
    brandAliases: ["Zebra", "Zebra Pen Corporation", "斑马牌"],
    brandClaim:
      "Zebra Pen是综合书写工具品牌，当前美国目录有独立Fountain Pen支线。",
    modelSlug: PHASE612_BATCH_B_SLUGS.zebraPen,
    modelName: "Zebra Fountain Pen",
    modelFile: ".planning/content-research/phase612-b-zebra-fountain-pen.md",
    modelAliases: [
      "Zebra Fountain Stick Pen",
      "Zebra Disposable Fountain Pen",
      "Zebra Fuente",
    ],
    brandSource: S.zebraBrand,
    modelSource: S.zebraBrand,
    secondarySource: S.zebraRetail,
    modelClaim:
      "Zebra Fountain Pen是0.6 mm不锈钢尖、七色、预装固定墨水的即用钢笔。",
    boundary:
      "48307只是七色包装号；48311/48312/48304/48310等也是同一family的包装，均不另建型号。",
    values: {
      series_name: "Zebra Fountain Pen / Fountain Stick Pen",
      release_year: "当前美国官方产品；2025目录确认包装号，不虚构首发年份",
      origin_country: "Zebra 美国市场产品；整笔制造国未由当前产品页明确",
      nib: "不锈钢 fine，0.6 mm",
      fill_system: "预装固定墨水，不使用墨囊，不可补充",
      material: "轻量塑料笔身；详细树脂牌号未声明",
      status: "当前官方产品页和2025目录在列",
    },
    variants: [
      {
        key: "phase612-b-zebra-48307",
        name: "7 Pack - 0.6 mm assorted",
        notes: "七色包装，不是型号。",
        sourceKey: S.zebraCatalog.key,
        variantKind: "market_sku",
        productCode: "48307",
        market: "US",
      },
      {
        key: "phase612-b-zebra-48311",
        name: "1 Pack - 0.6 mm Black",
        notes: "单支黑色包装，不是型号。",
        sourceKey: S.zebraCatalog.key,
        variantKind: "market_sku",
        productCode: "48311",
        market: "US",
      },
    ],
  },
];

function brandPack(def: Definition): CuratedEntityPack {
  const scopeKey = `phase612-b-${def.key}-brand-scope`;
  const art = diagram(def.key, "brand");
  const sources = [
    def.brandSource,
    def.modelSource,
    def.secondarySource,
    art,
  ].filter(
    (source, index, candidates) =>
      candidates.findIndex((candidate) => candidate.key === source.key) ===
      index,
  );
  return {
    key: `phase612-b-${def.key}-brand-v1`,
    entityId: PHASE612_BATCH_B_BRANDS[def.key],
    expectedType: "brand",
    expectedSlug: def.brandSlug,
    canonicalName: def.brandName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: def.brandFile,
    storyTitle: `${def.brandName}：身份、历史与型号导航`,
    primarySourceKey: def.brandSource.key,
    depthTier: "A",
    aliases: def.brandAliases.map((alias) => ({
      alias,
      language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en",
      sourceKey: def.brandSource.key,
    })),
    sources,
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope:
          "Brand navigation includes only the reviewed representative fountain-pen family.",
      },
    ],
    claims: [
      {
        key: `phase612-b-${def.key}-brand-identity`,
        predicate: "brand_identity",
        objectText: def.brandClaim,
        factClass: "core",
        confidence: 0.98,
        sourceKey: def.brandSource.key,
        locator: def.brandSource.summary,
        evidence: [
          {
            key: `phase612-b-${def.key}-brand-primary`,
            sourceKey: def.brandSource.key,
            scopeKey,
            locator: def.brandSource.summary,
          },
          {
            key: `phase612-b-${def.key}-brand-model`,
            sourceKey: def.modelSource.key,
            scopeKey,
            locator: def.modelSource.summary,
          },
          {
            key: `phase612-b-${def.key}-brand-independent`,
            sourceKey: def.secondarySource.key,
            scopeKey,
            locator: def.secondarySource.summary,
          },
        ],
      },
    ],
    timeline: [
      {
        key: `phase612-b-${def.key}-brand-verified`,
        title: `${def.brandName} current identity verified`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: "Verification date is not a founding date.",
        sourceKey: def.brandSource.key,
      },
      {
        key: `phase612-b-${def.key}-model-navigation-verified`,
        title: `${def.modelName} current model navigation verified`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description:
          "Current representative-model verification date; not the model launch date.",
        sourceKey: def.modelSource.key,
      },
    ],
    media: [
      {
        key: `phase612-b-${def.key}-brand-primary-media`,
        title: `${def.brandName} 品牌事实图（非产品照片）`,
        sourceKey: art.key,
        localPath: art.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创事实示意；非产品照片、Logo、颜色校样、纹理复刻或比例图。",
        sourceUrl: art.url,
        usageStatus: "primary",
      },
    ],
  };
}

function modelPack(def: Definition): CuratedEntityPack {
  const scopeKey = `phase612-b-${def.key}-model-scope`;
  const art = diagram(def.key, "model");
  const fields = Object.keys(def.values) as Array<
    Exclude<SpecFieldKey, "brand_entity_id">
  >;
  const rejectedKey = `phase612-b-${def.key}-rejected-boundary`;
  const sources = [
    def.modelSource,
    def.brandSource,
    def.secondarySource,
    ...(def.key === "zebra" ? [S.zebraCatalog] : []),
    art,
  ].filter(
    (source, index, candidates) =>
      candidates.findIndex((candidate) => candidate.key === source.key) ===
      index,
  );
  return {
    key: `phase612-b-${def.key}-model-v1`,
    entityId: PHASE612_BATCH_B_PENS[def.key],
    expectedType: "pen",
    expectedSlug: def.modelSlug,
    canonicalName: def.modelName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: def.modelFile,
    storyTitle: `${def.modelName}：规格、版本边界、维护与选购`,
    primarySourceKey: def.modelSource.key,
    depthTier: "A",
    aliases: def.modelAliases.map((alias) => ({
      alias,
      language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en",
      sourceKey: def.modelSource.key,
    })),
    sources,
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: "Only exact reviewed fountain-pen nib options qualify.",
        materialScope: "Colours and sibling writing systems do not inherit.",
        editionScope: def.boundary,
      },
    ],
    claims: [
      {
        key: `phase612-b-${def.key}-model-identity`,
        predicate: "model_identity",
        objectText: def.modelClaim,
        factClass: "core",
        confidence: 0.99,
        sourceKey: def.modelSource.key,
        locator: def.modelSource.summary,
        evidence: [
          {
            key: `phase612-b-${def.key}-model-official`,
            sourceKey: def.modelSource.key,
            scopeKey,
            locator: def.modelSource.summary,
          },
          {
            key: `phase612-b-${def.key}-model-independent`,
            sourceKey: def.secondarySource.key,
            scopeKey,
            locator: def.secondarySource.summary,
          },
        ],
      },
      {
        key: `phase612-b-${def.key}-model-boundary`,
        predicate: "version_boundary",
        objectText: def.boundary,
        factClass: "core",
        confidence: 0.99,
        sourceKey: def.modelSource.key,
        locator: def.modelSource.summary,
        evidence: [
          {
            key: rejectedKey,
            sourceKey: def.modelSource.key,
            scopeKey,
            locator: def.boundary,
          },
        ],
      },
    ],
    variants: def.variants,
    spec: {
      brandEntityId: PHASE612_BATCH_B_BRANDS[def.key],
      values: def.values,
      evidence: [
        cite(
          "brand_entity_id",
          `phase612-b-${def.key}-spec-brand`,
          def.brandSource.key,
          scopeKey,
          def.brandClaim,
        ),
        ...fields.map((field) =>
          cite(
            field,
            `phase612-b-${def.key}-spec-${field}`,
            def.key === "tomHessin" ||
              (def.key === "endless" &&
                (field === "weight" || field === "fill_system"))
              ? def.secondarySource.key
              : def.modelSource.key,
            scopeKey,
            `reviewed exact scope: ${field}`,
          ),
        ),
        cite(
          "dimensions",
          rejectedKey,
          def.secondarySource.key,
          scopeKey,
          def.boundary,
          false,
        ),
      ],
    },
    conflicts: [
      {
        key: `phase612-b-${def.key}-identity-boundary`,
        fieldKey: "identity",
        scopeKey,
        conflictKind: "identity",
        status: "resolved",
        resolutionNote: def.boundary,
        members: [
          {
            citationKey: `phase612-b-${def.key}-spec-series_name`,
            assertedValue: "exact reviewed fountain-pen scope accepted",
          },
          {
            citationKey: rejectedKey,
            assertedValue: "sibling, package or conflicting scope rejected",
          },
        ],
      },
    ],
    timeline: [
      {
        key: `phase612-b-${def.key}-model-verified`,
        title: `${def.modelName} exact scope verified`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: "Verification date is not a launch date.",
        sourceKey: def.modelSource.key,
      },
    ],
    media: [
      {
        key: `phase612-b-${def.key}-model-primary-media`,
        title: `${def.modelName} 规格事实图（非产品照片）`,
        sourceKey: art.key,
        localPath: art.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创事实示意；非产品照片、Logo、颜色校样、纹理复刻或比例图。",
        sourceUrl: art.url,
        usageStatus: "primary",
      },
    ],
  };
}

export const phase612BatchBGroups: Array<{
  brand: CuratedEntityPack;
  pens: CuratedEntityPack[];
}> = definitions.map((definition) => ({
  brand: brandPack(definition),
  pens: [modelPack(definition)],
}));

export const phase612BatchBPacks = phase612BatchBGroups.flatMap(
  ({ brand, pens }) => [brand, ...pens],
);
