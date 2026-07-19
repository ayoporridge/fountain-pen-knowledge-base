---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: — 内容百科化与型号扩容（当前）
current_phase: 21
current_phase_name: Taxonomy 与身份归一
status: executing
stopped_at: Quick 260719-4a2 complete; next parallel research wave ready
last_updated: "2026-07-19T16:20:00+08:00"
last_activity: 2026-07-19
last_activity_desc: LAMY 2000 and Platinum #3776 Century sourced, normalized and checkpoint-published
progress:
  total_phases: 16
  completed_phases: 10
  total_plans: 35
  completed_plans: 32
  percent: 91
---

# State: Fountain Pen Knowledge Graph

## Project Reference

See: `.planning/PROJECT.md`（updated 2026-07-15）

**Core value:** 通过可信、完整且彼此关联的内容，让用户持续漫游钢笔知识网络，而不是打开只有标题和关系的空壳页。
**Current focus:** Phase 21 — Taxonomy 与身份归一

## Current Position

Phase: 21 (Taxonomy 与身份归一) — EXECUTING
Plan: 4 of 6
Status: In progress
Last activity: 2026-07-19 — Pilot, Waterman and Aurora identity cleanup published

Progress: [█████░░░░░] 50%

## Performance Metrics

**Velocity:**

- Total plans completed: 14
- Average duration: 22 min
- Total execution time: 153 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 18–26 | 7 | 153 min | 22 min |
| Phase 18 P01 | 8 min | 2 tasks | 11 files |
| Phase 18 P02 | 12 min | 2 tasks | 11 files |
| Phase 18 P03 | 30 min | 3 tasks | 4 files |
| Phase 18 P04 | 32 min | 2 tasks | 9 files |
| Phase 18 P05 | 12 min | 2 tasks | 8 files |
| Phase 18 P06 | 25min | 3 tasks | 14 files |
| Phase 18 P07 | 34 min | 3 tasks | 6 files |
| Phase 19 P01 | 17 min | 2 tasks | 6 files |
| Phase 19 P02 | 52 min | 2 tasks | 3 files |
| Phase 19 P03 | 48 min | 2 tasks | 6 files |
| Phase 19 P04 | 54 min | 3 tasks | 10 files |
| Phase 19 P05 | 34 min | 3 tasks | 10 files |

## Accumulated Context

### Decisions

