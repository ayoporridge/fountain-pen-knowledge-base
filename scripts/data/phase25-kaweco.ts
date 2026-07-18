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
  "kaweco-official-history": liveSource({
    key: "kaweco-official-history",
    registryKey: "kaweco-official",
    registryName: "Kaweco official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "kaweco-official",
    title: "Kawecos Geschichte",
    url: "https://www.kaweco-pen.com/Entdecke-Kaweco/UEber-Kaweco/Geschichte/",
    homepageUrl: "https://www.kaweco-pen.com/",
    author: "Kaweco / h&m gutberlet gmbh",
    summary:
      "Kaweco 官方德文年表：1883 年工厂源流、1889 年品牌名、1911 年口袋笔、1930 年资产转手以及 1994 年名称权与现代 Sport 重启。",
    locator:
      "1883, 1889, 1908, 1911, 1930, 1994 and 2000 chronology entries; official brand narrative",
  }),
  "kaweco-official-classic-series": liveSource({
    key: "kaweco-official-classic-series",
    registryKey: "kaweco-official",
    registryName: "Kaweco official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "kaweco-official",
    title: "CLASSIC SPORT",
    url: "https://www.kaweco-pen.com/en/Series/CLASSIC-SPORT/",
    homepageUrl: "https://www.kaweco-pen.com/",
    author: "Kaweco / h&m gutberlet gmbh",
    summary:
      "Classic Sport 官方系列页：塑料材质、历史色、镀金钢尖、EF 至 BB、闭合约 10.5 cm、插帽后标准长度及可选夹子。",
    locator:
      "series introduction and current fountain-pen filter/listing; retrieved 2026-07-19",
  }),
  "kaweco-official-navy-product": liveSource({
    key: "kaweco-official-navy-product",
    registryKey: "kaweco-official",
    registryName: "Kaweco official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "kaweco-official",
    title: "Kaweco CLASSIC SPORT Fountain Pen Navy BB",
    url: "https://www.kaweco-pen.com/en/Kaweco-CLASSIC-SPORT-Fountain-Pen-Navy-BB/10001741/",
    homepageUrl: "https://www.kaweco-pen.com/",
    author: "Kaweco / h&m gutberlet gmbh",
    summary:
      "当前 Navy SKU 属性表：塑料、金色饰件、10.7 cm、打开／插帽 12.7 cm、无夹直径 13 mm、10.7 g 与德国制造。",
    locator:
      "product description and Properties table for product 10001741; SKU-scoped current specification",
  }),
  "kaweco-official-manual": liveSource({
    key: "kaweco-official-manual",
    registryKey: "kaweco-official",
    registryName: "Kaweco official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "kaweco-official",
    title: "HOW TO REFILL, CHANGE & USE",
    url: "https://www.kaweco-pen.com/media/pdf/b1/4f/c2/Kaweco_Manual_All-Pens_ENG_Prozess_122023_01.pdf",
    homepageUrl: "https://www.kaweco-pen.com/",
    itemType: "pdf",
    author: "Kaweco / h&m gutberlet gmbh",
    summary:
      "Kaweco 通用说明书：Sport 尺寸钢笔装一支标准短墨囊，以及 Mini Converter 的安装、吸墨和透明握位清洁提示。",
    locator:
      "PDF pages 2 and 8-9: SPORT SIZE fountain pen cartridge and MINI CONVERTER (FOR SPORT)",
  }),
  "kaweco-official-mini-converter": liveSource({
    key: "kaweco-official-mini-converter",
    registryKey: "kaweco-official",
    registryName: "Kaweco official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "kaweco-official",
    title: "Kaweco Mini Converter",
    url: "https://www.kaweco-pen.com/en/Kaweco-Mini-Converter/10001349/",
    homepageUrl: "https://www.kaweco-pen.com/",
    author: "Kaweco / h&m gutberlet gmbh",
    summary:
      "官方 Mini Converter 商品页：为 Sport 尺寸设计并适用于 Kaweco Sport 系列；金属 AL／AC 的兼容年份另有限定。",
    locator:
      "description and compatibility footnotes for product 10001349",
  }),
  "kaweco-official-classic-front-part": liveSource({
    key: "kaweco-official-classic-front-part",
    registryKey: "kaweco-official",
    registryName: "Kaweco official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "kaweco-official",
    title: "Kaweco CLASSIC Front Part Black M",
    url: "https://www.kaweco-pen.com/en/Kaweco-CLASSIC-Front-Part-Black-M/10001052/",
    homepageUrl: "https://www.kaweco-pen.com/",
    author: "Kaweco / h&m gutberlet gmbh",
    summary:
      "Classic Sport 替换前端商品页：笔尖与导墨舌压装在塑料握位中，整段前端适用于 Classic、Frosted 与 Skyline。",
    locator:
      "description, nib selector and compatible-series statement for product 10001052",
  }),
  "kaweco-pen-company-history": liveSource({
    key: "kaweco-pen-company-history",
    registryKey: "the-pen-company-blog",
    registryName: "The Pen Company Blog",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "the-pen-company",
    title: "Meet the brand: Kaweco",
    url: "https://www.thepencompany.com/blog/meet-the-brand/kaweco/",
    homepageUrl: "https://www.thepencompany.com/blog/",
    author: "Lucy Williams",
    publishedAt: "2018-09-14",
    summary:
      "第三方品牌史整理，交叉记录 1889 年名称、1911 年 Sport 语境与 1994 年参考 1935 设计的现代重启。",
    locator:
      "brand history sections covering 1883/1889, 1911 Sport and the 1994 relaunch",
  }),
  "kaweco-fountainpen-it-history": liveSource({
    key: "kaweco-fountainpen-it-history",
    registryKey: "fountainpen-it",
    registryName: "FountainPen.it encyclopedia",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "fountainpen-it",
    title: "Kaweco - FountainPen",
    url: "https://wiki.fountainpen.it/Kaweco/en",
    homepageUrl: "https://www.fountainpen.it/",
    author: "FountainPen.it contributors",
    summary:
      "专业钢笔资料库的 Kaweco 品牌史：交叉确认 1883 年品牌源流，并记录原公司破产、后继收购与 Sport 演变；个别精确年份与现行官方年表不同，因此本批只用它佐证 1883 年历史源流。",
    locator:
      "History opening and chronology: 1883 origin only; exact naming, transfer and modern-revival dates are not relied on",
  }),
  "kaweco-fpquest-classic-review": liveSource({
    key: "kaweco-fpquest-classic-review",
    registryKey: "fountain-pen-quest",
    registryName: "Fountain Pen Quest",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "fountain-pen-quest",
    title: "Review: Kaweco Classic Sport",
    url: "https://fpquest.wordpress.com/2013/12/03/review-kaweco-classic-sport/",
    homepageUrl: "https://fpquest.wordpress.com/",
    author: "Ray",
    publishedAt: "2013-12-03",
    summary:
      "透明 Classic Sport 单支实测：闭合、无帽、插帽尺寸，轻量握感、墨囊使用以及该样本的笔尖与出墨体验。",
    locator:
      "The Numbers, Using The Pen and Cleaning The Pen sections; one reviewed sample only",
  }),
  "kaweco-commons-special-media": {
    key: "kaweco-commons-special-media",
    registryKey: "wikimedia-commons",
    registryName: "Wikimedia Commons",
    sourceType: "wikimedia",
    tier: "primary",
    independenceGroup: "wikimedia-markbenecke-kaweco-special",
    title: "Kaweco pens.jpg",
    url: "https://commons.wikimedia.org/wiki/File:Kaweco_pens.jpg",
    homepageUrl: "https://commons.wikimedia.org/",
    itemType: "image",
    author: "Mark Benecke (Wikimedia Commons user Markbenecke)",
    publishedAt: "2018-07-26",
    retrievedAt: RETRIEVED,
    summary:
      "Kaweco Special 铝制钢笔、圆珠笔和铁盒合影；只作品牌代表图，不表示画面型号是 Classic Sport。",
    allowedUse: "store_full",
    license: "cc-by-sa-4.0",
    archiveUrl:
      "/images/library/wikimedia/kaweco/kaweco-special-brand-representative.jpg",
    archiveLocator:
      "project-public-asset:kaweco-special-brand-representative.jpg;source=File:Kaweco_pens.jpg;license=CC-BY-SA-4.0;author=Markbenecke;resize=1800px-long-edge;identity=Kaweco-Special-not-Classic-Sport",
  },
  "kaweco-legeartis-classic-media": {
    key: "kaweco-legeartis-classic-media",
    registryKey: "lege-artis",
    registryName: "Czasopismo Lege Artis",
    sourceType: "blog",
    tier: "primary",
    independenceGroup: "lege-artis-olgierd-rudak",
    title: "Kaweco Classic Sport transparent demonstrator photograph",
    url: "https://czasopismo.legeartis.org/2020/10/wspolzawodnictwo-sportowe-noszenie-maseczki/",
    homepageUrl: "https://czasopismo.legeartis.org/",
    itemType: "image",
    author: "Olgierd Rudak",
    retrievedAt: RETRIEVED,
    summary:
      "透明 Kaweco Classic Sport 实拍，页面明确署名 Olgierd Rudak 并标注 CC BY-SA 3.0；不代表当前固定色表。",
    allowedUse: "store_full",
    license: "cc-by-sa-3.0",
    archiveUrl:
      "/images/library/licensed/kaweco/kaweco-classic-sport-transparent.jpg",
    archiveLocator:
      "project-public-asset:kaweco-classic-sport-transparent.jpg;original=https://czasopismo.legeartis.org/wp-content/uploads/2016/06/KAWECO-classic-sport-3.jpg;license-statement=source-page-caption;license=CC-BY-SA-3.0;author=Olgierd-Rudak",
  },
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

