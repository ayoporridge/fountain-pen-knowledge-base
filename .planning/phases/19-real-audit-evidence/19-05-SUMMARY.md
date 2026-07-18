---
phase: 19-real-audit-evidence
plan: "05"
subsystem: audit-acceptance
tags: [evidence-contract, real-inventory, public-parity, playwright, sqlite-safety]

requires:
  - phase: 19-04
    provides: deterministic 305-row ledger and protected-source checkpoint-copy seam
provides:
  - Complete QA-01 negative/positive evidence matrix with exact blocker assertions
  - Fixed deterministic readiness artifacts for all 305 raw brand/pen identities
  - Independent contract-v2 public-surface and reverse brand-model parity evidence
  - Disposable build/browser orchestration with fail-closed signal, process-group, and descriptor ownership
affects: [phase-19-verification, audit-artifacts, publication-gate, public-boundary]

tech-stack:
  added: []
  patterns:
    - Protected catalog is never SQLite-opened; all reads use a verified checkpointed copy
    - Exact blocker fixtures vary one evidence dependency at a time
    - Browser children share an owned canonical-migration fixture with local-only server selection
    - Signal cleanup retains resources when ownership or process termination cannot be proven

key-files:
  created:
    - .planning/phases/19-real-audit-evidence/artifacts/inventory-readiness-v2.ndjson
    - .planning/phases/19-real-audit-evidence/artifacts/inventory-readiness-v2.csv
    - .planning/phases/19-real-audit-evidence/artifacts/inventory-readiness-v2-summary.json
    - .planning/phases/19-real-audit-evidence/19-05-SUMMARY.md
  modified:
    - scripts/lib/phase19-fixtures.ts
    - scripts/check-evidence-contract.ts
    - scripts/check-audit-readiness.ts
    - scripts/check-publication-gate.ts
    - scripts/check-public-boundary.ts
    - scripts/check-phase19-regression.ts
    - tests/e2e/publication-gate.spec.ts

key-decisions:
  - "The post-incident main/WAL/SHM fingerprint is the authoritative protected-catalog baseline; no Phase 19-05 checker may SQLite-open the real source."
  - "Zero published blockers and zero public entities prove a clean public boundary, not content completion; the real backlog remains 305."
  - "Artifact and fixture cleanup is capability-bound and fail-closed: uncertain ownership, surviving children, or unavailable cleanup helpers retain the owned root instead of deleting by pathname."
  - "Final browser acceptance is explicitly composite and timeboxed: lifecycle/build/34 desktop passes plus targeted missing desktop cases and mobile 14, with a recorded debt that no post-fix monolithic wrapper run is green."

patterns-established:
  - "GET/HEAD fixture requests retry one ECONNRESET; cleanup retries only exact SQLITE_BUSY with a bounded schedule and always closes the fixture client."
  - "The Python dir_fd cleanup helper rejects aliases, shared links, identity changes, and non-empty roots before removing an owned quarantine."
  - "Safe-resume never treats an interrupted executor's earlier green output as current evidence; every claimed gate is independently rerun or explicitly identified as composite evidence."

requirements-completed: [EVID-01, EVID-02, EVID-03, EVID-04, EVID-05, EVID-06, AUD-01, AUD-04, AUD-05, QA-01]

duration: 34 min
completed: 2026-07-18
status: complete
---

# Phase 19 Plan 05: Final Real-Catalog Audit and Public-Parity Summary

**Phase 19-05 freezes a zero-sampling 305-row readiness ledger, proves contract-v2 evidence and public-boundary behavior, and closes local fixture/signal safety without touching the protected catalog or any remote environment.**

## Performance

- **Final safe-resume duration:** 34 min
- **Started:** 2026-07-18T13:05:43Z
- **Completed:** 2026-07-18T13:40:03Z
- **Tasks:** 3
- **Implementation/recovery commits:** 19

## Accomplishments

