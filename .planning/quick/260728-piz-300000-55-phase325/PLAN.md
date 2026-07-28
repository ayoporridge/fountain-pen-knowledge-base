# Phase 325 — Platinum Izumo PIZ-300000 #55 Hama no Matsu

## Goal

补齐官方目录中与 Urokomon 共用 PIZ-300000 前缀、但图案编号和工艺不同的 Hama no Matsu #55，修复型号身份边界。

## Owned files

- `.planning/content-research/platinum-izumo-piz-300000-hama-no-matsu-phase325.md`
- `scripts/data/phase325-platinum-izumo-piz-300000-hama-no-matsu.ts`
- `scripts/apply-phase325-platinum-izumo-piz-300000-hama-no-matsu-content.ts`
- `tests/content/phase325-platinum-izumo-piz-300000-hama-no-matsu.test.ts`
- `public/images/library/site-original/phase325/platinum/izumo-piz-300000-hama-no-matsu.svg`

## Validation

在 caller-owned checkpoint copy 运行发布与回放测试，验证身份、品牌关系、来源、规格、媒体和远程环境变量拒绝；随后运行 TypeScript、Biome、`git diff --check`，只提交本包文件。
