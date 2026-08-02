# Phase 364：Wancher Dream Pen 津轻漆三 SKU 内容包

## 目标

补齐 Wancher Japan 津轻漆 collection 中已明确存在、但真实目录尚无独立实体的 Nanako Nuri、Raden Kara-nuri Midori-age 与 Kara-nuri Shiro-age；分别记录 exact 商品身份、工艺、材料、当前尖／feed／供墨菜单、维护边界和未公开规格。

## 实施边界

- 只新增三个 exact SKU，并更新 Wancher 品牌导航；不重建 Tokiwa-iro、Aizu、Echizen、Kyoto、True Urushi 或其他已存在实体。
- 使用既有 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity` 审核—发布链路，不直接写 `entity_publications`。
- 所有写入仅在本批 owned checkpoint copy；真实 `data/fpkg.db` 保持只读。
- 三个 exact 页面没有可复核的闭帽长、无帽长、直径、净重或明确 launch year；不从兄弟型号借值。
- 原创 SVG 只作 factual diagram，不冒充产品照片、比例图或颜色校样。

## 验证

1. 定向 Node test 在 checkpoint copy 迁移并 apply 两次：首次四个 pack published，三 SKU 重放 noop。
2. 检查正文、品牌导航、maker/reverse、变体、规格字段证据、引用、主媒体和 fact/language/media/publication reviews。
3. 运行 Biome、TypeScript 与 `git diff --check`，记录与本批无关的基线错误。
