import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { PHASE69_ESTERBROOK_BRAND_ID } from "./phase69-esterbrook-estie";

export const PHASE100_ESTERBROOK_DOLLAR_PEN_ID = "j2q37WUZwhAx";
export const PHASE100_ESTERBROOK_DOLLAR_PEN_SLUG = "esterbrook-dollar-pen";

const RETRIEVED = "2026-07-20";

function live(
  input: Omit<
    CuratedSource,
    | "retrievedAt"
    | "allowedUse"
    | "homepageUrl"
    | "archiveUrl"
    | "archiveLocator"
    | "independenceGroup"
  >,
): CuratedSource {
  return {
    ...input,
    homepageUrl: input.url,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
    independenceGroup: input.registryKey,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase100",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase100",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false`,
  };
}

const SOURCES = {
  modernGuide: live({
    key: "phase100-esterbrook-modern-model-guide",
    registryKey: "esterbrook-official-phase100",
    registryName: "Esterbrook official",
    sourceType: "official",
    tier: "primary",
    title: "A Guide to Esterbrook Pen Models: Estie, Model J, and JR Pocket Pen",
    url: "https://www.esterbrookpens.com/blogs/news/a-guide-to-esterbrook-pen-models-estie-model-j-and-jr-pocket-pen-1",
    summary: "品牌当前指南将 Estie、现代 Model J、JR 列为三条当代产品线；现代 Model J 使用 cartridge/converter 和 German-made nib，不能代替历史 Dollar Pen 的资料。",
  }),
  dollar: live({
    key: "phase100-esterbrook-dollar-pens",
    registryKey: "esterbrook-net-phase100",
    registryName: "Esterbrook.net / Brian Anderson",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Esterbrook Dollar Pens",
    url: "https://www.esterbrook.net/bah.shtml",
    summary: "专题档案说明 Dollar Pen 是今日因当年售价一美元而得的统称，典型特征为两孔笔夹和平顶平尾；B（full size）、A（slender）、H（demi）三种体型约生产于 1934–1942。",
  }),
  nibs: live({
    key: "phase100-esterbrook-renew-point",
    registryKey: "esterbrook-net-phase100",
    registryName: "Esterbrook.net / Brian Anderson",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Esterbrook Re-New-Point Nib Units",
    url: "https://www.esterbrook.net/nibs.shtml",
    summary: "专题档案列出历史 Re-New-Point／Renew-Point 单元的编号、尖型与用途；可旋卸不等于每一枚单元都原配，编号也不是型号年份证明。",
  }),
  repair: live({
    key: "phase100-esterbrook-repair",
    registryKey: "esterbrook-net-phase100",
    registryName: "Esterbrook.net / Brian Anderson",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Esterbrook Repair Service and Tips",
    url: "https://www.esterbrook.net/repair.shtml",
    summary: "长期维修资料把老 Esterbrook 的笔囊、J-bar 与杠杆视为独立检修项，并列出部分 $1.00 pen 使用的笔囊规格；不能由此推导所有存世笔均可自行拆修。",
  }),
  dollarSvg: diagram(
    "phase100-esterbrook-dollar-pen-svg",
    "Esterbrook Dollar Pen B／A／H 身份边界事实图",
    "/images/library/site-original/esterbrook-dollar-pen/esterbrook-dollar-pen.svg",
  ),
} satisfies Record<string, CuratedSource>;

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(key: string, title: string, source: CuratedSource) {
  return [{
    key,
    title,
    sourceKey: source.key,
    localPath: source.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、笔尖、刻字、年份、保存状态或具体版本。",
    sourceUrl: source.url,
    usageStatus: "primary" as const,
  }];
}

export function phase100EsterbrookDollarPenPacks(
  brandId = PHASE69_ESTERBROOK_BRAND_ID,
  penId = PHASE100_ESTERBROOK_DOLLAR_PEN_ID,
): CuratedEntityPack[] {
  const brandScope = "phase100-esterbrook-brand-navigation-scope";
  const dollarScope = "phase100-esterbrook-dollar-pen-scope";
  return [
    {
      key: "phase100-esterbrook-brand-navigation-v1",
      entityId: brandId,
      expectedType: "brand",
      expectedSlug: "esterbrook",
      canonicalName: "Esterbrook",
      publicationIntent: "publish",
      publicationBlockers: [],
      markdownFile: ".planning/content-research/esterbrook-brand-phase100.md",
      storyTitle: "Esterbrook：先选年代，再选型号",
      primarySourceKey: SOURCES.modernGuide.key,
      depthTier: "A",
      aliases: [
        { alias: "Esterbrook", language: "en", sourceKey: SOURCES.modernGuide.key },
        { alias: "伊斯特布鲁克", language: "zh", sourceKey: SOURCES.modernGuide.key },
      ],
      sources: [SOURCES.modernGuide, SOURCES.dollar, SOURCES.nibs, SOURCES.repair, SOURCES.dollarSvg],
      scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "unknown", editionScope: "品牌导航把 1934–1942 Dollar Pen、约 1948 年后 Double Jewel J family 和当代 Estie／Model J／JR 分开；图、尺寸、供墨、笔尖和维护方法均不跨代套用。" }],
      claims: [
        {
          key: "phase100-esterbrook-brand-period-boundary",
          predicate: "brand_navigation_boundary",
          objectText: "Esterbrook 的页面首先按年代与结构分流：Dollar Pen 是约 1934–1942 的 B/A/H 历史家族；其后还有不同年代的 J family；现代 Estie、Model J、JR 则是独立的当代产品线。相似名称或复古外形不能证明同一型号。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.dollar.key,
          locator: SOURCES.dollar.summary,
          evidence: [
            { key: "phase100-brand-dollar-boundary", sourceKey: SOURCES.dollar.key, scopeKey: brandScope, locator: SOURCES.dollar.summary },
            { key: "phase100-brand-modern-boundary", sourceKey: SOURCES.modernGuide.key, scopeKey: brandScope, locator: SOURCES.modernGuide.summary },
          ],
        },
        {
          key: "phase100-esterbrook-brand-maintenance-boundary",
          predicate: "maintenance_boundary",
          objectText: "历史杠杆笔要逐支检查笔囊、J-bar、杠杆、塑料和可旋卸笔尖单元；不要把现代 cartridge/converter 的使用方法或现代笔尖规格套进 Dollar Pen，也不因杠杆能动而跳过完整验收。",
          factClass: "core",
          confidence: 0.98,
          sourceKey: SOURCES.repair.key,
          locator: SOURCES.repair.summary,
          evidence: [
            { key: "phase100-brand-repair", sourceKey: SOURCES.repair.key, scopeKey: brandScope, locator: SOURCES.repair.summary },
            { key: "phase100-brand-nib", sourceKey: SOURCES.nibs.key, scopeKey: brandScope, locator: SOURCES.nibs.summary },
          ],
        },
      ],
      media: media("phase100-esterbrook-brand-navigation-media", "Esterbrook 历史／现代型号导航事实图（非产品照片）", SOURCES.dollarSvg),
      timeline: [
        { key: "phase100-esterbrook-dollar-1934", title: "Dollar Pen 的历史生产区间", eventType: "model_released", startDate: "1934", circa: true, description: "专题档案将 B/A/H Dollar Pen 的生产边界概述为约 1934–1942；它不是今天官方的统一 SKU 名称。", sourceKey: SOURCES.dollar.key },
        { key: "phase100-esterbrook-modern-guide-2025", title: "当代 Estie、Model J、JR 的分线说明", eventType: "design_milestone", startDate: "2025", circa: false, description: "官方 2025 指南将 Estie、现代 Model J、JR 列为独立产品线，避免从历史名称反推现代结构。", sourceKey: SOURCES.modernGuide.key },
      ],
    },
    {
      key: "phase100-esterbrook-dollar-pen-v1",
      entityId: penId,
      expectedType: "pen",
      expectedSlug: PHASE100_ESTERBROOK_DOLLAR_PEN_SLUG,
      canonicalName: "Esterbrook Dollar Pen（B／A／H，约 1934–1942）",
      publicationIntent: "publish",
      publicationBlockers: [],
      markdownFile: ".planning/content-research/esterbrook-dollar-pen.md",
      storyTitle: "Esterbrook Dollar Pen：一美元不是一个型号",
      primarySourceKey: SOURCES.dollar.key,
      depthTier: "A",
      aliases: [
        { alias: "Esterbrook Dollar Pen", language: "en", sourceKey: SOURCES.dollar.key },
        { alias: "Esterbrook $1.00 Pen", language: "en", sourceKey: SOURCES.dollar.key },
        { alias: "Esterbrook Model B", language: "en", sourceKey: SOURCES.dollar.key },
        { alias: "Esterbrook Model A", language: "en", sourceKey: SOURCES.dollar.key },
        { alias: "Esterbrook Model H", language: "en", sourceKey: SOURCES.dollar.key },
        { alias: "伊斯特布鲁克一美元笔", language: "zh", sourceKey: SOURCES.dollar.key },
      ],
      sources: [SOURCES.dollar, SOURCES.nibs, SOURCES.repair, SOURCES.modernGuide, SOURCES.dollarSvg],
      scopes: [{ key: dollarScope, scopeKey: dollarScope, productionState: "historical", editionScope: "约 1934–1942 的 Dollar Pen 收藏者家族称呼，包含 B（full size）、A（slender）、H（demi）；不含 1940 年代后 J/LJ/SJ、现代 Model J、Estie、JR 或任何单一颜色／笔尖 SKU。" }],
      claims: [
        {
          key: "phase100-dollar-identity",
          predicate: "model_identity",
          objectText: "Dollar Pen 是收藏者对当年售价一美元的 Esterbrook B/A/H 家族的通称。典型识别线索是两孔笔夹、平顶和平尾；B 为全尺寸、A 为细长、H 为 demi，不能压缩成一支具有固定尺寸、重量或原配笔尖的单一型号。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.dollar.key,
          locator: SOURCES.dollar.summary,
          evidence: [{ key: "phase100-dollar-identity-evidence", sourceKey: SOURCES.dollar.key, scopeKey: dollarScope, locator: SOURCES.dollar.summary }],
        },
        {
          key: "phase100-dollar-structure-boundary",
          predicate: "fill_nib_boundary",
          objectText: "历史 Dollar Pen 以杠杆压迫内部橡胶笔囊吸墨，并使用可旋卸 Re-New-Point／Renew-Point 笔尖单元；一支存世笔的编号、尖型、笔囊和零件是否原配必须逐支确认，不能按现代系统或单张照片推断。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.nibs.key,
          locator: SOURCES.nibs.summary,
          evidence: [
            { key: "phase100-dollar-nib", sourceKey: SOURCES.nibs.key, scopeKey: dollarScope, locator: SOURCES.nibs.summary },
            { key: "phase100-dollar-repair", sourceKey: SOURCES.repair.key, scopeKey: dollarScope, locator: SOURCES.repair.summary },
          ],
        },
        {
          key: "phase100-dollar-modern-exclusion",
          predicate: "version_boundary",
          objectText: "这不是 1940 年代后 Double Jewel J/LJ/SJ，也不是现代 Model J、Estie 或 JR；后者使用当代树脂、cartridge/converter 或现代笔尖体系，不能被用作 Dollar Pen 的规格、图片或维护证据。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.modernGuide.key,
          locator: SOURCES.modernGuide.summary,
          evidence: [
            { key: "phase100-dollar-modern-exclusion", sourceKey: SOURCES.modernGuide.key, scopeKey: dollarScope, locator: SOURCES.modernGuide.summary },
            { key: "phase100-dollar-history-boundary", sourceKey: SOURCES.dollar.key, scopeKey: dollarScope, locator: SOURCES.dollar.summary },
          ],
        },
        {
          key: "phase100-dollar-care",
          predicate: "maintenance_boundary",
          objectText: "旧塑料、笔囊和杠杆都应以温和、逐支评估为前提：常温清水短时清洗并充分晾干；不长期浸泡、用热水或酒精，也不以蛮力掰杠杆。早期塑料存在遇水变形的资料记录，若有阻力、裂纹、漏墨或不确定笔囊状态，应交给熟悉杠杆笔的维修者。",
          factClass: "core",
          confidence: 0.98,
          sourceKey: SOURCES.dollar.key,
          locator: SOURCES.dollar.summary,
          evidence: [
            { key: "phase100-dollar-care-history", sourceKey: SOURCES.dollar.key, scopeKey: dollarScope, locator: SOURCES.dollar.summary },
            { key: "phase100-dollar-care-repair", sourceKey: SOURCES.repair.key, scopeKey: dollarScope, locator: SOURCES.repair.summary },
          ],
        },
      ],
      variants: [
        { key: "phase100-dollar-b", name: "Model B（full size）", releaseYear: "约 1934–1942", notes: "Dollar Pen 家族的全尺寸体型；演示笔、材质、笔夹和杠杆的细节按实物／档案逐支确认。", sourceKey: SOURCES.dollar.key, variantKind: "variant" },
        { key: "phase100-dollar-a", name: "Model A（slender）", releaseYear: "约 1934–1942", notes: "较细长体型；不能因黑硬橡胶、1938 式笔夹或平头细节就反推出唯一年份。", sourceKey: SOURCES.dollar.key, variantKind: "variant" },
        { key: "phase100-dollar-h", name: "Model H（demi）", releaseYear: "约 1934–1942", notes: "较小的 demi 体型；不以相近的 J/LJ/SJ 或现代 JR 图片替代识别。", sourceKey: SOURCES.dollar.key, variantKind: "variant" },
      ],
      spec: {
        brandEntityId: brandId,
        values: {
          series_name: "Vintage Esterbrook Dollar Pen（B/A/H，约 1934–1942）",
          release_year: "约 1934–1942；这是 B/A/H 历史家族的生产边界，不是每一支笔的精确出厂日期",
          origin_country: "美国历史 Esterbrook 产品；具体工厂、出厂年份和零件组合按实物及档案核对",
          nib: "可旋卸 Re-New-Point／Renew-Point 笔尖单元；编号、尖型、状态和是否原配逐支确认",
          fill_system: "lever filler：杠杆压迫内部橡胶笔囊吸墨；不是现代 cartridge/converter、活塞或真空上墨",
          material: "存世笔可见早期塑料与黑硬橡胶等材料；配方、颜色、笔夹和杠杆会随版本变化，早期塑料有遇水变形风险记录",
          dimensions: "没有可靠的统一尺寸：B 为 full size、A 为 slender、H 为 demi；购买时索取实际盖帽长度、最大筒径和正侧面照片",
          weight: "历史资料未给可靠统一重量；材料、笔囊、笔尖单元和保存状态不同，不填单一固定数值",
          status: "停产的历史家族；价格、可写状态、翻修和部件完整度需逐支验收",
        },
        evidence: [
          evidence("brand_entity_id", "phase100-dollar-brand", SOURCES.dollar.key, dollarScope, "historic Esterbrook context; maker topology separately verified"),
          evidence("series_name", "phase100-dollar-series", SOURCES.dollar.key, dollarScope, SOURCES.dollar.summary),
          evidence("release_year", "phase100-dollar-release", SOURCES.dollar.key, dollarScope, SOURCES.dollar.summary),
          evidence("origin_country", "phase100-dollar-origin", SOURCES.dollar.key, dollarScope, "historic Esterbrook archive context without unsupported factory precision"),
          evidence("nib", "phase100-dollar-nib-spec", SOURCES.nibs.key, dollarScope, SOURCES.nibs.summary),
          evidence("fill_system", "phase100-dollar-fill", SOURCES.repair.key, dollarScope, "historic lever and sac repair context"),
          evidence("material", "phase100-dollar-material", SOURCES.dollar.key, dollarScope, SOURCES.dollar.summary),
          evidence("dimensions", "phase100-dollar-dimensions", SOURCES.dollar.key, dollarScope, "B/A/H family dimensions are categorical, not universal measurements"),
          evidence("weight", "phase100-dollar-weight", SOURCES.dollar.key, dollarScope, "no reliable universal historical weight"),
          evidence("status", "phase100-dollar-status", SOURCES.dollar.key, dollarScope, "historical discontinued family and individual-condition boundary"),
        ],
      },
      media: media("phase100-esterbrook-dollar-pen-media", "Esterbrook Dollar Pen B／A／H 事实图（非产品照片）", SOURCES.dollarSvg),
      timeline: [
        { key: "phase100-dollar-1934", title: "Dollar Pen B/A/H 的早期资料边界", eventType: "model_released", startDate: "1934", circa: true, description: "专题档案将 B/A/H Dollar Pen 概括为约 1934–1942 的历史家族；一美元是当年售价和后世称呼的线索，不是单一 SKU 的正式全名。", sourceKey: SOURCES.dollar.key },
        { key: "phase100-dollar-1938", title: "笔夹与杠杆的版本变化线索", eventType: "design_milestone", startDate: "1938", circa: true, description: "资料记录 1938 式笔夹和较高帽环等细节；这些只能作为实物辨识线索，不足以独立断定每支笔的精确年份。", sourceKey: SOURCES.dollar.key },
      ],
    },
  ];
}
