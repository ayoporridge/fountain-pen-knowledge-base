# Phase 394 Summary — Refresh Pilot Custom 823 canonical content

## Outcome

刷新现有 `oJyaQy9bEc8V`（`/pen/pilot-custom-823`）而不是新建 Pilot 或 Custom 823 实体。正文以读者可用的中文重新组织 FKK-3MRP/FKKE-3MRP 身份、2000 年系列节点、真空 plunger 工作顺序、尾端约 2 mm 供墨、约 1.5 ml 官方容量语境、14K No.15 F/M/B/S、当前日本 SKU、美国颜色命名边界、清洗／墨水／气压风险、相邻 Custom 型号区别和新旧笔选购检查。

旧中文重复实体 `xQ-15uqtdMGA` 沿用既有身份收口：publication 为 `retired`，`/pen/百乐-pilot-custom-823` 保持 permanent redirect 到 `/pen/pilot-custom-823`。Pilot `made_by` 关系和品牌反向导航各保持唯一，未创建重复型号。

## Sources

- [Pilot Custom 官方 lineup：CUSTOM823](https://www.pilot-custom.jp/en/lineup/other.html)：FKK-3MRP、plunger filling、14K No.15、F/M/B/S。
- [Pilot Custom 官方 history](https://www.pilot-custom.jp/en/history/)：2000 年节点和约 1.5 ml 的大容量语境。
- [Pilot 日本网页目录：FKK-3MRP-NCF](https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100003601&volumeName=00004)：透明 F SKU、后缀表、148.4 mm、15.7 mm、29.5 g、INK-70 建议。
- [Pilot 官方支持：CUSTOM 823 使用与保养](https://www.pilot.co.jp/support/warranty/en/fountain/custom823.html)：填充、尾端阀门、清洗、墨水限制、不可自行维修、禁带飞机。
- [Pilot US Fine Writing brochure](https://pilotpen.us/Downloads/Fine_Writing_Brochure.pdf)：真空 plunger 和 smoke/amber 市场颜色语境。
- [The Pen Addict：Pilot Custom 823 review](https://www.penaddict.com/blog/2015/11/16/pilot-custom-823-fountain-pen-review)：专业书写／上墨观察。
- [The Gentleman Stationer：Pilot Custom 823](https://www.gentlemanstationer.com/blog/2016/8/27/pen-review-pilot-custom-823)：地区配色和供墨边界观察。

## Owned files

- `.planning/content-research/pilot-custom-823-phase394.md`
- `scripts/data/phase394-pilot-custom-823-refresh.ts`
- `scripts/apply-phase394-pilot-custom-823-refresh.ts`
- `tests/content/phase394-pilot-custom-823-refresh.test.ts`
- `.planning/quick/260803-hq3-refresh-pilot-custom-823-canonical-sourc/PLAN.md`
- `.planning/quick/260803-hq3-refresh-pilot-custom-823-canonical-sourc/SUMMARY.md`

Checkpoint database is disposable evidence only and is intentionally not staged:

- `.planning/quick/260803-hq3-refresh-pilot-custom-823-canonical-sourc/checkpoint/fpkg.db`

## Verification evidence

- `pnpm exec tsx --test tests/content/phase394-pilot-custom-823-refresh.test.ts` — pass; the test creates an owned checkpoint copy, migrates it, rejects remote env selection, applies review → publish, checks four current review approvals, public membership, 12 `market_sku` variants, exact maker/reverse links, duplicate retirement/redirect, and noop replay.
- Persistent checkpoint apply — both brand navigation and the existing Pilot Custom 823 model returned `published`; model body readback was 8,094 characters; `public_entity_readiness` reported `blocker_count=0`, `publishable=1`; `publication_v2_source_group_counts` reported 4 primary/archive groups and 1 professional-secondary group for 823.
- Persistent checkpoint SQL readback — `PRAGMA integrity_check` = `ok`; 950 entities, 904 public entities, 642 published publications; 12 model variants; approved current fact/language/media/publication reviews present; old duplicate retired and redirect exact.
- Library counters on the checkpoint after this refresh: 3,525 approved source items, 3,346 approved claims, 9,471 approved citations, 652 published stories, 953 approved media assets. No entity was added by this phase.
- `pnpm exec biome check` on the owned TypeScript/test files — pass.
- `git diff --check` on the owned text/TypeScript/test/plan files — pass.
- `pnpm exec tsc --noEmit` — no Phase 394 diagnostics; only the pre-existing Phase 346 implicit-any pair and migration test `NODE_ENV` diagnostic remain.
- Protected real catalog SHA-256 before/after checkpoint work: `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`.

No formal migration to `data/fpkg.db`, Turso, deployment or online page review was performed in this phase. The full content goal remains open.
