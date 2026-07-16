---
phase: 19-real-audit-evidence
plan: "02"
subsystem: evidence-readiness
tags: [sqlite, migration, publication-gate, provenance, evidence, fail-closed]

requires:
  - phase: 19-real-audit-evidence
    plan: "01"
    provides: protected read-only catalog adapter, online backup, and disposable fixture lifecycle
  - phase: 18-publication-gate
    provides: publication contract v1, centralized blockers, and public_entities authorization view
provides:
  - Normalized claim/spec evidence, scope, conflict, item provenance, and hash-bound review schema
  - Contract-v2 publication blockers, guards, invalidation triggers, and sole public_entities authorization predicate
  - Disposable fresh/upgrade/replay migration and adversarial schema contract fixtures
affects: [19-03, 19-04, 19-05]

tech-stack:
  added: []
  patterns:
    - Item-level explicit provenance with normalized independence groups
    - Complete-chain claim qualification without partial evidence stitching
    - Hash-bound four-kind review contract outside content-payload revision loops
    - Version-aware database readiness manifests for pre-031 and post-031 catalogs

key-files:
  created:
    - migrations/031_evidence_readiness_v2.sql
    - .planning/phases/19-real-audit-evidence/19-02-SUMMARY.md
  modified:
    - src/lib/db.ts
    - scripts/check-evidence-contract.ts

key-decisions:
  - "Only explicit source_items provenance qualifies; registry defaults remain ingestion hints and never unlock publication."
  - "An approved core claim qualifies only through one complete citation-locator-scope-source chain; components from separate chains cannot be stitched together."
  - "Migration 031 preserves retired rows but demotes every other v1 publication to draft and clears inherited approval metadata."
  - "public_entities remains the only authorization predicate; blocker JSON is diagnostic only."

patterns-established:
  - "Cross-owner evidence mutations invalidate the publication payload owner, not merely the claim or citation owner."
  - "Reusable media licenses use a closed allowlist, and source independence groups use canonical lowercase ASCII tokens."
  - "Migration fixtures first online-backup an executor-owned staging source, then run canonical migration only against an owned target."

requirements-completed: [EVID-01, EVID-02, EVID-03, EVID-04, EVID-05, EVID-06, QA-01]

coverage:
  - id: D1
    description: "Normalized field/claim evidence, explicit scopes, item-level provenance, conflicts, and four hash-bound review kinds are present and fail closed."
    requirement: "EVID-01, EVID-02, EVID-03, EVID-04, EVID-05, EVID-06"
    verification:
      - kind: integration
        ref: "pnpm check:evidence-contract -- --migration && pnpm check:evidence-contract -- --schema"
        status: pass
    human_judgment: false
  - id: D2
    description: "Contract-v2 qualification, exact core-claim blockers, source independence, review gates, direct-SQL guards, and mutation invalidation authorize only through public_entities."
    requirement: "EVID-02, EVID-03, EVID-04, EVID-05, EVID-06, QA-01"
    verification:
      - kind: integration
        ref: "pnpm check:evidence-contract -- --schema"
        status: pass
    human_judgment: false
  - id: D3
    description: "Migration 031 supports fresh, pre-031 upgrade, and replay paths while preserving rows, lifecycle rules, checksums, integrity, and the real catalog snapshot."
    requirement: "QA-01"
    verification:
      - kind: integration
        ref: "pnpm check:evidence-contract -- --migration"
        status: pass
      - kind: integration
        ref: "pnpm check:evidence-contract -- --fixture-isolation"
        status: pass
      - kind: integration
        ref: "pnpm check:migrations"
        status: pass
    human_judgment: false
  - id: D4
    description: "Database readiness selects the v1 or v2 manifest from the applied migration boundary without breaking 030-only callers."
    requirement: "QA-01"
    verification:
      - kind: integration
        ref: "pnpm check:evidence-contract -- --migration"
        status: pass
      - kind: other
        ref: "pnpm exec tsc --noEmit"
        status: pass
    human_judgment: false

duration: 52 min
completed: 2026-07-16
status: complete
---

# Phase 19 Plan 02: Evidence Readiness v2 Summary

**Publication contract v2 now fails closed on incomplete evidence, non-independent provenance, unresolved conflicts, stale reviews, and direct-SQL bypasses, while preserving `public_entities` as the sole authorization set.**

## Performance

