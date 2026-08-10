---
phase: 581
quick_id: 260810-deepen-wancher-zogan-momiji-green-tamamushi
status: complete
created: 2026-08-10
---

# Phase 581 Plan — deepen Wancher Zogan Momiji Green Tamamushi

## Objective

在不连接 Turso、也不修改真实 `data/fpkg.db` 的前提下，深化已存在的 canonical
Wancher Zogan Momiji Green Tamamushi（`phase543-wancher-zogan-momiji-green-tamamushi`）。
当前官方 product id `9322088038615` 同时被旧的 `phase519` Dream Pen 路由使用；本批不
创建第三个实体，而是把旧路由退休并永久重定向到 canonical 路由。

正文以 2026-08-10 读取的 Wancher 官方 JSON、商品页、Zogan collection、Product Care、
Nib Guide 与官方图片为依据，补齐当前 SKU/Trim/价格、材料字段与正文边界、尖/feed/供墨、
包装、版本差异、维护、选购和二手核对，并保留官方字段与叙述材料不完全一致的冲突证据。

## Scope and order

1. 先在 caller-owned checkpoint 迁移到 032；
2. 退休 `phase519-wancher-zogan-momiji-green-tamamushi`，写入 `retire` lineage，并安装
   `/pen/wancher-dream-pen-zogan-momiji-green-tamamushi` 到 canonical 路由的 permanent
   redirect；
3. 对 Phase 543 canonical pack 执行来源、claims、variants、规格、媒体及三项
   `recordEntityContentReview`，再通过 `publishEntity`；
4. 首次执行后 replay 同一 checkpoint，回读 canonical/duplicate 的身份、关系、正文、
   来源、审核发布门和 redirect；
5. 运行定向测试、TypeScript、Biome 和 staged diff check。

## Verification

必须证明首次写入可发布、replay 幂等、canonical public、旧 duplicate retired 且不再有
品牌反向关系，官方 gallery 媒体存在，真实库 hash 不变。该 quick 只覆盖一条 Wancher
型号的离线内容修复；正式资料库迁移、Turso 远端读回、生产部署、真人遍历和线上逐条复查，
以及其余品牌/型号的全量 backlog 仍待完成。
