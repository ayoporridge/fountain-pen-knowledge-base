# Pelikan Souverän M805：Phase 421 研究记录

## 范围

- 复用实体 `phase283-pelikan-m805` / `pelikan-souveran-m805`，不创建新的 M805 Black、Stresemann 或 Blue 实体。
- 把 M805 作为 M800 尺寸的银色／钯色饰件路线深化；Black、Blue-striped、Dark Blue、Stresemann、Ocean Swirl、Blue Dunes 作为版本维度。
- 通过官方产品／目录／FAQ、Pelikan Collectibles、The Pelikan's Perch 和独立评测补齐自然中文正文；实验只应用到 owned checkpoint。

## 核心来源

| 来源 | 证据用途 |
| --- | --- |
| [Pelikan MAM Black-Blue M 933432](https://mam.pelikan.com/mam/en/pelikan/products/933432) | 官方 M805 产品身份、差动活塞、18K 全铑尖、EF/F/M/B、钯色饰件和德国制造字段。 |
| [Pelikan MAM Black EF 925420](https://mam.pelikan.com/mam/en/pelikan/products/925420) | 黑色路线、尖幅和官方产品资料交叉记录。 |
| [Pelikan 官方当前目录](https://www.pelikan.com/images/assets/catalogs/fine-writing-instruments-current-catalog-en.pdf) | M805 Stresemann 18K/750 全铑尖、EF/F/M/B、条纹 cellulose acetate、镀钯亮点及订单号。 |
| [Pelikan 官方 2025 目录](https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf) | 当期目录中的 Stresemann 命名和大尺寸系列导航。 |
| [Pelikan Collectibles M805 Stresemann](https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M800-Basis/M805/M805-Stresemann/index.html) | 约 2015 起、18 ct 金尖、141 mm、13 mm、29.3 g、1.35 ml、灰黑条纹和银色饰件。 |
| [The Pelikan's Perch M805 评测](https://thepelikansperch.com/2015/04/15/pelikan-m805-anthracite-stresemann-review/) | cellulose acetate／树脂／镀钯结构、黄铜活塞、书写姿势、尺寸和样本尖感。 |
| [Pelikan 官方 FAQ](https://www.pelikan.com/int/products/writing/145-international/services/541-faq.html) | 活塞上墨、清水清洗和维修边界。 |
| [Fountain Pen Network M805](https://www.fountainpennetwork.com/forum/topic/301704-pelikan-m805-stresemann/) | 玩家样本补充，限制为体验和识别线索。 |
| [Goldspot M805 评测](https://goldspot.com/blogs/magazine/pelikan-souveran-805-stresemann-fountain-pen-review) | 尖刻和消费级选购背景，价格不写入固有规格。 |
| [The Pencilcase Blog M805](https://www.pencilcaseblog.com/2015/04/pelikan-souveran-m805-stresemann.html) | 独立书写评测的样本补充。 |
| [The Nib & Barrel M805](https://the.nibandbarrel.com/article/impressions-pelikan-souveraen-m805-stresemann) | 包装和版本体验补充。 |

## 身份决策

1. 新增 `m805-editions` 作为 edition_group；已有 Black、Blue-striped、Dark Blue 颜色节点挂其下，Stresemann/Ocean Swirl/Blue Dunes 保持顶层版次节点。
2. 新增 `m805-nib-widths` 及 EF/F/M/B 子节点；尖幅是规格维度，不是新基础型号。
3. M800、M815 Metal Striped、M605、M405 是相邻型号边界，不回填 M805 材料和尖幅。
4. 只维护一条 M805 → Pelikan `made_by` 关系和一条品牌反向导航；不新增实体。
5. 复用已有 Phase 283 SVG；它是事实示意图，不是产品照片、Logo、比例图或颜色校样。

## 字段和冲突决策

- 档案 29.3 g、评测约 0.99–1.03 oz 分开保留，注明套帽、含墨和舍入条件。
- 闭帽约 141 mm、直径约 13 mm、容量约 1.35 ml 作为平台参考，不写成制造公差。
- 18K/750 全铑尖和 EF/F/M/B 来自官方 SKU／目录；个人评测的湿度、线宽和起笔问题不外推所有样本。
- Stresemann 的 cellulose acetate 条纹与 M815 的黄铜金属条纹明确分开，避免银灰图片混名。
- 价格、库存、礼盒、EAN 和零售标题只作为市场或 SKU 线索，不写成永久属性。

## 回归门槛

- 正文 ≥ 8,000 Unicode 字符；来源 ≥ 15、独立组 ≥ 12、variant ≥ 10、primary media = 1。
- checkpoint 后四类内容审核 approved、publication published、readiness blocker_count = 0，实体关系唯一。
- replay 返回 noop 且 hash 不变；真实 `data/fpkg.db` main/WAL/SHM 快照不变。
