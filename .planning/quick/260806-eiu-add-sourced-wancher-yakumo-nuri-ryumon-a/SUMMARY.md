---
quick_id: 260806-eiu
status: complete
completed: 2026-08-06
---

# Phase 527 summary

## Delivered

- Added source-backed Chinese research for Yakumo-nuri Ryumon - Amaterasu, Susano, and Orochi.
- Preserved the shared Ryumon-nuri water-marbling process while recording exact product ids, handles, SKUs, price windows, material/thread differences, and nib menus separately.
- Added three original factual SVG diagrams under `public/images/library/site-original/phase527/wancher/`, explicitly marked as non-product photos and not scale, colour, logo, inventory, or price proof.
- Added curated pack data, checkpoint-only apply script, and focused publication/replay/topology/media/source test.

## Verification

- `pnpm exec tsx --test tests/content/phase527-wancher-yakumo-ryumon-siblings.test.ts` — pass (1/1; three published, replay `noop/noop/noop`).
- The test used a checkpointed disposable catalog copy and verified the protected real catalog snapshot stayed unchanged.
- `pnpm exec tsc --noEmit` — only the three pre-existing baseline errors; no Phase 527 errors.
- `git diff --check` — pass.
- The real `data/fpkg.db`, Turso, and production were not written.
