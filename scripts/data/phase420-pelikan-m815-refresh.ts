import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE35_M815_METAL_STRIPED_ID,
  PHASE35_PELIKAN_ID,
  phase35PelikanSouveranVariantPacks,
} from "./phase35-pelikan-souveran-variants";

export const PHASE420_PELIKAN_BRAND_ID = PHASE35_PELIKAN_ID;
export const PHASE420_M815_ID = PHASE35_M815_METAL_STRIPED_ID;
export const PHASE420_M815_SLUG = "pelikan-souveran-m815-metal-striped";
export const PHASE420_M815_NAME = "Pelikan Souverän M815 Metal Striped";

const RETRIEVED = "2026-08-03";

function web(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  author?: string;
  publishedAt?: string;
  itemType?: string;
}): CuratedSource {
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
    homepageUrl: sourceType === "official" ? "https://www.pelikan.com/" : new URL(input.url).origin,
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
  web({
    key: "phase420-pelikan-mam-m815-809269",
    registryKey: "pelikan-mam-official-m815-phase420",
    registryName: "Pelikan MAM official product archive",
    title: "Fountain pen M815 Metal Striped M product record 809269",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/809269",
    summary: "Pelikan 官方 MAM 记录将 M815 Metal Striped M 与 M800 产品分类、产品号 809269 和 2018 年图像资产关联；产品记录不外推全球库存。",
  }),
  web({
    key: "phase420-pelikan-mam-m815-809221",
    registryKey: "pelikan-mam-official-m815-2018-phase420",
    registryName: "Pelikan MAM official product archive",
    title: "Füllhalter Souverän M815 Metal Striped M product record 809221",
    url: "https://mam.pelikan.com/mam/de/pelikan/products/809221",
    summary: "官方 MAM 德语产品记录补充 M815 Metal Striped 2018 产品号与赠盒语境，作为 Black 版本的产品身份交叉证据。",
  }),
  web({
    key: "phase420-pelikan-press-blue",
    registryKey: "hamelin-pelikan-press-2025-phase420",
    registryName: "Hamelin / Pelikan press office",
    title: "Pelikan press release: Souverän M815 Metal Striped Blue",
    url: "https://de.hamelinbrands.com/wp-content/uploads/sites/7/2025/05/Pressemitteilung-Pelikan-M815-Metal-Striped-Blue.pdf",
    publishedAt: "2025-05-06",
    summary: "Pelikan／Hamelin 2025 新闻稿说明 Blue 为 Special Edition，深蓝 Edelharz、镀钯黄铜条纹、黄铜芯、18K 金尖和 2025 年 6 月起在选定经销商发售。",
    itemType: "press_release_pdf",
  }),
  web({
    key: "phase420-pelikan-annual-report-2018",
    registryKey: "pelikan-annual-report-2018-phase420",
    registryName: "Pelikan International annual report",
    title: "Pelikan International annual report 2018 — M815 Metal Striped launch",
    url: "https://www.pelikan.com/images/assets/picb/Pelikan_Annual_Report_2018_part-2.pdf?download=",
    publishedAt: "2018",
    summary: "Pelikan 2018 年报将 M815 Metal Striped 列入当年 Souverän Series 800 新产品清单，可用于限定 Black 的发行年份和特别版语境。",
    itemType: "annual_report_pdf",
  }),
  web({
    key: "phase420-fountainpennetwork-m815",
    registryKey: "fountainpennetwork-m815-phase420",
    registryName: "The Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    title: "Pelikan M815 Metal Striped forum review thread",
    url: "https://www.fountainpennetwork.com/forum/topic/343906-pelikan-m815-metal-striped/",
    author: "Fountain Pen Network members",
    publishedAt: "2018",
    summary: "FPN 讨论串作为玩家实物补充，记录 2018 M815 的条纹视觉、重心和书写体验；只作体验与识别线索，不替代官方规格。",
  }),
  web({
    key: "phase420-scrively-m815-comparison",
    registryKey: "scrively-m815-comparison-phase420",
    registryName: "Scrively",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Comparative overview: Pelikan M815 Metal Stripe Blue & Black",
    url: "https://scrively.org/comparative-overview-pelikan-m815-metal-stripe-blue-black/",
    author: "Scrively",
    publishedAt: "2025-10-30",
    summary: "Scrively 将 2018 Black 与 2025 Blue 并列，补充镀钯黄铜条纹、18K 镀铑尖、活塞和 EF/F/M/B 清单；价格随市场变化，不作为固定规格。",
  }),
  web({
    key: "phase420-forbes-m815-launch",
    registryKey: "forbes-m815-launch-2018-phase420",
    registryName: "Forbes",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Pelikan debuts the M815 Metal Striped fountain pen",
    url: "https://www.forbes.com/sites/nancyolson/2018/06/18/pelikan-debuts-the-m815-metal-striped-fountain-pen-new-look-new-materials/",
    author: "Nancy Olson",
    publishedAt: "2018-06-18",
    summary: "Forbes 的 2018 发布报道作为当期公开新闻背景，辅助确认 M815 Metal Striped 的特别版发布，不用作细部称重或当前库存证据。",
  }),
  web({
    key: "phase420-stationerystation-blue",
    registryKey: "stationerystation-m815-blue-2025-phase420",
    registryName: "STAs Stationery Station",
    sourceType: "retailer",
    tier: "retailer",
    title: "Pelikan M815 Metal Striped Blue special production item",
    url: "https://www.stationerystation.co.jp/category/PELIKAN/4012700827678.html",
    publishedAt: "2025",
    summary: "日本专业文具零售页面以条码与特别生产品标签记录 Blue；零售页只用于 SKU／市场存在性线索，购买状态和价格需实时复核。",
  }),
  web({
    key: "phase420-penhouse-blue",
    registryKey: "pen-house-m815-blue-2025-phase420",
    registryName: "Pen-house Japan",
    sourceType: "retailer",
    tier: "retailer",
    title: "Pelikan Souverän M815 Metal Striped Blue",
    url: "https://www.pen-house.net/item/47926.html",
    publishedAt: "2025",
    summary: "Pen-house 日本零售页补充 Blue 的地区 SKU 与发售语境；不把零售价格或库存写成型号固有属性。",
  }),
];

