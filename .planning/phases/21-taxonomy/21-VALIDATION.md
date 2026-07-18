---
phase: 21
slug: taxonomy
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-19
revised: 2026-07-19
---

# Phase 21 — Validation Strategy

> Phase 21 uses focused `tsx --test` contracts through Waves 1–4, then one Phase 21-owned full owned-copy gate plus one focused desktop/mobile taxonomy E2E attempt in Wave 5. The approved `21-UI-SPEC.md` and locked `21-SPLIT-IDENTITY-LOCK.md` are acceptance inputs. It never SQLite-opens the protected catalog, writes Turso, deploys, runs broad E2E, or expands Phase 19's negative-case/lifecycle framework.

## Execution Boundaries

- Synthetic work requires `TAXONOMY_FIXTURE=1` and a fixture-owned local database.
- The real 305 source is handled only by `copyCheckpointedCatalogToDisposableCopy`; main/WAL/SHM are fingerprinted before/after and are never SQLite-opened in place.
- All migration/application/audit/server work runs on the returned caller-owned copy. Production/remote application is a later phase.
- Migration 032 is a one-time atomic publication contract upgrade to `sha256:v3`: existing affected v2 brand/pen snapshots are revision-incremented, old approvals revoked and public authorization removed even if no later taxonomy mutation occurs. `public_entities` accepts v3 only.
- Every affected/new entity remains `draft|in_review`; donors/generic sources are `retired`. Old reviews/hashes are neither moved nor used to republish.
- The four split/generic cases in `21-SPLIT-IDENTITY-LOCK.md` cannot be gated/deferred or reinterpreted; exact IDs/slugs/actions/routes and payload single-assignment are full-set assertions.
- `20-04-SUMMARY.md` remains `gaps_found`. Its synthetic model-media rewrite defect is non-blocking for Phase 21, but the missing model screenshots, boundary run and human hero approval remain a production-release blocker that Phase 21 evidence must preserve.

## Test Infrastructure

| Wave | Harness | Scope |
|---:|---|---|
| 1 | `tests/taxonomy/taxonomy-substrate.test.ts` | migration 032, v2→v3 forced deauthorization without later mutation, schema readiness, canonical hash/invalidation/review revocation |
| 2 | `tests/taxonomy/taxonomy-ledger.test.ts` | guarded fixture, exact 109 manifest, locked split identities/payload assignment, checksum and set-based net reconciliation |
| 3 | `tests/taxonomy/taxonomy-canonical.test.ts` | alias/rename/merge/retire, demote-first transaction and owned-copy CLI |
| 4 | `tests/taxonomy/taxonomy-structural.test.ts` | split/variant/full reference-media-relation topology and rollback |
| 5 data | `tests/taxonomy/taxonomy-contract.test.ts` + `scripts/check-taxonomy-contract.ts --source=... --owned-copy` | full-set artifacts and protected-source invariant |
| 5 UI | the same contract test + focused `tests/e2e/taxonomy.spec.ts` | exact locked redirects/404s, approved server identity/metadata/hierarchy, temporary build seam and desktop/mobile behavior |

## Sampling Policy

- No sampling is permitted for the 109-row manifest, action ledger, before/after ID sets, redirect ledger or entity-reference closure.
- Each task runs only its named focused test file/pattern while iterating.
- The owned-copy audit computes canonical artifacts and verdict from the complete result before any `--limit` display slicing.
- Playwright runs only the taxonomy spec, desktop then mobile, with one worker. `pnpm test:e2e`, Phase 19 wrapper and Phase 20 renderer runner are prohibited.
- Wave 5 permits at most one protected-source checkpoint-copy/audit run (8-minute stop bound) and one browser attempt (one build/server/worker, both viewports, 10-minute stop bound). Failure is recorded after owned cleanup; it is not retried or expanded into generalized negative-case automation.

## 11/11 Task Verification Map

| Task ID | Plan | Wave | Requirements | Threats | Automated Gate | Exists | Status |
|---|---:|---:|---|---|---|---|---|
| 21-01-01 | 01 | 1 | TAX-03/05/06, EXP-05 | T-21-01 | `tsx --test` substrate/migration replay/v2 forced-deauthorization/immutability selectors | ❌ W0 | pending |
| 21-01-02 | 01 | 1 | TAX-03/05/06, EXP-05 | T-21-02/03 | v3 taxonomy hash/review-revocation selectors + typecheck | ❌ W0 | pending |
| 21-02-01 | 02 | 2 | TAX-01..06 | T-21-07 | fixture-safety selector | ❌ W0 | pending |
| 21-02-02 | 02 | 2 | TAX-01..05, EXP-01/05 | T-21-05/06/08 | 109-row/net/checksum selectors + typecheck | ❌ W0 | pending |
| 21-03-01 | 03 | 3 | TAX-01/04/05/06 | T-21-09/10/11 | canonical action/rollback selectors | ❌ W0 | pending |
| 21-03-02 | 03 | 3 | TAX-06 | T-21-12 | CLI dry-run/owned-copy selectors + typecheck | ❌ W0 | pending |
| 21-04-01 | 04 | 4 | TAX-02/03/04, EXP-05 | T-21-13 | mixed split/variant/ambiguous assignment selectors | ❌ W0 | pending |
| 21-04-02 | 04 | 4 | TAX-05/06 | T-21-14/15/16 | dependency/polymorphic/JSON/media/made_by selectors | ❌ W0 | pending |
| 21-05-01 | 05 | 5 | TAX-01..06, EXP-01/05 | T-21-17/20 | full contract test + protected-source owned-copy command | ❌ W0 | pending |
| 21-05-02 | 05 | 5 | TAX-01..06, EXP-05 | T-21-18/19/21 | redirect/identity DTO contract + generation check + typecheck | ❌ W0 | pending |
| 21-05-03 | 05 | 5 | TAX-01..06, EXP-01/05 | T-21-18..21 | focused taxonomy desktop/mobile runner + exact-file Biome | ❌ W0 | pending |

