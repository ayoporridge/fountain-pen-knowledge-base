---
phase: 21-taxonomy
plan: "04"
subsystem: database
tags: [taxonomy, locked-split, payload-assignment, variants, fail-closed]
requires:
  - phase: 21-taxonomy/21-03
    provides: exact-ID transaction and lifecycle primitives
provides:
  - synthetic exact path for the four locked split units and eight fixed outputs
  - exhaustive assignment guard for materialized donor payload inventory
  - existing-schema variant hierarchy validation without new pen entities
affects: [21-05, taxonomy-migration, owned-copy-resolution]
tech-stack:
  added: []
  patterns: [exact locked constants, assignment parity, retained ambiguity, no review inheritance]
key-files:
  created:
    - src/lib/taxonomy/reference-migration.ts
    - tests/taxonomy/taxonomy-structural.test.ts
  modified:
    - src/lib/taxonomy/apply-taxonomy.ts
key-decisions:
  - "The checked-in locked split remains non-executable while eight owned-copy slots are unresolved."
  - "PGS and related hierarchy rows remain gated because the manifest has no exact canonical IDs or atomic actions."
  - "This time-box delivers only the exact synthetic path and fail-closed guards; broader dependency/JSON migration is deferred."
requirements-completed: []
duration: 20m
completed: 2026-07-19
status: partial
---

# Phase 21 Plan 04: Locked Split Safety Subset Summary

The four locked split cases now have a tested exact-ID synthetic transaction path, while unresolved real payload slots and hierarchy data remain explicit blockers instead of guessed migrations.

## Performance

- **Duration:** 20 minutes
- **Started:** 2026-07-18T18:33:32Z
- **Tasks completed:** 1 safety subset of 2 planned tasks
- **Files changed:** 4

## Accomplishments

- Added fixed Waterman, Opus 88, Leonardo and Aurora donor/output tuples with exactly eight locked output IDs, slugs, names and makers.
- Added exhaustive donor-inventory assignment checks: missing, duplicate, unresolved, unknown-target and review-inheritance cases block before writes.
- Added one atomic synthetic transaction that drafts all affected brands/outputs, retains Waterman as Hémisphère, creates seven fixed children, retires three donors, preserves ambiguous media, records lineage/actions and prevents publication.
- Added existing-schema hierarchy validation for edition groups and color/material/nib/SKU children; it creates no canonical pen identity.
- Preserved the Plan 21-03 non-split API and verified all five canonical tests remain green.

## Commits

1. `c02ffed` — RED: exact locked split, hierarchy and ambiguous payload contracts.
2. `70477ac` — GREEN: minimal exact synthetic split engine and assignment guard.

## Verification

- `pnpm exec tsx --test tests/taxonomy/taxonomy-structural.test.ts` — 2/2 passed.
- `pnpm exec tsx --test tests/taxonomy/taxonomy-canonical.test.ts` — 5/5 passed.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm biome check src/lib/taxonomy/apply-taxonomy.ts src/lib/taxonomy/reference-migration.ts tests/taxonomy/taxonomy-structural.test.ts` — passed after formatting.

## Deferred Scope and Blockers

1. **Eight checked-in owned-copy slots remain unresolved.** Waterman, Opus 88 and Leonardo each lack exact media/review IDs; Aurora lacks one source ID and one review ID. The real manifest therefore remains fail-closed and was not applied.
2. **No executable hierarchy manifest exists.** PGS/SHIKIORI and the related Elabo/Majohn/Asvine hierarchy rows remain gated/deferred with `canonical=null` and no atomic actions. Only a synthetic structural contract is honest at this stage.
3. **Conditional redirect consumption is absent.** The ledger can record “activate only when target public,” but no verified runtime route consumer currently enforces that condition. This needs a separate, bounded implementation before real apply.
4. **Full dependency/JSON closure is not claimed.** `rewriteIdentityJsonReferences` and adversarial scope/evidence/diagram/exhibit migrations were deliberately not added after the user requested that this automation-boundary case stop delaying the content work.

## Deviations from Plan

### Scope Reduction

- **Found during:** exact locked-split preflight
- **Issue:** The original plan requires real exact payload assignments and hierarchy actions that the checked-in manifest does not contain, while protected-catalog access was prohibited.
- **Resolution:** Implemented and verified only the exact synthetic path plus fail-closed safety checks, then stopped at the explicit time box. No ID, payload owner or hierarchy was inferred.

## Known Stubs

None in the delivered synthetic path. The unimplemented full closure is listed above as deferred scope and is not represented as a passing stub.

## Self-Check: PASSED

- Both implementation files and the structural test exist.
- RED and GREEN commits exist.
- Focused tests, TypeScript and targeted Biome checks pass.
- No real catalog, remote database, browser or external network was accessed.
