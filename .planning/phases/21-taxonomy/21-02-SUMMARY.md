---
phase: 21-taxonomy
plan: "02"
subsystem: data-integrity
tags: [taxonomy, identity, manifest, checksum, fixture, fail-closed]

requires:
  - phase: 21-taxonomy/21-01
    provides: action schema, ownership boundaries, and reviewed identity locks
provides:
  - checksum-bound 109-row taxonomy decision manifest
  - exact Waterman, Opus 88, Leonardo, and Aurora identity actions and old-route policies
  - guarded local taxonomy fixture and strict manifest decoder/reconciler
  - fail-closed payload slots that require owned-copy resolution before apply
affects: [21-03, 21-04, taxonomy-migration, publication-gates]

tech-stack:
  added: []
  patterns: [canonical JSON checksum, stable set reconciliation, owned-copy apply gate]

key-files:
  created:
    - data/taxonomy/v1.2-phase21.json
    - src/lib/taxonomy/identity-plan.ts
    - scripts/lib/taxonomy-fixture.ts
  modified:
    - tests/taxonomy/taxonomy-ledger.test.ts

key-decisions:
  - "The denominator is exactly the seven geographic tables (109 rows); the official-source delta remains a separately checksummed addendum."
  - "Unknown Phase 19 payload row IDs are represented as explicit stable slots, never as invented item IDs, and apply-mode reconciliation rejects them."
  - "Only the eight identities locked by 21-SPLIT-IDENTITY-LOCK are executable; all other rows remain gated or deferred without guessed IDs or slugs."

patterns-established:
  - "Identity plans decode unknown input with exact keys and reject checksum, duplicate, ID, route, and action drift."
  - "Migration preflight calls reconciliation with requireResolvedPayloads before applying identity actions."

requirements-completed: [TAX-01, TAX-02, TAX-03, TAX-04, TAX-05, EXP-01, EXP-05]

coverage:
  - id: D1
    description: "A local owned fixture rejects remote, protected, inherited, and alias targets before allocation."
    requirement: EXP-05
    verification:
      - kind: integration
        ref: "tests/taxonomy/taxonomy-ledger.test.ts#taxonomy fixture safety"
        status: pass
    human_judgment: false
  - id: D2
    description: "The reviewed taxonomy denominator is frozen as 109 unique rows with exact priority and status totals."
    requirement: TAX-01
    verification:
      - kind: unit
        ref: "tests/taxonomy/taxonomy-ledger.test.ts#109-row manifest preserves the exact reviewed denominator"
        status: pass
    human_judgment: false
  - id: D3
    description: "Eight locked identity outputs, route policies, atomic actions, and stable set deltas reconcile exactly."
    requirement: TAX-02
    verification:
      - kind: unit
        ref: "tests/taxonomy/taxonomy-ledger.test.ts#net action reconciliation uses exact stable ID sets and locked identities"
        status: pass
    human_judgment: false
  - id: D4
    description: "Payload assignment is fail-closed but remains provisional until eight omitted Phase 19 row IDs are resolved from an owned copy."
    requirement: TAX-05
    verification:
      - kind: unit
        ref: "tests/taxonomy/taxonomy-ledger.test.ts#net action reconciliation uses exact stable ID sets and locked identities"
        status: pass
    human_judgment: true
    rationale: "The checked-in Phase 19 ledger exposes row counts but omits eight immutable media/review/source row IDs; the implementation intentionally blocks apply rather than inventing them."

duration: 14min
completed: 2026-07-19
status: complete
---

# Phase 21 Plan 02: Taxonomy Decision Manifest Summary

**A checksum-bound 109-row taxonomy ledger with exact locked identity deltas, guarded local fixtures, and a hard apply gate for unresolved payload IDs.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-07-18T17:48:52Z
- **Completed:** 2026-07-18T18:02:23Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Transcribed the seven geographic tables into 109 immutable decisions with exact P0/P1/P2/P3 and status totals; 30 official/identity follow-ups are isolated outside that denominator.
- Locked eight Waterman, Opus 88, Leonardo, and Aurora outputs, four old-route policies, and a reproducible `brand 0 / pen +4 / page +4` identity delta.
- Added strict checksum/schema decoding, deterministic ID derivation checks, payload uniqueness checks, and an apply-mode guard that refuses unresolved owned-copy slots.
- Added a taxonomy-owned fixture that cannot allocate against remote, inherited, protected, symlinked, or hardlinked targets.

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: fixture safety contract** — `cb4d17c`
2. **Task 1 GREEN: guarded taxonomy fixture** — `6669f78`
3. **Task 2 RED: manifest and reconciliation contracts** — `2156bbd`
4. **Task 2 GREEN: frozen manifest and decoder** — `44b0e29`

