import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE559_ALUMINUM_CLASSIC_ID,
  phase559WancherDreamPenAluminumClassicPacks,
} from "./phase559-wancher-dream-pen-aluminum-classic";

export const PHASE560_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE560_ALUMINUM_CONTEMPORARY_ID =
  "phase560-wancher-dream-pen-aluminum-contemporary";
export const PHASE560_ALUMINUM_CONTEMPORARY_SLUG =
  "wancher-dream-pen-aluminum-contemporary";
export const PHASE560_ALUMINUM_CONTEMPORARY_NAME =
  "Wancher Dream Pen Aluminum Contemporary";

const classicPack = phase559WancherDreamPenAluminumClassicPacks.find(
  (pack) => pack.entityId === PHASE559_ALUMINUM_CLASSIC_ID,
);
const brandPack = phase559WancherDreamPenAluminumClassicPacks.find(
  (pack) => pack.entityId === PHASE560_WANCHER_BRAND_ID && pack.expectedType === "brand",
);
if (!classicPack || !brandPack) {
  throw new Error("Phase 560 requires the verified Wancher brand and Aluminum Classic packs.");
}

function replaceText(value: string): string {
  return value
    .replaceAll("phase559", "phase560")
    .replaceAll("wancher-dream-pen-aluminum-classic", "wancher-dream-pen-aluminum-contemporary")
    .replaceAll("aluminum-classic", "aluminum-contemporary")
    .replaceAll("Aluminum Classic", "Aluminum Contemporary")
    .replaceAll("Classic gold", "Contemporary rose gold")
    .replaceAll("Classic 金色", "Contemporary 玫瑰金色")
    .replaceAll("金色外观", "玫瑰金色外观")
    .replaceAll("金色版本", "玫瑰金色版本")
    .replaceAll("gold appearance", "rose-gold appearance")
    .replaceAll("gold finish", "rose-gold finish")
    .replaceAll("WF-DREAM-ALU-GL", "WF-DREAM-ALU-RG")
    .replaceAll("WF-DREAM-ALU-GD", "WF-DREAM-ALU-RG")
    .replaceAll("Classic", "Contemporary")
    .replaceAll("经典金色", "玫瑰金色")
    .replaceAll("金色", "玫瑰金色");
}

function mapDeep<T>(value: T): T {
  if (typeof value === "string") return replaceText(value) as T;
  if (Array.isArray(value)) return value.map((item) => mapDeep(item)) as T;
  if (value && typeof value === "object") {
    const mapped = Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        mapDeep(item),
      ]),
    );
    return mapped as T;
  }
  return value;
}

function sourceOverride(source: CuratedSource): CuratedSource {
  if (source.key.endsWith("-product")) {
    return {
      ...source,
      title: "Dream Pen Aluminum Contemporary Fountain Pen | Wancher Pen",
      url: "https://www.wancherpen.com/products/dream-pen-aluminum-contemporary",
      homepageUrl: "https://www.wancherpen.com",
      registryKey: "wancher-official-aluminum-contemporary-phase560",
      registryName: "Wancher Pen official product page",
      independenceGroup: "wancher-official-aluminum-contemporary",
      summary:
        "官方 exact product page：Dream Pen Aluminum Contemporary、EF/F/M/B、铝制笔身、Contemporary 玫瑰金色、#6 JoWo 镀色不锈钢尖、欧规墨囊／转换器、三种 feed 与 compact air-tight cap；访问时显示售罄。",
      archiveUrl: "https://www.wancherpen.com/products/dream-pen-aluminum-contemporary",
    };
  }
  if (source.key.endsWith("-product-json")) {
    return {
      ...source,
      title: "Dream Pen Aluminum Contemporary product JSON | Wancher",
      url: "https://www.wancherpen.com/products/dream-pen-aluminum-contemporary.js",
      homepageUrl: "https://www.wancherpen.com",
      registryKey: "wancher-official-aluminum-contemporary-json-phase560",
      registryName: "Wancher Pen product JSON endpoint",
      independenceGroup: "wancher-official-aluminum-contemporary",
      summary:
        "官方商品 JSON 提供 Shopify 商品 ID 8096543015127、2023 创建／发布元数据、handle、EF/F/M/B 变体、WF-DREAM-ALU-RG-EF/F/M/B SKU；weight=200 仅作未解释目录元数据，不替代店铺 41 g 规格。",
      archiveUrl: "https://www.wancherpen.com/products/dream-pen-aluminum-contemporary.js",
    };
  }
  if (source.key.endsWith("-rakuten")) {
    return {
      ...source,
      title: "Wancher Dream Pen Aluminum Contemporary WF-DREAM-ALU-RG | Wancher official shop",
      url: "https://item.rakuten.co.jp/wancher/wf-dream-alu-rg/",
      homepageUrl: "https://item.rakuten.co.jp",
      registryKey: "wancher-official-rakuten-aluminum-contemporary-phase560",
      registryName: "Wancher official Rakuten shop",
      independenceGroup: "wancher-official-aluminum-contemporary-rakuten",
      summary:
        "Wancher 官方 Rakuten 店铺详情给出商品编号 WF-DREAM-ALU-RG、EF/F/M/B、#6 JoWo 不锈钢尖、欧规转换器／墨囊、未使用时 152.5 mm、最大 15.3 mm、41 g、铝材及桐箱／保证书／说明书。",
      archiveUrl: "https://item.rakuten.co.jp/wancher/wf-dream-alu-rg/",
    };
  }
  return source;
}

