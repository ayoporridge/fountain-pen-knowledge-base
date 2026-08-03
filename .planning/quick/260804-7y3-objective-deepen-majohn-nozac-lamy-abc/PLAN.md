---
status: complete
---

# Phase 455：深化 Majohn V1、Conklin Nozac 与 LAMY abc

## 目标

在 Phase 454 owned checkpoint copy 上补足三个已有型号页的自然中文正文和来源化事实，保持现有 canonical identity、slug、品牌关系、历史与当前版本边界及原创示意图不变；复用 Phase 182、Phase 99、Phase 139 的来源包，按既有审核发布路径只写入本轮 checkpoint。

## 执行任务

1. 深化 Majohn V1、The Conklin Nozac、LAMY abc：补充机制／教育设计、实物和样本证据、版本差异、维护与选购建议。
2. 创建 `CuratedEntityPack` 刷新包，避免把 Majohn V126/V200、Nozac 现代复刻、LAMY Safari 或儿童握姿建议混入目标实体。
3. 创建只接受 owned checkpoint 的 apply 脚本，校验路径、迁移 032、canonical identity、唯一 `made_by` 和反向导航，使用 fact/language/media review 与 `publishEntity`。
4. 创建定向回归，覆盖正文长度、来源组、media、审核 hash、publication contract 3、远程拒绝、replay noop 和真实库快照不变。
5. 运行定向测试、apply/replay、integrity、quality、coverage、library contract、TypeScript、Biome/diff，记录证据后只提交本阶段明确拥有的文件。

## 验收

- 三个实体 canonical id/slug 不变；每页正文达到 2600 body / 3500 total，至少 4 个 approved references、3 组独立来源和 1 个 approved primary media。
- 三个实体各自保持原品牌恰一个 `made_by` 与一个反向 `reverse`，四项审核均 approved，publication 为 published。
- apply 首次成功且 replay 全部 noop；远程选择、真实数据库和硬链接别名均拒绝；真实 hash 不变。
- 未跟踪 research、`.next-phase*`、旧 quick 目录和本阶段 checkpoint 不被顺手删除或提交。
