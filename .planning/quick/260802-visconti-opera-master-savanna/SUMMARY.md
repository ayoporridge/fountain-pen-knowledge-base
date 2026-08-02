# Phase 357 summary

## 状态

内容包、定向回归与 checkpoint 双次 replay 已完成；真实 `data/fpkg.db` 尚未写入。

## 文件

- `.planning/content-research/visconti-brand-phase357.md`
- `.planning/content-research/visconti-opera-master-savanna-phase357.md`
- `scripts/data/phase357-visconti-opera-master-savanna.ts`
- `scripts/apply-phase357-visconti-opera-master-savanna-content.ts`
- `tests/content/phase357-visconti-opera-master-savanna.test.ts`
- `public/images/library/site-original/phase357/visconti/opera-master-savanna.svg`

## Checkpoint 证据

- checkpoint：`.planning/quick/260802-visconti-opera-master-savanna/checkpoint/fpkg-copy-source.db`
- protected copy：`.planning/quick/260802-visconti-opera-master-savanna/checkpoint/protected.db`
- 真实 source 与 protected SHA-256：`526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`
- replay 副本 SHA-256：`dc5f0b1d2e9c9bebb2997ead957d07db5e6d63f86ff7880b2b3658a7b1fca2ff`
- first replay：brand 与 model 均 `published`
  - brand revision `302`，hash `sha256:v3:af01d48513e08bbb8ad6d6df8873dc9cf08ee0c9f3f5a2f0dbc9ae1bf2778eb9`
  - model revision `87`，hash `sha256:v3:2604644ce85d5093c7103f63fe267ce365dd0e2b43cc0006f75959263a11803c`
- second replay：brand 与 model 均 `noop`，hash 保持不变
- model：body `3576` 字符；`fact/language/media/publication` 四项 review 均 approved；`made_by` 1、反向 1；variants `6`；approved spec evidence `10`；approved entity references `7`；source groups 为 primary `5`、contemporary archive `1`、professional secondary `1`；primary media `1`；resolved conflict `0`
- brand：body `1273` 字符；新增 Savanna 导航并保留既有 Visconti 型号关系

## 验证

- `pnpm exec tsx --test tests/content/phase357-visconti-opera-master-savanna.test.ts`：1 passed，约 37.8s
- `pnpm exec biome check`：owned apply/test 文件通过；`scripts/data` 被仓库 Biome ignore，已用 targeted test 的 tsx 转译执行
- `git diff --check`：通过
- `pnpm exec tsc --noEmit`：未出现 Phase 357 错误；仓库已有两处无关 baseline 错误（`tests/content/phase346-jinhao-x450-x750.test.ts` TS7022、`tests/migration/sync-local-catalog-to-turso.test.ts` TS2741）
