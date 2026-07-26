# Quick task: Pelikan M250 historical model

## Scope

- Add one new canonical `Pelikan M250` pen entity only after duplicate preflight confirms the slug and identity are absent.
- Keep M200, M205, M215, P200/P205, M400 and post-1997 Souverän routes separate.
- Update the existing Pelikan brand navigation with the M250 link without rewriting unrelated entities.
- Use an owned checkpoint copy for migration and replay tests; never write `data/fpkg.db`.

## Verification

- Reliable source record and natural Chinese正文 with historical identity, specifications, maintenance, and buying boundaries.
- Primary media is an original factual SVG explicitly marked as non-product art and non-scale.
- Targeted content test covers identity collision, evidence, publication reviews, `made_by` reverse link, idempotent replay, and protected catalog immutability.
- TypeScript, Biome, and diff checks pass before staging only this task's files.
