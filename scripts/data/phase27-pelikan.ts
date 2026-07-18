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
  "pelikan-official-history": liveSource({
    key: "pelikan-official-history",
    registryKey: "pelikan-official",
    registryName: "Pelikan official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-official",
    title: "Pelikan: Our History",
    url: "https://www.pelikan.com/int/brand/our-history.html",
    homepageUrl: "https://www.pelikan.com/",
    author: "Pelikan",
    summary:
      "Pelikan 官方年表：区分 1832 年颜料与墨水工厂和 1838 年传统创立日，并记录 1878 商标、1929 钢笔、1973 Vöhrum 生产迁移及 2023 年 Hamelin 收购。",
    locator:
      "timeline entries 1838 (text distinguishes 1832 factory), 1878, 1929, 1973 and 2023 Hamelin takeover",
  }),
  "pelikan-catalog-2025": liveSource({
    key: "pelikan-catalog-2025",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Pelikan Fine Writing Instruments Catalogue 2025",
    url: "https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf",
    homepageUrl: "https://www.pelikan-passion.com/",
    itemType: "catalog_pdf",
    author: "Pelikan",
    publishedAt: "2025",
    summary:
      "2025 官方目录：差动活塞原理、Souverän 尺寸阶梯，以及现行 M800 的 L 号、14.2 cm、13.1 mm、28.2 g、1.35 ml、18K/750 双色尖和 EF/F/M/B。",
    locator:
      "PDF pages 24-25 piston/Souverän history, 27 size comparison, 28 construction, 31/33/35/37 current M800 nib and finish listings",
  }),
  "pelikan-official-m800-black-green": liveSource({
    key: "pelikan-official-m800-black-green",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Souverän 800 Black-Green",
    url: "https://www.pelikan-passion.com/de/writing/premium/souveraen/souveraen-r-800-schwarz-gruen.html",
    homepageUrl: "https://www.pelikan-passion.com/",
    author: "Pelikan",
    summary:
      "现行黑绿 M800 官方页：差动活塞、18K/750 双色金尖与 EF/F/M/B、条纹 cellulose acetate、黑色树脂、14.1 cm 和 28.2 g。",
    locator:
      "product sections Die Details and Fakten & Zahlen: nib, piston, materials, Germany origin, capped length and weight",
  }),
  "pelikan-official-m805-black-silver": liveSource({
    key: "pelikan-official-m805-black-silver",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Souverän 805 Black-Silver",
    url: "https://www.pelikan-passion.com/de/writing/premium/souveraen/souveraen-r-805-schwarz-silber.html",
    homepageUrl: "https://www.pelikan-passion.com/",
    author: "Pelikan",
    summary:
      "标准 M805 黑银官方页：镀钯饰件、全镀铑 18K/750 金尖、EF/F/M/B、绿色墨窗与黑色高等级树脂，用于划清 M800/M805 身份。",
    locator:
      "product identity and Fakten & Zahlen sections: palladium-plated trim, fully rhodium-plated nib, ink window and resin",
  }),
  "pelikan-official-faq": liveSource({
    key: "pelikan-official-faq",
    registryKey: "pelikan-official",
    registryName: "Pelikan official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-official",
    title: "Pelikan FAQ",
    url: "https://www.pelikan.com/int/services/faq.html",
    homepageUrl: "https://www.pelikan.com/",
    author: "Pelikan",
    summary:
      "官方 FAQ 的 Fine writing instruments 段列 M800/M805 14.2 cm、13.1 mm、28.2 g，并说明活塞从瓶中吸墨与回排数滴的操作。",
    locator:
      "Fine writing instruments: Comparison of sizes and Which filling systems for fountain pens are offered today?",
  }),
  "pelikan-official-warranty": liveSource({
    key: "pelikan-official-warranty",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Pelikan Souverän and Classic Warranty Terms and Care",
    url: "https://www.pelikan-passion.com/images/assets/fwi_warranty_current.pdf",
    homepageUrl: "https://www.pelikan-passion.com/",
    itemType: "warranty_pdf",
    author: "Pelikan",
    summary:
      "现行质保册：Souverän/Classic 自购买日起三年材料与制造缺陷质保；正常磨损、不当使用及外因除外。长期停用以冷水反复吸排，不要求日常拆尖或拆活塞。",
    locator:
      "English Warranty Terms pages 6-7 and care section pages 28-29: three years, exclusions, proof of purchase, cold-water fill/empty cycles",
  }),
  "pelikan-collectibles-m800": liveSource({
    key: "pelikan-collectibles-m800",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pelikan-collectibles",
    title: "Pelikan M800 & M805 Souverän",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M800-Basis/index.html",
    homepageUrl: "https://www.pelikan-collectibles.com/",
    author: "Dominic Rothemel",
    summary:
      "收藏资料按版本列出 M800 1987 首发、14 ct/18 ct 过渡、旧款尺寸容量、M805 及 M815 特别版本；用于历史范围，不覆盖现行官网。",
    locator:
      "M800 (Old Style), M805 and M815 sections, including catalog 1990/91 nib transition and version tables",
  }),
  "pelikans-perch-m800-history": liveSource({
    key: "pelikans-perch-m800-history",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "The Pelikan M800: A Modern Day Titan",
    url: "https://thepelikansperch.com/2020/11/15/pelikan-m800-history-explored/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2020-11-15",
    summary:
      "基于历年目录和收藏资料的 M8xx 专业历史：1987 首发、14C 延续至约 1990、18C 过渡、M805 银色饰件及 M815 编号在不同特别版中的复用。",
    locator:
      "M8xx history, nib chronology, model expansion and summary sections; dates explicitly marked approximate where applicable",
  }),
  "pelikan-m800-commons": {
    key: "pelikan-m800-commons",
    registryKey: "wikimedia-commons",
    registryName: "Wikimedia Commons",
    sourceType: "wikimedia",
    tier: "primary",
    independenceGroup: "hige-hige-japan-pelikan-m800",
    title: "File:Pelikan M800.JPG",
    url: "https://commons.wikimedia.org/wiki/File:Pelikan_M800.JPG",
    homepageUrl: "https://commons.wikimedia.org/",
    itemType: "image",
    author: "Hige-hige-Japan",
    publishedAt: "2015-08-25",
    retrievedAt: RETRIEVED,
    summary:
      "Hige-hige-Japan 拍摄的绿色条纹 Pelikan Souverän M800 实物；CC BY-SA 4.0。站内保存 3072×2048 原图，不裁切、不缩放、不改色。",
    allowedUse: "store_full",
    license: "cc-by-sa-4.0",
    archiveUrl:
      "/images/library/wikimedia/pelikan/pelikan-m800-hige-hige-japan.jpg",
    archiveLocator:
      "project-public-asset:pelikan-m800-hige-hige-japan.jpg;source-file=Pelikan_M800.JPG;source-original=https://upload.wikimedia.org/wikipedia/commons/6/6b/Pelikan_M800.JPG;source-author=Hige-hige-Japan;photo-date=2015-08-25;upload-timestamp=2015-12-27T06:11:53Z;source-license=CC-BY-SA-4.0;dimensions=3072x2048;resize=false;crop=false;color-edit=false;sha1=9ebcc4d8afbc6f9855a27660f24cd88d278aae15;sha256=572cba1c9a3a25937a375fa2228da02426043bcfdb713761436409792632dc30;downloaded=2026-07-19",
  },
  "pelikan-brand-site-original": {
    key: "pelikan-brand-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Pelikan 墨水与活塞档案——本站原创编辑插画（AI 辅助制作）",
    url: "/images/library/warm-pen-atlas/pelikan-brand-cover.jpg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial with OpenAI image generation",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创编辑插画（AI 辅助制作），用于 Pelikan 品牌馆的墨水、条纹材料与活塞档案语境；非产品实拍，不代表具体型号、结构、尺寸、比例、配色或年代。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: "/images/library/warm-pen-atlas/pelikan-brand-cover.jpg",
    archiveLocator:
      "project-public-asset:pelikan-brand-cover.jpg;site-original=true;ai-assisted=true;generator=OpenAI-image-generation;product-photo=false;specific-model=false;mechanical-diagram=false;dimensions-or-proportions=false;resize=1800x1012;sha256=84e281f20c3b7d4d8e870088f6944c16f49ae3c5b8cbc31a0a2b8f4aa6c697af",
  },
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

