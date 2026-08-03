# Summary: Pilot Custom 743 canonical sourced refresh

## Result

Completed and verified on an owned checkpoint copy. The existing Pilot Custom 743 entity was deepened and published through the normal review gate; no duplicate entity was created and the real catalog was not modified.

## Evidence

- Checkpoint: `.planning/quick/260803-p6o-refresh-pilot-custom-743-canonical-sourc/checkpoint/fpkg.db`
- `PRAGMA integrity_check`: `ok`
- Public entity: `qYCN9Mhl_0UC`, `pilot-custom-743`, `百乐 Pilot Custom 743`
- Public body: 8,099 Unicode characters; source marker `curated-content:phase407-pilot-custom-743-refresh-v1:b2373df0a677b39878e72b0d4b5f4c59f5f8e3ceaa1c6bef119c5369053d157e`
- Publication: `published`, content revision 323, reviewed revision 323, contract version 3; approved content hash `sha256:v3:e7441a7cb5be3ed273fddc7ce86336a68f42b8a6ec3f23ce61964cd5973edd0c`
- Current reviews: fact/language/media/publication all `approved`; readiness `blocker_count=0`, `publishable=1`
- References: 11 references across 11 independence groups
- Variants: 1 `edition_group` + 14 `market_sku`
- Spec: Pilot brand, 14K No.15, Pilot cartridge/CON-40/CON-70N, resin, 149 mm / φ15.7 mm, 25 g, ¥60,500, 14-nib lineup
- Topology: one `made_by` link to Pilot and one Pilot reverse navigation link
- Replay: same apply command returned `noop` with the same content hash
- Real catalog SHA-256 before/after: `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`

## Checks

- Targeted Phase 407 test passed after correcting the pre-existing pen-count expectation to the current catalog count of 540.
- Biome check passed for the owned apply script and test.
- TypeScript still reports only the three pre-existing diagnostics in Phase 346 and Turso migration tests; no Phase 407 diagnostics.
- `git diff --check` passed.
