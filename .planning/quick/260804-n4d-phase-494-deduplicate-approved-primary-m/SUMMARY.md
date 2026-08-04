---
phase: 494
slug: phase-494-deduplicate-approved-primary-m
status: complete
---

# Phase 494 summary

## Outcome

Separated four approved-primary-media collision groups for six existing public
entities, without creating or retiring any entity:

- Esterbrook brand → `esterbrook-estie/esterbrook-brand.svg`;
- Wancher brand → the new `wancher/wancher-brand-family.svg` factual diagram;
- Sheaffer Connaisseur, Imperial and Icon → the existing Phase 309 per-model
  factual SVGs;
- Opus 88 brand → `opus88-leonardo/opus88-brand.svg`.

The model-specific art remains attached to each model. Each scoped target now
has exactly one approved primary media row, a distinct public path, a Phase 494
source item and current fact/language/media reviews. Existing stories, specs,
entities and brand/model relationships were not rewritten.

## Evidence

- Targeted test: `pnpm exec tsx --test tests/content/phase494-media-dedup.test.ts` — 1/1 passed (final run 48.7s).
- Owned checkpoint: `.planning/quick/260804-n4d-phase-494-deduplicate-approved-primary-m/checkpoint/catalog.db`.
- Checkpoint CLI first apply: all six `published`; replay: all six `noop` with identical hashes.
- Checkpoint readback: all six `published`, `blockers_json=[]`, contract version 3,
  reviewed revision equal to content revision, and 18 current approved review
  rows (three per target).
- Duplicate approved-primary groups fell from 35 to 31; the four scoped old
  paths are no longer duplicate groups. The remaining 31 groups are explicit
  follow-up work, not silently treated as fixed.
- `PRAGMA integrity_check` returned `ok`; `PRAGMA foreign_key_check` returned no
  rows.
- Real `data/fpkg.db` SHA-256 stayed
  `e8c914b89685b399f24a9debae7f5ee9954020c4f0d7dff80bf8f4cf8f4f2299`.
- Biome and `git diff --check` passed. Full TypeScript still reports only the
  three pre-existing errors in Phase 346 and the Turso sync test.

## Boundary

This is a bounded media-cleanup batch. It did not migrate the checkpoint to the
real database, sync Turso, deploy production, or complete the remaining 31
duplicate groups and the broader all-brand/model content audit. The overall
Fountain Pen Knowledge Graph goal remains active.
