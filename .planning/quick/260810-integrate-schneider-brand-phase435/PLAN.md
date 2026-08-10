---
phase: 577
quick_id: 260810-integrate-schneider-brand-phase435
status: complete
created: 2026-08-10
---

# Phase 577 Plan — restore the Schneider brand depth pack

## Objective

在 Phase 576 caller-owned checkpoint 上重放已经存在的 Phase 435 Schneider 品牌深度
包。当前 checkpoint 只有 Schneider 品牌仍停留在 Phase 139 的短正文，Caran d’Ache、
Onoto、SKB 与 Gravitas 已经是同批的 Phase 435 版本。本批只更新 canonical brand
entity `4RLQzNpb6WbN`，使用已审核的官方公司史、产品导航与型号边界资料，不创建重复
实体、不改动真实 `data/fpkg.db`、不连接 Turso。

Phase 435 wrapper 同时携带五个品牌的 replay-safe pack；因此需要回读五个品牌，确认
既有四个不会被降级，并确认 Schneider 的 Ray／BK402 导航与品牌正文已经恢复。

## Verification

在独立 owned checkpoint 上记录 Phase 435 首次 apply 与 replay，回读五个品牌的 source
marker、正文长度、来源、审核发布门和公开型号反向导航；运行既有 Phase 435 定向测试、
SQLite integrity/FK、public-media dry-run、readiness/coverage/quality、library contract、
TypeScript、Biome、diff check 和 production build。真实 `data/fpkg.db` 前后 hash 必须
保持不变。
