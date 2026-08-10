---
phase: 582
quick_id: 260811-integrate-current-canonical-stack
status: complete
created: 2026-08-11
---

# Phase 582 Plan — integrate the current canonical content stack offline

## Objective

在不连接 Turso、也不修改真实 `data/fpkg.db` 的前提下，把当前已经有独立来源化内容包和
定向回归的 Phase 559、560、561、562、563、564、565、566、578、579、581 按身份安全顺序
重放到同一个 caller-owned checkpoint。该批只复用既有实体/内容包，不扩建通用验收框架，
也不把本地 checkpoint 当作正式资料库。

## Order and invariants

1. 从真实 catalog 复制一个非 symlink owned copy，并迁移到当前 schema；
2. 先加入 559–563 的新型号，再深化 564/565/566、578/579 的 canonical 型号；
3. 最后执行 Phase 581，退休重复 Green Tamamushi 和旧 Oita donor 路由并保留 permanent
   redirect/lineage；
4. 在同一副本上立即 replay 全部 11 个 wrapper，要求首次发布/退休和 replay `noop`；
5. 回读 public/readiness、maker 关系、redirect、quality、真实库 hash，并运行定向
   TypeScript、Biome 与 diff 检查。

## Boundary

该批只是额度恢复前的离线迁移候选副本。Turso 正式迁移、远端读回、生产部署、真人全页面
遍历、线上逐条复查和总 goal 的最终 completion 仍未完成。
