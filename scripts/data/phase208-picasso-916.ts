import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE208_PICASSO_BRAND_ID = "5zbJPFGxfCXu";
export const PHASE208_PICASSO_916_ID = "FZaeo2DF5_Qd";

function live(input: {
  key: string;
  title: string;
  url: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    ...input,
    registryKey: `${input.key}-registry`,
    independenceGroup: `${input.key}-group`,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase208",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase208",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、Logo、尖宽、包装或生产批次。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  officialBrand: live({
    key: "phase208-picasso-official-brand",
    title: "毕加索钢笔官网：公司简介",
    url: "https://www.sh-picasso.com/index.php?a=lists&c=index&catid=13&m=content",
    registryName: "毕加索钢笔官方网站",
    sourceType: "official",
    tier: "primary",
    summary:
      "官方公司简介说明上海帕弗洛 2003 年成立并研发、设计、生产、销售毕加索品牌书写工具；同时列出金笔、铱金笔、美工笔和宝珠笔等产品范围。",
    locator: "company founding, product scope and manufacturing overview",
  }),
  officialHome: live({
    key: "phase208-picasso-official-home",
    title: "毕加索钢笔官网首页：品牌概述",
    url: "https://www.sh-picasso.com/",
    registryName: "毕加索钢笔官方网站",
    sourceType: "official",
    tier: "contemporary_archive",
    summary:
      "官网首页并列呈现 1988 年品牌叙事和 2003 年钢笔品牌问世，定位为把艺术设计、色彩和书写工具结合的品牌。",
    locator: "brand overview, 1988 narrative and 2003 pen-brand milestone",
  }),
  official916: live({
    key: "phase208-picasso-916-official",
    title: "毕加索钢笔官网：马拉加 Malaga_916",
    url: "https://www.sh-picasso.com/index.php?a=show&c=index&catid=26&id=29&m=content",
    registryName: "毕加索钢笔官方网站",
    sourceType: "official",
    tier: "primary",
    summary:
      "官方 916 页面列出 Malaga_916、铱金笔／财务笔／美工笔等类型、八种颜色，以及喷漆、移印、磷铜笔夹和机械刻字工艺；设计灵感指向毕加索出生地马拉加。",
    locator: "Malaga_916 product identity, types, colours, materials and design concept",
  }),
  officialCare: live({
    key: "phase208-picasso-official-care",
    title: "毕加索钢笔官网：售后服务指南",
    url: "https://www.sh-picasso.com/index.php?a=lists&c=index&catid=19&m=content",
    registryName: "毕加索钢笔官方网站",
    sourceType: "official",
    tier: "contemporary_archive",
    summary:
      "官方售后指南建议换墨前温水清洗、长期闲置前排空、避免高温和有机溶剂，并提醒不要自行拆卸供墨结构。",
    locator: "cleaning, ink-change, storage and non-disassembly guidance",
  }),
  officialCollab: live({
    key: "phase208-picasso-916-doraemon",
    title: "毕加索官网：哆啦 A 梦联名使用 916#马拉加",
    url: "https://www.sh-picasso.com/index.php?a=show&c=index&catid=7&id=44&m=content",
    registryName: "毕加索钢笔官方网站",
    sourceType: "official",
    tier: "contemporary_archive",
    summary:
      "官方新闻明确哆啦 A 梦联名礼盒以 916#马拉加钢笔为基础，并在笔身和包装加入联名图案与配套物料。",
    locator: "916 Malaga licensed collaboration and package boundary",
  }),
  fpn: live({
    key: "phase208-picasso-916-fpn",
    title: "Fountain Pen Network：Picasso 916 Review",
    url: "https://www.fountainpennetwork.com/forum/topic/247899-picasso-916-review/",
    registryName: "Fountain Pen Network participants",
    sourceType: "forum",
    tier: "professional_secondary",
    summary:
      "独立评测样本记录珐琅黄铜杆、银色饰件、旋转转换器、标准国际墨囊与钢尖；后续回复也展示清洗后出墨改善的单支经验。",
    locator: "2013 sample material, filling, nib and cleaning observations",
  }),
  retailer: live({
    key: "phase208-picasso-916-retailer",
    title: "Etsy：Picasso PS-916 规格样本",
    url: "https://www.etsy.com/listing/744719405/picasso-916-metal-fountain-pen-black",
    registryName: "Etsy seller listing",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary:
      "商品样本将型号写为 PS-916，列出金属、推盖、转换器、钢尖选项及约 136 mm、12 mm、28 g 的销售测量；这些数据仅作 SKU 样本核对。",
    locator: "PS-916 listing fields, sample dimensions, cap and converter",
  }),
  svg: diagram(
    "phase208-picasso-916-svg",
    "Picasso 916 Malaga 事实示意",
    "/images/library/site-original/phase208/picasso/picasso-916.svg",
  ),
} as const;

const scope = "picasso-916-model";

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  extraEvidence: string[] = [],
  claimScope = scope,
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.95,
    sourceKey,
    locator,
    evidence: [sourceKey, ...extraEvidence].map((keyPart, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: keyPart,
      scopeKey: claimScope,
      locator,
    })),
  };
}

