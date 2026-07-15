---
phase: 18-publication-gate
plan: "07"
subsystem: independent-publication-verification
tags: [migration, publication, parity, playwright, hard-404, disposable-db]

requires:
  - phase: 18-publication-gate
    plan: "06"
    provides: canonical primary and secondary publication gates with complete reverse brand-model links
provides:
  - independent migration, compatibility, and four-semantics public-boundary oracles
  - isolated browser regression for hard draft 404s and immediate publication lifecycle transitions
  - exact synthetic catalog assertions without real-catalog count, implicit-publication, or shared-cache assumptions
affects: [phase-18-validation, publication-regression, middleware, legacy-e2e]

tech-stack:
  added: []
  patterns:
    - expected public sets are derived independently from fixture SQL rather than runtime authorization helpers
    - entity routes are preauthorized after canonical redirects so draft and missing entities return a hard HTTP 404
    - browser fixtures own a disposable database and prove the real catalog byte identity before and after execution

key-files:
  created:
    - tests/e2e/publication-gate.spec.ts
    - .planning/phases/18-publication-gate/18-07-SUMMARY.md
  modified:
    - scripts/check-publication-gate.ts
    - scripts/check-public-boundary.ts
    - src/middleware.ts
    - tests/e2e/site-quality.spec.ts
    - tests/e2e/library.spec.ts
    - .planning/phases/18-publication-gate/18-07-PLAN.md
    - .planning/phases/18-publication-gate/18-VALIDATION.md

key-decisions:
  - "Migration and compatibility evidence comes from disposable fresh, upgrade, idempotent, integrity, invalidation, direct-SQL, rollback, and bidirectional EXCEPT checks."
  - "List equality, governed per-ID equivalence, keyed aggregates, and contextual subsets remain distinct verification semantics."
  - "Next streamed notFound soft-200 behavior is closed by Node.js middleware preauthorization for exact entity namespaces after canonical redirects."
  - "Plan-level evidence is green, but unrelated Phase 18 validation rows remain pending until the complete phase gate is rerun."

patterns-established:
  - "Independent oracle: the expected side may read fixture contract SQL and known IDs but may not import runtime visibility, browse, recommendation, or library authorization helpers."
  - "Hard entity boundary: canonicalize first, then return no-store/noindex HTTP 404 before rendering an unpublished exact type/slug."
  - "Fixture invariant: explicitly clear remote credentials, use an owned temporary database, and compare the real database main/WAL/SHM snapshot afterward."

requirements-completed: []

coverage:
  - id: E1
    description: "The full migration matrix and non-brand/pen compatibility contract pass independently on disposable databases."
    requirement: "PUB-01, PUB-02, PUB-05, PUB-06"
    verification:
      - kind: migration/regression
        ref: "pnpm check:publication-gate -- --migration-full && pnpm check:publication-gate -- --compatibility"
        status: pass
    human_judgment: false
  - id: E2
    description: "All four public-surface semantics and complete reverse brand-model parity pass without reusing runtime authorization predicates."
    requirement: "PUB-03, PUB-04, PUB-07"
    verification:
      - kind: full-parity
        ref: "pnpm check:public-boundary -- --all"
        status: pass
    human_judgment: false
  - id: E3
    description: "Majohn A1 and Montblanc 149 stay hard-404 drafts while 15 valid models and every lifecycle transition are verified in an isolated browser fixture."
    requirement: "PUB-02, PUB-03, PUB-04, PUB-05, PUB-07"
    verification:
      - kind: browser-api
        ref: "pnpm exec playwright test tests/e2e/publication-gate.spec.ts --project=desktop"
        status: pass
    human_judgment: false

duration: 34 min
completed: 2026-07-15
status: complete
---

# Phase 18 Plan 07: Independent Publication Verification Summary

**The publication boundary now has independent disposable migration/parity oracles and an isolated browser contract proving true draft HTTP 404s, complete brand-model navigation, and immediate publish/invalidate/retire transitions.**

