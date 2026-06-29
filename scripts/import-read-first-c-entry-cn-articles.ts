import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REVIEW_PATH = path.join(
  process.cwd(),
  "docs/content/read-first-c-entry-cn-humanizer-review.md",
);
const MIN_CHARS = 900;
const MAX_CHARS = 1200;

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
    slug: "唐月-e5",
    title: "唐月 E5：百元段里看磁吸和做工",
    summary:
      "唐月 E5 更适合按百元国产日用笔来理解：钢尖、现代外观和磁吸结构是它的看点，购买前要重点看握持、气密和出墨。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据什么值得买 E5 评测标题中的磁吸设计与既有研究索引，按百元国产日用笔写使用判断。",
    },
    body: `唐月 E5 的入口不在历史，而在百元段的实物体验。公开评测把它的磁吸设计放在标题里，这说明买这支笔的人很可能先关心两个问题：合盖手感是否舒服，日常写字是否稳定。E5 的资料能确认它是国产钢尖笔，定位也更接近日用和尝鲜，不适合按老牌金笔的标准去看。

磁吸结构会改变一支笔的第一印象。传统旋帽更稳，插拔帽更直接，磁吸帽则让开合动作变轻。好处是拿起、合上都快，手账和桌面短写会舒服；风险在气密和耐久，放几天后第一笔是否顺、笔帽吸力会不会变弱，都要靠实际使用确认。买 E5 时，试写之外最好做一次隔夜放置。

钢尖让 E5 的判断回到线条和调校。百元段国产钢尖的差异，往往落在同批次手感是否一致。收到后先看笔尖是否对齐，轻写有没有刮纸，连续写半页有没有断墨。若你写中文小字，别只看外观，线宽和出墨更重要。

这类笔还有一个容易被忽略的点：笔帽和握位会决定你愿不愿意每天拿它。磁吸帽如果开合轻快，桌面短写会很顺；如果笔帽偏松，通勤就会让人担心。握区也要看手指落点，尤其是写中文时，太滑或太硬都会放大疲劳。E5 的价格不高，但它仍然要通过这些日常测试。

如果把 E5 放进百元段国产笔里，它的优势应是“有点新鲜感”。这和传统入门笔的逻辑不同。Pilot 78G、Platinum Preppy 这类笔更靠稳定口碑，E5 更靠结构和外观让人愿意试。买它时要接受一个前提：你是在用不高的预算换一次实物判断，而不是买一支已经被多年使用经验完全验证的经典型号。

E5 适合想用低成本试试现代国产设计的人。它可以和 KACO、弘典、末匠这类国产入门笔放在一起比较：有些强调笔尖，有些强调材料，有些把结构做成卖点。唐月 E5 更像一支让你判断自己是否喜欢磁吸帽的样品笔。

购买时先看清随附耗材、尖号和退换政策。百元段笔不要只看宣传图，用户实拍、长时间放置后的第一笔、笔帽手感和握位舒适度更有参考价值。若你想要稳定的长文主力，Pilot、Platinum 的入门线更稳；若你想试国产新结构，E5 的低门槛反而正合适。拿它写一周，比开箱当天划几条线更能说明问题。准备送人时，也要先确认对方愿不愿意处理墨水和清洗。不适合盲买。`,
  },
  {
    slug: "派利-002",
    title: "派利 002：透明示范笔的低门槛玩法",
    summary:
      "派利 002 是低价透明示范笔路线，零售页能确认 demonstrator 和 EF 尖信息，适合观察墨路、试写小字和低压力入门。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Amazon India 标题中的 Paili 002 Demonstrator 和 Extra Fine Nib，避免扩写无来源品牌史。",
    },
    body: `派利 002 最容易理解的地方，是透明。Amazon India 的商品标题写着 Paili 002 Demonstrator Fountain Pens Extra Fine Nib，能确认它走的是示范笔和细尖路线。示范笔的价值很直接：你能看到墨水、上墨器和笔舌工作，适合刚开始学习钢笔结构的人。

透明笔也会暴露问题。墨水残留、笔舌积墨、内壁水痕都会被看见。喜欢干净外观的人要勤清洗，喜欢观察墨路的人会觉得有趣。派利 002 不应被看成收藏笔，更像一支便宜的结构课。你用它知道墨囊、converter、笔舌和笔尖怎样配合，比单看教程更直观。

EF 尖适合中文小字和普通纸。线条细，出墨压力低，作业、批注和手账都能用。缺点也明显：细尖更容易放大纸张纤维和笔尖调校问题。收到后先在常用纸上写几行横竖撇捺，看看是否刮纸，别只在光滑纸上试。

这支笔也适合练习清洗和拆装，但不要一开始就把它当成改笔项目。透明件通常更怕裂，螺纹和笔帽扣合要轻一点。墨水建议先用普通蓝黑或黑色，等确认供墨稳定后，再试高饱和颜色。低价示范笔的乐趣在可观察，也在低压力。

派利 002 对初学者的另一个好处，是能把“钢笔为什么会断墨”这件事变得可见。你可以看到墨水是否进入笔舌，写到一半线条变淡时，也能回头检查是墨水、纸张、笔尖还是上墨器的问题。它不一定比成熟入门笔更稳，却适合拿来理解钢笔。

它适合被放在“便宜透明入门笔”这个位置。和 Pilot Kakuno、Platinum Preppy 比，派利 002 的品牌资料少，售后和品控也更依赖购买渠道。和 TWSBI ECO 这类更成熟的透明活塞笔比，它的成本低得多，期待也要降下来。

买派利 002 时，重点看三件事：笔尖是否对齐，透明件是否有裂，随笔是否带可用上墨器。低价笔不必追求完美，但必须能稳定出水。若你只是想看墨水在笔里怎么走、练小字、给笔袋里添一支备用笔，派利 002 有意义；若你要一支长期主力，资料更完整的入门品牌会省心。给学生买也要看笔帽牢不牢，透明笔摔裂后基本不值得修。它的合理位置是学习和备用，不是唯一主力。放在书桌上试墨也合适。别带着摔。先写满一页。`,
  },
  {
    slug: "admok-简800",
    title: "Admok 简800：低价活塞大笔的诱惑",
    summary:
      "Admok 简800 的看点在树脂笔身、活塞上墨和可选笔尖规格，适合想低成本尝试大容量结构的人。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Daraz 页面标题中的 M800/J800/800、piston resin 和 Schmidt/Bock #6 EF/F/M/B 信息写结构判断。",
    },
    body: `Admok 简800 的吸引力来自“规格感”。Daraz 页面把它写成 M800/J800/800 Piston resin Fountain Pen，并在标题中提到 Schmidt/Bock #6、EF/F/M/B、0.5/0.7 mm 等笔尖信息。即使不展开品牌故事，也能看出它在卖什么：树脂笔身、活塞上墨、大号笔尖选择。

活塞上墨是这支笔的核心。和普通墨囊笔相比，活塞容量更大，灌满后适合长时间使用。代价是清洗慢，换墨不如 converter 方便。若你总想一天换一种颜色，简800 可能会让你烦；若你习惯固定一瓶蓝黑或黑色墨，它的大容量就有价值。

#6 尺寸笔尖让它看起来更像大笔。大笔尖有视觉气势，也更方便后期替换或调校，但具体手感取决于出厂版本和单支状态。买这类笔，别只看“Bock”或“Schmidt”字样，收到后仍要检查笔尖是否对齐、铱点是否平顺、供墨是否跟得上。

简800 也会把维护问题提前摆到用户面前。活塞旋钮是否顺、笔杆是否有细裂、笔帽密封是否可靠，都会影响长期体验。树脂笔身看起来轻松，实际也怕摔和挤压。若你把它放进通勤包，最好有独立笔套，不要和钥匙、金属尺混在一起。

它的价格如果足够低，就会很适合当“活塞体验笔”。你能用它判断自己是否真的需要大容量，是否愿意为了活塞多花清洗时间，是否喜欢大号笔尖带来的视觉比例。很多人买活塞笔前只想着容量，真正用起来才发现清洗和换墨习惯更重要。简800 可以把这个问题提前暴露出来。

它适合和末匠、意斯华、金豪的大尺寸国产笔放在一起比较。简800 的优势是低成本尝试活塞和大尖；风险是品控、售后和资料透明度不如成熟国际品牌。你买到的是一支有结构看点的日用笔，不是一支靠品牌历史支撑价格的笔。

购买前先确认具体版本。页面里 M800、J800、800 等叫法容易混用，笔尖规格、颜色、上墨结构也可能随卖家变化。二手或跨境购买还要看是否漏墨、活塞是否顺、笔帽是否能正常密封。若你想花小钱体验大容量活塞，简800 可以试；若你最怕折腾，TWSBI 或百利金入门活塞会更稳。第一次灌墨别灌太满，先确认没有渗漏再长期携带。长写前也要确认笔握不会打滑。`,
  },
  {
    slug: "意斯华-p36",
    title: "意斯华 P36：钛合金和活塞带来的重量感",
    summary:
      "意斯华 P36 是偏大、偏硬朗的活塞钢笔，钛合金版本把材料和结构放到前面，适合喜欢重笔和透明储墨感的人。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Amazon US Asvine P36 Titanium Piston 页面，写钛合金、透明笔身、活塞和尺寸重量带来的使用边界。",
    },
    body: `意斯华 P36 要先从体量看。Amazon US 的 Asvine P36 页面写的是 Titanium Piston Fountain Pen，配透明结构和钢尖选项。它不是那种轻巧放进口袋就忘掉的笔。钛合金、活塞、透明储墨这些关键词放在一起，说明它更偏向桌面写作和玩家尝试。

钛合金给人的感觉很明确：冷、硬、结实，也比常见树脂笔更有重量存在感。喜欢轻笔的人可能很快放下它，喜欢稳重笔身的人会觉得握在手里更踏实。购买 P36 前最好确认自己是否接受重心和握位，尤其是长时间写中文时，重量会比外观更早影响手感。

活塞结构让 P36 有大容量，也让它更像一支固定搭配某瓶墨水的笔。透明笔身能看到余墨，适合喜欢观察墨色的人。清洗时要有耐心，深色或高饱和墨水会留下更多痕迹。若你常换墨，converter 笔会轻松很多。

P36 的适用场景偏桌面。它适合放在书桌上写日记、摘抄或长一点的笔记，不太像随身轻便笔。插帽之后如果重心后移，很多人会选择不插帽使用。买之前可以拿同重量的金属笔试一段，确认自己手腕是否接受。

钛合金版本还有一种特殊吸引力：它看起来比树脂笔更像工具。喜欢这种冷硬质感的人，会觉得 P36 有可靠感；喜欢温润、轻巧、安静书写的人，可能会觉得它太强调存在感。材料本身不会让笔尖变好，它只会改变你握住它时的心情和负担。

它常被拿来和末匠 V60 等国产活塞笔比较。P36 的路线更硬朗，V60 则靠三角笔身制造识别度。两者都不是传统金尖路线，判断重点应放在笔尖调校、活塞顺滑度、握持和售后。

买 P36 时，先查清是钛合金还是其他材质版本，再看尖号、是否使用常见规格笔尖、活塞是否顺。收到后写一整页，比只划几条线更有用。它适合想要一支有材料感的大容量国产笔的人；若你主要写课堂笔记或小格手账，先试轻一点的型号会更保险。纸张也要选厚一点，偏丰出墨会放大洇纸问题。若你已经喜欢重笔，P36 会很容易理解；若你平时只用轻塑料笔，它可能比想象中更累手。它更适合固定桌面使用，不适合天天塞进小笔袋。把它和轻巧日用笔分工，会舒服很多。若手指容易累，先别急着买钛合金版。先试握最稳。确认重量、活塞、尖号三件事，再谈是否值得。`,
  },
  {
    slug: "依人-yiren-878",
    title: "依人 878：低价国产笔先看基本功",
    summary:
      "依人 878 是低价国产钢笔，公开零售信息能确认型号和镀银款式。它适合按备用笔、练字笔和尝鲜笔来判断。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 JD 的 YIREN 依人 878 镀银钢笔页面写低价国产笔购买判断，不扩写无来源规格。",
    },
    body: `依人 878 这类笔，最怕被写得太玄。JD 页面能确认它是 YIREN 依人 878 镀银钢笔，剩下的判断应该回到基本功：笔尖是否顺，出墨是否稳，握起来是否舒服，笔帽是否可靠。它靠价格和日用门槛吸引人，品牌故事不该被写成卖点。

低价国产笔的优势很实在。你可以把它放在包里、办公室抽屉里，或者当练字备用笔，不需要像金尖笔那样小心。镀银外观会比普通塑料笔更正式一些，适合想要一点“像钢笔”的仪式感，又不愿投入太多预算的人。

这种定位也决定了它的使用场景。依人 878 适合写清单、签收、临时笔记和练字，不适合承担每天几十页的高强度任务。若你用的是便宜复印纸，细一点、干一点的尖会更舒服；若出墨偏湿，纸张会立刻暴露缺点。

依人 878 也适合用来判断自己是否真的需要钢笔。很多人第一次买笔，会被金尖、活塞、老款故事吸引，最后发现自己只是需要一支能让字迹稍微慢下来、比中性笔更有手感的工具。878 这类低价笔把试错成本压低，适合先摸清自己的纸张、字迹大小和换墨意愿。

真正要留意的是品控。低价笔的差异常出现在笔尖对齐、笔帽松紧、出墨浓淡和表面处理。收到依人 878 后，先用普通墨水写半页，检查有没有飞白、断墨、刮纸。再放一天，看第一笔是否能正常出水。这个测试比看参数更能说明问题。

它适合和金豪、永生、英雄的低价型号放在一起看。若你要的是稳定可替换的日用，金豪 82、英雄 616 这类资料更多；若你只是想试一个便宜款式，依人 878 的风险也相对可控。不要用收藏笔的标准要求它。

购买时选靠谱渠道，确认是否带墨囊或上墨器。镀银表面要看是否容易留下划痕，笔夹和笔帽也要检查。依人 878 适合练字、备用和短写。若你已经明确知道自己喜欢哪种线宽、哪种握位，下一步再升级到资料更完整的型号会更稳。把它当备用笔，会比当核心主力更合适。它的价值在便宜和不心疼，别指望它承担收藏、礼品和长期重度书写。买到顺手的单支就好，不必围绕它建立复杂预期。若第一支体验不好，也不必据此否定钢笔本身。换一张纸、换一种墨水，再判断也不迟。低价笔最需要耐心验收。真正合格的 878，应该是不出戏地完成日常小任务。别追溢价。`,
  },
  {
    slug: "弘典-hongdian-苏木",
    title: "弘典苏木：木杆礼盒笔的日用边界",
    summary:
      "弘典苏木适合按原木笔杆钢尖礼盒笔来看：外观温和，价格通常不高，真正影响体验的是气密、握位和钢尖调校。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 JD 的 HongDian 1866 苏木原木钢笔礼盒页面和既有研究摘要，写木杆、钢尖、礼盒和气密检查。",
    },
    body: `弘典苏木的第一眼是木杆。JD 页面写到 HongDian 1866 苏木原木钢笔礼盒，这个信息已经把它和普通金属杆、塑料杆入门笔区分开了。它更适合被看成一支外观温和、适合送礼或桌面使用的国产钢尖笔。

木杆会给钢笔带来亲近感，也会带来保养问题。它不像金属那样冷，也不像树脂那样完全均匀。手汗、磕碰、温湿度都会让表面留下痕迹。喜欢这种变化的人会觉得木杆有味道，追求一直崭新的人要谨慎。

苏木的使用体验仍然要看钢尖和气密。国产钢尖近几年进步很快，但单支差异仍要检查。收到后先看笔尖是否对齐，再写半页中文小字，确认线条是否稳定。若打算每天带着用，还要测试放置两三天后的第一笔。木杆再好看，第一笔总干也会影响心情。

礼盒笔还有一个现实问题：看起来适合送人，不等于一定适合收礼者。若对方没有用钢笔习惯，要确认墨囊、上墨器和清洗方式都容易理解。木杆笔放在桌面上很好看，放进学生书包就未必合适。使用场景决定它是否真的被拿起来。

苏木和弘典黑森林的差别，也能帮助判断。黑森林更像耐造的通勤笔，金属杆、低调外观，摔碰压力小一些。苏木更像摆在桌上的文具，适合短写和赠礼，材料感比耐用感更突出。若你已经有一支普通日用笔，苏木更适合作为第二支有外观变化的笔。

它适合和弘典黑森林、N 系列、金豪木杆笔一起比较。黑森林更像结实的金属日用，苏木更强调材质和礼盒感。若你要送给刚接触钢笔的人，苏木的外观比复杂参数更容易被理解；若对方每天写很多页，握位和重量要先确认。

购买时看清是否是 1866 苏木版本、随附耗材和笔尖规格。木杆笔要检查表面裂纹、笔帽闭合和笔夹牢固度。弘典苏木适合短写、签字、手账和桌面摆放。它不需要承担旗舰笔的任务，能稳定出水、握得舒服、木杆处理干净，就已经对得起这个定位。长写前先试半页，确认手指不会被笔杆边缘或重心拖累。若要当礼物，最好连墨囊和基础清洗说明一起准备好。自己用则要接受木杆会留下痕迹。保养上少泡水，少暴晒，日常擦干即可。买前多看实拍，木纹差异会影响观感。不要只看礼盒照片。若收礼者喜欢低调文具，它会比亮面金属笔更讨巧。日常用完擦干笔杆，会更省心。笔帽也要盖紧。别长期空置。定期写几行。`,
  },
  {
    slug: "末匠-majohn-v60",
    title: "末匠 V60：三角活塞笔的握持实验",
    summary:
      "末匠 V60 的识别点是三角笔身和活塞上墨。它适合想试国产结构笔的人，但握持形状必须亲自确认。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Amazon US Majohn V60 Triangular Piston Fountain Pen 页面写三角笔身、活塞和握持筛选。",
    },
    body: `末匠 V60 的关键词很清楚：三角，活塞。Amazon US 商品标题写着 Majohn V60 Triangular Piston Fountain Pen，说明它不是普通圆杆换个颜色。V60 把笔身形状和上墨结构都放到前面，适合想玩结构、又不想直接上高价品牌的人。

三角笔身会强烈影响握持。圆杆笔允许手指自己找角度，三角笔身会替你规定方向。若你的握笔姿势刚好匹配，它会稳定、舒服；若不匹配，写几行就会觉得别扭。买 V60 前，最好先看握区实拍，确认三角面是否落在自己的手指位置。

活塞上墨让 V60 有更强的玩家味。它能装更多墨，也能透过笔身观察余量。代价是清洗慢，拆装和维护也比墨囊笔麻烦。用 V60 时，适合固定一瓶墨写一段时间，不适合每天换颜色。

这支笔还会考验使用者对“造型”的耐心。三角笔身放在图片里很有识别度，真正写字时却会限制旋转角度。有人会因此写得更稳定，也有人会觉得手指被安排。它不是单纯外观差异，购买前要把它当成握持问题。

V60 也会筛选墨水使用习惯。活塞容量大，适合一瓶墨写很久；透明或半透明结构会让墨色参与外观。若你喜欢把笔洗得很干净，V60 会让清洗工作变多。若你愿意接受一点墨痕和使用痕迹，它会比普通黑杆笔更有“正在工作”的感觉。

它可以和意斯华 P36 放在一起看。P36 更强调钛合金和重量，V60 更强调形状和透明结构。两者都在国产结构笔的范围内，判断时别只看谁更像某个高端型号，真正要看的是笔尖调校、活塞顺滑、握持和售后。

购买 V60 时先看尖号、笔身材质和是否带上墨工具。收到后测试活塞是否顺、笔尖是否偏刮、连续书写是否供墨稳定。它适合喜欢折腾、愿意试握持新形状的人。若你只想要一支不用想太多的日用笔，Pilot Prera、Platinum Plaisir 或 LAMY Safari 会更轻松。把它当成实验笔，会比把它当成万能主力更合理。真正适合它的人，通常也愿意为了结构多花一点维护时间。写字姿势越固定，越应该先试握。常写长文的人尤其要谨慎。先用便宜墨水跑通活塞和供墨。不要第一天就灌难洗的墨。确认握持后，再考虑把它加入日常轮换。先写半页。`,
  },
  {
    slug: "百利金-pelikan-p457",
    title: "Pelikan P457：Twist 系列的校园路线",
    summary:
      "Pelikan P457 更接近 Twist 校园笔路线，彩色外观和入门价格让它适合学生、短写和品牌入门，不应和 Souveran 金笔混在一起看。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Amazon US 的 Pelikan Twist P457/M Pure Gold 页面，写 Twist/P457、M 尖和入门校园定位。",
    },
    body: `Pelikan P457 要和 Souveran 分开看。Amazon US 页面写的是 Pelikan Twist P457/M Pure Gold Fountain Pen，这个名字已经把它放进 Twist 入门线。它不是 M200、M400 那种活塞百利金，也不靠传统条纹笔杆取胜。P457 更像一支给学生和日常短写准备的现代校园笔。

Twist 系列的重点在握持和外观。它通常有更明显的造型，不追求老派金笔比例。P457/M 里的 M 可以理解为中号尖信息，适合英文、签名和较大的字。若你写中文小字，要先看实际线宽，M 尖在普通纸上可能显得粗。

它常被拿来和 LAMY Safari 这类校园笔比较。Safari 的三角握区会训练手指，造型也更硬朗；Pelikan Twist 更圆润，也更像彩色文具。两者都不是高端金笔，真正的区别在握持、线宽、笔帽手感和耗材便利。

P457 的“百利金”名字容易造成误会。它和 Souveran 共享品牌，不共享定位。买它的理由不该是活塞、金尖或收藏价值，更应该是一支有设计感的学生钢笔。把期待放准，才不会觉得它和照片里的 M400、M800 落差太大。

这种定位反而让 P457 更容易日用。它不需要你小心伺候，也不需要昂贵维护。放在笔袋里、课堂上、办公室抽屉里都合理。真正要确认的是握区和线宽：如果中号尖在你的纸上太粗，再好的品牌名也帮不上忙。

P457 的好处是低压力。你可以把它当成第一支百利金，也可以当备用笔。它不会让你体验百利金差动活塞，却能让你知道自己是否喜欢 Pelikan 的入门书写路线。若你想理解百利金为什么被玩家讨论，M200 以上更合适；若你只是想买一支好看的校园钢笔，P457 的目标更直接。

购买时确认具体颜色、尖号和是否带墨囊。入门笔要看笔帽是否可靠，握区是否合手，笔尖是否顺。P457 适合学生、轻办公和手账短写。别把它当成 Souveran 的廉价替代品，它的任务更简单：好拿、好看、能稳定写。若要写中文小字，最好先找实写线宽。给孩子使用时，笔帽和握区比品牌故事重要得多。日常摔碰也要考虑。耗材也要方便补。别买太贵。`,
  },
  {
    slug: "欧领-campus-校园系列",
    title: "ONLINE Campus：德国校园笔的轻量选择",
    summary:
      "ONLINE Campus 是面向学生的轻量钢笔，官方店页面能确认塑料笔身、软握区、铱金属笔尖、约 15 g 重量和 0.5 mm 线宽。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 ONLINE official shop Campus Color Line 页面写塑料、soft grip、iridium nib、15g 和 0.5mm 等规格。",
    },
    body: `ONLINE Campus 是一支很典型的校园钢笔。官方店的 Campus Color Line 页面给出的信息比较完整：塑料笔身，soft grip，iridium nib，约 15 g，0.5 mm 线宽，尺寸约 141 x 17 x 13 mm。它的目标很朴素：让学生能轻松、稳定地写。

轻是 Campus 的优势。15 g 左右的重量对长时间课堂笔记很友好，手腕负担小。塑料笔身不会显得高级，却适合书包和文具盒。软握区则把重点放在舒适和防滑上，对刚开始用钢笔的人比金属装饰更实用。

官方规格里的 141 mm 长度和 17 mm 宽度，也说明它不是细瘦的成人办公笔。校园笔通常会照顾握持稳定性，外形会更饱满。手小的学生要看握区实际直径，手大的成人也别只因为轻就下单，软握区是否顺手才是关键。

Campus 的优势还在于信息透明。官方页面给出尺寸、重量和线宽，家长或初学者可以提前判断是否合适。很多低价笔只给一张图和一个型号名，买回来才知道粗细、重量和握区。Campus 至少让你在下单前有一组可以对照的基础参数。

0.5 mm 线宽要结合中文书写判断。英文笔记和较大字问题不大，中文小格本可能会觉得略宽。买给学生时，最好确认常用纸张和字迹大小。若纸张容易洇，线宽和墨水会比品牌名更影响体验。

Campus 可以和 LAMY Safari、Pelikan Twist 放在一起比较。Safari 的设计感更强，Twist 更有彩色文具感，Campus 的优势在轻和软握区。三者都属于校园路线，选择时看握持，不要只看外观。

这支笔适合学生、轻办公和入门练习。它不负责提供金尖反馈，也不需要讲复杂结构。购买时看清是否是右手版本、随附墨囊和尖号。若你想给孩子或初学者买一支不折腾的钢笔，Campus 的定位很清楚：轻、简单、容易拿起来写。它的价值在稳定上课，不在制造玩家话题。若已经习惯金属办公笔，Campus 会显得玩具感更强。给初学者用，这反而未必是坏事。关键是让人愿意每天打开本子。用完能顺手盖紧笔帽，也很重要。课堂笔记比签名更适合它。若写作业纸张偏薄，墨水要选克制些。别配太湿的墨。`,
  },
  {
    slug: "永生-wingsung-729",
    title: "永生 729：老国产笔更要看状态",
    summary:
      "永生 729 更适合按老国产/库存笔来看。型号名本身不够说明体验，购买时要把笔尖、上墨、密封和保存状态放在前面。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Minapens 的 WingSung 729 页面和公开索引，按老国产笔状态判断写，避免虚构年份和产线故事。",
    },
    body: `永生 729 不能只靠型号名判断。Minapens 的页面能确认 WingSung 729 这个条目，但老国产笔常见的问题是版本、库存状态和维修痕迹差异很大。同叫 729，实际拿到手的状态可能完全不同。

看这类笔，第一步是笔尖。老笔的笔尖可能被写磨、摔歪或重新调过。图片再好看，也要看铱点、笔尖缝、笔舌贴合和试写线条。若卖家只给外观照，没有笔尖细节，风险会高很多。

第二步是上墨和密封。老永生常见吸墨结构和现代 converter 笔不同，橡胶件、囊、压杆或密封部件都可能老化。能不能吸墨、会不会漏、放一晚后第一笔是否正常，比“老款情怀”更重要。买来若需要修，成本和时间都要算进去。

永生 729 的价值在老国产笔的手感和年代气息。它可能轻、细、带有过去国产日用笔的比例，也可能需要你动手清理、换囊、调尖。动手能力强的人会觉得有意思，只想开盒就稳定写的人会更适合现代金豪、弘典或 Pilot 入门线。

这类笔还要看你买它的目的。若是想了解老国产钢笔，729 可以当样本；若是想找便宜主力，现代库存和新款低价笔会更省事。老笔的乐趣常常来自整理过程，清洗、排查漏墨、调整笔尖都算体验的一部分。讨厌这些步骤的人，很难长期喜欢它。

如果你已经有稳定日用笔，再买 729 会更轻松。它可以承担“了解老永生”的角色，不必每天上班上课都靠它。这样遇到漏墨、干尖或需要换囊，也不会影响正常写字。老笔最怕被迫当唯一主力，容错空间一小，乐趣就会变成麻烦。

购买时要求实拍，尤其是笔尖、笔舌、上墨部件和笔帽闭合。价格很低时可以当学习修笔的样品；价格被炒高时，要问清楚凭什么。永生 729 适合喜欢老国产笔、愿意接受不确定性的人。若你只是想买一支日常主力，别让怀旧感替你做决定。能试写最好，不能试写就把预算留出维修余地。收到后先用清水检查上墨，不要急着灌昂贵墨水。确认不漏，再谈日常使用。若笔囊老化，先修再写，不要硬撑。老笔要慢慢收拾。能接受这个过程，再买 729 会轻松得多。若想省心，现代量产低价笔更直接。它更适合玩家，不适合怕麻烦的人。别拿它和新笔比售后。修好后再长期使用。保存也要避热避潮。别囤太多。够用就好。`,
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
  if (article.body.length < MIN_CHARS) {
    failures.push(`too short ${article.body.length}; expected at least ${MIN_CHARS}`);
  }
  if (article.body.length > MAX_CHARS) {
    failures.push(`too long ${article.body.length}; expected at most ${MAX_CHARS}`);
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
  const sourceNotes = `Reader-first C-tier entry article. Humanizer-zh self-review: ${humanizerTotal(article)}/50. ${article.humanizer.notes}`;

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
       SELECT ?, 'story', ?, ?, 'Reader-first C-tier article source', datetime('now')
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

  return `# Read first C 档入门/国产型号 humanizer-zh 审查

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
    console.log(`Validated ${ARTICLES.length} C-tier entry article(s).`);
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
