---
phase: 19-real-audit-evidence
plan: "01"
subsystem: audit-safety
tags: [sqlite, better-sqlite3, readonly, online-backup, disposable-fixtures]

requires:
  - phase: 18-publication-gate
    provides: publication gate and canonical database ownership boundaries
provides:
  - Typed read-only SQLite adapter with explicit local-path and query-only enforcement
  - Main/WAL/SHM snapshot guard plus owned-root online backup support
  - Shared disposable Phase 19 fixture lifecycle and executable isolation checks
affects: [19-02, 19-03, 19-04, 19-05]

tech-stack:
  added: []
  patterns:
    - Explicit absolute-path read-only catalog adapter
    - Owned-root online backups with source and symlink escape rejection
    - Signal-safe disposable fixtures with sanitized database environment

key-files:
  created:
    - scripts/check-audit-readiness.ts
    - scripts/check-evidence-contract.ts
    - scripts/lib/phase19-fixtures.ts
    - src/lib/audit/audit-contracts.ts
    - src/lib/audit/read-only-catalog.ts
    - .planning/phases/19-real-audit-evidence/19-01-SUMMARY.md
  modified:
    - package.json

key-decisions:
  - "A non-empty WAL is opened only when filesystem immutability prevents SQLite from mutating SHM; otherwise audit fails before opening."
  - "Canonical migrations and child processes run only under one owned mkdtemp fixture with sanitized database environment."

patterns-established:
  - "Audit reads expose only all/get/close and never expose the raw SQLite handle."
  - "Backup destinations must be new canonical paths inside a caller-owned realpath root."
  - "Fixture cleanup is idempotent, signal-aware, and proves the real catalog invariant before returning."

requirements-completed: [AUD-01, AUD-04, QA-01]

duration: 17 min
completed: 2026-07-16
status: complete
---

# Phase 19 Plan 01: Audit Safety Seams Summary

**Phase 19 now has a fail-closed read-only catalog seam, a protected online-backup path, and disposable audit fixtures that cannot silently fall through to the real catalog.**

## Performance

- **Duration:** 16m 39s
- **Started:** 2026-07-16T05:14:23Z
- **Completed:** 2026-07-16T05:31:02Z
- **Tasks:** 2
- **Production files changed:** 6

## Accomplishments

- Added a typed `AuditReadClient` whose runtime surface is limited to parameterized `all`, `get`, and `close` operations, with `query_only` verified after opening.
- Added full main/WAL/SHM filesystem snapshots, source-preserving online backups, and rejection of remote URLs, missing/relative paths, source aliases, existing destinations, and symlink escapes.
- Added a shared disposable fixture lifecycle that owns its temporary root, sanitizes database environment variables, runs canonical migrations only there, cleans up after success, failure, `SIGINT`, and `SIGTERM`, and rechecks the real catalog invariant.
- Added executable audit-readiness and evidence-contract commands without adding dependencies or an audit CLI prematurely.

## Task Commits

Each task was committed independently:

1. **Task 1 RED: codify read-only catalog contract checks** - `8010c60` (`test`)
2. **Task 1 GREEN: implement the protected read-only catalog adapter** - `2c65e04` (`feat`)
3. **Task 2: add disposable fixture lifecycle and evidence checks** - `14dbb4a` (`feat`)

## Files Created/Modified

- `src/lib/audit/audit-contracts.ts` - Defines the narrow audit client, result, provenance, snapshot, and backup contracts.
- `src/lib/audit/read-only-catalog.ts` - Opens explicit local catalogs read-only, enforces query-only statements, snapshots sidecars, and creates protected online backups.
- `scripts/lib/phase19-fixtures.ts` - Provides the single owned fixture lifecycle, sanitized environment, canonical migration setup, child tracking, and cleanup guards.
- `scripts/check-audit-readiness.ts` - Exercises read isolation, write/DDL rejection, snapshot preservation, backup boundaries, and fixture lifecycle behavior.
- `scripts/check-evidence-contract.ts` - Proves real/remote fail-closed behavior and disposable migration ownership.
- `package.json` - Registers `check:audit-readiness` and `check:evidence-contract`.

## Requirement Coverage

| Dimension | Requirement | Evidence | Result |
| --- | --- | --- | --- |
| D-01 | AUD-01 | `check-audit-readiness --readonly-isolation` validates explicit local read-only access, query-only enforcement, write rejection, closure, and unchanged main/WAL/SHM snapshots. | Pass |
| D-01 | AUD-04 | `check-audit-readiness --readonly-backup` validates an online backup inside the owned root and rejects source, sidecar, existing, outside-root, and symlink-escape destinations. | Pass |
| D-02 | QA-01 | Both fixture-isolation checks plus migration ownership prove canonical migrations and child processes use only a disposable owned database. | Pass |

## Verification

