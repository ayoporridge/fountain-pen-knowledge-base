import type { CuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE388_TSUIKIN_KANHIZAKURA_ID,
  PHASE388_TSUIKIN_KANHIZAKURA_NAME,
  PHASE388_TSUIKIN_KANHIZAKURA_SLUG,
  PHASE388_WANCHER_BRAND_ID,
  phase388WancherTsuikinKanhizakuraPacks,
} from "./phase388-wancher-tsuikin-kanhizakura";
import { phase519WancherDreamPenPacks } from "./phase519-wancher-dream-pen-new-products";

export const PHASE578_TARGET_ID = PHASE388_TSUIKIN_KANHIZAKURA_ID;
export const PHASE578_WANCHER_BRAND_ID = PHASE388_WANCHER_BRAND_ID;
export const PHASE578_REVIEWER = "phase578-wancher-tsuikin-kanhizakura";

function mergeKeyed<T extends { key: string }>(label: string, ...groups: T[][]): T[] {
  const result = new Map<string, T>();
  for (const group of groups) {
    for (const item of group) {
      const previous = result.get(item.key);
      if (previous && JSON.stringify(previous) !== JSON.stringify(item)) {
        throw new Error(`Phase 578 conflicting ${label}: ${item.key}`);
      }
      result.set(item.key, item);
    }
  }
  return [...result.values()];
}

function mergeAliases(
  ...groups: CuratedEntityPack["aliases"][]
): CuratedEntityPack["aliases"] {
  const result = new Map<string, CuratedEntityPack["aliases"][number]>();
  for (const group of groups) {
    for (const alias of group) {
      // entity_aliases has a unique (entity, alias, language) key. Keep the
      // latest product record when older and newer packs name the same alias.
      const key = `${alias.language}:${alias.alias}`;
      result.set(key, alias);
    }
  }
  return [...result.values()];
}

function mergeVariants(
  ...groups: Array<NonNullable<CuratedEntityPack["variants"]>>
): NonNullable<CuratedEntityPack["variants"]> {
  const result = new Map<string, NonNullable<CuratedEntityPack["variants"]>[number]>();
  for (const group of groups) {
    for (const variant of group) {
      // model_variants is unique by model and variant_name, not by pack key.
      // Prefer the latest product record when the same menu item is repeated.
      result.set(variant.name.trim().toLocaleLowerCase(), variant);
    }
  }
  return [...result.values()];
}

const base = phase388WancherTsuikinKanhizakuraPacks.find(
  (pack) => pack.entityId === PHASE578_TARGET_ID,
);
const latest = phase519WancherDreamPenPacks.find(
  (pack) => pack.entityId === PHASE578_TARGET_ID,
);

if (!base || !latest) {
  throw new Error("Phase 578 requires both the Phase 388 and Phase 519 Tsuikin packs.");
}
if (base.expectedSlug !== PHASE388_TSUIKIN_KANHIZAKURA_SLUG || latest.expectedSlug !== PHASE388_TSUIKIN_KANHIZAKURA_SLUG) {
  throw new Error("Phase 578 Tsuikin slug drifted from the approved identity.");
}
if (base.canonicalName !== PHASE388_TSUIKIN_KANHIZAKURA_NAME || latest.canonicalName !== PHASE388_TSUIKIN_KANHIZAKURA_NAME) {
  throw new Error("Phase 578 Tsuikin name drifted from the approved identity.");
}
if (!base.spec || !latest.spec) {
  throw new Error("Phase 578 Tsuikin packs must both carry model specs.");
}

const mergedValues = {
  ...base.spec.values,
  ...latest.spec.values,
  series_name: "Dream Pen / Ryukyu Tsuikin",
  nib: "#6 JoWo stainless steel、Wancher 18K gold、Shogun 18K；旧日本页另列 Keiryu nib，按订单确认",
  material:
    "最新 product JSON：Ebonite、Red Urushi、Tsuikin Urushi；旧日本具体规格：Ebonite、Tsuikin；同页通用水牛角文案作为 resolved source conflict，不作本 SKU 固定材质",
  price_range:
    "最新英文 product JSON Default Title / SKU WF-TSOU-SAK-RD：US$6,886；旧日本页资料窗口：¥132,000 JPY 含税；历史国际列表曾显示 $1,000 USD，地区窗口不可直接换算",
  weight: "官方未公布可靠成品重量；英文 JSON 的 200 g 字段不作为实测规格",
  status:
    "Dream Pen / Ryukyu Tsuikin 的 Kanhizakura 具体商品；产品号 9327396454615，handle tsuikin-kanhizakuras，价格、库存和可购状态按当次页面确认",
};

const mergedModel: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase578-wancher-tsuikin-kanhizakura-depth-v1",
  markdownFile: ".planning/content-research/wancher-tsuikin-kanhizakura-phase578.md",
  storyTitle: "Wancher Dream Pen Tsuikin Kanhizakura：最新商品记录与堆锦工艺边界",
  primarySourceKey: latest.primarySourceKey,
  aliases: mergeAliases(base.aliases, latest.aliases),
  sources: mergeKeyed("source", base.sources, latest.sources),
  scopes: mergeKeyed("scope", base.scopes, latest.scopes),
  claims: mergeKeyed("claim", base.claims, latest.claims),
  variants: mergeVariants(base.variants ?? [], latest.variants ?? []),
  spec: {
    brandEntityId: PHASE578_WANCHER_BRAND_ID,
    values: mergedValues,
    evidence: mergeKeyed("spec evidence", base.spec.evidence, latest.spec.evidence),
  },
  timeline: mergeKeyed(
    "timeline event",
    base.timeline ?? [],
    latest.timeline ?? [],
    [
      {
        key: "phase578-tsuikin-exact-record",
        title: "最新官方 product JSON identity record verified",
        eventType: "design_milestone",
        startDate: "2026-08-05",
        circa: false,
        description:
          "Product id 9327396454615, handle tsuikin-kanhizakuras, SKU WF-TSOU-SAK-RD and the current material/configuration record were checked; this is a source-window event, not a formal launch date.",
        sourceKey: latest.primarySourceKey,
      },
    ],
  ),
  conflicts: mergeKeyed(
    "conflict",
    base.conflicts ?? [],
    latest.conflicts ?? [],
    [
      {
        key: "phase578-product-record-identity-window",
        fieldKey: "series_name",
        scopeKey: "phase578-wancher-tsuikin-kanhizakura-current",
        conflictKind: "identity",
        status: "resolved",
        resolutionNote:
          "旧日本页短 handle 与最新英文 exact handle、product id 和 SKU 指向同名商品；保留同一型号并追加最新来源，不新造重复条目。",
        members: [
          {
            citationKey: "phase388-wancher-tsuikin-kanhizakura-current-spec-series",
            assertedValue: "ドリームペン 堆錦・カンヒザクラ / tsuikin-kanhizakura",
          },
          {
            citationKey: "tsuikin-series",
            assertedValue: "9327396454615 / tsuikin-kanhizakuras / WF-TSOU-SAK-RD",
          },
        ],
      },
    ],
  ),
  media: latest.media,
};

export const phase578WancherTsuikinKanhizakuraPacks: CuratedEntityPack[] = [
  mergedModel,
];
