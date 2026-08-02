# Phase 374 Summary

## Status

Phase 374 is verified and ready for its own commit. This is one content batch only and is not the full Fountain Pen Knowledge Graph goal.

## Source boundary

- Sailor official pages establish model codes, nibs, filling, materials, dimensions and weight.
- The SHIKIORI official collection pages establish seasonal design narratives and the distinction between fountain-pen products and related inks.
- The official Minori topic, Chinese product page and 2022 release material establish the 5th-anniversary date, limited 3,000-set bundle, 20 ml ink and special converter; no unverified production claim will be added.
- Site-original SVGs will be factual identity cards, explicitly not product photos, logos, scale drawings or colour proofs.

## Verification evidence

- `pnpm exec tsx --test tests/content/phase374-sailor-shikiori-amaoto-minori.test.ts` passed 1/1 in about 44 seconds. The test used a temporary owned copy and covered remote-selection refusal, identity collisions, four Rain variants plus the single Minori set, source/review/media/topology rows, timeline, idempotent replay and protected-catalogue stability.
- Persistent copy: `.planning/quick/260803-aej-sailor-shikiori-amaoto-minori/checkpoint/fpkg-copy.db`; initial copy matched the protected catalogue at `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`, then changed only in the owned copy to `02302d0d32e62f748184eb03336b81c1aff78277eb837cef18d379546aec9c30`.
- First CLI replay returned `published` for the existing Sailor brand and both new models. Content hashes were brand `sha256:v3:3ee0859ed8bd5a091a41ba107f5852d5b606839f1c22082e79779a153654ccdc`, Amaoto `sha256:v3:52a99328eead157ff8b3421a7b55887f635da25a24b32350c640d94111f59da1`, and Minori `sha256:v3:c40294943cfa845b5969731bbd7be3ac7acebfbf29fe8152a4427d0ebebadf21`.
- Second CLI replay returned `noop` for all three entities. SQL readback confirmed Amaoto has 4 variants, 9 source references and one `model_released:2020-11-15` event; Minori has 1 edition-group variant, 10 source references, `model_released:2022-09-10` and an explicitly circa `discontinued:2025-11` boundary. Both have `fact/language/media/publication:approved`, one primary SVG, and exactly one maker plus one reverse Sailor-brand link.
- The first test failure was a legitimate readiness gate (`missing_professional_secondary_group`); it was fixed by adding Nagasawa Stationery Center for Amaoto and JP Select for Minori as professional-secondary identity cross-checks. Their claims do not replace official specifications.
- `pnpm exec biome check --write ...` completed without diagnostics for the changed TypeScript files. `pnpm exec tsc --noEmit` still reports only the known baseline diagnostics in `tests/content/phase346-jinhao-x450-x750.test.ts` (TS7022 twice) and `tests/migration/sync-local-catalog-to-turso.test.ts` (TS2741 missing `NODE_ENV`); no Phase 374 diagnostic was reported.
- The real `data/fpkg.db` main-file SHA-256 remained `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64` after all checks.