- **Duration:** 51m 54s
- **Started:** 2026-07-16T05:40:49Z
- **Completed:** 2026-07-16T06:32:43Z
- **Tasks:** 2
- **Production files changed:** 3

## Accomplishments

- Added migration 031 with normalized fact scopes, field and claim evidence, conflict membership, item-level provenance, explicit core/editorial/unclassified claims, citation review metadata, and four independent hash-bound review kinds.
- Rebuilt `entity_publications` for `sha256:v2:` without grandfathering v1 authorization: retired rows remain retired, all other existing rows become draft, and prior review/hash metadata is cleared.
- Replaced contract-v2 qualification, blocker, guard, invalidation, readiness, and public views so incomplete approved core claims produce the exact `approved_claim_missing_evidence` blocker and cannot publish.
- Enforced source independence at item level: mirrored groups deduplicate, primary/archive groups cannot also count as independent professional support, and retailer/community/search evidence remains auxiliary only.
- Added disposable fresh, upgrade, replay, checksum, row-parity, legacy-compatibility, schema, behavior, direct-SQL, mutation-invalidation, and cross-owner fixtures.
- Extended database readiness checks with version-aware v1/v2 manifests so migration directories ending at 030 remain valid while post-031 databases require the complete v2 object set.

## Task Commits

Each task was committed independently:

1. **Task 1 RED: add failing evidence contract checks** - `09e0344` (`test`)
2. **Task 1 GREEN: add normalized evidence readiness v2 schema** - `b259745` (`feat`)
3. **Task 2: enforce publication contract v2 and close adversarial audit findings** - `0d137f8` (`feat`)

## Files Created/Modified

- `migrations/031_evidence_readiness_v2.sql` - Adds the normalized evidence schema and rebuilds publication contract v2 views, blockers, guards, and invalidation triggers.
- `src/lib/db.ts` - Selects version-aware v1/v2 schema manifests and validates every post-031 object.
- `scripts/check-evidence-contract.ts` - Exercises canonical migration and adversarial qualification/publication behavior exclusively in executor-owned disposable databases.

## Requirement Coverage

| Requirement | Evidence | Result |
| --- | --- | --- |
| EVID-01 | `fact_scopes` plus variant/entity guards express model, market, date, production, nib, material, and edition scope. | Pass |
| EVID-02 | `spec_field_evidence` binds controlled field keys to approved citations, non-empty locators, and explicit scopes. | Pass |
| EVID-03 | `claims.fact_class`, `claim_evidence`, complete-chain qualification, and exact missing-component blockers enforce claim-level evidence. | Pass |
| EVID-04 | Item-level tier/group/archive provenance, canonical groups, deduplication, and auxiliary-only tiers enforce source quality and independence. | Pass |
| EVID-05 | `fact_conflicts` and `fact_conflict_members` block unresolved field and identity conflicts. | Pass |
| EVID-06 | Four review kinds are independently unique and approved against the current v2 content hash. | Pass |
| QA-01 | Fresh/upgrade/replay migration, manifest, integrity, direct-SQL, and mutation fixtures run only on owned disposable databases. | Pass |

## Validation Results

- `pnpm check:evidence-contract -- --migration && pnpm check:evidence-contract -- --schema` - passed in the required migration-first order after the final changes.
- `pnpm check:evidence-contract -- --fixture-isolation` - passed; the real database was never opened by SQLite and canonical migration remained inside an online-backed owned target.
- `pnpm check:migrations` - passed; 103 scripts passed ownership scanning and fresh full replay.
- `pnpm exec tsc --noEmit` - passed.
- `git diff --check` - passed.
- Peer adversarial review - passed after closing all five reported authorization/qualification findings; no residual bypass was found.
- `pnpm lint` - not a plan blocker; it reported only pre-existing/out-of-scope formatting issues in `src/app/globals.css` and the Plan 19-01 file `src/lib/audit/read-only-catalog.ts`. Neither file was modified.

## Real Catalog Invariant

The real database was never opened through SQLite during this plan. The filesystem-only snapshot before and after all checks was identical:

| File | Size | Inode | mtimeNs | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `data/fpkg.db` | 24,723,456 | 46,507,656 | 1784118828687297235 | `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc` |
| `data/fpkg.db-wal` | 0 | 69,613,957 | 1784124771168463361 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `data/fpkg.db-shm` | 32,768 | 69,613,958 | 1784177744931228537 | `fd4c9fda9cd3f9ae7c962b0ddf37232294d55580e1aa165aa06129b8549389eb` |

