import type { CuratedEntityPack, CuratedSource, LoadedCuratedEntityPack, SpecFieldKey } from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE125_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE125_PREPPY_ID = "s44PLATPREP";
export const PHASE125_TARGET_ID = "Er9lACPas9qm";
export const PHASE125_RAW_SLUG = "白金-platinum-小流星pq200";
export const PHASE125_RAW_NAME = "白金 Platinum 小流星PQ200";
export const PHASE125_SLUG = "platinum-small-meteor-pq-200";
export const PHASE125_NAME = "Platinum Small Meteor PQ-200 小流星";
export const PHASE125_MADE_BY_ID = "fIzZ7krBuptA";
export const PHASE125_REVERSE_ID = "rev-fIzZ7krBuptA";
export const PHASE125_TRUTHFUL_LEGACY_ALIASES = ["Platinum PQ200", "白金 小流星 PQ200"] as const;
export const PHASE125_FALSE_PREPPY_ALIAS = "Platinum Preppy";
export const PHASE125_SHANGHAI_URL = "https://www.platinum-pen.com.cn/products_list/13.html";
export const PHASE125_AWARD_URL = "https://paperworldchina.hk.messefrankfurt.com/content/dam/messefrankfurt-redaktion/paperworldchina/bsoc-2019/BSOC-EN.pdf";
export const PHASE125_TAIWAN_URL = "https://www.yc8899.com.tw/yc8899/index.php?action=product_detail&prod_no=P0122500224923";
export const PHASE125_SINA_URL = "https://zhongce.sina.com.cn/article/view/81414";
export const PHASE125_NONOPEN_URL = "https://www.nonopen.com/15179.html";
export const PHASE125_AWESOME_URL = "https://awesomepens.co.uk/product/platinum-small-meteor-pq-200-fountain-pen/";
export const PHASE125_MANUAL_URL = "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2025/04/fourtainpen.pdf";
export const PHASE125_VARIANTS = ["2019 F", "2020 EF"] as const;

const RETRIEVED = "2026-07-22";
const SVG_PATH = "/images/library/site-original/phase125/platinum/platinum-small-meteor-pq-200.svg";
const REGIONAL_SCOPE = "phase125-pq200-regional-identity-2019";
const TAIWAN_SCOPE = "phase125-pq200-taiwan-channel-document";
const SINA_SCOPE = "phase125-pq200-sina-comparison-2021-02-28";
const SAMPLE_SCOPE = "phase125-pq200-coral-f-sample-2021-08-18";
const RETAILER_SCOPE = "phase125-pq200-awesomepens-retailer-2026-07-22";
const MAINTENANCE_SCOPE = "phase125-pq200-general-maintenance-2025-04";

