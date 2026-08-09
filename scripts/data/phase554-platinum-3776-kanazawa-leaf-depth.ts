import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import { phase126Packs } from "./phase126-platinum-maki-e-kanazawa-leaf";
import { phase447PicassoPlatinumMontblancBrandPacks } from "./phase447-picasso-platinum-montblanc-brand-depth";

const RETRIEVED = "2026-08-09";
export const PHASE554_PNB35000H_ID = "phase126-platinum-pnb-35000h";
export const PHASE554_PNB35000H_SLUG =
  "platinum-3776-century-kanazawa-leaf-pnb-35000h";
export const PHASE554_PLATINUM_ID = "e51tJpejEkXY";

const base = phase126Packs.find(
  (pack) =>
    pack.entityId === PHASE554_PNB35000H_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 554 Platinum PNB-35000H base pack is missing.");

const platinumBrand = phase447PicassoPlatinumMontblancBrandPacks.find(
  (pack) =>
    pack.entityId === PHASE554_PLATINUM_ID && pack.expectedType === "brand",
);
if (!platinumBrand) throw new Error("Phase 554 Platinum brand pack is missing.");

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  tier: CuratedSource["tier"];
  sourceType: CuratedSource["sourceType"];
  independenceGroup: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    ...input,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

const S = {
  retailerMatsu: web({
    key: "phase554-iguana-sell-pnb35000h-matsu-tora",
    title: "Iguana Sell: Platinum Kanazawa Maki-e Matsu-Tora PNB-35000H-55",
    url: "https://www.iguanasell.com/products/platinum-kanazawa-maki-e-matsu-tora-fountain-pen-pnb-35000h-55",
    registryKey: "iguana-sell-phase554",
    registryName: "Iguana Sell",
    tier: "retailer",
    sourceType: "retailer",
    independenceGroup: "iguana-sell-phase554",
    summary:
      "零售商页面以 PNB-35000H-55 / Matsu-Tora 的商品名和图案记录独立市场身份；价格、库存和零售包装只作当日市场快照，不覆盖官方规格。",
    locator:
      "product title and model slug identify PNB-35000H-55 Matsu-Tora; retailer price/stock excluded from stable facts",
  }),
} satisfies Record<string, CuratedSource>;

const scope: CuratedScope = {
  key: "phase554-platinum-pnb35000h-depth",
  scopeKey: "phase554-platinum-pnb35000h-depth",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Platinum official Japan catalogue; international market identity cross-check",
  nibScope: "Large 14K (14-26), F / M / B; exact line width remains nib-and-sample scoped",
  materialScope:
    "AS resin body with Kanazawa leaf momi-chirashi and modern maki-e surface; foil is not a metal body",
  editionScope:
    "PNB-35000H #3 Fujin Raijin, #55 Matsu-Tora and #57 Ascending Dragon; motif, product code and nib width remain SKU fields",
};

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: CuratedClaim["factClass"] = "core",
  confidence = 0.98,
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence,
    sourceKey,
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey: scope.scopeKey,
        locator,
      },
    ],
  };
}

function specEvidence(
  key: string,
  fieldKey: CuratedSpecEvidence["fieldKey"],
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return {
    key,
    fieldKey,
    sourceKey,
    scopeKey: scope.scopeKey,
    locator,
    qualifies: true,
  };
}

