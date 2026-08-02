# Turso remote duplicate-cardinality reconciliation

## Scope

这份记录只描述正式迁移后发现的远端历史残留修复，不改变本地权威资料库的正文与内容包。远端同步器是 append/upsert-only，因此 Turso 中保留了早期迁移留下的旧 `stories` 与 `media_assets` 行；它们会让公开渲染器看到多于一个当前卡片。

## Exact repairs

- 11 个已经被本地当前 story 替代、但仍为 `published` 的旧 story 行改为 `draft`；正文历史保留，不删除。
- 10 个品牌的旧重复 primary media 行改为合法的 `hidden` usage status；媒体记录和来源仍保留，不删除。
- `Graf von Faber-Castell Classic` 的 1 个旧重复 primary media 行同样改为 `hidden`。
- 每组受影响实体均先恢复当前 hash 的 fact/language/media reviews，再通过项目既有 `publishEntity` 路径恢复 `published`；临时 migration gate cache 与替换 trigger 均在 finally 中清除，远端原始 `publication_publish_transition_guard` 已读回确认。

## Readback

- `entity_publications`: `published=640`, `retired=23`；无 `in_review` 残留。
- 公开集合：本地 `public_entities=902`，远端 `public_entities=902`；`local-only=0`, `remote-only=0`（完整 `id/slug/type` 集合对账）。
- 公开实体的 published story 重复数：`0`。
- 公开实体的 approved primary media 重复数：`0`；唯一剩余重复 primary media 属于已退休 Parker 51，不在 `public_entities`。
- 临时 `migration_publication_blockers_cache` 表：不存在；原 guard SQL 包含 `publication_blockers` 且不包含临时 cache 名称。
- 远端应用本地启动复查：Pilot、Wancher、Waterman、Visconti、Aurora、SCRIBO、Sailor 品牌路由均返回 HTTP 200，服务日志未再出现 `invalid-story-cardinality` 或 `invalid-primary-media-cardinality`。

## Boundary

这些是远端历史行的可逆状态收敛，不是新的内容包，也不等于全量 goal 完成。生产部署、公开 sitemap 全量遍历和线上逐条复查仍待完成；后续新增内容仍必须先在 owned checkpoint copy 集成，再重新做本地／远端迁移。

## Post-reset bounded recheck (2026-08-03)

配额重置提示后只做了低成本聚合读回，没有重跑全量同步或公开 ID 扫描：

- `entities=948`；`entity_publications`: `published=640`、`retired=23`、`in_review=0`；`public_entities=902`。
- 公开类型仍为 `brand=115`、`pen=520`、`article=255`、`concept=10`、`nib=2`。
- 公开集合内重复 published story 为 `0`；重复 approved primary media 为 `0`。
- 本次仅读远端，未向本地 `data/fpkg.db` 或 Turso 写入任何数据。

注意：Turso 面板当前仍显示本周期 `rows read=740.2M/500M`，下次重置为 `2026-09-01 08:00 CST`；因此后续远端检查继续采用有界、按主键或聚合查询，避免重复消耗配额。
