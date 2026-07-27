import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE290_SCHON_BRAND_ID = "phase290-brand-schon-dsgn";
export const PHASE290_POCKET_SIX_ID = "phase290-pen-schon-dsgn-pocket-six";
export const PHASE290_POCKET_SIX_SLUG = "schon-dsgn-pocket-six";

const RETRIEVED = "2026-07-27";
const BRAND_SCOPE = "phase290-schon-dsgn-brand";
const MODEL_SCOPE = "phase290-schon-dsgn-pocket-six";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
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
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase290/schon-dsgn/pocket-six.svg";
  return {
    key: "phase290-pocket-six-diagram",
    registryKey: "fountain-pen-graph-editorial-phase290",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase290",
    title: "Schon DSGN Pocket Six factual diagram",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；表达短杆、上帽、#6 笔尖与短国际墨囊边界，不是产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false`,
  };
}

const S = {
  official: web({
    key: "phase290-schon-pocket-six-official",
    title: "Schon DSGN: Anodized Aluminum Pocket Six Fountain Pen",
    url: "https://www.schondsgn.com/products/pocket-six-matching-grip",
    registryKey: "schon-dsgn-official-phase290",
    registryName: "Schon DSGN official",
    summary: "官方产品页把 Pocket Six 定义为紧凑 cartridge fountain pen，说明名称来自完整尺寸 #6 笔尖、笔帽可旋到尾部，并列出短国际墨囊和多色阳极氧化限量边界。",
  }),
  faceted: web({
    key: "phase290-schon-pocket-six-faceted",
    title: "Schon DSGN: Faceted Multicolor Anodized Aluminum Pocket Six",
    url: "https://www.schondsgn.com/products/faceted-multicolor-anodized-aluminum-pocket-six",
    registryKey: "schon-dsgn-official-phase290",
    registryName: "Schon DSGN official",
    summary: "官方 Faceted 页面确认多色阳极氧化款是 Pocket Six 的外观/限量版本，售罄后不保证复产；不能据此拆成新的基础型号。",
  }),
  collection: web({
    key: "phase290-schon-collection",
    title: "Schon DSGN Products",
    url: "https://www.schondsgn.com/collections/all",
    registryKey: "schon-dsgn-official-phase290",
    registryName: "Schon DSGN official",
    summary: "官方产品集合页当前仍列有 Pocket Six 钢笔入口；圆珠、滚珠和其它 Schon DSGN 产品不并入本钢笔实体。",
  }),
  edJelley: web({
    key: "phase290-pocket-six-edjelley",
    title: "Schon Design Pocket Six Fountain Pen Review",
    url: "https://edjelley.com/2019/11/18/schon-design-pocket-six-fountain-pen-review/",
    registryKey: "edjelley-phase290",
    registryName: "Ed Jelley",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测的铝制＋黄铜握位样本记录 Bock #6、短国际墨囊、约 90.2 mm 合盖、132 mm 上帽和约 0.5 oz；均绑定该样本。",
  }),
  sbrebrown: web({
    key: "phase290-pocket-six-sbrebrown",
    title: "Schon DSGN Pocket 6 Fountain Pen Review",
    url: "https://www.sbrebrown.com/2020/09/schon-dsgn-pocket-6-fountain-pen-review/",
    registryKey: "sbrebrown-phase290",
    registryName: "SBREBrown",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立视频评测样本列 90.3 mm 合盖、132.4 mm 上帽、12.6 mm 杆径、18.5 g 总重，并说明该样本使用 JoWo #6；不是所有批次统一规格。",
  }),
  penAddict: web({
    key: "phase290-pocket-six-penaddict",
    title: "Schon DSGN Pocket Six Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2020/1/13/schon-dsgn-pocket-six-fountain-pen-review",
    registryKey: "penaddict-phase290",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测记录笔帽螺纹上帽、短国际墨囊、Bock 笔尖和不同阳极氧化/黄铜配置；对重心和书写的评价属于作者样本。",
  }),
  gentleman: web({
    key: "phase290-pocket-six-gentleman",
    title: "Schon DSGN Pocket Six Fountain Pen Review",
    url: "https://www.gentlemanstationer.com/blog/2020/8/1/pen-review-schon-dsgn-pocket-six-fountain-pen",
    registryKey: "gentleman-stationer-phase290",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测解释口袋笔的气密/携带风险、上帽书写必要性和 JoWo #6 的书写表现；体验不外推为品牌保证。",
  }),
  desk: web({
    key: "phase290-pocket-six-desk",
    title: "Schon DSGN Pocket Six Fountain Pen Review",
    url: "https://www.wellappointeddesk.com/2021/04/fountain-pen-review-schon-dsgn-pocket-six/",
    registryKey: "well-appointed-desk-phase290",
    registryName: "The Well-Appointed Desk",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立购买样本记录铝制笔身、约 90 mm 合盖、约 135 mm 上帽和短墨囊限制；手感和重量绑定 Purple Potion 样本。",
  }),
  svg: diagram(),
} satisfies Record<string, CuratedSource>;

