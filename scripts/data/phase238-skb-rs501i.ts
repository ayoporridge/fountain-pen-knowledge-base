import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-26";
export const PHASE238_BRAND_ID = "z6qsxNL0PAj8";
export const PHASE238_PEN_ID = "p238SKBRS501i";
export const PHASE238_LEGACY_ID = "6K7UhGOj7VrS";
export const PHASE238_SLUGS = {
  brand: "skb",
  pen: "skb-rs-501i",
  legacy: "skb派顿-f10-f21",
} as const;

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
    author: input.registryName,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase238",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase238",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创 factual SVG；非产品照片、非 logo、非比例图、非颜色证明。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  about: web({
    key: "phase238-skb-about",
    title: "SKB 文明钢笔关于我们",
    url: "https://www.skb.com.tw/pages/%E9%97%9C%E6%96%BC%E6%88%91%E5%80%91",
    registryKey: "skb-official-about-phase238",
    registryName: "SKB 文明钢笔",
    summary: "官方历史页记录 1955 年正式立名、1959 年 830、1960 年 22 型、1963 年自制笔尖、1970 年 14K/18K 金尖和 2012 年重启台湾钢笔。",
  }),
  catalog: web({
    key: "phase238-skb-catalog",
    title: "SKB 文创商品目录",
    url: "https://www.skb.com.tw/%E6%96%87%E5%89%B5%E5%95%86%E5%93%81%E7%B3%BB%E5%88%97",
    registryKey: "skb-official-catalog-phase238",
    registryName: "SKB 文明钢笔",
    summary: "官方目录同时列出 RS-501i 国旗、旅行郵件、環島臺灣、海軍、空軍和联名商品，商品型号栏均为 RS-501i 文创系列。",
  }),
  huashan: web({
    key: "phase238-skb-huashan",
    title: "华山 1914：SKB 书写记忆",
    url: "https://www.huashan1914.com/w/huashan1914/creative_19081517492906027",
    registryKey: "huashan-skb-history-phase238",
    registryName: "华山 1914",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "机构文化资料交叉说明 SKB 830、22 型与台湾书写记忆；只作品牌历史语境，不覆盖 RS-501i 的型号参数。",
  }),
  flag: web({
    key: "phase238-skb-rs501i-flag",
    title: "SKB RS-501i 国旗钢笔",
    url: "https://www.skb.com.tw/product/product%26product_id%3D290",
    registryKey: "skb-rs501i-official-phase238",
    registryName: "SKB 文明钢笔",
    summary: "官方商品页列 RS-501i、EF、RI-60 卡式墨水、#301A 吸墨器、铝合金、总长约 13.3 cm、台湾产地、随笔附卡水和吸墨器，并称采用德国原装进口笔尖。",
  }),
  mail: web({
    key: "phase238-skb-rs501i-mail",
    title: "SKB RS-501i 旅行郵件钢笔",
    url: "https://www.skb.com.tw/product/product%26product_id%3D289",
    registryKey: "skb-rs501i-variants-phase238",
    registryName: "SKB 文明钢笔",
    summary: "官方旅行郵件页面再次列出 RS-501i 型号、EF、RI-60/#301A、铝合金、约 13.3 cm 和台湾产地，支持主题外观归为同型号版本。",
  }),
  island: web({
    key: "phase238-skb-rs501i-island",
    title: "SKB RS-501i 環島臺灣钢笔",
    url: "https://www.skb.com.tw/product/product%26product_id%3D286",
    registryKey: "skb-rs501i-variants-phase238",
    registryName: "SKB 文明钢笔",
    summary: "官方環島臺灣页面与其他 RS-501i 商品共用型号代码和规格结构，作为台湾主题版本交叉依据。",
  }),
  accessory: web({
    key: "phase238-skb-301a",
    title: "SKB #301A 小口径吸水器",
    url: "https://www.skb.com.tw/product/product%26product_id%3D322",
    registryKey: "skb-official-accessory-phase238",
    registryName: "SKB 文明钢笔",
    summary: "官方配件页把 #301A 列为 RS-501i 文创系列适用，并把 RS-301N 黄铜袖珍钢笔列为不适用，明确了 SKB 型号之间的耗材边界。",
  }),
  brandSvg: diagram(
    "phase238-skb-brand-svg",
    "SKB brand and RS navigation factual diagram",
    "/images/library/site-original/phase238/skb/brand.svg",
  ),
  penSvg: diagram(
    "phase238-skb-rs501i-svg",
    "SKB RS-501i factual diagram",
    "/images/library/site-original/phase238/skb/rs-501i.svg",
  ),
} as const;

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(source: CuratedSource, key: string, title: string) {
  return [{
    key,
    title,
    sourceKey: source.key,
    localPath: source.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；非产品照片、非 logo、非比例图、非颜色证明。",
    sourceUrl: source.url,
    usageStatus: "primary" as const,
  }];
}

