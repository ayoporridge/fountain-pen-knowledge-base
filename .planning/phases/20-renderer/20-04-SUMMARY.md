---
phase: 20-renderer
plan: "04"
subsystem: renderer-browser-verification
tags: [playwright, fixture, responsive, publication-boundary, evidence]

requires:
  - phase: 20-renderer
    provides: Plans 20-01 through 20-03 loader, renderer and responsive contracts
provides:
  - Narrow disposable renderer runner and independent browser matrix
  - Passing brand desktop/mobile evidence with exact 15-model relations
  - Reproducible model primary-media cardinality gap and safe recovery steps
affects: [phase-20-verification, PAGE-08, phase-23-image-review]

tech-stack:
  added: []
  patterns:
    - Owned disposable DB is created and seeded before build/server/browser children
    - Browser verification borrows the existing serve-e2e seam without Phase 19 lifecycle changes
    - Synthetic fixture evidence never implies real-inventory or production publication

key-files:
  created:
    - scripts/check-renderer.ts
    - tests/e2e/renderer.spec.ts
    - .planning/phases/20-renderer/20-VERIFICATION-EVIDENCE.md
    - .planning/phases/20-renderer/artifacts/brand-desktop.png
    - .planning/phases/20-renderer/artifacts/brand-mobile.png
    - .planning/phases/20-renderer/20-04-SUMMARY.md
  modified:
    - playwright.config.ts

key-decisions:
  - "Stop after the final authorized renderer run exposed invalid model primary-media cardinality; do not spend another cycle repairing or rerunning the fixture."
  - "Persist only the two real brand screenshots; never fabricate the missing model screenshots or imply Task 3 approval."

requirements-completed: []
duration: timeboxed
completed: 2026-07-19
status: gaps_found
---

# Phase 20 Plan 04: Renderer Browser Verification Summary

**The narrow disposable runner proved the complete brand page on desktop/mobile, then correctly failed closed when its own fixture path rewrite made the model's primary media ambiguous.**

## Status

`gaps_found`. Task 1 is partially verified, Task 2 was not started, and the blocking Task 3 human checkpoint was not reached. PAGE-08 and Plan 20-04 must remain incomplete.

## Accomplishments

- Added a narrow runner that creates and seeds one owned local database before build, sanitizes database environment variables, borrows the existing `--serve-e2e` seam, uses one Playwright worker, and cleans its owned DB/assets/children in `finally`.
- Added an independent server-HTML/browser matrix for summary, story, sources, hero attribution, same-AST navigation, PAGE-06 sentinels, exact canonical relations, overflow, focus, touch targets and reduced motion.
- Passed brand desktop and mobile with `全部型号（15）` and exactly 15 unique canonical `/pen/` links.
- Persisted two non-empty, real browser screenshots. No model screenshot was created or substituted.
- Preserved the fixture/real-inventory boundary: no Phase 19 wrapper, broad E2E, real catalog, Turso, remote, production or deployment work ran.

## Task Results

| Task | Result | Evidence |
|---|---|---|
| Task 1: renderer desktop/mobile | PARTIAL / GAP | Brand 2/2 pass; model 2/2 fail closed; two of four screenshots |
| Task 2: Phase 20 boundary and scope | NOT RUN | Renderer prerequisite was not green |
| Task 3: human hero mapping approval | NOT REACHED | Model screenshots and complete hash table are absent |

## Commits

- `32e5e2e` — RED browser matrix and mobile project inclusion.
- Final gap closeout commit records the runner, formatted spec, two brand screenshots, evidence and this summary.

## Exact Root Cause

The initial synthetic hero lived at `/renderer/{slug}.jpg`; the existing middleware treats that two-segment path as an invalid namespace and returned 404. The runner therefore generated assets under `/images/renderer-fixture/` and rewrote fixture media `local_path` values.

That rewrite was too broad for `renderer-model-01`: it changed all of the model's media rows, including a deliberately negative primary-media fixture. Current-hash rereview and republish then made multiple primary rows eligible. The loader returned `invalid-primary-media-cardinality`, and both model viewports correctly failed closed to 404.

This is a fixture-runner defect, not evidence that the production renderer should choose an arbitrary image. The loader's fail-closed result is correct.

## Recovery Steps

1. Limit the fixture-only path rewrite to the canonical `${entityId}-media-primary` rows.
2. Do not alter gallery, remote, missing-attribution or other negative media fixtures.
3. Rereview and republish the 16 owned fixture entities after the narrow media update.
4. Rerun only renderer desktop/mobile; require all four cases and all four PNGs.
5. If green, run boundary desktop once, then the exact type/Biome checks.
6. Stop at Task 3 for explicit human review of both entity-to-asset-to-rights-to-attribution chains. This approval remains fixture-only; Phase 23 owns all real 305 image review.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Fixture bug] Moved runtime hero assets out of a middleware-blocked two-segment namespace**

- **Found during:** First renderer browser run.
- **Issue:** `/renderer/{slug}.jpg` was intercepted as an invalid two-segment namespace, so images had `naturalWidth=0`.
- **Fix:** Generate owned temporary JPEGs at `/images/renderer-fixture/{slug}.jpg` and clean them in `finally`.
- **Result:** Brand desktop/mobile images loaded and passed.

**2. [Rule 1 - Fixture publication state] Restored current-hash reviews after the runtime path change**

- **Found during:** Readiness retry.
- **Issue:** Updating media paths correctly invalidated the already-published fixture snapshots.
- **Fix:** Used the existing legal fact/language/media review and publication APIs for the brand and 15 models.
- **Result:** The server became readable and the four browser cases ran; the separate cardinality gap then surfaced.

### Unresolved Gap

- The path rewrite also changed a negative model primary-media row. No further repair or rerun was performed after the final authorized attempt.

## Verification

- `pnpm exec tsc --noEmit` — PASS before the final renderer run.
- `next build` inside the final runner — PASS, compiled in 7.0s.
- Borrowed loopback server — PASS, ready in 269ms.
- Playwright renderer matrix — 2 passed, 2 failed in 9.2s.
- Boundary runner — NOT RUN.
- Full changed-file Biome command — NOT RUN after the gap.

## Known Stubs

None in the delivered runner or tests. The missing model PNGs are unresolved required evidence, not placeholders; they were intentionally not fabricated.

## Threat Flags

None. The runner adds only local fixture filesystem/database/process authority already declared by the Plan 20 threat model. Temporary assets, DB and children were cleaned after failure.

## Scope Confirmation

- Fixture evidence does not claim real 305 publication or image approval.
- Phase 19 residual validation debt remains unchanged.
- No production deployment or online verification occurred.
- `public_entities` remains the sole public authorization set.

## Self-Check: GAPS FOUND

- Present: runner, browser spec, brand desktop screenshot, brand mobile screenshot, evidence and summary.
- Missing by design after failure: model desktop screenshot, model mobile screenshot, boundary evidence and human approval.
- Temporary fixture asset directory, disposable database, server and child processes were absent after cleanup.

