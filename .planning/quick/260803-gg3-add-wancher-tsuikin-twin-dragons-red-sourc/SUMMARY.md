# Phase 390 Summary — Wancher Tsuikin Twin Dragons Red Urushi

## Result

Added and reviewed the missing `Wancher Dream Pen Ryukyu Tsuikin – Twin Dragons Red Urushi` model package. The concrete SKU remains separate from Black Urushi, Black Sohari and the other Ryukyu Tsuikin designs. No production catalog or remote database was written.

## Owned files

- `.planning/content-research/wancher-tsuikin-twin-dragons-red-urushi-phase390.md`
- `public/images/library/site-original/phase390/wancher/tsuikin-twin-dragons-red-urushi.svg`
- `scripts/data/phase390-wancher-tsuikin-twin-dragons-red-urushi.ts`
- `scripts/apply-phase390-wancher-tsuikin-twin-dragons-red-urushi-content.ts`
- `tests/content/phase390-wancher-tsuikin-twin-dragons-red-urushi.test.ts`
- `PLAN.md`

The persistent checkpoint copy remains untracked under this task directory and is intentionally not part of the commit.

## Content and evidence

- Wancher International product page: concrete Red Urushi identity, current `$1,000.00 USD` listing and page state observed as purchasable on 2026-08-03, Ebonite / Red Urushi / Tsuikin Urushi, European International cartridge/converter, compact air-tight cap, package, two nib routes and three feed routes.
- Official Ryukyu Tsuikin collection and Japan collection: Okinawa return-to-Japan 50th anniversary context, Ryukyu lacquer/Tsuikin process, `堆錦・双竜・朱` naming, JPY listing and the separate Black Urushi / Black Sohari / So-hari boundaries. The Red page does not publish the Black page's Type A/B mapping, so those market variants were not copied.
- Product Care Guide: conservative Urushi/Ebonite maintenance limits, including avoiding prolonged soaking, direct sun, chemical cleaners and treating uneven handmade Tsuikin dots as automatic defects.
- Kyoto National Museum: narrow professional background for dragon visual history only; it is not used as proof of this SKU's local origin or exact motif source.
- Original factual SVG is explicitly marked `non-photo`, `non-logo`, `not-to-scale`, and `non-colour-proof`.

## Verification evidence

- Targeted test: `pnpm exec tsx --test tests/content/phase390-wancher-tsuikin-twin-dragons-red-urushi.test.ts` — 1 passed, 0 failed (final formatted run).
- Persistent checkpoint replay: Wancher brand and Red Urushi model returned `published` through the existing fact/language/media/publication review and `publishEntity` path; model body readback 7,018 characters; five variants (two nib, three feed); no fact conflicts; unique `made_by` and reverse navigation.
- Checkpoint totals after replay: 951 entities, 905 public entities, 643 published entities; `PRAGMA integrity_check` returned `ok`.
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint> --limit 5` — 660 inventory entities, 638 active, 22 retired lineage excluded, duplicate groups 0, suspicious pen articles 0, thin brand/model entities 0, made_by blockers 0.
- `pnpm check:library -- --database-path <absolute checkpoint>` — Library contract OK (2,236 sources; 3,946 source items; 3,396 claims; 9,645 citations; 956 media).
- TypeScript: only pre-existing baseline diagnostics remain (`phase346-jinhao-x450-x750.test.ts` TS7022 twice; `sync-local-catalog-to-turso.test.ts` missing `NODE_ENV`). No Phase 390 diagnostics.
- Biome and `git diff --check` passed for owned files.
- Protected real catalog SHA-256 before and after: `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`.
