---
phase: 19-real-audit-evidence
plan: "03"
subsystem: publication-runtime
tags: [sqlite, canonical-hash, evidence, review-ledger, atomic-transaction, fail-closed]

requires:
  - phase: 19-real-audit-evidence
    plan: "02"
    provides: normalized evidence schema, contract-v2 blockers, invalidation triggers, and public_entities authorization
  - phase: 18-publication-gate
    provides: publication lifecycle service and direct-SQL publication guards
provides:
  - Deterministic sha256:v2 canonical payload spanning publication facts, evidence, provenance, conflicts, and media
  - Current-hash fact, language, media, and transaction-owned publication reviews
  - One-transaction no-retry publish flow with exact blocker checks, rollback, and final membership assertion
  - Adversarial direct-SQL, invalidation, rollback, cross-owner, and fixture-cleanup regression matrices
affects: [19-04, 19-05]

tech-stack:
  added: []
  patterns:
    - Fixed-key canonical JSON with NFC, newline normalization, stable sorting, and review exclusion
    - Publication authorization snapshot and final review owned by one bounded write transaction
    - Immutable canonical identifiers and immutable published authorization snapshots
    - Executor-owned online-backup fixtures with combined legacy/shared signal cleanup

key-files:
  created:
    - .planning/phases/19-real-audit-evidence/19-03-SUMMARY.md
  modified:
    - src/lib/publication.ts
    - migrations/031_evidence_readiness_v2.sql
    - src/lib/db.ts
    - scripts/lib/phase19-fixtures.ts
    - scripts/check-evidence-contract.ts
    - scripts/check-publication-gate.ts

key-decisions:
  - "Canonical IDs are semantic payload identity and therefore immutable after insertion."
  - "Any content revision revokes all prior approved reviews so exact-content reversion cannot reactivate an old authorization."
  - "A published authorization snapshot cannot be edited in place; legitimate republish first demotes and then replaces it transactionally."
  - "The publication review is server-owned and written only after the current v2 lifecycle snapshot exists inside the same transaction."

patterns-established:
  - "Review rows never enter the content hash or increment content revision, but current-hash review loss immediately blocks and hides publication."
  - "Every canonical dependency mutation follows payload ownership, including cross-owner claim, citation, and source-item paths."
  - "Direct SQL and server publication are independently fail closed; diagnostics never authorize membership."

requirements-completed: [EVID-01, EVID-02, EVID-03, EVID-04, EVID-05, EVID-06, AUD-02, AUD-03, QA-01]

coverage:
  - id: D1
    description: "The deterministic sha256:v2 payload covers facts, classification, evidence, locator, scope, provenance, conflicts, media, references, timeline, variants, and made_by while excluding review rows."
    requirement: "EVID-01, EVID-02, EVID-03, EVID-04, EVID-05"
    verification:
      - kind: integration
        ref: "pnpm check:evidence-contract -- --hash-invalidation"
        status: pass
      - kind: integration
        ref: "pnpm check:publication-gate -- --invalidation"
        status: pass
    human_judgment: false
  - id: D2
    description: "Fact, language, media, and publication reviews independently bind to the same current hash, with exact incomplete-core-evidence blockers."
    requirement: "EVID-02, EVID-03, EVID-04, EVID-06, AUD-02"
    verification:
      - kind: integration
        ref: "pnpm check:evidence-contract -- --readiness-publish"
        status: pass
    human_judgment: false
  - id: D3
    description: "One ordered no-retry transaction owns the final snapshot and publication review; blockers and failures roll back, direct SQL cannot bypass guards, and qualified brand plus pen fixtures publish atomically."
    requirement: "AUD-02, AUD-03, QA-01"
    verification:
      - kind: integration
        ref: "pnpm check:publication-gate -- --publish"
        status: pass
      - kind: integration
        ref: "pnpm check:publication-gate -- --migration-full"
        status: pass
      - kind: other
        ref: "pnpm exec tsc --noEmit"
        status: pass
    human_judgment: false
  - id: D4
    description: "Fresh, upgrade, replay, schema-manifest, checksum, integrity, and signal-cleanup checks mutate only owned disposable fixtures and preserve the real catalog byte for byte."
    requirement: "QA-01"
    verification:
      - kind: integration
        ref: "pnpm check:evidence-contract -- --migration && pnpm check:evidence-contract -- --schema"
        status: pass
      - kind: manual_procedural
        ref: "filesystem-only before/after size, inode, mtimeNs, and SHA-256 comparison"
        status: pass
    human_judgment: false

