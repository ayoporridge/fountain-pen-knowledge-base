# Quick task: Pelikan Souverän M805

## Scope

- Add the missing canonical Pelikan Souverän M805 silver-trim model without merging it into M800 or M805 special editions.
- Reuse the existing Pelikan brand identity pack only for topology/publication and create an exact-model factual SVG.
- Run all database writes on an owned checkpoint copy; the real catalog remains read-only.

## Verification

- Natural Chinese copy covers identity, 18K nib, piston filling, dimensions, historical and edition boundaries, care, buying, and source limits.
- Targeted test checks publication reviews, spec evidence, maker/reverse link, idempotent replay, remote-env rejection, and protected catalog immutability.
- TypeScript, Biome, and staged diff checks pass before committing only this task's files.