const EXTRA_VARIANTS: CuratedVariant[] = [
  { key: "m815-metal-striped-editions", name: "M815 Metal Striped editions", notes: "2018 Black 与 2025 Blue 是同一基础型号下的年份特别版；不表示固定等级。", sourceKey: "phase35-pelikan-collectibles-m815-family", variantKind: "edition_group" },
  { key: "m815-nib-widths", name: "M815 nib widths", notes: "尖幅属于可更换的规格维度，必须按具体版本、尖刻和调校记录。", sourceKey: "phase35-pelikan-official-m815-blue", variantKind: "edition_group" },
  { key: "m815-m805-boundary", name: "M805 Stresemann boundary", releaseYear: "相邻型号", notes: "M805 Stresemann 的条纹树脂和银色饰件不能因照片相似并入 M815。", sourceKey: "phase420-scrively-m815-comparison", variantKind: "edition_group" },
  { key: "m815-m800-boundary", name: "Standard M800 boundary", releaseYear: "相邻型号", notes: "标准 M800 的树脂条纹、金色饰件和重量口径与 M815 Metal Striped 分开。", sourceKey: "phase35-pelikans-perch-m815-black", variantKind: "edition_group" },
  { key: "m815-wall-street-boundary", name: "1995 M815 Wall Street boundary", releaseYear: "1995", notes: "历史 Wall Street 复用 M815 编号，但不是 2018 Metal Striped 家族的颜色版本。", sourceKey: "phase35-pelikans-perch-m815-black", variantKind: "edition_group" },
  { key: "metal-striped-black-2018", name: "M815 Metal Striped Black", releaseYear: "2018", notes: "2018 Special Edition；档案列 141 mm、13 mm、38 g、1.35 ml 与 18 ct 金尖。", sourceKey: "phase35-pelikan-collectibles-m815-black", variantKind: "material", parentVariantKey: "m815-metal-striped-editions" },
  { key: "metal-striped-blue-2025", name: "M815 Metal Striped Blue", releaseYear: "2025", notes: "2025 Special Edition；官方列 14.1 cm、36 g、黄铜基材与 18K/750 全镀铑尖。", sourceKey: "phase35-pelikan-official-m815-blue", variantKind: "material", parentVariantKey: "m815-metal-striped-editions" },
  { key: "m815-brass-stripe", name: "Brass and palladium metal stripes", releaseYear: "2018–2025", notes: "黄铜芯／条纹结构是 Metal Striped 的材料识别维度，不等同于整支笔完全由金属制成。", sourceKey: "phase420-pelikan-press-blue", variantKind: "material" },
  { key: "m815-blue-market-record", name: "2025 Blue market record", releaseYear: "2025", notes: "地区零售页和产品号只记录市场 SKU 线索，不作为全球库存或真伪单项证据。", sourceKey: "phase420-stationerystation-blue", variantKind: "market_sku", parentVariantKey: "m815-metal-striped-editions", market: "Japan" },
  { key: "m815-ef", name: "M815 EF", notes: "Blue 官方列 EF；Black 二手笔的尖幅需由尖刻和包装核对。", sourceKey: "phase35-pelikan-official-m815-blue", variantKind: "nib", parentVariantKey: "m815-nib-widths" },
  { key: "m815-f", name: "M815 F", notes: "Blue 官方列 F；纸张、墨水和调校会改变实际线宽。", sourceKey: "phase35-pelikan-official-m815-blue", variantKind: "nib", parentVariantKey: "m815-nib-widths" },
  { key: "m815-m", name: "M815 M", notes: "Blue 官方列 M；M 尖样本的写感不能外推给 Black 或所有年代。", sourceKey: "phase35-pelikan-official-m815-blue", variantKind: "nib", parentVariantKey: "m815-nib-widths" },
  { key: "m815-b", name: "M815 B", notes: "Blue 官方列 B；二手改尖需要保留更换记录。", sourceKey: "phase35-pelikan-official-m815-blue", variantKind: "nib", parentVariantKey: "m815-nib-widths" },
];

