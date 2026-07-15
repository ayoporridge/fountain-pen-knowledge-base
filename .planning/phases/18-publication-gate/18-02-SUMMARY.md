---
phase: 18-publication-gate
plan: "02"
subsystem: testing
tags: [libsql, migrations, playwright, fixtures, process-lifecycle]

requires:
  - phase: 18-publication-gate
    plan: "01"
    provides: readiness-only importers and migration-writer ownership gate
provides:
  - four canonical-migration seed entry points and two readiness-only legacy importers
  - server-only injectable disposable file database contract
  - shared publication and Playwright fixture lifecycle with real-database isolation
affects: [18-03, 18-04, 18-07, publication-gate, e2e]

tech-stack:
  added: []
  patterns:
    - mutually exclusive Turso and disposable file database configuration
    - canonical migration before fixture use
    - signal-safe client, child-process, and temp-root cleanup

key-files:
  created:
    - scripts/check-publication-gate.ts
    - .planning/phases/18-publication-gate/18-02-SUMMARY.md
  modified:
    - src/lib/db.ts
    - playwright.config.ts
    - package.json
    - scripts/check-migration-safety.ts
    - scripts/seed.ts
    - scripts/seed-tags.ts
    - scripts/seed-concepts.ts
    - scripts/seed-library-samples.ts
    - scripts/import-csv.ts
    - scripts/import-markdown.ts

key-decisions:
  - "FPKG_DATABASE_URL is a server-only file URL override; it cannot coexist with TURSO_DATABASE_URL, and fixture mode requires it while rejecting the canonical data/fpkg.db path."
  - "Local Playwright starts Next only through check-publication-gate --serve-e2e; an external E2E_BASE_URL continues to disable the local server."
  - "Data-contract and build verification use a temporary byte-for-byte copy of the catalog database so validation cannot open or mutate the real database."

patterns-established:
  - "Disposable fixture: mkdtemp -> canonical migrate -> child work -> stop children -> close client -> remove root."
  - "Isolation proof: compare real DB stat/hash before and after, and exercise success, thrown failure, SIGINT, and SIGTERM cleanup paths."

requirements-completed: [PUB-01, PUB-06]

coverage:
  - id: D1
    description: "Four seed commands delegate migration ownership to migrateDatabase, while CSV and Markdown imports perform readiness-only preflight before business writes."
    requirement: PUB-06
    verification:
      - kind: integration
        ref: "pnpm check:migrations"
        status: pass
      - kind: integration
        ref: "pnpm check:migrations -- --migration-ownership"
        status: pass
    human_judgment: false
  - id: D2
    description: "Publication fixtures use an explicit disposable file database, reject real-catalog and mixed Turso configuration, and clean every resource on success, failure, and SIGTERM."
    requirement: PUB-01
    verification:
      - kind: integration
        ref: "pnpm check:publication-gate -- --fixture-isolation"
        status: pass
    human_judgment: false
  - id: D3
    description: "Local Playwright launches Next through the shared isolated harness while external E2E_BASE_URL behavior remains unchanged."
    requirement: PUB-01
    verification:
      - kind: e2e
        ref: "pnpm check:publication-gate -- --serve-e2e --port 3117; GET / returned 200; SIGINT removed server and fixture root"
        status: pass
      - kind: integration
        ref: "FPKG_DATABASE_URL=<temporary catalog copy> PUBLICATION_GATE_FIXTURE=1 pnpm build"
        status: pass
    human_judgment: false

duration: 12 min
completed: 2026-07-15
status: complete
---

# Phase 18 Plan 02: Isolated Publication Fixture Foundation Summary

**All remaining migration runners now share the canonical owner, and publication/browser tests run against disposable file databases with verified process cleanup.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-15T11:39:47Z
- **Completed:** 2026-07-15T11:51:46Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Replaced four seed migration loops with `migrateDatabase()` and made CSV/Markdown importers fail closed through `assertDatabaseReady()` before their first business write.
- Added a server-only `FPKG_DATABASE_URL` contract that rejects remote/file ambiguity and prevents publication fixtures from resolving to the real `data/fpkg.db`.
- Added one reusable publication/Playwright harness that migrates disposable databases and proves client, child server, and temporary-root cleanup on normal completion, thrown failure, SIGINT, and SIGTERM.

## Task Commits

Each task was committed atomically:

1. **Task 1: 收敛 seed、CSV 与 Markdown runner** — `ddbd748` (fix)
2. **Task 2: 建立 injectable DB 与 isolated Playwright/publication harness** — `423ee05` (feat)

