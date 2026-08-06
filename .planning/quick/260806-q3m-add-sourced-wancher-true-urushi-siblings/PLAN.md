# Quick Task Plan: Add sourced Wancher True Urushi siblings

## Objective

Complete and publish three previously uncovered Wancher True Urushi product entities on an owned disposable checkpoint copy:

- True Urushi - Heki Tamenuri
- True Urushi - Ao Tamenuri
- True Urushi - Midori Tamenuri

Preserve the canonical Wancher maker relation, use the review-gated `recordEntityContentReview` + `publishEntity` path, and do not write the protected `data/fpkg.db`.

## Owned files

- `.planning/content-research/wancher-true-urushi-heki-tamenuri-phase535.md`
- `.planning/content-research/wancher-true-urushi-ao-tamenuri-phase535.md`
- `.planning/content-research/wancher-true-urushi-midori-tamenuri-phase535.md`
- `public/images/library/site-original/phase535/wancher/true-urushi-heki-tamenuri.svg`
- `public/images/library/site-original/phase535/wancher/true-urushi-ao-tamenuri.svg`
- `public/images/library/site-original/phase535/wancher/true-urushi-midori-tamenuri.svg`
- `scripts/data/phase535-wancher-true-urushi-siblings.ts`
- `scripts/apply-phase535-wancher-true-urushi-siblings.ts`
- `tests/content/phase535-wancher-true-urushi-siblings.test.ts`

## Verification

1. Inspect the official product JSON and official product/collection/care pages; record exact IDs, handles, dates, SKUs, clip variants, material, nib/feed and filling facts.
2. Validate all three natural Chinese articles, sources, specs, identity, media and topology against the existing curated-pack contract.
3. Run the focused Vitest/node test on an owned checkpoint copy. Verify publication reviews, replay no-ops, Wancher relations and unchanged real catalog snapshot.
4. Run Biome, `git diff --check`, and TypeScript; record any pre-existing diagnostics without broadening scope.
5. Review `git status --short`; stage only the owned files listed above and commit this batch.

## Status

Completed 2026-08-06. The focused test published all three packs on an owned checkpoint copy, replayed them as no-ops, and verified the protected catalog snapshot was unchanged.
