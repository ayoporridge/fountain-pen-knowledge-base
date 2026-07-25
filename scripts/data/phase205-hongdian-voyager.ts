import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase163HongdianPacks, PHASE163_HONGDIAN_BRAND_ID } from "./phase163-hongdian-models";

const RETRIEVED = "2026-07-25";
export const PHASE205_HONGDIAN_BRAND_ID = PHASE163_HONGDIAN_BRAND_ID;
export const PHASE205_VOYAGER_ID = "_tLM8vJHVGyr";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase205", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase205", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、Logo、刻字、金属牌号、生产批次或包装。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}
const S = {
  official: live({ key: "phase205-hongdian-official", title: "HongDian 官方网站", url: "https://hongdianpens.com/", registryName: "HongDian Pens", sourceType: "official", tier: "primary", summary: "品牌官网提供 HongDian 钢笔和清洗语境；不把其它型号的尺寸、材质或尖幅移植给 1843。", locator: "official brand and fountain-pen context" }),
  etsy: live({ key: "phase205-hongdian-1843-etsy", title: "Etsy：HongDian 1843 Stainless Fountain Pen Wave Pattern", url: "https://www.etsy.com/hk-en/listing/853576436/personalized-hongdian-1843-stainless", registryName: "Etsy seller listing", sourceType: "retailer", tier: "retailer", summary: "零售页直接列 1843、波纹金属、EF/F、3.4 mm 墨囊/转换器及一个商品样本的尺寸重量；包装与字段按卖家核对。", locator: "1843 title, wave pattern, EF/F, 3.4 mm, 138 mm, 11 mm and 35 g listing fields" }),
  tsamsa: live({ key: "phase205-hongdian-1843-tsamsa", title: "TSAMSA：HongDian 1843 Blue Fountain Pen", url: "https://tsamsa.com.bd/products/hongdian-1843-fountain-pen", registryName: "TSAMSA", sourceType: "retailer", tier: "retailer", summary: "另一零售页确认 1843 型号和 EF/F 选项；其材质字段与其它列表不一致，作为冲突边界而非统一厂规。", locator: "1843 model number, EF/F options and conflicting material field" }),
  mysku: live({ key: "phase205-hongdian-1843-mysku", title: "MySKU：HongDian 1843 与 1861 Pro 评测", url: "https://mysku.club/blog/aliexpress/97103.html", registryName: "MySKU reviewer", sourceType: "blog", tier: "professional_secondary", summary: "独立评测把 1843 与 1861 Pro 分开，记录波纹金属外观、钢尖和 EF 快速书写时的供墨观察；属于样本体验。", locator: "1843/1861 comparison, wave pattern and EF writing-flow observation" }),
  zhihu: live({ key: "phase205-hongdian-1843-zhihu", title: "知乎：弘典钢笔评价中的 1866／T1 边界", url: "https://www.zhihu.com/tardis/zm/ans/2057000903", registryName: "知乎钢笔使用者", sourceType: "forum", tier: "community", summary: "长期使用者将 1866、T1 等相邻型号分开描述，为 1843 与 1866 苏木、T1 的身份边界提供背景。", locator: "HongDian family comparison and 1866/T1 boundary" }),
  svg: diagram("phase205-hongdian-voyager-svg", "HongDian 1843 Voyager 事实示意", "/images/library/site-original/phase205/hongdian/voyager.svg"),
} as const;
const scope = "hongdian-1843-voyager-model";
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string): CuratedEntityPack["claims"][number] { return { key, predicate, objectText, factClass: "core", confidence: 0.84, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: scope, locator }] }; }
function ev(fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] { return { key: `hongdian-1843-${fieldKey}`, fieldKey, sourceKey, scopeKey: scope, locator }; }
const pen: CuratedEntityPack = {
  key: "phase205-hongdian-voyager", entityId: PHASE205_VOYAGER_ID, expectedType: "pen", expectedSlug: "弘典-hongdian-远航者", canonicalName: "弘典 HongDian 1843 Voyager 远航者", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/hongdian-voyager-phase205.md", storyTitle: "弘典 HongDian 1843 Voyager 远航者：波纹金属杆帽与卡水边界", primarySourceKey: S.etsy.key, depthTier: "A",
  aliases: [{ alias: "HongDian 1843", language: "en", sourceKey: S.etsy.key }, { alias: "HongDian 1843 Voyager", language: "en", sourceKey: S.mysku.key }, { alias: "HongDian Voyager", language: "en", sourceKey: S.mysku.key }, { alias: "弘典 远航者", language: "zh", sourceKey: S.etsy.key }],
  sources: [S.official, S.etsy, S.tsamsa, S.mysku, S.zhihu, S.svg],
  scopes: [{ key: scope, scopeKey: "hongdian-1843-wave-metal", productionState: "historical", editionScope: "HongDian 1843 Voyager／远航者日用钢笔；波纹杆帽、旋帽、EF/F 样本和 3.4 mm 接口按具体市场与实物核对，不覆盖 1861 Pro、1866 苏木或 T1。" }],
  claims: [
    claim("hongdian-1843-identity", "model_identity", "HongDian 1843 Voyager（远航者）是独立的数字型号；Voyager／远航者是市场命名，不与 1861 Pro、1866 苏木或 T1 合并。", S.etsy.key, "1843 product title and separate model naming"),
    claim("hongdian-1843-body", "material_boundary", "公开零售资料稳定指向金属波纹杆帽，但材质字段出现 stainless steel 与 brass 的差异；牌号和表面处理按包装与实物确认。", S.etsy.key, "wave-pattern metal listing and material-field boundary"),
    claim("hongdian-1843-nib", "nib_boundary", "公开商品页常列 EF/F 钢尖；Etsy 的毫米数是卖家标注，MySKU 的 EF 供墨观察属于单支体验，不能外推全批次线宽或软硬。", S.etsy.key, "EF/F options and individual writing-flow boundary"),
    claim("hongdian-1843-filling", "filling_system", "1843 走 3.4 mm 墨囊／转换器路线；有的套装列转换器、有的包装清单不同，不能把某个卖家配件当作固定规格。", S.etsy.key, "3.4 mm cartridge/converter and package variance"),
    claim("hongdian-1843-cap", "construction", "公开样本为旋帽；螺纹、帽口和夹根应按单支检查，后插会改变重心，不把零售的商务礼品形容词写成普适长写结论。", S.etsy.key, "screw-cap and sample dimensions"),
    claim("hongdian-1843-family", "series_boundary", "1843 与 1861 Pro、1866 苏木、T1 可以在 HongDian 品牌页互相导航，但材料、笔尖、尺寸和配件各自独立。", S.mysku.key, "1843/1861 comparison and family boundary"),
    claim("hongdian-1843-care", "maintenance_guidance", "换墨用常温水吸排，波纹表面用软布清洁；避免热水、酒精、金属抛光剂和针尖刮擦，漏墨或裂纹时停止携带并联系卖家。", S.official.key, "HongDian care context and safe cleaning boundary"),
    claim("hongdian-1843-selection", "selection_guidance", "选购核对 1843 刻字、波纹杆身、EF/F 尖幅、3.4 mm 接口和盒内转换器；只写 HongDian 金属笔或借用相邻型号图片的页面应视为未证实。", S.tsamsa.key, "1843 model and option cross-check"),
  ],
  variants: [{ key: "hongdian-1843-ef", name: "EF 尖样本", notes: "Etsy 与 MySKU 资料中的细尖选择；线宽和供墨按单支试写。", sourceKey: S.etsy.key, variantKind: "nib" }, { key: "hongdian-1843-f", name: "F 尖样本", notes: "零售页列出的常规尖幅；不将毫米数当作统一厂规。", sourceKey: S.tsamsa.key, variantKind: "nib" }, { key: "hongdian-1843-market", name: "Voyager／远航者市场别名", notes: "用于检索与品牌页导航，不另建实体。", sourceKey: S.mysku.key, variantKind: "market_sku" }],
  spec: { brandEntityId: PHASE205_HONGDIAN_BRAND_ID, values: { series_name: "HongDian 1843 Voyager／远航者", release_year: "至少在 2023 年公开评测与当前零售页中出现；确切首发年未核实", origin_country: "中国 HongDian 品牌语境；具体生产批次不从零售页推断", nib: "钢尖；EF/F 常见市场选项，实际线宽按单支", fill_system: "3.4 mm 墨囊／转换器路线；套装配件按卖家", material: "金属波纹杆帽；stainless steel 与 brass 标注存在差异", dimensions: "某零售样本约 138 mm 合盖、直径约 11 mm；不外推全批次", weight: "某零售样本约 35 g；不外推全批次", status: "历史／地区流通日用型号；颜色、尖幅和库存随渠道变化" }, evidence: [ev("brand_entity_id", S.official.key, "HongDian official brand context"), ev("series_name", S.etsy.key, "1843 Voyager product title"), ev("release_year", S.mysku.key, "2023 review publication window"), ev("origin_country", S.official.key, "brand context"), ev("nib", S.etsy.key, "EF/F and seller line-width fields"), ev("fill_system", S.etsy.key, "3.4 mm cartridge/converter field"), ev("material", S.etsy.key, "wave-pattern metal listing"), ev("dimensions", S.etsy.key, "138 mm and 11 mm sample fields"), ev("weight", S.etsy.key, "35 g sample field"), ev("status", S.tsamsa.key, "current regional retail listing") ] },
  media: [{ key: "hongdian-1843-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表真实比例、颜色、Logo、刻字、金属牌号、生产批次或包装。", sourceUrl: S.svg.url, usageStatus: "primary" }],
  timeline: [{ key: "hongdian-1843-review-window", title: "1843 Voyager 公开评测窗口", eventType: "model_released", startDate: "2023", circa: true, description: "MySKU 在 2023 年公开评测中记录 HongDian 1843 与 1861 Pro；发表时间不等同品牌确认的首发年。", sourceKey: S.mysku.key }],
};
const existingBrand = phase163HongdianPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE205_HONGDIAN_BRAND_ID);
if (!existingBrand) throw new Error("Phase 205 requires the existing curated HongDian brand pack.");
export const phase205HongdianVoyagerPacks: CuratedEntityPack[] = [existingBrand, pen];
