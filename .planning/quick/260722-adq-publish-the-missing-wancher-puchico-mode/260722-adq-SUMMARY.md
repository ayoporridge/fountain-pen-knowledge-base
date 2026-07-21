---
phase: quick
plan: 260722-adq
subsystem: content-publication
tags: [wancher, puchico, curated-content, sqlite, publication-v3]
requires:
  - phase: 104/107/112/113
    provides: published Wancher baseline, Dream Pen article, True Ebonite, Titanium Black, and Aka Tamenuri
provides:
  - one canonical Wancher PuChiCo pen with eleven retrieved-date color variants
  - isolated official-current, Sarah Read 2024 supplied-sample, and Kimberly Lau 2025 self-purchased-sample scopes
  - caller-owned checkpoint publication with Wancher post-topology current-hash recovery and exact noop/tamper gates
affects: [wancher-navigation, phase23-content-corpus]
tech-stack:
  added: []
  patterns: [single-target curated pack, post-topology current-hash brand recovery, fail-closed terminal noop]
key-files:
  created:
    - .planning/content-research/wancher-puchico-phase119.md
    - scripts/data/phase119-wancher-puchico.ts
    - scripts/apply-phase119-wancher-puchico-content.ts
    - tests/content/phase119-wancher-puchico.test.ts
    - public/images/library/site-original/phase119/wancher/wancher-puchico.svg
  modified: []
key-decisions:
  - "PuChiCo is one canonical pen; all eleven official color cards are model_variants and the three Petite Charm Case cards are excluded."
  - "Sarah Read 2024 and Kimberly Lau 2025 remain separate professional sample scopes; sample capacity, flight/leak/burp, nib feel, price, color, posting, hand-fit, and durability do not qualify line-wide stable specs."
  - "Wancher is recovered only through recordEntityContentReview plus publishEntity for the post-topology current hash; no legacy brand pack is replayed."
requirements-completed: [QUICK-260722-ADQ]
coverage:
  - id: D1
    description: "Publish one canonical Wancher PuChiCo with exact eleven-color variant set and no color/case entities."
    requirement: QUICK-260722-ADQ
    verification:
      - kind: integration
        ref: "tests/content/phase119-wancher-puchico.test.ts#Phase 119 publishes one PuChiCo with exact variants and isolated sample scopes"
        status: pass
    human_judgment: false
  - id: D2
    description: "Preserve three evidence scopes and reject sample-only observations from current stable specs."
    requirement: QUICK-260722-ADQ
    verification:
      - kind: integration
        ref: "tests/content/phase119-wancher-puchico.test.ts#scope/spec-evidence assertions"
        status: pass
    human_judgment: false
  - id: D3
    description: "Publish only on a caller-owned checkpoint, recover Wancher by current hash, replay exact noop, and fail closed after tamper."
    requirement: QUICK-260722-ADQ
    verification:
      - kind: integration
        ref: "node --import tsx --test tests/content/phase119-wancher-puchico.test.ts"
        status: pass
    human_judgment: false
duration: 11min
completed: 2026-07-22
status: complete
---

# Quick 260722-adq: Wancher PuChiCo Summary

**Wancher PuChiCo is now represented as one published pen with eleven official retrieved-date color variants, while two professional review samples remain independently attributable and non-generalizable.**

## Accomplishments

- Added a 103-character summary and 3,764-character sourced Chinese body that separates canonical identity, official current facts, the eleven-color snapshot, Sarah Read's JetPens-supplied sample, and Kimberly Lau's self-purchased Black Chocolate Orange/Fine sample.
- Added one `CuratedEntityPack` with exact ID `phase119-wancher-puchico`, slug `wancher-puchico`, one Wancher maker pair, eleven `color` variants, three evidence scopes, sample-only claims, and rejected spec evidence.
- Added a phase-local caller-owned apply flow that validates the Phase 104/107/112/113 baseline before its first write, publishes Wancher against its post-topology current hash without replaying a brand pack, publishes PuChiCo through the public review APIs, returns exact noop only for a complete terminal, and fails closed after tamper.
- Added a unique 1600×900 site-original factual SVG that explicitly declares non-photo, non-logo, not-to-scale, and not-colour-proof boundaries.

## Product Commit

- `9160b24110c6a557d4e500f6580dcf894be711b0` — `feat(content): publish Wancher PuChiCo`
- Commit path proof: exactly the five frontmatter-owned product paths; PLAN, this SUMMARY, STATE, and unrelated dirty/untracked files are absent from the commit.

