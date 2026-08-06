---
name: add-sourced-wancher-kyoto-hanasusuki-yukinoshita-tsugaru
status: complete
completed: 2026-08-06
---

# Phase 522 summary

## Delivered

- Added four source-backed Wancher Dream Pen entries without merging identities: Kyoto Urushi Kasane-iro - Hanasusuki, Kyoto Urushi Kasane-iro - Yukinoshita, Tsugaru Urushi - Anzu, and Tsugaru Urushi - Kobai-iro.
- Recorded exact official product IDs, handles, SKUs, clip/pen-pillow market variants, prices, materials, lacquer techniques, nib/feed menus, filling system, packaging and the unpublished dimensions/weight boundary.
- Added natural Chinese research pages covering colour history, craft context, version distinctions, maintenance, selection and second-hand identity checks. Independent context sources are Japan Government Highlighting Japan, Kyoto National Museum and the Aomori Lacquerware Federation.
- Added four original factual SVGs explicitly labelled as non-product-photo illustrations and a curated pack data file with source/spec/conflict evidence.
- Added an owned-checkpoint apply script that rejects remote database selection, verifies migration 032 and catalog authority, prepares exact maker/reverse topology, records fact/language/media reviews, and uses `publishEntity` for publication.

## Verification

- `pnpm exec tsx --test tests/content/phase522-wancher-kyoto-tsugaru-siblings.test.ts` passed: 1/1; four entities published on a disposable checkpoint and replayed as four `noop` results.
- The focused test checked article/body length, source sections, SVG labels, remote-env refusal, public identity, published contract revision, maker/reverse links, variant/spec/media counts, approved official JSON source, content hash and all four review kinds.
- `pnpm exec biome check --write tests/content/phase522-wancher-kyoto-tsugaru-siblings.test.ts` passed.
- `pnpm exec tsc --noEmit` still reports only the three pre-existing baseline errors in `tests/content/phase346-jinhao-x450-x750.test.ts` and `tests/migration/sync-local-catalog-to-turso.test.ts`; no Phase 522 error was introduced.
- Real `data/fpkg.db` snapshot remained unchanged; no Turso or production write was attempted.
