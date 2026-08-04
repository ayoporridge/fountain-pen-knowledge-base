---
phase: 495
slug: phase-495-separate-five-chinese-brand-pa
status: complete
---

# Phase 495 Summary

## Delivered

This bounded media repair separated the primary media rows for five existing
Chinese brand pages from their representative model drawings:

- 依人 Yiren
- YongXu
- 东吴 DongWu
- 书乐 ShuLe
- 长江 ZhangJiang

Each brand now has its own original factual, non-photo SVG and Phase 495 source
item. The five model rows were read before and after the apply and were not
changed: their canonical local paths, source items, titles, and media identity
remain intact. No entity was created and no model prose or specification was
inferred from a sibling research sample.

## Verification evidence

- First apply on the owned checkpoint: 5/5 targets published through
  `recordEntityContentReview` (fact/language/media) and `publishEntity`; no
  direct publication-status write.
- Content hashes from the first apply were stable on replay. The replay
  returned `noop` for all five targets:
  - Yiren `sha256:v3:c77a481d59dc70e265f3416acb459edaebbaff8755340c941eee8bd0b2d925fa`
  - YongXu `sha256:v3:84dd1144c09c5470de67cbcd9275a82d2e5659f638be25b38fd8265453c13155`
  - DongWu `sha256:v3:5e55a2fe8b269dc3cd740e766bf616d18b7089844d4eb9f7be9efcb067b5a461`
  - ShuLe `sha256:v3:bdbea88419889bc1e19f0fc612bfdd078bb680b5681d811ed38919ea969216be`
  - ZhangJiang `sha256:v3:c0f744ead840522d0a598e153060a256df2c5b31e095e073cd7e55fbfd4b5d9d`
- Readback: all five brand pages were `published`, blocker-free, contract
  version 3, with reviewed revision equal to content revision.
- The five targeted duplicate primary-media paths each fell from count 2 to
  count 1. Other pre-existing duplicate groups remain outside this bounded
  batch and require later batches.
- `PRAGMA integrity_check` returned `ok`; `PRAGMA foreign_key_check` returned
  no rows.
- `pnpm exec tsx --test tests/content/phase495-chinese-brand-media.test.ts`
  passed: 1/1.
- Biome check and `git diff --check` passed. Full TypeScript still reports
  only the three pre-existing baseline errors in
  `phase346-jinhao-x450-x750.test.ts` (TS7022 x2) and
  `sync-local-catalog-to-turso.test.ts` (NODE_ENV TS2741); no Phase 495 error
  was added.
- `data/fpkg.db` stayed byte-for-byte unchanged with SHA-256
  `e8c914b89685b399f24a9debae7f5ee9954020c4f0d7dff80bf8f4cf8f4f2299`.

## Boundary

The checkpoint copy is not the production database. This phase has not
performed the formal local migration, Turso sync, deployment, or online
readback. The overall full-content-repair goal remains active; additional
duplicate media groups and uncovered/underfilled brand-model pages remain.