export const phase25KawecoPacks: CuratedEntityPack[] = [
  {
    key: "phase25-kaweco-brand-v1",
    entityId: "mRz7MvzUYwVF",
    expectedType: "brand",
    expectedSlug: "kaweco",
    canonicalName: "Kaweco",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/kaweco-brand-publishable-content-2026-07-19.md",
    storyTitle: "Kaweco：品牌谱系、Sport 源流与现代复兴",
    primarySourceKey: "kaweco-official-history",
    depthTier: "A",
    aliases: [
      {
        alias: "KAWECO",
        language: "de",
        sourceKey: "kaweco-official-history",
      },
    ],
    sources: [
      source("kaweco-official-history"),
      source("kaweco-official-classic-series"),
      source("kaweco-pen-company-history"),
      source("kaweco-fountainpen-it-history"),
      source("kaweco-commons-special-media"),
    ],
    scopes: [
      {
        key: "historical-origin",
        scopeKey: "kaweco-historical-origin-1883-1889",
        validFrom: "1883",
        validTo: "1889",
        productionState: "historical",
        editionScope:
          "Heidelberger Federhalterfabrik origin; Kaweco name not documented until 1889",
      },
      {
        key: "historical-transfer",
        scopeKey: "kaweco-company-assets-transfer-1930",
        validFrom: "1930",
        productionState: "historical",
        editionScope:
          "company name, machinery, stock and rights transferred to Knust, Woringen und Grube",
      },
      {
        key: "modern-revival",
        scopeKey: "kaweco-name-rights-and-modern-sport-revival-1994",
        validFrom: "1994",
        productionState: "current",
        editionScope:
          "h&m gutberlet name rights and modern Sport series based on the 1935 design",
      },
      {
        key: "current-family",
        scopeKey: "kaweco-current-model-family-2026-07-19",
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope:
          "current model families; Classic, AL, Brass, Steel and Piston Sport remain distinct",
      },
    ],
    claims: [
      {
        key: "kaweco-origin-with-name-boundary",
        predicate: "historical_origin",
        objectText:
          "品牌源流可追溯到 1883 年 Heidelberger Federhalterfabrik，但 Kaweco 名称到 1889 年才见于海德堡地址簿。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "kaweco-official-history",
        locator: "official chronology entries for 1883 and 1889",
        evidence: [
          {
            key: "official-origin-and-name",
            sourceKey: "kaweco-official-history",
            scopeKey: "historical-origin",
            locator:
              "1883 factory foundation entry explicitly notes the name was not listed until 1889.",
          },
          {
            key: "secondary-origin-and-name",
            sourceKey: "kaweco-pen-company-history",
            scopeKey: "historical-origin",
            locator:
              "Third-party history separately records the 1883 factory and 1889 Kaweco name.",
          },
          {
            key: "specialist-secondary-1883-origin",
            sourceKey: "kaweco-fountainpen-it-history",
            scopeKey: "historical-origin",
            locator:
              "Specialist fountain-pen encyclopedia traces the historical origin to the 1883 Heidelberger Federhalterfabrik; exact later dates are outside this evidence scope.",
          },
        ],
      },
      {
        key: "kaweco-1930-transfer",
        predicate: "company_assets_transfer",
        objectText:
          "1930 年 Knust, Woringen und Grube 买下 Kaweco 名称、机器、库存与权利，三段圆形 KA WE CO 标志也被放在这一转折中。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: "kaweco-official-history",
        locator: "official 1930 chronology entry",
        evidence: [
          {
            key: "official-1930-transfer",
            sourceKey: "kaweco-official-history",
            scopeKey: "historical-transfer",
            locator:
              "1930 entry identifies buyer, transferred assets/rights and the three-part-circle logo.",
          },
        ],
      },
      {
        key: "kaweco-modern-revival-1994",
        predicate: "brand_revival",
        objectText:
          "1994 年 h&m gutberlet gmbh 取得 KAWECO 名称权，并参考 1935 年设计推出新的 Sport 系列。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "kaweco-official-history",
        locator: "official German chronology entry for 1994",
        evidence: [
          {
            key: "official-1994-revival",
            sourceKey: "kaweco-official-history",
            scopeKey: "modern-revival",
            locator:
              "1994 entry states acquisition of KAWECO name rights and a new Sport line based on the 1935 design.",
          },
          {
            key: "secondary-1994-revival",
            sourceKey: "kaweco-pen-company-history",
            scopeKey: "modern-revival",
            locator:
              "Independent brand history identifies 1994 as the modern Sport relaunch milestone.",
          },
        ],
      },
      {
        key: "kaweco-sport-family-boundary",
        predicate: "model_family_boundary",
        objectText:
          "Sport 是型号家族；Classic、AL、Brass、Steel 与 Piston Sport 必须按材料与机构分别建模，不能共用一组规格。",
        factClass: "editorial",
        confidence: 0.98,
        sourceKey: "kaweco-official-classic-series",
        locator:
          "official Classic Sport identity and current family/product naming; editorial taxonomy conclusion",
        evidence: [
          {
            key: "official-current-sport-family",
            sourceKey: "kaweco-official-classic-series",
            scopeKey: "current-family",
            locator:
              "Official series/product names distinguish CLASSIC SPORT and PISTON SPORT; separate official families identify AL/Brass/Steel.",
          },
        ],
      },
    ],
    media: [
      {
        key: "kaweco-special-brand-primary",
        title: "Kaweco Special 钢笔、圆珠笔与铁盒品牌代表图",
        sourceKey: "kaweco-commons-special-media",
        localPath:
          "/images/library/wikimedia/kaweco/kaweco-special-brand-representative.jpg",
        author: "Mark Benecke (Wikimedia Commons user Markbenecke)",
        license: "cc-by-sa-4.0",
        attributionText:
          "Mark Benecke / Wikimedia Commons，CC BY-SA 4.0。原图等比例缩小至长边 1800 px；画面上方是 Kaweco Special FP 钢笔，下方是同系列圆珠笔，另有包装铁盒。仅作品牌产品路线代表图，不把画面中所有物件当作钢笔规格，也不是 Classic Sport。",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Kaweco_pens.jpg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "kaweco-origin-1883",
        title: "Heidelberger Federhalterfabrik 成立",
        eventType: "design_milestone",
        startDate: "1883",
        circa: false,
        description:
          "这是品牌源流起点；Kaweco 名称到 1889 年才见于官方所引地址簿。",
        sourceKey: "kaweco-official-history",
      },
      {
        key: "kaweco-sport-origin-1911",
        title: "官方年表首次记录 Sport 口袋笔语境",
        eventType: "design_milestone",
        startDate: "1911",
        circa: false,
        description:
          "1911 年记录面向女士、军官和运动人士的口袋钢笔；它是 Sport 源流，不等于当前 Classic Sport SKU 的精确发布日期。",
        sourceKey: "kaweco-official-history",
      },
      {
        key: "kaweco-assets-acquired-1930",
        title: "Knust, Woringen und Grube 收购 Kaweco 名称与资产",
        eventType: "acquisition",
        startDate: "1930",
        circa: false,
        description:
          "官方年表记录了公司名称、机器、库存与权利的转移；这一节点也说明 1883 年以来并非同一法人无间断经营。",
        sourceKey: "kaweco-official-history",
      },
      {
        key: "kaweco-modern-revival-1994",
        title: "h&m gutberlet 取得名称权并重启 Sport",
        eventType: "revival",
        startDate: "1994",
        circa: false,
        description:
          "官方年表称现代 Sport 系列参考 1935 年设计；此节点与 1883 年历史工厂不是同一法人连续经营。",
        sourceKey: "kaweco-official-history",
      },
    ],
  },
  {
    key: "phase25-kaweco-classic-sport-v1",
    entityId: "JhyxWW1Ylw-A",
    expectedType: "pen",
    expectedSlug: "kaweco-sport",
    canonicalName: "Kaweco Classic Sport",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/kaweco-classic-sport-publishable-content-2026-07-19.md",
    storyTitle: "Kaweco Classic Sport：轻量口袋比例、供墨与型号边界",
    primarySourceKey: "kaweco-official-classic-series",
    depthTier: "A",
    aliases: [
      {
        alias: "Classic Sport",
        language: "en",
        sourceKey: "kaweco-official-classic-series",
      },
    ],
    sources: [
      source("kaweco-official-history"),
      source("kaweco-official-classic-series"),
      source("kaweco-official-navy-product"),
      source("kaweco-official-manual"),
      source("kaweco-official-mini-converter"),
      source("kaweco-official-classic-front-part"),
      source("kaweco-fpquest-classic-review"),
      source("kaweco-legeartis-classic-media"),
    ],
    variants: [
      {
        key: "nib-ef",
        name: "EF 镀金钢尖",
        notes: "当前官方五种标准尖号之一；纸面线宽受墨水、纸张和个体差异影响。",
        sourceKey: "kaweco-official-classic-series",
        variantKind: "nib",
      },
      {
        key: "nib-f",
        name: "F 镀金钢尖",
        notes: "当前官方五种标准尖号之一；不是固定毫米线宽承诺。",
        sourceKey: "kaweco-official-classic-series",
        variantKind: "nib",
      },
      {
        key: "nib-m",
        name: "M 镀金钢尖",
        notes: "当前官方五种标准尖号之一，官网将 M 作为不确定尖号时的入门建议。",
        sourceKey: "kaweco-official-classic-series",
        variantKind: "nib",
      },
      {
        key: "nib-b",
        name: "B 镀金钢尖",
        notes: "当前官方五种标准尖号之一，实际字迹仍受纸墨条件影响。",
        sourceKey: "kaweco-official-classic-series",
        variantKind: "nib",
      },
      {
        key: "nib-bb",
        name: "BB 镀金钢尖",
        notes: "当前官方五种标准尖号之一，适合需要更宽线条的场景。",
        sourceKey: "kaweco-official-classic-series",
        variantKind: "nib",
      },
      ...[
        ["color-white", "白色"],
        ["color-red", "红色"],
        ["color-bordeaux", "波尔多红"],
        ["color-green", "绿色"],
        ["color-black", "黑色"],
        ["color-navy", "海军蓝"],
        ["pattern-guilloche-black", "Guilloche Black 历史纹样"],
      ].map(([key, name]) => ({
        key: key ?? "missing",
        name: name ?? "missing",
        notes:
          "2026-07-19 官方 Classic Sport 钢笔商品列表中的颜色／纹样；在售状态以后续商品页为准。",
        sourceKey: "kaweco-official-classic-series",
        variantKind: "color" as const,
      })),
    ],
    scopes: [
      {
        key: "sport-origin",
        scopeKey: "kaweco-sport-pocket-pen-origin-1911",
        validFrom: "1911",
        productionState: "historical",
        editionScope:
          "Sport pocket-pen lineage; not the exact release date of the current Classic Sport SKU",
      },
      {
        key: "modern-line",
        scopeKey: "kaweco-modern-sport-line-1994-present",
        validFrom: "1994",
        productionState: "current",
        editionScope:
          "modern Sport revival based on the 1935 design; Classic remains one distinct branch",
      },
      {
        key: "classic-current",
        scopeKey: "kaweco-classic-sport-current-family-2026-07-19",
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: "EF, F, M, B, BB gold-plated steel nibs",
        materialScope: "plastic body with gold-coloured trim",
        editionScope:
          "Classic Sport only; excludes AL, Brass, Steel and Piston Sport",
      },
      {
        key: "navy-current-sku",
        scopeKey: "kaweco-classic-sport-navy-product-10001741",
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: "BB selected page with EF/F/M/B/BB selector",
        materialScope: "plastic, navy, gold trim",
        editionScope: "current Navy SKU product attributes",
      },
      {
        key: "fpquest-sample",
        scopeKey: "kaweco-classic-sport-transparent-review-sample-2013",
        validFrom: "2013-12-03",
        productionState: "unknown",
        nibScope: "EF on reviewed sample",
        materialScope: "transparent plastic demonstrator sample",
        editionScope: "single reviewer sample; not a batch guarantee",
      },
      {
        key: "photo-sample",
        scopeKey: "kaweco-classic-sport-transparent-photo-sample",
        productionState: "historical",
        materialScope: "transparent plastic demonstrator",
        editionScope:
          "licensed photograph; does not establish current catalogue availability",
      },
    ],
    claims: [
      {
        key: "classic-sport-identity-boundary",
        predicate: "canonical_identity",
        objectText:
          "本条目只对应塑料笔身、金色饰件和镀金钢尖的 Classic Sport；AL、Brass、Steel 与 Piston Sport 是独立支线。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "kaweco-official-classic-series",
        locator:
          "official CLASSIC SPORT series identity, material filter and product naming",
        evidence: [
          {
            key: "official-classic-identity",
            sourceKey: "kaweco-official-classic-series",
            scopeKey: "classic-current",
            locator:
              "Official series describes Classic Sport as plastic with gold-plated nib and gold trim; other Sport materials/mechanisms have distinct official names.",
          },
          {
            key: "official-navy-classic-material",
            sourceKey: "kaweco-official-navy-product",
            scopeKey: "navy-current-sku",
            locator:
              "Current CLASSIC SPORT Navy SKU lists plastic material and gold trim.",
          },
        ],
      },
      {
        key: "classic-sport-pocket-proportions",
        predicate: "dimensions_and_posting",
        objectText:
          "Classic Sport 闭合约 10.5 至 10.7 cm，插帽后约 12.7 至 13 cm；范围反映官网圆整文案与当前 SKU 属性表差异。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "kaweco-official-classic-series",
        locator:
          "official rounded series dimensions and current Navy SKU properties",
        evidence: [
          {
            key: "official-series-rounded-dimensions",
            sourceKey: "kaweco-official-classic-series",
            scopeKey: "classic-current",
            locator:
              "Series copy states 10.5 cm closed and standard size after posting.",
          },
          {
            key: "official-navy-exact-dimensions",
            sourceKey: "kaweco-official-navy-product",
            scopeKey: "navy-current-sku",
            locator:
              "Properties table states 10.7 cm length, 12.7 cm open and 13 mm diameter without clip.",
          },
          {
            key: "fpquest-sample-dimensions",
            sourceKey: "kaweco-fpquest-classic-review",
            scopeKey: "fpquest-sample",
            locator:
              "One sample measured 105.62 mm capped, 100.22 mm uncapped and 131.09 mm posted.",
          },
        ],
      },
      {
        key: "classic-sport-nib-options",
        predicate: "nib_options",
        objectText:
          "当前 Classic Sport 提供 EF、F、M、B、BB 五种镀金钢尖；尖号不是固定毫米线宽。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "kaweco-official-classic-series",
        locator: "official series nib range and gold-plated nib description",
        evidence: [
          {
            key: "official-classic-nib-range",
            sourceKey: "kaweco-official-classic-series",
            scopeKey: "classic-current",
            locator:
              "Series page lists five nib sizes from EF through BB and identifies a gold-plated nib.",
          },
        ],
      },
      {
        key: "classic-sport-fill-system",
        predicate: "filling_system",
        objectText:
          "Classic Sport 使用一支标准短墨囊，也可另配 Kaweco Mini Converter；滴入式改装不属于官方规格。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "kaweco-official-manual",
        locator: "official manual Sport-size cartridge and Mini Converter pages",
        evidence: [
          {
            key: "official-sport-cartridge",
            sourceKey: "kaweco-official-manual",
            scopeKey: "classic-current",
            locator:
              "Manual page 2 shows one standard ink cartridge for SPORT SIZE fountain pens.",
          },
          {
            key: "official-sport-mini-converter",
            sourceKey: "kaweco-official-mini-converter",
            scopeKey: "classic-current",
            locator:
              "Product page states the Mini Converter was developed for and fits Kaweco SPORT fountain pens.",
          },
        ],
      },
      {
        key: "classic-sport-front-part-boundary",
        predicate: "replaceable_front_part",
        objectText:
          "Classic Sport 的官方替换件是带塑料握位的前端总成，适配范围明确列为 Classic、Frosted 与 Skyline；不能据此推定整套前端与金属 Sport 通用。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "kaweco-official-classic-front-part",
        locator:
          "official CLASSIC front-part construction and compatible-series description",
        evidence: [
          {
            key: "official-classic-front-part",
            sourceKey: "kaweco-official-classic-front-part",
            scopeKey: "classic-current",
            locator:
              "Official replacement page says nib/feed are pressed into the insert and the complete front part fits Classic, Frosted and Skyline.",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: "mRz7MvzUYwVF",
      values: {
        series_name: "Classic Sport（Sport 家族的塑料支线）",
        origin_country: "德国（当前官网称整笔与笔尖在德国生产／组装）",
        nib: "镀金钢尖；EF、F、M、B、BB；塑料前端总成可整件更换",
        fill_system: "一支标准短墨囊；Kaweco Mini Converter 可选",
        material: "塑料笔身、金色饰件；不含 AL／Brass／Steel 支线",
        dimensions:
          "闭合约 10.5-10.7 cm；插帽约 12.7-13 cm；无夹直径约 13 mm",
        weight: "约 10.7 g（当前 Navy SKU 属性表）",
        status: "当前在售；2026-07-19 检索",
      },
      evidence: [
        {
          key: "brand-official-classic",
          fieldKey: "brand_entity_id",
          sourceKey: "kaweco-official-classic-series",
          scopeKey: "classic-current",
          locator: "Kaweco official CLASSIC SPORT series page.",
        },
        {
          key: "series-official-classic",
          fieldKey: "series_name",
          sourceKey: "kaweco-official-classic-series",
          scopeKey: "classic-current",
          locator: "Official series title and product names identify CLASSIC SPORT.",
        },
        {
          key: "origin-official-navy",
          fieldKey: "origin_country",
          sourceKey: "kaweco-official-navy-product",
          scopeKey: "navy-current-sku",
          locator:
            "Current product copy says all nibs and the entire fountain pen are made in Germany.",
        },
        {
          key: "nib-official-series",
          fieldKey: "nib",
          sourceKey: "kaweco-official-classic-series",
          scopeKey: "classic-current",
          locator:
            "Official series identifies gold-plated nib and EF/F/M/B/BB options.",
        },
        {
          key: "nib-official-front-part",
          fieldKey: "nib",
          sourceKey: "kaweco-official-classic-front-part",
          scopeKey: "classic-current",
          locator:
            "Official front-part page describes pressed nib/feed and complete grip-section replacement.",
        },
        {
          key: "fill-official-cartridge",
          fieldKey: "fill_system",
          sourceKey: "kaweco-official-manual",
          scopeKey: "classic-current",
          locator: "Manual page 2: one standard cartridge for SPORT SIZE.",
        },
        {
          key: "fill-official-mini-converter",
          fieldKey: "fill_system",
          sourceKey: "kaweco-official-mini-converter",
          scopeKey: "classic-current",
          locator: "Official Mini Converter Sport compatibility statement.",
        },
        {
          key: "material-official-series",
          fieldKey: "material",
          sourceKey: "kaweco-official-classic-series",
          scopeKey: "classic-current",
          locator:
            "Official Classic Sport series uses plastic material and gold-coloured elements.",
        },
        {
          key: "dimensions-official-rounded",
          fieldKey: "dimensions",
          sourceKey: "kaweco-official-classic-series",
          scopeKey: "classic-current",
          locator:
            "Series marketing copy states 10.5 cm closed and standard size when posted.",
        },
        {
          key: "dimensions-official-navy-table",
          fieldKey: "dimensions",
          sourceKey: "kaweco-official-navy-product",
          scopeKey: "navy-current-sku",
          locator:
            "Navy SKU Properties: 10.7 cm, 12.7 cm open, 13 mm without clip.",
        },
        {
          key: "weight-official-navy-table",
          fieldKey: "weight",
          sourceKey: "kaweco-official-navy-product",
          scopeKey: "navy-current-sku",
          locator: "Navy SKU Properties lists 10.7 g.",
        },
        {
          key: "status-official-live-series",
          fieldKey: "status",
          sourceKey: "kaweco-official-classic-series",
          scopeKey: "classic-current",
          locator:
            "Live official series and product listings retrieved 2026-07-19.",
        },
      ],
    },
    conflicts: [
      {
        key: "classic-sport-official-dimension-rounding",
        fieldKey: "dimensions",
        scopeKey: "classic-current",
        conflictKind: "field",
        status: "resolved",
        resolutionNote:
          "官网系列文案使用 10.5／约 13 cm 圆整值，当前 Navy SKU 属性表使用 10.7／12.7 cm；规范字段保留范围并标明证据层级，不把它们误判成不同型号。",
        members: [
          {
            citationKey: "dimensions-official-rounded",
            assertedValue: "closed 10.5 cm; posted standard/approximately 13 cm",
          },
          {
            citationKey: "dimensions-official-navy-table",
            assertedValue: "length 10.7 cm; length open 12.7 cm; diameter 13 mm",
          },
        ],
      },
    ],
    media: [
      {
        key: "kaweco-classic-sport-transparent-primary",
        title: "透明 Kaweco Classic Sport 实拍",
        sourceKey: "kaweco-legeartis-classic-media",
        localPath:
          "/images/library/licensed/kaweco/kaweco-classic-sport-transparent.jpg",
        author: "Olgierd Rudak",
        license: "cc-by-sa-3.0",
        attributionText:
          "Olgierd Rudak / Czasopismo Lege Artis，CC BY-SA 3.0。画面为透明 Kaweco Classic Sport 实拍；不代表当前固定在售色表。",
        sourceUrl:
          "https://czasopismo.legeartis.org/2020/10/wspolzawodnictwo-sportowe-noszenie-maseczki/",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "classic-sport-lineage-1911",
        title: "Sport 口袋笔语境见于官方年表",
        eventType: "design_milestone",
        startDate: "1911",
        circa: false,
        description:
          "这是 Sport 家族源流，不把 1911 年直接写成当前塑料 Classic Sport SKU 的精确发布日期。",
        sourceKey: "kaweco-official-history",
      },
      {
        key: "modern-sport-revival-1994",
        title: "现代 Sport 系列重启",
        eventType: "revival",
        startDate: "1994",
        circa: false,
        description:
          "h&m gutberlet 取得名称权后参考 1935 年设计推出新的 Sport 系列；Classic 是现代家族中的塑料支线。",
        sourceKey: "kaweco-official-history",
      },
    ],
  },
];
