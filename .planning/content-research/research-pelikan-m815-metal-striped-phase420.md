# Pelikan Souverän M815 Metal Striped：Phase 420 研究记录

## 研究范围

- 目标是深化已有实体 `2muSiS2rOSd7`（`pelikan-souveran-m815-metal-striped`），不是新建 Black 或 Blue 两个基础实体。
- 直接版本限定为 2018 Metal Striped Black 与 2025 Metal Striped Blue；1995 Wall Street 的 M815 编号作为历史边界单独说明。
- 本阶段只把内容包应用到 owned checkpoint copy，正式真实库迁移另行执行。

## 证据层级

| 证据 | 用途 | 结论 |
| --- | --- | --- |
| [Pelikan Passion 官方 Blue 产品页](https://www.pelikan-passion.com/de/writing/premium/souveraen/souveraen-815-metal-striped-blue.html?fwiRefId=239) | 当期产品字段 | Blue 为 Special Edition；黄铜基材、镀钯色饰件、18K/750 全镀铑 EF/F/M/B、差动活塞、14.1 cm、36 g、德国制造/组装语境。 |
| [Pelikan MAM 809269](https://mam.pelikan.com/mam/en/pelikan/products/809269) | 官方历史产品记录 | 2018 M815 Metal Striped M、产品号 809269、M800 分类和赠盒/产品图资产。 |
| [Pelikan Collectibles M815](https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M800-Basis/M815/M815-Metal-Striped/index.html) | 专业档案 | Black 生产年 2018、18 ct 尖、141 mm、13 mm、38 g、1.35 ml。 |
| [The Pelikan's Perch 2018 review](https://thepelikansperch.com/2018/07/21/pelikan-m815-metal-striped-review/) | 实物评测 | 黄铜条纹增重、镀钯饰件、墨窗和带帽约 1.31 oz 样本；握位饰环积墨后的电镀风险提示。 |
| [The Pelikan's Perch Blue announcement](https://thepelikansperch.com/2025/04/30/pelikan-m815-metal-striped-blue-announced/) | 版本发布资料 | Blue 继承 Black 的 Metal Striped 路线；公布资料约 14.09 cm、37.13 g、约 1.35 ml。 |
| [Hamelin/Pelikan 2025 新闻稿](https://de.hamelinbrands.com/wp-content/uploads/sites/7/2025/05/Pressemitteilung-Pelikan-M815-Metal-Striped-Blue.pdf) | 官方新闻稿 | Blue 的深蓝树脂、镀钯黄铜条纹、黄铜芯、18K 金尖及 2025 年 6 月选定经销商发售。 |
| [Pelikan 2018 年报](https://www.pelikan.com/images/assets/picb/Pelikan_Annual_Report_2018_part-2.pdf?download=) | 发行背景 | M815 Metal Striped 出现在 2018 年 Souverän Series 800 新产品清单。 |
| [Scrively Black/Blue 对照](https://scrively.org/comparative-overview-pelikan-m815-metal-stripe-blue-black/) | 独立对照 | 两版均为树脂与镀钯黄铜条纹、18K 镀铑尖和活塞；Blue 官方尖幅为 EF/F/M/B。 |
| [Fountain Pen Network M815 讨论](https://www.fountainpennetwork.com/forum/topic/343906-pelikan-m815-metal-striped/) | 玩家补充 | 只作条纹视觉、重量/重心和书写体验的补充，不替代规格档案。 |
| [Forbes 2018 发布报道](https://www.forbes.com/sites/nancyolson/2018/06/18/pelikan-debuts-the-m815-metal-striped-fountain-pen-new-look-new-materials/) | 当期公开新闻 | 用于确认 2018 发布语境，不用于精确规格或库存。 |
| [STAs Stationery Station Blue](https://www.stationerystation.co.jp/category/PELIKAN/4012700827678.html) | 地区零售 SKU | 记录 Blue 的日本市场特别生产品线和条码线索，不外推库存。 |
| [Pen-house Blue](https://www.pen-house.net/item/47926.html) | 地区零售 SKU | 补充 Blue 的日本零售页面和市场存在性，不把价格当固有规格。 |
| [Pelikan 官方护理 PDF](https://www.pelikan-passion.com/images/assets/fwi_warranty_current.pdf) | 维护 | 长期停用前排空，冷水吸排，避免热水、肥皂和酒精。 |

## 身份和关系决策

1. 复用已有 `Pelikan Souverän M815 Metal Striped` 实体；Black 与 Blue 作为 `material` variant，挂在 `edition_group` 父级 `M815 Metal Striped editions` 下。
2. 新增 `nib` 父级和 EF/F/M/B 子级，强调尖幅是规格维度而非新基础型号。
3. M805 Stresemann、标准 M800、1995 M815 Wall Street 为顶层边界 variant，不作为 Metal Striped 子版本。
4. 只保留一条 `made_by` 指向 Pelikan 品牌，并补一条品牌反向导航；不在正文写数据库关系 token。
5. 使用已有原创 SVG；它是事实示意图，不是产品照片、Logo、比例图或颜色校样。

## 版本字段决策

- Black：保留档案 38 g 与评测样本约 37.1 g，分别写清称量条件。
- Blue：官方当前页 36 g 为主值，发布资料约 37.13 g 作为时间/口径差异。
- 尺寸：Black 档案 141 mm、13 mm；Blue 官方闭帽 14.1 cm；不合并成无版本前缀的单一规格。
- 尖：Black 仅把 18 ct 作为档案事实；Blue 使用官方 18K/750、EF/F/M/B。
- 上墨：两版均为差动活塞、瓶装钢笔墨；约 1.35 ml 为来源化参考。

## 回归门槛

- 正文至少 8,000 Unicode 字符，覆盖身份、历史、规格差异、使用维护、二手选购、相邻型号边界和媒体免责声明。
- 至少 15 个来源、12 个独立来源组、10 个 variant、1 个 primary media。
- checkpoint 迁移后四类审核（fact/language/media/publication）均 approved，publication published，readiness blocker 为 0。
- replay 必须返回 noop 且内容 hash 不变；真实 `data/fpkg.db` 的 main/WAL/SHM 快照不变。
