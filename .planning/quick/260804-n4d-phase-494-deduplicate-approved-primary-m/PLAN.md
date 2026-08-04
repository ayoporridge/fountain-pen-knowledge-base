---
phase: 494
slug: phase-494-deduplicate-approved-primary-m
status: complete
---

# Phase 494 — separate shared primary media from brand/model pages

## Objective

Fix a bounded, evidence-backed subset of duplicate approved primary media without
creating entities or changing existing story/spec content. The owned checkpoint
must keep each scoped public entity at exactly one approved primary media row,
with an asset path used by no other public entity in this scope.

## Scope

- Esterbrook brand: use the existing Esterbrook family navigation SVG.
- Wancher brand: add one original brand-family factual SVG; keep the existing
  True Ebonite model SVG on the model only.
- Sheaffer Connaisseur, Imperial and Icon: use the existing Phase 309 per-model
  factual SVGs instead of the shared Phase 106 triptych.
- Opus 88 brand: use the existing Opus 88 family factual SVG instead of the
  Premium Opera model SVG.

## Safety and acceptance

1. Reject inherited remote database variables and require a caller-owned,
   non-symlink migrated copy under the task directory.
2. Update only media/source-reference rows and use
   `recordEntityContentReview` plus `publishEntity`; never write publication
   status directly.
3. Verify the four duplicate-path groups are gone, all six targets remain
   published and ready, paths exist under `public/`, references point to the
   new source items, replay is a no-op, and the protected real database snapshot
   is unchanged.
4. Run the targeted test, TypeScript check, Biome/diff checks, and commit only
   this task's plan, asset, apply script and test. All unrelated research and
   checkpoint directories remain untouched.
