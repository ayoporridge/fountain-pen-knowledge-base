---
phase: quick
plan: 260719-9gh
subsystem: content-publication
tags: [sailor, 1911-standard, profit-standard, curated-content, media-provenance]
requires:
  - phase: 22
    provides: applyCuratedContentPacks and publication-readiness governance
provides:
  - publishable Sailor brand entry with catalog-family boundaries
  - canonical Sailor 1911 Standard / Profit Standard 11-1219 entry
  - honest site-original 14K editorial media and CC BY 2.0 21K sibling comparison
affects: [brand-browse, pen-detail, entity-redirects, future-sailor-model-packs]
tech-stack:
  added: []
  patterns:
    - canonical slug migration with collision preflight and rollback on apply failure
    - disposable checkpoint-copy publication test with protected catalog snapshot
key-files:
  created:
    - .planning/content-research/sailor-brand-publishable-content-2026-07-19.md
    - .planning/content-research/sailor-1911-standard-1219-publishable-content-2026-07-19.md
    - public/images/library/site-original/sailor/sailor-1911-standard-14k-editorial.jpg
    - public/images/library/wikimedia/sailor/sailor-1911-standard-21k-zoom.jpg
    - scripts/data/phase29-sailor.ts
    - scripts/apply-phase29-sailor-content.ts
    - tests/content/phase29-sailor.test.ts
  modified:
    - src/lib/entity-redirects.ts
key-decisions:
  - "11-1219 alone is the canonical public 1911 Standard / Profit Standard; 11-1521, 11-1029, 11-2021/2024, Profit 14/18 and Pro Gear remain distinct identities."
  - "The AI-assisted site-original illustration is primary media only with explicit non-product disclaimers; the CC BY 2.0 21K Zoom photo is gallery-only sibling evidence."
  - "Prices are a dated 2026-07-19 Japanese official-site snapshot, not a global or permanent market price."
metrics:
  duration: 40m
  completed: 2026-07-19
status: complete
commit: dabebc1
---

# Quick Plan 260719-9gh: Sailor Canonical 1911 Standard Summary

Sailor 品牌与 11-1219 已形成来源化、可重复执行的发布包：现行 14K 规格、三色七尖号、地区命名、目录换代及 21K／Pro Gear 边界均显式建模，且媒体不会冒充产品实拍。

## Performance

- **Duration:** 40m
- **Started:** 2026-07-19 06:48 CST
- **Completed:** 2026-07-19 07:28 CST
- **Tasks:** 3
- **Files created:** 7
- **Files modified:** 1

## Accomplishments

- 完成 Sailor 品牌长文，覆盖 1911、1917、1954／1958、1969、1981 及 2025—2026 目录换代，并拆清 Profit／1911、Professional Gear、Realo、四季织和长刀研。
- 将现有 `GXGa7rK83Jmi` 规范化为 `Sailor 1911 Standard / Profit Standard` 与 `sailor-1911-standard`，旧中文 slug 保留静态重定向。
- 精确落库 11-1219 的 14K 中型尖、Sailor 墨囊／上墨器、PMMA、Gold IP、φ17 × 135 mm、17.0 g、三色七尖号及日期化日本价格。
- 生成无 logo、无刻字的站内原创 14K 语境编辑插画，并把 Mehmet Pinarci 的 CC BY 2.0 21K Zoom 原图限制为 11-1521 兄弟款画廊对照。
- disposable checkpoint copy 回归确认只发布 Sailor 品牌和 11-1219；其余 11 个 Sailor raw 型号仍为 draft，重复执行为 `noop`，真实 catalog main/WAL/SHM 不变。

## Task Commits

`dabebc1 feat(content): publish Sailor and 1911 Standard`

## Files Created/Modified

