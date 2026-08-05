---
status: complete
---

# Summary

Phase 507 adds the sourced Wancher Dream Pen Kiei Urushi Yozakura - Kuro exact SKU. The reviewed Chinese page separates the black Yozakura identity from the red sibling and generic Kiei technique, records Wancher’s seasonal/natural-pattern boundary, real Sakura petals, gold powder, matte Nurippanashi texture, explicit JoWo/feed incompatibility, care limits, packaging, and unknown release/dimension/weight fields. Wancher’s AI-generated review summary and customer reviews are deliberately not used as evidence.

## Evidence

- Official product source: `https://www.wancherpen.com/products/kiei-urushi-yozakura-kuro`
- Official collection source: `https://www.wancherpen.com/collections/dream-pen`
- Official care source: `https://www.wancherpen.com/pages/product-care`
- Independent professional-secondary sources: `https://kyoto-museums.city.kyoto.lg.jp/en/feature-column/lacquer/` and `https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/shikko_20160830.html`
- Focused test: `pnpm exec tsx --test tests/content/phase507-wancher-kiei-urushi-yozakura-kuro.test.ts` passed 1/1, including remote rejection, first publish, public readback, reviews, maker/reverse links, seven variants, source/media checks, replay noop, and protected-catalog immutability.
- CLI owned checkpoint: first apply published with content hash `sha256:v3:0bc64b4a2054cc173e0aee5bad079dbd00725116528ddeac2e6b02fe84a30d20`; replay returned `noop` with the same hash.
- Checkpoint readback: canonical pen identity, `published`, public membership, one `made_by`, one `reverse`, seven variants, one primary media asset, three source rows, `PRAGMA integrity_check=ok`, and empty foreign-key check.
- Protected `data/fpkg.db` hash remained `52dc44cdc7cf855563ac89cad2bedc747a88bc259df23f599b2c52c3372a9495`.
- Full TypeScript remains at the pre-existing baseline: the two Phase 346 TS7022 diagnostics and the NODE_ENV typing diagnostic in `tests/migration/sync-local-catalog-to-turso.test.ts`; no Phase 507 diagnostics.

## Boundaries

- No write to `data/fpkg.db`, Turso, or production.
- Checkpoint sidecars remain untracked and are not staged.
- Unrelated research, `.next-phase*`, and the protected Montblanc quick directory were preserved.
