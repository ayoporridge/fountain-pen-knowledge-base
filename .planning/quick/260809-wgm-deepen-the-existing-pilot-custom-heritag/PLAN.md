# Plan: deepen the existing Pilot Custom Heritage 91 canonical

## Goal

在不触碰 Turso 或真实 `data/fpkg.db` 的前提下，为已经存在的 Pilot Custom Heritage 91 canonical 补充来源化正文、规格、版本边界与选购维护内容，并在 Phase 555 owned checkpoint 中验证幂等发布。

## Scope

- 只更新既有 pen entity `NpJibLHczSl9` / `pilot-custom-heritage-91`，不创建重复实体。
- 复用 Phase 108 的 canonical pack、品牌关系与原创示意图；新增独立 depth pack 与定向回归。
- 以 Pilot 官方 Custom Heritage、产品目录、国际保修与 converter/cleaning 资料为主，专业资料只做体验或历史交叉核对；不把价格快照写成当前全球价格。
- 所有 SQLite 写入只针对 `.planning/quick/260809-wgm.../checkpoint/catalog-phase556.db`，并保留真实 catalog 快照不变。
- 不扩展搜索、LLM、Playwright、通用验收 runner 或 readiness 基础设施。

## Verification

- official-source research and reviewed Markdown body (>= 5,000 Unicode chars)
- targeted Phase 556 test: first publish, exact current-hash reviews, evidence graph, unique `made_by`, replay noop, protected DB unchanged
- targeted Biome, `pnpm exec tsc --noEmit`, SVG XML check, `check:library`
- `audit-entity-quality`, `audit-library-coverage`, `audit-readiness-v2` on the resulting owned checkpoint
- stage only this quick's PLAN/SUMMARY/evidence and the five owned product files; never stage unrelated research, `.next-phase*`, protected Montblanc quick, checkpoint DB/WAL/SHM, or raw readiness output

## Completion boundary

This quick task creates an offline, migration-ready content package only. Formal migration to the real catalog, Turso readback, production deployment and live-page review remain open for the full goal.
