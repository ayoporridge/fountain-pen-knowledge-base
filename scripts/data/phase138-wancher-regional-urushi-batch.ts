import type { CuratedEntityPack, CuratedSource, LoadedCuratedEntityPack, SpecFieldKey } from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";
import { PHASE135_DREAM_ARTICLE_ID, PHASE135_WANCHER_ID } from "./phase135-wancher-dream-pen-true-ebonite-marble-green";

export const PHASE138_WANCHER_ID = PHASE135_WANCHER_ID;
export const PHASE138_DREAM_ARTICLE_ID = PHASE135_DREAM_ARTICLE_ID;
export const PHASE138_IDS = {
  aizuAka: "phase138-wancher-aizu-aka-tamenuri",
  aizuAo: "phase138-wancher-aizu-ao",
  sakuraZukiyo: "phase138-wancher-echizen-sakura-zukiyo",
  temari: "phase138-wancher-echizen-temari",
  omoideSakura: "phase138-wancher-echizen-omoide-sakura",
  kyotoUme: "phase138-wancher-kyoto-ume",
} as const;
export const PHASE138_SLUGS = {
  aizuAka: "wancher-dream-pen-aizu-urushi-aka-tamenuri",
  aizuAo: "wancher-dream-pen-aizu-urushi-ao",
  sakuraZukiyo: "wancher-dream-pen-echizen-urushi-sakura-zukiyo",
  temari: "wancher-dream-pen-echizen-urushi-temari",
  omoideSakura: "wancher-dream-pen-echizen-urushi-omoide-sakura",
  kyotoUme: "wancher-dream-pen-kyoto-urushi-kasane-no-iro-ume",
} as const;
export const PHASE138_URLS = {
  collection: "https://www.wancherpen.com/collections/dream-pen",
  aizuAka: "https://www.wancherpen.com/products/aizu-urushi-aka-tamenuri",
  aizuAo: "https://www.wancherpen.com/products/aizu-urushi-ao",
  sakuraZukiyo: "https://www.wancherpen.com/products/dream-pen-echizen-urushi-sakura-zukiyo",
  temari: "https://www.wancherpen.com/products/dream-pen-echizen-urushi-temari",
  omoideSakura: "https://www.wancherpen.com/products/echizen-urushi-omoide-sakura",
  kyotoUme: "https://www.wancherpen.com/products/kyoto-urushi-ume",
  aizuRegion: "https://www.japan.travel/en/destinations/tohoku/fukushima/aizuwakamatsu-and-oze/",
  echizenRegion: "https://www.echizen.or.jp/",
  kyotoRegion: "https://www.kyo-shikki.jp/",
} as const;
export const PHASE138_PROTECTED_IDS = [
  PHASE138_DREAM_ARTICLE_ID,
  "phase107-wancher-true-ebonite-matte-black",
  "phase112-wancher-dream-pen-titanium-black",
  "phase113-wancher-dream-pen-true-urushi-aka-tamenuri",
  "phase119-wancher-puchico",
  "phase120-wancher-shizuku-glass-nib",
  "phase128-wancher-dream-pen-true-urushi-black",
  "phase128-wancher-dream-pen-byakudan-nuri",
  "phase129-wancher-dream-pen-tokiwa-iro",
  "phase129-wancher-dream-pen-bokashi-lunar-eclipse",
  "phase134-wancher-true-ebonite-silk-black",
  "phase135-wancher-true-ebonite-marble-green",
] as const;
export function phase138MadeById(entityId: string) { return `phase138-${entityId.replace("phase138-wancher-", "")}-made-by-wancher`; }
export function phase138ReverseId(entityId: string) { return `rev-${phase138MadeById(entityId)}`; }

