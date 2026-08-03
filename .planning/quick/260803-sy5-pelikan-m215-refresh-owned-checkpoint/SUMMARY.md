# Phase 418 摘要

本阶段深化现有 `phase281-pelikan-m215`（slug `pelikan-m215`），没有新增重复实体。正文以 2005–2008 四种图案的档案顺序为主线，区分黄铜内层／树脂外壳、银色或铑色饰件、抛光不锈钢尖、差动活塞与 M200、M205、M250、P205 的身份边界；规格保留历史档案与当前官方目录的重量、尺寸和容量口径。

## 内容包

- 正文：8,657 Unicode 字符（正文目标 ≥8,000）。
- 来源：21 条、21 个 independence groups；含 Pelikan MAM 948281／948455 与分类资料、官方目录和护理资料、Pelikan Collectibles、The Pelikan’s Perch、Pen Addict、Penography、Pen Paper Pencil 等。
- 版本：17 条（5 color、5 edition_group、2 market_sku、1 material、4 nib）；图案、尖幅和 SKU 作为 variant，不拆成重复基础实体。
- 主图：复用 `/images/library/site-original/phase281/pelikan/m215.svg`；正文和 source 明确非产品照片、非 Logo、非真实比例／颜色校样。

## 验证证据

- 定向测试 `tests/content/phase418-pelikan-m215-refresh.test.ts`：1/1 通过，最终约 94 秒；覆盖空 reviewer、远程选择拒绝、审核—发布、正文、来源组、规格、版本、品牌关系、readiness、完整性和 replay noop。
- 持久 owned checkpoint：`.planning/quick/260803-sy5-pelikan-m215-refresh-owned-checkpoint/checkpoint/fpkg.db`。
- 首次 apply：`published`，内容哈希 `sha256:v3:2204b857c5d927f1293e8d379ec972ba5eb9ab582b201bec0997875a50fd32d6`；再次 apply：`noop`，哈希完全相同。
- checkpoint 回读：公开页 `pen/pelikan-m215`，正文 8,657；引用 21/21；variant kind 为 color 5、edition_group 5、market_sku 2、material 1、nib 4；readiness `blocker_count=0`、`publishable=1`；当前哈希下 fact/language/media/publication 四项 approved；Pelikan `made_by` 与品牌 reverse 各 1；`PRAGMA integrity_check` 为 `ok`。
- apply 脚本使用项目既有 `recordEntityContentReview`（fact/language/media）与 `publishEntity` 路径，没有直接把 publication 置为 published。
- `pnpm exec tsc --noEmit` 仍只有仓库既有 3 条诊断：phase346 Jinhao 测试 TS7022 两条、Turso migration 测试 NODE_ENV TS2741；没有 Phase 418 新诊断。
- Biome targeted check 与 `git diff --check` 通过。
- 真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；本阶段未写入真实库。

## 未完成范围

本阶段只完成 M215 的 checkpoint 内容包，不代表总 goal 完成。其他未覆盖型号、剩余缺口研究、全部内容包统一正式迁移、全量自动检查、真人遍历、生产部署和线上逐条复查仍需继续；真实数据库与线上站点没有因本阶段改变。
