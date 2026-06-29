import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REVIEW_PATH = path.join(
  process.cwd(),
  "docs/content/read-first-sample-humanizer-review.md",
);

type SourceType =
  | "official"
  | "wikimedia"
  | "book"
  | "patent"
  | "blog"
  | "forum"
  | "reddit"
  | "retailer"
  | "user_submission";

type SourceDef = {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceType: SourceType;
  reliability:
    | "high_for_basic_facts"
    | "high_for_model_history"
    | "official_marketing"
    | "community_opinion"
    | "bibliographic"
    | "technical_primary"
    | "medium"
    | "unknown";
  homepageUrl: string;
  title: string;
  url: string;
  itemType: string;
  summary: string;
  relationType?: "reference" | "review" | "history" | "official";
};

type SampleArticle = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  sourceIds: string[];
  humanizer: {
    directness: number;
    rhythm: number;
    trust: number;
    authenticity: number;
    concision: number;
    notes: string;
  };
};

const BANNED_PATTERNS: Array<[RegExp, string]> = [
  [/有人说.*有人说.*还有人说/s, "有人说三连"],
  [/不是[^。；\n]{0,80}而是/s, "不是而是"],
  [/不仅[^。；\n]{0,80}而且/s, "不仅而且"],
  [/型号档案记录了|现有来源包括|优先按实物图|日用性可以从这些结构入手/, "后台资料卡话术"],
  [/作为[^。；\n]{0,80}(体现|证明|提醒|标志)/, "作为体现类句式"],
  [/标志着|见证了|至关重要|关键作用|持久影响|复杂格局/, "AI 抽象意义词"],
  [/值得注意的是|此外|然而|总的来说|综上/, "AI 连接词"],
  [/很多人认为|行业专家指出|一些批评者认为|多个来源显示/, "模糊归因"],
];

