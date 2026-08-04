---
phase: 502
slug: integrate-committed-phases-493-through-5
status: complete
---

# Phase 502 — integrate committed 493–501 packages on a checkpoint

## Objective

Replay the committed content and identity packages from Phases 493 through
501 in order on a fresh caller-owned copy of the current local catalog. Use
the resulting copy to measure what is actually ready before any formal local
migration decision.

## Scope

- Phase 493: three read-first model rewrites
- Phase 494: scoped primary-media deduplication
- Phases 495–500: brand/model media separation packages
- Phase 501: Waterman Allure donor-media identity finish

## Acceptance

1. Build the checkpoint with the repository copy helper; reject all remote
   database environment selection.
2. Apply all nine packages in order, capture first-run outcomes, replay all
   nine and require stable no-op outcomes.
3. Read back target publication, review, source, media, maker/reverse links,
   lineage, redirect, and content hashes; run SQLite integrity/FK checks and
   current focused tests.
4. Run the repository's content-quality/readiness checks against the owned
   copy and record remaining backlog/duplicate groups rather than calling the
   global goal complete.
5. Keep `data/fpkg.db`, research files, `.next-phase*`, and unrelated quick
   directories unchanged. Do not write Turso or production.
