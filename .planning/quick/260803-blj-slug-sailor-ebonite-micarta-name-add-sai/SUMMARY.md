---
quick_id: 260803-blj
slug: sailor-ebonite-micarta
status: complete
---

# Phase 377 Summary

## Delivered

- Added two previously absent Sailor model entities to the replayable content catalog:
  - EBONITE ETERNAL FLOW `10-6085`, slug `sailor-ebonite-eternal-flow`.
  - Black Micarta `10-5060`, slug `sailor-black-micarta`.
- Preserved future publication state: `2026-09-12` and `2026-10-17` remain planned release dates as of the `2026-08-03` research read.
- Preserved the Japanese/English market-code boundary as variants under one model identity:
  - Ebonite: Japanese F/M plus English-page B.
  - Micarta: Japanese F/M/B plus English-page suffix notes.
- Added natural Chinese research copy covering identity, official specifications, material/process context, market differences, maintenance, selection, and media/source boundaries.
- Added two site-original factual SVG identity cards; each declares `non-photo`, `non-logo`, `not-to-scale`, and `non-colour-proof`.
- Added guarded apply script using `recordEntityContentReview` and `publishEntity` through the existing `applyCuratedContentPacks` path. It refuses remote selectors and protected/hard-linked catalogs.

## Source boundary

Primary sources are Sailor Japanese and English product pages, the Sailor fountain-pen category, the official nib guide, refill/care guides, and the official ebonite craft topic. Independent professional retailers (Usagiya, PW Akkerman, You Style, and Stilo e Stile) are used only for market-SKU corroboration. The English Ebonite page's additional B listing is retained as a market variant, not a separate entity.

## Checkpoint evidence

All writes below were performed only on:

`.planning/quick/260803-blj-slug-sailor-ebonite-micarta-name-add-sai/checkpoint/fpkg-copy.db`

- `copy-init.json`: source and initial copy SHA-256 both `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`.
- `first-apply.json`: Sailor brand plus both models returned `published`.
- `replay.json`: all three returned `noop` with unchanged content hashes.
- `sql-evidence.json`: both models have the expected public identity, Sailor maker/reverse links, 3 variants, 9/10 references, one approved SVG primary media, four approved current-hash reviews, no fact conflicts, and `primary_archive_group_count=5` / `professional_secondary_group_count=2`.
- The protected real catalog was not opened with a write client. Its SHA-256 remained `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64` after the run.

## Verification

- `pnpm exec tsx --test tests/content/phase377-sailor-ebonite-micarta.test.ts` — PASS (1/1).
- `pnpm exec biome check scripts/data/phase377-sailor-ebonite-micarta.ts scripts/apply-phase377-sailor-ebonite-micarta-content.ts tests/content/phase377-sailor-ebonite-micarta.test.ts` — PASS.
- `pnpm exec tsc --noEmit` — only pre-existing diagnostics remain in `tests/content/phase346-jinhao-x450-x750.test.ts` (TS7022 at lines 183/184) and `tests/migration/sync-local-catalog-to-turso.test.ts` (TS2741 at line 76); no Phase 377 diagnostics.
- `git diff --cached --check` is required after staging and before commit; unrelated research files, `.next-phase*`, and old quick directories remain unstaged.

## Not done here

This phase does not migrate `data/fpkg.db`, Turso, Fly, or production. The full Fountain Pen Knowledge Graph goal remains active and requires continued brand/model coverage, formal migration, whole-site checks, human traversal, deployment, and online recheck.