const EXTRA_SCOPES: CuratedScope[] = [
  { key: "phase420-m815-main", scopeKey: "pelikan-m815-metal-striped-main-2026", market: "global", productionState: "current", nibScope: "18 ct / 18K-750 gold; width by version and sample", materialScope: "high-grade resin with brass/palladium metal stripes", editionScope: "2018 Black and 2025 Blue; Wall Street, M800 and M805 excluded" },
  { key: "phase420-m815-black", scopeKey: "pelikan-m815-black-2018", variantKey: "metal-striped-black-2018", validFrom: "2018", validTo: "2018", productionState: "historical", nibScope: "18 ct gold; width by sample", materialScope: "black resin and brass/palladium striped construction", editionScope: "2018 Metal Striped Black" },
  { key: "phase420-m815-blue", scopeKey: "pelikan-m815-blue-2025", variantKey: "metal-striped-blue-2025", validFrom: "2025", productionState: "current", nibScope: "18K/750 fully rhodium-plated; EF/F/M/B", materialScope: "blue high-grade resin, brass core and palladium-colored trim", editionScope: "2025 Metal Striped Blue" },
  { key: "phase420-m815-boundaries", scopeKey: "pelikan-m815-family-boundaries-2026", validFrom: RETRIEVED, productionState: "current", editionScope: "M805 Stresemann, standard M800 and 1995 Wall Street are adjacent identities, not M815 Metal Striped variants" },
  { key: "phase420-m815-care", scopeKey: "pelikan-m815-care-2026", validFrom: RETRIEVED, productionState: "current", editionScope: "cold-water flushing; no hot water, soap, alcohol or abrasive metal polish; professional piston repair" },
  { key: "phase420-m815-media", scopeKey: "pelikan-m815-factual-svg-2026", validFrom: RETRIEVED, productionState: "current", editionScope: "site-original factual SVG; not a product photograph or color proof" },
];

