import type {
  CuratedEntityPack,
  CuratedSource,
} from "../lib/curated-content-pack";
import {
  PHASE292_METROPOLITAN_ID,
  PHASE292_METROPOLITAN_SLUG,
  PHASE292_PILOT_BRAND_ID,
  phase292PilotMetropolitanPacks,
} from "./phase292-pilot-metropolitan";

export const PHASE579_TARGET_ID = PHASE292_METROPOLITAN_ID;
export const PHASE579_PILOT_BRAND_ID = PHASE292_PILOT_BRAND_ID;
export const PHASE579_REVIEWER = "phase579-pilot-metropolitan";
export const PHASE579_SOURCE_MARKER_KEY = "phase579-pilot-metropolitan-depth-v1";

const RETRIEVED = "2026-08-10";
const MODEL_SCOPE = "phase292-pilot-metropolitan";

const pilotPromotionalCatalog: CuratedSource = {
  key: "phase579-pilot-mr-promotional-catalog",
  registryKey: "pilot-mr-promotional-catalog-phase579",
  registryName: "Pilot Pen Promotional Products",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "pilot-mr-promotional-catalog-phase579",
  title: "Pilot MR Metropolitan Collection Fountain Pen",
  url: "https://www.pilotpenpromo.com/p/product/2418e1d0-743c-437b-900f-106326c0e088/mr-metropolitan-collection-fountain-pen",
  homepageUrl: "https://www.pilotpenpromo.com",
  itemType: "web_page",
  author: "Pilot Pen Promotional Products",
  retrievedAt: RETRIEVED,
  allowedUse: "summary_only",
  summary:
    "Pilot 官方 promotional catalog 记录 MR Metropolitan 的黄铜笔身、不锈钢饰件与钢尖、黑／银／金经典中环，以及黑色款 F/M 尖幅和日本制造语境；不替代北美零售 SKU 的尺寸测量。",
  archiveUrl:
    "https://www.pilotpenpromo.com/p/product/2418e1d0-743c-437b-900f-106326c0e088/mr-metropolitan-collection-fountain-pen",
  archiveLocator:
    `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=official promotional catalog product details`,
};

function mergeKeyed<T extends { key: string }>(
  label: string,
  ...groups: T[][]
): T[] {
  const result = new Map<string, T>();
  for (const group of groups) {
    for (const item of group) {
      const previous = result.get(item.key);
      if (previous && JSON.stringify(previous) !== JSON.stringify(item)) {
        throw new Error(`Phase 579 conflicting ${label}: ${item.key}`);
      }
      result.set(item.key, item);
    }
  }
  return [...result.values()];
}

function mergeAliases(
  ...groups: CuratedEntityPack["aliases"][]
): CuratedEntityPack["aliases"] {
  const result = new Map<string, CuratedEntityPack["aliases"][number]>();
  for (const group of groups) {
    for (const alias of group) {
      result.set(`${alias.language}:${alias.alias}`, alias);
    }
  }
  return [...result.values()];
}

function mergeVariants(
  ...groups: Array<NonNullable<CuratedEntityPack["variants"]>>
): NonNullable<CuratedEntityPack["variants"]> {
  const result = new Map<
    string,
    NonNullable<CuratedEntityPack["variants"]>[number]
  >();
  for (const group of groups) {
    for (const variant of group) {
      result.set(variant.name.trim().toLocaleLowerCase(), variant);
    }
  }
  return [...result.values()];
}

function extraClaim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
) {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.92,
    sourceKey,
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey: MODEL_SCOPE,
        locator,
      },
    ],
  } satisfies CuratedEntityPack["claims"][number];
}

function extraSpecEvidence(
  key: string,
  fieldKey: "weight" | "price_range" | "status" | "dimensions" | "nib" | "material",
  sourceKey: string,
  locator: string,
) {
  return {
    key,
    fieldKey,
    sourceKey,
    scopeKey: MODEL_SCOPE,
    locator,
    qualifies: true,
  } satisfies NonNullable<CuratedEntityPack["spec"]>["evidence"][number];
}

const base = phase292PilotMetropolitanPacks.find(
  (pack) =>
    pack.entityId === PHASE579_TARGET_ID && pack.expectedType === "pen",
);
if (!base || !base.spec) {
  throw new Error("Phase 579 requires the existing Phase 292 Metropolitan pen pack.");
}
if (
  base.expectedSlug !== PHASE292_METROPOLITAN_SLUG ||
  base.canonicalName !== "Pilot MR Metropolitan"
) {
  throw new Error("Phase 579 Metropolitan identity drifted from Phase 292.");
}

