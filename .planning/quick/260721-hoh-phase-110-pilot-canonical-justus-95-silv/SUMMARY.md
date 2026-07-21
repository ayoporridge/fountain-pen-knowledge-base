---
phase: quick
plan: 260721-hoh
subsystem: content-publication
tags: [pilot, canonical-identity, contract-v3, sqlite, curated-content]
requires:
  - phase: 84
    provides: complete Pilot brand-first publication fixture
  - phase: 106
    provides: topology invalidation and current-hash review pattern
provides:
  - Pilot Justus 95, Silvern, and Grance canonical sourced pages
  - Exact identity/SKU/source-URL collision preflight
  - Post-topology Pilot brand review and publication recovery without pack replay
affects: [pilot-brand-navigation, phase-23-content]
tech-stack:
  added: []
  patterns: [caller-owned checkpoint apply, exact topology hash validation, embedded reviewed copy]
key-files:
  created:
    - scripts/data/phase110-pilot-justus-95-silvern-grance.ts
    - scripts/apply-phase110-pilot-justus-95-silvern-grance-content.ts
    - tests/content/phase110-pilot-justus-95-silvern-grance.test.ts
    - public/images/library/site-original/phase110/pilot/pilot-justus-95.svg
    - public/images/library/site-original/phase110/pilot/pilot-silvern.svg
    - public/images/library/site-original/phase110/pilot/pilot-grance.svg
  modified: []
key-decisions:
  - "Pilot brand contract hash is expected to change when the three exact made_by links enter topology, while all non-topology Phase 84 payload and source markers remain unchanged."
  - "A missing or altered Phase 110 made_by link is terminal drift and fails closed; apply never repairs it or replays the Pilot brand pack."
requirements-completed: [QUICK-260721-HOH]
coverage:
  - id: D1
    description: Three sourced canonical Pilot pen pages with exact boundaries and unique factual SVGs
    requirement: QUICK-260721-HOH
    verification:
      - kind: integration
        ref: node --import tsx --test tests/content/phase110-pilot-justus-95-silvern-grance.test.ts
        status: pass
    human_judgment: false
  - id: D2
    description: Pilot post-topology hash review, publication recovery, noop replay, and tamper rejection
    requirement: QUICK-260721-HOH
    verification:
      - kind: integration
        ref: tests/content/phase110-pilot-justus-95-silvern-grance.test.ts
        status: pass
    human_judgment: false
duration: 24min
completed: 2026-07-21
status: complete
---

# Phase 110: Pilot Justus 95, Silvern and Grance Summary

**三个 Pilot 当前型号以独立 canonical identity、2,000+ 字来源化正文和型号专属事实图发布，并在不 replay 品牌内容的前提下安全恢复 topology 改变后的 Pilot public contract。**

## Performance

- **Duration:** 24 min
- **Started:** 2026-07-21T04:50:53Z
- **Completed:** 2026-07-21T05:14:00Z
- **Tasks:** 3
- **Files modified:** 6 product files plus this summary

## Accomplishments

- 新增 `phase110-pilot-justus-95`／`pilot-justus-95`、`phase110-pilot-silvern`／`pilot-silvern`、`phase110-pilot-grance`／`pilot-grance`，每页唯一 `made_by -> Zt-PbXkE7UHM`。
- 三份 embedded reviewed copy 均超过 2,000 Unicode 字符，具有 qualified official + professional-secondary evidence、current spec evidence、结构化 sample/special/historical scopes 和唯一 primary SVG。
- Pilot brand 的 entity/story/reference/spec/media/source-marker 在 topology transaction 前后保持不变；contract hash 因三条 canonical links 合法改变，随后 fact/language/media approvals 精确绑定新 hash，并由 `publishEntity` 恢复公开。
- 第二次 apply 返回三个 noop；删除 Justus 95 maker link 后 Pilot hash 再次漂移，apply 以 exact topology mismatch fail closed，不修复 link、不 replay brand pack。

## Live Source Verification

