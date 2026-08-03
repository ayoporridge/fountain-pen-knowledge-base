import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE58_AMBITION_ID,
  PHASE58_EMOTION_ID,
  PHASE58_FABER_BRAND_ID,
  PHASE58_LOOM_ID,
  PHASE58_NEO_SLIM_ID,
  PHASE58_ONDORO_ID,
  phase58FaberCastellPacks,
} from "./phase58-faber-castell";

export const PHASE424_FABER_BRAND_ID = PHASE58_FABER_BRAND_ID;
export const PHASE424_TARGETS = {
  ambition: {
    id: PHASE58_AMBITION_ID,
    slug: "faber-castell-ambition",
    name: "Faber-Castell Ambition",
  },
  emotion: {
    id: PHASE58_EMOTION_ID,
    slug: "faber-castell-e-motion",
    name: "Faber-Castell e-motion",
  },
  ondoro: {
    id: PHASE58_ONDORO_ID,
    slug: "faber-castell-ondoro",
    name: "Faber-Castell Ondoro",
  },
  neoSlim: {
    id: PHASE58_NEO_SLIM_ID,
    slug: "faber-castell-neo-slim",
    name: "Faber-Castell NEO Slim",
  },
  loom: {
    id: PHASE58_LOOM_ID,
    slug: "faber-castell-loom",
    name: "Faber-Castell LOOM",
  },
} as const;

