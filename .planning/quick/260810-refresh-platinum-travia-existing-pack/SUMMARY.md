---
phase: 574
quick_id: 260810-refresh-platinum-travia-existing-pack
status: complete
completed: 2026-08-10
---

# Phase 574 Summary — legacy Travia pack precedence guard

## Result

本次没有新增实体，也没有把 Travia 正文误报为已深化。Phase 296 旧包在 Phase 573
checkpoint 上首次运行时同时发布了 Platinum 品牌和 Travia；回读发现品牌正文从
Phase 447 的 2612 字符降为 Phase 42 的 1979 字符，而 Travia 仍为 2386 字符，说明
旧包会造成品牌内容回退，却没有带来型号正文增长。

随后在同一 owned checkpoint 上重放现有 Phase 447 品牌深度包，恢复了 Platinum 品牌
的 2612 字符正文和
`curated-content:phase447-platinum-brand-depth-v1:4c5e71e8a50afe7ad3984670b583a98a5bd8c5ca7e5a6949578262f4aea5ddbe`
来源标记；恢复 replay 为 noop。

## Safety fix

`apply-phase296-platinum-3776-travia-content.ts` 现在在写入前检查 canonical Platinum
品牌的来源标记。当已存在 Phase 447 或更高版本的 Platinum brand-depth 内容时，旧
Phase 296 包会明确拒绝运行，避免未来重放再次降级品牌正文。

定向回归测试证明拒绝发生在写入前，且 Travia 仍保持 published/public、正文至少
2000 字符、14 claims、3 variants、6 references、1 张 primary media，以及指向
Platinum 的唯一 `made_by` 关系；品牌仍为 Phase 447、2612 字符。测试同时确认真实
`data/fpkg.db` 的 catalog snapshot 未变化。

## Evidence

- `evidence/first.json` / `replay.json`: 旧包首次运行与 replay（仅用于记录发现）。
- `evidence/restore-first.json` / `restore-replay.json`: Phase 447 恢复与幂等 replay。
- `evidence/readback.txt`: 最终 owned checkpoint 的品牌、型号、variants、关系、计数和 SQLite integrity 回读。
- `evidence/target-test.txt`: 定向回归通过（1/1）。
- `evidence/source-hash.txt`: owned checkpoint SHA；真实数据库哈希保持未改动。

该 Phase 只完成内容包的防回退保护；Turso 迁移、全量公开页面验收、生产部署和线上
复查仍未完成，不能据此结束总目标。
