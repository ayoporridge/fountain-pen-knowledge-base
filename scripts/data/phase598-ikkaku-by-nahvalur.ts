import type {
  CuratedConflict,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE597_NAHVALUR_BRAND_ID,
  phase597NahvalurBrandPack,
} from "./phase597-nahvalur-key-west-triad-pen-of-year";

export const PHASE598_NAHVALUR_BRAND_ID = PHASE597_NAHVALUR_BRAND_ID;
export const PHASE598_IKKAKU_ARTICLE_ID = "phase598-ikkaku-series-navigation";
export const PHASE598_IKKAKU_ARTICLE_SLUG = "ikkaku-by-nahvalur";

export const PHASE598_IDS = {
  yeYu: "phase598-ikkaku-ye-yu",
  panLong: "phase598-ikkaku-pan-long",
  blueMoon: "phase598-ikkaku-blue-moon",
  greenMoon: "phase598-ikkaku-green-moon",
  bloodMoon: "phase598-ikkaku-blood-moon",
  dragonfly: "phase598-ikkaku-dragonfly",
  cherryBlossom: "phase598-ikkaku-cherry-blossom",
  snake: "phase598-ikkaku-year-of-snake",
  horse: "phase598-ikkaku-year-of-horse",
  gradient: "phase598-ikkaku-gradient-urushi",
  sunburst: "phase598-ikkaku-exclusive-sunburst",
  yingChun: "phase598-ikkaku-ying-chun",
  lanYue: "phase598-ikkaku-lan-yue-crossflex",
  yuTu: "phase598-ikkaku-yu-tu",
  rhinoceros: "phase598-ikkaku-rhinoceros-skin",
  eggshell: "phase598-ikkaku-raden-eggshell",
} as const;

export const PHASE598_SLUGS = {
  yeYu: "ikkaku-ye-yu",
  panLong: "ikkaku-pan-long",
  blueMoon: "ikkaku-blue-moon",
  greenMoon: "ikkaku-green-moon",
  bloodMoon: "ikkaku-blood-moon",
  dragonfly: "ikkaku-dragonfly",
  cherryBlossom: "ikkaku-cherry-blossom",
  snake: "ikkaku-year-of-the-snake",
  horse: "ikkaku-year-of-the-horse",
  gradient: "ikkaku-gradient-urushi",
  sunburst: "ikkaku-exclusive-sunburst",
  yingChun: "ikkaku-ying-chun",
  lanYue: "ikkaku-lan-yue-crossflex",
  yuTu: "ikkaku-yu-tu",
  rhinoceros: "ikkaku-rhinoceros-skin-lacquer",
  eggshell: "ikkaku-raden-eggshell-black-urushi",
} as const;

