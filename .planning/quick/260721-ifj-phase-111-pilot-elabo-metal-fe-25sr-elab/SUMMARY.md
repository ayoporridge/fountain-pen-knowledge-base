---
phase: quick
plan: 260721-ifj
subsystem: content-publication
tags: [pilot, elabo, custom-ns, lightive, canonical-identity, contract-v3, sqlite]
requires:
  - phase: 84
    provides: complete Pilot brand-first publication fixture
  - phase: 110
    provides: post-topology Pilot current-hash review, publication recovery, and terminal noop pattern
provides:
  - Four distinct Pilot canonical pages for Elabo metal FE-25SR, Elabo resin FE-18SR, Custom NS FKNS-1, and Lightive P-FLT-1
  - Legacy generic Elabo/Falcon ambiguity and exact identity/SKU/source collision preflight
  - Four-link Pilot topology recovery without brand pack replay
affects: [pilot-brand-navigation, phase-23-content, pilot-current-catalog]
tech-stack:
  added: []
  patterns: [caller-owned checkpoint apply, verified repo alias/canonical pair, exact topology hash validation, embedded reviewed copy]
key-files:
  created:
    - scripts/data/phase111-pilot-elabo-metal-resin-custom-ns-lightive.ts
    - scripts/apply-phase111-pilot-elabo-metal-resin-custom-ns-lightive-content.ts
    - tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts
    - public/images/library/site-original/phase111/pilot/pilot-elabo-metal-fe-25sr.svg
    - public/images/library/site-original/phase111/pilot/pilot-elabo-resin-fe-18sr.svg
    - public/images/library/site-original/phase111/pilot/pilot-custom-ns.svg
    - public/images/library/site-original/phase111/pilot/pilot-lightive.svg
  modified: []
key-decisions:
  - "Elabo metal FE-25SR and resin FE-18SR remain sibling canonical pages; generic pilot-elabo, Elabo, Falcon, and elabopen0001 are ambiguity failures rather than aliases or redirects."
  - "The verified CodeBuddy alias and Documents canonical git root are one allowed repo authority pair, while database authority remains strictly protected by realpath, inode, sidecar snapshots, and caller-owned containment."
  - "Pilot brand non-topology Phase 84 payload remains unchanged while four exact made_by links change the contract hash; approvals bind the post-topology current hash without replaying the brand pack."
requirements-completed: [QUICK-260721-IFJ]
coverage:
  - id: D1
    description: Four evidence-complete current Pilot pages with distinct identity, sample scopes, and unique primary SVGs
    requirement: QUICK-260721-IFJ
    verification:
      - kind: integration
        ref: tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts#publishes-four-exact-new-pages
        status: pass
    human_judgment: false
  - id: D2
    description: Exact legacy/collision preflight and protected caller-owned database authority
    requirement: QUICK-260721-IFJ
    verification:
      - kind: integration
        ref: tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts#collision-and-authority-failures
        status: pass
    human_judgment: false
  - id: D3
    description: Pilot post-topology review/publication recovery, target publication, terminal noop, and tamper rejection
    requirement: QUICK-260721-IFJ
    verification:
      - kind: integration
        ref: node --import tsx --test tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts
        status: pass
    human_judgment: false
duration: 32min
completed: 2026-07-21
status: complete
---

# Phase 111: Pilot Elabo siblings, Custom NS and Lightive Summary

**四个 Pilot current 型号以互不吞并的 canonical identity、2,800+ 字来源化正文和四张独立事实图发布，并在不 replay 品牌内容的前提下恢复四条 topology 改变后的 Pilot public contract。**

## Performance

- **Duration:** 32 min
- **Started:** 2026-07-21T05:13:00Z
- **Completed:** 2026-07-21T05:45:07Z
- **Tasks:** 3
- **Files modified:** 7 product files plus this summary

## Accomplishments