const EXTRA_CLAIMS: CuratedClaim[] = [
  { key: "phase420-identity", predicate: "model_identity", objectText: "Pelikan Souverän M815 Metal Striped 是 M8xx 尺寸的金属条纹特别版基础型号；页面只把 2018 Black 与 2025 Blue 作为直接版本，不把 M815 写成永久高于 M805 的等级。", factClass: "core", confidence: 0.99, sourceKey: "phase35-pelikan-collectibles-m815-family", locator: "M815 Special Edition family rows", evidence: [{ key: "phase420-identity-family", sourceKey: "phase35-pelikan-collectibles-m815-family", scopeKey: "phase420-m815-main", locator: "2018 Black and 2025 Blue listed separately" }, { key: "phase420-identity-mam", sourceKey: "phase420-pelikan-mam-m815-809269", scopeKey: "phase420-m815-black", locator: "official MAM M815 product detail" }] },
  { key: "phase420-history", predicate: "production_history", objectText: "Pelikan 年报把 M815 Metal Striped 列为 2018 年 Souverän Series 800 新产品；2025 年新闻稿另发布 Blue Special Edition，Black 与 Blue 的年份不能互换。", factClass: "core", confidence: 0.99, sourceKey: "phase420-pelikan-annual-report-2018", locator: "2018 annual report new products list", evidence: [{ key: "phase420-history-2018", sourceKey: "phase420-pelikan-annual-report-2018", scopeKey: "phase420-m815-black", locator: "M815 Metal Striped in 2018 launch list" }, { key: "phase420-history-2025", sourceKey: "phase420-pelikan-press-blue", scopeKey: "phase420-m815-blue", locator: "2025-05-06 press release" }] },
  { key: "phase420-black-specs", predicate: "variant_2018_specs", objectText: "2018 Black 收藏档案列闭帽约 141 mm、直径约 13 mm、38 g、1.35 ml 与 18 ct 金尖；评测样本带帽约 1.31 oz，属于不同称量口径。", factClass: "core", confidence: 0.99, sourceKey: "phase35-pelikan-collectibles-m815-black", locator: "2018 Black detail table", evidence: [{ key: "phase420-black-archive", sourceKey: "phase35-pelikan-collectibles-m815-black", scopeKey: "phase420-m815-black", locator: "141 mm, 13 mm, 38 g, 1.35 ml" }, { key: "phase420-black-review", sourceKey: "phase35-pelikans-perch-m815-black", scopeKey: "phase420-m815-black", locator: "capped 1.31 oz review sample" }] },
  { key: "phase420-blue-specs", predicate: "variant_2025_specs", objectText: "2025 Blue 官方产品页列黄铜基材、镀钯色夹子和饰环、18K/750 全镀铑 EF/F/M/B 尖、差动活塞、闭帽 14.1 cm 与 36 g；新闻稿确认 2025 年 6 月起选定经销商发售。", factClass: "core", confidence: 0.99, sourceKey: "phase35-pelikan-official-m815-blue", locator: "official Blue details and facts", evidence: [{ key: "phase420-blue-official", sourceKey: "phase35-pelikan-official-m815-blue", scopeKey: "phase420-m815-blue", locator: "brass, palladium trim, 18K/750 EF/F/M/B, 14.1 cm, 36 g" }, { key: "phase420-blue-press", sourceKey: "phase420-pelikan-press-blue", scopeKey: "phase420-m815-blue", locator: "selected trade release from June 2025" }] },
  { key: "phase420-material", predicate: "material_construction", objectText: "Metal Striped 的条纹由黄铜结构和镀钯色外观参与构成，外层仍有树脂部件；条纹增加重量和反光，但不应把整支笔写成实心金属。", factClass: "core", confidence: 0.98, sourceKey: "phase420-pelikan-press-blue", locator: "press release material paragraphs", evidence: [{ key: "phase420-material-press", sourceKey: "phase420-pelikan-press-blue", scopeKey: "phase420-m815-main", locator: "brass core, palladium-coated brass stripes and Edelharz" }, { key: "phase420-material-review", sourceKey: "phase35-pelikans-perch-m815-black", scopeKey: "phase420-m815-black", locator: "brass elements add weight" }] },
  { key: "phase420-weight", predicate: "variant_weight_boundary", objectText: "Black 档案的 38 g、Black 实测约 37.1 g、Blue 官方 36 g 和 Blue 公布资料约 37.13 g 都保留版本及测量条件，不平均成一个共同 M815 重量。", factClass: "core", confidence: 0.99, sourceKey: "phase35-pelikan-official-m815-blue", locator: "version-specific weight records", evidence: [{ key: "phase420-weight-black", sourceKey: "phase35-pelikan-collectibles-m815-black", scopeKey: "phase420-m815-black", locator: "38 g archive" }, { key: "phase420-weight-blue", sourceKey: "phase35-pelikan-official-m815-blue", scopeKey: "phase420-m815-blue", locator: "36 g official" }, { key: "phase420-weight-announce", sourceKey: "phase35-pelikans-perch-m815-blue", scopeKey: "phase420-m815-blue", locator: "37.13 g announcement" }] },
  { key: "phase420-filling", predicate: "filling_system", objectText: "两版都采用瓶装差动活塞；容量约 1.35 ml 只作来源化参考。换色时排空并用冷水吸排，异常卡滞或渗墨不要继续强拧。", factClass: "core", confidence: 0.99, sourceKey: "phase35-pelikan-official-m815-blue", locator: "differential piston and care sources", evidence: [{ key: "phase420-filling-official", sourceKey: "phase35-pelikan-official-m815-blue", scopeKey: "phase420-m815-main", locator: "differential piston" }, { key: "phase420-filling-care", sourceKey: "phase35-pelikan-official-care", scopeKey: "phase420-m815-care", locator: "cold-water flushing instructions" }] },
  { key: "phase420-nib", predicate: "nib_scope", objectText: "Blue 官方列 EF、F、M、B，尖材为 18K/750 全镀铑；Black 档案确认 18 ct 金尖但具体尖幅应由实物、包装或产品号核对，尖单元更换不改变笔身身份。", factClass: "core", confidence: 0.98, sourceKey: "phase35-pelikan-official-m815-blue", locator: "nib options and material", evidence: [{ key: "phase420-nib-blue", sourceKey: "phase35-pelikan-official-m815-blue", scopeKey: "phase420-m815-blue", locator: "18K/750 rhodium EF/F/M/B" }, { key: "phase420-nib-black", sourceKey: "phase35-pelikan-collectibles-m815-black", scopeKey: "phase420-m815-black", locator: "18 ct Black archive" }] },
  { key: "phase420-boundary", predicate: "family_boundary", objectText: "1995 Wall Street 虽复用 M815 编号，M805 Stresemann 走条纹树脂，标准 M800 走常规树脂和金色饰件；三者都不能因编号或照片相似并入 Metal Striped。", factClass: "core", confidence: 0.98, sourceKey: "phase35-pelikans-perch-m815-black", locator: "M815 numbering and M800/M805 comparison", evidence: [{ key: "phase420-boundary-wall", sourceKey: "phase35-pelikans-perch-m815-black", scopeKey: "phase420-m815-boundaries", locator: "1995 Wall Street numbering note" }, { key: "phase420-boundary-scrively", sourceKey: "phase420-scrively-m815-comparison", scopeKey: "phase420-m815-boundaries", locator: "Black/Blue versus standard Souverän context" }] },
  { key: "phase420-care", predicate: "care_boundary", objectText: "官方护理建议长期停用前排空，以冷水反复吸排，不用热水、肥皂或酒精；金属条纹和镀层不应用研磨性金属抛光剂，活塞维修交给熟悉 M8xx 的专业人员。", factClass: "core", confidence: 0.99, sourceKey: "phase35-pelikan-official-care", locator: "current care PDF", evidence: [{ key: "phase420-care-official", sourceKey: "phase35-pelikan-official-care", scopeKey: "phase420-m815-care", locator: "cold water and no hot water, soap or alcohol" }, { key: "phase420-care-review", sourceKey: "phase35-pelikans-perch-m815-black", scopeKey: "phase420-m815-care", locator: "section trim plating and ink residue caution" }] },
  { key: "phase420-buying", predicate: "second_hand_identification", objectText: "二手验收应同时核对年份、Black／Blue 材料、黄铜条纹、墨窗、帽环、尖刻、空笔带帽重量、原盒和维修史；后配盒、换尖或单张正面照片都不足以单独确认版本。", factClass: "editorial", confidence: 0.98, sourceKey: "phase420-pelikan-mam-m815-809269", locator: "official product assets and identity cues", evidence: [{ key: "phase420-buying-mam", sourceKey: "phase420-pelikan-mam-m815-809269", scopeKey: "phase420-m815-black", locator: "2018 M815 product and gift-box assets" }, { key: "phase420-buying-scrively", sourceKey: "phase420-scrively-m815-comparison", scopeKey: "phase420-m815-main", locator: "version comparison and nib options" }] },
  { key: "phase420-media", predicate: "editorial_media_scope", objectText: "本站 SVG 只展示 Black 与 Blue 的版本差异、条纹材料和重量口径，明确非产品照片、非品牌 Logo、非真实比例和非颜色校样。", factClass: "editorial", confidence: 0.99, sourceKey: "phase35-m815-site-original", locator: "site-original factual SVG", evidence: [{ key: "phase420-media-svg", sourceKey: "phase35-m815-site-original", scopeKey: "phase420-m815-media", locator: "SVG disclaimer" }] },
];

