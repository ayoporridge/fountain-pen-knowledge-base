# Quick task: Pelikan M120N

## Scope

- Add the missing canonical Pelikan M120N retro special-edition family with Green-Black and Iconic Blue variants.
- Preserve the historical Pelikan 120 relationship without merging M120N into the 1955 school pen or unrelated M101N editions.
- Run all database writes on an owned checkpoint copy; the real catalog remains read-only.

## Verification

- Natural Chinese copy covers the 1955 120 basis, gold-plated stainless nib, piston filling, 2016/2018 versions, dimensions, care, buying, and source limits.
- Targeted test checks publication reviews, spec evidence, maker/reverse link, idempotent replay, remote-env rejection, and protected catalog immutability.
- TypeScript, Biome, and staged diff checks pass before committing only this task's files.
