import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase143Packs, PHASE143_BRAND_ID, PHASE143_IDS } from "./phase143-skb-rs301n-es520-batch";
import { phase435BrandDepthRefreshPacks } from "./phase435-brand-depth-refresh";

const RETRIEVED = "2026-08-09";

function official(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: "skb-official-phase548",
    registryName: "SKB 文明钢笔",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "skb-official-phase548",
    title: input.title,
    url: input.url,
    homepageUrl: "https://www.skb.com.tw/",
    author: "SKB 文明钢笔",
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
  key: "phase548-skb-rs301n-official-current",
  title: "RS-301N 黄铜袖珍钢笔（当前官方 SKU）",
  url: "https://www.skb.com.tw/product/product%26product_id%3D301",
  summary:
    "SKB 官方 RS-301N 商品页确认普通 SKU 的 M 尖、黄铜笔身、闭盖约 ±12 cm、台湾制造与专用黄铜吸墨器；开盖长度、重量和其他耗材兼容性未在页面确认。",
});

const currentCatalog = official({
  key: "phase548-skb-catalog-current",
  title: "SKB 精品钢笔目录（当前导航）",
  url: "https://www.skb.com.tw/product/category%26path%3D26_67",
  summary:
    "SKB 当前精品钢笔目录把 RS-301N 置于品牌型号导航中；目录用于产品线位置，不替代普通 SKU 的单品参数。",
});