- 新增 `phase111-pilot-elabo-metal-fe-25sr`、`phase111-pilot-elabo-resin-fe-18sr`、`phase111-pilot-custom-ns`、`phase111-pilot-lightive` 四个 stable IDs 与独立 canonical slugs；每页仅有一条 `made_by -> Zt-PbXkE7UHM`。
- 四份正文分别为 2,804、2,852、2,906、2,921 Unicode 字符，均具 qualified official + professional-secondary evidence、current spec evidence、dated sample/update scopes 与唯一 approved primary SVG。
- Pilot brand 的 entity/story/reference/spec/media/source-marker 在 topology transaction 前后保持不变；contract hash 因四条 canonical links 合法改变，fact/language/media approvals 绑定 post-topology current hash，并由 `publishEntity` 恢复公开。
- 第二次 apply 返回四个 noop；maker、identity/source marker、review/publication 或 terminal state 漂移时 fail closed，不修复、不重审、不重放 pack。

## Task Commits

计划要求三个任务形成一个精确产品提交：

- `8aa668d` — `feat(content): publish Pilot Elabo siblings Custom NS and Lightive`

`git show --name-only --format=` 证明提交只包含计划的七个产品路径；PLAN.md、SUMMARY.md 和其它 docs 均不在产品提交中。

## Live Source Verification

- Pilot exact catalog PDFs：FE-25SR `fileID=t010000016447`、FE-18SR `fileID=t010000016450`、Custom NS `fileID=t010000016458`、Lightive `fileID=t010000016927`。前两个 direct automated fetch 返回 access-denied 页面，但搜索索引可读取同一 exact fileID 的产品号、材料、converter、尺寸和重量；后两个 PDF 可直接读取。
- Elabo warranty：`/support/warranty/en/fountain/elabo.html` 精确列 FE-25SR 与 CON-40/CON-70N；`elabo_2.html` 精确列 FE-18SR/FE-18SRG 与 CON-40。
- Metal independent evidence：The Pen Addict 2013 保留 Thomas-owned SEF loan context；Pencilcase 2015 保留 Pilot free-of-charge sample、33g、CON-70 与 not-true-flex 边界。
- Resin independent evidence：fpen149 2024 保留作者自购 FE-18SR SEF、CON-40 和个人写感；embedded customized Namiki video 与 FA nib 被明确排除。
- Custom NS independent evidence：Pencilcase 2020 的 Casa Della Stilografica sent sample、旧颜色、价格、CON-40 与体验只进入 `professional_sample_2020_pre_refresh`。
- Lightive independent evidence：kamitopen 将 2021 active-yellow 样本、2025/2026 author update 与一年 dry test 分成三个 scopes；实验不写成 Pilot guarantee。

## Identity and Legacy Ambiguity

- FE-25SR 与 FE-18SR 只共享 Elabo/Falcon 地区命名背景，不共享 canonical route、材料、重量、converter、颜色或 product code。
- `pilot-elabo`、`百乐 Pilot Elabo`、unqualified `Elabo`／`Falcon` 与 `elabopen0001` 是首写前 ambiguity markers；任何 live candidate 都返回带 candidate ID/type/slug/locator 的错误，不 merge、retire、redirect 或选择 survivor。
- exact normalized name/slug、alias、market SKU 与四个 model-unique source URLs 跨 catalog inventory 检查；共享 category/warranty evidence 不作为 identity-unique marker。

## Brand Hash, Review and No-Replay

- Phase 84 Pilot brand-first fixture 在 Phase 111 before-snapshot 前已 published 且 readiness=1。
- identity/topology transaction 只建立四 targets 与四条 pen-to-Pilot links；Pilot non-topology payload在 transaction 前后 byte/logical equal，Phase 84 source marker 未改。
- Pilot current contract hash 必须从 pre-topology 值变化为 exact four-link post-topology 值；fact/language/media approvals 和 publication review 均绑定该 current hash，再由 `publishEntity` 恢复品牌。
- apply 不调用 Phase 84 loader，也不直接写 review/lifecycle/public tables。第二次执行先核对 brand/targets 的 current hashes、四类 reviews、readiness/public membership、source markers、primary media 与 maker links，全部精确才返回四 noop。

## Protected Catalog and Repo Authority

- `data/fpkg.db` main/WAL/SHM 在每个测试 finally 后与 before snapshot 完全一致；所有 migration、fixture、apply、tamper 与 replay 只发生在 caller-owned temp checkpoint copies。
- CodeBuddy alias `/Users/xz/CodeBuddy/fountain-pen-graph` 与 canonical root `/Users/xz/Documents/fountain-pen-graph` 均通过 realpath + git-root 证明；第三个 root、remote env、空 reviewer、outside-root、protected path/inode、symlink/hard-link、client mismatch 与未迁移 copy 均首写前拒绝。

