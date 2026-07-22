---
phase: quick
plan: 260722-awm
subsystem: content-publication
tags: [wancher, shizuku, glass-nib, scoped-evidence, sqlite, publication]
requires:
  - phase: quick-260722-adq
    provides: Published Wancher brand, protected Dream Pen models, and Phase 119 PuChiCo baseline
provides:
  - One canonical Wancher Shizuku Glass Nib Fountain Pen with fourteen retrieved-listing variants
  - Separate family, Solis exact-current, and 2019 Earth supplied-sample evidence scopes
  - Caller-owned checkpoint apply with Wancher post-topology current-hash review and guarded noop
affects: [wancher-navigation, phase23-content-corpus, publication-contract-v3]
tech-stack:
  added: []
  patterns: [single-canonical-pen-with-listing-variants, scope-qualified-exact-specs, post-topology-current-hash-republish]
key-files:
  created:
    - .planning/content-research/wancher-shizuku-glass-nib-phase120.md
    - scripts/data/phase120-wancher-shizuku-glass-nib.ts
    - scripts/apply-phase120-wancher-shizuku-glass-nib-content.ts
    - tests/content/phase120-wancher-shizuku-glass-nib.test.ts
    - public/images/library/site-original/phase120/wancher/wancher-shizuku-glass-nib.svg
  modified: []
key-decisions:
  - "Keep all fourteen official cards as variants of one locked Shizuku pen; repeated renders and AS IS/outlet cards are excluded."
  - "Bind Solis exact fields only to the Solis scope and retain the 2019 Earth observations as rejected current-spec evidence."
  - "Republish Wancher only through recordEntityContentReview plus publishEntity against its post-topology current hash; do not replay a brand pack."
patterns-established:
  - "Same-name current listing and historical sample are disambiguated by source, date, scope, and qualification rather than by creating sibling entities."
requirements-completed: [QUICK-260722-AWM]
coverage:
  - id: D1
    description: One canonical Shizuku pen with fourteen official retrieved-listing variants and exact Wancher topology
    requirement: QUICK-260722-AWM
    verification:
      - kind: integration
        ref: tests/content/phase120-wancher-shizuku-glass-nib.test.ts
        status: pass
    human_judgment: false
  - id: D2
    description: Family, Solis exact-current, and 2019 Earth sample/history facts remain structurally isolated
    requirement: QUICK-260722-AWM
    verification:
      - kind: integration
        ref: tests/content/phase120-wancher-shizuku-glass-nib.test.ts
        status: pass
    human_judgment: false
  - id: D3
    description: Caller-owned checkpoint publication preserves the real catalog and protected Wancher entities
    requirement: QUICK-260722-AWM
    verification:
      - kind: integration
        ref: tests/content/phase120-wancher-shizuku-glass-nib.test.ts
        status: pass
    human_judgment: false
duration: 18min
completed: 2026-07-22
status: complete
---

# Quick 260722-awm: Wancher Shizuku Glass Nib Fountain Pen Summary

**一个 canonical Shizuku 页面承载十四张官网卡片，同时用独立 scope 保留 Solis 当前精确规格与 2019 Earth 受赠样品实测。**

## Accomplishments

- 发布锁定 identity `phase120-wancher-shizuku-glass-nib`／`wancher-shizuku-glass-nib`／`Wancher Shizuku Glass Nib Fountain Pen`；Solis、Earth 与其余卡片均未成为 sibling entities。
- 2026-07-22 官方 collection 的十四个去重名称成为 `retrieved-listing` variants：Black Eye、Orion Nebula、Eclipse、Solis、Blue Moon、Adrastea、Mars、Pluto、Andromeda、Gaia、Saturn、Jupiter、Earth、Venus。重复 image/title render 与 AS IS/outlet 排除；sold-out/availability 仅为 mutable snapshot。
- 将 family facts、Solis exact current 与 Susan M. Pigott 2019-08-30 Wancher-free-supplied Earth sample 拆为三个 citation-locator-scope chains；2019 样品尺寸、重量、结构、写感、preorder 名单与价格均不具备 current spec 资格。
- 新增唯一 Shizuku → Wancher `made_by` 与 Wancher → Shizuku `reverse`；Wancher non-topology payload 保持不变，pre/post content hash 在 checkpoint regression 中精确验证为发生变化，post-topology hash 的 fact/language/media/publication reviews 完整，且未 replay Phase 107 brand pack。

