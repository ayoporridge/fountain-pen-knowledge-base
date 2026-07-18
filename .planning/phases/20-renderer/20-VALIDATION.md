---
phase: 20
slug: renderer
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-18
revised: 2026-07-18
---

# Phase 20 — Validation Strategy

> Waves 1–3 use only focused Node/tsx contract tests created in their owning tasks. Real browser commands first appear in Wave 4 and always run through 'scripts/check-renderer.ts'. Fixture evidence never proves publication or image correctness for the real 305-row inventory.

## Execution Preflight

Before Phase 20 execution, read '.planning/phases/19-real-audit-evidence/19-VERIFICATION.md'; never rerun the Phase 19 wrapper. If its status is 'gaps_found', execution may continue only under the accepted user-directed content-track exception, must record that exception in Phase 20 summaries/evidence, and must not imply the Phase 19 debt vanished. Any other blocking verdict requires user direction.

## Test Infrastructure

| Property | Value |
|---|---|
| Wave 1 | 'tsx --test' loader/fixture contracts in 'tests/renderer/entity-page.test.ts' |
| Waves 2–3 | 'tsx --test' Markdown/server-markup/responsive contracts in 'tests/renderer/components.test.tsx' |
| Wave 4 | Playwright desktop/mobile only through 'scripts/check-renderer.ts' |
| E2E server | Existing 'check:publication-gate -- --serve-e2e' borrowed-DB seam; no Phase 19 lifecycle edits |
| Build | Runner creates owned DB first, then runs build with sanitized explicit fixture env |
| Broad suites | Forbidden: 'pnpm test:e2e', 'check-phase19-regression', Phase 19 monolithic wrapper |

## Sampling Rate

- After each Wave 1 task: run its named 'entity-page.test.ts' selector.
- After each Wave 2–3 task: run its named 'components.test.tsx' selector.
- Wave 4 Task 1: one runner invocation for renderer desktop+mobile and four screenshots.
- Wave 4 Task 2: one runner invocation for Phase 20-owned boundary cases, then typecheck and exact-file Biome.
- Wave 4 Task 3: blocking human approval of each fixture hero mapping.

## 9/9 Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Test Type | Automated / Human Gate | File Exists | Status |
|---|---:|---:|---|---|---|---|---|---|
| 20-01-01 | 01 | 1 | PAGE-02, PAGE-03, PAGE-05, PAGE-06, PAGE-08 | T-20-04 | fixture + RED | 'tsx --test' selectors 'fixture boot|fixture safety'; RED must fail only for absent entity-page module | ❌ W0 | ⬜ pending |
| 20-01-02 | 01 | 1 | PAGE-02, PAGE-03, PAGE-05, PAGE-08 | T-20-01, T-20-02, T-20-03 | loader contract | 'pnpm exec tsx --test --test-name-pattern "page loader|qualified content" tests/renderer/entity-page.test.ts' | ❌ W0 | ⬜ pending |
| 20-02-01 | 02 | 2 | PAGE-01, PAGE-02, PAGE-07 | T-20-05 | Markdown/markup | 'pnpm exec tsx --test --test-name-pattern "heading|server markup|raw HTML|javascript URL" tests/renderer/components.test.tsx' | ❌ W0 | ⬜ pending |
| 20-02-02 | 02 | 2 | PAGE-03, PAGE-04, PAGE-08 | T-20-06, T-20-07 | component contract | 'pnpm exec tsx --test --test-name-pattern "evidence modules" tests/renderer/components.test.tsx' | ❌ W0 | ⬜ pending |
| 20-02-03 | 02 | 2 | PAGE-01, PAGE-02, PAGE-04, PAGE-06 | T-20-08 | route/server markup | 'pnpm exec tsx --test --test-name-pattern "route markup|PAGE-06 topics" tests/renderer/components.test.tsx && pnpm exec tsc --noEmit' | ❌ W0 | ⬜ pending |
| 20-03-01 | 03 | 3 | PAGE-07 | T-20-09, T-20-10 | CSS/markup contract | 'pnpm exec tsx --test --test-name-pattern "responsive selectors|navigation|accessibility" tests/renderer/components.test.tsx' | ❌ W0 | ⬜ pending |
| 20-04-01 | 04 | 4 | PAGE-01–PAGE-08 | T-20-11, T-20-13 | desktop/mobile E2E | 'pnpm exec tsx scripts/check-renderer.ts --spec=renderer --project=desktop,mobile --evidence-dir=.planning/phases/20-renderer/artifacts' | ❌ W0 | ⬜ pending |
| 20-04-02 | 04 | 4 | PAGE-02, PAGE-08 | T-20-11, T-20-12 | boundary + scope | 'pnpm exec tsx scripts/check-renderer.ts --spec=boundary --project=desktop' plus typecheck/exact-file Biome | ❌ W0 | ⬜ pending |
| 20-04-03 | 04 | 4 | PAGE-05 | T-20-13 | human visual | Approve brand/model entity ↔ asset ↔ rights ↔ attribution mappings in four screenshots/evidence table | ❌ W0 | ⬜ pending |

Status semantics: '⬜ pending' means not yet executed; '❌ W0' means the owning planned task creates the test/artifact. Do not mark RED/green before execution evidence exists.

## Wave 0 Artifacts

- Task 20-01-01 creates 'scripts/lib/renderer-fixture.ts' and 'tests/renderer/entity-page.test.ts', including environment guard adversaries and complete PAGE-06 sentinels.
- Task 20-02-01 creates 'tests/renderer/components.test.tsx', including same-AST and raw HTML/JavaScript URL cases.
- Task 20-04-01 creates 'scripts/check-renderer.ts' and 'tests/e2e/renderer.spec.ts'; no E2E command is valid before this wave.

## Required Adversarial Coverage

- Reject remote credentials, external inherited 'E2E_BASE_URL', protected-catalog path/alias, and missing fixture flag before resource access.
- SQL-shaped slug/type cannot alter authorization or return another entity.
- Raw HTML/script and 'javascript:' URLs are removed or inert after the existing Markdown sanitation path.
- Legacy/deprecated/unqualified/generic-media sentinels never enter loader, server HTML, desktop, or mobile output.

## PAGE-06 Completeness Matrix

The fixture story contains independent sentinels for: identity/product line; history; design/dimensions/materials/ergonomics; nib; attributed writing experience; filling/maintenance; variant boundaries; purchase checks. Every sentinel must pass in server markup, initial HTTP response, desktop, and mobile. A single story-start assertion is insufficient.

## PAGE-05 Visual Evidence Gate

Automated checks prove current owner, qualified primary status, stable path, attribution, license, and source. Task 20-04-03 additionally requires human visual approval of each fixture entity-to-asset mapping using desktop/mobile screenshots and the evidence table. This approves fixture assets only; visual review for every real 305 image is explicitly Phase 23 work.

## Phase Completion Gates

- All nine task rows have current evidence.
- Runner desktop/mobile and Phase 20-owned public-boundary modes are green.
- TypeScript and exact changed-file Biome checks are green.
- Four screenshots and '20-VERIFICATION-EVIDENCE.md' exist.
- Human hero mapping checkpoint is approved.
- Evidence states any Phase 19 'gaps_found' exception and makes no real-305/deployment claim.
