import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import { phase62SheafferPacks, PHASE62_SHEAFFER_ID } from "./phase62-sheaffer-p0";
import {
  phase290SchonDsgnPocketSixPacks,
  PHASE290_SCHON_BRAND_ID,
} from "./phase290-schon-dsgn-pocket-six";
import {
  phase251NahvalurNautilusPacks,
  PHASE251_NAHVALUR_BRAND_ID,
} from "./phase251-nahvalur-nautilus";

export const PHASE446_BRAND_IDS = {
  sheaffer: PHASE62_SHEAFFER_ID,
  "schon-dsgn": PHASE290_SCHON_BRAND_ID,
  nahvalur: PHASE251_NAHVALUR_BRAND_ID,
} as const;

const RETRIEVED = "2026-08-03";

function brandFrom(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "brand",
  );
  if (!pack) throw new Error(`Phase 446 ${label} brand pack is missing.`);
  return pack;
}

function sourceFrom(
  packs: readonly CuratedEntityPack[],
  key: string,
  label: string,
): CuratedSource {
  for (const pack of packs) {
    const source = pack.sources.find((candidate) => candidate.key === key);
    if (source) return source;
  }
  throw new Error(`Phase 446 ${label} source ${key} is missing.`);
}

function officialSource(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: "official",
    tier: "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function addClaim(
  source: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  confidence = 0.96,
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence,
    sourceKey: source.key,
    locator: source.summary,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey: source.key,
        scopeKey,
        locator: source.summary,
      },
    ],
  };
}