duration: 48 min
completed: 2026-07-16
status: complete
---

# Phase 19 Plan 03: Atomic Publication Contract v2 Summary

**Publication contract v2 now hashes the complete evidence graph and authorizes public membership only through four current-hash reviews and one rollback-safe, no-retry transaction.**

## Performance

- **Duration:** 48m 20s
- **Started:** 2026-07-16T06:42:10Z
- **Completed:** 2026-07-16T07:30:30Z
- **Tasks:** 2
- **Production and checker files modified:** 6

## Accomplishments

- Upgraded the canonical payload to deterministic `sha256:v2`, with fixed keys/nulls, stable sort and deduplication, NFC/newline normalization, complete normalized evidence/provenance/conflict/media content, and no review self-reference.
- Added `recordEntityContentReview()` for fact/language/media reviews bound to the current hash; `publishEntity()` alone owns the publication review.
- Implemented the exact single write-transaction sequence: current hash/revision and first-three review validation, in-review v2 snapshot, final review, blocker query, published transition, `public_entities` assertion, commit; every failure rolls back and no retry occurs.
- Added complete deterministic brand and pen fixtures plus exact missing citation/locator/scope/provenance blockers, 38 invalidating dependency mutations, cross-owner fan-out, standalone deletes, direct-SQL negatives, transaction tracing, rollback, republish, and signal-cleanup probes.
- Closed peer-reproduced primary-key and lifecycle snapshot bypasses with 18 immutable ID guards, old-review revocation on content revision, and immutable published authorization snapshots.

## Task Commits

Each task and audit fix was committed atomically:

1. **Task 1 RED: add failing publication hash v2 check** - `b7ecbb6` (`test`)
2. **Task 1 GREEN: enforce publication contract v2 runtime** - `38c9497` (`feat`)
3. **Task 2: verify atomic publication contract v2** - `abf6111` (`test`)
4. **Peer safety fixes: close direct-SQL publication bypasses** - `c921ade` (`fix`)

## Files Created/Modified

- `src/lib/publication.ts` - Defines the v2 canonical payload/hash, content-review API, and ordered atomic publication transaction.
- `scripts/lib/phase19-fixtures.ts` - Builds deterministic qualified brand/pen evidence graphs on executor-owned online-backup fixtures and owns shared cleanup.
- `scripts/check-evidence-contract.ts` - Verifies deterministic hashing, review exclusion, exact evidence blockers, readiness, rollback, and atomic publication.
- `scripts/check-publication-gate.ts` - Exercises 38 dependency invalidations, cross-owner fan-out, direct-SQL guards, transaction order, no retry, rollback, ID immutability, stale-hash reuse, and combined signal cleanup.
- `migrations/031_evidence_readiness_v2.sql` - Adds canonical-ID immutability, prior-review revocation on revision, and immutable published authorization snapshots.
- `src/lib/db.ts` - Requires all new v2 safety triggers in the runtime schema manifest.

## Requirement Coverage

