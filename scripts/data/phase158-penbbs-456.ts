import type { CuratedClaimEvidence, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { phase98PenBbsPacks } from "./phase98-penbbs-308-355";

export const PHASE158_PENBBS_BRAND_ID = "fXMP6pCWfPjq";
export const PHASE158_PENBBS_456_ID = "4T9PI9yulxvA";
export const PHASE158_PENBBS_456_OLD_SLUG = "坛笔-penbbs-456";
export const PHASE158_PENBBS_456_SLUG = "penbbs-456";
export const PHASE158_RETRIEVED = "2026-07-24";
const SCOPE = "phase158-penbbs-456";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: PHASE158_RETRIEVED, allowedUse: "summary_only", independenceGroup: input.registryKey, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${PHASE158_RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase158/penbbs/456.svg";
  return { key: "phase158-penbbs-456-diagram", registryKey: "fountain-pen-graph-editorial-phase158", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase158", title: "PenBBS 456 真空上墨事实示意图", url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: PHASE158_RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
const S = {
  store: web({ key: "phase158-penbbs-store", title: "PENBBSOfficialStore", url: "https://www.etsy.com/ca/shop/PENBBSOfficialStore", registryKey: "penbbsofficialstore-phase158", registryName: "PENBBSOfficialStore", sourceType: "official", tier: "primary", summary: "品牌自营销售窗口可核对 456 的型号名称与真空上墨销售语境，但不替代每一批次规格书。", locator: "456 vacuum filling product listing" }),
  tgs: web({ key: "phase158-penbbs-456-tgs", title: "The Gentleman Stationer: PenBBS 456", url: "https://gentlemanstationer.squarespace.com/blog/2019/6/8/pen-review-penbbs-456-vacuum-filler-fountain-pen", registryKey: "gentleman-stationer-phase158-456", registryName: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", summary: "独立评测确认 456 的 vacuum-filler 结构、树脂样本与盲盖供墨边界。", locator: "PenBBS 456 vacuum-filler review" }),
  pastor: web({ key: "phase158-penbbs-456-pastor", title: "Pastor and Pen: PenBBS 456", url: "https://www.pastorandpen.com/blog/2019/7/16/penbbs-456-fountain-pen-review", registryKey: "pastor-and-pen-phase158-456", registryName: "Pastor and Pen", sourceType: "blog", tier: "professional_secondary", summary: "独立样本记录真空填充、笔尖与树脂外观的使用语境，不外推到全部批次。", locator: "PenBBS 456 review and filling experience" }),
  writershelf: web({ key: "phase158-penbbs-456-writershelf", title: "WriterShelf: PenBBS 456 Vac Filler", url: "https://www.writershelf.com/article/penbbs-456-vac-filler-advancing-the-art?locale=en&prne=rod", registryKey: "writershelf-phase158-456", registryName: "WriterShelf / EDC", sourceType: "blog", tier: "professional_secondary", summary: "独立资料解释推杆到底部后的真空释放与吸墨动作。", locator: "vacuum released as plunger reaches bottom" }),
  unsharpen: web({ key: "phase158-penbbs-456-unsharpen", title: "Unsharpen: PenBBS 456", url: "https://unsharpen.com/pen/penbbs-456-fountain-pen/", registryKey: "unsharpen-phase158-456", registryName: "Unsharpen", sourceType: "blog", tier: "professional_secondary", summary: "结构化型号页交叉核对 456 的 vacuum filler 定位与版本资料。", locator: "PenBBS 456 model record" }),
  diagram: diagram(),
} as const;
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence { return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true }; }
function claimEvidence(key: string, sourceKey: string, locator: string): CuratedClaimEvidence { return { key, sourceKey, scopeKey: SCOPE, locator }; }

export const phase158PenBbs456Pack: CuratedEntityPack = {
  key: "phase158-penbbs-456-v1", entityId: PHASE158_PENBBS_456_ID, expectedType: "pen", expectedSlug: PHASE158_PENBBS_456_SLUG, canonicalName: "PenBBS 456", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/penbbs-456-phase158.md", storyTitle: "PenBBS 456：真空上墨与盲盖阀的使用边界", primarySourceKey: S.store.key, depthTier: "A",
  aliases: [{ alias: "PenBBS 456", language: "en", sourceKey: S.store.key }, { alias: "PENBBS 456 Vacuum Filling Fountain Pen", language: "en", sourceKey: S.store.key }, { alias: "坛笔 456", language: "zh", sourceKey: S.store.key }, { alias: "PenBBS 456 Vac Filler", language: "en", sourceKey: S.writershelf.key }],
  sources: [S.store, S.tgs, S.pastor, S.writershelf, S.unsharpen, S.diagram],
  scopes: [{ key: SCOPE, scopeKey: SCOPE, validFrom: PHASE158_RETRIEVED, productionState: "historical", editionScope: "PenBBS 456 真空上墨型号；树脂、Galaxy、Smog、尖幅和包装按具体批次核对。" }],
  claims: [
    { key: "phase158-456-identity", predicate: "model_identity", objectText: "PenBBS 456 是 PenBBS 的真空上墨型号，靠尾部推杆、真空释放和盲盖控制供墨；不是普通活塞、墨囊／转换器或 355 杆式结构。", factClass: "core", confidence: 0.99, sourceKey: S.tgs.key, locator: "vacuum-filler review", evidence: [claimEvidence("phase158-456-identity-e", S.tgs.key, "vacuum-filler review")] },
    { key: "phase158-456-filling", predicate: "filling_system", objectText: "上墨时将笔尖浸入墨水并推进推杆，推杆到底后的真空释放把墨水吸入笔杆；盲盖旋紧后隔离储墨，具体密封状态需按实物检查。", factClass: "core", confidence: 0.98, sourceKey: S.writershelf.key, locator: "vacuum released as plunger reaches bottom", evidence: [claimEvidence("phase158-456-filling-e", S.writershelf.key, "vacuum released as plunger reaches bottom")] },
    { key: "phase158-456-boundary", predicate: "version_boundary", objectText: "透明、半透明以及 Galaxy、Smog 等名称属于外观或销售批次；笔尖、五金和包装不能从一支评测样本外推到全部 456。", factClass: "core", confidence: 0.97, sourceKey: S.pastor.key, locator: "resin and material sample review", evidence: [claimEvidence("phase158-456-boundary-e", S.pastor.key, "resin and material sample review")] },
    { key: "phase158-456-care", predicate: "maintenance", objectText: "换墨前应以常温清水反复吸排，异常阻力、漏墨或盲盖失效时停止强拉强拧；没有可靠拆解资料时不要自行拆真空总成。", factClass: "core", confidence: 0.96, sourceKey: S.tgs.key, locator: "filling and maintenance observations", evidence: [claimEvidence("phase158-456-care-e", S.tgs.key, "filling and maintenance observations")] },
  ],
  variants: [{ key: "phase158-456-clear", name: "透明／半透明树脂样本", notes: "透明度和树脂纹理随批次与材料而变，不能仅凭照片确认年份。", sourceKey: S.pastor.key, variantKind: "edition_group" }, { key: "phase158-456-galaxy-smog", name: "Galaxy／Smog 等材料名称", notes: "记录为具体外观或销售批次，不拆成新的上墨型号。", sourceKey: S.tgs.key, variantKind: "edition_group" }],
  spec: { brandEntityId: PHASE158_PENBBS_BRAND_ID, values: { series_name: "PenBBS 456", release_year: "2018–2019 公开实测窗口；首发年份待品牌档案核实", origin_country: "中国品牌；本页不由销售渠道推断具体工厂", nib: "PenBBS 钢尖；F 等尖幅见独立样本，具体配置按实物核对", fill_system: "vacuum filling 真空上墨，尾部推杆与盲盖供墨阀", material: "树脂／亚克力透明或半透明材料；具体纹理按版本", dimensions: "不同样本尺寸需按具体来源与是否后插核对", weight: "测评样本数值不作为全批次统一规格", status: "历史／流通型号；当前库存与地区供应需按销售页复核" }, evidence: [evidence("phase158-456-brand", "brand_entity_id", S.store.key, "PenBBS sales window"), evidence("phase158-456-series", "series_name", S.store.key, "456 product listing"), evidence("phase158-456-year", "release_year", S.tgs.key, "2019 review window"), evidence("phase158-456-origin", "origin_country", S.store.key, "brand sales context"), evidence("phase158-456-nib", "nib", S.pastor.key, "review sample nib"), evidence("phase158-456-fill", "fill_system", S.writershelf.key, "vacuum filling action"), evidence("phase158-456-material", "material", S.tgs.key, "resin sample"), evidence("phase158-456-dimensions", "dimensions", S.unsharpen.key, "model record boundary"), evidence("phase158-456-weight", "weight", S.pastor.key, "sample-specific weight boundary"), evidence("phase158-456-status", "status", S.store.key, "current store window requires date check")] },
  media: [{ key: "phase158-456-primary-media", title: "PenBBS 456 真空上墨事实示意图（非产品照片）", sourceKey: S.diagram.key, localPath: S.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片；不代表真实比例、颜色、树脂纹理、Logo、尖幅、库存或密封状态。", sourceUrl: S.diagram.url, usageStatus: "primary" }],
  timeline: [{ key: "phase158-456-timeline", title: "PenBBS 456 的独立真空上墨资料窗口", eventType: "design_milestone", startDate: "2019", circa: false, description: "多篇独立评测在 2019 年记录 456 的真空上墨、树脂材料和盲盖供墨边界。", sourceKey: S.tgs.key }],
};

const penBbsBrandPack = structuredClone(phase98PenBbsPacks.find((pack) => pack.expectedType === "brand"));
if (!penBbsBrandPack) throw new Error("Phase 158 requires the existing PenBBS brand pack.");
penBbsBrandPack.key = "phase158-penbbs-brand-navigation";
export const phase158PenBbs456Packs: CuratedEntityPack[] = [penBbsBrandPack, phase158PenBbs456Pack];
