import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE96_KACO_BRAND_ID = "sBV7J5ZK4msi";
export const PHASE96_KACO_MASTER14K_ID = "BTrjxhx1ByXM";

const RETRIEVED = "2026-07-20";

function source(
  input: Omit<
    CuratedSource,
    | "retrievedAt"
    | "allowedUse"
    | "homepageUrl"
    | "archiveUrl"
    | "archiveLocator"
    | "independenceGroup"
  >,
): CuratedSource {
  return {
    ...input,
    homepageUrl: input.url,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
    independenceGroup: input.registryKey,
  };
}

function svg(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase96",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase96",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  officialBrand: source({
    key: "phase96-kaco-official-brand",
    registryKey: "kaco-official-phase96",
    registryName: "KACO / Shanghai Wencai official",
    sourceType: "official",
    tier: "primary",
    title: "KACO official product centre",
    url: "https://www.kaco.cc/",
    summary: "KACO 官方站以上海文采实业有限公司署名，并将钢笔列为商务书写产品线；它可确认品牌及产品分类，不替代各历史 SKU 的规格。",
  }),
  official14k: source({
    key: "phase96-kaco-master14k-official",
    registryKey: "kaco-official-phase96",
    registryName: "KACO / Shanghai Wencai official",
    sourceType: "official",
    tier: "primary",
    title: "MASTER 大师 14K 金尖钢笔",
    url: "https://www.kaco.cc/list/87/855.htm",
    summary: "KACO 官方历史产品页明确把 MASTER 大师 14K 金尖钢笔放在商务书写的钢笔／金属钢笔目录；页面缺少可安全提取的尺寸、供墨和版本表，故不能虚构官方规格。",
  }),
  currentMaster: source({
    key: "phase96-kaco-master-current-store",
    registryKey: "kaco-store-phase96",
    registryName: "KACO Store",
    sourceType: "official",
    tier: "contemporary_archive",
    title: "Master Fountain Pen",
    url: "https://www.kacostore.com/products/kaco-master-fountain-pen",
    summary: "当前 KACO 商店的 Master 商品列 EF、按压帽、converter/cartridge 和红白黑色，但没有说它是 14K 金尖版；它只用于排除把当代普通 Master 规格倒灌给历史 14K。",
  }),
  nonopen14k: source({
    key: "phase96-kaco-master14k-nonopen",
    registryKey: "nonopen-kaco-master14k",
    registryName: "钢笔爱好者 / nonopen",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "国产金笔 KACO MASTER 亚克力 14K 钢笔评测",
    url: "https://www.nonopen.com/5311.html",
    publishedAt: "2019-03-21",
    summary: "2019 年独立评测以实物称 MASTER 14K 为当时 KACO 首款金尖笔，记录亚克力笔身、随附转换器、大型 14K 尖与样本书写观察；作者的材料推测和手感不外推为工程规格。",
  }),
  fpn14k: source({
    key: "phase96-kaco-master14k-fpn",
    registryKey: "fountain-pen-network-kaco-master",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    title: "Kaco Master With 14K Gold Nib — Hidden Gem",
    url: "https://www.fountainpennetwork.com/forum/topic/353598-kaco-master-with-14k-gold-nib-hidden-gem/",
    publishedAt: "2020-05-02",
    summary: "收藏者样本记录盖帽约 154 mm、去帽约 135 mm、约 28 g，并认为笔帽较重；这是单支测量与个人体验，只用作样本范围。",
  }),
  brandSvg: svg(
    "phase96-kaco-brand-svg",
    "KACO 品牌与 Master 系列导航事实卡",
    "/images/library/site-original/kaco/kaco-brand.svg",
  ),
  penSvg: svg(
    "phase96-kaco-master14k-svg",
    "KACO Master 14K 边界事实卡",
    "/images/library/site-original/kaco/kaco-master14k.svg",
  ),
};

