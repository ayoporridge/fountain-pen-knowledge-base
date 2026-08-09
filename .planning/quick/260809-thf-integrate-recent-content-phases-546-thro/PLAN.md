---
name: integrate-recent-content-phases-546-through-551
status: complete
created: 2026-08-09
---

# Integrate recent content phases 546–551 locally

## Objective

在不访问 Turso、也不写入 `data/fpkg.db` 的前提下，从既有 Phase 544 owned checkpoint 复制一个本阶段 checkpoint，按顺序重放 Phase 546–551 的已提交内容包，验证最近六批内容能在同一资料库中正式本地迁移、可重放且不破坏真实库。

## Non-goals

- 不修改实体身份、正文或图片包本身。
- 不正式迁移真实 `data/fpkg.db`，不连接远端。
- 不提交 checkpoint 数据库、WAL 或 SHM 文件。

## Verification contract

- 复制来源快照保持不变，所有 wrapper 清空远端环境变量。
- Phase 546–551 首轮均按预期 `published`，随后重放均为 `noop`。
- SQLite 完整性、内容 hash、公开正文、来源、审核、primary media 与 `made_by` 关系读回通过。
- `data/fpkg.db` SHA-256 在整个过程前后相同；只提交本 quick 的 PLAN/SUMMARY（如需要）。
