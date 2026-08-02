import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase147AuroraTalentumPacks } from "./phase147-aurora-talentum";

export const PHASE356_AURORA_BRAND_ID = "CJXe8UpnkHLJ";
export const PHASE356_TARGET_ID = "phase356-aurora-ottantotto-ebonite";
export const PHASE356_TARGET_SLUG = "aurora-ottantotto-ebonite";
const RETRIEVED = "2026-08-02";
const SCOPE = "phase356-aurora-ottantotto-ebonite-current";
const SVG_PATH = "/images/library/site-original/phase356/aurora/ottantotto-ebonite.svg";

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
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType,
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.independenceGroup,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://aurorapen.it/" : input.url),
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

const SOURCES = {
  category: source({
    key: "phase356-aurora-ebonite-category",
    registryKey: "aurora-official-ebonite-category-phase356",
    registryName: "Aurora official",
    title: "Ottantotto Ebanite — Aurora official limited-edition category",
    url: "https://aurorapen.it/categoria-prodotto/edizioni-limitate/ottantotto-ebanite/",
    independenceGroup: "aurora-official-ebonite-category-phase356",
    summary:
      "官方当前目录页把 Ottantotto Ebanite 作为独立限量版本，说明 ebonite、大理石纹理、四色蓝／黄／洋红／cognac、铬色饰件和 18 kt 实金铑处理尖，并提供具体颜色 collateral 入口。",
  }),
  bluePdf: source({
    key: "phase356-aurora-ebonite-blue-pdf",
    registryKey: "aurora-official-ebonite-blue-pdf-phase356",
    registryName: "Aurora official",
    title: "88 Ebanite Blu V02 product sheet",
    url: "https://aurorapen.it/wp-content/uploads/2025/08/88-Ebanite-Blu.pdf",
    independenceGroup: "aurora-official-ebonite-blue-pdf-phase356",
    tier: "contemporary_archive",
    summary:
      "官方蓝色 V02 PDF 写出蓝色大理石硬橡胶、18 kt 铑处理实金尖、铬色饰件、产品代码 888-CEB，并保留“3 colours”的较早口径；不把排版相邻 888 当成限量总数。",
  }),
  yellowPdf: source({
    key: "phase356-aurora-ebonite-yellow-pdf",
    registryKey: "aurora-official-ebonite-yellow-pdf-phase356",
    registryName: "Aurora official",
    title: "88 Ebanite Gialla V02 product sheet",
    url: "https://aurorapen.it/wp-content/uploads/2025/08/88-Ebanite-Gialla.pdf",
    independenceGroup: "aurora-official-ebonite-yellow-pdf-phase356",
    tier: "contemporary_archive",
    summary:
      "官方黄色 V02 PDF 写出黄色大理石硬橡胶、18 kt 实金尖、金色饰件、产品代码 888-DEY，并与蓝色 PDF 同样出现“3 colours”口径；只锁定该颜色 collateral。",
  }),
  history: source({
    key: "phase356-aurora-history",
    registryKey: "aurora-official-history-phase356",
    registryName: "Aurora official",
    title: "La Nostra Storia — Aurora official",
    url: "https://aurorapen.it/la-nostra-storia/",
    independenceGroup: "aurora-official-history-phase356",
    summary:
      "官方历史页说明 Aurora 1919 年在 Torino 建立，并将 1947 年 Marcello Nizzoli 设计的 88 作为仍在生产的经典家族锚点；不替当前 Ebanite 提供 SKU 参数。",
  }),
  faq: source({
    key: "phase356-aurora-faq",
    registryKey: "aurora-official-faq-phase356",
    registryName: "Aurora official",
    title: "FAQ — Aurora fountain pen nibs and filling systems",
    url: "https://aurorapen.it/faq/",
    independenceGroup: "aurora-official-faq-phase356",
    summary:
      "Aurora FAQ 将 88 置于高端 14K 笔尖范围，说明 ebonite feed、活塞、隐藏备用墨仓与活塞上墨步骤；这些是产品线范围，不升级为 Ebanite exact 容量或库存。",
  }),
  penAddict: source({
    key: "phase356-aurora-88-pen-addict",
    registryKey: "pen-addict-phase356",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict-phase356",
    homepageUrl: "https://penaddict.squarespace.com/",
    author: "The Pen Addict editorial",
    title: "Aurora 88 Sole Fountain Pen review",
    url: "https://penaddict.squarespace.com/blog/2016/9/30/aurora-88-sole-fountain-pen-a-review",
    summary:
      "专业评测对一支现代 Aurora 88 样本给出约 133 mm 闭帽、128 mm 未插帽、155 mm 后插及 ebonite feed 观察；只作家族手感和测量样本，不替 Ebanite exact SKU。",
    publishedAt: "2016-09-30",
  }),
  fountainPenIt: source({
    key: "phase356-aurora-88-history-specialist",
    registryKey: "fountainpen-it-aurora-phase356",
    registryName: "FountainPen.it",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "fountainpen-it-aurora-phase356",
    homepageUrl: "https://fountainpen.it/",
    author: "FountainPen.it contributors",
    title: "Aurora 88 — historical and technical reference",
    url: "https://fountainpen.it/Aurora_88",
    summary:
      "专业资料记录早期 88 的活塞、硬橡胶／赛璐珞／金属帽材料变化与版本边界；只用于历史交叉，不把战后零件尺寸或氧化状态写进当前 Ebanite。",
  }),
  diagram: source({
    key: "phase356-aurora-ebonite-svg",
    registryKey: "fountain-pen-graph-editorial-phase356",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase356",
    homepageUrl: "/",
    title: "Aurora Ottantotto Ebanite factual diagram",
    url: SVG_PATH,
    summary: "本站原创事实 SVG，表达硬橡胶、大理石纹理、18K 尖、活塞和颜色数量冲突；非产品照片、非 Logo、非比例图、非颜色校样。",
  }),
} as const;

