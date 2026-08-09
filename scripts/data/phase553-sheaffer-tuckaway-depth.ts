import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import { phase446SheafferSchonNahvalurBrandPacks } from "./phase446-sheaffer-schon-nahvalur-brand-depth";
import {
  PHASE62_TUCKAWAY_ID,
  phase62SheafferPacks,
} from "./phase62-sheaffer-p0";

const RETRIEVED = "2026-08-09";
export const PHASE553_TUCKAWAY_ID = PHASE62_TUCKAWAY_ID;
export const PHASE553_TUCKAWAY_SLUG = "sheaffer-tuckaway";
export const PHASE553_SHEAFFER_ID = "tVXnzDSFCcPP";

const base = phase62SheafferPacks.find(
  (pack) =>
    pack.entityId === PHASE553_TUCKAWAY_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 553 Sheaffer Tuckaway base pack is missing.");

const sheafferBrand = phase446SheafferSchonNahvalurBrandPacks.find(
  (pack) =>
    pack.entityId === PHASE553_SHEAFFER_ID && pack.expectedType === "brand",
);
if (!sheafferBrand) throw new Error("Phase 553 Sheaffer brand pack is missing.");

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
  tuckawayArchive: web({
    key: "phase553-ravens-march-tuckaway",
    title: "Ravens March Fountain Pens: Tuckaway",
    url: "https://dirck.delint.ca/beta/?page_id=3028",
    registryKey: "ravens-march-tuckaway-phase553",
    registryName: "Ravens March Fountain Pens",
    tier: "professional_secondary",
    sourceType: "blog",
    independenceGroup: "ravens-march-tuckaway-phase553",
    summary:
      "档案记录 1940 无夹杠杆金属体、尾端螺纹加帽，1942 Triumph 变体，约 1945 clasp，1951 Sentinel 收尾，1940–1951 生产窗口，以及 celluloid/Forticel 与 Vacuum/Touchdown 的资料范围估计。",
    locator:
      "Tuckaway page paragraphs on introduction, 1940 lever/metal clipless form, 1942 Triumph variants, circa 1945 clasp, 1951 Sentinel, production run, size, point, body and filler estimates",
  }),
  penheroTaxonomy: web({
    key: "phase553-penhero-sheaffer-taxonomy-1946",
    title: "PenHero: Taxonomy of Late 1940s Sheaffer Models: 1945–1946",
    url: "https://www.penhero.com/PenGallery/Sheaffer/SheafferTaxonomy1946.htm",
    registryKey: "penhero-sheaffer-taxonomy-1946-phase553",
    registryName: "PenHero",
    tier: "professional_secondary",
    sourceType: "blog",
    independenceGroup: "penhero-sheaffer-taxonomy-1946-phase553",
    summary:
      "专业分类把 1942 Triumph、战争期 Tuckaway、战后 Tuckaway 与同 trim 名称分开，并说明 1945–1949 期间弹簧夹和帽件持续改进；名称是 trim 线索，不替代逐支鉴定。",
    locator:
      "lines 17–25 and 33–51: wartime Triumph, Triumph Tuckaway, postwar names/trim, Tuckaway variations and spring-loaded clip development",
  }),
  collectorLibrary: web({
    key: "phase553-pca-sheaffer-reference-library",
    title: "Pen Collectors of America: Sheaffer reference library",
    url: "https://pencollectorsofamerica.org/sheaffer/",
    registryKey: "pca-sheaffer-reference-library-phase553",
    registryName: "Pen Collectors of America",
    tier: "contemporary_archive",
    sourceType: "blog",
    independenceGroup: "pca-sheaffer-reference-library-phase553",
    summary:
      "参考库列出 1940、1941–42、1945–51 Sheaffer 目录、广告、维修手册和服务政策，是核对 Tuckaway 年代与原始档案的入口；本页不把目录索引冒充单支规格。",
    locator:
      "Sheaffer reference-library entries for Jul 1940, 1941–42, 1945, 1946, 1947, 1948, 1949, Jan 1951 catalogues and repair manuals",
  }),
  penheroAgio: web({
    key: "phase553-penhero-agio-tuckaway-history",
    title: "PenHero: Sheaffer Agio Compact 2004 — Return Of The Tucky",
    url: "https://penhero.com/PenGallery/Sheaffer/SheafferAgioCompact.htm",
    registryKey: "penhero-agio-tuckaway-history-phase553",
    registryName: "PenHero",
    tier: "professional_secondary",
    sourceType: "blog",
    independenceGroup: "penhero-agio-tuckaway-history-phase553",
    summary:
      "独立文章交叉核对 1940 clipless/threaded-tail 形式与 1942 Triumph/shorty clip 变化；文章以历史回顾为主，不提供全族统一尺寸或供墨规格。",
    locator:
      "lines 78–96: 1940 Tuckaway history, clipless threaded tail, 1942 Triumph nib and shorty clip; later Compact Cartridge comparison kept separate",
  }),
} satisfies Record<string, CuratedSource>;

