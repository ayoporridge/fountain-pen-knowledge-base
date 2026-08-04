---
name: separate-the-remaining-maiora-approved-primary-media
description: Separate the remaining Maiora approved primary media paths on an owned checkpoint
status: complete
created: 2026-08-04
---

# Plan: Separate the remaining Maiora approved primary media paths

## Scope

- Reuse the existing Maiora brand, Impronte standard, and Impronte Oversize entities and media rows.
- Replace the single shared approved-primary factual SVG path with three entity-specific original SVG paths.
- Keep the existing model identity, brand relations, source claims, and publication guardrails intact.
- Run only against an owned checkpoint copy; the protected `data/fpkg.db`, Turso, and production remain untouched.

## Implementation

1. Add three small factual SVG assets under `public/images/library/site-original/phase503/maiora/`.
2. Add `scripts/apply-phase503-maiora-media-separation.ts` with explicit identity checks, source-item creation, media/reference updates, review recording, and `publishEntity` publication.
3. Add `tests/content/phase503-maiora-media-separation.test.ts` covering owned-copy enforcement, first apply, zero duplicate approved-primary paths, replay idempotency, publication reviews, integrity, and protected-catalog immutability.

## Verification

- Targeted Phase 503 test passes.
- Biome check passes for owned TypeScript files.
- TypeScript check adds no errors beyond the known repository baseline.
- `git diff --check` passes.
- Apply and replay on the Phase 502 checkpoint reduce duplicate approved-primary media groups from one to zero while preserving content and identity audits.

## Boundaries

- Do not modify or stage unrelated research files, `.next-phase*` directories, old quick checkpoints, or any checkpoint database.
- Do not write to `data/fpkg.db`, Turso, or production.
- This repair does not complete the full content-repair goal; it only closes the current checkpoint media-duplication finding.
