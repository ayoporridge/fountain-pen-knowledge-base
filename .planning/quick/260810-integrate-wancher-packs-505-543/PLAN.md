---
phase: 570
quick_id: 260810-integrate-wancher-packs-505-543
status: complete
created: 2026-08-10
---

# Phase 570 Plan — integrate existing Wancher packs 505–543

## Objective

在 Phase 569 owned checkpoint 上按既有依赖顺序重放已经完成的 Wancher True Maki-e、Kiei Urushi、Hirota Urushi、Yakumo、Raden、Argentum、Tsuno、Cosmic Raden、Aizu、Kotoiro、True Ebonite、Rising Sun、Taka Makie、Urushi-e、True Urushi、Zogan 等内容包。只复用仓库现有 `apply-phase505`–`apply-phase543` wrapper，不创建新实体、不改写研究文件、不连接 Turso、不写真实 `data/fpkg.db`。

## Scope and order

按编号顺序运行 Phase 505–523、525–543；每个仍适用的 wrapper 在同一 caller-owned checkpoint 上首次执行后立即 replay。Phase 524 不再重放：其旧 donor 已由既有 Phase 566 身份合并流程退休，旧 wrapper 对 retired donor 的前置断言必然失败；保留失败输出和身份回读作为边界证据。

## Verification

记录所有 first/replay JSON 与退出码、checkpoint hash、目标实体与 Wancher 品牌关系回读。由于 Phase 505–543 首次与 replay 均为 no-op 且 checkpoint SHA 与 Phase 569 完全相同，沿用 Phase 569 已通过的 SQLite、media、readiness、coverage、quality、library/data contract、TypeScript、diff check 与 production build 证据；将本批局部 no-op 结果与剩余 readiness backlog 分开报告，不能冒充全量 goal 完成。
