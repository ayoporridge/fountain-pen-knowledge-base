# Phase 399 Plan — Refresh Waterman Edson canonical sourced content

## Objective

刷新现有 `phase358-waterman-edson`（slug `waterman-edson`）的公开正文和来源层，不创建同名重复实体。以 Waterman 官方 heritage 的 1990–92 时间窗、官方维护支持和可靠目录的 Diamond Black SKU 为锚点，补充 Edson 的设计、18K 尖、C/C、颜色/限量、维护、二手鉴别和与相邻 Waterman 系列的关系。

## Safety and scope

- 沿用现有 Edson entity `phase358-waterman-edson` 和 Waterman brand `zkAu9PePDdqJ`。
- 不触碰 `waterman-allure-fountain-pen` 等其它重复或相邻实体；本站 SVG 复用现有已审核资产。
- apply 脚本只允许 caller-owned、非 symlink、非 hard-link checkpoint copy，拒绝 Turso/远端环境；测试和持久验证均不写 `data/fpkg.db`。

## Verification

1. 研究稿 body 至少 8,000 Unicode 字符，包含 1990–92、Diamond Black SKU、18K、C/C、维护、颜色和 Waterman sibling 边界。
2. 定向测试覆盖来源独立组、variants、媒体、spec、四项审核、readiness、maker/reverse topology、首次发布和 replay `noop`。
3. owned checkpoint 通过 `PRAGMA integrity_check`、正文/来源/variants/readback；TypeScript、Biome 和 diff 检查只保留既有基线问题。

## Non-goals

本批不迁移真实本地库或 Turso，不部署、不做生产真人遍历；全量 goal 仍需继续处理其它缺口。
