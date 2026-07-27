---
name: complete-official-sku-specification-evid
status: complete
created: 2026-07-27
---

# Complete Pilot Custom 742/743 official SKU evidence

## Scope

Update the existing Phase 60 Pilot Custom 742 and 743 packs only. Add current
Pilot Japan Web Catalog SKU evidence for dimensions, weight, resin barrel/cap,
CON-40/CON-70N compatibility, and dated list price. Preserve the existing
identity, sibling boundaries, and source-scoped unknowns for other markets or
colors. Do not create entities or write the real catalog.

## Verification

- Run the Phase 60 owned-checkpoint regression.
- Run Biome, TypeScript, and diff checks.
- Inspect `git status --short` and stage only this plan, the two owned research
  pages, Phase 60 data/apply/test files, and no protected research or
  `.next-phase*` paths.
