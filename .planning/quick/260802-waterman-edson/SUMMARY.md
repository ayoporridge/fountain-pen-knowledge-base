# Phase 358 结果摘要

## 内容

- 新增 `.planning/content-research/waterman-edson-phase358.md`：早期 1990s 历史、椭圆双层树脂、18K／铑镀尖、C/C、颜色与 125 ans 边界、Diamond Black 样本规格、维护与中古选购。
- 新增 `.planning/content-research/waterman-brand-phase358.md`：Waterman 品牌导航新增 Edson，明确与 Carène、Expert、Hémisphère、Allure 分开。
- 新增 `public/images/library/site-original/phase358/waterman/edson.svg`：原创事实图，声明非照片、非 Logo、非比例图、非颜色校样。
- 新增 `scripts/data/phase358-waterman-edson.ts`、`scripts/apply-phase358-waterman-edson-content.ts`、`tests/content/phase358-waterman-edson.test.ts`。

## 预期 checkpoint 证据

- 真实 `data/fpkg.db` 只做源快照；迁移与 apply 仅对 `.planning/quick/260802-waterman-edson/checkpoint/` 下的 disposable copy 操作。
- 首次 apply 应发布 Waterman 品牌与 Edson；第二次 replay 应为 noop。
- Edson 应有一个 `made_by`、一个品牌 reverse、6 个 variants、至少 8 个引用、approved fact/language/media/publication reviews。

## 实际 checkpoint 证据

- protected 与源库 SHA-256：`526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`；checkpoint copy 在 apply 后独立变为 `6754042c2f81dce46926cc6d690fba8756b25eb4bdde3658066d1918d87e5e69`，真实库未变化。
- 第一次 apply：Waterman brand `published`，Edson `published`；Edson hash `sha256:v3:07449188c7674de6ecd14bf2f17dd06b54e6b5eb33dd8b55d08bb88d19d03d46`。
- 第二次 replay：brand 与 Edson 均 `noop`，hash 不变。
- checkpoint SQL：Edson 正文 3171 字符、品牌正文 1606 字符；`made_by=1`、reverse=1、variants=6、approved spec evidence=9、references=8、primary media=1；fact/language/media/publication 四项均 approved。
- 定向测试 `pnpm exec tsx --test tests/content/phase358-waterman-edson.test.ts`：1/1 通过；Biome 通过；`tsc --noEmit` 仅报告既有 Phase 346 Jinhao 与 migration test 错误；`git diff --check` 待提交前复核。

## 未完成事项

本批提交不等于全量 goal 完成；后续仍需持续覆盖缺失品牌／型号，最终再做正式迁移、全量检查、真人遍历、部署和线上逐条复查。
