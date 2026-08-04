# Phase 481：正式本地迁移与有界 Turso 同步

## 范围

- 以已完成 Phase 480 的 caller-owned checkpoint 作为本次正式本地资料库候选，不在 `data/fpkg.db` 上做试验性写入。
- 在替换前保存 `data/fpkg.db` 的 main/WAL/SHM 可恢复备份，并记录源、目标和保护快照。
- 迁移前后运行 integrity、library contract、quality、public-boundary 与公开集合计数检查。
- 使用现有 `scripts/sync-local-catalog-to-turso.ts` 的有界、显式确认路径同步已登录的 Turso `fpkg`；不运行全表高耗读 dry-run。
- Turso 远端只做 bounded primary-key/schema/readback 对账；不把 readiness 视图的 NOMEM 风险冒充通过。

## 明确不在本阶段

- 不删除或覆盖其他 agent 的 research、`.next-phase*`、checkpoint 或 Montblanc quick 目录。
- 不扩建 Playwright、通用验收或 AI/LLM 功能。
- 不把本阶段迁移、Turso 同步或单次线上读回当作全量 goal 完成；部署、真人遍历、部署后线上逐条复查和剩余全量证据仍需完成。

## 验收证据

1. Phase 480 checkpoint 的基线快照、实体/公开集合、quality/library contract 记录完整。
2. 正式替换前 backup 可读，替换后 `PRAGMA integrity_check` 为 `ok`，受保护 backup 不变。
3. 本地公开集合与 checkpoint 完全一致；public-boundary 和定向 sitemap/页面检查通过。
4. Turso schema、主键/自然键、publication snapshot 与本地源完成有界对账；远端写入仅在显式 `--apply --ack-remote-write` 下执行。
5. 所有命令输出与剩余边界写入 SUMMARY；real catalog 不再被当作 disposable test copy。
