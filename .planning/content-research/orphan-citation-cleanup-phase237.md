# Phase 237：孤儿引用清理记录

## 范围

本批次只处理已存在于 Phase 236 owned checkpoint 的 21 条 citation。它们的 `source_item_id` 都仍指向有效来源，但 `target_type/target_id` 指向已经不存在的 claim 或 story。原因是早期文章重分类、型号身份合并或研究草稿退役后，目标行被移除，citation 遗留在 library 表中。

这不是补充事实内容，也不改变实体、来源、story 正文或发布状态；清理目标只是让证据图不再引用不存在的目标。

## 固定清单

| target type | target id | citation 数 |
| --- | --- | ---: |
| claim | `claim-wancher-dream-pen-ebonite-material` | 1 |
| claim | `claim-wancher-dream-pen-craft-context` | 1 |
| claim | `claim-montblanc-writers-edition-annual` | 1 |
| claim | `claim-montblanc-writers-edition-homage` | 1 |
| claim | `claim-montblanc-patron-888-limitation` | 1 |
| claim | `claim-montblanc-patron-art-context` | 1 |
| claim | `claim-sailor-1911-series-official-family` | 1 |
| claim | `claim-sailor-1911-profit-source-boundary` | 1 |
| claim | `claim-hongdian-black-forest-pro-source-boundary` | 1 |
| story | `story-model-platinum-izumo-research` | 3 |
| story | `story-model-platinum-fuji-shunkei-pnb13000-research` | 1 |
| story | `story-model-platinum-preppy-pq200-research` | 1 |
| story | `story-model-platinum-president-research` | 2 |
| story | `story-model-platinum-makie-series-research` | 2 |
| story | `story-model-pilot-88g-research` | 2 |

脚本逐条校验 citation 的 id、target、source item 与“目标不存在”条件，只删除这份固定清单中的行；若发现清单外还有孤儿引用，脚本会失败而不是扩大删除范围。重复回放必须为 `noop`，并且真实 `data/fpkg.db` 不在授权路径内。

## 证据边界

- 来源记录保留，后续若重新建立可发布 claim/story，可以重新引用这些来源。
- 不把旧研究字符串重新当作事实，也不把 citation 迁移到相似但不同的实体。
- 该清理先在 caller-owned checkpoint 验证；不能据此宣称真实库、生产站点或全量内容目标已完成。

## 回放结果

- Phase 237 在 Phase 236 checkpoint 中删除 21 条孤儿 citation，第二次回放为 `noop`。
- 删除后 `check:library` 的 citation 问题归零。
- 同一 checkpoint 的 `audit-public-media` 扫描 481 条公开媒体，481 条均可读取；其中 463 条 image 使用合法站内 `local_path`。因此同步修正既有 library contract 的判断：站内 `local_path` 与 `image_url/thumbnail_url` 一样属于有效图片元数据，不新增验收框架，也不改写媒体行。
