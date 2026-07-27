# Phase 308：Sheaffer Legacy 9064 现行复兴版

## 目标

在不改写历史 Legacy Heritage 的前提下，新增当前官方页可核验的 Sheaffer Legacy 9064 pen 条目，完成品牌关系、正文、规格、F/M/B 变体、原创示意图、审核发布与本地正式迁移。

## 范围

- 只使用当前官方 9064 页确认的 SKU、钢制嵌入式笔尖、Classic converter、墨囊、黑漆镀铬饰件与 F/M/B 选择。
- 明确与 Legacy I/II、Legacy Heritage、PFM 的身份边界。
- 所有试写在 owned checkpoint copy；通过定向测试和全量本地检查后才覆盖本地 `data/fpkg.db`。
- 不进行远端 Turso 写入，不扩建通用验收或浏览器框架。

## 验证

1. research 正文长度、来源独立组、SVG 非照片标记。
2. 远端环境拒绝、owned-copy authority、迁移至 032。
3. 首次 apply 发布或已发布 noop，重放必须 noop。
4. pen 正文、model_specs、4 个变体、唯一 `made_by` 与品牌 reverse link、fact/language/media/publication 四项审核。
5. TypeScript、evidence contract、read-only isolation、public boundary、article content、entity quality、public media、diff 检查。
