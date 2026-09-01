import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase427BrandDepthRefreshPacks } from "./phase427-brand-depth-refresh";
import { phase428BrandDepthRefreshPacks } from "./phase428-brand-depth-refresh";
import { phase437BrandDepthRefreshPacks } from "./phase437-brand-depth-refresh";
import { phase441BrandDepthRefreshPacks } from "./phase441-brand-depth-refresh";
import { phase605Groups } from "./phase605-final-coverage-freeze";

const RETRIEVED = "2026-08-14";

export const PHASE612_BATCH_D_BRAND_IDS = {
  visconti: "5BZDt2fQusMf",
  waldmann: "phase145-waldmann-brand",
  stipula: "phase140-brand-stipula",
  esterbrook: "b6DYMF38zz1B",
  ferrisWheelPress: "phase605-brand-ferris-wheel-press",
} as const;

export const PHASE612_BATCH_D_IDS = {
  mirageMythos: "phase612-pen-visconti-mirage-mythos",
  tango: "phase612-pen-waldmann-tango",
  gladiator: "phase612-pen-stipula-gladiator",
  niblet: "phase612-pen-esterbrook-niblet",
  bijou: "phase612-pen-ferris-wheel-press-bijou",
  marquise: "phase612-pen-ferris-wheel-press-marquise",
} as const;

export const PHASE612_BATCH_D_SLUGS = {
  mirageMythos: "visconti-mirage-mythos",
  tango: "waldmann-tango",
  gladiator: "stipula-gladiator",
  niblet: "esterbrook-niblet",
  bijou: "ferris-wheel-press-bijou",
  marquise: "ferris-wheel-press-marquise",
} as const;

type PenKey = keyof typeof PHASE612_BATCH_D_IDS;

