import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase427BrandDepthRefreshPacks } from "./phase427-brand-depth-refresh";

export const PHASE599_BENU_BRAND_ID = "s59BENU";
export const PHASE599_IDS = {
  minima: "phase599-benu-minima",
  pixie: "phase599-benu-pixie",
  astrogem: "phase599-benu-astrogem",
  tessera: "phase599-benu-tessera",
  haute: "phase599-benu-haute",
  tribute: "phase599-benu-tribute",
  cocktailHour: "phase599-benu-cocktail-hour",
  dailyMate: "phase599-benu-dailymate",
  ambrosia: "phase599-benu-ambrosia",
  scepter: "phase599-benu-scepter",
  grandScepter: "phase599-benu-grand-scepter",
} as const;

export const PHASE599_SLUGS = {
  minima: "benu-minima",
  pixie: "benu-pixie",
  astrogem: "benu-astrogem",
  tessera: "benu-tessera",
  haute: "benu-haute",
  tribute: "benu-tribute",
  cocktailHour: "benu-cocktail-hour",
  dailyMate: "benu-dailymate",
  ambrosia: "benu-ambrosia",
  scepter: "benu-scepter",
  grandScepter: "benu-grand-scepter",
} as const;

export type Phase599Key = keyof typeof PHASE599_IDS;
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

