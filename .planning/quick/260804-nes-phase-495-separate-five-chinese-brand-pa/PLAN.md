---
phase: 495
slug: phase-495-separate-five-chinese-brand-pa
status: complete
---

# Phase 495 — separate five Chinese brand primary media

## Objective

Remove five brand/model primary-image collisions that were identified in the
full media audit. Keep the already verified model drawings on the model pages,
add one clearly labelled original brand-level factual diagram per brand, and
publish only through the existing review gate on an owned checkpoint.

## Scope

- 依人 Yiren + 878
- YongXu + 286
- 东吴 DongWu + 948
- 书乐 ShuLe + 2398
- 长江 ZhangJiang + 988

The research files already contain the evidence boundaries for each brand and
model. This phase changes media/source-item ownership only; it does not create
new entities, alter model prose, or infer additional product specifications.

## Acceptance

1. Reject remote database selection and require a non-symlink checkpoint under
   this task directory.
2. Replace only each brand's shared model path with its own factual SVG,
   insert an approved Phase 495 source item, and update entity references.
3. Re-review fact/language/media and call `publishEntity` for changed targets;
   never assign publication status directly.
4. Verify the five old duplicate groups are gone, the five changed brand pages
   are public and blocker-free with exactly one approved primary media, the five
   model drawings remain on their canonical model rows, replay is a no-op, the
   checkpoint passes integrity/foreign-key checks, and `data/fpkg.db` is
   byte-for-byte unchanged.