const RETRIEVED = "2026-08-03";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  independenceGroup: string;
  tier?: CuratedSource["tier"];
  sourceType?: CuratedSource["sourceType"];
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.independenceGroup,
    homepageUrl: input.url,
    itemType: "web_page",
    author: input.registryName,
    publishedAt: null,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const EXTRA_SOURCES: Record<string, CuratedSource[]> = {
  brand: [
    source({
      key: "phase424-faber-products-catalogue",
      registryKey: "faber-castell-products-phase424",
      registryName: "Faber-Castell official product catalogue",
      title: "Faber-Castell products catalogue",
      url: "https://www.faber-castell.com/products",
      independenceGroup: "faber-castell-products-phase424",
      summary:
        "官方产品目录把普通 Fine Writing 的 Ambition、e-motion、Ondoro、NEO Slim 和 LOOM 分开导航，支持品牌页的系列关系校正。",
    }),
    source({
      key: "phase424-faber-neo-press-boundary",
      registryKey: "faber-castell-neo-press-phase424",
      registryName: "Faber-Castell official press service",
      title: "NEO Slim official press note",
      url: "https://www.faber-castell.com/service/press/pm-NEO-slim",
      independenceGroup: "faber-castell-neo-press-phase424",
      summary:
        "官方新闻资料把 NEO Slim 写成普通 Faber-Castell 的金属细身路线，帮助与 Graf von Faber-Castell 高端 Classic 分开。",
    }),
    source({
      key: "phase424-faber-ambition-148390",
      registryKey: "faber-castell-ambition-148390-phase424",
      registryName: "Faber-Castell Ambition official product",
      title: "Ambition Stainless Steel 148390",
      url: "https://www.faber-castell.com/products/AmbitionStainlessSteelfountainpenMsilver/148390",
      independenceGroup: "faber-castell-ambition-148390-phase424",
      summary:
        "官方 SKU 页把 Ambition 的拉丝不锈钢笔杆、镀铬帽与握位、弹簧笔夹、不锈钢 M 尖和 cartridge/converter 绑定到具体货号。",
    }),
  ],
  ambition: [
    source({
      key: "phase424-faber-ambition-148390",
      registryKey: "faber-castell-ambition-148390-phase424",
      registryName: "Faber-Castell Ambition official product",
      title: "Ambition Stainless Steel 148390",
      url: "https://www.faber-castell.com/products/AmbitionStainlessSteelfountainpenMsilver/148390",
      independenceGroup: "faber-castell-ambition-148390-phase424",
      summary:
        "官方 SKU 页把 Ambition 的拉丝不锈钢笔杆、镀铬帽与握位、弹簧笔夹、不锈钢 M 尖和 cartridge/converter 绑定到具体货号。",
    }),
    source({
      key: "phase424-faber-ambition-catalogue",
      registryKey: "faber-castell-products-phase424",
      registryName: "Faber-Castell official product catalogue",
      title: "Faber-Castell Fine Writing products catalogue",
      url: "https://www.faber-castell.com/products",
      independenceGroup: "faber-castell-products-phase424",
      summary:
        "官方目录把 Ambition 与 e-motion、Ondoro、NEO Slim、LOOM 分开，支持细长直筒系列的身份边界。",
    }),
    source({
      key: "phase424-faber-ambition-sibling-press",
      registryKey: "faber-castell-neo-press-phase424",
      registryName: "Faber-Castell official press service",
      title: "NEO Slim official press note for sibling-line comparison",
      url: "https://www.faber-castell.com/service/press/pm-NEO-slim",
      independenceGroup: "faber-castell-neo-press-phase424",
      summary:
        "官方 NEO Slim 资料提供普通 Fine Writing 细身金属路线的对照，不把 NEO Slim 的颜色、尖或附件复制到 Ambition。",
    }),
  ],
  emotion: [
    source({
      key: "phase424-faber-emotion-wood-148221",
      registryKey: "faber-castell-emotion-wood-148221-phase424",
      registryName: "Faber-Castell e-motion official product",
      title: "e-motion wood 148221",
      url: "https://www.faber-castell.com/products/emotionwoodfountainpenFblack/148221",
      independenceGroup: "faber-castell-emotion-wood-148221-phase424",
      summary:
        "官方木杆 SKU 说明染色梨木笔杆、镀铬帽/握位/夹、不锈钢 F 尖和 cartridge/converter，作为木材版本锚点。",
    }),
    source({
      key: "phase424-faber-emotion-catalogue",
      registryKey: "faber-castell-products-phase424",
      registryName: "Faber-Castell official product catalogue",
      title: "Faber-Castell Fine Writing products catalogue",
      url: "https://www.faber-castell.com/products",
      independenceGroup: "faber-castell-products-phase424",
      summary:
        "官方目录把 e-motion 与 Ambition、Ondoro、NEO Slim 和 LOOM 分开，支持不同笔杆比例的型号关系。",
    }),
    source({
      key: "phase424-faber-emotion-sibling-press",
      registryKey: "faber-castell-neo-press-phase424",
      registryName: "Faber-Castell official press service",
      title: "NEO Slim official press note for sibling-line comparison",
      url: "https://www.faber-castell.com/service/press/pm-NEO-slim",
      independenceGroup: "faber-castell-neo-press-phase424",
      summary:
        "官方 NEO Slim 细身金属资料仅作同品牌对照，不能把轻量细杆推断成 e-motion 的统一尺寸或重量。",
    }),
  ],
  ondoro: [
    source({
      key: "phase424-faber-ondoro-147840",
      registryKey: "faber-castell-ondoro-147840-phase424",
      registryName: "Faber-Castell Ondoro official product",
      title: "Ondoro grey-brown 147840",
      url: "https://www.faber-castell.com/products/OndorofountainpenMgreybrown/147840",
      independenceGroup: "faber-castell-ondoro-147840-phase424",
      summary:
        "官方 SKU 页以 M 尖展示 grey-brown 版本，并列出 EF/F/B 可选与 cartridge/converter、礼盒等包装语境。",
    }),
    source({
      key: "phase424-faber-ondoro-catalogue",
      registryKey: "faber-castell-products-phase424",
      registryName: "Faber-Castell official product catalogue",
      title: "Faber-Castell Fine Writing products catalogue",
      url: "https://www.faber-castell.com/products",
      independenceGroup: "faber-castell-products-phase424",
      summary:
        "官方目录把 Ondoro 与其他普通 Fine Writing 系列分开，并以系列导航保留当前和地区产品边界。",
    }),
    source({
      key: "phase424-faber-ondoro-sibling-press",
      registryKey: "faber-castell-neo-press-phase424",
      registryName: "Faber-Castell official press service",
      title: "NEO Slim official press note for sibling-line comparison",
      url: "https://www.faber-castell.com/service/press/pm-NEO-slim",
      independenceGroup: "faber-castell-neo-press-phase424",
      summary:
        "官方细身金属路线作为同品牌对照，帮助页面保留 Ondoro 六角截面和树脂/木材分支而不混名。",
    }),
  ],
  neoSlim: [
    source({
      key: "phase424-faber-neo-342300",
      registryKey: "faber-castell-neo-342300-phase424",
      registryName: "Faber-Castell NEO Slim official product",
      title: "NEO Slim black 342300",
      url: "https://www.faber-castell.com/products/NeoSlimmetalfountainpenMblack/342300",
      independenceGroup: "faber-castell-neo-342300-phase424",
      summary:
        "官方黑色 SKU 页确认细身黑色漆金属笔杆、弹簧夹、可拔帽、不锈钢 M 尖、墨囊和 converter 配置。",
    }),
    source({
      key: "phase424-faber-neo-press",
      registryKey: "faber-castell-neo-press-phase424",
      registryName: "Faber-Castell official press service",
      title: "NEO Slim official press note",
      url: "https://www.faber-castell.com/service/press/pm-NEO-slim",
      independenceGroup: "faber-castell-neo-press-phase424",
      summary:
        "官方新闻资料把 NEO Slim 定位为细身金属路线，并列出 stainless、matt、polished、painted metal 与 rose details 的差异。",
    }),
    source({
      key: "phase424-faber-neo-catalogue",
      registryKey: "faber-castell-products-phase424",
      registryName: "Faber-Castell official product catalogue",
      title: "Faber-Castell Fine Writing products catalogue",
      url: "https://www.faber-castell.com/products",
      independenceGroup: "faber-castell-products-phase424",
      summary:
        "官方目录把 NEO Slim 与普通 Faber-Castell 的其他系列并列，不把它归入 Graf von Faber-Castell。",
    }),
    source({
      key: "phase424-faber-neo-ambition-sibling",
      registryKey: "faber-castell-ambition-148390-phase424",
      registryName: "Faber-Castell Ambition official product",
      title: "Ambition Stainless Steel 148390 for sibling-line comparison",
      url: "https://www.faber-castell.com/products/AmbitionStainlessSteelfountainpenMsilver/148390",
      independenceGroup: "faber-castell-ambition-148390-phase424",
      summary:
        "Ambition 的官方不锈钢 SKU 只用于对照传统直筒比例，不把其尖号、长度或附件复制到 NEO Slim。",
    }),
  ],
  loom: [
    source({
      key: "phase424-faber-loom-collection",
      registryKey: "faber-castell-loom-collection-phase424",
      registryName: "Faber-Castell LOOM official collection",
      title: "LOOM official collection",
      url: "https://www.faber-castell.com/products/loom",
      independenceGroup: "faber-castell-loom-collection-phase424",
      summary:
        "官方 LOOM 集合页同时列 fountain、ballpoint 和 rollerball；本条目只保留钢笔书写模式。",
    }),
    source({
      key: "phase424-faber-loom-manual",
      registryKey: "faber-castell-writing-manual-phase424",
      registryName: "Faber-Castell official instruction manual",
      title: "Faber-Castell writing instrument instruction manual",
      url: "https://www.faber-castell.com/-/media/Faber-Castell-new/PDF/en/Instruction_manual.ashx?sc_lang=en-Glob",
      independenceGroup: "faber-castell-writing-manual-phase424",
      sourceType: "official",
      tier: "contemporary_archive",
      summary:
        "官方说明书提供墨囊、converter、笔尖清洁与收纳的通用边界；具体 LOOM 包装仍按货号核对。",
    }),
    source({
      key: "phase424-faber-loom-catalogue",
      registryKey: "faber-castell-products-phase424",
      registryName: "Faber-Castell official product catalogue",
      title: "Faber-Castell Fine Writing products catalogue",
      url: "https://www.faber-castell.com/products",
      independenceGroup: "faber-castell-products-phase424",
      summary:
        "官方目录把 LOOM 与其他 Fine Writing 系列分开，并保留钢笔、圆珠和滚珠的产品线差异。",
    }),
    source({
      key: "phase424-faber-loom-sibling-press",
      registryKey: "faber-castell-neo-press-phase424",
      registryName: "Faber-Castell official press service",
      title: "NEO Slim official press note for sibling-line comparison",
      url: "https://www.faber-castell.com/service/press/pm-NEO-slim",
      independenceGroup: "faber-castell-neo-press-phase424",
      summary:
        "官方 NEO Slim 细身金属资料仅作为同品牌比较，帮助 LOOM 页面保留金属宽握位与不同表面路线。",
    }),
  ],
};

