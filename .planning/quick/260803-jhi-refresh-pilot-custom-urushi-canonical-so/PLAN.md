# Phase 400 — Refresh Pilot Custom URUSHI canonical sourced content

## Objective

在不改变既有 Pilot Custom URUSHI 实体身份的前提下，用当前 Pilot 官方目录、支持页、说明书和可靠专业资料深化正文、规格、颜色／SKU 边界、维护与选购建议；所有数据库试验仅在 caller-owned checkpoint copy，发布必须经过 fact/language/media review 与 `publishEntity`。

## Work units

1. 重新核验官方事实与可靠二手资料，记录检索日期、URL 和粒度边界。
2. 写入 8,000+ Unicode 字符自然中文正文，并把 FKV-88SR、18K No.30、蝋色漆、CON-40/CON-70N、155 mm/20 mm/44 g、三色九 SKU 及 sibling 边界放入结构化 pack。
3. 复用现有 `CuratedEntityPack` 载荷写入路径；只在 owned copy 中清除并重建该实体内容，确保唯一 Pilot `made_by` 与品牌反向导航，不直接写 `data/fpkg.db`。
4. 在持久 checkpoint 复制品执行首次 apply、重放 noop、身份/来源/证据/媒体/readiness/发布门禁断言，并确认真实库快照未变。
5. 运行定向测试、TypeScript、Biome、`git diff --check`，检查 status 后只提交本包拥有文件。

## Acceptance evidence

- 官方 exact product/support/manual sources are attached with honest locators.
- Body is at least 8,000 Unicode characters and contains no internal implementation terms.
- Current content has one approved primary SVG explicitly marked non-product-photo.
- Checkpoint publishes the existing `pilot-custom-urushi` entity via `recordEntityContentReview` + `publishEntity`; replay is `noop`.
- Checkpoint topology has exactly one Pilot maker and one Pilot reverse navigation link; readiness is publishable with zero blockers.
- Real catalog hash and unrelated worktree files remain unchanged.