function webSource(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"> & { locator: string }): CuratedSource {
  const { locator, ...source } = input;
  return { ...source, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: source.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}` };
}

const shanghai = webSource({ key: "phase125-shanghai-platinum-catalog", registryKey: "platinum-shanghai-phase125", registryName: "上海白金制笔有限公司", sourceType: "official", tier: "primary", independenceGroup: "platinum-official", homepageUrl: "https://www.platinum-pen.com.cn/", author: "上海白金制笔有限公司", title: "钢笔分类", url: PHASE125_SHANGHAI_URL, summary: "Shanghai Platinum category navigation lists Small Meteor separately from PPQ-200; the retrieved page shows PQ-300 Small Meteor as a current successor/navigation boundary, not proof that PQ-200 is Preppy or currently produced.", locator: "钢笔分类 product labels: PQ-300小流星 and separate PPQ-200" });
const award = webSource({ key: "phase125-paperworld-pq200-award", registryKey: "paperworld-china-phase125", registryName: "Paperworld China / Messe Frankfurt", sourceType: "official", tier: "primary", independenceGroup: "messe-frankfurt-paperworld", homepageUrl: "https://paperworldchina.hk.messefrankfurt.com/", author: "Messe Frankfurt", title: "Best Stationery of China Awards 2019", url: PHASE125_AWARD_URL, publishedAt: "2019", summary: "Industry-award document explicitly identifies Platinum PQ-200 Fountain Pen in 2019; identity/date only, not a full manufacturer specification sheet.", locator: "Best Stationery of China Awards 2019 PDF; Platinum PQ-200 Fountain Pen entry" });
const taiwan = webSource({ key: "phase125-taiwan-pq200", registryKey: "yongchang-platinum-phase125", registryName: "永昌创新国际有限公司", sourceType: "retailer", tier: "retailer", independenceGroup: "yongchang-taiwan", homepageUrl: "https://www.yc8899.com.tw/", author: "永昌创新国际有限公司", title: "PLATINUM STARLET 小流星 PQ-200", url: PHASE125_TAIWAN_URL, summary: "Regional authorized-channel document: PQ-200/former PQ-180, F, seven listed colours, stainless steel/ABS/PC, made in China, included blue cartridge and separately available Platinum cartridges/Japanese-format converter.", locator: "商品特色 labels 商品名稱/商品編號/商品顏色/商品規格/成分/產地; cartridge and converter bullets" });
const sina = webSource({ key: "phase125-sina-preppy-system-comparison", registryKey: "sina-review-phase125", registryName: "新浪众测", sourceType: "blog", tier: "professional_secondary", independenceGroup: "laomuzengxuacai", homepageUrl: "https://zhongce.sina.com.cn/", author: "老木曾雪菜", title: "白金笔的超人气书写系统：preppy产品对比详解", url: PHASE125_SINA_URL, publishedAt: "2021-02-28", summary: "Purchased-system comparison: Shanghai-made PQ-200 launched with F in 2019 and EF followed in 2020; similar low-price writing architecture but distinct domestic nib and cap/body details. Subjective line/feel observations remain sample-only.", locator: "byline/date; paragraphs 20, 44, 71, 80, 96-105 and rod/cap comparison section" });
const nonopen = webSource({ key: "phase125-nonopen-coral-f-sample", registryKey: "nonopen-phase125", registryName: "钢笔爱好者", sourceType: "blog", tier: "community", independenceGroup: "chenying-nonopen", homepageUrl: "https://www.nonopen.com/", author: "晨莹", title: "手可摘星辰—白金PLATINUM小流星PQ-200钢笔测评", url: PHASE125_NONOPEN_URL, publishedAt: "2021-08-18", summary: "One Coral F owner sample: tube package, octagonal clipless body, snap cap, included slide converter, nib photographs and subjective cap/flow/writing observations.", locator: "title/byline/date; 外观&包装, 书写体验 and 总结 sections" });
const awesome = webSource({ key: "phase125-awesomepens-retailer", registryKey: "awesomepens-phase125", registryName: "AwesomePens", sourceType: "retailer", tier: "retailer", independenceGroup: "awesomepens", homepageUrl: "https://awesomepens.co.uk/", author: "AwesomePens", title: "Platinum Small Meteor PQ-200 Fountain Pen", url: PHASE125_AWESOME_URL, summary: "Retailer snapshot only: 13 g, octagonal clipless plastic body, 0.38 mm F steel nib, PQR-200/Platinum cartridge compatibility, dimensions and listed colours; none are manufacturer tolerances or complete global variants.", locator: "product heading; Compact and Lightweight, Reliable Writing Performance, Versatile Ink Compatibility and Additional information" });
const manual = webSource({ key: "phase125-platinum-general-manual", registryKey: "platinum-manual-phase125", registryName: "Platinum Pen Co., Ltd.", sourceType: "official", tier: "primary", independenceGroup: "platinum-official", homepageUrl: "https://www.platinum-pen.co.jp/", author: "Platinum Pen Co., Ltd.", title: "Fountain Pen General Instructions", url: PHASE125_MANUAL_URL, publishedAt: "2025-04", summary: "General fountain-pen handling and Platinum replacement-product boundary; not PQ-200-specific performance or durability evidence.", locator: "Fountain Pen cartridge installation/cleaning cautions and Platinum replacement products notice" });
const diagram: CuratedSource = { key: "phase125-pq200-boundary-svg", registryKey: "fountain-pen-graph-editorial-phase125", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase125", title: "PQ-200 identity and evidence boundary map", url: SVG_PATH, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "本站原创 factual SVG，拆分 PQ-200、Preppy、dated F/EF、sibling 与 retailer measurement 边界。", allowedUse: "store_full", license: "site-original", archiveUrl: SVG_PATH, archiveLocator: `project-public-asset:${SVG_PATH};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900` };

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) { return { fieldKey, key, sourceKey, scopeKey, locator, qualifies }; }

export const phase125PlatinumSmallMeteorPack: CuratedEntityPack = {
  key: "phase125-platinum-small-meteor-pq-200-v1", entityId: PHASE125_TARGET_ID, expectedType: "pen", expectedSlug: PHASE125_SLUG, canonicalName: PHASE125_NAME, publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/platinum-small-meteor-pq-200-phase125.md", storyTitle: "Platinum Small Meteor PQ-200：地区身份、F/EF与Preppy边界", primarySourceKey: award.key, depthTier: "A",
  aliases: [
    { alias: PHASE125_RAW_NAME, language: "zh", sourceKey: shanghai.key },
    { alias: "Platinum PQ200", language: "en", sourceKey: award.key },
    { alias: "白金 小流星 PQ200", language: "zh", sourceKey: shanghai.key },
    { alias: "Platinum Little Meteor PQ-200", language: "en", kind: "regional_name", market: "international retail", sourceKey: awesome.key },
    { alias: "Platinum Starlet PQ-200", language: "en", kind: "regional_name", market: "Taiwan", sourceKey: taiwan.key },
  ],
  sources: [shanghai, award, taiwan, sina, nonopen, awesome, manual, diagram],
  scopes: [
    { key: REGIONAL_SCOPE, scopeKey: REGIONAL_SCOPE, market: "China / Asia", validFrom: "2019", productionState: "historical", nibScope: "PQ-200 identity documented; Paperworld entry does not supply full specs.", editionScope: "PQ-300 current directory entry, PQ-800/PQ-1500 and collaborations are siblings/successors, not target variants." },
    { key: TAIWAN_SCOPE, scopeKey: TAIWAN_SCOPE, market: "Taiwan", productionState: "unknown", nibScope: "Regional page lists F.", materialScope: "Stainless steel, ABS and PC; made in China.", editionScope: "Seven regional page colours and former PQ-180 note are document-specific." },
    { key: SINA_SCOPE, scopeKey: SINA_SCOPE, market: "China", validFrom: "2019", validTo: "2021-02-28", productionState: "historical", nibScope: "Comparison reports F launch in 2019 and EF in 2020; sample comparisons do not establish universal line width.", materialScope: "Shanghai-manufactured nib/body system as inspected.", editionScope: "Related Preppy/Plaisir/Prefounte products remain separate SKUs." },
    { key: SAMPLE_SCOPE, scopeKey: SAMPLE_SCOPE, market: "China", validFrom: "2021-08-18", validTo: "2021-08-18", productionState: "historical", nibScope: "One Coral F sample and subjective writing/flow observations.", materialScope: "Octagonal clipless sample with snap cap and tube package.", editionScope: "Included slide converter and cap fit apply only to this sample/package." },
    { key: RETAILER_SCOPE, scopeKey: RETAILER_SCOPE, market: "United Kingdom retail", validFrom: RETRIEVED, productionState: "unknown", nibScope: "Retailer 0.38 mm F label only.", materialScope: "Retailer 13 g, 10.6/13.1 mm and 13-14 cm measurements.", editionScope: "Retailer colours/current price are mutable commercial snapshot." },
    { key: MAINTENANCE_SCOPE, scopeKey: MAINTENANCE_SCOPE, validFrom: "2025-04", productionState: "current", editionScope: "General cartridge/cleaning/replacement-product instructions only; no PQ-200 longevity promise." },
  ],
  claims: [
    { key: "phase125-identity", predicate: "model_identity", objectText: "PQ-200 is the exact Small Meteor / 小流星 model documented in 2019.", factClass: "core", confidence: 0.98, sourceKey: award.key, locator: "Platinum PQ-200 Fountain Pen award entry", evidence: [{ key: "phase125-identity-evidence", sourceKey: award.key, scopeKey: REGIONAL_SCOPE, locator: "Best Stationery of China Awards 2019: Platinum PQ-200 Fountain Pen" }] },
    { key: "phase125-preppy-separation", predicate: "sibling_identity_boundary", objectText: "Small Meteor and PPQ-200 Preppy are separately listed products; Platinum Preppy is not a PQ-200 alias.", factClass: "core", confidence: 0.98, sourceKey: shanghai.key, locator: "separate PQ-300小流星 and PPQ-200 category labels", evidence: [{ key: "phase125-preppy-evidence", sourceKey: shanghai.key, scopeKey: REGIONAL_SCOPE, locator: "钢笔分类: PQ-300小流星; separate PPQ-200" }] },
    { key: "phase125-f-ef-time", predicate: "dated_nib_variant_history", objectText: "The comparison reports F at the 2019 launch and EF from 2020.", factClass: "core", confidence: 0.94, sourceKey: sina.key, locator: "paragraphs 44 and 80; F/EF comparison", evidence: [{ key: "phase125-f-ef-evidence", sourceKey: sina.key, scopeKey: SINA_SCOPE, locator: "2019 F launch; 2020 EF introduction" }] },
    { key: "phase125-regional-spec", predicate: "regional_product_document", objectText: "Taiwan channel documentation identifies F, stainless steel/ABS/PC, China origin and Platinum cartridge/converter options.", factClass: "core", confidence: 0.92, sourceKey: taiwan.key, locator: "product feature labels", evidence: [{ key: "phase125-regional-spec-evidence", sourceKey: taiwan.key, scopeKey: TAIWAN_SCOPE, locator: "商品規格/成分/產地 and cartridge/converter bullets" }] },
    { key: "phase125-comparison-sample", predicate: "professional_sample_comparison", objectText: "Sina's purchased comparison distinguishes domestic PQ-200 nib/body details from Japanese Preppy components; feel and line observations remain sample-only.", factClass: "core", confidence: 0.92, sourceKey: sina.key, locator: "nib and rod/cap comparison sections", evidence: [{ key: "phase125-comparison-evidence", sourceKey: sina.key, scopeKey: SINA_SCOPE, locator: "paragraphs 80 and 96-109" }] },
    { key: "phase125-owner-sample", predicate: "community_sample_observation", objectText: "One Coral F sample documents octagonal clipless construction, tube package, included slide converter and subjective cap/flow observations.", factClass: "editorial", confidence: 0.86, sourceKey: nonopen.key, locator: "外观&包装/书写体验", evidence: [{ key: "phase125-owner-sample-evidence", sourceKey: nonopen.key, scopeKey: SAMPLE_SCOPE, locator: "Coral F sample photographs and observations" }] },
  ],
  variants: [
    { key: "phase125-f-2019", name: "2019 F", releaseYear: "2019", notes: "Reported launch nib variant; star-pattern details and line feel remain sample/document specific.", sourceKey: sina.key, variantKind: "nib", productCode: "PQ-200 F", market: "China" },
    { key: "phase125-ef-2020", name: "2020 EF", releaseYear: "2020", notes: "Reported later EF variant; 小流星 nib imprint is documented sample history, not a promise for every batch.", sourceKey: sina.key, variantKind: "nib", productCode: "PQ-200 EF", market: "China" },
  ],
  spec: { brandEntityId: PHASE125_PLATINUM_BRAND_ID, values: { series_name: "Platinum Small Meteor PQ-200", release_year: "2019", origin_country: "China (Shanghai Platinum regional product)", nib: "stainless-steel F; EF reported from 2020", fill_system: "Platinum cartridge; compatible Japanese-format/PQR-200 converter depends on channel package", material: "ABS / PC body components; stainless-steel nib", status: "regional PQ-200 documented from 2019; current production not asserted" }, evidence: [
    evidence("brand_entity_id", "phase125-brand", award.key, REGIONAL_SCOPE, "Platinum PQ-200 identity"), evidence("series_name", "phase125-series", award.key, REGIONAL_SCOPE, "Platinum PQ-200 Fountain Pen"), evidence("release_year", "phase125-release", award.key, REGIONAL_SCOPE, "2019 award document"), evidence("origin_country", "phase125-origin", sina.key, SINA_SCOPE, "Shanghai manufacture and domestic production"), evidence("nib", "phase125-nib-time", sina.key, SINA_SCOPE, "2019 F and 2020 EF"), evidence("fill_system", "phase125-fill", taiwan.key, TAIWAN_SCOPE, "Platinum cartridge and Japanese-format converter"), evidence("material", "phase125-material", taiwan.key, TAIWAN_SCOPE, "stainless steel, ABS, PC"), evidence("status", "phase125-status", shanghai.key, REGIONAL_SCOPE, "current directory shows PQ-300 successor, not PQ-200 availability"),
    evidence("nib", "phase125-retailer-line-rejected", awesome.key, RETAILER_SCOPE, "0.38 mm retailer label rejected as stable line width", false), evidence("dimensions", "phase125-retailer-dimensions-rejected", awesome.key, RETAILER_SCOPE, "10.6/13.1 mm and 13-14 cm retailer measurements", false), evidence("weight", "phase125-retailer-weight-rejected", awesome.key, RETAILER_SCOPE, "13 g retailer measurement", false), evidence("status", "phase125-colours-rejected", taiwan.key, TAIWAN_SCOPE, "seven regional colours rejected as global complete variants", false), evidence("status", "phase125-pq300-rejected", shanghai.key, REGIONAL_SCOPE, "PQ-300 successor rejected as target variant", false), evidence("status", "phase125-siblings-rejected", sina.key, SINA_SCOPE, "Preppy/Plaisir/Prefounte and other PQ products rejected as target aliases/variants", false), evidence("nib", "phase125-owner-writing-rejected", nonopen.key, SAMPLE_SCOPE, "single Coral F writing/flow rejected as line-wide performance", false),
  ] },
  timeline: [
    { key: "phase125-award-2019", title: "PQ-200 documented by Paperworld China", eventType: "design_milestone", startDate: "2019", circa: false, description: "Identity/date evidence, not full product specs.", sourceKey: award.key },
    { key: "phase125-f-launch", title: "F launch reported", eventType: "model_released", startDate: "2019", circa: false, description: "Professional comparison timeline.", sourceKey: sina.key },
    { key: "phase125-ef", title: "EF variant reported", eventType: "design_milestone", startDate: "2020", circa: false, description: "Later nib variant in the comparison; not current availability proof.", sourceKey: sina.key },
  ],
  media: [{ key: "phase125-pq200-primary", title: "Small Meteor PQ-200 identity and evidence map（非产品照片）", sourceKey: diagram.key, localPath: SVG_PATH, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof，不证明实物颜色、尺寸公差、附件或持续生产。", sourceUrl: SVG_PATH, usageStatus: "primary" }],
};

export function loadPhase125PlatinumSmallMeteorPack(workspaceRoot: string): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(workspaceRoot, phase125PlatinumSmallMeteorPack);
  const summaryLength = Array.from(loaded.summary).length;
  if (summaryLength < 60 || summaryLength > 160) throw new Error("Phase 125 summary must contain 60–160 Unicode characters.");
  if (Array.from(loaded.bodyMd).length < 2_000) throw new Error("Phase 125 body_md must contain at least 2,000 Unicode characters.");
  return loaded;
}
