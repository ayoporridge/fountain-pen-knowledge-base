---
phase: 21-taxonomy
plan: "01"
subsystem: database
tags: [sqlite, taxonomy, publication-v3, review-invalidation, tdd]

requires:
  - phase: 19-real-audit-evidence
    provides: Publication contract v2, evidence readiness views, immutable identity, and current-review invalidation
provides:
  - Constrained alias, taxonomy batch/action, lineage, redirect, and hierarchical variant persistence
  - Dependency-ordered publication contract upgrade from sha256:v2 to sha256:v3
  - Canonical publication hashes containing reviewed aliases, tag IDs, visible relations, and variant hierarchy
  - Disposable-database contracts for v2 revocation, replay safety, identity constraints, and v3-only republish
affects: [21-02, 21-03, 21-04, 21-05, 21-06, publication, taxonomy]

tech-stack:
  added: []
  patterns:
    - SQLite dependency-order table rebuild with revoked-only legacy review compatibility
    - Stable canonical JSON serialization for user-visible taxonomy
    - Owner-aware revision invalidation for direct entities and reverse canonical brands

key-files:
  created:
    - migrations/032_taxonomy_identity.sql
    - tests/taxonomy/taxonomy-substrate.test.ts
  modified:
    - src/lib/publication.ts
    - src/lib/db.ts

key-decisions:
  - "Preserve every v2 review row with original audit fields while forcing status to revoked; runtime inserts and mutations of that legacy history are rejected."
  - "Keep publication_v2_* compatibility object names, but make every authorization literal, blocker contract, readiness result, and publish guard contract-v3 only."
  - "Hash only approved aliases, canonical tag IDs, allowlisted visible relations, and complete variant hierarchy fields; internal taxonomy ledgers and unrelated links remain outside the public payload."
  - "Increment every existing lifecycle row exactly once during migration 032, preserve draft/in_review/retired, demote published to in_review, and clear every authorization snapshot."

patterns-established:
  - "Taxonomy migrations must drop dependent triggers before views/tables, rebuild reviews before publications, then recreate views and guards in forward dependency order."
  - "Visible relation invalidation updates both direct model owners and reverse brand owners without double-incrementing a row."

requirements-completed: [TAX-03, TAX-05, TAX-06, EXP-05]

coverage:
  - id: D1
    description: Migration 032 preserves revoked v2 history while making every live review, lifecycle snapshot, readiness result, and public transition v3-only.
    requirement: TAX-05
    verification:
      - kind: integration
        ref: "tests/taxonomy/taxonomy-substrate.test.ts#taxonomy substrate and migration replay preserve revoked v2 compatibility"
        status: pass
      - kind: integration
        ref: "tests/taxonomy/taxonomy-substrate.test.ts#schema authorization scan permits v2 only in revoked-history clause"
        status: pass
    human_judgment: false
  - id: D2
    description: Alias, batch/action, lineage, redirect, and variant hierarchy state is constrained, replay-safe, and identity-immutable.
    requirement: TAX-03
    verification:
      - kind: integration
        ref: "tests/taxonomy/taxonomy-substrate.test.ts#taxonomy substrate constraints and immutable identity reject malformed state"
        status: pass
    human_judgment: false
  - id: D3
    description: Approved visible taxonomy changes deterministically change the v3 hash and revoke current approval without automatic republish.
    requirement: TAX-06
    verification:
      - kind: integration
        ref: "tests/taxonomy/taxonomy-substrate.test.ts#taxonomy hash and review revocation fail closed without automatic republish"
        status: pass
    human_judgment: false

duration: 14min
completed: 2026-07-19
status: complete
---

# Phase 21 Plan 01: Taxonomy Identity Substrate and Publication V3 Summary

**Migration 032 now persists auditable identity decisions and makes every user-visible taxonomy mutation part of a fail-closed `sha256:v3` publication contract.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-07-18T17:18:41Z
- **Completed:** 2026-07-18T17:32:45Z
- **Tasks:** 2
- **Files:** 4 implementation/test files plus this summary

## Accomplishments

- Added constrained persistence for reviewed aliases, replay-safe taxonomy batches/actions, one-to-many lineage, canonical route ledgers, and edition-group variant hierarchies.
- Rebuilt `entity_content_reviews` and `entity_publications` in SQLite dependency order, preserving all v2 audit rows as revoked history while removing every v2 authorization path.
- Upgraded runtime hashing and publishing to contract 3 and extended startup readiness to require migration 032, taxonomy columns/objects, and exact v3 schema semantics.
- Added reviewed aliases, canonical tag IDs, `made_by` / `member_of_series` / `marketed_under_licensed_brand` relations, and hierarchy fields to deterministic canonical payload serialization.
- Added owner-aware invalidation for aliases, tags, visible relations, and hierarchy mutations, including reverse brand invalidation and permanent review revocation.
- Proved fresh migration, canonical replay no-op, v2 history survival, v2 insert rejection, malformed taxonomy rejection, exact revision increments, hash changes, review revocation, and lawful fresh v3 republish using only temporary databases.

## Task Commits

1. **TDD RED: disposable taxonomy and v3 authorization contracts** — `7f67438`
2. **Task 1: constrained substrate and dependency-ordered v3 migration** — `b90228e`
3. **Task 2: visible taxonomy in canonical publication hashes** — `bd497d4`
4. **Correctness hardening: immutable v2 history and edition-parent guards** — `0af1e5f`

## Files Created/Modified

