---
name: add-sourced-wancher-hirota-sabi-nuri-chawan-momo-yakumo
completed: 2026-08-06
status: complete
---

# Phase 523 summary

## Delivered

- Added four source-backed Wancher product records:
  - Hirota Urushi - Sabi Nuri Fountain Pen
  - Hirota Urushi - Chawan-iro - Momo
  - Yakumo-nuri Shibo Urushi - Ryuusei
  - Yakumo-nuri Chijimi - Black
- Recorded exact product IDs, handles, SKU/market variants, nib and feed menus, filling standards, craft context, conservative Urushi care, and image/source boundaries.
- Added four original factual SVG diagrams; none is presented as a product photograph.
- Added the Phase 523 curated pack and apply path. Publication uses `recordEntityContentReview` and `publishEntity`; no direct publication-status bypass is used.
- Added an owned-checkpoint regression covering content length, source tiers, publication contract, identity topology, 16 Chijimi variants, media, replay idempotency, and protected catalog immutability.

## Verification

- `pnpm exec tsx --test tests/content/phase523-wancher-hirota-yakumo-siblings.test.ts` passed (1/1).
- The test published all four packs on a disposable migrated copy and replayed all four as `noop`.
- `pnpm exec tsc --noEmit` reports only the three pre-existing baseline errors in `phase346-jinhao-x450-x750.test.ts` and `sync-local-catalog-to-turso.test.ts`.
- `git diff --check` passed for the package.
- Real `data/fpkg.db`, Turso, and production were not written.
