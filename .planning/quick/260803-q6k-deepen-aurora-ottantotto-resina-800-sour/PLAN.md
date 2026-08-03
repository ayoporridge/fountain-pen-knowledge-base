---
phase: quick
id: 260803-q6k
status: complete
created: 2026-08-03
---

# Deepen Aurora Ottantotto Resina 800 sourced content

## Goal

深化既有 `aurora-ottantotto-resina-800` 页面，使用 Aurora 当前商品页、系列页、历史页、FAQ、高端目录和可靠钢笔资料补齐商品号 800 的身份、黑树脂／金色饰件、活塞、EF/F/M/B、14K 作用域、价格、维护、版本边界与样本证据；不创建重复 Aurora 88 实体，也不写入真实 `data/fpkg.db`。

## Scope

- 保持 `Aurora Ottantotto Resina (800)` 为具体钢笔；Ottantotto 家族导航、Millerighe、800-C、Ebanite、Black Mamba、Optima 与历史 88 保持相邻边界。
- 14K、隐藏备用墨仓和 Aurora 自制笔尖只按 FAQ／目录的高端线作用域写入，不把未逐项列出的容量、尺寸或重量补成当前 800 的硬规格。
- 所有试写只进入本 quick 的 caller-owned checkpoint copy；通过 `recordEntityContentReview` 与 `publishEntity` 的既有审核—发布路径，不直接修改 publication 状态。

## Acceptance

1. 当前商品页、官方目录、FAQ、历史／系列页和至少三条可靠独立评测或历史资料形成至少 10 个来源组。
2. 正文至少 8,000 Unicode 字符，涵盖身份、规格、家族历史、版本差异、活塞清洗、选购、价格／库存作用域和非产品照片边界。
3. checkpoint 首次 apply 发布，`fact/language/media/publication` 四项审核均 approved；readiness 无 blocker；Aurora `made_by` 与 reverse 导航各唯一；5 个变体（1 edition group + 4 nib options）读回；replay 返回同 hash 的 `noop`。
4. 定向测试、TypeScript、Biome、`git diff --check` 通过；只暂存本批文件，不碰其他 research、`.next-phase*` 或旧 quick 目录。
