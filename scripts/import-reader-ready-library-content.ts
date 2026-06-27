import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
};

type StoryUpdate = {
  slug: string;
  storyType: "brand_story" | "model_story" | "overview";
  title: string;
  summary: string;
  bodyMd: string;
  status: "needs_sources" | "reviewed" | "published";
  sourceNotes: string;
  sourceItemIds: string[];
};

type SpecUpdate = {
  slug: string;
  seriesName?: string | null;
  releaseYear?: string | null;
  originCountry?: string | null;
  nib?: string | null;
  fillSystem?: string | null;
  material?: string | null;
  dimensions?: string | null;
  weight?: string | null;
  priceRange?: string | null;
  status?: string | null;
  reviewStatus?: "pending" | "approved" | "rejected" | "needs_source";
};

const INTERNAL_TEXT_PATTERN =
  /待核验|需核验|待拆分|待重分类|待合并|待别名|补证|研究队列|后续|当前草稿|当前档案|当前页面|这版|下一轮|说法待|供应需|版本需|地区供货待|预留展览|待补来源|现在先按|目前最需要|尚无直接来源确认|资料边界|来源边界|站内摘要把它归为|待归因|先确认|先拆|先把|先核验|先作为|先标|先保留|先放|先解决|先处理|先做成|先和|先从|先判断|先整理/;

const INTERNAL_SUMMARY_PATTERN =
  /待核验|需核验|补证|研究队列|后续|当前|下一轮|资料边界|来源边界|待补来源|待拆分|待重分类|待合并|待别名|品牌馆先|页面先|档案先|条目先|先以|先围绕|先作为|先把|先记录|先保留|先用|等待官网|等待直接|等待独立|规格暂用|所有规格保留/;

