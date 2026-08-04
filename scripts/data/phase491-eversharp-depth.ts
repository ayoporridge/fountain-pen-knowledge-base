import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE169_IDS,
  phase169EversharpRepresentativePacks,
} from "./phase169-eversharp-representatives";
import {
  PHASE190_BANTAM_ID,
  phase190EversharpBantamPacks,
} from "./phase190-eversharp-bantam";

export const PHASE491_IDS = {
  envoy: PHASE169_IDS.envoy,
  coronet: PHASE169_IDS.coronet,
  bantam: PHASE190_BANTAM_ID,
} as const;

const RETRIEVED = "2026-08-04";

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
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  return {
    ...input,
    author: input.author ?? input.registryName,
    homepageUrl: input.url.startsWith("http") ? new URL(input.url).origin : "/",
    itemType: "web_page",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 491 Eversharp exact-model depth refresh`,
  };
}

function claim(
  sourceItem: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  factClass: CuratedClaim["factClass"] = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "editorial" ? 0.95 : 0.98,
    sourceKey: sourceItem.key,
    locator: sourceItem.summary,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey: sourceItem.key,
        scopeKey,
        locator: sourceItem.summary,
      },
    ],
  };
}

function findPen(packs: CuratedEntityPack[], entityId: string, label: string): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 491 ${label} base pack is missing.`);
  return structuredClone(pack);
}

