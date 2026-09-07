---
name: promote-visconti-dark-crystal-depth-to-local-catalog
status: complete
created: 2026-09-07
---

# Promote the verified Visconti Dark Crystal depth refresh

## Objective

在当前本地真实资料库的只读快照上重放已完成的 Phase 549 Visconti Homo Sapiens Dark Crystal 深化包：只更新既有 `s49VISDARK` 与其 Visconti 品牌导航，修正当前官方页的 `bayonet` 闭合与烟熏透明／黑色电镀黄铜边界，保留官方页面 18K 与 Au 14K 尖材字段冲突。先在 caller-owned checkpoint 复制上验证首次发布、完整 replay、关系与媒体不变，再以备份和原子替换方式正式迁移本地 `data/fpkg.db`。

## Owned implementation

- Existing verified pack: `scripts/apply-phase549-visconti-dark-crystal-depth.ts`
- Existing data pack: `scripts/data/phase549-visconti-dark-crystal-depth.ts`
- Existing focused test: `tests/content/phase549-visconti-dark-crystal-depth.test.ts`
- This quick directory: `PLAN.md`, `evidence/`, `formal-local/`; database copies remain untracked.

## Explicit non-goals

- 不新建品牌、型号、alias、redirect 或图片；只更新既有 Dark Crystal 与 Visconti brand payload。
- 不把 Crystal Dream、Lava Bronze、Lava Color、Dark Age 的机构、尖材、尺寸或图片回填到本页。
- 不访问 Turso、线上数据库或生产部署；不把本地 checkpoint / route evidence 当作线上完成。
- 不试写真实 `data/fpkg.db`；正式迁移只在所有 checkpoint gates 通过、备份完成且真实库无打开进程后执行。

## Verification contract

1. Source/real DB/WAL/SHM snapshots recorded before any checkpoint write.
2. Checkpoint is an independent regular file with empty WAL/SHM and remote selectors cleared.
3. Focused test, first apply, full replay (`noop`), integrity/foreign-key checks, content/publication/readiness/media/library gates, TypeScript/Biome and route readback pass.
4. Target story includes `bayonet`, `Over`, `EF/F/M/B/S`, and explicit 18K-vs-Au-14K conflict; `Hook Safe` remains only in sibling comparison where sourced.
5. Existing entity IDs, slug/name, aliases, one `made_by` relation, primary media hash and non-target payload digests remain unchanged.
6. Formal local migration records backup, pre/post SHA-256, SQLite integrity and target publication/readiness values; no Turso or production claim.

## Completion note

已完成 caller-owned checkpoint 重放、Dark Crystal 图片/来源注释的 bayonet 一致性修正、byte-identical 本地备份、原子替换与正式库门禁。Turso、线上动态页面、生产部署和人工逐页遍历仍不在本 quick 的完成声明内。
