# Quick 260803-ec0：Phase 370–384 owned checkpoint integration

## 目标

在一个新建的 caller-owned checkpoint copy 中按顺序重放 Phase 370–384，覆盖 Sailor 新型号、HongDian N23 与 Jinhao 51A；不写真实 `data/fpkg.db`，不写 Turso。本 quick 只证明这批内容可以合并，不代表全量 goal 完成。

## 任务

- [x] 从当前真实目录建立带快照证据的 owned checkpoint。
- [x] 顺序重放 Phase 370–384，记录每包 published/noop 和失败边界。
- [x] 回读实体、公开集合、审核、来源分组、媒体、冲突、完整性及真实目录哈希。
- [x] 仅提交本 quick 的计划、摘要和证据，不提交 checkpoint 数据库或其他未跟踪文件。

## 范围限制

- 真实资料库只读；任何失败都在 owned copy 修复或停止。
- 不重复建立已有 raw Pilot/Pelikan 实体，不修改迁移／通用验收基础设施。
- Turso、部署、真人遍历和线上复查继续留到全量收口阶段。
