---
phase: 499
slug: phase-499-separate-five-independent-bran
status: complete
---

# Phase 499 Summary

## Delivered

This bounded media repair separated the primary media rows for five existing
brand pages from their representative model drawings:

- Ensso
- Fountain Pen Revolution
- Schon DSGN
- Kilk
- Tibaldi

Each brand now has its own original factual, non-photo SVG and Phase 499 source
item. The five model rows were read before and after the apply and were not
changed: their canonical local paths, source items, titles, and media identity
remain intact. No entity was created and no model prose or specification was
transferred to a brand page.

## Verification evidence

- First CLI apply on the owned checkpoint: 5/5 targets published through
  `recordEntityContentReview` (fact/language/media) and `publishEntity`; no
  direct publication-status write.
- First-apply content hashes:
  - Ensso `sha256:v3:c74398074ff4503fa9bc7fc8eb1f65049c8b568bcac81b01749c14bdd59752dc`
  - Fountain Pen Revolution `sha256:v3:8930dd63120aa2561b3fa522355c0b0ea842912dc4b27cc686f771ff7ec8d339`
  - Schon DSGN `sha256:v3:7f1563dfccdb056dac117dea29fd2e6f6f217b8fdc6689c3f158f9a036a24edb`
  - Kilk `sha256:v3:19949f7309ef127e0c7fb0fd720d88cae856af5a1f842b27ab8c024c4be34b2e`
  - Tibaldi `sha256:v3:e426e0dd58d295adf98cd1fe0ed56eb86a070a58519f7bce420f20aeb4f37478`
- CLI replay returned `noop` for all five targets with identical hashes.
- Readback: all five brand pages were `published`, blocker-free, contract
  version 3, with reviewed revision equal to content revision. The five model
  pages remained published with their original media/source rows.
- Each targeted duplicate path fell from count 2 to count 1. Other pre-existing
  duplicate groups remain outside this bounded batch and require later work.
- `PRAGMA integrity_check` returned `ok`; `PRAGMA foreign_key_check` returned
  no rows.
- `pnpm exec tsx --test tests/content/phase499-independent-brand-media.test.ts`
  passed: 1/1.
- Biome check and `git diff --check` passed. Full TypeScript reports only the
  three pre-existing baseline errors in
  `phase346-jinhao-x450-x750.test.ts` (TS7022 x2) and
  `sync-local-catalog-to-turso.test.ts` (NODE_ENV TS2741); no Phase 499 error
  remains.
- `data/fpkg.db` stayed byte-for-byte unchanged with SHA-256
  `e8c914b89685b399f24a9debae7f5ee9954020c4f0d7dff80bf8f4cf8f4f2299`.

## Boundary

The checkpoint copy is not the production database. This phase has not
performed the formal local migration, Turso sync, deployment, or online
readback. The overall full-content-repair goal remains active; additional
duplicate media groups and uncovered/underfilled brand-model pages remain.
