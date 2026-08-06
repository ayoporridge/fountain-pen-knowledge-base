# Owned checkpoint integration: Phase 505–545

## Scope

在 owned disposable checkpoint 上顺序重放已提交的 Phase 505–544 内容包（Wancher Dream Pen / Urushi SKU 与 Pilot Prera Iro-ai），再修复 Phase 545 发现的 Wancher Oita Urushi Kurozan duplicate identity。全过程不得写入真实 `data/fpkg.db`、Turso 或线上站点。

## Verification contract

1. 每个 Phase 505–544 包首次应用都经 `CuratedEntityPack` 的审核—发布路径；重放必须是 `noop`。
2. Phase 545 只能在 owned、已迁移的 copy 上执行，并通过 `recordEntityContentReview` 与 `publishEntity`，不得直接把 publication 改成 published。
3. 真实资料库文件的 snapshot/hash 在集成前后保持不变。
4. 顺序运行 migration/integrity、coverage、library contract、entity quality、media、readiness 与身份关系 parity 检查。

## Execution status

- [x] 建立 owned checkpoint 并保护真实 catalog snapshot。
- [x] Phase 505–544 首次重放：40 个 package、116 个实体全部 `published`。
- [x] Phase 505–544 重放：40 个 package、116 个实体全部 `noop`。
- [x] Phase 545：将旧 `/pen/wancher-oita-urushi-kurozan` 退役，永久重定向到 canonical `/pen/wancher-oita-urushi-kurozan-fountain-pen`，写入 merge lineage，并重走审核—发布路径。
- [x] Phase 545 重放：`noop`。
- [x] 顺序审计并保存到 `audit/`；没有向真实 catalog 或远端 Turso 写入。

## Explicit boundary

该 checkpoint 只证明本批次可迁移，不能作为全量内容 goal 完成证明。readiness 仍报告 23 条公开库存 backlog，后续还需继续补齐内容、正式迁移、Turso/生产部署、全站自动检查、真人遍历与线上复查。