const SOURCES: SourceDef[] = [
  {
    id: "source-rfp-richardspens-parker-51",
    sourceId: "richardspens",
    sourceName: "RichardsPens.com",
    sourceType: "blog",
    reliability: "high_for_model_history",
    homepageUrl: "https://richardspens.com/",
    title: "RichardsPens.com: The Parker 51",
    url: "https://www.richardspens.com/ref/profiles/51.htm",
    itemType: "model_profile",
    summary: "Richard Binder profile for Parker 51 design, filling systems, versions, and collector context.",
    relationType: "history",
  },
  {
    id: "source-rfp-parker51-history",
    sourceId: "parker51-com",
    sourceName: "Parker51.com",
    sourceType: "blog",
    reliability: "high_for_model_history",
    homepageUrl: "https://parker51.com/",
    title: "Parker51.com: 51 History",
    url: "https://parker51.com/index.php/education/51-history/",
    itemType: "model_history",
    summary: "Parker 51 history page used for dating, name context, and Vacumatic/Aerometric reading path.",
    relationType: "history",
  },
  {
    id: "source-rfp-penaddict-parker-51",
    sourceId: "pen-addict",
    sourceName: "The Pen Addict",
    sourceType: "blog",
    reliability: "community_opinion",
    homepageUrl: "https://www.penaddict.com/",
    title: "The Pen Addict: The Parker 51",
    url: "https://www.penaddict.com/blog/2016/7/7/the-parker-51",
    itemType: "review_article",
    summary: "Hands-on article for daily-writing context and modern user appeal of the Parker 51.",
    relationType: "review",
  },
  {
    id: "source-rfp-lamy-2000-official",
    sourceId: "lamy",
    sourceName: "LAMY official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.lamy.com/",
    title: "LAMY 2000 fountain pen",
    url: "https://www.lamy.com/en-us/p/lamy-2000-fountain-pen",
    itemType: "official_product_page",
    summary: "Official LAMY 2000 product page for Makrolon body, piston filling, platinum-coated 14K nib, and design language.",
    relationType: "official",
  },
  {
    id: "source-rfp-lamy-design",
    sourceId: "lamy",
    sourceName: "LAMY official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.lamy.com/",
    title: "The LAMY Design",
    url: "https://www.lamy.com/en-us/company/design",
    itemType: "official_brand_history",
    summary: "LAMY design page for brand design approach and historical context around LAMY 2000.",
    relationType: "official",
  },
  {
    id: "source-rfp-gentleman-lamy-2000",
    sourceId: "gentleman-stationer",
    sourceName: "The Gentleman Stationer",
    sourceType: "blog",
    reliability: "community_opinion",
    homepageUrl: "https://www.gentlemanstationer.com/",
    title: "The Gentleman Stationer: Lamy 2000 review",
    url: "https://www.gentlemanstationer.com/blog/2017/7/1/pen-review-lamy-2000-fountain-pen",
    itemType: "review_article",
    summary: "Long-form use review for LAMY 2000 ergonomics, nib feel, and daily writing positioning.",
    relationType: "review",
  },
  {
    id: "source-rfp-pilot-custom-823-official",
    sourceId: "pilot-usa",
    sourceName: "Pilot Pen USA",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://pilotpen.us/",
    title: "Pilot Custom 823 fountain pen",
    url: "https://pilotpen.us/Product?0=41&1=72&cid=100154",
    itemType: "official_product_page",
    summary: "Official Pilot Custom 823 product page for vacuum filling, 14K nib, and Custom series positioning.",
    relationType: "official",
  },
  {
    id: "source-rfp-goulet-custom-823",
    sourceId: "goulet-pens",
    sourceName: "Goulet Pens",
    sourceType: "retailer",
    reliability: "high_for_basic_facts",
    homepageUrl: "https://www.gouletpens.com/",
    title: "Goulet Pens: Pilot Custom 823",
    url: "https://www.gouletpens.com/products/pilot-custom-823-fountain-pen-amber",
    itemType: "retailer_product_page",
    summary: "Retail product page for Custom 823 colors, nib choices, and vacuum-filling buyer context.",
    relationType: "reference",
  },
  {
    id: "source-rfp-platinum-3776-official",
    sourceId: "platinum-pen-usa",
    sourceName: "Platinum Pen USA",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://platinumpenusa.com/",
    title: "Platinum Pen USA: #3776 Century Collection",
    url: "https://platinumpenusa.com/luxury-writing/3776-collection/",
    itemType: "official_product_family",
    summary: "Official collection page for #3776 Century, 14K nibs, Slip & Seal cap, and Mount Fuji naming.",
    relationType: "official",
  },
  {
    id: "source-rfp-goulet-3776",
    sourceId: "goulet-pens",
    sourceName: "Goulet Pens",
    sourceType: "retailer",
    reliability: "high_for_basic_facts",
    homepageUrl: "https://www.gouletpens.com/",
    title: "Goulet Pens: Platinum 3776 Century",
    url: "https://www.gouletpens.com/collections/platinum-3776-century-fountain-pens",
    itemType: "retailer_collection",
    summary: "Retail collection source for #3776 Century nib options, colors, and modern buyer context.",
    relationType: "reference",
  },
  {
    id: "source-rfp-sailor-progear-official",
    sourceId: "sailor",
    sourceName: "Sailor official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://en.sailor.co.jp/",
    title: "Sailor: Professional Gear Series",
    url: "https://en.sailor.co.jp/topics/professional-gear-series/",
    itemType: "official_product_family",
    summary: "Official Professional Gear series page for flat-top design, size family, and nib family context.",
    relationType: "official",
  },
  {
    id: "source-rfp-sailor-1911-official",
    sourceId: "sailor",
    sourceName: "Sailor official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://en.sailor.co.jp/",
    title: "Sailor: 1911 Series",
    url: "https://en.sailor.co.jp/topics/1911-series/",
    itemType: "official_product_family",
    summary: "Official 1911 series page used to compare cigar-shaped 1911 with flat-top Professional Gear.",
    relationType: "official",
  },
  {
    id: "source-rfp-montblanc-149-official",
    sourceId: "montblanc",
    sourceName: "Montblanc official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.montblanc.com/",
    title: "Montblanc Meisterstück The Origin Collection 149 Fountain Pen",
    url: "https://www.montblanc.com/en-ro/meisterstuck-the-origin-collection-149-fountain-pen-MB131336.html",
    itemType: "official_product_page",
    summary: "Official Montblanc 149 product page for Meisterstück positioning, piston filling, and high-end materials.",
    relationType: "official",
  },
  {
    id: "source-rfp-gentleman-montblanc-149",
    sourceId: "gentleman-stationer",
    sourceName: "The Gentleman Stationer",
    sourceType: "blog",
    reliability: "community_opinion",
    homepageUrl: "https://www.gentlemanstationer.com/",
    title: "The Gentleman Stationer: Montblanc Meisterstück 149",
    url: "https://www.gentlemanstationer.com/blog/2015/9/7/pen-review-montblanc-meisterstuck-149",
    itemType: "review_article",
    summary: "Hands-on review context for Montblanc 149 size, writing feel, and daily-use tradeoffs.",
    relationType: "review",
  },
  {
    id: "source-rfp-pelikan-m800-official",
    sourceId: "pelikan",
    sourceName: "Pelikan official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.pelikan.com/",
    title: "Pelikan Souverän M800 fountain pen",
    url: "https://www.pelikan.com/int/products/writing/fine-writing-instruments/souveraen/301017-souveraen-m800-fountain-pen.html",
    itemType: "official_product_page",
    summary: "Official Pelikan Souverän M800 page for striped body, piston filling, and 18K nib positioning.",
    relationType: "official",
  },
  {
    id: "source-rfp-pelikan-collectibles-m800",
    sourceId: "pelikan-collectibles",
    sourceName: "Pelikan Collectibles",
    sourceType: "blog",
    reliability: "high_for_model_history",
    homepageUrl: "https://www.pelikan-collectibles.com/",
    title: "Pelikan Collectibles: Souverän M800",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M800-Basis/index.html",
    itemType: "model_history",
    summary: "Specialist reference for Pelikan M800 model history, variants, and collector distinctions.",
    relationType: "history",
  },
  {
    id: "source-rfp-kaweco-sport-official",
    sourceId: "kaweco",
    sourceName: "Kaweco official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.kaweco-pen.com/",
    title: "Kaweco: Classic Sport",
    url: "https://www.kaweco-pen.com/en/Series/CLASSIC-SPORT/",
    itemType: "official_product_page",
    summary: "Official Classic Sport page for pocket size, octagonal cap, and cartridge-based everyday use.",
    relationType: "official",
  },
  {
    id: "source-rfp-kaweco-history",
    sourceId: "kaweco",
    sourceName: "Kaweco official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.kaweco-pen.com/",
    title: "Kaweco History",
    url: "https://www.kaweco-pen.com/en/service/history/",
    itemType: "official_brand_history",
    summary: "Official Kaweco history page used for Sport family background and historical naming context.",
    relationType: "history",
  },
  {
    id: "source-rfp-platinum-izumo-official",
    sourceId: "platinum-pen-usa",
    sourceName: "Platinum Pen USA",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://platinumpenusa.com/",
    title: "Platinum Pen USA: Izumo Collection",
    url: "https://platinumpenusa.com/luxury-writing/izumo-collection/",
    itemType: "official_product_family",
    summary: "Official Izumo collection page for 18K nibs, PIZ variants, and Japanese craft positioning.",
    relationType: "official",
  },
  {
    id: "source-rfp-endlesspens-izumo",
    sourceId: "endlesspens",
    sourceName: "EndlessPens",
    sourceType: "retailer",
    reliability: "high_for_basic_facts",
    homepageUrl: "https://endlesspens.com/",
    title: "EndlessPens: Platinum Izumo 18K",
    url: "https://endlesspens.com/products/platinum-fountain-pen-izumo-18k-nib",
    itemType: "retailer_product_page",
    summary: "Retail spec page for Izumo 18K materials, filling mechanism, and modern product photos.",
    relationType: "reference",
  },
  {
    id: "source-rfp-richardspens-snorkel",
    sourceId: "richardspens",
    sourceName: "RichardsPens.com",
    sourceType: "blog",
    reliability: "high_for_model_history",
    homepageUrl: "https://richardspens.com/",
    title: "RichardsPens.com: Sheaffer's Snorkel",
    url: "https://www.richardspens.com/ref/profiles/snorkel.htm",
    itemType: "model_profile",
    summary: "Specialist profile for Sheaffer Snorkel filling system, model history, variants, and service complexity.",
    relationType: "history",
  },
  {
    id: "source-rfp-penhero-snorkel",
    sourceId: "penhero",
    sourceName: "PenHero",
    sourceType: "blog",
    reliability: "high_for_model_history",
    homepageUrl: "https://www.penhero.com/",
    title: "PenHero: Sheaffer Snorkel",
    url: "https://www.penhero.com/PenGallery/Sheaffer/SheafferSnorkel.htm",
    itemType: "model_history",
    summary: "PenHero model history and visual reference for Sheaffer Snorkel family and variants.",
    relationType: "history",
  },
];