const scope: CuratedScope = {
  key: "phase553-sheaffer-tuckaway-historical-depth",
  scopeKey: "phase553-sheaffer-tuckaway-historical-depth",
  validFrom: RETRIEVED,
  productionState: "historical",
  market: "Sheaffer historical catalogues and surviving Tuckaway samples",
  nibScope:
    "Open and Triumph points both occur in the family; point material, imprint and width remain variant/sample scoped",
  materialScope:
    "Early metal body and later celluloid/Forticel context are source-scoped; trim and overlay are not family defaults",
  editionScope:
    "1940–1951 family route covering lever, Vacuum-Fil, Triumph and Touchdown stages; Tuckaway-only and shared trim names remain separate evidence paths",
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
    "phase553-tuckaway-family-identity",
    "model_identity",
    "Tuckaway 是 1940 年前后由 Sheaffer 推出的短身便携家族，设计重点是合帽收纳与加帽书写；短身本身不能把所有时期和 trim 合成一个固定 SKU。",
    S.tuckawayArchive.key,
    S.tuckawayArchive.summary,
  ),
  claim(
    "phase553-tuckaway-1940-boundary",
    "version_boundary",
    "早期形式是杠杆填充、金属笔身、无夹无环并带尾端阶梯螺纹；1942 Triumph 之后出现更接近全尺寸轮廓、开放式和 Triumph 尖的不同变体。",
    S.tuckawayArchive.key,
    "1940 lever/metal clipless form and 1942 Triumph transition",
  ),
  claim(
    "phase553-tuckaway-wartime-trim",
    "historical_naming_boundary",
    "1942–1945 战争期 Triumph Tuckaway 与 1945–1949 战后 Tuckaway、Lady Sheaffer、Sovereign、Admiral、Craftsman 等名称存在 trim 交叉；名称不能独立证明笔尖、帽材或供墨。",
    S.penheroTaxonomy.key,
    S.penheroTaxonomy.summary,
  ),
  claim(
    "phase553-tuckaway-clasp-boundary",
    "clip_identity",
    "约 1945 年起出现小型 spring-loaded clasp；它常被误称为 military clip，但两者不是同一结构，夹子只能作为组合识别线索。",
    S.tuckawayArchive.key,
    "circa 1945 clasp versus military clip distinction",
  ),
  claim(
    "phase553-tuckaway-filler-boundary",
    "filling_system_boundary",
    "Tuckaway 跨越杠杆、Vacuum-Fil 与 Touchdown；三套机构的密封、清洗和维修风险不同，不能因为都属于短身 Sheaffer 就共用教程。",
    S.tuckawayArchive.key,
    "lever, Vacuum and Touchdown filler lines and separate capacity estimates",
  ),
  claim(
    "phase553-tuckaway-material-boundary",
    "material_transition",
    "资料把笔身材料从 1947 年以前的 celluloid 延伸到其后的 Forticel；金属体、overlay、帽材和颜色仍按实物与目录分别核对。",
    S.tuckawayArchive.key,
    "body material line: celluloid until 1947, then Forticel",
  ),
  claim(
    "phase553-tuckaway-size-boundary",
    "sample_specification_boundary",
    "Vacuum 与 Touchdown 的长度、容量数字是来源所列的家族/样本估计，不发布覆盖所有尖、帽材和 trim 的固定尺寸或墨量。",
    S.tuckawayArchive.key,
    "source-specific Vacuum and Touchdown size/capacity estimates",
  ),
  claim(
    "phase553-tuckaway-archive-route",
    "primary_archive_route",
    "PCA Sheaffer 参考库列出 1940、1941–42、1945–1951 目录和维修手册，可作为进一步核对具体 Tuckaway 年代、trim 与机构的原始资料入口；目录索引不等于单支实物规格。",
    S.collectorLibrary.key,
    S.collectorLibrary.summary,
  ),
  claim(
    "phase553-tuckaway-maintenance",
    "maintenance_boundary",
    "维护时先按杠杆、Vacuum-Fil 或 Touchdown 确认机构，再用室温清水低压吸排；裂纹、漏气、硬化密封、卡死尾端或不明后配件应停止操作并交给熟悉老 Sheaffer 的维修者。",
    S.tuckawayArchive.key,
    "distinct filler systems and historical-pen repair boundary",
    "editorial",
    0.95,
  ),
  claim(
    "phase553-tuckaway-selection",
    "selection_guidance",
    "选购应优先索取闭帽、加帽、尖顶/尖底、填充端、帽口内侧和刻字照片，并确认修复记录；稀有颜色、金色外观或卖家年代标题不足以证明版本和尖材。",
    S.penheroTaxonomy.key,
    "trim names and continuously revised components require multi-view identification",
    "editorial",
    0.95,
  ),
];

