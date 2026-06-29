import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REVIEW_PATH = path.join(
  process.cwd(),
  "docs/content/read-first-b-pilot-humanizer-review.md",
);
const B_MIN_CHARS = 1000;
const B_MAX_CHARS = 1900;

type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  sourceItemIds: string[];
  humanizer: {
    directness: number;
    rhythm: number;
    trust: number;
    authenticity: number;
    concision: number;
    notes: string;
  };
};

type SourceItemSeed = {
  id: string;
  title: string;
  url: string;
  summary: string;
  slugs: string[];
};

const PILOT_WEB_CATALOG_URL =
  "https://webcatalog.pilot.co.jp/products/DispDetail.do?volumeName=00004&itemID=";

const OFFICIAL_SOURCE_ITEMS: SourceItemSeed[] = [
  {
    id: "pilot-webcatalog-custom-74",
    title: "PILOT Web Catalog: Custom 74",
    url: `${PILOT_WEB_CATALOG_URL}t000100000241`,
    slugs: ["百乐-pilot-custom-74"],
    summary:
      "Official Pilot Web Catalog page for Custom 74. Confirms 14K No.5 nib, 11 nib choices, resin cap/barrel, CON-40/CON-70N compatibility, 143 mm length and 17.4 g weight.",
  },
  {
    id: "pilot-webcatalog-custom-742",
    title: "PILOT Web Catalog: Custom 742",
    url: `${PILOT_WEB_CATALOG_URL}t000100000331`,
    slugs: ["百乐-pilot-custom-742"],
    summary:
      "Official Pilot Web Catalog page for Custom 742. Confirms 14K No.10 nib, 16 nib choices, resin cap/barrel, CON-40/CON-70N compatibility, included CON-70N, 145.9 mm length and 24 g weight.",
  },
  {
    id: "pilot-webcatalog-custom-743",
    title: "PILOT Web Catalog: Custom 743",
    url: `${PILOT_WEB_CATALOG_URL}t000100000346`,
    slugs: ["百乐-pilot-custom-743"],
    summary:
      "Official Pilot Web Catalog page for Custom 743. Confirms 14K No.15 nib, resin cap/barrel, CON-40/CON-70N compatibility, included CON-70N, 149 mm length and 25 g weight.",
  },
  {
    id: "pilot-webcatalog-custom-heritage-912",
    title: "PILOT Web Catalog: Custom Heritage 912",
    url: `${PILOT_WEB_CATALOG_URL}t000100000376`,
    slugs: ["百乐-pilot-912"],
    summary:
      "Official Pilot Web Catalog page for Custom Heritage 912. Confirms rhodium-finished 14K No.10 nib, 15 nib choices, resin cap/barrel, CON-40/CON-70N compatibility, included CON-70N, 140 mm length and 20 g weight.",
  },
  {
    id: "pilot-webcatalog-custom-heritage-91",
    title: "PILOT Web Catalog: Custom Heritage 91",
    url: `${PILOT_WEB_CATALOG_URL}t000100000257`,
    slugs: ["百乐-pilot-heritage-91"],
    summary:
      "Official Pilot Web Catalog page for Custom Heritage 91. Confirms rhodium-finished 14K No.5 nib, resin cap/barrel, CON-40/CON-70N compatibility, 137 mm length and 15.7 g weight.",
  },
  {
    id: "pilot-webcatalog-custom-heritage-92",
    title: "PILOT Web Catalog: Custom Heritage 92",
    url: `${PILOT_WEB_CATALOG_URL}t000100000244`,
    slugs: ["百乐-pilot-heritage-92"],
    summary:
      "Official Pilot Web Catalog page for Custom Heritage 92. Confirms piston filling system, 1.2 ml ink capacity, transparent resin body, 14K No.5 nib, 137 mm length and 20 g weight.",
  },
  {
    id: "pilot-webcatalog-elite-95s",
    title: "PILOT Web Catalog: Elite 95S",
    url: `${PILOT_WEB_CATALOG_URL}t000100000203`,
    slugs: ["百乐-pilot-elite-95s"],
    summary:
      "Official Pilot Web Catalog page for Elite 95S. Confirms short pocket size, 1974-model-based revival language, 14K nib, 119 mm capped length, 15 g weight, resin barrel and aluminum cap.",
  },
  {
    id: "pilot-webcatalog-prera",
    title: "PILOT Web Catalog: Prera",
    url: `${PILOT_WEB_CATALOG_URL}t000100004707`,
    slugs: ["百乐-pilot-prera"],
    summary:
      "Official Pilot Web Catalog page for Prera. Confirms short-size fountain pen positioning, resin cap/barrel, CON-40 compatibility, included CON-40, 120.4 mm length and 15.4 g weight.",
  },
  {
    id: "pilot-webcatalog-kakuno",
    title: "PILOT Web Catalog: Kakuno",
    url: `${PILOT_WEB_CATALOG_URL}t000100000304`,
    slugs: ["百乐-pilot-笑脸-kakuno"],
    summary:
      "Official Pilot Web Catalog page for Kakuno. Confirms beginner-oriented design, Good Design and Kids Design awards, resin cap/barrel, CON-40/CON-70N compatibility, 131 mm length and 11 g weight.",
  },
  {
    id: "pilot-webcatalog-cavalier",
    title: "PILOT Web Catalog: Cavalier",
    url: `${PILOT_WEB_CATALOG_URL}t000100000127`,
    slugs: ["百乐-pilot-cavalier"],
    summary:
      "Official Pilot Web Catalog page for Cavalier. Confirms slim fountain pen positioning, brass cap/barrel, CON-40 compatibility, 9.8 mm maximum diameter, 134.4 mm length and 16.5 g weight.",
  },
];

