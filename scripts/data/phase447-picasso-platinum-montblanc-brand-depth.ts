import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import { phase208Picasso916Packs, PHASE208_PICASSO_BRAND_ID } from "./phase208-picasso-916";
import {
  phase426BrandDepthRefreshPacks,
  PHASE426_BRAND_IDS,
} from "./phase426-brand-depth-refresh";
import { phase22MontblancPacks } from "./phase22-montblanc";
import { phase42LamyPlatinumPacks } from "./phase42-lamy-platinum";

export const PHASE447_BRAND_IDS = {
  picasso: PHASE208_PICASSO_BRAND_ID,
  platinum: PHASE426_BRAND_IDS.platinum,
  montblanc: PHASE426_BRAND_IDS.montblanc,
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
  if (!pack) throw new Error(`Phase 447 ${label} brand pack is missing.`);
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
  throw new Error(`Phase 447 ${label} source ${key} is missing.`);
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

function currentScope(slug: string): CuratedScope {
  const key = `phase447-${slug}-current-brand`;
  return {
    key,
    scopeKey: key,
    productionState: "current",
    editionScope: "Phase 447 品牌页导航刷新；只列已有来源化 canonical 型号，颜色、材料、套装、库存和单一 SKU 不回填为全品牌规格。",
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
    evidence: [{ key: `${key}-evidence`, sourceKey: source.key, scopeKey, locator: source.summary }],
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

const picassoBase = brandFrom(phase208Picasso916Packs, PHASE447_BRAND_IDS.picasso, "Picasso");
const platinumBase = brandFrom(
  phase426BrandDepthRefreshPacks,
  PHASE447_BRAND_IDS.platinum,
  "Platinum",
);
const montblancBase = brandFrom(
  phase426BrandDepthRefreshPacks,
  PHASE447_BRAND_IDS.montblanc,
  "Montblanc",
);

const picassoOfficial = sourceFrom(phase208Picasso916Packs, "phase208-picasso-official-brand", "Picasso");
const picasso916 = sourceFrom(phase208Picasso916Packs, "phase208-picasso-916-official", "Picasso");
const picassoCare = sourceFrom(phase208Picasso916Packs, "phase208-picasso-official-care", "Picasso");
const picassoHome = sourceFrom(phase208Picasso916Packs, "phase208-picasso-official-home", "Picasso");
const platinumCompany = sourceFrom(phase426BrandDepthRefreshPacks, "phase42-platinum-company", "Platinum");
const platinumCentury = sourceFrom(phase426BrandDepthRefreshPacks, "phase42-platinum-3776-brand", "Platinum");
const platinumTimeline = sourceFrom(phase42LamyPlatinumPacks, "phase42-platinum-timeline", "Platinum");
const montblancCatalog = sourceFrom(phase22MontblancPacks, "mb-writing-catalog", "Montblanc");
const montblancMeister = sourceFrom(phase22MontblancPacks, "mb-meisterstuck-100", "Montblanc");
const montblancCraft = sourceFrom(phase22MontblancPacks, "mb-craftsmanship", "Montblanc");
const montblancCare = sourceFrom(phase22MontblancPacks, "mb-service-guide", "Montblanc");

const platinumTravia = officialSource({
  key: "phase447-platinum-travia-official",
  title: "Platinum official #3776 CENTURY Travia release",
  url: "https://www.platinum-pen.co.jp/common/pdf/travia_en.pdf",
  registryKey: "platinum-official-phase447",
  registryName: "Platinum official",
  summary: "官方 2026 年资料将 #3776 CENTURY Travia 作为 #3776 Century 线的新品牌／新系列入口；透明树脂与当前商品配置不回填普通 PNB-15000。",
});
const montblancCurrent = officialSource({
  key: "phase447-montblanc-current-writing",
  title: "Montblanc official current writing instruments",
  url: "https://www.montblanc.com/en-us/collection/writing-instruments",
  registryKey: "montblanc-official-phase447",
  registryName: "Montblanc official",
  summary: "官方当前书写工具集合持续并列展示 Meisterstück、StarWalker 与特别路线；当前商品卡不等同于历史 149、146、144 的统一规格。",
});

const picassoScope = currentScope("picasso");
const platinumScope = currentScope("platinum");
const montblancScope = currentScope("montblanc");

export const phase447PicassoPlatinumMontblancBrandPacks: CuratedEntityPack[] = [
  refresh(
    picassoBase,
    "phase447-picasso-brand-depth-v1",
    ".planning/content-research/picasso-brand-phase447.md",
    "毕加索 Picasso：从上海帕弗洛到 916 Malaga 的品牌导航",
    picassoScope,
    [
      addClaim(
        picassoOfficial,
        picassoScope.scopeKey,
        "phase447-picasso-company-boundary",
        "brand_history",
        "官网公司简介将上海帕弗洛的成立写为 2003 年，首页另保留 1988 年品牌叙事；品牌页把企业时间点和宣传叙事分开，不把任一年份当作所有型号的上市年。",
      ),
      addClaim(
        picasso916,
        picassoScope.scopeKey,
        "phase447-picasso-916-navigation",
        "series_navigation",
        "Malaga／自然系列的 916 是已来源化的钢笔入口；颜色、哆啦 A 梦联名、PS-916 市场写法和尖形属于该型号或 SKU 层，不创建重复基础实体。",
      ),
      addClaim(
        picassoCare,
        picassoScope.scopeKey,
        "phase447-picasso-mode-boundary",
        "brand_boundary",
        "官网同时列出金笔、铱金笔、美工笔和宝珠笔；品牌页只把有钢笔证据的页面纳入钢笔导航，不能以联名礼盒或其它书写模式替代型号身份。",
      ),
    ],
    [],
    [
      {
        key: "phase447-picasso-company",
        title: "上海帕弗洛公司时间点",
        eventType: "brand_founded",
        startDate: "2003",
        circa: false,
        description: "毕加索官网公司简介把上海帕弗洛成立时间写为 2003 年；首页的 1988 叙事另作品牌宣传锚点。",
        sourceKey: picassoOfficial.key,
      },
      {
        key: "phase447-picasso-916",
        title: "916 Malaga 进入公开型号资料",
        eventType: "model_released",
        startDate: "2010s",
        circa: true,
        description: "官方 916 产品页、售后资料和独立样本共同支撑 Malaga_916 的型号导航；精确首发日未在当前包中固定。",
        sourceKey: picasso916.key,
      },
      {
        key: "phase447-picasso-home",
        title: "官网继续按多种书写模式展示产品",
        eventType: "design_milestone",
        startDate: "2026",
        circa: true,
        description: "当前官网首页和公司简介仍并列呈现金笔、铱金笔、美工笔和宝珠笔，品牌页保持钢笔与其它模式分层。",
        sourceKey: picassoHome.key,
      },
    ],
  ),
  refresh(
    platinumBase,
    "phase447-platinum-brand-depth-v1",
    ".planning/content-research/platinum-brand-phase447.md",
    "白金 Platinum：1919、#3776 与入门／工艺路线",
    platinumScope,
    [
      addClaim(
        platinumCompany,
        platinumScope.scopeKey,
        "phase447-platinum-company-route",
        "brand_history",
        "Platinum 官方公司资料把钢笔制造公司的起点放在 1919 年；这个品牌时间线不能直接当作 #3776、Preppy、Izumo 或其它型号的上市年。",
      ),
      addClaim(
        platinumCentury,
        platinumScope.scopeKey,
        "phase447-platinum-family-boundary",
        "family_boundary",
        "#3776 Century、Preppy、Plaisir、Prefounte、Procyon、Curidas 与 Izumo 是不同产品路线；共享墨囊或笔尖平台不改变材料、机构和型号身份。",
      ),
      addClaim(
        platinumTravia,
        platinumScope.scopeKey,
        "phase447-platinum-travia-navigation",
        "current_navigation",
        "官方 2026 资料把 #3776 CENTURY Travia 作为新的系列入口；透明结构和特别配置留在 Travia 页面，不回填普通 PNB-13000／PNB-15000。",
      ),
    ],
    [platinumTravia],
    [
      {
        key: "phase447-platinum-1919",
        title: "Platinum 钢笔制造公司起点",
        eventType: "brand_founded",
        startDate: "1919",
        circa: false,
        description: "官方公司讯息把 Platinum 的钢笔公司起点放在 1919 年。",
        sourceKey: platinumCompany.key,
      },
      {
        key: "phase447-platinum-century",
        title: "#3776 与 2011 Century 刷新",
        eventType: "design_milestone",
        startDate: "2011",
        circa: false,
        description: "官方 #3776 页面和历史资料区分 1978 原始 #3776 与 2011 #3776 CENTURY。",
        sourceKey: platinumCentury.key,
      },
      {
        key: "phase447-platinum-travia",
        title: "#3776 CENTURY Travia 作为新系列公开",
        eventType: "model_released",
        startDate: "2026",
        circa: true,
        description: "官方 2026 release PDF 将 Travia 作为 #3776 Century 线的新品牌／系列入口，特殊透明材料不覆盖普通款。",
        sourceKey: platinumTravia.key,
      },
    ],
  ),
  refresh(
    montblancBase,
    "phase447-montblanc-brand-depth-v1",
    ".planning/content-research/montblanc-brand-phase447.md",
    "万宝龙 Montblanc：从 1906、Meisterstück 到具体编号",
    montblancScope,
    [
      addClaim(
        montblancCatalog,
        montblancScope.scopeKey,
        "phase447-montblanc-brand-timeline",
        "brand_history",
        "Montblanc 官方书写工具资料把品牌起点追溯至 1906 年；Meisterstück 的名称与家族史另以 1924 年为锚，两个年份不等于 149 的统一规格起点。",
      ),
      addClaim(
        montblancMeister,
        montblancScope.scopeKey,
        "phase447-montblanc-numbered-family",
        "model_navigation",
        "149、146、144 和学生龙 22 都需要按具体笔体、年代、笔尖与供墨页面阅读；“大班”“学生龙”只是中文检索或历史称呼，不能代替 canonical 型号。",
      ),
      addClaim(
        montblancCurrent,
        montblancScope.scopeKey,
        "phase447-montblanc-current-route",
        "current_navigation",
        "当前官方集合并列展示 Meisterstück、StarWalker 和特别路线；现代商品卡不把特别版材料、价格或包装回填到历史 149、146、144。",
      ),
      addClaim(
        montblancCare,
        montblancScope.scopeKey,
        "phase447-montblanc-service-boundary",
        "maintenance_boundary",
        "活塞、墨囊／转换器、树脂和饰件按具体型号维护；清洗、服务和真伪判断不能由白色六角星或一张翻新照片单独推出。",
      ),
    ],
    [montblancCurrent],
    [
      {
        key: "phase447-montblanc-1906",
        title: "Montblanc 书写工具品牌起点",
        eventType: "brand_founded",
        startDate: "1906",
        circa: false,
        description: "官方书写工具资料把 Montblanc 品牌故事追溯到 1906 年。",
        sourceKey: montblancCatalog.key,
      },
      {
        key: "phase447-montblanc-1924",
        title: "Meisterstück 名称进入品牌史",
        eventType: "design_milestone",
        startDate: "1924",
        circa: false,
        description: "官方 Meisterstück 历史资料把 1924 年作为名称与家族的重要节点。",
        sourceKey: montblancMeister.key,
      },
      {
        key: "phase447-montblanc-current",
        title: "现代书写工具集合继续扩展",
        eventType: "design_milestone",
        startDate: "2026",
        circa: true,
        description: "当前官方集合并列展示 Meisterstück、StarWalker 与特别路线；每个现代 SKU 仍需自己的版本证据。",
        sourceKey: montblancCurrent.key,
      },
    ],
  ),
];

if (
  phase447PicassoPlatinumMontblancBrandPacks.length !== 3 ||
  new Set(phase447PicassoPlatinumMontblancBrandPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 447 brand refresh must contain three unique brands.");
}
