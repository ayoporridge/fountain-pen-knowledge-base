import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase186WingsungPacks } from "./phase186-wingsung-601";

const RETRIEVED = "2026-07-26";
export const PHASE265_WINGSUNG_BRAND_ID = "5WJw8padPmKF";
export const PHASE265_630_ID = "phase265-wingsung-630";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; group: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: `${input.key}-registry`, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.group, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase265", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase265", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.95 : 0.9, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const scope = "phase265-wingsung-630-model";
const fpc = live({ key: "phase265-wingsung-630-fpc", title: "Fountain Pen Companion：Wing Sung 630", url: "https://www.fountainpencompanion.com/pen_brands/241-wing-sung/pen_models/253-630", registryName: "Fountain Pen Companion", sourceType: "blog", tier: "professional_secondary", group: "fountain-pen-companion-phase265", summary: "型号页把 630 放在 Wing Sung 品牌下，列出 Jun Lai、Wing Sung、Wingsung / Yongsheng 标记及多种颜色、材料和 piston filler variant。", locator: "model details and variant table" });
const fpn = live({ key: "phase265-wingsung-630-fpn", title: "Fountain Pen Network：WS630 a MB149 size piston filler", url: "https://www.fountainpennetwork.com/forum/topic/372338-ws630-a-mb149-size-piston-filler/", registryName: "Fountain Pen Network reviewers", sourceType: "forum", tier: "professional_secondary", group: "fountain-pen-network-phase265", summary: "讨论 630 的大型活塞结构、14K #8 尖、JUNL 刻字与 Junlai／Wing Sung 身份关系；以使用者记录为准，不扩写为官方目录。", locator: "model identity, nib and brand discussion" });
const retailer = live({ key: "phase265-wingsung-630-retailer", title: "Moonman Pen：Wing Sung JunLai 630 14K Gold", url: "https://moonmanpen.com/products/wing-sung-630-14k-gold-nib-resin-fountain-pen-size-8-nib-1-0mm-with-piston-filling-system-piano-black-with-transparent-band-design", registryName: "Moonman Pen", sourceType: "retailer", tier: "retailer", group: "moonman-retailer-phase265", summary: "零售页标题、品牌／型号和规格列 14K Gold、#8 Fine、piston filler、resin、screw cap 与 ink window。", locator: "title, description and specifications" });
const reddit = live({ key: "phase265-wingsung-630-reddit", title: "Reddit：Wingsung 630 with #8 14k gold Heartbeat nib", url: "https://www.reddit.com/r/fountainpens/comments/144py0s", registryName: "r/fountainpens", sourceType: "reddit", tier: "community", group: "reddit-wingsung-630-phase265", summary: "用户讨论 14K #8 Heartbeat 尖和 630 的大型笔身；只作为使用样本和 variant 旁证。", locator: "user discussion and nib description" });
const svg = diagram("phase265-wingsung-630-svg", "永生 WingSung 630 活塞与笔尖事实图", "/images/library/site-original/phase265/wingsung/630.svg");

