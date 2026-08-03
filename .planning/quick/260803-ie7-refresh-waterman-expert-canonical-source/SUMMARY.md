# Phase 396 Summary: Waterman Expert canonical sourced refresh

## Result

Refreshed the existing canonical `YAiCRah1XAsz` (`waterman-expert`, `威迪文 Waterman Expert`) without creating an entity. The package deepens the Chinese article to 8,286 characters and keeps the current Blue CT SKU, historical Expert I/II/III terminology, sibling-model boundaries, maintenance, selection guidance, and media/source limits in one reviewed pack. The existing Waterman brand `zkAu9PePDdqJ` was replayed in the same apply so its navigation relation remains current.

## Owned files

- `.planning/content-research/waterman-expert-phase396.md`
- `scripts/data/phase396-waterman-expert-refresh.ts`
- `scripts/apply-phase396-waterman-expert-refresh.ts`
- `tests/content/phase396-waterman-expert-refresh.test.ts`
- `.planning/quick/260803-ie7-refresh-waterman-expert-canonical-source/PLAN.md`
- `.planning/quick/260803-ie7-refresh-waterman-expert-canonical-source/SUMMARY.md`

The persistent database under `checkpoint/fpkg.db` is disposable and intentionally remains untracked.

## Source basis

- Waterman current Expert collection: <https://www.waterman.com/pens/expert/>
- Waterman current Blue CT product, item 2214207: <https://www.waterman.com/pens/expert/expert-fountain-pen/SAP_2214207.html>
- Waterman Heritage timeline (Expert 1990–92; Hémisphère 1994; Carène 1997): <https://www.waterman.com/waterman-history.html>
- Waterman filling instructions: <https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions>
- Waterman storage and cleaning: <https://www.waterman.com/support?cfid=fountain-pen-storage-and-cleaning-recommendations>
- Waterman Trade Catalogue 2021: <https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021>
- Pen Heaven specific stainless/gold-trim measurements: <https://www.penheaven.com/waterman-expert-stainless-steel-gold-trim-fountain>
- Pen Chalet product boundary: <https://www.penchalet.com/fine_pens/fountain_pens/waterman_expert_fountain_pen.html>
- The Gentleman Stationer design and use comparison: <https://www.gentlemanstationer.com/blog/2020/7/2/unsung-heroes-the-waterman-expert-fountain-pen>
- Andrew Lensky generation comparison: <https://lenskiy.org/2024/09/modern-waterman-expert-gen-ii/>

## Validation

1. Targeted regression passed:

   `pnpm exec tsx --test tests/content/phase396-waterman-expert-refresh.test.ts`

   The test copied `data/fpkg.db` to a temporary owned copy, migrated it, rejected inherited remote selection, applied through the curated review/publish path, checked the source/media/spec/variant/topology/readiness contracts, replayed as `noop`, and removed the temporary copy.

2. Persistent owned checkpoint apply returned:

   - `zkAu9PePDdqJ`: `published`
   - `YAiCRah1XAsz`: `published`

   Persistent replay returned `noop` for both entities.

3. Persistent checkpoint readback:

   - `PRAGMA integrity_check`: `ok`
   - Expert state: public, `published`, body length `8286`
   - Waterman brand state: public, `published`
   - Expert readiness: `blocker_count=0`, `blockers_json=[]`, `publishable=1`
   - 11 approved source groups: 6 primary/editorial asset groups, 1 contemporary-archive catalogue group, and 4 professional-secondary groups
   - 4 variants: current Blue CT `2214207`, current family/theme group, historical Expert I/II/III group, catalogue/region 18K group
   - Current approved reviews: fact, language, media, publication
   - Exactly one `made_by` link Expert → Waterman and one reverse navigation link Waterman → Expert
   - Checkpoint totals remained `950 entities / 904 public / 642 published`; no new entity was created

4. TypeScript and formatting:

   - `pnpm exec biome check scripts/apply-phase396-waterman-expert-refresh.ts scripts/data/phase396-waterman-expert-refresh.ts tests/content/phase396-waterman-expert-refresh.test.ts`: passed
   - `git diff --check`: passed
   - `pnpm exec tsc --noEmit`: only the three pre-existing diagnostics in `tests/content/phase346-jinhao-x450-x750.test.ts` (TS7022 on `pack`/`localPath`) and `tests/migration/sync-local-catalog-to-turso.test.ts` (TS2741 `NODE_ENV`); no Phase 396 diagnostics

5. Protected catalog check:

   SHA-256 of `data/fpkg.db` before and after the work remained:

   `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`

## Explicit boundary

This phase has not migrated anything to the real local database or Turso, deployed the site, or performed production/human online review. The checkpoint evidence is local and disposable; the full goal remains active with substantial uncovered content and later migration/deployment work required.
