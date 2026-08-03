---
quick_id: 260803-b71
slug: sailor-hiroshima-115th
status: in_progress
---

# Sailor HIROSHIMA 115 周年型号内容包

## 目标

补齐真实资料库中缺失的 Sailor 115 周年 HIROSHIMA 寄木细工（10-1115）与 HIROSHIMA モミジ（10-1116）两个具体型号；保持二者与写乐品牌的一对一身份关系，不把同系列或英文页面的泛化描述互相覆盖。

## 任务

- [x] 核对真实库没有重复 slug、名称或型号代码。
- [x] 以 Sailor 日文／英文产品页、115 周年专题、新闻稿、官方 PDF 和本地报道建立来源包。
- [x] 为两个型号写自然中文正文、完整规格、限量与未来上市时态、木材／工艺差异、维护和选购边界。
- [x] 添加原创事实 SVG；明确不是产品照片、Logo、比例图或颜色校样。
- [x] 使用 `recordEntityContentReview` 与 `publishEntity` 经由 `applyCuratedContentPacks`，只在 owned checkpoint copy 验证。
- [ ] 跑定向测试、TypeScript、Biome 和 diff 检查。
- [ ] 只暂存本包文件并提交；不迁移真实库或 Turso。

## 不在本 quick task 内

- 不写 `data/fpkg.db`，不执行 Turso 或生产迁移。
- 不把 2026-08-06 未来上市写成已经发售；不为每个颜色／尖幅另建实体。
- 不处理其他 Sailor 系列，也不删除任何未跟踪 research、checkpoint 或 `.next-phase*` 目录。
