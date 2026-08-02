# Phase 373 — Sailor SHIKIORI ひさかた与月夜の水面

## Goal

在不修改 `data/fpkg.db` 的前提下，基于 Sailor 官方产品页、SHIKIORI 系列页、官方目录、官方维护说明和专业零售商交叉核验，新增两个当前缺失的型号组：

- `11-0500` SHIKIORI ひさかた（四个 F 尖颜色 SKU）
- `11-0558` SHIKIORI 月夜の水面（四个 F 尖颜色 SKU）

每组都必须保持共同主型号与颜色 SKU 的身份边界，建立 Sailor 品牌关系、来源、规格、正文、原创事实图和审核—发布记录。

## Owned files

- `scripts/data/phase373-sailor-shikiori-hisakata-tsukuyono.ts`
- `scripts/apply-phase373-sailor-shikiori-hisakata-tsukuyono-content.ts`
- `tests/content/phase373-sailor-shikiori-hisakata-tsukuyono.test.ts`
- `.planning/content-research/sailor-shikiori-hisakata-110500-phase373.md`
- `.planning/content-research/sailor-shikiori-tsukuyono-minamo-110558-phase373.md`
- `public/images/library/site-original/phase373/sailor/shikiori-hisakata-110500.svg`
- `public/images/library/site-original/phase373/sailor/shikiori-tsukuyono-minamo-110558.svg`
- this quick directory's `PLAN.md` and `SUMMARY.md`

## Verification contract

1. Targeted test uses a disposable checkpoint copy, rejects remote environment selection, verifies all four variants per model, source/review/media/topology records, replay idempotence, and protected real-catalogue hash stability.
2. CLI replay is run once for `published` and again for `noop` on a persistent checkpoint copy under this directory.
3. TypeScript and Biome checks are run; any unrelated baseline diagnostics are recorded, not hidden.
4. Only owned source/content/test/docs/image files are staged; checkpoint databases remain untracked and the real catalogue is never written.
