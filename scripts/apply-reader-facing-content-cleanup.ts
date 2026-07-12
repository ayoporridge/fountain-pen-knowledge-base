import { execute, queryAll, queryOne } from "@/lib/db";

const TARGET_TYPES = ["brand", "pen", "nib"];

const PENBBS_NIB_SUMMARY =
  "理解 PenBBS 金尖 / 大明尖，要和 268、456、469、494 等具体型号一起读。";

const PENBBS_NIB_BODY = `PenBBS 的“金尖 / 大明尖”不要孤立看，它更像理解坛笔产品线的一条笔尖线索。读 PenBBS，先从具体型号进入会更清楚：268 偏低门槛真空上墨体验，456 把真空上墨和树脂笔身做成更完整的现代国产钢笔，469 用双头 / 双舱结构制造玩法，494 则把活塞结构放到更容易接触的位置。

所谓金尖，先看材质和调校，不要只看“金”这个字。金尖可能带来更温和的触纸感和一点韧性，但具体好不好写，仍然取决于笔尖打磨、出墨、笔舌配合，以及它装在哪一支笔上。大明尖的重点则在尺寸和外露感：笔尖露得更多，视觉存在感强，也更容易让人把注意力放在笔尖形状、刻字和线条表现上。

PenBBS 的特点不是一条稳定的传统经典型号线，而是玩家社区里很容易被讨论的结构实验感。透明笔身、真空上墨、活塞、双头、不同笔尖版本，都是它吸引人的地方。好处是可玩性高、配置有趣；风险是版本、批次和单支调校都会影响体验。

如果你在看 PenBBS 金尖或大明尖，先问三个问题：它装在哪个型号上？这支笔的上墨和握持你是否喜欢？卖家能否提供实拍和试写？这些答案比单独一个“金尖”标签更有价值。喜欢研究结构和版本的人会觉得 PenBBS 很好玩；只想买一支省心日用笔的人，最好从状态明确、资料清楚的具体型号开始。`;

const SAIER_NIB_SUMMARY =
  "塞尔 3.0 EF 尖适合按细尖规格读，重点看线宽、纸张和实物标识。";

const SAIER_NIB_BODY = `塞尔 3.0 EF 尖先按细尖规格来读。EF 通常指 Extra Fine，也就是比 F、M、B 更细的日常细尖；它适合小字、批注、格线本和需要控制墨量的纸张，但也更容易暴露纸张粗糙、墨水偏干或笔尖调校不佳的问题。

这里的“3.0”更像产品或部件命名，不能直接理解成 3.0 mm 线宽。真正影响体验的，是这枚尖装在哪支笔上、笔舌供墨是否稳定、笔尖是否对齐，以及卖家能否给出清楚的实物照片和试写线条。`;

const PENBBS_BRAND_SUMMARY =
  "中国玩家社区语境里的现代钢笔品牌，以丰富配色、真空 / 活塞 / 双头等结构玩法和高可玩性被讨论。";

const PENBBS_BRAND_BODY = `PenBBS 在中文读者这里常被叫作“坛笔”。理解它，不要先找一支唯一的经典代表，而要看它怎样用大量型号、配色和上墨结构吸引玩家：透明树脂、真空上墨、活塞、双头 / 双舱、不同笔尖版本，都是 PenBBS 经常被讨论的原因。

先看几支代表型号：

- **PenBBS 268**：低门槛真空上墨入口，适合先体验结构和透明笔身。
- **PenBBS 456**：更完整的真空上墨型号，常被拿来讨论容量、树脂材质和性价比。
- **PenBBS 469**：双头 / 双舱玩法很鲜明，重点不是省心，而是结构趣味。
- **PenBBS 494**：适合放在活塞结构和低预算体验里看。

PenBBS 的优点是可玩性高：同一品牌里能看到多种上墨方式、多种外观材料和大量配色。它不像 Montblanc、Pelikan 那样靠长期经典型号建立秩序，更像一个玩家会反复试、反复比较的国产结构实验场。

这种可玩性也意味着购买时要更具体。不要只问“PenBBS 好不好”，而要问是哪一支、哪一批、什么笔尖、什么上墨结构、卖家有没有实拍和试写。喜欢研究结构、版本和配色的人会很容易进入 PenBBS；只想买一支完全省心的日用笔，则应该先挑资料清楚、状态明确、售后方便的具体型号。`;