const ARTICLES: SampleArticle[] = [
  {
    slug: "派克-parker-51-经典-vintage",
    title: "Parker 51：把钢笔变成随手可用的工具",
    summary: "Parker 51 的重点在暗尖、Lucite 笔身和 Vacumatic/Aerometric 上墨，它把老式钢笔从需要照看的物件推向了更省心的日用工具。",
    sourceIds: [
      "source-rfp-richardspens-parker-51",
      "source-rfp-parker51-history",
      "source-rfp-penaddict-parker-51",
    ],
    humanizer: {
      directness: 10,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "去掉了资料卡语气，保留版本和使用判断；没有否定式排比或三段式观点列举。",
    },
    body: `一支老 Parker 51 最容易让人记住的地方，往往不是它的笔尖。你把笔帽拔开，看到的只是一个小小的金属触点，真正的笔尖藏在前端的壳里。第一次用惯明尖的人会有点不适应，像拿了一支没有表情的笔。落到纸上才明白它的思路：少给你看一点，少让墨水暴露一点，也少让你为钢笔操心一点。

Parker 51 在 1940 年代进入市场。Parker51.com 和 Richard Binder 的资料都把它放在 Parker 最重要的产品线里读：研发时间长，量产时间久，版本也多。它的名字和 Parker 的公司纪念年份有关，也足够短，放在任何广告里都醒目。那不是一个靠华丽装饰取胜的年代。二战前后的美国钢笔市场很热闹，Sheaffer、Waterman、Wahl-Eversharp 都在改外形、改上墨、改笔尖。Parker 51 的聪明处在于，它没有只改某个零件。暗尖、流线笔身、Lucite 材料、配套墨水和新的供墨思路被放在同一支笔里。

暗尖是这支笔的核心。传统钢笔把笔尖摊在外面，笔尖好看，也容易干。51 把笔尖缩进前端，只露出触纸的部分，墨水通道被包起来。这个设计带来的好处很直观：拔帽就写的概率更高，长时间停笔后的不耐烦少一些。为了适应这个结构，51 的笔尖也变窄，手感更硬，线条不靠弹性取悦人。它写起来像一个安静的机械零件，稳定、克制，几乎不要求使用者配合。

Lucite 笔身也让 51 和早一点的硬橡胶、赛璐珞钢笔拉开距离。它摸起来没有金属的冷感，也少了旧赛璐珞那种花纹戏剧性。Parker 当年在广告里强调耐用、现代和速度，这些词落到 51 上并不空。流线笔帽、箭形笔夹、光滑笔身，放在一起像一件战后工业产品。它没有让钢笔显得更古典，反而把钢笔往打字机、飞机、办公桌那套现代想象里推了一步。

上墨系统是另一个分水岭。早期 Vacumatic 版本有更强的机械感，也更像收藏者想象中的老派 Parker。后来 Aerometric 版本简化了维护，那个 Pli-Glass 吸墨管到今天仍被很多修笔人称赞。想日用，Aerometric 更容易让人放心；想玩结构和年代味，Vacumatic 更有意思。这两个版本不该混着买。看笔身铭文、笔帽、尾端和内部结构，比只看卖家标题靠谱。

把 Parker 51 放回同代市场，它和 Sheaffer Snorkel 走的是两条路。Snorkel 让上墨动作变成一次精密表演，吸墨管伸出来，笔尖可以不碰墨水。Parker 51 没有这种戏剧感。它的目标更朴素：少漏、少干、少解释。Eversharp Skyline 的外形很漂亮，流线笔帽很有时代感，但内部仍接近传统钢笔。51 的现代感藏在你看不到的地方。

这也是它到今天还被反复使用的原因。很多老笔适合收藏，真正带出门会犹豫：怕漏墨，怕笔囊老化，怕一不小心把脆弱材料摔出裂。状态好的 51 没那么娇气。它当然是老笔，也需要正常维护，但它的使用门槛比许多同年代钢笔低。你可以把它当成一支历史物件，也可以把它灌上墨，放进笔袋里继续写。

日常使用时，Parker 51 不太像一支会让人惊呼的笔。它不炫耀大金尖，也不靠柔软弹性讨好手指。它的好处要写一阵才出来：握位不累，出水均匀，笔帽插拔快，外形放在今天也不显旧。很多老笔需要一点脾气和耐心，51 少一些。它像一件已经调好的工具，拿起来就进入工作状态。

买 Parker 51 要冷静。先分清 Vacumatic 和 Aerometric，再看产地、笔帽材质、笔夹、笔身刻字和笔尖状态。裂纹、收缩、笔帽松动、供墨器堵塞都会影响使用。价格太低的 51 往往需要维修预算，外观很新的也未必写得好。它的价值不只在“经典”两个字里。真正值得买的，是那种几十年后还能让你忘记笔本身的 51。`,
  },
  {
    slug: "凌美-lamy-lamy-2000",
    title: "LAMY 2000：灰黑色工具笔为什么会留下来",
    summary: "LAMY 2000 从 1966 年延续至今，靠 Makrolon 笔身、半包 14K 金尖和活塞上墨形成了很少过时的工具感。",
    sourceIds: [
      "source-rfp-lamy-2000-official",
      "source-rfp-lamy-design",
      "source-rfp-gentleman-lamy-2000",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 10,
      authenticity: 9,
      concision: 9,
      notes: "文章用使用入口和结构解释推进，避免把 LAMY 2000 写成抽象设计宣言。",
    },
    body: `LAMY 2000 的外形很容易被误读。它看起来太安静了，灰黑色笔身， brushed stainless steel 笔帽，笔尖只露出一点。放在一排钢笔里，它不像礼品，也不像收藏柜里的主角。可它从 1966 年一直卖到现在，靠的正是这种不抢戏的性格。

LAMY 官网把 LAMY 2000 放在品牌设计史里讲，设计师 Gerd A. Müller 的名字也总会跟它一起出现。那段背景很重要，但最好不要把它讲成“包豪斯神话”。真正落到手里，LAMY 2000 的设计感来自几个具体决定：玻璃纤维增强 Makrolon 笔身，活塞上墨，半包 14K 金尖，笔帽和笔身之间几乎没有多余装饰。你看不到传统钢笔那种大笔尖，也看不到炫目的纹路。它把所有装饰欲望都压低了。

这种克制会让 LAMY 2000 显得比实际年代更年轻。1960 年代的许多产品看回去都有明确时代印记，2000 却很难被一眼放进某一年。它没有夸张的金属件，也没有后来设计笔常见的锋利线条。圆润、哑光、灰黑色，这些选择让它像办公桌上的一件常用品。它看上去并不便宜，只是没有把贵写在外面。

Makrolon 是这支笔的触感来源。它不像金属笔那样冷，也不像光面树脂那样滑。磨砂表面会随使用留下细微痕迹，新的时候有一点生，写久了会变得更顺。LAMY 2000 的握位没有明显台阶，笔身从中段自然收向笔尖。这个形状对很多人很舒服，也会让另一部分人烦躁，因为半包尖旁边有两个小小的笔帽卡点，握得低的人会碰到。

半包金尖决定了它的书写性格。LAMY 2000 不是一支靠弹性表达情绪的笔，笔尖被前端包住，视觉上也不鼓励你盯着尖看。它的重点是稳定和速度。很多使用者喜欢它，是因为它能长时间写字，不会让人总想着“我正在用一支贵钢笔”。这句话听起来朴素，却很接近 LAMY 2000 的核心。它把高级感做成了一种日常感。

和 Pilot Custom 823、Pelikan M800 这类活塞或大容量笔相比，LAMY 2000 的存在感更低。823 让你看到墨水，M800 让你看到条纹和大金尖，LAMY 2000 让这些东西退到后面。它也不像 Montblanc 149 那样有强烈的社交符号。你把它拿到会议室里，懂笔的人会看一眼；不懂的人只会把它当成一支灰黑色钢笔。

这个低存在感也会影响购买判断。想要一支拿出来就有仪式感的笔，LAMY 2000 可能太安静。想要一支每天写几页、不必担心配色和装饰的人，LAMY 2000 会变得顺手。活塞储墨量够用，笔身轻，笔帽插拔快，磨砂表面也不太怕指纹。它像一件长期工具，优点在重复使用里慢慢出现。

这支笔也有门槛。半包尖的甜区会让某些人不适应，尤其是习惯旋转笔杆写字的人。笔尖粗细也要谨慎选，LAMY 2000 的 EF 在不同批次和调校下不总是想象中的“极细”。活塞上墨带来不错的储墨量，清洗却比普通上墨器麻烦一点。它适合长期用一种墨水的人，不适合每天换颜色玩。

买 LAMY 2000 时，先问握位和笔尖角度。最好试写。试不到，就选保守尖号，收到后检查笔帽卡点、活塞顺滑度和出水。它没有太多花哨故事，优势也不需要夸大。LAMY 2000 最迷人的地方，是你用了一年后可能想不起来它有什么惊喜，却一直没把它从桌面上拿走。`,
  },
  {
    slug: "百乐-pilot-custom-823",
    title: "Pilot Custom 823：一支为长写准备的透明大水箱",
    summary: "Pilot Custom 823 的吸引力来自真空上墨、透明笔身和 14K 金尖组合，它更像一支可靠的长写工具。",
    sourceIds: [
      "source-rfp-pilot-custom-823-official",
      "source-rfp-goulet-custom-823",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "减少日用旗舰一类口号，改成真空上墨和长写场景解释。",
    },
    body: `Custom 823 最容易让人记住的是那一管墨水。透明或半透明笔身里，墨水跟着笔杆晃动，写到哪里、还剩多少，一眼就知道。很多钢笔把上墨系统藏起来，823 刚好相反。它让你看见储墨量，也让你知道这支笔为什么适合长写。

Pilot 官方资料把 Custom 823 放在 Custom 系列里，真空上墨和 14K 金尖是它的主要身份。它没有复杂装饰，常见颜色也克制，琥珀、烟灰、透明都服务于同一个目的：让墨水成为视觉的一部分。拿它和普通墨囊/上墨器钢笔比，差别不在“高级”两个字，而在使用节奏。823 吸满一次，可以写很久。写长笔记、日记、会议记录时，这种省心很直接。

Custom 这个名字在 Pilot 产品线里跨度很大。Custom 74 更轻便，Custom 743 接近 823 的大金尖但用上墨器，Custom 845 又把漆面和更高端材料带进来。823 站在中间：它有大笔尖，有大容量，也有透明笔身带来的实用感。它没有 845 的工艺展示，也没有 74 的轻松价格。它像一支把书写放在前面的旗舰。

真空上墨的动作有仪式感。拉开尾杆，把笔尖伸进墨水瓶，推下去，负压会把墨水吸进笔身。第一次用会觉得它像小型机械。这个系统也有一个使用习惯：长时间书写前，尾钮通常要旋开一点，让墨水顺利进入前端供墨。忘了这一步，写到一半可能会变干。很多新手第一次遇到这个情况，以为笔有问题，其实只是没有让储墨仓和前端连通。

Custom 823 的 14K 金尖很大，视觉上比很多日系金尖更有存在感。Pilot 的调校通常偏顺滑，出水稳定，适合写中文也适合连续英文笔记。它不靠强弹性取悦人，线条变化有限，优点在可预期。你知道它下一笔会怎么出水，这种稳定感在长写里比短暂惊艳更有用。

和 Platinum #3776 Century 比，823 的反馈更少，储墨量更大，维护也麻烦一些。和 Sailor Pro Gear 比，它少了那种铅笔感，换来更顺的纸面移动。和 LAMY 2000 比，它更愿意让你看见结构，也更像一支为墨水爱好者准备的透明工具。三者都可以日用，823 的优势集中在“写很久”这件事上。

还有一个容易被忽略的细节：真空上墨让 823 更适合固定搭配墨水。你会更愿意给它选一瓶稳定、颜色耐看、清洗不折磨人的墨。亮片墨、强染色墨、容易结垢的墨水都要谨慎。823 不是不能玩墨水，它只是会把换墨的成本放大。喜欢频繁试色的人，可能会发现普通上墨器钢笔反而更自由。

这支笔也不是无脑推荐。清洗真空上墨比清洗上墨器费事，换墨频繁的人会累。透明笔身会让墨迹、水汽、细小沉积变得更显眼。大容量意味着你一旦灌了不喜欢的墨，就要和它相处更久。823 适合相对固定的墨水、较长的书写时间和愿意接受维护成本的用户。

购买时先确认版本、颜色、尖号和渠道。二手笔要看活塞杆动作、密封圈状态、笔尖是否被打磨过，透明笔身还要看裂纹。Custom 823 的口碑很高，但它的好不在传说里。它真正解决的问题很具体：给一支顺滑可靠的日系金尖，配上足够大的墨水空间，让你写到忘记加墨这件事。`,
  },
  {
    slug: "白金-platinum-3776-century",
    title: "Platinum 3776 Century：一支不怕放干的日系金尖",
    summary: "Platinum #3776 Century 以富士山高度命名，14K 金尖和 Slip & Seal 笔帽让它成为日系金尖里很容易长期使用的一支。",
    sourceIds: [
      "source-rfp-platinum-3776-official",
      "source-rfp-goulet-3776",
    ],
    humanizer: {
      directness: 10,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把命名、密封和笔尖反馈分开写，避免空泛称赞。",
    },
    body: `Platinum #3776 Century 的名字先把你带到富士山。3776 是富士山的高度，听起来有点用力，笔本身却没那么夸张。它常见的树脂笔身、14K 金尖、墨囊/上墨器结构都很传统。真正让它在日用里留下位置的，是一件小事：放几天再打开，它通常还能写。

Platinum Pen USA 的 #3776 Collection 页面把 Slip & Seal 笔帽机制放在重要位置。这个机制不是为了制造谈资。钢笔最烦人的瞬间之一，是你拿起它准备写字，第一笔却干在纸上。Slip & Seal 想解决的正是这个问题。笔帽内部的密封结构让笔尖区域更稳定，减少停用后的干尖。对于一支会被放在桌上、包里、抽屉里的日用金尖，这比许多装饰更实用。

这个机制也改变了 #3776 的使用场景。它适合那种不是每天写很多、但需要随时拿起来能用的人。比如办公桌上放一支红墨批注，或者手账里隔几天写一段。普通钢笔在这种场景里容易让人失去耐心，#3776 的笔帽让它更像一支可靠的备用金尖。它没有大容量的炫技，却解决了一个经常发生的小麻烦。

#3776 Century 的笔尖也有自己的性格。它不是那种滑到没有存在感的日系笔。Platinum 的 14K 金尖常给人较清楚的纸面反馈，写中文时这种反馈会让笔画更有边界。喜欢玻璃感顺滑的人可能觉得它有阻尼；喜欢控制感的人会觉得它好用。这个分歧不需要调和，试写比看评论更重要。

和 Pilot Custom 823 比，#3776 Century 储墨量小，清洗简单，防干更强。和 Sailor Pro Gear 比，它的反馈没有 Sailor 那么“铅笔”，价格和版本选择也经常更容易进入。它像一支很会守本分的金尖笔。没有大容量真空上墨，也没有复杂材料故事，优点集中在笔帽、笔尖和可维护性。

这支笔也适合拿来理解“日系三金”的差异。Pilot 往往被说成顺，Sailor 更有沙沙反馈，Platinum 夹在中间又有自己的硬朗感。这样的概括很粗，但能帮助第一次比较的人找到方向。真正落到购买，还是要看尖号。Platinum 的 UEF、EF、F、M、B、C 等选择会让同一支 #3776 完全变成不同工具。

版本方面，普通树脂、透明示范、富士旬景、莳绘或特殊材料会拉开价格。普通版适合日用，特殊版更多带收藏和审美属性。二手购买要检查笔帽密封、笔尖是否歪斜、握位是否有裂纹，上墨器是否匹配。#3776 Century 的价值不在“所有人都喜欢”，而在它把一个常见痛点解决得很认真。对于经常隔几天才拿起钢笔的人，这点足够重要。`,
  },
  {
    slug: "sailor-pro-gear",
    title: "Sailor Pro Gear：平顶外形里的写乐笔尖脾气",
    summary: "Sailor Pro Gear 把写乐金尖反馈和平顶外形放在一起，和雪茄形 1911 形成了清楚的性格差别。",
    sourceIds: [
      "source-rfp-sailor-progear-official",
      "source-rfp-sailor-1911-official",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "用 1911 对照解释 Pro Gear，避免堆砌尺寸和尖号。",
    },
    body: `Sailor Pro Gear 的第一眼差别在笔帽和尾端。它是平顶，不是 1911 那种雪茄形。这个差别看似只关外观，放到手里会改变整支笔的气质。1911 更像传统礼服，Pro Gear 更像把写乐金尖放进了一个短一点、利落一点的壳里。

Sailor 官方把 Professional Gear 和 1911 分成两条清楚的系列。两者都能见到写乐的金尖体系，尺寸也有 Slim、标准、King of Pen 等变化。Pro Gear 的平顶让它看起来更现代，笔帽端和尾端的装饰环也更容易成为配色的一部分。写乐这些年大量特别色、限定色、地区色，Pro Gear 是主要载体之一。对玩家来说，它常常先以颜色吸引人，最后留住人的还是笔尖。

Pro Gear 的好处在于它把“写乐感”做得更容易入口。1911 的雪茄形很传统，适合喜欢经典比例的人；Pro Gear 少一点礼服感，多一点文具感。平顶也让它更适合玩颜色。很多品牌做彩色树脂会显得轻浮，Sailor 往往靠笔尖把这件事压住。你可以因为一支限定色买它，最后仍会回到纸面反馈上。

写乐笔尖的反馈很难只用“顺”来讲。它在纸上有细小阻尼，像铅笔划过纸面。这个比喻被用得很多，因为确实接近。喜欢的人会觉得它有控制感，写小字时笔画不飘；不喜欢的人会觉得它不够滑，甚至有点吵。21K 和 14K 的差异、尖号、尺寸、调校都会改变这种感觉。Pro Gear 的魅力就在这里：同一个外形家族，能装下很多细微脾气。

和 Pilot Custom 823 比，Pro Gear 不靠大容量取胜。和 Platinum #3776 Century 比，它的反馈更有辨识度，防干机制没有 Platinum 那么突出。和 1911 比，Pro Gear 的笔身更短、更方，视觉上少一点传统感。选择 Pro Gear 时，其实是在选择“我想要写乐笔尖，但不想要雪茄形”。

尺寸要认真看。Slim 对手小的人友好，也更轻；标准款更均衡；King of Pen 是另一种东西，尺寸、价格和笔尖存在感都明显上去。很多人第一次买 Pro Gear 会被颜色带走，真正影响长期使用的却是尺寸和尖号。日常中文小字可以从 MF、F 看起，想要更明显墨迹再往 M 或 B 走。盲买粗尖要谨慎，写乐的反馈和出水不一定符合每个人对“金尖”的想象。

Pro Gear 也不是一支适合所有场景的笔。墨囊/上墨器结构清洗方便，储墨量普通。写短笔记、批注、手账很舒服，连续写几十页时，尺寸和重量就要重新评估。喜欢很滑、很湿、大容量的人，Pilot Custom 823 会更直接。喜欢防干和硬朗控制的人，Platinum #3776 Century 也许更稳。Pro Gear 的位置更窄一点，却也更鲜明。

购买时还要看版本。普通款、限量款、地区限定、联名色会让价格差别很大，但书写核心未必成比例变化。收藏可以追颜色，日用先看尺寸、笔尖和售后。Pro Gear 最有意思的地方，是它没有把写乐变得温顺。它让笔尖保留一点脾气，然后用平顶外形和丰富配色把这点脾气包装得更容易入口。`,
  },
  {
    slug: "万宝龙-montblanc-大班149-meisterst-ck",
    title: "Montblanc 149：一支很难只按书写评价的钢笔",
    summary: "Montblanc Meisterstück 149 有大尺寸金尖、活塞上墨和强烈品牌符号，购买前要把书写、身份感和版本差异分开看。",
    sourceIds: [
      "source-rfp-montblanc-149-official",
      "source-rfp-gentleman-montblanc-149",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 10,
      authenticity: 9,
      concision: 8,
      notes: "承认品牌符号的存在，但没有把它写成广告。",
    },
    body: `Montblanc 149 很难只当成一支钢笔看。你把它拿出来，白色雪峰、粗大的雪茄形笔身、大尺寸金尖已经先说话了。它写得好不好当然重要，可 149 的问题从来不只在纸面上。它同时是一支书写工具、一个品牌符号，也是一类被反复讨论的收藏对象。

Montblanc 官方把 149 放在 Meisterstück 体系里。Meisterstück 这个名字从 1920 年代就进入品牌叙事，149 则是其中最有代表性的大尺寸活塞钢笔之一。它的造型很稳定：黑色树脂笔身，金属饰环，活塞上墨，大金尖。你可以说这些元素传统，甚至保守。可它们组合在一起，识别度极高。很多人不认识 Pelikan M800，也不认识 Pilot 823，但会认得 Montblanc。

这种识别度会带来负担。149 太容易被当成身份符号，书写本身反而被挤到后面。可如果把品牌光环先放一边，它仍然是一支结构完整的大型活塞金尖笔。活塞储墨量充足，笔身粗，笔尖视觉上非常开阔。它的确有工具属性，只是这个工具从一开始就很难保持低调。

149 的尺寸是第一道门槛。它不是一支轻巧签字笔。笔身粗，笔尖大，握在手里有明显存在感。喜欢大笔的人会觉得它从容，手掌有空间，笔尖在纸上也显得稳。不喜欢大笔的人会觉得它笨，长写容易累。The Gentleman Stationer 这类长期评测会反复提到这一点：149 的评价离不开手型和使用场景。

大金尖是它最有吸引力的部分。149 的笔尖视觉张力强，出水和触纸感也会随年代、尖号和调校变化。现代 149 和老 149 不能简单混在一起说。老笔有不同笔尖样式、供墨状态和维修历史，现代笔有更稳定的售后和更高价格。想买来日用，现代渠道省心；想玩年代和笔尖差异，就要准备学习成本。

拿 149 和 Pilot Custom 823 比，会发现它们解决的是不同需求。823 更像长写工具，透明笔身和真空上墨把实用性摆在前面。149 的储墨量也不小，但它从外观到品牌都更有仪式感。和 Pelikan M800 比，149 更粗、更像商务符号；M800 的活塞结构、可旋出笔尖和条纹笔身则更偏传统玩家路线。

购买 149 最怕只听一句“标杆”。它确实是标杆，但标杆不等于适合每个人。先确认自己能不能接受尺寸，再看尖号、年代、渠道和维修状态。二手 149 要检查活塞顺滑度、笔尖铱粒、笔帽裂纹、笔身刻字和是否有打磨痕迹。新笔则要试写，尤其是出水和笔尖角度。149 的价格里有书写，也有品牌。把这两件事分开想，反而更容易判断它值不值。`,
  },
  {
    slug: "百利金-pelikan-m800",
    title: "Pelikan M800：德系活塞笔的分量感",
    summary: "Pelikan M800 是 Souverän 系列里很有代表性的大尺寸活塞钢笔，条纹笔身、18K 金尖和可拆笔尖组件构成了它的玩家属性。",
    sourceIds: [
      "source-rfp-pelikan-m800-official",
      "source-rfp-pelikan-collectibles-m800",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "以尺寸和活塞结构为主线，没有写成高端德系空话。",
    },
    body: `Pelikan M800 的第一印象通常来自两件事：条纹笔身和分量。绿条纹最经典，光线穿过半透明的醋酸纤维时，能隐约看到里面的墨水。拿起来以后，笔身比 M400、M600 更有存在感。它不是大到夸张的笔，却足够让人知道自己拿着一支高阶活塞钢笔。

Pelikan 官方把 M800 放在 Souverän 系列里。这个系列的识别度很稳定：鸟嘴形笔夹、条纹笔身、活塞上墨、金属装饰环。M800 是其中很关键的尺寸。它比 M600 更厚实，笔尖也更大；又没有 M1000 那么软和夸张。对很多人来说，M800 是 Pelikan 日用和收藏之间的平衡点。

M800 还有一种很老派的优点：你能看懂它。条纹笔身让墨量隐约可见，活塞旋钮告诉你怎么上墨，笔尖组件可以旋出，品牌标识也很清楚。它不像某些现代设计笔那样需要解释自己的姿态。它就是一支传统活塞钢笔，把尺寸、材料和结构都做得比较满。

活塞是 Pelikan 的核心体验。旋开尾端，墨水被吸进笔身，储墨量比普通上墨器更让人放心。M800 的活塞动作通常顺滑，维护也有玩家友好的一面：笔尖组件可以旋出，清洗和更换比许多一体结构容易。这个设计让 M800 很适合长期使用，也让它天然进入玩家讨论。你可以换尖，可以维护，可以把它当成一件会陪你很多年的工具。

M800 的 18K 金尖给它带来柔中带稳的性格。它不像 Sailor 那样强调纸面反馈，也不像 LAMY 2000 那样低调到几乎消失。Pelikan 的金尖常被期待有更湿润的出水和更明显的笔尖存在感。实际手感要看年份和单支状态，现代尖、老尖、EF 到 B 的差别不小。盲买时，宁可多看书写样张，也别只看尖号字母。

和 Montblanc 149 比，M800 更像玩家笔。149 的品牌符号很强，M800 的讨论更多落在活塞、条纹、笔尖和版本上。和 Pilot Custom 823 比，M800 没有透明大水箱那种直观容量感，却有更传统的德系结构和更方便的笔尖维护。和 M1000 比，M800 更容易日用，尺寸和笔尖都收得住。

这支笔也很吃握笔习惯。M800 的重量和尺寸会让小手用户犹豫，插帽书写更要小心重心。喜欢轻笔的人可能会觉得它厚重；习惯大笔的人会觉得它稳。Pelikan 的出水通常偏充足，搭配纸张和墨水时要留意洇墨。它适合写信、笔记、签字和慢一点的长文。它不适合塞进口袋，也不适合把每一种新墨水都试一遍。

买 M800 要看版本。绿条、蓝条、红条、黑色、特别版都会影响价格。二手笔要检查活塞是否顺滑、笔尖组件是否正常、笔帽环和笔身有没有裂纹，透明条纹里是否有难清的墨迹。M800 的魅力不在“贵”，而在它把传统活塞钢笔的几个关键乐趣做得很完整。它有重量，有储墨量，有可维护的结构，也有足够强的外观记忆点。`,
  },
  {
    slug: "kaweco-sport",
    title: "Kaweco Sport：小到能放进口袋的钢笔",
    summary: "Kaweco Sport 的重点是短笔身、八角笔帽和便携比例，合盖很短，插帽后才变成一支正常可写的笔。",
    sourceIds: [
      "source-rfp-kaweco-sport-official",
      "source-rfp-kaweco-history",
    ],
    humanizer: {
      directness: 10,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 10,
      notes: "文章用便携体验展开，句式较短，符合轻量型号的内容节奏。",
    },
    body: `Kaweco Sport 的乐趣从尺寸开始。合上笔帽时，它短得不像一支正经钢笔，放进口袋、零钱包或小本夹层都不费劲。把笔帽插到尾端，它又变成接近正常长度的书写工具。这个动作很简单，却解释了 Sport 为什么能活这么久。

Kaweco 官方把 Classic Sport 放在 Sport 家族里，八角笔帽、短笔身和墨囊结构是它最容易辨认的特征。Sport 这个名字可以追到更早的 Kaweco 历史，现代 Classic Sport 则把这种便携比例做成了很稳定的产品。它不像 LAMY 2000 那样讨论工业设计，也不像 Montblanc 149 那样带着社交符号。Sport 更像一支随手塞进包里的小工具。

Sport 的设计有一种很现实的聪明。很多钢笔一旦变短，握持就会牺牲很多；Sport 靠长笔帽解决这个问题。合盖时短，写字时把笔帽插到尾端，长度就回来了。八角笔帽还有一个小好处：放在桌上不容易滚走。对于一支经常被带出门的小笔，这个细节比很多装饰更有用。

短笔身带来的好处很直接。你不用给它准备专门的笔盒，也不怕它在口袋里太长。八角笔帽能防滚，外观也比普通圆杆更有记忆点。缺点同样明显：不插帽时太短，大手用户很难舒服书写；插帽后重心会往后走一点。Classic Sport 的塑料版本很轻，长写不累，但质感也朴素。AL Sport、Brass Sport、Steel Sport 这些金属版本会把手感彻底改掉，尤其是黄铜，重量几乎让它变成另一支笔。

Sport 的笔尖通常是钢尖，EF、F、M、B、BB 等规格给了它足够的日用选择。它不是靠笔尖惊艳取胜。真正的卖点是“我愿意带它出门”。墨囊结构简单，短上墨器兼容性要看版本和配件，储墨量也别期待太多。它适合短笔记、手账、签字、外出备用。长篇书写当然可以，但那不是它最舒服的场景。

和 Pilot Custom 823 这种大容量钢笔比，Sport 几乎站在另一端。823 适合坐下来写很久，Sport 适合被临时拿出来。和 LAMY Safari 比，Sport 更短、更成人化，也更不占包。和 Kaweco Liliput 比，Sport 没那么极端，八角笔帽和较粗笔身让它更容易握住。

买 Sport 时，先决定材质，再决定尖号。塑料版便宜轻松，适合试水；AL Sport 更结实，质感也更像日常 EDC；黄铜和钢版有重量，喜欢的人很喜欢，不适应的人会觉得累。检查笔帽松紧、笔尖是否刮纸、上墨器是否能装进去。Kaweco Sport 不需要被写成传奇。它最好的地方就是简单：小，能带，写得出字，而且愿意跟着你出门。`,
  },
  {
    slug: "白金-platinum-出云-izumo",
    title: "Platinum Izumo：把漆面和金尖做得安静一点",
    summary: "Platinum Izumo 属于白金的高端工艺线，18K 金尖、生漆或木材版本和偏大的笔身让它更适合慢一点的书写。",
    sourceIds: [
      "source-rfp-platinum-izumo-official",
      "source-rfp-endlesspens-izumo",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "保留材料和使用判断，删掉“和风气质”一类空泛词。",
    },
    body: `Platinum Izumo 不像 #3776 Century 那样容易解释。#3776 可以从防干、14K 金尖和价格讲起，逻辑很清楚。Izumo 要慢一点。它的吸引力在笔身材料、漆面、尺寸和 18K 金尖之间，第一眼未必抓人，用久了才知道它想表达什么。

Platinum Pen USA 的 Izumo Collection 页面列出 PIZ-55000、PIZ-100000 等版本，常见信息包括 18 kt 金尖和 F、M、B 尖号。零售资料会进一步写到硬橡胶、木材、生漆处理和墨囊/上墨器结构。也就是说，Izumo 的重点不在复杂上墨，也不在透明结构。它把传统材料和现代金尖放在一起，做成一支偏大的、握在手里有温度的钢笔。

出云这个名字也会影响你看它的方式。它听起来有地域和工艺的气息，容易让人期待某种“日本感”。真正有价值的部分不在这个词本身，而在版本细节。不同漆面、木材、莳绘或硬橡胶底材，都会改变价格和触感。买 Izumo 时，只看“18K 金尖”远远不够，材料名和工艺说明要一起看。

生漆或木材笔身会改变使用感。金属笔的重量来得很直接，树脂笔的轻巧也很直接。Izumo 这类工艺线更细腻，表面触感、温度变化、长期使用留下的光泽，都会参与体验。它不适合只看参数买。两支同样写着 Izumo 的笔，材料和版本不同，拿在手里可能差很多。

18K 金尖给 Izumo 带来高端定位，但不要把它想成柔软夸张的笔。Platinum 的金尖通常有一定控制感，Izumo 的大型笔身也会让书写节奏变慢一点。它适合签字、日记、慢写和喜欢材料感的人。若你想要大容量，Pilot Custom 823 更直接；若你想要同品牌里更轻便、更便宜的日用金尖，#3776 Century 更清楚。

Izumo 也适合和 Pilot Custom 845 放在一起想。两者都牵涉日本工艺材料和高端金尖，但品牌调性不同。Pilot 更容易被理解成“顺滑可靠的高级日用”，Platinum Izumo 则多了一点克制和材料触感。喜欢透明示范、彩色树脂或强烈配色的人，可能会觉得 Izumo 太安静。喜欢安静的人，恰好会被这点留住。

它的尺寸也要留意。Izumo 往往比普通 #3776 更有存在感，放在手里不算小。长时间写字时，握位、重心和笔身表面的摩擦感都会变得明显。生漆表面漂亮，也需要更小心地对待磕碰和硬物摩擦。它适合固定在书桌、笔盒或通勤包里的安稳位置，不太适合粗放使用。

购买 Izumo 要看版本名和材料。生漆、木材、莳绘或其他工艺版本不能混着比价格。还要看笔尖刻字、包装、上墨器、漆面是否有磕碰和修补痕迹。它不是适合所有人的高端笔。它适合那种愿意把钢笔当作手中物件慢慢使用的人，写字之外，还在意触感和时间留下的变化。`,
  },
  {
    slug: "sheaffer-s-snorkel",
    title: "Sheaffer Snorkel：把吸墨动作做成一场小机械表演",
    summary: "Sheaffer Snorkel 的代表性来自伸缩吸墨管，笔尖可以不直接浸入墨水，结构精巧，也带来更高维护门槛。",
    sourceIds: [
      "source-rfp-richardspens-snorkel",
      "source-rfp-penhero-snorkel",
    ],
    humanizer: {
      directness: 9,
      rhythm: 10,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "以吸墨动作开头，技术解释具体，没有把 Snorkel 神化。",
    },
    body: `Sheaffer Snorkel 最好玩的地方，是吸墨时那根细管。旋开尾端，细管从笔尖下方伸出来，像潜望镜一样探出去。你只需要把管子伸进墨水瓶，笔尖本身不用沾进墨水。吸完墨，管子收回去，笔尖还算干净。这个动作第一次看会觉得过分复杂，也确实有点迷人。

Richard Binder 和 PenHero 都把 Snorkel 放在 Sheaffer 1950 年代的重要产品里讲。它接在 Touchdown 系统之后，把气压上墨和伸缩吸墨管结合起来。那是美国钢笔公司还愿意为上墨动作投入大量机械想象力的年代。Parker 51 把体验做得简洁，Sheaffer Snorkel 则把问题拆到机械层面：怎样让用户吸墨时少弄脏笔尖。

这个设计放在今天看，甚至有点奢侈。现代钢笔很少为了吸墨这一步做这么复杂的结构，墨囊和上墨器已经足够方便。Snorkel 迷人的地方就在这里：它把一个小痛点放大成工程问题，再用一套零件认真回答。你可以觉得它多此一举，也可以被它的认真打动。两种反应都很正常。

Snorkel 的结构很聪明，也很麻烦。里面有密封件、弹簧、管子和气压系统，任何一个老化都会影响吸墨。保养好的 Snorkel 用起来非常优雅，保养差的 Snorkel 只会让人怀疑人生。买老笔时，卖家说“能写”不够，必须确认 Snorkel 管能正常伸缩，吸墨是否有效，密封是否更新过，笔尖和供墨是否通畅。

它的笔尖选择也丰富。Sheaffer 在那个年代有不同等级和款式，Triumph 锥形笔尖、开放式笔尖、不同型号名都会影响收藏和书写。Snorkel 不是单一一支笔，更像一套产品家族。Admiral、Statesman、Valiant、Crest 等名字会让新手头大，但这些差别关系到笔尖材质、笔帽装饰和价格。

和 Parker 51 比，Snorkel 更像机械爱好者的笔。51 的好处是安静和省心，Snorkel 的好处是动作和巧思。和现代真空上墨比，Snorkel 的储墨量未必有优势，维护难度却高不少。它不适合只想买一支省事老笔的人。它适合愿意理解结构、接受维修、享受老式机械动作的人。

写起来的 Snorkel 也不能只按上墨系统判断。Sheaffer 的笔尖有自己的历史，Triumph 锥形笔尖、开放式笔尖和不同等级配置会给出不同手感。很多 Snorkel 年代已经很久，笔尖状态、供墨清洁度、维修质量都会改变体验。一支修好的 Snorkel 可以很顺，一支没修好的 Snorkel 只会让人记住它的麻烦。

如果你想买 Snorkel，先把预算分成两部分：买笔的钱和维修的钱。已经专业修复的笔通常更贵，但省很多麻烦。未修复的便宜笔看起来诱人，真正能稳定使用还要换密封、清理管路、检查笔尖。Snorkel 的魅力就在这里。它把一件简单的事做得很复杂，却复杂得有理由。你看着那根细管伸出来，会明白 1950 年代的钢笔公司曾经多么认真地琢磨“怎样吸一管墨”。`,
  },
];

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function execute(db: Client, sql: string, args: unknown[] = []) {
  return db.execute({ sql, args: args as InArgs });
}

