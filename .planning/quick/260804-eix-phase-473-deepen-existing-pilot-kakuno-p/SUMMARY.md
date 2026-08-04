# Phase 473 Summary — deepen existing Pilot Kakuno, Prera and Cocoon

## Delivered

- Reused existing canonical entities; no new model entities were created.
- Added current Pilot Japan catalog/support evidence and expanded natural Chinese bodies:
  - `pilot-kakuno`: 3,306 characters in published body
  - `pilot-prera`: 3,562 characters in published body
  - `pilot-cocoon`: 3,657 characters in published body
- Preserved aliases, maker identity, primary original media and existing historical sample scopes.
- Added dated current scopes/claims/variants for FKA-1SR, P-FPR-1 and FCO-3SR, including Prera Iro-ai and Cocoon MR/Metropolitan boundaries.

## Owned checkpoint

- `.planning/quick/260804-eix-phase-473-deepen-existing-pilot-kakuno-p/checkpoint.db`
- Base: Phase 472 final checkpoint
- First apply published all three; replay returned noop for all three.
- Content hashes:
  - Kakuno `sha256:v3:b13746cb69ecb52ea906f1535221fd0b0c50226a078464638a1e8795073e6ab2`
  - Prera `sha256:v3:9c3836092075df906bc446a3e9e0e777d1f691056c342b28ae0f17efc56b4cbd`
  - Cocoon `sha256:v3:de3c45ebba9552ebdb51c0daacf6ef804e1c405990bb3e0bd0f03e2a7d1d393b`

## Verification evidence

- Targeted test passed: `tests/content/phase473-pilot-kakuno-prera-cocoon-depth.test.ts`
- `PRAGMA integrity_check`: `ok`; `PRAGMA foreign_key_check`: no rows.
- Library contract: OK; counts `sources=2742`, `sourceItems=4486`, `claims=4542`, `citations=11555`, `stories=718`, `events=972`, `media=986`, `aliases=2405`.
- Quality audit: `entities=690`, `activeEntities=668`, `content_ready=668`, `published=668`, `public_entities=668`, `published_blockers=0`, `public_blockers=0`, `duplicateGroups=0`, `suspiciousPenArticles=0`, `thinEntities=0`, `brokenLinks=0`, `backlog=22`.
- Coverage audit: brands `115/119` ready; pens `553/571` ready; remaining gaps are pre-existing unrelated backlog entities.
- Biome and `git diff --check` passed.
- Full `pnpm exec tsc --noEmit` still reports only the three known baseline errors in `phase346-jinhao-x450-x750.test.ts` (TS7022 x2) and `sync-local-catalog-to-turso.test.ts` (TS2741); no Phase 473 error.
- Real `data/fpkg.db` snapshot remained unchanged.
