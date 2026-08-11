import type {
  CuratedClaim,
  CuratedConflict,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE596_NAHVALUR_BRAND_ID,
  phase596NahvalurBrandPack,
} from "./phase596-nahvalur-original-horizon-voyage-eclipse";

export const PHASE597_NAHVALUR_BRAND_ID = PHASE596_NAHVALUR_BRAND_ID;

export const PHASE597_IDS = {
  keyWest: "phase597-nahvalur-key-west",
  triad: "phase597-nahvalur-triad",
  tiger2022: "phase597-nahvalur-pen-of-year-tiger-2022",
  rabbit2023: "phase597-nahvalur-pen-of-year-rabbit-2023",
  dragon2024: "phase597-nahvalur-pen-of-year-dragon-2024",
  snake2025: "phase597-nahvalur-pen-of-year-snake-2025",
  horse2026: "phase597-nahvalur-pen-of-year-horse-2026",
} as const;

export const PHASE597_SLUGS = {
  keyWest: "nahvalur-key-west",
  triad: "nahvalur-triad",
  tiger2022: "nahvalur-pen-of-the-year-tiger-2022",
  rabbit2023: "nahvalur-pen-of-the-year-rabbit-2023",
  dragon2024: "nahvalur-pen-of-the-year-dragon-2024",
  snake2025: "nahvalur-pen-of-the-year-snake-2025",
  horse2026: "nahvalur-pen-of-the-year-horse-2026",
} as const;

export type Phase597ModelKey = keyof typeof PHASE597_IDS;

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

function official(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  publishedAt?: string;
  tier?: "primary" | "contemporary_archive";
}): CuratedSource {
  return web({
    ...input,
    registryKey: "nahvalur-official-phase597",
    registryName: "Nahvalur official",
    sourceType: "official",
    tier: input.tier ?? "primary",
    independenceGroup: "nahvalur-official",
    homepageUrl: "https://nahvalur.com/",
    itemType: "web_page",
    author: "Nahvalur",
  });
}

function secondary(input: {
  key: string;
  registryKey: string;
  registryName: string;
  independenceGroup: string;
  title: string;
  url: string;
  homepageUrl: string;
  author: string;
  summary: string;
  locator: string;
  publishedAt?: string;
  sourceType?: "blog" | "retailer";
}): CuratedSource {
  return web({
    ...input,
    sourceType: input.sourceType ?? "retailer",
    tier: "professional_secondary",
    itemType: "web_page",
  });
}

