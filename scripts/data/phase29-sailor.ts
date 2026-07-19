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
  "sailor-company-history": liveSource({
    key: "sailor-company-history",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "Our History",
    url: "https://en.sailor.co.jp/company/our-history/",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "Sailor 官方公司史：1911 年创办、1917 年规模生产，以及 1954／1958 年墨囊式钢笔节点。",
    locator:
      "official company-history entries for 1911, 1917, 1954 and 1958",
  }),
  "sailor-history-step": liveSource({
    key: "sailor-history-step",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "セーラー万年筆の歴史 — STEP",
    url: "https://sailor.co.jp/topics/step/",
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    summary:
      "Sailor 官方历史专题：1969 年 21K 金尖、1981 年 Profit、2000 年长刀研、2003 年 Professional Gear、2017 年四季织。",
    locator:
      "official timeline entries for 1969, 1981, 2000, 2003 and 2017",
  }),
  "sailor-old-1911-series": liveSource({
    key: "sailor-old-1911-series",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "sailor-official",
    title: "1911 Series",
    url: "https://en.sailor.co.jp/category_product/fountain-pen/1911/",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "旧英文系列页把 11-1219 列为 1911 Standard、11-2021／11-2024 列为 1911 Large；仅用于旧英文命名边界。",
    locator:
      "legacy 1911 Standard and 1911 Large lineup; stale relative to the 2025-2026 Japanese catalog",
  }),
  "sailor-profit14-18-launch": liveSource({
    key: "sailor-profit14-18-launch",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "『プロフィット 14』、『プロフィット 18』2025年12月13日より全国発売",
    url: "https://sailor.co.jp/news/20251203-1/",
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    publishedAt: "2025-12-03",
    summary:
      "官方新品公告：Profit 14 与 Profit 18 于 2025-12-13 上市，分别增加大型 14K 与大型 18K 金尖路线。",
    locator:
      "2025-12-03 announcement, release date and large 14K/18K nib descriptions",
  }),
  "sailor-profit14": liveSource({
    key: "sailor-profit14",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "プロフィット 14 ゴールドトリム万年筆 — 11-1214",
    url: "https://sailor.co.jp/product/11-1214/",
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    summary:
      "日本官网的现行 Profit 14 单品页；大型 14K 尖，商品家族代码 11-1214。",
    locator: "current product title, 11-1214 codes and large 14K nib specification",
  }),
  "sailor-profit18": liveSource({
    key: "sailor-profit18",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "プロフィット 18 ゴールドトリム万年筆 — 11-2218",
    url: "https://sailor.co.jp/product/11-2218/",
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    summary:
      "日本官网的现行 Profit 18 单品页；大型 18K 尖，商品家族代码 11-2218。",
    locator: "current product title, 11-2218 codes and large 18K nib specification",
  }),
  "sailor-pgs21": liveSource({
    key: "sailor-pgs21",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "プロフェッショナルギア スリム 21 万年筆 — 11-2151",
    url: "https://sailor.co.jp/product/11-2151/",
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    summary:
      "2026 年现行 Professional Gear Slim 21 页面；平顶路线、21K 中型尖，不能与圆头 11-1219 合并。",
    locator:
      "2026-03-14 release, Professional Gear design language and 21K medium-size nib",
  }),
  "sailor-profit-realo18": liveSource({
    key: "sailor-profit-realo18",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "プロフィット レアロ 18 万年筆 — 11-1853",
    url: "https://sailor.co.jp/product/11-1853/",
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    summary:
      "2026 年现行 Profit Realo 18 页面；18K 大型尖、尾栓旋转吸墨，明确不兼容墨囊／上墨器。",
    locator:
      "2026-05-30 release, 18K large nib and piston filling specification",
  }),
  "sailor-plating-change": liveSource({
    key: "sailor-plating-change",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "Specification Change (Plating Process)",
    url: "https://en.sailor.co.jp/topics/specification-change-plating-process/",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "官方饰件工艺变更：部分 1911、Professional Gear 与 Shikiori 从 gold plating 更新为 Gold Ion Plating。",
    locator:
      "change from gold plating to Gold Ion Plating and affected product list including 11-1219",
  }),
  "sailor-1219-jp": liveSource({
    key: "sailor-1219-jp",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "プロフィット スタンダード万年筆 — 11-1219",
    url: "https://sailor.co.jp/product/11-1219/",
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    summary:
      "日本官网现行 11-1219：三色七尖号、14K 中型尖、两用式、PMMA、Gold IP、尺寸、重量与 2026-07-19 价格。",
    locator:
      "product codes lines 334-359 and specification fields lines 387-403; prices lines 294-302",
  }),
  "sailor-1219-en": liveSource({
    key: "sailor-1219-en",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "1911 S Fountain Pen — 11-1219",
    url: "https://en.sailor.co.jp/product/11-1219/",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "英文官网把相同 11-1219 商品代码称为 1911 S，并重复 14K、两用式、PMMA、尺寸与重量。",
    locator:
      "1911 S title, 11-1219 item codes and English specification table",
  }),
  "sailor-1521-jp": liveSource({
    key: "sailor-1521-jp",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "プロフィット スタンダード 21 万年筆 — 11-1521",
    url: "https://sailor.co.jp/product/11-1521/",
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    summary:
      "同尺寸历史兄弟 11-1521：21K 中型尖、17.2 g，并标注库存售完即结束销售。",
    locator:
      "21K medium-size nib, 17 x 135 mm, 17.2 g and sale-ending-when-stock-runs-out notice",
  }),
  "sailor-2021-en": liveSource({
    key: "sailor-2021-en",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "sailor-official",
    title: "1911 L Gold Trim Fountain Pen — 11-2021",
    url: "https://en.sailor.co.jp/product/11-2021/",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "旧 1911 L 金色饰件单品页；大型 21K 路线，用于与 11-1219 的尺寸和身份边界对照。",
    locator: "1911 L identity, 11-2021 codes and 21K large-nib specification",
  }),
  "sailor-2024-en": liveSource({
    key: "sailor-2024-en",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "sailor-official",
    title: "1911 L Silver Trim Fountain Pen — 11-2024",
    url: "https://en.sailor.co.jp/product/11-2024/",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "旧 1911 L 银色饰件单品页；大型 21K 路线，用于与 11-1219 的尺寸和饰件边界对照。",
    locator: "1911 L identity, 11-2024 codes and 21K large-nib specification",
  }),
  "sailor-1029-pensachi": liveSource({
    key: "sailor-1029-pensachi",
    registryKey: "pensachi",
    registryName: "PenSachi",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "pensachi-retailer",
    title: "Sailor 1911 Standard Black Silver — 11-1029",
    url: "https://www.pensachi.com/products/11-1029",
    homepageUrl: "https://www.pensachi.com/",
    author: "PenSachi",
    summary:
      "零售历史记录把 11-1029 列作 14K、银色／rhodium 饰件的 1911 Standard；仅用于身份边界，不作现行状态依据。",
    locator:
      "product code, 14K nib and rhodium/silver trim fields; retailer record only",
  }),
  "sailor-care": liveSource({
    key: "sailor-care",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "How to care for fountain pens",
    url: "https://en.sailor.co.jp/topics/how-to-care-for-fountain-pens/",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "官方维护说明：墨囊／上墨器钢笔用清水冲洗，借上墨器反复吸排约五至六次，并提示材料与浸泡边界。",
    locator:
      "converter cleaning steps, repeat drawing and expelling water 5-6 times, material cautions",
  }),
  "sailor-penaddict-review": liveSource({
    key: "sailor-penaddict-review",
    registryKey: "pen-addict",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict",
    title: "Sailor 1911 Standard Royal Amethyst Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2020/2/10/sailor-1911-standard-royal-amethyst-fountain-pen-review",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
    publishedAt: "2020-02-10",
    summary:
      "独立评测以单支 Royal Amethyst 样笔说明较小 14K 1911 Standard 与较大 21K 1911／Pro Gear 的产品架构差异；披露由 Goldspot 免费提供。",
    locator:
      "review introduction, size/nib family comparison and Goldspot review-unit disclosure",
  }),
  "sailor-brand-site-original": {
    key: "sailor-brand-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Sailor 品牌馆暖色编辑插画（AI 辅助制作）",
    url: "/images/library/warm-pen-atlas/sailor-brand-cover.jpg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial with OpenAI image generation",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创编辑插画（AI 辅助制作）；非 Sailor 产品实拍，不代表具体型号、商标、刻字、尺寸、颜色或生产批次。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: "/images/library/warm-pen-atlas/sailor-brand-cover.jpg",
    archiveLocator:
      "project-public-asset:sailor-brand-cover.jpg;site-original=true;ai-assisted=true;generator=OpenAI-image-generation;product-photo=false;specific-model=false;logo-or-engraving-evidence=false;size=1800x1012;sha256=e6d940f27911dabf20c31288bd29bc7be74de4fe4a5cc1144718c4db705a9215",
  },
  "sailor-1219-site-original": {
    key: "sailor-1219-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "1911 Standard 14K 语境编辑插画（AI 辅助制作）",
    url: "/images/library/site-original/sailor/sailor-1911-standard-14k-editorial.jpg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial with OpenAI image generation",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创风格化编辑插画（AI 辅助制作）；非 11-1219 产品实拍，不代表商标、笔尖刻字、真实颜色、比例或批次。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/sailor/sailor-1911-standard-14k-editorial.jpg",
    archiveLocator:
      "project-public-asset:sailor-1911-standard-14k-editorial.jpg;site-original=true;ai-assisted=true;generator=OpenAI-image-generation;product-photo=false;logo=false;engraving=false;exact-color=false;size=1536x1024;sha256=33a7eff2b308594a378d2d643d590c66230f9165431850e09cab137cecf87579",
  },
  "sailor-1521-commons": {
    key: "sailor-1521-commons",
    registryKey: "wikimedia-commons",
    registryName: "Wikimedia Commons",
    sourceType: "wikimedia",
    tier: "primary",
    independenceGroup: "wikimedia-mehmet-pinarci",
    title: "Sailor 1911 Standard 21K Zoom nib",
    url: "https://commons.wikimedia.org/wiki/File:Sailor_1911_Standard_21K_Zoom_nib.jpg",
    homepageUrl: "https://commons.wikimedia.org/",
    itemType: "image",
    author: "Mehmet Pinarci",
    publishedAt: "2014-02-12",
    retrievedAt: RETRIEVED,
    summary:
      "Mehmet Pinarci 拍摄的 21K Zoom 笔尖实物；仅作 11-1521／旧 21K 同尺寸兄弟型号对照，不代表 14K 11-1219。",
    allowedUse: "store_full",
    license: "cc-by-2.0",
    archiveUrl:
      "/images/library/wikimedia/sailor/sailor-1911-standard-21k-zoom.jpg",
    archiveLocator:
      "commons-oldid=916389435;original=3264x2448;local-original=true;resize=false;crop=false;color-edit=false;license=CC-BY-2.0;author=Mehmet-Pinarci;sha1=455599f9e7aaa811ef8396adaaa9d44e46ddebda;sha256=b21d437e960e2417e2aa6290ba9b68855c53776bf41e3bce5fd9ad6ddaa032e3",
  },
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

