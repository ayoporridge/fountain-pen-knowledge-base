# Phase 360：Wancher Dream Pen Celluloid KINGYO 内容包

## 目标

新增 Wancher 官方产品集合和日本页面列出的 Dream Pen Celluloid KINGYO（金鱼）独立 SKU，补齐品牌导航，并保留它与 SAKURA、Bekko、Momiji、Seto 及 Urushi／Ebonite 系列的身份边界。

## 实施边界

- 只新增 `phase360-wancher-dream-pen-celluloid-kingyo` / `wancher-dream-pen-celluloid-kingyo`，不重写已有 Wancher 内容。
- 使用既有 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity` 审核—发布链路。
- 试验写入只在本批 owned checkpoint copy；真实 `data/fpkg.db` 保持只读。
- 原创 SVG 明确不是产品照片、Logo、比例图或颜色校样；KINGYO 独立尺寸未被官方 listing 单列，图示不虚构尺寸。

## 验证

1. 定向 Node test 在 checkpoint copy 迁移并 apply 两次：首次 published，重放 noop。
2. 检查中文正文、品牌导航、maker/reverse、5 个变体、规格证据、来源分组、引用、主媒体和四项 review。
3. 运行 Biome、TypeScript 与 `git diff --check`，记录与本批无关的基线错误。
