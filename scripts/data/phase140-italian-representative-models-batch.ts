import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE49_VISCONTI_BRAND_ID,
  phase49ViscontiHomoSapiensPacks,
} from "./phase49-visconti-homo-sapiens";

const RETRIEVED = "2026-07-22";

export const PHASE140_BRANDS = {
  scribo: "phase140-brand-scribo",
  stipula: "phase140-brand-stipula",
  omas: "phase140-brand-current-omas",
  delta: "phase140-brand-current-delta",
  pineider: "phase140-brand-pineider",
  santini: "phase140-brand-santini-italia",
  visconti: PHASE49_VISCONTI_BRAND_ID,
} as const;

export const PHASE140_IDS = {
  feel: "phase140-scribo-feel",
  etruria: "phase140-stipula-etruria-magnifica",
  ogiva: "phase140-current-omas-ogiva",
  dolcevita: "phase140-current-delta-dolcevita-mid-size",
  avatar: "phase140-pineider-avatar-ur",
  libra: "phase140-santini-libra-intenso",
  divina: "phase140-visconti-divina-elegance",
  mirage: "phase140-visconti-mirage-original",
} as const;

export const PHASE140_SLUGS = {
  feel: "scribo-feel",
  etruria: "stipula-etruria-magnifica",
  ogiva: "current-omas-ogiva",
  dolcevita: "current-delta-dolcevita-mid-size",
  avatar: "pineider-avatar-ur",
  libra: "santini-libra-intenso",
  divina: "visconti-divina-elegance",
  mirage: "visconti-mirage-original",
} as const;

