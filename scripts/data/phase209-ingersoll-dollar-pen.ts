import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE209_INGERSOLL_BRAND_ID = "7ayTZUG4BVgU";
export const PHASE209_DOLLAR_PEN_ID = "OwOqThACQI6M";

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
    registryKey: "fountain-pen-graph-editorial-phase209",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase209",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、刻印、年份、配件或修复状态。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  chronology: live({
    key: "phase209-ingersoll-chronology",
    title: "FountainPen.it：Ingersoll Dollar Pen chronology",
    url: "https://www.fountainpen.it/Chronology",
    registryName: "FountainPen.it",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary:
      "历史索引把 Charles H. Ingersoll 作为 1921 年的 Ingersoll Dollar Pen Company 放入制笔年代线；该年份与公司设立／投产口径不同，正文保留为年代线索。",
    locator: "1921 Ingersoll Dollar Pen Company chronology entry",
  }),
  fpnHistory: live({
    key: "phase209-ingersoll-fpn-history",
    title: "Fountain Pen Network：Charles H. Ingersoll",
    url: "https://www.fountainpennetwork.com/forum/topic/132529-charles-h-ingersoll/",
    registryName: "Fountain Pen Network participants",
    sourceType: "forum",
    tier: "professional_secondary",
    summary:
      "玩家历史资料记录 1924–1931 的公司窗口、镍镀黄铜、赛璐珞／Bakelite、14K 金尖和 stem-winder twist filler 结构。",
    locator: "1924-1931 window, materials, nib and twist filler explanation",
  }),
  fpnSample: live({
    key: "phase209-ingersoll-fpn-sample",
    title: "Fountain Pen Network：C H Ingersoll sample discussion",
    url: "https://www.fountainpennetwork.com/forum/topic/66961-c-h-ingersoll/",
    registryName: "Fountain Pen Network participants",
    sourceType: "forum",
    tier: "professional_secondary",
    summary:
      "另一篇讨论补充 1928–1930 左右的 Bakelite 样本与金属／赛璐珞分代，提醒材料、尾端旋钮和保存脆性按单支核对。",
    locator: "1928-1930 Bakelite sample, material generations and preservation boundary",
  }),
  peyton: live({
    key: "phase209-ingersoll-peyton",
    title: "Peyton Street Pens：Ingersoll Dollar Fountain Pen restored sample",
    url: "https://www.peytonstreetpens.com/ingersoll-dollar-fountain-pen-twist-fill-oversized-orange-celluloid-flexible-fine-14k-nib-excellent-restored.html",
    registryName: "Peyton Street Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "专业修复零售档案记录橙色赛璐珞 oversized 样本、约 5 又 1/2 英寸、原始 twist filler 与 14K flexible fine 尖，并说明恢复方式。",
    locator: "oversized celluloid sample, twist filler, 14K nib and restoration note",
  }),
  peytonRingtop: live({
    key: "phase209-ingersoll-peyton-ringtop",
    title: "Peyton Street Pens：Ingersoll Ringtop Fountain Pen",
    url: "https://www.peytonstreetpens.com/ingersoll-fountain-pen-1920s-black-flexible-fine-14k-nib-excellent-restored.html",
    registryName: "Peyton Street Pens",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary:
      "1930s ringtop 样本记录约 4.5 英寸、黑色杆帽、尾端 twist filler 与 14K flexible fine 尖，作为尺寸和形式差异旁证。",
    locator: "1930s ringtop sample, length and filling boundary",
  }),
  svg: diagram(
    "phase209-ingersoll-dollar-pen-svg",
    "Ingersoll Dollar Pen 事实示意",
    "/images/library/site-original/phase209/ingersoll/dollar-pen.svg",
  ),
} as const;

const brandScope = "ingersoll-brand-scope";
const penScope = "ingersoll-dollar-pen-scope";

