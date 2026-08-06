---
name: add-sourced-wancher-oita-urushi-kurozan-aizu-tamamushi-bokashi
status: complete
created: 2026-08-05
---

# Add Wancher Japanese lacquer siblings

## Scope

Add four missing Wancher Dream Pen records: Oita Urushi Kurozan, Aizu Urushi Tamamushi-nuri Midori, Bokashi-nuri Oboro, and Bokashi-nuri Tsubomi. Preserve exact official IDs/SKUs, material and technique distinctions, and do not merge Aizu, Oita, or Bokashi identities.

## Tasks

1. Write four natural Chinese research files with official JSON/page facts, dimensions where published, craft history, care and selection guidance.
2. Add original factual SVG media and four `CuratedEntityPack` records with exact source/variant/spec evidence and independent museum/traditional-craft context.
3. Add an owned-checkpoint apply path using the review and publish gates, remote selection refusal, and protected catalog snapshot checks.
4. Add focused publication/replay/topology/media/source tests; run tests, TypeScript baseline, Biome and staged diff checks.
5. Commit only the owned files and quick artifacts; keep all existing research and `.next-phase*` material untouched.

## Acceptance

- Four packs publish on a disposable checkpoint copy and replay as noop.
- The real `data/fpkg.db`, Turso and production remain unchanged.
