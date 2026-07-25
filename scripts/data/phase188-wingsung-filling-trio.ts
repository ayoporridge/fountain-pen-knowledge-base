import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE186_WINGSUNG_BRAND_ID,
  phase186WingsungPacks,
} from "./phase186-wingsung-601";

const RETRIEVED = "2026-07-25";
export const PHASE188_WINGSUNG_BRAND_ID = PHASE186_WINGSUNG_BRAND_ID;
export const PHASE188_618_ID = "u7s4ejpej4hj";
export const PHASE188_698_ID = "YRFCyRuCvt5I";
export const PHASE188_699_ID = "b5VFRaOVWE7C";

function live(input: {
  key: string;
  title: string;
  url: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    ...input,
    registryKey: `${input.key}-registry`,
    independenceGroup: `${input.key}-group`,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase188",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase188",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创 factual SVG；示意图，非产品照片，不证明比例、颜色、重量、容量或库存。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  six18Comfortable: live({
    key: "phase188-wingsung-618-comfortable-shoes",
    title: "Comfortable Shoes Studio：Wing Sung 618 评测",
    url: "https://comfortableshoesstudio.com/2019/03/review-wing-sung-618/",
    registryName: "Comfortable Shoes Studio",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "独立评测记录 618 的尾端锁止活塞、约 1.3 ml 样本容量与清洗操作风险。",
    locator: "locking piston, fill capacity and use instructions",
  }),
  six18Desk: live({
    key: "phase188-wingsung-618-well-appointed",
    title: "The Well-Appointed Desk：Wing Sung 618 Demonstrator",
    url: "https://www.wellappointeddesk.com/2018/01/wing-sung-618-demonstrator/",
    registryName: "The Well-Appointed Desk",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测补充 618 示范杆、护尖和活塞机构的使用语境。",
    locator: "demonstrator body, hooded nib and piston mechanism",
  }),
  six18Fpn: live({
    key: "phase188-wingsung-618-fpn",
    title: "Fountain Pen Network：Wing Sung 618 与 698 比较",
    url: "https://www.fountainpennetwork.com/forum/topic/326495-wing-sung-618-with-comparison-to-ws-698/",
    registryName: "Fountain Pen Network participants",
    sourceType: "forum",
    tier: "professional_secondary",
    summary: "玩家资料用于区分 618 与 698 的比例、护尖和活塞路线。",
    locator: "618 and 698 model boundary and user comparison",
  }),
  six18Gentleman: live({
    key: "phase188-wingsung-618-gentleman",
    title: "The Gentleman Stationer：Wing Sung 618 与 698 初印象",
    url: "https://www.gentlemanstationer.com/blog/2018/2/7/initial-impressions-wing-sung-618-and-wing-sung-698-piston-fillers",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "存档评测补充 618/698 的透明笔身、活塞说明和购买边界。",
    locator: "filling instructions and transparent piston pens",
  }),
  six18Svg: diagram(
    "phase188-wingsung-618-svg",
    "WingSung 618 暗尖与锁止活塞示意",
    "/images/library/site-original/phase188/wingsung/618.svg",
  ),
  six98Fpn: live({
    key: "phase188-wingsung-698-fpn-first",
    title: "Fountain Pen Network：Wing Sung 698 初印象",
    url: "https://www.fountainpennetwork.com/forum/topic/317718-wing-sung-698-first-impression-review/",
    registryName: "Fountain Pen Network reviewers",
    sourceType: "forum",
    tier: "professional_secondary",
    summary: "独立初印象记录 698 的活塞、EF/F 尖和中等尺寸语境。",
    locator: "piston filler, nib options and size",
  }),
  six98Structure: live({
    key: "phase188-wingsung-698-fpn-structure",
    title: "Fountain Pen Network：Wing Sung 698 活塞填充评测",
    url: "https://www.fountainpennetwork.com/forum/topic/321365-wing-sung-698-piston-filler/",
    registryName: "Fountain Pen Network reviewers",
    sourceType: "forum",
    tier: "professional_secondary",
    summary: "结构评测记录约 141.3 mm、23.8 g、活塞锁止和约 1 ml 容量样本。",
    locator: "dimensions, weight, piston lock and ink capacity",
  }),
  six98Scribble: live({
    key: "phase188-wingsung-698-scribble",
    title: "Scribble Jot：Wing Sung 698 评测",
    url: "https://scribblejot.com/wing-sung-698-piston-filler-fountain-pen-review/",
    registryName: "Scribble Jot",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立书写记录补充 F/EF 线条、供墨速度、硅脂和日用定位。",
    locator: "writing sample, feed behavior and piston lubrication",
  }),
  six98Gentleman: live({
    key: "phase188-wingsung-698-gentleman",
    title: "The Gentleman Stationer：Wing Sung 618 与 698 初印象",
    url: "https://www.gentlemanstationer.com/blog/2018/2/7/initial-impressions-wing-sung-618-and-wing-sung-698-piston-fillers",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "存档评测用于交叉核对示范杆和活塞使用门槛。",
    locator: "demonstrator and beginner-use boundary",
  }),
  six98Svg: diagram(
    "phase188-wingsung-698-svg",
    "WingSung 698 透明活塞示意",
    "/images/library/site-original/phase188/wingsung/698.svg",
  ),
  six99Pastor: live({
    key: "phase188-wingsung-699-pastor",
    title: "Pastor and Pen：Wing Sung 699 评测",
    url: "https://www.pastorandpen.com/blog/2020/2/25/wing-sung-699-fountain-pen-review",
    registryName: "Pastor and Pen",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测解释 699 真空推杆、止墨和大容量使用逻辑。",
    locator: "vacuum filling, shutoff and writing behavior",
  }),
  six99Rupert: live({
    key: "phase188-wingsung-699-rupert",
    title: "Rupert Arzeian：Wing Sung 699 初步印象",
    url: "https://rupertarzeian.com/2019/12/15/early-thoughts-on-the-wing-sung-699-fountain-pen/",
    registryName: "Rupert Arzeian",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立观察记录约 150 mm 合盖和钢尖样本；尺寸不外推到全部批次。",
    locator: "capped length and steel nib sample",
  }),
  six99Fpn: live({
    key: "phase188-wingsung-699-fpn",
    title: "Fountain Pen Network：Wing Sung 699 讨论",
    url: "https://www.fountainpennetwork.com/forum/topic/351352-wing-sung-699/",
    registryName: "Fountain Pen Network participants",
    sourceType: "forum",
    tier: "contemporary_archive",
    summary: "玩家讨论记录真空版、活塞版说法和尖号选择的不确定性。",
    locator: "vacuum and piston version discussion; nib choice",
  }),
  six99Sbre: live({
    key: "phase188-wingsung-699-sbre",
    title: "SBRE Brown：Wing Sung 699 评测索引",
    url: "https://www.sbrebrown.com/tag/wing-sung/",
    registryName: "SBRE Brown",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "独立评测索引用于确认 Wing Sung 699 的钢尖真空笔语境。",
    locator: "Wing Sung 699 steel-nib vacuum-filler review index",
  }),
  six99Svg: diagram(
    "phase188-wingsung-699-svg",
    "WingSung 699 真空推杆示意",
    "/images/library/site-original/phase188/wingsung/699.svg",
  ),
} as const;

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.84,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  };
}

