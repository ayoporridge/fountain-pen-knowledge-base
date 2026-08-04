import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE90_JINHAO_82_ID,
  phase90JinhaoPacks,
} from "./phase90-jinhao-82-9019";
import {
  PHASE83_ELOX_FALLBACK_ID,
  phase83DiplomatLeonardoPacks,
} from "./phase83-diplomat-leonardo";
import {
  PHASE36_PARKER_T1_ID,
  phase36ParkerPacks,
} from "./phase36-parker-25-t1-50-falcon-100";

export const PHASE483_IDS = {
  jinhao82: PHASE90_JINHAO_82_ID,
  elox: PHASE83_ELOX_FALLBACK_ID,
  parkerT1: PHASE36_PARKER_T1_ID,
} as const;

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
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 483 exact-model depth refresh`,
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
    ...phase90JinhaoPacks(),
    ...phase83DiplomatLeonardoPacks({
      excellenceA2: "phase83-pen-diplomat-excellence-a2",
      elox: PHASE83_ELOX_FALLBACK_ID,
      momentoZero: "phase83-pen-leonardo-momento-zero",
      mzgMosaico: "phase83-pen-leonardo-mzg-mosaico",
    }),
    ...phase36ParkerPacks,
  ];
  const pack = all.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 483 ${label} base pack is missing.`);
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

const jinhaoTtpen = source({
  key: "phase483-jinhao-ttpen",
  registryKey: "ttpen-phase483-jinhao-82",
  registryName: "TTpen",
  sourceType: "retailer",
  tier: "contemporary_archive",
  independenceGroup: "ttpen-phase483-jinhao",
  title: "Jinhao collection — TTpen",
  url: "https://www.ttpen.com/collections/jinhao",
  summary:
    "当代销售集合把 Jinhao 82 与 9019 Dadao 等编号分列，并展示多色、透明度和饰件选择；它不提供 Jinhao 全线统一尺寸、重量或厂史。",
  author: "TTpen",
});
const jinhaoDesk = source({
  key: "phase483-jinhao-well-appointed-desk",
  registryKey: "well-appointed-desk-phase483-jinhao-82",
  registryName: "The Well-Appointed Desk",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "well-appointed-desk-phase483-jinhao",
  title: "When is a knock off worth the fun? Jinhao 82",
  url: "https://www.wellappointeddesk.com/2024/01/when-is-a-knock-off-worth-the-fun-jinhao-82/",
  summary:
    "独立样本评测将 82 置于小尺寸 acrylic、旋帽、钢尖和 Pro Gear Slim 外形比较语境；样本体验不替代制造商目录。",
  author: "The Well-Appointed Desk",
  publishedAt: "2024-01-01",
});
const jinhaoFpn = source({
  key: "phase483-jinhao-fpn",
  registryKey: "fpn-phase483-jinhao-82-ef",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fpn-phase483-jinhao",
  title: "Jinhao 82 EF review",
  url: "https://www.fountainpennetwork.com/forum/topic/372882-jinhao-82-ef-review/",
  summary:
    "论坛样本记录 EF 尖、转换器、到手调校和日常书写检查；这是个体使用证据，不推导所有颜色和批次的固定线宽。",
  author: "Fountain Pen Network member",
});
const jinhaoJg3 = source({
  key: "phase483-jinhao-jg3",
  registryKey: "jg3-phase483-jinhao-82",
  registryName: "JG3 Reviews",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "jg3-phase483-jinhao",
  title: "The New Jinhao 82 Fountain Pen",
  url: "https://www.youtube.com/watch?v=tIOVxBCLLgI",
  summary:
    "独立视频样本讨论 #5 级别钢尖、EF/F/M 尖幅和颜色范围；视频体验用于交叉核对购买检查，不替代固定官方规格。",
  author: "JG3 Reviews",
});

