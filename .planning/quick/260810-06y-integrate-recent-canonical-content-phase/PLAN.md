---
name: integrate-recent-canonical-content-phase
status: complete
created: 2026-08-10
---

# Offline integration of recent canonical content

## Objective

在不连接 Turso、也不修改真实 `data/fpkg.db` 的前提下，把已完成且可重放的 Phase 546–557 内容包顺序应用到一个 owned checkpoint，确认最近内容在同一资料库中能够共存、重放幂等，并保留完整的离线质量／覆盖／readiness 边界证据。

## Non-goals

- 不新建 Pilot、Pelikan、Wancher 或其他重复实体，不重写内容包本身。
- 不修改真实资料库、Turso、部署或线上页面。
- 不扩建通用 AI、Playwright、readiness 或验收基础设施。
- 不提交 checkpoint 数据库及其 WAL／SHM，不触碰其他 agent 的 research、`.next-phase*` 或受保护 quick 目录。

## Verification contract

- 只从现有 Phase 554 owned checkpoint 复制出本 quick 的 caller-owned copy，且清空远端环境变量。
- Phase 546–557（含已有 Phase 556、557）首次应用结果可读回，重放全部为 `noop`，内容 hash 不变。
- 所有近期 canonical 的品牌关系、审核—发布门、来源、规格、primary media 和公开正文可读回。
- library contract、SQLite integrity、quality／coverage／readiness 离线审计有结果；既有 retired backlog 明确记录，不被误报为完成。
- 真实 `data/fpkg.db` SHA-256 保持不变；提交只包含本 quick 的计划、摘要和精简证据。
