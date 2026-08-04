---
phase: 501
slug: finish-the-existing-waterman-allure-iden
status: complete
---

# Phase 501 — finish Waterman Allure identity merge

## Objective

Finish the already-recorded Waterman Allure duplicate merge on an owned
checkpoint copy. The canonical `phase83-pen-waterman-allure` page remains the
survivor; `p244WatermanAllure` remains a retired donor. Remove the donor's
duplicate public-media collision without rewriting canonical content.

## Scope

- keep the existing `entity_lineage` merge and permanent redirect;
- ensure donor aliases and graph links do not remain public;
- move only the donor's duplicate primary media to `hidden` usage;
- use `setEntityPublicationStatus` for any donor retirement transition;
- re-check the canonical page's publication state and content hash.

## Acceptance

1. Reject remote database selection and require an owned, non-symlink
   checkpoint copy.
2. Verify both exact Waterman identities, the existing merge lineage, the
   canonical redirect, and the Waterman maker relation.
3. Retire the donor only through the existing publication helper when needed;
   never assign a publication status directly in this phase.
4. Hide the donor's duplicate primary media while preserving the media row and
   source evidence; leave the canonical media unchanged.
5. Verify donor absence from `public_entities`, canonical publication and
   content hash stability, one approved primary Allure path, replay no-op,
   integrity/FK checks, and an unchanged protected real catalog.
