import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE426_BRAND_IDS,
  phase426BrandDepthRefreshPacks,
} from "./phase426-brand-depth-refresh";

export const PHASE586_LAMY_BRAND_ID = PHASE426_BRAND_IDS.lamy;
export const PHASE586_IDS = {
  lx: "phase586-lamy-lx",
  dialogCc: "phase586-lamy-dialog-cc",
} as const;

export const PHASE586_SLUGS = {
  lx: "lamy-lx",
  dialogCc: "lamy-dialog-cc",
} as const;

const RETRIEVED = "2026-08-11";

function web(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
  > & { locator: string },
): CuratedSource {
  const { locator, ...source } = input;
  return {
    ...source,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}`,
  };
}

function lamyOfficial(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  itemType?: string;
  publishedAt?: string;
}): CuratedSource {
  return web({
    ...input,
    registryKey: "lamy-official-phase584",
    registryName: "C. Josef Lamy GmbH",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "lamy-official",
    homepageUrl: "https://www.lamy.com/",
    author: "C. Josef Lamy GmbH",
  });
}

function editorial(key: "lx" | "dialog-cc", title: string): CuratedSource {
  const localPath = `/images/library/site-original/phase586/lamy/lamy-${key}.svg`;
  return {
    key: `phase586-lamy-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase586-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase586-${key}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片；不复刻品牌标识、真实颜色、表面、机构剖面或比例。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;dimensions=1600x900`,
  };
}

function specEvidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

const common = {
  nibGuide: lamyOfficial({
    key: "phase586-lamy-nib-guide",
    title: "LAMY nibs",
    url: "https://www.lamy.com/en-de/equipment-accessories/nibs",
    summary:
      "官方区分 EF／F、M、B／BB、钢尖和 14K 金尖，并说明线宽应按字形、角度和个人偏好选择。",
    locator:
      "nib grade and material sections: EF/F, M, B/BB, PVD steel nibs and 14-carat gold nib boundaries",
  }),
  care: lamyOfficial({
    key: "phase586-lamy-fountain-pen-care",
    title: "LAMY Care tips: Fountain Pens",
    url: "https://www.lamy.com/en-gb/care-tips-for-fountain-pens",
    summary:
      "官方护理入口分别列换墨囊、dialog 清洁、converter filling 与 converter cleaning。",
    locator:
      "fountain-pen care menu: cartridge changing, LAMY dialog cleaning, converter filling and converter cleaning",
  }),
};

const lx = {
  official: lamyOfficial({
    key: "phase586-lamy-lx-official",
    title: "LAMY Lx Fountain Pen ruthenium",
    url: "https://www.lamy.com/en-us/p/lamy-lx-fountain-pen",
    summary:
      "当前美国页列 marron／palladium／rosegold／ruthenium、EF/F/M/B、阳极氧化铝、同色金属细节、黑色 PVD 钢尖、T10／Z28 以及当前 ruthenium 的 140 mm、24 g、4031496。",
    locator:
      "lines 254-316: current colors, nib grades, anodised aluminium, matching metal trim, black PVD steel nib, T10/Z28, metal case, 12x12x140 mm, 24 g and item 4031496",
  }),
  design: lamyOfficial({
    key: "phase586-lamy-lx-design",
    title: "The LAMY Design: LAMY Lx",
    url: "https://www.lamy.com/fr/design",
    summary:
      "LAMY 官方设计里程碑将 Lx 描述为阳极氧化铝配贵金属细节的独立产品图标。",
    locator:
      "LAMY Design Milestones, LAMY Lx: aluminium, precious-metal details and sophisticated anodised finish",
  }),
  launch2016: web({
    key: "phase586-lamy-lx-penchalet-2016",
    registryKey: "pen-chalet-phase586-lx",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "pen-chalet",
    title: "The LAMY Lx Fountain Pen, Live Deluxe!",
    url: "https://www.penchalet.com/blog/lamy-lx-fountain-pen/",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    publishedAt: "2016-07-07",
    summary:
      "2016 年新品资料列 gold、rose gold、ruthenium、palladium、黑色 PVD 钢尖、T10 与 LZ24／Z28，作为有日期的市场出现证据。",
    locator:
      "dated July 7 2016 introduction: four launch colors, anodised aluminium, black PVD steel nib, T10 and LZ24/Z28",
  }),
  review: web({
    key: "phase586-lamy-lx-penaddict-2019",
    registryKey: "penaddict-phase586-lx",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "penaddict",
    title: "Lamy Lx Marron Fountain Pen: A Review",
    url: "https://www.penaddict.com/blog/2019/11/22/lamy-lx-marron-fountain-pen-a-review",
    homepageUrl: "https://www.penaddict.com/",
    author: "Susan M. Pigott",
    publishedAt: "2019-11-22",
    summary:
      "具名作者记录 marron F 尖样笔、铝杆、透明三角握位、黑色钢尖、T10、可选 converter、后插重心与样本尺寸重量；体验不外推。",
    locator:
      "review body: exact Marron F sample, AL-star-derived platform, measurements, 21 g sample, posting balance, cartridge and optional converter",
  }),
  diagram: editorial("lx", "LAMY Lx 材料、钢尖与供墨边界示意"),
};

const dialogCc = {
  official: lamyOfficial({
    key: "phase586-lamy-dialog-cc-official",
    title: "LAMY dialog cc Fountain Pen blue",
    url: "https://www.lamy.com/en-us/p/lamy-dialog-cc-fountain-pen",
    summary:
      "当前美国蓝色页列无夹止滚、旋转伸缩尖、球阀、14K 金尖、T10／Z27、Franco Clivio，以及 125 mm、44 g、1234402。",
    locator:
      "lines 252-312: blue/white, EF/F/M/B, clipless roll stop, twist mechanism, ball valve, 14kt nib, T10/Z27, designer, 13x13x125 mm, 44 g and item 1234402",
  }),
  allBlack: lamyOfficial({
    key: "phase586-lamy-dialog-cc-all-black-official",
    title: "LAMY dialog cc Fountain Pen all-black",
    url: "https://www.lamy.com/en-gb/p/lamy-dialog-cc-fountain-pen",
    summary:
      "英国页把 all-black 标为 Special Edition，并列深黑哑光漆、黑色 PVD 细节和黑色 PVD 处理 14K 金尖。",
    locator:
      "all-black special-edition selector and configuration: matt darkblack lacquer, glossy black PVD details and black-PVD 14kt nib",
  }),
  press2021: lamyOfficial({
    key: "phase586-lamy-dialog-cc-press-2021",
    title: "The new LAMY dialog cc: Sophisticated technology in a delicate package",
    url: "https://www.lamy.com/fileadmin/user_upload/PI_LAMY_dialog_cc__EN.pdf",
    itemType: "pdf",
    publishedAt: "2021-07",
    summary:
      "官方 2021 年 7 月新闻稿说明 cc 比 dialog 更短、无夹、以侧面标牌止滚，首发蓝／白并自 2021 年 9 月供应。",
    locator:
      "PDF page 1 lines 0-24: July 2021 release, compact clipless sibling, 14kt nib, ball valve, blue/white and availability from September 2021",
  }),
  review: web({
    key: "phase586-lamy-dialog-cc-sbrebrown-2022",
    registryKey: "sbrebrown-phase586-dialog-cc",
    registryName: "SBREBrown",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "sbrebrown",
    title: "Lamy Dialog CC Fountain Pen Review",
    url: "https://www.sbrebrown.com/2022/03/lamy-dialog-cc-fountain-pen-review/",
    homepageUrl: "https://www.sbrebrown.com/",
    author: "Stephen Brown",
    publishedAt: "2022-03-09",
    summary:
      "作者披露样笔由 Appelboom 借出，记录 Broad、伸缩尖、cartridge-converter、约 123.7 mm 与 45.0 g；只作为该样本实测。",
    locator:
      "dated review metadata and measurements: loan disclosure, Broad 14k nib, cartridge-converter, 123.7 mm and 45.0 g sample",
  }),
  diagram: editorial(
    "dialog-cc",
    "LAMY dialog cc 旋转伸缩、球阀与无夹边界示意",
  ),
};

const lxCurrent = "phase586-lx-current-ruthenium-2026-08-11";
const lxLaunch = "phase586-lx-launch-colors-2016";
const lxSample = "phase586-lx-marron-f-sample-2019";

export const phase586LamyLxPack: CuratedEntityPack = {
  key: "phase586-lamy-lx-v1",
  entityId: PHASE586_IDS.lx,
  expectedType: "pen",
  expectedSlug: PHASE586_SLUGS.lx,
  canonicalName: "LAMY Lx",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/lamy-lx-phase586.md",
  storyTitle: "LAMY Lx：独立系列、金属饰面与 SKU 边界",
  primarySourceKey: lx.official.key,
  depthTier: "A",
  aliases: [
    { alias: "LAMY LX", language: "en", sourceKey: lx.official.key },
    { alias: "Lamy Lx", language: "en", sourceKey: lx.official.key },
    { alias: "凌美 Lx", language: "zh", sourceKey: lx.official.key },
    { alias: "凌美 LX", language: "zh", sourceKey: lx.official.key },
  ],
  sources: [
    lx.official,
    lx.design,
    lx.launch2016,
    lx.review,
    common.nibGuide,
    common.care,
    lx.diagram,
  ],
  scopes: [
    {
      key: lxCurrent,
      scopeKey: lxCurrent,
      market: "US current ruthenium selection",
      productionState: "current",
      nibScope: "EF/F/M/B black PVD steel nibs on the current US selector.",
      materialScope:
        "Ruthenium-colour anodised aluminium with matching plated metal clip/details and ergonomic grip.",
      editionScope:
        "4031496, 12x12x140 mm and 24 g bind to the selected ruthenium SKU; four current colors are SKU variants.",
    },
    {
      key: lxLaunch,
      scopeKey: lxLaunch,
      market: "2016 retailer introduction",
      validFrom: "2016-07-07",
      productionState: "historical",
      nibScope: "Black PVD steel EF/F/M/B in the dated introduction.",
      materialScope: "Anodised aluminium and color-matched metal trim.",
      editionScope:
        "Gold, rose gold, ruthenium and palladium are the dated launch group; retailer special-edition wording is not projected onto the current catalog.",
    },
    {
      key: lxSample,
      scopeKey: lxSample,
      market: "2019 Marron F review sample",
      validFrom: "2019-11-22",
      productionState: "historical",
      nibScope: "Only the reviewed black-PVD F steel nib.",
      materialScope: "Marron anodised aluminium sample and translucent grip.",
      editionScope:
        "Reviewer measurements, 21 g and posting balance remain sample-only observations.",
    },
  ],
  claims: [
    {
      key: "phase586-lx-identity",
      predicate: "model_identity",
      objectText:
        "LAMY Lx 是当前官网独立列出的阳极氧化铝钢笔系列，使用同色金属细节、人体工学握位和黑色 PVD 钢尖；不是 AL-star 的颜色 alias。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: lx.official.key,
      locator: "official product title, description and design data",
      evidence: [
        {
          key: "phase586-lx-identity-official",
          sourceKey: lx.official.key,
          scopeKey: lxCurrent,
          locator:
            "lines 254-316: standalone LAMY Lx product, construction, nib, fill, dimensions and weight",
        },
        {
          key: "phase586-lx-design-official",
          sourceKey: lx.design.key,
          scopeKey: lxCurrent,
          locator: "official LAMY design milestone entry for Lx",
        },
      ],
    },
    {
      key: "phase586-lx-history-boundary",
      predicate: "history_scope",
      objectText:
        "2016 年零售新品资料记录初期四色与供墨配置；当前官网仍销售 Lx，但颜色组已变化，早期 special-edition 文案不能成为永久状态。",
      factClass: "core",
      confidence: 0.97,
      sourceKey: lx.launch2016.key,
      locator: "dated 2016 introduction compared with current selector",
      evidence: [
        {
          key: "phase586-lx-launch-evidence",
          sourceKey: lx.launch2016.key,
          scopeKey: lxLaunch,
          locator: "July 7 2016 launch colors and configuration",
        },
        {
          key: "phase586-lx-current-evidence",
          sourceKey: lx.official.key,
          scopeKey: lxCurrent,
          locator: "current marron/palladium/rosegold/ruthenium selector",
        },
      ],
    },
    {
      key: "phase586-lx-sample-boundary",
      predicate: "review_scope",
      objectText:
        "2019 Marron F 样笔的 21 g、后插尾重和书写体验只属于该样本；官方当前 ruthenium 的 24 g 保持独立。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: lx.review.key,
      locator: "sample measurements and posting section",
      evidence: [
        {
          key: "phase586-lx-review-sample",
          sourceKey: lx.review.key,
          scopeKey: lxSample,
          locator: "Marron F sample, 21 g and cap-posting balance",
        },
        {
          key: "phase586-lx-official-weight",
          sourceKey: lx.official.key,
          scopeKey: lxCurrent,
          locator: "current ruthenium Data: 24 g",
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase586-lx-current-colors",
      name: "marron / palladium / rosegold / ruthenium",
      notes:
        "2026-08-11 美国官网当前标准颜色组；商品号、库存与包装逐色核对。",
      sourceKey: lx.official.key,
      variantKind: "edition_group",
      market: "US",
    },
    {
      key: "phase586-lx-2016-colors",
      name: "gold / rose gold / ruthenium / palladium launch group",
      releaseYear: "2016",
      notes:
        "2016 年零售新品资料中的四种金属色；不把当年 special-edition 文案覆盖当前状态。",
      sourceKey: lx.launch2016.key,
      variantKind: "edition_group",
      market: "International retailer",
    },
  ],
  spec: {
    brandEntityId: PHASE586_LAMY_BRAND_ID,
    values: {
      series_name: "LAMY Lx",
      release_year:
        "2016 年 7 月有日期的新品资料；当前官网仍列，官方页未给全球首发日",
      nib: "当前美国页：黑色 PVD 钢尖 EF、F、M、B",
      fill_system: "LAMY T10 墨囊；兼容 Z28 上墨器（当前页面未说随附）",
      material:
        "阳极氧化铝笔身、同色金属夹与细节、透明人体工学握位；饰面按 SKU",
      dimensions: "当前 ruthenium 4031496：12 × 12 × 140 mm",
      weight: "当前 ruthenium 4031496：24 g；2019 Marron 样本约 21 g",
      status: "LAMY 当前美国目录在列；颜色、商品号和库存按地区 SKU",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase586-lx-brand",
        lx.official.key,
        lxCurrent,
        "LAMY official product identity",
      ),
      specEvidence(
        "series_name",
        "phase586-lx-series",
        lx.official.key,
        lxCurrent,
        "standalone LAMY Lx title",
      ),
      specEvidence(
        "release_year",
        "phase586-lx-release",
        lx.launch2016.key,
        lxLaunch,
        "dated July 7 2016 introduction; no unsupported exact global launch day",
      ),
      specEvidence(
        "nib",
        "phase586-lx-nib",
        lx.official.key,
        lxCurrent,
        "black PVD steel nib and EF/F/M/B selector",
      ),
      specEvidence(
        "fill_system",
        "phase586-lx-fill",
        lx.official.key,
        lxCurrent,
        "T10 supplied and Z28 suitable",
      ),
      specEvidence(
        "material",
        "phase586-lx-material",
        lx.official.key,
        lxCurrent,
        "anodised aluminium, metal clip/details and ergonomic grip",
      ),
      specEvidence(
        "dimensions",
        "phase586-lx-dimensions",
        lx.official.key,
        lxCurrent,
        "current ruthenium Data: 12x12x140 mm",
      ),
      specEvidence(
        "weight",
        "phase586-lx-weight",
        lx.official.key,
        lxCurrent,
        "current ruthenium Data: 24 g",
      ),
      specEvidence(
        "status",
        "phase586-lx-status",
        lx.official.key,
        lxCurrent,
        "current selectable product and availability",
      ),
    ],
  },
  timeline: [
    {
      key: "phase586-lx-2016-introduction",
      title: "LAMY Lx 进入 2016 年新品资料",
      eventType: "model_released",
      startDate: "2016-07-07",
      circa: true,
      description:
        "零售新品资料记录初期四种金属色、黑色 PVD 钢尖与 T10／LZ24／Z28 语境；精确全球上市日不外推。",
      sourceKey: lx.launch2016.key,
    },
    {
      key: "phase586-lx-current-catalog",
      title: "LAMY Lx 当前目录复核",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "当前美国官网仍列 Lx，并给出 marron、palladium、rosegold、ruthenium 选择器。",
      sourceKey: lx.official.key,
    },
  ],
  media: [
    {
      key: "phase586-lx-primary",
      title: "LAMY Lx 材料、钢尖与供墨边界示意（非产品照片）",
      sourceKey: lx.diagram.key,
      localPath: lx.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创示意图，非产品照片；不代表真实比例、颜色、Logo、表面、笔夹、笔尖刻字、包装或库存。",
      sourceUrl: lx.diagram.url,
      usageStatus: "primary",
    },
  ],
};

const dialogCurrent = "phase586-dialog-cc-current-blue-2026-08-11";
const dialogLaunch = "phase586-dialog-cc-launch-2021";
const dialogAllBlack = "phase586-dialog-cc-all-black-current";
const dialogSample = "phase586-dialog-cc-broad-sample-2022";

export const phase586LamyDialogCcPack: CuratedEntityPack = {
  key: "phase586-lamy-dialog-cc-v1",
  entityId: PHASE586_IDS.dialogCc,
  expectedType: "pen",
  expectedSlug: PHASE586_SLUGS.dialogCc,
  canonicalName: "LAMY dialog cc",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/lamy-dialog-cc-phase586.md",
  storyTitle: "LAMY dialog cc：2021 年无夹紧凑 sibling",
  primarySourceKey: dialogCc.official.key,
  depthTier: "A",
  aliases: [
    {
      alias: "LAMY Dialog CC",
      language: "en",
      sourceKey: dialogCc.official.key,
    },
    {
      alias: "Lamy dialog cc",
      language: "en",
      sourceKey: dialogCc.official.key,
    },
    {
      alias: "Dialog CC",
      language: "en",
      sourceKey: dialogCc.official.key,
    },
    {
      alias: "凌美 dialog cc",
      language: "zh",
      sourceKey: dialogCc.official.key,
    },
  ],
  sources: [
    dialogCc.official,
    dialogCc.allBlack,
    dialogCc.press2021,
    dialogCc.review,
    common.nibGuide,
    common.care,
    dialogCc.diagram,
  ],
  scopes: [
    {
      key: dialogCurrent,
      scopeKey: dialogCurrent,
      market: "US current blue selection",
      productionState: "current",
      nibScope:
        "EF/F/M/B 14kt rose-gold bi-colour nib, partially platinum plated.",
      materialScope:
        "Matt darkblue lacquer, rose-gold plated details, clipless roll stop and twist mechanism.",
      editionScope:
        "1234402, 13x13x125 mm and 44 g bind to current blue; white is a separate current SKU.",
    },
    {
      key: dialogLaunch,
      scopeKey: dialogLaunch,
      market: "Global 2021 official launch",
      validFrom: "2021-09",
      productionState: "historical",
      nibScope: "14kt nib with platinum and rose-gold finish at launch.",
      materialScope:
        "Matt blue and high-gloss white with rose-gold end and roll-stop details.",
      editionScope:
        "Official July 2021 release announced availability from September 2021 and established cc as a shorter clipless dialog sibling.",
    },
    {
      key: dialogAllBlack,
      scopeKey: dialogAllBlack,
      market: "GB current special edition",
      productionState: "current",
      nibScope: "Black-PVD 14kt nib on the all-black selection.",
      materialScope: "Matt darkblack lacquer and glossy black PVD details.",
      editionScope:
        "All-black is a color/finish special edition, not the default finish for blue or white.",
    },
    {
      key: dialogSample,
      scopeKey: dialogSample,
      market: "2022 loaned Broad review sample",
      validFrom: "2022-03-09",
      productionState: "historical",
      nibScope: "Only the reviewed Broad 14k nib.",
      materialScope: "Review sample; exact color is not used for universal finish claims.",
      editionScope:
        "123.7 mm and 45.0 g are reviewer measurements, not replacements for current official data.",
    },
  ],
  claims: [
    {
      key: "phase586-dialog-cc-identity",
      predicate: "model_identity",
      objectText:
        "LAMY dialog cc 是 Franco Clivio 设计、使用旋转伸缩尖与球阀的无笔夹型号；侧面止滚件、125 mm 当前长度与 44 g 当前重量使它成为 dialog 的独立 sibling。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: dialogCc.official.key,
      locator: "official current product mechanism, dimensions and design",
      evidence: [
        {
          key: "phase586-dialog-cc-identity-official",
          sourceKey: dialogCc.official.key,
          scopeKey: dialogCurrent,
          locator:
            "lines 285-312: shorter compact clipless design, roll stop, twist mechanism, ball valve, Franco Clivio, 125 mm and 44 g",
        },
        {
          key: "phase586-dialog-cc-sibling-official",
          sourceKey: dialogCc.press2021.key,
          scopeKey: dialogLaunch,
          locator:
            "PDF page 1 lines 7-24: based on dialog technology but significantly shorter, compact and deliberately clipless",
        },
      ],
    },
    {
      key: "phase586-dialog-cc-release",
      predicate: "release_history",
      objectText:
        "LAMY 于 2021 年 7 月发布 dialog cc，并宣布 2021 年 9 月供应蓝、白版本；这是 cc 独立上市时间，不是原 dialog 的改名日期。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: dialogCc.press2021.key,
      locator: "official July 2021 press release and September availability",
      evidence: [
        {
          key: "phase586-dialog-cc-release-official",
          sourceKey: dialogCc.press2021.key,
          scopeKey: dialogLaunch,
          locator: "PDF page 1 lines 0-24",
        },
      ],
    },
    {
      key: "phase586-dialog-cc-variant-boundary",
      predicate: "variant_boundary",
      objectText:
        "蓝、白为当前美国 standard 配色，all-black 在英国页标为 Special Edition；饰面和镀层按 SKU，不另建结构型号。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: dialogCc.official.key,
      locator: "US standard selector and GB all-black special-edition selector",
      evidence: [
        {
          key: "phase586-dialog-cc-blue-white",
          sourceKey: dialogCc.official.key,
          scopeKey: dialogCurrent,
          locator: "lines 256-261: blue and white Standard",
        },
        {
          key: "phase586-dialog-cc-all-black",
          sourceKey: dialogCc.allBlack.key,
          scopeKey: dialogAllBlack,
          locator: "GB selector: all-black Special Edition",
        },
      ],
    },
    {
      key: "phase586-dialog-cc-sample-boundary",
      predicate: "review_scope",
      objectText:
        "2022 借测 Broad 样笔的 123.7 mm、45.0 g 和体验只属于该样本，不能覆盖当前官方蓝色 125 mm、44 g 或全部尖幅。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: dialogCc.review.key,
      locator: "loan disclosure and measurement table",
      evidence: [
        {
          key: "phase586-dialog-cc-review-sample",
          sourceKey: dialogCc.review.key,
          scopeKey: dialogSample,
          locator: "loaned Broad sample, 123.7 mm and 45.0 g",
        },
        {
          key: "phase586-dialog-cc-official-data",
          sourceKey: dialogCc.official.key,
          scopeKey: dialogCurrent,
          locator: "current blue Data: 125 mm and 44 g",
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase586-dialog-cc-blue",
      name: "blue 1234402",
      releaseYear: "2021",
      notes:
        "哑光深蓝、玫瑰金色细节；当前美国页 125 mm、44 g、EF/F/M/B。",
      sourceKey: dialogCc.official.key,
      variantKind: "market_sku",
      productCode: "1234402",
      market: "US",
    },
    {
      key: "phase586-dialog-cc-white",
      name: "white",
      releaseYear: "2021",
      notes:
        "高光白与玫瑰金色细节；首发与当前 standard 配色，商品号按所选地区页。",
      sourceKey: dialogCc.press2021.key,
      variantKind: "color",
      market: "Global / US",
    },
    {
      key: "phase586-dialog-cc-all-black",
      name: "all-black Special Edition",
      notes:
        "哑光深黑、黑色 PVD 细节和黑色 PVD 处理 14K 尖；不覆盖蓝白配置。",
      sourceKey: dialogCc.allBlack.key,
      variantKind: "edition_group",
      market: "GB current page",
    },
  ],
  spec: {
    brandEntityId: PHASE586_LAMY_BRAND_ID,
    values: {
      series_name: "LAMY dialog cc（独立于 LAMY dialog／dialog 3）",
      release_year: "2021 年 7 月发布；2021 年 9 月起供应",
      nib:
        "当前蓝色：部分镀铂的玫瑰金双色 14K 金尖，EF、F、M、B；all-black 镀层另核",
      fill_system: "LAMY T10 墨囊／Z27 上墨器；当前蓝色官方配置写明两者",
      material:
        "漆面金属圆柱笔身、旋转伸缩机构、球阀与侧面止滚件；蓝白／all-black 饰面分流",
      dimensions: "当前蓝色 1234402：13 × 13 × 125 mm",
      weight: "当前蓝色 1234402：44 g；2022 Broad 借测样本约 45.0 g",
      status:
        "LAMY 当前目录在列；美国页 blue/white，英国页另列 all-black Special Edition",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase586-dialog-cc-brand",
        dialogCc.official.key,
        dialogCurrent,
        "LAMY official product identity",
      ),
      specEvidence(
        "series_name",
        "phase586-dialog-cc-series",
        dialogCc.press2021.key,
        dialogLaunch,
        "official independent dialog cc launch and sibling boundary",
      ),
      specEvidence(
        "release_year",
        "phase586-dialog-cc-release",
        dialogCc.press2021.key,
        dialogLaunch,
        "July 2021 release and availability from September 2021",
      ),
      specEvidence(
        "nib",
        "phase586-dialog-cc-nib",
        dialogCc.official.key,
        dialogCurrent,
        "14kt rose-gold bi-colour nib, partially platinum plated, EF/F/M/B",
      ),
      specEvidence(
        "fill_system",
        "phase586-dialog-cc-fill",
        dialogCc.official.key,
        dialogCurrent,
        "T10 and Z27 included on current blue configuration",
      ),
      specEvidence(
        "material",
        "phase586-dialog-cc-material",
        dialogCc.official.key,
        dialogCurrent,
        "lacquer, twist mechanism, ball valve and roll stop",
      ),
      specEvidence(
        "dimensions",
        "phase586-dialog-cc-dimensions",
        dialogCc.official.key,
        dialogCurrent,
        "current blue Data: 13x13x125 mm",
      ),
      specEvidence(
        "weight",
        "phase586-dialog-cc-weight",
        dialogCc.official.key,
        dialogCurrent,
        "current blue Data: 44 g",
      ),
      specEvidence(
        "status",
        "phase586-dialog-cc-status",
        dialogCc.official.key,
        dialogCurrent,
        "current product availability and standard selector",
      ),
    ],
  },
  timeline: [
    {
      key: "phase586-dialog-cc-release-2021",
      title: "LAMY 发布 dialog cc",
      eventType: "model_released",
      startDate: "2021-09",
      circa: false,
      description:
        "2021 年 7 月官方新闻稿宣布新型号，蓝、白版本自 2021 年 9 月供应。",
      sourceKey: dialogCc.press2021.key,
    },
    {
      key: "phase586-dialog-cc-current",
      title: "dialog cc 当前目录复核",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "当前美国蓝色页确认 14K、T10／Z27、125 mm、44 g 与无夹止滚身份。",
      sourceKey: dialogCc.official.key,
    },
  ],
  media: [
    {
      key: "phase586-dialog-cc-primary",
      title: "LAMY dialog cc 旋转伸缩、球阀与无夹边界示意（非产品照片）",
      sourceKey: dialogCc.diagram.key,
      localPath: dialogCc.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创示意图，非产品照片；不代表真实机构剖面、比例、颜色、Logo、镀层、笔尖刻字、皮套或库存。",
      sourceUrl: dialogCc.diagram.url,
      usageStatus: "primary",
    },
  ],
};

const lamyBrandPack = phase426BrandDepthRefreshPacks.find(
  (pack) => pack.entityId === PHASE586_LAMY_BRAND_ID,
);
if (!lamyBrandPack || lamyBrandPack.expectedType !== "brand") {
  throw new Error("Phase 586 requires the Phase 426 LAMY brand pack.");
}

export const phase586LamyPacks: CuratedEntityPack[] = [
  lamyBrandPack,
  phase586LamyLxPack,
  phase586LamyDialogCcPack,
];

if (
  phase586LamyPacks.length !== 3 ||
  new Set(phase586LamyPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 586 requires one LAMY brand and two unique pen packs.");
}