function currentScope(slug: string): CuratedScope {
  const key = `phase446-${slug}-current-brand`;
  return {
    key,
    scopeKey: key,
    productionState: "current",
    editionScope: "Phase 446 品牌页导航刷新；只列已有来源化且可打开的 canonical 型号，颜色、材料、库存和单一 SKU 不回填为全品牌规格。",
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  markdownFile: string,
  storyTitle: string,
  scope: CuratedScope,
  claims: CuratedEntityPack["claims"],
  sources: CuratedSource[],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
): CuratedEntityPack {
  return {
    ...base,
    key,
    markdownFile,
    storyTitle,
    sources: [...base.sources, ...sources],
    scopes: [...base.scopes, scope],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const sheafferBase = brandFrom(phase62SheafferPacks, PHASE446_BRAND_IDS.sheaffer, "Sheaffer");
const schonBase = brandFrom(
  phase290SchonDsgnPocketSixPacks,
  PHASE446_BRAND_IDS["schon-dsgn"],
  "Schon DSGN",
);
const nahvalurBase = brandFrom(
  phase251NahvalurNautilusPacks,
  PHASE446_BRAND_IDS.nahvalur,
  "Nahvalur",
);

const sheafferAbout = officialSource({
  key: "phase446-sheaffer-about-us",
  title: "Sheaffer official About Us",
  url: "https://sheaffer.com/pages/sheaffer-about-us",
  registryKey: "sheaffer-official-phase446",
  registryName: "Sheaffer official",
  summary: "官方 About Us 将 Sheaffer 起点放在 1913 年 Fort Madison，叙述杠杆填充、White Dot 与 2022 年 William Penn 收购；这是品牌自述，不替代逐年目录。",
});
const sheafferCurrent = officialSource({
  key: "phase446-sheaffer-current-catalog",
  title: "Sheaffer official current catalog",
  url: "https://sheaffer.com/",
  registryKey: "sheaffer-official-phase446",
  registryName: "Sheaffer official",
  summary: "官方当前目录列出 Icon、100 等现代钢笔入口；现行颜色、包装和库存绑定具体 SKU，不回填到历史家族。",
});
const nahvalurCurrent = officialSource({
  key: "phase446-nahvalur-current-home",
  title: "Nahvalur official current home and collections",
  url: "https://nahvalur.com/",
  registryKey: "nahvalur-official-phase446",
  registryName: "Nahvalur official",
  summary: "官方当前首页分栏展示 Original Plus、Original、Eclipse、Triad、Nautilus 等系列；栏目和库存会变化，只用于当前导航快照。",
});

const sheafferScope = currentScope("sheaffer");
const schonScope = currentScope("schon-dsgn");
const nahvalurScope = currentScope("nahvalur");

export const phase446SheafferSchonNahvalurBrandPacks: CuratedEntityPack[] = [
  refresh(
    sheafferBase,
    "phase446-sheaffer-brand-depth-v1",
    ".planning/content-research/sheaffer-brand-phase446.md",
    "Sheaffer：杠杆、白点、嵌入尖与现行线的分层导航",
    sheafferScope,
    [
      addClaim(
        sheafferAbout,
        sheafferScope.scopeKey,
        "phase446-sheaffer-official-origin",
        "brand_history",
        "Sheaffer 官方自述把品牌起点放在 1913 年 Fort Madison，并以杠杆填充和 1924 年 White Dot 作为品牌历史锚点；本页将其标为官方叙述，不把营销故事当作单一型号证据。",
      ),
      addClaim(
        sheafferAbout,
        sheafferScope.scopeKey,
        "phase446-sheaffer-white-dot-boundary",
        "identity_boundary",
        "White Dot 是跨时期的识别标志而不是型号名；它不能单独证明笔尖材质、上墨机构、保修或具体系列，实物仍需回到 Balance、Snorkel、PFM、Targa 等页面。",
      ),
      addClaim(
        sheafferCurrent,
        sheafferScope.scopeKey,
        "phase446-sheaffer-current-navigation",
        "brand_model_navigation",
        "当前官方目录提供 Icon、100 等现行产品入口；历史家族和现行 SKU 分区展示，Icon 的颜色、包装和尖号不回填到 PFM、Targa 或老 Snorkel。",
      ),
    ],
    [sheafferAbout, sheafferCurrent],
    [
      {
        key: "phase446-sheaffer-origin",
        title: "Fort Madison 品牌起点（官方自述）",
        eventType: "brand_founded",
        startDate: "1913",
        circa: false,
        description: "Sheaffer 官方 About Us 将品牌建立年份和地点写为 1913 年、美国爱荷华州 Fort Madison。",
        sourceKey: sheafferAbout.key,
      },
      {
        key: "phase446-sheaffer-white-dot",
        title: "White Dot 成为识别标志",
        eventType: "design_milestone",
        startDate: "1924",
        circa: false,
        description: "官方历史页将 1924 年 White Dot 作为品牌识别节点；其位置和含义需按年代读取。",
        sourceKey: sheafferAbout.key,
      },
      {
        key: "phase446-sheaffer-current-catalog",
        title: "现代 Icon 与 100 进入当前目录",
        eventType: "revival",
        startDate: "2020s",
        circa: true,
        description: "官方当前商城持续列出现代钢笔产品；这里只记录现行导航，不将当前 SKU 的营销配置回填历史家族。",
        sourceKey: sheafferCurrent.key,
      },
    ],
  ),
  refresh(
    schonBase,
    "phase446-schon-dsgn-brand-depth-v1",
    ".planning/content-research/schon-dsgn-brand-phase446.md",
    "Schon DSGN：从机械加工到 Pocket Six 的品牌导航",
    schonScope,
    [
      addClaim(
        sourceFrom(phase290SchonDsgnPocketSixPacks, "phase290-schon-collection", "Schon DSGN"),
        schonScope.scopeKey,
        "phase446-schon-tool-boundary",
        "brand_boundary",
        "Schon DSGN 官方集合同时包含钢笔、圆珠和滚珠；品牌页只把 Pocket Six 及其钢笔版本纳入钢笔导航，不因同一工作室或金属加工工艺而合并其它书写模式。",
      ),
      addClaim(
        sourceFrom(phase290SchonDsgnPocketSixPacks, "phase290-schon-pocket-six-official", "Schon DSGN"),
        schonScope.scopeKey,
        "phase446-schon-pocket-six-identity",
        "model_navigation",
        "Pocket Six 的稳定身份线索是短杆、可旋到尾部的笔帽、完整尺寸 #6 尖和短国际墨囊；铝、黄铜、铜、阳极氧化和多色切面先记录为材料／版本边界。",
      ),
    ],
    [],
    [
      {
        key: "phase446-schon-pocket-six-current",
        title: "Pocket Six 成为公开钢笔入口",
        eventType: "model_released",
        startDate: "2019",
        circa: true,
        description: "官方产品页与 2019–2021 独立评测均记录 Pocket Six；精确首发日未在当前资料中固定。",
        sourceKey: sourceFrom(phase290SchonDsgnPocketSixPacks, "phase290-schon-pocket-six-official", "Schon DSGN").key,
      },
      {
        key: "phase446-schon-faceted",
        title: "阳极氧化和金属版本形成 Pocket Six 版本层",
        eventType: "design_milestone",
        startDate: "2020",
        circa: true,
        description: "官方 Faceted 页面展示多色阳极氧化版本；售罄和不保证复产属于 SKU 库存边界，不生成重复基础型号。",
        sourceKey: sourceFrom(phase290SchonDsgnPocketSixPacks, "phase290-schon-pocket-six-faceted", "Schon DSGN").key,
      },
    ],
  ),
  refresh(
    nahvalurBase,
    "phase446-nahvalur-brand-depth-v1",
    ".planning/content-research/nahvalur-brand-phase446.md",
    "Nahvalur：Narwhal 改名后的系列分层导航",
    nahvalurScope,
    [
      addClaim(
        nahvalurCurrent,
        nahvalurScope.scopeKey,
        "phase446-nahvalur-current-collections",
        "brand_model_navigation",
        "官方当前首页把 Original、Original Plus、Eclipse、Triad、Horizon、Nautilus 等分为集合；品牌页只链接已有 canonical 内容，价格、库存和评论数不当作永久型号事实。",
      ),
      addClaim(
        sourceFrom(phase251NahvalurNautilusPacks, "phase251-nahvalur-series", "Nahvalur"),
        nahvalurScope.scopeKey,
        "phase446-nahvalur-material-boundary",
        "family_boundary",
        "Original／Original Plus、Schuylkill、Nautilus 与 Nautilus Ti 的供墨或材料不同；Nautilus ebonite 的 oversize、活塞和三枚墨窗不能回填到钛合金 Ti 或其它系列。",
      ),
      addClaim(
        sourceFrom(phase251NahvalurNautilusPacks, "phase251-nahvalur-series", "Nahvalur"),
        nahvalurScope.scopeKey,
        "phase446-nahvalur-name-transition",
        "identity_boundary",
        "Narwhal→Nahvalur 是同一品牌的名称过渡；旧刻字、旧包装和新官网名称需要作为别名和库存时间线记录，不自动生成第二个品牌或第二代型号。",
      ),
    ],
    [nahvalurCurrent],
    [
      {
        key: "phase446-nahvalur-current-home",
        title: "官方首页按集合展示现行产品",
        eventType: "design_milestone",
        startDate: "2026",
        circa: true,
        description: "当前官方首页以集合分栏展示 Original、Original Plus、Eclipse、Triad、Nautilus 等；栏目和库存会随时间变化。",
        sourceKey: nahvalurCurrent.key,
      },
      {
        key: "phase446-nahvalur-nautilus-route",
        title: "Nautilus 作为 signature collection 保留独立路线",
        eventType: "design_milestone",
        startDate: "2022",
        circa: true,
        description: "官方系列页持续把 Nautilus 的 ebonite、活塞和三枚仿舷窗墨窗作为独立 collection 介绍。",
        sourceKey: sourceFrom(phase251NahvalurNautilusPacks, "phase251-nahvalur-series", "Nahvalur").key,
      },
    ],
  ),
];

if (
  phase446SheafferSchonNahvalurBrandPacks.length !== 3 ||
  new Set(phase446SheafferSchonNahvalurBrandPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 446 brand refresh must contain three unique brands.");
}
