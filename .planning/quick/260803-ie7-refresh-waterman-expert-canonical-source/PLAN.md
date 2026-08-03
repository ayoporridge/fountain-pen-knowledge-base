# Quick Plan: Refresh Waterman Expert canonical sourced content

## Scope

Refresh the existing canonical `waterman-expert` entity in an owned checkpoint copy. The work will deepen the Chinese article, preserve the existing identity, verify the Waterman brand relation, and publish through the existing curated review/publish path. No new entity is created and the protected `data/fpkg.db` is never written.

## Tasks

1. Research the current Expert collection and product listing, Waterman heritage/support material, catalogue history, and one professional secondary source.
2. Write a source-backed Chinese content package covering the 1990–92 history, current SKU boundary, nib/filling/material details, historical Expert I/II/III terminology, maintenance, sibling-model boundaries, and buying guidance.
3. Implement a guarded Phase 396 apply script and data pack using `applyCuratedContentPacks`; keep identity/topology checks and remote/protected-catalog guards.
4. Add a focused regression test for owned-copy writes, review/publish, readiness, source diversity, variants, topology, replay idempotency, and real-catalog immutability.
5. Run the test, TypeScript, Biome, diff checks, apply/read back a persistent disposable checkpoint, record evidence in SUMMARY.md, and commit only Phase 396 files.

## Acceptance

- Existing `YAiCRah1XAsz` remains the only canonical public `waterman-expert` model.
- The body is at least 8,000 characters, natural Chinese, source-backed, and free of internal storage vocabulary.
- Current fact/language/media/publication reviews are approved and readiness has zero blockers on the checkpoint copy.
- Replaying the pack is a no-op and the real catalog hash remains unchanged.
- No unrelated research, `.next-phase*`, or protected quick directories are staged.

## Out of scope

- Formal migration to `data/fpkg.db` or Turso.
- Deployment, online review, generic acceptance infrastructure, search, or LLM restoration.
