import type {
  CuratedEntityPack,
  CuratedSource,
} from "../lib/curated-content-pack";
import { phase27PelikanPacks } from "./phase27-pelikan";

export const PHASE32_PELIKAN_ID = "VXUULuCOLOB1";
export const PHASE32_M1000_ID = "6eXuisf9KiK5";
export const PHASE32_M600_ID = "MJHgkh3M-6MQ";
export const PHASE32_M600_TORTOISESHELL_WHITE_2012_ID = "aRUJifVzWhCk";
export const PHASE32_RETIRED_MISLABEL_ID = "hO_QkEZd8uyh";

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

function phase27Source(key: string): CuratedSource {
  const match = phase27PelikanPacks
    .flatMap((pack) => pack.sources)
    .find((candidate) => candidate.key === key);
  if (!match) {
    throw new Error(`Phase 32 cannot resolve Phase 27 source ${key}.`);
  }
  return match;
}

const SOURCES = {
  "pelikan-catalog-2025": phase27Source("pelikan-catalog-2025"),
  "pelikan-official-warranty": phase27Source("pelikan-official-warranty"),
  "phase32-pelikan-official-m1000-black": liveSource({
    key: "phase32-pelikan-official-m1000-black",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Souverän 1000 Black",
    url: "https://www.pelikan-passion.com/co/escritura/premium/souveraen/souveran-1000-black.html",
    homepageUrl: "https://www.pelikan-passion.com/",
    author: "Pelikan",
    summary:
      "现行黑色 M1000 官方产品页列闭帽长度 14.6 cm、重量 32.6 g；长度比 2025 官方目录的 14.7 cm 少 1 mm。",
    locator:
      "product facts and figures: capped length 14.6 cm and weight 32.6 g",
  }),
  "phase32-pelikan-official-m600-black": liveSource({
    key: "phase32-pelikan-official-m600-black",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Souverän 600 Black",
    url: "https://www.pelikan-passion.com/de/writing/premium/souveraen/souveraen-r-600-schwarz.html",
    homepageUrl: "https://www.pelikan-passion.com/",
    author: "Pelikan",
    summary:
      "现行黑色 M600 官方产品页列闭帽长度 13.3 cm、重量 16.4 g；长度比 2025 官方目录的 13.4 cm 少 1 mm。",
    locator:
      "Fakten & Zahlen: capped length 13.3 cm and weight 16.4 g",
  }),
  "phase32-pelikan-collectibles-m1000": liveSource({
    key: "phase32-pelikan-collectibles-m1000",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pelikan-collectibles",
    title: "Pelikan M1000 & M1005 Souverän",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M1000-Basis/index.html",
    homepageUrl: "https://www.pelikan-collectibles.com/",
    author: "Dominic Rothemel",
    summary:
      "收藏资料把 M1000 的标准生产起点列为 1997 年，并分开 M1000 与银色饰件 M1005 及同基础特别版。",
    locator:
      "M1000 and M1005 model tables: production since 1997, 18 ct nib, standard black/green-striped identity and separate M1005 entries",
  }),
  "phase32-pelikans-perch-m1000": liveSource({
    key: "phase32-pelikans-perch-m1000",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "Review: M1000 Green Striped (1997-Present)",
    url: "https://thepelikansperch.com/2015/11/05/pelikan-m1000-review/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2015-11-05",
    summary:
      "M1000 型号史和结构资料：1997 起点、可旋出笔尖、反向螺纹活塞总成，以及完整拆卸不属于例行维护的明确提醒。",
    locator:
      "introduction and Filling System & Maintenance section: threaded left-handed piston assembly and not recommended for routine maintenance",
  }),
  "phase32-pelikan-collectibles-m600": liveSource({
    key: "phase32-pelikan-collectibles-m600",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pelikan-collectibles",
    title: "Pelikan M600 & M605 Souverän",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M600-Basis/index.html",
    homepageUrl: "https://www.pelikan-collectibles.com/",
    author: "Dominic Rothemel",
    summary:
      "M600/M605 收藏表：1985–1997 Old Style、1997 年 9 月后加大平台、历史尺寸、2012 White Tortoise 和 M6xx 旁支。",
    locator:
      "M600 Old Style and M600 sections; production periods, dimensions, nib tables and 2012 White Tortoise entry",
  }),
  "phase32-pelikans-perch-m600-history": liveSource({
    key: "phase32-pelikans-perch-m600-history",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "A Tale of Two M600's",
    url: "https://thepelikansperch.com/2014/11/29/pelikan-m600-comparison/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2014-11-29",
    summary:
      "M600 两代历史：Old Style 与 post-1997 平台差异，并逐年整理 18C 单色、14C 双色和 18C 双色笔尖。",
    locator:
      "historical comparison and nib chronology: 1985-1988 18C mono, 1989 14C bi-color, 1990-1997 18C bi-color",
  }),
  "phase32-pelikans-perch-m600-review": liveSource({
    key: "phase32-pelikans-perch-m600-review",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "Review: Old & New Style M600's Head-to-Head",
    url: "https://thepelikansperch.com/2014/12/03/pelikan-m600-review/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2014-12-03",
    summary:
      "Old/New Style M600 对比实测，并明确两代活塞总成为 friction-fit，反复移除会带来损伤风险。",
    locator:
      "Filling System & Maintenance: both are friction fitted assemblies; removal is not straightforward and repeated attempts can damage them",
  }),
  "phase32-pelikan-catalog-2013-2014": liveSource({
    key: "phase32-pelikan-catalog-2013-2014",
    registryKey: "pelikan-historical-catalogs",
    registryName: "Pelikan historical catalog archive",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pelikan-catalog-2013-2014",
    title: "Pelikan Pen Catalogue 2013/2014",
    url: "https://www.pelikan-collectibles.de/de/Pelikan/Kataloge/2013-Katalog/Pelikan-Pen-Catalogue-2013-2014.pdf",
    homepageUrl: "https://www.pelikan-collectibles.de/",
    itemType: "catalog_pdf",
    author: "Pelikan",
    publishedAt: "2013",
    summary:
      "Pelikan 2013/2014 目录列出 Souverän 600 White tortoise，可确认它属于 M600 而非 M605；2012 年份另由直接写明年份的专业型号资料支持。",
    locator:
      "Souverän 600 White tortoise listing in the 2013/2014 product catalogue",
  }),
  "phase32-pelikans-perch-white-m600": liveSource({
    key: "phase32-pelikans-perch-white-m600",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "No White After Labor Day: How The M6xx Makes That A Hard Rule To Abide",
    url: "https://thepelikansperch.com/2018/08/14/pelikan-m600-white-fountain-pens/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2018-08-14",
    summary:
      "白色 M6xx 身份对照：2012 M600 Tortoiseshell-White 与 2017 M605 White-Transparent 分开；文章还给出白色 M6xx 家族级近似参考值 5.28 in、0.49 in、0.56 oz 与约 1.30 ml，不能当作 2012 配色的官方单支测量。",
    locator:
      "M600 Tortoiseshell White (2012) identity section; Dimensions & Weight gives family-level approximations of 5.28 in capped, 0.49 in diameter, 0.56 oz and around 1.30 ml; recap distinguishes M605 White Transparent (2017)",
  }),
  "phase32-pelikans-perch-modern-tortoise": liveSource({
    key: "phase32-pelikans-perch-modern-tortoise",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "A Treatise on the Modern Tortoise: 1980-2014",
    url: "https://thepelikansperch.com/2014/09/07/a-treatise-on-the-modern-tortoise-1980-2014/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2014-09-07",
    summary:
      "现代 Pelikan 龟纹版本史：2012 M600 White Tortoise、浅龟纹外观、14C/585 双色尖与 EF/F/M/B。",
    locator:
      "M600 White Tortoise section: 2012 release, appearance, 14C-585 bi-color nib and EF/F/M/B",
  }),
  "phase32-pure-pens-m6xx-specials": liveSource({
    key: "phase32-pure-pens-m6xx-specials",
    registryKey: "pure-pens-pelikan",
    registryName: "Pure Pens Pelikan reference",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "pure-pens",
    title: "M600 and M605 Special Editions",
    url: "https://www.pelikanpens.co.uk/blogs/news/m600-and-m605-special-editions",
    homepageUrl: "https://www.pelikanpens.co.uk/",
    author: "Ross Adams",
    summary:
      "M600/M605 特别版年份清单：2012 M600 Tortoiseshell White、2017 M605 White、2021 M605 Green White 与 2022 M605 Black Tortoiseshell。",
    locator:
      "M600 and M605 chronological tables and statement that M600/M605 editions use 14ct nibs",
  }),
  "phase32-m1000-commons": {
    key: "phase32-m1000-commons",
    registryKey: "wikimedia-commons-m-dreibelbis",
    registryName: "Wikimedia Commons — M Dreibelbis file",
    sourceType: "wikimedia",
    tier: "primary",
    independenceGroup: "m-dreibelbis-pelikan-m1000-2017",
    title: "File:Pelikan M1000 II (36753113884).jpg",
    url: "https://commons.wikimedia.org/wiki/File:Pelikan_M1000_II_(36753113884).jpg",
    homepageUrl: "https://commons.wikimedia.org/",
    itemType: "image",
    author: "M Dreibelbis",
    publishedAt: "2017-10-02",
    retrievedAt: RETRIEVED,
    summary:
      "M Dreibelbis 拍摄的一支 Pelikan M1000，原始 Flickr 照片由 Commons 转入并经 FlickreviewR 2 确认 CC BY 2.0。",
    allowedUse: "store_full",
    license: "cc-by-2.0",
    archiveUrl:
      "/images/library/wikimedia/pelikan-p0/pelikan-m1000-ii-m-dreibelbis.jpg",
    archiveLocator:
      "project-public-asset:pelikan-m1000-ii-m-dreibelbis.jpg;source-file=Pelikan_M1000_II_(36753113884).jpg;source-original=https://upload.wikimedia.org/wikipedia/commons/5/5b/Pelikan_M1000_II_%2836753113884%29.jpg;flickr=https://www.flickr.com/photos/68704638@N04/36753113884/;source-author=M_Dreibelbis;photo-date=2017-10-02T16:19;source-license=CC-BY-2.0;commons-review=FlickreviewR_2_2018-06-16;dimensions=5216x3632;bytes=4550417;resize=false;crop=false;color-edit=false;sha1=4b229931771cc1251f4301e38bc2d21a7b03f7ee;sha256=e96b05bb09b5b309cb23565e5af5c46768cfd771d1a3a6bbc72fe0452098e0dd;downloaded=2026-07-19",
  },
  "phase32-m600-site-original": {
    key: "phase32-m600-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Pelikan Souverän M600 现行规格——本站原创 factual SVG",
    url: "/images/library/site-original/pelikan-p0/pelikan-souveran-m600-editorial-diagram.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial studio",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创非写实规格图；把 M600 两份现行官方资料的 13.3–13.4 cm 长度范围、共同重量与笔尖选项排成信息卡，不是产品照片、机械图或比例参考。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/pelikan-p0/pelikan-souveran-m600-editorial-diagram.svg",
    archiveLocator:
      "project-public-asset:pelikan-souveran-m600-editorial-diagram.svg;site-original=true;factual-svg=true;product-photo=false;mechanical-diagram=false;to-scale=false;trademark-reproduction=false;created=2026-07-19",
  },
  "phase32-m600-white-site-original": {
    key: "phase32-m600-white-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title:
      "M600 Tortoiseshell-White (2012) 身份边界——本站原创 factual SVG",
    url: "/images/library/site-original/pelikan-p0/pelikan-m600-tortoiseshell-white-2012-editorial-diagram.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial studio",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创非写实身份图；标出 2012 M600 的年份、外观锚点、家族级近似规格与通用平台表差异，并列出三条 M605 排除项；不是产品照片、材料证据或该配色的精确测量。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/pelikan-p0/pelikan-m600-tortoiseshell-white-2012-editorial-diagram.svg",
    archiveLocator:
      "project-public-asset:pelikan-m600-tortoiseshell-white-2012-editorial-diagram.svg;site-original=true;factual-svg=true;product-photo=false;material-proof=false;mechanical-diagram=false;to-scale=false;trademark-reproduction=false;created=2026-07-19",
  },
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

const M1000_PACK: CuratedEntityPack = {
  key: "phase32-pelikan-souveran-m1000-v1",
  entityId: PHASE32_M1000_ID,
  expectedType: "pen",
  expectedSlug: "pelikan-souveran-m1000",
  canonicalName: "Pelikan Souverän M1000",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pelikan-m1000-publishable-content-2026-07-19.md",
  storyTitle: "Pelikan Souverän M1000：旗舰尺寸、1997 起点与维护边界",
  primarySourceKey: "pelikan-catalog-2025",
  depthTier: "A",
  aliases: [
    {
      alias: "Pelikan M1000",
      language: "en",
      sourceKey: "pelikan-catalog-2025",
    },
    {
      alias: "Pelikan Souverän M1000",
      language: "de",
      sourceKey: "pelikan-catalog-2025",
    },
    {
      alias: "Pelikan Souveran M1000",
      language: "en",
      sourceKey: "pelikan-catalog-2025",
    },
    {
      alias: "百利金 M1000",
      language: "zh",
      sourceKey: "pelikan-catalog-2025",
    },
  ],
  sources: [
    source("pelikan-catalog-2025"),
    source("phase32-pelikan-official-m1000-black"),
    source("pelikan-official-warranty"),
    source("phase32-pelikan-collectibles-m1000"),
    source("phase32-pelikans-perch-m1000"),
    source("phase32-m1000-commons"),
  ],
  variants: [
    {
      key: "current-ef",
      name: "EF 18K/750 双色金尖（现行）",
      notes: "现行标准目录尖号；不是固定毫米线宽承诺。",
      sourceKey: "pelikan-catalog-2025",
      variantKind: "nib",
    },
    {
      key: "current-f",
      name: "F 18K/750 双色金尖（现行）",
      notes: "现行标准目录尖号；具体线宽受纸墨与个体调校影响。",
      sourceKey: "pelikan-catalog-2025",
      variantKind: "nib",
    },
    {
      key: "current-m",
      name: "M 18K/750 双色金尖（现行）",
      notes: "现行标准目录尖号；不概括所有 M1000 特别版。",
      sourceKey: "pelikan-catalog-2025",
      variantKind: "nib",
    },
    {
      key: "current-b",
      name: "B 18K/750 双色金尖（现行）",
      notes: "现行标准目录尖号；历史或定制笔尖另行核验。",
      sourceKey: "pelikan-catalog-2025",
      variantKind: "nib",
    },
  ],
  scopes: [
    {
      key: "current-catalog",
      scopeKey: "pelikan-m1000-current-catalog-2025",
      validFrom: "2025",
      productionState: "current",
      nibScope: "18K/750 bi-color gold nib; EF, F, M, B",
      materialScope:
        "finish-specific; striped material claims do not cover every M1000 finish",
      editionScope: "standard M1000; excludes M1005 and named special editions",
    },
    {
      key: "history-1997",
      scopeKey: "pelikan-m1000-standard-production-1997-present",
      validFrom: "1997",
      productionState: "current",
      nibScope: "18 ct gold nib; individual examples require period verification",
      editionScope: "standard M1000 model history",
    },
    {
      key: "m1005-boundary",
      scopeKey: "pelikan-m1000-m1005-identity-boundary-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "M1005 is a separate silver-trim identity and is not a color variant of the standard M1000",
    },
    {
      key: "maintenance",
      scopeKey: "pelikan-m1000-threaded-piston-maintenance-boundary-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "threaded reverse-thread piston assembly is serviceable but not routine user maintenance",
    },
    {
      key: "photo",
      scopeKey: "pelikan-m1000-m-dreibelbis-photo-2017-10-02",
      validFrom: "2017-10-02",
      productionState: "historical",
      editionScope:
        "one photographed M1000 sample; not evidence for every finish, year or nib",
    },
  ],
  claims: [
    {
      key: "release-1997",
      predicate: "release_year",
      objectText: "Pelikan Souverän M1000 于 1997 年加入产品线。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase32-pelikan-collectibles-m1000",
      locator: "M1000 production table: since 1997",
      evidence: [
        {
          key: "collectibles-release",
          sourceKey: "phase32-pelikan-collectibles-m1000",
          scopeKey: "history-1997",
          locator: "M1000 | since 1997 | 18 ct gold nib",
        },
        {
          key: "perch-release",
          sourceKey: "phase32-pelikans-perch-m1000",
          scopeKey: "history-1997",
          locator: "introductory history identifies first introduction in 1997",
        },
      ],
    },
    {
      key: "current-specs",
      predicate: "current_dimensions_weight_capacity",
      objectText:
        "Pelikan 两份现行官方资料的闭帽长度相差 1 mm：2025 目录列 14.7 cm，黑色 M1000 产品页列 14.6 cm，因此记为 14.6–14.7 cm；两者均列 32.6 g，目录另列直径 14.1 mm、1.35 ml 与 XL。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "pelikan-catalog-2025",
      locator: "Souverän pen sizes compared, M1000 row",
      evidence: [
        {
          key: "catalog-current-specs",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "current-catalog",
          locator: "M1000: 14.7 cm, diameter 14.1 mm, 32.6 g, 1.35 ml, XL",
        },
        {
          key: "official-pdp-current-specs",
          sourceKey: "phase32-pelikan-official-m1000-black",
          scopeKey: "current-catalog",
          locator:
            "current black M1000 product facts: 14.6 cm capped and 32.6 g; official length differs from the 2025 catalogue by 1 mm",
        },
      ],
    },
    {
      key: "current-nib-filler",
      predicate: "current_nib_and_filling_system",
      objectText:
        "现行标准 M1000 使用 18K/750 双色金尖、EF/F/M/B 与差动活塞。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "pelikan-catalog-2025",
      locator: "current M1000 listings and differential piston description",
      evidence: [
        {
          key: "catalog-nib-filler",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "current-catalog",
          locator: "18K/750 bi-color EF/F/M/B and differential piston mechanism",
        },
      ],
    },
    {
      key: "m1005-separate",
      predicate: "related_model_boundary",
      objectText:
        "M1005 是同大尺寸基础上的独立银色饰件型号，不并入标准 M1000。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase32-pelikan-collectibles-m1000",
      locator: "separate M1000 and M1005 model sections",
      evidence: [
        {
          key: "collectibles-m1005-boundary",
          sourceKey: "phase32-pelikan-collectibles-m1000",
          scopeKey: "m1005-boundary",
          locator: "M1005 entries list separate silver trim and rhodinized nib identity",
        },
      ],
    },
    {
      key: "maintenance-boundary",
      predicate: "piston_service_boundary",
      objectText:
        "M1000 活塞总成为反向螺纹装入，但完整拆卸不是日常维护；正常清洁先用冷水吸排。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase32-pelikans-perch-m1000",
      locator: "Filling System & Maintenance and official care instructions",
      evidence: [
        {
          key: "perch-threaded-not-routine",
          sourceKey: "phase32-pelikans-perch-m1000",
          scopeKey: "maintenance",
          locator:
            "left-handed threaded piston assembly; no usual reason to remove and not recommended as routine maintenance",
        },
        {
          key: "official-cold-water",
          sourceKey: "pelikan-official-warranty",
          scopeKey: "maintenance",
          locator: "care pages: cold-water fill and empty cycles",
        },
      ],
    },
    {
      key: "photo-provenance",
      predicate: "primary_media_identity",
      objectText:
        "主图是 M Dreibelbis 于 2017-10-02 拍摄的一支 M1000，CC BY 2.0；不代表全部饰面、年份或笔尖。",
      factClass: "editorial",
      confidence: 0.99,
      sourceKey: "phase32-m1000-commons",
      locator: "Commons file metadata, Flickr provenance and license review",
      evidence: [
        {
          key: "commons-photo",
          sourceKey: "phase32-m1000-commons",
          scopeKey: "photo",
          locator:
            "File:Pelikan M1000 II (36753113884).jpg; author M Dreibelbis; 2017-10-02; CC BY 2.0",
        },
      ],
    },
  ],
  spec: {
    brandEntityId: PHASE32_PELIKAN_ID,
    values: {
      series_name: "Pelikan Souverän 1000（标准 M1000；不含 M1005）",
      release_year: "1997",
      origin_country: "德国（现行标准款制造与组装）",
      nib: "现行 18K/750 双色金尖；EF、F、M、B",
      fill_system: "内置差动活塞；官方目录容量约 1.35 ml",
      material:
        "按具体饰面记录；官方目录称典型条纹饰材以棉为原料按专用配方制成，不外推至所有 M1000",
      dimensions:
        "闭帽 14.6–14.7 cm（现行产品页与 2025 目录相差 1 mm）；直径 14.1 mm；XL",
      weight: "约 32.6 g（现行产品页与 2025 目录一致）",
      status: "现行标准 M1000；资料核验于 2026-07-19",
    },
    evidence: [
      {
        key: "brand",
        fieldKey: "brand_entity_id",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator: "Official Pelikan catalogue identifies Souverän M1000.",
      },
      {
        key: "series",
        fieldKey: "series_name",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator: "Souverän M1000 current model listing.",
      },
      {
        key: "release",
        fieldKey: "release_year",
        sourceKey: "phase32-pelikan-collectibles-m1000",
        scopeKey: "history-1997",
        locator: "M1000 production since 1997.",
      },
      {
        key: "origin",
        fieldKey: "origin_country",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator: "Current Fine Writing Instruments production context: Germany.",
      },
      {
        key: "nib",
        fieldKey: "nib",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator: "18K/750 bi-color nib; EF, F, M and B.",
      },
      {
        key: "fill",
        fieldKey: "fill_system",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator: "Differential piston and 1.35 ml catalogue capacity.",
      },
      {
        key: "material",
        fieldKey: "material",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator:
          "Catalogue page 26: the typical striped material is made out of cotton based on a formula developed specially for Pelikan; wording is material-production context, not textile surface.",
      },
      {
        key: "dimensions",
        fieldKey: "dimensions",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator:
          "2025 catalogue: 14.7 cm closed, diameter 14.1 mm and XL; current black product page separately lists 14.6 cm.",
      },
      {
        key: "dimensions-product-page",
        fieldKey: "dimensions",
        sourceKey: "phase32-pelikan-official-m1000-black",
        scopeKey: "current-catalog",
        locator:
          "Current black M1000 product page: 14.6 cm capped; the 1 mm official-source difference is retained as 14.6–14.7 cm.",
      },
      {
        key: "weight",
        fieldKey: "weight",
        sourceKey: "phase32-pelikan-official-m1000-black",
        scopeKey: "current-catalog",
        locator:
          "Current black product page and 2025 catalogue both list 32.6 g.",
      },
      {
        key: "status",
        fieldKey: "status",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator: "M1000 remains in the 2025 standard catalogue.",
      },
    ],
  },
  media: [
    {
      key: "m1000-m-dreibelbis-primary",
      title: "Pelikan M1000 实物样本（2017；M Dreibelbis）",
      sourceKey: "phase32-m1000-commons",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/5/5b/Pelikan_M1000_II_%2836753113884%29.jpg",
      localPath:
        "/images/library/wikimedia/pelikan-p0/pelikan-m1000-ii-m-dreibelbis.jpg",
      author: "M Dreibelbis",
      license: "cc-by-2.0",
      attributionText:
        "M Dreibelbis / Flickr / Wikimedia Commons，CC BY 2.0。2017-10-02 拍摄，2018-06-16 经 FlickreviewR 2 确认授权。本站保存 5216×3632 原文件，未裁切、未缩放、未改色。只代表照片中的一支 M1000，不代表全部饰面、年份、材料或笔尖。",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Pelikan_M1000_II_(36753113884).jpg",
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "m1000-release-1997",
      title: "Pelikan Souverän M1000 推出",
      eventType: "model_released",
      startDate: "1997",
      circa: false,
      description: "标准 M1000 生产起点；不把后来的 M1005 或特别版并入。",
      sourceKey: "phase32-pelikan-collectibles-m1000",
    },
  ],
};

const M600_PACK: CuratedEntityPack = {
  key: "phase32-pelikan-souveran-m600-v1",
  entityId: PHASE32_M600_ID,
  expectedType: "pen",
  expectedSlug: "pelikan-souveran-m600",
  canonicalName: "Pelikan Souverän M600",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pelikan-m600-publishable-content-2026-07-19.md",
  storyTitle: "Pelikan Souverän M600：同一编号下的 Old Style 与现行中号平台",
  primarySourceKey: "pelikan-catalog-2025",
  depthTier: "A",
  aliases: [
    {
      alias: "Pelikan M600",
      language: "en",
      sourceKey: "pelikan-catalog-2025",
    },
    {
      alias: "Pelikan Souverän M600",
      language: "de",
      sourceKey: "pelikan-catalog-2025",
    },
    {
      alias: "Pelikan Souveran M600",
      language: "en",
      sourceKey: "pelikan-catalog-2025",
    },
    {
      alias: "百利金 M600",
      language: "zh",
      sourceKey: "pelikan-catalog-2025",
    },
  ],
  sources: [
    source("pelikan-catalog-2025"),
    source("phase32-pelikan-official-m600-black"),
    source("pelikan-official-warranty"),
    source("phase32-pelikan-collectibles-m600"),
    source("phase32-pelikans-perch-m600-history"),
    source("phase32-pelikans-perch-m600-review"),
    source("phase32-m600-site-original"),
  ],
  variants: [
    {
      key: "old-style-platform",
      name: "M600 Old Style（1985–1997）",
      releaseYear: "1985",
      notes:
        "接近同期 M400 的较小平台；1997 年 9 月前结束。不能套用现行官方资料的 13.3–13.4 cm 范围。",
      sourceKey: "phase32-pelikan-collectibles-m600",
      variantKind: "edition_group",
    },
    {
      key: "old-style-18c-mono",
      name: "18C/750 单色金尖（1985–1988）",
      releaseYear: "1985",
      notes: "Old Style 原配笔尖阶段；换尖样本不能只靠刻印断年。",
      sourceKey: "phase32-pelikans-perch-m600-history",
      variantKind: "nib",
      parentVariantKey: "old-style-platform",
    },
    {
      key: "old-style-14c-bicolor",
      name: "14C/585 双色金尖（1989）",
      releaseYear: "1989",
      notes: "Old Style 的一年期目录阶段；不是看到 14C 就等于 post-1997。",
      sourceKey: "phase32-pelikans-perch-m600-history",
      variantKind: "nib",
      parentVariantKey: "old-style-platform",
    },
    {
      key: "old-style-18c-bicolor",
      name: "18C/750 双色金尖（1990–1997）",
      releaseYear: "1990",
      notes: "Old Style 后期原配阶段，止于 1997 年 9 月平台变化。",
      sourceKey: "phase32-pelikans-perch-m600-history",
      variantKind: "nib",
      parentVariantKey: "old-style-platform",
    },
    {
      key: "post-1997-platform",
      name: "M600 加大平台（1997-09 至今）",
      releaseYear: "1997-09",
      notes: "现行中号尺寸基础；标准笔尖为 14K/585 双色金尖。",
      sourceKey: "phase32-pelikan-collectibles-m600",
      variantKind: "edition_group",
    },
    ...(["EF", "F", "M", "B"] as const).map((width) => ({
      key: `current-${width.toLowerCase()}`,
      name: `${width} 14K/585 双色金尖（现行）`,
      notes: "现行标准目录尖号；不是固定毫米线宽承诺。",
      sourceKey: "pelikan-catalog-2025" as const,
      variantKind: "nib" as const,
      parentVariantKey: "post-1997-platform",
    })),
  ],
  scopes: [
    {
      key: "current-catalog",
      scopeKey: "pelikan-m600-current-catalog-2025",
      validFrom: "2025",
      productionState: "current",
      nibScope: "14K/585 bi-color gold nib; EF, F, M, B",
      materialScope:
        "finish-specific; typical striped material wording does not cover every finish",
      editionScope: "standard post-1997 M600; excludes M605 and other M6xx identities",
    },
    {
      key: "old-style",
      scopeKey: "pelikan-m600-old-style-1985-1997",
      validFrom: "1985",
      validTo: "1997-09",
      productionState: "historical",
      nibScope:
        "18C mono 1985-1988; 14C bi-color 1989; 18C bi-color 1990-1997",
      editionScope: "smaller Old Style platform near the contemporary M400 size",
    },
    {
      key: "nib-1985-1988",
      scopeKey: "pelikan-m600-old-style-nib-1985-1988",
      variantKey: "old-style-18c-mono",
      validFrom: "1985",
      validTo: "1988",
      productionState: "historical",
      nibScope: "18C/750 mono-color original catalogue configuration",
      editionScope: "original nib only; swapped nibs do not date a whole pen",
    },
    {
      key: "nib-1989",
      scopeKey: "pelikan-m600-old-style-nib-1989",
      variantKey: "old-style-14c-bicolor",
      validFrom: "1989",
      validTo: "1989",
      productionState: "historical",
      nibScope: "14C/585 bi-color original catalogue configuration",
      editionScope: "original nib only; swapped nibs do not date a whole pen",
    },
    {
      key: "nib-1990-1997",
      scopeKey: "pelikan-m600-old-style-nib-1990-1997",
      variantKey: "old-style-18c-bicolor",
      validFrom: "1990",
      validTo: "1997-09",
      productionState: "historical",
      nibScope: "18C/750 bi-color original catalogue configuration",
      editionScope: "original nib only; swapped nibs do not date a whole pen",
    },
    {
      key: "post-1997",
      scopeKey: "pelikan-m600-enlarged-platform-1997-09-present",
      variantKey: "post-1997-platform",
      validFrom: "1997-09",
      productionState: "current",
      nibScope: "standard 14K/585 bi-color gold nib",
      editionScope: "enlarged M600 platform; specific special editions retain their own identity",
    },
    {
      key: "maintenance",
      scopeKey: "pelikan-m600-press-fit-piston-maintenance-boundary-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "Old and post-1997 M600 piston assemblies are friction-fit; not routine user removal",
    },
    {
      key: "editorial-media",
      scopeKey: "pelikan-m600-editorial-diagram-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "site-original factual SVG; not a product photo, mechanical diagram or scale reference",
    },
  ],
  claims: [
    {
      key: "two-platform-history",
      predicate: "platform_history",
      objectText:
        "M600 Old Style 为 1985–1997 的较小平台；1997 年 9 月后改为延续至今的加大平台。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase32-pelikan-collectibles-m600",
      locator: "Old Style and current M600 production tables",
      evidence: [
        {
          key: "collectibles-old-style",
          sourceKey: "phase32-pelikan-collectibles-m600",
          scopeKey: "old-style",
          locator:
            "Old Style 1985-1997; only M600 from 09/1997 was dimensioned larger",
        },
        {
          key: "perch-post-1997",
          sourceKey: "phase32-pelikans-perch-m600-review",
          scopeKey: "post-1997",
          locator: "head-to-head comparison of pre-1997 and post-1997 M600 platforms",
        },
      ],
    },
    {
      key: "old-style-nib-chronology",
      predicate: "historical_nib_chronology",
      objectText:
        "原配 Old Style 笔尖分为 1985–1988 18C/750 单色、1989 14C/585 双色、1990–1997 18C/750 双色。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase32-pelikans-perch-m600-history",
      locator: "Old Style logo nib chronology",
      evidence: [
        {
          key: "perch-18c-mono",
          sourceKey: "phase32-pelikans-perch-m600-history",
          scopeKey: "nib-1985-1988",
          locator: "18C-750 monotone gold from 1985-1988",
        },
        {
          key: "perch-14c-bicolor",
          sourceKey: "phase32-pelikans-perch-m600-history",
          scopeKey: "nib-1989",
          locator: "14C-585 two-tone gold in 1989",
        },
        {
          key: "perch-18c-bicolor",
          sourceKey: "phase32-pelikans-perch-m600-history",
          scopeKey: "nib-1990-1997",
          locator: "18C-750 two-tone gold from 1990 until the 1997 design change",
        },
      ],
    },
    {
      key: "current-specs",
      predicate: "current_dimensions_weight_capacity",
      objectText:
        "Pelikan 两份现行官方资料的闭帽长度相差 1 mm：2025 目录列 13.4 cm，黑色 M600 产品页列 13.3 cm，因此记为 13.3–13.4 cm；两者均列 16.4 g，目录另列直径 12.4 mm、1.30 ml 与 M。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "pelikan-catalog-2025",
      locator: "Souverän pen sizes compared, M600 row",
      evidence: [
        {
          key: "catalog-current-specs",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "current-catalog",
          locator: "M600: 13.4 cm, diameter 12.4 mm, 16.4 g, 1.3 ml, M",
        },
        {
          key: "official-pdp-current-specs",
          sourceKey: "phase32-pelikan-official-m600-black",
          scopeKey: "current-catalog",
          locator:
            "current black M600 product facts: 13.3 cm capped and 16.4 g; official length differs from the 2025 catalogue by 1 mm",
        },
      ],
    },
    {
      key: "current-nib-filler",
      predicate: "current_nib_and_filling_system",
      objectText:
        "现行标准 M600 使用 14K/585 双色金尖、EF/F/M/B 与内置活塞。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "pelikan-catalog-2025",
      locator: "current M600 listings and Souverän piston description",
      evidence: [
        {
          key: "catalog-current-nib-filler",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "current-catalog",
          locator: "14K/585 bi-color EF/F/M/B and piston filling system",
        },
      ],
    },
    {
      key: "press-fit-maintenance",
      predicate: "piston_service_boundary",
      objectText:
        "M600 Old Style 与 post-1997 活塞总成都为 friction-fit；反复移除会带来损伤风险，不是日常维护。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase32-pelikans-perch-m600-review",
      locator: "Filling System & Maintenance section",
      evidence: [
        {
          key: "perch-friction-fit",
          sourceKey: "phase32-pelikans-perch-m600-review",
          scopeKey: "maintenance",
          locator:
            "both are friction fitted assemblies; removal is not straightforward and repeated attempts can lead to damage",
        },
        {
          key: "official-cold-water",
          sourceKey: "pelikan-official-warranty",
          scopeKey: "maintenance",
          locator: "care pages: normal cleaning uses cold-water fill and empty cycles",
        },
      ],
    },
    {
      key: "editorial-media-boundary",
      predicate: "primary_media_identity",
      objectText:
        "主图是本站原创 factual SVG，只呈现现行规格索引；不是产品照片、机械图或比例参考。",
      factClass: "editorial",
      confidence: 0.99,
      sourceKey: "phase32-m600-site-original",
      locator: "checked-in SVG title, description and on-image disclaimer",
      evidence: [
        {
          key: "site-original-diagram",
          sourceKey: "phase32-m600-site-original",
          scopeKey: "editorial-media",
          locator:
            "SVG states non-product-photo, non-mechanical-diagram and not-to-scale boundaries",
        },
      ],
    },
  ],
  spec: {
    brandEntityId: PHASE32_PELIKAN_ID,
    values: {
      series_name:
        "Pelikan Souverän 600（M600 主线；含 Old Style 与 post-1997 平台分期）",
      release_year: "1985；现行加大平台自 1997-09",
      origin_country: "德国（现行标准款制造与组装）",
      nib: "现行 14K/585 双色金尖；EF、F、M、B；Old Style 笔尖按年代另列",
      fill_system:
        "内置活塞；现行官方目录容量约 1.30 ml；活塞总成为 press-fit",
      material: "按具体饰面记录；条纹材料说明不外推至纯色或特别版",
      dimensions:
        "现行闭帽 13.3–13.4 cm（产品页与 2025 目录相差 1 mm）；直径 12.4 mm；M",
      weight: "约 16.4 g（现行产品页与 2025 目录一致）",
      status: "现行标准 M600；历史 Old Style 为 1985–1997",
    },
    evidence: [
      {
        key: "brand",
        fieldKey: "brand_entity_id",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator: "Official Pelikan catalogue identifies Souverän M600.",
      },
      {
        key: "series",
        fieldKey: "series_name",
        sourceKey: "phase32-pelikan-collectibles-m600",
        scopeKey: "post-1997",
        locator: "M600 Old Style and M600 are one documented model history with two platforms.",
      },
      {
        key: "release",
        fieldKey: "release_year",
        sourceKey: "phase32-pelikan-collectibles-m600",
        scopeKey: "old-style",
        locator: "Old Style available from 1985; enlarged M600 from 09/1997.",
      },
      {
        key: "origin",
        fieldKey: "origin_country",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator: "Current Fine Writing Instruments production context: Germany.",
      },
      {
        key: "nib-current",
        fieldKey: "nib",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator: "Current 14K/585 bi-color nib; EF, F, M and B.",
      },
      {
        key: "nib-history",
        fieldKey: "nib",
        sourceKey: "phase32-pelikans-perch-m600-history",
        scopeKey: "old-style",
        locator: "Old Style three-stage original nib chronology.",
      },
      {
        key: "fill-current",
        fieldKey: "fill_system",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator: "Piston filler and 1.3 ml current catalogue capacity.",
      },
      {
        key: "fill-service",
        fieldKey: "fill_system",
        sourceKey: "phase32-pelikans-perch-m600-review",
        scopeKey: "maintenance",
        locator: "Old and new M600 use friction-fit piston assemblies.",
      },
      {
        key: "material",
        fieldKey: "material",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator:
          "Catalogue page 26 typical striped material production wording is finish-specific and not universal.",
      },
      {
        key: "dimensions",
        fieldKey: "dimensions",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-catalog",
        locator:
          "2025 catalogue: 13.4 cm closed, diameter 12.4 mm and M; current black product page separately lists 13.3 cm.",
      },
      {
        key: "dimensions-product-page",
        fieldKey: "dimensions",
        sourceKey: "phase32-pelikan-official-m600-black",
        scopeKey: "current-catalog",
        locator:
          "Current black M600 product page: 13.3 cm capped; the 1 mm official-source difference is retained as 13.3–13.4 cm.",
      },
      {
        key: "weight",
        fieldKey: "weight",
        sourceKey: "phase32-pelikan-official-m600-black",
        scopeKey: "current-catalog",
        locator:
          "Current black product page and 2025 catalogue both list 16.4 g.",
      },
      {
        key: "status",
        fieldKey: "status",
        sourceKey: "phase32-pelikan-collectibles-m600",
        scopeKey: "post-1997",
        locator: "M600 since 09/1997; Old Style historical production 1985-1997.",
      },
    ],
  },
  media: [
    {
      key: "m600-editorial-primary",
      title: "Pelikan Souverän M600 现行规格编辑图（非产品照片）",
      sourceKey: "phase32-m600-site-original",
      imageUrl:
        "/images/library/site-original/pelikan-p0/pelikan-souveran-m600-editorial-diagram.svg",
      localPath:
        "/images/library/site-original/pelikan-p0/pelikan-souveran-m600-editorial-diagram.svg",
      author: "Fountain Pen Graph editorial studio",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph editorial studio，site-original。本站原创 factual SVG，仅把已核验的现行 M600 尺寸与笔尖选项排成信息卡；非 Pelikan 产品实拍、非机械结构图、不按比例，未复刻 Pelikan 商标，颜色与轮廓不可用于鉴定。",
      sourceUrl:
        "/images/library/site-original/pelikan-p0/pelikan-souveran-m600-editorial-diagram.svg",
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "m600-old-style-release",
      title: "M600 Old Style 推出",
      eventType: "model_released",
      startDate: "1985",
      circa: false,
      description: "接近同期 M400 的较小尺寸平台。",
      sourceKey: "phase32-pelikan-collectibles-m600",
    },
    {
      key: "m600-14c-1989",
      title: "Old Style 改用 14C/585 双色尖",
      eventType: "design_milestone",
      startDate: "1989",
      circa: false,
      description: "一年期笔尖阶段；仅对原配笔尖有断年意义。",
      sourceKey: "phase32-pelikans-perch-m600-history",
    },
    {
      key: "m600-18c-1990",
      title: "Old Style 改用 18C/750 双色尖",
      eventType: "design_milestone",
      startDate: "1990",
      circa: false,
      description: "延续至 1997 年平台变化；换尖样本另行判断。",
      sourceKey: "phase32-pelikans-perch-m600-history",
    },
    {
      key: "m600-enlarged-1997",
      title: "M600 加大平台启用",
      eventType: "design_milestone",
      startDate: "1997-09",
      circa: false,
      description: "尺寸加大并以 14K/585 双色尖作为标准路线。",
      sourceKey: "phase32-pelikan-collectibles-m600",
    },
  ],
};

const M600_TORTOISESHELL_WHITE_2012_PACK: CuratedEntityPack = {
  key: "phase32-pelikan-m600-tortoiseshell-white-2012-v1",
  entityId: PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
  expectedType: "pen",
  expectedSlug: "pelikan-souveran-m600-tortoiseshell-white-2012",
  canonicalName: "Pelikan Souverän M600 Tortoiseshell-White (2012)",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pelikan-m600-tortoiseshell-white-2012-publishable-content-2026-07-19.md",
  storyTitle:
    "Pelikan Souverän M600 Tortoiseshell-White (2012)：别再叫成 M605 白乌龟",
  primarySourceKey: "phase32-pelikan-catalog-2013-2014",
  depthTier: "A",
  aliases: [
    {
      alias: "Pelikan M600 Tortoiseshell-White",
      language: "en",
      sourceKey: "phase32-pelikan-catalog-2013-2014",
    },
    {
      alias: "Pelikan M600 White Tortoise",
      language: "en",
      sourceKey: "phase32-pelikans-perch-white-m600",
    },
    {
      alias: "Pelikan Souverän 600 White tortoise",
      language: "en",
      sourceKey: "phase32-pelikan-catalog-2013-2014",
    },
    {
      alias: "百利金 M600 白乌龟",
      language: "zh",
      sourceKey: "phase32-pelikans-perch-white-m600",
    },
    {
      alias: "百利金 M600 白龟",
      language: "zh",
      sourceKey: "phase32-pelikans-perch-white-m600",
    },
  ],
  sources: [
    source("phase32-pelikan-catalog-2013-2014"),
    source("phase32-pelikan-collectibles-m600"),
    source("phase32-pelikans-perch-white-m600"),
    source("phase32-pelikans-perch-modern-tortoise"),
    source("phase32-pelikans-perch-m600-review"),
    source("phase32-pure-pens-m6xx-specials"),
    source("pelikan-official-warranty"),
    source("phase32-m600-white-site-original"),
  ],
  variants: [
    {
      key: "white-tortoise-2012",
      name: "Tortoiseshell-White（2012）",
      releaseYear: "2012",
      notes:
        "浅色 tortoise-striped 笔杆、白帽与金色饰件；正式归属 M600 的特别生产款，不是 M605。",
      sourceKey: "phase32-pelikans-perch-white-m600",
      variantKind: "color",
    },
  ],
  scopes: [
    {
      key: "edition-2012",
      scopeKey: "pelikan-m600-tortoiseshell-white-2012-edition",
      variantKey: "white-tortoise-2012",
      validFrom: "2012",
      validTo: "2012",
      productionState: "historical",
      nibScope: "14 ct bi-color gold nib; EF, F, M, B",
      materialScope:
        "light tortoise-striped barrel and white components; exact polymer not verified",
      editionScope:
        "M600 Tortoiseshell-White special production; gold trim; excludes M400 and every M605 identity",
    },
    {
      key: "family-measurement-context",
      scopeKey: "pelikan-m600-white-family-approximate-measurement-context",
      validFrom: "2012",
      validTo: "2017",
      productionState: "historical",
      editionScope:
        "white M6xx article measurements are family-level approximations, not official measurements of the 2012 colorway; generic historical M600 platform tables differ",
    },
    {
      key: "material-boundary",
      scopeKey: "pelikan-m600-tortoiseshell-white-2012-material-boundary",
      validFrom: "2012",
      productionState: "historical",
      materialScope:
        "finish appearance is verified; celluloid or another exact polymer is not verified",
      editionScope: "do not infer material from the Tortoiseshell name",
    },
    {
      key: "m605-boundaries",
      scopeKey: "pelikan-m600-white-2012-vs-m605-2017-2022-boundary",
      validFrom: "2012",
      validTo: "2022",
      productionState: "historical",
      editionScope:
        "distinct from M605 White-Transparent 2017, M605 Green-White 2021 and M605 Black Tortoise 2022",
    },
    {
      key: "maintenance",
      scopeKey:
        "pelikan-m600-tortoiseshell-white-2012-press-fit-maintenance-boundary",
      validFrom: "2012",
      productionState: "historical",
      editionScope:
        "M600 friction-fit piston assembly; normal cleaning does not require tail removal",
    },
    {
      key: "editorial-media",
      scopeKey:
        "pelikan-m600-tortoiseshell-white-2012-editorial-diagram-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "site-original factual SVG; not a product photo, material proof, mechanical diagram or scale reference",
    },
  ],
  claims: [
    {
      key: "identity-2012-m600",
      predicate: "edition_identity",
      objectText:
        "Tortoiseshell-White 是 2012 年的 M600 特别生产款：浅色龟纹条纹笔杆、白帽、金色饰件与 14ct 笔尖。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase32-pelikans-perch-white-m600",
      locator: "M600 Tortoiseshell White (2012) identity section",
      evidence: [
        {
          key: "catalog-identity",
          sourceKey: "phase32-pelikan-catalog-2013-2014",
          scopeKey: "edition-2012",
          locator: "2013/2014 catalogue: Souverän 600 White tortoise",
        },
        {
          key: "perch-appearance",
          sourceKey: "phase32-pelikans-perch-white-m600",
          scopeKey: "edition-2012",
          locator:
            "M600 Tortoiseshell White (2012): honey-green tortoise barrel, white components and gold furniture",
        },
      ],
    },
    {
      key: "historical-specs",
      predicate: "edition_dimensions_weight_capacity",
      objectText:
        "没有来源提供 2012 配色的官方单支测量。白色 M6xx 专文给出家族级近似参考：闭帽 5.28 in（约 134.1 mm）、直径 0.49 in（约 12.45 mm）、0.56 oz（约 15.9 g）、墨量约 1.30 ml；通用历史 M600 平台表另列 133 mm、12.4 mm、18 g、1.30 ml，两组资料存在差异，均不得冒充该配色精确值。",
      factClass: "core",
      confidence: 0.95,
      sourceKey: "phase32-pelikans-perch-white-m600",
      locator: "Dimensions & Weight section; family-level approximate measurements",
      evidence: [
        {
          key: "perch-white-family-approximation",
          sourceKey: "phase32-pelikans-perch-white-m600",
          scopeKey: "family-measurement-context",
          locator:
            "white M6xx article: 5.28 in capped, 0.49 in diameter, 0.56 oz and around 1.30 ml; treated as family-level approximate, not an exact 2012 SKU measurement",
        },
        {
          key: "collectibles-generic-platform-table",
          sourceKey: "phase32-pelikan-collectibles-m600",
          scopeKey: "family-measurement-context",
          locator:
            "generic historical M600 platform table: 133 mm capped, 12.4 mm diameter, 18.0 g and 1.30 ml; not an edition-specific White Tortoise measurement",
        },
      ],
    },
    {
      key: "nib-14ct",
      predicate: "edition_nib",
      objectText:
        "2012 M600 Tortoiseshell-White 使用 14ct 双色金尖，资料列出 EF/F/M/B。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase32-pelikans-perch-modern-tortoise",
      locator: "M600 White Tortoise nib description",
      evidence: [
        {
          key: "perch-nib",
          sourceKey: "phase32-pelikans-perch-modern-tortoise",
          scopeKey: "edition-2012",
          locator: "two-toned 14C-585 gold nibs in EF, F, M and B",
        },
        {
          key: "pure-pens-nib",
          sourceKey: "phase32-pure-pens-m6xx-specials",
          scopeKey: "edition-2012",
          locator: "M600 Tortoiseshell white 2012 and 14ct M600/M605 nib statement",
        },
      ],
    },
    {
      key: "material-restraint",
      predicate: "material_verification_boundary",
      objectText:
        "来源可确认浅色 tortoise-striped 外观与白色部件，但不足以把具体材料标成 celluloid。",
      factClass: "editorial",
      confidence: 0.97,
      sourceKey: "phase32-pelikan-catalog-2013-2014",
      locator: "catalogue finish name and specialist appearance description",
      evidence: [
        {
          key: "catalog-finish-not-polymer",
          sourceKey: "phase32-pelikan-catalog-2013-2014",
          scopeKey: "material-boundary",
          locator:
            "catalogue identifies White tortoise finish but supplies no qualifying celluloid specification",
        },
        {
          key: "perch-appearance-not-polymer",
          sourceKey: "phase32-pelikans-perch-white-m600",
          scopeKey: "material-boundary",
          locator:
            "appearance description supports light tortoise pattern and white components, not a celluloid material claim",
        },
      ],
    },
    {
      key: "m605-separation",
      predicate: "related_model_boundary",
      objectText:
        "2012 M600 Tortoiseshell-White 与 2017 M605 White-Transparent、2021 M605 Green-White、2022 M605 Black Tortoise 是四条独立身份。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase32-pelikans-perch-white-m600",
      locator: "white M6xx recap and chronological special-edition list",
      evidence: [
        {
          key: "perch-2012-vs-2017",
          sourceKey: "phase32-pelikans-perch-white-m600",
          scopeKey: "m605-boundaries",
          locator:
            "recap separately lists M600 Tortoiseshell White 2012 and M605 White Transparent 2017",
        },
        {
          key: "pure-pens-2021-2022",
          sourceKey: "phase32-pure-pens-m6xx-specials",
          scopeKey: "m605-boundaries",
          locator:
            "separate chronological rows: M600 Tortoiseshell white 2012; M605 White 2017; Green White 2021; Black Tortoiseshell 2022",
        },
      ],
    },
    {
      key: "press-fit-maintenance",
      predicate: "piston_service_boundary",
      objectText:
        "2012 M600 使用 friction-fit 活塞总成；正常冷水清洁不要求从尾端拆除。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase32-pelikans-perch-m600-review",
      locator: "M600 Filling System & Maintenance and official care pages",
      evidence: [
        {
          key: "perch-friction-fit",
          sourceKey: "phase32-pelikans-perch-m600-review",
          scopeKey: "maintenance",
          locator:
            "M600 friction-fitted assembly removal is not straightforward and repeated attempts risk damage",
        },
        {
          key: "official-cold-water",
          sourceKey: "pelikan-official-warranty",
          scopeKey: "maintenance",
          locator: "care pages: empty and cycle cold water after non-use",
        },
      ],
    },
    {
      key: "editorial-media-boundary",
      predicate: "primary_media_identity",
      objectText:
        "主图是本站原创 factual SVG，只说明 2012 M600 身份与排除项；不是产品照片或材料证据。",
      factClass: "editorial",
      confidence: 0.99,
      sourceKey: "phase32-m600-white-site-original",
      locator: "checked-in SVG title, description and on-image disclaimer",
      evidence: [
        {
          key: "site-original-diagram",
          sourceKey: "phase32-m600-white-site-original",
          scopeKey: "editorial-media",
          locator:
            "SVG states non-product-photo, non-material-proof, non-mechanical-diagram and not-to-scale boundaries",
        },
      ],
    },
  ],
  spec: {
    brandEntityId: PHASE32_PELIKAN_ID,
    values: {
      series_name: "Souverän 600 — M600 Tortoiseshell-White (2012)",
      release_year: "2012",
      origin_country: "德国（M600 平台；2012 特别生产款）",
      nib: "14ct 双色金尖；EF、F、M、B（2012 款）",
      fill_system:
        "内置活塞；白色 M6xx 专文给出家族级近似容量约 1.30 ml；活塞总成为 press-fit",
      material:
        "浅色 tortoise-striped 笔杆与白色笔帽、握位、尾钮；具体材料未充分核实，不标 celluloid",
      dimensions:
        "白色 M6xx 家族级近似参考：闭帽约 134.1 mm（5.28 in）、直径约 12.45 mm（0.49 in）；非 2012 配色官方单支测量",
      weight:
        "白色 M6xx 家族级近似约 15.9 g（0.56 oz）；通用历史 M600 表另列 18 g，两者有差异",
      status: "2012 特别生产款；已停产；不与 M605 2017/2021/2022 合并",
    },
    evidence: [
      {
        key: "brand",
        fieldKey: "brand_entity_id",
        sourceKey: "phase32-pelikan-catalog-2013-2014",
        scopeKey: "edition-2012",
        locator: "Pelikan catalogue Souverän 600 White tortoise listing.",
      },
      {
        key: "series",
        fieldKey: "series_name",
        sourceKey: "phase32-pelikan-catalog-2013-2014",
        scopeKey: "edition-2012",
        locator: "Souverän 600 White tortoise is listed under M600.",
      },
      {
        key: "release",
        fieldKey: "release_year",
        sourceKey: "phase32-pelikans-perch-white-m600",
        scopeKey: "edition-2012",
        locator: "M600 Tortoiseshell White (2012).",
      },
      {
        key: "origin",
        fieldKey: "origin_country",
        sourceKey: "phase32-pelikan-catalog-2013-2014",
        scopeKey: "edition-2012",
        locator: "Pelikan Souverän 600 catalogue production context: Germany.",
      },
      {
        key: "nib",
        fieldKey: "nib",
        sourceKey: "phase32-pelikans-perch-modern-tortoise",
        scopeKey: "edition-2012",
        locator: "14C-585 bi-color gold nib; EF, F, M and B.",
      },
      {
        key: "fill",
        fieldKey: "fill_system",
        sourceKey: "phase32-pelikans-perch-white-m600",
        scopeKey: "family-measurement-context",
        locator:
          "White M6xx article gives around 1.30 ml as a family-level approximation, not an exact 2012 SKU measurement.",
      },
      {
        key: "fill-service",
        fieldKey: "fill_system",
        sourceKey: "phase32-pelikans-perch-m600-review",
        scopeKey: "maintenance",
        locator: "M600 friction-fit piston assembly service boundary.",
      },
      {
        key: "material",
        fieldKey: "material",
        sourceKey: "phase32-pelikan-catalog-2013-2014",
        scopeKey: "material-boundary",
        locator:
          "Catalogue qualifies the White tortoise finish identity but not a celluloid polymer claim; field records appearance and explicit uncertainty.",
      },
      {
        key: "dimensions",
        fieldKey: "dimensions",
        sourceKey: "phase32-pelikans-perch-white-m600",
        scopeKey: "family-measurement-context",
        locator:
          "Family-level approximate reference: 5.28 in capped (about 134.1 mm) and 0.49 in diameter (about 12.45 mm); not an official 2012 colorway measurement.",
      },
      {
        key: "weight",
        fieldKey: "weight",
        sourceKey: "phase32-pelikans-perch-white-m600",
        scopeKey: "family-measurement-context",
        locator:
          "Family-level approximate reference: 0.56 oz (about 15.9 g); generic historical M600 platform table separately lists 18.0 g.",
      },
      {
        key: "weight-generic-platform-conflict",
        fieldKey: "weight",
        sourceKey: "phase32-pelikan-collectibles-m600",
        scopeKey: "family-measurement-context",
        locator:
          "Generic historical M600 platform table lists 18.0 g; retained as a conflicting platform-level value, not assigned to the 2012 colorway.",
      },
      {
        key: "status",
        fieldKey: "status",
        sourceKey: "phase32-pure-pens-m6xx-specials",
        scopeKey: "m605-boundaries",
        locator:
          "2012 M600 Tortoiseshell white appears as a past special edition distinct from later M605 entries.",
      },
    ],
  },
  media: [
    {
      key: "m600-white-2012-editorial-primary",
      title:
        "M600 Tortoiseshell-White (2012) 身份编辑图（非产品照片）",
      sourceKey: "phase32-m600-white-site-original",
      imageUrl:
        "/images/library/site-original/pelikan-p0/pelikan-m600-tortoiseshell-white-2012-editorial-diagram.svg",
      localPath:
        "/images/library/site-original/pelikan-p0/pelikan-m600-tortoiseshell-white-2012-editorial-diagram.svg",
      author: "Fountain Pen Graph editorial studio",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph editorial studio，site-original。本站原创 factual SVG，标出 2012 M600 Tortoiseshell-White 的身份、家族级近似规格、通用平台表差异和 M605 排除项；非 Pelikan 产品实拍、非材料证据、非该配色精确测量、非机械结构图、不按比例，未复刻 Pelikan 商标。",
      sourceUrl:
        "/images/library/site-original/pelikan-p0/pelikan-m600-tortoiseshell-white-2012-editorial-diagram.svg",
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "m600-white-tortoise-2012",
      title: "M600 Tortoiseshell-White 特别款",
      eventType: "model_released",
      startDate: "2012",
      circa: false,
      description: "金色饰件的 M600 特别生产款，不是 M605。",
      sourceKey: "phase32-pelikans-perch-white-m600",
    },
    {
      key: "m605-white-transparent-2017",
      title: "M605 White-Transparent 推出",
      eventType: "design_milestone",
      startDate: "2017",
      circa: false,
      description: "独立 M605 白／透明路线，不回写为 2012 M600 的版本。",
      sourceKey: "phase32-pelikans-perch-white-m600",
    },
    {
      key: "m605-green-white-2021",
      title: "M605 Green-White 推出",
      eventType: "design_milestone",
      startDate: "2021",
      circa: false,
      description: "独立 M605 身份；中文昵称不能覆盖型号。",
      sourceKey: "phase32-pure-pens-m6xx-specials",
    },
    {
      key: "m605-black-tortoise-2022",
      title: "M605 Black Tortoise 推出",
      eventType: "design_milestone",
      startDate: "2022",
      circa: false,
      description: "独立 M605 黑龟纹身份，不并入 2012 M600。",
      sourceKey: "phase32-pure-pens-m6xx-specials",
    },
  ],
};

const PELIKAN_BRAND_PACK = phase27PelikanPacks.find(
  (pack) => pack.entityId === PHASE32_PELIKAN_ID && pack.expectedType === "brand",
);

if (!PELIKAN_BRAND_PACK) {
  throw new Error("Phase 32 requires the reviewed Phase 27 Pelikan brand pack.");
}

const PHASE32_PELIKAN_BRAND_PACK = structuredClone(PELIKAN_BRAND_PACK);

export const phase32PelikanP0Packs: CuratedEntityPack[] = [
  PHASE32_PELIKAN_BRAND_PACK,
  M1000_PACK,
  M600_PACK,
  M600_TORTOISESHELL_WHITE_2012_PACK,
];
