import type {
  CuratedClaim,
  CuratedConflict,
  CuratedEntityPack,
  CuratedSource,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase432BrandDepthRefreshPacks } from "./phase432-brand-depth-refresh";

export const PHASE600_YSTUDIO_BRAND_ID = "phase141-brand-ystudio";
export const PHASE600_EXISTING_CLASSIC_ID = "phase141-ystudio-classic-revolve";
export const PHASE600_IDS = {
  portable: "phase600-ystudio-classic-revolve-portable",
  desk: "phase600-ystudio-classic-revolve-desk",
  resin: "phase600-ystudio-resin-fountain-pen",
  yakihaku: "phase600-ystudio-classic-renaissance-yakihaku",
  kazariKanagu: "phase600-ystudio-classic-renaissance-kazari-kanagu",
} as const;
export const PHASE600_SLUGS = {
  portable: "ystudio-classic-revolve-portable",
  desk: "ystudio-classic-revolve-desk",
  resin: "ystudio-resin-fountain-pen",
  yakihaku: "ystudio-classic-renaissance-yakihaku",
  kazariKanagu: "ystudio-classic-renaissance-kazari-kanagu",
} as const;

type FamilyKey = keyof typeof PHASE600_IDS;
const RETRIEVED = "2026-08-12";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  registryKey: string;
  registryName: string;
  independenceGroup: string;
  publishedAt?: string;
}): CuratedSource {
  return {
    ...input,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function official(
  key: string,
  title: string,
  url: string,
  summary: string,
  locator: string,
): CuratedSource {
  return source({
    key,
    title,
    url,
    summary,
    locator,
    sourceType: "official",
    tier: "primary",
    registryKey: "ystudio-official-phase600",
    registryName: "YSTUDIO official",
    independenceGroup: "ystudio-official",
  });
}

function secondary(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  registryKey: string;
  registryName: string;
  publishedAt: string;
}): CuratedSource {
  return source({
    ...input,
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: input.registryKey,
  });
}

const common = {
  fountainCollection: official(
    "phase600-ystudio-fountain-collection",
    "YSTUDIO Unique Fountain Pens",
    "https://www.ystudiostyle.com/collections/fountain-pen",
    "官方钢笔集合将 Classic、Brassing、Resin、Craft 分为四条线，并列当前 Portable、Desk、Resin、YAKIHAKU、KAZARI KANAGU 商品入口。",
    "four-series introduction and current fountain-pen product cards",
  ),
  about: official(
    "phase600-ystudio-about-awards",
    "About YSTUDIO",
    "https://www.ystudiostyle.com/pages/about-us",
    "官方说明 Designed and Made in Taiwan，并记录 Brassing Portable 的 2017／2018 奖项与 YAKIHAKU Pen 的 2019 Golden Pin。",
    "Designed and Made in Taiwan plus Awards and Recognition rows",
  ),
  renaissance: official(
    "phase600-ystudio-renaissance-collection",
    "YSTUDIO Classic Renaissance Series",
    "https://www.ystudiostyle.com/collections/ystudio-classic-renaissance-series",
    "官方系列页把与日本工艺师合作的 YAKIHAKU、KAZARI KANAGU 钢笔与滚珠笔、桌面版本和配件分开。",
    "series description and distinct product cards",
  ),
  nishijinCraft: secondary({
    key: "phase600-kyoto-travel-nishijin-craft",
    title: "Kyoto Travel: From Silkworm Cocoons to Nishijin-ori Fabric",
    url: "https://kyoto.travel/en/travel-inspiration/from-silkworm-cocoons-to-nishijinori-fabric/",
    summary:
      "京都市官方旅游指南的工艺采访解释 Nishijin-ori 的分工、染色丝线与 hikibaku 金箔织入工具；只用于 YAKIHAKU 合作所处的西阵箔材背景，不证明钢笔规格。",
    locator: "luxury fabric, hikibaku gold-leaf tool and divided artisan production",
    registryKey: "kyoto-travel-nishijin-phase600",
    registryName: "Kyoto Travel",
    publishedAt: "2025-03-13",
  }),
  metalFittingsCraft: secondary({
    key: "phase600-kyoto-travel-metal-fittings",
    title: "Kyoto Travel: Enjoy Metal Fittings in Kyoto",
    url: "https://kyoto.travel/en/travel-inspiration/enjoy-metal-fittings-in-kyoto-tips-i-learned-from-artisans/",
    summary:
      "京都市官方旅游指南的工艺采访解释传统 kanamono 装饰金具兼具功能与装饰，并见于町屋等木构空间；只作 KAZARI KANAGU 的独立工艺背景。",
    locator: "traditional metal fittings, artisan context and functional decoration",
    registryKey: "kyoto-travel-metal-fittings-phase600",
    registryName: "Kyoto Travel",
    publishedAt: "2025-03-13",
  }),
};

const familySources: Record<
  FamilyKey,
  { primary: CuratedSource; secondary: CuratedSource; extras: CuratedSource[] }
> = {
  portable: {
    primary: official(
      "phase600-ystudio-portable-brass",
      "Classic Revolve Portable Fountain Pen Brass",
      "https://www.ystudiostyle.com/products/classic-revolve-portable-fountain-pen-brass",
      "官方 Brass 商品页列黄铜／铜、10.5 × 12 × 138 mm、46 g、F/M、国际标准 converter 与枫木携带管。",
      "description, specs, use and care, nib selector",
    ),
    secondary: secondary({
      key: "phase600-ystudio-portable-sbrebrown",
      title: "YStudio Portable Fountain Pen Review",
      url: "https://www.sbrebrown.com/2017/06/ystudio-portable-fountain-pen-review/",
      summary: "独立实测收帽 138.2 mm、去帽 119.2 mm、铜／黄铜约 50／46 g、细握位且不可可靠后插。",
      locator: "measurements table and cap-posting observation",
      registryKey: "sbrebrown-phase600-ystudio-portable",
      registryName: "SBRE Brown",
      publishedAt: "2017-06-26",
    }),
    extras: [
      official(
        "phase600-ystudio-portable-black",
        "Classic Revolve Portable Fountain Pen Black",
        "https://www.ystudiostyle.com/products/brassing-portable-fountain-pen",
        "官方 Black 商品页确认黑漆黄铜、木管、F/M、Schmidt 尖、converter 与 brassing effect。",
        "description, specs and use and care",
      ),
      secondary({
        key: "phase600-ystudio-portable-pencilcase",
        title: "YSTUDIO Portable Fountain Pen Review",
        url: "https://www.pencilcaseblog.com/2017/04/ystudio-portable-fountain-pen-review.html",
        summary: "独立评测说明早期 Classic／Brassing 名称、木管与皮绳携带语境、不可后插和约 8 mm 细握位。",
        locator: "version naming, carry tube, measurements and ergonomics",
        registryKey: "pencilcase-phase600-ystudio-portable",
        registryName: "The Pencilcase Blog",
        publishedAt: "2017-04-23",
      }),
      common.about,
    ],
  },
  desk: {
    primary: official(
      "phase600-ystudio-desk-copper",
      "Classic Revolve Desk Fountain Pen Copper",
      "https://www.ystudiostyle.com/products/classic-desk-fountain-pen",
      "官方 Copper 页确认铜笔身、黄铜笔座、无帽不可携带、10.5 × 12 × 146 mm、41 g、F/M 与 converter。",
      "description, warning, specs and nib selector",
    ),
    secondary: secondary({
      key: "phase600-ystudio-desk-penaddict",
      title: "ystudio Brassing Desk Fountain Pen Review",
      url: "https://www.penaddict.com/blog/2018/1/8/ystudio-brassing-desk-fountain-pen-review",
      summary: "独立样本记录黄铜笔座密封数周、#6 Schmidt 钢尖、凹形握位和桌面使用边界。",
      locator: "desk-stand seal sample, nib and ergonomics",
      registryKey: "pen-addict-phase600-ystudio-desk",
      registryName: "The Pen Addict",
      publishedAt: "2018-01-08",
    }),
    extras: [
      official(
        "phase600-ystudio-desk-black",
        "Classic Revolve Desk Fountain Pen Black",
        "https://www.ystudiostyle.com/products/brassing-desk-fountain-pen",
        "官方 Black 页确认黑漆黄铜、六条露铜线、无帽不可携带、10.5 × 12 × 138 mm、46 g 与 converter。",
        "description, warning, specs and use and care",
      ),
      common.fountainCollection,
    ],
  },
  resin: {
    primary: official(
      "phase600-ystudio-resin-official",
      "YSTUDIO Resin Fountain Pen",
      "https://www.ystudiostyle.com/products/resin-fountain-pen-1-1",
      "官方页列 White／Red／Black、F/M、12 × 14 × 142 mm、亚克力与黄铜内管、K1 可用且 K5 不兼容。",
      "description, specs, converter compatibility and selector",
    ),
    secondary: secondary({
      key: "phase600-ystudio-resin-penaddict",
      title: "ystudio Resin Fountain Pen Review",
      url: "https://www.penaddict.com/blog/2020/4/20/ystudio-resin-fountain-pen-review",
      summary: "独立评测发现常见 converter 金属环过宽而无法进入笔杆，并记录帽可后插但可能松脱。",
      locator: "converter diameter interference and cap-posting observations",
      registryKey: "pen-addict-phase600-ystudio-resin",
      registryName: "The Pen Addict",
      publishedAt: "2020-04-20",
    }),
    extras: [
      secondary({
        key: "phase600-ystudio-resin-black-penaddict",
        title: "Ystudio Resin Fountain Pen in Black: A Review",
        url: "https://www.penaddict.com/blog/2021/2/4/ystudio-resin-fountain-pen-in-black-a-review",
        summary: "黑色样本实测收帽 141 mm、去帽 128 mm、后插 164 mm，含墨囊收帽约 19.65 g、去帽约 15.61 g。",
        locator: "sample measurements, weight and nib description",
        registryKey: "pen-addict-phase600-ystudio-resin-black",
        registryName: "The Pen Addict",
        publishedAt: "2021-02-05",
      }),
      common.fountainCollection,
    ],
  },
  yakihaku: {
    primary: official(
      "phase600-ystudio-yakihaku-capped",
      "Classic Renaissance YAKIHAKU Fountain Pen",
      "https://www.ystudiostyle.com/products/yakihaku-fountain-pen",
      "官方带帽页确认 Kohei Murata／Unryūhaku 工艺、14K F、黄铜、13 × 11 × 138 mm、46 g 与国际标准 converter。",
      "description, artist, 14K nib and specs",
    ),
    secondary: source({
      key: "phase600-ystudio-yakihaku-golden-pin",
      title: "YSTUDIO Awards and Recognition",
      url: "https://www.ystudiostyle.com/pages/about-us",
      summary: "品牌奖项页记录 YAKIHAKU Pen 获 2019 Golden Pin Design Award，作为公开时间锚点。",
      locator: "YAKIHAKU Pen / Golden Pin Design Award 2019",
      sourceType: "official",
      tier: "contemporary_archive",
      registryKey: "ystudio-awards-phase600-yakihaku",
      registryName: "YSTUDIO official",
      independenceGroup: "ystudio-official-awards",
      publishedAt: "2019-01-01",
    }),
    extras: [
      official(
        "phase600-ystudio-yakihaku-desk",
        "Classic Renaissance YAKIHAKU Desk Fountain Pen",
        "https://www.ystudiostyle.com/products/craft-yakihaku-fountain-pen",
        "官方 Desk 页列无帽笔身、黄铜笔座、10.5 × 12 × 146 mm、34 g、F/M 14K 与 UNRYUHAKU 序号刻字。",
        "desk description, warning, specs and 14K nib section",
      ),
      common.renaissance,
      common.nishijinCraft,
    ],
  },
  kazariKanagu: {
    primary: official(
      "phase600-ystudio-kazari-dragon",
      "Classic Renaissance KAZARI KANAGU Fountain Pen Dragon",
      "https://www.ystudiostyle.com/products/kazari-kanagu-fountain-pen-dragon",
      "官方 Dragon 页确认錺金具协作、14K F、11.2 × 11.9 × 130.7 mm、converter、展示盒与 981 g 未拆分套装重量。",
      "included bundle, craft description, artists, 14K nib and specs",
    ),
    secondary: source({
      key: "phase600-ystudio-kazari-renaissance-map",
      title: "YSTUDIO Classic Renaissance Series",
      url: "https://www.ystudiostyle.com/collections/ystudio-classic-renaissance-series",
      summary: "官方系列导航将 Dragon、Orchid 钢笔与滚珠笔、YAKIHAKU 和配件分成独立商品卡。",
      locator: "KAZARI KANAGU fountain-pen product cards and format separation",
      sourceType: "official",
      tier: "contemporary_archive",
      registryKey: "ystudio-renaissance-phase600-kazari",
      registryName: "YSTUDIO official",
      independenceGroup: "ystudio-official-renaissance-map",
    }),
    extras: [common.renaissance, common.fountainCollection, common.metalFittingsCraft],
  },
};

function diagram(key: FamilyKey, title: string): CuratedSource {
  const name = key === "kazariKanagu" ? "kazari-kanagu" : key;
  const localPath = `/images/library/site-original/phase600/ystudio/${name}.svg`;
  return {
    key: `phase600-ystudio-${name}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase600-ystudio-${name}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase600-ystudio-${name}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片；不复制品牌标识、真实笔形、工艺图案、颜色、比例、包装或机构剖面。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;dimensions=1600x900`,
  };
}

interface FamilyDefinition {
  key: FamilyKey;
  name: string;
  markdown: string;
  title: string;
  aliases: string[];
  release: string;
  origin: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  weight: string;
  status: string;
  identity: string;
  boundary: string;
  care: string;
  variants: CuratedVariant[];
  conflicts?: CuratedConflict[];
}

const families: FamilyDefinition[] = [
  {
    key: "portable",
    name: "YSTUDIO Classic Revolve Portable",
    markdown: ".planning/content-research/ystudio-classic-revolve-portable-phase600.md",
    title: "YSTUDIO Classic Revolve Portable：木管随行、细握位与不可后插",
    aliases: ["YSTUDIO Portable Fountain Pen", "Ystudio Brassing Portable", "YSTUDIO Classic Portable Fountain Pen", "物外便携钢笔"],
    release: "约 2016–2017；2017 已获 Golden Pin Design Award",
    origin: "台湾设计与制造；Schmidt 钢尖为德国来源",
    nib: "Schmidt #5 镀金色不锈钢尖；F/M",
    fill: "国际标准墨囊／转换器；随笔附 converter",
    material: "Brass 裸黄铜或 Black 黑漆黄铜／铜结构；附枫木携带管",
    dimensions: "官方 10.5 × 12 × 138 mm；样本去帽约 119.2 mm，帽不可稳定后插",
    weight: "官方 46 g；独立铜／黄铜样本约 50／46 g",
    status: "当前 Brass 与 Black 商品页；Classic／Brassing 为历史名称",
    identity: "Portable 是有帽、带孔端部与木制携带管的便携家族，不与更粗 Classic Revolve 或无帽 Desk 合并。",
    boundary: "Brass／Black、F/M、刻字和早期 Classic／Brassing 名称是 variants 或订单范围；木管不构成防撞、防水或防丢保证。",
    care: "裸金属可选择保留氧化；Black 漆面不用金属抛光剂。供墨只以常温清水清洗，帽不可强行后插。",
    variants: [
      { key: "phase600-ystudio-portable-brass-variant", name: "Brass／early Classic", notes: "裸黄铜／铜表面与自然 patina；旧称不建立第二页。", sourceKey: "phase600-ystudio-portable-brass", variantKind: "material" },
      { key: "phase600-ystudio-portable-black-variant", name: "Black／early Brassing", notes: "黑漆露铜表面；brassing effect 不代表机械代际。", sourceKey: "phase600-ystudio-portable-black", variantKind: "material" },
    ],
  },
  {
    key: "desk",
    name: "YSTUDIO Classic Revolve Desk",
    markdown: ".planning/content-research/ystudio-classic-revolve-desk-phase600.md",
    title: "YSTUDIO Classic Revolve Desk：无帽笔身、黄铜笔座与固定书写位置",
    aliases: ["YSTUDIO Desk Fountain Pen", "Ystudio Brassing Desk Fountain Pen", "YSTUDIO Classic Desk Fountain Pen", "物外桌面钢笔"],
    release: "约 2017；2018 已有独立在售样本",
    origin: "台湾设计与制造；Schmidt 钢尖为德国来源",
    nib: "Schmidt 不锈钢尖；当前 F/M，早期评测记录 #6 样本",
    fill: "国际标准墨囊／转换器；随笔附 Schmidt converter",
    material: "Copper 铜笔身／黄铜笔座；Black 黑漆黄铜笔身／黄铜笔座",
    dimensions: "Copper 10.5 × 12 × 146 mm；Black 10.5 × 12 × 138 mm",
    weight: "Copper 笔身 41 g；Black 笔身 46 g；均不含笔座／包装",
    status: "当前 Copper 与 Black 商品页；无帽不可携带",
    identity: "Desk 以无帽笔身和黄铜笔座完成收纳密封，是固定桌面家族，不是 Portable 缺帽状态。",
    boundary: "Copper 与 Black 规格按 SKU 保留，不取平均；样本数周密封观察不是全寿命保证，笔座是核心配件。",
    care: "保持笔座内孔无干墨和砂粒；笔身垂直取放。不要整座浸水或在密封面使用砂纸、蜡和抛光剂。",
    variants: [
      { key: "phase600-ystudio-desk-copper-variant", name: "Copper", notes: "146 mm／41 g 铜笔身和黄铜笔座。", sourceKey: "phase600-ystudio-desk-copper", variantKind: "material" },
      { key: "phase600-ystudio-desk-black-variant", name: "Black", notes: "138 mm／46 g 黑漆黄铜笔身和黄铜笔座。", sourceKey: "phase600-ystudio-desk-black", variantKind: "material" },
    ],
  },
  {
    key: "resin",
    name: "YSTUDIO Resin Fountain Pen",
    markdown: ".planning/content-research/ystudio-resin-fountain-pen-phase600.md",
    title: "YSTUDIO Resin Fountain Pen：亚克力外壳、黄铜内管与 K1 转换器例外",
    aliases: ["Ystudio Resin Fountain Pen", "YSTUDIO Resin Series Fountain Pen", "物外树脂钢笔"],
    release: "约 2020",
    origin: "台湾设计与制造；Schmidt 钢尖为德国来源",
    nib: "德国 Schmidt 镀金色不锈钢尖；F/M",
    fill: "附黑色墨囊；适配 Schmidt K1 converter，官方明确不适配 K5",
    material: "哑光亚克力外壳、黄铜内管与黄铜握位／端部配重",
    dimensions: "官方 12 × 14 × 142 mm；样本收帽约 141 mm、去帽 128 mm、后插 164 mm",
    weight: "黑色样本含墨囊收帽约 19.65 g、去帽约 15.61 g",
    status: "当前 White／Red／Black；不提供刻字服务",
    identity: "Resin 是亚克力外壳与黄铜内管的独立轻量平台，不是 Classic Revolve 的颜色或材质 SKU。",
    boundary: "White／Red／Black 为颜色 variants；具体商品页的 K1 可用／K5 不可用优先于集合页笼统国际标准描述。",
    care: "不得把 K5 或宽环 converter 强压进亚克力笔杆；树脂不用黄铜抛光剂、酒精、砂纸或热水。",
    variants: [
      { key: "phase600-ystudio-resin-colours", name: "White／Red／Black", notes: "三色共享同一 acrylic/brass chassis 和 K1 边界。", sourceKey: "phase600-ystudio-resin-official", variantKind: "color" },
    ],
  },
  {
    key: "yakihaku",
    name: "YSTUDIO Classic Renaissance YAKIHAKU",
    markdown: ".planning/content-research/ystudio-classic-renaissance-yakihaku-phase600.md",
    title: "YSTUDIO Classic Renaissance YAKIHAKU：云龙箔、14K 尖与带帽／桌面版本",
    aliases: ["YSTUDIO YAKIHAKU Fountain Pen", "Ystudio Unryuhaku Fountain Pen", "YSTUDIO 烧箔钢笔", "YSTUDIO 云龙箔钢笔"],
    release: "约 2019；2019 Golden Pin Design Award 时间锚点",
    origin: "台湾品牌与制造；日本 Kohei Murata 箔工艺；德国 14K 笔尖",
    nib: "带帽现行款 14K F；Desk 商品页列 F/M 14K 与 UNRYUHAKU 序号刻字",
    fill: "带帽款附 converter 并兼容国际标准墨囊；Desk 附件按具体批次",
    material: "黄铜笔身与 Unryūhaku 云龙箔／烧箔表面；Desk 配实心黄铜笔座",
    dimensions: "带帽 13 × 11 × 138 mm；Desk 10.5 × 12 × 146 mm",
    weight: "带帽 46 g；Desk 笔身 34 g，不含笔座／包装",
    status: "Classic Renaissance 当前系列；检索时商品缺货不等于停产",
    identity: "YAKIHAKU 是 Kohei Murata 箔工艺合作家族，带帽和无帽 Desk 以 variants 保留，不与滚珠笔合并。",
    boundary: "带帽／Desk、F/M、序号和库存是版本范围；手工箔纹逐支不同，YAKIHAKU 不与雕金 KAZARI KANAGU 合并。",
    care: "工艺表面不浸泡、不抛光、不用酒精、砂纸或超声波；仅清洗笔尖、笔舌与 converter。",
    variants: [
      { key: "phase600-ystudio-yakihaku-capped-variant", name: "YAKIHAKU capped fountain pen", notes: "138 mm／46 g、14K F、国际标准 converter。", sourceKey: "phase600-ystudio-yakihaku-capped", variantKind: "variant" },
      { key: "phase600-ystudio-yakihaku-desk-variant", name: "YAKIHAKU Desk Fountain Pen", notes: "146 mm／34 g 无帽笔身，配黄铜笔座和 F/M 14K。", sourceKey: "phase600-ystudio-yakihaku-desk", variantKind: "variant" },
    ],
  },
  {
    key: "kazariKanagu",
    name: "YSTUDIO Classic Renaissance KAZARI KANAGU",
    markdown: ".planning/content-research/ystudio-classic-renaissance-kazari-kanagu-phase600.md",
    title: "YSTUDIO Classic Renaissance KAZARI KANAGU：錺金具、14K F 与作品版本",
    aliases: ["YSTUDIO KAZARI KANAGU Fountain Pen", "Ystudio Kazari Kanagu", "YSTUDIO 錺金具钢笔", "YSTUDIO KAZARINO Fountain Pen"],
    release: "Dragon 为 2024 龙年作品；其他 edition 按各商品页",
    origin: "台湾品牌与制造；日本 KAZARIKANAGU TAKEUCHI／Ito Metal Carving Workshop；德国 14K 笔尖",
    nib: "Dragon 为德国制造 YSTUDIO 14K F，具 `龍` 与品牌刻字；其他作品按 SKU",
    fill: "Dragon 附国际标准 converter；墨囊兼容按具体商品页",
    material: "黄铜、铜、14K 笔尖与手工錺金具／雕金装饰；Dragon 含木盒与黄铜墨水瓶",
    dimensions: "Dragon 笔身 11.2 × 11.9 × 130.7 mm",
    weight: "官方 981 g 同时包含木盒等套装，裸笔重量未拆分",
    status: "Classic Renaissance 当前作品线；Dragon、Orchid 为 editions",
    identity: "KAZARI KANAGU 是手工錺金具与雕金家族，Dragon／Orchid 为作品 editions，不与相同图案滚珠笔合并。",
    boundary: "Dragon 的 14K F、云雷纹、展示盒和墨水瓶只属于该作品；981 g 不得误作裸笔重量。",
    care: "不抛光、砂磨、浸泡或用针清理雕金表面；松动、翘起和异常粉化应由品牌或专业工艺修复者处理。",
    variants: [
      { key: "phase600-ystudio-kazari-dragon-variant", name: "Dragon", releaseYear: "2024", notes: "云雷纹、14K F、木盒、黄铜墨水瓶与 converter 套装。", sourceKey: "phase600-ystudio-kazari-dragon", variantKind: "edition_group" },
      { key: "phase600-ystudio-kazari-orchid-variant", name: "Orchid", notes: "官方系列导航中的另一具名钢笔作品；规格不从 Dragon 回填。", sourceKey: "phase600-ystudio-kazari-renaissance-map", variantKind: "edition_group" },
    ],
    conflicts: [
      {
        key: "phase600-ystudio-kazari-dragon-weight-scope",
        fieldKey: "weight",
        scopeKey: "phase600:ystudio-classic-renaissance-kazari-kanagu:canonical",
        conflictKind: "field",
        status: "resolved",
        resolutionNote: "官方同页同时列木盒、墨水瓶和 converter，981 g 只保存为未拆分套装重量，不发布为裸笔重量。",
        members: [
          { citationKey: "phase600-kazariKanagu-spec-weight", assertedValue: "981 g on bundled product page" },
          { citationKey: "phase600-kazariKanagu-rejected-bare-pen-weight", assertedValue: "bare-pen weight not published" },
        ],
      },
    ],
  },
];

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

function claim(input: {
  key: string;
  predicate: string;
  text: string;
  primary: CuratedSource;
  secondary?: CuratedSource;
  scopeKey: string;
}): CuratedClaim {
  return {
    key: input.key,
    predicate: input.predicate,
    objectText: input.text,
    factClass: "core",
    confidence: 0.98,
    sourceKey: input.primary.key,
    locator: input.primary.summary,
    evidence: [
      { key: `${input.key}-primary`, sourceKey: input.primary.key, scopeKey: input.scopeKey, locator: input.primary.summary },
      ...(input.secondary
        ? [{ key: `${input.key}-secondary`, sourceKey: input.secondary.key, scopeKey: input.scopeKey, locator: input.secondary.summary }]
        : []),
    ],
  };
}

function familyPack(definition: FamilyDefinition): CuratedEntityPack {
  const selected = familySources[definition.key];
  const art = diagram(definition.key, `${definition.name} 身份与规格事实图`);
  const scopeKey = `phase600:${PHASE600_SLUGS[definition.key]}:canonical`;
  const sources = [selected.primary, selected.secondary, ...selected.extras, art];
  return {
    key: `phase600-ystudio-${definition.key}-sourced-v1`,
    entityId: PHASE600_IDS[definition.key],
    expectedType: "pen",
    expectedSlug: PHASE600_SLUGS[definition.key],
    canonicalName: definition.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: definition.markdown,
    storyTitle: definition.title,
    primarySourceKey: selected.primary.key,
    depthTier: "A",
    aliases: definition.aliases.map((alias) => ({
      alias,
      language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en",
      sourceKey: selected.primary.key,
    })),
    sources,
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        productionState: "current",
        editionScope: "canonical family；颜色、尖幅、表面、带帽／桌面形态、刻字和具名作品保留为 variant／SKU",
      },
    ],
    claims: [
      claim({ key: `phase600-${definition.key}-identity`, predicate: "model_identity", text: definition.identity, primary: selected.primary, secondary: selected.secondary, scopeKey }),
      claim({ key: `phase600-${definition.key}-boundary`, predicate: "version_boundary", text: definition.boundary, primary: selected.primary, secondary: selected.secondary, scopeKey }),
      claim({ key: `phase600-${definition.key}-care`, predicate: "maintenance_boundary", text: definition.care, primary: selected.primary, scopeKey }),
      ...(definition.key === "yakihaku"
        ? [
            claim({
              key: "phase600-yakihaku-nishijin-craft-context",
              predicate: "craft_context",
              text: "Kyoto Travel records Nishijin-ori as a divided artisan process using dyed silk and a hikibaku tool to incorporate gold leaf; this is background only and does not prove YAKIHAKU pen specifications.",
              primary: common.nishijinCraft,
              scopeKey,
            }),
          ]
        : []),
      ...(definition.key === "kazariKanagu"
        ? [
            claim({
              key: "phase600-kazari-kanagu-metal-fitting-context",
              predicate: "craft_context",
              text: "Kyoto Travel documents traditional Japanese metal fittings as functional and decorative craft objects used in wooden architecture; product-level Dragon and Orchid facts remain official-source only.",
              primary: common.metalFittingsCraft,
              scopeKey,
            }),
          ]
        : []),
    ],
    variants: definition.variants,
    spec: {
      brandEntityId: PHASE600_YSTUDIO_BRAND_ID,
      values: {
        series_name: definition.name,
        release_year: definition.release,
        origin_country: definition.origin,
        nib: definition.nib,
        fill_system: definition.fill,
        material: definition.material,
        dimensions: definition.dimensions,
        weight: definition.weight,
        status: definition.status,
      },
      evidence: [
        evidence("brand_entity_id", `phase600-${definition.key}-spec-brand`, common.about.key, scopeKey, "YSTUDIO official Taiwan identity"),
        evidence("series_name", `phase600-${definition.key}-spec-series`, selected.primary.key, scopeKey, selected.primary.summary),
        evidence("release_year", `phase600-${definition.key}-spec-release`, selected.secondary.key, scopeKey, selected.secondary.summary),
        evidence("origin_country", `phase600-${definition.key}-spec-origin`, common.about.key, scopeKey, common.about.summary),
        evidence("nib", `phase600-${definition.key}-spec-nib`, selected.primary.key, scopeKey, selected.primary.summary),
        evidence("fill_system", `phase600-${definition.key}-spec-fill`, selected.primary.key, scopeKey, selected.primary.summary),
        evidence("material", `phase600-${definition.key}-spec-material`, selected.primary.key, scopeKey, selected.primary.summary),
        evidence("dimensions", `phase600-${definition.key}-spec-dimensions`, selected.primary.key, scopeKey, selected.primary.summary),
        evidence("weight", `phase600-${definition.key}-spec-weight`, selected.primary.key, scopeKey, selected.primary.summary),
        ...(definition.key === "kazariKanagu"
          ? [
              evidence(
                "weight",
                "phase600-kazariKanagu-rejected-bare-pen-weight",
                selected.secondary.key,
                scopeKey,
                "Official series map establishes a separate fountain-pen product card but publishes no bare-pen weight; the 981 g bundle field cannot be narrowed to the pen alone.",
                false,
              ),
            ]
          : []),
        evidence("status", `phase600-${definition.key}-spec-status`, common.fountainCollection.key, scopeKey, `${common.fountainCollection.summary}; retrieved ${RETRIEVED}`),
      ],
    },
    media: [
      {
        key: `phase600-${definition.key}-primary`,
        title: `${definition.name} 事实图（非产品照片）`,
        sourceKey: art.key,
        localPath: art.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText: "Fountain Pen Graph 本站原创 factual SVG；非产品照片，不表示真实颜色、外形、工艺纹理、比例、商标、包装或机构。",
        sourceUrl: art.url,
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: `phase600-${definition.key}-documented`,
        title: `${definition.name} 进入可核实产品资料`,
        eventType: "design_milestone",
        startDate: definition.release.match(/\d{4}/)?.[0] ?? "2020",
        circa: true,
        description: definition.identity,
        sourceKey: selected.primary.key,
      },
    ],
    conflicts: definition.conflicts,
  };
}

