# Quick task: Esterbrook historical Double Jewel J/LJ/SJ

## Goal

Add three missing historical Esterbrook size identities—Double Jewel J, LJ and SJ—with sourced Chinese copy, exact vintage/modern boundaries, maker and reverse navigation, and original factual diagrams. Trial writes are limited to an owned disposable catalog copy.

## Scope

- J is the full-size post-war family reference; LJ is Long Slender; SJ is Short Slender/demi.
- Keep all three separate from modern Esterbrook Model J, JR, Estie, generic nurse/purse pens and unverified color claims.
- Use Esterbrook.net, VintagePens, the official modern model guide, and one clearly labelled sample listing only for the claims they support.

## Verification

- Each pen body is natural Chinese prose of at least 2,000 characters and includes identity, historical window, structure, Renew-Point, versions, care, buying boundaries, and source links.
- Curated packs publish through `recordEntityContentReview` and `publishEntity`; each new pen has exactly one `made_by` and one brand reverse link, approved spec evidence and one primary site-original SVG.
- Run the focused test, strict TypeScript, Biome, and `git diff --check`; replay is idempotent and the protected `data/fpkg.db` snapshot remains unchanged.

## Guardrails

- Never trial-write `data/fpkg.db` or remote Turso.
- Do not stage, delete, or overwrite other agents' research files, `.next-phase*` directories, checkpoint database copies, or the protected Montblanc quick directory.
- Do not expand generic search, LLM, Playwright, readiness, or acceptance infrastructure.
