# Phase 449：Pilot Capless 家族三个型号页深化

## 目标

在 Phase 448 owned checkpoint 上加深已有的 Pilot Capless 全尺寸、Capless Decimo、Capless LS 三个 canonical 型号页。复用 Phase 43 的实体、Pilot 品牌关系、来源和原创事实图，不重复建立旧的 Capless/Decimo 混合实体，也不触碰真实 `data/fpkg.db`。

## 资料与身份边界

- 全尺寸 Capless 在不同市场又称 Vanishing Point；它与较细较轻的 Decimo、Luxury & Silent 的 LS 分开记录。FCT-15SR、FCLS-35SR、FC-15SR 等商品号按 SKU 保留。
- Pilot 官方 Capless 系列页和保修／说明资料用于按动机构、18K 尖、Pilot 墨囊／CON-40 与清洁边界；可靠零售和专业评测补充尺寸、重量、颜色与实际携带观察。
- 特殊合金 FCS-1、絣、Stripe、SE、Raden 等既有 sibling 或 variant 不被本阶段合并；颜色、市场价格和当期库存不扩展为全系列事实。

## 实施边界

1. 只从 Phase 448 checkpoint 复制本阶段 owned `checkpoint.db`；apply 拒绝 remote、符号链接、真实库和硬链接，并核验真实 catalog snapshot 不变。
2. 三个型号走 `CuratedEntityPack`、`recordEntityContentReview`（fact/language/media）与 `publishEntity`，不直接写 publication 状态。
3. 只更新型号正文、来源 claims、scope 与 timeline；保留既有 `made_by`、品牌反向导航、型号 ID 和历史 sibling 边界。

## 验收

- 三份研究 markdown 至少 3500 字符，发布正文至少 2600 字符；每个型号至少四条 approved references、三组独立来源、一个 approved primary media。
- 三个型号 identity／slug／品牌关系正确，审核 hash 可回读，publication 为 published，replay 全部 noop；真实库 SHA-256 与阶段前一致。
- 定向测试、Biome、`git diff --check`、TypeScript 基线检查完成；quality audit 与 library contract 结果记录在 SUMMARY。
