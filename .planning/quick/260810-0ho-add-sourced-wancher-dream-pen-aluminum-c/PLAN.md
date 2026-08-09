---
status: complete
created: 2026-08-10
---

# Wancher Dream Pen Aluminum Classic sourced content pack

## Objective

补齐目前目录中缺失的 Wancher Dream Pen Aluminum Classic 具体 SKU：使用品牌官网、官方产品 JSON、Wancher 官方店铺规格与保养/保修页面建立唯一型号实体；明确 Classic 与 Contemporary 的型号边界；建立正确的 Wancher `made_by` 双向关系；在 owned checkpoint copy 中完成审核—发布—重放验证。

## Scope

- 新增唯一实体 `wancher-dream-pen-aluminum-classic`，不重复创建 Dream Pen 系列导航、Aluminum Contemporary 或笔尖变体。
- 编写自然中文正文、来源化 claims/spec evidence、四个官方 SKU variant，以及一张明确标注为非照片的原创事实示意图。
- 使用项目现有 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity` 路径；不绕过 publication guard。
- 所有数据库试验只写本 quick 目录下的 owned checkpoint copy；不连接 Turso、不写真实 `data/fpkg.db`。

## Verification

1. 定向 Vitest 覆盖身份唯一性、正文/来源/规格/媒体、审核发布和 replay noop。
2. `tsc --noEmit`、Biome/格式、SVG XML 与内容质量检查。
3. 在 Phase 557 integrated checkpoint 上运行 first/replay、SQLite integrity、library/quality/coverage/readiness 离线审计，并保存证据；将 Turso、线上迁移与线上复查列为待额度恢复事项。

## Protected files

本任务不触碰已有未跟踪 research、`.next-phase*` 或 `.planning/quick/260719-665-montblanc-writers-edition-patron-of-art-/`；提交时只暂存本任务明确拥有的文件。
