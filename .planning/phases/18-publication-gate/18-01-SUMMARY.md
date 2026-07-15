---
phase: 18-publication-gate
plan: "01"
subsystem: database
tags: [libsql, migrations, importers, readiness, safety-gate]

requires:
  - phase: 17-full-regression-production-release
    provides: production-shaped local schema and migration baseline
provides:
  - ten readiness-only importers with no migration ownership
  - full scripts migration-ownership scan
  - pending-migration importer behavior regression
affects: [18-02, 18-03, publication-gate, import-pipeline]

tech-stack:
  added: []
  patterns:
    - canonical assertDatabaseReady preflight before importer business writes
    - exact-hash transitional debt with automatic Plan 02 expiry
    - isolated child-process behavior fixture for fail-closed importers

key-files:
  created:
    - .planning/phases/18-publication-gate/18-01-SUMMARY.md
  modified:
    - scripts/check-migration-safety.ts
    - scripts/import-brand-completion-sources.ts
    - scripts/import-exhibit-content.ts
    - scripts/import-model-gap-sources.ts
    - scripts/import-official-brand-sources.ts
    - scripts/import-official-brand-stories.ts
    - scripts/import-official-model-diagrams.ts
    - scripts/import-official-model-sources.ts
    - scripts/import-research-gap-sources.ts
    - scripts/import-warm-pen-atlas-media.ts
    - scripts/import-wikidata-brands.ts

key-decisions:
  - "Importer dry-run behavior stays unchanged; write mode performs assertDatabaseReady immediately after client setup and before business writes."
  - "The ownership scan always covers every scripts/**/*.ts file; the explicit flag additionally runs the missing-migration child-process fixture."
  - "Six Plan 02 runners are tolerated only while their full-file SHA-256 matches the reviewed baseline and 18-02-SUMMARY.md is absent."

patterns-established:
  - "Readiness-only writer: importers never enumerate, execute, or mark migrations."
  - "Migration ownership: src/lib/db.ts owns SQL plus marker atomicity; scripts/migrate.ts only delegates."

requirements-completed: [PUB-01, PUB-06]

coverage:
  - id: D1
    description: "Ten source/content importers fail closed through the canonical readiness guard before business writes."
    requirement: PUB-01
    verification:
      - kind: integration
        ref: "pnpm check:migrations"
        status: pass
      - kind: other
        ref: "10-file importer contract scan"
        status: pass
    human_judgment: false
  - id: D2
    description: "A full scripts ownership gate rejects new migration bypasses and preserves markers, checksums, and business rows when an importer sees a pending migration."
    requirement: PUB-06
    verification:
      - kind: integration
        ref: "pnpm check:migrations -- --migration-ownership"
        status: pass
    human_judgment: false

duration: 8 min
completed: 2026-07-15
status: complete
---

# Phase 18 Plan 01: Importer Migration Ownership Summary

**Ten importers now use a canonical read-only schema preflight, backed by a full-repository ownership scan and a real pending-migration failure regression.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-15T09:37:59Z
- **Completed:** 2026-07-15T09:46:51Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Removed 487 lines of embedded migration enumeration, SQL execution, and marker writes from ten importers without changing their business import flows.
- Made every target importer call `assertDatabaseReady(db)` in write mode before its first business write.
- Added a recursive scan of all 99 other TypeScript scripts, canonical-owner assertions, a synthetic bypass detector, and a child-process regression proving fail-closed behavior.

## Task Commits

Each task was committed atomically:

1. **Task 1: 将十个 importer 改为 readiness-only writer** — `c939103` (fix)
2. **Task 2: 增加 migration ownership static 与 behavior gate** — `f2bf699` (test)

## Files Created/Modified

- `scripts/import-brand-completion-sources.ts` — canonical readiness preflight replaces embedded migration runner.
- `scripts/import-exhibit-content.ts` — canonical readiness preflight replaces embedded migration runner; used as the behavior fixture representative.
- `scripts/import-model-gap-sources.ts` — canonical readiness preflight replaces embedded migration runner.
- `scripts/import-official-brand-sources.ts` — canonical readiness preflight replaces embedded migration runner.
- `scripts/import-official-brand-stories.ts` — canonical readiness preflight replaces embedded migration runner.
- `scripts/import-official-model-diagrams.ts` — canonical readiness preflight replaces embedded migration runner.
- `scripts/import-official-model-sources.ts` — canonical readiness preflight replaces embedded migration runner.
- `scripts/import-research-gap-sources.ts` — canonical readiness preflight replaces embedded migration runner.
- `scripts/import-warm-pen-atlas-media.ts` — canonical readiness preflight while retaining filesystem use for local media checks.
- `scripts/import-wikidata-brands.ts` — canonical readiness preflight replaces embedded migration runner.
- `scripts/check-migration-safety.ts` — recursive ownership scan and isolated missing-migration importer regression.

## Decisions Made

- Kept dry-run behavior unchanged and gated only write mode, matching the existing `if (WRITE)` boundary while guaranteeing readiness before any transaction or business mutation.
- Made the static ownership scan part of the default migration check so future bypasses fail the normal gate; `--migration-ownership` adds the more expensive child-process regression.
- Locked the six Plan 02 legacy runners by exact SHA-256 rather than a path-only allowlist. Their exceptions expire when Plan 02 closes, so edits or new bypasses fail immediately.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Preserved the sequential Plan 02 cleanup without weakening the ownership gate**

- **Found during:** Task 2 (migration ownership gate)
- **Issue:** A zero-exception scan cannot pass before Plan 02 removes the four seed and two CSV/Markdown migration runners, but a path-only exception would allow those files to regain ownership later.
- **Fix:** Added exact full-file SHA-256 debt fixtures that are valid only before `18-02-SUMMARY.md` exists. Every script is still scanned, and any changed/new bypass fails.
- **Files modified:** `scripts/check-migration-safety.ts`
- **Verification:** Both migration commands passed; the scan reported 99 scripts and six exact Plan 02 debt fixtures.
- **Committed in:** `f2bf699`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Preserves the planned Phase 18 order while making the temporary exception narrower than a filename allowlist.

## Issues Encountered

- The repository Biome configuration ignores `scripts/`, so a direct Biome check processed zero target files. The executable TypeScript checker, child importer fixture, static contract scan, `tsc --noEmit`, and both required migration commands passed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 18-02 can replace the six exact-hash seed/CSV/Markdown debt fixtures with canonical `migrateDatabase` or `assertDatabaseReady` calls.
- Plan 18-03 can add migration 030 only after Plan 18-02 removes those remaining owners.
- No remote migration, Turso write, push, deploy, or production change occurred.

## Self-Check: PASSED

- Summary and all 11 modified files exist.
- Task commits `c939103` and `f2bf699` exist in git history.
- Both plan verification commands and all task acceptance criteria passed.
- Coverage metadata classified both deliverables as fully automated with no schema errors.

---
*Phase: 18-publication-gate*
*Completed: 2026-07-15*
