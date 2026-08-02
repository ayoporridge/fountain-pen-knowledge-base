# Phase 373 Summary

## Status

Phase 373 is verified and ready for its own commit. It is one content batch only and is not the full Fountain Pen Knowledge Graph goal.

## Sources and factual boundary

- Sailor official English and Japanese product pages for `11-0500` and `11-0558` establish names, four complete product codes, F stainless nibs, cartridge/converter filling, dimensions, weight, current Japanese price, materials and plating.
- SHIKIORI official collection pages establish the seasonal design narratives and sibling-series boundary.
- Sailor's 2023–2024 catalogue provides a public time boundary; no exact first-release date is inferred.
- Sailor refill and maintenance pages provide care guidance.
- WRITER Stationery Store and Pen Heaven are used only as professional secondary identity cross-checks for one SKU each.
- Site-original SVGs are factual identity cards, explicitly not product photos, logos, scale drawings or colour proofs.

## Identity and scope

- `11-0500` is one Hisakata model group with four colour SKUs; Uchimizu is recorded as PMMA from 2021-06-24 on the current official page while the other three current colours are AS resin.
- `11-0558` is one Tsukuyono Minamo model group with four colour SKUs; all are recorded as AS resin with Gold IP treatment.
- Both model groups link to the existing Sailor brand `ce2dcqixqSCx`; no duplicate brand or per-colour model entities are created.

## Verification evidence

- `pnpm exec tsx --test tests/content/phase373-sailor-shikiori-hisakata-tsukuyono.test.ts` passed 1/1 in about 43 seconds. The test used a temporary owned copy and covered remote-selection refusal, four variants per model, primary media, source/review/topology rows, idempotent replay and protected-catalogue stability.
- Persistent copy: `.planning/quick/260803-a2n-sailor-hisakata-tsukuyono/checkpoint/fpkg-copy.db`; initial copy matched the protected catalogue at `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`, then changed only in the owned copy to `7ec82427c61b413d6c0f857f3d9cfb67c055b3278e33556cfa1e72b5fbab5476`.
- First CLI replay returned `published` for the existing Sailor brand and both new models. Content hashes were brand `sha256:v3:a5da0d9a60043ce816dd0d840742ce664941a7235957f06827c7312e580885ea`, Hisakata `sha256:v3:71e5f785f0f58ac262bd868044ceca1585026415cafb29bc20cb36441368b430`, and Tsukuyono `sha256:v3:3ac8a5f25b980c5483ec0e618dabf0ddc708c6080dbbb67be4494df01d58cf59`.
- Second CLI replay returned `noop` for all three entities. SQL readback confirmed both model pages are present with `brand_entity_id=ce2dcqixqSCx`, 4 variants, 8 source references, `fact/language/media/publication:approved`, one primary media asset, and exactly one maker plus one reverse brand link.
- `pnpm exec biome check --write ...` completed without diagnostics for the changed TypeScript files. `pnpm exec tsc --noEmit` still reports only the known baseline diagnostics in `tests/content/phase346-jinhao-x450-x750.test.ts` (TS7022 twice) and `tests/migration/sync-local-catalog-to-turso.test.ts` (TS2741 missing `NODE_ENV`); no Phase 373 diagnostic was reported.
- The real `data/fpkg.db` main-file SHA-256 remained `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64` after all checks.