const TEXT_REPLACEMENTS: Array<[string | RegExp, string]> = [
  [
    "公开资料提到 HongDian 6013 fountain pen、matte black，说明这个型号的第一印象来自哑黑外观和金属工具感。",
    "人们对这支笔的第一印象，往往就是哑黑外观、金属工具感。",
  ],
  [
    "公开资料提到 Hero 616 Classic Fountain Pens、3 colors pack，说明它在现代渠道里仍被当作低价经典暗尖笔出售。",
    "今天再看英雄 616，它仍常以低价经典暗尖套装的面貌出现在零售渠道里。",
  ],
  [
    "公开资料提到 Hero 329 Fountain Pen Gold Arrow Pattern 3-pack，说明它常以低价套装形式出现。",
    "今天再看英雄 329，它常以低价套装形式出现。",
  ],
  [
    "公开资料提到 Pilot 78G with converter，说明它的基本阅读方式很清楚：",
    "读 Pilot 78G/78G+ 的方式很清楚：",
  ],
  [
    "公开资料提到 Pelikan M1005 Fountain Pen - Stresemann Special Edition，说明它属于 M1000 尺寸语境，又带有 Stresemann 灰条纹和银色饰件的外观取向。",
    "它属于 M1000 尺寸语境，又带有 Stresemann 灰条纹和银色饰件的外观取向。",
  ],
  [
    "公开资料提到 Neo Slim Aluminum、olive green，说明这支笔走的是轻薄、现代、办公便携路线。",
    "这支笔走的是轻薄、现代、办公便携路线。",
  ],
  [
    "公开资料提到 E-Motion fountain pen、parquet black，说明它走的是有纹理、有体量感的现代日用路线。",
    "它走的是有纹理、有体量感的现代日用路线。",
  ],
  [
    "公开资料提到 Van Gogh、Wheatfield with Crows、special edition，说明它的卖点和梵高画作主题紧密相关。",
    "它的卖点和梵高画作主题紧密相关。",
  ],
  [
    "公开资料提到 Jinhao Century 100 Classic Fountain Pen with Converter，说明它的核心是传统外观、较正式的比例和上墨器日用。",
    "它的核心是传统外观、较正式的比例和上墨器日用。",
  ],
  [
    "公开资料提到 Jinhao 9035 Red Rosewood Wooden Fountain Pen，说明这支笔的第一卖点是低价木材触感，复杂机制并不是重点。",
    "这支笔的第一卖点是低价木材触感，复杂机制并不是重点。",
  ],
  [
    "公开资料提到 JINHAO 9056 Natural Wood Fountain Pen，说明它的核心卖点是天然木杆和偏厚重的外观。",
    "它的核心卖点是天然木杆和偏厚重的外观。",
  ],
  [
    "公开资料提到 Graf von Faber-Castell Classic Platinum-Plated Fountain Pen，说明它属于更高端、更正式的书写线。",
    "它属于更高端、更正式的书写线。",
  ],
  [
    "公开资料提到 Pilot Cocoon、metal body，说明它的核心是金属笔身、稳定入门尖和适合日常的外观，复杂机制并不是重点。",
    "它的核心是金属笔身、稳定入门尖和适合日常的外观，复杂机制并不是重点。",
  ],
  [
    "公开资料提到 1960s、grey、14k Extra Fine nib、piston filler，这些信息足够说明它是老万宝龙里偏日用、偏轻巧的一支。",
    "它是老万宝龙里偏日用、偏轻巧的一支：灰色杆帽、14K EF 细尖、活塞上墨，都把气质拉向日常书写。",
  ],
  [
    "公开资料提到 绿色大理石树脂笔杆、黑色树脂笔帽、镀金不锈钢笔尖和 Pelikan piston mechanism，这些信息足够说明它的身份：它是百利金活塞体系的入门门槛。",
    "绿色大理石树脂笔杆、黑色树脂笔帽、镀金不锈钢笔尖和 Pelikan piston mechanism，把 M200 的身份说得很清楚：它是百利金活塞体系的入门门槛。",
  ],
  [
    "公开资料提到 stainless steel with chrome trim、medium nib，说明它是轻便、现代、入门取向的 Parker。",
    "它是轻便、现代、入门取向的 Parker：不锈钢外观、铬色饰件和 M 尖，把它放在低压力日用位置。",
  ],
  [
    "公开资料提到 Wing Sung 601A Grey Vacumatic Fountain Pen、Fine 0.5mm nib、ink window、push cap 等信息，说明它在 601 体系里承担的是不同选择，不只是简单换色。",
    "在 601 体系里，它承担的是不同选择，不只是简单换色：灰色外观、0.5mm 细尖、墨窗和按压笔帽，都会改变它和普通 601 的关系。",
  ],
  [
    "公开资料里出现的 Custom 845、Vermillion、Urushi，这几个词已经说明",
    "Custom 845、Vermillion、Urushi 这几个词已经说明",
  ],
  [
    "公开资料可以确认法国品牌背景、钢尖、墨囊/上墨器结构。",
    "它的基本轮廓很清楚：法国品牌背景、钢尖、墨囊/上墨器结构。",
  ],
  [
    "E5 的公开资料可以确认它是国产钢尖笔，定位也更接近日用和尝鲜，不适合按老牌金笔的标准去看。",
    "E5 是国产钢尖笔，定位更接近日用和尝鲜，不适合按老牌金笔的标准去看。",
  ],
  [
    "公开资料里更清楚的信息指向上海 G. Crown 和海外分销渠道。",
    "现在更清楚的线索指向上海 G. Crown 和海外分销渠道。",
  ],
  [
    "TTpen 页面把它写成 Majohn Wancai Mini Transparent Pocket Fountain Pen，细尖 0.5mm。",
    "它的关键词很直接：Majohn Wancai Mini、透明口袋笔、0.5mm 细尖。",
  ],
  [
    "TTpen 页面把它写成 KACO SKY Premium Plastic Fountain Pen Transparent，说明它走的是现代透明塑料钢笔路线。",
    "它走的是现代透明塑料钢笔路线。",
  ],
  [
    "Goulet 页面把它写成 North American exclusive，湖绿色 resin 笔身和笔帽，搭配 antique gold accents，扁顶上有写乐 anchor logo。",
    "它最先被人注意到的，是北美限定、湖绿色树脂笔身、古金色饰件和扁顶上的写乐 anchor logo。",
  ],
  [
    "AwesomePens 的页面把它写成 Platinum Small Meteor PQ-200，塑料笔身，约 13 g，0.38 mm 细钢尖，兼容白金墨囊和 PQR-200 上墨器。",
    "它的读法很直接：Platinum Small Meteor PQ-200、塑料笔身、约 13 g、0.38 mm 细钢尖，并兼容白金墨囊和 PQR-200 上墨器。",
  ],
  [
    "Cult Pens 的页面把它写成较小尺寸的 Souveran，使用 14ct/585 双色金尖、差动活塞、透明墨窗，闭合长度约 123 mm，重量约 16 g。",
    "它是一支较小尺寸的 Souveran：14ct/585 双色金尖、差动活塞、透明墨窗，闭合长度约 123 mm，重量约 16 g。",
  ],
  [
    "Daraz 页面把它写成 M800/J800/800 Piston resin Fountain Pen，并在标题中提到 Schmidt/Bock #6、EF/F/M/B、0.5/0.7 mm 等笔尖信息。",
    "它的卖点集中在 M800/J800/800 这类大号树脂活塞笔语境，以及 Schmidt/Bock #6、EF/F/M/B、0.5/0.7 mm 等笔尖选择。",
  ],
  [
    "Everything Calligraphy 有 Majohn F9 Fountain Pen 的产品页，现有资料把它放在 50-100 元、钢尖、墨囊/上墨器和特色设计里。",
    "它的位置很清楚：50-100 元、钢尖、墨囊/上墨器和特色设计。",
  ],
  [
    "Everything Calligraphy 的产品页能确认 Delike Element Fountain Pen 这个入口，现有资料把它和钢尖、墨囊/上墨器、金属笔身放在一起。",
    "读 Delike Element，先看钢尖、墨囊/上墨器和金属笔身这几个实际要素。",
  ],
  [
    "Makoba 的 Hongdian N6 产品集合能确认这个系列入口，现有资料也把它放在 N6/云章这条线上。",
    "读弘典 N6 云章，先把它放在 N6/云章这条线上，再看活塞、树脂鱼雷外形和钢尖表现。",
  ],
  [
    "Furper 的产品页写的是 Hongdian 1866 Wood Fountain Pen，带 EF/F nib，并把它放在 metal retro writing office gift pen 的语境里。",
    "它的可见信息很直接：Hongdian 1866 Wood Fountain Pen、EF/F 尖，以及复古办公礼品笔的外观语境。",
  ],
  [
    "TTpen 有 Jinhao 82 的产品页，现有资料也提到低价、十几种配色、树脂/亚克力外观和手账用户。",
    "它的读法离不开低价、十几种配色、树脂 / 亚克力外观和手账用户。",
  ],
  [
    "Goulet 页面指向 Jinhao X159 black，公开索引又把 X159 和 159 放在一起。",
    "读这个系列，先把 X159 和早期 159 放在一起分清楚。",
  ],
  [
    "TTpen 页面写到 Wing Sung 601 Steel Fountain Pen，公开索引又把它和 Parker 51 放在一起。",
    "市场讨论里常把 Wing Sung 601 和 Parker 51 放在一起。",
  ],
  [
    "Andy's Pens 页面写到 Wing Sung 3013 Transparent，公开索引也把它和 vacuum filler 放在一起。",
    "读 Wing Sung 3013，先抓透明笔身和 vacuum filler 这两个关键词。",
  ],
  [
    "公开索引把 Aurora、fountain pen、Aurora 88、Optima 放在一起，也说明读这个页面时应先抓品牌谱系。",
    "读 Aurora 时，先抓 Aurora 88 和 Optima 这条品牌谱系会更容易。",
  ],
  [
    "公开索引和白丁Alan评测入口能确认这个型号至少作为小众国产结构笔被讨论。",
    "它至少是一支被小众国产结构笔玩家讨论过的型号。",
  ],
  [
    "可确认的入口主要是公开索引和白丁Alan的 ZhangJiang 988 评测。",
    "可读入口主要是实物线索和白丁Alan的 ZhangJiang 988 评测。",
  ],
  [
    "可确认入口主要来自公开索引和白丁Alan的 Hero 派迪一体尖评测。",
    "可读入口主要来自实物线索和白丁Alan的 Hero 派迪一体尖评测。",
  ],
  [
    "资料指向很清楚：这是一支被玩家拿来辨认和讨论的中国伸缩钢笔。",
    "这条线索很清楚：这是一支被玩家拿来辨认和讨论的中国伸缩钢笔。",
  ],
  [
    "现有资料指向钢尖、墨囊/上墨器和 130-180 元价位。",
    "能抓住的重点是钢尖、墨囊/上墨器和 130-180 元价位。",
  ],
  [
    "现有资料提到它的 EF 尖有一定反馈感，接近写乐式控制，但这种判断最好按具体尖号和单支状态看。",
    "它的 EF 尖常被拿来谈反馈感和接近写乐式控制，但这种判断最好按具体尖号和单支状态看。",
  ],
  [
    "它更适合作为现代跨文化工艺钢笔来看：",
    "今天读它，可以把它当作现代跨文化工艺钢笔来看：",
  ],
  [
    "今天用 Security Pen 写长文未必现实，它更适合作为早期办公工具文化的样本。",
    "今天用 Security Pen 写长文未必现实，它更适合被看成早期办公工具文化的样本。",
  ],
  [
    "先保留它的结构信息和实物样貌，已经有价值。",
    "能记录下它的结构信息和实物样貌，就已经有价值。",
  ],
  [
    "也说明这个型号在海外玩家那里同样会被拿出来比较和辨认。",
    "也能看出它在海外玩家那里同样会被拿出来比较和辨认。",
  ],
  [
    "说明这支笔真正想解决的是频繁上墨和结构易坏的问题。",
    "这支笔真正想解决的是频繁上墨和结构易坏的问题。",
  ],
  [
    "说明这支笔虽然是木杆和上墨器结构，但作者关心的重点其实是日用边界。",
    "这支笔虽然是木杆和上墨器结构，但真正值得关心的是日用边界。",
  ],
  [
    "这样的页面不要硬写成完整品牌史，读者更需要知道：看到这支笔时，应该怎样判断它能不能买、能不能写。",
    "读长江 988，重点不是铺开完整品牌史，而是先判断：看到这支笔时，它能不能买、能不能写。",
  ],
  [
    "这个页面最适合帮读者建立购买判断：先看结构和实物状态，再谈是否值得收藏。",
    "读这支笔，先建立购买判断：看结构和实物状态，再谈是否值得收藏。",
  ],
  [
    "上海 (ShangHai) 的品牌馆先整理可确认的公开资料，帮助读者分清品牌名、产品线索和后续可查的具体型号。",
    "上海 (ShangHai) 目前适合从可确认资料和实物线索读起：先分清品牌名、产品线索，再看能继续追到哪些具体型号。",
  ],
  [
    "塞尔 (Saier) 的品牌馆先整理可确认的公开资料，帮助读者分清品牌名、产品线索和后续可查的具体型号。",
    "塞尔 (Saier) 目前适合从可确认资料和实物线索读起：先分清品牌名、产品线索，再看能继续追到哪些具体型号。",
  ],
  [
    "Desk Bandit 的页面把它列成 PENBBS 268 - Clear / Silver (Fine)，The Gentleman Stationer 的 PenBBS 索引则提供了品牌和玩家语境。",
    "读 PenBBS 268，先抓透明 / 银色、细尖和 PenBBS 玩家语境。",
  ],
  [
    "The Well-Appointed Desk 的评测标题把它称为 Double Nib Fountain Pen，这就是它的核心。",
    "它的核心就是 Double Nib：一支笔里放进两套书写端和两种墨水玩法。",
  ],
  [
    "公开评测把它的磁吸设计放在标题里，这说明买这支笔的人很可能先关心两个问题：合盖手感是否舒服，日常写字是否稳定。",
    "磁吸设计是唐月 E5 的入口。买这支笔的人很可能先关心两个问题：合盖手感是否舒服，日常写字是否稳定。",
  ],
  [
    "TSAMSA 的产品页确认了 Jinhao 992 这个型号，现有资料也把它和低价、透明塑料、钢尖、墨囊或上墨器路线放在一起。",
    "读 Jinhao 992，重点就是低价、透明塑料、钢尖、墨囊或上墨器路线。",
  ],
  [
    "AwesomePens 有 Jinhao 619 Fountain Pen 页面，现有资料还提到凹槽握区、马卡龙颜色和低价批量使用。",
    "读金豪 619，关键词是凹槽握区、马卡龙颜色和低价批量使用。",
  ],
  [
    "公开零售资料把它标成 Paili 002 Demonstrator Fountain Pens Extra Fine Nib，能确认它走的是示范笔和细尖路线。",
    "派利 002 走的是示范笔和细尖路线：透明笔身、Extra Fine 细尖，都是它最容易被理解的地方。",
  ],
  [
    "公开产品页把 aluminum clip 写成它的典型 Edge 设计，中文名“刀锋”也正好落在这个视觉点上。",
    "aluminum clip 是它的典型 Edge 设计，中文名“刀锋”也正好落在这个视觉点上。",
  ],
  [
    "公开材料里，能稳定指向它的是搜索索引和白丁Alan的 ShuLe 2398 评测入口。",
    "读书乐 2398，比较可靠的入口是白丁Alan的 ShuLe 2398 评测和清楚的实物线索。",
  ],
  [
    "可确认的入口主要是公开搜索索引和白丁Alan的 Dong Wu 948 钢笔评测。",
    "读东吴 948，比较可靠的入口是白丁Alan的 Dong Wu 948 钢笔评测和清楚的实物线索。",
  ],
  [
    "Minapens 的页面能确认 WingSung 729 这个条目，但老国产笔常见的问题是版本、库存状态和维修痕迹差异很大。",
    "读 WingSung 729，先看版本、库存状态和维修痕迹；老国产笔的单支差异会很大。",
  ],
  [
    "Fountain Pen India 有 WingSung 322 Fountain Pen 页面，能确认它在海外零售渠道仍被当作普通日用笔销售。",
    "WingSung 322 在海外零售渠道里仍常被当作普通日用笔销售。",
  ],
  [
    "Noon 的产品页指向 M&G Chenguang AFPU9902 Retractable Fountain Pen，标题里有 0.38mm EF、replaceable ink cartridge、stude。",
    "晨光这支按动钢笔的关键词是 AFPU9902、0.38mm EF、可替换墨囊和学生书写场景。",
  ],
  [
    "Andy's Pens 有 Lanbitou 3059 Fountain Pen 的产品页和实物图，说明它至少不是一个只存在于搜索结果里的模糊型号。",
    "Lanbitou 3059 至少能找到实物图和具体销售信息，不只是一个模糊型号名。",
  ],
  [
    "公开信息能确认的重点是中国品牌、钢尖、墨囊/上墨器体系。",
    "它的基本轮廓是中国品牌、钢尖、墨囊/上墨器体系。",
  ],
  [
    "公开资料明确写到“英雄1997型18K金笔”共生产 1997 支，最后一个编号赠予时任香港特首董建华。",
    "这支纪念笔的关键事实很清楚：“英雄1997型18K金笔”共生产 1997 支，最后一个编号赠予时任香港特首董建华。",
  ],
  [
    "现在零售页面里常见 Vector XL，金属笔身、钢尖、中字、可补充墨水。",
    "现在常见的 Vector XL，重点是金属笔身、钢尖、中字和可补充墨水。",
  ],
  [
    "Amazon 上的 Hongdian Qin Dynasty 页面把重点放在秦代文化灵感、笔杆和笔帽纹样、手抛笔尖以及 converter 配置。",
    "弘典秦的重点在秦代文化灵感、笔杆和笔帽纹样、手抛笔尖以及 converter 配置。",
  ],
  [
    "TSAMSA 的产品页能看到 Jinhao 75 matte black and red fountain pen 这样的具体版本。",
    "Jinhao 75 常见的具体版本包括 matte black and red 这类低调配色。",
  ],
  [
    "Amazon US 的 Asvine P36 页面写的是 Titanium Piston Fountain Pen，配透明结构和钢尖选项。",
    "Asvine P36 可以先按 Titanium Piston Fountain Pen 来读：钛合金、活塞上墨、透明结构和钢尖选项，是它最容易被注意到的配置。",
  ],
  [
    "Leonardo Furore / Momento Magico 这个页面把两条容易被一起讨论的 Leonardo 现代产品线放在了一处。",
    "Leonardo Furore / Momento Magico 其实是两条容易被一起讨论的 Leonardo 现代产品线。",
  ],
  [
    "这个词条有逗万 DareWorks 官方产品文章入口，比纯搜索索引更明确。",
    "逗万 DareWorks 的官方产品文章让这条线索比普通搜索结果更清楚。",
  ],
  [
    "JUSPIRIT 的 Demo Colored 页面把它放在 eyedropper-style fountain pen 语境里，并列出 transparent acrylic、ebonite。",
    "它属于 eyedropper-style fountain pen 语境，关键词是 transparent acrylic 和 ebonite。",
  ],
  [
    "JUSPIRIT 的 Demo Colored 页面把它放在 eyedropper-style fountain pen 语境里，并列出 transparent acrylic、ebonite ink stopper、Germany Jowo #12 nib 等信息。",
    "它属于 eyedropper-style fountain pen 语境，关键词是 transparent acrylic、ebonite ink stopper 和 Germany Jowo #12 nib。",
  ],
  [
    "购买时要看清卖家页面里的英文名、颜色、尖号和是否带上墨器。",
    "购买时要看清英文名、颜色、尖号和是否带上墨器。",
  ],
  [
    "二手或电商页面里，细杆金属笔要留意笔身磕痕、笔帽扣合和笔尖是否歪。",
    "二手或电商购买时，细杆金属笔要留意笔身磕痕、笔帽扣合和笔尖是否歪。",
  ],
  [
    "Pilot 在官方页面里把 Elite 95S 和昭和 43 年推出的 Elite S 联系起来，并说明它延续第二代昭和 49 年型号的设计。",
    "Elite 95S 和昭和 43 年推出的 Elite S 有明确关联，也延续第二代昭和 49 年型号的设计。",
  ],
  [
    "官方页面把 11-1224 放在 Professional Gear Series SHIKIORI 语境里。",
    "11-1224 属于 Professional Gear Series SHIKIORI 语境。",
  ],
  [
    "PenSachi 页面写的是 SAILOR 1911 Standard (Mid size) Fountain Pen - Black Silver。",
    "它可以先按 SAILOR 1911 Standard (Mid size) Fountain Pen - Black Silver 来读。",
  ],
  [
    "官方 Professional Gear 系列页和 21K 相关产品页能确认它属于写乐现代主线。",
    "它属于写乐现代主线：平顶、锚标、双色或单色搭配、不同尺寸和限定色，都是 Pro Gear 的识别点。",
  ],
  [
    "写乐官方产品页能看到 14K 和 21K 的不同口径。",
    "1911 / Profit 体系里有 14K 和 21K 两种常见口径。",
  ],
  [
    "官方特殊笔尖页面能确认 Naginata Togi 属于写乐的 special nib 语境。",
    "Naginata Togi 属于写乐的 special nib 语境。",
  ],
  [
    "Cross Bailey Light 的名字已经把定位说得很明白：Bailey 的轻量版本。Goldspot 的产品页能看到 polished teal resin 这样的具体版本，说明它走的是更轻、更容易入门的日用钢笔路线，并非高端 Cross 金属礼品线。",
    "Cross Bailey Light 的名字已经把定位说得很明白：Bailey 的轻量版本。polished teal resin 这类树脂版本，也说明它走的是更轻、更容易入门的日用钢笔路线，并非高端 Cross 金属礼品线。",
  ],
  [
    "JD 页面能确认它是 YIREN 依人 878 镀银钢笔，剩下的判断应该回到基本功：笔尖是否顺，出墨是否稳，握起来是否舒服，笔帽是否可靠。",
    "YIREN 依人 878 镀银钢笔这类低价笔，判断应该回到基本功：笔尖是否顺，出墨是否稳，握起来是否舒服，笔帽是否可靠。",
  ],
  [
    "Cronicas Estilograficas 的 Dagong 56 页面把它放在具体实物图和老笔观察里，说明它不该只被当成普通“国产钢尖”处理。",
    "大公 56 有清楚的实物图和老笔观察线索，因此不该只被当成普通“国产钢尖”处理。",
  ],
  [
    "若页面写 Stratford，就按 Stratford 线索继续核对。",
    "若英文型号是 Stratford，就按 Stratford 线索继续核对。",
  ],
  [
    "在图书馆式页面里，Ink-Vue 适合和 Vacumatic、现代透明示范笔放在一起。",
    "Ink-Vue 适合和 Vacumatic、现代透明示范笔放在一起读。",
  ],
  [
    "PenHero 的图片资料能帮助新手把外观和名称对上。",
    "图片资料能帮助新手把外观和名称对上。",
  ],
  [
    "它还适合做图像索引里的样本。",
    "它也很适合做图像对照样本。",
  ],
  [
    "没有这些信息，写感再诱人也会变成麻烦。",
    "如果这些信息不清楚，写感再诱人也会变成麻烦。",
  ],
  [
    "官方页面把它放在 Aero Fountain Pen 系列里，能确认铝制笔身、墨囊/上墨器上墨，以及钢尖和金尖版本的存在。",
    "Aero Fountain Pen 系列的核心是铝制笔身、墨囊/上墨器上墨，以及钢尖和金尖版本。",
  ],
  [
    "官方 Estie Oversized 页面能确认它是 Estie 家族里的大号尺寸，资料也指向树脂/亚克力类笔身、现代墨囊/上墨器使用习惯和 Jowo 笔尖配置。",
    "它是 Estie 家族里的大号尺寸，常见关键词包括树脂 / 亚克力类笔身、现代墨囊 / 上墨器使用习惯和 Jowo 笔尖配置。",
  ],
  [
    "页面里的图片和配色很容易先吸引眼睛，但真正使用时，尺寸比颜色更关键。",
    "图片和配色很容易先吸引眼睛，但真正使用时，尺寸比颜色更关键。",
  ],
  [
    "页面里 M800、J800、800 等叫法容易混用，笔尖规格、颜色、上墨结构也可能随卖家变化。",
    "M800、J800、800 等叫法容易混用，笔尖规格、颜色、上墨结构也可能随卖家变化。",
  ],
  [
    "JD 页面里的“梵高系列钢笔杏花礼盒装”已经说明它更像一支有主题包装和装饰感的国产日用笔。",
    "“梵高系列钢笔杏花礼盒装”这个名字已经说明，它更像一支有主题包装和装饰感的国产日用笔。",
  ],
  [
    "Swastik Penn 的产品页给出几个关键线索：Black、Brown、Blue 等颜色，Extra Fine 0.38mm，Schmidt 书写部件，两种吸墨方式。",
    "KACO Edge 的关键线索是 Black、Brown、Blue 等颜色，Extra Fine 0.38mm，Schmidt 书写部件，以及两种吸墨方式。",
  ],
  [
    "购买时要看清卖家页面写的是 88G、Metropolitan 还是 MR/Cocoon 相关版本。",
    "购买时要看清英文名到底是 88G、Metropolitan，还是 MR / Cocoon 相关版本。",
  ],
  [
    "中文页面把 1911、Profit、鱼雷、大鱼雷、标准鱼雷混在一起时，读者最该先确认尺寸、笔尖材质和具体 SKU，颜色要放在这些信息之后。",
    "中文语境常把 1911、Profit、鱼雷、大鱼雷、标准鱼雷混在一起说；读者最该先确认尺寸、笔尖材质和具体 SKU，颜色要放在后面。",
  ],
  [
    "官方 King of Pens 页面把它放在写乐高阶产品语境里。",
    "King of Pen 属于写乐高阶产品语境。",
  ],
  [
    "Platinum Pen USA 的 #3776 Collection 页面把 Slip & Seal 笔帽机制放在重要位置。",
    "Slip & Seal 笔帽机制是 #3776 Century 最重要的日用卖点之一。",
  ],
  [
    "页面里写得比普通零售页更完整，说明这款本来就按纪念和收藏来包装。",
    "这套配置比普通零售款更完整，也说明这款本来就按纪念和收藏来包装。",
  ],
  [
    "型号和耗材要按实际公开资料确认。",
    "型号和耗材要按实际商品信息确认。",
  ],
  [
    "Goldspot 页面里的 Classic Maki-e、Gold Fish design、18k gold，把这类笔的三件事放在一起：装饰图案、日式审美、金尖书写。",
    "Classic Maki-e、Gold Fish design、18k gold，把这类笔的三件事放在一起：装饰图案、日式审美、金尖书写。",
  ],
  [
    "官方页面把 Studio 放在当前产品线里，强调设计定位、笔尖选项和墨囊/上墨器兼容。",
    "Studio 的定位很清楚：现代设计、不同笔尖选项，以及墨囊 / 上墨器兼容。",
  ],
  [
    "LAMY 官方现在更容易看到 Logo 家族的其他书写工具页面，钢笔规格需要结合 Goulet 和 The Well-Appointed Desk 这类评测来读。这个来源边界要讲清楚：官方页面能说明 Logo 系列的简洁取向，具体到钢笔手感、握位和笔尖，长期评测更有帮助。",
    "LAMY Logo 的钢笔资料需要把系列定位和长期评测放在一起读：系列本身走简洁路线，具体到钢笔手感、握位和笔尖，长期评测更有帮助。",
  ],
  [
    "官方当前产品页把 LeGrand 放在 Meisterstück Gold-Coated Fountain Pen 线里，产品名、尺寸和系列身份很清楚。",
    "现代 LeGrand 属于 Meisterstück Gold-Coated Fountain Pen 线，产品名、尺寸和系列身份都很清楚。",
  ],
  [
    "页面里的 888 通常指更高阶、更少量的版本语境，和更常见的限量编号版本在材料、价格和收藏对象上会拉开距离。",
    "888 通常指更高阶、更少量的版本语境，和更常见的限量编号版本在材料、价格和收藏对象上会拉开距离。",
  ],
  [
    "TTpen 页面写的是 Hongdian M2 Mini Fountain Pen Aluminium Short Pocket Travel Pen。",
    "它可以先按 Hongdian M2 Mini Fountain Pen Aluminium Short Pocket Travel Pen 来读。",
  ],
  [
    "读者购买时，要先看卖家页面里的具体后缀。",
    "购买时，要先看具体后缀。",
  ],
  [
    "从现有资料看，它应放在弘典入门钢尖线上理解。",
    "它应放在弘典入门钢尖线上理解。",
  ],
  [
    "上墨方式要按卖家公开资料确认。",
    "上墨方式要按具体卖家信息确认。",
  ],
  [
    "TTpen 页面写的是 Majohn V1 Vacuum Filling Fountain Pen Fine Nib。",
    "它可以先按 Majohn V1 Vacuum Filling Fountain Pen Fine Nib 来读。",
  ],
  [
    "MoonmanPen 页面写到 Majohn P141 Titanium Alloy Fountain Pen、size 8 F nib、ink window、gold clip。",
    "Majohn P141 的关键词是 Titanium Alloy、size 8 F nib、ink window 和 gold clip。",
  ],
  [
    "TTpen 页面写的是 Majohn M2 Transparent Eye-dropper Filling Fountain Pen。",
    "它可以先按 Majohn M2 Transparent Eye-dropper Filling Fountain Pen 来读。",
  ],
  [
    "Fountain Pen Network 上有针对 Wing Sung 236 的非正式评测，现有索引也把它和老库存、上墨系统、橡胶件状态放在一起。",
    "Wing Sung 236 更适合结合非正式评测、老库存状态、上墨系统和橡胶件状态一起判断。",
  ],
  [
    "236 的公开资料并不丰厚，不能硬写成某种“经典”。",
    "236 的资料并不丰厚，不能硬写成某种“经典”。",
  ],
  [
    "能确认的，是它在零售语境中作为 PenBBS 268 出现，并和透明、细尖、可负担的现代中国钢笔形象联系在一起。",
    "它可以先按透明、细尖、可负担的现代中国钢笔来读。",
  ],
  [
    "二手或海外页面里，颜色名和批次可能比规格更显眼，最好看清实拍。",
    "二手或海外购买时，颜色名和批次可能比规格更显眼，最好看清实拍。",
  ],
  [
    "The Gentleman Stationer 对 456 的评测标题直接把它称为 vacuum-filler fountain pen，这比“平价玩家款”更能说明它的位置。",
    "vacuum-filler fountain pen 比“平价玩家款”更能说明 PenBBS 456 的位置。",
  ],
  [
    "Noon 的产品页指向 M&G Chenguang AFPU9902 Retractable Fountain Pen，标题里有 0.38mm EF、replaceable ink cartridge、student calligraphy writing 等信息。",
    "晨光这支按动钢笔的完整关键词是 M&G Chenguang AFPU9902 Retractable Fountain Pen、0.38mm EF、replaceable ink cartridge 和 student calligraphy writing。",
  ],
  [
    "官方页面强调免加墨、便携、颜色和款式选择，这些信息比“有没有收藏价值”更重要。",
    "免加墨、便携、颜色和款式选择，比“有没有收藏价值”更重要。",
  ],
  [
    "它可以先按 Picasso 916 Malage Fountain Pen New Version 来读，能确认型号和系列页面。",
    "它可以先按 Picasso 916 Malage Fountain Pen New Version 来读。",
  ],
  [
    "官方 Standard Flex 页面把 Standard Creaper、ebonite feed、piston fill 和 bottled ink 放在一起，这几个词足够说明它的方向。",
    "Standard Creaper、ebonite feed、piston fill 和 bottled ink 这几个词，足够说明 Noodler’s 简易钢笔的方向。",
  ],
  [
    "Goulet 这类零售页面会把它列为 slen",
    "零售资料常把它列为 slen",
  ],
  [
    "图片资料能帮助新手把外观和名称对上。",
    "图片对照能帮助新手把外观和名称对上。",
  ],
  [
    "如果这些信息不清楚，写感再诱人也会变成麻烦。",
    "如果上墨器和零件状态不清楚，写感再诱人也会变成麻烦。",
  ],
  [
    "页面下方列出的资料主要来自公开检索资料。继续阅读时，可以优先看来源里的产品图片、规格表、评测细节和收藏资料，再结合自己的使用场景判断版本、价格和成色。",
    "继续阅读时，优先看产品图片、规格表、评测细节和收藏资料，再结合自己的使用场景判断版本、价格和成色。",
  ],
  [
    "黑森林和黑森林 Pro 的关系要按具体公开资料确认。",
    "黑森林和黑森林 Pro 的关系要按具体版本确认。",
  ],
  [
    "官方 Web Catalog 把 Kakuno 写成第一次遇见钢笔的入口，页面也提到 Good Design Award 和 Kids Design Award。",
    "Kakuno 的定位很清楚：第一次遇见钢笔的入口，也拿到过 Good Design Award 和 Kids Design Award。",
  ],
  [
    "买前不要只看中文昵称，最好看清卖家页面里的英文名、颜色、尖号和是否带上墨器。",
    "买前不要只看中文昵称，最好看清英文名、颜色、尖号和是否带上墨器。",
  ],
  [
    "官方 1911 Series 和 1911S 14K 页面给了它的核心位置：传统外形，小尺寸，14K 金尖。",
    "1911S 14K 的核心位置很清楚：传统外形，小尺寸，14K 金尖。",
  ],
  [
    "现有零售资料显示，这个 Sparkling Red Gold 页面对应 11-1031-230，提供 F、MF、M、B 等尖号，属于更接近日用和入门金尖之间的位置。",
    "Sparkling Red Gold 对应 11-1031-230，提供 F、MF、M、B 等尖号，属于更接近日用和入门金尖之间的位置。",
  ],
  [
    "Lucky Charm 2 的页面明确写了 hand-finished stainless steel nib，并列出 Steel EF、F、MF、M、B 等尖号。",
    "Lucky Charm 2 配 hand-finished stainless steel nib，并有 Steel EF、F、MF、M、B 等尖号。",
  ],
  [
    "购买时要先核对型号。页面中文名里常会出现 PNB-13000 这类旧标法，但 Platinum 官方新闻对应的是 PNB-36000SK；看货时应把笔身、盒标和官方资料对在一起。",
    "购买时要先核对型号。中文标题里常会出现 PNB-13000 这类旧标法，但 Platinum 官方新闻对应的是 PNB-36000SK；看货时应把笔身、盒标和官方资料对在一起。",
  ],
  [
    "官方和零售页面给出的 PIZ 型号并非装饰编号，它们对应不同材质和等级。",
    "PIZ 型号并非装饰编号，它们对应不同材质和等级。",
  ],
  [
    "官方 Yukari Royale Collection 页面也把重点放在具体作品和 Urushi/Maki-e 语境里。",
    "Yukari Royale Collection 的重点也落在具体作品和 Urushi/Maki-e 语境里。",
  ],
  [
    "Elephant-Coral 页面描述龙爪中有“pearl of wisdom”，画面通过金银 raised lacquer 等方法强调。",
    "这支笔的画面里，龙爪中有“pearl of wisdom”，并通过金银 raised lacquer 等方法强调。",
  ],
  [
    "Namiki 官方资料强调漆的耐用和随使用贴合手感，也强调自家笔尖和书写品质。",
    "Namiki 对这类笔的叙述会强调漆的耐用和随使用贴合手感，也强调自家笔尖和书写品质。",
  ],
  [
    "二手页面如果只写“黑溜涂”，没有清楚照片，不够判断。",
    "二手交易里如果只写“黑溜涂”，没有清楚照片，不够判断。",
  ],
  [
    "页面里写“works well”只能说明具体那支经过卖家检查，不能自动套到所有 22。",
    "卖家写“works well”只能说明具体那支经过检查，不能自动套到所有 22。",
  ],
  [
    "官方页面强调铝合金笔身、透明握位、钢尖和墨囊/上墨器结构。",
    "它的核心配置是铝合金笔身、透明握位、钢尖和墨囊 / 上墨器结构。",
  ],
  [
    "二手页面尤其要看笔帽口、握区、活塞尾端和笔杆白色区域。",
    "二手购买尤其要看笔帽口、握区、活塞尾端和笔杆白色区域。",
  ],
  [
    "最好能确认笔帽、笔身、尾端和握位都没有损伤。",
    "最好检查笔帽、笔身、尾端和握位都没有损伤。",
  ],
  [
    "Goldspot 页面写到 Souverän M815、metal striped blue、silver trim、18k gold。",
    "M815 的关键词是 Souverän、metal striped blue、silver trim 和 18k gold。",
  ],
  [
    "Goldspot 页面里的 black with gold trim、18k gold 说明它是现代商品线里的 51，而不是直接等同于 vintage 51。",
    "black with gold trim 和 18k gold 这些配置说明，它是现代商品线里的 51，而不是直接等同于 vintage 51。",
  ],
  [
    "Goldspot 页面里的黑色漆面金夹 Sonnet，很能代表它的气质：金属、漆面、礼盒、墨囊/上墨器，放在办公桌上不会显得突兀。",
    "黑色漆面金夹 Sonnet 很能代表它的气质：金属、漆面、礼盒、墨囊 / 上墨器，放在办公桌上不会显得突兀。",
  ],
  [
    "Goldspot 的零售资料可以帮助确认具体在售版本的外观和尖号。",
    "具体在售版本要看外观、尖号和市场版本。",
  ],
  [
    "这个页面标题里带着“查尔斯顿 / Hemisphere”，实际阅读时应先按 Hemisphere 这条现代线来判断。",
    "“查尔斯顿 / Hemisphere”这个标题容易混淆，实际阅读时应先按 Hemisphere 这条现代线来判断。",
  ],
  [
    "Goldspot 的蓝色木杆限量页面写到 hornbeam wood、chrome-plated metal trim、不锈钢笔尖、Faber-Castell 墨囊或 converter。",
    "蓝色木杆限量版的关键词是 hornbeam wood、chrome-plated metal trim、不锈钢笔尖，以及 Faber-Castell 墨囊或 converter。",
  ],
  [
    "官方页面把 Diamond Mini AL 放在 Diamond Mini AL Silver Fountain Pen 产品语境里。",
    "Diamond Mini AL Silver Fountain Pen 这个名字已经把重点说清楚了。",
  ],
  [
    "官方页面把 GO 放在更亲民的价位里，强调弹簧活塞、简单操作和尖号选择。",
    "GO 的定位更亲民，重点是弹簧活塞、简单操作和尖号选择。",
  ],
  [
    "读这支笔，先抓住 HongDian 1866 苏木原木钢笔礼盒 这个入口，这个信息已经把它和普通金属杆、塑料杆入门笔区分开了。",
    "HongDian 1866 苏木原木钢笔礼盒这个名字，已经把它和普通金属杆、塑料杆入门笔区分开了。",
  ],
  [
    "这个信息比“软弹尖”“高级感”之类词更有用：它能看出这支笔的吸引力来自低价钛材、随身尺寸和弘典近几年密集推出金属笔的节奏。",
    "这比“软弹尖”“高级感”之类词更有用：T1 的吸引力来自低价钛材、随身尺寸和弘典近几年密集推出金属笔的节奏。",
  ],
  [
    "产品页里的 grey、golden cap、0.5mm fine nib 这些词只对应具体版本，不要自动套到所有版本。",
    "grey、golden cap、0.5mm fine nib 这些词只对应具体版本，不要自动套到所有版本。",
  ],
  [
    "二手或电商页面里，要看笔尖、活塞、笔身裂纹、是否漏墨。",
    "二手或电商购买时，要看笔尖、活塞、笔身裂纹、是否漏墨。",
  ],
];