const MARKDOWN_FILES: Record<string, string> = {
  [PHASE424_TARGETS.ambition.id]:
    ".planning/content-research/faber-castell-ambition-phase424.md",
  [PHASE424_TARGETS.emotion.id]:
    ".planning/content-research/faber-castell-e-motion-phase424.md",
  [PHASE424_TARGETS.ondoro.id]:
    ".planning/content-research/faber-castell-ondoro-phase424.md",
  [PHASE424_TARGETS.neoSlim.id]:
    ".planning/content-research/faber-castell-neo-slim-phase424.md",
  [PHASE424_TARGETS.loom.id]:
    ".planning/content-research/faber-castell-loom-phase424.md",
};

const BASE_BRAND = phase58FaberCastellPacks.find(
  (pack) => pack.entityId === PHASE424_FABER_BRAND_ID,
);
if (!BASE_BRAND) throw new Error("Phase 424 Faber-Castell brand pack is missing.");

const BASE_MODELS = Object.values(PHASE424_TARGETS).map((target) => {
  const pack = phase58FaberCastellPacks.find((candidate) => candidate.entityId === target.id);
  if (!pack) throw new Error(`Phase 424 Faber-Castell model pack is missing: ${target.id}`);
  return pack;
});

const EXTRA_VARIANTS: Record<string, CuratedEntityPack["variants"]> = {
  [PHASE424_TARGETS.ambition.id]: [
    {
      key: "ambition-stainless-148390",
      name: "Ambition Stainless Steel 148390",
      notes:
        "具体 M 尖不锈钢 SKU；拉丝杆、镀铬帽/握位和 converter 以官方页面与包装为准。",
      sourceKey: "phase424-faber-ambition-148390",
      variantKind: "market_sku",
      market: "EU",
    },
  ],
  [PHASE424_TARGETS.emotion.id]: [
    {
      key: "emotion-wood-148221",
      name: "e-motion wood 148221",
      notes: "染色梨木 F 尖版本；天然木材的色差和重量不套用到金属版本。",
      sourceKey: "phase424-faber-emotion-wood-148221",
      variantKind: "market_sku",
    },
  ],
  [PHASE424_TARGETS.ondoro.id]: [
    {
      key: "ondoro-grey-brown-147840",
      name: "Ondoro grey-brown 147840",
      notes: "官方 M 尖 SKU；EF/F/B 的可选信息和包装属于该货号范围。",
      sourceKey: "phase424-faber-ondoro-147840",
      variantKind: "market_sku",
    },
  ],
  [PHASE424_TARGETS.neoSlim.id]: [
    {
      key: "neo-slim-black-342300",
      name: "NEO Slim black 342300",
      notes: "黑色漆金属 M 尖 SKU；墨囊与 converter 附件按地区包装核对。",
      sourceKey: "phase424-faber-neo-342300",
      variantKind: "market_sku",
    },
    {
      key: "neo-slim-press-metal",
      name: "NEO Slim metal finishes",
      notes: "官方 press 资料列 stainless、matt、polished、painted metal 与 rose details，属于 finish 轴。",
      sourceKey: "phase424-faber-neo-press",
      variantKind: "material",
    },
  ],
  [PHASE424_TARGETS.loom.id]: [
    {
      key: "loom-collection-fountain",
      name: "LOOM fountain pen collection",
      notes: "Metallic light blue/grey/olive 与 Gunmetal matt/shiny 属钢笔 finish；圆珠和滚珠另属书写模式。",
      sourceKey: "phase424-faber-loom-collection",
      variantKind: "color",
    },
  ],
};

