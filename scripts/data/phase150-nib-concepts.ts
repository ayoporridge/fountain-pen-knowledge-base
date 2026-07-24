import type { CuratedSource } from "../lib/curated-content-pack";

export const PHASE150_RETRIEVED = "2026-07-24";
const MARKDOWN = ".planning/content-research/nib-concepts-phase150.md";

export interface NibConceptDefinition {
  key: string;
  entityId: string;
  expectedSlug: string;
  expectedName: string;
  sectionKey: string;
  sources: CuratedSource[];
  imagePath: string;
  imageTitle: string;
}

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    ...input,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: PHASE150_RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${PHASE150_RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase150",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase150",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: PHASE150_RETRIEVED,
    summary: "本站原创 factual SVG；用于解释笔尖结构或材料边界，非产品照片，不作为真实比例、颜色、库存或型号证明。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  wikipedia: web({ key: "phase150-wikipedia-nib", title: "Wikipedia: Nib (pen)", url: "https://en.wikipedia.org/wiki/Nib_(pen)", registryKey: "wikipedia-phase150-nib", registryName: "Wikipedia contributors", sourceType: "wikimedia", tier: "professional_secondary", independenceGroup: "wikipedia-phase150", summary: "用于交叉核对钢、金、钛弹片与 tipping 的基本材料边界；具体型号仍回到制造商资料。", locator: "Nib materials and tipping section; steel, gold, titanium and platinum-group tipping distinction" }),
  platinum: web({ key: "phase150-platinum-catalog", title: "Platinum 2019–2020 official catalogue", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf", registryKey: "platinum-official-catalog-phase150", registryName: "Platinum Pen official", sourceType: "official", tier: "primary", independenceGroup: "platinum-official-phase150", summary: "官方目录将 K18 金尖、不锈钢尖和铱粒点尖作为不同路线呈现，用于防止把金色或 iridium 俗称当作同一材料。", locator: "Nib material and historical cartridge/tipping notes in official catalogue" }),
  fink: web({ key: "phase150-stefan-fink-nib", title: "Stefan Fink: The Fink Nib", url: "https://www.stefanfink.de/en/writing-instruments/the-fink-nib", registryKey: "stefan-fink-phase150", registryName: "Stefan Fink", sourceType: "official", tier: "primary", independenceGroup: "stefan-fink-phase150", summary: "制笔工坊资料把 18K 金、铑镀金、钛和不锈钢列为不同笔尖材料，支持材料字段分离。", locator: "Material list: 18-carat gold, rhodium-plated gold, titanium and stainless steel" }),
  niborium: web({ key: "phase150-niborium-shapes", title: "Niborium: How to Identify Vintage Fountain Pens", url: "https://niborium.org/learn/how-to-identify-vintage-fountain-pens", registryKey: "niborium-phase150", registryName: "Niborium", sourceType: "blog", tier: "professional_secondary", independenceGroup: "niborium-phase150", summary: "钢笔识别资料区分 open nib、hooded nib 及其他形制，并强调结合笔杆、夹子和上墨系统。", locator: "Open nib and hooded nib identification guidance; shape is not material or identity alone" }),
  richardMaterials: web({ key: "phase150-richard-materials", title: "Richard's Pens: Nib materials", url: "https://www.richardspens.com/ref/nibs/materials.htm", registryKey: "richards-pens-phase150", registryName: "Richard's Pens", sourceType: "blog", tier: "professional_secondary", independenceGroup: "richards-pens-phase150", summary: "维修与笔尖资料用于解释金、钢、钛的材料差异和手感不能只由材质决定。", locator: "Nib material discussion and cautions against equating material with flexibility" }),
  richardTipping: web({ key: "phase150-richard-tipping", title: "Richard's Pens: Nib tipping", url: "https://www.richardspens.com/ref/nibs/tipping.htm", registryKey: "richards-pens-phase150", registryName: "Richard's Pens", sourceType: "blog", tier: "professional_secondary", independenceGroup: "richards-pens-phase150", summary: "笔尖维修资料解释 tipping 的耐磨作用与 iridium 俗称边界。", locator: "Tipping alloy, historical iridium terminology and wear-point explanation" }),
  tppen: web({ key: "phase150-ttpen-hooded-example", title: "TTPEN: HongDian 618 hooded nib example", url: "https://www.ttpen.com/products/hongdian-618-hooded-nib-fountain-pen-0-38mm-iridium-nib-converter-cartridge", registryKey: "ttpen-phase150-nib-example", registryName: "TTPEN", sourceType: "retailer", tier: "contemporary_archive", independenceGroup: "ttpen-phase150", summary: "当代商品页作为暗尖与 iridium 俗称的具体边界样本，不外推到所有暗尖。", locator: "Hooded nib and 0.38mm iridium-tipped wording on one HongDian 618 listing" }),
  goldDiagram: diagram("phase150-gold-diagram", "Gold nib material boundary factual diagram", "/images/library/site-original/phase150/nibs/gold-nib.svg"),
  steelDiagram: diagram("phase150-steel-diagram", "Steel nib material boundary factual diagram", "/images/library/site-original/phase150/nibs/steel-nib.svg"),
  titaniumDiagram: diagram("phase150-titanium-diagram", "Titanium nib material boundary factual diagram", "/images/library/site-original/phase150/nibs/titanium-nib.svg"),
  iridiumDiagram: diagram("phase150-iridium-diagram", "Nib tipping boundary factual diagram", "/images/library/site-original/phase150/nibs/iridium-nib.svg"),
  openDiagram: diagram("phase150-open-diagram", "Open nib shape factual diagram", "/images/library/site-original/phase150/nibs/open-nib.svg"),
  hoodedDiagram: diagram("phase150-hooded-diagram", "Hooded nib shape factual diagram", "/images/library/site-original/phase150/nibs/hooded-nib.svg"),
  semiDiagram: diagram("phase150-semi-diagram", "Semi-hooded nib shape factual diagram", "/images/library/site-original/phase150/nibs/semi-hooded-nib.svg"),
} as const;

export const phase150NibConcepts: NibConceptDefinition[] = [
  { key: "phase150-gold-nib", entityId: "rcyhCSbAfjM3", expectedSlug: "gold-nib", expectedName: "金尖", sectionKey: "gold-nib", sources: [S.platinum, S.wikipedia, S.richardMaterials, S.goldDiagram], imagePath: "/images/library/site-original/phase150/nibs/gold-nib.svg", imageTitle: "金尖材料边界事实示意图" },
  { key: "phase150-steel-nib", entityId: "9vUWy7YhiL3W", expectedSlug: "steel-nib", expectedName: "钢尖", sectionKey: "steel-nib", sources: [S.fink, S.wikipedia, S.richardMaterials, S.steelDiagram], imagePath: "/images/library/site-original/phase150/nibs/steel-nib.svg", imageTitle: "钢尖材料边界事实示意图" },
  { key: "phase150-titanium-nib", entityId: "sWKs7mBIQiuo", expectedSlug: "titanium-nib", expectedName: "钛尖", sectionKey: "titanium-nib", sources: [S.fink, S.wikipedia, S.richardMaterials, S.titaniumDiagram], imagePath: "/images/library/site-original/phase150/nibs/titanium-nib.svg", imageTitle: "钛尖材料边界事实示意图" },
  { key: "phase150-iridium-nib", entityId: "b91QvquyVqcU", expectedSlug: "iridium-nib", expectedName: "铱粒点尖", sectionKey: "iridium-nib", sources: [S.richardTipping, S.wikipedia, S.platinum, S.iridiumDiagram], imagePath: "/images/library/site-original/phase150/nibs/iridium-nib.svg", imageTitle: "铱粒点尖术语边界事实示意图" },
  { key: "phase150-open-nib", entityId: "vCvOFoDMsP8U", expectedSlug: "open-nib", expectedName: "明尖", sectionKey: "open-nib", sources: [S.niborium, S.wikipedia, S.openDiagram], imagePath: "/images/library/site-original/phase150/nibs/open-nib.svg", imageTitle: "明尖形制事实示意图" },
  { key: "phase150-hooded-nib", entityId: "joUC4ZhCkmTh", expectedSlug: "hooded-nib", expectedName: "暗尖", sectionKey: "hooded-nib", sources: [S.niborium, S.tppen, S.wikipedia, S.hoodedDiagram], imagePath: "/images/library/site-original/phase150/nibs/hooded-nib.svg", imageTitle: "暗尖形制事实示意图" },
  { key: "phase150-semi-hooded-nib", entityId: "bic3mrzjjpIp", expectedSlug: "semi-hooded-nib", expectedName: "半明尖", sectionKey: "semi-hooded-nib", sources: [S.niborium, S.wikipedia, S.semiDiagram], imagePath: "/images/library/site-original/phase150/nibs/semi-hooded-nib.svg", imageTitle: "半明尖形制事实示意图" },
];

export { MARKDOWN };
