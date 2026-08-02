import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE339_ESTERBROOK_BRAND_ID = "b6DYMF38zz1B";
export const PHASE339_ESTERBROOK_J_IDS = {
  j: "phase339-esterbrook-double-jewel-j",
  lj: "phase339-esterbrook-double-jewel-lj",
  sj: "phase339-esterbrook-double-jewel-sj",
} as const;
export const PHASE339_ESTERBROOK_J_SLUGS = {
  j: "esterbrook-double-jewel-j",
  lj: "esterbrook-double-jewel-lj",
  sj: "esterbrook-double-jewel-sj",
} as const;

const RETRIEVED = "2026-08-02";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "blog",
    tier: input.tier ?? "professional_secondary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function svg(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase339",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase339",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；只表达历史尺寸与结构边界，不是产品照片、Logo、比例图或颜色证明。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=900x260`,
  };
}

const j3 = web({
  key: "phase339-esterbrook-net-j3",
  title: "Esterbrook.net：Double Jewel J",
  url: "https://www.esterbrook.net/j3.shtml",
  registryKey: "esterbrook-net-j3-phase339",
  registryName: "Esterbrook.net",
  summary: "历史资料说明战后 Double Jewel J 家族的 J、LJ、SJ 三种尺寸、经典颜色与 Icicle 的 LJ 尺寸线索。",
  locator: "Double Jewel; J, LJ and SJ sizes; Icicles",
});

const repair = web({
  key: "phase339-esterbrook-net-repair",
  title: "Esterbrook.net：Repair Tips",
  url: "https://www.esterbrook.net/repair.shtml",
  registryKey: "esterbrook-net-repair-phase339",
  registryName: "Esterbrook.net",
  summary: "维修资料给出 J 帽顶大 jewel 与 LJ/SJ 小 jewel 的辨识边界，并解释杠杆、墨囊和帽件维修注意事项。",
  locator: "Jewels; lever filler; sac and cap repair",
});

const nibs = web({
  key: "phase339-esterbrook-net-nibs",
  title: "Esterbrook.net：Renew-Point Nibs",
  url: "https://www.esterbrook.net/nibs.shtml",
  registryKey: "esterbrook-net-nibs-phase339",
  registryName: "Esterbrook.net",
  summary: "历史笔尖资料列出 Renew-Point 可旋换单元及 1xxx、2xxx、9xxx 等编号示例，不把编号直接等同于某一固定尺寸。",
  locator: "Renew-Point nibs; 1000, 2000 and 9000 series examples",
});

const vintagePens = web({
  key: "phase339-vintagepens-esterbrook",
  title: "VintagePens：Esterbrook",
  url: "https://www.vintagepens.com/Esterbrook.shtml",
  registryKey: "vintagepens-esterbrook-phase339",
  registryName: "VintagePens",
  summary: "专业收藏资料把 J 的出现放在 1948 年左右，并提供 Esterbrook 历史型号脉络，作为年代窗口的独立旁证。",
  locator: "J series history; circa 1948 introduction",
});

const modernGuide = web({
  key: "phase339-esterbrook-official-modern-guide",
  title: "Esterbrook 官方：A Guide to Esterbrook Pen Models",
  url: "https://www.esterbrookpens.com/blogs/news/a-guide-to-esterbrook-pen-models-estie-model-j-and-jr-pocket-pen-1",
  registryKey: "esterbrook-official-modern-guide-phase339",
  registryName: "Esterbrook Pens",
  sourceType: "official",
  tier: "primary",
  summary: "官方指南将现代 Estie、Model J、JR 分开，并说明现代 Model J 是历史轮廓的重新诠释，用于与 vintage J 家族划清身份边界。",
  locator: "Model J: The Return of a Legend; Estie and JR comparison",
});

