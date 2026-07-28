# Phase 322 — Platinum Izumo PIZ-300000 #93 Urokomon

## Goal

在 caller-owned checkpoint copy 中新增有可靠来源的 Platinum Izumo PIZ-300000 #93 Urokomon 内容包，明确日本官方 PIZ-300000 与 Platinum Pen USA 的 PIZ-300000P 区域 SKU 边界，并与 PIZ-300000A Aurora 保持独立。

## Owned files

- `.planning/content-research/platinum-izumo-piz-300000p-urokomon-phase322.md`
- `scripts/data/phase322-platinum-izumo-piz-300000p-urokomon.ts`
- `scripts/apply-phase322-platinum-izumo-piz-300000p-urokomon-content.ts`
- `tests/content/phase322-platinum-izumo-piz-300000p-urokomon.test.ts`
- `public/images/library/site-original/phase322/platinum/izumo-piz-300000p-urokomon.svg`

## Validation

1. 复制 `data/fpkg.db` 到 caller-owned 临时目录并运行迁移。
2. 定向测试必须只发布 checkpoint copy，拒绝远程环境变量，且重放为 noop。
3. 运行 TypeScript、Biome、`git diff --check`。
4. 提交前检查 Git 状态，只暂存本包文件；不触碰真实 `data/fpkg.db` 或他人未跟踪文件。
