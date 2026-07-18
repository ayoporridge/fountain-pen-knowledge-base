---
phase: 20-renderer
plan: "01"
subsystem: database
tags: [sqlite, libsql, publication-gate, typescript, node-test]

requires:
  - phase: 19-real-audit-evidence
    provides: Evidence readiness v2 views, current-public authorization, and qualified source/media contracts
provides:
  - Renderer-owned disposable migrated database and adversarial safety fixture
  - Single-statement current-public brand/pen page loader with explicit unknown-row decoding
  - Focused contracts for stories, sources, media, evidence-backed specs, variants, timeline, and canonical relations
affects: [20-02, 20-03, 20-04, renderer, entity-pages]

tech-stack:
  added: []
  patterns:
    - Materialized public_entities authorization snapshot shared by every module in one SQL statement
    - Local-first same-origin media decoding through getPublicMediaUrl
    - Fail-closed discriminated page models decoded from unknown database rows

key-files:
  created:
    - scripts/lib/renderer-fixture.ts
    - tests/renderer/entity-page.test.ts
    - src/lib/entity-page.ts
  modified: []

key-decisions:
  - "Materialize public_entities once, then resolve the root and related public entities from that single authorization snapshot."
  - "Rows rejected by the live public_entities gate return null; decoder cardinality checks remain as defense against malformed or inconsistent authorized rows."
  - "Resolve primary media local_path first, normalize public/ paths, and reject protocol-relative or otherwise non-site output."
  - "Treat SQLite 0 and 1 as the only valid timeline booleans and verify spec zero numerically instead of imposing display formatting."

patterns-established:
  - "Renderer fixtures require RENDERER_FIXTURE=1 and reject remote credentials, external E2E URLs, and protected-catalog aliases before allocating resources."
  - "Public page reads start from bound type/slug parameters against public_entities and never reconstruct publication eligibility."

requirements-completed: [PAGE-02, PAGE-03, PAGE-05]

coverage:
  - id: D1
    description: Current-public entities receive exactly one complete expected story with no legacy or deprecated fallback.
    requirement: PAGE-02
    verification:
      - kind: integration
        ref: "tests/renderer/entity-page.test.ts#page loader"
        status: pass
      - kind: integration
        ref: "tests/renderer/entity-page.test.ts#qualified content"
        status: pass
    human_judgment: false
  - id: D2
    description: Model specs, variants, sources, timelines, and canonical relations are complete and evidence-qualified.
    requirement: PAGE-03
    verification:
      - kind: integration
        ref: "tests/renderer/entity-page.test.ts#qualified content"
        status: pass
      - kind: integration
        ref: "tests/renderer/entity-page.test.ts#page loader returns all fifteen brand models"
        status: pass
    human_judgment: false
  - id: D3
    description: Exactly one attributed, licensed, entity-owned primary image resolves to a stable same-origin path.
    requirement: PAGE-05
    verification:
      - kind: integration
        ref: "tests/renderer/entity-page.test.ts#returns the complete story qualified modules exact media and zero values"
        status: pass
      - kind: integration
        ref: "tests/renderer/entity-page.test.ts#never returns weak-media sentinels"
        status: pass
    human_judgment: false

duration: 28min
completed: 2026-07-18
status: complete
---

# Phase 20 Plan 01: Current-Public Entity Page Loader Summary

**One materialized `public_entities` authorization snapshot now yields complete, evidence-qualified brand and pen page data through a fail-closed TypeScript decoder.**

## Performance

- **Duration:** 28 min
- **Started:** 2026-07-18T14:57:45Z
- **Completed:** 2026-07-18T15:25:17Z
- **Tasks:** 2
- **Files modified:** 3 implementation/test files plus this summary

## Accomplishments

- Added an independent renderer fixture that migrates and seeds only one owned temporary SQLite database, publishes one brand plus fifteen pens, and rejects hostile environment inputs before allocation.
- Added `getPublishedEntityPage(type, slug)`, using one bound SQL statement and one materialized `public_entities` snapshot to return exact story, qualified dependencies, all canonical relations, and strict primary media.
- Added explicit unknown-row decoding and fail-closed invariants for summaries, stories, sources, media, specs, timeline events, relations, SQLite booleans, and same-origin media paths.
- Proved legacy/deprecated/unqualified/gallery/remote-only/missing-attribution sentinels stay absent while complete story topics and numeric zero remain present.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build renderer fixture and RED contracts** - `58adf63` (test)
2. **Task 2: Implement current-public entity page loader** - `51dcf33` (feat)

