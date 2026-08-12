# IKKAKU by Nahvalur：Phase 598 型号库存与身份判定

检索日期：2026-08-11

## 结论

IKKAKU 不应在站内被建成一个与 Nahvalur 无关的制造商品牌。Nahvalur 官网始终使用“IKKAKU by Nahvalur”，Ye-Yu 页面又把它称为 Nahvalur 的漆艺与螺钿奢华路线；专业零售商有时把它放进独立品牌筛选器，也有页面称其为 subsidiary brand。为同时保留读者熟悉的名称和制造关系，本站采用以下模型：

- `/article/ikkaku-by-nahvalur` 是系列／高端产品线导航页，不是第二家制造商。
- 每支具体钢笔仍以 `made_by -> Nahvalur` 连接到 `/brand/nahvalur`。
- “IKKAKU”“IKKAKU by Nahvalur”作为系列名称和别名，不制造重复品牌节点。
- 只有可由独立官方商品页、授权零售商商品页或同期专业资料确认的具体型号才建立公开型号页。

这个决定比“另建 IKKAKU 品牌”更符合页面要表达的事实：品牌页能够列出全部 Nahvalur 型号，读者仍可从系列导航集中浏览 IKKAKU，且不会丢失“by Nahvalur”的制造关系。

## 当前官网库存：九款

Nahvalur 当前 IKKAKU collection 与 Shopify 商品数据共同确认九个公开商品。Fine 与 Medium 是同一型号的笔尖 SKU，不拆成重复型号页。

| 型号 | 官方 handle | 版本／材料重点 | 当前 SKU |
|---|---|---|---|
| Ye-Yu 夜羽 | `ikkaku-ye-yu-urushi-raden-fountain-pen` | 2023 Limited Edition；黑漆、螺钿；Nautilus 轮廓 | F `91100011G`；M `91100012G` |
| Pan-Long 盘龙 | `ikkaku-pan-long-coiling-dragon-urushi-chinkin-fountain-pen` | 2024 Limited Edition；沈金龙纹 | F `91100151G`；M `91100152G`；当前不可售 |
| Blue Moon 蓝月 | `ikkaku-by-nahvalur-lan-yu-urushi-pen` | 2025 Limited Edition；蓝漆与金属粉；玫瑰金色饰件 | F `91100021G`；M `91100022G` |
| Dragonfly 蜻蜓 | `ikkaku-dragonfly-urushi-fountain-pen` | 黑漆硬橡胶、螺钿蜻蜓 | F `91100191G`；M `91100192G` |
| Cherry Blossom 落樱 | `ikkaku-cherry-blossom-urushi-fountain-pen` | 蓝漆、樱花图案、银色饰件 | F `91100211G`；M `91100212G` |
| Year of the Snake 蟒 | `ikkaku-snake-urushi-fountain-pen` | 黑漆、螺钿蛇纹、金色饰件 | F `91100201G`；M `91100202G` |
| Green Moon 翠月 | `ikkaku-by-nahvalur-green-moon-urushi-fountain-pen` | 2025 Limited Edition；绿漆与金属粉 | F `91100221G`；M `91100222G` |
| Blood Moon 血月 | `ikkaku-by-nahvalur-blood-moon-urushi-fountain-pen` | 2025 Limited Edition；红漆与金色粉末 | F `91100231G`；M `91100232G` |
| Year of the Horse 骏 | `ikkaku-by-nahvalur-骏-year-of-the-horse-urushi-fountain-pen` | 蓝漆、莳绘、银与珠母马；全球 26 支 | F `91100241G`；M `91100242G` |

当前九款的共同边界：官网通常给出 149–150 mm 合帽、133 mm 开帽、不可套帽、约 13 mm 笔杆、10–11.5 mm 握位、36.85 g；使用 cartridge/converter，官网允许在螺纹涂硅脂后改作 eyedropper。每页仍按其官方字段单独引用，不能把共同尺寸倒推给没有相同资料的历史款。

## 历史库存：七个型号／系列

### Lan-Yue（Blue Moon）Crossflex

这是 2023 DC Pen Show 前后出现的历史特别版，采用 Regalia Writing Labs 的 Crossflex 笔尖、蓝漆与铂粉，并使用 special bespoke converter。Pen Chalet 的独立商品页将它写成 `Lan-Yue (Blue Moon)`。它不能与 2025 官网 Moon Trilogy 的 Blue Moon 合并：后者使用普通 14K F/M SKU `91100021G/91100022G`，前者只有 Crossflex 版本，商品身份、笔尖和时间均不同。站内分别保留 `ikkaku-lan-yue-crossflex` 与 `ikkaku-blue-moon`。

### Yu-Tu 玉兔（Jade Rabbit）

2023 年玉兔主题漆艺型号。旧 Shopify 商品索引可确认 Fine/Medium 与 998 美元的历史商品记录，St John's Pens 的 sold-out archive 也保留完整商品名。现有资料不足以把社区所称的 DC Pen Show 首发日期写成硬事实；页面只将其列为约 2023 年的历史限量型号，并清楚标示日期证据边界。

### Gradient Urushi Collection

2024 年推出的三色渐变漆系列：Yan-Zhi 胭脂、Zhu-Dan 朱丹、Cong-Lü 葱绿，每色 20 支，No.6 14K F/M，cartridge/converter。三者共享同一系列结构和规格，作为一个 `IKKAKU Gradient Urushi` 型号页，下设三个 edition-group 与 F/M market SKU；不制造三篇高度重复的公开正文。

### Exclusive Sunburst

Pen Chalet 独家，黑与橙黄漆面、金色饰件、No.6 14K F/M、cartridge/converter，限量 12 支。其独家和限量范围只适用于 Sunburst，不传播到其他 IKKAKU。

