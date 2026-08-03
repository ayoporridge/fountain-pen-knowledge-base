# Pelikan M215 Phase 418 研究记录

检索日期：2026-08-03。对象是现有 `phase281-pelikan-m215`（slug `pelikan-m215`），不新增实体。目标是把原有约 2300 字的条目深化成可核验的型号页，重点处理 M215 的黄铜内层身份、四种图案时间线、重量与尺寸口径、钢尖与活塞、维护、二手验收，以及它和 M200/M205/M250/P205 的边界。

## 身份与边界

| 判断 | 证据与写法 |
| --- | --- |
| M215 是 Classic 200 的金属笔杆 sibling | Pelikan MAM 资料列出 brass shaft、high-grade resin casing、silver chrome-plated highlights 和 piston filling mechanism；它不是把 M200 “加重”后的临时称呼。 |
| 四种主要图案 | Pelikan Collectibles 记录 2005 Blue-Striped、2006 Rings、2007 Lozenges、2008 Rectangles；The Pelikan’s Perch 使用 Orthogons 这一英文写法，页面同时保留来源措辞，不把拼写差异拆成第五个型号。 |
| 规格 | 专业档案给出约闭帽 125 mm、笔杆 102 mm、笔帽 57 mm、直径 12 mm、20.0 g、1.20 ml；官方 Fine Writing 资料对 M215 SKU 另列约 1.3 ml 的当前目录口径，需注明不是同一测量方法。 |
| 相邻型号 | M205 是银色饰件树脂活塞路线；M200 是金色饰件／镀金钢尖；M250 是 14 ct 金尖；P205 是墨囊路线。M215 的银色夹子本身不足以证明身份，黄铜内层、图案、重量、尾钮和尖刻字需交叉。 |

## 版本时间线

- 2005–2006：Blue-Striped 蓝色条纹，档案标为首个 M215 版本；蓝色笔杆、黑色笔帽、银色／铑色饰件和黄铜内层构成识别组合。
- 2006：Rings 环纹黑色路线，黑帽、银色环和金属内层；官方 SKU 948281 是 M 尖样本，948273／948299 等对应其他尖幅。
- 2007–2013：Lozenges 菱形路线；档案记录为黑色笔杆、黑帽和银色饰件。资料页有 “Lonzenges” 的拼写，应以图片／图案和来源链接为准，不人为创建错误的独立实体。
- 2008–2013：Rectangles／Orthogons 矩形路线；The Pelikan’s Perch 使用 Orthogons，Pelikan Collectibles 使用 Rectangles，两者指向同一图案家族。
- M215 资料库仍有官方 SKU 和目录页，但这只能证明品牌资料保存或曾列出产品，不能推断每个地区当前都有现货。

## 来源层级

1. Pelikan MAM 948281 Black-Rings M、948455 Black-Rings M 与官方产品分类页：SKU、M 尖／B 尖、活塞、黄铜轴、树脂外壳、银色饰件。
2. Pelikan Fine Writing 资料 1030028 与 2025／2022 目录：EF/F/M/B 选项、银色高光饰件、约 1.3 ml 当前目录口径和 Classic 215 的家族位置。
3. Pelikan Collectibles：四种图案、2005–2013 年份、黄铜套筒、钢尖、20 g／125 mm／1.20 ml 历史表。
4. The Pelikan’s Perch M215：与 M200/M205 相同尺寸、金属笔杆带来的重量、深色墨窗、crown cap、单帽环和铑色饰件识别。
5. Pen Addict M215 Rings 评述：20 g 与 M205 14 g 的书写重心对照；仅作使用场景参考，不升级为整系列写感保证。
6. Penography 6：2005 引入和四种图案、黄铜笔杆外覆不同涂层的历史索引。
7. Pelikan 官方护理页／FAQ：冷水吸排、避免热水／肥皂／酒精和长期存放前排空。
8. Goulet family comparison、可靠零售页：用于 M215 与 Classic/Souverän 相邻型号的导航，不回填不同系列规格。
9. 本站原创 `public/images/library/site-original/phase281/pelikan/m215.svg`：只展示黄铜内层、树脂外壳、银色饰件和活塞边界，明确非产品照片、非 Logo、非比例图、非颜色校样。

## 页面规则

- 以“黄铜内层 + 树脂外壳 + 银色饰件 + 抛光不锈钢尖 + 活塞”做身份锚点，四种图案用 variant 记录，不拆成 M215 Blue、M215 Rings 等基础实体。
- 20 g 是档案参考，1.20 ml 与约 1.3 ml 是不同来源口径；正文同时标注测量方法、是否含笔帽／墨水和当前／历史范围。
- 不把 M205 的轻量树脂、M200 的金色饰件、M250 的金尖或 P205 的墨囊接口复制进 M215。
- 二手验收需要图案、笔杆反光／黄铜线索、尾部活塞、深色墨窗、尖刻字、重量条件和维修史；只有远景图时保留待核。
- 金属笔杆不代表可以使用金属抛光剂或强溶剂；维护仍遵循官方清水路径，裂纹、尾钮松动、漏墨和尖座问题交专业维修。

## 计划验证

- 复用 `phase281-pelikan-m215` 与 Pelikan maker relation，不新增重复实体。
- 新 pack 至少 8000 Unicode 字符、20 个来源、17 个独立组、14 个以上版本、1 个 primary factual SVG。
- 在 caller-owned checkpoint copy 中执行审核—发布、来源／规格／版本／readiness／四类 current review／关系／完整性和 replay noop；检查真实 `data/fpkg.db` SHA-256 不变。