const base = phase143Packs.find(
  (pack) => pack.entityId === PHASE143_IDS.rs301n && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 548 SKB RS-301N base pack is missing.");

const brand = phase435BrandDepthRefreshPacks.find(
  (pack) => pack.entityId === PHASE143_BRAND_ID && pack.expectedType === "brand",
);
if (!brand) throw new Error("Phase 548 SKB brand depth pack is missing.");

const currentScope: CuratedScope = {
  key: "phase548-rs301n-current-sku",
  scopeKey: "skb-rs301n-official-current-sku",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "SKB official product page",
  nibScope: "ordinary RS-301N SKU; official page states M",
  materialScope: "brass pen body; packaging materials are excluded",
  editionScope:
    "ordinary RS-301N product page; KANO/200K special editions and other SKB models remain separate",
};

const boundaryScope: CuratedScope = {
  key: "phase548-rs301n-unknown-fields",
  scopeKey: "skb-rs301n-unpublished-fields",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "SKB official product page",
  editionScope:
    "Official page does not establish uncapped length, posting, fixed weight, capacity or international cartridge compatibility",
};

const claims: CuratedClaim[] = [
  {
    key: "phase548-rs301n-official-identity",
    predicate: "official_sku_boundary",
    objectText:
      "SKB 官方普通商品页确认 RS-301N 是黄铜袖珍钢笔，型号、M 尖、台湾制造和专用黄铜吸墨器共同构成普通 SKU 身份；不能用只写 pocket pen 的照片替代型号证据。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: currentProduct.key,
    locator: "official RS-301N title and product fields",
    evidence: [
      claimEvidence(
        "phase548-rs301n-identity-evidence",
        currentProduct.key,
        currentScope.key,
        "RS-301N title, M nib, brass, Taiwan origin and dedicated brass filler",
      ),
    ],
  },
  {
    key: "phase548-rs301n-dimensions-boundary",
    predicate: "dimension_boundary",
    objectText:
      "官方普通 SKU 只公布闭盖总长约 ±12 cm；没有确认开盖长度、后插能力、握位直径或容量，因此本页不使用其他袖珍笔数字补齐这些字段。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: currentProduct.key,
    locator: "official product dimensions and omitted fields",
    evidence: [
      claimEvidence(
        "phase548-rs301n-dimensions-evidence",
        currentProduct.key,
        boundaryScope.key,
        "closed length approximately ±12 cm; no official uncapped or posted length",
      ),
    ],
  },
  {
    key: "phase548-rs301n-filler-boundary",
    predicate: "filling_system_boundary",
    objectText:
      "普通 RS-301N 随附专用黄铜吸墨器；SKB 页面没有因此承诺 RI-60、#301A、国际墨囊、CON-40 或 eyedropper 可以直接互换，改装不属于官方普通配置。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: currentProduct.key,
    locator: "dedicated brass filler and no cross-model compatibility claim",
    evidence: [
      claimEvidence(
        "phase548-rs301n-filler-evidence",
        currentProduct.key,
        currentScope.key,
        "one dedicated brass ink filler supplied with ordinary RS-301N",
      ),
    ],
  },
  {
    key: "phase548-rs301n-catalog-position",
    predicate: "catalog_navigation",
    objectText:
      "SKB 当前精品钢笔目录用于确认 RS-301N 的品牌型号位置；品牌页的导航不把 RS-301N 与 ES-520、RS-501i 或 Penton/SIKIB F 系列合并。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: currentCatalog.key,
    locator: "official current fountain-pen catalog navigation",
    evidence: [
      claimEvidence(
        "phase548-rs301n-catalog-evidence",
        currentCatalog.key,
        currentScope.key,
        "RS-301N appears as a distinct current catalog entry",
      ),
    ],
  },
  {
    key: "phase548-rs301n-care-boundary",
    predicate: "maintenance_boundary",
    objectText:
      "日常清洗只处理笔尖、笔舌和专用吸墨器，使用室温清水并完全干燥；黄铜包浆、刻字区域、木盒与接口漏墨分别处理，不能用强酸碱、研磨膏或硬拆替代维修判断。",
    factClass: "editorial",
    confidence: 0.92,
    sourceKey: currentProduct.key,
    locator: "conservative care boundary derived from the official SKU's brass body and dedicated filler",
    evidence: [
      claimEvidence(
        "phase548-rs301n-care-evidence",
        currentProduct.key,
        currentScope.key,
        "care guidance stays conservative where the official page does not publish a separate manual",
      ),
    ],
  },
];

const depth: CuratedEntityPack = structuredClone(base);
depth.key = "phase548-skb-rs301n-depth-v1";
depth.markdownFile =
  ".planning/content-research/skb-rs-301n-depth-publishable-content-2026-08-09.md";
depth.storyTitle = "SKB RS-301N：黄铜袖珍笔、M 尖与专用吸墨器边界";
depth.sources = [...depth.sources, currentProduct, currentCatalog];
depth.scopes = [...depth.scopes, currentScope, boundaryScope];
depth.claims = [...depth.claims, ...claims];
if (!depth.spec) throw new Error("Phase 548 SKB RS-301N spec is missing.");
depth.spec = {
  ...depth.spec,
  values: {
    ...depth.spec.values,
    nib: "官方普通 SKU：M",
    fill_system: "专用黄铜吸墨器一支；其他 converter、墨囊与 eyedropper 兼容性未由官方确认",
    material: "黄铜笔身；表面色泽随使用与环境变化",
    dimensions: "官方普通 SKU：闭盖总长约 ±12 cm；未公布开盖、后插和容量",
    weight: "官方商品页未公布固定重量",
    status: "当前官方 RS-301N SKU；价格、库存与刻字服务随商品页变化",
  },
  evidence: [
    ...depth.spec.evidence.map((item) => {
    if (item.fieldKey === "nib") {
      return specEvidence("nib", "phase548-rs301n-nib", currentProduct.key, currentScope.key, "official M nib");
    }
    if (item.fieldKey === "fill_system") {
      return specEvidence("fill_system", "phase548-rs301n-fill", currentProduct.key, currentScope.key, "dedicated brass ink filler");
    }
    if (item.fieldKey === "material") {
      return specEvidence("material", "phase548-rs301n-material", currentProduct.key, currentScope.key, "brass body");
    }
    if (item.fieldKey === "dimensions") {
      return specEvidence("dimensions", "phase548-rs301n-dimensions", currentProduct.key, currentScope.key, "closed length approximately ±12 cm");
    }
    if (item.fieldKey === "weight") {
      return specEvidence("weight", "phase548-rs301n-weight", currentProduct.key, boundaryScope.key, "official page does not publish a fixed weight");
    }
    if (item.fieldKey === "status") {
      return specEvidence("status", "phase548-rs301n-status", currentCatalog.key, currentScope.key, "current catalog position");
    }
      return item;
    }),
    specEvidence(
      "weight",
      "phase548-rs301n-weight",
      currentProduct.key,
      boundaryScope.key,
      "official page does not publish a fixed weight",
    ),
  ],
};
depth.timeline = [
  ...(depth.timeline ?? []),
  {
    key: "phase548-rs301n-current-window",
    title: "官方页面确认 RS-301N 当前 SKU 资料窗口",
    eventType: "design_milestone",
    startDate: RETRIEVED,
    circa: true,
    description:
      "检索时 SKB 官方商品页仍列出普通 RS-301N；日期表示资料窗口，不被写成型号首发年份。",
    sourceKey: currentProduct.key,
  },
];

export const PHASE548_SKB_BRAND_ID = PHASE143_BRAND_ID;
export const PHASE548_SKB_RS301N_ID = PHASE143_IDS.rs301n;
export const phase548SkbRs301nDepthPacks: CuratedEntityPack[] = [
  structuredClone(brand),
  depth,
];
