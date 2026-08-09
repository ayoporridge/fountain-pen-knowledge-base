import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE269_VICEROY_GRAND_ID,
  PHASE269_YOL_BRAND_ID,
  phase269YardOLedViceroyGrandPacks,
} from "./phase269-yard-o-led-viceroy-grand";
import { phase433BrandDepthRefreshPacks } from "./phase433-brand-depth-refresh";

const RETRIEVED = "2026-08-09";

function official(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: "yard-o-led-official-phase550",
    registryName: "YARD-O-LED official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "yard-o-led-official-phase550",
    title: input.title,
    url: input.url,
    homepageUrl: "https://www.yard-o-led.com/",
    author: "YARD-O-LED / Imperial Yard Ltd",
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

const victorian = official({
  key: "phase550-yol-viceroy-grand-victorian-current",
  title: "Viceroy Grand Victorian Fountain Pen — current official SKU page",
  url: "https://www.yard-o-led.com/collections/the-grand-fountain-pen/products/viceroy-grand-victorian-fountain-pen",
  summary:
    "当前官方 Victorian 商品页确认 solid 925 sterling silver、148 mm、13.0 mm、66 g、18 carat gold Fine/Medium/Broad、英格兰手工、lifetime warranty、最新 screw cap，以及最多约 3,000 次手工 chasing 和每支纹样差异。",
});

const barley = official({
  key: "phase550-yol-viceroy-grand-barley-current",
  title: "Viceroy Grand Barley Fountain Pen — current official SKU page",
  url: "https://www.yard-o-led.com/collections/the-grand-fountain-pen/products/viceroy-grand-barley-fountain-pen",
  summary:
    "当前官方 Barley 商品页确认 solid 925 sterling silver、148 mm、13.0 mm、66 g、18 carat gold Fine/Medium/Broad、Barley finish、英格兰手工、lifetime warranty 与当前 screw-cap 版本。",
});

const collection = official({
  key: "phase550-yol-grand-collection-current",
  title: "The Grand Fountain Pen — current official collection",
  url: "https://www.yard-o-led.com/collections/the-grand-fountain-pen",
  summary:
    "当前官方目录把 The Grand 定位为旗舰 fountain pen 路线，分列 Victorian、Barley、Martelé、rollerball 等商品；目录用于型号导航，不把 sibling 规格互相回填。",
});

const care = official({
  key: "phase550-yol-care-current",
  title: "Looking after your YARD-O-LED — official care page",
  url: "https://www.yard-o-led.com/pages/looking-after-your-yard-o-led",
  summary:
    "官方维护页把产品定位为可使用一生的书写工具，提供 fountain pen nib cleaning 视频并引导遇到问题时联系 service centre；它不在正文中承诺具体 converter 规格。",
});

const base = phase269YardOLedViceroyGrandPacks.find(
  (pack) =>
    pack.entityId === PHASE269_VICEROY_GRAND_ID &&
    pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 550 YARD-O-LED Viceroy Grand base pack is missing.");

const brand = phase433BrandDepthRefreshPacks.find(
  (pack) =>
    pack.entityId === PHASE269_YOL_BRAND_ID && pack.expectedType === "brand",
);
if (!brand) throw new Error("Phase 550 YARD-O-LED brand pack is missing.");

const currentVictorianScope: CuratedScope = {
  key: "phase550-viceroy-grand-victorian-current",
  scopeKey: "yard-o-led-viceroy-grand-victorian-official-current",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "YARD-O-LED official Victorian product page",
  nibScope: "Current Victorian SKU; official selector Fine, Medium and Broad 18 carat gold nibs",
  materialScope: "Solid 925 sterling silver; Victorian hand-chased finish",
  editionScope:
    "Current Victorian product page; old samples and Grand Martelé remain separate versions",
};

const currentBarleyScope: CuratedScope = {
  key: "phase550-viceroy-grand-barley-current",
  scopeKey: "yard-o-led-viceroy-grand-barley-official-current",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "YARD-O-LED official Barley product page",
  nibScope: "Current Barley SKU; official selector Fine, Medium and Broad 18 carat gold nibs",
  materialScope: "Solid 925 sterling silver; Barley finish",
  editionScope:
    "Current Barley product page; Victorian, Pinstripe and Grand Martelé remain separate finishes or siblings",
};

const careScope: CuratedScope = {
  key: "phase550-viceroy-grand-care",
  scopeKey: "yard-o-led-official-care-current",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "YARD-O-LED official care page",
  editionScope:
    "General YARD-O-LED fountain-pen care and service boundary; converter compatibility remains SKU-scoped",
};

const currentImageScope: CuratedScope = {
  key: "phase550-viceroy-grand-image-boundary",
  scopeKey: "yard-o-led-viceroy-grand-official-image-boundary",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "YARD-O-LED official product pages",
  materialScope: "Official product-page images are digital simulations; Victorian pattern varies by hand",
  editionScope:
    "Image and colour boundary for current Victorian and Barley pages; no photo asset is imported",
};

const sampleScope: CuratedScope = {
  key: "phase550-viceroy-grand-older-samples",
  scopeKey: "yard-o-led-viceroy-grand-independent-sample-boundary",
  validFrom: "2017",
  productionState: "historical",
  market: "independent reviews and forum sample reports",
  nibScope: "Individual older samples; not a current universal configuration",
  editionScope:
    "Measured and filled samples from Mat's Pens and Fountain Pen Network; do not merge with every current SKU",
};

const claims: CuratedClaim[] = [
  {
    key: "phase550-viceroy-grand-current-specs",
    predicate: "official_current_sku_specification",
    objectText:
      "YARD-O-LED 当前 Victorian 与 Barley 商品页都列 solid 925 sterling silver、148 mm 长、13.0 mm 宽、66 g，并提供 Fine、Medium、Broad 三种 18 carat gold nib；这些数字是当前商品页的规格锚点，不是所有历史 Viceroy Grand 的统一值。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: victorian.key,
    locator: "Victorian technical specification and nib selector; matching Barley fields",
    evidence: [
      claimEvidence(
        "phase550-current-specs-victorian",
        victorian.key,
        currentVictorianScope.key,
        "Length 148 mm; width 13.0 mm; weight 66 g; solid 925 silver; 18 carat gold Fine/Medium/Broad",
      ),
      claimEvidence(
        "phase550-current-specs-barley",
        barley.key,
        currentBarleyScope.key,
        "Length 148 mm; width 13.0 mm; weight 66 g; solid 925 silver; 18 carat gold Fine/Medium/Broad",
      ),
    ],
  },
  {
    key: "phase550-viceroy-grand-victorian-chasing",
    predicate: "hand_chasing_boundary",
    objectText:
      "当前 Victorian 页面把纹样写成手工 chasing，最多约 3,000 次敲击；手工差异会让每支笔的图案略有不同，同时提供握持摩擦。纹样差异属于工艺，不是把 Victorian 当作平版印花或瑕疵品。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: victorian.key,
    locator: "Victorian hand-chasing description and pattern variation note",
    evidence: [
      claimEvidence(
        "phase550-victorian-chasing-evidence",
        victorian.key,
        currentVictorianScope.key,
        "up to 3,000 hand-chasing taps; no two Victorian pattern pens are identical; texture also improves grip",
      ),
    ],
  },
  {
    key: "phase550-viceroy-grand-finish-boundary",
    predicate: "finish_variant_boundary",
    objectText:
      "Victorian 与 Barley 是 Viceroy Grand 旗下分开的表面 finish；当前 Barley 页面仍列 Grand 的 148 mm、13.0 mm、66 g 与 18 carat gold F/M/B，但不能用 Barley 的外观、纹样或订单图片替代 Victorian 实物。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: barley.key,
    locator: "Barley product title, finish and technical specification",
    evidence: [
      claimEvidence(
        "phase550-finish-barley-evidence",
        barley.key,
        currentBarleyScope.key,
        "Finish Barley; separate current product from Victorian and Grand Martelé",
      ),
      claimEvidence(
        "phase550-finish-navigation-evidence",
        collection.key,
        currentBarleyScope.key,
        "The Grand collection lists Victorian, Barley and Grand Martelé as separate product routes",
      ),
    ],
  },
  {
    key: "phase550-viceroy-grand-cap-warranty",
    predicate: "current_cap_and_warranty",
    objectText:
      "当前 Victorian 与 Barley 商品页把最新工坊版本写成 screw cap，并附 lifetime warranty；旧笔或二手笔应检查实际帽机制和购买凭证，不能把当前页面的保修自动承诺给所有转手交易。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: victorian.key,
    locator: "latest workshop screw cap and lifetime warranty statements",
    evidence: [
      claimEvidence(
        "phase550-cap-warranty-victorian",
        victorian.key,
        currentVictorianScope.key,
        "latest workshop version features a screw cap; lifetime warranty",
      ),
      claimEvidence(
        "phase550-cap-warranty-barley",
        barley.key,
        currentBarleyScope.key,
        "current Barley page repeats screw-cap and lifetime-warranty boundary",
      ),
    ],
  },
  {
    key: "phase550-viceroy-grand-image-simulation",
    predicate: "official_image_boundary",
    objectText:
      "官方 Victorian 与 Barley 商品页明确提示图片为 digital simulations，成品可能不完全相同；Victorian 页面还提示手工纹样会因单支而异。因此本页不抓取或冒充官方产品照片，使用站内原创 factual SVG，并把颜色、纹样和编号留给具体订单与实物照片核对。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: victorian.key,
    locator: "official digital-simulation and handmade-pattern disclaimers",
    evidence: [
      claimEvidence(
        "phase550-image-boundary-evidence",
        victorian.key,
        currentImageScope.key,
        "images may not accurately represent finished piece; pattern may differ on each pen due to handmade nature",
      ),
    ],
  },
  {
    key: "phase550-viceroy-grand-sample-boundary",
    predicate: "historical_sample_boundary",
    objectText:
      "Mat's Pens 与 Fountain Pen Network 的 46–65 g、约 140–148 mm、#6/Bock 18K 和 converter 记录属于具体旧样本；它们可帮助理解尺寸和使用边界，但不覆盖当前 Victorian/Barley 商品页的 66 g 规格，也不证明每支笔随附同一 converter。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: "phase269-yol-mats",
    locator: "independent sample measurements and filling-system reports",
    evidence: [
      claimEvidence(
        "phase550-sample-mats-evidence",
        "phase269-yol-mats",
        sampleScope.key,
        "Mat's Victorian sample: approximately 140 mm capped, 175 mm posted, 46 g body and 64 g posted",
      ),
      claimEvidence(
        "phase550-sample-fpn-evidence",
        "phase269-yol-fpn",
        sampleScope.key,
        "FPN sample: approximately 148 mm and 65 g; international converter and #6 18K sample context",
      ),
    ],
  },
  {
    key: "phase550-viceroy-grand-care-boundary",
    predicate: "maintenance_and_service_boundary",
    objectText:
      "YARD-O-LED 官方维护页把书写工具定位为可使用一生，提供清洁 fountain pen nibs 的视频并建议遇到问题联系 service centre；银件和供墨清洗仍应温和进行，converter 兼容性、凹痕和帽机构问题交给具体 SKU 或专业维修判断。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: care.key,
    locator: "official lifetime-care statement, nib-cleaning video and service-centre guidance",
    evidence: [
      claimEvidence(
        "phase550-care-evidence",
        care.key,
        careScope.key,
        "products built to last a lifetime; fountain pen nib cleaning video; contact service centre if problems remain",
      ),
    ],
  },
  {
    key: "phase550-viceroy-grand-selection",
    predicate: "selection_guidance",
    objectText:
      "Victorian 适合把手工纹样和握持摩擦作为购买理由，Barley 适合偏好颗粒感较规律的银面；66 g 当前大号笔对小手或长时间速记可能偏重。下单前应核对 finish、尖宽、编号、hallmark、converter、保修与售后，而不是只看名称和网页模拟图。",
    factClass: "editorial",
    confidence: 0.95,
    sourceKey: victorian.key,
    locator: "current finish, weight, nib and image-boundary facts translated into conservative selection guidance",
    evidence: [
      claimEvidence(
        "phase550-selection-evidence",
        victorian.key,
        currentVictorianScope.key,
        "Victorian hand-chasing, current 66 g weight, F/M/B selector and digital-simulation warning",
      ),
    ],
  },
];

const depth: CuratedEntityPack = structuredClone(base);
depth.key = "phase550-yard-o-led-viceroy-grand-depth-v1";
depth.markdownFile =
  ".planning/content-research/yard-o-led-viceroy-grand-depth-publishable-content-2026-08-09.md";
depth.storyTitle =
  "YARD-O-LED Viceroy Grand：66 克银杆、手工纹样与当前版本边界";
depth.primarySourceKey = victorian.key;
depth.sources = [...depth.sources, victorian, barley, collection, care];
depth.scopes = [
  ...depth.scopes,
  currentVictorianScope,
  currentBarleyScope,
  careScope,
  currentImageScope,
  sampleScope,
];
depth.claims = [...depth.claims, ...claims];
depth.variants = (depth.variants ?? []).map((variant) => {
  if (variant.key === "viceroy-victorian") {
    return {
      ...variant,
      notes:
        "当前 Victorian 商品页：solid 925 sterling silver、148 mm、13.0 mm、66 g、18 carat gold F/M/B、最多约 3,000 次 hand-chasing；每支纹样略有不同，最新版本为 screw cap。",
      sourceKey: victorian.key,
    };
  }
  if (variant.key === "viceroy-barley") {
    return {
      ...variant,
      notes:
        "当前 Barley 商品页：solid 925 sterling silver、148 mm、13.0 mm、66 g、18 carat gold F/M/B；Barley 是独立 finish，最新版本为 screw cap。",
      sourceKey: barley.key,
    };
  }
  return variant;
});
if (!depth.spec) throw new Error("Phase 550 YARD-O-LED Viceroy Grand spec is missing.");
depth.spec = {
  ...depth.spec,
  values: {
    ...depth.spec.values,
    series_name: "The Grand / Viceroy Grand",
    origin_country: "英国手工制作；The Grand 目录确认 Birmingham England 语境",
    nib: "当前 Victorian/Barley 商品页：18 carat gold，Fine、Medium、Broad；旧样本另见 #6/Bock 18K",
    fill_system:
      "标准国际墨囊或 converter 见旧评测样本；当前官方商品页未承诺固定配件、长度或容量，按具体 SKU 核对",
    material:
      "solid 925 sterling silver；Victorian 与 Barley 为不同表面 finish",
    dimensions:
      "当前官方 Victorian/Barley 商品页：长度 148 mm、宽度 13.0 mm；旧样本测量只作版本边界",
    weight:
      "当前官方 Victorian/Barley 商品页：66 g；Mat's/FPN 的 46–65 g 为具体旧样本，不作统一额定值",
  },
  evidence: depth.spec.evidence.map((item) => {
    if (item.fieldKey === "brand_entity_id") {
      return specEvidence(
        "brand_entity_id",
        "phase550-viceroy-brand",
        collection.key,
        currentVictorianScope.key,
        "The Grand collection identity and current Viceroy Grand navigation",
      );
    }
    if (item.fieldKey === "series_name") {
      return specEvidence(
        "series_name",
        "phase550-viceroy-series",
        collection.key,
        currentVictorianScope.key,
        "The Grand collection and Viceroy Grand product title",
      );
    }
    if (item.fieldKey === "origin_country") {
      return specEvidence(
        "origin_country",
        "phase550-viceroy-origin",
        victorian.key,
        currentVictorianScope.key,
        "Handmade in England; Grand collection Birmingham England context",
      );
    }
    if (item.fieldKey === "nib") {
      return specEvidence(
        "nib",
        "phase550-viceroy-current-nib",
        victorian.key,
        currentVictorianScope.key,
        "18 carat gold selector: Fine, Medium, Broad",
      );
    }
    if (item.fieldKey === "fill_system") {
      return specEvidence(
        "fill_system",
        "phase550-viceroy-sample-fill",
        "phase269-yol-mats",
        sampleScope.key,
        "international cartridge/converter appears in an older sample; current page omits fixed filling specification",
      );
    }
    if (item.fieldKey === "material") {
      return specEvidence(
        "material",
        "phase550-viceroy-current-material",
        victorian.key,
        currentVictorianScope.key,
        "solid 925 sterling silver; Victorian finish",
      );
    }
    if (item.fieldKey === "dimensions") {
      return specEvidence(
        "dimensions",
        "phase550-viceroy-current-dimensions",
        victorian.key,
        currentVictorianScope.key,
        "Length 148 mm; width 13.0 mm",
      );
    }
    if (item.fieldKey === "weight") {
      return specEvidence(
        "weight",
        "phase550-viceroy-current-weight",
        victorian.key,
        currentVictorianScope.key,
        "Weight 66 g",
      );
    }
    return item;
  }),
};
depth.timeline = [
  ...(depth.timeline ?? []),
  {
    key: "phase550-viceroy-grand-current-window",
    title: "当前官方 Victorian 与 Barley 商品页规格窗口",
    eventType: "design_milestone",
    startDate: RETRIEVED,
    circa: true,
    description:
      "检索时官方页面同时列出 Viceroy Grand Victorian 与 Barley 的 148 mm、13.0 mm、66 g、18 carat gold F/M/B 和当前 screw-cap 边界；日期表示页面资料窗口，不被写成型号首发年份。",
    sourceKey: victorian.key,
  },
];

export const PHASE550_YOL_BRAND_ID = PHASE269_YOL_BRAND_ID;
export const PHASE550_YOL_VICEROY_GRAND_ID = PHASE269_VICEROY_GRAND_ID;
export const phase550YardOLedViceroyGrandDepthPacks: CuratedEntityPack[] = [
  structuredClone(brand),
  depth,
];
