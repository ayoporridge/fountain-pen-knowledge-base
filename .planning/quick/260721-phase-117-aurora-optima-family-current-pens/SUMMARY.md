# Phase 117 — Aurora Optima family/current pens summary

## Outcome

Phase 117 completed as one partial content batch. It does not complete the full Fountain Pen Knowledge Graph content-repair goal and does not migrate or deploy the real catalog.

- Reclassified stable entity `5waoVLPHU2Pt` in place from the generic `pen/aurora-optima` record to the public article `Aurora Optima（系列导航）` at `/article/aurora-optima`.
- Added exact public pen identities `phase117-aurora-optima-auroloide-996-dor` and `phase117-aurora-optima-resina-997-cn`.
- Added the static redirect `/pen/aurora-optima` → `/article/aurora-optima`.
- Removed the old family maker/reverse topology and replaced it with exactly two `made_by`/`reverse` pairs for the exact pens and Aurora brand `CJXe8UpnkHLJ`.
- Preserved Aurora 88/800 and Phase 115 Ipsilon family/Demo/Resin payloads.

## Sources and evidence boundaries

- Aurora Optima category: `https://aurorapen.it/categoria-prodotto/alto-di-gamma/optima/`
- Exact Auroloide listing: `https://aurorapen.it/shop/optima-auroloide-stilografica/` — `996-DOR`, Auroloide, 14K white-gold nib, hidden-reserve piston, screw cap, EF/F/M/B; availability is a 2026-07-21 snapshot.
- Exact Resina listing: `https://aurorapen.it/shop/optima-resina-stilografica/` — `997-CN`, black resin, chrome trim, piston, EF/F/M/B; availability is a 2026-07-21 snapshot.
- PenHero chronology is limited to the circa-1992 modern line and early material history.
- Laura Petix/Pen Boutique, published 2024-10-12, remains dated professional sample context; 127 mm, 21.55 g, cleaning and hand-feel observations do not qualify exact current fields.
- The Pen Addict, published 2016-11-30, remains a dated blue-Auroloide sample; sample dimensions, weight, colour and subjective observations are not line-wide facts.
- The Optima 366 PDF remains limited-edition evidence for 996-LW/18K only and does not populate regular 996-DOR or 997-CN fields.
- Resina intentionally does not inherit 996-DOR's 14K, hidden-reserve, screw-cap, dimension, weight or subjective fields.

## Publication and migration behavior

- The test replays Phase 48 → Phase 114 → Phase 115 on one caller-owned checkpoint copy before Phase 117.
- The existing donor's exact official references are the only allowed first-write source-ownership migration state. Terminal ownership also permits the Auroloide exact source on Resina solely as rejected sibling evidence.
- Aurora's non-topology payload is held constant. Its content hash changes only because the old family reverse is removed and two exact reverse links are added.
- Aurora and both exact pens are reviewed with `recordEntityContentReview` for fact/language/media and published through `publishEntity` using their post-change current hashes. No lifecycle/public table is directly forced to published and no earlier brand pack is replayed.
- The family article has no publication, maker topology, spec, variant, scope, claim or claim evidence. It remains public through the article branch and carries one approved site-original factual SVG.
- A pristine replay returns three noops. A deleted exact `made_by` link fails closed before repair or review.

## Verification

- `node --import tsx --test tests/content/phase117-aurora-optima-family-current-pens.test.ts` — TAP 1/1 passed; duration 110097.679084 ms.
- `pnpm exec tsc --noEmit --pretty false --incremental false` — passed.
- `pnpm exec biome check ...` for the Phase 117 TypeScript and redirect files — passed for matched files with no fixes outstanding.
- `xmllint --noout` on all three Phase 117 SVGs — passed.
- Markdown lengths: family summary/body 94/2994 Unicode characters; Auroloide 129/3162; Resina 137/3313.
- Three SVG SHA-256 values are distinct: `ede6a70d...`, `659b13f6...`, `ff1d9277...`.
- Protected real database snapshot after the checkpoint test: main `85015867...`, WAL empty SHA-256, SHM `fd4c9fda...`; the test also asserts main/WAL/SHM unchanged across the run.
- `git diff --cached --check` passed with exactly ten product paths and no deletions.

## Commit

Product commit: `393a3797e21134f6a13180a5b15c47826569a061` — `feat(content): reclassify Aurora Optima family and publish current pens`.

The product commit contains exactly the ten paths declared in PLAN frontmatter. This SUMMARY and PLAN are recorded separately. Unrelated research, `.next-phase*`, the protected Montblanc quick directory and the Phase 105 quick directory were neither staged nor modified by this batch.