- Completed QA-01 with isolated negative fixtures for missing citation mapping, evidence locator, fact scope, qualifying source provenance, deprecated stories, pending claims, `needs_source` specs, missing per-field evidence, retailer-only sourcing, unresolved field/identity/`made_by` conflicts, stale reviews, and mirror independence groups. Each negative asserts its exact blocker; complete brand/pen fixtures publish atomically.
- Generated and locked three deterministic artifacts over all 305 raw identities: 69 brands and 236 pens. The separate legacy trace remains 296 identities with exactly four brand and five pen exclusions.
- Confirmed real `made_by` dispositions: 230 pens have exactly one canonical maker, five are missing, and one has multiple canonical targets. These are audit findings only; no entity, relation, taxonomy, or content repair occurred.
- Confirmed the current catalog is entirely draft: `content_ready=0`, `published=0`, `public_entities=0`, `published_blockers=0`, `backlog=305`. Public cleanliness is not represented as content completion.
- Proved list, per-ID, aggregate, contextual, and reverse brand-model parity against the independent expected oracle; all public-surface differences are zero.
- Hardened child/signal cleanup across construction, runtime, repeated/mixed signal, forced-failure, late-registration, and descendant process-group races. Cleanup now closes registration first and retains owned roots whenever a child cannot be proven stopped.
- Hardened artifact publication rollback and probe cleanup with parent-held descriptors, exclusive file creation, inode/link/path validation, quarantine revalidation, and a Python `dir_fd` helper that never performs unverified pathname-recursive deletion.
- Stabilized the publication E2E fixture with one retry for GET/HEAD `ECONNRESET`, bounded exact-`SQLITE_BUSY` cleanup retries, `finally` client close, and restoration of the original 120-second test budget.

## Real Inventory Evidence

| Evidence | Result |
| --- | --- |
| Raw inventory | 305 = 69 brands + 236 pens |
| Legacy public trace | 296; exact nine exclusions |
| Publication rows | 305 draft |
| Content ready / published / public | 0 / 0 / 0 |
| Published/public blockers | 0 / 0 |
| Backlog | 305 |
| `made_by` | 230 exactly-one / 5 missing / 1 multiple |
| Source migration | 030 `030_publication_gate.sql` |
| Audit-copy migration | 031 `031_evidence_readiness_v2.sql` |

Artifact fingerprints:

| Artifact | Rows/lines | Size | SHA-256 |
| --- | ---: | ---: | --- |
| `inventory-readiness-v2.ndjson` | 305 | 1,954,338 | `3684da6e85cf4464ff709de0aba6f01b9b9c25dbf21fed1beb3894b235e20752` |
| `inventory-readiness-v2.csv` | 306 lines | 1,645,487 | `c53f0ad6a8f4e69f958b3a377669aa4b5bf05cf3223aaf5eaab97c229637452e` |
| `inventory-readiness-v2-summary.json` | 31 lines | 1,084 | `0ea788d98adce9dd44315bf62e8d85319364abd6144ecaca1a9bf0eb1a69d7f7` |

The summary source snapshot is `sha256:17e1f1bc8cc4bfdcf490c7a7f48d97154d6449e0800f60cc3e9a9e88f9177ba4`. Unlimited and `--limit=1` runs produced identical canonical bytes, hashes, summary, verdict, and exit semantics.

## Protected Catalog Safety

The Plan 19-04 incident remains the governing baseline. SQLite was never opened against the protected source during final acceptance; migration, readiness, build, and browser work used owned disposable copies only.

| File | Size | Inode | mtimeNs | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `data/fpkg.db` | 24,723,456 | 46,507,656 | 1784118828687297235 | `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc` |
| `data/fpkg.db-wal` | 0 | 70,043,998 | 1784189498823576647 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `data/fpkg.db-shm` | 32,768 | 70,043,999 | 1784189892661781716 | `fd4c9fda9cd3f9ae7c962b0ddf37232294d55580e1aa165aa06129b8549389eb` |

All pre/post checks preserved these values exactly. Existing historical processes 62481/62485 and their old temporary resources were treated as out of scope and left untouched. Every process and temporary root created by this safe-resume execution was cleaned.

## Validation Results

