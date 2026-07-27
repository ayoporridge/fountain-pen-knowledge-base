import type { CuratedEntityPack, CuratedSource, LoadedCuratedEntityPack, SpecFieldKey } from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE130_PILOT_ID = "Zt-PbXkE7UHM";
export const PHASE130_CAPLESS_ID = "s43PILOTCAP";
export const PHASE130_DECIMO_ID = "s43PILOTDECI";
export const PHASE130_LS_ID = "s43PILOTLS";
export const PHASE130_FERMO_ID = "phase130-pilot-capless-fermo-fcf-2mr";
export const PHASE130_FERMO_SLUG = "pilot-capless-fermo";
export const PHASE130_MADE_BY_ID = "phase130-pilot-capless-fermo-made-by";
export const PHASE130_REVERSE_ID = `rev-${PHASE130_MADE_BY_ID}`;
export const PHASE130_TARGET_IDS = [PHASE130_FERMO_ID] as const;
export const PHASE130_TARGET_SLUGS = [PHASE130_FERMO_SLUG] as const;
export const PHASE130_MADE_BY_IDS = [PHASE130_MADE_BY_ID] as const;
export const PHASE130_REVERSE_IDS = [PHASE130_REVERSE_ID] as const;

const RETRIEVED = "2026-07-22";
const HISTORY_URL = "https://www.pilot.co.jp/media/knowledge/029.html";
const PRICE_2024_URL = "https://www.pilot.co.jp/information/price-list20240101.pdf";
const PRICE_2025_URL = "https://www.pilot.co.jp/information/589c64fec5794806048fe758b4073d32f2bdf102.pdf";
const REVIEW_URL = "https://ukfountainpens.com/2018/06/18/pilot-fermo-the-thinking-persons-vanishing-point/";
const SVG = "/images/library/site-original/phase130/pilot/pilot-capless-fermo.svg";

