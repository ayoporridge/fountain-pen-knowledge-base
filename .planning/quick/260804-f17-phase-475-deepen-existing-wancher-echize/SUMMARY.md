# Phase 475 Summary — deepen existing Wancher Temari, Sakura Zukiyo and Kyoto Ume

## Delivered

- Reused the Phase 138 canonical entities; no duplicate Wancher models were created.
- Added current Wancher product-page evidence and expanded natural Chinese bodies:
  - `wancher-dream-pen-echizen-urushi-temari`: checkpoint body 2,866 characters; research copy body 2,868
  - `wancher-dream-pen-echizen-urushi-sakura-zukiyo`: checkpoint body 3,000 characters; research copy body 3,002
  - `wancher-dream-pen-kyoto-urushi-kasane-no-iro-ume`: checkpoint body 3,394 characters; research copy body 3,396
- Preserved Phase 138 aliases, market variants, original primary media, Wancher maker identity, reverse navigation and regional context scopes.
- Added exact-SKU boundaries for ABS versus ebonite, Echizen versus Kyoto Urushi, Kindai Maki-e screen-print wording, C/C filling, nib/feed choices, Kyoto ebonite-feed JoWo compatibility, cap/clip/packaging and sibling navigation.

## Owned checkpoint

- `.planning/quick/260804-f17-phase-475-deepen-existing-wancher-echize/checkpoint.db`
- Base: Phase 474 owned checkpoint
- First apply published all three; replay returned noop for all three.
- Content hashes after the date-consistent re-apply:
  - Temari `sha256:v3:8720abaaf3bdd6d5c8d290b5dacd26bf0f445f84fab8737038e0cfd497996dab`
  - Sakura Zukiyo `sha256:v3:7c02c12abae3c7ca35381a2b536b2c7cc673a122c7dd2c8cfa67854de89ec19f`
  - Kyoto Ume `sha256:v3:8eb14d6164eadae4ed4a7ba13943436ad0db883e329a73fe4da4e70d7ff302c1`

## Verification evidence

- Targeted test passed: `tests/content/phase475-wancher-echizen-temari-sakura-kyoto-depth.test.ts`
- `PRAGMA integrity_check`: `ok`; `PRAGMA foreign_key_check`: no rows.
- Library contract: OK; counts `sources=2752`, `sourceItems=4498`, `claims=4566`, `citations=11630`, `stories=718`, `events=978`, `media=986`, `aliases=2405`.
- Quality audit: `entities=690`, `activeEntities=668`, `content_ready=668`, `published=668`, `public_entities=668`, `published_blockers=0`, `public_blockers=0`, `duplicateGroups=0`, `suspiciousPenArticles=0`, `thinEntities=0`, `brokenLinks=0`, `backlog=22`.
- Biome checks and `git diff --check` passed for owned executable/test files.
- Full `pnpm exec tsc --noEmit` still reports only the three known baseline errors in `phase346-jinhao-x450-x750.test.ts` (TS7022 x2) and `sync-local-catalog-to-turso.test.ts` (TS2741); no Phase 475 error.
- Real `data/fpkg.db` snapshot remained unchanged throughout test and checkpoint apply.
