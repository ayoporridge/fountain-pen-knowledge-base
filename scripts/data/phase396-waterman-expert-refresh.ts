import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase50WatermanCareneExpertPacks } from "./phase50-waterman-carene-expert";

export const PHASE396_WATERMAN_BRAND_ID = "zkAu9PePDdqJ";
export const PHASE396_EXPERT_ID = "YAiCRah1XAsz";
export const PHASE396_EXPERT_SLUG = "waterman-expert";
export const PHASE396_EXPERT_NAME = "威迪文 Waterman Expert";

const RETRIEVED = "2026-08-03";
const SCOPE = "waterman-expert-phase396-current-and-history";

const baseExpert = phase50WatermanCareneExpertPacks.find(
  (pack) => pack.entityId === PHASE396_EXPERT_ID && pack.expectedType === "pen",
);
const baseBrand = phase50WatermanCareneExpertPacks.find(
  (pack) => pack.entityId === PHASE396_WATERMAN_BRAND_ID && pack.expectedType === "brand",
);
if (!baseExpert || !baseBrand) throw new Error("Phase 396 Waterman Expert base pack missing.");

function source(
  input: Omit<CuratedSource, "key" | "retrievedAt"> & { key: string },
): CuratedSource {
  return { ...input, retrievedAt: RETRIEVED };
}

