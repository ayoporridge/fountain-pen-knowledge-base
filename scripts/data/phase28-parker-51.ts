import type {
  CuratedEntityPack,
  CuratedSource,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-19";

type LiveSourceInput = Omit<
  CuratedSource,
  "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
> & {
  allowedUse?: CuratedSource["allowedUse"];
  locator: string;
};

function liveSource(source: LiveSourceInput): CuratedSource {
  const { allowedUse, locator, ...record } = source;
  return {
    ...record,
    retrievedAt: RETRIEVED,
    allowedUse: allowedUse ?? "summary_only",
    archiveUrl: record.url,
    archiveLocator: [
      "live-source-not-frozen",
      `retrieved=${RETRIEVED}`,
      "external_archive=false",
      "raw_source_stored=false",
      `locator=${locator}`,
    ].join(";"),
  };
}

const SOURCES = {
  "parker-official-history": liveSource({
    key: "parker-official-history",
    registryKey: "parker-official",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Parker history",
    url: "https://www.parkerpen.com/parker-history.html",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    summary:
      "Parker 官方历史：1888 专利、1894 Lucky Curve、1921 Duofold、1931 Quink、1933 Vacumatic、1941 Parker 51、1954 Jotter、2000 加入 Newell 及 51 的广义历史范围。",
    locator:
      "official milestones for 1888, 1894, 1921, 1931, 1933, 1941, 1954, 1978 and 2000",
  }),
  "newell-parker-brand": liveSource({
    key: "newell-parker-brand",
    registryKey: "newell-brands",
    registryName: "Newell Brands",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Parker — Newell Brands",
    url: "https://www.newellbrands.com/our-brands/parker",
    homepageUrl: "https://www.newellbrands.com/",
    author: "Newell Brands",
    summary:
      "Newell Brands 的 Parker 品牌入口，用于确认当前集团归属；不外推具体型号的产地、材料或供应状态。",
    locator: "Parker brand entry and group ownership context",
  }),
  "parker-current-fountain-pens": liveSource({
    key: "parker-current-fountain-pens",
    registryKey: "parker-official",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Parker fountain pens",
    url: "https://www.parkerpen.com/writing-types/by-mode/fountain-pens/",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    summary:
      "Parker 官方钢笔集合入口，用于当前系列导航；市场、颜色、尖号和在售状态必须回到具体产品页。",
    locator: "current fountain-pen collection navigation, retrieved 2026-07-19",
  }),
  "parker-im-commons": {
    key: "parker-im-commons",
    registryKey: "wikimedia-commons",
    registryName: "Wikimedia Commons",
    sourceType: "wikimedia",
    tier: "primary",
    independenceGroup: "commons-file-156990597",
    title: "Gold Parker I.M Pen.JPG",
    url: "https://commons.wikimedia.org/wiki/File:Gold_Parker_I.M_Pen.JPG",
    homepageUrl: "https://commons.wikimedia.org/",
    itemType: "image",
    author: "Caleb Bond",
    retrievedAt: RETRIEVED,
    summary:
      "Caleb Bond 拍摄的金色 Parker IM 实物照片；只用于 Parker 品牌代表图，不证明其他系列的结构或材料。",
    allowedUse: "store_full",
    license: "cc-by-3.0",
    archiveUrl:
      "https://commons.wikimedia.org/wiki/File:Gold_Parker_I.M_Pen.JPG",
    archiveLocator:
      "author=Caleb Bond;license=CC BY 3.0;original=https://upload.wikimedia.org/wikipedia/commons/0/04/Gold_Parker_I.M_Pen.JPG;local=public/images/library/wikimedia/parker/parker-im-caleb-bond.jpg;processing=Commons thumb service proportional resize to 1200px, no crop",
  },
  "richardspens-parker-51": liveSource({
    key: "richardspens-parker-51",
    registryKey: "richardspens-reference",
    registryName: "Richard Binder's RichardsPens reference pages",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "richard-binder-parker-reference",
    title: "Parker 51 profile",
    url: "http://www.richardspens.com/ref/profiles/51.htm",
    homepageUrl: "http://www.richardspens.com/",
    author: "Richard Binder",
    summary:
      "Parker 51 的专业版本档案，用于 Vacumatic、Aero-metric、Special、Demi、cartridge、美国生产范围与结构边界。",
    locator:
      "profile chronology, filling-system sections, Special/Demi/cartridge and late-production notes",
  }),
  "parker51-archive": liveSource({
    key: "parker51-archive",
    registryKey: "parker51-archive",
    registryName: "Parker51.com",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "parker51-specialist-archive",
    title: "Parker 51 versions",
    url: "https://parker51.com/index.php/51s/",
    homepageUrl: "https://parker51.com/",
    author: "Parker51.com",
    summary:
      "Parker 51 专题档案，用于 Red Band、Vacumatic、Aero-metric、Special、Demi、稀少 cartridge 与后期结构识别。",
    locator:
      "51 versions and filling-system identification pages; specialist secondary source",
  }),
  "parker-51s-commons": {
    key: "parker-51s-commons",
    registryKey: "wikimedia-commons",
    registryName: "Wikimedia Commons",
    sourceType: "wikimedia",
    tier: "primary",
    independenceGroup: "commons-file-5193030",
    title: "Parker-51s.jpg",
    url: "https://commons.wikimedia.org/wiki/File:Parker-51s.jpg",
    homepageUrl: "https://commons.wikimedia.org/",
    itemType: "image",
    author: "Batch1928 44",
    retrievedAt: RETRIEVED,
    summary:
      "一支 1942 Cedar Blue Vacumatic 与一支 1949 Burgundy Aero-metric 的并列及拆解照片，明确只代表这两个样本。",
    allowedUse: "store_full",
    license: "public-domain",
    archiveUrl: "https://commons.wikimedia.org/wiki/File:Parker-51s.jpg",
    archiveLocator:
      "author=Batch1928 44;license=Public Domain;original=https://upload.wikimedia.org/wikipedia/commons/0/09/Parker-51s.jpg;local=public/images/library/wikimedia/parker/parker-51s-batch1928-44.jpg;processing=Commons thumb service proportional resize to 1200px, no crop",
  },
  "parker-51-2021-release": liveSource({
    key: "parker-51-2021-release",
    registryKey: "parker-official",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Parker reimagines iconic Parker 51 for 2021",
    url: "https://www.parkerpen.com/parker-news-parker-51.html",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    publishedAt: "2021",
    summary:
      "2021 发布资料把新 Parker 51 定位为 reimagined、受经典型号启发的现代产品，而非原结构忠实复刻。",
    locator: "headline, reimagined positioning and 2021 launch description",
  }),
  "parker-2021-trade-catalogue": liveSource({
    key: "parker-2021-trade-catalogue",
    registryKey: "parker-official-catalogues",
    registryName: "Parker trade catalogues",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Parker Trade Catalogue 2021",
    url: "https://assets.parkerpen.com/is/content/NewellRubbermaid/DASH/S7_int/Fine_Writing/2021/prkr_trdctlg_2021.pdf",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    itemType: "pdf",
    publishedAt: "2021",
    summary:
      "2021 trade catalogue 用于确认 Parker 51 的 Core／Deluxe、钢尖／18K 金尖、墨囊／上墨器与旋帽边界。",
    locator: "Parker 51 Core and Deluxe product tables in the 2021 trade catalogue",
  }),
  "parker-care-guide": liveSource({
    key: "parker-care-guide",
    registryKey: "parker-official-support",
    registryName: "Parker care guides",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Parker fountain pen care guide",
    url: "https://www.parkerpen.com/fountain-pen-care-guides.html",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    summary:
      "Parker 现代钢笔的墨囊／上墨器、清洗与维护入口；不用于 vintage Vacumatic 或 Aero-metric 的拆修。",
    locator: "fountain pen filling, cleaning and storage guidance",
  }),
  "peterpen-parker-51-2021": {
    key: "peterpen-parker-51-2021",
    registryKey: "peterpen-eu",
    registryName: "peterpen.eu",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "peterpen-parker-51-2021-review",
    title: "The new Parker 51",
    url: "https://peterpen.eu/2021/02/06/the-new-parker-51/",
    homepageUrl: "https://peterpen.eu/",
    itemType: "image",
    author: "Peter",
    publishedAt: "2021-02-06",
    retrievedAt: RETRIEVED,
    summary:
      "Peter 的 2021 Parker 51 实拍与短评；照片仅代表该样本，文章与图片按站点声明采用 CC BY 4.0。",
    allowedUse: "store_full",
    license: "cc-by-4.0",
    archiveUrl: "https://peterpen.eu/2021/02/06/the-new-parker-51/",
    archiveLocator:
      "author=Peter;license=CC BY 4.0;license_url=https://creativecommons.org/licenses/by/4.0/;original=https://peterpen.eu/assets/blog/2021/02/06/146598907_932772650799487_3416671319234028211_n_s.jpg;local=public/images/library/licensed/parker/parker-51-2021-peter.jpg;processing=stored site-provided 720x720 JPEG without crop or redraw",
  },
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

export const phase28Parker51Packs: CuratedEntityPack[] = [
  {
    key: "phase28-parker-brand-v1",
    entityId: "vhqNYqDChhiN",
    expectedType: "brand",
    expectedSlug: "parker",
    canonicalName: "派克 Parker",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/parker-brand-publishable-content-2026-07-19.md",
    storyTitle: "派克 Parker：专利、代表型号与跨年代阅读边界",
    primarySourceKey: "parker-official-history",
    depthTier: "A",
    aliases: [
      {
        alias: "Parker",
        language: "en",
        sourceKey: "parker-official-history",
      },
      {
        alias: "派克",
        language: "zh",
        sourceKey: "parker-official-history",
      },
      {
        alias: "Parker Pen Company",
        language: "en",
        kind: "former_name",
        sourceKey: "parker-official-history",
      },
    ],
    sources: [
      source("parker-official-history"),
      source("newell-parker-brand"),
      source("parker-current-fountain-pens"),
      source("richardspens-parker-51"),
      source("parker-im-commons"),
    ],
    scopes: [
      {
        key: "brand-history",
        scopeKey: "parker-brand-history-1888-2000",
        validFrom: "1888",
        validTo: "2000",
        productionState: "historical",
        editionScope: "brand milestones; not one model specification",
      },
      {
        key: "current-brand",
        scopeKey: "parker-current-brand-2026-07-19",
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope:
          "current collection navigation; regional availability remains product-specific",
      },
      {
        key: "brand-photo",
        scopeKey: "parker-im-photo-sample-2011",
        validFrom: "2011-03-29",
        productionState: "historical",
        editionScope: "one gold Parker IM photo; not a shared Parker construction",
      },
    ],
    claims: [
      {
        key: "parker-first-patent",
        predicate: "first_patent",
        objectText: "George Safford Parker 于 1888 年取得首项钢笔专利。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-official-history",
        locator: "1888 milestone",
        evidence: [
          {
            key: "official-1888-patent",
            sourceKey: "parker-official-history",
            scopeKey: "brand-history",
            locator: "1888 first fountain pen patent milestone",
          },
        ],
      },
      {
        key: "parker-key-milestones",
        predicate: "brand_timeline",
        objectText:
          "官方时间线依次记录 1894 Lucky Curve、1921 Duofold、1931 Quink、1933 Vacumatic 与箭形笔夹、1941 Parker 51、1954 Jotter。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-official-history",
        locator: "1894 through 1954 official milestones",
        evidence: [
          {
            key: "official-product-milestones",
            sourceKey: "parker-official-history",
            scopeKey: "brand-history",
            locator: "Lucky Curve, Duofold, Quink, Vacumatic, 51 and Jotter entries",
          },
          {
            key: "richards-parker-51-brand-context",
            sourceKey: "richardspens-parker-51",
            scopeKey: "brand-history",
            locator: "Parker 51 profile confirms the model's place in Parker history",
          },
        ],
      },
      {
        key: "parker-newell-ownership",
        predicate: "ownership",
        objectText:
          "Parker 于 2000 年加入 Newell Rubbermaid，现由 Newell Brands 列为旗下品牌；该节点不等于全部产品在同年统一改变。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-official-history",
        locator: "2000 milestone and current Newell brand entry",
        evidence: [
          {
            key: "official-2000-newell",
            sourceKey: "parker-official-history",
            scopeKey: "brand-history",
            locator: "2000 Newell Rubbermaid milestone",
          },
          {
            key: "newell-current-parker",
            sourceKey: "newell-parker-brand",
            scopeKey: "current-brand",
            locator: "current Parker brand entry",
          },
        ],
      },
      {
        key: "parker-photo-boundary",
        predicate: "primary_media_identity",
        objectText:
          "品牌主图是一支金色 Parker IM，只是品牌代表图，不是 Parker 51 或全部系列的共同规格。",
        factClass: "editorial",
        confidence: 0.99,
        sourceKey: "parker-im-commons",
        locator: "Commons file description and license metadata",
        evidence: [
          {
            key: "commons-im-photo",
            sourceKey: "parker-im-commons",
            scopeKey: "brand-photo",
            locator: "Gold Parker I.M Pen.JPG by Caleb Bond",
          },
        ],
      },
    ],
    media: [
      {
        key: "parker-brand-primary",
        title: "Gold Parker I.M Pen",
        sourceKey: "parker-im-commons",
        localPath:
          "/images/library/wikimedia/parker/parker-im-caleb-bond.jpg",
        author: "Caleb Bond",
        license: "cc-by-3.0",
        attributionText:
          "Gold Parker I.M Pen，Caleb Bond，CC BY 3.0；经 Wikimedia Commons 缩略图服务等比缩放至宽 1200 px，未裁切。仅作 Parker 品牌代表图，不代表其他型号。",
        sourceUrl:
          "https://commons.wikimedia.org/wiki/File:Gold_Parker_I.M_Pen.JPG",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/0/04/Gold_Parker_I.M_Pen.JPG",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "parker-patent-1888",
        title: "George Safford Parker 取得首项钢笔专利",
        eventType: "patent_filed",
        startDate: "1888",
        circa: false,
        description: "品牌技术史起点，不等于现行型号统一结构。",
        sourceKey: "parker-official-history",
      },
      {
        key: "parker-lucky-curve-1894",
        title: "Lucky Curve 供墨结构出现",
        eventType: "design_milestone",
        startDate: "1894",
        circa: false,
        description: "早期供墨技术节点。",
        sourceKey: "parker-official-history",
      },
      {
        key: "parker-duofold-1921",
        title: "Duofold 推出",
        eventType: "model_released",
        startDate: "1921",
        circa: false,
        description: "历史 Duofold 与后续各代规格分开。",
        sourceKey: "parker-official-history",
      },
      {
        key: "parker-quink-1931",
        title: "Quink 墨水推出",
        eventType: "design_milestone",
        startDate: "1931",
        circa: false,
        description: "墨水产品节点，不是单一钢笔规格。",
        sourceKey: "parker-official-history",
      },
      {
        key: "parker-vacumatic-1933",
        title: "Vacumatic 与箭形笔夹成为重要节点",
        eventType: "model_released",
        startDate: "1933",
        circa: false,
        description: "型号与视觉识别节点。",
        sourceKey: "parker-official-history",
      },
      {
        key: "parker-51-1941",
        title: "Vintage Parker 51 上市",
        eventType: "model_released",
        startDate: "1941",
        circa: false,
        description: "与 2021 modern take 保持独立。",
        sourceKey: "parker-official-history",
      },
      {
        key: "parker-jotter-1954",
        title: "Jotter 推出",
        eventType: "model_released",
        startDate: "1954",
        circa: false,
        description: "Parker 圆珠笔史节点。",
        sourceKey: "parker-official-history",
      },
      {
        key: "parker-newell-2000",
        title: "Parker 加入 Newell Rubbermaid",
        eventType: "acquisition",
        startDate: "2000",
        circa: false,
        description: "所有权节点，不外推具体产品变化。",
        sourceKey: "parker-official-history",
      },
    ],
  },
  {
    key: "phase28-parker-51-vintage-v1",
    entityId: "i_XH37icAI5C",
    expectedType: "pen",
    expectedSlug: "派克-parker-51-经典-vintage",
    canonicalName: "派克 Parker 51（1941–1978）",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/parker-51-vintage-publishable-content-2026-07-19.md",
    storyTitle: "Vintage Parker 51：上墨代际、版本与年份边界",
    primarySourceKey: "parker-official-history",
    depthTier: "A",
    aliases: [
      {
        alias: "The Parker 51",
        language: "en",
        sourceKey: "richardspens-parker-51",
      },
      {
        alias: "Parker 51 vintage",
        language: "en",
        sourceKey: "richardspens-parker-51",
      },
      {
        alias: "Vintage Parker 51",
        language: "en",
        sourceKey: "richardspens-parker-51",
      },
      {
        alias: "派克 51 经典版",
        language: "zh",
        sourceKey: "parker51-archive",
      },
      {
        alias: "派克 Parker 51（经典/Vintage）",
        language: "zh",
        sourceKey: "parker51-archive",
      },
    ],
    sources: [
      source("parker-official-history"),
      source("richardspens-parker-51"),
      source("parker51-archive"),
      source("parker-51s-commons"),
    ],
    variants: [
      {
        key: "vacumatic",
        name: "Vacumatic 主线",
        releaseYear: "1941",
        notes: "隔膜与尾端按钮结构；不能按 Aero-metric 或现代上墨器维护。",
        sourceKey: "richardspens-parker-51",
        variantKind: "edition_group",
      },
      {
        key: "red-band",
        name: "Red Band",
        notes: "早期短期过渡结构，以红色识别环著称；不外推为 Vacumatic 全系特征。",
        sourceKey: "parker51-archive",
        variantKind: "variant",
      },
      {
        key: "aerometric",
        name: "Aero-metric 主线",
        releaseYear: "1948",
        notes: "受保护墨囊与按压结构；护套、囊管和文字随时期变化。",
        sourceKey: "richardspens-parker-51",
        variantKind: "edition_group",
      },
      {
        key: "special",
        name: "Parker 51 Special",
        notes: "常见 Octanium 钢合金笔尖与不同饰件；不代表整个 51 家族尖材质。",
        sourceKey: "richardspens-parker-51",
        variantKind: "variant",
      },
      {
        key: "demi",
        name: "Parker 51 Demi",
        notes: "更短小的尺寸路线，跨越部分生产变化；不与标准型共享统一尺寸。",
        sourceKey: "parker51-archive",
        variantKind: "variant",
      },
      {
        key: "cartridge",
        name: "少量 cartridge 版本",
        notes: "使用可更换墨囊的稀少分支；不能把 cartridge 写成 vintage 全系上墨。",
        sourceKey: "richardspens-parker-51",
        variantKind: "variant",
      },
      {
        key: "late-production",
        name: "后期结构版本",
        notes: "美国主线到 1972、官方广义生命周期到 1978；按市场和结构继续细分。",
        sourceKey: "richardspens-parker-51",
        variantKind: "edition_group",
      },
    ],
    scopes: [
      {
        key: "official-broad-range",
        scopeKey: "parker-51-official-broad-range-1941-1978",
        validFrom: "1941",
        validTo: "1978",
        productionState: "historical",
        editionScope: "official broad family history; multiple countries and structures",
      },
      {
        key: "us-mainline",
        scopeKey: "parker-51-us-mainline-1941-1972",
        validFrom: "1941",
        validTo: "1972",
        productionState: "historical",
        editionScope: "United States main production chronology",
      },
      {
        key: "vacumatic-scope",
        scopeKey: "parker-51-vacumatic-generation",
        productionState: "historical",
        editionScope: "Vacumatic and Red Band only",
      },
      {
        key: "aerometric-scope",
        scopeKey: "parker-51-aerometric-generation-from-1948",
        validFrom: "1948",
        productionState: "historical",
        editionScope: "Aero-metric, Special, Demi and later derivatives as scoped",
      },
      {
        key: "photo-samples",
        scopeKey: "parker-51-photo-samples-1942-1949",
        validFrom: "1942",
        validTo: "1949",
        productionState: "historical",
        editionScope: "1942 Vacumatic and 1949 Aero-metric photographed samples only",
      },
    ],
    claims: [
      {
        key: "vintage-range-boundary",
        predicate: "production_range",
        objectText:
          "Parker 51 于 1941 年上市；美国主线通常记录为 1941–1972，Parker 官方广义历史范围为 1941–1978。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-official-history",
        locator: "official 1941–1978 history and specialist US chronology",
        evidence: [
          {
            key: "official-broad-1941-1978",
            sourceKey: "parker-official-history",
            scopeKey: "official-broad-range",
            locator: "Parker 51 1941–1978 official milestone",
          },
          {
            key: "richards-us-1941-1972",
            sourceKey: "richardspens-parker-51",
            scopeKey: "us-mainline",
            locator: "United States production chronology ending 1972",
          },
        ],
      },
      {
        key: "vintage-filling-generations",
        predicate: "filling_system_by_generation",
        objectText:
          "Vintage 51 跨越 Vacumatic、Red Band、Aero-metric、少量 cartridge 与后期结构，不能统一写成 Aero-metric。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "richardspens-parker-51",
        locator: "filling-system and version chronology",
        evidence: [
          {
            key: "richards-filling-generations",
            sourceKey: "richardspens-parker-51",
            scopeKey: "us-mainline",
            locator: "Vacumatic, Aero-metric and cartridge sections",
          },
          {
            key: "parker51-red-band-generations",
            sourceKey: "parker51-archive",
            scopeKey: "vacumatic-scope",
            locator: "Red Band and early filling-system identification",
          },
        ],
      },
      {
        key: "vintage-spec-boundary",
        predicate: "specification_boundary",
        objectText:
          "Special、Demi、不同笔帽、尖材质和材料不能共享一组统一尺寸、Lucite 或 14K 规格。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "richardspens-parker-51",
        locator: "Special, Demi, cap, nib and material variations",
        evidence: [
          {
            key: "richards-version-spec-boundary",
            sourceKey: "richardspens-parker-51",
            scopeKey: "us-mainline",
            locator: "model/version differences across the profile",
          },
          {
            key: "parker51-version-spec-boundary",
            sourceKey: "parker51-archive",
            scopeKey: "aerometric-scope",
            locator: "Special, Demi and later version identification",
          },
        ],
      },
      {
        key: "vintage-photo-boundary",
        predicate: "primary_media_identity",
        objectText:
          "主图只展示 1942 Vacumatic 与 1949 Aero-metric 两个样本和拆解视图，不代表全部 51。",
        factClass: "editorial",
        confidence: 0.99,
        sourceKey: "parker-51s-commons",
        locator: "Commons file description",
        evidence: [
          {
            key: "commons-two-photo-samples",
            sourceKey: "parker-51s-commons",
            scopeKey: "photo-samples",
            locator: "1942 cedar blue Vacumatic and 1949 burgundy Aero-metric",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: "vhqNYqDChhiN",
      values: {
        series_name: "Parker 51 historical family（多代结构）",
        release_year: "1941；美国主线至 1972，官方广义范围至 1978",
        origin_country: "跨市场历史生产；美国主线与其他产地按实物分开",
        nib: "典型包覆式管状尖；尖材质和等级依版本，不统一标为 14K",
        fill_system:
          "Vacumatic、Red Band、Aero-metric、少量 cartridge 与后期结构分开",
        material:
          "笔身、笔帽、囊管与内件随年代和版本变化；不统一标 Lucite",
        dimensions: "标准型、Demi 与不同年代组合不共享一组统一尺寸",
        status: "历史型号；美国主线 1941–1972，官方广义 1941–1978",
      },
      evidence: [
        {
          key: "vintage-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "parker-official-history",
          scopeKey: "official-broad-range",
          locator: "Parker 51 in Parker official history",
        },
        {
          key: "vintage-series",
          fieldKey: "series_name",
          sourceKey: "richardspens-parker-51",
          scopeKey: "us-mainline",
          locator: "Parker 51 profile and generation structure",
        },
        {
          key: "vintage-release",
          fieldKey: "release_year",
          sourceKey: "parker-official-history",
          scopeKey: "official-broad-range",
          locator: "1941–1978 official milestone",
        },
        {
          key: "vintage-origin",
          fieldKey: "origin_country",
          sourceKey: "richardspens-parker-51",
          scopeKey: "us-mainline",
          locator: "United States chronology with broader production boundary",
        },
        {
          key: "vintage-nib",
          fieldKey: "nib",
          sourceKey: "richardspens-parker-51",
          scopeKey: "us-mainline",
          locator: "version-specific nib discussion including Special",
        },
        {
          key: "vintage-fill",
          fieldKey: "fill_system",
          sourceKey: "richardspens-parker-51",
          scopeKey: "us-mainline",
          locator: "Vacumatic, Aero-metric and cartridge sections",
        },
        {
          key: "vintage-material",
          fieldKey: "material",
          sourceKey: "parker51-archive",
          scopeKey: "us-mainline",
          locator: "body, cap and internal variations",
        },
        {
          key: "vintage-dimensions",
          fieldKey: "dimensions",
          sourceKey: "parker51-archive",
          scopeKey: "us-mainline",
          locator: "standard and Demi identity boundary",
        },
        {
          key: "vintage-status",
          fieldKey: "status",
          sourceKey: "parker-official-history",
          scopeKey: "official-broad-range",
          locator: "official broad 1941–1978 range",
        },
      ],
    },
    media: [
      {
        key: "parker-51-vintage-primary",
        title: "Parker-51s — Vacumatic and Aero-metric samples",
        sourceKey: "parker-51s-commons",
        localPath:
          "/images/library/wikimedia/parker/parker-51s-batch1928-44.jpg",
        author: "Batch1928 44",
        license: "public-domain",
        attributionText:
          "Parker-51s.jpg，Batch1928 44，Public Domain；经 Wikimedia Commons 缩略图服务等比缩放至宽 1200 px，未裁切。图中为 1942 Vacumatic 与 1949 Aero-metric 样本，不代表全部版本。",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Parker-51s.jpg",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/0/09/Parker-51s.jpg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "vintage-51-launch-1941",
        title: "Vintage Parker 51 上市",
        eventType: "model_released",
        startDate: "1941",
        circa: false,
        description: "Vacumatic 世代起点；官方广义家族延续至 1978。",
        sourceKey: "parker-official-history",
      },
      {
        key: "vintage-51-aerometric-1948",
        title: "Aero-metric 世代出现",
        eventType: "design_milestone",
        startDate: "1948",
        circa: false,
        description: "改为受保护墨囊与按压结构。",
        sourceKey: "richardspens-parker-51",
      },
      {
        key: "vintage-51-us-end-1972",
        title: "美国主线生产范围结束",
        eventType: "discontinued",
        startDate: "1972",
        circa: false,
        description: "与官方广义 1978 范围分开记录。",
        sourceKey: "richardspens-parker-51",
      },
      {
        key: "vintage-51-broad-end-1978",
        title: "Parker 官方广义 51 历史范围结束",
        eventType: "discontinued",
        startDate: "1978",
        circa: false,
        description: "不改写美国 1941–1972 主线边界。",
        sourceKey: "parker-official-history",
      },
    ],
  },
  {
    key: "phase28-parker-51-2021-v1",
    entityId: "jy_bRVs1hdMo",
    expectedType: "pen",
    expectedSlug: "派克-parker-51复刻",
    canonicalName: "派克 Parker 51（2021）",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/parker-51-2021-publishable-content-2026-07-19.md",
    storyTitle: "Parker 51（2021）：modern take、Core 与 Deluxe",
    primarySourceKey: "parker-51-2021-release",
    depthTier: "A",
    aliases: [
      {
        alias: "2021 Parker 51",
        language: "en",
        sourceKey: "parker-51-2021-release",
      },
      {
        alias: "New Parker 51",
        language: "en",
        sourceKey: "parker-51-2021-release",
      },
      {
        alias: "Parker 51 Core",
        language: "en",
        sourceKey: "parker-2021-trade-catalogue",
      },
      {
        alias: "Parker 51 Deluxe",
        language: "en",
        sourceKey: "parker-2021-trade-catalogue",
      },
      {
        alias: "派克 51 现代版",
        language: "zh",
        sourceKey: "parker-51-2021-release",
      },
    ],
    sources: [
      source("parker-51-2021-release"),
      source("parker-2021-trade-catalogue"),
      source("parker-care-guide"),
      source("peterpen-parker-51-2021"),
    ],
    variants: [
      {
        key: "core",
        name: "Parker 51 Core",
        releaseYear: "2021",
        notes:
          "现代平台的不锈钢笔尖路线；颜色、笔帽饰面与尖号按市场 SKU 核对。",
        sourceKey: "parker-2021-trade-catalogue",
        variantKind: "edition_group",
      },
      {
        key: "deluxe",
        name: "Parker 51 Deluxe",
        releaseYear: "2021",
        notes:
          "现代平台的 18K 金尖路线；不是 vintage 管状尖结构的忠实复刻。",
        sourceKey: "parker-2021-trade-catalogue",
        variantKind: "edition_group",
      },
    ],
    scopes: [
      {
        key: "modern-collection",
        scopeKey: "parker-51-modern-collection-2021",
        validFrom: "2021",
        productionState: "current",
        editionScope:
          "reimagined modern collection; excludes every vintage Parker 51 generation",
      },
      {
        key: "core-scope",
        scopeKey: "parker-51-core-2021",
        variantKey: "core",
        validFrom: "2021",
        productionState: "current",
        nibScope: "stainless-steel nib",
        editionScope: "Core only; market-specific finishes and nib widths",
      },
      {
        key: "deluxe-scope",
        scopeKey: "parker-51-deluxe-2021",
        variantKey: "deluxe",
        validFrom: "2021",
        productionState: "current",
        nibScope: "18K gold nib",
        editionScope: "Deluxe only; market-specific finishes and nib widths",
      },
      {
        key: "modern-care",
        scopeKey: "parker-modern-cartridge-converter-care",
        validFrom: "2021",
        productionState: "current",
        editionScope:
          "modern cartridge/converter care only; not vintage Vacumatic or Aero-metric service",
      },
      {
        key: "peter-photo",
        scopeKey: "peter-parker-51-2021-photo-sample",
        validFrom: "2021-02-06",
        productionState: "current",
        editionScope: "one photographed modern Parker 51 sample",
      },
    ],
    claims: [
      {
        key: "modern-reimagined-boundary",
        predicate: "product_positioning",
        objectText:
          "2021 Parker 51 是 reimagined / modern take，受经典轮廓启发但不是 vintage 结构的忠实复刻。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-51-2021-release",
        locator: "2021 release positioning",
        evidence: [
          {
            key: "release-reimagined",
            sourceKey: "parker-51-2021-release",
            scopeKey: "modern-collection",
            locator: "reimagined and inspired-by wording",
          },
          {
            key: "peter-modern-observation",
            sourceKey: "peterpen-parker-51-2021",
            scopeKey: "peter-photo",
            locator: "independent comparison with a vintage Parker 51",
          },
        ],
      },
      {
        key: "modern-filling-cap",
        predicate: "modern_mechanism",
        objectText:
          "现代版使用 Parker 墨囊／上墨器与螺纹旋帽，不是 Vacumatic、Aero-metric 或 vintage 快速摘帽结构。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-2021-trade-catalogue",
        locator: "2021 catalogue filling and cap specifications",
        evidence: [
          {
            key: "catalog-modern-fill-cap",
            sourceKey: "parker-2021-trade-catalogue",
            scopeKey: "modern-collection",
            locator: "cartridge/converter and screw-cap entries",
          },
        ],
      },
      {
        key: "modern-core-deluxe-nibs",
        predicate: "nib_by_edition",
        objectText:
          "Core 使用不锈钢笔尖，Deluxe 使用 18K 金笔尖；两者都属于现代平台。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-2021-trade-catalogue",
        locator: "Core and Deluxe product tables",
        evidence: [
          {
            key: "catalog-core-steel",
            sourceKey: "parker-2021-trade-catalogue",
            scopeKey: "core-scope",
            locator: "Core stainless-steel nib",
          },
          {
            key: "catalog-deluxe-18k",
            sourceKey: "parker-2021-trade-catalogue",
            scopeKey: "deluxe-scope",
            locator: "Deluxe 18K gold nib",
          },
        ],
      },
      {
        key: "modern-hood-boundary",
        predicate: "construction_boundary",
        objectText:
          "现代握位的 hooded 外观不能等同 vintage Parker 51 的管状尖、feed 与 collector。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "peterpen-parker-51-2021",
        locator: "modern nib and vintage comparison in independent review",
        evidence: [
          {
            key: "peter-modern-nib-view",
            sourceKey: "peterpen-parker-51-2021",
            scopeKey: "peter-photo",
            locator: "photo and discussion of the modern exposed nib under the hood",
          },
          {
            key: "catalog-modern-platform",
            sourceKey: "parker-2021-trade-catalogue",
            scopeKey: "modern-collection",
            locator: "modern nib and filling platform",
          },
        ],
      },
      {
        key: "modern-photo-boundary",
        predicate: "primary_media_identity",
        objectText:
          "主图是 Peter 拍摄的一支 2021 Parker 51 样本，不证明全部 Core／Deluxe 配色与批次。",
        factClass: "editorial",
        confidence: 0.99,
        sourceKey: "peterpen-parker-51-2021",
        locator: "page image and site CC BY 4.0 notice",
        evidence: [
          {
            key: "peter-photo-license",
            sourceKey: "peterpen-parker-51-2021",
            scopeKey: "peter-photo",
            locator: "2021-02-06 page image and CC BY 4.0 site footer",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: "vhqNYqDChhiN",
      values: {
        series_name: "Parker 51 modern collection（Core／Deluxe）",
        release_year: "2021",
        origin_country: "产地随具体市场 SKU 核对；不由 vintage 产地反推",
        nib: "Core 不锈钢尖；Deluxe 18K 金尖",
        fill_system: "Parker 墨囊／上墨器；螺纹旋帽",
        material: "Core／Deluxe 的笔身、笔帽与饰面按 SKU 记录",
        status: "2021 modern take；供应与配置依市场及目录日期变化",
      },
      evidence: [
        {
          key: "modern-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "parker-51-2021-release",
          scopeKey: "modern-collection",
          locator: "Parker 2021 release",
        },
        {
          key: "modern-series",
          fieldKey: "series_name",
          sourceKey: "parker-2021-trade-catalogue",
          scopeKey: "modern-collection",
          locator: "Parker 51 Core and Deluxe collection tables",
        },
        {
          key: "modern-release",
          fieldKey: "release_year",
          sourceKey: "parker-51-2021-release",
          scopeKey: "modern-collection",
          locator: "2021 launch announcement",
        },
        {
          key: "modern-origin",
          fieldKey: "origin_country",
          sourceKey: "parker-2021-trade-catalogue",
          scopeKey: "modern-collection",
          locator: "SKU-specific catalogue boundary; no global origin claim",
        },
        {
          key: "modern-nib",
          fieldKey: "nib",
          sourceKey: "parker-2021-trade-catalogue",
          scopeKey: "modern-collection",
          locator: "Core steel and Deluxe 18K entries",
        },
        {
          key: "modern-fill",
          fieldKey: "fill_system",
          sourceKey: "parker-2021-trade-catalogue",
          scopeKey: "modern-collection",
          locator: "cartridge/converter and screw-cap entries",
        },
        {
          key: "modern-material",
          fieldKey: "material",
          sourceKey: "parker-2021-trade-catalogue",
          scopeKey: "modern-collection",
          locator: "Core/Deluxe finish-specific tables",
        },
        {
          key: "modern-status",
          fieldKey: "status",
          sourceKey: "parker-51-2021-release",
          scopeKey: "modern-collection",
          locator: "2021 modern collection launch",
        },
      ],
    },
    media: [
      {
        key: "parker-51-2021-primary",
        title: "Parker 51 (2021)",
        sourceKey: "peterpen-parker-51-2021",
        localPath:
          "/images/library/licensed/parker/parker-51-2021-peter.jpg",
        author: "Peter",
        license: "cc-by-4.0",
        attributionText:
          "Parker 51 (2021)，Peter / peterpen.eu，CC BY 4.0；保存站点提供的 720 × 720 JPEG，未裁切、未重绘。仅代表该作者拍摄的一支样本。",
        sourceUrl: "https://peterpen.eu/2021/02/06/the-new-parker-51/",
        imageUrl:
          "https://peterpen.eu/assets/blog/2021/02/06/146598907_932772650799487_3416671319234028211_n_s.jpg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "modern-51-launch-2021",
        title: "现代 Parker 51 推出",
        eventType: "revival",
        startDate: "2021",
        circa: false,
        description:
          "以 reimagined modern take 推出，保持与 vintage canonical 独立。",
        sourceKey: "parker-51-2021-release",
      },
    ],
  },
];