const baseBrand = phase432BrandDepthRefreshPacks.find(
  (pack) => pack.entityId === PHASE600_YSTUDIO_BRAND_ID,
);
if (!baseBrand) throw new Error("Phase 600 requires the Phase 432 YSTUDIO brand pack.");

const brandScope = "phase600:ystudio:canonical-fountain-navigation";
const brandPack: CuratedEntityPack = {
  ...baseBrand,
  key: "phase600-ystudio-brand-canonical-family-refresh-v1",
  markdownFile: ".planning/content-research/ystudio-brand-phase600.md",
  storyTitle: "YSTUDIO：六角金属之外，还有便携、桌面、树脂与工艺系列",
  primarySourceKey: common.fountainCollection.key,
  sources: [...baseBrand.sources, common.fountainCollection, common.about, common.renaissance].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  ),
  scopes: [
    ...baseBrand.scopes,
    {
      key: brandScope,
      scopeKey: brandScope,
      productionState: "current",
      editionScope: "六个 canonical fountain-pen families；颜色、尖幅、带帽／桌面、刻字、礼盒与滚珠笔不建立基础钢笔型号",
    },
  ],
  claims: [
    ...baseBrand.claims,
    claim({
      key: "phase600-ystudio-brand-series-map",
      predicate: "series_navigation",
      text: "YSTUDIO 品牌页链接 Classic Revolve、Portable、Desk、Resin、YAKIHAKU 与 KAZARI KANAGU 六个钢笔家族，并区分 Classic、Brassing、Resin 与 Craft 目录线。",
      primary: common.fountainCollection,
      secondary: common.renaissance,
      scopeKey: brandScope,
    }),
    claim({
      key: "phase600-ystudio-brand-rejected-skus",
      predicate: "identity_boundary",
      text: "颜色、F/M、刻字、礼盒、滚珠笔、圆珠笔、纸镇和实时库存不是新的基础钢笔实体；日本工艺与德国笔尖来源不覆盖品牌台湾身份。",
      primary: common.fountainCollection,
      secondary: common.about,
      scopeKey: brandScope,
    }),
  ],
  timeline: [
    ...(baseBrand.timeline ?? []),
    {
      key: "phase600-ystudio-current-fountain-catalog-verified",
      title: "YSTUDIO 当前钢笔家族与工艺边界复核",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description: "检索日确认四条钢笔目录线和六个 canonical family；不是品牌发布日。",
      sourceKey: common.fountainCollection.key,
    },
  ],
  publicationIntent: "publish",
  publicationBlockers: [],
};

export const phase600YstudioPacks: CuratedEntityPack[] = [
  brandPack,
  ...families.map(familyPack),
];

if (
  phase600YstudioPacks.length !== 6 ||
  new Set(phase600YstudioPacks.map((pack) => pack.entityId)).size !== 6
) {
  throw new Error("Phase 600 must contain one YSTUDIO brand refresh and five unique family packs.");
}
