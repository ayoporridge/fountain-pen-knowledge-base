# Formal local migration: Phase 505–545

## Scope

将已在 `260806-kyq` owned checkpoint 顺序验证通过的 `checkpoint/catalog-2.db` 正式迁移到本地 `data/fpkg.db`。保留可恢复的主库备份，先核对 source/pre-migration snapshot，再做一次明确的本地替换；不写 Turso、生产或线上站点。

## Safety gates

1. source checkpoint 必须是普通本地 SQLite 文件，hash 与已审计 checkpoint 一致。
2. `data/fpkg.db` 的替换前主文件必须复制到本任务的 `formal-local-backup/`，并逐字节比对。
3. 替换后立即核对 hash、integrity、foreign keys、publication boundary、identity parity 与内容/媒体审计。
4. 更新受控 `phase19-fixtures` real-catalog fingerprint，使只读与 fixture isolation 继续锁定当前正式本地 catalog。

## Execution status

- [x] 记录 pre-migration real/checkpoint snapshots。
- [x] 备份旧 `data/fpkg.db`，备份 hash 与旧主库一致。
- [x] 用 checkpoint main file 替换本地 catalog；Turso/线上保持未写入。
- [x] 更新 `scripts/lib/phase19-fixtures.ts` fingerprint。
- [x] 完成本地 integrity、public boundary、library/evidence/publication/data/article/audit-readiness、coverage、quality、media 与 readiness 读回。

## Explicit boundary

这是 Phase 505–545 的正式本地批次迁移，不是全量 goal 完成证明。readiness 仍有 23 条 backlog，后续还需继续内容修复、远端 Turso 同步、构建/全站检查、真人遍历、部署和线上逐条复查。