| Requirement | Evidence | Result |
| --- | --- | --- |
| EVID-01 | Canonical payload includes explicit fact scopes and scoped spec/claim evidence. | Pass |
| EVID-02 | Spec evidence includes citation, locator, scope, and qualifying provenance in hash and blockers. | Pass |
| EVID-03 | Core/editorial/unclassified classification and complete claim evidence chains are hashed and independently blocked. | Pass |
| EVID-04 | Source tier, independence group, archive, allowed-use, retrieval, registry, and defaults are canonical dependencies. | Pass |
| EVID-05 | Conflict rows/members and qualified reusable primary media enter the hash and invalidation matrix. | Pass |
| EVID-06 | Four distinct current-hash reviews are required; review rows remain outside the hash/revision loop. | Pass |
| AUD-02 | Full brand and pen fixtures publish only when every evidence, review, media, conflict, and made-by rule is satisfied. | Pass |
| AUD-03 | Direct SQL, stale snapshots, reused old hashes, partial transactions, and critical mutations cannot retain public membership. | Pass |
| QA-01 | Migration, schema, hash, readiness, invalidation, publish, rollback, replay, cleanup, and real-catalog invariants are reproducible. | Pass |

## Validation Results

- `pnpm check:evidence-contract -- --migration` - passed first after the final migration change; fresh/upgrade online backup, canonical replay, checksum, quick-check, and foreign-key checks are green.
- `pnpm check:evidence-contract -- --schema` - passed after migration validation; all normalized objects and fail-closed constraints are present.
- `pnpm check:evidence-contract -- --hash-invalidation` - passed; v2 payload determinism, review exclusion, and four exact incomplete-core-evidence cases are green.
- `pnpm check:evidence-contract -- --readiness-publish` - passed; first-three current-hash reviews, transaction-owned final review, rollback, and brand/pen publication are green.
- `pnpm check:publication-gate -- --invalidation` - passed; 38 legacy/v2 dependencies, standalone deletes, and cross-owner invalidation are green.
- `pnpm check:publication-gate -- --publish` - passed; direct-SQL negatives, 18 ID guards, old-hash reuse, ordered single transaction, no retry, rollback, and combined SIGTERM cleanup are green.
- `pnpm check:publication-gate -- --migration-full` - passed all 6 fresh/upgrade/idempotent/integrity/compatibility/invalidation/publication checks.
- `pnpm exec tsc --noEmit` and `git diff --check` - passed.
- Final read-only peer re-audit of `c921ade` - PASS with no remaining P0-P3 finding after dynamic reproduction of both original P1 bypasses and all critical matrices.

## Real Catalog Invariant

The real database was never opened through SQLite. Every database write occurred only on an executor-owned disposable copy. Filesystem-only fingerprints before and after all implementation, tests, and peer review were exactly identical:

| File | Size | Inode | mtimeNs | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `data/fpkg.db` | 24,723,456 | 46,507,656 | 1784118828687297235 | `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc` |
| `data/fpkg.db-wal` | 0 | 69,613,957 | 1784124771168463361 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `data/fpkg.db-shm` | 32,768 | 69,613,958 | 1784177744931228537 | `fd4c9fda9cd3f9ae7c962b0ddf37232294d55580e1aa165aa06129b8549389eb` |

Migration 030 also remained byte-identical: size 36,778, inode 69,521,886, mtimeNs 1784118029048821668, SHA-256 `1737d53f29c6f8d1c947f93d2a71bf9dd672de150d75dd81b150c48749d21e4a`. No remote connection, network access, deployment, real-catalog migration, package change, or Plan 19-04/19-05 action occurred.

## Decisions Made

- Canonical identifiers are part of payload meaning. Updating an ID is rejected rather than attempting to infer every generic-reference owner during a primary-key rewrite.
- Any content revision revokes every prior approved review while preserving the ledger row for audit. Returning bytes to an old hash therefore cannot reactivate old authorization.
- Published authorization fields cannot be changed while status remains published. Normal invalidation demotes first; server republish writes a fresh snapshot and review inside one transaction.
- Fixture signal handling is explicitly installed and combined at the CLI boundary so legacy and Phase 19 fixtures are both awaited before process exit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Safety] Closed canonical-ID and published-snapshot direct-SQL bypasses**

