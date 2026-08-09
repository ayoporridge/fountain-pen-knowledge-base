import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE139_BRANDS,
  PHASE139_IDS,
  phase139Groups,
} from "./phase139-german-swiss-current-batch";

const RETRIEVED = "2026-08-09";

function official(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: "schneider-official-phase551",
    registryName: "Schneider official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "schneider-official-phase551",
    title: input.title,
    url: input.url,
    homepageUrl: "https://schneiderpen.com/",
    author: "Schneider Schreibgeräte GmbH",
    publishedAt: null,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;raw_source_stored=false;locator=${input.summary}`,
  };
}

function specEvidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function claimEvidence(
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { key, sourceKey, scopeKey, locator };
}

const currentProduct = official({
  key: "phase551-schneider-ray-168213-current",
  title: "Ray pistacchio M+ Fountain pen — Article No. 168213",
  url: "https://schneiderpen.com/us/fountain-pen/ray/168213",
  summary:
    "Schneider 当前美国官网商品页确认 Article No. 168213、GTIN 4004675183279、pistacchio、右手 M+、橡胶化握区、不锈钢 iridium 尖、标准墨囊、piston converter、随附一支 royal-blue 可擦墨囊、金属笔夹、可替换前端和左手 L 边界；当前页面还显示地区选项可用性状态。",
});

const modelGroup = phase139Groups.find(
  (group) => group.brand.entityId === PHASE139_BRANDS.schneider,
);
if (!modelGroup) throw new Error("Phase 551 Schneider Ray group is missing.");

const base = modelGroup.pens.find(
  (pack) => pack.entityId === PHASE139_IDS.ray && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 551 Schneider Ray base pack is missing.");

const currentScope: CuratedScope = {
  key: "phase551-ray-168213-current",
  scopeKey: "schneider-ray-168213-official-current",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Schneider US official product page",
  nibScope: "Article No. 168213; right-handed M+ stainless-steel nib with iridium tip",
  materialScope: "Pistacchio SKU with rubberised grip profile, plastic body and metal clip",
  editionScope:
    "One current Ray product page; colours, left-handed L front and other writing instruments remain separate boundaries",
};

const availabilityScope: CuratedScope = {
  key: "phase551-ray-availability-boundary",
  scopeKey: "schneider-ray-168213-regional-availability",
  validFrom: RETRIEVED,
  productionState: "unknown",
  market: "Schneider US product page at retrieval",
  editionScope:
    "Displayed colour, handedness and M+ options are page-level availability states; they do not establish global discontinuation",
};

const serviceScope: CuratedScope = {
  key: "phase551-ray-front-service-boundary",
  scopeKey: "schneider-ray-front-replacement-boundary",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Schneider official product and replacement-front pages",
  nibScope: "L changes both nib and grip profile; replacement part compatibility remains article-number scoped",
  editionScope:
    "Spare front part and left-handed L path; not a promise of cross-model or cross-year interchangeability",
};

const claims: CuratedClaim[] = [
  {
    key: "phase551-ray-official-identity",
    predicate: "official_sku_identity",
    objectText:
      "Schneider 当前官方页把 Ray pistacchio 右手 M+ 钢笔标为 Article No. 168213、GTIN 4004675183279；货号、颜色、书写方向和尖型共同构成这一具体 SKU 身份，不能只凭 Ray 外壳照片认定型号。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: currentProduct.key,
    locator: "product title, Article No. 168213, GTIN and selected variants",
    evidence: [
      claimEvidence(
        "phase551-ray-identity-evidence",
        currentProduct.key,
        currentScope.key,
        "Ray; pistacchio; right-handed; M+; Article No. 168213; GTIN 4004675183279",
      ),
    ],
  },
  {
    key: "phase551-ray-current-features",
    predicate: "official_current_features",
    objectText:
      "168213 官方商品页确认橡胶化人体工学握区、M+ 不锈钢尖和 iridium tip、结实金属笔夹、标准墨囊、piston converter、随附一支 royal-blue 可擦墨囊以及 spare front part；这些是当前页面确认的使用和补给边界。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: currentProduct.key,
    locator: "product highlights and Product information Ray",
    evidence: [
      claimEvidence(
        "phase551-ray-features-evidence",
        currentProduct.key,
        currentScope.key,
        "rubberised grip; stainless-steel nib with iridium tip M+; metal clip; standard cartridges; one erasable royal-blue cartridge; spare front",
      ),
    ],
  },
  {
    key: "phase551-ray-left-handed-boundary",
    predicate: "handedness_front_boundary",
    objectText:
      "官方 Ray 商品信息明确 L-version 同时改变 nib and grip profile；左手 L 是完整方向化前端，不是把右手 M+ 尖单独换成另一种线宽。备用前端必须按方向和货号确认，不能从其它 Schneider 型号推断通用。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: currentProduct.key,
    locator: "L-version nib and grip profile statement; spare front part",
    evidence: [
      claimEvidence(
        "phase551-ray-left-evidence",
        currentProduct.key,
        serviceScope.key,
        "L-version changes both nib and grip profile; spare front part available",
      ),
    ],
  },
  {
    key: "phase551-ray-availability-boundary",
    predicate: "regional_availability_boundary",
    objectText:
      "检索时 Schneider 美国页面把展示的颜色、Right-handed／Left-handed 和 M+ 选项标为当前不可用；这只能说明该地区商品页的库存状态，不足以推出 Ray 全球停产或所有市场都无法购买。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: currentProduct.key,
    locator: "variant availability labels on current US page",
    evidence: [
      claimEvidence(
        "phase551-ray-availability-evidence",
        currentProduct.key,
        availabilityScope.key,
        "colour, execution and line-width options displayed as currently unavailable on the US page",
      ),
    ],
  },
  {
    key: "phase551-ray-origin-boundary",
    predicate: "manufacturer_origin_boundary",
    objectText:
      "当前官网顶部标注 Made in Germany，商品信息列制造商为 Schneider Schreibgeräte GmbH；这支持品牌与当前商品的德国制造语境，但不把墨囊、converter 或替换前端自动写成同一生产地点。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: currentProduct.key,
    locator: "Made in Germany site label and manufacturer block",
    evidence: [
      claimEvidence(
        "phase551-ray-origin-evidence",
        currentProduct.key,
        currentScope.key,
        "Made in Germany; manufacturer Schneider Schreibgeräte GmbH, Schwarzenbach",
      ),
    ],
  },
  {
    key: "phase551-ray-unpublished-dimensions",
    predicate: "unpublished_spec_boundary",
    objectText:
      "当前 168213 官方页没有公布统一的长度、直径、握位尺寸或固定重量；本页不从 Ray 其它颜色、替换前端或社区测量补齐这些字段。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: currentProduct.key,
    locator: "current page properties and omission of numeric dimensions/weight",
    evidence: [
      claimEvidence(
        "phase551-ray-unpublished-evidence",
        currentProduct.key,
        currentScope.key,
        "no current official length, diameter, grip or weight field asserted for Article No. 168213",
      ),
    ],
  },
  {
    key: "phase551-ray-care-boundary",
    predicate: "maintenance_boundary",
    objectText:
      "Ray 的日常清洁应以取下墨囊或 converter、室温清水冲洗前端和充分晾干为限；橡胶化握区不宜接触酒精、漂白剂、沸水或洗碗机。若前端裂纹、尖端弯曲或软触层发黏，应按货号联系服务，不用硬拆和强清洁掩盖损坏。",
    factClass: "editorial",
    confidence: 0.94,
    sourceKey: currentProduct.key,
    locator: "conservative care derived from current rubberised grip, cartridge/converter and replaceable-front boundaries",
    evidence: [
      claimEvidence(
        "phase551-ray-care-evidence",
        currentProduct.key,
        serviceScope.key,
        "care remains conservative where current product page confirms soft-touch grip and replaceable front but gives no solvent-cleaning manual",
      ),
    ],
  },
  {
    key: "phase551-ray-selection-guidance",
    predicate: "selection_guidance",
    objectText:
      "Ray 适合重视成型握区、标准墨囊和可替换前端的课堂、办公室或日常书写；左手用户应试完整 L 前端，习惯圆握区或长时间写作的人应先试握。购买时记录地区、颜色、方向、尖型、货号和随附墨囊，不把页面暂不可用当作全球停产。",
    factClass: "editorial",
    confidence: 0.95,
    sourceKey: currentProduct.key,
    locator: "current intended-use description, grip, refill and handedness boundaries",
    evidence: [
      claimEvidence(
        "phase551-ray-selection-evidence",
        currentProduct.key,
        currentScope.key,
        "current page positions Ray for classrooms, offices and universities and exposes handedness/refill choices",
      ),
    ],
  },
];

const depth: CuratedEntityPack = structuredClone(base);
depth.key = "phase551-schneider-ray-current-depth-v1";
depth.markdownFile =
  ".planning/content-research/schneider-ray-current-depth-publishable-content-2026-08-09.md";
depth.storyTitle = "Schneider Ray：168213 右手 M+，与左手 L 的完整前端边界";
depth.primarySourceKey = currentProduct.key;
depth.sources = [...depth.sources, currentProduct];
depth.scopes = [...depth.scopes, currentScope, availabilityScope, serviceScope];
depth.claims = [...depth.claims, ...claims];
depth.variants = (depth.variants ?? []).map((variant) => {
  if (variant.productCode === "168213") {
    return {
      ...variant,
      notes:
        "当前官方 SKU：pistacchio、右手、M+、Article No. 168213；美国页检索时颜色／方向／M+ 选项显示不可用，库存按地区核对。",
      sourceKey: currentProduct.key,
    };
  }
  return variant;
});
if (!depth.spec) throw new Error("Phase 551 Schneider Ray spec is missing.");
depth.spec = {
  ...depth.spec,
  values: {
    ...depth.spec.values,
    series_name: "Schneider Ray",
    origin_country:
      "德国 Schneider Schreibgeräte GmbH；官网当前页面标注 Made in Germany",
    nib: "168213：pistacchio、右手、M+ 不锈钢尖、iridium tip；左手 L 是包含反向握区的完整前端配置",
    fill_system:
      "标准墨囊；官方产品信息支持 piston converter；168213 随一支 royal-blue 可擦墨囊",
    material:
      "橡胶化人体工学握区、塑料主体与金属笔夹；颜色按具体 SKU",
    dimensions: "当前 168213 官方商品页未公布统一长度、直径或握位尺寸",
    weight: "当前 168213 官方商品页未公布固定重量",
    status:
      "当前官网商品页资料窗口；检索时美国页显示相关颜色／方向／M+ 选项不可用，库存按地区核对",
  },
  evidence: [
    ...depth.spec.evidence.map((item) => {
    if (item.fieldKey === "brand_entity_id") {
      return specEvidence(
        "brand_entity_id",
        "phase551-ray-brand",
        currentProduct.key,
        currentScope.key,
        "Schneider manufacturer identity on the current Ray page",
      );
    }
    if (item.fieldKey === "series_name") {
      return specEvidence(
        "series_name",
        "phase551-ray-series",
        currentProduct.key,
        currentScope.key,
        "Ray fountain pen title and Ray product series navigation",
      );
    }
    if (item.fieldKey === "origin_country") {
      return specEvidence(
        "origin_country",
        "phase551-ray-origin",
        currentProduct.key,
        currentScope.key,
        "Made in Germany and Schneider Schreibgeräte GmbH manufacturer block",
      );
    }
    if (item.fieldKey === "release_year") {
      return specEvidence(
        "release_year",
        "phase551-ray-period",
        currentProduct.key,
        currentScope.key,
        "current listing verified; no launch year asserted",
      );
    }
    if (item.fieldKey === "nib") {
      return specEvidence(
        "nib",
        "phase551-ray-nib",
        currentProduct.key,
        currentScope.key,
        "right-handed M+ stainless nib with iridium tip; L changes nib and grip profile",
      );
    }
    if (item.fieldKey === "fill_system") {
      return specEvidence(
        "fill_system",
        "phase551-ray-fill",
        currentProduct.key,
        currentScope.key,
        "standard ink cartridges, piston converters and one royal-blue erasable cartridge",
      );
    }
    if (item.fieldKey === "material") {
      return specEvidence(
        "material",
        "phase551-ray-material",
        currentProduct.key,
        currentScope.key,
        "rubberised grip profile, plastic body and sturdy metal clip",
      );
    }
    if (item.fieldKey === "dimensions") {
      return specEvidence(
        "dimensions",
        "phase551-ray-dimensions",
        currentProduct.key,
        currentScope.key,
        "official page does not publish a fixed numeric length or diameter",
      );
    }
    if (item.fieldKey === "weight") {
      return specEvidence(
        "weight",
        "phase551-ray-weight",
        currentProduct.key,
        currentScope.key,
        "official page does not publish a fixed weight",
      );
    }
    if (item.fieldKey === "status") {
      return specEvidence(
        "status",
        "phase551-ray-status",
        currentProduct.key,
        availabilityScope.key,
        "current US product page; displayed options unavailable at retrieval, not a global discontinuation claim",
      );
    }
      return item;
    }),
    specEvidence(
      "origin_country",
      "phase551-ray-origin",
      currentProduct.key,
      currentScope.key,
      "Made in Germany and Schneider Schreibgeräte GmbH manufacturer block",
    ),
  ],
};
depth.timeline = [
  ...(depth.timeline ?? []),
  {
    key: "phase551-ray-current-window",
    title: "Schneider 官方当前 Ray 168213 资料窗口",
    eventType: "design_milestone",
    startDate: RETRIEVED,
    circa: true,
    description:
      "检索时 Schneider 美国官网仍保留 Ray 168213 的商品信息、方向／尖型和替换前端边界；日期表示当前页面窗口，不被写成型号首发年份。",
    sourceKey: currentProduct.key,
  },
];

export const PHASE551_SCHNEIDER_BRAND_ID = PHASE139_BRANDS.schneider;
export const PHASE551_SCHNEIDER_RAY_ID = PHASE139_IDS.ray;
export const phase551SchneiderRayCurrentDepthPacks: CuratedEntityPack[] = [
  structuredClone(modelGroup.brand),
  depth,
];
