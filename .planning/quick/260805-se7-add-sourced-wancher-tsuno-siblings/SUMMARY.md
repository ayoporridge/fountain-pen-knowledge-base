# Summary: add sourced Wancher Tsuno siblings

## Delivered

- Added separate Wancher Dream Pen Tsuno Fountain Pen and Tsuno Black Fountain Pen model pages.
- Preserved regular Tsuno's Hikage/Akari market variants, Tsuno Black's Classic/Origin variants, buffalo-horn natural variation, Titanium grip/threads, exact product SKUs, JoWo/Wancher 18K/Keiryu-Kodachi/Shogun nib menu, ebonite-feed compatibility, Sailor Standard exception and packaging.
- Added two source-led Chinese research articles, two site-original factual SVGs, and a two-pack CuratedEntityPack/apply/test path through the existing review and publication gates. British Museum and Arizona State Museum are used only for horn-material and conservative care context.

## Evidence

- Exact official product JSON/product pages and Dream Pen collection, Wancher nib/care guidance, British Museum horn terminology and Arizona State Museum conservation guidance were checked on 2026-08-05.
- `pnpm exec tsx --test tests/content/phase518-wancher-tsuno-siblings.test.ts` passed before and after formatting. It rejects remote selection, publishes/replays both packs on an owned disposable checkpoint, verifies public content, review hashes, maker/reverse links, 10 variants per page, specs, media, approved JSON sources and the protected catalog snapshot.
- Focused Biome check and `git diff --check` passed. `pnpm exec tsc --noEmit` reports only the three pre-existing diagnostics in `phase346-jinhao-x450-x750.test.ts` (TS7022 twice) and `sync-local-catalog-to-turso.test.ts` (NODE_ENV TS2741).

## Boundary

- These packs have not been written to `data/fpkg.db`, Turso, or production. Wancher Dream Pen still has many official products without packs; full migration, coverage audit, deployment, human traversal and online readback remain open goal work.
