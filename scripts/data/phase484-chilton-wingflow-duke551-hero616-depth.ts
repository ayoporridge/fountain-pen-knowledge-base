import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE165_WING_FLOW_ID,
  phase165EversharpChiltonPacks,
} from "./phase165-eversharp-chilton";
import {
  PHASE72_DUKE_551_ID,
  phase72DukePacks,
} from "./phase72-delike-duke-penbbs";
import {
  PHASE159_IDS,
  phase159HeroPacks,
} from "./phase159-hero-100-616-329";

export const PHASE484_IDS = {
  wingFlow: PHASE165_WING_FLOW_ID,
  duke551: PHASE72_DUKE_551_ID,
  hero616: PHASE159_IDS.hero616,
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
  const homepageUrl = input.url.startsWith("http") ? new URL(input.url).origin : "/";
  return {
    ...input,
    homepageUrl,
    itemType: "web_page",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 484 exact-model depth refresh`,
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
  const locator = sourceItem.summary;
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "editorial" ? 0.95 : 0.98,
    sourceKey: sourceItem.key,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator }],
  };
}

function basePack(entityId: string, label: string): CuratedEntityPack {
  const all = [
    ...phase165EversharpChiltonPacks,
    ...phase72DukePacks(),
    ...phase159HeroPacks,
  ];
  const pack = all.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 484 ${label} base pack is missing.`);
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

const wingOfficial = source({
  key: "phase484-chilton-wingflow-archive",
  registryKey: "chiltonpens-phase484-wingflow",
  registryName: "Chilton Pens",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "chiltonpens-phase484-wingflow",
  title: "Chilton Wingflow archive",
  url: "https://www.chiltonpens.com/wingflows/index.shtml",
  summary:
    "收藏档案把 Wingflow 放在约 1935 年，说明装饰艺术、金属镶嵌、环抱式尖和因节省贵金属而出现的断尖/缺尖风险。",
  author: "Chilton Pens",
});
const wingInlays = source({
  key: "phase484-chilton-wingflow-inlays",
  registryKey: "chiltonpens-phase484-wingflow-inlays",
  registryName: "Chilton Pens",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "chiltonpens-phase484-inlays",
  title: "Wingflow inlays and model codes",
  url: "https://www.chiltonpens.com/wingflows/inlays/index.shtml",
  summary:
    "档案将 5、5S、7、7½、8½ 等数字放在尺寸/型号线索中，并说明图案、字母编码和样本解释存在研究边界。",
  author: "Chilton Pens",
});
const wingDartmouth = source({
  key: "phase484-chilton-wingflow-dartmouth",
  registryKey: "dartmouth-phase484-wingflow-1937",
  registryName: "Dartmouth Libraries",
  sourceType: "blog",
  tier: "primary",
  independenceGroup: "dartmouth-phase484-wingflow",
  title: "1937 Wingflow advertising drawings",
  url: "https://archives-manuscripts.dartmouth.edu/repositories/2/archival_objects/428845",
  summary:
    "馆藏描述确认 1937 年保存的 13 幅 Chilton Wingflow 原创广告墨稿，支持商业宣传和姓名镶嵌语境，不替代实物规格。",
  author: "Dartmouth Libraries Rauner Library",
  publishedAt: "1937-01-01",
});
const wingRichard = source({
  key: "phase484-chilton-wingflow-richard",
  registryKey: "richardspens-phase484-wingflow",
  registryName: "Richard's Pens",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "richardspens-phase484-wingflow",
  title: "Chilton Wing-flow profile",
  url: "https://www.richardspens.com/ref/profiles/wing_flow.htm",
  summary:
    "专业档案交叉说明 Wing-flow 的历史结构、包覆式尖、pneumatic filling 和修复时应按单支检查的边界。",
  author: "Richard Binder",
});

const dukeReview = source({
  key: "phase484-duke551-parkablogs",
  registryKey: "parkablogs-phase484-duke551",
  registryName: "Parka Blogs",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "parkablogs-phase484-duke551",
  title: "Duke 551 Confucius review",
  url: "https://www.parkablogs.com/picture/review-2-duke-551-aka-confucius-compound-art-fountain-pen",
  summary:
    "独立评测记录竹身、孔子主题木盒/竹卷、粗重体量、约 4 mm 弯曲书写段、额外供墨金属片和样本停流差异。",
  author: "Teoh Yi Chie",
  publishedAt: "2015-03-10",
});
const dukeVideo = source({
  key: "phase484-duke551-video",
  registryKey: "youtube-phase484-duke551-confucius",
  registryName: "Chrisrap52",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "youtube-phase484-duke551",
  title: "Duke 551 Confucius Bamboo Fountain Pen Review",
  url: "https://www.youtube.com/watch?v=Uo0CfUMkMGw",
  summary:
    "独立视频以绘画和大弯尖体验为主，支持粗重、大幅线条和题材定位；不提供全系统一尺寸或重量。",
  author: "Chrisrap52",
  publishedAt: "2023-06-08",
});
const dukeReddit = source({
  key: "phase484-duke551-reddit",
  registryKey: "reddit-phase484-duke551-fude",
  registryName: "Fountain Pen Network on Reddit",
  sourceType: "reddit",
  tier: "community",
  independenceGroup: "reddit-phase484-duke551",
  title: "Duke 551 fude nibs: Confucius and Sima Qian",
  url: "https://www.reddit.com/r/fountainpens/comments/1kdf47e/duke-551-fude-nib-pens-confucius-and-sima_qian/",
  summary:
    "近期独立样本讨论 Confucius/Sima Qian 题材、两缝三瓣尖、overfeed、相对大体量和线宽变化；仅作样本交叉。",
  author: "Fountain Pen Network community on Reddit",
});
const dukeRupert = source({
  key: "phase484-duke551-rupert",
  registryKey: "rupertarzeian-phase484-duke551",
  registryName: "Rupert Arzeian",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "rupertarzeian-phase484-duke551",
  title: "Duke 551 Confucius notes",
  url: "https://rupertarzeian.com/tag/duke-551-confucius/",
  summary:
    "个人钢笔博客补充 551 的 converter 清洁、弹簧/内部件处理和规格讨论；按独立样本保留，不当作制造商说明。",
  author: "Rupert Arzeian",
});

const heroOfficial = source({
  key: "phase484-hero-616-jd-official",
  registryKey: "jd-hero-official-phase484-616",
  registryName: "英雄官方旗舰店",
  sourceType: "retailer",
  tier: "contemporary_archive",
  independenceGroup: "hero-official-phase484-616",
  title: "英雄 616/616 升级款官方旗舰店商品",
  url: "https://item.jd.com/10107667071.html",
  summary:
    "英雄官方旗舰店商品标题将 616/616 升级款、F 尖、挤捏吸墨和多支装分列；只能证明当前渠道命名和供墨语境，不能覆盖历史批次。",
  author: "英雄官方旗舰店",
});
const heroFpn = source({
  key: "phase484-hero-616-fpn",
  registryKey: "fpn-phase484-hero616-review",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "professional_secondary",
  independenceGroup: "fpn-phase484-hero616",
  title: "Hero 616 review",
  url: "https://www.fountainpennetwork.com/forum/index.php?showtopic=90419",
  summary:
    "独立样本记录钢制暗尖、固定挤压囊、小窗和约 13.4/12.6/13.8 cm 尺寸语境；数字限定在样本条件。",
  author: "Fountain Pen Network member",
});
const heroParker = source({
  key: "phase484-hero-616-parker",
  registryKey: "fpn-phase484-hero616-parker51",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fpn-phase484-hero616-parker",
  title: "Hero 616 and Parker 51 discussion",
  url: "https://www.fountainpennetwork.com/forum/topic/22687-hero-616-a-clone-of-the-51/",
  summary:
    "社区讨论把 616 与 Parker 51 的相似限制在外形比较，不能推出授权、品牌关系或零件互换。",
  author: "Fountain Pen Network members",
});
const heroPrimer = source({
  key: "phase484-hero-616-primer",
  registryKey: "fountain-pen-primer-phase484-hero616",
  registryName: "Fountain Pen Primer",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fountain-pen-primer-phase484-hero616",
  title: "Hero 616 structure and squeeze filler primer",
  url: "https://sheismylawyer.com/She_Thinks_In_Ink/How_To/Fountain_Pen_Primer_12Dec2011.pdf",
  summary:
    "钢笔基础资料包含 Hero 616 的拆解/固定挤压囊结构观察；用于低风险维护语境，不替代 Hero 目录。",
  author: "She Thinks in Ink",
  publishedAt: "2011-12-12",
});

const wingFlow = refresh(basePack(PHASE484_IDS.wingFlow, "Chilton Wing-flow"), {
  key: "phase484-chilton-wingflow-depth-v1",
  markdownFile: ".planning/content-research/chilton-wing-flow-phase484.md",
  storyTitle: "Chilton Wing-flow：环抱式尖、镶嵌编码与一支老笔的修复风险",
  primary: wingOfficial,
  extras: [wingInlays, wingDartmouth, wingRichard],
  scope: {
    key: "phase484-chilton-wingflow-depth",
    scopeKey: "phase484-chilton-wingflow-depth",
    market: "Chilton Wing-flow historical archive and surviving collector samples",
    productionState: "historical",
    nibScope: "Wrap-around Wing-flow point; original, broken, missing and replacement conditions are specimen-specific",
    materialScope: "celluloid body with gold-filled/white-gold or rare solid-gold inlay claims by version",
    editionScope: "Wing-flow family; not Chiltonian, Golden Quill, pencils or ordinary pneumatic pens",
  },
  claims: [
    claim(wingOfficial, "phase484-chilton-wingflow-depth", "phase484-wing-identity", "model_identity", "Chilton Wing-flow 是约 1935 年推出的装饰艺术气压上墨钢笔家族，以金属镶嵌和环抱式 Wing-flow 尖识别。"),
    claim(wingOfficial, "phase484-chilton-wingflow-depth", "phase484-wing-breakage", "nib_boundary", "环抱式尖曾以保持对齐宣传，但收藏档案明确记录断裂、缺失和后配尖普遍存在；结构名不等于永不损坏。"),
    claim(wingDartmouth, "phase484-chilton-wingflow-depth", "phase484-wing-advertising", "historical_advertising", "Dartmouth 1937 年馆藏描述确认 13 幅 Wingflow 广告墨稿和姓名镶嵌宣传，支持商业语境而不替代实物规格。"),
    claim(wingInlays, "phase484-chilton-wingflow-depth", "phase484-wing-codes", "version_boundary", "5、5S、7、7½、8½ 等数字和工厂字母是尺寸/图案研究线索，不是一张覆盖所有笔的现代 SKU 尺寸表。"),
    claim(wingInlays, "phase484-chilton-wingflow-depth", "phase484-wing-material", "material", "金填/白金填和少见实金镶嵌必须按目录、专利或实物确认；银色金属不能自动认成纯银或白金。"),
    claim(wingRichard, "phase484-chilton-wingflow-depth", "phase484-wing-filler", "filling_system", "Wing-flow 属于 Chilton pneumatic filler 技术语境；尾端密封和内件依存世样本变化，不改写成现代 converter。"),
    claim(wingRichard, "phase484-chilton-wingflow-depth", "phase484-wing-care", "maintenance", "尖翼、feed、尾端、帽口和镶嵌边缘需先检查；清洁使用常温水，强压、热水、酒精和硬拆会增加风险。"),
    claim(wingInlays, "phase484-chilton-wingflow-depth", "phase484-wing-neighbors", "identity_boundaries", "Wing-flow 与 Chiltonian、Golden Quill、铅笔和普通 pneumatic 型号保持独立，不共用尖、图片和规格。"),
    claim(wingRichard, "phase484-chilton-wingflow-depth", "phase484-wing-purchase", "purchase_guidance", "购买先要求尖部、尾端编码、镶嵌、帽环和维修记录照片；原装程度和可写性比稀有年份标签更重要。", "editorial"),
  ],
  values: {
    series_name: "Chilton Wing-flow",
    release_year: "约 1935；1937 年 Dartmouth 广告档案提供商业宣传节点",
    origin_country: "美国 Chilton 历史产品线；具体生产地按年代资料核对",
    nib: "环抱式 Wing-flow point；完整、断裂、缺失或后配状态逐笔核对",
    fill_system: "pneumatic filler 路线；尾部内件和密封按实物确认",
    material: "赛璐珞笔身、金属镶嵌与饰件；金填/白金填/实金按版本核对",
    dimensions: "5、5S、7、7½、8½ 等历史尺寸线索；不虚构统一毫米值",
    weight: "无可核实全系统一重量；按单支、含墨和配件记录",
    price_range: "历史收藏价格随原装尖、镶嵌、尺寸和品相变化；不作估值",
    status: "历史型号家族；与 Chiltonian、Golden Quill 和其他笔种分开",
  },
  variants: [
    { key: "phase484-wing-ad-1937", name: "1937 advertising / name-inlay context", notes: "Dartmouth 馆藏广告墨稿确认姓名镶嵌的商业宣传语境，不代表现存每支都带首字母。", sourceKey: wingDartmouth.key, variantKind: "edition_group" },
    { key: "phase484-wing-codes", name: "5 / 5S / 7 / 7½ / 8½ collector code clues", notes: "数字代码保留为尺寸/图案研究线索，不把它们拆成统一毫米 SKU。", sourceKey: wingInlays.key, variantKind: "market_sku" },
  ],
  eventTitle: "Wing-flow 尖、镶嵌和 1937 广告边界复核",
  eventDescription: "以 Chilton Pens 档案、Dartmouth 1937 馆藏描述和专业型号资料复核环抱式尖的断裂风险、尺寸/图案编码、pneumatic filler 与修复边界。",
});

const duke551 = refresh(basePack(PHASE484_IDS.duke551, "Duke 551 Confucius"), {
  key: "phase484-duke551-confucius-depth-v1",
  markdownFile: ".planning/content-research/duke-551-confucius-phase484.md",
  storyTitle: "Duke 551 Confucius：大尺寸竹身、三瓣美工尖与供墨边界",
  primary: dukeReview,
  extras: [dukeVideo, dukeReddit, dukeRupert],
  scope: {
    key: "phase484-duke551-confucius-depth",
    scopeKey: "phase484-duke551-confucius-depth",
    market: "Duke 551 Confucius independent reviews and market samples",
    productionState: "current",
    nibScope: "Large bent/fude nib; two-slit three-tine and overfeed observations are sample-specific",
    materialScope: "bamboo body, metal section and Confucius-themed packaging by version",
    editionScope: "Duke 551 Confucius; not Sima Qian, ordinary Duke gift pens or other fude models",
  },
  claims: [
    claim(dukeReview, "phase484-duke551-confucius-depth", "phase484-duke-identity", "model_identity", "Duke 551 Confucius 是孔子主题竹身与大弯尖美工路线的具体型号，不是泛称竹制礼品笔。"),
    claim(dukeReview, "phase484-duke551-confucius-depth", "phase484-duke-body", "material", "独立样本记录竹制笔身、孔子相关木盒和竹卷；竹材处理、题字和包装不能外推到所有 551。"),
    claim(dukeReview, "phase484-duke551-confucius-depth", "phase484-duke-nib", "nib_construction", "Parka Blogs 样本记录约 4 mm 弯曲书写段和额外供墨金属片；近期样本另见两缝三瓣尖，均需保留样本范围。"),
    claim(dukeReddit, "phase484-duke551-confucius-depth", "phase484-duke-overfeed", "ink_flow", "近期独立样本观察到 overfeed、三瓣尖和明显线宽变化；不把单支极湿或停流经验写成全系固定流量。"),
    claim(dukeReview, "phase484-duke551-confucius-depth", "phase484-duke-filling", "filling_system", "独立旋帽样本随 converter；国际墨胆兼容性、converter 长度和内部件按具体商品核对。"),
    claim(dukeRupert, "phase484-duke551-confucius-depth", "phase484-duke-care", "maintenance", "converter 与供墨片清洁应使用常温水；有弹簧/内部 collar 时不为追求彻底清洗而强拆。"),
    claim(dukeVideo, "phase484-duke551-confucius-depth", "phase484-duke-use", "use_case", "独立视频把 551 放在绘画和大弯尖体验语境；适合线宽变化不等于适合所有小字或会议记录。"),
    claim(dukeReddit, "phase484-duke551-confucius-depth", "phase484-duke-neighbors", "identity_boundaries", "Confucius、Sima Qian、普通 Duke 和其他 fude 款保持独立，不共用题材、盒子、尖片或重量。"),
    claim(dukeReview, "phase484-duke551-confucius-depth", "phase484-duke-weight", "measurement_conflict", "评测普遍只提供粗重体感，缺少统一可靠克数；是否插帽、含墨和套装配件会改变测量。"),
    claim(dukeVideo, "phase484-duke551-confucius-depth", "phase484-duke-purchase", "purchase_guidance", "购买先确认弯尖方向、三瓣/overfeed、竹身、握位、converter、木盒和退换条件，再决定是否适合自己的角度与纸张。", "editorial"),
  ],
  values: {
    series_name: "Duke 551 Confucius",
    release_year: "至少 2012 年前已有独立评测；本包不虚构官方首发年份",
    origin_country: "中国 Duke 产品线；制造批次与地区商品信息按实物核对",
    nib: "超大 bent/fude nib；部分样本为两缝三瓣并带 overfeed，线宽随角度变化",
    fill_system: "可拆 converter；国际标准墨胆兼容性按具体商品核对",
    material: "竹身、金属握位和孔子主题包装；表面处理与题材按 SKU/实物",
    dimensions: "大尺寸、粗重手感；统一长度与直径按具体版本/样本测量",
    weight: "评测普遍描述为大且重；不把单支称量外推到全系",
    price_range: "地区、套装、尖材和库存导致价格变化；不作长期报价",
    status: "当代市场可见的历史流通型号；Confucius、Sima Qian 等主题保持独立",
  },
  variants: [
    { key: "phase484-duke-three-tine-overfeed", name: "Confucius three-tine overfeed sample", notes: "近期样本的两缝三瓣、overfeed 和大弯尖观察；不写成每个 551 商品固定配置。", sourceKey: dukeReddit.key, variantKind: "nib" },
    { key: "phase484-duke-bamboo-gift-set", name: "Confucius bamboo gift-set context", notes: "Parka Blogs 样本的竹身、木盒和竹卷主题；包装、题字和帽型按具体套装核对。", sourceKey: dukeReview.key, variantKind: "edition_group" },
  ],
  eventTitle: "551 Confucius 美工尖、竹身与供墨边界复核",
  eventDescription: "以独立图文、视频、近期社区样本和清洁笔记复核孔子主题、三瓣/overfeed 大弯尖、converter、粗重体量及 Confucius/Sima Qian 分流。",
});

const hero616 = refresh(basePack(PHASE484_IDS.hero616, "Hero 616"), {
  key: "phase484-hero616-depth-v1",
  markdownFile: ".planning/content-research/hero-616-phase484.md",
  storyTitle: "英雄 Hero 616：钢制暗尖、固定挤压囊与批次边界",
  primary: heroOfficial,
  extras: [heroFpn, heroParker, heroPrimer],
  scope: {
    key: "phase484-hero616-depth",
    scopeKey: "phase484-hero616-depth",
    market: "Hero 616 current channel listing and independent historical samples",
    productionState: "current",
    nibScope: "Steel hooded nib; F/EF/0.5 mm labels are SKU or sample-specific",
    materialScope: "resin body, metal cap and trim; windows and clips vary by batch/upgraded product",
    editionScope: "Hero 616; not 616S, 616 upgrade, 329-2, Hero 100 or Parker 51",
  },
  claims: [
    claim(heroOfficial, "phase484-hero616-depth", "phase484-hero616-channel", "current_channel", "英雄官方旗舰店当前商品标题仍将 616/616 升级款、F 尖、挤捏吸墨和多支装分列；这只证明渠道命名，不覆盖全部历史批次。"),
    claim(heroFpn, "phase484-hero616-depth", "phase484-hero616-identity", "model_identity", "Hero 616 的身份组合是钢制 hooded nib、固定 squeeze filler 和 616 编号；暗尖外形不等于 Parker 51 授权或同一零件。"),
    claim(heroFpn, "phase484-hero616-depth", "phase484-hero616-spec", "specification", "独立样本记录约 13.4 cm 合帽、12.6 cm 无帽、13.8 cm 后套；数字限定于样本、饰件和墨量条件。"),
    claim(heroFpn, "phase484-hero616-depth", "phase484-hero616-nib", "nib_options", "钢制暗尖公开样本以 Fine 为主；EF、F、0.5 mm 等商品标注须与具体市场 SKU 和尖片照片绑定。"),
    claim(heroFpn, "phase484-hero616-depth", "phase484-hero616-filler", "filling_system", "常见 616 使用固定 squeeze filler 挤压囊，不默认国际 converter；囊体、压条、胶接和回弹按批次核对。"),
    claim(heroParker, "phase484-hero616-depth", "phase484-hero616-parker", "identity_boundaries", "616 与 Parker 51 的相似只属于外形比较，不构成品牌授权、生产关系或零件互换。"),
    claim(heroPrimer, "phase484-hero616-depth", "phase484-hero616-care", "maintenance", "换墨以常温水少量挤压吸排并自然阴干；老化囊体、裂纹、漏墨和帽内碰尖时停止强压和硬拆。"),
    claim(heroOfficial, "phase484-hero616-depth", "phase484-hero616-variants", "version_boundary", "616、616S、升级款、金夹/银夹、窗口和套装可能对应不同批次或渠道，不能共享一条统一重量和品控结论。"),
    claim(heroFpn, "phase484-hero616-depth", "phase484-hero616-window", "measurement_boundary", "透明小窗只能提示余墨存在，不是精确容量刻度；金属件、含墨和是否插帽会改变重量。"),
    claim(heroOfficial, "phase484-hero616-depth", "phase484-hero616-purchase", "purchase_guidance", "购买应要求尖端近照、挤压囊回弹、帽内密封、刻字和退换条件；商品多支装数量不等于稳定型号档案。", "editorial"),
  ],
  values: {
    series_name: "Hero 616",
    release_year: "长期流通历史型号；公开资料未给稳定首发年份",
    origin_country: "中国；上海英雄体系",
    nib: "钢制 hooded nib；公开样本以 Fine 为主，尖幅按 SKU/实物核对",
    fill_system: "固定 squeeze filler 挤压囊；不是默认国际 converter",
    material: "树脂笔身、金属帽与饰件；批次和升级款可能不同",
    dimensions: "独立样本约合帽 13.4 cm、无帽 12.6 cm、后套 13.8 cm；非全系统一值",
    weight: "具体重量随金属件、墨量和批次变化；不虚构统一克数",
    price_range: "当代渠道、套装、升级款和二手品相导致价格变化；不作长期报价",
    status: "历史/当代流通型号；616S、升级款、329-2 和 Hero 100 保持独立",
  },
  variants: [
    { key: "phase484-hero616-current-channel", name: "616 current flagship channel listing", notes: "官方旗舰店当前 616/616 升级款与 F 尖、挤捏吸墨标题；不把多支装当成全部历史批次。", sourceKey: heroOfficial.key, variantKind: "market_sku", market: "CN" },
    { key: "phase484-hero616-batch-trim", name: "616 clip/window batch boundary", notes: "金夹/银夹、透明窗口、帽环和 616S/升级款作为待核批次线索，不共享统一尺寸和重量。", sourceKey: heroFpn.key, variantKind: "edition_group" },
  ],
  eventTitle: "Hero 616 钢尖、挤压囊与批次边界复核",
  eventDescription: "以英雄官方旗舰店、616 独立评测、Parker 外形比较讨论和结构基础资料复核钢制暗尖、固定挤压囊、13.4/12.6/13.8 cm 样本及 616S/升级款边界。",
});

export const phase484ChiltonWingflowDuke551Hero616DepthPacks: CuratedEntityPack[] = [
  wingFlow,
  duke551,
  hero616,
];
