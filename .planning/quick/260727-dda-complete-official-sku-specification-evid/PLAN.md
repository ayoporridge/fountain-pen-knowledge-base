---
name: complete-official-sku-specification-evid
status: complete
created: 2026-07-27
---

# Complete Pilot Custom 845 official SKU evidence

## Scope

Update the existing Phase 60 Pilot Custom 845 pack only. Add current Pilot
Japan Web Catalog evidence for the FKV-5MR-B-F SKU, including ebonite/lacquer
material, dimensions, weight, converter compatibility, and dated list price.
Keep the 845/URUSHI/823 identity boundaries explicit; do not create entities or
write the real catalog.

## Verification

- Run the Phase 60 owned-checkpoint regression.
- Run Biome, TypeScript, and diff checks.
- Inspect `git status --short` and stage only this plan, the owned 845 research,
  Phase 60 data/test files, and no protected research or `.next-phase*` paths.