function editorial(key: Phase597ModelKey, title: string): CuratedSource {
  const fileKey = {
    keyWest: "nahvalur-key-west",
    triad: "nahvalur-triad",
    tiger2022: "nahvalur-pen-of-year-tiger-2022",
    rabbit2023: "nahvalur-pen-of-year-rabbit-2023",
    dragon2024: "nahvalur-pen-of-year-dragon-2024",
    snake2025: "nahvalur-pen-of-year-snake-2025",
    horse2026: "nahvalur-pen-of-year-horse-2026",
  }[key];
  const localPath = `/images/library/site-original/phase597/nahvalur/${fileKey}.svg`;
  return {
    key: `phase597-nahvalur-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase597-${fileKey}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase597-${fileKey}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片；不复刻品牌标志、商品照片、真实笔形、颜色、树脂纹理、饰件、笔尖、内部机构或比例。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
  note?: string,
): CuratedSpecEvidence {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies, note };
}

function claim(input: {
  key: string;
  predicate: string;
  objectText: string;
  source: CuratedSource;
  scopeKey: string;
  evidence?: Array<{
    key: string;
    source: CuratedSource;
    scopeKey: string;
    locator?: string;
    note?: string;
  }>;
  confidence?: number;
  editorial?: boolean;
}): CuratedClaim {
  return {
    key: input.key,
    predicate: input.predicate,
    objectText: input.objectText,
    factClass: input.editorial ? "editorial" : "core",
    confidence: input.confidence ?? 0.99,
    sourceKey: input.source.key,
    locator: input.source.summary,
    evidence: [
      {
        key: `${input.key}-primary-evidence`,
        sourceKey: input.source.key,
        scopeKey: input.scopeKey,
        locator: input.source.summary,
      },
      ...(input.evidence ?? []).map((item) => ({
        key: item.key,
        sourceKey: item.source.key,
        scopeKey: item.scopeKey,
        locator: item.locator ?? item.source.summary,
        note: item.note,
      })),
    ],
  };
}

function media(
  key: Phase597ModelKey,
  source: CuratedSource,
): CuratedEntityPack["media"] {
  return [
    {
      key: `phase597-nahvalur-${key}-primary`,
      title: `${source.title}（非产品照片）`,
      sourceKey: source.key,
      localPath: source.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、材料纹理、光泽、外形、比例、商标、笔尖、饰件、库存或内部机构。",
      sourceUrl: source.url,
      usageStatus: "primary",
    },
  ];
}

function mergeSources(
  base: CuratedSource[],
  extras: CuratedSource[],
): CuratedSource[] {
  const byKey = new Map(base.map((source) => [source.key, source]));
  for (const source of extras) byKey.set(source.key, source);
  return [...byKey.values()];
}

const S = {
  series: official({
    key: "phase597-nahvalur-fountain-pen-series",
    title: "Nahvalur Fountain Pen collections",
    url: "https://nahvalur.com/pages/nahvalur-fountain-pen",
    summary:
      "官方书写工具入口把 Triad、Original、Original Plus、Eclipse、Voyage、Nautilus、Horizon、Pen of the Year 与 Pride 放在不同产品路线，支持基础型号与年度型号分层。",
    locator:
      "official writing-instrument navigation and family cards; collections remain separate despite shared nib or platform language",
  }),
  care: official({
    key: "phase597-nahvalur-care-repair",
    title: "Nahvalur Product Care & Repair",
    url: "https://nahvalur.com/pages/product-care-repair",
    summary:
      "官方护理与维修入口用于限定 cartridge/converter 与 piston 的深拆边界；阻力、密封、尾钮或内部机构异常应停止操作并转交品牌服务。",
    locator:
      "official product-care and repair route; used for service boundary rather than undocumented disassembly instructions",
  }),
  faq: official({
    key: "phase597-nahvalur-general-faq",
    title: "Nahvalur General FAQs",
    url: "https://nahvalur.com/pages/general-faqs",
    summary:
      "官网 FAQ 记录品牌由 Narwhal 更名为 Nahvalur；旧 Narwhal 商品名属于 former-name 证据，不另建第二品牌或重复型号。",
    locator:
      "brand-name FAQ and Narwhal-to-Nahvalur naming explanation; former branding remains alias evidence",
  }),
  keyWestCollection: official({
    key: "phase597-nahvalur-key-west-collection",
    title: "Nahvalur Key West collection",
    url: "https://nahvalur.com/collections/nahvalur-key-west",
    summary:
      "官方集合将 Key Largo 与 Islamorada 归入 Key West，并把它定义为品牌首个 cartridge/converter fountain pen；当前两项均显示 sold out。",
    locator:
      "collection description and current product cards: first cartridge/converter fountain pen; Key Largo and Islamorada shown sold out",
  }),
  keyLargo: official({
    key: "phase597-nahvalur-key-west-key-largo",
    title: "Nahvalur Key West Key Largo Fountain Pen",
    url: "https://nahvalur.com/products/key-west-key-largo-fountain-pen",
    summary:
      "Key Largo exact page 确认 2021 Standard Edition、chrome trim、No.6 自制钢尖、国际 cartridge/converter、随附 converter、兼容 Lamy LZ28，以及 143/126/166 mm、25.5 g。",
    locator:
      "exact product identity and specification table: chrome trim, No.6 steel nib, international cartridge/converter, converter included, Lamy LZ28 compatibility, dimensions and weight",
    tier: "contemporary_archive",
  }),
  keyLargoData: official({
    key: "phase597-nahvalur-key-west-key-largo-json",
    title: "Nahvalur Key West Key Largo Shopify product data",
    url: "https://nahvalur.com/products/key-west-key-largo-fountain-pen.js",
    summary:
      "2026-08-11 JSON 将 `02030011/12/13/14` 绑定 F/M/B/Stub，四项均 available=false；完整代码只作停售证据。",
    locator:
      "variants array: 02030011 Fine, 02030012 Medium, 02030013 Broad and 02030014 Stub, all available=false",
  }),
  islamorada: official({
    key: "phase597-nahvalur-key-west-islamorada",
    title: "Nahvalur Key West Islamorada Fountain Pen",
    url: "https://nahvalur.com/products/key-west-islamorada-fountain-pen",
    summary:
      "Islamorada exact page 确认 2021 Standard Edition、gold trim，并与 Key Largo 共用 Key West 的 No.6 钢尖、国际 cartridge/converter 和尺寸范围。",
    locator:
      "exact product identity and specification table: gold trim, No.6 steel nib, international cartridge/converter and Key West dimensions",
    tier: "contemporary_archive",
  }),
  islamoradaData: official({
    key: "phase597-nahvalur-key-west-islamorada-json",
    title: "Nahvalur Key West Islamorada Shopify product data",
    url: "https://nahvalur.com/products/key-west-islamorada-fountain-pen.js",
    summary:
      "2026-08-11 JSON 将 `02030021/22/23/24` 绑定 F/M/B/Stub，四项均 available=false；不建立 current SKU child。",
    locator:
      "variants array: 02030021 Fine, 02030022 Medium, 02030023 Broad and 02030024 Stub, all available=false",
  }),
  keyWestGoldspot: secondary({
    key: "phase597-goldspot-key-west-review",
    registryKey: "goldspot-phase597-nahvalur-key-west",
    registryName: "Goldspot Pens",
    independenceGroup: "goldspot-pens",
    title: "Narwhal Key West Fountain Pen Review",
    url: "https://goldspot.com/blogs/magazine/narwhal-key-west-fountain-pen-review",
    homepageUrl: "https://goldspot.com/",
    author: "Goldspot Pens",
    sourceType: "blog",
    summary:
      "同期评测记录 Key West 使用 cartridge/converter、No.6 钢尖、可后插和轻量树脂笔身；写感只属于评测样笔，不外推全系列。",
    locator:
      "review sample construction, cartridge/converter, No.6 nib, posting and weight context; subjective writing behaviour remains sample-scoped",
  }),
  triadDesign: official({
    key: "phase597-nahvalur-triad-design",
    title: "Nahvalur Triad design page",
    url: "https://nahvalur.com/pages/nahvalur-triad",
    summary:
      "官方设计页确认 Triad 是轻量入门路线，使用 ABS、snap cap、cartridge/converter、silver-plated No.5 钢尖，闭合 130 mm、最大笔杆 17 mm、15 g，并随附一支 cartridge。",
    locator:
      "official Triad design description and specifications: ABS, snap cap, cartridge/converter, silver-plated No.5 steel nib, 130 mm, max 17 mm, 15 g and one cartridge included",
  }),
  triadCollection: official({
    key: "phase597-nahvalur-triad-collection",
    title: "Nahvalur Triad collection",
    url: "https://nahvalur.com/collections/nahvalur-triad",
    summary:
      "官方集合列 Black、Blue、Demonstrator、Chocolate、Verdant、Crimson、Azure、Violet 八色；商品页同时混列 fountain pen 与 RollerBall。",
    locator:
      "current collection cards and eight named colour editions; product pages expose both fountain-pen and RollerBall selectors",
  }),
  triadBlack: official({
    key: "phase597-nahvalur-triad-black-product",
    title: "Nahvalur Triad Black",
    url: "https://nahvalur.com/products/triad-black",
    summary:
      "Black exact page 将 Fine、Medium 与 RollerBall 放在同一 selector；只有前两项属于钢笔，RollerBall 必须排除。",
    locator:
      "exact product selector contains Fine, Medium and RollerBall; instrument type must be filtered before SKU children are created",
  }),
  triadData: official({
    key: "phase597-nahvalur-triad-shopify-data",
    title: "Nahvalur Triad Shopify collection data",
    url: "https://nahvalur.com/collections/nahvalur-triad/products.json?limit=250",
    summary:
      "2026-08-11 JSON 中八色各有 Fine、Medium、RollerBall 三个 available code；本站只接受 16 个 F/M fountain-pen code，排除 8 个 `...8` RollerBall code。",
    locator:
      "eight products and 24 available variants: F suffix 1, M suffix 2 and RollerBall suffix 8 per colour; only 16 fountain-pen variants qualify",
  }),
  triadGoldspot: secondary({
    key: "phase597-goldspot-triad-collection",
    registryKey: "goldspot-phase597-nahvalur-triad",
    registryName: "Goldspot Pens",
    independenceGroup: "goldspot-pens",
    title: "Nahvalur Triad collection at Goldspot",
    url: "https://goldspot.com/collections/nahvalur-triad",
    homepageUrl: "https://goldspot.com/",
    author: "Goldspot Pens",
    summary:
      "零售资料把 Triad 写成 international cartridge/converter compatible，并明确 converter not included；与官网只写一支 cartridge included 相容。",
    locator:
      "retailer accessory statement: international cartridge/converter compatible, one cartridge supplied and converter not included",
  }),
  triadReview: secondary({
    key: "phase597-constrained-creative-triad-review",
    registryKey: "constrained-creative-phase597-nahvalur-triad",
    registryName: "The Constrained Creative",
    independenceGroup: "the-constrained-creative",
    title: "Pen Review: Nahvalur Triad",
    url: "https://www.theconstrainedcreative.com/blog/pen-review-nahvalur-triad",
    homepageUrl: "https://www.theconstrainedcreative.com/",
    author: "The Constrained Creative",
    sourceType: "blog",
    summary:
      "独立评测记录圆角三角握持印象、轻量 ABS、按压帽和 cartridge/converter 使用；主观手感只用于选购提示。",
    locator:
      "independent review sample: rounded triangular body/section impression, light ABS construction, snap cap and cartridge/converter use",
  }),
  penOfYearCollection: official({
    key: "phase597-nahvalur-pen-of-year-collection",
    title: "Nahvalur Pen of the Year collection",
    url: "https://nahvalur.com/collections/nahvalur-pen-of-the-year",
    summary:
      "官方集合把 Pen of the Year 定义为按农历新年与生肖主题连续发布的年度线；系列连续性不合并每年的限量、材料、笔尖和 canonical identity。",
    locator:
      "annual collection identity tied to Lunar New Year and zodiac themes; each named year remains a distinct product release",
  }),
  tigerOfficial: official({
    key: "phase597-nahvalur-year-tiger-official",
    title: "Nahvalur Year of the Tiger announcement",
    url: "https://nahvalur.com/blogs/news/year-of-the-tiger",
    publishedAt: "2022-01-01",
    summary:
      "官方同期公告确认 Tiger 的 oversized Nautilus shape、橙黑 swirling resin、黑色金属件、三枚舷窗、活塞与 No.6 自制钢尖 F/M/B/1.1 Stub/BB。",
    locator:
      "official Year of the Tiger announcement: oversized Nautilus, orange-black resin, black appointments, three portholes, piston and steel nib width list",
    tier: "contemporary_archive",
  }),
  tigerRetail: secondary({
    key: "phase597-goldspot-tiger-2022",
    registryKey: "goldspot-phase597-nahvalur-tiger",
    registryName: "Goldspot Pens",
    independenceGroup: "goldspot-pens",
    title: "Nahvalur Nautilus Year of the Tiger 2022 archive",
    url: "https://goldspot.com/products/nahvalur-nautilus-fountain-pen-in-year-of-the-tiger-limited-edition",
    homepageUrl: "https://goldspot.com/",
    author: "Goldspot Pens",
    summary:
      "零售档案记录 222 支编号限量，并保留钢尖商品与少量 14K 样本／配置证据；14K 不可外推为全部 222 支标准。",
    locator:
      "limited-edition quantity 222 and retailer configuration evidence; gold-nib observations remain sample or option scoped",
  }),
  rabbitPenChalet: secondary({
    key: "phase597-penchalet-rabbit-2023",
    registryKey: "penchalet-phase597-nahvalur-rabbit",
    registryName: "Pen Chalet",
    independenceGroup: "pen-chalet",
    title: "Nahvalur Rabbit 2023 Pen of the Year",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/nahvalur_rabbit_2023_pen_of_the_year_nautilus_fountain_pens.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    summary:
      "授权零售档案确认 Rabbit 2023 为 223 支 Nautilus 活塞限定，Starry Night Resins 珠光白、rose-gold trim、三枚舷窗和 No.6 14K F/M。",
    locator:
      "2023 Rabbit product identity, 223 numbered units, pearl-white Starry Night resin, rose-gold trim, piston, portholes and 14K Fine/Medium",
  }),
  rabbitGentleman: secondary({
    key: "phase597-gentleman-stationer-rabbit-2023",
    registryKey: "gentleman-stationer-phase597-nahvalur-rabbit",
    registryName: "The Gentleman Stationer",
    independenceGroup: "the-gentleman-stationer",
    title: "Spotlight on Nahvalur: Year of the Rabbit",
    url: "https://www.gentlemanstationer.com/blog/2023/1/31/spotlight-on-nahvalur-fountain-pens-introducing-the-year-of-the-rabbit-limited-edition",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "The Gentleman Stationer",
    publishedAt: "2023-01-31",
    sourceType: "blog",
    summary:
      "同期专业文章核实 Year of the Rabbit 的珠光白、rose-gold、Nautilus 活塞轮廓与 14K 金尖定位。",
    locator:
      "contemporary release coverage: pearl-white resin, rose-gold appointments, Nautilus piston platform and 14K nib positioning",
  }),
  brilliantBunny: secondary({
    key: "phase597-penaddict-brilliant-bunny-boundary",
    registryKey: "penaddict-phase597-nahvalur-rabbit",
    registryName: "The Pen Addict",
    independenceGroup: "the-pen-addict",
    title: "Nahvalur Nautilus Enigma Stationery Brilliant Bunny Review",
    url: "https://www.penaddict.com/blog/2023/8/17/nahvalur-nautilus-enigma-stationery-brilliant-bunny",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
    publishedAt: "2023-08-17",
    sourceType: "blog",
    summary:
      "评测确认 Brilliant Bunny 是 Enigma Stationery 的 50 支合作 sibling；兔主题相同，但材料、合作身份与数量均不等于 Rabbit 2023。",
    locator:
      "50-piece Enigma Stationery Brilliant Bunny collaboration identity; used only to reject identity merging with the 223-piece annual Rabbit",
  }),
  dragonPenChalet: secondary({
    key: "phase597-penchalet-dragon-2024",
    registryKey: "penchalet-phase597-nahvalur-dragon",
    registryName: "Pen Chalet",
    independenceGroup: "pen-chalet",
    title: "Nahvalur Pen of the Year Dragon",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/nahvalur_pen_of_the_year_dragon_fountain_pens.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    summary:
      "授权零售档案确认 Dragon 2024 为 224 支 Nautilus 活塞限定，使用黑红金 custom resin、gold-plated trim、三窗与 No.6 钢尖。",
    locator:
      "2024 Dragon identity, 224 numbered units, custom black/red/gold resin, gold-plated trim, piston, portholes and in-house steel nib",
  }),
  dragonAfth: secondary({
    key: "phase597-afth-dragon-2024",
    registryKey: "afth-phase597-nahvalur-dragon",
    registryName: "AFTH",
    independenceGroup: "afth",
    title: "Nahvalur Nautilus Pen of the Year Dragon 2024",
    url: "https://www.afth.co.uk/nahvalur---nautilus---pen-of-the-year-2024---dragon---limited-edition-56061-p.asp",
    homepageUrl: "https://www.afth.co.uk/",
    author: "AFTH",
    summary:
      "零售档案提供 `03080041`、149/133 mm、不可后插、13 mm 笔杆、10–11.5 mm 握段与 36.85 g；只核实一个代码，不推导相邻代码。",
    locator:
      "archived product code 03080041 and product measurements; neighbouring code sequence is not present and must not be inferred",
  }),
  dragonGentleman: secondary({
    key: "phase597-gentleman-stationer-dragon-2024",
    registryKey: "gentleman-stationer-phase597-nahvalur-dragon",
    registryName: "The Gentleman Stationer",
    independenceGroup: "the-gentleman-stationer",
    title: "Thursday Drops: Nahvalur Pen of the Year Dragon",
    url: "https://www.gentlemanstationer.com/blog/2024/1/18/thursday-drops-nahavalur-pen-of-the-year-twsbi-diamond-580-al-black-and-more",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "The Gentleman Stationer",
    publishedAt: "2024-01-18",
    sourceType: "blog",
    summary:
      "同期实物观察指出黑红金 custom resin 的层次随光线和单支纹理变化；只用于图片与选购边界。",
    locator:
      "contemporary arrival coverage and sample observation of black/red/gold custom resin variation under photography",
  }),
  snakeOfficial: official({
    key: "phase597-nahvalur-snake-2025-official",
    title: "Nahvalur Pen of the Year Snake 2025",
    url: "https://nahvalur.com/products/pen-of-the-year-snake-2025-fountain-pen",
    summary:
      "官方历史商品资料确认 classic Nautilus shape、绿色金色银色树脂、gold trim、蛇形 sterling-silver 夹与绿色石饰、No.6 钢尖或 14K、活塞及 149/133 mm、36.85 g；当前 URL 已撤下。",
    locator:
      "historical exact-product specifications and design copy; current endpoint returned 404 on retrieval, so availability is not retained",
    tier: "contemporary_archive",
  }),
  snakePenChalet: secondary({
    key: "phase597-penchalet-snake-2025",
    registryKey: "penchalet-phase597-nahvalur-snake",
    registryName: "Pen Chalet",
    independenceGroup: "pen-chalet",
    title: "Nahvalur Pen of the Year Snake",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/nahvalur_narwhal_pen_of_the_year_snake_fountain_pens.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    summary:
      "授权零售档案确认 888 支、Nautilus 活塞与主题材料，但重量写 28.35 g；该值与官方 36.85 g 冲突。",
    locator:
      "888-piece product identity and archived specifications including retailer weight 28.35 g; out-of-stock state retained",
  }),
  snakeGoldspot: secondary({
    key: "phase597-goldspot-snake-2025",
    registryKey: "goldspot-phase597-nahvalur-snake",
    registryName: "Goldspot Pens",
    independenceGroup: "goldspot-pens",
    title: "Nahvalur Pen of the Year Snake 2025",
    url: "https://goldspot.com/products/nahvalur-nautilus-fountain-pen-in-pen-of-the-year-snake-2025",
    homepageUrl: "https://goldspot.com/",
    author: "Goldspot Pens",
    summary:
      "零售档案交叉核实绿色金色银色主题、蛇形夹、三枚舷窗、内部活塞及钢尖／14K 路径。",
    locator:
      "retailer archive cross-check for themed resin, snake clip, three portholes, piston and steel/gold nib choices",
  }),
  horseOfficial: official({
    key: "phase597-nahvalur-horse-2026-official",
    title: "Nahvalur Pen of the Year Horse 2026",
    url: "https://nahvalur.com/products/nahvalur-pen-of-the-year-horse-2026-fountain-pen",
    summary:
      "官方 exact page 确认黑金 resin、bronze trim/clip、No.6 钢尖或 14K、活塞、149/133 mm、不可后插、13 mm 笔杆、10–11.5 mm 握段与 36.85 g。",
    locator:
      "current exact-product title, theme copy and specification table: resin, bronze trim/clip, steel or 14K No.6 nib, piston, dimensions and weight",
  }),
  horseData: official({
    key: "phase597-nahvalur-horse-2026-json",
    title: "Nahvalur Horse 2026 Shopify product data",
    url: "https://nahvalur.com/products/nahvalur-pen-of-the-year-horse-2026-fountain-pen.js",
    summary:
      "2026-08-11 JSON 将 `03080060/61/62/63/64/67` 绑定 EF/F/M/B/Stub/DB，六项均 available=false，且没有独立 14K SKU 标记。",
    locator:
      "variants array: six complete codes, all available=false and identically priced; titles contain width only and no gold-nib material branch",
  }),
  horseAtlas: secondary({
    key: "phase597-atlas-horse-2026",
    registryKey: "atlas-phase597-nahvalur-horse",
    registryName: "Atlas Stationers",
    independenceGroup: "atlas-stationers",
    title: "Nahvalur Nautilus Pen of the Year Horse",
    url: "https://www.atlasstationers.com/collections/nahvalur-nautilus-pens/products/nahvalur-narwhal-nautilus-fountain-pen-pen-of-the-year-horse-limited-edition",
    homepageUrl: "https://www.atlasstationers.com/",
    author: "Atlas Stationers",
    summary:
      "授权零售页记录 classic Nautilus form、horse-motif cap ring、999 支、steel `03080061`、black/gold acrylic、bronze PVD、150/131 mm 和 31 g。",
    locator:
      "999-piece retailer statement, Nautilus silhouette, horse motif, Fine SKU 03080061 and alternate material/measurement table",
  }),
  horseStilo: secondary({
    key: "phase597-stilo-horse-2026",
    registryKey: "stilo-phase597-nahvalur-horse",
    registryName: "Stilo e Stile",
    independenceGroup: "stilo-e-stile",
    title: "Nahvalur Nautilus Horse Pen of the Year 2026",
    url: "https://www.stiloestile.com/en/fountain-pens/special-limited-edition/nahvalur-nautilus-fountain-pen-horse-pen-of-the-year-2026",
    homepageUrl: "https://www.stiloestile.com/",
    author: "Stilo e Stile",
    summary:
      "专业零售档案交叉核实 999 支、Nautilus platform、黑金材料、bronze details、活塞和尖幅。",
    locator:
      "retailer archive cross-check for 999 units, Nautilus construction, black/gold material, bronze appointments, piston and widths",
  }),
  keyWestDiagram: editorial(
    "keyWest",
    "Nahvalur Key West 墨水系统、两个版本与停售代码事实图",
  ),
  triadDiagram: editorial(
    "triad",
    "Nahvalur Triad 八色、钢笔 SKU 与 RollerBall 排除事实图",
  ),
  tiger2022Diagram: editorial(
    "tiger2022",
    "Nahvalur Pen of the Year Tiger 2022 限量与笔尖范围事实图",
  ),
  rabbit2023Diagram: editorial(
    "rabbit2023",
    "Nahvalur Pen of the Year Rabbit 2023 身份与 Brilliant Bunny 排除事实图",
  ),
  dragon2024Diagram: editorial(
    "dragon2024",
    "Nahvalur Pen of the Year Dragon 2024 限量与代码证据事实图",
  ),
  snake2025Diagram: editorial(
    "snake2025",
    "Nahvalur Pen of the Year Snake 2025 限量、银夹与重量冲突事实图",
  ),
  horse2026Diagram: editorial(
    "horse2026",
    "Nahvalur Pen of the Year Horse 2026 售罄代码与来源冲突事实图",
  ),
};

export const PHASE597_KEY_WEST_UNAVAILABLE_CODES = [
  "02030011",
  "02030012",
  "02030013",
  "02030014",
  "02030021",
  "02030022",
  "02030023",
  "02030024",
] as const;

export const PHASE597_TRIAD_CURRENT_SKUS = [
  ["black", "Black", "2025", "Fine", "10130011"],
  ["black", "Black", "2025", "Medium", "10130012"],
  ["blue", "Blue", "2025", "Fine", "10130021"],
  ["blue", "Blue", "2025", "Medium", "10130022"],
  ["demonstrator", "Demonstrator", "2025", "Fine", "10130031"],
  ["demonstrator", "Demonstrator", "2025", "Medium", "10130032"],
  ["chocolate", "Chocolate", "2025", "Fine", "10130041"],
  ["chocolate", "Chocolate", "2025", "Medium", "10130042"],
  ["verdant", "Verdant", "2026", "Fine", "10130051"],
  ["verdant", "Verdant", "2026", "Medium", "10130052"],
  ["crimson", "Crimson", "2026", "Fine", "10130061"],
  ["crimson", "Crimson", "2026", "Medium", "10130062"],
  ["azure", "Azure", "2026", "Fine", "10130071"],
  ["azure", "Azure", "2026", "Medium", "10130072"],
  ["violet", "Violet", "2026", "Fine", "10130081"],
  ["violet", "Violet", "2026", "Medium", "10130082"],
] as const;

export const PHASE597_TRIAD_EXCLUDED_ROLLERBALL_CODES = [
  "10130018",
  "10130028",
  "10130038",
  "10130048",
  "10130058",
  "10130068",
  "10130078",
  "10130088",
] as const;

export const PHASE597_HORSE_UNAVAILABLE_CODES = [
  "03080060",
  "03080061",
  "03080062",
  "03080063",
  "03080064",
  "03080067",
] as const;

const keyWestFamily = "phase597-nahvalur-key-west-family";
const keyWestKeyLargo = "phase597-nahvalur-key-west-key-largo";
const keyWestIslamorada = "phase597-nahvalur-key-west-islamorada";
const keyWestUnavailable = "phase597-nahvalur-key-west-unavailable";
const keyLargoEdition = "phase597-nahvalur-key-west-key-largo-edition";
const islamoradaEdition = "phase597-nahvalur-key-west-islamorada-edition";

export const phase597NahvalurKeyWestPack: CuratedEntityPack = {
  key: "phase597-nahvalur-key-west-v1",
  entityId: PHASE597_IDS.keyWest,
  expectedType: "pen",
  expectedSlug: PHASE597_SLUGS.keyWest,
  canonicalName: "Nahvalur Key West Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/nahvalur-key-west-phase597.md",
  storyTitle:
    "Nahvalur Key West：首个 cartridge/converter 路线、两种饰件与八个停售代码",
  primarySourceKey: S.keyWestCollection.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Nahvalur Key West",
      language: "en",
      sourceKey: S.keyWestCollection.key,
    },
    {
      alias: "Narwhal Key West",
      language: "en",
      kind: "former_name",
      sourceKey: S.faq.key,
    },
    {
      alias: "Nahvalur Key West Key Largo",
      language: "en",
      sourceKey: S.keyLargo.key,
      market: "Key Largo edition",
    },
    {
      alias: "Nahvalur Key West Islamorada",
      language: "en",
      sourceKey: S.islamorada.key,
      market: "Islamorada edition",
    },
    {
      alias: "纳瓦尔 Key West 钢笔",
      language: "zh",
      sourceKey: S.keyWestCollection.key,
    },
  ],
  sources: [
    S.keyWestCollection,
    S.keyLargo,
    S.keyLargoData,
    S.islamorada,
    S.islamoradaData,
    S.series,
    S.care,
    S.faq,
    S.keyWestGoldspot,
    S.keyWestDiagram,
  ],
  scopes: [
    {
      key: keyWestFamily,
      scopeKey: keyWestFamily,
      market: "Nahvalur Key West family",
      validFrom: "2021",
      productionState: "historical",
      nibScope:
        "No.6 in-house stainless steel; archived F/M/B/Stub selectors do not imply current stock.",
      materialScope:
        "Resin family; chrome and gold describe edition trim, not two base models.",
      editionScope:
        "First Nahvalur cartridge/converter fountain-pen route; kept separate from piston and vacuum families.",
    },
    {
      key: keyWestKeyLargo,
      scopeKey: keyWestKeyLargo,
      variantKey: keyLargoEdition,
      market: "2021 Standard Edition Key Largo",
      validFrom: "2021",
      validTo: RETRIEVED,
      productionState: "historical",
      nibScope:
        "Fine, Medium, Broad and Stub complete codes exist but all are unavailable on the retrieval date.",
      materialScope: "Key Largo chrome trim only.",
      editionScope:
        "Edition group with no current market-SKU children; four complete codes remain status evidence.",
    },
    {
      key: keyWestIslamorada,
      scopeKey: keyWestIslamorada,
      variantKey: islamoradaEdition,
      market: "2021 Standard Edition Islamorada",
      validFrom: "2021",
      validTo: RETRIEVED,
      productionState: "historical",
      nibScope:
        "Fine, Medium, Broad and Stub complete codes exist but all are unavailable on the retrieval date.",
      materialScope: "Islamorada gold trim only.",
      editionScope:
        "Edition group with no current market-SKU children; four complete codes remain status evidence.",
    },
    {
      key: keyWestUnavailable,
      scopeKey: keyWestUnavailable,
      market: "2026-08-11 official unavailable selector evidence",
      validFrom: RETRIEVED,
      productionState: "historical",
      nibScope:
        "Eight complete codes are known but none qualifies as a current available market SKU.",
      editionScope:
        "Unavailable codes must not be converted into current child variants.",
    },
  ],
  claims: [
    claim({
      key: "phase597-nahvalur-key-west-identity",
      predicate: "model_identity",
      objectText:
        "Nahvalur Key West Fountain Pen is one canonical cartridge/converter family. Key Largo and Islamorada are chrome- and gold-trim edition groups, while Narwhal is the former brand name.",
      source: S.keyWestCollection,
      scopeKey: keyWestFamily,
      evidence: [
        {
          key: "phase597-key-west-identity-key-largo-evidence",
          source: S.keyLargo,
          scopeKey: keyWestKeyLargo,
        },
        {
          key: "phase597-key-west-identity-islamorada-evidence",
          source: S.islamorada,
          scopeKey: keyWestIslamorada,
        },
        {
          key: "phase597-key-west-former-name-evidence",
          source: S.faq,
          scopeKey: keyWestFamily,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-key-west-first-converter-line",
      predicate: "family_boundary",
      objectText:
        "Key West is documented by Nahvalur as its first cartridge/converter fountain-pen route. It accepts international cartridges and converters, includes a converter and is compatible with Lamy LZ28; it is not a piston or vacuum model.",
      source: S.keyWestCollection,
      scopeKey: keyWestFamily,
      evidence: [
        {
          key: "phase597-key-west-converter-product-evidence",
          source: S.keyLargo,
          scopeKey: keyWestKeyLargo,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-key-west-configuration",
      predicate: "model_configuration",
      objectText:
        "The archived Key West specification uses an in-house No.6 stainless-steel nib, measures 143 mm capped, 126 mm uncapped and 166 mm posted, and weighs 25.5 g; chrome and gold trim stay edition-scoped.",
      source: S.keyLargo,
      scopeKey: keyWestFamily,
      evidence: [
        {
          key: "phase597-key-west-islamorada-trim-evidence",
          source: S.islamorada,
          scopeKey: keyWestIslamorada,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-key-west-unavailable-codes",
      predicate: "variant_availability_boundary",
      objectText:
        "All eight complete Key Largo and Islamorada codes are available=false in the 2026-08-11 official product data. They remain historical selector evidence and create no current market-SKU children.",
      source: S.keyLargoData,
      scopeKey: keyWestUnavailable,
      evidence: [
        {
          key: "phase597-key-west-unavailable-islamorada-evidence",
          source: S.islamoradaData,
          scopeKey: keyWestUnavailable,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-key-west-review-scope",
      predicate: "review_sample_boundary",
      objectText:
        "A contemporary professional review cross-checks the lightweight cartridge/converter construction and posting behaviour. Its individual writing feel remains sample-scoped and is not generalized to every Key West nib.",
      source: S.keyWestGoldspot,
      scopeKey: keyWestFamily,
      editorial: true,
    }),
    claim({
      key: "phase597-nahvalur-key-west-maintenance",
      predicate: "maintenance_boundary",
      objectText:
        "Routine care removes the cartridge or converter and flushes the nib unit with cool water. A stuck converter, cracked section or persistent flow fault is a service boundary, not a reason for undocumented force or solvent use.",
      source: S.care,
      scopeKey: keyWestFamily,
      editorial: true,
    }),
  ],
  variants: [
    {
      key: keyLargoEdition,
      name: "Key West Key Largo",
      releaseYear: "2021",
      notes:
        "Chrome-trim Standard Edition; 02030011/12/13/14 are complete but unavailable and therefore are not child variants.",
      sourceKey: S.keyLargo.key,
      variantKind: "edition_group",
      market: "historical global edition",
    },
    {
      key: islamoradaEdition,
      name: "Key West Islamorada",
      releaseYear: "2021",
      notes:
        "Gold-trim Standard Edition; 02030021/22/23/24 are complete but unavailable and therefore are not child variants.",
      sourceKey: S.islamorada.key,
      variantKind: "edition_group",
      market: "historical global edition",
    },
  ],
  spec: {
    brandEntityId: PHASE597_NAHVALUR_BRAND_ID,
    values: {
      series_name:
        "Nahvalur Key West Fountain Pen; Key Largo and Islamorada are edition groups; Narwhal is the former brand name",
      release_year: "2021 Standard Edition",
      nib:
        "Nahvalur in-house No.6 stainless steel; archived F/M/B/Stub selectors, no current available SKU",
      fill_system:
        "International cartridge/converter; converter included; compatible with Lamy LZ28",
      material:
        "Resin family; Key Largo chrome trim and Islamorada gold trim",
      dimensions:
        "143 mm capped, 126 mm uncapped, 166 mm posted; barrel 12.5 mm and grip approximately 9–10.5 mm",
      weight: "25.5 g archived official product specification",
      status:
        "Historical/sold out on 2026-08-11; eight complete official codes are unavailable and create no current market-SKU children",
    },
    evidence: [
      evidence(
        "brand_entity_id",
        "phase597-key-west-spec-brand",
        S.keyWestCollection.key,
        keyWestFamily,
        "official collection places Key West under Nahvalur",
      ),
      evidence(
        "series_name",
        "phase597-key-west-spec-series",
        S.keyWestCollection.key,
        keyWestFamily,
        "official collection title and Key Largo/Islamorada product grouping",
      ),
      evidence(
        "release_year",
        "phase597-key-west-spec-release",
        S.keyLargo.key,
        keyWestKeyLargo,
        "2021 Standard Edition wording",
      ),
      evidence(
        "nib",
        "phase597-key-west-spec-nib",
        S.keyLargo.key,
        keyWestFamily,
        "in-house No.6 stainless-steel nib and archived width selector",
      ),
      evidence(
        "fill_system",
        "phase597-key-west-spec-fill",
        S.keyLargo.key,
        keyWestFamily,
        "international cartridge/converter, converter included and Lamy LZ28 compatible",
      ),
      evidence(
        "fill_system",
        "phase597-key-west-spec-fill-secondary-cross-check",
        S.keyWestGoldspot.key,
        keyWestFamily,
        "professional review independently cross-checks the cartridge/converter filling system",
      ),
      evidence(
        "material",
        "phase597-key-west-spec-material-key-largo",
        S.keyLargo.key,
        keyWestKeyLargo,
        "Key Largo chrome trim",
      ),
      evidence(
        "material",
        "phase597-key-west-spec-material-islamorada",
        S.islamorada.key,
        keyWestIslamorada,
        "Islamorada gold trim",
      ),
      evidence(
        "dimensions",
        "phase597-key-west-spec-dimensions",
        S.keyLargo.key,
        keyWestFamily,
        "143/126/166 mm, 12.5 mm barrel and approximately 9–10.5 mm grip",
      ),
      evidence(
        "weight",
        "phase597-key-west-spec-weight",
        S.keyLargo.key,
        keyWestFamily,
        "official archived weight 25.5 g",
      ),
      evidence(
        "status",
        "phase597-key-west-spec-status-sold-out",
        S.keyWestCollection.key,
        keyWestFamily,
        "official collection shows Key Largo and Islamorada sold out on 2026-08-11",
      ),
      evidence(
        "status",
        "phase597-key-west-spec-unavailable-key-largo",
        S.keyLargoData.key,
        keyWestUnavailable,
        "02030011/12/13/14 all available=false on 2026-08-11",
        false,
      ),
      evidence(
        "status",
        "phase597-key-west-spec-unavailable-islamorada",
        S.islamoradaData.key,
        keyWestUnavailable,
        "02030021/22/23/24 all available=false on 2026-08-11",
        false,
      ),
    ],
  },
  media: media("keyWest", S.keyWestDiagram),
  timeline: [
    {
      key: "phase597-nahvalur-key-west-2021",
      title: "Key West Standard Editions documented",
      eventType: "model_released",
      startDate: "2021",
      circa: false,
      description:
        "Key Largo and Islamorada establish Nahvalur's cartridge/converter branch with different trim scopes.",
      sourceKey: S.keyLargo.key,
    },
    {
      key: "phase597-nahvalur-key-west-unavailable-verified",
      title: "Eight archived Key West codes verified unavailable",
      eventType: "discontinued",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Retrieval date records two sold-out edition groups and eight unavailable codes; no discontinuation day is inferred.",
      sourceKey: S.keyWestCollection.key,
    },
  ],
  conflicts: [
    {
      key: "phase597-nahvalur-key-west-availability-conflict",
      fieldKey: "variant_availability",
      scopeKey: keyWestFamily,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Complete archived codes do not qualify as current children when official JSON says available=false. Key Largo and Islamorada remain edition groups only.",
      members: [
        {
          citationKey: "phase597-key-west-spec-unavailable-key-largo",
          assertedValue: "four Key Largo codes available=false",
        },
        {
          citationKey: "phase597-key-west-spec-unavailable-islamorada",
          assertedValue: "four Islamorada codes available=false",
        },
      ],
    },
  ],
};

const triadFamily = "phase597-nahvalur-triad-family";
const triadCurrent = "phase597-nahvalur-triad-current";
const triadRollerball = "phase597-nahvalur-triad-rollerball-rejected";
const triadConverter = "phase597-nahvalur-triad-converter-boundary";

const TRIAD_COLORS = [
  ["black", "Black", "2025"],
  ["blue", "Blue", "2025"],
  ["demonstrator", "Demonstrator", "2025"],
  ["chocolate", "Chocolate", "2025"],
  ["verdant", "Verdant", "2026"],
  ["crimson", "Crimson", "2026"],
  ["azure", "Azure", "2026"],
  ["violet", "Violet", "2026"],
] as const;

export const phase597NahvalurTriadPack: CuratedEntityPack = {
  key: "phase597-nahvalur-triad-v1",
  entityId: PHASE597_IDS.triad,
  expectedType: "pen",
  expectedSlug: PHASE597_SLUGS.triad,
  canonicalName: "Nahvalur Triad Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/nahvalur-triad-phase597.md",
  storyTitle:
    "Nahvalur Triad：轻量 ABS、八色十六个钢笔 SKU 与 RollerBall 排除",
  primarySourceKey: S.triadDesign.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Nahvalur Triad",
      language: "en",
      sourceKey: S.triadDesign.key,
    },
    {
      alias: "Nahvalur Triad Fountain Pen",
      language: "en",
      sourceKey: S.triadCollection.key,
    },
    {
      alias: "纳瓦尔 Triad 钢笔",
      language: "zh",
      sourceKey: S.triadDesign.key,
    },
  ],
  sources: [
    S.triadDesign,
    S.triadCollection,
    S.triadBlack,
    S.triadData,
    S.triadGoldspot,
    S.triadReview,
    S.series,
    S.care,
    S.triadDiagram,
  ],
  scopes: [
    {
      key: triadFamily,
      scopeKey: triadFamily,
      market: "Nahvalur Triad fountain-pen family",
      validFrom: "2025",
      productionState: "current",
      nibScope:
        "Silver-plated No.5 stainless steel; current fountain-pen children are Fine and Medium only.",
      materialScope:
        "Lightweight ABS; rounded triangular body/section impressions are descriptive, not exact geometry.",
      editionScope:
        "Eight colour edition groups share the family; RollerBall selectors are another instrument type.",
    },
    {
      key: triadCurrent,
      scopeKey: triadCurrent,
      market: "2026-08-11 current official selector",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Sixteen available fountain-pen codes: Fine and Medium under each of eight colour parents.",
      editionScope:
        "Every market SKU is parented by an edition_group; no colour becomes a duplicate base entity.",
    },
    {
      key: triadRollerball,
      scopeKey: triadRollerball,
      market: "same-page RollerBall selectors",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Eight RollerBall codes have no fountain-pen nib and are explicitly rejected from pen SKU topology.",
      editionScope:
        "Same product page does not override instrument type.",
    },
    {
      key: triadConverter,
      scopeKey: triadConverter,
      market: "accessory and filling boundary",
      productionState: "current",
      nibScope: "Not applicable to nib availability.",
      editionScope:
        "Official page states cartridge/converter and one cartridge included; retailer states converter not included.",
    },
  ],
  claims: [
    claim({
      key: "phase597-nahvalur-triad-identity",
      predicate: "model_identity",
      objectText:
        "Nahvalur Triad Fountain Pen is one lightweight ABS cartridge/converter family. Its eight colours are edition groups and its same-page RollerBall choices are not fountain-pen variants.",
      source: S.triadDesign,
      scopeKey: triadFamily,
      evidence: [
        {
          key: "phase597-triad-identity-collection-evidence",
          source: S.triadCollection,
          scopeKey: triadFamily,
        },
        {
          key: "phase597-triad-identity-selector-evidence",
          source: S.triadBlack,
          scopeKey: triadRollerball,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-triad-configuration",
      predicate: "model_configuration",
      objectText:
        "Triad uses ABS, a snap cap, cartridge/converter filling and a silver-plated No.5 stainless-steel nib. Official dimensions are 130 mm capped, maximum barrel width 17 mm and total weight 15 g.",
      source: S.triadDesign,
      scopeKey: triadFamily,
    }),
    claim({
      key: "phase597-nahvalur-triad-current-skus",
      predicate: "variant_availability_boundary",
      objectText:
        "The 2026-08-11 official data exposes sixteen available fountain-pen market SKUs: Fine and Medium under Black, Blue, Demonstrator, Chocolate, Verdant, Crimson, Azure and Violet edition groups.",
      source: S.triadData,
      scopeKey: triadCurrent,
    }),
    claim({
      key: "phase597-nahvalur-triad-rollerball-exclusion",
      predicate: "instrument_type_boundary",
      objectText:
        "Eight available RollerBall codes ending in 8 appear beside the fountain-pen widths but are excluded because they are a different writing instrument, not a nib or pen SKU.",
      source: S.triadData,
      scopeKey: triadRollerball,
      evidence: [
        {
          key: "phase597-triad-rollerball-page-evidence",
          source: S.triadBlack,
          scopeKey: triadRollerball,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-triad-converter-boundary",
      predicate: "included_accessories",
      objectText:
        "Triad is compatible with cartridges and converters and includes one cartridge. Reliable retailer documentation says the converter is not included, so compatibility must not be rewritten as an included converter.",
      source: S.triadDesign,
      scopeKey: triadConverter,
      evidence: [
        {
          key: "phase597-triad-converter-not-included-evidence",
          source: S.triadGoldspot,
          scopeKey: triadConverter,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-triad-maintenance",
      predicate: "maintenance_boundary",
      objectText:
        "Routine cleaning removes the cartridge or converter and flushes the No.5 nib unit with cool water. The light snap cap and ABS body should not be forced, solvent-cleaned or treated as service-access instructions.",
      source: S.care,
      scopeKey: triadFamily,
      editorial: true,
    }),
  ],
  variants: [
    ...TRIAD_COLORS.map(([slug, name, releaseYear]) => ({
      key: `phase597-nahvalur-triad-${slug}-edition`,
      name: `Triad ${name}`,
      releaseYear,
      notes:
        "Current colour edition group; Fine and Medium fountain-pen SKU children only.",
      sourceKey: S.triadCollection.key,
      variantKind: "edition_group" as const,
      market: "global current",
    })),
    ...PHASE597_TRIAD_CURRENT_SKUS.map(
      ([colorSlug, colorName, releaseYear, widthName, productCode]) => ({
        key: `phase597-nahvalur-triad-${colorSlug}-${widthName.toLowerCase()}-sku`,
        name: `Triad ${colorName} ${widthName}`,
        releaseYear,
        notes:
          "Complete available fountain-pen code from 2026-08-11 official Shopify data; RollerBall sibling is excluded.",
        sourceKey: S.triadData.key,
        variantKind: "market_sku" as const,
        parentVariantKey: `phase597-nahvalur-triad-${colorSlug}-edition`,
        productCode,
        market: "current Triad fountain-pen selector",
      }),
    ),
  ],
  spec: {
    brandEntityId: PHASE597_NAHVALUR_BRAND_ID,
    values: {
      series_name:
        "Nahvalur Triad Fountain Pen; eight colour edition groups; RollerBall selectors excluded",
      release_year:
        "2025 launch group: Black, Blue, Demonstrator, Chocolate; 2026 additions: Verdant, Crimson, Azure, Violet",
      nib:
        "Silver-plated Nahvalur No.5 stainless steel; current fountain-pen widths Fine and Medium",
      fill_system:
        "International cartridge/converter; one cartridge included; reliable retailer says converter not included",
      material: "Lightweight ABS with snap cap",
      dimensions: "130 mm capped; maximum barrel width 17 mm",
      weight: "15 g official specification",
      status:
        "Current 2026-08-11: 16 available fountain-pen SKUs under eight edition groups; eight available RollerBall codes rejected",
    },
    evidence: [
      evidence(
        "brand_entity_id",
        "phase597-triad-spec-brand",
        S.triadDesign.key,
        triadFamily,
        "official design page places Triad under Nahvalur",
      ),
      evidence(
        "series_name",
        "phase597-triad-spec-series",
        S.triadCollection.key,
        triadFamily,
        "official Triad collection and eight colour product cards",
      ),
      evidence(
        "release_year",
        "phase597-triad-spec-release",
        S.triadCollection.key,
        triadFamily,
        "first four product publication dates in 2025 and later four in 2026",
      ),
      evidence(
        "nib",
        "phase597-triad-spec-nib",
        S.triadDesign.key,
        triadFamily,
        "silver-plated No.5 stainless-steel nib",
      ),
      evidence(
        "fill_system",
        "phase597-triad-spec-fill",
        S.triadDesign.key,
        triadConverter,
        "cartridge/converter system and one cartridge included",
      ),
      evidence(
        "fill_system",
        "phase597-triad-spec-converter-not-included",
        S.triadGoldspot.key,
        triadConverter,
        "reliable retailer explicitly states converter not included",
      ),
      evidence(
        "material",
        "phase597-triad-spec-material",
        S.triadDesign.key,
        triadFamily,
        "ABS construction and snap cap",
      ),
      evidence(
        "dimensions",
        "phase597-triad-spec-dimensions",
        S.triadDesign.key,
        triadFamily,
        "130 mm capped and maximum barrel width 17 mm",
      ),
      evidence(
        "weight",
        "phase597-triad-spec-weight",
        S.triadDesign.key,
        triadFamily,
        "official total weight 15 g",
      ),
      evidence(
        "status",
        "phase597-triad-spec-current-fountain-skus",
        S.triadData.key,
        triadCurrent,
        "sixteen F/M complete codes available=true on 2026-08-11",
      ),
      evidence(
        "status",
        "phase597-triad-spec-rejected-rollerball",
        S.triadData.key,
        triadRollerball,
        "eight RollerBall complete codes are available but fail fountain-pen instrument type",
        false,
      ),
    ],
  },
  media: media("triad", S.triadDiagram),
  timeline: [
    {
      key: "phase597-nahvalur-triad-2025-launch",
      title: "Triad launch colour group documented",
      eventType: "model_released",
      startDate: "2025",
      circa: true,
      description:
        "Black, Blue, Demonstrator and Chocolate form the first documented colour group.",
      sourceKey: S.triadCollection.key,
    },
    {
      key: "phase597-nahvalur-triad-2026-colours",
      title: "Four later Triad colours documented",
      eventType: "design_milestone",
      startDate: "2026",
      circa: true,
      description:
        "Verdant, Crimson, Azure and Violet extend the same base family rather than creating new model entities.",
      sourceKey: S.triadCollection.key,
    },
    {
      key: "phase597-nahvalur-triad-current-verified",
      title: "Sixteen current fountain-pen SKUs verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Retrieval date records sixteen accepted F/M codes and eight explicitly rejected RollerBall codes.",
      sourceKey: S.triadData.key,
    },
  ],
  conflicts: [
    {
      key: "phase597-nahvalur-triad-instrument-conflict",
      fieldKey: "instrument_type",
      scopeKey: triadFamily,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote:
        "F/M selectors qualify as fountain-pen market SKUs. RollerBall is a different instrument type even when sold on the same colour page and remains excluded.",
      members: [
        {
          citationKey: "phase597-triad-spec-current-fountain-skus",
          assertedValue: "sixteen F/M fountain-pen codes available",
        },
        {
          citationKey: "phase597-triad-spec-rejected-rollerball",
          assertedValue: "eight RollerBall codes fail instrument type",
        },
      ],
    },
    {
      key: "phase597-nahvalur-triad-converter-conflict",
      fieldKey: "fill_system",
      scopeKey: triadConverter,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The pen is converter-compatible and ships with one cartridge. Reliable retailer evidence says a converter is not included, so compatibility is not treated as an included accessory.",
      members: [
        {
          citationKey: "phase597-triad-spec-fill",
          assertedValue: "official cartridge/converter compatibility and cartridge included",
        },
        {
          citationKey: "phase597-triad-spec-converter-not-included",
          assertedValue: "retailer says converter not included",
        },
      ],
    },
  ],
};

type AnnualModelKey = Exclude<Phase597ModelKey, "keyWest" | "triad">;

interface AnnualPackConfig {
  key: AnnualModelKey;
  canonicalName: string;
  markdownFile: string;
  storyTitle: string;
  primary: CuratedSource;
  sources: CuratedSource[];
  aliases: CuratedEntityPack["aliases"];
  releaseYear: string;
  editionName: string;
  editionNotes: string;
  mainScope: string;
  scopes: CuratedScope[];
  identityText: string;
  configurationText: string;
  statusText: string;
  configurationSource: CuratedSource;
  statusSource: CuratedSource;
  extraClaims?: CuratedClaim[];
  specValues: NonNullable<CuratedEntityPack["spec"]>["values"];
  specEvidence: CuratedSpecEvidence[];
  releaseDescription: string;
  extraTimeline?: NonNullable<CuratedEntityPack["timeline"]>;
  conflicts?: CuratedConflict[];
}

const annualDiagrams: Record<AnnualModelKey, CuratedSource> = {
  tiger2022: S.tiger2022Diagram,
  rabbit2023: S.rabbit2023Diagram,
  dragon2024: S.dragon2024Diagram,
  snake2025: S.snake2025Diagram,
  horse2026: S.horse2026Diagram,
};

function buildAnnualPack(config: AnnualPackConfig): CuratedEntityPack {
  const editionKey = `phase597-nahvalur-${config.key}-edition-group`;
  const diagram = annualDiagrams[config.key];
  return {
    key: `phase597-nahvalur-${config.key}-v1`,
    entityId: PHASE597_IDS[config.key],
    expectedType: "pen",
    expectedSlug: PHASE597_SLUGS[config.key],
    canonicalName: config.canonicalName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: config.markdownFile,
    storyTitle: config.storyTitle,
    primarySourceKey: config.primary.key,
    depthTier: "A",
    aliases: config.aliases,
    sources: mergeSources(
      [
        config.primary,
        S.penOfYearCollection,
        S.series,
        S.care,
        diagram,
      ],
      config.sources,
    ),
    scopes: config.scopes,
    claims: [
      claim({
        key: `phase597-nahvalur-${config.key}-identity`,
        predicate: "model_identity",
        objectText: config.identityText,
        source: config.primary,
        scopeKey: config.mainScope,
        evidence: [
          {
            key: `phase597-${config.key}-annual-collection-evidence`,
            source: S.penOfYearCollection,
            scopeKey: config.mainScope,
          },
        ],
      }),
      claim({
        key: `phase597-nahvalur-${config.key}-configuration`,
        predicate: "model_configuration",
        objectText: config.configurationText,
        source: config.configurationSource,
        scopeKey: config.mainScope,
      }),
      claim({
        key: `phase597-nahvalur-${config.key}-status-boundary`,
        predicate: "source_and_availability_boundary",
        objectText: config.statusText,
        source: config.statusSource,
        scopeKey: config.mainScope,
      }),
      claim({
        key: `phase597-nahvalur-${config.key}-maintenance`,
        predicate: "maintenance_boundary",
        objectText:
          "Routine care uses cool water through the internal piston. A stuck knob, seal failure, window crack or persistent flow fault should stop operation and move to service rather than undocumented force, solvent or external lubrication.",
        source: S.care,
        scopeKey: config.mainScope,
        editorial: true,
      }),
      ...(config.extraClaims ?? []),
    ],
    variants: [
      {
        key: editionKey,
        name: config.editionName,
        releaseYear: config.releaseYear,
        notes: config.editionNotes,
        sourceKey: config.primary.key,
        variantKind: "edition_group",
        market: "historical annual edition",
      },
    ],
    spec: {
      brandEntityId: PHASE597_NAHVALUR_BRAND_ID,
      values: config.specValues,
      evidence: config.specEvidence,
    },
    media: media(config.key, diagram),
    timeline: [
      {
        key: `phase597-nahvalur-${config.key}-release`,
        title: `${config.editionName} documented`,
        eventType: "model_released",
        startDate: config.releaseYear,
        circa: true,
        description: config.releaseDescription,
        sourceKey: config.primary.key,
      },
      ...(config.extraTimeline ?? []),
      {
        key: `phase597-nahvalur-${config.key}-verified`,
        title: `${config.editionName} source boundary verified`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description:
          "Retrieval date records source, identity, configuration and availability boundaries; it is not a new release date.",
        sourceKey: config.statusSource.key,
      },
    ],
    conflicts: config.conflicts,
  };
}

const tigerMain = "phase597-nahvalur-tiger-2022-main";
const tigerGoldSample = "phase597-nahvalur-tiger-2022-gold-sample";

export const phase597NahvalurTiger2022Pack = buildAnnualPack({
  key: "tiger2022",
  canonicalName: "Nahvalur Pen of the Year: Tiger 2022 Fountain Pen",
  markdownFile:
    ".planning/content-research/nahvalur-pen-of-the-year-tiger-2022-phase597.md",
  storyTitle:
    "Tiger 2022：222 支橙黑 Nautilus、官方钢尖矩阵与 14K 样本边界",
  primary: S.tigerOfficial,
  sources: [S.tigerRetail],
  aliases: [
    {
      alias: "Nahvalur Pen of the Year Tiger 2022",
      language: "en",
      sourceKey: S.tigerOfficial.key,
    },
    {
      alias: "Nahvalur Year of the Tiger 2022",
      language: "en",
      sourceKey: S.tigerOfficial.key,
    },
    {
      alias: "Narwhal Nautilus Year of the Tiger",
      language: "en",
      kind: "former_name",
      sourceKey: S.tigerOfficial.key,
    },
    {
      alias: "纳瓦尔虎年 2022 限量钢笔",
      language: "zh",
      sourceKey: S.tigerOfficial.key,
    },
  ],
  releaseYear: "2022",
  editionName: "Pen of the Year Tiger 2022",
  editionNotes:
    "222-piece annual Nautilus edition; official launch matrix is No.6 steel, while observed 14K configurations remain sample scoped.",
  mainScope: tigerMain,
  scopes: [
    {
      key: tigerMain,
      scopeKey: tigerMain,
      variantKey: "phase597-nahvalur-tiger2022-edition-group",
      market: "2022 Pen of the Year Tiger standard edition",
      validFrom: "2022",
      productionState: "historical",
      nibScope:
        "Official No.6 in-house stainless-steel matrix: F/M/B/1.1 Stub/Double Broad.",
      materialScope:
        "Orange-black swirling resin and black metal appointments; individual pattern distribution varies.",
      editionScope:
        "Reliable archive quantity 222; annual Nautilus identity remains separate from ordinary Nautilus colours.",
    },
    {
      key: tigerGoldSample,
      scopeKey: tigerGoldSample,
      market: "observed retailer/sample 14K scope",
      validFrom: "2022",
      productionState: "historical",
      nibScope:
        "Reliable sample or option evidence exists for 14K, but it does not replace the official steel launch matrix or establish every unit.",
      editionScope:
        "No universal gold-nib claim and no inferred gold-nib SKU sequence.",
    },
  ],
  identityText:
    "Nahvalur Pen of the Year: Tiger 2022 Fountain Pen is a distinct 222-piece annual Nautilus edition. The former Narwhal name and shared Nautilus construction do not reduce it to an ordinary orange colour SKU.",
  configurationText:
    "Tiger uses an oversized Nautilus shape, orange-black swirling resin, black metal appointments, three porthole windows, an internal piston and an official No.6 steel F/M/B/1.1 Stub/Double Broad matrix.",
  statusText:
    "The official announcement and reliable retailer archive establish a historical sold-out edition. Observed 14K samples remain configuration-scoped and cannot be generalized to all 222 units or converted into inferred current SKUs.",
  configurationSource: S.tigerOfficial,
  statusSource: S.tigerRetail,
  extraClaims: [
    claim({
      key: "phase597-nahvalur-tiger-2022-gold-scope",
      predicate: "nib_material_boundary",
      objectText:
        "The official launch evidence supports No.6 stainless steel as the standard matrix. Reliable 14K sample or option evidence is preserved but does not prove that every numbered Tiger was gold-nibbed.",
      source: S.tigerOfficial,
      scopeKey: tigerMain,
      evidence: [
        {
          key: "phase597-tiger-gold-sample-evidence",
          source: S.tigerRetail,
          scopeKey: tigerGoldSample,
        },
      ],
    }),
  ],
  specValues: {
    series_name:
      "Nahvalur Pen of the Year: Tiger 2022; annual edition built on the Nautilus platform",
    release_year: "2022",
    nib:
      "Official standard: Nahvalur No.6 stainless steel F/M/B/1.1 Stub/Double Broad; 14K observations are sample scoped",
    fill_system: "Internal piston, bottled ink only; three Nautilus portholes",
    material: "Orange-black swirling resin with black metal appointments",
    status:
      "Historical/sold out; reliable archive records 222 numbered units; no current market-SKU children",
  },
  specEvidence: [
    evidence(
      "brand_entity_id",
      "phase597-tiger-spec-brand",
      S.penOfYearCollection.key,
      tigerMain,
      "official annual collection places the edition under Nahvalur",
    ),
    evidence(
      "series_name",
      "phase597-tiger-spec-series",
      S.tigerOfficial.key,
      tigerMain,
      "official Year of the Tiger and oversized Nautilus identity",
    ),
    evidence(
      "release_year",
      "phase597-tiger-spec-release",
      S.tigerOfficial.key,
      tigerMain,
      "official 2022 announcement context",
    ),
    evidence(
      "nib",
      "phase597-tiger-spec-steel-nib",
      S.tigerOfficial.key,
      tigerMain,
      "official No.6 in-house steel F/M/B/1.1 Stub/Double Broad matrix",
    ),
    evidence(
      "nib",
      "phase597-tiger-spec-gold-sample",
      S.tigerRetail.key,
      tigerGoldSample,
      "reliable 14K sample or option evidence does not qualify as universal standard",
      false,
    ),
    evidence(
      "fill_system",
      "phase597-tiger-spec-fill",
      S.tigerOfficial.key,
      tigerMain,
      "internal piston and three porthole windows",
    ),
    evidence(
      "material",
      "phase597-tiger-spec-material",
      S.tigerOfficial.key,
      tigerMain,
      "orange-black swirling resin and black metal appointments",
    ),
    evidence(
      "status",
      "phase597-tiger-spec-status",
      S.tigerRetail.key,
      tigerMain,
      "reliable archive records 222 numbered units and historical availability",
    ),
  ],
  releaseDescription:
    "Official 2022 material establishes the annual Tiger identity and steel-nib matrix; reliable retailer evidence supplies the 222-piece boundary.",
  conflicts: [
    {
      key: "phase597-nahvalur-tiger-nib-material-conflict",
      fieldKey: "nib",
      scopeKey: tigerMain,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The official announcement defines the standard steel matrix. Gold-nib evidence remains a non-universal sample/option scope and is not applied to all 222 units.",
      members: [
        {
          citationKey: "phase597-tiger-spec-steel-nib",
          assertedValue: "official standard No.6 stainless steel",
        },
        {
          citationKey: "phase597-tiger-spec-gold-sample",
          assertedValue: "observed 14K sample or option",
        },
      ],
    },
  ],
});

const rabbitMain = "phase597-nahvalur-rabbit-2023-main";
const rabbitBrilliantBoundary =
  "phase597-nahvalur-rabbit-2023-brilliant-bunny-boundary";

export const phase597NahvalurRabbit2023Pack = buildAnnualPack({
  key: "rabbit2023",
  canonicalName: "Nahvalur Pen of the Year: Rabbit 2023 Fountain Pen",
  markdownFile:
    ".planning/content-research/nahvalur-pen-of-the-year-rabbit-2023-phase597.md",
  storyTitle:
    "Rabbit 2023：223 支珠光白 14K 年度笔与 Brilliant Bunny 身份分离",
  primary: S.rabbitPenChalet,
  sources: [S.rabbitGentleman, S.brilliantBunny],
  aliases: [
    {
      alias: "Nahvalur Pen of the Year Rabbit 2023",
      language: "en",
      sourceKey: S.rabbitPenChalet.key,
    },
    {
      alias: "Nahvalur Year of the Rabbit 2023",
      language: "en",
      sourceKey: S.rabbitGentleman.key,
    },
    {
      alias: "Nahvalur Nautilus Rabbit 2023",
      language: "en",
      sourceKey: S.rabbitPenChalet.key,
    },
    {
      alias: "纳瓦尔兔年 2023 限量钢笔",
      language: "zh",
      sourceKey: S.rabbitPenChalet.key,
    },
  ],
  releaseYear: "2023",
  editionName: "Pen of the Year Rabbit 2023",
  editionNotes:
    "223-piece pearl-white and rose-gold annual Nautilus edition with in-house No.6 14K Fine/Medium nibs.",
  mainScope: rabbitMain,
  scopes: [
    {
      key: rabbitMain,
      scopeKey: rabbitMain,
      variantKey: "phase597-nahvalur-rabbit2023-edition-group",
      market: "2023 Pen of the Year Rabbit edition",
      validFrom: "2023",
      productionState: "historical",
      nibScope: "Nahvalur in-house No.6 14K Fine and Medium.",
      materialScope:
        "Starry Night Resins pearl-white body with rose-gold appointments.",
      editionScope:
        "223 numbered units; annual identity is separate from other rabbit-themed collaborations.",
    },
    {
      key: rabbitBrilliantBoundary,
      scopeKey: rabbitBrilliantBoundary,
      market: "Enigma Stationery Brilliant Bunny sibling",
      validFrom: "2023",
      productionState: "historical",
      nibScope:
        "Brilliant Bunny sample configuration cannot qualify Rabbit 2023 nib or SKU fields.",
      materialScope:
        "Separate collaboration material and theme execution; not the pearl-white annual edition.",
      editionScope:
        "50-piece collaboration sibling, not the 223-piece Pen of the Year Rabbit.",
    },
  ],
  identityText:
    "Nahvalur Pen of the Year: Rabbit 2023 Fountain Pen is a distinct 223-piece annual Nautilus edition with pearl-white Starry Night resin, rose-gold appointments and No.6 14K Fine/Medium nibs.",
  configurationText:
    "Rabbit 2023 uses a Nautilus internal piston and three portholes, pearl-white Starry Night Resins material, rose-gold trim and in-house No.6 14K Fine or Medium nibs.",
  statusText:
    "Reliable contemporary and authorized-retailer sources establish a historical sold-out 223-piece edition. Enigma Stationery Brilliant Bunny is a separate 50-piece collaboration and supplies no Rabbit 2023 SKU or material fields.",
  configurationSource: S.rabbitPenChalet,
  statusSource: S.rabbitGentleman,
  extraClaims: [
    claim({
      key: "phase597-nahvalur-rabbit-brilliant-bunny-separation",
      predicate: "sibling_identity_boundary",
      objectText:
        "Enigma Stationery Brilliant Bunny is a separate 50-piece collaboration. A shared rabbit theme and Nautilus platform do not merge it with the 223-piece Pen of the Year Rabbit 2023.",
      source: S.brilliantBunny,
      scopeKey: rabbitBrilliantBoundary,
      evidence: [
        {
          key: "phase597-rabbit-annual-223-evidence",
          source: S.rabbitPenChalet,
          scopeKey: rabbitMain,
        },
      ],
    }),
  ],
  specValues: {
    series_name:
      "Nahvalur Pen of the Year: Rabbit 2023; annual Nautilus edition, not Enigma Stationery Brilliant Bunny",
    release_year: "2023",
    nib: "Nahvalur in-house No.6 14K; Fine and Medium",
    fill_system: "Internal piston, bottled ink only; three Nautilus portholes",
    material:
      "Starry Night Resins pearl white with rose-gold appointments",
    status:
      "Historical/sold out; 223 numbered units; no current market-SKU children",
  },
  specEvidence: [
    evidence(
      "brand_entity_id",
      "phase597-rabbit-spec-brand",
      S.penOfYearCollection.key,
      rabbitMain,
      "official annual collection places the edition under Nahvalur",
    ),
    evidence(
      "series_name",
      "phase597-rabbit-spec-series",
      S.rabbitPenChalet.key,
      rabbitMain,
      "authorized retailer identifies Rabbit 2023 Pen of the Year Nautilus edition",
    ),
    evidence(
      "series_name",
      "phase597-rabbit-spec-rejected-brilliant-bunny",
      S.brilliantBunny.key,
      rabbitBrilliantBoundary,
      "Brilliant Bunny is a separate 50-piece Enigma Stationery collaboration",
      false,
    ),
    evidence(
      "release_year",
      "phase597-rabbit-spec-release",
      S.rabbitGentleman.key,
      rabbitMain,
      "contemporary January 2023 release coverage",
    ),
    evidence(
      "nib",
      "phase597-rabbit-spec-nib",
      S.rabbitPenChalet.key,
      rabbitMain,
      "in-house No.6 14K Fine and Medium",
    ),
    evidence(
      "fill_system",
      "phase597-rabbit-spec-fill",
      S.rabbitPenChalet.key,
      rabbitMain,
      "Nautilus internal piston and three portholes",
    ),
    evidence(
      "material",
      "phase597-rabbit-spec-material",
      S.rabbitPenChalet.key,
      rabbitMain,
      "Starry Night Resins pearl white and rose-gold trim",
    ),
    evidence(
      "status",
      "phase597-rabbit-spec-status",
      S.rabbitPenChalet.key,
      rabbitMain,
      "223 numbered units and archived sold-out listing",
    ),
  ],
  releaseDescription:
    "Contemporary and authorized-retailer evidence establishes the pearl-white, rose-gold, 14K and 223-piece annual identity.",
  conflicts: [
    {
      key: "phase597-nahvalur-rabbit-identity-conflict",
      fieldKey: "model_identity",
      scopeKey: rabbitMain,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote:
        "Rabbit 2023 is the 223-piece pearl-white annual edition. Brilliant Bunny is a separate 50-piece Enigma Stationery collaboration despite the shared rabbit theme and Nautilus platform.",
      members: [
        {
          citationKey: "phase597-rabbit-spec-series",
          assertedValue: "223-piece Pen of the Year Rabbit 2023",
        },
        {
          citationKey: "phase597-rabbit-spec-rejected-brilliant-bunny",
          assertedValue: "50-piece Brilliant Bunny sibling",
        },
      ],
    },
  ],
});

const dragonMain = "phase597-nahvalur-dragon-2024-main";
const dragonCodeBoundary = "phase597-nahvalur-dragon-2024-code-boundary";

export const phase597NahvalurDragon2024Pack = buildAnnualPack({
  key: "dragon2024",
  canonicalName: "Nahvalur Pen of the Year: Dragon 2024 Fountain Pen",
  markdownFile:
    ".planning/content-research/nahvalur-pen-of-the-year-dragon-2024-phase597.md",
  storyTitle:
    "Dragon 2024：224 支黑红金 Nautilus、钢尖矩阵与单一代码证据",
  primary: S.dragonPenChalet,
  sources: [S.dragonAfth, S.dragonGentleman],
  aliases: [
    {
      alias: "Nahvalur Pen of the Year Dragon 2024",
      language: "en",
      sourceKey: S.dragonPenChalet.key,
    },
    {
      alias: "Nahvalur Year of the Dragon 2024",
      language: "en",
      sourceKey: S.dragonPenChalet.key,
    },
    {
      alias: "Nahvalur Nautilus Dragon 2024",
      language: "en",
      sourceKey: S.dragonAfth.key,
    },
    {
      alias: "纳瓦尔龙年 2024 限量钢笔",
      language: "zh",
      sourceKey: S.dragonPenChalet.key,
    },
  ],
  releaseYear: "2024",
  editionName: "Pen of the Year Dragon 2024",
  editionNotes:
    "224-piece black/red/gold annual Nautilus edition; 03080041 is the only archived complete product code retained.",
  mainScope: dragonMain,
  scopes: [
    {
      key: dragonMain,
      scopeKey: dragonMain,
      variantKey: "phase597-nahvalur-dragon2024-edition-group",
      market: "2024 Pen of the Year Dragon edition",
      validFrom: "2024",
      productionState: "historical",
      nibScope:
        "Nahvalur No.6 stainless steel; reliable selectors list F/M/B/Stub/Double Broad with minor retailer variation.",
      materialScope:
        "Custom black/red/gold resin with gold-plated appointments; pattern distribution is unit and light dependent.",
      editionScope:
        "224 numbered units; annual Nautilus identity remains distinct from Snake 888 and ordinary Nautilus colours.",
    },
    {
      key: dragonCodeBoundary,
      scopeKey: dragonCodeBoundary,
      market: "archived AFTH product-code evidence",
      validFrom: "2024",
      validTo: RETRIEVED,
      productionState: "historical",
      nibScope:
        "03080041 is a proven retail code anchor; neighbouring codes are not present in the source and cannot be inferred.",
      editionScope:
        "One code does not create a current market-SKU child for a sold-out edition.",
    },
  ],
  identityText:
    "Nahvalur Pen of the Year: Dragon 2024 Fountain Pen is a distinct 224-piece annual Nautilus edition. Its black/red/gold material and 2024 identity are not interchangeable with Snake 2025 or a generic red Nautilus SKU.",
  configurationText:
    "Dragon uses custom black/red/gold resin, gold-plated appointments, three Nautilus portholes, an internal piston and an in-house No.6 stainless-steel nib offered across F/M/B/Stub/Double Broad retailer selectors.",
  statusText:
    "The official exact page is no longer current, while authorized retailer archives establish a sold-out 224-piece edition. AFTH proves only product code 03080041; adjacent codes and current stock must not be inferred.",
  configurationSource: S.dragonPenChalet,
  statusSource: S.dragonAfth,
  extraClaims: [
    claim({
      key: "phase597-nahvalur-dragon-code-boundary",
      predicate: "product_code_boundary",
      objectText:
        "AFTH archives complete product code 03080041. The source does not expose 03080042–47, so a sequential code family cannot be generated from one anchor.",
      source: S.dragonAfth,
      scopeKey: dragonCodeBoundary,
    }),
    claim({
      key: "phase597-nahvalur-dragon-image-boundary",
      predicate: "material_image_boundary",
      objectText:
        "Contemporary sample coverage notes that photography does not fully reproduce the black/red/gold resin depth. Unit pattern and lighting variation are not authentication failures by themselves.",
      source: S.dragonGentleman,
      scopeKey: dragonMain,
      editorial: true,
    }),
  ],
  specValues: {
    series_name:
      "Nahvalur Pen of the Year: Dragon 2024; annual Nautilus edition",
    release_year: "2024",
    nib:
      "Nahvalur in-house No.6 stainless steel; reliable selectors F/M/B/Stub/Double Broad",
    fill_system: "Internal piston, bottled ink only; three Nautilus portholes",
    material: "Custom black/red/gold resin with gold-plated appointments",
    dimensions:
      "149 mm capped, 133 mm uncapped, cannot post; barrel 13 mm and grip 10–11.5 mm",
    weight: "36.85 g reliable archived specification",
    status:
      "Historical/sold out; 224 numbered units; only archived product code 03080041 retained and no current child SKU",
  },
  specEvidence: [
    evidence(
      "brand_entity_id",
      "phase597-dragon-spec-brand",
      S.penOfYearCollection.key,
      dragonMain,
      "official annual collection places the edition under Nahvalur",
    ),
    evidence(
      "series_name",
      "phase597-dragon-spec-series",
      S.dragonPenChalet.key,
      dragonMain,
      "authorized retailer identifies Pen of the Year Dragon 2024 Nautilus edition",
    ),
    evidence(
      "release_year",
      "phase597-dragon-spec-release",
      S.dragonGentleman.key,
      dragonMain,
      "contemporary January 2024 arrival coverage",
    ),
    evidence(
      "nib",
      "phase597-dragon-spec-nib",
      S.dragonPenChalet.key,
      dragonMain,
      "in-house No.6 stainless-steel retailer width matrix",
    ),
    evidence(
      "fill_system",
      "phase597-dragon-spec-fill",
      S.dragonPenChalet.key,
      dragonMain,
      "internal piston and three Nautilus portholes",
    ),
    evidence(
      "material",
      "phase597-dragon-spec-material",
      S.dragonPenChalet.key,
      dragonMain,
      "custom black/red/gold resin and gold-plated trim",
    ),
    evidence(
      "dimensions",
      "phase597-dragon-spec-dimensions",
      S.dragonAfth.key,
      dragonMain,
      "149/133 mm, cannot post, 13 mm barrel and 10–11.5 mm grip",
    ),
    evidence(
      "weight",
      "phase597-dragon-spec-weight",
      S.dragonAfth.key,
      dragonMain,
      "archived weight 36.85 g",
    ),
    evidence(
      "status",
      "phase597-dragon-spec-status",
      S.dragonPenChalet.key,
      dragonMain,
      "224 numbered units and historical sold-out listing",
    ),
    evidence(
      "status",
      "phase597-dragon-spec-code-03080041",
      S.dragonAfth.key,
      dragonCodeBoundary,
      "only complete product code 03080041 is present in the archive",
    ),
    evidence(
      "status",
      "phase597-dragon-spec-rejected-inferred-codes",
      S.dragonAfth.key,
      dragonCodeBoundary,
      "03080042–47 are absent and cannot qualify through numeric inference",
      false,
    ),
  ],
  releaseDescription:
    "Contemporary and authorized-retailer sources establish the 2024, 224-piece, black/red/gold annual identity.",
  conflicts: [
    {
      key: "phase597-nahvalur-dragon-code-conflict",
      fieldKey: "product_code",
      scopeKey: dragonCodeBoundary,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Only 03080041 is source-backed. Numerically adjacent codes are absent and rejected rather than fabricated into an apparently complete matrix.",
      members: [
        {
          citationKey: "phase597-dragon-spec-code-03080041",
          assertedValue: "archived complete code 03080041",
        },
        {
          citationKey: "phase597-dragon-spec-rejected-inferred-codes",
          assertedValue: "03080042–47 inferred only and rejected",
        },
      ],
    },
  ],
});

const snakeMain = "phase597-nahvalur-snake-2025-main";
const snakeRetailWeight = "phase597-nahvalur-snake-2025-retail-weight";

export const phase597NahvalurSnake2025Pack = buildAnnualPack({
  key: "snake2025",
  canonicalName: "Nahvalur Pen of the Year: Snake 2025 Fountain Pen",
  markdownFile:
    ".planning/content-research/nahvalur-pen-of-the-year-snake-2025-phase597.md",
  storyTitle:
    "Snake 2025：888 支蛇形银夹 Nautilus、钢尖／14K 与重量冲突",
  primary: S.snakeOfficial,
  sources: [S.snakePenChalet, S.snakeGoldspot],
  aliases: [
    {
      alias: "Nahvalur Pen of the Year Snake 2025",
      language: "en",
      sourceKey: S.snakeOfficial.key,
    },
    {
      alias: "Nahvalur Year of the Snake 2025",
      language: "en",
      sourceKey: S.snakeOfficial.key,
    },
    {
      alias: "Nahvalur Nautilus Snake 2025",
      language: "en",
      sourceKey: S.snakePenChalet.key,
    },
    {
      alias: "纳瓦尔蛇年 2025 限量钢笔",
      language: "zh",
      sourceKey: S.snakeOfficial.key,
    },
  ],
  releaseYear: "2025",
  editionName: "Pen of the Year Snake 2025",
  editionNotes:
    "888-piece green/gold/silver annual Nautilus edition with sterling-silver snake clip and steel or 14K No.6 nib paths.",
  mainScope: snakeMain,
  scopes: [
    {
      key: snakeMain,
      scopeKey: snakeMain,
      variantKey: "phase597-nahvalur-snake2025-edition-group",
      market: "2025 Pen of the Year Snake edition",
      validFrom: "2025",
      validTo: RETRIEVED,
      productionState: "historical",
      nibScope:
        "Official No.6 stainless-steel or 14K gold path; archived selectors do not support inferred current SKU children.",
      materialScope:
        "Green/gold/silver resin, gold trim and sterling-silver snake clip with green stone accents; stone species not asserted.",
      editionScope:
        "888 numbered units; official exact endpoint is now removed and availability is historical.",
    },
    {
      key: snakeRetailWeight,
      scopeKey: snakeRetailWeight,
      market: "Pen Chalet archived measurement",
      validFrom: "2025",
      productionState: "historical",
      nibScope: "No change to nib material scope.",
      materialScope: "No change to official themed material scope.",
      editionScope:
        "Retail weight 28.35 g conflicts with official exact-product weight 36.85 g and is rejected as the canonical value.",
    },
  ],
  identityText:
    "Nahvalur Pen of the Year: Snake 2025 Fountain Pen is a distinct 888-piece annual Nautilus edition. Its snake-shaped sterling-silver clip, green stone accents and themed resin cannot be reduced to a generic green Nautilus colour.",
  configurationText:
    "Snake uses green/gold/silver resin, gold trim, a sterling-silver snake clip with green stone accents, three Nautilus portholes, an internal piston and official No.6 stainless-steel or 14K nib paths.",
  statusText:
    "The official exact-product endpoint is removed at retrieval, while official historical data and reliable retailer archives preserve the 888-piece identity. No current SKU is inferred from archived nib choices.",
  configurationSource: S.snakeOfficial,
  statusSource: S.snakeOfficial,
  extraClaims: [
    claim({
      key: "phase597-nahvalur-snake-weight-boundary",
      predicate: "measurement_conflict",
      objectText:
        "The official exact-product specification gives 36.85 g, while Pen Chalet records 28.35 g. The official value remains canonical and the retailer value is retained as rejected conflict evidence rather than averaged.",
      source: S.snakeOfficial,
      scopeKey: snakeMain,
      evidence: [
        {
          key: "phase597-snake-retailer-weight-evidence",
          source: S.snakePenChalet,
          scopeKey: snakeRetailWeight,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-snake-stone-boundary",
      predicate: "material_claim_boundary",
      objectText:
        "Sources describe green stone accents on the snake clip but do not consistently identify a gem species. The database therefore does not label them jade, emerald or another unverified stone.",
      source: S.snakeOfficial,
      scopeKey: snakeMain,
      editorial: true,
    }),
  ],
  specValues: {
    series_name:
      "Nahvalur Pen of the Year: Snake 2025; annual Nautilus edition",
    release_year: "2025",
    nib:
      "Nahvalur No.6 stainless steel or 14K gold; no inferred current material/SKU matrix",
    fill_system: "Internal piston, bottled ink only; three Nautilus portholes",
    material:
      "Green/gold/silver resin, gold trim and sterling-silver snake clip with green stone accents",
    dimensions:
      "Official: 149 mm capped, 133 mm uncapped, cannot post; barrel 13 mm and grip 10–11.5 mm",
    weight:
      "Official exact product 36.85 g; Pen Chalet 28.35 g retained as rejected conflicting measurement",
    status:
      "Historical/sold out; 888 numbered units; official exact endpoint removed and no current market-SKU children",
  },
  specEvidence: [
    evidence(
      "brand_entity_id",
      "phase597-snake-spec-brand",
      S.penOfYearCollection.key,
      snakeMain,
      "official annual collection places the edition under Nahvalur",
    ),
    evidence(
      "series_name",
      "phase597-snake-spec-series",
      S.snakeOfficial.key,
      snakeMain,
      "historical official exact product and classic Nautilus identity",
    ),
    evidence(
      "release_year",
      "phase597-snake-spec-release",
      S.snakeOfficial.key,
      snakeMain,
      "official 2025 product identity",
    ),
    evidence(
      "nib",
      "phase597-snake-spec-nib",
      S.snakeOfficial.key,
      snakeMain,
      "official No.6 stainless-steel or 14K gold nib statement",
    ),
    evidence(
      "fill_system",
      "phase597-snake-spec-fill",
      S.snakeOfficial.key,
      snakeMain,
      "internal piston and bottled-ink-only specification",
    ),
    evidence(
      "material",
      "phase597-snake-spec-material",
      S.snakeOfficial.key,
      snakeMain,
      "green/gold/silver resin, gold trim, sterling-silver snake clip and green stone accents",
    ),
    evidence(
      "dimensions",
      "phase597-snake-spec-dimensions",
      S.snakeOfficial.key,
      snakeMain,
      "149/133 mm, cannot post, 13 mm barrel and 10–11.5 mm grip",
    ),
    evidence(
      "weight",
      "phase597-snake-spec-weight-official",
      S.snakeOfficial.key,
      snakeMain,
      "official exact-product weight 36.85 g",
    ),
    evidence(
      "weight",
      "phase597-snake-spec-weight-retailer",
      S.snakePenChalet.key,
      snakeRetailWeight,
      "Pen Chalet archived weight 28.35 g conflicts with official value",
      false,
    ),
    evidence(
      "status",
      "phase597-snake-spec-status",
      S.snakePenChalet.key,
      snakeMain,
      "888 numbered units and out-of-stock archive",
    ),
  ],
  releaseDescription:
    "Official historical product data and reliable retailer archives establish the 2025, 888-piece, snake-clip annual identity.",
  conflicts: [
    {
      key: "phase597-nahvalur-snake-weight-conflict",
      fieldKey: "weight",
      scopeKey: snakeMain,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The exact official product value 36.85 g is canonical. Pen Chalet's 28.35 g remains visible as rejected retailer measurement because the discrepancy cannot be explained from current sources.",
      members: [
        {
          citationKey: "phase597-snake-spec-weight-official",
          assertedValue: "official exact-product 36.85 g",
        },
        {
          citationKey: "phase597-snake-spec-weight-retailer",
          assertedValue: "Pen Chalet 28.35 g",
        },
      ],
    },
  ],
});

const horseMain = "phase597-nahvalur-horse-2026-main";
const horseUnavailable = "phase597-nahvalur-horse-2026-unavailable";
const horseRetail = "phase597-nahvalur-horse-2026-retail-scope";

export const phase597NahvalurHorse2026Pack = buildAnnualPack({
  key: "horse2026",
  canonicalName: "Nahvalur Pen of the Year: Horse 2026 Fountain Pen",
  markdownFile:
    ".planning/content-research/nahvalur-pen-of-the-year-horse-2026-phase597.md",
  storyTitle:
    "Horse 2026：黑金 bronze 年度笔、999 零售证据与六个售罄代码",
  primary: S.horseOfficial,
  sources: [S.horseData, S.horseAtlas, S.horseStilo],
  aliases: [
    {
      alias: "Nahvalur Pen of the Year Horse 2026",
      language: "en",
      sourceKey: S.horseOfficial.key,
    },
    {
      alias: "Nahvalur Year of the Horse 2026",
      language: "en",
      sourceKey: S.horseOfficial.key,
    },
    {
      alias: "Nahvalur Nautilus Horse 2026",
      language: "en",
      sourceKey: S.horseAtlas.key,
    },
    {
      alias: "纳瓦尔马年 2026 限量钢笔",
      language: "zh",
      sourceKey: S.horseOfficial.key,
    },
  ],
  releaseYear: "2026",
  editionName: "Pen of the Year Horse 2026",
  editionNotes:
    "Black/gold annual Nautilus edition with bronze details; reliable retailers state 999 numbered units, while six official width codes are all unavailable.",
  mainScope: horseMain,
  scopes: [
    {
      key: horseMain,
      scopeKey: horseMain,
      variantKey: "phase597-nahvalur-horse2026-edition-group",
      market: "2026 Pen of the Year Horse edition",
      validFrom: "2026",
      productionState: "historical",
      nibScope:
        "Official prose says No.6 stainless steel or 14K; current selector titles expose widths only and no material branch.",
      materialScope:
        "Official resin with bronze trim and clip; retailer acrylic/PVD wording remains alternate descriptive evidence.",
      editionScope:
        "Reliable retailer archives state 999 numbered units; the current official page does not show the quantity in visible copy.",
    },
    {
      key: horseUnavailable,
      scopeKey: horseUnavailable,
      market: "2026-08-11 official unavailable selector",
      validFrom: RETRIEVED,
      productionState: "historical",
      nibScope:
        "EF/F/M/B/Stub/Double Broad complete codes exist but all are available=false and lack material suffixes.",
      editionScope:
        "No current market-SKU children and no inferred 14K SKU matrix.",
    },
    {
      key: horseRetail,
      scopeKey: horseRetail,
      market: "authorized retailer quantity and measurement scope",
      validFrom: "2026",
      productionState: "historical",
      nibScope:
        "Atlas Fine code 03080061 is explicitly steel; it does not prove every selector or a gold-nib code family.",
      materialScope:
        "Atlas calls material acrylic and bronze PVD; official exact page says resin and bronze.",
      editionScope:
        "999 quantity and alternate 150/131 mm, 31 g measurement remain retailer-scoped.",
    },
  ],
  identityText:
    "Nahvalur Pen of the Year: Horse 2026 Fountain Pen is a distinct black/gold annual Nautilus edition with bronze details and a horse-motif cap ring. It is not a generic black Nautilus colour.",
  configurationText:
    "Horse uses official resin, bronze trim and clip, an internal piston, three Nautilus portholes and official No.6 stainless-steel or 14K nib language; reliable retailer archives describe 999 numbered units.",
  statusText:
    "The official page remains online, but EF/F/M/B/Stub/Double Broad codes 03080060/61/62/63/64/67 are all unavailable on 2026-08-11. Width-only selectors do not establish separate current 14K SKUs.",
  configurationSource: S.horseOfficial,
  statusSource: S.horseData,
  extraClaims: [
    claim({
      key: "phase597-nahvalur-horse-limit-boundary",
      predicate: "edition_quantity_boundary",
      objectText:
        "Reliable authorized-retailer archives state 999 numbered units. The current visible official exact-product copy does not state 999, so the quantity remains retailer-attributed rather than rewritten as an official quote.",
      source: S.horseAtlas,
      scopeKey: horseRetail,
      evidence: [
        {
          key: "phase597-horse-limit-stilo-evidence",
          source: S.horseStilo,
          scopeKey: horseRetail,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-horse-measurement-boundary",
      predicate: "measurement_conflict",
      objectText:
        "Official specifications give 149/133 mm and 36.85 g. Atlas lists 150/131 mm and 31 g; the official exact-product values remain canonical and the retailer measurements remain visible conflict evidence.",
      source: S.horseOfficial,
      scopeKey: horseMain,
      evidence: [
        {
          key: "phase597-horse-atlas-measurement-evidence",
          source: S.horseAtlas,
          scopeKey: horseRetail,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-horse-nib-sku-boundary",
      predicate: "nib_material_boundary",
      objectText:
        "Official prose permits stainless steel or 14K, but the current Shopify selector contains six width-only unavailable codes and no gold material branch. No 14K market-SKU child is created.",
      source: S.horseOfficial,
      scopeKey: horseMain,
      evidence: [
        {
          key: "phase597-horse-width-only-data-evidence",
          source: S.horseData,
          scopeKey: horseUnavailable,
        },
      ],
    }),
  ],
  specValues: {
    series_name:
      "Nahvalur Pen of the Year: Horse 2026; annual Nautilus edition",
    release_year: "2026",
    nib:
      "Official No.6 stainless steel or 14K; current width-only EF/F/M/B/Stub/DB codes are all unavailable and do not define a gold SKU matrix",
    fill_system: "Internal piston, bottled ink only; three Nautilus portholes",
    material:
      "Official resin with bronze trim and clip; retailer acrylic/bronze PVD wording retained as alternate scope",
    dimensions:
      "Official 149 mm capped, 133 mm uncapped, cannot post, barrel 13 mm and grip 10–11.5 mm; Atlas 150/131 mm retained as alternate measurement",
    weight:
      "Official 36.85 g; Atlas 31 g retained as rejected canonical measurement",
    status:
      "Official page online but all six complete codes unavailable on 2026-08-11; reliable retailers state 999 numbered units; no current child SKU",
  },
  specEvidence: [
    evidence(
      "brand_entity_id",
      "phase597-horse-spec-brand",
      S.penOfYearCollection.key,
      horseMain,
      "official annual collection places the edition under Nahvalur",
    ),
    evidence(
      "series_name",
      "phase597-horse-spec-series",
      S.horseOfficial.key,
      horseMain,
      "official Pen of the Year Horse 2026 exact-product title",
    ),
    evidence(
      "release_year",
      "phase597-horse-spec-release",
      S.horseOfficial.key,
      horseMain,
      "official 2026 product identity",
    ),
    evidence(
      "nib",
      "phase597-horse-spec-nib-official",
      S.horseOfficial.key,
      horseMain,
      "official No.6 stainless-steel or 14K gold prose",
    ),
    evidence(
      "nib",
      "phase597-horse-spec-rejected-gold-sku-matrix",
      S.horseData.key,
      horseUnavailable,
      "six current selector titles contain width only, are unavailable and expose no gold material branch",
      false,
    ),
    evidence(
      "fill_system",
      "phase597-horse-spec-fill",
      S.horseOfficial.key,
      horseMain,
      "internal piston and bottled-ink-only specification",
    ),
    evidence(
      "material",
      "phase597-horse-spec-material-official",
      S.horseOfficial.key,
      horseMain,
      "official resin, bronze trim and bronze clip",
    ),
    evidence(
      "material",
      "phase597-horse-spec-material-atlas",
      S.horseAtlas.key,
      horseRetail,
      "Atlas uses acrylic and bronze PVD wording",
      false,
    ),
    evidence(
      "dimensions",
      "phase597-horse-spec-dimensions-official",
      S.horseOfficial.key,
      horseMain,
      "official 149/133 mm, cannot post, 13 mm barrel and 10–11.5 mm grip",
    ),
    evidence(
      "dimensions",
      "phase597-horse-spec-dimensions-atlas",
      S.horseAtlas.key,
      horseRetail,
      "Atlas lists 150/131 mm",
      false,
    ),
    evidence(
      "weight",
      "phase597-horse-spec-weight-official",
      S.horseOfficial.key,
      horseMain,
      "official exact-product weight 36.85 g",
    ),
    evidence(
      "weight",
      "phase597-horse-spec-weight-atlas",
      S.horseAtlas.key,
      horseRetail,
      "Atlas lists total weight 31 g",
      false,
    ),
    evidence(
      "status",
      "phase597-horse-spec-status-unavailable",
      S.horseData.key,
      horseUnavailable,
      "03080060/61/62/63/64/67 all available=false on 2026-08-11",
      false,
    ),
    evidence(
      "status",
      "phase597-horse-spec-limit-retailer",
      S.horseAtlas.key,
      horseRetail,
      "authorized retailer states 999 numbered units",
    ),
  ],
  releaseDescription:
    "Official product data establishes the 2026 Horse configuration; reliable retailers supply the attributed 999-piece and horse-motif boundary.",
  conflicts: [
    {
      key: "phase597-nahvalur-horse-nib-sku-conflict",
      fieldKey: "nib",
      scopeKey: horseMain,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Official prose establishes steel or 14K as configuration language. Current width-only unavailable selectors do not expose a gold material branch, so no 14K SKU child is inferred.",
      members: [
        {
          citationKey: "phase597-horse-spec-nib-official",
          assertedValue: "official steel or 14K No.6 nib prose",
        },
        {
          citationKey: "phase597-horse-spec-rejected-gold-sku-matrix",
          assertedValue: "current data has width-only unavailable selectors",
        },
      ],
    },
    {
      key: "phase597-nahvalur-horse-material-conflict",
      fieldKey: "material",
      scopeKey: horseMain,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The exact official product term resin is canonical. Atlas acrylic and bronze PVD terminology remains retailer-scoped rather than silently treated as an identical chemical specification.",
      members: [
        {
          citationKey: "phase597-horse-spec-material-official",
          assertedValue: "official resin and bronze",
        },
        {
          citationKey: "phase597-horse-spec-material-atlas",
          assertedValue: "Atlas acrylic and bronze PVD",
        },
      ],
    },
    {
      key: "phase597-nahvalur-horse-weight-conflict",
      fieldKey: "weight",
      scopeKey: horseMain,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The exact official 36.85 g is canonical. Atlas 31 g remains rejected measurement evidence because current sources do not explain the discrepancy.",
      members: [
        {
          citationKey: "phase597-horse-spec-weight-official",
          assertedValue: "official exact-product 36.85 g",
        },
        {
          citationKey: "phase597-horse-spec-weight-atlas",
          assertedValue: "Atlas 31 g",
        },
      ],
    },
  ],
});

const brandScope = phase596NahvalurBrandPack.scopes.at(-1)?.scopeKey;

if (!brandScope) {
  throw new Error("Phase 597 Nahvalur brand pack requires a canonical scope.");
}

const phase597BrandSources = [
  S.series,
  S.care,
  S.faq,
  S.keyWestCollection,
  S.keyLargo,
  S.keyLargoData,
  S.islamorada,
  S.islamoradaData,
  S.keyWestGoldspot,
  S.triadDesign,
  S.triadCollection,
  S.triadBlack,
  S.triadData,
  S.triadGoldspot,
  S.triadReview,
  S.penOfYearCollection,
  S.tigerOfficial,
  S.tigerRetail,
  S.rabbitPenChalet,
  S.rabbitGentleman,
  S.brilliantBunny,
  S.dragonPenChalet,
  S.dragonAfth,
  S.dragonGentleman,
  S.snakeOfficial,
  S.snakePenChalet,
  S.snakeGoldspot,
  S.horseOfficial,
  S.horseData,
  S.horseAtlas,
  S.horseStilo,
];

export const phase597NahvalurBrandPack: CuratedEntityPack = {
  ...phase596NahvalurBrandPack,
  key: "phase597-nahvalur-brand-depth-refresh-v1",
  markdownFile: ".planning/content-research/nahvalur-brand-phase597.md",
  storyTitle:
    "Nahvalur：九条基础路线与五个 Pen of the Year 年度型号的十四页导航",
  publicationIntent: "publish",
  publicationBlockers: [],
  sources: mergeSources(phase596NahvalurBrandPack.sources, phase597BrandSources),
  claims: [
    ...phase596NahvalurBrandPack.claims,
    claim({
      key: "phase597-nahvalur-brand-fourteen-model-navigation",
      predicate: "brand_model_navigation",
      objectText:
        "Nahvalur's public navigation now contains fourteen canonical pen pages: Original, Original Plus, Schuylkill, Nautilus, Horizon, Voyage, Eclipse, Key West, Triad and five separate Pen of the Year editions from Tiger 2022 through Horse 2026.",
      source: S.series,
      scopeKey: brandScope,
      evidence: [
        {
          key: "phase597-brand-key-west-evidence",
          source: S.keyWestCollection,
          scopeKey: brandScope,
        },
        {
          key: "phase597-brand-triad-evidence",
          source: S.triadCollection,
          scopeKey: brandScope,
        },
        {
          key: "phase597-brand-annual-series-evidence",
          source: S.penOfYearCollection,
          scopeKey: brandScope,
        },
        {
          key: "phase597-brand-horse-evidence",
          source: S.horseOfficial,
          scopeKey: brandScope,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-brand-filling-taxonomy",
      predicate: "family_boundary",
      objectText:
        "Key West and Triad are cartridge/converter families, Eclipse is converter-fed capless, Original Plus is vacuum filling, and Original, Schuylkill, Nautilus, Horizon, Voyage plus the five annual editions use internal pistons. Filling construction prevents name-only merging.",
      source: S.series,
      scopeKey: brandScope,
      evidence: [
        {
          key: "phase597-brand-key-west-fill-evidence",
          source: S.keyLargo,
          scopeKey: brandScope,
        },
        {
          key: "phase597-brand-triad-fill-evidence",
          source: S.triadDesign,
          scopeKey: brandScope,
        },
        {
          key: "phase597-brand-annual-fill-evidence",
          source: S.horseOfficial,
          scopeKey: brandScope,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-brand-annual-identity-boundary",
      predicate: "annual_series_boundary",
      objectText:
        "Pen of the Year is a navigation series, not one generic model node. Tiger 2022, Rabbit 2023, Dragon 2024, Snake 2025 and Horse 2026 retain separate years, quantities, materials, nib configurations and source conflicts.",
      source: S.penOfYearCollection,
      scopeKey: brandScope,
      evidence: [
        {
          key: "phase597-brand-tiger-edition-evidence",
          source: S.tigerOfficial,
          scopeKey: brandScope,
        },
        {
          key: "phase597-brand-rabbit-edition-evidence",
          source: S.rabbitPenChalet,
          scopeKey: brandScope,
        },
        {
          key: "phase597-brand-dragon-edition-evidence",
          source: S.dragonPenChalet,
          scopeKey: brandScope,
        },
        {
          key: "phase597-brand-snake-edition-evidence",
          source: S.snakeOfficial,
          scopeKey: brandScope,
        },
        {
          key: "phase597-brand-horse-edition-evidence",
          source: S.horseOfficial,
          scopeKey: brandScope,
        },
      ],
    }),
    claim({
      key: "phase597-nahvalur-brand-sku-instrument-boundary",
      predicate: "variant_topology_boundary",
      objectText:
        "Current market-SKU children require complete available fountain-pen codes under an edition-group parent. Key West and Horse unavailable codes remain evidence only, while Triad RollerBall codes fail instrument type even when available.",
      source: S.triadData,
      scopeKey: brandScope,
      evidence: [
        {
          key: "phase597-brand-key-west-unavailable-evidence",
          source: S.keyLargoData,
          scopeKey: brandScope,
        },
        {
          key: "phase597-brand-horse-unavailable-evidence",
          source: S.horseData,
          scopeKey: brandScope,
        },
      ],
    }),
  ],
  timeline: [
    ...(phase596NahvalurBrandPack.timeline ?? []),
    {
      key: "phase597-nahvalur-key-west-branch",
      title: "Key West cartridge/converter branch documented",
      eventType: "model_released",
      startDate: "2021",
      circa: false,
      description:
        "Key West establishes the brand's first cartridge/converter fountain-pen route.",
      sourceKey: S.keyWestCollection.key,
    },
    {
      key: "phase597-nahvalur-annual-line-begins",
      title: "Pen of the Year annual line documented",
      eventType: "model_released",
      startDate: "2022",
      circa: true,
      description:
        "Tiger begins the five-year annual sequence currently represented by distinct canonical pages.",
      sourceKey: S.tigerOfficial.key,
    },
    {
      key: "phase597-nahvalur-triad-branch",
      title: "Triad lightweight ABS branch documented",
      eventType: "model_released",
      startDate: "2025",
      circa: true,
      description:
        "Triad adds a lightweight No.5 cartridge/converter route with snap cap.",
      sourceKey: S.triadDesign.key,
    },
    {
      key: "phase597-nahvalur-fourteen-models-verified",
      title: "Fourteen public Nahvalur pen pages verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Retrieval date records seven new canonical model pages and the expanded fourteen-link brand navigation.",
      sourceKey: S.series.key,
    },
  ],
};

export const phase597NahvalurModelPacks: CuratedEntityPack[] = [
  phase597NahvalurKeyWestPack,
  phase597NahvalurTriadPack,
  phase597NahvalurTiger2022Pack,
  phase597NahvalurRabbit2023Pack,
  phase597NahvalurDragon2024Pack,
  phase597NahvalurSnake2025Pack,
  phase597NahvalurHorse2026Pack,
];

export const phase597NahvalurPacks: CuratedEntityPack[] = [
  phase597NahvalurBrandPack,
  ...phase597NahvalurModelPacks,
];

if (
  phase597NahvalurPacks.length !== 8 ||
  new Set(phase597NahvalurPacks.map((pack) => pack.entityId)).size !== 8
) {
  throw new Error("Phase 597 must contain one brand and seven unique model packs.");
}

if (
  PHASE597_TRIAD_CURRENT_SKUS.length !== 16 ||
  PHASE597_TRIAD_EXCLUDED_ROLLERBALL_CODES.length !== 8 ||
  PHASE597_KEY_WEST_UNAVAILABLE_CODES.length !== 8 ||
  PHASE597_HORSE_UNAVAILABLE_CODES.length !== 6
) {
  throw new Error("Phase 597 selector boundary constants are incomplete.");
}
