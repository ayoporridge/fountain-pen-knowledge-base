---
quick_id: 260806-dwu
status: complete
completed: 2026-08-06
---

# Phase 525 summary

## Delivered

- Added source-backed research for the exact Wancher Yakumo-nuri Shibo Urushi products Sazanami, Homura, and Shinra.
- Kept each exact product id, handle, SKU, price window, design theme, Shibo Urushi technique, nib/feed menu, filling standard, packaging, care boundary, and identity boundary separate.
- Added three original factual SVG diagrams under `public/images/library/site-original/phase525/wancher/`; each is explicitly marked as a non-product photo and not a scale, color, logo, inventory, or price proof.
- Added `scripts/data/phase525-wancher-yakumo-shibo-siblings.ts`, `scripts/apply-phase525-wancher-yakumo-shibo-siblings.ts`, and a focused publication/replay/topology/media/source test.
- The apply path uses `recordEntityContentReview` for fact/language/media and `publishEntity`; it rejects inherited remote database variables and verifies the authorized owned copy migrated through `032_taxonomy_identity.sql`.

## Verification

- `pnpm exec tsx --test tests/content/phase525-wancher-yakumo-shibo-siblings.test.ts` — pass (1/1; three published, replay `noop/noop/noop`).
- The test used a checkpointed disposable catalog copy and verified the protected real catalog snapshot stayed unchanged.
- `pnpm exec tsc --noEmit` — only the three pre-existing baseline errors in `phase346-jinhao-x450-x750.test.ts` and `sync-local-catalog-to-turso.test.ts`; no Phase 525 errors.
- `git diff --check` — pass.
- The real `data/fpkg.db`, Turso, and production were not written.
