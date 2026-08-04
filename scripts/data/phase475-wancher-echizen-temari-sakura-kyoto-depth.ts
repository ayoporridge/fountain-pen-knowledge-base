import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE138_IDS,
  phase138WancherRegionalUrushiPacks,
} from "./phase138-wancher-regional-urushi-batch";

export const PHASE475_IDS = {
  temari: PHASE138_IDS.temari,
  sakuraZukiyo: PHASE138_IDS.sakuraZukiyo,
  kyotoUme: PHASE138_IDS.kyotoUme,
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
    registryKey: "wancher-official-phase475",
    registryName: "Wancher official product pages",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-phase475",
    title: input.title,
    url: input.url,
    homepageUrl: "https://www.wancherpen.com/",
    itemType: "web_page",
    author: "Wancher",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=exact product title;materials;technique;filling;nib;feed;cap;packaging fields`,
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
    sources: [...base.sources, current],
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
  const pack = phase138WancherRegionalUrushiPacks.find(
    (candidate) => candidate.entityId === entityId,
  );
  if (!pack) throw new Error(`Phase 475 ${label} base pack is missing.`);
  return pack;
}

const temariBase = base(PHASE475_IDS.temari, "Temari");
const sakuraBase = base(PHASE475_IDS.sakuraZukiyo, "Sakura Zukiyo");
const kyotoBase = base(PHASE475_IDS.kyotoUme, "Kyoto Ume");

const temariCurrent = officialSource({
  key: "phase475-temari-official-current",
  title: "Dream Pen Echizen Urushi - Temari | Wancher",
  url: "https://www.wancherpen.com/products/dream-pen-echizen-urushi-temari",
  summary:
    "当前商品页明确 ABS、Echizen Urushi、Kindai Maki-e screen print、国际 C/C、#6 JoWo/Wancher 18K/Keiryu、三种 feed 与 compact air-tight cap，并列出 converter、cartridge、木盒和 pen kimono。",
});
const sakuraCurrent = officialSource({
  key: "phase475-sakura-zukiyo-official-current",
  title: "Dream Pen Echizen Urushi - Sakura Zukiyo | Wancher",
  url: "https://www.wancherpen.com/products/dream-pen-echizen-urushi-sakura-zukiyo",
  summary:
    "当前商品页明确 ABS、Echizen Urushi、Kindai Maki-e、国际 C/C、#6 JoWo/Wancher 18K/Shogun 18K、塑料与 ebonite feed、airtight cap 和随附件。",
});
const kyotoCurrent = officialSource({
  key: "phase475-kyoto-ume-official-current",
  title: "Kyoto Urushi Kasane-iro - Ume | Wancher",
  url: "https://www.wancherpen.com/products/kyoto-urushi-ume",
  summary:
    "当前商品页明确 ebonite/Kyoto Urushi Ume、国际 C/C、#6 JoWo/Wancher 18K/Keiryu/Keiryu Kodachi、三种 clip 选项，并说明 ebonite feed 只兼容 JoWo nib。",
});

const temariScope: CuratedScope = {
  key: "phase475-temari-current",
  scopeKey: "phase475-temari-current",
  market: "Wancher current exact product page",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope:
    "Current Temari order menu: #6 JoWo stainless steel, Wancher 18K gold or Keiryu; feed choices are separately listed.",
  materialScope:
    "ABS base with Echizen Urushi and the page's Kindai Maki-e screen-print description; no sibling material inheritance.",
  editionScope:
    "Exact Temari SKU only; Sakura Zukiyo, Omoide Sakura and other regional Dream Pen siblings remain separate.",
};
const sakuraScope: CuratedScope = {
  key: "phase475-sakura-zukiyo-current",
  scopeKey: "phase475-sakura-zukiyo-current",
  market: "Wancher current exact product page",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope:
    "Current Sakura Zukiyo order menu: #6 JoWo stainless steel, Wancher 18K gold or Shogun 18K; feed choices are separate order options.",
  materialScope:
    "ABS base with Echizen Urushi and Kindai Maki-e; Omoide Sakura's ebonite/Oshita Maki-e does not transfer.",
  editionScope:
    "Exact Sakura Zukiyo SKU and its moonlit-sakura motif; Temari and Omoide Sakura remain sibling entries.",
};
const kyotoScope: CuratedScope = {
  key: "phase475-kyoto-ume-current",
  scopeKey: "phase475-kyoto-ume-current",
  market: "Wancher current exact product page",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope:
    "Current Kyoto Ume order menu: #6 JoWo stainless steel, Wancher 18K, Keiryu or Keiryu Kodachi; ebonite feed is explicitly JoWo-only.",
  materialScope:
    "Ebonite base with Kyoto Urushi Ume design; Echizen ABS siblings do not supply this material field.",
  editionScope:
    "Exact Kyoto Urushi Kasane-iro - Ume SKU, including no/chrome/gold clip choices; historical inspiration is not a release date.",
};

export const phase475WancherEchizenTemariSakuraKyotoDepthPacks: CuratedEntityPack[] = [
  refresh(
    temariBase,
    "phase475-wancher-temari-depth-v1",
    ".planning/content-research/wancher-echizen-temari-phase475.md",
    temariCurrent,
    temariScope,
    [
      claim(
        temariCurrent,
        temariScope.scopeKey,
        "phase475-temari-material-technique",
        "current_material_technique_boundary",
        "当前页面将 Temari 写为 ABS、Echizen Urushi 与 Kindai Maki-e screen print；屏印限定不支持扩写为全手绘高莳绘或臆造漆层数量。",
      ),
      claim(
        temariCurrent,
        temariScope.scopeKey,
        "phase475-temari-configuration",
        "current_order_configuration",
        "当前页面列国际 C/C、#6 JoWo stainless steel、Wancher 18K gold、Keiryu，以及 plastic、black ebonite、red ebonite feed 选项；它们是订单选择，不表示同时装配。",
      ),
      claim(
        temariCurrent,
        temariScope.scopeKey,
        "phase475-temari-cap-packaging",
        "current_cap_packaging",
        "页面列 compact air-tight cap，并描述 converter、cartridge、木盒、pen kimono 和说明材料随附；库存与地区组合仍须按下单页确认。",
      ),
      claim(
        temariCurrent,
        temariScope.scopeKey,
        "phase475-temari-sibling-identity",
        "sibling_identity_boundary",
        "Temari 与 Sakura Zukiyo 同属越前漆/Kindai Maki-e 语境，但图案与商品标题不同；Omoide Sakura 则是 ebonite/Oshita Maki-e，不能合并为 Temari 变体。",
      ),
    ],
    {
      series_name: "Wancher Dream Pen Echizen Urushi Temari",
      release_year: "current exact listing verified 2026-08-03; launch year not asserted",
      origin_country: "Wancher exact product listing; Echizen craft context",
      nib: "#6 JoWo stainless steel, Wancher 18K gold or Keiryu by exact order",
      fill_system: "European International Standard cartridge/converter",
      material: "ABS base, Echizen Urushi and Kindai Maki-e screen-print decoration",
      status: "current exact SKU scope",
    },
    "Phase 475：Temari 的 ABS、越前漆、屏印与订单配置",
    "以当前 exact product page 重核 Temari 的基体、Kindai Maki-e screen-print 限定、C/C、笔尖/feed、帽盖和随附件，并保留 Sakura Zukiyo/Omoide Sakura 的身份边界。",
  ),
  refresh(
    sakuraBase,
    "phase475-wancher-sakura-zukiyo-depth-v1",
    ".planning/content-research/wancher-echizen-sakura-zukiyo-phase475.md",
    sakuraCurrent,
    sakuraScope,
    [
      claim(
        sakuraCurrent,
        sakuraScope.scopeKey,
        "phase475-sakura-material-technique",
        "current_material_technique_boundary",
        "当前页面将 Sakura Zukiyo 写为 ABS、Echizen Urushi 与 Kindai Maki-e；月夜樱图案与屏印术语是本 SKU 的辨识边界。",
      ),
      claim(
        sakuraCurrent,
        sakuraScope.scopeKey,
        "phase475-sakura-configuration",
        "current_order_configuration",
        "当前页面列国际 C/C、#6 JoWo stainless steel、Wancher 18K gold、Shogun 18K，以及 plastic、black ebonite、red ebonite feed 选项；选项不能被当成单支笔的同时配置。",
      ),
      claim(
        sakuraCurrent,
        sakuraScope.scopeKey,
        "phase475-sakura-cap-packaging",
        "current_cap_packaging",
        "页面描述 compact air-tight cap 与 converter、cartridge、木盒、pen kimono 等随附件；商业库存、颜色和地区包装要回到当前订单复核。",
      ),
      claim(
        sakuraCurrent,
        sakuraScope.scopeKey,
        "phase475-sakura-sibling-identity",
        "sibling_identity_boundary",
        "Sakura Zukiyo 是独立 exact SKU；Temari 的手毬图案和 Omoide Sakura 的 ebonite/Oshita Maki-e 不应并入本页，也不应据相似漆名重建实体。",
      ),
    ],
    {
      series_name: "Wancher Dream Pen Echizen Urushi Sakura Zukiyo",
      release_year: "current exact listing verified 2026-08-03; launch year not asserted",
      origin_country: "Wancher exact product listing; Echizen craft context",
      nib: "#6 JoWo stainless steel, Wancher 18K gold or Shogun 18K by exact order",
      fill_system: "European International Standard cartridge/converter",
      material: "ABS base, Echizen Urushi and Kindai Maki-e",
      status: "current exact SKU scope",
    },
    "Phase 475：Sakura Zukiyo 的月夜樱图案与越前漆边界",
    "以当前 exact product page 重核 Sakura Zukiyo 的 ABS、Echizen Urushi、Kindai Maki-e、C/C、尖/feed、帽盖与随附件，并与 Temari、Omoide Sakura 分开。",
  ),
  refresh(
    kyotoBase,
    "phase475-wancher-kyoto-ume-depth-v1",
    ".planning/content-research/wancher-kyoto-ume-phase475.md",
    kyotoCurrent,
    kyotoScope,
    [
      claim(
        kyotoCurrent,
        kyotoScope.scopeKey,
        "phase475-kyoto-material-technique",
        "current_material_technique_boundary",
        "当前页面将 Kyoto Ume 写为 ebonite 基体与 Kyoto Urushi Ume 设计；京都地域语境不应把它改写成 Echizen ABS 或其他漆面 SKU。",
      ),
      claim(
        kyotoCurrent,
        kyotoScope.scopeKey,
        "phase475-kyoto-configuration",
        "current_order_configuration",
        "当前页面列国际 C/C、#6 JoWo stainless steel、Wancher 18K、Keiryu、Keiryu Kodachi，以及 no clip、chrome clip、gold clip 选项。",
      ),
      claim(
        kyotoCurrent,
        kyotoScope.scopeKey,
        "phase475-kyoto-feed-compatibility",
        "feed_compatibility_boundary",
        "页面明确 ebonite feed 只与 JoWo nib 兼容；因此特殊 feed 不是通用替换件，购买与清洗时必须连同确切笔尖配置判断。",
      ),
      claim(
        kyotoCurrent,
        kyotoScope.scopeKey,
        "phase475-kyoto-sibling-identity",
        "sibling_identity_boundary",
        "Kyoto Urushi Kasane-iro - Ume 是独立 Kyoto SKU；Temari 与 Sakura Zukiyo 的 ABS/Echizen/Kindai Maki-e 字段不可倒灌，历史审美灵感也不等于现代发布年份。",
      ),
    ],
    {
      series_name: "Wancher Dream Pen Kyoto Urushi Kasane no Iro Ume",
      release_year: "current exact listing verified 2026-08-03; historical inspiration is not release history",
      origin_country: "Wancher exact product listing; Kyoto lacquerware context",
      nib: "#6 JoWo stainless steel, Wancher 18K, Keiryu or Keiryu Kodachi by exact order",
      fill_system: "European International Standard cartridge/converter",
      material: "ebonite base with Kyoto Urushi Ume design",
      status: "current exact SKU scope",
    },
    "Phase 475：Kyoto Urushi Ume 的基体、feed 兼容与 clip 选项",
    "以当前 exact product page 重核 ebonite/Kyoto Urushi、C/C、四组尖选项、JoWo-only ebonite feed 和 clip 选项，同时隔离越前漆兄弟型号与历史灵感。",
  ),
];

if (
  new Set(phase475WancherEchizenTemariSakuraKyotoDepthPacks.map((pack) => pack.entityId)).size !==
  3
) {
  throw new Error("Phase 475 Wancher Temari/Sakura/Kyoto packs must contain three unique entities.");
}