- Pilot warranty index：`https://www.pilot.co.jp/support/warranty/en/fountain/index.html`，执行日可读，列出 Justus 95 FJ-3MR/FJ-3MRR、Silvern FK-5MS、GRANCE FGRC-12SR。
- Justus 95 warranty/use-care：`https://www.pilot.co.jp/support/warranty/en/fountain/justus95.html`，确认 H/S、CON-70N/CON-40；current catalog：`itemID=t000100000295`。
- Silvern current catalog：`itemID=t000100000300`，确认 FK-5MS、sterling silver、18K inset nib、CON-40、KO/TU/ID；Pilot catalog PDF：`fileID=t010000016469`。
- Grance current catalog：`itemID=t000100000289`，确认 FGRC-12SR、14K No.3、CON-40 与 current variants；warranty：`/support/warranty/en-au/fountain/grance_2.html`。
- 独立来源：Tim Hofmann 2019、Scrively 2019、Pencilcase 2014 indexed review；The Pen Addict Silvern 2024 loaned Jaguar；The Pen Addict Grance 2018 no-charge sample；Well-Appointed Desk Grance 2019 free sample。Pencilcase direct page 返回 403，因此仅作为诚实标注的 indexed sample metadata，不承担 current spec。

## Identity Preflight

首次写入前，受保护 catalog 以 immutable read-only inventory 核验：三个 stable IDs/slugs、canonical/common exact names、aliases、FJ-3MR/FJ-3MRR/FK-5MS/FGRC-12SR、型号专属 official URLs 均无 alternate exact identity。共享 warranty index/PDF 只作为 evidence，不作为 identity-unique URL marker。

## Source and Model Boundaries

- **Justus 95:** H/S 只解释 tension/书写感变化，不保证 traditional flex 或固定 line variation；Tim Hofmann、Scrively、Pencilcase 各自保留样本、作者、日期和尖宽语境。
- **Silvern:** current variants 只含 FK-5MS 的格子、つむぎ、石だたみ F/M；Jaguar loaned sample 与 Dragon/Turtle/Pokémon 等 special editions 不进入 standard variants。
- **Grance:** current canonical 只含 FGRC-12SR；The Pen Addict 与 Well-Appointed Desk 的 gifted/free samples 不覆盖官网规格，旧 sterling/marbled families 只保留 historical-family boundary。

## Verification

- `node --import tsx --test tests/content/phase110-pilot-justus-95-silvern-grance.test.ts` — PASS, 2/2, caller-owned copies only
- `pnpm exec tsc --noEmit --pretty false` — PASS
- scoped `pnpm exec biome check` for the three TypeScript files — PASS
- `xmllint --noout` for all three SVGs — PASS
- owned and cached `git diff --check` — PASS
- exact cached and post-commit six-file path-set comparison — PASS
- protected `data/fpkg.db` main/WAL/SHM snapshot — unchanged; immutable `PRAGMA quick_check` returned `ok`

## Product Commit

- `6ade2f1` — `feat(content): publish Pilot Justus 95 Silvern and Grance`
- Commit contains exactly the six planned product files. PLAN.md and SUMMARY.md are absent from the product commit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed repository-root reviewed-copy materialization**

- **Found during:** Final verification after the first product commit
- **Issue:** A test assertion called `loadPhase110PilotPacks(ROOT)`, creating `phase110-content/` in the repository rather than the caller-owned fixture.
- **Fix:** Changed the assertion to use `ownedRoot`, removed only the three generated Markdown files and their empty directory, reran the full verification chain, then amended the owned product commit.
- **Files modified:** `tests/content/phase110-pilot-justus-95-silvern-grance.test.ts`
- **Verification:** focused integration, TypeScript, scoped Biome, XML and exact path-set checks all passed
- **Committed in:** `6ade2f1`

**Total deviations:** 1 auto-fixed (Rule 1 bug)

## Known Stubs

None. No TODO/FIXME/placeholder or empty UI-flow payload exists in the six product files.

## Threat Flags

None beyond the plan threat register. The apply entry writes only to an explicitly authorized caller-owned local database copy and rejects remote selectors, wrong logical root, path aliases, client mismatch and unmigrated copies.

## Issues Encountered

The original plan incorrectly expected Pilot contract hash to remain unchanged after topology. PLAN.md was revised in place: exact canonical links are part of the contract hash, while non-topology payload remains unchanged. Execution resumed under that corrected contract and passed.

## User Setup Required

None.

## Next Phase Readiness

Phase 110 is a local caller-owned content delivery only. It does not claim completion of Pilot coverage, the Phase 23 content program, production migration or full-site acceptance.

## Self-Check: PASSED

- All six product files exist in commit `6ade2f1`.
- Commit path set is exactly the Phase 110 allowlist.
- SUMMARY exists outside the product commit.
- Git index is empty and unrelated dirty/untracked content remains untouched.

---
*Phase: quick / 260721-hoh*
*Completed: 2026-07-21*