const EDITORIAL_REGISTRY_SUFFIXES: Partial<Record<PenKey, string>> = {
  mirageMythos: "mirage-mythos",
};

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  publishedAt?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function editorial(key: PenKey, title: string): CuratedSource {
  const localPath = `/images/library/site-original/phase612/batch-d/${PHASE612_BATCH_D_SLUGS[key]}.svg`;
  const registryKey = `fountain-pen-graph-editorial-phase612-d-${EDITORIAL_REGISTRY_SUFFIXES[key] ?? key}`;
  return {
    key: `phase612-d-${key}-editorial-diagram`,
    registryKey,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: registryKey,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创规格卡与通用钢笔轮廓示意；不是产品照片，不复刻真实商标、颜色、纹理、比例或结构细节。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  mythosOfficial: source({
    key: "phase612-d-visconti-mirage-mythos-official",
    title: "Visconti Mirage Mythos Fountain Pen",
    url: "https://www.visconti.it/en/shop/1-luxury-pens/121-mirage-mythos-fountain-pen.html?sc=191",
    summary:
      "Visconti exact 商品页把 Mirage Mythos 列为常规系列，记录 F／M／B 大号钢尖、cartridge／converter、磁吸帽、黄铜饰件以及当前颜色。",
    locator: "regular edition, nib, filling system, closure, trim and colours",
    registryKey: "visconti-official-phase612-d",
    registryName: "Visconti",
  }),
  mythosCollection: source({
    key: "phase612-d-visconti-mirage-mythos-collection",
    title: "Visconti Mirage Mythos Collection",
    url: "https://www.visconti.it/en/mirage-mythos-collection.html",
    summary:
      "Visconti 系列页说明 Mythos 源自 Mirage，但改用金粉渐变色、金属握段、大号钢尖与刻有 MYTHOS／奥林匹斯图案的中环。",
    locator: "family introduction and distinctions from the original Mirage",
    registryKey: "visconti-official-phase612-d",
    registryName: "Visconti",
  }),
  mythosReview: source({
    key: "phase612-d-visconti-mirage-mythos-pen-addict",
    title: "Visconti Mirage Mythos Athena Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2024/4/18/visconti-mirage-mythos-athena-fountain-pen-review",
    summary:
      "The Pen Addict 的 Athena 样本评测确认钢尖、金属握段与磁吸帽，并讨论凸起握段纹路和具体配色对握持、外观的影响。",
    locator: "Athena sample construction, nib, closure and grip observations",
    registryKey: "pen-addict-phase612-d-mythos",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2024-04-18",
  }),
  mythosGoulet: source({
    key: "phase612-d-visconti-mirage-mythos-goulet",
    title: "Visconti Mirage Mythos Fountain Pen - Zeus",
    url: "https://www.gouletpens.com/products/visconti-mirage-mythos-fountain-pen-zeus",
    summary:
      "Goulet 的 Zeus SKU 页给出 139.3 mm 收帽、123 mm 去帽、159 mm post、约 32 g 与 1.18 ml converter 等样本规格。",
    locator: "Zeus SKU dimensions, weight, grip and converter capacity",
    registryKey: "goulet-pens-phase612-d-mythos",
    registryName: "Goulet Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
  }),
  tangoOfficial: source({
    key: "phase612-d-waldmann-tango-official",
    title: "Waldmann Tango Fountain Pen",
    url: "https://www.waldmannpen.com/pens/tango?item=0003",
    summary:
      "Waldmann exact 页记录 Tango 的 925 银雕纹笔身、铂金镀件、螺纹帽、钢尖或 18K 双彩金尖、EF–B、converter／墨囊及尺寸重量。",
    locator:
      "fountain-pen variants, materials, nibs, filling, dimensions and warranty",
    registryKey: "waldmann-official-phase612-d",
    registryName: "Waldmann",
  }),
  tangoReview: source({
    key: "phase612-d-waldmann-tango-imagination-review",
    title: "Waldmann Tango Imagination Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2022/1/6/waldmann-tango-imagination-fountain-pen-a-stunning-writer",
    summary:
      "The Pen Addict 的 Tango Imagination 样本确认它是 Tango 的后续 PVD 漆面雕纹版本，并记录钢尖／18K 金尖、EF–B 与 #5 尖组体验。",
    locator:
      "Imagination variant identity, nib choices and sample observations",
    registryKey: "pen-addict-phase612-d-tango",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2022-01-06",
  }),
  gladiatorOfficial: source({
    key: "phase612-d-stipula-gladiator-official",
    title: "Stipula Gladiator Stilo Nera",
    url: "https://www.stipula.com/en/product-page/gladiator-stilo-nera",
    summary:
      "Stipula 当前 exact 页说明新 Gladiator 的罗马角斗士造型、意大利铸造树脂、微熔铸金属件、墨囊供墨，以及可选佛罗伦萨制 14K Stiflex。",
    locator:
      "current collection design, materials, filling and 14K Stiflex option",
    registryKey: "stipula-official-phase612-d",
    registryName: "Stipula",
  }),
  gladiatorRetail: source({
    key: "phase612-d-stipula-gladiator-pen-chalet",
    title: "Stipula Gladiator Fountain Pen",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/stipula_gladiator_fountain_pen.html",
    summary:
      "Pen Chalet 的历史库存页记录旧 Gladiator 配置的国际墨囊／converter、约 146.1 mm 收帽、19.1 mm 直径及金尖或 T-Flex 库存选项。",
    locator:
      "older inventory filling system, dimensions and nib configurations",
    registryKey: "pen-chalet-phase612-d-gladiator",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
  }),
  nibletOfficial: source({
    key: "phase612-d-esterbrook-niblet-official",
    title: "Esterbrook Niblet Collection - Tortoise",
    url: "https://www.esterbrookpens.com/products/esterbrook-niblet-collection-copy",
    summary:
      "Esterbrook exact 页把 Niblet 定义为无笔夹口袋笔，记录 4.25 英寸收帽、5 英寸展开、短国际 converter、可与 Estie 互换的 #6 JoWo 尖及六种亚克力饰面。",
    locator:
      "pocket format, dimensions, converter, #6 nib compatibility and finishes",
    registryKey: "esterbrook-official-phase612-d",
    registryName: "Esterbrook",
  }),
  nibletReview: source({
    key: "phase612-d-esterbrook-niblet-well-appointed-desk",
    title: "Fountain Pen Review: Esterbrook Niblet Sea Glass",
    url: "https://www.wellappointeddesk.com/2025/10/fountain-pen-review-esterbrook-niblet-sea-glass-m-nib/",
    summary:
      "The Well-Appointed Desk 的 Sea Glass M 样本确认其短小、无夹、可 post 的日用体验，并把它与 Estie、JR 及相似口袋笔分开比较。",
    locator: "Sea Glass sample size, posting, nib and family comparisons",
    registryKey: "well-appointed-desk-phase612-d-niblet",
    registryName: "The Well-Appointed Desk",
    sourceType: "blog",
    tier: "professional_secondary",
  }),
  nibletYoseka: source({
    key: "phase612-d-esterbrook-niblet-yoseka",
    title: "Esterbrook Niblet Fountain Pen - Tortoise",
    url: "https://yosekastationery.com/products/esterbrook-niblet-fountain-pen-tortoise",
    summary:
      "Yoseka 的 Tortoise SKU 页交叉记录 #6 JoWo 钢尖、短国际 converter 与约 14 g 的具体库存样本。",
    locator: "Tortoise SKU nib, filling system and sample weight",
    registryKey: "yoseka-phase612-d-niblet",
    registryName: "Yoseka Stationery",
    sourceType: "retailer",
    tier: "professional_secondary",
  }),
  bijouOfficial: source({
    key: "phase612-d-fwp-bijou-official",
    title: "Ferris Wheel Press The Bijou Fountain Pen - Forget Me Not",
    url: "https://ferriswheelpress.com/products/the-bijou-fountain-pen-forget-me-not",
    summary:
      "FWP exact 页记录 Forget Me Not Bijou 的黄铜漆面笔身、#5 F/M 双彩金属尖、2.6 mm／0.75 ml converter、143.7 mm 与 22.7 g，并明确禁止 post。",
    locator:
      "materials, nib, converter, dimensions, weight and care instructions",
    registryKey: "ferris-wheel-press-official-phase612-d",
    registryName: "Ferris Wheel Press",
  }),
  bijouReview: source({
    key: "phase612-d-fwp-bijou-inktipodes",
    title: "Ferris Wheel Press Bijou Pen Review",
    url: "https://www.inktipodes.com/fountain-pens/pen-reviews/ferris-wheel-press-bijou-pen-review/",
    summary:
      "Inktipodes 的 Huffin Puff Pink 样本交叉记录 #5 F/M、2.6 mm converter 与不可 post，并指出常见国际 converter 的口径未必兼容。",
    locator:
      "sample measurements, 2.6 mm converter compatibility and posting warning",
    registryKey: "inktipodes-phase612-d-bijou",
    registryName: "Inktipodes",
    sourceType: "blog",
    tier: "professional_secondary",
  }),
  marquiseOfficial: source({
    key: "phase612-d-fwp-marquise-official",
    title: "Ferris Wheel Press The Marquise Fountain Pen - After Hours",
    url: "https://ferriswheelpress.com/products/the-marquise-fountain-pen-after-hours",
    summary:
      "FWP exact 页记录 After Hours Marquise 的 CNC 切面铝杆、螺纹密封帽、标准国际 converter、31.6 g、141 mm 与可换 JoWo housing 的 0.7 F／1.0 M 钢尖。",
    locator:
      "construction, cap, filling, dimensions, weight, nib sizes and replacement",
    registryKey: "ferris-wheel-press-official-phase612-d",
    registryName: "Ferris Wheel Press",
  }),
  marquiseRetail: source({
    key: "phase612-d-fwp-marquise-goulet",
    title: "Ferris Wheel Press The Marquise Fountain Pen - After Hours",
    url: "https://www.gouletpens.com/products/ferris-wheel-press-the-marquise-fountain-pen-after-hours",
    summary:
      "Goulet 的 After Hours exact SKU 页独立交叉其铝制笔身、钢尖、converter 供墨、螺纹帽与具体在售规格。",
    locator:
      "exact After Hours SKU construction, filling and technical specifications",
    registryKey: "goulet-pens-phase612-d-marquise",
    registryName: "Goulet Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
  }),
} as const;

interface PenDefinition {
  key: PenKey;
  brandId: string;
  canonicalName: string;
  aliases: string[];
  markdownFile: string;
  storyTitle: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extraSources?: CuratedSource[];
  boundarySource?: CuratedSource;
  careSource?: CuratedSource;
  productionState: "current" | "historical" | "unknown";
  identity: string;
  boundary: string;
  care: string;
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
  fieldSources?: Partial<
    Record<Exclude<SpecFieldKey, "brand_entity_id">, CuratedSource>
  >;
  variants: CuratedVariant[];
}

const definitions: PenDefinition[] = [
  {
    key: "mirageMythos",
    brandId: PHASE612_BATCH_D_BRAND_IDS.visconti,
    canonicalName: "Visconti Mirage Mythos",
    aliases: ["Mirage Mythos", "Visconti Mythos", "维斯康蒂 Mirage Mythos"],
    markdownFile:
      ".planning/content-research/phase612-d-visconti-mirage-mythos.md",
    storyTitle:
      "Visconti Mirage Mythos：不是 Mirage 配色，而是有独立结构边界的系列",
    primary: S.mythosOfficial,
    secondary: S.mythosReview,
    extraSources: [S.mythosCollection, S.mythosGoulet],
    boundarySource: S.mythosCollection,
    productionState: "current",
    identity:
      "Mirage Mythos 是 Visconti 当前常规系列，以希腊神话命名的金粉渐变色、金属握段、大号钢尖、磁吸帽和专属 MYTHOS 中环构成独立身份。",
    boundary:
      "Mythos 虽由原 Mirage 设计发展而来，却不是 Mirage 的普通颜色；Demeter、Persephone、Aphrodite、Apollo、Athena、Poseidon、Zeus 才是 Mythos 内部颜色 variant。",
    care: "按 cartridge／converter 钢笔用室温清水冲洗墨路；金属握段和漆面用柔软布擦拭，磁吸帽避免夹入铁屑，凸纹握段不以研磨剂清洁。",
    values: {
      series_name: "Mirage Mythos",
      nib: "大号不锈钢尖；F／M／B；镀色随 SKU",
      fill_system: "墨囊／converter",
      material: "金属握段、黄铜饰件与树脂笔身；表面和镀色随颜色 SKU",
      dimensions:
        "Zeus SKU：139.3 mm 收帽、123 mm 去帽、159 mm post、约 14.9 mm 笔身直径",
      weight: "Zeus SKU 约 32 g（帽 13 g、笔身 19 g）",
      status: "2026-08-14 官方列为 regular edition；七种当前颜色",
    },
    fieldSources: {
      dimensions: S.mythosGoulet,
      weight: S.mythosGoulet,
    },
    variants: [
      {
        key: "phase612-d-mythos-colours",
        name: "Demeter／Persephone／Aphrodite／Apollo／Athena／Poseidon／Zeus",
        notes: "当前七种神话主题颜色；各自镀色和光泽以 exact SKU 为准。",
        sourceKey: S.mythosOfficial.key,
        variantKind: "edition_group",
      },
      {
        key: "phase612-d-mythos-nibs",
        name: "Fine／Medium／Broad",
        notes: "当前大号钢尖尖幅；不是金尖版本。",
        sourceKey: S.mythosOfficial.key,
        variantKind: "nib",
      },
    ],
  },
  {
    key: "tango",
    brandId: PHASE612_BATCH_D_BRAND_IDS.waldmann,
    canonicalName: "Waldmann Tango",
    aliases: [
      "Tango Fountain Pen",
      "Waldmann Tango Fountain Pen",
      "华德曼 Tango",
    ],
    markdownFile: ".planning/content-research/phase612-d-waldmann-tango.md",
    storyTitle: "Waldmann Tango：925 银雕纹、两类笔尖与 Imagination 版本边界",
    primary: S.tangoOfficial,
    secondary: S.tangoReview,
    careSource: S.tangoOfficial,
    productionState: "current",
    identity:
      "Waldmann Tango 是德国银制钢笔系列，以锥形轮廓、925 Sterling Silver 雕纹笔身、铂金镀件和螺纹帽为基础，可选钢尖或 18K 双彩金尖。",
    boundary:
      "普通银制 Tango 与 2021 年起的 Tango Imagination PVD 漆面雕纹版本属于同系列不同版本；钢尖与 18K 金尖是订单配置，不拆成两个基础型号。",
    care: "925 银和镀件只用柔软布轻拭，避免香水、乳霜、洗发水、清洁剂、汗液久留及磨料；墨路用室温清水冲洗，螺纹帽顺牙旋合。",
    values: {
      series_name: "Tango",
      origin_country: "德国制造；Waldmann 位于 Pforzheim",
      nib: "不锈钢或 18K／750 双彩金尖；EF／F／M／B",
      fill_system: "converter／国际墨囊；官方包装列 converter 与六支墨囊",
      material: "925 Sterling Silver 雕纹笔身、钢夹与铂金镀件",
      dimensions: "137 mm 收帽、104 mm 去帽、最大直径约 11.60 mm",
      weight: "钢尖版约 39 g；18K 金尖版约 38 g",
      status: "2026-08-14 官方产品页可核实；官方列 10 年保修条件",
    },
    variants: [
      {
        key: "phase612-d-tango-steel-nib",
        name: "Steel nib",
        notes: "EF／F／M／B；约 39 g 的官方配置。",
        sourceKey: S.tangoOfficial.key,
        variantKind: "nib",
      },
      {
        key: "phase612-d-tango-gold-nib",
        name: "18K／750 bicolor gold nib",
        notes: "EF／F／M／B；约 38 g 的官方配置。",
        sourceKey: S.tangoOfficial.key,
        variantKind: "nib",
      },
      {
        key: "phase612-d-tango-imagination",
        name: "Tango Imagination",
        notes: "后续 PVD 漆面、多层雕纹版本；不向普通银制 Tango 继承表面。",
        sourceKey: S.tangoReview.key,
        variantKind: "edition_group",
      },
    ],
  },
  {
    key: "gladiator",
    brandId: PHASE612_BATCH_D_BRAND_IDS.stipula,
    canonicalName: "Stipula Gladiator",
    aliases: [
      "Gladiator Fountain Pen",
      "Stipula Gladiator Fountain Pen",
      "斯蒂普拉 Gladiator",
    ],
    markdownFile: ".planning/content-research/phase612-d-stipula-gladiator.md",
    storyTitle: "Stipula Gladiator：当前角斗士造型与旧库存规格必须分开",
    primary: S.gladiatorOfficial,
    secondary: S.gladiatorRetail,
    productionState: "current",
    identity:
      "Stipula 当前 Gladiator 是以罗马角斗士为主题的雕塑式系列，以意大利铸造树脂、手工车制部件、微熔铸并喷砂的金属件构成。",
    boundary:
      "当前红、Cuma 蓝、Paestum 棕和黑色属于同一新系列；零售页中的旧 T-Flex、旧尺寸与历史三用上墨库存不得覆盖当前 exact page。",
    care: "树脂与喷砂金属件用柔软干布清洁，墨路以室温清水冲洗；14K Stiflex 有弹性设计但不是无限弯曲尖，避免重压、侧压和自行掰尖。",
    values: {
      series_name: "Gladiator",
      origin_country: "意大利；官方写明在 Florence 制作与调校",
      nib: "当前下单配置按 exact SKU；官方明确描述可选 14K Stiflex 弹性尖",
      fill_system: "当前官网明确写墨囊；旧库存页另列国际墨囊／converter",
      material: "意大利铸造树脂；手工车制细节；微熔铸并手工喷砂金属件",
      dimensions:
        "旧库存样本约 146.1 mm 收帽、168.3 mm post、19.1 mm 笔身直径；不冒充当前公差",
      status: "2026-08-14 官方列为 new collection；四种当前颜色",
    },
    fieldSources: { dimensions: S.gladiatorRetail },
    variants: [
      {
        key: "phase612-d-gladiator-current-colours",
        name: "Red／Cuma Blue／Paestum Brown／Black",
        notes: "当前系列颜色；饰件为哑光金色或银色，按 exact SKU 组合。",
        sourceKey: S.gladiatorOfficial.key,
        variantKind: "edition_group",
      },
      {
        key: "phase612-d-gladiator-stiflex",
        name: "14K Stiflex",
        notes: "佛罗伦萨制作、镀钯的弹性金尖订单配置。",
        sourceKey: S.gladiatorOfficial.key,
        variantKind: "nib",
      },
      {
        key: "phase612-d-gladiator-older-inventory",
        name: "Older Gladiator inventory",
        notes:
          "Pen Chalet 页中的金尖／T-Flex 与尺寸属于较早库存，只作历史边界。",
        sourceKey: S.gladiatorRetail.key,
        variantKind: "edition_group",
      },
    ],
  },
  {
    key: "niblet",
    brandId: PHASE612_BATCH_D_BRAND_IDS.esterbrook,
    canonicalName: "Esterbrook Niblet",
    aliases: [
      "Niblet Collection",
      "Esterbrook Niblet Collection",
      "Esterbrook 小口袋笔 Niblet",
    ],
    markdownFile: ".planning/content-research/phase612-d-esterbrook-niblet.md",
    storyTitle: "Esterbrook Niblet：无夹口袋尺寸、Estie #6 兼容与 JR 边界",
    primary: S.nibletOfficial,
    secondary: S.nibletReview,
    extraSources: [S.nibletYoseka],
    productionState: "current",
    identity:
      "Esterbrook Niblet 是借用 Estie 轮廓语言的无笔夹口袋钢笔，以短国际 converter 和可与 Estie 互换的 #6 JoWo 钢尖为核心。",
    boundary:
      "Niblet 不是缩短版 Estie，也不是 JR；它虽与 Estie 共用 #6 尖组，却不兼容 JR 的 #5 尖，六种亚克力与特殊尖只作颜色／订单 variant。",
    care: "使用短国际 converter 或相应墨囊，换墨时以室温清水冲洗；post 时直向套合且不强压，夹带时因无笔夹应放入笔套，避免口袋内滚落。",
    values: {
      series_name: "Niblet",
      nib: "#6 JoWo 不锈钢尖；可与 Estie 互换，不兼容 JR #5",
      fill_system: "短国际 converter；具体墨囊适配按卖家清单",
      material: "亚克力笔身；无笔夹",
      dimensions:
        "约 4.25 in（108 mm）收帽、5 in（127 mm）展开、约 0.5 in（12.7 mm）直径",
      weight: "Yoseka Tortoise SKU 样本约 14 g",
      status: "2026-08-14 官方 exact 页可核实；六种 signature acrylic finish",
    },
    fieldSources: { weight: S.nibletYoseka },
    variants: [
      {
        key: "phase612-d-niblet-finishes",
        name: "Six signature acrylic finishes",
        notes:
          "Sea Glass、Tortoise 等饰面属于同一 Niblet 颜色组，不拆基础型号。",
        sourceKey: S.nibletOfficial.key,
        variantKind: "edition_group",
      },
      {
        key: "phase612-d-niblet-standard-and-specialty-nibs",
        name: "Standard／specialty #6 nib options",
        notes:
          "EF、F、M、B、1.1 Stub 与页面所列 specialty grind 是下单选项，供应以 exact SKU 为准。",
        sourceKey: S.nibletOfficial.key,
        variantKind: "nib",
      },
    ],
  },
  {
    key: "bijou",
    brandId: PHASE612_BATCH_D_BRAND_IDS.ferrisWheelPress,
    canonicalName: "Ferris Wheel Press The Bijou",
    aliases: [
      "The Bijou Fountain Pen",
      "Ferris Wheel Press Bijou",
      "FWP Bijou",
    ],
    markdownFile:
      ".planning/content-research/phase612-d-ferris-wheel-press-bijou.md",
    storyTitle:
      "Ferris Wheel Press The Bijou：黄铜细杆、2.6 mm converter 与不可 post",
    primary: S.bijouOfficial,
    secondary: S.bijouReview,
    careSource: S.bijouOfficial,
    productionState: "current",
    identity:
      "The Bijou 是 Ferris Wheel Press 的全黄铜细杆钢笔家族；Forget Me Not exact SKU 以漆面黄铜、#5 F/M 双彩钢尖与 2.6 mm converter 为锚点。",
    boundary:
      "Forget Me Not、Huffin Puff Pink 与其他文学主题配色是 Bijou 内部 variant；Bijou 不与 Joule、Marquise 或 Carousel 合并，样本重量也不能跨饰面覆盖。",
    care: "官方明确禁止把笔帽 post 在杆尾，以免黄铜螺纹刮伤漆面；存放时笔尖朝上，冷水冲洗墨路，使用闪粉墨后及时清洗并自然阴干。",
    values: {
      series_name: "The Bijou",
      nib: "双彩 #5 不锈钢尖；Fine／Medium；可拆 feeder",
      fill_system:
        "2.6 mm 开口、0.75 ml converter；不可假定任一所谓国际 converter 都兼容",
      material:
        "Forget Me Not：全黄铜笔身、Snowfall lacquer、双重镀金黄铜握段与饰件",
      dimensions:
        "143.7 mm 总长、12 mm 宽；帽 56.3 mm、笔身 91.3 mm、握段 21 mm",
      weight: "Forget Me Not 官方值 22.7 g；其他饰面评测样本可能不同",
      status: "Forget Me Not exact 页在检索日显示 sold out；系列颜色按库存变化",
    },
    variants: [
      {
        key: "phase612-d-bijou-forget-me-not",
        name: "Forget Me Not",
        notes: "本包当前 exact anchor；Snowfall lacquer 黄铜版本。",
        sourceKey: S.bijouOfficial.key,
        variantKind: "market_sku",
      },
      {
        key: "phase612-d-bijou-literary-colourways",
        name: "Literary and colour editions",
        notes:
          "Huffin Puff Pink 等主题色是 Bijou variant；材料、重量与包装按 exact 页。",
        sourceKey: S.bijouReview.key,
        variantKind: "edition_group",
      },
    ],
  },
  {
    key: "marquise",
    brandId: PHASE612_BATCH_D_BRAND_IDS.ferrisWheelPress,
    canonicalName: "Ferris Wheel Press The Marquise",
    aliases: [
      "The Marquise Fountain Pen",
      "Ferris Wheel Press Marquise",
      "FWP Marquise",
    ],
    markdownFile:
      ".planning/content-research/phase612-d-ferris-wheel-press-marquise.md",
    storyTitle:
      "Ferris Wheel Press The Marquise：切面铝杆、JoWo housing 与主题版本",
    primary: S.marquiseOfficial,
    secondary: S.marquiseRetail,
    careSource: S.marquiseOfficial,
    productionState: "current",
    identity:
      "The Marquise 是 Ferris Wheel Press 的 CNC 切面铝制钢笔家族；After Hours exact SKU 以螺纹密封帽、标准国际 converter 与可换 JoWo housing 钢尖为锚点。",
    boundary:
      "After Hours 与其他授权、文学或颜色主题只是 Marquise 内部版本；Marquise 不与黄铜 Bijou、Joule 或 Carousel 合并，也不从它们继承 converter 口径与重量。",
    care: "换尖前先卸下 converter，再旋出完整 nib housing；换墨使用室温清水，螺纹帽和切面漆面保持无砂粒，金属外表只用柔软布轻拭。",
    values: {
      series_name: "The Marquise",
      nib: "custom-ground 双彩钢尖；0.7 Fine／1.0 Medium；JoWo housing 可换",
      fill_system: "标准国际 converter 随附",
      material: "CNC aircraft-grade aluminum 笔身、镀金黄铜细节",
      dimensions:
        "141 mm 收帽；最大宽 13.8 mm；握段长 24.5 mm、直径 10.5／9.75 mm",
      weight: "装 converter 约 31.6 g；不装约 29 g",
      status: "2026-08-14 After Hours exact 官方页可核实",
    },
    variants: [
      {
        key: "phase612-d-marquise-after-hours",
        name: "After Hours",
        notes: "本包 exact anchor；主题外观不改变 Marquise 基础身份。",
        sourceKey: S.marquiseOfficial.key,
        variantKind: "market_sku",
      },
      {
        key: "phase612-d-marquise-nibs",
        name: "0.7 Fine／1.0 Medium",
        notes: "官方当前尖幅；可使用兼容的 Adventurers Nib Collection 尖组。",
        sourceKey: S.marquiseOfficial.key,
        variantKind: "nib",
      },
      {
        key: "phase612-d-marquise-themed-editions",
        name: "Licensed／literary／colour editions",
        notes: "主题与包装属于 version variant，不建立新的基础型号。",
        sourceKey: S.marquiseRetail.key,
        variantKind: "edition_group",
      },
    ],
  },
];

function claim(
  definition: PenDefinition,
  scopeKey: string,
  kind: "identity" | "boundary" | "care",
): CuratedClaim {
  const sourceItem =
    kind === "identity"
      ? definition.primary
      : kind === "boundary"
        ? (definition.boundarySource ?? definition.secondary)
        : (definition.careSource ?? definition.secondary);
  const text =
    kind === "identity"
      ? definition.identity
      : kind === "boundary"
        ? definition.boundary
        : definition.care;
  return {
    key: `phase612-d-${definition.key}-${kind}`,
    predicate:
      kind === "identity"
        ? "model_identity"
        : kind === "boundary"
          ? "version_boundary"
          : "maintenance_boundary",
    objectText: text,
    factClass: "core",
    confidence: kind === "identity" ? 0.99 : 0.96,
    sourceKey: sourceItem.key,
    locator: sourceItem.summary,
    evidence: [
      {
        key: `phase612-d-${definition.key}-${kind}-evidence`,
        sourceKey: sourceItem.key,
        scopeKey,
        locator: sourceItem.summary,
      },
      ...(kind === "identity"
        ? [
            {
              key: `phase612-d-${definition.key}-${kind}-secondary-evidence`,
              sourceKey: definition.secondary.key,
              scopeKey,
              locator: definition.secondary.summary,
            },
          ]
        : []),
    ],
  };
}

function specEvidence(
  definition: PenDefinition,
  scopeKey: string,
  fieldKey: SpecFieldKey,
  sourceItem: CuratedSource,
) {
  return {
    key: `phase612-d-${definition.key}-spec-${fieldKey}`,
    fieldKey,
    sourceKey: sourceItem.key,
    scopeKey,
    locator: sourceItem.summary,
  };
}

function penPack(definition: PenDefinition): CuratedEntityPack {
  const scopeKey = `phase612-d:${PHASE612_BATCH_D_SLUGS[definition.key]}:canonical`;
  const diagram = editorial(
    definition.key,
    `${definition.canonicalName} 身份与规格事实图`,
  );
  const valueFields = Object.keys(definition.values) as Array<
    Exclude<SpecFieldKey, "brand_entity_id">
  >;
  return {
    key: `phase612-d-${definition.key}-sourced-v1`,
    entityId: PHASE612_BATCH_D_IDS[definition.key],
    expectedType: "pen",
    expectedSlug: PHASE612_BATCH_D_SLUGS[definition.key],
    canonicalName: definition.canonicalName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: definition.markdownFile,
    storyTitle: definition.storyTitle,
    primarySourceKey: definition.primary.key,
    depthTier: "A",
    aliases: definition.aliases.map((alias) => ({
      alias,
      language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en",
      sourceKey: definition.primary.key,
    })),
    sources: [
      definition.primary,
      definition.secondary,
      ...(definition.extraSources ?? []),
      diagram,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState: definition.productionState,
        nibScope: "Only explicitly sourced nib options apply.",
        materialScope:
          "Materials belong to the cited family or exact SKU; siblings do not inherit.",
        editionScope: definition.boundary,
      },
    ],
    claims: [
      claim(definition, scopeKey, "identity"),
      claim(definition, scopeKey, "boundary"),
      claim(definition, scopeKey, "care"),
    ],
    variants: definition.variants,
    spec: {
      brandEntityId: definition.brandId,
      values: definition.values,
      evidence: [
        specEvidence(
          definition,
          scopeKey,
          "brand_entity_id",
          definition.primary,
        ),
        ...valueFields.map((fieldKey) =>
          specEvidence(
            definition,
            scopeKey,
            fieldKey,
            definition.fieldSources?.[fieldKey] ?? definition.primary,
          ),
        ),
      ],
    },
    media: [
      {
        key: `phase612-d-${definition.key}-primary-media`,
        title: `${definition.canonicalName} 事实图（非产品照片）`,
        sourceKey: diagram.key,
        localPath: diagram.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创事实 SVG；不是产品照片，不表示真实颜色、外形、纹理、比例、商标或机构。",
        sourceUrl: diagram.url,
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: `phase612-d-${definition.key}-scope-verified`,
        title: `${definition.canonicalName} 当前身份与版本边界复核`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: "这是资料复核日期，不是型号首发日期。",
        sourceKey: definition.primary.key,
      },
    ],
  };
}

