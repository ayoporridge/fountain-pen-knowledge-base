import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase88AsvineVacuumPacks } from "./phase88-asvine-vacuum";
import { phase182MajohnPacks } from "./phase182-majohn-v1-v60-wancai";
import { phase315PelikanTwistP457Packs } from "./phase315-pelikan-twist-p457";

export const PHASE479_IDS = {
  twist: "wnzMt5lugvtc",
  wancai: "OKxZn-scQfN5",
  v126: "phase88-pen-asvine-v126",
} as const;

const ASVINE_BRAND_ID = "phase66-brand-4021dffad5ea8c4af6d7692b";
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
      input.sourceType === "official" ? new URL(input.url).origin : input.url,
    itemType: "web_page",
    author: input.author,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 479 exact model, filling, version, care or sample boundary`,
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
  const locator = sourceItem.archiveLocator ?? sourceItem.summary;
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "editorial" ? 0.96 : 0.98,
    sourceKey: sourceItem.key,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator }],
  };
}

function base(entityId: string, label: string): CuratedEntityPack {
  const pack = [
    ...phase315PelikanTwistP457Packs,
    ...phase182MajohnPacks,
    ...phase88AsvineVacuumPacks(ASVINE_BRAND_ID),
  ].find((candidate) => candidate.entityId === entityId && candidate.expectedType === "pen");
  if (!pack) throw new Error(`Phase 479 ${label} base pack is missing.`);
  return pack;
}

function refresh(
  pack: CuratedEntityPack,
  key: string,
  markdownFile: string,
  primary: CuratedSource,
  extras: CuratedSource[],
  scope: CuratedScope,
  claims: CuratedClaim[],
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>,
  eventTitle: string,
  eventDescription: string,
): CuratedEntityPack {
  return {
    ...pack,
    key,
    markdownFile,
    primarySourceKey: primary.key,
    sources: [...pack.sources, primary, ...extras],
    scopes: [...pack.scopes, scope],
    claims: [...pack.claims, ...claims],
    spec: pack.spec
      ? {
          ...pack.spec,
          values: { ...pack.spec.values, ...values },
          evidence: [
            ...pack.spec.evidence,
            ...Object.keys(values).map((fieldKey) => ({
              key: `${key}-${fieldKey}-evidence`,
              fieldKey: fieldKey as SpecFieldKey,
              sourceKey: primary.key,
              scopeKey: scope.scopeKey,
              locator: primary.archiveLocator ?? primary.summary,
              qualifies: true,
            })),
          ],
        }
      : undefined,
    timeline: [
      ...(pack.timeline ?? []),
      {
        key: `${key}-current-review`,
        title: eventTitle,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: eventDescription,
        sourceKey: primary.key,
      },
    ],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const twistOfficial = source({
  key: "phase479-pelikan-twist-current-official",
  registryKey: "pelikan-official-phase479",
  registryName: "Pelikan official product pages",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "pelikan-official-phase479",
  title: "Twist Fountain Pens — Standard | Pelikan",
  url: "https://www.pelikan.com/int/products/writing/58-fountain-pens/61-twist-fountain-pens.html",
  summary:
    "官方当前页列 FP Twist P457 M Deep Blue 814744/814737，并说明扭转三角握位、软握区、左右手定位和钢笔/rollerball 产品边界。",
  author: "Pelikan",
});
const twistMam = source({
  key: "phase479-pelikan-twist-mam-current",
  registryKey: "pelikan-official-phase479",
  registryName: "Pelikan official product pages",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "pelikan-official-phase479",
  title: "Twist P457 Night Breeze / Fresh Melon | Pelikan MAM",
  url: "https://mam.pelikan.com/mam/en/pelikan/products/605472",
  summary:
    "官方 MAM 资料以 P457、M 尖、Night Breeze/Fresh Melon 和包装组合核对具体 SKU，不外推所有年份颜色和套装。",
  author: "Pelikan MAM",
});
const twistArchive = source({
  key: "phase479-pelikan-twist-archive-current",
  registryKey: "pelikan-collectibles-phase479",
  registryName: "Pelikan Collectibles",
  sourceType: "official",
  tier: "professional_secondary",
  independenceGroup: "pelikan-collectibles-phase479",
  title: "School & Youth Pens / Twist | Pelikan Collectibles",
  url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Cartridge-filler/School-youngsters-fp/index.html",
  summary:
    "专业型号档案记录现代 Twist 自 2013 年起、约 140 mm/17.5 mm/19 g/1.4 ml giant cartridge，并区分 Eco、Calligraphy 与 R457。",
  author: "Pelikan Collectibles",
});
const twistHistory = source({
  key: "phase479-pelikan-history-current",
  registryKey: "pelikan-official-phase479",
  registryName: "Pelikan official product pages",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "pelikan-official-phase479",
  title: "Pelikan History",
  url: "https://www.pelikan.com/ae/brand/pelikan-history.html",
  summary:
    "官方历史页用于说明传统 400 活塞路线的对照语境，不把 400/M400 的机构回填到 Twist P457。",
  author: "Pelikan",
});

const wancaiOfficial = source({
  key: "phase479-majohn-wancai-official-current",
  registryKey: "majohn-official-phase479",
  registryName: "Majohn official",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "majohn-official-phase479",
  title: "Majohn official site — contemporary model navigation",
  url: "https://www.majohnpen.com/",
  summary:
    "官方站用于确认 Majohn 当代品牌与型号导航语境；不从导航页臆造 Wancai 的统一尺寸、批次材料或附件。",
  author: "Majohn",
});
const wancaiScientist = source({
  key: "phase479-majohn-wancai-scientist-current",
  registryKey: "fabulousscientist-wancai-phase479",
  registryName: "The Fabulous Scientist",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fabulousscientist-wancai-phase479",
  title: "Fountain Pen Review: Majohn Wancai",
  url: "https://thefabulousscientist.com/2024/06/09/fountain-pen-review-the-best-chinese-brand-fountain-pens-in-my-experience/",
  summary:
    "独立评测用于 Wancai 的短粗口袋比例、直灌容量与使用观察；单支体验不外推所有树脂、尖幅和代际。",
  author: "The Fabulous Scientist",
});
const wancaiNonopen = source({
  key: "phase479-majohn-wancai-nonopen-current",
  registryKey: "nonopen-wancai-phase479",
  registryName: "钢笔爱好者",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "nonopen-wancai-phase479",
  title: "Moonman 末匠 Wancai 丸彩评测",
  url: "https://www.nonopen.com/1618.html",
  summary:
    "中文专业资料记录透明旋涡树脂、IPG F 尖、约 2.5 ml 直灌与清洗建议；厚树脂和模压版本仍需分开。",
  author: "钢笔爱好者",
});
const wancaiForum = source({
  key: "phase479-majohn-wancai-forum-current",
  registryKey: "fpn-majohn-wancai-phase479",
  registryName: "Fountain Pen Network participants",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fpn-majohn-wancai-phase479",
  title: "Majohn Wancai and pocket-pen discussion",
  url: "https://www.fountainpennetwork.com/forum/topic/376167-majohn-v60/",
  summary:
    "玩家资料用于 Moonman/Majohn 名称和口袋笔边界旁证，不替代 Wancai 的商品号、重量或兼容性证据。",
  author: "Fountain Pen Network participants",
});

const v126Storefront = source({
  key: "phase479-asvine-storefront-current",
  registryKey: "asvine-storefront-phase479",
  registryName: "Asvine storefront",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "asvine-storefront-phase479",
  title: "Asvine Pen",
  url: "https://www.asvinepen.com/",
  summary:
    "Asvine 当代产品集合入口用于发现 V126 等 SKU；页面所有权未独立证实，不据此推断法人、工厂、首发年或未列规格。",
  author: "Asvine storefront",
});
const v126Review = source({
  key: "phase479-asvine-v126-bottle-current",
  registryKey: "bottle-and-plume-asvine-phase479",
  registryName: "Bottle and Plume",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "bottle-and-plume-asvine-phase479",
  title: "Asvine V126 Fountain Pen Review",
  url: "https://www.bottleandplume.com/blogs/learn/asvine-v126-fountain-pen-review",
  summary:
    "独立评测确认 V126 的全尺寸真空路线、尾端 shutoff valve、钢尖和颜色/尖幅选择；样本手感不外推全系。",
  author: "Bottle and Plume",
});
const v126Sample = source({
  key: "phase479-asvine-v126-inky-current",
  registryKey: "inky-imaginings-asvine-phase479",
  registryName: "Inky Imaginings",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "inky-imaginings-asvine-phase479",
  title: "Review: Asvine V126 Fountain Pen",
  url: "https://inkyimaginings.com/2026/06/07/review-asvine-v126-fountain-pen/",
  summary:
    "2026 单支评测记录跳墨和抽墨不完全作为到手检查线索，不构成所有 V126 的批量质量结论。",
  author: "Inky Imaginings",
});
const v126P36 = source({
  key: "phase479-asvine-p36-contrast",
  registryKey: "fpnibs-asvine-phase479",
  registryName: "FPnibs",
  sourceType: "retailer",
  tier: "contemporary_archive",
  independenceGroup: "fpnibs-asvine-phase479",
  title: "Asvine P36",
  url: "https://www.fpnibs.com/products/asvine-p36",
  summary:
    "P36 商品页用于对照活塞、透明 acrylic 与钛配件路线，不回填 V126 的真空阀门或尖幅。",
  author: "FPnibs",
});

const twistScope: CuratedScope = {
  key: "phase479-twist-current-review",
  scopeKey: "phase479-twist-current-review",
  market: "Pelikan official international P457 product pages",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope: "P457 commonly uses a stainless-steel M nib; Calligraphy 1.5 is separate variant scope.",
  materialScope: "Twisted injection-moulded body and soft grip; Eco/Structure materials remain SKU-specific.",
  editionScope: "P457 fountain pen; R457 rollerball, Pelikano and historical Twist identifiers remain separate.",
};
const wancaiScope: CuratedScope = {
  key: "phase479-wancai-current-review",
  scopeKey: "phase479-wancai-current-review",
  market: "Majohn/Moonman Wancai public model and specialist review sources",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope: "Early public sample commonly shows an IPG #5 F nib; EF/F, glass and replacements require exact-version evidence.",
  materialScope: "Transparent or patterned resin, O-rings and trim vary between thick-resin and moulded versions.",
  editionScope: "Wancai pocket eyedropper; Mini 2, Q2, Q1 and M2 remain separate nearby models.",
};
const v126Scope: CuratedScope = {
  key: "phase479-v126-current-review",
  scopeKey: "phase479-v126-current-review",
  market: "Asvine contemporary product entry and independent V126 reviews",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope: "Steel nib; exact width, imprint, tuning and replacement compatibility require SKU or physical evidence.",
  materialScope: "Resin body in independent reviews; transparency, colour and accessories remain SKU-specific.",
  editionScope: "V126 vacuum filler with shutoff valve; P36 piston and V200 titanium routes remain siblings.",
};

const twistBase = base(PHASE479_IDS.twist, "Pelikan Twist P457");
const wancaiBase = base(PHASE479_IDS.wancai, "Majohn Wancai");
const v126Base = base(PHASE479_IDS.v126, "Asvine V126");

export const phase479PelikanTwistMajohnWancaiAsvineV126DepthPacks: CuratedEntityPack[] = [
  refresh(
    twistBase,
    "phase479-pelikan-twist-p457-depth-v1",
    ".planning/content-research/pelikan-twist-p457-phase479.md",
    twistOfficial,
    [twistMam, twistArchive, twistHistory],
    twistScope,
    [
      claim(twistOfficial, twistScope.scopeKey, "phase479-twist-current-sku", "current_sku_identity", "官方当前页列出 P457 M Deep Blue 814744/814737，并把扭转三角握位、软握区和钢笔书写模式作为产品特征。"),
      claim(twistArchive, twistScope.scopeKey, "phase479-twist-history-spec", "platform_specification", "专业档案记录现代 Twist 自 2013 年起，约 140 mm、17.5 mm、19 g 和 1.4 ml giant cartridge 为平台参考值。"),
      claim(twistMam, twistScope.scopeKey, "phase479-twist-filling", "filling_boundary", "P457 采用 Pelikan 墨囊，不应继承 M200/M400 活塞或瓶装容量；Night Breeze/Fresh Melon 资料是具体包装范围。"),
      claim(twistHistory, twistScope.scopeKey, "phase479-twist-neighbour-boundary", "neighbour_model_boundary", "传统 400 的活塞路线只作历史对照；R457 rollerball、Pelikano P450/P451 和历史学生线不合并到 P457。"),
    ],
    {
      series_name: "Pelikan Twist P457",
      release_year: "现代 Twist 平台自 2013 年起；当前 P457 SKU 于 2026-08-03 复核",
      origin_country: "德国品牌；单支制造地按具体 SKU 资料确认",
      nib: "不锈钢尖，普通 P457 常见 M；Calligraphy 1.5 为独立尖幅变体",
      fill_system: "Pelikan 大容量墨囊；不套用 M200/M400 活塞字段",
      material: "注塑笔身、扭转三角截面与软握区；Eco/Structure 按 SKU",
      dimensions: "档案平台参考：全长约 140 mm、最大径约 17.5 mm",
      weight: "档案平台参考约 19 g；不同包装和实物以单支为准",
      status: "官方当前产品线仍列 P457；R457、Pelikano 与历史学生线分开",
    },
    "Phase 479：Pelikan Twist P457 的扭转握位、墨囊与版本边界深化",
    "以当前官方 P457、MAM SKU、专业型号档案和历史对照复核 2013 平台、尺寸参考、墨囊路线及 Eco/Calligraphy/R457 分界。",
  ),
  refresh(
    wancaiBase,
    "phase479-majohn-wancai-depth-v1",
    ".planning/content-research/majohn-wancai-phase479.md",
    wancaiOfficial,
    [wancaiScientist, wancaiNonopen, wancaiForum],
    wancaiScope,
    [
      claim(wancaiOfficial, wancaiScope.scopeKey, "phase479-wancai-identity", "model_identity", "Wancai/丸彩是 Majohn 独立的短粗口袋直灌型号；Moonman 旧名是名称历史，不是另一支笔。"),
      claim(wancaiNonopen, wancaiScope.scopeKey, "phase479-wancai-spec", "sample_specification", "中文专业资料记录透明旋涡树脂、IPG 五号 F 尖、约 2.5 ml 直灌和约 3.4/4.7 英寸比例；这些是样本和版本范围。"),
      claim(wancaiScientist, wancaiScope.scopeKey, "phase479-wancai-pocket-use", "pocket_use_context", "独立评测用于短粗、帖帽书写和容量的日常观察；不外推厚树脂、模压、颜色或所有批次。", "editorial"),
      claim(wancaiForum, wancaiScope.scopeKey, "phase479-wancai-neighbour-boundary", "neighbour_model_boundary", "Wancai Mini 2、Q2、Q1 和 M2 可能共享透明树脂语境，但比例、填充和代际各自独立。"),
    ],
    {
      series_name: "Majohn Wancai 丸彩",
      release_year: "当代市场持续可见；具体代际与颜色首发年不由单支商品页外推",
      origin_country: "Majohn/Moonman 当代市场产品线；单支制造信息按可追溯资料确认",
      nib: "常见五号钢尖，早期样本常见 IPG F；EF/F、玻璃尖与替换件按版本",
      fill_system: "eyedropper 直灌；部分版本随附墨囊或玻璃滴管",
      material: "透明或带纹理树脂；厚树脂、模压、O 形圈和饰件按版本",
      dimensions: "参考样本约 3.4 英寸合盖、4.7 英寸帖帽；不同代际不共用定值",
      weight: "厚树脂与模压版本差异明显；不作全系列统一重量",
      status: "当代市场仍可见；颜色、代际、尖幅和附件随渠道变化",
    },
    "Phase 479：Majohn Wancai 丸彩的直灌、帖帽与代际边界深化",
    "以 Majohn 官方入口、中文专业评测、独立样本和玩家资料复核短粗口袋比例、直灌/O 形圈、五号尖及 Mini/Q2/M2 分界。",
  ),
  refresh(
    v126Base,
    "phase479-asvine-v126-depth-v1",
    ".planning/content-research/asvine-v126-phase479.md",
    v126Storefront,
    [v126Review, v126Sample, v126P36],
    v126Scope,
    [
      claim(v126Review, v126Scope.scopeKey, "phase479-v126-identity", "model_identity", "独立评测把 V126 定位为全尺寸真空上墨、带尾端 shutoff valve 的 Asvine 型号；透明外观不替代结构证据。"),
      claim(v126Storefront, v126Scope.scopeKey, "phase479-v126-storefront-boundary", "current_sku_source_boundary", "Asvine 站点只作当代产品发现入口；未独立证实页面所有权时，不推断法人、工厂、首发年或未列规格。"),
      claim(v126Sample, v126Scope.scopeKey, "phase479-v126-sample-boundary", "quality_sample_boundary", "2026 单支评测出现跳墨/抽墨不完全，可用于到手检查，不能写成所有 V126 的批量质量结论。"),
      claim(v126P36, v126Scope.scopeKey, "phase479-v126-p36-boundary", "filling_system_boundary", "P36 的透明 acrylic/钛配件/活塞路线只作相邻对照，不回填 V126 的真空阀门、尖幅或容量。"),
    ],
    {
      series_name: "Asvine V126 Vacuum Filling Fountain Pen",
      release_year: "当代独立评测与商品集合可见；首发年份待可追溯目录核实",
      origin_country: "Asvine 当代市场产品线；制造方、工厂、批次和销售地区按可追溯资料确认",
      nib: "钢尖；具体线宽、刻印、调校和可替换性按 SKU/实物核对",
      fill_system: "真空上墨，带尾端止墨阀",
      material: "独立评测确认树脂笔身；颜色、透明度和配件按 SKU",
      dimensions: "全尺寸真空笔；精确长度和直径不由相邻型号外推",
      weight: "按具体 SKU/实物核对；不以单支评测外推",
      status: "当代独立评测与商品渠道可见；颜色、笔尖、套装和库存按地区 SKU",
    },
    "Phase 479：Asvine V126 真空杆、止墨阀与到手检查深化",
    "以 Asvine 产品入口、Bottle and Plume、Inky Imaginings 与 P36 对照资料复核 V126 的真空动作、止墨阀、样本质量边界和保守维护。",
  ),
];

if (
  new Set(phase479PelikanTwistMajohnWancaiAsvineV126DepthPacks.map((pack) => pack.entityId)).size !==
  3
) {
  throw new Error("Phase 479 Pelikan/Majohn/Asvine packs must contain three unique entities.");
}
