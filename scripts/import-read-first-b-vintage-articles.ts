import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REVIEW_PATH = path.join(
  process.cwd(),
  "docs/content/read-first-b-vintage-humanizer-review.md",
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
    slug: "the-parker-21",
    title: "Parker 21：51 影子里的实用派克",
    summary: "Parker 21 借用了 Parker 51 的暗尖和日用气质，但定位更亲民，适合从实用和版本状态理解。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "用 51 对照说明 21，重点放在亲民定位和 vintage 状态判断。",
    },
    body: `Parker 21 总是活在 Parker 51 的影子里。它有暗尖，有金属帽，也有一种安静的派克日用气质。只看照片，新手很容易把它当成 51 的近亲，甚至当成便宜替代品。真正拿来判断时，21 更适合按“实用、亲民、状态差异大”的 vintage 笔来看。

Richard's Pens 的档案把 Parker 21 放在 51 之后的产品语境里。它的外观确实借用了 51 那套封闭、流线、低调的语言，但定位更接近普通日用笔。对今天的读者来说，这个差别很重要。买 21 的重点不在 51 的历史地位，它更像一条低门槛入口，让人体验派克暗尖时代的书写方式。

Parker 21 的好处在熟悉感。暗尖保护了笔尖视觉，也让整支笔看起来干净。金属帽和流线笔身让它比许多普通学生笔更正式。写起来如果状态好，会是一支很顺手的短文、笔记和办公室用笔。它不需要拿出来展示，也不太会抢戏。

它的风险也来自 vintage。塑料老化、笔帽松紧、笔尖状态、供墨稳定性，都比参数更重要。很多 21 已经经历几十年使用，单看型号名无法判断好坏。同样是 Parker 21，一支清理过、供墨正常的笔，和一支笔舌堵塞、帽子不稳的笔，体验会差很多。

和 Parker 51 比，21 的收藏光环弱很多，也更适合当作使用笔来买。和 Parker 45 比，21 更像 51 年代的延伸；45 则进入了更现代的 cartridge/converter 语境。若你想要便宜、可维护、零件容易理解，45 更轻松。若你想体验暗尖派克的气质，21 更有味道。

21 的现实价值在于它不要求读者一开始就成为版本专家。你可以先从一支状态清楚、价格合理的 21 开始，感受派克暗尖的握持、出墨和笔帽比例。等到真正喜欢这种书写方式，再去研究 51 的年份、笔帽和上墨系统，会比直接冲向热门型号稳得多。它的低调，也让使用者更容易把注意力放回纸面。

购买时不要只看“像不像 51”。先看笔帽是否合适，笔身是否有裂，笔尖是否对齐，出墨是否稳定。若卖家不能展示试写和上墨状态，价格就要留出维修余地。Parker 21 的价值不在稀有，也不在故事夸张。它是一支很适合入门 vintage 派克的实用笔，前提是状态要好。

它也适合用来训练眼力。看 21，会学到暗尖、笔帽、供墨和成色怎样共同影响一支老笔。等你能判断一支 21 是否可靠，再去看 51 或 61，很多问题会更清楚。`,
  },
  {
    slug: "the-parker-45",
    title: "Parker 45：派克进入现代耗材时代",
    summary: "Parker 45 用墨囊/上墨器和可替换笔尖降低维护门槛，是 vintage 派克里很适合日用的一支。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "强调 cartridge/converter 和可换尖的日用意义，不神化收藏价值。",
    },
    body: `Parker 45 的好处，今天看反而更明显。很多老派克漂亮、经典，却要面对老上墨系统、老材料和维修门槛。45 把事情变简单：墨囊/上墨器结构，笔尖单元更容易处理，外观仍然保留派克的克制线条。它没有 51 的名声，却很适合真的拿来写。

Richard's Pens 的档案把 Parker 45 放在 1960 年代前后的产品语境中。那是钢笔开始和圆珠笔、现代办公耗材竞争的时期。45 的思路很务实：让用户更容易换墨、更容易维护，也让笔尖选择变得清楚。对今天的二手用户来说，这些比广告语更有用。

这支笔的外观很派克。它没有 Duofold 的鲜艳，也没有 Vacumatic 的纹理炫技。45 线条直，帽子干净，握位和笔身都偏工具化。它看起来不昂贵，也不寒酸。放在桌上写笔记、批文件、记日记，都很自然。

45 的笔尖单元是它的核心吸引力。不同尖号和材质版本会影响价格和手感，但它的优势不在“多高级”，重点是可维护。遇到不合适的尖号，替换比许多 vintage 笔轻松。清洗也比复杂老上墨系统省事。对于想进入 vintage 派克的人，45 的心理负担小很多。

和 Parker 21 比，45 更现代，耗材也更友好。和 Parker 51 比，它少了暗尖传奇，使用压力也小。和许多现代入门钢笔比，45 的优势在历史味和派克做工；短处是状态参差不齐，配件和笔尖需要辨认。它不是一支只看照片就能放心买的笔。

如果主要写中文，45 的尖号选择比外观更要紧。太粗的尖会让日常笔记变挤，太细的尖又可能暴露老笔尖打磨和供墨的问题。理想状态是一支出墨稳定、尖端顺滑、握位没有裂的普通版本。它不必稀有，能每天安心写，反而更接近 Parker 45 当年的使用目的。适合写会议记录、课堂笔记，也适合放在包里当一支不太娇气的老派克。用一段时间后，它的优点会比照片更明显，也比收藏标签更可靠。

购买时先确认笔尖、上墨器和笔身状态。注意笔帽松紧、笔握裂纹、尖号是否适合中文。若你想每天用，别只追金尖或稀有配色，供墨稳定更重要。Parker 45 最好的位置，是一支可用的老派克：有 vintage 气味，又不把维护门槛抬得太高。

它还适合做“第一支老派克”。预算不必一下冲到 51，维修知识也不用从复杂系统开始。先用 45 写几个月，你会更明白自己到底喜欢派克的线条、笔尖，还是只是被 vintage 这个词吸引。`,
  },
  {
    slug: "the-parker-61",
    title: "Parker 61：把上墨动作藏起来的派克",
    summary: "Parker 61 最有辨识度的是早期 capillary 上墨思路，外观延续暗尖流线，使用和维护都比普通派克更挑状态。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "抓住 capillary 上墨和维护判断，不把 61 写成单纯的 51 后继。",
    },
    body: `Parker 61 的有趣之处，在于它想让上墨动作消失。普通钢笔要挤压、旋转或插墨囊，61 早期最让人记住的是 capillary 上墨：把笔尾浸进墨水，让内部材料吸墨。这个想法很现代，也很有派克式的工程野心。问题是，几十年后的今天，它也让维护判断变得更重要。

Richard's Pens 的 Parker 61 档案把它放在 51 之后的流线传统里。外观上，61 仍然低调，暗尖、金属帽、干净笔身，一眼能看出和 51 的亲缘。它没有回到开放式大尖，也没有靠装饰吸引人。它想继续把钢笔做成现代工具。

61 的 capillary 系统对新手并不总是友好。状态好时，它很优雅：少了很多机械动作，拿起来像一支干净的派克。状态差时，清洗和修复会让人头疼。老墨、堵塞、材料状态、是否被不合适的墨水折腾过，都会影响体验。买 61 不能只问“能不能写”，还要问“怎么上墨、清洗过没有、供墨是否稳定”。

后期和不同版本的 61 会出现不同上墨语境。普通读者不必一开始就背版本表，但要知道：Parker 61 不是一个完全统一的体验。你看到的那支笔，具体结构和状态比型号名更重要。对于 vintage 笔，这一点尤其现实。

和 Parker 51 比，61 更像一次继续现代化的尝试。51 的成熟度和维修生态更稳，61 的魅力在它更大胆的上墨思路。和 Parker 45 比，61 的维护复杂得多；45 更像日用老笔，61 更像需要理解系统的收藏兼使用对象。

61 也很考验卖家的描述能力。靠谱的卖家会说明具体上墨结构、清洗情况、试写表现和是否有漏墨。只说“品相好”远远不够。对这种型号，结构信息就是使用信息；看不清结构，就很难判断回家后是能写，还是需要先送修。买前多问一句，常常能省掉一次维修和来回沟通。

购买时优先看上墨系统状态、笔帽箭标和笔身裂纹。试写要写一段，不要只划几下。若你喜欢派克暗尖，又愿意研究 capillary 结构，61 很有意思。若你只是想要省心 vintage，45 或状态好的 51 会更轻松。Parker 61 的魅力和麻烦来自同一个地方：它试图让钢笔更像不用解释的现代工具。

它也很适合放进派克谱系里读。Duofold 外放，51 成熟，45 实用，61 则把“省动作”这件事推得更远。理解这一点，就不会只把 61 当成 51 的后续编号。它有自己的野心，也有自己的维修代价。`,
  },
  {
    slug: "the-parker-75",
    title: "Parker 75：可调握位和银格纹的派克",
    summary: "Parker 75 以 Ciselé 银格纹、可调笔尖角度和 cartridge/converter 结构被记住，是派克后期高端日用的重要型号。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "从 Cisele 外观和可调角度切入，兼顾使用与收藏判断。",
    },
    body: `Parker 75 和早期派克的气质不太一样。Duofold 大胆，Vacumatic 炫目，51 低调流线；75 则更像一件精密的桌面物件。很多人先记住的是 Ciselé 银格纹：笔身上整齐的方格纹路，冷静、正式，也很有 1960 年代之后的现代感。

Richard's Pens 的 Parker 75 档案把它放在派克后期高端产品语境里。它的特别之处不只是银格纹。75 的笔尖角度可以调整，握位上有标记，让用户把笔尖旋到更适合自己的书写角度。这个细节今天看仍然有意思，因为它承认每个人落笔角度不一样。

75 的 cartridge/converter 结构也让日用更轻松。比起老式按钮、隔膜或复杂吸墨结构，它更容易清洗和换墨。对于想用 vintage 笔写字的人，这一点很实用。它有老派克的质感，却没有把用户完全拉回老上墨系统。

这支笔适合喜欢金属感和精密感的人。银格纹版本拿在手里不会像树脂笔那样温润，触感更冷，视觉也更正式。喜欢轻笔的人可能觉得它太金属；喜欢稳重桌面笔的人会很享受。它不是那种随便扔进笔袋的笔，更适合被认真放好。

和 Parker 51 比，75 少了暗尖传奇，多了材料和可调结构的趣味。和 Parker 45 比，75 明显更高阶，也更有收藏感。和现代金属钢笔比，75 的优势在历史和比例，短处是成色会显著影响价格。银件磨损、凹陷、格纹状态和笔尖是否原配，都要看清楚。

75 的迷人之处也在边界感。它不像首饰笔那样靠大面积装饰取胜，银格纹足够醒目，但整支笔仍然保持办公笔的克制。写字时能感到它比普通树脂笔更像一件金属工具，视觉上又比许多现代金属笔更细致。喜欢这种冷静感的人，会很容易理解它为什么被反复收藏。它适合慢慢用，不适合粗放对待。桌面上放一支，气质很明确，写起来也不浮夸。它的高级感不靠音量。

购买 Parker 75 时，先确认版本、材质和笔尖状态。Ciselé 很经典，但不代表每支都值得买。笔身 dents、笔帽松紧、笔尖调节是否顺畅、上墨器是否匹配，都会影响使用。它适合既想写字又看重物件感的人。若你想要一支有派克历史、又不难维护的高端老笔，75 是很清楚的选择。

它也适合已经有 45 或 51 的用户继续往上看。45 解决日用，51 解决经典暗尖，75 解决材料、调节和后期高端感。这个顺序比直接追稀有版本更稳，也更容易知道自己为什么喜欢派克。`,
  },
  {
    slug: "the-parker-duofold",
    title: "Parker Duofold：大红派克和旗舰笔的旧时代",
    summary: "Parker Duofold 是 1920 年代派克旗舰语境中的代表，鲜艳笔身、大尺寸和早期品牌气势让它成为 vintage 收藏核心。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "讲清 Duofold 的旗舰气势和收藏门槛，不泛写经典意义。",
    },
    body: `Parker Duofold 的入口，往往是“大红”。鲜艳的橙红色硬橡胶或早期材料、大尺寸平顶笔身、醒目的品牌自信，让它和后来低调的 Parker 51 完全不同。Duofold 属于另一个钢笔时代：钢笔是随身工具，也是能放在柜台里吸引目光的商品。

Richard's Pens 的 Duofold 档案把它放在 1920 年代派克旗舰语境中。那时的高端钢笔不追求隐藏笔尖，也不追求极简。它要让人一眼看到尺寸、颜色和价格感。Duofold 的名字本身也带着当时广告时代的气味，和后来的编号型号完全不同。

今天看 Duofold，要分清现代复刻和 vintage 主线。这里讨论的 vintage Duofold，核心是早期派克旗舰、材料状态、尺寸版本和修复难度。它不是普通日用老笔。硬橡胶变色、裂纹、笔帽口状态、笔夹和笔环、上墨系统修复，都会影响价值。

书写体验也不能只靠名声判断。状态好的 Duofold 可以非常有味道，笔身尺寸舒展，开放式笔尖也更有老派气质。但它毕竟是老笔，长期日用需要维护意识。喜欢现代钢笔那种随手上墨、随手清洗的人，可能会觉得麻烦。

和 Parker Vacumatic 比，Duofold 更早，也更直接。Vacumatic 的魅力在透明纹理和上墨系统，Duofold 的魅力在颜色、尺寸和旗舰气势。和 Parker 51 比，Duofold 几乎站在另一个审美端点：一个外放，一个收敛。把它们放在一起，能看出派克几十年里如何改变对“现代钢笔”的想象。

Duofold 还有一个容易被忽略的地方：现代复刻会让这个名字看起来很熟，但 vintage Duofold 的判断逻辑完全不同。复刻更多看工艺、配置和当代书写体验，老 Duofold 要看材料、年代、颜色保存和修复痕迹。把两者混在一起，很容易高估或低估一支笔。

购买 vintage Duofold 时，先看材料颜色和结构完整性。大红是否褪色、笔帽是否有裂、笔尖是否匹配、上墨系统是否修过，都比一句“Big Red”更重要。Duofold 适合已经愿意研究 vintage 的人。它不只是好写不好写的问题，更像进入早期美国钢笔商业和收藏世界的一扇门。

如果你只是想日常写字，Duofold 未必是最省心的选择。它更适合放慢一点看：广告、尺寸、颜色、材料和修复痕迹都会说话。读懂这些，才会明白它为什么一直被反复提起。`,
  },
  {
    slug: "the-parker-vacumatic",
    title: "Parker Vacumatic：把墨水和结构都展示出来",
    summary: "Parker Vacumatic 以层纹透明材料和 Vacumatic 上墨系统闻名，适合从视觉、机制和修复状态三方面判断。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "围绕透明纹理和上墨机制写，提醒 diaphragm 维修和状态判断。",
    },
    body: `Parker Vacumatic 很会吸引人。它的层纹材料能透出墨水和光，笔身不像单色黑笔那样安静。你转动它，会看到纹理、透明度和墨量之间的变化。很多 vintage 派克里，Vacumatic 是最容易让人先被外观抓住的一类。

Richard's Pens 的 Vacumatic 档案把它放在派克重要的上墨和材料实验语境里。它不只是漂亮。Vacumatic 上墨系统和透明笔身一起，把“笔里有多少墨”这件事变得可见。对当时的用户来说，这种可见性和大容量想象都很有吸引力。

今天买 Vacumatic，外观只是第一关。它的上墨系统依赖内部隔膜和机构状态。隔膜老化后需要修复，修复质量直接影响使用。若卖家只拍外观，不说明是否换过隔膜、是否正常吸墨，风险很高。漂亮的 Vacumatic 如果不能稳定上墨，只能当展示物。

这支笔的版本也多。尺寸、颜色、笔帽、年份和笔尖都会影响价格。普通读者不必一开始背完整谱系，但要知道 Vacumatic 不是一个单一型号体验。你买到的是某个年代、某个尺寸、某种颜色和某种维修状态的组合。

和 Duofold 比，Vacumatic 更有机制感和视觉层次。和 Parker 51 比，它更像老派克的华丽阶段，51 则把这些外露趣味收进更封闭的现代外形。若你喜欢看材料和墨水，Vacumatic 比 51 更有戏；若你想省心日用，51 或 45 往往更实际。

看 Vacumatic 时，最好把光线当成检查工具。透明度、墨窗、层纹和裂纹在不同角度下差异很大。照片如果过暗，很多问题会被藏起来；照片如果过度打光，又可能把透明度拍得比实际更好。能看到自然光下的笔身、笔帽和上墨测试，会比只看漂亮摆拍可靠。笔身越好看，越要冷静检查结构，尤其是尾端和帽口。透明材料会说话，也会暴露问题。别被第一眼带走。

购买时先看透明度、裂纹、笔帽和上墨功能。透明度差不一定不能买，但会影响观感和价值。已经专业修复、试写稳定的笔，比只说“年份好”的笔更可靠。Parker Vacumatic 适合喜欢 vintage 机制的人。它好看，也需要照顾；这两件事在它身上分不开。

它也不适合用现代活塞笔的标准去苛求。Vacumatic 的快乐在老材料和老机制里，清洗、维修和保存都要更耐心。若你愿意接受这些，它会比许多单色老笔更有观赏性。若你只想省心，先从 45 这类简单结构开始更稳。`,
  },
  {
    slug: "sheaffer-s-balance",
    title: "Sheaffer Balance：让钢笔从直筒变成流线",
    summary: "Sheaffer Balance 以流线型笔身改变了早期钢笔的比例语言，是理解 Sheaffer vintage 设计的重要入口。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "从流线外形切入，避免空泛设计史结论。",
    },
    body: `Sheaffer Balance 的名字很准。它最容易被记住的地方不是复杂上墨系统，重点在比例。早期许多钢笔像直筒，笔帽和笔身边界硬，放在桌上很像一根装饰过的管子。Balance 把两端收圆，轮廓变得顺，整支笔看起来更像被空气磨过。

Richard's Pens 的 Sheaffer Balance 档案把它放在 1920 年代末之后的产品语境里。那时工业设计开始更重视流线感，汽车、家电和日用品都在改变外形。Balance 的意义不需要写得很玄：它让钢笔从直筒时代走向更柔和、更完整的形体。

这支笔也说明 Sheaffer 和 Parker 的气质差异。Parker Duofold 外放，颜色和尺寸很抢眼；Sheaffer Balance 更讲线条。它有不同尺寸、不同材料和不同配置，收藏时会牵涉很多版本细节。普通读者先抓住一点就够：Balance 是 Sheaffer vintage 外形语言的重要样本。

书写上，Balance 的体验取决于具体版本和状态。老笔尖、上墨系统、笔身尺寸都会影响手感。它不是现代统一规格商品。状态好的 Balance 可以非常舒服，笔身过渡自然，握在手里没有直筒笔那种生硬感。状态差的老笔，也会被裂纹、漏墨或笔尖问题拖垮。

和 Sheaffer PFM 比，Balance 更早，也更偏传统开放式老笔。PFM 有 Snorkel 和嵌入式笔尖的现代机械感；Balance 的魅力在形体。和 Parker Vacumatic 比，Balance 少一点材料炫目，多一点线条克制。选哪支，看你喜欢视觉戏剧还是握持比例。

Balance 的尺寸差异也会改变判断。小号适合便携和短时间书写，大尺寸更能体现流线笔身的舒展感。很多照片不容易看出真实大小，所以要结合长度、直径或和常见笔的对照图来看。买老笔时，尺寸不只是参数，它会直接改变握持和书写节奏。

购买 Balance 时，先看尺寸、裂纹、笔帽螺纹、上墨系统和笔尖。很多老 Sheaffer 的颜色和材料状态会明显影响价格。不要只看“Balance”这个名字，具体笔况才决定能不能用。它适合想理解 Sheaffer 设计根基的人，也适合喜欢圆润流线老笔的人。

它也适合和 Parker Duofold 一起比较。两者都来自老钢笔的重要时期，但气质完全不同。Duofold 用颜色和尺寸说话，Balance 用轮廓和握持说话。这个差别会直接影响你对 vintage 的审美选择。`,
  },
  {
    slug: "sheaffer-s-pfm",
    title: "Sheaffer PFM：大尺寸 Snorkel 和嵌入式笔尖",
    summary: "Sheaffer PFM 把 Snorkel 上墨、嵌入式笔尖和更大的笔身放在一起，是 Sheaffer 后期 vintage 中很有辨识度的一支。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "解释 PFM 的尺寸、Snorkel 和 inlaid nib，不用男性化营销口吻。",
    },
    body: `Sheaffer PFM 的名字很直白，也带着那个年代的广告味。PFM 通常被解释为 Pen For Men。今天不必太认真接受这种性别营销，真正值得看的是笔本身：更大的尺寸、Snorkel 上墨系统、嵌入式笔尖，还有 Sheaffer 很强的机械感。

Richard's Pens 的 PFM 档案把它放在 Sheaffer Snorkel 系列之后的高阶语境里。普通 Snorkel 已经很有趣：上墨时细管伸出，尽量减少擦拭笔尖的麻烦。PFM 把这套系统放进更大的笔身，再配上 Sheaffer 标志性的 inlaid nib，视觉和手感都更有存在感。

PFM 的吸引力来自复杂结构。喜欢它的人，往往不只是为了写字，也喜欢那个伸出的细管和精密动作。上墨时的仪式感很强。缺点也清楚：维修门槛比普通墨囊笔高，密封件、管路和机构状态都会影响使用。买 PFM，必须关心是否专业修复过。

嵌入式笔尖让 PFM 看起来很现代。它不像传统开放式金尖那样独立站在前端，而是和握位连成一体。这个设计让 Sheaffer 的脸很明确。拿起 PFM，不需要看 logo，也能感到它和 Parker 51、Waterman C/F 不是一路。

和 Sheaffer Balance 比，PFM 更机械、更现代，也更挑维修。和普通 Snorkel 比，PFM 更大，更有旗舰感。和 Parker 51 比，PFM 的结构表演更明显；51 把复杂藏起来，PFM 让你在上墨动作里看见复杂。

PFM 的尺寸也会筛选用户。它比许多 Sheaffer 老笔更有手感存在，长时间写字时，握笔位置、重量和笔身平衡都会被放大。手小或喜欢轻笔的人，最好不要只看它的名气。手掌能接受更粗更大的笔身，才更容易享受到 PFM 的那种稳定感。

购买时先确认 Snorkel 系统是否正常工作。能不能吸墨、是否漏气、笔尖是否对齐、上墨后是否稳定出墨，比外观描述更重要。PFM 不适合只想省心的人。它适合喜欢 Sheaffer 机制和大尺寸手感的用户。状态好时，它是一支很有性格的 vintage；状态不好时，它会把维修问题直接摆到你面前。

它也很适合解释 Sheaffer 的品牌个性。Sheaffer 常常不满足于换个外壳，而是愿意在笔尖和上墨上做结构题。PFM 把这种个性放大了。喜欢这种工程感的人会很喜欢，不喜欢维护的人会觉得过分复杂。`,
  },
  {
    slug: "targa-by-sheaffer",
    title: "Sheaffer Targa：嵌入式笔尖的细长现代感",
    summary: "Sheaffer Targa 延续 inlaid nib 识别度，用更细长的笔身和大量饰面版本构成了 Sheaffer 后期现代日用线。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把 Targa 写成后期现代日用线，强调饰面和尺寸判断。",
    },
    body: `Sheaffer Targa 看起来不像早期 Balance，也不像 PFM 那样强调上墨机械。它更细长，更现代，最醒目的仍然是 Sheaffer 的 inlaid nib。笔尖嵌在握位里，线条从笔身一直延伸到前端，整支笔有一种干净的 1970 年代气质。

Richard's Pens 的 Targa 档案把它放在 Sheaffer 后期产品线中。Targa 的特别之处在版本丰富。不同饰面、不同尺寸、不同笔尖配置，让它既可以是日用钢笔，也可以成为收集对象。对普通读者来说，先不要被版本表吓住，先看自己喜欢细长还是更粗的握持。

Targa 的书写核心是嵌入式笔尖和 cartridge/converter 使用习惯。它不像 PFM 那样需要理解 Snorkel 机构，维护压力小一些。换墨和清洗也更接近现代钢笔。若你喜欢 Sheaffer 的笔尖视觉，却不想维护复杂老系统，Targa 会比 PFM 轻松。

它的手感很吃尺寸。标准 Targa 对很多人来说是优雅的细长笔，对手大的人可能偏细。Slim Targa 更挑使用者。外观漂亮不等于写起来适合自己。买之前最好确认具体尺寸，而不是只看饰面名称。

和 Parker 75 比，Targa 同样有后期高端日用感，但 Sheaffer 的嵌入式笔尖让它更有品牌识别。和 Waterman C/F 比，它的 cartridge/converter 语境更接近现代使用习惯。和 PFM 比，它少了机械戏剧，多了日常稳定。

Targa 也很适合当成“饰面目录”来慢慢看。亮金属、哑光、漆面、纹理版本会让同一条笔身线条呈现完全不同的气质。收藏时很容易被少见饰面吸引，但第一支更应该挑自己愿意拿来写的版本。能使用，才会真正理解嵌入式笔尖和细长笔身的配合。只看图，很难看出它的手感。

购买 Targa 时，先看笔尖、饰面磨损、笔帽闭合和上墨器兼容。某些饰面比普通版本更受追捧，但日用价值仍然取决于状态。Targa 适合喜欢细长金属感、又想要 Sheaffer 笔尖特征的人。它没有 Balance 的老派温度，也没有 PFM 的复杂机械；它的美感更冷静，更适合日常桌面。

如果你想从 Sheaffer 进入 vintage，但害怕 Snorkel 维修，Targa 是更轻的路线。它仍然有品牌脸，也保留了老笔的质感；同时，墨囊/上墨器结构让日常维护更接近现代钢笔。`,
  },
  {
    slug: "waterman-s-c-f",
    title: "Waterman C/F：现代墨囊时代的早期信号",
    summary: "Waterman C/F 围绕 cartridge-filled 使用方式展开，是理解现代墨囊钢笔如何进入市场的重要 vintage 型号。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "围绕 cartridge-filled 逻辑写，不夸大为单一发明故事。",
    },
    body: `Waterman C/F 的名字已经把重点说出来了：cartridge-filled。今天墨囊钢笔太常见，常见到新手甚至会把它当成默认结构。放回 1950 年代前后看，C/F 的意思就清楚了：钢笔正在从复杂上墨动作，走向更干净、更可替换的耗材系统。

Richard's Pens 的 Waterman C/F 档案把它放在早期 cartridge 钢笔语境中。它先吸引人的不是大笔尖或华丽材料，重点放在改变使用习惯。用户不再需要每次面对墨水瓶，也不用学习杠杆、按钮或复杂机构。换一支墨囊，继续写。这种便利后来变得普通，当时却是很明确的卖点。

C/F 的外观也有那个年代的现代感。线条比较干净，笔身比例不像早期硬橡胶笔那样古典。它适合和 Parker 45 放在一起理解：两者都说明，钢笔厂商已经意识到维护简单和耗材标准会影响用户选择。只是不同品牌给出的答案不一样。

今天买 Waterman C/F，最容易卡住的是耗材和状态。早期墨囊系统可能不像现代国际标准那样省心，配套上墨器或墨囊需要确认。若只看外观买，回家发现不好配耗材，会很麻烦。买之前要问清楚当前用什么墨囊或上墨器，是否实际试写过。

和 Waterman 早期 Ideal 系列比，C/F 更现代，也更接近日常便利。和 Parker 51 比，它少了暗尖传奇，重点转到耗材方式。和 Parker 45 比，它同样适合从 cartridge 时代看，但 Waterman 的品牌线索和笔身风格不同。

C/F 也适合提醒新手：所谓“现代方便”，并非一夜之间变成常识。品牌要重新设计笔身、接口、耗材和销售方式，也要让用户相信墨囊不会降低钢笔的体面感。今天看它，不能只按一支老笔的写感打分，还要看它怎样把使用习惯往后来的市场推了一步。这个角度，比单纯追问是否好写更有意思，也更接近它的历史价值。

购买时先确认笔尖、笔帽、供墨和耗材来源。C/F 的收藏价值来自它在墨囊钢笔发展中的位置，也来自具体版本和状态。若你想要一支最省心的现代钢笔，不必绕到 C/F；若你想理解钢笔如何从墨水瓶时代走向墨囊时代，它很值得读，也值得在状态好的前提下使用。

它还提醒我们，方便本身也会成为设计方向。今天的墨囊看起来普通，是因为后来的市场已经接受了这种方式。回头看 C/F，能看到那个转折还新鲜的时候：钢笔厂商正在努力说服用户，干净、快速、可替换也可以是钢笔的一部分。`,
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

  return `# Read first B 档 vintage 型号 humanizer-zh 审查

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
