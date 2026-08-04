import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { PHASE141_IDS, phase141AllPacks } from "./phase141-taiwan-twsbi-representative-batch";
import {
  PHASE158_PENBBS_456_ID,
  phase158PenBbs456Packs,
} from "./phase158-penbbs-456";
import { PHASE145_IDS, phase145Packs } from "./phase145-waldmann-tuscany-batch";

export const PHASE489_IDS = {
  ystudioClassicRevolve: PHASE141_IDS.classicRevolve,
  penbbs456: PHASE158_PENBBS_456_ID,
  waldmannTuscany: PHASE145_IDS.tuscany,
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
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 489 exact-model depth refresh`,
  };
}

function claim(
  sourceItem: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  factClass: CuratedClaim["factClass"] = "core",
  confidence = factClass === "editorial" ? 0.95 : 0.98,
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence,
    sourceKey: sourceItem.key,
    locator: sourceItem.summary,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator: sourceItem.summary }],
  };
}

function findPen(packs: CuratedEntityPack[], entityId: string, label: string): CuratedEntityPack {
  const pack = packs.find((candidate) => candidate.entityId === entityId && candidate.expectedType === "pen");
  if (!pack) throw new Error(`Phase 489 ${label} base pack is missing.`);
  return pack;
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
  ].filter((alias, index, all) => all.findIndex((candidate) => candidate.alias === alias.alias) === index);
  const sources = [...(pack.sources ?? []), input.primary, ...input.extras].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  const scopes = [...(pack.scopes ?? []), input.scope].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.scopeKey === item.scopeKey) === index,
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

const ystudioOfficial = source({
  key: "phase489-ystudio-classic-official",
  registryKey: "ystudio-official-phase489-classic",
  registryName: "YSTUDIO",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "ystudio-official-phase489-classic",
  title: "Classic Revolve-Fountain Pen (5 Colors)",
  url: "https://www.ystudiostyle.com/products/classic-revolve-fountain-pen",
  summary: "官方当前商品页列 Brass、Blue、Green、Red、Black，F/M、黄铜／铜材、13 × 11 × 138 mm、46 g 与国际标准转换器。",
  author: "YSTUDIO",
});
const ystudioGuide = source({
  key: "phase489-ystudio-classic-guide",
  registryKey: "ystudio-guide-phase489-classic",
  registryName: "YSTUDIO",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "ystudio-guide-phase489-classic",
  title: "Classic Revolve Fountain Pen Ink Converter Instruction",
  url: "https://www.ystudiostyle.com/blogs/guide/classic-revolve-fountain-pen-ink-converter-instruction",
  summary: "官方指南解释 converter 的 tight fit、首次安装的推入动作及 Schmidt 笔尖生产来源；不扩写为通用维修许可。",
  author: "YSTUDIO",
});
const ystudioCollection = source({
  key: "phase489-ystudio-classic-collection",
  registryKey: "ystudio-official-phase489-collection",
  registryName: "YSTUDIO",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "ystudio-official-phase489-collection",
  title: "Classic Revolve Series",
  url: "https://www.ystudiostyle.com/collections/ystudio-classic-revolve-series",
  summary: "官方系列导航将 Classic Revolve 的 fountain pen、便携钢笔、滚珠笔等工具分开，用于建立型号和书写机构边界。",
  author: "YSTUDIO",
});
const ystudioReview = source({
  key: "phase489-ystudio-classic-review",
  registryKey: "archer-phase489-ystudio-classic",
  registryName: "Rants of The Archer",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "archer-phase489-ystudio-classic",
  title: "YSTUDIO Classic Revolve Fountain Pen review",
  url: "https://archer-rantings.blogspot.com/2021/10/ystudio-classic-fountain-pen-review.html",
  summary: "独立评测提供样本握持和书写背景；不替代官方尺寸、颜色或当前库存。",
  author: "Rants of The Archer",
  publishedAt: "2021-10-01",
});

const penbbsStore = source({
  key: "phase489-penbbs-456-store",
  registryKey: "penbbsofficialstore-phase489-456",
  registryName: "PENBBSOfficialStore",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "penbbsofficialstore-phase489-456",
  title: "PENBBSOfficialStore Model 456",
  url: "https://www.etsy.com/ca/shop/PENBBSOfficialStore",
  summary: "品牌自营 Etsy 窗口当前把 Model 456 单独列在商品筛选中；销售状态和颜色按日期滚动，不替代旧批次的统一规格。",
  author: "PENBBSOfficialStore",
});
const penbbsTgs = source({
  key: "phase489-penbbs-456-tgs",
  registryKey: "gentleman-stationer-phase489-456",
  registryName: "The Gentleman Stationer",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "gentleman-stationer-phase489-456",
  title: "PenBBS 456 vacuum-filler review",
  url: "https://gentlemanstationer.squarespace.com/blog/2019/6/8/pen-review-penbbs-456-vacuum-filler-fountain-pen",
  summary: "独立评测确认 456 的 vacuum-filler、盲盖和树脂样本语境；个人体验不外推为全批次厂规。",
  author: "The Gentleman Stationer",
  publishedAt: "2019-06-08",
});
const penbbsPastor = source({
  key: "phase489-penbbs-456-pastor",
  registryKey: "pastor-and-pen-phase489-456",
  registryName: "Pastor and Pen",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pastor-and-pen-phase489-456",
  title: "PenBBS 456 Fountain Pen review",
  url: "https://www.pastorandpen.com/blog/2019/7/16/penbbs-456-fountain-pen-review",
  summary: "另一独立样本交叉记录真空动作、笔尖和树脂外观，保留样本和改装尖边界。",
  author: "Pastor and Pen",
  publishedAt: "2019-07-16",
});
const penbbsWriterShelf = source({
  key: "phase489-penbbs-456-writershelf",
  registryKey: "writershelf-phase489-456",
  registryName: "WriterShelf / EDC",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "writershelf-phase489-456",
  title: "PenBBS 456 Vac Filler",
  url: "https://www.writershelf.com/article/penbbs-456-vac-filler-advancing-the-art?locale=en&prne=rod",
  summary: "独立文章解释推杆到底部后的真空释放与吸墨动作；容量、密封和样本状态不被统一化。",
  author: "WriterShelf / EDC",
});
const penbbsUnsharpen = source({
  key: "phase489-penbbs-456-unsharpen",
  registryKey: "unsharpen-phase489-456",
  registryName: "Unsharpen",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "unsharpen-phase489-456",
  title: "PenBBS 456 model record",
  url: "https://unsharpen.com/pen/penbbs-456-fountain-pen/",
  summary: "结构化型号记录用于交叉核对 456 的 vacuum filler 定位和版本边界。",
  author: "Unsharpen",
});

const waldmannOfficial = source({
  key: "phase489-waldmann-tuscany-official",
  registryKey: "waldmann-official-phase489-tuscany",
  registryName: "Waldmann GmbH",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "waldmann-official-phase489-tuscany",
  title: "Tuscany Series",
  url: "https://www.waldmannpen.com/pens/tuscany",
  summary: "官方当前页分列钢尖与金尖，列线纹 guilloché 帽盖、黑色多层漆、铂化部件、141／105／11.7 mm、38 g、converter、6 墨囊和 EF/F/M/B。",
  author: "Waldmann GmbH",
});
const waldmannCare = source({
  key: "phase489-waldmann-tuscany-care",
  registryKey: "waldmann-official-phase489-care",
  registryName: "Waldmann GmbH",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "waldmann-official-phase489-care",
  title: "Waldmann Service & Care",
  url: "https://www.waldmannpen.com/service-care",
  summary: "官方 care 语境涵盖 converter、墨囊、清洁与不当水浴／超声波的风险；本页不把它扩大为自行拆解许可。",
  author: "Waldmann GmbH",
});
const waldmannAbout = source({
  key: "phase489-waldmann-tuscany-about",
  registryKey: "waldmann-official-phase489-about",
  registryName: "Waldmann GmbH",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "waldmann-official-phase489-about",
  title: "Waldmann official brand and manufacturing history",
  url: "https://www.waldmannpen.com/about",
  summary: "官方品牌页用于 1918 年 Pforzheim 起点、德国制造和银制传统背景；不把传统材料字段覆盖到 Tuscany 黑漆笔身。",
  author: "Waldmann GmbH",
});
const waldmannRetailer = source({
  key: "phase489-waldmann-tuscany-retailer",
  registryKey: "penchalet-phase489-tuscany",
  registryName: "Pen Chalet",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "penchalet-phase489-tuscany",
  title: "Waldmann Tuscany Fountain Pen",
  url: "https://www.penchalet.com/fine_pens/fountain_pens/waldmann_tuscany_fountain_pen.html",
  summary: "授权零售档案记录黑漆钢尖样本约 140.2 mm、39.41 g、#5 stainless steel、cartridge/converter 与 standard international cartridges。",
  author: "Pen Chalet",
});

const ystudioBase = findPen(phase141AllPacks, PHASE489_IDS.ystudioClassicRevolve, "YSTUDIO Classic Revolve");
const penbbsBase = findPen(phase158PenBbs456Packs, PHASE489_IDS.penbbs456, "PenBBS 456");
const waldmannBase = findPen(phase145Packs, PHASE489_IDS.waldmannTuscany, "Waldmann Tuscany");

const ystudioScope: CuratedScope = {
  key: "phase489-ystudio-classic-revolve-depth-scope",
  scopeKey: "phase489-ystudio-classic-revolve-depth-scope",
  productionState: "current",
  editionScope: "Classic Revolve Fountain Pen；Brass、Blue、Green、Red、Black 表面，F/M，13 × 11 × 138 mm、46 g、国际标准 converter 与 Schmidt 指南边界。",
};
const penbbsScope: CuratedScope = {
  key: "phase489-penbbs-456-depth-scope",
  scopeKey: "phase489-penbbs-456-depth-scope",
  productionState: "historical",
  editionScope: "PenBBS 456 真空上墨型号；尾部推杆、真空释放、盲盖阀、透明／半透明树脂及 Galaxy／Smog 外观，独立于 268、308、355。",
};
const waldmannScope: CuratedScope = {
  key: "phase489-waldmann-tuscany-depth-scope",
  scopeKey: "phase489-waldmann-tuscany-depth-scope",
  productionState: "current",
  editionScope: "Waldmann Tuscany fountain pen；钢尖／18 ct 金尖两种配置，共享 141／105／11.7 mm、38 g、螺旋帽和 converter／墨囊，滚珠笔与其它系列不继承。",
};

export const phase489YstudioPenbbsWaldmannDepthPacks: CuratedEntityPack[] = [
  refresh(ystudioBase, {
    key: "phase489-ystudio-classic-revolve-depth-v1",
    markdownFile: ".planning/content-research/ystudio-classic-revolve-phase489.md",
    storyTitle: "YSTUDIO Classic Revolve：六角黄铜、漆面磨损与紧配转换器",
    primary: ystudioOfficial,
    extras: [ystudioGuide, ystudioCollection, ystudioReview],
    scope: ystudioScope,
    claims: [
      claim(ystudioOfficial, ystudioScope.scopeKey, "phase489-ystudio-classic-identity", "model_identity", "Classic Revolve Fountain Pen 是 YSTUDIO 独立钢笔型号；便携钢笔、滚珠笔和铅笔保持独立。"),
      claim(ystudioOfficial, ystudioScope.scopeKey, "phase489-ystudio-classic-spec", "specification", "官方当前页列黄铜／铜材、13 × 11 × 138 mm、46 g、F/M 和 Brass、Blue、Green、Red、Black 五种表面。"),
      claim(ystudioOfficial, ystudioScope.scopeKey, "phase489-ystudio-classic-surface", "material_boundary", "Brass 是裸黄铜，颜色版本是哑光漆面；氧化与 brassing effect 是不同的使用变化，不另建隐藏型号。"),
      claim(ystudioGuide, ystudioScope.scopeKey, "phase489-ystudio-classic-converter", "filling_system", "Classic Revolve 使用国际标准 converter／墨囊；官方指南要求首次安装以 tight fit 推到位，并说明 Schmidt 笔尖来源。"),
      claim(ystudioGuide, ystudioScope.scopeKey, "phase489-ystudio-classic-care", "maintenance_guidance", "清洗用常温水吸排，裸黄铜与漆面采用不同擦拭边界；不以紧配接口为自行打磨或强拆许可。", "editorial"),
      claim(ystudioCollection, ystudioScope.scopeKey, "phase489-ystudio-classic-family", "series_boundary", "Classic Revolve 系列导航把 fountain pen 与其它书写工具分开，颜色库存和刻字按具体 SKU。"),
      claim(ystudioReview, ystudioScope.scopeKey, "phase489-ystudio-classic-sample", "sample_experience_boundary", "独立评测只补充样本握持与书写语境，不能替代官方 46 g、尺寸、颜色或当前库存。"),
    ],
    values: {
      series_name: "YSTUDIO Classic Revolve Fountain Pen",
      release_year: "官网称品牌十周年代表作；精确首发年未由当前页单独确认",
      origin_country: "YSTUDIO 台湾设计与产品身份；当前页未把工厂另行拆出",
      nib: "当前商品页 F 或 M；官方指南说明由 Schmidt 生产",
      fill_system: "国际标准墨囊／转换器；随笔附一个 converter，首次安装为 tight fit",
      material: "黄铜、铜；Brass 裸黄铜，其余颜色为哑光漆面并可能出现 brassing effect",
      dimensions: "官方 13 × 11 × 138 mm",
      weight: "官方 46 g；不含包装和刻字服务附加物",
      status: "当前 Classic Revolve 五色商品页；其它 YSTUDIO 工具不继承",
    },
    variants: [
      { key: "phase489-ystudio-classic-brass", name: "Brass（Phase 489 复核）", notes: "裸黄铜会氧化；氧化物无害，抛光或保留痕迹取决于使用者。", sourceKey: ystudioOfficial.key, variantKind: "color" },
      { key: "phase489-ystudio-classic-lacquer", name: "Blue／Green／Red／Black（Phase 489 复核）", notes: "哑光漆面可能露出黄铜；颜色、库存和刻字按 SKU。", sourceKey: ystudioOfficial.key, variantKind: "color" },
      { key: "phase489-ystudio-classic-nib", name: "F／M（Phase 489 复核）", notes: "当前商品页尖幅选择；实际线宽按纸张、墨水和单支调校。", sourceKey: ystudioOfficial.key, variantKind: "nib" },
    ],
    eventTitle: "Phase 489：Classic Revolve 表面、紧配转换器与六角握持深化",
    eventDescription: "补足五种表面、裸黄铜与漆面磨损、官方尺寸重量、F/M、Schmidt 尖来源、tight-fit converter 和相邻 YSTUDIO 工具边界。",
  }),
  refresh(penbbsBase, {
    key: "phase489-penbbs-456-depth-v1",
    markdownFile: ".planning/content-research/penbbs-456-phase489.md",
    storyTitle: "PenBBS 456：真空推杆、盲盖阀与换色成本",
    primary: penbbsStore,
    extras: [penbbsTgs, penbbsPastor, penbbsWriterShelf, penbbsUnsharpen],
    scope: penbbsScope,
    claims: [
      claim(penbbsStore, penbbsScope.scopeKey, "phase489-penbbs-456-identity", "model_identity", "PenBBS Model 456 是独立真空上墨型号；透明、Galaxy、Smog 是材料或销售批次线索，不与 268、308、355 合并。"),
      claim(penbbsWriterShelf, penbbsScope.scopeKey, "phase489-penbbs-456-filling", "filling_system", "尾部推杆把空气推出，推到底后的真空释放吸入墨水，盲盖控制前端供墨；吸墨量和密封状态按实物。"),
      claim(penbbsPastor, penbbsScope.scopeKey, "phase489-penbbs-456-nib", "nib_boundary", "公开样本常见 PenBBS 钢尖和 F；改装尖或替换尖不证明所有 456 出厂配置。"),
      claim(penbbsTgs, penbbsScope.scopeKey, "phase489-penbbs-456-material", "version_boundary", "透明／半透明树脂、Galaxy、Smog 与五金颜色属于外观或销售批次，不能把一个样本重量和纹理外推到全批次。"),
      claim(penbbsUnsharpen, penbbsScope.scopeKey, "phase489-penbbs-456-boundary", "series_boundary", "456 可与 268、308、355 和其它真空笔互链比较，但不同上墨机构、尺寸、阀门和零件保持独立。"),
      claim(penbbsTgs, penbbsScope.scopeKey, "phase489-penbbs-456-care", "maintenance_guidance", "换色需要多轮常温清水吸排；推杆阻力、盲盖漏墨或密封异常时停止强拉，不自行拆真空总成。", "editorial"),
      claim(penbbsStore, penbbsScope.scopeKey, "phase489-penbbs-456-market", "market_sku", "品牌自营窗口仍把 Model 456 单列，但颜色、库存和地区配件随日期滚动。"),
    ],
    values: {
      series_name: "PenBBS 456 Vacuum Filling Fountain Pen",
      release_year: "2018–2019 公开评测窗口；品牌首发年份未确认",
      origin_country: "中国 PenBBS 品牌语境；不由销售渠道推断工厂",
      nib: "PenBBS 钢尖；公开样本常见 F，尖单元按实物",
      fill_system: "真空上墨；尾部推杆、真空释放和盲盖供墨阀",
      material: "透明或半透明树脂／亚克力；Galaxy、Smog 等按批次记录",
      dimensions: "不同评测样本和套帽状态需分开量测；无统一全批次数字",
      weight: "以明确样本、是否套帽和测量方式为准",
      status: "历史／流通型号；自营窗口、二手库存和配件按日期变化",
    },
    variants: [
      { key: "phase489-penbbs-456-resin", name: "透明／半透明树脂样本（Phase 489 复核）", notes: "树脂透明度与纹理随批次变化，不能凭照片确认年份。", sourceKey: penbbsPastor.key, variantKind: "edition_group" },
      { key: "phase489-penbbs-456-galaxy-smog", name: "Galaxy／Smog 等材料名称（Phase 489 复核）", notes: "记录具体外观或销售批次，不拆成新的真空型号。", sourceKey: penbbsTgs.key, variantKind: "edition_group" },
      { key: "phase489-penbbs-456-vacuum", name: "推杆真空与盲盖阀（Phase 489 复核）", notes: "结构是 456 的身份线索；不与 Pilot 823、TWSBI Vac 推断零件兼容。", sourceKey: penbbsWriterShelf.key, variantKind: "variant" },
    ],
    eventTitle: "Phase 489：456 真空动作、盲盖密封与换色维护深化",
    eventDescription: "补足 456 的型号身份、真空释放步骤、材料批次、清洗成本、旅行风险、相邻 PenBBS 边界和独立样本范围。",
  }),
  refresh(waldmannBase, {
    key: "phase489-waldmann-tuscany-depth-v1",
    markdownFile: ".planning/content-research/waldmann-tuscany-phase489.md",
    storyTitle: "Waldmann Tuscany：线纹帽盖、钢／金尖与德国保养边界",
    primary: waldmannOfficial,
    extras: [waldmannCare, waldmannAbout, waldmannRetailer],
    scope: waldmannScope,
    claims: [
      claim(waldmannOfficial, waldmannScope.scopeKey, "phase489-waldmann-tuscany-identity", "model_identity", "Tuscany fountain pen 是 Waldmann 独立钢笔系列；滚珠、圆珠和铅笔保持不同书写机构。"),
      claim(waldmannOfficial, waldmannScope.scopeKey, "phase489-waldmann-tuscany-spec", "specification", "官方钢尖与金尖 fact sheet 均列闭盖 141 mm、去帽 105 mm、直径 11.7 mm、重量 38 g、converter、6 支墨囊和 EF/F/M/B。"),
      claim(waldmannOfficial, waldmannScope.scopeKey, "phase489-waldmann-tuscany-nib", "nib_boundary", "钢尖为 stainless-steel；金尖为 iridium-tipped 18 ct/750 gold、24 ct bicolor；两者尖材和价格独立。"),
      claim(waldmannOfficial, waldmannScope.scopeKey, "phase489-waldmann-tuscany-material", "material_boundary", "线纹 guilloché 帽盖、黑色多层漆、实心弹簧夹与铂化部件是官方结构；品牌 925 银制传统不覆盖 Tuscany 笔身。"),
      claim(waldmannRetailer, waldmannScope.scopeKey, "phase489-waldmann-tuscany-sample", "sample_specification", "Pen Chalet 黑漆钢尖样本约 140.2 mm、39.41 g、#5 stainless steel；与官方 141 mm／38 g 的差异保留为量测边界。"),
      claim(waldmannCare, waldmannScope.scopeKey, "phase489-waldmann-tuscany-care", "maintenance_guidance", "官方 care 语境支持 converter、墨囊和谨慎清洁；不当水浴、超声波、化学品或自行拆解可能越过保修边界。", "editorial"),
      claim(waldmannAbout, waldmannScope.scopeKey, "phase489-waldmann-tuscany-origin", "origin_boundary", "德国制造和 1918 年 Pforzheim 起点属于品牌背景；不得把银制传统写成 Tuscany 默认整支纯银。"),
    ],
    values: {
      series_name: "Waldmann Tuscany Fountain Pen",
      release_year: "当前官方 Tuscany 页面；首发年份未确认",
      origin_country: "德国制造；Waldmann 官方品牌语境",
      nib: "EF/F/M/B；不锈钢尖或 iridium-tipped 18 ct/750 gold 24 ct bicolor",
      fill_system: "converter；官方另列 6 支蓝或黑墨囊",
      material: "多层黑色亮漆、guilloché 线纹帽盖、实心弹簧夹、铂化金属部件；非默认整支银",
      dimensions: "闭盖 141 mm；去帽 105 mm；直径 11.7 mm",
      weight: "官方 38 g；Pen Chalet 黑漆钢尖样本约 39.41 g",
      status: "当前官方 Tuscany 系列；其它书写工具和 Waldmann 系列不继承",
    },
    variants: [
      { key: "phase489-waldmann-tuscany-steel", name: "Fountain Pen steel nib（Phase 489 复核）", notes: "不锈钢尖；EF/F/M/B、converter 和 6 支墨囊按官方 fact sheet。", sourceKey: waldmannOfficial.key, variantKind: "nib" },
      { key: "phase489-waldmann-tuscany-gold", name: "Fountain Pen gold nib（Phase 489 复核）", notes: "18 ct/750 gold、24 ct bicolor；不把金尖写成必然柔尖。", sourceKey: waldmannOfficial.key, variantKind: "nib" },
      { key: "phase489-waldmann-tuscany-care", name: "黑漆与铂化部件护理边界（Phase 489 复核）", notes: "不使用银器抛光膏、化学清洁剂或未经指导的水浴。", sourceKey: waldmannCare.key, variantKind: "material" },
    ],
    eventTitle: "Phase 489：Tuscany 钢／金尖、材料与保修护理深化",
    eventDescription: "补足官方尺寸附件、钢尖／18K 金尖边界、黑漆与铂化材料、品牌银制传统、零售样本差异和清洁保修限制。",
  }),
];
