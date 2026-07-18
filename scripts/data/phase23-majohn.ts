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
  "majohn-justia-trademark": liveSource({
    key: "majohn-justia-trademark",
    registryKey: "justia-trademarks",
    registryName: "Justia Trademarks",
    sourceType: "blog",
    tier: "contemporary_archive",
    independenceGroup: "justia-majohn-79312903",
    title: "MAJOHN Trademark of Shanghai Shanyin Trading Co., Ltd.",
    url: "https://trademarks.justia.com/793/12/majohn-79312903.html",
    homepageUrl: "https://trademarks.justia.com/",
    author: "Justia Trademarks",
    summary:
      "MAJOHN 商标记录镜像：申请主体、2021-04-02 申请日期与 fountain pens 商品范围；不能替代完整公司史。",
    locator:
      "record header and Goods and Services section for serial 79312903; database mirror, not the applicant's official brand page",
  }),
  "majohn-wtr-transition": liveSource({
    key: "majohn-wtr-transition",
    registryKey: "world-trademark-review",
    registryName: "World Trademark Review",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "world-trademark-review",
    title:
      "2021 INTA Annual Meeting capsule: fountain pen trademark drama",
    url: "https://www.worldtrademarkreview.com/article/2021-inta-annual-meeting-capsule-keynotes-fountain-pen-trademark-drama-disney-expand-asia-news-digest",
    homepageUrl: "https://www.worldtrademarkreview.com/",
    author: "World Trademark Review",
    publishedAt: "2021",
    summary:
      "行业报道记录 Moonman 在海外商标与平台事件后转用 Majohn 名称；只用于品牌名称延续关系。",
    locator:
      "fountain-pen trademark drama section describing the Moonman-to-Majohn name change",
  }),
  "majohn-fpn-a1-launch": liveSource({
    key: "majohn-fpn-a1-launch",
    registryKey: "fountain-pen-network",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "contemporary_archive",
    independenceGroup: "fpn-majohn-a1-launch-thread",
    title: "Majohn A1 — A Capless Clone",
    url: "https://www.fountainpennetwork.com/forum/topic/363576-majohn-a1-a-capless-clone/",
    homepageUrl: "https://www.fountainpennetwork.com/",
    author: "Fountain Pen Network participants",
    publishedAt: "2021-11-17",
    summary:
      "A1 首发窗口同期讨论：2021 年 11 月零售、有夹／无夹、早期 EF，以及 Majohn 销售名与 Moon Man 笔身标记并存。",
    locator:
      "thread pages 2-3; posts dated 2021-11-25 through 2021-12-08; contemporaneous community record, not a manufacturer announcement",
  }),
  "majohn-lumafield-ct": liveSource({
    key: "majohn-lumafield-ct",
    registryKey: "lumafield-first-article",
    registryName: "Lumafield First Article",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "lumafield-industrial-ct",
    title: "Pen Comparison Using Industrial CT",
    url: "https://www.lumafield.com/first-article/posts/pen-comparison-using-industrial-ct",
    homepageUrl: "https://www.lumafield.com/first-article",
    author: "Lumafield",
    summary:
      "工业 CT 对受测 A1 样本的伸缩笔尖总成、弹簧与前端遮门进行结构观察；不证明全批次气密表现。",
    locator:
      "Majohn A1 scan and mechanism discussion; tested sample only",
  }),
  "majohn-everything-calligraphy-a1": liveSource({
    key: "majohn-everything-calligraphy-a1",
    registryKey: "everything-calligraphy",
    registryName: "Everything Calligraphy",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "everything-calligraphy",
    title: "Moonman / Majohn A1 Press Fountain Pen Retractable",
    url: "https://www.everythingcalligraphy.com/products/moonman-majohn-a1-press-fountain-pen-retractable",
    homepageUrl: "https://www.everythingcalligraphy.com/",
    author: "Everything Calligraphy",
    summary:
      "现售 A1 的约 138 mm、13 mm、30 g、金属笔身、EF／F 及带夹／无夹组合零售规格。",
    locator:
      "product description, specifications and selectable clip/nib options; retailer data, not a manufacturer specification",
  }),
  "majohn-makoba-a1": liveSource({
    key: "majohn-makoba-a1",
    registryKey: "makoba",
    registryName: "Makoba",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "makoba",
    title: "Majohn Moonman A1 Press Fountain Pen — Matte Black",
    url: "https://makoba.com/products/majohn-moonman-a1-press-fountain-pen-matte-black",
    homepageUrl: "https://makoba.com/",
    author: "Makoba",
    summary:
      "磨砂黑无夹 SKU 的黄铜、钢尖、EF／F、墨囊／上墨器与中国产地零售资料；材料不外推到全系列。",
    locator:
      "matte-black clipless SKU specification table; SKU-limited retailer evidence",
  }),
  "majohn-sketchywolf-a1": liveSource({
    key: "majohn-sketchywolf-a1",
    registryKey: "sketchywolf",
    registryName: "Sketchywolf",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "sketchywolf",
    title: "Majohn / Moonman A1 Fine Fountain Pen Review",
    url: "https://sketchywolf.wordpress.com/2022/09/10/majohn-moonman-a1-fine-fountain-pen-review/",
    homepageUrl: "https://sketchywolf.wordpress.com/",
    author: "Sketchywolf",
    publishedAt: "2022-09-10",
    summary:
      "单支 A1 的缩回／伸出长度、含墨重量、钢尖、配件与使用体验；所有量测只代表该样本。",
    locator:
      "review measurement and filling sections; single reviewed sample",
  }),
  "majohn-lethbridge-a1": liveSource({
    key: "majohn-lethbridge-a1",
    registryKey: "lethbridge-paper",
    registryName: "Lethbridge Paper",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "lethbridge-paper",
    title: "Majohn A1 Fountain Pen Review",
    url: "https://lethbridgepaper.co.uk/2023/04/15/majohn-a1-fountain-pen-review/",
    homepageUrl: "https://lethbridgepaper.co.uk/",
    author: "Em / Lethbridge Paper",
    publishedAt: "2023-04-15",
    summary:
      "磨砂黑有夹样本的握持、约 33 g 含墨重量、墨囊／上墨器附件与拆装风险记录。",
    locator:
      "sample measurements, package contents, grip and reassembly notes",
  }),
  "majohn-penchantink-clicky": liveSource({
    key: "majohn-penchantink-clicky",
    registryKey: "penchantink",
    registryName: "Penchantink",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "penchantink",
    title: "Clicky Convenience — Capless Pens",
    url: "https://penchantink.co.uk/clicky-convenience-capless-pens/",
    homepageUrl: "https://penchantink.co.uk/",
    author: "Penchantink",
    summary:
      "A1 与 Pilot Capless／Vanishing Point 配件互换及静置起笔的第三方实测；不是任何制造商的兼容承诺。",
    locator:
      "Majohn A1 comparison, cartridge/converter/nib-unit swap and one-week rest observations",
  }),
  "majohn-ebay-a1-f-2024": liveSource({
    key: "majohn-ebay-a1-f-2024",
    registryKey: "ebay-historical-listing",
    registryName: "eBay historical listing",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "ebay-listing-204748715967",
    title: "Majohn A1 0.5 mm F Nib — 2024 New Version",
    url: "https://www.ebay.com/itm/204748715967",
    homepageUrl: "https://www.ebay.com/",
    author: "eBay seller listing",
    publishedAt: "2024",
    summary:
      "将 0.5 mm F 尖标为 2024 new version 的历史商品记录；仅用于 F 版本进入市场的时间边界。",
    locator:
      "listing title and option text; historical retailer evidence, not an official release announcement",
  }),
  "majohn-brand-site-original": {
    key: "majohn-brand-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Majohn 机构路线——本站原创编辑插画（AI 辅助制作）",
    url: "/images/library/site-original/majohn/majohn-brand-mechanisms-illustration.png",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创编辑插画（AI 辅助制作）；非产品实拍，不代表任何具体 Majohn 型号、配色或生产批次。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/majohn/majohn-brand-mechanisms-illustration.png",
    archiveLocator:
      "project-public-asset:majohn-brand-mechanisms-illustration.png;site-original=true;ai-assisted=true;product-photo=false;specific-colorway-or-batch=false",
  },
  "majohn-a1-site-original": {
    key: "majohn-a1-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Majohn A1 按动机构——本站原创编辑插画（AI 辅助制作）",
    url: "/images/library/site-original/majohn/majohn-a1-retractable-illustration.png",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创编辑插画（AI 辅助制作）；非 A1 实物照片，不代表具体配色、饰件或生产批次。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/majohn/majohn-a1-retractable-illustration.png",
    archiveLocator:
      "project-public-asset:majohn-a1-retractable-illustration.png;site-original=true;ai-assisted=true;product-photo=false;specific-colorway-or-batch=false",
  },
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

