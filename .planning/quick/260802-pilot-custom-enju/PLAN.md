# Phase 365：Pilot Custom 槐（FKV-5MK）内容包

## 目标

补齐 Pilot 官方目录中真实存在、但目录尚无实体的 Custom 槐（えんじゅ／Enju）木轴型号；准确记录 FKV-5MK、槐木树脂浸渍笔身与笔帽、18K No.15 F/M/B、CON-40／CON-70N、尺寸重量、上市时间和商业字段边界。

## 实施边界

- 新增一个 exact SKU 实体 `pilot-custom-enju`，不重复 Custom 845、Custom URUSHI、Custom 823、Heritage 或已有 Pilot raw 内容包。
- FKV-5MK-ME-F/M/B 是同一型号的原厂尖幅变体，不拆成三个实体。
- 使用既有 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity` 审核—发布链路；所有写入只在 owned checkpoint copy。
- 价格、库存、木纹、盒装与地区供货是检索日期快照，不写成永久承诺；原创 SVG 不是产品照片。

## 验证

1. 定向 Node test 在 checkpoint copy 迁移并 apply 两次：品牌与 Enju 首次 published，Enju 重放 noop。
2. 检查 exact body、Pilot brand navigation、maker/reverse、5 个变体、11 个规格字段证据、来源、主媒体与四类 review。
3. 运行 Biome、TypeScript 与 `git diff --check`，记录现有基线错误。
