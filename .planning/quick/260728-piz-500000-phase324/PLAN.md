# Phase 324 — Platinum Izumo PIZ-500000 #55 Hama no Matsu

## Goal

补齐 Platinum Izumo PIZ-500000 #55 Hama no Matsu，记录 Kaga 高蒔绘、官方规格与价格快照，明确它与同名 PIZ-300000 #55 平蒔绘型号的身份边界。

## Owned files

- `.planning/content-research/platinum-izumo-piz-500000-hama-no-matsu-phase324.md`
- `scripts/data/phase324-platinum-izumo-piz-500000-hama-no-matsu.ts`
- `scripts/apply-phase324-platinum-izumo-piz-500000-hama-no-matsu-content.ts`
- `tests/content/phase324-platinum-izumo-piz-500000-hama-no-matsu.test.ts`
- `public/images/library/site-original/phase324/platinum/izumo-piz-500000-hama-no-matsu.svg`

## Validation

1. caller-owned checkpoint copy 发布，拒绝远程环境变量。
2. 定向回归验证型号、品牌关系、来源、规格、媒体和 noop 重放。
3. TypeScript、Biome、`git diff --check` 通过后精确提交；真实库不写入。
