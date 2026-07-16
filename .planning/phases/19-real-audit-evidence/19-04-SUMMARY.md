---
phase: 19-real-audit-evidence
plan: "04"
subsystem: readiness-audit
tags: [sqlite, inventory-ledger, deterministic-artifacts, publication-readiness, audit-safety]

requires:
  - phase: 19-03
    provides: contract-v2 evidence/readiness views and canonical migration 031
provides:
  - Complete deterministic brand/pen inventory ledger with exact provenance and relationship dispositions
  - Canonical NDJSON, CSV, and summary serializers plus explicit-path audit CLI
  - Legacy entity/library audits aligned to contract-v2 qualifying and public-state truth
  - Fail-closed checkpointed source copy seam that never SQLite-opens the protected catalog
affects: [19-05, audit-cli, library-coverage, publication-diagnostics]

tech-stack:
  added: []
  patterns:
    - Raw-universe-first ledger with bidirectional identity-set guards
    - Deterministic serializers with presentation-only limits
    - Empty-WAL, no-journal, single-link exclusive source copy into an owned root
    - Content readiness separated from publication lifecycle and public visibility

key-files:
  created:
    - src/lib/audit/readiness-audit.ts
    - scripts/audit-readiness-v2.ts
    - .planning/phases/19-real-audit-evidence/19-04-SUMMARY.md
  modified:
    - src/lib/audit/audit-contracts.ts
    - src/lib/audit/read-only-catalog.ts
    - scripts/check-audit-readiness.ts
    - scripts/check-library-contract.ts
    - scripts/audit-entity-quality.ts
    - scripts/audit-library-coverage.ts
    - src/lib/library.ts
    - package.json

key-decisions:
  - "The raw 305-identity universe and the 296-identity legacy public baseline are separate dimensions; exclusions never define the audit universe."
  - "content_ready means blocker-free publishability; legacy completion and coverage ready additionally require current membership in public_entities."
  - "After read-only SQLite access was proven to touch SHM metadata, protected sources use a fail-closed checkpointed filesystem copy and all SQLite work occurs only on the owned copy."
  - "Any non-empty WAL, rollback/master-journal artifact, external hardlink, symlink, overwrite alias, concurrent source change, or remote selection aborts before audit truth is computed."

patterns-established:
  - "Every ledger row carries the same source inventory snapshot, exact source/audit migration boundary, blockers, reviews, evidence counts, and stable relation disposition."
  - "A limit may change terminal preview rows only; canonical bytes, hashes, summary, verdict, and exit semantics remain invariant."
  - "Shared owned-copy cleanup runs on success, failure, SIGINT, and SIGTERM and proves the protected source snapshot again before exit."

requirements-completed: [AUD-01, AUD-02, AUD-03, AUD-04]

duration: 54 min
completed: 2026-07-16
status: complete
---

# Phase 19 Plan 04: Deterministic Full-Inventory Readiness Audit Summary

**Phase 19 now has one complete, deterministic readiness ledger for every raw brand/model identity, canonical machine artifacts whose truth cannot be changed by `--limit`, and legacy/library diagnostics that share contract-v2 and public-state truth.**

## Performance

- **Duration:** 54 min
- **Started:** approximately 2026-07-16T15:43:00+08:00
- **Completed:** 2026-07-16T16:37:00+08:00
- **Tasks:** 3
- **Task/recovery commits:** 7

## Accomplishments

- Implemented a raw-universe-first ledger over `entities WHERE type IN ('brand','pen') ORDER BY type,slug,id`, with one row per identity, duplicate/set-equality guards, exact source/audit schema provenance, evidence/review/blocker detail, and no limiting or inner-join loss.
- Locked the real-catalog count contract at 305 raw identities (69 brands + 236 pens) while preserving the legacy 296 baseline (65 brands + 231 pens) as a separate trace dimension with exact four-brand/five-pen exclusions.
- Added complete pen `made_by` dispositions (`exactly_one`, `missing`, `multiple`, `noncanonical`) and complete brand raw/public/difference reverse-model sets without slices.
- Added pure deterministic NDJSON, fixed-column RFC4180/spreadsheet-safe CSV, and summary JSON serializers. Repeated runs and `--limit=1` produce identical artifact bytes, hashes, summary, verdict, and exit behavior.
- Added an explicit local-path CLI with bounded limits, output canonicalization, source/sidecar alias rejection, temporary writes, and no Plan 19-04 fixed artifacts.
- Reworked entity quality, library coverage, and public model-spec projection to consume contract-v2 qualifying truth. A single blocker fails; deprecated, pending, needs-source, candidate, or draft state cannot become ready through score aggregation.
- Replaced protected-source SQLite access with a shared checkpointed exclusive-copy seam after live verification showed even read-only SQLite could touch SHM metadata. Migration 031, `quick_check`, foreign-key validation, readiness queries, and library checks now run only on owned copies.
- Added success, failure, `SIGINT`, and `SIGTERM` lifecycle checks for the readiness CLI, both legacy CLIs, the library checker, and the shared fixture layer.

