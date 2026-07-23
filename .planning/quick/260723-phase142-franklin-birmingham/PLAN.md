# Phase 142：Franklin-Christoph 与 Birmingham 代表型号

## 目标

在 caller-owned checkpoint copy 中发布两个身份边界清楚的品牌／型号组：Franklin-Christoph + Model 20 Marietta，以及 Birmingham Pen Company + Alumina Model-C。

## 范围

- 使用官方产品／历史资料和独立来源建立自然中文正文、规格、版本边界、维护建议、选购建议、来源与原创事实图。
- `Model 20 Marietta` 不与 pocket 20、Model 02、Model 31 混写。
- `Alumina Model-C` 不继承旧树脂、Ironsides、Raven 或 Model-A 的规格和图片。
- 试验数据库只来自 `data/fpkg.db` 的 disposable copy；真实库禁止写入。

## 验收

- 4 个实体包（2 brand + 2 pen）在 checkpoint copy 经过 `recordEntityContentReview` 的 fact/language/media 审核并由 `publishEntity` 发布。
- 每个型号恰有一条 `made_by` 与品牌反向导航关系；重复运行全部 noop。
- 定向测试、TypeScript、Biome、SVG XML 与 diff 检查通过；真实数据库 hash 不变。
