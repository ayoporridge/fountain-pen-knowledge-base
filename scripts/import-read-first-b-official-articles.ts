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