## Recovery and Task Commits

The interrupted workspace was classified as **incomplete mixed WIP**: the checker contained useful failing contract intent, while `readiness-audit.ts` explicitly threw an unimplemented error. A duplicate fixture slug initially masked the intended RED failure; it was corrected before the recovered test commit. No passing implementation was backdated and no history was fabricated.

1. **Task 1 RED / recovered contract** - `4a286f1` (`test`)
2. **Task 1 GREEN / complete inventory ledger** - `850dc27` (`feat`)
3. **Task 2 RED / deterministic artifact contracts** - `7ba2f72` (`test`)
4. **Task 2 GREEN / artifact CLI and serializers** - `4b85175` (`feat`)
5. **Task 3 RED / legacy truth and safety regressions** - `1991ebf` (`test`)
6. **Task 3 GREEN / shared legacy/library truth and safety seam** - `a2714aa` (`feat`)
7. **Peer-audit fixes / lifecycle, draft, hardlink, journal, and race closure** - `93f02bb` (`fix`)

## Requirement Coverage

| Dimension | Requirement | Evidence | Result |
| --- | --- | --- | --- |
| D-01/D-07 | AUD-01 | `--inventory` proves every raw brand/pen identity appears exactly once; fixture shells cover no publication/story/evidence and all relation states. | Pass |
| D-02 | AUD-02 | One-blocker and fully-qualified-draft fixtures prove no score or stale lifecycle state can produce legacy/library ready. | Pass |
| D-02 | AUD-03 | Repeat/unlimited/limit=1 artifacts have identical bytes, hashes, summary, verdict, and exit semantics; formula/comma/quote/CRLF CSV fixtures pass. | Pass |
| D-01/D-07 | AUD-04 | Exact 030→031 provenance, full `made_by`/reverse sets, fail-closed source copy, and explicit path/sidecar protections pass. | Pass |

## Validation Results

- `pnpm check:audit-readiness -- --inventory --backup-migration` - passed; complete identity and exact 030→031 provenance contracts.
- `pnpm check:audit-readiness -- --artifacts-limit --cli-inputs` - passed; deterministic artifacts and all limit/path/alias negative cases.
- `pnpm check:audit-readiness -- --legacy-audits` - passed; complete JSON, limit invariance, one-blocker failure, fully-qualified draft rejection, qualifying status truth, and field-evidence projection.
- `pnpm check:audit-readiness -- --library-contract-safety` - passed; WAL/journal/symlink/hardlink/overwrite/concurrency failures and all three readiness entrypoints plus library success/failure/SIGINT/SIGTERM cleanup.
- `pnpm check:audit-readiness -- --fixture-isolation` - passed; fixture success/failure/SIGINT/SIGTERM cleanup and real source snapshot preservation.
- `pnpm check:library` - passed on the final checkpointed-copy seam; counts remained sources 141, source items 895, claims 390, citations 1465, stories 320, events 73, diagrams 9, media 614, community 2, exhibits 6, external IDs 61, aliases 865, Commons media 28.
- `pnpm check:migrations -- --migration-ownership` - passed; 104 scripts scanned, missing-031 importer stayed fail-closed, and fresh full replay passed.
- `pnpm exec tsc --noEmit` - passed.
- `pnpm lint` - passed with one pre-existing non-blocking `!important` warning in `src/app/globals.css`.
- `git diff --check` - passed.
- Temporary-root scan - passed after removing three abandoned pre-fix signal-probe roots and rerunning the signal suite; no Phase 19/readiness/library roots remain.
- Dual peer audit - logic peer found three P1s and safety peer found lifecycle/race gaps; every finding was fixed. The safety peer's final current-WIP pass reported **No findings**.

