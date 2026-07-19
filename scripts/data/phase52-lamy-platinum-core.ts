import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE42_LAMY_2000_ID,
  PHASE42_LAMY_BRAND_ID,
  PHASE42_PLATINUM_3776_ID,
  PHASE42_PLATINUM_BRAND_ID,
  phase42LamyPlatinumPacks,
} from "./phase42-lamy-platinum";

export const PHASE52_LAMY_BRAND_ID = PHASE42_LAMY_BRAND_ID;
export const PHASE52_LAMY_2000_ID = PHASE42_LAMY_2000_ID;
export const PHASE52_PLATINUM_BRAND_ID = PHASE42_PLATINUM_BRAND_ID;
export const PHASE52_PLATINUM_3776_ID = PHASE42_PLATINUM_3776_ID;
const RETRIEVED = "2026-07-19";

function live(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.url,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const SOURCES = {
  lamyOfficial: live({
    key: "phase52-lamy-2000-official",
    title: "LAMY 2000 official product page",
    url: "https://www.lamy.com/en-us/p/lamy-2000-fountain-pen",
    registryKey: "lamy-official-product-phase52",
    registryName: "LAMY official product",
    sourceType: "official",
    tier: "primary",
    summary: "官方当前页面给出标准黑色 2000 的活塞上墨、玻纤、拉丝不锈钢部件、铂镀 14 ct 金尖、13×13×140 mm、26 g 与 4000017。",
    locator: "current standard black product identity, dimensions, weight, nib and filling system",
  }),
  lamyM: live({
    key: "phase52-lamy-2000-m-official",
    title: "LAMY 2000 M official product page",
    url: "https://www.lamy.com/en-in/p/lamy-2000-m-fountain-pen",
    registryKey: "lamy-official-product-phase52",
    registryName: "LAMY official product",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "官方 2000 M 页面把银色全不锈钢款与标准 Makrolon 分开，尺寸仍约 13×13×140 mm，但重量为 54 g，item 1224126（地区编号会变化）。",
    locator: "2000 M stainless-steel body, weight, nib and regional item number",
  }),
  lamyDesign: live({
    key: "phase52-lamy-design",
    title: "LAMY design: Gerd A. Müller and LAMY 2000",
    url: "https://www.lamy.com/en-us/company/design",
    registryKey: "lamy-official-phase52",
    registryName: "LAMY official",
    sourceType: "official",
    tier: "primary",
    summary: "官方设计档案把 2000 追溯到 1966 年，并确认 Gerd A. Müller 与 2000、cp1、st 的设计关联。",
    locator: "designer and 1966 design-history entry",
  }),
  lamyCatalog: live({
    key: "phase52-lamy-catalog",
    title: "LAMY writing instruments catalogue",
    url: "https://www.cnp.gr/wp-content/uploads/2024/02/lamy-pens-product-range-catalogue-2024.pdf",
    registryKey: "lamy-catalogue-phase52",
    registryName: "LAMY product catalogue archive",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "目录把 LAMY 2000 [001] 的聚碳酸酯版本与 2000 M [002] 的不锈钢版本分列，并分别列尖号与材料。",
    locator: "catalogue LAMY 2000 [001] and 2000 M [002] entries",
  }),
  lamyCare: live({
    key: "phase52-lamy-care",
    title: "LAMY care and handling FAQ",
    url: "https://www.lamyshop.se/en/pages/faq",
    registryKey: "lamy-care-phase52",
    registryName: "LAMY care guidance",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "LAMY 护理资料建议活塞笔用清水吸排，换色前彻底冲洗并自然干燥，避免洗洁精、酒精和化学品。",
    locator: "piston cleaning, ink-change and storage guidance",
  }),
  lamyGoulet: live({
    key: "phase52-lamy-goulet-qc",
    title: "Goulet Pens: LAMY 2000 quality control",
    url: "https://www.gouletpens.com/blogs/fountain-pen-blog/discussing-lamy-2000-quality-control",
    registryKey: "goulet-pens-phase52-lamy",
    registryName: "Goulet Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "Goulet 的长期检验记录把 2000 的“甜区”解释为方形研磨与握笔旋转敏感性，而不是把每支笔都归为 QC 故障。",
    locator: "nib sweet spot, rotation sensitivity and inspection experience",
  }),
  lamySVG: diagram(
    "phase52-lamy-2000-svg",
    "LAMY 2000 标准款与 2000 M 边界事实卡",
    "/images/library/site-original/lamy-platinum-core/lamy-2000.svg",
    "本站原创事实图，区分 Makrolon 标准款与全不锈钢 2000 M 的材质和重量。",
  ),
  platinumOfficial: live({
    key: "phase52-platinum-3776-official",
    title: "Platinum #3776 Century PNB-15000 official product",
    url: "https://www.platinum-pen.co.jp/products/fountain-pen/1464/",
    registryKey: "platinum-3776-official-phase52",
    registryName: "Platinum #3776 official",
    sourceType: "official",
    tier: "primary",
    summary: "日本官方 PNB-15000 页面列 AS 树脂、14K 14-26 尖、UEF–C、139.5 mm、15.4 mm、20.5 g、Converter-800A 与五种常规颜色。",
    locator: "current PNB-15000 specifications, nibs, dimensions, weight and accessories",
  }),
  platinumHistory: live({
    key: "phase52-platinum-3776-history",
    title: "Platinum #3776 official lineage",
    url: "https://www.platinum-pen.co.jp/brands/3776-century/",
    registryKey: "platinum-3776-official-phase52",
    registryName: "Platinum #3776 official",
    sourceType: "official",
    tier: "primary",
    summary: "官方品牌资料把原始 #3776 放在 1978 年，把 #3776 Century 的全面刷新放在 2011 年；不同材料和尖号以具体 SKU 为准。",
    locator: "1978 origin, 2011 Century refresh and family boundaries",
  }),
  platinumSlipSeal: live({
    key: "phase52-platinum-slipseal",
    title: "Platinum Slip & Seal mechanism",
    url: "https://www.platinum-pen.co.jp/en/slipseal/",
    registryKey: "platinum-slipseal",
    registryName: "Platinum official mechanism guide",
    sourceType: "official",
    tier: "primary",
    summary: "官方机构页解释旋帽内的 Slip & Seal 让笔尖保持气密，并说明这是为减少长时间闲置干墨而设计的结构。",
    locator: "screw-cap airtight mechanism and anti-dry design intent",
  }),
  platinumManual: live({
    key: "phase52-platinum-manual",
    title: "Platinum Century care manual",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/century.pdf",
    registryKey: "platinum-care-phase52",
    registryName: "Platinum official manual",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "官方手册给出换墨冲洗、长期保存和特殊款不搭载 Slip & Seal 的例外，普通 Century 的约两年目标不能套到所有 3776。",
    locator: "cleaning, storage and model exceptions in Century manual",
  }),
  platinumVer20: live({
    key: "phase52-platinum-ver20",
    title: "Platinum #3776 Century Ver.2.0 official demonstrator brief",
    url: "https://www.platinum-pen.co.jp/common/pdf/demonstrator_en.pdf",
    registryKey: "platinum-3776-ver20",
    registryName: "Platinum Ver.2.0 official release",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "2026 官方资料把 PNB-450 Prism Crystal 作为独立 Ver.2.0，139.5×15.4 mm、20.0 g，改良密封目标超过三年并调整握位、墨窗和尖刻印。",
    locator: "2026 Ver.2.0 PNB-450 specifications and redesign notes",
  }),
  platinumTravia: live({
    key: "phase52-platinum-travia",
    title: "Platinum #3776 Century Travia official brief",
    url: "https://www.platinum-pen.co.jp/common/pdf/travia_en.pdf",
    registryKey: "platinum-travia",
    registryName: "Platinum Travia official release",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "2026 Travia 是 #3776 线的新品牌 sibling：PFL-600、FLAF 14K 镀钌尖、142 mm、29.3 g、金属平衡件与独立上墨配件。",
    locator: "2026 Travia lineage, FLAF nib, dimensions, weight and first-batch boundary",
  }),
  platinumGoulet: live({
    key: "phase52-platinum-goulet",
    title: "Goulet Pens: Platinum #3776 Century Bourgogne",
    url: "https://www.gouletpens.com/collections/platinum-3776-century-fountain-pens/products/platinum-3776-century-fountain-pen-bourgogne",
    registryKey: "goulet-pens-phase52-platinum",
    registryName: "Goulet Pens",
    sourceType: "retailer",
    tier: "retailer",
    summary: "Goulet 目录补充普通 Bourgogne 的树脂、旋帽、14K 尖、原厂墨囊／converter 和约 24 个月防干宣传语境。",
    locator: "retailer specifications, filling and product-specific materials",
  }),
  platinumReview: live({
    key: "phase52-platinum-penaddict",
    title: "The Pen Addict: Platinum #3776 Century Chartres Blue",
    url: "https://www.penaddict.com/blog/2015/12/14/platinum-3776-century-chartres-blue-fountain-pen-review",
    registryKey: "pen-addict-phase52",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "专业评测把普通 14K 尖的铅笔式反馈、清楚线条和日用一致性作为个人体验记录，不替代官方规格。",
    locator: "writing feedback and line-control observations from Chartres Blue review",
  }),
  platinumSVG: diagram(
    "phase52-platinum-3776-svg",
    "Platinum #3776 Century 普通款与新版边界事实卡",
    "/images/library/site-original/lamy-platinum-core/platinum-3776-century.svg",
    "本站原创事实图，区分 1978、2011、普通 PNB-15000、2026 Ver.2.0 与 Travia。",
  ),
};

function upgradePack(
  base: CuratedEntityPack,
  input: {
    key: string;
    markdownFile: string;
    title: string;
    primary: CuratedSource;
    secondary: CuratedSource;
    extras: CuratedSource[];
    svg: CuratedSource;
    boundary: string;
    variants: CuratedEntityPack["variants"];
    status: string;
  },
): CuratedEntityPack {
  const pack = structuredClone(base);
  pack.key = `phase52-${input.key}-v1`;
  pack.markdownFile = input.markdownFile;
  pack.storyTitle = input.title;
  pack.primarySourceKey = input.primary.key;
  pack.sources = [...pack.sources, input.primary, input.secondary, ...input.extras, input.svg].filter(
    (source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index,
  );
  pack.claims[0]!.sourceKey = input.primary.key;
  pack.claims[0]!.evidence[0]!.sourceKey = input.primary.key;
  pack.claims[1]!.sourceKey = input.secondary.key;
  pack.claims[1]!.objectText = input.boundary;
  pack.claims[1]!.evidence = [
    { ...pack.claims[1]!.evidence[0]!, sourceKey: input.secondary.key },
    { ...pack.claims[1]!.evidence[1]!, sourceKey: input.primary.key },
  ];
  pack.spec!.values.status = input.status;
  for (const evidence of pack.spec!.evidence) {
    if (evidence.fieldKey === "status") evidence.sourceKey = input.secondary.key;
    else evidence.sourceKey = input.primary.key;
  }
  pack.variants = input.variants;
  pack.media = [{
    key: `${input.key}-primary`,
    title: `${pack.canonicalName} 事实卡（非产品照片）`,
    sourceKey: input.svg.key,
    localPath: input.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不表现真实比例、颜色、Logo 或刻字。",
    sourceUrl: input.svg.url,
    usageStatus: "primary",
  }];
  return pack;
}

const lamyBase = phase42LamyPlatinumPacks.find((pack) => pack.entityId === PHASE52_LAMY_2000_ID);
const platinumBase = phase42LamyPlatinumPacks.find((pack) => pack.entityId === PHASE52_PLATINUM_3776_ID);
const lamyBrandBase = phase42LamyPlatinumPacks.find((pack) => pack.entityId === PHASE52_LAMY_BRAND_ID);
const platinumBrandBase = phase42LamyPlatinumPacks.find((pack) => pack.entityId === PHASE52_PLATINUM_BRAND_ID);
if (!lamyBase || !platinumBase || !lamyBrandBase || !platinumBrandBase) throw new Error("Phase 52 canonical LAMY/Platinum packs are missing.");

const lamyBrandPack = structuredClone(lamyBrandBase);
lamyBrandPack.key = "phase52-lamy-brand-v1";
const platinumBrandPack = structuredClone(platinumBrandBase);
platinumBrandPack.key = "phase52-platinum-brand-v1";

const lamyPack = upgradePack(lamyBase, {
  key: "lamy-2000",
  markdownFile: ".planning/content-research/lamy-2000.md",
  title: "LAMY 2000：标准 Makrolon 活塞款与 2000 M 的材料分界",
  primary: SOURCES.lamyOfficial,
  secondary: SOURCES.lamyGoulet,
  extras: [SOURCES.lamyM, SOURCES.lamyDesign, SOURCES.lamyCatalog, SOURCES.lamyCare],
  svg: SOURCES.lamySVG,
  boundary: "本页只承载标准黑色 Makrolon LAMY 2000 fountain pen；全不锈钢 2000 M、纪念色、圆珠／滚珠／机械铅笔是 sibling，不共享标准款的材质、重量、尖号或产品图。",
  status: "标准黑色 Makrolon 款现行；LAMY 2000 M 为独立全不锈钢 sibling，特别色与其他书写工具按 SKU 分开",
  variants: [
    { key: "lamy-2000-standard", name: "标准黑色 Makrolon 2000", releaseYear: "1966–", productCode: "4000017", notes: "官方当前 13×13×140 mm、26 g，活塞、玻纤增强聚碳酸酯与铂镀 14K 尖；EF/F/M/B/OM/OB/BB/OBB。", sourceKey: SOURCES.lamyOfficial.key, variantKind: "market_sku" },
    { key: "lamy-2000-m", name: "LAMY 2000 M 全不锈钢", releaseYear: "现行家族变体", productCode: "1224126 / 4029591（地区编号）", notes: "官方独立页面给出 13×13×140 mm、54 g、全不锈钢哑面与铂镀 14K 尖；不能回填标准款 26 g。", sourceKey: SOURCES.lamyM.key, variantKind: "market_sku" },
  ],
});

const platinumPack = upgradePack(platinumBase, {
  key: "platinum-3776-century",
  markdownFile: ".planning/content-research/platinum-3776-century.md",
  title: "Platinum #3776 Century：普通 PNB-15000、Ver.2.0 与 Travia 的版本边界",
  primary: SOURCES.platinumOfficial,
  secondary: SOURCES.platinumReview,
  extras: [SOURCES.platinumHistory, SOURCES.platinumSlipSeal, SOURCES.platinumManual, SOURCES.platinumVer20, SOURCES.platinumTravia, SOURCES.platinumGoulet],
  svg: SOURCES.platinumSVG,
  boundary: "本页 canonical identity 是普通树脂 PNB-13000/PNB-15000；2026 PNB-450 Ver.2.0、PFL-600 Travia、赛璐珞、屋久杉、象嵌与 Music/特殊尖另立 sibling，不共享普通款的重量、密封年限、尖刻印或配件。",
  status: "普通树脂 PNB-15000 现行；2026 Ver.2.0 与 Travia 为独立 sibling，特殊材料与尖号按产品号核对",
  variants: [
    { key: "platinum-3776-pnb15000", name: "PNB-15000 普通树脂款", releaseYear: "2011–", productCode: "PNB-15000", notes: "AS 树脂、14K 14-26、UEF/EF/F/SF/M/B/C，139.5×15.4 mm、20.5 g，墨囊／Converter-800A；普通 Slip & Seal 目标约两年。", sourceKey: SOURCES.platinumOfficial.key, variantKind: "market_sku" },
    { key: "platinum-3776-ver20", name: "#3776 CENTURY Ver.2.0 Prism Crystal", releaseYear: "2026-02-05", productCode: "PNB-450", notes: "独立 2026 限定款；139.5×15.4 mm、20.0 g、14K 14-26，改良握位、墨窗、首轴和尖刻印，官方加速试验目标超过三年；不回填普通款。", sourceKey: SOURCES.platinumVer20.key, variantKind: "market_sku" },
    { key: "platinum-3776-travia", name: "#3776 CENTURY Travia Onyx Black", releaseYear: "2026-03", productCode: "PFL-600", notes: "独立新品牌 sibling；FLAF 14K 镀钌尖，142×15 mm、29.3 g，金属握位与 balancer，Converter-700A；首批特别套装 2,000 组。", sourceKey: SOURCES.platinumTravia.key, variantKind: "market_sku" },
  ],
});

export const phase52LamyPlatinumCorePacks: CuratedEntityPack[] = [lamyBrandPack, lamyPack, platinumBrandPack, platinumPack];