export const phase23MajohnPacks: CuratedEntityPack[] = [
  {
    key: "phase23-majohn-brand-v1",
    entityId: "TfXerdAZ5iWg",
    expectedType: "brand",
    expectedSlug: "majohn",
    canonicalName: "末匠 Majohn",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/majohn-brand-publishable-content-2026-07-19.md",
    storyTitle: "末匠 Majohn：名称沿革、机构证据与型号阅读边界",
    primarySourceKey: "majohn-justia-trademark",
    depthTier: "A",
    aliases: [
      {
        alias: "Majohn",
        language: "en",
        sourceKey: "majohn-justia-trademark",
      },
      {
        alias: "Moonman",
        language: "en",
        kind: "former_name",
        sourceKey: "majohn-wtr-transition",
      },
    ],
    sources: [
      source("majohn-justia-trademark"),
      source("majohn-wtr-transition"),
      source("majohn-fpn-a1-launch"),
      source("majohn-lumafield-ct"),
      source("majohn-brand-site-original"),
    ],
    scopes: [
      {
        key: "trademark-record",
        scopeKey: "majohn-trademark-record-2021",
        validFrom: "2021-04-02",
        productionState: "historical",
        editionScope: "MAJOHN trademark record; not a complete company history",
      },
      {
        key: "name-transition",
        scopeKey: "moonman-to-majohn-name-transition",
        validFrom: "2021",
        productionState: "historical",
        editionScope: "brand-name transition; old marks may remain on stock",
      },
      {
        key: "a1-transition-sample",
        scopeKey: "a1-early-market-name-transition",
        validFrom: "2021-11",
        productionState: "historical",
        editionScope: "early A1 sales and physical markings",
      },
    ],
    claims: [
      {
        key: "majohn-trademark-application",
        predicate: "trademark_application_record",
        objectText:
          "Justia 收录的 MAJOHN 记录列出 Shanghai Shanyin Trading Co., Ltd.、2021-04-02 申请日期及 fountain pens 商品范围。",
        factClass: "core",
        confidence: 0.94,
        sourceKey: "majohn-justia-trademark",
        locator:
          "Record header and Goods and Services; database mirror, not a complete corporate history.",
        evidence: [
          {
            key: "justia-application-record",
            sourceKey: "majohn-justia-trademark",
            scopeKey: "trademark-record",
            locator:
              "Applicant, filing date 2021-04-02 and fountain pens goods entry for serial 79312903.",
          },
        ],
      },
      {
        key: "moonman-majohn-name-continuity",
        predicate: "former_brand_name",
        objectText:
          "行业报道记录 Moonman 在 2021 年转用 Majohn 名称，因此 Moonman 作为历史名称保留，而不是独立的当前品牌实体。",
        factClass: "core",
        confidence: 0.91,
        sourceKey: "majohn-wtr-transition",
        locator:
          "WTR fountain-pen trademark section describing the switch from Moonman to Majohn.",
        evidence: [
          {
            key: "wtr-name-transition",
            sourceKey: "majohn-wtr-transition",
            scopeKey: "name-transition",
            locator:
              "Industry report describing the 2021 Moonman-to-Majohn naming response.",
          },
          {
            key: "fpn-a1-name-overlap",
            sourceKey: "majohn-fpn-a1-launch",
            scopeKey: "a1-transition-sample",
            locator:
              "2021-12-08 participant reports a Majohn sale name while the pen still bears Moon Man marking.",
          },
        ],
      },
      {
        key: "a1-mechanism-evidence",
        predicate: "model_mechanism_example",
        objectText:
          "Lumafield 对受测 A1 样本的工业 CT 显示伸缩笔尖总成、弹簧与前端遮门；这只证明该机构存在，不保证全批次密封表现。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: "majohn-lumafield-ct",
        locator: "Majohn A1 industrial CT scan and mechanism explanation.",
        evidence: [
          {
            key: "lumafield-a1-mechanism",
            sourceKey: "majohn-lumafield-ct",
            scopeKey: "a1-transition-sample",
            locator:
              "CT view of the tested A1 retractable nib assembly, spring and front trap door.",
          },
        ],
      },
    ],
    media: [
      {
        key: "majohn-brand-mechanisms-primary",
        title: "Majohn 机构路线本站原创编辑插画（AI 辅助制作）",
        sourceKey: "majohn-brand-site-original",
        localPath:
          "/images/library/site-original/majohn/majohn-brand-mechanisms-illustration.png",
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创编辑插画（AI 辅助制作）。非产品实拍，不代表任何具体 Majohn 型号、配色或生产批次。",
        sourceUrl:
          "/images/library/site-original/majohn/majohn-brand-mechanisms-illustration.png",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "moonman-name-transition",
        title: "行业报道记录 Moonman 转用 Majohn 名称",
        eventType: "community_event",
        startDate: "2021-01-01",
        circa: true,
        description:
          "只标记 2021 年名称转换语境；不同市场的旧标库存可能继续流通。",
        sourceKey: "majohn-wtr-transition",
      },
      {
        key: "majohn-a1-retail-window",
        title: "A1 最迟已进入公开零售",
        eventType: "model_released",
        startDate: "2021-11-25",
        circa: true,
        description:
          "同期讨论证明 A1 最迟在 2021 年 11 月已经公开销售；这不是制造商正式发布日期。",
        sourceKey: "majohn-fpn-a1-launch",
      },
    ],
  },
  {
    key: "phase23-majohn-a1-v1",
    entityId: "34paI0Z4d-Q6",
    expectedType: "pen",
    expectedSlug: "末匠-majohn-a1-按动",
    canonicalName: "末匠 Majohn A1 按动钢笔",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/majohn-a1-publishable-content-2026-07-19.md",
    storyTitle: "末匠 Majohn A1：按动机构、版本边界与收货检查",
    primarySourceKey: "majohn-fpn-a1-launch",
    depthTier: "A",
    aliases: [
      {
        alias: "Majohn A1",
        language: "en",
        sourceKey: "majohn-everything-calligraphy-a1",
      },
      {
        alias: "Moonman A1",
        language: "en",
        kind: "former_name",
        sourceKey: "majohn-fpn-a1-launch",
      },
      {
        alias: "Moon Man A1",
        language: "en",
        kind: "former_name",
        sourceKey: "majohn-fpn-a1-launch",
      },
    ],
    sources: [
      source("majohn-justia-trademark"),
      source("majohn-wtr-transition"),
      source("majohn-fpn-a1-launch"),
      source("majohn-lumafield-ct"),
      source("majohn-everything-calligraphy-a1"),
      source("majohn-makoba-a1"),
      source("majohn-sketchywolf-a1"),
      source("majohn-lethbridge-a1"),
      source("majohn-penchantink-clicky"),
      source("majohn-ebay-a1-f-2024"),
      source("majohn-a1-site-original"),
    ],
    variants: [
      {
        key: "with-clip",
        name: "带笔夹笔身",
        releaseYear: "2021",
        notes:
          "前置笔夹可帮助固定笔尖方向，也可能与非标准握姿冲突；不是独立型号。",
        sourceKey: "majohn-fpn-a1-launch",
        variantKind: "variant",
      },
      {
        key: "clipless",
        name: "无笔夹笔身",
        releaseYear: "2021",
        notes:
          "首发窗口已出现；避免握位笔夹，但失去夹持并更容易滚动；不是独立型号。",
        sourceKey: "majohn-fpn-a1-launch",
        variantKind: "variant",
      },
      {
        key: "ef-nib",
        name: "EF 钢尖",
        releaseYear: "2021",
        notes:
          "首批主要笔尖选项；0.38／0.4 mm 属商品标称，不能当作固定纸面线宽。",
        sourceKey: "majohn-fpn-a1-launch",
        variantKind: "nib",
      },
      {
        key: "f-nib",
        name: "F 钢尖",
        releaseYear: "2024",
        notes:
          "2024 new version 商品记录与当前 EF／F 零售选项共同支持；不倒填到首批 A1。",
        sourceKey: "majohn-ebay-a1-f-2024",
        variantKind: "nib",
      },
    ],
    scopes: [
      {
        key: "model-history",
        scopeKey: "a1-model-history-2021-present",
        validFrom: "2021-11",
        productionState: "current",
        editionScope: "one canonical A1 model across Majohn/Moonman markings",
      },
      {
        key: "launch-window",
        scopeKey: "a1-2021-launch-window",
        validFrom: "2021-11-17",
        validTo: "2021-12-08",
        productionState: "historical",
        nibScope: "primarily EF",
        editionScope: "with-clip and clipless early retail evidence",
      },
      {
        key: "current-retail",
        scopeKey: "a1-current-retail-options",
        market: "multiple independent retailers",
        productionState: "current",
        nibScope: "EF and F",
        materialScope: "metal body; brass only for identified SKU",
        editionScope: "with-clip and clipless; packages vary",
      },
      {
        key: "f-2024",
        scopeKey: "a1-f-nib-2024-market-entry",
        validFrom: "2024",
        productionState: "current",
        nibScope: "F; nominal 0.5 mm retailer label",
        editionScope: "retailer-described 2024 new version",
      },
      {
        key: "ct-sample",
        scopeKey: "a1-lumafield-tested-sample",
        productionState: "unknown",
        editionScope: "single industrial-CT sample",
      },
      {
        key: "review-samples",
        scopeKey: "a1-independent-review-samples",
        productionState: "unknown",
        editionScope: "individual samples; not a batch guarantee",
      },
      {
        key: "compatibility-samples",
        scopeKey: "a1-third-party-compatibility-tests",
        productionState: "unknown",
        editionScope:
          "third-party interchange tests; no Majohn or Pilot official compatibility promise",
      },
    ],
    claims: [
      {
        key: "a1-one-model-two-marks",
        predicate: "canonical_identity",
        objectText:
          "A1 以 Majohn 为规范品牌，Moonman／Moon Man 只保留为名称转换期的历史标记与别名。",
        factClass: "core",
        confidence: 0.93,
        sourceKey: "majohn-wtr-transition",
        locator:
          "WTR brand-name transition plus contemporaneous A1 report of mixed sale/body markings.",
        evidence: [
          {
            key: "wtr-a1-brand-context",
            sourceKey: "majohn-wtr-transition",
            scopeKey: "model-history",
            locator:
              "Industry report establishes Moonman-to-Majohn name continuity.",
          },
          {
            key: "fpn-a1-mixed-marking",
            sourceKey: "majohn-fpn-a1-launch",
            scopeKey: "launch-window",
            locator:
              "2021-12-08 post records Majohn sale name and Moon Man body marking on A1.",
          },
        ],
      },
      {
        key: "a1-retail-by-november-2021",
        predicate: "earliest_verified_retail_window",
        objectText:
          "同期记录证明 A1 最迟于 2021 年 11 月 25／26 日已公开销售；这不是制造商正式发布日期。",
        factClass: "core",
        confidence: 0.9,
        sourceKey: "majohn-fpn-a1-launch",
        locator:
          "Thread page 2 retail updates dated 2021-11-25/26 and clipless update dated 2021-11-29.",
        evidence: [
          {
            key: "fpn-a1-retail-window",
            sourceKey: "majohn-fpn-a1-launch",
            scopeKey: "launch-window",
            locator:
              "Contemporaneous posts record with-clip sales by 2021-11-25/26 and clipless sales by 2021-11-29.",
          },
        ],
      },
      {
        key: "a1-retractable-mechanism",
        predicate: "retractable_mechanism",
        objectText:
          "受测 A1 使用按键驱动伸缩笔尖，笔尖收回后由前端弹簧遮门覆盖；结构存在不等于全批次完全气密。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "majohn-lumafield-ct",
        locator: "Industrial CT view of the tested A1 mechanism.",
        evidence: [
          {
            key: "lumafield-a1-ct",
            sourceKey: "majohn-lumafield-ct",
            scopeKey: "ct-sample",
            locator:
              "CT scan shows retractable nib assembly, spring and front trap door in the tested sample.",
          },
        ],
      },
      {
        key: "a1-clip-and-nib-boundaries",
        predicate: "variant_boundaries",
        objectText:
          "A1 的带夹／无夹是笔身版本，EF／F 是笔尖选项；F 有 2024 以后零售证据，不能倒填为首批标配。",
        factClass: "core",
        confidence: 0.9,
        sourceKey: "majohn-everything-calligraphy-a1",
        locator:
          "Current clip/no-clip and EF/F options, combined with the 2024 F-version listing.",
        evidence: [
          {
            key: "current-clip-nib-options",
            sourceKey: "majohn-everything-calligraphy-a1",
            scopeKey: "current-retail",
            locator:
              "Retail selector lists with-clip/no-clip bodies and EF/F nib options.",
          },
          {
            key: "f-version-2024",
            sourceKey: "majohn-ebay-a1-f-2024",
            scopeKey: "f-2024",
            locator:
              "Historical listing labels a 0.5 mm F nib as a 2024 new version.",
          },
        ],
      },
      {
        key: "a1-pilot-compatibility-boundary",
        predicate: "third_party_compatibility_report",
        objectText:
          "独立使用者报告过 A1 与 Pilot Capless／Vanishing Point 的墨囊、上墨器和笔尖总成互换；这不是双方制造商保证。",
        factClass: "core",
        confidence: 0.78,
        sourceKey: "majohn-penchantink-clicky",
        locator:
          "Third-party cartridge, converter and nib-unit swap observations; no manufacturer warranty claim.",
        evidence: [
          {
            key: "penchantink-compatibility-test",
            sourceKey: "majohn-penchantink-clicky",
            scopeKey: "compatibility-samples",
            locator:
              "Reviewer reports successful component swaps among tested A1 and Pilot samples.",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: "TfXerdAZ5iWg",
      values: {
        series_name: "A1 按动式伸缩笔尖钢笔",
        release_year:
          "最迟于 2021 年 11 月已公开销售；官方准确发布日期未确认",
        origin_country:
          "中国（现售磨砂黑无夹 SKU 的零售标示；不外推到所有配色和批次）",
        nib: "钢尖；早期以 EF 为主，现售另有 F；标称毫米值不是固定纸面线宽",
        fill_system: "墨囊／上墨器两用；附件数量依渠道与批次",
        material:
          "金属笔身；部分明确 SKU 为黄铜，不外推到所有颜色和批次",
        dimensions:
          "现售标称约 138 mm、最大径约 13 mm；单支实测因伸缩状态约 138／140 mm",
        weight: "零售标称约 30 g；独立含墨样本约 33 g",
        status: "现售；2026-07-19 检索",
      },
      evidence: [
        {
          key: "brand-a1-mixed-marking",
          fieldKey: "brand_entity_id",
          sourceKey: "majohn-fpn-a1-launch",
          scopeKey: "launch-window",
          locator:
            "A1 sold under Majohn while a sampled pen retained Moon Man marking; one brand lineage, not two makers.",
        },
        {
          key: "series-current-retail",
          fieldKey: "series_name",
          sourceKey: "majohn-everything-calligraphy-a1",
          scopeKey: "current-retail",
          locator: "Product title identifies A1 press/retractable fountain pen.",
        },
        {
          key: "release-contemporary-record",
          fieldKey: "release_year",
          sourceKey: "majohn-fpn-a1-launch",
          scopeKey: "launch-window",
          locator:
            "Contemporaneous sale records dated 2021-11-25/26; used as latest-proven retail date, not official launch date.",
        },
        {
          key: "origin-current-retail",
          fieldKey: "origin_country",
          sourceKey: "majohn-makoba-a1",
          scopeKey: "current-retail",
          locator: "Matte-black clipless SKU specification lists China.",
        },
        {
          key: "nib-current-retail",
          fieldKey: "nib",
          sourceKey: "majohn-makoba-a1",
          scopeKey: "current-retail",
          locator: "Retail specification lists steel nib and EF/F options.",
        },
        {
          key: "nib-f-2024",
          fieldKey: "nib",
          sourceKey: "majohn-ebay-a1-f-2024",
          scopeKey: "f-2024",
          locator: "Listing labels F 0.5 mm as 2024 new version.",
        },
        {
          key: "fill-current-retail",
          fieldKey: "fill_system",
          sourceKey: "majohn-makoba-a1",
          scopeKey: "current-retail",
          locator: "Cartridge / converter (included) retail specification.",
        },
        {
          key: "fill-review-sample",
          fieldKey: "fill_system",
          sourceKey: "majohn-lethbridge-a1",
          scopeKey: "review-samples",
          locator:
            "Reviewed package included refillable cartridges, converter and dropper; package-specific evidence.",
        },
        {
          key: "material-general-retail",
          fieldKey: "material",
          sourceKey: "majohn-everything-calligraphy-a1",
          scopeKey: "current-retail",
          locator: "Retail description identifies a metal body.",
        },
        {
          key: "material-brass-sku",
          fieldKey: "material",
          sourceKey: "majohn-makoba-a1",
          scopeKey: "current-retail",
          locator:
            "Matte-black clipless SKU is listed as brass; evidence is explicitly SKU-limited.",
        },
        {
          key: "dimensions-current-retail",
          fieldKey: "dimensions",
          sourceKey: "majohn-everything-calligraphy-a1",
          scopeKey: "current-retail",
          locator: "Retail specifications list about 138 mm and 13 mm.",
        },
        {
          key: "dimensions-review-sample",
          fieldKey: "dimensions",
          sourceKey: "majohn-sketchywolf-a1",
          scopeKey: "review-samples",
          locator:
            "Single sample measured about 140 mm retracted and 138 mm extended.",
        },
        {
          key: "weight-current-retail",
          fieldKey: "weight",
          sourceKey: "majohn-everything-calligraphy-a1",
          scopeKey: "current-retail",
          locator: "Retail specification lists about 30 g.",
        },
        {
          key: "weight-review-sample",
          fieldKey: "weight",
          sourceKey: "majohn-lethbridge-a1",
          scopeKey: "review-samples",
          locator: "Inked review sample measured about 33 g.",
        },
        {
          key: "status-current-listing",
          fieldKey: "status",
          sourceKey: "majohn-everything-calligraphy-a1",
          scopeKey: "current-retail",
          locator: "Live retail listing retrieved 2026-07-19.",
        },
      ],
    },
    media: [
      {
        key: "majohn-a1-retractable-primary",
        title: "Majohn A1 按动机构本站原创编辑插画（AI 辅助制作）",
        sourceKey: "majohn-a1-site-original",
        localPath:
          "/images/library/site-original/majohn/majohn-a1-retractable-illustration.png",
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创编辑插画（AI 辅助制作）。非 A1 产品实拍，不代表任何具体配色、饰件或生产批次。",
        sourceUrl:
          "/images/library/site-original/majohn/majohn-a1-retractable-illustration.png",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "a1-retail-window",
        title: "A1 已进入公开零售",
        eventType: "model_released",
        startDate: "2021-11-25",
        circa: true,
        description:
          "目前能核实的是最迟零售窗口，不把同期讨论日期冒充制造商正式发布日期。",
        sourceKey: "majohn-fpn-a1-launch",
      },
      {
        key: "a1-f-version",
        title: "F 尖版本进入零售记录",
        eventType: "design_milestone",
        startDate: "2024-01-01",
        circa: true,
        description:
          "历史商品记录把 0.5 mm F 标为 2024 new version；当前零售页同时列出 EF／F。",
        sourceKey: "majohn-ebay-a1-f-2024",
      },
    ],
  },
];
