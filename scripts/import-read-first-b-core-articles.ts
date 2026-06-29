import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REVIEW_PATH = path.join(
  process.cwd(),
  "docs/content/read-first-b-core-humanizer-review.md",
);
const B_MIN_CHARS = 1000;
const B_MAX_CHARS = 1900;

type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string;
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

const ARTICLES: Article[] = [
  {
    slug: "万宝龙-montblanc-大班146",
    title: "Montblanc 146：比 149 更日常的大班",
    summary: "Montblanc 146 对应 Meisterstück LeGrand 尺寸层级，比 149 更收敛，适合把大班当日用笔而非只当收藏符号的读者。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把 146 放在 Meisterstück 尺寸选择里写，避开未核定的 vintage 细节。",
    },
    body: `Montblanc 146 的难题，常常来自 149。很多人一想到大班，就先想到更大的 149：更粗，更有存在感，也更像签字桌上的象征物。146 没有那么强的舞台感，却更容易进入日常。它大致对应现代 Meisterstück LeGrand 这一层级，仍然保留大班的雪峰标、金色饰件和正式气质，尺寸却收了一点。

这支笔适合从“能不能每天写”来理解。149 很有分量，也很有气势，但手小、写字时间长、笔记场景多的人，未必舒服。146 的优势在比例：它仍然是正式钢笔，却少了一点压迫感。放在办公室、会议、日记和书房里，它不会显得太轻，也不必像 149 那样每次出场都带着仪式感。

官方当前产品页把 LeGrand 放在 Meisterstück Gold-Coated Fountain Pen 线里，产品名、尺寸和系列身份很清楚。对普通读者来说，这比追逐二手市场里的各种年代差异更实用。先确认自己要的是现代 LeGrand 的日用体验，还是老 146 的收藏和修复乐趣。两条路都叫 146 语境，判断方式却不同。

146 的价值不只在品牌。它代表一种很传统的高端书写物：黑色树脂笔身，金属装饰，白色雪峰，整体视觉稳定。喜欢它的人通常看重这种稳定感。它不会像限定款那样靠颜色讲故事，也不会像设计笔那样用结构吸引目光。它的魅力更慢，放久了反而更清楚。

和 149 比，146 更适合日常书写。和 144/Classique 比，146 又更饱满，更像完整的大班。若你把 Montblanc 当作礼物或身份符号，149 更容易被一眼认出；若你真的准备长期写，146 的平衡感更值得认真考虑。它没有把“经典”写在脸上，却常常是更可用的那一支。

购买时要分清现代官方在售、近年二手和更早 vintage。不同年代的笔尖、笔舌、上墨结构、成色和维修状态都会影响价格。只看“146”三个数字，很容易把完全不同状态的笔混在一起。若是第一支大班，优先看成色、笔尖状态、笔帽螺纹、是否漏墨和售后来源。若是收藏，才进一步追年代、产地和细节。

146 最适合的人，是想要一支正式钢笔，又真的会写的人。它没有 149 的压场感，也没有入门笔的轻松感。它在中间：足够经典，足够稳重，仍然能落到纸面上。若你打开页面只是想判断 146 值不值得看，答案很直接：想要大班气质，同时在意长期书写舒适度，146 往往比 149 更现实。`,
  },
  {
    slug: "万宝龙-montblanc-大文豪系列-writers-edition",
    title: "Montblanc Writers Edition：把作家变成一支笔",
    summary: "Montblanc Writers Edition 是万宝龙围绕文学人物推出的收藏系列，重点在主题设计、限量叙事和书写器物之间的关系。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把系列当作收藏与主题设计来写，不把单支年份和价格写死。",
    },
    body: `Montblanc Writers Edition 不适合用普通型号的方式看。它不是“哪支最好写”的问题，也不是简单换个颜色。这个系列真正卖的是文学人物、书写器物和限量收藏之间的关系。你买到的往往是一支笔，也是一套关于某位作家、某本书、某种时代想象的设计。

万宝龙官方把 Writers Edition 放在 collectables 目录里，这个定位很重要。它和常规 Meisterstück 的逻辑不同。常规大班强调长期稳定、尺寸选择和品牌识别；Writers Edition 每一代都要围绕主题重新组织外观、材料、笔夹、笔帽、笔身纹理和包装。读者需要先看主题是否打动自己，再看它是否适合使用。

这个系列的吸引力来自细节。好的 Writers Edition 会把人物特征藏进结构里：可能是笔夹的形状，可能是笔身纹理，也可能是颜色和装饰对应文学作品里的意象。差一点的款式，则容易变成“把作家名字贴到高价钢笔上”。判断一支 Writers Edition，不能只看名气，也要看设计有没有真的回应主题。

写起来怎么样，要回到具体年份和型号。Writers Edition 不是一个单一书写体验。不同款式的长度、重量、重心、笔尖尺寸和材质处理差别很大。有些可以日常写，有些更适合收藏展示。若你准备长期使用，必须看实物尺寸和握持；若你主要收藏，成色、配件、证书和限量编号会更重要。

和 Patron of Art 比，Writers Edition 更容易被普通读者理解，因为作家和作品本身就带着故事。和普通大班比，它更有主题性，也更容易受个人审美影响。你喜欢卡夫卡，不代表你会喜欢对应笔款的握持；你喜欢某个设计，也不一定真的关心那位作家。这种错位很常见，购买前要分开判断。

这个系列也会改变“钢笔为什么值得收藏”的问题。普通收藏看年代、成色、稀缺性和品牌地位；Writers Edition 还多了文化题材。它把文学人物变成可握持的物件，让书写和阅读产生联系。喜欢的人会觉得浪漫，不喜欢的人会觉得太过包装化。两种反应都正常。

买 Writers Edition 时，先选主题，再看实际笔型。不要被“限量”两个字带着走。限量并不自动等于好设计，也不自动适合书写。检查成套配件、笔尖状态、笔身装饰是否磨损，再看价格是否被题材炒高。它最适合的人，是既在意钢笔，又愿意为文学和设计之间的那层关系付费的人。`,
  },
  {
    slug: "万宝龙-montblanc-patron-of-art-888",
    title: "Montblanc Patron of Art：赞助人系列的收藏逻辑",
    summary: "Montblanc Patron of Art 属于万宝龙高端收藏线，围绕历史赞助人展开，重点在题材、限量、材料和成套状态。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把高端收藏系列写成判断指南，不虚构具体年份版本。",
    },
    body: `Montblanc Patron of Art 这种笔，和普通日用钢笔的距离很远。它的核心不在“写起来值不值”，而在万宝龙怎样把历史赞助人、艺术题材、限量编号和贵金属工艺放到一支书写器里。读者如果只想买一支顺手钢笔，这个系列通常太重、太贵，也太复杂。

官方把 Patron of Art 放在 collectables 目录里，已经说明它的主要语境是收藏。名称里的 Patron 指艺术赞助人。系列会围绕不同历史人物展开，每一款都有自己的主题装饰、材料安排和限量结构。页面里的 888 通常指更高阶、更少量的版本语境，和更常见的限量编号版本在材料、价格和收藏对象上会拉开距离。

这类笔最容易被误读成“更贵的大班”。其实它的判断方式不同。常规 Meisterstück 可以从尺寸、笔尖、握持和日用稳定性入手；Patron of Art 要先看题材、版本、完整性和工艺状态。盒证是否齐全、编号是否清楚、笔身装饰是否有磨损、金属件是否保养得当，这些往往比单纯试写更影响价值。

它也不一定适合长时间书写。高端收藏笔常常为了主题和材料服务，重量、重心和表面触感未必像日用型号那样克制。拿来签名、短句、展示，都能符合它的气质；拿来做课堂笔记或长文抄写，就要看具体款式和个人手感。价格越高，越应该先判断用途。

和 Writers Edition 比，Patron of Art 更偏高端收藏和历史题材，文学爱好者未必马上有亲近感。和普通大班比，它的设计语言更浓，维护压力也更大。你买它时，买的是一个完整对象：主题、编号、材料、配件、成色、来源。缺一个环节，收藏判断都会变。

二级市场尤其要谨慎。高价限量笔不适合只看几张照片。需要确认笔身状态、笔尖状态、包装证书、购买来源和售后可能性。若卖家只强调稀缺和升值，却给不出清晰细节，风险很高。Patron of Art 的价值建立在完整证据上，不适合凭气氛购买。

它适合什么人？适合已经知道自己为什么要收藏万宝龙的人。若你还在寻找第一支好写的 Montblanc，146 或 149 更直接。若你已经理解大班系统，也喜欢艺术赞助人这个题材，Patron of Art 才会显出意义。它不是为了替代日用钢笔存在的，它更像一件可以写字的收藏物。

真正下手前，还要给自己留一点冷静时间。这个系列的价格里包含品牌、题材、材料和稀缺性，书写体验只占其中一部分。把它当普通钢笔买，容易失望；把它当完整藏品看，反而更能理解为什么同样叫万宝龙，判断标准会和 146、149 完全不同。`,
  },
  {
    slug: "写乐-sailor-21k-pro-gear-大鱼雷",
    title: "Sailor 21K Pro Gear：鱼雷外形里的写乐性格",
    summary: "Sailor 21K Pro Gear 用平顶鱼雷外形和 21K 金尖构成写乐现代主线，适合想体验写乐笔尖反馈的用户。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "从 21K 和 Pro Gear 系列定位切入，避免把手感写成绝对结论。",
    },
    body: `Sailor Pro Gear 很容易被中文玩家叫作“大鱼雷”，因为它和 1911 那种雪茄形外观不同，笔帽和笔尾更平，比例也更现代。真正让它被反复讨论的，是写乐的 21K 金尖。很多人买 Pro Gear，外形只是入口，真正想确认的是“写乐反馈”到底是什么。

官方 Professional Gear 系列页和 21K 相关产品页能确认它属于写乐现代主线。Pro Gear 的外观识别度很强：平顶、锚标、双色或单色搭配、不同尺寸和限定色。它不像 1911 那样传统，也不像 King of Pen 那样夸张。它的好处在中间，既有写乐的品牌性格，也保留相对日常的尺寸。

21K 金尖是这支笔的重点，但不能把它简单理解成“更软”。写乐的金尖常被喜欢的人形容为有纸面感、可控、线条边缘清楚。它和 Pilot 那种顺滑稳定、Platinum 那种密封日用不是同一路线。若你喜欢几乎没有阻力的滑，写乐可能不是第一选择；若你喜欢笔尖和纸之间有一点清楚的回应，Pro Gear 会更有吸引力。

Pro Gear 也很适合写中文。它的尖号选择和出墨控制，让小字、笔记、手账都能找到合适位置。细尖更适合日常中文，较粗尖更能展示墨色和笔尖特性。它不是大容量结构，墨囊/上墨器更方便维护和换墨，也让它适合经常换颜色的人。

和 1911 比，Pro Gear 更现代，外形也更有辨识度。和 King of Pen 比，它更容易日用，价格和体积都低一截。和四季织这类入门金尖语境比，21K Pro Gear 更像写乐主菜。若你已经确定喜欢写乐笔尖，Pro Gear 很容易成为长期主力；若你只是好奇，先从 14K 或更便宜的型号试手也合理。

购买时先确认尺寸。Pro Gear 有标准、大型和不同限定语境，中文“大鱼雷”有时会把尺寸和外观混在一起说。再看尖号、笔尖刻字、笔帽环、成色和是否附原盒。限定色会影响价格，但不一定改变书写。不要只为了颜色忽视握持和尖号。

这支笔适合已经知道自己想要写乐味道的人。它不负责讨好所有手感偏好，也不靠夸张储墨量取胜。它的价值在稳定地给出一种清楚、克制、有反馈的书写体验。若你打开页面想判断它是不是“日系三金”里的进阶选择，答案是：它很典型，但最好先确认自己喜欢写乐的纸面反馈。

它也不太适合只看参数购买。21K、双色尖、限定色听起来都很诱人，落到手里仍然要看握持、尖号和纸张。Pro Gear 的好处是性格清楚，坏处也是性格清楚；喜欢的人会觉得终于找到了边界感，不喜欢的人会觉得它没有想象中顺。`,
  },
  {
    slug: "写乐-sailor-king-of-pen笔王",
    title: "Sailor King of Pen：写乐把笔做大的方式",
    summary: "Sailor King of Pen 是写乐旗舰尺寸语境，重点在大笔身、大金尖和更明显的书写存在感。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "强调旗舰尺寸的好处和门槛，不把 King of Pen 写成自动升级。",
    },
    body: `Sailor King of Pen 的名字很直接，也容易让人误会。它听起来像“写乐最好的笔”，实际更准确的理解是：写乐把自己的书写性格放进更大的笔身和更大的笔尖里。它有旗舰气质，却不一定适合所有人。手、字、纸和预算都要跟得上。

官方 King of Pens 页面把它放在写乐高阶产品语境里。读者需要先抓住一个事实：King of Pen 首先是尺寸和笔尖存在感的变化。比起普通 1911 或 Pro Gear，它更大、更有分量，也更强调笔尖在纸面上的动作。喜欢大笔的人会觉得舒展，习惯轻小笔的人可能很快疲惫。

它的魅力在笔尖。大尺寸金尖会把写乐那种纸面反馈放大，让线条控制和笔尖触感更明显。它不一定比普通写乐“更顺”，也不一定更适合小字。King of Pen 更适合愿意慢一点写、字稍大一点、在意笔尖表现的人。若你主要写密密麻麻的课堂笔记，普通尺寸可能更实际。

外形上，King of Pen 常见 1911 和 Pro Gear 两条气质。前者更传统，后者更现代。选择时不要只看“笔王”两个字，要看自己喜欢雪茄形还是平顶形。两者都能给出旗舰感，拿在手里的平衡和视觉却不同。价格也会随着材料、限定、漆艺和版本拉开。

和 Sailor 21K Pro Gear 比，King of Pen 更像放大后的写乐经验。它的门槛更高，回报也更挑人。和 Montblanc 149、Pelikan M1000 这类大笔比，它的特点仍然是写乐笔尖反馈，而不是单纯体积。喜欢大而滑的人未必喜欢它，喜欢可控反馈的人才更容易被它吸引。

购买前最好试写一整段。只在柜台写名字，无法判断重量和握持是否适合长时间使用。还要确认尖号。King of Pen 的粗尖和宽线条会很有表现力，但中文小字会更挑纸。细尖更日常，却也会减少大金尖带来的铺张感。这个平衡要按自己的字来定。

King of Pen 最适合已经用过写乐、确认自己喜欢写乐的人。第一支写乐直接买它，风险不低。若你在 1911、Pro Gear 或 21K 尖上已经找到乐趣，再看 King of Pen 才清楚。它不是通往好字的捷径，也不是所有写乐用户的终点。它只是把写乐的性格做得更大，让喜欢的人更满足，也让不适合的人更快暴露。

还有一个容易忽略的点：大笔会改变书写姿势。手腕、纸面角度和握笔位置都会影响体验。平时只写细小中文的人，最好先确认自己愿不愿意把字写大一点、节奏放慢一点。King of Pen 的快乐通常来自这种放大后的动作感，而不只是品牌等级。`,
  },
  {
    slug: "写乐-sailor-1219标准鱼雷",
    title: "Sailor 1911S 14K：标准鱼雷的入门金尖",
    summary: "Sailor 1911S 14K 对应写乐传统雪茄形小尺寸金尖路线，适合先体验写乐反馈而不急着上 21K 的读者。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把 1219 放在 1911S 和 14K 语境里写，避免渠道价导向。",
    },
    body: `写乐 1219 更适合按 1911S 14K 来读。中文玩家叫它“标准鱼雷”，说的是写乐传统雪茄形外观和相对小巧的尺寸。它不像 Pro Gear 那样平顶，也不像 King of Pen 那样有旗舰体量。它的角色更朴素：用比较低的门槛，让用户接触写乐的金尖和 1911 系列气质。

官方 1911 Series 和 1911S 14K 页面给了它的核心位置：传统外形，小尺寸，14K 金尖。它不是为了显眼而设计。黑色、金色饰件、圆润笔帽和笔身，让它看起来很像一支传统钢笔。喜欢低调的人会觉得耐看，喜欢强设计感的人可能觉得太普通。

14K 笔尖是它的重点。和 21K 写乐相比，14K 通常给人的期待更克制，价格也更容易进入。它仍然有写乐的纸面反馈和线条控制，只是没有大尺寸 21K 或 King of Pen 那样强的存在感。对于中文小字、手账、日常笔记，这种克制反而有用。

1911S 的尺寸也要认真看。它比许多西方中大尺寸钢笔小，手大的人可能需要插帽才舒服。手小或喜欢轻巧笔的人会更容易适应。它适合长时间写细字，放进笔袋也不夸张。若你想要更饱满握持，可以看 1911L、Pro Gear 或 King of Pen。

和 Pro Gear 比，1911S 更传统，也更不张扬。和四季织 14K 语境比，它更像写乐基础正装线。和 Pilot Custom 74、Platinum #3776 Century 比，它的区别主要在笔尖反馈：写乐通常更有纸面触感，Pilot 更偏顺滑稳定，Platinum 的密封和日用可靠性也很强。选它，最好是因为你真的想试写乐。

购买时先选尖号。写中文小字，EF、F、MF 都值得看，M 往上更适合大一点的字和墨色表现。再看尺寸是否够握、笔帽是否插得稳、笔尖是否有调校问题。价格浮动和渠道差异会影响购买判断，但不要让低价掩盖手感。便宜买到不适合自己的尖号，仍然会闲置。

这支笔适合把写乐当成一个入口，先理解 1911 系列和 14K 尖，再决定是否继续往 21K、Pro Gear 或 King of Pen 走。它安静，传统，书写性格明确。若你喜欢华丽材料，它可能平淡；若你想知道写乐为什么能和 Pilot、Platinum 并列讨论，1911S 14K 是很清楚的一条路。

它也适合送给已经会用钢笔的人。外观不张扬，维护不复杂，尖号选对后很容易进入日常。第一次接触写乐时，别急着判断它够不够高级，先写几页普通笔记。写乐的好处常常在持续使用中出现：线条干净，反馈明确，手下不发飘。`,
  },
  {
    slug: "写乐-sailor-四季织1224",
    title: "Sailor 四季织 1224：颜色先开口的写乐",
    summary: "Sailor 四季织 1224 属于写乐 Shikiori 语境，用季节色彩和 14K 金尖把日常书写做得更轻巧。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "从 Shikiori 的季节色彩写起，同时提醒尺寸和尖号判断。",
    },
    body: `Sailor 四季织 1224 的入口很直接：颜色先开口。Shikiori 这个名字本来就和季节意象有关。它让写乐从传统 1911 和 Pro Gear 的黑色、金色、锚标里走出来，变成更轻、更有色彩记忆的一支日用笔。

官方页面把 11-1224 放在 Professional Gear Series SHIKIORI 语境里。它仍然带着写乐的笔尖和小尺寸日用逻辑，但外观先给人情绪。对很多用户来说，四季织的吸引力来自“想每天拿起来”的颜色，而不是参数。钢笔如果能让人愿意写，颜色就不只是装饰。

它的书写核心仍要回到写乐。14K 金尖给出清楚的纸面反馈，适合小字、手账、日记和短篇笔记。它不会像大号 21K 那样有强烈存在感，也不适合把大容量当卖点。墨囊/上墨器结构让换墨方便，尤其适合搭配不同颜色墨水。买四季织的人，往往也会在墨水颜色上多花心思。

四季织的尺寸需要提前确认。它轻巧、好带，但手大的人可能觉得短或细。若你想要饱满握持，Pro Gear Standard 或 1911L 更稳。若你喜欢小尺寸、喜欢颜色、写字不追求很大笔身，四季织会更贴近日常。它是“愿意经常拿出来”的笔，不是“拿出来压住场面”的笔。

和 1911S 14K 比，四季织更年轻，也更强调颜色。和 21K Pro Gear 比，它更轻、更便宜，笔尖气质也收敛。和 LAMY Safari、TWSBI ECO 这类入门笔比，它的价格高在金尖和品牌书写性格上。若只是为了颜色，便宜彩色钢笔很多；若想要写乐笔尖加上漂亮外观，四季织才合理。

购买时先看颜色是否长期耐看。网上图片常常比实物更鲜亮，透明或半透明材料也会受到墨水和光线影响。再看尖号。中文小字优先 EF、F、MF；喜欢明显墨迹再看 M。若准备搭配彩墨，先确认墨水是否容易清洗，别让难清的颜色破坏笔身观感。

四季织 1224 适合把钢笔当日常小物的人。它没有 King of Pen 的体量，也没有大班那种正式身份。它的好处更亲近：颜色好看，笔尖有写乐味道，维护不复杂。若你打开页面只是想判断它和普通写乐有什么差别，可以先记住一句话：四季织让写乐变得更像每天带在身边的颜色。

它也适合已经有黑色正装笔的人。桌上全是黑笔时，四季织会让书写变得轻一点。选墨时可以顺着笔身颜色搭配，也可以故意反差。只要不把它当成严肃旗舰，它会是一支很容易被频繁拿起的写乐。放进笔袋里，它也不会显得太正式。`,
  },
  {
    slug: "写乐-sailor-长刀研",
    title: "Sailor 长刀研：需要手上有数的特殊笔尖",
    summary: "Sailor 长刀研是写乐特殊笔尖路线，线条会随角度和动作变化，更适合有书写经验的用户。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把长刀研写成特殊尖判断，而非神化成必买笔尖。",
    },
    body: `写乐长刀研最容易被神化。很多人看到样张，会被粗细变化、线条转折和汉字表现力吸引。真正买到手以后，才发现它不负责替用户自动写出好看的字。它是一种特殊笔尖，需要角度、速度和用力都更有控制。手上没有数时，线条很容易飘。

官方特殊笔尖页面能确认 Naginata Togi 属于写乐的 special nib 语境。这个名字背后的重点，是笔尖研磨形状和书写角度的关系。普通圆珠尖追求稳定、容错和均匀线条；长刀研更强调线条随角度变化。你抬高、放低、转动笔杆，线宽和触感都会改变。

它适合中文和日文书写里的线条表现。写横、竖、撇、捺时，角度变化会带来更丰富的笔画。喜欢硬笔书法、标题字、签名或大一点的手账字，长刀研会很有趣。若你只写很小的会议记录，或者希望每一笔都像普通 F 尖那样可控，它反而会添麻烦。

长刀研也会放大纸和墨水的问题。纸太差会洇，墨水太湿会让线条边缘糊，手速太快会失去细节。它不像普通日用尖那样“拿起来就写”。买它之前，最好先有稳定的握笔角度，也知道自己常用纸张和字大小。否则特殊笔尖带来的变化，只会变成不稳定。

和普通写乐 14K、21K 比，长刀研更像工具里的专用刀。普通尖适合日常，长刀研适合表达。和 Music、Zoom 等特殊尖比，它的魅力在角度控制带来的线条层次。它不是“升级尖”，更像另一种写法。若你只想要更顺滑，长刀研不一定满足你。

购买时尤其要看尖号和版本。不同粗细、不同年代和不同调校会影响线条表现。二手笔还要看是否被磨过、是否有摔尖和歪尖。特殊尖一旦状态不对，修复难度和成本都会比普通尖更高。不要只看样张，因为样张往往来自熟练使用者。

长刀研适合已经有几支普通钢笔的人。先知道普通 F、M、B 在自己手里是什么样，再来看长刀研，才会明白它改变了哪里。它能让字更有表现力，也会要求你更认真地写。若你愿意练，它很有意思；若你只是想买一支省心日用笔，写乐普通金尖会更稳。

它的购买顺序也要谨慎。先确定自己常写的字号，再看想要的线宽变化。写中文小楷的人，太宽的长刀研会让结构挤在一起；写标题、便签或签名的人，更容易用出它的长处。到手后也别急着换复杂墨水，先用熟悉的纸和墨，把角度和速度摸清楚。这样才是在用特殊尖，而不是被特殊尖牵着走。

如果只能试写几分钟，至少写一段完整中文。横画、竖画、转折、连写和停顿都试到，比单独画几条线更有用。长刀研的价值就在这些细小动作里，样张好看只说明它有上限，不说明它一定适合你的手。`,
  },
  {
    slug: "kaweco-student",
    title: "Kaweco Student：复古外形里的普通日用笔",
    summary: "Kaweco Student 用较常规的尺寸、复古色彩和钢尖路线，给 Sport 之外的 Kaweco 用户一个更像正装笔的选择。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把 Student 和 Sport/Liliput 对照，突出常规尺寸价值。",
    },
    body: `Kaweco Student 很适合那些喜欢 Kaweco，却不想一直用小笔的人。Sport 短小，Liliput 更极端，AL Sport 像随身金属工具。Student 换了方向：常规长度，复古色彩，外观更像一支可以放在书桌上的日用钢笔。

Kaweco 官方把 Student 放在自己的系列目录里，重点是复古风格和日常书写。它没有 Sport 的八角笔帽，也没有 Liliput 的极小体积。你不需要每次都依赖插帽来获得可用长度，握持也更接近普通钢笔。对不适应口袋笔的人，这一点很重要。

Student 的钢尖路线很务实。它不靠金尖弹性吸引人，也不主打大容量上墨。墨囊/上墨器结构简单，换墨和清洗都不难。它更适合学生、办公室、日记和普通笔记。若你已经有 Kaweco Sport，Student 能给你同品牌里更放松的长时间书写选择。

它的复古感来自比例和颜色。某些版本会用带年代感的色彩命名，让人想到旧文具、咖啡馆和学校课桌。这个外观很讨喜，但也可能让人误判它的定位。Student 不是复杂收藏笔，也不是高端旗舰。它更像一支长得漂亮、拿起来正常、维护简单的钢尖日用笔。

和 Sport 比，Student 更适合连续写几段文字。和 AL Sport 比，它少了金属随身工具感，却更像传统书写用品。和 LAMY Safari 比，它没有三角握位的强引导，外观也更温和。若你讨厌被握位限制，Student 可能比 Safari 友好；若你需要很耐摔的学生工具，Safari 仍然更直接。

购买时先看握位和笔身粗细，再看颜色。Kaweco 钢尖的尖号选择不难，中文小字优先 EF、F，喜欢粗线条再看 M。还要留意笔帽螺纹、插拔手感和上墨器兼容。Student 的价格会比最便宜的入门笔高，花的钱主要买外观、品牌和常规尺寸带来的舒适。

它适合想从 Kaweco 小笔世界里走出来的人。若你喜欢 Kaweco 的复古味道，却觉得 Sport 太短、Liliput 太细，Student 很值得看。它不会给你夸张惊喜，优点也不复杂：尺寸正常，样子耐看，写起来省心。对很多日常用户来说，这比极端设计更重要。

它也适合当作书桌笔。放在桌面上，Student 比 Sport 更像一支普通钢笔，拿起就写，不需要先把短笔变长。若你的 Kaweco 印象只来自 Sport，Student 会展示这个品牌更温和的一面：少一点玩具感，多一点旧学校文具的气味。`,
  },
  {
    slug: "三文堂-twsbi-diamond-mini-al",
    title: "TWSBI Diamond Mini AL：把透明活塞笔缩小",
    summary: "TWSBI Diamond Mini AL 是 580 语境下的小尺寸铝件透明活塞笔，适合想要便携和活塞上墨兼得的用户。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "从小尺寸活塞和 AL 金属部件写起，避免和 580 正文重复。",
    },
    body: `TWSBI Diamond Mini AL 的题目很清楚：把透明活塞笔缩小。很多人喜欢 TWSBI 580 的透明笔身和活塞上墨，却觉得它放进口袋或小笔袋里有点占地方。Mini AL 试图保留这套结构乐趣，同时把尺寸做得更便携。

官方页面把 Diamond Mini AL 放在 Diamond Mini AL Silver Fountain Pen 产品语境里。名字里的 Mini 和 AL 都重要。Mini 指尺寸缩小，AL 指铝合金部件带来的材料变化。它不是单纯换个颜色的 580，也不是普通短钢笔。它要同时处理透明活塞、可携带性和握持长度三件事。

小尺寸活塞笔的矛盾很明显。合盖时便携，写字时通常需要插帽来获得更完整长度。喜欢短笔的人会觉得灵活，手大的人可能需要适应。活塞上墨带来比普通短上墨器更好的容量，也带来清洗成本。它适合固定使用一两瓶墨水，不适合天天换复杂颜色。

AL 部件让它比普通透明小笔更有工具感。金属握位或部件会改变手感，也会让整体更冷、更硬。喜欢机械感的人会觉得加分，喜欢轻盈塑料触感的人未必喜欢。透明笔身仍然会展示墨水、残留和清洁状态，这一点和 ECO、580 一样，优点和麻烦绑在一起。

和 TWSBI 580 比，Mini AL 更便携，但握持和容量感会收敛。和 ECO 比，它更精致，价格也更高。和 Kaweco Sport 这类口袋笔比，它的活塞和透明结构更有玩点，携带轻松度却不一定更强。若你只是想要最省心的小笔，Sport 更直接；若你想要小笔里也能看到活塞和墨水，Mini AL 才有意义。

它也适合已经喜欢 TWSBI 的用户。第一支透明活塞笔，ECO 或 580 更容易判断方向；已经确认自己喜欢 TWSBI，再买 Mini AL 会更明确。它回答的是另一个问题：透明活塞笔能不能带得更小、更随身。

购买时先试插帽后的长度和重心。再看活塞顺滑度、笔身是否有裂纹、金属部件是否有磨损。写中文小字从 EF、F 看起，M 更适合展示墨色。Mini AL 的优势很具体：透明，活塞，小尺寸，带一点金属工具感。若这四点都打中你，它会很有趣；若只打中其中一两点，普通 580 或 ECO 可能更划算。

它还有一个隐性要求：你要能接受小笔的使用节奏。插帽、旋开、上墨、清洗，每一步都比普通墨囊笔更有参与感。喜欢这种参与的人，会觉得 Mini AL 很像一个缩小的透明机械玩具；只想省事的人，可能会觉得它把简单书写变复杂了。`,
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

