# Phase 419 摘要

本阶段深化现有 `phase284-pelikan-m300`（slug `pelikan-souveran-m300`），没有新增重复实体。正文以 M300 的小尺寸身份、Black／Green-striped 生产色、1998 起时间线、天冠分期、14 ct 金尖、差动活塞和 M320／M350／历史 Pelikan 300 边界为主线，补齐使用、维护、二手验收、规格口径与品牌导航。

## 内容包

- 正文：8,231 Unicode 字符（正文目标 ≥8,000）。
- 来源：16 条、16 个 independence groups；含 Pelikan 官方 MAM 901462、Fine Writing 尺寸资料与护理／FAQ、Pelikan Collectibles、The Pelikan's Perch 的 M3xx 档案和停产报道、本站原创 SVG。
- 版本：12 条（2 color、4 edition_group、1 market_sku、1 material、4 nib）；颜色、尖幅、SKU 与 M3xx 边界作为 variant，不拆成重复基础实体。
- 主图：复用 `/images/library/site-original/phase284/pelikan/m300.svg`；正文和 source 明确非产品照片、非品牌 Logo、非真实比例／颜色校样。

## 验证证据

- 定向测试 `tests/content/phase419-pelikan-m300-refresh.test.ts`：1/1 通过，最终约 90 秒；覆盖空 reviewer、远程选择拒绝、审核—发布、正文、来源组、规格、变体父子、品牌关系、readiness、完整性和 replay noop。
- 持久 owned checkpoint：`.planning/quick/260803-tay-pelikan-m300-refresh-owned-checkpoint/checkpoint-final/fpkg.db`。
- 首次 apply：`published`，内容哈希 `sha256:v3:6872ad229de269adc4cdc63e7ec129121eaba61fb91ef60c1532874003026094`；再次 apply：`noop`，哈希完全相同。
- checkpoint 回读：公开页 `pen/pelikan-souveran-m300`，正文 8,231；引用 16/16；variant kind 为 color 2、edition_group 4、market_sku 1、material 1、nib 4，父子关系 7；readiness `blocker_count=0`、`publishable=1`；当前哈希下 fact/language/media/publication 四项 approved；Pelikan `made_by` 与品牌 reverse 各 1；`PRAGMA integrity_check` 为 `ok`。
- apply 脚本使用项目既有 `recordEntityContentReview`（fact/language/media）与 `publishEntity` 路径，没有直接把 publication 置为 published。
- `pnpm exec tsc --noEmit` 仍只有仓库既有 3 条诊断：phase346 Jinhao 测试 TS7022 两条、Turso migration 测试 NODE_ENV TS2741；没有 Phase 419 新诊断。
- Biome targeted check 与 `git diff --check` 通过。
- 真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；本阶段未写入真实库。

## 未完成范围

本阶段只完成 M300 的 checkpoint 内容包，不代表总 goal 完成。其他短正文型号、缺失品牌与型号、全部内容包统一正式迁移、全量自动检查、真人遍历、生产部署和线上逐条复查仍需继续；真实数据库与线上站点没有因本阶段改变。
