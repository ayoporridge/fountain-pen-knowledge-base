---
phase: 18-publication-gate
verified: 2026-07-15T14:29:34Z
status: passed
score: 16/16 must-haves verified
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 15/16
  gaps_closed:
    - "`--core-detail` 现在 await async middleware，并分别验证 draft hard 404/no-store/noindex/no redirect 与 public pass-through。"
  gaps_remaining: []
  regressions: []
---

# Phase 18: 统一发布门禁 Verification Report

**Phase Goal:** 公开页面只来自同一个可计算、可失效的 `public_entities` 真相集合，新建或未达标实体不会再以空壳形式泄漏。
**Verified:** 2026-07-15T14:29:34Z
**Status:** passed
**Re-verification:** Yes — after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 新建实体默认 draft；未达标、retired、身份未决条目从详情与发现入口消失，直接访问 hard 404，canonical 合并项 308 跳转 | ✓ VERIFIED | 030 的 insert/type triggers 默认 draft；fresh-build Playwright 4/4 覆盖 Majohn A1、Montblanc 149 的 GET/HEAD hard 404、no-store、noindex、无 JSON-LD；middleware 直接探针得到 canonical 308。 |
| 2 | 列表、逐 ID、聚合、上下文子集和品牌反向型号分别按正确语义与 `public_entities` 对齐 | ✓ VERIFIED | `pnpm check:public-boundary -- --all`：31 个 exact identities、逐 ID equivalence、keyed aggregates、context subsets、19/19 reverse models 全部通过。 |
| 3 | 正文、摘要、规格、证据、版本或主图变化后旧审核立即失效，复审前不公开 | ✓ VERIFIED | `--migration-full` 的 12 表 × I/U/D 共 36 mutation matrix 通过；Playwright 覆盖 critical edit 200→404→复审 200。 |
| 4 | 迁移只建立显式 draft/backlog，不复活 deprecated stories 或 grandfather 旧品牌/型号 | ✓ VERIFIED | `--migration-full` 覆盖 fresh、synthetic pre-030、当前目录库 disposable copy、idempotency；stories 逐行不变，brand/pen 均 draft/published=0。 |
| 5 | 每个公开型号恰好关联一个公开 canonical 品牌；品牌页完整反列全部型号且不截断 | ✓ VERIFIED | DB readiness/cardinality gate 通过；independent oracle 为 19/19；浏览器 fixture 的 15 个型号全部出现、数量为 15、每个型号只链接唯一品牌。 |
| 6 | 十个 importer 只做 readiness preflight，migration ownership 集中到 canonical owner；pending migration 时业务写入与 marker 均不变 | ✓ VERIFIED | `pnpm check:migrations -- --migration-ownership` 扫描 100 个 scripts，通过 synthetic bypass 与 pending importer fail-closed fixture。 |
| 7 | seed/import migration ownership 收敛，fixture DB 可注入且拒绝真实 `data/fpkg.db`/Turso 混用 | ✓ VERIFIED | `src/lib/db.ts` 的 `resolveDatabaseConnection`、`migrateDatabase`、`assertDatabaseReady` 已接线；所有复验均使用临时 file DB，主库快照守卫通过。 |
| 8 | readiness v1 从当前原始数据计算，diagnostic snapshot 不参与授权 | ✓ VERIFIED | `publication_blockers`、`public_entity_readiness`、`public_entities` 为实时 views；public view 不读取 `blockers_json` 授权，migration contract fixture 通过。 |
| 9 | publish 只能走 bounded transaction；DB transition guard、rollback、no-retry 与 public membership assertion 同时成立 | ✓ VERIFIED | `src/lib/publication.ts` 在单 write transaction 中 hash→review→readiness→publish→membership；`--migration-full` direct-SQL/rollback/atomic publish 全绿。 |
| 10 | brand/pen create 与四类 type transition 不继承旧审核 | ✓ VERIFIED | 030 的 `publication_entity_insert_draft` / `publication_entity_type_reset` 与 migration-full type-transition matrix 通过。 |
| 11 | detail、metadata、sitemap、entity APIs 使用 canonical view，API DTO 不泄漏 publication internals，响应 dynamic/no-store | ✓ VERIFIED | 实际 route 均从 `public_entities`/`getPublicEntityBySlug` 读取；independent per-ID/API key checks 通过；fresh build 显示相关 route 为 dynamic。 |
| 12 | browse/home/by/graph/links 对所有 entity role 使用同一公开集合，聚合准确且无共享 TTL/SWR | ✓ VERIFIED | `src/lib/browse-data.ts`、graph、links 接线到 public view；all-parity 的 list/aggregate/subset 分类检查通过；相关 page/API 为 force-dynamic/no-store。 |
| 13 | recommend、concept/wiki、library/source/media/diagram/exhibit/timeline 对 candidate、target、owner 均 fail closed | ✓ VERIFIED | all-parity 覆盖 recommendation、concept materialization/readback、wiki href、source/media/diagram/timeline/exhibit target 与 image owner；draft targets 均缺席。 |
| 14 | expected oracle 不复用 runtime visibility/browse/recommend/library 授权 predicate，四类语义分开比较 | ✓ VERIFIED | `expectedPublicCte` 由已知 fixture IDs 与 raw SQL 构造；actual surfaces 才动态 import runtime 模块；失败按 list/per-ID/aggregate/subset 分桶。 |
| 15 | Montblanc 149 与 Majohn A1 draft shell 全面缺席；valid synthetic fixtures 同现，旧数量/真实目录/cache E2E 假设已移除 | ✓ VERIFIED | targeted E2E 4/4；`site-quality.spec.ts` 与 `library.spec.ts` 改为 disposable exact sets/no-store/full sitemap，不再读取真实目录或断言 >500/>=550。 |
| 16 | Phase 18 所有已声明 checker 入口保持可运行并与最终 hard-404 契约一致 | ✓ VERIFIED | 修复提交 `1388cd8` await async middleware；`--core-detail` 独立复跑通过，并同时断言 draft 404/no-store/noindex/no location 与 public `x-middleware-next=1`。 |