## Source and Scope Evidence

| Scope | Source | Provenance boundary |
|---|---|---|
| Official current | `https://www.wancherpen.com/collections/puchico` (retrieved 2026-07-22) | 65 mm capped-before-posting, cap posting, acrylic shavings/cutting, eyedropper, normal-sized iridium-point stainless-steel nib, and exact eleven pen-card colors; commerce state mutable; three cases excluded |
| Sarah Read sample | `https://www.penaddict.com/blog/2024/7/25/wancher-puchico-mini-fountain-pen` | Sarah Read, 2024-07-25, JetPens supplied at no charge; ~0.5 ml, weeks without leak, nib/construction, comfort, and review price remain sample-only |
| Kimberly Lau sample | `https://www.penaddict.com/blog/2025/6/19/wancher-puchico-a-pen-for-ants` | Kimberly Lau, 2025-06-20, full-price purchase from Kirk Speer at the 2024 SF Pen Show, Black Chocolate Orange/Fine; ~0.5 ml, flights/no burp, Fine feel, 60/90 mm, posting, hand-fit, price, color, and durability remain sample-only |

The optional White Snow exact-product URL was not retrievable during execution. Per the plan fallback, White Snow is supported only by its official collection card and was not used to infer any whole-line field.

## Hash and Publication Evidence

- Product commit: `9160b24110c6a557d4e500f6580dcf894be711b0`
- Pack digest: `341d55459cef607a6bd95847daa748b4ffa36ca206d3974c32f171e87634147d`
- Stable source marker: `curated-content:phase119-wancher-puchico-v1:341d55459cef607a6bd95847daa748b4ffa36ca206d3974c32f171e87634147d`
- SVG SHA-256: `ada5eaf218f67112a511b710c1ea2f6ee78263195821ad0b5dcdca7c9adabb83`
- Integration assertions compute pre/post Wancher contract-v3 hashes, require a topology-caused change, bind fact/language/media/publication approvals to each current hash, and prove Wancher non-topology payload is unchanged. Phase 107/112/113 brand packs are never invoked or replayed by the Phase119 runner.

## Verification

- `node --import tsx --test tests/content/phase119-wancher-puchico.test.ts` — PASS; one setup, migration 032, Phase 104→107→112→113 prerequisites, Phase119 published, pristine noop, variant tamper fail-closed, protected entity digests unchanged, and real main/WAL/SHM snapshot unchanged.
- `pnpm exec tsc --noEmit --pretty false` — PASS.
- `pnpm exec biome check scripts/data/phase119-wancher-puchico.ts scripts/apply-phase119-wancher-puchico-content.ts tests/content/phase119-wancher-puchico.test.ts` — PASS.
- `xmllint --noout public/images/library/site-original/phase119/wancher/wancher-puchico.svg` — PASS.
- Five-path `git diff --check`, empty-index precondition, exact cached allowlist comparison, cached diff check, exact commit subject, and post-commit `git show --name-only` proof — PASS.

## Deviations from Plan

### Auto-fixed Issues

1. **[Rule 1 - Correctness] Professional sample claims initially did not satisfy publication evidence readiness.**
   - The first GREEN run was blocked by `missing_professional_secondary_group` because both professional sample claims were marked editorial.
   - The claims were reclassified as core sample facts while their spec evidence remained rejected and sample-scoped. Publication then passed without promoting any sample observation to a stable spec.

2. **[Rule 1 - Modeling] Stable status text initially named commerce fields while describing their exclusion.**
   - The stable `model_specs.status` value was narrowed to the retrieval snapshot only; mutable price, stock, and availability boundaries remain in official scope and variant notes instead.

## Known Stubs

None.

## Threat Flags

None beyond the PLAN threat model. The new write surface is phase-local, caller-owned, and covered by authority, current-hash, duplicate/source-owner, terminal/noop, tamper, and protected-catalog assertions.

## Corpus Boundary

This is a partial batch toward the full corpus goal. The broader corpus goal remains active; this quick task does not claim Wancher, Phase 23, or the whole fountain-pen corpus is complete.

## Self-Check: PASSED

- All five product files exist in commit `9160b24`.
- Commit subject and exact path set were independently printed after commit.
- This prefixed SUMMARY exists only in the working tree and is intentionally uncommitted for the root orchestrator.
