# Pelikan M205 Phase 417 研究记录

检索日期：2026-08-03。对象是现有 `phase281-pelikan-m205`（slug `pelikan-m205`），不是新增实体，也不是把 M200、M215 或 P205 的资料合并进来。本阶段把已有约 2300 字的页面深化为可核验的型号页，重点补足 M205 的时间线、特别版导航、规格口径、上墨边界、维护和二手识别。

## 身份结论

| 判断 | 证据与写法 |
| --- | --- |
| M205 是 Classic 200 的银色／铑色饰件活塞路线 | Pelikan MAM 产品资料列出 piston mechanism、silver-colored highlights 和 polished stainless steel nib；官方目录将 M205 与 M200 放在 Classic 200 活塞款。 |
| 型号起点 | Pelikan Collectibles 记录名称自 2005 年用于透明 demonstrator；2009 年开始有黑、红、白系列款。年份是档案生产记录，不应推成所有地区同步上市日。 |
| 当前与历史规格要分层 | MAM 2021/2023 产品资料提供特定商品与 M 尖、B 尖；Pelikan Collectibles 的历史表为闭帽约 125 mm、直径 12 mm、14 g、1.20 ml；2025 目录的 Classic 200 行给出当前测量口径，页面应标注“目录／档案口径”，不合并成固定公差。 |
| 相邻型号 | M200 是金色饰件／镀金钢尖；M250 是相近外形的金尖历史路线；M215 有黄铜内层、约 20 g；P205 是墨囊路线。只看到“205”、银色夹子或黑色帽子不能完成身份判断。 |

## 版本与时间线

- 2005：透明 M205 demonstrator，银色饰件，档案称也作为日本出口款出现；包装上的 “M200 transparent Japan” 不能单独替代笔身、尖和尾钮证据。
- 2009：黑、红、白系列款；同一 M205 路线内仍是钢尖和银色饰件。红色档案为 2009–2013，黑／白档案延续时间更长。
- 2009–2016：浅蓝透明、DUO Highlighter Yellow、Taupe、Shiny Green、Amethyst、Aquamarine、Neptunes Blue 等特别／地区款；2016 浅蓝透明复刻的帽顶环颜色与 2009 版本不同，不能仅靠“蓝透明”判年代。
- 2018–2023：Demonstrator、Olivine、Star Ruby、Moonstone、Petrol、Apatite、Rose Quartz 等特别版；可靠零售清单和专业档案只用于版本导航，具体库存、礼盒和是否含墨水需回到产品号。
- 2023 产品资料的 Rose Quartz 与 2021/2023 MAM 资料显示：特别色仍是 M205 的银色饰件、钢尖、活塞平台，不因颜色而成为新的基础型号。

## 来源层级与独立组

1. Pelikan 官方 MAM 产品资料：`971986` Black M、`823845` Rose Quartz M、`816748` Moonstone M，分别作为基础款、特别版和银灰透明路线的 SKU 级锚点。
2. Pelikan 官方 Fine Writing 资料和 2025 catalogue：Classic 200 的活塞／墨囊分界、钢尖与银色饰件、EF/F/M/B 选项和当前目录量测。
3. Pelikan Collectibles：M205 2005 起点、2009 系列款、颜色／透明度／帽环记录和 125 mm、14 g、1.20 ml 历史表。
4. The Pelikan’s Perch M205 页面：1997 改款后的 crown cap、单帽环、铑色饰件、旋钮环以及 M200/M205 识别边界。
5. The Pelikan’s Perch Rose Quartz 评述：2015–2023 Edelstein 相关特别版序列；只作版本史与外观语境，不升级为硬规格或普遍写感。
6. Pure Pens 的 M200/M205 特别版清单：作为可靠零售编辑的版本索引，不替代官方产品号和地区库存。
7. Pelikan 官方 care instructions／FAQ：冷水吸排、避免热水／肥皂／酒精、长期存放前排空；不鼓励日常拆活塞。
8. 本站原创 `public/images/library/site-original/phase281/pelikan/m205.svg`：只表达银色饰件、抛光钢尖、透明墨窗和活塞边界，明确非产品照片、非 Logo、非比例图、非颜色校样。

## 页面写作与图片规则

- 正文将“型号事实”“历史版本”“当前 SKU”分开，所有尺寸和容量保留来源口径；不把 M200 的金色饰件、M250 的金尖、M215 的 20 g 或 P205 的墨囊容量复制给 M205。
- 特别版用 `color` 或 `edition_group` variant 导航；不为 Rose Quartz、Apatite、Moonstone 等颜色新建基础实体，也不把一个地区 SKU 写成全球现货。
- 维修建议只写清水吸排、避免热水／酒精／硬工具和异常时送修；不写未经官方支持的拆解、润滑剂剂量或保修承诺。
- 二手识别要求同时看尾部活塞行程、墨窗、银色饰件、帽顶／帽环、尖刻字、产品号和维修史；照片不足时保留“待核”，不接受销售标题作为唯一证据。

## 计划验证

- 复用现有 `phase281-pelikan-m205` ID 与 maker relation，不插入重复实体。
- 新 pack 至少 8000 Unicode 字符、19 个来源、17 个独立来源组、20 个版本项、1 个 primary factual SVG。
- 在 disposable checkpoint copy 执行审核—发布链路，检查正文、规格、sources、variants、readiness、四类 current review、品牌反向链接和 replay noop；确认真实 `data/fpkg.db` SHA-256 不变。
