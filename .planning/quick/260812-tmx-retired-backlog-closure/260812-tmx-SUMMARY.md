# Quick 260812-tmx Summary

## Outcome

Phase 601 没有重新盘点库存，而是逐条处置 Phase 600 checkpoint 中 24 条 retired brand／pen backlog 与额外 1 条 retired nib。清单把它们收敛为：14 条已有唯一 canonical route 的 terminal donor、3 条不能任意跳转的一对多 split、1 条应继续 hard-404 的 mixed donor、1 条 Aurora brand placeholder，以及 6 条真正需要可靠外部身份研究的记录。

本批发现 Phase 504 Pelikan M800 canonical merge 已存在于仓库，但没有进入 Phase 600 候选链；在新的 caller-owned checkpoint 中重放后补齐旧路由与 merge lineage。Aurora 旧 pen placeholder 已有经过审核的 hard-404，本批没有覆盖该决定，只补 donor → Aurora brand 的 retire lineage。真实 `data/fpkg.db` 未写入，Turso 未访问。

## Files

- `.planning/content-research/retired-backlog-disposition-phase601.md`
- `scripts/apply-phase601-retired-backlog-closure.ts`
- `tests/content/phase601-retired-backlog-closure.test.ts`

## Verification

- 定向回归 1/1 PASS，覆盖 Phase 600 source SHA、真实库 SHA、retired 类型计数、首次 apply、完整 replay no-op、三类 remote selector fail-closed、public donor 排除、source／real／guard family 不变。
- 持久 checkpoint 首次结果：Pelikan M800 `applied`，Aurora lineage `applied`；第二次两项均 `noop`。
- Pelikan 旧路径 `/pen/百利金-pelikan-m800` permanent redirect 到 `/pen/pelikan-souveran-m800`，并有 merge lineage。
- Aurora 旧路径继续是 `hard_404 / brand_generic_placeholder_retired`；新增 retire lineage 指向 published Aurora brand，不误导到 Aurora 88、Optima 或品牌页。
- 最终 checkpoint SHA-256：`7ef7d26e5d377b8c827e8d1c4874fb7d08f7021748163a40ffefaaeb0817492e`。
- Phase 600 source SHA-256 仍为 `083442c32cdace53b72330b5682c24612ec5326ecfce8727a01db1e4b2e960ac`；真实库仍为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。
- SQLite integrity `ok`、foreign key 0；TypeScript、Biome、diff check 全部通过。
- 本批不改变公开内容：brand／pen public 仍为 849，retired 仍为 4 brands + 20 pens，另有 1 nib。其价值是关闭身份与旧路由链，而不是掩盖 backlog 数字。

## Remaining Queue

- 为 Leonardo、Opus 88、Sheaffer Craftsman 三个一对多 split donor 制作不误导的旧入口导航／fallback。
- 研究 retired Sailor Naginata-Togi nib、上海、半句、塞尔、意斯华与 `SKB派顿 F10 / F21` 六条未决身份。
- 继续冻结外部型号覆盖；全部内容封板后才迁移真实库并进行真人遍历、Turso、部署和线上复查。

Full-corpus goal 继续保持 active；Phase 601 不是全站完成。
