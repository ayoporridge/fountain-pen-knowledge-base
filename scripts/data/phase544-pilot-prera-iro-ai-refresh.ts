import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
} from "../lib/curated-content-pack";
import { PHASE109_PRERA_ID } from "./phase109-pilot-cavalier-prera-kakuno-cocoon";
import { phase473PilotKakunoPreraCocoonDepthPacks } from "./phase473-pilot-kakuno-prera-cocoon-depth";

export const PHASE544_PRERA_ID = PHASE109_PRERA_ID;
export const PHASE544_PRERA_SLUG = "pilot-prera";
export const PHASE544_PILOT_ID = "Zt-PbXkE7UHM";
export const PHASE544_RETRIEVED = "2026-08-06";

function officialSource(input: {
  key: string;
  registryKey: string;
  title: string;
  url: string;
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
    retrievedAt: PHASE544_RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${PHASE544_RETRIEVED};external_archive=false;locator=${input.summary}`,
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
    confidence: 0.99,
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

const iroAiOfficial = officialSource({
  key: "phase544-prera-iroai-official-current",
  registryKey: "pilot-webcatalog-phase544-prera-iroai",
  title: "P-FPR-1-TB-F｜プレラ 色彩逢い（いろあい）｜PILOTウェブカタログ",
  url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100004795&volumeName=00004",
  summary:
    "现行透明 Iro-ai 页面列 P-FPR-1-TB-F 示例、特殊 F 尖、透明黑、CON-40、最大直径 13.4 mm、全长 120.4 mm、重量 15.4 g，并列出 TB/TR/TP/TO/TLG/TLB/TL 的 F/M/CM lineup。",
});

const iroAiCatalogue = officialSource({
  key: "phase544-prera-iroai-official-pdf",
  registryKey: "pilot-pdf-phase544-prera-iroai",
  title: "PILOT 产品目录：プレラ 色彩逢い（いろあい）P-FPR-1",
  url: "https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016938&volumeName=00004",
  summary:
    "官方目录 PDF 在同一页写出透明七色的 F/M/CM 商品号与 JAN 码，并说明特殊合金尖、树脂轴帽、CON-40、13.4 × 120.4 mm、15.4 g；基础实色款另列 F/M。",
});

const iroAiScope: CuratedScope = {
  key: "phase544-prera-iroai-current",
  scopeKey: "phase544-prera-iroai-current",
  market: "Japan/current official catalog",
  productionState: "current",
  editionScope:
    "P-FPR-1 transparent Iro-ai sibling; seven transparent colour codes with F/M/CM market SKUs; do not merge into the solid-colour base scope.",
};

const basePack = phase473PilotKakunoPreraCocoonDepthPacks.find(
  (pack) => pack.entityId === PHASE544_PRERA_ID,
);
if (!basePack) {
  throw new Error("Phase 544 prerequisite Pilot Prera pack is missing.");
}

const existingIroAiKey = "phase109-prera-iroai-sibling";
const existingVariants = basePack.variants ?? [];
if (!existingVariants.some((variant) => variant.key === existingIroAiKey)) {
  throw new Error("Phase 544 prerequisite Iro-ai sibling variant is missing.");
}

const transparentColors = [
  ["TB", "透明黑"],
  ["TR", "透明红"],
  ["TP", "透明粉"],
  ["TO", "透明橙"],
  ["TLG", "透明浅绿"],
  ["TLB", "透明浅蓝"],
  ["TL", "透明蓝"],
] as const;
const nibs = ["F", "M", "CM"] as const;

const iroAiVariants = transparentColors.flatMap(([code, label]) => [
  {
    key: `phase544-prera-iroai-${code.toLowerCase()}-edition`,
    name: `Iro-ai ${label}透明 edition group`,
    releaseYear: "现行",
    notes: `官方当前目录的 ${label} P-FPR-1 透明颜色组；F、M、CM 子 SKU 另列，不创建新的 Prera 实体。`,
    sourceKey: iroAiOfficial.key,
    variantKind: "edition_group" as const,
    market: "Japan",
    productCode: `P-FPR-1-${code}`,
  },
  ...nibs.map((nib) => ({
    key: `phase544-prera-iroai-${code.toLowerCase()}-${nib.toLowerCase()}`,
    name: `Iro-ai ${label}透明 ${nib} SKU`,
    releaseYear: "现行",
    notes: `官方 Iro-ai lineup 的 ${label} ${nib} 商品号；透明轴、特殊合金尖和 CON-40 只在该 SKU 范围内确认。`,
    sourceKey: iroAiCatalogue.key,
    variantKind: "market_sku" as const,
    parentVariantKey: `phase544-prera-iroai-${code.toLowerCase()}-edition`,
    market: "Japan",
    productCode: `P-FPR-1-${code}-${nib}`,
  })),
]);

const variants = [
  ...existingVariants.map((variant) =>
    variant.key === existingIroAiKey
      ? {
          ...variant,
          name: "Prera Iro-ai（色彩逢い）透明 sibling（P-FPR-1）",
          notes:
            "官方透明相邻 family；以 P-FPR-1 为产品族、七种透明色与 F/M/CM 子 SKU 展开；不把透明结构和 CM 尖泛化到基础实色 Prera。",
          sourceKey: iroAiOfficial.key,
          variantKind: "edition_group" as const,
          productCode: "P-FPR-1",
          market: "Japan",
        }
      : variant,
  ),
  ...iroAiVariants,
];

const claims: CuratedClaim[] = [
  claim(
    iroAiOfficial,
    iroAiScope.scopeKey,
    "phase544-prera-iroai-spec",
    "current_sku_spec",
    "现行 Iro-ai 示例 SKU P-FPR-1-TB-F 为特殊合金 F 尖，透明黑树脂轴帽，随附 CON-40，最大直径 13.4 mm、全长 120.4 mm、重量 15.4 g。",
  ),
  claim(
    iroAiCatalogue,
    iroAiScope.scopeKey,
    "phase544-prera-iroai-sku-lineup",
    "market_sku_lineup",
    "官方目录列出 TB、TR、TP、TO、TLG、TLB、TL 七种透明颜色，每种 F、M、CM 三种尖幅，共 21 个 P-FPR-1 Iro-ai 商品号；CM 是目录标注的卡利格拉菲尖。",
  ),
  claim(
    iroAiOfficial,
    iroAiScope.scopeKey,
    "phase544-prera-iroai-boundary",
    "variant_sibling_boundary",
    "P-FPR-1 Iro-ai 是官方单列的透明 Prera sibling；它与基础实色 P-FPR-1 共享 Prera 名称和短尺寸语境，但颜色、透明结构与 CM SKU 不回填基础实色规格。",
  ),
  claim(
    iroAiCatalogue,
    iroAiScope.scopeKey,
    "phase544-prera-iroai-fill",
    "current_fill_system",
    "透明 Iro-ai 目录明确随附并适配 CON-40，页面同时以墨囊式使用视频作为入口；不要将旧样本中的 CON-20 或其他 converter 推广为当前 Iro-ai 配置。",
  ),
];

export const phase544PilotPreraIroAiRefreshPack: CuratedEntityPack = {
  ...basePack,
  key: "phase544-pilot-prera-iro-ai-refresh-v1",
  markdownFile: ".planning/content-research/pilot-prera-phase544.md",
  primarySourceKey: basePack.primarySourceKey,
  sources: [...basePack.sources, iroAiOfficial, iroAiCatalogue],
  scopes: [...basePack.scopes, iroAiScope],
  claims: [...basePack.claims, ...claims],
  variants,
  timeline: [
    ...(basePack.timeline ?? []),
    {
      key: "phase544-prera-iroai-current-verified",
      title: "Iro-ai 透明 SKU 范围复核",
      eventType: "design_milestone",
      startDate: PHASE544_RETRIEVED,
      circa: false,
      description:
        "以 PILOT 当前透明产品页和目录 PDF 复核 P-FPR-1 Iro-ai 的七种透明颜色、F/M/CM 尖幅、CON-40 与尺寸；透明款继续作为 Prera 页面下的 sibling。",
      sourceKey: iroAiOfficial.key,
    },
  ],
  publicationIntent: "publish",
  publicationBlockers: [],
};

export const phase544PilotPreraIroAiRefreshPacks: CuratedEntityPack[] = [
  phase544PilotPreraIroAiRefreshPack,
];

if (new Set(variants.map((variant) => variant.key)).size !== variants.length) {
  throw new Error("Phase 544 Prera variants must have unique keys.");
}
if (iroAiVariants.filter((variant) => variant.variantKind === "market_sku").length !== 21) {
  throw new Error("Phase 544 must model all 21 official Iro-ai market SKUs.");
}
