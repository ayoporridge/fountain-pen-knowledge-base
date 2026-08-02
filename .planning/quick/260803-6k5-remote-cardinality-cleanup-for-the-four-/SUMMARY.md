# Turso post-sync duplicate-cardinality cleanup

## Scope

本 quick 只处理 bounded sync 后远端历史残留行被重新激活的问题，不新增实体，不删除历史资料，不修改本地权威正文。

## Repair

- 远端公开集合读回发现 Sailor、Graf von Faber-Castell Classic、Sheaffer、Edison Pen Co 的旧 story/media 行重新成为 published/primary。
- 以本地当前 canonical story/media 行为准，将旧 story 改为 `draft`、旧 primary media 改为 `hidden`；这些状态变更可逆，历史行保留。
- 受影响实体随后通过项目现有 `recordEntityContentReview`（fact/language/media）与 `publishEntity` 恢复 published；临时 migration gate cache 与替代 trigger 在 `finally` 中清理，原 `publication_publish_transition_guard` 已读回存在。

## Final remote readback

- `entities=950`；`entity_publications`: `published=642`、`retired=23`；`public_entities=904`。
- 公开类型：`article=255`、`brand=115`、`concept=10`、`nib=2`、`pen=522`。
- 公开 published story 重复：`0`；公开 approved primary media 重复：`0`。
- Phase 368 Realo：published，正文 3,061 Unicode 字符，7 个 entity references。
- Phase 369 Lecoule Clear：published，正文 2,803 Unicode 字符，7 个 entity references。
- 临时 `migration_publication_blockers_cache` 不存在；原 publication guard trigger 存在。

这是远端历史行收敛与新批次读回证据，不代表全量内容 goal 完成；Fly 部署、真人遍历、线上逐条复查和更多型号覆盖仍未完成。
