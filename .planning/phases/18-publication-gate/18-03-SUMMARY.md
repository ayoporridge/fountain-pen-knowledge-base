---
phase: 18-publication-gate
plan: "03"
subsystem: database
tags: [sqlite, publication, canonical-hash, triggers, libsql]

requires:
  - phase: 18-publication-gate
    plan: "02"
    provides: isolated canonical-migration fixture lifecycle and injectable disposable database
provides:
  - versioned publication rows, computed readiness blockers, and canonical public entity view
  - deterministic sha256:v1 content hash with twelve-table invalidation fan-out
  - database-guarded, rollback-safe atomic publish transaction
affects: [18-04, 18-05, 18-06, 18-07, public-visibility, publication-gate]

tech-stack:
  added: []
  patterns:
    - computed readiness is authorization; blockers_json is diagnostic only
    - canonical normalized JSON hash plus monotonic content revision
    - bounded no-retry write transaction with independent SQLite transition guard

key-files:
  created:
    - migrations/030_publication_gate.sql
    - src/lib/publication.ts
    - .planning/phases/18-publication-gate/18-03-SUMMARY.md
  modified:
    - src/lib/db.ts
    - scripts/check-publication-gate.ts

key-decisions:
  - "Readiness is always recomputed from current source rows; blockers_json never grants publication."
  - "Phase 18 treats canonical pen-to-brand made_by as the executable approved relation because entity_links has no review_status; Phase 19 owns richer evidence fields."
  - "Unattached source inserts invalidate no entity; source and registry updates/deletes fan out only through explicit claim, citation, variant, reference, timeline, or media ownership paths."
  - "TypeScript computes the canonical hash inside one write transaction, while SQLite independently enforces hash format, current revision/contract, reviewer metadata, timestamps, and zero readiness blockers."

patterns-established:
  - "Publication mutation: critical row trigger increments content_revision, published becomes in_review, approved hash remains as audit evidence."
  - "Publication transition: stable input read -> canonical hash -> review metadata -> computed readiness recheck -> guarded published update -> public membership assertion -> commit."

requirements-completed: [PUB-01, PUB-02, PUB-05, PUB-06, PUB-07]

coverage:
  - id: D1
    description: "Migration 030 creates explicit draft publication state, normalized blockers/readiness, strict public_entities, type reset triggers, and exact public-brand ownership for pens without rewriting stories."
    requirement: PUB-01, PUB-02, PUB-06, PUB-07
    verification:
      - kind: integration
        ref: "pnpm check:publication-gate -- --migration"
        status: pass
      - kind: integration
        ref: "pnpm check:publication-gate -- --backfill"
        status: pass
    human_judgment: false
  - id: D2
    description: "Canonical payload normalization and all twelve critical tables invalidate stale approval through complete INSERT/UPDATE/DELETE fan-out."
    requirement: PUB-05
    verification:
      - kind: integration
        ref: "pnpm check:publication-gate -- --invalidation"
        status: pass
    human_judgment: false
  - id: D3
    description: "publishEntity performs one no-retry write transaction and SQLite rejects incomplete direct transitions while valid brand and pen fixtures publish atomically."
    requirement: PUB-01, PUB-02, PUB-05, PUB-07
    verification:
      - kind: integration
        ref: "pnpm check:publication-gate -- --publish"
        status: pass
      - kind: integration
        ref: "FPKG_DATABASE_URL=<fresh disposable migrated DB> PUBLICATION_GATE_FIXTURE=1 pnpm build"
        status: pass
    human_judgment: false

duration: 30 min
completed: 2026-07-15
status: complete
---

# Phase 18 Plan 03: Publication State Machine Summary

**A versioned SQLite publication contract now computes readiness from live data, deterministically invalidates stale review, and permits publication only through a database-guarded atomic transaction.**

## Performance

- **Duration:** 30 min
- **Started:** 2026-07-15T11:55:42Z
- **Completed:** 2026-07-15T12:25:34Z
- **Tasks:** 3
- **Files modified:** 4 implementation files

## Accomplishments

