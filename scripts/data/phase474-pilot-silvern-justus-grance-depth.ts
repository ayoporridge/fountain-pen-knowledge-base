import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE110_GRANCE_ID,
  PHASE110_JUSTUS_ID,
  PHASE110_SILVERN_ID,
  phase110PilotPacks,
} from "./phase110-pilot-justus-95-silvern-grance";

export const PHASE474_IDS = {
  justus: PHASE110_JUSTUS_ID,
  silvern: PHASE110_SILVERN_ID,
  grance: PHASE110_GRANCE_ID,
} as const;

const RETRIEVED = "2026-08-03";

function officialSource(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  summary: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: "PILOT official catalog and support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.url.endsWith(".pdf") ? "pdf" : "web_page",
    author: "PILOT",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function claim(
  source: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
): CuratedClaim {
  const locator = source.archiveLocator ?? source.summary;
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.98,
    sourceKey: source.key,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey: source.key, scopeKey, locator }],
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  markdownFile: string,
  current: CuratedSource,
  currentScope: CuratedScope,
  sources: CuratedSource[],
  claims: CuratedClaim[],
  eventTitle: string,
  eventDescription: string,
): CuratedEntityPack {
  return {
    ...base,
    key,
    markdownFile,
    primarySourceKey: current.key,
    sources: [...base.sources, current, ...sources],
    scopes: [...base.scopes, currentScope],
    claims: [...base.claims, ...claims],
    spec: base.spec
      ? {
          ...base.spec,
          values: {
            ...base.spec.values,
            release_year: "current Japanese catalog scope verified 2026-08-03",
          },
          evidence: [
            ...base.spec.evidence,
            ...Object.keys(base.spec.values).map((fieldKey) => ({
              key: `${key}-${fieldKey}-current-evidence`,
              fieldKey: fieldKey as SpecFieldKey,
              sourceKey: current.key,
              scopeKey: currentScope.scopeKey,
              locator: current.archiveLocator ?? current.summary,
              qualifies: true,
            })),
          ],
        }
      : undefined,
    timeline: [
      ...(base.timeline ?? []),
      {
        key: `${key}-current-verification`,
        title: eventTitle,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: eventDescription,
        sourceKey: current.key,
      },
    ],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

function base(entityId: string, label: string): CuratedEntityPack {
  const pack = phase110PilotPacks.find((candidate) => candidate.entityId === entityId);
  if (!pack) throw new Error(`Phase 474 ${label} base pack is missing.`);
  return pack;
}

const justusBase = base(PHASE474_IDS.justus, "Justus 95");
const silvernBase = base(PHASE474_IDS.silvern, "Silvern");
const granceBase = base(PHASE474_IDS.grance, "Grance");

const justusCurrent = officialSource({
  key: "phase474-justus-official-current",
  title: "FJ-3MR-SB-F｜ジャスタス95｜PILOTウェブカタログ",
  url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000295&volumeName=00004",
  registryKey: "pilot-webcatalog-phase474-justus",
  summary:
    "现行日本页面列 FJ-3MR、14K F/FM/M、树脂 engine-turn 轴帽、CON-40/CON-70N、16×148 mm 和 27 g。",
});
const justusSupport = officialSource({
  key: "phase474-justus-official-support",
  title: "Justus | International Warranty | PILOT",
  url: "https://www.pilot.co.jp/support/warranty/en/fountain/justus95.html",
  registryKey: "pilot-warranty-phase474-justus",
  summary:
    "官方保修页列 FJ-3MR/FJ-3MRR，说明 H/S 对 pen touch 的硬软调节、CON-70N 操作和不得用笔尖撞击瓶底的护理边界。",
});
const justusCatalogPdf = officialSource({
  key: "phase474-justus-official-catalogue",
  title: "PILOT 产品目录：ジャスタス95 FJ-3MR",
  url: "https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016449&volumeName=00004",
  registryKey: "pilot-pdf-phase474-justus",
  summary:
    "官方目录 PDF 交叉列出 FJ-3MR、F/FM/M、CON-70N 随附、CON-40 适配与当前两种黑色纹理。",
});

const silvernCurrent = officialSource({
  key: "phase474-silvern-official-current",
  title: "FK-5MS-KO-F｜シルバーン｜PILOTウェブカタログ",
  url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000300&volumeName=00004",
  registryKey: "pilot-webcatalog-phase474-silvern",
  summary:
    "现行 FK-5MS 页面列 18K F/M、sterling silver 蚀刻与黑化凹部、CON-40、14×142.5 mm、37 g 和 KO/TU/ID 三组纹样。",
});
const silvernWarranty = officialSource({
  key: "phase474-silvern-official-warranty",
  title: "Fountain Pens Products covered by the warranty | PILOT",
  url: "https://www.pilot.co.jp/support/warranty/en/fountain/index.html",
  registryKey: "pilot-warranty-phase474-silvern",
  summary:
    "Pilot 官方保修清单把 Silvern 锁定为 FK-5MS，与 Justus 95、GRANCE 的产品号并列，不把特殊版名称当成另一条标准身份。",
});
const silvernCatalogPdf = officialSource({
  key: "phase474-silvern-official-catalogue",
  title: "PILOT current catalog：シルバーン FK-5MS",
  url: "https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016469&volumeName=00004",
  registryKey: "pilot-pdf-phase474-silvern",
  summary:
    "官方目录 PDF 交叉核对 FK-5MS 的材料、供墨、尺寸、重量、F/M 尖和三组标准纹样。",
});

const granceCurrent = officialSource({
  key: "phase474-grance-official-current",
  title: "FGRC-12SR-BM｜グランセ｜PILOTウェブカタログ",
  url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000289&volumeName=00004",
  registryKey: "pilot-webcatalog-phase474-grance",
  summary:
    "现行 FGRC-12SR 页面列 14K No.3、EF/F/FM/M 按颜色分布、黄铜、CON-40、11.5×136 mm、25.3 g 与当前颜色。",
});
const granceSupport = officialSource({
  key: "phase474-grance-official-support",
  title: "GRANCE | International Warranty | PILOT",
  url: "https://www.pilot.co.jp/support/warranty/en-au/fountain/grance_2.html",
  registryKey: "pilot-warranty-phase474-grance",
  summary:
    "官方保修页确认 FGRC-12SR 与旋转式 CON-40 操作，不把旧 sterling 或 marbled 家族写进当前产品。",
});
const granceCatalogPdf = officialSource({
  key: "phase474-grance-official-catalogue",
  title: "PILOT 产品目录：グランセ FGRC-12SR",
  url: "https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016457&volumeName=00004",
  registryKey: "pilot-pdf-phase474-grance",
  summary:
    "官方目录 PDF 列出 FGRC-12SR 的珠光、黑和深蓝商品号与按颜色配置的 EF/F/FM/M 尖号。",
});

const justusScope: CuratedScope = {
  key: "phase474-justus-current",
  scopeKey: "phase474-justus-current",
  market: "Japan/current official catalog",
  productionState: "current",
  editionScope: "FJ-3MR/FJ-3MRR current family; H/S controller changes support and feel, not a flex guarantee.",
};
const silvernScope: CuratedScope = {
  key: "phase474-silvern-current",
  scopeKey: "phase474-silvern-current",
  market: "Japan/current official catalog",
  productionState: "current",
  editionScope: "FK-5MS standard KO/TU/ID patterns; special editions remain dated samples.",
};
const granceScope: CuratedScope = {
  key: "phase474-grance-current",
  scopeKey: "phase474-grance-current",
  market: "Japan/current official catalog",
  productionState: "current",
  editionScope: "FGRC-12SR current colours and nib combinations; older Grance families excluded.",
};

export const phase474PilotSilvernJustusGranceDepthPacks: CuratedEntityPack[] = [
  refresh(
    justusBase,
    "phase474-pilot-justus-95-depth-v1",
    ".planning/content-research/pilot-justus-95-phase474.md",
    justusCurrent,
    justusScope,
    [justusSupport, justusCatalogPdf],
    [
      claim(justusCurrent, justusScope.scopeKey, "phase474-justus-current-spec", "current_sku_spec", "FJ-3MR 当前日本目录列 14K F/FM/M、树脂 engine-turn 轴帽、16×148 mm、27 g 和 Stripe Black/Net Black 商品号。"),
      claim(justusSupport, justusScope.scopeKey, "phase474-justus-hs-boundary", "adjustable_tension_boundary", "H/S controller 改变 pen touch 的硬软与支撑感；官方资料不把它承诺为任意压力下的传统 flex。"),
      claim(justusSupport, justusScope.scopeKey, "phase474-justus-filling", "current_fill_system", "随附 CON-70N，官方同时列 CON-40 compatible；实际附件与地区包装以目标商品页和盒卡为准。"),
      claim(justusCatalogPdf, justusScope.scopeKey, "phase474-justus-revival", "current_history_anchor", "2013 复兴谱系作为当前 Justus 95 的时间锚，不把早期原版 Justus 自动合并进 FJ-3MR canonical。"),
    ],
    "Phase 474：Justus 95 H/S 机构与当前 FJ-3MR 身份",
    "重新核对 FJ-3MR/FJ-3MRR、H/S 机构、CON-70N、14K 尖和 2013 复兴边界，将样本体验留在具体 scope。",
  ),
  refresh(
    silvernBase,
    "phase474-pilot-silvern-depth-v1",
    ".planning/content-research/pilot-silvern-phase474.md",
    silvernCurrent,
    silvernScope,
    [silvernWarranty, silvernCatalogPdf],
    [
      claim(silvernCurrent, silvernScope.scopeKey, "phase474-silvern-current-spec", "current_sku_spec", "FK-5MS 当前标准款为 sterling silver 轴帽、18K 嵌入式尖、14×142.5 mm、37 g 和 CON-40。"),
      claim(silvernCurrent, silvernScope.scopeKey, "phase474-silvern-standard-patterns", "current_variant_boundary", "格子 KO、つむぎ TU、石だたみ ID 各有 F/M 组合，是当前标准 family variants，不因纹样新建实体。"),
      claim(silvernWarranty, silvernScope.scopeKey, "phase474-silvern-identity", "warranty_identity", "官方保修清单以 FK-5MS 锁定 Silvern canonical；Jaguar、Dragon、Turtle 等特别版不覆盖标准范围。"),
      claim(silvernCatalogPdf, silvernScope.scopeKey, "phase474-silvern-material-care", "silver_material_boundary", "银壳蚀刻与凹部黑化属于当前材质和表面范围，维护与特殊版外观不能由普通树脂型号推导。"),
    ],
    "Phase 474：Silvern FK-5MS 标准纹样与特别版边界",
    "补充 sterling silver、18K 嵌入式尖、KO/TU/ID F/M 商品号和银件维护，同时把 Jaguar 等独立样本隔离。",
  ),
  refresh(
    granceBase,
    "phase474-pilot-grance-depth-v1",
    ".planning/content-research/pilot-grance-phase474.md",
    granceCurrent,
    granceScope,
    [granceSupport, granceCatalogPdf],
    [
      claim(granceCurrent, granceScope.scopeKey, "phase474-grance-current-spec", "current_sku_spec", "FGRC-12SR 当前目录列 14K No.3、黄铜轴帽、11.5×136 mm、25.3 g 和 CON-40。"),
      claim(granceCurrent, granceScope.scopeKey, "phase474-grance-colour-nibs", "current_variant_boundary", "珠光色提供 EF/F/FM/M，黑和深蓝列 F/M；颜色与尖号组合是 FGRC-12SR market SKUs。"),
      claim(granceSupport, granceScope.scopeKey, "phase474-grance-support", "current_fill_system", "官方保修页再次确认 FGRC-12SR 与旋转式 CON-40 操作，不把评测样本包装回填为全球保证。"),
      claim(granceCatalogPdf, granceScope.scopeKey, "phase474-grance-historical-boundary", "historical_family_boundary", "旧 sterling、marbled 和其他 Grance 家族留在 historical scope，不作为当前 FGRC-12SR alias 或主图。"),
    ],
    "Phase 474：Grance FGRC-12SR 当前颜色、尖号与历史家族边界",
    "补充 14K No.3、黄铜细身、EF/F/FM/M 颜色分布和 CON-40，并把旧 sterling/marbled Grance 与评测样本分层。",
  ),
];

if (
  new Set(phase474PilotSilvernJustusGranceDepthPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 474 Pilot Silvern/Justus/Grance packs must contain three unique entities.");
}
