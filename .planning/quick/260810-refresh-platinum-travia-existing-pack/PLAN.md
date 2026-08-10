---
phase: 574
quick_id: 260810-refresh-platinum-travia-existing-pack
status: complete
created: 2026-08-10
---

# Phase 574 Plan — protect the existing Platinum Travia pack from legacy downgrade

## Objective

在 Phase 573 caller-owned checkpoint 上审计仓库既有
`scripts/apply-phase296-platinum-3776-travia-content.ts`。审计发现这个旧包会把
较新的 Phase 447 Platinum 品牌正文降级为 Phase 42 版本；而 Travia 正文本身并没有
获得新的正文深度。因此本任务给旧包增加发布优先级保护，并用定向回归证明既有
Travia 内容、variants、来源、媒体和 maker 关系保持不变。不创建新实体、不改写研究
文件、不连接 Turso、不写真实 `data/fpkg.db`。

## Verification

记录旧包首次运行、replay、Phase 447 恢复与恢复 replay 结果；回读最终 checkpoint
中的品牌/型号正文长度、来源、variants、references、主图、maker 关系和 SQLite
完整性，并运行定向回归、TypeScript、diff check 与 production build。全量 readiness
结论继续单独报告，不能把这个单包保护修复当作全量完成。