- `pnpm exec tsx scripts/check-audit-readiness.ts --readonly-isolation` - passed.
- `pnpm exec tsx scripts/check-audit-readiness.ts --readonly-backup` - passed.
- `pnpm check:audit-readiness -- --fixture-isolation` - passed; success, failure, `SIGINT`, and `SIGTERM` fixtures were removed.
- `pnpm check:evidence-contract -- --fixture-isolation` - passed; canonical migrations ran only against the disposable path and real/remote targets failed closed.
- `pnpm check:migrations -- --migration-ownership` - passed; 103 scripts scanned, missing-migration importer passed, and full replay passed.
- `pnpm exec tsc --noEmit` - passed.
- Explicit script typecheck for all three new check/fixture scripts - passed.
- `git diff --check` - passed.
- Temporary-root scan - passed; no `fpkg-phase19-*` or `fpkg-audit-*` roots remained.
- Stub scan - passed; no TODO, FIXME, placeholder, coming-soon, or unavailable implementation remained.

## Real Catalog Invariant

The real database was never opened through SQLite during this plan. Its filesystem-only snapshot before and after all checks was identical:

| File | Exists | Size | Inode | mtimeNs | SHA-256 |
| --- | --- | ---: | ---: | ---: | --- |
| `data/fpkg.db` | yes | 24,723,456 | 46,507,656 | 1784118828687297235 | `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc` |
| `data/fpkg.db-wal` | yes | 0 | 69,613,957 | 1784124771168463361 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `data/fpkg.db-shm` | yes | 32,768 | 69,613,958 | 1784177744931228537 | `fd4c9fda9cd3f9ae7c962b0ddf37232294d55580e1aa165aa06129b8549389eb` |

No remote/Turso connection, network access, deployment, migration 031, or real-catalog mutation was performed.

## Decisions Made

- A writable catalog with a non-empty WAL is rejected before SQLite opens it. Read-only SQLite can still rewrite SHM metadata, so audit access requires filesystem immutability for that state and then proves the source snapshot remains unchanged.
- The fixture owns one canonical temporary realpath. Cleanup refuses unmanaged roots, restores the caller environment, terminates registered children, closes registered clients, and checks the real-catalog snapshot even on failure or signal paths.
- Package-script forwarding may include a literal `--`; the checkers normalize it while preserving fail-closed argument parsing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Safety] Added a fail-closed precondition for writable catalogs with non-empty WAL files**

- **Found during:** Task 1 verification using disposable SQLite fixtures.
- **Issue:** Even a `readonly`/`query_only` connection can mutate an existing SHM file while recovering a non-empty WAL.
- **Fix:** Reject that state before opening unless the main file, WAL, SHM, and parent directory are all filesystem non-writable; retain the before/after snapshot guard in every case.
- **Files modified:** `src/lib/audit/read-only-catalog.ts`, `scripts/check-audit-readiness.ts`.
- **Verification:** WAL crash fixtures cover both rejection and immutable-source success while proving every source file is unchanged.
- **Committed in:** `2c65e04`.

**2. [Rule 1 - Bug] Normalized the literal `--` forwarded by pnpm scripts**

- **Found during:** Task 2 fixture-isolation verification.
- **Issue:** `pnpm <script> -- --fixture-isolation` forwards a literal separator, which the strict parser correctly treated as unknown.
- **Fix:** Strip only the standalone separator before parsing supported modes.
- **Files modified:** `scripts/check-audit-readiness.ts`, `scripts/check-evidence-contract.ts`.
- **Verification:** Both required package-script commands pass while all other unknown arguments remain rejected.
- **Committed in:** `14dbb4a`.

---

**Total deviations:** 2 auto-fixed (1 safety, 1 bug)
**Impact on plan:** Both changes were necessary to satisfy the stated isolation and fail-closed contracts; neither broadened the feature scope.

## Issues Encountered

- A disposable exploratory WAL probe initially contained invalid SQL quoting; its owned temporary root was located and removed immediately. It never referenced or opened the real catalog.

## User Setup Required

None. No credentials, remote resources, or configuration changes are required.

## Next Phase Readiness

- Plans 19-02 through 19-05 can build audit queries and evidence reports on the narrow `AuditReadClient` without acquiring a writable handle.
- Any operation that needs migrations must use `withPhase19Fixture`; an audit of a writable non-empty-WAL source must first use an external immutable snapshot or otherwise satisfy the enforced filesystem immutability precondition.

## Self-Check: PASSED

- All five newly created TypeScript files and the two package scripts exist.
- Task commits `8010c60`, `2c65e04`, and `14dbb4a` exist in history.
- Every plan verification and the additional TypeScript/diff/stub/temp-root checks passed.
- The before/after real catalog main/WAL/SHM snapshot is exactly identical.
- No remote, deployment, destructive, or real-database action occurred.

---
*Phase: 19-real-audit-evidence*
*Completed: 2026-07-16*
