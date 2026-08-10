---
phase: 572
quick_id: 260810-pilot-custom-urushi-phase105-offline
status: complete
created: 2026-08-10
---

# Phase 572 Plan — Pilot Custom URUSHI offline publish gate

## Objective

在 Phase 571 owned checkpoint 上执行已修正的 `apply-phase105-pilot-custom-urushi-content.ts`，把 Pilot Custom URUSHI（`FKV-88SR`、蝋色漆硬橡胶、18K No.30、Pilot 墨囊／CON-40／CON-70N；紺青为 2024 color variant）通过项目既有 `recordEntityContentReview` 与 `publishEntity` 审核—发布路径。只写 caller-owned checkpoint，不写真实 `data/fpkg.db`，不连接 Turso。

## Scope and order

首次执行后立即 replay 同一 checkpoint；随后运行 `tests/content/phase105-pilot-custom-urushi.test.ts`、SQLite integrity/FK、目标实体回读、TypeScript、diff check 与 production build。若脚本仍触发 publication guard，则保留失败证据并停止，不绕过审核路径。

## Verification

核对 `s105PILOT_URUSHI` 正文、规格、variant、来源、主图、Pilot `made_by`、四项审核、published/public/readiness 以及真实库哈希不变。该 quick 仅证明离线包可重放，不代表真实迁移、Turso、部署或全量 goal 完成。