### Ying-Chun 迎春（Forsythia）

2024 Limited Edition，24 支，黄迎春花主题，手绘后罩透明漆，No.6 14K F/M，cartridge/converter。Goldspot 的 Fine SKU 为 `91100161G`。Pen Chalet 页面标题、正文和图片均为 Ying-Chun，却把可选颜色写成 `La-Mei (Chinese Plum Flower)`；这是同页字段冲突，不足以另建 La-Mei。站内保留一支 Ying-Chun，并把 La-Mei 记录为 dismissed identity conflict。

### Rhinoceros Skin Lacquer Special Limited Edition

犀皮漆特别系列包括 Qian-Tan 浅滩和 Shen-Hai 深海。授权零售资料对数量存在冲突：Pen Chalet 称 Shen-Hai 4 支、Qian-Tan 18 支；Chatterley 的历史商品页则把两款都写成 2023 Limited Edition of 18。站内建立一个系列型号页，下设两个 edition-group，但只把 Qian-Tan 18 支写入确定规格；Shen-Hai 数量标记为 unresolved，不用单一零售商数据冒充定论。

### Raden Eggshell Black Urushi Limited Edition

Nibs.com 独家九支：硬橡胶笔身、黑漆、手置螺钿和蛋壳、玫瑰金色饰件，14K Medium 或双切缝 Music。该款页面明确写 piston filling，与大多数 IKKAKU 的 cartridge/converter 不同；必须作为独立型号保存，不能套用系列共同供墨字段。

## 明确拒绝的合并与拆分

- 不把 IKKAKU 建成与 Nahvalur 平行、没有父关系的制造商品牌。
- 不把 2023 Lan-Yue Crossflex 与 2025 Blue Moon F/M 合并。
- 不把 Pen Chalet 的 `Ying-Chun` 标题和 `La-Mei` 选项拆成两个公开型号。
- 不把官网当前页面中的“Gradient Urushi Fountain Pen Collection”营销区块，与 2024 Yan-Zhi／Zhu-Dan／Cong-Lü 三色系列混为一款；前者是当前主题陈列，后者有独立同期商品资料。
- 不把 IKKAKU Year of the Horse 与 Nahvalur Pen of the Year Horse 2026 合并；前者是 26 支漆艺收藏款，后者是 Nahvalur 常规年度系列的独立产品。
- 不把所有 IKKAKU 都写成 cartridge/converter：Raden Eggshell Black 的零售原始页面明确写 piston filling。
- 不把所有 IKKAKU 都写成硬橡胶：Ying-Chun 与 Sunburst 的零售规格列为 resin；仅在具体来源支持时填写材料。

## 主要来源

- Nahvalur 官方 IKKAKU collection：https://nahvalur.com/collections/ikkaku-by-nahvalur
- Nahvalur 官方全部商品：https://nahvalur.com/collections/all
- Nahvalur 官方 Moon Trilogy：https://nahvalur.com/collections/ikkaku-moon-trilogy
- Nahvalur 官方 Ye-Yu：https://nahvalur.com/products/ikkaku-ye-yu-urushi-raden-fountain-pen
- Nahvalur 官方 Pan-Long：https://nahvalur.com/products/ikkaku-pan-long-coiling-dragon-urushi-chinkin-fountain-pen
- Nahvalur 官方 Year of the Horse：https://nahvalur.com/products/ikkaku-by-nahvalur-%E9%AA%8F-year-of-the-horse-urushi-fountain-pen
- Pen Addict Gradient Urushi review：https://www.penaddict.com/blog/2024/2/26/ikkaku-by-nahvalur-gradient-urushi-fountain-pen-review
- Pen Chalet Gradient Urushi：https://www.penchalet.com/fine_pens/fountain_pens/ikkaku_by_nahvalur_gradient_urushi_fountain_pens.html
- Pen Chalet Lan-Yue：https://www.penchalet.com/fine_pens/fountain_pens/ikkaku_by_nahvalur_lan-yue_blue_moon_fountain_pens.html
- Pen Chalet Sunburst：https://www.penchalet.com/fine_pens/fountain_pens/ikkaku_by_nahvalur_exclusive_sunburst_fountain_pens.html
- Pen Chalet Ying-Chun：https://www.penchalet.com/fine_pens/fountain_pens/ikkaku_by_nahvalur_ying-chun_%28forthysia%29_fountain_pens.html
- Goldspot Ying-Chun：https://goldspot.com/products/ikkaku-by-nahvalur-fountain-pen-in-ying-chun-forthysia
- Pen Chalet Rhinoceros Skin：https://www.penchalet.com/fine_pens/fountain_pens/ikkaku_by_nahvalur_rhinoceros_skin_lacquer_le_fountain_pens.html
- Chatterley Shen-Hai：https://chatterleyluxuries.com/product/ikkaku-by-nahvalur-lacquer-urushi-shen-hai-deep-sea-fountain-pen/
- Chatterley Qian-Tan：https://chatterleyluxuries.com/product/ikkaku-by-nahvalur-lacquer-urushi-qian-tan-shoal-fountain-pen/
- Nibs.com Raden Eggshell Black：https://nibs-usa.com/products/ikkaku-by-nahvalur-raden-eggshell-black-urushi-limited-edition
- St John's Pens Yu-Tu sold-out archive：https://www.stjohnspens.com/sold-out-edition-two

## 封板范围

Phase 598 的 canonical public scope 为一个系列导航页、九个当前型号页和七个历史型号／系列页，共十七个公开页面。F/M、Crossflex、颜色和限量编号进入 SKU／edition-group，不重复建页。若未来出现新的官方 IKKAKU 商品，应作为后续增量；本阶段不因弱社区提及扩张未证实型号。