function web(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"> & { locator: string }): CuratedSource {
  const { locator, ...source } = input;
  return { ...source, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: source.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}` };
}

const official = { registryKey: "pilot-official-phase130", registryName: "Pilot Corporation", sourceType: "official" as const, tier: "primary" as const, independenceGroup: "pilot-official", homepageUrl: "https://www.pilot.co.jp/", author: "Pilot Corporation" };
const history = web({ ...official, key: "phase130-pilot-capless-history", title: "それぞれが個性的な『歴代キャップレス』（1963～2019年発売）", url: HISTORY_URL, summary: "Pilot historical feature places Capless Fermo FCF-2MR in 2006 as the rotary branch, separately from the 1963 original, Decimo and LS.", locator: "historical Capless sequence; 2006 FCF-2MR Fermo; 回転式 label; separate 1963, 2005 and 2019 entries" });
const price2024 = web({ ...official, key: "phase130-pilot-price-2024", title: "Pilot price revision list effective 2024-01-01", url: PRICE_2024_URL, publishedAt: "2024-01-01", summary: "Official price table lists キャップレス フェルモ FCF2MR at ¥22,000 before tax and ¥26,400 including tax; dated listing only.", locator: "PDF row 23: キャップレス フェルモ / FCF2MR / 22,000円 / 26,400円" });
const price2025 = web({ ...official, key: "phase130-pilot-price-2025-10", title: "Pilot price list effective 2025-10", url: PRICE_2025_URL, publishedAt: "2025-10-01", summary: "Later official price table contains no FCF2MR match; absence is evidence for supply uncertainty, not a discontinuation announcement.", locator: "full PDF text search for フェルモ, FCF2MR and FCF-2MR returned no match; absence-only scope" });
const review = web({ key: "phase130-ukfountainpens-fermo-review", registryKey: "ukfountainpens-phase130", registryName: "UK Fountain Pens", sourceType: "blog", tier: "professional_secondary", independenceGroup: "ukfountainpens", homepageUrl: "https://ukfountainpens.com/", author: "UK Fountain Pens", title: "Pilot Fermo: the thinking person's Vanishing Point", url: REVIEW_URL, publishedAt: "2018-06-18", summary: "Professional review of one reviewer-owned navy Fine Fermo describes its rotary sprung mechanism, 18K nib unit, metal heft, rear balance and individual writing experience.", locator: "title/date; reviewer purchase disclosure; navy Fine sample; twist/sprung mechanism; 18K nib unit; metal heft/rear balance; sample writing observations" });
const retailerSpec = web({ key: "phase130-stationery-goods-fermo-spec", registryKey: "stationery-goods-fermo-phase130", registryName: "ステーショナリーグッズ（Yahoo!ショッピング）", sourceType: "retailer", tier: "retailer", independenceGroup: "stationery-goods-fermo", homepageUrl: "https://store.shopping.yahoo.co.jp/", author: "ステーショナリーグッズ", title: "Pilot Capless FERMO FCF-2MR 商品规格页", url: "https://store.shopping.yahoo.co.jp/stationery-goods/pilo0150.html", summary: "零售商品页明确列出 FCF-2MR 的 141 mm、12.4 mm、33.5 g、18K、F/M、黄铜涂装笔身，以及 CON-20/CON-50 与 Pilot 墨囊；页面同时标示缺货，因此只作为具体 SKU 规格边界。", locator: "商品情報／商品スペック：FCF-2MR; size 141mm; maximum diameter 12.4mm; weight 33.5g; 18K; F/M; brass lacquer; CON-20/CON-50; cartridge compatible" });
const diagram: CuratedSource = { key: "phase130-fermo-svg", registryKey: "fountain-pen-graph-editorial-phase130", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase130", title: "Pilot Fermo identity and supply-time boundary", url: SVG, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "Site-original factual SVG showing FCF-2MR identity, rotary action and supply-status boundary.", allowedUse: "store_full", license: "site-original", archiveUrl: SVG, archiveLocator: `project-public-asset:${SVG};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900` };

const identityScope = "phase130-fermo-official-history";
const price2024Scope = "phase130-fermo-price-2024";
const price2025Scope = "phase130-fermo-price-2025-10-absence";
const sampleScope = "phase130-fermo-reviewer-sample-2018-06-18";
const retailerSpecScope = "phase130-fermo-retailer-spec-2026-07-22";
function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) { return { fieldKey, key, sourceKey, scopeKey, locator, qualifies }; }

export const phase130PilotFermoPack: CuratedEntityPack = {
  key: "phase130-pilot-capless-fermo-fcf-2mr-v1",
  entityId: PHASE130_FERMO_ID,
  expectedType: "pen",
  expectedSlug: PHASE130_FERMO_SLUG,
  canonicalName: "Pilot Capless Fermo FCF-2MR",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pilot-capless-fermo-phase130.md",
  storyTitle: "Pilot Capless Fermo：FCF-2MR、回转式与供货时态",
  primarySourceKey: history.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot Capless Fermo", language: "en", sourceKey: history.key },
    { alias: "Pilot Fermo", language: "en", sourceKey: review.key },
    { alias: "FCF-2MR", language: "en", sourceKey: history.key },
    { alias: "FCF2MR", language: "en", sourceKey: price2024.key },
    { alias: "百乐 Capless Fermo", language: "zh", sourceKey: history.key },
  ],
  sources: [history, price2024, price2025, review, retailerSpec, diagram],
  scopes: [
    { key: identityScope, scopeKey: identityScope, validFrom: "2006", productionState: "historical", editionScope: "FCF-2MR Fermo exact historical model; rotary branch distinct from the 1963 original, Decimo and LS." },
    { key: price2024Scope, scopeKey: price2024Scope, validFrom: "2024-01-01", validTo: "2024-12-31", productionState: "historical", editionScope: "FCF2MR price-table listing and ¥22,000/¥26,400 values are dated only." },
    { key: price2025Scope, scopeKey: price2025Scope, validFrom: "2025-10-01", productionState: "unknown", editionScope: "No FCF2MR text match in the later price list; current supply and repair status require confirmation and permanent retirement is not asserted." },
    { key: sampleScope, scopeKey: sampleScope, validFrom: "2018-06-18", validTo: "2018-06-18", productionState: "historical", nibScope: "One reviewer-owned navy Fine sample with an observed 18K VP-type nib unit.", materialScope: "One metal-bodied sample described as hefty and rear-balanced.", editionScope: "Mechanism and writing observations are sample-only, not official all-production specifications." },
    { key: retailerSpecScope, scopeKey: retailerSpecScope, validFrom: RETRIEVED, validTo: RETRIEVED, productionState: "unknown", nibScope: "Retailer listing for FCF-2MR only; F/M and 18K are product-page metadata, not proof that every historical nib batch used the same offering.", materialScope: "Retailer listing for one FCF-2MR family SKU; brass lacquered barrel/cap description is a product-page specification, not a finish catalogue.", editionScope: "Dated retailer product specification; page was out of stock and does not establish current supply or a universal batch specification." },
  ],
  claims: [
    { key: "phase130-fermo-identity", predicate: "model_identity", objectText: "Pilot Capless Fermo FCF-2MR is the separate 2006 rotary retractable-nib branch in Pilot's Capless history.", factClass: "core", confidence: 0.99, sourceKey: history.key, locator: history.archiveLocator ?? history.summary, evidence: [{ key: "phase130-fermo-identity-evidence", sourceKey: history.key, scopeKey: identityScope, locator: "2006 FCF-2MR Fermo and rotary label" }] },
    { key: "phase130-fermo-2024-listing", predicate: "dated_official_listing", objectText: "Pilot's 2024 official price table lists Capless Fermo FCF2MR at ¥22,000 before tax and ¥26,400 including tax.", factClass: "core", confidence: 0.99, sourceKey: price2024.key, locator: price2024.archiveLocator ?? price2024.summary, evidence: [{ key: "phase130-fermo-2024-evidence", sourceKey: price2024.key, scopeKey: price2024Scope, locator: "PDF row 23" }] },
    { key: "phase130-fermo-status-boundary", predicate: "supply_status_boundary", objectText: "The 2025-10 price list has no FCF2MR match; this supports uncertain current supply but does not prove permanent discontinuation.", factClass: "core", confidence: 0.97, sourceKey: price2025.key, locator: price2025.archiveLocator ?? price2025.summary, evidence: [{ key: "phase130-fermo-status-evidence", sourceKey: price2025.key, scopeKey: price2025Scope, locator: "absence-only full-text search boundary" }] },
    { key: "phase130-fermo-sample", predicate: "professional_sample_boundary", objectText: "UK Fountain Pens reports one navy Fine Fermo sample; its spring-like rotary action, 18K unit, heft, balance and writing feel remain individual observations.", factClass: "core", confidence: 0.97, sourceKey: review.key, locator: review.archiveLocator ?? review.summary, evidence: [{ key: "phase130-fermo-sample-evidence", sourceKey: review.key, scopeKey: sampleScope, locator: "reviewer purchase, exact sample configuration and observations" }] },
  ],
  variants: [],
  spec: { brandEntityId: PHASE130_PILOT_ID, values: { series_name: "Pilot Capless Fermo FCF-2MR", release_year: "2006", origin_country: "Pilot Japan official Capless history", nib: "18K 金笔尖；商品页列 F／M", fill_system: "Pilot CON-20 或 CON-50（商品页列为另购）；可使用 Pilot 墨囊", material: "黄铜笔身／笔盖，表面涂装（商品页规格）", dimensions: "全长 141 mm；最大径 12.4 mm（单一 FCF-2MR 商品规格）", weight: "33.5 g（单一 FCF-2MR 商品规格）", price_range: "¥22,000 before tax / ¥26,400 including tax in 2024 official table", status: "Historical model; current Japanese supply and repair status unconfirmed as of 2026-07-22" }, evidence: [
    evidence("brand_entity_id", "phase130-fermo-brand", history.key, identityScope, "Pilot official history"),
    evidence("series_name", "phase130-fermo-series", history.key, identityScope, "FCF-2MR Fermo exact historical entry"),
    evidence("release_year", "phase130-fermo-release", history.key, identityScope, "2006 entry"),
    evidence("origin_country", "phase130-fermo-origin", history.key, identityScope, "Pilot Japan official registry context; no factory inference"),
    evidence("price_range", "phase130-fermo-price", price2024.key, price2024Scope, "dated 2024 price row"),
    evidence("status", "phase130-fermo-status", price2025.key, price2025Scope, "later table absence; supply unknown, not permanent retirement"),
    evidence("nib", "phase130-fermo-retailer-nib", retailerSpec.key, retailerSpecScope, "retailer product page lists 18K and F/M"),
    evidence("fill_system", "phase130-fermo-retailer-fill", retailerSpec.key, retailerSpecScope, "retailer product page lists CON-20/CON-50 and compatible cartridges"),
    evidence("material", "phase130-fermo-retailer-material", retailerSpec.key, retailerSpecScope, "retailer product page lists brass and lacquered finish"),
    evidence("dimensions", "phase130-fermo-retailer-dimensions", retailerSpec.key, retailerSpecScope, "retailer product page lists 141mm length and 12.4mm maximum diameter"),
    evidence("weight", "phase130-fermo-retailer-weight", retailerSpec.key, retailerSpecScope, "retailer product page lists 33.5g"),
  ] },
  timeline: [
    { key: "phase130-fermo-release-event", title: "Capless Fermo FCF-2MR enters Pilot history", eventType: "model_released", startDate: "2006", circa: false, description: "Separate rotary Capless branch.", sourceKey: history.key },
    { key: "phase130-fermo-price-event", title: "FCF2MR remains in Pilot 2024 price table", eventType: "design_milestone", startDate: "2024-01-01", circa: false, description: "Dated official listing only.", sourceKey: price2024.key },
    { key: "phase130-fermo-status-event", title: "Later official price-table absence checked", eventType: "design_milestone", startDate: "2025-10-01", circa: false, description: "No permanent retirement inference.", sourceKey: price2025.key },
  ],
  media: [{ key: "phase130-fermo-primary", title: "Pilot Fermo identity and supply-time boundary（非产品照片）", sourceKey: diagram.key, localPath: SVG, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。", sourceUrl: SVG, usageStatus: "primary" }],
};

export function loadPhase130PilotFermoPack(workspaceRoot: string): LoadedCuratedEntityPack {
  const pack = loadCuratedEntityPack(workspaceRoot, phase130PilotFermoPack);
  if (Array.from(pack.summary).length < 60 || Array.from(pack.summary).length > 160) throw new Error("Phase 130 summary must contain 60-160 Unicode characters.");
  if (Array.from(pack.bodyMd).length < 2_000) throw new Error("Phase 130 body_md must contain at least 2,000 Unicode characters.");
  return pack;
}

export function loadPhase130PilotFermoPacks(workspaceRoot: string): LoadedCuratedEntityPack[] {
  return [loadPhase130PilotFermoPack(workspaceRoot)];
}
