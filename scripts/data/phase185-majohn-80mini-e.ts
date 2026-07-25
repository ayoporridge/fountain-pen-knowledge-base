import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase23MajohnPacks } from "./phase23-majohn";

const RETRIEVED = "2026-07-25";
export const PHASE185_MAJOHN_BRAND_ID = "TfXerdAZ5iWg";
export const PHASE185_IDS = { e: "2wR-Ix08dC-F" } as const;

function live(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return {
    ...input,
    independenceGroup: input.registryKey,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase185",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase185",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创 factual SVG；示意图，非产品照片，不证明比例、颜色、重量或库存。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  retailer: live({
    key: "phase185-majohn-80mini-e-retailer",
    title: "Everything Calligraphy：Majohn 80 Mini -E Short (Moonman)",
    url: "https://www.everythingcalligraphy.com/products/moonman-80-mini-e-short-fountain-pen",
    registryKey: "everythingcalligraphy-majohn-80mini-e-phase185",
    registryName: "Everything Calligraphy",
    sourceType: "retailer",
    tier: "retailer",
    summary: "零售页确认 Majohn 80 Mini -E Short (Moonman) 的独立商品名称；库存状态只代表该渠道，不补写未列出的尖号和尺寸。",
    locator: "product title, Short suffix and channel stock state",
  }),
  family: live({
    key: "phase185-majohn-80mini-family-fpn",
    title: "Fountain Pen Network：Moonman 80 Mini",
    url: "https://www.fountainpennetwork.com/forum/topic/338618-moonman-80-mini/",
    registryKey: "fountain-pen-network-majohn-80mini-family-phase185",
    registryName: "Fountain Pen Network participants",
    sourceType: "forum",
    tier: "professional_secondary",
    summary: "主题讨论提供 80 Mini 家族的短尺寸、Parker 风格短墨囊/转换器和细线使用旁证，不代表每个 E 版本。",
    locator: "family length, Parker-style cartridge and converter, fine-line observations",
  }),
  review: live({
    key: "phase185-majohn-80mini-review-fpn",
    title: "Fountain Pen Network：Moonman 80 Mini mini review",
    url: "https://www.fountainpennetwork.com/forum/topic/339227-moonman-80-mini-mini-review/",
    registryKey: "fountain-pen-network-majohn-80mini-review-phase185",
    registryName: "Fountain Pen Network reviewer",
    sourceType: "forum",
    tier: "professional_secondary",
    summary: "单支评测记录原装 EF 偏干、握持、笔身和装配体验；只用于提醒差异和维护风险。",
    locator: "stock EF, dry-line, handling and construction observations",
  }),
  status: live({
    key: "phase185-majohn-80mini-e-reddit-status",
    title: "Reddit：80 mini-E 生产状态讨论",
    url: "https://www.reddit.com/r/fountainpens/comments/199pf1g/",
    registryKey: "reddit-majohn-80mini-e-status-phase185",
    registryName: "r/fountainpens participants",
    sourceType: "reddit",
    tier: "community",
    summary: "社区讨论提出 80 mini-E 可能停产的猜测；仅作状态不确定性线索，不替代品牌公告。",
    locator: "uncertain production-status discussion",
  }),
  official: live({
    key: "phase185-majohn-official",
    title: "Majohn 官方站：当代品牌导航",
    url: "https://www.majohnpen.com/",
    registryKey: "majohn-official-phase185",
    registryName: "Majohn",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "官方站用于确认 Majohn 的当代品牌语境；不从导航页臆造 80mini-E 的尺寸、尖号或上墨规格。",
    locator: "brand and contemporary model navigation",
  }),
  svg: diagram("phase185-majohn-80mini-e-svg", "Majohn 80mini-E 短杆比例本站原创示意", "/images/library/site-original/phase185/majohn/80mini-e.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.84, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "80mini-e-model";
const familyScope = `${scope}-family-sample`;
const brandPack = phase23MajohnPacks.find((pack) => pack.entityId === PHASE185_MAJOHN_BRAND_ID);
if (!brandPack) throw new Error("Majohn brand pack missing from phase23 data");

const ePack: CuratedEntityPack = {
  key: "phase185-majohn-80mini-e",
  entityId: PHASE185_IDS.e,
  expectedType: "pen",
  expectedSlug: "末匠-majohn-80mini-e",
  canonicalName: "末匠 Majohn 80mini-E",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/majohn-80mini-e-phase185.md",
  storyTitle: "末匠 Majohn 80mini-E：把短杆当作使用条件",
  primarySourceKey: S.retailer.key,
  depthTier: "A",
  aliases: [
    { alias: "Majohn 80mini-E", language: "en", sourceKey: S.retailer.key },
    { alias: "Moonman 80 Mini-E Short", language: "en", sourceKey: S.retailer.key },
    { alias: "末匠 80mini-E", language: "zh", sourceKey: S.retailer.key },
  ],
  sources: [S.retailer, S.family, S.review, S.status, S.official, S.svg],
  scopes: [
    { key: scope, scopeKey: "80mini-e-model-identity-and-buying-boundary", productionState: "unknown", editionScope: "retailer identity, use, maintenance and current availability boundary" },
    { key: familyScope, scopeKey: "80-mini-family-sample-only", productionState: "unknown", editionScope: "family-level length, filling and nib observations; not unified E specifications" },
  ],
  claims: [
    claim("80mini-e-identity", "model_identity", "零售页面使用 Majohn 80 Mini -E Short (Moonman) 这一独立标题；E、-E 和 Short 是购买时应核对的身份线索。", S.retailer.key, scope, "product title and Short suffix"),
    claim("80mini-e-family-boundary", "version_boundary", "约 100 mm 合盖、Parker 风格短墨囊/转换器和偏细偏干的原装尖来自 80 Mini 家族样本，不升级为所有 E 版本的统一规格。", S.family.key, familyScope, "family observations and explicit scope boundary"),
    claim("80mini-e-care", "maintenance_guidance", "短杆应先试插帽与不插帽握持，使用室温清水清洗，携带前检查帽盖密封；细尖和未知配件需要按单支验收。", S.review.key, scope, "handling, dry nib and maintenance implications"),
    claim("80mini-e-status", "availability_boundary", "零售页的售罄只代表该渠道；社区关于可能停产的说法是不确定线索，没有官方停产日期。", S.status.key, scope, "channel stock and uncertain community status"),
    claim("80mini-e-maker", "brand_context", "该型号归入 Majohn 当代品牌语境，Moonman 是旧资料和零售标题仍会出现的名称。", S.official.key, scope, "official brand navigation and naming context"),
  ],
  variants: [
    { key: "80mini-e-short", name: "80 Mini-E Short", notes: "零售标题中的 Short 后缀；用于核对短杆版本，不代表另一个品牌型号。", sourceKey: S.retailer.key, variantKind: "edition_group" },
    { key: "80mini-e-family-ef", name: "家族 EF/F 细尖样本", notes: "FPN 家族样本的细尖观察，不是 E 版本固定尖号；购买时按单支和卖家清单确认。", sourceKey: S.review.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE185_MAJOHN_BRAND_ID,
    values: {
      series_name: "80mini-E / 80 Mini-E Short",
      nib: "本型号没有可靠统一尖号表；80 Mini 家族样本常见 EF/F、细线或偏干观察，实际按单支验收",
      fill_system: "本型号零售页未列统一上墨规格；家族讨论出现 Parker 风格短墨囊/转换器路线，具体 E 配件按 SKU 核对",
      material: "公开资料未给出完整材料配方；实物与家族样本呈现树脂或塑料件配金属饰件的组合感",
      dimensions: "公开资料未固定 E 版本的合盖、开盖和插帽长度；家族样本有人约 100 mm 合盖，仅作体积旁证",
      weight: "没有可靠的 E 版本统一重量；不要用普通 80 Mini 或单支玩家测量替代",
      status: "零售渠道曾列该型号且当前页面可能售罄；没有可靠官方日期证明正式停产",
    },
    evidence: [
      ev("80mini-e", "brand_entity_id", S.official.key, scope, "Majohn brand navigation"),
      ev("80mini-e", "series_name", S.retailer.key, scope, "80 Mini -E Short product title"),
      ev("80mini-e", "nib", S.review.key, familyScope, "family stock EF and fine-line observation"),
      ev("80mini-e", "fill_system", S.family.key, familyScope, "Parker-style short cartridge/converter discussion"),
      ev("80mini-e", "material", S.retailer.key, scope, "product images and listing boundary; complete formula not published"),
      ev("80mini-e", "dimensions", S.family.key, familyScope, "approximately 100 mm capped family sample"),
      ev("80mini-e", "weight", S.review.key, familyScope, "no unified E weight; single-sample review boundary"),
      ev("80mini-e", "status", S.retailer.key, scope, "channel sold-out state"),
    ],
  },
  media: [{ key: "80mini-e-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例或生产批次。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

export const phase185MajohnPacks: CuratedEntityPack[] = [brandPack, ePack];
