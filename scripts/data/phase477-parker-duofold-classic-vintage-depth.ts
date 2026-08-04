import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE34_DUOFOLD_CENTENNIAL_ID,
  PHASE34_DUOFOLD_VINTAGE_ID,
  phase34ParkerDuofoldPacks,
} from "./phase34-parker-duofold";

export const PHASE477_IDS = {
  vintage: PHASE34_DUOFOLD_VINTAGE_ID,
  centennial: PHASE34_DUOFOLD_CENTENNIAL_ID,
} as const;

const RETRIEVED = "2026-08-03";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  title: string;
  url: string;
  summary: string;
  author: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.independenceGroup,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.sourceType === "official"
        ? "https://www.parkerpen.com/"
        : input.url,
    itemType: "web_page",
    author: input.author,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Duofold identity;material;timeline;filling;current SKU or archive boundary`,
  };
}

function claim(
  sourceItem: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
): CuratedClaim {
  const locator = sourceItem.archiveLocator ?? sourceItem.summary;
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.98,
    sourceKey: sourceItem.key,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator }],
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  markdownFile: string,
  current: CuratedSource,
  currentScope: CuratedScope,
  extraSources: CuratedSource[],
  claims: CuratedClaim[],
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>,
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
    claims: [...base.claims, ...claims],
    spec: base.spec
      ? {
          ...base.spec,
          values: { ...base.spec.values, ...values },
          evidence: [
            ...base.spec.evidence,
            ...Object.keys({ ...base.spec.values, ...values }).map((fieldKey) => ({
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
  const pack = phase34ParkerDuofoldPacks.find((candidate) => candidate.entityId === entityId);
  if (!pack) throw new Error(`Phase 477 ${label} base pack is missing.`);
  return pack;
}

const vintageBase = base(PHASE477_IDS.vintage, "vintage Duofold");
const centennialBase = base(PHASE477_IDS.centennial, "Classic Centennial");

const officialHistory = source({
  key: "phase477-parker-history-current",
  registryKey: "parker-official-phase477",
  registryName: "Parker official history and product pages",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "parker-newell-official-phase477",
  title: "Timeline | Parker",
  url: "https://www.parkerpen.com/parker-history.html",
  summary:
    "当前官方时间线把 Duofold launch 放在 1921 年，记录 Big Red 与 1928 新塑料材料语境；这是品牌历史锚点，不是单支古董鉴定。",
  author: "Parker / Newell Brands",
});
const duofoldPress = source({
  key: "phase477-parker-duofold-100-press-current",
  registryKey: "parker-official-phase477",
  registryName: "Parker official history and product pages",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "parker-newell-official-phase477",
  title: "PARKER Duofold 100 press release",
  url: "https://www.parkerpen.com/duofold-press-release.html",
  summary:
    "2021 官方新闻稿把 Duofold 100 作为百年限量现代致敬，区分 1920 年代 resin、Big Red/Jade/Lapis 叙事与现代产品。",
  author: "Parker / Newell Brands",
});
const currentProduct = source({
  key: "phase477-parker-duofold-1931381-current",
  registryKey: "parker-official-phase477",
  registryName: "Parker official history and product pages",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "parker-newell-official-phase477",
  title: "Duofold Classic Fountain Pen | Parker — SKU 1931381",
  url: "https://www.parkerpen.com/writing-types/collections/duofold/duofold-classic-fountain-pen/SAP_1931381.html",
  summary:
    "当前 Classic Black SKU 1931381 页面列 Centennial Size、precious resin、23K gold-plated trims、18K solid-gold rhodium-plated nib、Fine/Medium selector、黑墨与 Fountain/Ballpoint 分列。",
  author: "Parker / Newell Brands",
});
const nibExchange = source({
  key: "phase477-parker-nib-exchange-current",
  registryKey: "parker-official-phase477",
  registryName: "Parker official history and product pages",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "parker-newell-official-phase477",
  title: "Nib Exchange Programme | Parker",
  url: "https://www.parkerpen.com/parker-nib-exchange.html",
  summary:
    "当前官方交换页列 Duofold Classic 的 XXF 至 XXB 尖幅，并说明购买后 28 天内由零售商协调同值笔尖交换；特别版不一定齐全。",
  author: "Parker / Newell Brands",
});
const refills = source({
  key: "phase477-parker-refills-current",
  registryKey: "parker-official-phase477",
  registryName: "Parker official history and product pages",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "parker-newell-official-phase477",
  title: "Refills and Fountain Pen Care | Parker",
  url: "https://www.parkerpen.com/support?cfid=refills",
  summary:
    "当前官方说明给出 cartridge/converter 吸墨、清洗、尖向上存放和堵塞处理；适用于现代 Duofold 的保守护理，不回填古董 button filler。",
  author: "Parker / Newell Brands",
});
const vintagePens = source({
  key: "phase477-vintagepens-duofold-current",
  registryKey: "vintagepens-phase477",
  registryName: "VintagePens Parker reference",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "vintagepens-phase477",
  title: "Parker Duofold | VintagePens",
  url: "https://www.vintagepens.com/Parker_Duofold.shtml",
  summary:
    "专业古董钢笔资料记录 1921 hard-rubber button filler、Senior/Junior/Lady、1926 Permanite 转换、颜色与材料老化风险。",
  author: "VintagePens",
});
const penography = source({
  key: "phase477-penography-duofold-current",
  registryKey: "parkerpens-phase477",
  registryName: "Parker Pens Penography",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "parkerpens-phase477",
  title: "Parker Pens Penography: DUOFOLD",
  url: "https://parkerpens.net/duofold.html",
  summary:
    "Penography 档案展开 1921 生产、Senior/Junior/Lady/De Luxe、帽环与刻字变化、Permanite 色系和流线外形；用于家族导航而非单支鉴定。",
  author: "Parker Pens Penography",
});

const vintageScope: CuratedScope = {
  key: "phase477-vintage-current-review",
  scopeKey: "phase477-vintage-current-review",
  market: "Historical Parker family with current archival review",
  validFrom: RETRIEVED,
  productionState: "historical",
  nibScope:
    "Open Parker nibs; exact size, imprint, grade and replacement history vary by Senior/Junior/Lady/Special and date.",
  materialScope:
    "Early red/black hard rubber and later Permanite/celluloid colour families; discolouration and sac deterioration remain sample-specific.",
  editionScope:
    "1921–1938 family navigation; 1939 Geometric, 1940 Striped and modern Centennial remain separate entities.",
};
const centennialScope: CuratedScope = {
  key: "phase477-centennial-current-review",
  scopeKey: "phase477-centennial-current-review",
  market: "Parker current official US product page",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope:
    "1931381 exact page shows Fine; current selector and exchange page expose F/M and wider Duofold Classic ranges subject to market and edition.",
  materialScope:
    "Classic Black precious resin, 23K gold-plated trims and 18K solid-gold rhodium-plated nib; cap material field is retained separately.",
  editionScope:
    "Modern Classic Centennial Size only; vintage family, International and limited Duofold 100 are linked siblings, not merged specifications.",
};

export const phase477ParkerDuofoldClassicVintageDepthPacks: CuratedEntityPack[] = [
  refresh(
    vintageBase,
    "phase477-parker-duofold-vintage-depth-v1",
    ".planning/content-research/parker-duofold-vintage-phase477.md",
    officialHistory,
    vintageScope,
    [duofoldPress, vintagePens, penography],
    [
      claim(
        officialHistory,
        vintageScope.scopeKey,
        "phase477-vintage-launch-boundary",
        "historical_family_identity",
        "Parker 官方时间线把 Duofold launch 放在 1921；本页覆盖 1921–1938 家族导航，不把 1939 Geometric、1940 Striped 或现代 Centennial 合并进来。",
      ),
      claim(
        vintagePens,
        vintageScope.scopeKey,
        "phase477-vintage-material-evolution",
        "material_evolution",
        "早期红黑 hard rubber button filler 后转向 Parker 称作 Permanite 的彩色材料；Jade、Lapis、Mandarin 与流线分支不能共享统一尺寸或颜色鉴定。",
      ),
      claim(
        penography,
        vintageScope.scopeKey,
        "phase477-vintage-variant-boundary",
        "variant_identification_boundary",
        "Senior、Junior、Lady、Special、Vest Pocket、De Luxe 和 streamlined 由尺寸、帽环、夹、刻字与年代区分；二手照片不足时只保留 family 待鉴状态。",
      ),
      claim(
        vintagePens,
        vintageScope.scopeKey,
        "phase477-vintage-care-boundary",
        "historical_care_boundary",
        "button filler、橡胶囊、hard rubber 与老 Permanite 需要保守维护；不能用现代 cartridge/converter、Parker 保修或 Nib Exchange 条款承诺古董兼容性。",
      ),
    ],
    {
      series_name: "Parker Duofold early family 1921–1938",
      release_year: "1921 official launch; US mainline and overseas continuation are scope-specific",
      origin_country: "Parker official history and specialist archives; individual pen origin requires imprint/record",
      nib: "Open Parker nib; size, imprint, grade and replacement history vary by branch and date",
      fill_system: "Early button filler with rubber sac; later family details vary by period and market",
      material: "Early red/black hard rubber, later Permanite/celluloid families and multiple colours",
      status: "historical family navigation; excludes 1939 Geometric, 1940 Striped and modern Centennial",
    },
    "Phase 477：1921–1938 Duofold 家族与材料、填充、鉴别边界",
    "以官方 1921 时间线、VintagePens 与 Penography 复核 Senior/Junior/Lady 等分支、hard rubber/Permanite 转换和 button filler 维护，不把现代 Centennial 回填历史页。",
  ),
  refresh(
    centennialBase,
    "phase477-parker-duofold-centennial-depth-v1",
    ".planning/content-research/parker-duofold-centennial-phase477.md",
    currentProduct,
    centennialScope,
    [officialHistory, duofoldPress, nibExchange, refills],
    [
      claim(
        currentProduct,
        centennialScope.scopeKey,
        "phase477-centennial-current-spec",
        "current_sku_spec",
        "当前 Classic Black 1931381 为 Centennial Size、precious resin、23K gold-plated trims、18K solid-gold rhodium-plated nib、Fine 页面选择和黑墨；Cap Material 字段写 Acrylic CT，不能擅自合并材料层。",
      ),
      claim(
        officialHistory,
        centennialScope.scopeKey,
        "phase477-centennial-lineage",
        "modern_historical_boundary",
        "现代 Centennial 与 1921 Duofold 通过品牌历史和设计遗产相连；1987 生产/1988 百年推出的复兴路线、当前 Classic 与古董 Senior/Big Red 不互相覆盖。",
      ),
      claim(
        nibExchange,
        centennialScope.scopeKey,
        "phase477-centennial-nib-range",
        "current_nib_exchange_boundary",
        "Parker 当前交换页列 Duofold Classic 的 XXF–XXB 范围，需同值且购买后 28 天内联系零售商；1931381 当前页面的 Fine/Medium 选择不能当成所有限量版库存。",
      ),
      claim(
        refills,
        centennialScope.scopeKey,
        "phase477-centennial-care",
        "current_care_boundary",
        "现代 Classic 采用 Parker cartridge/converter 护理语境：正确吸墨、换墨清洗、凉水处理堵塞和尖向上存放；古董 button filler 不继承这一供墨字段。",
      ),
    ],
    {
      series_name: "Parker Duofold Classic Centennial",
      release_year: "1987 production / 1988 centenary introduction; current SKU verified 2026-08-03",
      origin_country: "Parker official current product and history pages; manufacturing origin not asserted",
      nib: "18K solid-gold bi-tonal rhodium-plated nib; current 1931381 page shows Fine and selector exposes Medium",
      fill_system: "Parker cartridge/converter filling; exact converter inclusion is market/package dependent",
      material: "Current Classic Black precious resin barrel, 23K gold-plated trims and acrylic CT cap field on SKU 1931381",
      status: "current Classic Centennial Size scope; vintage Duofold and International remain separate",
    },
    "Phase 477：现代 Duofold Classic Centennial 1931381 与古董 Big Red 分界",
    "以当前官方 1931381、Parker 历史时间线、2021 百年新闻稿、Nib Exchange 与清洁说明重核 18K 尖、贵树脂、23K 饰件、现代供墨与 vintage 关系。",
  ),
];

if (
  new Set(phase477ParkerDuofoldClassicVintageDepthPacks.map((pack) => pack.entityId)).size !==
  2
) {
  throw new Error("Phase 477 Parker Duofold packs must contain two unique entities.");
}
