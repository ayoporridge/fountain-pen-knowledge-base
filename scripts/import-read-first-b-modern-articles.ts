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
];

const ARTICLES: Article[] = [
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
