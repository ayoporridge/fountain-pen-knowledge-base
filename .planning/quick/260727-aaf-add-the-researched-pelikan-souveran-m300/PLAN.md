# Quick task: Pelikan Souverän M300

## Scope

- Add the missing canonical Pelikan Souverän M300 small-format model and keep M320/M350, M400/M405, and historical 300-series entries separate.
- Reuse the existing Pelikan brand identity pack only for topology/publication and create an exact-model factual SVG.
- Run all database writes on an owned checkpoint copy; the real catalog remains read-only.

## Verification

- Natural Chinese copy covers identity, 14K nib, piston filling, 1998+ history, size and edition boundaries, care, buying, and source limits.
- Targeted test checks publication reviews, spec evidence, maker/reverse link, idempotent replay, remote-env rejection, and protected catalog immutability.
- TypeScript, Biome, and staged diff checks pass before committing only this task's files.
