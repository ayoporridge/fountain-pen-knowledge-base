---
name: add-sourced-wancher-dream-pen-timeless-silk-black
status: in_progress
created: 2026-08-10
---

# Add Wancher Dream Pen Timeless – Silk Black offline

## Objective

在不连接 Turso、且不写入 `data/fpkg.db` 的前提下，为当前库存中尚未覆盖的 Wancher Dream Pen Timeless – Silk Black 建立来源化内容包。保留它与 True Ebonite Silk Black、Dream Pen 系列导航的独立身份，并按项目既有 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity` 路径在 owned checkpoint 验证。

## Non-goals

- 不修改真实 SQLite、Turso 或生产站点。
- 不把 `Timeless` 合并成已有 True Ebonite 型号，也不把尖幅拆成多个实体。
- 不扩展通用 readiness、Playwright 或 AI 验收框架。
- 不触碰其他 agent 的 research、`.next-phase*` 或受保护 quick 目录。

## Verification contract

- 官方英文产品页、产品 JSON、日本站系列页、官方介绍文章、护理/保修页和一个明确标注为相邻型号的专业二手来源均写入 source registry。
- owned checkpoint 首次应用成功，第二次重放为 noop；实体、Wancher `made_by` 与反向品牌导航各唯一。
- 内容包含身份边界、规格、历史、版本差异、维护、选购边界、价格/库存时态和来源；图片为本站 factual SVG，不冒充产品照片。
- 定向测试、TypeScript、Biome、SVG XML、离线 coverage/quality/readiness-v2/library/data-contract 审计通过或记录既有 23 条退休 donor backlog；真实库 SHA-256 保持不变。
