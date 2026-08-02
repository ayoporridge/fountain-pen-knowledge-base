# Phase 363：Wancher Dream Pen Celluloid MOMIJI 内容包

## 目标

补齐官方 Celluloid family 与 Kickstarter 发货更新中明确存在的 Dream Pen Celluloid MOMIJI（紅葉）色款；记录现代 cellulose acetate、秋叶图案、项目履约和当前独立规格缺口。

## 实施边界

- 只新增 `phase363-wancher-dream-pen-celluloid-momiji` / `wancher-dream-pen-celluloid-momiji`，不重建 KINGYO、BEKKO、SAKURA、SETO 或 Dream Pen 导航实体。
- 使用既有 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity` 审核—发布链路。
- 所有写入仅在本批 owned checkpoint copy；真实 `data/fpkg.db` 保持只读。
- 官方没有独立 MOMIJI 规格页，本批不继承 SAKURA／SETO 的尺寸、重量、接口或尖幅。

## 验证

1. 定向 Node test 在 checkpoint copy 迁移并 apply 两次：首次 published，重放 noop。
2. 检查正文、品牌导航、maker/reverse、5 个变体、规格字段证据、项目来源、引用、主媒体和四项 review。
3. 运行 Biome、TypeScript 与 `git diff --check`，记录与本批无关的基线错误。