- Added `entity_publications`, normalized blocker/readiness views, a strict explicit-column `public_entities` universe, draft backfill, and type transition resets. Existing brand/pen rows remain draft, published count is zero, and story rows are byte-stable.
- Added fixed-key canonical payload hashing with explicit nulls, NFC and newline normalization, stable array ordering/deduplication, and current entity/story/spec/evidence/source/reference/timeline/media/made-by inputs.
- Added owner-aware invalidation for entities, stories, specs, variants, claims, citations, source items, source registries, references, timelines, media, and made-by links. Critical edits preserve the approved audit hash while immediately removing published rows from the public universe.
- Added `publishEntity()` and `setEntityPublicationStatus()`. Publication uses one bounded write transaction with no retry, recomputes readiness after writing review metadata, then relies on an independent SQLite guard before asserting `public_entities` membership.

## Task Commits

Each task was committed atomically:

1. **Task 1: 建立 030 schema、readiness 与 type state-machine** — `c477d5a` (feat)
2. **Task 2: 固定 canonical hash 与全部 invalidation fan-out** — `882c99d` (feat)
3. **Task 3: 实现 DB-guarded atomic publish transaction** — `c3eba11` (feat)

## Files Created/Modified

- `migrations/030_publication_gate.sql` — publication table, dependency/readiness/public views, draft/type/invalidation triggers, and database publish guards.
- `src/lib/publication.ts` — canonical content payload/hash, non-public status transitions, and atomic publish transaction.
- `src/lib/db.ts` — version-aware publication schema manifest covering every required helper view, invalidation trigger, and transition guard.
- `scripts/check-publication-gate.ts` — disposable migration/backfill, 36-operation invalidation, and guarded publication fixture matrices.

## Decisions Made

- Kept `blockers_json` as a reviewer-facing snapshot only. Both public membership and transition authorization query normalized live blockers.
- Scoped v1 claim ownership to the claim subject and canonical `made_by` to the pen source. A brand does not require a public pen, avoiding circular authorization; a pen still requires exactly one already-public canonical brand.
- Kept source fan-out precise. An unattached source/source-registry insert has no owner and does not invalidate unrelated entities; later relationship insertion performs the required invalidation.
- Represented the Phase 19-only `independence_group` as an explicit null in the v1 payload instead of querying a nonexistent column. Phase 19 must add the field under a contract version bump.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `scripts/check-data-contract.ts` hardcodes `file:data/fpkg.db`. To honor the explicit no-real-database boundary, it was run from a temporary working directory against a freshly migrated synthetic database with the required tag dimensions. It passed without opening the catalog database.

## Known Stubs

None. `sourceRegistries[].independenceGroup: null` is an explicit v1 schema absence recorded in the hash contract, not a UI placeholder; Phase 19 owns the versioned field.

## Verification

- `pnpm check:publication-gate -- --migration` — passed.
- `pnpm check:publication-gate -- --backfill` — passed; every brand/pen draft, zero published, all stories unchanged, second migration skipped cleanly.
- `pnpm check:publication-gate -- --invalidation` — passed; order/NFC/newline-stable hash and 12 tables × 3 operations.
- `pnpm check:publication-gate -- --publish` — passed; direct SQL rejection, rollback, one transaction attempt, valid brand/pen publication, and post-edit re-review.
- `pnpm check:migrations` — passed, including fresh full replay.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm check:data-contract` equivalent — passed from a temporary cwd against a synthetic migrated database because the script hardcodes a relative database path.
- `pnpm build` — passed against a fresh disposable migrated database with `PUBLICATION_GATE_FIXTURE=1`.

## Next Phase Readiness

- Plan 18-04 can replace the old public visibility predicate with the `public_entities` universe; no existing brand/pen is accidentally grandfathered.
- Plans 18-05/06 can consume the same strict set for graph, recommendation, library, media, and cached surfaces.
- Plan 18-07 can reuse all four disposable fixture modes for parity and full browser regression.
- No remote migration, Turso write, production catalog read, push, deploy, or Plan 18-04 change occurred.

## Self-Check: PASSED

- All four implementation artifacts and this Summary exist.
- Task commits `c477d5a`, `882c99d`, and `c3eba11` exist in repository history.
- Every task acceptance fixture and each safe plan-level verification listed above passed against disposable databases.

---
*Phase: 18-publication-gate*
*Completed: 2026-07-15*
