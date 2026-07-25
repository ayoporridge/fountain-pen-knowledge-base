import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE212_DUNN_BRAND_ID = "pwbUeoKAp7xI";
export const PHASE212_DUNN_PEN_ID = "Jfj3aTwb70wG";

function live(input: {
  key: string;
  title: string;
  url: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
  independenceGroup?: string;
}): CuratedSource {
  return {
    ...input,
    registryKey: `${input.key}-registry`,
    independenceGroup: input.independenceGroup ?? `${input.key}-group`,
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
    registryKey: "fountain-pen-graph-editorial-phase212",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase212",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、刻印、年份、材料或保存状态。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  chronology: live({
    key: "phase212-dunn-chronology",
    title: "FountainPen.it：Dunn chronology",
    url: "https://www.fountainpen.it/Chronology",
    registryName: "FountainPen.it",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary:
      "年代线把 Dunn 放在 1921 年纽约成立的 The Dunn Pen and Pencil Company, Inc.，为公司窗口提供历史索引锚点。",
    locator: "1921 Dunn company entry",
    independenceGroup: "fountainpen-dunn-chronology",
  }),
  patent: live({
    key: "phase212-dunn-patent",
    title: "FountainPen.it：Charles Dunn US 1,359,880 patent",
    url: "https://www.fountainpen.it/File%3APatent-US-1359880.pdf",
    registryName: "FountainPen.it patent archive",
    sourceType: "patent",
    tier: "primary",
    summary:
      "专利档案记录 Charles Dunn 的 self-filling fountain-pen，专利号 1,359,880，1920 年 11 月 23 日授权；是泵式机构的原始证据。",
    locator: "US 1,359,880, issued 1920-11-23, self-filling fountain-pen",
    independenceGroup: "fountainpen-dunn-patent-1359880",
  }),
  vintage: live({
    key: "phase212-dunn-vintagepens",
    title: "Vintage Pens：Dunn Pens",
    url: "https://vintagepens.com/Dunn.shtml",
    registryName: "Vintage Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "专业历史整理覆盖 1921–1925 公司窗口、泵式结构、cork seal、材料变化、Tanks／Dreadnaught 边界与多尺寸产品线。",
    locator: "company history, pump mechanism, seals, material and size chronology",
    independenceGroup: "vintagepens-dunn-history",
  }),
  richard: live({
    key: "phase212-dunn-richardspens",
    title: "Richard's Pens：The Dunn-Pen",
    url: "https://www.richardspens.com/ref/profiles/dunn.htm",
    registryName: "Richard's Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "资料以 Little Red Pump-Handle、高容量广告、1921 公司语境和材料／产品故事为入口，补充收藏者理解 Dunn 的方法。",
    locator: "Little Red Pump-Handle, capacity advertising and Dunn profile",
    independenceGroup: "richardspens-dunn-profile",
  }),
  filler: live({
    key: "phase212-dunn-filler-guide",
    title: "Vintage Pens：Pump-filler filling instructions",
    url: "https://www.vintagepens.com/filling_instructions_pump-fillers.shtml",
    registryName: "Vintage Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "泵式上墨说明把 Dunn 与其它 pump filler 区分开，解释泵杆、活塞、吸墨与维修边界；用于正文的机制和安全提示。",
    locator: "Dunn pump filler mechanism and filling instructions",
    independenceGroup: "vintagepens-pump-filler-guide",
  }),
  peyton: live({
    key: "phase212-dunn-peyton",
    title: "Peyton Street Pens：Dunn oversize restored sample",
    url: "https://www.peytonstreetpens.com/dunn-oversize-fountain-pen-1920s-black-w-gt-red-pump-handle-fine-flexible-camel-nib-excellent-restored.html",
    registryName: "Peyton Street Pens",
    sourceType: "retailer",
    tier: "retailer",
    summary:
      "修复样本记录黑色 oversize、红色泵杆、Camel 尖和实际恢复状态；数据仅代表该支实物。",
    locator: "oversize sample, red pump handle, Camel nib and restoration disclosure",
  }),
  svg: diagram(
    "phase212-dunn-pen-svg",
    "The Dunn-Pen 事实示意",
    "/images/library/site-original/phase212/dunn/dunn-pen.svg",
  ),
} as const;

