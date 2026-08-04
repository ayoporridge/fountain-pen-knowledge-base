---
phase: 498
slug: phase-498-separate-five-further-brand-pr
status: complete
---

# Phase 498 Summary

## Delivered

This bounded media repair separated the primary media rows for five existing
brand pages from their representative model drawings:

- Ranga Pens
- Magna Carta
- TACCIA
- Mabie Todd & Co.
- Lotus Pens

Each brand now has its own original factual, non-photo SVG and Phase 498 source
item. The five model rows were read before and after the apply and were not
changed: their canonical local paths, source items, titles, and media identity
remain intact. No entity was created and no model prose or specification was
transferred to a brand page.

## Verification evidence

- First CLI apply on the owned checkpoint: 5/5 targets published through
  `recordEntityContentReview` (fact/language/media) and `publishEntity`; no
  direct publication-status write.
- First-apply content hashes:
  - Ranga `sha256:v3:85468b6406c0f2c4805dbead96fc5e754c6aff33192260e8a5f2802dfad3a262`
  - Magna Carta `sha256:v3:472bf387d44f0da0d495adb1124c9e842d42dee5857edd8aa317993651f88701`
  - TACCIA `sha256:v3:c3967307a78672747827fa01f67bb9c3fbbdeae1173541a6977dfa3067a0812e`
  - Mabie Todd `sha256:v3:d965853fc3e10e36e17e1bf83b9b95c138f5465be5d9058c5e6c4875aba9ebef`
  - Lotus `sha256:v3:3a7f3ff43bba3bad8bda86250573fe2670d34a52106f2f868da7c564fd91efa9`
- CLI replay returned `noop` for all five targets with identical hashes.
- Readback: all five brand pages were `published`, blocker-free, contract
  version 3, with reviewed revision equal to content revision. The five model
  pages remained published with their original media/source rows.
- Each targeted duplicate path fell from count 2 to count 1. Other pre-existing
  duplicate groups remain outside this bounded batch and require later work.
- `PRAGMA integrity_check` returned `ok`; `PRAGMA foreign_key_check` returned
  no rows.
- `pnpm exec tsx --test tests/content/phase498-further-brand-media.test.ts`
  passed: 1/1.
- Biome check and `git diff --check` passed. Full TypeScript reports only the
  three pre-existing baseline errors in
  `phase346-jinhao-x450-x750.test.ts` (TS7022 x2) and
  `sync-local-catalog-to-turso.test.ts` (NODE_ENV TS2741); no Phase 498 error
  remains.
- `data/fpkg.db` stayed byte-for-byte unchanged with SHA-256
  `e8c914b89685b399f24a9debae7f5ee9954020c4f0d7dff80bf8f4cf8f4f2299`.

## Boundary

The checkpoint copy is not the production database. This phase has not
performed the formal local migration, Turso sync, deployment, or online
readback. The overall full-content-repair goal remains active; additional
duplicate media groups and uncovered/underfilled brand-model pages remain.
