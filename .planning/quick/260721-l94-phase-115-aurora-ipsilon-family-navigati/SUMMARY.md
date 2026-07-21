---
phase: quick-260721-l94
plan: phase-115-aurora-ipsilon-family-navigation-and-current-pens
subsystem: content-taxonomy
tags: [aurora, ipsilon, sourced-content, sqlite, publication]
requires:
  - Phase 41 Aurora seeded identities
  - Phase 48 Aurora contract-v3 publication baseline
  - Phase 114 Aurora 88 family and Resina 800 terminal baseline
provides:
  - Aurora Ipsilon family article at /article/aurora-ipsilon
  - Exact current Demo Colors pen at /pen/aurora-ipsilon-demo-colors
  - Exact current Resin B11-N pen at /pen/aurora-ipsilon-resin-b11-n
affects: [aurora-brand-topology, entity-publication-hash, ipsilon-navigation]
tech-stack:
  added: []
  patterns: [new article plus two governed pens, caller-owned checkpoint apply, post-topology brand republish]
key-files:
  created:
    - scripts/data/phase115-aurora-ipsilon-family-current-pens.ts
    - scripts/apply-phase115-aurora-ipsilon-family-current-pens-content.ts
    - tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts
    - .planning/content-research/aurora-ipsilon-family-phase115.md
    - .planning/content-research/aurora-ipsilon-demo-colors-phase115.md
    - .planning/content-research/aurora-ipsilon-resin-b11-n-phase115.md
    - public/images/library/site-original/phase115/aurora/aurora-ipsilon-family.svg
    - public/images/library/site-original/phase115/aurora/aurora-ipsilon-demo-colors.svg
    - public/images/library/site-original/phase115/aurora/aurora-ipsilon-resin-b11-n.svg
  modified: []
decisions:
  - Keep Ipsilon as an article-level family navigator and preserve Demo, Resin, Italia and Quadra as specification-isolated sibling lines.
  - Treat Demo 2020 material and Resin 2011 sample observations as dated scopes that cannot qualify 2026 current stable fields.
  - Add only two exact made_by relations and republish Aurora against the resulting current hash without replaying prior brand packs.
requirements-completed: [QUICK-260721-L94]
coverage:
  - id: D1
    description: Three public Ipsilon pages with three-way body navigation, evidence boundaries and unique primary SVGs
    requirement: QUICK-260721-L94
    verification:
      - kind: integration
        ref: tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts#Phase 115 publishes Ipsilon family and two exact current pens on one owned setup
        status: pass
    human_judgment: false
  - id: D2
    description: Exact two-pen Aurora topology, current-hash republish, replay noop, tamper fail-closed and protected-catalog safety
    requirement: QUICK-260721-L94
    verification:
      - kind: integration
        ref: tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts#Phase 115 publishes Ipsilon family and two exact current pens on one owned setup
        status: pass
    human_judgment: false
metrics:
  duration: 18m
  completed: 2026-07-21
status: complete
---

# Phase 115: Aurora Ipsilon Family Navigation and Current Pens Summary

Aurora Ipsilon now has a family-level navigation article plus two separately governed current pens, with dated professional and community evidence prevented from leaking into exact 2026 specifications.

## Performance

- **Duration:** 18 min
- **Started:** 2026-07-21T07:23:26Z
- **Completed:** 2026-07-21T07:41:00Z
- **Tasks:** 3
- **Files modified:** 9 product files, plus this post-product summary

## Delivered

- Added article `phase115-aurora-ipsilon-family` at `/article/aurora-ipsilon`, with no `entity_publications`, maker/reverse links, specs, variants or pen-only claims.
- Added `phase115-aurora-ipsilon-demo-colors` and `phase115-aurora-ipsilon-resin-b11-n` as distinct governed pens. Each owns exactly one `made_by -> CJXe8UpnkHLJ`; the Aurora reverse edges are generated/verified separately.
- Added three checked-in sourced articles over 2,000 Unicode characters and three distinct 1600x900 site-original SVGs. Every page links the other two, while body navigation creates no article or pen-to-pen topology.
- Kept `src/lib/entity-redirects.ts` unchanged: there was no legacy Ipsilon entity or route to redirect.

## Evidence Boundaries