const brandScope = "dunn-brand-scope";
const penScope = "dunn-pen-scope";

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  extra: string[] = [],
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.95,
    sourceKey,
    locator,
    evidence: [sourceKey, ...extra].map((source, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: source,
      scopeKey,
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
    key: `phase212-dunn-${fieldKey}`,
    fieldKey,
    sourceKey,
    scopeKey: penScope,
    locator,
  };
}

const brand: CuratedEntityPack = {
  key: "phase212-dunn-pen-brand",
  entityId: PHASE212_DUNN_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "dunn",
  canonicalName: "Dunn",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/dunn-brand-phase212.md",
  storyTitle: "Dunn：把专利泵式上墨做成一条短命产品线",
  primarySourceKey: S.patent.key,
  depthTier: "B",
  aliases: [
    { alias: "Dunn", language: "en", sourceKey: S.chronology.key },
    { alias: "Dunn-Pen Company", language: "en", sourceKey: S.vintage.key },
    { alias: "Dunn Pen and Pencil, Inc.", language: "en", sourceKey: S.vintage.key, kind: "producer_name" },
    { alias: "邓恩钢笔", language: "zh", sourceKey: S.richard.key },
  ],
  sources: [S.chronology, S.patent, S.vintage, S.richard, S.filler, S.svg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    productionState: "historical",
    editionScope: "Dunn 历史品牌导航；泵式机构、材料、尺寸和 Dreadnaught／Tanks 名称按型号层核对",
  }],
  claims: [
    claim(
      "dunn-brand-identity",
      "brand_identity",
      "Dunn-Pen 是 1921 年前后在纽约经营的历史钢笔公司，核心产品围绕 Charles Dunn 的 self-filling pump 专利；1924 年破产与重组构成品牌时间边界。",
      S.vintage.key,
      brandScope,
      "1921 production, 1924 bankruptcy and reorganization",
      [S.chronology.key, S.patent.key],
    ),
    claim(
      "dunn-brand-mechanism",
      "mechanism_identity",
      "红色或橙色 pump handle、活塞／泵杆和尾端 cork seal 是 Dunn 的核心识别语汇；不是普通 lever filler 的换色版本。",
      S.vintage.key,
      brandScope,
      "red pump handle, piston and cork seal",
      [S.filler.key, S.richard.key],
    ),
    claim(
      "dunn-brand-navigation",
      "brand_navigation",
      "Humming Bird、Camel、Senior、Baby Camel、Society、Majority、Dreadnaught 与 Tanks 属于尺寸／产品线层，品牌页只导航，不把名称直接当作统一规格。",
      S.vintage.key,
      brandScope,
      "size and model naming boundary",
      [S.richard.key],
    ),
  ],
  variants: [],
  media: [{
    key: "phase212-dunn-brand-primary",
    title: "Dunn 泵式产品线示意图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、材料、刻印或保存状态。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [
    {
      key: "phase212-dunn-patent-1920",
      title: "Charles Dunn 泵式钢笔专利授权",
      eventType: "patent_filed",
      startDate: "1920-11-23",
      circa: false,
      description: "US 1,359,880 以 Charles Dunn 为发明人，标题为 self-filling fountain-pen，是 Dunn 泵式产品的原始技术锚点。",
      sourceKey: S.patent.key,
    },
    {
      key: "phase212-dunn-company-1921",
      title: "Dunn-Pen Company 开始生产",
      eventType: "brand_founded",
      startDate: "1921",
      circa: false,
      description: "FountainPen.it 年代线与 VintagePens 历史资料把 Dunn 公司和生产窗口放在 1921 年纽约。",
      sourceKey: S.chronology.key,
    },
    {
      key: "phase212-dunn-reorg-1924",
      title: "Dunn Pen and Pencil 重组生产",
      eventType: "acquisition",
      startDate: "1924",
      circa: true,
      description: "VintagePens 记录债权人在 1924 年公司倒闭后恢复生产，但重组公司存续时间不长。",
      sourceKey: S.vintage.key,
    },
  ],
};

