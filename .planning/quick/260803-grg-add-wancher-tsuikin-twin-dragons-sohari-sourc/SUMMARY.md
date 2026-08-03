# Phase 391 Summary — Wancher Tsuikin Twin Dragons Black Sohari

## Result

Added and reviewed the missing `Wancher Dream Pen Ryukyu Tsuikin – Twin Dragons Black Sohari` model package. The concrete total-sohari SKU remains separate from Black Urushi, Red Urushi and other Tsuikin designs. No production catalog or remote database was written.

## Owned files

- `.planning/content-research/wancher-tsuikin-twin-dragons-black-sohari-phase391.md`
- `public/images/library/site-original/phase391/wancher/tsuikin-twin-dragons-black-sohari.svg`
- `scripts/data/phase391-wancher-tsuikin-twin-dragons-black-sohari.ts`
- `scripts/apply-phase391-wancher-tsuikin-twin-dragons-black-sohari-content.ts`
- `tests/content/phase391-wancher-tsuikin-twin-dragons-black-sohari.test.ts`
- `PLAN.md`

The persistent checkpoint copy remains untracked under this task directory and is intentionally not part of the commit.

## Content and evidence

- Wancher International product page: concrete `Tsuikin - Twin Dragons - Black Sohari` identity, dated `$1,600.00 USD` listing and `Sold out` state, Ebonite / Tsuikin Urushi, European International cartridge/converter, compact air-tight cap, package, two nib routes and three feed routes.
- Official Ryukyu Tsuikin collection and Japan collection: 2022 Okinawa return-to-Japan 50th anniversary context, Tsuikin process, the three Twin Dragons boundaries and the Japanese `堆錦・双竜・総貼り` naming; the Black Sohari base is recorded as `Nashiji Tsuikin-mochi` without inventing coverage, layer count or production data.
- Product Care Guide: conservative Urushi/Ebonite maintenance limits and the warning that uneven handmade Tsuikin dots are not automatically defects.
- Kyoto National Museum: narrow professional context for dragon visual history only, not proof of this SKU's local origin or exact motif source.
- Original factual SVG is explicitly marked `non-photo`, `non-logo`, `not-to-scale`, and `non-colour-proof`.

## Verification evidence

- Targeted test: `pnpm exec tsx --test tests/content/phase391-wancher-tsuikin-twin-dragons-black-sohari.test.ts` — 1 passed, 0 failed (final formatted run).
- Persistent checkpoint replay: Wancher brand and Black Sohari model returned `published` through the existing fact/language/media/publication review and `publishEntity` path; model body readback 6,305 characters; five variants (two nib, three feed); no fact conflicts; unique `made_by` and reverse navigation.
- Checkpoint totals after replay: 951 entities, 905 public entities, 643 published entities; `PRAGMA integrity_check` returned `ok`.
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint> --limit 5` — 660 inventory entities, 638 active, 22 retired lineage excluded, duplicate groups 0, suspicious pen articles 0, thin brand/model entities 0, made_by blockers 0.
- `pnpm check:library -- --database-path <absolute checkpoint>` — Library contract OK (2,236 sources; 3,946 source items; 3,396 claims; 9,645 citations; 956 media).
- TypeScript: only pre-existing baseline diagnostics remain (`phase346-jinhao-x450-x750.test.ts` TS7022 twice; `sync-local-catalog-to-turso.test.ts` missing `NODE_ENV`). No Phase 391 diagnostics.
- Biome and `git diff --check` passed for owned files.
- Protected real catalog SHA-256 before and after: `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`.
