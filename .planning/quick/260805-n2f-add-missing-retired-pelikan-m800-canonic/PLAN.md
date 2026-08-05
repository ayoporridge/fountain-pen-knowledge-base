---
name: add-missing-retired-pelikan-m800-canonic
description: Add missing retired Pelikan M800 canonical redirect
status: complete
---

# Plan

1. Confirm the retired Pelikan M800 row, its canonical published M800 target, and the protected local catalog snapshot.
2. On a caller-owned checkpoint only, record a deterministic merge action and lineage, then install `/pen/百利金-pelikan-m800` → `/pen/pelikan-souveran-m800`.
3. Add a focused replay/ownership regression that proves the real catalog is unchanged, the retired donor remains non-public, and the redirect is stable.
4. Run the focused test, TypeScript, diff checks, and inspect Git status; commit only this phase's source, test, and plan/summary files.

## Boundaries

- No write to `data/fpkg.db`.
- No publication of the retired donor.
- No readiness, Playwright, search, LLM, or remote-sync infrastructure changes.
- Preserve all unrelated research files, checkpoint copies, `.next-phase*`, and the protected Montblanc quick directory.
