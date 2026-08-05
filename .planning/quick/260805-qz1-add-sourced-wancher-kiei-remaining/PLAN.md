# Quick Task Plan: add remaining sourced Wancher Kiei SKUs

## Objective

Add the two currently absent, source-resolved Kiei Urushi exact SKUs still listed in the official collection: Holly Olive Black and Yozakura Akatame.

## Scope and guardrails

- use each official exact product page, the Kiei collection, official nib/care guidance, and independent lacquer context;
- keep Holly Olive Black and Yozakura Akatame separate; preserve the Yozakura page's named artist and natural flower-petal boundary;
- do not add Yuukari Hekitame in this batch because its current exact URL returns a Holly Olive Akatame product title and needs identity reconciliation first;
- use only owned checkpoint copies and the existing review gate; never write `data/fpkg.db`, Turso, or production;
- protect unrelated research, `.next-phase*`, and the Montblanc quick directory.

## Verification

Batch test must reject remote selection, publish/replay both exact SKUs, read back public content, maker/reverse links, variants/specs/media/sources/review hashes, and confirm the real catalog snapshot is unchanged. Run focused Biome/diff checks and record the known TypeScript baseline.
