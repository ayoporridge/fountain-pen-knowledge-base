---
phase: 500
slug: phase-500-separate-four-additional-brand
status: complete
---

# Phase 500 — separate four additional brand primary media

## Objective

Remove four audited brand/model primary-media collisions without changing the
already sourced model pages. Add one factual, non-photo brand diagram per
brand, keep existing model media and source items intact, and publish only
through the established review gate on an owned checkpoint copy.

## Scope

- David Oscarson + Winter Collection
- Bexley + Original
- Gioia + Capodimonte Kawari
- Danitrio + Densho

This batch changes only brand media/source-item ownership; it does not create
entities, rewrite model prose, or transfer model specifications to a brand
page.

## Acceptance

1. Reject remote database selection and require a non-symlink checkpoint under
   this task directory.
2. Replace only each brand's shared model path with its own original factual
   SVG, insert an approved Phase 500 source item, and update that brand's
   references.
3. Re-review fact/language/media and call `publishEntity` for changed targets;
   never assign publication status directly.
4. Verify the four old duplicate groups are gone, four brand pages are public
   and blocker-free with one approved primary media, the four model drawings
   remain byte-for-byte the same database rows, replay is a no-op, the copy
   passes integrity/foreign-key checks, and `data/fpkg.db` is unchanged.
