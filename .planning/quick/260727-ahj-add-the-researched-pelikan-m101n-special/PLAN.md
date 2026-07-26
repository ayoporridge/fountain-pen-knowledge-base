# Quick task: Pelikan M101N

## Scope

- Add the missing canonical Pelikan M101N special/limited-edition family as one model node with source-backed variants.
- Preserve the historical 100N relationship without merging M101N into Model 100N, M1005, or unrelated M400 editions.
- Run all database writes on an owned checkpoint copy; the real catalog remains read-only.

## Verification

- Natural Chinese copy covers the 100N basis, 14 ct/18 ct variant nib distinction, piston filling, dimensions, edition timeline, care, buying, and source limits.
- Targeted test checks publication reviews, spec evidence, maker/reverse link, idempotent replay, remote-env rejection, and protected catalog immutability.
- TypeScript, Biome, and staged diff checks pass before committing only this task's files.
