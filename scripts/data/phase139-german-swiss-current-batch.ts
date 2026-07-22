import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE58_FABER_BRAND_ID,
  phase58FaberCastellPacks,
} from "./phase58-faber-castell";
import {
  PHASE42_LAMY_BRAND_ID,
  phase42LamyPlatinumPacks,
} from "./phase42-lamy-platinum";
import { phase25KawecoPacks } from "./phase25-kaweco";

const RETRIEVED = "2026-07-22";

export const PHASE139_BRANDS = {
  faber: PHASE58_FABER_BRAND_ID,
  lamy: PHASE42_LAMY_BRAND_ID,
  kaweco: "mRz7MvzUYwVF",
  schneider: "4RLQzNpb6WbN",
  caran: "phase139-brand-caran-dache",
} as const;

export const PHASE139_IDS = {
  essentio: "phase139-faber-castell-essentio",
  hexo: "phase139-faber-castell-hexo",
  grip: "phase139-faber-castell-grip-2011",
  imporium: "phase139-lamy-imporium",
  abc: "phase139-lamy-abc",
  supra: "phase139-kaweco-supra",
  dia2: "phase139-kaweco-dia2",
  ray: "phase139-schneider-ray",
  leman: "phase139-caran-dache-leman",
} as const;

export const PHASE139_SLUGS = {
  essentio: "faber-castell-essentio",
  hexo: "faber-castell-hexo",
  grip: "faber-castell-grip-2011",
  imporium: "lamy-imporium",
  abc: "lamy-abc",
  supra: "kaweco-supra",
  dia2: "kaweco-dia2",
  ray: "schneider-ray",
  leman: "caran-dache-leman",
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

function image(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase139",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase139",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "Site-original factual SVG; non-photo, non-logo, not to scale and not colour proof.",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  faberFaq: web({ key: "phase139-faber-faq", title: "Faber-Castell fountain pen FAQ", url: "https://www.faber-castell.com/service/frequently-asked-questions/faq-fountain-pens", registry: "faber-official-phase139", name: "Faber-Castell", summary: "Official cartridge, converter, water-cleaning and care guidance." }),
  essentio: web({ key: "phase139-essentio-148420", title: "Essentio Aluminium fountain pen M rose 148420", url: "https://www.faber-castell.com/products/EssentioAluminiumfountainpenMrose/148420", registry: "faber-official-phase139", name: "Faber-Castell", summary: "Exact 148420 Aluminium Rose SKU: anodised aluminium, ergonomic grip, steel M nib, cartridge and separately sold converter." }),
  essentioReview: web({ key: "phase139-essentio-review", title: "Review: Faber-Castell Essentio", url: "https://www.theonlinepencompany.com/blog/review-faber-castell-essentio", registry: "online-pen-company-phase139", name: "The Online Pen Company", sourceType: "retailer", tier: "professional_secondary", summary: "One Essentio sample review used only for handling and posting context." }),
  hexo: web({ key: "phase139-hexo-150540", title: "Hexo fountain pen M blue 150540", url: "https://www.faber-castell.com/products/HexofountainpenMblue/150540", registry: "faber-official-phase139", name: "Faber-Castell", summary: "Exact 150540 Blue M SKU with six-sided aluminium body, steel nib and cartridge/converter system." }),
  hexoPress: web({ key: "phase139-hexo-press", title: "Faber-Castell HEXO press information", url: "https://www.faber-castell.com/service/press/hexo", registry: "faber-official-phase139", name: "Faber-Castell", tier: "contemporary_archive", summary: "Official design and product-family context; regional colour timing is not a universal launch date." }),
  hexoReview: web({ key: "phase139-hexo-review", title: "Faber-Castell HEXO Fountain Pen Review", url: "https://www.penaddict.com/blog/2020/9/23/faber-castell-hexo-fountain-pen-review", registry: "pen-addict-phase139", name: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", publishedAt: "2020-09-23", summary: "Independent review of one HEXO sample; handling observations do not replace current SKU fields." }),
  grip: web({ key: "phase139-grip-140900", title: "Grip 2011 fountain pen M silver 140900", url: "https://www.faber-castell.com/products/Grip2011fountainpenMsilver/140900", registry: "faber-official-phase139", name: "Faber-Castell", summary: "Exact 140900 Silver M SKU with triangular grip, soft-grip dots, steel nib and cartridge/converter filling." }),
  gripSeries: web({ key: "phase139-grip-series", title: "Faber-Castell Grip fountain pen", url: "https://www.faber-castell.com/grip-fountain-pen", registry: "faber-official-phase139", name: "Faber-Castell", summary: "Official Grip fountain-pen family context and colour/edition boundary." }),
  gripReview: web({ key: "phase139-grip-review", title: "Faber-Castell Grip 2011 Fountain Pen Review", url: "https://www.pencilcaseblog.com/2020/07/review-faber-castell-grip-2011-fountain.html", registry: "pencilcase-phase139", name: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", summary: "Independent sample review used for grip and everyday-use context only." }),
  lamyCare: web({ key: "phase139-lamy-care", title: "LAMY fountain pen care tips", url: "https://www.lamy.com/en-us/care-tips/fountain-pens", registry: "lamy-official-phase139", name: "LAMY", summary: "Official fountain-pen cleaning, cartridge and converter care guidance." }),
  imporium: web({ key: "phase139-imporium-4027926", title: "LAMY imporium fountain pen", url: "https://www.lamy.com/en-us/p/lamy-imporium-fountain-pen", registry: "lamy-official-phase139", name: "LAMY", summary: "Current Black-Gold 4027926: PVD body, screw cap, 14 ct bicolour nib, T10/Z27, 142.2 mm and 54 g." }),
  imporiumReview: web({ key: "phase139-imporium-review", title: "LAMY Imporium Fountain Pen Review", url: "https://www.pencilcaseblog.com/2016/04/lamy-imporium-fountain-pen-review.html", registry: "pencilcase-phase139", name: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", summary: "Independent review of one imporium sample used for weight and handling context only." }),
  abc: web({ key: "phase139-abc-l09bka", title: "LAMY abc fountain pen", url: "https://www.lamy.com/en-us/p/lamy-abc-fountain-pen", registry: "lamy-official-phase139", name: "LAMY", summary: "Current Black L09BKA: maple body, ergonomic grip, A/LH steel nib, T10/Z28, 133 mm and 12 g; official history uses an 1980s boundary." }),
  abcReview: web({ key: "phase139-abc-review", title: "LAMY abc Fountain Pen Review", url: "https://www.penaddict.com/blog/2025/4/28/lamy-abc-fountain-pen-review", registry: "pen-addict-phase139", name: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", publishedAt: "2025-04-28", summary: "Independent Black A sample review used only for sample-specific grip and writing observations." }),
  kawecoManual: web({ key: "phase139-kaweco-manual", title: "Kaweco HOW TO REFILL, CHANGE & USE", url: "https://kaweco-pen.com/files/catalog/How%20to%20refill%2C%20change%2C%20use....pdf", registry: "kaweco-official-phase139", name: "Kaweco", tier: "contemporary_archive", summary: "Official general refill and cleaning instructions; exact compatibility remains product scoped." }),
  kawecoConverter: web({ key: "phase139-kaweco-standard-converter", title: "Kaweco Converter Standard", url: "https://www.kaweco-pen.com/en/Kaweco-Converter-Standard-Pearl-Black-Chrome/10001955/", registry: "kaweco-official-phase139", name: "Kaweco", summary: "Official standard converter page lists Supra and DIA2 compatibility." }),
  supra: web({ key: "phase139-supra-black-f", title: "Kaweco SUPRA Fountain Pen Black F", url: "https://www.kaweco-pen.com/en/Kaweco-SUPRA-Fountain-Pen-Black-F/11000107/", registry: "kaweco-official-phase139", name: "Kaweco", summary: "Exact black aluminium F SKU: 129/164 mm, 12.4 mm, 20 g and 250 steel nib." }),
  supraSeries: web({ key: "phase139-supra-series", title: "Kaweco SUPRA series", url: "https://www.kaweco-pen.com/en/Series/SUPRA/", registry: "kaweco-official-phase139", name: "Kaweco", summary: "Official removable-connector concept, 125 to 95 mm body modes and brass, steel and Fireblue material family." }),
  supraReview: web({ key: "phase139-supra-review", title: "Top Brass: the Kaweco Brass Sport and the Kaweco Supra", url: "https://www.gentlemanstationer.com/blog/2016/9/21/top-brass-the-kaweco-brass-sport-and-the-kaweco-supra", registry: "gentleman-stationer-phase139", name: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", publishedAt: "2016-09-21", summary: "Independent brass Supra sample review used for connector, posting and handling context, not Black SKU material." }),
  dia2: web({ key: "phase139-dia2-chrome-f", title: "Kaweco DIA2 Fountain Pen Chrome F", url: "https://www.kaweco-pen.com/en/Kaweco-DIA2-Fountain-Pen-Chrome-F/10000557/", registry: "kaweco-official-phase139", name: "Kaweco", summary: "Exact Chrome F SKU: black PMMA, more than twenty parts, 131/158 mm, 14.2 mm, 26.8 g and EF-BB range." }),
  dia2Series: web({ key: "phase139-dia2-series", title: "Kaweco DIA2 series", url: "https://www.kaweco-pen.com/en/Series/DIA2/", registry: "kaweco-official-phase139", name: "Kaweco", summary: "Official DIA2 family identity and retro full-size product boundary." }),
  dia2Review: web({ key: "phase139-dia2-review", title: "Kaweco DIA2 Fountain Pen Review", url: "https://www.penaddict.com/blog/2014/6/2/kaweco-dia2-fountain-pen-review", registry: "pen-addict-phase139", name: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", publishedAt: "2014-06-02", summary: "Independent DIA2 sample review used for handling context only." }),
  schneiderHistory: web({ key: "phase139-schneider-history", title: "History of our company", url: "https://schneiderpen.com/us/company/who-we-are/history", registry: "schneider-official-phase139", name: "Schneider", summary: "Official chronology: 1938 founding and 1991 Heiko fountain-pen factory acquisition followed by own-brand fountain-pen production." }),
  ray: web({ key: "phase139-ray-168213", title: "Ray pistacchio M+ Fountain pen 168213", url: "https://schneiderpen.com/us/fountain-pen/ray/168213", registry: "schneider-official-phase139", name: "Schneider", summary: "Exact right-handed pistacchio 168213 with M+ steel nib, rubberised ergonomic grip, standard cartridges, converter support and spare front." }),
  rayLeft: web({ key: "phase139-ray-left-front", title: "Ray replacement front part L", url: "https://schneiderpen.com/de/produkte/ersatz-vorderteil-fuer-fuellhalter/ray/168496", registry: "schneider-official-phase139", name: "Schneider", summary: "Official left-handed L replacement front confirms mirrored nib and grip configuration." }),
  rayGuide: web({ key: "phase139-ray-guide", title: "Schneider fountain pen guide", url: "https://www.deutsche-papier.de/schneider-fueller/", registry: "deutsche-papier-phase139", name: "Deutsche Papier", sourceType: "blog", tier: "professional_secondary", summary: "Professional paper guide provides current school/office and left/right selection context; specifications remain official-page scoped." }),
  caranHistory: web({ key: "phase139-caran-history", title: "Caran d'Ache Our History", url: "https://www.carandache.com/gb/en/notre-histoire", registry: "caran-official-phase139", name: "Caran d'Ache", summary: "Official history: Geneva founding in 1915, original Fabrique Genevoise de Crayons name, Caran d'Ache name adopted in 1924 and family-company continuity." }),
  caranMaison: web({ key: "phase139-caran-maison", title: "La Maison Caran d'Ache", url: "https://www.carandache.com/gb/en/la-maison", registry: "caran-official-phase139", name: "Caran d'Ache", summary: "Official Maison and Geneva workshop context for drawing and writing products." }),
  leman: web({ key: "phase139-leman-bleu-marin", title: "Fountain Pen LÉMAN Bleu Marin", url: "https://www.carandache.com/gb/en/fountain-pen-fountain-pen-leman-bleu-marin-p-11384.htm", registry: "caran-official-phase139", name: "Caran d'Ache", summary: "Exact standard Bleu Marin: 141 mm, 14.8 mm, 52 g, brass guillochage and lacquer, 18K rhodium nib and cartridge/piston-pump filling." }),
  lemanSlim: web({ key: "phase139-leman-slim-grand-bleu", title: "Grand Bleu Léman Slim Fountain Pen", url: "https://www.carandache.com/gb/en/fountain-pen-grand-bleu-leman-slim-fountain-pen-p-11462.htm", registry: "caran-official-phase139", name: "Caran d'Ache", summary: "Exact Slim sibling: 141 mm, 10.6 mm and 38 g; these dimensions must not replace the standard model." }),
  lemanReview: web({ key: "phase139-leman-klein-blue-review", title: "Introducing the Caran d'Ache Léman Fountain Pen in Klein Blue", url: "https://www.gentlemanstationer.com/blog/2021/2/6/introducing-the-caran-dache-lman-fountain-pen-in-klein-blue-lacquer", registry: "gentleman-stationer-phase139", name: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", publishedAt: "2021-02-06", summary: "Independent Klein Blue sample context; its finish and impressions do not define current Bleu Marin fields." }),
} as const;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

interface ModelDefinition {
  key: keyof typeof PHASE139_IDS;
  name: string;
  brandId: string;
  file: string;
  imagePath: string;
  primary: CuratedSource;
  sources: CuratedSource[];
  aliases: string[];
  story: string;
  boundary: string;
  values: Record<string, string>;
  variants?: Array<{ name: string; code?: string; notes: string; source: CuratedSource }>;
}

function makeModel(def: ModelDefinition): CuratedEntityPack {
  const scopeKey = `phase139-${def.key}-current`;
  const diagram = image(`phase139-${def.key}-diagram`, `${def.name} factual diagram`, def.imagePath);
  const sources = [...def.sources, diagram].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
  const boundarySource = def.sources.find((source) => source.tier === "professional_secondary") ?? def.sources[1] ?? def.primary;
  return {
    key: `phase139-${def.key}-v1`,
    entityId: PHASE139_IDS[def.key],
    expectedType: "pen",
    expectedSlug: PHASE139_SLUGS[def.key],
    canonicalName: def.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: def.file,
    storyTitle: def.story,
    primarySourceKey: def.primary.key,
    depthTier: "A",
    aliases: def.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: def.primary.key })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, validFrom: RETRIEVED, productionState: "current", nibScope: "Exact current product/SKU field; regional choices remain scoped.", materialScope: "Exact current product/SKU material; sibling materials do not inherit.", editionScope: def.boundary }],
    claims: [
      { key: `phase139-${def.key}-identity`, predicate: "model_identity", objectText: `${def.name} is a distinct fountain-pen model represented by the exact current official product scope.`, factClass: "core", confidence: 0.99, sourceKey: def.primary.key, locator: def.primary.summary, evidence: [{ key: `phase139-${def.key}-identity-evidence`, sourceKey: def.primary.key, scopeKey, locator: def.primary.summary }] },
      { key: `phase139-${def.key}-boundary`, predicate: "version_boundary", objectText: def.boundary, factClass: "core", confidence: 0.98, sourceKey: boundarySource.key, locator: "Official family or independent sample boundary; no cross-SKU inheritance.", evidence: [{ key: `phase139-${def.key}-boundary-evidence`, sourceKey: boundarySource.key, scopeKey, locator: "Model, material, market and reviewed-sample boundary." }] },
    ],
    variants: (def.variants ?? []).map((variant, index) => ({ key: `phase139-${def.key}-variant-${index + 1}`, name: variant.name, productCode: variant.code, notes: variant.notes, sourceKey: variant.source.key, variantKind: "market_sku" })),
    spec: {
      brandEntityId: def.brandId,
      values: def.values,
      evidence: [evidence("brand_entity_id", `phase139-${def.key}-spec-brand`, def.primary.key, scopeKey, "official maker identity"), ...Object.keys(def.values).map((field) => evidence(field as SpecFieldKey, `phase139-${def.key}-spec-${field}`, def.primary.key, scopeKey, `exact product ${field} field or explicit unasserted boundary`))],
    },
    timeline: [{ key: `phase139-${def.key}-verified`, title: `${def.name} current listing verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Current exact product identity and specification boundary verified; retrieval date is not asserted as launch date.", sourceKey: def.primary.key }],
    media: [{ key: `phase139-${def.key}-primary`, title: `${def.name} 事实图（非产品照片）`, sourceKey: diagram.key, localPath: def.imagePath, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创事实示意图；非产品照片、非商标、非比例或色准证明。", sourceUrl: def.imagePath, usageStatus: "primary" }],
  };
}

export const phase139NewModelPacks: CuratedEntityPack[] = [
  makeModel({ key: "essentio", name: "Faber-Castell Essentio", brandId: PHASE139_BRANDS.faber, file: ".planning/content-research/faber-castell-essentio-phase139.md", imagePath: "/images/library/site-original/phase139/faber-castell/essentio.svg", primary: S.essentio, sources: [S.essentio, S.faberFaq, S.essentioReview], aliases: ["Faber-Castell Essentio", "辉柏嘉 Essentio"], story: "Essentio：细长铝杆、钢尖与材质 SKU 边界", boundary: "148420 Aluminium Rose is the current specification anchor; Carbon, Black and other material siblings do not inherit its material, weight or finish.", values: { series_name: "Faber-Castell Essentio", release_year: "launch year not asserted; current 148420 listing verified 2026-07-22", nib: "148420 M steel nib; other widths by exact SKU", fill_system: "cartridge/converter; 148420 cartridge included and converter separate", material: "148420 anodised aluminium body and grip", dimensions: "no cross-material official unified dimensions asserted", weight: "no cross-material unified weight asserted", status: "current official product page accessible; regional stock varies" } }),
  makeModel({ key: "hexo", name: "Faber-Castell HEXO", brandId: PHASE139_BRANDS.faber, file: ".planning/content-research/faber-castell-hexo-phase139.md", imagePath: "/images/library/site-original/phase139/faber-castell/hexo.svg", primary: S.hexo, sources: [S.hexo, S.hexoPress, S.hexoReview, S.faberFaq], aliases: ["Faber-Castell HEXO", "Faber-Castell Hexo", "辉柏嘉 HEXO"], story: "HEXO：六角铝杆、地区颜色与在售边界", boundary: "150540 Blue M anchors current fields; Bronze launch timing, regional stock and community discontinuation reports do not redefine the whole series.", values: { series_name: "Faber-Castell HEXO", release_year: "Blue/Bronze regional availability documented from 2021; no universal launch date asserted", nib: "150540 M steel nib; other widths by exact SKU", fill_system: "cartridge/converter", material: "150540 aluminium six-sided body", dimensions: "official 150540 page does not provide a universal family measurement", weight: "no universal family weight asserted", status: "official product page accessible; regional stock varies" } }),
  makeModel({ key: "grip", name: "Faber-Castell Grip 2011", brandId: PHASE139_BRANDS.faber, file: ".planning/content-research/faber-castell-grip-2011-phase139.md", imagePath: "/images/library/site-original/phase139/faber-castell/grip-2011.svg", primary: S.grip, sources: [S.grip, S.gripSeries, S.gripReview, S.faberFaq], aliases: ["Faber-Castell Grip 2011", "辉柏嘉 Grip 2011"], story: "Grip 2011：三角握区、软点与学生线身份", boundary: "140900 Silver M anchors fields; Pearl editions, colours and Grip writing siblings remain variants or separate writing modes.", values: { series_name: "Faber-Castell Grip 2011 fountain pen", release_year: "series chronology not asserted from product number", nib: "140900 M steel nib; other widths by exact SKU", fill_system: "cartridge/converter", material: "140900 plastic body with soft-grip dots and triangular grip", dimensions: "no universal official family measurement asserted", weight: "no universal official family weight asserted", status: "current official product and family pages accessible" } }),
  makeModel({ key: "imporium", name: "LAMY imporium", brandId: PHASE139_BRANDS.lamy, file: ".planning/content-research/lamy-imporium-phase139.md", imagePath: "/images/library/site-original/phase139/lamy/imporium.svg", primary: S.imporium, sources: [S.imporium, S.lamyCare, S.imporiumReview], aliases: ["LAMY imporium", "LAMY Imporium", "凌美 imporium"], story: "LAMY imporium：14K 金尖、螺纹帽与 54 g 旗舰边界", boundary: "Black-Gold 4027926 anchors current dimensions and weight; Titanium, Black and other finishes keep separate SKU fields.", values: { series_name: "LAMY imporium", release_year: "current 4027926 listing verified; launch year not asserted", nib: "4027926 bicolour 14 ct gold nib", fill_system: "LAMY T10 cartridge and Z27 converter", material: "4027926 PVD-finished body with black-gold configuration", dimensions: "4027926 length 142.2 mm", weight: "4027926 54 g", status: "current official product page" } }),
  makeModel({ key: "abc", name: "LAMY abc", brandId: PHASE139_BRANDS.lamy, file: ".planning/content-research/lamy-abc-phase139.md", imagePath: "/images/library/site-original/phase139/lamy/abc.svg", primary: S.abc, sources: [S.abc, S.lamyCare, S.abcReview], aliases: ["LAMY abc", "LAMY ABC", "凌美 abc"], story: "LAMY abc：枫木习字系统与 A／LH 配置", boundary: "Black L09BKA anchors current fields; 1980s education-market history is not converted to an exact universal launch date.", values: { series_name: "LAMY abc", release_year: "official education-market history uses the 1980s boundary", nib: "L09BKA A or LH polished steel nib", fill_system: "LAMY T10 cartridge; Z28 converter recommended", material: "maple body, ergonomic grip, plastic cap and roll-stop", dimensions: "L09BKA 13 × 13 × 133 mm", weight: "L09BKA 12 g", status: "current official product page" }, variants: [{ name: "A nib", notes: "Current beginner nib option; exact line width not converted to a universal millimetre value.", source: S.abc }, { name: "LH nib", notes: "Current left-handed option; individual grip and writing posture still require trial.", source: S.abc }] }),
  makeModel({ key: "supra", name: "Kaweco Supra", brandId: PHASE139_BRANDS.kaweco, file: ".planning/content-research/kaweco-supra-phase139.md", imagePath: "/images/library/site-original/phase139/kaweco/supra.svg", primary: S.supra, sources: [S.supra, S.supraSeries, S.kawecoConverter, S.kawecoManual, S.supraReview], aliases: ["Kaweco Supra", "KAWECO SUPRA", "Kaweco Supra 百变"], story: "Kaweco Supra：可拆中接与 250 尖的两段比例", boundary: "Current Black aluminium F anchors 129/164 mm and 20 g; brass, steel, Fireblue and the reviewed brass sample do not inherit those values.", values: { series_name: "Kaweco SUPRA", release_year: "current listing verified; launch year not asserted", nib: "Black F SKU uses 250 steel nib; EF-BB by exact selection", fill_system: "standard international cartridge / Kaweco Standard Converter", material: "Black SKU aluminium; brass, steel and Fireblue are separate material variants", dimensions: "Black F 129 mm closed / 164 mm posted, diameter 12.4 mm; removable body connector", weight: "Black F 20 g", status: "current official series and product pages" } }),
  makeModel({ key: "dia2", name: "Kaweco DIA2", brandId: PHASE139_BRANDS.kaweco, file: ".planning/content-research/kaweco-dia2-phase139.md", imagePath: "/images/library/site-original/phase139/kaweco/dia2.svg", primary: S.dia2, sources: [S.dia2, S.dia2Series, S.kawecoConverter, S.kawecoManual, S.dia2Review], aliases: ["Kaweco DIA2", "KAWECO DIA2", "Kaweco Dia 2"], story: "Kaweco DIA2：黑色 PMMA、多零件结构与 060 尖边界", boundary: "Chrome F 10000557 anchors the current fields; Gold trim and historical Dia pens do not automatically share dimensions, nib or status.", values: { series_name: "Kaweco DIA2", release_year: "current listing verified; historical Dia chronology not asserted as current launch", nib: "Chrome F SKU steel nib; EF-BB selection, 060 replacement family by exact compatibility", fill_system: "standard international cartridge / Kaweco Standard Converter", material: "black PMMA with chrome trim; more than twenty parts", dimensions: "131 mm closed / 158 mm posted, diameter 14.2 mm", weight: "26.8 g", status: "current official series and product pages" } }),
  makeModel({ key: "ray", name: "Schneider Ray", brandId: PHASE139_BRANDS.schneider, file: ".planning/content-research/schneider-ray-phase139.md", imagePath: "/images/library/site-original/phase139/schneider/ray.svg", primary: S.ray, sources: [S.ray, S.rayLeft, S.rayGuide], aliases: ["Schneider Ray", "施耐德 Ray"], story: "Schneider Ray：右手 M+、左手 L 与可换前端", boundary: "Pistacchio right-handed 168213 anchors current fields; L changes both nib and grip, while colours and unavailable regional options remain variants.", values: { series_name: "Schneider Ray fountain pen", release_year: "current listing verified; launch year not asserted", nib: "168213 right-handed M+ steel nib with iridium tip; separate left-handed L front", fill_system: "standard cartridges and piston converter; 168213 includes one royal-blue cartridge", material: "rubberised ergonomic grip, plastic body and metal clip", dimensions: "official 168213 page does not state dimensions", weight: "official 168213 page does not state weight", status: "current official product page; regional colours and handedness vary" }, variants: [{ name: "Right-handed M+ 168213", code: "168213", notes: "Current pistacchio right-handed configuration.", source: S.ray }, { name: "Left-handed L front 168496", code: "168496", notes: "Mirrored nib and grip replacement front; not only a nib-width change.", source: S.rayLeft }] }),
  makeModel({ key: "leman", name: "Caran d’Ache Léman", brandId: PHASE139_BRANDS.caran, file: ".planning/content-research/caran-dache-leman-phase139.md", imagePath: "/images/library/site-original/phase139/caran-dache/leman.svg", primary: S.leman, sources: [S.leman, S.lemanSlim, S.caranHistory, S.lemanReview], aliases: ["Caran d’Ache Léman", "Caran d'Ache Leman", "卡达 Léman"], story: "Caran d’Ache Léman：标准 Bleu Marin 与 Slim 尺寸分流", boundary: "Standard Bleu Marin anchors 141 mm, 14.8 mm and 52 g; Slim Grand Bleu is 10.6 mm and 38 g, while Klein Blue review observations remain sample scoped.", values: { series_name: "Caran d’Ache LÉMAN fountain pen", release_year: "current Bleu Marin listing verified; model launch year not asserted", nib: "hand-polished 18K rhodium-coated nib; current regional choices vary", fill_system: "cartridge and piston-pump converter; current page lists converter and two cartridges", material: "round brass body, milled guillochage, translucent navy lacquer and rhodium-coated trim", dimensions: "standard Bleu Marin 141 mm × 14.8 mm; Slim Grand Bleu 141 mm × 10.6 mm", weight: "standard Bleu Marin 52 g; Slim Grand Bleu 38 g", status: "current official product page; region and nib stock vary" }, variants: [{ name: "Standard Bleu Marin", code: "4799.159/169/179 by nib", notes: "Standard 14.8 mm and 52 g configuration.", source: S.leman }, { name: "Léman Slim Grand Bleu", notes: "Slim sibling at 10.6 mm and 38 g; retained as a separate version boundary.", source: S.lemanSlim }] }),
];

function existingBrand(packs: CuratedEntityPack[], id: string, key: string): CuratedEntityPack {
  const pack = packs.find((candidate) => candidate.expectedType === "brand" && candidate.entityId === id);
  if (!pack) throw new Error(`Phase 139 prerequisite brand pack missing: ${id}`);
  const clone = structuredClone(pack);
  clone.key = key;
  return clone;
}

const faberBrand = existingBrand(phase58FaberCastellPacks, PHASE139_BRANDS.faber, "phase139-faber-brand-v2");
faberBrand.sources.push(S.essentio, S.hexo, S.grip);
faberBrand.claims.push({ key: "phase139-faber-navigation", predicate: "series_navigation", objectText: "Essentio, HEXO and Grip 2011 are separate model nodes alongside the previously curated Faber-Castell and Graf von Faber-Castell series.", factClass: "core", confidence: 0.99, sourceKey: S.hexo.key, locator: "Official exact product identities", evidence: [{ key: "phase139-faber-navigation-evidence", sourceKey: S.hexo.key, scopeKey: faberBrand.scopes[0]!.key, locator: "HEXO exact product identity; Essentio and Grip exact sources are stored on the brand pack." }] });

const lamyBrand = existingBrand(phase42LamyPlatinumPacks, PHASE139_BRANDS.lamy, "phase139-lamy-brand-v2");
lamyBrand.sources.push(S.imporium, S.abc);
lamyBrand.claims.push({ key: "phase139-lamy-navigation", predicate: "series_navigation", objectText: "imporium and abc are distinct current LAMY fountain-pen models with different nib, material, weight and intended-use boundaries.", factClass: "core", confidence: 0.99, sourceKey: S.imporium.key, locator: "Official exact current product pages", evidence: [{ key: "phase139-lamy-navigation-evidence", sourceKey: S.imporium.key, scopeKey: lamyBrand.scopes[0]!.key, locator: "imporium exact identity; abc exact source is stored on the brand pack." }] });

const kawecoBrand = existingBrand(phase25KawecoPacks, PHASE139_BRANDS.kaweco, "phase139-kaweco-brand-v2");
kawecoBrand.sources.push(S.supra, S.supraSeries, S.dia2, S.dia2Series);
kawecoBrand.claims.push({ key: "phase139-kaweco-navigation", predicate: "series_navigation", objectText: "Supra and DIA2 are separate current models outside the Sport family: Supra uses a removable connector, while DIA2 is a full-size black PMMA multi-part pen.", factClass: "core", confidence: 0.99, sourceKey: S.supraSeries.key, locator: "Official separate series and exact product pages", evidence: [{ key: "phase139-kaweco-navigation-evidence", sourceKey: S.supraSeries.key, scopeKey: kawecoBrand.scopes.find((scope) => scope.productionState === "current")?.key ?? kawecoBrand.scopes[0]!.key, locator: "Supra series identity; DIA2 sources are stored on the brand pack." }] });

function newBrand(input: {
  key: string;
  id: string;
  slug: string;
  name: string;
  file: string;
  story: string;
  aliases: string[];
  primary: CuratedSource;
  sources: CuratedSource[];
  imagePath: string;
  origin: { date: string; title: string; description: string };
  milestone: { date: string; title: string; description: string };
}): CuratedEntityPack {
  const scopeKey = `phase139-${input.key}-brand`;
  const diagram = image(`phase139-${input.key}-brand-diagram`, `${input.name} brand navigation diagram`, input.imagePath);
  const navigationSource = input.sources.find((source) => source.tier === "professional_secondary") ?? input.sources[1] ?? input.primary;
  return {
    key: `phase139-${input.key}-brand-v1`, entityId: input.id, expectedType: "brand", expectedSlug: input.slug, canonicalName: input.name,
    publicationIntent: "publish", publicationBlockers: [], markdownFile: input.file, storyTitle: input.story, primarySourceKey: input.primary.key, depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primary.key })),
    sources: [...input.sources, diagram], scopes: [{ key: scopeKey, scopeKey, productionState: "current", editionScope: "Brand history and model navigation; exact model specifications remain on model pages." }],
    claims: [{ key: `phase139-${input.key}-identity`, predicate: "brand_identity", objectText: input.origin.description, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [{ key: `phase139-${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: input.primary.summary }] }, { key: `phase139-${input.key}-navigation`, predicate: "series_navigation", objectText: "The brand page separates fountain-pen models from other writing modes, colours, accessories and replacement parts.", factClass: "core", confidence: 0.99, sourceKey: navigationSource.key, locator: "Official product navigation and professional model boundary", evidence: [{ key: `phase139-${input.key}-navigation-evidence`, sourceKey: navigationSource.key, scopeKey, locator: "Product-category and exact model separation." }] }],
    timeline: [{ key: `phase139-${input.key}-origin`, title: input.origin.title, eventType: "brand_founded", startDate: input.origin.date, circa: false, description: input.origin.description, sourceKey: input.primary.key }, { key: `phase139-${input.key}-milestone`, title: input.milestone.title, eventType: "design_milestone", startDate: input.milestone.date, circa: false, description: input.milestone.description, sourceKey: input.primary.key }],
    media: [{ key: `phase139-${input.key}-brand-primary`, title: `${input.name} 品牌导航事实图（非产品照片）`, sourceKey: diagram.key, localPath: input.imagePath, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创品牌导航事实图；非产品照片、非商标复刻。", sourceUrl: input.imagePath, usageStatus: "primary" }],
  };
}

const schneiderBrand = newBrand({ key: "schneider", id: PHASE139_BRANDS.schneider, slug: "schneider", name: "施耐德 Schneider", file: ".planning/content-research/schneider-brand-phase139.md", story: "Schneider：1938 企业史、钢笔生产与 Ray 导航", aliases: ["Schneider", "施耐德", "Schneider Schreibgeräte"], primary: S.schneiderHistory, sources: [S.schneiderHistory, S.ray, S.rayGuide], imagePath: "/images/library/site-original/phase139/schneider/schneider.svg", origin: { date: "1938", title: "Blum & Schneider OHG 成立", description: "官方公司史记录 Christian Schneider 与 Erwin Blum 于 1938 年在黑森林 Tennenbronn 创立企业。" }, milestone: { date: "1991", title: "收购 Heiko 钢笔工厂", description: "官方年表记录 1991 年签署 Heiko 钢笔工厂收购协议，随后开始以 Schneider 品牌生产墨水笔和钢笔。" } });
const caranBrand = newBrand({ key: "caran-dache", id: PHASE139_BRANDS.caran, slug: "caran-dache", name: "Caran d’Ache", file: ".planning/content-research/caran-dache-brand-phase139.md", story: "Caran d’Ache：1915 日内瓦起点、1924 名称与 Léman 导航", aliases: ["Caran d'Ache", "Caran d’Ache", "卡达"], primary: S.caranHistory, sources: [S.caranHistory, S.caranMaison, S.leman, S.lemanReview], imagePath: "/images/library/site-original/phase139/caran-dache/caran-dache.svg", origin: { date: "1915", title: "日内瓦企业起点", description: "官方历史把 Fabrique Genevoise de Crayons 的日内瓦创立放在 1915 年。" }, milestone: { date: "1924", title: "采用 Caran d’Ache 名称", description: "官方历史记录企业在 1924 年由原名改称 Caran d’Ache。" } });

const models = Object.fromEntries(phase139NewModelPacks.map((pack) => [pack.entityId, pack]));
function model(id: string): CuratedEntityPack {
  const pack = models[id];
  if (!pack) throw new Error(`Phase 139 model pack missing: ${id}`);
  return pack;
}

export const phase139Groups: Array<{ brand: CuratedEntityPack; pens: CuratedEntityPack[] }> = [
  { brand: faberBrand, pens: [model(PHASE139_IDS.essentio), model(PHASE139_IDS.hexo), model(PHASE139_IDS.grip)] },
  { brand: lamyBrand, pens: [model(PHASE139_IDS.imporium), model(PHASE139_IDS.abc)] },
  { brand: kawecoBrand, pens: [model(PHASE139_IDS.supra), model(PHASE139_IDS.dia2)] },
  { brand: schneiderBrand, pens: [model(PHASE139_IDS.ray)] },
  { brand: caranBrand, pens: [model(PHASE139_IDS.leman)] },
];

export const phase139AllPacks = phase139Groups.flatMap((group) => [group.brand, ...group.pens]);

export function loadPhase139Packs(workspaceRoot: string): LoadedCuratedEntityPack[] {
  return phase139AllPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
}