const pen: CuratedEntityPack = {
  key: "phase265-wingsung-630-v1",
  entityId: PHASE265_630_ID,
  expectedType: "pen",
  expectedSlug: "永生-wingsung-630",
  canonicalName: "永生 WingSung 630",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-630-phase265.md",
  storyTitle: "永生 WingSung 630：WingSung 与 JunLai 标记交替的大型活塞笔",
  primarySourceKey: fpc.key,
  depthTier: "A",
  aliases: [
    { alias: "Wing Sung 630", language: "en", sourceKey: fpc.key },
    { alias: "WingSung 630", language: "en", sourceKey: fpc.key },
    { alias: "Jun Lai 630", language: "en", sourceKey: fpc.key },
    { alias: "JunLai 630", language: "en", sourceKey: fpn.key },
    { alias: "Yongsheng 630", language: "en", sourceKey: fpc.key },
    { alias: "永生 630", language: "zh", sourceKey: fpc.key },
  ],
  sources: [fpc, fpn, retailer, reddit, svg],
  scopes: [{ key: scope, scopeKey: scope, productionState: "current", editionScope: "WingSung／JunLai 630；钢尖、14K #8、颜色、材料与品牌标记按公开 variant 和单支实物核对" }],
  claims: [
    claim("wingsung-630-identity", "model_identity", "WingSung 630 是一个独立型号；Wing Sung、JunLai、Yongsheng 是公开资料中交替出现的品牌标记或别名，不在当前证据下拆成平行品牌节点。", fpc.key, scope, "brand, model and variant table"),
    claim("wingsung-630-brand-context", "brand_context", "Hero 官方历史页只提供中国钢笔品牌与制造语境；它不被用来推断 630 的具体工厂、年份或授权关系。", "phase186-hero-official-story", scope, "official brand history; no model-specific extrapolation", "editorial"),
    claim("wingsung-630-fill", "filling_system", "630 的公开共性是大型 piston filler；具体密封、容量和零件状态按单支检查，不能把其它 6xx 型号的机构套用过来。", fpc.key, scope, "filling system variants"),
    claim("wingsung-630-material", "material_finish", "公开 variant 出现 resin、plastic 和 transparent acrylic；黑、蓝、酒红、透明红、透明蓝等颜色属于 variant 记录，不是全型号统一材质。", fpc.key, scope, "material and color variants"),
    claim("wingsung-630-nib", "nib", "630 可见普通钢尖和 14K gold #8 配置；Heartbeat、长刀和线宽属于尖面或批次 variant，14K 不应默认为每支标配。", retailer.key, scope, "14K #8 fine specification", "core"),
    claim("wingsung-630-marking", "brand_marking", "FPN 使用者记录钢尖、金尖和不同批次可能出现 Wing Sung、JunLai 或 JUNL 刻字；刻字是识别线索，不单独证明金含量或生产主体。", fpn.key, scope, "nib and cap-band marking discussion"),
    claim("wingsung-630-care", "maintenance_guidance", "活塞清洗应以室温清水缓慢往返，保持透明杆身和螺纹无砂粒；活塞卡滞、漏水或握位渗墨时停止加力并送修。", fpn.key, scope, "piston filler user maintenance boundary", "editorial"),
    claim("wingsung-630-selection", "selection_guidance", "选购时应同时核对笔身刻字、笔尖正面、14K 标记、活塞试漏和颜色／材料 variant；价格和 Logo 不能单独证明版本。", retailer.key, scope, "product identity and conservative selection", "editorial"),
    claim("wingsung-630-size", "size_boundary", "630 属大型笔体，帽盖和金属件会改变重心；公开页面没有形成统一厂规尺寸，应按插帽与不插帽实物测量。", fpn.key, scope, "large piston filler discussion", "editorial"),
  ],
  variants: [
    { key: "wingsung-630-steel", name: "普通钢尖版", notes: "市场常见配置；具体尖号、线宽和刻字按单支核对。", sourceKey: fpc.key, variantKind: "nib", market: "global" },
    { key: "wingsung-630-14k", name: "14K #8 金尖版", notes: "零售页明确列 14K gold #8 Fine；不代表所有 630。", sourceKey: retailer.key, variantKind: "nib", market: "global" },
    { key: "wingsung-630-heartbeat", name: "Heartbeat／长刀等特殊尖面", notes: "使用者记录的尖面 variant，写感和批次按实物确认。", sourceKey: reddit.key, variantKind: "nib", market: "global" },
    { key: "wingsung-630-markings", name: "Wing Sung／JunLai／Yongsheng 标记", notes: "品牌标记和批次差异；当前不拆为独立品牌实体。", sourceKey: fpc.key, variantKind: "market_sku", market: "global" },
    { key: "wingsung-630-colors", name: "黑、蓝、酒红、透明红、透明蓝与透明亚克力", notes: "公开型号页的颜色／材料样本，不代表完整色表。", sourceKey: fpc.key, variantKind: "color", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE265_WINGSUNG_BRAND_ID,
    values: {
      series_name: "WingSung 630 / JunLai 630",
      origin_country: "中国；永生／WingSung 与 JunLai 标记语境可核实，具体生产主体和批次按实物核对",
      nib: "钢尖 variant；另有 14K gold #8、Heartbeat、长刀及不同线宽配置，按单支核验",
      fill_system: "大型 piston filler；具体容量、密封和零件状态按单支检查",
      material: "树脂、塑料或透明／半透明亚克力样本；颜色和材料随 variant 核验",
      dimensions: "大型笔体；公开资料未形成统一厂规尺寸，插帽与不插帽按实物测量",
      weight: "未找到可靠统一公开重量；帽盖、金属件、尖材和装墨状态会改变单支测量",
    },
    evidence: [
      ev("wingsung-630", "brand_entity_id", fpc.key, scope, "Wing Sung brand page"),
      ev("wingsung-630", "series_name", fpc.key, scope, "model title and variant table"),
      ev("wingsung-630", "origin_country", "phase186-hero-official-story", scope, "official brand history; model production left unresolved"),
      ev("wingsung-630", "nib", retailer.key, scope, "14K #8 Fine specification"),
      ev("wingsung-630", "fill_system", fpc.key, scope, "piston filler variants"),
      ev("wingsung-630", "material", fpc.key, scope, "resin, plastic and acrylic variants"),
      ev("wingsung-630", "dimensions", fpn.key, scope, "large pen boundary; no unified factory dimensions"),
      ev("wingsung-630", "weight", fpn.key, scope, "no reliable unified public weight"),
    ],
  },
  timeline: [{ key: "wingsung-630-current-market", title: "WingSung／JunLai 630 的多标记市场形态", eventType: "model_released", startDate: RETRIEVED, circa: false, description: "型号页、论坛和零售页共同核实 630 的活塞结构、尖材 variant 与多种品牌标记；不推断首发年份。", sourceKey: fpc.key }],
  media: [{ key: "wingsung-630-primary", title: svg.title, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表真实颜色、比例、Logo、尖材、库存或生产批次。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const existingBrand = phase186WingsungPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE265_WINGSUNG_BRAND_ID);
if (!existingBrand) throw new Error("Phase 265 requires the existing curated WingSung brand pack.");
const brandOfficialSource = existingBrand.sources.find((source) => source.sourceType === "official");
if (!brandOfficialSource) throw new Error("Phase 265 requires the existing WingSung official history source.");
pen.sources = [...pen.sources, brandOfficialSource];

export const phase265Wingsung630Packs: CuratedEntityPack[] = [existingBrand, pen];
