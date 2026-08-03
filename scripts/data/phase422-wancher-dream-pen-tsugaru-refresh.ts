import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE364_TARGETS,
  PHASE364_WANCHER_BRAND_ID,
  phase364WancherDreamPenTsugaruPacks,
} from "./phase364-wancher-dream-pen-tsugaru";

export const PHASE422_WANCHER_BRAND_ID = PHASE364_WANCHER_BRAND_ID;
export const PHASE422_TARGETS = PHASE364_TARGETS;
export const PHASE422_TARGET_IDS = Object.values(PHASE422_TARGETS).map(
  (target) => target.id,
);

const RETRIEVED = "2026-08-03";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  independenceGroup: string;
  homepageUrl: string;
  tier?: CuratedSource["tier"];
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType: "official",
    tier: input.tier ?? "professional_secondary",
    independenceGroup: input.independenceGroup,
    homepageUrl: input.homepageUrl,
    itemType: "web_page",
    author: input.registryName,
    publishedAt: null,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const EXTRA_SOURCES: CuratedSource[] = [
  source({
    key: "phase422-wancher-global-tsugaru-collection",
    registryKey: "wancher-global-tsugaru-collection-phase422",
    registryName: "Wancher official",
    title: "Dream Pen Tsugaru collection",
    url: "https://www.wancherpen.com/collections/dream-pen-tsugaru",
    homepageUrl: "https://www.wancherpen.com/",
    independenceGroup: "wancher-global-tsugaru-phase422",
    tier: "primary",
    summary:
      "Wancher global collection 将 Tsugaru Dream Pen 的 Kara-nuri、Raden Kara-nuri 与 Nanako-nuri 作为不同工艺入口；用于家族分流，不替 exact SKU 提供尺寸或库存。",
  }),
  source({
    key: "phase422-wancher-dream-pen-collection",
    registryKey: "wancher-japan-dream-pen-collection-phase422",
    registryName: "Wancher Japan official",
    title: "ドリームペンコレクション",
    url: "https://jp.wancherpen.com/collections/dream-pen",
    homepageUrl: "https://jp.wancherpen.com/",
    independenceGroup: "wancher-japan-dream-pen-phase422",
    tier: "primary",
    summary:
      "Wancher Japan Dream Pen collection 将 ebonite、urushi 和不同漆艺路线分开展示；用于确认 Tsugaru SKU 仍属于 Dream Pen 导航，不把品牌级文案当成单支规格。",
  }),
  source({
    key: "phase422-aomori-tourism-tsugaru-nuri",
    registryKey: "aomori-official-tourism-tsugaru-nuri-phase422",
    registryName: "Amazing AOMORI official travel guide",
    title: "Tsugaru-nuri Lacquerware",
    url: "https://aomori-tourism.com/en/gourmet/detail_9355.html",
    homepageUrl: "https://aomori-tourism.com/en/",
    independenceGroup: "aomori-tourism-tsugaru-phase422",
    summary:
      "青森官方旅游资料给出津轻涂三百年以上的地区背景和 1873 年维也纳世界博览会传播节点；用于历史上下文，不用来证明钢笔的制造年份。",
  }),
  source({
    key: "phase422-tokyo-traditional-crafts-tsugaru",
    registryKey: "tokyo-metropolitan-traditional-crafts-tsugaru-phase422",
    registryName: "Tokyo Metropolitan Government traditional crafts guide",
    title: "Tsugaru Nuri",
    url: "https://www.dento-tokyo.metro.tokyo.lg.jp/english/items/66.html",
    homepageUrl: "https://www.dento-tokyo.metro.tokyo.lg.jp/english/",
    independenceGroup: "tokyo-traditional-crafts-tsugaru-phase422",
    summary:
      "东京传统工艺资料从地区与纹样角度交叉解释 Kara-nuri 与 Nanako-nuri；只作术语和比较来源，不替 Wancher exact page 添加未知材料。",
  }),
  source({
    key: "phase422-aomori-tsugaru-process-pdf",
    registryKey: "aomori-prefecture-tsugaru-process-pdf-phase422",
    registryName: "Aomori Prefecture official",
    title: "Tsugaru-nuri traditional craft English guide",
    url: "https://www.pref.aomori.lg.jp/soshiki/kenmin/ch-renkei/files/nuri-eng.pdf",
    homepageUrl: "https://www.pref.aomori.lg.jp/",
    independenceGroup: "aomori-prefecture-tsugaru-pdf-phase422",
    summary:
      "青森县资料补充津轻涂反复涂层、研磨和地区工艺的官方背景；不得将漆器生产步骤直接当作每支钢笔的逐支生产记录。",
  }),
];

const BASE_MODELS = phase364WancherDreamPenTsugaruPacks.filter(
  (pack) => pack.expectedType === "pen",
);
const BASE_BRAND = phase364WancherDreamPenTsugaruPacks.find(
  (pack) => pack.expectedType === "brand",
);
if (!BASE_BRAND) throw new Error("Phase 422 Wancher brand pack is missing.");

