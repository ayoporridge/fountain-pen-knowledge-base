# Phase 368–425 owned checkpoint integration summary

## Result

The caller-owned copy is:

`.planning/quick/260803-w1p-integrate-385-424-owned-checkpoint/checkpoint/fpkg.db`

It was copied from real catalog SHA-256 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`. The real catalog was not written; no Turso URL or auth token was selected.

The 57 model/content phase JSON files and the Phase 425 brand JSON (58 JSON results total) produced 114 published entity outputs for 82 unique entities. The checkpoint readback is:

- `PRAGMA integrity_check`: `ok`
- `entities`: 981
- `public_entities`: 935
- `published entity_publications`: 673
- public brands: 115
- public pens: 553
- all 114 outputs: `published`
- all five Phase 425 brand pages: `published`

## Quality and library checks

`scripts/audit-entity-quality.ts --database-path <checkpoint>` passed:

- inventory audited: 690
- active entities: 668
- retired lineage excluded: 22
- duplicate name groups: 0
- suspicious pen articles: 0
- thin brand/model entities: 0
- made_by relationship blockers: 0

`scripts/check-library-contract.ts --database-path <checkpoint>` passed with:

- sources 2,720; source items 4,463; claims 4,087; citations 11,083
- stories 718; timeline events 879; media 986; aliases 2,406
- exhibits 6; external IDs 61; diagrams 9

For Pilot, Pelikan, Sailor, Waterman and Wancher, the published body lengths are 2,917 / 2,833 / 3,002 / 3,002 / 3,027 Unicode characters. Each has one approved primary media asset and at least five approved references (Pelikan has four). Their published `made_by` model counts and brand reverse-navigation counts are 39/39, 25/25, 47/47, 16/16 and 39/39; the global missing-reverse query returns `0`.

## Phase 425 regression

`pnpm exec tsx --test tests/content/phase425-brand-depth-refresh.test.ts` passed. It verifies the five long Chinese brand copies, four approved review kinds, publication guard, owned-copy authority, reverse navigation and noop replay while checking the real catalog snapshot remains unchanged.

## Boundary

This is a disposable integration checkpoint, not a claim that the real SQLite file, Turso, production deployment or online pages have been updated. More uncovered/thin brands and models remain before the final migration and whole-goal acceptance.
