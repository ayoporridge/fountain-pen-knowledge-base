# Phase 307 完成摘要

## 结果

- 新增独立品牌：`Graf von Faber-Castell`（`graf-von-faber-castell`）。
- 新增型号系列：`Graf von Faber-Castell Intuition`（`graf-von-faber-castell-intuition`）。
- 现有 `Graf von Faber-Castell Classic` 保留原实体 ID，但 `brand_entity_id` 与 `made_by` 已改为新 GvFC 品牌；普通 Faber-Castell 旧 `made_by` 关系清零。
- 拓扑修正导致普通 Faber-Castell 品牌 publication hash 变化，脚本通过既有 `recordEntityContentReview` 与 `publishEntity` 重新审核发布，8 个普通型号的 `made_by_brand_not_public` blocker 清零。

## Owned checkpoint

- 初始 checkpoint：`/Users/xz/.fpkg-phase307-gvfc-intuition-owned-QuUc6s/catalog.db`。
- 关系副作用修复后的最终 checkpoint：`/Users/xz/.fpkg-phase307-gvfc-intuition-owned-final-AO0dtB/catalog.db`。
- 最终 checkpoint 首次运行结果为已有内容 `noop`，普通 Faber-Castell 品牌恢复为 `published`；再次运行三项均为 `noop`。
- 正式本地迁移前备份：`/Users/xz/.fpkg-real-backup-20260728/fpkg.db.before-phase307-gvfc-intuition-brand-refresh`。

## 本地正式库证据

- `data/fpkg.db` fingerprint：size `53563392`，inode `74488502`，mtimeNs `1785189985490872283`，SHA-256 `23f2c809e5c33f06b0526414e7fd5edd11e1575c992817c0bdcf068d22e638eb`。
- 公开实体：814（article 255、brand 105、concept 10、nib 2、pen 442）。
- 公开主媒体：562/562 healthy。
- `Graf von Faber-Castell` 与普通 `Faber-Castell` 均为 `published`，blocker 为 0。

## 验证

- Phase 307 定向测试：通过；包含 owned-copy、远端环境拒绝、首跑/重放、内容、规格、关系和四类 current-hash review 检查。
- `pnpm exec tsc --noEmit`：通过。
- `pnpm exec tsx scripts/check-evidence-contract.ts --all`：通过。
- `pnpm exec tsx scripts/check-audit-readiness.ts --readonly-isolation`：通过。
- `pnpm exec tsx scripts/check-public-boundary.ts`：通过。
- `pnpm exec tsx scripts/check-article-content.ts`：255 篇公开文章通过。
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path .../data/fpkg.db`：569 entities，duplicate 0、thin 0、made_by blockers 0。
- `pnpm exec tsx scripts/audit-public-media.ts`：562/562 healthy。

## 未完成项

- 远端 Turso 迁移仍被 `SQL read operations are forbidden` 权限阻断，未声称线上已更新。
- 全量品牌/型号审计、真人全页面遍历、生产部署与线上逐条复查仍属于总 goal 的后续工作。
