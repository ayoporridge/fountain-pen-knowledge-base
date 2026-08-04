import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE39_PRO_GEAR_KOP_ID,
  phase39SailorKopModelPacks,
} from "./phase39-sailor-kop-models";
import {
  PHASE143_IDS,
  phase143Packs,
} from "./phase143-skb-rs301n-es520-batch";
import {
  PHASE182_IDS,
  phase182MajohnPacks,
} from "./phase182-majohn-v1-v60-wancai";

export const PHASE485_IDS = {
  sailorKop: PHASE39_PRO_GEAR_KOP_ID,
  skbEs520: PHASE143_IDS.es520,
  majohnV60: PHASE182_IDS.v60,
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
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 485 exact-model depth refresh`,
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
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator: sourceItem.summary }],
  };
}

function basePack(entityId: string, label: string): CuratedEntityPack {
  const all = [...phase39SailorKopModelPacks, ...phase143Packs, ...phase182MajohnPacks];
  const pack = all.find((candidate) => candidate.entityId === entityId && candidate.expectedType === "pen");
  if (!pack) throw new Error(`Phase 485 ${label} base pack is missing.`);
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

const sailorOfficial = source({
  key: "phase485-sailor-kop-official",
  registryKey: "sailor-official-phase485-kop",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-official-phase485-kop",
  title: "Professional Gear 金万年筆 KOPモデル 10-9618",
  url: "https://sailor.co.jp/product/10-9618/",
  summary: "日本官网列 M 10-9618-420、B 10-9618-620、21K 超大型双色尖、PMMA、两用式、φ20×142 mm、37.0 g 和受注生产。",
  author: "セーラー万年筆株式会社",
});
const sailorEnglish = source({
  key: "phase485-sailor-kop-english",
  registryKey: "sailor-english-official-phase485-kop",
  registryName: "Sailor Pen",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-english-official-phase485-kop",
  title: "Professional Gear KOP Gold Fountain Pen",
  url: "https://en.sailor.co.jp/product/10-9618/",
  summary: "英文官方页将 10-9618 标为 Professional Gear KOP Gold，补充同一 SKU 的英文名称和产品图语境，不替换日文规格。",
  author: "Sailor Pen",
});
const sailorKopTopic = source({
  key: "phase485-sailor-kop-topic",
  registryKey: "sailor-kop-topic-phase485",
  registryName: "Sailor Pen",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "sailor-official-kop-family-phase485",
  title: "King of Pens 官方专题",
  url: "https://en.sailor.co.jp/topics/king-of-pens/",
  summary: "官方专题把 KOP 分成 Ebonite、Urushi 与 ST Resin，并将 Professional Gear KOP 与圆头 King Profit 的材料和轮廓路线区分。",
  author: "Sailor Pen",
});
const sailorNibs = source({
  key: "phase485-sailor-kop-nib-topic",
  registryKey: "sailor-nib-topic-phase485-kop",
  registryName: "Sailor Pen",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "sailor-official-nib-phase485-kop",
  title: "各类不同笔尖：King of Pens 超大型 21K",
  url: "https://cn.sailor.co.jp/topics/%E5%90%84%E7%B1%BB%E4%B8%8D%E5%90%8C%E7%AC%94%E5%B0%96/",
  summary: "中文官方笔尖专题说明 KOP 使用超大型 21K 金尖并区分普通尖级别；用于 nib taxonomy，不把 KOP 写成软弹尖。",
  author: "Sailor Pen",
});
const sailorParka = source({
  key: "phase485-sailor-kop-parka",
  registryKey: "parka-phase485-sailor-progear",
  registryName: "Parka Blogs",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "parka-phase485-sailor-progear",
  title: "Sailor Professional Gear 21K 使用评测",
  url: "https://www.parkablogs.com/picture/review-sailor-professional-gear-medium-nib",
  summary: "专业评测记录全尺寸 Professional Gear 的平顶轮廓、21K 尖与握持条件；仅用于家族比较，不覆盖 KOP 的尺寸重量。",
  author: "Parka Blogs",
});
const sailorRetail = source({
  key: "phase485-sailor-kop-pensachi",
  registryKey: "pensachi-phase485-sailor-kop",
  registryName: "PenSachi",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "pensachi-phase485-sailor-kop",
  title: "Sailor King of Pens Pro Gear 10-9618",
  url: "https://www.pensachi.com/collections/sailor/products/10-9618-420",
  summary: "零售页把 10-9618、21K 金尖、converter 与墨囊附件列在同一商品语境，作为购买核对旁证，不覆盖官方交期。",
  author: "PenSachi",
});

const skbOfficial = source({
  key: "phase485-skb-es520-official",
  registryKey: "skb-es520-official-phase485",
  registryName: "SKB 文明钢笔",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "skb-official-es520-phase485",
  title: "ES-520 黑琵永續鋼筆組【書法尖】",
  url: "https://www.skb.com.tw/ES-520-%E9%BB%91%E7%90%B5%E6%B0%B8%E7%BA%8C%E9%8B%BC%E7%AD%86%E7%B5%84%E3%80%90%E6%9B%B8%E6%B3%95%E5%B0%96%E3%80%91",
  summary: "官方 SKU 列 55 度书法尖、RI-60 卡式墨水、#301A 吸墨器、环保回收料、约 13.8 cm、台湾制造和黑面琵鹭设计。",
  author: "SKB 文明钢笔",
});
const skbCatalog = source({
  key: "phase485-skb-catalog",
  registryKey: "skb-catalog-phase485-es520",
  registryName: "SKB 文明钢笔",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "skb-official-catalog-phase485",
  title: "SKB 精品钢笔目录",
  url: "https://www.skb.com.tw/product/category%26path%3D26_67",
  summary: "官方精品目录把 ES-520、RS-301N、RS-501i 等 SKU 分列，支持品牌导航和同品牌耗材边界。",
  author: "SKB 文明钢笔",
});
const skbAbout = source({
  key: "phase485-skb-about",
  registryKey: "skb-about-phase485-es520",
  registryName: "SKB 文明钢笔",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "skb-official-about-phase485",
  title: "SKB 关于我们",
  url: "https://www.skb.com.tw/pages/%E9%97%9C%E6%96%BC%E6%88%91%E5%80%91",
  summary: "官方历史页记录 1955、830、22 型、1963 自制笔尖、1970 金尖及 2012 重启台湾钢笔；这些是品牌时间线，不是 ES-520 首发年。",
  author: "SKB 文明钢笔",
});
const skbHuashan = source({
  key: "phase485-skb-huashan",
  registryKey: "huashan-phase485-es520",
  registryName: "华山 1914",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "huashan-phase485-es520",
  title: "SKB 书写记忆",
  url: "https://www.huashan1914.com/w/huashan1914/creative_19081517492906027",
  summary: "机构文化资料补充台湾 SKB 830、22 型与书写记忆，只作品牌语境，不承担 ES-520 的材质、尖角或耗材规格。",
  author: "华山 1914",
});
const skbRecycle = source({
  key: "phase485-skb-recycle-case",
  registryKey: "reca-phase485-skb-es520",
  registryName: "台湾资源循环案例资料",
  sourceType: "book",
  tier: "professional_secondary",
  independenceGroup: "reca-phase485-skb-es520",
  title: "资源循环绩优案例手册：黑琵永续钢笔",
  url: "https://www.reca.gov.tw/smmdbapi/CirculationDownload/1/1ec84d7c-1d05-46e6-a137-7f16103cc9b5/%E7%94%A2%E6%A5%AD%E7%92%B0%E6%95%99%E5%8F%8B%E5%96%84%E5%8C%96%E6%89%8B%E5%86%8A111%E5%B9%B4.pdf",
  summary: "台湾资源循环案例资料把黑琵永续钢笔放在办公废弃物循环语境；作为主题背景，不推导 ES-520 的再生比例或认证。",
  author: "台湾资源循环署相关资料",
});

const majohnOfficial = source({
  key: "phase485-majohn-official",
  registryKey: "majohn-official-phase485-v60",
  registryName: "Majohn",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "majohn-official-phase485-v60",
  title: "Majohn 当代品牌导航",
  url: "https://www.majohnpen.com/",
  summary: "官方站作为 Majohn 当代品牌和型号名称语境的身份来源；V60 的尺寸、重量与批次尖号不从导航页臆造。",
  author: "Majohn",
});
const majohnDappr = source({
  key: "phase485-majohn-v60-dappr",
  registryKey: "dappr-phase485-majohn-v60",
  registryName: "dapprman",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "dappr-phase485-majohn-v60",
  title: "Majohn/Moonman V60",
  url: "https://dappr.net/2025/06/13/majohn-moonman-v60/",
  summary: "独立评测记录 V60 的三角截面、约 148.8/132.5 mm 样本长度、活塞、帽盖密封和握位边界。",
  author: "dapprman",
  publishedAt: "2025-06-13",
});
const majohnPixel = source({
  key: "phase485-majohn-v60-pixel",
  registryKey: "pixelated-phase485-majohn-v60",
  registryName: "Pixelated Penmanship",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pixelated-phase485-majohn-v60",
  title: "Moonman V60: Perhaps the Best Copycat Yet?",
  url: "https://pixelpenman.com/blog/2025/07/19/moonman-v60-perhaps-the-best-copycat-yet/",
  summary: "独立评测讨论三角握位、活塞、#6 钢尖、F 尖书写和与 OMAS 360 的外形比较；相似外形不是授权或兼容证据。",
  author: "Pixelated Penmanship",
  publishedAt: "2025-07-19",
});
const majohnFpn = source({
  key: "phase485-majohn-v60-fpn",
  registryKey: "fpn-phase485-majohn-v60",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fpn-phase485-majohn-v60",
  title: "Majohn V60 与 OMAS 360 讨论",
  url: "https://www.fountainpennetwork.com/forum/topic/376662-majohn-v60-omage-to-omas/",
  summary: "论坛讨论 V60 的三角活塞、Moonman/Majohn 名称和 OMAS 360 参照关系；用于身份与维护旁证，不替代 SKU 规格。",
  author: "Fountain Pen Network members",
});
const majohnVideo = source({
  key: "phase485-majohn-v60-video",
  registryKey: "youtube-phase485-majohn-v60",
  registryName: "Une Fontaine de Plumes",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "youtube-phase485-majohn-v60",
  title: "Majohn/Moonman V60 / Trianglo 视频评测",
  url: "https://www.youtube.com/watch?v=YS8d8TYXWwY",
  summary: "视频按外观、尺寸、重量、装墨、握持和书写章节展示单支 V60；所有尺寸和手感均保持为样本观察。",
  author: "Une Fontaine de Plumes",
  publishedAt: "2024-09-28",
});
const majohnReddit = source({
  key: "phase485-majohn-v60-reddit",
  registryKey: "reddit-phase485-majohn-v60",
  registryName: "r/fountainpens participants",
  sourceType: "reddit",
  tier: "community",
  independenceGroup: "reddit-phase485-majohn-v60",
  title: "Majohn V60 灰色透明示范使用讨论",
  url: "https://www.reddit.com/r/fountainpens/comments/1i9rxqh/",
  summary: "社区样本讨论三角笔身防滚、握位和透明版本；用于购买前的人手差异提醒，不作全批次舒适度结论。",
  author: "r/fountainpens participants",
});

const sailorKop = refresh(basePack(PHASE485_IDS.sailorKop, "Sailor Professional Gear KOP"), {
  key: "phase485-sailor-professional-gear-kop-depth-v1",
  markdownFile: ".planning/content-research/sailor-professional-gear-kop-phase485.md",
  storyTitle: "Professional Gear KOP 10-9618：平顶 KOP 的货号、尖型与维护边界",
  primary: sailorOfficial,
  extras: [sailorEnglish, sailorKopTopic, sailorNibs, sailorParka, sailorRetail],
  scope: {
    key: "phase485-sailor-kop-depth",
    scopeKey: "phase485-sailor-kop-depth",
    market: "Sailor Japan Professional Gear KOP exact SKU scope",
    productionState: "current",
    nibScope: "21K super-large two-tone nib; M 10-9618-420 and B 10-9618-620",
    materialScope: "PMMA body and gold-plated metal parts; not King Profit ebonite",
    editionScope: "Professional Gear KOP 10-9618; not King Profit ST/Ebonite, ordinary Pro Gear, Slim or Realo",
  },
  claims: [
    claim(sailorOfficial, "phase485-sailor-kop-depth", "phase485-kop-identity", "model_identity", "Professional Gear KOP 10-9618 是写乐平顶 Pro Gear 路线的具体 KOP SKU，M/B 货号、超大型双色 21K 尖、PMMA、φ20×142 mm 和 37.0 g 必须绑定在该编号下。"),
    claim(sailorOfficial, "phase485-sailor-kop-depth", "phase485-kop-codes", "market_sku", "官方当前列出 10-9618-420 中字与 10-9618-620 太字；没有同一 item code 时不把地区标题或卖家旧编号自动合并。"),
    claim(sailorKopTopic, "phase485-sailor-kop-depth", "phase485-kop-family", "family_boundary", "KOP 是尖尺寸与产品等级层，Professional Gear 是平顶外形层；圆头 King Profit ST/Ebonite、KOP Urushi 与特别版保持独立。"),
    claim(sailorNibs, "phase485-sailor-kop-depth", "phase485-kop-nib", "nib_construction", "KOP 使用超大型 21K 金尖；超大型不等于可按压力获得软弹，也不等于 Naginata Togi 特殊研磨。"),
    claim(sailorOfficial, "phase485-sailor-kop-depth", "phase485-kop-spec", "specification", "日本官方规格为 PMMA、金色电镀、两用式、φ20×142 mm、37.0 g，并标注受注生产；价格和交期随地区与日期变化。"),
    claim(sailorEnglish, "phase485-sailor-kop-depth", "phase485-kop-language", "identity_boundary", "英文官方页的 Professional Gear KOP Gold 是同一 10-9618 的语言入口，不是另一个金色版本或独立型号。"),
    claim(sailorParka, "phase485-sailor-kop-depth", "phase485-kop-progear", "family_context", "普通全尺寸 Professional Gear 21K 的握持和轮廓可作家族比较，但其尖尺寸和笔身数字不能回填 KOP。"),
    claim(sailorRetail, "phase485-sailor-kop-depth", "phase485-kop-accessories", "filling_system", "零售页把 converter、墨囊和 10-9618 商品放在同一购买语境；附件仍应以具体包装和官方页面核对。"),
    claim(sailorOfficial, "phase485-sailor-kop-depth", "phase485-kop-care", "maintenance", "大型金尖和电镀件以低压力、常温清水、柔软布维护；异常尖片、螺纹或 converter 漏气应交由 Sailor 售后或专业维修。"),
    claim(sailorRetail, "phase485-sailor-kop-depth", "phase485-kop-purchase", "purchase_guidance", "购买或二手核对要记录 10-9618-420/620、测量口径、盒卡、converter、尖面和电镀状态，而不是只看无刻字照片。", "editorial"),
  ],
  values: {
    series_name: "Professional Gear KOP 10-9618",
    release_year: "当前日本官方产品页；未声明单一首发年",
    origin_country: "日本 Sailor 产品线；具体批次按包装与刻字核对",
    nib: "21K 超大型双色尖；M 10-9618-420、B 10-9618-620",
    fill_system: "Sailor converter / cartridge 两用式；官网列内置 converter",
    material: "PMMA 树脂；金色电镀金属件",
    dimensions: "含夹约 φ20×142 mm，37.0 g",
    weight: "官方产品页列 37.0 g；不含墨水与盒套的口径需按样本复核",
    price_range: "受注生产与地区渠道价格随日期变化；不作固定报价",
    status: "日本官网受注生产；M/B 货号与地区库存分开核对",
  },
  variants: [
    { key: "phase485-kop-m", name: "10-9618-420 M", productCode: "10-9618-420", notes: "官方中字货号；仍属于 Professional Gear KOP，不拆为独立基础型号。", sourceKey: sailorOfficial.key, variantKind: "nib" },
    { key: "phase485-kop-b", name: "10-9618-620 B", productCode: "10-9618-620", notes: "官方太字货号；线宽受纸张与墨水影响，不作固定毫米承诺。", sourceKey: sailorOfficial.key, variantKind: "nib" },
  ],
  eventTitle: "Professional Gear KOP 10-9618 精确 SKU 与家族边界复核",
  eventDescription: "以 Sailor 日文/英文官方页、KOP 专题、笔尖专题和专业评测复核平顶 KOP 的货号、超大型 21K、PMMA、尺寸、受注生产与 King Profit/普通 Pro Gear 的边界。",
});

const skbEs520 = refresh(basePack(PHASE485_IDS.skbEs520, "SKB ES-520"), {
  key: "phase485-skb-es520-depth-v1",
  markdownFile: ".planning/content-research/skb-es-520-phase485.md",
  storyTitle: "SKB ES-520：55 度书法尖、套装耗材与台湾品牌边界",
  primary: skbOfficial,
  extras: [skbCatalog, skbAbout, skbHuashan, skbRecycle],
  scope: {
    key: "phase485-skb-es520-depth",
    scopeKey: "phase485-skb-es520-depth",
    market: "Taiwan SKB ES-520 exact current set SKU",
    productionState: "current",
    nibScope: "55-degree calligraphy nib; vertical fine / tilted broad guidance",
    materialScope: "officially described recycled material; exact composition and ratio not published here",
    editionScope: "ES-520 Black-faced Spoonbill sustainable set; not RS-301N, RS-501i or mixed Penton/SIKIB page",
  },
  claims: [
    claim(skbOfficial, "phase485-skb-es520-depth", "phase485-es520-identity", "model_identity", "SKB ES-520 是台湾 SKB 的黑琵永續书法尖钢笔组，官方同时列书法尖、环保回收料、台湾制造和套装耗材。"),
    claim(skbOfficial, "phase485-skb-es520-depth", "phase485-es520-nib", "nib_construction", "官方说明笔尖呈 55 度仰角，垂直较细、倾斜较粗；这是操作方向提示，不是固定毫米线宽或压力保证。"),
    claim(skbOfficial, "phase485-skb-es520-depth", "phase485-es520-fill", "filling_system", "套装随附 RI-60 卡式墨水一管与 #301A 吸墨器一支；不能把 RS-301N 的专用黄铜吸墨器回填到 ES-520。"),
    claim(skbOfficial, "phase485-skb-es520-depth", "phase485-es520-material", "material", "官方将笔身材料写为环保回收料；没有公布的再生比例、认证或配方保持为空，不扩写成环境承诺。"),
    claim(skbCatalog, "phase485-skb-es520-depth", "phase485-es520-navigation", "brand_navigation", "SKB 官方目录把 ES-520 与 RS-301N、RS-501i 分列；书法尖和套装耗材构成独立 SKU 边界。"),
    claim(skbAbout, "phase485-skb-es520-depth", "phase485-es520-history", "brand_context", "1955、830、22 型、1963 自制笔尖、1970 金尖和 2012 重启是 SKB 品牌时间线，不是 ES-520 首发年份或材料配方。"),
    claim(skbRecycle, "phase485-skb-es520-depth", "phase485-es520-circular", "design_context", "资源循环案例资料支持黑琵永續的生态与循环语境，但不替代 ES-520 商品页的规格，也不证明每批再生比例。"),
    claim(skbOfficial, "phase485-skb-es520-depth", "phase485-es520-care", "maintenance", "书法尖以低压力、常温清水、自然干燥维护；刮纸、断墨或耗材松动时停止自行掰尖和改装。"),
    claim(skbOfficial, "phase485-skb-es520-depth", "phase485-es520-purchase", "purchase_guidance", "购买要核对 ES-520 编号、55 度尖、RI-60、#301A、包装和刻字条件，不以黑琵图案推断普通圆尖规格。", "editorial"),
  ],
  values: {
    series_name: "ES-520 黑琵永續鋼筆組【書法尖】",
    release_year: "当前官方商品页；未声明单一首发年",
    origin_country: "Taiwan",
    nib: "55° 书法尖；垂直较细、倾斜较粗是官方使用说明",
    fill_system: "RI-60 卡式墨水 ×1 或 #301A 吸墨器 ×1（套装配置）",
    material: "环保回收料；再生比例与配方未在本包断言",
    dimensions: "总长约 ±13.8 cm",
    weight: "官方商品页未公布；不从 RS-301N 或样本外推",
    price_range: "当期套装价格、刻字和库存随官方页面变化",
    status: "台湾 SKB 当前商品组；书法尖与套装内容按 SKU 核对",
  },
  variants: [
    { key: "phase485-es520-calligraphy", name: "ES-520 55° 书法尖", notes: "官方核心尖型；垂直／倾斜线宽差异来自角度，不创建多个尖宽实体。", sourceKey: skbOfficial.key, variantKind: "nib" },
    { key: "phase485-es520-set", name: "ES-520 套装配置", notes: "RI-60 与 #301A 随套装列出；刻字、库存和赠品属于当期购买条件。", sourceKey: skbOfficial.key, variantKind: "edition_group" },
  ],
  eventTitle: "SKB ES-520 书法尖、耗材与永续语境复核",
  eventDescription: "以 SKB 官方商品页、精品目录、品牌历史和资源循环案例交叉核对 55 度书法尖、RI-60/#301A、环保回收料、13.8 cm、台湾产地与 RS 系列边界。",
});

const majohnV60 = refresh(basePack(PHASE485_IDS.majohnV60, "Majohn V60"), {
  key: "phase485-majohn-v60-depth-v1",
  markdownFile: ".planning/content-research/majohn-v60-phase485.md",
  storyTitle: "Majohn V60：三角握位、活塞机构和 Moonman 别名的购买判断",
  primary: majohnDappr,
  extras: [majohnOfficial, majohnPixel, majohnFpn, majohnVideo, majohnReddit],
  scope: {
    key: "phase485-majohn-v60-depth",
    scopeKey: "phase485-majohn-v60-depth",
    market: "Majohn/Moonman V60 contemporary retail and independent sample scope",
    productionState: "current",
    nibScope: "Common #6 steel nib; F/M and other widths depend on exact SKU and tuning",
    materialScope: "resin body/cap with transparent, colour and trim variants",
    editionScope: "V60 fountain pen; not OMAS 360, P140/P141, V1 or rollerball sibling",
  },
  claims: [
    claim(majohnDappr, "phase485-majohn-v60-depth", "phase485-v60-identity", "model_identity", "Majohn V60 是三角截面活塞钢笔；Moonman V60 是市场别名，不能因此拆成第二个型号或 OMAS 360 的同一节点。"),
    claim(majohnDappr, "phase485-majohn-v60-depth", "phase485-v60-measurement", "specification", "独立样本给出约 148.8 mm 合盖、132.5 mm 去帽；测量条件和颜色批次不同，数字不作为全系工厂定值。"),
    claim(majohnDappr, "phase485-majohn-v60-depth", "phase485-v60-filling", "filling_system", "V60 使用活塞上墨；尾端旋钮、吸墨行程和携带防碰是维护与购买重点，不直接兼容国际墨囊或其他品牌 converter。"),
    claim(majohnPixel, "phase485-majohn-v60-depth", "phase485-v60-nib", "nib_options", "公开样本常见 #6 钢尖和 F/M 尖，反馈、线宽和调校随单支变化；不能因为尖座外观相似就反复无风险换尖。"),
    claim(majohnPixel, "phase485-majohn-v60-depth", "phase485-v60-design", "design_comparison", "V60 与 OMAS 360 的三角外形比较是评测语境，不证明授权、法律关系、零件或材料兼容。"),
    claim(majohnFpn, "phase485-majohn-v60-depth", "phase485-v60-name", "identity_boundary", "Majohn/Moonman 双名称、P140/P141、V1 和滚珠笔版本保持别名或邻接关系，不共用图片、上墨或维修结论。"),
    claim(majohnVideo, "phase485-majohn-v60-depth", "phase485-v60-sample", "independent_context", "视频按重量、尺寸、装墨、握持和书写章节展示单支样本；手感和尺寸均不外推为统一生产标准。"),
    claim(majohnReddit, "phase485-majohn-v60-depth", "phase485-v60-grip", "ergonomics", "社区样本提醒三角截面具有防滚和定位优势，同时可能让不适应棱线的人感到硌手；舒适度需要本人试写。"),
    claim(majohnDappr, "phase485-majohn-v60-depth", "phase485-v60-care", "maintenance", "活塞以常温清水吸排、自然干燥和低风险润滑边界维护；漏气、卡顿、裂纹或帽内积墨应交卖家或熟悉该型号的维修者。"),
    claim(majohnOfficial, "phase485-majohn-v60-depth", "phase485-v60-brand", "brand_context", "Majohn 官方站用于当代品牌身份和名称导航；V60 的独立尺寸、尖号和颜色仍以型号来源核对。"),
    claim(majohnPixel, "phase485-majohn-v60-depth", "phase485-v60-purchase", "purchase_guidance", "购买前核对三角握位、透明度、尖号、活塞往返、帽盖密封和商品图片是否误用 OMAS/P140 资料。", "editorial"),
  ],
  values: {
    series_name: "Majohn V60",
    release_year: "当代市场与独立评测可见；本包不虚构首发年份",
    origin_country: "Majohn 当代产品线；具体制造批次按商品与包装核对",
    nib: "常见 #6 钢尖；F/M 等尖号和线宽按精确 SKU／实物确认",
    fill_system: "piston 活塞上墨",
    material: "树脂笔身与笔帽；透明、彩色、饰件和批次按 SKU",
    dimensions: "参考样本约 148.8 mm 合盖、132.5 mm 去帽；测量位置需标注",
    weight: "公开统一重量未固定；装墨与饰件会改变结果",
    price_range: "地区、颜色、尖号和附件导致价格变化；不作固定报价",
    status: "当代市场可见；Majohn/Moonman 名称和颜色按渠道核对",
  },
  variants: [
    { key: "phase485-v60-demonstrator", name: "V60 透明示范版本", notes: "便于观察液面和残墨；透明度与树脂纹理是型号内外观变体。", sourceKey: majohnDappr.key, variantKind: "material" },
    { key: "phase485-v60-f-m", name: "V60 F/M 钢尖样本", notes: "独立评测的 F/M 线宽与反馈属于单支调校，不对所有批次作保证。", sourceKey: majohnPixel.key, variantKind: "nib" },
  ],
  eventTitle: "Majohn V60 三角活塞、名称与维修边界复核",
  eventDescription: "以 Majohn 品牌导航、dapprman、Pixelated Penmanship、FPN、视频和社区样本复核三角截面、活塞、#6 钢尖、尺寸口径、Moonman 别名与 OMAS/P140 的身份边界。",
});

export const phase485SailorKopSkbEs520MajohnV60DepthPacks: CuratedEntityPack[] = [sailorKop, skbEs520, majohnV60];
