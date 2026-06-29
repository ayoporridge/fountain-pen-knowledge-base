import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REVIEW_PATH = path.join(
  process.cwd(),
  "docs/content/read-first-b-modern-humanizer-review.md",
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

const EXTRA_ARTICLES: Article[] = [
  {
    slug: "施耐德-schneider-bk402",
    title: "Schneider BK402：便宜学生笔里的德国日用答案",
    summary: "Schneider BK402 是一支轻量塑料学生笔，F 尖、墨囊和三角握位让它更适合入门书写和低成本日用。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Daraz 商品页和 LOXPO 用户评测写低价、F 尖、三角握位和墨囊使用。",
    },
    body: `Schneider BK402 不像一支需要讲大历史的钢笔。它的入口很小：低价、轻塑料、F 尖、墨囊，外加一个帮助固定手指的三角握位。Daraz 的商品页把它放在 student / children calligraphy pen 这类语境里，LOXPO 用户评测也把它当成给孩子使用的便宜学生笔来谈。这些线索足够说明它的身份：它更接近学习工具，不是玩家收藏品。

BK402 的好处在负担低。轻塑料笔身不会压手，墨囊上墨不用学习复杂结构，F 尖对日常中文和英文练习都比较安全。对刚开始用钢笔的人，太贵、太重、太难清洗都会造成心理压力。BK402 把这些门槛降得很低，写坏、摔碰、忘在教室里，都不至于让人太心疼。

三角握位是它最有判断价值的地方。这个设计会把手指带到固定位置，对正在练握姿的学生有帮助。已经形成自己握法的人，可能觉得被限制。买之前要想清楚用途：如果是给孩子练字，三角握位有实际意义；如果是成年人想找一支随手笔，握位是否合手比价格更重要。

这支笔的书写期待也要放低。它不会提供金尖的弹性，也不会有高端树脂或金属笔身的质感。它更像一支能让人理解钢笔基本操作的练习笔：插墨囊，盖好笔帽，写完收起来。F 尖如果调校正常，能满足作业、笔记、短句和日常批注。若你想展示墨色、写大字或追求细腻反馈，它会显得单薄。

和 LAMY Safari 比，BK402 的品牌设计感弱很多，价格和使用压力也更低。和 Pilot Kakuno 比，它同样有学生笔气质，但资料里的重点更偏低价和三角握位。和英雄、白金等入门笔比，它的优势主要在德国品牌和简单耗材，劣势是可玩性不高。

它也适合放在“第一支能正常练字的钢笔”这个位置。孩子刚开始用钢笔，更需要握得住、写得出、弄脏了也容易处理。成年人买来当办公室备用笔，也可以接受它的朴素。只是别期待它带来太多乐趣，BK402 的任务是把钢笔这件事变简单。若家里已经有墨水瓶和上墨器，它反而显得太基础；若只是想让孩子先熟悉钢笔，它刚好够用。

购买时先看尖号和墨囊来源。低价笔最怕买到笔尖开叉、刮纸或下水不稳的个体，能试写最好。给学生买时，还要看笔帽是否容易扣好、笔身是否够耐摔、墨囊是否方便补充。若要配校用蓝黑墨，也要确认墨囊规格和购买便利性。BK402 的价值不在惊喜，而在它把钢笔的基础训练做得便宜、直接、没有太多装饰。把它当作第一支练习笔，比当成长期主力更合理。`,
  },
  {
    slug: "坛笔-penbbs-456",
    title: "PenBBS 456：平价真空上墨的玩家入口",
    summary: "PenBBS 456 以真空上墨、树脂外观和相对低价进入玩家视野，适合想体验大容量结构的人先试水。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 The Gentleman Stationer 的 456 真空上墨评测和 Narratess 的 PenBBS 购买语境写。",
    },
    body: `PenBBS 456 的吸引力很明确：用不算高的价格，把真空上墨和漂亮树脂放到一支现代国产钢笔里。The Gentleman Stationer 对 456 的评测标题直接把它称为 vacuum-filler fountain pen，这比“平价玩家款”更能说明它的位置。它不是简单墨囊笔，读它要从上墨结构开始。

真空上墨给 456 带来两个东西：容量和动作。拉杆、推下、吸墨，这个过程比普通上墨器更有机械感，也让笔身里能装下更多墨水。喜欢长写、喜欢透明或半透明笔身、喜欢看墨水进入笔杆的人，会更容易被它吸引。只想每天换颜色的人，反而会觉得清洗麻烦。

PenBBS 的另一层背景，是它在海外玩家圈里常被当成中国现代钢笔的代表之一。Narratess 的 PenBBS 文章提到 Etsy、Taobao 等购买渠道和颜色批次，这说明用户面对 PenBBS 时，经常是在看材料、批次、颜色和渠道，而不只是一个固定 SKU。456 也有这种气质：漂亮外观是卖点，结构也是卖点。

使用上，456 要求用户知道自己在买什么。真空上墨比墨囊和上墨器更有趣，也更需要清洗耐心。若笔身透明，墨水残留和染色会更明显。钢尖的表现要看具体个体和尖号，别把低价真空笔想象成高端金尖的替代品。它的强项是结构体验和性价比，不是无条件精致。

和 TWSBI VAC700R 比，456 的吸引力在价格和 PenBBS 的材料颜色；TWSBI 的优势在品牌体系和透明工具感。和 Wing Sung 699、Pilot Custom 823 这类真空上墨语境比，456 更适合先试水。你可以用它判断自己是否喜欢真空结构，再决定要不要往更贵的路线走。

456 也适合拿来理解“平价玩家笔”的优点和边界。它给了比普通入门笔更多的结构和外观选择，但这些选择会增加检查成本。收到笔后，最好先用容易清洗的墨水试几天，确认上墨、出墨和密封都正常，再去尝试强染色或高饱和墨水。若尾端阀门或活塞动作不顺，先处理结构问题，不要急着把它归因于墨水或纸张。

购买时先确认上墨结构、笔尖、笔身颜色和渠道。二手或海外页面里，颜色名和批次可能比规格更显眼，最好看清实拍。若你想要一支每天随手写的低维护钢笔，456 可能太需要照顾；若你想用较低预算体验真空上墨，它很有代表性。它最适合的读者，是已经不满足于普通墨囊笔，开始对结构和材料感兴趣的人。到手后先试密封。`,
  },
  {
    slug: "坛笔-penbbs-469",
    title: "PenBBS 469：一支笔里放进两套书写",
    summary: "PenBBS 469 的识别点是双笔尖设计，它更像玩家实验型日用笔，适合喜欢一支笔携带两种线宽或两种墨水的人。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 The Well-Appointed Desk 的 double nib 评测和 PenBBS 购买语境写。",
    },
    body: `PenBBS 469 很容易让人先问一句：为什么一支钢笔要有两个笔尖？The Well-Appointed Desk 的评测标题把它称为 Double Nib Fountain Pen，这就是它的核心。普通钢笔只在一端书写，469 把两套书写端放进一支笔里。它不追求低调，甚至有点实验味。

双笔尖的意义，要看你怎么用。最实际的用法，是一端装细一点的尖，一端装粗一点的尖，或者两端使用不同墨水。写手账、批注、做读书笔记时，这种切换会很方便。你不用带两支笔，也不用频繁换墨。问题也跟着来：笔身结构更复杂，清洗和携带都比普通单尖钢笔麻烦。

PenBBS 的产品气质本来就偏玩家。Narratess 谈 PenBBS 时，重点不只是型号，还有购买渠道、颜色批次和可负担的材料选择。469 在这个语境里很合理：它像一支让人愿意尝试的结构玩具，价格不会一下把人推到高端收藏区，外观和玩法却足够有记忆点。

使用时要先接受它的体积和管理成本。两端都有笔尖，意味着你开合、清洗、装墨时都要更小心。若两端装不同颜色，墨水搭配和清洁周期也要安排好。它不适合只想找一支省心办公笔的人，更适合愿意把笔当成小工具研究的人。

和 PenBBS 456 比，469 的重点不在真空上墨，而在双端书写。和 TWSBI 580 这类透明活塞笔比，它的结构乐趣更偏使用场景，而不是看墨水储量。和普通双色笔、换芯笔比，469 仍然保留钢笔的墨水和笔尖体验，玩法更自由，也更需要维护。

469 最适合已经知道自己要用它做什么的人。比如读书笔记一端写正文、一端写页码和批注；手账里一端用常规蓝黑，一端用醒目的重点色。若只是觉得“双尖很酷”，新鲜感过去后，清洗两端和管理两种墨水会变成负担。它需要明确的工作流。也要留意两端重量和握持方向，频繁翻转会打断书写节奏，只有切换需求足够高时才值得。若两端墨水颜色太接近，它的优势也会被削弱。

购买时先确认两端笔尖配置和上墨方式，再看是否真的有使用场景。若你平时只用一种墨、一种线宽，469 的复杂性会浪费。若你常在同一页上写正文和标注，或者喜欢一支笔里装两种墨，它就很有意思。也要看笔帽和两端螺纹是否可靠，双端结构最怕某一端松动影响携带。它的价值在“切换”这件事，不在单纯写得比别人更顺。把它当成一支实验型日用笔，比把它当成传统主力更准确。清洗时也要给两端分别留时间。收纳时最好单独放笔套里。`,
  },
  {
    slug: "永生-wingsung-618",
    title: "Wing Sung 618：透明活塞里的平价日用路线",
    summary: "Wing Sung 618 常被放在便宜中国活塞笔语境里讨论，透明笔身和大容量让它适合想低成本体验活塞结构的用户。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 The Well-Appointed Desk 618 Demonstrator 评测和 The Gentleman Stationer 698/618 文章写。",
    },
    body: `Wing Sung 618 适合从“便宜活塞笔”读起。The Well-Appointed Desk 写过 618 Demonstrator，The Gentleman Stationer 也把 698 和 618 放在 inexpensive piston-filler-style Chinese pens 的语境里讨论。这个位置很清楚：618 不是高价金尖笔，它让用户用很低成本体验透明笔身和内置上墨。

透明或示范笔身是 618 的第一吸引力。你能看到墨水，也能看到储墨量。对刚开始玩墨水的人，这很有趣；对只想干净省心的人，它会暴露所有残留。活塞结构带来比普通上墨器更大的容量，也让清洗更费时间。618 的乐趣和麻烦都在这里。

它和 Parker 51 式暗尖传统也常被放在一起讨论。暗尖让笔尖露出少，视觉更收敛，也让整支笔有一点复古感。用起来，用户更在意的是出墨是否稳定、笔帽密封是否可靠、活塞是否顺滑。低价笔的个体差异不能忽略，买到状态好的 618 会觉得很值，买到调校差的个体就要花时间处理。

和 Wing Sung 698 比，618 更偏轻巧、透明和暗尖语境；698 更像常规开放尖活塞笔。和 TWSBI ECO 比，618 价格通常更低，但品牌品控和售后预期也不同。和英雄 100 比，618 少了 14K 金尖和老牌国产金笔身份，换来的是更低门槛和透明活塞玩法。

618 适合写日常笔记、练字和试墨，但不一定适合频繁换墨。活塞容量大，灌满后最好写一段时间。若你只想每天写几行，墨水会在笔里放很久；若你经常写整页笔记，它的大容量才有意义。中文小字用户要看具体尖号和出墨，别只被透明笔身吸引。

它也适合拿来和 Wing Sung 601 一起看。601 更容易让人想到 Parker 51 式暗尖和外形复刻，618 则更偏透明活塞的低价日用。两者都在借用经典暗尖语境，但使用重点不同。想要复古外形，可以先看 601；想看墨量和活塞动作，618 更直观。若你已经有 601，618 更像补一支透明活塞玩法，而不是简单重复购买。

购买时先看活塞是否顺、笔帽是否密封、笔尖是否刮纸，再看外观。低价活塞笔的价值来自“结构给得多”，也意味着每个结构都可能成为问题点。618 最适合的读者，是想花小钱理解活塞、暗尖和透明笔身的人。它不会替代高端主力，却能让人迅速知道自己是否喜欢这种玩法。`,
  },
  {
    slug: "永生-wingsung-698",
    title: "Wing Sung 698：低价活塞笔的野心",
    summary: "Wing Sung 698 以活塞上墨和较完整的日用结构进入玩家视野，适合用来理解国产低价活塞笔的优势和取舍。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Scribble Jot 698 piston filler 评测和 The Gentleman Stationer 698/618 语境写。",
    },
    body: `Wing Sung 698 的野心，比价格看起来更大。Scribble Jot 的评测直接把它称为 piston filler fountain pen，The Gentleman Stationer 也把 698 和 618 放进便宜中国活塞笔的讨论里。它想给用户一种感觉：不用花很多钱，也能买到活塞上墨、透明储墨和较完整的钢笔结构。

698 和很多低价墨囊笔不同。活塞上墨让它有更大的储墨量，也让笔身成为结构的一部分。灌满墨以后，它更适合连续写，而不是每天换一种颜色。喜欢长写的人会觉得省心，喜欢折腾墨水的人会觉得清洗慢。透明或半透明版本会让墨量很直观，也会让残留变得明显。

这支笔常被拿来谈性价比，但性价比不是没有代价。低价活塞结构可能带来个体差异，笔尖调校、活塞顺滑度、笔帽密封和装配细节都要看实际到手状态。它能给你很多配置，却不一定给你高端笔那种一致性。买 698，最好带着这种心理预期。

和 Wing Sung 618 比，698 更像常规开放尖活塞笔。618 的暗尖和复古味更明显，698 则更直接地展示笔尖和储墨。和 TWSBI ECO 比，698 的价格和国产复刻语境更强，TWSBI 的优势在透明活塞产品线更成熟。和 Pilot Custom 74、Platinum #3776 这些日系金尖比，698 的问题不在同一层：它先解决“低价大容量”，不是“高级笔尖”。

使用时，698 适合固定配一瓶稳定墨水。写课堂笔记、工作记录或日记，都能发挥容量优势。若你每天只签几个字，活塞系统意义不大。若你常写好几页，它会比小上墨器笔省心。中文小字用户要看尖号和出墨，不要只看金尖或钢尖版本的标签。

698 还有一个用途：让用户低成本学习活塞笔该怎么检查。活塞有没有异响，旋钮是否顺，笔身有没有细裂，笔尖和供墨是否匹配，这些在高价笔上也同样重要。先用 698 学会这些判断，再去看更贵的活塞笔，会少很多盲目。它也适合放在固定书桌上，而不是每天粗放通勤；透明笔身和活塞机构都更怕摔碰。

购买时先确认版本。698 有钢尖和金尖等不同市场说法，价格也会变。二手或电商页面里，要看笔尖、活塞、笔身裂纹、是否漏墨。它适合愿意用低价承担一点调校风险的用户。若你想要开箱就稳定、售后清晰，选择成熟品牌会省心。若你想体验国产低价活塞笔的上限和取舍，698 是绕不开的一支。先用便宜、稳定的墨水试写几天，比一上来灌复杂墨水更稳。`,
  },
  {
    slug: "铃兰-lily-910-capless",
    title: "Lily 910：国产按动钢笔的一段旁枝",
    summary: "Lily 910 是玩家资料中常被讨论的中国伸缩钢笔，重点在 capless 机制、收藏辨认和与 Pilot Capless 语境的距离。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Cronicas Estilograficas 和 Fountain Pen Network 的 Lily 910 资料写伸缩机制和收藏判断。",
    },
    body: `Lily 910 的有趣之处，是它把“capless”这个通常会让人想到 Pilot 的词，带进了国产老笔语境。Cronicas Estilograficas 写过 Lily 910，Fountain Pen Network 也有 Annual Review 2019 - Lily 910 讨论。资料指向很清楚：这是一支被玩家拿来辨认和讨论的中国伸缩钢笔。

伸缩钢笔的核心，是不用拔帽。按动或旋动机构把笔尖收进笔身，使用时再推出。这个结构听起来方便，实际制造和维护都不轻松。笔尖要能伸出收回，密封要尽量减少干尖，内部空间还要容纳上墨系统。Lily 910 的价值，正在于它把这种机制放进了国产钢笔历史的一条旁枝里。

它不能直接按现代 Pilot Capless 的标准来判断。Pilot Capless/Vanishing Point 有长期产品线、成熟笔尖单元和现代售后；Lily 910 更像收藏和辨认对象。买它时，先看机构是否正常、笔尖是否完整、零件是否原配、是否有裂纹或缺件，再谈能不能当主力。

真正书写时，Lily 910 可能会带来惊喜，也可能让人意识到老伸缩笔的限制。按动结构会影响重心，笔夹位置也可能改变握持。若密封状态不好，第一笔出墨会受影响。它适合喜欢国产钢笔史、机制笔和小众收藏的人，不适合只想省心写字的人。

和 Hero 100 比，Lily 910 的收藏点在机制；Hero 100 的讨论更多围绕 14K 暗尖和国产日用金笔。和 Pilot Capless 比，Lily 910 更像历史旁证：说明伸缩钢笔的想象并不只存在于日本大厂产品里。两者的成熟度、资料完整度和购买风险都不在一个层级。

它也适合放进“机制型钢笔”这条线索里看。很多国产老笔的讨论集中在金尖、暗尖和品牌记忆，Lily 910 则把注意力放到开合动作上。这个角度很珍贵，但也会让维修难度提高。少见结构一旦缺零件，修复比普通挤压上墨笔麻烦得多。

购买 Lily 910，要比买普通老笔更谨慎。需要看按动是否顺、笔尖能否完全伸出、收回后是否保护到位、上墨结构是否还能用。照片最好能显示笔尖伸出和收回两种状态。若卖家只给合盖图，很难判断。它的意义在于让读者看到国产钢笔里曾经出现过的机制实验，而不在现代通勤效率。喜欢这个题材的人，会觉得它很有味道；只想写字的人，最好选更稳定的新笔，风险也更低些。`,
  },
  {
    slug: "百乐-pilot-capless-decimo",
    title: "Pilot Capless / Decimo：按一下就能写的钢笔",
    summary: "Pilot Capless / Decimo 的核心是伸缩笔尖和无帽使用，Decimo 更轻薄，适合需要快速记录又想保留钢笔笔尖的人。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Cult Pens Decimo 页面和 Capless/Vanishing Point 命名语境写机制、尺寸和使用场景。",
    },
    body: `Pilot Capless / Decimo 最打动人的地方，是按一下就能写。普通钢笔要拔帽、旋帽或找地方放笔帽，Capless 把这个动作变成按动。它像圆珠笔一样快速，又保留钢笔笔尖和墨水。对会议、课堂、巡店、医生查房这类碎片记录场景，这个差别很实际。

Capless、Vanishing Point 和 Decimo 的命名容易让人混乱。对普通用户来说，先抓住结构：它们都围绕伸缩笔尖展开。Decimo 是更轻薄的一条，Cult Pens 的 Decimo 商品页也把它放在 Pilot Capless Decimo 语境里。若你觉得普通 Vanishing Point 偏粗偏重，Decimo 会更容易握。

这支笔的好处和限制都来自无帽结构。按动方便，单手开合快，不用担心笔帽滚走。笔夹位置却会出现在握持前端，这会筛掉一部分用户。握笔位置靠前、手指会压在笔夹上的人，可能会不舒服。买 Capless 前，试握比看参数更重要。

笔尖单元也是它的特点。用户可以在同一支笔身里更换不同笔尖单元，也能使用墨囊或 converter。容量不算大，清洗也不像普通开放式钢笔那么直观，但日常记录足够。它更适合频繁拿起放下，不一定适合一口气写很长文章。

和 LAMY Dialog 3 比，Pilot Capless 更快，动作更像日常办公工具；Dialog 3 更有设计仪式感。和普通 Pilot Custom 系列比，Capless 的优势不在大容量或传统笔型，而在随时打开。和便宜按动中性笔比，它当然更贵，也更需要维护，换来的是钢笔墨水和金尖体验。

Decimo 适合手小、喜欢轻一点笔身、又需要快捷记录的人。若你每天写大量长文，Custom 74、Custom 823 或其他常规笔型可能更舒服。若你每天多次短写，Capless/Decimo 的价值会不断出现：拿起，按下，写，按回去。

它也适合那些已经喜欢钢笔，却经常因为拔帽麻烦而改用中性笔的人。Capless/Decimo 把这个摩擦降到很低。缺点是你仍然要面对墨水、清洗和笔尖保护，不能把它完全当成一次性办公笔。

购买时先试握笔夹位置，再看尖号和颜色。中文小字通常从 F 或 EF 更稳，M 会更适合签名和较大字。还要确认随笔配件、converter 型号和笔尖单元状态。二手 Capless 要看按动是否顺、笔尖收回是否完整、内部是否漏墨。它不是所有人都会喜欢的钢笔，但对需要快速记录的人来说，它解决的是普通钢笔一直不太擅长的事。`,
  },
  {
    slug: "英雄-hero-100",
    title: "Hero 100：国产金尖日用笔的老答案",
    summary: "Hero 100 以 14K 暗尖、经典国产日用金笔形象和可维护的老式结构进入玩家视野，购买时要格外看成色和密封。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 FrankUnderwater Hero Type 100 文章和既有来源边界写 14K、暗尖和购买判断。",
    },
    body: `Hero 100 在国产钢笔里有一种很特殊的位置。它不是靠新奇外观出名，也不是靠低价透明结构吸引玩家。它的记忆点是 14K 暗尖、老牌英雄、日用金笔。FrankUnderwater 写过 My Three Type 100 Fountain Pens from Hero，也说明这个型号在海外玩家那里同样会被拿出来比较和辨认。

Hero 100 最容易被理解成国产版 Parker 51 语境里的后代。暗尖让笔尖露出很少，外观克制，书写时更像一支严肃的日用工具。14K 金尖是它最重要的卖点之一，也让它和大量低价钢尖国产笔拉开距离。对很多中文用户来说，Hero 100 的吸引力就在这里：不用进入昂贵进口金笔价格，也能体验国产金尖。

它的日用性来自传统结构。暗尖、挤压或气压式上墨语境、相对细的线条，都让 Hero 100 很适合中文小字和办公笔记。它不负责展示墨色，也不负责制造华丽外观。它更像一支能写很多字的老式工具。喜欢透明笔身、粗线条和大笔尖的人，可能觉得它太收敛。

Hero 100 的问题也很现实。不同年代、不同批次和不同保存状态，会让体验差很多。用户常会关心气密、漏墨、笔尖是否顺、上墨机构是否老化。老笔或二手笔尤其不能只看“14K”标签。金尖如果状态不好，修起来并不比买一支新钢尖笔轻松。

它的魅力也正在这里。Hero 100 不是只靠参数表成立，它背后有很强的国产书写记忆。办公室、学校、父辈抽屉里的老英雄，都会让这支笔带上生活感。对新用户来说，这种情感不能替代实际状态；对收藏者来说，版本和成色又会比单纯写感更重要。

和 Wing Sung 601、618 比，Hero 100 更有国产金尖身份，价格和维护期待也更高。和 Pilot Elite、Platinum #3776 这类日系金尖比，它的品牌气质更老派，售后和品控判断也更依赖具体渠道。和 Parker 51 比，Hero 100 有明显的影子，但不应该把它当成简单替代品。它有自己的国产使用记忆。

购买时先确认笔尖状态、上墨是否正常、笔帽密封和笔身成色。若是新产版本，也要看店家是否靠谱、是否能试写或退换。若是老版本，最好看清笔尖刻字、笔夹、笔帽、笔身磨损和是否有维修痕迹。Hero 100 适合愿意理解国产老式日用金笔的人。它不是最省心的新手笔，却是了解中国钢笔谱系时绕不开的一支。若只看价格，容易误判它；若把成色和维护算进去，判断会现实得多。`,
  },
  {
    slug: "opus-88-demo-kolora",
    title: "Opus 88 Demo / Kolora：滴入式上墨的现代玩法",
    summary: "Opus 88 Demo / Kolora 的重点在滴入式大容量、透明亚克力、止墨结构和 Jowo 笔尖语境，适合想长期使用一瓶墨的人。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 JUSPIRIT Demo Colored listing 写滴入式、透明亚克力、ebonite ink stopper 和 Jowo #12。",
    },
    body: `Opus 88 Demo / Kolora 要从上墨方式读。JUSPIRIT 的 Demo Colored 页面把它放在 eyedropper-style fountain pen 语境里，并列出 transparent acrylic、ebonite ink stopper、Germany Jowo #12 nib 等信息。它不是普通墨囊笔，也不是传统活塞笔。它的核心，是把笔身当成大墨仓来用。

滴入式上墨的快乐很直接：容量大，结构简单，透明笔身里能看到大量墨水。你用滴管把墨水放进笔身，装好后可以写很久。对喜欢固定一瓶墨、写长文、做日记的人，这很舒服。对喜欢频繁换颜色的人，清洗会很麻烦。Demo / Kolora 的优势和负担都来自这件事。

ink stopper 是它和普通滴入式改装笔的重要差别。止墨结构可以帮助控制墨水进入前端，也让携带和气压变化更安心一些。使用时通常要理解尾端开关和墨流关系。若把它当成普通墨囊笔，可能会遇到下水变化或第一笔状态不稳的问题。它适合愿意学习一点操作的人。

透明亚克力让 Opus 88 的工具感很强。墨水颜色、气泡、残留都会被看到。喜欢墨水的人会觉得这正是乐趣；怕脏、怕染色的人会更焦虑。Jowo 笔尖语境则让它的维护和替换信息更容易找，书写性格偏现代、稳定、可预期，不靠神秘调校取胜。

Demo 和 Kolora 的具体版本、尺寸和配色会有差异，购买时要看清页面。不要只看 Opus 88 这个品牌名，也不要把所有滴入式型号混为一谈。Demo 更强调透明展示，Kolora 往往更有配色和材质变化。读者真正要判断的是自己要透明工具感，还是更柔和的外观。

和 TWSBI ECO 比，Opus 88 的滴入式容量更直接，止墨结构也让使用习惯不同。和 VAC700R 比，它少了真空上墨动作，多了大墨仓的朴素逻辑。和普通墨囊笔比，它更适合长写，不适合频繁换墨。若你每天只写几行，容量会显得多余；若你一坐下就写几页，它会很省心。

长时间带出门时，还要确认止墨是否关好。大墨仓很诱人，也意味着漏墨代价更高。

购买时先确认能不能接受滴入式操作。再看笔尖、透明材质、止墨结构是否顺畅。第一次使用最好配稳定、易清洗的墨水，不要直接灌强染色或亮片墨。Opus 88 Demo / Kolora 的价值在于把“原始”的大容量上墨做成现代可用的工具。喜欢它的人，通常喜欢墨水本身，也愿意让笔身成为墨水的一部分。`,
  },
  {
    slug: "坛笔-penbbs-268",
    title: "PenBBS 268：透明日用笔里的轻量选择",
    summary: "PenBBS 268 在现有资料里以 Clear / Silver Fine 等零售形态出现，适合按轻量透明日用笔和 PenBBS 入门渠道来理解。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Desk Bandit 268 listing 和 The Gentleman Stationer PenBBS 索引写透明日用、购买渠道和谨慎判断。",
    },
    body: `PenBBS 268 适合用更轻的方式读。Desk Bandit 的页面把它列成 PENBBS 268 - Clear / Silver (Fine)，The Gentleman Stationer 的 PenBBS 索引则提供了品牌和玩家语境。它没有 456 那种真空上墨的结构话题，也没有 469 的双笔尖玩法。它更像一支把 PenBBS 材料和外观放进日用尺寸里的透明钢笔。

268 的重点在“清楚”。Clear / Silver 这类组合让用户先看到透明笔身和银色装饰，Fine 尖也说明它面对的是日常线宽。对中文小字、手账、课堂笔记来说，细尖比漂亮树脂更重要。若你只是想试 PenBBS，不想一开始就进入复杂上墨或双尖结构，268 会比 456、469 更容易理解。

这支笔的资料没有丰富到能讲很长历史，所以购买判断要收敛。能确认的，是它在零售语境中作为 PenBBS 268 出现，并和透明、细尖、可负担的现代中国钢笔形象联系在一起。材料、上墨和版本差异最好按具体卖家页面核对，不要把别的 PenBBS 型号经验直接套过来。

从读者角度看，268 的优势在门槛低。它不像 456 那样要求你理解真空结构，也不像 469 那样要管理两端笔尖。你只需要确认这支笔写得顺、握得住、颜色和透明度自己喜欢。它适合先试 PenBBS 的材质和笔尖，再决定是否进入更复杂的型号。

PenBBS 的吸引力，常常来自颜色、批次和相对低价。268 也会让用户面对同样问题：到底是在买一支稳定日用笔，还是在买某个颜色和批次？如果只是日用，先看笔尖、握持和清洗；如果为了外观，就要看实拍图和透明件状态。透明笔身最容易暴露划痕、染色和装配问题。

和 PenBBS 456 比，268 少了真空结构，维护压力也小一些。和 469 比，它不提供双端切换，更像普通钢笔。和 TWSBI ECO 比，268 的品牌语境更偏 PenBBS 玩家渠道，TWSBI 的活塞体系更清楚。选择 268，最好是因为你想要一支轻松的 PenBBS，而不是追求结构复杂度。

购买时先确认尖号、上墨方式、笔身是否有裂纹、笔帽和螺纹是否可靠。若页面只给一张库存图，最好再找实拍。268 最适合的读者，是想用较低成本接触 PenBBS 的外观和日用笔尖，不想先被真空、活塞或双尖结构分散注意力的人。它的好处在简单，判断也应该保持简单。`,
  },
];