const pensByKey = Object.fromEntries(
  definitions.map((definition) => [definition.key, penPack(definition)]),
) as Record<PenKey, CuratedEntityPack>;

function requireBrand(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) =>
      candidate.expectedType === "brand" && candidate.entityId === entityId,
  );
  if (!pack)
    throw new Error(`Phase 612 Batch D requires current ${label} brand pack.`);
  return pack;
}

function refreshBrand(
  base: CuratedEntityPack,
  key: string,
  brandLabel: string,
  pens: CuratedEntityPack[],
): CuratedEntityPack {
  const clone = structuredClone(base);
  for (const source of clone.sources) {
    if (source.key !== "phase49-visconti-brand-svg") continue;
    const priorKey = source.key;
    source.key = "phase612-d-visconti-phase49-brand-svg";
    source.registryKey = "phase612-d-visconti-editorial-registry";
    source.independenceGroup = source.registryKey;
    for (const media of clone.media) {
      if (media.sourceKey === priorKey) media.sourceKey = source.key;
    }
  }
  const modelSources = pens.flatMap((pen) =>
    pen.sources.filter((item) => item.sourceType !== "user_submission"),
  );
  const knownSources = new Set(clone.sources.map((item) => item.key));
  const appendedSources = modelSources.filter((item) => {
    if (knownSources.has(item.key)) return false;
    knownSources.add(item.key);
    return true;
  });
  const scopeKey = `phase612-d:${brandLabel.toLowerCase().replaceAll(" ", "-")}:navigation`;
  const modelNames = pens.map((pen) => pen.canonicalName).join("、");
  return {
    ...clone,
    key,
    publicationIntent: "publish",
    publicationBlockers: [],
    sources: [...clone.sources, ...appendedSources],
    scopes: [
      ...clone.scopes,
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope:
          "Phase 612 Batch D model navigation only; exact specifications remain on model pages.",
      },
    ],
    claims: [
      ...clone.claims,
      {
        key: `${key}-model-navigation`,
        predicate: "series_navigation",
        objectText: `${brandLabel} 品牌页新增 ${modelNames} 的独立型号入口；颜色、尖幅、材料兄弟款与相邻系列仍按各型号页边界处理。`,
        factClass: "core",
        confidence: 0.99,
        sourceKey: pens[0].primarySourceKey,
        locator:
          "Phase 612 Batch D exact model pages and official product navigation",
        evidence: pens.map((pen, index) => ({
          key: `${key}-model-navigation-evidence-${index + 1}`,
          sourceKey: pen.primarySourceKey,
          scopeKey,
          locator:
            pen.sources.find((item) => item.key === pen.primarySourceKey)
              ?.summary ?? pen.canonicalName,
        })),
      },
    ],
  };
}

