import type {
  CuratedEntityPack,
  CuratedSource,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase433BrandDepthRefreshPacks } from "./phase433-brand-depth-refresh";
import { phase446SheafferSchonNahvalurBrandPacks } from "./phase446-sheaffer-schon-nahvalur-brand-depth";

const RETRIEVED = "2026-08-14";

export const PHASE612_BATCH_E_BRANDS = {
  monteverde: "2OpQMjam65SM",
  sheaffer: "tVXnzDSFCcPP",
} as const;

export const PHASE612_BATCH_E_PENS = {
  axis: "phase612-pen-monteverde-axis",
  dakota: "phase612-pen-monteverde-dakota",
  innovaFormulaM: "phase612-pen-monteverde-innova-formula-m",
  innovaOmbreFusion: "phase612-pen-monteverde-innova-ombre-fusion",
  mp1: "phase612-pen-monteverde-mp1",
  mvp: "phase612-pen-monteverde-mvp",
  sheaffer100: "phase612-pen-sheaffer-100",
  sheaffer300: "phase612-pen-sheaffer-300",
  sheafferVfm: "phase612-pen-sheaffer-vfm",
} as const;

export const PHASE612_BATCH_E_SLUGS = {
  axis: "monteverde-axis",
  dakota: "monteverde-dakota",
  innovaFormulaM: "monteverde-innova-formula-m",
  innovaOmbreFusion: "monteverde-innova-ombre-fusion",
  mp1: "monteverde-mp1",
  mvp: "monteverde-mvp",
  sheaffer100: "sheaffer-100",
  sheaffer300: "sheaffer-300",
  sheafferVfm: "sheaffer-vfm",
} as const;

type PenKey = keyof typeof PHASE612_BATCH_E_PENS;
type BrandKey = keyof typeof PHASE612_BATCH_E_BRANDS;

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

