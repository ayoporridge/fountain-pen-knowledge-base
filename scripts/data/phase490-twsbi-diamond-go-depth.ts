import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase141AllPacks, PHASE141_IDS } from "./phase141-taiwan-twsbi-representative-batch";
import { createPhase70TwsbiPacks } from "./phase70-twsbi-p0";

export const PHASE490_TWSBI_GO_ID = "LRlvQscC9w-i";
export const PHASE490_IDS = {
  diamond580: PHASE141_IDS.diamond580,
  diamond580alr: PHASE141_IDS.diamond580alr,
  go: PHASE490_TWSBI_GO_ID,
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
  author: string;
  publishedAt?: string;
}): CuratedSource {
  return {
    ...input,
    homepageUrl: input.url.startsWith("http") ? new URL(input.url).origin : "/",
    itemType: "web_page",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 490 exact-model depth refresh`,
  };
}

function claim(sourceItem: CuratedSource, scopeKey: string, key: string, predicate: string, objectText: string, factClass: CuratedClaim["factClass"] = "core"): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "editorial" ? 0.95 : 0.98,
    sourceKey: sourceItem.key,
    locator: sourceItem.summary,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator: sourceItem.summary }],
  };
}

function findPen(packs: CuratedEntityPack[], entityId: string, label: string): CuratedEntityPack {
  const pack = packs.find((candidate) => candidate.entityId === entityId && candidate.expectedType === "pen");
  if (!pack) throw new Error(`Phase 490 ${label} base pack is missing.`);
  return pack;
}

function refresh(pack: CuratedEntityPack, input: {
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
}): CuratedEntityPack {
  const aliases = [...(pack.aliases ?? []), { alias: pack.canonicalName, language: "en", sourceKey: input.primary.key }].filter((alias, index, all) => all.findIndex((candidate) => candidate.alias === alias.alias) === index);
  const sources = [...(pack.sources ?? []), input.primary, ...input.extras].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index);
  const scopes = [...(pack.scopes ?? []), input.scope].filter((item, index, all) => all.findIndex((candidate) => candidate.scopeKey === item.scopeKey) === index);
  const variants = [...(pack.variants ?? []), ...input.variants].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index);
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
    timeline: [...(pack.timeline ?? []), { key: `${input.key}-current-review`, title: input.eventTitle, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: input.eventDescription, sourceKey: input.primary.key }],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const diamondOfficial = source({ key: "phase490-twsbi-diamond-official", registryKey: "twsbi-official-phase490-diamond", registryName: "TWSBI", sourceType: "official", tier: "primary", independenceGroup: "twsbi-official-phase490-diamond", title: "Diamond 580 Clear Fountain Pen", url: "https://www.twsbi.com/products/twsbi-diamond-580-clear-fountain-pen", summary: "官方当前页列 EF/F/M/B/Stub 1.1、旋钮活塞、比 530 增加约 30% 储墨量、改进握位与笔帽螺纹，并说明部件可拆。", author: "TWSBI" });
const diamondTutorial = source({ key: "phase490-twsbi-diamond-tutorial", registryKey: "twsbi-official-phase490-tutorial", registryName: "TWSBI", sourceType: "official", tier: "primary", independenceGroup: "twsbi-official-phase490-tutorial", title: "How to remove/insert the inner cap", url: "https://www.twsbi.com/blogs/tutorials/how-to-remove-insert-the-inner-cap", summary: "官方教程把内帽拆装和活塞钢笔教程分开，支持密封、清洁与工具边界，不扩写为任意型号的强拆许可。", author: "TWSBI" });
const diamondNib = source({ key: "phase490-twsbi-diamond-nib", registryKey: "twsbi-official-phase490-nib", registryName: "TWSBI", sourceType: "official", tier: "primary", independenceGroup: "twsbi-official-phase490-nib", title: "Diamond 580 Nib Set", url: "https://www.twsbi.com/products/twsbi-diamond-580-nib-set", summary: "官方替换尖套装列 EF/F/M/B/Stub 1.1，并说明适用于 Diamond 580 与上一代 540、530；不据此推断 GO 或 VAC700R 的无条件兼容。", author: "TWSBI" });
const diamondGoulet = source({ key: "phase490-twsbi-diamond-goulet", registryKey: "goulet-twsbi-phase490-diamond", registryName: "The Goulet Pen Company", sourceType: "retailer", tier: "professional_secondary", independenceGroup: "goulet-twsbi-phase490-diamond", title: "TWSBI Diamond 580 fountain pen", url: "https://www.gouletpens.com/products/twsbi-diamond-580-fountain-pen", summary: "独立零售档案交叉核对标准 580 的商品身份和尖幅；颜色、库存与单支量测不外推为全系列固定值。", author: "The Goulet Pen Company" });
const diamondFpn = source({ key: "phase490-twsbi-diamond-fpn", registryKey: "fpn-twsbi-phase490-diamond", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", independenceGroup: "fpn-twsbi-phase490-diamond", title: "TWSBI Diamond 580 review", url: "https://www.fountainpennetwork.com/forum/topic/294667-twsbi-diamond-580-review/", summary: "独立用户评测提供拆洗、透明示范笔与书写样本语境；不替代官方结构和当前库存。", author: "Fountain Pen Network", publishedAt: "2015-08-02" });

const alrOfficial = source({ key: "phase490-twsbi-alr-official", registryKey: "twsbi-official-phase490-alr", registryName: "TWSBI", sourceType: "official", tier: "primary", independenceGroup: "twsbi-official-phase490-alr", title: "Diamond 580ALR Nickel Gray Fountain Pen", url: "https://www.twsbi.com/products/twsbi-diamond-580alr-nickel-gray-fountain-pen", summary: "官方页列哑光表面、机械加工铝制握位／连接件／活塞杆、旋钮活塞、EF/F/M/B/Stub 1.1 与 580 平台演进。", author: "TWSBI" });
const alrPrussian = source({ key: "phase490-twsbi-alr-prussian", registryKey: "twsbi-official-phase490-alr-prussian", registryName: "TWSBI", sourceType: "official", tier: "primary", independenceGroup: "twsbi-official-phase490-alr-prussian", title: "Diamond 580ALR Prussian Blue Fountain Pen", url: "https://www.twsbi.com/products/twsbi-diamond-580alr-prussian-blue-fountain-pen", summary: "官方颜色 SKU 用于确认 Prussian Blue 是 ALR 的市场版本；不把单一颜色的库存和照片写成整个 ALR 的永久清单。", author: "TWSBI" });
const alrReview = source({ key: "phase490-twsbi-alr-penaddict", registryKey: "penaddict-twsbi-phase490-alr", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", independenceGroup: "penaddict-twsbi-phase490-alr", title: "TWSBI Diamond 580ALR Nickel Fountain Pen Review", url: "https://www.penaddict.com/blog/2018/9/20/twsbi-diamond-580alr-nickel-fountain-pen-review", summary: "独立评测记录 Nickel 580ALR 的哑光铝质外观、握持和长时间使用样本；个人可靠性体验不扩大为全批次保证。", author: "The Pen Addict", publishedAt: "2018-09-20" });
const alrBuchan = source({ key: "phase490-twsbi-alr-buchan", registryKey: "buchan-twsbi-phase490-alr", registryName: "Buchan's Kerrisdale Stationery", sourceType: "blog", tier: "professional_secondary", independenceGroup: "buchan-twsbi-phase490-alr", title: "The New TWSBI Diamond 580ALR Prussian Blue", url: "https://www.buchanst.com/blogs/blog/twsbi-diamond-580alr-prussian-blue-fountain-pen-review", summary: "另一独立样本记录 Prussian Blue 的握持、透明储墨腔和活塞体验；不取代官方材料字段。", author: "Buchan's Kerrisdale Stationery", publishedAt: "2020-08-07" });

const goOfficial = source({ key: "phase490-twsbi-go-official", registryKey: "twsbi-official-phase490-go", registryName: "TWSBI", sourceType: "official", tier: "primary", independenceGroup: "twsbi-official-phase490-go", title: "GO Clear Fountain Pen", url: "https://www.twsbi.com/products/twsbi-go-clear-fountain-pen", summary: "官方页确认 spring-loaded piston、按下并释放吸墨、EF/F/M/B/Stub 1.1 与不随笔附墨水；GO 不是旋钮活塞。", author: "TWSBI" });
const goCollection = source({ key: "phase490-twsbi-go-collection", registryKey: "twsbi-official-phase490-go-collection", registryName: "TWSBI", sourceType: "official", tier: "primary", independenceGroup: "twsbi-official-phase490-go-collection", title: "GO Fountain Pens collection", url: "https://www.twsbi.com/collections/fountain-pens/go", summary: "官方集合页将 Clear、Sapphire、Smoke 分成当前 GO 颜色商品；库存和价格是检索日期的市场快照。", author: "TWSBI" });
const goJapan = source({ key: "phase490-twsbi-go-japan", registryKey: "twsbi-japan-phase490-go", registryName: "TWSBI Japan", sourceType: "official", tier: "contemporary_archive", independenceGroup: "twsbi-japan-phase490-go", title: "GO Clear", url: "https://twsbijapan.com/products/twsbi-go-clear/", summary: "TWSBI Japan Clear 页列约 133 mm 收纳、124 mm 无帽、173 mm 插帽、约 17 g 和最大约 1.4 ml；数值保留为日本 Clear 作用域。", author: "TWSBI Japan" });
const goGoulet = source({ key: "phase490-twsbi-go-goulet", registryKey: "goulet-twsbi-phase490-go", registryName: "The Goulet Pen Company", sourceType: "retailer", tier: "professional_secondary", independenceGroup: "goulet-twsbi-phase490-go", title: "TWSBI GO Fountain Pen Clear", url: "https://www.gouletpens.com/products/twsbi-go-fountain-pen-clear", summary: "独立零售量测给 Clear 样本约 134 mm、171.9 mm 插帽、17 g、1.61 ml；与日本官方容量口径并列，不拼成统一值。", author: "The Goulet Pen Company" });
const goPastor = source({ key: "phase490-twsbi-go-pastor", registryKey: "pastor-twsbi-phase490-go", registryName: "Pastor and Pen", sourceType: "blog", tier: "professional_secondary", independenceGroup: "pastor-twsbi-phase490-go", title: "TWSBI Go Fountain Pen review", url: "https://www.pastorandpen.com/blog/2019/2/20/twsbi-go-fountain-pen-review", summary: "独立评测解释弹簧活塞的按压、释放与粗握位体验；个人书写感受不外推为每个手型的结论。", author: "Pastor and Pen", publishedAt: "2019-02-20" });
const goGentleman = source({ key: "phase490-twsbi-go-gentleman", registryKey: "gentleman-twsbi-phase490-go", registryName: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", independenceGroup: "gentleman-twsbi-phase490-go", title: "So Ugly It's Cute? My Thoughts on the TWSBI Go", url: "https://www.gentlemanstationer.com/blog/2018/9/11/so-ugly-its-cute-my-thoughts-on-the-twsbi-go", summary: "独立文章从 plunger／spring-loaded piston 角度说明 GO 的入门定位与非转换器使用场景。", author: "The Gentleman Stationer", publishedAt: "2018-09-11" });

const phase70TwsbiPacks = createPhase70TwsbiPacks({ mini: "4fJHjzNt8KfK", go: PHASE490_TWSBI_GO_ID, vac: "16So7O06Q6K1" });
const diamond580Base = findPen(phase141AllPacks, PHASE490_IDS.diamond580, "TWSBI Diamond 580");
const diamond580AlrBase = findPen(phase141AllPacks, PHASE490_IDS.diamond580alr, "TWSBI Diamond 580ALR");
const goBase = findPen(phase70TwsbiPacks, PHASE490_IDS.go, "TWSBI GO");

const diamond580Scope: CuratedScope = { key: "phase490-twsbi-diamond-580-scope", scopeKey: "phase490-twsbi-diamond-580-scope", productionState: "current", editionScope: "标准 Diamond 580；透明／颜色树脂与常规饰件，旋钮活塞、EF/F/M/B/Stub 1.1；580AL/ALR、Mini、GO、VAC700R 不继承。" };
const diamond580AlrScope: CuratedScope = { key: "phase490-twsbi-diamond-580alr-scope", scopeKey: "phase490-twsbi-diamond-580alr-scope", productionState: "current", editionScope: "Diamond 580ALR；机械加工铝制握位、连接件与活塞杆，哑光／阳极氧化表面，旋钮活塞；标准 580 和 Mini AL 独立。" };
const goScope: CuratedScope = { key: "phase490-twsbi-go-scope", scopeKey: "phase490-twsbi-go-scope", productionState: "current", editionScope: "TWSBI GO Clear／Sapphire／Smoke；弹簧活塞、snap cap、EF/F/M/B/Stub 1.1 与瓶装墨水，官方日本和零售尺寸容量按样本分开。" };

export const phase490TwsbiDiamondGoDepthPacks: CuratedEntityPack[] = [
  refresh(diamond580Base, {
    key: "phase490-twsbi-diamond-580-depth-v1",
    markdownFile: ".planning/content-research/twsbi-diamond-580-phase490.md",
    storyTitle: "TWSBI Diamond 580：标准旋钮活塞、可拆结构与 ALR 边界",
    primary: diamondOfficial,
    extras: [diamondTutorial, diamondNib, diamondGoulet, diamondFpn],
    scope: diamond580Scope,
    claims: [
      claim(diamondOfficial, diamond580Scope.scopeKey, "phase490-twsbi-diamond-580-identity", "model_identity", "标准 TWSBI Diamond 580 是独立旋钮活塞型号；旧混名中的 580AL／580ALR、Mini、GO 和 VAC700R 不合并。"),
      claim(diamondOfficial, diamond580Scope.scopeKey, "phase490-twsbi-diamond-580-spec", "specification", "官方当前页列 EF/F/M/B/Stub 1.1、比 530 增加约 30% 储墨量、改进握位与笔帽螺纹，并说明部件可拆。"),
      claim(diamondNib, diamond580Scope.scopeKey, "phase490-twsbi-diamond-580-nib", "nib_boundary", "官方替换尖套装支持 Diamond 580 与上一代 530/540；不据此推断 GO、Mini 或 VAC700R 的无条件互换。"),
      claim(diamondTutorial, diamond580Scope.scopeKey, "phase490-twsbi-diamond-580-care", "maintenance_guidance", "内帽与活塞教程支持按工具和顺序进行清洁维护；可拆部件不等于新笔应频繁强拆。", "editorial"),
      claim(diamondGoulet, diamond580Scope.scopeKey, "phase490-twsbi-diamond-580-retail", "market_boundary", "独立零售档案交叉核对标准 580 商品身份和尖幅；库存、颜色和样本量测按页面日期。"),
      claim(diamondFpn, diamond580Scope.scopeKey, "phase490-twsbi-diamond-580-sample", "sample_experience_boundary", "独立评测提供透明示范笔和拆洗语境，不替代官方规格或把单支体验外推到全批次。"),
    ],
    values: { series_name: "TWSBI Diamond 580", release_year: "Diamond 530/540/580 演进；标准 580 首发年份未由本批确认", origin_country: "TWSBI 品牌产品线；不从零售页面推断具体工厂", nib: "不锈钢 EF/F/M/B/Stub 1.1；按当前 SKU 与替换尖套装核对", fill_system: "旋钮驱动的内置活塞，使用瓶装墨水；可拆部件按教程维护", material: "透明或半透明树脂笔身与常规饰件；Clear 和颜色属于市场 SKU", dimensions: "不同颜色与测量方式未确认统一值；以 exact SKU 或同一量测口径为准", weight: "不同颜色、配件和测量方式可能不同；未确认统一值时保留样本边界", status: "当前标准 Diamond 580；580AL/ALR、Mini、GO、VAC700R 独立" },
    variants: [
      { key: "phase490-twsbi-diamond-580-clear", name: "Diamond 580 Clear（Phase 490 复核）", notes: "官方当前页的透明树脂与尖号锚点；不把 Clear 的库存和照片当作所有颜色永久事实。", sourceKey: diamondOfficial.key, variantKind: "market_sku" },
      { key: "phase490-twsbi-diamond-580-colors", name: "Diamond 580 颜色／饰件 SKU（Phase 490 复核）", notes: "颜色与常规饰件仍在标准旋钮活塞平台内；AL、ALR、RoseGold 的部件差异另记。", sourceKey: diamondOfficial.key, variantKind: "color" },
      { key: "phase490-twsbi-diamond-580-alr-sibling", name: "580AL／580ALR（兄弟路线，Phase 490 复核）", notes: "只作身份导航，不把铝制握位、连接件、活塞杆或哑光照片回填到标准 580。", sourceKey: diamondGoulet.key, variantKind: "edition_group" },
    ],
    eventTitle: "Phase 490：标准 Diamond 580 旋钮活塞与可拆维护边界深化",
    eventDescription: "补足官方演进、尖号、可拆部件、清洗、二手验收和 580AL/ALR、Mini、GO、VAC700R 身份边界。",
  }),
  refresh(diamond580AlrBase, {
    key: "phase490-twsbi-diamond-580alr-depth-v1",
    markdownFile: ".planning/content-research/twsbi-diamond-580alr-phase490.md",
    storyTitle: "TWSBI Diamond 580ALR：铝制握位、哑光表面与标准 580 的边界",
    primary: alrOfficial,
    extras: [alrPrussian, alrReview, alrBuchan, diamondOfficial, diamondNib],
    scope: diamond580AlrScope,
    claims: [
      claim(alrOfficial, diamond580AlrScope.scopeKey, "phase490-twsbi-alr-identity", "model_identity", "Diamond 580ALR 是标准 580 的铝件兄弟型号；机械加工铝制握位、连接件和活塞杆决定其独立身份。"),
      claim(alrOfficial, diamond580AlrScope.scopeKey, "phase490-twsbi-alr-spec", "specification", "官方 Nickel Gray 页列哑光表面、铝制握位／连接件／活塞杆、旋钮活塞和 EF/F/M/B/Stub 1.1。"),
      claim(alrPrussian, diamond580AlrScope.scopeKey, "phase490-twsbi-alr-colors", "market_sku", "Prussian Blue 是 ALR 的具体颜色商品；颜色库存和照片不覆盖全系列。"),
      claim(alrReview, diamond580AlrScope.scopeKey, "phase490-twsbi-alr-sample", "sample_experience_boundary", "Pen Addict 独立样本补充哑光铝件、握持与长期使用语境，不是整条产品线耐久保证。"),
      claim(alrBuchan, diamond580AlrScope.scopeKey, "phase490-twsbi-alr-prussian-sample", "sample_experience_boundary", "Buchan 独立样本补充 Prussian Blue 的外观和活塞体验，保持 exact color 边界。"),
      claim(diamondOfficial, diamond580AlrScope.scopeKey, "phase490-twsbi-alr-family", "series_boundary", "标准 580 的树脂握位与常规饰件不能回填 ALR；两者共享 Diamond 活塞家族但材料和手感独立。"),
    ],
    values: { series_name: "TWSBI Diamond 580ALR", release_year: "当前 ALR 产品代际；精确首发年份未确认", origin_country: "TWSBI 品牌产品线；不由零售商地址推断工厂", nib: "不锈钢 EF/F/M/B/Stub 1.1；按 exact SKU 与库存核对", fill_system: "Diamond 旋钮活塞，使用瓶装墨水；可拆部件按教程和工具边界维护", material: "透明树脂主体配机械加工铝制握位、连接件与活塞杆；哑光／阳极氧化表面按 SKU", dimensions: "不同颜色与市场未确认统一量值；不把普通 580 或单个样本外推", weight: "铝件、颜色和测量方式会影响重量；未确认统一值时保留样本边界", status: "当前 Diamond 580ALR 兄弟系列；标准 580、Mini AL、GO、VAC700R 独立" },
    variants: [
      { key: "phase490-twsbi-alr-nickel", name: "580ALR Nickel Gray（Phase 490 复核）", notes: "官方哑光铝件和尖号锚点；颜色库存不代表整个 ALR。", sourceKey: alrOfficial.key, variantKind: "market_sku" },
      { key: "phase490-twsbi-alr-prussian", name: "580ALR Prussian Blue（Phase 490 复核）", notes: "具体颜色 SKU；独立评测的外观、价格和手感保持样本边界。", sourceKey: alrPrussian.key, variantKind: "color" },
      { key: "phase490-twsbi-alr-material", name: "机械加工铝制握位／连接件／活塞杆（Phase 490 复核）", notes: "材料部件是 ALR 身份线索，不代表整支笔为金属或具有防摔保证。", sourceKey: alrOfficial.key, variantKind: "material" },
    ],
    eventTitle: "Phase 490：Diamond 580ALR 铝件、哑光表面与兄弟身份深化",
    eventDescription: "补足官方铝制部件和哑光边界、颜色 SKU、独立握持样本、清洗护理和标准 580／Mini AL／GO／VAC700R 区分。",
  }),
  refresh(goBase, {
    key: "phase490-twsbi-go-depth-v1",
    markdownFile: ".planning/content-research/twsbi-go-phase490.md",
    storyTitle: "TWSBI GO：弹簧活塞、瓶装墨水与 1.4／1.61 ml 的口径差",
    primary: goOfficial,
    extras: [goCollection, goJapan, goGoulet, goPastor, goGentleman],
    scope: goScope,
    claims: [
      claim(goOfficial, goScope.scopeKey, "phase490-twsbi-go-identity", "model_identity", "TWSBI GO 是按下并释放弹簧吸墨的独立型号；不是 Diamond 580/ECO 的旋钮活塞，也不是 VAC700R 的真空结构。"),
      claim(goOfficial, goScope.scopeKey, "phase490-twsbi-go-spec", "specification", "官方 GO Clear 页列 spring-loaded piston、EF/F/M/B/Stub 1.1，且墨水不随笔附送。"),
      claim(goCollection, goScope.scopeKey, "phase490-twsbi-go-colors", "market_sku", "官方集合页把 Clear、Sapphire、Smoke 分为当前 GO 颜色商品，库存和价格按检索日期。"),
      claim(goJapan, goScope.scopeKey, "phase490-twsbi-go-japan", "sample_specification", "TWSBI Japan Clear 给出约 133 mm 收纳、124 mm 无帽、173 mm 插帽、17 g、1.4 ml；数值限定在日本 Clear。"),
      claim(goGoulet, goScope.scopeKey, "phase490-twsbi-go-goulet", "sample_specification", "Goulet Clear 样本约 134 mm、171.9 mm 插帽、17 g、1.61 ml；与日本官方容量口径并列。"),
      claim(goPastor, goScope.scopeKey, "phase490-twsbi-go-filling", "filling_system", "独立评测解释按压弹簧、浸入墨水、缓慢释放完成一次吸墨，保持书写感受的样本边界。"),
      claim(goGentleman, goScope.scopeKey, "phase490-twsbi-go-position", "model_boundary", "独立文章从 plunger／spring-loaded piston 角度说明 GO 的入门定位，不把低价或手感写成普遍结论。", "editorial"),
    ],
    values: { series_name: "TWSBI GO", release_year: "现行系列；首发年份未由本批确认", origin_country: "TWSBI 品牌产品线；不由零售商地址推断工厂", nib: "不锈钢 EF/F/M/B/Stub 1.1；按 Clear、Sapphire、Smoke exact SKU 核对", fill_system: "spring-loaded piston 弹簧活塞；从瓶装墨水吸墨，按下并释放完成一次填充", material: "透明或半透明树脂笔身与弹簧按压机构；颜色和帽盖饰件按 SKU", dimensions: "TWSBI Japan Clear 约 133 mm 收纳、124 mm 无帽、173 mm 插帽；其它量测保留样本范围", weight: "TWSBI Japan Clear 约 17 g；独立量测同为约 17 g", status: "当前 GO Clear、Sapphire、Smoke 等颜色 SKU；ECO、Swipe、Diamond、VAC700R 独立" },
    variants: [
      { key: "phase490-twsbi-go-clear", name: "GO Clear（Phase 490 复核）", notes: "官方日本规格和 Goulet 样本的尺寸、重量、容量锚点；不外推到所有颜色。", sourceKey: goJapan.key, variantKind: "market_sku" },
      { key: "phase490-twsbi-go-sapphire-smoke", name: "GO Sapphire／Smoke（Phase 490 复核）", notes: "颜色 SKU 共享弹簧活塞身份，库存、色泽和包装按官方集合页。", sourceKey: goCollection.key, variantKind: "color" },
      { key: "phase490-twsbi-go-spring", name: "spring-loaded piston 弹簧活塞（Phase 490 复核）", notes: "按下—浸入—释放的动作是 GO 的身份线索；不与 580 旋钮活塞或 VAC 真空杆混用。", sourceKey: goOfficial.key, variantKind: "variant" },
    ],
    eventTitle: "Phase 490：GO 弹簧活塞、瓶装墨水和容量口径深化",
    eventDescription: "补足官方机构与尖号、颜色集合、日本规格、零售量测、独立操作体验、清洗携带和相邻 TWSBI 上墨路线边界。",
  }),
];
