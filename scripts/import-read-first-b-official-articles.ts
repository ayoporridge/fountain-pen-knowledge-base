import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REVIEW_PATH = path.join(
  process.cwd(),
  "docs/content/read-first-b-official-humanizer-review.md",
);
const B_MIN_CHARS = 1000;
const B_MAX_CHARS = 1800;

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
    slug: "diplomat迪波曼-aero太空梭",
    title: "Diplomat Aero：一支把金属感放在前面的德国日用笔",
    summary: "Diplomat Aero 的重点是铝制笔身、墨囊/上墨器结构和硬朗外形，适合喜欢金属握感与清楚工业风格的用户。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "围绕官方 Aero 页面和金属笔身写，避免把它写成抽象德国工业符号。",
    },
    body: `Diplomat Aero 一眼就不像温润树脂笔。它的入口是金属、沟槽和硬朗的轮廓。官方页面把它放在 Aero Fountain Pen 系列里，能确认铝制笔身、墨囊/上墨器上墨，以及钢尖和金尖版本的存在。读这支笔，不必先讲太远的品牌史，先看它想给手里留下什么感觉。

Aero 的笔身很有存在感。铝材让它不像轻塑料笔那样随手，也不像黄铜笔那样一味压手。沟槽外形让视觉更有节奏，握在手里也会提醒你：这是一支有明确物件感的钢笔。喜欢光滑圆筒的人可能觉得它太硬，喜欢工具感的人会更容易接受。

这支笔的日用逻辑很清楚。墨囊/上墨器结构方便清洗，换墨不麻烦；钢尖版本更适合日常使用，金尖版本则把价格和手感期待往上推。选择时不用只盯着“德国制造”这类标签，尖号、重量、握位粗细和笔帽开合才会真正影响每天写字。

如果你平时写中文小字，Aero 的判断要从尖号开始。钢尖版本通常更像一支可靠的工作笔，线条清楚，反馈直接，适合会议记录、手账日期和短段落。金尖版本不该只被理解成“更贵”，它改变的是笔尖触纸时的期待，也会让用户更在意调校是否合手。官方页面给的是配置入口，真正下单前还要对照零售页或实拍，确认具体颜色、尖号和随笔配件。

和 LAMY 2000 比，Aero 更外露，少了包豪斯式的收敛，多了金属件的直接。和 TWSBI ECO 这类透明活塞笔比，它不靠大容量和透明结构吸引人。和 Waterman Expert 比，它也更像一件金属工具，正式感没有那么商务，个性更强。

购买 Aero 时，先想清楚自己是否接受金属笔身和较明确的重量。若主要写课堂笔记或长文，最好关注手腕疲劳和握位触感；若用于签字、短笔记或桌面工作，它的质感会更合适。笔帽和笔身的平衡也值得试写时留意，金属笔在短时间内会显得高级，写久以后才会暴露重量和握位的真实影响。

如果把它放进第一支中高价日用笔的候选名单，Aero 的优势是容易判断。你不需要研究复杂年代，也不需要在一堆限量故事里分辨真假。确认官方配置、选好尖号，再试一试重量，基本就能知道它是不是你的路数。这个清楚，正是它讨喜的地方。

Aero 的价值在于边界清楚。它不会伪装成复古树脂笔，也不想靠复杂上墨系统讲故事。你要的是一支看起来、摸起来都偏工业感的现代钢笔，它就很合适。你要的是轻、软、隐身感强的日用工具，它可能会太有性格。这样的判断比一句“德国制造”更有用。`,
  },
  {
    slug: "esterbrook-estie-oversized",
    title: "Esterbrook Estie Oversized：现代复兴品牌的大号日用笔",
    summary: "Esterbrook Estie Oversized 是现代 Esterbrook 里更大尺寸的 Estie，重点在舒展握持、树脂外观和现代可维护性。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把 Estie Oversized 放在现代复兴品牌语境里，突出尺寸和日用判断。",
    },
    body: `Esterbrook Estie Oversized 不能按老 Esterbrook Model J 的方式读。它借用了 Esterbrook 这个老名字，却属于现代复兴后的产品线。官方 Estie Oversized 页面能确认它是 Estie 家族里的大号尺寸，资料也指向树脂/亚克力类笔身、现代墨囊/上墨器使用习惯和 Jowo 笔尖配置。

这支笔的关键词是“大”。Oversized 不是小修小补的形容词，它会直接改变握持。手大、喜欢粗一点笔身、希望笔杆更稳的人，会比喜欢轻巧细笔的人更容易接受它。页面里的图片和配色很容易先吸引眼睛，但真正使用时，尺寸比颜色更关键。

Estie 的现代性也在维护上。它不像 vintage Esterbrook 那样要先考虑杠杆、墨囊老化和 Renew-Point 老笔尖状态。现代 Estie 更接近当代钢笔用户熟悉的逻辑：拆洗、换墨、选尖号、看配色。它给人的感觉更接近当代日用笔：一个复兴品牌把老名字重新做成现代产品。

Oversized 的意义不只在视觉比例。粗一点的笔身会让手指不必夹得太紧，长时间写字时可能更放松；同样的尺寸也可能让手小的用户觉得笨重。若你习惯 Kaweco Sport、Pilot Prera 或 LAMY Safari 这类比较轻的笔，第一次拿 Estie Oversized 最好先确认手掌能不能接受它的体积。漂亮树脂在照片里很讨喜，握持适配才决定它能不能进入日常。

和 Kaweco Sport 比，Estie Oversized 完全不是便携路线。和 Leonardo Momento Magico 比，它少一点意大利手工树脂叙事，多一点美国老品牌复兴的味道。和 TWSBI 580 比，它也不靠透明结构和活塞容量取胜，而是靠外形、尺寸和配色。

购买时先确认自己是否真的需要 Oversized。很多人喜欢大笔的稳定，但长时间书写时，重量和握位会放大差异。若只是被漂亮树脂吸引，可以先对比普通 Estie 和 Oversized 的尺寸。再看笔尖，Jowo 系统的好处是规格成熟，调换和维修信息也更容易找到；缺点是它不会天然带来老 Esterbrook 那种可更换笔尖生态的历史趣味。

Estie Oversized 最适合的用户，是想要一支现代、好维护、握持更舒展的大号钢笔，同时也愿意为配色和品牌复兴故事付费。它不该被当成老 Esterbrook 的替代品。把它当成一支带复古名字的现代大号日用笔，判断会更准确。`,
  },
  {
    slug: "leonardo-furore-momento-magico",
    title: "Leonardo Furore / Momento Magico：意大利树脂和日用结构的两条路",
    summary: "Leonardo Furore / Momento Magico 页面适合从意大利现代树脂笔、不同上墨结构和版本差异理解，购买时要分清具体系列。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "提醒 Furore 与 Momento Magico 不能混看，依据官方 Momento Magico 集合写结构判断。",
    },
    body: `Leonardo Furore / Momento Magico 这个页面把两条容易被一起讨论的 Leonardo 现代产品线放在了一处。读者打开时，最需要先分清：这不是一个单一型号。Furore 和 Momento Magico 都带有 Leonardo 的意大利树脂气质，但上墨结构、尺寸、版本和价格判断并不完全一样。

已登记的官方来源是 Leonardo Momento Magico Collection。资料里也记录了一个基础差异：Momento Magico 更常和活塞上墨联系在一起，Furore 则常见上墨器版本。这个差别很实际。活塞给人更强的一体感和容量期待，上墨器版本清洗、换墨和维护更轻松。

Leonardo 的吸引力通常不在极简。它更愿意让树脂、颜色、纹理和意大利工坊感站出来。喜欢透明工程感的人可能会转向 TWSBI 或 Opus 88；喜欢克制工具感的人可能会选 LAMY 或 Diplomat。Leonardo 更适合愿意让钢笔在桌面上有一点色彩和装饰感的用户。

把 Furore 和 Momento Magico 混在一起看，最容易出错的地方是上墨。你如果重视容量、喜欢一次灌满墨水写很久，Momento Magico 的活塞结构更有吸引力。你如果经常换颜色，或者不想清洗活塞系统，上墨器版本会轻松得多。钢笔的审美可以靠照片决定一半，剩下一半要看你和墨水相处的方式。

写感则要回到具体版本。钢尖、14K 金尖、不同尖号和调校都会改变体验。不要只看树脂好不好看，也不要只用“意大利笔”来概括。对中文用户来说，尖号和出墨比材料名更重要。漂亮笔身如果配了不合适的线宽，日用体验会打折。

购买时先确认你看的到底是 Furore 还是 Momento Magico，再看上墨方式、笔尖材质和尺寸。若你喜欢频繁换墨，Furore 式的上墨器逻辑更轻松；若你想要更完整的笔身结构和容量感，Momento Magico 更值得细看。也要留意不同批次和限量配色，Leonardo 的树脂变化会让同一系列看起来差别很大，二手或库存页面尤其要核对实拍图。

它和 Pelikan M800、Montblanc 146 这类传统旗舰的比较也很有意思。Leonardo 没有把自己收进黑金正装笔的框里，它更愿意让颜色和材料先说话。对收藏者来说，这意味着版本选择丰富；对日用者来说，也意味着更需要克制。先选结构，再选颜色，这个顺序会少走弯路。`,
  },
  {
    slug: "wancher万佳-dream-pen",
    title: "Wancher Dream Pen：把日本材料和装饰工艺放进同一条产品线",
    summary: "Wancher Dream Pen 不是固定单款，系列里有 ebonite、Urushi、Maki-e 等不同版本，阅读重点在具体版本与工艺差异。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "强调 Dream Pen 是集合型产品线，避免写成单一规格。",
    },
    body: `Wancher Dream Pen 容易被名字误导，好像它是一支固定规格的钢笔。官方 Dream Pen Collection 更像一条集合型产品线：不同材料、不同装饰、不同笔尖配置，都可能出现在 Dream Pen 名下。资料提到 ebonite、Urushi、Maki-e 等版本，也提醒读者不要把一个版本的特征套到全部 Dream Pen 上。

这条线的吸引力在材料和工艺。Ebonite 会带来不同于树脂和金属的触感，Urushi 和 Maki-e 又把外观推向更手工、更装饰的方向。它和 TWSBI、LAMY 这类功能感很强的产品不在同一路线上。Dream Pen 更像让用户从材料、图案和工艺进入钢笔。

使用判断仍然要落回具体版本。不同 Dream Pen 的重量、握位、笔尖来源和上墨结构可能不同。若你只是看一张漂亮图，很难判断它适不适合长写。尤其是漆艺和装饰版本，收藏和日用之间要先想清楚：你会不会真的带出门，会不会频繁换墨，会不会接受表面随使用留下痕迹。

Wancher 的难点在“Dream Pen”这个总名太宽。一个 ebonite 版本和一个 maki-e 版本，虽然都叫 Dream Pen，读者面对的其实是两种购买问题。前者更像材料手感选择，后者更接近工艺和画面选择。若再加上不同笔尖和尺寸，单看系列名几乎没有意义。这个页面最重要的任务，是提醒读者把具体链接、具体版本和实物图拿出来看。

和 Nakaya 比，Wancher Dream Pen 的品牌叙事和定制体系不同；和 Namiki 比，它也不在同一个传统大厂 maki-e 位置上。它更适合作为现代跨文化工艺钢笔来看：把日本材料、装饰审美和国际市场需求放在一起。

购买时先确认具体页面，而不是只确认“Dream Pen”四个字。看材料、笔尖、上墨、尺寸、交付方式和售后。若是 Urushi 或 Maki-e 版本，还要接受每支笔的观感差异。还要留意交付周期和库存状态，工艺型钢笔的购买体验往往不像常规量产笔那样简单。

Dream Pen 的好处在选择丰富；麻烦也在这里。读者需要先选清楚自己要的是书写工具，还是带工艺属性的收藏物。若主要用来每天记笔记，优先看重量、握位、清洗和尖号。若主要用于收藏，来源、图案、保存和版本记录更重要。第一次接触这个系列，可以先从材料最清楚、实拍最多的版本看起，别急着追复杂装饰。它可以是一支很有趣的笔，但前提是你不要被系列名带着走。`,
  },
  {
    slug: "万宝龙-montblanc-144",
    title: "Montblanc 144：比 146 更轻的 Meisterstück 路线",
    summary: "Montblanc 144 / Classique 更适合从轻巧尺寸、14K 金尖和墨囊/上墨器便利性理解，不应直接按 146 或 149 的逻辑判断。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "区分 144/Classique 与 146/149，围绕尺寸和上墨方式写。",
    },
    body: `Montblanc 144 常被夹在 146 和 149 的阴影里。很多人谈 Meisterstück，会先想到活塞上墨、大尺寸和更强的旗舰气势。144 的读法不一样。它更轻、更细，也更接近今天 Classique 那条路线：保留万宝龙的正式外观，同时把使用压力降下来。

已登记的官方来源是 Meisterstück Gold-Coated Classique Fountain Pen 页面。当前 Classique 使用墨囊/上墨器逻辑，资料中也记录了 144 vintage 常见 Au 585 / 14K 金尖。这里要分清现代 Classique 和 vintage 144 的细节差异，但两者都能帮助读者理解这条小一号 Meisterstück 的位置。

144 的好处在轻巧。它没有 149 那种大笔的存在感，也没有 146 活塞上墨的传统收藏光环。对手小、喜欢细一点笔身、常带笔出门的人来说，144 反而可能更实用。它看起来仍然正式，但不会把日常书写变成一件很隆重的事。

这也是 144 容易被低估的原因。它不适合用“旗舰不旗舰”来判断。真正拿来写字时，尺寸比等级更先影响体验。146 和 149 的笔身会让书写姿势更有存在感，144 则更接近普通日用笔。若你想把 Meisterstück 放进日常文件、手账或会议记录里，144 的小一号路线反而更自然。

缺点也明显。喜欢大笔、喜欢活塞机构、想要强烈收藏辨识度的人，可能会觉得 144 不够“主角”。墨囊/上墨器带来便利，也少了某些玩家期待的传统感。买它之前，最好把“万宝龙”这个品牌想象先放轻一点，回到尺寸、重量和真实用途。

购买 vintage 144 时，先看笔尖状态、帽身裂纹、上墨器兼容和镀金件磨损。现代 Classique 则要看是否适合自己的握持和预算。二手市场里的 144 还要留意年代、笔夹、环饰和整体成色，最好别只凭一张远景照片判断。万宝龙的品牌溢价会放大细节问题，修复成本也要算进总价。

144 最适合的读者，是想要 Meisterstück 的正式外观，又不想被 146/149 的尺寸和维护逻辑绑住的人。它不是“缩小版旗舰”这么简单，更像一条偏日用的 Meisterstück 分支。你如果需要的是写起来轻松、放进办公室不突兀、维护也不复杂的万宝龙，144 比它在玩家讨论里的声量更值得认真看，也更容易真正被用起来。`,
  },
  {
    slug: "威迪文-waterman-权威-expert",
    title: "Waterman Expert：商务钢笔里很直接的一支",
    summary: "Waterman Expert 的重点在法国品牌背景、金属/漆面笔身、钢尖和墨囊/上墨器结构，适合正式办公和短中篇书写。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把 Expert 写成现代商务笔，不套用 vintage Waterman 逻辑。",
    },
    body: `Waterman Expert 是一支很容易理解的现代商务钢笔。它没有 Carène 那种嵌入式笔尖造型，也没有早期 Waterman 硬橡胶笔的 vintage 趣味。资料能确认 Expert 系列、法国品牌背景、钢尖、墨囊/上墨器结构，以及金属/漆面笔身。它的重点就是正式、稳定、容易维护。

Expert 的外观适合办公场景。金属和漆面的组合让它看起来比入门塑料笔更正式，但又不像限量收藏笔那样需要小心展示。拿来签字、会议记录、工作笔记都自然。它不是为了制造强烈个性，更多是给一个可靠、体面、不太出错的答案。

钢尖是这支笔的现实部分。有人会因为价格去期待金尖手感，但 Expert 的核心在稳定和可控，别按软弹或弹性来期待。墨囊/上墨器结构让清洗和换墨都比较简单，适合不想被复杂维护打断的人。对很多办公用户来说，这比复杂上墨系统更有用。

Waterman 的品牌历史很长，Expert 却不需要背完整个品牌史。它更像现代 Waterman 给办公用户的一支常规答案。笔身有一定分量，外观足够正式，放在衬衫口袋、会议桌和文件夹旁边都不会突兀。你如果要找的是一支每天都能拿出来用的商务笔，这种不抢戏的气质反倒是优点。

和 Waterman Carène 比，Expert 更保守，也更容易接受。Carène 的嵌入式金尖更有设计感，Expert 则像常规商务笔。和 Hemisphere 比，Expert 通常更有分量和正式感。和 Montblanc 144 比，Expert 的品牌压力小一些，日用心态也更轻。

购买时先看握持粗细、重量和尖号。若你主要写中文小字，细尖或中细尖更稳；若用于签名，中尖会更有存在感。还要确认笔帽密封、笔夹松紧和漆面状态，办公笔常被频繁开合，这些细节比宣传语更影响体验。二手 Expert 若价格诱人，也要把镀层磨损和握位划痕算进去。礼品场景还要看包装和售后来源，这类办公笔常常面向每天要签文件的人，不一定面向玩家。用这个角度挑，反而更接近它的真实用途。

Expert 最适合想要一支正式、好维护、不会太张扬的工作钢笔的人。它的价值不在故事多，而在场景清楚。对已经有 Safari、Prera 或 ECO 的用户来说，Expert 提供的是更成熟的外观和更正式的手感。对已经有 Carène 或 146 的用户来说，它则像一支可以放心带出门的副笔，使用压力更低。`,
  },
  {
    slug: "威迪文-waterman-海韵-car-ne",
    title: "Waterman Carène：嵌入式金尖和船身线条",
    summary: "Waterman Carène 的识别点是嵌入式金尖、金属/漆面笔身和更强的设计姿态，适合喜欢现代法式商务感的用户。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "围绕 Carene 的嵌入式金尖和外形写，区分 Expert 与 Hemisphere。",
    },
    body: `Waterman Carène 比 Expert 更有设计姿态。它最容易被记住的地方，是嵌入式金尖和流线型前端。资料能确认 Carène 系列、法国品牌背景、金尖/嵌入式笔尖、墨囊/上墨器结构，以及金属/漆面笔身。读这支笔，入口不在老 Waterman 历史，而在现代 Waterman 如何把商务笔做得更有形状。

Carène 的笔尖看起来不像普通开放式金尖。它嵌进握位前端，线条和笔身连成一体。这个设计让整支笔更像一件完整物件，也让它在 Waterman 现代产品里很有辨识度。喜欢传统大金尖的人可能觉得它不够外露；喜欢干净线条的人会觉得它很顺。

使用上，Carène 仍然是现代墨囊/上墨器逻辑。它不像老 Waterman Ink-Vue 或 No. 52 那样需要学习 vintage 维修，也不靠活塞结构制造容量话题。它更适合办公室、签字、短中篇书写和日常桌面使用。金属笔身和漆面带来正式感，也会让重量比轻树脂笔更明显。

Carène 的名字常被解释为船身线条，这个联想放在外观上很容易理解。笔身从帽端到笔尖有一种连续的流线感，和普通雪茄形钢笔不一样。它的好看不靠大金尖外露，而靠前端和笔身融在一起的轮廓。若你在意一支笔放在桌面上的形象，Carène 比 Expert 更容易被记住。

和 Expert 比，Carène 更贵、更有外观记忆点，也更挑审美。和 Hemisphere 比，它更高阶。和 LAMY 2000 比，两者都有嵌入式/半隐藏笔尖气质，但 LAMY 更冷静，Carène 更商务、更有装饰感。

购买时先看自己是否喜欢嵌入式笔尖的视觉和握位过渡。再看尖号、重量、漆面是否容易留下痕迹。Carène 的金属笔身会给人更扎实的第一印象，长时间书写时也会把重量带出来。若你的主要用途是长篇课堂笔记，最好谨慎；若是签字、会议记录、桌面短写，它更容易发挥长处。

Carène 适合想要一支有设计感的现代 Waterman，而不是只想要一支最轻便的通勤笔。它的性格很明确：正式、流线、带一点法式的讲究。比起只看品牌名，读者更应该问自己是否喜欢这种嵌入式金尖和船身线条。喜欢，它会很有辨识度；不喜欢，它就会显得过于刻意。买前多看侧面和握位照片，比只看正面商品图更可靠。也可以把它和 Expert 同时放进候选，一支偏稳，一支偏设计，差异很直观，也更容易做决定。试写会更说明问题。`,
  },
  {
    slug: "威迪文-waterman-查尔斯顿-hemisphere",
    title: "Waterman Hemisphere：更轻、更窄的现代 Waterman 入口",
    summary: "Waterman Hemisphere 的重点在钢尖、墨囊/上墨器结构和较轻巧的现代商务定位，适合从入门办公笔角度判断。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把 Hemisphere 写成现代 Waterman 入门线，不和 Charleston 混成同一历史叙事。",
    },
    body: `Waterman Hemisphere 比 Expert 和 Carène 更像一支现代 Waterman 的入口。资料能确认法国品牌背景、钢尖、墨囊/上墨器结构。Goldspot 的商品页也能帮助读者确认具体在售版本的外观和尖号。这个页面标题里带着“查尔斯顿 / Hemisphere”，实际阅读时应先按 Hemisphere 这条现代线来判断。

Hemisphere 的优势是轻巧和简单。它没有 Carène 的嵌入式金尖，也没有 Expert 那种更厚重的商务感。它更适合想要一支正式一点、但不想太重太贵的用户。放在办公桌、笔袋或日常会议里，它不会太抢戏。

钢尖和墨囊/上墨器结构也说明了它的定位。它不负责提供高级金尖体验，重点在易维护和低门槛。对经常换墨的人来说，清洗方便；对刚进入 Waterman 的人来说，预算压力也相对轻。若你追求软弹、复杂上墨或强收藏性，Hemisphere 不是那条路线。

Hemisphere 的读者往往并不打算研究 Waterman 全史，他们更想找一支看起来正式、价格也能接受的日用笔。它比很多学生笔更适合办公室，也比高阶商务笔更容易放进日常预算。这个位置看似普通，其实很实用。很多人真正需要的，就是一支每天打开就能写、坏了也不至于心疼的笔。把它放在这个场景里，Hemisphere 的定位会清楚得多。

和 Expert 比，Hemisphere 更轻、更窄，正式感弱一点。和 Carène 比，它少了设计辨识度，但也更容易随身使用。和 LAMY Safari 这类入门笔比，Hemisphere 更偏商务外观，少了学生笔的工具感。

购买时先看握位是否偏细、笔身重量是否符合你的书写习惯。中文小字用户要格外注意尖号，过粗会影响日常笔记。还要核对具体版本，因为 Hemisphere 的配色和饰面很多，照片里很小的差异，拿到手可能会影响正式感。若是送礼，外观稳妥很重要；若是自用，线宽和握持更重要。

Hemisphere 适合想要一支看起来得体、维护简单、价格不太高的现代 Waterman。它不用承担品牌历史的全部重量，做好入口笔这件事就够了。读者若已经有轻量塑料入门笔，可以把它看成外观升级；若已经习惯金尖旗舰，它则更像一支轻便备用笔。它的上限不高，但日常场景很清楚，这也是入门线最重要的优点，尤其适合作为第一支办公钢笔，选择压力也小很多。预算紧时也容易接受。`,
  },
  {
    slug: "并木-namiki-emperor",
    title: "Namiki Emperor：大尺寸漆艺笔的旗舰尺度",
    summary: "Namiki Emperor 的重点是 No.50 大型笔尖、ebonite 笔身、漆艺装饰和 ink stopping function，适合按旗舰漆艺笔理解。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Namiki Emperor 官方集合写尺寸、漆艺和购买判断。",
    },
    body: `Namiki Emperor 不是普通大笔。官方 Emperor Collection 页面把它放在 Namiki 的高端漆艺系列里，资料能确认 No.50 大型笔尖、ebonite 笔身、Togidashi-Taka Maki-e 等漆艺线索，以及 ink stopping function。读这支笔，要从旗舰尺度和工艺展示进入。

Emperor 的尺寸会先筛选用户。No.50 笔尖和大笔身让它有很强的存在感，拿在手里不是轻巧日用笔的感觉。手小、喜欢快速笔记的人，可能会觉得它过于隆重；喜欢大笔、宽阔握持和强烈书写仪式感的人，才更容易理解它。

漆艺是另一个核心。Namiki 的 Emperor 不只是把图案印在笔身上，而是把 ebonite、漆、maki-e 和大型书写工具结合起来。具体作品不同，图案、工艺和价格都会不同。买 Emperor 不能只问“是不是 Namiki”，必须看是哪一个主题、哪一种工艺、保存和来源是否清楚。

ink stopping function 也说明它和普通现代上墨器笔不同。大尺寸笔身和储墨结构会带来更强的使用仪式，也让维护和携带更需要耐心。它适合慢慢写、慢慢欣赏，不适合每天塞进通勤包里随手开合。对很多读者来说，Emperor 的第一问题往往先是有没有真实使用它的场景，然后才是预算。能否安心保存、是否愿意定期保养，也会影响这支笔能不能长期留在手边。

和 Yukari Royale 比，Emperor 尺寸更大，舞台感更强。和 Nakaya 定制漆笔比，Namiki Emperor 更接近大厂高端漆艺体系。和 Montblanc 149 比，两者都能算大笔，但 Emperor 的重点在日本漆艺和大型笔尖，不在欧洲商务旗舰气质。

购买时先确认自己能否接受尺寸、重量和使用场景。Emperor 适合慢写、欣赏和收藏，不适合粗放携带。若你只是想体验 Namiki 漆艺，Yukari Royale 或其他尺寸可能更容易日用。若你已经明确想要 Namiki 的旗舰尺度，就要进一步核对作品主题、证书、盒证完整性、漆面状态和来源记录。

Emperor 的价值在于它把书写工具推到近乎陈列品的尺度，但仍然保留钢笔的书写核心。它不是只用来看的装饰物，也不是普通办公笔。读者若把它放在“巨型金尖加日本漆艺”的交叉点上，就能更准确地理解它为什么贵、为什么挑人，以及为什么仍然有人愿意认真使用它。`,
  },
  {
    slug: "并木-namiki-yukari-royale皇家缘",
    title: "Namiki Yukari Royale：比 Emperor 更容易日用的高阶漆艺线",
    summary: "Namiki Yukari Royale 位于 Namiki 高阶漆艺产品线中，重点在 Urushi/Maki-e、较 Emperor 收敛的尺寸和具体作品差异。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把 Yukari Royale 写成高阶漆艺线，并与 Emperor 区分。",
    },
    body: `Namiki Yukari Royale 适合放在 Emperor 旁边读。它同样属于 Namiki 的高阶漆艺世界，官方 Yukari Royale Collection 页面也把重点放在具体作品和 Urushi/Maki-e 语境里。但它不像 Emperor 那样用超大尺寸先压过来，整体更接近日用和收藏之间的平衡。

Yukari Royale 的入口是漆艺和具体主题。不同作品会有不同图案、工艺和视觉重心。读这类笔，不能只写“日本”“莳绘”“高端”几个词就结束。对读者真正有用的，是知道每一支 Yukari Royale 都要回到具体作品判断：画面、工法、保存、来源和价格都不能混看。

尺寸是它和 Emperor 的重要差别。Emperor 更像旗舰陈列尺度，Yukari Royale 更容易进入实际书写。它仍然不是随便丢进笔袋的通勤笔，但对想要使用 Namiki 漆艺笔的人来说，它比 Emperor 现实得多。长写是否舒适，还要看个人握笔和重量偏好。

Yukari Royale 的吸引力也在这个中间位置。它足够高阶，能让漆艺和 Namiki 的品牌体系站出来；尺寸又没有把用户完全推向收藏柜。若你想每天带出门，它仍然贵重，也需要小心。若你想定期拿出来写信、题签、做手账重点页，它比 Emperor 更容易进入真实生活。

和 Nakaya Portable Writer 比，Yukari Royale 的品牌位置和工艺体系不同。Nakaya 更强调定制和手工订制感，Namiki 则是 Pilot/Namiki 高端漆艺线的代表。和 Wancher Dream Pen 比，Yukari Royale 的传统大厂属性更强，价格和收藏预期也更高。

购买时先确认具体作品名称，而不是只确认系列名。再看笔尖、保存状态、证书和来源。漆艺笔的二手判断尤其依赖清晰照片，笔帽、笔身、尾端和握位都要看。若页面只给几张模糊图，价格再诱人也要谨慎。图案主题是否符合自己的长期审美，也比一时的稀有感更重要。

若你想要 Namiki 漆艺，又担心 Emperor 太大，Yukari Royale 是更容易认真使用的一条线。它的好处在于把高阶漆艺放进相对可写的尺寸里，但它仍然需要谨慎保存和明确预算。把它当成一支可以书写的工艺品，而非普通升级笔，期待会更稳。适合它的用户，通常已经知道自己想要的不是单纯更顺滑的笔尖。`,
  },
  {
    slug: "中屋-nakaya-housoge高级定制",
    title: "Nakaya Housoge：把吉祥花纹刻进整支笔",
    summary: "Nakaya Housoge 是以宝相华纹样和 Chinkin 技法为核心的 Cigar Piccolo 定制款，重点在黑底金线、整笔装饰和工艺保存。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Nakaya 官方 Housoge 页面写 Chinkin、黑底金线、整笔身装饰和宝相华纹样。",
    },
    body: `Nakaya Housoge 先要看纹样，不能把它当成普通黑色漆笔。Nakaya 官方页面写得很清楚：这支 Cigar Piccolo HOUSOGE 以黑底和金线为主，使用 Chinkin 技法表现 Housoge 图案，装饰覆盖整支笔身，连握位也包括在内。也就是说，它的重点不止在笔帽上那一段画面，手握住的地方也进入图案之中。

Housoge 通常译作宝相华，是一种想象中的花。Nakaya 官方说明把它放在天界之花、阿拉伯草纹和正仓院乐器装饰的脉络里，含义偏吉祥。读者如果只看照片，可能会先被金色线条吸引；真正理解这支笔时，要看到它为什么选择这种纹样。它处理的是一种传统装饰秩序，把花、藤蔓和吉祥含义压缩到一支小尺寸 Cigar Piccolo 上。

Chinkin 的观感和普通描金不同。线条像刻进漆面里，再以金色形成反差。黑底越深，金线越明显。Housoge 的图案密度又高，整支笔会比常见的纯色 Nakaya 更华丽。它适合喜欢细节的人，也会筛掉想要低调日用笔的人。若你希望一支笔在桌面上安静存在，Kuro-tamenuri 或 Aka-tamenuri 更容易相处；Housoge 会主动把注意力拉到花纹上。

这支笔的尺寸和命名也重要。Cigar Piccolo 比 Portable 更短，Cigar 又意味着没有常规笔夹。它更像一件手里把玩的漆艺小笔，而不是随便别在口袋里的工具。短尺寸有便携感，真正书写时要看手掌大小、是否习惯不带夹的笔帽，以及是否愿意用较贵重的漆艺笔写日常内容。

购买 Housoge 时，第一件事是确认具体版本和实拍。黑底、金线、纹样密度、握位装饰都会影响观感。第二件事是看漆面和线条状态，尤其是握位附近。因为图案延伸到手会接触的位置，长期使用会让保存问题更现实。第三件事才是笔尖。Nakaya 的价值当然包括书写调校，但 Housoge 这种款式的判断，工艺和保存权重要更高。

实际书写时，也要接受它的存在感。握位有图案，手指会直接碰到装饰区域；这会让每次使用都更有仪式感，也会让人自然放慢动作。若你想要一支随手会议笔，它会显得过于讲究；若你写信、题签或做少量长文，它的节奏更合适。

它适合已经知道自己喜欢 Nakaya 的人。第一次买漆笔，纯色 Portable 或 Writer 更容易判断手感；已经熟悉 Nakaya 的尺寸和握位，再去选择 Housoge 这种高装饰款，会少一些误判。把它看作一支可写的漆艺作品，期待会更稳。`,
  },
  {
    slug: "中屋-nakaya-portable-portable-cigar",
    title: "Nakaya Portable Cigar：没有笔夹的黑溜涂日用尺寸",
    summary: "Nakaya Portable Cigar Kuro-tame 把黑溜涂漆面、便携长度和无笔夹 Cigar 外形放在一起，适合重视握持和漆面变化的用户。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Nakaya 官方 Cigar Portable Kuro-tame 页面写日用长度、便携/舒适平衡和黑溜涂。",
    },
    body: `Nakaya Portable Cigar Kuro-tame 的入口很安静。官方页面说它是适合日常使用的长度，在便携和书写舒适之间取得平衡；漆面是黑色调的 shuai urushi 覆在朱色底上，形成黑溜涂的深色外观。这个描述很短，却足以说明它和高装饰款的区别：它靠比例、漆色和手感说话。

Portable 是 Nakaya 最容易进入日用的尺寸之一。它不像 Piccolo 那样短，也不像超大尺寸那样要求手掌和场景。Cigar 则去掉常规笔夹，让笔帽线条更完整。这个选择会让外观更干净，也会带来携带问题：没有笔夹，放在笔袋或桌面上很美，别在衬衫口袋里就不现实。

黑溜涂的魅力在时间。它第一眼近似黑色，细看会有底色透出的温度。和亮色树脂不同，Kuro-tame 不靠鲜艳取胜。适合它的人，通常喜欢克制、暗色、漆面层次，也愿意接受手工漆物在长期使用中慢慢变化。若你想要照片里一眼惊艳的笔，Housoge 或莳绘款更明显；若你想要一支越看越耐的 Nakaya，Portable Cigar 很有代表性。

书写上，Portable Cigar 的判断要回到握持。没有笔夹后，笔帽重量和视觉都更纯粹；笔身是否合手，要看是否习惯 Nakaya 的直径和重心。它不是大容量活塞笔，也不是强调机械结构的现代工具。它更像一支让使用者把注意力放回手、纸、墨和笔尖调校的漆笔。

购买时不要只看“黑溜涂”三个字。不同照片光线会让漆面差异很大，二手笔还要看漆面划痕、笔帽口、尾端和握位附近。Cigar 没有夹，携带习惯也要先想清楚。若你每天把笔随手丢进包里，它不适合；若你有笔套、固定书桌或愿意小心携带，它的简洁外形才会成立。

它也适合用来理解 Nakaya 的基础美学。很多品牌会把高级感放在金属环、复杂笔夹或大号 nib 上，Portable Cigar 更依赖漆面和比例。拿在手里时，少了笔夹带来的视觉中断，笔帽和笔身会连成一条更完整的暗色曲线。这种安静感，是它和普通黑杆钢笔最明显的区别。

Portable Cigar Kuro-tame 的好处，是它不会把 Nakaya 的工艺感推得太满。它保留手工漆笔的触感和层次，又尽量接近日常书写尺寸。读者如果想从 Nakaya 找一支长期相处的笔，而不是一支只在照片里成立的展示物，这条线值得先看。买前最好同时看手持照和笔帽闭合照，比例会比单独产品图更真实。`,
  },
  {
    slug: "中屋-nakaya-portable-writer-黑溜涂",
    title: "Nakaya Portable Writer 黑溜涂：更现实的 Nakaya 入口",
    summary: "Nakaya Portable Writer 黑溜涂保留 Portable 尺寸和 Kuro-tamenuri 漆面，同时用 Writer 笔夹结构提高日常携带性。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Nakaya 官方模型页和 Portable Writer/Kuro-tamenuri 来源写尺寸、笔夹和漆面判断。",
    },
    body: `Nakaya Portable Writer 黑溜涂比 Cigar 更容易进入日常。Portable 尺寸仍然在，Kuro-tamenuri 的深色漆面仍然是主角，差别在 Writer 结构带有笔夹。这个小变化很实际：有夹之后，它更像一支能放进口袋、笔套和办公室场景的钢笔，而不只是线条完整的漆艺物件。

Nakaya 的官方介绍一直强调手工制作和与 Platinum 制笔经验的关系。读 Portable Writer 时，不必把这些背景写成光环，更重要的是看它解决了什么问题。很多人喜欢 Nakaya 的漆面，却担心 Cigar 没有夹、不方便带出门。Writer 让这件事简单一些，也让黑溜涂从收藏柜走向桌面和包里。

黑溜涂的气质很克制。它不像红色或图案款那样先抢视线，更多是用暗色漆面和底色透出的变化留住人。喜欢它的人，往往会在不同光线下看同一支笔。它也要求用户接受漆笔的使用痕迹：手会摸到握位，笔帽会开合，桌面和笔套都会留下微小风险。把它当成完全不能碰的艺术品，就少了 Nakaya 的书写意义；把它当成粗用工具，又会辜负漆面。

Portable Writer 的实用性来自平衡。尺寸不夸张，笔夹让携带更自然，外观比 Cigar 稍微正式。它适合写信、日记、桌面批注，也适合想把 Nakaya 放进真实工作日的人。若你追求大容量或透明结构，它不合适；若你关心笔尖调校、漆面触感和长期相处，它的逻辑很清楚。

购买时先确认自己要 Writer 还是 Cigar。两者可能颜色相近，使用方式却不同。有无笔夹会影响握持视觉、携带和保存。再看漆面状态、笔尖配置、盒证和来源。二手页面如果只写“黑溜涂”，没有清楚照片，不够判断。握位、帽口、尾端和笔夹周围都应该看。

如果你从普通量产笔转向 Nakaya，Portable Writer 也比较容易适应。它保留了钢笔熟悉的笔夹和常规长度，减少了“工艺笔只能摆着看”的距离感。真正需要适应的，主要是漆面保护、笔尖调校和更慢的购买节奏。这个过程本身，也会让人重新思考一支笔该怎样被使用。

Portable Writer 黑溜涂适合第一支 Nakaya，也适合已有亮色或图案款后补一支安静日用笔。它的重点不在稀奇，而在可长期使用。读者打开这个页面，应该能明白：这是一支把 Nakaya 漆面、手工调校和现实携带放在一起的笔。若只想买一支最省心的通勤笔，它仍然太贵重；若想把漆笔真正写起来，它很合理。`,
  },
  {
    slug: "写乐-sailor-0501铱金",
    title: "Sailor Young Profit 0501：便宜写乐也有自己的脾气",
    summary: "Sailor Young Profit 0501 是写乐入门价位的轻量塑料笔，重点在钢尖、偏细线宽、专用墨囊和不稳定的出厂体验评价。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 The Clicky Post 与 The Pen Addict 两篇评测写轻量塑料、钢尖、日系线宽和 QC 分歧。",
    },
    body: `Sailor Young Profit 0501 的有趣之处，是它把写乐的名字放进了更便宜、更轻的塑料笔里。它不是 Pro Gear 或 1911 那种金尖主线，也不承担写乐高端笔的期待。评测资料里能看到很具体的使用印象：塑料或树脂笔身，偏细的笔杆和握位，钢尖带写乐常见装饰，使用写乐专用墨囊。

这支笔适合从“便宜写乐能给什么”这个问题进入。The Clicky Post 的体验偏正面，提到它轻、外观简洁、钢尖流量好，M 尖写起来有写乐式反馈。The Pen Addict 的体验则更谨慎，重点放在出厂笔尖和质控问题上，也提到握位偏细，长时间使用会不舒服。两种评价放在一起，反而让 Young Profit 更清楚：它有写乐味道，也有入门量产笔的不确定。

钢尖是关键。它不会给 14K 或 21K 写乐金尖那种弹性和细腻层次，线宽却仍然偏日系。评测里 M 尖被拿来和较细的德国 F 比较，说明中文用户不能按欧美线宽直觉选。写小字可以看 F 或 MF，想要明显墨迹再考虑 M。若你已经习惯欧美 M，Young Profit 可能会显得细。

它的优点在门槛低。你可以用较少预算体验写乐的笔尖反馈和品牌系统，也能用写乐墨囊快速上手。缺点也直接：笔身质感不算高级，握位偏细，买到需要调校的笔尖时，性价比会被拉低。它更适合愿意接受一点折腾的用户，不适合把“写乐”两个字直接等同于稳定高级体验的人。

和 HighAce Neo 比，Young Profit 更像一支完整日用笔；和 Pro Gear Slim 或 1911 Standard 比，它少了金尖和正式感；和 LAMY Safari、Pilot Metropolitan 这类入门笔比，它的优势在日系细线和写乐反馈，劣势在价格和质控预期。买它时要把这些放在同一张桌上比较。

这也是它适合试口味的原因。你可以用它判断自己是否喜欢写乐那种带触感的线条，是否能接受偏细、偏轻的笔身，以及是否愿意使用写乐专用耗材。若这些答案都合适，再往 1911 或 Pro Gear 走会更有把握。

购买 Young Profit 0501，最好看清楚尖号、是否附墨囊或上墨器，以及卖家是否允许检测笔尖。若你想低成本试写乐，可以考虑；若你已经确定要写乐金尖，就不必在这一步停太久。它不是通往所有写乐体验的捷径，更像一支让你判断自己喜不喜欢写乐反馈的入门样本。用它写几页中文，比看参数更能说明问题。`,
  },
  {
    slug: "写乐-sailor-classic-ko",
    title: "Sailor Classic Ko：把莳绘做得像首饰",
    summary: "Sailor Classic Ko 是写乐与 Oshita Kosen Atelier 合作的现代 Maki-e 系列，重点在首饰化设计、天然材料和当代审美。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Sailor 官方访谈写 Classic Ko、Oshita Kosen Atelier、2008 年首饰品牌和现代 Maki-e。",
    },
    body: `Sailor Classic Ko 不能按传统黑底莳绘笔的印象去读。写乐官方访谈把它讲得很清楚：Classic Ko 原本是 Oshita Kosen Atelier 在 2008 年创立的 Maki-e 首饰品牌，后来和写乐合作，把这种更现代、更接近首饰的审美放到钢笔和圆珠笔上。

Oshita Kosen Atelier 和写乐的关系并不浅。官方访谈提到双方长期合作，关系可以追溯到 1981 年的 Maki-e Fountain Pen Bird and Flower。Classic Ko 系列的差别在方向。它没有停留在传统自然山水或黑底金粉的高贵感里，莳绘、螺钿、天然材料和现代图案被放进更轻盈的语境。

这支笔的入口是“首饰感”。Classic Ko 的官方材料里反复谈到佩戴舒适、天然材料、石材和贝壳的质地、现代生活方式。移到钢笔上，这种思路会改变读者的判断：它关注的不只是严肃书写，还包括手部动作、光泽和装饰放在一起时的效果。

莳绘本身也需要一点背景。官方访谈解释，Maki-e 是用漆绘制图案，再撒上金银等金属粉形成装饰的日本漆艺。Classic Ko 的现代味道，来自它不满足于传统题材。比如 Deco Lotus Line Raden 这种款式，会让贝壳光泽和几何/花纹秩序成为重点。读者需要看具体款式，不能把 Classic Ko 当成单一外观。

购买 Classic Ko 时，先确认具体版本名称。Dot's、Mist、Floret Dot、Deco Lotus Line Raden 或 Ala SV 这样的名字，指向不同画面、材料和稀有程度。再看笔尖、笔身材质、盒证、来源和漆面状态。带 Raden 的款式尤其要看贝片是否平整、光泽是否均匀、边缘有没有损伤。

它也提醒读者，写乐的日本工艺笔并非只有一种表情。传统高莳绘、KOP 大型漆笔和 Classic Ko 这类首饰化合作款，面对的是不同审美。Classic Ko 更适合喜欢现代图案和材料细节的人，也更适合搭配日常服饰、桌面和随身物件一起看。

它适合喜欢写乐，又想离开普通 1911/Pro Gear 外观的人。若你只关心笔尖反馈，同价位可能有更直接的选择；若你想要一支带现代莳绘和首饰气质的写乐，Classic Ko 才有意义。它的价值不在规格表，而在它把写乐制笔和当代工艺品牌合作放到了一支可以书写的物件上。`,
  },
  {
    slug: "写乐-sailor-promenade漫步1031",
    title: "Sailor Promenade 1031：被 Pro Gear 声量遮住的日用写乐",
    summary: "Sailor Promenade 1031 是写乐较低调的日用线，现有零售资料可确认 Sparkling Red Gold、F/MF/M/B 等尖号和墨囊系统。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 PenSachi Promenade 页面写 1031 型号、尖号、售价和日用定位，不扩写无来源年代。",
    },
    body: `Sailor Promenade 1031 是那种容易被 Pro Gear、1911 和 King of Pen 盖住的写乐。它没有强烈的扁顶识别，也没有大尺寸金尖旗舰的气势。现有零售资料显示，这个 Sparkling Red Gold 页面对应 11-1031-230，提供 F、MF、M、B 等尖号，属于更接近日用和入门金尖之间的位置。

Promenade 的读法要轻一点。它不是写乐的招牌收藏线，更像一支想让用户每天拿起来写的笔。红色和金色组合让它比普通黑杆更有存在感，但整体仍然是常规 cigar-shaped 日用笔气质。若你喜欢写乐线条，又不想让笔太张扬，它会比很多限定配色更稳。

这类页面最容易出现的问题，是把 Promenade 写成“低配 1911”。这样说太粗。对读者真正有用的，是看它在使用上可能提供什么：写乐体系里的细线宽、常规墨囊/上墨器使用习惯、较轻的树脂笔身，以及比高阶系列更低的心理门槛。你买它，不一定是为了收藏故事，更可能是为了有一支安静的写乐日用笔。

尖号仍然是第一判断。F 和 MF 更适合中文小字，M 会更容易显示墨水，B 则更偏签名或较大字幅。PenSachi 页面列出的多尖号也提醒读者：不要只按颜色买。写乐的线宽和反馈本来就有自己的性格，选错尖号会比外观小差异更影响日用。

购买 Promenade 1031 时，要留意在售状态和地区版本。零售页面显示该款售罄，二手或库存来源就更需要看清盒证、笔尖、上墨配件和实际成色。若价格接近 Pro Gear Slim 或 1911 Standard，比较就要更仔细；若价格明显低一些，它的日用价值会更突出。

上墨配件也要按具体卖家确认。PenSachi 页面列出了尖号和价格，但许多库存页面对 converter 是否随附写得不清。写乐专用墨囊很好买，converter 则会影响频繁换墨的便利度。想把 Promenade 当日用笔，最好下单前确认这些小配件，避免收到后才发现还要另配。

Promenade 适合已经知道自己喜欢写乐细线，但不想直接买昂贵旗舰的人。它不会给你 King of Pen 的大尺寸，也不会给 Pro Gear 那种强烈外形标签。它的好处在低调和清楚：一支常规形态的写乐，拿来写字比拿来展示更自然。对通勤和办公来说，这种低调反而是优点，尤其适合不想让钢笔成为话题中心的人。日用定位很稳。`,
  },
  {
    slug: "写乐-sailor-转运石",
    title: "Sailor Lucky Charm 2：北美限定里的钢尖 Pro Gear",
    summary: "Sailor Lucky Charm 2 是 Goulet 页面登记的北美限定 Pro Gear，重点在湖绿色树脂、古金色饰件、钢尖和随附上墨器/墨囊。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Goulet Lucky Charm 2 页面写 North American exclusive、teal green resin、antique gold accents 和 stainless steel nib。",
    },
    body: `Sailor Lucky Charm 2 先要修正一个预期：它是 Pro Gear 外形，却配钢尖。Goulet 页面把它写成 North American exclusive，湖绿色 resin 笔身和笔帽，搭配 antique gold accents，扁顶上有写乐 anchor logo。它看起来进入了 Pro Gear 的视觉世界，书写和价格逻辑却和常见 21K Pro Gear 不同。

这个差别很重要。很多人看到 Pro Gear，就会自动想到 21K 金尖、写乐标志性反馈和较高价格。Lucky Charm 2 的页面明确写了 hand-finished stainless steel nib，并列出 Steel EF、F、MF、M、B 等尖号。它更像一支把 Pro Gear 外观下放到钢尖路线的限定款，适合喜欢外形和配色，但不想直接买金尖的人。

配色是它的主角。湖绿色和古金色让它不像普通黑金 Pro Gear 那么正式，也不像透明示范款那么技术感。中文名“转运石”会让读者先想到寓意，英文 Lucky Charm 2 也带一点护身符式的轻松感。这个系列适合按配色和地区限定来理解，别把它写成长期常规型号。

使用上，它保留了 Pro Gear 的扁顶、旋盖和可 post 笔帽。Goulet 页面还写到随笔附写乐专用 converter 和两支黑色墨囊，这对实际购买很有用。钢尖不会给你写乐金尖的弹性期待，但维护和预算压力更小。对第一次接触 Pro Gear 外形的人，它可能比金尖版更轻松。

购买时要先确认自己接受钢尖。若你想体验经典写乐 21K，Lucky Charm 2 不是最直接的答案；若你要的是 Pro Gear 轮廓、限定配色和更低门槛，它就很清楚。也要核对地区限定、库存和尖号，因为这类零售限定的后续补货不一定稳定。

它还适合已经有金尖写乐、想要一支轻松配色笔的人。钢尖让心理负担低一些，随附 converter 和两支黑色墨囊也让开笔更简单。真正需要注意的，是别把限定配色的冲动放在尖号前面；EF、F、MF、M、B 的选择仍然会决定它是不是能进入日常。

Lucky Charm 2 的价值在“外形”和“可负担”之间。它没有必要假装成传统 Pro Gear 金尖，也不该被钢尖身份直接否定。读者打开页面时，只要明白它是一支北美限定、湖绿色、钢尖 Pro Gear，就能迅速判断自己是在买写乐核心写感，还是在买一个更轻松的限定外观。`,
  },
  {
    slug: "并木-namiki-飞升龙",
    title: "Namiki Rising Dragon：95 周年限量里的升龙题材",
    summary: "Namiki Rising Dragon 是 Pilot 95th Anniversary Nobori Ryu 限量款，重点在 Namiki Maki-e 背景、升龙主题和限量收藏属性。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Namiki 官方背景和 Elephant-Coral Rising Dragon 页面写 95th Anniversary、Nobori Ryu、Maki-e 与限量。",
    },
    body: `Namiki Rising Dragon 适合从“升龙”这个题材进入。现有零售资料把它登记为 Pilot 95th Anniversary Rising Dragon Limited Edition Nobori Ryu，并写到只有 95 支。Namiki 官方站则给出更大的背景：20 世纪初，Pilot/Namiki 把日本传统 Maki-e 工艺和钢笔结合，漆、工匠图案和自家笔尖共同构成 Namiki 的高端形象。

这支笔的主题并不含糊。Nobori Ryu 就是上升的龙。Elephant-Coral 页面描述龙爪中有“pearl of wisdom”，画面通过金银 raised lacquer 等方法强调。龙在东亚题材里本来就有力量、上升和吉祥的意味，放在 95 周年限量里，会比普通生肖或装饰图案更接近纪念款。

读 Namiki 限量笔时，先不要只看“稀有”。稀有只是结果，真正决定价值的是题材、工艺、保存和来源。Rising Dragon 的题材很强，限量数也明确，但读者还要看实物漆面、盒证、编号、出处和维修可能。漆艺笔的状态不能靠文字判断，必须看高清照片，最好能确认笔帽、笔身、尾端和握位都没有损伤。

它也不适合按普通日用笔来买。Namiki 官方资料强调漆的耐用和随使用贴合手感，也强调自家笔尖和书写品质。即便如此，Rising Dragon 的纪念属性会让很多人不敢粗放使用。真正的问题是：你想让它成为能写的收藏，还是偶尔拿出来写几页的主力？答案不同，预算和保存方式都不同。

和 Namiki Emperor、Yukari Royale 比，Rising Dragon 的重点在周年限量和具体题材；和普通 Pilot 金尖笔比，它的价格和判断逻辑已经不在同一层。购买重点已经从单纯笔尖顺滑，转向工艺、主题和纪念背景的完整性。

如果把它放进收藏体系，还要看同题材龙笔之间的差别。Namiki/Pilot 做过不止一种 Dragon 主题，Rising Dragon 的 95 周年、Nobori Ryu 和 95 支限量，才是它区别于其他龙题材的线索。页面标题、证书和编号必须能互相对上。

购买时先核对英文名、Nobori Ryu、95th Anniversary 和限量信息，再看编号与盒证。若页面只说“飞升龙”却没有清楚来源，风险很高。它适合熟悉 Namiki 漆艺、愿意为题材和保存付费的人。对只想体验 Pilot 书写的人，Custom 或 Capless 路线更现实。`,
  },
  {
    slug: "白金-platinum-富士旬景pnb-13000",
    title: "Platinum Fuji Shunkei Kinshu：把秋天的富士山切进笔身",
    summary: "Platinum Fuji Shunkei Kinshu 是富士旬景系列最终款，官方资料确认 PNB-36000SK、14K 金尖、枫叶切面、金色饰件和富士山形尾冠。",
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "依据 Platinum 官方 Kinshu 新闻页写 Fuji Shunkei final model、PNB-36000SK、14K nib 和切面设计。",
    },
    body: `Platinum Fuji Shunkei Kinshu 要从颜色和切面读。Platinum 官方新闻页说，Fuji Shunkei 系列以富士山四季景色为灵感，Kinshu 是这个系列的最终款。Kinshu 指秋天被红叶覆盖、像锦缎一样的景象。放到笔上，它用 scarlet body、细密 facet cutting 和金色环饰去表现秋叶与光线，比普通红色笔杆更有结构。

官方资料还给了几个硬信息：产品号 PNB-36000SK，14K 金尖，尖号包括 EF、F、M、B；握位环、金环、上环和尾环为黄铜镀金，clip 是铍铜镀金。随笔还有金色 converter、蓝黑墨囊、说明书、保卡、吸墨纸卡和纪念书签。页面里写得比普通零售页更完整，说明这款本来就按纪念和收藏来包装。

Kinshu 的设计细节集中在两个地方。第一是笔身切面，官方说用细密切割表现红叶，并通过曲面折射光线。第二是顶部的富士山形螺母，用小小的山形回应 #3776 的名字。对读者来说，这些细节比“红色限定”更重要。它的看点在于 Platinum 把富士山、秋叶和 #3776 系列符号放在一起。

使用上，它仍然要回到 #3776 Century 的基础。14K 金尖、Slip & Seal 相关的现代白金日用逻辑，会让它比纯展示漆艺笔更容易书写。只是 Kinshu 的收藏包装和系列收官身份，会让用户更在意保存。你可以把它当日用笔写，也要接受镀金件、切面笔身和限定配件的维护成本。

购买时要先核对型号。页面中文名里常会出现 PNB-13000 这类旧标法，但 Platinum 官方新闻对应的是 PNB-36000SK；看货时应把笔身、盒标和官方资料对在一起。再看是否附金色 converter、吸墨纸卡、纪念书签和盒证。缺少这些配件时，收藏完整性会打折。

如果按使用来判断，Kinshu 也不是只靠盒子和配件成立。#3776 Century 的基础结构让它仍然能写中文小字，EF 和 F 会更实用，M、B 更适合展示墨色和较大字幅。真正要权衡的是：你愿不愿意让一支系列收官款承担日常磨损。

Kinshu 适合喜欢 #3776 Century 写感，又想要更强季节主题的人。若你只想买一支便宜金尖日用，普通 #3776 更直接；若你在意富士旬景系列完整性，Kinshu 的最终款身份和金色饰件就很重要。它最好的读法，是一支仍能日常书写的系列纪念款。买前把配件和型号核对清楚，比单看红色笔身更重要。`,
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

  return `# Read first B 档 official/retail 型号 humanizer-zh 审查

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
