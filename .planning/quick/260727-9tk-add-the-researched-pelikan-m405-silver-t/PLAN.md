# Quick task: Pelikan M405

## Scope

- Add the missing canonical Pelikan Souverän M405 silver-trim sibling after duplicate preflight.
- Keep M400 gold trim, M605 M600-size silver trim, M415 2009 tortoise edition, and historical 400/400NN separate.
- Reuse the existing Pelikan brand identity pack only for topology/publication and use an independent exact-model SVG.
- Run all database writes on an owned checkpoint copy only.

## Verification

- Natural Chinese copy covers identity, 14K nib, piston filling, 2002+ family history, trim/edition boundaries, care, buying, and source limitations.
- Targeted test checks the publication gate, evidence fields, reviews, maker/reverse link, idempotent replay, and protected catalog immutability.
- TypeScript, Biome, and diff checks pass before staging only this task's files.