const EXTRA_SPEC_EVIDENCE: CuratedSpecEvidence[] = [
  { key: "phase420-brand", fieldKey: "brand_entity_id", sourceKey: "phase420-pelikan-mam-m815-809269", scopeKey: "phase420-m815-main", locator: "official MAM product brand" },
  { key: "phase420-series", fieldKey: "series_name", sourceKey: "phase35-pelikan-collectibles-m815-family", scopeKey: "phase420-m815-main", locator: "M815 Special Edition family" },
  { key: "phase420-release", fieldKey: "release_year", sourceKey: "phase420-pelikan-annual-report-2018", scopeKey: "phase420-m815-black", locator: "2018 launch list" },
  { key: "phase420-origin", fieldKey: "origin_country", sourceKey: "phase35-pelikan-official-m815-blue", scopeKey: "phase420-m815-blue", locator: "official page made and assembled in Germany" },
  { key: "phase420-nib", fieldKey: "nib", sourceKey: "phase35-pelikan-official-m815-blue", scopeKey: "phase420-m815-blue", locator: "18K/750 fully rhodium-plated EF/F/M/B" },
  { key: "phase420-nib-black", fieldKey: "nib", sourceKey: "phase35-pelikan-collectibles-m815-black", scopeKey: "phase420-m815-black", locator: "18 ct Black archive" },
  { key: "phase420-fill", fieldKey: "fill_system", sourceKey: "phase35-pelikan-official-m815-blue", scopeKey: "phase420-m815-main", locator: "differential piston" },
  { key: "phase420-material", fieldKey: "material", sourceKey: "phase420-pelikan-press-blue", scopeKey: "phase420-m815-main", locator: "brass core and palladium stripes" },
  { key: "phase420-dimensions-black", fieldKey: "dimensions", sourceKey: "phase35-pelikan-collectibles-m815-black", scopeKey: "phase420-m815-black", locator: "141 mm and 13 mm" },
  { key: "phase420-dimensions-blue", fieldKey: "dimensions", sourceKey: "phase35-pelikan-official-m815-blue", scopeKey: "phase420-m815-blue", locator: "14.1 cm" },
  { key: "phase420-weight-black", fieldKey: "weight", sourceKey: "phase35-pelikan-collectibles-m815-black", scopeKey: "phase420-m815-black", locator: "38 g" },
  { key: "phase420-weight-blue", fieldKey: "weight", sourceKey: "phase35-pelikan-official-m815-blue", scopeKey: "phase420-m815-blue", locator: "36 g" },
  { key: "phase420-status", fieldKey: "status", sourceKey: "phase35-pelikan-collectibles-m815-family", scopeKey: "phase420-m815-main", locator: "2018 and 2025 Special Edition rows" },
];

