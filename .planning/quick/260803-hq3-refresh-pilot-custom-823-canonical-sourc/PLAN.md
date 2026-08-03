# Phase 394 Plan — Refresh Pilot Custom 823 sourced content

## Goal

在不新建 Pilot Custom 823 实体的前提下，刷新现有 `pilot-custom-823` 型号页：补足官方型号代码、真空上墨、尖号与日本 SKU、地区配色、维护边界、相邻型号区别和可核实选购信息。旧中文导入地址继续指向现有型号页。

## Owned files

- `.planning/content-research/pilot-custom-823-phase394.md`
- `scripts/data/phase394-pilot-custom-823-refresh.ts`
- `scripts/apply-phase394-pilot-custom-823-refresh.ts`
- `tests/content/phase394-pilot-custom-823-refresh.test.ts`
- `.planning/quick/260803-hq3-refresh-pilot-custom-823-canonical-sourc/SUMMARY.md`

## Guardrails

- 只在 `copyCheckpointedCatalogToDisposableCopy` 创建的 owned checkpoint copy 上迁移和发布。
- 禁止继承 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`，禁止连接 `data/fpkg.db`。
- 使用既有 `applyCuratedContentPacks`、事实／语言／媒体审核和 `publishEntity` 路径，不直接更新发布状态。
- 不创建新的 Pilot、Custom 823 或品牌实体，不删除其他 agent 的未跟踪文件。

## Verification

1. 资料包加载、正文长度、来源独立组、SKU variant、规格证据和媒体标记通过定向测试。
2. owned copy 迁移后：现有 `oJyaQy9bEc8V` 发布、公开、审核齐全；`xQ-15uqtdMGA` 仍 retired 并保持永久跳转；Pilot `made_by` 关系唯一。
3. 重放返回 noop，protected catalog snapshot 和真实数据库哈希不变。
4. 定向 `tsx --test`、`tsc --noEmit`、Biome、`git diff --check` 通过；记录 checkpoint 审计与库契约结果。
