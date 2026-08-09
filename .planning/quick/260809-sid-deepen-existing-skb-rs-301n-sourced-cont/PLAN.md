---
name: deepen-existing-skb-rs-301n-sourced-content
status: complete
created: 2026-08-09
---

# Deepen existing SKB RS-301N sourced content

## Objective

在保留 `s61SKBRS301N` 既有身份和台湾 SKB `made_by` 关系的前提下，依据 SKB 官方 RS-301N 商品页、品牌目录与独立型号语境，补足自然中文正文、SKU 边界、材料、专用吸墨器、携带维护和选购建议；仅在 owned checkpoint copy 上走既有审核—发布链路。

## Owned files

- `.planning/content-research/skb-rs-301n-depth-publishable-content-2026-08-09.md`
- `scripts/data/phase548-skb-rs-301n-depth.ts`
- `scripts/apply-phase548-skb-rs-301n-depth.ts`
- `tests/content/phase548-skb-rs-301n-depth.test.ts`
- 本 quick 目录下的 `PLAN.md`、`SUMMARY.md`、checkpoint；checkpoint 不提交。

## Explicit non-goals

- 不新建 SKB、RS-301N 或特别版实体。
- 不把 KANO/200K 等独立特别版参数回填到普通 RS-301N。
- 不直接写入 `data/fpkg.db`，不触碰 Turso。