function refresh(
  pack: CuratedEntityPack,
  input: {
    key: string;
    markdownFile: string;
    storyTitle: string;
    primary: CuratedSource;
    extras: CuratedSource[];
    scope: CuratedScope;
    claims: CuratedClaim[];
    values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
    variants: NonNullable<CuratedEntityPack["variants"]>;
    eventTitle: string;
    eventDescription: string;
  },
): CuratedEntityPack {
  const aliases = [
    ...(pack.aliases ?? []),
    { alias: pack.canonicalName, language: "en", sourceKey: input.primary.key },
  ].filter(
    (alias, index, all) =>
      all.findIndex((candidate) => candidate.alias === alias.alias) === index,
  );
  const sources = [...(pack.sources ?? []), input.primary, ...input.extras].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  const scopes = [...(pack.scopes ?? []), input.scope].filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.scopeKey === item.scopeKey) === index,
  );
  const variants = [...(pack.variants ?? []), ...input.variants].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  return {
    ...pack,
    key: input.key,
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: input.primary.key,
    aliases,
    sources,
    scopes,
    claims: [...(pack.claims ?? []), ...input.claims],
    variants,
    spec: pack.spec
      ? {
          ...pack.spec,
          values: { ...pack.spec.values, ...input.values },
          evidence: [
            ...(pack.spec.evidence ?? []),
            ...Object.keys(input.values).map((fieldKey) => ({
              key: `${input.key}-${fieldKey}-evidence`,
              fieldKey: fieldKey as SpecFieldKey,
              sourceKey: input.primary.key,
              scopeKey: input.scope.scopeKey,
              locator: input.primary.summary,
              qualifies: true,
            })),
          ],
        }
      : undefined,
    timeline: [
      ...(pack.timeline ?? []),
      {
        key: `${input.key}-current-review`,
        title: input.eventTitle,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: input.eventDescription,
        sourceKey: input.primary.key,
      },
    ],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const official = source({
  key: "phase491-eversharp-official-history",
  registryKey: "wahl-eversharp-official-history-phase491",
  registryName: "Wahl-Eversharp",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wahl-eversharp-official-phase491",
  title: "Wahl-Eversharp 官方历史",
  url: "https://wahl-eversharp.com/pages/history",
  summary:
    "官方历史页确认旧公司从 Wahl 进入钢笔业务、1920 年代末使用 Wahl-Eversharp、1941 年改称 Eversharp、1957 年被 Parker 收购，并把现代复兴公司与旧经营分开。",
});
const chronology = source({
  key: "phase491-eversharp-chronology",
  registryKey: "fountainpenit-eversharp-chronology-phase491",
  registryName: "FountainPen.it",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fountainpenit-eversharp-phase491",
  title: "FountainPen.it：Wahl Eversharp 年表",
  url: "https://www.fountainpen.it/Eversharp/en",
  summary:
    "专业年表提供 Wahl-Eversharp 从 1914 年到 Parker 收购的型号窗口，并把 Coronet、Bantam、Safety Ink Shut-Off 与 1930 年代产品路线放在同一时间轴。",
});
const envoyPrimary = source({
  key: "phase491-eversharp-envoy-penhero",
  registryKey: "penhero-eversharp-envoy-phase491",
  registryName: "PenHero",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "penhero-eversharp-envoy-phase491",
  title: "PenHero：Eversharp Envoy c. 1948",
  url: "https://www.penhero.com/PenGallery/Eversharp/EversharpEnvoy1948.htm",
  summary:
    "型号档案记录 Envoy 约 1948 年的 1/10 14K Y.G.F. 帽杆、线性机刻、14K 短型尖、杠杆上墨、尺寸重量、1948 年广告与 1951—1952 年清仓线索。",
});
const envoyFiller = source({
  key: "phase491-eversharp-envoy-filler-boundary",
  registryKey: "vintagepens-eversharp-filler-phase491",
  registryName: "Vintage Pens",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "vintagepens-eversharp-phase491",
  title: "Vintage Pens：Wahl-Eversharp 资料与维修边界",
  url: "https://www.vintagepens.com/m/catill_Wahl_Eversharp.shtml",
  summary:
    "收藏资料用于交叉核对旧 Eversharp 的产品线、材料与实物条件边界；不把单支目录样本升级为所有 Envoy 的统一尺寸或尖幅。",
});

const coronetPrimary = source({
  key: "phase491-eversharp-coronet-vintagepens",
  registryKey: "vintagepens-eversharp-coronet-phase491",
  registryName: "Vintage Pens",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "vintagepens-coronet-phase491",
  title: "Vintage Pens：Eversharp Coronet Pens and Pencils",
  url: "https://vintagepens.com/Coronet.shtml",
  summary:
    "专业档案把 Coronet 放在 1936 年末，记录 Art Deco、全覆盖与 half-Coronet、目录定价冲突、透明 section 破裂风险和不同拆解路径。",
});
const coronetChronology = source({
  key: "phase491-eversharp-coronet-fountainpenit",
  registryKey: "fountainpenit-eversharp-coronet-phase491",
  registryName: "FountainPen.it",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fountainpenit-coronet-phase491",
  title: "FountainPen.it：Coronet 与 Safety Ink Shut-Off 年表",
  url: "https://www.fountainpen.it/Eversharp/en",
  summary:
    "年表将 Coronet 放入 1936 年后的 Eversharp Art Deco 路线，并说明 Safety Ink Shut-Off 的宣传与后来撤下的历史边界。",
});
const coronetCollectors = source({
  key: "phase491-eversharp-coronet-collectorsweekly",
  registryKey: "collectorsweekly-eversharp-coronet-phase491",
  registryName: "Collectors Weekly",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "collectorsweekly-eversharp-phase491",
  title: "Collectors Weekly：Vintage Wahl Eversharp Pens",
  url: "https://www.collectorsweekly.com/pens/wahl-eversharp",
  summary:
    "收藏史概览用于交叉核对 Coronet 在 1930 年代的 Art Deco 产品位置与 Eversharp 在 1957 年后退出钢笔市场的背景。",
});

const bantamPrimary = source({
  key: "phase491-eversharp-bantam-vintagepens",
  registryKey: "vintagepens-eversharp-bantam-phase491",
  registryName: "Vintage Pens",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "vintagepens-bantam-phase491",
  title: "Vintage Pens：Wahl-Eversharp Bantams",
  url: "https://www.vintagepens.com/Eversharp_Bantams.shtml",
  summary:
    "收藏档案展示 Bantam 的彩色和纹理赛璐珞、圆杆与棱面样本、帽环和饰件差异，保持版本和保存状态的单支边界。",
});
const bantamChronology = source({
  key: "phase491-eversharp-bantam-fountainpenit",
  registryKey: "fountainpenit-eversharp-bantam-phase491",
  registryName: "FountainPen.it",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fountainpenit-bantam-phase491",
  title: "FountainPen.it：Wahl Eversharp 年表",
  url: "https://www.fountainpen.it/Eversharp/en",
  summary:
    "专业年表将 Bantam 放入约 1933 年产品语境，并提供 Century of Progress 标记与 Eversharp 1930 年代路线的时间边界。",
});
const bantamBulb = source({
  key: "phase491-eversharp-bantam-bulb",
  registryKey: "fountainpenit-bulb-filler-phase491",
  registryName: "FountainPen.it",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fountainpenit-bulb-phase491",
  title: "FountainPen.it：Bulb filler 原理",
  url: "https://www.fountainpen.it/Bulb_filler/en",
  summary:
    "技术资料解释橡胶球、通气管和笔身储墨的吸排动作，并把 Eversharp Bantam 列为 bulb filler 的历史例子。",
});
const bantamInstructions = source({
  key: "phase491-eversharp-bantam-instructions",
  registryKey: "vintagepens-bulb-instructions-phase491",
  registryName: "Vintage Pens",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "vintagepens-bulb-phase491",
  title: "Vintage Pens：Bulb filler 使用说明",
  url: "https://www.vintagepens.com/filling_instructions_bulb-fillers.shtml",
  summary:
    "填充说明把 bulb filler 的挤压、通气、回吸和排空动作拆开，适用于解释 Bantam 的使用与老球囊风险。",
});
const bantamSample = source({
  key: "phase491-eversharp-bantam-peyton",
  registryKey: "peytonstreet-eversharp-bantam-phase491",
  registryName: "Peyton Street Pens",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "peytonstreet-bantam-phase491",
  title: "Peyton Street Pens：Bantam 蓝色旋纹单支档案",
  url: "https://www.peytonstreetpens.com/wahl-eversharp-bantam-fountain-pen-blue-swirl-bulb-filler-0-steel-nib-very-nice-restored.html",
  summary:
    "专业零售样本记录蓝色旋纹 Bantam、bulb filler、0 号钢尖和修复状态；规格严格限定为该支样本。",
});

const envoyScope: CuratedScope = {
  key: "phase491-eversharp-envoy-scope",
  scopeKey: "phase491-eversharp-envoy-scope",
  productionState: "historical",
  editionScope:
    "约 1948 年 Eversharp Envoy；1/10 14K Y.G.F. 帽杆与笔杆、线性机刻、短型 14K 尖、杠杆墨囊；Symphony、Pacemaker、现代复兴款独立。",
};
const coronetScope: CuratedScope = {
  key: "phase491-eversharp-coronet-scope",
  scopeKey: "phase491-eversharp-coronet-scope",
  productionState: "historical",
  editionScope:
    "1936 年末至约 1941 年 Coronet 产品语境；Art Deco 全覆盖与 half-Coronet、Safety Ink Shut-Off 和透明 section 维修边界；现代复刻独立。",
};
const bantamScope: CuratedScope = {
  key: "phase491-eversharp-bantam-scope",
  scopeKey: "phase491-eversharp-bantam-scope",
  productionState: "historical",
  editionScope:
    "约 1933 年前后 Bantam；小型赛璐珞、尾端 bulb filler、圆杆／棱面、Century of Progress 和尖材版本；Parker 时代与现代复兴独立。",
};

const sourcePacks = [
  ...phase169EversharpRepresentativePacks,
  ...phase190EversharpBantamPacks,
];
const envoyBase = findPen(sourcePacks, PHASE491_IDS.envoy, "Eversharp Envoy");
const coronetBase = findPen(sourcePacks, PHASE491_IDS.coronet, "Eversharp Coronet");
const bantamBase = findPen(sourcePacks, PHASE491_IDS.bantam, "Eversharp Bantam");

export const phase491EversharpDepthPacks: CuratedEntityPack[] = [
  refresh(envoyBase, {
    key: "phase491-eversharp-envoy-depth-v1",
    markdownFile: ".planning/content-research/eversharp-envoy-phase491.md",
    storyTitle: "The Eversharp Envoy：约 1948 年的金填流线笔",
    primary: envoyPrimary,
    extras: [official, chronology, envoyFiller],
    scope: envoyScope,
    claims: [
      claim(
        envoyPrimary,
        envoyScope.scopeKey,
        "phase491-envoy-identity",
        "model_identity",
        "The Eversharp Envoy 是约 1948 年的 Eversharp 历史型号，以全金填流线外观、连续线性刻纹、短型 14K 尖和杠杆上墨区别于 Symphony、Pacemaker 与现代复兴款。",
      ),
      claim(
        envoyPrimary,
        envoyScope.scopeKey,
        "phase491-envoy-material",
        "material_boundary",
        "PenHero 记录帽与笔杆有 1/10 14K Y.G.F. 标记；金填层不等于整支笔为实心 14K 金，磨损、重镀和抛光必须逐支核对。",
      ),
      claim(
        envoyPrimary,
        envoyScope.scopeKey,
        "phase491-envoy-specification",
        "sample_specification",
        "公开档案样本约闭帽 5 1/4 英寸、插帽 5 7/8 英寸、最大直径 3/8 英寸、重量 0.6 oz；数字限定在该样本，不能覆盖所有修复状态。",
      ),
      claim(
        envoyPrimary,
        envoyScope.scopeKey,
        "phase491-envoy-filler",
        "filling_system",
        "Envoy 使用杠杆和橡胶墨囊，供墨语境与 Skyline 家族相近；相似 feed 不构成 Skyline 零件的无条件互换证明。",
      ),
      claim(
        envoyPrimary,
        envoyScope.scopeKey,
        "phase491-envoy-market",
        "historical_market",
        "1948 年钢笔上市价约 15 美元，1950 年宣传活动出现套装奖品，1951—1952 年出现折价清仓；市场窗口不是单支制造日期或今日估值。",
      ),
      claim(
        official,
        envoyScope.scopeKey,
        "phase491-envoy-modern-boundary",
        "brand_history_boundary",
        "官方历史把旧 Eversharp、1957 年 Parker 收购和 2012 年后的现代 Wahl-Eversharp 复兴分开；现代产品规格不能回填 1948 年 Envoy。",
      ),
      claim(
        envoyFiller,
        envoyScope.scopeKey,
        "phase491-envoy-care",
        "maintenance_guidance",
        "老墨囊、压条、section 和金填表面应先检查，使用常温水短吸短排，避免热水、强抛光和硬拧摩擦帽；渗漏时交给熟悉老 Eversharp 的维修者。",
        "editorial",
      ),
    ],
    values: {
      series_name: "Eversharp Envoy",
      release_year: "约 1948；精确生产日按刻字、广告和单支实物核对",
      origin_country: "美国；Eversharp 历史产品线",
      nib: "公开档案记录 Eversharp 14K 短型尖；尖幅、刻字完整度和重磨状态按单支确认",
      fill_system: "杠杆上墨与橡胶墨囊；供墨语境接近 Skyline，但零件不可仅凭名称互换",
      material: "帽与笔杆为 1/10 14K Y.G.F. 金填，连续平行线性刻纹；金填不等于实心金",
      dimensions: "PenHero 样本约闭帽 5 1/4 英寸、插帽 5 7/8 英寸、最大直径约 3/8 英寸",
      weight: "PenHero 样本约 0.6 oz；不作为所有版本或含墨状态的统一克重",
      price_range: "1948 年钢笔上市价约 15 美元；不是今日估值",
      status: "历史型号；1948 年上市，1951—1952 年出现清仓／收尾语境",
    },
    variants: [
      {
        key: "phase491-envoy-ygf",
        name: "1/10 14K Y.G.F. 金填帽杆与笔杆",
        notes: "帽沿和笔杆刻字是主要材料线索；金填磨损、重镀和抛光按实物记录。",
        sourceKey: envoyPrimary.key,
        variantKind: "material",
      },
      {
        key: "phase491-envoy-short-nib",
        name: "Eversharp 14K 短型尖",
        notes: "档案记录 Skyline 之后的短型尖；尖幅和原装程度不能跨样本复制。",
        sourceKey: envoyPrimary.key,
        variantKind: "nib",
      },
      {
        key: "phase491-envoy-market-window",
        name: "1948 上市／1951—1952 清仓窗口",
        notes: "广告和零售档案的市场时间线，不等于单支生产日或今日价格。",
        sourceKey: envoyPrimary.key,
        variantKind: "edition_group",
      },
    ],
    eventTitle: "Phase 491：Envoy 金填、杠杆供墨与战后市场边界深化",
    eventDescription:
      "补足 Envoy 的官方品牌边界、1948 广告、金填刻字、短型 14K 尖、杠杆墨囊、样本量测、清仓线索和历史笔维护。",
  }),
  refresh(coronetBase, {
    key: "phase491-eversharp-coronet-depth-v1",
    markdownFile: ".planning/content-research/eversharp-coronet-phase491.md",
    storyTitle: "The Eversharp Coronet：1936 年末的 Art Deco 与安全 shut-off",
    primary: coronetPrimary,
    extras: [official, coronetChronology, coronetCollectors],
    scope: coronetScope,
    claims: [
      claim(
        coronetPrimary,
        coronetScope.scopeKey,
        "phase491-coronet-identity",
        "model_identity",
        "The Eversharp Coronet 通常指 1936 年末进入市场的 Art Deco 历史型号；广告、1939 年目录重印和收藏命名并非完全一致，需保留型号边界。",
      ),
      claim(
        coronetPrimary,
        coronetScope.scopeKey,
        "phase491-coronet-architecture",
        "version_boundary",
        "全覆盖 Coronet 与金属帽／赛璐珞笔杆的 half-Coronet 是不同结构路线；几何装饰、帽环和饰件配置按目录与单支实物核对。",
      ),
      claim(
        coronetPrimary,
        coronetScope.scopeKey,
        "phase491-coronet-shutoff",
        "filling_system",
        "当年广告把 Safety Ink Shut-Off 作为卖点，历史资料记录其效果和后续撤下争议；它不是现代意义上的绝对防漏保证。",
      ),
      claim(
        coronetPrimary,
        coronetScope.scopeKey,
        "phase491-coronet-repair",
        "maintenance_boundary",
        "部分全覆盖样本的透明 section 容易破裂或结晶，拆解时要把 forebarrel 与 section 组件按其压配结构处理；half-Coronet 不能套用同一动作。",
      ),
      claim(
        coronetPrimary,
        coronetScope.scopeKey,
        "phase491-coronet-market",
        "historical_market",
        "专业档案记录全覆盖款约 10 美元、half-Coronet 约 8.75 美元的历史广告坐标；价格冲突不应转成今日估值或统一等级。",
      ),
      claim(
        official,
        coronetScope.scopeKey,
        "phase491-coronet-modern-boundary",
        "brand_history_boundary",
        "官方品牌史确认 Coronet 属于旧 Wahl-Eversharp／Eversharp 产品语境，现代 Wahl-Eversharp 复兴款须作为独立身份处理。",
      ),
      claim(
        coronetChronology,
        coronetScope.scopeKey,
        "phase491-coronet-care",
        "maintenance_guidance",
        "清洗从常温水短时测试开始，避免热水、酒精、超声波和强力拧动；安全机构、透明件与旧密封应由熟悉老 Eversharp 的维修者检查。",
        "editorial",
      ),
    ],
    values: {
      series_name: "Eversharp Coronet",
      release_year: "1936 年末（约）；目录和广告命名存在差异",
      origin_country: "美国；Wahl-Eversharp 历史产品线",
      nib: "尖材、字幅、Adjustable Point 或普通尖的组合按版本和实物核对",
      fill_system: "广告中的 Safety Ink Shut-Off 机构；实际密封、阀件和上墨状态逐支检查",
      material: "Art Deco 金属装饰；全覆盖款和金属帽／赛璐珞笔杆的 half-Coronet 并存",
      dimensions: "没有足以覆盖全系列的统一工厂尺寸；目录与单支量测优先",
      weight: "帽材、覆盖件、装饰和含墨量差异明显，未确认统一克重",
      price_range: "历史广告约 10 美元全覆盖、约 8.75 美元 half-Coronet；不是今日估值",
      status: "历史型号；1936 年末上市，约 1941 年前后仍见产品线记录",
    },
    variants: [
      {
        key: "phase491-coronet-full-overlay",
        name: "全覆盖 Coronet",
        notes: "全覆盖外观与透明 section 的维修风险要单独记录；金色装饰不自动等于实心金。",
        sourceKey: coronetPrimary.key,
        variantKind: "material",
      },
      {
        key: "phase491-coronet-half",
        name: "half-Coronet 金属帽／赛璐珞笔杆",
        notes: "结构和拆解路径与全覆盖款不同，不能把全覆盖款的透明件与尺寸回填。",
        sourceKey: coronetPrimary.key,
        variantKind: "edition_group",
      },
      {
        key: "phase491-coronet-shutoff",
        name: "Safety Ink Shut-Off 机构线索",
        notes: "广告和年表的历史机构名；实际密封性、阀件完整度和测试结果按单支记录。",
        sourceKey: coronetChronology.key,
        variantKind: "variant",
      },
    ],
    eventTitle: "Phase 491：Coronet Art Deco 结构、Safety Ink Shut-Off 与维修边界深化",
    eventDescription:
      "补足 Coronet 的 1936 年末时间窗、全覆盖／half-Coronet 版本、目录命名与定价冲突、透明 section 风险及现代复兴身份边界。",
  }),
  refresh(bantamBase, {
    key: "phase491-eversharp-bantam-depth-v1",
    markdownFile: ".planning/content-research/eversharp-bantam-phase491.md",
    storyTitle: "The Eversharp Bantam：小尺寸、bulb filler 与战前版本",
    primary: bantamPrimary,
    extras: [official, bantamChronology, bantamBulb, bantamInstructions, bantamSample],
    scope: bantamScope,
    claims: [
      claim(
        bantamPrimary,
        bantamScope.scopeKey,
        "phase491-bantam-identity",
        "model_identity",
        "The Eversharp Bantam 是约 1930 年代的小型历史钢笔，身份由尾端 bulb filler、赛璐珞版本和 Eversharp 时间语境共同确定，不能只凭短尺寸或尖刻字认定。",
      ),
      claim(
        bantamChronology,
        bantamScope.scopeKey,
        "phase491-bantam-date",
        "production_context",
        "专业年表把 Bantam 放在约 1933 年产品语境，并记录 Century of Progress 标记线索；具体样本年份仍需目录、刻字和实物交叉核对。",
      ),
      claim(
        bantamBulb,
        bantamScope.scopeKey,
        "phase491-bantam-filler",
        "filling_system",
        "Bantam 使用尾端盲帽下的 bulb filler：挤压橡胶球经通气管排气，释放后吸入墨水；它不等同于杠杆、转换器或现代活塞。",
      ),
      claim(
        bantamPrimary,
        bantamScope.scopeKey,
        "phase491-bantam-material",
        "material_variation",
        "收藏档案可见彩色或半透明赛璐珞、圆杆与棱面／纹理路线、不同帽环和镀层；颜色和透明度不构成全系统一规格。",
      ),
      claim(
        bantamSample,
        bantamScope.scopeKey,
        "phase491-bantam-sample",
        "sample_specification",
        "专业零售样本记录蓝色旋纹 Bantam、bulb filler、0 号钢尖和修复状态；尖材、容量和尺寸均限定在该支样本。",
      ),
      claim(
        bantamInstructions,
        bantamScope.scopeKey,
        "phase491-bantam-care",
        "maintenance_guidance",
        "老球囊应以清水短吸短排测试，避免连续高速挤压；赛璐珞裂纹、透明件应力和镀层磨损交给熟悉历史 bulb filler 的修复者。",
        "editorial",
      ),
      claim(
        official,
        bantamScope.scopeKey,
        "phase491-bantam-modern-boundary",
        "brand_history_boundary",
        "官方历史把旧 Wahl-Eversharp／Eversharp、1957 年 Parker 收购和现代 Wahl-Eversharp 复兴分开；后来的产品规格不能回填战前 Bantam。",
      ),
    ],
    values: {
      series_name: "Eversharp Bantam",
      release_year: "约 1933 年产品语境；具体样本年份按目录、刻字和版本核对",
      origin_country: "美国；Wahl-Eversharp 芝加哥产品线",
      nib: "公开样本可见金尖或镀金钢尖；专业零售样本为 0 号钢尖，不得跨样本外推",
      fill_system: "尾端盲帽下的 bulb filler；橡胶球、通气管和密封状态决定吸墨",
      material: "彩色或半透明赛璐珞、黑色握位与镀金饰件；纹理和透明度随版本变化",
      dimensions: "小型袖珍钢笔；闭帽长度、直径、帽环和尾端结构按单支测量",
      weight: "没有可核实的统一工厂重量；帽环、夹子、墨水与修复件会改变实测值",
      status: "历史型号；约 1930 年代至 1940 年前后，保存与修复状态差异很大",
    },
    variants: [
      {
        key: "phase491-bantam-bulb",
        name: "尾端 bulb filler",
        notes: "尾端盲帽、橡胶球和通气管是身份线索；球囊尺寸和状态按单支检查。",
        sourceKey: bantamBulb.key,
        variantKind: "variant",
      },
      {
        key: "phase491-bantam-celluloid",
        name: "圆杆／棱面与彩色赛璐珞版本",
        notes: "纹理、透明度和颜色是版本线索，不排成未经目录支持的严格代际顺序。",
        sourceKey: bantamPrimary.key,
        variantKind: "material",
      },
      {
        key: "phase491-bantam-century",
        name: "Century of Progress 标记样本（Phase 491 复核）",
        notes: "约 1933 年展览语境的版本线索，不代表所有 Bantam 都有该标记。",
        sourceKey: bantamChronology.key,
        variantKind: "edition_group",
      },
      {
        key: "phase491-bantam-nib",
        name: "金尖／镀金钢尖／0 号钢尖样本",
        notes: "公开样本存在尖材差异；尖号、金含量和是否替换必须拍摄刻字确认。",
        sourceKey: bantamSample.key,
        variantKind: "nib",
      },
    ],
    eventTitle: "Phase 491：Bantam bulb filler、战前赛璐珞与尖材版本深化",
    eventDescription:
      "补足 Bantam 的 1933 年产品语境、尾端 bulb filler 动作、圆杆／棱面赛璐珞、Century of Progress、尖材样本和老球囊维护边界。",
  }),
];
