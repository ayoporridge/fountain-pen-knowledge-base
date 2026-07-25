import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase96KacoMaster14kPacks, PHASE96_KACO_BRAND_ID } from "./phase96-kaco-master14k";

const RETRIEVED = "2026-07-25";
export const PHASE204_KACO_BRAND_ID = PHASE96_KACO_BRAND_ID;
export const PHASE204_EDGE_ID = "mB3Ad49lhus2";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase204", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase204", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、Logo、刻字、生产批次或包装。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}
const S = {
  official: live({ key: "phase204-kaco-official", title: "KACO 官方网站：上海文采与产品中心", url: "https://www.kaco.cc/", registryName: "KACO / Shanghai Wencai", sourceType: "official", tier: "primary", summary: "KACO 官方站提供上海文采品牌与书写工具产品分类背景；不把普通 Master 或其它型号规格移植给 Edge。", locator: "official brand identity and product-centre context" }),
  pastor: live({ key: "phase204-kaco-edge-pastor", title: "Pastor and Pen：Kaco Edge Fountain Pen Review", url: "https://www.pastorandpen.com/blog/2019/2/7/kaco-edge-review", registryName: "Pastor and Pen", sourceType: "blog", tier: "professional_secondary", summary: "独立评测记录 Makrolon 外观、钢尖、卡水／转换器、偏细 EF 样本和刀锋夹子的使用观察。", locator: "2019 review: Makrolon, converter/cartridge, steel EF sample and clip" }),
  gentleman: live({ key: "phase204-kaco-edge-gentleman", title: "The Gentleman Stationer：KACO Edge Fountain Pen Review", url: "https://gentlemanstationer.squarespace.com/?offset=1555769007357", registryName: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", summary: "专业钢笔评测把 Edge 作为 KACO 独立型号，说明 Makrolon、刀锋夹子和转换器套装差异，强调与 Sky、Retro 分线。", locator: "KACO Edge review: Makrolon, blade clip, family and converter packaging boundary" }),
  writershelf: live({ key: "phase204-kaco-edge-writershelf", title: "WriterShelf：Kaco Edge Brushed Makrolon", url: "https://www.writershelf.com/article/kaco-edge-brushed-makrolon-cap-crack-update?prne=roa", registryName: "WriterShelf", sourceType: "blog", tier: "professional_secondary", summary: "长期使用记录支持 Schmidt No.5 钢尖、EF 选项、标准墨囊／转换器，并提醒笔帽边缘开裂属于个体耐久风险。", locator: "long-term review: Schmidt No.5, EF, cartridge/converter and cap crack update" }),
  fpn: live({ key: "phase204-kaco-edge-fpn", title: "Fountain Pen Network：Kaco Edge Black Makrolon Review", url: "https://www.fountainpennetwork.com/forum/topic/363295-kaco-edge-black-makrolon-review/", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "community", summary: "玩家讨论记录国际标准 2.4 mm 口径转换器和 Schmidt 尖单元的使用语境；兼容性仍按具体件号验收。", locator: "Black Makrolon review: international 2.4 mm converter and Schmidt nib unit" }),
  unsharpen: live({ key: "phase204-kaco-edge-unsharpen", title: "Unsharpen：Kaco Edge", url: "https://unsharpen.com/pen/kaco-edge/", registryName: "Unsharpen", sourceType: "blog", tier: "professional_secondary", summary: "型号索引交叉记录 brushed Makrolon、Schmidt 钢尖和标准墨囊，作为零售与评测之外的边界资料。", locator: "model reference: brushed Makrolon, Schmidt steel nib and international cartridge" }),
  svg: diagram("phase204-kaco-edge-svg", "KACO Edge 事实示意", "/images/library/site-original/phase204/kaco/edge.svg"),
} as const;
const scope = "kaco-edge-model";
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string): CuratedEntityPack["claims"][number] { return { key, predicate, objectText, factClass: "core", confidence: 0.9, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: scope, locator }] }; }
function ev(fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] { return { key: `kaco-edge-${fieldKey}`, fieldKey, sourceKey, scopeKey: scope, locator }; }
const edge: CuratedEntityPack = {
  key: "phase204-kaco-edge", entityId: PHASE204_EDGE_ID, expectedType: "pen", expectedSlug: "文采-kaco-edge刀锋", canonicalName: "文采 KACO Edge 刀锋", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/kaco-edge-phase204.md", storyTitle: "KACO Edge 刀锋：Makrolon 杆身、Schmidt 钢尖与夹子边界", primarySourceKey: S.pastor.key, depthTier: "A",
  aliases: [{ alias: "KACO Edge", language: "en", sourceKey: S.pastor.key }, { alias: "KACO EDGE", language: "en", sourceKey: S.gentleman.key }, { alias: "KACO Edge Fountain Pen", language: "en", sourceKey: S.writershelf.key }, { alias: "KACO 刀锋", language: "zh", sourceKey: S.gentleman.key }],
  sources: [S.official, S.pastor, S.gentleman, S.writershelf, S.fpn, S.unsharpen, S.svg],
  scopes: [{ key: scope, scopeKey: "kaco-edge-makrolon-ef", productionState: "historical", editionScope: "KACO Edge／刀锋日用钢笔；材料、夹子、尖幅与套装按具体批次和实物核对，不覆盖 KACO Sky、Retro、普通 Master 或 Master 14K。" }],
  claims: [
    claim("kaco-edge-identity", "model_identity", "KACO Edge 是上海文采 KACO 的独立日用钢笔型号；Edge／刀锋是检索别名，不与 Sky、Retro 或 Master 合并。", S.gentleman.key, "KACO family review and Edge-specific model identity"),
    claim("kaco-edge-material", "material_boundary", "公开评测把笔身和笔帽称为 Makrolon／纤维增强工程塑料一类的哑黑材质；不要把单支表面处理外推为全品牌统一材料。", S.pastor.key, "Makrolon body and cap description"),
    claim("kaco-edge-nib", "nib_boundary", "Edge 常见钢尖，长期评测与索引将其指向 Schmidt 单元；EF 是常见样本，实际线宽与尖面状态按单支验收。", S.writershelf.key, "Schmidt No.5 steel nib and EF boundary"),
    claim("kaco-edge-fill", "filling_system", "Edge 采用国际标准墨囊／转换器路线；不同套装是否附转换器存在差异，不能把包装赠品写成型号永久规格。", S.pastor.key, "cartridge/converter route and package contents"),
    claim("kaco-edge-clip", "design_boundary", "刀锋形夹子是 Edge 的主要识别点，但评测认为夹持开启较困难；夹根耐久和口袋适配需按实物检查。", S.gentleman.key, "blade clip design and usability observation"),
    claim("kaco-edge-care", "maintenance_guidance", "用常温水清洗尖与笔舌，避免热水、酒精和强溶剂；Makrolon 笔帽出现裂痕或夹子松脱时停止携带并交由卖家或维修者处理。", S.writershelf.key, "cap crack update and conservative material care"),
    claim("kaco-edge-selection", "selection_guidance", "选购时核对 KACO 刻字、夹根、尖幅、墨囊／转换器接口和盒内配件；不要用与 Lamy 2000 的外形比较替代型号证据。", S.unsharpen.key, "model identification and purchase inspection boundary"),
  ],
  variants: [{ key: "kaco-edge-black-makrolon", name: "Black Makrolon", notes: "公开评测最常见的黑色杆帽范围；颜色和表面按实物核对。", sourceKey: S.pastor.key, variantKind: "color" }, { key: "kaco-edge-ef", name: "EF 钢尖样本", notes: "评测和索引中的常见尖幅；不代表每个地区／批次只有 EF。", sourceKey: S.writershelf.key, variantKind: "nib" }, { key: "kaco-edge-converter-set", name: "墨囊／转换器套装差异", notes: "有资料记录随盒附墨囊或转换器，包装内容随卖家和批次核对。", sourceKey: S.gentleman.key, variantKind: "market_sku" }],
  spec: { brandEntityId: PHASE204_KACO_BRAND_ID, values: { series_name: "KACO Edge／刀锋", release_year: "至少在 2018–2019 年公开评测中出现；未找到可靠首发年", origin_country: "中国 KACO／上海文采品牌语境；具体生产批次不作超证据推断", nib: "钢尖；Schmidt 单元语境，EF 常见样本，实际尖幅按实物", fill_system: "国际标准墨囊／转换器", material: "Makrolon／纤维增强工程塑料语境；颜色和表面随批次", dimensions: "未找到跨来源一致的厂规尺寸", weight: "未找到跨来源一致的厂规克重", status: "历史／地区流通日用型号；库存与套装内容按卖家复核" }, evidence: [ev("brand_entity_id", S.official.key, "KACO official brand context"), ev("series_name", S.gentleman.key, "Edge-specific review title"), ev("release_year", S.pastor.key, "2019 review window"), ev("origin_country", S.official.key, "Shanghai Wencai brand context"), ev("nib", S.writershelf.key, "Schmidt steel nib and EF"), ev("fill_system", S.pastor.key, "cartridge/converter route"), ev("material", S.pastor.key, "Makrolon body"), ev("dimensions", S.unsharpen.key, "no unified factory dimension asserted"), ev("weight", S.unsharpen.key, "no unified factory weight asserted"), ev("status", S.gentleman.key, "historical review and availability context")] },
  media: [{ key: "kaco-edge-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表真实比例、颜色、Logo、刻字、生产批次或包装。", sourceUrl: S.svg.url, usageStatus: "primary" }],
  timeline: [{ key: "kaco-edge-review-window", title: "KACO Edge 进入公开评测窗口", eventType: "model_released", startDate: "2018", circa: true, description: "2018–2019 年的公开评测和玩家资料已经把 Edge 作为独立型号讨论；这不是品牌档案确认的首发日。", sourceKey: S.pastor.key }],
};
const existingBrand = phase96KacoMaster14kPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE204_KACO_BRAND_ID);
if (!existingBrand) throw new Error("Phase 204 requires the existing curated KACO brand pack.");
export const phase204KacoEdgePacks: CuratedEntityPack[] = [existingBrand, edge];
