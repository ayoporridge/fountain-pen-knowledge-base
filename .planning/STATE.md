---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: — 内容百科化与型号扩容（当前）
current_phase: 18
current_phase_name: 统一发布门禁）
status: executing
stopped_at: Completed 18-03-PLAN.md
last_updated: "2026-07-15T12:27:04.922Z"
last_activity: 2026-07-15
last_activity_desc: Completed 18-03 publication schema, invalidation, and atomic publish contract
progress:
  total_phases: 16
  completed_phases: 7
  total_plans: 14
  completed_plans: 10
  percent: 71
---

# State: Fountain Pen Knowledge Graph

## Project Reference

See: `.planning/PROJECT.md`（updated 2026-07-15）

**Core value:** 通过可信、完整且彼此关联的内容，让用户持续漫游钢笔知识网络，而不是打开只有标题和关系的空壳页。
**Current focus:** Phase 18 — 统一发布门禁

## Current Position

Phase: 18 of 26（v1.2 phase 1 of 9 — 统一发布门禁）
Plan: 3 of 7 in current phase
Status: Ready to execute
Last activity: 2026-07-15 — Completed 18-03 publication schema, invalidation, and atomic publish contract

Progress: [███████░░░] 71%

## Performance Metrics

**Velocity:**

- Total plans completed: 3
- Average duration: 17 min
- Total execution time: 50 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 18–26 | 3 | 50 min | 17 min |
| Phase 18 P01 | 8 min | 2 tasks | 11 files |
| Phase 18 P02 | 12 min | 2 tasks | 11 files |
| Phase 18 P03 | 30 min | 3 tasks | 4 files |

## Accumulated Context

### Decisions

- v1.2 必须按 Phase 18 → 26 串行推进：publication gate → 真实 audit/evidence → renderer → taxonomy → Montblanc 149 → 现有 296 清账 → P0 → P1 → production QA
- 任何新建或迁移实体默认 draft；只有 `public_entities` readiness 无 blocker 后才能原子发布
- 296 篇 deprecated brand/model story 不得批量复活，只能作为重新研究和写作的线索
- 109 项覆盖矩阵是 taxonomy 处理项而非净新增页数；Phase 21 后再锁定 create/merge/split/rename/alias/retire 净量
- P0/P1 在现有 65 个品牌、231 个型号清账完成前不得开始；P2 40 项与 P3 2 项不属于 v1.2 承诺范围
- [Phase 18]: Migration ownership scanning runs by default across every TypeScript script; six Plan 18-02 legacy runners are accepted only by exact SHA-256 until 18-02 closes. — This preserves zero-bypass enforcement for new or modified scripts without editing files reserved for the immediately following plan.
- [Phase 18]: FPKG_DATABASE_URL is an isolated server-only file override and is mutually exclusive with Turso. — Fixture mode must fail closed and may never resolve to the real catalog database.
- [Phase 18]: Local Playwright starts through the shared publication fixture harness. — One lifecycle now owns canonical migration, Next child shutdown, client close, and temp cleanup.
- [Phase 18]: Plan-level data-contract and build checks use a temporary catalog copy. — Validation must not open or mutate the real SQLite catalog.
- [Phase 18]: Readiness is recomputed from current source rows; blockers_json is diagnostic only. — A mutable snapshot must never grant public authorization.
- [Phase 18]: Unattached source inserts do not invalidate unrelated entities; source fan-out follows explicit ownership paths. — Owner-aware invalidation avoids global false positives while linked writes still fail closed.
- [Phase 18]: TypeScript computes canonical hashes in one write transaction and SQLite independently guards published transitions. — The database can verify format and state invariants while the server owns deterministic SHA-256 calculation.

### Pending Todos

None.

### Blockers/Concerns

- Phase 19 前不能假定新门禁下有任何现成可发布样板，initial publishable count 必须全量计算
- 53 篇 Richard’s Pens 长文的 allowed use 与 223 个缺严格公开型号图条目的媒体获取成本，需在 Phase 23 逐条形成终态
- taxonomy 净量未在 Phase 21 重算前，P0/P1 不使用“新增页数”作为进度指标

## Next Action

执行 `18-04-PLAN.md`，让主详情与 browse/sitemap/API surface 统一读取 `public_entities`。

## Session Continuity

Last session: 2026-07-15T12:27:04.916Z
Stopped at: Completed 18-03-PLAN.md
Resume file: None