const brandScope = "phase238-skb-brand-navigation";
const penScope = "phase238-skb-rs501i-scope";

const brand: CuratedEntityPack = {
  key: "phase238-skb-brand-v1",
  entityId: PHASE238_BRAND_ID,
  expectedType: "brand",
  expectedSlug: PHASE238_SLUGS.brand,
  canonicalName: "SKB 文明钢笔",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/skb-brand-phase238.md",
  storyTitle: "SKB 文明钢笔：台湾品牌沿革与 RS 系列导航",
  primarySourceKey: S.about.key,
  depthTier: "A",
  aliases: ["SKB", "SKB文明钢笔", "SKB 文明鋼筆", "文明钢笔"].map((alias) => ({
    alias,
    language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en",
    sourceKey: S.about.key,
  })),
  sources: [S.about, S.catalog, S.huashan, S.flag, S.mail, S.island, S.accessory, S.brandSvg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "台湾 SKB 品牌身份与官方明确列出的 RS-301N、ES-520、RS-501i 导航；Penton/SIKIB 混合页不归入 SKB。",
  }],
  claims: [
    {
      key: "phase238-skb-brand-identity",
      predicate: "brand_identity",
      objectText: "SKB 文明钢笔是 1955 年成立、以钢笔起家的台湾文具与制笔品牌；其官网历史页记录 830、22 型、自制笔尖、金尖与 2012 年重启台湾钢笔。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.about.key,
      locator: S.about.summary,
      evidence: [{ key: "phase238-skb-brand-identity-evidence", sourceKey: S.about.key, scopeKey: brandScope, locator: S.about.summary }],
    },
    {
      key: "phase238-skb-brand-navigation",
      predicate: "brand_model_navigation",
      objectText: "当前品牌导航至少包含已核实的 RS-301N、ES-520 与 RS-501i；RS-501i 的国旗、旅行郵件、環島臺灣、海軍、空軍和联名外观仍使用同一个 RS-501i 型号代码。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.catalog.key,
      locator: S.catalog.summary,
      evidence: [
        { key: "phase238-skb-brand-navigation-catalog", sourceKey: S.catalog.key, scopeKey: brandScope, locator: S.catalog.summary },
        { key: "phase238-skb-brand-navigation-flag", sourceKey: S.flag.key, scopeKey: brandScope, locator: S.flag.summary },
      ],
    },
    {
      key: "phase238-skb-brand-boundary",
      predicate: "identity_boundary",
      objectText: "旧数据库中的 SKB派顿 F10 / F21 是身份未决的混合页，不因为名称相似就链接到台湾 SKB；RS-301N、ES-520 与 RS-501i 的尖、材质和上墨配件也不能互相继承。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.accessory.key,
      locator: S.accessory.summary,
      evidence: [{ key: "phase238-skb-brand-boundary-evidence", sourceKey: S.accessory.key, scopeKey: brandScope, locator: S.accessory.summary }],
    },
    {
      key: "phase238-skb-brand-cultural-context",
      predicate: "historical_context",
      objectText: "华山 1914 的机构文化资料可交叉说明 SKB 830、22 型与台湾书写记忆的关系；它只补充品牌语境，不覆盖当前型号规格。",
      factClass: "core",
      confidence: 0.9,
      sourceKey: S.huashan.key,
      locator: S.huashan.summary,
      evidence: [{ key: "phase238-skb-brand-cultural-context-evidence", sourceKey: S.huashan.key, scopeKey: brandScope, locator: S.huashan.summary }],
    },
  ],
  timeline: [
    { key: "phase238-skb-founded", title: "文明钢笔正式立名", eventType: "brand_founded", startDate: "1955", circa: false, description: "官方历史页记录 1955 年正式立名并开始组装销售钢笔。", sourceKey: S.about.key },
    { key: "phase238-skb-830", title: "自有品牌 830", eventType: "model_released", startDate: "1959", circa: false, description: "官方将 830 记为第一支自有品牌原创钢笔；它是历史锚点，不与现代 RS 型号合并。", sourceKey: S.about.key },
    { key: "phase238-skb-revival", title: "重启台湾钢笔制作", eventType: "revival", startDate: "2012", circa: false, description: "官方历史页记录 2012 年重拾钢笔制作并陆续推出精品笔系列。", sourceKey: S.about.key },
  ],
  media: media(S.brandSvg, "phase238-skb-brand-primary", "SKB 品牌与 RS 型号导航事实图（非产品照片）"),
};