const REGEX_REPLACEMENTS: Array<[RegExp, string]> = [
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 的页面列出([^。]+)。/g,
    "它的关键参数包括$1。",
  ],
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 页面列出([^。]+)。/g,
    "它的关键参数包括$1。",
  ],
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 的页面写的是 ([^，。]+)，/g,
    "它可以先按 $1 来读，",
  ],
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 页面写的是 ([^，。]+)，/g,
    "它可以先按 $1 来读，",
  ],
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 的页面写到 ([^，。]+)，/g,
    "它的可见配置包括 $1，",
  ],
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 页面写到 ([^，。]+)，/g,
    "它的可见配置包括 $1，",
  ],
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 的页面显示([^。]+)。/g,
    "$1。",
  ],
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 的页面把重点放在([^。]+)。/g,
    "它的重点在$1。",
  ],
  [
    /官方 ([^。]{1,80}) 页面把它放在 ([^，。]+)里，已经能确认的重点是：([^。]+)。/g,
    "它属于$2，关键线索是：$3。",
  ],
  [
    /Nakaya 官方页面写得很清楚：([^。]+)。/g,
    "这支笔的画面很清楚：$1。",
  ],
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 的产品页把它写成 ([^。]+)。/g,
    "它可以先按 $1 来读。",
  ],
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 的产品页写到 ([^，。]+)，/g,
    "它的可见信息是 $1，",
  ],
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 的产品页能看到 ([^，。]+) 这样的具体版本，说明它走的是([^。]+)。/g,
    "它走的是$2，常见版本包括 $1。",
  ],
  [
    /(?:[A-Z][A-Za-z '&.-]{1,80}|Amazon(?: US| Germany)?|JD|Noon|TSAMSA|MoonmanPen|Minapens|Pensachi|JUSPIRIT|Swastik Penn|Fountain Pen India|Everything Calligraphy|Desk Bandit|The Well-Appointed Desk|The Gentleman Stationer|Andy's Pens|Cronicas Estilograficas|Cult Pens|Goulet|Goldspot|Makoba|Furper) 的产品页能确认 ([^，。]+) 这个具体产品，现有资料也把它和 ([^。]+)放在一起。/g,
    "读 $1，重点看 $2。",
  ],
  [
    /([^\n。]+?) 的公开资料只够支撑这一层：([^。]+)。/g,
    "$1 先读到这一层就够了：$2。",
  ],
  [
    /公开资料提到 ([^，。]+)，说明这个型号的第一印象来自([^。]+)。/g,
    "人们对这支笔的第一印象，往往就是$2。",
  ],
  [
    /公开资料提到 ([^，。]+)，说明它的第一印象来自([^。]+)。/g,
    "人们对这支笔的第一印象，往往就是$2。",
  ],
  [
    /公开资料提到 ([^，。]+)，说明这支笔走的是([^。]+)。/g,
    "这支笔走的是$2。",
  ],
  [/公开资料提到 ([^，。]+)，说明它走的是([^。]+)。/g, "它走的是$2。"],
  [
    /公开资料提到 ([^，。]+)，说明这支笔的第一卖点是([^，。]+)，复杂机制并不是重点。/g,
    "这支笔的第一卖点是$2，复杂机制并不是重点。",
  ],
  [
    /公开资料提到 ([^，。]+)，说明它的核心卖点是([^。]+)。/g,
    "它的核心卖点是$2。",
  ],
  [/公开资料提到 ([^，。]+)，说明它的核心是([^。]+)。/g, "它的核心是$2。"],
  [/公开资料提到 ([^，。]+)，说明它属于([^。]+)。/g, "它属于$2。"],
  [/公开资料提到 ([^，。]+)，说明它常以([^。]+)。/g, "它常以$2。"],
  [/公开资料提到 ([^，。]+)，说明([^。]+)。/g, "$2。"],
  [/公开资料可以确认 ([^。]+)。/g, "已经能确认的重点是：$1。"],
  [/([A-Za-z][^。]{0,80}) 的页面把它写成 ([^，。]+)，/g, "它可以先按 $2 来读，"],
  [/([A-Za-z][^。]{0,80}) 页面把它写成 ([^，。]+)，/g, "它可以先按 $2 来读，"],
  [/([A-Za-z][^。]{0,80}) 的产品页写的是 ([^，。]+)，/g, "它的可见信息很直接：$2，"],
  [/([A-Za-z][^。]{0,80}) 页面写到 ([^，。]+)，/g, "读这支笔，先抓住 $2 这个入口，"],
  [/([A-Za-z][^。]{0,80}) 页面指向 ([^，。]+)，/g, "读这支笔，先抓住 $2 这个入口，"],
  [/现有资料把它放在 ([^。]+)。/g, "它的位置很清楚：$1。"],
  [/现有资料也把它放在 ([^。]+)。/g, "它可以先放在 $1 这条线上读。"],
  [/现有资料把它和([^。]+)放在一起。/g, "读它时，重点看$1这些要素。"],
  [/现有资料也提到([^。]+)。/g, "实际能抓住的重点是$1。"],
  [/现有资料提到([^。]+)。/g, "实际能抓住的重点是$1。"],
  [/已经能确认的重点是：/g, "它的基本轮廓是："],
  [/页面里 M800、J800、800 等叫法/g, "M800、J800、800 等叫法"],
  [/页面里的图片和配色/g, "图片和配色"],
  [/页面里的“梵高系列钢笔杏花礼盒装”/g, "“梵高系列钢笔杏花礼盒装”"],
  [/现在零售页面里常见/g, "现在常见"],
  [/能确认型号和系列页面/g, "这个系列入口比较清楚"],
  [/产品页里的 ([^。]+?) 这些词只对应具体版本/g, "$1 这些词只对应具体版本"],
  [/卖家页面里的/g, ""],
  [/具体页面/g, "具体版本"],
  [/产品页写的是/g, "可见信息是"],
  [/页面把它写成/g, "可以先按"],
  [/公开索引/g, "可见线索"],
  [/资料指向/g, "线索指向"],
  [/第一印象来自/g, "第一眼会落在"],
  [/更适合作为/g, "更适合被看成"],
  [/说明这个型号/g, "能看出这个型号"],
  [/说明这支笔/g, "能看出这支笔"],
  [/说明它的第一印象/g, "人们对它的第一印象"],
  [/品牌性格/g, "品牌取向"],
];

