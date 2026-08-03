# Pelikan Souverän M300 Phase 419 研究记录

## 研究范围

- 目标实体：已有 `phase284-pelikan-m300` / `pelikan-souveran-m300`，只深化内容，不新增型号。
- 重点：M300 的小尺寸身份、Black 与 Green-striped 两种生产色、1998 起的生产阶段、M3xx（M300/M320/M350）边界、14 ct 尖、差动活塞、维护与二手验收。
- 不把历史 Pelikan 300、M320 特别版或 M350 vermeil 帽路线并入 M300；颜色、尖幅、天冠阶段和市场 SKU 用 variant／范围记录。

## 证据分层

1. Pelikan Collectibles 的 M300/M320/M350 档案：列出 M300 1998 起、Black 1998–2008、Green-striped 1998 起、14 ct 尖、闭帽 110 mm、直径 10 mm、重量 11.0 g、容量 0.65 ml，并给出 M320 与 M350 的相邻生产范围。
2. Pelikan 官方 MAM 901462：作为 M300 Black-Green 的官方产品记录和 SKU 身份来源；MAM 页面在本次网页工具中偶发超时，但已有项目原始 pack 保存 URL 与字段摘要，正文不依赖实时库存。
3. Pelikan 官方 Fine Writing PDF 702326：提供当前资料约 110 mm、9.9 mm、10.7 g、0.7 ml 的另一舍入口径；正文与历史档案分层，不拼成一个精确值。
4. The Pelikan's Perch 的 M3xx 数据库与 2020 文章：补充天冠双雏／单雏／镀金单雏阶段、M3xx 尖幅历史、M300 的便携场景、小尺寸与 2020 停产报道。该站用于专业二级交叉核对，不把个人估值或库存外推为官方结论。
5. Pelikan 官方 FAQ／护理页：只支持差动活塞上墨、排空、冷水吸排和避免热水／肥皂／酒精的维护边界。
6. 本站已有 Phase 284 SVG：复用 `/images/library/site-original/phase284/pelikan/m300.svg`，明确 factual SVG、非产品照片、非品牌 Logo、非比例图、非颜色校样。

## 关键判断

- M300 的“300”不能按数字顺序理解为 M200 的大号；现代 M300 是 Souverän M3xx 小尺寸路线，历史 Pelikan 300 是另一时代、另一实体。
- Black 与 Green-striped 是同一 M300 的 `color` variants；M320 的 Orange/Jade Green/Ruby Red/Pearl 与 M350 Black/Vermeil 不复制到 M300。
- M300 常规尖是 14C-585 双色金尖；M350 的 18C-750 不回填。M3xx 小尖不能因为可旋入而当作 M400 尖的原厂互换。
- 0.65 ml 与官方资料约 0.7 ml 是历史表与当前目录的不同舍入口径；页面保留来源与测量条件。
- 停产消息采用“专业文章报道／档案生产窗口”的范围词；不把 2020 行业消息写成每个市场的同日公告，也不写固定价格或产量。

## 待回归证据

- 内容包正文至少 8,000 Unicode 字符，summary 60–160 Unicode 字符。
- 来源 ≥15 条且 independence group 不重复；变体包含 Black、Green-striped、M3xx 相邻边界、14 ct 尖幅和天冠阶段。
- checkpoint-only 首次 apply 必须通过 `recordEntityContentReview`（fact/language/media）与 `publishEntity`；重放返回 `noop` 且哈希相同。
- 回读公开页、规格、来源组、变体父子关系、审核状态、readiness、Pelikan 生产者关系、reverse 关系和 `PRAGMA integrity_check`。
- 真实 `data/fpkg.db` 指纹必须保持 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。