- `migrations/032_taxonomy_identity.sql` — Taxonomy tables/columns/constraints, v3 table rebuild, authorization views, invalidation triggers, and publish guards.
- `src/lib/publication.ts` — Contract 3 prefix plus deterministic alias/tag/relation/hierarchy payload serialization.
- `src/lib/db.ts` — Migration 032 manifest, taxonomy column checks, and exact v3 startup contract verification.
- `tests/taxonomy/taxonomy-substrate.test.ts` — Test-owned `mkdtemp` migration fixtures and focused substrate/hash/revocation contracts.

## Decisions Made

- Every legacy review row survives with the same ID, entity, kind, hash, reviewer, timestamps, note, and creation metadata; only status becomes `revoked`. A post-migration v2 insert, update, delete, approval, or lifecycle snapshot is rejected.
- Compatibility view names beginning `publication_v2_` remain to avoid broad consumer renames, but their emitted contract, hash checks, current-review selection, blockers, readiness, and public authorization are all v3.
- Publication migration increments every existing lifecycle row once. This covers all governed brand/pen rows and fails safely for any anomalous lifecycle row without inserting a new entity or publication.
- Later payload invalidation follows the existing lifecycle model: it demotes `published` to `in_review`, increments revision, and revokes current reviews. A stale snapshot may remain diagnostic while revision mismatch makes it non-current; `publishEntity` replaces it only after a fresh complete v3 review set.
- Pending/rejected aliases, taxonomy batches/actions/lineage, and unrelated graph links do not contribute to the public hash. Approved aliases require document provenance, and regional/licensed names also require a market scope.

## Verification

- `pnpm exec tsx --test tests/taxonomy/taxonomy-substrate.test.ts` — 4/4 passed.
- Task 1 pattern (`taxonomy substrate|migration replay|v2 compatibility|schema authorization scan|immutable identity`) — 3/3 passed.
- Task 2 pattern (`taxonomy hash|review revocation|no automatic republish`) — 1/1 passed.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm biome check src/lib/publication.ts tests/taxonomy/taxonomy-substrate.test.ts` — passed.
- `git diff --check 536b4c3..0af1e5f -- migrations/032_taxonomy_identity.sql src/lib/publication.ts src/lib/db.ts tests/taxonomy/taxonomy-substrate.test.ts` — passed.
- `assertDatabaseReady()` passed against the disposable migration-032 database, including contract SQL and taxonomy object/column checks.

## Boundary Evidence

- All migration and publication tests used test-owned `mkdtemp` roots and local `file:` databases.
- No `data/fpkg.db`, real/protected catalog, Phase 19 wrapper, broad E2E suite, remote database, deployment target, or package installation was accessed.
- Migrations 001–031 were copied read-only into disposable migration directories; no historical migration was edited.
- No entity, publication, v3 review, or public status is synthesized by migration 032.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Audit integrity] Preserved all legacy v2 review rows, not only rows already revoked**
- **Found during:** Task 1 dependency mapping
- **Issue:** Copying only rows whose old status was already `revoked` would silently delete pending/approved/rejected history and contradict the no-deletion requirement.
- **Fix:** Copied every legacy row with unchanged audit fields and forced the new status to `revoked`.
- **Files modified:** `migrations/032_taxonomy_identity.sql`, `tests/taxonomy/taxonomy-substrate.test.ts`
- **Committed in:** `b90228e`

**2. [Rule 2 - Authorization safety] Rejected new or mutable legacy-hash history after the migration copy**
- **Found during:** Final schema review
- **Issue:** The revoked-history table CHECK alone would permit a caller to insert a new v2 row already marked revoked or mutate copied history while remaining revoked.
- **Fix:** Added v3-only runtime insert and immutable legacy update/delete guards without adding another v2 authorization clause.
- **Files modified:** `migrations/032_taxonomy_identity.sql`, `src/lib/db.ts`, `tests/taxonomy/taxonomy-substrate.test.ts`
- **Committed in:** `0af1e5f`

**3. [Rule 2 - Hierarchy correctness] Protected edition parents after children exist**
- **Found during:** Final variant constraint review
- **Issue:** Parent assignment guards prevented cross-model/cyclic child writes, but an existing edition parent could still be changed to a child kind or moved to another model.
- **Fix:** Added an owner/kind guard whenever a variant already parents children and covered it in readiness/tests.
- **Files modified:** `migrations/032_taxonomy_identity.sql`, `src/lib/db.ts`, `tests/taxonomy/taxonomy-substrate.test.ts`
- **Committed in:** `0af1e5f`

---

**Total deviations:** 3 Rule 2 correctness/safety additions.
**Impact on plan:** The additions narrow authorization and preserve audit/history guarantees; they do not add a public feature, new entity type, migration runner, or external dependency.

## Known Stubs

None.

## Threat Flags

None beyond the migration and stored-taxonomy trust boundaries already declared in the plan threat model.

## Authentication Gates

None.

## User Setup Required

None.

## Next Phase Readiness

- Plan 21-02 can build the typed identity manifest against stable taxonomy batch/action/lineage/redirect tables.
- Later migration plans can demote affected entities first and rely on v3 hash invalidation for aliases, tags, visible relations, and variant hierarchy.
- No Plan 21-01 blocker remains; production migration/deployment is intentionally outside this plan.

## Self-Check: PASSED

- All four declared implementation/test files and this summary exist.
- Commits `7f67438`, `b90228e`, `bd497d4`, and `0af1e5f` resolve in git history.
- Focused test, TypeScript, Biome, startup readiness, migration replay, and diff checks passed.
- The working tree contained no uncommitted Plan 21-01 implementation changes before this summary was written.

---
*Phase: 21-taxonomy*
*Completed: 2026-07-19*