export type Phase598ModelKey = keyof typeof PHASE598_IDS;
const RETRIEVED = "2026-08-12";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  sourceType: "official" | "retailer" | "blog";
  tier: "primary" | "professional_secondary" | "contemporary_archive";
  registryKey: string;
  registryName: string;
  homepageUrl: string;
  author: string;
  publishedAt?: string;
}): CuratedSource {
  return {
    ...input,
    independenceGroup: input.registryKey,
    itemType: "web_page",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function official(key: string, title: string, url: string, summary: string): CuratedSource {
  return source({
    key,
    title,
    url,
    summary,
    sourceType: "official",
    tier: "primary",
    registryKey: "nahvalur-official-phase598",
    registryName: "Nahvalur official",
    homepageUrl: "https://nahvalur.com/",
    author: "Nahvalur",
  });
}

function retailer(
  key: string,
  registryKey: string,
  registryName: string,
  homepageUrl: string,
  title: string,
  url: string,
  summary: string,
): CuratedSource {
  return source({
    key,
    title,
    url,
    summary,
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey,
    registryName,
    homepageUrl,
    author: registryName,
  });
}

function editorial(key: Phase598ModelKey | "series"): CuratedSource {
  const file = {
    series: "ikkaku-series",
    yeYu: "ikkaku-ye-yu",
    panLong: "ikkaku-pan-long",
    blueMoon: "ikkaku-blue-moon",
    greenMoon: "ikkaku-green-moon",
    bloodMoon: "ikkaku-blood-moon",
    dragonfly: "ikkaku-dragonfly",
    cherryBlossom: "ikkaku-cherry-blossom",
    snake: "ikkaku-year-of-snake",
    horse: "ikkaku-year-of-horse",
    gradient: "ikkaku-gradient-urushi",
    sunburst: "ikkaku-sunburst",
    yingChun: "ikkaku-ying-chun",
    lanYue: "ikkaku-lan-yue-crossflex",
    yuTu: "ikkaku-yu-tu",
    rhinoceros: "ikkaku-rhinoceros-skin",
    eggshell: "ikkaku-raden-eggshell",
  }[key];
  const localPath = `/images/library/site-original/phase598/nahvalur/${file}.svg`;
  return {
    key: `phase598-editorial-${key}`,
    registryKey: `fountain-pen-graph-editorial-phase598-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase598-${file}`,
    title: `IKKAKU ${key} factual diagram`,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创事实示意图，非产品照片；只表达来源化身份、工艺、版本、SKU 或冲突边界。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

export const phase598IkkakuCollectionSource = official(
  "phase598-ikkaku-official-collection",
  "Shop IKKAKU by Nahvalur",
  "https://nahvalur.com/collections/ikkaku-by-nahvalur",
  "官方 collection 使用 IKKAKU by Nahvalur 名称，列出当前九款，并证明 IKKAKU 是 Nahvalur 的高端产品线而非无关制造商。",
);

const moonSource = official(
  "phase598-ikkaku-moon-trilogy",
  "IKKAKU Moon Trilogy",
  "https://nahvalur.com/collections/ikkaku-moon-trilogy",
  "官方 Moon Trilogy 将 Blue Moon、Green Moon 与 Blood Moon 组成三款独立商品。",
);

const S = {
  yeYu: official("phase598-ikkaku-ye-yu", "IKKAKU Ye-Yu Urushi Raden", "https://nahvalur.com/products/ikkaku-ye-yu-urushi-raden-fountain-pen", "官方页确认 2023 首款、Nautilus 轮廓、黑漆螺钿、No.6 14K F/M、cartridge/converter、尺寸重量及两个 SKU。"),
  panLong: official("phase598-ikkaku-pan-long", "IKKAKU Pan-Long Coiling Dragon", "https://nahvalur.com/products/ikkaku-pan-long-coiling-dragon-urushi-chinkin-fountain-pen", "官方页确认 2024 盘龙沈金、14K F/M、cartridge/converter、尺寸重量与当前不可售 SKU。"),
  blueMoon: official("phase598-ikkaku-blue-moon", "IKKAKU Blue Moon", "https://nahvalur.com/products/ikkaku-by-nahvalur-lan-yu-urushi-pen", "官方页确认 2025 Blue Moon、蓝漆铂粉、玫瑰金色饰件、14K F/M、供墨、尺寸重量及 SKU。"),
  greenMoon: official("phase598-ikkaku-green-moon", "IKKAKU Green Moon", "https://nahvalur.com/products/ikkaku-by-nahvalur-green-moon-urushi-fountain-pen", "官方页确认 2025 Green Moon、绿漆铂粉、玫瑰金色饰件、14K F/M、供墨、尺寸重量及 SKU。"),
  bloodMoon: official("phase598-ikkaku-blood-moon", "IKKAKU Blood Moon", "https://nahvalur.com/products/ikkaku-by-nahvalur-blood-moon-urushi-fountain-pen", "官方页确认 2025 Blood Moon、红漆金色粉末、黄色金色饰件、14K F/M、供墨、尺寸重量及 SKU。"),
  dragonfly: official("phase598-ikkaku-dragonfly", "IKKAKU Dragonfly", "https://nahvalur.com/products/ikkaku-dragonfly-urushi-fountain-pen", "官方页确认黑漆硬橡胶、螺钿蜻蜓、金色细点、14K F/M、供墨、尺寸重量及 SKU。"),
  cherryBlossom: official("phase598-ikkaku-cherry-blossom", "IKKAKU Cherry Blossom", "https://nahvalur.com/products/ikkaku-cherry-blossom-urushi-fountain-pen", "官方页确认蓝漆硬橡胶、粉白手绘樱花、花形黄铜夹、银色饰件、14K 玫瑰金色 F/M、供墨及 SKU。"),
  snake: official("phase598-ikkaku-snake", "IKKAKU Year of the Snake", "https://nahvalur.com/products/ikkaku-snake-urushi-fountain-pen", "官方页确认黑漆硬橡胶、螺钿蛇鳞、蛇形夹、14K F/M、供墨、尺寸重量及 SKU。"),
  horse: official("phase598-ikkaku-horse", "IKKAKU Year of the Horse", "https://nahvalur.com/products/ikkaku-by-nahvalur-%E9%AA%8F-year-of-the-horse-urushi-fountain-pen", "官方页确认全球 26 支、蓝漆莳绘、银、珠母马、玫瑰金色 14K F/M、供墨、尺寸重量及 SKU。"),
  gradient: retailer("phase598-ikkaku-gradient", "pen-chalet-phase598", "Pen Chalet", "https://www.penchalet.com/", "IKKAKU Gradient Urushi", "https://www.penchalet.com/fine_pens/fountain_pens/ikkaku_by_nahvalur_gradient_urushi_fountain_pens.html", "专业零售页确认 2024 三色、每色 20 支、生漆渐变工序、No.6 14K F/M 与 standard international cartridge/converter。"),
  gradientReview: source({key:"phase598-ikkaku-gradient-review",title:"IKKAKU Gradient Urushi Fountain Pen Review",url:"https://www.penaddict.com/blog/2024/2/26/ikkaku-by-nahvalur-gradient-urushi-fountain-pen-review",summary:"同期专业评测把 Yan-Zhi、Zhu-Dan、Cong-Lü 识别为三笔 Gradient collection，并记录 14K 与 cartridge/converter。",sourceType:"blog",tier:"professional_secondary",registryKey:"pen-addict-phase598",registryName:"The Pen Addict",homepageUrl:"https://www.penaddict.com/",author:"The Pen Addict",publishedAt:"2024-02-26"}),
  sunburst: retailer("phase598-ikkaku-sunburst", "pen-chalet-phase598", "Pen Chalet", "https://www.penchalet.com/", "IKKAKU Exclusive Sunburst", "https://www.penchalet.com/fine_pens/fountain_pens/ikkaku_by_nahvalur_exclusive_sunburst_fountain_pens.html", "专业零售页确认 Pen Chalet 独家 12 支、黑橙漆面、resin 基础件、No.6 14K F/M、国际 cartridge/converter 与尺寸重量。"),
  yingChun: retailer("phase598-ikkaku-ying-chun", "goldspot-phase598", "Goldspot Pens", "https://goldspot.com/", "IKKAKU Ying-Chun Forsythia", "https://goldspot.com/products/ikkaku-by-nahvalur-fountain-pen-in-ying-chun-forthysia", "授权零售页确认 2024、24 支、迎春花手绘、14K F/M、cartridge/converter、Fine SKU 与一组尺寸重量。"),
  yingChunConflict: retailer("phase598-ikkaku-ying-chun-conflict", "pen-chalet-phase598", "Pen Chalet", "https://www.penchalet.com/", "IKKAKU Ying-Chun (Forthysia)", "https://www.penchalet.com/fine_pens/fountain_pens/ikkaku_by_nahvalur_ying-chun_%28forthysia%29_fountain_pens.html", "同页标题正文图片均为 Ying-Chun，却把下拉选项误写 La-Mei，并给出与 Goldspot 冲突的重量。"),
  lanYue: retailer("phase598-ikkaku-lan-yue", "pen-chalet-phase598", "Pen Chalet", "https://www.penchalet.com/", "IKKAKU Lan-Yue (Blue Moon) Crossflex", "https://www.penchalet.com/fine_pens/fountain_pens/ikkaku_by_nahvalur_lan-yue_blue_moon_fountain_pens.html", "专业零售页确认 Regalia/Ralph Reyes Crossflex、蓝漆铂粉、bespoke converter 与尺寸；同页钢尖正文和 Gold 规格表冲突。"),
  yuTu: retailer("phase598-ikkaku-yu-tu", "st-johns-pens-phase598", "St. John's Pens", "https://www.stjohnspens.com/", "IKKAKU Yu-Tu Jade Rabbit sold-out archive", "https://www.stjohnspens.com/sold-out-edition-two", "专业二手商档案保留完整 Yu-Tu/Jade Rabbit Urushi Fountain Pen 历史实物名称。"),
  yuTuIndex: retailer("phase598-ikkaku-yu-tu-index", "merchantgenius-phase598", "MerchantGenius", "https://www.merchantgenius.io/", "Historical Nahvalur Shopify listing", "https://www.merchantgenius.io/shop/url/getthispen.com", "旧 Shopify 商品索引确认 Yu-Tu Urushi Pen、Fine/Medium 与历史公开商品记录。"),
  rhinoceros: retailer("phase598-ikkaku-rhinoceros", "pen-chalet-phase598", "Pen Chalet", "https://www.penchalet.com/", "IKKAKU Rhinoceros Skin Lacquer", "https://www.penchalet.com/fine_pens/fountain_pens/ikkaku_by_nahvalur_rhinoceros_skin_lacquer_le_fountain_pens.html", "专业零售页确认犀皮漆工序、Qian-Tan/Shen-Hai、No.6 14K、cartridge/converter、尺寸及 18/4 数量主张。"),
  shenHai: retailer("phase598-ikkaku-shen-hai", "chatterley-phase598", "Chatterley Luxuries", "https://chatterleyluxuries.com/", "IKKAKU Shen-Hai Deep Sea", "https://chatterleyluxuries.com/product/ikkaku-by-nahvalur-lacquer-urushi-shen-hai-deep-sea-fountain-pen/", "历史商品页确认硬橡胶叠漆、14K、cartridge/converter，并把 Shen-Hai 写成 2023、18 支，与 Pen Chalet 的 4 支冲突。"),
  qianTan: retailer("phase598-ikkaku-qian-tan", "chatterley-phase598", "Chatterley Luxuries", "https://chatterleyluxuries.com/", "IKKAKU Qian-Tan Shoal", "https://chatterleyluxuries.com/product/ikkaku-by-nahvalur-lacquer-urushi-qian-tan-shoal-fountain-pen/", "历史商品页确认 Qian-Tan 2023、18 支、硬橡胶叠漆、14K 与 cartridge/converter。"),
  eggshell: retailer("phase598-ikkaku-eggshell", "nibs-com-phase598", "Nibs.com", "https://nibs.com/", "IKKAKU Raden Eggshell Black Urushi", "https://nibs.com/products/ikkaku-by-nahvalur-raden-eggshell-black-urushi-limited-edition", "授权零售页确认独家九支、硬橡胶黑漆、手置螺钿蛋壳、玫瑰金色饰件、14K M/Music 与 piston。"),
} as const;

const goldspotIkkakuCollection = retailer(
  "phase598-goldspot-ikkaku-collection",
  "goldspot-phase598",
  "Goldspot Pens",
  "https://goldspot.com/",
  "Ikkaku by Nahvalur collection",
  "https://goldspot.com/collections/ikkaku-by-nahvalur",
  "授权零售商集合页独立列出 Ye-Yu、Dragonfly、Cherry Blossom、Year of the Snake 与 Year of the Horse，并保留对应商品代码。",
);

const atlasNahvalurCollection = retailer(
  "phase598-atlas-nahvalur-collection",
  "atlas-stationers-phase598",
  "Atlas Stationers",
  "https://www.atlasstationers.com/",
  "Nahvalur fountain pens collection",
  "https://www.atlasstationers.com/collections/nahvalur",
  "授权零售商集合页把 Blue Moon、Green Moon 与 Blood Moon 分列为 IKKAKU by Nahvalur 商品，并保留其销售状态。",
);

const panLongRetailer = retailer(
  "phase598-pen-chalet-pan-long",
  "pen-chalet-phase598",
  "Pen Chalet",
  "https://www.penchalet.com/",
  "IKKAKU by Nahvalur Pan-Long Coiling Dragon",
  "https://www.penchalet.com/fine_pens/fountain_pens/ikkaku_by_nahvalur_pan_long_coiling_dragon_fountain_pens.html",
  "专业零售页独立确认 Pan-Long 盘龙商品身份、龙年题材、14K 金尖、Fine/Medium 与 standard international cartridge/converter。",
);

const currentSecondaryByKey: Partial<Record<Phase598ModelKey, CuratedSource>> = {
  yeYu: goldspotIkkakuCollection,
  panLong: panLongRetailer,
  blueMoon: atlasNahvalurCollection,
  greenMoon: atlasNahvalurCollection,
  bloodMoon: atlasNahvalurCollection,
  dragonfly: goldspotIkkakuCollection,
  cherryBlossom: goldspotIkkakuCollection,
  snake: goldspotIkkakuCollection,
  horse: goldspotIkkakuCollection,
};

type SpecValues = NonNullable<CuratedEntityPack["spec"]>["values"];
type ModelDefinition = {
  key: Phase598ModelKey;
  name: string;
  markdown: string;
  primary: CuratedSource;
  extraSources?: CuratedSource[];
  aliases: string[];
  specs: SpecValues;
  specSourceByField?: Partial<Record<SpecFieldKey, CuratedSource>>;
  variants: CuratedVariant[];
  conflicts?: CuratedConflict[];
  extraEvidence?: CuratedSpecEvidence[];
};

function editionVariants(
  prefix: string,
  sourceKey: string,
  releaseYear: string | null,
  fineCode?: string,
  mediumCode?: string,
): CuratedVariant[] {
  return [
    {key:`${prefix}-edition`,name:"Canonical edition",releaseYear,notes:"Canonical product edition parent for nib/SKU children.",sourceKey,variantKind:"edition_group"},
    {key:`${prefix}-fine`,name:"Fine",releaseYear,notes:"Fine nib option.",sourceKey,variantKind:fineCode?"market_sku":"nib",parentVariantKey:`${prefix}-edition`,productCode:fineCode??null,market:"global"},
    {key:`${prefix}-medium`,name:"Medium",releaseYear,notes:"Medium nib option.",sourceKey,variantKind:mediumCode?"market_sku":"nib",parentVariantKey:`${prefix}-edition`,productCode:mediumCode??null,market:"global"},
  ];
}

const current = (
  key: Phase598ModelKey,
  name: string,
  markdown: string,
  primary: CuratedSource,
  release: string,
  material: string,
  fine: string,
  medium: string,
  aliases: string[],
  status = "current; availability captured 2026-08-11",
): ModelDefinition => ({
  key,name,markdown,primary,aliases,
  extraSources: [
    phase598IkkakuCollectionSource,
    ...(currentSecondaryByKey[key] ? [currentSecondaryByKey[key]] : []),
    ...(key === "blueMoon" || key === "greenMoon" || key === "bloodMoon"
      ? [moonSource]
      : []),
  ],
  specs:{series_name:"IKKAKU by Nahvalur",release_year:release,nib:"Nahvalur 14K gold; Fine/Medium",fill_system:"cartridge/converter",material,dimensions:"149–150 mm closed; 133 mm open; non-postable; 13 mm barrel; 10–11.5 mm grip",weight:"36.85 g",status},
  variants:editionVariants(`phase598-${key}`,primary.key,release,fine,medium),
});

const definitions: ModelDefinition[] = [
  current("yeYu","IKKAKU by Nahvalur Ye-Yu Urushi Raden Fountain Pen",".planning/content-research/ikkaku-ye-yu-phase598.md",S.yeYu,"2023","deep black urushi with inlaid raden; gold trim","91100011G","91100012G",["IKKAKU Ye-Yu","夜羽"]),
  current("panLong","IKKAKU by Nahvalur Pan-Long Coiling Dragon Urushi Chinkin Fountain Pen",".planning/content-research/ikkaku-pan-long-phase598.md",S.panLong,"2024","urushi chinkin dragon motif; gold trim","91100151G","91100152G",["IKKAKU Pan-Long","盘龙"],"historical/current archive; both SKUs unavailable 2026-08-11"),
  current("blueMoon","IKKAKU by Nahvalur Blue Moon Urushi Fountain Pen",".planning/content-research/ikkaku-blue-moon-phase598.md",S.blueMoon,"2025","blue urushi with platinum powder; rose-gold trim","91100021G","91100022G",["IKKAKU Blue Moon","蓝月"]),
  current("greenMoon","IKKAKU by Nahvalur Green Moon Urushi Fountain Pen",".planning/content-research/ikkaku-green-moon-phase598.md",S.greenMoon,"2025","green urushi with platinum powder; rose-gold trim","91100221G","91100222G",["IKKAKU Green Moon","翠月"]),
  current("bloodMoon","IKKAKU by Nahvalur Blood Moon Urushi Fountain Pen",".planning/content-research/ikkaku-blood-moon-phase598.md",S.bloodMoon,"2025","red urushi with gold-colour powder; yellow-gold trim","91100231G","91100232G",["IKKAKU Blood Moon","血月"]),
  current("dragonfly","IKKAKU by Nahvalur Dragonfly Urushi Fountain Pen",".planning/content-research/ikkaku-dragonfly-phase598.md",S.dragonfly,"2025","ebonite; black urushi; raden dragonflies and gold flecks","91100191G","91100192G",["IKKAKU Dragonfly","蜻蜓"]),
  current("cherryBlossom","IKKAKU by Nahvalur Cherry Blossom Urushi Fountain Pen",".planning/content-research/ikkaku-cherry-blossom-phase598.md",S.cherryBlossom,"2025","ebonite; cobalt-blue urushi; hand-painted sakura; silver trim","91100211G","91100212G",["IKKAKU Cherry Blossom","落樱"]),
  current("snake","IKKAKU by Nahvalur Year of the Snake Urushi Fountain Pen",".planning/content-research/ikkaku-year-of-snake-phase598.md",S.snake,"2025","ebonite; black urushi; raden snake scales; serpent clip","91100201G","91100202G",["IKKAKU Year of the Snake","IKKAKU 蟒","蟒"]),
  current("horse","IKKAKU by Nahvalur Year of the Horse Urushi Fountain Pen",".planning/content-research/ikkaku-year-of-horse-phase598.md",S.horse,"2026","blue urushi; maki-e; silver; inlaid pearl horse; rose-gold trim","91100241G","91100242G",["IKKAKU Year of the Horse","IKKAKU 骏","骏"],"current; 26 pieces worldwide; availability captured 2026-08-11"),
  {
    key:"gradient",name:"IKKAKU by Nahvalur Gradient Urushi Fountain Pen",markdown:".planning/content-research/ikkaku-gradient-urushi-phase598.md",primary:S.gradient,extraSources:[S.gradientReview],aliases:["IKKAKU Gradient Urushi","Gradient Urushi Collection"],
    specs:{series_name:"IKKAKU by Nahvalur",release_year:"2024",nib:"No.6 14K gold; Fine/Medium",fill_system:"standard international cartridge/converter",material:"multicolour gradient urushi; gold trim",dimensions:"149 mm closed; 133 mm open; non-postable; 13 mm barrel; 10–11.5 mm grip",weight:"36.85 g",status:"historical; Yan-Zhi, Zhu-Dan and Cong-Lü; 20 pieces per colour"},
    variants: ([
      ["yan", "Yan-Zhi (Vermilion)", "NW-91100121G", "NW-91100122G"],
      ["zhu", "Zhu-Dan (Cinnabar Red)", null, null],
      ["cong", "Cong-Lü (Scallion Green)", null, null],
    ] as const).flatMap(([key, name, fineCode, mediumCode]) => [
      {
        key: `gradient-${key}`,
        name,
        releaseYear: "2024",
        notes: "One of three 20-piece Gradient Urushi colour editions.",
        sourceKey: S.gradient.key,
        variantKind: "edition_group" as const,
      },
      {
        key: `gradient-${key}-f`,
        name: `${name} Fine`,
        releaseYear: "2024",
        notes: "Fine nib option.",
        sourceKey: S.gradient.key,
        variantKind: fineCode ? ("market_sku" as const) : ("nib" as const),
        parentVariantKey: `gradient-${key}`,
        productCode: fineCode,
        market: "global",
      },
      {
        key: `gradient-${key}-m`,
        name: `${name} Medium`,
        releaseYear: "2024",
        notes: "Medium nib option.",
        sourceKey: S.gradient.key,
        variantKind: mediumCode ? ("market_sku" as const) : ("nib" as const),
        parentVariantKey: `gradient-${key}`,
        productCode: mediumCode,
        market: "global",
      },
    ]),
  },
  {key:"sunburst",name:"IKKAKU by Nahvalur Exclusive Sunburst Fountain Pen",markdown:".planning/content-research/ikkaku-sunburst-phase598.md",primary:S.sunburst,aliases:["IKKAKU Sunburst","Exclusive Sunburst"],specs:{series_name:"IKKAKU by Nahvalur",release_year:"historical",nib:"No.6 14K gold; Fine/Medium",fill_system:"standard international cartridge/converter",material:"resin body/section with black and yellow-orange urushi finish; gold-plated trim",dimensions:"149.9 mm closed; 133.1 mm open; non-postable; 13 mm barrel; 9.9 mm grip",weight:"36.85 g",status:"Pen Chalet exclusive; 12 pieces; out of stock"},variants:editionVariants("sunburst",S.sunburst.key,null)},
  {
    key:"yingChun",name:"IKKAKU by Nahvalur Ying-Chun Forsythia Fountain Pen",markdown:".planning/content-research/ikkaku-ying-chun-phase598.md",primary:S.yingChun,extraSources:[S.yingChunConflict],aliases:["IKKAKU Ying-Chun","迎春","Ying-Chun (Forsythia)"],
    specs:{series_name:"IKKAKU by Nahvalur",release_year:"2024",nib:"No.6 14K gold; Fine/Medium",fill_system:"cartridge/converter",material:"resin base; hand-painted forsythia with urushi/clear lacquer; gold trim",dimensions:"retailer conflict: 149–149.9 mm closed; 132.3–133 mm open; non-postable",weight:"retailer conflict: 25.51 g vs 36.85 g",status:"24-piece historical limited edition; La-Mei field rejected"},
    variants:editionVariants("ying-chun",S.yingChun.key,"2024","NW-91100161G"),
    extraEvidence:[{key:"ying-chun-identity-la-mei-rejected",fieldKey:"series_name",sourceKey:S.yingChunConflict.key,scopeKey:"phase598:ikkaku-ying-chun:canonical",locator:"Pen Chalet title/body/images identify Ying-Chun while selector alone says La-Mei.",qualifies:false},{key:"ying-chun-weight-penchalet-rejected",fieldKey:"weight",sourceKey:S.yingChunConflict.key,scopeKey:"phase598:ikkaku-ying-chun:canonical",locator:"Pen Chalet specification lists 25.51 g, conflicting with Goldspot 36.85 g.",qualifies:false}],
    conflicts:[{key:"ying-chun-la-mei-identity",fieldKey:"identity",scopeKey:"phase598:ikkaku-ying-chun:canonical",conflictKind:"identity",status:"dismissed",resolutionNote:"La-Mei appears only in a contradictory selector; title, body, image names and independent authorized retail data support Ying-Chun, so no La-Mei entity is created.",members:[{citationKey:"yingChun-series_name-evidence",assertedValue:"Ying-Chun (Forsythia)"},{citationKey:"ying-chun-identity-la-mei-rejected",assertedValue:"La-Mei (Chinese Plum Flower)"}]},{key:"ying-chun-weight-conflict",fieldKey:"weight",scopeKey:"phase598:ikkaku-ying-chun:canonical",conflictKind:"field",status:"resolved",resolutionNote:"The conflicting retailer weights are preserved as a range/conflict; no averaged exact weight is asserted.",members:[{citationKey:"yingChun-weight-evidence",assertedValue:"36.85 g"},{citationKey:"ying-chun-weight-penchalet-rejected",assertedValue:"25.51 g"}]}],
  },
  {
    key:"lanYue",name:"IKKAKU by Nahvalur Lan-Yue Crossflex Fountain Pen",markdown:".planning/content-research/ikkaku-lan-yue-crossflex-phase598.md",primary:S.lanYue,aliases:["IKKAKU Lan-Yue","Lan-Yue (Blue Moon)","蓝月 Crossflex"],
    specs:{series_name:"IKKAKU by Nahvalur",release_year:"circa 2023",nib:"Regalia Writing Labs Crossflex by Ralph Reyes; material unresolved",fill_system:"special bespoke converter; cartridge/converter",material:"blue urushi with platinum powder; gold-plated trim",dimensions:"149.9 mm closed; 131.8 mm body; non-postable; 14.2 mm barrel; 11.7 mm grip",weight:"28.35 g",status:"historical special release; out of stock; distinct from 2025 Blue Moon"},
    variants:[{key:"lan-yue-edition",name:"Lan-Yue Crossflex",releaseYear:"2023",notes:"Historical Crossflex product parent.",sourceKey:S.lanYue.key,variantKind:"edition_group"},{key:"lan-yue-flex",name:"Crossflex",releaseYear:"2023",notes:"Regalia Crossflex option; retailer material fields conflict.",sourceKey:S.lanYue.key,variantKind:"nib",parentVariantKey:"lan-yue-edition",market:"global"}],
    extraEvidence:[{key:"lan-yue-nib-steel-rejected",fieldKey:"nib",sourceKey:S.lanYue.key,scopeKey:"phase598:ikkaku-lan-yue-crossflex:canonical",locator:"Product prose says steel flex nib.",qualifies:false},{key:"lan-yue-nib-gold-rejected",fieldKey:"nib",sourceKey:S.lanYue.key,scopeKey:"phase598:ikkaku-lan-yue-crossflex:canonical",locator:"The same page specification table and option say Gold nib.",qualifies:false}],
    conflicts:[{key:"lan-yue-nib-material",fieldKey:"nib_material",scopeKey:"phase598:ikkaku-lan-yue-crossflex:canonical",conflictKind:"field",status:"resolved",resolutionNote:"Crossflex identity and maker are retained; metal remains unresolved because the same page asserts steel and gold.",members:[{citationKey:"lan-yue-nib-steel-rejected",assertedValue:"steel flex nib"},{citationKey:"lan-yue-nib-gold-rejected",assertedValue:"gold nib"}]}],
  },
  {key:"yuTu",name:"IKKAKU by Nahvalur Yu-Tu Jade Rabbit Urushi Fountain Pen",markdown:".planning/content-research/ikkaku-yu-tu-phase598.md",primary:S.yuTu,extraSources:[S.yuTuIndex],aliases:["IKKAKU Yu-Tu","玉兔","Jade Rabbit"],specs:{series_name:"IKKAKU by Nahvalur",release_year:"circa 2023",nib:"Fine/Medium variants confirmed; material not confirmed",material:"urushi pen; base and decoration not confirmed",dimensions:"not confirmed by surviving primary product copy",weight:"not confirmed by surviving primary product copy",status:"historical/sold out; identity confirmed with bounded unknown specifications"},specSourceByField:{nib:S.yuTuIndex,release_year:S.yuTuIndex},variants:editionVariants("yu-tu",S.yuTuIndex.key,"2023")},
  {
    key:"rhinoceros",name:"IKKAKU by Nahvalur Rhinoceros Skin Lacquer Special Edition Fountain Pen",markdown:".planning/content-research/ikkaku-rhinoceros-skin-phase598.md",primary:S.rhinoceros,extraSources:[S.shenHai,S.qianTan],aliases:["IKKAKU Rhinoceros Skin Lacquer","犀皮漆特别版"],
    specs:{series_name:"IKKAKU by Nahvalur",release_year:"2023",nib:"No.6 14K gold; Fine/Medium",fill_system:"standard international cartridge/converter",material:"hand-applied layered urushi over ebonite; rhinoceros-skin lacquer effect",dimensions:"149–149.9 mm closed; 131.8–133 mm open; non-postable",weight:"27.78 g retailer specification",status:"historical; Qian-Tan 18; Shen-Hai quantity unresolved (4 vs 18)"},specSourceByField:{material:S.qianTan,release_year:S.qianTan},
    variants: ([
      ["qian", "Qian-Tan (Shoal)", S.qianTan],
      ["shen", "Shen-Hai (Deep Sea)", S.shenHai],
    ] as const).flatMap(([key, name, source]) => [
      {
        key: `rhino-${key}`,
        name,
        releaseYear: "2023",
        notes: `Rhinoceros Skin Lacquer edition; ${
          key === "qian" ? "18 pieces" : "quantity conflict retained"
        }.`,
        sourceKey: source.key,
        variantKind: "edition_group" as const,
      },
      {
        key: `rhino-${key}-f`,
        name: `${name} Fine`,
        releaseYear: "2023",
        notes: "Fine nib option.",
        sourceKey: source.key,
        variantKind: "nib" as const,
        parentVariantKey: `rhino-${key}`,
      },
      {
        key: `rhino-${key}-m`,
        name: `${name} Medium`,
        releaseYear: "2023",
        notes: "Medium nib option.",
        sourceKey: source.key,
        variantKind: "nib" as const,
        parentVariantKey: `rhino-${key}`,
      },
    ]),
    extraEvidence:[{key:"rhino-shen-four-rejected",fieldKey:"status",sourceKey:S.rhinoceros.key,scopeKey:"phase598:ikkaku-rhinoceros-skin-lacquer:canonical",locator:"Pen Chalet says Shen-Hai is limited to four pieces.",qualifies:false},{key:"rhino-shen-eighteen-rejected",fieldKey:"status",sourceKey:S.shenHai.key,scopeKey:"phase598:ikkaku-rhinoceros-skin-lacquer:canonical",locator:"Chatterley says Shen-Hai is a 2023 edition of 18 pieces.",qualifies:false}],
    conflicts:[{key:"rhino-shen-count",fieldKey:"edition_quantity",scopeKey:"phase598:ikkaku-rhinoceros-skin-lacquer:canonical",conflictKind:"field",status:"resolved",resolutionNote:"Neither retailer quantity is promoted as canonical; Shen-Hai count remains explicitly unresolved.",members:[{citationKey:"rhino-shen-four-rejected",assertedValue:"4 pieces"},{citationKey:"rhino-shen-eighteen-rejected",assertedValue:"18 pieces"}]}],
  },
  {key:"eggshell",name:"IKKAKU by Nahvalur Raden Eggshell Black Urushi Limited Edition Fountain Pen",markdown:".planning/content-research/ikkaku-raden-eggshell-phase598.md",primary:S.eggshell,aliases:["IKKAKU Raden Eggshell Black Urushi","Raden Eggshell Limited Edition"],specs:{series_name:"IKKAKU by Nahvalur",release_year:"2023",nib:"No.6 14K rose-gold; Medium or true double-slit Music",fill_system:"piston filling system",material:"ebonite; black urushi; hand-placed raden and eggshell; rose-gold trim",dimensions:"not published on the surviving exact retailer page",weight:"not published on the surviving exact retailer page",status:"Nibs.com exclusive; nine pieces; sold out"},variants:[{key:"eggshell-edition",name:"Nibs.com nine-piece edition",releaseYear:"2023",notes:"Exclusive nine-piece parent edition.",sourceKey:S.eggshell.key,variantKind:"edition_group"},{key:"eggshell-medium",name:"14K Medium",releaseYear:"2023",notes:"Original Medium nib option.",sourceKey:S.eggshell.key,variantKind:"nib",parentVariantKey:"eggshell-edition"},{key:"eggshell-music",name:"14K true double-slit Music",releaseYear:"2023",notes:"Original double-slit Music option; retailer regrinds are services, not factory variants.",sourceKey:S.eggshell.key,variantKind:"nib",parentVariantKey:"eggshell-edition"}]},
];

function pack(definition: ModelDefinition): CuratedEntityPack {
  const key = definition.key;
  const canonicalScopeKey = `phase598:${PHASE598_SLUGS[key]}:canonical`;
  const image = editorial(key);
  const sources = [
    definition.primary,
    ...(definition.primary.key === phase598IkkakuCollectionSource.key ||
    definition.extraSources?.some(
      (source) => source.key === phase598IkkakuCollectionSource.key,
    )
      ? []
      : [phase598IkkakuCollectionSource]),
    ...(definition.extraSources ?? []),
    image,
  ];
  const secondarySource = sources.find(
    (source) =>
      source.tier === "professional_secondary" &&
      source.key !== definition.primary.key,
  );
  const specEvidence: CuratedSpecEvidence[] = [
    {key:`${key}-brand_entity_id-evidence`,fieldKey:"brand_entity_id",sourceKey:phase598IkkakuCollectionSource.key,scopeKey:"canonical",locator:`${phase598IkkakuCollectionSource.summary} This establishes the IKKAKU by Nahvalur maker relationship; the exact model identity remains supported by its model source.`},
    ...Object.keys(definition.specs).map((field) => {
      const fieldKey = field as Exclude<SpecFieldKey,"brand_entity_id">;
      const src = definition.specSourceByField?.[fieldKey] ?? definition.primary;
      return {key:`${key}-${fieldKey}-evidence`,fieldKey,sourceKey:src.key,scopeKey:"canonical",locator:`${src.summary} Field: ${fieldKey}.`,qualifies:true};
    }),
    ...(definition.extraEvidence ?? []).map((evidence) => ({
      ...evidence,
      scopeKey: "canonical",
    })),
  ];
  return {
    key:`phase598-${key}-sourced-v1`,entityId:PHASE598_IDS[key],expectedType:"pen",expectedSlug:PHASE598_SLUGS[key],canonicalName:definition.name,publicationIntent:"publish",publicationBlockers:[],markdownFile:definition.markdown,storyTitle:`${definition.name}：身份、规格、版本与维护`,primarySourceKey:definition.primary.key,depthTier:"A",
    aliases:definition.aliases.map((alias)=>({alias,language:/[\u3400-\u9fff]/u.test(alias)?"zh":"en",kind:"alias" as const,sourceKey:definition.primary.key})),
    sources,scopes:[{key:"canonical",scopeKey:canonicalScopeKey,productionState:String(definition.specs.status??"").includes("current")?"current":"historical",nibScope:String(definition.specs.nib??""),materialScope:String(definition.specs.material??""),editionScope:String(definition.specs.status??"")}],
    claims:[{key:`${key}-canonical-identity`,predicate:"canonical_identity",objectText:`${definition.name} is a distinct IKKAKU by Nahvalur fountain-pen identity with model-specific material, nib, filling and edition boundaries.`,factClass:"core",confidence:0.99,sourceKey:definition.primary.key,locator:definition.primary.summary,evidence:[{key:`${key}-identity-evidence`,sourceKey:definition.primary.key,scopeKey:"canonical",locator:definition.primary.summary},...(secondarySource?[{key:`${key}-secondary-identity-evidence`,sourceKey:secondarySource.key,scopeKey:"canonical",locator:secondarySource.summary}]:[])]}],
    variants:definition.variants,
    spec:{brandEntityId:PHASE598_NAHVALUR_BRAND_ID,values:definition.specs,evidence:specEvidence},
    media:[{key:`${key}-primary`,title:`${definition.name} 事实示意图（非产品照片）`,sourceKey:image.key,localPath:image.url,author:"Fountain Pen Graph editorial",license:"site-original",attributionText:"本站原创事实示意图；非产品照片，不表示真实颜色、漆面、材料纹理、笔形、比例、商标、笔尖或内部机构。",sourceUrl:image.url,usageStatus:"primary"}],
    conflicts: definition.conflicts?.map((conflict) => ({
      ...conflict,
      scopeKey: "canonical",
    })),
  };
}

export const phase598IkkakuModelPacks = definitions.map(pack);

const brandScope = phase597NahvalurBrandPack.scopes.at(-1)?.scopeKey;
if (!brandScope) throw new Error("Phase 598 requires the inherited Nahvalur brand scope.");

export const phase598NahvalurBrandPack: CuratedEntityPack = {
  ...phase597NahvalurBrandPack,
  key:"phase598-nahvalur-brand-ikkaku-refresh-v1",
  markdownFile:".planning/content-research/nahvalur-brand-phase598.md",
  storyTitle:"Nahvalur：三十个钢笔型号与 IKKAKU 漆艺系列导航",
  sources:[...phase597NahvalurBrandPack.sources,phase598IkkakuCollectionSource,moonSource,editorial("series")],
  claims:[...phase597NahvalurBrandPack.claims,{key:"phase598-nahvalur-ikkaku-navigation",predicate:"brand_model_navigation",objectText:"Nahvalur public navigation adds sixteen sourced IKKAKU pen identities plus an IKKAKU series article while retaining Nahvalur as maker.",factClass:"core",confidence:0.99,sourceKey:phase598IkkakuCollectionSource.key,locator:phase598IkkakuCollectionSource.summary,evidence:[{key:"phase598-brand-ikkaku-evidence",sourceKey:phase598IkkakuCollectionSource.key,scopeKey:brandScope,locator:phase598IkkakuCollectionSource.summary}]}],
  timeline:[...(phase597NahvalurBrandPack.timeline??[]),{key:"phase598-nahvalur-ikkaku-history",title:"IKKAKU historical and current inventory documented",eventType:"design_milestone",startDate:RETRIEVED,circa:false,description:"Nine current products and seven historical model/family identities were sourced without creating a duplicate manufacturer brand.",sourceKey:phase598IkkakuCollectionSource.key}],
};

export const phase598IkkakuPacks: CuratedEntityPack[] = [phase598NahvalurBrandPack,...phase598IkkakuModelPacks];

if (phase598IkkakuModelPacks.length !== 16 || phase598IkkakuPacks.length !== 17 || new Set(phase598IkkakuPacks.map((item)=>item.entityId)).size !== 17) {
  throw new Error("Phase 598 requires one Nahvalur brand refresh and sixteen unique IKKAKU model packs.");
}