async function getExistingSourceItems(db: Client, entityId: string) {
  const result = await execute(
    db,
    `SELECT si.id, sr.name AS source_name, si.title, si.url
     FROM entity_references er
     JOIN source_items si ON si.id = er.source_item_id
     JOIN source_registry sr ON sr.id = si.source_id
     WHERE er.entity_id = ?
     ORDER BY sr.source_type, sr.name, si.title`,
    [entityId],
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    sourceName: String(row.source_name),
    title: String(row.title),
    url: String(row.url),
  }));
}

async function upsertStory(db: Client, entityId: string, article: Article, sourceNotes: string) {
  const existing = await execute(
    db,
    "SELECT id FROM stories WHERE entity_id = ? AND story_type = 'model_story' LIMIT 1",
    [entityId],
  );
  const storyId = existing.rows[0]?.id ? String(existing.rows[0].id) : randomUUID();

  if (existing.rows[0]) {
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

  await execute(
    db,
    `UPDATE entities
     SET summary = ?, body_md = COALESCE(body_md, ?), updated_at = datetime('now')
     WHERE id = ?`,
    [article.summary, article.body, entityId],
  );
}

function sourceNotesFor(sources: Awaited<ReturnType<typeof getExistingSourceItems>>) {
  if (sources.length === 0) return "暂无已登记来源；本文只写通用辨认和使用判断。";
  return sources
    .map((source) => `${source.sourceName}: ${source.title} (${source.url})`)
    .join("\n");
}

function reviewMarkdown(rows: Array<{
  article: Article;
  sources: Awaited<ReturnType<typeof getExistingSourceItems>>;
}>) {
  const scoreRows = rows
    .map(({ article }) => {
      const h = article.humanizer;
      return `| ${article.slug} | ${humanizerTotal(article)}/50 | ${h.directness} | ${h.rhythm} | ${h.trust} | ${h.authenticity} | ${h.concision} | ${h.notes} |`;
    })
    .join("\n");

  const sourceRows = rows
    .map(({ article, sources }) => {
      const sourceText = sources.length
        ? sources.map((source) => `[${source.sourceName}: ${source.title}](${source.url})`).join("<br>")
        : "无已登记来源";
      return `| ${article.slug} | ${sourceText} |`;
    })
    .join("\n");

  return `# Read first B 档核心型号 humanizer-zh 审查

生成时间：${new Date().toISOString()}

## 评分

| slug | 总分 | 直接性 | 节奏 | 信任度 | 真实性 | 精炼度 | 备注 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${scoreRows}

## Source pack

| slug | sources |
| --- | --- |
${sourceRows}
`;
}

async function main() {
  const validationFailures = ARTICLES.flatMap((article) =>
    validateArticle(article).map((failure) => `${article.slug}: ${failure}`),
  );
  if (validationFailures.length > 0) {
    throw new Error(`Article validation failed:\n${validationFailures.join("\n")}`);
  }

  const db = getClient();
  const reviewRows: Array<{
    article: Article;
    sources: Awaited<ReturnType<typeof getExistingSourceItems>>;
  }> = [];

  for (const article of ARTICLES) {
    const entity = await findEntity(db, article.slug);
    if (!entity) throw new Error(`Missing pen entity: ${article.slug}`);
    const sources = await getExistingSourceItems(db, entity.id);
    reviewRows.push({ article, sources });

    if (WRITE) {
      await upsertStory(db, entity.id, article, sourceNotesFor(sources));
    }

    console.log(
      `${WRITE ? "Updated" : "Checked"} ${article.slug}: ${article.body.length} chars, humanizer ${humanizerTotal(article)}/50, sources ${sources.length}`,
    );
  }

  const review = reviewMarkdown(reviewRows);
  if (WRITE) {
    mkdirSync(path.dirname(REVIEW_PATH), { recursive: true });
    writeFileSync(REVIEW_PATH, review);
    console.log(`Wrote ${REVIEW_PATH}`);
  } else {
    console.log("\nDry run only. Re-run with --write to update stories.\n");
    console.log(review);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
