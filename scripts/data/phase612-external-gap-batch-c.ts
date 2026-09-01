import type {
  CuratedClaim,
  CuratedConflict,
  CuratedEntityPack,
  CuratedSource,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase139Groups } from "./phase139-german-swiss-current-batch";
import { phase425BrandDepthRefreshPacks } from "./phase425-brand-depth-refresh";
import { phase430BrandDepthRefreshPacks } from "./phase430-brand-depth-refresh";
import { phase439BrandDepthRefreshPacks } from "./phase439-brand-depth-refresh";

const RETRIEVED = "2026-08-14";

export const PHASE612_BATCH_C_BRAND_IDS = {
  pilot: "Zt-PbXkE7UHM",
  namiki: "lMGfoMjegnv8",
  sailor: "ce2dcqixqSCx",
  grafVonFaberCastell: "phase307-brand-graf-von-faber-castell",
  kaweco: "mRz7MvzUYwVF",
} as const;

export const PHASE612_BATCH_C_IDS = {
  preciseVarsity: "phase612-pilot-precise-varsity",
  explorer: "phase612-pilot-explorer",
  aya: "phase612-namiki-aya",
  fudeDeMannen120150: "phase612-sailor-fude-de-mannen-12-0150",
  guilloche: "phase612-gvfc-guilloche",
  tamitio: "phase612-gvfc-tamitio",
  titanSport: "phase612-kaweco-titan-sport",
} as const;

export const PHASE612_BATCH_C_SLUGS = {
  preciseVarsity: "pilot-precise-varsity",
  explorer: "pilot-explorer",
  aya: "namiki-aya",
  fudeDeMannen120150: "sailor-fude-de-mannen-12-0150",
  guilloche: "graf-von-faber-castell-guilloche",
  tamitio: "graf-von-faber-castell-tamitio",
  titanSport: "kaweco-titan-sport",
} as const;

type PenKey = keyof typeof PHASE612_BATCH_C_IDS;

