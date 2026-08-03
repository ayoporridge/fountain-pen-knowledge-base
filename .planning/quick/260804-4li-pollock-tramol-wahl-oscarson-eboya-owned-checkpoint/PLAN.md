# Phase 442：五个薄品牌页深化

## 目标

在不写入真实 `data/fpkg.db`、不新增重复实体的前提下，深化 Pollock Pen Co.、Tramol、Wahl、David Oscarson、Eboya 五个已有品牌页。沿用既有来源化型号包和身份关系，补足品牌历史、产品／系列分层、版本边界、维护、选购和资料缺口说明，并通过既有审核—发布链路写入 owned checkpoint copy。

## 已确认的来源与身份

- Pollock Pen Co.：复用 Phase 220 的 Vintage Pens、Vintage Pen Doctor、Fountain Pen Network、专利记录与原创结构图；不把 John Hancock 商品名扩成第二品牌。
- Tramol：复用 Phase 228 的 TRAMOL 商标记录、Fountain Pen Companion、零售页、FPN 结构讨论与原创图；区分钢笔、墨水、礼盒和主题名称。
- Wahl：复用 Phase 211 的 FountainPen.it、PenHero、Richard's Pens、FPN 与 1925 catalogue；区分 Boston、Tempoint、Wahl Pen 和后期 Wahl-Eversharp。
- David Oscarson：复用 Phase 349 的官方 Our Story、Craftsmanship、Winter、FAQ、周年系列旁证与原创图；不把 Winter 配额或 Heidelberg 尖产地外推到全品牌。
- Eboya：复用 Phase 257 的 Eboya 官方 HOUJU／catalog／日文商店、Peyton Street Pens 与原创图；区分 Nikko Ebonite、家族、S/M/L 尺寸和单支纹理。

## 实施边界

1. 只加载五个已有品牌实体，保持原有公开型号与 `made_by` 关系。
2. 通过 `recordEntityContentReview` 的 fact/language/media 审核，再调用 `publishEntity`；不直接改写 published 状态。
3. `scripts/apply-phase442-brand-depth-refresh.ts` 强制 owned copy、非 symlink、非 remote，并在前后验证真实数据库 catalog snapshot 不变。
4. 测试在 disposable copy 运行；本目录的 `checkpoint.db` 仅作本阶段证据，不提交。

## 验收

- 五个品牌正文均来自新的 Phase 442 markdown，文件长度至少 3500 字符，发布正文至少 2600 字符。
- 每个品牌至少四条 approved references、三组独立来源、一个 approved primary media；发布状态与 content hash 对齐。
- 每个已有 published 型号都有且仅有一条品牌反向导航；不产生 duplicate 或新的实体。
- 定向测试、Biome、`git diff --check`、TypeScript 基线检查完成；真实 `data/fpkg.db` SHA-256 保持不变。