const eloxOfficial = source({
  key: "phase483-diplomat-elox-official",
  registryKey: "diplomat-official-phase483-elox-collections",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "diplomat-official-phase483-elox",
  title: "Collections — Diplomat Elox",
  url: "https://www.diplomat-pen.com/en/collections/",
  summary:
    "官方集合将 Elox 单列，并说明名称来自德语 eloxieren；黑色底层与第二次彩色阳极处理形成双色环，笔身为铝，提供钢尖和 14K 路线。",
  author: "Diplomat",
});
const eloxArchive = source({
  key: "phase483-diplomat-elox-archive",
  registryKey: "diplomat-official-phase483-elox-archive",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "diplomat-official-phase483-elox",
  title: "Fountain pen archive — Diplomat",
  url: "https://www.diplomat-pen.com/en/type-of-product/fountain-pen/",
  summary:
    "官方钢笔档案把 Elox、Aero、Nexus 和 Excellence 等商品分列，并保留 Elox 的颜色与尖材 SKU 语境；颜色缺货不等于系列消失。",
  author: "Diplomat",
});
const eloxJapan = source({
  key: "phase483-diplomat-elox-japan",
  registryKey: "diamond-phase483-diplomat-elox",
  registryName: "Diamond / Diplomat Japan",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "diamond-phase483-elox",
  title: "Diplomat Elox 14K — Diamond Japan",
  url: "https://diamond.gr.jp/brand_dia/diplomat/products/elox01/",
  summary:
    "日本总代理页面为指定 14K 商品记录 139×15 mm、42 g、EF/F/M 和两用式；这些数字限定在该地区/尖材 SKU。",
  author: "Diamond / Diplomat Japan",
});
const eloxGoulet = source({
  key: "phase483-diplomat-elox-goulet",
  registryKey: "goulet-phase483-diplomat-elox-ring",
  registryName: "Goulet Pens",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "goulet-phase483-elox",
  title: "Diplomat Elox Ring Black/Purple",
  url: "https://www.gouletpens.com/products/diplomat-elox-fountain-pen-ring-black-purple",
  summary:
    "指定钢尖 Ring Black/Purple 商品页面给出约 139.5 mm、插帽 159.3 mm 和约 33 g 的零售测量；不把样本数字外推到 14K 或全系。",
  author: "Goulet Pens",
});

const parkerJapan = source({
  key: "phase483-parker-japan-history",
  registryKey: "parker-japan-phase483-t1-history",
  registryName: "Parker Japan",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "parker-official-phase483-t1",
  title: "Parker history — Parker Japan",
  url: "https://www.parkerpen.jp/parker-history.html",
  summary:
    "Parker 日本官方历史年表将 1970 年标为 Parker T-1 发布节点；官方节点不单独证明每个收藏样本的生产数量或维修状态。",
  author: "Parker Japan",
});
const parker75 = source({
  key: "phase483-parker75-reference",
  registryKey: "parker75-phase483-t1-reference",
  registryName: "Parker 75 Reference",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "parker75-phase483-t1",
  title: "T-1, 1970–71 — Parker 75 Reference",
  url: "https://www.parker75.com/Reference/75_Branches/T-1.htm",
  summary:
    "Parker 75 专题资料记录 T-1 的 1970–1971 窗口、钛制一体尖和与 Parker 75 的桶身螺纹家族关系；兼容性必须以实物测试。",
  author: "Parker 75 Reference",
});
const parkerCollector = source({
  key: "phase483-parkercollector-t1",
  registryKey: "parkercollector-phase483-t1",
  registryName: "Parker Pens Penography",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "parkercollector-phase483-t1",
  title: "Parker T1 — Parker Pens Penography",
  url: "https://www.parkercollector.com/parkert1.html",
  summary:
    "收藏专站记录 Space Pen 称呼、钛制一体尖、尖下调节螺钉、F/M 或 M/B 以及约 104,000 支出货说法；数量属于该专站的近似历史口径。",
  author: "Parker Pens Penography",
});
const parkerVintage = source({
  key: "phase483-vintagepens-t1",
  registryKey: "vintagepens-phase483-t1",
  registryName: "VintagePens",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "vintagepens-phase483-t1",
  title: "Parker T1 — VintagePens",
  url: "https://vintagepens.com/Parker_T1.shtml",
  summary:
    "VintagePens 说明 1970 年发布、短期停产、钛材加工和剩余钛零件被用于 Parker 75 系其他书写工具的背景；不把后配零件写成完整 T-1。",
  author: "VintagePens",
});
const parkerFpn = source({
  key: "phase483-parker-fpn",
  registryKey: "fpn-phase483-parker-t1",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fpn-phase483-parker-t1",
  title: "Parker T-1 discussion — Fountain Pen Network",
  url: "https://www.fountainpennetwork.com/forum/index.php?showtopic=56468",
  summary:
    "论坛讨论补充老 T-1 尖端、调节螺钉和维修风险的收藏语境；不能代替官方历史，也不保证所有样本相同。",
  author: "Fountain Pen Network members",
});

