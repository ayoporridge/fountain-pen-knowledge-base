# Phase 361：Wancher Dream Pen Celluloid SETO 内容包

## 目标

新增 Wancher 官方 exact product page 已单列、实体库尚未覆盖的 Dream Pen Celluloid SETO（瀬戸），补齐品牌导航，记录现代 cellulose acetate 的材料边界以及官方和零售商测量差异。

## 实施边界

- 只新增 `phase361-wancher-dream-pen-celluloid-seto` / `wancher-dream-pen-celluloid-seto`，不重写已有 Wancher 型号。
- 使用既有 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity` 审核—发布链路。
- 所有写入仅在本批 owned checkpoint copy；真实 `data/fpkg.db` 保持只读。
- 原创 SVG 明确不是产品照片、Logo、比例图或颜色校样；官方与零售商测量并列保存。

## 验证

1. 定向 Node test 在 checkpoint copy 迁移并 apply 两次：首次 published，重放 noop。
2. 检查正文、品牌导航、maker/reverse、5 个 variants、规格证据、冲突来源、引用、主媒体和四项 review。
3. 运行 Biome、TypeScript 与 `git diff --check`，记录与本批无关的基线错误。