function refreshedPack(base: CuratedEntityPack): CuratedEntityPack {
  const markdownFile = MARKDOWN_FILES[base.entityId];
  if (!markdownFile) throw new Error(`Phase 424 target missing for ${base.entityId}`);
  const extras = EXTRA_SOURCES[Object.entries(PHASE424_TARGETS).find(([, target]) => target.id === base.entityId)?.[0] ?? ""] ?? [];
  const pack = structuredClone(base);
  const scopeKey = `phase424-faber-castell-${base.entityId}`;
  pack.key = `phase424-faber-castell-${base.entityId}-refresh-v1`;
  pack.markdownFile = markdownFile;
  pack.storyTitle = `${base.storyTitle}：官方 SKU、材料与使用边界深化`;
  pack.sources = [...pack.sources, ...extras].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  pack.scopes = [
    ...pack.scopes,
    {
      key: scopeKey,
      scopeKey,
      market: "Faber-Castell Fine Writing current SKU evidence refresh",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: `${base.canonicalName} only; Graf von Faber-Castell and sibling writing modes remain separate entities`,
    },
  ];
  pack.claims = [
    ...pack.claims,
    {
      key: `${scopeKey}-sku-boundary`,
      predicate: "sku_identity_boundary",
      objectText:
        "颜色、材料、尖号和盒内附件属于具体官方 SKU 的证据轴；系列名称不能替代商品号，也不能把单支实测重量扩展成全系列规格。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: extras[0]?.key ?? pack.primarySourceKey,
      locator: "official product SKU and mutable catalogue fields",
      evidence: [
        {
          key: `${scopeKey}-sku-evidence`,
          sourceKey: extras[0]?.key ?? pack.primarySourceKey,
          scopeKey,
          locator: "official SKU title, finish, nib and filling fields",
        },
      ],
    },
    {
      key: `${scopeKey}-sibling-boundary`,
      predicate: "sibling_line_boundary",
      objectText:
        "普通 Faber-Castell 的 Fine Writing 系列与 Graf von Faber-Castell Classic 分开；同品牌 Ambition、e-motion、Ondoro、NEO Slim、LOOM 的比例、材料、尖号和图片也不能互相复制。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: extras.find((item) => item.key.includes("catalogue"))?.key ?? pack.primarySourceKey,
      locator: "official product navigation and sibling-line comparison",
      evidence: [
        {
          key: `${scopeKey}-sibling-evidence`,
          sourceKey: extras.find((item) => item.key.includes("catalogue"))?.key ?? pack.primarySourceKey,
          scopeKey,
          locator: "separate Fine Writing and sibling product entries",
        },
      ],
    },
    {
      key: `${scopeKey}-care-boundary`,
      predicate: "care_and_selection_guidance",
      objectText:
        "墨囊或 converter 换色前用室温清水冲洗，按官方 FAQ 的频率清洁并彻底干燥；金属涂层、木材和树脂的擦拭方式要避免热水、酒精、强清洁剂与研磨。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: pack.sources.find((item) => item.key === "phase58-faber-care-faq")?.key ?? pack.primarySourceKey,
      locator: "Faber-Castell fountain pen care FAQ",
      evidence: [
        {
          key: `${scopeKey}-care-evidence`,
          sourceKey: pack.sources.find((item) => item.key === "phase58-faber-care-faq")?.key ?? pack.primarySourceKey,
          scopeKey,
          locator: "cleaning, converter and storage guidance",
        },
      ],
    },
    {
      key: `${scopeKey}-purchase-check`,
      predicate: "purchase_verification",
      objectText:
        "选购和二手验收时核对完整货号、尖号、finish、帽夹、握位螺纹、墨囊/converter、盒标和当地库存；示意图不替代实物照片。",
      factClass: "editorial",
      confidence: 0.95,
      sourceKey: extras[0]?.key ?? pack.primarySourceKey,
      locator: "exact SKU and package verification",
      evidence: [
        {
          key: `${scopeKey}-purchase-evidence`,
          sourceKey: extras[0]?.key ?? pack.primarySourceKey,
          scopeKey,
          locator: "current product options and mutable regional stock",
        },
      ],
    },
  ];
  pack.variants = [
    ...(pack.variants ?? []),
    ...(EXTRA_VARIANTS[base.entityId] ?? []),
  ].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  if (!pack.spec) throw new Error(`Phase 424 spec missing for ${base.entityId}`);
  const baseSpec = pack.spec;
  pack.spec = {
    ...baseSpec,
    values: {
      ...baseSpec.values,
      status: `${base.canonicalName}：official SKU, sibling-line and care boundary reviewed ${RETRIEVED}; price, stock and finish availability remain mutable`,
    },
    evidence: [
      ...baseSpec.evidence,
      {
        key: `${scopeKey}-spec-status`,
        fieldKey: "status",
        sourceKey: extras[0]?.key ?? pack.primarySourceKey,
        scopeKey,
        locator: "official current product or press evidence",
        qualifies: true,
      },
    ],
  };
  return pack;
}

function refreshedBrand(base: CuratedEntityPack): CuratedEntityPack {
  const pack = structuredClone(base);
  pack.key = "phase424-faber-castell-brand-refresh-v1";
  pack.storyTitle = "Faber-Castell Fine Writing：普通线与 Graf von Faber-Castell 的关系深化";
  pack.sources = [...pack.sources, ...(EXTRA_SOURCES.brand ?? [])].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  return pack;
}

export const phase424FaberCastellRefreshPacks: CuratedEntityPack[] = [
  refreshedBrand(BASE_BRAND),
  ...BASE_MODELS.map(refreshedPack),
];
