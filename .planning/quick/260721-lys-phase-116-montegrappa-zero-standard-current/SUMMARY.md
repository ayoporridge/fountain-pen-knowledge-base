---
phase: quick-260721-lys
plan: phase-116-montegrappa-zero-standard-current
subsystem: content-taxonomy
tags: [montegrappa, zero, sourced-content, sqlite, publication]
requires:
  - Phase 85 Montegrappa brand and Elmo 01 baseline
  - Phase 86 Elmo 02 and Elmo 02 Plus baseline
  - Phase 87 Extra 1930 and current Montegrappa brand baseline
provides:
  - Standard current Montegrappa Zero at /pen/montegrappa-zero
  - Current/launch/review evidence scopes with Br8-versus-stainless conflict
  - Exact one-link Montegrappa topology delta with current-hash republish
affects: [montegrappa-brand-topology, entity-publication-hash, zero-evidence-boundaries]
tech-stack:
  added: []
  patterns: [caller-owned checkpoint apply, target-only curated pack, post-topology brand republish]
key-files:
  created:
    - .planning/content-research/phase116-montegrappa-zero.md
    - scripts/data/phase116-montegrappa-zero.ts
    - scripts/apply-phase116-montegrappa-zero-content.ts
    - tests/content/phase116-montegrappa-zero.test.ts
    - public/images/library/site-original/phase116/montegrappa/montegrappa-zero.svg
  modified: []
key-decisions:
  - Keep standard Zero as one canonical pen; standard finishes remain variants while Custom and themed products remain excluded identities.
  - Preserve March 2020 Br8 bronze and 2026 current stainless-steel trims as separate dated evidence with a structured conflict.
  - Re-review and publish Montegrappa only against its exact post-topology current hash without replaying prior brand packs.
requirements-completed: [QUICK-260721-LYS]
coverage:
  - id: D1
    description: One public standard-current Zero page with source-bounded Chinese copy and one unique factual SVG
    requirement: QUICK-260721-LYS
    verification:
      - kind: integration
        ref: tests/content/phase116-montegrappa-zero.test.ts#Phase 116 publishes one standard Montegrappa Zero with dated conflict on one owned setup
        status: pass
    human_judgment: false
  - id: D2
    description: Dated Br8/current stainless conflict, loaned-sample exclusions, exact maker topology, current-hash brand republish, noop and tamper safety
    requirement: QUICK-260721-LYS
    verification:
      - kind: integration
        ref: tests/content/phase116-montegrappa-zero.test.ts#Phase 116 publishes one standard Montegrappa Zero with dated conflict on one owned setup
        status: pass
    human_judgment: false
metrics:
  duration: 12m
  completed: 2026-07-21
status: complete
---

# Phase 116: Montegrappa Zero Standard Current Summary

Montegrappa Zero now has one source-complete standard-current page, with launch-era Br8 bronze and a loaned 2020 sample retained as dated evidence instead of leaking into current stainless-steel specifications.

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-21T07:53:11Z
- **Completed:** 2026-07-21T08:04:48Z
- **Tasks:** 3
- **Files modified:** 5 product files, plus this post-product summary

## Delivered

- Added `phase116-pen-montegrappa-zero` at `/pen/montegrappa-zero` as one governed pen representing only the factory-standard current Zero.
- Added a 93-character summary, 3,413-character Chinese body and one unique 1600x900 site-original factual SVG. The page links Montegrappa, Elmo 01, Elmo 02, Elmo 02 Plus and Extra 1930.
- Kept IP Palladium, IP Ultra-Black and IP Yellow Gold as standard finish choices. Zero Custom, Caduceus, Zodiac, Right To Play and other themed/collaboration pens create no entity, alias or topology.
- Added exactly one `made_by -> phase85-brand-montegrappa` relation and its reverse navigation. The Montegrappa non-topology payload remains unchanged.

## Evidence Boundaries

- The official current product page and catalogue, retrieved 2026-07-21, qualify resin, stainless-steel trims, C/C, two cartridges plus converter, 143 mm, 14 mm, 32 g, steel/14K/14K flex and EF/F/M/B/ST1/ST5.
- The official March 2020 brochure remains a launch scope. Its Br8 bronze wording is rejected for current material qualification and paired with current stainless-steel trims in one structured fact conflict.
- Dries Pil's 2020-11-09 The Pencilcase Blog review remains a professional-secondary scope for one loaned black/ruthenium sample. The capped 14.3 cm and 32 g corroborate current numbers; uncapped length, section estimate, JoWo attribution, feedback and balance remain rejected current-field evidence.
- The manufacturer's beyond-20,000-action clip claim remains attributed engineering language and is not converted into a service-life or durability guarantee.