**Score:** 16/16 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `migrations/030_publication_gate.sql` | publication schema、views、triggers、DB guard | ✓ VERIFIED | 1143 行；fresh/upgrade/idempotent/invalidation/publish matrix 通过。 |
| `src/lib/publication.ts` | canonical hash 与 atomic publication transaction | ✓ VERIFIED | 602 行；hash stability、rollback、republish 均有行为证据。 |
| `src/lib/db.ts` | canonical migration owner、readiness guard、fixture connection | ✓ VERIFIED | migration ownership、fresh replay、disposable build 通过。 |
| `scripts/check-migration-safety.ts` | ownership + pending migration gate | ✓ VERIFIED | 100 scripts 全扫和代表 importer fail-closed 通过。 |
| `scripts/check-publication-gate.ts` | isolated migration/publication harness | ✓ VERIFIED | `--migration-full`、`--compatibility` 均通过。 |
| `src/lib/public-visibility.ts` | alias-safe public filter 与 direct lookup | ✓ VERIFIED | 查询直接依赖 `public_entities`，detail/API/sitemap 已使用。 |
| `src/lib/browse-data.ts` | public-only rows/facets/home/by aggregates | ✓ VERIFIED | independent keyed equality 通过。 |
| `src/lib/library.ts` | owner-aware secondary discovery 与完整品牌型号 | ✓ VERIFIED | `getBrandPublicModels` 无 LIMIT/slice，reverse equality 通过。 |
| `src/middleware.ts` | pre-render entity hard 404 与 canonical redirect | ✓ VERIFIED | browser hard 404 和 direct canonical 308 均通过。 |
| `tests/e2e/publication-gate.spec.ts` | isolated browser publication lifecycle | ✓ VERIFIED | fresh disposable build 后 4/4。 |
| `scripts/check-public-boundary.ts` | independent four-semantics oracle及所有计划 checker flags | ✓ VERIFIED | `--core-detail` 与默认 `--all` 在 re-verification 中均通过。 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| importers/seeds | `src/lib/db.ts` | `assertDatabaseReady` / `migrateDatabase` | ✓ WIRED | ownership scan + pending fixture。 |
| `playwright.config.ts` | publication harness | isolated `webServer` command | ✓ WIRED | targeted E2E 实际启动临时 DB server。 |
| 12 critical tables | `entity_publications.content_revision` | I/U/D triggers | ✓ WIRED | 36 mutation matrix。 |
| `publishEntity` | readiness/public view | single write transaction recheck | ✓ WIRED | publish/rollback/membership behavior passing。 |
| detail/list/aggregate/context surfaces | `public_entities` | direct view/helper/alias-safe filter | ✓ WIRED | independent four-semantics oracle passing。 |
| secondary source/media/diagram records | public owner | owner joins + path resolution | ✓ WIRED | subset and image 404 checks passing。 |
| brand page | reverse `made_by` public pens | `getBrandPublicModels` → `BrandMuseum` | ✓ WIRED | 15 rendered links and 19/19 oracle sets。 |
| middleware | public slug lookup | async `getPublicEntityBySlug` before render | ✓ WIRED | actual hard 404 behavior passing。 |
| legacy `--core-detail` branch | async middleware | awaited direct invocation | ✓ WIRED | draft hard 404 与 public pass-through 两条分支均由实际命令验证。 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| Entity detail/metadata | `entity` | `getPublicEntityBySlug` → `public_entities` | Yes | ✓ FLOWING |
| Browse/home/by | rows、counts、facets | raw tables constrained by public view membership | Yes | ✓ FLOWING |
| Brand model panel | `models/count` | reverse `made_by` joined to public brand + public pens | Yes | ✓ FLOWING |
| Graph/recommend/wiki/concept | contextual targets | gated runtime queries/materialized readback | Yes | ✓ FLOWING |
| Library/media/exhibit/timeline | owner/target records | owner-aware joins and canonical path resolution | Yes | ✓ FLOWING |
| Publication lifecycle | status/hash/revision | raw critical rows → triggers/hash/readiness → transaction | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Migration ownership and importer fail-closed | `pnpm check:migrations -- --migration-ownership` | 100 scripts scanned; pending 030 marker/business rows unchanged | ✓ PASS |
| Full migration/publication matrix | `pnpm check:publication-gate -- --migration-full` | 6/6 categories PASS | ✓ PASS |
| Non-brand compatibility | `pnpm check:publication-gate -- --compatibility` | bidirectional EXCEPT empty; strict explicit-row lifecycle PASS | ✓ PASS |
| Four public-surface semantics | `pnpm check:public-boundary -- --all` | 31 identities; 19/19 complete reverse models | ✓ PASS |
| Current source compiles against disposable DB | `PUBLICATION_GATE_FIXTURE=1 FPKG_DATABASE_URL=file:/tmp/... pnpm build` | Next 15.5.18 production build succeeded | ✓ PASS |
| Hard 404/full model/state lifecycle | `pnpm exec playwright test tests/e2e/publication-gate.spec.ts --project=desktop` | 4 passed after fresh build | ✓ PASS |
| Canonical redirect | direct middleware request for legacy Pilot 823 path | 308 → `/pen/pilot-custom-823` | ✓ PASS |
| Declared Plan 04 core detail check | `pnpm check:public-boundary -- --core-detail` | fail-closed core detail regression passed | ✓ PASS |
| Static quality | `pnpm lint` | exit 0; one unrelated pre-existing CSS warning | ✓ PASS |