const pen: CuratedEntityPack = {
  key: "phase238-skb-rs501i-v1",
  entityId: PHASE238_PEN_ID,
  expectedType: "pen",
  expectedSlug: PHASE238_SLUGS.pen,
  canonicalName: "SKB RS-501i",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/skb-rs-501i-phase238.md",
  storyTitle: "SKB RS-501i：同一型号下的台湾主题版本",
  primarySourceKey: S.flag.key,
  depthTier: "A",
  aliases: [
    { alias: "SKB RS-501i", language: "en", sourceKey: S.flag.key },
    { alias: "RS-501i 文创系列钢笔", language: "zh", sourceKey: S.flag.key },
    { alias: "RS-501i 国旗钢笔", language: "zh", sourceKey: S.flag.key },
    { alias: "RS-501i 旅行郵件钢笔", language: "zh", sourceKey: S.mail.key },
    { alias: "RS-501i 環島臺灣钢笔", language: "zh", sourceKey: S.island.key },
  ],
  sources: [S.flag, S.mail, S.island, S.catalog, S.accessory, S.about, S.huashan, S.penSvg],
  scopes: [{
    key: penScope,
    scopeKey: penScope,
    validFrom: RETRIEVED,
    productionState: "current",
    nibScope: "官方商品页列 EF；德国原装进口笔尖是页面介绍，不推断具体供应商或尖材。",
    materialScope: "铝合金；官方介绍使用科技阳极铝合金与透明轻量化笔杆。",
    editionScope: "RS-501i 文创系列的主题外观版本；不把同型号的国旗、旅行郵件、環島臺灣、海軍、空軍和联名款拆成独立型号。",
  }],
  claims: [
    {
      key: "phase238-skb-rs501i-identity",
      predicate: "model_identity",
      objectText: "SKB RS-501i 是台湾 SKB 文创系列的具体钢笔型号；官方多张主题商品页的型号栏均写 RS-501i 文创系列，不应按外观名称重复建模。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.catalog.key,
      locator: S.catalog.summary,
      evidence: [
        { key: "phase238-skb-rs501i-identity-catalog", sourceKey: S.catalog.key, scopeKey: penScope, locator: S.catalog.summary },
        { key: "phase238-skb-rs501i-identity-flag", sourceKey: S.flag.key, scopeKey: penScope, locator: S.flag.summary },
      ],
    },
    {
      key: "phase238-skb-rs501i-spec",
      predicate: "specification",
      objectText: "官方国旗版列 EF、RI-60 卡式墨水、#301A 吸墨器、铝合金、总长约 ±13.3 cm、随笔附卡水和吸墨器、台湾产地，并称采用德国原装进口笔尖。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.flag.key,
      locator: S.flag.summary,
      evidence: [{ key: "phase238-skb-rs501i-spec-evidence", sourceKey: S.flag.key, scopeKey: penScope, locator: S.flag.summary }],
    },
    {
      key: "phase238-skb-rs501i-variants",
      predicate: "edition_group",
      objectText: "国旗、旅行郵件、環島臺灣、海軍、空軍及濱線熊联名高雄名物是 RS-501i 的主题或联名版本；现有官方目录没有显示它们改变型号代码、EF 尖、上墨配件或总长。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.catalog.key,
      locator: S.catalog.summary,
      evidence: [
        { key: "phase238-skb-rs501i-variants-catalog", sourceKey: S.catalog.key, scopeKey: penScope, locator: S.catalog.summary },
        { key: "phase238-skb-rs501i-variants-mail", sourceKey: S.mail.key, scopeKey: penScope, locator: S.mail.summary },
        { key: "phase238-skb-rs501i-variants-island", sourceKey: S.island.key, scopeKey: penScope, locator: S.island.summary },
      ],
    },
    {
      key: "phase238-skb-rs501i-accessory-boundary",
      predicate: "accessory_boundary",
      objectText: "官方 #301A 配件页把 RS-501i 列为适用型号，同时把 RS-301N 列为不适用；同品牌不等于吸墨器可互换。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.accessory.key,
      locator: S.accessory.summary,
      evidence: [{ key: "phase238-skb-rs501i-accessory-evidence", sourceKey: S.accessory.key, scopeKey: penScope, locator: S.accessory.summary }],
    },
    {
      key: "phase238-skb-rs501i-history-boundary",
      predicate: "historical_context",
      objectText: "RS-501i 属于 SKB 2012 年重启台湾钢笔制作后的现代文创产品；官方没有公布该型号首发年份，本页不把品牌历史年份改写成 RS-501i 上市年份。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.huashan.key,
      locator: S.huashan.summary,
      evidence: [{ key: "phase238-skb-rs501i-history-evidence", sourceKey: S.huashan.key, scopeKey: penScope, locator: S.huashan.summary }],
    },
    {
      key: "phase238-skb-rs501i-care",
      predicate: "maintenance_boundary",
      objectText: "首次使用先用清水确认 EF 尖、RI-60 或 #301A 的密封与供墨，再使用普通染料墨；避免强酸碱、研磨膏、硬掰笔尖或把 RS-301N 专用件装到本型号。",
      factClass: "editorial",
      confidence: 0.97,
      sourceKey: S.accessory.key,
      locator: S.accessory.summary,
      evidence: [{ key: "phase238-skb-rs501i-care-evidence", sourceKey: S.accessory.key, scopeKey: penScope, locator: "official compatibility boundary; conservative care guidance" }],
    },
  ],
  variants: [
    { key: "phase238-rs501i-flag", name: "国旗钢笔", notes: "青、白、红主题的 RS-501i 商品页；型号栏仍为 RS-501i 文创系列。", sourceKey: S.flag.key, variantKind: "edition_group" },
    { key: "phase238-rs501i-mail", name: "旅行郵件钢笔", notes: "旅行主题外观；官方页面保持 EF、铝合金、RI-60/#301A 和约 13.3 cm。", sourceKey: S.mail.key, variantKind: "edition_group" },
    { key: "phase238-rs501i-island", name: "環島臺灣钢笔", notes: "台湾地理主题外观；不单独建立新型号。", sourceKey: S.island.key, variantKind: "edition_group" },
    { key: "phase238-rs501i-navy", name: "海軍钢笔", notes: "官方文创目录列出的 RS-501i 主题版本；具体库存和图案按商品页核对。", sourceKey: S.catalog.key, variantKind: "edition_group" },
    { key: "phase238-rs501i-air", name: "空軍钢笔", notes: "官方文创目录列出的 RS-501i 主题版本；不推断与其他版本存在结构差异。", sourceKey: S.catalog.key, variantKind: "edition_group" },
    { key: "phase238-rs501i-bear", name: "濱線熊联名高雄名物钢笔", notes: "官方目录列出的联名主题；图案、条码和包装按具体商品页保存。", sourceKey: S.catalog.key, variantKind: "edition_group" },
  ],
  spec: {
    brandEntityId: PHASE238_BRAND_ID,
    values: {
      series_name: "SKB RS-501i 文创系列",
      release_year: "当前官方商品与目录窗口；官方未公布首发年份",
      origin_country: "Taiwan",
      nib: "EF；官方商品介绍称德国原装进口笔尖",
      fill_system: "RI-60 卡式墨水、#301A 吸墨器；随笔附卡式墨水和吸墨器各一",
      material: "铝合金；科技阳极铝合金与透明轻量化笔杆",
      dimensions: "总长约 ±13.3 cm（官方商品页约值）",
      price_range: "官方检索日商品页建议售价约 NT$520；价格与库存会变动",
      status: "当前官方文创目录中的 RS-501i 型号；主题版本按商品页变化",
    },
    evidence: [
      evidence("brand_entity_id", "phase238-rs501i-brand", S.flag.key, penScope, "official RS-501i product identity"),
      evidence("series_name", "phase238-rs501i-series", S.flag.key, penScope, "型号 RS-501i 文创系列"),
      evidence("release_year", "phase238-rs501i-release", S.catalog.key, penScope, "current catalogue window; launch year withheld"),
      evidence("origin_country", "phase238-rs501i-origin", S.flag.key, penScope, "产地 台湾"),
      evidence("nib", "phase238-rs501i-nib", S.flag.key, penScope, "规格 EF; German imported nib wording"),
      evidence("fill_system", "phase238-rs501i-fill", S.flag.key, penScope, "RI-60 and #301A; included accessories"),
      evidence("material", "phase238-rs501i-material", S.flag.key, penScope, "材质 鋁合金"),
      evidence("dimensions", "phase238-rs501i-dimensions", S.flag.key, penScope, "总长 ±13.3cm"),
      evidence("price_range", "phase238-rs501i-price", S.flag.key, penScope, "检索日建议售价; mutable snapshot"),
      evidence("status", "phase238-rs501i-status", S.catalog.key, penScope, "current official catalogue"),
    ],
  },
  timeline: [{ key: "phase238-rs501i-catalogue-window", title: "RS-501i 官方目录核实", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "检索日官方目录与商品页仍列出 RS-501i 及多个主题版本；不据此推断上市年份。", sourceKey: S.catalog.key }],
  media: media(S.penSvg, "phase238-rs501i-primary", "SKB RS-501i 事实图（非产品照片）"),
};

export const phase238SkbRs501iPacks: CuratedEntityPack[] = [brand, pen];
