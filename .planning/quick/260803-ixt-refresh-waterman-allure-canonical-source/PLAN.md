# Phase 398 Plan — Refresh Waterman Allure canonical sourced content

## Objective

在不新增重复实体的前提下，刷新现有 `waterman-allure` 公开型号页。以 Waterman 当前官网的 Allure collection 与 S0037650 商品页为规格锚点，补足自然中文正文、版本边界、维护与选购信息、来源和原创示意图，并在 owned checkpoint copy 通过既有审核—发布链路。

## Scope

- 目标实体：现有 `phase83-pen-waterman-allure`（slug `waterman-allure`），不触碰 Phase 244 的重复实体 `p244WatermanAllure`。
- 目标品牌：现有 Waterman 品牌 `zkAu9PePDdqJ`，沿用既有品牌包以保持品牌页导航。
- 来源：Waterman 当前 collection、S0037650、系列介绍、填墨与清洁支持、官方历史/目录，以及 Pen Heaven、Fountain Pen Network 和本站原创事实图。
- 数据安全：脚本拒绝远端环境；测试只复制真实数据库到临时 owned copy；绝不写 `data/fpkg.db`。

## Verification

1. 定向内容测试覆盖正文长度、事实标记、来源独立组、variants、媒体和 identity topology。
2. 在 owned checkpoint copy 执行首次 apply 与 replay，确认 `published` 后重放 `noop`，审核四项和 readiness 通过。
3. 执行 TypeScript、Biome、`git diff --check`，保留既有基线诊断并确认无新增诊断。
4. 提交前检查工作区，只暂存本 Phase 398 明确拥有的文件。

## Non-goals

- 不进行真实库迁移、Turso 写入、生产部署或线上复查；这些属于全量目标的后续正式迁移阶段。
- 不删除或覆盖其他 agent 的 research、checkpoint 或 `.next-phase*` 文件。