const SOURCES = {
  collection: source({
    key: "phase396-waterman-expert-collection",
    registryKey: "waterman-official-current-expert",
    registryName: "Waterman official current Expert collection",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-current-collection",
    title: "Waterman Expert luxury pens collection",
    url: "https://www.waterman.com/pens/expert/",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方当前 Expert collection 将 fountain pen、rollerball 与 ballpoint 分开，并列出 Expert、L’Essence du Bleu、Opéra、Deluxe、Reflections of Paris 等商品/主题路线。",
    archiveUrl: "https://www.waterman.com/pens/expert/",
    archiveLocator: "current collection filters, writing types, current finishes and Expert family boundary",
  }),
  product: source({
    key: "phase396-waterman-expert-blue-ct",
    registryKey: "waterman-official-expert-2214207",
    registryName: "Waterman official Expert Blue CT product",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-blue-ct-2214207",
    title: "Waterman Expert Fountain Pen Blue CT, item 2214207",
    url: "https://www.waterman.com/pens/expert/expert-fountain-pen/SAP_2214207.html",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "当前 Blue CT 商品页列 2214207、深蓝 lacquer、palladium-coated two-prong clip/trims、black resin shell、brass with lacquer cap、Waterman W stainless-steel nib、法国手工组装和两年国际保修。",
    archiveUrl: "https://www.waterman.com/pens/expert/expert-fountain-pen/SAP_2214207.html",
    archiveLocator: "product details, item 2214207, materials, nib, assembly and warranty",
  }),
  history: source({
    key: "phase396-waterman-heritage",
    registryKey: "waterman-official-heritage",
    registryName: "Waterman official heritage timeline",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-heritage",
    title: "Waterman Heritage",
    url: "https://www.waterman.com/waterman-history.html",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方品牌史把 Expert 放在 1990–92，并将 Edson、Hémisphère 1994、Carène 1997 列为相邻现代系列时间锚点。",
    archiveUrl: "https://www.waterman.com/waterman-history.html",
    archiveLocator: "1990-92 Expert entry and adjacent modern Waterman series dates",
  }),
  filling: source({
    key: "phase396-waterman-filling-support",
    registryKey: "waterman-official-support-filling",
    registryName: "Waterman official filling support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-support-filling",
    title: "Fountain pen ink filling instructions",
    url: "https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方说明墨囊插入、converter 吸墨、笔尖浸入、回滴三滴、吸入少量空气以及软布擦去余墨。",
    archiveUrl: "https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions",
    archiveLocator: "cartridge and converter filling sequence",
  }),
  cleaning: source({
    key: "phase396-waterman-cleaning-support",
    registryKey: "waterman-official-support-cleaning",
    registryName: "Waterman official storage and cleaning support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-support-cleaning",
    title: "Fountain pen storage and cleaning recommendations",
    url: "https://www.waterman.com/support?cfid=fountain-pen-storage-and-cleaning-recommendations",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方建议不用笔时尖朝上保存；每次换墨之间以凉水浸泡、冲洗和吹出余水，再装入新墨囊或 converter。",
    archiveUrl: "https://www.waterman.com/support?cfid=fountain-pen-storage-and-cleaning-recommendations",
    archiveLocator: "storage point-up and cool-water cleaning recommendations",
  }),
  catalogue: source({
    key: "phase396-waterman-catalogue-2021",
    registryKey: "waterman-official-trade-catalogue",
    registryName: "Waterman official trade catalogue",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "waterman-official-catalogue",
    title: "Waterman Trade Catalogue 2021",
    url: "https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方贸易目录把 Expert 的钢尖与 18K gold nib 语境分开，提供历史/地区 SKU 的档案交叉线索；目录名称和库存不能替代当前商品页。",
    archiveUrl: "https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021",
    archiveLocator: "Expert catalogue pages and nib/finish listings",
  }),
  penHeaven: source({
    key: "phase396-penheaven-expert",
    registryKey: "penheaven-waterman-expert",
    registryName: "Pen Heaven",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "penheaven-expert",
    title: "Waterman Expert Stainless Steel Gold Trim Fountain Pen",
    url: "https://www.penheaven.com/waterman-expert-stainless-steel-gold-trim-fountain",
    homepageUrl: "https://www.penheaven.com/",
    author: "Pen Heaven",
    allowedUse: "summary_only",
    summary:
      "专业零售页为具体不锈钢/金色饰件 SKU 记录合帽 141 mm、后套 151 mm、直径 12.6 mm、27 g、墨囊与可选 converter；数字只绑定该商品。",
    archiveUrl: "https://www.penheaven.com/waterman-expert-stainless-steel-gold-trim-fountain",
    archiveLocator: "specific Expert SKU dimensions, weight, steel nib and filling notes",
  }),
  penChalet: source({
    key: "phase396-penchalet-expert",
    registryKey: "penchalet-waterman-expert",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "penchalet-expert",
    title: "Waterman Expert Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/waterman_expert_fountain_pen.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    allowedUse: "summary_only",
    summary:
      "专业零售页将 Expert 描述为 palladium finishes、matching stainless-steel nib、法国手工组装，填充写为 proprietary cartridge，并提示颜色与字幅按商品。",
    archiveUrl: "https://www.penchalet.com/fine_pens/fountain_pens/waterman_expert_fountain_pen.html",
    archiveLocator: "Expert nib, cartridge and hand-assembled-France product specification",
  }),
  gentleman: source({
    key: "phase396-gentleman-stationer-expert",
    registryKey: "gentleman-stationer-waterman-expert",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer-expert",
    title: "Unsung Heroes: The Waterman Expert Fountain Pen",
    url: "https://www.gentlemanstationer.com/blog/2020/7/2/unsung-heroes-the-waterman-expert-fountain-pen",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "The Gentleman Stationer",
    allowedUse: "summary_only",
    summary:
      "独立钢笔资料以早期 1990 年代实物和现代款比较 Expert 的轮廓、斜面帽顶、夹帽后套、钢尖与 cartridge-converter 路线；使用感不替代官方规格。",
    archiveUrl: "https://www.gentlemanstationer.com/blog/2020/7/2/unsung-heroes-the-waterman-expert-fountain-pen",
    archiveLocator: "design continuity, filling system, dimensions and writing impressions",
  }),
  lensky: source({
    key: "phase396-lensky-expert-generations",
    registryKey: "lenskiy-waterman-expert-generations",
    registryName: "Andrew Lensky",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "lenskiy-expert-generations",
    title: "(modern) Waterman Expert (gen II)",
    url: "https://lenskiy.org/2024/09/modern-waterman-expert-gen-ii/",
    homepageUrl: "https://lenskiy.org/",
    author: "Andrew Lensky",
    allowedUse: "summary_only",
    summary:
      "独立实物文章将 Expert I/II/III 作为代际识别语境，比较旧代塑料、漆面黄铜、尖形与帽环细节；文章无法替代当前商品号或官方年份。",
    archiveUrl: "https://lenskiy.org/2024/09/modern-waterman-expert-gen-ii/",
    archiveLocator: "old Expert generation identification and material/nib boundary",
  }),
  svg: source({
    key: "phase396-waterman-expert-svg",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Waterman Expert 事实卡（本站原创示意图）",
    url: "/images/library/site-original/waterman-carene-expert/waterman-expert.svg",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    itemType: "image",
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG 表达 Expert 的收束轮廓、斜面帽顶、W 钢尖、漆面与金属饰件边界；示意图，非产品照片。",
    archiveUrl: "/images/library/site-original/waterman-carene-expert/waterman-expert.svg",
    archiveLocator: "project-public-asset:/images/library/site-original/waterman-carene-expert/waterman-expert.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  }),
} satisfies Record<string, CuratedSource>;

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceItem: CuratedSource,
  locator: string,
  factClass: "core" | "editorial" = "core",
  extraEvidence: CuratedSource[] = [],
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey: sourceItem.key,
    locator,
    evidence: [sourceItem, ...extraEvidence].map((item, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: item.key,
      scopeKey: SCOPE,
      locator: index === 0 ? locator : item.summary,
    })),
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceItem: CuratedSource,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey: sourceItem.key, scopeKey: SCOPE, locator, qualifies: true };
}