## Files Created/Modified

- `data/taxonomy/v1.2-phase21.json` — 109 matrix decisions, 30 addendum actions, stable sets, locked routes, and payload assignments.
- `src/lib/taxonomy/identity-plan.ts` — strict decoder, checksum validation, locked-contract checks, and set-based reconciliation.
- `scripts/lib/taxonomy-fixture.ts` — owned temporary database fixture with pre-allocation environment/path guards.
- `tests/taxonomy/taxonomy-ledger.test.ts` — fixture, denominator, identity, checksum, duplicate, route, and unresolved-payload contracts.

## Decisions Made

- The source matrix, not the repeated P0 summary or official addendum, owns the 109-row denominator.
- The eight lock outputs are the only current `apply` rows. Other coverage rows contain evidence and explicit blockers but no guessed catalog identity.
- Eight Phase 19 payload rows whose immutable IDs are absent from checked-in evidence use stable `phase19-slot:<donor>:<surface>:<ordinal>:<checksum>` keys with `itemId: null` and `requiresOwnedCopyResolution: true`.
- `reconcileTaxonomyPlan(plan, { requireResolvedPayloads: true })` is the migration preflight boundary; it fails until Plan 21-04 resolves every slot from its owned catalog copy.

## Deviations from Plan

### Boundary Adjustment

**1. [Rule 2 - Missing Critical] Refused to invent omitted payload row IDs**

- **Found during:** Task 2 payload inventory transcription.
- **Issue:** The checked-in Phase 19 ledger gives surface counts and many exact payload IDs, but omits immutable IDs for eight media/review/source rows. Opening the protected catalog was outside this plan's authority, while synthesizing IDs would falsely claim complete assignment.
- **Fix:** Added stable non-ID slot keys, marked each `requiresOwnedCopyResolution`, and made apply-mode reconciliation fail closed while retaining the exact eight identity/route locks.
- **Files modified:** `data/taxonomy/v1.2-phase21.json`, `src/lib/taxonomy/identity-plan.ts`, `tests/taxonomy/taxonomy-ledger.test.ts`
- **Verification:** Full taxonomy ledger test passes and explicitly asserts apply rejection while slots remain.
- **Committed in:** `44b0e29`

### Auto-fixed Issues

**2. [Rule 3 - Blocking] Matched the project's required `ProcessEnv.NODE_ENV` contract**

- **Found during:** Task 2 TypeScript verification.
- **Issue:** Synthetic test environments omitted the project's required `NODE_ENV` field.
- **Fix:** Added `NODE_ENV: "test"` to each synthetic environment and used the typed `assert.rejects` callback overload.
- **Files modified:** `tests/taxonomy/taxonomy-ledger.test.ts`
- **Verification:** `pnpm exec tsc --noEmit` passes.
- **Committed in:** `44b0e29`

**Total deviations:** 2 (one fail-closed boundary adjustment, one blocking type fix).

## Issues Encountered

- Duplicate-row validation initially reported the 110-row count before the more specific duplicate reason. Validation order was corrected so duplicate drift fails with actionable diagnostics.
- The pnpm configuration emits an existing warning that `package.json#pnpm.onlyBuiltDependencies` is ignored; it did not affect tests or compilation.

## Known Stubs

- Eight `payloadAssignments` entries intentionally have `itemId: null`: one or more omitted media/review/source IDs for each locked donor. Each slot includes donor, surface, ordinal, checksum, and `requiresOwnedCopyResolution: true`.
- These are not presented as final payload assignments. They are an explicit blocker that Plan 21-04 must replace with exact IDs from its owned copy before any mutation can run.

## Verification

- `pnpm exec tsx --test tests/taxonomy/taxonomy-ledger.test.ts` — 4/4 passed.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm biome check src/lib/taxonomy/identity-plan.ts scripts/lib/taxonomy-fixture.ts tests/taxonomy/taxonomy-ledger.test.ts` — passed.

## User Setup Required

None — no external service configuration or credentials were added.

## Next Phase Readiness

- Plans 21-03/21-04 can consume exact matrix/lock data without fuzzy identity resolution.
- Before Plan 21-04 applies mutations, it must replace all eight provisional slots with exact owned-copy row IDs and re-run reconciliation with `requireResolvedPayloads: true`.
- This plan did not search the web for or write model-page content; that remains a separate content-research and publication workflow.

## Self-Check: PASSED

- All four implementation/test artifacts and this summary exist.
- All four TDD task commits are present in git history.
- Stub-pattern scan found only initialized local collections, nullable decoder contracts, and the eight intentional payload slots documented above.

---
*Phase: 21-taxonomy*
*Completed: 2026-07-19*