const viscontiPens = [pensByKey.mirageMythos];
const waldmannPens = [pensByKey.tango];
const stipulaPens = [pensByKey.gladiator];
const esterbrookPens = [pensByKey.niblet];
const ferrisWheelPressPens = [pensByKey.bijou, pensByKey.marquise];

export const phase612BatchDBaseBrands = [
  requireBrand(
    phase427BrandDepthRefreshPacks,
    PHASE612_BATCH_D_BRAND_IDS.visconti,
    "Visconti",
  ),
  requireBrand(
    phase437BrandDepthRefreshPacks,
    PHASE612_BATCH_D_BRAND_IDS.waldmann,
    "Waldmann",
  ),
  requireBrand(
    phase428BrandDepthRefreshPacks,
    PHASE612_BATCH_D_BRAND_IDS.stipula,
    "Stipula",
  ),
  requireBrand(
    phase441BrandDepthRefreshPacks,
    PHASE612_BATCH_D_BRAND_IDS.esterbrook,
    "Esterbrook",
  ),
  requireBrand(
    phase605Groups.map((group) => group.brand),
    PHASE612_BATCH_D_BRAND_IDS.ferrisWheelPress,
    "Ferris Wheel Press",
  ),
].map((pack) => structuredClone(pack));

const viscontiBrand = refreshBrand(
  phase612BatchDBaseBrands[0] as CuratedEntityPack,
  "phase612-d-visconti-brand-model-navigation-v1",
  "Visconti",
  viscontiPens,
);
const waldmannBrand = refreshBrand(
  phase612BatchDBaseBrands[1] as CuratedEntityPack,
  "phase612-d-waldmann-brand-model-navigation-v1",
  "Waldmann",
  waldmannPens,
);
const stipulaBrand = refreshBrand(
  phase612BatchDBaseBrands[2] as CuratedEntityPack,
  "phase612-d-stipula-brand-model-navigation-v1",
  "Stipula",
  stipulaPens,
);
const esterbrookBrand = refreshBrand(
  phase612BatchDBaseBrands[3] as CuratedEntityPack,
  "phase612-d-esterbrook-brand-model-navigation-v1",
  "Esterbrook",
  esterbrookPens,
);
const ferrisWheelPressBrand = refreshBrand(
  phase612BatchDBaseBrands[4] as CuratedEntityPack,
  "phase612-d-ferris-wheel-press-brand-model-navigation-v1",
  "Ferris Wheel Press",
  ferrisWheelPressPens,
);

export const phase612BatchDGroups: Array<{
  brand: CuratedEntityPack;
  pens: CuratedEntityPack[];
}> = [
  { brand: viscontiBrand, pens: viscontiPens },
  { brand: waldmannBrand, pens: waldmannPens },
  { brand: stipulaBrand, pens: stipulaPens },
  { brand: esterbrookBrand, pens: esterbrookPens },
  { brand: ferrisWheelPressBrand, pens: ferrisWheelPressPens },
];

export const phase612BatchDPacks = phase612BatchDGroups.flatMap(
  ({ brand, pens }) => [brand, ...pens],
);

if (
  phase612BatchDPacks.length !== 11 ||
  new Set(phase612BatchDPacks.map((pack) => pack.entityId)).size !== 11
) {
  throw new Error(
    "Phase 612 Batch D must contain five brand refreshes and six unique pens.",
  );
}
