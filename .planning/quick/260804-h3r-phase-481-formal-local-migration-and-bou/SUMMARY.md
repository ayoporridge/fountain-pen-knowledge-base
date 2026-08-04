# Phase 481：正式本地迁移与有界 Turso 同步记录

## 本地正式迁移

- 来源 checkpoint：`.planning/quick/260804-gng-phase-480-diplomat-excellence-a2-nahvalu/checkpoint.db`。
- 来源、正式目标和受控同步副本的 main-file SHA-256：`d93136ec6e5f12812b795f59b549b74d889a8b6d4dbd2c9071304a8107964c77`。
- 替换前 `data/fpkg.db` main-file SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。
- 可恢复备份：`.planning/quick/260804-h3r-phase-481-formal-local-migration-and-bou/checkpoint/formal-local-backup/fpkg.db`；替换前 WAL/SHM 当时不存在，未伪造 sidecar 备份。
- 正式替换使用临时文件后 `mv`，没有删除旧库；备份 main-file 与替换前哈希相等。

## 正式库回读

- `PRAGMA integrity_check`：`ok`。
- `PRAGMA foreign_key_check`：空。
- `entities=981`，`public_entities=935`。
- 公开集合：article 255、brand 115、concept 10、nib 2、pen 553。
- `entity_publications`：published 673、retired 23。
- `npx tsx scripts/check-data-contract.ts`：通过（article 275、brand 119、concept 13、nib 3、pen 571）。
- `npx tsx scripts/check-article-content.ts`：255 个公开 article 全部通过。
- `npx tsx scripts/check-public-boundary.ts --all`：published blockers、list/per-ID/aggregate/context/reverse diff 均为 0；31 个 exact identity、19/19 完整品牌反向型号关系通过。
- `scripts/audit-entity-quality.ts --database-path data/fpkg.db`：690 entities、668 active、22 retired lineage；duplicate groups 0、suspicious pen articles 0、thin brand/model 0、made_by blockers 0。
- `scripts/check-library-contract.ts --database-path data/fpkg.db`：sources 2788、sourceItems 4553、claims 4636、citations 11816、stories 718、events 992、media 986、aliases 2406、commonsMedia 4；contract OK。

## 构建与本地页面读回

- `TURSO_DATABASE_URL='' TURSO_AUTH_TOKEN='' FPKG_DATABASE_URL='' CI=1 pnpm build`：通过；Next 15.5.18 编译、类型检查、静态页生成和 standalone runtime 准备均通过。
- 本地 `next start` 在 3100 端口启动后，sitemap 返回 HTTP 200，包含 954 个 URL。
- 12 并发全 sitemap 读回：首轮 953/954 HTTP 200、0 个短响应；唯一超时为聚合页 `/library/sources`（30 秒上限）。将该页延长至 180 秒后返回 HTTP 200、6,182,808 bytes，因此本地 954 个 URL 最终全部可达。
- 重点页面均 HTTP 200 且非空：`/pen/pilot-custom-urushi`（140892 bytes）、`/pen/diplomat-excellence-a2`（94727）、`/pen/nahvalur-schuylkill`（97712）、`/pen/delike-element`（89070）、`/brand/pilot`（109292）、`/brand/diplomat`（74988）、`/brand/nahvalur`（92366）。

## Turso 边界

- 已加载 `.env.local` 的 Turso 凭据并确认 `fpkg` URL；但有界 stable-ID dry-run 在首次远端读取时被服务端拒绝：`BLOCKED: Operation was blocked: SQL read operations are forbidden`。
- 当前 `turso plan show`：Starter、Overages disabled、rows read `748.5M / 500M`（150%）；下次配额重置为 `2026-09-01 08:00 CST`。
- 未进行任何远端写入；没有用盲写、绕过读取门槛或新建同步框架。待用户启用 overages/升级计划或下次重置后，需重新跑 bounded dry-run，再显式 `--apply --ack-remote-write`。

## 未完成边界

本阶段只证明正式本地库已切换、契约和本地页面通过；全量 goal 仍未完成。Turso 同步因计划配额被阻塞，依赖该同步的生产部署/部署后线上逐条复查尚未完成；真人遍历、完整生产复查及最终全量证据仍需继续。
