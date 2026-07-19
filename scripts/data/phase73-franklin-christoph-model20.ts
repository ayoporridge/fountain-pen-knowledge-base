import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE73_BRAND_SLUG = "franklin-christoph";
export const PHASE73_MODEL20_SLUG = "franklin-christoph-model-20-marietta";

const RETRIEVED = "2026-07-20";

function live(
  input: Omit<
    CuratedSource,
    | "retrievedAt"
    | "allowedUse"
    | "homepageUrl"
    | "archiveUrl"
    | "archiveLocator"
  >,
): CuratedSource {
  return {
    ...input,
    homepageUrl: input.url,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const SOURCES = {
  history: live({
    key: "phase73-fc-history",
    registryKey: "franklin-christoph-official-history",
    registryName: "Franklin-Christoph official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "franklin-christoph-official-history",
    title: "Franklin-Christoph History",
    url: "https://www.franklin-christoph.com/pages/history",
    summary:
      "官方品牌沿革页将 Franklin Co. 的早期历史与 2001 年后 Franklin-Christoph／IPO Fountain Pen 的转型分开叙述；它不提供 Model 20 的首发年份。",
  }),
  marietta: live({
    key: "phase73-fc-model20-marietta",
    registryKey: "franklin-christoph-official-model20",
    registryName: "Franklin-Christoph official Model 20",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "franklin-christoph-official-model20",
    title: "Model 20 Marietta",
    url: "https://www.franklin-christoph.com/collections/model-20-marietta",
    summary:
      "官方 Marietta 集合页给出全尺寸 slip-cap、#6 单元、短国际墨囊／converter／eyedropper、约 138.43 mm 带帽、150 mm 套帽、约 19.28 g（含 converter 未注墨）与约 3.5 ml 滴入口径。",
  }),
  pocket: live({
    key: "phase73-fc-pocket20-boundary",
    registryKey: "franklin-christoph-official-pocket20",
    registryName: "Franklin-Christoph official pocket 20",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "franklin-christoph-official-pocket20",
    title: "Model P20 Classic Black",
    url: "https://www.franklin-christoph.com/products/model-p20-classic-black",
    summary:
      "官方 pocket 20 页列约 119 mm 带帽、132 mm 套帽、约 15.3 g，只用短国际墨囊或滴入且不附 converter；这是与全尺寸 Marietta 的硬边界。",
  }),
  nibs: live({
    key: "phase73-fc-nib-info",
    registryKey: "franklin-christoph-official-nibs",
    registryName: "Franklin-Christoph official nib information",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "franklin-christoph-official-nibs",
    title: "FP Nib Details and Info",
    url: "https://www.franklin-christoph.com/pages/fp-nib-details-and-info",
    summary:
      "官方笔尖资料按 #5、#6 等单元分组，说明替换路线；具体材质、尖宽、研磨、库存和兼容性仍须按当前 SKU 核对。",
  }),
  retail: live({
    key: "phase73-fc-model20-penchalet",
    registryKey: "penchalet-franklin-christoph",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "penchalet",
    title: "Franklin-Christoph Model 20 Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/franklin_christoph_model_20_fountain_pens.html",
    summary:
      "独立零售目录用于观察 Model 20 的市场页与材料批次呈现；不以零售库存、图片或单一配置替代官方全尺寸 Marietta 规格。",
  }),
  brandSvg: diagram(
    "phase73-fc-brand-svg",
    "Franklin-Christoph 型号导航事实图",
    "/images/library/site-original/franklin-christoph/franklin-christoph-brand.svg",
  ),
  mariettaSvg: diagram(
    "phase73-fc-model20-marietta-svg",
    "Franklin-Christoph Model 20 Marietta 事实图",
    "/images/library/site-original/franklin-christoph/franklin-christoph-model20-marietta.svg",
  ),
} satisfies Record<string, CuratedSource>;

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function editorialMedia(key: string, title: string, source: CuratedSource) {
  return [
    {
      key,
      title,
      sourceKey: source.key,
      localPath: source.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、树脂纹理、Logo、库存、笔尖、具体批次或实际墨量。",
      sourceUrl: source.url,
      usageStatus: "primary" as const,
    },
  ];
}

function brandPack(brandId: string): CuratedEntityPack {
  const scopeKey = "phase73-fc-brand-scope";
  return {
    key: "phase73-franklin-christoph-brand-v1",
    entityId: brandId,
    expectedType: "brand",
    expectedSlug: PHASE73_BRAND_SLUG,
    canonicalName: "Franklin-Christoph",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/franklin-christoph-brand.md",
    storyTitle: "Franklin-Christoph：以笔形为单位，而不是把树脂颜色当作型号",
    primarySourceKey: SOURCES.history.key,
    depthTier: "A",
    aliases: [
      { alias: "Franklin-Christoph", language: "en", sourceKey: SOURCES.history.key },
      { alias: "富兰克林-克里斯托弗", language: "zh", sourceKey: SOURCES.history.key },
    ],
    sources: [
      SOURCES.history,
      SOURCES.marietta,
      SOURCES.pocket,
      SOURCES.nibs,
      SOURCES.retail,
      SOURCES.brandSvg,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        productionState: "current",
        editionScope:
          "品牌页只导航经型号身份核对的公开条目；颜色、树脂、笔尖和小批次不被当作独立笔形，pocket 20、Model 02 与 Model 31 也不并入 Marietta。",
      },
    ],
    claims: [
      {
        key: "phase73-fc-brand-history",
        predicate: "brand_history_boundary",
        objectText:
          "Franklin Co. 的早期历史与 2001 年后 Franklin-Christoph／IPO Fountain Pen 的转型可用于解释品牌沿革；它们不是 Model 20 或其他当代笔形的首发年份。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.history.key,
        locator: SOURCES.history.summary,
        evidence: [{ key: "phase73-fc-brand-history-evidence", sourceKey: SOURCES.history.key, scopeKey, locator: SOURCES.history.summary }],
      },
      {
        key: "phase73-fc-brand-navigation",
        predicate: "model_navigation_boundary",
        objectText:
          "Model 20 Marietta 与 pocket 20 是不同长度、重量和供墨边界的笔形；树脂颜色、笔尖或零售批次不能替代型号身份，也不能把 pocket 20 的图片或规格写入 Marietta。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.marietta.key,
        locator: SOURCES.marietta.summary,
        evidence: [
          { key: "phase73-fc-brand-marietta-evidence", sourceKey: SOURCES.marietta.key, scopeKey, locator: SOURCES.marietta.summary },
          { key: "phase73-fc-brand-pocket-evidence", sourceKey: SOURCES.pocket.key, scopeKey, locator: SOURCES.pocket.summary },
          { key: "phase73-fc-brand-secondary-evidence", sourceKey: SOURCES.retail.key, scopeKey, locator: SOURCES.retail.summary },
        ],
      },
    ],
    media: editorialMedia("phase73-fc-brand-media", "Franklin-Christoph 型号导航事实图（非产品照片）", SOURCES.brandSvg),
    timeline: [
      { key: "phase73-fc-2001-transition", title: "Franklin-Christoph 品牌转型资料", eventType: "design_milestone", startDate: "2001", circa: false, description: "官方 History 将 2001 年后 Franklin-Christoph／IPO Fountain Pen 的转型与早期 Franklin Co. 沿革区分；不倒推任何具体型号的首发。", sourceKey: SOURCES.history.key },
      { key: "phase73-fc-model20-current-window", title: "Model 20 的当前型号资料窗口", eventType: "community_event", startDate: "2026", circa: true, description: "当前官方集合页将全尺寸 Model 20 Marietta 与口袋型号分开呈现；检索年份不被写成型号首发年份。", sourceKey: SOURCES.marietta.key },
    ],
  };
}

function mariettaPack(brandId: string, penId: string): CuratedEntityPack {
  const scopeKey = "phase73-fc-model20-marietta-current";
  return {
    key: "phase73-franklin-christoph-model20-marietta-v1",
    entityId: penId,
    expectedType: "pen",
    expectedSlug: PHASE73_MODEL20_SLUG,
    canonicalName: "Franklin-Christoph Model 20 Marietta",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/franklin-christoph-model20-marietta.md",
    storyTitle: "Franklin-Christoph Model 20 Marietta：全尺寸 slip-cap，不是 pocket 20 的长版配色",
    primarySourceKey: SOURCES.marietta.key,
    depthTier: "A",
    aliases: [
      { alias: "Franklin-Christoph Model 20 Marietta", language: "en", sourceKey: SOURCES.marietta.key },
      { alias: "Franklin-Christoph Model 20", language: "en", kind: "former_name", sourceKey: SOURCES.marietta.key },
      { alias: "富兰克林-克里斯托弗 Model 20 Marietta", language: "zh", sourceKey: SOURCES.marietta.key },
    ],
    sources: [SOURCES.marietta, SOURCES.pocket, SOURCES.nibs, SOURCES.retail, SOURCES.mariettaSvg],
    scopes: [{ key: scopeKey, scopeKey, productionState: "current", editionScope: "全尺寸 Model 20 Marietta 的当前规格锚点；pocket 20、Model 02、Model 31、颜色、树脂、尖型与市场批次均不代入本页。" }],
    claims: [
      { key: "phase73-fc-marietta-identity", predicate: "model_identity", objectText: "Model 20 Marietta 是全尺寸、无外露螺纹的 slip-cap 笔形，采用 #6 可替换笔尖单元；它不是 pocket 20 的加长配色或材料版本。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.marietta.key, locator: SOURCES.marietta.summary, evidence: [{ key: "phase73-fc-marietta-identity-evidence", sourceKey: SOURCES.marietta.key, scopeKey, locator: SOURCES.marietta.summary }] },
      { key: "phase73-fc-marietta-boundary", predicate: "model_boundary", objectText: "Marietta 约 138.43 mm 带帽、150 mm 套帽、约 19.28 g（含 converter 未注墨），可使用短国际墨囊、converter 或经核对后的滴入；pocket 20 为约 119 mm、15.3 g 的独立短笔形且不附 converter。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.pocket.key, locator: SOURCES.pocket.summary, evidence: [{ key: "phase73-fc-marietta-official-boundary", sourceKey: SOURCES.pocket.key, scopeKey, locator: SOURCES.pocket.summary }, { key: "phase73-fc-marietta-secondary-boundary", sourceKey: SOURCES.retail.key, scopeKey, locator: SOURCES.retail.summary }] },
      { key: "phase73-fc-marietta-care", predicate: "maintenance_boundary", objectText: "slip-cap 应平正合帽、平稳开合；换色以室温清水冲洗并晾干。滴入不是无条件长期储墨许可，出现渗漏、异常阻尼、断墨、笔尖错位或裂纹时停止强拆并寻求品牌或专业维修判断。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.marietta.key, locator: SOURCES.marietta.summary, evidence: [{ key: "phase73-fc-marietta-care-evidence", sourceKey: SOURCES.marietta.key, scopeKey, locator: SOURCES.marietta.summary }] },
    ],
    variants: [
      { key: "phase73-fc-marietta-current", name: "Model 20 Marietta（当前全尺寸笔形）", releaseYear: "当前目录；首发年份待官方档案核实", notes: "本页尺寸、重量、上墨和 #6 单元锚点；颜色、树脂、笔尖和库存按具体 SKU 核对。", sourceKey: SOURCES.marietta.key, variantKind: "edition_group" },
      { key: "phase73-fc-pocket20-sibling", name: "pocket 20（独立 sibling）", notes: "约 119 mm／15.3 g、短国际墨囊或滴入、不附 converter；只用于提醒身份边界，不把其规格或图片回填给 Marietta。", sourceKey: SOURCES.pocket.key, variantKind: "edition_group" },
    ],
    spec: { brandEntityId: brandId, values: { series_name: "Franklin-Christoph Model 20 Marietta", release_year: "当前在售笔形；首发年份待官方档案核实", origin_country: "美国品牌的当前 Model 20 产品线；具体制造与批次以当期官方资料为准", nib: "#6 可替换笔尖单元；具体尖材、尖宽与定制研磨按当前 SKU", fill_system: "短国际墨囊、国际 piston converter 或经核对后的 eyedropper；官方滴入口径约 3.5 ml", material: "硬质 acrylic；具体颜色、纹理与配件按当前 SKU", dimensions: "约 127 mm 无帽、138.43 mm 带帽、150 mm 套帽；最大帽径约 14.61 mm、笔杆约 12.95 mm", weight: "约 19.28 g（含 converter、未注墨）", status: "现行全尺寸 Model 20 Marietta；pocket 20 为独立短笔形" }, evidence: [
      evidence("brand_entity_id", "phase73-fc-marietta-brand", SOURCES.marietta.key, scopeKey, "official Model 20 maker context"), evidence("series_name", "phase73-fc-marietta-series", SOURCES.marietta.key, scopeKey, "official Model 20 Marietta title"), evidence("release_year", "phase73-fc-marietta-release", SOURCES.marietta.key, scopeKey, "current listing is not treated as initial release"), evidence("origin_country", "phase73-fc-marietta-origin", SOURCES.marietta.key, scopeKey, "official US brand product context; no factory inference"), evidence("nib", "phase73-fc-marietta-nib", SOURCES.nibs.key, scopeKey, "official #6 grouping and replacement information"), evidence("fill_system", "phase73-fc-marietta-fill", SOURCES.marietta.key, scopeKey, "official Model 20 filling paths"), evidence("material", "phase73-fc-marietta-material", SOURCES.marietta.key, scopeKey, "official current hard acrylic model context"), evidence("dimensions", "phase73-fc-marietta-dimensions", SOURCES.marietta.key, scopeKey, "official Model 20 dimensions"), evidence("weight", "phase73-fc-marietta-weight", SOURCES.marietta.key, scopeKey, "official Model 20 uninked converter weight"), evidence("status", "phase73-fc-marietta-status", SOURCES.pocket.key, scopeKey, "official sibling boundary confirms it is not pocket 20"),
    ] },
    media: editorialMedia("phase73-fc-marietta-media", "Franklin-Christoph Model 20 Marietta 事实图（非产品照片）", SOURCES.mariettaSvg),
    timeline: [{ key: "phase73-fc-marietta-current-window", title: "Model 20 Marietta 当前资料窗口", eventType: "model_released", startDate: "2026", circa: true, description: "当前官方集合页可见；检索年份不被写成型号首发年份。", sourceKey: SOURCES.marietta.key }],
  };
}

export function createPhase73FranklinChristophModel20Packs(ids: { brandId: string; penId: string }): CuratedEntityPack[] {
  return [brandPack(ids.brandId), mariettaPack(ids.brandId, ids.penId)];
}
