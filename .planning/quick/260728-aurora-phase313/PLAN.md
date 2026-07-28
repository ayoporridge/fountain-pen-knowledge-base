# Phase313 — Platinum Izumo Aizu Raden Maki-e Aurora PIZ-300000A

## Goal

在不触碰真实 `data/fpkg.db` 的前提下，为官方已列出的 Platinum Izumo Aizu Raden Maki-e Aurora `PIZ-300000A` 建立完整、可审核、可重放的内容包，并修正其与 Platinum 品牌及 Izumo 系列导航的关系。

## Owned files

- `.planning/content-research/platinum-izumo-piz-300000a-aurora-phase313.md`
- `scripts/data/phase313-platinum-izumo-piz-300000a-aurora.ts`
- `scripts/apply-phase313-platinum-izumo-piz-300000a-aurora-content.ts`
- `tests/content/phase313-platinum-izumo-piz-300000a-aurora.test.ts`
- `public/images/library/site-original/phase313/platinum/izumo-piz-300000a-aurora.svg`

## Sources

- Platinum official product page `PIZ-300000A` for identity, materials, dimensions and nibs.
- Platinum official press release `pid=8634` for Aizu Raden Maki-e process and Aurora motif.
- Platinum Izumo brand page for product-number and material boundaries.
- Platinum Izumo care manual for cartridge/converter cleaning boundaries.
- Professional retailer cross-check for the same SKU and accessory context.

## Verification

Run the owned checkpoint test, TypeScript, Biome and `git diff --check`. Stage only the files above and the ignored `scripts/data` file with an exact force-add. Keep the real database unchanged.
