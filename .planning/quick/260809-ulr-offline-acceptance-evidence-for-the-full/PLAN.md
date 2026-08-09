---
name: offline-acceptance-evidence-for-the-full
status: completed
created: 2026-08-09
---

# Offline acceptance evidence for the full repair goal

## Objective

在 Turso 暂不可用时，用 caller-owned checkpoint 重放 Pilot Custom URUSHI，并完成不依赖远端数据库的内容、身份、证据、发布门、公开边界、构建和 Markdown 检查；记录真实远端迁移、部署与线上复查仍未完成的边界。

## Non-goals

- 不修改 `data/fpkg.db`、Turso 或线上数据。
- 不改变通用 readiness、Playwright、AI/LLM 或搜索基础设施。
- 不把本地检查结果解释为正式迁移、部署或线上验收。

## Verification contract

- Phase 105 只在非符号链接、明确位于本 quick owned root 的 checkpoint 上运行；第一次和重放均可核对。
- 真实数据库 SHA-256 在前后相同。
- 本地 readiness、quality/coverage、library/data/evidence/publication contract、public boundary、build 和 Markdown checks 的输出保留在本 quick 的 evidence 目录。
- SUMMARY 明确区分已完成的离线工作与等待额度恢复后才能做的远端工作。
