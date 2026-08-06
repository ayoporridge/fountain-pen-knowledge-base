---
name: add-sourced-wancher-oita-urushi-kurozan-aizu-tamamushi-bokashi
status: complete
completed: 2026-08-06
---

# Phase 521 summary

## Delivered

- Added four source-backed Wancher Dream Pen entries without merging their identities: Oita Urushi - Kurozan, Aizu Urushi - Tamamushi-nuri - Midori, Bokashi-nuri - Oboro, and Bokashi-nuri - Tsubomi.
- Recorded official product IDs, handles, SKUs, prices, materials, lacquer techniques, nib/feed menus, filling system, packaging and the published-dimensions boundary. Each article includes natural Chinese introduction, craft context, version/identity distinction, maintenance and selection guidance.
- Added independent context sources for Japanese lacquer/Aizu lacquerware, plus four original factual SVGs explicitly labelled as non-product-photo illustrations.
- Added an owned-checkpoint apply script that rejects remote database selection, verifies migration 032 and catalog authority, creates only exact topology, records fact/language/media reviews, and calls `publishEntity` rather than bypassing publication guards.

## Verification

- `pnpm exec tsx --test tests/content/phase521-wancher-japanese-lacquer-siblings.test.ts` passed: 1/1; four entities published on a disposable checkpoint and replayed as four `noop` results.
- The focused test checked article/body length, source sections, SVG labels, remote-env refusal, public identity, published contract revision, maker/reverse links, variant/spec/media counts, approved official JSON source, content hash and all four review kinds.
- `pnpm exec biome check --write tests/content/phase521-wancher-japanese-lacquer-siblings.test.ts` passed.
- `pnpm exec tsc --noEmit` still reports only the three pre-existing baseline errors in `tests/content/phase346-jinhao-x450-x750.test.ts` and `tests/migration/sync-local-catalog-to-turso.test.ts`; no Phase 521 error was introduced.
- Real `data/fpkg.db` snapshot remained unchanged; no Turso or production write was attempted.
