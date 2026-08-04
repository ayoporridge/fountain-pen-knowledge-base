# Quick Plan: Integrate completed Phase 482–492 content packs

## Objective

在 caller-owned checkpoint copy 上顺序回放已完成的 Phase 482–492 内容包，确认所有目标实体可发布、来源/媒体/品牌关系不漂移，并生成支持正式迁移的全库证据；证据通过后按总目标授权正式更新本地 `data/fpkg.db`，Turso 仍只做受配额保护的同步尝试。

## Tasks

1. 从真实本地库建立本 quick 自有 checkpoint，记录真实库快照与保护目录状态。
2. 按 482→492 顺序调用既有 apply 脚本，记录首次发布和 replay noop；不修改任何研究包。
3. 在合并副本运行 SQLite 完整性、library contract、entity quality、readiness、关系抽查和 TypeScript/构建检查；确认 replay 全部 noop。
4. 证据通过后备份并正式替换本地 `data/fpkg.db`，复跑关键检查、构建和全 sitemap 页面读回；记录 Turso 只读配额阻断与剩余全量工作，更新本 quick SUMMARY；不调用 `update_goal(complete)`。

## Guardrails

- 只接受 caller-owned、非 symlink 的 checkpoint copy。
- checkpoint 回放运行时清空 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`；正式本地迁移前保留可恢复备份。
- 保护他人 research、`.next-phase*` 与 Montblanc quick 目录；只写本目录的 checkpoint、日志和 SUMMARY。
- Turso 同步不得绕过远端 rows-read 配额；阻断时不写远端。
