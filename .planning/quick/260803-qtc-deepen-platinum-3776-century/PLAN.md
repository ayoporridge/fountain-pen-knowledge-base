# Phase 412：深化 Platinum #3776 Century

## 目标

在不创建重复实体的前提下，深化现有 `platinum-3776-century` 页面。主体锁定日本官方现行 PNB-15000 普通 AS 树脂款，同时把 1978 #3776、2011 Century、Slip & Seal、颜色与尖号 SKU、2026 Ver.2.0 和 Travia 的边界写清楚。

## 执行边界

- 只更新既有实体 `ekPMWnot9inz`，不新建 Platinum 型号。
- 正文、来源矩阵和结构化内容写入本包文件；数据库试验只使用本目录下的 owned checkpoint copy。
- 采用 `recordEntityContentReview` 的 fact/language/media 审核与 `publishEntity` 发布，不直接改 publication 状态。
- 复用既有本站原创事实 SVG，不把示意图当产品照片，也不下载或复制第三方图片。
- 保留工作树中其他 agent 的 research 文件、`.next-phase*` 与其他 quick 目录。

## 验证

1. 在 checkpoint copy 上运行 Phase 412 定向测试。
2. 运行 TypeScript、Biome（适用路径）与 `git diff --check`。
3. 确认真实 `data/fpkg.db` 的快照 SHA-256 不变，重放结果为 `noop`。
4. 只暂存本 Phase 明确拥有的七个文件并提交。
