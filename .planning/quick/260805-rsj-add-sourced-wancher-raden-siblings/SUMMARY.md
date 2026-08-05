# Summary: add sourced Wancher Raden siblings

## Delivered

- Added separate Wancher Dream Pen Raden Sourin（蒼鱗）and Raden Shuryu（朱龍）model packs with exact product ids, handles, official JSON sources and Chinese research articles.
- Preserved the two products' differences: Sourin's blue-scale theme and five nib widths; Shuryu's vermillion-dragon theme, Titanium trim, cap serial-number boundary, nine nib widths and estimated completion note.
- Added two site-original factual SVGs and a batch apply/test path through the existing review and publication gates.

## Evidence

- Official product JSON/product pages and Dream Pen collection were checked on 2026-08-05; official nib/care pages and independent Kyoto lacquer context are included.
- `pnpm exec tsx --test tests/content/phase515-wancher-raden-siblings.test.ts` passed after implementation and formatting. It rejects remote selection, publishes/replays both packs on an owned disposable checkpoint, verifies public content, review hashes, maker/reverse links, 28 nib variants plus edition boundaries, specs, media, exact JSON sources and the protected catalog snapshot.
- Focused Biome check and `git diff --check` passed. `pnpm exec tsc --noEmit` reports only the three pre-existing baseline diagnostics in `phase346-jinhao-x450-x750.test.ts` and `sync-local-catalog-to-turso.test.ts`.

## Boundary

- This batch has not been written to `data/fpkg.db`, Turso or production. Wancher Dream Pen still has many official products without packs; full migration, coverage audit, deployment and online readback remain open goal work.
