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
| 18-01-01 | 01 | 1 | PUB-01, PUB-06 | T-18-01 | Ten importers stop owning migrations | static/contract | `pnpm check:migrations` | ✅ existing; extend | ⬜ pending |
| 18-01-02 | 01 | 1 | PUB-01, PUB-06 | T-18-01 | Full scripts ownership scan rejects bypasses | static/behavior | `pnpm check:migrations -- --migration-ownership` | ✅ existing; extend | ⬜ pending |
| 18-02-01 | 02 | 2 | PUB-01, PUB-06 | T-18-01 | Seeds use canonical migration; CSV/Markdown use readiness | static/contract | `pnpm check:migrations` | ✅ existing; extend | ⬜ pending |
| 18-02-02 | 02 | 2 | PUB-01 | T-18-02 | Contract and Playwright use an isolated DB | harness | `pnpm check:publication-gate -- --fixture-isolation` | ❌ W0 | ⬜ pending |
| 18-03-01 | 03 | 3 | PUB-01, PUB-02, PUB-06, PUB-07 | T-18-04 | Schema/readiness/type transitions, exact public brand ownership and draft-only backfill | migration/DB | `pnpm check:publication-gate -- --migration && pnpm check:publication-gate -- --backfill` | ❌ W0 | ⬜ pending |
| 18-03-02 | 03 | 3 | PUB-02, PUB-05 | T-18-05 | Every critical write invalidates reviewed revision | DB mutation | `pnpm check:publication-gate -- --invalidation` | ❌ W0 | ⬜ pending |
| 18-03-03 | 03 | 3 | PUB-02, PUB-05 | T-18-04 | Direct SQL cannot bypass atomic publish | transaction | `pnpm check:publication-gate -- --publish` | ❌ W0 | ⬜ pending |
| 18-04-01 | 04 | 4 | PUB-03, PUB-04, PUB-05 | T-18-06 | Helper/detail/metadata/sitemap are canonical and no-store | integration | `pnpm check:public-boundary -- --core-detail` | ✅ existing; extend | ⬜ pending |
| 18-04-02 | 04 | 4 | PUB-03, PUB-04, PUB-05 | T-18-06 | Entity APIs are equivalent, allowlisted and no-store | integration | `pnpm check:public-boundary -- --core-api-cache` | ✅ existing; extend | ⬜ pending |
| 18-05-01 | 05 | 5 | PUB-03, PUB-04, PUB-05 | T-18-07 | Browse/home/by lists and aggregates are equivalent | parity | `pnpm check:public-boundary -- --discovery-lists` | ✅ existing; extend | ⬜ pending |
| 18-05-02 | 05 | 5 | PUB-03, PUB-04, PUB-05 | T-18-07 | Graph/links aliases are public subsets and no-store | parity | `pnpm check:public-boundary -- --discovery-graph` | ✅ existing; extend | ⬜ pending |
| 18-06-01 | 06 | 6 | PUB-03, PUB-04 | T-18-08 | Recommend/concept/wiki targets are public subsets | parity | `pnpm check:public-boundary -- --secondary-links` | ✅ existing; extend | ⬜ pending |
| 18-06-02 | 06 | 6 | PUB-03, PUB-04, PUB-05, PUB-07 | T-18-08 | Brand page enumerates every public model; library/source/media owners are gated and no-store | parity | `pnpm check:public-boundary -- --secondary-library-media` | ✅ existing; extend | ⬜ pending |
| 18-06-03 | 06 | 6 | PUB-03, PUB-04, PUB-05 | T-18-08 | Exhibit/timeline targets and secondary cache policy hold | parity | `pnpm check:public-boundary -- --secondary-exhibit-timeline-cache` | ✅ existing; extend | ⬜ pending |
| 18-07-01 | 07 | 7 | PUB-01, PUB-02, PUB-05, PUB-06 | T-18-10 | Full migration matrix and compatibility hold | migration/regression | `pnpm check:publication-gate -- --migration-full && pnpm check:publication-gate -- --compatibility` | ❌ W0 | ⬜ pending |
| 18-07-02 | 07 | 7 | PUB-03, PUB-04, PUB-07 | T-18-09 | Independent four-semantics and complete brand-model reverse parity hold | full parity | `pnpm check:public-boundary -- --all` | ✅ existing; extend | ⬜ pending |
| 18-07-03 | 07 | 7 | PUB-02, PUB-03, PUB-04, PUB-05, PUB-07 | T-18-10 | Montblanc/Majohn drafts are absent; valid fixtures and all brand model links transition correctly | browser/API | `pnpm exec playwright test tests/e2e/publication-gate.spec.ts --project=desktop` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

## Wave 0 Requirements

- [ ] `scripts/check-publication-gate.ts` — isolated local database fixtures for
  migration replay, readiness, invalidation, publication, and compatibility.
- [ ] `tests/e2e/publication-gate.spec.ts` — browser/API regression fixtures,
  including Montblanc 149 and Majohn A1 fail-closed behavior, one valid brand,
  and more than twelve valid reverse-linked models to prove complete enumeration.
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
