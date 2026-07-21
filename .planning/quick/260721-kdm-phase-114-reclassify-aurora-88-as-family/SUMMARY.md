---
phase: quick-260721-kdm
plan: phase-114-reclassify-aurora-88-as-family
subsystem: content-taxonomy
tags: [aurora, reclassification, sourced-content, sqlite, publication]
requires:
  - Phase 41 Aurora seeded identities
  - Phase 48 Aurora contract-v3 publication baseline
provides:
  - Same-ID Aurora 88 family article at /article/aurora-88
  - Exact Aurora Ottantotto Resina 800 pen at /pen/aurora-ottantotto-resina-800
  - Legacy /pen/aurora-88 redirect contract
affects: [aurora-brand-topology, entity-publication-hash, public-navigation]
tech-stack:
  added: []
  patterns: [same-ID pen-to-article reclassification, caller-owned checkpoint apply, current-hash republish]
key-files:
  created:
    - .planning/content-research/aurora-88-family-phase114.md
    - .planning/content-research/aurora-ottantotto-resina-800-phase114.md
    - scripts/data/phase114-aurora-88-family-ottantotto-resina-800.ts
    - scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content.ts
    - tests/content/phase114-aurora-88-family-ottantotto-resina-800.test.ts
    - public/images/library/site-original/phase114/aurora/aurora-88-family.svg
    - public/images/library/site-original/phase114/aurora/aurora-ottantotto-resina-800.svg
  modified:
    - src/lib/entity-redirects.ts
decisions:
  - Keep s41AURORA88 as the immutable family identity and create a separate exact-SKU identity.
  - Treat official 1947 as the canonical page anchor while preserving FountainPen.it's late-1946/1947 chronology divergence.
  - Keep the 2007 FPN 800/C report community-scoped and exclude its measurements, capacity, trim, and experience from the current 800 specification.
metrics:
  duration: 31m
  tasks: 3
  files: 8
  completed: 2026-07-21
status: complete
---

# Phase 114: Reclassify Aurora 88 Family and Publish Resina 800 Summary

Aurora 88 now keeps its original identity as a sourced family-navigation article, while an exact current Resina 800 receives its own governed pen identity, evidence scopes, publication, and maker topology.

## Delivered

- Reclassified `s41AURORA88` in place from `pen/aurora-88` to `article/aurora-88`; the terminal article has no pen-only specs, variants, claims, maker links, or publication lifecycle row.
- Added exact pen `phase114-aurora-ottantotto-resina-800` with slug `aurora-ottantotto-resina-800`, plus its unique `made_by`/`reverse` pair with Aurora `CJXe8UpnkHLJ`.
- Added only the legacy route `pen/aurora-88` -> `/article/aurora-88`; family and exact pages link to each other.
- Added two distinct site-original SVG evidence diagrams and two checked-in sourced articles over 2,000 characters each.
- Preserved Aurora Optima `5waoVLPHU2Pt` and Aurora's non-topology payload. The expected family-link removal and exact-link addition change Aurora's contract hash, after which reviews and publication are recreated against the current hash without replaying the Phase 41/48 pack.

## Evidence Boundaries

- Official history: `https://www.aurorapen.it/storia/` supports the 1947 Aurora 88 launch and Marcello Nizzoli attribution.
- Independent chronology: `https://www.fountainpen.it/Aurora/en` remains `professional_secondary`; its late-1946/1947 divergence is attributed rather than flattened into an exact launch-day claim.
- Current exact listing: `https://www.aurorapen.it/prodotto/penna-stilografica-aurora-ottantotto-resina-nera-cappuccio-nero-finiture-oro/` supports SKU 800, black resin, gold trim, piston filling, EF/F/M/B choices, and the retrieved-date availability snapshot.
- Aurora FAQ and Ottantotto category remain family/high-end context. The FAQ's 14K language is not promoted to an exact-SKU stable spec.
- The 2007 Fountain Pen Network 800/C thread remains `community` evidence in an isolated sample scope. Chrome trim, reported capacity/dimensions, and ownership experience are explicitly rejected for current-model transfer.

## Safety and Verification

- The apply path accepts only the verified CodeBuddy/Documents repo alias pair and caller-owned checkpoint files, rejects remote selectors, empty reviewers, protected main/sidecars, symlinks/hardlinks, PRAGMA mismatch, and pre-migration-032 copies.
- The integration suite performs one migrated setup, derives fault cases from caller-owned checkpoints, verifies protected catalog snapshots, confirms pristine replay returns two noops, and confirms a removed maker link fails closed without repair.
- Final automated chain passed: targeted Node TAP `1/1`, `tsc --noEmit`, owned-file Biome, both SVGs via `xmllint`, and eight-path `git diff --check`.
- Product commit: `a88aabf` (`feat(content): reclassify Aurora 88 family and publish Resina 800`), verified to contain exactly the eight planned product files and no deletions.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed trigger-created family draft after type conversion**

- **Found during:** Task 3 terminal integration verification
- **Issue:** Migration 032 recreates a draft `entity_publications` row when a governed pen changes type, preventing the reclassified article from entering the intended non-governed public branch.
- **Fix:** Delete the trigger-created lifecycle row immediately after the same-transaction type update, matching the established Phase 104 ordering.
- **Files modified:** `scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content.ts`
- **Commit:** `a88aabf`

## Known Stubs

None. Empty arrays in test/query accumulators are runtime construction details and do not flow to UI rendering.

## Scope Boundary

This is intentionally a partial batch: it delivers the Aurora 88 family navigation and one exact current Resina 800 only. It does not claim that the wider Aurora catalog or the full fountain-pen corpus is complete.

## Self-Check: PASSED

- All eight product files exist in commit `a88aabf`.
- The commit contains exactly the planned path set.
- The post-product summary exists on disk and is intentionally left uncommitted for the orchestrator.
