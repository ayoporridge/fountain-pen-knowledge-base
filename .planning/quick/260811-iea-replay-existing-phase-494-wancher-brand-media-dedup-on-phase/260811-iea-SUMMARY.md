---
status: complete
quick_id: 260811-iea
scope: offline-integration-replay
replayed_source_commit: 28756ccd
---

# Phase 587: 补重放 Phase 494 主图去重包

本 quick 没有新增实体或修改内容包代码，只把已提交的 Phase 494 scoped media dedup wrapper 补进 Phase 586 后继候选。Turso 未被访问，真实 `data/fpkg.db` 未被写入；full corpus goal 仍为 active。

## 结果

- 输入候选 SHA-256：`c1b611dd9d20e6dad77bc4f3c04f4ea9ab8400bc4d8e808cababaa3969409fd3`。
- 输出候选 SHA-256：`a4de9c8f2ce0cb7b3f9d1d0c1ffaf20ee9d0c461782cd537a282db43739b463e`。
- 真实库 SHA-256：`acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`，前后不变。
- 首次重放：仅 Wancher 品牌为 `published`；Esterbrook、Sheaffer Connaisseur／Imperial／Icon、Opus 88 五个已应用目标均为 `noop`。
- 第二次重放：6/6 全部 `noop`，content hash 稳定。
- Wancher 品牌主图改为 `/images/library/site-original/wancher/wancher-brand-family.svg`；True Ebonite Matte Black 型号继续使用自己的 Phase 107 SVG。
- 全部 current public primary media path 重复组从 1 降为 0。

## 离线验收

- SQLite `integrity_check=ok`、foreign-key check 为空；Wancher publication contract v3 revision current，fact／language／media review 为 3/3。
- readiness：815 个 inventory、791 个 current public、791 个 content-ready、published/public blocker 均为 0；24 个 backlog 均为保留的 retired lineage，因此总审计的 `content_complete` 仍如实为 false。
- library contract 通过；media audit 为 807/807 healthy；production build 通过。
- 本地 production readback：`/brand/wancher`、`/pen/wancher-dream-pen-true-ebonite-matte-black` 与两张 SVG 均 HTTP 200；两页各有一个 H1，品牌页包含正确型号链接与独立品牌图，型号页包含独立型号图。
- 1600×900 Wancher 品牌 factual SVG 已人工查看，无裁切、溢出或错位。
- checkpoint、readiness 与 media evidence 只在本 quick 本地保留，不提交 Git。

## 下一步

继续用现有 research、wrapper 与候选库推导真正尚未覆盖的重要型号；优先补内容与身份缺口。所有离线内容包封板后，再执行统一真实库迁移和全量本地真人遍历；Turso 额度恢复后才执行云端同步、生产部署与线上逐条复查。