- v1.2 必须按 Phase 18 → 26 串行推进：publication gate → 真实 audit/evidence → renderer → taxonomy → Montblanc 149 → 现有 305 条实际库存清账 → P0 → P1 → production QA
- 任何新建或迁移实体默认 draft；只有 `public_entities` readiness 无 blocker 后才能原子发布
- 296 篇 deprecated brand/model story 不得批量复活，只能作为重新研究和写作的线索
- 109 项覆盖矩阵是 taxonomy 处理项而非净新增页数；Phase 21 后再锁定 create/merge/split/rename/alias/retire 净量
- P0/P1 在实际库存 69 个品牌、236 个型号清账完成前不得开始；旧 65+231 只作为公开基线追溯，P2 40 项与 P3 2 项不属于 v1.2 承诺范围
- [Phase 18]: Migration ownership scanning runs by default across every TypeScript script; six Plan 18-02 legacy runners are accepted only by exact SHA-256 until 18-02 closes. — This preserves zero-bypass enforcement for new or modified scripts without editing files reserved for the immediately following plan.
- [Phase 18]: FPKG_DATABASE_URL is an isolated server-only file override and is mutually exclusive with Turso. — Fixture mode must fail closed and may never resolve to the real catalog database.
- [Phase 18]: Local Playwright starts through the shared publication fixture harness. — One lifecycle now owns canonical migration, Next child shutdown, client close, and temp cleanup.
- [Phase 18]: Plan-level data-contract and build checks use a temporary catalog copy. — Validation must not open or mutate the real SQLite catalog.
- [Phase 18]: Readiness is recomputed from current source rows; blockers_json is diagnostic only. — A mutable snapshot must never grant public authorization.
- [Phase 18]: Unattached source inserts do not invalidate unrelated entities; source fan-out follows explicit ownership paths. — Owner-aware invalidation avoids global false positives while linked writes still fail closed.
- [Phase 18]: TypeScript computes canonical hashes in one write transaction and SQLite independently guards published transitions. — The database can verify format and state invariants while the server owns deterministic SHA-256 calculation.
- [Phase 18]: Local migrate uses the shared disposable database resolver — Fixture mode must reject the real catalog path and regression tests compare its snapshot.
- [Phase 18]: Middleware routes while server pages authorize content — Database-backed public visibility must not enter the Edge bundle; public_entities remains the sole authorization set.
- [Phase 18]: Core entity APIs use exact no-store DTOs — Public responses stay backward-compatible while IDs and publication internals remain private.
- [Phase 18]: Primary discovery pages consume explicit canonical DTO helpers — Browse, homepage, and dimension parity are now testable against an independent public_entities oracle.
- [Phase 18]: Graph validation uses contextual public-subset semantics — LIMIT results are not equated to the whole universe; each returned hub and degree is independently public-checked.
- [Phase 18]: Primary discovery remains force-dynamic and no-store — Offline publication invalidation cannot safely purge stale Next caches yet.
- [Phase 18]: Secondary candidate, owner, and resolved target reads all authorize through public_entities. — Independent gating prevents a reviewed child record or stale materialization from inheriting visibility from workflow status alone.
- [Phase 18]: Brand pages enumerate the complete reverse made_by public-pen set without representative limits. — The public count and every model link must match canonical membership exactly.
- [Phase 18]: Entity-bearing secondary pages and image responses remain dynamic and no-store. — The project has no unified active purge path, so publication transitions must be visible on the next request.
- [Phase 18]: `public_entities` is the sole public authorization set, and brand pages enumerate the complete reverse public `made_by` set. — Unqualified model URLs are hard 404s; published brands cannot silently omit published models.
- [Phase 19 planning]: A real migration-030 catalog is opened read-only, copied through SQLite online backup, and only the owned copy is canonically migrated to 031 for readiness audit. — This preserves source main/WAL/SHM while allowing contract-v2 measurement.
- [Phase 19 planning]: Source tier and independence group qualify at source-item provenance level, not registry/provider level. — One registry can contain independent documents and one document can have mirrors across registries.
- [Phase 19]: Non-empty WAL audit sources fail closed unless filesystem immutability prevents SQLite from mutating SHM — Readonly and query_only SQLite access can still rewrite SHM during WAL recovery; the adapter rejects unsafe sources before opening and retains before/after snapshot verification.
- [Phase 19]: Canonical migrations and audit child processes run only inside one owned disposable fixture root — A canonical realpath, sanitized database environment, managed children and idempotent cleanup prevent fixture work from falling through to the production catalog.
- [Phase 19]: Only explicit source_items provenance qualifies; registry defaults remain ingestion hints and never unlock publication. — Source independence and tier are document-level facts, so provider defaults cannot confer qualification on every item.
- [Phase 19]: An approved core claim qualifies only through one complete citation-locator-scope-source chain; components from separate chains cannot be stitched together. — A partial citation paired with an unrelated scope or source would create false evidence completeness.
- [Phase 19]: Migration 031 preserves retired rows but demotes every other v1 publication to draft and clears inherited approval metadata. — Contract v1 reviews and hashes cannot grandfather an entity into contract v2 authorization.
- [Phase 19]: public_entities remains the only authorization predicate; blocker JSON is diagnostic only. — Authorization must read ordinary blocker rows and current contract state rather than a mutable diagnostic snapshot.
- [Phase 19]: Canonical IDs are immutable publication identity. — Primary-key rewrites otherwise change the v2 hash without a reliable generic-reference invalidation owner.
- [Phase 19]: Any content revision revokes every prior approved review. — Returning content to an old hash must not reactivate authorization from an earlier revision.
- [Phase 19]: Published authorization snapshots are immutable in place. — Legitimate republish must first demote, then install the current snapshot and final review inside one transaction.
- [Phase 19]: Protected audit sources use checkpointed exclusive copies and are never SQLite-opened — Live verification showed normal and readonly SQLite access can delete or retime sidecars; empty-WAL/no-journal/single-link copies preserve the source while all migration and queries run only on owned files.
- [Phase 19]: Raw inventory, content readiness, and public lifecycle remain separate audit dimensions — The 305-row universe must remain complete while blocker-free drafts are publishable but not legacy/library complete until they are in public_entities.
- [Phase 19]: Audit limits are presentation-only — Canonical NDJSON, CSV, summary, hashes, verdict, and exit semantics derive from the complete sorted universe before any terminal slice.
- [Phase 19]: Final browser acceptance is timeboxed composite evidence with explicit monolithic debt. — The verifier assesses the composite evidence without automatically rerunning the wrapper; if the debt blocks acceptance, it records a validation gap while separate content-track planning may proceed.
- [Phase 19]: Artifact and fixture cleanup is capability-bound and fail-closed; uncertain ownership or surviving children retain owned resources instead of pathname-recursive deletion. — Cleanup safety takes precedence over deleting temporary debris when ownership or process termination cannot be proven.

### Pending Todos

- Phase 20-04 synthetic model browser fixture remains `gaps_found`; it is non-blocking for Phase 21 but must be closed before production release.

### Blockers/Concerns

