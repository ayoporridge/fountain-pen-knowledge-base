---
status: complete
---

# Summary

Phase 506 adds the sourced Wancher Dream Pen Kyoto Urushi Kasane-iro - Unohana exact SKU. The page keeps Unohana separate from Kyoto Ume, other Dream Pen siblings, and the series navigation article; it records the official material, filling, nib/feed compatibility, cap, packaging, mutable price/availability boundary, care guidance, and unknown dimensions/weight/release-year limits in natural Chinese.

## Evidence

- Official product source: `https://www.wancherpen.com/products/kyoto-urushi-unohana`
- Official collection source: `https://www.wancherpen.com/collections/dream-pen`
- Official care source: `https://www.wancherpen.com/pages/product-care`
- Independent professional-secondary context: `https://kyoto-museums.city.kyoto.lg.jp/en/feature-column/lacquer/`
- Focused test: `pnpm exec tsx --test tests/content/phase506-wancher-kyoto-urushi-unohana.test.ts` passed 1/1, including remote rejection, first publish, public readback, reviews, maker/reverse links, 11 variants, source/media checks, replay noop, and protected-catalog immutability.
- CLI owned checkpoint: first apply published with content hash `sha256:v3:d432a61aafdbc04042671f7db133b17ef233a576b63beb4a1377b3a6b7eba25f`; replay returned `noop` with the same hash.
- Checkpoint readback: canonical pen identity, `published`, public membership, one `made_by`, one `reverse`, 11 variants, one primary media asset, two source rows, `PRAGMA integrity_check=ok`, and empty foreign-key check.
- Protected `data/fpkg.db` hash remained `52dc44cdc7cf855563ac89cad2bedc747a88bc259df23f599b2c52c3372a9495`.
- Full TypeScript remains at the pre-existing baseline: the two Phase 346 TS7022 diagnostics and the NODE_ENV typing diagnostic in `tests/migration/sync-local-catalog-to-turso.test.ts`; no Phase 506 diagnostics.

## Boundaries

- No write to `data/fpkg.db`, Turso, or production.
- Checkpoint sidecars remain untracked and are not staged.
- Unrelated research, `.next-phase*`, and the protected Montblanc quick directory were preserved.