function refreshedPack(base: CuratedEntityPack): CuratedEntityPack {
  const targetEntry = Object.entries(PHASE422_TARGETS).find(
    ([, candidate]) => candidate.id === base.entityId,
  );
  if (!targetEntry) throw new Error(`Phase 422 target missing for ${base.entityId}`);
  const [targetKey, target] = targetEntry;
  const pack = structuredClone(base);
  const scopeKey = `phase422-wancher-tsugaru-${target.slug}`;
  const unknownScopeKey = `${scopeKey}-unknown-fields`;
  pack.key = `phase422-wancher-dream-pen-tsugaru-${target.slug}-refresh-v1`;
  pack.markdownFile = `.planning/content-research/${
    targetKey === "nanako"
      ? "wancher-dream-pen-tsugaru-nanako-phase422.md"
      : targetKey === "raden"
        ? "wancher-dream-pen-tsugaru-raden-midori-age-phase422.md"
        : "wancher-dream-pen-tsugaru-shiro-age-phase422.md"
  }`;
  pack.storyTitle = `${base.storyTitle}：版本边界、工艺证据与日常使用深化`;
  pack.sources = [
    ...pack.sources,
    ...EXTRA_SOURCES,
  ].filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  pack.scopes = [
    ...pack.scopes,
    {
      key: scopeKey,
      scopeKey,
      market: "Wancher Dream Pen Tsugaru Urushi current evidence refresh",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: `${base.canonicalName} only; sibling Tsugaru SKUs remain separate entities`,
    },
    {
      key: unknownScopeKey,
      scopeKey: unknownScopeKey,
      productionState: "unknown",
      editionScope:
        "Exact product pages still do not publish independent dimensions, net weight, launch year or fixed inventory; do not inherit sibling values.",
    },
  ];
  const exactKey = pack.primarySourceKey;
  pack.claims = [
    ...pack.claims,
    {
      key: `${scopeKey}-history`,
      predicate: "craft_history_context",
      objectText:
        "津轻涂以青森弘前为中心，历史可追溯至江户时代；官方青森资料还记录 1873 年维也纳世界博览会的传播节点。这是工艺地域背景，不是本支钢笔的发行年份。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase422-aomori-tourism-tsugaru-nuri",
      locator: "Aomori official history and Vienna exposition context",
      evidence: [
        {
          key: `${scopeKey}-history-evidence`,
          sourceKey: "phase422-aomori-tourism-tsugaru-nuri",
          scopeKey,
          locator: "regional history and 1873 exposition",
        },
      ],
    },
    {
      key: `${scopeKey}-process-boundary`,
      predicate: "craft_process_boundary",
      objectText:
        "Kara-nuri 与 Nanako-nuri 的公开工艺说明涉及多次涂漆、干燥、研磨或菜种形成圆环；这些来源解释技法，不证明 Wancher 钢笔逐支采用完整漆器流程、固定层数或公开工匠姓名。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase422-aomori-tsugaru-process-pdf",
      locator: "Aomori official process guide and technique boundary",
      evidence: [
        {
          key: `${scopeKey}-process-evidence`,
          sourceKey: "phase422-aomori-tsugaru-process-pdf",
          scopeKey,
          locator: "repeated lacquering, grinding and polishing",
        },
      ],
    },
    {
      key: `${scopeKey}-family-boundary`,
      predicate: "family_identity_boundary",
      objectText:
        "Wancher global 与 Japan collection 将本 SKU 与其他 Tsugaru 工艺入口并列；同一 Dream Pen 家族不意味着共享颜色、纹理、尺寸、尖幅、库存或包装。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase422-wancher-global-tsugaru-collection",
      locator: "global Tsugaru collection product cards",
      evidence: [
        {
          key: `${scopeKey}-family-evidence`,
          sourceKey: "phase422-wancher-global-tsugaru-collection",
          scopeKey,
          locator: "separate Kara-nuri, Raden and Nanako product entries",
        },
      ],
    },
    {
      key: `${scopeKey}-care-deepened`,
      predicate: "maintenance_boundary",
      objectText:
        "漆面应避免长期直射紫外线、极端干燥、骤冷骤热、摩擦和钢丝刷；清洁只在外部使用柔软布，发现崩漆、裂纹、起泡、螺纹卡涩或帽口损伤时停止加力并交由漆面维修者检查。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase422-tokyo-traditional-crafts-tsugaru",
      locator: "traditional lacquer care and surface damage boundary",
      evidence: [
        {
          key: `${scopeKey}-care-evidence`,
          sourceKey: "phase422-tokyo-traditional-crafts-tsugaru",
          scopeKey,
          locator: "care, light, humidity and abrasion guidance",
        },
      ],
    },
    {
      key: `${scopeKey}-selection-deepened`,
      predicate: "purchase_verification",
      objectText:
        "选购时同时核对 exact SKU 标题、工艺词、笔身实拍、尖面刻字、feed、converter、包装和订单日期；卖家只提供相邻 Tsugaru SKU 的宣传图时，型号应保持待核。",
      factClass: "editorial",
      confidence: 0.94,
      sourceKey: exactKey,
      locator: "exact SKU and order verification boundary",
      evidence: [
        {
          key: `${scopeKey}-selection-evidence`,
          sourceKey: exactKey,
          scopeKey,
          locator: "exact product page option and accessory menu",
        },
      ],
    },
  ];
  if (!pack.spec) throw new Error(`Phase 422 spec missing for ${base.entityId}`);
  const baseSpec = pack.spec;
  pack.spec = {
    ...baseSpec,
    values: {
      ...pack.spec.values,
      status: `${base.canonicalName}：exact product listing and craft boundary reviewed ${RETRIEVED}; price, inventory and accessories remain mutable`,
    },
    evidence: [
      ...pack.spec.evidence,
      {
        key: `${scopeKey}-spec-history`,
        fieldKey: "status",
        sourceKey: "phase422-wancher-global-tsugaru-collection",
        scopeKey,
        locator: "separate global collection entries",
        qualifies: true,
      },
    ],
  };
  return pack;
}

export const phase422WancherDreamPenTsugaruRefreshPacks: CuratedEntityPack[] =
  [structuredClone(BASE_BRAND), ...BASE_MODELS.map(refreshedPack)];
