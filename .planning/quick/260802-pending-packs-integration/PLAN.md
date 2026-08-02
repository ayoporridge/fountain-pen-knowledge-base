# Unified pending-pack integration and formal migration

## Scope

将 Phase 339–367 已通过各自定向回归的内容包按顺序重放到一个 caller-owned checkpoint copy，完成本地正式迁移，再同步到已经迁移 schema 的 Turso `fpkg`。本 quick 不代表全量 goal 完成；后续仍需生产部署、真人遍历和线上逐条复查，并继续处理真正缺失的品牌／型号。

## Safety contract

- 试验与重放只使用 `checkpoint/fpkg-copy.db`；真实库只在正式迁移步骤被替换。
- 正式替换前备份位于 `checkpoint/formal-local-backup/`。
- `data/fpkg.db` 的迁移前 hash 与 `checkpoint/protected.db` 均为 `526bacec...e3e6fb2`；迁移后真实库 hash 为 `c281ffbc...72d2b963`。
- 远端同步使用 `--apply --ack-remote-write`，仍通过 `recordEntityContentReview`／`publishEntity` 及 publication guard；不执行删除。
- 保留所有其他 agent 的 research、`.next-phase*` 与 Montblanc quick 目录，不纳入本次提交。

## Verification loop

1. 逐 phase 在 owned copy 重放，检查 terminal result 与 replay idempotence。
2. 在统一 copy 跑 coverage、entity quality、library contract、evidence contract、media audit。
3. 备份并正式迁移真实本地库，重复本地门禁。
4. 远端先跑 bounded dry-run，再以稳定 ID + UNIQUE index identity mapping 做幂等 upsert；最后比较远端 `public_entities` 和 publication snapshot。

## Remaining

- Fly.io 生产部署仍被 `flyctl auth login` 阻塞，需要用户登录。
- `public_entity_readiness` 在 Turso 上的全视图查询触发 `SQLITE_NOMEM`，不能把该视图的远端聚合当作已验收；已用 `public_entities` 全量 ID/slug/type 对账与 publication/review snapshot 对账替代当前只读证据，部署后需逐页复查。
- 全站公开内容的真人遍历、生产线上逐条复查及更广泛缺失品牌／型号补齐仍未完成。
