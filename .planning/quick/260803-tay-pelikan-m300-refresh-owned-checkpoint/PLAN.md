# Phase 419：深化 Pelikan Souverän M300（owned checkpoint）

## 目标

在不新增重复实体、不写入 `data/fpkg.db` 的前提下，深化现有 `phase284-pelikan-m300`：补齐 M300 的可靠来源、自然中文正文、Black／Green-striped 版本、M3xx 身份边界、规格、维护、选购和原创示意图关系，并通过项目审核—发布路径。

## 边界

- 只复用现有 `Pelikan` 品牌与 `Pelikan Souverän M300` 实体。
- 试验写入只允许 `.planning/quick/260803-tay-pelikan-m300-refresh-owned-checkpoint/checkpoint-final/fpkg.db`。
- 不把历史 Pelikan 300、M320、M350 或相邻 M400／M200 建成 M300 的重复实体。
- 不直接更新 publication 状态；使用 `recordEntityContentReview` 与 `publishEntity`。

## 验收

1. 内容包正文 ≥8,000 Unicode 字符，来源 ≥15 条且独立组 ≥12，变体 ≥10 并遵守 `edition_group` 父节点 taxonomy。
2. checkpoint 首次 apply 为 `published`，重放为同哈希 `noop`。
3. 回读公开页、来源组、规格、变体父子、四项审核、readiness、品牌关系和 SQLite 完整性。
4. 定向测试、Biome、diff 检查通过；TypeScript 仅保留仓库既有 3 条诊断。
5. 真实 `data/fpkg.db` SHA-256 保持不变。
