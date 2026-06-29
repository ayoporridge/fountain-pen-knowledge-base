import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REVIEW_PATH = path.join(
  process.cwd(),
  "docs/content/read-first-b-mainstream-humanizer-review.md",
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
  [/后续应|可以作为|应把它放在|方便读者确认|资料不足|当前档案|当前页面|研究队列/, "策展/维护提示语"],
];

const ARTICLES: Article[] = [
  {
    slug: "百利金-pelikan-m200",
    title: "Pelikan M200：先从活塞和钢尖认识百利金",
    summary:
      "Pelikan M200 是理解百利金 Classic/Souveran 路线的入门台阶：小巧树脂笔身、镀金钢尖和差动活塞，让它比普通墨囊笔更有结构感。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Goldspot 的 M200 页面写镀金钢尖、树脂笔身和 Pelikan 差动活塞，避免写成金尖旗舰。",
    },
    body: `Pelikan M200 适合从活塞开始读。很多入门钢笔用墨囊或上墨器，M200 把百利金最有识别度的差动活塞放进了较小、较亲民的 Classic 系列里。Goldspot 的页面写到绿色大理石树脂笔杆、黑色树脂笔帽、镀金不锈钢笔尖和 Pelikan piston mechanism，这些信息足够说明它的身份：它是百利金活塞体系的入门门槛。

M200 的笔尖是钢尖，这一点很重要。它给你百利金的外形、上墨方式和轻巧尺寸，却不会给你 M400、M800 那种金尖定位。好处是维护压力小，换尖成本相对低，也更适合把它当作真正日用笔。若你只是想理解百利金为什么总和活塞上墨联系在一起，M200 比直接买高端 Souveran 更稳。

这支笔的体积也偏小。手小、写中文小字、喜欢轻笔的人会容易接受。手大或喜欢粗重笔身的人，可能会觉得它太轻。小尺寸还有一个实际好处：放在书桌、笔袋或通勤包里都不笨重。它不会像 M1000 那样要求你认真找握持位置。

M200 的大容量来自活塞，不适合频繁换墨。你灌满一支后，最好让它陪一瓶墨写一段时间。透明墨窗能帮助观察余墨，清洗比墨囊笔慢一些。喜欢每天换颜色的人，要提前接受这个成本。喜欢固定一瓶蓝黑、长期写笔记的人，会更能感到活塞的舒服。

和 M400 比，M200 少了 14K 金尖，也少了一层 Souveran 的正式感。和 TWSBI ECO、580 比，M200 更传统，少了透明工具感，多了百利金家族的老派比例。和 LAMY Safari、Pilot Prera 这类入门笔比，M200 的上墨系统更有玩味，价格也更高。

M200 还有一个适合入门的地方：它能让你先判断自己是否喜欢百利金的轻巧和偏湿书写。喜欢之后，再往 M400、M600 走才有意义。若你发现自己更喜欢硬尖、细线和频繁换墨，停在 M200 也不亏。

购买时先确认版本和笔尖。M200 有不少颜色和特别款，外观差异会影响价格，核心仍然是小尺寸、钢尖、活塞。二手 M200 要看活塞是否顺、笔身是否有裂纹、笔尖是否被打磨过。若你想要第一支百利金，M200 是很诚实的入口：它不会假装自己是旗舰，却能把活塞、墨窗和品牌比例交到你手里。写过它以后，再看 M400、M800，会更清楚自己是在为金尖、尺寸还是材料付钱。若预算有限，先买 M200 也比盲目追大号金尖更理性。它也更适合日常消耗。`,
  },
  {
    slug: "百利金-pelikan-m400",
    title: "Pelikan M400：小号 Souveran 的金尖日用",
    summary:
      "Pelikan M400 把 Souveran 的条纹树脂、活塞上墨和 14K 金尖放进较小尺寸，适合喜欢轻巧经典笔型的人。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Cult Pens 的 M400 页面写 14K/585 金尖、差动活塞、墨窗、尺寸和轻量定位。",
    },
    body: `Pelikan M400 的好处，常常要和尺寸一起看。Cult Pens 的页面把它写成较小尺寸的 Souveran，使用 14ct/585 双色金尖、差动活塞、透明墨窗，闭合长度约 123 mm，重量约 16 g。它不像 M800 那样稳重，也不像 M1000 那样宽大。M400 的性格在轻、短、传统。

对很多人来说，百利金最迷人的部分是活塞和条纹笔杆。M400 也有这套语言：旋尾上墨，墨窗看余量，条纹树脂和金色装饰带来老派金笔气质。它的目标很克制：把一个成熟笔型缩到更适合日常的小尺寸。手小、写字轻、喜欢细杆的人，会比大手用户更容易喜欢它。

14K 金尖让 M400 和 M200 拉开距离。M200 的钢尖更直接，M400 的金尖会更细腻，也让整支笔进入更正式的价格区间。百利金常给人“下水偏丰”的印象，具体仍要看尖号、墨水和纸张。写中文小字时，EF、F 更稳；喜欢签名和墨色，可以看 M 或 B。不要只按欧美尖号想象线宽，最好看实写样张。

M400 适合固定使用一瓶墨。活塞容量和墨窗会鼓励你长期书写，而不是三天两头换颜色。清洗需要耐心，尤其是换高饱和墨水之后。若你喜欢频繁试墨，M400 的优雅会变成麻烦；若你有常用蓝黑或黑色墨，它会很安静地陪你写很多页。

和 M200 比，M400 的升级集中在金尖和 Souveran 定位。和 M800 比，它轻很多，握持更小，长写时手腕负担小，但少了大笔的稳定感。和 Pilot Custom 74、Platinum #3776 比，M400 的区别在上墨和品牌气质：日系金尖更强调笔尖反馈差异，M400 更强调活塞和经典外观。

M400 适合放在“轻巧金尖活塞笔”这个位置。它比很多现代金属笔更温和，也比大号旗舰更容易日常携带。若你的写字场景以手账、信纸、读书摘录为主，它会比单纯签字更能发挥。若只想在办公室偶尔签名，Sonnet 或 IM 这类墨囊笔反而省事。

买 M400 前要确认自己喜欢小笔。很多人看照片会误以为它比实际更大，拿到手才发现尺寸接近轻巧日用。二手笔要检查活塞顺滑、笔尖铱点、笔帽螺纹和条纹笔杆是否有裂纹。M400 适合喜欢传统金笔，又不想被大尺寸压住的人。它不是百利金最大、最有气势的一支，却可能是最容易每天拿起来的一支。若你平时写 A5 本和小格纸，它的轻巧会比大笔更实用。通勤携带也更没有负担。小手会更占优势。`,
  },
  {
    slug: "百利金-pelikan-m1000",
    title: "Pelikan M1000：大号百利金的慢书写",
    summary:
      "Pelikan M1000 是 Souveran 体系里的大尺寸活塞金笔，宽笔身、柔软大金尖和 1.5 ml 左右容量让它更适合慢写和长写。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Goulet 的 M1000 页面写差动活塞、大尺寸、约 33 g 总重和较软笔尖评价，保留使用边界。",
    },
    body: `Pelikan M1000 不适合用“升级版 M800”一句话带过。Goulet 的页面列出它的差动活塞、树脂笔身、约 146 mm 闭合长度、约 33 g 总重和 1.51 ml 左右墨量，还提到它的大号 18K 金尖。拿到手后，价格会退到后面，尺寸和节奏先出来。

M1000 的笔尖很大，也常被用户描述为更柔软。这个柔软不等于可以随便当弹性尖压。它更适合轻手慢写，让笔尖在纸面上有一点呼吸感。手重、写得快、喜欢硬尖的人，可能会觉得它不够可控。写中文小字时尤其要慎选尖号，M1000 的线条和出墨都可能比想象中更宽。

大笔身带来舒适，也带来筛选。手大、喜欢宽握位、每天坐在桌前写长文的人，会更容易接受 M1000。手小或经常带出门的人，可能很快觉得它笨重。它不像 M400 那样轻巧，也不像 M800 那样在尺寸和重量之间做平衡。M1000 的性格更明确：大、软、慢。

差动活塞是百利金的核心之一。M1000 的墨量足够长写，适合固定搭配一瓶稳定墨水。它不适合频繁换墨，也不适合只在会议上签几个字。灌满之后，让它写日记、长信、摘抄和桌面笔记，才会显出意义。若你只是想试百利金活塞，M200 或 M400 的门槛低得多。

和 M800 比，M1000 最大差别不只在尺寸。M800 更像稳重的日常旗舰，M1000 更像一支需要使用者配合节奏的大笔。M800 的笔尖通常更受控，M1000 更有弹性和余量。选择时不要只看价格级别，要看自己的手和写字速度。

它也不一定适合插帽书写。大笔插帽后会变得很长，重心变化明显，很多人会选择不插帽使用。放在书桌上，它像一件专门为长写准备的工具；塞进随身笔袋，它的体积会提醒你这不是轻便路线。

墨水选择也要保守。大容量和偏丰出墨会放大墨水性格，太洇的墨水会让纸张吃不消。第一次使用可以先配熟悉的蓝黑或黑色，等确认线宽和出墨后，再尝试更有表现力的颜色。

购买 M1000 最好试写。至少要确认握持直径、笔尖软硬、线宽和纸张匹配。二手笔要看活塞是否顺、笔尖是否被压过、笔身有无裂纹。它很容易被当成“终点笔”，可真正适合的人并不多。喜欢大笔、轻手、慢写的人会很享受；只想买一支高级日用笔的人，M800 或 M400 可能更稳。M1000 的魅力在于它要求你放慢，不急着写完。买之前也要确认自己的纸张承受得住它的出墨。纸张太薄会很快暴露问题。墨水也别选太洇的。`,
  },
  {
    slug: "白金-platinum-curidas",
    title: "Platinum Curidas：白金对按动钢笔的回答",
    summary:
      "Curidas 是白金的伸缩钢笔：按动开合、透明笔身、钢尖和可拆笔夹，让它站在 Capless 之外的另一条快捷书写路线上。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Goldspot 的 Curidas 页面写伸缩钢尖、密封小仓和可拆笔夹，避免把它和 Capless 简单合并。",
    },
    body: `Curidas 很容易被拿来和 Pilot Capless 比，但它应该先被看成白金自己的按动钢笔。Goldspot 的页面强调 retractable、stainless steel nib、clip removable，并提到笔尖收起后进入一个帮助保湿的小仓。它的核心问题很清楚：怎样让钢笔像圆珠笔一样按一下就写。

按动结构的好处不用解释太多。会议、课堂、站着记录、随手批注，普通旋帽钢笔会慢半拍。Curidas 让你按下去就能写，写完再按回去。这个动作比拔帽更快，也减少了找地方放笔帽的麻烦。它适合碎片记录，不一定适合一口气写长文章。

Curidas 的透明笔身让结构被看见。它不像 Capless 那样把机构包进更传统的外壳，而是把内部动作变成外观的一部分。喜欢机械感的人会觉得有趣，喜欢简洁高级感的人可能会嫌它太忙。钢尖也让它和金尖 Capless 拉开定位：价格和维护压力低一些，笔尖期待也要放在钢尖区间。

可拆笔夹是 Curidas 很实际的设计。伸缩钢笔常有一个问题：笔夹可能出现在握持区，影响手指。Curidas 允许用户拆下笔夹，给握持更多自由。代价是外观和携带方式会改变。若你依赖笔夹插口袋，拆掉它会不方便；若你握持正好被笔夹挡住，拆掉才是正确选择。

和 Platinum #3776 Century 比，Curidas 的价值不在笔尖层级，而在开合方式。#3776 是传统旋帽金尖，适合坐下来写；Curidas 是按动钢尖，适合频繁拿起放下。和 Pilot Capless/Decimo 比，Curidas 更透明、更工程化，也更需要用户接受体积和机构感。

这支笔也会让维护变得更具体。伸缩结构意味着墨囊、converter、前端密封和笔尖通道都要保持干净。若你习惯把钢笔放很久不写，按动便利会被干尖问题抵消。Curidas 适合经常使用，少量多次写，保持墨路活跃。

它的体积也要试。按动机构需要空间，透明外壳不会像普通细杆笔那样含蓄。手小的人可能觉得前端偏大，握得低的人要留意可拆笔夹附近的边界。

购买 Curidas 时，先看握持。按动笔的成败不只看能不能伸缩，还要看笔夹、前端形状和重心是否合手。再看尖号、墨囊/上墨器、密封状态和拆装是否顺利。若你每天都在移动中写短句，Curidas 有明确用途；若你的写字都发生在书桌上，普通钢笔会更安静。它的魅力在快捷，也在那套暴露出来的机械动作。`,
  },
  {
    slug: "白金-platinum-总统-president",
    title: "Platinum President：白金大金尖的老派路线",
    summary:
      "Platinum President 用 18K 金尖、旋帽树脂笔身和白金自家墨囊/上墨器体系，提供了比 #3776 更大、更正式的书写入口。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Pensachi 的 President 页面写 18K 金尖、AS 树脂、142 mm、21 g、白金自家耗材。",
    },
    body: `Platinum President 的名字很直接，也有点老派。Pensachi 页面列出 18K 双色金尖、AS 树脂笔身、旋帽、白金自家墨囊/上墨器，闭合长度 142 mm，重量 21 g。它不像 Curidas 那样讲机制，也不像 Preppy 那样讲低门槛。President 走的是大号正式金笔路线。

这支笔最值得看的，是它和 #3776 Century 的距离。#3776 是白金最容易被讨论的金尖主力，反馈清楚，Slip & Seal 密封也常被提起。President 更大、更正式，笔尖规格和整体气质都往上走一步。若你喜欢白金的纸面反馈，又觉得 #3776 体量不够，President 会进入视野。

18K 金尖并不自动等于更软。白金的笔尖性格常常比较清楚，纸面感明显。President 的 UEF、EF、F、M、B、C 等线宽选择也说明它照顾不同书写习惯。中文小字用户不必追求大线宽，F 或更细的尖更安全。C 尖适合签名和大字，日常小格本会吃力。

President 的上墨方式很传统。墨囊和 converter 都方便，清洗比活塞笔简单。它适合办公、日记、正式签字和长一点的书写。若你想要看墨水在笔身里流动，或者追求大容量，Heritage 92、Pelikan 活塞笔这类路线更合适。President 的重点在金尖和正式笔身。

和 Pilot Custom 743 比，President 的品牌性格更锋利一些。Pilot 往往给人顺滑、圆润的印象，Platinum 更强调控制和反馈。和 Sailor 1911 Large 比，President 同样有传统雪茄形气质，但纸面感觉和尖号体系不同。选它之前，最好知道自己是否喜欢白金那种明确触感。

President 也适合从“白金大笔”角度判断。它不像 Izumo 那样把材料和漆面放到中心，也不像 Curidas 那样靠机制吸引人。它更接近一支传统大号书写工具：笔尖、尺寸、旋帽和树脂笔身。这个定位朴素，但对喜欢白金的人很清楚。

购买时要确认状态和版本。President 在不同市场的在售情况可能变化，二手页面也会混入老版本。看笔尖是否原装、铱点是否磨损、笔帽螺纹是否正常、树脂是否有裂。它适合已经写过 #3776 或其他白金笔，想要更大、更正式白金金尖的人。若你刚入门，#3776 的资料和选择更丰富；若你想要白金的老派大笔，President 有自己的味道。`,
  },
  {
    slug: "白金-platinum-小流星pq200",
    title: "Platinum 小流星 PQ200：Preppy 旁边的彩色入门笔",
    summary:
      "小流星 PQ200 是白金低价入门路线的一支：塑料笔身、细钢尖、白金墨囊或 PQR-200 上墨器，适合学生、手账和低压力练习。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 AwesomePens 的 PQ-200 页面写 0.38 mm 钢尖、13 g、塑料、白金墨囊和 PQR-200 兼容。",
    },
    body: `白金小流星 PQ200 要放在 Preppy 旁边理解。AwesomePens 的页面把它写成 Platinum Small Meteor PQ-200，塑料笔身，约 13 g，0.38 mm 细钢尖，兼容白金墨囊和 PQR-200 上墨器。它不是高端白金，也不是收藏款。它的价值在低价、轻、容易开始。

小流星最适合解决入门焦虑。很多人想试钢笔，又怕贵、怕麻烦、怕坏。PQ200 的价格和塑料结构让压力降下来。细尖适合中文小字、作业、手账和日常短笔记。彩色笔身和星形装饰也让它比普通办公笔轻松。对学生和第一次买钢笔的人，这些比复杂历史更重要。

它和 Preppy 的关系容易让人混淆。两者都在白金入门区间，都有低价格和实用钢尖。小流星更像某些市场里的彩色变体，外观更可爱，型号和耗材要按实际页面确认。买之前看清是白金墨囊、PQR-200 上墨器，还是卖家搭配的套装，不要把所有 Preppy 配件直接套上去。

这支笔的“好写”不应该被夸大成高级。它更像一支能让人安心练习的工具。轻，便宜，线条细，放在笔袋里不紧张。写错字、摔一下、带去学校，都不需要像对待金尖那样小心。入门笔能做到这一点，就已经很有价值。

PQ200 的短板也很清楚。塑料笔身不会有高级质感，钢尖也不提供金尖弹性。笔帽、笔夹、透明件和装配都按入门价位理解。若你追求长期主力，#3776 或 Pilot Custom 74 会更稳；若你只是想把钢笔放进文具盒，PQ200 就很合适。

它也适合试墨和练字。细尖控制墨量，低价让人不怕弄脏。只是不要一开始就灌强染色或亮片墨，入门笔最需要的是稳定和容易清洗。用普通蓝黑、黑色或浅色墨水试几周，比频繁换复杂墨水更能看清笔尖是否适合自己。

购买时先看尖号、耗材和是否带上墨器。给孩子买，还要看笔帽是否容易盖紧，笔身是否经得起书包里的碰撞。二手小流星意义不大，除非是很便宜的套装。它最适合做第一支、备用笔、手账彩色笔和低压力练习笔。白金的高级型号有自己的世界，小流星的世界更简单：拿起来能写，坏了不心疼，颜色也让人愿意多写几行。若你只是想知道自己会不会坚持用钢笔，小流星比昂贵金尖更适合试错。等你确认常用纸张、字迹大小和墨水偏好，再升级也不迟。它也适合放在办公室抽屉里，随时替代一次性笔。出差带着也不心疼。写清单、贴便签、临时签收，都是它能胜任的小事。备用墨囊也容易收纳。放抽屉不占地方。`,
  },
  {
    slug: "派克-parker-卓尔-sonnet",
    title: "Parker Sonnet：现代派克的正式日用线",
    summary:
      "Parker Sonnet 比 IM、Vector 更正式，常见金属漆面、墨囊/上墨器体系和多种笔尖配置，让它适合办公、签字和礼品场景。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Goldspot Sonnet 页面和既有 Parker source pack 写现代正式线，不硬写年份或旗舰地位。",
    },
    body: `Parker Sonnet 是现代派克里很典型的正式日用笔。它不像 Vector 那样学生化，也不像 Duofold 那样带着强烈历史和高价形象。Goldspot 页面里的黑色漆面金夹 Sonnet，很能代表它的气质：金属、漆面、礼盒、墨囊/上墨器，放在办公桌上不会显得突兀。

Sonnet 的重点在“体面”。它确实被设计成一支容易进入商务场景的钢笔，但日常写字也能成立。笔身比例不夸张，颜色和装饰版本很多，从黑漆金夹到不锈钢、银色、花纹款都有。你可以把它当作签字笔，也可以用来写日记和会议记录。它的外观比 IM 更成熟，价格也通常更高。

Sonnet 的笔尖和版本要分开看。不同年份、地区和配置会出现钢尖或金尖，线宽和装饰也会不同。购买时不要只看“Sonnet”这个名字，要看具体 SKU、笔尖材质、尖号和随附上墨器。很多人对 Sonnet 的体验差异，来自具体版本差异，而不是系列本身。

和 Parker IM 比，Sonnet 更细腻、更正式，也更适合礼品和长期办公。IM 的优点在价格和耐用感，Sonnet 的优点在外观层次和系列成熟度。和 Parker 51 或 Duofold 比，Sonnet 少了经典复古压力，更像现代 Parker 给普通用户的中高端答案。

书写上，Sonnet 适合中等长度内容。它不是大容量活塞笔，也不是玩家特殊尖平台。墨囊/上墨器结构让换墨容易，维护也简单。若你每天写很多页，Pelikan 活塞或 Pilot Custom 823 会更省心；若你主要写会议记录、签名和短文，Sonnet 的定位刚好。

Sonnet 的另一个用途是“长期办公笔”。它比一次性签字笔慢一点，却更有仪式感；比高价收藏笔轻松一点，也更容易带进日常。选黑漆金夹会偏正式，选不锈钢或银色会更冷静。它不需要讲太多故事，场合感本身就是它的卖点。

购买 Sonnet 最重要的是防止“只看外观”。漂亮漆面和金属件会让人忽略笔尖状态。新笔要确认尖号、是否带 converter、是否适合自己的纸张；二手笔要看漆面磕碰、笔帽松紧、笔尖是否歪。它适合需要一支正式钢笔，又不想进入高端收藏款的人。Sonnet 的好处在稳妥，坏处也在稳妥：它不会给你太多意外，但在合适场合里很容易拿得出手。若要送礼，最好连墨囊和 converter 一起配好。收礼者也能马上开始用。日常维护也简单。上手门槛低。`,
  },
  {
    slug: "派克-parker-im丽雅",
    title: "Parker IM：现代派克的耐用入门办公笔",
    summary:
      "Parker IM 是比 Vector 更正式、比 Sonnet 更低门槛的现代办公钢笔，金属笔身、墨囊/上墨器和中等尺寸让它适合通勤日用。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Goldspot IM Achromatic 页面写 152.5 mm 插帽长度、约 22.7 g、金属办公笔定位。",
    },
    body: `Parker IM 是现代派克里很实用的一档。它没有 Sonnet 那种礼品感，也没有 Vector 的学生气。Goldspot 的 IM Achromatic 页面给出的信息很适合判断它：金属笔身，插帽后约 152.5 mm，最大直径约 12 mm，重量约 22.7 g。它是一支带点分量的办公钢笔。

IM 的好处在耐用感。金属笔身比塑料入门笔更稳，外观也更适合通勤和办公桌。它不会像高端金笔那样让人紧张，价格通常也在可接受区间。第一次想买一支“看起来正式一点”的 Parker，很多人会从 IM 开始。

它的上墨逻辑很简单：Parker 墨囊或 converter。这个体系适合日常换墨和清洗，也方便送给不太懂钢笔的人。你不需要解释活塞、真空或滴入式。插墨囊就能写，想用瓶装墨再配 converter。对办公场景来说，这比复杂结构更实际。

书写期待要放在入门到中端之间。IM 的价值不在金尖弹性，也不在特殊手感。它适合记笔记、签字、办公室短写和随身备用。若你每天长时间写小字，Pilot Custom 74 或 Platinum #3776 会给你更清楚的笔尖体验；若你想要一支结实、正式、维护简单的钢笔，IM 的方向更对。

和 Vector 比，IM 更成熟，金属感也更强。Vector 更像校园和入门工具，IM 更像上班以后仍能放在桌面上的笔。和 Sonnet 比，IM 低调些，装饰和笔尖层级也更低。你可以把 IM 看成 Parker 现代产品线里的“常规办公答案”。

IM 也适合送给刚开始用钢笔的人。它不会像透明活塞笔那样需要解释太多，也不会像金尖笔那样让人担心维护。收礼者只要知道怎么插墨囊、怎么盖笔帽，就能开始使用。对不熟悉钢笔的人，这种简单比高级参数更重要。

需要留意的是重量和握持。金属笔身让 IM 更稳，也会让长写更累。若你习惯很轻的塑料笔，IM 可能显得沉。买前最好连续写半页，看看手腕和手指是否舒服。

购买 IM 时先看具体版本。Achromatic、金属漆面、不同颜色和套装都会影响手感和价格。再确认尖号、是否带 converter、笔帽扣合是否紧。二手 IM 要看漆面掉漆和笔尖磕碰。它适合不想花太多钱，又想要 Parker 品牌、金属笔身和正式外观的人。IM 不负责让玩家兴奋，它负责把钢笔放回日常工作里。它的成功标准很朴素：耐看、耐放、能稳定写。别按收藏笔要求它。`,
  },
  {
    slug: "派克-parker-威雅-vector",
    title: "Parker Vector：学生时代的派克入口",
    summary:
      "Parker Vector / Vector XL 是派克更轻松的入门线，钢尖、墨囊/可补充体系和简单外形，让它适合学生、备用和低压力日用。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Cult Pens Vector XL 页面写金属款、钢尖、可补充墨水和入门定位，避免混淆旧 Vector 全线。",
    },
    body: `Parker Vector 是很多人接触派克的低门槛入口。现在零售页面里常见 Vector XL，Cult Pens 的页面显示金属笔身、钢尖、中字、可补充墨水。它不是派克历史里最有名的型号，也不追求高端质感。它更像一支把 Parker 标识放进学生和日常场景里的工具笔。

Vector 的好处在简单。外形直，结构清楚，钢尖和墨囊/可补充体系容易理解。学生做笔记、办公室备用、包里随手放一支，都符合它的定位。对第一次买 Parker 的人，它比 Sonnet 便宜，也比 IM 更轻松。你不会因为磕碰或丢失太心疼。

它的局限也要直接讲。Vector 不会提供金尖的细腻，也没有经典 Parker 51 的历史厚度。它的价值在“能写、便宜、品牌熟悉”。如果你已经写过 LAMY Safari、Pilot Kakuno、Platinum Preppy，再拿 Vector，要看自己是否喜欢 Parker 的外观和握持，而不是期待本质飞跃。

Vector XL 的“XL”也意味着它和老 Vector 小细杆印象有些距离。具体版本可能是金属笔身，手感更稳，也更像现代入门办公笔。购买时要看清页面，不要把旧款 Vector、Vector XL、不同国家版本混在一起判断。很多低价经典型号都有这个问题：名字熟悉，实际版本已经变过。

Vector 适合用来判断自己是否还喜欢 Parker 的基础书写。它没有复杂结构，也不要求你照顾昂贵笔尖。若它的握持、笔帽和尖号都合适，你再往 IM、Sonnet 走会更清楚。若连 Vector 都觉得没必要，说明你可能更适合日系入门或 LAMY 那种更强设计感的路线。

和 Parker IM 比，Vector 更轻松，价格压力更低，正式感也低。IM 更适合上班桌面，Vector 更适合学生和备用。和 LAMY Safari 比，Vector 没有强握位，也少了设计训练感。和 Pilot Kakuno 比，它更成熟一点，但少了新手友好的可爱提示。

购买 Vector 时先看尖号和耗材。中字适合英文和较大字，中文小字用户要谨慎。再看笔身材质、是否带墨囊或 converter、笔帽扣合是否可靠。二手 Vector 通常不必复杂判断，除非是老版本收藏。它最合适的用法，是低压力地把 Parker 放进口袋。你想要传奇，就去看 51、Duofold 或 Vacumatic；你想要一支能写的派克入门笔，Vector 仍然有位置。`,
  },
  {
    slug: "辉柏嘉-faber-castell-ambition雄心",
    title: "Faber-Castell Ambition：把材质放在握持前面",
    summary:
      "Faber-Castell Ambition 用木材、树脂或金属笔杆搭配钢尖和墨囊/上墨器，外观克制，但细长无握区的手感很挑人。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Goldspot Ambition 页面写木杆、钢尖、Faber-Castell cartridge/converter 和材质手感。",
    },
    body: `Faber-Castell Ambition 的第一印象，往往先落在笔杆上。Goldspot 的蓝色木杆限量页面写到 hornbeam wood、chrome-plated metal trim、不锈钢笔尖、Faber-Castell 墨囊或 converter。Ambition 系列常用木材、树脂、金属等不同材料做笔杆，外观很干净，也很挑握持。

这支笔的设计有点执拗。笔杆是直直的一段，前端握区很短，甚至会让一部分用户觉得没有真正的握区。喜欢这种设计的人，会觉得它简洁、现代、材料感强；不适应的人，写久了会找不到舒服位置。买 Ambition 前，试握比看图片重要。

Faber-Castell 的钢尖口碑通常不错，Ambition 也靠这点撑住日用。它不会给你金尖弹性，却能提供稳定、利落的书写。若你看重笔尖表现，又不想买高价金尖，Ambition 是可以考虑的路线。只是手感和笔尖同样重要，一支笔写得顺，握不住也没意义。

材料版本会改变体验。木杆温和，树脂轻，金属更冷更硬。Goldspot 这个蓝色木杆版本让 Ambition 的材质感很明显。可材料越漂亮，越要看实际使用痕迹。木材、漆面和金属件都会随着时间留下细节，有些人喜欢这种痕迹，有些人会觉得难保养。

和 Faber-Castell Loom 比，Ambition 更细、更像设计物；Loom 的握持更有存在感，笔尖口碑也强。和 LAMY Studio 比，Ambition 更强调材料筒身，Studio 更像圆润办公工具。和 Parker IM 比，Ambition 少一点传统商务感，多一点文具设计味。

Ambition 适合短到中等长度书写。签名、会议记录、手账和读书摘录都可以，长时间抄写就要看握位适应。它的钢尖通常给人可靠印象，可笔身设计会筛掉一部分用户。很多笔是笔尖挑人，Ambition 更像是笔杆挑人。

购买 Ambition 时，先试握，再选材料。不要被木杆或限量色完全带走。确认尖号、是否带 converter、笔帽扣合和笔杆表面是否有瑕疵。二手木杆版本要看裂纹、漆面和金属件磨损。它适合喜欢简洁外观、写字时间不算太长、愿意接受细长握持的人。若你握笔重或常写长文，最好先试一整段。Ambition 的美感很清楚，合不合手也会很快给出答案。别只在柜台划线，至少写一段话。这样才能判断握区。手汗多也要留意。`,
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
  const sourceNotes = `Reader-first mainstream B-tier article. Humanizer-zh self-review: ${humanizerTotal(article)}/50. ${article.humanizer.notes}`;

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

async function citeExistingSources(db: Client, storyId: string, sourceItemIds: string[]) {
  for (const sourceItemId of sourceItemIds) {
    await execute(
      db,
      `INSERT INTO citations
       (id, target_type, target_id, source_item_id, note, created_at)
       SELECT ?, 'story', ?, ?, 'Reader-first mainstream article source', datetime('now')
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

  return `# Read first B 档主流型号 humanizer-zh 审查

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

  for (const article of ARTICLES) {
    const entity = await findEntity(db, article.slug);
    if (!entity) throw new Error(`Missing pen entity: ${article.slug}`);
    const sources = await getExistingSourceItems(db, entity.id);
    if (sources.length === 0) throw new Error(`Missing source references: ${article.slug}`);
  }

  if (!WRITE) {
    console.log(`Validated ${ARTICLES.length} mainstream article(s).`);
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
    await citeExistingSources(
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
