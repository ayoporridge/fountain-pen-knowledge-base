---
phase: 576
quick_id: 260810-integrate-pilot-custom-urushi-phase400
status: complete
created: 2026-08-10
---

# Phase 576 Plan — integrate the deeper Pilot Custom URUSHI pack

## Objective

在 Phase 575 caller-owned checkpoint 上重放已经完成并通过定向测试的 Phase 400
Pilot Custom URUSHI refresh。当前 checkpoint 中同一 canonical entity 仍是 Phase 105
的 2070 字符版本；Phase 400 pack 使用官方 FKV-88SR exact SKU、目录、说明书和可靠
专业资料，正文约 8115 字符，包含九个现行 SKU、规格、维护和 sibling 边界。本批只
深化现有 `s105PILOT_URUSHI`，不创建重复实体、不修改研究正文、不连接 Turso、不写
真实 `data/fpkg.db`。

## Verification

记录首次 apply 与 replay，回读正文长度、Phase 400 source marker、12 variants、来源、
审核发布门、规格和 Pilot maker topology；运行既有 Phase 400 定向测试、SQLite
integrity/FK、public-media dry-run、readiness/coverage/quality、library contract、
TypeScript、Biome、diff check 和 production build。全量 readiness 结论继续单独报告。