- `pnpm check:evidence-contract -- --all` — passed all 15 QA-01 cases, exact blocker/detail assertions, stale-review rollbacks, mirror grouping, and complete brand/pen publication.
- `pnpm check:evidence-contract -- --fixture-isolation` — passed; the protected catalog was not SQLite-opened.
- `pnpm check:audit-readiness -- --fixture` — passed inventory, 030→031 checkpoint-copy provenance, CLI-input, legacy, and library-safety contracts.
- `pnpm check:audit-readiness -- --artifacts-limit` — passed repeat/limit byte, hash, summary, verdict, exit, signal-rollback, and atomic-restore invariants.
- Real artifact command — passed with the exact counts and fingerprints above.
- `pnpm check:migrations -- --migration-ownership` — passed 105-script ownership scan, missing-031 fail-closed import, and full replay.
- `pnpm check:publication-gate` and `--migration-full` — passed fixture isolation, six migration paths, compatibility, direct-SQL adversarial checks, rollback, and atomic publication.
- `pnpm check:public-boundary -- --all` — passed with `published_blockers=0`; list, per-ID, aggregate, contextual, and reverse-model differences were all zero.
- `pnpm check:public-boundary -- --legacy` — passed the locked legacy boundary.
- `pnpm check:library` — passed with counts 141 sources, 895 source items, 390 claims, 1,465 citations, 320 stories, 73 events, 9 diagrams, 614 media, 2 community rows, 6 exhibits, 61 external IDs, 865 aliases, and 28 Commons media rows.
- Hostile inherited `E2E_BASE_URL` probe — failed closed with the exact local-server-only message before fixture creation, as expected.
- `pnpm exec tsc --noEmit` and `git diff --check` — passed.
- `pnpm lint` — passed with the pre-existing non-blocking `!important` warning at `src/app/globals.css:834`.

## Timeboxed Composite Browser Acceptance

There is **no claim that one final monolithic `--build-e2e` invocation passed after all test stabilization**.

1. The final monolithic wrapper run passed actual lifecycle/process-group cleanup and the production build, then produced **34 passed, 1 failed, 1 did not run** for desktop. The failure was the third publication-gate case reaching an executor-introduced 60-second timeout; mobile therefore did not start. Wrapper cleanup still preserved every protected fingerprint and removed its owned resources.
2. The timeout was restored to the original 120 seconds in `8aaf39c`; no production code changed.
3. A canonical disposable-fixture supplement ran only the minimal stateful publication sequence: case 2 as the required publication setup, then the previously incomplete cases 3 and 4. Result: **3 passed in 2.0 minutes**.
4. The same bounded supplement then ran the mobile project with one worker and an owned local server. Result: **14 passed in 12.4 seconds**.

Together, the same final wrapper's lifecycle/build/first 34 desktop passes plus the post-restoration desktop 2→3→4 and mobile 14 provide timeboxed composite coverage. The phase verifier should assess this evidence and its monolithic debt without automatically starting another wrapper run.

## Task and Recovery Commits

1. `7e5df9a` — complete QA-01 evidence matrix.
2. `9f7aed7` — freeze real inventory readiness evidence.
3. `3dc7712` — verify contract-v2 public parity.
4. `4f4dcce`, `6a4b032` — close final audit safety gaps and force the owned local E2E server.
5. `cdae82b`, `979470f`, `eb944e8`, `d9132c9`, `cbf56b1`, `8bcf1fe`, `a3ebd5e`, `76e172a`, `a7b4a75`, `3f5a42a`, `8ff3246`, `5f8311a` — signal, process-group, artifact rollback, descriptor ownership, registration, and retained-root safety hardening.
6. `e2ef2a8` — bounded request/cleanup retry stabilization.
7. `8aaf39c` — restore the original 120-second publication E2E timeout.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Safety] Used the post-incident checkpoint-copy seam instead of SQLite online backup against the protected source**

- **Found during:** Prior Plan 19-04 live verification, carried as a hard constraint into all Plan 19-05 tasks.
- **Issue:** Normal and read-only SQLite access could delete or retime protected WAL/SHM sidecars.
- **Fix:** Require a proven checkpointed source family and perform all SQLite work on an owned copy.
- **Verification:** Every final fingerprint exactly matches the authoritative post-incident baseline.