const model: CuratedEntityPack = {
  key: "phase356-aurora-ottantotto-ebonite-v1",
  entityId: PHASE356_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE356_TARGET_SLUG,
  canonicalName: "Aurora Ottantotto Ebanite（88 Ebanite）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/aurora-ottantotto-ebanite-phase356.md",
  storyTitle: "Aurora Ottantotto Ebanite：88 的硬橡胶限量版本",
  primarySourceKey: SOURCES.category.key,
  depthTier: "A",
  aliases: [
    { alias: "Aurora Ottantotto Ebanite", language: "it", sourceKey: SOURCES.category.key },
    { alias: "Aurora 88 Ebanite", language: "en", sourceKey: SOURCES.category.key },
    { alias: "Aurora 88 ebonite", language: "en", sourceKey: SOURCES.bluePdf.key },
    { alias: "Aurora 88 硬橡胶", language: "zh", sourceKey: SOURCES.category.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Aurora official Ottantotto Ebanite limited-edition category",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "18K solid gold; rhodium treatment and trim finish vary by colour SKU",
      materialScope: "marbled ebonite body and cap; chrome or gold trims by colour SKU",
      editionScope: "current category page lists blue, yellow, magenta and cognac; V02 PDFs retain an older three-colour collateral statement",
    },
    {
      key: `${SCOPE}-family-boundary`,
      scopeKey: `${SCOPE}-family-boundary`,
      productionState: "historical",
      editionScope: "excludes Ottantotto Resina 800, Ottantotto Millerighe and early post-war Aurora 88 materials and parts",
    },
    {
      key: `${SCOPE}-measurement-boundary`,
      scopeKey: `${SCOPE}-measurement-boundary`,
      productionState: "unknown",
      editionScope: "133 mm capped measurement is a modern 88 family sample; exact Ebanite dimensions and weight remain unasserted",
    },
    {
      key: `${SCOPE}-media`,
      scopeKey: `${SCOPE}-media`,
      productionState: "current",
      editionScope: "site-original factual SVG; not a product photo, logo, scale drawing or colour proof",
    },
  ],
  claims: [
    claim("phase356-identity", "model_identity", "Aurora Ottantotto Ebanite 是官方限量目录中的独立 88 硬橡胶版本，不是 Ottantotto Resina 800 或 Millerighe 的普通颜色别名。", SOURCES.category.key, "official Ottantotto Ebanite category title and description"),
    claim("phase356-material", "material_finish", "当前官方页面写明 ebonite 与大理石纹理；页面列出蓝、黄、洋红和 cognac 四种颜色，并说明配铬色饰件与 18 kt 实金铑处理尖。", SOURCES.category.key, "current category description and four-colour list"),
    claim("phase356-blue-sku", "sku_boundary", "蓝色 V02 PDF 锁定 888-CEB、蓝色大理石硬橡胶、铬色饰件与铑处理 18K 尖；不能把蓝色 SKU 的 finish 覆盖其他颜色。", SOURCES.bluePdf.key, "V02 blue product code and description"),
    claim("phase356-yellow-sku", "sku_boundary", "黄色 V02 PDF 锁定 888-DEY、黄色大理石硬橡胶、金色饰件与 18K 实金尖；不能把排版相邻的 888 当成限量总数。", SOURCES.yellowPdf.key, "V02 yellow product code and description"),
    claim("phase356-count-conflict", "source_conflict", "当前分类页列四色，而蓝／黄 V02 PDF 写三种颜色；采用当前分类页作为导航层，保留 PDF 为较早 collateral，并要求 exact SKU 与日期复核。", SOURCES.category.key, "current category versus V02 linked collateral", "editorial"),
    claim("phase356-piston", "filling_system", "Aurora FAQ 将 88 放在高端活塞线，并给出浸尖、旋转尾部、排出余墨的上墨步骤；隐藏备用墨仓是产品线范围，不写成 Ebanite 的精确容量。", SOURCES.faq.key, "high-end piston and hidden reserve FAQ steps"),
    claim("phase356-nib", "nib_options", "官方 Ebanite 页面与 V02 PDF 均明确 18K 实金尖；铑处理或金色饰件按颜色 SKU 锁定，不把普通 88 的尖宽或 flex 传给本版本。", SOURCES.category.key, "18 kt solid-gold nib and finish context"),
    claim("phase356-history", "historical_context", "Aurora 官方历史页把 1947 年 Marcello Nizzoli 设计的 88 作为家族锚点；FountainPen.it 的早期材料与活塞记录只作历史交叉，不证明当前限量版沿用战后零件。", SOURCES.history.key, "1947 Nizzoli 88 history and family continuity"),
    claim("phase356-measurement", "measurement_boundary", "Pen Addict 对现代 88 样本测得约 133 mm 闭帽、128 mm 未插帽、155 mm 后插；Ebanite exact 页面未给完整尺寸，因此只能作家族样本参考。", SOURCES.penAddict.key, "modern Aurora 88 sample measurements"),
    claim("phase356-selection", "selection_guidance", "选购时保存完整颜色、饰件、产品代码、尖刻字、盒装与订单日期；硬橡胶收藏者比较 Ebanite，日常补货者再与 Resina 800、Millerighe 试写。", SOURCES.category.key, "variant and exact-SKU verification boundary", "editorial"),
    claim("phase356-care", "maintenance_guidance", "活塞换墨用室温清水吸排，硬橡胶与镀层避免热水、酒精和研磨剂；尾部阻滞、裂纹或漏墨应交 Aurora 或专业维修者。", SOURCES.faq.key, "official piston steps and material-sensitive editorial care", "editorial"),
    claim("phase356-media", "media_identity_boundary", "主图为本站原创 factual SVG，非产品照片、非 Logo、非比例图、非颜色校样，也不证明限量总数或库存。", SOURCES.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase356-ebonite-blue", name: "Blue marbled ebonite", notes: "当前目录四色之一；V02 collateral code 888-CEB，铬色饰件与铑处理 18K 尖。", sourceKey: SOURCES.bluePdf.key, variantKind: "color", productCode: "888-CEB", market: "Aurora official" },
    { key: "phase356-ebonite-yellow", name: "Yellow marbled ebonite", notes: "当前目录四色之一；V02 collateral code 888-DEY，金色饰件与 18K 尖。", sourceKey: SOURCES.yellowPdf.key, variantKind: "color", productCode: "888-DEY", market: "Aurora official" },
    { key: "phase356-ebonite-magenta", name: "Magenta marbled ebonite", notes: "当前目录列出的颜色；具体代码、finish 与库存需按订单页面核对。", sourceKey: SOURCES.category.key, variantKind: "color", market: "Aurora official" },
    { key: "phase356-ebonite-cognac", name: "Cognac marbled ebonite", notes: "当前目录列出的颜色；具体代码、finish 与库存需按订单页面核对。", sourceKey: SOURCES.category.key, variantKind: "color", market: "Aurora official" },
  ],
  spec: {
    brandEntityId: PHASE356_AURORA_BRAND_ID,
    values: {
      series_name: "Aurora 88 / Ottantotto Ebanite",
      release_year: "current category page and V02 collateral retrieved 2026-08-02; exact launch year not asserted",
      origin_country: "Turin, Italy; Aurora current manufacturing context",
      nib: "18K solid gold; rhodium-treated on blue/chrome-trim collateral, finish varies by colour SKU",
      fill_system: "piston filling; Aurora FAQ high-end piston and hidden reserve scope",
      material: "marbled ebonite body and cap; chrome or gold trims by colour SKU",
      dimensions: "Aurora 88 family sample approximately 133 mm capped; exact Ebanite specimen dimensions to verify",
      weight: "exact Ebanite SKU weight not published in cited official page",
      status: "current Aurora Ottantotto Ebanite limited-edition category; colours, price and stock vary",
    },
    evidence: [
      evidence("phase356-brand", "brand_entity_id", SOURCES.category.key, "Aurora official product context"),
      evidence("phase356-series", "series_name", SOURCES.category.key, "Ottantotto Ebanite title"),
      evidence("phase356-release", "release_year", SOURCES.bluePdf.key, "V02 collateral retrieved date; no launch-year claim"),
      evidence("phase356-origin", "origin_country", SOURCES.history.key, "Turin and Aurora official history"),
      evidence("phase356-nib", "nib", SOURCES.category.key, "18 kt solid-gold nib field"),
      evidence("phase356-fill", "fill_system", SOURCES.faq.key, "high-end piston loading guidance"),
      evidence("phase356-material", "material", SOURCES.category.key, "ebonite and marbled finish fields"),
      evidence("phase356-dimensions", "dimensions", SOURCES.penAddict.key, "modern 88 family sample measurement; exact Ebanite unknown"),
      evidence("phase356-weight", "weight", SOURCES.category.key, "exact Ebanite weight not published"),
      evidence("phase356-status", "status", SOURCES.category.key, "current limited-edition category and variable stock"),
      evidence("phase356-colour-conflict-yellow", "status", SOURCES.yellowPdf.key, "V02 yellow collateral says three colours; conflict member only"),
    ],
  },
  timeline: [
    {
      key: "phase356-ebonite-collateral-context",
      title: "88 Ebanite 形成当前限量版目录语境",
      eventType: "model_released",
      startDate: "2025",
      circa: true,
      description: "官方 V02 单色资料页位于 2025/08 路径，当前分类页随后保留四色导航；文件日期不被当作精确首发年份。",
      sourceKey: SOURCES.bluePdf.key,
    },
  ],
  conflicts: [
    {
      key: "phase356-ebonite-colour-count-conflict",
      fieldKey: "variants",
      scopeKey: SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote: "采用当前官方分类页的四色导航；蓝／黄 V02 PDF 的三色句子保留为较早 collateral 口径，具体购买仍按 exact SKU 与日期核对。",
      members: [
        { citationKey: "phase356-series", assertedValue: "four colours: blue, yellow, magenta and cognac" },
        { citationKey: "phase356-release", assertedValue: "blue V02 collateral says three colours" },
        { citationKey: "phase356-colour-conflict-yellow", assertedValue: "yellow V02 collateral says three colours" },
      ],
    },
  ],
  media: [
    {
      key: "phase356-ebonite-primary-media",
      title: "Aurora Ottantotto Ebanite 事实图（非产品照片）",
      sourceKey: SOURCES.diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

const auroraBrand = phase147AuroraTalentumPacks.find(
  (pack) => pack.entityId === PHASE356_AURORA_BRAND_ID && pack.expectedType === "brand",
);
if (!auroraBrand) throw new Error("Phase 356 Aurora brand prerequisite is missing.");

const brand = structuredClone(auroraBrand);
brand.key = "phase356-aurora-brand-navigation-v2";
brand.markdownFile = ".planning/content-research/aurora-brand-phase356.md";
brand.storyTitle = "Aurora：88 家族与 Ebanite 版本导航";
brand.sources = [...brand.sources, SOURCES.category, SOURCES.history, SOURCES.faq];
brand.claims = [
  ...brand.claims,
  {
    key: "phase356-aurora-brand-ebonite-navigation",
    predicate: "series_navigation",
    objectText: "Aurora 品牌页新增 Ottantotto Ebanite，并将其与 88 Resin 800、88 Millerighe、Optima、Ipsilon 和 Talentum 按材料、饰件和历史范围分开导航。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: SOURCES.category.key,
    locator: "official Ottantotto Ebanite category and Aurora family history",
    evidence: [{ key: "phase356-aurora-brand-ebonite-navigation-evidence", sourceKey: SOURCES.category.key, scopeKey: brand.scopes[0]!.scopeKey, locator: "official category separates Ottantotto Ebanite from other collection entries" }],
  },
];

export const phase356AuroraOttantottoEbanitePacks: CuratedEntityPack[] = [brand, model];
