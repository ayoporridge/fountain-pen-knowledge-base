import type { CuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE389_WANCHER_BRAND_ID,
  phase389WancherTwinDragonsBlackPacks,
} from "./phase389-wancher-tsuikin-twin-dragons-black-urushi";

export const PHASE390_WANCHER_BRAND_ID = PHASE389_WANCHER_BRAND_ID;
export const PHASE390_TWIN_DRAGONS_RED_ID =
  "phase390-pen-wancher-tsuikin-twin-dragons-red-urushi";
export const PHASE390_TWIN_DRAGONS_RED_SLUG =
  "wancher-tsuikin-twin-dragons-red-urushi";
export const PHASE390_TWIN_DRAGONS_RED_NAME =
  "Wancher Dream Pen Ryukyu Tsuikin – Twin Dragons Red Urushi";

function rewrite(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replaceAll("phase389", "phase390")
      .replaceAll("black-urushi", "red-urushi")
      .replaceAll("twin-dragons-black-", "twin-dragons-red-")
      .replaceAll("Black Urushi", "Red Urushi")
      .replaceAll("堆錦・双竜・黒", "堆錦・双竜・朱")
      .replaceAll("双龙黑漆", "双龙朱漆")
      .replaceAll("黑漆", "朱漆")
      .replaceAll(
        "Ebonite、Urushi、Tsuikin Urushi",
        "Ebonite、Red Urushi、Tsuikin Urushi",
      )
      .replaceAll("Sold out", "可购买")
      .replaceAll(
        "可购买是当前销售状态，不是停产或限量数量证明。",
        "当前页面可购买，但这不是库存数量或长期供货承诺。",
      )
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
model.entityId = PHASE390_TWIN_DRAGONS_RED_ID;
model.expectedSlug = PHASE390_TWIN_DRAGONS_RED_SLUG;
model.canonicalName = PHASE390_TWIN_DRAGONS_RED_NAME;
model.key = `${PHASE390_TWIN_DRAGONS_RED_ID}-v1`;
model.variants = model.variants?.filter(
  (variant) => variant.variantKind !== "market_sku",
);
model.claims = model.claims?.filter(
  (claim) => !claim.key.endsWith("-type-boundary"),
);
model.spec = model.spec
  ? {
      ...model.spec,
      brandEntityId: PHASE390_WANCHER_BRAND_ID,
      values: {
        ...model.spec.values,
        status:
          "Twin Dragons Red Urushi 具体 SKU；当前国际商品页可购买，Black Urushi 与 Black Sohari 分开记录",
      },
    }
  : model.spec;
model.sources = model.sources.map((source) => ({
  ...source,
  summary: source.summary.replace(" Type A/B 未解释下拉", ""),
}));
model.primarySourceKey = model.sources.find((source) =>
  source.key.endsWith("twin-dragons-red-product"),
)?.key ?? model.primarySourceKey;

brand.key = "phase390-wancher-brand-twin-dragons-red-navigation-v1";
brand.sources = brand.sources.map((source) => ({
  ...source,
  summary: source.summary.replace(" Type A/B 未解释下拉", ""),
}));

export const phase390WancherTwinDragonsRedPacks: CuratedEntityPack[] = [
  brand,
  model,
];
