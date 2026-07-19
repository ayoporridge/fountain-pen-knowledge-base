---
phase: quick
plan: 260719-b4i
status: complete
completed_at: 2026-07-19T15:48:00+08:00
commits:
  - 6bda355
---

# Quick Task 260719-b4i Summary

## Outcome

- Pilot Custom 823 duplicate 合并到 `pilot-custom-823`：canonical 页面接管完整正文、来源、规格与别名；旧中文 slug 永久跳转，重复实体退休。
- Waterman 混名实体规范为 `waterman-hemisphere`，保留唯一 Hémisphère identity；旧 Charleston／Hémisphère slug 永久跳转，Waterman 品牌页补齐系列导航。
- Aurora 泛型号 `奥罗拉 Aurora —` 退休并 hard-404；补齐 Aurora 品牌页与 Aurora 88 具体型号页，避免品牌页再次链接空壳 pen。
- 使用官方 Pilot、Waterman、Aurora 资料与专业二级资料；每个公开型号使用独立 factual SVG，标明“示意图，非产品照片”。

## Sources

- Pilot Custom 官方 lineup／history／护理资料与 The Pen Addict Custom 823 review。
- Waterman Hémisphère 官方 H1 商品页、2021 Trade Catalogue、专业论坛。
- Aurora 官方品牌史／钢笔分类、Dromgoole 历史资料与 Fountain Pen Hospital 88 collection。

## Verification

- `pnpm exec tsx --test tests/content/phase41-identity-cleanup.test.ts` — PASS；三类 identity migration、六个公开实体与 replay 均通过。
- `pnpm exec tsc --noEmit --pretty false` — PASS。
- scoped Biome — PASS；五个 SVG `xmllint --noout` — PASS。
- `pnpm build` — PASS。
- 只使用 owned checkpoint copy，真实 `data/fpkg.db` main/WAL/SHM 快照保持不变。

## Scope boundary

本 Quick 不代表全库 `/goal` 完成；仍有大量 raw 型号、缺失重要品牌、正式迁移、全量真人遍历、生产部署与线上逐条复查待完成。受保护 Quick 665 未修改。

## Self-check: PASSED

提交 `6bda355`；本 Quick 不代表全库 `/goal` 完成。