## Performance

- **Duration:** 34 min
- **Started:** 2026-07-15T13:36:27Z
- **Completed:** 2026-07-15T14:10:42Z
- **Tasks:** 3, plus one documented hard-404 plan correction
- **Implementation files modified:** 6

## Accomplishments

- Completed the fresh/upgrade/idempotent migration matrix, integrity checks, publication invalidation/direct-SQL/rollback checks, and bidirectional non-brand/pen compatibility oracle.
- Added an independent all-surface oracle that separately checks 31 exact list identities, governed per-ID equivalence, keyed aggregate equality, contextual public subsets, and all 19/19 reverse brand-model relations.
- Added a fully isolated Playwright fixture covering exact Majohn A1 and Montblanc 149 draft records, 15 valid models, complete brand navigation, model content, API/discovery/library/wiki/media absence or presence, and next-request lifecycle changes.
- Replaced streamed soft-404 behavior with pre-render middleware authorization so unpublished exact entity routes return a real HTTP 404 with `no-store` and `noindex`.
- Rewrote the legacy site-quality and library suites around exact disposable fixture sets, full sitemap traversal, and no-store behavior; removed old real-catalog counts, implicit Pilot/LAMY visibility, and shared-cache assumptions.

## Task Commits

1. **Task 1: complete migration/publication matrix and compatibility** — `c84ac3c`
2. **Task 2: add the independent four-semantics public-boundary oracle** — `bd495de`
3. **Plan correction: require hard entity HTTP 404s and authorize middleware as the sixth implementation file** — `f7d4f13`
4. **Task 3: enforce the browser publication contract and rewrite legacy E2E assumptions** — `dc16c06`

## Files Created/Modified

- `scripts/check-publication-gate.ts` — `--migration-full` and `--compatibility` matrices over owned disposable databases.
- `scripts/check-public-boundary.ts` — independent `--all` oracle with exact-list, per-ID, aggregate, subset, and reverse-model semantics.
- `src/middleware.ts` — canonical-redirect-first, Node.js preauthorization and hard no-store/noindex 404s for exact entity namespaces.
- `tests/e2e/publication-gate.spec.ts` — isolated publication lifecycle, hard-404, 15-model, and cross-surface browser/API regression.
- `tests/e2e/site-quality.spec.ts`, `tests/e2e/library.spec.ts` — exact fresh-fixture legacy regressions without real-catalog assumptions.
- `.planning/phases/18-publication-gate/18-07-PLAN.md` — hard-404 correction recorded in `f7d4f13`.
- `.planning/phases/18-publication-gate/18-VALIDATION.md` — only the three Plan 18-07 rows advanced to green in this closeout.

## Decisions Made

- Kept the expected side independent of production visibility/browse/recommendation/library authorization helpers; a shared predicate cannot certify itself.
- Preserved four distinct comparison semantics: bidirectional equality for complete lists, governed per-ID equivalence for detail/API surfaces, keyed equality for aggregates, and public-subset checks for contextual results.
- Put the hard-404 check after canonical/reclassified redirects and limited it to exact two-segment entity namespaces, preserving non-entity and nested routes.
- Used server-only current public-state lookup in Node.js middleware. A page-level streamed `notFound()` plus `noindex` is not accepted as an HTTP 404 contract.
- Left `requirements-completed` empty and did not change earlier Phase 18 validation rows. This Summary closes Plan 18-07 evidence only; the complete phase suite still requires its own rerun/sign-off.

## Deviations from Plan

### Authorized Plan Correction

**1. Hard entity 404 required one additional implementation file**

