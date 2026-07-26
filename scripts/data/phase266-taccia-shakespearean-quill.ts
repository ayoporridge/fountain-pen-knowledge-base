import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase262TacciaPacks } from "./phase262-taccia";

const RETRIEVED = "2026-07-26";
export const PHASE266_TACCIA_BRAND_ID = "phase262-brand-taccia";
export const PHASE266_QUILL_ID = "phase266-taccia-shakespearean-quill";
const SCOPE = "phase266-taccia-shakespearean-quill";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; group: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.group, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase266", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase266", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, locator, scopeKey: SCOPE }] };
}
function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const official = web({ key: "phase266-taccia-quill-official", title: "TACCIA USA Shakespearean Quill", url: "https://taccia.com/products/shakesperearn-quill", registryKey: "taccia-us-quill-phase266", registryName: "Taccia USA", sourceType: "official", tier: "primary", group: "taccia-quill-official-phase266", summary: "官方页列金／Pewter 底座、鸵鸟／孔雀羽毛、密封不锈钢尖和黑墨 reservoir/cartridge/nib 一体替换。", locator: "product description and variant list" });
const penPlace = web({ key: "phase266-taccia-quill-penplace", title: "Pen Place Taccia Shakespearean White Gold Quill Pen", url: "https://www.penplace.com/products/taccia-shakespearean-white-gold-quill-pen", registryKey: "penplace-taccia-quill-phase266", registryName: "Pen Place", sourceType: "retailer", tier: "professional_secondary", group: "penplace-quill-phase266", summary: "零售页给出 TSH-65QP-FW/GD SKU、Frost White/Gold 样本、260 g 商品重量和一条买家评价。", locator: "SKU, product metadata, weight and customer review" });
const squid = web({ key: "phase266-taccia-quill-squid", title: "Squid's Choice TACCIA Shakespearean Quill", url: "https://squidschoice.com/products/taccia-shakespeare-quill", registryKey: "squids-choice-taccia-quill-phase266", registryName: "Squid's Choice", sourceType: "retailer", tier: "retailer", group: "squids-choice-quill-phase266", summary: "零售页交叉列 Gold/Silver、Onyx Black、Caribbean Blue、Merlot Red、Frost White、Peacock 选项和 out-of-stock 状态。", locator: "style/color selectors and product description" });
const svg = diagram("phase266-taccia-quill-svg", "TACCIA Shakespearean Quill factual diagram", "/images/library/site-original/phase266/taccia/shakespearean-quill.svg");