- Phase 19 前不能假定新门禁下有任何现成可发布样板，initial publishable count 必须全量计算；当前 raw inventory 是 69 brands + 236 pens，旧 65+231 基线不得替代它
- 53 篇 Richard’s Pens 长文的 allowed use 与 223 个缺严格公开型号图条目的媒体获取成本，需在 Phase 23 逐条形成终态
- taxonomy 净量未在 Phase 21 重算前，P0/P1 不使用“新增页数”作为进度指标

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260719-56l | 接入 Montblanc 146、144、No.22，并按主图证据区分公开与阻断草稿 | 2026-07-19 | 9e17e06 | [260719-56l-montblanc-146-144-no-22](./quick/260719-56l-montblanc-146-144-no-22-146-144-no-22-ll/) |
| 260719-6ec | 补齐 Majohn 品牌与 A1 的来源化正文、规格、版本、关系和原创编辑插画 | 2026-07-19 | ea94af7 | [260719-6ec-majohn-a1](./quick/260719-6ec-majohn-a1/) |
| 260719-8b4 | 补齐 TWSBI、Kaweco、Pilot 三个品牌及 ECO、Classic Sport、Custom 74 的来源化内容 | 2026-07-19 | e44405b | [260719-8b4-content-batch-twsbi-kaweco-pilot](./quick/260719-8b4-content-batch-twsbi-kaweco-pilot/) |
| 260719-93j | 补齐 Pelikan 品牌与 canonical Souverän M800，并校正 M800／M805／M815 边界 | 2026-07-19 | cfe5721 | [260719-93j-pelikan-canonical-souver-n-m800-2025-m80](./quick/260719-93j-pelikan-canonical-souver-n-m800-2025-m80/) |
| 260719-9d2 | 补齐 Parker 品牌并拆分 vintage 与 2021 两代 Parker 51 | 2026-07-19 | d2088fb | [260719-9d2-parker-vintage-parker-51-2021-parker-51](./quick/260719-9d2-parker-vintage-parker-51-2021-parker-51-/) |
| 260719-9gh | 补齐 Sailor 品牌与 canonical 1911 Standard／Profit Standard 11-1219 | 2026-07-19 | dabebc1 | [260719-9gh-sailor-canonical-1911-standard-profit-st](./quick/260719-9gh-sailor-canonical-1911-standard-profit-st/) |
| 260719-b0o | 补齐 Parker Ingenuity／Urban／Vector、Sailor Pro Gear／Profit 14／18、Pelikan M1000／M600／2012 White Tortoise | 2026-07-19 | cb6504b / 13edbd6 / 490fd6d | [260719-b0o-p0-parker-sailor-pelikan](./quick/260719-b0o-p0-parker-ingenuity-urban-vector-vector-/) |
| 260719-c1p | 补齐 Sailor 2026 三款、Parker Duofold 四代与 Pelikan M1005／M400／M605／M815 | 2026-07-19 | 6ade8a4 / 74a0672 / c1f5088 / 79e07f5 | [260719-c1p-sailor-parker-pelikan](./quick/260719-c1p-sailor-2026-parker-duofold-pelikan-souveran/) |
| 260719-fco | 补齐 Parker 25、T-1、50 Falcon、100，并迁移 Parker 100 错误品牌别名 | 2026-07-19 | d7de980 / c26f3ed | [260719-fco-parker-25-t1-50-falcon-100](./quick/260719-fco-parker-25-t1-50-falcon-100-sailor-king-o/) |
| 260719-7qk | 发布 Sailor King of Pens 导航层并将长刀研重分类为 nib | 2026-07-19 | 0f97614 | [260719-7qk-sailor-kop-naginata](./quick/260719-7qk-sailor-kop-naginata/) |
| 260719-8rj | 补齐 Pelikan M200 与 Twist P457，并规范化旧中文 slug | 2026-07-19 | 89c6b21 | [260719-8rj-pelikan-m200-p457](./quick/260719-8rj-pelikan-m200-p457/) |
| 260719-9m2 | 发布 Sailor KOP 四个具体型号并收窄长刀研 SKU 边界 | 2026-07-19 | ec33d9b | [260719-9m2-sailor-kop-models](./quick/260719-9m2-sailor-kop-models/) |
| 260719-a1p | 发布 Parker Frontier、Victory 与拆分后的 Premier 两代 | 2026-07-19 | b5de87d | [260719-a1p-parker-frontier-premier-victory](./quick/260719-a1p-parker-frontier-premier-victory/) |
| 260719-b4i | 修复 Pilot 823 duplicate、Waterman 混名与 Aurora 泛型号并补 Aurora 88 | 2026-07-19 | 6bda355 | [260719-b4i-identity-cleanup](./quick/260719-b4i-identity-cleanup/) |
| 260719-4a2 | 补齐 LAMY 品牌／2000 与 Platinum 品牌／#3776 Century，规范 slug 和版本边界 | 2026-07-19 | pending | [260719-4a2-lamy-platinum-content](./quick/260719-4a2-lamy-platinum-content/) |

## Next Action

继续 Phase 23 的外网来源化内容制作，不重做 305 条库存盘点：并行研究 Pilot Capless／Platinum Preppy／LAMY aion 等下一批 identity 清楚的高价值型号，再继续 Parker／Sailor／Pelikan raw 队列并研究缺失的重要品牌。每批坚持官网／目录／可靠专业资料优先、自然中文、精确型号图与完整品牌反向链接；不扩建通用验收框架。生产迁移与全量页面验收留到内容批次完成后执行。

## Session Continuity

Last session: 2026-07-19T02:33:46+08:00
Stopped at: Phase 21 Plan 04 executing; Phase 20-04 gap preserved as a production-release blocker
Resume file: None
