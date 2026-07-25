import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE218_PAILI_BRAND_ID = "xGmfK8jpUCnX";
export const PHASE218_PAILI_002_ID = "ZmHH94j5tJQo";
export const PHASE218_PAILI_002_SLUG = "派利-002";
export const PHASE218_PAILI_SOURCE_KEY = "phase218-paili-002";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string; independenceGroup: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase218", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase218", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、Logo、工厂、完整目录或生产批次。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}
const S = {
  orange: live({ key: "phase218-paili-002-orange", title: "Penhouse：Paili 002 Transparent Orange EF Nib", url: "https://www.penhouse.in/paili-002-transparent-orange-ef-nib-gold-clip-and-trim-converter-type-fountain-pen-sku-25204.html", registryName: "Penhouse", sourceType: "retailer", tier: "retailer", summary: "零售页确认 Paili 002、Transparent Orange、EF、Gold Clip and Trim、Converter Type、SKU 25204，并标示商品可能缺货。", locator: "Paili 002 title, orange color, EF, gold clip and trim, converter type, SKU 25204", independenceGroup: "phase218-penhouse-paili-002" }),
  blue: live({ key: "phase218-paili-002-blue", title: "Penhouse：Paili 002 Transparent Blue EF Nib", url: "https://www.penhouse.in/paili-002-transparent-blue-ef-nib-gold-clip-and-trim-converter-type-fountain-pen-sku-25206.html", registryName: "Penhouse", sourceType: "retailer", tier: "retailer", summary: "同一零售渠道的蓝色页面确认 Paili 002、Transparent Blue、EF、Gold Clip and Trim、Converter Type、SKU 25206。", locator: "Paili 002 title, blue color, EF, gold clip and trim, converter type, SKU 25206", independenceGroup: "phase218-penhouse-paili-002" }),
  fpn: live({ key: "phase218-paili-013-fpn", title: "Fountain Pen Network：Wing Sung 3013 / Paili Vacuumfiller", url: "https://www.fountainpennetwork.com/forum/topic/348099-wingsung-3013-paili-vacuumfiller/", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "professional_secondary", summary: "社区长评讨论 Paili 013／Wing Sung 3013 的真空／推杆上墨、透明笔身、容量和重心；本页只用它划出不同型号边界，不把 013 规格移到 002。", locator: "3013/Paili 013 vacuum filler review and model boundary", independenceGroup: "phase218-fpn-paili-013" }),
  brandSvg: diagram("phase218-paili-brand-svg", "派利 Paili 品牌与 002／013 边界示意", "/images/library/site-original/phase218/paili/paili-brand.svg"),
  modelSvg: diagram("phase218-paili-002-svg", "派利 Paili 002 结构示意", "/images/library/site-original/phase218/paili/paili-002.svg"),
} as const;
const brandScope = "paili-brand-scope";
const modelScope = "paili-002-scope";
function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string, extra: string[] = []): CuratedEntityPack["claims"][number] { return { key, predicate, objectText, factClass: "core", confidence: 0.84, sourceKey, locator, evidence: [sourceKey, ...extra].map((evidenceSource, index) => ({ key: `${key}-evidence-${index + 1}`, sourceKey: evidenceSource, scopeKey, locator })) }; }
function specEvidence(fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] { return { key: `paili-002-${fieldKey}`, fieldKey, sourceKey, scopeKey: modelScope, locator }; }