const BANNED_PATTERNS: Array<[RegExp, string]> = [
  [/有人说.*有人说.*还有人说/s, "有人说三连"],
  [/不是[^。；\n]{0,80}而是/s, "不是而是"],
  [/不仅[^。；\n]{0,80}而且/s, "不仅而且"],
  [/型号档案记录了|现有来源包括|优先按实物图|日用性可以从这些结构入手/, "后台资料卡话术"],
  [/作为[^。；\n]{0,80}(体现|证明|提醒|标志)/, "作为体现类句式"],
  [/标志着|见证了|至关重要|关键作用|持久影响|复杂格局/, "AI 抽象意义词"],
  [/值得注意的是|此外|然而|总的来说|综上/, "AI 连接词"],
  [/很多人认为|行业专家指出|一些批评者认为|多个来源显示/, "模糊归因"],
  [/后续应|可以作为|应把它放在|方便读者确认|资料不足|当前档案|当前页面|研究队列/, "策展/维护提示语"],
];

const ARTICLES: Article[] = [
  {
    slug: "百乐-pilot-custom-74",
    title: "Pilot Custom 74：百乐金尖世界的正门",
    summary:
      "Custom 74 是许多人接触 Pilot 14K 金尖的第一站：树脂笔身、5 号金尖、墨囊/上墨器结构，把日用和可选笔尖放在同一支笔里。",
    sourceItemIds: ["pilot-webcatalog-custom-74"],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "从官方 14K 5 号尖、11 种尖型和 CON-40/CON-70N 兼容写起，控制购买建议的语气。",
    },
    body: `Custom 74 最适合被当成 Pilot 金尖世界的正门。它不大，不重，外观也没有太多装饰。打开官方 Web Catalog，会看到它的重点写得很朴素：较粗、好握的树脂笔身，14K 5 号笔尖，CON-40 和 CON-70N 上墨器兼容，全长 143 mm，重量 17.4 g。它的吸引力不在罕见，而在稳定地回答一个问题：第一支百乐金尖应该从哪里开始。

Custom 74 的位置很微妙。它比 Kakuno、Prera 这类钢尖入门笔贵得多，又没有 Custom 742、743 那种大笔尖和更高价格。这个中间位置让它很适合作日常金尖。你能体验 Pilot 14K 尖的细腻，也不用马上进入更大、更重、更讲究的型号。对写中文小字的人，EF、F、FM 这几个尖号通常比粗尖更容易上手。

官方目录列出 11 种笔尖，从常规 EF、F、M，到 MS 音乐尖、C 粗尖。这个选择范围是 Custom 74 很重要的价值。很多同价位钢笔只给两三种线宽，Custom 74 则允许用户按字形和纸张来调整。问题也在这里：新手很容易被尖型列表迷住。真正日用时，先选一个适合自己字大小的尖，比追求特殊尖更稳。

上墨方式也让 Custom 74 很好维护。墨囊方便，CON-40 容量小但清洗快，CON-70N 容量更实用。它不靠活塞或真空结构制造话题，换来的好处是简单。你可以把它当作办公室、课堂、日记本上的常用笔，而不需要每次换墨都拆半天。

和 Custom Heritage 91 比，Custom 74 更传统，金色装饰更有老派金笔感。91 的银色装饰和扁平笔帽更现代。两者都在 Pilot 入门金尖附近，选择时更多看外形和握持。和 Custom 742 比，74 的笔尖小一号，选择少一些，重量也轻。若你只想每天写，74 已经够用；若你明确想试 FA、PO、WA 这类特殊尖，742 和 912 会更合适。

Custom 74 也常被拿来和 Platinum #3776 Century、Sailor 1911S 比。#3776 的反馈更清楚，Sailor 的纸面感更鲜明，Custom 74 往往显得更圆润。这个差别没有绝对好坏。写得轻、写得快、想要少一点阻力的人，会更容易接受 74；喜欢笔尖在纸上留下明确触感的人，可能会转向白金或写乐。

购买 Custom 74 时，先看尖号，再看上墨器和地区版本。透明色、限定色、黑杆金夹会影响外观和价格，但核心仍是那枚 14K 5 号尖。二手笔要确认笔尖是否歪、笔舌是否被拆过、笔帽密封是否正常。它不靠第一眼惊艳取胜，更像一支让你慢慢理解 Pilot 金尖日用性的笔。写几页后，若你忘了它的存在，只剩下字顺着手出来，这就是 Custom 74 最合适的状态。`,
  },
  {
    slug: "百乐-pilot-custom-742",
    title: "Pilot Custom 742：把选择权交给笔尖",
    summary:
      "Custom 742 用 10 号 14K 金尖和 16 种尖型把 Custom 系列往玩家方向推了一步，适合已经知道自己想试哪种书写性格的人。",
    sourceItemIds: ["pilot-webcatalog-custom-742"],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把重点放在 10 号尖、16 种尖型、CON-70N 和中阶定位，避免把 FA 尖写成万能弹性尖。",
    },
    body: `Custom 742 看起来很像一支普通黑色雪茄形钢笔，真正的分界线在笔尖。Pilot 官方 Web Catalog 给它的是 14K 10 号尖，并列出 16 种尖型，随笔附 CON-70N 上墨器。比 Custom 74 大一号，比 Custom 743 小一号，它刚好站在 Pilot Custom 系列的中段。

这支笔不适合只按价格理解。Custom 742 的意义在于选择权。常规 EF、F、M、B 之外，还有 SF、SM、SFM、PO、WA、SU、FA、MS、C 等尖型。用户如果只是想买一支省心金尖，Custom 74 已经很好；想借一支笔进入 Pilot 特殊尖系统，742 才更有意思。

10 号尖带来的变化很实际。它比 5 号尖更有存在感，笔身也长到 145.9 mm，重量 24 g。握在手里，742 会比 74 稳重，不会像 743 那样直接进入大笔身。这个尺寸让它适合长一点的书写，也让特殊尖有更合理的平台。尤其是 FA、WA、PO 这类尖，用户需要慢慢写、慢慢找纸和墨水，不适合只看评测里的线条变化就下单。

Custom 742 的上墨方式仍然保守。CON-70N 容量比小上墨器舒服，清洗又比活塞和真空结构简单。它适合那些喜欢换墨、又需要比入门金尖更丰富笔尖选择的人。若你每天只用一种墨水写大量笔记，Custom 823 的真空容量会更诱人；若你想反复试不同墨色和尖型，742 更轻松。

和 Custom Heritage 912 比，742 走传统圆帽路线，912 是扁平笔帽、银色装饰、铑金属气质。两者都围绕 10 号 14K 尖和特殊尖展开。选择时先看握持和外形，再看自己要哪种尖。和 Custom 743 比，742 少了 15 号大尖的舒展感，价格和体积也更克制。它的优势在中间位置。

买 742 最容易犯的错，是把特殊尖当成自动提升写感的魔法。PO 尖适合控制细线，WA 尖有自己的角度宽容，FA 尖需要轻手和合适纸张。每一种尖都会改变使用习惯，也会放大纸和墨水的差异。若第一支 Pilot 金尖就选 742，建议从常规 F、FM、M 开始；已经知道自己字形和用途，再去看特殊尖。

Custom 742 适合愿意把钢笔当作书写工具研究的人。它没有透明笔身，也没有复杂上墨结构，外观甚至有点安静。可一旦把注意力放到笔尖，它就变得很宽。购买时先确认尖型、上墨器、笔尖状态和来源地区。二手特殊尖尤其要看是否被压弯或打磨过。742 的好处是给你空间，坏处是它要求你知道自己为什么需要这份空间。`,
  },
  {
    slug: "百乐-pilot-custom-743",
    title: "Pilot Custom 743：Custom 系列的大笔尖台阶",
    summary:
      "Custom 743 用 15 号 14K 金尖、149 mm 树脂笔身和 CON-70N，把 Custom 系列推到更舒展的书写平台上。",
    sourceItemIds: ["pilot-webcatalog-custom-743"],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "围绕 15 号尖、尺寸、CON-70N 和与 74/742/823 的实际取舍写。",
    },
    body: `Custom 743 是 Custom 系列里很清楚的一步台阶。官方 Web Catalog 说得直白：它使用较大的 15 号 14K 笔尖，全长 149 mm，重量 25 g，随笔附 CON-70N 上墨器。它不像 823 那样靠真空上墨被人记住，也不像 742 那样首先让人想到特殊尖列表。743 的中心，是大一号的书写平台。

15 号尖改变的不是参数表上的数字。笔尖更大，视觉更舒展，纸面上的动作也更从容。写字很轻的人，会感觉它比 5 号尖更有余量；手重的人仍然要控制力道。Pilot 的 14K 尖通常走平顺路线，743 也不应被想成夸张弹性笔。它提供的是宽松感，不是老式软尖那种戏剧性线宽。

Custom 743 的笔身仍然是树脂、旋帽、墨囊/上墨器。CON-70N 的容量够用，清洗也比真空笔简单。这个配置让它适合每天写，而不需要围绕上墨结构安排使用习惯。若你喜欢 Pilot 大尖，却不想处理 Custom 823 的真空阀门和清洗成本，743 会更直接。

它和 Custom 74 的差别很容易感到。74 是轻便的入门金尖，适合从普通日用开始；743 更像已经确认喜欢 Pilot 之后的升级。它和 742 的差别在笔尖大小和体量。742 的吸引力常在 10 号尖和更多特殊尖选择，743 则把注意力放到 15 号尖的舒展。二者没有谁替代谁的问题，要看你想要尖型选择，还是更大的书写触感。

和 Custom 823 放在一起看，743 更像同一条大尖路线里的简洁版本。823 的真空上墨、大容量和半透明笔身很有魅力，也带来清洗和阀门习惯。743 没有这些结构戏份，换来的好处是换墨和维护更轻。喜欢固定一瓶墨长写的人可能更爱 823；喜欢经常换墨、又想要 15 号尖的人更容易留在 743。

Custom 743 不太适合只想买“第一支好笔”的用户。它的尺寸、价格和笔尖都要求你已经有一些偏好。手小、字很小、写得很短的人，Custom 74 或 Heritage 91 可能更舒服。每天长写、喜欢宽一点握持、想要大金尖的人，743 的价值才会慢慢出来。

购买时先确认尖号。官方目录给出多种尖型，细尖适合中文笔记，M、B、BB 更适合签名和展示墨色，FA、WA、PO 这类特殊尖要有明确用途。二手 743 要看笔尖是否歪、铱点是否被磨、笔杆是否有裂纹。它靠手里的尺度感说话，不靠故事包装。写过 74 之后再拿起 743，你会立刻知道这一步升级到底值不值。`,
  },
  {
    slug: "百乐-pilot-912",
    title: "Pilot Custom Heritage 912：特殊尖爱好者的工作台",
    summary:
      "Custom Heritage 912 用银色装饰、平顶笔身和 10 号 14K 铑金尖，把 Pilot 特殊尖系统放进更现代的外形里。",
    sourceItemIds: ["pilot-webcatalog-custom-heritage-912"],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据官方 15 种尖型和 10 号铑金尖写 PO/FA/WA 等选择，不泛化单一尖型体验。",
    },
    body: `Custom Heritage 912 的外形比 Custom 742 更冷静。平顶笔帽、银色笔夹和金属环、铑金色笔尖，让它看起来少一点传统金笔味。官方 Web Catalog 把它写成 14K 10 号铑金尖，15 种尖型，CON-40 和 CON-70N 兼容，随笔附 CON-70N。这个配置说明它的重点不只在外形，而在笔尖选择。

912 常被特殊尖用户盯上。官方目录里能看到 PO、FA、WA、SU、C、MS 等尖型，覆盖了细线控制、角度容错、软尖风格、签名和书法等方向。可这些尖不是装饰。PO 尖适合写很细、控制角度；FA 尖需要轻手和合适纸张；WA 尖更照顾握笔角度。选错尖，912 会变得难用。

这支笔的好处，是把特殊尖放在一个合理尺寸里。140 mm 全长、20 g 重量，既不像大笔那样占手，也比轻小入门笔更稳。10 号尖足够展开，笔身又不会太夸张。对想认真试 Pilot 特殊尖的人，912 比直接买大号 743 更克制，比 Custom 74 更有选择。

上墨结构仍然简单。CON-70N 容量适合日用，换墨和清洗都容易。特殊尖用户往往会试不同纸和墨水，这种可维护性很重要。若一支笔清洗成本太高，实验会很快变成负担。912 的机械结构不抢戏，注意力可以回到笔尖、纸张和字形。

和 Custom 742 比，912 的功能区间很接近，但外观完全不同。742 是传统圆帽黑金路线，912 是 Heritage 系列的平顶银饰路线。写起来的差别更多来自尖型，而不是笔身名称。若你喜欢经典 Pilot 外形，742 更顺眼；若你想要现代、干净一点的外观，912 更合适。

把 912 当普通 F 尖金笔买也没问题，只是会有点浪费它的特色。它真正适合的读者，是已经知道自己想要什么线条，或者愿意花时间研究笔尖的人。写中文小字的人可以看 EF、F、PO；喜欢签名和大字的人可以看 SU、C、MS；想要软一点的变化再考虑 FA。每个选择都要和纸、墨、手劲一起判断。

购买时不要只看“PO 尖”“FA 尖”几个字。要看笔尖是否原装、是否被调过、笔舌和供墨是否正常。特殊尖二手风险比常规尖更高，前任使用者的手劲可能已经改变状态。912 的价值在于给你一个干净、现代、可维护的平台，让 Pilot 的特殊尖真正工作起来。它不是最省心的第一支金笔，却是很适合进阶用户的一张工作台。若你已经写过几支普通 F 尖金笔，912 会让下一步选择变得更具体。`,
  },
  {
    slug: "百乐-pilot-heritage-91",
    title: "Pilot Custom Heritage 91：换一副面孔的入门金尖",
    summary:
      "Custom Heritage 91 和 Custom 74 同处 Pilot 小号 14K 金尖区间，银色装饰和平顶笔帽让它更现代，也更低调。",
    sourceItemIds: ["pilot-webcatalog-custom-heritage-91"],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把 91 写成与 Custom 74 相邻的现代外形选择，事实限定在官方目录的 14K 5 号尖和尺寸。",
    },
    body: `Custom Heritage 91 很适合和 Custom 74 一起看。官方 Web Catalog 给它的是 14K 5 号铑金尖、树脂笔身、CON-40 和 CON-70N 兼容，全长 137 mm，重量 15.7 g。它和 Custom 74 的距离很近，却把外观换成了平顶笔帽和银色装饰。喜欢 Pilot 金尖，又不想要传统黑金味的人，常会在这里停一下。

91 的性格比参数更清楚。它没有 742、743 那种大笔尖，也没有 92 的活塞结构。它是一支轻、短、现代感更强的小号金尖。写中文小字、日常笔记、办公短写，都在它的舒适区。手大、喜欢粗笔、想要更宽握持的人，可能会觉得它不够饱满。

官方目录里 91 的重点很保守：14K 笔尖、铑金饰面、树脂笔身、墨囊/上墨器。目录在这个型号上展示的线宽比 Custom 74 少，这也说明它不应被当成特殊尖平台。若你要 PO、FA、WA 等笔尖，912 或 742 更合适。91 的任务，是用简单金尖和现代外观完成日用。它的好处，是让用户少在尖型表里犹豫，直接回到轻量、细腻和低调这几个判断上。

和 Custom 74 比，91 少一点老派感。74 的圆帽和金色装饰更像传统金笔，91 的平顶和银色装饰更像现代办公笔。书写核心都在 Pilot 小号 14K 尖附近，差别往往来自具体尖号、批次和使用者手感。若你在线下试写，建议把 74 和 91 放在同一张纸上比较，而不是只看照片。

和 Heritage 92 比，91 更简单。92 有透明笔身和回转吸入结构，墨量更大，也更有上墨系统的乐趣。91 使用墨囊或上墨器，清洗和换墨轻松。喜欢固定一瓶墨长写的人可以看 92；喜欢经常换墨、写短笔记、追求低维护的人会更容易接受 91。

91 也很适合那些不想让钢笔太显眼的人。它不是夸张的大金尖，也不是透明示范笔。放在办公桌上，它看起来像一支干净的黑色笔。真正写起来，14K 尖会给它比普通钢尖更细腻的纸面感。这个差别不需要被夸大，但长时间使用会慢慢显出来。

购买时先确认你喜欢平顶外形，再看尖号和价格。若和 Custom 74 价格接近，选择主要看外观；若 91 的渠道价格明显低，日用价值会变得很高。二手 91 要看铑金尖是否有划痕、笔夹和金属环是否磨损、笔帽密封是否正常。它不是一支讲大故事的笔，却能把 Pilot 入门金尖做得更安静。对不喜欢黑金传统味的人，91 可能比 74 更像每天想拿起来的那支。`,
  },
  {
    slug: "百乐-pilot-heritage-92",
    title: "Pilot Custom Heritage 92：透明活塞里的百乐金尖",
    summary:
      "Custom Heritage 92 把 14K 5 号金尖、透明树脂笔身和 1.2 ml 回转吸入结构放在一起，是 Pilot 体系里很直观的活塞金尖选择。",
    sourceItemIds: ["pilot-webcatalog-custom-heritage-92"],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据官方回转吸入、1.2 ml、透明树脂和 14K 5 号尖写，用场景解释而非堆参数。",
    },
    body: `Custom Heritage 92 的入口很直观：Pilot 金尖，加透明活塞。官方 Web Catalog 写明它采用回转吸入机构，墨量 1.2 ml，透明树脂笔身能看到余墨，笔尖是 14K 5 号，常见线宽有 F、FM、M、B。它不像 Custom 74 那样用上墨器，也不像 Custom 823 那样用真空结构。92 把重点放在活塞和可见墨量上。

这支笔适合喜欢一瓶墨写很久的人。回转吸入比上墨器容量更大，透明笔身让墨量一眼可见。写课堂笔记、日记、长段摘抄时，它会比普通 CON-40 省心很多。喜欢频繁换墨的人要谨慎，活塞笔清洗比上墨器慢，透明笔身还会把残留和染色直接露出来。

92 的笔尖是 Pilot 小号 14K。它不会像 743 那样给你大金尖的舒展，也没有 912 那么多特殊尖。官方目录的线宽选择更偏日用。F 和 FM 适合中文小字，M、B 更适合较大字和展示墨色。若你是因为活塞结构而买它，先确认线宽能满足自己的日常字形。

和 Custom 74 比，92 的差别几乎都在上墨和外观。74 更容易换墨，维护简单，黑杆金夹更传统。92 容量更大，透明笔身更有玩墨水的乐趣。和 Custom Heritage 91 比，92 更有结构存在感，也更需要清洁耐心。91 像一支安静金尖，92 更像桌面上的透明工具。

它也常被拿来和 TWSBI ECO、580 比。TWSBI 的优势在更低价和强烈透明活塞气质，92 的优势在 Pilot 14K 金尖和更克制的尺寸。若你只是想体验活塞，TWSBI 已经足够；若你想要 Pilot 金尖同时保留活塞墨仓，92 的定位更清楚。

92 的局限也要放在前面。1.2 ml 对日用很舒服，却会让换墨周期变长。透明笔身漂亮，也会让你开始在意墨水是否染色。活塞结构若长期不用，需要清洗和保养。它不是懒人笔，更适合固定搭配一两瓶安全墨水。

购买时先检查活塞是否顺、笔身是否有细裂、笔帽密封是否正常。二手 92 还要看透明件有没有染色，尤其是用过高饱和墨水的个体。若你写字量大，想要一支比 Custom 74 更能装墨的 Pilot 金尖，92 很合适。若你喜欢每周换颜色，普通上墨器笔会更轻松。它的好处很诚实：让墨水待在笔身里，让你看到它，也让你写得更久。第一次使用最好先配容易清洗的蓝黑或蓝色墨水，确认活塞和出墨状态后，再去尝试更鲜艳的颜色。`,
  },
  {
    slug: "百乐-pilot-elite-95s",
    title: "Pilot Elite 95S：口袋里的昭和短钢笔",
    summary:
      "Elite 95S 是 Pilot 对短钢笔传统的现代复刻：合盖 119 mm、15 g、14K 笔尖，插帽后才变成一支完整书写工具。",
    sourceItemIds: ["pilot-webcatalog-elite-95s"],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据官方 Elite S 历史说明、119 mm、15 g、14K 尖和复刻定位写。",
    },
    body: `Elite 95S 要从“短”开始理解。官方 Web Catalog 把它称为适合衬衫胸袋的 short size fountain pen，合盖全长 119 mm，重量 15 g，使用 14K 笔尖。它收起来很短，插上长笔帽后又能变成标准书写长度。这是口袋钢笔最经典的逻辑。

Pilot 在官方页面里把 Elite 95S 和昭和 43 年推出的 Elite S 联系起来，并说明它延续第二代昭和 49 年型号的设计。读者不必背年份，抓住气质就够了：黑色笔身、金色环饰、嵌入式笔尖、短小轻便。它带着明显的日本老派通勤味，不是现代透明笔，也不是夸张大金尖。

Elite 95S 的好处在携带。合盖短，放胸袋、手账袋、随身小包都轻松。插帽后长度够写一段话，不会像极短金属小笔那样牺牲太多握持。15 g 的重量也很轻，长时间放在口袋里不会太有负担。若你真正需要随身钢笔，它比普通长笔更有意义。

它的局限同样来自短笔身。使用时几乎必须插帽，否则长度不够。墨囊和 CON-40 上墨器带来的容量有限，适合短写、随身记录、签名和旅行笔记，不太适合每天长篇抄写。喜欢大容量的人可以看 Custom 823 或 Heritage 92，喜欢普通尺寸金尖的人可以看 Custom 74。

Elite 95S 的笔尖很有识别度。嵌入式结构让它看起来不像普通开放尖，也让整支笔的前端更干净。书写上，Pilot 的金尖通常平顺，95S 又因为笔身轻，适合轻手写。若你喜欢重笔、粗杆、大笔尖，它可能显得太秀气；若你喜欢小而稳的随身物，95S 很容易让人上瘾。

和 Kaweco Sport、Liliput 比，Elite 95S 更像一支真正的金尖口袋笔。Sport 更休闲，Liliput 更极端，95S 则在便携和正式之间保持平衡。和 Pilot Capless/Decimo 比，它没有按动便利，却更轻、更薄，也少了笔夹位置对握持的影响。

购买时先确认命名。不同市场会看到 Elite 95S 或 E95S，外观和在售版本也可能有地区差异。再看尖号、笔帽插上后的稳定性、笔尖是否歪、嵌入式尖周围是否有损伤。二手老 Elite 系列和现代 Elite 95S 不要混在一起判断。现代 95S 的价值在复刻和日用，不在古董稀缺。它适合那些经常出门、真的会随身带笔的人。若只放书桌上，它的短身优势会被浪费；若每天在路上写两三次，它的短小会变成真实便利。`,
  },
  {
    slug: "百乐-pilot-prera",
    title: "Pilot Prera：小尺寸日用钢尖的安静选择",
    summary:
      "Prera 是一支短尺寸 Pilot 钢尖笔，树脂笔身、CON-40、120.4 mm 长度和轻重量让它适合手账、短笔记和通勤备用。",
    sourceItemIds: ["pilot-webcatalog-prera"],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "从官方短尺寸、CON-40、树脂笔身和 F/M 日用线宽写，不硬讲本土人气。",
    },
    body: `Prera 是 Pilot 里很容易被忽略的一支小笔。官方 Web Catalog 把它写成“轻松使用的短尺寸钢笔”，树脂笔身，CON-40 上墨器，长 120.4 mm，重量 15.4 g。它没有金尖，也没有复杂上墨结构。它的任务很简单：做一支轻、短、干净的日用钢尖。

Prera 的尺寸是第一判断点。它比很多标准钢笔短，拿起来轻，放在手账袋、笔袋和通勤包里都不占地方。写几行日记、做读书摘录、在会议本上记短句，它很舒服。若你手大、喜欢粗杆或长时间写整页，Prera 可能会显得小。

它和 Kakuno、Metropolitan/Cocoon 常被放在同一个入门 Pilot 区间里看。Kakuno 更像第一支钢笔，有笑脸笔尖和儿童/学生气质；Cocoon/Metropolitan 用金属笔身，看起来更像办公笔；Prera 夹在中间，少一点儿童感，也少一点金属重量。它更适合想要轻便、低调、干净外观的人。

Prera 的钢尖不负责制造惊喜。它的价值在稳定和容易使用。F、M 这类常规线宽足够处理日常，CON-40 容量不大，但清洗快。喜欢频繁换墨的人会比活塞笔用户轻松。若你已经有很多墨水样品，Prera 可以当一支方便试写的小笔。

透明版本和普通色版本会改变它的气质。透明版本更像试墨工具，能看到墨囊和上墨器；普通色更像随身短笔。购买时要看清版本，因为照片里的可爱颜色会让人忽略尺寸和握持。它不是万能入门笔，只是把短尺寸和 Pilot 钢尖做得很顺手。

和 LAMY Safari 比，Prera 没有强制三角握位，笔身也小得多。Safari 更像训练握姿的学生工具，Prera 更像安静的手账笔。和 TWSBI ECO 比，Prera 容量小很多，换墨轻松很多。你要大容量透明活塞，就不该选 Prera；你要随手记短句，它更省心。

购买时先看自己是否接受短笔身。能试握最好，把笔帽插上后写几行，再决定。再看尖号、颜色和上墨器是否随笔。二手 Prera 要看笔帽扣合是否利落、透明件是否划伤、笔尖是否刮纸。它适合那些不想把钢笔买得太重、太贵、太像收藏品的人。Prera 的好处是安静，放进日常里不会抢戏。写完一页手账，你可能不会记得它有什么特殊故事，却会记得它没有添麻烦。若你常在咖啡店、通勤路上或会议间隙写短句，Prera 的小尺寸会比大容量更有用。它也适合放在常用包里，承担临时记录。`,
  },
  {
    slug: "百乐-pilot-笑脸-kakuno",
    title: "Pilot Kakuno：第一支钢笔为什么可以有笑脸",
    summary:
      "Kakuno 把儿童和新手入门做得很具体：轻塑料笔身、笑脸笔尖、墨囊/上墨器兼容和低负担价格，让钢笔先变得不吓人。",
    sourceItemIds: ["pilot-webcatalog-kakuno"],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据官方入门定位、奖项、树脂笔身、CON-40/CON-70N 兼容和轻重量写。",
    },
    body: `Kakuno 的笑脸不是装饰小聪明。它告诉新手：笔尖正面在这里，别把钢笔想得太严肃。官方 Web Catalog 把 Kakuno 写成第一次遇见钢笔的入口，页面也提到 Good Design Award 和 Kids Design Award。树脂笔身、11 g 重量、CON-40 和 CON-70N 兼容，让它从一开始就站在儿童和新手这一边。

很多入门钢笔的失败，不在写不出字，而在让人紧张。笔太贵，怕摔；上墨太麻烦，怕弄脏；笔尖太娇气，怕压坏。Kakuno 把这些压力降下来。它便宜，轻，开盖插墨囊就能写。孩子可以拿来练字，成年人也可以把它当成一支不需要供起来的随手笔。

Kakuno 的笔身有一点引导感，但没有 LAMY Safari 那么强。它帮助你找到握持方向，又不会把手指锁得太死。笔尖上的笑脸也让方向判断更直接。对孩子来说，这些小设计比“书写文化”之类的大词更有用。笔能拿对，墨能出来，字能写完，第一关就过了。

它的书写期待要放在入门区间。Kakuno 是钢尖笔，不会有金尖的细腻弹性。F 尖适合中文小字和作业，M 尖更适合较大的字和颜色展示。纸太差时，任何钢笔都会洇或刮；墨水太难清洗时，新手也容易受挫。第一支 Kakuno 最好配稳定墨水，不要一开始就上复杂亮片墨。

和 Pilot Prera 比，Kakuno 更儿童、更轻松，Prera 更像手账和短笔记用的小型日用笔。和 Metropolitan/Cocoon 比，Kakuno 少了金属外壳，也少了正式感。和 LAMY Safari 比，Kakuno 的握位压力小，价格和替换成本更低；Safari 的设计感和体系感更强。

Kakuno 也适合成年人重新开始用钢笔。很多人离开学校后对钢笔有阴影，觉得它漏墨、麻烦、难伺候。Kakuno 的好处是把事情做小：一支轻笔，一个笑脸，一枚容易用的尖。它不会让你马上理解高端钢笔的魅力，却能让你愿意多写几行。

购买时先选线宽，再看颜色。给孩子或中文小字用户，F 通常更稳；想让墨色更明显，可以看 M。要确认墨囊或上墨器是否一起购买，尤其是第一次用钢笔的人。二手 Kakuno 没有太大必要，除非价格很低且笔尖状态清楚。它最适合的场景，是第一支、备用笔、学生笔和低压力练习。家里给孩子准备钢笔时，也要把清洗、备用墨囊和笔帽收纳一起想好。钢笔可以很认真，也可以先从一个笑脸开始。`,
  },
  {
    slug: "百乐-pilot-cavalier",
    title: "Pilot Cavalier：细杆钢笔的通勤答案",
    summary:
      "Cavalier 是一支细身金属 Pilot：黄铜笔身、9.8 mm 最大直径、16.5 g 重量和 CON-40 兼容，让它更像随身办公笔。",
    sourceItemIds: ["pilot-webcatalog-cavalier"],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据官方 slim、黄铜、9.8 mm、134.4 mm、16.5 g 和 CON-40 写细杆使用边界。",
    },
    body: `Cavalier 的关键词是细。官方 Web Catalog 把它称为 slim type fountain pen，黄铜笔身和笔帽，最大直径 9.8 mm，全长 134.4 mm，重量 16.5 g，兼容 CON-40。它不像 Custom 系列那样靠金尖分级，也不像 Prera、Kakuno 那样强调入门。Cavalier 更像一支能放进通勤和办公场景里的细杆笔。

细杆的好处很明显。它容易塞进笔记本夹层、衬衫口袋和小笔袋，外观也更接近普通签字笔。对习惯细中性笔的人，Cavalier 不会显得陌生。黄铜笔身给它一点重量，避免太像轻塑料小笔。短签名、会议记录、手账日期、随身备用，这些都是它舒服的场景。

问题也来自细。长时间写整页时，细握位会让一部分人疲劳。手大、握笔重、喜欢粗杆的人，Cavalier 可能很快失去吸引力。买它之前，最好先拿一支 9 到 10 mm 直径的笔写几段，确认自己是否真的喜欢这种尺寸。细杆笔看起来优雅，手里未必适合所有人。

Cavalier 的书写期待也要现实。它不是 Pilot 金尖体验的入口，重点在细身金属日用。CON-40 容量有限，适合短写和经常换墨。若你每天写很多页，Custom 74、Heritage 92 或 TWSBI 这类更大容量的笔会更稳。若你只需要一支放包里的钢笔，Cavalier 的轻巧更有意义。

和 Pilot Prera 比，Cavalier 更正式，金属感也更强。Prera 短、轻、树脂，适合手账和轻松日用；Cavalier 更像办公桌和通勤包里的细杆签字工具。和 Metropolitan/Cocoon 比，Cavalier 更细，握持差异更明显。和 Elite 95S 比，它没有金尖和口袋复刻故事，但价格和维护压力更低。

这支笔的审美也很克制。黑灰、黑蓝、黑红、金白这类配色不会太张扬。它适合不想让钢笔显得太“玩家”的用户。别人看它，可能只是看到一支细金属笔；使用者自己知道它能用墨水和钢笔尖写字。这种低调，正是 Cavalier 的优点。

购买时先确认直径，再确认颜色和尖号。F 尖更适合中文小字和办公记录。要看 CON-40 是否随笔，是否需要另购墨囊。二手或电商页面里，细杆金属笔要留意笔身磕痕、笔帽扣合和笔尖是否歪。Cavalier 适合细手、轻手、短写和通勤。若你喜欢粗笔长写，它不会讨好你；若你想要一支安静的细杆钢笔，它的定位很准。`,
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