const mergedModel: CuratedEntityPack = {
  ...structuredClone(base),
  key: PHASE579_SOURCE_MARKER_KEY,
  markdownFile: ".planning/content-research/pilot-metropolitan-phase579.md",
  storyTitle: "Pilot MR Metropolitan：从商品命名到日常书写的完整边界",
  primarySourceKey: pilotPromotionalCatalog.key,
  aliases: mergeAliases(base.aliases, [
    {
      alias: "MR Metropolitan Collection",
      language: "en",
      sourceKey: pilotPromotionalCatalog.key,
      kind: "regional_name",
      market: "North America",
    },
    {
      alias: "Pilot MR Collection",
      language: "en",
      sourceKey: pilotPromotionalCatalog.key,
      kind: "regional_name",
      market: "North America",
    },
  ]),
  sources: mergeKeyed("source", base.sources, [pilotPromotionalCatalog]),
  claims: mergeKeyed("claim", base.claims, [
    extraClaim(
      "phase579-metropolitan-collection-name",
      "collection_name",
      "Pilot 官方北美 brochure 使用 MR Metropolitan Collection 这一完整 collection 名称；零售商把标题缩写成 Pilot Metropolitan 时，仍应保留 MR 作为市场身份线索。",
      pilotPromotionalCatalog.key,
      "official promotional catalog product title and collection description",
    ),
    extraClaim(
      "phase579-metropolitan-manufacture-window",
      "manufacture_context",
      "Pilot 官方 promotional catalog 的商品资料将 MR Metropolitan 标为日本制造语境；具体批次和包装仍以实物的刻字、盒标和订单 SKU 为准。",
      pilotPromotionalCatalog.key,
      "official promotional catalog country of manufacture field",
    ),
    extraClaim(
      "phase579-metropolitan-classic-points",
      "variant_nib_boundary",
      "官方商品目录列出黑色 Classic 款可选 Fine 与 Medium，银色圆点和金色锯齿以 Medium 为主；其他渠道的 Stub／Calligraphy 不应反推到每个经典色。",
      pilotPromotionalCatalog.key,
      "official promotional catalog nib availability by barrel color",
    ),
    extraClaim(
      "phase579-metropolitan-gift-box",
      "packaging",
      "官方商品资料把 MR Metropolitan 描述为附黑色礼盒、墨囊与转换器的可补充使用钢笔；包装是销售配置，不是决定型号身份的机械结构。",
      pilotPromotionalCatalog.key,
      "official promotional catalog packaging and refillable description",
    ),
    extraClaim(
      "phase579-metropolitan-measurement-window",
      "measurement_scope",
      "138 mm、153 mm 和 26 g 等数值只属于 Goulet PN91111 的当前零售测量窗口；日本 Cocoon 的 138 mm／24 g 目录数值不能覆盖到 MR，也不能当作同一 SKU 的重复规格。",
      "phase292-metropolitan-goulet-black",
      "PN91111 measurement fields compared with separate Cocoon catalog record",
    ),
    extraClaim(
      "phase579-metropolitan-converter-window",
      "accessory_window",
      "同一 MR Metropolitan 商品线会因 Pilot 的包装滚动变化而附 CON-B 或 CON-40；下单前应以实际盒装和当前商品说明为准，不能要求零售商保证固定转换器。",
      "phase292-metropolitan-goulet-black",
      "converter package variation note for current black plain SKU",
    ),
    extraClaim(
      "phase579-metropolitan-care-boundary",
      "care_boundary",
      "室温清水吸排和充分晾干是日常清洗的保守做法；热水、酒精、强溶剂、研磨和自行撬动钢尖不属于本页建议的维护手段。",
      "phase292-metropolitan-goulet-black",
      "retailer cleaning guidance plus material-safe editorial boundary",
      "editorial",
    ),
    extraClaim(
      "phase579-metropolitan-buying-checklist",
      "buying_checklist",
      "选购时应同时确认地区名称、PN 商品号、尖幅、Classic／Animal 饰面、约 26 g 金属重量和包装内转换器；只凭“Metropolitan”标题或商品主图不足以确认版本。",
      pilotPromotionalCatalog.key,
      "official collection naming and current product configuration fields",
      "editorial",
    ),
  ]),
  variants: mergeVariants(base.variants ?? [], [
    {
      key: "phase579-metropolitan-pn91111-black-plain",
      name: "PN91111 Black Plain",
      notes:
        "Goulet 当前黑色亮面 SKU；约 138 mm 合盖、153 mm 套帽、26 g 总重等测量均以该商品页为窗口。",
      sourceKey: "phase292-metropolitan-goulet-black",
      variantKind: "market_sku",
      productCode: "PN91111",
      market: "North America",
    },
    {
      key: "phase579-metropolitan-classic-black-gloss",
      name: "Classic Black Gloss",
      notes:
        "官方经典黑色亮面中环；黑色官方商品目录列 Fine 与 Medium，具体商品号和批次仍需核对。",
      sourceKey: pilotPromotionalCatalog.key,
      variantKind: "color",
      market: "North America",
    },
    {
      key: "phase579-metropolitan-classic-silver-dots",
      name: "Classic Silver Dots",
      notes: "官方经典银色圆点中环；作为外观 variant 记录，不另建机械型号。",
      sourceKey: pilotPromotionalCatalog.key,
      variantKind: "color",
      market: "North America",
    },
    {
      key: "phase579-metropolitan-classic-gold-zigzag",
      name: "Classic Gold Zig Zag",
      notes: "官方经典金色锯齿中环；零售库存与尖幅按商品号确认。",
      sourceKey: pilotPromotionalCatalog.key,
      variantKind: "color",
      market: "North America",
    },
    {
      key: "phase579-metropolitan-animal-pattern-skus",
      name: "Animal individual pattern SKUs",
      notes:
        "Animal 的鳄鱼、蜥蜴、豹、蟒、虎纹饰带；图案、尖幅、地区库存按具体 SKU 记录。",
      sourceKey: "phase292-metropolitan-goulet-animal",
      variantKind: "edition_group",
      market: "North America",
    },
    {
      key: "phase579-metropolitan-regional-mr-listings",
      name: "MR regional title and color listings",
      notes:
        "不同地区可能把 MR、Metropolitan、Retro Pop 或其他彩色标题并列使用；在确认接口和商品号前只作市场标题 variant。",
      sourceKey: "phase292-pilot-mr-brochure",
      variantKind: "market_sku",
    },
  ]),
  spec: {
    brandEntityId: PHASE579_PILOT_BRAND_ID,
    values: {
      ...base.spec.values,
      weight: "PN91111 零售参考约 26 g（笔身约 17 g、笔帽约 9 g）；其他花色和配件口径另行核对",
      price_range:
        "北美零售价格随库存、促销、税费和 SKU 变化；2013 年评测价格只作历史窗口，不作当前报价",
      status:
        "Pilot 北美 MR Metropolitan collection；Classic、Animal、Calligraphy 与地区库存按商品号记录",
    },
    evidence: mergeKeyed("spec evidence", base.spec.evidence, [
      extraSpecEvidence(
        "phase579-metropolitan-weight",
        "weight",
        "phase292-metropolitan-goulet-black",
        "PN91111 body, cap and overall weight fields",
      ),
      extraSpecEvidence(
        "phase579-metropolitan-price-window",
        "price_range",
        "phase292-metropolitan-goulet-black",
        "current retailer price and promotion window; not a fixed MSRP claim",
      ),
      extraSpecEvidence(
        "phase579-metropolitan-status",
        "status",
        pilotPromotionalCatalog.key,
        "official MR Metropolitan collection product description",
      ),
      extraSpecEvidence(
        "phase579-metropolitan-material",
        "material",
        pilotPromotionalCatalog.key,
        "official brass barrel, stainless accents and nib description",
      ),
      extraSpecEvidence(
        "phase579-metropolitan-nib",
        "nib",
        pilotPromotionalCatalog.key,
        "official Fine/Medium availability by classic barrel color",
      ),
    ]),
  },
  timeline: mergeKeyed("timeline event", base.timeline ?? [], [
    {
      key: "phase579-metropolitan-2013-public-review-window",
      title: "2013 年北美公开评测窗口",
      eventType: "community_event",
      startDate: "2013-04-29",
      circa: false,
      description:
        "The Well-Appointed Desk 的评测在 2013 年记录了黑、银、金饰面和北美入门市场比较；该日期证明公开销售语境，不作为 Pilot 精确首发日期。",
      sourceKey: "phase292-metropolitan-desk-review",
    },
    {
      key: "phase579-metropolitan-official-collection-record",
      title: "Pilot 官方 collection 资料核对",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "官方 promotional catalog 复核 MR Metropolitan 的黄铜笔身、钢尖、经典中环与黑色款 Fine/Medium 配置；这是资料窗口事件，不是新品发布日。",
      sourceKey: pilotPromotionalCatalog.key,
    },
  ]),
  conflicts: mergeKeyed("conflict", base.conflicts ?? [], [
    {
      key: "phase579-metropolitan-dimensions-market-conflict",
      fieldKey: "dimensions",
      scopeKey: MODEL_SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Goulet PN91111 约 138 mm／26 g 与 Pilot Japan Cocoon 约 138 mm／24 g 属于不同市场商品记录；保留两组来源范围，不把 Cocoon 数值写入 MR 的通用规格。",
      members: [
        {
          citationKey: "phase292-metropolitan-dimensions",
          assertedValue: "PN91111：约 138 mm 合盖、约 26 g",
        },
        {
          citationKey: "phase292-metropolitan-release",
          assertedValue: "2010 年代公开销售窗口，非日本 Cocoon 工厂规格",
        },
      ],
    },
    {
      key: "phase579-metropolitan-nib-color-conflict",
      fieldKey: "nib",
      scopeKey: MODEL_SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Goulet 黑色 PN91111 列 F/M/1.0 mm Stub，官方 promotional catalog 对经典黑、银、金按颜色限制 Fine/Medium；正文按 SKU 和市场拆开，不声称所有花色都有 Stub。",
      members: [
        {
          citationKey: "phase292-metropolitan-nib",
          assertedValue: "PN91111 当前渠道列 F、M、1.0 mm Stub",
        },
        {
          citationKey: "phase579-metropolitan-nib",
          assertedValue: "官方经典色商品资料按颜色列 Fine/Medium",
        },
      ],
    },
  ]),
  media: structuredClone(base.media),
};

export const phase579PilotMetropolitanPacks: CuratedEntityPack[] = [
  mergedModel,
];