## Real Catalog Incident Record

This plan did **not** preserve the original WAL/SHM inode/mtime metadata. The incident is recorded here without attempting to disguise or reconstruct metadata.

### Original baseline before Plan 19-04 verification

| File | Size | Inode | mtimeNs | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `data/fpkg.db` | 24,723,456 | 46,507,656 | 1784118828687297235 | `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc` |
| `data/fpkg.db-wal` | 0 | 69,613,957 | 1784124771168463361 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `data/fpkg.db-shm` | 32,768 | 69,613,958 | 1784177744931228537 | `fd4c9fda9cd3f9ae7c962b0ddf37232294d55580e1aa165aa06129b8549389eb` |

### Incident timeline

1. **2026-07-16T16:11:38+08:00 — legacy library checker incident.** The then-existing `pnpm check:library` opened `data/fpkg.db` through a normal libSQL client. On close, it deleted the pre-existing empty WAL and zero-filled SHM. The main database remained byte- and metadata-identical. No unlinked open handles remained. WAL and SHM bytes/sizes were restored from their known exact values, but the deleted files' original inode/mtime metadata was irrecoverable.
2. **2026-07-16T16:18:12+08:00 — read-only online-backup guard incident.** The first safety repair used the Phase 19 read-only SQLite online-backup seam. Its exact before/after guard correctly failed because opening the empty-WAL source still changed SHM mtime. SHM bytes, size, and inode remained unchanged; no metadata restoration was attempted.
3. **After the second incident.** Work stopped on every protected-source SQLite-open path. The implementation moved to the parent-authorized equivalent fail-closed checkpointed copy: empty/absent WAL only, no rollback/master journal, all present family files regular/non-symlink/single-link, exclusive owned destination, source descriptor/hash/stat verification, and exact source snapshots through final cleanup.

### Final post-incident baseline

| File | Size | Inode | mtimeNs | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `data/fpkg.db` | 24,723,456 | 46,507,656 | 1784118828687297235 | `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc` |
| `data/fpkg.db-wal` | 0 | 70,043,998 | 1784189498823576647 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `data/fpkg.db-shm` | 32,768 | 70,043,999 | 1784189892661781716 | `fd4c9fda9cd3f9ae7c962b0ddf37232294d55580e1aa165aa06129b8549389eb` |

All final bare-library, audit, migration, signal, type, and lint regressions preserved this **post-incident** baseline exactly. The main database never changed. WAL/SHM bytes and sizes match the original baseline, while their inode/mtime differences remain explicitly acknowledged.

## Peer Audit Findings and Resolutions

| Finding | Severity | Resolution |
| --- | --- | --- |
| Fully evidenced entities demoted to `draft` retained zero blockers and were marked ready by legacy/library layers. | P1 | Kept `content_ready` as publishability, but completion/coverage/exit now additionally require `is_public`; added a fully-qualified draft fixture. |
| External hardlinks could present a main file without the original alias-WAL. | P1 | Require `nlink === 1` for every present source-family file; added a non-empty-WAL owner + main-hardlink bypass fixture. |
| Main-only copy ignored rollback hot journals. | P1 | Reject `-journal` and master-journal artifacts before and after copy; non-empty WAL remains fail-closed. |
| Readiness helper checked the source only on successful return and lacked signal cleanup. | P1/P2 | Moved exact source postcondition and owned-root/client cleanup into the shared helper; covered failure, SIGINT, and SIGTERM for readiness and both legacy CLIs. |
| A destination created in the `O_EXCL` race window could be deleted by failure cleanup. | P2 | Track the created destination device/inode and remove only the exact file owned by this invocation. |
| Library workspace could create a root before source snapshot failure. | P2 | Snapshot the source before root creation; install signal handlers synchronously immediately after root construction. |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Repaired a duplicate-slug fixture that masked the intended RED state**

- **Found during:** Recovery before Task 1.
- **Issue:** A fixture identity collided with an existing locked legacy slug and failed before reaching the unimplemented audit source.
- **Fix:** Gave the fixture its own identity while preserving the legacy-exclusion assertion.
- **Verification:** The recovered RED failed specifically on the missing provenance/readiness implementation, then the GREEN inventory contract passed.
- **Committed in:** `4a286f1`, `850dc27`.

**2. [Rule 3 - Blocking] Restored signal cleanup registration in audit child probes**