const sampleJ = web({
  key: "phase339-collectablepens-esterbrook-j",
  title: "Collectable Pens：Esterbrook J in Pearl Grey",
  url: "https://collectablepens.co.uk/collections/other-vintage-pens/products/esterbrook-j-in-pearl-grey-full-sized-pen-1948",
  registryKey: "collectablepens-esterbrook-j-phase339",
  registryName: "Collectable Pens",
  sourceType: "retailer",
  tier: "retailer",
  summary: "零售实物页给出一支 Pearl Grey J 的 full-sized 样本与约 1948 年商品语境；仅用作单支尺寸量级，不外推全系列公差。",
  locator: "Product title; full-sized sample measurement",
});

const COMMON_SOURCES = [j3, repair, nibs, vintagePens, modernGuide, sampleJ];

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
) {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  } satisfies CuratedEntityPack["claims"][number];
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

type SizeKey = keyof typeof PHASE339_ESTERBROOK_J_IDS;

const SIZE_INFO: Record<SizeKey, {
  id: string;
  slug: string;
  name: string;
  title: string;
  short: string;
  dimensions: string;
  material: string;
  sizeClaim: string;
  svgPath: string;
  svgTitle: string;
  aliases: string[];
}> = {
  j: {
    id: PHASE339_ESTERBROOK_J_IDS.j,
    slug: PHASE339_ESTERBROOK_J_SLUGS.j,
    name: "Vintage Esterbrook Double Jewel J",
    title: "Esterbrook Double Jewel J：战后 J 系列的全尺寸基准",
    short: "全尺寸 J",
    dimensions: "全尺寸；Collectable Pens 一支 Pearl Grey 样本约 13 cm 合帽，样本值不代表统一公差",
    material: "战后彩色大理石纹塑料为常见路线；具体颜色与保存状态按实物记录",
    sizeClaim: "Double Jewel J 是 J 家族的全尺寸分支；LJ 更细长、SJ 更短更细",
    svgPath: "/images/library/site-original/phase339/esterbrook/double-jewel-j.svg",
    svgTitle: "Esterbrook Double Jewel J 结构事实图（非产品照片）",
    aliases: ["Esterbrook Double Jewel J", "Vintage Esterbrook J", "Esterbrook J full size"],
  },
  lj: {
    id: PHASE339_ESTERBROOK_J_IDS.lj,
    slug: PHASE339_ESTERBROOK_J_SLUGS.lj,
    name: "Vintage Esterbrook Double Jewel LJ",
    title: "Esterbrook Double Jewel LJ：J 家族的 Long Slender 细长尺寸",
    short: "Long Slender 细长尺寸",
    dimensions: "Long Slender；长度仍接近日用笔但笔杆与握位更细，不借用 J 的固定毫米数",
    material: "战后彩色大理石纹塑料为常见路线；Icicle 等条纹外观需先核对实际尺寸",
    sizeClaim: "Double Jewel LJ 是 J 家族的 Long Slender 分支；J 全尺寸、SJ 为 Short Slender",
    svgPath: "/images/library/site-original/phase339/esterbrook/double-jewel-lj.svg",
    svgTitle: "Esterbrook Double Jewel LJ 结构事实图（非产品照片）",
    aliases: ["Esterbrook Double Jewel LJ", "Vintage Esterbrook LJ", "Esterbrook Long Slender"],
  },
  sj: {
    id: PHASE339_ESTERBROOK_J_IDS.sj,
    slug: PHASE339_ESTERBROOK_J_SLUGS.sj,
    name: "Vintage Esterbrook Double Jewel SJ",
    title: "Esterbrook Double Jewel SJ：短小的 Short Slender demi 尺寸",
    short: "Short Slender demi 尺寸",
    dimensions: "Short Slender／demi；比 LJ 更短且更细，具体长度需以实物合帽与未盖帽测量为准",
    material: "战后彩色大理石纹塑料为常见路线；短款、护士笔或条纹外观不能单独证明 SJ",
    sizeClaim: "Double Jewel SJ 是 J 家族的 Short Slender demi 分支；不是所有短款 Esterbrook 的泛称",
    svgPath: "/images/library/site-original/phase339/esterbrook/double-jewel-sj.svg",
    svgTitle: "Esterbrook Double Jewel SJ 结构事实图（非产品照片）",
    aliases: ["Esterbrook Double Jewel SJ", "Vintage Esterbrook SJ", "Esterbrook Short Slender"],
  },
};

