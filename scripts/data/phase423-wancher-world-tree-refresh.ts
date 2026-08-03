import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import { phase331WancherWorldTreeEbonyPacks } from "./phase331-wancher-world-tree-ebony";
import { phase332WancherSekaiAiPacks } from "./phase332-wancher-sekai-ai";
import { phase333WancherWorldTreeTeakPacks } from "./phase333-wancher-world-tree-teak";
import { phase334WancherWorldTreeVerawoodPacks } from "./phase334-wancher-world-tree-verawood";
import { phase335WancherWorldTreeSandalwoodPacks } from "./phase335-wancher-world-tree-sandalwood";

export const PHASE423_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE423_TARGETS = {
  ebony: {
    id: "phase331-pen-wancher-world-tree-ebony",
    slug: "wancher-world-tree-ebony",
    name: "Wancher World Tree – Ebony",
  },
  ai: {
    id: "phase332-pen-wancher-sekai-ai",
    slug: "wancher-sekai-ai",
    name: "Wancher Sekai Ai",
  },
  teak: {
    id: "phase333-pen-wancher-world-tree-teak",
    slug: "wancher-world-tree-teak",
    name: "Wancher World Tree – Teak Wood",
  },
  verawood: {
    id: "phase334-pen-wancher-world-tree-verawood",
    slug: "wancher-world-tree-verawood",
    name: "Wancher World Tree – Verawood",
  },
  sandalwood: {
    id: "phase335-pen-wancher-world-tree-sandalwood",
    slug: "wancher-world-tree-sandalwood",
    name: "Wancher World Tree – Sandalwood",
  },
} as const;

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
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType: "official",
    tier: "primary",
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
    key: "phase423-wancher-japan-sekai-collection",
    registryKey: "wancher-japan-sekai-collection-phase423",
    registryName: "Wancher Japan official",
    title: "Sekai Fountain Pen Collection",
    url: "https://jp.wancherpen.com/collections/sekai",
    homepageUrl: "https://jp.wancherpen.com/",
    independenceGroup: "wancher-japan-sekai-phase423",
    summary:
      "Wancher Japan 的 Sekai 集合页用于把 World Tree 木材路线与 Sekai Ai 分开导航，不替具体木种页面增加统一尺寸或库存。",
  }),
  source({
    key: "phase423-wancher-global-world-tree",
    registryKey: "wancher-global-world-tree-collection-phase423",
    registryName: "Wancher official",
    title: "World Tree Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/world-tree",
    homepageUrl: "https://www.wancherpen.com/",
    independenceGroup: "wancher-global-world-tree-phase423",
    summary:
      "Wancher global collection 将 Ebony、Teak、Verawood、Sandalwood 等木材入口并列，支持材料 SKU 分流，不把不同木种合并成一个型号。",
  }),
  source({
    key: "phase423-wancher-japan-dream-pen-collection",
    registryKey: "wancher-japan-dream-pen-collection-phase423",
    registryName: "Wancher Japan official",
    title: "ドリームペンコレクション",
    url: "https://jp.wancherpen.com/collections/dream-pen",
    homepageUrl: "https://jp.wancherpen.com/",
    independenceGroup: "wancher-japan-dream-pen-phase423",
    summary:
      "Wancher Japan Dream Pen 集合页把天然 ebonite、木材与 Urushi 入口分开，支持 World Tree 与 Dream Pen 漆艺身份边界。",
  }),
  source({
    key: "phase423-wancher-global-dream-pen-collection",
    registryKey: "wancher-global-dream-pen-collection-phase423",
    registryName: "Wancher official",
    title: "Dream Pen Collection",
    url: "https://www.wancherpen.com/collections/dream-pen",
    homepageUrl: "https://www.wancherpen.com/",
    independenceGroup: "wancher-global-dream-pen-phase423",
    summary:
      "Wancher global Dream Pen 集合页用于确认品牌级材料与工艺导航；不替 World Tree 具体木种、夹件、尖或实测重量作主源。",
  }),
];

const ALL_PACKS = [
  ...phase331WancherWorldTreeEbonyPacks,
  ...phase332WancherSekaiAiPacks,
  ...phase333WancherWorldTreeTeakPacks,
  ...phase334WancherWorldTreeVerawoodPacks,
  ...phase335WancherWorldTreeSandalwoodPacks,
];
const BASE_MODELS = ALL_PACKS.filter(
  (pack, index, all) =>
    pack.expectedType === "pen" &&
    all.findIndex((candidate) => candidate.entityId === pack.entityId) === index,
);
const BASE_BRAND = ALL_PACKS.find((pack) => pack.expectedType === "brand");
if (!BASE_BRAND) throw new Error("Phase 423 Wancher brand pack is missing.");

const MARKDOWN_FILES: Record<string, string> = {
  [PHASE423_TARGETS.ebony.id]: ".planning/content-research/wancher-world-tree-ebony-phase423.md",
  [PHASE423_TARGETS.ai.id]: ".planning/content-research/wancher-sekai-ai-phase423.md",
  [PHASE423_TARGETS.teak.id]: ".planning/content-research/wancher-world-tree-teak-phase423.md",
  [PHASE423_TARGETS.verawood.id]: ".planning/content-research/wancher-world-tree-verawood-phase423.md",
  [PHASE423_TARGETS.sandalwood.id]: ".planning/content-research/wancher-world-tree-sandalwood-phase423.md",
};

