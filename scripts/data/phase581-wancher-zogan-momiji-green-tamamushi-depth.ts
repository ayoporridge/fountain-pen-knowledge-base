import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE543_WANCHER_BRAND_ID,
  phase543WancherZoganMomijiSiblingPacks,
} from "./phase543-wancher-zogan-momiji-siblings";

export const PHASE581_TARGET_ID = "phase543-wancher-zogan-momiji-green-tamamushi";
export const PHASE581_WANCHER_BRAND_ID = PHASE543_WANCHER_BRAND_ID;
export const PHASE581_DUPLICATE_ID = "phase519-wancher-zogan-momiji-green-tamamushi";
export const PHASE581_DUPLICATE_SLUG =
  "wancher-dream-pen-zogan-momiji-green-tamamushi";
export const PHASE581_CANONICAL_SLUG = "wancher-zogan-momiji-green-tamamushi";
export const PHASE581_REVIEWER = "phase581-wancher-zogan-momiji-green-tamamushi";
export const PHASE581_SOURCE_MARKER_KEY =
  "phase581-wancher-zogan-momiji-green-tamamushi-depth-v1";

const RETRIEVED = "2026-08-10";
const MODEL_SCOPE =
  "Wancher Zogan Momiji Green Tamamushi-nuri exact product record, Momiji Zogan material and identity boundary";
const CRAFT_SCOPE = "phase543-green-tamamushi-craft-context";
const OFFICIAL_PHOTO_URL =
  "https://cdn.shopify.com/s/files/1/0003/8371/3324/files/zogan-Momoji-tamamushi-green.png?v=1783407788";

const currentJson: CuratedSource = {
  key: "phase581-wancher-green-tamamushi-official-json-current",
  registryKey: "wancher-official-green-tamamushi-json-phase581",
  registryName: "Wancher Pen official product record",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-green-tamamushi-phase581-current",
  title: "Zogan Momiji - Green Tamamushi-nuri | Wancher current product JSON",
  url: "https://www.wancherpen.com/products/zogan-momiji-green-tamamushi.json",
  homepageUrl: "https://www.wancherpen.com",
  itemType: "web_page",
  author: "Wancher Pen official product record",
  retrievedAt: RETRIEVED,
  allowedUse: "summary_only",
  summary:
    "2026-08-10 官方 Shopify JSON：product id 9322088038615、handle、updated_at、Trim 选项、Black/Silver SKU、当前 US$600 价格、ABS/Titanium/Zogan 字段、尖/feed/供墨与八张图片记录。",
  archiveUrl:
    "https://www.wancherpen.com/products/zogan-momiji-green-tamamushi.json",
  archiveLocator:
    `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=product id, handle, timestamps, options, variants, specifications and image rows`,
};

const currentPage: CuratedSource = {
  key: "phase581-wancher-green-tamamushi-official-page-current",
  registryKey: "wancher-official-green-tamamushi-page-phase581",
  registryName: "Wancher Pen official product page",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-green-tamamushi-phase581-current",
  title: "Zogan Momiji - Green Tamamushi-nuri | Wancher Official",
  url: "https://www.wancherpen.com/products/zogan-momiji-green-tamamushi",
  homepageUrl: "https://www.wancherpen.com",
  itemType: "web_page",
  author: "Wancher Pen official product page",
  retrievedAt: RETRIEVED,
  allowedUse: "summary_only",
  summary:
    "当前官方页面：Momiji 秋叶与 Zogan 嵌入叙事、随角度变化的光泽、ABS/Titanium/Zogan 规格、nib/feed、欧规供墨、气密帽、Size & Shape 图片与包装。",
  archiveUrl:
    "https://www.wancherpen.com/products/zogan-momiji-green-tamamushi",
  archiveLocator:
    `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=exact product story, specifications, size-and-shape image and packaging`,
};

const zoganCollection: CuratedSource = {
  key: "phase581-wancher-zogan-collection-current",
  registryKey: "wancher-official-zogan-collection-phase581",
  registryName: "Wancher Pen official Zogan collection",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-zogan-collection-phase581",
  title: "Dream Pen Zogan | Wancher Official collection",
  url: "https://www.wancherpen.com/collections/zogan-fountain-pen",
  homepageUrl: "https://www.wancherpen.com",
  itemType: "web_page",
  author: "Wancher Pen official Zogan collection",
  retrievedAt: RETRIEVED,
  allowedUse: "summary_only",
  summary:
    "官方 Zogan 集合页把 Green Tamamushi-nuri 与 Momiji、Sakura River、Yuki Zuki 等具体商品并列展示；集合导航不把这些 SKU 合并成一个颜色或工艺实体。",
  archiveUrl: "https://www.wancherpen.com/collections/zogan-fountain-pen",
  archiveLocator:
    `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=collection product cards and Zogan craft overview`,
};

