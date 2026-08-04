# Phase 474 Summary — deepen existing Pilot Silvern, Justus 95 and Grance

## Delivered

- Reused the existing Phase 110 canonical entities; no duplicate models were created.
- Added current Pilot catalog/support evidence and expanded Chinese bodies:
  - `pilot-justus-95`: 3,348 characters
  - `pilot-silvern`: 3,072 characters
  - `pilot-grance`: 3,140 characters
- Preserved aliases, Pilot maker identity, existing primary original media and historical sample scopes.
- Added current scopes/claims for Justus FJ-3MR/FJ-3MRR H/S, Silvern FK-5MS KO/TU/ID, and Grance FGRC-12SR colour/nib boundaries.

## Owned checkpoint

- `.planning/quick/260804-eth-phase-474-deepen-existing-pilot-silvern-/checkpoint.db`
- Base: Phase 473 owned checkpoint
- First apply published all three; replay returned noop for all three.
- Content hashes:
  - Justus 95 `sha256:v3:15cd54a9a96b8c2daa2e2a21fa136bb649d9429f032d469a4454be04031dc2f0`
  - Silvern `sha256:v3:a3c40b3a0f8cc876669981a1533fcf899369b754f748a8fdc2af709408336453`
  - Grance `sha256:v3:2625708eac1d120db75c8d37b963837a410c16b06b9aaf1951993eebc389aac2`

## Verification evidence

- Targeted test passed: `tests/content/phase474-pilot-silvern-justus-grance-depth.test.ts`
- `PRAGMA integrity_check`: `ok`; `PRAGMA foreign_key_check`: no rows.
- Library contract: OK; counts `sources=2751`, `sourceItems=4495`, `claims=4554`, `citations=11597`, `stories=718`, `events=975`, `media=986`, `aliases=2405`.
- Quality audit: `entities=690`, `activeEntities=668`, `content_ready=668`, `published=668`, `public_entities=668`, `published_blockers=0`, `public_blockers=0`, `duplicateGroups=0`, `suspiciousPenArticles=0`, `thinEntities=0`, `brokenLinks=0`, `backlog=22`.
- Biome and `git diff --check` passed.
- Full `pnpm exec tsc --noEmit` still reports only the three known baseline errors in `phase346-jinhao-x450-x750.test.ts` (TS7022 x2) and `sync-local-catalog-to-turso.test.ts` (TS2741); no Phase 474 error.
- Real `data/fpkg.db` snapshot remained unchanged.
