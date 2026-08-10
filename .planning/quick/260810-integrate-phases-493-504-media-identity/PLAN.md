---
phase: 569
quick_id: 260810-integrate-phases-493-504-media-identity
status: complete
created: 2026-08-10
---

# Phase 569 Plan — integrate existing media and identity repairs 493–504

## Objective

在 Phase 568 owned checkpoint 上复用已经完成的 Phase 493–501、503、504 wrapper，补入当前副本尚未包含的媒体去重、品牌主图分离、Waterman Allure 身份收尾、Maiora 主图分离及 Pelikan M800 retired redirect。只使用 caller-owned checkpoint，不创建新实体、不重写研究包、不连接 Turso、不写真实 `data/fpkg.db`。

## Scope and order

按既有依赖顺序运行 Phase 493 → 494 → 495 → 496 → 497 → 498 → 499 → 500 → 501 → 503 → 504；每个 wrapper 同一副本首次执行后立即 replay。Phase 502 是既有集成摘要而非 apply wrapper，因此不重复执行。

## Verification

记录所有 first/replay 退出码、媒体/身份回读、approved-primary duplicate 查询、SQLite integrity/FK、public-media dry-run、readiness/coverage/quality、library/data contract、TypeScript、diff check 与 build。明确剩余重复组或 retired backlog，不将本批媒体修复冒充全量 goal 完成。