const currentCare: CuratedSource = {
  key: "phase581-wancher-green-tamamushi-care-current",
  registryKey: "wancher-official-product-care-phase581-green-tamamushi",
  registryName: "Wancher Pen official product care",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-product-care-phase581-green-tamamushi",
  title: "Wancher Product Care Guide | Zogan, Urushi and Ebonite",
  url: "https://www.wancherpen.com/pages/product-care",
  homepageUrl: "https://www.wancherpen.com",
  itemType: "web_page",
  author: "Wancher Pen official product care",
  retrievedAt: RETRIEVED,
  allowedUse: "summary_only",
  summary:
    "当前官方护理页：Zogan 不在流水下清洗、母贝和漆面避开冲击与直晒、Ebonite 避免长时间浸水与化学清洁剂；本包按保守边界写入维护建议。",
  archiveUrl: "https://www.wancherpen.com/pages/product-care",
  archiveLocator:
    `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Zogan, Urushi, Raden and Ebonite care instructions`,
};

const currentNibGuide: CuratedSource = {
  key: "phase581-wancher-green-tamamushi-nib-guide-current",
  registryKey: "wancher-official-nib-guide-phase581-green-tamamushi",
  registryName: "Wancher Pen official nib guide",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-nib-guide-phase581-green-tamamushi",
  title: "Wancher Fountain Pen Nib Guide",
  url: "https://www.wancherpen.com/pages/nib-guide",
  homepageUrl: "https://www.wancherpen.com",
  itemType: "web_page",
  author: "Wancher Pen official nib guide",
  retrievedAt: RETRIEVED,
  allowedUse: "summary_only",
  summary:
    "官方 nib guide 用于阅读 JoWo、Wancher 18K、Keiryu 和 Kodachi 等菜单，不把指南中的一般性描述扩写成 Green Tamamushi 的隐藏规格。",
  archiveUrl: "https://www.wancherpen.com/pages/nib-guide",
  archiveLocator:
    `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=nib family descriptions and writing-angle guidance`,
};

const officialPhoto: CuratedSource = {
  key: "phase581-wancher-green-tamamushi-official-photo-current",
  registryKey: "wancher-official-green-tamamushi-photo-phase581",
  registryName: "Wancher Pen official product photography",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-green-tamamushi-phase581-current",
  title: "Zogan Momiji Green Tamamushi-nuri current product image",
  url: OFFICIAL_PHOTO_URL,
  homepageUrl: "https://www.wancherpen.com",
  itemType: "image",
  author: "Wancher Pen",
  retrievedAt: RETRIEVED,
  allowedUse: "link_only",
  license: "official-site-link-only",
  summary:
    "Wancher 当前 product JSON 返回的官方 CDN 商品图；只作带来源的外部图像证据，不复制为本站拥有的产品摄影，也不作色卡或比例证明。",
  archiveUrl:
    "https://www.wancherpen.com/products/zogan-momiji-green-tamamushi",
  archiveLocator:
    `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=current JSON image row position 1`,
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
        throw new Error(`Phase 581 conflicting ${label}: ${item.key}`);
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
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
  qualifies = true,
) {
  return {
    key,
    fieldKey,
    sourceKey,
    scopeKey: MODEL_SCOPE,
    locator,
    qualifies,
  } satisfies NonNullable<CuratedEntityPack["spec"]>["evidence"][number];
}

const base = phase543WancherZoganMomijiSiblingPacks.find(
  (pack) => pack.entityId === PHASE581_TARGET_ID,
);
if (!base?.spec) {
  throw new Error("Phase 581 requires the existing Phase 543 Green Tamamushi pack.");
}
if (
  base.expectedSlug !== PHASE581_CANONICAL_SLUG ||
  base.canonicalName !== "Wancher Zogan Momiji Green Tamamushi-nuri"
) {
  throw new Error("Phase 581 Green Tamamushi identity drifted from Phase 543.");
}

