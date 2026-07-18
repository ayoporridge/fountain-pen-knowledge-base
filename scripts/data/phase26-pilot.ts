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
  "pilot-corporate-history": liveSource({
    key: "pilot-corporate-history",
    registryKey: "pilot-corporation",
    registryName: "PILOT Corporation",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "History",
    url: "https://corp.pilot.co.jp/english/company/history/",
    homepageUrl: "https://corp.pilot.co.jp/english/",
    author: "PILOT Corporation",
    summary:
      "Pilot 官方公司史：1916 年日本国产 14K 笔尖、1918 年 Namiki Manufacturing 成立、公司更名及主要产品时间线。",
    locator:
      "Origin of the Company Name and History table; 1916, 1918, 1938, 1963 and 1989 entries",
  }),
  "pilot-centenary-history": liveSource({
    key: "pilot-centenary-history",
    registryKey: "pilot-corporation",
    registryName: "PILOT Corporation",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "100 years of history",
    url: "https://www.pilot.co.jp/100th/en/history/",
    homepageUrl: "https://www.pilot.co.jp/100th/en/",
    author: "PILOT Corporation",
    summary:
      "Pilot 百年历史归档：1918 年钢笔制造、1963 年 Capless、1968 年 Elite S、1971 年 CUSTOM、2013 年 Kakuno。",
    locator:
      "official centenary timeline entries for 1918, 1963, 1968, 1971 and 2013",
  }),
  "pilot-custom-home": liveSource({
    key: "pilot-custom-home",
    registryKey: "pilot-custom-official",
    registryName: "PILOT CUSTOM official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "Fountain pen CUSTOM — CUSTOM series",
    url: "https://www.pilot-custom.jp/en/",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    author: "PILOT Corporation",
    summary:
      "Pilot 官方 CUSTOM 系列入口，按标准型、Heritage、漆面高阶与其他机构路线组织现行产品。",
    locator:
      "Lineup section grouping CUSTOM 74/742/743, Heritage, 823, 845 and Custom Urushi",
  }),
  "pilot-custom-history": liveSource({
    key: "pilot-custom-history",
    registryKey: "pilot-custom-official",
    registryName: "PILOT CUSTOM official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title:
      "CUSTOM Series: Continuing to serve all styles of handwriting — History",
    url: "https://www.pilot-custom.jp/en/history/",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    author: "PILOT Corporation",
    summary:
      "CUSTOM 官方系列史：1971 年第一代、1985 年 Custom 67、1992 年 Custom 74、742/743 笔尖尺寸与型号数字说明。",
    locator:
      "1971, 1985, 1992 and 1993 timeline entries plus footnote explaining the 74 model number",
  }),
  "pilot-custom-standard": liveSource({
    key: "pilot-custom-standard",
    registryKey: "pilot-custom-official",
    registryName: "PILOT CUSTOM official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "Standard models — CUSTOM743 / CUSTOM742 / CUSTOM74",
    url: "https://www.pilot-custom.jp/en/lineup/standard.html",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    author: "PILOT Corporation",
    summary:
      "官方标准型页面：Custom 74 的 14K 5 号尖、11 种日本尖号及颜色限制，并列 742 的 10 号尖与更宽尖号范围。",
    locator:
      "CUSTOM74 product block and CUSTOM742 product block; nib and barrel-colour availability notes",
  }),
  "pilot-custom-heritage": liveSource({
    key: "pilot-custom-heritage",
    registryKey: "pilot-custom-official",
    registryName: "PILOT CUSTOM official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "CUSTOM HERITAGE Series",
    url: "https://www.pilot-custom.jp/en/lineup/heritage.html",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    author: "PILOT Corporation",
    summary:
      "官方 Heritage 页面：Custom Heritage 91 的 14K 5 号尖、九种尖号与平顶银色调，以及 Heritage 92 的内置旋转吸墨。",
    locator:
      "CUSTOM HERITAGE 91 and 92 product blocks; design, nib and filling-system descriptions",
  }),
  "pilot-webcatalog-custom74": liveSource({
    key: "pilot-webcatalog-custom74",
    registryKey: "pilot-webcatalog",
    registryName: "PILOT web catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "FKKN-12SR-DRM — Custom 74",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000240&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    author: "PILOT Corporation",
    summary:
      "日本现行目录：14K 5 号、树脂、旋帽、CON-40/CON-70N、143 mm、14.7 mm、17.4 g，以及颜色与尖号组合。",
    locator:
      "product specification table and complete lineup list for FKKN-12SR, retrieved 2026-07-19",
  }),
  "pilot-custom-nib-list": liveSource({
    key: "pilot-custom-nib-list",
    registryKey: "pilot-custom-official",
    registryName: "PILOT CUSTOM official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "A wide selection of nibs",
    url: "https://www.pilot-custom.jp/en/feature/nib.html",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    author: "PILOT Corporation",
    summary:
      "CUSTOM 官方笔尖表说明 EF 至 MS 的用途、握持角度与软尖边界，并提醒并非每个系列都提供全部尖号。",
    locator: "nib descriptions and List of Mainstay Product Nib Types",
  }),
  "pilot-custom-nib-quality": liveSource({
    key: "pilot-custom-nib-quality",
    registryKey: "pilot-custom-official",
    registryName: "PILOT CUSTOM official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "Nib quality — PILOT CUSTOM",
    url: "https://www.pilot-custom.jp/en/feature/penpoint.html",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    author: "PILOT Corporation",
    summary:
      "Pilot 对 14K/18K 金合金、尖端耐磨材料与逐支最终打磨的官方说明；不把金含量等同于固定软硬度。",
    locator: "14- and 18K gold defined and hand-polished pen-point sections",
  }),
  "pilot-custom-process": liveSource({
    key: "pilot-custom-process",
    registryKey: "pilot-custom-official",
    registryName: "PILOT CUSTOM official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "Made-entirely-in-Japan, from the nib to the body",
    url: "https://www.pilot-custom.jp/en/feature/process.html",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    author: "PILOT Corporation",
    summary:
      "CUSTOM 官方制造页说明笔尖至笔身的日本国内一体制造和笔尖、笔舌、握位的装配检验。",
    locator:
      "introductory made-entirely-in-Japan statement and CUSTOM production process",
  }),
  "pilot-europe-custom": liveSource({
    key: "pilot-europe-custom",
    registryKey: "pilot-europe",
    registryName: "Pilot Corporation of Europe",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "Custom Collection",
    url: "https://www.pilotpen.eu/our-universes/fine-writing/custom/",
    homepageUrl: "https://www.pilotpen.eu/",
    author: "Pilot Corporation of Europe",
    summary:
      "欧洲官方页面将 Custom 74 列为透明彩色杆、14K 金尖、Pilot 墨囊/上墨器，并提供 F/M/B 三种尖号。",
    locator: "Custom 74 product block; European-market configuration only",
  }),
  "pilot-australia-custom74": liveSource({
    key: "pilot-australia-custom74",
    registryKey: "pilot-australia",
    registryName: "Pilot Pen Australia",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "CUSTOM 74",
    url: "https://pilotpen.com.au/pens/custom-74",
    homepageUrl: "https://pilotpen.com.au/",
    author: "Pilot Pen Australia",
    summary:
      "澳大利亚官方页截至 2026-07-09 更新时标为停止官方经销，同时保留 14K 5 号、CON-70N、墨囊与 1.1 ml 上墨器说明；页面未注明停售生效日。",
    locator:
      "Page displays Discontinued and Last updated 9 July 2026; no effective discontinuation date stated; Australia market only",
  }),
  "pilot-con40-care-guide": liveSource({
    key: "pilot-con40-care-guide",
    registryKey: "pilot-support",
    registryName: "PILOT support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "Fountain Pen — Use and Care Guide (CON-40 / cartridge)",
    url: "https://www.pilot.co.jp/support/warranty/en/warranty_assets/pdf/fountain_con40_en.pdf",
    homepageUrl: "https://www.pilot.co.jp/support/manual/fountain/",
    author: "PILOT Corporation",
    itemType: "pdf",
    summary:
      "Pilot 官方墨囊/CON-40 使用与维护说明：长期不用时排空并用清水反复吸排，上墨器完全干燥后收纳，不清洗笔帽和笔杆，避免酒精等溶剂及自行修理。",
    locator:
      "How to fill with ink and Care and Storage sections; applies to cartridge/converter fountain pens",
  }),
  "pilot-namiki-official": liveSource({
    key: "pilot-namiki-official",
    registryKey: "namiki-official",
    registryName: "Namiki official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-corporation-official",
    title: "Maki-e fountain pen — Namiki",
    url: "https://www.pilot-namiki.com/en/",
    homepageUrl: "https://www.pilot-namiki.com/en/",
    author: "Namiki / PILOT Corporation",
    summary:
      "Namiki 官方站以独立品牌入口组织 Emperor、Yukari、Chinkin、Nippon Art 等莳绘系列，支持与普通 Pilot 型号分开建模。",
    locator: "brand introduction and Collections navigation",
  }),
  "pilot-tgs-custom-overview": liveSource({
    key: "pilot-tgs-custom-overview",
    registryKey: "gentleman-stationer",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer",
    title:
      "The Pilot Custom Series: An Overview of Some of My Favorite Fountain Pens",
    url: "https://www.gentlemanstationer.com/blog/2026/3/14/pilot-custom-series-an-overview-of-some-of-my-favorite-fountain-pens",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "Joe Crace / The Gentleman Stationer",
    publishedAt: "2026-03-14",
    summary:
      "独立系列综述按 Custom 74、912、Heritage 92、823 等解释 Pilot 5/10/15 号尖与不同上墨路线；作者同时披露为授权零售商。",
    locator:
      "Pilot Custom 74 and Custom 912 sections; professional review with retailer relationship disclosed",
  }),
  "pilot-tgs-custom74-review": liveSource({
    key: "pilot-tgs-custom74-review",
    registryKey: "gentleman-stationer",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer",
    title: "Review Revisited: The Pilot Custom 74 Fountain Pen",
    url: "https://www.gentlemanstationer.com/blog/2023/6/3/review-revisited-the-pilot-custom-74-fountain-pen",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "Joe Crace / The Gentleman Stationer",
    publishedAt: "2023-06-03",
    summary:
      "Custom 74 独立长期使用评测：中型轻量、可套帽/不套帽、14K 5 号尖与墨囊/上墨器日用；北美配色仅作当时市场快照。",
    locator:
      "writing experience, versatility and market-configuration sections; reviewer is also an authorized reseller",
  }),
  "pilot-penaddict-custom74-nibs": liveSource({
    key: "pilot-penaddict-custom74-nibs",
    registryKey: "pen-addict",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict",
    title: "Pilot Custom 74 — Ranking the Nibs",
    url: "https://www.penaddict.com/blog/2026/6/12/pilot-custom-74-ranking-the-nibs",
    homepageUrl: "https://www.penaddict.com/",
    author: "Kimberly / The Pen Addict",
    publishedAt: "2026-06-12",
    summary:
      "2026 年美国市场样笔测试，记录当时配色与 5 号尖供应边界；样笔由 Pilot USA 提供且仅蘸墨测试，不能外推到全球。",
    locator:
      "introductory color/nib availability notes and test-method disclosure",
  }),
  "pilot-custom74-commons": {
    key: "pilot-custom74-commons",
    registryKey: "wikimedia-commons",
    registryName: "Wikimedia Commons",
    sourceType: "wikimedia",
    tier: "primary",
    independenceGroup: "commons-m-dreibelbis",
    title: "Pilot Custom 74 (26901490646).jpg",
    url: "https://commons.wikimedia.org/wiki/File:Pilot_Custom_74_(26901490646).jpg",
    homepageUrl: "https://commons.wikimedia.org/",
    itemType: "image",
    author: "M Dreibelbis",
    publishedAt: "2016-05-10",
    retrievedAt: RETRIEVED,
    summary:
      "2016 年 Pilot Custom 74 SFM 实物照片。本站保存 Commons 生成的 1920 px 等比例缩略图，未裁切、未调色。",
    allowedUse: "store_full",
    license: "cc-by-2.0",
    archiveUrl:
      "/images/library/wikimedia/pilot/pilot-custom-74-m-dreibelbis.jpg",
    archiveLocator:
      "commons-file=Pilot_Custom_74_(26901490646).jpg;original=4482x2918;local=1920x1250;resize-only=true;crop=false;color-edit=false;license=CC-BY-2.0;author=M-Dreibelbis",
  },
  "pilot-vanishing-point-commons": {
    key: "pilot-vanishing-point-commons",
    registryKey: "wikimedia-commons",
    registryName: "Wikimedia Commons",
    sourceType: "wikimedia",
    tier: "primary",
    independenceGroup: "commons-marek-kubica",
    title: "Pilot Vanishing Point -M- (32057717435).jpg",
    url: "https://commons.wikimedia.org/wiki/File:Pilot_Vanishing_Point_-M-_(32057717435).jpg",
    homepageUrl: "https://commons.wikimedia.org/",
    itemType: "image",
    author: "Marek Kubica",
    publishedAt: "2017-01-02",
    retrievedAt: RETRIEVED,
    summary:
      "Pilot Vanishing Point M 尖实物近照。本站保存 Commons 生成的 1920 px 等比例缩略图，仅代表 Capless 路线。",
    allowedUse: "store_full",
    license: "cc-by-sa-2.0",
    archiveUrl:
      "/images/library/wikimedia/pilot/pilot-vanishing-point-m-marek-kubica.jpg",
    archiveLocator:
      "commons-file=Pilot_Vanishing_Point_-M-_(32057717435).jpg;original=2876x2390;local=1920x1596;resize-only=true;crop=false;color-edit=false;license=CC-BY-SA-2.0;author=Marek-Kubica",
  },
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