function specEvidence(
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return {
    key: `phase208-picasso-916-${fieldKey}`,
    fieldKey,
    sourceKey,
    scopeKey: scope,
    locator,
  };
}

const brand: CuratedEntityPack = {
  key: "phase208-picasso-916-brand",
  entityId: PHASE208_PICASSO_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "picasso",
  canonicalName: "毕加索 Picasso",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/picasso-916-phase208.md",
  storyTitle: "毕加索 Picasso：把艺术设计落到可核对的钢笔型号",
  primarySourceKey: S.officialBrand.key,
  depthTier: "B",
  aliases: [
    { alias: "Picasso", language: "en", sourceKey: S.officialHome.key },
    { alias: "Picasso Pens", language: "en", sourceKey: S.officialBrand.key },
    { alias: "毕加索钢笔", language: "zh", sourceKey: S.officialBrand.key },
    { alias: "上海帕弗洛", language: "zh", sourceKey: S.officialBrand.key },
  ],
  sources: [
    S.officialBrand,
    S.officialHome,
    S.official916,
    S.officialCare,
    S.fpn,
    S.svg,
  ],
  scopes: [{
    key: "picasso-brand-scope",
    scopeKey: "picasso-brand-scope",
    productionState: "current",
    editionScope: "毕加索品牌导航；具体系列、颜色、书写模式与商品号分开核对",
  }],
  claims: [
    claim(
      "picasso-brand-identity",
      "brand_identity",
      "毕加索钢笔是上海帕弗洛文化用品有限公司经营的中国书写工具品牌；官网公司资料称公司 2003 年成立，首页另保留 1988 年品牌叙事锚点。",
      S.officialBrand.key,
      "company overview and brand overview",
      [S.officialHome.key],
      "picasso-brand-scope",
    ),
    claim(
      "picasso-brand-scope",
      "brand_navigation",
      "品牌目录同时包含金笔、铱金笔、美工笔、宝珠笔和配套产品；品牌页导航必须区分钢笔与其它书写模式，不用一张图片代表全部产品。",
      S.officialBrand.key,
      "declared product categories",
      [S.fpn.key],
      "picasso-brand-scope",
    ),
    claim(
      "picasso-brand-916",
      "series_navigation",
      "Malaga／自然系列的 PS-916 是可独立浏览的钢笔型号；颜色、联名礼盒和尖形属于该型号的版本／SKU 层。",
      S.official916.key,
      "Malaga_916 product page and official catalogue context",
      [],
      "picasso-brand-scope",
    ),
  ],
  variants: [],
  media: [{
    key: "phase208-picasso-brand-primary",
    title: "毕加索品牌与 916 导航事实图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo 或包装。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [
    {
      key: "phase208-picasso-brand-2003",
      title: "上海帕弗洛公司成立",
      eventType: "brand_founded",
      startDate: "2003",
      circa: false,
      description: "官方公司简介把上海帕弗洛文化用品有限公司的成立年份写为 2003 年。",
      sourceKey: S.officialBrand.key,
    },
    {
      key: "phase208-picasso-brand-lab",
      title: "设计创新中心与钢笔实验室",
      eventType: "design_milestone",
      startDate: "2016",
      circa: false,
      description: "官方公司简介称 2016 年设立毕加索设计创新中心及钢笔实验室；这是研发组织节点，不是某支型号的首发年。",
      sourceKey: S.officialBrand.key,
    },
  ],
};

const pen: CuratedEntityPack = {
  key: "phase208-picasso-916",
  entityId: PHASE208_PICASSO_916_ID,
  expectedType: "pen",
  expectedSlug: "毕加索-picasso-916",
  canonicalName: "毕加索 Picasso Malaga 916",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/picasso-916-phase208.md",
  storyTitle: "Picasso Malaga 916：彩色涂装金属杆与标准国际接口",
  primarySourceKey: S.official916.key,
  depthTier: "A",
  aliases: [
    { alias: "Picasso 916", language: "en", sourceKey: S.official916.key },
    { alias: "Picasso PS-916", language: "en", sourceKey: S.retailer.key },
    { alias: "Malaga 916", language: "en", sourceKey: S.official916.key },
    { alias: "毕加索 916", language: "zh", sourceKey: S.official916.key },
    { alias: "马拉加 916", language: "zh", sourceKey: S.official916.key },
    { alias: "916#自然系列", language: "zh", sourceKey: S.official916.key },
  ],
  sources: [
    S.official916,
    S.officialBrand,
    S.officialCare,
    S.officialCollab,
    S.fpn,
    S.retailer,
    S.svg,
  ],
  scopes: [{
    key: scope,
    scopeKey: "picasso-916-colours-and-nibs",
    productionState: "current",
    editionScope: "PS-916／Malaga 916 钢笔；颜色、联名、钢／铱金尖、财务尖和弯尖按具体 SKU 核对，不覆盖同品牌宝珠笔或其它型号",
  }],
  claims: [
    claim(
      "picasso-916-identity",
      "model_identity",
      "Picasso Malaga 916（PS-916）是毕加索官网的马拉加／自然系列钢笔条目；“Malaga”“916#自然系列”和 PS-916 是同一型号线索，不是三个实体。",
      S.official916.key,
      "Malaga_916 title, product list and PS-916 listing",
      [S.retailer.key],
    ),
    claim(
      "picasso-916-material",
      "material_boundary",
      "官方工艺页记录喷漆笔杆、移印套口圈 Logo、磷铜笔夹与机械刻字；独立样本把笔身描述为珐琅涂层黄铜，因此本页以涂装金属杆帽作为稳定识别，不把单支样本牌号外推到所有批次。",
      S.official916.key,
      "painting, transfer printing, phosphor bronze clip and engraving",
      [S.fpn.key],
    ),
    claim(
      "picasso-916-nib",
      "nib_boundary",
      "官网将 916 条目列入铱金笔、财务笔和美工笔等类型；常见钢／铱金尖、EF／F／M 或弯尖属于具体选项，铱金销售称呼不等于金尖，也不代表全系列具备软弹。",
      S.official916.key,
      "product types and nib option boundary",
      [S.fpn.key, S.retailer.key],
    ),
    claim(
      "picasso-916-filling",
      "filling_system",
      "FPN 样本和商品页记录旋转转换器与标准国际墨囊路线；不同套装是否附转换器或墨水需按商品号核对。",
      S.fpn.key,
      "converter and standard international cartridge observations",
      [S.retailer.key],
    ),
    claim(
      "picasso-916-variants",
      "variant_boundary",
      "亮黑、法兰红、橙黄、淡绿、淡粉、淡蓝、亮白和土豪金是官方列出的颜色选项；哆啦 A 梦联名使用 916#马拉加作为基础型号，新增的是图案与套装，不应另造基础机械型号。",
      S.official916.key,
      "eight colours and licensed collaboration boundary",
      [S.officialCollab.key],
    ),
    claim(
      "picasso-916-care",
      "maintenance_guidance",
      "按官方指南，换墨前用常温或微温水排空清洗，长期闲置前清洁并晾干；避免高温、酒精和酸碱溶剂，不要自行拆卸供墨结构。",
      S.officialCare.key,
      "official after-sales cleaning and storage guidance",
    ),
    claim(
      "picasso-916-selection",
      "selection_guidance",
      "购买时核对 916／Malaga／PS-916 刻字、颜色、尖形、钢笔书写模式和转换器清单；只写 Picasso 金属笔而没有型号证据的商品不能直接归入本页。",
      S.official916.key,
      "model and writing-mode selection boundary",
      [S.retailer.key],
    ),
  ],
  variants: [
    { key: "picasso-916-colours", name: "Malaga 916 八色涂装", notes: "官方列亮黑、法兰红、橙黄、淡绿、淡粉、淡蓝、亮白和土豪金；屏幕颜色与实物批次需复核。", sourceKey: S.official916.key, variantKind: "color" },
    { key: "picasso-916-nib-options", name: "钢／铱金、财务与弯尖选项", notes: "产品类型和商品尖形随 SKU 变化；不把财务或弯尖写成全系列固定配置。", sourceKey: S.official916.key, variantKind: "nib" },
    { key: "picasso-916-doraemon", name: "916#马拉加哆啦 A 梦联名礼盒", notes: "以 916 为基础加入授权图案和礼盒物料；联名图案、墨水和保修卡不回填普通颜色。", sourceKey: S.officialCollab.key, variantKind: "edition_group" },
  ],
  spec: {
    brandEntityId: PHASE208_PICASSO_BRAND_ID,
    values: {
      series_name: "Picasso Malaga 916／PS-916",
      release_year: "官网当前产品条目；具体首发年未在本批来源中固定",
      origin_country: "中国上海帕弗洛毕加索产品线；具体批次按包装核对",
      nib: "钢／铱金尖；EF／F／M、财务或弯尖按具体 SKU",
      fill_system: "标准国际墨囊／旋转转换器路线；套装配件按 SKU",
      material: "涂装金属杆帽；官方列喷漆、磷铜笔夹和机械刻字",
      dimensions: "第三方 PS-916 商品样本约 136 mm 合盖、12 mm 直径；非全系列统一厂规",
      weight: "第三方 PS-916 商品样本约 28 g；按具体颜色与空／满墨状态复核",
      status: "官网当前 Malaga_916／916#自然系列产品条目；颜色与联名随市场变化",
    },
    evidence: [
      specEvidence("brand_entity_id", S.officialBrand.key, "Picasso brand identity"),
      specEvidence("series_name", S.official916.key, "Malaga_916 title and PS-916 listing"),
      specEvidence("release_year", S.official916.key, "current product page without asserted launch year"),
      specEvidence("origin_country", S.officialBrand.key, "Shanghai Pafuluo company context"),
      specEvidence("nib", S.official916.key, "official product types and retailer nib options"),
      specEvidence("fill_system", S.fpn.key, "converter and standard international cartridge sample"),
      specEvidence("material", S.official916.key, "paint, phosphor bronze clip and engraving"),
      specEvidence("dimensions", S.retailer.key, "third-party PS-916 sample measurement"),
      specEvidence("weight", S.retailer.key, "third-party PS-916 sample measurement"),
      specEvidence("status", S.official916.key, "current official product listing"),
    ],
  },
  media: [{
    key: "phase208-picasso-916-primary",
    title: "Picasso Malaga 916 事实示意图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、尖宽、包装或生产批次。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [{
    key: "phase208-picasso-916-window",
    title: "Malaga 916 进入官网产品目录",
    eventType: "model_released",
    startDate: "2010",
    circa: true,
    description: "官网当前页面和历史联名新闻均使用 Malaga／916#马拉加名称；本时间只表示公开资料窗口，不断言具体首发年。",
    sourceKey: S.official916.key,
  }],
};

export const phase208Picasso916Packs: CuratedEntityPack[] = [brand, pen];
