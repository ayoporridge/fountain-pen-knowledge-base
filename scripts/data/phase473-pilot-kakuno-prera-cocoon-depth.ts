import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
} from "../lib/curated-content-pack";
import {
  PHASE109_COCOON_ID,
  PHASE109_KAKUNO_ID,
  PHASE109_PRERA_ID,
  phase109PilotCocoonPack,
  phase109PilotKakunoPack,
  phase109PilotPreraPack,
} from "./phase109-pilot-cavalier-prera-kakuno-cocoon";

export const PHASE473_IDS = {
  kakuno: PHASE109_KAKUNO_ID,
  prera: PHASE109_PRERA_ID,
  cocoon: PHASE109_COCOON_ID,
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

function scope(key: string, editionScope: string): CuratedScope {
  return {
    key,
    scopeKey: key,
    market: "Japan/current official catalog",
    productionState: "current",
    editionScope,
  };
}

function claim(
  source: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  confidence = 0.98,
): CuratedClaim {
  const locator = source.archiveLocator ?? source.summary;
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence,
    sourceKey: source.key,
    locator,
    evidence: [{
      key: `${key}-evidence`,
      sourceKey: source.key,
      scopeKey,
      locator,
    }],
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  markdownFile: string,
  current: CuratedSource,
  currentScope: CuratedScope,
  extraSources: CuratedSource[],
  extraClaims: CuratedClaim[],
  extraVariants: NonNullable<CuratedEntityPack["variants"]>,
  eventTitle: string,
  eventDescription: string,
): CuratedEntityPack {
  return {
    ...base,
    key,
    markdownFile,
    primarySourceKey: current.key,
    sources: [...base.sources, current, ...extraSources],
    scopes: [...base.scopes, currentScope],
    claims: [...base.claims, ...extraClaims],
    variants: [...(base.variants ?? []), ...extraVariants],
    spec: base.spec
      ? {
          ...base.spec,
          evidence: [
            ...base.spec.evidence,
            ...Object.keys(base.spec.values).map((fieldKey) => ({
              key: `${key}-${fieldKey}-current-evidence`,
              fieldKey: fieldKey as NonNullable<typeof base.spec>["evidence"][number]["fieldKey"],
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

const kakunoOfficial = officialSource({
  key: "phase473-kakuno-official-current",
  title: "FKA-1SR｜カクノ｜PILOTウェブカタログ",
  url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000317&volumeName=00004",
  registryKey: "pilot-webcatalog-phase473-kakuno",
  summary:
    "现行 FKA-1SR 页面列 EF/F/M、再生树脂轴帽、CON-40/CON-70N、φ16.0×131 mm、11 g，并把笑脸朝上作为使用提示。",
});
const kakunoHowTo = officialSource({
  key: "phase473-kakuno-official-howto",
  title: "万年筆kakuno（カクノ）の使い方｜PILOT",
  url: "https://www.pilot.co.jp/howto_use/fountain/kakuno/",
  registryKey: "pilot-howto-phase473-kakuno",
  summary:
    "官方使用页以取帽、装墨囊、等待出墨和笑脸朝上说明第一次使用，并把清洗流程与日常使用分开。",
});
const kakunoManual = officialSource({
  key: "phase473-kakuno-official-manual",
  title: "kakuno English Use and Care Guide",
  url: "https://www.pilot.co.jp/support/manual/fountain/kakuno_en.pdf",
  registryKey: "pilot-manual-phase473-kakuno",
  summary:
    "官方英文说明书要求直推墨囊、笔尖朝上等待出墨、笑脸一面朝上书写，并以清水处理堵塞或干涸。",
});

const preraOfficial = officialSource({
  key: "phase473-prera-official-current",
  title: "P-FPR-1-RBN｜プレラ｜PILOTウェブカタログ",
  url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100004707&volumeName=00004",
  registryKey: "pilot-webcatalog-phase473-prera",
  summary:
    "现行 P-FPR-1 页面列 F/M、树脂轴帽、CON-40 随附、φ13.4×120.4 mm、15.4 g 与四种基础新色。",
});
const preraPdf = officialSource({
  key: "phase473-prera-official-catalogue",
  title: "PILOT 产品目录：プレラ P-FPR-1",
  url: "https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016938&volumeName=00004",
  registryKey: "pilot-pdf-phase473-prera",
  summary:
    "官方目录 PDF 以 P-FPR-1 家族列出实色商品号、尖号、CON-40 随附与短尺寸规格，作为当前家族范围的交叉核对。",
});
const preraIroAi = officialSource({
  key: "phase473-prera-official-iroai",
  title: "P-FPR-1-TB-F｜プレラ 色彩逢い（いろあい）",
  url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100004795&volumeName=00004",
  registryKey: "pilot-webcatalog-phase473-prera-iroai",
  summary:
    "官方透明 Iro-ai 页面列透明结构和 F/M/CM sibling SKU；它说明相邻系列边界，不把透明款改写成基础实色实体。",
});

const cocoonOfficial = officialSource({
  key: "phase473-cocoon-official-current",
  title: "FCO-3SR-LF｜コクーン｜PILOTウェブカタログ",
  url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000153&volumeName=00004",
  registryKey: "pilot-webcatalog-phase473-cocoon",
  summary:
    "现行 FCO-3SR 页面列 F/M、黄铜涂装轴帽、涂装树脂中间胴、CON-40、φ13.2×138 mm、24 g 与颜色商品组合。",
});
const cocoonSupport = officialSource({
  key: "phase473-cocoon-official-support",
  title: "万年筆のお手入れの仕方｜PILOT",
  url: "https://www.pilot.co.jp/support/manual/fountain/",
  registryKey: "pilot-support-phase473-cocoon",
  summary:
    "Pilot 官方钢笔说明入口把墨囊式清洗、converter 使用和长期保管分成独立护理流程；不以海外 MR 配置替代日本 FCO-3SR。",
});

const kakunoScope = scope(
  "phase473-kakuno-current",
  "FKA-1SR current Japan-market family; colors and EF/F/M nib SKUs remain variants.",
);
const preraScope = scope(
  "phase473-prera-current",
  "P-FPR-1 current Japan-market solid-colour family; Iro-ai remains a transparent sibling.",
);
const cocoonScope = scope(
  "phase473-cocoon-current",
  "FCO-3SR current Japan-market family; colors and F/M nib SKUs remain variants.",
);

export const phase473PilotKakunoPreraCocoonDepthPacks: CuratedEntityPack[] = [
  refresh(
    phase109PilotKakunoPack,
    "phase473-pilot-kakuno-depth-v1",
    ".planning/content-research/pilot-kakuno-phase473.md",
    kakunoOfficial,
    kakunoScope,
    [kakunoHowTo, kakunoManual],
    [
      claim(kakunoOfficial, kakunoScope.scopeKey, "phase473-kakuno-current-spec", "current_sku_spec", "FKA-1SR 当前目录列 EF、F、M 钢尖，最大直径 16.0 mm、全长 131 mm、重量 11.0 g，轴和帽为再生树脂。"),
      claim(kakunoOfficial, kakunoScope.scopeKey, "phase473-kakuno-current-fill", "current_fill_system", "现行日本页面列 Pilot 墨囊以及 CON-40、CON-70N；包装是否附带 converter 仍按具体市场盒卡确认。"),
      claim(kakunoManual, kakunoScope.scopeKey, "phase473-kakuno-smiley-orientation", "nib_orientation_feature", "官方说明书将笑脸朝上放入第一次书写流程；它是尖片方向提示，不是独立型号或可拆换零件。"),
      claim(kakunoHowTo, kakunoScope.scopeKey, "phase473-kakuno-maintenance", "maintenance_workflow", "官方使用页和说明资料把装墨、等待出墨、清水处理堵塞与日常清洁分开，支持不强行甩笔或拆 feed 的保守维护建议。"),
    ],
    [
      { key: "phase473-kakuno-current-ef", name: "FKA-1SR EF nib scope", notes: "Current Japanese family nib option; not a separate model.", sourceKey: kakunoOfficial.key, variantKind: "nib", market: "Japan" },
      { key: "phase473-kakuno-current-fm", name: "FKA-1SR F/M nib scope", notes: "Current Japanese family nib options; colors remain market SKUs.", sourceKey: kakunoOfficial.key, variantKind: "nib", market: "Japan" },
    ],
    "Phase 473：Kakuno FKA-1SR 当前规格与官方上手流程",
    "重新核对 FKA-1SR 的笔尖、再生树脂、converter、笑脸方向提示和清洁流程，并保留颜色与相邻型号边界。",
  ),
  refresh(
    phase109PilotPreraPack,
    "phase473-pilot-prera-depth-v1",
    ".planning/content-research/pilot-prera-phase473.md",
    preraOfficial,
    preraScope,
    [preraPdf, preraIroAi],
    [
      claim(preraOfficial, preraScope.scopeKey, "phase473-prera-current-spec", "current_sku_spec", "P-FPR-1 当前页面列 F/M 钢尖、树脂轴帽、最大直径 13.4 mm、全长 120.4 mm、重量 15.4 g，并附 CON-40。"),
      claim(preraPdf, preraScope.scopeKey, "phase473-prera-colour-skus", "market_sku_boundary", "2025 年新色以红棕、米白、暖黄和深绿松石组成基础实色家族的 market SKU，不因颜色新建实体。"),
      claim(preraIroAi, preraScope.scopeKey, "phase473-prera-iroai-boundary", "variant_sibling_boundary", "透明 Prera Iro-ai 具有自己的 F/M/CM 商品号和透明结构，是相邻 sibling，不覆盖基础 P-FPR-1 实色规格。"),
      claim(preraOfficial, preraScope.scopeKey, "phase473-prera-current-fill", "current_fill_system", "当前日本基础款以 Pilot 墨囊和随附 CON-40 为准；旧评测中的 CON-20/CON-50 仅保留为历史样本。"),
    ],
    [],
    "Phase 473：Prera P-FPR-1 短尺寸与 Iro-ai sibling 边界",
    "将当前 120.4 mm、15.4 g、CON-40、2025 实色商品号和透明 Iro-ai 相邻范围放回同一 canonical 页面。",
  ),
  refresh(
    phase109PilotCocoonPack,
    "phase473-pilot-cocoon-depth-v1",
    ".planning/content-research/pilot-cocoon-phase473.md",
    cocoonOfficial,
    cocoonScope,
    [cocoonSupport],
    [
      claim(cocoonOfficial, cocoonScope.scopeKey, "phase473-cocoon-current-spec", "current_sku_spec", "FCO-3SR 当前日本页面列 F/M 钢尖、黄铜涂装轴帽、涂装树脂中间胴、13.2×138 mm 和 24 g。"),
      claim(cocoonOfficial, cocoonScope.scopeKey, "phase473-cocoon-current-fill", "current_fill_system", "日本当前页面列 Pilot 墨囊语境下的 CON-40；海外 MR 或 Metropolitan 的 standard-international 配置不回填日本对象。"),
      claim(cocoonOfficial, cocoonScope.scopeKey, "phase473-cocoon-colour-skus", "market_sku_boundary", "黑、白、银、蓝、波尔多、金属灰和钛色等颜色与 F/M 组合是 FCO-3SR 家族商品号，不是独立 canonical 型号。"),
      claim(cocoonSupport, cocoonScope.scopeKey, "phase473-cocoon-care", "maintenance_boundary", "Pilot 官方护理资料支持用清水吸排、换色前排空和避免自行拔 feed；漆面、黄铜和树脂部件应采用温和清洁。"),
    ],
    [
      { key: "phase473-cocoon-current-f", name: "FCO-3SR F nib scope", notes: "Current Japanese family nib option; color codes remain market SKUs.", sourceKey: cocoonOfficial.key, variantKind: "nib", market: "Japan" },
      { key: "phase473-cocoon-current-m", name: "FCO-3SR M nib scope", notes: "Current Japanese family nib option; color codes remain market SKUs.", sourceKey: cocoonOfficial.key, variantKind: "nib", market: "Japan" },
    ],
    "Phase 473：Cocoon FCO-3SR 金属规格与地区 sibling 边界",
    "补充 FCO-3SR 当前颜色、F/M 尖、黄铜与树脂部件、CON-40 和温和维护，并保持 MR/Metropolitan 的地区身份边界。",
  ),
];

if (
  new Set(phase473PilotKakunoPreraCocoonDepthPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 473 Pilot Kakuno/Prera/Cocoon packs must contain three unique entities.");
}
