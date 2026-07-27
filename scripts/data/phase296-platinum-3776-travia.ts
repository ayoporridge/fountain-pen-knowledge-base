import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase42LamyPlatinumPacks, PHASE42_PLATINUM_BRAND_ID } from "./phase42-lamy-platinum";

export const PHASE296_TRAVIA_ID = "phase296-platinum-3776-travia";
export const PHASE296_TRAVIA_SLUG = "platinum-3776-century-travia";
export const PHASE296_TRAVIA_NAME = "Platinum #3776 CENTURY Travia";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase296-platinum-travia-current";

function source(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
  publishedAt?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase296/platinum/3776-century-travia.svg";
  return {
    key: "phase296-travia-diagram",
    registryKey: "fountain-pen-graph-editorial-phase296",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase296",
    title: "Platinum #3776 CENTURY Travia FLAF 结构事实图",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG，区分 Travia 长身平顶、金属配重、金属握位、钌镀 14K FLAF 尖和 F/M SKU；不是产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const official = source({
  key: "phase296-travia-official-pdf",
  title: "Platinum #3776 CENTURY Travia official product PDF",
  url: "https://www.platinum-pen.co.jp/common/pdf/travia_en.pdf",
  registryKey: "platinum-official-phase296-travia",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  summary: "官方 PDF 列出 FLAF 命名与受力比较、长身平顶和中段 balancer、Onyx Black、PFL-600、142 mm、15 mm、29.3 g、钌镀 14K 尖、F/M 货号、Slip & Seal 与附件。",
  locator: "one-page English Travia product PDF: FLAF explanation, structure, specifications, product codes and accessories",
});

const press = source({
  key: "phase296-travia-official-press",
  title: "Platinum official Travia press release",
  url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2026/03/b6fcdb7e8038ebef82136b8733cc027d.pdf",
  registryKey: "platinum-official-phase296-travia",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official",
  tier: "contemporary_archive",
  publishedAt: "2026-03-09",
  summary: "官方日文发布资料记录 2026-03-14 发售、PFL-600、F/M 产品号与 JAN 码、初回 2,000 套特别包装、Converter-700A、蓝黑墨囊和修订版书册。",
  locator: "2026-03-09 press release specification table and first-batch package section",
});

const manual = source({
  key: "phase296-travia-platinum-manual",
  title: "Platinum fountain pen instruction manual",
  url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2025/04/fourtainpen.pdf",
  registryKey: "platinum-care-phase296",
  registryName: "Platinum official manual",
  sourceType: "official",
  tier: "contemporary_archive",
  summary: "官方说明书用于墨囊/Converter-700A 装填、冲洗和保存边界；不把通用清洁说明改写成 Travia 独有结构。",
  locator: "fountain pen cartridge/converter filling, cleaning and storage panels",
});

const review = source({
  key: "phase296-travia-penboutique",
  title: "Pen Boutique: Platinum #3776 Century Travia FLAF nib",
  url: "https://www.penboutique.com/fr/blogs/blog/platinum-3776-century-travia-fountain-pen",
  registryKey: "penboutique-phase296-travia",
  registryName: "Pen Boutique",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立评测补充 Travia 与普通 3776、DECADE 的定位比较，以及 FLAF 尖的试写观察；体验判断只属于评测样本，不覆盖所有尖幅。",
  locator: "model-level review, FLAF writing observations and sibling comparison",
});

const community = source({
  key: "phase296-travia-fpn",
  title: "Fountain Pen Network: Platinum #3776 Century Travia",
  url: "https://www.fountainpennetwork.com/forum/topic/380891-platinum-3776-century-travia/",
  registryKey: "fountain-pen-network-phase296-travia",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "contemporary_archive",
  summary: "玩家讨论提供早期拥有者的重量、重心和 FLAF 试写语境；只作为二手经验，不能替代官方尺寸、材料或库存结论。",
  locator: "2026 Travia owner discussion and writing impressions; sample observations only",
});

const svg = diagram();
const brand = phase42LamyPlatinumPacks.find((pack) => pack.entityId === PHASE42_PLATINUM_BRAND_ID);
if (!brand) throw new Error("Phase 296 Platinum brand baseline pack is missing.");

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core") {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.99 : 0.92,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }],
  } satisfies CuratedEntityPack["claims"][number];
}

function specEvidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const model: CuratedEntityPack = {
  key: "phase296-platinum-3776-century-travia-v1",
  entityId: PHASE296_TRAVIA_ID,
  expectedType: "pen",
  expectedSlug: PHASE296_TRAVIA_SLUG,
  canonicalName: PHASE296_TRAVIA_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/platinum-3776-century-travia-phase296.md",
  storyTitle: "Platinum #3776 CENTURY Travia：FLAF 尖、长身平顶与首批限定包装",
  primarySourceKey: official.key,
  depthTier: "A",
  aliases: [
    { alias: "Platinum #3776 CENTURY Travia", language: "en", sourceKey: official.key },
    { alias: "#3776 CENTURY Travia", language: "en", sourceKey: official.key },
    { alias: "Platinum Travia", language: "en", sourceKey: review.key },
    { alias: "白金 #3776 CENTURY Travia", language: "zh", sourceKey: press.key },
    { alias: "白金 3776 Travia", language: "zh", sourceKey: press.key },
  ],
  sources: [official, press, manual, review, community, svg],
  scopes: [{ key: SCOPE, scopeKey: SCOPE, market: "Platinum current Japan/global Travia product information", validFrom: "2026-03-14", productionState: "current", nibScope: "FLAF ruthenium-plated 14K; current F/M SKUs only", materialScope: "Onyx Black resin body/cap with black-plated metal grip, balancer and trim", editionScope: "Travia fountain pen; first 2,000 special packages are an edition boundary, not a separate model" }],
  claims: [
    claim("phase296-travia-identity", "model_identity", "#3776 CENTURY Travia 是 Platinum 在 #3776 Century 谱系中于 2026 年推出的独立钢笔型号；它不是普通 Century 换色，也不是 DECADE 的别名。", official.key, "official Travia identity and #3776 lineage"),
    claim("phase296-travia-release", "release", "官方发布资料把 Travia 的发售日列为 2026 年 3 月 14 日；2026 是型号发布年份，不是 Platinum 或 #3776 的起源年份。", press.key, "official release date and lineage table"),
    claim("phase296-travia-flaf", "nib", "FLAF 是 Float Like A Feather 的缩写，当前 Travia 使用钌镀层 14K 金尖，官方列 F 与 M 两种尖幅；不要把普通 Century 的全部尖号回填给 Travia。", official.key, "FLAF name, ruthenium-plated 14K and F/M product codes"),
    claim("phase296-travia-flex", "nib_response_boundary", "官方受力比较显示 FLAF 在测试中比当前 Century F 需要更小压力，并呈更线性的弯曲响应；这描述设计测试趋势，不等于可硬压的 flex 尖或人人一致的线宽。", official.key, "official FLAF load-distance comparison and measurement method"),
    claim("phase296-travia-structure", "construction", "Travia 采用 DECADE 延续的平顶轮廓，但改为更长的笔身，并在笔杆中段设置 balancer、在握位加入金属，以把重心向指尖移动。", official.key, "official long-body, metal balancer and metal grip description"),
    claim("phase296-travia-material", "material", "Onyx Black 版本的笔杆与笔帽为树脂，握位为黑色镀铬金属；冠、尾塞、环、夹和 balancer 为黑镍镀层金属，颜色与光泽不由本站示意图证明。", official.key, "official material specification table"),
    claim("phase296-travia-size", "dimensions", "官方规格为全长约 142 mm、最大直径约 15 mm、平均重量 29.3 g；这是 Travia 的型号级锚点，不回填普通 #3776 Century。", official.key, "official size and average weight fields"),
    claim("phase296-travia-filling", "filling_system", "Travia 使用 Platinum 墨囊或 Converter-700A；换墨应按官方说明吸排清水，不把它写成活塞或真空上墨型号。", manual.key, "official cartridge/converter filling and cleaning guidance"),
    claim("phase296-travia-seal", "cap_seal", "Travia 沿用 #3776 Century 的 Slip & Seal 气密笔帽逻辑，可减少闲置干涸风险，但不能承诺任何墨水、环境或时长都绝对不干。", official.key, "official Slip & Seal family explanation"),
    claim("phase296-travia-package", "edition_boundary", "首批 2,000 套特别包装包含修订版《啊，风雪五十年》、Converter-700A、蓝黑墨囊和特制盒；初回包装库存结束后转普通包装，书册不是永久型号规格。", press.key, "official first-batch 2,000-set package and standard edition boundary"),
    claim("phase296-travia-review-boundary", "secondary_identity_check", "Pen Boutique 的型号级评测把 Travia 作为带 FLAF 尖的独立 #3776 变体讨论，并将试写观察与普通 Century、DECADE 的定位区分开；这只补充样笔语境，不替代官方尺寸和材料。", review.key, "independent model review and sibling boundary"),
    claim("phase296-travia-sibling", "version_boundary", "普通 #3776 Century、2022 DECADE、Ver.2.0、Fuji 与 Maki-e 是相邻型号或变体；它们的照片、重量、材料和尖号不能直接覆盖 Travia。", review.key, "independent sibling comparison and model boundary", "editorial"),
    claim("phase296-travia-writing", "selection_guidance", "喜欢有分量、平顶长身和较柔和尖感的人可把 Travia 作为试写对象；习惯轻量树脂笔或快速记录者应先试握，不能只凭 FLAF 名称判断舒适度。", community.key, "owner sample observations and handling context", "editorial"),
    claim("phase296-travia-care", "maintenance_guidance", "清洁时使用室温清水并自然阴干，避免酒精、漂白剂、热水、强清洁剂和金属抛光；黑镀层、钌镀层和树脂都不适合用力摩擦。", manual.key, "official cleaning and storage guidance", "editorial"),
  ],
  variants: [
    { key: "phase296-travia-f", name: "Onyx Black FLAF F", releaseYear: "2026-03-14", productCode: "5003186 / 1003012", market: "official current SKU", notes: "钌镀层 14K FLAF F 尖；初回特别包装或普通包装按库存区分。", sourceKey: official.key, variantKind: "nib" },
    { key: "phase296-travia-m", name: "Onyx Black FLAF M", releaseYear: "2026-03-14", productCode: "5003187 / 1003013", market: "official current SKU", notes: "钌镀层 14K FLAF M 尖；初回特别包装或普通包装按库存区分。", sourceKey: official.key, variantKind: "nib" },
    { key: "phase296-travia-first-batch", name: "首批 2,000 套特别包装", releaseYear: "2026-03-14", notes: "含修订版书册、Converter-700A、蓝黑墨囊和特制盒；是 edition，不拆成第二个 canonical。", sourceKey: press.key, variantKind: "edition_group" },
  ],
  spec: {
    brandEntityId: PHASE42_PLATINUM_BRAND_ID,
    values: {
      series_name: "Platinum #3776 CENTURY Travia",
      release_year: "2026-03-14",
      origin_country: "日本 Platinum #3776 Century 产品线；具体制造地不由本批资料外推",
      nib: "FLAF 钌镀 14K 金尖；当前 F/M，产品号 5003186/5003187（日本号 1003012/1003013）",
      fill_system: "Platinum 墨囊或 Converter-700A；Slip & Seal 气密旋帽",
      material: "Onyx Black 树脂笔杆与笔帽；黑镀金属握位、balancer、冠、尾塞、环、夹；钌镀 14K 尖",
      dimensions: "全长约 142 mm；最大直径约 15 mm",
      weight: "平均约 29.3 g",
      status: "2026 当前 Travia；初回 2,000 套特别包装售完后转普通包装，库存和价格随地区变化",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase296-travia-brand", official.key, "official Platinum identity"),
      specEvidence("series_name", "phase296-travia-series", official.key, "official product title"),
      specEvidence("release_year", "phase296-travia-release", press.key, "official 2026-03-14 release date"),
      specEvidence("origin_country", "phase296-travia-origin", press.key, "Platinum Japan product-line context; no factory inference"),
      specEvidence("nib", "phase296-travia-nib", official.key, "FLAF 14K ruthenium-plated F/M SKU fields"),
      specEvidence("fill_system", "phase296-travia-fill", manual.key, "official cartridge and Converter-700A guidance"),
      specEvidence("material", "phase296-travia-material", official.key, "official material table"),
      specEvidence("dimensions", "phase296-travia-dimensions", official.key, "official size field"),
      specEvidence("weight", "phase296-travia-weight", official.key, "official average weight field"),
      specEvidence("status", "phase296-travia-status", press.key, "first-batch and standard-edition boundary"),
    ],
  },
  media: [{ key: "phase296-travia-primary", title: "Platinum #3776 CENTURY Travia FLAF 结构事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片，不代表真实比例、颜色、光泽、Logo、刻字、尖幅或包装。", sourceUrl: svg.url, usageStatus: "primary" }],
  timeline: [{ key: "phase296-travia-release", title: "#3776 CENTURY Travia 发布", eventType: "model_released", startDate: "2026-03-14", circa: false, description: "Platinum 官方发布资料记录 Travia 于 2026 年 3 月 14 日发售，并以 FLAF 尖、长身平顶与金属配重形成独立型号边界。", sourceKey: press.key }],
};

export const phase296Platinum3776TraviaPacks: CuratedEntityPack[] = [structuredClone(brand), model];
