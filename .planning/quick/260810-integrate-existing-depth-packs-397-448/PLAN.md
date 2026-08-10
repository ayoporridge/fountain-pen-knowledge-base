---
phase: 568
quick_id: 260810-integrate-existing-depth-packs-397-448
status: complete
created: 2026-08-10
---

# Phase 568 Plan — integrate existing depth packs 397–448

## Objective

在不连接 Turso、不写入真实 `data/fpkg.db` 的前提下，把当前 owned checkpoint 尚未包含的既有来源化深度包顺序重放到同一份 caller-owned copy。范围限定为 Waterman Hémisphère、Pelikan M400/M815、Waterman/Pelikan/Leonardo/Schneider/Hero/Opus/Paidi 品牌深度和 Opus/Leonardo 型号深度；不创建重复实体，不重写任何 pack。

## Scope and order

按依赖和内容新旧顺序重放已有 wrapper：Phase 397 → 415 → 420 → 425 → 433 → 435 → 438 → 440 → 448。后续品牌深度覆盖前置品牌故事，型号包只更新对应型号，所有关系使用既有 canonical IDs。

## Non-goals

- 不新建品牌／型号，不改 research/data pack，不处理已经 retired 的 donor。
- 不连接或写入 Turso，不迁移真实数据库，不部署，不做线上复查。
- 不新增通用 runner、Playwright 或 readiness 基础设施；只保留本批直接的 first/replay 与离线审计证据。

## Verification

1. 每个既有 wrapper 在 owned copy 首次结果可读回，第二次 replay 全部为 `noop`。
2. 回读 Phase 397–448 目标实体的 source marker、正文、审核、来源、规格、媒体与品牌关系。
3. 运行 SQLite integrity、readiness、coverage、quality、library/data contract 与生产构建；明确仍有 23 条 retired donor backlog，不能以本批集成冒充全量完成。
