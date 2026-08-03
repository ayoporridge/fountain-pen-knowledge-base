# Quick Task Plan

## Objective

在不写入真实 `data/fpkg.db` 的前提下，深化已有 canonical 的 Diplomat Traveller、Esteem、CLR 型号页，并在 Phase 459 owned checkpoint 的后继副本中按审核—发布链路验证。

## Owned files

- `.planning/content-research/diplomat-traveller-phase329.md`
- `.planning/content-research/diplomat-esteem-phase329.md`
- `.planning/content-research/diplomat-clr-phase329.md`
- `scripts/data/phase460-diplomat-traveller-esteem-clr-depth.ts`
- `scripts/apply-phase460-diplomat-traveller-esteem-clr-depth.ts`
- `tests/content/phase460-diplomat-traveller-esteem-clr-depth.test.ts`
- `.planning/quick/260804-9fa-objective-deepen-diplomat-traveller-este/`

## Verification

1. 复制 Phase 459 checkpoint 并确认复制 hash 与真实 catalog snapshot。
2. 校验三份自然中文正文、官方样本规格、版本边界、来源独立组和原创主图。
3. 在 owned copy 执行三项内容审核与 `publishEntity`，验证唯一品牌关系、反向导航、contract v3/hash 和幂等重放。
4. 运行定向测试、库完整性、library contract、质量/覆盖审计、TypeScript baseline、Biome/diff 检查。

## Safety boundary

- apply 拒绝 Turso/远程环境变量，只接受 owned、非 symlink checkpoint。
- 不直接改写 publication status；不试写 `data/fpkg.db`。
- 不修改、删除或暂存其他 agent 的 research、`.next-phase*`、Montblanc quick 目录和既有 checkpoint。
