import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE49_DARK_CRYSTAL_ID,
  PHASE49_VISCONTI_BRAND_ID,
  phase49ViscontiHomoSapiensPacks,
} from "./phase49-visconti-homo-sapiens";
import { phase427BrandDepthRefreshPacks } from "./phase427-brand-depth-refresh";

const RETRIEVED = "2026-08-09";

function official(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: "visconti-official-phase549",
    registryName: "Visconti official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "visconti-official-phase549",
    title: input.title,
    url: input.url,
    homepageUrl: "https://www.visconti.it/en/",
    author: "Visconti S.r.l.",
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
  key: "phase549-visconti-dark-crystal-official-current",
  title: "Homo Sapiens Dark Crystal Fountain Pen — current official page",
  url: "https://www.visconti.it/en/shop/1-luxury-pens/95-homo-sapiens-dark-crystal-fountain-pen.html",
  summary:
    "当前官方商品页确认烟熏透明树脂、埃特纳熔岩粉尘语境、黑色电镀黄铜饰件、Double Reservoir Power Filler、bayonet 闭合、Over 尺寸、EF/F/M/B/S 选择；正文的 18K ruthenium-plated Giotto nib 与 characteristics 的 Au 14K 冲突原样保留。",
});

const currentCare = official({
  key: "phase549-visconti-care-current",
  title: "Care and maintenance of Visconti luxury pens",
  url: "https://www.visconti.it/en/care-and-maintenance.html",
  summary:
    "Visconti 官方维护页建议长期闲置前排空、清洗并完全干燥，日常使用时笔尖朝上收纳，清洗用室温水且深度拆洗应交给专业人员。",
});

