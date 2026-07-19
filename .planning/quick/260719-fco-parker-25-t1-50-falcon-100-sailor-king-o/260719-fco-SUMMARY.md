---
phase: quick
plan: 260719-fco
status: complete
completed_at: 2026-07-19T12:04:00+08:00
commits:
  - d7de980
---

# Quick Task 260719-fco Summary

## Outcome

- 发布 Parker 25、Parker T-1（1970）、Parker 50（Falcon）和 Parker 100 四个独立 canonical 型号页。
- Parker 25 保留 1975 英国首发、Flighter／25B、Mark I–IV 与日期码边界；T-1 保留钛制一体尖、尖下调节螺钉和短期生产；Parker 50 以同期目录正式名 50 Flighter 为主、Falcon 作为品牌限定昵称；Parker 100 明确为 2004–2007 的 51-inspired 独立型号。
- 每页都有自然中文正文、规格、版本／年代边界、维护、选购、来源和独立原创 factual SVG；四张图哈希互不重复，并明确“示意图，非产品照片”。
- 修正 Parker 品牌错误 alias `Parker 100`：重建后只归属 Parker 100 型号；没有裸 `T1` 或裸 `Falcon` 别名污染新型号。

## Evidence and identity fixes

- Parker 25 使用 Parkercollector／Parker Pens Penography 与 Parker 目录索引；不虚填统一长度重量。
- T-1 使用 Parker 官方历史、Penography、VintagePens；区分 T-1 钢笔与后续 Parker 75 零件衍生物。
- Parker 50 使用 1979 Parker Product Information 与 Penography；区分正式 `50 Flighter`、Falcon 昵称和 Pilot Falcon。
- Parker 100 使用 2004 Parker UK Catalogue、Geoff Hollington 访谈与 Penography；区分 Parker 51 设计遗产、18K hooded nib、GT/ST 颜色和黄铜漆面。

## Verification

- `pnpm exec tsx --test tests/content/phase36-parker-25-t1-50-falcon-100.test.ts` — PASS（首轮与格式化后复跑均通过；5 个发布实体 replay 全为 `noop`）。
- `pnpm exec tsc --noEmit --pretty false` — PASS。
- scoped Biome — PASS。
- 4 个 SVG `xmllint --noout` — PASS；SHA-256 全部不同。
- `pnpm build` — PASS（Next.js 15.5.18，18 个静态页面）。
- 测试全程只使用 `copyCheckpointedCatalogToDisposableCopy`；真实 `data/fpkg.db` main／WAL／SHM 快照保持不变。

## Scope boundary

- 本 Quick 只完成 Parker 四个型号；Sailor King of Pens／系列导航／长刀研和 Pelikan M200／Twist P457 延后为独立 Quick，不在本提交中宣称完成。
- 未恢复搜索或 LLM，未新增 runner、Playwright、AI／通用验收或 readiness 基础设施。
- 未修改、暂存或提交 `.planning/quick/260719-665-montblanc-writers-edition-patron-of-art-/`。

## Self-check: PASSED

提交 `d7de980` 只包含 Parker 四页研究、phase36 data／wrapper／test 与四张 Parker 专属媒体；受保护 Quick 目录仍未跟踪。
