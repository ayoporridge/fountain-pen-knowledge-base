# Phase 417 摘要

本阶段深化现有 `phase281-pelikan-m205`（slug `pelikan-m205`），没有新增重复实体。正文以 2005 透明 demonstrator、2009 黑／红／白系列、2015–2023 特别版为时间线，分开银色／铑色饰件、抛光不锈钢尖、差动活塞与相邻 M200/M215/M250/P205 边界；规格同时保留 Pelikan Collectibles 历史表和 2025 官方目录的测量口径。来源、变体、品牌关系和原创 factual SVG 均在 pack 内分层记录。

## 内容包

- 正文：8,616 Unicode 字符（正文目标 ≥8,000）。
- 来源：22 条、22 个 independence groups；含 Pelikan 官方 MAM SKU 971986／823845／816748、官方目录和护理资料、Pelikan Collectibles、The Pelikan’s Perch、Pure Pens、Goulet 与本站原创 SVG。
- 版本：29 条（19 color、4 edition_group、1 material、5 nib）；颜色／尖幅／特别版作为 variant，不拆成重复基础实体。
- 主图：复用 `/images/library/site-original/phase281/pelikan/m205.svg`；正文和 source 明确非产品照片、非 Logo、非真实比例／颜色校样。

## 验证证据

- 定向测试 `tests/content/phase417-pelikan-m205-refresh.test.ts`：1/1 通过，约 92 秒；覆盖空 reviewer、远程选择拒绝、审核—发布、正文字段、22/22 来源组、规格、29 版本、品牌关系、readiness、完整性和 replay noop。
- 持久 owned checkpoint：`.planning/quick/260803-sjm-pelikan-m205-refresh-owned-checkpoint/checkpoint/fpkg.db`。
- 首次 apply：`published`，内容哈希 `sha256:v3:7ffafdb732b0172da4484f4e2e11e8238e9636f9432e10224ec3651f17e479ba`；再次 apply：`noop`，哈希完全相同。
- checkpoint 回读：公开页 `pen/pelikan-m205`，正文 8,616；引用 22/22；variant kind 为 color 19、edition_group 4、material 1、nib 5；readiness `blocker_count=0`、`publishable=1`；当前哈希下 fact/language/media/publication 四项 approved；Pelikan `made_by` 与品牌 reverse 各 1；`PRAGMA integrity_check` 为 `ok`。
- apply 脚本使用项目既有 `recordEntityContentReview`（fact/language/media）与 `publishEntity` 路径，没有直接把 publication 置为 published。
- 真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；本阶段未写入真实库。
- `pnpm exec tsc --noEmit` 仍只有仓库既有 3 条诊断：phase346 Jinhao 测试 TS7022 两条、Turso migration 测试 NODE_ENV TS2741；没有 Phase 417 新诊断。
- Biome targeted check 与 `git diff --check` 通过。

## 未完成范围

本阶段只完成 M205 的 checkpoint 内容包，不代表总 goal 完成。其他未覆盖型号、剩余缺口研究、全部内容包统一正式迁移、全量自动检查、真人遍历、生产部署和线上逐条复查仍需继续；真实数据库与线上站点没有因本阶段改变。
