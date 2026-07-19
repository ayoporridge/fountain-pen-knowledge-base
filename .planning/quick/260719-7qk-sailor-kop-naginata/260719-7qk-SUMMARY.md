---
phase: quick
plan: 260719-7qk
status: complete
completed_at: 2026-07-19T12:31:00+08:00
commits:
  - 0f97614
---

# Quick Task 260719-7qk Summary

## Outcome

- 将 Sailor `lrpwJxiOfNNR` 从中文旧 slug 收窄为 `sailor-king-of-pens`，发布 KOP 导航／规格层。
- 正文区分 KOP Ebonite、Urushi、ST Resin、KOP Kai 与 Professional Gear KOP，明确不同官方货号不能共享单一规格；补齐材料、尖、上墨、维护、购买核对和长刀研边界。
- 将 `sDaEy32aebxE` 从 `pen` 重分类为 `nib` `sailor-naginata-togi`，删除原有错误故事、规格、媒体、引用和 Sailor `made_by` 关系；旧 `/pen/写乐-sailor-长刀研` 路由 hard-404。
- KOP 使用本站原创 factual SVG，媒体 metadata 明确“示意图，非产品照片”。

## Evidence

- Sailor 官方 KOP 专题：Ebonite／Urushi／ST Resin 分支与货号。
- Sailor 官方 KING PROFIT 11-7002、KOP Kai 10-9962、Professional Gear KOP 10-9618。
- Sailor 官方特殊尖说明与 Naginata-Togi 10-7121：长刀研首先是 nib taxonomy，具体整笔 SKU 另行建模。
- Fountain Pen Network 与 Anderson Pens 仅作专业二级交叉来源，不替代官方 SKU 证据。

## Verification

- `pnpm exec tsx --test tests/content/phase37-sailor-kop-naginata.test.ts` — PASS；首次修正 readiness secondary-group 后复跑 PASS，重放实体结果为 `noop`。
- `pnpm exec tsc --noEmit --pretty false` — PASS。
- `xmllint --noout public/images/library/site-original/sailor-kop-naginata/sailor-kop.svg` — PASS。
- `pnpm build` — PASS（Next.js 15.5.18，18 个页面）。
- 测试只操作 checkpoint copy，真实 catalog 三件套快照保持不变。

## Scope boundary

本 Quick 只完成 KOP 导航层与长刀研分类；11-6001、11-7002、10-9618、10-7121 的独立正文页、Sailor Profit／1911 与 Professional Gear 导航节点，以及 Pelikan／Parker 后续批次仍未完成。受保护 Quick 665 未修改。

## Self-check: PASSED

提交 `0f97614`；本 Quick 不代表全库 `/goal` 完成。
