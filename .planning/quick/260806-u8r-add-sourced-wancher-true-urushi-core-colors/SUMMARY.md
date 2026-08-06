# Phase 536 Summary: Wancher True Urushi core colors

## Delivered

- Added source-backed Chinese research for three previously uncovered official Wancher products:
  - True Urushi - Kuro Tamenuri (`7020721995951`, KUTA clip SKUs)
  - True Urushi - Blue (`609203519532`, single `WF-UR-DREAM-BLUE` SKU)
  - True Urushi - Green (`694968221740`, GREEN clip SKUs)
- Preserved the distinction between Green and Midori Tamenuri, between regular Kuro and the separate AS IS listing, and between Blue's single Default Title and the clip-bearing siblings.
- Recorded official created/published timestamps, market variants, prices and retrieval-window availability. Conflicting product-page labels and JSON snapshots are explicitly treated as mutable commercial evidence rather than lifecycle claims.
- Recorded exact public specifications per page: Ebonite + Urushi, European International Standard converter/cartridge, page-specific nib lists, plastic/black ebonite/red ebonite feeds, compact air-tight cap and official package.
- Added three distinct site-original factual SVG diagrams marked as non-product photos and not colour/scale/logo/stock/price proof.
- Added a remote-refusing, review-gated apply script using `recordEntityContentReview` and `publishEntity`, with Wancher maker/reverse topology and protected-catalog guards.

## Evidence and verification

- Official product pages, product JSON endpoints, True Urushi collection, Wancher care guide, Wajimanuri professional process guide and Government of Japan Wajima context are recorded in each research file and pack.
- `pnpm exec tsx --test tests/content/phase536-wancher-true-urushi-core-colors.test.ts` passed: three publication contracts, identity/topology, reviews, specs, media and sources verified; replay returned three no-ops; protected `data/fpkg.db` snapshot unchanged.
- Biome, `git diff --check` and article checks passed. `pnpm exec tsc --noEmit` still reports only the three pre-existing diagnostics in Phase 346 and Turso migration tests.
- No real catalog or remote database was written. Formal migration remains a later overall-goal step.

## Commit scope

Only the files listed in this quick task are owned by Phase 536. Unrelated research files, `.next-phase*` directories, old checkpoint copies and the Montblanc quick directory must remain unstaged.
