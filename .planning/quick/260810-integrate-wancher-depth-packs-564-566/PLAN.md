---
phase: 575
quick_id: 260810-integrate-wancher-depth-packs-564-566
status: complete
created: 2026-08-10
---

# Phase 575 Plan — integrate existing Wancher depth packs 564–566

## Objective

在不连接 Turso、也不修改真实 `data/fpkg.db` 的前提下，把现有 Phase 564、565、566
的来源化 Wancher 型号深化包顺序重放到 Phase 573 的 caller-owned checkpoint：
Zogan Swan Urushi Black、Kyoto Urushi Kasane-iro Asagao、以及 Oita Urushi Kurozan。
三者均已有 canonical entity 和独立定向测试；本批只复用既有 pack，不创建重复实体，
并保留 Phase 566 已退休的 Oita donor 边界。

## Verification

对每个 wrapper 记录首次运行与 replay，回读正文、来源、审核发布门、规格、variants、
媒体和 maker/duplicate identity；运行 SQLite integrity/FK、三项定向测试、TypeScript、
Biome、diff check 与 production build。全量 readiness／coverage 结果继续单独报告，
不能把三条 Wancher 型号的离线集成当作全量目标完成。
