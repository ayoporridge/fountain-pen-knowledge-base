---
phase: 22-montblanc-149
plan: "01"
subsystem: content
tags: [montblanc, meisterstuck-149, sourced-content, licensed-media, owned-copy]
requires:
  - phase: 21-taxonomy/21-04
    provides: guarded owned-copy publication substrate
provides:
  - first source-backed contract-v3 Montblanc brand and Meisterstuck 149 content pack
  - guarded idempotent application to an explicitly owned migrated catalog copy
  - local licensed Montblanc brand and 149 media with immutable provenance
affects: [23-montblanc-family, catalog-content, production-publication]
tech-stack:
  added: []
  patterns: [typed curated pack, archive locator, brand-before-model publication, protected-catalog snapshot]
key-files:
  created:
    - scripts/lib/curated-content-pack.ts
    - scripts/data/phase22-montblanc.ts
    - scripts/apply-phase22-content.ts
    - evidence/snapshots/montblanc/service-guide-wi-2024-gb.v1.json
  modified:
    - src/lib/public-media.ts
    - tests/content/phase22-montblanc.test.ts
key-decisions:
  - "Montblanc must publish before 149 so the model has one public made_by target and the brand page can expose the model link."
  - "Every source carries an honest immutable archive locator; the unarchived service PDF uses a paraphrase-only project evidence snapshot without pretending to be an independent archive."
  - "The dedicated Playwright runner was time-boxed and stopped before implementation because it would reopen the automation-boundary work; browser acceptance moves to the final production-page pass."
requirements-completed: [CONT-08]
duration: 55m
completed: 2026-07-19
status: partial
---

# Phase 22 Plan 01: Montblanc Brand and Meisterstück 149 Summary

万宝龙品牌页与 Meisterstück 149 已从空壳/短文状态变成第一组可重复写入的 A-tier 内容样板；隔离数据库中的品牌、型号、规格、来源、图片、证据与公开顺序均已通过。浏览器自动化没有继续扩建，留到批量内容进入生产后做一次真实页面验收。

## Accomplishments

- 完成万宝龙品牌正文与 149 正文，分别覆盖品牌入口、Meisterstück 家族边界、现行规格、历史代际、清洗维护和购买检查。
- 建立 11 个可追溯来源条目，包含 Montblanc 官方页面、Richemont、独立专业资料与 Wikimedia Commons；每个来源都有真实 archive URL 和 locator。
- 对无法取得外部归档的官方 Service Guide 保存仅含转述事实和页码定位的项目快照，不保存 PDF 原文或图片，也不把它伪装成独立来源组。
- 下载并核验 3 张可合法复用的本地图片：Montblanc Haus、1980 年代末 149 样本、149 笔尖；保留作者、许可、原始 SHA-1、本地 SHA-256 和改编说明。
- 在真实 catalog 的 checkpoint 副本上迁移到 032，先发布品牌再发布 149；两页 contract-v3 blocker 为 0，二次应用为 no-op，真实 catalog 主文件/WAL/SHM 快照保持不变。

## Commits

1. `eab3494` — 保存 Montblanc 来源快照与授权媒体证据。
2. `e5d0f0d` — 实现 typed content pack、隔离目录 applier 与品牌/149 发布闭环。

## Verification

- `pnpm exec tsx --test tests/content/phase22-montblanc.test.ts` — 1/1 passed，约 15 秒。
- `pnpm exec tsc --noEmit --pretty false` — passed。
- targeted Biome — passed。
- JSON、图片 MIME、尺寸、许可、SHA 与 `git diff --check` — passed。

## Deferred Browser Acceptance

计划中的 desktop/mobile Playwright 首次运行没有开始。现有 mobile `testMatch` 排除该 spec，默认 `webServer` 又固定启动 Phase 19 fixture；继续执行必须新增专用 runner/临时 config。鉴于用户已明确要求停止在自动化验收边界上耗时，本轮在时间盒内删除未验证 spec，不为单个样板扩建 runner。最终浏览器验收并入批量内容落库后的生产页面逐条复查，不将其误写为已通过。

## Next Content Work

- 146 的完整正文、9 个来源、规格证据、历史冲突与 CC BY 2.0 图片已完成并提交，等待下一批写入。
- 144 与历史 No.22 正在检索与撰写；当前目录缺失的 145 也已进入官方/专业资料研究。
- 下一批将完成 Montblanc 现有六个条目的类型纠正、内容补齐与品牌反向链接，并补入 145、StarWalker 等真正缺失的核心型号。

## Self-Check: PARTIAL

- 数据与内容发布闭环通过。
- 真实 catalog 和远程状态未被修改。
- 浏览器验收诚实标记为 deferred，不再为验收框架延误内容主线。
