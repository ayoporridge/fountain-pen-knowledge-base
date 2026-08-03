# Quick Task Plan

## Objective

为官方当前仍公开的 Wancher FLUX – Azure 具体型号建立来源化内容包，补齐其与 Wancher 品牌的身份关系、独特三角握位/平底结构、回收棉树脂材料、规格和供墨边界；只在 owned checkpoint copy 验证。

## Scope

- 新增一个 `pen` 型号，不重复创建 Wancher 品牌或 FLUX 系列集合。
- 采用 Wancher 官方商品/系列页、日文官方规格页、Figboot review video 入口和官方日本店/零售窗口交叉核对。
- 写自然中文正文、规格、设计用途、维护与选购边界；添加原创 factual SVG。
- 复用现有 `CuratedEntityPack`、`recordEntityContentReview`、`publishEntity` 与本地 owned-copy guard；拒绝远程环境和真实 DB。

## Verification

1. 定向测试覆盖审核—发布、身份/拓扑、来源分组、媒体、冲突、replay noop 与真实 DB snapshot。
2. TypeScript、Biome、`git diff --check`。
3. 只暂存本包文件和本 quick PLAN/SUMMARY；不暂存 checkpoint DB/source snapshot 或其他未跟踪 research。