## Files Created/Modified

- `scripts/lib/renderer-fixture.ts` - Guarded disposable database, qualified seed graph, invalid sentinels, and owned cleanup.
- `tests/renderer/entity-page.test.ts` - Fixture safety, authorization, completeness, qualification, relation, media, and zero-value contracts.
- `src/lib/entity-page.ts` - Discriminated page types, parameterized single-statement loader, and explicit fail-closed decoder.

## Decisions Made

- The complex authorization view is materialized once as `public_entity_rows`; this preserves one current-public truth and prevents SQLite/libSQL from repeatedly expanding the Phase 19 view graph for fifteen related models.
- Primary media SQL returns raw ID/local/image/thumbnail fields. The decoder delegates ordering and `public/` normalization to `getPublicMediaUrl`, then requires a single-slash same-origin path and rejects `//host`, backslashes, and control characters.
- The repository does not install standalone `server-only`, and `tsx` ignored the attempted `react-server` condition for Next's compiled marker. The module therefore uses the approved top-level browser guard while its `db` import graph remains server-only; no dependency or package file was added.
- The live publication gate excludes missing/duplicate expected stories, short summaries, and zero/multiple `made_by` candidates before loader decoding. Contracts assert `null` at that real gate, while decoder cardinality checks remain defensive.

## Verification

- `pnpm exec tsx --test --test-name-pattern "qualified content" tests/renderer/entity-page.test.ts` - 3/3 passed.
- `pnpm exec tsx --test --test-name-pattern "fixture boot|fixture safety|page loader" tests/renderer/entity-page.test.ts` - 8/8 passed.
- `pnpm exec tsc --noEmit` - passed.
- `pnpm exec biome check src/lib/entity-page.ts tests/renderer/entity-page.test.ts scripts/lib/renderer-fixture.ts` - passed.
- `git diff --check -- src/lib/entity-page.ts tests/renderer/entity-page.test.ts scripts/lib/renderer-fixture.ts` - passed.

## Source and Boundary Evidence

The execution range `d6b52e5..51dcf33` changes only:

- `scripts/lib/renderer-fixture.ts`
- `src/lib/entity-page.ts`
- `tests/renderer/entity-page.test.ts`

No Phase 19 fixture/lifecycle file, migration, protected catalog, real inventory, broad E2E suite, remote database, or deployment target was changed or run. Reference-source fingerprints at completion:

| Read-only source | SHA-256 |
| --- | --- |
| `migrations/031_evidence_readiness_v2.sql` | `abe240f9e4911682636e1b681fbb6a6b6ca31c3abe2cfe9bcc13f0221b04660b` |
| `src/lib/db.ts` | `645a6a9b75a09ec0686895eebd609d5b5b28d31f4b1e61cdd1a0e7d30cdae284` |
| `src/lib/public-media.ts` | `6f5efa37ff66a1011b438930476c11a0ce3f40a71951534edea2dec4c7fed05a` |
| `src/lib/library.ts` | `922c0d6eaab29986439149822a9b29fe04cc59ef1abe40bf120b6a1ff3686ac0` |
| `tests/e2e/publication-gate.spec.ts` | `a83e91f082cb4fb2b098a0973415c258e71d830968cb7d5ff9d361656227a5b3` |
| `scripts/lib/phase19-fixtures.ts` | `dbae2e7df2cfa2f37944b437f1ad4eba4ebb5992f73e6513141d0985594497e3` |

Plan outputs at completion:

| Output | SHA-256 |
| --- | --- |
| `scripts/lib/renderer-fixture.ts` | `9d339ca4892bae2da1aee199ba629f96e6bc6c7a0bb2f93742a15634ccc25cf6` |
| `tests/renderer/entity-page.test.ts` | `3f45d3288403b77ea864f790d58d43339ec4ad9c7e5ffaed27d6c4cf40d5f061` |
| `src/lib/entity-page.ts` | `3e37207ab78041981021ecddde29da280562eb460b30fb0209060dbef5f22309` |

