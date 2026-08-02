---
name: Turso content snapshot migration
created: 2026-08-02
status: in_progress
---

# 目标

把本地最终资料库的完整内容安全同步到已迁移 schema 的 Turso `fpkg`，先在 owned checkpoint copy 上做 dry-run 与计数/主键差异核对，再执行显式确认的远端 upsert。禁止旧的 `DROP TABLE` 导入脚本；不写 `data/fpkg.db`。

# 文件所有权

- `scripts/sync-local-catalog-to-turso.ts`
- `tests/migration/sync-local-catalog-to-turso.test.ts`
- 本 quick 目录及其 owned checkpoint copy

# 验收

- dry-run 能报告 schema、表计数和远端多余/缺失主键。
- apply 默认拒绝，必须显式 `--apply --ack-remote-write`，且源库必须是 owned copy。
- upsert 顺序满足外键依赖，publication 状态在关系写入后恢复。
- publication 恢复仍通过 `recordEntityContentReview` 与 `publishEntity`；远端慢门禁只在迁移 gate 期间使用 checkpoint blocker cache，结束时恢复原 `publication_publish_transition_guard` 并删除 cache。
- 不把试验性远端关系索引写入仓库 migration：内容未全部完成前不能让真实 `data/fpkg.db` 产生 pending migration；门禁性能依靠可回滚的迁移期 blocker cache。
- 远端同步后重新执行全量只读门禁与生产复查；真实 `data/fpkg.db` 快照不变。
