---
name: add-sourced-wancher-dream-pen-products-z
status: complete
created: 2026-08-05
---

# Add sourced Wancher Dream Pen products

## Scope

Add four currently missing Wancher Dream Pen product records without creating duplicate identities: Zogan Momiji Green Tamamushi-nuri, Kyoto Urushi Kasane-iro Asagao, Dream Pen Tsuikin Kanhizakura, and Zogan Swan Urushi Black.

## Tasks

1. Record official product JSON/page facts and independent craft/conservation context in four research files.
2. Add original factual SVG media and four `CuratedEntityPack` records with canonical Wancher maker links, variant boundaries, sources, specs, conflicts, and maintenance guidance.
3. Add an owned-checkpoint apply path that uses `recordEntityContentReview` and `publishEntity`, rejects remote database selection, and preserves the real catalog snapshot.
4. Add focused replay/no-op and publication/topology/media/source tests; run the focused test, TypeScript check, Biome, and staged diff checks.
5. Commit only the owned phase files and quick-task artifacts; leave all existing research/checkpoint files untouched.

## Acceptance

- Four packs publish on a disposable checkpoint copy and replay as no-op.
- Each pack has a natural Chinese article body, exact official product id/handle/SKU facts, source evidence including an independent professional-secondary group, one original factual SVG, correct Wancher maker/reverse links, and no duplicate entity identity.
- The protected `data/fpkg.db` snapshot is unchanged; no Turso or production write is attempted.