const BASE_M815 = phase35PelikanSouveranVariantPacks.find(
  (pack) => pack.entityId === PHASE420_M815_ID && pack.expectedType === "pen",
);
if (!BASE_M815) throw new Error("Phase 420 requires the existing Phase 35 Pelikan M815 pack.");
const baseVariants = BASE_M815.variants ?? [];

const refreshedM815: CuratedEntityPack = {
  ...structuredClone(BASE_M815),
  key: "phase420-pelikan-m815-refresh-v1",
  canonicalName: PHASE420_M815_NAME,
  markdownFile: ".planning/content-research/pelikan-m815-metal-striped-phase420.md",
  storyTitle: "Pelikan M815 Metal Striped：2018 Black 与 2025 Blue 的版本和材料边界",
  primarySourceKey: "phase420-pelikan-mam-m815-809269",
  sources: [...BASE_M815.sources, ...EXTRA_SOURCES],
  aliases: [
    ...BASE_M815.aliases,
    { alias: "Pelikan M 815 Metal Striped", language: "en", sourceKey: "phase420-pelikan-mam-m815-809269" },
    { alias: "百利金 Souverän M815 Metal Striped", language: "zh", sourceKey: "phase420-pelikan-press-blue" },
  ],
  variants: [
    ...EXTRA_VARIANTS.filter((variant) => variant.variantKind === "edition_group"),
    ...baseVariants.map((variant) => ({
      ...variant,
      parentVariantKey: "m815-metal-striped-editions",
    })),
    ...EXTRA_VARIANTS.filter((variant) => variant.variantKind !== "edition_group" && !baseVariants.some((base) => base.key === variant.key)),
  ],
  scopes: [...BASE_M815.scopes, ...EXTRA_SCOPES],
  claims: [...BASE_M815.claims, ...EXTRA_CLAIMS],
  spec: BASE_M815.spec
    ? {
        ...BASE_M815.spec,
        values: {
          ...BASE_M815.spec.values,
          series_name: "Souverän M815 Metal Striped（M8xx Special Edition）",
          release_year: "2018 Black；2025 Blue",
          origin_country: "Pelikan 德国制造／组装语境；具体市场产品记录另核",
          nib: "2018 Black 档案 18 ct 金尖；2025 Blue 官方 18K/750 全镀铑 EF/F/M/B",
          fill_system: "差动活塞；瓶装钢笔墨；容量资料约 1.35 ml",
          material: "高等级树脂与黄铜／镀钯色金属条纹；颜色按 Black／Blue variant",
          dimensions: "2018 Black 档案闭帽约 141 mm、直径约 13 mm；2025 Blue 官方 14.1 cm",
          weight: "Black 档案 38 g、评测样本约 37.1 g；Blue 官方 36 g、公布资料约 37.13 g",
          status: "2018 Black 历史 Special Edition；2025 Blue Special Edition；Wall Street、M800、M805 分开记录",
        },
        evidence: [...BASE_M815.spec.evidence, ...EXTRA_SPEC_EVIDENCE],
      }
    : undefined,
  media: BASE_M815.media,
  timeline: [
    ...(BASE_M815.timeline ?? []),
    { key: "phase420-m815-2018", title: "M815 Metal Striped Black 推出", eventType: "model_released", startDate: "2018", circa: false, description: "Pelikan 年报和 MAM 记录将 Black 置于 2018 年 Souverän Series 800 特别版产品语境。", sourceKey: "phase420-pelikan-annual-report-2018" },
    { key: "phase420-m815-2025", title: "M815 Metal Striped Blue 推出", eventType: "model_released", startDate: "2025-06", circa: false, description: "官方新闻稿说明 Blue Special Edition 自 2025 年 6 月起在选定经销商发售。", sourceKey: "phase420-pelikan-press-blue" },
  ],
};

export const phase420PelikanM815RefreshPacks: CuratedEntityPack[] = [refreshedM815];