- `.planning/content-research/sailor-brand-publishable-content-2026-07-19.md` — Sailor 历史、产品家族和 2025—2026 目录边界。
- `.planning/content-research/sailor-1911-standard-1219-publishable-content-2026-07-19.md` — 11-1219 规格、相邻型号、价格、维护与媒体声明。
- `scripts/data/phase29-sailor.ts` — 两个 typed curated entity packs、来源、证据、规格、版本、时间线和媒体。
- `scripts/apply-phase29-sailor-content.ts` — slug 冲突预检、canonical 改名、失败恢复及共享 helper 调用。
- `src/lib/entity-redirects.ts` — 旧中文 11-1219 slug 到 canonical 路径的重定向。
- `tests/content/phase29-sailor.test.ts` — disposable-copy 发布、边界、媒体、唯一关系和 replay 验收。
- `public/images/library/site-original/sailor/sailor-1911-standard-14k-editorial.jpg` — AI 辅助站内原创，非产品实拍。
- `public/images/library/wikimedia/sailor/sailor-1911-standard-21k-zoom.jpg` — Commons 原图，CC BY 2.0，兄弟款画廊对照。

## Decisions Made

- 使用商品家族代码 `11-1219` 锁定 canonical 身份；地区名 Profit Standard 与 1911 S 可合并，只有相邻外形或金含量的型号不能合并。
- 不填未知的 11-1219 首发年份，也不把 2025 新 Profit 14／18 自译成“1911 14／18”。
- 11-1521 Commons 图保持原始 3264×2448 文件，不缩放、不裁切、不调色，且永不设为 11-1219 primary media。
- 品牌页不写死最终公开型号数量，由 public `made_by` 反向关系随后续批次增长。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical evidence wiring] 将专业二手来源挂入合格 core claim**

- **Found during:** Task 3 targeted publication test
- **Issue:** Pen Addict 已列入来源表，但没有进入 core-claim evidence，publication readiness 正确报出 `missing_professional_secondary_group`。
- **Fix:** 分别把其品牌家族判断和 11-1219 小型 14K／大型 21K 架构比较挂到带单支样本及免费评测笔披露的 evidence scope。
- **Files modified:** `scripts/data/phase29-sailor.ts`
- **Commit:** `dabebc1`

## Verification

- `node --import tsx --test tests/content/phase29-sailor.test.ts` — PASS
- `pnpm exec tsc --noEmit` — PASS
- `pnpm exec biome check scripts/data/phase29-sailor.ts scripts/apply-phase29-sailor-content.ts tests/content/phase29-sailor.test.ts src/lib/entity-redirects.ts` — PASS（Biome 配置检查 2 个纳入文件；scripts 由 TypeScript/build 覆盖）
- `pnpm build` — PASS，Next.js 15.5.18 production build 生成 18 个静态页面
- 视觉核验 — PASS：AI 编辑图无 Sailor logo／文字／可验证刻字；Commons 图吊牌显示 `11-1521-720`，与 21K Zoom 兄弟款声明一致
- SHA-256：编辑图 `33a7eff2b308594a378d2d643d590c66230f9165431850e09cab137cecf87579`
- SHA-256：Commons 图 `b21d437e960e2417e2aa6290ba9b68855c53776bf41e3bce5fd9ad6ddaa032e3`

## Known Stubs

None.

## Threat Flags

None. 本计划没有新增 endpoint、认证路径、外部写入、schema 或文件上传面；所有数据库写验证均限制在 owned disposable copy。

## Next Phase Readiness

- 其余 11 个 Sailor raw 型号仍保持 draft，可按 11-1521、11-1029、11-2021/2024、Profit 14/18 与 Professional Gear 各自商品代码逐页扩容。
- 当前无内容或验证 blocker；仅剩共享 Git index 协调后的精确提交与 commit self-check。

## Self-Check: PASSED

- `dabebc1` 精确包含两份 research、两张媒体、Phase 29 data／wrapper／test 与一个旧 slug redirect；没有包含 Pelikan、Parker、Montblanc、PLAN、SUMMARY 或 STATE 文件。
- 所有实现文件与媒体均存在，验证命令通过，Git content commit 已核对。
