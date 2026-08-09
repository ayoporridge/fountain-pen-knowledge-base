import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import {
  PHASE108_HERITAGE_91_ID,
  PHASE108_HERITAGE_91_SLUG,
  PHASE108_PILOT_ID,
  phase108PilotCustomHeritage91Pack,
} from "./phase108-pilot-custom-heritage-91-92";
import { phase425BrandDepthRefreshPacks } from "./phase425-brand-depth-refresh";

const RETRIEVED = "2026-08-09";
export const PHASE556_HERITAGE_91_ID = PHASE108_HERITAGE_91_ID;
export const PHASE556_HERITAGE_91_SLUG = PHASE108_HERITAGE_91_SLUG;
export const PHASE556_PILOT_ID = PHASE108_PILOT_ID;

const base = phase108PilotCustomHeritage91Pack;
const pilotBrand = phase425BrandDepthRefreshPacks.find(
  (pack) => pack.entityId === PHASE556_PILOT_ID && pack.expectedType === "brand",
);
if (!pilotBrand) throw new Error("Phase 556 Pilot brand preflight pack is missing.");

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  summary: string;
  locator: string;
  author?: string;
  publishedAt?: string;
  itemType?: string;
}): CuratedSource {
  return {
    ...input,
    homepageUrl: new URL(input.url).origin,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

const S = {
  lineup: web({
    key: "phase556-91-current-lineup",
    title: "Simple designs that transcend generations CUSTOM HERITAGE Series",
    url: "https://www.pilot-custom.jp/en/lineup/heritage.html",
    registryKey: "pilot-custom-official-phase556-91",
    registryName: "PILOT Custom official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    summary:
      "官方当前 Heritage lineup 将 Custom Heritage 91 绑定 FKVHN-12SR、14K No.5 与 EF/F/SF/FM/SFM/M/SM/B/BB 九种笔种，并与 92、912 分开列示。",
    locator:
      "CUSTOM HERITAGE 91 block: FKVHN-12SR, 14K No.5, nine nib types, and separate 92/912 blocks",
  }),
  catalog: web({
    key: "phase556-91-current-catalog",
    title: "FKVHN-12SR-BF｜カスタムヘリテイジ91｜PILOTウェブカタログ",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000257&volumeName=00004",
    registryKey: "pilot-webcatalog-phase556-91",
    registryName: "PILOT web catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    summary:
      "当前黑色 F 尖 SKU 页面给出 FKVHN-12SR-BF、树脂轴帽、螺纹嵌合、14K No.5 铑色尖、CON-40/CON-70N、14.7 mm、137 mm 与 15.7 g。",
    locator:
      "product title/SKU and specification table: 14K No.5, resin barrel/cap, screw cap, CON-40/CON-70N, 14.7 mm, 137 mm, 15.7 g",
  }),
  warrantyIndex: web({
    key: "phase556-91-warranty-index",
    title: "Fountain Pens Products covered by the warranty | PILOT",
    url: "https://www.pilot.co.jp/support/warranty/en/fountain/index.html",
    registryKey: "pilot-warranty-index-phase556-91",
    registryName: "PILOT International Warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    summary:
      "官方保修清单把 CUSTOM HERITAGE 91 与 FKVHN-12SR 绑定，并将 91 与 92、912、Custom 74、Elite 95S 分列。",
    locator:
      "covered-products list entries for CUSTOM HERITAGE 91 FKVHN-12SR and neighboring Pilot models",
  }),
  con70n: web({
    key: "phase556-91-con70n-catalog",
    title: "CON-70N｜コンバーター｜PILOTウェブカタログ",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100002533&volumeName=00004",
    registryKey: "pilot-con70n-phase556-91",
    registryName: "PILOT web catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-converter-official",
    summary:
      "官方 converter 页面说明 CON-70N 为按压式、约 80 mm、标称约 1.1 ml；这些是 converter 商品字段，不回填成 91 笔杆固定容量。",
    locator:
      "CON-70N product features and specification rows: push type, 80 mm, approximately 1.1 ml, compatible Pilot cartridge-type fountain pens",
  }),
  conGuide: web({
    key: "phase556-91-con4070-care",
    title: "Fountain Pen / Use and Care Guide — cartridge, CON-40 and CON-70N",
    url: "https://www.pilot.co.jp/support/warranty/en/warranty_assets/pdf/fountain_con4070_en.pdf",
    registryKey: "pilot-converter-care-phase556-91",
    registryName: "PILOT Use and Care Guide",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-converter-official",
    summary:
      "官方 PDF 给出墨囊直插、CON-40 旋转吸墨、CON-70N 按压五至六次、换装时笔尖朝上、清水清洁与避免撞击瓶底的步骤。",
    locator:
      "PDF cartridge/CON-40/CON-70N filling diagrams and cleaning/handling cautions",
    itemType: "pdf",
  }),
  history: web({
    key: "phase556-91-custom-history",
    title: "CUSTOM Series: Continuing to serve all styles of handwriting",
    url: "https://www.pilot-custom.jp/en/history/",
    registryKey: "pilot-custom-history-phase556-91",
    registryName: "PILOT Custom official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    summary:
      "官方历史页把 Custom Heritage 91 放在 2009 节点，并展示早期 FKVH-1MR 与银色调设计背景；历史代码不替当前 FKVHN-12SR 断代。",
    locator:
      "2009 CUSTOM HERITAGE91 history block: FKVH-1MR, silver-tone design and rhodium-finished components",
  }),
  fpn: web({
    key: "phase556-91-fpn-review",
    title: "Pilot Custom Heritage 91 Review",
    url: "https://www.fountainpennetwork.com/forum/topic/352090-pilot-custom-heritage-91-review/",
    registryKey: "fountain-pen-network-heritage91-phase556",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    independenceGroup: "fountain-pen-network",
    summary:
      "2020 年独立样本记录 Custom Heritage 91 的 cartridge/converter、CON-70、No.5 尖、包装与一支笔的写感；样本资料不覆盖所有颜色、尖型或当前包装。",
    locator:
      "review post by cgreenberg19 dated 2020-02-09: cartridge/converter, CON-70, No.5 nib, sample writing and package contents",
    author: "cgreenberg19",
    publishedAt: "2020-02-09",
  }),
} satisfies Record<string, CuratedSource>;

const scope: CuratedScope = {
  key: "phase556-91-current-depth",
  scopeKey: "phase556-91-current-depth",
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Pilot official Japan catalog and international warranty index",
  nibScope:
    "14K No.5; official lineup lists EF/F/SF/FM/SFM/M/SM/B/BB; soft response is not a flex guarantee",
  materialScope:
    "resin barrel and cap with silver-tone trim and rhodium-finished nib on the current black F SKU page",
  editionScope:
    "FKVHN-12SR current family; color and nib suffixes remain SKU-level fields, older FKVH-1MR is historical code context",
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
    "phase556-91-identity",
    "model_identity",
    "Custom Heritage 91 的当前官方型号范围是 FKVHN-12SR；黑色 F 尖的完整商品 SKU 为 FKVHN-12SR-BF，颜色和尖幅后缀不能被省略为另一个型号。",
    S.catalog.key,
    "official current catalog title/SKU and product identity",
  ),
  claim(
    "phase556-91-spec-boundary",
    "specification_boundary",
    "当前黑色 F 尖页面给出树脂轴帽、螺纹嵌合、银色调件、14K No.5 铑色尖、最大径 14.7 mm、全长 137 mm、重量 15.7 g；这些数值绑定到该页面的 SKU 快照。",
    S.catalog.key,
    "official specification table for FKVHN-12SR-BF",
  ),
  claim(
    "phase556-91-nib-selection",
    "nib_scope",
    "官方 Heritage lineup 列出 EF、F、SF、FM、SFM、M、SM、B、BB 九种笔种；“しなり”说明书写响应方向，不把 SF/SFM/SM 写成可安全压弯的 flex 尖。",
    S.lineup.key,
    "official 91 lineup block and nib list",
  ),
  claim(
    "phase556-91-filling",
    "filling_system",
    "91 是 Pilot cartridge 式钢笔，可使用原厂墨囊、CON-40 或 CON-70N；CON-70N 的约 1.1 ml 是 converter 商品字段，不是 91 笔杆固定墨仓容量。",
    S.con70n.key,
    "CON-70N official product fields plus 91 catalog compatibility row",
  ),
  claim(
    "phase556-91-care",
    "maintenance_boundary",
    "官方 converter 指南要求安装与换装时笔尖朝上、墨囊直插、CON-40 旋转吸墨、CON-70N 按压五至六次；换色或停用前用清水清洁，避免撞瓶底、溶剂、热水和自行拆修。",
    S.conGuide.key,
    "official cartridge/CON-40/CON-70N filling and care instructions",
  ),
  claim(
    "phase556-91-history-code",
    "historical_code_boundary",
    "Pilot 官方历史页在 2009 Heritage 91 节点展示 FKVH-1MR，当前目录与保修清单使用 FKVHN-12SR；历史代码只能说明资料时代，不能替二手笔推断生产年份。",
    S.history.key,
    "official 2009 history block and current-code comparison",
  ),
  claim(
    "phase556-91-sibling-boundary",
    "family_boundary",
    "91 与 Heritage 92、912、Custom 74、Elite 95S 和 Custom 823 不能互抄规格：92 是内置 piston，912 是 No.10，823 是 plunger/vacuum，91 才是 FKVHN-12SR 的 No.5 cartridge/converter 路线。",
    S.warrantyIndex.key,
    "official warranty index and Heritage lineup separate neighboring models",
  ),
  claim(
    "phase556-91-sample-boundary",
    "review_sample_boundary",
    "Fountain Pen Network 的 2020 年帖子记录一支具体 91 的 CON-70、No.5 尖、包装和写感；它是样本交叉核对，不覆盖当前所有颜色、尖型、包装或全球市场。",
    S.fpn.key,
    "review post dated 2020-02-09 and sample-specific disclosures",
    "editorial",
    0.9,
  ),
];

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase556-pilot-custom-heritage-91-depth-v1",
  expectedType: "pen",
  expectedSlug: PHASE556_HERITAGE_91_SLUG,
  canonicalName: "百乐 Pilot Custom Heritage 91",
  markdownFile: ".planning/content-research/pilot-custom-heritage-91-phase556.md",
  storyTitle: "Pilot Custom Heritage 91：FKVHN-12SR、No.5 尖与 c/c 供墨边界",
  primarySourceKey: S.catalog.key,
  sources: [...base.sources, ...Object.values(S)],
  scopes: [...base.scopes, scope],
  claims: [...base.claims, ...depthClaims],
  spec: {
    ...base.spec!,
    values: {
      ...base.spec!.values,
      series_name: "Pilot Custom Heritage 91 / FKVHN-12SR",
      release_year:
        "Pilot official history: 2009 Heritage 91 (historic FKVH-1MR); current FKVHN-12SR scope checked 2026-08-09",
      nib: "14K No.5, rhodium-finished; EF/F/SF/FM/SFM/M/SM/B/BB",
      fill_system: "Pilot cartridge; CON-40 and CON-70N compatible",
      material: "resin barrel and cap; silver-tone trim; rhodium-finished nib on current black F SKU",
      dimensions: "maximum diameter 14.7 mm; length 137 mm (current black F SKU page)",
      weight: "15.7 g (current black F SKU page)",
      price_range:
        "No current global price asserted; earlier 2025-10 Japan price snapshot remains historical only",
      status: "current official lineup/catalog and warranty identity checked 2026-08-09",
    },
    evidence: [
      ...base.spec!.evidence,
      specEvidence(
        "phase556-91-spec-brand",
        "brand_entity_id",
        S.lineup.key,
        "PILOT official Heritage lineup",
      ),
      specEvidence(
        "phase556-91-spec-series",
        "series_name",
        S.catalog.key,
        "FKVHN-12SR-BF product title and code",
      ),
      specEvidence(
        "phase556-91-spec-release",
        "release_year",
        S.history.key,
        "official 2009 Heritage 91 / FKVH-1MR history block; historical-code boundary",
      ),
      specEvidence(
        "phase556-91-spec-nib",
        "nib",
        S.lineup.key,
        "official nine-nib lineup",
      ),
      specEvidence(
        "phase556-91-spec-fill",
        "fill_system",
        S.catalog.key,
        "CON-40/CON-70N compatibility row",
      ),
      specEvidence(
        "phase556-91-spec-con70n",
        "fill_system",
        S.con70n.key,
        "CON-70N official push-type and approximately 1.1 ml converter fields",
      ),
      specEvidence(
        "phase556-91-spec-material",
        "material",
        S.catalog.key,
        "resin barrel/cap, silver-tone design and rhodium-finished nib",
      ),
      specEvidence(
        "phase556-91-spec-dimensions",
        "dimensions",
        S.catalog.key,
        "maximum diameter 14.7 mm and length 137 mm",
      ),
      specEvidence(
        "phase556-91-spec-weight",
        "weight",
        S.catalog.key,
        "weight 15.7 g",
      ),
      specEvidence(
        "phase556-91-spec-status",
        "status",
        S.warrantyIndex.key,
        "current warranty identity FKVHN-12SR",
      ),
    ],
  },
  timeline: [
    ...(base.timeline ?? []),
    {
      key: "phase556-91-current-identity",
      title: "FKVHN-12SR current identity rechecked",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Current Pilot lineup, web catalog, warranty index and converter guide were rechecked; historic FKVH-1MR is kept as a dated code context.",
      sourceKey: S.catalog.key,
    },
  ],
};

// The shared CuratedEntityPack ingestion contract requires one brand pack for
// every pen batch. This is the already-canonical Phase 425 Pilot brand pack;
// it refreshes the existing brand's current source marker and never creates a
// new brand entity.
export const phase556PilotCustomHeritage91DepthPacks: CuratedEntityPack[] = [
  structuredClone(pilotBrand),
  pack,
];
