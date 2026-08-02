---
name: Turso content snapshot migration
completed: 2026-08-02
status: applied-with-known-drift
---

# 本次迁移证据

## 源库保护

- 试验源为 `.planning/quick/260802-turso-content-migration/checkpoint/fpkg-copy.db`，位于本 quick 自有目录；脚本拒绝真实 `data/fpkg.db`、符号链接和 hard-link alias。
- `gate-only` 完成后 `assertCatalogSnapshotUnchanged` 通过；定向测试也再次验证真实 catalog 的实体计数为 893 且快照未变。
- checkpoint publication 基线为 608 行：585 `published`、23 `retired`；585 个 published readiness snapshot 均为 `blocker_count=0`、`publishable=1`。

## 远端写入与门禁

- 数据表同步阶段已完成；本次继续执行 `--apply --ack-remote-write --gate-only`。
- 585 个 published entity 全部通过项目原生 `recordEntityContentReview`（仅在缺少 current hash review 时调用）与 `publishEntity`；结果 `published=585 skipped=0 non-published=23`。
- 远端回读：`entity_publications` 为 `published=585`、`retired=23`；fact/language/media current approved review 各 585；published publication 字段完整性异常为 0。
- Pilot Custom URUSHI、Sheaffer Connaisseur、Wancher Dream Pen 系列导航抽查均存在正文、published story 和 primary media；URUSHI 正文长度 2070 字符。
- 远端 `publication_publish_transition_guard` 已恢复为原始 `publication_blockers` 查询版本，`migration_publication_blockers_cache` 不存在。临时 cache 只在 gate 恢复期间存在，未绕过 `publishEntity` 或正式门禁。

## Schema 与 migration

- 本次没有新增仓库 migration：为避免内容未全部完成前让真实 `data/fpkg.db` 产生 pending migration，试验性远端关系索引已全部撤回；当前远端 migration marker 仍停在已登记的 035。
- `check:migrations`（包含 fresh full replay）通过；publication gate 的远端慢查询由 gate 期间的可回滚 blocker cache 处理。
- 远端仍有已知 FK 声明漂移：`concept_matches`、`entity_attributes`、`entity_links`、`entity_tags`、`tag_compositions`、`tag_hierarchy`。同步脚本只报告并保留该漂移，不执行破坏性重建。
- 远端保留历史多余行（例如审阅历史和若干 evidence/reference rows）；本同步器是 append/upsert-only，不删除远端行，因此不能声称远端与 checkpoint 字节级相等。

## 本地验证

- `node --test --import tsx tests/migration/sync-local-catalog-to-turso.test.ts`：2/2 通过。
- 迁移脚本显式 strict TypeScript 检查通过。
- owned 文件 Biome 检查通过；`git diff --check` 通过。
- `pnpm run check:migrations` 与 `pnpm run check:publication-gate` 通过；后者确认 current-catalog disposable-copy upgrade invariance，不要求向真实 catalog 写入新 migration。

## 未完成范围

这只是远端资料库迁移与发布门禁收口，不代表全量内容 goal 完成。品牌／型号覆盖审计、剩余内容包、全站自动检查、真人遍历、生产部署和线上逐条复查仍需继续；在这些事项有独立证据前不得将总 goal 标记为 `complete`。