const jinhao82 = refresh(basePack(PHASE483_IDS.jinhao82, "Jinhao 82"), {
  key: "phase483-jinhao-82-depth-v1",
  markdownFile: ".planning/content-research/jinhao-82-phase483.md",
  storyTitle: "Jinhao 82：小尺寸树脂平台，不能用“像谁”替代型号说明",
  primary: jinhaoTtpen,
  extras: [jinhaoDesk, jinhaoFpn, jinhaoJg3],
  scope: {
    key: "phase483-jinhao-82-depth",
    scopeKey: "phase483-jinhao-82-depth",
    market: "Jinhao 82 contemporary retail and independent sample scope",
    productionState: "current",
    nibScope: "Steel nib; EF/F/M names vary by SKU and sample",
    materialScope: "resin/acrylic body; color, transparency and trim are SKU fields",
    editionScope: "Jinhao 82; not 82 Mini, 9019 Dadao, 51A, X159 or Sailor Professional Gear Slim",
  },
  claims: [
    claim(jinhaoTtpen, "phase483-jinhao-82-depth", "phase483-82-identity", "model_identity", "Jinhao 82 是当代小尺寸树脂/acrylic 旋帽钢笔；颜色、透明度、饰件和尖宽属于平台内商品选择。"),
    claim(jinhaoDesk, "phase483-jinhao-82-depth", "phase483-82-form", "design_language", "独立样本把 82 放在小尺寸、平顶轮廓和旋帽语境；与 Sailor Professional Gear Slim 的外形比较不能替代 82 自身身份。"),
    claim(jinhaoTtpen, "phase483-jinhao-82-depth", "phase483-82-material", "material", "树脂或 acrylic 笔身的颜色、透明度和金银饰件按 SKU 变化，不将同品牌其他树脂型号的材料或尺寸借入。"),
    claim(jinhaoFpn, "phase483-jinhao-82-depth", "phase483-82-nib", "nib_options", "EF、F、M 等尖幅来自精确商品或个体样本；钢尖线宽和到手调校不作全批次保证。"),
    claim(jinhaoFpn, "phase483-jinhao-82-depth", "phase483-82-fill", "filling_system", "样本使用墨囊/转换器路线；接口、随附转换器和兼容性以实际商品及握位照片核对。"),
    claim(jinhaoJg3, "phase483-jinhao-82-depth", "phase483-82-size-boundary", "specification", "独立视频以 #5 级别尖和小型平台讨论 82；本包不虚构覆盖所有颜色和卖家的统一长度、直径或重量。"),
    claim(jinhaoTtpen, "phase483-jinhao-82-depth", "phase483-82-neighbors", "identity_boundaries", "82 与 9019 Dadao、51A、X159、82 Mini 及相似外形商品保持独立，不共用图片、#8 尖、大容量转换器或售后结论。"),
    claim(jinhaoDesk, "phase483-jinhao-82-depth", "phase483-82-care", "maintenance", "换墨以常温清水吸排和自然干燥为低风险基线；裂纹、漏墨、帽口或尖片问题不以强溶剂、热水和硬掰替代维修。"),
    claim(jinhaoJg3, "phase483-jinhao-82-depth", "phase483-82-purchase", "purchase_guidance", "购买与二手核对应查看尖片、握位螺纹、帽内、尾部刻字、转换器接口和实际颜色，而不是只按“像谁”判断。", "editorial"),
  ],
  values: {
    series_name: "Jinhao 82",
    release_year: "当代商品与独立评测可见；本包不虚构首发年份",
    origin_country: "Jinhao 当代市场产品线；制造与批次以可追溯商品资料为准",
    nib: "钢尖；EF/F/M 等按精确 SKU 或实物尖片核对",
    fill_system: "墨囊或转换器；随附转换器按具体商品核对",
    material: "树脂/acrylic 笔身；透明度、颜色和饰件属于 SKU",
    dimensions: "小尺寸旋帽平台；未有统一官方全系尺寸，按 SKU/实物记录",
    weight: "按精确 SKU/实物记录，不用单支评测外推",
    price_range: "当代零售价格随地区、颜色、尖号和套装变化；不作长期报价",
    status: "当代市场可见；82 Mini、9019 等相邻型号保持独立",
  },
  variants: [
    { key: "phase483-jinhao-82-colors", name: "82 颜色/透明度 SKU", notes: "黑色、半透明、珠光和不同饰件作为平台内颜色/外观变体；不拆成新的基础型号。", sourceKey: jinhaoTtpen.key, variantKind: "color" },
    { key: "phase483-jinhao-82-nib-widths", name: "82 EF/F/M steel nib", notes: "尖幅依具体商品和实物样本；不把单支 EF 评测外推为跨批次线宽标准。", sourceKey: jinhaoFpn.key, variantKind: "nib" },
  ],
  eventTitle: "Jinhao 82 小型平台与 SKU 边界复核",
  eventDescription: "以当代销售集合、独立样本和论坛评测复核 82 的树脂/旋帽/钢尖/转换器路线，并将相似外形、82 Mini、9019 与个体尺寸重量留在边界外。",
});

