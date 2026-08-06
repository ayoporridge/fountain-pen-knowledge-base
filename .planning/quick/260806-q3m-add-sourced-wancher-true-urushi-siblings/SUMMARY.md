# Phase 535 Summary: Wancher True Urushi siblings

## Delivered

- Added source-backed Chinese research for three previously uncovered official Wancher products:
  - True Urushi - Heki Tamenuri (`7562003349719`, HETA SKUs)
  - True Urushi - Ao Tamenuri (`8131732013271`, AOTA SKUs)
  - True Urushi - Midori Tamenuri (`4685010239569`, MITA SKUs)
- Recorded the official created/published timestamps, three clip market variants per product, prices and retrieval-window availability without treating mutable inventory as a permanent lifecycle claim.
- Recorded exact shared specifications: Ebonite + Urushi, European International Standard converter/cartridge, #6 JoWo stainless steel or Wancher 18K gold nib, plastic/black ebonite/red ebonite feed, compact air-tight cap and the official package.
- Preserved the identity boundary between Heki, Ao and Midori; no existing sibling entity was reused or merged.
- Added three distinct site-original factual SVG diagrams. They are explicitly marked as non-product photos and do not claim scale, colour calibration, logo, stock or price.
- Added an apply script that refuses inherited remote selection, protected catalog/hard-link aliases and un-migrated copies, then uses `recordEntityContentReview` plus `publishEntity` for the review-gated path.

## Evidence and verification

- Official product pages, product JSON endpoints, True Urushi collection, Wancher care guide, Wajimanuri process guide and Government of Japan Wajima context are recorded in each research file and pack.
- `pnpm exec tsx --test tests/content/phase535-wancher-true-urushi-siblings.test.ts` passed: 3 published, publication contract/reviews/specs/media/sources/relations verified, replay returned 3 no-ops, protected `data/fpkg.db` snapshot unchanged.
- `pnpm exec biome check` and `git diff --check` passed for the owned TypeScript files; `pnpm exec tsc --noEmit` still reports only the three pre-existing diagnostics in Phase 346 and Turso migration tests.
- No real catalog or remote database was written. Formal migration remains a later overall-goal step.

## Commit scope

Only the files listed in `PLAN.md` are owned by this quick task. Unrelated research files, `.next-phase*` directories, old checkpoint copies and the Montblanc quick directory remain untouched and must not be staged.
