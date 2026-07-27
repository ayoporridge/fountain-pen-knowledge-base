import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase23MajohnPacks } from "./phase23-majohn";

export const PHASE298_MAJOHN_BRAND_ID = "TfXerdAZ5iWg";
export const PHASE298_C1_ID = "phase298-majohn-c1";
export const PHASE298_C1_SLUG = "majohn-c1";
const RETRIEVED = "2026-07-28";
const MODEL_SCOPE = "phase298-majohn-c1-model";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase298/majohn/c1.svg";
  return {
    key: "phase298-majohn-c1-svg",
    registryKey: "fountain-pen-graph-editorial-phase298",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase298",
    title: "Majohn C1 透明直灌结构事实图",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意透明笔杆、O 形圈与直灌/converter 路径，非产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;not-to-scale=true;colour-proof=false`,
  };
}

const S = {
  brandSite: web({
    key: "phase298-majohn-c1-brand-site",
    title: "Moonman/Majohn C1 product page",
    url: "https://moonmanpen.com/products/mc1-02f-c1-fp",
    registryKey: "moonmanpen-c1-official-context-phase298",
    registryName: "Moonman/Majohn product site",
    summary: "品牌产品页确认 C1 名称、透明直灌路线、可用墨囊/converter、约 138 mm、14–15 mm、21 g 与附件语境。",
  }),
  makoba: web({
    key: "phase298-majohn-c1-makoba",
    title: "Makoba：Majohn C1 Transparent Fountain Pen",
    url: "https://makoba.com/products/majohn-moonman-c1-fountain-pen-transparent",
    registryKey: "makoba-majohn-c1-phase298",
    registryName: "Makoba",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "零售技术字段绑定透明 SKU，列出钢尖、EF/F、旋盖、树脂、14.7 mm、138 mm 与 21 g。",
  }),
  fpn: web({
    key: "phase298-majohn-c1-fpn",
    title: "Fountain Pen Network：Majohn/Moonman C1 review",
    url: "https://www.fountainpennetwork.com/forum/topic/371216-majohnmoonman-c1/",
    registryKey: "fpn-majohn-c1-phase298",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "professional_secondary",
    summary: "玩家评测记录旋盖圈数、旧新尖线宽和单支书写差异；只用于样本边界。",
  }),
  vancouver: web({
    key: "phase298-majohn-c1-vancouver",
    title: "Vancouver Pen Club：Moonman C1 market note",
    url: "https://www.vancouverpenclub.com/2022/01/",
    registryKey: "vancouver-pen-club-majohn-c1-phase298",
    registryName: "Vancouver Pen Club",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立资料交叉记录 C1 与 M2 的外形、命名和市场语境边界。",
  }),
  desk: web({
    key: "phase298-majohn-c1-desk",
    title: "The Well-Appointed Desk：Moonman fountain pen review",
    url: "https://www.wellappointeddesk.com/2020/03/pen-review-moonman-fountain-pens/",
    registryKey: "well-appointed-desk-moonman-phase298",
    registryName: "The Well-Appointed Desk",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "专业评测补充 Moonman/C1 Holiday 样本的直灌体验与配件语境，不外推为每批质量承诺。",
  }),
  svg: diagram(),
} satisfies Record<string, CuratedSource>;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, extra: string[] = []) {
  return {
    key,
    predicate,
    objectText,
    factClass: "core" as const,
    confidence: 0.94,
    sourceKey,
    locator,
    evidence: [sourceKey, ...extra].map((item, index) => ({ key: `${key}-evidence-${index + 1}`, sourceKey: item, scopeKey: MODEL_SCOPE, locator })),
  } satisfies CuratedEntityPack["claims"][number];
}

function ev(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const sourceBrand = phase23MajohnPacks.find((pack) => pack.entityId === PHASE298_MAJOHN_BRAND_ID && pack.expectedType === "brand");
if (!sourceBrand) throw new Error("Phase 298 requires the existing Majohn brand pack.");
const brand = structuredClone(sourceBrand);
brand.key = "phase298-majohn-brand-v1";

const model: CuratedEntityPack = {
  key: "phase298-majohn-c1-v1",
  entityId: PHASE298_C1_ID,
  expectedType: "pen",
  expectedSlug: PHASE298_C1_SLUG,
  canonicalName: "末匠 Majohn C1",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/majohn-c1-phase298.md",
  storyTitle: "末匠 Majohn C1：透明直灌笔的型号边界",
  primarySourceKey: S.brandSite.key,
  depthTier: "A",
  aliases: [
    { alias: "Majohn C1", language: "en", sourceKey: S.brandSite.key },
    { alias: "Moonman C1", language: "en", kind: "former_name", sourceKey: S.vancouver.key },
    { alias: "Moonman C1 Transparent", language: "en", kind: "former_name", sourceKey: S.makoba.key },
    { alias: "末匠 C1", language: "zh", sourceKey: S.brandSite.key },
  ],
  sources: [S.brandSite, S.makoba, S.fpn, S.vancouver, S.desk, S.svg],
  scopes: [
    { key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "current", materialScope: "透明树脂 C1；握位颜色、尖号、附件按 SKU 分开。", editionScope: "不覆盖 Q1、M2、P140、P141、Wancai 或其他 Majohn 示范笔。" },
    { key: `${MODEL_SCOPE}-sample`, scopeKey: `${MODEL_SCOPE}-retail-sample`, productionState: "unknown", editionScope: "Makoba 透明零售样本的 138 mm、14.7 mm、21 g 与 EF/F 字段。" },
  ],
  claims: [
    claim("c1-identity", "model_identity", "C1 是 Majohn（旧称 Moonman）独立的透明直灌型号；Moonman C1 与 Majohn C1 是名称沿革，不是两个品牌实体。", S.brandSite.key, "product title and model identity", [S.makoba.key, S.vancouver.key]),
    claim("c1-structure", "structure_boundary", "C1 采用透明示范笔身、旋盖和 O 形圈密封；它与 Q1 的短粗比例、M2 的长圆柱路线、P140/P141 的大型活塞路线分开。", S.brandSite.key, "transparent body and filling description", [S.vancouver.key]),
    claim("c1-fill", "filling_system", "公开商品资料列出 eyedropper 直灌，并在部分套装中提供墨囊或 converter；附件与可用模式必须按具体 SKU 核对。", S.makoba.key, "filling mechanism and package fields", [S.brandSite.key]),
    claim("c1-spec-boundary", "sample_spec_boundary", "Makoba 透明 SKU 的公开字段约为合盖 138 mm、直径 14.7 mm、总重 21 g；它们是零售样本测量锚点，不是每个批次的公差保证。", S.makoba.key, "technical specification table", [S.brandSite.key]),
    claim("c1-nib", "nib_boundary", "零售样本提供钢尖 EF/F 选项；玩家资料显示旧新尖存在单支线宽差异，不能把 0.7 mm 或某支实测线宽写成固定规格。", S.makoba.key, "nib options", [S.fpn.key]),
    claim("c1-care", "maintenance_guidance", "直灌前后应检查 O 形圈、螺纹和笔杆裂纹，换色时清洗笔尖、进墨通道与密封槽；不建议热水、酒精或强清洁剂。", S.brandSite.key, "filling and seal care boundary", [S.desk.key]),
    claim("c1-selection", "selection_guidance", "购买时核对 C1 刻字、透明 SKU、尖号、是否附滴管/converter 与退换条件；Moonman 旧标是 alias，不应另建实体。", S.makoba.key, "product title and package fields", [S.vancouver.key]),
    claim("c1-review-boundary", "professional_sample_boundary", "独立评测对旋盖圈数、透明度和书写感受属于具体样本体验，只用于解释使用方向，不构成每支 C1 的质量承诺。", S.fpn.key, "review sample notes", [S.desk.key]),
  ],
  variants: [
    { key: "c1-transparent", name: "C1 Transparent", notes: "品牌与 Makoba 均列透明树脂路线；握位颜色和批次按实物核对。", sourceKey: S.makoba.key, variantKind: "market_sku" },
    { key: "c1-ef-f", name: "EF / F steel nib options", notes: "尖号是 SKU 选项，不承诺统一线宽。", sourceKey: S.makoba.key, variantKind: "nib" },
    { key: "c1-eyedropper-converter", name: "Eyedropper with cartridge/converter accessory", notes: "品牌页列出多种上墨路径，具体套装附件按地区和年份核对。", sourceKey: S.brandSite.key, variantKind: "edition_group" },
  ],
  spec: {
    brandEntityId: PHASE298_MAJOHN_BRAND_ID,
    values: {
      series_name: "C1",
      release_year: "当代市场可见；本包不推断首发年份",
      origin_country: "中国品牌产品线语境；本包不把零售页当作工厂地址证明",
      nib: "钢尖；EF/F 等选项按具体 SKU",
      fill_system: "eyedropper 直灌；部分套装支持墨囊或 converter",
      material: "透明树脂/示范笔身；握位颜色按批次",
      dimensions: "零售透明样本约 138 mm 合盖、直径 14.7 mm（品牌页约 14–15 mm）",
      weight: "零售透明样本约 21 g",
      status: "当代市场可见；库存与套装随地区变化",
    },
    evidence: [
      ev("c1-brand", "brand_entity_id", S.brandSite.key, "Majohn/Moonman product identity"),
      ev("c1-series", "series_name", S.brandSite.key, "C1 product title"),
      ev("c1-release", "release_year", S.brandSite.key, "current product visibility; no launch year asserted"),
      ev("c1-origin", "origin_country", S.brandSite.key, "brand context only; no factory inference"),
      ev("c1-nib", "nib", S.makoba.key, "steel EF/F options"),
      ev("c1-fill", "fill_system", S.brandSite.key, "eyedropper, cartridge and converter paths"),
      ev("c1-material", "material", S.makoba.key, "transparent resin body"),
      ev("c1-dimensions", "dimensions", S.makoba.key, "138 mm and 14.7 mm sample fields"),
      ev("c1-weight", "weight", S.makoba.key, "21 g sample field"),
      ev("c1-status", "status", S.brandSite.key, "current product visibility"),
    ],
  },
  media: [{ key: "c1-primary-media", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存或具体笔尖。", sourceUrl: S.svg.url, usageStatus: "primary" }],
  timeline: [{ key: "c1-current-market", title: "C1 作为 Moonman/Majohn 独立透明直灌型号持续可见", eventType: "design_milestone", startDate: "2026", circa: true, description: "品牌页与零售/专业资料在当前检索日仍将 C1 作为独立型号；页面可见不等同每个地区均有库存。", sourceKey: S.brandSite.key }],
};

export const phase298MajohnC1Packs: CuratedEntityPack[] = [brand, model];
