---
quick_id: 260908-m54
status: complete
description: 修正 Parker 50 Falcon 型号页重复小节标题并完成本地 owned-copy 回归
---

# Quick Plan: Parker 50 Falcon 去重复小节

## Scope

- 只处理 `.planning/content-research/parker-50-falcon-publishable-content-2026-07-19.md` 中重复的“交易记录应如何写”小节标题。
- 合并两段不同的交易记录说明，保留全部事实与来源边界，不改 Parker 品牌页或其他型号。
- 在 caller-owned disposable catalog copy 上重放既有 Parker pack，验证正文、publication hash、重复标题扫描与 replay 幂等。
- 不写真实 `data/fpkg.db`，不写 Turso，不触碰既有 research、`.next-phase*` 或其他 quick 资产。

## Acceptance

- [ ] Parker 50 源正文只出现一个 `## 交易记录应如何写` 标题，原两段信息均保留。
- [ ] owned copy 首次 apply 产生 Parker 50 的新内容 hash，replay 返回 `noop`；真实 catalog snapshot 保持不变。
- [ ] Parker 50 body 仍满足现有长度与 published/readiness contract；focused regression、TypeScript 与 diff 检查通过。

## Verification

- `pnpm exec tsx --test tests/content/phase622-parker-50-falcon-dedup.test.ts`
- `pnpm exec tsx --test tests/content/phase36-parker-25-t1-50-falcon-100.test.ts`
- `pnpm exec tsc --noEmit`
- `pnpm exec biome check scripts/data/phase622-parker-50-falcon-dedup.ts scripts/apply-phase622-parker-50-falcon-dedup.ts tests/content/phase622-parker-50-falcon-dedup.test.ts`
- `git diff --check`

## Output

`.planning/quick/260908-m54-parker-50-falcon-owned-copy/SUMMARY.md`
