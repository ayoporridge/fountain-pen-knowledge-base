---
phase: 19
slug: real-audit-evidence
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-15
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for the full-inventory audit and evidence-readiness v2 work.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript contract scripts + disposable SQLite + existing Playwright regression |
| **Config file** | `package.json`, `playwright.config.ts` |
| **Quick run command** | `pnpm check:evidence-contract -- --fixture && pnpm check:audit-readiness -- --fixture` |
| **Full suite command** | `pnpm check:migrations && pnpm check:evidence-contract && pnpm check:audit-readiness && pnpm check:publication-gate && pnpm check:public-boundary -- --all && pnpm check:library && pnpm lint && pnpm build && pnpm test:e2e:desktop && pnpm test:e2e:mobile` |
| **Estimated runtime** | quick target <30 seconds; full ~5–10 minutes |

## Sampling Rate

- **After every task commit:** Run the task-specific contract command from the map below.
- **After every plan wave:** Run migration, evidence, audit, publication and public-boundary contract suites through the current wave.
- **Before `$gsd-verify-work`:** The full suite and the immutable real-inventory audit must be green.
- **Max feedback latency:** 30 seconds for task-level fixture checks.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | AUD-01, AUD-04 | T-19-01 | Real catalog adapter exposes no write path and rejects remote URLs | adapter/snapshot | `pnpm check:audit-readiness -- --readonly-isolation` | ❌ W0 | ⬜ pending |
| 19-01-02 | 01 | 1 | AUD-01, QA-01 | T-19-02 | Fixtures own disposable DBs and preserve real main/WAL/SHM | harness | `pnpm check:audit-readiness -- --fixture-isolation` | ❌ W0 | ⬜ pending |
| 19-02-01 | 02 | 2 | EVID-01, EVID-02, EVID-03, EVID-04, EVID-05, EVID-06 | T-19-03 | Schema expresses field evidence, source groups, scope, conflicts and four hash-bound reviews | migration/schema | `pnpm check:evidence-contract -- --schema` | ❌ W0 | ⬜ pending |
| 19-02-02 | 02 | 2 | EVID-02, EVID-05 | T-19-03 | Migration 031 invalidates v1 review without editing 030 or granting publication | migration/upgrade | `pnpm check:evidence-contract -- --migration` | ❌ W0 | ⬜ pending |
| 19-03-01 | 03 | 3 | EVID-01, EVID-02, EVID-03, EVID-04 | T-19-04 | Every v2 payload dependency changes the content hash and invalidates stale review | DB mutation | `pnpm check:evidence-contract -- --hash-invalidation` | ❌ W0 | ⬜ pending |
| 19-03-02 | 03 | 3 | EVID-05, EVID-06, AUD-02, AUD-03 | T-19-05 | Any hard blocker prevents direct SQL and transactional publication; a complete fixture publishes atomically | transaction/readiness | `pnpm check:evidence-contract -- --readiness-publish` | ❌ W0 | ⬜ pending |
| 19-04-01 | 04 | 4 | AUD-01, AUD-02, AUD-03 | T-19-06 | Canonical audit starts from every raw brand/pen and emits exactly one disposition per identity | audit contract | `pnpm check:audit-readiness -- --inventory` | ❌ W0 | ⬜ pending |
| 19-04-02 | 04 | 4 | AUD-01, AUD-04 | T-19-06 | NDJSON/CSV identity sets and hashes are deterministic; `--limit` changes console only | serialization/property | `pnpm check:audit-readiness -- --artifacts-limit` | ❌ W0 | ⬜ pending |
| 19-04-03 | 04 | 4 | AUD-02, AUD-03 | T-19-07 | Deprecated/pending/needs_source/candidate data cannot increase qualifying coverage or offset blockers | compatibility | `pnpm check:audit-readiness -- --legacy-audits` | ❌ W0 | ⬜ pending |
| 19-05-01 | 05 | 5 | QA-01, EVID-01, EVID-03, EVID-04, EVID-06 | T-19-08 | Every required negative fixture fails with its exact blocker and complete brand/pen fixtures pass | fixture matrix | `pnpm check:evidence-contract -- --all` | ❌ W0 | ⬜ pending |
| 19-05-02 | 05 | 5 | AUD-01, AUD-04 | T-19-01, T-19-06 | Immutable catalog audit proves 69+236=305, legacy 65+231, all extra nine and every made_by disposition | real read-only audit | `pnpm audit:readiness-v2 -- --inventory-only --verify-baseline` | ❌ W0 | ⬜ pending |
| 19-05-03 | 05 | 5 | AUD-05, QA-01 | T-19-09 | Published blockers are zero and every public surface matches the sole `public_entities` set | parity/regression | `pnpm check:publication-gate && pnpm check:public-boundary -- --all` | ✅ existing; extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

## Wave 0 Requirements

- [ ] `src/lib/audit/readiness-audit.ts` — explicit read-only DB adapter boundary and complete in-memory audit result.
- [ ] `scripts/check-audit-readiness.ts` — disposable inventory, artifact, `--limit`, isolation and legacy-status fixtures.
- [ ] `scripts/check-evidence-contract.ts` — migration 031, field evidence, source group, scope, conflict, review, hash and publish fixtures.
- [ ] Shared fixture builders for primary/archive, professional secondary, mirrors, scopes, conflicts and four review kinds.
- [ ] `package.json` scripts: `check:evidence-contract`, `check:audit-readiness`, `audit:readiness-v2`.
- [ ] Real-catalog snapshot assertion covering main, WAL and SHM without deleting pre-existing sidecars.

No new test framework or package installation is required.

## Manual-Only Verifications

All Phase 19 behavior has automated verification. Remote Turso, Vercel deployment, production browsing and final content review are explicitly deferred to Phase 26 and are not manual acceptance criteria for this phase.

## Validation Sign-Off

- [x] Every anticipated task has an automated command or explicit Wave 0 seam.
- [x] Sampling continuity: no three consecutive tasks lack automated verification.
- [x] Wave 0 covers every currently missing command/file.
- [x] No watch-mode flags.
- [x] Task feedback target is under 30 seconds.
- [x] `nyquist_compliant: true` is set in frontmatter.

**Approval:** pending execution evidence
