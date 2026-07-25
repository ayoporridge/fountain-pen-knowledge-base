import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase23MajohnPacks } from "./phase23-majohn";

const RETRIEVED = "2026-07-25";
export const PHASE183_MAJOHN_BRAND_ID = "TfXerdAZ5iWg";
export const PHASE183_IDS = { f9: "jzMyPAQvAzeF" } as const;

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
    registryKey: "fountain-pen-graph-editorial-phase183",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase183",
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
  official: live({ key: "phase183-majohn-official", title: "Majohn 官方站：当代型号导航", url: "https://www.majohnpen.com/", registryKey: "majohn-official-phase183", registryName: "Majohn", sourceType: "official", tier: "contemporary_archive", summary: "官方站用于确认 Majohn 当代品牌和型号导航语境；不从导航页臆造 F9 的尺寸或上墨规格。", locator: "brand and contemporary model navigation" }),
  retailer: live({ key: "phase183-majohn-f9-retailer", title: "Everything Calligraphy：Majohn F9 (Moonman) Fountain Pen", url: "https://www.everythingcalligraphy.com/products/moonman-majohn-f9-fountain-pen", registryKey: "everythingcalligraphy-majohn-f9-phase183", registryName: "Everything Calligraphy", sourceType: "retailer", tier: "retailer", summary: "零售页确认 Majohn F9、Moonman 旧名、Iridium 0.05 mm Fine、Spider/Snake 颜色和 M 编码；库存状态只代表该渠道。", locator: "product title, model, nib, colors, variant codes and stock state" }),
  comparison: live({ key: "phase183-majohn-f9-comparison", title: "Reddit：Majohn F9 与 Rouge et Noir 的单支比较", url: "https://www.reddit.com/r/fountainpens/comments/1atq1gm/", registryKey: "reddit-majohn-f9-comparison-phase183", registryName: "r/fountainpens participants", sourceType: "reddit", tier: "professional_secondary", summary: "社区单支比较记录 F9 与 Rouge et Noir 的比例、约 30 g 装墨重量、蛇形夹、钢尖与帽盖表现；只作样本旁证。", locator: "F9 versus Rouge et Noir length, weight, clip, nib and cap-seal observations" }),
  seal: live({ key: "phase183-majohn-f9-seal", title: "Reddit：Majohn F9S 主题笔使用讨论", url: "https://www.reddit.com/r/fountainpens/comments/p6bucu", registryKey: "reddit-majohn-f9-seal-phase183", registryName: "r/fountainpens participants", sourceType: "reddit", tier: "community", summary: "玩家讨论 F9S 的 Spider 外观、活塞路线、帽盖密封和放置后的起笔；用于维护边界而非统一规格。", locator: "F9S filling, drying and cap-seal discussion" }),
  zhihu: live({ key: "phase183-majohn-f9-zhihu", title: "知乎：末匠 F9 法师钢笔讨论", url: "https://www.zhihu.com/tardis/bd/ans/1387797400", registryKey: "zhihu-majohn-f9-phase183", registryName: "知乎答主与评论者", sourceType: "blog", tier: "professional_secondary", summary: "中文讨论提供“法师”称呼、钢尖和做工观察；页面受登录限制，正文只采用可与产品页互相印证的身份语境。", locator: "F9 法师 naming and steel-pen observation" }),
  svg: diagram("phase183-majohn-f9-svg", "Majohn F9 蛇纹与蜘蛛纹样本站原创示意", "/images/library/site-original/phase183/majohn/f9.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.86, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "f9-model";
const brandPack = phase23MajohnPacks.find((pack) => pack.entityId === PHASE183_MAJOHN_BRAND_ID);
if (!brandPack) throw new Error("Majohn brand pack missing from phase23 data");

const f9Pack: CuratedEntityPack = {
  key: "phase183-majohn-f9",
  entityId: PHASE183_IDS.f9,
  expectedType: "pen",
  expectedSlug: "末匠-majohn-f9法师",
  canonicalName: "末匠 Majohn F9 法师",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/majohn-f9-phase183.md",
  storyTitle: "末匠 Majohn F9 法师：蛇纹与蜘蛛纹样的主题钢笔",
  primarySourceKey: S.retailer.key,
  depthTier: "A",
  aliases: [
    { alias: "Majohn F9", language: "en", sourceKey: S.retailer.key },
    { alias: "Moonman F9", language: "en", kind: "former_name", sourceKey: S.retailer.key },
    { alias: "末匠 F9 法师", language: "zh", sourceKey: S.zhihu.key },
  ],
  sources: [S.retailer, S.comparison, S.seal, S.zhihu, S.official, S.svg],
  scopes: [
    { key: scope, scopeKey: "f9-model-history", productionState: "current", editionScope: "model identity and current market samples" },
    { key: `${scope}-variant`, scopeKey: "f9-color-and-code-variants", productionState: "unknown", editionScope: "Spider/Snake colors and retailer variant codes" },
  ],
  claims: [
    claim("f9-identity", "model_identity", "F9 是 Majohn 的主题外观钢笔，零售页同时保留 Moonman 旧名；中文资料常称“法师”。", S.retailer.key, scope, "product title and Chinese model naming"),
    claim("f9-boundary", "version_boundary", "Spider/Snake 图案、颜色和 M2089 等编码是 F9 内的销售变体；它们不应拆成多个型号，也不证明与 Montblanc Rouge et Noir 同一或兼容。", S.comparison.key, `${scope}-variant`, "single-sample visual comparison and retailer variant names"),
    claim("f9-care", "maintenance_guidance", "主题涂层、帽盖密封和钢尖状态需要按单支维护；用室温水清洗，避免摩擦、溶剂和强行调尖，异常时按卖家售后处理。", S.seal.key, scope, "cap-seal, filling and care observations"),
    claim("f9-maker", "brand_context", "该型号归入 Majohn 当代品牌目录语境；官方导航只用于品牌边界，不承担 F9 规格。", S.official.key, scope, "official brand navigation"),
  ],
  variants: [
    { key: "f9-black-snake", name: "Black Snake（M2089）", notes: "零售页列出的蛇纹颜色和变体编码；库存随渠道变化。", sourceKey: S.retailer.key, variantKind: "color", productCode: "M2089" },
    { key: "f9-black-spider", name: "Black Spider（M2090）", notes: "零售页列出的蜘蛛纹颜色和变体编码；库存随渠道变化。", sourceKey: S.retailer.key, variantKind: "color", productCode: "M2090" },
    { key: "f9-red-spider", name: "Red Spider（M2091）", notes: "零售页列出的蜘蛛纹颜色和变体编码；库存随渠道变化。", sourceKey: S.retailer.key, variantKind: "color", productCode: "M2091" },
    { key: "f9-red-snake", name: "Red Snake（M2092）", notes: "零售页列出的蛇纹颜色和变体编码；库存随渠道变化。", sourceKey: S.retailer.key, variantKind: "color", productCode: "M2092" },
    { key: "f9-brown-snake", name: "Brown Snake（M2094）", notes: "零售页列出的蛇纹颜色和变体编码；库存随渠道变化。", sourceKey: S.retailer.key, variantKind: "color", productCode: "M2094" },
    { key: "f9-fine", name: "Iridium Fine 尖", notes: "零售页标注 0.05 mm Fine；实际线宽和调校按单支确认。", sourceKey: S.retailer.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE183_MAJOHN_BRAND_ID,
    values: {
      series_name: "F9",
      nib: "Iridium 钢尖；零售页标注 0.05 mm Fine，实际线宽按单支确认",
      fill_system: "公开零售页未列统一上墨规格；社区样本出现活塞路线，具体附件与结构按 SKU 核对",
      material: "树脂笔身与笔帽、图案涂层及金属饰件；完整材料配方未公开",
      dimensions: "公开资料未固定统一总长；社区只说明单支比例接近 Rouge et Noir",
      weight: "社区单支装墨样本约 30 g；不是所有颜色和批次的统一重量",
      status: "公开零售页曾列售但部分变体显示售罄；当前库存按渠道和变体核对",
    },
    evidence: [
      ev("f9", "brand_entity_id", S.retailer.key, scope, "Majohn brand and product title"),
      ev("f9", "series_name", S.retailer.key, scope, "F9 model field"),
      ev("f9", "nib", S.retailer.key, scope, "Iridium Nib and 0.05 mm Fine listing"),
      ev("f9", "fill_system", S.seal.key, scope, "community filling discussion and explicit uncertainty"),
      ev("f9", "material", S.retailer.key, `${scope}-variant`, "product images, color and coating descriptions"),
      ev("f9", "dimensions", S.comparison.key, scope, "single-sample proportion comparison"),
      ev("f9", "weight", S.comparison.key, scope, "single-sample inked weight observation"),
      ev("f9", "status", S.retailer.key, `${scope}-variant`, "channel stock state and variant listing"),
    ],
  },
  media: [{ key: "f9-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例或生产批次。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

export const phase183MajohnPacks: CuratedEntityPack[] = [brandPack, f9Pack];
