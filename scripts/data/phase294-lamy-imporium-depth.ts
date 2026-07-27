import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { PHASE42_LAMY_BRAND_ID, phase42LamyPlatinumPacks } from "./phase42-lamy-platinum";

export const PHASE294_IMPORIUM_ID = "phase139-lamy-imporium";
export const PHASE294_IMPORIUM_SLUG = "lamy-imporium";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase294-lamy-imporium-current";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; summary: string; tier?: CuratedSource["tier"]; sourceType?: CuratedSource["sourceType"] }): CuratedSource {
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
  const url = "/images/library/site-original/phase294/lamy/imporium.svg";
  return {
    key: "phase294-lamy-imporium-diagram",
    registryKey: "fountain-pen-graph-editorial-phase294",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase294",
    title: "LAMY imporium factual diagram",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；表达美国黑金 4027928、14 ct 双色金尖、T 10/Z 27、142.20 mm 与 54 g，不是产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  product: web({ key: "phase294-imporium-us-black-gold", title: "LAMY imporium Fountain Pen black-gold", url: "https://www.lamy.com/en-us/p/lamy-imporium-fountain-pen", registryKey: "lamy-official-phase294-us", registryName: "LAMY official US", summary: "美国站黑金选择：螺纹旋下帽、14 ct 双色金尖、T 10/Z 27、13.50 × 13.50 × 142.20 mm、54 g；当前页面显示 item 4027928。" }),
  black: web({ key: "phase294-imporium-us-black", title: "LAMY imporium Fountain Pen black", url: "https://www.lamy.com/en-us/p/lamy-imporium-fountain-pen/52874010722638", registryKey: "lamy-official-phase294-us", registryName: "LAMY official US", summary: "美国站黑色变体：黑色 PVD 笔身与黑色笔夹，14 ct 双色金尖，当前页面显示 item 4027934。" }),
  titanium: web({ key: "phase294-imporium-us-titanium", title: "LAMY imporium Fountain Pen titanium", url: "https://www.lamy.com/en-us/p/lamy-imporium-fountain-pen/52874011017550", registryKey: "lamy-official-phase294-us", registryName: "LAMY official US", summary: "美国站钛色变体：钛色 PVD 与铂色笔夹，14 ct 双色金尖，当前页面显示 item 4027943。" }),
  care: web({ key: "phase294-lamy-care", title: "LAMY Care tips: Fountain Pens", url: "https://www.lamy.com/en-us/care-tips/fountain-pens", registryKey: "lamy-official-phase294-care", registryName: "LAMY official care", tier: "contemporary_archive", summary: "官方护理页区分墨囊更换、converter 灌装与清洗流程。" }),
  review: web({ key: "phase294-imporium-pencilcase", title: "LAMY Imporium Fountain Pen Review", url: "https://www.pencilcaseblog.com/2016/04/lamy-imporium-fountain-pen-review.html", registryKey: "pencilcase-phase294", registryName: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", summary: "独立样笔评测补充握持、重量和 Persona 设计谱系语境；不替代当前官方 SKU。" }),
  penAddict: web({ key: "phase294-imporium-pen-addict", title: "LAMY imporium in black and gold review", url: "https://www.penaddict.com/blog/2015/12/30/lamy-imporium-in-black-and-gold-a-review", registryKey: "pen-addict-phase294", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", summary: "早期黑金样笔评测；仅用于历史样本与使用观察，不能覆盖当前区域代码。" }),
  svg: diagram(),
};

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core") {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }] } satisfies CuratedEntityPack["claims"][number];
}

function ev(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const existingBrand = phase42LamyPlatinumPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE42_LAMY_BRAND_ID);
if (!existingBrand) throw new Error("Phase 294 requires the existing LAMY brand pack.");

const model: CuratedEntityPack = {
  key: "phase294-lamy-imporium-depth-v1",
  entityId: PHASE294_IMPORIUM_ID,
  expectedType: "pen",
  expectedSlug: PHASE294_IMPORIUM_SLUG,
  canonicalName: "LAMY imporium",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/lamy-imporium-phase294-depth.md",
  storyTitle: "LAMY imporium：重量、PVD 与区域 SKU 的版本边界",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "LAMY imporium", language: "en", sourceKey: S.product.key },
    { alias: "LAMY Imporium", language: "en", sourceKey: S.product.key },
    { alias: "凌美 imporium", language: "zh", sourceKey: S.product.key },
  ],
  sources: [S.product, S.black, S.titanium, S.care, S.review, S.penAddict, S.svg],
  scopes: [{ key: SCOPE, scopeKey: SCOPE, market: "LAMY US current product pages, with regional SKU boundaries", validFrom: RETRIEVED, productionState: "current", nibScope: "14 ct bicolour gold nib; EF/F/M/B/OM/OB selections are SKU-scoped", materialScope: "black-gold US anchor uses black matt PVD and gold clip; black and titanium are separate finishes", editionScope: "imporium fountain pen only; ballpoint, rollerball and historical Persona remain sibling identities" }],
  claims: [
    claim("phase294-imporium-identity", "model_identity", "LAMY imporium 是独立的 fountain pen 型号，以凹槽实体笔杆、圆柱螺纹帽和外露金尖为识别组合；不是 Persona 或 LAMY 2000 的别名。", S.product.key, "official product title and design description"),
    claim("phase294-imporium-designer", "designer", "LAMY 官方将 Mario Bellini 列为 imporium 的设计者，并把直线与精确几何作为设计语境。", S.product.key, "official design section"),
    claim("phase294-imporium-dimensions", "dimensions", "美国站当前页面给出 13.50 × 13.50 × 142.20 mm；该尺寸按产品页面记录，不把旧评测的量测当作统一公差。", S.product.key, "official data: Size (W x H x L)"),
    claim("phase294-imporium-weight", "weight", "美国站当前页面给出 54 g；重量是整支产品的规格，不等于所有人的书写舒适度。", S.product.key, "official data: Weight 54 g"),
    claim("phase294-imporium-material", "material", "黑金美国锚点为黑色哑光 PVD 实体金属笔身与金色抛光笔夹；PVD、笔夹和颜色必须按变体记录。", S.product.key, "official black-gold finish description"),
    claim("phase294-imporium-nib", "nib", "官方当前选择包括 EF、F、M、B、OM、OB；笔尖为 14 ct 双色金尖，金材质不等于 flex 承诺。", S.product.key, "official nib grade selector and nib description"),
    claim("phase294-imporium-fill", "filling_system", "imporium fountain pen 使用 LAMY T 10 墨囊与 Z 27 converter，美国页面说明随附蓝色墨囊和 converter；它不是活塞笔。", S.product.key, "official filling configuration"),
    claim("phase294-imporium-sku", "market_sku_boundary", "美国站黑金当前 item 4027928；同一产品树的黑色和钛色页面分别显示 4027934 与 4027943，不能把一个区域代码写成全球固定编号。", S.product.key, "official US variant pages and item numbers"),
    claim("phase294-imporium-assembly", "manufacturing_context", "LAMY 官方称该系列在 Heidelberg 的 craftsman's workshop 装配；这描述装配流程，不推导为所有部件逐件手工制造。", S.product.key, "official assembly statement"),
    claim("phase294-imporium-secondary-identity", "secondary_identity_check", "独立评测明确以 LAMY Imporium 为对象，补充了单一样笔的握持、重量和 Persona 对照语境；这些观察只用于交叉确认型号身份。", S.review.key, "professional secondary review title and model-specific sample"),
    claim("phase294-imporium-care", "maintenance_guidance", "换墨时用室温清水吸排并自然晾干，按官方页面分别处理墨囊更换、converter 灌装与清洗；避免热水、酒精、丙酮和金属抛光剂。", S.care.key, "official fountain pen care sections", "editorial"),
    claim("phase294-imporium-handling", "handling", "54 g 的密实感与凹槽握区需要试握；独立评测仅用于单一样笔的重心、螺纹和 Persona 对照语境，不替代官方客观字段。", S.review.key, "professional secondary sample review", "editorial"),
    claim("phase294-imporium-buying", "selection_guidance", "购买前应核对颜色、区域 item number、尖幅、墨囊与 Z 27 是否在套装内；二手笔还要检查 PVD 边缘、螺纹、笔夹弹簧和尖面。", S.penAddict.key, "independent sample and buying context", "editorial"),
  ],
  variants: [
    { key: "phase294-imporium-black-gold", name: "US black-gold", productCode: "4027928", market: "US", notes: "美国站当前黑金选择；黑色哑光 PVD 笔身与金色抛光笔夹。", sourceKey: S.product.key, variantKind: "market_sku" },
    { key: "phase294-imporium-black", name: "US black", productCode: "4027934", market: "US", notes: "美国站黑色选择；黑色 PVD 笔身与黑色笔夹。", sourceKey: S.black.key, variantKind: "market_sku" },
    { key: "phase294-imporium-titanium", name: "US titanium", productCode: "4027943", market: "US", notes: "美国站钛色选择；钛色 PVD 笔身与铂色笔夹。", sourceKey: S.titanium.key, variantKind: "market_sku" },
    { key: "phase294-imporium-nib-grades", name: "EF/F/M/B/OM/OB nib selection", notes: "官方选择器列出的尖幅；库存按地区和具体 SKU 变化。", sourceKey: S.product.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE42_LAMY_BRAND_ID,
    values: {
      series_name: "LAMY imporium",
      release_year: "当前美国站产品页于 2026-07-28 核验；型号首发年份未断言",
      nib: "14 ct 双色金尖；EF/F/M/B/OM/OB，按具体 SKU",
      fill_system: "LAMY T 10 墨囊与 Z 27 converter",
      material: "黑金锚点：黑色哑光 PVD 金属笔身、金色抛光笔夹；黑色/钛色为独立变体",
      dimensions: "13.50 × 13.50 × 142.20 mm（官方当前页面）",
      weight: "54 g（官方当前页面）",
      status: "LAMY 当前产品树仍列；颜色、item number、库存和价格按区域变化",
    },
    evidence: [
      ev("phase294-imporium-brand", "brand_entity_id", S.product.key, "official LAMY product identity"),
      ev("phase294-imporium-series", "series_name", S.product.key, "official product title"),
      ev("phase294-imporium-release", "release_year", S.product.key, "current listing verification; no launch-year inference"),
      ev("phase294-imporium-nib", "nib", S.product.key, "official nib selector and 14 ct description"),
      ev("phase294-imporium-fill", "fill_system", S.product.key, "official T 10 and Z 27 configuration"),
      ev("phase294-imporium-material", "material", S.product.key, "official black-gold finish"),
      ev("phase294-imporium-dimensions", "dimensions", S.product.key, "official dimensions"),
      ev("phase294-imporium-weight", "weight", S.product.key, "official weight"),
      ev("phase294-imporium-status", "status", S.product.key, "official current product tree and regional variants"),
    ],
  },
  media: [{ key: "phase294-imporium-primary", title: "LAMY imporium 事实示意图（非产品照片）", sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片，不代表真实比例、颜色色准、Logo、尖幅、包装或库存。", sourceUrl: S.svg.url, usageStatus: "primary" }],
  timeline: [{ key: "phase294-imporium-current", title: "LAMY 美国站当前 imporium 页面核验", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "当前产品页的型号、版本、尺寸、重量与供墨边界已按区域 SKU 重新核验；检索日期不等于首发年份。", sourceKey: S.product.key }],
};

export const phase294LamyImporiumDepthPacks: CuratedEntityPack[] = [structuredClone(existingBrand), model];