Status semantics: `❌ W0` means the owning plan task creates the test/artifact before production behavior; it is not an executed result.

## Required Identity Cases

| Case | Data assertion | Public assertion |
|---|---|---|
| MR/Metropolitan/Cocoon/88G | one canonical model; market aliases; `贵妃` excluded | one H1/model count; alias route only when target public |
| Elabo/Falcon | one model; resin/metal/nib variants | one brand link/model link and region-name row |
| Moonman/Majohn A1 | one brand/model; historical alias; clip/color/nib variants | no duplicate brand/model page; A1 stays 404 until content gate later |
| Asvine P36 | one stable model; exact slug decision or blocker | no guessed route; old wrong brand loses membership |
| PGS/SHIKIORI | family/model/edition/color hierarchy | one brand model; editions/colors only in Version Differences |
| Waterman | retain `gwKClNnwt3V3` as `waterman-hemisphere`; create `4dcEbeUCjxH-` Charleston; every donor payload ID assigned once | old mixed path one hop to Hémisphère only after it is public; otherwise all involved routes 404/draft |
| Opus 88 | retire `dTCUDu03vrI6`; create `CqFpmT3l4Mtm` Demo + `0CNmbxM54-GA` Koloro; no donor wholesale copy | old `opus-88-demo-kolora` always 404; no child/brand redirect and no visible `Kolora` alias |
| Leonardo | retire `s0HAxT1gsHxh`; create `ixul2gTcJ06B` Furore + `UE5otlwKUfp9` Momento Magico; no donor wholesale copy | old mixed route always 404; no child/brand redirect |
| Aurora | retire `G9ptvLpfyzNQ`; create `5CcEDOz9jiUg` 88 + `5waoVLPHU2Pt` Optima; generic payload never inherited | old pen route to public `/brand/aurora` only; otherwise 404 and never a model redirect |
| SKB/Penton/SIKIB and JunLai/Wing Sung | unresolved draft/open conflict; no wrong maker | absent from every public surface and direct routes 404 |

## Reference and Rights Coverage

Tests seed unique sentinels for attributes/tags/concepts/aliases/external IDs, stories/specs/variants, claim subject/object, citations, scopes/evidence/conflicts, references/timeline/community, media/diagrams, JSON hotspots/exhibit slugs and forward/reverse links. For each split/merge, allowed items must appear exactly once at the declared target; ambiguous or forbidden items must appear zero times. Media requires entity-exact ownership, qualified primary use, license and attribution; Phase 21 does not visually approve the real 305 assets.

## EXP-01 Determinism Gates

- Exactly 109 unique source row keys from the seven geographic tables.
- Priority totals `13/54/40/2`; status totals `1/42/1/1/55/5/4` in the reviewed status order.
- One six-class primary action per row; six counts sum to 109.
- Atomic actions, applied/deferred/gated states, variants and out-of-matrix actions are separately counted.
- The four lock-governed source cases are `apply` only; all eight exact output IDs/slugs and four old-route policies match the lock, and every old payload ID has exactly one supported output/retired-source/pending-conflict disposition.
- Before/after brand, pen and total canonical sets are serialized and independently satisfy `net = |after| - |before|`.
- NDJSON/CSV/summary bytes, hashes, verdict and exit status are identical with/without `--limit`.

## Phase Completion Gates

- All 11 task rows have current passing evidence.
- Migration 032 forces every affected pre-existing v2 brand/pen snapshot out of the public set without requiring a later mutation; v2 can never authorize the v3 gate and only fresh complete v3 reviews can republish.
- Full 109 manifest and the official addendum reconcile with deterministic artifacts.
- Full dependency, semantic-orphan, reverse-link and one-maker checks are green.
- Protected source fingerprints are identical and no remote/production operation occurred.
- Focused redirect/server HTML/desktop/mobile checks are green.
- Fixture redirect JSON and `distDir` live only in owned temporary paths; after `finally`, the sentinel/residue is absent, the checked-in redirect artifact hash is unchanged and its scoped git diff is clean.
- `21-VERIFICATION-EVIDENCE.md` records the open Phase 20-04 debt as non-blocking for Phase 21 and blocking for final production release.