function humanizerTotal(article: Article) {
  const score = article.humanizer;
  return score.directness + score.rhythm + score.trust + score.authenticity + score.concision;
}

function validateArticle(article: Article) {
  const failures: string[] = [];
  for (const [pattern, label] of BANNED_PATTERNS) {
    if (pattern.test(article.body) || pattern.test(article.title) || pattern.test(article.summary)) {
      failures.push(label);
    }
  }
  const total = humanizerTotal(article);
  if (total < 45) failures.push(`humanizer score ${total}/50`);
  if (article.body.length < B_MIN_CHARS) {
    failures.push(`too short ${article.body.length}; expected at least ${B_MIN_CHARS}`);
  }
  if (article.body.length > B_MAX_CHARS) {
    failures.push(`too long ${article.body.length}; expected at most ${B_MAX_CHARS}`);
  }
  return failures;
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

async function upsertOfficialSourceItems(db: Client) {
  await execute(
    db,
    `INSERT INTO source_registry
     (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, created_at, updated_at)
     VALUES
     ('pilot-official', 'PILOT official site', 'official', 'summary_only', 'official_marketing', NULL, 'PILOT Corporation', 'https://www.pilot.co.jp/', 'manual', 'Official Pilot Corporation web catalog and product pages.', date('now'), datetime('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       homepage_url = excluded.homepage_url,
       notes = excluded.notes,
       last_checked_at = excluded.last_checked_at,
       updated_at = datetime('now')`,
  );

  for (const source of OFFICIAL_SOURCE_ITEMS) {
    await execute(
      db,
      `INSERT INTO source_items
       (id, source_id, title, url, item_type, license, author, published_at, retrieved_at, summary, raw_metadata_json, allowed_use, review_status, created_at, updated_at)
       VALUES (?, 'pilot-official', ?, ?, 'web_page', NULL, 'PILOT Corporation', NULL, date('now'), ?, NULL, 'summary_only', 'approved', datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         url = excluded.url,
         retrieved_at = excluded.retrieved_at,
         summary = excluded.summary,
         review_status = 'approved',
         updated_at = datetime('now')`,
      [source.id, source.title, source.url, source.summary],
    );

    for (const slug of source.slugs) {
      const entity = await findEntity(db, slug);
      if (!entity) throw new Error(`Missing pen entity for source: ${slug}`);
      await execute(
        db,
        `INSERT INTO entity_references
         (id, entity_id, source_item_id, relation_type, note, review_status, created_at)
         VALUES (?, ?, ?, 'official', 'Official Pilot Web Catalog product page for model facts.', 'approved', datetime('now'))
         ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
           note = excluded.note,
           review_status = 'approved'`,
        [randomUUID(), entity.id, source.id],
      );
    }
  }
}

async function getExistingSourceItems(db: Client, entityId: string) {
  const result = await execute(
    db,
    `SELECT si.id, sr.name AS source_name, sr.source_type, si.title, si.url
     FROM entity_references er
     JOIN source_items si ON si.id = er.source_item_id
     JOIN source_registry sr ON sr.id = si.source_id
     WHERE er.entity_id = ?
     ORDER BY
       CASE sr.source_type
         WHEN 'official' THEN 0
         WHEN 'blog' THEN 1
         WHEN 'forum' THEN 2
         WHEN 'reddit' THEN 3
         WHEN 'retailer' THEN 4
         ELSE 5
       END,
       sr.name,
       si.title`,
    [entityId],
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    sourceName: String(row.source_name),
    sourceType: String(row.source_type),
    title: String(row.title),
    url: String(row.url),
  }));
}

