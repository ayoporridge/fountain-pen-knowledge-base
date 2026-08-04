---
phase: 496
slug: phase-496-separate-five-historical-brand
status: complete
---

# Phase 496 Summary

## Delivered

This bounded media repair separated the primary media rows for five existing
historical brand pages from their representative model drawings:

- Chilton
- Picasso 毕加索
- Charles H. Ingersoll
- Wearever
- Wahl

Each brand now has its own original factual, non-photo SVG and Phase 496 source
item. The five model rows were read before and after the apply and were not
changed: their canonical local paths, source items, titles, and media identity
remain intact. No entity was created and no model prose or specification was
transferred to a brand page.

## Verification evidence

- First CLI apply on the owned checkpoint: 5/5 targets published through
  `recordEntityContentReview` (fact/language/media) and `publishEntity`; no
  direct publication-status write.
- First-apply content hashes:
  - Chilton `sha256:v3:cfdf45f3a6158e1676cdc04c5f4b4074a8541dcb4d44bcab7b9f042dd2dfe44f`
  - Picasso `sha256:v3:eb6c018fe2ffb9b8b977a87d5491d0e110311602baea65757576f28ef2a67142`
  - Ingersoll `sha256:v3:86d182433c76c71de439a803a43864182c8a6fb8c9a7aa1eb50f3b3337bef379`
  - Wearever `sha256:v3:444ea6a9a338812fabb6bd0b7625193528a0c56ff0c5a7ca30b09a13a0869362`
  - Wahl `sha256:v3:2cb48798f6240c9cea8ca0e293ad77b8d8c7a98ce05b2b6a597d530384680ecb`
- CLI replay returned `noop` for all five targets with identical hashes.
- Readback: all five brand pages were `published`, blocker-free, contract
  version 3, with reviewed revision equal to content revision. The five model
  pages remained published with their original media/source rows.
- Each targeted duplicate path fell from count 2 to count 1. Other pre-existing
  duplicate groups remain outside this bounded batch and require later work.
- `PRAGMA integrity_check` returned `ok`; `PRAGMA foreign_key_check` returned
  no rows.
- `pnpm exec tsx --test tests/content/phase496-historical-brand-media.test.ts`
  passed: 1/1.
- Biome check and `git diff --check` passed. Full TypeScript reports only the
  three pre-existing baseline errors in
  `phase346-jinhao-x450-x750.test.ts` (TS7022 x2) and
  `sync-local-catalog-to-turso.test.ts` (NODE_ENV TS2741); no Phase 496 error
  remains.
- `data/fpkg.db` stayed byte-for-byte unchanged with SHA-256
  `e8c914b89685b399f24a9debae7f5ee9954020c4f0d7dff80bf8f4cf8f4f2299`.

## Boundary

The checkpoint copy is not the production database. This phase has not
performed the formal local migration, Turso sync, deployment, or online
readback. The overall full-content-repair goal remains active; additional
duplicate media groups and uncovered/underfilled brand-model pages remain.
