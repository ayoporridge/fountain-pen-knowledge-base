# Phase 399 Summary

## Status

已完成本批：刷新现有 `phase358-waterman-edson`（slug `waterman-edson`），没有创建同名实体。

## Source boundary

Waterman 法国/英国官方 heritage 支持 Expert 1990–92 后 Edson 的早期 1990s 时间窗；日本专业目录支持 Diamond Black 的 S2 210 172/173、18K 铑镀尖、SAN 漆面、C/C 和 155 mm/15 mm/43 g 样本；Waterman 官方维护和零部件支持用于清洁、收纳和维修边界，专业评测用于颜色与使用样本。

## Safety

所有试验写入只允许 Phase 399 自己的 checkpoint copy；真实 `data/fpkg.db` 必须保持原始快照。未跟踪 research、`.next-phase*` 和其它 quick 目录不属于本批。

## Owned files

- `.planning/content-research/waterman-edson-phase399.md`
- `scripts/data/phase399-waterman-edson-refresh.ts`
- `scripts/apply-phase399-waterman-edson-refresh.ts`
- `tests/content/phase399-waterman-edson-refresh.test.ts`
- `.planning/quick/260803-j83-refresh-waterman-edson-canonical-sourced/PLAN.md`
- `.planning/quick/260803-j83-refresh-waterman-edson-canonical-sourced/SUMMARY.md`

## Validation evidence

1. `pnpm exec tsx --test tests/content/phase399-waterman-edson-refresh.test.ts` passed. It exercises an owned copy, inherited-remote rejection, review/publish, identity/topology, source/media/spec/variant/readiness contracts and replay `noop`.
2. Persistent checkpoint: `.planning/quick/260803-j83-refresh-waterman-edson-canonical-sourced/checkpoint/fpkg.db`.
   - `PRAGMA integrity_check`: `ok`
   - Edson: public, `published`, body length `8070`, readiness `0 / [] / 1`
   - Waterman brand: public, `published`, body length `1606`
   - Edson references: `12` items and `12` independent groups
   - Six variants: Diamond Black F `S2 210 172`, Diamond Black M `S2 210 173`, Sapphire, Ruby, Emerald, and 125 ans edition group
   - Current content hash reviews: fact/language/media/publication all `approved`
   - Exactly one `made_by` Edson → Waterman relation and one reverse navigation relation
   - Checkpoint totals: `950 entities / 904 public / 642 published`
   - Phase apply returned `published` for both packs; replay returned `noop` for both packs.
3. Targeted TypeScript/format checks have no Phase 399 diagnostics; full `pnpm exec tsc --noEmit` retains only the three pre-existing diagnostics from Phase 346 and the Turso migration test. `git diff --check` is clean.
4. Real `data/fpkg.db` SHA-256 before and after remains `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`.

## Explicit boundary

本批没有迁移真实本地库或 Turso，没有部署站点，也没有生产真人遍历或线上逐条复查；全量 goal 仍保持 active，后续继续处理其它品牌／型号缺口。
