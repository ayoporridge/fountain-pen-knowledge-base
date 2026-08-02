import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase49ViscontiHomoSapiensPacks } from "./phase49-visconti-homo-sapiens";

export const PHASE357_VISCONTI_BRAND_ID = "5BZDt2fQusMf";
export const PHASE357_TARGET_ID = "phase357-visconti-opera-master-savanna";
export const PHASE357_TARGET_SLUG = "visconti-opera-master-savanna";
const RETRIEVED = "2026-08-02";
const SCOPE = "phase357-visconti-opera-master-savanna-current";
const SVG_PATH = "/images/library/site-original/phase357/visconti/opera-master-savanna.svg";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const official = sourceType === "official";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType,
    tier: input.tier ?? (official ? "primary" : "professional_secondary"),
    independenceGroup: input.independenceGroup,
    homepageUrl: input.homepageUrl ?? (official ? "https://www.visconti.it/" : input.url),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    archiveUrl: input.url,
    archiveLocator: sourceType === "user_submission"
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  officialCollection: source({
    key: "phase357-visconti-savanna-official-collection",
    registryKey: "visconti-official-savanna-phase357",
    registryName: "Visconti official",
    title: "Opera Master Savanna — Visconti official collection page",
    url: "https://www.visconti.it/it/collezione-opera-master-savanna.html",
    independenceGroup: "visconti-official-savanna-phase357",
    summary:
      "官方页面把 Opera Master Savanna 作为独立 demonstrator，说明黄棕渐变、车削工艺、oversize、专利 bayonet/Hook Safe closure 与钢笔版 Power Filler Double reservoir；不在此页承诺价格或库存。",
  }),
  officialNibs: source({
    key: "phase357-visconti-nibs-official",
    registryKey: "visconti-official-nibs-phase357",
    registryName: "Visconti official",
    title: "Nibs — Visconti official",
    url: "https://www.visconti.it/en/nibs.html",
    independenceGroup: "visconti-official-nibs-phase357",
    summary:
      "官方 Nibs 页面说明 Visconti 自制 Giotto 18K 与 Giottino 14K 金尖的品牌背景；具体 Savanna A18 18K 和尖宽仍以 2023 catalogue 的 exact SKU 为准。",
  }),
  officialAbout: source({
    key: "phase357-visconti-about-official",
    registryKey: "visconti-official-about-phase357",
    registryName: "Visconti official",
    title: "About us and history — Visconti official",
    url: "https://www.visconti.it/en/about-us.html",
    independenceGroup: "visconti-official-about-phase357",
    summary:
      "官方历史以 1988 年佛罗伦萨为现代 Visconti 起点，并记录 1993 Power Filler 与 1998 Power Filler Double Reservoir 专利时间锚点；不替 Savanna 提供 exact SKU 尺寸。",
  }),
  officialMaterials: source({
    key: "phase357-visconti-materials-official",
    registryKey: "visconti-official-materials-phase357",
    registryName: "Visconti official",
    title: "Techniques and materials — Visconti official",
    url: "https://www.visconti.it/en/tecniche-e-materiali.html",
    independenceGroup: "visconti-official-materials-phase357",
    summary:
      "官方材料页说明 acrylic resin 可经模塑或手工车削形成，并强调颜色和透明度的个体差异；用于解释 Savanna 的树脂工艺，不升级为每支笔的颜色比例。",
  }),
  catalogue: source({
    key: "phase357-visconti-savanna-catalogue",
    registryKey: "manuscript-pen-visconti-2023-phase357",
    registryName: "Manuscript Pen distributor catalogue",
    sourceType: "retailer",
    tier: "contemporary_archive",
    independenceGroup: "manuscript-pen-visconti-2023-phase357",
    title: "Visconti 2023 Collection Catalogue — Opera Master Savanna p.56",
    url: "https://manuscriptpen.com/pub/media/amasty/amfile/attach/A83XRcDGiENCven8yMCNDG73a2CwYgC8.pdf",
    homepageUrl: "https://manuscriptpen.com/",
    author: "Visconti collection catalogue distributed by Manuscript Pen",
    publishedAt: "2023",
    summary:
      "2023 catalogue 第 56 页锁定 Savanna 为 2021 年 888 支限量，编号刻在 blind cap；acrylic resin/brass、palladium、绿色珐琅夹、154.5/140.2 mm、16.3/15 mm、52.3/32.3 g、A18 18KT、Double Reservoir，以及 EEF/F/M/B/Stub 和 roller SKU。",
  }),
  retailer: source({
    key: "phase357-visconti-savanna-shosaikan",
    registryKey: "shosaikan-visconti-savanna-phase357",
    registryName: "Pen Boutique Shosaikan Aoyama",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "shosaikan-visconti-savanna-phase357",
    title: "VISCONTI Opera Master Savanna — Shosaikan Aoyama",
    url: "https://www.shosaikan.co.jp/category/VISCONTI/8055205412754.html",
    homepageUrl: "https://www.shosaikan.co.jp/",
    publishedAt: "2021-08-31",
    summary:
      "日本专业零售页交叉记录 2021/8/31、树脂、18K、M 尖、double-tank power filler、2021 年 888 支、JAN 8055205412754，以及黄棕白 marble resin 的手工独特纹理；价格会变化。",
  }),
  diagram: source({
    key: "phase357-visconti-savanna-svg",
    registryKey: "fountain-pen-graph-editorial-phase357",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase357",
    title: "Visconti Opera Master Savanna factual diagram",
    url: SVG_PATH,
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    summary: "本站原创 factual SVG，表达黄棕白渐变树脂、绿色夹、Hook Safe Lock、Double Reservoir、18K 尖与目录尺度；非产品照片、非 Logo、非比例图、非颜色校样。",
  }),
} as const;

