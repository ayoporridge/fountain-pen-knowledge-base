# Phase 389 Summary — Wancher Tsuikin Twin Dragons Black Urushi

## Result

Added and reviewed the missing `Wancher Dream Pen Ryukyu Tsuikin – Twin Dragons Black Urushi` model package. The concrete SKU remains separate from Red Urushi, Black Sohari and other Tsuikin themes. No production catalog or remote database was written.

## Owned files

- `.planning/content-research/wancher-tsuikin-twin-dragons-black-urushi-phase389.md`
- `public/images/library/site-original/phase389/wancher/tsuikin-twin-dragons-black-urushi.svg`
- `scripts/data/phase389-wancher-tsuikin-twin-dragons-black-urushi.ts`
- `scripts/apply-phase389-wancher-tsuikin-twin-dragons-black-urushi-content.ts`
- `tests/content/phase389-wancher-tsuikin-twin-dragons-black-urushi.test.ts`
- `PLAN.md`

The persistent checkpoint copy and source snapshot remain untracked under this task directory and are intentionally not part of the commit.

## Content and evidence

- Official Wancher product page: identity, current `$1,000.00 USD` listing and `Sold out` state, 2022 Okinawa return-to-Japan 50th anniversary context, Tsuikin process, Ebonite / Urushi / Tsuikin Urushi material, European International C/C, compact air-tight cap, package and Type A / Type B selectors whose public mapping is not explained.
- The same official specification lists `#6 JoWo stainless steel` and Wancher 18K gold nib routes, plastic / ebonite black / ebonite red feed options, and gives no numeric dimensions or weight; these omissions are preserved rather than inferred.
- Official Ryukyu Tsuikin collection: Okinawan/Ryukyu craft context, the Tsuikin-mochi process, Twin Dragons' official description as using real platinum and gold powder, and adjacent Black Urushi / Red Urushi / Black Sohari boundaries.
- Official Dream Pen collection and Product Care Guide: series identity and conservative Urushi/Ebonite maintenance limits, including the warning that occasional uneven dots in handmade Tsuikin are not automatically defects.
- Kyoto National Museum: independent professional context for dragon symbolism; used only for general historical framing, not as evidence of this SKU's local origin or construction.
- Original factual SVG is explicitly marked `non-photo`, `non-logo`, `not-to-scale`, and `non-colour-proof`.

## Verification evidence

- Targeted test: `pnpm exec tsx --test tests/content/phase389-wancher-tsuikin-twin-dragons-black-urushi.test.ts` — 1 passed, 0 failed.
- Persistent checkpoint replay: Wancher brand and Twin Dragons model returned `published` through the existing fact/language/media/publication review and `publishEntity` path; model body readback 6,694 characters; seven variants (two nib, three feed, two market SKU); no fact conflicts; unique `made_by` and reverse navigation.
- Checkpoint totals after replay: 951 entities, 905 public entities, 643 published entities; `PRAGMA integrity_check` returned `ok`.
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint> --limit 5` — 660 inventory entities, 638 active, 22 retired lineage excluded, duplicate groups 0, suspicious pen articles 0, thin brand/model entities 0, made_by blockers 0.
- `pnpm check:library -- --database-path <absolute checkpoint>` — Library contract OK (2,236 sources; 3,946 source items; 3,397 claims; 9,646 citations; 956 media).
- TypeScript: only the pre-existing baseline diagnostics remain (`phase346-jinhao-x450-x750.test.ts` TS7022 twice; `sync-local-catalog-to-turso.test.ts` missing `NODE_ENV`). No Phase 389 diagnostics.
- Biome and `git diff --check` passed for owned files.
- Protected real catalog SHA-256 before and after: `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`.