const elox = refresh(basePack(PHASE483_IDS.elox, "Diplomat Elox"), {
  key: "phase483-diplomat-elox-depth-v1",
  markdownFile: ".planning/content-research/diplomat-elox-phase483.md",
  storyTitle: "Diplomat Elox：双阳极环不是 Aero 的橙色版本",
  primary: eloxOfficial,
  extras: [eloxArchive, eloxJapan, eloxGoulet],
  scope: {
    key: "phase483-diplomat-elox-depth",
    scopeKey: "phase483-diplomat-elox-depth",
    market: "Diplomat Elox official collection and regional fountain-pen SKUs",
    productionState: "current",
    nibScope: "Engraved steel or 14K gold nib by exact SKU; EF/F/M examples are market-specific",
    materialScope: "aluminium body with black base and second colored anodised ring treatment",
    editionScope: "Elox fountain pen; not Aero, Excellence, Nexus or same-color rollerball/ballpoint",
  },
  claims: [
    claim(eloxOfficial, "phase483-diplomat-elox-depth", "phase483-elox-identity", "model_identity", "Diplomat Elox 是独立铝制钢笔型号，以黑色底环和第二次彩色阳极处理、Soft Sliding Click 及精确尖材 SKU 识别。"),
    claim(eloxOfficial, "phase483-diplomat-elox-depth", "phase483-elox-process", "craft_process", "官方以 eloxieren 解释名称，并将黑色底层与第二次彩色阳极环作为视觉和工艺边界；这不表示所有表面或零件都与 Aero 相同。"),
    claim(eloxOfficial, "phase483-diplomat-elox-depth", "phase483-elox-material", "material", "Elox 笔身为铝制路线；环色、饰件和尖材按 SKU 变化，不能用某一颜色代替产品身份。"),
    claim(eloxOfficial, "phase483-diplomat-elox-depth", "phase483-elox-cap", "cap_mechanism", "官方集合列出 Soft Sliding Click 按压帽；闭合方式不等于磁吸，也不保证帽内件永不磨损。"),
    claim(eloxJapan, "phase483-diplomat-elox-depth", "phase483-elox-14k-spec", "specification", "日本 14K 页面记录 139×15 mm、42 g、EF/F/M 和两用式；这些数字限定在该 14K 地区商品。"),
    claim(eloxGoulet, "phase483-diplomat-elox-depth", "phase483-elox-steel-spec", "measurement_conflict", "Ring Black/Purple 钢尖零售样本约 139.5 mm、插帽 159.3 mm、33 g；与 14K 42 g 并列保留，不合成为全系重量。"),
    claim(eloxArchive, "phase483-diplomat-elox-depth", "phase483-elox-neighbors", "identity_boundaries", "Elox 与 Aero、Excellence、Nexus 以及同色 rollerball/ballpoint 分列；‘基于 Aero DNA’是设计沿袭，不是组件互换声明。"),
    claim(eloxOfficial, "phase483-diplomat-elox-depth", "phase483-elox-fill", "filling_system", "Elox fountain pen 走 converter 或国际标准墨胆路线；附件和接口仍应按精确钢尖/14K SKU 核对。"),
    claim(eloxArchive, "phase483-diplomat-elox-depth", "phase483-elox-care", "maintenance", "阳极表面和刻字以常温清水、自然干燥和软布为低风险维护；不使用酒精、强溶剂、研磨剂或金属工具。"),
    claim(eloxGoulet, "phase483-diplomat-elox-depth", "phase483-elox-purchase", "purchase_guidance", "购买时先确认 fountain pen、环色、尖材、尖幅、是否带 converter 和称量条件，再比较重量与手感。", "editorial"),
  ],
  values: {
    series_name: "Diplomat Elox",
    release_year: "当前官方集合与地区 SKU 可见；本包不虚构首发年份",
    origin_country: "德国 Diplomat 产品线；具体制造与地区 SKU 以商品页核对",
    nib: "精细雕刻钢尖或 14K gold nib；EF/F/M 等按具体商品",
    fill_system: "converter 或国际标准墨胆；Soft Sliding Click 帽",
    material: "铝笔身；黑色底环与第二次彩色阳极氧化的双色表面",
    dimensions: "14K 日本页面 139×15 mm；指定钢尖零售样本 139.5 mm、插帽 159.3 mm",
    weight: "14K 日本页面 42 g；指定 Ring Black/Purple 钢尖样本约 33 g",
    price_range: "地区商品价格与库存随日期、尖材和环色变化；不作全系行情",
    status: "官方集合与地区 SKU 可见；颜色、尖材和重量按 exact SKU",
  },
  variants: [
    { key: "phase483-elox-14k-japan", name: "Elox 14K Japan EF/F/M", notes: "日本页面的 139×15 mm、42 g、EF/F/M 两用式记录；不外推给钢尖环色。", sourceKey: eloxJapan.key, variantKind: "market_sku", market: "JP" },
    { key: "phase483-elox-ring-black-purple", name: "Elox Ring Black/Purple steel — 33 g sample", notes: "Goulet 指定零售样本约 33 g、139.5/159.3 mm；保持为样本口径，不覆盖既有基础变体记录。", sourceKey: eloxGoulet.key, variantKind: "market_sku", market: "US" },
  ],
  eventTitle: "Elox 双阳极、尖材与重量边界复核",
  eventDescription: "以 Diplomat 官方集合/档案、日本 14K 页面和 Ring Black/Purple 钢尖零售页复核 Elox 的双阳极环、Soft Sliding Click、铝材以及 33/42 g SKU 差异。",
});

