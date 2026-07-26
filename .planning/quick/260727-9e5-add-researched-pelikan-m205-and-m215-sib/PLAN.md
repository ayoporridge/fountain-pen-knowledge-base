# Quick task: Pelikan M205 and M215

## Scope

- Add the missing Classic 200 sibling entities `Pelikan M205` and `Pelikan M215` after duplicate preflight.
- Keep M200's gold-coloured trim/steel route, M250's gold-nib route, and P200/P205 cartridge route distinct.
- Reuse the existing Pelikan brand identity pack only to satisfy publication topology and preserve its navigation; do not rewrite unrelated model entities.
- Run all writes only on an owned checkpoint copy.

## Verification

- Each model has natural Chinese body, separate official/Pelikan archive evidence, exact variant boundaries, and its own original factual SVG.
- Targeted test checks identity, nine spec evidence fields, publication reviews, maker/reverse links, idempotent replay, and protected catalog immutability.
- TypeScript, Biome, and diff checks pass before staging only this task's files.
