---
name: repair-another-high-impact-low-evidence
status: complete
created: 2026-07-27
---

# Repair Parker historic trio evidence coverage

## Scope

Repair the existing Phase 154 Parker 45/61/75 curated pack only. Add source-backed `origin_country` and `dimensions` specification values/evidence, and reflect the boundaries in the three research pages. Do not create entities, change routes, or touch other agents' files.

## Verification

- Run the Phase 154 owned-checkpoint content test.
- Run TypeScript, targeted Biome, and `git diff --check`.
- Review `git status --short`; stage only this plan, the Phase 154 data file, and the three owned research pages.
