---
status: complete
quick_id: 260812-u9i
phase_number: 604
---

# Quick 260812-u9i Summary

## Outcome

Phase 604 收口最后五条已知未决身份。依据制造商自述、专业零售页与独立实物记录，恢复既有半句 Banju 品牌 ID，并发布 Banju Doer／实践家代表型号；同一型号的直条纹、菱格纹与颜色保持为 variants，不重复建实体。YiSiHua／意斯华被确认是 Asvine 的渠道名称，旧品牌实体继续 retired，并以正式 merge lineage 与永久路由指向 canonical Asvine；Asvine 内容 digest 保持不变。

Shanghai、Saier 与 SKB派顿 F10／F21 仍缺少足以证明独立品牌或精确型号身份的可靠资料，已形成终态研究说明并保持 retired hard-404，没有为清零而制造空页面。

所有数据库写入只发生在 Phase 603 caller-owned checkpoint 的 disposable／persistent copy；真实 `data/fpkg.db` 未写入，Turso 未访问。

## Verification

- 定向回归 1/1 PASS；格式化后最终重跑 94 秒通过。覆盖 ID／slug／name／alias collision、三类 remote selector 拒绝、首次发布、完整 replay no-op、Asvine digest 不变、三条 terminal retired digest 与 hard-404 不变，以及 source／real family 哈希不变。
- 持久 checkpoint 首次 apply：Banju 与 Doer 均 `published`；replay 均 `noop`。publication hashes 分别为 `sha256:v3:47af401854f61c65c01966ae961c8232000e30a42077927dd8ead77f2ab88966` 与 `sha256:v3:e069679674360403bffb182c595b85b30f2d0e5f029b68c1ee5ce7e0cecf88b0`。
- Phase 604 checkpoint SHA-256：`2ed0e5040e68167b529cc675793f5d8e1711e2de3605804355359256f0133ece`；Phase 603 source 仍为 `1fca38d561e419c2583029779a78193a6bfe2faa61b5e7e12c1eae956afaba2b`；真实库仍为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。
- TypeScript、Biome、xmllint、diff check 与 production build（18/18 static pages）通过；SQLite integrity `ok`，foreign-key check 无输出。
- readiness：874 inventory、851 published／content-ready／public、published blocker 0、public blocker 0、23 retired backlog；entity quality：active 851，duplicate／thin／suspicious／broken made_by 均 0。
- library contract OK；public media dry-run 867/867 healthy。
- `/brand/banju` 与 `/pen/banju-doer` 均 HTTP 200；`/brand/yisihua` HTTP 308 到 `/brand/asvine`；Shanghai、Saier、SKB 混名路由均 HTTP 404。
- 两张 SVG 均为原生 1600×900，目视无裁切或错位；HTTP SHA-256 与源文件分别精确匹配 `c05457734574bba84ccbc885e8ac4556208c02044e836699de3b41c6ea0f204b` 和 `d10e7af0d820dd112b1ecb3d7a454ebcb143392d1fde3811066bfdd684ee5a15`。

## Remaining Goal

已知未决身份已经收口，但 full-corpus goal 仍保持 active。下一步不再扩散成小 Phase：执行一次外部品牌／型号覆盖冻结，只处理冻结发现的真实重要缺口；随后生成最终 checkpoint、做全量自动检查与真人全页面遍历，最后正式迁移真实资料库、部署并线上逐条复查。
