---
name: add-missing-retired-pelikan-m800-canonic
description: Add missing retired Pelikan M800 canonical redirect
status: complete
completed: 2026-08-05
---

# Phase 504 summary — retired Pelikan M800 identity disposition

## Outcome

The retired duplicate Pelikan M800 donor (`rKSjyWghpB8Y`, slug
`百利金-pelikan-m800`) now has an explicit taxonomy merge to the published,
researched canonical Souverän M800 (`1UzrQA9Rrmqs`, slug
`pelikan-souveran-m800`). This phase does not publish or reuse the retired
donor's payload.

## Owned-checkpoint evidence

- Checkpoint: `checkpoint/catalog.db` under this quick directory.
- First apply returned `outcome=applied` and installed one `merge` lineage and
  one `permanent` redirect.
- Replay returned `outcome=noop` with the same mapping.
- Readback: `integrity_check=ok`, foreign-key check returned no rows,
  `lineage=1`, `redirect=1`, `retired_public=0`, `canonical_public=1`.
- The protected `data/fpkg.db` snapshot remained unchanged throughout.

## Regression coverage

- `tests/content/phase504-retired-pelikan-m800-identity.test.ts` passed both
  the owned-copy apply/replay test and inherited-remote-selection rejection.
- The test also proves the retired donor remains outside `public_entities`.

## Boundary

The readiness audit still reports the 22 retired/non-public governance rows as
backlog; this phase closes one missing identity route but does not claim those
rows are content-ready. Turso, production deployment, full human traversal,
and online recheck remain open for the global goal.
