---
status: in_progress
---

# Phase 454：深化 IWI Laureate、Jinhao X159 与 Diplomat Viper

## 目标

在 Phase 453 owned checkpoint copy 上，补足三个已有跨品牌型号页的自然中文正文和来源化事实，保持现有 canonical identity、slug、品牌关系及原创示意图不变；只使用 Phase 141、Phase 63、Phase 327 已有来源包，通过既有审核发布链路写入本轮 checkpoint，绝不触碰真实 `data/fpkg.db`。

## 执行任务

1. 深化 IWI Laureate、Jinhao X159、Diplomat Viper 研究正文，补充型号识别、版本差异、规格证据、维护和选购边界。
2. 创建 `CuratedEntityPack` 刷新包，复用已有 source keys，不把 IWI 滚珠笔、Jinhao 159/9019 或 Diplomat Cobra/Aero 等相邻身份混入目标页。
3. 创建只接受 owned checkpoint 的 apply 脚本，校验数据库路径、迁移 032、canonical identity、唯一 `made_by` 与反向导航，并使用 `recordEntityContentReview` 与 `publishEntity`。
4. 创建定向回归，验证正文长度、来源组、media、审核 hash、publication contract 3、远程数据库拒绝、replay noop 与真实库不变。
5. 在本轮 checkpoint 跑定向测试、apply/replay、integrity、quality、coverage、library contract、TypeScript、Biome/diff，记录证据后只提交本包文件。

## 验收

- 三个实体 canonical id/slug 不变；每页正文达到 2600 body / 3500 total，至少 4 个 approved references、3 组独立来源和 1 个 approved primary media。
- 三个实体各自保持原品牌的恰一个 `made_by` 与一个反向 `reverse`，四项审核均 approved，publication 为 published。
- apply 首次成功且 replay 全部 noop；远程选择、真实数据库和硬链接别名均拒绝；真实 hash 不变。
- 未跟踪 research、`.next-phase*`、旧 quick 目录和本阶段 checkpoint 不被顺手删除或提交。
