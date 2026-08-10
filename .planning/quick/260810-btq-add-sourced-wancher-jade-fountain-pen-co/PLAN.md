# Phase 562 Plan — Wancher Jade Fountain Pen offline content pack

## Objective

在不连接 Turso、不写入 `data/fpkg.db` 的前提下，为官方目录中当前本地资料库尚未覆盖的 Wancher Jade Fountain Pen 建立可重放的 `CuratedEntityPack`，补齐自然中文正文、身份边界、官方尖幅 SKU、规格、来源、媒体和品牌关系，并在 owned checkpoint 完成发布门与离线回归。

## Scope

- 目标实体：`wancher-jade-fountain-pen`（Jade Fountain Pen）。
- 品牌：复用已审核的 Wancher `eOfD77nOeENN`，只增加该型号的双向 `made_by`/`reverse` 关系并刷新品牌导航。
- 变体：官方 JSON 中的 EF/F/MF/M/B/Kodachi Fine/Kodachi Medium 七个 market SKU；不为尖幅拆分型号实体。
- 资料：Wancher 英文商品页、日文商品页、商品 JSON、Jade collection、Sailor collaboration collection、Nib Guide、Product Care、Warranty。
- 图片：仅加入带事实边界标注的原创 SVG；不下载或冒充官方产品照片。

## Non-goals

- 不连接 Turso，不迁移真实 `data/fpkg.db`，不部署，不做线上复查。
- 不修改或删除其他 agent 的研究文件、`.next-phase*`、checkpoint 和受保护 quick 目录。
- 不重建已有 Wancher、Pilot、Pelikan 内容包，不扩建通用验收或 Playwright 框架。

## Verification

1. 在 Phase 561 owned checkpoint 副本上运行 apply 脚本，验证品牌身份、型号无冲突、七个 SKU、来源/媒体审查和 `publishEntity` 发布路径。
2. 运行定向 Vitest、`pnpm exec tsc --noEmit`、Biome、SVG XML 检查和 `git diff --check`。
3. 首次运行与 replay 均成功；读回实体、品牌关系、正文长度和发布快照。
4. 运行 readiness-v2、coverage、quality、library-contract、data-contract 离线审计，记录现有退休 donor backlog，不把本批离线通过当作全量完成。