**2. [Rule 1/2 - Safety] Closed signal, descendant-process, registration, artifact rollback, and descriptor-authority races**

- **Found during:** Final lifecycle and peer-safety regressions.
- **Fix:** Added construction/runtime/repeated/mixed signal coverage, process-group draining, close-before-cleanup registration, atomic artifact restoration, parent-held capabilities, and fail-closed retained roots.
- **Verification:** Lifecycle, forced failure, SIGINT/SIGTERM, capability rejection, and artifact-signal cases pass without new roots or processes.

**3. [Rule 1 - Bug] Stabilized publication browser requests and cleanup**

- **Found during:** The first final desktop wrapper attempt.
- **Issue:** A transient `ECONNRESET` was followed by immediate cleanup, which encountered `SQLITE_BUSY` and left fixture rows that cascaded into site-quality failures.
- **Fix:** Retry fixture GET/HEAD once, retry only exact `SQLITE_BUSY` on a bounded schedule, and close the fixture client in `finally`.
- **Verification:** The bounded desktop supplement passes the stateful publication sequence; cleanup leaves no fixture root or process.

**4. [Rule 1 - Executor error] Restored the original browser-test timeout**

- **Found during:** The sole supplemental monolithic wrapper run.
- **Issue:** A safety edit incorrectly reduced the existing 120-second test budget to 60 seconds, causing the third stateful publication case to time out.
- **Fix:** Restored all publication spec/hook budgets to 120 seconds without any other code change.
- **Verification:** Desktop cases 2→3→4 pass in the canonical disposable fixture.

### Safe-Resume Transparency

An earlier executor was interrupted by platform safety filtering/stream disconnection after reporting partial green output. This closeout did not infer completion from that output: it reran the non-browser gates, regenerated/rehashes the fixed artifacts, independently checked the real source family, and records the browser acceptance as composite rather than rewriting history as one green wrapper run.

## Known Verification Debt and Residual Risk

- **Monolithic wrapper debt:** lifecycle, build, every desktop case, and mobile all have current evidence, but not from one post-fix wrapper invocation. The verifier may accept the composite evidence; if it considers the debt blocking, it should record a validation gap rather than automatically restarting the timeboxed loop.
- **Theoretical same-UID empty-directory replacement race:** Python's `dir_fd` helper revalidates device/inode and emptiness before `os.rmdir(name, dir_fd=parent_fd)`, but POSIX exposes no remove-by-open-directory-fd primitive. A malicious same-UID actor with access to the private temp parent could theoretically swap in another empty directory between the final identity check and `rmdir`. The helper cannot recursively delete that replacement or follow aliases, and any non-empty, shared, symlinked, identity-changed, or helper-unavailable state fails closed and retains the quarantine. This is accepted as narrow local harness debt, not a production trust-boundary guarantee.
- **Pre-existing lint warning:** `src/app/globals.css:834` uses `!important`; unrelated and unchanged.

## Known Stubs

None. The scan found only initialized runtime accumulators, nullable lifecycle state, and explicit negative-fixture values; no placeholder or mock data prevents this plan's goal.

## Scope Confirmation

No Turso/remote access, deployment, push, network content research, bulk writing, renderer/taxonomy work, or real content/relation repair occurred. `public_entities` remains the sole public authorization set.

## User Setup Required

None.

## Next Phase Readiness

- Plan 19-05 is complete with the browser verification debt above; Phase 19 remains **In Progress** until the verifier assesses the composite evidence.
- If the verifier considers the debt blocking, record a validation gap; this does not automatically block separate content-track planning.
- Any future verification must preserve the authoritative post-incident main/WAL/SHM baseline and must not SQLite-open the protected source.

## Self-Check: PASSED WITH DEBT

- All listed artifacts exist and match the recorded size/hash/count evidence.
- Every implementation/recovery commit listed above exists.
- Protected catalog fingerprints and pre-existing temporary-root/process sets remain unchanged after composite acceptance.
- The only open item is the explicitly documented absence of one post-fix monolithic wrapper pass.