const brand: CuratedEntityPack = {
  key: "phase218-paili-brand", entityId: PHASE218_PAILI_BRAND_ID, expectedType: "brand", expectedSlug: "paili", canonicalName: "派利 Paili", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/paili-brand-phase218.md", storyTitle: "派利 Paili：把 002 的透明示范笔与 013 的真空路线分开", primarySourceKey: S.orange.key, depthTier: "B",
  aliases: [{ alias: "Paili", language: "en", sourceKey: S.orange.key }, { alias: "派利", language: "zh", sourceKey: S.orange.key }, { alias: "Pai Li", language: "en", sourceKey: S.fpn.key }],
  sources: [S.orange, S.blue, S.fpn, S.brandSvg], scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "current", editionScope: "Paili 品牌入口；002 透明示范笔与 013／Wing Sung 3013 真空路线分开，现代同名渠道和未证实型号不纳入。" }],
  claims: [
    claim("paili-brand-identity", "brand_identity", "公开零售和社区资料把 Paili 作为中国低价钢笔品牌／标记使用；目前没有足够证据补写完整公司史、统一工厂或全部型号目录。", S.orange.key, brandScope, "Paili brand field on 002 retailer page", [S.fpn.key, S.brandSvg.key]),
    claim("paili-002-navigation", "brand_model_family", "Paili 002 是目前库存里资料最清楚的型号，透明颜色、EF 尖、金色夹与饰件、converter type 和 SKU 可由零售页核对。", S.orange.key, brandScope, "Paili 002 product title and SKU", [S.blue.key]),
    claim("paili-013-boundary", "model_boundary", "社区资料里的 Paili 013／Wing Sung 3013 是另一条透明真空／推杆大容量产品线；不能把它的结构、容量和图片移到 002。", S.fpn.key, brandScope, "3013/Paili 013 vacuum filler boundary", [S.brandSvg.key]),
    claim("paili-variant-boundary", "variant_boundary", "002 的 Transparent Orange（25204）和 Transparent Blue（25206）应作为颜色／市场 SKU，不能因为颜色不同就创建不同机械型号。", S.orange.key, brandScope, "orange and blue SKU pages", [S.blue.key]),
    claim("paili-source-boundary", "source_boundary", "Paili 资料以零售页和社区实测为主；库存、价格和品控会随渠道变化，页面不把低价或‘好写’写成品牌固定属性。", S.orange.key, brandScope, "out-of-stock and channel metadata boundary", [S.fpn.key]),
    claim("paili-selection", "selection_guidance", "选购 Paili 应先核对具体型号、SKU、尖幅、上墨方式和随附配件；标题同时出现 002、013、3013 或 Wing Sung 时，应视为待核实混名。", S.blue.key, brandScope, "model/SKU and filling-system selection boundary", [S.fpn.key]),
  ],
  variants: [{ key: "paili-002-line", name: "Paili 002 透明示范笔", notes: "零售页已确认的型号入口；颜色和 SKU 在型号页记录。", sourceKey: S.orange.key, variantKind: "edition_group" }, { key: "paili-013-line", name: "Paili 013／Wing Sung 3013 研究线", notes: "社区资料中的另一产品线；不并入 002。", sourceKey: S.fpn.key, variantKind: "edition_group" }],
  media: [{ key: "paili-brand-primary", title: S.brandSvg.title, sourceKey: S.brandSvg.key, localPath: S.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；品牌导航示意，非产品照片，不代表真实比例、颜色、Logo、工厂或完整目录。", sourceUrl: S.brandSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "paili-002-retail-window", title: "Paili 002 以多个透明色 SKU 出现在零售资料", eventType: "model_released", startDate: "2021", circa: true, description: "Penhouse 页面以不同 SKU 记录 002 的透明橙和透明蓝商品；页面时间与库存随渠道变化，不等同首发年份。", sourceKey: S.orange.key }, { key: "paili-013-community-window", title: "Paili 013／Wing Sung 3013 进入社区评测语境", eventType: "community_event", startDate: "2019", circa: true, description: "Fountain Pen Network 的评测记录另一条 013／3013 真空路线，为品牌页划出型号边界。", sourceKey: S.fpn.key }],
};

const model: CuratedEntityPack = {
  key: PHASE218_PAILI_SOURCE_KEY, entityId: PHASE218_PAILI_002_ID, expectedType: "pen", expectedSlug: PHASE218_PAILI_002_SLUG, canonicalName: "派利 Paili 002", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/paili-002-phase218.md", storyTitle: "派利 Paili 002：透明示范笔、EF 尖和 converter 路线", primarySourceKey: S.orange.key, depthTier: "B",
  aliases: [{ alias: "Paili 002", language: "en", sourceKey: S.orange.key }, { alias: "派利 002", language: "zh", sourceKey: S.orange.key }, { alias: "Paili 002 Demonstrator", language: "en", sourceKey: S.blue.key }, { alias: "派利 002 透明示范笔", language: "zh", sourceKey: S.orange.key }],
  sources: [S.orange, S.blue, S.fpn, S.modelSvg], scopes: [{ key: modelScope, scopeKey: modelScope, productionState: "current", materialScope: "零售页所见透明笔身、金色夹与饰件；树脂牌号、重量和统一尺寸未核实。", editionScope: "Paili 002；Transparent Orange 25204、Transparent Blue 25206 是颜色／市场 SKU，不覆盖 Paili 013／Wing Sung 3013。" }],
  claims: [
    claim("paili-002-identity", "model_identity", "Paili 002 是零售页明确列出的透明示范笔型号；002 与 Paili 013／Wing Sung 3013 的数字和结构不能混写。", S.orange.key, modelScope, "Paili 002 product title and SKU", [S.blue.key, S.fpn.key, S.modelSvg.key]),
    claim("paili-002-color-sku", "variant_boundary", "Penhouse 页面记录 Transparent Orange SKU 25204 与 Transparent Blue SKU 25206；它们共享 002 型号身份，颜色和 SKU 不应生成重复机械型号。", S.orange.key, modelScope, "orange/blue SKU pages", [S.blue.key]),
    claim("paili-002-nib", "nib_boundary", "零售页将 002 标为 EF；实际线宽需按单支、纸张和调校实测，资料不支持金尖或统一 EF 宽度保证。", S.orange.key, modelScope, "EF Nib in product title", [S.blue.key]),
    claim("paili-002-filling", "filling_system", "零售页写 Converter Type；是否随附 converter、接口和吸墨表现应按 SKU 与卖家确认，不把 013／3013 的真空填充移过来。", S.orange.key, modelScope, "converter type and 013/3013 boundary", [S.fpn.key]),
    claim("paili-002-material", "material_boundary", "透明笔身是示范外观线索，但透明树脂牌号、具体厚度和耐久度未由零售页核实；金色夹与饰件也不等于金尖。", S.blue.key, modelScope, "transparent color and gold clip/trim fields"),
    claim("paili-002-dimensions", "dimensions", "渠道页只给 Pen Size: Medium，未提供统一毫米尺寸；不能从商品图或其它 Paili 型号推断长度、直径和重量。", S.orange.key, modelScope, "Pen Size: Medium and no universal measurements"),
    claim("paili-002-care", "maintenance_guidance", "透明件和细螺纹应少拆、低压清洗；首次上墨先用清水测试 converter，避免热水、酒精和硬物扩 EF 尖缝。", S.orange.key, modelScope, "transparent demonstrator maintenance boundary", [S.modelSvg.key]),
    claim("paili-002-selection", "selection_guidance", "购买要核对 002 刻字、颜色 SKU、EF 尖、converter 是否随附、透明件裂纹和退换条件；标题混入 013／3013 时先要求实拍。", S.blue.key, modelScope, "SKU and accessory/condition selection", [S.fpn.key]),
    claim("paili-002-status", "availability", "Penhouse 页面显示部分 002 SKU 可能 out of stock；价格和库存是渠道观察，不是当前统一售价或品牌承诺。", S.orange.key, modelScope, "out of stock and dated ₹254.24 channel listing", [S.blue.key]),
  ],
  variants: [{ key: "paili-002-orange", name: "Transparent Orange", notes: "Penhouse SKU 25204；颜色版本，实拍与库存按渠道核对。", sourceKey: S.orange.key, variantKind: "color", productCode: "25204" }, { key: "paili-002-blue", name: "Transparent Blue", notes: "Penhouse SKU 25206；颜色版本，不能使用橙色版本实拍替代。", sourceKey: S.blue.key, variantKind: "color", productCode: "25206" }],
  spec: { brandEntityId: PHASE218_PAILI_BRAND_ID, values: { series_name: "Paili 002", release_year: "零售资料窗口；具体首发年份未核实", origin_country: "中国品牌／渠道语境；生产地未由本包来源确认", nib: "EF（零售页标记；单支线宽需实测）", fill_system: "converter type；是否随附按 SKU/卖家确认", material: "透明笔身；树脂牌号未核实", dimensions: "Pen Size: Medium；渠道页未给统一毫米尺寸", weight: "Product Weight: Lesser；渠道页未给统一克重", price_range: "Penhouse 检索页显示 ₹254.24 的渠道观察；价格与库存会变化", status: "低价渠道型号；颜色 SKU 和库存随地区、时间变化" }, evidence: [specEvidence("brand_entity_id", S.orange.key, "Paili brand field"), specEvidence("series_name", S.orange.key, "Paili 002 title"), specEvidence("release_year", S.orange.key, "retail availability window only"), specEvidence("origin_country", S.fpn.key, "Chinese market/community context"), specEvidence("nib", S.orange.key, "EF Nib"), specEvidence("fill_system", S.orange.key, "Converter Type"), specEvidence("material", S.blue.key, "transparent body/color listing"), specEvidence("dimensions", S.orange.key, "Pen Size: Medium; no mm values"), specEvidence("weight", S.orange.key, "Product Weight: Lesser; no grams"), specEvidence("price_range", S.orange.key, "dated ₹254.24 listing"), specEvidence("status", S.orange.key, "out-of-stock/channel status") ] },
  media: [{ key: "paili-002-primary", title: S.modelSvg.title, sourceKey: S.modelSvg.key, localPath: S.modelSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；结构示意，非产品照片，不代表真实比例、颜色、内腔、Logo、编号或生产批次。", sourceUrl: S.modelSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "paili-002-retail-record", title: "Paili 002 的透明色 SKU 进入零售记录", eventType: "model_released", startDate: "2021", circa: true, description: "Penhouse 页面记录 Transparent Orange 25204 与 Transparent Blue 25206；具体首发时间未知。", sourceKey: S.orange.key }],
};

export const phase218Paili002Packs: CuratedEntityPack[] = [brand, model];
