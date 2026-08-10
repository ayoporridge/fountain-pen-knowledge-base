# Phase 563 Plan — Caran d’Ache 849 Fountain Pen offline content pack

## Objective

在不连接 Turso、不写入真实 `data/fpkg.db` 的前提下，为 Caran d’Ache 官方当前目录中尚未收录的 849 Fountain Pen 建立可重放的 `CuratedEntityPack`。正文需把 849 钢笔与同系列圆珠笔、Ecridor 和 Léman 分开，记录官方材质、钢尖、尖幅、供墨、瑞士制造、颜色／市场 SKU 与时间性价格边界，并在 owned checkpoint 通过审核发布链路。

## Scope

- 目标实体：`caran-dache-849-fountain-pen`；品牌复用已审核的 Caran d’Ache `phase139-brand-caran-dache`。
- 变体：以官方当前可见的 EF/F/M/B 尖幅作为同一型号的 `market_sku` 选择；Black Code、Metal Blue、Metal Black、Metal White、Red、Fluo 色系作为市场／颜色语境，不把颜色拆成独立型号。
- 资料：Caran d’Ache 849 Fountain Pen exact product pages、849 Family 导航、品牌 Ecridor 页面、2024 Fine Writing catalogue、官方保修／服务边界，以及 Pen Chalet 或 The Pen Addict 的署名独立评测，仅将实物体验归因于样本。
- 图片：加入带事实边界的本站原创 SVG；不下载或冒充官方产品照片。

## Non-goals

- 不连接 Turso，不迁移真实 `data/fpkg.db`，不部署，不做线上复查。
- 不改写现有 Ecridor/Léman 实体，不把 849 圆珠笔、849 机械铅笔或 Ecridor 参数混入本型号。
- 不修改或删除其他 agent 的 research 文件、`.next-phase*`、checkpoint 和受保护 quick 目录；不扩建通用 AI、LLM、Playwright 或 readiness 基础设施。

## Verification

1. 在 Phase 562 owned checkpoint 副本上创建 849 型号，确认品牌身份、无 slug/id 冲突、唯一双向 `made_by`、官方 SKU、来源和原创媒体。
2. 首次运行走 `recordEntityContentReview`（fact/language/media）与 `publishEntity`；第二次运行必须 `noop`。
3. 运行定向测试、`pnpm exec tsc --noEmit`、Biome、SVG XML、`git diff --check` 和生产构建/离线审计；记录既有 retired donor backlog，不将本批通过冒充全量完成。