function ev(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core", scopeKey = MODEL_SCOPE) {
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

function media(source: CuratedSource) {
  return [{
    key: "phase290-pocket-six-primary-media",
    title: source.title,
    sourceKey: source.key,
    localPath: source.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存或具体笔尖。",
    sourceUrl: source.url,
    usageStatus: "primary" as const,
  }];
}

export const phase290SchonDsgnPocketSixPacks: CuratedEntityPack[] = [
  {
    key: "phase290-schon-dsgn-brand-v1",
    entityId: PHASE290_SCHON_BRAND_ID,
    expectedType: "brand",
    expectedSlug: "schon-dsgn",
    canonicalName: "Schon DSGN",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/schon-dsgn-pocket-six-phase290.md",
    storyTitle: "Schon DSGN：把机械加工做成口袋钢笔",
    primarySourceKey: S.collection.key,
    depthTier: "A",
    aliases: [
      { alias: "Schon DSGN", language: "en", sourceKey: S.collection.key },
      { alias: "Schon Design", language: "en", sourceKey: S.edJelley.key },
      { alias: "Schon DSGN 钢笔", language: "zh", sourceKey: S.collection.key },
    ],
    sources: [S.collection, S.official, S.faceted, S.edJelley, S.penAddict, S.svg],
    scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "current", editionScope: "品牌页只导航已核验的 Pocket Six 钢笔；圆珠、滚珠、颜色和金属版本按独立书写模式或 variant 处理，不复制成重复型号。" }],
    claims: [
      claim("phase290-brand-identity", "brand_identity", "Schon DSGN 是 Ian Schon 在美国费城工作室经营的独立制笔品牌；本页只写官方当前产品可核验的型号，不把评测中的工作室描述扩展成未证实的公司历史。", S.collection.key, "official current product collection", "core", BRAND_SCOPE),
      claim("phase290-brand-navigation", "brand_model_navigation", "Pocket Six 是当前可核验的钢笔入口；铝制、黄铜、铜、阳极氧化和多色限量是版本或材料边界，圆珠和滚珠不是 Pocket Six 钢笔的型号别名。", S.official.key, "official Pocket Six product definition", "core", BRAND_SCOPE),
      claim("phase290-brand-boundary", "brand_boundary", "Pocket Six 的结构重点是合盖短、上帽书写和 #6 笔尖；不能因同样是金属加工或口袋尺寸而把 Schon DSGN 其它产品、Kaweco 或其它独立品牌并入。", S.penAddict.key, "independent model boundary review", "core", BRAND_SCOPE),
    ],
    media: media(S.svg),
    timeline: [
      { key: "phase290-brand-current", title: "Pocket Six 作为当前产品入口", eventType: "design_milestone", startDate: "2019", circa: true, description: "品牌官网与 2019–2021 独立评测共同显示 Pocket Six 进入公开销售；不虚构精确首发日。", sourceKey: S.official.key },
      { key: "phase290-brand-faceted", title: "阳极氧化与金属版本并存", eventType: "model_released", startDate: "2020", circa: true, description: "官方 Faceted 页面和产品集合显示铝、黄铜与多色阳极氧化版本并存，颜色与材料不拆成重复基础型号。", sourceKey: S.faceted.key },
    ],
  },
  {
    key: "phase290-pocket-six-v1",
    entityId: PHASE290_POCKET_SIX_ID,
    expectedType: "pen",
    expectedSlug: PHASE290_POCKET_SIX_SLUG,
    canonicalName: "Schon DSGN Pocket Six",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/schon-dsgn-pocket-six-phase290.md",
    storyTitle: "Schon DSGN Pocket Six：短杆、上帽与六号尖",
    primarySourceKey: S.official.key,
    depthTier: "A",
    aliases: [
      { alias: "Schon DSGN Pocket Six", language: "en", sourceKey: S.official.key },
      { alias: "Schon Design Pocket 6", language: "en", sourceKey: S.sbrebrown.key },
      { alias: "Pocket Six Fountain Pen", language: "en", sourceKey: S.official.key },
      { alias: "Schon DSGN Pocket Six 钢笔", language: "zh", sourceKey: S.collection.key },
    ],
    sources: [S.collection, S.official, S.faceted, S.edJelley, S.sbrebrown, S.penAddict, S.gentleman, S.desk, S.svg],
    scopes: [{ key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, market: "Schon DSGN current Pocket Six fountain pen and independently reviewed configurations", productionState: "current", nibScope: "full-size #6 nib; brand and shipment can use JoWo or Bock units, so exact brand/grade is SKU-scoped", materialScope: "anodized aluminum, brass, copper and grip configurations vary", editionScope: "multicolor/faceted anodization and metal choices are variants; rollerball/ballpoint are separate products" }],
    claims: [
      claim("phase290-pocket-six-identity", "model_identity", "Pocket Six 是 Schon DSGN 的短款 cartridge fountain pen；“Six”指完整尺寸的 #6 笔尖，不是第六代或套装数量。", S.official.key, "official name explanation"),
      claim("phase290-pocket-six-posting", "cap_mechanism", "笔帽从握位旋下后可继续旋到笔杆尾部上帽，以获得接近全尺寸的书写长度；螺纹需顺畅咬合，不应强拧。", S.official.key, "official cap and posting description"),
      claim("phase290-pocket-six-nib", "nib", "平台容纳完整尺寸 #6 笔尖；不同时期评测样本分别出现 Bock 或 JoWo，具体品牌、尖幅和调校应按订单／实物确认。", S.edJelley.key, "cross-review nib supplier boundary"),
      claim("phase290-pocket-six-fill", "filling_system", "标准供墨为短国际墨囊；短笔身通常无法容纳常规 converter。注射器回填空墨囊是用户操作，不等于原厂 eyedropper 或活塞。", S.official.key, "official cartridge fountain pen description"),
      claim("phase290-pocket-six-size", "dimensions", "独立评测样本约 90 mm 合盖、132–135 mm 上帽，杆径约 12.6–12.7 mm；不同材料和测量条件会改变数值。", S.sbrebrown.key, "review sample measurements"),
      claim("phase290-pocket-six-weight", "weight", "铝制样本约 14.6–18.5 g；黄铜握位、黄铜或铜制版本会增加重量，不能写成全平台固定克重。", S.edJelley.key, "aluminum/brass sample weight boundary"),
      claim("phase290-pocket-six-care", "maintenance_guidance", "换色时用常温清水冲洗短墨囊接口、握位和笔尖并充分干燥；螺纹、密封或笔尖异常时不要灌酒精、润滑油或强清洁剂，也不要蛮力拆解。", S.desk.key, "sample care and cartridge boundary", "editorial"),
      claim("phase290-pocket-six-buying", "selection_guidance", "购买前优先确认材料、握位、尖幅、笔尖品牌、供墨方式和限量色库存；喜欢 converter、大容量或不习惯上帽书写的人应先试写再决定。", S.gentleman.key, "independent pocket-pen selection boundary", "editorial"),
    ],
    variants: [
      { key: "phase290-pocket-six-aluminum", name: "Anodized aluminum", notes: "最常见的轻量金属路线；颜色和多色阳极氧化为 SKU/限量 edition。", sourceKey: S.official.key, variantKind: "material" },
      { key: "phase290-pocket-six-faceted", name: "Faceted multicolor anodized aluminum", notes: "官方单列的 faceted 多色版本；售罄后不保证复产。", sourceKey: S.faceted.key, variantKind: "edition_group" },
      { key: "phase290-pocket-six-brass", name: "Brass body or brass grip", notes: "黄铜配置更重；不同评测中的握位/整笔组合不能合并为一个固定重量。", sourceKey: S.edJelley.key, variantKind: "material" },
      { key: "phase290-pocket-six-nib", name: "#6 JoWo / Bock and custom grinds", notes: "笔尖品牌、尖幅与研磨依订单和时期；不能从一个样本外推全系。", sourceKey: S.sbrebrown.key, variantKind: "nib" },
    ],
    spec: {
      brandEntityId: PHASE290_SCHON_BRAND_ID,
      values: {
        series_name: "Schon DSGN Pocket Six",
        release_year: "约 2019 年前后进入公开销售；未找到可核实的官方精确首发日",
        origin_country: "美国 Philadelphia 工作室品牌语境；德国制造的 #6 笔尖为外购部件，不将其写成整笔产地",
        nib: "完整尺寸 #6；JoWo/Bock 与尖幅按具体订单和时期核对",
        fill_system: "短国际墨囊；短杆通常不容纳常规 converter",
        material: "阳极氧化铝、黄铜、铜及握位组合随版本变化",
        dimensions: "样本约 90 mm 合盖、132–135 mm 上帽、杆径约 12.6–12.7 mm",
        weight: "铝制样本约 14.6–18.5 g；金属配置会增加重量",
        status: "官方当前产品集合仍列 Pocket Six；多色款按限量库存变化",
      },
      evidence: [
        ev("phase290-brand-id", "brand_entity_id", S.collection.key, "official product collection"),
        ev("phase290-series", "series_name", S.official.key, "official Pocket Six title"),
        ev("phase290-release", "release_year", S.penAddict.key, "2019/2020 public review window; no exact launch claim"),
        ev("phase290-origin", "origin_country", S.edJelley.key, "Philadelphia workshop and German nib boundary"),
        ev("phase290-nib", "nib", S.sbrebrown.key, "sample #6 nib supplier and measurements"),
        ev("phase290-fill", "fill_system", S.official.key, "official cartridge fountain pen description"),
        ev("phase290-material", "material", S.faceted.key, "official aluminum variant boundary"),
        ev("phase290-dimensions", "dimensions", S.sbrebrown.key, "review sample measurements"),
        ev("phase290-weight", "weight", S.edJelley.key, "review sample weight"),
        ev("phase290-status", "status", S.collection.key, "current official collection presence"),
      ],
    },
    media: media(S.svg),
    timeline: [{ key: "phase290-pocket-six-window", title: "Pocket Six 公开销售资料窗口", eventType: "model_released", startDate: "2019", circa: true, description: "2019–2021 的独立评测与当前官网产品页共同支持 Pocket Six 的公开销售窗口；不把评测日期写成精确上市日。", sourceKey: S.official.key }],
  },
];
