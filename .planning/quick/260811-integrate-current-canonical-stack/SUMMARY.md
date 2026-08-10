---
phase: 582
quick_id: 260811-integrate-current-canonical-stack
status: complete
completed: 2026-08-11
---

# Phase 582 Summary — integrate the current canonical content stack offline

## Result

在 caller-owned checkpoint 上顺序重放 11 个已有内容 wrapper：Phase 559、560、561、562、
563、564、565、566、578、579、581。没有连接 Turso，没有写入真实 `data/fpkg.db`，没有
创建通用 runner 或 Playwright/readiness 基础设施。

- 新增 5 个具体型号：Wancher Aluminum Classic、Aluminum Contemporary、Timeless Silk
  Black、Jade Fountain Pen，以及 Caran d’Ache 849 Fountain Pen。
- 深化既有 canonical：Wancher Zogan Swan Urushi Black、Kyoto Urushi Asagao、Oita
  Urushi Kurozan、Tsuikin Kanhizakura、Pilot MR Metropolitan、Zogan Momiji Green
  Tamamushi。
- Phase 581 继续把旧 Green Tamamushi Dream Pen 路由和 Phase 566 的旧 Oita donor 退休，
  两条旧 URL 均保留 permanent redirect；canonical 型号各只有一个正确 `made_by`。

## Verification

- Phase 582 定向 node:test：1 passed / 0 failed；首次运行全部为 `published` 或预期的
  `retired`，同一 checkpoint replay 的 11 个 wrapper 全部为 `noop`。
- owned checkpoint readiness：809 audited（119 brands、690 pens），785
  published/public/content-ready，0 published/public blockers；24 backlog 均为 retired
  lineage，因此 `inventory_complete=true`、`public_clean=true`，但
  `content_complete=false`、`complete=false`。
- entity quality：809 audited、785 active、24 retired excluded；duplicate groups 0、
  suspicious pen articles 0、thin entities 0、broken `made_by` links 0。
- 目标回读见 `evidence/readback.txt`：13 个目标/旧 lineage 行均有预期状态，5 个新型号和
  Green canonical 为 `published`、`publishable=1`、`blocker_count=0`；两条旧路径的
  permanent redirect 和 6 条 canonical `made_by` 关系均可回读。
- `npx tsc --noEmit`、目标 Biome、tracked diff check 均通过。
- 真实 `data/fpkg.db` SHA-256 前后仍为
  `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`；owned checkpoint
  的 SHA 记录在 `evidence/owned-checkpoint.sha256`。

## Boundary

这份 checkpoint 是正式迁移前的离线候选副本，不是真实资料库或线上站点。24 条 retired
lineage 尚未完成正式 inventory 处置；其余内容覆盖、Turso 正式迁移与远端读回、生产部署、
真人遍历和线上逐条复查仍属于总 goal 的未完成工作，不能调用 `update_goal({status:"complete"})`。