const mergedModel: CuratedEntityPack = {
  ...structuredClone(base),
  key: PHASE581_SOURCE_MARKER_KEY,
  markdownFile:
    ".planning/content-research/wancher-zogan-momiji-green-tamamushi-phase581.md",
  storyTitle:
    "Wancher Zogan Momiji Green Tamamushi-nuri：当前商品记录、表面工艺与身份边界",
  primarySourceKey: currentJson.key,
  aliases: mergeAliases(base.aliases, [
    {
      alias: "Wancher Dream Pen Zogan Momiji - Green Tamamushi-nuri",
      language: "en",
      sourceKey: currentJson.key,
      kind: "producer_name",
      market: "global",
    },
  ]),
  sources: mergeKeyed("source", base.sources, [
    currentJson,
    currentPage,
    zoganCollection,
    currentCare,
    currentNibGuide,
    officialPhoto,
  ]),
  claims: mergeKeyed("claim", base.claims, [
    extraClaim(
      "phase581-current-record",
      "model_identity",
      "2026-08-10 官方 JSON 仍以 product id 9322088038615 和 handle zogan-momiji-green-tamamushi 返回这条商品，并记录 updated_at 2026-08-10；时间戳只说明商品系统记录，不等于正式工艺首发日。",
      currentJson.key,
      "product id, handle, created_at, published_at and updated_at",
    ),
    extraClaim(
      "phase581-current-trim",
      "variant_configuration",
      "当前 JSON 的 Trim 选项为 Black 和 Silver：WF-ZOUR-DREAM-MOTAGR 与 WF-ZOUR-DREAM-MOTAGR-SV；两个 SKU 属于同一商品，不另建型号实体。",
      currentJson.key,
      "options name Trim, option values and variant SKU rows",
    ),
    extraClaim(
      "phase581-current-price",
      "price_status",
      "2026-08-10 当前 JSON 的 Black 与 Silver 变体均为 US$600；税费、库存、促销和页面按钮按地区与当次页面确认，不从商品平台字段推导永久价格。",
      currentJson.key,
      "variant price rows, price currency and current updated_at",
      "editorial",
    ),
    extraClaim(
      "phase581-current-material",
      "material",
      "当前结构化 Material & art 字段写 ABS、Titanium（trim part）、Zogan；商品正文仍出现 Urushi 与 ebonite pen body 的工艺叙事，两个层级并列保留，不补写漆层、厚度或逐组件产地。",
      currentJson.key,
      "current Material & art specification fields",
    ),
    extraClaim(
      "phase581-current-design",
      "design_theme",
      "当前官方页面仍把 Momiji 解释为日本秋季落叶，并说明珍珠母贝按图案切割、笔体开槽后分层嵌入；光泽会随观察角度变化。",
      currentPage.key,
      "current Momiji, Zogan and angle-dependent colour description",
    ),
    extraClaim(
      "phase581-collection-boundary",
      "identity_boundary",
      "当前 Zogan 集合页将 Green Tamamushi-nuri 与 Momiji、Sakura River、Yuki Zuki 等具体商品分开列出；集合导航不能替代 product id、handle 和 SKU 身份。",
      zoganCollection.key,
      "collection product cards and Zogan overview",
    ),
    extraClaim(
      "phase581-current-media",
      "media_evidence",
      "当前 product JSON 返回八张官方商品图，其中 Black 与 Silver 各有变体关联图；图像用于核对当次展示的叶片、Trim 和包装，不作为固定色卡、尺寸或库存证明。",
      currentJson.key,
      "current image rows, dimensions, CDN URLs and variant_ids",
    ),
    extraClaim(
      "phase581-official-photo-boundary",
      "media_rights_boundary",
      "官方 CDN 商品图以 link-only 方式保存来源；本站主图仍是明确标注非产品照片的 factual SVG，不把外部摄影复制成本站拥有的实拍。",
      officialPhoto.key,
      "current JSON position-1 image URL and link-only attribution",
      "editorial",
    ),
    extraClaim(
      "phase581-current-care",
      "maintenance_guidance",
      "当前护理页明确提醒 Zogan 不要在流水下清洗，母贝与漆面要避开强冲击、尖锐物和长时间直晒；Ebonite feed 还要避免长时间浸水与化学清洁剂。",
      currentCare.key,
      "current Zogan, Urushi, Raden and Ebonite care instructions",
      "editorial",
    ),
    extraClaim(
      "phase581-nib-guide-boundary",
      "nib_configuration_boundary",
      "Nib Guide 只用于解释 JoWo、Wancher 18K、Keiryu 和 Kodachi 菜单的阅读语境；它不替 Green Tamamushi 增加商品页没有列出的尖幅或组合。",
      currentNibGuide.key,
      "nib family and compatibility guidance",
    ),
    extraClaim(
      "phase581-buying-checklist",
      "selection_guidance",
      "选购或二手核对应同时查看完整标题、product id 9322088038615、handle、Black/Silver Trim SKU、ABS、Titanium trim、Zogan、所选 nib/feed、欧规供墨、包装和当支照片；只凭绿色 Momiji 标题不足以确认身份。",
      currentJson.key,
      "exact identity, configuration and evidence checklist",
      "editorial",
    ),
  ]),
  variants: mergeVariants(base.variants ?? [], [
    {
      key: "phase581-green-tamamushi-black-trim-current",
      name: "Black",
      notes:
        "2026-08-10 官方 JSON 的 Trim=Black，SKU WF-ZOUR-DREAM-MOTAGR，当前价格 US$600；库存与页面标签可变。",
      sourceKey: currentJson.key,
      variantKind: "color",
      productCode: "WF-ZOUR-DREAM-MOTAGR",
      market: "global",
    },
    {
      key: "phase581-green-tamamushi-silver-trim-current",
      name: "Silver",
      notes:
        "2026-08-10 官方 JSON 的 Trim=Silver，SKU WF-ZOUR-DREAM-MOTAGR-SV，当前价格 US$600；库存与页面标签可变。",
      sourceKey: currentJson.key,
      variantKind: "color",
      productCode: "WF-ZOUR-DREAM-MOTAGR-SV",
      market: "global",
    },
  ]),
  spec: {
    brandEntityId: PHASE581_WANCHER_BRAND_ID,
    values: {
      ...base.spec.values,
      material:
        "当前 Material & art：ABS、Titanium（trim part）、Zogan；正文另写 Urushi 与 Ebonite 语境，字段差异保留",
      weight:
        "官方未公布可靠成品重量；JSON grams=200 是平台变体字段，不作为实测重量",
      price_range:
        "2026-08-10 官方 JSON：WF-ZOUR-DREAM-MOTAGR US$600；WF-ZOUR-DREAM-MOTAGR-SV US$600",
      status:
        "官方 product record 当前仍以 9322088038615 / zogan-momiji-green-tamamushi 识别；库存、税费、促销和购买按钮按当次页面确认",
      nib: "#6 JoWo stainless steel；Wancher 18K gold；Keiryu；Kodachi",
    },
    evidence: mergeKeyed("spec evidence", base.spec.evidence, [
      extraSpecEvidence(
        "phase581-series-current",
        "series_name",
        currentJson.key,
        "current title, handle and product id",
      ),
      extraSpecEvidence(
        "phase581-nib-current",
        "nib",
        currentJson.key,
        "current exact nib field",
      ),
      extraSpecEvidence(
        "phase581-material-current",
        "material",
        currentJson.key,
        "current Material & art field",
      ),
      extraSpecEvidence(
        "phase581-material-prose",
        "material",
        currentPage.key,
        "current body prose mentioning Urushi and ebonite pen body; retained as a rejected field assertion",
        false,
      ),
      extraSpecEvidence(
        "phase581-weight-current",
        "weight",
        currentJson.key,
        "platform grams field explicitly not treated as measured finished weight",
      ),
      extraSpecEvidence(
        "phase581-price-current",
        "price_range",
        currentJson.key,
        "current Black/Silver price rows and USD currency",
      ),
      extraSpecEvidence(
        "phase581-status-current",
        "status",
        currentJson.key,
        "current updated_at, published_scope and variant record",
      ),
    ]),
  },
  timeline: mergeKeyed("timeline event", base.timeline ?? [], [
    {
      key: "phase581-green-tamamushi-current-record",
      title: "当前 Green Tamamushi product record refreshed",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "2026-08-10 重新读取 product id、handle、updated_at、Trim SKU、当前价格、规格和官方图片；这是资料窗口事件，不是正式首发日期。",
      sourceKey: currentJson.key,
    },
  ]),
  conflicts: mergeKeyed("conflict", base.conflicts ?? [], [
    {
      key: "phase581-material-field-and-prose",
      fieldKey: "material",
      scopeKey: MODEL_SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "当前结构化 Material & art 字段作为规格值记录 ABS、Titanium（trim part）、Zogan；正文的 Urushi 与 Ebonite 作为工艺叙事保留但不提升为已证实结构化材料。",
      members: [
        {
          citationKey: "phase581-material-current",
          assertedValue: "ABS, Titanium (trim part), Zogan in current structured field",
        },
        {
          citationKey: "phase581-material-prose",
          assertedValue: "Urushi and ebonite pen body in current product prose",
        },
      ],
    },
  ]),
  media: [
    ...(base.media ?? []),
    {
      key: "phase581-green-tamamushi-official-photo",
      title: "Wancher current official product photo（外部来源图）",
      sourceKey: officialPhoto.key,
      imageUrl: OFFICIAL_PHOTO_URL,
      author: "Wancher Pen",
      license: "official-site-link-only",
      attributionText:
        "Wancher 官方 CDN 当前商品图；仅作带来源的外部图像证据，不表示本站拥有版权，不作固定色卡、比例、库存或批次证明。",
      sourceUrl:
        "https://www.wancherpen.com/products/zogan-momiji-green-tamamushi",
      usageStatus: "gallery",
    },
  ],
};

export const phase581WancherZoganMomijiGreenTamamushiPacks: CuratedEntityPack[] = [
  mergedModel,
];
