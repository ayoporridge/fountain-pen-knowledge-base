import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  createPhase71KawecoPacks,
  PHASE71_KAWECO_BRAND_ID,
} from "./phase71-kaweco-p0";
import { phase139Groups } from "./phase139-german-swiss-current-batch";

const RETRIEVED = "2026-08-09";
const LILIPUT_ID = "7HaZSCUZHaBE";
const AL_SPORT_ID = "MV78JwjMOd6h";
const STUDENT_ID = "ZOuVvOu_nGSP";

function official(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  itemType?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: "kaweco-official-phase547",
    registryName: "Kaweco official",
    sourceType: "official",
    tier: input.itemType === "pdf" ? "contemporary_archive" : "primary",
    independenceGroup: "kaweco-official-phase547",
    title: input.title,
    url: input.url,
    homepageUrl: "https://www.kaweco-pen.com/",
    itemType: input.itemType ?? "web_page",
    author: "Kaweco / h&m gutberlet gmbh",
    publishedAt: null,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;raw_source_stored=false;locator=${input.summary}`,
  };
}

function evidence(
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

const brassB = official({
  key: "phase547-kaweco-liliput-brass-b-10000866",
  title: "Kaweco LILIPUT Fountain Pen Brass B — product 10000866",
  url: "https://www.kaweco-pen.com/en/Kaweco-LILIPUT-Fountain-Pen-Brass-B/10000866/",
  summary:
    "官方 Brass B 单品页确认产品号 10000866、无铅黄铜、闭合 9.7 cm、无帽 8.7 cm、插帽 12.5 cm、直径约 9.9 mm、约 23.7 g、EF/F/M/B/BB 与 Liliput squeeze converter。",
});

const brassM = official({
  key: "phase547-kaweco-liliput-brass-m-10000865",
  title: "Kaweco LILIPUT Fountain Pen Brass M — product 10000865",
  url: "https://www.kaweco-pen.com/en/Kaweco-LILIPUT-Fountain-Pen-Brass-M/10000865/",
  summary:
    "官方 Brass M 单品页作为同材质相邻 SKU 对照，确认 10000865 与 Brass B 的型号边界；尖号选择仍按具体产品页，不把 M 配置代填给 B。",
});

const series = official({
  key: "phase547-kaweco-liliput-series-current",
  title: "Kaweco LILIPUT series",
  url: "https://www.kaweco-pen.com/en/Series/LILIPUT/",
  summary:
    "官方 LILIPUT 系列页把名称历史放回 1908 年，说明现代三件式结构，并列出铝、黄铜、铜、不锈钢与 Fireblue 等材质路线。",
});

const refillGuide = official({
  key: "phase547-kaweco-liliput-refill-guide",
  title: "Kaweco How to refill, change & use",
  url: "https://kaweco-pen.com/files/catalog/How%20to%20refill%2C%20change%2C%20use....pdf",
  itemType: "pdf",
  summary:
    "Kaweco 官方使用资料提供墨囊、converter 与基础冲洗步骤；具体 Liliput 配件兼容性仍以型号商品页为准。",
});

const base = createPhase71KawecoPacks({
  alSport: AL_SPORT_ID,
  liliput: LILIPUT_ID,
  student: STUDENT_ID,
}).find((pack) => pack.entityId === LILIPUT_ID);
if (!base) throw new Error("Phase 547 Kaweco Liliput base pack is missing.");

const kawecoBrand = phase139Groups.find(
  (group) => group.brand.entityId === PHASE71_KAWECO_BRAND_ID,
)?.brand;
if (!kawecoBrand) throw new Error("Phase 547 Kaweco brand navigation pack is missing.");

const currentBrassScope: CuratedScope = {
  key: "phase547-liliput-brass-b-current",
  scopeKey: "kaweco-liliput-brass-b-10000866",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Kaweco official product page",
  nibScope: "Brass B product 10000866; EF/F/M/B/BB selection on the official page",
  materialScope: "Lead-free untreated brass; sibling metals remain separate variants",
  editionScope:
    "One current Brass B SKU; Brass M 10000865 and other materials do not inherit every field",
};

const familyScope: CuratedScope = {
  key: "phase547-liliput-family-materials",
  scopeKey: "kaweco-liliput-family-materials-current",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Kaweco official series page",
  materialScope: "Aluminium, brass, copper, stainless steel and hand-blued stainless steel Fireblue",
  editionScope:
    "Series-level material navigation; no cross-material inheritance of dimensions, weight or patina",
};

const careScope: CuratedScope = {
  key: "phase547-liliput-care",
  scopeKey: "kaweco-liliput-official-care-guidance",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Kaweco official care guide",
  editionScope:
    "General refill and cleaning instructions; exact converter compatibility remains SKU-scoped",
};

const newClaims: CuratedClaim[] = [
  {
    key: "phase547-current-brass-b-identity",
    predicate: "official_sku_boundary",
    objectText:
      "Kaweco 官方 Brass B 单品页的产品号为 10000866；它是本页当前尺寸、重量、材质和尖号的规格锚点，不代表 Brass M 10000865 或其他金属版本共享全部字段。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: brassB.key,
    locator: "official product number 10000866 and Brass B product description",
    evidence: [
      claimEvidence(
        "phase547-brass-b-identity-evidence",
        brassB.key,
        currentBrassScope.key,
        "Product number 10000866; Brass B selected SKU",
      ),
    ],
  },
  {
    key: "phase547-current-brass-b-specs",
    predicate: "current_sku_specification",
    objectText:
      "Brass B 10000866 页面列无铅黄铜、闭合约 9.7 cm、无帽约 8.7 cm、插帽约 12.5 cm、直径约 9.9 mm、约 23.7 g，以及 EF/F/M/B/BB 五种尖号；这些数值只在该 SKU 范围内成立。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: brassB.key,
    locator: "Brass B dimensions, weight, material and nib selectors",
    evidence: [
      claimEvidence(
        "phase547-brass-b-spec-evidence",
        brassB.key,
        currentBrassScope.key,
        "9.7 cm closed; 8.7 cm uncapped; 12.5 cm posted; 9.9 mm; 23.7 g; EF through BB",
      ),
    ],
  },
  {
    key: "phase547-brass-sibling-boundary",
    predicate: "same-material-sibling_boundary",
    objectText:
      "Brass M 10000865 是同材质的相邻 SKU；它用于说明产品号与尖号选择需要按单品确认，不能把 M 页面作为 Brass B 10000866 的唯一身份依据。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: brassM.key,
    locator: "official Brass M product number and adjacent SKU context",
    evidence: [
      claimEvidence(
        "phase547-brass-m-evidence",
        brassM.key,
        currentBrassScope.key,
        "Product number 10000865; same-material sibling, separate selected nib",
      ),
    ],
  },
  {
    key: "phase547-family-material-boundary",
    predicate: "material_version_boundary",
    objectText:
      "官方系列页把现代 Liliput 的铝、黄铜、铜、不锈钢与 Fireblue 分为材质路线；材质会影响重量、表面变化与护理方式，不能以 Brass B 的 23.7 g 或包浆描述覆盖全系列。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: series.key,
    locator: "official LILIPUT family material list and three-part structure",
    evidence: [
      claimEvidence(
        "phase547-family-material-evidence",
        series.key,
        familyScope.key,
        "Aluminium, brass, copper, stainless steel and Fireblue are listed as separate material routes",
      ),
    ],
  },
  {
    key: "phase547-filling-compatibility-boundary",
    predicate: "filling_system_boundary",
    objectText:
      "Liliput 使用短墨囊；瓶装墨水应按官方 Liliput squeeze converter 路线确认，不能因为 Sport 使用 Mini Converter 就推定所有 Kaweco converter 都能在短身内安全合盖。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: brassB.key,
    locator: "Brass B product filling guidance and dedicated Liliput converter context",
    evidence: [
      claimEvidence(
        "phase547-filling-evidence",
        brassB.key,
        currentBrassScope.key,
        "Short cartridge and Liliput squeeze converter route",
      ),
    ],
  },
  {
    key: "phase547-care-boundary",
    predicate: "maintenance_boundary",
    objectText:
      "换墨或长期闲置前后以室温清水缓慢冲洗并自然晾干；官方使用资料可用于基础墨囊、converter 和清洗动作，但不替代具体型号兼容性、金属表面护理或受损前端的专业维修判断。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: refillGuide.key,
    locator: "official refill, converter and cleaning instructions",
    evidence: [
      claimEvidence(
        "phase547-care-evidence",
        refillGuide.key,
        careScope.key,
        "Official refill and cleaning steps; compatibility remains product scoped",
      ),
    ],
  },
];

const liliputDepth: CuratedEntityPack = structuredClone(base);
liliputDepth.key = "phase547-kaweco-liliput-depth-v1";
liliputDepth.markdownFile =
  ".planning/content-research/kaweco-liliput-depth-publishable-content-2026-08-09.md";
liliputDepth.storyTitle = "Kaweco Liliput：Brass B 10000866、三件式短身与金属边界";
liliputDepth.sources = [...liliputDepth.sources, brassB, brassM, series, refillGuide];
liliputDepth.scopes = [
  ...liliputDepth.scopes,
  currentBrassScope,
  familyScope,
  careScope,
];
liliputDepth.claims = [...liliputDepth.claims, ...newClaims];
liliputDepth.variants = (liliputDepth.variants ?? []).map((variant) =>
  variant.key === "phase71-liliput-brass"
    ? {
        ...variant,
        productCode: "10000866",
        notes:
          "本页当前规格锚点：Brass B 产品 10000866，无铅黄铜、约 23.7 g、EF/F/M/B/BB 与专用 squeeze converter。",
        sourceKey: brassB.key,
      }
    : variant,
);
if (!liliputDepth.spec) throw new Error("Phase 547 Liliput spec is missing.");
liliputDepth.spec = {
  ...liliputDepth.spec,
  values: {
    ...liliputDepth.spec.values,
    release_year: "1908 年官方系列历史名称语境；现代材质／版本首发时间不据此推定",
    nib: "Brass B 10000866：钢尖，EF/F/M/B/BB 五种选择",
    fill_system:
      "短墨囊；瓶装墨水使用 Liliput 专用 squeeze converter，兼容性按型号确认",
    material:
      "Brass B 10000866：无铅黄铜，未处理表面会形成包浆；其他金属另分版本",
    dimensions:
      "Brass B 10000866：闭合约 9.7 cm；无帽约 8.7 cm；插帽约 12.5 cm；直径约 9.9 mm",
    weight: "Brass B 10000866：约 23.7 g",
    status: "官方当前系列与单品资料；材质、表面、尖号和地区库存按 SKU 确认",
  },
  evidence: liliputDepth.spec.evidence.map((item) => {
    if (item.fieldKey === "nib") {
      return evidence(
        "nib",
        "phase547-liliput-nib",
        brassB.key,
        currentBrassScope.key,
        "Brass B 10000866 EF/F/M/B/BB selectors",
      );
    }
    if (item.fieldKey === "fill_system") {
      return evidence(
        "fill_system",
        "phase547-liliput-fill",
        brassB.key,
        currentBrassScope.key,
        "short cartridge and dedicated Liliput squeeze converter",
      );
    }
    if (item.fieldKey === "material") {
      return evidence(
        "material",
        "phase547-liliput-material",
        brassB.key,
        currentBrassScope.key,
        "lead-free untreated brass for Brass B 10000866",
      );
    }
    if (item.fieldKey === "dimensions") {
      return evidence(
        "dimensions",
        "phase547-liliput-dimensions",
        brassB.key,
        currentBrassScope.key,
        "9.7 cm closed; 8.7 cm uncapped; 12.5 cm posted; 9.9 mm diameter",
      );
    }
    if (item.fieldKey === "weight") {
      return evidence(
        "weight",
        "phase547-liliput-weight",
        brassB.key,
        currentBrassScope.key,
        "approximately 23.7 g for Brass B 10000866",
      );
    }
    if (item.fieldKey === "release_year") {
      return evidence(
        "release_year",
        "phase547-liliput-history",
        series.key,
        familyScope.key,
        "1908 name/history context; not an asserted modern SKU launch year",
      );
    }
    if (item.fieldKey === "status") {
      return evidence(
        "status",
        "phase547-liliput-status",
        series.key,
        familyScope.key,
        "current official LILIPUT series listing",
      );
    }
    return item;
  }),
};
liliputDepth.timeline = [
  ...(liliputDepth.timeline ?? []),
  {
    key: "phase547-liliput-brass-b-current",
    title: "官方页面确认 Brass B 10000866 当前规格窗口",
    eventType: "model_released",
    startDate: RETRIEVED,
    circa: true,
    description:
      "检索时 Kaweco 官方商品页可见 Brass B 10000866；该日期表示当前资料窗口，不被写成所有 Liliput 材质的首发年份。",
    sourceKey: brassB.key,
  },
];

export const PHASE547_KAWECO_BRAND_ID = PHASE71_KAWECO_BRAND_ID;
export const PHASE547_KAWECO_LILIPUT_ID = LILIPUT_ID;
export const phase547KawecoLiliputDepthPacks: CuratedEntityPack[] = [
  structuredClone(kawecoBrand),
  liliputDepth,
];
