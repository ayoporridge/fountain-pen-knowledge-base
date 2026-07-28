# Phase 323 — Platinum Izumo PIZ-600000 #56 Takisansui

## Goal

补齐研究资料中明确列出的 Platinum Izumo PIZ-600000 #56 Takisansui，记录 Kaga 高蒔绘、官方规格与价格快照，和 PIZ-500000、PIZ-300000 系列保持产品号边界。

## Owned files

- `.planning/content-research/platinum-izumo-piz-600000-takisansui-phase323.md`
- `scripts/data/phase323-platinum-izumo-piz-600000-takisansui.ts`
- `scripts/apply-phase323-platinum-izumo-piz-600000-takisansui-content.ts`
- `tests/content/phase323-platinum-izumo-piz-600000-takisansui.test.ts`
- `public/images/library/site-original/phase323/platinum/izumo-piz-600000-takisansui.svg`

## Validation

1. 在 caller-owned checkpoint copy 迁移并发布；拒绝远程环境变量。
2. 定向回归验证身份、品牌关系、规格、来源、媒体和 noop 重放。
3. 运行 TypeScript、Biome、`git diff --check`。
4. 提交前只暂存本包文件，真实 `data/fpkg.db` 和他人未跟踪文件保持不变。