function refreshedPack(base: CuratedEntityPack): CuratedEntityPack {
  const markdownFile = MARKDOWN_FILES[base.entityId];
  if (!markdownFile) throw new Error(`Phase 423 target missing for ${base.entityId}`);
  const pack = structuredClone(base);
  const scopeKey = `phase423-wancher-world-tree-${base.entityId}`;
  pack.key = `phase423-wancher-world-tree-${base.entityId}-refresh-v1`;
  pack.markdownFile = markdownFile;
  pack.storyTitle = `${base.storyTitle}：木材、夹件、供墨与版本边界深化`;
  pack.sources = [...pack.sources, ...EXTRA_SOURCES].filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  pack.scopes = [
    ...pack.scopes,
    {
      key: scopeKey,
      scopeKey,
      market: "Wancher Sekai / World Tree current evidence refresh",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: `${base.canonicalName} only; other wood and Urushi SKUs remain separate entities`,
    },
  ];
  pack.claims = [
    ...pack.claims,
    {
      key: `${scopeKey}-material-boundary`,
      predicate: "material_identity_boundary",
      objectText:
        "World Tree 的木种、Sekai Ai 的蓝染/装饰和 Dream Pen 的漆艺路线必须按 exact product page 分开；同一系列导航不代表共享颜色、密度、重量、夹件或图片。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase423-wancher-global-world-tree",
      locator: "separate World Tree wood product entries",
      evidence: [
        {
          key: `${scopeKey}-material-evidence`,
          sourceKey: "phase423-wancher-global-world-tree",
          scopeKey,
          locator: "World Tree collection product cards",
        },
      ],
    },
    {
      key: `${scopeKey}-configuration-boundary`,
      predicate: "configuration_boundary",
      objectText:
        "925 matte/silver clip、无夹、#6 JoWo stainless、Wancher 18K、Keiyu/Kodachi、feed 和 C/C 是 exact page 的订单或配置轴；实际装配、尖幅和夹件必须回到订单与实物，不从颜色推断。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: base.primarySourceKey,
      locator: "exact product options and package fields",
      evidence: [
        {
          key: `${scopeKey}-configuration-evidence`,
          sourceKey: base.primarySourceKey,
          scopeKey,
          locator: "clip, nib, feed and converter options",
        },
      ],
    },
    {
      key: `${scopeKey}-wood-care`,
      predicate: "wood_care",
      objectText:
        "天然木材不是防水或免维护材料；应避开高温、极端干燥、浸泡、酒精、强清洁剂和研磨剂，使用柔软布轻拭，出现裂线、起皮、异常发白或夹件松动时停止自行抛光和强拆。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: base.primarySourceKey,
      locator: "official wooden pen care boundary",
      evidence: [
        {
          key: `${scopeKey}-care-evidence`,
          sourceKey: base.primarySourceKey,
          scopeKey,
          locator: "wood surface care and clip handling",
        },
      ],
    },
    {
      key: `${scopeKey}-selection-deepened`,
      predicate: "purchase_verification",
      objectText:
        "选购时核对 exact wood SKU、夹件状态、尖材与尖幅、feed、converter、盒标和订单；系列参考尺寸只用于比例，不替代具体笔的实测条件。",
      factClass: "editorial",
      confidence: 0.94,
      sourceKey: base.primarySourceKey,
      locator: "exact SKU and order verification boundary",
      evidence: [
        {
          key: `${scopeKey}-selection-evidence`,
          sourceKey: base.primarySourceKey,
          scopeKey,
          locator: "current product options and mutable inventory",
        },
      ],
    },
  ];
  if (!pack.spec) throw new Error(`Phase 423 spec missing for ${base.entityId}`);
  const baseSpec = pack.spec;
  pack.spec = {
    ...baseSpec,
    values: {
      ...baseSpec.values,
      status: `${base.canonicalName}：exact wood SKU and World Tree/Sekai boundary reviewed ${RETRIEVED}; price, inventory and natural grain remain mutable`,
    },
    evidence: [
      ...baseSpec.evidence,
      {
        key: `${scopeKey}-spec-status`,
        fieldKey: "status",
        sourceKey: "phase423-wancher-global-world-tree",
        scopeKey,
        locator: "separate wood SKU collection entries",
        qualifies: true,
      },
    ],
  };
  return pack;
}

function refreshedBrand(base: CuratedEntityPack): CuratedEntityPack {
  const pack = structuredClone(base);
  pack.key = "phase423-wancher-brand-world-tree-refresh-v1";
  pack.storyTitle = "Wancher：World Tree / Sekai 木材导航深化";
  pack.sources = [...pack.sources, ...EXTRA_SOURCES].filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  return pack;
}

export const phase423WancherWorldTreeRefreshPacks: CuratedEntityPack[] = [
  refreshedBrand(BASE_BRAND),
  ...BASE_MODELS.map(refreshedPack),
];