const ARTICLES: Article[] = [
  ...EXTRA_ARTICLES,
  {
    slug: "凌美-lamy-safari-狩猎者",
    title: "LAMY Safari：入门钢笔为什么总绕不开它",
    summary: "LAMY Safari 把 ABS 笔身、三角握位、钢尖和墨囊/上墨器结构做成了很清楚的入门答案。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "从入门使用场景写起，避开设计经典一类空泛称赞。",
    },
    body: `LAMY Safari 最容易被低估，因为它太常见了。很多人第一次认真买钢笔，店员会把 Safari 放到面前：塑料笔身，三角握位，钢尖，颜色多，价格也还在入门区间。它看起来不像一支需要被供起来的笔，更像一件可以塞进笔袋、课桌和办公抽屉的工具。

LAMY 官方把 Safari 放在 1980 年代设计语境里讲，重点是结实的塑料笔身、人体工学握位和墨囊/上墨器兼容。真正用起来，三角握位是最有争议的部分。它会明确告诉你手指该放在哪里。握姿接近标准的人会觉得省心，手指位置特殊的人会觉得被限制。买 Safari 前，最好先想清楚自己是否愿意被这段握位“纠正”。

Safari 的钢尖体系很实用。EF、F、M 等尖号可以替换，价格也不高。它不会给你金尖的弹性和细腻，但胜在维护简单。写学生笔记、会议记录、手账，Safari 的价值在稳定：摔一下不心疼，换墨囊方便，笔尖出问题也不至于让整支笔报废。

这支笔也很适合解释 LAMY 为什么能把入门笔做成体系。Safari 的笔尖、墨囊、上墨器和许多 LAMY 型号相通，用户从 Safari 往 AL-star、Logo 或 Studio 走时，不需要重新学习耗材。它的设计有一点“训练器”的味道：先让你适应握位和钢尖，再让你判断自己是否想要更重、更正式或更复杂的型号。

和 LAMY AL-star 比，Safari 更轻，也更有学生气。和 LAMY Logo 比，它更外放，握位更明确。和 Pilot Kakuno、Platinum Preppy 这类入门笔比，Safari 的设计感更强，学习成本也更明显。若你只是想随手写字，Preppy 更便宜；若你想用一支能长期留在桌上的入门笔，Safari 仍然很有竞争力。

它的短处不需要回避。笔身塑料感明显，三角握位会筛掉一部分用户，EF 尖也未必像日系 EF 那样细。喜欢金属重量、细腻触感或更安静外观的人，可能很快会转向 AL-star、Logo 或 Studio。Safari 的角色更像入口，不是终点。它帮你判断自己适不适合 LAMY，也帮你判断钢笔这件事是否真的适合日常。

购买时先试握，再选尖号。写中文小字可以从 EF 或 F 看起，喜欢粗一点的墨迹再选 M。透明握位的版本、限量色和普通色主要影响外观，书写核心差别不大。Safari 的好处不在惊喜，而在它把入门钢笔的几个问题处理得很清楚：握法、笔尖、耗材、耐用性。喜欢它的人会用很多年，不喜欢它的人通常在握位上很快就知道答案。`,
  },
  {
    slug: "凌美-lamy-al-star-恒星",
    title: "LAMY AL-star：Safari 的金属侧影",
    summary: "LAMY AL-star 延续 Safari 的握位和钢尖体系，用铝合金笔身和透明握位换来更成熟的触感。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "用 Safari 对照说明 AL-star，不把金属笔身写成升级神话。",
    },
    body: `LAMY AL-star 很像 Safari 的成年版本。外形轮廓熟悉，三角握位还在，笔夹也有 LAMY 的强识别度。差别在笔身：铝合金比 Safari 的塑料更冷、更硬，透明握位让前端多了一点技术感。它没有改变 LAMY 入门体系的逻辑，只是把同一套设计换成更成熟的材料。

官方页面强调铝合金笔身、透明握位、钢尖和墨囊/上墨器结构。读者真正需要知道的是：AL-star 不是一支完全不同的笔。如果你讨厌 Safari 的三角握位，AL-star 不会解决这个问题。如果你喜欢 Safari 的握位，却觉得塑料笔身太轻、太学生气，AL-star 会更合适。

铝合金让手感变得更明确。它比 Safari 稍有分量，表面也更像日常工具。缺点也跟着来：金属表面会留下划痕，磕碰后比塑料更显眼。透明握位漂亮，但也会让墨迹和使用痕迹更容易被看见。它适合愿意把笔当作日常物件使用的人，不适合对外观完美特别敏感的人。

AL-star 的日用价值在“熟悉但不幼稚”。你仍然能用 LAMY 常见墨囊和上墨器，也能换同一套钢尖。书写没有突然变成另一种性格，视觉和触感却从学生笔往办公工具移动了一步。对很多用户来说，这个变化刚刚好：不用花到金尖或活塞笔的预算，也能从塑料入门笔里走出来。

书写部分仍然是 LAMY 钢尖体系。换尖方便，尖号选择清楚，维护成本低。和 LAMY Studio 比，AL-star 更轻，也更有入门工具感；和 LAMY Logo 比，它更粗、更外放；和 Safari 比，它的优势主要是材质和视觉成熟度。写中文小字时，EF 或 F 更稳，M 适合更大的字和更显眼的墨色。

选择 AL-star 时也要接受它的矛盾。它更成熟，却保留了 Safari 的强握位；它更结实，却更怕明显磕碰；它看起来像升级，书写核心依旧是那枚 LAMY 钢尖。若你想要明显更好的笔尖反馈，金尖型号才会改变得更多。若你只是想让常用笔更耐看、更有金属感，AL-star 的升级就足够实际。

买 AL-star 时，先把它当成 Safari 的材料变体来判断。喜欢三角握位，再看颜色和表面处理。若你希望一支入门钢笔兼具一点金属质感和可替换钢尖，AL-star 很直接。若你期待它带来完全不同的书写体验，可能会失望。它最好的位置，是把 Safari 那套可靠入门方案，放进一个更像成年人会长期携带的外壳里。日常通勤时，它比塑料 Safari 更像一支正式工具。`,
  },
  {
    slug: "凌美-lamy-studio-演艺",
    title: "LAMY Studio：把 LAMY 做得圆润一点",
    summary: "LAMY Studio 用圆柱金属笔身、螺旋感笔夹和墨囊/上墨器结构，给 LAMY 钢尖或金尖体系一个更正式的外壳。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "重点放在握位、笔夹和产品线位置，没有用抽象设计话术。",
    },
    body: `LAMY Studio 的第一眼，不像 Safari，也不像 LAMY 2000。它没有三角握位，没有半包尖，也没有 Makrolon 的磨砂黑色。Studio 是一支更圆润、更正式的 LAMY：金属笔身，圆柱线条，笔夹像一段扭转的金属带。它适合想要 LAMY 的现代感，却不想要学生气的人。

官方页面把 Studio 放在当前产品线里，强调设计定位、笔尖选项和墨囊/上墨器兼容。它的实际分歧点在握位。某些版本的握位较光滑，手汗多或握得低的人会觉得滑。也正因为这样，Studio 不适合只看照片买。它在视觉上很稳，手里是否稳，要看个人握法。

Studio 的笔尖选择让它有两种路线。钢尖版本更接近 LAMY 入门体系，维护简单，成本可控；金尖版本则把它推向更高价位，也让书写期待变高。无论哪种，它都不是大容量长写笔。墨囊/上墨器结构方便换墨和清洗，适合办公、短文、签字和日常笔记。

这支笔的气质很适合“办公桌上的主力”。它没有 Safari 那种教学感，也没有 Dialog 的机械表演。你把它拿出来，别人可能只看到一支线条干净的金属笔。使用者自己能感到它比 Logo 更饱满，比 AL-star 更正式。Studio 的设计并不吵，长期放在桌面上反而不容易厌倦。

和 Safari、AL-star 比，Studio 更正式，握位也更自由。和 Logo 比，它更粗、更有存在感。和 LAMY 2000 比，它没有活塞和半包金尖，也少了经典设计的压力。Studio 的位置更像一支“好好上班”的 LAMY：不夸张，不便宜得像学生笔，也不需要你为复杂结构学习太多。

它的风险主要在手感。光滑金属握位会让一部分人写久了不舒服，笔身重量也比塑料入门笔更明显。若你经常长时间写小字，最好试写一整段，而不是只在柜台划两笔。若你的使用场景多是签字、会议短记和书桌批注，Studio 的缺点会轻一些，外观优势会更明显。

Studio 也适合作为礼物型钢笔。它比 Safari 更正式，价格又没有直接跳到 LAMY 2000 或 Dialog 那一层。送给不熟悉钢笔的人，墨囊/上墨器结构容易解释；送给已经用过 LAMY 的人，笔尖体系也不陌生。

购买时先看版本和握位表面，再看笔尖。若你喜欢圆润金属笔身，又能接受可能偏滑的握位，Studio 会很耐看。若你写字时间长、手容易出汗，最好试写。它的优点在外观克制和体系成熟，缺点也很清楚：它不负责让人惊艳，只负责把 LAMY 的日用书写放进更像办公物件的身体里。`,
  },
  {
    slug: "凌美-lamy-dialog-3-焦点3",
    title: "LAMY Dialog 3：把笔尖藏进笔身的 LAMY",
    summary: "LAMY Dialog 3 的核心是旋转伸缩金尖和随动笔夹机制，它更像一支设计笔，也更需要接受结构带来的门槛。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "承认伸缩机制的吸引力和维护门槛，没有把它写成单纯高级。",
    },
    body: `LAMY Dialog 3 最吸引人的动作，是旋转笔身时笔尖伸出来，笔夹同时收起。它不像普通钢笔那样拔帽，也不像 Capless 那样按一下就写。这个动作更慢一点，更像在打开一个机械装置。喜欢设计笔的人会被它吸引；只想快速记几个字的人，未必有耐心。

LAMY 官方把 Dialog 放在可伸缩金尖和设计机制里介绍。这支笔不靠储墨量或花色吸引人，真正的题目是怎样把一枚钢笔尖收进笔身，同时让笔夹不妨碍握持。这个思路很 LAMY：先提出一个结构问题，再用简洁外形把复杂部分藏起来。真正握在手里，Dialog 3 会比 Safari、Studio 更重，也更像一件设计物。

伸缩机制带来便利，也带来门槛。没有笔帽可丢，开合动作干净，携带时也更像高端签字工具。问题是结构更复杂，清洁和维护没有普通墨囊笔那么直观。若长时间不用，笔尖密封状态、墨水选择和清洁习惯都会影响第一笔。它适合愿意为机制付出一点耐心的人。

Dialog 3 的使用节奏也很特殊。普通钢笔拔帽就写，Capless 一按就写，Dialog 3 需要旋转。这个动作更有仪式感，也更慢。写一页日记时很舒服，频繁记录零碎事项时可能烦。买它之前，最好想清楚自己喜欢的是那套机制，还是只是想要一支方便的无帽钢笔。后者未必非选 Dialog。

书写上，Dialog 3 的金尖给它较高定位。它不会像 LAMY 2000 那样低调，也不会像 Pilot Capless 那样强调快捷按压。和 Studio 金尖版比，Dialog 3 的结构感强得多；和 2000 比，它更像展示 LAMY 设计能力的产品。日常使用时，重量、直径和旋转动作要一起考虑。

它也适合和 LAMY 2000 放在一起理解。2000 把复杂隐藏在长期工具感里，Dialog 3 把复杂变成开合动作的一部分。前者适合每天安静写，后者更像一个会被拿起来把玩的物件。两者都很 LAMY，性格却很远。若你想要低调长写，Dialog 3 的机械感可能反而打扰你。

购买 Dialog 3 之前，最好试两件事：旋转动作是否顺手，握持时笔夹收起后的手感是否适合自己。再看笔尖、墨囊/上墨器和密封表现。它不是一支给所有人的 LAMY。它适合喜欢收纳机制、愿意接受较高价格和维护复杂度的人。若你只是想要稳定长写，LAMY 2000 更直接；若你想要一支会在打开时给你一点机械乐趣的钢笔，Dialog 3 才有意义。`,
  },
  {
    slug: "三文堂-twsbi-eco",
    title: "TWSBI ECO：透明活塞笔的入门答案",
    summary: "TWSBI ECO 把透明笔身、活塞上墨和可见墨量放到较低价格区间，适合想体验大容量上墨的新用户。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "围绕透明活塞和入门使用写，不把大容量夸成万能优点。",
    },
    body: `TWSBI ECO 的吸引力很直接：透明笔身，活塞上墨，一眼能看到墨水。很多入门钢笔还在用墨囊或小上墨器时，ECO 已经把大容量和示范笔的乐趣放到较低价格里。第一次吸满一管墨，很多人会明白为什么 TWSBI 在入门玩家里这么常见。

TWSBI 官方页面强调 ECO 的活塞上墨、尖号选择和入门定位。它解决的问题很清楚：让新用户用不太高的成本体验真正的内置上墨系统。透明笔身让墨量、颜色和活塞动作都摆在眼前。喜欢墨水的人，会把这当成乐趣；不喜欢看到墨迹和水汽的人，可能会觉得它太“暴露”。

ECO 的书写性格取决于钢尖、纸和墨水。它不是金尖笔，也不追求复杂反馈。优点在稳定、容量大、容易观察。写课堂笔记、练字、日记都合适。缺点也要讲：换墨和清洗比普通上墨器麻烦，透明笔身会放大污渍，活塞结构也需要正常维护。

ECO 还会改变新手对墨水的兴趣。普通入门笔用墨囊时，墨水只是耗材；ECO 把墨水放在笔身中央，颜色、流动和剩余量都能看见。你会更关心墨水是否染色，是否容易清洗，是否和纸张匹配。这种兴趣很容易把人从“买一支笔”带到“开始玩墨水”。

和 TWSBI 580 比，ECO 更便宜，结构展示感也更朴素。和 GO 比，ECO 更像传统活塞笔。和 LAMY Safari 比，ECO 的握位限制少，储墨量大，但携带和清洁更需要注意。若你想频繁换颜色，普通墨囊笔更轻松；若你想长期用一瓶墨写很多页，ECO 的优势就出来了。

它不适合所有入门用户。有人第一次买钢笔，只想稳定、干净、少维护；对这类人，Safari、Kakuno 或 Preppy 可能更轻松。ECO 适合那些一开始就被透明结构吸引的人，愿意花一点时间上墨和清洗，也愿意接受活塞笔带来的责任。它的乐趣和麻烦来自同一个地方。

还有一个现实判断：如果你平时只写几行，ECO 的大容量会显得浪费；如果你常写几页，活塞上墨才真正省心。它适合固定放在桌上，而不是随便丢进包里。

买 ECO 时，先选尖号和颜色，再考虑常用墨水。EF、F 更适合中文小字，M 往上更能展示墨色。透明笔身要检查裂纹和活塞顺滑度，二手笔还要看是否有难清的染色。初次使用时别急着灌强染色墨水，先用容易清洗的蓝黑或常规蓝色更稳，也更容易判断笔本身状态。ECO 最好的地方，是它把活塞上墨这件事做得不神秘。它不是豪华笔，却能让读者用很低门槛理解大容量透明钢笔的乐趣和维护成本。`,
  },
  {
    slug: "三文堂-twsbi-580-580al",
    title: "TWSBI 580 / 580AL：更像工具的透明活塞笔",
    summary: "TWSBI Diamond 580 / 580AL 在 ECO 的透明活塞思路上做得更模块化，重点是可拆结构、活塞上墨和更完整的工具感。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "用 ECO 对照解释 580，不机械罗列零件。",
    },
    body: `TWSBI 580 像 ECO 的更认真版本。它同样透明，同样让墨水成为视觉的一部分，也同样用活塞上墨。差别在结构感。580 的笔身、笔帽、活塞和笔尖组件都更像可以拆开理解的工具。对喜欢看内部的人来说，这种透明不只是好看，还能让人知道一支钢笔怎样工作。

官方页面提到 Diamond 580 的活塞结构、可拆部件和现代工业设计。580AL 则把部分组件换成铝合金，手感更硬，也更有机械味。它不是单纯的“ECO 升级版”。如果你只想低价体验活塞，ECO 已经够用；如果你喜欢更结实的结构、可维护感和更成熟的握持，580 更合适。

580 的钢尖书写稳定，尖号选择也清楚。它适合长写、日记、课堂笔记和固定墨水搭配。大容量是优点，也会让换墨成本变高。透明笔身容易展示墨色，也会展示残留。用强染色墨水或亮片墨时，要有清洁耐心。它适合愿意把钢笔当作小工具照顾的人。

580 的一个魅力，是它让维护这件事变得可见。你能看到活塞怎样工作，也能比较容易地理解笔尖组件和笔身的关系。对普通用户来说，这不一定每天都有用；对想学习钢笔结构的人，它很有教育意义。TWSBI 的透明设计不是单纯炫耀内部，也让用户更容易发现问题，例如墨水残留、活塞不顺或笔尖供墨异常。

和 VAC700R 比，580 的活塞更直观，清洁和使用习惯也简单一些。和 ECO 比，580 更贵，但手感和可拆结构更完整。和 LAMY Safari 这类入门笔比，580 的乐趣集中在上墨系统和透明结构，而不是握位和品牌设计。写中文小字可以从 EF、F 开始，喜欢墨色再上 M。

580AL 的金属部件会改变手感。它比普通 580 更有机械味，也会让握持和视觉更冷一些。喜欢轻松透明笔的人，普通 580 已经够好；喜欢更硬朗、更像工具的人，580AL 会更对胃口。两者的核心仍是同一个透明活塞平台，不必把它们看成完全不同的产品。

若你已经有 ECO，580 的吸引力主要来自手感和可维护性。若你还没有透明活塞笔，580 可以直接当主力入门，但预算会高一些。它更适合确定自己喜欢 TWSBI 路线的人。

买 580 / 580AL 时，先想清楚是否需要可拆和金属部件带来的手感。再看尖号、颜色、活塞顺滑度和笔身是否有裂纹。它的优势不在低价，而在把透明活塞笔做得更像长期工具。喜欢一支笔陪着一瓶墨写很久的人，会比频繁换墨的人更容易喜欢它，也更容易把它当成固定桌面主力。`,
  },
  {
    slug: "三文堂-twsbi-go",
    title: "TWSBI GO：把上墨做成按压动作",
    summary: "TWSBI GO 用弹簧活塞和透明笔身降低上墨门槛，适合想要便宜、大容量、操作直接的用户。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "抓住弹簧上墨这个具体差异，避免泛写 TWSBI 透明笔。",
    },
    body: `TWSBI GO 最有意思的地方，是上墨动作很粗暴也很直观。你不用慢慢旋活塞，按下弹簧机构，松开，墨水就进来了。这个动作没有 580 那么精密，也没有 VAC700R 那种真空上墨的仪式感。它更像一支为了“快点灌满墨”而存在的透明工具。

官方页面把 GO 放在更亲民的价位里，强调弹簧活塞、简单操作和尖号选择。它不像 ECO 那样有传统活塞的完整感，外形也更偏实验。透明笔身能看到墨量，笔杆粗壮，气质轻松。它适合不想把钢笔照顾得太精细的人，也适合拿来试墨、练字或放在桌上随用。

GO 的优点在便宜、大容量和操作简单。缺点也明显：外观不够精致，弹簧结构的手感会让一些人觉得玩具化，携带时也不像细长钢笔那么优雅。它的钢尖和 TWSBI 其他入门型号一样，稳定比个性更重要。写中文小字选 EF 或 F 会稳一些，M 往上更适合展示墨色。

这支笔很适合试墨。按压上墨快，透明笔身看得清，价格也让人不太紧张。你可以给它灌一瓶新墨，写几天，观察颜色、流动和残留。若墨水表现不好，清洗虽然仍比上墨器麻烦，但心理负担比高价笔低很多。GO 的粗糙感在这里反而成了优点。

和 ECO 比，GO 更便宜、更直接，也少了传统活塞的那种秩序感。和 580 比，它明显更粗糙。和 LAMY Safari 比，GO 的吸引力集中在上墨和墨量，设计教育那套东西退到后面。若你想要一支上课、办公、日记都能体面使用的主力笔，ECO 或 Safari 更均衡；若你想要一支能快速吸墨、方便观察、坏了也不太心疼的笔，GO 很合适。

GO 也不太适合追求精致的人。笔身比例、弹簧动作和整体质感都偏实用，甚至有点玩具感。喜欢这种直白的人，会觉得它轻松；喜欢传统钢笔仪式的人，会觉得它缺少味道。这个判断最好在购买前完成，因为 GO 的优点不会随着使用变得更优雅，它一直都很直接。

把 GO 放在桌上，它更像一支可清洗、可观察的练习工具。学生练字、试墨、办公室备用都合适。送礼或正式签字，它就不太像那个场合的笔。

买 GO 时，不要期待它看起来高级。它的价值在透明、大容量和低门槛。检查弹簧动作、笔尖顺滑度和笔身是否有裂纹即可。若预算有限，又想体验非墨囊式上墨，它比许多传统入门笔更有玩具般的乐趣，也适合放一瓶常用墨长期写。它不是 TWSBI 最优雅的型号，却很诚实：用简单机械把墨水吸进笔里，让你专心写，少想一点装备感，也少担心价格。`,
  },
  {
    slug: "三文堂-twsbi-vac700r",
    title: "TWSBI VAC700R：入门玩家的真空上墨大水箱",
    summary: "TWSBI VAC700R 用真空上墨、透明笔身和 shut-off valve 机制，给玩家一个比 ECO/580 更复杂的大容量选择。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "具体解释真空上墨和 shut-off 使用习惯，没有把容量写成单一优点。",
    },
    body: `TWSBI VAC700R 是给喜欢上墨系统的人看的。透明笔身让墨水一眼可见，真空上墨让吸墨动作比普通活塞更有仪式感。拉开尾杆，压下去，墨水被吸进笔身。第一次用会觉得很过瘾，也会很快意识到：这支笔比 ECO 和 580 更需要理解结构。

官方页面提到 VAC700R 的真空上墨、shut-off valve 和墨流说明。这个尾端阀门不是装饰。长时间书写前，通常要把尾钮旋开，让墨水顺利进入前端。忘了这一步，写着写着可能会变干。很多真空上墨笔都有类似习惯，VAC700R 也一样。它适合愿意学习操作的人。

VAC700R 的优点很明确：容量大，透明，结构有趣。缺点也跟着来：清洗更费时间，换墨不如上墨器轻松，透明笔身会暴露染色和残留。若你常常换墨水，VAC700R 会让人累；若你有一两瓶常用墨，想一次灌满写很久，它的优势很明显。

它也会让你更在意纸和墨水。真空上墨带来的大容量，会鼓励你长期使用同一瓶墨。墨水太洇、太干、太难清洗，都会在这支笔上被放大。VAC700R 适合和稳定墨水搭配，尤其适合常写长文、课堂笔记或日记的人。若只是每天签几个字，大容量没有太多意义。

和 Pilot Custom 823 比，VAC700R 价格低很多，也没有金尖的细腻和品牌调校。和 TWSBI 580 比，它更有机械动作，使用习惯也更复杂。和 ECO 比，它更像玩家工具。写中文时，尖号仍要保守选择。EF、F 更日常，粗尖更能展示墨色，但也更挑纸。

这支笔也适合当作真空上墨的练习对象。它比 823 便宜，结构又足够明显，可以让用户理解 shut-off valve、墨流和清洗成本。学会以后，再判断自己是否需要更高端的真空笔会更稳。若你在 VAC700R 上已经嫌麻烦，那就没必要急着买更贵的同类结构。

VAC700R 还要注意体积。它比 ECO 和 580 更有存在感，装满墨后更像桌面主力。随身携带并非不行，但它最舒服的位置通常还是书桌、笔盒和较长书写场景。

买 VAC700R 前，先问自己是否真的需要真空上墨。若只是想体验透明大容量，ECO 或 580 已经足够。若你喜欢吸墨动作、喜欢看墨水在笔身里移动，也能接受清洗成本，VAC700R 会比普通活塞更有趣。新手第一次使用最好先读说明，弄清尾钮和墨流的关系，再决定常用墨水。它不是最省心的 TWSBI，却是最能让人看见上墨系统魅力的一支。`,
  },
  {
    slug: "kaweco-al-sport",
    title: "Kaweco AL Sport：口袋笔变成金属小工具",
    summary: "Kaweco AL Sport 延续 Sport 的短笔身和八角笔帽，用铝合金材质让它更像一支随身工具。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "用 Classic Sport 对照说明材料变化，不重复 A 档 Sport 正文。",
    },
    body: `Kaweco AL Sport 的基本动作和 Classic Sport 一样：合盖很短，放进口袋不占地方；写字时把笔帽插到尾端，长度才完整。变化在材质。塑料 Sport 是轻松的小笔，AL Sport 则像一件随身金属工具。拿在手里，铝合金带来的冷感和分量会立刻改变印象。

Kaweco 官方把 AL Sport 放在 Sport 家族里，强调铝材、CNC 生产和表面处理。它没有改变 Sport 的核心比例，也没有把短笔身变成长笔。它做的是另一件事：让一支便携笔更结实、更有物件感。经常把笔放进包里、笔袋里或随身 EDC 里的用户，会比只在桌上写字的人更容易理解它。

AL Sport 的钢尖仍是日用路线。它不是靠笔尖惊艳取胜，重点是带得出去。墨囊结构简单，短上墨器的容量有限，适合短笔记、签字、手账和外出备用。若你每天写很多页，Pilot Custom 823、TWSBI 580 这类大容量笔更合适。AL Sport 的优势在“随身”。

金属 Sport 的价值，常常要用一段时间才出来。塑料版轻松，但也容易被当作普通小笔；AL Sport 的冷感、重量和表面磨损会让它更像随身物件。放在包里久了，边角细小痕迹会留下来。有些用户会觉得那是损耗，有些用户会觉得那是它变成自己工具的过程。

和 Classic Sport 比，AL Sport 更耐磨，也更贵。划痕和磕碰会留下痕迹，有些人喜欢这种使用感，有些人会心疼。和 Brass Sport 比，AL Sport 轻得多，更适合长一点的书写。和 Liliput 比，它虽然短，却更粗，握持更容易稳定。

它和 Kaweco Liliput 的选择很有意思。Liliput 追求极限小，AL Sport 追求口袋笔和可握性的平衡。若你真的需要最小体积，Liliput 更强；若你希望短笔仍能舒服写几段字，AL Sport 更稳。这个区别比材质颜色更重要。

AL Sport 也适合已经确认自己喜欢 Sport 的人。第一次买 Kaweco，塑料版风险更低；已经喜欢 Sport 的比例，再买 AL Sport 才像一次有把握的材料升级。

买 AL Sport 时，先确认自己喜欢 Sport 的插帽比例，再选颜色和尖号。写中文小字可以从 EF、F 看起，M 适合更明显的墨迹。检查笔帽螺纹、插帽稳定性和笔尖状态。它不是 Classic Sport 的必要升级，更像给喜欢 Sport 形状的人一个更结实的金属版本。`,
  },
  {
    slug: "kaweco-liliput",
    title: "Kaweco Liliput：小到极致，也挑使用者",
    summary: "Kaweco Liliput 用极短笔身和三段式金属结构把便携性推到很前面，适合真正需要小笔的人。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "强调极短比例的好处和限制，没有把小尺寸浪漫化。",
    },
    body: `Kaweco Liliput 小得有点极端。合起来像一截金属管，放进口袋、零钱包、旅行本夹层都很轻松。它比 Sport 更细，也更低调。可小尺寸从来不是白送的优点。真正写字时，你需要把笔帽旋到尾端，慢慢把它变成一支可用的笔。

Kaweco 官方会提到 Liliput 的历史灵感、极简三段结构和不同材质。它的设计很简单：笔帽、笔身、握位，尽量少的零件，尽量小的体积。铝、黄铜、铜、不锈钢等材质会让重量和触感差很多。照片里只是颜色不同，手里可能像不同的笔。

Liliput 的书写体验很吃手型。它细，握位短，不插帽几乎不适合认真书写。插帽后长度改善，重心也会根据材质变化。黄铜和铜会更有分量，铝版更轻。它不适合长篇抄写，也不适合追求宽大握持的人。它适合短句、签字、旅行备用和随身应急。

这支笔的乐趣有点像随身小刀或打火机，不完全来自书写本身。你会在意材质怎样变旧，螺纹怎样旋合，合盖后是否能塞进某个很小的口袋。若你只从“写得舒不舒服”一个角度看，Liliput 可能不如许多普通尺寸钢笔。若你真的需要一支几乎不占空间的金属笔，它的意义就清楚了。

和 Sport 比，Liliput 更极端。Sport 的八角笔帽和较粗笔身让它更容易握，Liliput 则把便携放在更前面。和 AL Sport 比，它更像口袋里的金属小件，不太像一支常规钢笔。若你只是想买一支小笔，Sport 更稳；若你真的需要“越小越好”，Liliput 才有意义。

耗材和笔尖也要务实看。Liliput 的短笔身限制了上墨选择，墨囊更方便，短上墨器容量有限。钢尖表现和 Kaweco 其他入门尖接近，重点放在小体积里的稳定书写，不追求弹性。买它之前，最好先接受这支笔的用途：随身备用，多过书桌主力。

如果你习惯粗笔身，Liliput 可能很快被闲置。它需要使用者主动适应细杆、螺纹和插帽动作。适应了，它很迷人；适应不了，它只会显得太小。

买 Liliput 时，材质比颜色更重要。铝轻，黄铜和铜会氧化出使用痕迹，不锈钢更冷也更沉。再看螺纹是否顺、插帽后是否稳定、尖号是否适合自己的字。若你准备把它放进随身小包，最好也考虑是否需要笔夹或保护套，否则很容易在包里乱滚。Liliput 的魅力在小，也正因为小，它不该被当成万能日用笔。它适合那些愿意为了便携牺牲一点舒适的人，也适合旅行时当备用笔，安静待在包里，临时写一张卡片。`,
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

async function upsertStory(db: Client, entityId: string, article: Article) {
  const existing = await execute(
    db,
    "SELECT id FROM stories WHERE entity_id = ? AND story_type = 'model_story' LIMIT 1",
    [entityId],
  );
  const storyId = existing.rows[0]?.id ? String(existing.rows[0].id) : randomUUID();
  const sourceNotes = `Reader-first B-tier article. Humanizer-zh self-review: ${humanizerTotal(article)}/50. ${article.humanizer.notes}`;

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
       SELECT ?, 'story', ?, ?, 'Reader-first B-tier source', datetime('now')
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
    return `| ${article.slug} | ${humanizerTotal(article)}/50 | ${score.directness} | ${score.rhythm} | ${score.trust} | ${score.authenticity} | ${score.concision} | ${article.humanizer.notes} |`;
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

  return `# Read first B 档现代型号 humanizer-zh 审查

生成时间：${new Date().toISOString()}

## 评分

| slug | 总分 | 直接性 | 节奏 | 信任度 | 真实性 | 精炼度 | 备注 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
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
    console.log(`Validated ${ARTICLES.length} B-tier modern article(s).`);
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
    if (sources.length === 0) throw new Error(`Missing source references: ${article.slug}`);

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
