import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE381_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE381_HORIBE_ID = "phase381-sailor-horibe-yahei-109891";
export const PHASE381_HORIBE_SLUG = "sailor-kop-horibe-yahei-kanemaru-109891";

const RETRIEVED = "2026-08-03";
const PRODUCT = "https://en.sailor.co.jp/product/10-9891/";
const TOKYO_MUSEUM = "https://museumcollection.tokyo/works/6248494/";
const APMOA = "https://apmoa.museum/en/exhibition/utagawakuniyoshi_en";
const YOSEKA = "https://yosekastationery.com/products/sailor-king-of-pen-maki-e-fountain-pen-horibe-yahei-kanemaru-limited-edition";
const ENDLESS = "https://endlesspens.com/collections/the-special-edition-vault";
const NIB = "https://sailor.co.jp/topics/fountain-pen-type/";
const REFILL = "https://sailor.co.jp/topics/fountain-pen-refill-ink/";
const CARE = "https://sailor.co.jp/topics/fountain-pen-maintenance/";
const SVG = "/images/library/site-original/phase381/sailor/horibe-yahei-109891.svg";

function source(input: { key: string; title: string; url: string; summary: string; locator: string; registryKey: string; registryName: string; sourceType?: CuratedSource["sourceType"]; tier?: CuratedSource["tier"]; independenceGroup?: string; homepageUrl?: string; author?: string; itemType?: string }): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (sourceType === "retailer" ? "professional_secondary" : "primary"),
    independenceGroup: input.independenceGroup ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://sailor.co.jp/" : "/"),
    itemType: input.itemType ?? (siteOriginal ? "image" : "web_page"),
    author: input.author ?? (sourceType === "official" ? "セーラー万年筆株式会社" : input.registryName),
    retrievedAt: RETRIEVED,
    allowedUse: siteOriginal ? "store_full" : "summary_only",
    license: siteOriginal ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: siteOriginal ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function claim(scopeKey: string, key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const SOURCES = {
  product: source({ key: "phase381-horibe-product", title: "The King of Pen, Maki-E, Ukiyo-e ‘HORIBE YAHEI KANEMARU’ — Sailor 官方", url: PRODUCT, summary: "Sailor 官方页确认 10-9891 的人物题材、M/B 货号、KOP 双色 21K 尖、C/C、硬橡胶、φ20×153.5 mm 与桐木盒。", locator: "title, description, item codes, barcodes, nib, filling, material, size and package", registryKey: "sailor-official-phase381-horibe", registryName: "The Sailor Pen Co., Ltd.", homepageUrl: "https://en.sailor.co.jp/", author: "The Sailor Pen Co., Ltd." }),
  museum: source({ key: "phase381-horibe-tokyo-museum", title: "誠忠義士肖像 堀部矢兵衛金丸 — Tokyo Museum Collection", url: TOKYO_MUSEUM, summary: "东京博物馆收藏资料库列出歌川国芳与堀部矢兵卫金丸作品记录，用于交叉核对人物与浮世绘题材，不覆盖钢笔工艺。", locator: "collection title, artist and work identity", registryKey: "tokyo-museum-phase381-horibe", registryName: "Tokyo Museum Collection", homepageUrl: "https://museumcollection.tokyo/", author: "Tokyo Museum Collection" }),
  apmoa: source({ key: "phase381-horibe-apmoa", title: "Utagawa Kuniyoshi: The Spellbinding Ukiyo-e Works — APMoA", url: APMOA, summary: "爱知县立美术馆展览资料概述国芳的江户晚期武者绘与构图背景，用于解释题材语境，不替代 10-9891 型号事实。", locator: "museum exhibition biography and ukiyo-e context", registryKey: "apmoa-phase381-horibe", registryName: "Aichi Prefectural Museum of Art", homepageUrl: "https://apmoa.museum/", author: "Aichi Prefectural Museum of Art" }),
  yoseka: source({ key: "phase381-horibe-yoseka", title: "Sailor King of Pen Maki-e Fountain Pen - Horibe Yahei Kanemaru — Yoseka", url: YOSEKA, summary: "专业零售商页面列出限定商品、US$4,500 历史价格与海外 30 支说法；官方页未列数量，正文保持二级来源边界。", locator: "retailer title, price, overseas quantity statement and product description", registryKey: "yoseka-phase381-horibe", registryName: "Yoseka Stationery", sourceType: "retailer", tier: "professional_secondary", independenceGroup: "yoseka-phase381-horibe", homepageUrl: "https://yosekastationery.com/", author: "Yoseka Stationery" }),
  endless: source({ key: "phase381-horibe-endless", title: "Sailor KOP Maki-e Horibe Yahei Kanemaru — EndlessPens", url: ENDLESS, summary: "另一家专业零售商的特别版目录记录 Horibe Yahei Kanemaru 商品存在和市场语境；不把其折扣价或年份写成官方事实。", locator: "special-edition vault product listing", registryKey: "endlesspens-phase381-horibe", registryName: "EndlessPens", sourceType: "retailer", tier: "professional_secondary", independenceGroup: "endlesspens-phase381-horibe", homepageUrl: "https://endlesspens.com/", author: "EndlessPens" }),
  nib: source({ key: "phase381-horibe-nib", title: "ペン先の種類と特長 — Sailor 官方", url: NIB, summary: "官方笔尖知识页用于一般尖幅语境，不把通用说明外推为 10-9891 单支调校。", locator: "official nib material and width guidance", registryKey: "sailor-official-phase381-horibe", registryName: "セーラー万年筆株式会社" }),
  refill: source({ key: "phase381-horibe-refill", title: "万年筆のインク補充方法 — Sailor 官方", url: REFILL, summary: "官方说明墨囊和转换器的安装、吸墨、排空与保存，用于 10-9891 C/C 维护边界。", locator: "official cartridge and converter filling instructions", registryKey: "sailor-official-phase381-horibe", registryName: "セーラー万年筆株式会社" }),
  care: source({ key: "phase381-horibe-care", title: "万年筆のお手入れ方法 — Sailor 官方", url: CARE, summary: "官方说明清洗、保存和避免强力清洁的方法；Maki-e 表面仍按型号和授权服务边界处理。", locator: "official cleaning, storage and maintenance instructions", registryKey: "sailor-official-phase381-horibe", registryName: "セーラー万年筆株式会社" }),
  diagram: source({ key: "phase381-horibe-svg", title: "Sailor KOP Horibe Yahei Kanemaru 10-9891 factual identity card", url: SVG, summary: "本站原创 factual SVG 概括题材、硬橡胶、双色 KOP 尖、M/B 货号、尺寸和桐木盒。", locator: "site-original factual SVG metadata", registryKey: "fountain-pen-graph-editorial-phase381-horibe", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial", homepageUrl: "/", author: "Fountain Pen Graph editorial", itemType: "image" }),
};

const SCOPE = "phase381-sailor-horibe-yahei-109891";
const brand = structuredClone(phase33Sailor2026CurrentPacks.find((candidate) => candidate.entityId === PHASE381_SAILOR_BRAND_ID && candidate.expectedType === "brand"));
if (!brand) throw new Error("Phase 381 Sailor brand pack missing.");
brand.key = "phase381-sailor-brand-v1";

const pack: CuratedEntityPack = {
  key: `${PHASE381_HORIBE_ID}-v1`, entityId: PHASE381_HORIBE_ID, expectedType: "pen", expectedSlug: PHASE381_HORIBE_SLUG, canonicalName: "写乐 Sailor KOP Maki-e Ukiyo-e Horibe Yahei Kanemaru（10-9891）", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/sailor-horibe-yahei-kanemaru-109891-phase381.md", storyTitle: "写乐 Sailor KOP Horibe Yahei Kanemaru 10-9891：先区分官方规格与海外限量说法", primarySourceKey: SOURCES.product.key, depthTier: "A",
  aliases: [
    { alias: "The King of Pen, Maki-E, Ukiyo-e 'HORIBE YAHEI KANEMARU'", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Sailor King of Pen Maki-e Horibe Yahei Kanemaru", language: "en", sourceKey: SOURCES.yoseka.key },
    { alias: "Sailor KOP Horibe Yahei Kanemaru 10-9891", language: "en", sourceKey: SOURCES.product.key },
    { alias: "写乐 KOP 堀部矢兵卫金丸", language: "zh", sourceKey: SOURCES.product.key },
    { alias: "10-9891", language: "en", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    { key: SCOPE, scopeKey: SCOPE, market: "Sailor authorized market", validFrom: RETRIEVED, productionState: "current", nibScope: "KOP bicolor 21K gold with gold and rhodium plating; M/B SKUs", materialScope: "ebonite body; Maki-e theme bounded to official description", editionScope: "10-9891 Horibe Yahei Kanemaru Ukiyo-e" },
    { key: `${SCOPE}-art-context`, scopeKey: `${SCOPE}-art-context`, productionState: "historical", editionScope: "Utagawa Kuniyoshi and Horibe Yahei Kanemaru art context; not a claim about exact pattern reproduction" },
    { key: `${SCOPE}-media-boundary`, scopeKey: `${SCOPE}-media-boundary`, productionState: "current", editionScope: "site-original factual SVG; no product photo, logo, scale or colour proof" },
  ],
  claims: [
    claim(SCOPE, `${SCOPE}-identity`, "model_identity", "10-9891 是 Sailor KOP Maki-e Ukiyo-e Horibe Yahei Kanemaru 的具体钢笔；人物与歌川国芳作品是题材关系，不是新的钢笔实体。", SOURCES.product.key, "official product title and 10-9891 identity"),
    claim(SCOPE, `${SCOPE}-subject`, "design_context", "官方把产品题材连接到歌川国芳描绘的堀部矢兵卫金丸、赤穗浪士和 Chushingura；东京博物馆收藏资料库独立记录同名人物版画作品。", SOURCES.museum.key, "official product description and museum collection cross-check"),
    claim(SCOPE, `${SCOPE}-artist-boundary`, "art_history_boundary", "APMoA 的国芳展览资料用于说明江户晚期武者绘语境，但不能证明 10-9891 逐线复制某件馆藏版画或采用特定 Maki-e 工法。", SOURCES.apmoa.key, "museum ukiyo-e context and product-specific boundary", "editorial"),
    claim(SCOPE, `${SCOPE}-nib`, "nib", "KOP 双色 21K 金尖，金色与铑镀层；官方 M 10-9891-442、B 10-9891-642。镀层属于表面处理。", SOURCES.product.key, "official nib, plating and item-code fields"),
    claim(SCOPE, `${SCOPE}-filling`, "filling_system", "墨囊／转换器两用式（converter & cartridge），没有证据把此型号写成活塞或真空上墨。", SOURCES.product.key, "official filling type field"),
    claim(SCOPE, `${SCOPE}-material`, "material", "官方材料为硬橡胶；未列漆种、金粉、螺钿、漆层厚度或逐笔工序，正文不从照片猜工艺。", SOURCES.product.key, "official material field and absent craft-detail boundary"),
    claim(SCOPE, `${SCOPE}-size`, "physical_specification", "官方给出 φ20×153.5 mm，未列本体重量；不借用相邻 KOP 或零售页面的克数。", SOURCES.product.key, "official size field and absent weight field"),
    claim(SCOPE, `${SCOPE}-package`, "package_contents", "官方包装为 Paulownia box（桐木盒）；页面没有列证书、编号卡、布套或墨囊数量。", SOURCES.product.key, "official package field"),
    claim(SCOPE, `${SCOPE}-quantity`, "source_discrepancy", "Yoseka 等专业零售商称海外 30 支并列 US$4,500 历史价格；Sailor 当前产品页未列限量数量或 MSRP，因此这只是二级市场说法，不能升级为官方全球限量。", SOURCES.yoseka.key, "retailer limited-quantity and price statement versus official page", "editorial"),
    claim(SCOPE, `${SCOPE}-care`, "maintenance_guidance", "换色或长期存放前用室温清水吸排并自然晾干；硬橡胶和 Maki-e 表面避开酒精、强溶剂、研磨物和长时间浸泡，出现掉漆、漏墨或尖片变形时联系授权服务。", SOURCES.care.key, "Sailor care guidance plus conservative art-finish boundary", "editorial"),
    claim(SCOPE, `${SCOPE}-selection`, "selection_guidance", "选购应核对 10-9891 主码、M/B 后缀、双色 21K KOP 尖、硬橡胶、φ20×153.5 mm、桐木盒和授权来源；海外 30 支与零售价需保留原始来源。", SOURCES.product.key, "model code, specification, package and market checks", "editorial"),
    claim(SCOPE, `${SCOPE}-media`, "media_identity_boundary", "主图是本站原创 factual SVG，不复制 Sailor 产品照片或 Logo，不证明真实 Maki-e 纹样、比例、颜色、序号或礼盒缺件。", SOURCES.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: `${SCOPE}-m`, name: "KOP M 中字", notes: "官方代码 10-9891-442，JAN 49-01680-61042-7；与 B 共享 10-9891 主型号。", sourceKey: SOURCES.product.key, variantKind: "market_sku", productCode: "10-9891-442", market: "授权市场" },
    { key: `${SCOPE}-b`, name: "KOP B 太字", notes: "官方代码 10-9891-642，JAN 49-01680-64043-4；与 M 共享 10-9891 主型号。", sourceKey: SOURCES.product.key, variantKind: "market_sku", productCode: "10-9891-642", market: "授权市场" },
  ],
  spec: {
    brandEntityId: PHASE381_SAILOR_BRAND_ID,
    values: { series_name: "Sailor King of Pen Maki-e Ukiyo-e Horibe Yahei Kanemaru（10-9891）", release_year: "官方当前产品页未给出单一首发年份", origin_country: "日本 Sailor；不外推工厂或 Maki-e 工坊", nib: "KOP 双色 21K 金尖，金色与铑镀层；M 10-9891-442、B 10-9891-642", fill_system: "墨囊／转换器两用式（converter & cartridge）", material: "硬橡胶（ebonite）；Maki-e 题材工艺不超出官方说明", dimensions: "φ20×153.5 mm", weight: "官方当前产品页未列重量", price_range: "官方页未列 MSRP；Yoseka 历史页面列 US$4,500，仅作市场参考", status: "官方产品目录展示；零售商称海外 30 支，但官方当前页未列限量数量" },
    evidence: [evidence(`${SCOPE}-brand`, "brand_entity_id", SOURCES.product.key, SCOPE, "official Sailor product identity"), evidence(`${SCOPE}-series`, "series_name", SOURCES.product.key, SCOPE, "official title and code"), evidence(`${SCOPE}-release`, "release_year", SOURCES.product.key, SCOPE, "official page does not state a single launch year"), evidence(`${SCOPE}-origin`, "origin_country", SOURCES.product.key, SCOPE, "Sailor official page; no factory inference"), evidence(`${SCOPE}-nib`, "nib", SOURCES.product.key, SCOPE, "official nib and item-code fields"), evidence(`${SCOPE}-fill`, "fill_system", SOURCES.product.key, SCOPE, "official filling field"), evidence(`${SCOPE}-material`, "material", SOURCES.product.key, SCOPE, "official ebonite field"), evidence(`${SCOPE}-dimensions`, "dimensions", SOURCES.product.key, SCOPE, "official size field"), evidence(`${SCOPE}-weight`, "weight", SOURCES.product.key, SCOPE, "official page does not list weight; no borrowed value"), evidence(`${SCOPE}-price`, "price_range", SOURCES.yoseka.key, SCOPE, "historical professional retailer price only"), evidence(`${SCOPE}-status`, "status", SOURCES.product.key, SCOPE, "official availability and absent quantity field")],
  },
  media: [{ key: `${SCOPE}-primary-media`, title: "KOP Horibe Yahei Kanemaru 10-9891 事实卡（非产品照片）", sourceKey: SOURCES.diagram.key, localPath: SVG, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样、非版画复制。", sourceUrl: SVG, usageStatus: "primary" }],
  timeline: [{ key: `${SCOPE}-current-page`, title: "Sailor 产品页确认 Horibe Yahei Kanemaru 10-9891", eventType: "design_milestone", startDate: RETRIEVED, circa: true, description: "截至 2026-08-03，Sailor 官方英文页展示 10-9891 的 Utagawa Kuniyoshi／Horibe Yahei Kanemaru 题材、KOP 双色 21K 尖、硬橡胶、尺寸和桐木盒；页面未给出首发年份与限量数量。", sourceKey: SOURCES.product.key }],
};

export const phase381SailorHoribePacks: CuratedEntityPack[] = [brand, pack];