function ev(
  entityKey: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  scopeKey: string,
  locator: string,
): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const existingBrand = phase186WingsungPacks.find(
  (pack) => pack.expectedType === "brand",
);
if (!existingBrand) {
  throw new Error("Phase 188 WingSung brand prerequisite is missing.");
}

const six18Scope = "wingsung-618-model";
const six98Scope = "wingsung-698-model";
const six99Scope = "wingsung-699-model";

const pen618: CuratedEntityPack = {
  key: "phase188-wingsung-618",
  entityId: PHASE188_618_ID,
  expectedType: "pen",
  expectedSlug: "永生-wingsung-618",
  canonicalName: "永生 WingSung 618",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-618-phase188.md",
  storyTitle: "永生 WingSung 618：暗尖活塞与可见墨窗",
  primarySourceKey: S.six18Comfortable.key,
  depthTier: "A",
  aliases: [
    { alias: "Wing Sung 618", language: "en", sourceKey: S.six18Comfortable.key },
    { alias: "WingSung 618", language: "en", sourceKey: S.six18Fpn.key },
    { alias: "永生 618", language: "zh", sourceKey: S.six18Comfortable.key },
  ],
  sources: [S.six18Comfortable, S.six18Desk, S.six18Fpn, S.six18Gentleman, S.six18Svg],
  scopes: [{ key: six18Scope, scopeKey: "wingsung-618-identity-filling-and-care", productionState: "current", editionScope: "618 暗尖、墨窗、锁止式活塞、单支容量与维护边界" }],
  claims: [
    claim("wingsung-618-identity", "model_identity", "WingSung 618 是带暗尖、墨窗和尾端锁止式活塞的现代渠道型号。", S.six18Comfortable.key, six18Scope, "618 review identity and filling mechanism"),
    claim("wingsung-618-boundary", "version_boundary", "618 与 698、601、601A 的护尖、比例和上墨版本不能互相回填。", S.six18Fpn.key, six18Scope, "618 and 698 comparison boundary"),
    claim("wingsung-618-capacity", "sample_measurement", "独立评测样本约可装 1.3 ml；这是单支测量，不代表所有批次。", S.six18Comfortable.key, six18Scope, "sample ink capacity"),
    claim("wingsung-618-care", "maintenance_guidance", "先解锁尾端再旋转活塞，换色用室温清水缓慢抽洗，不使用酒精、热水或金属工具。", S.six18Desk.key, six18Scope, "filling instructions and conservative care"),
    claim("wingsung-618-maker", "brand_context", "该型号归入永生 WingSung 品牌导航；品牌历史争议不改变 618 的自身规格。", S.six18Gentleman.key, six18Scope, "model context without factory inference"),
  ],
  variants: [{ key: "wingsung-618-demonstrator", name: "透明／示范杆版本", notes: "透明度、颜色和笔身细节按具体 SKU 核对。", sourceKey: S.six18Desk.key, variantKind: "color" }, { key: "wingsung-618-hooded", name: "暗尖钢尖", notes: "公开评测多见细尖样本；实际线宽和调校按单支确认。", sourceKey: S.six18Fpn.key, variantKind: "nib" }],
  spec: {
    brandEntityId: PHASE188_WINGSUNG_BRAND_ID,
    values: { series_name: "WingSung 618", nib: "暗尖钢尖；公开评测多见细尖样本，实际线宽按单支确认", fill_system: "带尾端锁止的活塞上墨；先解锁再旋转，操作依版本说明", material: "塑料或透明／半透明笔身、金属夹与护尖等组合；finish 按 SKU", dimensions: "公开评测未形成统一工厂尺寸；细长比例与具体版本有关", weight: "公开资料未形成统一工厂重量；装墨与 finish 会改变实物重量", status: "现代渠道流通型号；透明度、笔尖和包装按卖家与实物核对" },
    evidence: [ev("wingsung-618", "brand_entity_id", S.six18Gentleman.key, six18Scope, "brand navigation context"), ev("wingsung-618", "series_name", S.six18Comfortable.key, six18Scope, "618 model identity"), ev("wingsung-618", "nib", S.six18Fpn.key, six18Scope, "hooded nib comparison"), ev("wingsung-618", "fill_system", S.six18Comfortable.key, six18Scope, "locking piston"), ev("wingsung-618", "material", S.six18Desk.key, six18Scope, "demonstrator body"), ev("wingsung-618", "dimensions", S.six18Fpn.key, six18Scope, "no unified factory dimensions"), ev("wingsung-618", "weight", S.six18Fpn.key, six18Scope, "no unified factory weight"), ev("wingsung-618", "status", S.six18Gentleman.key, six18Scope, "modern channel boundary")],
  },
  media: [{ key: "wingsung-618-primary", title: S.six18Svg.title, sourceKey: S.six18Svg.key, localPath: S.six18Svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例或批次。", sourceUrl: S.six18Svg.url, usageStatus: "primary" }],
};

const pen698: CuratedEntityPack = {
  key: "phase188-wingsung-698",
  entityId: PHASE188_698_ID,
  expectedType: "pen",
  expectedSlug: "永生-wingsung-698",
  canonicalName: "永生 WingSung 698",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-698-phase188.md",
  storyTitle: "永生 WingSung 698：透明示范杆里的活塞机制",
  primarySourceKey: S.six98Fpn.key,
  depthTier: "A",
  aliases: [{ alias: "Wing Sung 698", language: "en", sourceKey: S.six98Fpn.key }, { alias: "WingSung 698", language: "en", sourceKey: S.six98Structure.key }, { alias: "永生 698", language: "zh", sourceKey: S.six98Fpn.key }],
  sources: [S.six98Fpn, S.six98Structure, S.six98Scribble, S.six98Gentleman, S.six98Svg],
  scopes: [{ key: six98Scope, scopeKey: "wingsung-698-identity-piston-and-demonstrator", productionState: "current", editionScope: "698 透明笔身、活塞锁止、EF/F 样本、独立尺寸与维护边界" }],
  claims: [
    claim("wingsung-698-identity", "model_identity", "WingSung 698 是透明或半透明示范杆活塞钢笔，以可见墨水和尾端锁止为主要识别点。", S.six98Fpn.key, six98Scope, "698 first impression identity"),
    claim("wingsung-698-measurement", "sample_measurement", "独立样本约 141.3 mm 合盖、131 mm 未插帽、最大直径约 12.5 mm、约 23.8 g；不代表所有批次。", S.six98Structure.key, six98Scope, "independent dimensions and weight"),
    claim("wingsung-698-nib", "writing_sample_boundary", "评测记录 EF 与偏软 F 样本；线宽、软硬和供墨速度按单支与纸墨条件判断。", S.six98Scribble.key, six98Scope, "nib and writing sample boundary"),
    claim("wingsung-698-care", "maintenance_guidance", "尾端先解锁再吸墨，换色用室温清水往返冲洗；硅脂只用于钢笔活塞维护。", S.six98Structure.key, six98Scope, "piston lock and cleaning boundary"),
    claim("wingsung-698-maker", "brand_context", "该型号归入永生 WingSung 品牌页，不把 698 与 TWSBI、Pilot 或 Pelikan 的品牌关系混写。", S.six98Gentleman.key, six98Scope, "comparison without identity transfer"),
  ],
  variants: [{ key: "wingsung-698-demonstrator", name: "透明／半透明示范杆", notes: "颜色和透明度按具体版本核对。", sourceKey: S.six98Fpn.key, variantKind: "color" }, { key: "wingsung-698-ef-f", name: "EF／F 钢尖选项", notes: "软硬和线宽来自具体样本，不等于 vintage flex。", sourceKey: S.six98Scribble.key, variantKind: "nib" }],
  spec: {
    brandEntityId: PHASE188_WINGSUNG_BRAND_ID,
    values: { series_name: "WingSung 698", nib: "钢尖；评测常见 EF 与偏软 F，实际线宽和软硬按单支确认", fill_system: "透明示范杆活塞上墨，尾端带锁止／离合结构；操作依版本说明", material: "透明或半透明塑料笔身、金属装饰与塑料内帽；finish 按 SKU", dimensions: "独立样本约 141.3 mm 合盖、131 mm 未插帽、最大直径约 12.5 mm", weight: "独立样本约 23.8 g；装墨和饰件会改变实物重量", status: "现代渠道流通型号；颜色、尖号、活塞零件和库存按卖家核对" },
    evidence: [ev("wingsung-698", "brand_entity_id", S.six98Gentleman.key, six98Scope, "brand navigation context"), ev("wingsung-698", "series_name", S.six98Fpn.key, six98Scope, "698 model identity"), ev("wingsung-698", "nib", S.six98Scribble.key, six98Scope, "EF and F samples"), ev("wingsung-698", "fill_system", S.six98Structure.key, six98Scope, "piston lock"), ev("wingsung-698", "material", S.six98Fpn.key, six98Scope, "transparent demonstrator"), ev("wingsung-698", "dimensions", S.six98Structure.key, six98Scope, "sample dimensions"), ev("wingsung-698", "weight", S.six98Structure.key, six98Scope, "sample weight"), ev("wingsung-698", "status", S.six98Gentleman.key, six98Scope, "modern channel boundary")],
  },
  media: [{ key: "wingsung-698-primary", title: S.six98Svg.title, sourceKey: S.six98Svg.key, localPath: S.six98Svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例或批次。", sourceUrl: S.six98Svg.url, usageStatus: "primary" }],
};

const pen699: CuratedEntityPack = {
  key: "phase188-wingsung-699",
  entityId: PHASE188_699_ID,
  expectedType: "pen",
  expectedSlug: "永生-wingsung-699",
  canonicalName: "永生 WingSung 699",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-699-phase188.md",
  storyTitle: "永生 WingSung 699：真空上墨的长写路线",
  primarySourceKey: S.six99Pastor.key,
  depthTier: "A",
  aliases: [{ alias: "Wing Sung 699", language: "en", sourceKey: S.six99Pastor.key }, { alias: "WingSung 699", language: "en", sourceKey: S.six99Rupert.key }, { alias: "永生 699", language: "zh", sourceKey: S.six99Pastor.key }],
  sources: [S.six99Pastor, S.six99Rupert, S.six99Fpn, S.six99Sbre, S.six99Svg],
  scopes: [{ key: six99Scope, scopeKey: "wingsung-699-identity-vacuum-and-shutoff", productionState: "current", editionScope: "699 真空推杆、止墨边界、钢尖、独立尺寸和携带维护" }],
  claims: [
    claim("wingsung-699-identity", "model_identity", "WingSung 699 是以真空／负压推杆、透明储墨杆和止墨边界为核心的现代钢笔。", S.six99Pastor.key, six99Scope, "699 vacuum-filler identity"),
    claim("wingsung-699-boundary", "version_boundary", "市场资料同时出现真空版与活塞版说法，购买时必须核对尾端推杆、阀门和包装，不把所有 699 合并为一个内部版本。", S.six99Fpn.key, six99Scope, "vacuum and piston version discussion"),
    claim("wingsung-699-measurement", "sample_measurement", "独立观察样本合盖约 150 mm；长度来自单支观察，不是统一工厂尺寸。", S.six99Rupert.key, six99Scope, "capped length observation"),
    claim("wingsung-699-care", "maintenance_guidance", "上墨时笔尖完全浸入并完整压下推杆，清洗用室温水反复抽排；气压变化下不承诺绝对不漏墨。", S.six99Pastor.key, six99Scope, "vacuum filling and travel boundary"),
    claim("wingsung-699-maker", "brand_context", "该型号归入永生 WingSung 品牌页；与 Pilot Custom 823 的比较只用于解释真空机制，不构成同款或品质等同。", S.six99Sbre.key, six99Scope, "comparison boundary without identity transfer"),
  ],
  variants: [{ key: "wingsung-699-vacuum", name: "真空／负压版本", notes: "尾端推杆和止墨结构按实物确认。", sourceKey: S.six99Pastor.key, variantKind: "edition_group" }, { key: "wingsung-699-piston", name: "市场所称活塞版本", notes: "玩家讨论中出现的相邻版本说法，不能替代逐支验货。", sourceKey: S.six99Fpn.key, variantKind: "edition_group" }, { key: "wingsung-699-steel", name: "钢尖选项", notes: "Fine 等宽度和单支调校按渠道与实物确认。", sourceKey: S.six99Rupert.key, variantKind: "nib" }],
  spec: {
    brandEntityId: PHASE188_WINGSUNG_BRAND_ID,
    values: { series_name: "WingSung 699", nib: "钢尖；Fine 等宽度按市场 SKU 与单支调校确认", fill_system: "真空／负压推杆上墨，带尾端止墨或供墨操作；版本说明优先", material: "透明或半透明塑料笔身、金属推杆与帽饰；颜色和 finish 按 SKU", dimensions: "独立观察样本合盖约 150 mm；未建立统一工厂尺寸", weight: "公开资料未形成统一工厂重量；装墨、饰件和版本会改变实物重量", status: "现代渠道流通型号；真空／活塞版本、尖号、颜色和库存按卖家核对" },
    evidence: [ev("wingsung-699", "brand_entity_id", S.six99Sbre.key, six99Scope, "brand and comparison context"), ev("wingsung-699", "series_name", S.six99Pastor.key, six99Scope, "699 vacuum identity"), ev("wingsung-699", "nib", S.six99Rupert.key, six99Scope, "steel nib sample"), ev("wingsung-699", "fill_system", S.six99Pastor.key, six99Scope, "vacuum plunger and shutoff"), ev("wingsung-699", "material", S.six99Pastor.key, six99Scope, "clear and colored versions"), ev("wingsung-699", "dimensions", S.six99Rupert.key, six99Scope, "capped sample"), ev("wingsung-699", "weight", S.six99Rupert.key, six99Scope, "no unified factory weight"), ev("wingsung-699", "status", S.six99Fpn.key, six99Scope, "version and channel boundary")],
  },
  media: [{ key: "wingsung-699-primary", title: S.six99Svg.title, sourceKey: S.six99Svg.key, localPath: S.six99Svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例、容量或批次。", sourceUrl: S.six99Svg.url, usageStatus: "primary" }],
};

export const phase188WingsungFillingTrioPacks: CuratedEntityPack[] = [
  existingBrand,
  pen618,
  pen698,
  pen699,
];