function makePack(size: SizeKey): CuratedEntityPack {
  const info = SIZE_INFO[size];
  const scopeKey = `phase339-esterbrook-${size}-scope`;
  const diagram = svg(`phase339-esterbrook-${size}-svg`, info.svgTitle, info.svgPath);
  const sources = [
    ...COMMON_SOURCES.filter((source) => size === "j" || source.key !== sampleJ.key),
    diagram,
  ];
  const dimensionSource = size === "j" ? sampleJ : j3;
  const dimensionLocator = size === "j" ? "Full-sized sample measurement" : "J, LJ and SJ size relation; no fixed LJ/SJ millimetre asserted";
  const claims = [
    claim(`${size}-identity`, "model_identity", `${info.name} 属于约 1948 年起的战后 Esterbrook Double Jewel J 家族历史尺寸，不是现代 Model J、JR 或 Estie。`, j3.key, scopeKey, "Double Jewel; post-war J family; size boundary"),
    claim(`${size}-size`, "size_family", info.sizeClaim, j3.key, scopeKey, "J, LJ and SJ sizes"),
    claim(`${size}-date`, "historical_window", "资料通常把 Double Jewel J 家族的战后起点放在约 1948 年；单支实物不能仅凭颜色或 jewel 断定精确出厂年。", vintagePens.key, scopeKey, "J series history; circa 1948"),
    claim(`${size}-jewel`, "double_jewel", `${info.name} 以帽顶与笔杆尾端各一枚 jewel 的 Double Jewel 结构为识别线索；替换件仍需结合整体证据。`, repair.key, scopeKey, "Jewels; cap and barrel ends"),
    claim(`${size}-filler`, "filling_system", "历史杠杆通过压缩橡胶墨囊吸墨；不能把本型号写成现代国际墨囊／转换器、活塞或 eyedropper。", repair.key, scopeKey, "Lever filler and sac repair"),
    claim(`${size}-nib`, "nib", "使用可旋换 Renew-Point 笔尖单元；1xxx、2xxx、9xxx 等编号是历史单元示例，不是本尺寸的固定配置表。", nibs.key, scopeKey, "Renew-Point nibs; numbered series examples"),
    claim(`${size}-colors`, "material_and_color", info.material, j3.key, scopeKey, "Classic colors; variation and Icicles"),
    claim(`${size}-sample`, "sample_measurement", info.dimensions, dimensionSource.key, scopeKey, dimensionLocator, "editorial"),
    claim(`${size}-maintenance`, "maintenance_guidance", "换墨前清空并冲洗，使用合适橡胶墨囊，避免热水、酒精、研磨剂与暴晒；杠杆、帽口或尖座异常时交给 vintage Esterbrook 维修者。", repair.key, scopeKey, "Sac, lever and cap repair", "editorial"),
    claim(`${size}-buying`, "selection_guidance", `选购 ${info.short} 时先确认尺寸比例、Double Jewel 完整度、杠杆与墨囊状态，再核对尖座编号；现代 Model J、JR、Estie 另行比较。`, modernGuide.key, scopeKey, "Modern model distinction", "editorial"),
  ];
  const specValues = {
    series_name: "Esterbrook Double Jewel J family",
    release_year: "约 1948 年起的战后历史窗口；非单支精确出厂年份",
    origin_country: "美国 Esterbrook 历史产品语境；具体工厂与批次不由本页外推",
    nib: "可旋换 Renew-Point；实际编号与尖幅按单支记录",
    fill_system: "杠杆压橡胶墨囊",
    material: info.material,
    dimensions: info.dimensions,
    weight: "历史资料未提供可安全外推的统一克重；二手实物应单独称量",
    status: "历史型号；约 1948 年起战后 J 家族尺寸",
  } satisfies Record<string, string>;
  return {
    key: `phase339-${size}-pack`,
    entityId: info.id,
    expectedType: "pen",
    expectedSlug: info.slug,
    canonicalName: info.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: `.planning/quick/260802-esterbrook-j-series/double-jewel-${size}.md`,
    storyTitle: info.title,
    primarySourceKey: j3.key,
    depthTier: "A",
    aliases: info.aliases.map((alias, index) => ({ alias, language: index === 0 ? "en" : "en", sourceKey: j3.key })),
    sources,
    scopes: [{
      key: scopeKey,
      scopeKey,
      productionState: "historical",
      market: "美国 Esterbrook 战后历史 J 家族；vintage 二手与收藏语境",
      nibScope: "实际 Renew-Point 编号、尖幅和替换状态按单支记录",
      materialScope: info.material,
      editionScope: "不包含现代 Model J、JR、Estie、ballpoint/rollerball 或未经尺寸核对的短款笔",
    }],
    claims,
    variants: [
      { key: `${size}-classic-colors`, name: "Classic post-war color families", notes: "经典颜色存在明暗与纹理差异；颜色名不自动等于稀有版。", sourceKey: j3.key, variantKind: "color" },
      ...(size === "lj" ? [{ key: `${size}-icicle-size-note`, name: "Icicle appearance (often LJ-size)", notes: "资料提示 Icicle 常采用 LJ 尺寸；外观名称不能替代实物尺寸判断。", sourceKey: j3.key, variantKind: "edition_group" as const }] : []),
      { key: `${size}-renew-point`, name: "Renew-Point nib unit", notes: "可旋换历史笔尖单元，编号和尖幅按具体实物记录。", sourceKey: nibs.key, variantKind: "nib" },
    ],
    spec: {
      brandEntityId: PHASE339_ESTERBROOK_BRAND_ID,
      values: specValues,
      evidence: [
        evidence(`${size}-brand`, "brand_entity_id", j3.key, scopeKey, "Esterbrook J family identity"),
        evidence(`${size}-series`, "series_name", j3.key, scopeKey, "J, LJ and SJ sizes"),
        evidence(`${size}-release`, "release_year", vintagePens.key, scopeKey, "circa 1948 historical window"),
        evidence(`${size}-origin`, "origin_country", vintagePens.key, scopeKey, "Esterbrook historical line context"),
        evidence(`${size}-nib-spec`, "nib", nibs.key, scopeKey, "Renew-Point numbered series examples"),
        evidence(`${size}-fill-spec`, "fill_system", repair.key, scopeKey, "lever filler and sac repair"),
        evidence(`${size}-material-spec`, "material", j3.key, scopeKey, "post-war colors and material context"),
        evidence(`${size}-dimensions-spec`, "dimensions", dimensionSource.key, scopeKey, dimensionLocator),
        evidence(`${size}-weight-spec`, "weight", j3.key, scopeKey, "no safe uniform vintage weight asserted"),
        evidence(`${size}-status`, "status", modernGuide.key, scopeKey, "historical versus modern Model J boundary"),
      ],
    },
    media: [{
      key: `phase339-${size}-primary-media`,
      title: info.svgTitle,
      sourceKey: diagram.key,
      localPath: info.svgPath,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、刻字、库存或具体限量版。",
      sourceUrl: info.svgPath,
      usageStatus: "primary",
    }],
  };
}

export const phase339EsterbrookJSeriesPacks: CuratedEntityPack[] = [
  makePack("j"),
  makePack("lj"),
  makePack("sj"),
];
