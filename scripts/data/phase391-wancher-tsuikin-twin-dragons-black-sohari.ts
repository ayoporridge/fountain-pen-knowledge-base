import type { CuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE389_WANCHER_BRAND_ID,
  phase389WancherTwinDragonsBlackPacks,
} from "./phase389-wancher-tsuikin-twin-dragons-black-urushi";

export const PHASE391_WANCHER_BRAND_ID = PHASE389_WANCHER_BRAND_ID;
export const PHASE391_TWIN_DRAGONS_SOHARI_ID =
  "phase391-pen-wancher-tsuikin-twin-dragons-black-sohari";
export const PHASE391_TWIN_DRAGONS_SOHARI_SLUG =
  "wancher-tsuikin-twin-dragons-black-sohari";
export const PHASE391_TWIN_DRAGONS_SOHARI_NAME =
  "Wancher Dream Pen Ryukyu Tsuikin – Twin Dragons Black Sohari";

function rewrite(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replaceAll("phase389", "phase391")
      .replaceAll("black-urushi", "black-sohari")
      .replaceAll("twin-dragons-black-", "twin-dragons-sohari-")
      .replaceAll("twin-dragons-sohari-sohari", "twin-dragons-black-sohari")
      .replaceAll("Black Urushi", "Black Sohari")
      .replaceAll("$1,000", "$1,600")
      .replaceAll("Ebonite、Urushi、Tsuikin Urushi", "Ebonite、Tsuikin Urushi")
      .replaceAll("、Type A/B 未解释下拉", "");
  }
  if (Array.isArray(value)) return value.map((item) => rewrite(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewrite(item)]),
    );
  }
  return value;
}

const [brand, templateModel] = rewrite(
  phase389WancherTwinDragonsBlackPacks,
) as CuratedEntityPack[];
const model = templateModel;

model.entityId = PHASE391_TWIN_DRAGONS_SOHARI_ID;
model.expectedSlug = PHASE391_TWIN_DRAGONS_SOHARI_SLUG;
model.canonicalName = PHASE391_TWIN_DRAGONS_SOHARI_NAME;
model.key = `${PHASE391_TWIN_DRAGONS_SOHARI_ID}-v1`;
model.variants = model.variants?.filter(
  (variant) => variant.variantKind !== "market_sku",
);
model.claims = model.claims?.filter(
  (claim) => !claim.key.endsWith("-type-boundary"),
);
const materialClaim = model.claims?.find((claim) => claim.key.endsWith("-material"));
if (materialClaim) {
  materialClaim.objectText =
    "Black Sohari 具体规格为 Ebonite、Tsuikin Urushi；官方集合/商品语境将其基底写为 Nashiji Tsuikin-mochi。双龙堆锦含真铂粉与金粉的说法只描述图案材料，不等于整支笔由贵金属制成。";
}
model.spec = model.spec
  ? {
      ...model.spec,
      brandEntityId: PHASE391_WANCHER_BRAND_ID,
      values: {
        ...model.spec.values,
        material: "Ebonite、Tsuikin Urushi；Black Sohari 基底为 Nashiji Tsuikin-mochi",
        price_range: "$1,600 USD（2026-08-03 国际官方页标价；当前 Sold out，税费与库存可变）",
        status:
          "Twin Dragons Black Sohari 具体 SKU；当前国际商品页 Sold out，Black Urushi 与 Red Urushi 分开记录",
      },
    }
  : model.spec;
model.sources = model.sources.map((source) => ({
  ...source,
  summary: source.summary.replace(" Type A/B 未解释下拉", ""),
}));
model.primarySourceKey = model.sources.find((source) =>
  source.key.endsWith("twin-dragons-sohari-product"),
)?.key ?? model.primarySourceKey;

brand.key = "phase391-wancher-brand-twin-dragons-sohari-navigation-v1";
brand.sources = brand.sources.map((source) => ({
  ...source,
  summary: source.summary.replace(" Type A/B 未解释下拉", ""),
}));

export const phase391WancherTwinDragonsSohariPacks: CuratedEntityPack[] = [
  brand,
  model,
];
