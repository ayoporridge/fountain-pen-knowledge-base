---
quick_id: 260723-cqt
status: complete
created: 2026-07-23
---

# Taiwan and TWSBI representative content batch

## Goal

Publish source-backed, replayable content for the Taiwan representative gap set and resolve the existing mixed TWSBI 580 identity without creating duplicate entities. All database experiments run only against a caller-owned checkpoint copy; `data/fpkg.db` must remain byte-for-byte unchanged.

## Scope and identity decisions

1. Add missing brand and model packs for ystudio Classic Revolve, Laban 325, Fine Writing International Fenestro, Opus 88 Omar, TWSBI Swipe and IWI Laureate. Reuse the existing Opus 88 and TWSBI brand IDs; create exact brand packs for ystudio, Laban, Fine Writing International and IWI only when the source-backed brand identity is explicit. The batch publishes eight pens and four new brand pages; existing Opus/TWSBI brands are only current-hash reviewed after topology changes.
2. Treat the existing `V9IvGskSYan0` raw entity (`三文堂-twsbi-580-580al`) as the canonical standard TWSBI Diamond 580. Update that entity in place through the curated-pack path (same ID; canonical slug/name become `twsbi-diamond-580` / `三文堂 TWSBI Diamond 580`) and preserve its brand relation. Do not create a second standard 580 entity.
3. Add a distinct TWSBI Diamond 580ALR entity. Keep standard 580 and 580ALR as siblings: both piston-fill, but ALR's machined aluminium grip/connector/piston rod and matte finish are not written back to the standard 580.
4. Verify Cypress Crown Mini before publication. The available Taiwan trade-show and Pai Pen Pro records name “The Connect Modern & Ancient Crown Mini” but do not establish that Mr. Cypress made it. The candidate is rejected in this batch: no Cypress pack, entity, media or relationship is created.

## Sources and content requirements

- Use official manufacturer pages wherever available: ystudio Classic Revolve, TWSBI Diamond 580/580ALR/Swipe, IWI Laureate, and the ystudio/TWSBI brand context.
- Use reliable professional secondary sources for Laban 325, FWI Fenestro and Opus 88 Omar, clearly scoping measured values to the named sample and separating current listing facts from reviews.
- Use official/industry records and independent corroboration for any Cypress candidate; absence of maker attribution is a publication blocker.
- Each published pack needs natural Chinese body text covering identity, construction/specifications, history or source window, variants/edition boundaries, filling/maintenance, buying guidance, media attribution and source-backed claims. Original SVGs are factual diagrams only, never product photos or logos.

## Implementation files

- Add one data manifest under `scripts/data/phase141-...ts` with stable IDs and `CuratedEntityPack` definitions.
- Add one apply script under `scripts/apply-phase141-...-content.ts`, following the Phase 22/139/140 owned-catalog authority checks, identity preflight, collision checks, prerequisite application, review recording and `publishEntity` path. The script explicitly handles the in-place V9 identity migration and protects existing public TWSBI/Opus descendants by preparing topology first, reviewing existing brand hashes without rewriting their payloads, and publishing each new model through a model-only route.
- Add checked-in Markdown research/body files under `.planning/content-research/` for every published pack, plus one original SVG per published entity under `public/images/library/site-original/phase141/` (reuse existing brand SVG only when its identity is exact; never duplicate media).
- Add a focused `tests/content/phase141-...test.ts` that copies the real catalog to a disposable owned path, asserts the protected real snapshot is unchanged, validates pack depth/source/media, tests first apply and noop replay, verifies all three current-hash reviews and publication status, probes identity/collision/authority guards, and asserts standard 580 versus 580ALR separation.

## Execution order

1. Re-check current raw IDs and existing packs; establish stable IDs and source scopes.
2. Write research, body Markdown, SVGs and the manifest/apply/test files.
3. Run the directed test on an owned checkpoint copy only. Confirm first publish, replay no-op, review contract, maker links, in-place 580 slug/name, 580ALR sibling, and Cypress decision.
4. Run TypeScript, Biome, SVG XML validation and `git diff --check`; verify `data/fpkg.db` hash remains `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`.
5. Inspect `git status --short`, stage only this quick task's files, commit product changes atomically, then commit quick PLAN/SUMMARY/STATE documentation separately. Never stage protected research, `.next-phase*`, or the Montblanc quick directory.

## Out of scope

No real database migration, no remote write, no search/LLM restoration, no new generic readiness/Playwright framework, and no broad catalog recount. Formal migration and full-site verification remain later goal-level work.
