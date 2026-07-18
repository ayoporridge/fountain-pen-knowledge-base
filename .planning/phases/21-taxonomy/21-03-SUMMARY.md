---
phase: 21-taxonomy
plan: "03"
subsystem: database
tags: [taxonomy, identity, libsql, transaction, owned-copy, dry-run]
requires:
  - phase: 21-taxonomy/21-02
    provides: checksum-bound identity manifest, explicit non_split scope, guarded fixture
provides:
  - exact non-split alias/rename/merge/retire transaction engine
  - demote-first lifecycle and no-review-inheritance contract
  - dry-run-first owned-copy CLI with checksum replay safety
affects: [21-04, 21-05, taxonomy-migration, publication-gates]
tech-stack:
  added: []
  patterns: [explicit non_split reconciliation, demote-first transaction, owned-copy marker, checksum replay]
key-files:
  created:
    - src/lib/taxonomy/apply-taxonomy.ts
    - scripts/apply-taxonomy-v1.2.ts
  modified:
    - tests/taxonomy/taxonomy-canonical.test.ts
key-decisions:
  - "Plan 21-03 consumes only explicit non_split scope; all eight locked split rows and locked IDs are atomically delegated to Plan 21-04."
  - "Gated or deferred rows without exact IDs are skipped and reported; name or slug inference is forbidden."
  - "The checked-in manifest currently yields zero executable non-split actions until exact owned-copy IDs are reviewed."
patterns-established:
  - "Resolve exact IDs and full blockers before opening one no-retry write transaction."
  - "Demote affected entities and brands, then mutate identity; never inherit review approval."
requirements-completed: [TAX-01, TAX-04, TAX-05, TAX-06]
duration: 16m
completed: 2026-07-19
status: complete
---

# Phase 21 Plan 03: Canonical Taxonomy Operations Summary

Exact-ID taxonomy reconciliation now applies alias, rename, merge and retire as one provenance-preserving transaction, while the CLI remains dry-run by default and can write only to an acknowledged owned local copy.

## Performance

- **Duration:** 16 minutes
- **Started:** 2026-07-18T18:16:07Z
- **Completed:** 2026-07-18T18:31:53Z
- **Tasks:** 2
- **Files changed:** 4

## Accomplishments

- Added fail-closed plan reconciliation for the explicit `non_split` scope, including exact before-state checks, dependency closure, collision checks and blocker-rich dry-run results.
- Implemented lifecycle-safe alias, rename, merge and retire operations with bound SQL, exact cardinality assertions, donor history retention, lineage/action/redirect ledgers and full rollback on failure.
- Enforced demotion before mutation: affected entities and brands become draft or retired, approvals are cleared, and `entity_content_reviews` are never copied or moved.
- Kept the eight locked split rows outside this plan; attempts to apply their IDs are delegated to Plan 21-04 with zero writes.
- Added an owned-copy-only CLI with dry-run default, explicit apply acknowledgement, local path/inode/link validation, remote credential rejection and checksum-idempotent replay.
- Covered the Pilot MR/Metropolitan/Cocoon, Elabo/Falcon, Moonman/Majohn A1, Asvine P36, SKB/JunLai and locked-split safety cases with focused tests.

## Task Commits

Each task followed the required RED/GREEN sequence:

1. **Task 1 RED: canonical taxonomy contracts** — `e198969` (`test`)
2. **Task 1 GREEN: exact non-split taxonomy actions** — `4f3cdad` (`feat`)
3. **Task 2 RED: owned-copy CLI contracts** — `ffca3b9` (`test`)
4. **Task 2 GREEN: guarded owned-copy controller** — `9e80e8f` (`feat`)

## Files Created/Modified

- `src/lib/taxonomy/apply-taxonomy.ts` — exact-plan reconciliation and atomic taxonomy transaction engine.
- `scripts/apply-taxonomy-v1.2.ts` — dry-run-first, owned-copy-only command controller.
- `tests/taxonomy/taxonomy-canonical.test.ts` — canonical lifecycle, rollback, delegation, CLI safety and replay regressions.
- `.planning/phases/21-taxonomy/21-03-SUMMARY.md` — execution record and verified boundary.

## Decisions Made

- The engine consumes only rows explicitly marked `non_split`; it does not infer scope or IDs from names and slugs.
- Locked split rows are an indivisible Plan 21-04 unit. This plan may report delegation but cannot independently rename or retire any locked source.
- Rename keeps the entity ID; alias creates no entity; merge keeps the donor as retired history; retire invents neither a successor nor a canonical brand.
- A source manifest key is replayable only with the same checksum. A different checksum is a blocker, not an implicit overwrite.
- Pilot regional naming may retain the old route redirect, but the removed `贵妃` wording is not preserved as an approved alias.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected a synthetic Moonman fixture ID to the strict decoder length**

- **Found during:** Task 2 GREEN verification
- **Issue:** The synthetic fixture ID was one character too long and was rejected before the owned-copy replay contract could be exercised.
- **Fix:** Replaced it with a valid exact fixture ID; production identity rules were not relaxed.
- **Files modified:** `tests/taxonomy/taxonomy-canonical.test.ts`
- **Commit:** `9e80e8f`

### Boundary Adjustment

- The checked-in manifest has 101 explicit `non_split` rows, but they are currently gated/deferred and do not carry reviewed exact IDs. The dry-run therefore returns zero executable actions, 101 skipped rows and eight delegated locked rows.
- This is deliberate fail-closed behavior inherited from Plan 21-02, not a fuzzy matching fallback. Synthetic exact-plan fixtures prove the generic engine; real catalog mutation waits for reviewed IDs on an owned copy.

## Known Stubs

None. The zero-action checked-in manifest is an explicit reviewed-data boundary, not an unwired code path.

## Verification

- `pnpm exec tsx --test tests/taxonomy/taxonomy-canonical.test.ts` — 5/5 passed.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm biome check src/lib/taxonomy/apply-taxonomy.ts scripts/apply-taxonomy-v1.2.ts tests/taxonomy/taxonomy-canonical.test.ts` — passed.
- Only the focused taxonomy contracts were run; no browser, remote catalog or broad-suite work was added to this plan.

## Next Phase Readiness

- Plan 21-04 can consume the eight delegated locked split rows as atomic source/output/payload units.
- A later owned-copy resolution step must add and review exact IDs before the 101 gated/deferred rows can produce real actions.
- No production catalog, remote database or protected path was opened or mutated during this plan.

## Self-Check: PASSED

- All three implementation/test files and this summary exist.
- All four RED/GREEN task commits exist in git history.
- Focused tests, TypeScript checking and Biome checking pass.
