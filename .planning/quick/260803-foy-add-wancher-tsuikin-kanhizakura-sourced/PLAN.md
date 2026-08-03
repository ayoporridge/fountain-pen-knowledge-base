# Phase 388 — Wancher Dream Pen Tsuikin Kanhizakura

## Goal

Add the missing Wancher Dream Pen Tsuikin Kanhizakura SKU as a source-backed, naturally written Chinese model page, while preserving its identity as one concrete pen rather than merging it with the Dream Pen series or adjacent Ryukyu Tsuikin designs.

## Scope

- Add one new `pen` entity and a Wancher brand navigation update through the existing `CuratedEntityPack` path.
- Record official product, series, craft, care, botanical and editorial sources with independence groups.
- Capture the current Japanese product specification (`Ebonite、堆錦`) and explicitly resolve the same-page generic buffalo-horn wording as a source conflict instead of silently choosing both.
- Record the three nib options and three feed options without inventing dimensions, weight or writing performance.
- Publish only on an owned checkpoint copy after fact/language/media/publication reviews; never write the real catalog during experimentation.
- Add a factual original SVG marked as non-photo, non-logo, not-to-scale and non-colour-proof.

## Verification

1. Targeted Vitest/node test proves remote selection is rejected, identity/topology are unambiguous, reviews are approved, variants and conflict are present, replay is a no-op, and the protected catalog is unchanged.
2. Run Biome, `git diff --check`, and TypeScript; report only pre-existing baseline diagnostics if any remain.
3. Apply to the persistent checkpoint copy, read back publication/quality/library counts, run the entity-quality audit and integrity check, then commit only owned Phase 388 files plus this plan and summary.

## Out of scope

No production database migration, Turso sync, deployment, broad audit framework, Playwright expansion, search or LLM restoration, or cleanup of unrelated worktree files.