export const phase29SailorPacks: CuratedEntityPack[] = [
  {
    key: "phase29-sailor-brand-v1",
    entityId: "ce2dcqixqSCx",
    expectedType: "brand",
    expectedSlug: "sailor",
    canonicalName: "写乐 Sailor",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/sailor-brand-publishable-content-2026-07-19.md",
    storyTitle: "写乐 Sailor 怎么分：Profit／1911、Pro Gear、Realo 与特殊笔尖",
    primarySourceKey: "sailor-company-history",
    depthTier: "A",
    aliases: [
      {
        alias: "Sailor",
        language: "en",
        sourceKey: "sailor-company-history",
      },
      {
        alias: "SAILOR",
        language: "en",
        sourceKey: "sailor-company-history",
      },
      {
        alias: "セーラー万年筆",
        language: "ja",
        sourceKey: "sailor-company-history",
      },
    ],
    sources: [
      source("sailor-company-history"),
      source("sailor-history-step"),
      source("sailor-old-1911-series"),
      source("sailor-profit14-18-launch"),
      source("sailor-profit14"),
      source("sailor-profit18"),
      source("sailor-pgs21"),
      source("sailor-profit-realo18"),
      source("sailor-plating-change"),
      source("sailor-penaddict-review"),
      source("sailor-brand-site-original"),
    ],
    scopes: [
      {
        key: "company-history",
        scopeKey: "sailor-company-history-1911-present",
        validFrom: "1911",
        productionState: "historical",
        editionScope: "official corporate and product history",
      },
      {
        key: "profit-1911-family",
        scopeKey: "sailor-profit-1911-family-1981-present",
        validFrom: "1981",
        productionState: "current",
        editionScope: "Profit in Japan and 1911 in English-language markets",
      },
      {
        key: "progear-boundary",
        scopeKey: "sailor-professional-gear-boundary",
        productionState: "current",
        editionScope: "flat-top Professional Gear family; separate from Profit/1911",
      },
      {
        key: "realo-boundary",
        scopeKey: "sailor-realo-filling-boundary-2026",
        validFrom: "2026-05-30",
        productionState: "current",
        editionScope: "piston-filled Profit Realo 18 and historical Realo line",
      },
      {
        key: "special-nib-boundary",
        scopeKey: "sailor-special-nib-boundary-2000-present",
        validFrom: "2000",
        productionState: "current",
        editionScope: "Naginata and other specialty-nib route, not a universal series alias",
      },
      {
        key: "catalog-transition",
        scopeKey: "sailor-japan-catalog-transition-2025-2026",
        market: "日本",
        validFrom: "2025-12-13",
        productionState: "current",
        editionScope:
          "Profit 14/18, Professional Gear Slim 21 and Profit Realo 18 current-line snapshot",
      },
    ],
    claims: [
      {
        key: "sailor-founding",
        predicate: "company_founding",
        objectText:
          "Sailor 于 1911 年在广岛县吴市由阪田久五郎与兄弟创办，1917 年进入规模化制造。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "sailor-company-history",
        locator: "official 1911 and 1917 company-history entries",
        evidence: [
          {
            key: "sailor-founding-official",
            sourceKey: "sailor-company-history",
            scopeKey: "company-history",
            locator: "1911 foundation in Kure and 1917 volume manufacture entries",
          },
        ],
      },
      {
        key: "sailor-cartridge-and-21k",
        predicate: "technical_milestones",
        objectText:
          "官方历史记录了 1954／1958 年墨囊式钢笔节点和 1969 年 21K 金尖节点；这些是品牌技术史，不表示所有现行型号均为 21K。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "sailor-company-history",
        locator: "official cartridge entries and 1969 21K timeline entry",
        evidence: [
          {
            key: "sailor-cartridge-history",
            sourceKey: "sailor-company-history",
            scopeKey: "company-history",
            locator: "1954 invention and 1958 product-introduction entries",
          },
          {
            key: "sailor-21k-history",
            sourceKey: "sailor-history-step",
            scopeKey: "company-history",
            locator: "1969 21K gold-nib milestone",
          },
        ],
      },
      {
        key: "sailor-profit-1911-name",
        predicate: "regional_family_name",
        objectText:
          "1981 年起的 Profit 是日本市场核心圆头家族；英语页面常用 1911，但只有商品代码与规格一致时才能合并为同一型号。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "sailor-history-step",
        locator: "1981 Profit entry and legacy 1911 lineup",
        evidence: [
          {
            key: "profit-1981",
            sourceKey: "sailor-history-step",
            scopeKey: "profit-1911-family",
            locator: "1981 Profit-series history entry",
          },
          {
            key: "1911-regional-name",
            sourceKey: "sailor-old-1911-series",
            scopeKey: "profit-1911-family",
            locator: "English 1911 Standard and Large lineup labels",
          },
          {
            key: "1911-independent-family-check",
            sourceKey: "sailor-penaddict-review",
            scopeKey: "profit-1911-family",
            locator:
              "Independent review distinguishes the smaller 14K 1911 Standard from larger 21K 1911 and Pro Gear families; free review unit disclosed",
          },
        ],
      },
      {
        key: "sailor-family-boundaries",
        predicate: "product_family_boundary",
        objectText:
          "Professional Gear 是平顶设计家族，Realo 是活塞上墨路线，四季织按季节主题组织；三者都不是 Profit／1911 的通用别名。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "sailor-pgs21",
        locator: "current Professional Gear Slim 21 and Profit Realo 18 pages",
        evidence: [
          {
            key: "progear-current-boundary",
            sourceKey: "sailor-pgs21",
            scopeKey: "progear-boundary",
            locator: "flat-top Professional Gear design and separate 11-2151 codes",
          },
          {
            key: "realo-current-boundary",
            sourceKey: "sailor-profit-realo18",
            scopeKey: "realo-boundary",
            locator: "piston filler that rejects cartridges and converters",
          },
          {
            key: "shikiori-history-boundary",
            sourceKey: "sailor-history-step",
            scopeKey: "company-history",
            locator: "2017 Shikiori timeline entry, distinct from 1981 Profit",
          },
        ],
      },
      {
        key: "sailor-naginata-boundary",
        predicate: "special_nib_boundary",
        objectText:
          "长刀研 Naginata Togi 是 2000 年进入官方历史的特殊笔尖路线，不等于 11-1219 的 Z／MS，也不覆盖所有 Sailor 金尖。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "sailor-history-step",
        locator: "2000 Naginata Togi history entry",
        evidence: [
          {
            key: "naginata-2000",
            sourceKey: "sailor-history-step",
            scopeKey: "special-nib-boundary",
            locator: "official 2000 specialty-nib milestone",
          },
        ],
      },
      {
        key: "sailor-current-transition",
        predicate: "current_catalog_transition",
        objectText:
          "2025—2026 日本目录增加 Profit 14／18、Professional Gear Slim 21 与 Profit Realo 18；旧英文 1911 汇总页只作历史命名参考。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "sailor-profit14-18-launch",
        locator: "2025 launch and current 2026 product pages",
        evidence: [
          {
            key: "profit14-18-current",
            sourceKey: "sailor-profit14-18-launch",
            scopeKey: "catalog-transition",
            locator: "2025-12-13 launch of large 14K and 18K Profit models",
          },
          {
            key: "pgs21-current",
            sourceKey: "sailor-pgs21",
            scopeKey: "catalog-transition",
            locator: "2026-03-14 Professional Gear Slim 21 release",
          },
          {
            key: "realo18-current",
            sourceKey: "sailor-profit-realo18",
            scopeKey: "catalog-transition",
            locator: "2026-05-30 Profit Realo 18 release",
          },
        ],
      },
    ],
    media: [
      {
        key: "sailor-brand-editorial-primary",
        title: "Sailor 品牌馆暖色编辑插画（AI 辅助制作）",
        sourceKey: "sailor-brand-site-original",
        localPath: "/images/library/warm-pen-atlas/sailor-brand-cover.jpg",
        author: "Fountain Pen Graph editorial with OpenAI image generation",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创编辑插画，使用 OpenAI 图像生成辅助制作。非 Sailor 产品实拍，不代表任何具体型号、商标、笔尖刻字、尺寸、配色或生产批次；不能作为鉴定证据。",
        sourceUrl: "/images/library/warm-pen-atlas/sailor-brand-cover.jpg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "sailor-founded-1911",
        title: "Sailor 在广岛县吴市创办",
        eventType: "brand_founded",
        startDate: "1911",
        circa: false,
        description: "阪田久五郎与兄弟创办写乐的前身企业。",
        sourceKey: "sailor-company-history",
      },
      {
        key: "sailor-volume-1917",
        title: "进入规模化钢笔制造",
        eventType: "design_milestone",
        startDate: "1917",
        circa: false,
        description: "官方公司史把 1917 年列为规模生产节点。",
        sourceKey: "sailor-company-history",
      },
      {
        key: "sailor-cartridge-1958",
        title: "墨囊式钢笔进入产品化",
        eventType: "design_milestone",
        startDate: "1958",
        circa: false,
        description: "承接 1954 年相关发明，官方公司史在 1958 年记录产品推出。",
        sourceKey: "sailor-company-history",
      },
      {
        key: "sailor-21k-1969",
        title: "21K 金尖成为品牌技术节点",
        eventType: "design_milestone",
        startDate: "1969",
        circa: false,
        description: "这是品牌历史节点，不表示所有 Sailor 型号都是 21K。",
        sourceKey: "sailor-history-step",
      },
      {
        key: "sailor-profit-1981",
        title: "Profit 系列推出",
        eventType: "model_released",
        startDate: "1981",
        circa: false,
        description: "Profit 后来在英语市场常以 1911 家族名呈现。",
        sourceKey: "sailor-history-step",
      },
      {
        key: "sailor-naginata-2000",
        title: "长刀研特殊笔尖进入官方时间线",
        eventType: "design_milestone",
        startDate: "2000",
        circa: false,
        description: "长刀研是特殊笔尖路线，不是所有标准尖的别名。",
        sourceKey: "sailor-history-step",
      },
      {
        key: "sailor-profit14-18-2025",
        title: "Profit 14 与 Profit 18 上市",
        eventType: "model_released",
        startDate: "2025-12-13",
        circa: false,
        description: "新大型 14K／18K 路线进入日本目录。",
        sourceKey: "sailor-profit14-18-launch",
      },
    ],
  },
  {
    key: "phase29-sailor-1911-standard-v1",
    entityId: "GXGa7rK83Jmi",
    expectedType: "pen",
    expectedSlug: "sailor-1911-standard",
    canonicalName: "Sailor 1911 Standard / Profit Standard",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/sailor-1911-standard-1219-publishable-content-2026-07-19.md",
    storyTitle: "Sailor 1911 Standard 11-1219：中型 14K 与 21K 兄弟款怎么分",
    primarySourceKey: "sailor-1219-jp",
    depthTier: "A",
    aliases: [
      {
        alias: "Sailor 1911 Standard",
        language: "en",
        sourceKey: "sailor-1219-en",
      },
      {
        alias: "Sailor 1911 S",
        language: "en",
        sourceKey: "sailor-1219-en",
      },
      {
        alias: "Sailor Profit Standard",
        language: "en",
        sourceKey: "sailor-1219-jp",
      },
      {
        alias: "プロフィット スタンダード",
        language: "ja",
        sourceKey: "sailor-1219-jp",
      },
      {
        alias: "写乐 Sailor 1219 标准鱼雷",
        language: "zh",
        sourceKey: "sailor-1219-jp",
      },
    ],
    sources: [
      source("sailor-history-step"),
      source("sailor-1219-jp"),
      source("sailor-1219-en"),
      source("sailor-1521-jp"),
      source("sailor-1029-pensachi"),
      source("sailor-2021-en"),
      source("sailor-2024-en"),
      source("sailor-old-1911-series"),
      source("sailor-profit14-18-launch"),
      source("sailor-profit14"),
      source("sailor-profit18"),
      source("sailor-pgs21"),
      source("sailor-plating-change"),
      source("sailor-care"),
      source("sailor-penaddict-review"),
      source("sailor-1219-site-original"),
      source("sailor-1521-commons"),
    ],
    variants: [
      {
        key: "japan-ivory",
        name: "日本现行 Ivory",
        notes:
          "11-1219 Ivory：EF/F/MF/M/B/Z/MS 分别为 117/217/317/417/617/717/917；2026-07-19 日本官网快照。",
        sourceKey: "sailor-1219-jp",
        variantKind: "market_sku",
        productCode:
          "11-1219-117/217/317/417/617/717/917",
        market: "日本",
      },
      {
        key: "japan-black",
        name: "日本现行 Black",
        notes:
          "11-1219 Black：EF/F/MF/M/B/Z/MS 分别为 120/220/320/420/620/720/920；2026-07-19 日本官网快照。",
        sourceKey: "sailor-1219-jp",
        variantKind: "market_sku",
        productCode:
          "11-1219-120/220/320/420/620/720/920",
        market: "日本",
      },
      {
        key: "japan-maroon",
        name: "日本现行 Maroon",
        notes:
          "11-1219 Maroon：EF/F/MF/M/B/Z/MS 分别为 132/232/332/432/632/732/932；2026-07-19 日本官网快照。",
        sourceKey: "sailor-1219-jp",
        variantKind: "market_sku",
        productCode:
          "11-1219-132/232/332/432/632/732/932",
        market: "日本",
      },
    ],
    scopes: [
      {
        key: "1219-identity",
        scopeKey: "sailor-1219-canonical-identity",
        productionState: "current",
        editionScope: "11-1219 only; Profit Standard in Japan, 1911 S in English",
      },
      {
        key: "1219-japan-current",
        scopeKey: "sailor-1219-japan-current-2026-07-19",
        market: "日本",
        validFrom: "2026-07-19",
        productionState: "current",
        nibScope: "14K medium-size EF/F/MF/M/B/Z/MS",
        materialScope: "PMMA cap, barrel and grip; Gold IP metal parts",
        editionScope: "Ivory, Black and Maroon official product-page snapshot",
      },
      {
        key: "1521-sibling",
        scopeKey: "sailor-1521-historical-21k-sibling",
        productionState: "historical",
        nibScope: "21K medium-size nib",
        editionScope:
          "same 17 x 135 mm size class; sale ends after stock depletion; not a 1219 variant",
      },
      {
        key: "1029-sibling",
        scopeKey: "sailor-1029-rhodium-sibling-retailer-record",
        productionState: "historical",
        nibScope: "14K",
        editionScope:
          "silver/rhodium-trim 1911 Standard retailer record; not a 1219 variant",
      },
      {
        key: "large-siblings",
        scopeKey: "sailor-2021-2024-large-siblings",
        productionState: "historical",
        nibScope: "21K large nib",
        editionScope: "1911 L 11-2021/11-2024; not 11-1219",
      },
      {
        key: "progear-sibling",
        scopeKey: "sailor-professional-gear-sibling-boundary",
        productionState: "current",
        editionScope: "flat-top Professional Gear family; not 11-1219",
      },
      {
        key: "new-profit-siblings",
        scopeKey: "sailor-profit14-18-current-siblings-2025-2026",
        market: "日本",
        validFrom: "2025-12-13",
        productionState: "current",
        nibScope: "large 14K for 11-1214; large 18K for 11-2218",
        editionScope:
          "official Japanese names Profit 14 and Profit 18; no invented 1911 14/18 names",
      },
      {
        key: "1219-care",
        scopeKey: "sailor-cartridge-converter-care-current",
        productionState: "current",
        editionScope: "official cartridge/converter fountain-pen care",
      },
      {
        key: "1219-review-sample",
        scopeKey: "sailor-1911-standard-review-sample-2020",
        validFrom: "2020-02-10",
        productionState: "unknown",
        editionScope:
          "single Royal Amethyst review unit provided free by Goldspot; architecture context only",
      },
      {
        key: "1521-photo",
        scopeKey: "sailor-21k-zoom-photo-2014",
        validFrom: "2014-02-12",
        productionState: "historical",
        nibScope: "21K Zoom photographed sample",
        editionScope: "sibling comparison only; never 11-1219 primary media",
      },
    ],
    claims: [
      {
        key: "1219-regional-identity",
        predicate: "model_identity",
        objectText:
          "商品代码 11-1219 在日本官网名为 Profit Standard、英文官网名为 1911 S；本站按同一型号处理。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "sailor-1219-jp",
        locator: "matching 11-1219 codes and specifications on Japanese and English pages",
        evidence: [
          {
            key: "1219-jp-identity",
            sourceKey: "sailor-1219-jp",
            scopeKey: "1219-identity",
            locator: "Profit Standard title and all 11-1219 codes",
          },
          {
            key: "1219-en-identity",
            sourceKey: "sailor-1219-en",
            scopeKey: "1219-identity",
            locator: "1911 S title and matching 11-1219 codes",
          },
        ],
      },
      {
        key: "1219-current-spec",
        predicate: "current_japan_specification",
        objectText:
          "11-1219 使用 14K 中型尖、Sailor 墨囊／上墨器、PMMA 笔帽/笔杆/握位与 Gold IP，尺寸 φ17 × 135 mm、17.0 g。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "sailor-1219-jp",
        locator: "current product specification fields",
        evidence: [
          {
            key: "1219-spec-table",
            sourceKey: "sailor-1219-jp",
            scopeKey: "1219-japan-current",
            locator:
              "14K medium nib, dual filling, PMMA, Gold IP, 17 x 135 mm and 17.0 g fields",
          },
        ],
      },
      {
        key: "1219-current-lineup",
        predicate: "current_japan_lineup",
        objectText:
          "2026-07-19 日本官网列 Ivory、Black、Maroon 与 EF/F/MF/M/B/Z/MS；EF—B 为 ¥44,000，Z/MS 为 ¥46,200。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "sailor-1219-jp",
        locator: "price, colour and complete product-code sections",
        evidence: [
          {
            key: "1219-lineup-codes",
            sourceKey: "sailor-1219-jp",
            scopeKey: "1219-japan-current",
            locator: "Ivory, Black and Maroon EF/F/MF/M/B/Z/MS code lists",
          },
          {
            key: "1219-price-snapshot",
            sourceKey: "sailor-1219-jp",
            scopeKey: "1219-japan-current",
            locator: "JPY 44,000 standard widths and JPY 46,200 Zoom/Music",
          },
        ],
      },
      {
        key: "1219-1521-boundary",
        predicate: "adjacent_model_boundary",
        objectText:
          "11-1521 与 11-1219 同为 φ17 × 135 mm，但使用 21K 中型尖、重 17.2 g，且库存售完即结束销售；不是 11-1219 版本。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "sailor-1521-jp",
        locator: "11-1521 specification and sale-ending notice",
        evidence: [
          {
            key: "1521-official-boundary",
            sourceKey: "sailor-1521-jp",
            scopeKey: "1521-sibling",
            locator:
              "21K medium nib, 17 x 135 mm, 17.2 g and stock-depletion notice",
          },
        ],
      },
      {
        key: "1219-other-siblings",
        predicate: "family_identity_boundary",
        objectText:
          "银色饰件 11-1029、Large 21K 的 11-2021/11-2024，以及平顶 Professional Gear 均有独立商品代码，不能并入 11-1219。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: "sailor-2021-en",
        locator: "separate product-code and trim/family records",
        evidence: [
          {
            key: "1029-retailer-boundary",
            sourceKey: "sailor-1029-pensachi",
            scopeKey: "1029-sibling",
            locator: "11-1029 and rhodium/silver trim fields; retailer record",
          },
          {
            key: "2021-large-boundary",
            sourceKey: "sailor-2021-en",
            scopeKey: "large-siblings",
            locator: "11-2021 1911 L 21K identity",
          },
          {
            key: "2024-large-boundary",
            sourceKey: "sailor-2024-en",
            scopeKey: "large-siblings",
            locator: "11-2024 1911 L Silver Trim 21K identity",
          },
          {
            key: "pgs-separate-boundary",
            sourceKey: "sailor-pgs21",
            scopeKey: "progear-sibling",
            locator: "separate flat-top Professional Gear family and 11-2151 codes",
          },
          {
            key: "1219-independent-size-boundary",
            sourceKey: "sailor-penaddict-review",
            scopeKey: "1219-review-sample",
            locator:
              "Independent Royal Amethyst review separates the smaller 14K 1911 Standard from larger 21K lines; Goldspot review unit disclosed",
          },
        ],
      },
      {
        key: "1219-new-profit-boundary",
        predicate: "successor_family_boundary",
        objectText:
          "Profit 14（11-1214）与 Profit 18（11-2218）是 2025 上市的大型 14K／18K 新型号，不是 11-1219 版本，也不自行翻译成 1911 14／18。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "sailor-profit14-18-launch",
        locator: "official launch names, codes and large-nib descriptions",
        evidence: [
          {
            key: "profit14-launch-boundary",
            sourceKey: "sailor-profit14",
            scopeKey: "new-profit-siblings",
            locator: "official Profit 14 name, 11-1214 codes and large 14K nib",
          },
          {
            key: "profit18-launch-boundary",
            sourceKey: "sailor-profit18",
            scopeKey: "new-profit-siblings",
            locator: "official Profit 18 name, 11-2218 codes and large 18K nib",
          },
        ],
      },
      {
        key: "1219-care-guidance",
        predicate: "maintenance_guidance",
        objectText:
          "官方建议用清水冲洗墨囊／上墨器钢笔，并借上墨器反复吸排约五至六次；11-1219 不套用 Realo 活塞维护步骤。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "sailor-care",
        locator: "converter cleaning instructions",
        evidence: [
          {
            key: "1219-official-care",
            sourceKey: "sailor-care",
            scopeKey: "1219-care",
            locator: "draw and expel clean water 5-6 times with converter",
          },
        ],
      },
      {
        key: "1219-media-boundary",
        predicate: "media_identity_boundary",
        objectText:
          "主图是 AI 辅助、非产品实拍的站内编辑插画；Commons 21K Zoom 照片只作 11-1521／旧 21K 兄弟款对照。",
        factClass: "editorial",
        confidence: 1,
        sourceKey: "sailor-1219-site-original",
        locator: "site-original and Commons provenance records",
        evidence: [
          {
            key: "1219-editorial-not-photo",
            sourceKey: "sailor-1219-site-original",
            scopeKey: "1219-identity",
            locator: "AI-assisted, product-photo=false, logo=false metadata",
          },
          {
            key: "1521-photo-only",
            sourceKey: "sailor-1521-commons",
            scopeKey: "1521-photo",
            locator: "file title identifies 21K Zoom nib; CC BY 2.0 provenance",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: "ce2dcqixqSCx",
      values: {
        series_name: "Sailor Profit / 1911 — Standard 14K（11-1219）",
        nib: "14K 中型金尖；EF、F、MF、M、B、Z、MS",
        fill_system: "Sailor 墨囊／上墨器两用式",
        material: "笔帽、笔杆、握位为 PMMA；金属部件为 Gold IP",
        dimensions: "最大径 φ17 mm × 全长 135 mm（含笔夹）",
        weight: "17.0 g（日本官网目录值）",
        price_range:
          "日本官网 2026-07-19 快照：EF/F/MF/M/B 为 ¥44,000；Z/MS 为 ¥46,200",
        status:
          "日本官网当前商品页可见；Ivory、Black、Maroon 三色，均属于 11-1219",
      },
      evidence: [
        {
          key: "1219-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "sailor-1219-jp",
          scopeKey: "1219-identity",
          locator: "official Sailor product page for 11-1219",
        },
        {
          key: "1219-series",
          fieldKey: "series_name",
          sourceKey: "sailor-1219-jp",
          scopeKey: "1219-identity",
          locator: "Profit Standard title and Profit-series description",
        },
        {
          key: "1219-series-en",
          fieldKey: "series_name",
          sourceKey: "sailor-1219-en",
          scopeKey: "1219-identity",
          locator: "1911 S title with matching 11-1219 codes",
        },
        {
          key: "1219-nib",
          fieldKey: "nib",
          sourceKey: "sailor-1219-jp",
          scopeKey: "1219-japan-current",
          locator: "14K medium-size nib and EF/F/MF/M/B/Z/MS product codes",
        },
        {
          key: "1219-fill",
          fieldKey: "fill_system",
          sourceKey: "sailor-1219-jp",
          scopeKey: "1219-japan-current",
          locator: "dual converter/cartridge filling field",
        },
        {
          key: "1219-material",
          fieldKey: "material",
          sourceKey: "sailor-1219-jp",
          scopeKey: "1219-japan-current",
          locator: "PMMA cap, barrel and grip plus Gold IP metal parts",
        },
        {
          key: "1219-dimensions",
          fieldKey: "dimensions",
          sourceKey: "sailor-1219-jp",
          scopeKey: "1219-japan-current",
          locator: "maximum diameter 17 mm and length 135 mm including clip",
        },
        {
          key: "1219-weight",
          fieldKey: "weight",
          sourceKey: "sailor-1219-jp",
          scopeKey: "1219-japan-current",
          locator: "catalog weight 17.0 g",
        },
        {
          key: "1219-price",
          fieldKey: "price_range",
          sourceKey: "sailor-1219-jp",
          scopeKey: "1219-japan-current",
          locator: "JPY 44,000 regular widths and JPY 46,200 Zoom/Music",
        },
        {
          key: "1219-status",
          fieldKey: "status",
          sourceKey: "sailor-1219-jp",
          scopeKey: "1219-japan-current",
          locator: "live product page and three-colour code list retrieved 2026-07-19",
        },
      ],
    },
    media: [
      {
        key: "sailor-1219-editorial-primary",
        title: "1911 Standard 14K 语境编辑插画（AI 辅助，非产品实拍）",
        sourceKey: "sailor-1219-site-original",
        localPath:
          "/images/library/site-original/sailor/sailor-1911-standard-14k-editorial.jpg",
        author: "Fountain Pen Graph editorial with OpenAI image generation",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创风格化编辑插画，使用 OpenAI 图像生成辅助制作。非 Sailor 11-1219 产品实拍，不包含 Sailor 锚形商标或可验证笔尖刻字，不代表真实 Black 色泽、尺寸比例、饰件或生产批次；不能作为鉴定证据。",
        sourceUrl:
          "/images/library/site-original/sailor/sailor-1911-standard-14k-editorial.jpg",
        usageStatus: "primary",
      },
      {
        key: "sailor-1521-21k-zoom-gallery",
        title: "11-1521／旧 21K Zoom 同尺寸兄弟型号对照（非 14K 11-1219）",
        sourceKey: "sailor-1521-commons",
        localPath:
          "/images/library/wikimedia/sailor/sailor-1911-standard-21k-zoom.jpg",
        author: "Mehmet Pinarci",
        license: "cc-by-2.0",
        attributionText:
          "Sailor 1911 Standard 21K Zoom nib，摄影 Mehmet Pinarci，CC BY 2.0。本站保存 Commons 原始 3264×2448 文件，未缩放、未裁切、未调色。图片仅作 11-1521／旧 21K Zoom 同尺寸兄弟型号对照，不是 14K 11-1219，不能用于判断其刻字、花纹或尖号外观。",
        sourceUrl:
          "https://commons.wikimedia.org/wiki/File:Sailor_1911_Standard_21K_Zoom_nib.jpg",
        usageStatus: "gallery",
      },
    ],
    timeline: [
      {
        key: "1219-profit-lineage-1981",
        title: "Profit 圆头家族建立",
        eventType: "design_milestone",
        startDate: "1981",
        circa: false,
        description:
          "11-1219 属于 Profit／1911 家族；这不是 11-1219 本身首发年份。",
        sourceKey: "sailor-history-step",
      },
      {
        key: "1219-ip-change-2024",
        title: "11-1219 列入 Gold Ion Plating 规格变更",
        eventType: "design_milestone",
        startDate: "2024-08-01",
        circa: false,
        description:
          "官网说明过渡期可能混有新旧饰件；现行 11-1219 页面已写 Gold IP。",
        sourceKey: "sailor-plating-change",
      },
    ],
  },
];