const SOURCE_LED_PATTERNS = [
  "页面把",
  "页面写",
  "页面列",
  "页面指向",
  "页面里",
  "页面能",
  "产品页",
  "评测标题",
  "公开评测",
  "公开资料",
  "现有资料",
  "资料可以",
  "资料能",
  "能确认",
  "可以确认",
  "信息已经",
  "这个信息",
  "这些信息",
  "索引",
  "研究入口",
  "来源边界",
  "资料边界",
];

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  body_md: string | null;
};

type StoryRow = {
  id: string;
  entity_id: string;
  type: string;
  slug: string;
  name: string;
  title: string;
  story_type: string;
  summary: string | null;
  body_md: string;
};

function replaceAllLiteral(text: string, from: string, to: string) {
  return text.split(from).join(to);
}

function cleanupReaderTone(text: string) {
  let next = text;

  for (const [from, to] of TEXT_REPLACEMENTS) {
    if (typeof from === "string") {
      next = replaceAllLiteral(next, from, to);
    } else {
      next = next.replace(from, to);
    }
  }

  for (const [pattern, replacement] of REGEX_REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }

  next = next
    .replace(/ +/g, " ")
    .replace(/ \n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return next;
}

function cleanupBrandTitle(title: string) {
  return title
    .replace(/与品牌性格/g, "怎么读")
    .replace(/从公开资料读品牌线索/g, "从实物和资料线索读起");
}

function cleanupBrandSummary(summary: string) {
  return cleanupReaderTone(summary)
    .replace(
      /这些型号能看出品牌定位和书写性格/g,
      "这些型号能帮助读者先看清产品线入口和日用取向",
    )
    .replace(/品牌性格/g, "日用取向");
}

function cleanupBrandBody(body: string) {
  return cleanupReaderTone(body)
    .replace(
      /几支代表型号能说明这个品牌的性格：/g,
      "先从这些代表型号进入，会比只看品牌名更清楚：",
    )
    .replace(
      /([^\n。]+?) 更适合按具体型号来判断。入门和国产型号的差异往往体现在笔尖稳定性、上墨器密封、笔杆重量、做工一致性和售后便利上。/g,
      "读 $1 时，先看具体型号，再看笔尖稳定性、上墨密封、笔杆重量、做工一致性和售后便利。对这类入门或国产品牌来说，这些细节比单独一个品牌名更能决定日常体验。",
    )
    .replace(
      /([^\n。]+) 的品牌馆先整理可确认的公开资料，帮助读者分清品牌名、产品线索和后续可查的具体型号。/g,
      "$1 目前适合从可确认资料和实物线索读起：先分清品牌名、产品线索，再看能继续追到哪些具体型号。",
    )
    .replace(
      /现有资料主要是公开检索入口，适合用来确认名称、关联型号和进一步查证方向。/g,
      "现在能抓住的，是名称、关联型号和少量公开入口；读的时候要把这些当作线索，而不是完整品牌史。",
    )
    .replace(
      /馆内暂时没有把它拆成具体钢笔型号。/g,
      "如果站内还没有对应的具体型号页，就先回到实物照片、包装、笔尖刻字和卖家信息。",
    )
    .replace(/品牌性格/g, "产品线轮廓");
}

async function updateEntity(slug: string, summary: string, bodyMd: string | null) {
  await execute(
    `UPDATE entities
     SET summary = ?,
         body_md = ?,
         updated_at = datetime('now')
     WHERE slug = ?`,
    [summary, bodyMd, slug],
  );
}

async function updateStoryForSlug(
  slug: string,
  storyType: string,
  title: string,
  summary: string,
  bodyMd: string,
) {
  const entity = (await queryOne("SELECT id FROM entities WHERE slug = ?", [
    slug,
  ])) as { id: string } | undefined;

  if (!entity) {
    throw new Error(`Missing entity for slug: ${slug}`);
  }

  await execute(
    `UPDATE stories
     SET title = ?,
         summary = ?,
         body_md = ?,
         updated_at = datetime('now')
     WHERE entity_id = ? AND story_type = ?`,
    [title, summary, bodyMd, entity.id, storyType],
  );
}

async function applyTargetedRewrites() {
  await updateEntity("坛笔-penbbs-金尖大明尖", PENBBS_NIB_SUMMARY, PENBBS_NIB_BODY);
  await updateStoryForSlug(
    "坛笔-penbbs-金尖大明尖",
    "overview",
    "PenBBS 金尖 / 大明尖：要和具体型号一起读",
    PENBBS_NIB_SUMMARY,
    PENBBS_NIB_BODY,
  );

  await updateEntity("塞尔-3-0-ef尖", SAIER_NIB_SUMMARY, SAIER_NIB_BODY);
  await updateStoryForSlug(
    "塞尔-3-0-ef尖",
    "overview",
    "塞尔 3.0 EF 尖：按细尖和实物标识来读",
    SAIER_NIB_SUMMARY,
    SAIER_NIB_BODY,
  );

  await updateEntity("penbbs", PENBBS_BRAND_SUMMARY, null);
  await updateStoryForSlug(
    "penbbs",
    "brand_story",
    "坛笔 (PenBBS)：从 268、456、469、494 看产品线",
    "PenBBS 的代表型号可以沿着真空、活塞、双头和笔尖版本来读。",
    PENBBS_BRAND_BODY,
  );
}

async function cleanupEntities() {
  const rows = (await queryAll(
    `SELECT id, type, slug, name, summary, body_md
     FROM entities
     WHERE type IN (${TARGET_TYPES.map(() => "?").join(", ")})`,
    TARGET_TYPES,
  )) as EntityRow[];

  let changed = 0;

  for (const row of rows) {
    if (row.slug === "坛笔-penbbs-金尖大明尖" || row.slug === "塞尔-3-0-ef尖") {
      continue;
    }

    const nextSummary =
      row.summary == null ? null : cleanupReaderTone(row.summary);
    const nextBody = row.body_md == null ? null : cleanupReaderTone(row.body_md);

    if (nextSummary !== row.summary || nextBody !== row.body_md) {
      await execute(
        `UPDATE entities
         SET summary = ?,
             body_md = ?,
             updated_at = datetime('now')
         WHERE id = ?`,
        [nextSummary, nextBody, row.id],
      );
      changed += 1;
    }
  }

  return changed;
}

async function cleanupStories() {
  const rows = (await queryAll(
    `SELECT s.id,
            s.entity_id,
            e.type,
            e.slug,
            e.name,
            s.title,
            s.story_type,
            s.summary,
            s.body_md
     FROM stories s
     JOIN entities e ON e.id = s.entity_id
     WHERE e.type IN (${TARGET_TYPES.map(() => "?").join(", ")})`,
    TARGET_TYPES,
  )) as StoryRow[];

  let changed = 0;

  for (const row of rows) {
    if (row.slug === "坛笔-penbbs-金尖大明尖" || row.slug === "penbbs") {
      continue;
    }

    const nextTitle =
      row.type === "brand" ? cleanupBrandTitle(row.title) : cleanupReaderTone(row.title);
    const nextSummary =
      row.summary == null
        ? null
        : row.type === "brand"
          ? cleanupBrandSummary(row.summary)
          : cleanupReaderTone(row.summary);
    const nextBody =
      row.type === "brand"
        ? cleanupBrandBody(row.body_md)
        : cleanupReaderTone(row.body_md);

    if (
      nextTitle !== row.title ||
      nextSummary !== row.summary ||
      nextBody !== row.body_md
    ) {
      await execute(
        `UPDATE stories
         SET title = ?,
             summary = ?,
             body_md = ?,
             updated_at = datetime('now')
         WHERE id = ?`,
        [nextTitle, nextSummary, nextBody, row.id],
      );
      changed += 1;
    }
  }

  return changed;
}

async function countRemaining() {
  const patterns = [
    "公开资料提到",
    "公开资料可以确认",
    "公开资料里",
    "说明这个型号",
    "说明它的第一印象",
    "说明这支笔",
    "第一印象来自",
    "更适合作为",
    "页面保留",
    "不是独立钢笔型号",
    "不是独立型号",
    "更适合按具体型号来判断",
    "入门和国产型号的差异往往",
    "资料指向",
    "现有资料把",
    "现有资料提到",
    "产品页写的是",
    "页面把它写成",
    "公开索引",
    "品牌性格",
    "先保留",
  ];

  const rows = (await queryAll(
    `SELECT e.type,
            e.slug,
            e.name,
            COALESCE(e.summary, '') || char(10) || COALESCE(e.body_md, '') AS text
     FROM entities e
     WHERE e.type IN (${TARGET_TYPES.map(() => "?").join(", ")})
     UNION ALL
     SELECT e.type,
            e.slug,
            e.name,
            COALESCE(s.title, '') || char(10) || COALESCE(s.summary, '') || char(10) || COALESCE(s.body_md, '') AS text
     FROM stories s
     JOIN entities e ON e.id = s.entity_id
     WHERE e.type IN (${TARGET_TYPES.map(() => "?").join(", ")})`,
    [...TARGET_TYPES, ...TARGET_TYPES],
  )) as Array<{ type: string; slug: string; name: string; text: string }>;

  const byPattern: Record<string, number> = {};
  const examples: Array<{ slug: string; name: string; pattern: string }> = [];

  for (const row of rows) {
    for (const pattern of patterns) {
      if (row.text.includes(pattern)) {
        byPattern[pattern] = (byPattern[pattern] || 0) + 1;
        if (examples.length < 20) {
          examples.push({ slug: row.slug, name: row.name, pattern });
        }
      }
    }
  }

  return { byPattern, examples };
}

async function countSourceLedRemaining() {
  const rows = (await queryAll(
    `SELECT e.type,
            e.slug,
            e.name,
            COALESCE(e.summary, '') || char(10) || COALESCE(e.body_md, '') AS text
     FROM entities e
     WHERE e.type IN (${TARGET_TYPES.map(() => "?").join(", ")})
     UNION ALL
     SELECT e.type,
            e.slug,
            e.name,
            COALESCE(s.title, '') || char(10) || COALESCE(s.summary, '') || char(10) || COALESCE(s.body_md, '') AS text
     FROM stories s
     JOIN entities e ON e.id = s.entity_id
     WHERE e.type IN (${TARGET_TYPES.map(() => "?").join(", ")})`,
    [...TARGET_TYPES, ...TARGET_TYPES],
  )) as Array<{ type: string; slug: string; name: string; text: string }>;

  const byPattern: Record<string, number> = {};
  const examples: Array<{
    slug: string;
    name: string;
    pattern: string;
    snippet: string;
  }> = [];

  for (const row of rows) {
    for (const pattern of SOURCE_LED_PATTERNS) {
      const index = row.text.indexOf(pattern);

      if (index === -1) {
        continue;
      }

      byPattern[pattern] = (byPattern[pattern] || 0) + 1;

      if (examples.length < 30) {
        examples.push({
          slug: row.slug,
          name: row.name,
          pattern,
          snippet: row.text
            .slice(Math.max(0, index - 70), index + pattern.length + 120)
            .replace(/\s+/g, " "),
        });
      }
    }
  }

  return { byPattern, examples };
}

async function main() {
  const database = process.env.TURSO_DATABASE_URL ? "remote Turso" : "local SQLite";

  await applyTargetedRewrites();
  const changedEntities = await cleanupEntities();
  const changedStories = await cleanupStories();
  const remaining = await countRemaining();
  const sourceLedRemaining = await countSourceLedRemaining();

  console.log(
    JSON.stringify(
      {
        database,
        changedEntities,
        changedStories,
        remaining,
        sourceLedRemaining,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