const EDITORIAL_REGISTRY_SUFFIXES: Partial<Record<PenKey, string>> = {
  preciseVarsity: "precise-varsity",
  fudeDeMannen120150: "fude-de-mannen-12-0150",
  titanSport: "titan-sport",
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
  const localPath = `/images/library/site-original/phase612/batch-c/${PHASE612_BATCH_C_SLUGS[key]}.svg`;
  const registryKey = `fountain-pen-graph-editorial-phase612-c-${EDITORIAL_REGISTRY_SUFFIXES[key] ?? key}`;
  return {
    key: `phase612-c-${key}-editorial-diagram`,
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
  varsityOfficial: source({
    key: "phase612-c-pilot-precise-varsity-official",
    title: "Pilot Precise Varsity",
    url: "https://powertothepen.com/pens/precise-varsity/",
    summary:
      "Pilot 美国官网以 Precise Varsity 为当前名称，列出预灌墨、可视墨量、Advanced Liquid Ink Feed、Medium 不锈钢尖及七种墨色。",
    locator: "product title, features, point size, ink colors and pack sizes",
    registryKey: "pilot-usa-official-phase612-c",
    registryName: "Pilot Corporation of America",
  }),
  varsityGoulet: source({
    key: "phase612-c-pilot-varsity-goulet",
    title: "Pilot Varsity Fountain Pen - Black",
    url: "https://www.gouletpens.com/products/pilot-varsity-fountain-pen-black",
    summary:
      "Goulet 的现售页把 Precise Varsity 与常用简称 Varsity 对应，记录 PN90010、树脂笔身、Medium 钢尖、snap cap、10 g 与样本尺寸。",
    locator: "product naming, product code and technical specifications",
    registryKey: "goulet-pens-phase612-c-varsity",
    registryName: "Goulet Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
  }),
  explorerOfficial: source({
    key: "phase612-c-pilot-explorer-official",
    title: "Pilot Explorer",
    url: "https://powertothepen.com/pens/explorer/",
    summary:
      "Pilot 美国官网列出 Explorer 的轻量流线笔身、F/M 不锈钢尖、六种金属感配色，以及墨囊或瓶装墨配随附 converter 的供墨方式。",
    locator: "features, point sizes, colors and ink-refill paragraph",
    registryKey: "pilot-usa-official-phase612-c",
    registryName: "Pilot Corporation of America",
  }),
  explorerPenAddict: source({
    key: "phase612-c-pilot-explorer-pen-addict",
    title: "Pilot Explorer Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2023/3/31/pilot-explorer-fountain-pen-review",
    summary:
      "The Pen Addict 的 2023 实测记录约 11.9 g，并说明样本盒内 converter 与包装批次可能不同，同时确认 CON-40／CON-70 等兼容边界。",
    locator: "weight, filling compatibility, packaging and eyedropper caveat",
    registryKey: "pen-addict-phase612-c-explorer",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2023-03-31",
  }),
  ayaCollection: source({
    key: "phase612-c-namiki-aya-collection",
    title: "Namiki Aya Collection",
    url: "https://www.pilot-namiki.com/en/collection/aya/",
    summary:
      "Namiki 官网把 Aya 定义为彩漆与 Togidashi Maki-e 图案系列，解释 Aya 的色、光、纹样含义，并列出 No.30 笔尖与四个当前图案。",
    locator:
      "collection introduction, technique, No.30 nib and four model links",
    registryKey: "namiki-official-phase612-c",
    registryName: "Namiki",
  }),
  ayaDaybreak: source({
    key: "phase612-c-namiki-aya-daybreak",
    title: "Namiki Aya Daybreak",
    url: "https://www.pilot-namiki.com/en/collection/aya/daybreak/",
    summary:
      "Daybreak exact page 列出 FNA-30M-AKA、Kokkokai、Togidashi Maki-e、18K No.30 笔尖与 FM/M/B 尖幅。",
    locator: "technique, artist group, item number and nib specification",
    registryKey: "namiki-official-phase612-c",
    registryName: "Namiki",
  }),
  ayaRetail: source({
    key: "phase612-c-namiki-aya-stiloestile",
    title: "Namiki Aya Tokiwa Evergreen Fountain Pen",
    url: "https://www.stiloestile.com/en/fountain-pens/namiki-aya-fountain-pen-tokiwa-evergreen",
    summary:
      "Stilo e Stile 的 Evergreen SKU 页记录硬橡胶胎、18K No.30、CON-70N、螺纹帽、44 g 与该 SKU 的 164 mm 收帽尺寸。",
    locator: "technical specifications for the Tokiwa Evergreen SKU",
    registryKey: "stiloestile-phase612-c-aya",
    registryName: "Stilo e Stile",
    sourceType: "retailer",
    tier: "professional_secondary",
  }),
  sailorFudeOfficial: source({
    key: "phase612-c-sailor-fude-12-0150-official",
    title: "Sailor Fude de Mannen 12-0150",
    url: "https://sailor.co.jp/product/12-0150/",
    summary:
      "写乐官网 exact page 列出 40° 与 55° 弯尖用途、五个 12-0150 SKU、镀金不锈钢特殊尖、墨囊／converter、169 mm、12 g 与材料差异。",
    locator:
      "description, product codes, nib angle, filling, size, weight and materials",
    registryKey: "sailor-official-phase612-c",
    registryName: "Sailor Pen",
  }),
  sailorFudeReview: source({
    key: "phase612-c-sailor-fude-review",
    title: "Sailor Fude de Mannen Fountain Pen Review",
    url: "https://penpaperpencil.net/sailor-fude-de-mannen-fountain-pen-review/",
    summary:
      "独立评测以 40° 蓝杆样本说明书写角度改变线宽的实际用法，并提示这支笔需要通过握角而不是重压取得粗细变化。",
    locator: "40-degree sample identity and writing-angle observations",
    registryKey: "pen-paper-pencil-phase612-c-fude",
    registryName: "Pen Paper Pencil",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2014-10-24",
  }),
  guillocheOfficial: source({
    key: "phase612-c-gvfc-guilloche-official",
    title: "Graf von Faber-Castell Fountain pen Guilloche Black F",
    url: "https://www.graf-von-faber-castell.com/products/FountainpenGuillocheBlackF/146541",
    summary:
      "GvFC exact page #146541 记录黑色 Guilloche 的珍贵树脂雕纹笔杆、镀铑金属件、18K 金尖、EF/F/M/B、墨囊／converter、131×12 mm 与 29 g。",
    locator: "article 146541 description, nib widths, filling and dimensions",
    registryKey: "graf-von-faber-castell-official-phase612-c",
    registryName: "Graf von Faber-Castell",
  }),
  guillocheReview: source({
    key: "phase612-c-gvfc-guilloche-review",
    title: "Graf von Faber-Castell Guilloche Fountain Pen Review",
    url: "https://www.pencilcaseblog.com/2016/02/graf-von-faber-castell-guilloche.html",
    summary:
      "The Pencilcase Blog 的 Grey Herringbone 样本记录 29 g、131 mm 收帽、127 mm 去帽、162 mm post 与 snap cap；它仅作为样本交叉证据。",
    locator: "measurements, cap mechanism and tested-finish scope",
    registryKey: "pencilcase-blog-phase612-c-guilloche",
    registryName: "The Pencilcase Blog",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2016-02-05",
  }),
  tamitioOfficial: source({
    key: "phase612-c-gvfc-tamitio-official",
    title: "Graf von Faber-Castell Fountain pen Tamitio Black M",
    url: "https://www.graf-von-faber-castell.com/products/FountainpenTamitioBlackM/141500",
    summary:
      "GvFC exact page #141500 记录黑色 Tamitio 的细沟槽哑光漆金属笔杆、镀铑不锈钢尖、EF/F/M/B、墨囊／converter、135×13 mm 与 44 g。",
    locator: "article 141500 description, nib widths, filling and dimensions",
    registryKey: "graf-von-faber-castell-official-phase612-c",
    registryName: "Graf von Faber-Castell",
  }),
  tamitioSeries: source({
    key: "phase612-c-gvfc-tamitio-series",
    title: "Graf von Faber-Castell Tamitio series",
    url: "https://www.graf-von-faber-castell.com/series-all-products/tamitio",
    summary:
      "GvFC 官方系列页将普通沟槽漆面 Tamitio 与 Black Edition 产品分列，支持 finish 和 edition 边界。",
    locator:
      "Tamitio product navigation and separately named Black Edition items",
    registryKey: "graf-von-faber-castell-official-phase612-c",
    registryName: "Graf von Faber-Castell",
  }),
  tamitioReview: source({
    key: "phase612-c-gvfc-tamitio-review",
    title: "Graf von Faber-Castell Tamitio Fountain Pen Review",
    url: "https://www.sbrebrown.com/2016/09/graf-von-faber-castell-tamitio-fountain-pen-review/",
    summary:
      "SBRE Brown 的旧样本实测约 134.2 mm 收帽、46 g，并展示 snap cap、金属笔身与钢尖；测量只解释样本误差，不覆盖当前 exact SKU。",
    locator: "sample measurements, cap, material and nib observations",
    registryKey: "sbrebrown-phase612-c-tamitio",
    registryName: "SBRE Brown",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2016-09-07",
  }),
  titanOfficial: source({
    key: "phase612-c-kaweco-titan-sport-official",
    title: "Kaweco TITAN Sport Fountain Pen",
    url: "https://www.kaweco-pen.com/en/Kaweco-TITAN-Sport-Fountain-Pen/99000144/",
    summary:
      "Kaweco 当前页把 TITAN Sport 定义为钛合金 Sport，列 EF–BB 德国钢尖、约 10.5 cm 收帽／12.7 cm 书写长度与 26 g；页面属性表另显 9 g，构成公开字段冲突。",
    locator:
      "product narrative, nib selector and conflicting product-property table",
    registryKey: "kaweco-official-phase612-c",
    registryName: "Kaweco",
  }),
  titanRetail: source({
    key: "phase612-c-kaweco-titan-sport-appelboom",
    title: "Kaweco Titan Sport Fountain Pen",
    url: "https://appelboom.com/kaweco-titan-sport-fountain-pen/",
    summary:
      "Appelboom 记录 26 g、105 mm 收帽、95 mm 笔杆、133 mm post、14 mm 直径、EF–BB 钢尖及墨囊／mini converter，支持官方叙述中的 26 g。",
    locator: "dimensions, weight, nib and filling specifications",
    registryKey: "appelboom-phase612-c-titan",
    registryName: "Appelboom Pennen",
    sourceType: "retailer",
    tier: "professional_secondary",
  }),
};

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
  productionState: "current" | "historical";
  identity: string;
  boundary: string;
  care: string;
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
  secondaryFields?: Array<Exclude<SpecFieldKey, "brand_entity_id">>;
  variants: CuratedVariant[];
  conflicts?: CuratedConflict[];
}