function web(input: {
  key: string; title: string; url: string; registry: string; name: string;
  summary: string; sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"]; publishedAt?: string;
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
    registryKey: "fountain-pen-graph-editorial-phase140",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase140",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "Site-original factual SVG; non-photo, non-logo, not-to-scale and non-colour-proof.",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  scribo: web({ key: "phase140-scribo-official", title: "SCRIBO official", url: "https://www.scritturabolognese.com/en/", registry: "scribo-official-phase140", name: "SCRIBO", summary: "Current Bologna maker and writing-instrument navigation." }),
  feel: web({ key: "phase140-feel-official", title: "SCRIBO FEEL Blue Black and Graniglia", url: "https://www.scritturabolognese.com/en/feel/", registry: "scribo-official-phase140", name: "SCRIBO", summary: "Current FEEL identity, twelve-sided body, piston, 14K flexible or 18K regular nib and ebonite feed." }),
  feelReview: web({ key: "phase140-feel-pencilcase", title: "Review: SCRIBO FEEL Fountain Pen", url: "https://www.pencilcaseblog.com/2019/02/review-scribo-feel-fountain-pen.html", registry: "pencilcase-phase140", name: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", publishedAt: "2019-02-24", summary: "One early FEEL loan sample; handling, wet flow and approximate capacity remain sample scoped." }),
  stipula: web({ key: "phase140-stipula-official", title: "Stipula official", url: "https://www.stipula.com/en/", registry: "stipula-official-phase140", name: "Stipula", summary: "Current Florence brand and product navigation." }),
  etruria: web({ key: "phase140-etruria-avorio", title: "Etruria Magnifica Avorio", url: "https://www.stipula.com/en/product-page/etruria-magnifica-avorio-stilo", registry: "stipula-official-phase140", name: "Stipula", summary: "Exact Etruria Magnifica Ivory variant product identity." }),
  etruriaReview: web({ key: "phase140-etruria-fpn", title: "Stipula Etruria Miele Selvatico: A Review", url: "https://www.fountainpennetwork.com/forum/topic/348664-stipula-etruria-miele-selvatico-a-review/", registry: "fpn-phase140-etruria", name: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", publishedAt: "2019-08-17", summary: "Miele Selvatico sample establishes resin, steel-nib and cartridge/converter sample boundary." }),
  omas: web({ key: "phase140-omas-official", title: "OMAS Bologna official", url: "https://www.omasbologna.com/", registry: "omas-current-official-phase140", name: "OMAS Bologna", summary: "Current revival-era OMAS identity; no corporate continuity with pre-2016 OMAS asserted." }),
  ogiva: web({ key: "phase140-ogiva-official", title: "Current OMAS Ogiva", url: "https://www.omasbologna.com/collections/ogiva", registry: "omas-current-official-phase140", name: "OMAS Bologna", summary: "Current Ogiva scope: 151 mm, 14 mm, 39.7 g, 14K nib, ebonite feed and piston." }),
  ogivaRetail: web({ key: "phase140-ogiva-fph", title: "OMAS Ogiva Nera", url: "https://fountainpenhospital.com/collections/shop-all-fountain-pens/products/omas-ogiva-nera-silver-fountain-pen", registry: "fph-phase140", name: "Fountain Pen Hospital", sourceType: "retailer", tier: "professional_secondary", summary: "Current professional retail catalog cross-check; historical OMAS is not used as current specification." }),
  delta: web({ key: "phase140-delta-current", title: "Current Delta writing instruments", url: "https://www.deltapen.it/", registry: "delta-current-official-phase140", name: "Delta", summary: "Current revival-era Delta product identity and maker scope." }),
  dolcevita: web({ key: "phase140-dolcevita-current", title: "Delta Dolcevita Medium", url: "https://www.pens.it/en/products/delta-dolcevita-medium", registry: "pens-it-phase140", name: "Pens.it by Giardino Italiano", sourceType: "retailer", tier: "professional_secondary", summary: "Current two-version listing: steel cartridge/converter/direct and 14K piston." }),
  deltaArchive: web({ key: "phase140-delta-archive", title: "Delta Dolcevita Piston archive", url: "https://www.stilografica.it/approfondimenti/delta-dolcevita-piston-vs-pelikan-m1005-recensione-di-phormula-119.htm", registry: "stilografica-phase140", name: "Casa della Stilografica", sourceType: "blog", tier: "contemporary_archive", summary: "Historical Mid-Size/Piston sample boundary; not a current SKU source." }),
  pineider: web({ key: "phase140-pineider-official", title: "Pineider official", url: "https://www.pineider.com/", registry: "pineider-official-phase140", name: "Pineider", summary: "Current Florence brand and writing-instrument navigation." }),
  avatar: web({ key: "phase140-avatar-official", title: "Pineider Avatar UR fountain pen", url: "https://www.pineider.com/en/products/avatar-ur-fountain-pen-600", registry: "pineider-official-phase140", name: "Pineider", summary: "Standard Avatar UR 600 identity, UltraResin, steel nib, magnetic cap and cartridge/converter scope." }),
  avatarReview: web({ key: "phase140-avatar-wad", title: "Pineider Avatar UR Fountain", url: "https://www.wellappointeddesk.com/2021/05/fountain-pen-review-pineider-avatar-ur-fountain/", registry: "well-appointed-desk-phase140", name: "The Well-Appointed Desk", sourceType: "blog", tier: "professional_secondary", publishedAt: "2021-05-11", summary: "Abalone Green standard steel-nib sample measurements and handling observations." }),
  santini: web({ key: "phase140-santini-official", title: "Santini Italia official", url: "https://www.santini-italia.com/", registry: "santini-official-phase140", name: "Santini Italia", summary: "Current maker, in-house nib and product navigation." }),
  libra: web({ key: "phase140-libra-intenso", title: "Santini Libra Intenso", url: "https://www.santini-italia.com/libra-intenso.html", registry: "santini-official-phase140", name: "Santini Italia", summary: "Exact current acrylic Intenso with 18K nib, ebonite feed and piston." }),
  libraReview: web({ key: "phase140-libra-gentleman", title: "The Libra Fountain Pen from Santini Italia", url: "https://www.gentlemanstationer.com/blog/2023/10/25/pen-review-the-libra-fountain-pen-from-santini-italia", registry: "gentleman-stationer-phase140", name: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", publishedAt: "2023-10-25", summary: "Ebonite Libra loan sample; handling and nib feel do not define acrylic Intenso." }),
  visconti: web({ key: "phase140-visconti-official", title: "Visconti official", url: "https://www.visconti.it/en/", registry: "visconti-official-phase140", name: "Visconti", summary: "Current canonical brand and collection navigation." }),
  divina: web({ key: "phase140-divina-official", title: "Divina Elegance collection", url: "https://www.visconti.it/en/divina-elegance-collection.html", registry: "visconti-official-phase140", name: "Visconti", summary: "Current Divina Elegance collection identity and current configuration boundary." }),
  divinaReview: web({ key: "phase140-divina-penaddict", title: "Visconti Divina Elegance: A Review", url: "https://penaddict.squarespace.com/blog/2017/7/13/visconti-divina-elegance-a-review", registry: "pen-addict-phase140", name: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", publishedAt: "2017-07-14", summary: "2017 green bronze-trim 23K palladium loan sample; historic measurements and nib remain sample scoped." }),
  mirage: web({ key: "phase140-mirage-catalog", title: "Visconti Writing Instruments Collection 2019", url: "https://manuscriptpen.com/pub/media/wysiwyg/visconti_compressed.pdf", registry: "visconti-catalog-2019-phase140", name: "Visconti", tier: "contemporary_archive", summary: "Original Mirage catalog entry, distinct from later Mirage Mythos." }),
  mirageReview: web({ key: "phase140-mirage-gentleman", title: "Visconti Mirage Fountain Pen Review", url: "https://www.gentlemanstationer.com/blog/2019/11/11/pen-review-visconti-mirage-fountain-pen", registry: "gentleman-stationer-phase140", name: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", publishedAt: "2019-11-13", summary: "Original Amber Mirage sample: soft hexagonal resin, magnetic twist cap, small steel nib and C/C." }),
  mythos: web({ key: "phase140-mythos-current", title: "Visconti Mirage Mythos current catalog", url: "https://www.visconti.it/en/mirage-mythos-collection.html", registry: "visconti-official-phase140", name: "Visconti", summary: "Later Mirage Mythos identity; used only as rejected sibling evidence." }),
} as const;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

interface ModelDefinition {
  key: keyof typeof PHASE140_IDS;
  name: string;
  brandId: string;
  file: string;
  imagePath: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extra?: CuratedSource[];
  aliases: string[];
  story: string;
  boundary: string;
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
  variants?: Array<{ name: string; notes: string; source: CuratedSource }>;
}

function makeModel(def: ModelDefinition): CuratedEntityPack {
  const scopeKey = `phase140-${def.key}-scope`;
  const diagram = image(`phase140-${def.key}-diagram`, `${def.name} factual diagram`, def.imagePath);
  const sources = [def.primary, def.secondary, ...(def.extra ?? []), diagram];
  const fields = Object.keys(def.values) as Array<Exclude<SpecFieldKey, "brand_entity_id">>;
  const boundaryCitation = `phase140-${def.key}-boundary-evidence`;
  return {
    key: `phase140-${def.key}-v1`,
    entityId: PHASE140_IDS[def.key],
    expectedType: "pen",
    expectedSlug: PHASE140_SLUGS[def.key],
    canonicalName: def.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: def.file,
    storyTitle: def.story,
    primarySourceKey: def.primary.key,
    depthTier: "A",
    aliases: def.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: def.primary.key })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, validFrom: RETRIEVED, productionState: def.key === "mirage" ? "historical" : "current", nibScope: "Exact SKU/time scope; reviewed sample and sibling nibs do not inherit.", materialScope: "Exact SKU/time scope; sibling materials do not inherit.", editionScope: def.boundary }],
    claims: [
      { key: `phase140-${def.key}-identity`, predicate: "model_identity", objectText: `${def.name} is represented only by its exact official current or archived product scope.`, factClass: "core", confidence: 0.99, sourceKey: def.primary.key, locator: def.primary.summary, evidence: [{ key: `phase140-${def.key}-identity-evidence`, sourceKey: def.primary.key, scopeKey, locator: def.primary.summary }] },
      { key: `phase140-${def.key}-boundary`, predicate: "version_boundary", objectText: def.boundary, factClass: "core", confidence: 0.99, sourceKey: def.secondary.key, locator: def.secondary.summary, evidence: [{ key: boundaryCitation, sourceKey: def.secondary.key, scopeKey, locator: def.secondary.summary }] },
    ],
    variants: (def.variants ?? []).map((variant, index) => ({ key: `phase140-${def.key}-variant-${index + 1}`, name: variant.name, notes: variant.notes, sourceKey: variant.source.key, variantKind: "market_sku" })),
    spec: {
      brandEntityId: def.brandId,
      values: def.values,
      evidence: [
        evidence("brand_entity_id", `phase140-${def.key}-spec-brand`, def.primary.key, scopeKey, "official maker identity"),
        ...fields.map((field) => evidence(field, `phase140-${def.key}-spec-${field}`, def.primary.key, scopeKey, `official exact-scope ${field}`)),
        evidence("dimensions", `phase140-${def.key}-rejected-sibling`, def.secondary.key, scopeKey, "reviewed or historic sibling/sample must not define current dimensions", false),
      ],
    },
    conflicts: [{
      key: `phase140-${def.key}-boundary-conflict`,
      fieldKey: "identity",
      scopeKey,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote: def.boundary,
      members: [
        { citationKey: `phase140-${def.key}-spec-brand`, assertedValue: "exact official scope accepted" },
        { citationKey: `phase140-${def.key}-rejected-sibling`, assertedValue: "sample/sibling scope rejected for current dimensions" },
      ],
    }],
    timeline: [{ key: `phase140-${def.key}-verified`, title: `${def.name} evidence scope verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Retrieval date records verification, not launch.", sourceKey: def.primary.key }],
    media: [{ key: `phase140-${def.key}-primary`, title: `${def.name} 事实图（非产品照片）`, sourceKey: diagram.key, localPath: def.imagePath, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创事实图；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: def.imagePath, usageStatus: "primary" }],
  };
}

const modelPacks: CuratedEntityPack[] = [
  makeModel({ key: "feel", name: "SCRIBO FEEL", brandId: PHASE140_BRANDS.scribo, file: ".planning/content-research/scribo-feel-phase140.md", imagePath: "/images/library/site-original/phase140/scribo/feel.svg", primary: S.feel, secondary: S.feelReview, extra: [S.scribo], aliases: ["SCRIBO FEEL", "Scribo Feel", "SCRIBO Feel"], story: "SCRIBO FEEL：十二面笔身与两条金尖路线", boundary: "Colour SKUs remain separate; the reviewed 18K M sample and pre-2016 OMAS do not define all current FEEL pens.", values: { series_name: "SCRIBO FEEL", release_year: "current listing verified; 2018 production-model context from review", origin_country: "Bologna, Italy current SCRIBO scope", nib: "14K flexible or 18K regular gold nib; width by SKU", fill_system: "piston, official capacity about 1.42 ml", material: "resin/acrylic and finish by exact colour SKU", dimensions: "large twelve-sided body; no cross-colour exact measurement asserted", weight: "no universal current weight asserted", status: "current official product family" }, variants: [{ name: "Blue Black", notes: "Current colour SKU; stock and finish remain page scoped.", source: S.feel }, { name: "Graniglia", notes: "Current colour SKU; does not inherit Blue Black colour or stock.", source: S.feel }] }),
  makeModel({ key: "etruria", name: "Stipula Etruria Magnifica", brandId: PHASE140_BRANDS.stipula, file: ".planning/content-research/stipula-etruria-magnifica-phase140.md", imagePath: "/images/library/site-original/phase140/stipula/etruria-magnifica.svg", primary: S.etruria, secondary: S.etruriaReview, extra: [S.stipula], aliases: ["Stipula Etruria Magnifica", "Etruria Magnifica", "Stipula 伊特鲁里亚 Magnifica"], story: "Etruria Magnifica：variant、笔尖与供墨逐支确认", boundary: "Avorio, Propolis and Miele remain variants; Ambra, Alter Ego, Volterra and old celluloid piston editions are excluded.", values: { series_name: "Stipula Etruria Magnifica", release_year: "current Avorio listing verified; historic variants retain separate dates", origin_country: "current Stipula Italian product scope", nib: "nib material and width by exact variant; reviewed Miele used steel", fill_system: "filling system by exact variant; reviewed Miele used cartridge/converter", material: "Avorio exact current product material; sibling celluloids excluded", dimensions: "no cross-Etruria universal dimensions asserted", weight: "no cross-Etruria universal weight asserted", status: "current exact page plus historical variant record" } }),
  makeModel({ key: "ogiva", name: "当代 OMAS Ogiva", brandId: PHASE140_BRANDS.omas, file: ".planning/content-research/omas-ogiva-current-phase140.md", imagePath: "/images/library/site-original/phase140/omas/ogiva-current.svg", primary: S.ogiva, secondary: S.ogivaRetail, extra: [S.omas], aliases: ["Current OMAS Ogiva", "OMAS Ogiva (current)", "当代 OMAS Ogiva"], story: "当代 OMAS Ogiva：复兴后 demonstrator 的独立规格", boundary: "Pre-2016 OMAS/Ogiva is a historical identity and cannot supply current dimensions, nib, piston or warranty.", values: { series_name: "current OMAS Ogiva", release_year: "revival-era current listing; not a pre-2016 production date", origin_country: "current OMAS Bologna product scope", nib: "current official 14K gold nib with ebonite feed", fill_system: "current official piston filling", material: "current demonstrator material by exact SKU", dimensions: "151 mm capped; maximum diameter 14 mm", weight: "39.7 g in current official scope", status: "current revival-era product" } }),
  makeModel({ key: "dolcevita", name: "当代 Delta Dolcevita Mid-Size", brandId: PHASE140_BRANDS.delta, file: ".planning/content-research/delta-dolcevita-mid-size-current-phase140.md", imagePath: "/images/library/site-original/phase140/delta/dolcevita-mid-size-current.svg", primary: S.delta, secondary: S.dolcevita, extra: [S.deltaArchive], aliases: ["Current Delta Dolcevita Mid-Size", "Delta DV Medium current", "当代 Delta 橙色中号"], story: "当代 Dolcevita Mid-Size：steel C/C 与 14K piston 分流", boundary: "Steel cartridge/converter/direct and 14K piston are separate current SKUs; old Delta Medium/Piston/Slim/Oversize remain historical.", values: { series_name: "current Delta DV Medium / Dolcevita Mid-Size", release_year: "revival-era current listing; historic Delta dates excluded", origin_country: "current Delta Italian product scope", nib: "steel on C/C/direct version; 14K gold on piston version", fill_system: "cartridge/converter/direct OR piston, never collapsed", material: "orange/black resin and trim by exact current SKU", dimensions: "no historic Mid-Size measurement inherited", weight: "no historic sample weight inherited", status: "current listing; stock varies" }, variants: [{ name: "Steel C/C/direct", notes: "Steel nib paired with cartridge/converter and direct filling option.", source: S.dolcevita }, { name: "14K piston", notes: "14K gold nib paired with piston and ink window.", source: S.dolcevita }] }),
  makeModel({ key: "avatar", name: "Pineider Avatar UR", brandId: PHASE140_BRANDS.pineider, file: ".planning/content-research/pineider-avatar-ur-phase140.md", imagePath: "/images/library/site-original/phase140/pineider/avatar-ur.svg", primary: S.avatar, secondary: S.avatarReview, extra: [S.pineider], aliases: ["Pineider Avatar UR", "Avatar UltraResin", "Pineider 阿凡达 UR"], story: "Avatar UR：标准钢尖与 Deluxe/Twin Tank 分界", boundary: "Standard steel C/C Avatar UR excludes Deluxe 14K, Black Edition, ordinary Avatar and Twin Tank Touchdown.", values: { series_name: "Pineider Avatar UR standard", release_year: "current 600 listing verified", origin_country: "Pineider Florence product scope", nib: "standard steel nib; Deluxe 14K excluded", fill_system: "cartridge/converter; Twin Tank Touchdown excluded", material: "UltraResin by exact colour SKU", dimensions: "reviewed Abalone Green about 145 mm capped; sample-only", weight: "reviewed Abalone Green about 30 g; sample-only", status: "current standard family; regional stock varies" } }),
  makeModel({ key: "libra", name: "Santini Italia Libra Intenso", brandId: PHASE140_BRANDS.santini, file: ".planning/content-research/santini-libra-phase140.md", imagePath: "/images/library/site-original/phase140/santini/libra.svg", primary: S.libra, secondary: S.libraReview, extra: [S.santini], aliases: ["Santini Libra Intenso", "Santini Italia Libra", "Santini 天秤 Intenso"], story: "Libra Intenso：acrylic 当前 SKU 与 ebonite 样本分离", boundary: "Acrylic Intenso excludes ebonite Libra, Voyager and 33-piece runs; the reviewed ebonite sample does not define Intenso dimensions or feel.", values: { series_name: "Santini Italia Libra Intenso", release_year: "current exact listing verified", origin_country: "current Santini Italia product scope", nib: "Santini 18K gold nib by ordered grind, with ebonite feed", fill_system: "piston", material: "Intenso acrylic; ebonite siblings excluded", dimensions: "no ebonite review measurement inherited", weight: "no ebonite review weight inherited", status: "current exact acrylic SKU" } }),
  makeModel({ key: "divina", name: "Visconti Divina Elegance", brandId: PHASE140_BRANDS.visconti, file: ".planning/content-research/visconti-divina-elegance-phase140.md", imagePath: "/images/library/site-original/phase140/visconti/divina-elegance.svg", primary: S.divina, secondary: S.divinaReview, extra: [S.visconti], aliases: ["Visconti Divina Elegance", "Divina Elegance", "维斯康蒂 Divina Elegance"], story: "Divina Elegance：螺旋比例与历史 nib/sample 分界", boundary: "Current specifications do not inherit the 2017 green bronze-trim 23K palladium loan sample or other historical nib generations.", values: { series_name: "Visconti Divina Elegance", release_year: "current collection verified; 2017 sample retained as historic", origin_country: "current Visconti Italian product scope", nib: "current nib by exact SKU; historic 23K palladium sample excluded", fill_system: "current filling system by exact SKU; 2017 captured-converter sample qualified", material: "current resin/silver-inlay SKU; bronze-trim sample qualified", dimensions: "2017 sample 152 mm capped is not universal current data", weight: "2017 sample 41 g capped is not universal current data", status: "current collection with historical generations" } }),
  makeModel({ key: "mirage", name: "Visconti Mirage 原始款", brandId: PHASE140_BRANDS.visconti, file: ".planning/content-research/visconti-mirage-original-phase140.md", imagePath: "/images/library/site-original/phase140/visconti/mirage-original.svg", primary: S.mirage, secondary: S.mirageReview, extra: [S.mythos, S.visconti], aliases: ["Visconti Mirage original", "Original Visconti Mirage", "维斯康蒂 Mirage 原始款"], story: "原始 Mirage：2019 soft hexagonal 版本，不是 Mythos", boundary: "Mirage Mythos is separate; its larger nib, brass middle section, deity naming and ring cannot be written back to original Mirage.", values: { series_name: "original Visconti Mirage", release_year: "introduced before/in 2019 catalog; exact universal launch date not asserted", origin_country: "Visconti Italian product scope", nib: "small steel nib in original version; later Mythos nib excluded", fill_system: "cartridge/converter", material: "soft hexagonal vegetal resin by original colour", dimensions: "no Mirage Mythos dimensions inherited", weight: "no Mirage Mythos brass-section weight inherited", status: "historical original series, separate from current Mirage Mythos" }, variants: [{ name: "Amber original", notes: "2019 reviewed colour sample.", source: S.mirageReview }, { name: "Azure/Coral/Emerald/Horn/Night original colours", notes: "Original catalog colour family; not current stock promise.", source: S.mirage }] }),
];

function newBrand(input: {
  key: keyof Omit<typeof PHASE140_BRANDS, "visconti">;
  slug: string; name: string; file: string; imagePath: string;
  primary: CuratedSource; secondary: CuratedSource; aliases: string[];
  origin: string; modelName: string;
}): CuratedEntityPack {
  const scopeKey = `phase140-${input.key}-brand`;
  const diagram = image(`phase140-${input.key}-brand-diagram`, `${input.name} brand navigation`, input.imagePath);
  return {
    key: `phase140-${input.key}-brand-v1`,
    entityId: PHASE140_BRANDS[input.key],
    expectedType: "brand",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.file,
    storyTitle: `${input.name}：当前主体与 ${input.modelName} 导航`,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primary.key })),
    sources: [input.primary, input.secondary, diagram],
    scopes: [{ key: scopeKey, scopeKey, productionState: "current", editionScope: "Current brand identity and exact Phase 140 model navigation only." }],
    claims: [
      { key: `phase140-${input.key}-brand-identity`, predicate: "brand_identity", objectText: input.origin, factClass: "core", confidence: 0.98, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [{ key: `phase140-${input.key}-brand-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: input.primary.summary }] },
      { key: `phase140-${input.key}-brand-navigation`, predicate: "series_navigation", objectText: `${input.modelName} is the exact Phase 140 model node; sibling and historical models remain separate.`, factClass: "core", confidence: 0.99, sourceKey: input.secondary.key, locator: input.secondary.summary, evidence: [{ key: `phase140-${input.key}-brand-navigation-evidence`, sourceKey: input.secondary.key, scopeKey, locator: input.secondary.summary }] },
    ],
    timeline: [
      { key: `phase140-${input.key}-identity-verified`, title: "Current brand identity verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: input.origin, sourceKey: input.primary.key },
      { key: `phase140-${input.key}-model-verified`, title: `${input.modelName} evidence verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Verification date is not a launch date.", sourceKey: input.secondary.key },
    ],
    media: [{ key: `phase140-${input.key}-brand-primary`, title: `${input.name} 品牌导航事实图（非产品照片）`, sourceKey: diagram.key, localPath: input.imagePath, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创导航图；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: input.imagePath, usageStatus: "primary" }],
  };
}

const brands = {
  scribo: newBrand({ key: "scribo", slug: "scribo", name: "SCRIBO", file: ".planning/content-research/scribo-brand-phase140.md", imagePath: "/images/library/site-original/phase140/scribo/scribo.svg", primary: S.scribo, secondary: S.feelReview, aliases: ["SCRIBO", "Scrittura Bolognese", "斯克里博"], origin: "Current Bologna maker identity; former OMAS staff experience does not establish corporate continuity.", modelName: "SCRIBO FEEL" }),
  stipula: newBrand({ key: "stipula", slug: "stipula", name: "Stipula", file: ".planning/content-research/stipula-brand-phase140.md", imagePath: "/images/library/site-original/phase140/stipula/stipula.svg", primary: S.stipula, secondary: S.etruriaReview, aliases: ["Stipula", "斯蒂普拉"], origin: "Current Florence product identity is anchored to live official pages.", modelName: "Etruria Magnifica" }),
  omas: newBrand({ key: "omas", slug: "current-omas", name: "当代 OMAS", file: ".planning/content-research/omas-brand-phase140.md", imagePath: "/images/library/site-original/phase140/omas/omas.svg", primary: S.omas, secondary: S.ogivaRetail, aliases: ["Current OMAS", "OMAS Bologna current", "当代 OMAS"], origin: "Revival-era current identity is separate from the pre-2016 OMAS company and catalog.", modelName: "current OMAS Ogiva" }),
  delta: newBrand({ key: "delta", slug: "current-delta", name: "当代 Delta", file: ".planning/content-research/delta-brand-phase140.md", imagePath: "/images/library/site-original/phase140/delta/delta.svg", primary: S.delta, secondary: S.dolcevita, aliases: ["Current Delta", "Delta Pens current", "当代 Delta"], origin: "Revival-era Delta products are scoped separately from historical Delta corporate and catalog records.", modelName: "current Dolcevita Mid-Size" }),
  pineider: newBrand({ key: "pineider", slug: "pineider", name: "Pineider", file: ".planning/content-research/pineider-brand-phase140.md", imagePath: "/images/library/site-original/phase140/pineider/pineider.svg", primary: S.pineider, secondary: S.avatarReview, aliases: ["Pineider", "皮内德"], origin: "Current Florence writing-instrument identity; historical stationery dates do not replace exact model evidence.", modelName: "Avatar UR" }),
  santini: newBrand({ key: "santini", slug: "santini-italia", name: "Santini Italia", file: ".planning/content-research/santini-brand-phase140.md", imagePath: "/images/library/site-original/phase140/santini/santini.svg", primary: S.santini, secondary: S.libraReview, aliases: ["Santini Italia", "Santini", "桑蒂尼"], origin: "Current Italian maker identity and product navigation are anchored to live official pages.", modelName: "Libra Intenso" }),
};

const viscontiBase = phase49ViscontiHomoSapiensPacks.find((pack) => pack.entityId === PHASE49_VISCONTI_BRAND_ID);
if (!viscontiBase) throw new Error("Phase 140 requires Phase 49 Visconti brand pack.");
const viscontiBrand = structuredClone(viscontiBase);
viscontiBrand.key = "phase140-visconti-brand-v3";
viscontiBrand.markdownFile = ".planning/content-research/visconti-brand-italian-batch-phase140.md";
viscontiBrand.sources.push(S.divina, S.mirage, S.mythos);
viscontiBrand.claims.push({
  key: "phase140-visconti-navigation",
  predicate: "series_navigation",
  objectText: "Divina Elegance and original Mirage are distinct additions; original Mirage remains separate from Mirage Mythos.",
  factClass: "core",
  confidence: 0.99,
  sourceKey: S.divina.key,
  locator: "Official Divina collection and original Mirage 2019 catalog.",
  evidence: [{ key: "phase140-visconti-navigation-evidence", sourceKey: S.divina.key, scopeKey: viscontiBrand.scopes[0]!.key, locator: "Divina current collection; Mirage archive retained separately." }],
});

const byId = Object.fromEntries(modelPacks.map((pack) => [pack.entityId, pack]));
const model = (id: string) => {
  const pack = byId[id];
  if (!pack) throw new Error(`Phase 140 model pack missing: ${id}`);
  return pack;
};

export const phase140Groups: Array<{ brand: CuratedEntityPack; pens: CuratedEntityPack[] }> = [
  { brand: brands.scribo, pens: [model(PHASE140_IDS.feel)] },
  { brand: brands.stipula, pens: [model(PHASE140_IDS.etruria)] },
  { brand: brands.omas, pens: [model(PHASE140_IDS.ogiva)] },
  { brand: brands.delta, pens: [model(PHASE140_IDS.dolcevita)] },
  { brand: brands.pineider, pens: [model(PHASE140_IDS.avatar)] },
  { brand: brands.santini, pens: [model(PHASE140_IDS.libra)] },
  { brand: viscontiBrand, pens: [model(PHASE140_IDS.divina), model(PHASE140_IDS.mirage)] },
];

export const phase140AllPacks = phase140Groups.flatMap((group) => [group.brand, ...group.pens]);

export function loadPhase140Packs(workspaceRoot: string): LoadedCuratedEntityPack[] {
  return phase140AllPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
}