## Phase 19 Preflight

`.planning/phases/19-real-audit-evidence/19-VERIFICATION.md` was read before execution and reports `status: passed`, score 5/5. Its accepted non-blocking residual debt—no single post-timeout-fix monolithic wrapper invocation—remains unchanged. This plan did not rerun that wrapper and does not recast the composite evidence as a monolithic pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Live-contract mismatch] Replaced impossible permissive-view negative tests with real-gate assertions**
- **Found during:** Task 2
- **Issue:** Migration 031 excludes missing/duplicate expected stories, short summaries, and zero/multiple canonical makers from `public_entities`, so a crafted permissive replacement view would test a different authorization contract.
- **Fix:** Kept the live view untouched and asserted those raw rows resolve to `null`; retained decoder invariants for malformed authorized rows.
- **Files modified:** `tests/renderer/entity-page.test.ts`, `src/lib/entity-page.ts`
- **Verification:** `page loader` 4/4 passed.
- **Committed in:** `51dcf33`

**2. [Rule 2 - Security/correctness] Hardened server boundary, media path resolution, and SQLite boolean decoding**
- **Found during:** Task 2 static review
- **Issue:** A remote-first SQL `coalesce` could outrank owned local media, protocol-relative paths required explicit rejection, and truthy decoding would accept malformed `circa` values.
- **Fix:** Decode raw media through local-first `getPublicMediaUrl`, require strict same-origin output, add a browser import guard, and accept only SQLite integers 0/1 for `circa`.
- **Files modified:** `src/lib/entity-page.ts`, `scripts/lib/renderer-fixture.ts`, `tests/renderer/entity-page.test.ts`
- **Verification:** Qualified-content media/boolean assertions and `tsc` passed.
- **Committed in:** `51dcf33`

**3. [Rule 1 - Performance] Prevented repeated expansion of the authorization view graph**
- **Found during:** Task 2 focused GREEN
- **Issue:** Reusing the complex `public_entities` view in multiple CTE branches caused the fifteen-model query to stall.
- **Fix:** Materialized the authorized rows once and reused that snapshot for root and relation reads; the exercised heavy query completed in about one second.
- **Files modified:** `src/lib/entity-page.ts`
- **Verification:** Fifteen models plus one canonical brand passed, followed by the full focused page-loader group.
- **Committed in:** `51dcf33`

**4. [Rule 1 - Type mismatch] Removed an unsupported fixture publication option**
- **Found during:** Task 2 `tsc --noEmit`
- **Issue:** `PublishEntityOptions` has no `notes` property, although JavaScript execution ignored the extra field.
- **Fix:** Removed the unsupported field without changing publication behavior.
- **Files modified:** `scripts/lib/renderer-fixture.ts`
- **Verification:** `tsc --noEmit` passed.
- **Committed in:** `51dcf33`

---

**Total deviations:** 4 auto-fixed (3 Rule 1, 1 Rule 2)
**Impact on plan:** All changes enforce the planned live authorization, security, correctness, and bounded-query behavior; no schema, lifecycle, catalog, or feature scope was added.

## Issues Encountered

- Next's bundled `server-only` marker resolved to its throwing client branch under the repository's `tsx` CJS test transform even with `NODE_OPTIONS=--conditions=react-server`. The approved top-level browser guard was used instead, without adding a dependency.
- SQLite stores the seeded numeric weight zero as text `"0.0"`. The contract now proves numeric zero is preserved (`Number(value) === 0`) without imposing UI formatting in the loader.

## Known Stubs

None.

## Authentication Gates

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plans 20-02 and 20-03 can consume `BrandPageData` and `ModelPageData` without issuing weaker component-local queries.
- Plan 20-04 can reuse the isolated fixture and exact entity/media mappings for narrow UI verification.
- No blocker remains. Phase 19's documented non-blocking wrapper debt is unchanged and outside this plan.

## Self-Check: PASSED

- All three declared implementation/test files and this summary exist.
- Task commits `58adf63` and `51dcf33` resolve as commits.
- Summary diff check passed.
- Coverage classifier parsed 3 deliverables with `all_auto_covered: true` and no errors.

---
*Phase: 20-renderer*
*Completed: 2026-07-18*
