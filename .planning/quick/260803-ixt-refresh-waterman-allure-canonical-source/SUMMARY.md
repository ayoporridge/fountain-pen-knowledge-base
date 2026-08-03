# Phase 398 Summary

## Status

已完成本批：刷新现有 `phase83-pen-waterman-allure`（slug `waterman-allure`），没有创建或改写 Phase 244 的重复实体。

## Evidence boundary

Waterman 当前网页确认 Allure collection、Fountain Pen 与 S0037650、Fine 不锈钢尖、刷纹不锈钢/漆面边界、法国手工装配、礼盒与缺货状态；官方支持页确认 cartridge/converter 填墨、凉水清洁和尖朝上收纳。Pen Heaven 的长度/重量只绑定 Chrome 样本，Fountain Pen Network 资料只作为 dated sample 和兼容性旁证。

## Safety

所有试验写入仅使用测试创建的 owned checkpoint copy；真实 `data/fpkg.db` 的快照必须保持不变。Phase 244 的重复 `waterman-allure-fountain-pen` 实体不在本包范围内。

## Owned files

- `.planning/content-research/waterman-allure-phase398.md`
- `scripts/data/phase398-waterman-allure-refresh.ts`
- `scripts/apply-phase398-waterman-allure-refresh.ts`
- `tests/content/phase398-waterman-allure-refresh.test.ts`
- `.planning/quick/260803-ixt-refresh-waterman-allure-canonical-source/PLAN.md`
- `.planning/quick/260803-ixt-refresh-waterman-allure-canonical-source/SUMMARY.md`

## Validation evidence

1. `pnpm exec tsx --test tests/content/phase398-waterman-allure-refresh.test.ts` passed. The test uses a disposable owned copy, rejects inherited remote selection, checks content/source/media/spec/variant/readiness/topology contracts, applies through the existing review/publish path, and verifies replay as `noop`.
2. Persistent checkpoint: `.planning/quick/260803-ixt-refresh-waterman-allure-canonical-source/checkpoint/fpkg.db`.
   - `PRAGMA integrity_check`: `ok`
   - Allure: public, `published`, body length `8232`, readiness `0 / [] / 1`
   - Waterman brand: public, `published`, body length `1268`
   - Allure source references: `10` items, `8` independent groups
   - Allure variants: `4` (`Stainless Steel` product code `S0037650`, `Black CT`, two historical/region edition groups)
   - Reviews for the current content hash: fact/language/media/publication all `approved`
   - Exactly one `made_by` relation Allure → Waterman and one reverse navigation relation
   - Checkpoint totals unchanged: `950 entities / 904 public / 642 published`
   - Phase apply returned `published` for both packs; replay returned `noop` for both packs.
3. `pnpm exec tsc --noEmit` shows only the three pre-existing diagnostics (two TS7022 in Phase 346 and one TS2741 in the Turso migration test); no Phase 398 diagnostics. Targeted Biome and `git diff --check` are clean.
4. SHA-256 of real `data/fpkg.db` before and after: `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`.

## Explicit boundary

本批没有迁移真实本地库或 Turso，没有部署站点，也没有进行生产真人遍历或线上逐条复查；全量 goal 仍保持 active，后续仍需继续补齐其它未充分覆盖型号并在最后统一正式迁移和部署。
