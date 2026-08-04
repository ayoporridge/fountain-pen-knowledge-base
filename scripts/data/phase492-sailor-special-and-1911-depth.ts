import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE39_NAGINATA_7121_ID,
  phase39SailorKopModelPacks,
} from "./phase39-sailor-kop-models";
import {
  PHASE302_1911_LARGE_ID,
  phase302Sailor1911LargePacks,
} from "./phase302-sailor-1911-large";
import {
  PHASE67_MODELS,
  phase67SailorJ2Packs,
  type Phase67Model,
} from "./phase67-sailor-j2";

export const PHASE492_IDS = {
  naginata: PHASE39_NAGINATA_7121_ID,
  shikiori: "9jIF6QOt8wGr",
  large: PHASE302_1911_LARGE_ID,
} as const;

const RETRIEVED = "2026-08-04";
const SAILOR_BRAND_ID = "ce2dcqixqSCx";

function web(input: {
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
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 492 exact-model depth refresh`,
  };
}

function claim(input: {
  key: string;
  predicate: string;
  objectText: string;
  source: CuratedSource;
  scope: CuratedScope;
  factClass?: CuratedClaim["factClass"];
  confidence?: number;
  extras?: Array<{ key: string; source: CuratedSource; locator?: string; note?: string }>;
}): CuratedClaim {
  const factClass = input.factClass ?? "core";
  const evidence = [
    {
      key: `${input.key}-evidence`,
      sourceKey: input.source.key,
      scopeKey: input.scope.scopeKey,
      locator: input.source.summary,
    },
    ...(input.extras ?? []).map((extra) => ({
      key: extra.key,
      sourceKey: extra.source.key,
      scopeKey: input.scope.scopeKey,
      locator: extra.locator ?? extra.source.summary,
      note: extra.note,
    })),
  ];
  return {
    key: input.key,
    predicate: input.predicate,
    objectText: input.objectText,
    factClass,
    confidence: input.confidence ?? (factClass === "editorial" ? 0.95 : 0.98),
    sourceKey: input.source.key,
    locator: input.source.summary,
    evidence,
  };
}

function specEvidence(
  key: string,
  fieldKey: SpecFieldKey,
  source: CuratedSource,
  scope: CuratedScope,
  locator: string,
): CuratedSpecEvidence {
  return {
    key,
    fieldKey,
    sourceKey: source.key,
    scopeKey: scope.scopeKey,
    locator,
    qualifies: true,
  };
}

function findPen(packs: CuratedEntityPack[], entityId: string, label: string): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 492 ${label} base pack is missing.`);
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
    variants: CuratedVariant[];
    eventTitle: string;
    eventDescription: string;
  },
): CuratedEntityPack {
  const sources = [...(pack.sources ?? []), input.primary, ...input.extras].filter(
    (source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index,
  );
  const scopes = [...(pack.scopes ?? []), input.scope].filter(
    (scope, index, all) =>
      all.findIndex((candidate) => candidate.scopeKey === scope.scopeKey) === index,
  );
  const variants = [...(pack.variants ?? []), ...input.variants].filter(
    (variant, index, all) => all.findIndex((candidate) => candidate.key === variant.key) === index,
  );
  const spec = pack.spec
    ? {
        ...pack.spec,
        values: { ...pack.spec.values, ...input.values },
        evidence: [
          ...(pack.spec.evidence ?? []),
          ...Object.entries(input.values).map(([fieldKey, value]) =>
            specEvidence(
              `${input.key}-${fieldKey}`,
              fieldKey as Exclude<SpecFieldKey, "brand_entity_id">,
              input.primary,
              input.scope,
              `${input.primary.summary}; value=${value}`,
            ),
          ),
        ],
      }
    : undefined;
  return {
    ...pack,
    key: input.key,
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: input.primary.key,
    sources,
    scopes,
    claims: [...(pack.claims ?? []), ...input.claims],
    variants,
    spec,
    timeline: [
      ...(pack.timeline ?? []),
      {
        key: `${input.key}-review`,
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

const naginataOfficial = web({
  key: "phase492-sailor-naginata-official",
  registryKey: "sailor-official-10-7121-phase492",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-official-10-7121-phase492",
  title: "Sailor Naginata Togi Fountain Pen 10-7121",
  url: "https://en.sailor.co.jp/product/10-7121/",
  summary:
    "官方产品页列出 10-7121-228/328/428/628 对应 F/MF/M/B，21K Gold Naginata-Togi Gold IP、C/C、PMMA、φ18×141 mm、24.0 g 与 PG-NAG 包装号，并提示地区供货与实物照片差异。",
});
const naginataTypes = web({
  key: "phase492-sailor-naginata-types",
  registryKey: "sailor-official-nib-types-phase492",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-official-nib-types-phase492",
  title: "Sailor 官方：笔尖的种类与特长",
  url: "https://sailor.co.jp/topics/fountain-pen-type/",
  summary:
    "官方基础知识将 Naginata-Togi 作为特殊笔尖类型，说明低角度更宽、直立更细以及适合表现汉字的顿、钩、撇等笔势；类型说明不等于具体整笔 SKU。",
});
const naginataInterview = web({
  key: "phase492-sailor-naginata-interview",
  registryKey: "sailor-official-naginata-interview-phase492",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-official-naginata-interview-phase492",
  title: "Sailor 官方：唯一无二的笔尖“长刀研”专访",
  url: "https://sailor.co.jp/topics/interview_naginatatogi/",
  summary:
    "官方专访补充长刀研的研磨、工匠技能与汉字书写语境；用于解释 special nib 背景，不把 KOP 或其他笔身规格移植到 10-7121。",
});
const naginataIndependent = web({
  key: "phase492-sailor-naginata-independent",
  registryKey: "fountainpenarchy-naginata-phase492",
  registryName: "Fountain PenArchy",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fountainpenarchy-naginata-phase492",
  title: "It's Togi Time – The Battle of the Blades",
  url: "https://fountainpenarchy.wordpress.com/2020/01/04/its-togi-time-the-battle-of-the-blades-part-1/",
  summary:
    "独立长刀研比较记录两支样笔的线宽、角度与手工研磨个体差异；它用于解释试写边界，不作为 10-7121 工厂规格或所有尖号的统一承诺。",
});
const naginataFpn = web({
  key: "phase492-sailor-naginata-fpn",
  registryKey: "fpn-sailor-1911-naginata-phase492",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "professional_secondary",
  independenceGroup: "fpn-sailor-naginata-phase492",
  title: "Sailor 1911 Naginata Togi Black & Rhodium Trim MF 样笔讨论",
  url: "https://www.fountainpennetwork.com/forum/topic/102176-sailor-1911-naginata-togi-black-rhodium-trim-mf-nib/",
  summary:
    "论坛中的历史样笔讨论记录 1911 Naginata Togi MF 的 C/C 使用与个人书写反馈；样本笔身和年份与 10-7121 分开，不能代替官方规格。",
});

const shikioriOfficialJa = web({
  key: "phase492-sailor-shikiori-ja",
  registryKey: "sailor-official-11-1224-ja-phase492",
  registryName: "Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-official-11-1224-ja-phase492",
  title: "SHIKIORI 雪月空葉 11-1224",
  url: "https://sailor.co.jp/product/11-1224/",
  summary:
    "日本官方页列春空、万叶、名月、垂雪四种颜色与 EF/MF 八个后缀，14K 中型尖、C/C、PMMA、金色 IP、φ17×124 mm、16.8 g 与 PG-03W 包装号。",
});
const shikioriOfficialEn = web({
  key: "phase492-sailor-shikiori-en",
  registryKey: "sailor-official-11-1224-en-phase492",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "sailor-official-11-1224-en-phase492",
  title: "SHIKIORI SETSUGETSU SORAHA Fountain Pen",
  url: "https://en.sailor.co.jp/product/11-1224/",
  summary:
    "英文官方页用于交叉确认 11-1224 的产品名称、地区可用性与实物照片差异提示，不据此固定地区价格或库存。",
});
const shikioriPlating = web({
  key: "phase492-sailor-shikiori-plating",
  registryKey: "sailor-official-plating-change-phase492",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-official-plating-change-phase492",
  title: "Specification Change (Plating Process)",
  url: "https://en.sailor.co.jp/topics/specification-change-plating-process/",
  summary:
    "官方公告说明部分 1911、Professional Gear 与 SHIKIORI 产品从 2024 年 9 月后逐步切换到 IP 处理，过渡期可能同时存在新旧表面处理；公告不新增 11-1224 颜色或笔身。",
});
const shikioriPenHouse = web({
  key: "phase492-sailor-shikiori-penhouse",
  registryKey: "pen-house-shikiori-1224-phase492",
  registryName: "Pen-House",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "pen-house-shikiori-1224-phase492",
  title: "Pen-House：四季织雪月空葉 11-1224 商品档案",
  url: "https://www.pen-house.net/item/37709.html",
  summary:
    "日本专业文具店商品档案把 11-1224 的四个颜色放在同一产品下，并保留笔尖、笔身与包装的实拍说明；商品照片和当时库存不替代官方现行规格。",
});
const shikioriRakuten = web({
  key: "phase492-sailor-shikiori-rakuten",
  registryKey: "rakuten-penlife-shikiori-1224-phase492",
  registryName: "Rakuten pen retailer record",
  sourceType: "retailer",
  tier: "contemporary_archive",
  independenceGroup: "rakuten-penlife-shikiori-1224-phase492",
  title: "SHIKIORI 雪月空葉 11-1224 retailer record",
  url: "https://review.rakuten.co.jp/item/1/243186_10007979/1.1/",
  summary:
    "独立市场记录交叉出现春空、万叶、名月、垂雪以及 EF/MF；仅用于核对商品命名和购买时的 SKU 习惯，不固定价格、库存或色差。",
});

const largeOfficial = web({
  key: "phase492-sailor-1911-large-official",
  registryKey: "sailor-official-11-2024-phase492",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-official-11-2024-phase492",
  title: "1911 L Silver Trim Fountain Pen 11-2024",
  url: "https://en.sailor.co.jp/product/11-2024/",
  summary:
    "官方产品页列 11-2024-120/220/320/420/620/720/920 对应 EF/F/MF/M/B/Z/MS，21K Gold with Rhodium plating、C/C、PMMA、φ18×141 mm 与 21.6 g。",
});
const largeSeries = web({
  key: "phase492-sailor-1911-series",
  registryKey: "sailor-official-1911-series-phase492",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-official-1911-series-phase492",
  title: "Sailor official 1911 Series directory",
  url: "https://en.sailor.co.jp/topics/1911-series/",
  summary:
    "官方系列页把 1911 Large 11-2021/11-2024、Standard 11-1219、Realo、demonstrator 与 Black Luster 分开，说明 Large 的 PMMA、C/C 和 21K 路线。",
});
const largeChina = web({
  key: "phase492-sailor-1911-large-cn",
  registryKey: "sailor-cn-11-2024-phase492",
  registryName: "Sailor China",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-cn-11-2024-phase492",
  title: "Sailor China 1911 L silver trim",
  url: "https://cn.sailor.co.jp/product/11-2024/",
  summary:
    "中国官方页面以 1911 L 银质镶边呈现 11-2024，并列出对应尖号和型号身份，用于地区命名交叉核对。",
});
const largePlating = web({
  key: "phase492-sailor-1911-plating",
  registryKey: "sailor-official-plating-1911-phase492",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-official-plating-1911-phase492",
  title: "Specification Change (Plating Process)",
  url: "https://en.sailor.co.jp/topics/specification-change-plating-process/",
  summary:
    "官方公告说明 1911 等系列的部分饰件在 2024 年 9 月以后逐步转向 IP 处理，过渡期会有新旧表面处理并存；公告用于解释批次边界，不把 11-2024 改写为另一产品号。",
});
const largeReview = web({
  key: "phase492-sailor-1911-large-review",
  registryKey: "pen-addict-sailor-1911-large-phase492",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pen-addict-sailor-1911-large-phase492",
  title: "Sailor 1911 Large Stormy Sea review",
  url: "https://penaddict.squarespace.com/blog/2018/5/25/sailor-1911-large-stormy-sea",
  summary:
    "独立评测记录一支 1911 Large 样本的套帽、无帽、21K 尖和 C/C 使用观察；样本量测与书写感受只作为比例和体验语境，不替代 11-2024 官方规格。",
});

const phase67Ids: Record<(typeof PHASE67_MODELS)[number]["key"], string> = {
  "young-profit": "OwE1TbVzfyQK",
  "standard-rhodium": "Ga6QpPQiF0YT",
  promenade: "VyZ6lMsgEeUo",
  shikiori: PHASE492_IDS.shikiori,
};
const phase67Models: Phase67Model[] = PHASE67_MODELS.map((model) => ({
  ...model,
  id: phase67Ids[model.key],
}));

const naginataBase = findPen(
  phase39SailorKopModelPacks,
  PHASE492_IDS.naginata,
  "Naginata Togi 10-7121",
);
const shikioriBase = findPen(
  phase67SailorJ2Packs(phase67Models),
  PHASE492_IDS.shikiori,
  "SHIKIORI 雪月空葉 11-1224",
);
const largeBase = findPen(
  phase302Sailor1911LargePacks,
  PHASE492_IDS.large,
  "1911 Large 11-2024",
);

const naginataScope: CuratedScope = {
  key: "phase492-naginata-10-7121-scope",
  scopeKey: "phase492-naginata-10-7121-scope",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Sailor official product page; availability varies by market",
  nibScope: "10-7121-228/328/428/628: F/MF/M/B Naginata-Togi 21K Gold Gold IP",
  materialScope: "10-7121 PMMA resin pen body; other Naginata ebonite and KOP bodies excluded",
  editionScope: "Specific 10-7121 fountain pen; Naginata-Togi remains a reusable nib taxonomy",
};
const shikioriScope: CuratedScope = {
  key: "phase492-shikiori-11-1224-scope",
  scopeKey: "phase492-shikiori-11-1224-scope",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Sailor Japan/English official pages; regional stock varies",
  nibScope: "11-1224-101/301, 102/302, 103/303, 105/305: EF/MF",
  materialScope: "PMMA resin and gold IP metal parts for Setsugetsu Soraha 11-1224",
  editionScope: "Haruzora, Manyou, Meigetsu and Shizuriyuki are color variants under one product number",
};
const largeScope: CuratedScope = {
  key: "phase492-1911-large-11-2024-scope",
  scopeKey: "phase492-1911-large-11-2024-scope",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Sailor official regional pages; availability varies by market",
  nibScope: "11-2024-120/220/320/420/620/720/920: EF/F/MF/M/B/Z/MS 21K rhodium-plated",
  materialScope: "PMMA resin with silver/rhodium trim; gold-trim, Realo and demonstrator excluded",
  editionScope: "1911 Large Silver Trim 11-2024 only; 1911 Standard, Realo and 11-2021 are separate SKUs",
};

const naginataClaims: CuratedClaim[] = [
  claim({
    key: "phase492-naginata-identity",
    predicate: "model_identity",
    objectText:
      "10-7121 是 Sailor 将 Naginata-Togi 特殊尖装入 PMMA 笔身的具体整笔型号；F、MF、M、B 是同一产品号的尖号后缀，不能把长刀研类型当成整支钢笔。",
    source: naginataOfficial,
    scope: naginataScope,
    extras: [{ key: "phase492-naginata-identity-type", source: naginataTypes }],
  }),
  claim({
    key: "phase492-naginata-angle",
    predicate: "nib_behavior_boundary",
    objectText:
      "官方说明长刀研在较低书写角度下线条更宽、直立时更细，并适合表现汉字笔势；线宽变化来自研磨面与角度，不应被描述成可用下压获得的传统弹性。",
    source: naginataTypes,
    scope: naginataScope,
    extras: [{ key: "phase492-naginata-angle-interview", source: naginataInterview }],
  }),
  claim({
    key: "phase492-naginata-sku",
    predicate: "sku_boundary",
    objectText:
      "官方货号为 10-7121-228（F）、328（MF）、428（M）和 628（B）；完整后缀决定购买、维修和二手核对时的尖号身份。",
    source: naginataOfficial,
    scope: naginataScope,
  }),
  claim({
    key: "phase492-naginata-spec",
    predicate: "specification",
    objectText:
      "10-7121 使用 21K Gold Naginata-Togi Gold IP 尖、converter & cartridge、PMMA Resin，官方含夹尺寸为 φ18×141 mm，重量 24.0 g。",
    source: naginataOfficial,
    scope: naginataScope,
  }),
  claim({
    key: "phase492-naginata-sample",
    predicate: "independent_sample_boundary",
    objectText:
      "独立长刀研比较和历史论坛讨论可帮助理解角度、线宽与手工研磨的个体差异，但样笔的笔身、年份和调校状态不替代 10-7121 的官方规格。",
    source: naginataIndependent,
    scope: naginataScope,
    extras: [{ key: "phase492-naginata-sample-fpn", source: naginataFpn }],
  }),
  claim({
    key: "phase492-naginata-care",
    predicate: "maintenance_boundary",
    objectText:
      "以室温清水清洗并自然干燥，避免热水、酒精、强溶剂和自行拆尖；断墨、漏墨或尖端受损时应交给 Sailor 售后或熟悉 special nib 的维修者。",
    source: naginataOfficial,
    scope: naginataScope,
    factClass: "editorial",
  }),
  claim({
    key: "phase492-naginata-family",
    predicate: "family_boundary",
    objectText:
      "10-7121 的 PMMA、141 mm 和 24.0 g 只属于该具体产品；KOP、Professional Gear 和其他 Naginata ebonite 型号应保持自己的笔身、尺寸、材料和货号。",
    source: naginataInterview,
    scope: naginataScope,
    extras: [{ key: "phase492-naginata-family-official", source: naginataOfficial }],
  }),
];

const shikioriClaims: CuratedClaim[] = [
  claim({
    key: "phase492-shikiori-identity",
    predicate: "model_identity",
    objectText:
      "SHIKIORI 雪月空葉 11-1224 是四季织中的一个具体产品号；春空、万叶、名月、垂雪与 EF/MF 后缀属于同一型号下的颜色和尖号变体。",
    source: shikioriOfficialJa,
    scope: shikioriScope,
    extras: [{ key: "phase492-shikiori-identity-en", source: shikioriOfficialEn }],
  }),
  claim({
    key: "phase492-shikiori-codes",
    predicate: "sku_boundary",
    objectText:
      "官方后缀为春空 101/301、万叶 102/302、名月 103/303、垂雪 105/305，分别对应 EF/MF；颜色名不能代替完整产品代码。",
    source: shikioriOfficialJa,
    scope: shikioriScope,
  }),
  claim({
    key: "phase492-shikiori-spec",
    predicate: "specification",
    objectText:
      "11-1224 使用 14K 金中型尖、converter & cartridge、PMMA Resin 和金色 IP 金属件，官方规格为 φ17×124 mm（含夹）、16.8 g。",
    source: shikioriOfficialJa,
    scope: shikioriScope,
  }),
  claim({
    key: "phase492-shikiori-theme",
    predicate: "design_context",
    objectText:
      "雪月空葉以春空、夏绿、秋月和冬雪组织颜色意象；主题叙事帮助理解四种命名，但不构成屏幕照片的绝对色样。",
    source: shikioriOfficialJa,
    scope: shikioriScope,
    factClass: "editorial",
    extras: [{ key: "phase492-shikiori-theme-penhouse", source: shikioriPenHouse }],
  }),
  claim({
    key: "phase492-shikiori-plating",
    predicate: "finish_transition",
    objectText:
      "Sailor 公告说明部分 1911、Professional Gear 和 SHIKIORI 产品自 2024 年 9 月后逐步过渡到 IP 处理，流通期可能同时出现新旧表面处理；这不是新的 11-1224 笔身或颜色。",
    source: shikioriPlating,
    scope: shikioriScope,
  }),
  claim({
    key: "phase492-shikiori-market",
    predicate: "market_boundary",
    objectText:
      "官方提醒地区供货、页面规格和网页图片可能与实际市场不同；授权店商品记录可辅助核对颜色和尖号，但价格、库存与色差应留在具体市场记录中。",
    source: shikioriOfficialEn,
    scope: shikioriScope,
    extras: [{ key: "phase492-shikiori-market-rakuten", source: shikioriRakuten }],
  }),
  claim({
    key: "phase492-shikiori-care",
    predicate: "maintenance_boundary",
    objectText:
      "以室温清水清洗并自然干燥，避免热水、酒精、强溶剂和尖锐工具；高饱和、珠光或颜料墨水应缩短清洗间隔。",
    source: shikioriOfficialJa,
    scope: shikioriScope,
    factClass: "editorial",
  }),
];

const largeClaims: CuratedClaim[] = [
  claim({
    key: "phase492-large-identity",
    predicate: "model_identity",
    objectText:
      "11-2024 是 Sailor 1911 Large Silver/Rhodium Trim 的具体产品号；它与金饰 11-2021、14K 1911 Standard、活塞式 Realo 和透明 demonstrator 分开。",
    source: largeOfficial,
    scope: largeScope,
    extras: [{ key: "phase492-large-series-identity", source: largeSeries }],
  }),
  claim({
    key: "phase492-large-nibs",
    predicate: "nib_specification",
    objectText:
      "官方列出 11-2024-120/220/320/420/620/720/920，对应 EF/F/MF/M/B/Z/MS，笔尖为 21K Gold with Rhodium plating；完整后缀决定尖号。",
    source: largeOfficial,
    scope: largeScope,
  }),
  claim({
    key: "phase492-large-fill",
    predicate: "filling_system",
    objectText:
      "11-2024 使用 Sailor converter & cartridge type，不应继承 1911 Realo 的 piston filling system 或其他品牌转换器规格。",
    source: largeOfficial,
    scope: largeScope,
    extras: [{ key: "phase492-large-fill-series", source: largeSeries }],
  }),
  claim({
    key: "phase492-large-material",
    predicate: "material_and_finish",
    objectText:
      "官方材料为 PMMA Resin，产品名为 Silver Trim，尖面为 rhodium plating；金饰、黑光、透明和 Realo 的材料及饰件应按各自 SKU 核对。",
    source: largeOfficial,
    scope: largeScope,
  }),
  claim({
    key: "phase492-large-size",
    predicate: "sku_dimensions",
    objectText:
      "官方规格为 φ18×141 mm（含笔夹）和 21.6 g；独立评测的套帽、无帽测量只代表样笔，用于比例理解，不覆盖官方产品表。",
    source: largeOfficial,
    scope: largeScope,
    extras: [{ key: "phase492-large-size-review", source: largeReview }],
  }),
  claim({
    key: "phase492-large-balance",
    predicate: "writing_context",
    objectText:
      "官方 1911 Series 页面说明套帽或取下帽子会改变重心；套帽与无帽的平衡是使用选择，不是所有手掌和尖号的统一最佳姿势。",
    source: largeSeries,
    scope: largeScope,
    extras: [{ key: "phase492-large-balance-review", source: largeReview }],
    factClass: "editorial",
  }),
  claim({
    key: "phase492-large-plating",
    predicate: "finish_transition",
    objectText:
      "官方镀层公告说明部分 1911 产品从 2024 年 9 月后逐步转向 IP 处理，过渡期可能同时存在新旧表面处理；这不改变 11-2024 的产品号身份。",
    source: largePlating,
    scope: largeScope,
  }),
  claim({
    key: "phase492-large-care",
    predicate: "maintenance_boundary",
    objectText:
      "换墨前后用室温清水冲洗，长期停用排空并干燥，避免热水、酒精、强溶剂和自行弯折 21K 尖；异常情况交授权售后或专业维修。",
    source: largeOfficial,
    scope: largeScope,
    factClass: "editorial",
  }),
];

const naginata = refresh(naginataBase, {
  key: "phase492-sailor-naginata-10-7121-depth-v1",
  markdownFile:
    ".planning/content-research/sailor-naginata-togi-10-7121-phase492.md",
  storyTitle: "Sailor Naginata Togi 10-7121：把长刀研尖与具体笔身分开",
  primary: naginataOfficial,
  extras: [naginataTypes, naginataInterview, naginataIndependent, naginataFpn],
  scope: naginataScope,
  claims: naginataClaims,
  values: {
    series_name: "Sailor Naginata Togi Fountain Pen 10-7121",
    release_year: "当前官网产品页可见；本次资料未确认单一首发年",
    origin_country: "日本；Sailor 官方产品线",
    nib: "21K Gold Naginata-Togi Gold IP；F/MF/M/B 10-7121 后缀",
    fill_system: "Sailor converter & cartridge type",
    material: "PMMA Resin；Gold IP 处理的 Naginata-Togi 尖",
    dimensions: "官方 φ18×141 mm（含夹）",
    weight: "官方 24.0 g",
    status: "官方当前展示；市场供应需向授权渠道确认",
  },
  variants: [
    {
      key: "phase492-naginata-code-group",
      name: "10-7121 F/MF/M/B 尖号组",
      notes: "官方后缀 228/328/428/628；长刀研类型与整笔型号保持正交。",
      sourceKey: naginataOfficial.key,
      variantKind: "nib",
      productCode: "10-7121-228/328/428/628",
      market: "Sailor official",
    },
  ],
  eventTitle: "Phase 492：Naginata Togi 10-7121 的尖型、货号与笔身边界深化",
  eventDescription:
    "补足 10-7121 的 F/MF/M/B 货号、21K Gold IP、PMMA、C/C、尺寸重量、角度书写和与其他长刀研笔身的身份边界。",
});

const shikiori = refresh(shikioriBase, {
  key: "phase492-sailor-shikiori-11-1224-depth-v1",
  markdownFile:
    ".planning/content-research/sailor-shikiori-setsugetsu-soraha-11-1224-phase492.md",
  storyTitle: "Sailor SHIKIORI 雪月空葉 11-1224：四种颜色下的八个货号",
  primary: shikioriOfficialJa,
  extras: [shikioriOfficialEn, shikioriPlating, shikioriPenHouse, shikioriRakuten],
  scope: shikioriScope,
  claims: shikioriClaims,
  values: {
    series_name: "Sailor SHIKIORI SETSUGETSU SORAHA 11-1224",
    release_year: "当前日本与英文官网可见；本次资料未确认单一首发年",
    origin_country: "日本；Sailor 官方产品线",
    nib: "14K Gold；EF/MF 八个颜色与尖号后缀",
    fill_system: "Sailor converter & cartridge type",
    material: "PMMA Resin；金色 IP 金属件",
    dimensions: "官方 φ17×124 mm（含夹）",
    weight: "官方 16.8 g",
    status: "官方当前页面可见；地区供货与包装需向授权渠道确认",
  },
  variants: [
    {
      key: "phase492-shikiori-four-colors",
      name: "春空／万叶／名月／垂雪",
      notes: "四种颜色共用 11-1224 产品号，EF/MF 由 101/301、102/302、103/303、105/305 后缀区分。",
      sourceKey: shikioriOfficialJa.key,
      variantKind: "color",
      productCode: "11-1224-101/301/102/302/103/303/105/305",
      market: "JP",
    },
    {
      key: "phase492-shikiori-ip-transition",
      name: "饰件 IP 过渡批次",
      notes: "官方公告说明过渡期可能新旧表面处理并存；不新增颜色或笔身实体。",
      sourceKey: shikioriPlating.key,
      variantKind: "variant",
      productCode: "11-1224",
      market: "Sailor official",
    },
  ],
  eventTitle: "Phase 492：SHIKIORI 雪月空葉 11-1224 的颜色、尖号与批次边界深化",
  eventDescription:
    "补足 11-1224 的四种颜色、八个 EF/MF 后缀、14K/PMMA/C/C 规格、IP 过渡和与其他 SHIKIORI 型号的身份边界。",
});

const large = refresh(largeBase, {
  key: "phase492-sailor-1911-large-11-2024-depth-v1",
  markdownFile: ".planning/content-research/sailor-1911-large-11-2024-phase492.md",
  storyTitle: "Sailor 1911 Large 银饰 11-2024：21K 七种尖号与 C/C 边界",
  primary: largeOfficial,
  extras: [largeSeries, largeChina, largePlating, largeReview],
  scope: largeScope,
  claims: largeClaims,
  values: {
    series_name: "Sailor 1911 Large Silver Trim 11-2024",
    release_year: "当前官方产品页可见；本次资料未确认单一首发年",
    origin_country: "日本；Sailor 官方产品线",
    nib: "21K Gold with Rhodium plating；EF/F/MF/M/B/Z/MS",
    fill_system: "Sailor converter & cartridge type",
    material: "PMMA Resin；silver/rhodium trim",
    dimensions: "官方 φ18×141 mm（含夹）",
    weight: "官方 21.6 g",
    status: "官方当前展示；市场供应与颜色需向授权渠道确认",
  },
  variants: [
    {
      key: "phase492-large-ip-transition",
      name: "1911 饰件 IP 过渡批次",
      notes: "官方公告用于解释新旧表面处理的流通边界；不改变 11-2024 产品身份。",
      sourceKey: largePlating.key,
      variantKind: "variant",
      productCode: "11-2024",
      market: "Sailor official",
    },
  ],
  eventTitle: "Phase 492：1911 Large Silver Trim 11-2024 的尖号、平衡与版本边界深化",
  eventDescription:
    "补足 11-2024 的七组尖号、21K 铑色尖、PMMA、C/C、φ18×141 mm、21.6 g、套帽重心与相近 1911 SKU 的区分。",
});

export const phase492SailorSpecialAnd1911DepthPacks: CuratedEntityPack[] = [
  naginata,
  shikiori,
  large,
];

if (
  new Set(phase492SailorSpecialAnd1911DepthPacks.map((pack) => pack.entityId)).size !== 3 ||
  phase492SailorSpecialAnd1911DepthPacks.some(
    (pack) => pack.expectedType !== "pen" || pack.spec?.brandEntityId !== SAILOR_BRAND_ID,
  )
) {
  throw new Error("Phase 492 Sailor packs must contain three distinct Sailor pen entities.");
}
