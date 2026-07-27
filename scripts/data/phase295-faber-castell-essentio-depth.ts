import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase139Groups, phase139NewModelPacks } from "./phase139-german-swiss-current-batch";

export const PHASE295_ESSENTIO_ID = "phase139-faber-castell-essentio";
export const PHASE295_ESSENTIO_SLUG = "faber-castell-essentio";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase139-essentio-current";

function official(input: { key: string; title: string; url: string; summary: string; tier?: CuratedSource["tier"] }): CuratedSource {
  return {
    key: input.key,
    registryKey: "faber-official-phase295",
    registryName: "Faber-Castell official",
    sourceType: "official",
    tier: input.tier ?? "primary",
    independenceGroup: "faber-official-phase295",
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: "Faber-Castell",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase295/faber-castell/essentio.svg";
  return {
    key: "phase295-essentio-diagram",
    registryKey: "fountain-pen-graph-editorial-phase295",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase295",
    title: "Faber-Castell Essentio material and SKU boundary diagram",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；区分 148420 Aluminium Rose、148481 Aluminium Black 与 148820/148821 Carbon，不是产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const base = phase139NewModelPacks.find((pack) => pack.entityId === PHASE295_ESSENTIO_ID);
const brand = phase139Groups.find((group) => group.brand.entityId === "xVHzH0mMviM4")?.brand;
if (!base || !brand) throw new Error("Phase 295 Essentio baseline pack or Faber-Castell brand pack is missing.");

const S = {
  rose: base.sources.find((source) => source.key === "phase139-essentio-148420") ?? official({ key: "phase295-essentio-rose", title: "Essentio Aluminium fountain pen M rose 148420", url: "https://www.faber-castell.com/products/EssentioAluminiumfountainpenMrose/148420", summary: "Exact Rose M 148420: anodised aluminium body and grip, stainless steel nib and cartridge/converter system." }),
  carbonM: official({ key: "phase295-essentio-carbon-m", title: "Essentio Carbon fountain pen M black 148820", url: "https://www.faber-castell.com/products/EssentioCarbonfountainpenMblack/148820", summary: "Exact Carbon M 148820: durable carbon barrel, ergonomic grip, spring-loaded metal clip, stainless steel M nib and cartridge/converter system." }),
  carbonF: official({ key: "phase295-essentio-carbon-f", title: "Essentio Carbon fountain pen F black 148821", url: "https://www.faber-castell.com/products/EssentioCarbonfountainpenFblack/148821", summary: "Exact Carbon F 148821: durable carbon barrel, stainless steel F nib and cartridge/converter system." }),
  aluminiumBlack: official({ key: "phase295-essentio-aluminium-black", title: "Essentio Aluminium fountain pen F black 148481", url: "https://www.faber-castell.com/products/EssentioAluminiumfountainpenFblack/148481", summary: "Exact Aluminium Black F 148481: separate aluminium colour/SKU boundary; material and nib fields do not inherit from Carbon." }),
  family: official({ key: "phase295-essentio-family", title: "Faber-Castell Essentio product family", url: "https://www.faber-castell.com/products/basic", summary: "Official product-family page lists Essentio fountain pens and distinguishes Aluminium, Carbon, Black and other writing modes." }),
  faq: base.sources.find((source) => source.key === "phase139-faber-faq") ?? official({ key: "phase295-faber-faq", title: "Faber-Castell fountain pen FAQ", url: "https://www.faber-castell.com/service/frequently-asked-questions/faq-fountain-pens", tier: "contemporary_archive", summary: "Official cartridge, converter, cleaning and care guidance." }),
  review: base.sources.find((source) => source.key === "phase139-essentio-review")!,
  svg: diagram(),
};

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core") {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }] } satisfies CuratedEntityPack["claims"][number];
}

function specEvidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const model: CuratedEntityPack = structuredClone(base);
model.key = "phase295-faber-castell-essentio-depth-v1";
model.storyTitle = "Essentio：148420、148481 与 Carbon SKU 的材质边界";
model.markdownFile = ".planning/content-research/faber-castell-essentio-phase139.md";
model.primarySourceKey = S.rose.key;
model.sources = [S.rose, S.carbonM, S.carbonF, S.aluminiumBlack, S.family, S.faq, S.review, S.svg];
model.scopes = [{ key: SCOPE, scopeKey: SCOPE, market: "Faber-Castell current product pages and exact SKU variants", validFrom: RETRIEVED, productionState: "current", nibScope: "Stainless steel nib; width and product code are SKU-scoped", materialScope: "148420/148481 Aluminium and 148820/148821 Carbon are separate materials or finishes", editionScope: "Essentio fountain pens only; ballpoint, rollerball, leather and Metal writing modes remain siblings" }];
model.claims = [
  claim("phase295-essentio-identity", "model_identity", "Faber-Castell Essentio 是独立的 fountain-pen 产品线；Aluminium、Carbon 与 Black 是同一系列内可追溯的材料/颜色 SKU，不与 Graf von Faber-Castell 或 Ambition 混名。", S.family.key, "official Essentio product-family navigation"),
  claim("phase295-essentio-rose", "sku_anchor", "148420 Aluminium Rose M 是本文规格锚点：阳极氧化铝笔杆与握区、弹性金属笔夹、不锈钢 M 尖和 cartridge/converter。", S.rose.key, "official 148420 product details"),
  claim("phase295-essentio-carbon", "material_boundary", "148820/148821 Carbon 使用 durable carbon 笔杆；它们仍有 ergonomic grip、spring-loaded metal clip、可拆帽、不锈钢尖和 cartridge/converter，但不能继承 148420 的铝材描述。", S.carbonM.key, "official Carbon M/F product details"),
  claim("phase295-essentio-aluminium-black", "market_sku_boundary", "148481 Aluminium Black 是独立铝制颜色/SKU；颜色、尖幅和附件按产品号核对，不以 Carbon 的黑色外观替代。", S.aluminiumBlack.key, "official Aluminium Black product page"),
  claim("phase295-essentio-nib", "nib", "当前官方页按具体 SKU 列出不锈钢尖和 EF/F/M/B 等宽度；148420 为 M，148481 为 F，148820 为 M，148821 为 F。", S.family.key, "official exact product selectors and item numbers"),
  claim("phase295-essentio-fill", "filling_system", "Essentio 使用 cartridge/converter；官方商品页说明随附墨囊而 converter 可另购，不能从 Fine Writing 品牌名推断每盒必含 converter。", S.carbonM.key, "official Carbon product details and 148420 listing"),
  claim("phase295-essentio-cap", "construction", "官方 exact pages均列可拆笔帽、人体工学握区和弹性金属笔夹；这些是系列结构线索，不等于套帽后的重心或舒适度规格。", S.carbonM.key, "official product detail fields"),
  claim("phase295-essentio-care", "maintenance_guidance", "换色或长期停用时用室温清水吸排、自然阴干；避免热水、酒精、漂白剂、强清洁剂和对涂层/铝材的金属抛光。", S.faq.key, "official fountain pen FAQ care guidance", "editorial"),
  claim("phase295-essentio-handling", "secondary_identity_check", "独立零售评测明确以 Essentio 样笔为对象，补充套帽长度和不套帽书写的样本语境；这不替代官方重量、尺寸或跨材质结论。", S.review.key, "professional secondary Essentio sample review"),
  claim("phase295-essentio-buying", "selection_guidance", "购买前应同时核对 Aluminium/Carbon/Black 材质词、产品号、尖幅、盒内墨囊与 converter；二手笔要检查细长笔杆、帽口、笔夹、握区和尖面。", S.review.key, "professional secondary handling and purchase context", "editorial"),
];
model.variants = [
  { key: "phase295-essentio-148420", name: "Aluminium Rose M", productCode: "148420", market: "official current SKU", notes: "阳极氧化铝笔杆与握区；M 不锈钢尖；随墨囊，converter 另购。", sourceKey: S.rose.key, variantKind: "market_sku" },
  { key: "phase295-essentio-148481", name: "Aluminium Black F", productCode: "148481", market: "official current SKU", notes: "黑色 Aluminium 变体；F 不锈钢尖；不继承 Carbon 笔杆。", sourceKey: S.aluminiumBlack.key, variantKind: "market_sku" },
  { key: "phase295-essentio-148820", name: "Carbon M black", productCode: "148820", market: "official current SKU", notes: "durable carbon 笔杆；M 不锈钢尖；cartridge/converter。", sourceKey: S.carbonM.key, variantKind: "market_sku" },
  { key: "phase295-essentio-148821", name: "Carbon F black", productCode: "148821", market: "official current SKU", notes: "durable carbon 笔杆；F 不锈钢尖；cartridge/converter。", sourceKey: S.carbonF.key, variantKind: "market_sku" },
];
model.spec = {
  brandEntityId: "xVHzH0mMviM4",
  values: { series_name: "Faber-Castell Essentio", release_year: "当前官方产品页于 2026-07-28 核验；型号首发年份未断言", nib: "148420 M、148481 F、148820 M、148821 F 不锈钢尖；其他宽度按 SKU", fill_system: "cartridge/converter；商品页说明随附墨囊，converter 另购", material: "Aluminium Rose/Black 与 Carbon 为独立材料或表面 SKU", dimensions: "官方当前 exact pages 未给跨材质统一尺寸", weight: "不设全系统一重量；按具体材质与产品号核对", status: "Faber-Castell 当前产品族仍列 Essentio；颜色、尖幅与库存按 SKU" },
  evidence: [specEvidence("brand_entity_id", "phase295-essentio-brand", S.rose.key, "official maker identity"), specEvidence("series_name", "phase295-essentio-series", S.family.key, "official Essentio product family"), specEvidence("release_year", "phase295-essentio-release", S.family.key, "current listing verification; no launch-year inference"), specEvidence("nib", "phase295-essentio-nib", S.rose.key, "exact SKU nib fields"), specEvidence("fill_system", "phase295-essentio-fill", S.carbonM.key, "official cartridge/converter details"), specEvidence("material", "phase295-essentio-material", S.carbonM.key, "official Aluminium and Carbon material fields"), specEvidence("dimensions", "phase295-essentio-dimensions", S.rose.key, "official page does not assert cross-material dimension"), specEvidence("weight", "phase295-essentio-weight", S.rose.key, "official page does not assert cross-material weight"), specEvidence("status", "phase295-essentio-status", S.family.key, "current family navigation")],
};
model.media = [{ key: "phase295-essentio-primary", title: "Faber-Castell Essentio 材质与 SKU 事实示意图（非产品照片）", sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片，不代表真实比例、颜色、Logo、笔夹光泽、尖幅、包装或库存。", sourceUrl: S.svg.url, usageStatus: "primary" }];
model.timeline = [{ key: "phase295-essentio-current", title: "Essentio current SKU family checked", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "148420、148481、148820、148821 的官方产品字段和材料边界已按 exact SKU 核验；检索日期不等于首发年份。", sourceKey: S.family.key }];

export const phase295FaberCastellEssentioDepthPacks: CuratedEntityPack[] = [structuredClone(brand), model];