### Probe Execution

No `probe-*.sh` path is declared by Phase 18. The executable checker commands above are recorded as behavioral spot-checks.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| PUB-01 | 18-01/02/03/07 | independent draft lifecycle | ✓ SATISFIED | migration/type/default/404 fixtures。 |
| PUB-02 | 18-03/07 | versioned zero-blocker readiness | ✓ SATISFIED | raw computed views + DB/transaction guards。 |
| PUB-03 | 18-04/05/06/07 | all public surfaces share canonical set | ✓ SATISFIED | independent four-semantics `--all`。 |
| PUB-04 | 18-04/05/06/07 | unpublished absent, hard 404, redirect | ✓ SATISFIED | browser 404 + canonical 308。 |
| PUB-05 | 18-03/04/05/06/07 | critical mutation invalidates review | ✓ SATISFIED | 36-mutation matrix + browser state chain。 |
| PUB-06 | 18-01/02/03/07 | no grandfather/resurrection | ✓ SATISFIED | copy-upgrade/backfill invariance。 |
| PUB-07 | 18-03/06/07 | unique public brand + complete reverse models | ✓ SATISFIED | DB cardinality + 19/19 oracle + 15-link browser fixture。 |

`REQUIREMENTS.md` 仍把 PUB-03/PUB-04 标为 Pending；这是 orchestration metadata 尚未在 Phase 18 验收后更新，不改变上述实现证据。

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `src/app/globals.css` | 834 | `!important` | ℹ️ Info | Biome warning；文件不属于 Phase 18 修改范围，不影响 publication goal。 |

未在 Phase 18 核心修改文件中发现无引用的 `TBD`、`FIXME` 或 `XXX` debt marker。

### Human Verification Required

None. 本阶段的可观察结果均由 disposable DB、fresh production build 与真实浏览器请求覆盖。

### Gaps Summary

无剩余 gap。修复提交 `1388cd8` 已关闭初验唯一问题：`--core-detail` 现在 await middleware，并验证 draft hard 404/no-store/noindex/no redirect 与 public pass-through。该命令和独立 `--all` oracle 均在 re-verification 中通过，TypeScript 检查与关键 artifact 快速回归也未发现退化。

---

_Verified: 2026-07-15T14:29:34Z_
_Verifier: the agent (gsd-verifier)_