const depthClaims: CuratedClaim[] = [
  claim(
    "phase554-pnb35000h-identity",
    "model_identity",
    "PNB-35000H 是 Platinum #3776 Century 的金泽箔产品线；风神雷神 #3、松虎 #55 与昇龙 #57 是同一基型下的图案 SKU，不是三个重复型号。",
    "phase126-pnb-35000h-fujin-raijin-3-official",
    "official exact pages for #3, #55 and #57 all identify PNB-35000H",
  ),
  claim(
    "phase554-pnb35000h-motif-sku-boundary",
    "variant_identity",
    "图案号、F/M/B 尖幅和商品代码共同定义具体 variant：#3 为 1627032/33/34，#55 为 1627552/53/54，#57 为 1627572/73/74。",
    "phase126-pnb-35000h-ascending-dragon-57-official",
    "official exact pages list #3/#55/#57 product-code triples by nib width",
  ),
  claim(
    "phase554-pnb35000h-momi-chirashi",
    "finish_process",
    "官方把表面工艺写为金泽箔“もみちらし”与近代莳绘：箔片被打碎、散贴成不规则底层，再承接图案表现；金箔是表面装饰，不把 AS 树脂笔身改写成金属笔身。",
    "phase126-pnb-35000h-fujin-raijin-3-official",
    "official Japanese product page describes 金沢箔もみちらし and modern maki-e over AS resin",
  ),
  claim(
    "phase554-pnb35000h-nib-and-line",
    "nib_scope",
    "这条基型使用大型 14K（14-26）笔尖，官方可选 F、M、B；尖材与官方尖幅是型号字段，实际线宽仍受纸张、墨水、角度、磨损和重磨影响。",
    "phase126-pnb-35000h-matsu-tora-55-official",
    "official PNB-35000H specification: large 14K 14-26 and F/M/B",
  ),
  claim(
    "phase554-pnb35000h-filling",
    "filling_system",
    "官方随笔列出 Platinum Converter-800A 与蓝黑墨囊；转换器、墨囊、接口和清洗按 Platinum 手册确认，不能因外观相似而替换为短国际墨囊。",
    "phase126-platinum-general-manual",
    "Platinum general manual cartridge, converter and water-cleaning sections",
  ),
  claim(
    "phase554-pnb35000h-finish-care",
    "maintenance_boundary",
    "清洗只针对笔尖、feed、握位和供墨接口，用常温清水缓慢吸排；箔面与莳绘避免酒精、漂白剂、研磨剂、硬刷、热水浸泡和超声波，出现起翘或裂纹应停止自行拆修。",
    "phase126-platinum-general-manual",
    "general manual supports ink-system care; decorative-finish precautions are conservative editorial boundary",
    "editorial",
    0.95,
  ),
  claim(
    "phase554-pnb35000h-selection",
    "selection_guidance",
    "验货要把图案、商品代码、尖面刻字、盒标、Converter 接口与维修记录放在同一证据链里；只写“金箔 3776”或只给一张图的二手页面，不足以判定 #3、#55 或 #57。",
    S.retailerMatsu.key,
    "retailer identity cross-check is useful for one market SKU only; official code and physical evidence remain required",
    "editorial",
    0.95,
  ),
  claim(
    "phase554-pnb35000h-sibling-boundary",
    "family_boundary",
    "PNB-30000B 属 Kaga Hira Maki-e 路线，PTL-20000H 属更轻的 18K F/M Kanazawa Leaf 路线；普通 #3776 Century 也不能因轮廓或接口相近就回填 PNB-35000H 的图案和规格。",
    "phase126-pnb35000h-collector",
    "independent collector grouping plus Phase 126 sibling packs keep PNB-30000B/PTL-20000H separate",
  ),
];