const model: CuratedEntityPack = {
  key: "phase266-taccia-shakespearean-quill-v1",
  entityId: PHASE266_QUILL_ID,
  expectedType: "pen",
  expectedSlug: "taccia-shakespearean-quill",
  canonicalName: "TACCIA Shakespearean Quill",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/taccia-shakespearean-quill-phase266.md",
  storyTitle: "TACCIA Shakespearean Quill：羽毛外形与一次性墨水组件",
  primarySourceKey: official.key,
  depthTier: "A",
  aliases: [
    { alias: "Taccia Shakespearean Quill", language: "en", sourceKey: official.key },
    { alias: "TACCIA Shakespeare Quill", language: "en", sourceKey: squid.key },
    { alias: "TSH-65QP-FW/GD", language: "en", sourceKey: penPlace.key },
    { alias: "TACCIA 莎士比亚羽毛笔", language: "zh", sourceKey: official.key },
  ],
  sources: [official, penPlace, squid, svg],
  scopes: [{ key: SCOPE, scopeKey: SCOPE, productionState: "current", editionScope: "Shakespearean Quill；金／Pewter 底座、鸵鸟／孔雀羽毛、黑墨密封 reservoir 与替换式 cartridge/nib 组件" }],
  claims: [
    claim("quill-identity", "model_identity", "TACCIA Shakespearean Quill 是桌面式羽毛 fountain pen 产品，不与 Spotlight、Spectrum、Pinnacle 或 Covenant SE 合并。", official.key, "product identity and separate listing"),
    claim("quill-base", "structure", "官方描述 weighted metal base 与 pen barrel，外部装饰 genuine ostrich 或 peacock feathers；金色与 Pewter 是外观路线，不证明贵金属纯度。", official.key, "base, barrel and feather description"),
    claim("quill-nib", "nib", "内部是 sealed precision-made stainless steel nib；官方没有公开普通 TACCIA 尖宽表，不能回填 Sailor 尖型号。", official.key, "sealed stainless steel nib"),
    claim("quill-fill", "filling_system", "大型 sealed internal reservoir 带黑墨；耗尽后插入新的 reservoir、cartridge 和 nib 一体组件，而不是自行灌墨。", official.key, "replaceable reservoir, cartridge and nib"),
    claim("quill-colors", "color_variants", "官方列 Gold/Pewter 与 Peacock、Merlot Red、Caribbean Blue、Onyx Black、Frost White 羽毛／颜色组合；SKU 按零售页面核对。", official.key, "product variants and feather colors"),
    claim("quill-sku", "market_sku", "Pen Place 的 TSH-65QP-FW/GD 对应 Frost White/Gold 零售样本，并列约 260 g 商品重量；不能外推所有组合。", penPlace.key, "SKU and listed weight"),
    claim("quill-secondary", "professional_secondary_boundary", "Pen Place 的产品记录与一条买家评价可作为型号和 SKU 的独立旁证，但不升级为所有批次的书写或耐久保证。", penPlace.key, "product record and customer review"),
    claim("quill-care", "maintenance_guidance", "羽毛保持干燥，金属底座用软布擦拭；密封组件不自行冲洗或拆解，异常时按一体替换逻辑联系卖家。", official.key, "conservative maintenance guidance", "editorial"),
    claim("quill-selection", "selection_guidance", "购买前核对底座、羽毛、颜色、替换 reservoir/nib 供应和退换条件；若需要可灌墨或选线宽，应选择其它 TACCIA 型号。", squid.key, "style/color selection and stock boundary", "editorial"),
  ],
  variants: [
    { key: "quill-base", name: "Gold / Silver or Pewter", notes: "金属外观与底座 variant；官方未声明纯度。", sourceKey: official.key, variantKind: "material", market: "global" },
    { key: "quill-feather", name: "Peacock / Merlot Red / Caribbean Blue / Onyx Black / Frost White", notes: "真实羽毛和颜色组合；天然材料存在单支差异。", sourceKey: official.key, variantKind: "color", market: "global" },
    { key: "quill-replacement", name: "Black reservoir + cartridge + nib replacement set", notes: "供墨与尖一体替换件；不等同于普通 cartridge/converter。", sourceKey: official.key, variantKind: "market_sku", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE266_TACCIA_BRAND_ID,
    values: {
      series_name: "Shakespearean Quill",
      origin_country: "TACCIA 官方产品；该页未公布具体生产国，按品牌与 SKU 资料核对",
      nib: "密封 precision stainless steel nib；与 reservoir/cartridge 一体替换，未公布普通 TACCIA 尖宽表",
      fill_system: "large sealed black-ink reservoir；耗尽后整套替换 reservoir、cartridge 和 nib",
      material: "加重金属底座与笔杆，真实鸵鸟或孔雀羽毛；金色／Pewter 为外观路线，纯度未声明",
      dimensions: "桌面式长柄羽毛结构；官方未公布统一长度、直径或笔尖尺寸",
      weight: "加重底座；Pen Place 单个 Frost White/Gold 零售样本列 260 g，不能外推所有组合",
    },
    evidence: [
      ev("quill", "brand_entity_id", official.key, "official TACCIA product"),
      ev("quill", "series_name", official.key, "product title"),
      ev("quill", "origin_country", official.key, "no specific origin stated"),
      ev("quill", "nib", official.key, "sealed stainless steel nib"),
      ev("quill", "fill_system", official.key, "sealed reservoir and replacement set"),
      ev("quill", "material", official.key, "weighted base, barrel and genuine feathers"),
      ev("quill", "dimensions", penPlace.key, "no unified dimensions; desktop form boundary"),
      ev("quill", "weight", penPlace.key, "TSH-65QP-FW/GD listed 260 g sample"),
    ],
  },
  timeline: [{ key: "quill-current", title: "Shakespearean Quill 当前产品结构核实", eventType: "model_released", startDate: RETRIEVED, circa: false, description: "官方产品页和零售页核实羽毛、底座、密封 reservoir 与替换式尖组件；不推断首发年份。", sourceKey: official.key }],
  media: [{ key: "quill-svg", title: svg.title, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表真实羽毛颜色、尺寸、纯度、Logo、库存或 SKU。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const existingBrand = phase262TacciaPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE266_TACCIA_BRAND_ID);
if (!existingBrand) throw new Error("Phase 266 requires the existing curated TACCIA brand pack.");
export const phase266TacciaShakespeareanQuillPacks: CuratedEntityPack[] = [existingBrand, model];