function official(key: string, title: string, url: string, summary: string, locator: string) {
  return source({
    key,
    title,
    url,
    summary,
    locator,
    sourceType: "official",
    tier: "primary",
    registryKey: "benu-official-phase599",
    registryName: "BENU official",
    independenceGroup: "benu-official",
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
  sourceType?: "blog" | "retailer" | "forum";
  tier?: "professional_secondary" | "retailer" | "contemporary_archive";
  publishedAt?: string;
}) {
  return source({
    ...input,
    sourceType: input.sourceType ?? "blog",
    tier: input.tier ?? "professional_secondary",
    independenceGroup: input.registryKey,
  });
}

function editorial(key: Phase599Key, title: string): CuratedSource {
  const localPath = `/images/library/site-original/phase599/benu/${PHASE599_SLUGS[key].replace("benu-", "")}.svg`;
  const stableKey = PHASE599_SLUGS[key];
  return {
    key: `phase599-${stableKey}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase599-${stableKey}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase599-${stableKey}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片；不复刻品牌标识、真实笔形、色彩、纹理、笔夹、笔尖、机构剖面或比例。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const common = {
  shop: official(
    "phase599-benu-current-shop",
    "BENU official shop and collection navigation",
    "https://www.benupens.com/shop",
    "当前官方商店列出 Minima、Pixie、AstroGem、Tessera、Haute、Tribute、Cocktail Hour、Euphoria、Talisman 等 collection，并说明品牌在 Yerevan 自有设施设计和制作。",
    "current collection navigation and About BENU section",
  ),
  sizeChart: official(
    "phase599-benu-size-chart",
    "BENU Pens Size Comparison Chart",
    "https://www.benupens.com/pens-size-comparison-chart",
    "官方尺寸图分别列出 Minima 12.6 cm、Pixie 9.1 cm、AstroGem 14 cm 等家族，支持 canonical chassis 边界。",
    "named family silhouettes and displayed capped dimensions",
  ),
  converter: official(
    "phase599-benu-converter-compatibility",
    "BENU Ink Converter compatibility",
    "https://www.benupens.com/shop/product/inkconverter",
    "官方说明标准 BENU converter 不兼容 Minima、Ambrosia、Pixie；三者因小尺寸使用短墨囊。",
    "converter compatibility paragraph naming Minima, Ambrosia and Pixie exceptions",
  ),
  comparison: secondary({
    key: "phase599-benu-model-comparison",
    title: "BENU — A Comparison Of All BENU Pen Models",
    url: "https://www.penaddict.com/blog/2023/12/1/benu-pen-comparison",
    summary:
      "The Pen Addict 将 Scepter、Grand Scepter、Briolette、Minima、Euphoria 等实物并列，支持家族体量与 #5／#6 身份边界。",
    locator: "model comparison photographs and size-5 versus size-6 nib discussion",
    registryKey: "pen-addict-phase599-benu-comparison",
    registryName: "The Pen Addict",
    publishedAt: "2023-12-01",
  }),
};

const sources: Record<Phase599Key, { primary: CuratedSource; secondary: CuratedSource; extras: CuratedSource[] }> = {
  minima: {
    primary: official("phase599-benu-minima-lilac-skies", "BENU Lilac Skies Minima", "https://www.benupens.com/shop/product/lilacskies", "当前 Minima 商品页确认短国际墨囊、标准 converter 不可用、mini converter 不超过 4 cm，并允许 eyedropper。", "Collection Minima and filling paragraph"),
    secondary: secondary({ key: "phase599-benu-minima-sbrebrown", title: "BENU Minima Blue Flame Fountain Pen Review", url: "https://www.sbrebrown.com/2019/11/benu-minima-blue-flame-fountain-pen-review/", summary: "实测收帽 126.2 mm、去帽 115.7 mm、17 g，并记录 Minima 样本的 steel nib 与当时 cartridge/converter 语境。", locator: "measurements and review metadata", registryKey: "sbrebrown-phase599-benu-minima", registryName: "SBRE Brown", publishedAt: "2019-11-06" }),
    extras: [common.converter, common.sizeChart],
  },
  pixie: {
    primary: official("phase599-benu-pixie-smoky-black", "BENU Smoky Black Pixie", "https://www.benupens.com/shop/product/smokyblack", "官方 Pixie 商品页确认 11 个初始配色语境、短国际墨囊、≤4 cm mini converter 与 eyedropper 边界。", "Pixie identity, colour count and filling paragraph"),
    secondary: secondary({ key: "phase599-benu-pixie-penquisition", title: "Benu Pixie Metallic Dust Set", url: "https://penquisition.com/blog/2025/8/8/benu-pixie-metallic-dust-set", summary: "实测 91 mm、post 133.35 mm、14.3 g、#5 Schmidt 与短墨囊。", locator: "Specs section and set identity", registryKey: "penquisition-phase599-benu-pixie", registryName: "Penquisition", publishedAt: "2025-08-08" }),
    extras: [common.converter, common.sizeChart],
  },
  astrogem: {
    primary: official("phase599-benu-astrogem-pallas", "BENU Pallas AstroGem", "https://benupens.com/shop/categories/fountain-pens/pallas/", "官方 Pallas 档案确认 AstroGem、140 mm、25 g、#6 Schmidt F/M/B、可 post、converter／长墨囊与 eyedropper。", "collection, product details, nib and refill fields"),
    secondary: secondary({ key: "phase599-benu-astrogem-penheaven", title: "BENU AstroGem Christmas Edition", url: "https://www.penheaven.co.uk/benu-astrogem-christmas-edition-fountain-pen", summary: "专业零售页交叉记录 AstroGem 约 140 mm 与 14 mm 体量。", locator: "closed dimensions and family title", registryKey: "pen-heaven-phase599-benu-astrogem", registryName: "Pen Heaven", sourceType: "retailer", tier: "professional_secondary" }),
    extras: [official("phase599-benu-astrogem-lutetia", "BENU Lutetia AstroGem", "https://www.benupens.com/shop/product/lutetia", "Lutetia 当前商品页限定发光说明，并警示超过 50°C 的过热会损伤树脂。", "AstroGem collection field, glow and heat warning"), common.sizeChart],
  },
  tessera: {
    primary: official("phase599-benu-tessera-onyx", "BENU Onyx Tessera", "https://www.benupens.com/shop/product/onyx", "官方 Onyx 页面确认 Tessera 的马赛克方块切面、哑光／亮面交替、六种设计、钢色／金色饰件与国际 converter。", "Tessera description, collection count and filling paragraph"),
    secondary: secondary({ key: "phase599-benu-tessera-archer", title: "Fountain Pen Review: BENU Tessera Amber", url: "https://archer-rantings.blogspot.com/2020/05/fountain-pen-review-benu-tessera-amber.html", summary: "实测 Tessera Amber 收帽 5.5 in、去帽 5.25 in、post 6.75 in、Schmidt Broad 与标准国际 converter。", locator: "measurements, nib and filling observations", registryKey: "rants-archer-phase599-benu-tessera", registryName: "Rants of The Archer", publishedAt: "2020-05-01" }),
    extras: [common.shop],
  },
  haute: {
    primary: official("phase599-benu-haute-lush", "BENU Lush Haute", "https://www.benupens.com/shop/product/lush", "官方 Lush 页面确认 Haute 的时尚灵感、交替宽窄切面、金色／铬色饰件和标准国际 converter。", "Haute collection description and filling paragraph"),
    secondary: secondary({ key: "phase599-benu-haute-penchalet", title: "BENU Haute Collection", url: "https://www.penchalet.com/benu_pens/fountain_pens/", summary: "专业零售商把 Haute 作为独立 BENU fountain-pen collection 导航，并区分其设计与其他 BENU 家族。", locator: "BENU Haute collection navigation and product grouping", registryKey: "pen-chalet-phase599-benu-haute", registryName: "Pen Chalet", sourceType: "retailer", tier: "professional_secondary" }),
    extras: [official("phase599-benu-haute-collection", "BENU Haute official collection", "https://www.benupens.com/shop/collection/haute", "官方集合列出 Perle、Lush、Allure、Icon、Satin、Lustre 等同一家族设计。", "current Haute product list"), common.shop],
  },
  tribute: {
    primary: official("phase599-benu-tribute-black-coffee", "BENU Black Coffee Tribute", "https://www.benupens.com/shop/product/blackcoffee", "官方 Black Coffee 页面确认 Tribute 的文化主题、手绘差异、钢尖／14K 选项、converter／长墨囊与 eyedropper。", "Tribute description, hand-painted disclaimer, nib choices and filling"),
    secondary: secondary({ key: "phase599-benu-tribute-penquisition", title: "Benu Tribute Black Coffee edition", url: "https://penquisition.com/blog/2025/7/10/benu-tribute-fountain-pen-black-coffee-edition-a-tribute-to-ella-fitzgerald", summary: "实测 Black Coffee 150 mm、29.6 g、#6 Schmidt、cartridge/converter，并区分钢尖与 14K 价格配置。", locator: "Specs, nib performance and filling sections", registryKey: "penquisition-phase599-benu-tribute", registryName: "Penquisition", publishedAt: "2025-07-10" }),
    extras: [official("phase599-benu-tribute-collection", "BENU Tribute official collection", "https://www.benupens.com/shop/collection/tribute", "官方集合把故事、歌曲和艺术主题定义为 creative tribute rather than replica。", "collection introduction and product list"), common.shop],
  },
  cocktailHour: {
    primary: official("phase599-benu-cocktail-hour", "BENU Cocktail Hour official collection", "https://www.benupens.com/shop/collection/dailymate", "当前官方页面确认 Cocktail Hour、diamond star cut 灵感及 Mojito、Bellini、Pink Lady 首发三款。", "H1, collection introduction and launch products"),
    secondary: secondary({ key: "phase599-benu-cocktail-hour-penchalet", title: "BENU Cocktail Hour Bellini", url: "https://www.penchalet.com/benu_pens/fountain_pens/benu_cocktail_hour_collection_fountain_pens/Bellini/", summary: "专业零售资料确认 resin/brass、#6 Schmidt F/M/B 与 JoWo Flex/Stub 尖型，以及三款首发颜色。", locator: "collection description, material and nib-option list", registryKey: "pen-chalet-phase599-benu-cocktail-hour", registryName: "Pen Chalet", sourceType: "retailer", tier: "professional_secondary" }),
    extras: [common.shop],
  },
  dailyMate: {
    primary: official("phase599-benu-dailymate-archive", "BENU archived shop navigation for DailyMate", "https://benupens.com/shop/", "旧官方商店资料把 DailyMate 描述为七款日常设计；当前旧路径已显示 Cocktail Hour，未发现官方 rename 说明。", "archived DailyMate collection text and current navigation comparison"),
    secondary: secondary({ key: "phase599-benu-dailymate-penaddict", title: "BENU Daily Mate Creative Thursday Review", url: "https://www.penaddict.com/blog/2025/6/25/benu-daily-mate-creative-thursday-fountain-pen-review", summary: "实测 140 mm、18 mm、#6 Schmidt、converter、不可 post 与约五圈开帽。", locator: "dimensions, nib, filling and cap-turn observations", registryKey: "pen-addict-phase599-benu-dailymate", registryName: "The Pen Addict", publishedAt: "2025-06-25" }),
    extras: [secondary({ key: "phase599-benu-dailymate-fpn", title: "BENU DailyMate mini review", url: "https://www.fountainpennetwork.com/forum/topic/377452-really-mini-review-benu-dailymate-fountain-pen/", summary: "独立使用记录确认 Easy Wednesday、去帽 131 mm、不可 post、Schmidt steel 和约五圈开帽。", locator: "dated review notes", registryKey: "fpn-phase599-benu-dailymate", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", publishedAt: "2025-01-05" })],
  },
  ambrosia: {
    primary: official("phase599-benu-ambrosia-marigold", "BENU Marigold Ambrosia", "https://www.benupens.com/shop/product/marigold", "官方 Marigold 页面确认 Ambrosia、商店独家 20 支、短国际墨囊、≤4 cm mini converter 与 eyedropper。", "Collection, LIMITED EDITION 20 PENS and filling paragraph"),
    secondary: secondary({ key: "phase599-benu-ambrosia-endlesspens", title: "BENU Ambrosia collection listing", url: "https://endlesspens.com/collections/benu", summary: "专业零售目录把 Ambrosia 与 Minima、Talisman、Euphoria 等作为独立 BENU family，支持型号边界。", locator: "BENU family navigation and Ambrosia listings", registryKey: "endless-pens-phase599-benu-ambrosia", registryName: "EndlessPens", sourceType: "retailer", tier: "professional_secondary" }),
    extras: [common.converter, official("phase599-benu-ambrosia-forget-me-not", "BENU Forget-Me-Not Ambrosia", "https://www.benupens.com/shop/product/forget-me-not-fountain-pen", "另一当前商品页交叉确认 Ambrosia 花名、短墨囊与小尺寸供墨边界。", "Collection and filling paragraph")],
  },
  scepter: {
    primary: official("phase599-benu-scepter-nibs", "BENU fountain pen nib compatibility", "https://www.benupens.com/benu-fountain-pen-nibs", "官方兼容页仍将 Scepter 与 Grand Scepter 分开列出，支持历史 family 和 nib-unit 边界。", "Scepter and Grand Scepter compatibility rows"),
    secondary: secondary({ key: "phase599-benu-scepter-penchalet", title: "BENU Scepter V", url: "https://www.penchalet.com/fine_pens/fountain_pens/benu_scepter_fountain_pen/Scepter%2BV/", summary: "零售档案给出 133.6 mm、22.68 g、#5 Schmidt、标准国际 cartridge/converter 和螺旋树脂身份。", locator: "product specifications and family description", registryKey: "pen-chalet-phase599-benu-scepter", registryName: "Pen Chalet", sourceType: "retailer", tier: "professional_secondary" }),
    extras: [secondary({ key: "phase599-benu-scepter-parka", title: "Review: Scepter VII fountain pen", url: "https://www.parkablogs.com/content/review-scepter-vii-fountain-pen-benu", summary: "实测约 13.3 cm、24 g、不可 post、无笔夹，并说明罗马数字区分颜色。", locator: "series naming, measurements and cap observations", registryKey: "parka-phase599-benu-scepter", registryName: "Parka Blogs", publishedAt: "2020-06-07" })],
  },
  grandScepter: {
    primary: official("phase599-benu-grand-scepter-nibs", "BENU fountain pen nib compatibility", "https://www.benupens.com/benu-fountain-pen-nibs", "官方兼容页将 Grand Scepter 保留为独立于 Scepter 的历史家族。", "Grand Scepter compatibility row"),
    secondary: secondary({ key: "phase599-benu-grand-scepter-parka", title: "Review: Grand Scepter IX", url: "https://www.parkablogs.com/content/review-grand-scepter-ix-benu", summary: "实测约 13.3 cm、24 g，确认 #6 尖、发光树脂、无笔夹和标准国际 converter。", locator: "Scepter comparison, measurements, nib and glow observations", registryKey: "parka-phase599-benu-grand-scepter", registryName: "Parka Blogs", publishedAt: "2020-06-25" }),
    extras: [secondary({ key: "phase599-benu-grand-scepter-penaddict", title: "Benu Grand Scepter Fountain Pen Review", url: "https://www.penaddict.com/blog/2020/7/23/benu-grand-scepter-fountain-pen-review", summary: "独立评测说明 Grand 与普通 Scepter 同尺寸同形，核心差异为 #6 对 #5。", locator: "direct Scepter versus Grand Scepter comparison", registryKey: "pen-addict-phase599-benu-grand-scepter", registryName: "The Pen Addict", publishedAt: "2020-07-23" })],
  },
};

interface FamilyDefinition {
  key: Phase599Key;
  name: string;
  markdown: string;
  title: string;
  aliases: string[];
  productionState: "current" | "historical";
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
  variants: CuratedVariant[];
}

const families: FamilyDefinition[] = [
  { key: "minima", name: "BENU Minima", markdown: ".planning/content-research/benu-minima-phase599.md", title: "BENU Minima：126 毫米便携笔与短墨囊边界", aliases: ["Benu Minima", "BENU Minima fountain pen", "BENU 米尼玛"], productionState: "current", release: "2010s；具体首发年份未确认", origin: "亚美尼亚 Yerevan 的 BENU 制造语境", nib: "Schmidt #5 不锈钢尖；F/M/B 等按 SKU", fill: "短国际墨囊；mini converter ≤4 cm 或官方允许下谨慎 eyedropper；标准 converter 不兼容", material: "手工树脂／亚克力类树脂；颜色、闪粉与图案按 variant", dimensions: "收帽约 126 mm；去帽实测约 115.7 mm；最大宽度约 17 mm", weight: "实测样本约 17 g", status: "当前 collection；现行颜色与历史颜色并存", identity: "Minima 是约 126 mm 的独立便携家族，不是 91 mm Pixie 的旧名。", boundary: "当前官方短墨囊与 ≤4 cm mini converter 说明优先于旧评测的宽泛 cartridge/converter 描述；颜色与独家装饰保持 variants。", variants: [{ key: "phase599-minima-lilac-skies", name: "Lilac Skies", notes: "当前官方商品／BENU Exclusive 颜色；短供墨规格锚点。", sourceKey: "phase599-benu-minima-lilac-skies", variantKind: "color" }, { key: "phase599-minima-opal-skulls", name: "Opal Dust／Skull & Roses 等", notes: "历史与现行颜色集合，不复制基础型号正文。", sourceKey: "phase599-benu-minima-sbrebrown", variantKind: "edition_group" }] },
  { key: "pixie", name: "BENU Pixie", markdown: ".planning/content-research/benu-pixie-phase599.md", title: "BENU Pixie：91 毫米收帽与 post 后书写长度", aliases: ["Benu Pixie", "BENU Pixie Pocket", "BENU 小精灵口袋笔"], productionState: "current", release: "2025", origin: "亚美尼亚 Yerevan 的 BENU 制造语境", nib: "Schmidt #5 不锈钢尖；常见 EF/F/M/B", fill: "短国际墨囊；mini converter ≤4 cm；可按官方说明 eyedropper", material: "树脂；部分款手绘、闪粉或发光，按具体 SKU", dimensions: "收帽约 91 mm；post 后实测约 133.35 mm；直径样本约 9.2 mm（测量位置依评测）", weight: "实测样本约 14.3 g", status: "当前 collection；单色与三支套装并存", identity: "Pixie 是 BENU 的 91 mm pocket chassis，套帽后达到常规书写长度。", boundary: "Pixie 不与 Minima 合并；Smoky Black、Icy Violet、Metallic Dust 套装等为 color 或 edition-group variants。", variants: [{ key: "phase599-pixie-classic", name: "Smoky Black／Coffee Brown／Royal Blue", notes: "经典色组。", sourceKey: "phase599-benu-pixie-smoky-black", variantKind: "edition_group" }, { key: "phase599-pixie-colours", name: "Aqua Glow／Icy Violet／Stardust Pink 等", notes: "鲜艳颜色 variants；发光只属于具名配方。", sourceKey: "phase599-benu-pixie-smoky-black", variantKind: "color" }, { key: "phase599-pixie-sets", name: "Metallic Dust 等三支套装", notes: "套装是 edition group，不制造三个重复 canonical pages。", sourceKey: "phase599-benu-pixie-penquisition", variantKind: "edition_group" }] },
  { key: "astrogem", name: "BENU AstroGem", markdown: ".planning/content-research/benu-astrogem-phase599.md", title: "BENU AstroGem：小行星命名、多面体与发光版本边界", aliases: ["Benu AstroGem", "BENU Astrogem", "BENU Astro Gem", "BENU 星石系列"], productionState: "current", release: "2022 前后；持续增加新色", origin: "亚美尼亚 Yerevan 的 BENU 制造语境", nib: "Schmidt #6 不锈钢尖；F/M/B 按 SKU", fill: "标准国际大号 converter／72 mm 长墨囊；可按官方说明 eyedropper", material: "高品质树脂，多面体轮廓；部分具名版本含发光树脂", dimensions: "收帽约 140 mm；官方尺寸图最大外形约 27 mm，具体测量位置需看实物", weight: "Pallas 官方样本约 25 g", status: "当前 collection；官方商店独家和历史颜色并存", identity: "AstroGem 以 ʻOumuamua 轮廓和小行星命名组织一个全尺寸多面体 family。", boundary: "Pallas、Eos、Lutetia 等是 variants；Lutetia 的发光和热警示不扩展为全系列默认。", variants: [{ key: "phase599-astrogem-core", name: "Pallas／Apollo／Echo／Juno／Klio／Leto／Midas", notes: "初期小行星命名设计组。", sourceKey: "phase599-benu-astrogem-pallas", variantKind: "edition_group" }, { key: "phase599-astrogem-current", name: "Eos／Lutetia／Vesta 等", notes: "后续颜色和官方独家；Lutetia 有具名发光说明。", sourceKey: "phase599-benu-astrogem-lutetia", variantKind: "color" }] },
  { key: "tessera", name: "BENU Tessera", markdown: ".planning/content-research/benu-tessera-phase599.md", title: "BENU Tessera：马赛克切面、长握段与标准国际供墨", aliases: ["Benu Tessera", "BENU Tessera fountain pen", "BENU 马赛克系列"], productionState: "current", release: "2020 前后；当前重新列入官方目录", origin: "亚美尼亚 Yerevan 的 BENU 制造语境", nib: "Schmidt #6 不锈钢尖；钢色或金色镀层按 SKU", fill: "标准国际 converter／长墨囊；可按官方说明 eyedropper", material: "树脂，哑光外表与亮面内切的 tesserae 马赛克结构", dimensions: "早期 Amber 实测收帽约 140 mm、去帽约 133 mm、post 约 171 mm", weight: "官方当前集合未统一公布；不从相似家族回填", status: "当前 collection；六种设计和历史颜色并存", identity: "Tessera 是以马赛克 tesserae 方块组织哑光／亮面切面的独立全尺寸 family。", boundary: "Tessera 不与 AstroGem 或 Briolette 合并；金色饰件不自动证明 14K。", variants: [{ key: "phase599-tessera-onyx", name: "Onyx", notes: "当前官方六设计之一和规格锚点。", sourceKey: "phase599-benu-tessera-onyx", variantKind: "color" }, { key: "phase599-tessera-amber", name: "Amber", notes: "早期实测样本，尺寸和 Broad nib 只限该实物语境。", sourceKey: "phase599-benu-tessera-archer", variantKind: "color" }] },
  { key: "haute", name: "BENU Haute", markdown: ".planning/content-research/benu-haute-phase599.md", title: "BENU Haute：时尚灵感与交替宽窄切面", aliases: ["Benu Haute", "BENU Haute Collection", "BENU 高级时装系列"], productionState: "current", release: "2026 前后", origin: "亚美尼亚 Yerevan 的 BENU 制造语境", nib: "Schmidt 不锈钢尖；具体尖号与尖幅按 SKU，金色外观不等于 14K", fill: "标准国际 converter／长墨囊；可按官方说明 eyedropper", material: "树脂；交替宽切面／窄切面，金色或铬色饰件", dimensions: "官方当前集合未统一公布，不能回填 Euphoria／Tessera 尺寸", weight: "官方当前集合未统一公布", status: "当前 collection", identity: "Haute 是 BENU 当前时尚灵感、多面体宽窄切面 family。", boundary: "Perle、Lush、Allure、Icon 与 Gem 编号款为 design variants；不按颜色复制基础型号。", variants: [{ key: "phase599-haute-named", name: "Perle／Lush／Allure／Icon／Satin／Lustre", notes: "当前具名设计组。", sourceKey: "phase599-benu-haute-collection", variantKind: "edition_group" }, { key: "phase599-haute-gems", name: "Gem numbered designs", notes: "编号设计为 variants，编号不代表机械代际。", sourceKey: "phase599-benu-haute-collection", variantKind: "edition_group" }] },
  { key: "tribute", name: "BENU Tribute", markdown: ".planning/content-research/benu-tribute-phase599.md", title: "BENU Tribute：文化主题手绘、#6 钢尖与 14K 选项", aliases: ["Benu Tribute", "BENU Tribute Collection", "BENU 致敬系列"], productionState: "current", release: "2025", origin: "亚美尼亚 Yerevan 的 BENU 制造语境", nib: "Schmidt #6 镀色不锈钢尖；部分 SKU 可选 14K 金尖", fill: "标准国际 converter／长墨囊；可按官方说明 eyedropper", material: "手绘或主题树脂；每支构图和纹理存在个体差异", dimensions: "Black Coffee 实测收帽约 150 mm、post 约 183 mm、直径约 14.28 mm", weight: "Black Coffee 实测约 29.6 g；具体主题和尖材质可能变化", status: "当前 collection；常规、手绘、限量与缺货款并存", identity: "Tribute 是对音乐、绘画、文学和神话进行创意重述的主题 family，不是作品复制品。", boundary: "Black Coffee、Bennu、Monet 等是主题 variants；钢尖／14K 和单款限量必须按 SKU，不扩展到全系列。", variants: [{ key: "phase599-tribute-black-coffee", name: "Black Coffee", notes: "系列早期手绘主题和实测规格锚点。", sourceKey: "phase599-benu-tribute-black-coffee", variantKind: "color" }, { key: "phase599-tribute-art", name: "Monet／Matisse／Cezanne", notes: "绘画主题组；creative tribute，不是复制作品。", sourceKey: "phase599-benu-tribute-collection", variantKind: "edition_group" }, { key: "phase599-tribute-myth", name: "Bennu／Baba Yaga／Grimm 等", notes: "神话与故事主题组，手绘位置逐支不同。", sourceKey: "phase599-benu-tribute-collection", variantKind: "edition_group" }] },
  { key: "cocktailHour", name: "BENU Cocktail Hour", markdown: ".planning/content-research/benu-cocktail-hour-phase599.md", title: "BENU Cocktail Hour：酒杯 diamond-star-cut 与多尖型 SKU", aliases: ["Benu Cocktail Hour", "BENU Cocktail Hour Collection", "BENU 鸡尾酒时光系列"], productionState: "current", release: "2026", origin: "亚美尼亚 Yerevan 的 BENU 制造语境", nib: "#6 Schmidt F/M/B；部分零售 SKU 为 JoWo Flex Fine、Stub 1.1／1.5", fill: "标准国际 cartridge／converter；具体随附件按市场 SKU", material: "acrylic resin 与 brass 结构；diamond-star-cut 酒杯切面", dimensions: "当前可靠资料未统一公布，不能使用 DailyMate／Euphoria 尺寸", weight: "当前可靠资料未统一公布", status: "当前 collection；首发三种颜色", identity: "Cocktail Hour 是 2026 年以酒杯 diamond-star-cut 为核心的独立 family。", boundary: "Mojito、Bellini、Pink Lady 是颜色 variants；不与 Euphoria 饮品色或 DailyMate 混名。", variants: [{ key: "phase599-cocktail-mojito", name: "Mojito", releaseYear: "2026", notes: "首发颜色。", sourceKey: "phase599-benu-cocktail-hour", variantKind: "color" }, { key: "phase599-cocktail-bellini", name: "Bellini", releaseYear: "2026", notes: "首发颜色。", sourceKey: "phase599-benu-cocktail-hour", variantKind: "color" }, { key: "phase599-cocktail-pink-lady", name: "Pink Lady", releaseYear: "2026", notes: "首发颜色。", sourceKey: "phase599-benu-cocktail-hour", variantKind: "color" }, { key: "phase599-cocktail-special-nibs", name: "JoWo Flex／Stub options", releaseYear: "2026", notes: "特殊尖市场 SKU，不形成第二基础型号。", sourceKey: "phase599-benu-cocktail-hour-penchalet", variantKind: "nib" }] },
  { key: "dailyMate", name: "BENU DailyMate", markdown: ".planning/content-research/benu-dailymate-phase599.md", title: "BENU DailyMate：七日颜色、#6 钢尖与历史目录边界", aliases: ["Benu DailyMate", "BENU Daily Mate", "BENU DailyMate Fountain Pen", "BENU 日常伙伴系列"], productionState: "historical", release: "约 2024", origin: "亚美尼亚 Yerevan 的 BENU 制造语境", nib: "Schmidt #6 不锈钢尖；F/M/B 按旧 SKU", fill: "标准国际 converter／墨囊", material: "树脂，平端与纵向细槽；七种星期命名颜色", dimensions: "收帽实测约 140 mm、最宽约 18 mm、握段约 10–11 mm；去帽约 131 mm", weight: "可靠评测未统一公布", status: "历史／当前官方旧路径已改呈 Cocktail Hour；未发现正式 rename", identity: "DailyMate 是有七个星期主题颜色和共同笔体的历史 family。", boundary: "当前旧 URL 内容变化不构成 DailyMate→Cocktail Hour 改名证据；五圈开帽和不可 post 属 DailyMate 使用边界。", variants: [{ key: "phase599-dailymate-week", name: "Easy Wednesday／Creative Thursday／Flirty Friday 等七款", releaseYear: "2024–2025", notes: "星期主题颜色组，不代表七代机构。", sourceKey: "phase599-benu-dailymate-archive", variantKind: "edition_group" }] },
  { key: "ambrosia", name: "BENU Ambrosia", markdown: ".planning/content-research/benu-ambrosia-phase599.md", title: "BENU Ambrosia：花卉命名、短墨囊与单款限量", aliases: ["Benu Ambrosia", "BENU Ambrosia Collection", "BENU 甘露系列"], productionState: "current", release: "2020s；具体首发年份未确认", origin: "亚美尼亚 Yerevan 的 BENU 制造语境", nib: "Schmidt #5 不锈钢尖；尖幅按具体 SKU", fill: "短国际墨囊；mini converter ≤4 cm；可按官方说明 eyedropper；标准 converter 不兼容", material: "小型树脂笔；花卉主题、透明度与闪粉按颜色 variant", dimensions: "官方当前集合未统一公布，不能回填 Minima／Pixie 尺寸", weight: "官方当前集合未统一公布", status: "当前商店独家 collection；限量和库存按具体花名", identity: "Ambrosia 是以花卉和神话甘露命名的独立小型 BENU family。", boundary: "BENU Exclusive 是渠道标签；Marigold 的 20 支限量只属于该 variant，不扩展到全系列。", variants: [{ key: "phase599-ambrosia-marigold", name: "Marigold", notes: "官方商店独家 20 支；短供墨规格锚点。", sourceKey: "phase599-benu-ambrosia-marigold", variantKind: "color" }, { key: "phase599-ambrosia-flowers", name: "Forget-Me-Not 等花卉设计", notes: "颜色／主题组，各自限量和库存单独核对。", sourceKey: "phase599-benu-ambrosia-forget-me-not", variantKind: "edition_group" }] },
  { key: "scepter", name: "BENU Scepter", markdown: ".planning/content-research/benu-scepter-phase599.md", title: "BENU Scepter：螺旋权杖轮廓、#5 尖与罗马数字颜色", aliases: ["Benu Scepter", "BENU Scepter Fountain Pen", "BENU 权杖系列"], productionState: "historical", release: "约 2019–2020", origin: "BENU 早期俄罗斯品牌语境；后续品牌迁至亚美尼亚，具体批次按盒证", nib: "Schmidt #5 不锈钢尖；常见 F/M/B", fill: "标准国际 cartridge／converter", material: "无笔夹树脂，连续螺旋多面切割与两端外扩轮廓", dimensions: "收帽样本约 133–133.6 mm；最大笔杆约 18.3 mm；握段约 10.2 mm", weight: "样本约 22.7–24 g", status: "历史系列；当前官方目录未列主入口", identity: "Scepter 是 #5 尖的历史螺旋多面体 family，罗马数字区分颜色。", boundary: "Scepter 与 #6、发光树脂的 Grand Scepter 分开；帽盖不可 post，颜色数字不是代际。", variants: [{ key: "phase599-scepter-roman", name: "Scepter I／II／V／VII 等", releaseYear: "约 2019–2021", notes: "罗马数字颜色组，不是代际。", sourceKey: "phase599-benu-scepter-parka", variantKind: "edition_group" }] },
  { key: "grandScepter", name: "BENU Grand Scepter", markdown: ".planning/content-research/benu-grand-scepter-phase599.md", title: "BENU Grand Scepter：#6 尖、发光树脂与同尺寸身份", aliases: ["Benu Grand Scepter", "BENU Grand Scepter Fountain Pen", "BENU 大权杖系列"], productionState: "historical", release: "约 2020", origin: "BENU 早期俄罗斯品牌语境；后续品牌迁至亚美尼亚，具体批次按盒证", nib: "Schmidt #6 不锈钢尖；当时常见 F/M/B，尖幅按 SKU", fill: "标准国际 cartridge／converter", material: "无笔夹树脂，连续螺旋多面切割；具名 Grand 颜色采用吸光后发光树脂", dimensions: "收帽约 133 mm；与普通 Scepter 外壳近似，#6 尖令去帽书写长度略增", weight: "样本约 24 g", status: "历史系列；当前官方目录未列主入口", identity: "Grand Scepter 与普通 Scepter 同形近同尺寸，但以 #6 尖和发光材料形成独立 family。", boundary: "Grand 不表示更长代际；Grand IX／X 等数字是颜色，发光强度受配方、光源和时间影响。", variants: [{ key: "phase599-grand-scepter-roman", name: "Grand Scepter IX／X 等", releaseYear: "约 2020–2021", notes: "罗马数字颜色组；发光强度和色彩按具体配方。", sourceKey: "phase599-benu-grand-scepter-parka", variantKind: "edition_group" }] },
];

function specEvidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function claim(input: { key: string; predicate: string; text: string; source: CuratedSource; scopeKey: string; second?: CuratedSource }): CuratedClaim {
  return {
    key: input.key,
    predicate: input.predicate,
    objectText: input.text,
    factClass: "core",
    confidence: 0.98,
    sourceKey: input.source.key,
    locator: input.source.summary,
    evidence: [
      { key: `${input.key}-primary`, sourceKey: input.source.key, scopeKey: input.scopeKey, locator: input.source.summary },
      ...(input.second ? [{ key: `${input.key}-secondary`, sourceKey: input.second.key, scopeKey: input.scopeKey, locator: input.second.summary }] : []),
    ],
  };
}

function familyPack(definition: FamilyDefinition): CuratedEntityPack {
  const familySources = sources[definition.key];
  const diagram = editorial(definition.key, `${definition.name} 身份与规格事实图`);
  const scopeKey = `phase599:${PHASE599_SLUGS[definition.key]}:canonical`;
  const sourceList = [familySources.primary, familySources.secondary, ...familySources.extras, diagram];
  const specSource = familySources.primary;
  return {
    key: `phase599-${definition.key}-sourced-v1`,
    entityId: PHASE599_IDS[definition.key],
    expectedType: "pen",
    expectedSlug: PHASE599_SLUGS[definition.key],
    canonicalName: definition.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: definition.markdown,
    storyTitle: definition.title,
    primarySourceKey: familySources.primary.key,
    depthTier: "A",
    aliases: definition.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: familySources.primary.key })),
    sources: sourceList,
    scopes: [{ key: scopeKey, scopeKey, productionState: definition.productionState, editionScope: "canonical family；颜色、套装、尖幅、商店独家与罗马数字保留为 variant／SKU" }],
    claims: [
      claim({ key: `phase599-${definition.key}-identity`, predicate: "model_identity", text: definition.identity, source: familySources.primary, second: familySources.secondary, scopeKey }),
      claim({ key: `phase599-${definition.key}-boundary`, predicate: "version_boundary", text: definition.boundary, source: familySources.primary, second: familySources.secondary, scopeKey }),
      claim({ key: `phase599-${definition.key}-care`, predicate: "maintenance_boundary", text: "换墨使用室温清水并充分阴干；不以酒精、热水、研磨剂或强力拆尖处理树脂、镀层、手绘和密封。短笔、eyedropper、发光或特殊尖的额外边界按具体 SKU。", source: familySources.primary, scopeKey }),
    ],
    variants: definition.variants,
    spec: {
      brandEntityId: PHASE599_BENU_BRAND_ID,
      values: { series_name: definition.name, release_year: definition.release, origin_country: definition.origin, nib: definition.nib, fill_system: definition.fill, material: definition.material, dimensions: definition.dimensions, weight: definition.weight, status: definition.status },
      evidence: [
        specEvidence("brand_entity_id", `phase599-${definition.key}-spec-brand`, common.shop.key, scopeKey, "BENU official shop and maker identity"),
        specEvidence("series_name", `phase599-${definition.key}-spec-series`, specSource.key, scopeKey, specSource.summary),
        specEvidence("release_year", `phase599-${definition.key}-spec-release`, familySources.secondary.key, scopeKey, familySources.secondary.summary),
        specEvidence("origin_country", `phase599-${definition.key}-spec-origin`, common.shop.key, scopeKey, "BENU Yerevan production statement; historical batch caveat retained in value"),
        specEvidence("nib", `phase599-${definition.key}-spec-nib`, specSource.key, scopeKey, specSource.summary),
        specEvidence("fill_system", `phase599-${definition.key}-spec-fill`, specSource.key, scopeKey, specSource.summary),
        specEvidence("material", `phase599-${definition.key}-spec-material`, specSource.key, scopeKey, specSource.summary),
        specEvidence("dimensions", `phase599-${definition.key}-spec-dimensions`, familySources.secondary.key, scopeKey, familySources.secondary.summary),
        specEvidence("weight", `phase599-${definition.key}-spec-weight`, familySources.secondary.key, scopeKey, familySources.secondary.summary),
        specEvidence("status", `phase599-${definition.key}-spec-status`, specSource.key, scopeKey, `${specSource.summary}; retrieval ${RETRIEVED}`),
      ],
    },
    media: [{ key: `phase599-${definition.key}-primary`, title: `${definition.name} 事实图（非产品照片）`, sourceKey: diagram.key, localPath: diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；非产品照片，不表示真实颜色、外形、纹理、比例、商标、笔尖或机构。", sourceUrl: diagram.url, usageStatus: "primary" }],
    timeline: [{ key: `phase599-${definition.key}-documented`, title: `${definition.name} 产品身份进入可核实资料`, eventType: definition.productionState === "historical" ? "design_milestone" : "model_released", startDate: definition.release.match(/\d{4}/)?.[0] ?? "2020", circa: true, description: definition.identity, sourceKey: familySources.primary.key }],
  };
}

const phase427BenuBrand = phase427BrandDepthRefreshPacks.find((pack) => pack.entityId === PHASE599_BENU_BRAND_ID);
if (!phase427BenuBrand) throw new Error("Phase 599 requires the Phase 427 BENU brand pack.");

const brandScope = "phase599:benu:brand-current-and-historical-navigation";
const brandPack: CuratedEntityPack = {
  ...phase427BenuBrand,
  key: "phase599-benu-brand-current-family-refresh-v1",
  markdownFile: ".planning/content-research/benu-brand-phase599.md",
  storyTitle: "BENU：当前与历史系列、颜色版本和供墨边界",
  primarySourceKey: common.shop.key,
  sources: [...phase427BenuBrand.sources, common.shop, common.sizeChart, common.converter, common.comparison].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index),
  scopes: [...phase427BenuBrand.scopes, { key: brandScope, scopeKey: brandScope, productionState: "current", editionScope: "当前与历史 canonical family 导航；商店聚合、颜色、套装、尖幅和个性化服务不建立基础型号" }],
  claims: [...phase427BenuBrand.claims, claim({ key: "phase599-benu-brand-current-family-map", predicate: "series_navigation", text: "BENU 品牌页区分当前 Minima、Pixie、AstroGem、Tessera、Haute、Tribute、Cocktail Hour、Ambrosia 与历史 DailyMate、Scepter、Grand Scepter，并继续链接既有 Briolette、Euphoria、Talisman。", source: common.shop, second: common.comparison, scopeKey: brandScope }), claim({ key: "phase599-benu-brand-rejected-navigation", predicate: "identity_boundary", text: "BENU Exclusive、Hidden Gems、Hand-painted pens、New Pens 是商店集合；Euphoria Autograph 是个性化服务范围，均不建立新的基础 pen entity。", source: common.shop, scopeKey: brandScope })],
  timeline: [...(phase427BenuBrand.timeline ?? []), { key: "phase599-benu-current-catalog-verified", title: "BENU 当前目录与历史家族边界复核", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "检索日确认当前目录、短供墨例外和历史 Scepter／DailyMate 边界；不是品牌发布日。", sourceKey: common.shop.key }],
  publicationIntent: "publish",
  publicationBlockers: [],
};

export const phase599BenuPacks: CuratedEntityPack[] = [brandPack, ...families.map(familyPack)];

if (phase599BenuPacks.length !== 12 || new Set(phase599BenuPacks.map((pack) => pack.entityId)).size !== 12) {
  throw new Error("Phase 599 must contain one BENU brand refresh and eleven unique family packs.");
}