- **Found during:** Task 3 browser regression.
- **Issue:** Next App Router streamed `notFound()` rendered the correct fallback and `noindex` metadata but returned HTTP 200, violating the hard-404 acceptance criterion.
- **Correction:** Commit `f7d4f13` updated the plan and validation contract to include `src/middleware.ts` as the sixth implementation file and require pre-render authorization.
- **Implementation:** Commit `dc16c06` added canonical-redirect-first Node.js middleware lookup and hard no-store/noindex 404 responses.
- **Verification:** The exact Majohn A1 and Montblanc 149 GET/HEAD requests returned 404 without redirects or JSON-LD; public lifecycle fixtures still returned 200 immediately after publication.

---

**Total deviations:** 1 authorized plan correction.
**Impact on plan:** The additional file closes the planned disclosure path without broadening the public feature surface.

## Issues Encountered

- A first browser assertion exposed the framework's streamed soft-404 response. Database inspection confirmed both examples were genuine `pen` drafts and absent from `public_entities`; middleware preauthorization fixed the transport status rather than weakening the assertion.
- An automated formatter temporarily renamed the Playwright fixture destructuring parameter to an unsupported form. The hook was restored to object destructuring and the publication suite was rerun green without retry.
- `next start` emitted the existing standalone-output warning while the isolated test server still started and all targeted suites completed successfully.

## Verification

- `pnpm check:publication-gate -- --migration-full` — exit 0: fresh, upgrade, second-run idempotency, integrity, invalidation, direct-SQL, and rollback checks passed.
- `pnpm check:publication-gate -- --compatibility` — exit 0: legacy non-brand/pen membership matched in both `EXCEPT` directions and explicit publication rows used the strict gate.
- `pnpm check:public-boundary -- --all` — exit 0: **31** exact list identities, governed per-ID equivalence, keyed aggregates, contextual subsets, and **19/19** complete reverse brand models passed; Majohn A1 and Montblanc 149 remained draft and absent.
- `pnpm exec playwright test tests/e2e/publication-gate.spec.ts --project=desktop` — **4 passed (8.2s)**, no retry.
- `pnpm exec playwright test tests/e2e/site-quality.spec.ts --project=desktop` — **14 passed (10.3s)**.
- `pnpm exec playwright test tests/e2e/library.spec.ts --project=desktop` — **7 passed (5.3s)**.
- `pnpm exec biome check src/middleware.ts tests/e2e/publication-gate.spec.ts tests/e2e/site-quality.spec.ts tests/e2e/library.spec.ts` — passed with no fixes required.
- `pnpm exec tsc --noEmit` and `git diff --check` — passed.
- A disposable-database `pnpm build` after the middleware change passed. This was not treated as a substitute for the complete Phase 18 gate.
- Real catalog stayed byte-identical: SHA-256 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`; size **24,723,456 bytes**; inode **46,507,656**; mtime/ctime **1,784,118,828**; WAL and SHM both absent before and after targeted verification.
- Remote Turso migration/write, push, deploy, and production verification were not performed.

## Known Stubs

None. Empty fixture results are deliberate fail-closed expectations, not public UI/data placeholders.

## User Setup Required

None — no external service or credential is required for the disposable verification suite.

## Next Phase Readiness

- The three Plan 18-07 validation rows are green with independent automated evidence.
- Earlier Phase 18 rows remain at their recorded status. The complete phase-gate command, including desktop and mobile suites, must be rerun before phase-level validation/sign-off is marked green.
- Production remains intentionally unchanged; remote migration, push, deployment, and production browser checks belong to the later staged rollout.

## Self-Check: PASSED

- Commits `c84ac3c`, `bd495de`, `f7d4f13`, and `dc16c06` exist and match the work recorded above.
- All six implementation files and the new Plan 18-07 Summary exist.
- Task-specific migration, compatibility, independent parity, publication E2E, rewritten legacy E2E, formatting, type, build, and real-database invariant checks passed as recorded.
- Only the three Plan 18-07 rows were advanced in `18-VALIDATION.md`; no phase-wide green status was inferred.

---
*Phase: 18-publication-gate*
*Completed: 2026-07-15*
