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

> Phase 21 uses focused `tsx --test` contracts through Waves 1–4, then one Phase 21-owned full owned-copy gate plus focused desktop/mobile taxonomy E2E in Wave 5. It never SQLite-opens the protected catalog, writes Turso, deploys, runs broad E2E, or expands Phase 19's negative-case/lifecycle framework.

## Execution Boundaries

- Synthetic work requires `TAXONOMY_FIXTURE=1` and a fixture-owned local database.
- The real 305 source is handled only by `copyCheckpointedCatalogToDisposableCopy`; main/WAL/SHM are fingerprinted before/after and are never SQLite-opened in place.
- All migration/application/audit/server work runs on the returned caller-owned copy. Production/remote application is a later phase.
- Every affected/new entity remains `draft|in_review`; donors/generic sources are `retired`. Old reviews/hashes are neither moved nor used to republish.
- `20-04-SUMMARY.md` remains `gaps_found`. Its synthetic model-media rewrite defect is non-blocking for Phase 21, but the missing model screenshots, boundary run and human hero approval remain a production-release blocker that Phase 21 evidence must preserve.

## Test Infrastructure

| Wave | Harness | Scope |
|---:|---|---|
| 1 | `tests/taxonomy/taxonomy-substrate.test.ts` | migration 032, schema readiness, canonical hash/invalidation/review revocation |
| 2 | `tests/taxonomy/taxonomy-ledger.test.ts` | guarded fixture, exact 109 manifest, checksum and set-based net reconciliation |
| 3 | `tests/taxonomy/taxonomy-canonical.test.ts` | alias/rename/merge/retire, demote-first transaction and owned-copy CLI |
| 4 | `tests/taxonomy/taxonomy-structural.test.ts` | split/variant/full reference-media-relation topology and rollback |
| 5 data | `tests/taxonomy/taxonomy-contract.test.ts` + `scripts/check-taxonomy-contract.ts --source=... --owned-copy` | full-set artifacts and protected-source invariant |
| 5 UI | the same contract test + focused `tests/e2e/taxonomy.spec.ts` | redirect, server identity/metadata/hierarchy and desktop/mobile behavior |

## Sampling Policy

- No sampling is permitted for the 109-row manifest, action ledger, before/after ID sets, redirect ledger or entity-reference closure.
- Each task runs only its named focused test file/pattern while iterating.
- The owned-copy audit computes canonical artifacts and verdict from the complete result before any `--limit` display slicing.
- Playwright runs only the taxonomy spec, desktop then mobile, with one worker. `pnpm test:e2e`, Phase 19 wrapper and Phase 20 renderer runner are prohibited.

## 11/11 Task Verification Map

| Task ID | Plan | Wave | Requirements | Threats | Automated Gate | Exists | Status |
|---|---:|---:|---|---|---|---|---|
| 21-01-01 | 01 | 1 | TAX-06, EXP-05 | T-21-01 | `tsx --test` substrate/migration replay/immutability selectors | ❌ W0 | pending |
| 21-01-02 | 01 | 1 | TAX-06, EXP-05 | T-21-02/03 | taxonomy hash/review-revocation selectors + typecheck | ❌ W0 | pending |
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
| Waterman/Opus 88/Leonardo | explicit per-child split assignments | one-hop declared redirect/fallback only after target(s) public |
| Aurora | generic source retired; 88/Optima draft | generic route to public brand only when eligible; never random child |
| SKB/Penton/SIKIB and JunLai/Wing Sung | unresolved draft/open conflict; no wrong maker | absent from every public surface and direct routes 404 |

## Reference and Rights Coverage

Tests seed unique sentinels for attributes/tags/concepts/aliases/external IDs, stories/specs/variants, claim subject/object, citations, scopes/evidence/conflicts, references/timeline/community, media/diagrams, JSON hotspots/exhibit slugs and forward/reverse links. For each split/merge, allowed items must appear exactly once at the declared target; ambiguous or forbidden items must appear zero times. Media requires entity-exact ownership, qualified primary use, license and attribution; Phase 21 does not visually approve the real 305 assets.

## EXP-01 Determinism Gates

- Exactly 109 unique source row keys from the seven geographic tables.
- Priority totals `13/54/40/2`; status totals `1/42/1/1/55/5/4` in the reviewed status order.
- One six-class primary action per row; six counts sum to 109.
- Atomic actions, applied/deferred/gated states, variants and out-of-matrix actions are separately counted.
- Before/after brand, pen and total canonical sets are serialized and independently satisfy `net = |after| - |before|`.
- NDJSON/CSV/summary bytes, hashes, verdict and exit status are identical with/without `--limit`.

## Phase Completion Gates

- All 11 task rows have current passing evidence.
- Migration 032 and publication hash/invalidation contracts pass; no old review can authorize changed taxonomy.
- Full 109 manifest and the official addendum reconcile with deterministic artifacts.
- Full dependency, semantic-orphan, reverse-link and one-maker checks are green.
- Protected source fingerprints are identical and no remote/production operation occurred.
- Focused redirect/server HTML/desktop/mobile checks are green.
- `21-VERIFICATION-EVIDENCE.md` records the open Phase 20-04 debt as non-blocking for Phase 21 and blocking for final production release.
