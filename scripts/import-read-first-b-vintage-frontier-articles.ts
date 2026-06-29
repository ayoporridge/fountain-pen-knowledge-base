import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REVIEW_PATH = path.join(
  process.cwd(),
  "docs/content/read-first-b-vintage-frontier-humanizer-review.md",
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
    slug: "the-camel-pen",
    title: "The Camel Pen：用自来水写字的 1930 年代实验",
    summary: "The Camel Pen 试图用内置墨丸和清水解决携带墨水的问题，真正购买时要分清原始 cartridge/button 结构、后期红色按钮和普通上墨版本。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 的 Camel profile 写 1935、墨丸 cartridge 和后期版本差异。",
    },
    body: `The Camel Pen 最吸引人的地方，是它曾经认真相信钢笔可以不用墨水瓶。1935 年，Joseph Wustman 在新泽西 Orange 创立 Camel Pen Company，想用一条很大胆的卖点打开市场：笔里装一枚会慢慢溶解的墨丸，用户只要加自来水，笔就能自己变出墨水。这个想法听起来像广告噱头，背后其实是对携带墨水、外出补墨和军用 trench pen 经验的再设计。

Richard's Pens 对 Camel 的梳理很清楚：早期专利里的墨丸 cartridge 装在笔尾，和 button filler 结合。生产版不再是普通 lever filler，而是把 cartridge 做成按钮机构的一部分。使用时取下 blind cap，把 nib 和 section 浸入水中，按下 cartridge/button 完成吸水。这样一来，钢笔不只是在储墨，还在“调墨”。

问题也出在这里。墨丸持续溶解，刚加水时字迹可能偏淡，写到后段又可能变浓、变脏。Camel 的概念很好，真实书写却不够稳定。Richard Binder 也提到，这些笔做工并不差，许多用户后来把它当成普通 button filler 使用，反而更顺手。

Camel 的外观带有明显 Art Deco 气息。常见结构里有 hard rubber section、celluloid body，笔尖从 untipped steel 到 14K gold 都出现过。后期版本尤其需要分辨：有的取消了墨丸 cartridge，变成红色 button；再后来的结构更接近普通 button filler。原公司在 1938 年前后已经撑不下去，之后还有 Newark Pen Company 和 Wearever 工厂生产的 Camel-branded pens，质量位置并不一样。

买 Camel Pen 时，不能只看桶身 imprint。要看笔尾是否还有 cartridge/button 结构，红色按钮属于哪一阶段，sac 和压力杆是否能工作，celluloid 是否收缩，笔尖是钢尖还是金尖。若卖家说“holds a year's ink”，更要看它到底保留了哪一种机构。

这支笔适合把它当成 1930 年代美国钢笔市场的一次实验来看。它的失败并不无聊，反而说明钢笔公司当时多么急切地想让用户摆脱墨水瓶。今天买 Camel，最好不要期待它真的用清水写一年。把它修成稳定的普通 button filler，理解它原本的墨丸设想，才是更现实的乐趣。`,
  },
  {
    slug: "the-dunn-pen",
    title: "The Dunn-Pen：小红泵杆和高容量上墨",
    summary: "The Dunn-Pen 以 Charles Dunn 的 pump filler 和红色泵杆成名，收藏时要重点检查泵杆材料、透明 barrel、Dreadnaught 尺寸和上墨状态。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "围绕 1921 公司、Little Red Pump-Handle、高容量和材料风险写。",
    },
    body: `The Dunn-Pen 最先吸引人的，是笔尾那根“小红泵杆”。1921 年，一群投资人在纽约成立 Dunn-Pen Company，产品基础来自 Charles Dunn 1920 年的 pump filler 专利。公司广告很懂怎么抓住买家：不用普通 sac filler 的麻烦，用一套看起来简单、容量又大的结构，让一支笔可以写很久。

Richard's Pens 记录了 Dunn-Pen 当年的广告语言，“Little Red Pump-Handle”和“A regular camel for ink”都是围绕容量展开。广告还拿普通 sac-filling pen 的容量做对比，说明这支笔真正想解决的是频繁上墨和结构易坏的问题。Dunn-Pen 的宣传甚至列过 Rex Beach、Fannie Hurst、George Eastman、Thomas Edison、Kermit Roosevelt 等使用者姓名，这类名单要按广告材料看待，不能当成今天意义上的独立评测。

结构上，Dunn-Pen 的吸引力在 pump filler。它没有普通 lever filler 那种侧边杠杆视觉，也避免了很多同时代自吸笔的复杂零件。对今天的用户来说，真实重点是这套结构还活不活。泵杆是否裂，密封是否可靠，内部是否被错误维修过，比笔身照片更重要。

Dunn-Pen 的材料也有故事。早期有 hard rubber，Tattler 透明 barrel 试过 clear 和 ruby Bakelite，后来转向 celluloid。透明 barrel 很迷人，也常常带来收缩、ambering 和脆裂。Richard Binder 还特别提到小红泵杆材料从 hard rubber 转向 casein 后，后者多年后容易结晶和开裂。看到漂亮的红色尾部，不要只当装饰看。

型号名 Dreadnaught 也容易误导。现代收藏者常把它想象成巨型笔，实际 Dreadnaught 出现过多个尺寸，有些并不夸张。购买时要用实测长度、粗细和照片判断，不要被名字带偏。Hummingbird、Baby Camel、Senior、Society、Majority 等名称则说明 Dunn-Pen 当年试图覆盖不同人群。

这支笔适合喜欢早期美国创新上墨结构的人。它不如 Parker、Waterman 那样容易找资料和配件，维修也需要懂行。若只想买一支随手可用的老笔，Dunn-Pen 可能太麻烦；若你想理解 1920 年代公司如何用结构和广告抢市场，它很有意思。真正值得买的 Dunn-Pen，是泵杆、barrel 和 feed 都状态清楚的那一支。`,
  },
  {
    slug: "the-security-pen",
    title: "The Security Pen：写支票时代的随身防篡改工具",
    summary: "The Security Pen 把钢笔、twist filler 和 check protector 放在一起，适合从 1920 年代支票防伪和办公工具的角度理解。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 的 Security profile 写 check protector、Kritikson 和型号范围。",
    },
    body: `The Security Pen 不是单纯为了写字而生。它来自支票大量流通、支票诈骗随之增加的年代。20 世纪初，美国办公室里常见 check protector：用滚轮在支票金额和收款人位置压出孔线，再渗入红色印油，让篡改痕迹变得明显。Security Pen 的巧思，就是把这种防篡改工具缩到一支笔上。

Richard's Pens 追到 1919 年：John H. Kritikson 和 George Kritikson 创立 Securograph Pen Company，后来在 Chicago 发展为 Security Pen Corporation。他们购买了 Stanley E. Peters 的 check protector 设计权，并把它装到 Security pen 上。对今天的读者来说，Security Pen 的重点不只是“有个奇怪附件”，而是它把写字、签支票和防改写放在同一个办公动作里。

这支笔本身也很认真。Security pens 使用 Kritikson 自己的 spring-loaded clip 和 twist filler。这个 twist filler 通过尾部旋钮带动机械机构压迫 sac，并非普通 sac-wringing 结构的简单复制。拧开、旋转、压 sac、再释放吸墨，这套动作比普通 lever filler 更有工程感，也更需要状态完整。

Security Pen 当年有一组价格和尺寸选择。Richard Binder 列出过 200 到 600 等型号，从 3 美元到 5 美元不等，有 Short 和 Long 两种长度，笔尖选择包括 Fine、Medium、Coarse、Medium Stub、Broad Stub、Steno 和 Posting。这个范围说明它并非只卖给猎奇用户，而是认真覆盖办公室书写需求。

购买 Security Pen 时，最该看三个系统是否都在：笔能不能正常上墨，clip 是否完整，check protector 和小盖是否还在。缺了 protector，它仍然是一支老 twist filler；完整保留 protector，它才有 Security 的特殊价值。也要注意尾部旋钮、sac、cap 和 protector 的磨损。

今天用 Security Pen 写长文未必现实，它更适合作为早期办公工具文化的样本。它提醒人们，钢笔曾经不只是手账和签名用品，也能和银行、支票、防伪和商业信用绑在一起。若你喜欢有明确时代问题的老笔，Security Pen 比许多只换配色的型号更值得细看。`,
  },
  {
    slug: "the-wahl-pen",
    title: "The Wahl Pen：Wahl 走进钢笔市场的硬橡胶时代",
    summary: "The Wahl Pen 连接了 Eversharp 铅笔、Boston Fountain Pen 与 Tempoint 设计，阅读重点在 hard rubber、roller clip、lever 和早期 Wahl 的产品转型。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把 Wahl Pen 放在 Boston/Tempoint/Eversharp 转型背景里，不写成泛泛品牌史。",
    },
    body: `The Wahl Pen 要从 Wahl 进入书写工具市场的路径读。Wahl 原本不是靠钢笔起家。1915 年，Wahl Adding Machine Company 购入 Keeran & Company 的控制权，接住了 Eversharp pencil；1917 年又通过购买 Boston Fountain Pen Company 的资产进入钢笔领域。到 1921 年 hard-rubber Wahl Fountain Pen 出现时，它背后已经叠着 Eversharp、Boston 和 Tempoint 三条线索。

Richard's Pens 对这段关系梳理得很细。Boston 带来了 comb feed、inner cap、lever filler 等资产；Tempoint 则带来了某种外形和 nib marketing 的思路。早期 Wahl-Tempoint 强调不同书写姿势、轻重手感和签名风格对应不同 nib。后来真正以 Wahl Pen 面貌出现的 hard rubber pen，也保留了这种重视外形和笔尖选择的气质。

The Wahl Pen 的识别点在硬橡胶时代的质感。BCHR、mottled hard rubber、chasing、overlay、roller clip、Soldier Clip、带折线感的 lever，这些细节共同构成了早期 Wahl 的样子。它不像 Waterman 那样已经有非常稳固的大厂地位，也不像 Parker 那样靠一个爆款叙事压住市场。Wahl 在这里显得更灵活，也更愿意把零件、专利和外观组合起来。

购买这类 Wahl Pen 时，先看它到底属于哪个阶段。Boston rebranded design、Wahl-Tempoint、早期 Wahl hard rubber，外观看着接近，收藏判断差别很大。roller clip 是否原配，lever 是否完整，hard rubber 是否褪色，cap lip 是否有裂，nib 是否和型号年代相符，都会影响价值。

它的书写性格也要按具体笔尖看。早期 Wahl 对 nib 选择的宣传很积极，今天看到一支笔时，不能只写“Wahl 很好写”。柔软、弹性、stub 或普通 firm nib，都要看实物。hard rubber 笔身通常轻，长写舒服，但老材料怕日晒、怕抛光过度，也怕不懂行的维修。

The Wahl Pen 适合想理解 Eversharp 之前的 Wahl 钢笔根基的人。它不是后来的 Skyline，也不是金属 Doric 那种更容易被图像记住的型号。它更像一段转型期：一个做计算机和铅笔的公司，把 Boston 和 Tempoint 的遗产重新整理成自己的钢笔语言。读懂它，后面的 Wahl-Eversharp 会清楚很多。`,
  },
  {
    slug: "waterman-s-x-pen",
    title: "Waterman’s X-Pen：Waterman 对 Parker 61 的快速回应",
    summary: "Waterman’s X-Pen 是 1957 年前后 Jif-Waterman 制造的 capillary pen，使用时要理解 nib-end filling、wick、无 feed 结构和清洗难度。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "围绕 1957、Jif-Waterman、capillary filling 和维护风险写。",
    },
    body: `Waterman’s X-Pen 很适合放在 Parker 61 旁边读。1956 年 Parker 推出 capillary-filling 61，主打简单、干净、少操作。那时美国 L. E. Waterman 已经停止本土制造，品牌状态不稳，但 Waterman 仍看到了这个方向的吸引力。Richard's Pens 记录，Jif-Waterman 在法国负责制造，1957 年 X-Pen 上市。

X-Pen 的思路比 Parker 61 更直接。Parker 61 要把 capillary cell 从笔身抽出再浸墨，Waterman 则让用户把 nib end 直接浸进墨水一两分钟。这样不用拆笔就能上墨，结构也比 Parker 的方案更简单。代价是笔的外部会接触墨水，取出后还要处理多余墨液。

内部结构很特别。X-Pen 没有传统 feed。小笔尖插入 section 前端，wick 沿着笔尖上表面走，再折进内部接触 filler medium。部分笔尖上有 chevron-shaped capillary fissures，用来帮助墨水向笔尖缝流动；后期为了降低成本，有些特征消失。看一支 X-Pen，笔尖、wick 和内部 capillary material 的状态比普通成色更重要。

Waterman 为了容纳这套结构，没有走 1950 年代很细很薄的外形，而是回到比较粗的 1940 年代气质。它和 Taperite 有相似的 Lock-Slip cap/clutch 语言，早期和后期版本还会在 cap 材质、clip 安装方式、内部设计上有所变化。gold-filled cap、Astralite、Lumaloy、plastic cap、Super X-Pen、Wat 都会让判断变复杂。

使用 X-Pen 要有耐心。Richard Binder 特别提到，填完以后需要轻轻甩掉 nib 附近多余墨水，不然会有大墨滴。清洗也不能按普通 converter pen 来想，干墨和堵塞会让它变成维修题。若只是想要一支可靠日用 Waterman，Expert 或 C/F 更轻松；若想研究 Waterman 在晚期如何追赶 Parker 的 capillary 方向，X-Pen 很有价值。

购买时先问清楚能否正常吸墨、出墨是否稳定、内部是否清洁。只看外壳漂亮没有意义。X-Pen 的魅力在结构，不在豪华。它是一支带着 Waterman 晚期焦虑的实验笔：聪明、简单、也很挑状态。`,
  },
  {
    slug: "the-postal-reservoir-pen",
    title: "The Postal Reservoir Pen：邮购渠道里的大容量透明笔",
    summary: "The Postal Reservoir Pen 以 mail order、透明 barrel 和 Postal bulb filler 闻名，收藏时要格外检查透明 celluloid 裂纹和上墨密封。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 1925 左右、$2.50、mail-order 和透明 barrel 风险。",
    },
    body: `The Postal Reservoir Pen 的故事，一半在笔里，一半在销售方式里。大约从 1925 年开始，纽约的 Postal Pen Company 生产 Postal Reservoir Pen，只通过邮购销售。它当时只提供男款和女款两种，价格 2.50 美元。这个定价和渠道选择很关键：Postal 想绕开经销商、代理和零售成本，把一支看起来很有技术感的大容量笔直接卖给读者。

笔本身的卖点是透明 barrel 和巨大储墨量。Postal 使用 bulb filler，让整个 barrel 成为 reservoir。透明 celluloid 可以让用户看到剩余墨量，广告语也围绕“空了会提醒你加满”展开。今天很多人把这种简单可靠的 bulb filler 称为 Postal filler，Richard's Pens 也指出，Postal 不是这个概念的最早发明者，但它把这种结构和品牌绑定得很深。

Postal 的营销也很有时代感。用户可以先不付款，收到笔后付款。每支笔还附带五张 postcard，购买者可以把它们以 50 美分卖给朋友，朋友再凭卡以 2 美元买笔。卖完五张卡，原购买者就能收回自己的笔钱。广告把它称为拥有“over 100,000 salesmen”的笔。这个机制今天读起来很奇特，也说明 Postal 主要靠邮购传播和用户转介绍扩张，而非柜台展示。

收藏时，透明 barrel 是优点也是风险。Richard Binder 明确提醒 clear celluloid 年久后会非常脆，很多 Postal barrel 会出现裂纹网，强行拆修可能出问题。黑色最常见，其他颜色有但少。Bonded、Transo 等品牌下也有和 Postal 实体相同的笔，通过普通零售渠道销售，cap imprint 可能只是换了名字。

购买 Postal 时先看 barrel。透明度、ambering、裂纹、blind cap、bulb 和 breather tube 都要确认。不要因为大容量和透明感就忽略材料状态。若一支笔已经有细裂，修复和日用风险都高。若结构完整、透明 barrel 健康，它才真正能展示 Postal 的魅力。

这支笔适合喜欢早期销售模式和上墨结构的人。它没有大品牌光环，却把邮购、用户裂变、大容量透明笔和低价策略放在一起。今天读 Postal，能看到一家公司如何在大厂之外寻找用户：让笔看得见墨量，让销售绕过柜台，让每个买家也变成销售员。`,
  },
  {
    slug: "the-john-hancock-cartridge-pen",
    title: "The John Hancock Cartridge Pen：Parker 45 之前的铜弹匣",
    summary: "The John Hancock Cartridge Pen 是 1920 年代 Pollock Pen Company 的早期 cartridge-filling pen，重点在铜 cartridge、traveling case 和耗材存续问题。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "围绕 Pollock、1921/1922、铜 cartridge 和三种型号写。",
    },
    body: `The John Hancock Cartridge Pen 会让人重新理解“墨囊笔”这个词。很多人一提 cartridge pen，会想到 Parker 45 和 1960 年代以后的便利耗材。John Hancock 早得多。Pollock Pen Company 1921 年在 Boston 成立，制造 Robert T. Pollock 的 cartridge-filling fountain pen；1922 年广告已经把它包装成“像枪一样装填”的新产品。

Richard's Pens 记录了这条线的细节。John Hancock 的 cartridge 和今天的塑料小管完全不同，它是铜 cartridge，拧在 section 后端内部的 hard rubber nipple 上。cartridge 以三支一包出售，包装有点像香烟试用品。钢笔还配有 traveling case，用户可以把 cartridge 从纸包转移到更结实的随身盒里。

这套设计的卖点是容量和便利。早期宣传说一枚 cartridge 可写 30,000 words，后来调整为 10,000 signatures 或 22,000 words。Richard Binder 用现代 long international cartridge 的容量对比，说明 John Hancock 较短 cartridge 也有 2.2 ml，容量确实可观。它并不是一个空有口号的怪物。

型号上，John Hancock 有 Standard、Continental 和 Dolly Madison。Standard 是全尺寸，Continental 较短，Dolly Madison 是细小的 ladies' ringtop。早期使用 plain 或 chased hard rubber，后来转向 celluloid。结构上，barrel 和 gripping section 是一体，feed 从前方滑入，后端负责刺破 cartridge 前端的薄金属封口。

今天购买 John Hancock，第一问题是耗材。原装 copper cartridges 很有收藏价值，却不等于这支笔能像现代 cartridge pen 一样随意使用。hard rubber nipple、feed、barrel/section 一体结构和 cartridge 接口都要看。缺 cartridge 的笔仍然有历史价值，日用则会很麻烦。

它最适合被看成 Parker 45 之前的一条早期便利化尝试。Pollock 想解决的是用户随身补墨、避免脏手和快速装填的问题。这个方向后来在现代 cartridge/converter 钢笔里变成常识，但 John Hancock 还保留着 1920 年代的铜件、广告话术和复杂机械感。它不是普通日用笔，更像一支把未来提早说出来的老笔。`,
  },
  {
    slug: "the-j-g-rider-fountain-pen",
    title: "The J. G. Rider Fountain Pen：把 feed 单独取出的早期方案",
    summary: "The J. G. Rider Fountain Pen 用 keyed feed 和特殊 clip 解决 eyedropper joint 问题，是稀有且结构有趣的早期美国钢笔。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 1903 patent、keyed feed、clip tool 和收藏风险。",
    },
    body: `The J. G. Rider Fountain Pen 属于 eyedropper 时代的问题解法。早期普通 eyedropper pen 要拧开 section 往 barrel 里加墨，section/barrel 接缝如果不够紧会漏，拧太紧又难打开，还容易在薄弱处损伤。Rider 没有继续把接缝藏得更远，他直接换掉了填墨时要拆的对象。

Richard's Pens 解释了 Rider 的关键设计。Jay G. Rider 在 1901 年申请专利，1903 年获得 U.S. Patent No. 739,720。它的 nib 留在 barrel 前端，靠 keyed 结构和摩擦固定；feed 可以单独取出。feed 也有定位结构，能准确回到方形开口里，不会像普通可拆 nib unit 那样容易错位。

更有趣的是 clip。Rider 的 clip 不是单纯夹口袋用，还是取出 feed 的工具。公司用 bicycle spokes 做 clip，clip 的 loop end 可以勾住 feed 下方的 notch，把 feed 拉出来。这样用户填墨时不用摸满是墨的 feed，也降低了 nib/feed 重装错位的概率。这个设计很聪明，也说明早期钢笔工程师多么认真地处理“怎么加墨不弄脏手”这件事。

Rider feed 本身也有防止初写大墨滴的考虑。Richard Binder 把它和 Parker Lucky Curve 的思路放在一起讨论：早期 feed 缓冲能力有限，帽内残墨在笔尖朝下时可能变成 blot。Rider 通过 feed 的延伸和曲线处理，让墨水更有机会回到 reservoir。

公司层面，Rider 1905 年在 Illinois Rockford 创立公司，1907 年注册资本 25,000 美元。1923 年迁到 Ann Arbor，Illinois 公司 1927 年解散。后期还有带 Ann Arbor imprint 的 pens，部分出现 flared gripping area。Rider pens 稀少，Richard Binder 也提醒如果 feed 不容易移动，应该交给有经验的修复者。

这支笔适合收藏者，不适合普通入门用户。它的价值在结构和稀有度。购买时要看 feed 是否原配、clip 是否能承担工具功能、hard rubber 是否健康、imprint 是否清楚、是否被错误拆修。能正常使用的 Rider 很吸引人，但别为了试拆结构而冒险。它最好的读法，是把它放在早期美国钢笔发明竞赛里：一支围绕“怎么安全填墨”做出独特答案的 pen。`,
  },
  {
    slug: "morrison-s-patriot",
    title: "Morrison’s Patriot：战时美国民用爱国笔",
    summary: "Morrison’s Patriot 来自二战前后的美国民用市场，阅读重点在 Patriot 名称、Cameo Top 设计、军种版本和战时材料语境。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 的 2025 Patriot profile 写战时广告和版本判断。",
    },
    body: `Morrison’s Patriot 的名字很直白，也很属于它的年代。第二次世界大战前后，美国民用市场充满了节约物资、支援前线和爱国消费的语言。Morrison 把这套情绪做进钢笔，推出 Patriot。Richard's Pens 记录，广告曾暗示 Patriot 可以送给远在海外的士兵、水手、飞行员或 Marine，但 Patriot 并不符合军服口袋携带规范，不能简单理解成真正军规笔。

Morrison 本身不是顶级大厂。Morrison Fountain Pen Company 1910 年由 Louis 和 Abraham Morrison 在纽约创立，长期生产 third-tier fountain pens。它早年做过 overlay hard rubber pens，也做过黑色 hard rubber、celluloid 和 Cameo Top 系列。Patriot 的意义，正是在这个中低价、大量生产、紧跟市场情绪的品牌语境里出现。

Patriot 名称最早可追到 1939 年前后的产品。Richard Binder 把早期 marked “The Patriot”的 torpedo-shaped 版本称为 Proto-Patriot。1941 年，Morrison 换成更明确的 Patriot 设计，借用 Star Series / Cameo Top 的身体语言，并推出对应 Army、Navy、Air Corps、Marine Corps 等主题的版本。对收藏者来说，这些版本差异比“Patriot”这个总名更重要。

笔尖和材料也要看时代。Morrison 早期有金尖，后来受经济和材料环境影响，许多笔配 untipped steel nib。Patriot 和 Black Beauty、Star Series 之间有设计连续性，cap crown、cameo-like top、celluloid、chasing 和装饰件都需要对照实物。只看一张笔帽照片，很容易错过具体版本。

购买 Patriot 时，先看是不是明确 marked Patriot，再看属于 proto 版本还是 1941 年后的军种版本。cap top、clip、nib imprint、barrel imprint、是否有 war-themed trim，都要核对。若卖家把所有带爱国配色或军种话术的 Morrison 都叫 Patriot，最好要求更多照片。

Patriot 的魅力不在高端做工。它像一件战时民用消费品：广告热情，价格相对亲民，设计带着时代情绪。它适合喜欢美国二战 home front 文化、third-tier pen 和版本辨认的人。若你只追求书写性能，同期很多大厂笔更稳；若你想看钢笔如何借战争语言进入普通人的礼品和办公场景，Patriot 很有代表性。`,
  },
  {
    slug: "the-conklin-glider",
    title: "The Conklin Glider：芝加哥 Conklin 的便宜身体和好笔尖",
    summary: "The Conklin Glider 属于 Chicago Conklin 时期，制造成本压得很低，但部分笔装有 Toledo 遗留的 Cushon Point 14K nib。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "围绕 post-Toledo Chicago Conklin、$2.75、Cushon Point 和透明 section 写。",
    },
    body: `The Conklin Glider 要先把“Conklin”这个名字放轻一点。它属于 Chicago syndicate 接手之后的型号，已经不在 Toledo Conklin 黄金年代的高质量产品序列里。Richard's Pens 说得很直接：新老板追求用最少投入榨出最多美元，许多 Chicago Conklin 外观上像旧 Toledo 产品，实际制造质量差很多。

Glider 大概是 Chicago Conklin 里最有名的型号。1946 年的广告把它推到新 Conklin 产品线的顶部，零售价 2.75 美元。这个价格和定位说明它不该按高端收藏笔期待。stamped-steel lever、stamped clip、plated brass cap band、粗糙的 body parts，都显示它是一支典型 third-tier pen。

它的反转在笔尖。Chicago Conklin 仍有一批来自 Toledo 的高质量 14K nib 存货，高位型号会装 Cushon Point nib。Richard Binder 对这些 nib 的评价很明确：firm but not nail-like，smooth and well。也就是说，Glider 可能长着便宜身体，却写得比外壳暗示的更好。便宜制造和好笔尖同时存在，是它最有意思的地方。

外观上，Glider 有尖一点的 cap crown，和 Toledo-made All-American 那种更认真打磨的圆润形状不同。它还带有 partially transparent section，让用户能看到墨量。这个 section 的 celluloid 加工常常粗糙，黑色部分靠染色变 opaque，实际个体差异很大。有些 sections 平滑，有些会看到工具痕和 pitting。

结构上，Chicago Conklin 也省了很多。clip 不再是老 Conklin 标志性的 center-pivoting spring-loaded design，而是普通 tab-mounted stamping。lever 也更便宜，没有老设计的圆形 finger tab 和锁定细节，依靠 J-bar pressure bar 的弹力。好处是 J-bar 仍有两件式结构，比很多廉价一片式 brass stamping 更有效。

购买 Glider 时，先看它有没有 Cushon Point 14K nib。如果是钢尖或被换尖，吸引力会下降。再看 section 是否裂、透明部分是否健康、lever 和 J-bar 是否工作、cap band 和 clip 镀层是否严重磨损。它适合想要“能写得不错的 postwar third-tier Conklin”的人。若你想买 Toledo Conklin 的精致感，Glider 会让你失望；若你接受便宜身体，Cushon Point 可能给你惊喜。`,
  },
  {
    slug: "the-chilton-chiltonian",
    title: "The Chilton Chiltonian：Chilton 最后的低价路线",
    summary: "The Chilton Chiltonian 是 Chilton 走向尾声时推出的 down-market pen，保留 pneumatic filler，但用钢尖、黑色 blind cap 和简化 cap 结构降低成本。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 Summit New Jersey 后期、second-generation pneumatic filler 与 Ink-tel。",
    },
    body: `The Chilton Chiltonian 要放在 Chilton 的尾声里读。到 1940 年前后，Chilton 已经从 Long Island City 搬到 Summit, New Jersey，昔日的 Wing-flow 和 Golden Quill 都没有把公司带回稳定状态。Chiltonian 就是在这种压力下推出的最后一支笔：它仍然保留 Chilton 的技术血统，却明显走向更低成本的市场。

Richard's Pens 写到，Chiltonian 使用 Chilton 约 1927 年引入的 second-generation pneumatic filling system，这套结构来自 Julius Abegg 1915 年的专利。也就是说，它没有放弃 Chilton 最核心的气压上墨传统。对收藏者来说，这一点很重要。Chiltonian 不是随便贴牌的便宜笔，它仍然是一支真正的 Chilton。

低价痕迹也很明显。它使用 two-tone steel nib，饰件从早期 Chilton 的 gold filled 降到 gold plated，做工也没有前辈那么讲究。所有颜色都配黑色 blind cap，这是省成本的直接结果。若你习惯把 Chilton 和高阶工艺、漂亮 inlay 绑定在一起，Chiltonian 会显得朴素很多。

它仍有有趣的设计。用户可以选择 Chilton 的 Ink-tel feature，也就是透明 section 的墨量观察方案。section 前端染黑，避免 nib 尾部露出显得杂乱；透明部分里能看到一条很长的 feed tail，可能用于帮助墨水回流或控制供墨。这些细节说明 Chilton 即使处境困难，也没有完全停止工程尝试。

cap 结构也值得看。传统 Chilton 的 spring-loaded Rocker clip 被取消，换成更经济的 unitized cap-and-clip assembly。这个结构通过热压变形把 washer clip 固定在 cap 上，还能满足军用短口袋对 clip 的要求。它没有老 Chilton 那种优雅，但很实用。

购买 Chiltonian 时，先看 pneumatic filler 是否完整，blind cap 是否匹配，steel nib 是否原配，Ink-tel section 是否裂或染色异常。还要留意欧洲市场上曾出现与 Chilton 公司无关的 Chilton-branded pen，外观有相似处，不能只看名字。Chiltonian 的价值在于它诚实地记录了一个品牌的晚期：技术还在，预算已经很紧。`,
  },
  {
    slug: "the-chilton-golden-quill",
    title: "The Chilton Golden Quill：世界博览会上的最后现代感",
    summary: "The Chilton Golden Quill 在 1939 年纽约世界博览会语境中出现，用极简流线外观、羽毛形 inlay 和 Chilton pneumatic filler 延续品牌野心。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 1939 World's Fair、Golden Quill styling、Rocker clip 与 suction filler。",
    },
    body: `The Chilton Golden Quill 看起来像 Chilton 想在最后阶段重新显得现代。1939 年纽约世界博览会以“The World of Tomorrow”为主题，Chilton 也带着新型号亮相。公司已经从 Long Island City 搬到 Summit, New Jersey，Wing-flow 的全国广告热度过去了，经营压力很大。Golden Quill 就是在这种背景下出现的。

它和 Wing-flow 的关系很直接。Chilton 继续使用把金属装饰嵌入 celluloid 的专利技术，但不再大面积铺开 Art Deco 图案。Golden Quill 把装饰收窄成 feather-like incisions：Rocker clip 边缘有羽毛感切线，cap 背部还有 oval feather-shaped indicia。cap crown 上细细的 crest 像一道 Mohawk，整支笔没有 cap band，也没有显眼文字。

这种设计很克制，也有风险。Richard's Pens 提到，当时有人批评它 dull design。读者今天看 Golden Quill，可能会觉得它比 Wing-flow 更成熟；放到 1939 年的展会现场，它或许又显得太安静。它的美感不靠艳丽材料，而靠线条、金属嵌件和留白。

结构上，Golden Quill 保留 Chilton 的 suction-type filling system。blind cap 连着一根在 barrel 内滑动的 tube，拉出、按住气孔、压下，让空气压缩 sac，再释放吸墨。这套上墨比普通 lever filler 更有 Chilton 性格，也意味着维修时不能按最常见的老笔处理。

Golden Quill 有不同尺寸和 section 变化。有些带 partially transparent section 和 elongated cutaway feed，有些没有。标准型号还出现长 cap 和短 cap 差异，可能对应男款和女款。购买时不能只看“Golden Quill”四个字，必须看 cap 长度、section、feed、clip、inlay 和 filler 是否都对。

这支笔适合喜欢 1930 年代末美国现代主义钢笔的人。它没有让 Chilton 走出困境，存货后来被低价处理，但它并不平庸。Golden Quill 像一次最后的整理：把 Wing-flow 的装饰野心收进更安静的外形里，把 Chilton 的 pneumatic filler 留在内部。若状态好，它是一支很有味道的晚期 Chilton。`,
  },
  {
    slug: "the-chilton-wing-flow",
    title: "The Chilton Wing-flow：把金属线条嵌进笔身",
    summary: "The Chilton Wing-flow 是 Chilton 1935 年全国广告推动的 Art Deco 代表，重点在 metal inlay、pneumatic filler、Rocker clip 和特殊 nib 设计。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 1935、inlaid precious metal patterns、Rocker clip 和 Wing-flow nib。",
    },
    body: `The Chilton Wing-flow 是 Chilton 最容易被记住的设计之一。1935 年，Chilton 已经从 Boston 转到 Long Island City，正和其他美国钢笔厂一样寻找下一种外观语言。它没有选择让 section 和笔身同色，而是把金属 inlay 嵌进原本比较素的 solid-color pen 上，让笔身自己出现速度感和装饰节奏。

Richard's Pens 记录，Wing-flow 结合了 Chilton 的 second-generation pneumatic filler、金属 inlay 技术、特殊 nib 和 Rocker clip。Chilton 为它做了第一次全国广告。对一个原本区域性更强的品牌来说，这不是小动作。Wing-flow 是公司想冲进更大市场的一次集中发力。

它的外观核心是 inlaid pattern。没有这些金属线条，Wing-flow 只是漂亮但不突出的 solid-color pen。加上 inlay 后，它一下进入 Art Deco 的语境。现存记录里有 11 种 pattern，其中 10 种申请过设计专利。广告里提到 14K yellow gold-filled inlays 和 sterling silver，实际银色 inlay 多为 14K white gold filled，以避免 tarnish。

Wing-flow 的 nib 也值得看。Richard Binder 提到它有一种革命性的 nib design，既改善性能，也减少 gold 用量。再加上 spring-loaded Rocker clip 和 pneumatic filler，Wing-flow 不是单靠表面装饰卖相。它把当时 Chilton 的技术和审美放在同一个型号里。

购买 Wing-flow 时，第一眼看 inlay，第二眼要看 filler。金属 inlay 是否松动、缺失、磨损，Rocker clip 是否还能正常弹动，pneumatic filler 是否密封，blind cap 是否匹配，都会影响价值。还要核对 pattern，不同 pattern 稀有度和收藏兴趣不同。若卖家只说“Chilton old pen”，信息明显不够。

这支笔适合喜欢 1930 年代美式 Art Deco 的用户。它比 Golden Quill 更张扬，比 Chiltonian 更有野心，也比许多同时期素色笔更容易在展示柜里被认出来。用它写字，当然要看具体 nib 和维修状态；理解它，则要看 Chilton 如何把气压上墨、金属嵌饰和全国广告压进一支笔里。`,
  },
  {
    slug: "the-conklin-nozac",
    title: "The Conklin Nozac：美国“no sack”活塞上墨",
    summary: "The Conklin Nozac 是 Toledo Conklin 1931 年推出的 piston filler，重点在 Bienenstein 结构、Word Gauge、clear demonstrator 和 faceted/herringbone 版本。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 1931、piston filler、Nozac naming、Word Gauge 与 celluloid 风险。",
    },
    body: `The Conklin Nozac 的名字很直白：no sack。1931 年，Toledo 的 Conklin 推出这支 piston filler，距离 Pelikan 1929 年带动活塞上墨热潮只过了两年。美国市场那时仍以 sac-based self-filler 为主，Conklin 用 Nozac 告诉用户，这支笔不靠橡胶墨囊。

Richard's Pens 把 Nozac 放在 Andreas Bienenstein 的设计里。它的活塞结构有专利支撑，广告说它“winds like a watch”。早期名字还包括 Endura Nozac、Nozac Symetrik，后来简化成 Conklin Nozac。它被放在 Conklin 产品线顶部，说明公司把它当成认真押注的高端结构，而非边缘实验。

Nozac 的透明版本很有意思。普通 demonstrator 是给店员展示结构的工具，Conklin 进一步把 clear pens 卖给消费者。透明 celluloid 让人能看到内部，也带来染色和老化风险。Richard Binder 展示的早期 clear Nozac 有严重 ambering，这提醒今天的买家：透明漂亮，保存难度也高。

1932 年的 Word Gauge 让 Nozac 更有广告感。barrel 上热压出 1-M、2-M 之类刻度，宣称可以估算剩余可写字数。它不一定像仪表那样精确，但很会把大容量和可视化卖点讲给用户听。后来 12-faceted body、交替透明和有色区域、Herringbone / V-Line 等设计，又把它推向 1930 年代彩色 celluloid 的审美中心。

购买 Nozac 时，先看 piston。活塞是否顺畅、是否漏墨、barrel 是否有裂、透明区是否严重染色，比单纯颜色更重要。两段式 barrel 的 Nozac 较少见，状态好更受重视，但连接处和透明前段也更要细看。Cushon Point nib、clip、inner cap 和 feed 状态同样影响使用。

Nozac 适合喜欢美国厂商挑战欧洲活塞传统的人。它是一支结构野心很强的 Conklin，漂亮外壳只是入口。状态好的 Nozac 可以很好写，也很有展示性；状态差的 Nozac 会把维修成本和材料风险全部暴露出来。读这支笔，要同时看工程、广告和 celluloid 年代的美感。`,
  },
  {
    slug: "the-eversharp-bantam",
    title: "The Eversharp Bantam：真正能写的小型 Eversharp",
    summary: "The Eversharp Bantam 是 1930 年代早期的小型 Wahl-Eversharp，虽然尺寸很小，却有 bulb filler、14K nib 版本和丰富 celluloid 花色。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 small pen market、Big Little Pen、bulb filler 与 plating 风险。",
    },
    body: `The Eversharp Bantam 的第一印象就是小。现代收藏者常偏爱 oversize pens，但 20 世纪上半叶真正卖出去的大量钢笔并不都很大。vest-pocket pens、ringtop ladies' models 和 novelty small pens 都有真实市场。Bantam 就在这个位置上，也确实是一支 Wahl-Eversharp 做出来的高质量小笔。

Richard's Pens 推测 Bantam 大约 1933 年出现，持续到 1940 年。它 capped 约 3 英寸多，posted 约 4 英寸多，尺寸很小，却被 Wahl 文案称为“The Big Little Pen”。它有 clip pocket model、desk model、matching mechanical pencil，甚至还有 faceted version，几乎像一支 miniature Doric。

Bantam 的笔尖很关键。高配版本使用 iridium-tipped 14K Eversharp No. 0 nib，不少带一定 flex，写起来可以很出色。受大萧条影响，也有 gold-plated untipped steel nib 版本，这些钢尖通常没有 Eversharp imprint。买 Bantam 时，金尖和钢尖的差异会直接影响价值和体验。

上墨上，Wahl 没有硬塞 lever filler。Bantam 太小，lever 结构并不理想，所以采用 bulb filler。这个系统简单、可靠、制造成本低，对小尺寸笔还能提供不错容量。许多修复后的 Bantam 会用剪短的普通 sac 取代原本带 aluminum ferrule 的 bulb，购买时要看修复方式是否干净。

Bantam 的弱点在镀层，尤其是 steel clip。薄金色 plating 容易磨掉，露出底材后还会腐蚀。漂亮的 Bantam 可能值得重新电镀，但这个成本要和笔本身价值一起考虑。它的花色和 cap band 变化很多，还有 Century of Progress 世界博览会纪念 cap band 版本，收藏分支很丰富。

Bantam 适合喜欢小笔、桌笔和 Eversharp celluloid 的人。若你手大、喜欢长时间不 posted 书写，它可能太小；若你接受小尺寸，它会比普通 novelty pen 更认真。挑它时先看 nib、bulb filler、clip plating、barrel 透明区和 cap band。它的可爱不只是尺寸，更在于 Wahl 真的把一支小笔当成可用的钢笔来做。`,
  },
  {
    slug: "the-eversharp-coronet",
    title: "The Eversharp Coronet：金属 Art Deco 的口袋珠宝",
    summary: "The Eversharp Coronet 是 Wahl-Eversharp 1936 年圣诞季推出的高端 Art Deco line，重点在 Iannelli 设计、gold-filled body、Self-Fitting Point 和维修风险。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 Gold Is Back、Coronet/Half Coronet、repair hazard 与 trim crystallization。",
    },
    body: `The Eversharp Coronet 像一件钢笔形状的口袋珠宝。1936 年圣诞季，Wahl-Eversharp 用“GOLD IS BACK!”这样的广告语言推出这条线。美国刚从大萧条最沉重的阶段往外走，厂家开始重新试探豪华消费。Coronet 就是在这种情绪里出现的金属 Art Deco pen。

Richard's Pens 说明，Coronet 这个名字大约到 1939 年才在 jewelry-shop line 的广告和包装里明确出现，今天收藏者用它称呼整个系列。它的设计基于 Alfonso Iannelli 为 Eversharp 做的 pencil design，body 和 clip 都有设计专利。直线、切角、几何镂空、Pyralin trim，让它很容易让人想到 Chrysler Building 一类 Art Deco 城市景观。

Coronet 有 all-metal gold-filled pen，也有 gold-filled 或 rhodium-plated cap 加 celluloid barrel 的版本，现代收藏者常把后者称为 Half Coronet。普通零售和 jewelry shop 版本还有细节差异，价格也不同。gold-filled 全金属笔普通市场 10 美元，jewelry shop 版本 12.50 美元，1936 年这不是随手买的小东西。

功能上，Coronet 有 Wahl 的 Safety Ink Shut-Off，jewelers' line 还配 Self-Fitting Point，可在很 firm 到很 flexible 之间分档调整。它仍然是 lever filler，Wahl 也把它说成 lever-vac filling mechanism。对使用者来说，Coronet 不只是壳子漂亮，笔尖和上墨同样有 Wahl 的高阶配置。

风险也大。all-metal Coronet 的 section 和 clear barrel front 是一体，维修时需要整体从 barrel 中取出。若误把 section 从 threaded part 分离，很容易毁掉笔。Dubonnet Red trim 比 black trim 更受欢迎，也更脆，更容易 crystallize。posting ring、trim 裂化、金属磨损，都是购买时必须看的地方。

Coronet 适合喜欢 Art Deco 和高端 Wahl-Eversharp 的收藏者。它不适合作为随便试水的第一支老笔，维修门槛、价格和材料风险都高。若状态好、trim 健康、结构未被误拆，它会很耀眼。它的美不靠大尺寸，而靠金属、几何和 1930 年代对豪华回归的想象。`,
  },
  {
    slug: "the-eversharp-envoy",
    title: "The Eversharp Envoy：短命的金属旗舰试探",
    summary: "The Eversharp Envoy 是 1948 年左右的高价 Eversharp fountain pen，视觉上冲着 Parker 51 去，内部却继承 Symphony / Skyline 系统。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 1948、$15 Envoy、slip cap、Magic Feed 与短命销售。",
    },
    body: `The Eversharp Envoy 出现在 Eversharp 很尴尬的阶段。1948 年，公司正在摆脱 CA ballpoint 带来的麻烦，同时需要重新证明自己还能做有竞争力的 fountain pen。同一年，Raymond Loewy 设计的 Symphony 取代老化的 Skyline；产品线从 3.50 美元 Reporter 到 5 美元 Symphony，再到 15 美元 Envoy。

15 美元的 Envoy 已经压到 Parker 51 的低端价格上方。Richard's Pens 说它用 all-gold-filled body 和更修长的线条，在视觉上比 51 更显眼。这是一支冲着高端注意力去的笔，不是普通中价补位。

Envoy 的外形和 1940 年代 Eversharp 之前的线条差别很大。它是 torpedo shaped slender cylinder，长长的两端平滑收束。slip cap 没有 clutch，靠 cap 和 barrel 上三条微微凸起的 ridges 之间的摩擦固定；没有 barrel threads，整体更顺。cap 和 barrel 都有密集纵向 grooves，让金属表面更有节奏。

它也吸收了 Skyline 的教训。Skyline cap 有时会 posted 得太深，磨到 lever。Envoy 的 lever 上有一道微凸 ridge，用来限定 posting depth，让 cap 停在合适位置。这个细节很实用，也说明 Eversharp 并不是只在做漂亮外壳。

内部则没有那么激进。Envoy 和 Symphony、第三代 Skyline 共享 Magic Feed、长 breather tube，以及后来被称为 Flip Fill 的 unitized pressure bar/lever assembly。它没有跟风做 hooded nib，而是使用较小的外露 nib，早期 section 还有不同形态。写感要看具体 nib，不能只按外观判断。

Envoy 的寿命很短，可能只生产了一年左右。1950 年前后，Envoy sets 已经被低价 remaindered。今天买 Envoy，要看金属 body 是否磨损、slip cap 是否牢靠、lever ridge 是否完好、Magic Feed 是否清洁、nib 是否原配。它适合喜欢 Eversharp 晚期高端试探的人：短命、漂亮、野心很大，也带着品牌转型失败的气味。`,
  },
  {
    slug: "the-eversharp-pacemaker",
    title: "The Eversharp Pacemaker：Coronet 影子下的学生价位",
    summary: "The Eversharp Pacemaker 是 1938 年 $3.50 的中低价 Wahl-Eversharp，借用 Coronet 设计语言，但用 celluloid cap/barrel 和较简单配置降低价格。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 1938 back-to-school、$3.50、Coronet clip 与 Pacemaker features。",
    },
    body: `The Eversharp Pacemaker 可以看成 Coronet 光环下面的现实选择。1936 年 Coronet 很漂亮，也很贵；10 美元的高端 Art Deco pen 不可能进入所有学生和普通用户口袋。到 1938 年秋季返校季，Wahl 推出 3.50 美元的 Pacemaker，把它放在 2.75 美元 Air-Lite 和 5 美元 Popular Doric 之间。

Richard's Pens 明确说，Pacemaker 不是 shoddy construction 的廉价笔。它比不上 Doric 和 Coronet 的高阶配置，但做得认真。尺寸和形状接近 Coronet，有 partially transparent section 可以看墨量，还使用 Alfonso Iannelli 为 Coronet 设计的 clip。生产版 clip 做了简化，降低制造难度，也减少 brassing 倾向。

Pacemaker 的 cap 和 barrel 都是 celluloid，不像 Coronet 那样使用金属 cap 或金属 body。和 Coronet 放在一起，它会显得更安静，但颜色并不乏味。早期广告提供 black、green、blue、gold-satin，后来又加入 red。它有 standard girth 和 slender 两种粗细，细款和标准款 capped length 相同，只是 cap 比例不同。

配置上，Pacemaker 可以配 flexible 或 firm 14K nib，但没有 Wahl 的 adjustable nib，也没有 Safety Ink Shut-Off。这些取舍正好说明它的定位：保留可靠书写和漂亮外观，放弃高价旗舰功能。对今天用户来说，具体 nib 比宣传档位更重要，firm 和 flexible 的使用感会差很多。

购买 Pacemaker 时，先看 celluloid。cap/barrel tube stock 是否有裂，端部融合处是否稳定，透明 section 是否清楚，clip 和 cap band 镀层是否磨损，都要细看。barrel imprint 可能是 Wahl，也可能只写 Eversharp。黑色 barrel thread 区域的变体也存在，不能简单判断为后配。

Pacemaker 适合想要 1930 年代 Wahl-Eversharp 味道，但不想上 Coronet 价格和维修风险的人。它有学生价位背景，却不是粗糙学生笔。状态好的 Pacemaker 很适合日用老笔：有颜色，有 14K nib，有一点 Coronet 的设计影子，也有更轻松的使用心态。`,
  },
  {
    slug: "the-ingersoll-dollar-pen",
    title: "The Ingersoll Dollar Pen：把一美元手表思路搬进钢笔",
    summary: "The Ingersoll Dollar Pen 来自 Charles H. Ingersoll 的一美元钢笔尝试，重点在 14K nib、金属笔身、bayonet cap、cheap twist filler 和材料裂纹。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 1922 Newark、$1 value、metal body 和 twist filler 风险。",
    },
    body: `The Ingersoll Dollar Pen 的名字来自一个很美国的价格想象。Robert H. Ingersoll Watch Company 曾靠 dollar watches 打开市场，1921 年失败后，Charles H. Ingersoll 很快把“一美元”概念搬到钢笔上。到 1922 年，他在新泽西 Newark 建立 Charles H. Ingersoll Dollar Pen Company，想卖一支价格低、配置却不寒酸的钢笔。

Richard's Pens 记录，早期 Ingersoll Dollar Pen 是 metal-bodied fountain pen，最重要的配置是一枚质量不错的 14K gold nib。Charles Ingersoll 坚持这个点，所以它并不是单纯靠便宜金属壳糊弄用户。问题在于，为了压到一美元，其他结构必须非常省。

cap closure 是一个例子。部分早期笔有 screw cap，更常见的是便宜但不太可靠的 bayonet-type cap。用户必须把 cap lip 上的 L-shaped channel 对准 barrel 上的小凸点，再推入并旋转。若没对准就硬推，很快会磨掉凸点，cap 固定就出问题。今天买这种笔，cap 是否还能稳固，是第一批要检查的地方。

金属 gripping section 也有风险。Ingersoll 把金属 section 做成 tube，再把 hard rubber section 强行嵌入其中，组装张力很大。多年以后，很多笔在 section 或 barrel 位置出现裂纹。少数使用传统 hard rubber section 的版本反而避开了这个问题。

上墨结构同样体现省成本。它使用一种便宜的 sac-wringing twist filler，尾部旋钮甚至来自 decorative upholstery tack 的思路。不同批次会看到不同 knob design，有些还有小 conical washer，后来也用 barrel end 形状取代这个零件。它聪明，但不精致。

Ingersoll 也短暂尝试过 celluloid，但为了一美元价格点，材料厚度和强度很难平衡。购买 Dollar Pen 时，要看 14K nib 是否还在、cap closure 是否可用、金属 section 是否裂、twist filler 是否能工作。它不是豪华笔，却很适合理解低价市场如何在“金尖”和“便宜结构”之间做取舍。`,
  },
  {
    slug: "the-wasp-clipper",
    title: "The WASP Clipper：Sheaffer 副牌里的航空时代",
    summary: "The WASP Clipper 是 Sheaffer 相关副牌 WASP 的重要型号，借 China Clipper 航空想象命名，覆盖从低价 Junior 到 De Luxe set 的多层级产品。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Richard's Pens 写 WASP/Sheaffer 关系、1937 ad、China Clipper naming 与价格层级。",
    },
    body: `The WASP Clipper 要先理解 WASP 这个名字。WASP 来自 W. A. Sheaffer Pen Company 的首字母，是 Sheaffer 相关的副牌或分支。Richard's Pens 提醒，WASP 在不同时间可能是 model、separate company 或 Sheaffer division，和母公司的关系并不总是同一种。Clipper 就在这个复杂副牌体系里出现。

1937 年的 Wasp Clipper 广告使用 “Speed Line Design” 这样的词，明显想借当时对速度和现代交通的兴趣。Clipper 名字也指向 Pan American Airways 的 China Clipper service，广告里的飞机画得像 Martin M-130 Ocean Transport。钢笔在这里借用了航空时代的想象：快、远、现代、漂亮。

Clipper 的产品层级很宽。早期广告给人的价格范围从 1.95 到 3.95 美元不等，pen/pencil set 也有不同组合。低端甚至可能低到 1.25 美元左右，柜台 card 一次展示十几支；到 1939 年左右，Large Clipper De Luxe set 已经是 5 美元钢笔加 2.50 美元铅笔的组合，接近 Sheaffer 非 Lifetime 自有品牌产品的价位。

外观上，Clipper 的设计没有直接复制 Sheaffer Balance。它保留 flattened ends，用明亮金属的 faceted shallow conical crowns 收尾。crown 可以旋出，用来固定 washer clip，clip washer 隐藏在 cap body 的 machined depression 里。这个细节让它看起来比普通低价副牌更认真。

不同层级要分开看。Clipper Junior 会在 nib imprint 上直接显示 Junior 地位；Large De Luxe 则是另一种观感。1938 年 WASP 还推出 Addipoint，与 Esterbrook Re-New-Point 竞争，虽然它和 Clipper 不是同一件事，但说明 WASP 当时在低价和可换 nib 市场里动作很积极。

购买 WASP Clipper 时，先看 barrel imprint、trim level、nib imprint、cap crown 和 clip 结构。不要只按“WASP = 低端 Sheaffer”草率判断。Clipper 的有趣之处在于它把副牌、航空广告、低价市场和 Sheaffer 背后的制造能力放到一起。状态好、层级清楚的 Clipper，很适合收藏 Sheaffer 旁支谱系。`,
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

  return `# Read first B 档 vintage frontier humanizer-zh 审查

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
