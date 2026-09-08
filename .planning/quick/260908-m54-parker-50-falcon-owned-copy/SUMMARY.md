---
quick_id: 260908-m54
status: complete
description: 修正 Parker 50 Falcon 型号页重复小节标题并完成本地 owned-copy 回归
completed: 2026-09-08
---

# Quick Task Summary: Parker 50 Falcon 去重复小节

## Outcome

将 Parker 50 Falcon 源稿中重复出现的“交易记录应如何写”标题合并为一个小节。两段
不同的交易记录信息均保留，未改动事实、来源或其他品牌／型号内容。

## Owned-copy verification

- `tests/content/phase622-parker-50-falcon-dedup.test.ts`：1/1 通过。
- caller-owned disposable copy 首次 apply 为两个 pack（Parker 品牌上下文与 Parker 50）
  `published`，Parker 50 的正文标题从 2 个变为 1 个；replay 返回 `noop/noop`。
- Parker 50 正文仍超过 2,000 Unicode 字符，published story 与 entity body 均只含一个
  `## 交易记录应如何写`。
- `pnpm exec tsc --noEmit`、scoped Biome check 与 `git diff --check` 通过；原始测试输出和
  边界记录见 `evidence/owned-copy-repair.json`。

## Database boundary

- 没有写入真实 `data/fpkg.db`，没有写入 Turso。
- 真实 catalog SHA-256 保持
  `753a341691b15669f0225169a1646603c6071e75a836d921ffa8b98b7808dea5`；真实库仍保留旧正文
  的两个标题（计数 2），待全量内容包完成后的正式迁移门统一安装。
- 既有 research、`.next-phase*`、其他 quick 资产及 `research-skb-penton-2026-07-20.md`
  的已有修改均未触碰。

## Changed files

- `.planning/content-research/parker-50-falcon-publishable-content-2026-07-19.md`
- `scripts/data/phase622-parker-50-falcon-dedup.ts`
- `scripts/apply-phase622-parker-50-falcon-dedup.ts`
- `tests/content/phase622-parker-50-falcon-dedup.test.ts`
- `.planning/quick/260908-m54-parker-50-falcon-owned-copy/`