const parkerT1 = refresh(basePack(PHASE483_IDS.parkerT1, "Parker T-1"), {
  key: "phase483-parker-t1-depth-v1",
  markdownFile: ".planning/content-research/parker-t1-phase483.md",
  storyTitle: "Parker T-1：钛金属一体尖的短命实验",
  primary: parkerJapan,
  extras: [parker75, parkerCollector, parkerVintage, parkerFpn],
  scope: {
    key: "phase483-parker-t1-depth",
    scopeKey: "phase483-parker-t1-depth",
    market: "Parker T-1 historical 1970–1971 collector scope",
    productionState: "historical",
    nibScope: "Titanium unitary nib shell with under-nib adjustment screw; F/M or M/B descriptions are historical/collector sources",
    materialScope: "titanium body and integrated nib shell; trim and end jewels must be checked on specimen",
    editionScope: "Parker T-1 fountain pen; not Parker 75, Parker 50 Falcon, Parker 25 or other-brand T1",
  },
  claims: [
    claim(parkerJapan, "phase483-parker-t1-depth", "phase483-t1-release", "release_history", "Parker 日本官方年表把 T-1 发布节点放在 1970 年；收藏资料通常把钢笔主体生产窗口置于 1970–1971。"),
    claim(parker75, "phase483-parker-t1-depth", "phase483-t1-nib", "nib_construction", "T-1 使用钛制一体尖壳，尖下调节螺钉可在有限范围内影响线条；不是普通可随时替换的独立钢尖。"),
    claim(parkerCollector, "phase483-parker-t1-depth", "phase483-t1-width", "nib_options", "收藏资料常写 F/M 或 M/B 调节范围；这个历史描述不能代替具体样本的尖端、螺钉和线宽检查。"),
    claim(parker75, "phase483-parker-t1-depth", "phase483-t1-parker75", "identity_boundaries", "T-1 与 Parker 75 存在桶身螺纹等家族关系，部分 75 section 可能机械配合，但不因此成为同一型号或无条件互换件。"),
    claim(parkerVintage, "phase483-parker-t1-depth", "phase483-t1-material-history", "material_history", "停产后的部分钛零件被用于 Parker 75 系其他书写工具；后配零件不应补回成完整原装 T-1 钢笔。"),
    claim(parkerCollector, "phase483-parker-t1-depth", "phase483-t1-production", "production_history", "Parkercollector 记录约 104,000 支出货的说法；这是专业收藏站的近似口径，不是当前官方可核验的生产台账。"),
    claim(parkerFpn, "phase483-parker-t1-depth", "phase483-t1-repair", "maintenance", "钛制一体尖、tipping 和尖下螺钉对掉落、过度调节和错误拆修敏感；异常样本应先交给熟悉该结构的维修者。"),
    claim(parker75, "phase483-parker-t1-depth", "phase483-t1-fill", "filling_system", "T-1 的墨囊/converter 说明必须以实际保存状态和具体套装核对，不能直接套用现代 Parker Vector、25 或其他型号。"),
    claim(parkerVintage, "phase483-parker-t1-depth", "phase483-t1-collector", "purchase_guidance", "收藏选购应检查整体尖壳、调节螺钉、端饰、箭形夹、帽口、上墨件和维修记录；稀有度不等于可用性。", "editorial"),
    claim(parkerFpn, "phase483-parker-t1-depth", "phase483-t1-neighbors", "identity_boundaries", "Parker 50 Falcon、Parker 75、Parker 25 及其他品牌的 T1 保持独立，不共用身份、图片和尺寸重量。"),
  ],
  values: {
    series_name: "Parker T-1",
    release_year: "1970；收藏资料通常将钢笔主体停产置于 1971 左右",
    origin_country: "Parker 历史产品线；具体生产批次和零件状态按实物核对",
    nib: "钛制一体尖；尖下调节螺钉，常见 F/M 或 M/B 范围",
    fill_system: "墨囊/converter；以保存状态和具体套装为准",
    material: "钛金属笔身与一体尖壳；红色透明端饰、金色箭形夹为常见识别特征",
    dimensions: "本包不虚构统一官方尺寸；不同收藏实物需单独测量",
    weight: "本包不虚构统一官方重量；实物状态和配件会影响测量",
    price_range: "历史收藏价格随品相、尖壳和原装程度变化；不提供二手估值",
    status: "历史型号，约 1970–1971 短期生产；不与 Parker 75、Parker 50 或其他品牌 T1 合并",
  },
  variants: [
    { key: "phase483-t1-titanium-unitary", name: "Parker T-1 titanium unitary nib", notes: "钛制一体尖壳和尖下调节螺钉是本型号的核心识别结构；F/M、M/B 以样本核对。", sourceKey: parker75.key, variantKind: "variant" },
    { key: "phase483-t1-space-pen-context", name: "T-1 / Space Pen collector terminology", notes: "Space Pen 是收藏语境别称，不把 Parker 后续圆珠笔、铅笔或滚珠笔写成同一支钢笔。", sourceKey: parkerCollector.key, variantKind: "edition_group" },
  ],
  eventTitle: "T-1 钛尖、短产期与维修边界复核",
  eventDescription: "以 Parker Japan 官方年表、Parker 75 Reference、收藏专站、VintagePens 和论坛资料复核 1970–1971 年代、钛制一体尖、螺纹家族关系及维修风险。",
});

export const phase483Jinhao82EloxParkerT1DepthPacks: CuratedEntityPack[] = [
  jinhao82,
  elox,
  parkerT1,
];
