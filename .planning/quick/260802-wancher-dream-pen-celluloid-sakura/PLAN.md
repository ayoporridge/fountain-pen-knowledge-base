# Phase 359：Wancher Dream Pen Celluloid SAKURA 内容包

## 目标

新增 Wancher 官网已单列、现有实体库尚未覆盖的 Dream Pen Celluloid SAKURA SKU，补齐 Wancher 品牌导航，并保持它与 Celluloid family 其他颜色、Echizen Urushi Sakura Zukiyo、True Ebonite 和 Dream Pen 系列导航的身份边界。

## 实施边界

- 只新增 `phase359-wancher-dream-pen-celluloid-sakura` / `wancher-dream-pen-celluloid-sakura`，不重写已有 Wancher 具体型号。
- 使用 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity` 的既有审核—发布链路。
- 所有试验写入只发生在本批 owned checkpoint copy；真实 `data/fpkg.db` 只做源快照。
- 图片使用本站原创 factual SVG，明确不是产品照片、Logo、比例图或颜色校样。

## 验证

1. 定向 Node test 在迁移后的 checkpoint copy 上执行，首次 apply 发布、第二次 replay noop。
2. 检查自然中文正文、Wancher 品牌导航、maker/reverse 关系、5 个 variants、spec evidence、独立来源、引用、主媒体和四类 review。
3. 运行 Biome、TypeScript 与 `git diff --check`；TypeScript 只记录与本批无关的既有基线错误。