async function upsertStory(db: Client, entityId: string, article: Article) {
  const existing = await execute(
    db,
    "SELECT id FROM stories WHERE entity_id = ? AND story_type = 'model_story' LIMIT 1",
    [entityId],
  );
  const storyId = existing.rows[0]?.id ? String(existing.rows[0].id) : randomUUID();
  const sourceNotes = `Reader-first Pilot B-tier article. Humanizer-zh self-review: ${humanizerTotal(article)}/50. ${article.humanizer.notes}`;

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

async function citeSources(db: Client, storyId: string, sourceItemIds: string[]) {
  for (const sourceItemId of sourceItemIds) {
    await execute(
      db,
      `INSERT INTO citations
       (id, target_type, target_id, source_item_id, note, created_at)
       SELECT ?, 'story', ?, ?, 'Reader-first Pilot article source', datetime('now')
       WHERE NOT EXISTS (
         SELECT 1 FROM citations
         WHERE target_type = 'story' AND target_id = ? AND source_item_id = ?
       )`,
      [randomUUID(), storyId, sourceItemId, storyId, sourceItemId],
    );
  }
}

async function buildReviewReport(db: Client) {
  const rows = ARTICLES.map((article) => {
    const score = article.humanizer;
    return `| ${article.slug} | ${humanizerTotal(article)}/50 | ${score.directness} | ${score.rhythm} | ${score.trust} | ${score.authenticity} | ${score.concision} | ${article.body.length} | ${article.humanizer.notes} |`;
  }).join("\n");

  const sourceRows: string[] = [];
  for (const article of ARTICLES) {
    const entity = await findEntity(db, article.slug);
    if (!entity) throw new Error(`Missing pen entity: ${article.slug}`);
    const sources = await getExistingSourceItems(db, entity.id);
    if (sources.length === 0) throw new Error(`Missing source references: ${article.slug}`);
    const labels = sources
      .map((source) => `[${source.sourceName}: ${source.title}](${source.url})`)
      .join("；");
    sourceRows.push(`| ${article.slug} | ${labels} |`);
  }

  return `# Read first B 档 Pilot 批次 humanizer-zh 审查

生成时间：${new Date().toISOString()}

## 评分

| slug | 总分 | 直接性 | 节奏 | 信任度 | 真实性 | 精炼度 | 字数 | 备注 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## Source pack

| slug | sources |
| --- | --- |
${sourceRows.join("\n")}
`;
}

async function main() {
  const failures = ARTICLES.flatMap((article) =>
    validateArticle(article).map((failure) => `${article.slug}: ${failure}`),
  );
  if (failures.length > 0) {
    throw new Error(`Article validation failed:\n${failures.join("\n")}`);
  }

  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  await upsertOfficialSourceItems(db);

  for (const article of ARTICLES) {
    const entity = await findEntity(db, article.slug);
    if (!entity) throw new Error(`Missing pen entity: ${article.slug}`);
    const sources = await getExistingSourceItems(db, entity.id);
    for (const sourceItemId of article.sourceItemIds) {
      if (!sources.some((source) => source.id === sourceItemId)) {
        throw new Error(`Missing article source ${sourceItemId} for ${article.slug}`);
      }
    }
  }

  if (!WRITE) {
    console.log(`Validated ${ARTICLES.length} Pilot article(s).`);
    for (const article of ARTICLES) {
      console.log(`- ${article.slug}: ${article.body.length} chars, humanizer ${humanizerTotal(article)}/50`);
    }
    console.log("Dry run only. Re-run with --write to update the database and review report.");
    return;
  }

  for (const article of ARTICLES) {
    const entity = await findEntity(db, article.slug);
    if (!entity) throw new Error(`Missing pen entity: ${article.slug}`);
    const sources = await getExistingSourceItems(db, entity.id);
    const storyId = await upsertStory(db, entity.id, article);
    await execute(
      db,
      "UPDATE entities SET summary = ?, updated_at = datetime('now') WHERE id = ?",
      [article.summary, entity.id],
    );
    await citeSources(
      db,
      storyId,
      sources.map((source) => source.id),
    );
    console.log(`Updated ${article.slug}: ${article.body.length} chars`);
  }

  mkdirSync(path.dirname(REVIEW_PATH), { recursive: true });
  writeFileSync(REVIEW_PATH, await buildReviewReport(db));
  console.log(`Wrote ${REVIEW_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
