# Quick Plan: Rewrite three flagged model pages

## Objective

Use the existing official and professional source records to replace three published model stories that still trigger the read-first rewrite audit with natural reader-facing Chinese prose. Preserve exact model identity, brand relation, approved source/media evidence, and the publication review gate; only use a caller-owned checkpoint for the trial.

## Scope

- `aurora-ipsilon-quadra` — Aurora official B14-CQN silver guilloché model.
- `lamy-aion` — LAMY official aion aluminium/Z53 model.
- `taccia-pinnacle` — TACCIA official anodized-aluminium model.

## Tasks

1. Copy the existing reviewed source facts into three owned quick research files and rewrite the body sections without field-card/meta wording.
2. Build a Phase 493 curated-pack rewriter that reuses existing entity IDs, claims, specs, relations, and approved media while replacing only the reviewed story copy and source marker.
3. Add focused content tests for protected-catalog safety, identity/brand relation, reader-facing body, review/publication gate, and replay noop.
4. Run all three packs on a caller-owned checkpoint, run targeted tests, TypeScript/format/diff checks, and compare media/source counts before and after.
5. Do not migrate the real catalog in this quick; record evidence for the next formal integration batch and keep the overall goal active.

## Guardrails

- Never use `data/fpkg.db` as the trial database and never inherit Turso/FPKG database environment variables.
- Do not edit or stage other agents' research, `.next-phase*`, old checkpoints, or the protected Montblanc quick directory.
- Do not add generic AI/Playwright/readiness infrastructure; this is a direct content rewrite only.