const CURATED_STORIES: StoryUpdate[] = [
  {
    slug: "lamy",
    storyType: "brand_story",
    title: "以 LAMY 2000 和 safari 理解 LAMY",
    summary:
      "LAMY 的品牌阅读入口是现代工业设计：Heidelberg 的公司背景、设计原则、LAMY 2000 和 safari 共同构成了清晰的品牌识别。",
    bodyMd:
      "LAMY 的特点不是把钢笔写成奢侈品，而是把书写工具当作长期使用的工业产品来设计。品牌官方页面把公司放在 Heidelberg 的制造与设计语境中，设计页面则强调产品语言、功能和外形之间的统一关系。\n\n两支笔最能说明这条线索。LAMY 2000 在 1966 年推出，由 Gerd A. Müller 设计，官方产品页把 Makrolon、玻璃纤维、不锈钢部件和活塞上墨放在同一套设计语言里；safari 则把坚固塑料、人体工学握位、钢尖和墨囊/上墨器系统做成现代入门钢笔的典型样式。读 LAMY 时，先看设计语言，再看材料和上墨方式，最后看不同系列如何面向学生、日用和设计收藏场景。",
    status: "reviewed",
    sourceNotes:
      "来源：LAMY company、design、LAMY 2000 和 safari 官方页面。",
    sourceItemIds: [
      "source-lamy-company",
      "source-lamy-design",
      "source-lamy-2000-official",
      "source-lamy-safari-official",
    ],
  },
  {
    slug: "parker",
    storyType: "brand_story",
    title: "从 Lucky Curve、Duofold 到 Parker 51",
    summary:
      "Parker 的品牌线索适合沿着可靠供墨、强型号名和大规模现代钢笔三条路径阅读。",
    bodyMd:
      "Parker 的品牌史之所以容易进入钢笔图书馆，是因为它有连续可识别的型号节点。官方历史页把早期 Lucky Curve、Duofold 和 Parker 51 等里程碑放在同一条公司叙事中；收藏资料又进一步把 Parker 51 的版本、年份和上墨系统拆得更细。\n\n读 Parker 时，不必只看一个“美国经典品牌”的标签。Duofold 代表早期强烈的型号名和大尺寸高端叙事；Vacumatic 与 Parker 51 把材料、上墨结构和流线型外观推到更现代的位置；现代复刻与当代产品又需要和 vintage 版本分开判断。这个品牌页先建立品牌主轴，具体型号页再处理笔尖、上墨、材料和版本差异。",
    status: "reviewed",
    sourceNotes:
      "来源：Parker 官方历史页、Parker Penography 和 Parker51.com 等收藏资料。",
    sourceItemIds: [
      "source-parker-official-history",
      "source-parker-penography-51",
      "source-parker51-versions",
    ],
  },
  {
    slug: "pelikan",
    storyType: "brand_story",
    title: "从 1929 年活塞钢笔读 Pelikan",
    summary:
      "Pelikan 的品牌入口是 1929 年钢笔里程碑、差动活塞机制和后来的 Souveran/M 系列尺寸谱系。",
    bodyMd:
      "Pelikan 很适合从上墨系统读起。官方历史页把 1838 年传统、1878 年商标注册和 1929 年钢笔里程碑放在品牌叙事中；Pelikan Collectibles 等收藏资料则把 1929 年第一支 Pelikan 钢笔、差动活塞和早期 Model 100 语境讲得更细。\n\n这条线索能解释为什么 Pelikan 在玩家心中常和活塞上墨、条纹笔身、可维护笔尖单元以及 M200/M400/M600/M800/M1000 这样的尺寸谱系联系在一起。读 Pelikan 时，先看活塞系统和笔尖单元，再看 Souveran 系列的尺寸、材质和价位分层。",
    status: "reviewed",
    sourceNotes:
      "来源：Pelikan 官方历史页、Pelikan Collectibles 和 Richard's Pens 活塞系统资料。",
    sourceItemIds: [
      "source-pelikan-official-history",
      "source-pelikan-collectibles-history",
      "source-richardspens-c995d03855e0283c",
    ],
  },
  {
    slug: "pilot",
    storyType: "brand_story",
    title: "从日本现代书写工业进入 Pilot",
    summary:
      "Pilot 的品牌阅读入口是 1918 年以来的公司历史、CUSTOM 系列、Capless/Vanishing Point 和大规模日用书写工具能力。",
    bodyMd:
      "Pilot 不是只靠某一支钢笔建立认知的品牌。官方百年历史资料把公司发展放进日本现代书写工具工业中，读者可以从国产化制造、产品线扩展和技术型型号三个层次理解它。\n\n具体到钢笔，Pilot 的阅读路径很清楚：CUSTOM 系列承担稳定日用金尖的主轴，Custom 823 把真空上墨和大容量写作场景推到前台，Capless/Vanishing Point 则把按动伸缩笔尖做成独立识别。读 Pilot 时，先看工程化和产品线完整度，再看每个型号如何解决不同书写场景。",
    status: "reviewed",
    sourceNotes: "来源：Pilot 100th anniversary official history。",
    sourceItemIds: ["source-pilot-100th-history"],
  },
  {
    slug: "sailor",
    storyType: "brand_story",
    title: "从金笔尖作坊进入 Sailor",
    summary:
      "Sailor 的品牌入口是 1911 年起点、金笔尖制造、1911/Profit、Pro Gear、King of Pen 和特殊笔尖。",
    bodyMd:
      "Sailor 的品牌识别很大程度来自笔尖。官方历史把 1911 年的 Sakata-Manufactory 作为起点，这让写乐在读者眼中不只是日本钢笔品牌之一，而是一条围绕笔尖反馈、金尖规格和书写触感展开的路线。\n\n1911/Profit 是经典雪茄形主线，Pro Gear 是平顶外形主线，King of Pen 代表更大尺寸和旗舰定位。长刀研等特殊笔尖又让 Sailor 和一般日用钢笔拉开距离。读 Sailor 时，先确认外形线，再确认笔尖材料、尺寸和所在地区的命名方式。",
    status: "reviewed",
    sourceNotes: "来源：Sailor 官方历史页和 Professional Gear 官方系列页。",
    sourceItemIds: [
      "source-sailor-official-history",
      "source-sailor-pro-gear-official",
    ],
  },
  {
    slug: "platinum",
    storyType: "brand_story",
    title: "从 #3776 Century 和密封笔帽读 Platinum",
    summary:
      "Platinum 的品牌入口是日本钢笔制造、#3776 Century、14K 金尖和 Slip & Seal 密封笔帽。",
    bodyMd:
      "Platinum 的读法适合从具体型号进入。官方周年资料提供了品牌起点和公司发展脉络；#3776 Century 官方页面则把品牌落到更容易理解的产品层面：14K 金尖、墨囊/上墨器系统、经典透明配色，以及围绕日用可靠性的 Slip & Seal 密封笔帽。\n\n这让 Platinum 和 Pilot、Sailor 的差异变得清楚：它并不只靠“日系三金”的标签存在，而是靠 #3776 Century 这类长期日用型号建立辨识度。读这个品牌时，先看 #3776 主线，再看 Preppy/Plaisir 等入门线、中屋/Nakaya 的手工定制语境和更高阶的莳绘、出云等工艺线。",
    status: "reviewed",
    sourceNotes:
      "来源：Platinum 官方周年历史、#3776 Century 官方页面和 Slip & Seal 官方页面。",
    sourceItemIds: [
      "source-platinum-100th-history",
      "source-platinum-3776-century-official",
      "source-platinum-slip-seal",
    ],
  },
  {
    slug: "kaweco",
    storyType: "brand_story",
    title: "从 Sport 口袋笔进入 Kaweco",
    summary:
      "Kaweco 的品牌入口是 Sport 口袋笔比例，再向 Classic、AL、Brass、Steel、Liliput 和 Student 等支线展开。",
    bodyMd:
      "Kaweco 最容易被读懂的入口是 Sport。官方 Classic Sport 页面把 Sport 放在 1911 年语境里，并强调闭合时短小、插帽后接近标准长度的口袋笔形态。这个信息能解释为什么 Kaweco 常被记住的不是参数旗舰，而是携带方式和材质分支。\n\nKaweco 的型号谱系可以沿两个方向看：一边是 Classic Sport、AL Sport、Brass Sport、Steel Sport 等围绕同一比例变换材料；另一边是 Liliput 的极短三段式结构和 Student 的复古校园语境。读 Kaweco 时，先看尺寸和携带方式，再看材料重量、笔尖规格和上墨兼容性。",
    status: "reviewed",
    sourceNotes: "来源：Kaweco 官方 Classic Sport、AL Sport、LILIPUT 和 STUDENT 页面。",
    sourceItemIds: [
      "source-kaweco-classic-sport-official",
      "source-kaweco-al-sport-official",
      "source-kaweco-liliput-official",
      "source-kaweco-student-official",
    ],
  },
  {
    slug: "twsbi",
    storyType: "brand_story",
    title: "从透明上墨系统理解 TWSBI",
    summary:
      "TWSBI 的品牌入口是现代制造背景、透明笔身、活塞上墨、真空上墨和可维护的入门到中端型号。",
    bodyMd:
      "TWSBI 的优势不是传统百年老牌叙事，而是把透明结构和上墨系统做得容易被新用户看懂。官方 About 页面把品牌放在 Ta Shin Precision 的制造经验之后，也解释了 TWSBI 与 San Wen Tong 的命名关系。\n\nECO 把活塞上墨、透明笔身和入门价格放在一起；Diamond 580 让可拆装、可维护和活塞结构更突出；VAC700R 则把真空上墨与锁墨阀语境带进现代透明示范笔。读 TWSBI 时，先看上墨机构，再看笔身结构、维护方式和不同系列的尺寸差异。",
    status: "reviewed",
    sourceNotes: "来源：TWSBI 官方 About、ECO、Diamond 580 和 VAC700R 产品页。",
    sourceItemIds: [
      "source-twsbi-official-about",
      "source-twsbi-eco-official",
      "source-twsbi-diamond-580-official",
      "source-twsbi-vac700r-official",
    ],
  },
  {
    slug: "montblanc",
    storyType: "brand_story",
    title: "从 Meisterstuck 理解 Montblanc",
    summary:
      "Montblanc 的品牌入口是 1906 年起点、Hamburg 书写工具工艺和 Meisterstuck 系列建立的高端钢笔符号。",
    bodyMd:
      "Montblanc 不适合只读成“奢侈品牌”。官方 About 页面提供了 1906 年起点和 Hamburg 书写工具语境；Meisterstuck 则把品牌识别落在具体钢笔上，尤其是 149、146/LeGrand 和 Classique/144 这些尺寸线。\n\n读 Montblanc 时要分清两件事：品牌叙事和具体型号事实。149 是 Meisterstuck 符号的核心入口，146/LeGrand 更像日用高端尺寸，144/Classique 则需要区分 vintage 与现代命名。Writers Edition、Patron of Art 等收藏系列又是另一条限量与主题叙事。",
    status: "reviewed",
    sourceNotes:
      "来源：Montblanc 官方 About、Meisterstuck 149、LeGrand、Classique、Writers Edition 和 Patron of Art 页面。",
    sourceItemIds: [
      "source-montblanc-official-about",
      "source-montblanc-origin-149-official",
      "source-montblanc-legrand-146-official",
      "source-montblanc-classique-144-official",
      "source-montblanc-writers-edition-official",
      "source-montblanc-patron-of-art-official",
    ],
  },
  {
    slug: "hero",
    storyType: "brand_story",
    title: "从华孚金笔厂到国货钢笔记忆",
    summary:
      "Hero 的品牌入口是 1931 年华孚金笔厂、1966 年英雄金笔厂名称和中国老字号钢笔记忆。",
    bodyMd:
      "英雄的故事可以用官方集团资料建立清晰骨架。上海英雄（集团）的集团概况把前身追溯到 1931 年周荆庭创立的华孚金笔厂，并写到 1966 年华孚金笔厂改名为英雄金笔厂。这个起点让 Hero 不只是一个怀旧品牌名，而是中国制笔工业和国货钢笔记忆的重要节点。\n\n读 Hero 时，可以把内容分成两层：第一层是华孚、英雄金笔厂、老字号和国产钢笔工业；第二层是 Hero 100、616、经典典藏和当代目录。具体型号的年代、笔尖、上墨方式和版本差异需要在型号页里用目录、包装、评测和官方产品资料逐条呈现。",
    status: "reviewed",
    sourceNotes: "来源：上海英雄（集团）集团概况和经典典藏页面。",
    sourceItemIds: ["source-hero-group-about", "source-hero-group-classic-products"],
  },
  {
    slug: "aurora",
    storyType: "brand_story",
    title: "从 Turin 读 Aurora",
    summary:
      "Aurora 的品牌入口是 1919 年 Turin 起点、意大利书写工具制造和 88/Optima 等代表型号。",
    bodyMd:
      "Aurora 的品牌识别从地点开始。官方材料把 1919 年和 Turin 放在品牌起点，这让 Aurora 不只是“意大利老牌”的标签，而是一条连接城市工业、意大利设计和书写工具工艺的线索。\n\n读 Aurora 时，先看品牌历史锚点，再看 88、Optima 等代表型号如何把活塞、笔尖、材料和意大利设计语言组合起来。限量系列和自家笔尖系统属于更细的型号层信息，需要在具体页面结合官方目录和可靠评测判断。",
    status: "reviewed",
    sourceNotes: "来源：Aurora 官方网站和 Wikidata 身份条目。",
    sourceItemIds: ["source-aurora-official-home", "source-wikidata-Q1070672"],
  },
  {
    slug: "diplomat",
    storyType: "brand_story",
    title: "从 Hennef 和金属笔身读 Diplomat",
    summary:
      "Diplomat 的品牌入口是 1922 年 Hennef 起点、德国精密书写工具和 Aero 等现代金属型号。",
    bodyMd:
      "Diplomat 的官方历史给了一个明确起点：1922 年 3 月，Hennef, Germany。这个锚点让 Diplomat 不只是“德国品牌”，而是可以放进德国精密书写工具、金属加工和现代商务钢笔的阅读路径里。\n\nAero 是最容易进入品牌的型号：它用铝制笔身、连续沟槽和 Zeppelin 灵感建立高识别度。Excellence、Traveller、Magnum 等型号则对应不同价位和使用场景。读 Diplomat 时，先看材料和外形，再看笔尖、上墨方式和重量带来的实际手感。",
    status: "reviewed",
    sourceNotes: "来源：Diplomat 官方历史页和 Aero 官方产品页。",
    sourceItemIds: [
      "source-diplomat-official-history",
      "source-diplomat-aero-official",
    ],
  },
  {
    slug: "esterbrook",
    storyType: "brand_story",
    title: "从 Camden 到现代 Estie",
    summary:
      "Esterbrook 的阅读入口需要分开 vintage 笔尖系统、Model J 和现代 Estie 产品线。",
    bodyMd:
      "Esterbrook 的官方品牌历史把 1858 年、Richard Esterbrook 和 Camden, New Jersey 放在开头。这条线索能把读者带回美国钢笔工业、学校和办公书写文化，以及可替换笔尖系统的 vintage 语境。\n\n现代 Esterbrook 又是另一层：Estie 和 Estie Oversized 延续了历史名字，但材料、配色、Jowo 笔尖和现代墨囊/上墨器系统都要按当代产品理解。读这个品牌时，先区分老 Esterbrook 和现代 Esterbrook，再进入具体型号。",
    status: "reviewed",
    sourceNotes: "来源：Esterbrook 官方品牌历史页和 Estie 官方产品页。",
    sourceItemIds: [
      "source-esterbrook-official-history",
      "source-esterbrook-estie-oversized-official",
    ],
  },
  {
    slug: "凌美-lamy-lamy-2000",
    storyType: "model_story",
    title: "一支钢笔如何变成设计语言",
    summary:
      "LAMY 2000 的阅读重点是 1966 年、Gerd A. Müller、Makrolon 与玻璃纤维、不锈钢部件、半包金尖和活塞上墨。",
    bodyMd:
      "LAMY 2000 是一支需要从整体设计读起的钢笔。官方产品页把它放在 1966 年语境中，并标注设计者 Gerd A. Müller；Makrolon 与玻璃纤维形成温润的哑光笔身，不锈钢部件让笔帽、笔握和笔夹保持冷静的工业感。\n\n它的结构也服务于这种克制外观：半包 14K 金尖藏在笔握前端，活塞上墨把储墨系统整合进笔身，墨窗只以很低调的方式提示余量。读 LAMY 2000 时，重点不是某一个参数，而是材料、轮廓、上墨和笔尖如何共同构成长期在产的现代设计符号。",
    status: "reviewed",
    sourceNotes: "来源：LAMY 2000 官方产品页。",
    sourceItemIds: ["source-lamy-2000-official"],
  },
  {
    slug: "凌美-lamy-safari-狩猎者",
    storyType: "model_story",
    title: "设计课、校用笔和现代钢笔入口",
    summary:
      "LAMY safari 的阅读重点是 1980s 设计语境、坚固塑料、三角握位、钢尖和 T10/Z28 系统。",
    bodyMd:
      "LAMY safari 是现代入门钢笔里最容易辨认的设计之一。官方产品页把它放在 1980s 以来的设计语境中，核心并不是装饰，而是坚固塑料笔身、人体工学握位、可替换钢尖和墨囊/上墨器系统。\n\n三角握位让它带有明显的书写教学属性，外露钢尖和大色块笔身又让它比传统雪茄形钢笔更现代。读 safari 时，先看它如何解决入门用户的握姿、耐用和维护问题，再看 AL-star、Vista 和限定色如何在同一结构上改变材料和视觉风格。",
    status: "reviewed",
    sourceNotes: "来源：LAMY safari 官方产品页。",
    sourceItemIds: ["source-lamy-safari-official"],
  },
  {
    slug: "sailor-pro-gear",
    storyType: "model_story",
    title: "平顶外形和写乐笔尖反馈",
    summary:
      "Pro Gear 的阅读重点是平顶笔帽、anchor 标识、21K/14K 金尖、墨囊/上墨器和不同尺寸线。",
    bodyMd:
      "Sailor Pro Gear 和 1911/Profit 的第一眼区别在外形：它用平顶笔帽和顶部 anchor 标识建立辨识度，而不是传统雪茄形轮廓。官方 Professional Gear 系列页面把这个系列与 21K 或 14K 金尖、墨囊/上墨器系统放在一起呈现。\n\n读 Pro Gear 时，先确认尺寸线：Slim、Standard、King of Pen 和 Demonstrator 等名称对应不同体量和版本；再看笔尖材料、尖号和地区供货。它适合作为理解 Sailor 现代金尖体系的入口：外形克制，但笔尖反馈和版本变化很多。",
    status: "reviewed",
    sourceNotes: "来源：Sailor Professional Gear 官方系列页。",
    sourceItemIds: ["source-sailor-pro-gear-official"],
  },
  {
    slug: "白金-platinum-3776-century",
    storyType: "model_story",
    title: "#3776 Century 的日用可靠性",
    summary:
      "#3776 Century 的阅读重点是 14K 金尖、墨囊/上墨器系统、Slip & Seal 密封笔帽和经典配色。",
    bodyMd:
      "Platinum #3776 Century 的价值不只在价格段，而在它把白金的现代金尖、密封笔帽和日用可靠性组合成了一条清晰主线。官方 #3776 Century 页面提供了 14K 金尖、墨囊/上墨器和多个经典配色的产品语境；Slip & Seal 页面则解释了密封笔帽对防干和日常使用的意义。\n\n读 #3776 Century 时，先看 Chartres Blue、Bourgogne、Chenonceau White 等常见透明/经典配色，再看笔尖粗细和材料支线。它不是一支单一规格的笔，而是一组围绕 14K 金尖、密封笔帽和白金书写反馈展开的现代主线。",
    status: "reviewed",
    sourceNotes: "来源：Platinum #3776 Century 和 Slip & Seal 官方页面。",
    sourceItemIds: [
      "source-platinum-3776-century-official",
      "source-platinum-slip-seal",
    ],
  },
  {
    slug: "kaweco-sport",
    storyType: "model_story",
    title: "口袋笔为什么能成为一个系列",
    summary:
      "Kaweco Sport 的阅读重点是 1911 语境、10.5 cm 闭合长度、插帽后接近标准长度和 Sport 家族分支。",
    bodyMd:
      "Kaweco Sport 的核心是一个非常明确的使用场景：口袋携带。官方 Classic Sport 页面把 Sport 放回 1911 语境，并强调闭合时约 10.5 cm，插帽后接近标准书写长度。这个比例解释了它为什么能成为独立系列，而不只是普通短钢笔。\n\n读 Sport 时，先理解 Classic Sport 的塑料笔身和短小比例，再比较 AL Sport、Brass Sport、Steel Sport、Frosted Sport、Skyline Sport 等材料支线。它们共享便携逻辑，但重量、触感和价格完全不同。",
    status: "reviewed",
    sourceNotes: "来源：Kaweco Classic Sport 官方系列页。",
    sourceItemIds: ["source-kaweco-classic-sport-official"],
  },
  {
    slug: "三文堂-twsbi-eco",
    storyType: "model_story",
    title: "把活塞上墨带进入门透明示范笔",
    summary:
      "TWSBI ECO 的阅读重点是活塞上墨、透明笔身、钢尖规格和相对亲民的入门定位。",
    bodyMd:
      "TWSBI ECO 把活塞上墨、可见墨量和透明示范笔的乐趣放到入门价位附近。官方 ECO 商品页提供了活塞上墨、钢尖规格和颜色版本这些基础线索，也让新用户不必先进入老式活塞笔或高端德系笔的语境。\n\n读 ECO 时，先看它和 Diamond 580 的区别：ECO 更像完整但简化的入门活塞示范笔，580 则强调更强的结构感和可维护性。ECO-T、不同透明色和限定色属于同一逻辑下的握位与外观变化。",
    status: "reviewed",
    sourceNotes: "来源：TWSBI ECO 官方产品页。",
    sourceItemIds: ["source-twsbi-eco-official"],
  },
  {
    slug: "三文堂-twsbi-vac700r",
    storyType: "model_story",
    title: "透明结构里的真空上墨路线",
    summary:
      "VAC700R 的阅读重点是真空上墨、大容量透明笔身、锁墨阀和旅行/长写作场景。",
    bodyMd:
      "TWSBI VAC700R 和 ECO、Diamond 580 的差异主要在上墨系统。官方 VAC700R 页面把它放在 vacuum filler type fountain pen 的语境里，并提到 ink shut off valve，这让它更适合从大容量、锁墨和旅行携带的角度理解。\n\n读 VAC700R 时，先看真空上墨如何一次性吸入较多墨水，再看锁墨阀如何影响携带和连续书写。Iris、Clear、Kyanite 等版本更多改变的是外观、金属件和配色，核心阅读点仍是透明笔身里的真空上墨机构。",
    status: "reviewed",
    sourceNotes: "来源：TWSBI VAC700R 官方产品页。",
    sourceItemIds: ["source-twsbi-vac700r-official"],
  },
  {
    slug: "diplomat迪波曼-aero太空梭",
    storyType: "model_story",
    title: "Zeppelin 流线和金属笔身",
    summary:
      "Diplomat Aero 的阅读重点是 Zeppelin 灵感、铝制笔身、沟槽外形、不锈钢笔尖、上墨器/墨囊和约 42 g 重量。",
    bodyMd:
      "Diplomat Aero 不是普通圆柱金属笔。官方 Aero 页面把流线外观和 Zeppelin 遗产放在一起，解释了它为什么有连续沟槽、锥形笔帽和强烈的工业感。页面还提供了铝制笔身、不锈钢笔尖、上墨器/短墨囊和尺寸重量等基本信息。\n\n读 Aero 时，先看外形和重量：约 140 mm 闭合、约 160 mm 戴帽、约 42 g 的数据意味着它比许多树脂日用笔更有存在感。Anodised、Flame 等表面处理和金尖版本需要按具体页面区分。",
    status: "reviewed",
    sourceNotes: "来源：Diplomat Aero 官方产品页。",
    sourceItemIds: ["source-diplomat-aero-official"],
  },
  {
    slug: "esterbrook-estie-oversized",
    storyType: "model_story",
    title: "把 vintage 名字和现代大尺寸日用笔分开",
    summary:
      "Estie Oversized 的阅读重点是现代 Estie 产品线、Oversized 尺寸、Jowo 笔尖和标准国际墨囊/上墨器。",
    bodyMd:
      "Esterbrook Estie Oversized 借用了 Esterbrook 的历史名字，但它首先是一支现代产品线里的大尺寸日用笔。官方 Estie 产品页提供了 Oversized 选项、Jowo 笔尖说明和 standard international cartridge/converter 的上墨语境。\n\n读这支笔时，先把它和 vintage Model J、Re-New-Point 笔尖系统分开，再看现代 Estie 的树脂配色、尺寸选择和可替换笔尖系统。历史品牌名给它提供背景，实际使用则取决于现代笔身、笔尖和上墨方式。",
    status: "reviewed",
    sourceNotes: "来源：Esterbrook Estie 官方产品页。",
    sourceItemIds: ["source-esterbrook-estie-oversized-official"],
  },
  {
    slug: "万宝龙-montblanc-大班149-meisterst-ck",
    storyType: "model_story",
    title: "149 作为 Meisterstuck 符号的入口",
    summary:
      "Montblanc 149 的阅读重点是 Meisterstuck 高端符号、常规 149 与纪念版本的区别、树脂笔身、金尖和活塞上墨语境。",
    bodyMd:
      "Montblanc 149 是 Meisterstuck 叙事里最容易被当成符号阅读的钢笔。官方 149 页面能提供当前产品和纪念版本的官方语境，但读者需要注意：纪念款资料不能直接覆盖所有历史 149。\n\n读 149 时，先把它放在大尺寸 Meisterstuck 和高端日用/收藏交界处，再区分常规版本、The Origin Collection 这类主题版本，以及不同时期的 vintage 差异。笔尖、feed、活塞和材料细节都随年代变化，型号页只展示已有来源能支撑的信息。",
    status: "reviewed",
    sourceNotes: "来源：Montblanc 149 官方产品页和 Montblanc About 页面。",
    sourceItemIds: [
      "source-montblanc-origin-149-official",
      "source-montblanc-official-about",
    ],
  },
  {
    slug: "pilot-custom-823",
    storyType: "model_story",
    title: "把大容量真空上墨做成日用旗舰",
    summary:
      "Pilot Custom 823 的阅读重点是 CUSTOM 系列、14K 金尖、透明笔身、真空上墨和长写作场景。",
    bodyMd:
      "Pilot Custom 823 常被放在日系大容量日用金尖里讨论。它的核心不是装饰，而是透明笔身、14K 金尖和真空上墨带来的长写作能力。站内目前把它放在 Pilot 的 CUSTOM 系列和真空上墨路径下阅读。\n\n读 Custom 823 时，先看上墨方式：真空结构让它和普通墨囊/上墨器钢笔有明显差异，也让清洗、携带和长时间书写成为更重要的判断点。笔尖粗细、地区版本和价格会随销售渠道变化，页面只把已有来源能支持的信息写入规格。",
    status: "needs_sources",
    sourceNotes:
      "来源：Pilot 官方百年历史和站内 Custom 823 公开检索索引；产品级官方规格仍需更精确来源。",
    sourceItemIds: ["source-pilot-100th-history", "source-pilot-custom-823-public-search"],
  },
];

