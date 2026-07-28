# Phase 327 — Diplomat Viper 与 Cobra 内容包

## 目标

将官方当前目录中缺失的 Diplomat Viper、Diplomat Cobra 建为独立钢笔型号，补充自然中文正文、规格、版本边界、维护建议、可靠来源和原创事实图；只在 owned checkpoint copy 审核发布，不触碰 `data/fpkg.db`。

## 文件边界

- `.planning/content-research/diplomat-viper-phase327.md`
- `.planning/content-research/diplomat-cobra-phase327.md`
- `scripts/data/phase327-diplomat-viper-cobra.ts`
- `scripts/apply-phase327-diplomat-viper-cobra-content.ts`
- `tests/content/phase327-diplomat-viper-cobra.test.ts`
- `public/images/library/site-original/phase327/diplomat/viper.svg`
- `public/images/library/site-original/phase327/diplomat/cobra.svg`
- `.planning/quick/260728-diplomat-viper-cobra-phase327/SUMMARY.md`

## 验证

1. 在真实库副本上执行定向 Vitest/node test，确认远程环境拒绝、032 migration、审核—发布链路、身份关系、品牌反向导航、来源引用、规格、主图与 replay noop。
2. 执行 TypeScript、Biome format/check、`git diff --check`。
3. 提交前检查 `git status --short`，只暂存本包文件；不迁移真实数据库，不处理其他 agent 的 research 或 `.next-phase*` 文件。