function evidence(
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
): CuratedEntityPack["claims"][number]["evidence"][number] {
  return { key, sourceKey, scopeKey, locator };
}

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
    evidence: [sourceKey, ...extra].map((source, index) =>
      evidence(`${key}-evidence-${index + 1}`, source, scopeKey, locator),
    ),
  };
}

function specEvidence(
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return {
    key: `phase209-ingersoll-${fieldKey}`,
    fieldKey,
    sourceKey,
    scopeKey: penScope,
    locator,
  };
}

const brand: CuratedEntityPack = {
  key: "phase209-ingersoll-dollar-pen-brand",
  entityId: PHASE209_INGERSOLL_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "ingersoll",
  canonicalName: "Ingersoll",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/ingersoll-dollar-pen-phase209.md",
  storyTitle: "Ingersoll：从 Dollar Watch 叙事延伸出的历史钢笔",
  primarySourceKey: S.chronology.key,
  depthTier: "B",
  aliases: [
    { alias: "Ingersoll", language: "en", sourceKey: S.chronology.key },
    { alias: "Charles H. Ingersoll", language: "en", sourceKey: S.fpnHistory.key },
    { alias: "Ingersoll Dollar Pen Company", language: "en", sourceKey: S.chronology.key },
    { alias: "英格索尔", language: "zh", sourceKey: S.fpnHistory.key },
  ],
  sources: [S.chronology, S.fpnHistory, S.fpnSample, S.peytonRingtop, S.svg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    productionState: "historical",
    editionScope: "Ingersoll 历史钢笔品牌导航；Dollar Pen、材料代际、ringtop 与修复样本分开核对",
  }],
  claims: [
    claim(
      "ingersoll-brand-identity",
      "brand_identity",
      "Ingersoll 的历史钢笔业务与 Charles H. Ingersoll 相关；1921 年年代索引与 1924 年公司设立口径并存，不能把一个年份当作所有产品的首发年。",
      S.chronology.key,
      brandScope,
      "chronology and company-window boundary",
      [S.fpnHistory.key],
    ),
    claim(
      "ingersoll-brand-navigation",
      "brand_navigation",
      "Dollar Pen 是 Ingersoll 品牌下可独立浏览的核心历史产品线；金属、赛璐珞、Bakelite、ringtop 和 oversized 是版本与尺寸层，不是并列品牌。",
      S.fpnHistory.key,
      brandScope,
      "Dollar Pen family and material-generation navigation",
      [S.peytonRingtop.key],
    ),
  ],
  variants: [],
  media: [{
    key: "phase209-ingersoll-brand-primary",
    title: "Ingersoll Dollar Pen 导航事实图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、刻印、年份或修复状态。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [
    {
      key: "phase209-ingersoll-brand-1921",
      title: "年代索引中的 Ingersoll Dollar Pen Company",
      eventType: "brand_founded",
      startDate: "1921",
      circa: true,
      description: "FountainPen.it chronology 把 Ingersoll Dollar Pen Company 放在 1921 年的制笔年代线上；此处作为索引锚点，区别于公司设立和投产年份。",
      sourceKey: S.chronology.key,
    },
    {
      key: "phase209-ingersoll-brand-1924",
      title: "Charles H. Ingersoll 在 Newark 开始钢笔业务",
      eventType: "design_milestone",
      startDate: "1924",
      circa: false,
      description: "FPN 历史讨论把 Charles H. Ingersoll 的 Dollar Pen Company 设立窗口放在 1924 年。",
      sourceKey: S.fpnHistory.key,
    },
  ],
};