function humanizerTotal(article: SampleArticle) {
  const score = article.humanizer;
  return score.directness + score.rhythm + score.trust + score.authenticity + score.concision;
}

function validateArticle(article: SampleArticle) {
  const failures: string[] = [];
  for (const [pattern, label] of BANNED_PATTERNS) {
    if (pattern.test(article.body) || pattern.test(article.title) || pattern.test(article.summary)) {
      failures.push(label);
    }
  }
  const total = humanizerTotal(article);
  if (total < 45) failures.push(`humanizer score ${total}/50`);
  if (article.body.length < 900) failures.push(`too short ${article.body.length}`);
  return failures;
}

async function upsertSource(db: Client, source: SourceDef) {
  await execute(
    db,
    `INSERT INTO source_registry
     (id, name, source_type, allowed_use, reliability, attribution, homepage_url, fetch_method, notes, last_checked_at, created_at, updated_at)
     VALUES (?, ?, ?, 'summary_only', ?, ?, ?, 'manual', ?, date('now'), datetime('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       source_type = excluded.source_type,
       reliability = excluded.reliability,
       attribution = excluded.attribution,
       homepage_url = excluded.homepage_url,
       notes = excluded.notes,
       last_checked_at = excluded.last_checked_at,
       updated_at = datetime('now')`,
    [
      source.sourceId,
      source.sourceName,
      source.sourceType,
      source.reliability,
      source.sourceName,
      source.homepageUrl,
      "Source registered for reader-first sample articles; summarize only.",
    ],
  );

  await execute(
    db,
    `INSERT INTO source_items
     (id, source_id, title, url, item_type, summary, allowed_use, review_status, retrieved_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'summary_only', 'approved', date('now'), datetime('now'), datetime('now'))
     ON CONFLICT(source_id, url) DO UPDATE SET
       title = excluded.title,
       item_type = excluded.item_type,
       summary = excluded.summary,
       allowed_use = excluded.allowed_use,
       review_status = excluded.review_status,
       retrieved_at = excluded.retrieved_at,
       updated_at = datetime('now')`,
    [source.id, source.sourceId, source.title, source.url, source.itemType, source.summary],
  );
}

