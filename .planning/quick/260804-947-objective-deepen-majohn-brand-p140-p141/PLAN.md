# Quick Task Plan

## Objective

在不写入真实 `data/fpkg.db` 的前提下，深化已存在的末匠 Majohn 品牌页、P140 与 P141 型号页，并通过审核—发布链路写入新的 owned checkpoint copy。

## Owned files

- `.planning/content-research/majohn-brand-publishable-content-2026-07-19.md`
- `.planning/content-research/majohn-p140-phase181.md`
- `.planning/content-research/majohn-p141-phase181.md`
- `scripts/data/phase459-majohn-brand-p140-p141-depth.ts`
- `scripts/apply-phase459-majohn-brand-p140-p141-depth.ts`
- `tests/content/phase459-majohn-brand-p140-p141-depth.test.ts`
- `.planning/quick/260804-947-objective-deepen-majohn-brand-p140-p141/`

## Verification

1. 复制 Phase 458 owned checkpoint，确认复制前后 hash 一致且真实 catalog snapshot 不变。
2. 校验三份自然中文正文、来源独立组、原创主图和型号身份。
3. 在 owned copy 执行迁移、三项内容审核、`publishEntity`，验证品牌与两型号的发布合同、媒体、引用和关系。
4. 重放确认 noop；运行定向测试、TypeScript、Biome 和 diff/status 检查。

## Safety boundary

- apply 脚本拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`。
- 不直接写 `entity_publications.status`，只走 `recordEntityContentReview` 与 `publishEntity`。
- 不修改或暂存其他 agent 的 research、`.next-phase*`、既有 quick checkpoint 和真实数据库。
