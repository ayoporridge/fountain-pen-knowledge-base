---
phase: 498
slug: phase-498-separate-five-further-brand-pr
status: complete
---

# Phase 498 — separate five further brand primary media

## Objective

Remove five audited brand/model primary-media collisions without changing the
already sourced model pages. Add one factual, non-photo brand diagram per
brand, keep existing model media and source items intact, and publish only
through the established review gate on an owned checkpoint copy.

## Scope

- Ranga Pens + Model 3
- Magna Carta + Mag 600
- TACCIA + Spotlight
- Mabie Todd & Co. + Swan
- Lotus Pens + Student

The existing research files define the historical, product, and specimen-level
evidence boundaries. This batch changes only brand media/source-item ownership;
it does not create entities, rewrite model prose, or transfer model
specifications to the brand page.

## Acceptance

1. Reject remote database selection and require a non-symlink checkpoint under
   this task directory.
2. Replace only each brand's shared model path with its own original factual
   SVG, insert an approved Phase 498 source item, and update that brand's
   references.
3. Re-review fact/language/media and call `publishEntity` for changed targets;
   never assign publication status directly.
4. Verify the five old duplicate groups are gone, five brand pages are public
   and blocker-free with one approved primary media, the five model drawings
   remain byte-for-byte the same database rows, replay is a no-op, the copy
   passes integrity/foreign-key checks, and `data/fpkg.db` is unchanged.