- **Found during:** Task 1 fixture regression.
- **Issue:** A previous process-level handler state made child signal probes exit without the expected cleanup path.
- **Fix:** Each signal probe now installs handlers in its own child lifecycle; abandoned pre-fix roots were identified as unowned by live processes, removed, and the full dual-signal suite rerun.
- **Verification:** `--fixture-isolation` and `--library-contract-safety` both pass; final temp scan is empty.
- **Committed in:** `850dc27`, `93f02bb`.

**3. [Rule 2 - Safety] Replaced protected-source SQLite online backup with checkpointed exclusive copy**

- **Found during:** Task 3 `check:library` verification and its first safety repair.
- **Issue:** A normal libSQL connection deleted sidecars, and a subsequent verified read-only SQLite connection changed SHM mtime even with an empty WAL.
- **Fix:** Protected sources are never SQLite-opened. The new seam rejects WAL/journal/hardlink/symlink/race states, copies only a proven checkpointed main file into an owned root, and performs migration/readiness/library SQLite work only there. This equivalent fail-closed route was explicitly authorized after the incident.
- **Verification:** Repeated bare `check:library`, all audit modes, both signal suites, and final fingerprint checks leave the post-incident baseline exactly unchanged.
- **Committed in:** `a2714aa`, `93f02bb`.

**4. [Rule 1 - Bug] Prevented migration ownership drift in the 030 provenance fixture**

- **Found during:** Final migration-ownership regression.
- **Issue:** The audit checker dynamically enumerated migration files, which violated the single canonical migration-owner rule.
- **Fix:** The source-030 fixture uses an explicit locked 001–030 manifest and still delegates all execution to `migrateDatabase`.
- **Verification:** Migration ownership scans 104 scripts with no exception; missing-031 and fresh replay tests pass.
- **Committed in:** `a2714aa`.

**5. [Rule 1/2 - Peer audit] Closed draft, hardlink, journal, lifecycle, and destination-race gaps**

- **Found during:** Dual read-only peer audit after Task 3.
- **Fix:** Added public-state completion, single-link and journal guards, helper-wide postconditions/dual-signal cleanup, construction ordering, and inode-owned failure cleanup.
- **Verification:** Every targeted fixture and full regression passed; final safety peer returned No findings.
- **Committed in:** `93f02bb`.

---

**Total deviations:** 5 auto-fixed (3 bugs/blockers, 2 safety clusters).  
**Impact on plan:** The ledger/artifact/status scope is unchanged. The source-snapshot mechanism changed from SQLite online backup to a stricter parent-authorized checkpointed copy because live evidence proved SQLite read access could violate the required sidecar metadata invariant.

## Issues Encountered

- Three `fpkg-phase19-signal-probe-*` roots from failed pre-fix runs were found with no open handles, removed as owned test debris, and not recreated by the passing dual-signal rerun.
- Biome continues to report one pre-existing `!important` warning in `src/app/globals.css`; it is unrelated and was not changed.
- No remote/Turso connection, network operation, deployment, content/taxonomy repair, Plan 19-05 artifact generation, or real identity/relation mutation occurred.

## User Setup Required

None. No credentials, remote resources, or configuration changes are required.

## Next Phase Readiness

- Plan 19-05 can run the real full audit through the checkpointed-copy seam, but it must use the **final post-incident baseline above**, not the original WAL/SHM inode/mtime values.
- A non-empty WAL, rollback/master journal, external hardlink, symlink, or concurrent source mutation is a hard stop. Plan 19-05 must not attempt recovery or metadata restoration.
- Plan 19-05 remains the owner of final fixed-path NDJSON/CSV/summary artifacts and any real 305-row blocker/disposition report. Plan 19-04 generated fixture artifacts only in owned temporary directories.

## Self-Check: PASSED

- All created/modified implementation files exist and all seven task/recovery commits are present.
- Every Plan 19-04 verification plus migration ownership, fixture/signal isolation, TypeScript, lint, diff, temp-root, and dual-peer checks passed.
- The latest safety peer reported no remaining findings after all fixes.
- No implementation stub remains; the two “not implemented” strings in the checker are existence-guard failure messages, and `placeholders` occurrences in `library.ts` are SQL parameter arrays.
- The original sidecar metadata was not preserved; the incident and final stable post-incident baseline are recorded in full above.

---
*Phase: 19-real-audit-evidence*
*Completed: 2026-07-16*