export const phase26PilotPacks: CuratedEntityPack[] = [
  {
    key: "phase26-pilot-brand-v1",
    entityId: "Zt-PbXkE7UHM",
    expectedType: "brand",
    expectedSlug: "pilot",
    canonicalName: "百乐 Pilot",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/pilot-brand-publishable-content-2026-07-19.md",
    storyTitle: "百乐 Pilot 钢笔怎么分：CUSTOM、Capless、日用钢尖与 Elite",
    primarySourceKey: "pilot-corporate-history",
    depthTier: "A",
    aliases: [
      {
        alias: "Pilot",
        language: "en",
        sourceKey: "pilot-corporate-history",
      },
      {
        alias: "PILOT",
        language: "en",
        sourceKey: "pilot-corporate-history",
      },
    ],
    sources: [
      source("pilot-corporate-history"),
      source("pilot-centenary-history"),
      source("pilot-custom-home"),
      source("pilot-custom-history"),
      source("pilot-custom-standard"),
      source("pilot-europe-custom"),
      source("pilot-australia-custom74"),
      source("pilot-con40-care-guide"),
      source("pilot-namiki-official"),
      source("pilot-tgs-custom-overview"),
      source("pilot-vanishing-point-commons"),
    ],
    scopes: [
      {
        key: "pilot-company-history",
        scopeKey: "pilot-company-history-1916-present",
        validFrom: "1916",
        productionState: "historical",
        editionScope: "official company timeline",
      },
      {
        key: "pilot-capless-lineage",
        scopeKey: "pilot-capless-lineage-1963-present",
        validFrom: "1963",
        productionState: "current",
        editionScope: "Capless retractable fountain-pen lineage",
      },
      {
        key: "pilot-custom-lineage",
        scopeKey: "pilot-custom-lineage-1971-present",
        validFrom: "1971",
        productionState: "current",
        editionScope: "CUSTOM fountain-pen family",
      },
      {
        key: "pilot-namiki-brand-boundary",
        scopeKey: "pilot-namiki-brand-boundary",
        productionState: "current",
        editionScope: "shared corporate history; separate product brand",
      },
    ],
    claims: [
      {
        key: "pilot-founded-1918",
        predicate: "company_founding",
        objectText:
          "并木良辅于 1916 年制成日本首枚完全国产的 14K 钢笔尖；1918 年，他在和田正雄协助下成立 Pilot 前身 Namiki Manufacturing Co., Ltd.，开始制造、销售钢笔。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pilot-corporate-history",
        locator: "official history entries for 1916 and 1918",
        evidence: [
          {
            key: "pilot-history-1916-1918",
            sourceKey: "pilot-corporate-history",
            scopeKey: "pilot-company-history",
            locator:
              "1916 first made-entirely-in-Japan 14K nib and 1918 Namiki Manufacturing foundation entries",
          },
        ],
      },
      {
        key: "pilot-capless-1963",
        predicate: "retractable_fountain_pen_milestone",
        objectText:
          "Pilot 官方历史将 1963 年推出的 Capless 记为世界首款伸缩笔尖钢笔。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "pilot-centenary-history",
        locator: "1963 Capless timeline entry",
        evidence: [
          {
            key: "pilot-centenary-capless",
            sourceKey: "pilot-centenary-history",
            scopeKey: "pilot-capless-lineage",
            locator:
              "official 1963 entry describing Capless as the first retractable fountain pen",
          },
        ],
      },
      {
        key: "pilot-custom-1971",
        predicate: "custom_series_origin",
        objectText:
          "Pilot 于 1971 年推出面向当代日本书写需求的 CUSTOM 系列，现行系列按标准型、Heritage、高阶漆面与独特机构继续分线。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pilot-centenary-history",
        locator: "1971 CUSTOM launch entry and current CUSTOM lineup",
        evidence: [
          {
            key: "pilot-centenary-custom",
            sourceKey: "pilot-centenary-history",
            scopeKey: "pilot-custom-lineage",
            locator: "official 1971 CUSTOM-series launch entry",
          },
          {
            key: "pilot-custom-current-groups",
            sourceKey: "pilot-custom-home",
            scopeKey: "pilot-custom-lineage",
            locator: "current official CUSTOM lineup groups",
          },
          {
            key: "pilot-custom-independent-overview",
            sourceKey: "pilot-tgs-custom-overview",
            scopeKey: "pilot-custom-lineage",
            locator:
              "Independent series overview distinguishes Custom 74, Heritage 92, 912 and 823 by nib size and filling route; retailer relationship disclosed",
          },
        ],
      },
      {
        key: "pilot-namiki-separate-brand",
        predicate: "brand_boundary",
        objectText:
          "Namiki 与 Pilot 共享公司历史并由 PILOT Corporation 运营，但 Namiki 官方以独立莳绘品牌和系列目录呈现，不作为普通 Pilot 型号混入。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "pilot-namiki-official",
        locator:
          "Namiki brand introduction and separate Collections navigation",
        evidence: [
          {
            key: "namiki-official-collections",
            sourceKey: "pilot-namiki-official",
            scopeKey: "pilot-namiki-brand-boundary",
            locator:
              "Namiki official site presents Emperor, Yukari, Chinkin and Nippon Art as its own collections",
          },
        ],
      },
    ],
    media: [
      {
        key: "pilot-brand-capless-primary",
        title: "Pilot Vanishing Point M 尖实物近照（仅代表 Capless 路线）",
        sourceKey: "pilot-vanishing-point-commons",
        localPath:
          "/images/library/wikimedia/pilot/pilot-vanishing-point-m-marek-kubica.jpg",
        author: "Marek Kubica",
        license: "cc-by-sa-2.0",
        attributionText:
          "Pilot Vanishing Point -M-，摄影 Marek Kubica，CC BY-SA 2.0；本站使用 Commons 生成的 1920 px 等比例缩略图，未裁切、未调色。所示为 Vanishing Point 笔尖近照，仅代表 Pilot 的 Capless 路线，不代表全品牌共同外观。",
        sourceUrl:
          "https://commons.wikimedia.org/wiki/File:Pilot_Vanishing_Point_-M-_(32057717435).jpg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "pilot-foundation-1918",
        title: "Namiki Manufacturing 成立并开始制造钢笔",
        eventType: "brand_founded",
        startDate: "1918",
        circa: false,
        description:
          "Pilot 官方公司史将 1918 年列为前身公司成立及钢笔制造销售起点。",
        sourceKey: "pilot-corporate-history",
      },
      {
        key: "pilot-capless-1963",
        title: "Capless 伸缩钢笔推出",
        eventType: "model_released",
        startDate: "1963",
        circa: false,
        description: "官方历史将其记为世界首款无笔帽伸缩钢笔。",
        sourceKey: "pilot-centenary-history",
      },
      {
        key: "pilot-custom-1971",
        title: "第一代 CUSTOM 系列推出",
        eventType: "model_released",
        startDate: "1971",
        circa: false,
        description:
          "CUSTOM 从不同书写需求出发，后来发展为 Pilot 的主要金尖钢笔系列之一。",
        sourceKey: "pilot-centenary-history",
      },
    ],
  },
  {
    key: "phase26-pilot-custom74-v1",
    entityId: "gtneqw804HyP",
    expectedType: "pen",
    expectedSlug: "百乐-pilot-custom-74",
    canonicalName: "百乐 Pilot Custom 74",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/pilot-custom-74-publishable-content-2026-07-19.md",
    storyTitle: "百乐 Pilot Custom 74：5 号金尖、11 种尖号与各地区版本",
    primarySourceKey: "pilot-webcatalog-custom74",
    depthTier: "A",
    aliases: [
      {
        alias: "Pilot Custom 74",
        language: "en",
        sourceKey: "pilot-custom-standard",
      },
      {
        alias: "PILOT CUSTOM74",
        language: "en",
        sourceKey: "pilot-custom-history",
      },
      {
        alias: "CUSTOM74",
        language: "en",
        sourceKey: "pilot-custom-history",
      },
    ],
    sources: [
      source("pilot-custom-home"),
      source("pilot-custom-history"),
      source("pilot-custom-standard"),
      source("pilot-custom-heritage"),
      source("pilot-webcatalog-custom74"),
      source("pilot-custom-nib-list"),
      source("pilot-custom-nib-quality"),
      source("pilot-custom-process"),
      source("pilot-europe-custom"),
      source("pilot-australia-custom74"),
      source("pilot-con40-care-guide"),
      source("pilot-tgs-custom-overview"),
      source("pilot-tgs-custom74-review"),
      source("pilot-penaddict-custom74-nibs"),
      source("pilot-custom74-commons"),
    ],
    variants: [
      {
        key: "japan-black-standard",
        name: "日本现行黑色标准尖",
        notes:
          "FKKN-12SR 黑色杆可选 EF、F、SF、FM、SFM、M、SM、B、BB；2026-07-19 日本目录快照。",
        sourceKey: "pilot-webcatalog-custom74",
        variantKind: "market_sku",
        productCode: "FKKN-12SR-B",
        market: "日本",
      },
      {
        key: "japan-colour-standard",
        name: "日本现行深红／深蓝／深绿",
        notes:
          "FKKN-12SR 的 DR、DL、DG 仅提供 EF、F、M、B；不把黑色杆的软尖和 BB 套到这些颜色。",
        sourceKey: "pilot-webcatalog-custom74",
        variantKind: "market_sku",
        productCode: "FKKN-12SR-DR/DL/DG",
        market: "日本",
      },
      {
        key: "japan-black-c-ms",
        name: "日本现行黑色 C／MS",
        notes:
          "C 与 MS 使用黑色 FKKN-14SR 独立商品代码；不是所有颜色的常规选项。",
        sourceKey: "pilot-custom-standard",
        variantKind: "market_sku",
        productCode: "FKKN-14SR",
        market: "日本",
      },
      {
        key: "europe-transparent",
        name: "欧洲透明彩色杆",
        notes:
          "欧洲官方页面列 F、M、B 与透明彩色杆；只代表当前欧洲页面，不扩写为全球目录。",
        sourceKey: "pilot-europe-custom",
        variantKind: "market_sku",
        market: "欧洲",
      },
      {
        key: "us-lavender-fog-specialty",
        name: "美国 Lavender Fog 特别配色尖号",
        notes:
          "2026 年 Pen Addict 的 Pilot USA 样笔记录 SF、SFM、SM、BB 当时仅随 Lavender Fog 提供；为美国市场快照，非全球规则。",
        sourceKey: "pilot-penaddict-custom74-nibs",
        variantKind: "market_sku",
        market: "美国",
      },
    ],
    scopes: [
      {
        key: "custom67-design-precursor",
        scopeKey: "pilot-custom67-design-precursor-1985",
        validFrom: "1985",
        productionState: "historical",
        editionScope: "Custom 67 design precursor only",
      },
      {
        key: "custom74-lineage",
        scopeKey: "pilot-custom74-lineage-1992-present",
        validFrom: "1992",
        productionState: "current",
        editionScope: "Custom 74 model lineage",
      },
      {
        key: "custom74-japan-current",
        scopeKey: "pilot-custom74-japan-current-2026-07-19",
        market: "日本",
        validFrom: "2026-07-19",
        productionState: "current",
        nibScope: "EF/F/SF/FM/SFM/M/SM/B/BB plus black-only C/MS",
        materialScope: "resin barrel and cap",
        editionScope: "FKKN-12SR and FKKN-14SR official catalog snapshot",
      },
      {
        key: "custom74-europe-current",
        scopeKey: "pilot-custom74-europe-current-2026-07-19",
        market: "欧洲",
        validFrom: "2026-07-19",
        productionState: "current",
        nibScope: "F/M/B",
        editionScope: "transparent tinted barrel official web snapshot",
      },
      {
        key: "custom74-australia-discontinued",
        scopeKey: "pilot-custom74-australia-discontinued-observed-2026-07-09",
        market: "澳大利亚",
        productionState: "historical",
        editionScope:
          "official page observed as Discontinued at its 2026-07-09 update; effective end date not stated; retailers may retain stock",
      },
      {
        key: "custom74-91-742-comparison",
        scopeKey: "pilot-custom74-91-742-japan-comparison-2026-07-19",
        market: "日本",
        validFrom: "2026-07-19",
        productionState: "current",
        editionScope:
          "official Custom 74, Custom Heritage 91 and Custom 742 lineup comparison snapshot",
      },
      {
        key: "custom74-us-2026-samples",
        scopeKey: "pilot-custom74-us-sample-lineup-2026-06",
        market: "美国",
        validFrom: "2026-06-12",
        productionState: "current",
        nibScope:
          "eight tested nib options; specialty options tied to Lavender Fog in sample set",
        editionScope: "Pilot-USA-supplied sample set; dip tested by reviewer",
      },
      {
        key: "custom74-care",
        scopeKey: "pilot-cartridge-converter-care-current",
        productionState: "current",
        editionScope: "official cartridge / CON-40 care guidance",
      },
      {
        key: "custom74-review-sample",
        scopeKey: "pilot-custom74-independent-review-sample-2023",
        market: "美国",
        validFrom: "2023-06-03",
        productionState: "unknown",
        editionScope: "reviewer's daily-use sample and market snapshot",
      },
      {
        key: "custom74-photo-2016",
        scopeKey: "pilot-custom74-sfm-photo-2016",
        validFrom: "2016-05-10",
        productionState: "historical",
        nibScope: "SFM photographed sample",
        editionScope: "single photographed pen; not a current global lineup",
      },
    ],
    claims: [
      {
        key: "custom74-release-and-name",
        predicate: "model_identity_and_release",
        objectText:
          "Custom 74 于 1992 年推出，外形承接 1985 年 Custom 67；数字 74 来自 Pilot 创立 74 周年。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pilot-custom-history",
        locator:
          "1985 and 1992 official history entries plus model-number footnote",
        evidence: [
          {
            key: "custom67-precursor",
            sourceKey: "pilot-custom-history",
            scopeKey: "custom67-design-precursor",
            locator:
              "1985 Custom 67 entry describes design leading to current Custom 74",
          },
          {
            key: "custom74-1992",
            sourceKey: "pilot-custom-history",
            scopeKey: "custom74-lineage",
            locator:
              "1992 Custom 74 entry and footnote that 74 marks the 74th anniversary",
          },
        ],
      },
      {
        key: "custom74-japan-current-spec",
        predicate: "current_japan_specification",
        objectText:
          "日本现行 FKKN-12SR 使用 14K 5 号尖、树脂笔杆/笔帽、旋帽、CON-40/CON-70N，目录尺寸 143 × 最大径 14.7 mm、17.4 g。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pilot-webcatalog-custom74",
        locator: "current Japanese product specification table",
        evidence: [
          {
            key: "custom74-japan-spec-table",
            sourceKey: "pilot-webcatalog-custom74",
            scopeKey: "custom74-japan-current",
            locator:
              "14K No.5, screw cap, resin, CON-40/CON-70N, 143 mm, 14.7 mm and 17.4 g fields",
          },
        ],
      },
      {
        key: "custom74-japan-nib-colour-boundary",
        predicate: "nib_and_colour_availability",
        objectText:
          "日本目录的黑色 FKKN-12SR 提供九种标准/软尖，有色杆只提供 EF/F/M/B；C/MS 使用黑色 FKKN-14SR，不能自由交叉组合。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pilot-custom-standard",
        locator: "CUSTOM74 nib list and barrel-colour availability notes",
        evidence: [
          {
            key: "custom74-standard-nibs",
            sourceKey: "pilot-custom-standard",
            scopeKey: "custom74-japan-current",
            locator:
              "FKKN-12SR EF/F/SF/FM/SFM/M/SM/B/BB with DR/DL/DG limited to EF/F/M/B",
          },
          {
            key: "custom74-c-ms-black",
            sourceKey: "pilot-custom-standard",
            scopeKey: "custom74-japan-current",
            locator: "FKKN-14SR C/MS only available in black",
          },
        ],
      },
      {
        key: "custom74-market-boundary",
        predicate: "market_configuration_boundary",
        objectText:
          "欧洲、美国、日本和澳大利亚的配色、尖号与在售状态不同；这些是地区快照，不是一张全球统一目录。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: "pilot-europe-custom",
        locator:
          "European official F/M/B listing, Australian discontinued status and 2026 U.S. review sample boundary",
        evidence: [
          {
            key: "custom74-europe-three-nibs",
            sourceKey: "pilot-europe-custom",
            scopeKey: "custom74-europe-current",
            locator:
              "European product block lists F/M/B and tinted transparent barrel",
          },
          {
            key: "custom74-australia-ended",
            sourceKey: "pilot-australia-custom74",
            scopeKey: "custom74-australia-discontinued",
            locator:
              "official page displays Discontinued and Last updated 2026-07-09 without stating an effective end date",
          },
          {
            key: "custom74-us-sample-boundary",
            sourceKey: "pilot-penaddict-custom74-nibs",
            scopeKey: "custom74-us-2026-samples",
            locator:
              "Pilot-USA-supplied samples and Lavender Fog specialty-nib availability note",
          },
        ],
      },
      {
        key: "custom74-91-742-choice",
        predicate: "adjacent_model_choice_boundary",
        objectText:
          "Custom Heritage 91 与 74 同用 14K 5 号尖，主要差在平顶银色调外形；742 使用更大 10 号尖并提供更多特殊尖。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "pilot-custom-heritage",
        locator: "official Heritage 91 and standard 742 product blocks",
        evidence: [
          {
            key: "heritage91-number5",
            sourceKey: "pilot-custom-heritage",
            scopeKey: "custom74-91-742-comparison",
            locator:
              "Heritage 91 official block lists 14K No.5 and nine nib types with silver-keynote design",
          },
          {
            key: "custom742-number10",
            sourceKey: "pilot-custom-standard",
            scopeKey: "custom74-91-742-comparison",
            locator:
              "Custom 742 official block lists 14K No.10 and sixteen nib types",
          },
        ],
      },
      {
        key: "custom74-care-boundary",
        predicate: "maintenance_guidance",
        objectText:
          "官方墨囊/CON-40 维护要求长期不用时排墨、以清水反复吸排并让上墨器完全干燥，不建议用户自行修理精密部件。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "pilot-con40-care-guide",
        locator: "Care and Storage section",
        evidence: [
          {
            key: "pilot-cartridge-converter-care",
            sourceKey: "pilot-con40-care-guide",
            scopeKey: "custom74-care",
            locator:
              "drain ink, flush with clean water several times, dry converter completely and do not self-repair",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: "Zt-PbXkE7UHM",
      values: {
        series_name: "PILOT CUSTOM 标准型",
        release_year: "1992",
        origin_country: "日本；CUSTOM 官方说明为笔尖至笔身日本制造",
        nib: "14K 5 号；日本现行共 11 种，但尖号与颜色组合受 SKU 限制",
        fill_system: "Pilot 墨囊／上墨器两用；日本现行兼容 CON-40、CON-70N",
        material: "树脂笔杆与笔帽",
        dimensions: "全长 143 mm；最大径 14.7 mm（日本现行目录值）",
        weight: "17.4 g（日本现行目录值；不含不同墨量造成的变化）",
        status:
          "日本与欧洲仍有官方产品页；澳大利亚官方页截至 2026-07-09 更新时标为 Discontinued，实际停止经销日期未注明",
      },
      evidence: [
        {
          key: "custom74-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "pilot-custom-home",
          scopeKey: "custom74-lineage",
          locator: "PILOT official CUSTOM lineup identifies Custom 74",
        },
        {
          key: "custom74-series",
          fieldKey: "series_name",
          sourceKey: "pilot-custom-standard",
          scopeKey: "custom74-japan-current",
          locator: "Custom 74 grouped with standard models 742 and 743",
        },
        {
          key: "custom74-release",
          fieldKey: "release_year",
          sourceKey: "pilot-custom-history",
          scopeKey: "custom74-lineage",
          locator: "official 1992 Custom 74 history entry",
        },
        {
          key: "custom74-origin",
          fieldKey: "origin_country",
          sourceKey: "pilot-custom-process",
          scopeKey: "custom74-japan-current",
          locator: "CUSTOM made-entirely-in-Japan statement from nib to body",
        },
        {
          key: "custom74-nib",
          fieldKey: "nib",
          sourceKey: "pilot-custom-standard",
          scopeKey: "custom74-japan-current",
          locator: "14K No.5 and Japan-market nib availability list",
        },
        {
          key: "custom74-fill",
          fieldKey: "fill_system",
          sourceKey: "pilot-webcatalog-custom74",
          scopeKey: "custom74-japan-current",
          locator:
            "CON-40 and CON-70N compatibility plus cartridge/converter filling videos",
        },
        {
          key: "custom74-material",
          fieldKey: "material",
          sourceKey: "pilot-webcatalog-custom74",
          scopeKey: "custom74-japan-current",
          locator: "barrel and cap listed as resin",
        },
        {
          key: "custom74-dimensions",
          fieldKey: "dimensions",
          sourceKey: "pilot-webcatalog-custom74",
          scopeKey: "custom74-japan-current",
          locator: "maximum diameter 14.7 mm and total length 143 mm",
        },
        {
          key: "custom74-weight",
          fieldKey: "weight",
          sourceKey: "pilot-webcatalog-custom74",
          scopeKey: "custom74-japan-current",
          locator: "catalog weight 17.4 g",
        },
        {
          key: "custom74-status-japan",
          fieldKey: "status",
          sourceKey: "pilot-webcatalog-custom74",
          scopeKey: "custom74-japan-current",
          locator: "live Japanese catalog listing retrieved 2026-07-19",
        },
        {
          key: "custom74-status-europe",
          fieldKey: "status",
          sourceKey: "pilot-europe-custom",
          scopeKey: "custom74-europe-current",
          locator:
            "live European Custom collection listing retrieved 2026-07-19",
        },
        {
          key: "custom74-status-australia",
          fieldKey: "status",
          sourceKey: "pilot-australia-custom74",
          scopeKey: "custom74-australia-discontinued",
          locator:
            "official page displays Discontinued and Last updated 2026-07-09; effective end date not stated",
        },
      ],
    },
    media: [
      {
        key: "pilot-custom74-primary",
        title: "Pilot Custom 74 SFM 实物（2016 年样本）",
        sourceKey: "pilot-custom74-commons",
        localPath:
          "/images/library/wikimedia/pilot/pilot-custom-74-m-dreibelbis.jpg",
        author: "M Dreibelbis",
        license: "cc-by-2.0",
        attributionText:
          "Pilot Custom 74 with Soft Fine-Medium nib，摄影 M Dreibelbis，CC BY 2.0；本站使用 Commons 生成的 1920 px 等比例缩略图，未裁切、未调色。拍摄于 2016 年，仅代表所示黑色 SFM 样本，不代表 2026 年全球全部配色与饰件。",
        sourceUrl:
          "https://commons.wikimedia.org/wiki/File:Pilot_Custom_74_(26901490646).jpg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "custom67-precursor-1985",
        title: "Custom 67 建立后续 Custom 74 的设计方向",
        eventType: "design_milestone",
        startDate: "1985",
        circa: false,
        description:
          "Pilot 官方系列史明确把 Custom 67 的传统外形写为通向现行 Custom 74 的设计。",
        sourceKey: "pilot-custom-history",
      },
      {
        key: "custom74-launch-1992",
        title: "Custom 74 推出",
        eventType: "model_released",
        startDate: "1992",
        circa: false,
        description:
          "数字 74 对应 Pilot 创立 74 周年；不是笔尖尺寸或墨量编号。",
        sourceKey: "pilot-custom-history",
      },
    ],
  },
];
