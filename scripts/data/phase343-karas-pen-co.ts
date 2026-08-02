import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-02";
export const PHASE343_KARAS_BRAND_ID = "phase343-karas-pen-co";
export const PHASE343_KARAS_BRAND_SLUG = "karas-pen-co";
export const PHASE343_KARAS_IDS = {
  ink: "phase343-karas-ink-fountain-pen",
  vertex: "phase343-karas-vertex-fountain-pen",
  decograph: "phase343-karas-decograph-fountain-pen",
} as const;
export const PHASE343_KARAS_SLUGS = {
  ink: "karas-ink-fountain-pen",
  vertex: "karas-vertex-fountain-pen",
  decograph: "karas-decograph-fountain-pen",
} as const;

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
  itemType?: string;
  group?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.group ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.itemType ?? "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase343",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase343",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1200x720`,
  };
}

const about = web({
  key: "phase343-karas-official-about",
  title: "Karas Pen Co official About Us",
  url: "https://karaskustoms.com/pages/about-us",
  registryKey: "karas-official-about-phase343",
  registryName: "Karas Pen Co official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 About Us 记录 Mesa, Arizona 2008 起源、2011 Kickstarter、2014 INK、2017 Decograph、2018 Vertex，以及 EDK 退休与 Decograph semi-retirement 边界。",
  locator: "company history timeline and current Karas Pen Co manufacturing context",
});
const collection = web({
  key: "phase343-karas-official-collection",
  title: "Karas Pen Co official Fountain Pens collection",
  url: "https://karaskustoms.com/collections/fountain-pens",
  registryKey: "karas-official-collection-phase343",
  registryName: "Karas Pen Co official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 Fountain Pens collection 展示当前 Vertex、INK、Decograph 与小批次特别发布；价格、库存和限量数量按页面变化，不作稳定规格。",
  locator: "current fountain pen route list and lifetime service footer",
});
const inkPage = web({
  key: "phase343-karas-official-ink",
  title: "Karas Pen Co Tumbled INK Fountain Pen",
  url: "https://karaskustoms.com/product/tumbled-ink-fountain-pen/",
  registryKey: "karas-official-ink-phase343",
  registryName: "Karas Pen Co official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 INK 商品页记录 2024 relaunch、6061-T aluminum/C360 brass/tellurium copper、尺寸、铝版重量、Bock、K5、短国际墨囊、triple-start threads 与 Sta-Fast cap。",
  locator: "2024 relaunch description, specifications, materials and filling system",
});
const vertexPage = web({
  key: "phase343-karas-official-vertex",
  title: "Karas Pen Co Black Acrylic Vertex Fountain Pen",
  url: "https://karaskustoms.com/collections/fountain-pens/products/black-acrylic-vertex-fountain-pen",
  registryKey: "karas-official-vertex-phase343",
  registryName: "Karas Pen Co official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 Vertex 商品页记录 resin eyedropper／标准国际墨囊／K5、四件结构、三处 o-ring、133.3/128.8/148.0 mm、acrylic/aluminum/brass grip 克重与 Mesa 制造。",
  locator: "Vertex construction, fill options, measurements and material weights",
});
const decographPage = web({
  key: "phase343-karas-official-decograph",
  title: "Karas Pen Co Black Widow Decograph Special Release",
  url: "https://karaskustoms.com/collections/fountain-pens/products/black-widow-decograph-special-release",
  registryKey: "karas-official-decograph-phase343",
  registryName: "Karas Pen Co official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 Black Widow Decograph 商品页记录 6061-T aluminum、可选尖幅、Schmidt K5、两支标准国际墨囊、137.27/128.46/162.56 mm 与小批次特别路线。",
  locator: "Black Widow material, fill, measurements and warranty fields",
});
const nibPage = web({
  key: "phase343-karas-official-nibs",
  title: "Karas Pen Co 250 (#6) Bock Fountain Pen Nibs",
  url: "https://karaskustoms.com/products/250-6-bock-fountain-pen-nibs",
  registryKey: "karas-official-nibs-phase343",
  registryName: "Karas Pen Co official",
  sourceType: "official",
  tier: "primary",
  summary: "官方配件页把 INK、Decograph、Vertex 列为 Bock 250/#6 兼容对象，并警告 2015 年 9 月前第一代 INK 不兼容当前 Bock 组件。",
  locator: "compatibility list, replacement assembly and pre-September-2015 INK warning",
});
const inkLookbook = web({
  key: "phase343-karas-lookbook-ink",
  title: "Karas Pen Co Lookbook INK",
  url: "https://karaskustoms.com/pages/lookbook-ink",
  registryKey: "karas-lookbook-ink-phase343",
  registryName: "Karas Pen Co official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 Lookbook 将 INK 称为旗舰，并展示铝、铜、黄铜、Cerakote 与历史主题；图片仅作路线和材料导航。",
  locator: "INK history, flagship positioning and material route gallery",
});
const decographLookbook = web({
  key: "phase343-karas-lookbook-decograph",
  title: "Karas Pen Co Lookbook Decograph",
  url: "https://karaskustoms.com/pages/lookbook-decograph",
  registryKey: "karas-lookbook-decograph-phase343",
  registryName: "Karas Pen Co official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 Lookbook 记录 Decograph 从树脂／热塑料到 Ultem、铝、黄铜和铜的材料实验与主题范围，不把画廊颜色当作统一 SKU。",
  locator: "Decograph Signature Series and material gallery",
});
const pencilInk = web({
  key: "phase343-karas-pencilcase-ink",
  title: "The Pencilcase Blog：Karas Pen Co INK V2",
  url: "https://www.pencilcaseblog.com/2020/08/review-karas-pen-co-ink-v2-fountain-pen.html",
  registryKey: "pencilcase-karas-ink-phase343",
  registryName: "The Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立评测以获赠 INK V2 样本讨论 Sta-Fast、握位、V2 变化与尖调校；不外推早期或全部材料。",
  locator: "INK V2 review sample and revision observations",
});
const pencilVertex = web({
  key: "phase343-karas-pencilcase-vertex",
  title: "The Pencilcase Blog：Karas Pen Co Vertex",
  url: "https://www.pencilcaseblog.com/2019/08/review-karas-pen-co-vertex-fountain-pen.html",
  registryKey: "pencilcase-karas-vertex-phase343",
  registryName: "The Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立树脂 Vertex 样本记录 Bock 尖、约 133 mm 尺寸、滴入／converter 与开合压力；手感和墨水行为只归于该样本。",
  locator: "resin Vertex review sample, dimensions and pressure observations",
});
const wadVertex = web({
  key: "phase343-karas-wad-vertex",
  title: "The Well-Appointed Desk：Vertex Delrin review",
  url: "https://www.wellappointeddesk.com/2019/09/fountain-pen-review-karas-pen-co-vertex-delrin/",
  registryKey: "well-appointed-karas-vertex-phase343",
  registryName: "The Well-Appointed Desk",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立 Delrin 样本记录 133 mm 级长度、重量、透明握位与滴入开合提醒；不覆盖金属 Vertex。",
  locator: "Delrin Vertex sample measurements and handling notes",
});
const earlyInk = web({
  key: "phase343-karas-ian-ink",
  title: "Ian Hedley Art：Karas Kustoms INK review",
  url: "https://penpaperpencil.net/karas-kustoms-ink-fountain-pen-review/",
  registryKey: "ian-hedley-karas-ink-phase343",
  registryName: "Ian Hedley Art",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "2015 早期 INK 评测记录铝制笔身、Schmidt #5 尖与 converter，作为旧版证据，不能替代 2024 relaunch。",
  locator: "2015 early INK sample and Schmidt nib boundary",
});
const penAddictDecograph = web({
  key: "phase343-karas-penaddict-decograph",
  title: "The Pen Addict：Karas Kustoms Decograph review",
  url: "https://www.penaddict.com/blog/2017/12/28/karas-kustoms-decograph-fountain-pen-review",
  registryKey: "penaddict-karas-decograph-phase343",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立评测以树脂 Decograph 样本讨论材料、握位与轻量，不把体验扩写成 Black Widow 或金属版本规格。",
  locator: "thermoplastic Decograph sample and writing experience boundary",
});
const brandSvg = diagram("phase343-karas-brand-svg", "Karas Pen Co brand route factual SVG", "/images/library/site-original/phase343/karas/brand.svg", "本站原创 factual SVG；表达 Mesa 时间线与 INK、Decograph、Vertex 路线导航。");
const inkSvg = diagram("phase343-karas-ink-svg", "Karas INK factual SVG", "/images/library/site-original/phase343/karas/ink.svg", "本站原创 factual SVG；表达 INK 的机加工材料、triple-start cap、Bock/K5 和当前尺寸。");
const vertexSvg = diagram("phase343-karas-vertex-svg", "Karas Vertex factual SVG", "/images/library/site-original/phase343/karas/vertex.svg", "本站原创 factual SVG；表达 Vertex 的 snap-cap、三处 o-ring、材料与尺寸边界。");
const decographSvg = diagram("phase343-karas-decograph-svg", "Karas Decograph factual SVG", "/images/library/site-original/phase343/karas/decograph.svg", "本站原创 factual SVG；表达 Decograph Signature Series、材料路线、Bock/K5 和 Black Widow 样本。");

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string, factClass: "core" | "editorial" = "core") {
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
function media(key: string, title: string, source: CuratedSource) {
  return [{ key, title, sourceKey: source.key, localPath: source.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。", sourceUrl: source.url, usageStatus: "primary" as const }];
}

const brandScope = "phase343-karas-brand";
const INK_SCOPE = "INK Fountain Pen current 2024 relaunch and historical revision records";
const VERTEX_SCOPE = "Vertex current family and material-specific product records";
const DECOGRAPH_SCOPE = "Decograph Signature Series current and historical material routes";
const brand: CuratedEntityPack = {
  key: "phase343-karas-brand-v1",
  entityId: PHASE343_KARAS_BRAND_ID,
  expectedType: "brand",
  expectedSlug: PHASE343_KARAS_BRAND_SLUG,
  canonicalName: "Karas Pen Co",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-karas-pen-co/brand.md",
  storyTitle: "Karas Pen Co：从 Mesa 机加工厂到三条钢笔路线",
  primarySourceKey: about.key,
  depthTier: "A",
  aliases: [
    { alias: "Karas Pen Co", language: "en", sourceKey: about.key },
    { alias: "Karas Kustoms", language: "en", sourceKey: pencilVertex.key, kind: "former_name" },
    { alias: "Karas Pen Co 钢笔", language: "zh", sourceKey: collection.key },
  ],
  sources: [about, collection, inkPage, vertexPage, decographPage, nibPage, inkLookbook, decographLookbook, pencilInk, pencilVertex, wadVertex, earlyInk, penAddictDecograph, brandSvg],
  scopes: [{ key: brandScope, scopeKey: brandScope, market: "Karas Pen Co brand and fountain pen route navigation", productionState: "current", editionScope: "品牌页链接 INK、Vertex、Decograph；Fountain K、EDK、Retrakt 保留为历史／非钢笔边界" }],
  claims: [
    claim("karas-identity", "brand_identity", "Karas Pen Co 是在 Mesa, Arizona 设计和制造书写工具的品牌；Karas Kustoms 是历史检索别名，不是第二个品牌。", about.key, brandScope, "current company name and historical alias context"),
    claim("karas-origin", "manufacturing_origin", "官方 About Us 记录 2008 年在 Mesa, Arizona 以 B2B machine shop 起步，并强调由品牌自己制造所售产品。", about.key, brandScope, "2008 Mesa origin and in-house manufacturing"),
    claim("karas-timeline", "brand_history", "官方时间线记录 2014 INK、2017 Decograph、2018 Vertex；2024 INK relaunch 与 EDK 2025 退休是版本状态节点。", about.key, brandScope, "timeline from INK to Vertex and current status"),
    claim("karas-routes", "collection_navigation", "INK、Decograph、Vertex 是不同设计路线：INK 偏机加工金属、Decograph 属 Signature Series、Vertex 为无夹 snap-cap；三者不能因共用 Bock 配件而合并。", collection.key, brandScope, "current fountain pen routes and design boundaries"),
    claim("karas-nib-boundary", "nib_ecosystem", "官方 250/#6 Bock 页面把 INK、Decograph、Vertex 列为兼容对象，并警告 2015 年 9 月前第一代 INK 不能直接使用当前组件。", nibPage.key, brandScope, "compatibility list and early INK warning"),
    claim("karas-status", "production_status", "官方称 EDK 在 2025 年退休、Decograph 处于 semi-retirement，而 Vertex 和 INK 仍在当前钢笔集合中；库存和小批次不写成永久承诺。", about.key, brandScope, "EDK retirement, Decograph semi-retirement and current collection"),
    claim("karas-independent", "sample_boundary", "The Pencilcase Blog、Well-Appointed Desk、Ian Hedley Art 与 The Pen Addict 的评测均是独立样本，用来交叉理解版本与手感，不外推全品牌。", pencilInk.key, brandScope, "independent review sample boundary"),
  ],
  timeline: [
    { key: "karas-2008", title: "Mesa 机加工厂起步", eventType: "brand_founded", startDate: "2008", circa: false, description: "官方 About Us 记录 Karas 在 Mesa, Arizona 以 B2B machine shop 起步。", sourceKey: about.key },
    { key: "karas-2014", title: "INK 进入钢笔路线", eventType: "model_released", startDate: "2014", circa: false, description: "官方时间线把 INK fountain pen 放在 2014 年节点。", sourceKey: about.key },
    { key: "karas-2018", title: "Vertex 加入 Signature Series", eventType: "model_released", startDate: "2018", circa: false, description: "官方时间线把 Vertex 放在 2018 年，并称其后来成为品牌最受欢迎的钢笔。", sourceKey: about.key },
  ],
  media: media("phase343-karas-brand-media", brandSvg.title, brandSvg),
};

type ModelKey = keyof typeof PHASE343_KARAS_IDS;
const ROUTES: Record<ModelKey, { id: string; slug: string; name: string; title: string; summary: string; markdownFile: string; primary: CuratedSource; svg: CuratedSource; sources: CuratedSource[]; aliases: string[]; material: string; nib: string; fill: string; dimensions: string; weight: string; status: string; scope: string; claims: CuratedEntityPack["claims"][number][]; variants: NonNullable<CuratedEntityPack["variants"]>; timeline?: CuratedEntityPack["timeline"] }> = {
  ink: {
    id: PHASE343_KARAS_IDS.ink,
    slug: PHASE343_KARAS_SLUGS.ink,
    name: "Karas Pen Co INK Fountain Pen",
    title: "Karas Pen Co INK：机加工金属旗舰钢笔",
    summary: "Karas Pen Co INK 是全尺寸机加工旗舰钢笔：铝、黄铜、铜版本共用 Sta-Fast 结构、Bock 笔尖、K5 转换器与短国际墨囊；2015 年前第一代兼容性需另核。",
    markdownFile: ".planning/quick/260802-karas-pen-co/ink.md",
    primary: inkPage,
    svg: inkSvg,
    sources: [about, inkPage, nibPage, inkLookbook, pencilInk, earlyInk, wadVertex, inkSvg],
    aliases: ["Karas Pen Co INK Fountain Pen", "Karas Kustoms INK", "Karas INK 钢笔"],
    material: "6061-T aluminum、C360 brass、tellurium copper；颜色、握位和夹子按 variant 变化",
    nib: "German-made Bock assemblies；当前 250/#6 兼容；2015 年 9 月前第一代需核对",
    fill: "Schmidt K5 converter 与两支短国际墨囊",
    dimensions: "闭帽 137.82 mm；开盖 126.32 mm；最大笔身宽 14.61 mm；握位 9.36–10.62 mm",
    weight: "铝版闭帽 42.2 g、开盖 24.7 g；黄铜／铜版随配置变化",
    status: "INK current flagship route；旧版 Bock/Schmidt 边界分开",
    scope: INK_SCOPE,
    claims: [
      claim("ink-identity", "model_identity", "INK 是 Karas Pen Co Kustoms Line 的全尺寸机加工钢笔；Tumbled、Brass、Copper 与 Cerakote 是材料／表面变体。", inkPage.key, INK_SCOPE, "current INK product identity"),
      claim("ink-history", "model_history", "官方 About Us 把 INK 放在 2014 年 fountain pen 节点，当前商品页记录 2024 relaunch；不是两个互不相关型号。", about.key, INK_SCOPE, "2014 origin and 2024 relaunch"),
      claim("ink-material", "material", "6061-T aluminum、C360 brass 与 tellurium copper 在 Mesa CNC 与 Swiss machining centers 加工；Bock 和 Schmidt 的制造地另记。", inkPage.key, INK_SCOPE, "materials and manufacturing"),
      claim("ink-fill", "filling_system", "当前 INK 随笔提供 Schmidt K5 converter 与两支短国际墨囊；标准国际耗材和旧版接口仍需实物核对。", inkPage.key, INK_SCOPE, "converter and cartridges"),
      claim("ink-cap", "cap_mechanism", "triple-start threads 约一圈半拆帽，Sta-Fast cap 以 internal silicone o-ring 减少口袋携带时松脱；官方明确 cap does not post。", inkPage.key, INK_SCOPE, "triple-start, Sta-Fast and non-posting cap"),
      claim("ink-nib", "nib", "当前路线使用 German-made Bock assemblies；官方 250/#6 页面列 INK 兼容，并警告 2015 年 9 月前第一代不能直接使用当前组件。", nibPage.key, INK_SCOPE, "Bock compatibility and early INK boundary"),
      claim("ink-size", "physical_specification", "官方给出闭帽 137.82 mm、开盖 126.32 mm、最大宽 14.61 mm、铝版 42.2/24.7 g；其他金属配置不外推。", inkPage.key, INK_SCOPE, "dimensions and aluminum weight"),
      claim("ink-review", "sample_boundary", "The Pencilcase Blog 与 Ian Hedley Art 的评测分别讨论 V2 与早期 Schmidt 样本；手感、尖调校和旧版尺寸归于各自样本。", pencilInk.key, INK_SCOPE, "independent revision samples"),
      claim("ink-care", "maintenance_guidance", "换墨以室温清水冲洗并自然干燥；阳极氧化、黄铜、铜、o-ring 与螺纹避免热水、酒精、研磨剂和长时间浸泡。", inkPage.key, INK_SCOPE, "conservative care from materials and cap structure", "editorial"),
      claim("ink-buying", "selection_guidance", "选购先确认材料、2015 年前后版本、尖组件、K5、o-ring、夹子和是否套帽；价格、库存和颜色批次不作为稳定规格。", inkPage.key, INK_SCOPE, "variant identification", "editorial"),
    ],
    variants: [
      { key: "ink-aluminum", name: "Aluminum INK", notes: "官方尺寸与 42.2/24.7 g 铝版重量参考；阳极氧化颜色随批次变化。", sourceKey: inkPage.key, variantKind: "material" },
      { key: "ink-brass-copper", name: "Brass / Copper INK", notes: "官方当前材料路线；克重随握位、夹子和配置变化。", sourceKey: inkPage.key, variantKind: "material" },
      { key: "ink-first-generation", name: "First-generation INK before September 2015", notes: "官方配件页警告不兼容当前 Bock 250/#6；尖、握位和接口按实物核对。", sourceKey: nibPage.key, variantKind: "edition_group" },
      { key: "ink-relaunch-2024", name: "2024 relaunch", releaseYear: "2024", notes: "官方商品页记录 current revision、milled aluminum clip 与握位选项；不据此抹掉旧版。", sourceKey: inkPage.key, variantKind: "edition_group" },
    ],
  },
  vertex: {
    id: PHASE343_KARAS_IDS.vertex,
    slug: PHASE343_KARAS_SLUGS.vertex,
    name: "Karas Pen Co Vertex Fountain Pen",
    title: "Karas Pen Co Vertex：无夹 snap-cap 与透明握位窗口",
    summary: "Karas Pen Co Vertex 是 Signature Series 的无夹 snap-cap 钢笔：树脂、Delrin、铝和黄铜路线共用圆润外形；树脂版可滴入，也可用国际墨囊／K5 converter。",
    markdownFile: ".planning/quick/260802-karas-pen-co/vertex.md",
    primary: vertexPage,
    svg: vertexSvg,
    sources: [about, collection, vertexPage, nibPage, pencilVertex, wadVertex, pencilInk, vertexSvg],
    aliases: ["Karas Pen Co Vertex Fountain Pen", "Karas Kustoms Vertex", "Karas Vertex 钢笔"],
    material: "acrylic、polycarbonate、Delrin、aluminum、brass；透明握位形成 ink-window",
    nib: "Bock fountain assembly；250/#6 兼容，尖幅按 SKU 核对",
    fill: "树脂路线可 eyedropper；标准国际墨囊或 Schmidt K5 converter",
    dimensions: "闭帽 133.3 mm、开盖 128.8 mm、套帽 148.0 mm；最大宽 14.61 mm、帽宽 15.88 mm",
    weight: "acrylic 15.7/9.8 g、aluminum 19.3/13.3 g、brass 33.4/27.6 g（闭帽／开盖参考）",
    status: "Signature Series clipless pocket fountain pen",
    scope: VERTEX_SCOPE,
    claims: [
      claim("vertex-identity", "model_identity", "Vertex 是 Karas Pen Co Signature Series 的无夹 snap-cap fountain pen；颜色、树脂、Delrin、铝和黄铜是变体路线。", vertexPage.key, VERTEX_SCOPE, "current Vertex identity"),
      claim("vertex-history", "model_history", "官方 About Us 将 Vertex 放在 2018 年时间线，并称其后来成为品牌最受欢迎的钢笔之一。", about.key, VERTEX_SCOPE, "2018 timeline and popularity positioning"),
      claim("vertex-construction", "construction", "官方描述 cap、barrel、grip、nib 四个主要部件、无外露螺纹、凹面帽顶与透明握位窗口。", vertexPage.key, VERTEX_SCOPE, "four-part construction and ink window"),
      claim("vertex-seals", "seal_system", "官方设计使用三处定制 o-ring 封住握位、尖单元和帽盖，使树脂路线可以在不依赖 silicone grease 的情况下尝试滴入。", vertexPage.key, VERTEX_SCOPE, "three o-rings and eyedropper design"),
      claim("vertex-fill", "filling_system", "官方商品页同时支持树脂路线 eyedropper、标准国际墨囊和 Schmidt K5 converter，并随黑色 acrylic 商品提供墨囊与 converter。", vertexPage.key, VERTEX_SCOPE, "fill alternatives and included accessories"),
      claim("vertex-material", "material", "Vertex 由 acrylic、polycarbonate、Delrin、aluminum 和 brass 路线组成；金属版本不能自动继承树脂滴入边界。", vertexPage.key, VERTEX_SCOPE, "material routes and boundary"),
      claim("vertex-nib", "nib", "官方 250/#6 Bock 配件页列 Vertex 兼容；评测样本记录 Bock 与 Karas 标记，具体尖幅按商品或实物核对。", nibPage.key, VERTEX_SCOPE, "Bock #6 compatibility"),
      claim("vertex-size", "physical_specification", "官方 acrylic/aluminum/brass 表记录 133.3/128.8/148.0 mm 与材料级克重；不以树脂样本数字覆盖金属版本。", vertexPage.key, VERTEX_SCOPE, "dimensions and material weights"),
      claim("vertex-review", "sample_boundary", "The Pencilcase Blog 与 Well-Appointed Desk 的树脂／Delrin 样本讨论开合压力、重量和书写平衡；均不外推所有材料。", pencilVertex.key, VERTEX_SCOPE, "independent material samples"),
      claim("vertex-care", "maintenance_guidance", "滴入时保持笔尖朝上开合、控制空气与墨水压力；换墨以室温清水冲洗，避免高温、溶剂和粗硬工具损伤透明材料与 o-ring。", vertexPage.key, VERTEX_SCOPE, "conservative pressure and care guidance", "editorial"),
      claim("vertex-buying", "selection_guidance", "选购先决定树脂滴入还是国际墨囊／K5，再核对材料、握位、尖幅、o-ring、帽盖和是否无夹；库存与小批次不作身份字段。", vertexPage.key, VERTEX_SCOPE, "variant and use selection", "editorial"),
    ],
    variants: [
      { key: "vertex-acrylic", name: "Acrylic / polycarbonate Vertex", notes: "官方黑色 acrylic 商品支持树脂滴入、国际墨囊／K5；透明握位可产生 ink-window。", sourceKey: vertexPage.key, variantKind: "material" },
      { key: "vertex-delrin", name: "Delrin Vertex", notes: "独立评测样本记录轻量和滴入操作；不替代当前 acrylic 商品规格。", sourceKey: wadVertex.key, variantKind: "material" },
      { key: "vertex-aluminum", name: "Aluminum Vertex", notes: "官方同外形尺寸，克重随配置；供墨方式按 exact 商品核对。", sourceKey: vertexPage.key, variantKind: "material" },
      { key: "vertex-brass", name: "Brass Vertex", notes: "官方表列黄铜握位约 33.4 g 闭帽参考；金属版不能自动继承树脂滴入。", sourceKey: vertexPage.key, variantKind: "material" },
    ],
  },
  decograph: {
    id: PHASE343_KARAS_IDS.decograph,
    slug: PHASE343_KARAS_SLUGS.decograph,
    name: "Karas Pen Co Decograph Fountain Pen",
    title: "Karas Pen Co Decograph：Signature Series 的材料实验路线",
    summary: "Karas Pen Co Decograph 是 2017 年 Signature Series 的雪茄形钢笔：树脂、Delrin、Ultem、铝、黄铜与铜版本共用 Bock #6／国际转换器框架；官网称其半退休。",
    markdownFile: ".planning/quick/260802-karas-pen-co/decograph.md",
    primary: decographPage,
    svg: decographSvg,
    sources: [about, collection, decographPage, decographLookbook, nibPage, penAddictDecograph, pencilVertex, earlyInk, decographSvg],
    aliases: ["Karas Pen Co Decograph Fountain Pen", "Karas Kustoms Decograph", "Karas Decograph 钢笔"],
    material: "acrylic、Delrin、Ultem、6061-T aluminum、brass、copper",
    nib: "Bock #6；尖幅、steel/titanium/14K 与 Jowo 特别路线按 SKU 核对",
    fill: "Schmidt K5 converter 与两支标准国际墨囊；部分路线可 eyedropper，按 exact 商品确认",
    dimensions: "Black Widow 官方 137.27 mm capped、128.46 mm uncapped、162.56 mm posted；握位 9.35–10.77 mm",
    weight: "Black Widow 随配置变化；历史 thermoplastic 样本约 20 g 级，不外推金属路线",
    status: "Signature Series; official page marks semi-retirement and small-batch releases",
    scope: DECOGRAPH_SCOPE,
    claims: [
      claim("decograph-identity", "model_identity", "Decograph 是 Karas Pen Co 2017 年 Signature Series 的雪茄形 fountain pen；Black Widow、Al 13、Ultem 与树脂颜色是变体或批次。", about.key, DECOGRAPH_SCOPE, "2017 timeline and route identity"),
      claim("decograph-status", "production_status", "官方 About Us 把 Decograph 写成 semi-retirement，同时保留自定义铝制发布可能；不把历史限量当作长期库存。", about.key, DECOGRAPH_SCOPE, "semi-retirement status"),
      claim("decograph-form", "construction", "官方 Lookbook 将 Decograph 放在传统 1930–40 年代形体与六部件机加工的交汇处；实际材料和夹子按版本核对。", decographLookbook.key, DECOGRAPH_SCOPE, "six-part Signature Series design"),
      claim("decograph-material", "material", "Decograph 路线包含 acrylic、Delrin、Ultem、6061-T aluminum、brass 和 copper；Black Widow 是当前可引用的铝制特别路线。", decographPage.key, DECOGRAPH_SCOPE, "material routes and Black Widow"),
      claim("decograph-nib", "nib", "官方 250/#6 Bock 页面列 Decograph 兼容；历史评测出现 steel、titanium、14K 或 Jowo 特别路线，不能合并为固定尖材。", nibPage.key, DECOGRAPH_SCOPE, "Bock compatibility and variant nibs"),
      claim("decograph-fill", "filling_system", "Black Widow 官方页随笔提供 Schmidt K5 与两支标准国际墨囊；滴入能力只在明确商品或材料版本中确认。", decographPage.key, DECOGRAPH_SCOPE, "converter and cartridges"),
      claim("decograph-size", "physical_specification", "Black Widow 官方记录闭帽 137.27 mm、开盖 128.46 mm、套帽 162.56 mm、握位 9.35–10.77 mm，克重随配置。", decographPage.key, DECOGRAPH_SCOPE, "Black Widow dimensions"),
      claim("decograph-review", "sample_boundary", "The Pen Addict 与 The Pencilcase Blog 的树脂样本讨论轻量、握位和 Bock 尖；这些是早期样本，不覆盖铜、黄铜或当前特别版。", penAddictDecograph.key, DECOGRAPH_SCOPE, "independent thermoplastic samples"),
      claim("decograph-care", "maintenance_guidance", "树脂、铝、黄铜、铜和 Ultem 分别避开热水、酒精、研磨剂和强溶剂；换墨用室温清水，密封和尖座异常交由品牌维修。", decographPage.key, DECOGRAPH_SCOPE, "conservative material care", "editorial"),
      claim("decograph-buying", "selection_guidance", "选购先确认材料、批次、尖幅、K5、是否支持滴入与是否后配尖；不要用 Black Widow 的图片、尺寸或颜色覆盖全系。", decographPage.key, DECOGRAPH_SCOPE, "variant identification", "editorial"),
    ],
    variants: [
      { key: "decograph-resin", name: "Acrylic / Delrin / Ultem", notes: "Signature Series 的轻量路线；颜色和滴入能力按 exact 商品核对。", sourceKey: decographLookbook.key, variantKind: "material" },
      { key: "decograph-black-widow", name: "Black Widow aluminum special release", notes: "官方当前特别页记录 6061-T aluminum、K5、两支国际墨囊与 Black Widow finish。", sourceKey: decographPage.key, variantKind: "edition_group" },
      { key: "decograph-al13", name: "Tumbled Al 13", releaseYear: "2019–2021 archive", notes: "历史／年度铝制批次；尺寸与数量不覆盖当前路线。", sourceKey: decographPage.key, variantKind: "material" },
      { key: "decograph-nib", name: "Bock steel / titanium / 14K and Jowo special routes", notes: "商品或评测级尖材变体；当前安装件按实物确认。", sourceKey: nibPage.key, variantKind: "nib" },
    ],
  },
};

function modelPack(key: ModelKey): CuratedEntityPack {
  const route = ROUTES[key];
  const scopeKey = route.scope;
  const sources = route.sources;
  return {
    key: `phase343-karas-${key}-v1`,
    entityId: route.id,
    expectedType: "pen",
    expectedSlug: route.slug,
    canonicalName: route.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: route.markdownFile,
    storyTitle: route.title,
    primarySourceKey: route.primary.key,
    depthTier: "A",
    aliases: route.aliases.map((alias, index) => ({ alias, language: index === 2 ? "zh" : "en", sourceKey: index === 0 ? route.primary.key : about.key })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, market: route.scope, productionState: key === "decograph" ? "unknown" : "current", nibScope: route.nib, materialScope: route.material, editionScope: route.status }],
    claims: route.claims,
    variants: route.variants,
    spec: {
      brandEntityId: PHASE343_KARAS_BRAND_ID,
      values: {
        series_name: route.name,
        release_year: key === "ink" ? "2014 fountain pen origin; 2024 relaunch" : key === "vertex" ? "2018 official timeline" : "2017 official timeline; current semi-retirement",
        origin_country: "美国 Mesa, Arizona；具体外购组件按官方页面核对",
        nib: route.nib,
        fill_system: route.fill,
        material: route.material,
        dimensions: route.dimensions,
        weight: route.weight,
        status: route.status,
      },
      evidence: [
        evidence(`${key}-brand`, "brand_entity_id", about.key, scopeKey, "Karas Pen Co brand identity"),
        evidence(`${key}-series`, "series_name", route.primary.key, scopeKey, "official route name"),
        evidence(`${key}-release`, "release_year", about.key, scopeKey, "official timeline"),
        evidence(`${key}-origin`, "origin_country", route.primary.key, scopeKey, "Mesa manufacturing context"),
        evidence(`${key}-nib-field`, "nib", nibPage.key, scopeKey, "Bock compatibility and nib boundary"),
        evidence(`${key}-fill-field`, "fill_system", route.primary.key, scopeKey, "official filling system"),
        evidence(`${key}-material-field`, "material", route.primary.key, scopeKey, "official material field"),
        evidence(`${key}-dimensions`, "dimensions", route.primary.key, scopeKey, "official dimensions"),
        evidence(`${key}-weight`, "weight", route.primary.key, scopeKey, "official or configuration weight field"),
        evidence(`${key}-status`, "status", route.primary.key, scopeKey, "current status and route boundary"),
      ],
    },
    timeline: route.timeline ?? [{ key: `${key}-route`, title: route.title, eventType: "design_milestone", startDate: key === "ink" ? "2014" : "2017", circa: true, description: `${route.name} 的官方路线节点与当前变体状态按商品资料保存。`, sourceKey: route.primary.key }],
    media: media(`${key}-primary-media`, route.svg.title, route.svg),
  };
}

export const phase343KarasPenCoPacks: CuratedEntityPack[] = [brand, modelPack("ink"), modelPack("vertex"), modelPack("decograph")];