- **Found during:** Final Task 2 adversarial peer audit.
- **Issue:** A canonical primary-key rewrite changed the computed hash without invalidation, and a published lifecycle row could replace its authorization snapshot in place with a previously approved hash.
- **Fix:** Added 18 immutable ID guards, revoked all approved reviews after content revision, rejected in-place published snapshot edits, and required every new trigger in the v2 schema manifest.
- **Files modified:** `migrations/031_evidence_readiness_v2.sql`, `src/lib/db.ts`, `scripts/check-evidence-contract.ts`, `scripts/check-publication-gate.ts`.
- **Verification:** Both original reproductions now fail with exact guards; all IDs, stale old-hash paths, server recovery, migration replay, and peer re-audit pass.
- **Committed in:** `c921ade`.

**2. [Rule 1 - Bug] Activated complete invalidation and standalone-delete evidence**

- **Found during:** Peer audit of Task 2 checks.
- **Issue:** Seven legacy payload dependencies were present only in a dormant matrix, and some delete cases used a second marker mutation that could mask a missing delete trigger.
- **Fix:** Expanded the active matrix to 38 dependencies and made citation, member, conflict, and source deletes prove invalidation independently; added explicit cross-owner claim/citation/source assertions.
- **Files modified:** `scripts/check-publication-gate.ts`.
- **Verification:** All 38 mutations, standalone deletes, and both cross-owner publications pass and immediately demote.
- **Committed in:** `c921ade`.

**3. [Rule 3 - Blocking] Unified fixture signal cleanup and updated full-matrix migration boundaries**

- **Found during:** Peer audit of CLI cleanup followed by `--migration-full` replay.
- **Issue:** Mode-specific signal handlers could leave shared fixtures behind in aggregate modes, while two legacy full-matrix checks still assumed migration 030 was the latest contract.
- **Fix:** Installed one combined legacy/shared cleanup handler, exported idempotent shared cleanup, allowed current-catalog copies to apply 031, and kept the legacy type-transition contract on an intentional 030-only fixture.
- **Files modified:** `scripts/lib/phase19-fixtures.ts`, `scripts/check-publication-gate.ts`.
- **Verification:** Shared SIGTERM probe and all 6 `--migration-full` checks pass.
- **Committed in:** `c921ade`.

---

**Total deviations:** 3 auto-fixed (1 safety, 1 test correctness, 1 blocking compatibility/cleanup issue)
**Impact on plan:** The migration and readiness-manifest expansion was explicitly authorized to close peer-reproduced publication bypasses. All additional changes are limited to fail-closed safety and executable proof; no product/content scope was added.

## Issues Encountered

- The Task 1 RED check correctly failed on the previous v1 hash before runtime implementation.
- Aggregate `--migration-full` initially exposed stale 030-only checker assumptions after migration 031 became canonical; the compatibility fixture was made version-explicit and the complete matrix now passes.
- A nested peer transaction audit process was unavailable, so the primary peer agent independently performed the required read-only static and dynamic re-audit and returned a final PASS.

## User Setup Required

None. No credentials, remote services, package installation, configuration, or production migration is required.

## Next Phase Readiness

- Plan 19-04 may consume a deterministic complete v2 hash and a publication service whose server and direct-SQL paths independently fail closed.
- No unresolved P0-P3 peer finding remains. Real content is still deliberately untouched and must continue through disposable/read-only audit paths.
- Plan 19-04 and 19-05 were not started.

## Self-Check: PASSED

- Runtime symbols, fixtures, checker modes, migration guards, and schema manifest exist in the committed files.
- Task commits `b7ecbb6`, `38c9497`, `abf6111`, and `c921ade` exist in history.
- Migration-first, schema, four required plan commands, migration-full, TypeScript, diff, and final peer checks pass.
- Real DB/WAL/SHM and migration 030 size, inode, mtimeNs, and SHA-256 are exactly unchanged.
- Work stayed on Plan 19-03; no remote, deployment, destructive, content, package, Plan 19-04, or Plan 19-05 action occurred.

---
*Phase: 19-real-audit-evidence*
*Completed: 2026-07-16*
