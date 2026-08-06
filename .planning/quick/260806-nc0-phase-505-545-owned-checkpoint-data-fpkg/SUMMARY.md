# Summary: formal local migration of Phase 505–545

日期：2026-08-06

## Migration evidence

- source：`.planning/quick/260806-kyq-owned-checkpoint-phase-505-544-wancher-p/checkpoint/catalog-2.db`
- pre-migration real main SHA-256：`52dc44cdc7cf855563ac89cad2bedc747a88bc259df23f599b2c52c3372a9495`
- checkpoint / post-migration main SHA-256：`acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`
- 旧主库备份：`formal-local-backup/fpkg-before-formal-migration.db`，与 pre-migration 主库逐字节一致。
- `scripts/lib/phase19-fixtures.ts` 已更新到新主库 fingerprint；当前 real catalog 没有 WAL/SHM sidecar。
- 本次没有写 Turso、生产数据库或线上站点。

## Readback results

- SQLite integrity：`ok`；foreign-key 检查为空。
- 正式本地 catalog：1095 total entities；public brand/pen 为 115/666，共 781 个公开 brand+pen；retired publication 24。
- Kurozan duplicate：旧实体 `retired`，旧路由 permanent redirect 到 canonical，merge lineage 保留；active duplicate name groups 为 0。
- `check-public-boundary.ts --all`：published blockers、list/per-id/aggregate/context/reverse diff 全为 0；31 exact identities、19/19 reverse-brand models。
- `check-data-contract`、`check-article-content`、`check-library-contract`、`check-evidence-contract`、`check-publication-gate`、`check-migration-safety`、`check-audit-readiness --inventory`：均通过。
- media audit：796 scanned / 796 healthy / 0 failed，dry-run。
- coverage：119 brands（115 ready、4 gap）；685 pens（666 ready、3 starter、16 gap）。
- readiness：804 inventory、781 content-ready/published、published blockers 0、public blockers 0、backlog 23；`content_complete=false`、`complete=false`。

## Next gate

继续补齐 backlog 与新增品牌/型号后，再做 Turso 同步；随后执行 build、全站自动检查、真人遍历、部署及线上逐条复查。全量 goal 仍保持 active，不能以本次正式本地迁移作为完成标记。