const expert: CuratedEntityPack = {
  key: "phase396-waterman-expert-refresh-v1",
  entityId: PHASE396_EXPERT_ID,
  expectedType: "pen",
  expectedSlug: PHASE396_EXPERT_SLUG,
  canonicalName: PHASE396_EXPERT_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/waterman-expert-phase396.md",
  storyTitle: "Waterman Expert：1990–92 起的商务轮廓，当前 2214207 与旧代边界",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Waterman Expert", language: "en", sourceKey: SOURCES.collection.key },
    { alias: "威迪文 Expert", language: "zh", sourceKey: SOURCES.collection.key },
    { alias: "Waterman Expert I", language: "en", sourceKey: SOURCES.lensky.key },
    { alias: "Waterman Expert II", language: "en", sourceKey: SOURCES.lensky.key },
    { alias: "Waterman Expert III", language: "en", sourceKey: SOURCES.lensky.key },
    { alias: "Expert Fountain Pen", language: "en", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [{
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    market: "Waterman current Expert collection and Blue CT item 2214207, with historical/secondary generation references",
    nibScope: "current Waterman W stainless-steel nib; historical steel, plated and catalogue 18K variants kept SKU-bound",
    materialScope: "2214207 deep-blue lacquer, palladium-coated trims, black resin shell and brass-with-lacquer cap; other finishes separately verified",
    editionScope: "Expert fountain pen family only; excludes same-name rollerball, ballpoint and unverified regional product titles",
  }],
  claims: [
    claim(`${SCOPE}-identity`, "model_identity", "Waterman Expert 是官方当前 collection 中的 fountain-pen family；Blue CT 当前商品号为 2214207，rollerball 与 ballpoint 另列。", SOURCES.product, "official writing type and item 2214207", "core", [SOURCES.collection]),
    claim(`${SCOPE}-history`, "release_history", "Waterman Heritage 官方时间线把 Expert 放在 1990–92，并将 Hémisphère 1994、Carène 1997 列为相邻现代系列时间锚点。", SOURCES.history, "official 1990-92 Expert entry", "core"),
    claim(`${SCOPE}-current-material`, "sku_material_boundary", "Blue CT item 2214207 的深蓝 lacquer、palladium-coated two-prong clip/trims、black resin shell 与 brass-with-lacquer cap 只绑定这个当前 SKU。", SOURCES.product, "official product materials and finish", "core"),
    claim(`${SCOPE}-current-nib`, "sku_nib_boundary", "2214207 使用带环形 W 标记的 Waterman stainless-steel nib；尖宽和其他颜色依商品号与市场页面核对。", SOURCES.product, "official stainless-steel nib feature and Medium selector", "core"),
    claim(`${SCOPE}-assembly`, "manufacturing_boundary", "当前商品页称每支 Expert luxury pen 在法国 Waterman 工艺中心手工组装，并提供两年国际保修；不能据此推断旧款个体的工厂和保修状态。", SOURCES.product, "official hand-assembled France and warranty wording", "core"),
    claim(`${SCOPE}-filling`, "filling_system", "Expert fountain pen 使用 Waterman cartridge/converter 路线；官方支持页分别说明墨囊插入、converter 吸墨、回滴三滴和擦拭余墨。", SOURCES.filling, "official cartridge/converter instructions", "core"),
    claim(`${SCOPE}-care`, "maintenance_guidance", "官方建议每次换墨之间用凉水清洁，尖朝上收纳；旧代还需检查握位裂纹、转换器密封和帽内干墨。", SOURCES.cleaning, "official point-up storage and cool-water cleaning; old-pen additions are bounded guidance", "core", [SOURCES.filling]),
    claim(`${SCOPE}-dimensions`, "variant_measurement", "Pen Heaven 的不锈钢/金色饰件商品记录合帽 141 mm、后套 151 mm、直径 12.6 mm、27 g；Pen Chalet 与 Waterman Romania 也显示不同饰面，数字不能当作全系统一值。", SOURCES.penHeaven, "specific SKU dimensions and weight", "core", [SOURCES.penChalet]),
    claim(`${SCOPE}-generation`, "version_boundary", "Expert I/II/III 是二手市场和独立资料的代际识别语言，不是当前官网三条并售型号；旧代塑料、漆面黄铜、尖形和帽环差异要以实物和目录核对。", SOURCES.lensky, "independent generation comparison", "core", [SOURCES.gentleman, SOURCES.history]),
    claim(`${SCOPE}-catalogue`, "historical_sku_boundary", "官方贸易目录出现 Expert 18K gold nib 的档案语境；当前常见钢尖不能抹掉历史/地区特别 SKU，也不能把目录词扩大为全系现行规格。", SOURCES.catalogue, "official trade catalogue Expert nib listings", "core", [SOURCES.product]),
    claim(`${SCOPE}-family`, "sibling_boundary", "Expert 与 Carène、Hémisphère、Allure 是 Waterman 导航中的不同系列；Expert 的 W 钢尖和商务轮廓不能吸收 Carène 的 18K inset 尖或 Hémisphère 的细身规格。", SOURCES.history, "official heritage sequence and current pens navigation", "core", [SOURCES.collection]),
    claim(`${SCOPE}-media`, "media_identity_boundary", "本站原创 SVG 只表达 Expert 的轮廓、斜面帽顶、W 钢尖和漆面/饰件关系；它是示意图，不是产品照片或颜色校样。", SOURCES.svg, "site-original factual SVG attribution and non-photo boundary", "editorial"),
  ],
  variants: [
    { key: `${SCOPE}-blue-ct`, name: "Blue CT fountain pen（item 2214207）", releaseYear: "现行官网 SKU", notes: "深蓝 lacquer、palladium-coated two-prong clip/trims、black resin shell；Waterman W stainless-steel nib。", sourceKey: SOURCES.product.key, variantKind: "market_sku", productCode: "2214207", market: "Waterman UK current product page" },
    { key: `${SCOPE}-current-family`, name: "Expert 基础款、Deluxe 与主题饰面", releaseYear: "现行与地区 SKU", notes: "Black、Blue、Silver、Grey、L’Essence du Bleu、Opéra、Reflections of Paris 等先作为同一 Expert family 的颜色/主题记录，具体尖和包装按商品号核对。", sourceKey: SOURCES.collection.key, variantKind: "edition_group", market: "Waterman current Expert collection" },
    { key: `${SCOPE}-historical-generations`, name: "Expert I / Expert II / Expert III 旧代识别", releaseYear: "约 1990s–现行市场", notes: "代际名称来自独立资料和二手语境；塑料、漆面黄铜、尖形、帽环与重量是线索，不把单支样笔年份写成官方精确换代年。", sourceKey: SOURCES.lensky.key, variantKind: "edition_group", market: "secondary reference and second-hand identification" },
    { key: `${SCOPE}-18k-archive`, name: "Expert 18K gold nib catalogue/地区 SKU", releaseYear: "目录与地区记录", notes: "官方目录列出 18K gold nib 语境；需以商品号、尖刻字和市场来源确认，不能覆盖当前 2214207 钢尖。", sourceKey: SOURCES.catalogue.key, variantKind: "market_sku", market: "Waterman trade catalogue archive" },
  ],
  spec: {
    brandEntityId: PHASE396_WATERMAN_BRAND_ID,
    values: {
      series_name: "Waterman Expert",
      release_year: "1990–92",
      origin_country: "当前 2214207 商品页称法国 Waterman 工艺中心手工组装；历史个体与地区 SKU 另核",
      nib: "当前 2214207：Waterman W stainless-steel nib；字幅依具体商品号；目录另有历史/地区 18K gold nib 记录",
      fill_system: "Waterman cartridge/converter；是否随盒附 converter 依市场和商品核对",
      material: "当前 2214207：深蓝 lacquer、palladium-coated trims、black resin shell、brass with lacquer cap；旧代材质另核",
      dimensions: "Pen Heaven 某不锈钢/金色饰件 SKU 参考：合帽 141 mm、后套 151 mm、直径 12.6 mm、27 g；不覆盖全系",
      status: "当前 Expert fountain-pen collection 与 Expert I/II/III 历史/二手识别并存；同名 rollerball/ballpoint 分列",
    },
    evidence: [
      evidence(`${SCOPE}-brand`, "brand_entity_id", SOURCES.product, "Waterman official product family context"),
      evidence(`${SCOPE}-series`, "series_name", SOURCES.collection, "current Expert collection title"),
      evidence(`${SCOPE}-release`, "release_year", SOURCES.history, "official 1990-92 heritage entry"),
      evidence(`${SCOPE}-origin`, "origin_country", SOURCES.product, "official hand-assembled in France statement"),
      evidence(`${SCOPE}-nib`, "nib", SOURCES.product, "2214207 Waterman W stainless-steel nib"),
      evidence(`${SCOPE}-fill`, "fill_system", SOURCES.filling, "official cartridge/converter instructions"),
      evidence(`${SCOPE}-material`, "material", SOURCES.product, "2214207 lacquer, palladium, resin and brass fields"),
      evidence(`${SCOPE}-dimensions`, "dimensions", SOURCES.penHeaven, "specific professional retailer dimensions and weight"),
      evidence(`${SCOPE}-status`, "status", SOURCES.collection, "current collection and writing-type separation"),
    ],
  },
  media: [{
    key: `${SCOPE}-primary-media`,
    title: "Waterman Expert 事实卡（非产品照片）",
    sourceKey: SOURCES.svg.key,
    localPath: SOURCES.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不代表真实比例、颜色、Logo、刻字、库存或具体版本。",
    sourceUrl: SOURCES.svg.url,
    usageStatus: "primary",
  }],
  timeline: [{
    key: `${SCOPE}-release-event`,
    title: "Expert 进入 Waterman 现代品牌史",
    eventType: "model_released",
    startDate: "1990",
    circa: true,
    description: "Waterman Heritage 官方时间线把 Expert 放在 1990–92，并将其描述为体量较饱满、动态设计的商务笔。",
    sourceKey: SOURCES.history.key,
  }],
  conflicts: [],
};

const watermanBrand: CuratedEntityPack = structuredClone(baseBrand);
watermanBrand.key = "phase396-waterman-brand-v1";

export const phase396WatermanExpertRefreshPacks: CuratedEntityPack[] = [
  watermanBrand,
  expert,
];