const RETRIEVED = "2026-07-22";
function web(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"> & { locator: string }): CuratedSource {
  const { locator, ...source } = input;
  return { ...source, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: source.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}` };
}
const wancherBase = { registryKey: "wancher-official-phase138", registryName: "Wancher official", sourceType: "official" as const, tier: "primary" as const, independenceGroup: "wancher-official", homepageUrl: "https://www.wancherpen.com/", author: "Wancher" };
function wancher(key: string, title: string, url: string, summary: string) {
  return web({ ...wancherBase, key, title, url, summary, locator: "exact title; material/art; filling; nib; feed; compact-cap and packaging fields; mutable commercial fields excluded" });
}
const collection = web({ ...wancherBase, key: "phase138-wancher-dream-pen-collection", title: "Dream Pen Fountain Pen Collection", url: PHASE138_URLS.collection, summary: "Current collection lists the six regional-craft products as separate cards among broader Dream Pen material and craft siblings.", locator: "collection title, regional craft context and six separate product cards" });
const regions = {
  aizu: web({ key: "phase138-aizu-region", registryKey: "jnto-phase138", registryName: "Japan National Tourism Organization", sourceType: "official", tier: "professional_secondary", independenceGroup: "jnto", homepageUrl: "https://www.japan.travel/", author: "JNTO", title: "Aizu-Wakamatsu", url: PHASE138_URLS.aizuRegion, summary: "Independent official regional page identifies Aizu-Wakamatsu in Fukushima and notes the area's lacquerware reputation; relative to the pen SKU it is professional secondary context, not product certification.", locator: "official destination title and lacquerware description" }),
  echizen: web({ key: "phase138-echizen-region", registryKey: "echizen-lacquerware-cooperative-phase138", registryName: "Echizen Lacquerware Cooperative", sourceType: "official", tier: "professional_secondary", independenceGroup: "echizen-lacquerware-cooperative", homepageUrl: PHASE138_URLS.echizenRegion, author: "Echizen Lacquerware Cooperative", title: "Echizen Lacquerware Cooperative", url: PHASE138_URLS.echizenRegion, summary: "Independent regional cooperative presents Echizen lacquerware processes and industry activity; relative to the pen SKU it is professional secondary context, not Wancher product certification.", locator: "cooperative identity, Echizen/Fukui context, process and activity sections" }),
  kyoto: web({ key: "phase138-kyoto-region", registryKey: "kyoto-lacquerware-cooperative-phase138", registryName: "Kyoto Lacquerware Cooperative", sourceType: "official", tier: "professional_secondary", independenceGroup: "kyoto-lacquerware-cooperative", homepageUrl: PHASE138_URLS.kyotoRegion, author: "Kyoto Lacquerware Cooperative", title: "Kyoto Lacquerware Cooperative", url: PHASE138_URLS.kyotoRegion, summary: "Independent Kyoto industry organization supplies professional secondary lacquerware context relative to the pen SKU; it does not verify Wancher's artisan, layers or options.", locator: "organization identity and Kyoto lacquerware context" }),
} as const;
function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase138", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase138", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "Site-original factual SVG separating exact SKU, material, craft term, rejected inference and regional context; not a product photograph.", allowedUse: "store_full", license: "site-original", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) { return { fieldKey, key, sourceKey, scopeKey, locator, qualifies }; }

interface Definition {
  key: keyof typeof PHASE138_IDS; name: string; file: string; svg: string; exact: CuratedSource; region: CuratedSource; aliases: string[];
  values: Record<string, string>; variants: string[]; reject: { field: SpecFieldKey; key: string; locator: string }; conflictNote: string;
}
function makePack(def: Definition): CuratedEntityPack {
  const currentScope = `phase138-${def.key}-current`;
  const regionScope = `phase138-${def.key}-regional-context`;
  const image = diagram(`phase138-${def.key}-diagram`, `${def.name} factual boundary`, def.svg);
  const specEvidence = Object.keys(def.values).map((field) => evidence(field as SpecFieldKey, `phase138-${def.key}-spec-${field}`, def.exact.key, currentScope, `exact product ${field} field with current-SKU qualification`));
  specEvidence.unshift(evidence("brand_entity_id", `phase138-${def.key}-spec-brand`, def.exact.key, currentScope, "exact Wancher product identity"));
  specEvidence.push(evidence(def.reject.field, def.reject.key, def.exact.key, currentScope, def.reject.locator, false));
  return {
    key: `phase138-wancher-${def.key}-v1`, entityId: PHASE138_IDS[def.key], expectedType: "pen", expectedSlug: PHASE138_SLUGS[def.key], canonicalName: def.name,
    publicationIntent: "publish", publicationBlockers: [], markdownFile: def.file, storyTitle: `${def.name}：商品配置、工艺词与地域背景分开读`, primarySourceKey: def.exact.key, depthTier: "A",
    aliases: def.aliases.map((alias, index) => ({ alias, language: index === def.aliases.length - 1 ? "zh" : "en", sourceKey: def.exact.key })),
    sources: [def.exact, collection, def.region, image],
    scopes: [
      { key: currentScope, scopeKey: currentScope, validFrom: RETRIEVED, productionState: "current", nibScope: "Current exact-page nib/feed menu only; options are order choices, not simultaneous equipment.", materialScope: "Exact base material and named urushi/decorative technique only; no sibling material inheritance.", editionScope: "One exact Dream Pen fountain-pen SKU; price, stock, delivery, other writing modes and sibling colours excluded." },
      { key: regionScope, scopeKey: regionScope, productionState: "historical", nibScope: "Regional craft source supplies no pen-nib evidence.", materialScope: "Independent regional lacquerware context only; no certification of Wancher artisan, layer count, formula or individual product quality.", editionScope: "Craft history does not establish this model's release year or continuous production." },
    ],
    claims: [
      { key: `phase138-${def.key}-identity`, predicate: "exact_product_identity", objectText: `${def.name} is one exact modern Dream Pen fountain-pen SKU and remains separate from similarly named regional, colour and motif siblings.`, factClass: "core", confidence: 0.99, sourceKey: def.exact.key, locator: "exact title and product specifications", evidence: [{ key: `phase138-${def.key}-identity-citation`, sourceKey: def.exact.key, scopeKey: currentScope, locator: "exact product identity" }] },
      { key: `phase138-${def.key}-configuration`, predicate: "current_configuration", objectText: "Base material, named art, European international C/C, nib/feed choices and cap/packaging statements are limited to the retrieved exact page.", factClass: "core", confidence: 0.99, sourceKey: def.exact.key, locator: "exact specification and option sections", evidence: [{ key: `phase138-${def.key}-configuration-citation`, sourceKey: def.exact.key, scopeKey: currentScope, locator: "current exact configuration" }] },
      { key: `phase138-${def.key}-region`, predicate: "regional_craft_context", objectText: "The independent regional organization supports only geographic lacquerware context and does not certify Wancher's product-specific construction.", factClass: "core", confidence: 0.98, sourceKey: def.region.key, locator: "regional organization/destination lacquerware context", evidence: [{ key: `phase138-${def.key}-region-citation`, sourceKey: def.region.key, scopeKey: regionScope, locator: "regional context only" }] },
    ],
    variants: def.variants.map((name) => ({ key: `phase138-${def.key}-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`, name, notes: "Current order option; compatibility, stock and delivered configuration require exact-order confirmation.", sourceKey: def.exact.key, variantKind: "market_sku" })),
    spec: { brandEntityId: PHASE138_WANCHER_ID, values: def.values, evidence: specEvidence },
    conflicts: [{ key: `phase138-${def.key}-rejected-inference`, fieldKey: def.reject.field, scopeKey: currentScope, conflictKind: "field", status: "resolved", resolutionNote: def.conflictNote, members: [{ citationKey: def.reject.key, assertedValue: def.reject.locator }] }],
    timeline: [{ key: `phase138-${def.key}-verified`, title: `${def.name} current listing verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact SKU configuration and regional-source boundary verified; retrieval is not a release date.", sourceKey: def.exact.key }],
    media: [{ key: `phase138-${def.key}-primary`, title: `${def.name} 事实边界图（非产品照片）`, sourceKey: image.key, localPath: def.svg, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创事实示意图；非产品照片、非 logo、非比例、非色准或手工纹理证明。", sourceUrl: def.svg, usageStatus: "primary" }],
  };
}

const exact = {
  aizuAka: wancher("phase138-aizu-aka-exact", "Aizu Urushi - Aka Tamenuri", PHASE138_URLS.aizuAka, "Exact current ABS/Aizu Urushi/Aka Tamenuri SKU with red/black/transparent lacquer variation, international C/C and current nib/feed menu."),
  aizuAo: wancher("phase138-aizu-ao-exact", "Aizu Urushi - Ao", PHASE138_URLS.aizuAo, "Exact current ABS/Aizu Urushi deep-blue SKU with natural batch variation, international C/C and current nib/feed menu; Tamamushi background is not this SKU's technique."),
  sakuraZukiyo: wancher("phase138-sakura-zukiyo-exact", "Dream Pen Echizen Urushi - Sakura Zukiyo", PHASE138_URLS.sakuraZukiyo, "Exact ABS/Echizen Urushi/Kindai Maki-e moonlit-sakura SKU with international C/C and current nib/feed menu."),
  temari: wancher("phase138-temari-exact", "Dream Pen Echizen Urushi - Temari", PHASE138_URLS.temari, "Exact ABS/Echizen Urushi/Kindai Maki-e Temari SKU; page explicitly describes screen print, international C/C and current nib/feed menu."),
  omoideSakura: wancher("phase138-omoide-sakura-exact", "Dream Pen Echizen Urushi - Omoide Sakura", PHASE138_URLS.omoideSakura, "Exact ebonite/Echizen Urushi/Oshita Maki-e SKU, described as a rework of the 2023 Kawazu Zakura model, with international C/C and current nib/feed menu."),
  kyotoUme: wancher("phase138-kyoto-ume-exact", "Kyoto Urushi Kasane-iro - Ume", PHASE138_URLS.kyotoUme, "Exact ebonite/Kyoto Urushi Ume SKU with international C/C, nib/feed/clip menu and explicit ebonite-feed compatibility limited to JoWo nibs."),
};

export const phase138WancherRegionalUrushiPacks: CuratedEntityPack[] = [
  makePack({ key: "aizuAka", name: "Wancher Dream Pen Aizu Urushi Aka Tamenuri", file: ".planning/content-research/wancher-dream-pen-aizu-aka-tamenuri-phase138.md", svg: "/images/library/site-original/phase138/wancher/wancher-aizu-aka-tamenuri.svg", exact: exact.aizuAka, region: regions.aizu, aliases: ["Dream Pen Aizu Urushi Aka Tamenuri", "Aizu Urushi - Aka Tamenuri", "Wancher 会津漆 赤溜涂"], values: { series_name: "Wancher Dream Pen Aizu Urushi Aka Tamenuri", release_year: "current exact listing verified 2026-07-22; launch year not asserted", nib: "#6 JoWo steel, Wancher 18K, Keiryu or Keiryu Kodachi by exact order", fill_system: "European international cartridge/converter", material: "ABS base with Aizu Urushi Aka Tamenuri; piece-to-piece colour/layer variation", status: "current exact SKU verified 2026-07-22" }, variants: ["JoWo steel", "Wancher 18K", "Keiryu", "Keiryu Kodachi", "plastic feed", "black ebonite feed", "red ebonite feed"], reject: { field: "material", key: "phase138-aizuAka-ebonite-rejected", locator: "True Urushi Aka Tamenuri's ebonite/Wajima construction is a different sibling and cannot fill this ABS/Aizu SKU" }, conflictNote: "Resolved by exact-SKU qualification: this Aizu product is ABS-based; the existing True Urushi Aka Tamenuri ebonite/Wajima page remains separate." }),
  makePack({ key: "aizuAo", name: "Wancher Dream Pen Aizu Urushi Ao", file: ".planning/content-research/wancher-dream-pen-aizu-ao-phase138.md", svg: "/images/library/site-original/phase138/wancher/wancher-aizu-ao.svg", exact: exact.aizuAo, region: regions.aizu, aliases: ["Dream Pen Aizu Urushi Ao", "Aizu Urushi - Ao", "Wancher 会津漆 Ao"], values: { series_name: "Wancher Dream Pen Aizu Urushi Ao", release_year: "current exact listing verified 2026-07-22; launch year not asserted", nib: "#6 JoWo steel, Wancher 18K, Keiryu or Keiryu Kodachi by exact order", fill_system: "European international cartridge/converter", material: "ABS base with artisan-mixed deep-blue Aizu Urushi; batch colour variation", status: "current exact SKU verified 2026-07-22" }, variants: ["JoWo steel", "Wancher 18K", "Keiryu", "Keiryu Kodachi", "plastic feed", "black ebonite feed", "red ebonite feed"], reject: { field: "material", key: "phase138-aizuAo-tamamushi-rejected", locator: "Tamamushi-nuri and silver-powder passage is regional background, not the stated Ao product technique" }, conflictNote: "Resolved by rejecting the Tamamushi/silver-powder background inference; the exact Ao field remains deep-blue Aizu Urushi without an invented additional technique." }),
  makePack({ key: "sakuraZukiyo", name: "Wancher Dream Pen Echizen Urushi Sakura Zukiyo", file: ".planning/content-research/wancher-dream-pen-echizen-sakura-zukiyo-phase138.md", svg: "/images/library/site-original/phase138/wancher/wancher-echizen-sakura-zukiyo.svg", exact: exact.sakuraZukiyo, region: regions.echizen, aliases: ["Dream Pen Echizen Urushi Sakura Zukiyo", "Echizen Urushi - Sakura Zukiyo", "Wancher 越前漆 樱月夜"], values: { series_name: "Wancher Dream Pen Echizen Urushi Sakura Zukiyo", release_year: "current exact listing verified 2026-07-22; launch year not asserted", nib: "#6 JoWo steel, Wancher 18K or Shogun 18K by exact order", fill_system: "European international cartridge/converter", material: "ABS base, Echizen Urushi and Kindai Maki-e", status: "current exact SKU verified 2026-07-22" }, variants: ["JoWo steel", "Wancher 18K", "Shogun 18K", "plastic feed", "black ebonite feed", "red ebonite feed"], reject: { field: "material", key: "phase138-sakuraZukiyo-omoide-rejected", locator: "Omoide Sakura ebonite/Oshita Maki-e construction is a separate exact sibling" }, conflictNote: "Resolved by exact titles and specifications: Sakura Zukiyo remains ABS/Kindai Maki-e; Omoide Sakura remains ebonite/Oshita Maki-e." }),
  makePack({ key: "temari", name: "Wancher Dream Pen Echizen Urushi Temari", file: ".planning/content-research/wancher-dream-pen-echizen-temari-phase138.md", svg: "/images/library/site-original/phase138/wancher/wancher-echizen-temari.svg", exact: exact.temari, region: regions.echizen, aliases: ["Dream Pen Echizen Urushi Temari", "Echizen Urushi - Temari", "Wancher 越前漆 手毬"], values: { series_name: "Wancher Dream Pen Echizen Urushi Temari", release_year: "current exact listing verified 2026-07-22; launch year not asserted", nib: "#6 JoWo steel, Wancher 18K or Keiryu by exact order", fill_system: "European international cartridge/converter", material: "ABS base, Echizen Urushi and Kindai Maki-e screen-print decoration", status: "current exact SKU verified 2026-07-22" }, variants: ["JoWo steel", "Wancher 18K", "Keiryu", "plastic feed", "black ebonite feed", "red ebonite feed"], reject: { field: "material", key: "phase138-temari-handpaint-rejected", locator: "Kindai Maki-e screen-print statement does not support an all-hand-painted traditional high-maki-e claim" }, conflictNote: "Resolved by retaining the exact page's screen-print boundary and rejecting an unsupported all-hand-painted/high-maki-e expansion." }),
  makePack({ key: "omoideSakura", name: "Wancher Dream Pen Echizen Urushi Omoide Sakura", file: ".planning/content-research/wancher-dream-pen-echizen-omoide-sakura-phase138.md", svg: "/images/library/site-original/phase138/wancher/wancher-echizen-omoide-sakura.svg", exact: exact.omoideSakura, region: regions.echizen, aliases: ["Dream Pen Echizen Urushi Omoide Sakura", "Echizen Urushi - Omoide Sakura", "Wancher 越前漆 回忆樱"], values: { series_name: "Wancher Dream Pen Echizen Urushi Omoide Sakura", release_year: "current rework of Wancher's 2023 Kawazu Zakura model; current listing verified 2026-07-22", nib: "#6 JoWo steel or Wancher 18K by exact order", fill_system: "European international cartridge/converter", material: "ebonite base, Echizen Urushi and Oshita Maki-e", status: "current exact SKU verified 2026-07-22; Kawazu Zakura retained as predecessor name" }, variants: ["JoWo steel", "Wancher 18K", "plastic feed", "black ebonite feed", "red ebonite feed"], reject: { field: "material", key: "phase138-omoideSakura-zukiyo-rejected", locator: "Sakura Zukiyo ABS/Kindai Maki-e construction cannot fill this ebonite/Oshita Maki-e SKU" }, conflictNote: "Resolved by preserving the official 2023 Kawazu Zakura rework lineage while keeping Sakura Zukiyo as a separate ABS sibling." }),
  makePack({ key: "kyotoUme", name: "Wancher Dream Pen Kyoto Urushi Kasane no Iro Ume", file: ".planning/content-research/wancher-dream-pen-kyoto-urushi-ume-phase138.md", svg: "/images/library/site-original/phase138/wancher/wancher-kyoto-urushi-ume.svg", exact: exact.kyotoUme, region: regions.kyoto, aliases: ["Dream Pen Kyoto Urushi Kasane no Iro Ume", "Kyoto Urushi Kasane-iro - Ume", "Wancher 京都漆 梅"], values: { series_name: "Wancher Dream Pen Kyoto Urushi Kasane no Iro Ume", release_year: "current exact listing verified 2026-07-22; Heian-period inspiration is not release history", nib: "#6 JoWo steel, Wancher 18K, Keiryu or Keiryu Kodachi by exact order", fill_system: "European international cartridge/converter", material: "ebonite base with Kyoto Urushi Ume design", status: "current exact SKU verified 2026-07-22" }, variants: ["no clip", "chrome clip", "gold clip", "JoWo steel", "Wancher 18K", "Keiryu", "Keiryu Kodachi"], reject: { field: "release_year", key: "phase138-kyotoUme-heian-rejected", locator: "Heian-period Kasane no Irome inspiration cannot establish this modern model's release year" }, conflictNote: "Resolved by treating Heian-period Kasane no Irome solely as Wancher's design inspiration; current model release year remains unasserted." }),
];

export function loadPhase138WancherRegionalUrushiPacks(workspaceRoot: string): LoadedCuratedEntityPack[] {
  return phase138WancherRegionalUrushiPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
}
