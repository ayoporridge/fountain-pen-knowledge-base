# Phase 415：在 checkpoint copy 深化 Pelikan Souverän M400

## 目标

在不新增重复实体、不写入真实 `data/fpkg.db` 的前提下，更新既有 `EF34ulVg8PSK`（`pelikan-souveran-m400`）公开内容。正文需要把 1982 Old Style、1997 年 9 月后 New Style、1950 年代 Pelikan 400 的身份边界、现行规格、配色跨代、市场编号、保养和二手选购写清楚，并保留来源与现有原创事实图。

## 约束

- 只使用 `/Users/xz/CodeBuddy/fountain-pen-graph` 目录中的本阶段文件和拥有的 checkpoint copy。
- 真实 `data/fpkg.db` 只做快照保护与回读；不执行任何写入。
- 通过 `recordEntityContentReview` 的 fact/language/media 三项，再经 `publishEntity` 完成发布；不直接改写 publication 状态。
- 保留其他 agent 的未跟踪 research、`.next-phase*` 和既有 quick 目录。

## 交付

1. 可复查研究记录与 8,000 Unicode 字符以上自然中文正文。
2. 重新组织来源、声明、规格、代际/颜色/笔尖/市场变体和品牌关系的 `CuratedEntityPack`。
3. owned checkpoint copy 定向测试、replay noop、readiness、完整性和真实库 SHA 回读证据。
4. 只暂存本阶段拥有的文件并提交。

## 验证顺序

1. 检查 pack 类型、身份、来源独立组、媒体与正文门槛。
2. 运行 Phase 415 定向测试（测试会复制 checkpoint，并保护真实库）。
3. 运行 TypeScript、Biome（测试文件）和 `git diff --check`；接受已知基线诊断，不把它们归因于本阶段。
4. 检查 git 状态，只提交本阶段文件。
