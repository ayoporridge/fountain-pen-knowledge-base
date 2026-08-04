# Phase 467：Majohn M2、Cleo Classic Palladium、ShuLe 2398 深化

## 目标

复用三个已存在的 canonical pen entity，补足型号身份、版本边界、来源化规格、维护与购买建议；Cleo 使用本批自有研究稿，避免改写既有未跟踪 quick 文件。所有试验只写本批 owned checkpoint，不写真实 `data/fpkg.db`。

## 任务

1. 更新 Majohn M2 与 ShuLe 2398 研究稿，并为 Cleo Classic Palladium 建立独立研究稿。
2. 通过 `CuratedEntityPack` 复用既有 source、media、model ID 和品牌关系，补入 source-backed claims、timeline 与 selection guidance；把 ShuLe 2212 仅作为相邻型号边界。
3. 用项目既有 `recordEntityContentReview` 与 `publishEntity` 路径，在 owned checkpoint 上发布、回放并验证。
4. 运行定向测试、SQLite 完整性、library contract、全站 readiness／quality／coverage、TypeScript、Biome 和 diff 检查，之后只提交本批文件。

## 验收

- 远程数据库环境选择被拒绝，真实 catalog snapshot／hash 前后不变。
- 三个目标保持原 ID／slug，正文、来源、primary media、审核、发布和 `made_by`／reverse 导航有效。
- 首次 apply 为 `published`，第二次 replay 全部为 `noop`。
- 全站审计明确记录仍有 backlog，不将 Phase 467 当作全量 goal 完成。
