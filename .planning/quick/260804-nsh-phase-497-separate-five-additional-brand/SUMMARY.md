---
phase: 497
slug: phase-497-separate-five-additional-brand
status: complete
---

# Phase 497 Summary

## Delivered

This bounded media repair separated the primary media rows for five existing
brand pages from their representative model drawings:

- Dunn
- S.T. Dupont
- Eboya
- Kanwrite
- Gravitas Pens

Each brand now has its own original factual, non-photo SVG and Phase 497 source
item. The five model rows were read before and after the apply and were not
changed: their canonical local paths, source items, titles, and media identity
remain intact. No entity was created and no model prose or specification was
transferred to a brand page.

## Verification evidence

- First CLI apply on the owned checkpoint: 5/5 targets published through
  `recordEntityContentReview` (fact/language/media) and `publishEntity`; no
  direct publication-status write.
- First-apply content hashes:
  - Dunn `sha256:v3:732378a06b8c372b2c9c7769d32ff5e172d653ca95e78c94811e67020777a788`
  - S.T. Dupont `sha256:v3:99c3327c31d13efb292d8ee7c763c76052c6af7898f7894a6ef6e3bc2a3ad826`
  - Eboya `sha256:v3:1651220d4899b3fc0527ab059fcb25cb894a439f8dec4be2ac226f8f7354de36`
  - Kanwrite `sha256:v3:c604d96c3792328a462b029d2a9bc98a0f004beffa3a55b543b4d72864197eaa`
  - Gravitas `sha256:v3:168882abd94118f0a0103d314d493ad178a599aadb0673dacb6572e5bf4cfe5c`
- CLI replay returned `noop` for all five targets with identical hashes.
- Readback: all five brand pages were `published`, blocker-free, contract
  version 3, with reviewed revision equal to content revision. The five model
  pages remained published with their original media/source rows.
- Each targeted duplicate path fell from count 2 to count 1. Other pre-existing
  duplicate groups remain outside this bounded batch and require later work.
- `PRAGMA integrity_check` returned `ok`; `PRAGMA foreign_key_check` returned
  no rows.
- `pnpm exec tsx --test tests/content/phase497-additional-brand-media.test.ts`
  passed: 1/1.
- Biome check and `git diff --check` passed. Full TypeScript reports only the
  three pre-existing baseline errors in
  `phase346-jinhao-x450-x750.test.ts` (TS7022 x2) and
  `sync-local-catalog-to-turso.test.ts` (NODE_ENV TS2741); no Phase 497 error
  remains.
- `data/fpkg.db` stayed byte-for-byte unchanged with SHA-256
  `e8c914b89685b399f24a9debae7f5ee9954020c4f0d7dff80bf8f4cf8f4f2299`.

## Boundary

The checkpoint copy is not the production database. This phase has not
performed the formal local migration, Turso sync, deployment, or online
readback. The overall full-content-repair goal remains active; additional
duplicate media groups and uncovered/underfilled brand-model pages remain.