const pen: CuratedEntityPack = {
  key: "phase212-dunn-pen",
  entityId: PHASE212_DUNN_PEN_ID,
  expectedType: "pen",
  expectedSlug: "the-dunn-pen",
  canonicalName: "The Dunn-Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/dunn-pen-phase212.md",
  storyTitle: "The Dunn-Pen：红色泵杆与高容量活塞",
  primarySourceKey: S.patent.key,
  depthTier: "A",
  aliases: [
    { alias: "The Dunn-Pen", language: "en", sourceKey: S.richard.key },
    { alias: "Dunn-Pen", language: "en", sourceKey: S.vintage.key },
    { alias: "Dunn pump filler", language: "en", sourceKey: S.filler.key },
    { alias: "邓恩泵式钢笔", language: "zh", sourceKey: S.vintage.key },
  ],
  sources: [S.chronology, S.patent, S.vintage, S.richard, S.filler, S.peyton, S.svg],
  scopes: [{
    key: penScope,
    scopeKey: penScope,
    productionState: "historical",
    editionScope: "1921–1924 左右的 Dunn-Pen；泵式、红／橙泵杆、透明 Tattler、Dreadnaught／Tanks 与多尺寸按单支核对",
  }],
  claims: [
    claim(
      "dunn-pen-identity",
      "model_identity",
      "The Dunn-Pen 是 1921 年推出的 Dunn 高容量泵式钢笔，产品窗口随 Dunn-Pen Company 1924 年破产和重组而缩短。",
      S.vintage.key,
      penScope,
      "1921 production and 1924 company boundary",
      [S.chronology.key, S.patent.key],
    ),
    claim(
      "dunn-pen-filler",
      "filling_system",
      "泵杆带动 barrel 内活塞上下移动，排气后吸入墨水，通常以尾端 cork seal 维持密封；不是 sac filler，也不能套现代 converter。",
      S.vintage.key,
      penScope,
      "pump rod, piston and cork seal mechanism",
      [S.patent.key, S.filler.key],
    ),
    claim(
      "dunn-pen-material",
      "material_boundary",
      "早期泵杆可为橙色 hard rubber，后期多见半透明红色 casein；透明 barrel 早期可能为 Bakelite，后来多见 celluloid，材料决定脆化和维修风险。",
      S.vintage.key,
      penScope,
      "hard rubber, casein, Bakelite and celluloid boundary",
      [S.richard.key],
    ),
    claim(
      "dunn-pen-size",
      "variant_boundary",
      "Humming Bird、ringtop、常规、oversize、Dreadnaught 与 Tanks 覆盖不同尺寸；Dreadnaught 的两件式帽盖和 Tank 的超大尺寸不能互相替代。",
      S.vintage.key,
      penScope,
      "size range, Dreadnaught cap and Tank naming",
      [S.peyton.key, S.richard.key],
    ),
    claim(
      "dunn-pen-nib",
      "nib_boundary",
      "Dunn 样本可见不同尺寸和 Camel 等尖刻字；柔尖或 #12 大尖只代表单支或特定尺寸，不是全系承诺。",
      S.peyton.key,
      penScope,
      "restored sample nib and individual configuration",
      [S.vintage.key],
    ),
    claim(
      "dunn-pen-care",
      "maintenance_guidance",
      "上墨前先确认泵杆、活塞、cork、透明 barrel 和 casein 尾钮没有裂纹或失效；清洗用常温水，避免强拧、热水、酒精和长期浸泡。",
      S.filler.key,
      penScope,
      "pump-filler filling safety and material care",
      [S.vintage.key, S.peyton.key],
    ),
    claim(
      "dunn-pen-selection",
      "selection_guidance",
      "选购时记录桶身与尖刻印、泵杆材质、帽盖是否两件式、barrel 透明度、合帽长度和维修披露；商品写 Dreadnaught 或 oversize 不足以证明版本。",
      S.vintage.key,
      penScope,
      "individual identification and restoration boundary",
      [S.peyton.key, S.richard.key],
    ),
  ],
  variants: [
    {
      key: "dunn-pen-hard-rubber-pump",
      name: "早期 hard-rubber 泵杆",
      notes: "橙色或深色硬橡胶泵杆；不带后期 casein 的螺纹和脆化特征。",
      sourceKey: S.vintage.key,
      variantKind: "material",
      releaseYear: "约 1921–1923",
    },
    {
      key: "dunn-pen-casein-pump",
      name: "半透明红色 casein 泵杆",
      notes: "后期常见红色半透明泵杆，老化后容易裂、崩和染色。",
      sourceKey: S.vintage.key,
      variantKind: "material",
      releaseYear: "约 1923–1924",
    },
    {
      key: "dunn-pen-tattler",
      name: "Tattler 透明 barrel",
      notes: "透明 barrel 可见 Bakelite 或 celluloid 材料代际，必须按单支检查收缩和裂纹。",
      sourceKey: S.vintage.key,
      variantKind: "material",
    },
    {
      key: "dunn-pen-dreadnaught",
      name: "Dreadnaught 两件式帽盖",
      notes: "上半帽盖可旋下、笔尖周围留保护 cage；不与所有超大 Dunn 或 Tanks 同义。",
      sourceKey: S.vintage.key,
      variantKind: "edition_group",
      releaseYear: "约 1922–1924",
    },
  ],
  spec: {
    brandEntityId: PHASE212_DUNN_BRAND_ID,
    values: {
      series_name: "Dunn-Pen",
      release_year: "1921–1924 左右；1920 专利是技术锚点",
      origin_country: "美国纽约州 New York City",
      nib: "多种尺寸与刻字；Camel、普通和大型尖按单支核对",
      fill_system: "pump filler；活塞杆 + barrel + cork seal",
      material: "hard rubber、casein 泵杆；Bakelite／celluloid 透明 barrel；少量 overlay",
      dimensions: "从 #1 Humming Bird 到约 8.5 英寸大型样本；Dreadnaught 尺寸多样",
      weight: "公开资料未给可覆盖全族的统一值",
      price_range: "早期约 4 美元起，具体尺寸和广告版本不同；不作为当前估值",
      status: "历史型号，约 1924 年公司破产与重组后不再连续在产",
    },
    evidence: [
      specEvidence("brand_entity_id", S.patent.key, "Charles Dunn assignee and inventor"),
      specEvidence("series_name", S.richard.key, "The Dunn-Pen model name"),
      specEvidence("release_year", S.chronology.key, "1921 company and production window"),
      specEvidence("origin_country", S.vintage.key, "New York company history"),
      specEvidence("nib", S.peyton.key, "restored sample nib"),
      specEvidence("fill_system", S.patent.key, "self-filling pump patent"),
      specEvidence("material", S.vintage.key, "hard rubber, casein, Bakelite and celluloid"),
      specEvidence("dimensions", S.vintage.key, "Humming Bird through large Tanks/Dreadnaught sizes"),
      specEvidence("weight", S.peyton.key, "no universal family weight asserted"),
      specEvidence("price_range", S.vintage.key, "historical price context"),
      specEvidence("status", S.vintage.key, "1924 bankruptcy and reorganization"),
    ],
  },
  media: [{
    key: "phase212-dunn-pen-primary",
    title: "The Dunn-Pen 泵式结构示意图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、材料、刻印或保存状态。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [
    {
      key: "phase212-dunn-pen-patent",
      title: "Dunn 泵式机构专利授权",
      eventType: "patent_filed",
      startDate: "1920-11-23",
      circa: false,
      description: "Charles Dunn 的 US 1,359,880 self-filling fountain-pen 专利是 The Dunn-Pen 泵式结构的原始技术来源。",
      sourceKey: S.patent.key,
    },
    {
      key: "phase212-dunn-pen-launch",
      title: "The Dunn-Pen 上市",
      eventType: "model_released",
      startDate: "1921",
      circa: false,
      description: "Dunn-Pen Company 以 Little Red Pump-Handle 广告推出高容量泵式钢笔。",
      sourceKey: S.richard.key,
    },
    {
      key: "phase212-dunn-pen-reorg",
      title: "公司破产与 Dunn Pen and Pencil 重组",
      eventType: "acquisition",
      startDate: "1924",
      circa: true,
      description: "债权人恢复生产的短暂阶段造成后期泵杆、帽盖和材料样本差异，不能将其当作单一批次。",
      sourceKey: S.vintage.key,
    },
  ],
};

export const phase212DunnPenPacks: CuratedEntityPack[] = [brand, pen];