## Sources and Scope

- Official family/current-card source: `https://www.wancherpen.com/collections/shizuku-pen/keiryu`，resolved canonical `https://www.wancherpen.com/collections/shizuku-pen`，retrieved `2026-07-22`，independence group `wancher-official`。
- Solis exact source: `https://www.wancherpen.com/products/shizuku-pen-solis`，retrieved `2026-07-22`，同属 `wancher-official`；仅支持 Solis 的 Duralumin、screw cap、clear/black、EF/F/M、154/128 mm、12 mm、约 25 g 与 international converter。
- Professional secondary: Susan M. Pigott, The Pen Addict, posted `2019-08-30`, `https://www.penaddict.com/blog/2019/8/30/wancher-shizuku-glass-nib-fountain-pen-a-review`；Wancher 免费提供 Earth 样品，所有实测均为 dated sample/history。
- Scope keys: `phase120-shizuku-official-family-current-card-2026-07-22`、`phase120-shizuku-solis-exact-current-2026-07-22`、`phase120-shizuku-earth-supplied-sample-2019-08-30`。

## Publication and Hash Contract

- 所有 migration、prerequisite apply、Phase 120 apply、review、publish、noop、tamper 与查询写入只发生在一个 caller-owned checkpoint copy；`data/fpkg.db` main/WAL/SHM before/after snapshot 相等。
- Wancher pre-topology/current post-topology hashes由 `computePublicationContentHash` 在 regression 中计算并断言不同；brand publication 的 approved hash 精确等于 post-topology current hash。
- target 首次 apply 返回 `published`，pristine replay 返回 exact `noop`；删除 Earth variant 后 terminal validation fail closed，失败前后 owned digest 相等。
- Phase 104 article、Phase 107 True Ebonite、Phase 112 Titanium Black、Phase 113 Aka Tamenuri 与 Phase 119 PuChiCo full digests/publications 前后相等。

## Verification

- `node --import tsx --test tests/content/phase120-wancher-shizuku-glass-nib.test.ts` — PASS（1 test，single setup，57.8 s）。
- `pnpm exec tsc --noEmit --pretty false` — PASS。
- `pnpm exec biome check scripts/data/phase120-wancher-shizuku-glass-nib.ts scripts/apply-phase120-wancher-shizuku-glass-nib-content.ts tests/content/phase120-wancher-shizuku-glass-nib.test.ts` — PASS；repo ignore rules令 Biome报告1个适用文件，无修复。
- `xmllint --noout public/images/library/site-original/phase120/wancher/wancher-shizuku-glass-nib.svg` — PASS。
- `git diff --check -- <five owned paths>` 与 cached path/no-deletion audit — PASS。
- SVG SHA-256 `a28a02c2f721d18960e0783d49a748a5a740cc4b17293c830c413e93c8f40472`，不同于 Phase 107/112/113/119 四张 Wancher SVG。

## Product Commit

- `7ddd49b` — `feat(content): publish Wancher Shizuku Glass Nib Fountain Pen`
- `git show --name-only --format= 7ddd49b` 精确列出 PLAN frontmatter 的五个产品路径；无 PLAN、SUMMARY、STATE、ROADMAP 或 unrelated worktree 内容。

## Deviations from Plan

None - plan executed within the five-path product boundary. The regression remains phase-local and no shared runner, readiness, Playwright, search, LLM, schema, migration, or package files changed.

## Partial-Batch Status

本次只补齐一个缺失 Wancher 型号，是 full corpus goal 的 partial batch。full corpus 仍为 active；未执行 production catalog rollout、全站验收或其它型号扩展。

## Self-Check: PASSED

五个产品文件与产品 commit `7ddd49b` 均存在；SUMMARY 在产品 commit 之后创建，`status: complete`，按要求保持未提交。STATE 与 ROADMAP 未更新。