## Verification

- `node --import tsx --test tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts` — PASS, 2/2, latest run 99.7s
- `pnpm exec tsc --noEmit --pretty false` — PASS
- plan-scoped `pnpm exec biome check` — PASS under the repository's configured includes
- `xmllint --noout` for all four SVGs — PASS
- cached and owned-path `git diff --check` — PASS
- exact cached and post-commit seven-file path-set comparisons — PASS
- protected `data/fpkg.db` main/WAL/SHM snapshot — unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Accepted explicit historical scopes without requiring “sample” in the key**

- **Found during:** focused integration verification
- **Issue:** the copied Phase 110 validator rejected `self_purchased_2024_sef` despite its explicit `productionState: historical`.
- **Fix:** validate the structured production state rather than grep the scope-key spelling.
- **Files modified:** apply script
- **Verification:** focused integration PASS 2/2
- **Committed in:** `8aa668d`

**2. [Rule 1 - Bug] Normalized the Custom NS editorial independence group**

- **Found during:** first publication transaction
- **Issue:** `customNs` introduced an uppercase character into a constrained lowercase source-registry independence group.
- **Fix:** normalize the phase-local diagram registry/independence key to lowercase.
- **Files modified:** data pack
- **Verification:** migration-032 source registry inserts PASS
- **Committed in:** `8aa668d`

**3. [Rule 1 - Bug] Aligned fact-scope keys with claim evidence lookups**

- **Found during:** pack installation
- **Issue:** descriptive scope keys differed from `scopeKey`, so claim evidence could not resolve its scope ID.
- **Fix:** use the declared scope key as the phase-local persistence key, matching the established loader contract.
- **Files modified:** data pack
- **Verification:** all claims/citations/spec evidence installed and published in integration test
- **Committed in:** `8aa668d`

**4. [Rule 1 - Bug] Deduplicated shared category source entries**

- **Found during:** Custom NS/Lightive reference installation
- **Issue:** the shared Pilot category appeared twice when it served as both category and secondary official locator, violating unique entity/source/relation references.
- **Fix:** deduplicate phase-local sources by source key before adding each unique editorial diagram.
- **Files modified:** data pack
- **Verification:** four pack transactions and replay PASS
- **Committed in:** `8aa668d`

**5. [Rule 3 - Blocking] Explicitly staged the ignored owned data-pack path**

- **Found during:** exact product staging
- **Issue:** the repository's broad `data/` ignore pattern also matched the new `scripts/data/...` file, while prior phase files are already tracked.
- **Fix:** restored only this package's partial staging, force-added only the one planned ignored product path, then normally staged the other six and rechecked the exact allowlist.
- **Files modified:** none beyond the planned seven
- **Verification:** cached and post-commit path sets contain exactly seven paths
- **Committed in:** `8aa668d`

**Total deviations:** 5 auto-fixed (4 Rule 1 bugs, 1 Rule 3 blocking staging issue). No shared infrastructure or scope expansion.

## Known Stubs

None. No TODO/FIXME/placeholder, empty UI payload, or unwired data source exists in the seven product files.

## Threat Flags

None beyond the plan threat register. The only write surface is an explicitly authorized caller-owned local SQLite copy; remote selectors and protected catalog aliases fail closed.

## Issues Encountered

Biome's configured `files.includes` processes the Phase 111 test but excludes general `scripts/**`, matching existing Phase 110 command behavior. TypeScript still compiles both scripts, and runtime integration executes the data/apply paths end to end.

## User Setup Required

None.

## Next Phase Readiness

Phase 111 is a local caller-owned partial content batch. It does not claim completion of Pilot coverage, Phase 23, production migration, generic search/readiness, or full-site acceptance. Remaining Pilot and wider catalog work stays open.

## Self-Check: PASSED

- All seven product files exist in commit `8aa668d`.
- Commit path set is exactly the Phase 111 allowlist with zero deletions.
- SUMMARY exists outside the product commit.
- Git index is empty and unrelated dirty/untracked content remains untouched.

---
*Phase: quick / 260721-ifj*
*Completed: 2026-07-21*