Migration 030 also remained byte-identical at SHA-256 `1737d53f29c6f8d1c947f93d2a71bf9dd672de150d75dd81b150c48749d21e4a`. No remote/Turso connection, network access, deployment, real-catalog migration, or sidecar deletion occurred.

## Decisions Made

- `default_source_tier` and `default_independence_group` are nullable registry ingestion hints only. Qualification reads explicit normalized values from each `source_items` row.
- A core claim enters `publication_v2_qualified_core_claims` only when one evidence row connects an approved citation, non-empty locator, coherent explicit scope, and qualifying source item; aggregate components from separate rows never qualify.
- Publication evidence and invalidation use dedicated payload-owner views, so a citation or source mutation follows the canonical payload's cross-owner claim references.
- `independence_group` accepts only trimmed lowercase ASCII `[a-z0-9._:-]`, preventing whitespace/case aliases; reusable media licensing uses an explicit allowlist rather than a denylist.
- Review updates/deletes do not increment content revision or enter the payload hash, but revocation immediately demotes and hides the entity.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Dropped and recreated all publication dependencies before rebuilding `entity_publications`**

- **Found during:** Task 1 migration fixtures and read-only design review.
- **Issue:** SQLite can reparse dependent views and triggers during table rename; preserving only a subset left rebuild hazards.
- **Fix:** Drop all eight dependent views and all 41 existing publication triggers before rebuild, then recreate every original trigger name plus the v2 objects.
- **Verification:** Fresh, pre-031 upgrade, replay, object-manifest, row-parity, quick-check, and foreign-key fixtures pass.
- **Committed in:** `b259745` and `0d137f8`.

**2. [Rule 2 - Safety] Closed five adversarial authorization and qualification gaps**

- **Found during:** Task 2 peer security audit.
- **Issue:** Cross-owner claim evidence, group normalization, license qualification, missing-provenance detail, and cross-entity variant scope needed stricter defensive enforcement; a follow-up also identified citation/source owner invalidation paths.
- **Fix:** Added canonical group checks, a license allowlist, coherent variant guards, exact complete-chain details, and separate payload evidence/invalidation owner maps for claim, citation, and source mutations.
- **Verification:** Dedicated negative and positive fixtures pass, including cross-owner blocker, qualification, citation mutation, source mutation, direct SQL, and republish loops. Final peer verdict found no remaining authorization bypass.
- **Committed in:** `0d137f8`.

**3. [Rule 3 - Blocking] Made readiness manifests migration-version aware**

- **Found during:** Task 1 canonical migration replay.
- **Issue:** A single v2 manifest would incorrectly reject legitimate fixtures and callers whose migration directory intentionally stops at 030.
- **Fix:** Preserve the v1 manifest and select the v2 manifest only when migration 031 is present.
- **Verification:** Pre-031 and post-031 readiness fixtures both pass.
- **Committed in:** `b259745`.

---

**Total deviations:** 3 auto-fixed (1 bug, 1 safety, 1 blocking compatibility issue)
**Impact on plan:** All changes were required to satisfy the fail-closed contract and preserve existing migration interfaces; no Plan 19-03 runtime publication wiring was added.

## Issues Encountered

- The initial Task 1 schema contract failed as intended before migration 031 existed, establishing the RED baseline.
- Targeted lint could not produce a repository-wide green result because of unrelated pre-existing formatting findings; scoped typecheck, migration, contract, and diff checks are green.

## User Setup Required

None. No credentials, remote resources, configuration changes, or production migration are required.

## Next Phase Readiness

- Plan 19-03 can compute and publish v2 payloads against the complete normalized evidence contract and the sole `public_entities` authorization view.
- It must continue using the Phase 19 disposable fixture path for migration/testing and must not interpret diagnostic blocker JSON as authorization.
- Existing production/local content remains deliberately unqualified until later audit/remediation plans populate real evidence, conflicts, and current-hash reviews.

## Self-Check: PASSED

- All three planned production files exist and contain the v2 schema, manifest, and executable fixtures.
- Task commits `09e0344`, `b259745`, and `0d137f8` exist in history.
- Required migration-first validation, isolation, migration safety, and TypeScript checks pass.
- The before/after real catalog main/WAL/SHM snapshot and migration 030 checksum are exactly identical.
- No remote, network, deployment, destructive, real-database, package, or Plan 19-03 publication action occurred.

---
*Phase: 19-real-audit-evidence*
*Completed: 2026-07-16*