const depthVariants: NonNullable<CuratedEntityPack["variants"]> = [
  {
    key: "phase553-tuckaway-1940-lever-metal",
    name: "1940 early lever-fill metal body",
    releaseYear: "1940",
    notes: "早期无夹无环、尾端阶梯螺纹的便携形式；杠杆、金属体和具体 overlay 需看实物。",
    sourceKey: S.tuckawayArchive.key,
    variantKind: "variant",
  },
  {
    key: "phase553-tuckaway-triumph-wartime",
    name: "1942–1945 Triumph Tuckaway",
    releaseYear: "1942–1945",
    notes: "战争期 Triumph 语境的短身路线；开放式与 Triumph 尖、广告名称和限量生产不互相代换。",
    sourceKey: S.penheroTaxonomy.key,
    variantKind: "variant",
  },
  {
    key: "phase553-tuckaway-clasp-postwar",
    name: "约 1945 起的 clasp / postwar trim",
    releaseYear: "约1945–1949",
    notes: "spring-loaded clasp 与战后更圆润的帽件；不称作 military clip，也不由夹子单独决定 Sovereign/Lady Sheaffer 等名称。",
    sourceKey: S.tuckawayArchive.key,
    variantKind: "edition_group",
  },
  {
    key: "phase553-tuckaway-vacuum",
    name: "Vacuum-Fil route",
    releaseYear: "1940s",
    notes: "柱塞和密封路线；来源所列约 11.5 cm 闭帽、13.3 cm 加帽、9.6 cm 无帽和约 1.0 ml 只作范围估计。",
    sourceKey: S.tuckawayArchive.key,
    variantKind: "variant",
  },
  {
    key: "phase553-tuckaway-touchdown-sentinel",
    name: "Touchdown / 1951 Sentinel route",
    releaseYear: "约1949–1951",
    notes: "后期气压上墨与 Sentinel trim 的收尾路线；约 11.9 cm 闭帽、13.6 cm 加帽、10.0 cm 无帽和约 0.6 ml 为来源估计。",
    sourceKey: S.tuckawayArchive.key,
    variantKind: "edition_group",
  },
  {
    key: "phase553-tuckaway-celluloid-forticel",
    name: "Celluloid / Forticel material route",
    releaseYear: "1940s",
    notes: "资料以 1947 年前后作材料边界线索；颜色、overlay 与帽材不能由此跨版本补猜。",
    sourceKey: S.tuckawayArchive.key,
    variantKind: "material",
  },
];

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase553-sheaffer-tuckaway-depth-v1",
  expectedType: "pen",
  expectedSlug: PHASE553_TUCKAWAY_SLUG,
  canonicalName: "Sheaffer Tuckaway",
  markdownFile: ".planning/content-research/sheaffer-tuckaway.md",
  storyTitle: "Sheaffer Tuckaway：短身、加帽书写与多套上墨机构",
  primarySourceKey: S.tuckawayArchive.key,
  sources: [
    ...base.sources,
    S.tuckawayArchive,
    S.penheroTaxonomy,
    S.collectorLibrary,
    S.penheroAgio,
  ],
  scopes: [...base.scopes, scope],
  claims: [...base.claims, ...depthClaims],
  variants: [...(base.variants ?? []), ...depthVariants],
  spec: {
    brandEntityId: PHASE553_SHEAFFER_ID,
    values: {
      ...(base.spec?.values ?? {}),
      series_name: "Sheaffer Tuckaway family（1940–1951；阶段与 trim 分开）",
      release_year: "1940 起；资料生产窗口约 1940–1951",
      origin_country: "美国 Sheaffer / Fort Madison 产品史语境；具体批次和刻字按实物核对",
      nib: "开放式与 Triumph 尖均有资料范围；14K gold / platinum-mask 只绑定对应版本证据",
      fill_system: "杠杆、Vacuum-Fil 与后期 Touchdown 路线并存；不可按短身统一",
      material: "早期金属体；资料记 1947 年前后 celluloid 到 Forticel 的变化，overlay/帽材按版本",
      dimensions: "Vacuum/Touchdown 的来源估计约 9.6–13.6 cm（状态与测量姿态需标注），不设全族固定值",
      status: "历史家族；约 1940–1951，具体 trim、尖和机构按目录/实物确认",
    },
    evidence: [
      ...(base.spec?.evidence ?? []),
      specEvidence(
        "phase553-tuckaway-spec-brand",
        "brand_entity_id",
        S.tuckawayArchive.key,
        "Sheaffer maker identity on Tuckaway archive",
      ),
      specEvidence(
        "phase553-tuckaway-spec-series",
        "series_name",
        S.tuckawayArchive.key,
        "1940 introduction, Tuckaway naming and family route",
      ),
      specEvidence(
        "phase553-tuckaway-spec-release",
        "release_year",
        S.tuckawayArchive.key,
        "1940 introduction and 1940–1951 production run",
      ),
      specEvidence(
        "phase553-tuckaway-spec-origin",
        "origin_country",
        S.collectorLibrary.key,
        "Sheaffer catalog and repair archive context; no batch-level factory inference",
      ),
      specEvidence(
        "phase553-tuckaway-spec-nib",
        "nib",
        S.tuckawayArchive.key,
        "open or Triumph point and source-scoped 14K/platinum-mask description",
      ),
      specEvidence(
        "phase553-tuckaway-spec-fill",
        "fill_system",
        S.tuckawayArchive.key,
        "lever, Vacuum and Touchdown filler routes",
      ),
      specEvidence(
        "phase553-tuckaway-spec-material",
        "material",
        S.tuckawayArchive.key,
        "metal body, celluloid until 1947 and Forticel after source boundary",
      ),
      specEvidence(
        "phase553-tuckaway-spec-dimensions",
        "dimensions",
        S.tuckawayArchive.key,
        "source-specific Vacuum/Touchdown size estimates; no universal fixed dimension",
      ),
      specEvidence(
        "phase553-tuckaway-spec-status",
        "status",
        S.tuckawayArchive.key,
        "1940–1951 production window and late Sentinel route",
      ),
    ],
  },
  media: base.media,
  timeline: [
    ...(base.timeline ?? []),
    {
      key: "phase553-tuckaway-1940",
      title: "Tuckaway 短身便携家族出现",
      eventType: "model_released",
      startDate: "1940",
      circa: false,
      description: "早期杠杆、金属体、无夹无环和尾端螺纹构成加帽书写的便携路线。",
      sourceKey: S.tuckawayArchive.key,
    },
    {
      key: "phase553-tuckaway-1942-triumph",
      title: "Triumph Tuckaway 路线",
      eventType: "design_milestone",
      startDate: "1942",
      circa: false,
      description: "Triumph 尖与更接近全尺寸的笔身进入战争期 Tuckaway 语境。",
      sourceKey: S.penheroTaxonomy.key,
    },
    {
      key: "phase553-tuckaway-1951-sentinel",
      title: "Sentinel Tuckaway 的目录收尾",
      eventType: "discontinued",
      startDate: "1951",
      circa: false,
      description: "资料在 1951 目录中仍见 Sentinel trim 的 Tuckaway；生产窗口随后结束。",
      sourceKey: S.tuckawayArchive.key,
    },
  ],
};

if (pack.entityId !== PHASE553_TUCKAWAY_ID || pack.expectedSlug !== PHASE553_TUCKAWAY_SLUG) {
  throw new Error("Phase 553 Tuckaway pack identity drifted.");
}

export const phase553SheafferTuckawayDepthPacks: CuratedEntityPack[] = [
  sheafferBrand,
  pack,
];