function diagram(key: PenKey): CuratedSource {
  const localPath = `/images/library/site-original/phase612/batch-e/${key}.svg`;
  return {
    key: `phase612-e-${key}-diagram`,
    registryKey: "fountain-pen-graph-editorial-phase612-e",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase612-e",
    title: `Phase 612 Batch E ${key} factual diagram`,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创中文事实／结构示意；非产品照片、Logo、颜色校样、纹理复刻或比例图。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  axisOfficial: web({
    key: "phase612-e-axis-official",
    title: "Axis Magnetic Pocket Fountain Pen Guide",
    url: "https://www.monteverdepens.com/pages/axis",
    registry: "monteverde-official-phase612-e",
    name: "Monteverde USA official",
    summary:
      "官方专页确认口袋尺寸、阳极氧化铝、磁吸合帽与后插、JoWo #5 EF/F/M/B及短墨囊/迷你转换器，并明确fountain pen only。",
  }),
  axisRetail: web({
    key: "phase612-e-axis-goldspot",
    title: "Monteverde Axis Fountain Pen in Blue",
    url: "https://goldspot.com/products/monteverde-axis-fountain-pen-in-blue",
    registry: "goldspot-pens-phase612-e",
    name: "Goldspot Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "授权零售exact页交叉确认22g、110.5/132.7mm、14.7mm、磁帽、铝身、#5 JoWo与短供墨配置。",
  }),
  dakotaOfficial: web({
    key: "phase612-e-dakota-official",
    title: "Monteverde USA Dakota Stainless Steel Fountain Pen",
    url: "https://www.monteverdepens.com/products/monteverde-usa%C2%AE-dakota-stainless-steel-fountain-pen",
    registry: "monteverde-official-phase612-e",
    name: "Monteverde USA official",
    summary:
      "官方exact页确认C-47主题、Slip-In Cap、钢制结构、JoWo #5 EF/F/M、国际墨囊/转换器和gel sibling。",
  }),
  dakotaRetail: web({
    key: "phase612-e-dakota-goldspot",
    title: "Monteverde Dakota Fountain Pen in Airforce Matte Blue",
    url: "https://goldspot.com/products/monteverde-dakota-fountain-pen-in-airforce-matte-blue",
    registry: "goldspot-pens-phase612-e",
    name: "Goldspot Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "授权零售exact页提供121/118/156mm、11.4mm、29g，并交叉确认钢身漆面、Slip-In Cap、#5尖与转换器。",
  }),
  formulaOfficial: web({
    key: "phase612-e-formula-m-official",
    title: "Innova Formula M",
    url: "https://www.monteverdepens.com/pages/innova-formula-m",
    registry: "monteverde-official-phase612-e",
    name: "Monteverde USA official",
    summary:
      "官方专页确认304钢丝编织网覆黄铜、PVD、碳纤维环、JoWo #6六尖幅、国际供墨和FP/RB/BP边界。",
  }),
  formulaRetail: web({
    key: "phase612-e-formula-m-goldspot",
    title: "Monteverde Innova Formula M Fountain Pen in Black",
    url: "https://goldspot.com/products/monteverde-innova-formula-m-fountain-pen-in-black",
    registry: "goldspot-pens-phase612-e",
    name: "Goldspot Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "授权零售exact页交叉确认34g、139/122/162.5mm、10/12mm、#6钢尖、converter及Black PVD样本。",
  }),
  ombreOfficial: web({
    key: "phase612-e-ombre-official",
    title: "Innova Ombre Fusion",
    url: "https://www.monteverdepens.com/pages/innova-ombre-fusion",
    registry: "monteverde-official-phase612-e",
    name: "Monteverde USA official",
    summary:
      "官方专页确认现代Innova致意、渐变、碳纤维中环、#6钢尖、plasma-treated feed、国际供墨和三种书写系统。",
  }),
  ombreRetail: web({
    key: "phase612-e-ombre-goldspot",
    title: "Monteverde Innova Ombre Fusion Fountain Pen in Bliss",
    url: "https://goldspot.com/products/monteverde-innova-ombre-fusion-fountain-pen-in-bliss",
    registry: "goldspot-pens-phase612-e",
    name: "Goldspot Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "授权零售exact页确认lacquer over metal、44.7g、141/124/164mm、12.5/10.4mm及Bliss钢笔配置。",
  }),
  mp1Official: web({
    key: "phase612-e-mp1-official",
    title: "Discover the Monteverde USA MP1 Fountain Pen",
    url: "https://www.monteverdepens.com/pages/mp1-collection-page",
    registry: "monteverde-official-phase612-e",
    name: "Monteverde USA official",
    summary:
      "官方指南确认品牌首支内置活塞、25周年、Lock-It、透明墨仓、#6 JoWo六尖幅、只用瓶装墨及不得旋下前段。",
  }),
  mp1Review: web({
    key: "phase612-e-mp1-penaddict",
    title: "Monteverde MP1 Mercury Orange Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2025/10/13/monteverde-mp1-mercury-orange-fountain-pen-review",
    registry: "penaddict-phase612-e",
    name: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2025-10-13",
    summary:
      "独立样本记录Lock-It两手操作、透明杆、活塞、成形近三角握位和#6笔尖/笔舌实际使用边界。",
  }),
  mp1Retail: web({
    key: "phase612-e-mp1-goldspot",
    title: "Monteverde USA MP1 Fountain Pen in Black Noir",
    url: "https://goldspot.com/products/monteverde-usa-mp1-fountain-pen-in-black-noir",
    registry: "goldspot-pens-phase612-e",
    name: "Goldspot Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "授权零售exact页记录Black Noir样本约25.45g与约2ml容量；与官方商品页重量数字不一致，因此只用于揭示版本/口径冲突。",
  }),
  mvpOfficial: web({
    key: "phase612-e-mvp-official",
    title: "Monteverde USA MVP Diamond Clear Fountain Pen",
    url: "https://www.monteverdepens.com/products/monteverde-usa%C2%AE-mvp-diamond-clear-fountain-pen-eyedropper-cartridge",
    registry: "monteverde-official-phase612-e",
    name: "Monteverde USA official",
    summary:
      "官方exact页确认Monte Verde Pocket、102/137mm、2.5ml、短国际墨囊/滴入式、钢尖选择与inkball sibling。",
  }),
  mvpRetail: web({
    key: "phase612-e-mvp-goldspot",
    title: "Monteverde USA MVP Fountain Pen in Diamond Clear",
    url: "https://goldspot.com/products/monteverde-usa-mvp-fountain-pen-in-diamond-clear",
    registry: "goldspot-pens-phase612-e",
    name: "Goldspot Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "授权零售exact页交叉确认多色树脂、102/137mm、2.5ml、短墨囊/滴入式和钢笔书写类型。",
  }),
  sheaffer100Official: web({
    key: "phase612-e-sheaffer-100-official",
    title: "Sheaffer 100 Glossy Black Lacquer Fountain Pen",
    url: "https://sheaffer.com/products/sheaffer-100-e9338-glossy-black-lacquer-with-chrome-plated-trims-fountain-pen-medium",
    registry: "sheaffer-official-phase612-e",
    name: "Sheaffer official",
    summary:
      "官方exact页确认streamlined silhouette、cut-out clip、White Dot、F/M钢尖、Classic墨囊和瓶装墨路径。",
  }),
  sheaffer100Review: web({
    key: "phase612-e-sheaffer-100-anderson",
    title: "Pen Review: The Sheaffer 100",
    url: "https://blog.andersonpens.com/pen-review-the-sheaffer-100/",
    registry: "anderson-pens-phase612-e",
    name: "Anderson Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2012-08-28",
    summary:
      "专业钢笔零售商长期样本记录100较300细、尺寸量级、converter与M尖实际书写；仅作样本边界。",
  }),
  sheaffer100Retail: web({
    key: "phase612-e-sheaffer-100-goldspot",
    title: "Sheaffer 100 Fountain Pen in PVD Gold",
    url: "https://goldspot.com/products/sheaffer-100-fountain-pen-in-pvd-gold",
    registry: "goldspot-pens-phase612-e",
    name: "Goldspot Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "授权零售exact页记录PVD Gold样本约132.6/152mm、31.2g，并列出转换器与两支Classic墨囊随附。",
  }),
  sheaffer300Official: web({
    key: "phase612-e-sheaffer-300-official",
    title: "Sheaffer 300 Glossy Black Fountain Pen",
    url: "https://sheaffer.com/products/sheaffer-300-e9312-glossy-black-with-chrome-plated-trims-fountain-pen",
    registry: "sheaffer-official-phase612-e",
    name: "Sheaffer official",
    summary:
      "官方exact页确认宽身、平顶、宽中环、slotted clip、click-off cap、F/M钢尖、converter与两支Classic墨囊。",
  }),
  sheaffer300Review: web({
    key: "phase612-e-sheaffer-300-fpquest",
    title: "Review: Sheaffer 300 Fountain Pen",
    url: "https://fpquest.wordpress.com/2014/07/16/review-sheaffer-300-fountain-pen/",
    registry: "fountain-pen-quest-phase612-e",
    name: "Fountain Pen Quest",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2014-07-16",
    summary:
      "独立样本测得141.1/120.6/154.0mm、约44g与帽重影响，并记录钢尖和墨囊/转换器使用。",
  }),
  vfmOfficial: web({
    key: "phase612-e-vfm-official",
    title: "Sheaffer VFM Polished Chrome Fountain Pen",
    url: "https://sheaffer.com/products/sheaffer-vfm-e9422-polished-chrome-with-gold-plated-trims-fountain-pen-medium",
    registry: "sheaffer-official-phase612-e",
    name: "Sheaffer official",
    summary:
      "官方exact页确认细长现代轮廓、White Dot、F/M选项，并明确VFM仅兼容universal ink cartridges。",
  }),
  vfmReview: web({
    key: "phase612-e-vfm-fpquest",
    title: "Review: Sheaffer VFM",
    url: "https://fpquest.wordpress.com/2015/04/22/review-sheaffer-vfm/",
    registry: "fountain-pen-quest-phase612-e",
    name: "Fountain Pen Quest",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2015-04-22",
    summary:
      "独立样本测量137.8/120.8/153mm、20g、细握位，并确认标准短国际墨囊、无常规转换器空间。",
  }),
};

interface Definition {
  key: PenKey;
  brand: BrandKey;
  slug: string;
  name: string;
  markdownFile: string;
  aliases: string[];
  official: CuratedSource;
  secondary: CuratedSource;
  measurementSource?: CuratedSource;
  claim: string;
  boundary: string;
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
  variants: CuratedVariant[];
}

const definitions: Definition[] = [
  {
    key: "axis",
    brand: "monteverde",
    slug: PHASE612_BATCH_E_SLUGS.axis,
    name: "Monteverde Axis",
    markdownFile: ".planning/content-research/phase612-e-monteverde-axis.md",
    aliases: ["Monteverde USA Axis", "Axis Magnetic Pocket Fountain Pen"],
    official: S.axisOfficial,
    secondary: S.axisRetail,
    claim: "Axis是阳极氧化铝、磁吸合帽与后插、仅提供钢笔系统的口袋笔。",
    boundary:
      "Axis目前fountain pen only；颜色和礼盒不拆型号，网页残留ballpoint/plastic字段不采纳。",
    values: {
      series_name: "Monteverde USA Axis",
      release_year: "当前系列页面于2026-08-14核实；官方未在当前页明确首发年份",
      origin_country: "Monteverde USA 产品；当前官方页未声明整笔制造国",
      nib: "德国制造 JoWo #5 不锈钢尖，Extra Fine、Fine、Medium、Broad",
      fill_system: "标准国际短墨囊／迷你推入式转换器",
      material: "实心阳极氧化铝笔身，齿轮状中段，磁吸笔帽",
      dimensions:
        "Goldspot 蓝色样本：合帽约110.5 mm，后插约132.7 mm，最大直径约14.7 mm",
      weight: "Goldspot 蓝色样本约22 g",
      status: "当前官方在售",
    },
    variants: [
      "Matte Purple",
      "Matte Champagne",
      "Matte Orange",
      "Matte Black",
      "Matte Blue",
      "Matte Olive",
    ].map((name, index) => ({
      key: `phase612-e-axis-color-${index + 1}`,
      name,
      notes: "Axis颜色版本。",
      sourceKey: S.axisOfficial.key,
      variantKind: "color",
    })),
  },
  {
    key: "dakota",
    brand: "monteverde",
    slug: PHASE612_BATCH_E_SLUGS.dakota,
    name: "Monteverde Dakota",
    markdownFile: ".planning/content-research/phase612-e-monteverde-dakota.md",
    aliases: ["Monteverde USA Dakota", "Dakota Fountain Pen"],
    official: S.dakotaOfficial,
    secondary: S.dakotaRetail,
    claim: "Dakota是C-47主题、Slip-In Cap、JoWo #5钢尖的金属短身钢笔。",
    boundary:
      "Fountain Pen与liquid ink gel pen分立；五种表面不互相继承漆面或尖幅。",
    values: {
      series_name: "Monteverde USA Dakota",
      release_year: "纪念二战结束80周年的当代系列；当前页面于2026-08-14核实",
      origin_country:
        "Monteverde USA 产品；不同页面对制造表述不一致，不据此写整笔制造国",
      nib: "德国 JoWo #5 不锈钢尖；官方 Stainless Steel 页列 Extra Fine、Fine、Medium，部分颜色零售页另列 Broad",
      fill_system: "标准国际墨囊／随附转换器",
      material: "钢制主体；Stainless Steel、漆面与手工火烧表面按颜色分别核对",
      dimensions:
        "Goldspot Airforce Blue 样本：合帽约121 mm，开帽约118 mm，后插约156 mm，握位直径约11.4 mm",
      weight: "Goldspot Airforce Blue 样本约29 g",
      status: "当前官方在售",
    },
    variants: [
      "Stainless Steel",
      "Military Green",
      "Black Sky",
      "Raw Flame",
      "Airforce Matte Blue",
    ].map((name, index) => ({
      key: `phase612-e-dakota-color-${index + 1}`,
      name,
      notes: "Dakota材料/表面版本，具体用料分别核对。",
      sourceKey: index === 0 ? S.dakotaOfficial.key : S.dakotaRetail.key,
      variantKind: "material",
    })),
  },
  {
    key: "innovaFormulaM",
    brand: "monteverde",
    slug: PHASE612_BATCH_E_SLUGS.innovaFormulaM,
    name: "Monteverde Innova Formula M",
    markdownFile:
      ".planning/content-research/phase612-e-monteverde-innova-formula-m.md",
    aliases: ["Monteverde Formula M", "Innova Formula M Fountain Pen"],
    official: S.formulaOfficial,
    secondary: S.formulaRetail,
    claim:
      "Formula M是钢丝编织网覆黄铜、PVD与碳纤维环构成的赛车主题Innova分支。",
    boundary:
      "Formula M不等于所有Innova；rollerball/ballpoint、Lightning等外观与当前三色分别记录。",
    values: {
      series_name: "Monteverde USA Innova Formula M",
      release_year:
        "当代 Innova 分支；当前页面于2026-08-14核实，首发年份未在当前页明确",
      origin_country: "Monteverde USA 产品；当前页面仅明确德国制造 JoWo 笔尖",
      nib: "德国 JoWo #6 不锈钢尖，Extra Fine、Fine、Medium、Broad、1.1 mm Stub、Omniflex／Flex",
      fill_system: "标准国际墨囊／随附转换器",
      material:
        "304 不锈钢丝编织网包覆黄铜笔杆，PVD 表面，黄铜帽与前段，碳纤维中环",
      dimensions:
        "官方 Black 页：合帽约141 mm，开帽约124 mm，后插约158 mm，直径约11.9 mm；零售实测存在小幅差异",
      weight: "Goldspot Black 样本约34 g",
      status: "当前官方在售",
    },
    variants: ["PVD Black", "PVD Blue", "PVD Bronze"].map((name, index) => ({
      key: `phase612-e-formula-color-${index + 1}`,
      name,
      notes: "Formula M当前颜色版本。",
      sourceKey: S.formulaOfficial.key,
      variantKind: "color",
    })),
  },
  {
    key: "innovaOmbreFusion",
    brand: "monteverde",
    slug: PHASE612_BATCH_E_SLUGS.innovaOmbreFusion,
    name: "Monteverde Innova Ombre Fusion",
    markdownFile:
      ".planning/content-research/phase612-e-monteverde-innova-ombre-fusion.md",
    aliases: ["Monteverde Ombre Fusion", "Innova Ombre Fusion Fountain Pen"],
    official: S.ombreOfficial,
    secondary: S.ombreRetail,
    claim: "Ombre Fusion是渐变金属漆面、碳纤维中环、#6钢尖的现代Innova分支。",
    boundary:
      "Bliss/Charm/Harmony为渐变色；Formula M、Titanium、rollerball与ballpoint不得并入本钢笔规格。",
    values: {
      series_name: "Monteverde USA Innova Ombre Fusion",
      release_year:
        "当代 Innova 分支；当前页面于2026-08-14核实，官方未给具体首发年份",
      origin_country:
        "Monteverde USA 产品；德国制造 JoWo 笔尖，整笔制造国未由当前页明确",
      nib: "JoWo #6 不锈钢尖，Extra Fine、Fine、Medium、Broad、1.1 mm Stub、Omniflex／Flex",
      fill_system: "标准国际墨囊／螺纹活塞转换器，官方说明两支墨囊与转换器随附",
      material:
        "漆面金属主体，真碳纤维中环；渐变与饰件按 Bliss、Charm、Harmony 核对",
      dimensions:
        "Goldspot Bliss 样本：合帽约141 mm，开帽约124 mm，后插约164 mm；杆径约12.5 mm，握位约10.4 mm",
      weight: "Goldspot Bliss 样本约44.7 g",
      status: "当前官方集合仍列商品，部分颜色尖幅可能缺货",
    },
    variants: ["Bliss", "Charm", "Harmony"].map((name, index) => ({
      key: `phase612-e-ombre-color-${index + 1}`,
      name,
      notes: "Ombre Fusion渐变版本。",
      sourceKey: S.ombreOfficial.key,
      variantKind: "color",
    })),
  },
  {
    key: "mp1",
    brand: "monteverde",
    slug: PHASE612_BATCH_E_SLUGS.mp1,
    name: "Monteverde MP1",
    markdownFile: ".planning/content-research/phase612-e-monteverde-mp1.md",
    aliases: ["Monteverde USA MP1", "MP1 Lock-It Piston Fountain Pen"],
    official: S.mp1Official,
    secondary: S.mp1Review,
    measurementSource: S.mp1Retail,
    claim: "MP1是Monteverde首支内置活塞钢笔，以透明墨仓和Lock-It尾钮为核心。",
    boundary:
      "MP1不使用墨囊/转换器，也不是口袋MVP；颜色、限量、Fine Art和礼盒仍属同一结构。",
    values: {
      series_name: "Monteverde USA MP1",
      release_year: "Monteverde 25周年时期推出；当前页面于2026-08-14核实",
      origin_country:
        "Monteverde USA 产品；德国制造 JoWo 笔尖，整笔制造国未由当前页明确",
      nib: "德国 JoWo #6 不锈钢尖，Extra Fine、Fine、Medium、Broad、Stub、Omniflex",
      fill_system: "内置 Lock-It 活塞，直接吸取瓶装墨；不使用墨囊或转换器",
      material: "透明 polycarbonate resin 笔杆与握位、阳极氧化铝帽及尾部组件",
      dimensions:
        "Black Noir 官方页：合帽约144 mm，开帽约135 mm，后插约176 mm，杆径约12.5 mm",
      weight: "官方与零售页重量数字不一致；购买时以具体版本实测为准",
      status: "当前官方在售，含常规色、限量、Fine Art 与礼盒版本",
    },
    variants: [
      {
        key: "phase612-e-mp1-limited",
        name: "Limited / Fine Art / Gift Sets",
        notes: "颜色、限量与礼盒不改变Lock-It活塞身份。",
        sourceKey: S.mp1Official.key,
        variantKind: "edition_group",
      },
    ],
  },
  {
    key: "mvp",
    brand: "monteverde",
    slug: PHASE612_BATCH_E_SLUGS.mvp,
    name: "Monteverde MVP",
    markdownFile: ".planning/content-research/phase612-e-monteverde-mvp.md",
    aliases: ["Monte Verde Pocket", "Monteverde MVP Fountain Pen"],
    official: S.mvpOfficial,
    secondary: S.mvpRetail,
    claim: "MVP是约102mm合帽的树脂口袋钢笔，可用短国际墨囊或2.5ml滴入式笔杆。",
    boundary:
      "MVP不是活塞MP1；同壳Liquid Ink Rollerball/Inkball不是钢笔，颜色纹理不拆型号。",
    values: {
      series_name: "Monteverde USA MVP / Monte Verde Pocket",
      release_year: "当前产品页面于2026-08-14核实；首发年份未在当前页明确",
      origin_country: "Monteverde USA 产品；整笔制造国未由当前页明确",
      nib: "不锈钢尖；当前 Diamond Clear 选择器列 Extra Fine、Fine、Medium、Broad、Stub、Omniflex，库存按版本",
      fill_system:
        "标准国际短墨囊／滴入式笔杆储墨（约2.5 ml），随附约5 ml pipet；不写为常规转换器系统",
      material: "透明或多色混合树脂，chrome 色夹与笔尖",
      dimensions: "官方与 Goldspot：合帽约102 mm，后插约137 mm",
      status: "当前官方在售",
    },
    variants: [
      "Blue Squares",
      "Red Puzzles",
      "Green Abstracts",
      "Diamond Clear",
    ].map((name, index) => ({
      key: `phase612-e-mvp-color-${index + 1}`,
      name,
      notes: "MVP树脂外观版本。",
      sourceKey: S.mvpOfficial.key,
      variantKind: "color",
    })),
  },
  {
    key: "sheaffer100",
    brand: "sheaffer",
    slug: PHASE612_BATCH_E_SLUGS.sheaffer100,
    name: "Sheaffer 100",
    markdownFile: ".planning/content-research/phase612-e-sheaffer-100.md",
    aliases: ["Sheaffer® 100", "Sheaffer 100 Fountain Pen"],
    official: S.sheaffer100Official,
    secondary: S.sheaffer100Review,
    measurementSource: S.sheaffer100Retail,
    claim:
      "Sheaffer 100是修长金属、click-off帽、F/M钢尖与Classic墨囊/转换器的现代日用钢笔。",
    boundary:
      "100与VFM/300分立；rollerball、ballpoint、合作款和White Dot不得改变钢笔规格。",
    values: {
      series_name: "Sheaffer 100",
      release_year: "现代系列；当前官方页面于2026-08-14核实，不虚构首发年份",
      origin_country: "Sheaffer 品牌产品；当前官方页未明确整笔制造国",
      nib: "不锈钢 Fine、Medium；表面颜色随具体 SKU",
      fill_system: "Sheaffer Classic 墨囊／活塞转换器，可使用瓶装墨",
      material: "金属主体；漆面、PVD、chrome cap 与饰件按具体版本核对",
      dimensions:
        "Goldspot PVD Gold 样本：合帽约132.6 mm，后插／打开状态标注约152 mm",
      weight: "Goldspot PVD Gold 样本约31.2 g",
      status: "当前官方在售",
    },
    variants: [
      {
        key: "phase612-e-sheaffer100-finishes",
        name: "Current finishes and collaborations",
        notes: "颜色、PVD与合作礼盒为SKU边界。",
        sourceKey: S.sheaffer100Official.key,
        variantKind: "material",
      },
    ],
  },
  {
    key: "sheaffer300",
    brand: "sheaffer",
    slug: PHASE612_BATCH_E_SLUGS.sheaffer300,
    name: "Sheaffer 300",
    markdownFile: ".planning/content-research/phase612-e-sheaffer-300.md",
    aliases: ["Sheaffer® 300", "Sheaffer 300 Fountain Pen"],
    official: S.sheaffer300Official,
    secondary: S.sheaffer300Review,
    claim: "Sheaffer 300是宽身平顶、宽中环、重金属帽、F/M钢尖的现代系列。",
    boundary:
      "300与100/VFM及历史Sheaffer分立；rollerball、ballpoint与表面SKU不继承钢笔供墨。",
    values: {
      series_name: "Sheaffer 300",
      release_year: "现代系列；当前官方页面于2026-08-14核实，不虚构首发年份",
      origin_country:
        "Sheaffer 品牌产品；制造国信息在不同零售页不一致，本页不作全系列断言",
      nib: "不锈钢 Fine、Medium；尖面镀色按具体 SKU",
      fill_system: "Sheaffer Classic 墨囊／随附活塞转换器，可用瓶装墨",
      material: "金属主体；黄铜底、漆面、chrome cap、PVD 饰件按具体版本核对",
      dimensions:
        "Fountain Pen Quest 样本：合帽约141.1 mm，开帽约120.6 mm，后插约154.0 mm，最大直径约13.1 mm",
      weight: "独立样本约42–44 g 合帽，笔身约18–22 g；表面版本会影响重量",
      status: "当前官方在售",
    },
    variants: [
      {
        key: "phase612-e-sheaffer300-finishes",
        name: "Current lacquer, chrome and PVD finishes",
        notes: "表面与帽材按SKU核对。",
        sourceKey: S.sheaffer300Official.key,
        variantKind: "material",
      },
    ],
  },
  {
    key: "sheafferVfm",
    brand: "sheaffer",
    slug: PHASE612_BATCH_E_SLUGS.sheafferVfm,
    name: "Sheaffer VFM",
    markdownFile: ".planning/content-research/phase612-e-sheaffer-vfm.md",
    aliases: ["Sheaffer® VFM", "Sheaffer VFM Fountain Pen"],
    official: S.vfmOfficial,
    secondary: S.vfmReview,
    claim:
      "Sheaffer VFM是细身click-off入门钢笔，以F/M钢尖和短国际墨囊only为核心。",
    boundary:
      "VFM不用Sheaffer Classic墨囊或常规转换器；rollerball/ballpoint和颜色包装不并入钢笔。",
    values: {
      series_name: "Sheaffer VFM",
      release_year: "现代系列；当前官方页面于2026-08-14核实，不虚构首发年份",
      origin_country: "Sheaffer 品牌产品；当前官方页未明确整笔制造国",
      nib: "不锈钢 Fine、Medium；尖面与饰件颜色按具体 SKU",
      fill_system:
        "universal／标准国际短墨囊 only；当前官方明确不支持常规转换器",
      material: "金属细身与塑料握位；漆面、chrome、PVD 饰件按版本",
      dimensions:
        "Fountain Pen Quest 样本：合帽约137.8 mm，开帽约120.8 mm，后插约153 mm，握位约7.5–9.4 mm",
      weight: "独立样本含墨囊约20 g",
      status: "当前官方在售",
    },
    variants: [
      {
        key: "phase612-e-vfm-finishes",
        name: "Current colourful and metal finishes",
        notes: "颜色、尖面与盒型是SKU边界。",
        sourceKey: S.vfmOfficial.key,
        variantKind: "material",
      },
    ],
  },
];

function requireBrand(brand: BrandKey): CuratedEntityPack {
  const packs =
    brand === "monteverde"
      ? phase433BrandDepthRefreshPacks
      : phase446SheafferSchonNahvalurBrandPacks;
  const entityId = PHASE612_BATCH_E_BRANDS[brand];
  const pack = packs.find(
    (candidate) =>
      candidate.entityId === entityId && candidate.expectedType === "brand",
  );
  if (!pack)
    throw new Error(`Phase 612 Batch E missing ${brand} canonical brand pack.`);
  return pack;
}

function brandPack(brand: BrandKey, models: Definition[]): CuratedEntityPack {
  const base = structuredClone(
    phase612BatchEBaseBrands.find(
      (pack) => pack.entityId === PHASE612_BATCH_E_BRANDS[brand],
    ) as CuratedEntityPack,
  );
  for (const source of base.sources) {
    if (source.key !== "phase62-sheaffer-brand-svg") continue;
    const priorKey = source.key;
    source.key = "phase612-e-sheaffer-phase62-brand-svg";
    source.registryKey = "phase612-e-sheaffer-editorial-registry";
    source.independenceGroup = source.registryKey;
    for (const media of base.media) {
      if (media.sourceKey === priorKey) media.sourceKey = source.key;
    }
  }
  const sources = models.map((model) => model.official);
  const sourceKeys = new Set(base.sources.map((source) => source.key));
  base.key = `phase612-e-${brand}-brand-navigation-v1`;
  if (brand === "sheaffer") {
    base.markdownFile =
      ".planning/content-research/phase612-e-sheaffer-brand-navigation.md";
  }
  base.sources.push(...sources.filter((source) => !sourceKeys.has(source.key)));
  for (const model of models) {
    const scopeKey = `phase612-e-${model.key}-brand-navigation-scope`;
    base.scopes.push({
      key: scopeKey,
      scopeKey,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: `Current verified navigation to ${model.name}; colours, sibling writing systems and package SKUs do not create new models.`,
    });
    base.claims.push({
      key: `phase612-e-${model.key}-brand-navigation`,
      predicate: "brand_model_navigation",
      objectText: `${model.name}是${brand === "monteverde" ? "Monteverde" : "Sheaffer"}当前已核对的具体钢笔系列；${model.boundary}`,
      factClass: "core",
      confidence: 0.98,
      sourceKey: model.official.key,
      locator: model.official.summary,
      evidence: [
        {
          key: `phase612-e-${model.key}-brand-navigation-evidence`,
          sourceKey: model.official.key,
          scopeKey,
          locator: model.official.summary,
        },
      ],
    });
  }
  return base;
}

export const phase612BatchEBaseBrands = (
  ["monteverde", "sheaffer"] as const
).map((brand) => structuredClone(requireBrand(brand)));

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

function penPack(def: Definition): CuratedEntityPack {
  const scopeKey = `phase612-e-${def.key}-model-scope`;
  const art = diagram(def.key);
  const fields = Object.keys(def.values) as Array<
    Exclude<SpecFieldKey, "brand_entity_id">
  >;
  const boundaryKey = `phase612-e-${def.key}-boundary-evidence`;
  return {
    key: `phase612-e-${def.key}-model-v1`,
    entityId: PHASE612_BATCH_E_PENS[def.key],
    expectedType: "pen",
    expectedSlug: def.slug,
    canonicalName: def.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: def.markdownFile,
    storyTitle: `${def.name}：规格、版本边界、维护与选购`,
    primarySourceKey: def.official.key,
    depthTier: "A",
    aliases: def.aliases.map((alias) => ({
      alias,
      language: "en",
      sourceKey: def.official.key,
    })),
    sources: [
      def.official,
      def.secondary,
      ...(def.measurementSource ? [def.measurementSource] : []),
      art,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: "Only exact reviewed fountain-pen nib options qualify.",
        materialScope:
          "Finish and material statements remain SKU-scoped where noted.",
        editionScope: def.boundary,
      },
    ],
    claims: [
      {
        key: `phase612-e-${def.key}-identity`,
        predicate: "model_identity",
        objectText: def.claim,
        factClass: "core",
        confidence: 0.99,
        sourceKey: def.official.key,
        locator: def.official.summary,
        evidence: [
          {
            key: `phase612-e-${def.key}-identity-official`,
            sourceKey: def.official.key,
            scopeKey,
            locator: def.official.summary,
          },
          {
            key: `phase612-e-${def.key}-identity-secondary`,
            sourceKey: def.secondary.key,
            scopeKey,
            locator: def.secondary.summary,
          },
        ],
      },
      {
        key: `phase612-e-${def.key}-boundary`,
        predicate: "version_boundary",
        objectText: def.boundary,
        factClass: "core",
        confidence: 0.99,
        sourceKey: def.official.key,
        locator: def.official.summary,
        evidence: [
          {
            key: boundaryKey,
            sourceKey: def.official.key,
            scopeKey,
            locator: def.boundary,
          },
        ],
      },
    ],
    variants: def.variants,
    spec: {
      brandEntityId: PHASE612_BATCH_E_BRANDS[def.brand],
      values: def.values,
      evidence: [
        cite(
          "brand_entity_id",
          `phase612-e-${def.key}-spec-brand`,
          def.official.key,
          scopeKey,
          `${def.name} official brand identity`,
        ),
        ...fields.map((field) =>
          cite(
            field,
            `phase612-e-${def.key}-spec-${field}`,
            field === "dimensions" || field === "weight"
              ? (def.measurementSource ?? def.secondary).key
              : def.official.key,
            scopeKey,
            `reviewed exact scope: ${field}`,
          ),
        ),
        cite(
          "dimensions",
          boundaryKey,
          def.official.key,
          scopeKey,
          def.boundary,
          false,
        ),
      ],
    },
    conflicts: [
      {
        key: `phase612-e-${def.key}-identity-boundary`,
        fieldKey: "identity",
        scopeKey,
        conflictKind: "identity",
        status: "resolved",
        resolutionNote: def.boundary,
        members: [
          {
            citationKey: `phase612-e-${def.key}-spec-series_name`,
            assertedValue: "exact reviewed fountain-pen scope accepted",
          },
          {
            citationKey: boundaryKey,
            assertedValue: "sibling, finish or conflicting scope rejected",
          },
        ],
      },
    ],
    timeline: [
      {
        key: `phase612-e-${def.key}-verified`,
        title: `${def.name} exact scope verified`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: "Verification date is not a launch date.",
        sourceKey: def.official.key,
      },
    ],
    media: [
      {
        key: `phase612-e-${def.key}-primary-media`,
        title: `${def.name} 中文规格事实图（非产品照片）`,
        sourceKey: art.key,
        localPath: art.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创中文事实／结构示意；非产品照片、Logo、颜色校样、纹理复刻或比例图。",
        sourceUrl: art.url,
        usageStatus: "primary",
      },
    ],
  };
}

const monteverdeModels = definitions.filter(
  (definition) => definition.brand === "monteverde",
);
const sheafferModels = definitions.filter(
  (definition) => definition.brand === "sheaffer",
);

export const phase612BatchEGroups: Array<{
  brand: CuratedEntityPack;
  pens: CuratedEntityPack[];
}> = [
  {
    brand: brandPack("monteverde", monteverdeModels),
    pens: monteverdeModels.map(penPack),
  },
  {
    brand: brandPack("sheaffer", sheafferModels),
    pens: sheafferModels.map(penPack),
  },
];

export const phase612BatchEPacks = phase612BatchEGroups.flatMap(
  ({ brand, pens }) => [brand, ...pens],
);