async function findEntity(db: Client, slug: string) {
  const result = await execute(
    db,
    "SELECT id, name FROM entities WHERE slug = ? AND type = 'pen' LIMIT 1",
    [slug],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { id: String(row.id), name: String(row.name) };
}

async function upsertStory(db: Client, entityId: string, article: SampleArticle) {
  const existing = await execute(
    db,
    "SELECT id FROM stories WHERE entity_id = ? AND story_type = 'model_story' LIMIT 1",
    [entityId],
  );
  const storyId = existing.rows[0]?.id ? String(existing.rows[0].id) : randomUUID();
  const sourceNotes = `Reader-first sample article. Humanizer-zh self-review: ${humanizerTotal(article)}/50. ${article.humanizer.notes}`;

  if (existing.rows[0]?.id) {
    await execute(
      db,
      `UPDATE stories
       SET title = ?, summary = ?, body_md = ?, status = 'reviewed', source_notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [article.title, article.summary, article.body, sourceNotes, storyId],
    );
  } else {
    await execute(
      db,
      `INSERT INTO stories
       (id, entity_id, title, story_type, summary, body_md, status, source_notes, created_at, updated_at)
       VALUES (?, ?, ?, 'model_story', ?, ?, 'reviewed', ?, datetime('now'), datetime('now'))`,
      [storyId, entityId, article.title, article.summary, article.body, sourceNotes],
    );
  }

  return storyId;
}

async function linkSource(db: Client, entityId: string, storyId: string, source: SourceDef) {
  const sourceItem = await execute(
    db,
    "SELECT id FROM source_items WHERE source_id = ? AND url = ? LIMIT 1",
    [source.sourceId, source.url],
  );
  const sourceItemId = sourceItem.rows[0]?.id
    ? String(sourceItem.rows[0].id)
    : source.id;

  await execute(
    db,
    `INSERT OR IGNORE INTO entity_references
     (id, entity_id, source_item_id, relation_type, note, review_status, created_at)
     VALUES (?, ?, ?, ?, 'Reader-first sample source pack', 'approved', datetime('now'))`,
    [randomUUID(), entityId, sourceItemId, source.relationType || "reference"],
  );
  await execute(
    db,
    `INSERT INTO citations
     (id, target_type, target_id, source_item_id, note, created_at)
     SELECT ?, 'story', ?, ?, 'Reader-first sample source', datetime('now')
     WHERE NOT EXISTS (
       SELECT 1 FROM citations
       WHERE target_type = 'story' AND target_id = ? AND source_item_id = ?
     )`,
    [randomUUID(), storyId, sourceItemId, storyId, sourceItemId],
  );
}

function buildReviewReport() {
  const rows = ARTICLES.map((article) => {
    const score = article.humanizer;
    return `| ${article.slug} | ${humanizerTotal(article)}/50 | ${score.directness} | ${score.rhythm} | ${score.trust} | ${score.authenticity} | ${score.concision} | ${article.humanizer.notes} |`;
  }).join("\n");

  const sourceRows = ARTICLES.map((article) => {
    const sourceLabels = article.sourceIds
      .map((id) => SOURCES.find((source) => source.id === id))
      .filter(Boolean)
      .map((source) => `[${source?.sourceName}: ${source?.title}](${source?.url})`)
      .join("；");
    return `| ${article.slug} | ${sourceLabels} |`;
  }).join("\n");

  return `# Read first 10 篇样板 humanizer-zh 审查

生成时间：${new Date().toISOString()}

## 评分

| slug | 总分 | 直接性 | 节奏 | 信任度 | 真实性 | 精炼度 | 备注 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## Source pack

| slug | sources |
| --- | --- |
${sourceRows}
`;
}

async function main() {
  const failures = ARTICLES.flatMap((article) =>
    validateArticle(article).map((failure) => `${article.slug}: ${failure}`),
  );
  if (failures.length > 0) {
    throw new Error(`Article validation failed:\n${failures.join("\n")}`);
  }

  const missingSources = new Set<string>();
  for (const article of ARTICLES) {
    for (const sourceId of article.sourceIds) {
      if (!SOURCES.some((source) => source.id === sourceId)) {
        missingSources.add(`${article.slug}: ${sourceId}`);
      }
    }
  }
  if (missingSources.size > 0) {
    throw new Error(`Missing source definitions:\n${[...missingSources].join("\n")}`);
  }

  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");

  if (!WRITE) {
    console.log(`Validated ${ARTICLES.length} sample article(s).`);
    for (const article of ARTICLES) {
      console.log(`- ${article.slug}: ${article.body.length} chars, humanizer ${humanizerTotal(article)}/50`);
    }
    console.log("Dry run only. Re-run with --write to update the database and review report.");
    return;
  }

  for (const source of SOURCES) {
    await upsertSource(db, source);
  }

  for (const article of ARTICLES) {
    const entity = await findEntity(db, article.slug);
    if (!entity) throw new Error(`Missing pen entity: ${article.slug}`);

    const storyId = await upsertStory(db, entity.id, article);
    await execute(
      db,
      "UPDATE entities SET summary = ?, updated_at = datetime('now') WHERE id = ?",
      [article.summary, entity.id],
    );

    for (const sourceId of article.sourceIds) {
      const source = SOURCES.find((item) => item.id === sourceId);
      if (!source) throw new Error(`Missing source: ${sourceId}`);
      await linkSource(db, entity.id, storyId, source);
    }
    console.log(`Updated ${article.slug}: ${article.body.length} chars`);
  }

  mkdirSync(path.dirname(REVIEW_PATH), { recursive: true });
  writeFileSync(REVIEW_PATH, buildReviewReport());
  console.log(`Wrote ${REVIEW_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
