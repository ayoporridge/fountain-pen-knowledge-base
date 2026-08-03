import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE281_M215_ID,
  PHASE281_PELIKAN_ID,
  phase281PelikanM205M215Packs,
} from "./phase281-pelikan-m205-m215";

export const PHASE418_PELIKAN_BRAND_ID = PHASE281_PELIKAN_ID;
export const PHASE418_M215_ID = PHASE281_M215_ID;
export const PHASE418_M215_SLUG = "pelikan-m215";
export const PHASE418_M215_NAME = "Pelikan M215";

const RETRIEVED = "2026-08-03";

function web(input: { key: string; registryKey: string; registryName: string; title: string; url: string; summary: string; sourceType?: CuratedSource["sourceType"]; tier?: CuratedSource["tier"]; author?: string; publishedAt?: string; itemType?: string }): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: sourceType === "official" ? "https://www.pelikan.com/" : input.url.startsWith("/") ? "/" : new URL(input.url).origin,
    itemType: input.itemType ?? (input.url.toLowerCase().includes(".pdf") ? "pdf" : "web_page"),
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const EXTRA_SOURCES: CuratedSource[] = [
  web({ key: "phase418-pelikan-m215-black-rings", registryKey: "pelikan-mam-m215-948281-phase418", registryName: "Pelikan MAM product archive", title: "Classic M215 Black-Rings M — product 948281", url: "https://mam.pelikan.com/mam/en/pelikan/products/948281", summary: "官方 MAM 资料确认 M215 Black-Rings 的 M 尖、活塞、黄铜轴、高等级树脂外壳和银色饰件。" }),
  web({ key: "phase418-pelikan-m215-black-rings-455", registryKey: "pelikan-mam-m215-948455-phase418", registryName: "Pelikan MAM product archive", title: "Classic M215 Black-Rings M — product 948455", url: "https://mam.pelikan.com/mam/en/pelikan/products/948455", summary: "官方产品分类的另一 M215 Black-Rings M 记录，用于 SKU 与产品资料边界，不扩写为当前全球库存。" }),
  web({ key: "phase418-pelikan-m215-table", registryKey: "pelikan-mam-m215-table-phase418", registryName: "Pelikan MAM product archive", title: "Pelikan M215 product category", url: "https://mam.pelikan.com/mam/en/pelikan/products?product_filter%5BtaxonomyNode%5D=1269", summary: "官方 M215 分类页列出 948281、948455 等产品号，支持把尖幅和商品记录分开。" }),
  web({ key: "phase418-pelikan-m215-fwi", registryKey: "pelikan-fwi-m215-1030028-phase418", registryName: "Pelikan Fine Writing official", title: "Fine Writing M215 and P205 product information", url: "https://mam.pelikan.com/en/pelikan/media/1030028/download", summary: "官方资料列出 M215 活塞、抛光钢尖、银色高光饰件、黄铜轴、高等级树脂外壳、EF/F/M/B 和约 1.3 ml 当前口径。" }),
  web({ key: "phase418-pelikan-m215-catalog-2025", registryKey: "pelikan-catalog-2025-m215-phase418", registryName: "Pelikan Fine Writing current catalogue", title: "Fine Writing Instruments catalogue 2025", url: "https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf", publishedAt: "2025", summary: "官方目录用于 Classic 215 的家族位置、当前商品量测与 M215/P205 上墨边界，历史数字不与档案表混写。" }),
  web({ key: "phase418-pelikan-catalog-2022", registryKey: "pelikan-catalog-2022-m215-phase418", registryName: "Pelikan Fine Writing archive", title: "Fine Writing Instruments 2022 catalogue", url: "https://www.pelikan.com/images/assets/catalogs/fine-writing-instruments-2022-catalog-en.pdf", publishedAt: "2022", summary: "官方历史目录保留 Classic 215 Rings 和产品家族版式，用于核对资料保存状态而非推断地区现货。" }),
  web({ key: "phase418-pelikan-collectibles-m215", registryKey: "pelikan-collectibles-m215-phase418", registryName: "Pelikan Collectibles", sourceType: "blog", author: "Pelikan Collectibles editorial archive", title: "Pelikan M215 Colours and Variants", url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Classic-Series/M200-Basis/index.html", summary: "专业档案记录四种 M215 图案、2005–2013 年份、黄铜套筒、钢尖、20 g、125 mm 和 1.20 ml 历史表。" }),
  web({ key: "phase418-pelikan-perch-m215", registryKey: "the-pelikans-perch-m215-phase418", registryName: "The Pelikan's Perch", sourceType: "blog", author: "Joshua Danley", title: "Pelikan M215 model database", url: "https://thepelikansperch.com/database/fountain-pens/m2xx/m215/", summary: "专业型号档案补充 M215 与 M200/M205 同尺寸、金属笔杆重量、深色墨窗、crown cap、铑色饰件和单帽环。" }),
  web({ key: "phase418-pelikan-penaddict", registryKey: "pen-addict-m215-rings-phase418", registryName: "The Pen Addict", sourceType: "blog", author: "Brad Dowdy", title: "Pelikan M215 Rings review", url: "https://www.penaddict.com/blog/2014/3/21/pelikan-m215-rings-fountain-pen-review", publishedAt: "2014", summary: "专业评述对照 M215 Rings 约 20 g 与 M205 14 g 的重量感；仅作书写场景参考，不升级为全系硬规格。" }),
  web({ key: "phase418-pelikan-penography", registryKey: "penography-m215-phase418", registryName: "Pelikan Penography", sourceType: "blog", author: "Pelikan Penography editorial", title: "Pelikan Penography 6: M215", url: "https://penstylo.blogspot.com/p/pelikan-penography-6.html", summary: "专业资料索引 M215 2005 起点、四种图案和黄铜笔杆覆层，作为历史交叉证据。" }),
  web({ key: "phase418-pelikan-care", registryKey: "pelikan-official-care-m215-phase418", registryName: "Pelikan official care", title: "Pelikan writing instruments care instructions", url: "https://www.pelikan.com/int/products/writing-instruments/care-instructions.html", summary: "官方护理页支持冷水吸排、避免热水／肥皂／酒精和长期收纳前排空。" }),
  web({ key: "phase418-pelikan-faq", registryKey: "pelikan-official-faq-m215-phase418", registryName: "Pelikan official FAQ", title: "FAQ: piston filling and cleaning", url: "https://www.pelikan.com/int/products/writing/145-international/services/541-faq.html", summary: "官方 FAQ 说明活塞笔从瓶中吸墨、排空和清水清洗路径。" }),
  web({ key: "phase418-pelikan-goulet", registryKey: "goulet-pelikan-family-phase418", registryName: "Goulet Pens", sourceType: "retailer", tier: "retailer", title: "Pelikan Souverän and Classic family comparison", url: "https://www.gouletpens.com/blogs/fountain-pen-blog/pelikan-souveran-fountain-pen-comparison", summary: "可靠零售编辑用于 M215 与 Classic/Souverän 相邻家族导航，不回填 M200/M205/M400 的不同材料和规格。" }),
  web({ key: "phase418-pelikan-penpaper", registryKey: "penpaperpencil-m215-phase418", registryName: "Pen Paper Pencils", sourceType: "blog", author: "Ian Hedley", title: "Pelikan M215 fountain pen review", url: "https://penpaperpencil.net/pelikan-m215-fountain-pen/", summary: "专业评述补充 M215 深色墨窗和金属外壳的使用观察；只作体验语境。" }),
  web({ key: "phase418-pelikan-svg", registryKey: "fountain-pen-graph-editorial-m215-phase418", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", title: "Pelikan M215 identity boundary factual SVG", url: "/images/library/site-original/phase281/pelikan/m215.svg", itemType: "image", summary: "本站原创 factual SVG，只表达黄铜内层、树脂外壳、银色饰件和活塞边界；非产品照片、非 Logo、非比例图、非颜色校样。" }),
];

const EXTRA_VARIANTS: CuratedVariant[] = [
  { key: "m215-blue-striped", name: "M215 Blue-Striped", releaseYear: "2005–2006", notes: "首个蓝色条纹图案路线，黑色笔帽、银色饰件和黄铜内层；不写成蓝色 M200。", sourceKey: "phase418-pelikan-collectibles-m215", variantKind: "color", parentVariantKey: "m215-black-rings" },
  { key: "m215-rings-pattern", name: "M215 Rings pattern", releaseYear: "2006", notes: "黑色笔杆的环纹路线；官方 948281 M 尖是 SKU 样本。", sourceKey: "phase418-pelikan-m215-black-rings", variantKind: "color", parentVariantKey: "m215-black-rings", productCode: "948281" },
  { key: "m215-lozenges", name: "M215 Lozenges", releaseYear: "2007–2013", notes: "黑色菱形图案；资料中偶见 Lonzenges 拼写，按来源保留别名而不建重复实体。", sourceKey: "phase418-pelikan-collectibles-m215", variantKind: "color", parentVariantKey: "m215-black-rings" },
  { key: "m215-rectangles", name: "M215 Rectangles / Orthogons", releaseYear: "2008–2013", notes: "矩形／正交图案；两个专业来源的英文称呼指向同一 M215 图案路线。", sourceKey: "phase418-pelikan-perch-m215", variantKind: "color", parentVariantKey: "m215-black-rings" },
  { key: "m215-ef", name: "M215 stainless steel EF", releaseYear: "按 SKU", notes: "EF 是尖幅选项，不是独立型号；具体线宽须结合纸张和调校。", sourceKey: "phase418-pelikan-m215-fwi", variantKind: "nib", parentVariantKey: "m215-black-rings" },
  { key: "m215-f", name: "M215 stainless steel F", releaseYear: "按 SKU", notes: "F 是常见尖幅；二手笔要确认是否原装。", sourceKey: "phase418-pelikan-m215-fwi", variantKind: "nib", parentVariantKey: "m215-black-rings" },
  { key: "m215-m", name: "M215 stainless steel M", releaseYear: "按 SKU", notes: "948281 是 M 尖官方样本，不外推为所有图案唯一尖幅。", sourceKey: "phase418-pelikan-m215-black-rings", variantKind: "nib", parentVariantKey: "m215-black-rings", productCode: "948281" },
  { key: "m215-b", name: "M215 stainless steel B", releaseYear: "按 SKU", notes: "B 是尖幅选项；产品号与市场需要逐项核对。", sourceKey: "phase418-pelikan-m215-fwi", variantKind: "nib", parentVariantKey: "m215-black-rings" },
  { key: "m215-brass-boundary", name: "M215 brass inner barrel", releaseYear: "2005 起", notes: "黄铜轴／套筒是 M215 的材料身份核心，外面仍有树脂和涂层，不可只靠金属反光判断。", sourceKey: "phase418-pelikan-m215-black-rings", variantKind: "material", parentVariantKey: "m215-black-rings" },
  { key: "m215-sku-948281", name: "M215 Black-Rings M 948281", releaseYear: "官方产品记录", notes: "Black-Rings M 尖 SKU；产品资料存在不等于所有地区当前现货。", sourceKey: "phase418-pelikan-m215-black-rings", variantKind: "market_sku", parentVariantKey: "m215-black-rings", productCode: "948281", market: "global archive" },
  { key: "m215-sku-948455", name: "M215 Black-Rings M 948455", releaseYear: "官方产品记录", notes: "另一个 M215 Black-Rings M 记录，保留为 SKU 导航而非新基础型号。", sourceKey: "phase418-pelikan-m215-black-rings-455", variantKind: "market_sku", parentVariantKey: "m215-black-rings", productCode: "948455", market: "global archive" },
  { key: "m205-boundary", name: "M205 resin silver-trim boundary", releaseYear: "Classic 200 family", notes: "M205 是轻量树脂银饰活塞路线；不能把 M215 的黄铜内层和约 20 g 回填给 M205。", sourceKey: "phase418-pelikan-perch-m215", variantKind: "edition_group" },
  { key: "m200-boundary", name: "M200 gold-trim boundary", releaseYear: "Classic 200 family", notes: "M200 是金色饰件／镀金钢尖路线；不要以“200 系列”合并。", sourceKey: "phase418-pelikan-m215-fwi", variantKind: "edition_group" },
  { key: "m250-boundary", name: "M250 gold-nib boundary", releaseYear: "1997 后历史路线", notes: "M250 的 14 ct 金尖不能复制到 M215；换尖个体保留改装记录。", sourceKey: "phase418-pelikan-collectibles-m215", variantKind: "edition_group" },
  { key: "p205-boundary", name: "P205 cartridge boundary", releaseYear: "Classic 200 cartridge route", notes: "P205 使用墨囊／转换器；握位前端接口和尾部不是 M215 的活塞结构。", sourceKey: "phase418-pelikan-m215-fwi", variantKind: "edition_group" },
];

const EXTRA_SCOPES: CuratedScope[] = [
  { key: "phase418-current", scopeKey: "pelikan-m215-current-classic-215", market: "global", productionState: "current", nibScope: "polished stainless steel; EF/F/M/B by SKU", materialScope: "brass shaft or sleeve under high-grade resin casing; silver/chrome trim", editionScope: "Classic 215 platform; four principal patterns" },
  { key: "phase418-blue", scopeKey: "pelikan-m215-blue-striped-2005", variantKey: "m215-blue-striped", validFrom: "2005", validTo: "2006", productionState: "historical", materialScope: "blue coated brass barrel, black cap", editionScope: "Blue-Striped pattern" },
  { key: "phase418-rings", scopeKey: "pelikan-m215-rings-2006", variantKey: "m215-rings-pattern", validFrom: "2006", productionState: "historical", materialScope: "black coated brass barrel and silver rings", editionScope: "Rings pattern" },
  { key: "phase418-lozenges", scopeKey: "pelikan-m215-lozenges-2007", variantKey: "m215-lozenges", validFrom: "2007", validTo: "2013", productionState: "historical", materialScope: "black patterned barrel", editionScope: "Lozenges pattern" },
  { key: "phase418-rectangles", scopeKey: "pelikan-m215-rectangles-2008", variantKey: "m215-rectangles", validFrom: "2008", validTo: "2013", productionState: "historical", materialScope: "black patterned barrel", editionScope: "Rectangles / Orthogons pattern" },
  { key: "phase418-nibs", scopeKey: "pelikan-m215-nib-options", variantKey: "m215-m", productionState: "current", nibScope: "EF/F/M/B stainless steel; exact SKU and replacement status required", editionScope: "nib width variants" },
  { key: "phase418-measurements", scopeKey: "pelikan-m215-historical-measurements", validFrom: "2005", productionState: "historical", materialScope: "archive measurement table", editionScope: "125 mm, 12 mm, 20.0 g and 1.20 ml reference" },
  { key: "phase418-current-measurements", scopeKey: "pelikan-m215-current-catalogue-measurements", validFrom: "2022", productionState: "current", materialScope: "current catalogue convention", editionScope: "about 1.3 ml; other dimensions by source" },
  { key: "phase418-m205", scopeKey: "pelikan-m215-versus-m205", variantKey: "m205-boundary", productionState: "current", materialScope: "resin silver-trim sibling", editionScope: "lighter Classic 200 route" },
  { key: "phase418-m200", scopeKey: "pelikan-m215-versus-m200", variantKey: "m200-boundary", productionState: "current", editionScope: "gold-trim steel route" },
  { key: "phase418-m250", scopeKey: "pelikan-m215-versus-m250", variantKey: "m250-boundary", productionState: "historical", nibScope: "14 ct gold nib sibling", editionScope: "gold-nib boundary" },
  { key: "phase418-p205", scopeKey: "pelikan-m215-versus-p205", variantKey: "p205-boundary", productionState: "current", editionScope: "cartridge/converter sibling" },
  { key: "phase418-care", scopeKey: "pelikan-m215-care-2026", validFrom: RETRIEVED, productionState: "current", editionScope: "cold-water flushing and professional repair boundary" },
  { key: "phase418-media", scopeKey: "pelikan-m215-factual-svg-2026", validFrom: RETRIEVED, productionState: "current", editionScope: "site-original factual SVG; non-product photo and not to scale" },
];

const EXTRA_CLAIMS: CuratedClaim[] = [
  { key: "phase418-identity", predicate: "model_identity", objectText: "Pelikan M215 是 Classic 200 的黄铜内层／树脂外壳金属笔杆 sibling，配银色／铑色饰件、抛光不锈钢尖和瓶装差动活塞。", factClass: "core", confidence: 0.99, sourceKey: "phase418-pelikan-m215-black-rings", locator: "948281 official product fields", evidence: [{ key: "phase418-identity-mam", sourceKey: "phase418-pelikan-m215-black-rings", scopeKey: "phase418-current", locator: "brass shaft, resin casing, piston and trim" }, { key: "phase418-identity-fwi", sourceKey: "phase418-pelikan-m215-fwi", scopeKey: "phase418-current", locator: "official M215 family listing" }] },
  { key: "phase418-history", predicate: "production_history", objectText: "专业档案记录 M215 于 2005 年推出，依次出现 Blue-Striped、Rings、Lozenges 和 Rectangles／Orthogons 四种主要图案。", factClass: "core", confidence: 0.98, sourceKey: "phase418-pelikan-collectibles-m215", locator: "M215 four-pattern chronology", evidence: [{ key: "phase418-history-archive", sourceKey: "phase418-pelikan-collectibles-m215", scopeKey: "phase418-blue", locator: "2005–2008 four pattern records" }, { key: "phase418-history-penography", sourceKey: "phase418-pelikan-penography", scopeKey: "phase418-rings", locator: "2005 M215 introduction and patterns" }] },
  { key: "phase418-material", predicate: "material_boundary", objectText: "黄铜轴／套筒藏在高等级树脂外壳内，使 M215 的档案重量约 20 g；金属层不能被误写成裸露金属笔杆或复制给 M205。", factClass: "core", confidence: 0.99, sourceKey: "phase418-pelikan-m215-black-rings", locator: "brass shaft and high-grade resin casing", evidence: [{ key: "phase418-material-mam", sourceKey: "phase418-pelikan-m215-black-rings", scopeKey: "phase418-current", locator: "brass shaft with high-grade finish" }, { key: "phase418-material-perch", sourceKey: "phase418-pelikan-perch-m215", scopeKey: "phase418-current", locator: "metal barrel distinguishes M215" }] },
  { key: "phase418-fill", predicate: "filling_system", objectText: "M215 使用差动活塞从瓶中吸入钢笔墨；P205 的墨囊／转换器结构不能写入 M215。", factClass: "core", confidence: 0.99, sourceKey: "phase418-pelikan-m215-fwi", locator: "M215 piston versus P205 cartridge listing", evidence: [{ key: "phase418-fill-fwi", sourceKey: "phase418-pelikan-m215-fwi", scopeKey: "phase418-p205", locator: "official piston and cartridge family boundary" }] },
  { key: "phase418-measurements", predicate: "measurement_scope", objectText: "历史档案约列闭帽 125 mm、直径 12 mm、20.0 g、1.20 ml；官方当前资料另列约 1.3 ml，正文按历史／当前口径分层。", factClass: "core", confidence: 0.98, sourceKey: "phase418-pelikan-collectibles-m215", locator: "M215 historical table", evidence: [{ key: "phase418-measurements-history", sourceKey: "phase418-pelikan-collectibles-m215", scopeKey: "phase418-measurements", locator: "125 mm, 12 mm, 20.0 g, 1.20 ml" }, { key: "phase418-measurements-current", sourceKey: "phase418-pelikan-m215-fwi", scopeKey: "phase418-current-measurements", locator: "about 1.3 ml current catalogue" }] },
  { key: "phase418-nib", predicate: "nib_scope", objectText: "M215 以抛光不锈钢尖为主，官方资料列 EF、F、M、B；换尖只改变当前笔况，不自动把 M215 变成 M200 或 M250。", factClass: "core", confidence: 0.98, sourceKey: "phase418-pelikan-m215-fwi", locator: "official EF/F/M/B stainless nib fields", evidence: [{ key: "phase418-nib-fwi", sourceKey: "phase418-pelikan-m215-fwi", scopeKey: "phase418-nibs", locator: "EF/F/M/B options" }, { key: "phase418-nib-units", sourceKey: "phase281-pelikan-classic-archive", scopeKey: "phase418-current", locator: "replaceable nib context" }] },
  { key: "phase418-trim", predicate: "trim_boundary", objectText: "M215 与 M205 都可见银色／铑色饰件，但 M215 的黄铜内层和四种图案才是核心分界；银色夹子不能单独完成型号判断。", factClass: "editorial", confidence: 0.97, sourceKey: "phase418-pelikan-perch-m215", locator: "M215 rhodium trim and patterned barrel", evidence: [{ key: "phase418-trim-perch", sourceKey: "phase418-pelikan-perch-m215", scopeKey: "phase418-m205", locator: "M215 versus M205 structure and trim" }] },
  { key: "phase418-care", predicate: "care_boundary", objectText: "官方维护以排空后冷水吸排为主，避免热水、肥皂、酒精和金属抛光剂；裂纹、尾钮卡滞、漏墨或尖座松动时送专业维修。", factClass: "core", confidence: 0.99, sourceKey: "phase418-pelikan-care", locator: "official care instructions", evidence: [{ key: "phase418-care-official", sourceKey: "phase418-pelikan-care", scopeKey: "phase418-care", locator: "cold water and no harsh cleaners" }, { key: "phase418-care-faq", sourceKey: "phase418-pelikan-faq", scopeKey: "phase418-care", locator: "piston filling and cleaning FAQ" }] },
  { key: "phase418-buying", predicate: "second_hand_identification", objectText: "二手 M215 应检查图案、黄铜内层线索、深色墨窗、尾部活塞、尖刻字、称重条件、帽环和维修史；远景图不足时保留待核。", factClass: "editorial", confidence: 0.97, sourceKey: "phase418-pelikan-perch-m215", locator: "M215 visual and weight identification cues", evidence: [{ key: "phase418-buying-perch", sourceKey: "phase418-pelikan-perch-m215", scopeKey: "phase418-current", locator: "pattern, dark ink window, trim and weight" }, { key: "phase418-buying-mam", sourceKey: "phase418-pelikan-m215-table", scopeKey: "phase418-current", locator: "SKU and nib verification" }] },
  { key: "phase418-variants", predicate: "variant_recording", objectText: "四种图案、尖幅和产品号作为 M215 variant／SKU 记录，不为 Blue-Striped、Rings、Lozenges、Rectangles 各建重复基础实体。", factClass: "editorial", confidence: 0.97, sourceKey: "phase418-pelikan-collectibles-m215", locator: "M215 pattern table", evidence: [{ key: "phase418-variants-archive", sourceKey: "phase418-pelikan-collectibles-m215", scopeKey: "phase418-blue", locator: "four patterns and production periods" }] },
  { key: "phase418-media", predicate: "editorial_media_scope", objectText: "本站原创 SVG 只解释黄铜内层、树脂外壳、银色饰件、钢尖和活塞边界，明确非产品照片、非 Logo、非真实比例、非颜色校样。", factClass: "editorial", confidence: 0.99, sourceKey: "phase418-pelikan-svg", locator: "SVG description and footer disclaimer", evidence: [{ key: "phase418-media-svg", sourceKey: "phase418-pelikan-svg", scopeKey: "phase418-media", locator: "site-original factual SVG" }] },
];

const EXTRA_SPEC_EVIDENCE: CuratedSpecEvidence[] = [
  { key: "phase418-brand", fieldKey: "brand_entity_id", sourceKey: "phase418-pelikan-m215-black-rings", scopeKey: "phase418-current", locator: "official M215 product identity" },
  { key: "phase418-series", fieldKey: "series_name", sourceKey: "phase418-pelikan-m215-fwi", scopeKey: "phase418-current", locator: "Classic 215 family heading" },
  { key: "phase418-release", fieldKey: "release_year", sourceKey: "phase418-pelikan-collectibles-m215", scopeKey: "phase418-blue", locator: "2005 introduction and pattern chronology" },
  { key: "phase418-origin", fieldKey: "origin_country", sourceKey: "phase418-pelikan-m215-black-rings", scopeKey: "phase418-current", locator: "Pelikan product context; no unsupported factory inference" },
  { key: "phase418-nib", fieldKey: "nib", sourceKey: "phase418-pelikan-m215-fwi", scopeKey: "phase418-nibs", locator: "polished stainless steel and EF/F/M/B fields" },
  { key: "phase418-fill", fieldKey: "fill_system", sourceKey: "phase418-pelikan-m215-fwi", scopeKey: "phase418-current", locator: "piston mechanism" },
  { key: "phase418-material", fieldKey: "material", sourceKey: "phase418-pelikan-m215-black-rings", scopeKey: "phase418-current", locator: "brass shaft and resin casing" },
  { key: "phase418-dimensions", fieldKey: "dimensions", sourceKey: "phase418-pelikan-collectibles-m215", scopeKey: "phase418-measurements", locator: "125 mm and 12 mm historical table" },
  { key: "phase418-weight", fieldKey: "weight", sourceKey: "phase418-pelikan-collectibles-m215", scopeKey: "phase418-measurements", locator: "20.0 g historical table" },
  { key: "phase418-status", fieldKey: "status", sourceKey: "phase418-pelikan-collectibles-m215", scopeKey: "phase418-current", locator: "four patterns and archive/current boundary" },
];

const BASE_M215 = phase281PelikanM205M215Packs.find((pack) => pack.entityId === PHASE418_M215_ID && pack.expectedType === "pen");
if (!BASE_M215) throw new Error("Phase 418 requires the existing Phase 281 Pelikan M215 pack.");

const refreshedM215: CuratedEntityPack = {
  ...structuredClone(BASE_M215),
  key: "phase418-pelikan-m215-refresh-v1",
  canonicalName: PHASE418_M215_NAME,
  markdownFile: ".planning/content-research/pelikan-m215-phase418.md",
  storyTitle: "Pelikan M215：黄铜内层、四种图案与 Classic 200 重量边界",
  primarySourceKey: "phase418-pelikan-m215-black-rings",
  sources: [...BASE_M215.sources, ...EXTRA_SOURCES],
  aliases: [
    ...BASE_M215.aliases,
    { alias: "Pelikan Classic M215", language: "en", sourceKey: "phase418-pelikan-m215-fwi" },
    { alias: "M 215", language: "en", sourceKey: "phase418-pelikan-m215-black-rings" },
    { alias: "Pelikan M215 Blue-Striped / Rings / Lozenges / Rectangles", language: "en", sourceKey: "phase418-pelikan-collectibles-m215" },
  ],
  variants: [...(BASE_M215.variants ?? []), ...EXTRA_VARIANTS],
  scopes: [...BASE_M215.scopes, ...EXTRA_SCOPES],
  claims: [...BASE_M215.claims, ...EXTRA_CLAIMS],
  spec: BASE_M215.spec
    ? {
        ...BASE_M215.spec,
        values: {
          ...BASE_M215.spec.values,
          series_name: "Pelikan Classic 215",
          release_year: "2005 Blue-Striped；2006 Rings；2007 Lozenges；2008 Rectangles／Orthogons",
          origin_country: "德国品牌；具体制造地按官方产品页、包装或实物核对",
          nib: "抛光不锈钢尖；EF/F/M/B 依官方 SKU，换尖个体另核",
          fill_system: "内置差动活塞；瓶装钢笔墨；不可写成 P205 墨囊接口",
          material: "黄铜轴／套筒、高等级树脂外壳、银色／铑色饰件；图案按版本核对",
          dimensions: "历史档案约闭帽 125 mm、笔杆 102 mm、笔帽 57 mm、直径 12 mm；当前目录约 1.3 ml",
          weight: "历史档案约 20.0 g；实测需注明是否含墨和笔帽",
          status: "Classic 200 金属笔杆历史／地区 SKU 路线；四种图案和库存按来源核对",
        },
        evidence: [...BASE_M215.spec.evidence, ...EXTRA_SPEC_EVIDENCE],
      }
    : undefined,
  media: BASE_M215.media,
  timeline: [
    ...(BASE_M215.timeline ?? []),
    { key: "phase418-m215-2005", title: "M215 Blue-Striped 路线记录", eventType: "model_released", startDate: "2005", circa: false, description: "M215 以蓝色条纹、黄铜内层、银色饰件和钢尖活塞路线进入 Classic 200 档案。", sourceKey: "phase418-pelikan-collectibles-m215" },
    { key: "phase418-m215-2006", title: "Rings 图案记录", eventType: "model_released", startDate: "2006", circa: false, description: "Black-Rings 成为官方 M215 产品资料中的主要 SKU 样本。", sourceKey: "phase418-pelikan-m215-black-rings" },
    { key: "phase418-m215-2007", title: "Lozenges 图案记录", eventType: "model_released", startDate: "2007", circa: false, description: "黑色菱形图案作为 M215 路线版本记录。", sourceKey: "phase418-pelikan-collectibles-m215" },
    { key: "phase418-m215-2008", title: "Rectangles／Orthogons 图案记录", eventType: "model_released", startDate: "2008", circa: false, description: "矩形／正交图案在专业档案中作为第四种 M215 路线出现。", sourceKey: "phase418-pelikan-perch-m215" },
  ],
};

export const phase418PelikanM215RefreshPacks: CuratedEntityPack[] = [refreshedM215];
