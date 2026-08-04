---
name: separate-the-remaining-maiora-approved-primary-media
description: Separate the remaining Maiora approved primary media paths on an owned checkpoint
status: complete
completed: 2026-08-04
---

# Phase 503 Summary — Maiora primary-media separation

## Delivered

- Added three site-original factual SVGs for the existing Maiora brand, Impronte standard, and Impronte Oversize records under `public/images/library/site-original/phase503/maiora/`.
- Added `scripts/apply-phase503-maiora-media-separation.ts`, which checks entity identity, source registry, owned-copy authority, public assets, and replacement-path conflicts; writes only distinct source items/media/reference links; and uses `recordEntityContentReview` plus `publishEntity` for publication.
- Added a focused owned-copy test covering remote-environment rejection, first apply, publication reviews, blocker-free public rows, replacement-path uniqueness, replay noop, SQLite integrity/FK checks, and protected-catalog immutability.

## Verification

- `pnpm exec tsx --test tests/content/phase503-maiora-media-separation.test.ts`: 1/1 pass.
- `pnpm exec biome check scripts/apply-phase503-maiora-media-separation.ts tests/content/phase503-maiora-media-separation.test.ts`: pass.
- `pnpm exec tsc --noEmit --pretty false`: only the known repository baseline errors remain (`phase346` TS7022 x2 and `sync-local-catalog-to-turso.test.ts` TS2741); no Phase 503 errors.
- `git diff --check`: pass.
- On the Phase 502 checkpoint, first apply returned `changed:true` and published all three Maiora targets with hashes `sha256:v3:647005105251d626bbb05afd369c527a282fd6a42896768e64f3ac1a4dea561c`, `sha256:v3:be89b43401fbcbf24c8ce9e05040f0020756bff53ce1567dee73fd26dd9e1092`, and `sha256:v3:849af1eb9807722275a3039053eee3ac67fb86b3288f28b1f0cc9f6a0613967f`.
- Replay returned `changed:false` with `noop` for all three targets and the same hashes.
- The non-empty approved-primary media duplicate query returned no rows after the repair; SQLite integrity was `ok` and foreign-key check was empty.

## Boundary

- The protected `data/fpkg.db` SHA-256 remained `e8c914b89685b399f24a9debae7f5ee9954020c4f0d7dff80bf8f4cf8f4f2299`. No Turso or production write occurred.
- This closes one checkpoint media finding only. The overall content-repair goal remains active: the checkpoint still reports 22 retired/backlog records, and formal local migration, Turso/production deployment, human traversal, and online recheck are not yet complete.