## Topology, Publication and Safety

- The integration regression uses one caller-owned checkpoint copy, migrates it, and establishes the actual Phase 85 -> 86 -> 87 public baseline before Phase 116.
- Montegrappa's contract-v3 hash changes after exactly one new reverse link. Fresh fact/language/media reviews and `publishEntity` bind the exact post-topology hash; no Phase 85/86/87 brand pack is replayed and no direct lifecycle SQL is used.
- First apply publishes Zero; pristine replay returns one noop with byte-identical Zero and brand digests. Removing the terminal maker edge fails closed and is not repaired.
- Elmo 01, Elmo 02, Elmo 02 Plus and Extra 1930 retain complete protected digests. `src/lib/entity-redirects.ts` remains unchanged.
- Real catalog snapshots stayed unchanged: main `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`, empty WAL `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, SHM `fd4c9fda9cd3f9ae7c962b0ddf37232294d55580e1aa165aa06129b8549389eb`.

## Verification

- `node --import tsx --test tests/content/phase116-montegrappa-zero.test.ts`: TAP `1/1`, 0 failures, final run 44.6 seconds.
- `pnpm exec tsc --noEmit --pretty false`: passed.
- `pnpm exec biome check` on the three owned TypeScript paths: passed; ignored data/apply paths remain covered by TypeScript and integration imports.
- `xmllint --noout public/images/library/site-original/phase116/montegrappa/montegrappa-zero.svg`: passed.
- `git diff --check` and five-path cached diff audit: passed; no deletions.

## Product Commit

- `ab45a08` — `feat(content): publish Montegrappa Zero`
- `git show --name-only --format=` proves the commit contains exactly the five frontmatter product paths.
- The post-commit index is empty. Unrelated research, `.next-phase*`, quick 260719-665 and Phase 105 quick artifacts remain unstaged and unchanged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Allowlisted only the exact baseline owners of the shared official catalogue URL**

- **Found during:** Task 3 integration verification
- **Issue:** The initial source-owner preflight treated the already-published Phase 85-87 Montegrappa entities' shared catalogue reference as an alternate Zero owner.
- **Fix:** Split identity and source-owner checks, permitting the catalogue URL only for the exact locked brand/four-pen baseline while keeping current product, launch brochure and review URLs collision-free.
- **Files modified:** `scripts/apply-phase116-montegrappa-zero-content.ts`
- **Verification:** Targeted TAP passes from the exact Phase 85-87 baseline and still rejects unexpected owners before first write.
- **Committed in:** `ab45a08`

**2. [Rule 3 - Blocking] Used a phase-local target-only curated installer**

- **Found during:** Task 3 integration verification
- **Issue:** The shared Phase 22 entry point requires exactly one brand pack plus at least one pen pack, but replaying the old Montegrappa brand pack is forbidden because it would overwrite the current baseline.
- **Fix:** Reused the verified Phase 115 phase-local pack installation pattern for the single Zero target, while keeping all brand review/publication work on lifecycle APIs and the post-topology current hash.
- **Files modified:** `scripts/apply-phase116-montegrappa-zero-content.ts`
- **Verification:** Targeted TAP, TypeScript and protected-entity digest assertions pass; brand non-topology payload remains byte-identical.
- **Committed in:** `ab45a08`

**Total deviations:** 2 auto-fixed (1 Rule 1 bug, 1 Rule 3 blocking issue). Both preserve the plan's source-ownership and no-brand-replay constraints without expanding shared infrastructure.

## Known Stubs

None. Empty arrays found by the stub scan are local query/test accumulators and do not flow to UI rendering.

## Scope Boundary

This is intentionally a partial Montegrappa batch. It does not create Zero Custom, Caduceus, Zodiac, Right To Play or other themed entities; write to the production catalog; complete Montegrappa; or expand shared readiness, Playwright, search or LLM infrastructure.

## Self-Check: PASSED

- All five product files exist in commit `ab45a08`.
- The commit subject and exact five-path set match the plan, with no deletions.
- This summary exists on disk and is intentionally left uncommitted for the orchestrator's later documentation commit.
