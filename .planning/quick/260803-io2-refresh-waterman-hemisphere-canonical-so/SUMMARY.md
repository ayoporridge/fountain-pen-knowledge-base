# Phase 397 Summary: Waterman Hémisphère canonical sourced refresh

## Result

Deepened the existing canonical `gwKClNnwt3V3` (`waterman-hemisphere`, `威迪文 Waterman Hémisphère`) without creating an entity. The reviewed Chinese article is 8,120 characters in the persistent checkpoint and covers the official 1994 time anchor, current Blue CT item 2214204, Waterman W stainless-steel nib, finish/material boundaries, collection variants, cartridge/converter filling, cool-water cleaning, sibling identities, inventory status, and second-hand buying checks. The existing Waterman brand `zkAu9PePDdqJ` was replayed to keep the navigation relation coherent.

## Owned files

- `.planning/content-research/waterman-hemisphere-phase397.md`
- `scripts/data/phase397-waterman-hemisphere-refresh.ts`
- `scripts/apply-phase397-waterman-hemisphere-refresh.ts`
- `tests/content/phase397-waterman-hemisphere-refresh.test.ts`
- `.planning/quick/260803-io2-refresh-waterman-hemisphere-canonical-so/PLAN.md`
- `.planning/quick/260803-io2-refresh-waterman-hemisphere-canonical-so/SUMMARY.md`

The persistent database in `checkpoint/fpkg.db` is disposable and intentionally untracked.

## Source basis

- Waterman current Hémisphère collection: <https://www.waterman.com/pens/h%C3%A9misph%C3%A8re/>
- Waterman current Blue CT product, item 2214204: <https://www.waterman.com/pens/h%C3%A9misph%C3%A8re/h%C3%A9misph%C3%A8re/h%C3%A9misph%C3%A8re-fountain-pen/SAP_2214204.html>
- Waterman Heritage timeline: <https://www.waterman.com/waterman-history.html>
- Waterman filling instructions: <https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions>
- Waterman storage and cleaning: <https://www.waterman.com/support?cfid=fountain-pen-storage-and-cleaning-recommendations>
- Waterman Trade Catalogue 2021: <https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021>
- Pen Chalet dimensions and filling boundary: <https://www.penchalet.com/fine_pens/fountain_pens/waterman_hemisphere_fountain_pen.html>
- The Fountain Pen Network Blue Medium review: <https://www.fountainpennetwork.com/forum/topic/331517-waterman-h%C3%A9misph%C3%A8re-review-blue-medium-nib/>
- Wasserman.eu specific Black CT S0920530 record: <https://www.wasserman.eu/en/p/fountain-pen-fp-hemisphere-black-lacquer-ct-m-s0920530-waterman-899155>

## Validation

1. Targeted regression passed:

   `pnpm exec tsx --test tests/content/phase397-waterman-hemisphere-refresh.test.ts`

   The test uses a temporary owned copy, migrates it, rejects inherited remote selection, applies through the curated review/publish path, checks content/source/media/spec/variant/readiness/topology contracts, replays as `noop`, and removes the temporary copy.

2. Persistent owned checkpoint apply returned:

   - `zkAu9PePDdqJ`: `published`
   - `gwKClNnwt3V3`: `published`

   Persistent replay returned `noop` for both entities.

3. Persistent checkpoint readback:

   - `PRAGMA integrity_check`: `ok`
   - Hémisphère state: public, `published`, body length `8120`
   - Waterman brand state: public, `published`
   - Hémisphère readiness: `blocker_count=0`, `blockers_json=[]`, `publishable=1`
   - 10 approved source groups: 6 primary/editorial groups, 1 contemporary-archive catalogue group, and 3 professional-secondary groups
   - 4 variants: Blue CT `2214204`, Colour Blocking color group, current theme group, and 1994–present historical/region group
   - Current approved reviews: fact, language, media, publication
   - Exactly one `made_by` link Hémisphère → Waterman and one reverse navigation link Waterman → Hémisphère
   - Checkpoint totals remained `950 entities / 904 public / 642 published`; no new entity was created

4. TypeScript and formatting:

   - `pnpm exec biome check scripts/apply-phase397-waterman-hemisphere-refresh.ts scripts/data/phase397-waterman-hemisphere-refresh.ts tests/content/phase397-waterman-hemisphere-refresh.test.ts`: passed
   - `git diff --check`: passed
   - `pnpm exec tsc --noEmit`: only the three pre-existing diagnostics in `tests/content/phase346-jinhao-x450-x750.test.ts` (TS7022 on `pack`/`localPath`) and `tests/migration/sync-local-catalog-to-turso.test.ts` (TS2741 `NODE_ENV`); no Phase 397 diagnostics

5. Protected catalog check:

   SHA-256 of `data/fpkg.db` before and after the work remained:

   `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`

## Explicit boundary

This phase has not migrated anything to the real local database or Turso, deployed the site, or performed production/human online review. The checkpoint evidence is local and disposable; the full goal remains active with substantial uncovered content and later migration/deployment work required.
