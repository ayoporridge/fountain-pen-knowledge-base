---
phase: quick
id: 260803-k0c
status: complete
created: 2026-08-03
---

# Refresh Pilot Custom 845 canonical sourced content

## Goal

Refresh the existing canonical Pilot Custom 845 entity (`2_L9OS-kqqQV`) with a source-backed, natural Chinese article and complete current SKU boundaries, without creating a duplicate entity or writing the protected `data/fpkg.db`.

## Tasks

1. Verify current official SKU, support, history, lineup, and reliable secondary sources.
2. Add a fresh Phase 401 `CuratedEntityPack` and reviewed markdown body for the existing 845 entity.
3. Apply and replay the pack only on an owned checkpoint copy through content review and publication gates.
4. Run the targeted test, TypeScript, formatting, and diff checks; stage only owned Phase 401 files and commit.

## Acceptance

- Existing identity and Pilot maker relation are preserved; no new entity is inserted.
- Body contains at least 8,000 Unicode characters and distinguishes 845 from URUSHI, 823, 743, 742, and 912.
- Official facts, 3 edition groups, and 12 current market SKUs are represented with independent source references.
- First apply publishes with fact/language/media/publication reviews; replay is a noop.
- The real catalog snapshot is byte-for-byte unchanged.