export const phase27PelikanPacks: CuratedEntityPack[] = [
  {
    key: "phase27-pelikan-brand-v1",
    entityId: "VXUULuCOLOB1",
    expectedType: "brand",
    expectedSlug: "pelikan",
    canonicalName: "百利金 Pelikan",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/pelikan-brand-publishable-content-2026-07-19.md",
    storyTitle: "Pelikan：从颜料墨水工厂到 Souverän 活塞谱系",
    primarySourceKey: "pelikan-official-history",
    depthTier: "A",
    aliases: [
      {
        alias: "Pelikan",
        language: "en",
        sourceKey: "pelikan-official-history",
      },
      {
        alias: "百利金",
        language: "zh",
        sourceKey: "pelikan-official-history",
      },
    ],
    sources: [
      source("pelikan-official-history"),
      source("pelikan-catalog-2025"),
      source("pelikans-perch-m800-history"),
      source("pelikan-brand-site-original"),
    ],
    scopes: [
      {
        key: "factory-origin",
        scopeKey: "pelikan-factory-origin-1832",
        validFrom: "1832",
        productionState: "historical",
        editionScope: "Carl Hornemann color and ink factory; not the traditional founding date",
      },
      {
        key: "traditional-founding",
        scopeKey: "pelikan-traditional-founding-date-1838-04-28",
        validFrom: "1838-04-28",
        productionState: "historical",
        editionScope: "Pelikan traditional founding date; distinct from the 1832 factory origin",
      },
      {
        key: "trademark",
        scopeKey: "pelikan-pictorial-trademark-registration-1878",
        validFrom: "1878-11-27",
        productionState: "historical",
        editionScope: "pelican with four chicks trademark registration",
      },
      {
        key: "fountain-pen-origin",
        scopeKey: "pelikan-first-fountain-pen-1929",
        validFrom: "1929",
        productionState: "historical",
        editionScope: "first Pelikan fountain pen; not the launch of every later Souverän model",
      },
      {
        key: "voehrum-production",
        scopeKey: "pelikan-writing-instrument-production-voehrum-1973-present",
        validFrom: "1973",
        productionState: "current",
        editionScope: "writing-instrument production relocation, not a claim about every raw material",
      },
      {
        key: "hamelin-ownership",
        scopeKey: "pelikan-group-sale-to-hamelin-2023-12-13",
        validFrom: "2023-12-13",
        productionState: "current",
        editionScope: "current group ownership; does not rewrite historical producer identity",
      },
      {
        key: "brand-artwork",
        scopeKey: "pelikan-brand-editorial-artwork-2026-07-19",
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope:
          "AI-assisted editorial illustration; not a product photograph, model reference or mechanical diagram",
      },
      {
        key: "m8xx-identity-boundary",
        scopeKey: "pelikan-m8xx-model-identity-boundary-2026-07-19",
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope:
          "editorial identity boundary: M805 is a distinct silver-trim line and M815 is a reused special-edition number, not a permanent grade above M800",
      },
    ],
    claims: [
      {
        key: "pelikan-two-origin-dates",
        predicate: "brand_origin_dates",
        objectText:
          "Carl Hornemann 于 1832 年建立颜料与墨水工厂；Pelikan 传统则把 1838 年 4 月 28 日作为创立日。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-official-history",
        locator: "official 1838 timeline entry explicitly distinguishes the 1832 factory",
        evidence: [
          {
            key: "official-factory-origin",
            sourceKey: "pelikan-official-history",
            scopeKey: "factory-origin",
            locator: "1838 entry text: factory founded in 1832",
          },
          {
            key: "official-traditional-founding",
            sourceKey: "pelikan-official-history",
            scopeKey: "traditional-founding",
            locator: "1838 entry text: tradition considers 28 April 1838 the founding date",
          },
        ],
      },
      {
        key: "pelikan-trademark-1878",
        predicate: "trademark_registered",
        objectText: "带四只幼鸟的鹈鹕图案于 1878 年 11 月 27 日完成商标注册。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-official-history",
        locator: "official 1878 trademark registration entry",
        evidence: [
          {
            key: "official-trademark-registration",
            sourceKey: "pelikan-official-history",
            scopeKey: "trademark",
            locator: "27 November 1878 and pelican with four chicks",
          },
        ],
      },
      {
        key: "pelikan-first-fountain-pen-1929",
        predicate: "first_fountain_pen",
        objectText: "Pelikan 官方把 1929 年记为其钢笔诞生年。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-official-history",
        locator: "official 1929 The First Fountain Pen entry",
        evidence: [
          {
            key: "official-first-fountain-pen",
            sourceKey: "pelikan-official-history",
            scopeKey: "fountain-pen-origin",
            locator: "1929 timeline entry identifies the year of birth of the Pelikan fountain pen",
          },
        ],
      },
      {
        key: "pelikan-production-relocation-1973",
        predicate: "production_relocated",
        objectText: "1973 年书写工具生产迁往 Peine/Vöhrum。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-official-history",
        locator: "official 1973 New Factory Relocation entry",
        evidence: [
          {
            key: "official-voehrum-relocation",
            sourceKey: "pelikan-official-history",
            scopeKey: "voehrum-production",
            locator: "writing instrument production moved to Peine/Voehrum in 1973",
          },
        ],
      },
      {
        key: "pelikan-hamelin-acquisition-2023",
        predicate: "acquired_by",
        objectText: "Pelikan Group GmbH 出售给 Hamelin 的交易于 2023 年 12 月 13 日完成。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-official-history",
        locator: "official 2023 Takeover of Pelikan by Hamelin entry",
        evidence: [
          {
            key: "official-hamelin-takeover",
            sourceKey: "pelikan-official-history",
            scopeKey: "hamelin-ownership",
            locator: "sale successfully completed on 13 December 2023",
          },
        ],
      },
      {
        key: "pelikan-m8xx-reading-boundary",
        predicate: "model_family_boundary",
        objectText:
          "M800、M805 与 M815 共享 M8xx 语境但不是固定高低级：M805 是银色饰件路线，M815 编号曾用于不同特别版本。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: "pelikans-perch-m800-history",
        locator: "M8xx model expansion and related lines chronology",
        evidence: [
          {
            key: "perch-m8xx-family-boundary",
            sourceKey: "pelikans-perch-m800-history",
            scopeKey: "m8xx-identity-boundary",
            locator: "M805 trim distinction and M815 1995/2018 related-line entries",
          },
        ],
      },
    ],
    media: [
      {
        key: "pelikan-brand-editorial-primary",
        title: "Pelikan 墨水与活塞档案编辑插画",
        sourceKey: "pelikan-brand-site-original",
        localPath: "/images/library/warm-pen-atlas/pelikan-brand-cover.jpg",
        author: "Fountain Pen Graph editorial with OpenAI image generation",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创编辑插画，使用 OpenAI 图像生成辅助制作。非 Pelikan 产品实拍、非机械图、非比例图，不代表任何具体型号、结构、尺寸、配色、年代或商标；仅用于品牌馆的墨水、条纹材料与活塞档案语境。",
        sourceUrl: "/images/library/warm-pen-atlas/pelikan-brand-cover.jpg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "pelikan-factory-1832",
        title: "Carl Hornemann 建立颜料与墨水工厂",
        eventType: "design_milestone",
        startDate: "1832",
        circa: false,
        description: "这是工厂经营起点，与 1838 年传统创立日分开记录。",
        sourceKey: "pelikan-official-history",
      },
      {
        key: "pelikan-tradition-1838",
        title: "Pelikan 传统创立日",
        eventType: "brand_founded",
        startDate: "1838-04-28",
        circa: false,
        description: "品牌传统采用的创立日期，不覆盖 1832 年工厂起点。",
        sourceKey: "pelikan-official-history",
      },
      {
        key: "pelikan-trademark-1878",
        title: "鹈鹕图形商标注册",
        eventType: "design_milestone",
        startDate: "1878-11-27",
        circa: false,
        description: "带四只幼鸟的鹈鹕图形完成注册。",
        sourceKey: "pelikan-official-history",
      },
      {
        key: "pelikan-fountain-pen-1929",
        title: "Pelikan 首款钢笔",
        eventType: "model_released",
        startDate: "1929",
        circa: false,
        description: "官方年表把 1929 年记为 Pelikan 钢笔诞生年。",
        sourceKey: "pelikan-official-history",
      },
      {
        key: "pelikan-voehrum-1973",
        title: "书写工具生产迁往 Peine/Vöhrum",
        eventType: "design_milestone",
        startDate: "1973",
        circa: false,
        description: "生产迁移不等于总部或每一种原料同时迁移。",
        sourceKey: "pelikan-official-history",
      },
      {
        key: "pelikan-hamelin-2023",
        title: "Hamelin 完成收购 Pelikan",
        eventType: "acquisition",
        startDate: "2023-12-13",
        circa: false,
        description: "Pelikan Group GmbH 出售给 Hamelin 的交易完成。",
        sourceKey: "pelikan-official-history",
      },
    ],
  },
  {
    key: "phase27-pelikan-souveran-m800-v1",
    entityId: "1UzrQA9Rrmqs",
    expectedType: "pen",
    expectedSlug: "pelikan-souveran-m800",
    canonicalName: "百利金 Pelikan Souverän M800",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/pelikan-souveran-m800-publishable-content-2026-07-19.md",
    storyTitle: "Pelikan Souverän M800：尺寸、笔尖代际与 M8xx 身份边界",
    primarySourceKey: "pelikan-catalog-2025",
    depthTier: "A",
    aliases: [
      {
        alias: "Pelikan Souverän M800",
        language: "de",
        sourceKey: "pelikan-official-m800-black-green",
      },
      {
        alias: "Pelikan Souveran M800",
        language: "en",
        sourceKey: "pelikan-catalog-2025",
      },
      {
        alias: "Pelikan M800",
        language: "en",
        sourceKey: "pelikan-catalog-2025",
      },
      {
        alias: "百利金 M800",
        language: "zh",
        sourceKey: "pelikan-catalog-2025",
      },
      {
        alias: "百利金 Pelikan M800",
        language: "zh",
        sourceKey: "pelikan-catalog-2025",
      },
    ],
    sources: [
      source("pelikan-catalog-2025"),
      source("pelikan-official-m800-black-green"),
      source("pelikan-official-m805-black-silver"),
      source("pelikan-official-faq"),
      source("pelikan-official-warranty"),
      source("pelikan-collectibles-m800"),
      source("pelikans-perch-m800-history"),
      source("pelikan-m800-commons"),
    ],
    variants: [
      {
        key: "nib-ef-current",
        name: "EF 18K/750 双色金尖（现行）",
        notes: "2025 官方标准目录尖号之一；实际线宽受纸墨和个体调校影响。",
        sourceKey: "pelikan-catalog-2025",
        variantKind: "nib",
      },
      {
        key: "nib-f-current",
        name: "F 18K/750 双色金尖（现行）",
        notes: "2025 官方标准目录尖号之一，不是固定毫米线宽承诺。",
        sourceKey: "pelikan-catalog-2025",
        variantKind: "nib",
      },
      {
        key: "nib-m-current",
        name: "M 18K/750 双色金尖（现行）",
        notes: "2025 官方标准目录尖号之一，不能从字母直接预测所有纸墨组合。",
        sourceKey: "pelikan-catalog-2025",
        variantKind: "nib",
      },
      {
        key: "nib-b-current",
        name: "B 18K/750 双色金尖（现行）",
        notes: "2025 官方标准目录尖号之一；历史宽尖范围另按年代核验。",
        sourceKey: "pelikan-catalog-2025",
        variantKind: "nib",
      },
      {
        key: "nib-14c-historical",
        name: "14C/585 双色金尖（早期与个别特别版本）",
        releaseYear: "1987",
        notes:
          "首发与早期目录可见，不是仅 1987 年；约 1990 年转向 18C 后仍有个别例外。",
        sourceKey: "pelikans-perch-m800-history",
        variantKind: "nib",
      },
      {
        key: "finish-black-green-current",
        name: "Black-Green（2025 常规目录）",
        notes:
          "绿色条纹 cellulose acetate 饰带配黑色高等级树脂与金色饰件；不把材料外推给纯黑款。",
        sourceKey: "pelikan-official-m800-black-green",
        variantKind: "color",
      },
      {
        key: "finish-black-current",
        name: "Black（2025 常规目录）",
        notes:
          "纯黑标准款按高等级树脂和墨窗语境记录，不标成条纹 cellulose acetate。",
        sourceKey: "pelikan-catalog-2025",
        variantKind: "color",
      },
    ],
    scopes: [
      {
        key: "current-catalog",
        scopeKey: "pelikan-m800-current-catalog-2025",
        validFrom: "2025",
        productionState: "current",
        nibScope: "18K/750 bi-color gold nib; EF, F, M, B",
        materialScope:
          "finish-specific: striped cellulose acetate only for striped variants; high-grade resin for black components",
        editionScope: "standard M800; excludes M805, M815 and other M8xx special identities",
      },
      {
        key: "current-black-green",
        scopeKey: "pelikan-m800-black-green-current-2026-07-19",
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: "18K/750 bi-color gold nib with rhodium trim; EF, F, M, B",
        materialScope: "striped cellulose acetate barrel sleeve with black high-grade resin parts",
        editionScope: "current Black-Green product page only",
      },
      {
        key: "historical-old-style",
        scopeKey: "pelikan-m800-old-style-1987-1997",
        validFrom: "1987",
        validTo: "1997",
        productionState: "historical",
        nibScope: "14 ct and 18 ct gold nibs across the production period",
        editionScope: "old-style production; individual examples require cap/nib/finish dating",
      },
      {
        key: "nib-transition",
        scopeKey: "pelikan-m800-nib-transition-1987-1991",
        validFrom: "1987",
        validTo: "1991",
        productionState: "historical",
        nibScope: "14C/585 at launch and early catalogs; 18C/750 appears from catalog 1990/91",
        editionScope: "transition range with documented later exceptions",
      },
      {
        key: "m805-boundary",
        scopeKey: "pelikan-m805-standard-identity-boundary-2026-07-19",
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: "fully rhodium-plated 18K/750 gold nib; EF, F, M, B",
        materialScope: "palladium-plated trim and black high-grade resin for current Black-Silver",
        editionScope: "related M8xx platform identity, explicitly not an M800 color variant",
      },
      {
        key: "m815-boundary",
        scopeKey: "pelikan-m815-reused-special-number-1995-2025",
        validFrom: "1995",
        validTo: "2025",
        productionState: "historical",
        editionScope:
          "number reused for distinct special versions including 1995 Wall Street, 2018 Metal Striped and 2025 Blue Striped",
      },
      {
        key: "warranty-care",
        scopeKey: "pelikan-souveran-warranty-and-care-current-2026-07-19",
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope:
          "current Souverän/Classic manufacturer warranty and standard care guidance; local statutory rights remain separate",
      },
      {
        key: "photo-sample",
        scopeKey: "pelikan-m800-green-striped-photo-sample-2015-08-25",
        validFrom: "2015-08-25",
        productionState: "historical",
        materialScope: "photographed green-striped M800 sample",
        editionScope: "one photographed pen; not evidence for every M800 finish, year or nib",
      },
    ],
    claims: [
      {
        key: "m800-release-1987",
        predicate: "release_year",
        objectText: "Pelikan M800 于 1987 年推出。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-collectibles-m800",
        locator: "M800 (Old Style) introduction and production table",
        evidence: [
          {
            key: "collectibles-release-1987",
            sourceKey: "pelikan-collectibles-m800",
            scopeKey: "historical-old-style",
            locator: "In 1987 the M800 model was introduced",
          },
          {
            key: "perch-release-1987",
            sourceKey: "pelikans-perch-m800-history",
            scopeKey: "historical-old-style",
            locator: "M8xx Summary: Release Date 1987",
          },
        ],
      },
      {
        key: "m800-current-dimensions-capacity",
        predicate: "current_dimensions_weight_capacity",
        objectText:
          "2025 目录值为闭帽 14.2 cm、直径 13.1 mm、28.2 g、约 1.35 ml、L；现行黑绿产品页的闭帽值为 14.1 cm，正文采用约 14.1–14.2 cm。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-catalog-2025",
        locator: "catalog page 27 size comparison and current Black-Green product facts",
        evidence: [
          {
            key: "catalog-current-size-capacity",
            sourceKey: "pelikan-catalog-2025",
            scopeKey: "current-catalog",
            locator: "page 27: M800 14.2 cm, 13.1 mm, 28.2 g, 1.35 ml, L",
          },
          {
            key: "product-current-capped-length",
            sourceKey: "pelikan-official-m800-black-green",
            scopeKey: "current-black-green",
            locator: "Fakten & Zahlen: 14.1 cm closed and 28.2 g",
          },
        ],
      },
      {
        key: "m800-current-nib-and-filler",
        predicate: "current_nib_and_filling_system",
        objectText:
          "现行标准 M800 使用 18K/750 双色金尖、EF/F/M/B 和差动活塞；官方目录容量约 1.35 ml。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-catalog-2025",
        locator: "catalog current M800 listing and official product facts",
        evidence: [
          {
            key: "catalog-current-nib",
            sourceKey: "pelikan-catalog-2025",
            scopeKey: "current-catalog",
            locator: "pages 31/33/35/37: 18K/750 bi-color EF/F/M/B",
          },
          {
            key: "official-current-differential-piston",
            sourceKey: "pelikan-official-m800-black-green",
            scopeKey: "current-black-green",
            locator: "Füllfederhalter mit Differentialkolbenmechanik",
          },
        ],
      },
      {
        key: "m800-historical-nib-transition",
        predicate: "historical_nib_transition",
        objectText:
          "14C/585 不只存在于 1987 年首发；早期目录延续至约 1990 年，1990/91 目录开始出现 18C/750，之后仍有个别 14C 例外。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "pelikan-collectibles-m800",
        locator: "old-style nib table and catalog transition",
        evidence: [
          {
            key: "collectibles-14c-18c-transition",
            sourceKey: "pelikan-collectibles-m800",
            scopeKey: "nib-transition",
            locator: "14 carat at introduction; 18 carat from catalog 1990/91",
          },
          {
            key: "perch-14c-not-first-year-only",
            sourceKey: "pelikans-perch-m800-history",
            scopeKey: "nib-transition",
            locator:
              "14C listed in 87/88, 88 and 89/90 catalogs; approximately 1990 transition and later exception",
          },
        ],
      },
      {
        key: "m800-material-boundary",
        predicate: "material_by_finish",
        objectText:
          "黑绿等条纹款的条纹饰带为 cellulose acetate，黑色部件为高等级树脂；不能把条纹材料外推到纯黑 M800。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-official-m800-black-green",
        locator: "current Black-Green material facts and finish-specific catalog wording",
        evidence: [
          {
            key: "official-black-green-materials",
            sourceKey: "pelikan-official-m800-black-green",
            scopeKey: "current-black-green",
            locator: "striped barrel cellulose acetate; black parts high-grade resin",
          },
          {
            key: "catalog-finish-specific-material",
            sourceKey: "pelikan-catalog-2025",
            scopeKey: "current-catalog",
            locator: "page 28 distinguishes high-grade resin casing and individual striped material",
          },
        ],
      },
      {
        key: "m805-related-not-variant",
        predicate: "related_model_boundary",
        objectText:
          "标准 M805 是同尺寸平台的独立银色路线，使用镀钯饰件与全镀铑 18K/750 金尖，不是 M800 的普通配色名。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-official-m805-black-silver",
        locator: "official M805 Black-Silver identity and finish facts",
        evidence: [
          {
            key: "official-m805-identity",
            sourceKey: "pelikan-official-m805-black-silver",
            scopeKey: "m805-boundary",
            locator: "Souverän 805 Black-Silver, palladium trim and fully rhodium-plated nib",
          },
          {
            key: "perch-m805-line-history",
            sourceKey: "pelikans-perch-m800-history",
            scopeKey: "m805-boundary",
            locator: "M805 line from 2002 and gold trim swapped for palladium-plated silver appearance",
          },
        ],
      },
      {
        key: "m815-reused-special-number",
        predicate: "related_model_number_boundary",
        objectText:
          "M815 是在不同特别版本中复用的编号，不是固定高阶 M805，也不并入 canonical M800。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "pelikans-perch-m800-history",
        locator: "related-lines summary and M815 Metal Striped discussion",
        evidence: [
          {
            key: "perch-m815-number-reuse",
            sourceKey: "pelikans-perch-m800-history",
            scopeKey: "m815-boundary",
            locator: "M815 Wall Street 1995 and Metal Striped 2018",
          },
          {
            key: "collectibles-m815-specials",
            sourceKey: "pelikan-collectibles-m800",
            scopeKey: "m815-boundary",
            locator: "M815 Black Striped 2018 and Blue Striped 2025 special-edition entries",
          },
        ],
      },
      {
        key: "m800-standard-care",
        predicate: "standard_cleaning",
        objectText:
          "长期停用时排空墨水，以冷水反复吸入和排出；官方日常流程不要求拆笔尖单元或活塞。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-official-warranty",
        locator: "care section: cold water only and repeated fill/empty cycles",
        evidence: [
          {
            key: "official-cold-water-cycles",
            sourceKey: "pelikan-official-warranty",
            scopeKey: "warranty-care",
            locator:
              "empty reservoir and fill/empty several times with cold water after several weeks of non-use",
          },
        ],
      },
      {
        key: "m800-current-warranty",
        predicate: "manufacturer_warranty",
        objectText:
          "当前 Souverän 制造商质保为购买日起三年，覆盖材料与制造缺陷；正常磨损、不当使用、跌落、化学品和极端温度除外。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "pelikan-official-warranty",
        locator: "English Warranty Terms clauses 1, 3 and 4",
        evidence: [
          {
            key: "official-three-year-warranty",
            sourceKey: "pelikan-official-warranty",
            scopeKey: "warranty-care",
            locator: "three years from purchase; exclusions and proof-of-purchase claim process",
          },
        ],
      },
      {
        key: "m800-photo-sample-boundary",
        predicate: "primary_media_identity",
        objectText:
          "主图是 2015 年拍摄的一支绿色条纹 M800 样本，不代表纯黑款、全部年代、全部笔尖或整个 M8xx 平台。",
        factClass: "editorial",
        confidence: 0.99,
        sourceKey: "pelikan-m800-commons",
        locator: "Commons file description, author, date and license",
        evidence: [
          {
            key: "commons-photo-identity",
            sourceKey: "pelikan-m800-commons",
            scopeKey: "photo-sample",
            locator: "File:Pelikan M800.JPG; Japanese description identifies Souverän M800",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: "VXUULuCOLOB1",
      values: {
        series_name: "Souverän 800（canonical M800；不含 M805／M815）",
        release_year: "1987",
        origin_country: "德国（现行标准款制造与组装）",
        nib: "现行 18K/750 双色金尖、镀铑装饰；EF、F、M、B；早期 14C/585 不仅见于 1987",
        fill_system: "内置差动活塞；官方目录容量约 1.35 ml",
        material:
          "条纹款为 cellulose acetate 饰带配黑色高等级树脂；纯黑款不外推条纹材料",
        dimensions: "闭帽约 14.1–14.2 cm；直径约 13.1 mm；L",
        weight: "约 28.2 g（2025 官方目录／现行产品页）",
        status: "现行标准 M800；2025 目录，资料检索于 2026-07-19",
      },
      evidence: [
        {
          key: "brand-official-m800",
          fieldKey: "brand_entity_id",
          sourceKey: "pelikan-official-m800-black-green",
          scopeKey: "current-black-green",
          locator: "Pelikan official Souverän 800 Black-Green product identity.",
        },
        {
          key: "series-catalog-2025",
          fieldKey: "series_name",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "current-catalog",
          locator: "Catalog pages 27-37 identify Souverän M800 as a distinct model.",
        },
        {
          key: "release-collectibles-1987",
          fieldKey: "release_year",
          sourceKey: "pelikan-collectibles-m800",
          scopeKey: "historical-old-style",
          locator: "M800 introduced in 1987; old-style production 1987-1997.",
        },
        {
          key: "origin-official-current",
          fieldKey: "origin_country",
          sourceKey: "pelikan-official-m800-black-green",
          scopeKey: "current-black-green",
          locator: "Current product is made and assembled in Germany.",
        },
        {
          key: "nib-catalog-current",
          fieldKey: "nib",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "current-catalog",
          locator: "Current standard M800 18K/750 bi-color EF/F/M/B listings.",
        },
        {
          key: "nib-history-collectibles",
          fieldKey: "nib",
          sourceKey: "pelikan-collectibles-m800",
          scopeKey: "nib-transition",
          locator: "Old-style 14 ct and 18 ct range; 18 ct from catalog 1990/91.",
        },
        {
          key: "fill-official-current",
          fieldKey: "fill_system",
          sourceKey: "pelikan-official-m800-black-green",
          scopeKey: "current-black-green",
          locator: "Official Differentialkolbenmechanik product fact.",
        },
        {
          key: "fill-capacity-catalog",
          fieldKey: "fill_system",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "current-catalog",
          locator: "Catalog page 27 lists 1.35 ml capacity.",
        },
        {
          key: "material-official-black-green",
          fieldKey: "material",
          sourceKey: "pelikan-official-m800-black-green",
          scopeKey: "current-black-green",
          locator: "Striped cellulose acetate barrel and black high-grade resin parts.",
        },
        {
          key: "dimensions-catalog-2025",
          fieldKey: "dimensions",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "current-catalog",
          locator: "Catalog page 27: 14.2 cm closed, 13.1 mm diameter and L.",
        },
        {
          key: "dimensions-product-current",
          fieldKey: "dimensions",
          sourceKey: "pelikan-official-m800-black-green",
          scopeKey: "current-black-green",
          locator: "Current Black-Green product page: 14.1 cm capped.",
        },
        {
          key: "weight-catalog-2025",
          fieldKey: "weight",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "current-catalog",
          locator: "Catalog page 27: 28.2 g.",
        },
        {
          key: "weight-product-current",
          fieldKey: "weight",
          sourceKey: "pelikan-official-m800-black-green",
          scopeKey: "current-black-green",
          locator: "Current Black-Green product page: 28.2 g.",
        },
        {
          key: "status-catalog-current",
          fieldKey: "status",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "current-catalog",
          locator: "M800 appears in the 2025 standard Fine Writing catalogue.",
        },
      ],
    },
    conflicts: [
      {
        key: "m800-official-capped-length-rounding",
        fieldKey: "dimensions",
        scopeKey: "current-catalog",
        conflictKind: "field",
        status: "resolved",
        resolutionNote:
          "2025 官方目录与 FAQ 使用 14.2 cm，现行黑绿产品页使用 14.1 cm；规范字段保留约 14.1–14.2 cm，不把 1 mm 差异误判成不同型号。",
        members: [
          {
            citationKey: "dimensions-catalog-2025",
            assertedValue: "14.2 cm capped",
          },
          {
            citationKey: "dimensions-product-current",
            assertedValue: "14.1 cm capped",
          },
        ],
      },
    ],
    media: [
      {
        key: "pelikan-m800-commons-primary",
        title: "绿色条纹 Pelikan Souverän M800 实物",
        sourceKey: "pelikan-m800-commons",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/6/6b/Pelikan_M800.JPG",
        localPath:
          "/images/library/wikimedia/pelikan/pelikan-m800-hige-hige-japan.jpg",
        author: "Hige-hige-Japan",
        license: "cc-by-sa-4.0",
        attributionText:
          "Hige-hige-Japan / Wikimedia Commons，CC BY-SA 4.0。2015-08-25 拍摄的绿色条纹 Pelikan Souverän M800 实物；本站保存 3072×2048 原图，未裁切、未缩放、未改色。只代表这一支样本，不代表纯黑款、全部年代、全部笔尖或整个 M8xx 平台。",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Pelikan_M800.JPG",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "m800-release-1987",
        title: "Pelikan M800 推出",
        eventType: "model_released",
        startDate: "1987",
        circa: false,
        description: "首发配 14C/585 双色金尖；14C 并不只存在于这一年。",
        sourceKey: "pelikan-collectibles-m800",
      },
      {
        key: "m800-18c-catalog-1990",
        title: "1990/91 目录开始列 18C/750 双色尖",
        eventType: "design_milestone",
        startDate: "1990",
        circa: true,
        description: "笔尖转换存在库存与特别版本例外，不作为单支笔的唯一断年证据。",
        sourceKey: "pelikan-collectibles-m800",
      },
      {
        key: "m805-line-2002",
        title: "M805 银色饰件路线出现",
        eventType: "design_milestone",
        startDate: "2002",
        circa: false,
        description: "同尺寸平台的独立型号，不是 M800 普通配色。",
        sourceKey: "pelikans-perch-m800-history",
      },
      {
        key: "m815-metal-striped-2018",
        title: "M815 Metal Striped 特别版",
        eventType: "design_milestone",
        startDate: "2018",
        circa: false,
        description: "M815 编号也见于更早特别版本，不能固定解释为高阶 M805。",
        sourceKey: "pelikans-perch-m800-history",
      },
    ],
  },
];
