---
phase: 18
slug: publication-gate
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-15
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for the fail-closed publication boundary.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript contract scripts + Playwright |
| **Config file** | `playwright.config.ts`, `package.json` scripts |
| **Quick run command** | `pnpm check:migrations && pnpm check:publication-gate` |
| **Full suite command** | `pnpm check:migrations && pnpm check:data-contract && pnpm check:publication-gate && pnpm check:public-boundary && pnpm check:library && pnpm lint && pnpm build && pnpm test:e2e:desktop && pnpm test:e2e:mobile` |
| **Estimated runtime** | quick ~25 seconds; full ~4–8 minutes |

## Sampling Rate

- **After every task commit:** Run the task-specific command in the map below.
- **After every plan wave:** Run the full suite up to and including `pnpm build`;
  run targeted Playwright tests when a public surface changed.
- **Before `$gsd-verify-work`:** The complete full-suite command must be green.
- **Max feedback latency:** 30 seconds for task-level checks.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | PUB-01 | T-18-01 | Importers cannot forge migration markers | static/contract | `pnpm check:migrations` | ✅ existing; extend | ⬜ pending |
| 18-01-02 | 01 | 1 | PUB-01 | Playwright and contract tests use an isolated DB | harness | `pnpm check:migrations -- --fixture-isolation` | ❌ W0 | ⬜ pending |
| 18-02-01 | 02 | 2 | PUB-01, PUB-02 | Missing/draft/stale records fail closed | migration/DB | `pnpm check:publication-gate -- --migration` | ❌ W0 | ⬜ pending |
| 18-02-02 | 02 | 2 | PUB-02, PUB-05 | Critical writes invalidate reviewed revision | DB mutation | `pnpm check:publication-gate -- --invalidation` | ❌ W0 | ⬜ pending |
| 18-02-03 | 02 | 2 | PUB-02, PUB-05 | Direct SQL cannot bypass atomic publish transition | transaction | `pnpm check:publication-gate -- --publish` | ❌ W0 | ⬜ pending |
| 18-02-04 | 02 | 2 | PUB-06 | Migration creates only draft rows and preserves deprecated stories | migration diff | `pnpm check:publication-gate -- --backfill` | ❌ W0 | ⬜ pending |
| 18-03-01 | 03 | 3 | PUB-03, PUB-04 | Detail/API cannot read raw unpublished brand/pen | integration | `pnpm check:public-boundary -- --detail-api` | ✅ existing; extend | ⬜ pending |
| 18-03-02 | 03 | 3 | PUB-03, PUB-04 | Lists/aggregates are equivalent and contextual results are subsets | parity | `pnpm check:public-boundary -- --discovery` | ✅ existing; extend | ⬜ pending |
| 18-03-03 | 03 | 3 | PUB-03, PUB-04 | Graph/recommend/library/wiki/media aliases are gated | parity | `pnpm check:public-boundary -- --relationships` | ✅ existing; extend | ⬜ pending |
| 18-03-04 | 03 | 3 | PUB-04, PUB-05 | Entity-bearing responses are dynamic/no-store | static/integration | `pnpm check:public-boundary -- --cache-policy` | ✅ existing; extend | ⬜ pending |
| 18-04-01 | 04 | 4 | PUB-01, PUB-02 | Fresh replay, upgrade, idempotency, constraints | migration | `pnpm check:publication-gate -- --migration-full` | ❌ W0 | ⬜ pending |
| 18-04-02 | 04 | 4 | PUB-03, PUB-04 | Complete/equivalent/subset surface contracts hold | full parity | `pnpm check:public-boundary -- --all` | ✅ existing; extend | ⬜ pending |
| 18-04-03 | 04 | 4 | PUB-02, PUB-03, PUB-04 | Montblanc 149 shell is 404; valid fixture is reachable | browser/API | `pnpm exec playwright test tests/e2e/publication-gate.spec.ts --project=desktop` | ❌ W0 | ⬜ pending |
| 18-04-04 | 04 | 4 | PUB-06 | Non-brand/pen visibility has zero bidirectional diff | regression | `pnpm check:publication-gate -- --compatibility` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

## Wave 0 Requirements

- [ ] `scripts/check-publication-gate.ts` — isolated local database fixtures for
  migration replay, readiness, invalidation, publication, and compatibility.
- [ ] `tests/e2e/publication-gate.spec.ts` — browser/API regression fixtures,
  including Montblanc 149 fail-closed behavior and one valid v1 entity.
- [ ] `package.json` `check:publication-gate` script.
- [ ] Extend `scripts/check-migration-safety.ts` with the migration-writer
  ownership rule.
- [ ] Extend `scripts/check-public-boundary.ts` with independent surface parity;
  expected values may not reuse the runtime authorization predicate.

No new test framework or package installation is required.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Production remains unchanged during Phase 18 | PUB-06 | Confirms deployment boundary rather than application behavior | Keep all commits local and do not push, migrate remote, or change the Vercel production alias; record the pre-phase release for Phase 26 comparison |

All publication semantics and public-surface behavior otherwise require automated
coverage. Production browser verification belongs to Phase 26 after staged migration.

## Validation Sign-Off

- [x] All anticipated implementation tasks have automated verification or Wave 0 dependencies.
- [x] Sampling continuity: no three consecutive tasks lack automated checks.
- [x] Wave 0 covers all missing files without adding a new framework.
- [x] No watch-mode flags.
- [x] Task feedback target is under 30 seconds.
- [x] `nyquist_compliant: true` is set.

**Approval:** approved 2026-07-15
