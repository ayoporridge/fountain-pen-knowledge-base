---
status: complete
---

# Summary

Phase 508 adds the sourced Wancher Hirota Urushi Chawan-iro - Ai exact SKU. The natural Chinese page separates Ai from the existing Hirota Byobu-e/Ume ni Hanasui page and generic Hirota/Chawan concepts, records Hirota Yoko’s hand-crafted context, tea-bowl design boundary, one-piece and sold-out notice, and explicit unknowns for nib, filling, dimensions, weight, substrate, layers, and release year. Customer reviews and generated review summaries are not used as evidence.

## Evidence

- Official product source: `https://www.wancherpen.com/products/hirota-urushi-chawan-iro-ai`
- Official collection source: `https://www.wancherpen.com/collections/dream-pen`
- Official care source: `https://www.wancherpen.com/pages/product-care`
- Independent professional-secondary source: `https://www.kyohaku.go.jp/eng/exhibitions/feature/b/chanoyu_2023/`
- Focused test: `pnpm exec tsx --test tests/content/phase508-wancher-hirota-urushi-chawan-iro-ai.test.ts` passed 1/1, including remote rejection, first publish, public readback, reviews, maker/reverse links, one explicit variant, source/media checks, replay noop, and protected-catalog immutability.
- CLI owned checkpoint: first apply published with content hash `sha256:v3:7121ab8122742d5f1874e900fa9f142742e8e9a24ff5af87c8510c94bc9225d2`; replay returned `noop` with the same hash.
- Checkpoint readback: canonical pen identity, `published`, public membership, one `made_by`, one `reverse`, one variant, one primary media asset, two source rows, `PRAGMA integrity_check=ok`, and empty foreign-key check.
- Protected `data/fpkg.db` hash remained `52dc44cdc7cf855563ac89cad2bedc747a88bc259df23f599b2c52c3372a9495`.
- Full TypeScript remains at the pre-existing baseline: the two Phase 346 TS7022 diagnostics and the NODE_ENV typing diagnostic in `tests/migration/sync-local-catalog-to-turso.test.ts`; no Phase 508 diagnostics.

## Boundaries

- No write to `data/fpkg.db`, Turso, or production.
- Checkpoint sidecars remain untracked and are not staged.
- Unrelated research, `.next-phase*`, and the protected Montblanc quick directory were preserved.
