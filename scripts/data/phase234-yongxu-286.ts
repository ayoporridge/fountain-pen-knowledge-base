import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE234_YONGXU_BRAND_ID = "yTWZrIZnGyMx";
export const PHASE234_YONGXU_BRAND_SLUG = "yongxu";
export const PHASE234_YONGXU_PEN_ID = "phase234-yongxu-286";
export const PHASE234_YONGXU_PEN_SLUG = "yongxu-286";
export const PHASE234_YONGXU_PEN_NAME = "YongXu 286";
const RETRIEVED = "2026-07-26";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string; publishedAt?: string }): CuratedSource {
  return {
    ...input,
    independenceGroup: input.registryKey,
    homepageUrl: input.url.startsWith("http") ? new URL(input.url).origin : "/",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase234",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase234",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、库存或具体批次。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false`,
  };
}

const S = {
  ad: web({ key: "phase234-yongxu-286-ad", title: "365Days Stationery YongXu 286 product advertisement", url: "https://a.aliexpress.com/_mNKEb7z", registryKey: "365days-aliexpress-phase234", registryName: "365Days Stationery", sourceType: "retailer", tier: "contemporary_archive", summary: "Fountain Pen Network 保存的 365Days Stationery 商品广告链接把 286 作为独立型号，并记录 2025 年约 39.99 美元的历史快照；链接现可能缺货或下架，价格不外推为当前定价。", locator: "YongXu 286 product ad; 2025 price snapshot; stock is mutable" }),
  fpn: web({ key: "phase234-yongxu-286-fpn-tariff", title: "Fountain Pen Network: Tariff Test — Yongxu 286", url: "https://www.fountainpennetwork.com/forum/topic/378600-tariff-test-yongxu-286/", registryKey: "fountain-pen-network-yongxu-phase234", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", summary: "收藏者讨论记录 286 的按钮上墨、Wing Sung 钢尖供货、约 100 支 14K keyhole demo 样本和 365Days 商品广告；均按帖子样本与市场快照处理，不写成全系标配。", locator: "286 button filler; Wing Sung nib sample; approximately 100 14K keyhole demo samples; listing link" }),
  repair: web({ key: "phase234-yongxu-286-fpn-repair", title: "Fountain Pen Network: Model 28 Revisited", url: "https://www.fountainpennetwork.com/forum/topic/380928-model-28-revisited/", registryKey: "fountain-pen-network-yongxu-repair-phase234", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", summary: "单支 YongXu 286 的维修观察指出厚壁硅胶墨囊、压力条与笔杆空间存在挤压，按钮操作需谨慎；这是一个样本的维修证据，不是全批次缺陷结论。", locator: "YongXu 286 sample; thick-walled sac; pressure bar and section observations" }),
  nib: web({ key: "phase234-yongxu-286-reddit-nib", title: "Reddit: Yongxu 286 and Jun Lai 14K nib sample", url: "https://www.reddit.com/r/fountainpens/comments/1rdiazq/youve_probably_never_seen_this_one_before/", registryKey: "reddit-yongxu-286-phase234", registryName: "r/fountainpens", sourceType: "reddit", tier: "community", summary: "收藏者展示带 Jun Lai 14K 尖的 286 样本及车削树脂笔身；只作辅助版本线索，不升级为官方规格或普遍配置。", locator: "Yongxu 286 sample; Jun Lai 14K nib; turned acrylic body" }),
  context: web({ key: "phase234-yongxu-context", title: "Reddit: New Nib Day — Type 116, 296 and 286", url: "https://www.reddit.com/r/fountainpens/comments/1uzj4zz/new_nib_day/", registryKey: "reddit-yongxu-context-phase234", registryName: "r/fountainpens", sourceType: "reddit", tier: "community", summary: "当代收藏样本把 Type 116、296 与早期 286 放在 YongXu 小批量工作室语境中；不承载 286 的统一尺寸或品牌厂史。", locator: "YongXu workshop context; Type 116/296/286 sample discussion" }),
  svg: diagram("phase234-yongxu-286-svg", "YongXu 286 button-filler identity diagram", "/images/library/site-original/phase234/yongxu/yongxu-286.svg"),
} as const;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(source: CuratedSource) {
  return [{ key: "phase234-yongxu-286-primary", title: "YongXu 286 按钮上墨与笔尖版本事实图（非产品照片）", sourceKey: source.key, localPath: source.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存或具体批次。", sourceUrl: source.url, usageStatus: "primary" as const }];
}

const brandScope = "phase234-yongxu-brand-navigation";
const penScope = "phase234-yongxu-286-current-market";

const brand: CuratedEntityPack = {
  key: "phase234-yongxu-brand-v1",
  entityId: PHASE234_YONGXU_BRAND_ID,
  expectedType: "brand",
  expectedSlug: PHASE234_YONGXU_BRAND_SLUG,
  canonicalName: "永续 (YongXu)",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/yongxu-286-phase234.md",
  storyTitle: "YongXu：小批量复古钢笔的型号边界",
  primarySourceKey: S.ad.key,
  depthTier: "A",
  aliases: [
    { alias: "YongXu", language: "en", sourceKey: S.ad.key },
    { alias: "Yongxu", language: "en", sourceKey: S.ad.key },
    { alias: "永续", language: "zh", sourceKey: S.ad.key },
  ],
  sources: [S.ad, S.fpn, S.repair, S.nib, S.context, S.svg],
  scopes: [{ key: brandScope, scopeKey: brandScope, validFrom: RETRIEVED, productionState: "current", editionScope: "品牌页以公开资料能独立辨认的 286 为入口；不把 116、296 或旧 Gold Star 型号写成同一型号，也不虚构法人、工厂和完整目录。" }],
  claims: [
    { key: "phase234-yongxu-brand-identity", predicate: "brand_identity", objectText: "YongXu／永续是公开市场中可辨认的小批量钢笔品牌名称；现有资料主要来自产品广告、独立收藏讨论和维修样本，不足以支持未经来源化的公司沿革或制造商断言。", factClass: "core", confidence: 0.98, sourceKey: S.ad.key, locator: S.ad.summary, evidence: [{ key: "phase234-yongxu-brand-ad", sourceKey: S.ad.key, scopeKey: brandScope, locator: "286 独立商品广告" }, { key: "phase234-yongxu-brand-fpn", sourceKey: S.fpn.key, scopeKey: brandScope, locator: "FPN 讨论把 YongXu 置于小批量工作室语境" }] },
    { key: "phase234-yongxu-brand-navigation", predicate: "brand_model_navigation", objectText: "YongXu 品牌页当前公开 286 入口；Type 116、296 和其他复古型号在资料、上墨结构和笔尖配置上仍应分别核验，不能因为外形相近就合并。", factClass: "core", confidence: 0.98, sourceKey: S.context.key, locator: S.context.summary, evidence: [{ key: "phase234-yongxu-navigation-evidence", sourceKey: S.context.key, scopeKey: brandScope, locator: "116/296/286 分开出现的当代收藏语境" }, { key: "phase234-yongxu-286-navigation-evidence", sourceKey: S.ad.key, scopeKey: brandScope, locator: "286 独立商品标题" }] },
  ],
  timeline: [
    { key: "phase234-yongxu-brand-market", title: "286 当代商品窗口", eventType: "model_released", startDate: "2025", circa: true, description: "365Days 商品广告与 FPN 讨论共同提供 286 的当代市场窗口；不是 YongXu 品牌首发年份。", sourceKey: S.ad.key },
    { key: "phase234-yongxu-brand-review", title: "286 独立收藏与维修记录", eventType: "community_event", startDate: "2025", circa: true, description: "独立讨论记录按钮上墨、钢尖与少量金尖 demo 的版本差异，帮助品牌页避免把小批次样本写成统一规格。", sourceKey: S.fpn.key },
  ],
  media: media(S.svg),
};

const pen: CuratedEntityPack = {
  key: "phase234-yongxu-286-v1",
  entityId: PHASE234_YONGXU_PEN_ID,
  expectedType: "pen",
  expectedSlug: PHASE234_YONGXU_PEN_SLUG,
  canonicalName: PHASE234_YONGXU_PEN_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/yongxu-286-phase234.md",
  storyTitle: "YongXu 286：按钮上墨、复古树脂与笔尖选项",
  primarySourceKey: S.ad.key,
  depthTier: "A",
  aliases: [
    { alias: "YongXu Type 286", language: "en", sourceKey: S.ad.key },
    { alias: "Yongxu 286", language: "en", sourceKey: S.ad.key },
    { alias: "永续 286", language: "zh", sourceKey: S.ad.key },
  ],
  sources: [S.ad, S.fpn, S.repair, S.nib, S.context, S.svg],
  scopes: [{ key: penScope, scopeKey: penScope, validFrom: RETRIEVED, productionState: "current", nibScope: "钢尖为常见市场样本；Jun Lai 14K keyhole 只绑定特定 demo／样本，不是全系标配。", materialScope: "车削树脂／亚克力笔身与金属饰件；颜色、透明度、尺寸和重量随小批次与具体笔核对。", editionScope: "现代小批量 Type 286；不等同 Gold Star Model 28，也不包含 Type 116/296。" }],
  claims: [
    { key: "phase234-yongxu-286-identity", predicate: "model_identity", objectText: "YongXu 286 是独立的现代小批量复古钢笔型号；它借鉴旧式按钮上墨语汇，但不是 Gold Star Model 28 的原厂本体，也不应与 YongXu 116／296 合并。", factClass: "core", confidence: 0.99, sourceKey: S.ad.key, locator: S.ad.summary, evidence: [{ key: "phase234-yongxu-286-ad", sourceKey: S.ad.key, scopeKey: penScope, locator: "286 独立商品广告" }, { key: "phase234-yongxu-286-fpn-id", sourceKey: S.fpn.key, scopeKey: penScope, locator: "FPN 讨论标题与型号" }] },
    { key: "phase234-yongxu-286-filler", predicate: "filling_system", objectText: "286 使用按钮上墨与墨囊：尾端按钮通过压力条挤压墨囊吸墨。单支维修记录显示墨囊壁厚、压力条间隙和 section 状态会影响操作，不能照搬其他旧式按钮笔的零件。", factClass: "core", confidence: 0.98, sourceKey: S.fpn.key, locator: S.fpn.summary, evidence: [{ key: "phase234-yongxu-286-filler-evidence", sourceKey: S.fpn.key, scopeKey: penScope, locator: "button filler and listing sample" }, { key: "phase234-yongxu-286-repair-evidence", sourceKey: S.repair.key, scopeKey: penScope, locator: "single sample sac/pressure-bar repair observation" }] },
    { key: "phase234-yongxu-286-material", predicate: "material_boundary", objectText: "公开样本把 286 描述为车削树脂／亚克力笔身和金属饰件；颜色、透明度与表面处理是小批次或 SKU 级信息，不推导统一材质比例。", factClass: "core", confidence: 0.97, sourceKey: S.nib.key, locator: S.nib.summary, evidence: [{ key: "phase234-yongxu-286-material-evidence", sourceKey: S.nib.key, scopeKey: penScope, locator: "turned acrylic sample" }] },
    { key: "phase234-yongxu-286-nib", predicate: "nib_boundary", objectText: "不同渠道和样本可见 Wing Sung／Moonman 钢尖；少量讨论提到 Jun Lai 14K keyhole demo。应按尖面刻字和订单确认尖材，不能把金色外观或 14K 样本写成全系标准。", factClass: "core", confidence: 0.98, sourceKey: S.fpn.key, locator: S.fpn.summary, evidence: [{ key: "phase234-yongxu-286-nib-fpn", sourceKey: S.fpn.key, scopeKey: penScope, locator: "Wing Sung sample and approximately 100 14K demo samples" }, { key: "phase234-yongxu-286-nib-community", sourceKey: S.nib.key, scopeKey: penScope, locator: "Jun Lai 14K sample" }] },
    { key: "phase234-yongxu-286-purchase", predicate: "purchase_boundary", objectText: "2025 年广告曾出现约 39.99 美元价格快照，但商品库存和价格会变动；购买前应核对按钮、墨囊、笔尖、裂纹和试写状态，并预留小批量旧笔的维修预算。", factClass: "editorial", confidence: 0.97, sourceKey: S.ad.key, locator: S.ad.summary, evidence: [{ key: "phase234-yongxu-286-price-evidence", sourceKey: S.ad.key, scopeKey: penScope, locator: "historical price snapshot" }] },
    { key: "phase234-yongxu-286-care", predicate: "maintenance_boundary", objectText: "先用常温清水测试按钮和墨囊，再少量吸入普通染料墨；不使用强溶剂、热水或钳子强拆。漏墨、按钮卡滞和 section 松动应交给熟悉按钮上墨的维修者。", factClass: "editorial", confidence: 0.98, sourceKey: S.repair.key, locator: S.repair.summary, evidence: [{ key: "phase234-yongxu-286-care-evidence", sourceKey: S.repair.key, scopeKey: penScope, locator: "conservative repair boundary from single sample" }] },
  ],
  variants: [
    { key: "phase234-yongxu-286-steel", name: "钢尖市场样本", notes: "Wing Sung／Moonman 等钢尖供货在收藏者样本中出现；具体刻字、字幅与总成按订单和实物核对。", sourceKey: S.fpn.key, variantKind: "nib" },
    { key: "phase234-yongxu-286-14k-demo", name: "14K keyhole demo 样本", notes: "资料提到约 100 支 demo 样本；不等于所有 286 标配金尖，也不替代刻字和编号检查。", sourceKey: S.fpn.key, variantKind: "edition_group" },
  ],
  spec: {
    brandEntityId: PHASE234_YONGXU_BRAND_ID,
    values: {
      series_name: "YongXu 286",
      release_year: "2025–2026 年公开商品与评测窗口；未据此断言首发年份",
      origin_country: "YongXu 产品线；公开资料不足以确认法人、工厂或统一产地声明",
      nib: "Wing Sung／Moonman 钢尖为常见样本；少量 Jun Lai 14K keyhole demo 需逐支核对",
      fill_system: "按钮上墨与墨囊；压力条、墨囊和 section 按具体样本检查",
      material: "车削树脂／亚克力笔身与金属饰件；颜色和透明度随批次",
      dimensions: "尚无可核实的统一目录尺寸；按具体笔实测",
      weight: "尚无可核实的统一目录克重；装饰、尖和墨水状态会改变样本重量",
      price_range: "2025 年 AliExpress 广告曾显示 39.99 美元；历史快照，不代表当前价格",
      status: "小批量现代型号；库存与笔尖配置随渠道变化",
    },
    evidence: [
      evidence("brand_entity_id", "phase234-yongxu-286-brand", S.ad.key, penScope, "YongXu 286 product ad"),
      evidence("series_name", "phase234-yongxu-286-series", S.ad.key, penScope, "286 product title"),
      evidence("release_year", "phase234-yongxu-286-release", S.fpn.key, penScope, "2025 listing/review window; launch year withheld"),
      evidence("origin_country", "phase234-yongxu-286-origin", S.context.key, penScope, "YongXu workshop context without factory inference"),
      evidence("nib", "phase234-yongxu-286-nib-spec", S.fpn.key, penScope, "Wing Sung and 14K demo sample boundary"),
      evidence("fill_system", "phase234-yongxu-286-fill", S.fpn.key, penScope, "button filler and sac"),
      evidence("material", "phase234-yongxu-286-material-spec", S.nib.key, penScope, "turned acrylic sample"),
      evidence("dimensions", "phase234-yongxu-286-dimensions", S.ad.key, penScope, "no stable catalogue dimension; measured per pen"),
      evidence("weight", "phase234-yongxu-286-weight", S.ad.key, penScope, "no stable catalogue weight; measured per pen"),
      evidence("price_range", "phase234-yongxu-286-price", S.ad.key, penScope, "2025 historical price snapshot"),
      evidence("status", "phase234-yongxu-286-status", S.ad.key, penScope, "mutable marketplace listing"),
    ],
  },
  timeline: [{ key: "phase234-yongxu-286-market-window", title: "286 的当代市场与评测窗口", eventType: "model_released", startDate: "2025", circa: true, description: "Fountain Pen Network 记录 2025 年 365Days 广告与收藏样本；该日期是可见市场窗口，不是厂商首发年份。", sourceKey: S.fpn.key }],
  media: media(S.svg),
};

export const phase234Yongxu286Packs: CuratedEntityPack[] = [brand, pen];
