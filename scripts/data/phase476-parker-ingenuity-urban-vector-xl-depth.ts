import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase146ParkerPenPacks } from "./phase146-parker-ingenuity-urban-batch";
import { PHASE30_VECTOR_XL_ID } from "./phase30-parker-p0";
import { phase53ParkerVectorXLPacks } from "./phase53-parker-vector-xl";

export const PHASE476_IDS = {
  ingenuity: "b16OmQf7Jwfr",
  urban: "PbA7NulBdLC-",
  vectorXl: PHASE30_VECTOR_XL_ID,
} as const;

const RETRIEVED = "2026-08-03";

function officialSource(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: "parker-official-phase476",
    registryName: "Parker official current product and support pages",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official-phase476",
    title: input.title,
    url: input.url,
    homepageUrl: "https://www.parkerpen.com/",
    itemType: "web_page",
    author: "Parker / Newell Brands",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=exact current SKU;writing type;finish;trim;nib;cap;support fields`,
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

function findBase(entityId: string, label: string): CuratedEntityPack {
  const pack = [
    ...phase146ParkerPenPacks,
    ...phase53ParkerVectorXLPacks,
  ].find((candidate) => candidate.entityId === entityId);
  if (!pack) throw new Error(`Phase 476 ${label} base pack is missing.`);
  return pack;
}

const ingenuityBase = findBase(PHASE476_IDS.ingenuity, "Ingenuity");
const urbanBase = findBase(PHASE476_IDS.urban, "Urban");
const vectorXlBase = findBase(PHASE476_IDS.vectorXl, "Vector XL");

const parkerNibExchange = officialSource({
  key: "phase476-parker-nib-exchange-current",
  title: "Nib Exchange Programme | Parker",
  url: "https://www.parkerpen.com/parker-nib-exchange.html",
  summary:
    "当前官方页面列 Ingenuity 与 Urban 的 Fine/Medium 交换范围，说明同值笔尖购买后 28 天内需联系零售商协调，并注明特别版不一定拥有全部尖幅。",
});
const parkerRefills = officialSource({
  key: "phase476-parker-refills-current",
  title: "Refills and Fountain Pen Care | Parker",
  url: "https://www.parkerpen.com/support?cfid=refills",
  summary:
    "当前官方说明给出 cartridge/converter 吸墨、回滴三滴、凉水清洗、尖向上存放和漏墨/堵塞处理边界。",
});

const ingenuityCurrent = officialSource({
  key: "phase476-parker-ingenuity-2213726-current",
  title: "Ingenuity Fountain Pen | Parker — SKU 2213726",
  url: "https://www.parkerpen.com/writing-types/collections/ingenuity/ingenuity-fountain-pen/SAP_2213726.html",
  summary:
    "当前页面列 2213726、Grey lacquer Gold trim、gold PVD brass/stainless clip、Fine gold-PVD stainless nib、lacquer-on-brass cap、蓝黑墨色与 Fountain/Rollerball/Ballpoint 书写模式分列。",
});
const urbanCurrent = officialSource({
  key: "phase476-parker-urban-1931593-current",
  title: "Urban Fountain Pen | Parker — SKU 1931593",
  url: "https://www.parkerpen.com/writing-types/collections/urban/urban-fountain-pen/SP_1417014.html",
  summary:
    "当前页面列 1931593、Muted Black Gold Trim、Lacquer GT、stainless-steel nib、lacquer-on-brass cap、QUINK cartridge/瓶墨转换与随附 long blue cartridge。",
});
const vectorXlCurrent = officialSource({
  key: "phase476-parker-vector-xl-2159744-current",
  title: "Vector XL Fountain Pen | Parker — SKU 2159744",
  url: "https://www.parkerpen.com/writing-types/collections/vector-xl/vector-xl-fountain-pen/SP_1417056.html",
  summary:
    "当前页面列 2159744、Black Chrome Trim、Stainless Steel CT、stainless-steel cap/nib、large nib、satin metallic black、transparent shell 描述与 Medium 选择。",
});

const ingenuityScope: CuratedScope = {
  key: "phase476-ingenuity-current",
  scopeKey: "phase476-ingenuity-current",
  market: "Parker current official US product page",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope:
    "2213726 exact page lists Fine; current Parker exchange page exposes Fine/Medium for Ingenuity, subject to region and retailer.",
  materialScope:
    "Grey lacquer, gold PVD brass trims and stainless clip, gold-PVD stainless nib and lacquer-on-brass cap; no precious-metal inference.",
  editionScope:
    "Modern conventional Ingenuity Fountain Pen only; Rollerball, Ballpoint and earlier 5TH Technology remain separate writing modes.",
};
const urbanScope: CuratedScope = {
  key: "phase476-urban-current",
  scopeKey: "phase476-urban-current",
  market: "Parker current official US product page",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope:
    "1931593 page shows Fine; Parker exchange page lists Fine/Medium for Urban, with special-edition availability caveat.",
  materialScope:
    "Muted black lacquer, gold-finish trim, lacquer-on-brass cap and engraved stainless-steel fountain nib; Urban ballpoint materials excluded.",
  editionScope:
    "Current Urban fountain-pen SKU family; finish and package combinations remain SKU-specific.",
};
const vectorXlScope: CuratedScope = {
  key: "phase476-vector-xl-current",
  scopeKey: "phase476-vector-xl-current",
  market: "Parker current official US product page",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope:
    "2159744 page shows Medium selector; other Vector XL F/M SKUs stay as market variants and do not overwrite the black SKU.",
  materialScope:
    "Satin metallic black finish, stainless-steel cap/nib and chrome trim; transparent shell is an exact-page appearance statement, not a universal XL construction claim.",
  editionScope:
    "Modern Vector XL fountain pen only; classic slim Vector, rollerball and ballpoint writing modes remain separate.",
};

export const phase476ParkerIngenuityUrbanVectorXlDepthPacks: CuratedEntityPack[] = [
  refresh(
    ingenuityBase,
    "phase476-parker-ingenuity-depth-v1",
    ".planning/content-research/parker-ingenuity-phase476.md",
    ingenuityCurrent,
    ingenuityScope,
    [parkerNibExchange, parkerRefills],
    [
      claim(
        ingenuityCurrent,
        ingenuityScope.scopeKey,
        "phase476-ingenuity-current-spec",
        "current_sku_spec",
        "Parker 当前 2213726 为 Grey lacquer Gold trim，gold PVD brass trims/stainless clip，gold-PVD stainless Fine nib 与 lacquer-on-brass cap；蓝黑墨色选择和地区库存仍绑定该页面。",
      ),
      claim(
        ingenuityCurrent,
        ingenuityScope.scopeKey,
        "phase476-ingenuity-writing-mode",
        "writing_mode_boundary",
        "现代 Ingenuity Fountain Pen 与同系列 Rollerball、Ballpoint 分列；2011 前后 5TH Technology 的替芯与机构不回填为本页 conventional fountain pen 规格。",
      ),
      claim(
        parkerNibExchange,
        ingenuityScope.scopeKey,
        "phase476-ingenuity-nib-exchange",
        "nib_exchange_boundary",
        "当前 Parker 交换页把 Ingenuity 列为 Fine/Medium，通常需同值且在购买后 28 天内通过零售商协调；特别版和二手笔不自动享有相同条件。",
      ),
      claim(
        parkerRefills,
        ingenuityScope.scopeKey,
        "phase476-ingenuity-care",
        "current_care_boundary",
        "Parker 通用说明要求 cartridge/converter 正确吸墨、换墨清洗、凉水处理堵塞并尖向上存放；这些是钢笔护理，不是 5TH 或圆珠笔 refill 说明。",
      ),
    ],
    {
      series_name: "Parker Ingenuity Fountain Pen",
      release_year: "2023+ current conventional fountain-pen family; exact SKU verified 2026-08-03",
      origin_country: "Parker official current product page; manufacturing origin not asserted",
      nib: "Fine stainless steel nib with gold PVD; current page also exposes Medium selector",
      fill_system: "Parker fountain-pen cartridge/converter guidance; exact 2213726 box contents require regional confirmation",
      material: "Grey lacquer on cap/barrel; gold PVD on brass trims and stainless-steel clip; lacquer on brass cap",
      status: "current exact SKU scope; availability and warranty region-dependent",
    },
    "Phase 476：Ingenuity 2213726 现行钢笔与书写模式边界",
    "以当前官方 SKU、nib exchange 与清洁说明重核 Ingenuity 的灰漆金饰、镀金不锈钢尖、常规钢笔供墨，并隔离 Rollerball、Ballpoint 与旧 5TH Technology。",
  ),
  refresh(
    urbanBase,
    "phase476-parker-urban-depth-v1",
    ".planning/content-research/parker-urban-phase476.md",
    urbanCurrent,
    urbanScope,
    [parkerNibExchange, parkerRefills],
    [
      claim(
        urbanCurrent,
        urbanScope.scopeKey,
        "phase476-urban-current-spec",
        "current_sku_spec",
        "Parker 当前 1931593 为 Muted Black Gold Trim、Lacquer GT、stainless-steel nib、lacquer-on-brass cap；产品描述列 QUINK cartridge/瓶墨转换和 long blue cartridge 随附。",
      ),
      claim(
        urbanCurrent,
        urbanScope.scopeKey,
        "phase476-urban-writing-mode",
        "writing_mode_boundary",
        "Urban Fountain Pen 的 QUINK 墨囊／converter 语境与 Urban 圆珠笔的 Quinkflow refill 分开；不同 finish、套装和圆珠笔不能回填钢笔规格。",
      ),
      claim(
        parkerNibExchange,
        urbanScope.scopeKey,
        "phase476-urban-nib-exchange",
        "nib_exchange_boundary",
        "当前 Parker 交换页把 Urban 列为 Fine/Medium，交换需同值并在购买后 28 天内联系零售商；特别版尖幅可能不全。",
      ),
      claim(
        parkerRefills,
        urbanScope.scopeKey,
        "phase476-urban-care",
        "current_care_boundary",
        "Parker 通用说明支持 Urban 的墨囊／转换器吸墨、凉水清洗、换墨排空和尖向上存放；曲线漆面不得用研磨物或强溶剂维护。",
      ),
    ],
    {
      series_name: "Parker Urban Fountain Pen",
      release_year: "current post-2016 catalogue scope; exact SKU verified 2026-08-03",
      origin_country: "Parker official current product page; manufacturing origin not asserted",
      nib: "Engraved stainless-steel fountain-pen nib; current 1931593 page shows Fine",
      fill_system: "QUINK ink cartridge or Parker cartridge/converter bottle filling",
      material: "Muted black lacquer with gold trim; lacquer on brass cap; stainless-steel nib",
      status: "current exact SKU scope; finish, stock and warranty region-dependent",
    },
    "Phase 476：Urban 1931593 曲线笔身、QUINK 与钢笔身份边界",
    "以当前官方 SKU、nib exchange 与清洁说明重核 Muted Black Gold Trim、漆面黄铜帽、不锈钢尖、长蓝墨囊和瓶墨转换，并隔离圆珠笔 Quinkflow。",
  ),
  refresh(
    vectorXlBase,
    "phase476-parker-vector-xl-depth-v1",
    ".planning/content-research/parker-vector-xl-phase476.md",
    vectorXlCurrent,
    vectorXlScope,
    [parkerRefills],
    [
      claim(
        vectorXlCurrent,
        vectorXlScope.scopeKey,
        "phase476-vector-xl-current-spec",
        "current_sku_spec",
        "Parker 当前 2159744 为 Black Chrome Trim、Stainless Steel CT、stainless-steel cap/nib，页面显示 Medium selector，并以 large nib 与 transparent shell 描述现代 XL 外观。",
      ),
      claim(
        vectorXlCurrent,
        vectorXlScope.scopeKey,
        "phase476-vector-xl-classic-boundary",
        "family_identity_boundary",
        "Vector XL 是独立的大直径现代家族；1984 起的经典 slim Vector、老 Flighter、不同市场刻字和历史尺寸不能作为 2159744 规格。",
      ),
      claim(
        parkerRefills,
        vectorXlScope.scopeKey,
        "phase476-vector-xl-care",
        "current_care_boundary",
        "Parker 通用说明覆盖 XL 的 cartridge/converter 吸墨、凉水清洗和尖向上存放；透明 shell 不是可自行拆解或用硬物刮洗的观察窗。",
      ),
      claim(
        vectorXlCurrent,
        vectorXlScope.scopeKey,
        "phase476-vector-xl-variant-boundary",
        "market_variant_boundary",
        "Black CT 2159744 的 Medium、Teal/Silver/Lilac 等其他 F/M SKU 与透明／finish 描述按具体商品号记录，不把一个颜色的帽身材料和尺寸外推到全家族。",
      ),
    ],
    {
      series_name: "Parker Vector XL Fountain Pen",
      release_year: "current Vector XL catalogue scope; exact SKU verified 2026-08-03",
      origin_country: "Parker official current product page; manufacturing origin not asserted",
      nib: "Large stainless-steel fountain-pen nib; current 2159744 page shows Medium selector",
      fill_system: "Parker fountain-pen cartridge/converter guidance; converter availability is SKU/region dependent",
      material: "Satin metallic black finish, stainless-steel cap and chrome trim; transparent shell shown in product description",
      status: "current exact SKU scope; not the historical slim Vector family",
    },
    "Phase 476：Vector XL 2159744 与经典 Vector 的规格分叉",
    "以当前官方 SKU 和清洁说明重核 Black CT、large stainless-steel nib、Stainless Steel cap、transparent shell 与 F/M 变体边界，不把经典 Vector 的老图和尺寸回填。",
  ),
];

if (
  new Set(phase476ParkerIngenuityUrbanVectorXlDepthPacks.map((pack) => pack.entityId)).size !==
  3
) {
  throw new Error("Phase 476 Parker packs must contain three unique entities.");
}