const depthVariants: NonNullable<CuratedEntityPack["variants"]> = [
  {
    key: "phase554-pnb35000h-fujin-raijin",
    name: "Fujin Raijin #3 风神雷神",
    notes:
      "官方 PNB-35000H 图案 variant；F/M/B 商品代码为 1627032/1627033/1627034，图案与盒标需和实物对应。",
    sourceKey: "phase126-pnb-35000h-fujin-raijin-3-official",
    variantKind: "market_sku",
    productCode: "PNB-35000H#3",
    market: "Japan / official catalogue",
  },
  {
    key: "phase554-pnb35000h-matsu-tora",
    name: "Matsu-Tora #55 松虎",
    notes:
      "官方 PNB-35000H 图案 variant；F/M/B 商品代码为 1627552/1627553/1627554。国际零售标题的库存与价格不作为稳定字段。",
    sourceKey: "phase126-pnb-35000h-matsu-tora-55-official",
    variantKind: "market_sku",
    productCode: "PNB-35000H#55",
    market: "Japan / official catalogue",
  },
  {
    key: "phase554-pnb35000h-ascending-dragon",
    name: "Ascending Dragon #57 昇龙",
    notes:
      "官方 PNB-35000H 图案 variant；F/M/B 商品代码为 1627572/1627573/1627574。商品页汉字、零售转写和实物图案应一起核对。",
    sourceKey: "phase126-pnb-35000h-ascending-dragon-57-official",
    variantKind: "market_sku",
    productCode: "PNB-35000H#57",
    market: "Japan / official catalogue",
  },
];

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase554-platinum-pnb35000h-depth-v1",
  expectedType: "pen",
  expectedSlug: PHASE554_PNB35000H_SLUG,
  canonicalName: "Platinum #3776 Century Kanazawa Leaf PNB-35000H",
  markdownFile: ".planning/content-research/platinum-pnb-35000h-phase126.md",
  storyTitle: "PNB-35000H：金泽箔图案、14K 尖与验货边界",
  primarySourceKey: "phase126-pnb-35000h-fujin-raijin-3-official",
  sources: [...base.sources, S.retailerMatsu],
  scopes: [...base.scopes, scope],
  claims: [...base.claims, ...depthClaims],
  // Rebuild the three existing motif rows with the richer SKU notes. The
  // apply path deletes this entity's owned variants before inserting, so
  // retaining the old rows here would violate model_variants.variant_name.
  variants: depthVariants,
  spec: {
    brandEntityId: PHASE554_PLATINUM_ID,
    values: {
      ...(base.spec?.values ?? {}),
      series_name: "#3776 Century Kanazawa Leaf（PNB-35000H；#3/#55/#57 图案 SKU）",
      nib: "大型 14K（14-26），F / M / B",
      fill_system: "Platinum cartridge / Converter-800A；随笔列蓝黑墨囊",
      material: "AS resin body；金泽箔 もみちらし与近代莳绘表面装饰",
      dimensions: "全长 139.5 mm；最大径 14.5 mm",
      weight: "标准重量 18.8 g",
      status: `Current official motif pages checked ${RETRIEVED}`,
    },
    evidence: [
      ...(base.spec?.evidence ?? []),
      specEvidence(
        "phase554-pnb35000h-spec-brand",
        "brand_entity_id",
        "phase126-pnb-35000h-fujin-raijin-3-official",
        "Platinum official exact PNB-35000H product page",
      ),
      specEvidence(
        "phase554-pnb35000h-spec-series",
        "series_name",
        "phase126-pnb-35000h-fujin-raijin-3-official",
        "PNB-35000H heading, Kanazawa leaf and motif name",
      ),
      specEvidence(
        "phase554-pnb35000h-spec-release",
        "release_year",
        "phase126-platinum-price-list-2025",
        "dated 2025 official list proves a snapshot, not an invented launch year",
      ),
      specEvidence(
        "phase554-pnb35000h-spec-origin",
        "origin_country",
        "phase126-pnb-35000h-matsu-tora-55-official",
        "Platinum Japan official catalogue context",
      ),
      specEvidence(
        "phase554-pnb35000h-spec-nib",
        "nib",
        "phase126-pnb-35000h-matsu-tora-55-official",
        "large 14K 14-26; F/M/B choices",
      ),
      specEvidence(
        "phase554-pnb35000h-spec-fill",
        "fill_system",
        "phase126-platinum-general-manual",
        "cartridge, Converter-800A and water-cleaning guidance",
      ),
      specEvidence(
        "phase554-pnb35000h-spec-material",
        "material",
        "phase126-pnb-35000h-ascending-dragon-57-official",
        "AS resin and Kanazawa foil/maki-e product specification",
      ),
      specEvidence(
        "phase554-pnb35000h-spec-dimensions",
        "dimensions",
        "phase126-pnb-35000h-fujin-raijin-3-official",
        "139.5 mm length and 14.5 mm maximum diameter",
      ),
      specEvidence(
        "phase554-pnb35000h-spec-weight",
        "weight",
        "phase126-pnb-35000h-matsu-tora-55-official",
        "18.8 g standard weight",
      ),
      specEvidence(
        "phase554-pnb35000h-spec-status",
        "status",
        "phase126-platinum-price-list-2025",
        "dated official SKU listing and current exact-page snapshot",
      ),
    ],
  },
  media: base.media,
  timeline: [
    ...(base.timeline ?? []),
    {
      key: "phase554-pnb35000h-exact-motif-check",
      title: "三条 PNB-35000H 图案页与 SKU 组合复核",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "官方 exact pages 分别列出风神雷神 #3、松虎 #55、昇龙 #57 及各自 F/M/B 商品代码；当前页把图案和型号关系保留为 variant 层。",
      sourceKey: "phase126-pnb-35000h-fujin-raijin-3-official",
    },
    {
      key: "phase554-pnb35000h-finish-boundary",
      title: "もみちらし与近代莳绘表面边界",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "官方产品页将金泽箔散贴底层、AS 树脂笔身和图案莳绘分层描述；装饰层不改写笔身材质或尖材。",
      sourceKey: "phase126-pnb-35000h-fujin-raijin-3-official",
    },
  ],
};

if (
  pack.entityId !== PHASE554_PNB35000H_ID ||
  pack.expectedSlug !== PHASE554_PNB35000H_SLUG
) {
  throw new Error("Phase 554 PNB-35000H pack identity drifted.");
}

export const phase554PlatinumPnb35000hDepthPacks: CuratedEntityPack[] = [
  platinumBrand,
  pack,
];