const definitions: PenDefinition[] = [
  {
    key: "preciseVarsity",
    brandId: PHASE612_BATCH_C_BRAND_IDS.pilot,
    canonicalName: "Pilot Precise Varsity",
    aliases: [
      "Pilot Varsity",
      "Varsity",
      "百乐 Precise Varsity",
      "百乐 Varsity",
    ],
    markdownFile:
      ".planning/content-research/phase612-c-pilot-precise-varsity.md",
    storyTitle: "Pilot Precise Varsity：预灌墨日用钢笔的名称、边界与使用方式",
    primary: S.varsityOfficial,
    secondary: S.varsityGoulet,
    productionState: "current",
    identity:
      "当前美国官方页的 canonical 名称是 Pilot Precise Varsity；Varsity 是同一预灌墨产品的常用简称，而不是另一个基础型号。",
    boundary:
      "本实体只收录当前 Precise Varsity／Varsity 预灌墨钢笔，不把 Precise 滚珠笔、V5/V7、可换墨囊 Pilot 钢笔或用户拆尖改装视作它的版本。",
    care: "官方把它定位为预灌墨、免维护产品：不用时立即扣紧笔帽，墨尽后更换整笔；拆拔笔尖、灌注其他墨水属于非官方改装，不作为本站维护建议。",
    values: {
      series_name: "Precise Varsity",
      nib: "Medium 不锈钢尖；官方当前只列 Medium",
      fill_system: "工厂预灌液体墨水；非用户常规补充式",
      material: "树脂笔身与可视墨量区域；具体配方未公开",
      dimensions: "Goulet 样本：132 mm 收帽、115 mm 去帽、148 mm post",
      weight: "Goulet 样本约 10 g",
      status: "2026-08-14 美国官方目录在售；七种墨色",
    },
    secondaryFields: ["material", "dimensions", "weight"],
    variants: [
      {
        key: "phase612-c-varsity-blue",
        name: "Blue",
        notes: "官方当前墨色；同一 Medium 基础型号。",
        sourceKey: S.varsityOfficial.key,
        variantKind: "color",
      },
      {
        key: "phase612-c-varsity-black",
        name: "Black",
        notes: "官方当前墨色；Goulet PN90010 为黑色单支样本。",
        sourceKey: S.varsityOfficial.key,
        variantKind: "color",
        productCode: "PN90010",
      },
      {
        key: "phase612-c-varsity-other-colors",
        name: "Green／Pink／Purple／Red／Turquoise",
        notes: "官网其余当前墨色合并为颜色组，不建立独立型号。",
        sourceKey: S.varsityOfficial.key,
        variantKind: "edition_group",
      },
    ],
  },
  {
    key: "explorer",
    brandId: PHASE612_BATCH_C_BRAND_IDS.pilot,
    canonicalName: "Pilot Explorer",
    aliases: [
      "Explorer Fountain Pen",
      "百乐 Explorer",
      "Pilot Explorer Fountain Pen",
    ],
    markdownFile: ".planning/content-research/phase612-c-pilot-explorer.md",
    storyTitle: "Pilot Explorer：轻量钢笔、converter 包装差异与日用边界",
    primary: S.explorerOfficial,
    secondary: S.explorerPenAddict,
    productionState: "current",
    identity:
      "Pilot Explorer 是美国官方 Fine Writing 目录中的轻量 cartridge／converter 钢笔，当前配置为 F 或 M 不锈钢尖与六种金属感颜色。",
    boundary:
      "Explorer 不与 Pilot Metropolitan/MR、Lightive、Prera 或 Kakuno 合并；不同年份包装内可能是不同 converter，兼容性也不等于盒内必定随附同一型号。",
    care: "换墨时以室温清水从 converter 往返冲洗笔舌，完全阴干后装回；笔身存在开口结构，不按 eyedropper 使用，也不要以酒精或热水处理表面。",
    values: {
      series_name: "Explorer",
      nib: "F／M 不锈钢尖",
      fill_system:
        "Pilot 墨囊或 converter；当前官网称随附 converter，旧包装可能不同",
      material: "轻量流线笔身；官网未公布树脂配方",
      weight: "The Pen Addict 样本约 11.9 g（整笔）",
      status: "2026-08-14 美国官方目录在售；六种金属感颜色",
    },
    secondaryFields: ["weight"],
    variants: [
      {
        key: "phase612-c-explorer-colors",
        name: "Gray／Blue／Red／Pink／Lime／Turquoise",
        notes: "当前官网六种颜色；颜色不是新一代型号。",
        sourceKey: S.explorerOfficial.key,
        variantKind: "edition_group",
      },
      {
        key: "phase612-c-explorer-f",
        name: "Fine",
        notes: "当前官方尖幅。",
        sourceKey: S.explorerOfficial.key,
        variantKind: "nib",
      },
      {
        key: "phase612-c-explorer-m",
        name: "Medium",
        notes: "当前官方尖幅。",
        sourceKey: S.explorerOfficial.key,
        variantKind: "nib",
      },
    ],
  },
  {
    key: "aya",
    brandId: PHASE612_BATCH_C_BRAND_IDS.namiki,
    canonicalName: "Namiki Aya",
    aliases: ["Aya Collection", "Namiki Aya Collection", "NAMIKI 彩 Aya"],
    markdownFile: ".planning/content-research/phase612-c-namiki-aya.md",
    storyTitle: "Namiki Aya：彩漆、研出莳绘、No.30 笔尖与四个图案",
    primary: S.ayaCollection,
    secondary: S.ayaRetail,
    extraSources: [S.ayaDaybreak],
    productionState: "current",
    identity:
      "Aya 是 Namiki 当前 collection，以硬橡胶胎上的彩漆与 Togidashi Maki-e 形成四个具名图案，并配 18K No.30 笔尖；制造关系归 Namiki 品牌节点。",
    boundary:
      "Daybreak、Gale、Limpid Stream、Evergreen 是 Aya 图案／SKU，不拆成四个基础型号；Aya 也不并入 Yukari、Emperor、Chinkin 或 Pilot Custom Urushi。",
    care: "漆面只用干净柔软布轻拭，避免酒精、研磨剂、长时强光和硬物摩擦；清洗时只让室温清水经过笔尖、笔舌与 CON-70N，不浸泡漆面。",
    values: {
      series_name: "Aya",
      nib: "18K No.30；Daybreak exact page 列 FM／M／B",
      fill_system: "Pilot 墨囊／converter；Evergreen 现售样本随 CON-70N",
      material: "硬橡胶胎、彩漆与 Togidashi Maki-e；金属件规格按 SKU",
      dimensions: "Evergreen SKU：约 164 mm 收帽、151 mm 笔身、15 mm 直径",
      weight: "Evergreen SKU 约 44 g",
      status: "2026-08-14 Namiki 官网列为当前 collection",
    },
    secondaryFields: ["fill_system", "material", "dimensions", "weight"],
    variants: [
      {
        key: "phase612-c-aya-daybreak",
        name: "Daybreak / Akatsuki",
        notes: "Togidashi Maki-e；exact item FNA-30M-AKA。",
        sourceKey: S.ayaDaybreak.key,
        variantKind: "color",
        productCode: "FNA-30M-AKA",
      },
      {
        key: "phase612-c-aya-gale",
        name: "Gale / Hayate",
        notes: "Aya 当前图案之一；具体尖幅与库存按 exact SKU。",
        sourceKey: S.ayaCollection.key,
        variantKind: "color",
      },
      {
        key: "phase612-c-aya-limpid-stream",
        name: "Limpid Stream / Seiryu",
        notes: "Aya 当前图案之一。",
        sourceKey: S.ayaCollection.key,
        variantKind: "color",
      },
      {
        key: "phase612-c-aya-evergreen",
        name: "Evergreen / Tokiwa",
        notes: "Aya 当前图案之一；尺寸重量采用此 SKU 的零售规格。",
        sourceKey: S.ayaCollection.key,
        variantKind: "color",
      },
    ],
  },
  {
    key: "fudeDeMannen120150",
    brandId: PHASE612_BATCH_C_BRAND_IDS.sailor,
    canonicalName: "Sailor Fude de Mannen 12-0150",
    aliases: [
      "Sailor 12-0150",
      "Fude de Mannen",
      "写乐笔 de 万年 12-0150",
      "写乐弯尖 12-0150",
    ],
    markdownFile:
      ".planning/content-research/phase612-c-sailor-fude-de-mannen-12-0150.md",
    storyTitle:
      "Sailor Fude de Mannen 12-0150：40°／55° 弯尖、五个 SKU 与练习方法",
    primary: S.sailorFudeOfficial,
    secondary: S.sailorFudeReview,
    productionState: "current",
    identity:
      "12-0150 是写乐现行长杆 Fude de Mannen 基础 SKU 家族，以 40° 或 55° 镀金不锈钢弯尖靠书写角度改变线宽。",
    boundary:
      "本实体不吸收 Profit Fude、Profit Jr.、Naginata Togi、Special Nib 或周年限定；弯折几何也不等于弹性尖，不能靠重压取得变化。",
    care: "按普通 Sailor cartridge／converter 钢笔用室温清水冲洗；纸纤维卡在弯尖处时先浸润再轻擦，禁止掰直、二次弯折或以压力测试弹性。",
    values: {
      series_name: "Fude de Mannen 12-0150",
      nib: "镀金不锈钢特殊弯尖；40° 或 55°",
      fill_system: "Sailor 墨囊／converter",
      material: "Navy 为 AS 树脂；其余当前色为 ABS；金属件与镀层按官网",
      dimensions: "最大直径 15.0 mm × 全长 169 mm",
      weight: "约 12.0 g",
      price_range: "日本官网显示含税 ¥1,650（检索日）",
      status: "2026-08-14 日本官网在售；五个 12-0150 SKU",
    },
    variants: [
      {
        key: "phase612-c-fude-navy-40",
        name: "Navy 40°",
        notes: "40° 低角度型。",
        sourceKey: S.sailorFudeOfficial.key,
        variantKind: "market_sku",
        productCode: "12-0150-040",
      },
      {
        key: "phase612-c-fude-wakatake-55",
        name: "Wakatake 55°",
        notes: "55° 较直立型。",
        sourceKey: S.sailorFudeOfficial.key,
        variantKind: "market_sku",
        productCode: "12-0150-067",
      },
      {
        key: "phase612-c-fude-white-40",
        name: "Pearl White 40°",
        notes: "40° 当前色。",
        sourceKey: S.sailorFudeOfficial.key,
        variantKind: "market_sku",
        productCode: "12-0150-010",
      },
      {
        key: "phase612-c-fude-pink-40",
        name: "Pearl Pink 40°",
        notes: "40° 当前色。",
        sourceKey: S.sailorFudeOfficial.key,
        variantKind: "market_sku",
        productCode: "12-0150-031",
      },
      {
        key: "phase612-c-fude-brown-40",
        name: "Pearl Brown 40°",
        notes: "40° 当前色。",
        sourceKey: S.sailorFudeOfficial.key,
        variantKind: "market_sku",
        productCode: "12-0150-080",
      },
    ],
  },
  {
    key: "guilloche",
    brandId: PHASE612_BATCH_C_BRAND_IDS.grafVonFaberCastell,
    canonicalName: "Graf von Faber-Castell Guilloche",
    aliases: ["GvFC Guilloche", "Guilloche Fountain Pen", "伯爵 Guilloche"],
    markdownFile: ".planning/content-research/phase612-c-gvfc-guilloche.md",
    storyTitle:
      "Graf von Faber-Castell Guilloche：雕纹树脂、18K 金尖与配色边界",
    primary: S.guillocheOfficial,
    secondary: S.guillocheReview,
    productionState: "current",
    identity:
      "Guilloche 是 Graf von Faber-Castell 高级线的独立系列；当前 Black F #146541 以雕纹珍贵树脂、镀铑金属件与手工调校的 18K 金尖为 exact anchor。",
    boundary:
      "Black、Grey Herringbone、Ciselé、颜色款与 Black Edition 的表面、金属处理和编号不能互相继承；本实体也不挂到普通 Faber-Castell 品牌。",
    care: "用柔软干布顺纹轻拭，避免研磨剂在雕纹凹槽积留；换墨用室温清水冲洗 converter 与笔尖，确认 snap cap 扣合但不要用力撞击弹簧笔夹。",
    values: {
      series_name: "Guilloche",
      nib: "18K 金尖，镀铑；EF／F／M／B，官方称逐支手工 run-in",
      fill_system: "标准墨囊／converter；converter 随附",
      material: "#146541：雕纹 precious resin 笔杆与镀铑金属件",
      dimensions: "#146541：约 131 × 12 mm；旧评测样本去帽 127 mm、post 162 mm",
      weight: "#146541 约 29 g",
      status: "2026-08-14 exact 官方商品页可核实",
    },
    secondaryFields: ["dimensions"],
    variants: [
      {
        key: "phase612-c-guilloche-black-146541",
        name: "Black F",
        notes: "本包 exact anchor；不同尖幅有相邻货号。",
        sourceKey: S.guillocheOfficial.key,
        variantKind: "market_sku",
        productCode: "146541",
      },
      {
        key: "phase612-c-guilloche-herringbone",
        name: "Grey Herringbone sample",
        notes: "独立评测样本，仅交叉尺寸与使用，不代表 Black 的表面。",
        sourceKey: S.guillocheReview.key,
        variantKind: "color",
      },
    ],
  },
  {
    key: "tamitio",
    brandId: PHASE612_BATCH_C_BRAND_IDS.grafVonFaberCastell,
    canonicalName: "Graf von Faber-Castell Tamitio",
    aliases: ["GvFC Tamitio", "Tamitio Fountain Pen", "伯爵 Tamitio"],
    markdownFile: ".planning/content-research/phase612-c-gvfc-tamitio.md",
    storyTitle:
      "Graf von Faber-Castell Tamitio：沟槽漆面金属杆、钢尖与 Black Edition 边界",
    primary: S.tamitioOfficial,
    secondary: S.tamitioReview,
    extraSources: [S.tamitioSeries],
    productionState: "current",
    identity:
      "Tamitio 是 Graf von Faber-Castell 的金属笔身系列；当前 Black M #141500 exact page 明确为细沟槽哑光漆笔杆和镀铑不锈钢尖。",
    boundary:
      "普通 Black 与 Black Edition 的 PVD／全黑处理、Calligraphy 套装及历史配色分开；Tamitio 的钢尖不能被 Guilloche／Classic 的 18K 金尖规格覆盖。",
    care: "漆面只用柔软微湿布后立即擦干，沟槽不用研磨膏；converter 与笔尖以室温清水冲洗，snap cap 直向拔插，避免侧向撬动漆面金属口。",
    values: {
      series_name: "Tamitio",
      nib: "镀铑不锈钢尖；EF／F／M／B",
      fill_system: "标准墨囊／converter；converter 随附",
      material: "#141500：细沟槽哑光漆金属笔杆、镀铬金属件",
      dimensions: "#141500：约 135 × 13 mm；2016 样本约 134.2 mm 收帽",
      weight: "当前官方 #141500 约 44 g；2016 样本约 46 g",
      status: "2026-08-14 exact 官方商品页可核实",
    },
    secondaryFields: ["dimensions"],
    variants: [
      {
        key: "phase612-c-tamitio-black-141500",
        name: "Black M",
        notes: "本包 exact anchor；M 尖货号 141500。",
        sourceKey: S.tamitioOfficial.key,
        variantKind: "market_sku",
        productCode: "141500",
      },
      {
        key: "phase612-c-tamitio-black-edition",
        name: "Black Edition",
        notes: "全黑处理为另一个 variant，不向普通 Black 继承饰件或笔尖表面。",
        sourceKey: S.tamitioSeries.key,
        variantKind: "edition_group",
      },
    ],
  },
  {
    key: "titanSport",
    brandId: PHASE612_BATCH_C_BRAND_IDS.kaweco,
    canonicalName: "Kaweco TITAN Sport",
    aliases: [
      "Kaweco Titan Sport",
      "TITAN Sport Fountain Pen",
      "Kaweco 钛 Sport",
    ],
    markdownFile: ".planning/content-research/phase612-c-kaweco-titan-sport.md",
    storyTitle: "Kaweco TITAN Sport：钛合金口袋笔、26 g 证据与 Sport 家族边界",
    primary: S.titanOfficial,
    secondary: S.titanRetail,
    productionState: "current",
    identity:
      "TITAN Sport 是 Kaweco 当前以钛合金制作的 Sport 子系列：保留口袋笔比例与 EF–BB 可选钢尖，但材料、重量与表面反应独立于其他 Sport。",
    boundary:
      "TITAN Sport 不与 AL Sport、Brass Sport、Bronze Sport、Steel Sport 或 Piston Sport 合并；不同材料并非 Titan 的颜色，活塞版的机构也不能继承。",
    care: "钛表面不需要抛光去除所谓 patina；用柔软微湿布擦拭，墨路用室温清水冲洗。只使用短墨囊或 Kaweco mini converter，旋帽与螺纹避免夹入砂粒。",
    values: {
      series_name: "TITAN Sport",
      nib: "德国不锈钢尖；EF／F／M／B／BB",
      fill_system: "短国际墨囊或 Kaweco mini converter",
      material:
        "钛合金笔身；深灰光泽表面；官网称耐腐蚀且不会形成铜合金式 patina",
      dimensions:
        "约 105 mm 收帽、127 mm 书写；Appelboom 样本 post 133 mm、直径约 14 mm",
      weight:
        "采用官方叙述与 Appelboom 一致的约 26 g；官网属性表另显示 9 g，保留为冲突",
      status: "2026-08-14 Kaweco 当前 TITAN SPORT 系列在售",
    },
    secondaryFields: ["dimensions"],
    variants: [
      {
        key: "phase612-c-titan-sport-current",
        name: "TITAN Sport Fountain Pen",
        notes: "当前钛合金版本；尖幅是订单 variant，不拆基础型号。",
        sourceKey: S.titanOfficial.key,
        variantKind: "material",
        productCode: "11000404",
      },
    ],
  },
];