const mapped = mapDeep(structuredClone(classicPack)) as CuratedEntityPack;
mapped.key = "phase560-wancher-dream-pen-aluminum-contemporary-v1";
mapped.entityId = PHASE560_ALUMINUM_CONTEMPORARY_ID;
mapped.expectedSlug = PHASE560_ALUMINUM_CONTEMPORARY_SLUG;
mapped.canonicalName = PHASE560_ALUMINUM_CONTEMPORARY_NAME;
mapped.markdownFile = ".planning/content-research/wancher-dream-pen-aluminum-contemporary-phase560.md";
mapped.storyTitle = "Wancher Dream Pen Aluminum Contemporary：玫瑰金铝身与四个官方 SKU";
mapped.sources = mapped.sources.map(sourceOverride);
mapped.primarySourceKey = "phase560-wancher-aluminum-contemporary-product";
mapped.spec = mapped.spec
  ? { ...mapped.spec, brandEntityId: PHASE560_WANCHER_BRAND_ID }
  : undefined;

const aluminumCollectionSource = mapped.sources.find((source) =>
  source.key.endsWith("-aluminum-collection"),
);
if (aluminumCollectionSource) {
  aluminumCollectionSource.summary =
    "官方 Aluminum 集合将 Aluminum Classic 与 Aluminum Contemporary 分列；Classic 为金色、Contemporary 为玫瑰金色，集合状态会随库存变化。";
}
if (mapped.spec) {
  mapped.spec.values.material =
    "Aluminum body; Contemporary rose-gold appearance；铝材牌号与表面处理工艺未公布";
}
const factualMedia = mapped.media[0];
if (factualMedia) {
  factualMedia.title =
    "Aluminum Contemporary 材料、四个 SKU 与 Aluminum Classic 边界事实图（非产品照片）";
}

const identityClaim = mapped.claims.find((claim) => claim.key.endsWith("-identity"));
if (identityClaim) {
  identityClaim.objectText =
    "Dream Pen Aluminum Contemporary 是 Wancher Dream Pen 下的玫瑰金铝制具体型号；不与 Dream Pen 系列导航、Aluminum Classic 或其他 Dream Pen 材料路线合并。";
}
const colorClaim = mapped.claims.find((claim) => claim.key.endsWith("-color-boundary"));
if (colorClaim) {
  colorClaim.objectText =
    "Contemporary 为玫瑰金色外观，Classic 为金色相邻商品；两者不是同一型号的普通颜色后缀。";
}
const materialClaim = mapped.claims.find((claim) => claim.key.endsWith("-material"));
if (materialClaim) {
  materialClaim.objectText =
    "官方规格将基础材料列为 Aluminum；玫瑰金色是 Contemporary 外观，不等于整支笔使用黄金或贵金属。";
}
const skuClaim = mapped.claims.find((claim) => claim.key.endsWith("-skus"));
if (skuClaim) {
  skuClaim.objectText =
    "官方产品 JSON 列出 WF-DREAM-ALU-RG-EF、WF-DREAM-ALU-RG-F、WF-DREAM-ALU-RG-M、WF-DREAM-ALU-RG-B 四个 Contemporary 尖幅 SKU；它们是同一型号的市场变体。";
}
const mediaClaim = mapped.claims.find((claim) => claim.key.endsWith("-media-boundary"));
if (mediaClaim) {
  mediaClaim.objectText =
    "本站 SVG 只用于解释铝材、玫瑰金色、四个 RG SKU 与 Aluminum Classic 兄弟边界；它是事实示意图，不是产品照片、Logo、比例图或颜色校样。";
}

export const phase560WancherDreamPenAluminumContemporaryPacks: CuratedEntityPack[] = [
  structuredClone(brandPack),
  mapped,
];