- Demo current authority: `https://aurorapen.it/categoria-prodotto/medio-di-gamma/ipsilon/ipsilon-demo-colors/` and `https://aurorapen.it/wp-content/uploads/2025/07/IPSILON-Demo-Colours.pdf`. They preserve glossy coloured resin, clear grip, six colours and the two fixed trim/nib groups as a `2026-07-21` current scope.
- Adam L.'s Bertram's Inkwell article (`2020-08-06`) is `professional_secondary`. C/C, EF/F/M/B/italic, then-lineup and matching-ink gift remain in a dated scope and are rejected for current spec qualification.
- Resin exact authority: `https://aurorapen.it/shop/ipsilon-resin-stilografica/`. It preserves B11-N, black resin, cartridge/converter, gold/chrome options and dated availability; price, stock, dimensions, weight and personal experience are not invented.
- Laura Petix's Pen Boutique article (`2024-07-30`) remains professional family/sibling context. The 2011 Fountain Pen Network item remains an attributed `community` sample; sample-only details are rejected for exact B11-N current fields.

## Topology, Publication and Safety

- The integration test uses one migrated caller-owned checkpoint setup and establishes the Phase 41 -> Phase 48 -> Phase 114 public baseline before Phase 115.
- Aurora's non-topology digest remains byte-identical. Its pre/post SHA-256 publication hashes are asserted different after exactly two new reverse links; the post-topology hash is recomputed, reviewed and published without replaying Phase 48/114 brand content. Literal transient fixture hashes were not emitted by the test runner, so this summary does not invent them.
- Aurora Optima `5waoVLPHU2Pt`, Aurora 88 family `s41AURORA88`, and Ottantotto Resina 800 `phase114-aurora-ottantotto-resina-800` retain full protected digests.
- Pristine replay returns three `noop` outcomes. Removing a terminal maker edge causes fail-closed rejection and no automatic repair. The real catalog main/WAL/SHM snapshot and route file hash remain unchanged.

## Verification

- `node --import tsx --test tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts`: TAP `1/1`, 0 failures, 87.7 seconds.
- `pnpm exec tsc --noEmit --pretty false`: passed.
- `pnpm exec biome check` on the three owned TypeScript files: passed (the ignored data/apply paths remain covered by TypeScript and the integration import path).
- `xmllint --noout` on all three SVGs: passed.
- Nine-path cached diff audit and `git diff --cached --check`: passed before commit; no deletions.

## Product Commit

- `9e0fd3e` — `feat(content): publish Aurora Ipsilon family and current pens`
- `git show --name-only --format=` proves the commit contains exactly the nine frontmatter product paths.
- Unrelated modified and untracked user content remains unstaged and unchanged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Respected trigger-owned reverse topology**

- **Found during:** Task 3 integration verification
- **Issue:** Inserting `made_by` creates the matching reverse edge through the existing database mechanism; a second unconditional reverse insert violated the unique topology constraint.
- **Fix:** Made the explicit verification insert idempotent with `INSERT OR IGNORE`, matching the Phase 114 pattern while retaining exact-pair checks.
- **Files modified:** `scripts/apply-phase115-aurora-ipsilon-family-current-pens-content.ts`
- **Verification:** Targeted TAP passes and asserts four total made_by/reverse rows for the two pens.
- **Committed in:** `9e0fd3e`

**2. [Rule 1 - Bug] Classified dated professional claims as core evidence without qualifying current specs**

- **Found during:** Task 3 publication readiness verification
- **Issue:** Marking the Bertram and Pen Boutique professional claims as editorial-only left the governed pens without a qualifying professional-secondary evidence group.
- **Fix:** Classified the dated professional claims as core evidence while retaining their dated scopes and rejected current-spec evidence, so source independence is recognized without cross-date field promotion.
- **Files modified:** `scripts/data/phase115-aurora-ipsilon-family-current-pens.ts`
- **Verification:** Both pens pass contract-v3 readiness and publication; structured rejected evidence remains present.
- **Committed in:** `9e0fd3e`

**Total deviations:** 2 auto-fixed Rule 1 bugs. Both were required for existing topology and publication contracts; no scope expansion.

## Known Stubs

None. Empty arrays found by the stub scan are test/query accumulators and do not flow to UI rendering.

## Scope Boundary

This is intentionally a partial batch. It publishes one Ipsilon family navigator and two exact current pens only; it does not create Italia／Stagioni d'Italia, Quadra or other sibling entities, complete Aurora/Ipsilon, complete Phase 23, roll out to the production catalog, or claim full-site completion.

## Self-Check: PASSED

- All nine product files exist in commit `9e0fd3e`.
- The commit subject and exact nine-path set match the plan, with no deletions.
- This post-product summary exists on disk and is intentionally left uncommitted for the orchestrator.