function claim(
  definition: PenDefinition,
  scopeKey: string,
  kind: "identity" | "boundary" | "care",
): CuratedClaim {
  const isIdentity = kind === "identity";
  const sourceItem = isIdentity ? definition.primary : definition.secondary;
  const text =
    kind === "identity"
      ? definition.identity
      : kind === "boundary"
        ? definition.boundary
        : definition.care;
  return {
    key: `phase612-c-${definition.key}-${kind}`,
    predicate:
      kind === "identity"
        ? "model_identity"
        : kind === "boundary"
          ? "version_boundary"
          : "maintenance_boundary",
    objectText: text,
    factClass: "core",
    confidence: isIdentity ? 0.99 : 0.96,
    sourceKey: sourceItem.key,
    locator: sourceItem.summary,
    evidence: [
      {
        key: `phase612-c-${definition.key}-${kind}-primary-evidence`,
        sourceKey: sourceItem.key,
        scopeKey,
        locator: sourceItem.summary,
      },
      ...(kind === "identity"
        ? [
            {
              key: `phase612-c-${definition.key}-${kind}-secondary-evidence`,
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
  suffix = "accepted",
  qualifies = true,
) {
  return {
    key: `phase612-c-${definition.key}-spec-${fieldKey}-${suffix}`,
    fieldKey,
    sourceKey: sourceItem.key,
    scopeKey,
    locator: sourceItem.summary,
    qualifies,
  };
}

function penPack(definition: PenDefinition): CuratedEntityPack {
  const scopeKey = `phase612-c:${PHASE612_BATCH_C_SLUGS[definition.key]}:canonical`;
  const diagram = editorial(
    definition.key,
    `${definition.canonicalName} 身份与规格事实图`,
  );
  const valueFields = Object.keys(definition.values) as Array<
    Exclude<SpecFieldKey, "brand_entity_id">
  >;
  const specEvidenceItems = valueFields.map((fieldKey) =>
    specEvidence(
      definition,
      scopeKey,
      fieldKey,
      definition.secondaryFields?.includes(fieldKey)
        ? definition.secondary
        : definition.primary,
    ),
  );
  const conflicts =
    definition.key === "titanSport"
      ? [
          {
            key: "phase612-c-titan-weight-conflict",
            fieldKey: "weight",
            scopeKey,
            conflictKind: "field" as const,
            status: "resolved" as const,
            resolutionNote:
              "采用官方叙述与独立专业零售页一致的约 26 g；官网同页属性表 9 g 与两项证据冲突，作为页面字段异常披露而不覆盖正文。",
            members: [
              {
                citationKey: `phase612-c-${definition.key}-spec-weight-accepted`,
                assertedValue: "约 26 g",
              },
              {
                citationKey: `phase612-c-${definition.key}-spec-weight-official-table-rejected`,
                assertedValue: "9 g（官网属性表）",
              },
            ],
          },
        ]
      : definition.conflicts;
  if (definition.key === "titanSport") {
    specEvidenceItems.push(
      specEvidence(
        definition,
        scopeKey,
        "weight",
        definition.primary,
        "official-table-rejected",
        false,
      ),
      specEvidence(
        definition,
        scopeKey,
        "weight",
        definition.secondary,
        "retailer-corroboration",
      ),
    );
  }
  return {
    key: `phase612-c-${definition.key}-sourced-v1`,
    entityId: PHASE612_BATCH_C_IDS[definition.key],
    expectedType: "pen",
    expectedSlug: PHASE612_BATCH_C_SLUGS[definition.key],
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
        ...specEvidenceItems,
      ],
    },
    conflicts,
    media: [
      {
        key: `phase612-c-${definition.key}-primary-media`,
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
        key: `phase612-c-${definition.key}-scope-verified`,
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
    throw new Error(`Phase 612 Batch C requires current ${label} brand pack.`);
  return pack;
}

function refreshBrand(
  base: CuratedEntityPack,
  key: string,
  brandLabel: string,
  pens: CuratedEntityPack[],
): CuratedEntityPack {
  const clone = structuredClone(base);
  const isolatedMediaSourceKeys = new Set([
    "pilot-vanishing-point-commons",
    "sailor-brand-site-original",
    "kaweco-commons-special-media",
  ]);
  for (const source of clone.sources) {
    if (!isolatedMediaSourceKeys.has(source.key)) continue;
    const priorKey = source.key;
    source.key = `phase612-c-${brandLabel.toLowerCase().replaceAll(" ", "-")}-${priorKey}`;
    source.registryKey = `${source.key}-registry`;
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
  const scopeKey = `phase612-c:${brandLabel.toLowerCase().replaceAll(" ", "-")}:navigation`;
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
          "Phase 612 Batch C model navigation only; exact specifications remain on model pages.",
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
          "Phase 612 Batch C exact model pages and official product navigation",
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

const pilotPens = [pensByKey.preciseVarsity, pensByKey.explorer];
const namikiPens = [pensByKey.aya];
const sailorPens = [pensByKey.fudeDeMannen120150];
const gvfcPens = [pensByKey.guilloche, pensByKey.tamitio];
const kawecoPens = [pensByKey.titanSport];

export const phase612BatchCBaseBrands = [
  requireBrand(
    phase425BrandDepthRefreshPacks,
    PHASE612_BATCH_C_BRAND_IDS.pilot,
    "Pilot",
  ),
  requireBrand(
    phase439BrandDepthRefreshPacks,
    PHASE612_BATCH_C_BRAND_IDS.namiki,
    "Namiki",
  ),
  requireBrand(
    phase425BrandDepthRefreshPacks,
    PHASE612_BATCH_C_BRAND_IDS.sailor,
    "Sailor",
  ),
  requireBrand(
    phase430BrandDepthRefreshPacks,
    PHASE612_BATCH_C_BRAND_IDS.grafVonFaberCastell,
    "Graf von Faber-Castell",
  ),
  requireBrand(
    phase139Groups.map((group) => group.brand),
    PHASE612_BATCH_C_BRAND_IDS.kaweco,
    "Kaweco",
  ),
].map((pack) => structuredClone(pack));

const pilotBrand = refreshBrand(
  phase612BatchCBaseBrands[0] as CuratedEntityPack,
  "phase612-c-pilot-brand-model-navigation-v1",
  "Pilot",
  pilotPens,
);
const namikiBrand = refreshBrand(
  phase612BatchCBaseBrands[1] as CuratedEntityPack,
  "phase612-c-namiki-brand-model-navigation-v1",
  "Namiki",
  namikiPens,
);
const sailorBrand = refreshBrand(
  phase612BatchCBaseBrands[2] as CuratedEntityPack,
  "phase612-c-sailor-brand-model-navigation-v1",
  "Sailor",
  sailorPens,
);
const gvfcBrand = refreshBrand(
  phase612BatchCBaseBrands[3] as CuratedEntityPack,
  "phase612-c-gvfc-brand-model-navigation-v1",
  "Graf von Faber-Castell",
  gvfcPens,
);
const kawecoBrand = refreshBrand(
  phase612BatchCBaseBrands[4] as CuratedEntityPack,
  "phase612-c-kaweco-brand-model-navigation-v1",
  "Kaweco",
  kawecoPens,
);

export const phase612BatchCGroups: Array<{
  brand: CuratedEntityPack;
  pens: CuratedEntityPack[];
}> = [
  { brand: pilotBrand, pens: pilotPens },
  { brand: namikiBrand, pens: namikiPens },
  { brand: sailorBrand, pens: sailorPens },
  { brand: gvfcBrand, pens: gvfcPens },
  { brand: kawecoBrand, pens: kawecoPens },
];

export const phase612BatchCPacks = phase612BatchCGroups.flatMap(
  ({ brand, pens }) => [brand, ...pens],
);

if (
  phase612BatchCPacks.length !== 12 ||
  new Set(phase612BatchCPacks.map((pack) => pack.entityId)).size !== 12
) {
  throw new Error(
    "Phase 612 Batch C must contain five brand refreshes and seven unique pens.",
  );
}