const base = phase49ViscontiHomoSapiensPacks.find(
  (pack) => pack.entityId === PHASE49_DARK_CRYSTAL_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 549 Dark Crystal base pack is missing.");

const brand = phase427BrandDepthRefreshPacks.find(
  (pack) => pack.entityId === PHASE49_VISCONTI_BRAND_ID && pack.expectedType === "brand",
);
if (!brand) throw new Error("Phase 549 Visconti brand depth pack is missing.");

const currentScope: CuratedScope = {
  key: "phase549-dark-crystal-current-page",
  scopeKey: "visconti-dark-crystal-official-current",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Visconti official product page",
  nibScope: "Current page selector EF/F/M/B/S; 18K and 14K field conflict remains SKU-sensitive",
  materialScope: "Transparent smoked resin and lava material; shiny black electroplated brass metalwork",
  editionScope:
    "Regular Dark Crystal current page; Crystal Dream, Lava Bronze, Lava Color and Dark Age remain sibling versions",
};

const nibConflictScope: CuratedScope = {
  key: "phase549-dark-crystal-nib-conflict",
  scopeKey: "visconti-dark-crystal-page-18k-vs-14k",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Visconti current product page",
  nibScope:
    "Product description says 18kt ruthenium-plated Giotto nib; structured characteristics says Au 14kt large nib",
  editionScope:
    "Visible page-field conflict; do not resolve without SKU, nib engraving and purchase records",
};

const careScope: CuratedScope = {
  key: "phase549-dark-crystal-care",
  scopeKey: "visconti-official-care-guidance-current",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Visconti official care page",
  editionScope:
    "General Visconti fountain-pen care; double-reservoir and bayonet-specific handling remains model scoped",
};

const claims: CuratedClaim[] = [
  {
    key: "phase549-dark-crystal-current-identity",
    predicate: "official_current_identity",
    objectText:
      "Visconti 当前 Dark Crystal 商品页把型号放在 Homo Sapiens 系列的 regular edition，核心识别由烟熏透明树脂、黑色电镀黄铜饰件、Double Reservoir Power Filler 和 bayonet 闭合共同构成。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: currentProduct.key,
    locator: "current official title, edition, materials and mechanism fields",
    evidence: [
      claimEvidence(
        "phase549-dark-crystal-identity-evidence",
        currentProduct.key,
        currentScope.key,
        "Homo Sapiens Dark Crystal regular edition; smoked resin, black brass electroplating and double-reservoir bayonet system",
      ),
    ],
  },
  {
    key: "phase549-dark-crystal-material-boundary",
    predicate: "material_boundary",
    objectText:
      "当前官方介绍把 Dark Crystal 写成树脂与埃特纳熔岩粉尘的结合，笔身为 transparent smoked resin，金属部分为亮黑电镀黄铜；这些材料不能回填给 Crystal Dream 的明亮透明／青铜饰件或 Dark Age 的深色 lava。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: currentProduct.key,
    locator: "current product narrative and material/metalwork fields",
    evidence: [
      claimEvidence(
        "phase549-dark-crystal-material-evidence",
        currentProduct.key,
        currentScope.key,
        "resin and lava dust from Mt Etna; transparent smoked resin barrel; shiny black electroplated brass cap",
      ),
    ],
  },
  {
    key: "phase549-dark-crystal-nib-conflict",
    predicate: "nib_field_conflict",
    objectText:
      "当前官方页面的商品介绍写 18kt ruthenium-plated Giotto nib，characteristics 又写 Au 14kt（large），两者都作为页面证据保留；EF/F/M/B/S 是选择器字段，不足以消除尖材冲突。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: currentProduct.key,
    locator: "description nib sentence versus structured characteristics row",
    evidence: [
      claimEvidence(
        "phase549-dark-crystal-nib-conflict-evidence",
        currentProduct.key,
        nibConflictScope.key,
        "18kt ruthenium-plated Giotto nib in description; Au 14kt large nib in characteristics; EF/F/M/B/S selector",
      ),
    ],
  },
  {
    key: "phase549-dark-crystal-size-boundary",
    predicate: "size_boundary",
    objectText:
      "当前 characteristics 只把 Dark Crystal 标为 Over，并未给出统一毫米长度、直径或重量；本页不复制 Lava Bronze、Dark Age 或 Crystal Dream 的数值来填补 Dark Crystal 的空缺。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: currentProduct.key,
    locator: "current characteristics dimension row and omitted numeric fields",
    evidence: [
      claimEvidence(
        "phase549-dark-crystal-size-evidence",
        currentProduct.key,
        currentScope.key,
        "Dimension listed as Over; no fixed current length, diameter or weight on the page",
      ),
    ],
  },
  {
    key: "phase549-dark-crystal-care-boundary",
    predicate: "maintenance_boundary",
    objectText:
      "Visconti 官方维护页建议长期不用前排空、清洗并完全干燥，日常收纳保持笔尖朝上，清洗使用室温水且深度拆洗交由专业人员；Dark Crystal 的双储墨和电镀饰件不应自行使用溶剂、热水或强力抛光。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: currentCare.key,
    locator: "official storage, water-cleaning and expert-disassembly guidance",
    evidence: [
      claimEvidence(
        "phase549-dark-crystal-care-evidence",
        currentCare.key,
        careScope.key,
        "empty and dry before long storage; nib-up storage; room-temperature water; expert deep cleaning",
      ),
    ],
  },
];

const depth: CuratedEntityPack = structuredClone(base);
depth.key = "phase549-visconti-dark-crystal-depth-v1";
depth.markdownFile =
  ".planning/content-research/visconti-homo-sapiens-dark-crystal-depth-publishable-content-2026-08-09.md";
depth.storyTitle = "Homo Sapiens Dark Crystal：烟熏透明、双储墨与尖材冲突";
depth.sources = [...depth.sources, currentProduct, currentCare];
depth.scopes = [...depth.scopes, currentScope, nibConflictScope, careScope];
depth.claims = [...depth.claims, ...claims];
depth.variants = (depth.variants ?? []).map((variant) =>
  variant.key === "dark-crystal-current"
    ? {
        ...variant,
        notes:
          "当前官方页：smoked transparent resin、black electroplated brass、Double Reservoir、bayonet；描述中的 18K 与 characteristics 的 Au 14K 冲突保留。",
        sourceKey: currentProduct.key,
      }
    : variant,
);
if (!depth.spec) throw new Error("Phase 549 Dark Crystal spec is missing.");
depth.spec = {
  ...depth.spec,
  values: {
    ...depth.spec.values,
    release_year: "约 2021 年产品语境；当前官方页未给出精确首发年份",
    nib: "EF/F/M/B/S；商品介绍写 18kt ruthenium-plated Giotto nib，characteristics 写 Au 14kt（large）",
    fill_system: "Double Reservoir Power Filler 双储墨系统",
    material: "烟熏透明树脂与熔岩材料；黑色电镀黄铜饰件",
    dimensions: "官方 characteristics：Over；当前页未给出统一数值长度、直径或重量",
    status: "当前官方 regular edition 商品页；颜色和库存随销售页变化",
  },
  evidence: depth.spec.evidence.map((item) => {
    if (item.fieldKey === "release_year") {
      return specEvidence(
        "release_year",
        "phase549-dark-crystal-period",
        currentProduct.key,
        currentScope.key,
        "current page does not assert an exact launch year; retain circa 2021 context",
      );
    }
    if (item.fieldKey === "nib") {
      return specEvidence(
        "nib",
        "phase549-dark-crystal-nib",
        currentProduct.key,
        nibConflictScope.key,
        "EF/F/M/B/S; 18K description versus Au 14K characteristics",
      );
    }
    if (item.fieldKey === "fill_system") {
      return specEvidence(
        "fill_system",
        "phase549-dark-crystal-fill",
        currentProduct.key,
        currentScope.key,
        "Double Reservoir Power Filler",
      );
    }
    if (item.fieldKey === "material") {
      return specEvidence(
        "material",
        "phase549-dark-crystal-material",
        currentProduct.key,
        currentScope.key,
        "smoked transparent resin and black electroplated brass metalwork",
      );
    }
    if (item.fieldKey === "dimensions") {
      return specEvidence(
        "dimensions",
        "phase549-dark-crystal-dimensions",
        currentProduct.key,
        currentScope.key,
        "Over; no current numeric length, diameter or weight published",
      );
    }
    if (item.fieldKey === "status") {
      return specEvidence(
        "status",
        "phase549-dark-crystal-status",
        currentProduct.key,
        currentScope.key,
        "regular edition current product page",
      );
    }
    return item;
  }),
};
depth.timeline = [
  ...(depth.timeline ?? []),
  {
    key: "phase549-dark-crystal-current-window",
    title: "当前官方页面确认 Dark Crystal 资料窗口",
    eventType: "design_milestone",
    startDate: RETRIEVED,
    circa: true,
    description:
      "检索时 Visconti 官方商品页仍列出 Dark Crystal regular edition；日期表示当前页面窗口，不被写成全系列首发年份。",
    sourceKey: currentProduct.key,
  },
];

export const PHASE549_VISCONTI_BRAND_ID = PHASE49_VISCONTI_BRAND_ID;
export const PHASE549_DARK_CRYSTAL_ID = PHASE49_DARK_CRYSTAL_ID;
export const phase549ViscontiDarkCrystalDepthPacks: CuratedEntityPack[] = [
  structuredClone(brand),
  depth,
];