function ev(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

const brandScope = "phase96-kaco-brand-scope";
const penScope = "phase96-kaco-master14k-scope";

const brand: CuratedEntityPack = {
  key: "phase96-kaco-brand-v1",
  entityId: PHASE96_KACO_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "kaco",
  canonicalName: "KACO（上海文采）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/kaco-brand.md",
  storyTitle: "KACO：上海文采的钢笔产品线与 Master 身份边界",
  primarySourceKey: S.officialBrand.key,
  depthTier: "A",
  aliases: [
    { alias: "KACO", language: "en", sourceKey: S.officialBrand.key },
    { alias: "上海文采", language: "zh", sourceKey: S.officialBrand.key },
    { alias: "文采", language: "zh", sourceKey: S.officialBrand.key },
  ],
  sources: [S.officialBrand, S.official14k, S.currentMaster, S.nonopen14k, S.brandSvg],
  scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "current", editionScope: "KACO 品牌与已整理 Master 14K 导航；普通 Master、钢尖版本和其它书写工具按精确 SKU 与年代分开。" }],
  claims: [
    { key: "phase96-kaco-brand-identity", predicate: "brand_identity", objectText: "KACO 是上海文采实业有限公司使用的书写工具品牌。官方站同时有日常与商务书写产品，品牌名称本身不能替代某支钢笔的材料、笔尖或供墨身份。", factClass: "core", confidence: 0.99, sourceKey: S.officialBrand.key, locator: "official company footer and product navigation", evidence: [{ key: "phase96-kaco-brand-identity-e", sourceKey: S.officialBrand.key, scopeKey: brandScope, locator: "Shanghai Wencai company footer; fountain-pen product navigation" }] },
    { key: "phase96-kaco-brand-navigation", predicate: "series_navigation", objectText: "本页当前链接 KACO Master 14K 金尖钢笔。Master 这个名称后来仍出现在当代普通商品中，但当代 EF、按压帽、墨囊/转换器和红白黑颜色资料不能自动覆盖历史 14K 版本；两者必须按笔尖与具体 SKU 分页或分 variant。", factClass: "core", confidence: 0.99, sourceKey: S.currentMaster.key, locator: "current Master product specification", evidence: [{ key: "phase96-kaco-brand-navigation-current", sourceKey: S.currentMaster.key, scopeKey: brandScope, locator: "current EF, snap cap, converter/cartridge, red-white-black listing" }, { key: "phase96-kaco-brand-navigation-14k", sourceKey: S.official14k.key, scopeKey: brandScope, locator: "official Master 14K product title" }, { key: "phase96-kaco-brand-navigation-review", sourceKey: S.nonopen14k.key, scopeKey: brandScope, locator: "2019 14K Master sample confirms a separate historical gold-nib scope" }] },
  ],
  media: [{ key: "phase96-kaco-brand-media", title: "KACO 品牌与 Master 导航事实卡（非产品照片）", sourceKey: S.brandSvg.key, localPath: S.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片。", sourceUrl: S.brandSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "phase96-kaco-master14k-listed", title: "MASTER 14K 出现在 KACO 官方产品目录", eventType: "design_milestone", startDate: "2019", circa: true, description: "2019 独立评测已记录该金尖款；官网产品页没有给出可核实的首发日期，因此不把评测日期伪装为发布日。", sourceKey: S.nonopen14k.key }, { key: "phase96-kaco-current-master", title: "同名 Master 在当前商店以普通商品资料出现", eventType: "design_milestone", startDate: "2026", circa: true, description: "当前商店列 EF、按压帽与 converter/cartridge；这是资料观察窗口，不表示历史 14K 的复刻或换代日期。", sourceKey: S.currentMaster.key }],
};

const master14k: CuratedEntityPack = {
  key: "phase96-kaco-master14k-v1",
  entityId: PHASE96_KACO_MASTER14K_ID,
  expectedType: "pen",
  expectedSlug: "kaco-master大师14k",
  canonicalName: "KACO Master 大师 14K 金尖钢笔",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/kaco-master14k.md",
  storyTitle: "KACO Master 大师 14K：不能用当代普通 Master 的规格覆盖它",
  primarySourceKey: S.official14k.key,
  depthTier: "A",
  aliases: [
    { alias: "KACO MASTER 14K", language: "en", sourceKey: S.official14k.key },
    { alias: "KACO Master 大师 14K 金尖钢笔", language: "zh", sourceKey: S.official14k.key },
    { alias: "KACO 大师 14K", language: "zh", sourceKey: S.nonopen14k.key },
  ],
  sources: [S.official14k, S.currentMaster, S.nonopen14k, S.fpn14k, S.penSvg],
  scopes: [{ key: penScope, scopeKey: penScope, productionState: "historical", editionScope: "2019 年前后可见的 Master 14K 金尖款；普通 Master、双色钢尖与不同颜色/包装必须按实际 SKU 区分。" }],
  claims: [
    { key: "phase96-kaco-master14k-identity", predicate: "model_identity", objectText: "KACO Master 大师 14K 是 KACO 官方目录中的 14K 金尖钢笔。2019 年独立实物评测将它称为品牌当时的首款金尖笔，记录亚克力笔身、随附转换器与大型 14K 笔尖；它不是今天商店中所有名为 Master 的普通钢笔。", factClass: "core", confidence: 0.99, sourceKey: S.official14k.key, locator: "official historical product title", evidence: [{ key: "phase96-kaco-master14k-official", sourceKey: S.official14k.key, scopeKey: penScope, locator: "MASTER 大师 14K 金尖钢笔 product title and fountain-pen category" }, { key: "phase96-kaco-master14k-review", sourceKey: S.nonopen14k.key, scopeKey: penScope, locator: "2019 sample: first KACO gold-nib pen, acrylic body, converter and 14K nib" }] },
    { key: "phase96-kaco-master14k-boundary", predicate: "version_boundary", objectText: "历史 Master 14K 与当代 Master 必须分开：当前商品页只列 EF、按压帽、converter/cartridge 与红白黑色，却没有把它标为 14K。论坛中约 154 mm、28 g 的数据是单支 14K 样本，不能写成所有 Master、所有颜色或所有批次的固定规格；后来的双色钢尖款也不是金尖版的同义词。", factClass: "core", confidence: 0.98, sourceKey: S.currentMaster.key, locator: "current Master specifications versus historical sample", evidence: [{ key: "phase96-kaco-master14k-current", sourceKey: S.currentMaster.key, scopeKey: penScope, locator: "current EF, snap-on closure and converter/cartridge listing without a 14K designation" }, { key: "phase96-kaco-master14k-fpn", sourceKey: S.fpn14k.key, scopeKey: penScope, locator: "individual 14K sample dimensions and weight" }] },
    { key: "phase96-kaco-master14k-care", predicate: "use_and_care", objectText: "先按实际笔身确认它使用的是墨囊、转换器或其它上墨组件；换墨时以常温清水清洗笔尖和笔舌并自然晾干，避免墨水在笔尖干结。不要把当代普通 Master 的按压帽、尖号或配件当作 14K 版的保证，也不要凭网上照片强拆笔尖或用力压弹。金尖、笔舌、树脂表面或供墨异常时，保留刻字与照片并交由销售方或专业维修判断。", factClass: "editorial", confidence: 0.97, sourceKey: S.currentMaster.key, locator: "current KACO conservative cleaning guidance", evidence: [{ key: "phase96-kaco-master14k-care-current", sourceKey: S.currentMaster.key, scopeKey: penScope, locator: "lukewarm-water cleaning, avoid dried ink and impact guidance" }, { key: "phase96-kaco-master14k-care-review", sourceKey: S.nonopen14k.key, scopeKey: penScope, locator: "historical 14K sample converter and nib/feed context" }] },
  ],
  variants: [
    { key: "phase96-kaco-master14k-gold", name: "Master 14K 金尖历史款", releaseYear: "2019 前后资料可见", notes: "本页主语；笔身、笔尖和包装只以对应实物或资料确认。", sourceKey: S.official14k.key, variantKind: "edition_group" },
    { key: "phase96-kaco-master-current", name: "当代普通 Master 商品", releaseYear: "当前商店资料", notes: "EF、按压帽、converter/cartridge 与红白黑色仅属于当前商品页范围；不回填 14K 页面。", sourceKey: S.currentMaster.key, variantKind: "market_sku", market: "KACO Store" },
  ],
  spec: { brandEntityId: PHASE96_KACO_BRAND_ID, values: { series_name: "KACO Master 大师 14K 金尖钢笔", release_year: "2019 年前后资料可见；未取得可核实的官方首发日", origin_country: "中国 KACO／上海文采品牌语境；制造地点与批次须按实物或官方 SKU 核对", nib: "14K 金尖；具体尖号、几何、软硬与生产方按实物/证书，不把评测体验外推", fill_system: "独立 2019 样本随附转换器；墨囊兼容性、容量与不同批次组件须核实", material: "独立评测样本称亚克力笔身；颜色、饰件和表面处理按实物/版本", dimensions: "独立 14K 样本约 154 mm 盖帽、135 mm 去帽；不是全系固定尺寸", weight: "独立 14K 样本约 28 g 盖帽；不同批次、配件和称量方式会变化", status: "历史 14K 版本；当前 Master 商品是否同款须以笔尖与 SKU 判断" }, evidence: [ev("brand_entity_id", "phase96-kaco-master14k-brand", S.officialBrand.key, penScope, "official KACO brand context"), ev("series_name", "phase96-kaco-master14k-series", S.official14k.key, penScope, "official product title"), ev("release_year", "phase96-kaco-master14k-release", S.nonopen14k.key, penScope, "dated 2019 independent review; not asserted as launch date"), ev("origin_country", "phase96-kaco-master14k-origin", S.officialBrand.key, penScope, "Shanghai Wencai official identity"), ev("nib", "phase96-kaco-master14k-nib", S.official14k.key, penScope, "official 14K title"), ev("fill_system", "phase96-kaco-master14k-fill", S.nonopen14k.key, penScope, "2019 sample converter"), ev("material", "phase96-kaco-master14k-material", S.nonopen14k.key, penScope, "2019 sample acrylic body"), ev("dimensions", "phase96-kaco-master14k-dimensions", S.fpn14k.key, penScope, "single reviewed sample measurements"), ev("weight", "phase96-kaco-master14k-weight", S.fpn14k.key, penScope, "single reviewed sample weight"), ev("status", "phase96-kaco-master14k-status", S.currentMaster.key, penScope, "current Master product differs in listed specs")] },
  media: [{ key: "phase96-kaco-master14k-media", title: "KACO Master 14K 边界事实卡（非产品照片）", sourceKey: S.penSvg.key, localPath: S.penSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表示真实颜色、比例、笔尖或包装。", sourceUrl: S.penSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "phase96-kaco-master14k-review-window", title: "Master 14K 的公开评测资料窗口", eventType: "model_released", startDate: "2019", circa: true, description: "2019 年独立评测已记录此版本；这里是公开资料窗口，不能代替官方首发日期。", sourceKey: S.nonopen14k.key }],
};

export const phase96KacoMaster14kPacks = [brand, master14k];