const inheritedBrand = phase49ViscontiHomoSapiensPacks.find(
  (pack) => pack.entityId === PHASE357_VISCONTI_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 357 Visconti brand prerequisite is missing.");

const brand = structuredClone(inheritedBrand);
brand.key = "phase357-visconti-brand-navigation-v4";
brand.markdownFile = ".planning/content-research/visconti-brand-phase357.md";
brand.storyTitle = "Visconti：Homo Sapiens、Opera Master 与具体型号导航";
brand.sources = [...brand.sources, S.officialCollection, S.officialAbout, S.officialMaterials, S.catalogue, S.retailer];
brand.claims = [
  ...brand.claims,
  {
    key: "phase357-visconti-brand-opera-master-navigation",
    predicate: "series_navigation",
    objectText: "Visconti 品牌页新增 Opera Master Savanna 独立入口；它与 Opera Master Polynesia、Antarctica 以及 Homo Sapiens、Rembrandt、Van Gogh 的材料、机构、年份和商品号保持分开。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.officialCollection.key,
    locator: "official Opera Master Savanna page and 2023 catalogue collection navigation",
    evidence: [{ key: "phase357-visconti-brand-opera-master-navigation-evidence", sourceKey: S.officialCollection.key, scopeKey: brand.scopes[0]!.scopeKey, locator: "official collection page names Opera Master Savanna as an independent entry" }],
  },
];

const model: CuratedEntityPack = {
  key: "phase357-visconti-opera-master-savanna-v1",
  entityId: PHASE357_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE357_TARGET_SLUG,
  canonicalName: "Visconti Opera Master Savanna",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/visconti-opera-master-savanna-phase357.md",
  storyTitle: "Visconti Opera Master Savanna：黄棕白渐变与 888 支限量",
  primarySourceKey: S.officialCollection.key,
  depthTier: "A",
  aliases: [
    { alias: "Visconti Opera Master Savanna", language: "en", sourceKey: S.officialCollection.key },
    { alias: "Opera Master Savanna", language: "en", sourceKey: S.catalogue.key },
    { alias: "Visconti Savanna", language: "en", sourceKey: S.retailer.key },
    { alias: "维斯康蒂 Opera Master Savanna", language: "zh", sourceKey: S.officialCollection.key },
    { alias: "维斯康蒂歌剧大师萨凡纳", language: "zh", sourceKey: S.retailer.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Visconti Opera Master Savanna fountain pen",
      validFrom: "2021",
      productionState: "historical",
      nibScope: "A18 18KT gold; EEF, F, M, B and Stub catalogue fountain-pen SKUs",
      materialScope: "turned acrylic resin and brass; palladium coating; enamelled green clip",
      editionScope: "yellow, brown and white Savanna demonstrator; 888 pieces; number engraved on blind cap",
    },
    {
      key: `${SCOPE}-family-boundary`,
      scopeKey: `${SCOPE}-family-boundary`,
      productionState: "historical",
      editionScope: "excludes Opera Master Polynesia and Antarctica, regular Opera, Homo Sapiens, Rembrandt and Van Gogh; rollerball is a sibling SKU, not this fountain pen record",
    },
    {
      key: `${SCOPE}-media`,
      scopeKey: `${SCOPE}-media`,
      productionState: "current",
      editionScope: "site-original factual SVG; not a product photo, logo, scale drawing or colour proof",
    },
  ],
  claims: [
    claim("phase357-identity", "model_identity", "Visconti Opera Master Savanna 是 Opera Master collection 的独立 2021 限量 demonstrator，不是普通 Opera 或 Homo Sapiens 的颜色别名。", S.officialCollection.key, "official collection title and technical description"),
    claim("phase357-design", "design_language", "官方页面以稀树草原旱季的黄色与雨季的棕色渐变解释笔杆和笔帽；专业零售页补充黄、棕、白 marble resin 与手工形成的独特纹理。", S.officialCollection.key, "official Savanna colour narrative", "core"),
    claim("phase357-turning", "material_finish", "Savanna demonstrator 采用车削工艺；2023 catalogue 写 acrylic resin - brass、palladium coating 与绿色珐琅夹，不能把树脂纹理当作每支完全相同的颜色校样。", S.catalogue.key, "catalogue material, trim and clip fields"),
    claim("phase357-edition", "edition_boundary", "2023 catalogue 把 Savanna 锁定为 2021 年 888 支限量，编号刻在 blind cap；这条数量不覆盖 Polynesia、Antarctica 或 rollerball 的其他版本。", S.catalogue.key, "release year, limited edition and engraved number fields"),
    claim("phase357-size", "specification", "目录 fountain pen 数据为闭帽 154.5 mm、最大径 16.3 mm、52.3 g；开帽 140.2 mm、最大径 15 mm、32.3 g。滚珠笔数据另列，不能混入钢笔。", S.catalogue.key, "fountain pen capped and uncapped dimensions"),
    claim("phase357-lock", "cap_mechanism", "官方页面说明 Opera Master 使用 Visconti 专利 bayonet closure；2023 catalogue 将 fountain pen closure 写 Hook Safe Lock，拆装不能按普通螺纹帽暴力旋拧。", S.officialCollection.key, "official bayonet closure and catalogue Hook Safe Lock field"),
    claim("phase357-fill", "filling_system", "钢笔版使用 Power Filler Double Reservoir；它不是 cartridge/converter，清洗和运输应按双储墨结构处理。", S.officialCollection.key, "official fountain pen filling system description"),
    claim("phase357-nib", "nib_options", "2023 catalogue 明确 A18 18KT golden nib，并列 EEF、F、M、B、Stub 五个 fountain pen SKU；Visconti 自制 Giotto/ Giottino 页面只作品牌背景。", S.catalogue.key, "A18 18KT and fountain pen SKU rows"),
    claim("phase357-retailer", "sku_crosscheck", "书斋馆页面记录 2021/8/31 发售、M 尖、18K、double-tank power filler、888 支限定和 JAN 8055205412754；价格不作为稳定事实。", S.retailer.key, "retailer release, nib, filling, edition and JAN fields"),
    claim("phase357-family", "version_boundary", "Opera Master Polynesia 同样是大号 888 支限量，但其年份、颜色与 SKU 不同；Savanna 也不与 Homo Sapiens Lava、Rembrandt 或 Van Gogh 合并。", S.catalogue.key, "catalogue adjacent limited-edition entries", "editorial"),
    claim("phase357-care", "maintenance_guidance", "Power Filler Double Reservoir 用室温清水吸排、排空晾干，避开热水、溶剂和不必要拆解；Hook Safe 与珐琅夹出现异常时交专业维修。", S.officialAbout.key, "Visconti craftsmanship and service boundary", "editorial"),
    claim("phase357-selection", "selection_guidance", "选购时保存尖宽、KP28-02 SKU、EAN/JAN、blind cap 编号、盒子和身份卡；实际颜色、价格、现货和维修条件按卖家与地区复核。", S.retailer.key, "exact SKU and market boundary", "editorial"),
    claim("phase357-media", "media_identity_boundary", "主图为本站原创 factual SVG，非产品照片、非 Logo、非比例图、非颜色校样，不证明某支实物的颜色分布或库存。", S.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase357-savanna-edition-888", name: "Savanna 2021 · 888-piece edition", notes: "黄、棕、白渐变 demonstrator；编号刻在 blind cap。", releaseYear: "2021", sourceKey: S.catalogue.key, variantKind: "edition_group", market: "Visconti catalogue" },
    { key: "phase357-savanna-eef", name: "Savanna EEF fountain pen", notes: "A18 18KT golden nib；SKU KP28-02-FPEF。", releaseYear: "2021", sourceKey: S.catalogue.key, variantKind: "nib", productCode: "KP28-02-FPEF", market: "Visconti catalogue" },
    { key: "phase357-savanna-f", name: "Savanna F fountain pen", notes: "A18 18KT golden nib；SKU KP28-02-FPF。", releaseYear: "2021", sourceKey: S.catalogue.key, variantKind: "nib", productCode: "KP28-02-FPF", market: "Visconti catalogue" },
    { key: "phase357-savanna-m", name: "Savanna M fountain pen", notes: "A18 18KT golden nib；SKU KP28-02-FPM，JAN 8055205412754。", releaseYear: "2021", sourceKey: S.retailer.key, variantKind: "nib", productCode: "KP28-02-FPM", market: "Shosaikan Aoyama" },
    { key: "phase357-savanna-b", name: "Savanna B fountain pen", notes: "A18 18KT golden nib；SKU KP28-02-FPB。", releaseYear: "2021", sourceKey: S.catalogue.key, variantKind: "nib", productCode: "KP28-02-FPB", market: "Visconti catalogue" },
    { key: "phase357-savanna-stub", name: "Savanna Stub fountain pen", notes: "A18 18KT golden nib；SKU KP28-02-FPS。", releaseYear: "2021", sourceKey: S.catalogue.key, variantKind: "nib", productCode: "KP28-02-FPS", market: "Visconti catalogue" },
  ],
  spec: {
    brandEntityId: PHASE357_VISCONTI_BRAND_ID,
    values: {
      series_name: "Visconti Opera Master Savanna",
      release_year: "2021",
      origin_country: "Florence, Italy; Visconti current brand context",
      nib: "A18 18KT gold; EEF/F/M/B/Stub catalogue fountain-pen SKUs",
      fill_system: "Power Filler Double Reservoir",
      material: "turned acrylic resin and brass; palladium coating; enamelled green clip",
      dimensions: "154.5 mm capped / 140.2 mm uncapped; 16.3 mm / 15 mm diameter",
      weight: "52.3 g capped / 32.3 g uncapped in 2023 catalogue",
      status: "2021 limited edition of 888; engraved blind-cap number; availability varies",
    },
    evidence: [
      evidence("phase357-brand", "brand_entity_id", S.officialCollection.key, "Visconti official collection context"),
      evidence("phase357-series", "series_name", S.officialCollection.key, "Opera Master Savanna title"),
      evidence("phase357-release", "release_year", S.catalogue.key, "2021 catalogue release-year field"),
      evidence("phase357-origin", "origin_country", S.officialAbout.key, "Florence founding and current brand context"),
      evidence("phase357-nib", "nib", S.catalogue.key, "A18 18KT nib and five fountain SKU rows"),
      evidence("phase357-fill", "fill_system", S.catalogue.key, "Power Filler Double Reservoir field"),
      evidence("phase357-material", "material", S.catalogue.key, "acrylic resin, brass, palladium and green clip fields"),
      evidence("phase357-dimensions", "dimensions", S.catalogue.key, "capped and uncapped fountain pen measurements"),
      evidence("phase357-weight", "weight", S.catalogue.key, "capped and uncapped fountain pen weights"),
      evidence("phase357-status", "status", S.catalogue.key, "888-piece limited edition and availability boundary"),
    ],
  },
  timeline: [
    {
      key: "phase357-savanna-release",
      title: "Opera Master Savanna 进入限量目录",
      eventType: "model_released",
      startDate: "2021",
      circa: false,
      description: "2023 catalogue 与日本专业零售页共同把 Savanna 锁定为 2021 年限量版本；精确地区上架日只适用于零售页记录。",
      sourceKey: S.catalogue.key,
    },
  ],
  media: [
    {
      key: "phase357-savanna-primary-media",
      title: "Visconti Opera Master Savanna 事实图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export const phase357ViscontiOperaMasterSavannaPacks: CuratedEntityPack[] = [brand, model];