const pen: CuratedEntityPack = {
  key: "phase209-ingersoll-dollar-pen",
  entityId: PHASE209_DOLLAR_PEN_ID,
  expectedType: "pen",
  expectedSlug: "the-ingersoll-dollar-pen",
  canonicalName: "Charles H. Ingersoll Dollar Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/ingersoll-dollar-pen-phase209.md",
  storyTitle: "Ingersoll Dollar Pen：后端 stem-winder 与三代材料边界",
  primarySourceKey: S.fpnHistory.key,
  depthTier: "A",
  aliases: [
    { alias: "Ingersoll Dollar Pen", language: "en", sourceKey: S.fpnHistory.key },
    { alias: "Charles H. Ingersoll Dollar Pen", language: "en", sourceKey: S.fpnHistory.key },
    { alias: "Ingersoll Dollar Fountain Pen", language: "en", sourceKey: S.peyton.key },
    { alias: "英格索尔 Dollar Pen", language: "zh", sourceKey: S.fpnHistory.key },
    { alias: "英格索尔一美元钢笔", language: "zh", sourceKey: S.fpnHistory.key },
  ],
  sources: [S.fpnHistory, S.fpnSample, S.chronology, S.peyton, S.peytonRingtop, S.svg],
  scopes: [{
    key: penScope,
    scopeKey: penScope,
    productionState: "historical",
    editionScope: "1920 年代至约 1931 年的 Dollar Pen 家族；金属、赛璐珞、Bakelite、oversize、junior、ladies 和 ringtop 按实物与年代核对",
  }],
  claims: [
    claim(
      "ingersoll-dollar-identity",
      "model_identity",
      "Dollar Pen 是 Charles H. Ingersoll 在 Newark 经营的历史钢笔产品线，公开资料把生产窗口放在 1924–1931 左右；1921 是年代索引线索，不是每支笔的制造年。",
      S.fpnHistory.key,
      penScope,
      "company window and Dollar Pen model identity",
      [S.chronology.key],
    ),
    claim(
      "ingersoll-dollar-filler",
      "filling_system",
      "核心机构是后端 stem-winder twist filler：外部铆钉或旋钮连接内置塞与墨囊，通过旋转扭压墨囊；修复样本可能改成 button filler，必须按单支记录。",
      S.fpnHistory.key,
      penScope,
      "twist filler, tack and rubber sac construction",
      [S.peyton.key, S.fpnSample.key],
    ),
    claim(
      "ingersoll-dollar-material",
      "material_boundary",
      "镍镀黄铜是早期路线，约 1927 年出现赛璐珞，1928 年左右又出现 Bakelite；三者影响脆性、帽盖、尾端和修复，不互借规格。",
      S.fpnSample.key,
      penScope,
      "metal, celluloid and Bakelite material generations",
      [S.fpnHistory.key, S.peyton.key],
    ),
    claim(
      "ingersoll-dollar-nib",
      "nib_boundary",
      "资料可见 14K Ingersoll 金尖、钢尖和替换尖；flexible fine 或 semi-flex 只代表特定样本，不是 Dollar Pen 的全系承诺。",
      S.peyton.key,
      penScope,
      "restored sample nib markings and writing condition",
      [S.fpnHistory.key],
    ),
    claim(
      "ingersoll-dollar-sizes",
      "variant_boundary",
      "oversize、junior、ladies、ringtop 和 pocket clip 是尺寸／佩戴形式层；约 5 又 1/2 英寸 oversized 样本不能覆盖短 ringtop 或 junior。",
      S.peyton.key,
      penScope,
      "sample lengths and size/form differences",
      [S.peytonRingtop.key, S.fpnSample.key],
    ),
    claim(
      "ingersoll-dollar-care",
      "maintenance_guidance",
      "保存重点是检查裂纹、失镀、脆化墨囊和维修痕迹；清洗用常温水，不用酒精、热水或强抛光，不要对未知 twist filler 强拧或套现代 converter。",
      S.peyton.key,
      penScope,
      "restoration and material-preservation boundary",
      [S.fpnSample.key],
    ),
    claim(
      "ingersoll-dollar-selection",
      "selection_guidance",
      "购买时核对刻印、材料、尾端填充件、笔尖刻字和裂纹；先确认原装 twist、button 改修或无法确认，再判断能否安全装墨。",
      S.peyton.key,
      penScope,
      "restored sample disclosure and purchase checks",
      [S.fpnHistory.key],
    ),
  ],
  variants: [
    { key: "ingersoll-dollar-metal", name: "镍镀黄铜金属路线", notes: "早期金属杆帽与压纹／环饰；失镀露铜不能直接判为原厂纯黄铜。", sourceKey: S.fpnHistory.key, variantKind: "material" },
    { key: "ingersoll-dollar-celluloid", name: "约 1927 起赛璐珞路线", notes: "公开修复档案可见 oversized 与木纹／橙色样本；材料脆性和尾端结构按单支核对。", sourceKey: S.peyton.key, variantKind: "material" },
    { key: "ingersoll-dollar-bakelite", name: "约 1928 起 Bakelite 路线", notes: "常见红黑或黑色样本，尾端旋钮与盲帽细节可能变化。", sourceKey: S.fpnSample.key, variantKind: "material" },
    { key: "ingersoll-dollar-ringtop", name: "Ringtop／短尺寸样本", notes: "1930s ringtop 约 4.5 英寸样本不能与 oversized 长度和帽盖互换。", sourceKey: S.peytonRingtop.key, variantKind: "edition_group" },
  ],
  spec: {
    brandEntityId: PHASE209_INGERSOLL_BRAND_ID,
    values: {
      series_name: "Ingersoll Dollar Pen",
      release_year: "约 1924–1931；1921 为年代索引线索",
      origin_country: "美国 Newark, New Jersey",
      nib: "14K Ingersoll 金尖、钢尖或后配尖；flex 程度按单支",
      fill_system: "后端 stem-winder twist filler；部分修复样本改为 button filler",
      material: "镍镀黄铜、约 1927 起赛璐珞、约 1928 起 Bakelite 等路线",
      dimensions: "样本跨度明显；oversized 约 5 又 1/2 英寸，1930s ringtop 约 4.5 英寸",
      weight: "公开资料未给可覆盖全系的统一值；按单支空／满墨测量",
      status: "历史型号，约 1931 后不再作为连续在产线；修复状态差异大",
    },
    evidence: [
      specEvidence("brand_entity_id", S.fpnHistory.key, "Charles H. Ingersoll maker context"),
      specEvidence("series_name", S.fpnHistory.key, "Dollar Pen model name"),
      specEvidence("release_year", S.chronology.key, "1921 chronology and 1924-1931 secondary window"),
      specEvidence("origin_country", S.fpnHistory.key, "Newark company context"),
      specEvidence("nib", S.peyton.key, "14K and replacement nib sample fields"),
      specEvidence("fill_system", S.fpnHistory.key, "stem-winder twist filler explanation"),
      specEvidence("material", S.fpnSample.key, "metal, celluloid and Bakelite boundary"),
      specEvidence("dimensions", S.peyton.key, "oversized and ringtop sample lengths"),
      specEvidence("weight", S.peyton.key, "no universal family weight asserted"),
      specEvidence("status", S.chronology.key, "historical production window"),
    ],
  },
  media: [{
    key: "phase209-ingersoll-dollar-pen-primary",
    title: "Ingersoll Dollar Pen 历史结构示意图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实颜色、比例、刻印、年份、配件或修复状态。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [
    {
      key: "phase209-ingersoll-dollar-1924",
      title: "Dollar Pen Company 设立窗口",
      eventType: "model_released",
      startDate: "1924",
      circa: true,
      description: "FPN 历史资料把 Charles H. Ingersoll Dollar Pen Company 的 Newark 业务放在 1924 年；这里标记产品线窗口，不精确到单支。",
      sourceKey: S.fpnHistory.key,
    },
    {
      key: "phase209-ingersoll-dollar-material",
      title: "赛璐珞与 Bakelite 材料代际",
      eventType: "design_milestone",
      startDate: "1927",
      circa: true,
      description: "公开档案把赛璐珞放在约 1927 年、Bakelite 放在约 1928 年；材料切换不是全系统一换代。",
      sourceKey: S.fpnSample.key,
    },
  ],
};

export const phase209IngersollDollarPenPacks: CuratedEntityPack[] = [brand, pen];