## Files Created/Modified

- `scripts/check-publication-gate.ts` — disposable database, canonical migration, child server, signal cleanup, and real-database snapshot harness.
- `src/lib/db.ts` — mutually exclusive local fixture/Turso resolution and real-catalog rejection in fixture mode.
- `playwright.config.ts` — local web server now enters through the publication harness; external base URLs remain untouched.
- `package.json` — exposes `check:publication-gate` without adding a dependency.
- `scripts/seed.ts`, `scripts/seed-tags.ts`, `scripts/seed-concepts.ts`, `scripts/seed-library-samples.ts` — canonical migration delegation.
- `scripts/import-csv.ts`, `scripts/import-markdown.ts` — asynchronous readiness preflight before existing import behavior.
- `scripts/check-migration-safety.ts` — removed the final six exact-hash migration-writer exceptions.

## Decisions Made

- Kept the existing seed/import formats and business writes unchanged; only migration ownership and the minimum asynchronous preflight boundary moved.
- Canonicalized both configured file URLs and temporary roots before comparison so macOS `/var`/`/private/var` aliases cannot produce a false mismatch or bypass the real-database guard.
- Kept the fixture database client open for the harness lifetime, then stopped child servers before closing the client and deleting the root.
- Validated the production build against a temporary catalog copy rather than letting build-time reads open the real SQLite database.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Removed Plan 01's transitional migration-writer exceptions immediately**

- **Found during:** Task 1 (runner convergence)
- **Issue:** The Plan 01 checker would have retained six exact hashes until this Summary existed, leaving a temporary bypass in code even after all six runners were fixed.
- **Fix:** Removed the exception map and summary-dependent branch; every TypeScript script is now scanned with zero migration-writer exceptions.
- **Files modified:** `scripts/check-migration-safety.ts`
- **Verification:** Both default and explicit ownership commands report `no migration-writer exceptions`.
- **Committed in:** `ddbd748`

**2. [Rule 1 - Bug] Canonicalized temporary roots before file-URL equality checks**

- **Found during:** Task 2 (`--fixture-isolation` first run)
- **Issue:** macOS resolves the temporary directory through `/private/var`, while the initially recorded path used `/var`; the safe fixture was rejected as unequal.
- **Fix:** Resolve the new temporary root through `realpath` before deriving the database path, while retaining the independent canonical rejection of `data/fpkg.db`.
- **Files modified:** `scripts/check-publication-gate.ts`
- **Verification:** Repeated fixture isolation passes, including relative, absolute, and normalized real-database rejection cases.
- **Committed in:** `423ee05`

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug)
**Impact on plan:** Both changes strengthen the required zero-bypass and real-path safety boundaries; no publication schema or Phase 03 behavior was added early.

## Issues Encountered

- The first fixture-isolation run failed with `Fixture database URL did not resolve to its disposable path`; canonicalizing the temporary root fixed the macOS path alias mismatch.
- The first exact plan-level data-contract/build run opened the real catalog read-only. The main `data/fpkg.db` stat and SHA-256 stayed byte-identical, but SQLite removed an existing 0-byte WAL and 32 KiB SHM sidecar on connection shutdown. This was not represented as “zero change.” The full gate was rerun against a byte-identical temporary database copy; the real main file and then-current missing sidecar state remained unchanged, and the temporary copy was removed.

## Known Stubs

None introduced. Empty strings, nullable client references, and child sets in the harness are lifecycle state, not UI or data placeholders; all are exercised by the isolation test.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 18-03 can extend `check-publication-gate.ts` with migration, backfill, invalidation, and publish fixtures without creating another database lifecycle.
- Next and Playwright can consume a synthetic publication database through `FPKG_DATABASE_URL` without touching the catalog database.
- Migration ownership now has no transitional exceptions, so adding `030_publication_gate.sql` cannot be silently false-applied by a seed or importer.
- No remote migration, Turso write, push, deployment, or production change occurred.

## Self-Check: PASSED

- All 11 created/modified implementation files and this Summary exist.
- Task commits `ddbd748` and `423ee05` exist in git history.
- Migration ownership, fixture isolation, data contract, TypeScript, Biome, production build, live isolated Next startup, and cleanup checks all passed.
- The safe full gate verified the real catalog main file stat/hash stayed unchanged and removed its temporary copy.

---
*Phase: 18-publication-gate*
*Completed: 2026-07-15*
