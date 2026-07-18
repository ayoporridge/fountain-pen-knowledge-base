---
phase: 20
slug: renderer
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-18
---

# Phase 20 — Validation Strategy

> 百科页面 Renderer 的反馈与验收契约。所有浏览器数据来自独立 disposable fixture；不得把 fixture 通过描述为真实 305 条内容已经发布。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright desktop/mobile + TypeScript contract tests |
| **Config file** | `playwright.config.ts`, `package.json` |
| **Quick run command** | `pnpm exec playwright test tests/e2e/renderer.spec.ts --project=desktop` |
| **Full suite command** | `pnpm exec playwright test tests/e2e/renderer.spec.ts --project=desktop --project=mobile && pnpm exec tsc --noEmit` |
| **Estimated runtime** | quick target <60 seconds; full target <3 minutes |

---

## Sampling Rate

- **After every task commit:** Run the narrowest renderer contract or browser case named by that task.
- **After every plan wave:** Run `pnpm exec playwright test tests/e2e/renderer.spec.ts --project=desktop --project=mobile`.
- **Before `$gsd-verify-work`:** Renderer desktop/mobile, TypeScript and changed-file Biome checks must be green; run the existing desktop publication-gate spec once as focused regression.
- **Max feedback latency:** 180 seconds. Do not use the Phase 19 monolithic wrapper in this phase.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | PAGE-02, PAGE-03, PAGE-05, PAGE-08 | T-20-01 | Slug/type remain bound parameters and `public_entities` is the only authorization anchor | contract | `pnpm exec playwright test tests/e2e/renderer.spec.ts --project=desktop --grep "page loader"` | ❌ W0 | ⬜ pending |
| 20-01-02 | 01 | 1 | PAGE-02, PAGE-03 | T-20-02 | Legacy, deprecated and unqualified sentinels never enter the page view model | contract | `pnpm exec playwright test tests/e2e/renderer.spec.ts --project=desktop --grep "qualified content"` | ❌ W0 | ⬜ pending |
| 20-02-01 | 02 | 2 | PAGE-01, PAGE-02, PAGE-04, PAGE-06 | T-20-03 | Server HTML renders only the expected published story and approved public data | browser | `pnpm exec playwright test tests/e2e/renderer.spec.ts --project=desktop --grep "encyclopedia content"` | ❌ W0 | ⬜ pending |
| 20-02-02 | 02 | 2 | PAGE-03, PAGE-05, PAGE-08 | T-20-04 | Optional unknown modules are omitted; media and canonical relations cannot silently fall back | browser | `pnpm exec playwright test tests/e2e/renderer.spec.ts --project=desktop --grep "evidence modules"` | ❌ W0 | ⬜ pending |
| 20-03-01 | 03 | 3 | PAGE-07 | T-20-05 | Headings, long URLs, tables, images and relations remain readable without whole-page overflow | browser | `pnpm exec playwright test tests/e2e/renderer.spec.ts --project=mobile` | ❌ W0 | ⬜ pending |
| 20-04-01 | 04 | 4 | PAGE-01–PAGE-08 | — | Phase 19 publication semantics and protected real inventory remain unchanged | regression | `pnpm exec playwright test tests/e2e/publication-gate.spec.ts --project=desktop` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/e2e/renderer.spec.ts` — isolated brand/pen fixture and PAGE-01–PAGE-08 assertions.
- [ ] Fixture data includes a published brand with 15 models, a published model, unique expected stories, qualified specs/sources/variants/media, and deliberately unqualified sentinels.
- [ ] Fixture cleanup owns only its generated IDs and database root; it does not reuse or modify Phase 19 lifecycle orchestration.
- [ ] Desktop and mobile projects both execute real brand and model renderer pages.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Desktop and mobile reading hierarchy is coherent | PAGE-07 | Automated assertions cannot fully judge reading hierarchy | Capture brand and model pages at desktop/mobile widths; verify summary, hero, story, facts, sources and relations appear in the specified order and no control obscures content. |
| Entity image visually matches the named brand/model | PAGE-05 | File metadata and ownership cannot prove visual identity | Inspect each fixture/production candidate image against the named entity and recorded attribution before publication. |

---

## Validation Sign-Off

- [x] All planned behaviors have an automated target or explicit Wave 0 dependency.
- [x] Sampling continuity has no three consecutive tasks without automated verification.
- [x] Wave 0 identifies every missing renderer fixture/test artifact.
- [x] Commands use no watch-mode flags.
- [x] Feedback target is under 180 seconds and excludes the monolithic wrapper.
- [x] `nyquist_compliant: true` is set in frontmatter.

**Approval:** strategy approved 2026-07-18; execution evidence pending
