# Admok 简800／J800：身份、结构与发布边界研究（2026-07-20）

## 结论

现库 `Admok 简800` 应规范为 **Admok J800（简800）**，而不是 `Admok M800`。公开卖家和论坛常用 “M800” 来提示其与 Pelikan Souverän M800 的外形相似，但多个使用者明确指出，Admok 自己使用的是 `J800`／`简800`；“简”不是 M 的译名，也不应成为把本型号重定向到 Pelikan M800 的理由。

它可以作为独立的当代中国活塞笔模型公开，但只能在下列边界内：主体为 J800／简800 的活塞上墨平台；颜色、仿制图案、Schmidt/Bock/其它笔尖、黄铜或铝制活塞组件、可替换笔尖单元与用户改装均按具体版本或实物记录。没有当前官方 SKU、稳定目录或可使用的精确照片时，主图使用原创事实卡，不拿 Pelikan M800、卖家缩略图或改装实物冒充标准 J800。

## 可核实的事实

1. 多个讨论把该笔称为 **J800**：Reddit 的拥有者说明 Admok 将其称为 J800，并称它为 piston filler；另一位长期使用者明确说制造商并不把它命名为 M800，即使 AliExpress/eBay 卖家这样列。FPN 讨论也记录了“proper model designation”为 J800。
2. 它与 Pelikan M800 有明显外观/结构参照关系，但不是同一型号，也不应写成官方授权、原厂零件通用或 Pelikan 的低价版本。用户改装、部分笔尖单元互换或论坛试验只属于个体改装事实。
3. 上墨结构可谨慎写为活塞上墨；但活塞材料、容量、密封件、笔尖品牌及具体可替换性没有足够稳定的主来源支持“全系固定规格”。
4. “M800”是检索别名，不是 canonical 名。旧 URL 若只是在卖家标题中用了 M800，不能自动建立 redirect；只有确认它的实际实体是 Admok J800 才能保留为别名。

## 页面写作边界

- 自然中文可以说“外形明显借鉴大型条纹活塞笔传统”，但避免给它写成“百利金 M800 复刻”“原厂平替”或“完全兼容”。
- `J800/简800` 为 canonical；`Admok M800`、`Admok 800` 仅为市场/检索别名，并明确提醒购买者看笔身、笔尖、活塞与卖家 SKU。
- 颜色、maki-e 图案、金/银色饰件、Schmidt/Bock 或用户替换的 Pelikan 笔尖不是同一款的固有规格。
- 维护写成保守建议：用瓶装墨；活塞阻力、漏墨、O-ring、笔尖/笔舌松动时停止强拆，由卖家或专业维修者处理。不得鼓励以未核实的“兼容性”强行互换零件。

## 来源

- [Reddit：Admok maki-e J800](https://www.reddit.com/r/fountainpens/comments/1eg30u1)，拥有者对 J800 名称、活塞结构及长期耐用性不确定性的说明。
- [Reddit：制造商并非把 J800 命名为 M800](https://www.reddit.com/r/fountainpens/comments/1mdxsf5)，用于 canonical 名称和卖家误称边界。
- [Fountain Pen Network：J800 活塞笔与笔尖选项讨论](https://www.fountainpennetwork.com/forum/topic/296756-what-was-your-last-impulsive-pen-acquisition/page/326/)，用于社区层面的型号命名和单支配置参考。
- [Bilibili：适配百利金 M800 笔尖的 ADMOK 乌800](https://www.bilibili.com/video/BV19t421W7AR/)，仅提示存在特定适配/改装讨论；不能证明全系原厂兼容。

## 实施前检查

1. 在 owned checkpoint copy 确认现有 `admok` 品牌与 `admok-简800` 的 ID、slug、现有别名和唯一 `made_by`。
2. 将 canonical name 改为“Admok J800（简800）”，保留 `Admok M800` 仅作 market alias，并在正文提醒它不是 Pelikan 页面。
3. 不创建到 Pelikan M800 的 redirect、duplicate 或 made_by 关系；品牌页只连接已公开的 Admok 型号。
4. 使用原创 SVG，不使用近似款产品照片；测试首次应用、replay noop、唯一品牌关系与正文中的 J800/M800 边界。