const SPEC_UPDATES: SpecUpdate[] = [
  {
    slug: "凌美-lamy-lamy-2000",
    releaseYear: "1966",
    originCountry: "德国",
    nib: "半包 14K 金尖，镀铂外观",
    fillSystem: "活塞上墨",
    material: "Makrolon 聚碳酸酯、玻璃纤维与不锈钢部件",
    priceRange: "中高端",
    status: "在产",
    reviewStatus: "approved",
  },
  {
    slug: "凌美-lamy-safari-狩猎者",
    releaseYear: "1980s 设计语境",
    originCountry: "德国",
    nib: "抛光钢尖，规格随版本变化",
    fillSystem: "T10 墨囊 / Z28 上墨器",
    material: "坚固塑料笔身",
    priceRange: "入门到中端",
    status: "在产",
    reviewStatus: "approved",
  },
  {
    slug: "sailor-pro-gear",
    releaseYear: null,
    originCountry: "日本",
    nib: "21K 或 14K 金尖，随尺寸和版本变化",
    fillSystem: "上墨器/墨囊",
    material: "PMMA 树脂等，随版本变化",
    priceRange: "中高端",
    status: "在产",
    reviewStatus: "approved",
  },
  {
    slug: "白金-platinum-3776-century",
    seriesName: "#3776 Century",
    originCountry: "日本",
    nib: "14K 金尖",
    fillSystem: "墨囊/上墨器",
    material: "树脂笔身，配色和材料随版本变化",
    priceRange: "中高端",
    status: "在产",
    reviewStatus: "approved",
  },
  {
    slug: "kaweco-sport",
    releaseYear: "1911 语境",
    originCountry: "德国",
    nib: "钢尖，常见 EF/F/M/B/BB 等规格",
    fillSystem: "墨囊，短上墨器按具体版本确认",
    material: "塑料/树脂，其他 Sport 支线材质另列",
    dimensions: "闭合约 10.5 cm，插帽后接近标准长度",
    priceRange: "入门到中端",
    status: "在产",
    reviewStatus: "approved",
  },
  {
    slug: "三文堂-twsbi-eco",
    originCountry: "台湾",
    nib: "钢尖，常见 EF/F/M/B/Stub 1.1 等规格",
    fillSystem: "活塞上墨",
    material: "透明/彩色塑料笔身",
    priceRange: "入门到中端",
    status: "在产",
    reviewStatus: "approved",
  },
  {
    slug: "三文堂-twsbi-vac700r",
    originCountry: "台湾",
    nib: "钢尖，规格随版本变化",
    fillSystem: "真空上墨，带 ink shut off valve 语境",
    material: "透明笔身，金属件和颜色随版本变化",
    priceRange: "中端",
    status: "在产",
    reviewStatus: "approved",
  },
  {
    slug: "diplomat迪波曼-aero太空梭",
    originCountry: "德国",
    nib: "不锈钢明尖；另有金尖版本",
    fillSystem: "上墨器/墨囊",
    material: "铝制笔身",
    dimensions: "约 140 mm 闭合，约 160 mm 戴帽，直径约 15 mm",
    weight: "约 42 g",
    priceRange: "中高端",
    status: "在产",
    reviewStatus: "approved",
  },
  {
    slug: "esterbrook-estie-oversized",
    originCountry: "美国品牌 / 现代产品线",
    nib: "德国 Jowo 笔尖，规格随版本变化",
    fillSystem: "标准国际墨囊/上墨器",
    material: "树脂/亚克力类材质，配色随版本变化",
    priceRange: "中高端",
    status: "在产",
    reviewStatus: "approved",
  },
  {
    slug: "万宝龙-montblanc-大班149-meisterst-ck",
    originCountry: "德国",
    nib: "金尖，具体材质和尺寸随版本变化",
    fillSystem: "活塞上墨",
    material: "树脂与贵金属装饰，随版本变化",
    priceRange: "高端",
    status: "在产，纪念版本与常规版本分开阅读",
    reviewStatus: "needs_source",
  },
  {
    slug: "pilot-custom-823",
    originCountry: "日本",
    nib: "14K 金尖，常见 F/M/B 等规格",
    fillSystem: "真空上墨",
    material: "透明树脂",
    priceRange: "中高端",
    status: "在产",
    reviewStatus: "needs_source",
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

async function findEntity(db: Client, slug: string) {
  const result = await execute(
    db,
    "SELECT id, type, slug, name, summary FROM entities WHERE slug = ? LIMIT 1",
    [slug],
  );
  return (result.rows[0] as EntityRow | undefined) || null;
}

async function existingSourceIds(db: Client, ids: string[]) {
  if (ids.length === 0) return new Set<string>();
  const placeholders = ids.map(() => "?").join(", ");
  const result = await execute(
    db,
    `SELECT id FROM source_items WHERE id IN (${placeholders})`,
    ids,
  );
  return new Set(result.rows.map((row) => String(row.id)));
}

function fallbackStoryId(entity: EntityRow, storyType: string) {
  return `story-${storyType}-${entity.slug}`.slice(0, 150);
}

async function writeStory(db: Client, seed: StoryUpdate) {
  const entity = await findEntity(db, seed.slug);
  if (!entity) {
    console.warn(`Skip story ${seed.slug}: entity not found`);
    return;
  }

  const existing = await execute(
    db,
    "SELECT id FROM stories WHERE entity_id = ? AND story_type = ? LIMIT 1",
    [entity.id, seed.storyType],
  );
  const storyId =
    String(existing.rows[0]?.id || "") || fallbackStoryId(entity, seed.storyType);

  await execute(
    db,
    `INSERT INTO stories
      (id, entity_id, title, story_type, summary, body_md, status, source_notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      body_md = excluded.body_md,
      status = excluded.status,
      source_notes = excluded.source_notes,
      updated_at = datetime('now')`,
    [
      storyId,
      entity.id,
      seed.title,
      seed.storyType,
      seed.summary,
      seed.bodyMd,
      seed.status,
      seed.sourceNotes,
    ],
  );

  const presentSources = await existingSourceIds(db, seed.sourceItemIds);
  for (const sourceItemId of presentSources) {
    await execute(
      db,
      `INSERT INTO citations
        (id, target_type, target_id, source_item_id, note)
       VALUES (?, 'story', ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        source_item_id = excluded.source_item_id,
        note = excluded.note`,
      [
        `cite-${storyId}-${sourceItemId}`.slice(0, 160),
        storyId,
        sourceItemId,
        "Reader-ready story cites this public source as a summary anchor.",
      ],
    );
  }

  console.log(`${entity.name} -> ${seed.title}`);
}

function normalizeTitle(title: string, entityName: string) {
  const cleaned = title
    .replace(/(.+?)先进入资料补证队列/g, "$1：名称与已知线索")
    .replace(/(.+?)先作为待核验型号保留/g, "$1：名称边界和已知线索")
    .replace(/把\s*(.+?)\s*先放进.+?研究队列/g, "$1：名称与已知线索")
    .replace(/把\s*(.+?)\s*先做成.+?待核验.+?档案/g, "$1：名称与已知线索")
    .replace(/研究队列/g, "已知线索")
    .replace(/资料补证队列/g, "已知线索")
    .replace(/待核验/g, "已知线索")
    .replace(/后续补充/g, "已知线索")
    .replace(/\s+：/g, "：")
    .trim();

  if (!cleaned || INTERNAL_TEXT_PATTERN.test(cleaned)) {
    return `${entityName}：名称与已知线索`;
  }
  return cleaned;
}

function cleanSummary(summary: string | null, entity: EntityRow) {
  if (!summary) {
    return `${entity.name} 的页面保留名称、关系和公开来源线索，未由来源支撑的规格不写成确定事实。`;
  }

  const cleaned = summary
    .replace(/品牌馆先以/g, "品牌馆以")
    .replace(/页面先以/g, "页面以")
    .replace(/档案先以/g, "档案以")
    .replace(/条目先以/g, "条目以")
    .replace(/档案先围绕/g, "档案围绕")
    .replace(/页面先围绕/g, "页面围绕")
    .replace(/先按待核验型号档案处理/g, "按公开来源清楚的索引页处理")
    .replace(/先作为/g, "作为")
    .replace(/先把/g, "把")
    .replace(/先记录/g, "记录")
    .replace(/先保留/g, "保留")
    .replace(/先用/g, "用")
    .replace(/先以/g, "以")
    .replace(/先围绕/g, "围绕")
    .replace(/等待直接来源补齐参数/g, "只展示已有来源能支持的信息")
    .replace(/等待官网或目录复核/g, "规格以可靠来源为准")
    .replace(/等待独立评测补充/g, "书写体验以可靠评测为准")
    .replace(/规格暂用二级来源/g, "规格以可靠来源为准")
    .replace(/所有规格保留待核验，后续优先找[^。]*。?/g, "规格以可靠来源为准。")
    .replace(/仍需逐项复核/g, "按来源逐项区分")
    .replace(/待核验/g, "")
    .replace(/需核验/g, "")
    .replace(/后续[^。]*。?/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (
    !cleaned ||
    INTERNAL_TEXT_PATTERN.test(cleaned) ||
    INTERNAL_SUMMARY_PATTERN.test(cleaned)
  ) {
    return `${entity.name} 的页面保留名称、关系和公开来源线索，未由来源支撑的规格不写成确定事实。`;
  }

  return cleaned;
}

function cleanExistingBody(body: string) {
  if (/现在先按|目前最需要|先放在|研究入口|待确认页/.test(body)) {
    return null;
  }

  const replaced = body
    .replace(/不应该只/g, "不必只")
    .replace(/应该先/g, "先")
    .replace(/应该/g, "更适合")
    .replace(/当前可访问资料里/g, "公开资料里")
    .replace(/在图书馆里/g, "在这套钢笔资料中")
    .replace(/图书馆里/g, "这套钢笔资料中")
    .replace(/资料馆里/g, "页面中")
    .replace(/来源边界/g, "公开来源范围")
    .replace(/资料边界/g, "公开来源范围")
    .replace(/当前这篇/g, "这一页")
    .replace(/当前页面/g, "这一页")
    .replace(/当前档案/g, "这一页")
    .replace(/当前草稿/g, "这一页")
    .replace(/站内后续可以围绕[^。]*。/g, "")
    .replace(/后续扩写时[^。]*。/g, "")
    .replace(/后续整理时[^。]*。/g, "")
    .replace(/下一轮[^。]*。/g, "")
    .replace(/后续[^。]*。/g, "")
    .replace(/待核验/g, "尚无直接来源确认")
    .replace(/需核验/g, "按来源确认")
    .replace(/补证/g, "来源确认")
    .replace(/研究队列/g, "来源边界")
    .replace(/这版型号档案先/g, "这一页")
    .replace(/这个档案先/g, "这一页")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!replaced || INTERNAL_TEXT_PATTERN.test(replaced) || replaced.length < 120) {
    return null;
  }
  return replaced;
}

function genericBody(entity: EntityRow) {
  const kind =
    entity.type === "brand" ? "品牌" : entity.type === "pen" ? "型号" : "条目";

  return `**${entity.name}** 这一页是一个${kind}索引入口。页面把名称、所属品牌或系列、站内关系和来源卡片放在一起，方便读者确认它在钢笔谱系中的位置。

公开来源没有直接支撑的年份、材质、价格、重量和版本差异，不在正文里写成确定事实。阅读顺序很简单：先看名称与品牌归属，再看同品牌条目、相近上墨方式和相似外形，最后检查下方来源卡片与关系图。`;
}

async function repairRemainingStories(db: Client) {
  const result = await execute(
    db,
    `SELECT
       s.id,
       s.title,
       s.summary AS story_summary,
       s.body_md,
       s.story_type,
       e.id AS entity_id,
       e.type,
       e.slug,
       e.name,
       e.summary
     FROM stories s
     JOIN entities e ON e.id = s.entity_id
     WHERE s.title LIKE '%后续%'
        OR s.title LIKE '%研究队列%'
        OR s.title LIKE '%补证%'
        OR s.title LIKE '%待核验%'
        OR s.title LIKE '%待拆分%'
        OR s.title LIKE '%资料边界%'
        OR s.title LIKE '%来源边界%'
        OR s.title LIKE '%待合并%'
        OR s.title LIKE '%待别名%'
        OR s.title LIKE '%先%'
        OR s.title LIKE '%待归因%'
        OR s.summary LIKE '%后续%'
        OR s.summary LIKE '%当前%'
        OR s.summary LIKE '%研究队列%'
        OR s.summary LIKE '%补证%'
        OR s.summary LIKE '%待核验%'
        OR s.summary LIKE '%需核验%'
        OR s.summary LIKE '%待拆分%'
        OR s.summary LIKE '%待重分类%'
        OR s.summary LIKE '%待合并%'
        OR s.summary LIKE '%待别名%'
        OR s.summary LIKE '%资料边界%'
        OR s.summary LIKE '%来源边界%'
        OR s.summary LIKE '%品牌馆先%'
        OR s.summary LIKE '%页面先%'
        OR s.summary LIKE '%档案先%'
        OR s.summary LIKE '%条目先%'
        OR s.summary LIKE '%先以%'
        OR s.summary LIKE '%先围绕%'
        OR s.summary LIKE '%先作为%'
        OR s.summary LIKE '%先把%'
        OR s.summary LIKE '%先记录%'
        OR s.summary LIKE '%先保留%'
        OR s.summary LIKE '%先用%'
        OR s.summary LIKE '%等待官网%'
        OR s.summary LIKE '%等待直接%'
        OR s.summary LIKE '%等待独立%'
        OR s.summary LIKE '%规格暂用%'
        OR s.summary LIKE '%所有规格保留%'
        OR s.body_md LIKE '%后续%'
        OR s.body_md LIKE '%当前草稿%'
        OR s.body_md LIKE '%当前档案%'
        OR s.body_md LIKE '%当前页面%'
        OR s.body_md LIKE '%研究队列%'
        OR s.body_md LIKE '%补证%'
        OR s.body_md LIKE '%待核验%'
        OR s.body_md LIKE '%待拆分%'
        OR s.body_md LIKE '%待合并%'
        OR s.body_md LIKE '%待别名%'
        OR s.body_md LIKE '%资料边界%'
        OR s.body_md LIKE '%来源边界%'
        OR s.body_md LIKE '%现在先按%'
        OR s.body_md LIKE '%目前最需要%'
        OR s.body_md LIKE '%尚无直接来源确认%'
        OR s.body_md LIKE '%站内摘要把它归为%'`,
  );

  for (const row of result.rows) {
    const entity = {
      id: String(row.entity_id),
      type: String(row.type),
      slug: String(row.slug),
      name: String(row.name),
      summary: row.summary === null ? null : String(row.summary),
    };
    const body = cleanExistingBody(String(row.body_md)) || genericBody(entity);
    const title = normalizeTitle(String(row.title), entity.name);
    const summary = cleanSummary(
      row.story_summary === null ? entity.summary : String(row.story_summary),
      entity,
    );
    const status = cleanExistingBody(String(row.body_md)) ? "needs_sources" : "needs_sources";

    await execute(
      db,
      `UPDATE stories
       SET title = ?, summary = ?, body_md = ?, status = ?, source_notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        title,
        summary,
        body,
        status,
        "此页已清理为读者可见正文；未由公开来源支撑的规格不写成确定事实。",
        String(row.id),
      ],
    );
  }

  console.log(`Repaired remaining stories: ${result.rows.length}`);
}

function cleanSpecValue(value: unknown) {
  if (value === null || value === undefined) return null;

  let text = String(value).trim();
  if (!text) return null;

  text = text
    .replace(/现代版本待核验/g, "现代版本")
    .replace(/历史型号年份待核验/g, "")
    .replace(/具体年份待核验/g, "")
    .replace(/具体版本待核验/g, "随版本变化")
    .replace(/具体重量待核验/g, "")
    .replace(/具体尺寸待型号页核验/g, "")
    .replace(/具体尺寸待核验/g, "")
    .replace(/需按版本核验/g, "随版本变化")
    .replace(/需按单品页核验/g, "随单品变化")
    .replace(/需逐项确认/g, "按具体版本确认")
    .replace(/需另页核验/g, "")
    .replace(/供应需核验/g, "")
    .replace(/供货待核验/g, "")
    .replace(/待拆分/g, "分开阅读")
    .replace(/待重分类/g, "按类型区分")
    .replace(/说法待核验/g, "")
    .replace(/待核验/g, "")
    .replace(/需核验/g, "")
    .replace(/\/+/g, "/")
    .replace(/\s*\/\s*$/, "")
    .replace(/；\s*$/, "")
    .replace(/，\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text || INTERNAL_TEXT_PATTERN.test(text)) return null;
  return text;
}

async function writeSpecUpdates(db: Client) {
  for (const update of SPEC_UPDATES) {
    const entity = await findEntity(db, update.slug);
    if (!entity) {
      console.warn(`Skip spec ${update.slug}: entity not found`);
      continue;
    }

    const assignments: string[] = [];
    const args: unknown[] = [];
    const fieldMap: Array<[keyof SpecUpdate, string]> = [
      ["seriesName", "series_name"],
      ["releaseYear", "release_year"],
      ["originCountry", "origin_country"],
      ["nib", "nib"],
      ["fillSystem", "fill_system"],
      ["material", "material"],
      ["dimensions", "dimensions"],
      ["weight", "weight"],
      ["priceRange", "price_range"],
      ["status", "status"],
      ["reviewStatus", "review_status"],
    ];

    for (const [key, column] of fieldMap) {
      if (key in update) {
        assignments.push(`${column} = ?`);
        args.push(update[key] ?? null);
      }
    }
    if (assignments.length === 0) continue;
    args.push(entity.id);

    await execute(
      db,
      `UPDATE model_specs
       SET ${assignments.join(", ")}, updated_at = datetime('now')
       WHERE entity_id = ?`,
      args,
    );
  }
}

async function cleanAllSpecs(db: Client) {
  const result = await execute(db, "SELECT * FROM model_specs");
  const fields = [
    "series_name",
    "release_year",
    "origin_country",
    "nib",
    "fill_system",
    "material",
    "dimensions",
    "weight",
    "price_range",
    "status",
  ];

  let changed = 0;
  for (const row of result.rows) {
    const updates: string[] = [];
    const args: unknown[] = [];

    for (const field of fields) {
      const original = row[field];
      const cleaned = cleanSpecValue(original);
      const normalizedOriginal =
        original === null || original === undefined ? null : String(original).trim();
      if (cleaned !== normalizedOriginal) {
        updates.push(`${field} = ?`);
        args.push(cleaned);
      }
    }

    if (updates.length === 0) continue;
    args.push(String(row.id));
    await execute(
      db,
      `UPDATE model_specs
       SET ${updates.join(", ")}, updated_at = datetime('now')
       WHERE id = ?`,
      args,
    );
    changed += 1;
  }

  console.log(`Cleaned model specs: ${changed}`);
}

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");

  console.log(
    WRITE
      ? "Reader-ready library content import: write mode"
      : "Reader-ready library content import: dry run",
  );

  if (!WRITE) {
    console.log(`Curated stories: ${CURATED_STORIES.length}`);
    console.log(`Spec updates: ${SPEC_UPDATES.length}`);
    console.log("Dry run only. Re-run with --write to update the database.");
    return;
  }

  for (const story of CURATED_STORIES) {
    await writeStory(db, story);
  }

  await repairRemainingStories(db);
  await writeSpecUpdates(db);
  await cleanAllSpecs(db);

  const storyInternal = await execute(
    db,
    `SELECT COUNT(*) AS count FROM stories
     WHERE title LIKE '%后续%'
        OR title LIKE '%研究队列%'
        OR title LIKE '%补证%'
        OR title LIKE '%待核验%'
        OR title LIKE '%待拆分%'
        OR title LIKE '%资料边界%'
        OR title LIKE '%来源边界%'
        OR title LIKE '%待合并%'
        OR title LIKE '%待别名%'
        OR title LIKE '%先%'
        OR title LIKE '%待归因%'
        OR summary LIKE '%后续%'
        OR summary LIKE '%当前%'
        OR summary LIKE '%研究队列%'
        OR summary LIKE '%补证%'
        OR summary LIKE '%待核验%'
        OR summary LIKE '%需核验%'
        OR summary LIKE '%待拆分%'
        OR summary LIKE '%待重分类%'
        OR summary LIKE '%待合并%'
        OR summary LIKE '%待别名%'
        OR summary LIKE '%资料边界%'
        OR summary LIKE '%来源边界%'
        OR summary LIKE '%品牌馆先%'
        OR summary LIKE '%页面先%'
        OR summary LIKE '%档案先%'
        OR summary LIKE '%条目先%'
        OR summary LIKE '%先以%'
        OR summary LIKE '%先围绕%'
        OR summary LIKE '%先作为%'
        OR summary LIKE '%先把%'
        OR summary LIKE '%先记录%'
        OR summary LIKE '%先保留%'
        OR summary LIKE '%先用%'
        OR summary LIKE '%等待官网%'
        OR summary LIKE '%等待直接%'
        OR summary LIKE '%等待独立%'
        OR summary LIKE '%规格暂用%'
        OR summary LIKE '%所有规格保留%'
        OR body_md LIKE '%后续%'
        OR body_md LIKE '%当前草稿%'
        OR body_md LIKE '%当前档案%'
        OR body_md LIKE '%当前页面%'
        OR body_md LIKE '%研究队列%'
        OR body_md LIKE '%补证%'
        OR body_md LIKE '%待核验%'
        OR body_md LIKE '%待拆分%'
        OR body_md LIKE '%待合并%'
        OR body_md LIKE '%待别名%'
        OR body_md LIKE '%资料边界%'
        OR body_md LIKE '%来源边界%'
        OR body_md LIKE '%现在先按%'
        OR body_md LIKE '%目前最需要%'
        OR body_md LIKE '%尚无直接来源确认%'
        OR body_md LIKE '%站内摘要把它归为%'`,
  );
  const specInternal = await execute(
    db,
    `SELECT COUNT(*) AS count FROM model_specs
     WHERE coalesce(series_name,'') LIKE '%待核验%'
        OR coalesce(release_year,'') LIKE '%待核验%'
        OR coalesce(origin_country,'') LIKE '%待核验%'
        OR coalesce(nib,'') LIKE '%待核验%'
        OR coalesce(fill_system,'') LIKE '%待核验%'
        OR coalesce(material,'') LIKE '%待核验%'
        OR coalesce(dimensions,'') LIKE '%待核验%'
        OR coalesce(weight,'') LIKE '%待核验%'
        OR coalesce(price_range,'') LIKE '%待核验%'
        OR coalesce(status,'') LIKE '%待核验%'`,
  );

  console.log(`Remaining internal stories: ${storyInternal.rows[0]?.count}`);
  console.log(`Remaining pending spec values: ${specInternal.rows[0]?.count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
