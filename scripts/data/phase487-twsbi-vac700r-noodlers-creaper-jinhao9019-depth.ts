import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  createPhase70TwsbiPacks,
} from "./phase70-twsbi-p0";
import {
  PHASE214_NIB_CREAPER_ID,
  phase214NoodlersNibCreaperPacks,
} from "./phase214-noodlers-nib-creaper";
import {
  PHASE90_JINHAO_9019_ID,
  phase90JinhaoPacks,
} from "./phase90-jinhao-82-9019";

export const PHASE487_IDS = {
  twsbiVac700r: "16So7O06Q6K1",
  noodlersNibCreaper: PHASE214_NIB_CREAPER_ID,
  jinhao9019: PHASE90_JINHAO_9019_ID,
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
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 487 exact-model depth refresh`,
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

function modelPack(entityId: string, label: string): CuratedEntityPack {
  const twsbi = createPhase70TwsbiPacks({ mini: "4fJHjzNt8KfK", go: "LRlvQscC9w-i", vac: "16So7O06Q6K1" });
  const all = [...twsbi, ...phase214NoodlersNibCreaperPacks, ...phase90JinhaoPacks()];
  const pack = all.find((candidate) => candidate.entityId === entityId && candidate.expectedType === "pen");
  if (!pack) throw new Error(`Phase 487 ${label} base pack is missing.`);
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
  const aliases = [...(pack.aliases ?? []), { alias: pack.canonicalName, language: "en", sourceKey: input.primary.key }].filter(
    (alias, index, all) => all.findIndex((candidate) => candidate.alias === alias.alias) === index,
  );
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

const twsbiOfficial = source({
  key: "phase487-twsbi-vac700r-official",
  registryKey: "twsbi-official-phase487-vac700r",
  registryName: "TWSBI official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "twsbi-official-phase487-vac700r",
  title: "TWSBI VAC700R Clear Fountain Pen",
  url: "https://www.twsbi.com/products/twsbi-vac700-fountain-pen",
  summary: "官方 Clear 页面确认 VAC700R 的真空上墨、独立 ink shut-off valve，并列 EF/F/M/B/Stub 1.1/Stub 1.5；当前页面不是首发年份证明。",
  author: "TWSBI",
});
const twsbiVariants = source({
  key: "phase487-twsbi-vac700r-variants",
  registryKey: "twsbi-official-phase487-vac700r-family",
  registryName: "TWSBI official",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "twsbi-official-phase487-vac700r-family",
  title: "TWSBI VAC700R Iris and Kyanite",
  url: "https://www.twsbi.com/products/twsbi-vac700r-iris-fountain-pen",
  summary: "官方同平台页面用于确认 Iris、Kyanite 等 finish 仍属于 VAC700R 真空平台；颜色与饰件不能回填为 Clear 的固定外观。",
  author: "TWSBI",
});
const twsbiGoulet = source({
  key: "phase487-twsbi-vac700r-goulet",
  registryKey: "goulet-phase487-twsbi-vac700r",
  registryName: "The Goulet Pen Company",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "goulet-phase487-twsbi-vac700r",
  title: "TWSBI VAC700R Fountain Pen Clear",
  url: "https://www.gouletpens.com/products/twsbi-vac700r-fountain-pen-clear",
  summary: "零售量测把 Clear 样本列为约 147 mm、35 g、握位约 10 mm、最大容量约 2.37 ml；规格与容量属于明确样本和测量口径。",
  author: "The Goulet Pen Company",
});
const twsbiFill = source({
  key: "phase487-twsbi-vac-full-fill",
  registryKey: "goulet-phase487-twsbi-vac-blog",
  registryName: "The Goulet Pen Company blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "goulet-phase487-twsbi-vac-blog",
  title: "Getting a Full Fill on the TWSBI Vac 700",
  url: "https://www.gouletpens.com/blogs/fountain-pen-blog/getting-full-fill-on-twsbi-vac-700",
  summary: "独立文章区分普通约 1.5 ml 与特定排气、满填流程约 2.3 ml，并提醒旧 Vac-700 与 VAC700R 的代际边界。",
  author: "The Goulet Pen Company",
});

const noodlersOfficial = source({
  key: "phase487-noodlers-standard-flex-official",
  registryKey: "noodlers-official-phase487-creaper",
  registryName: "Noodler's Ink",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "noodlers-official-phase487-creaper",
  title: "Standard Flex Nibs Pens",
  url: "https://noodlersink.com/product-category/pens/standard-flex-nibs-pens/",
  summary: "官方目录把 Standard Creaper／Standard Flex 与 Ahab、Konrad、Neponset 分开，支持 Nib Creaper 的产品线身份边界。",
  author: "Noodler's Ink",
});
const noodlersSku = source({
  key: "phase487-noodlers-17000-official",
  registryKey: "noodlers-official-phase487-sku",
  registryName: "Noodler's Ink",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "noodlers-official-phase487-sku",
  title: "17000 Clear Piston Std Flex",
  url: "https://noodlersink.com/product/17000-clear-piston-std-flex/",
  summary: "官方 SKU 页面确认 17000 Clear Piston Std Flex 的型号命名和 Clear demonstrator 语境；价格、库存会滚动变化。",
  author: "Noodler's Ink",
});
const noodlersWonder = source({
  key: "phase487-noodlers-creaper-wonderpens",
  registryKey: "wonderpens-phase487-noodlers",
  registryName: "Wonder Pens",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "wonderpens-phase487-noodlers",
  title: "Noodler's Nib Creaper Flex Fountain Pen review",
  url: "https://wonderpens.ca/blogs/pens-and-things/noodlers-nib-creaper-flex-fountain-pen-review",
  summary: "评测记录小笔身、旋转活塞、墨窗、可拆清洁、flex 压力条件和早期 feed 调整；均为样本与使用经验。",
  author: "Wonder Pens",
});
const noodlersFpn = source({
  key: "phase487-noodlers-creaper-fpn",
  registryKey: "fpn-phase487-noodlers",
  registryName: "Fountain Pen Network participants",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fpn-phase487-noodlers",
  title: "Noodler's Nib Creaper",
  url: "https://www.fountainpennetwork.com/forum/topic/176104-noodlers-nib-creaper/",
  summary: "社区样本补充旋转活塞、墨量和出墨问题；用于风险边界，不把一支断墨笔外推为全系故障。",
  author: "Fountain Pen Network participants",
});

const jinhaoSbre = source({
  key: "phase487-jinhao-9019-sbrebrown",
  registryKey: "sbrebrown-phase487-jinhao9019",
  registryName: "SBRE Brown",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "sbrebrown-phase487-jinhao9019",
  title: "Jinhao 9019 Fountain Pen Review",
  url: "https://www.sbrebrown.com/2024/01/jinhao-9019-fountain-pen-review/",
  summary: "独立量测给出约 147.1／130.8／169.5 mm、总重约 33.5 g、笔身 22 g、帽 11.5 g，并明确 #8 尖样本。",
  author: "SBRE Brown",
  publishedAt: "2024-01-08",
});
const jinhaoPennen = source({
  key: "phase487-jinhao-9019-pennen",
  registryKey: "pennen-phase487-jinhao9019",
  registryName: "Pennen er mektigere",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pennen-phase487-jinhao9019",
  title: "Nibby Sunday – Review of Jinhao Dadao 9019",
  url: "https://english.pennenermektigere.no/nibby-sunday-review-of-jinhao-dadao-9019/",
  summary: "评测把 Dadao 9019 与 X159 分开，记录树脂笔身、#8 钢尖和大转换器，并把写感与样本初始偏干区分开。",
  author: "Anders Kristiansen",
  publishedAt: "2024-01-21",
});
const jinhaoJg3 = source({
  key: "phase487-jinhao-9019-jg3",
  registryKey: "jg3-phase487-jinhao9019",
  registryName: "JG3 Reviews",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "jg3-phase487-jinhao9019",
  title: "Jinhao Dadao 9019 review",
  url: "https://www.youtube.com/watch?v=Kj8kHHxrZDE",
  summary: "视频演示 #8 M 尖、尺寸比较和 XL 转换器；视频为明确样本体验，不用于证明所有颜色、尖幅或批次一致。",
  author: "JG3 Reviews",
  publishedAt: "2023-08-14",
});
const jinhaoPenConnection = source({
  key: "phase487-jinhao-9019-penconnection",
  registryKey: "penconnection-phase487-jinhao9019",
  registryName: "Pen Connection",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "penconnection-phase487-jinhao9019",
  title: "Jinhao 9019 Dadao review",
  url: "https://www.youtube.com/watch?v=_i-nQSSP6UI",
  summary: "视频补充转换器拧入、#8 尖、握持和与 X159 比较；样本资料不能取代型号身份和市场 SKU 证据。",
  author: "Pen Connection",
});

const twsbiBase = modelPack(PHASE487_IDS.twsbiVac700r, "TWSBI VAC700R");
const noodlersBase = modelPack(PHASE487_IDS.noodlersNibCreaper, "Noodler's Nib Creaper");
const jinhaoBase = modelPack(PHASE487_IDS.jinhao9019, "Jinhao 9019");

const twsbiScope: CuratedScope = {
  key: "phase487-twsbi-vac700r-depth-scope",
  scopeKey: "phase487-twsbi-vac700r-depth-scope",
  productionState: "current",
  editionScope: "Phase 487 VAC700R 深化；真空、止墨阀、容量条件、Clear／Iris／Kyanite finish 和旧 Vac-700 代际分开记录。",
};
const noodlersScope: CuratedScope = {
  key: "phase487-noodlers-creaper-depth-scope",
  scopeKey: "phase487-noodlers-creaper-depth-scope",
  productionState: "current",
  editionScope: "Phase 487 Nib Creaper 深化；Standard Flex 产品线、活塞、墨窗、nib/feed 调校和颜色 SKU 不跨到 Ahab／Konrad。",
};
const jinhaoScope: CuratedScope = {
  key: "phase487-jinhao-9019-depth-scope",
  scopeKey: "phase487-jinhao-9019-depth-scope",
  productionState: "current",
  editionScope: "Phase 487 9019 Dadao 深化；#8 尖、大转换器、尺寸样本和 X159／9016 sibling 保持型号边界。",
};

export const phase487TwsbiVac700rNoodlersCreaperJinhao9019DepthPacks: CuratedEntityPack[] = [
  refresh(twsbiBase, {
    key: "phase487-twsbi-vac700r-depth-v1",
    markdownFile: ".planning/content-research/twsbi-vac700r-phase487.md",
    storyTitle: "TWSBI VAC700R：真空上墨、止墨阀与“容量数字”的使用条件",
    primary: twsbiOfficial,
    extras: [twsbiVariants, twsbiGoulet, twsbiFill],
    scope: twsbiScope,
    claims: [
      claim(twsbiOfficial, twsbiScope.scopeKey, "phase487-twsbi-vac-identity", "model_identity", "VAC700R 是带真空活塞和独立 ink shut-off valve 的 TWSBI 型号；透明外观不能把它与 Diamond 580、GO 或 ECO 合并。"),
      claim(twsbiOfficial, twsbiScope.scopeKey, "phase487-twsbi-vac-nibs", "nib_boundary", "官方 Clear 页面列 EF/F/M/B/Stub 1.1/Stub 1.5；尖幅是 SKU 选项，不等同于柔尖或旧批次全部配置。"),
      claim(twsbiOfficial, twsbiScope.scopeKey, "phase487-twsbi-vac-valve", "filling_boundary", "推拉真空活塞完成吸墨，写字时需按情境打开止墨阀；携带时关闭可降低气压推墨风险但不构成绝对防漏。"),
      claim(twsbiFill, twsbiScope.scopeKey, "phase487-twsbi-vac-capacity", "capacity_boundary", "约 1.5 ml 常规吸墨与按特定排气流程约 2.3 ml 的满填是不同操作条件，不能合并成一个固定容量。"),
      claim(twsbiGoulet, twsbiScope.scopeKey, "phase487-twsbi-vac-sample", "sample_specification", "Goulet Clear 样本约 147 mm、35 g、握位约 10 mm；数值限定于明确 finish、样本和量测方法。"),
      claim(twsbiVariants, twsbiScope.scopeKey, "phase487-twsbi-vac-finish", "version_boundary", "Clear、Iris、Kyanite 是 VAC700R 平台的 finish／版本；颜色、饰件和图片不能代替具体 SKU 或证明内部密封状态。"),
      claim(twsbiFill, twsbiScope.scopeKey, "phase487-twsbi-vac-generation", "generation_boundary", "旧 Vac-700 的满填文章可解释真空原理，但故障、O-ring 和零件经验不能未经核对直接回填 VAC700R。"),
      claim(twsbiOfficial, twsbiScope.scopeKey, "phase487-twsbi-vac-care", "maintenance_boundary", "换色用室温清水吸排；不以针、刀、热水或过量硅脂强拆活塞和止墨机构，真空失效时交给品牌或专业维修者。", "editorial"),
    ],
    values: {
      series_name: "TWSBI VAC700R",
      release_year: "现行 VAC700R 平台；公开页面不作为统一首发年证明",
      origin_country: "TWSBI 产品线语境；制造批次和市场按包装、官方资料与实物核对",
      nib: "不锈钢尖；官方 Clear SKU 列 EF/F/M/B/Stub 1.1/Stub 1.5",
      fill_system: "真空上墨，带独立 ink shut-off valve；使用瓶装墨",
      material: "透明树脂笔身与真空杆机构；Iris／Kyanite 为同平台 finish",
      dimensions: "Clear 样本约 147 mm；握位约 10 mm，按具体量测条件",
      weight: "Clear 样本约 35 g；finish、附件和量测条件会影响数值",
      status: "现行真空上墨系列；旧 Vac-700、Iris、Kyanite 与 Clear 分层记录",
    },
    variants: [
      { key: "phase487-twsbi-vac-clear-conditional", name: "VAC700R Clear SKU 条件化容量复核", releaseYear: "当前 SKU", notes: "Clear 为官方尖幅、真空与容量条件锚点；约 1.5 ml／2.3 ml 依操作条件分别记录。", sourceKey: twsbiOfficial.key, variantKind: "market_sku" },
      { key: "phase487-twsbi-vac-finish-boundary", name: "VAC700R Iris／Kyanite finish 边界复核", releaseYear: "同平台版本", notes: "只证明同一真空平台的 finish 与饰件边界，不把颜色照片或库存回填到 Clear。", sourceKey: twsbiVariants.key, variantKind: "material" },
    ],
    eventTitle: "Phase 487：VAC700R 止墨阀与容量条件深化",
    eventDescription: "补足真空活塞、止墨阀开关、常规／满填容量口径、Clear 样本量测、finish 和维修边界。",
  }),
  refresh(noodlersBase, {
    key: "phase487-noodlers-creaper-depth-v1",
    markdownFile: ".planning/content-research/noodlers-nib-creaper-phase487.md",
    storyTitle: "Noodler's Nib Creaper：小型活塞、可抽换笔尖与“柔尖”边界",
    primary: noodlersOfficial,
    extras: [noodlersSku, noodlersWonder, noodlersFpn],
    scope: noodlersScope,
    claims: [
      claim(noodlersOfficial, noodlersScope.scopeKey, "phase487-noodlers-creaper-identity", "model_identity", "Nib Creaper／Nib Creeper／Standard Flex Pen 是同一产品线的名称变体；Ahab、Konrad、Neponset 不能因 flex 词相似而合并。"),
      claim(noodlersOfficial, noodlersScope.scopeKey, "phase487-noodlers-creaper-catalog", "series_boundary", "官方目录把 Standard Creaper／Standard Flex 与其它 Noodler's 钢笔线分列；17000 Clear 是 SKU，不是第二个基础型号。"),
      claim(noodlersSku, noodlersScope.scopeKey, "phase487-noodlers-creaper-sku", "market_sku", "17000 Clear Piston Std Flex 提供 Clear demonstrator 和产品命名锚点；价格与库存随网页、地区和促销变化。"),
      claim(noodlersWonder, noodlersScope.scopeKey, "phase487-noodlers-creaper-filling", "filling_boundary", "Nib Creaper 使用旋转活塞和墨窗，容量相对转换器较大；活塞密封、行程和颜色批次仍需按实物核对。"),
      claim(noodlersWonder, noodlersScope.scopeKey, "phase487-noodlers-creaper-flex", "nib_boundary", "钢制 flexible nib 的线宽取决于压力、速度、纸张、墨水和 feed；railroading 与调校结果是样本经验，不能承诺古董柔尖级别。"),
      claim(noodlersWonder, noodlersScope.scopeKey, "phase487-noodlers-creaper-feed", "adjustability_boundary", "nib/feed 可抽出清洁与调整，但 friction-fit 不是任意拔插许可；错误深度或尖缝会引起断墨、漏墨和永久损伤。"),
      claim(noodlersFpn, noodlersScope.scopeKey, "phase487-noodlers-creaper-risk", "maintenance_boundary", "首次灌墨前充分冲洗，异常先记录墨水、纸张和位置；不要用热水、溶剂、锉削或未经确认的加热方法强改 feed。", "editorial"),
      claim(noodlersOfficial, noodlersScope.scopeKey, "phase487-noodlers-creaper-selection", "selection_boundary", "购买时核对颜色／SKU、尖号、墨窗、活塞旋钮和拆修史；Creaper 拼法差异保留为 alias，不创建重复实体。"),
    ],
    values: {
      series_name: "Noodler's Standard Flex／Creaper Series",
      release_year: "约 2010 进入公开产品语境；具体颜色 SKU 年份不统一",
      origin_country: "美国品牌产品线语境；制造地点未由本批来源核实",
      nib: "钢制 flexible nib；尖号、线宽与调校按单支和 SKU",
      fill_system: "旋转活塞式，带小型墨窗",
      material: "植物来源树脂／celluloid derivative 语境；颜色、透明度与批次按实物",
      dimensions: "小型、偏细笔身；没有统一全系列尺寸承诺",
      weight: "无可靠全系统一克重；按颜色、附件和样本量测",
      status: "官方 Standard Flex Nibs 目录可见的现行／流通产品线；价格和库存滚动",
    },
    variants: [
      { key: "phase487-noodlers-clear-conditional", name: "17000 Clear SKU 条件复核", releaseYear: "当前官方 SKU", notes: "Clear demonstrator、活塞和墨窗为身份锚点；价格与库存需带检索日期。", sourceKey: noodlersSku.key, variantKind: "market_sku", productCode: "17000" },
      { key: "phase487-noodlers-color-sample", name: "Standard Flex 彩色树脂与墨窗样本", releaseYear: "颜色 SKU", notes: "颜色和纹理只作为 sibling；不能把某支树脂、气味或重量外推到全部批次。", sourceKey: noodlersWonder.key, variantKind: "color" },
    ],
    eventTitle: "Phase 487：Nib Creaper 活塞与可调柔尖深化",
    eventDescription: "补足 Standard Flex 身份、17000 Clear SKU、活塞墨窗、nib/feed 调校、柔尖压力和清洁风险。",
  }),
  refresh(jinhaoBase, {
    key: "phase487-jinhao-9019-depth-v1",
    markdownFile: ".planning/content-research/jinhao-9019-phase487.md",
    storyTitle: "Jinhao 9019 Dadao：大尺寸、#8 尖与大转换器的实际取舍",
    primary: jinhaoSbre,
    extras: [jinhaoPennen, jinhaoJg3, jinhaoPenConnection],
    scope: jinhaoScope,
    claims: [
      claim(jinhaoSbre, jinhaoScope.scopeKey, "phase487-jinhao-9019-identity", "model_identity", "9019 Dadao 是 Jinhao 独立大尺寸型号；与 X159、159、9016、9013 的相似或比较不构成同一实体。"),
      claim(jinhaoSbre, jinhaoScope.scopeKey, "phase487-jinhao-9019-size", "sample_specification", "明确样本约 147.1 mm 闭帽、130.8 mm 去帽、169.5 mm 套帽、总重约 33.5 g；不外推所有颜色、尖幅和饰件。"),
      claim(jinhaoPennen, jinhaoScope.scopeKey, "phase487-jinhao-9019-nib", "nib_boundary", "公开评测稳定指向 #8 级钢尖，M、EF、F 和 Heartbeat 等属于市场选项；线宽、反馈和干湿按单支调校。"),
      claim(jinhaoJg3, jinhaoScope.scopeKey, "phase487-jinhao-9019-converter", "filling_boundary", "9019 的大转换器拧入握段，容量明显高于普通小转换器；约 1.6–1.7 ml 是市场与量测参考，不是所有批次固定容量。"),
      claim(jinhaoPenConnection, jinhaoScope.scopeKey, "phase487-jinhao-9019-comparison", "version_boundary", "X159、9016 等 sibling 可用于尺寸和转换器比较，但不能回填尖号、重心、颜色和供墨规格。"),
      claim(jinhaoPennen, jinhaoScope.scopeKey, "phase487-jinhao-9019-writing", "sample_experience_boundary", "样本写感可平顺也可能初始偏干；需要轻压、普通墨水和对齐测试，不能把大 #8 尖写成 flex 或金尖。"),
      claim(jinhaoSbre, jinhaoScope.scopeKey, "phase487-jinhao-9019-care", "maintenance_boundary", "换墨用室温清水吸排，保护树脂螺纹和转换器同轴；裂纹、漏墨、空转或偏斜时停止强拧并交给卖家或维修者。", "editorial"),
      claim(jinhaoPennen, jinhaoScope.scopeKey, "phase487-jinhao-9019-selection", "selection_boundary", "选购依次核对 9019 Dadao 刻字、#8 尖、大转换器、具体尖幅、手型和颜色 SKU，不用 Namiki 外形联想替代型号证据。"),
    ],
    values: {
      series_name: "Jinhao 9019 Dadao",
      release_year: "2023 年起有公开评测和零售语境；不将评测日期写成官方首发日",
      origin_country: "Jinhao 当代市场产品线；具体制造批次和工厂未由本批来源核实",
      nib: "#8 级钢尖；M 常见，EF/F/Heartbeat 等按市场 SKU 和实物",
      fill_system: "拧入握段的大容量转换器；容量按样本和量测条件",
      material: "acrylic／resin 树脂笔身；透明、颜色、金银饰件和图案按 SKU",
      dimensions: "样本约 147.1 mm 闭帽、130.8 mm 去帽、169.5 mm 套帽；按具体样本",
      weight: "样本总重约 33.5 g，笔身约 22 g、帽约 11.5 g；不外推全批次",
      status: "当代流通型号；颜色、尖幅、Heartbeat 和透明 demonstrator 按市场更新",
    },
    variants: [
      { key: "phase487-jinhao-9019-nib-market", name: "9019 Dadao #8 M／Heartbeat 市场配置", releaseYear: "市场 SKU", notes: "尖面与线宽按具体选项，普通 #8 尖不自动具备 flex；不要与 X159 尖互换描述。", sourceKey: jinhaoJg3.key, variantKind: "nib" },
      { key: "phase487-jinhao-9019-demonstrator", name: "9019 透明 demonstrator 样本", releaseYear: "市场 SKU", notes: "透明度只帮助观察墨量，不能证明所有 9019 的树脂、重量或内部结构相同。", sourceKey: jinhaoPenConnection.key, variantKind: "color" },
    ],
    eventTitle: "Phase 487：9019 Dadao #8 尖与大转换器深化",
    eventDescription: "补足 9019 与 X159 sibling 的身份边界、#8 钢尖、拧入式大转换器、样本量测、手型取舍和保养。",
  }),
];
