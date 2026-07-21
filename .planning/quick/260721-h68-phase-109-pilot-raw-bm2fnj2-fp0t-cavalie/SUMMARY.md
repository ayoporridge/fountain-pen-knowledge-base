---
phase: quick
plan: 260721-h68
subsystem: content-publication
tags: [pilot, cavalier, prera, kakuno, cocoon, sqlite, publication-v3]
requires:
  - phase84 Pilot brand publication fixture
  - migration 032 taxonomy identity contract
provides:
  - four in-place Pilot raw identity publications
  - four permanent legacy redirects
  - four source-qualified 2k+ Chinese model articles
  - four site-original factual SVGs
affects: [Pilot brand reverse navigation, Phase 23 content inventory]
tech-stack:
  added: []
  patterns:
    - caller-owned checkpoint publication
    - current official versus historical sample scopes
    - exact immutable made_by preflight
key-files:
  created:
    - scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon.ts
    - scripts/apply-phase109-pilot-cavalier-prera-kakuno-cocoon-content.ts
    - tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts
    - public/images/library/site-original/phase109/pilot/pilot-cavalier.svg
    - public/images/library/site-original/phase109/pilot/pilot-prera.svg
    - public/images/library/site-original/phase109/pilot/pilot-kakuno.svg
    - public/images/library/site-original/phase109/pilot/pilot-cocoon.svg
  modified: []
key-decisions:
  - "Current filling and dimensions come only from Pilot live catalog/support; old CON-20/CON-50 observations remain dated sample evidence."
  - "Prera Iro-ai, Kakuno smiley nib, and Metropolitan/MR remain scoped sibling/feature/region boundaries rather than new entities."
  - "Phase 109 materializes embedded reviewed copy only inside the caller-owned root before loadCuratedEntityPack, so no extra repository content files or protected-catalog writes are required."
metrics:
  duration: 22 min
  tasks: 3
  files: 7
  completed: 2026-07-21
status: complete
---

# Quick 260721-h68: Pilot Cavalier / Prera / Kakuno / Cocoon Summary

Four existing Pilot raw entities now publish in place with live-current Pilot specifications, dated independent sample evidence, immutable maker topology, permanent legacy redirects, and four distinct factual SVGs.

## What Was Built

- Reused `BM2fNJ2-fP0T`, `UrbBB-onjGnF`, `U6w1BK0N4u0f`, and `1dtEi80xLCZ1`; canonical slugs are `pilot-cavalier`, `pilot-prera`, `pilot-kakuno`, and `pilot-cocoon`.
- Added a four-pack data module with four natural Chinese bodies over 2,000 Unicode characters, field-level evidence, aliases, current/sample/variant/region scopes, claims, variants, timelines, and unique approved primary media.
- Added a phase-local apply entry that refuses remote selectors, protected/aliased/outside-root databases, client/path mismatch, empty reviewers, unmigrated copies, identity/route collisions, and inexact Pilot or maker prerequisites before Phase 109 writes.
- Added current-hash fact/language/media reviews followed by `publishEntity`; the second run returns four exact noops.
- Added four 1600×900 site-original SVGs with non-photo, non-scale, non-colour-proof disclosures and model-specific diagrams.

## Live Source Verification

Reopened on 2026-07-21; all pages were HTTP-readable. No official identity or current-spec conflict was found.

| Model | Current official source | Independent source boundary |
|---|---|---|
| Cavalier | [Pilot FCAN-5SR catalog](https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000127&volumeName=00004): F, brass, CON-40, 9.8×134.4 mm, 16.5 g | [The Pen Addict, 2011](https://www.penaddict.com/blog/2011/10/14/pilot-cavalier-fountain-pen-review.html): Brian Gushikawa explicitly identifies a repaired used sample; CON-20 and writing observations remain historical |
| Prera | [Pilot P-FPR-1 catalog](https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100004704&volumeName=00004) and [2025-03-07 four-colour release](https://www.pilot.co.jp/press_release/2025/03/07/post_140.html): F/M, resin, supplied CON-40, 13.4×120.4 mm, 15.4 g | Pen Addict 2011/2026, Parka Blogs 2015, and Gentleman Stationer 2025 stay author/date/sample scoped; [Iro-ai](https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100004795&volumeName=00004) remains a transparent sibling |
| Kakuno | [Pilot FKA-1SR catalog](https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000328&volumeName=00004) and [English manual](https://www.pilot.co.jp/support/manual/fountain/kakuno_en.pdf): EF/F/M, resin, CON-40/CON-70N, 16×131 mm, 11 g, smile-up orientation | A Better Desk 2015 and Pen Addict 2022 are specific samples; the smile is a nib orientation feature, not an entity |
| Cocoon | [Pilot Japan FCO-3SR catalog](https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000162&volumeName=00004): F/M, brass, CON-40, 13.2×138 mm, 24 g | [Well-Appointed Desk, 2013](https://www.wellappointeddesk.com/2013/06/review-pilot-cocoon-fountain-pen/): gifted sample, historical CON-50/price; Metropolitan/MR is region-scoped and European standard-international filling is excluded from Japanese current specs |

## Verification

- `node --import tsx --test tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts` — PASS, including protected main/WAL/SHM snapshot equality and four replay noops.
- `pnpm exec tsc --noEmit --pretty false` — PASS.
- Focused test `biome check` plus stdin formatter byte-comparison for both scripts — PASS.
- `xmllint --noout` for all four SVGs — PASS.
- `git diff --check`, staged seven-file allowlist comparison, and post-commit path proof — PASS.

## Commit

- `bda12e9` — `feat(content): publish Pilot Cavalier Prera Kakuno and Cocoon`
- Commit contains exactly the seven owned product files. PLAN and SUMMARY are not in the product commit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Qualified independent source groups through core sample-boundary claims**

- **Found during:** Task 3 integration test
- **Issue:** Professional-secondary citations attached only to an editorial claim do not count toward migration-032 publication readiness.
- **Fix:** Classified the verifiable author/date/sample disclosure boundary as a core claim while keeping subjective observations sample-scoped.
- **Files modified:** `scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon.ts`
- **Commit:** `bda12e9`

**2. [Rule 3 - Blocking issue] Embedded reviewed copy inside caller-owned execution root**

- **Found during:** Task 2 implementation
- **Issue:** The exact seven-file ownership contract allowed no separate checked-in Markdown files, while `loadCuratedEntityPack` requires Markdown input.
- **Fix:** Embedded the four reviewed copies in the data module and materialized them under the caller-owned temporary root before loading; repository and protected catalog remain untouched.
- **Files modified:** data/apply/test files
- **Commit:** `bda12e9`

## Known Stubs

None.

## Threat Flags

None. The phase adds no network endpoint, auth path, schema, or protected-file access beyond the plan threat model.

## Scope Boundary

Phase 109 is only the local delivery of Cavalier, Prera, Kakuno, and Cocoon. It does not complete the Pilot brand, Phase 23 content inventory, or the project-wide content goal.

## Self-Check: PASSED

- All seven owned product files exist.
- Product commit `bda12e9` exists and contains exactly those seven files.
- Quick PLAN and SUMMARY remain outside the product commit.
