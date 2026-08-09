---
name: deepen-the-existing-parker-180-canonical
status: completed
created: 2026-08-09
---

# Deepen the existing Parker 180 canonical model

## Objective

在不新增实体的前提下，补强现有 canonical `laT4tRN4DMOV` / `the-parker-180`：用 Parker Penography、US patent 和现有专业档案交叉核对 1977–1985 历史范围、双面尖、尖材变更、finish/市场差异、Parker cartridge/converter、维护与选购边界。

## Non-goals

- 不创建 Parker 180 duplicate，不改品牌身份或既有 slug。
- 不修改真实 `data/fpkg.db`、Turso 或线上站点。
- 不把专利图、收藏家目录或二手样本扩写成统一尺寸、价格或全球 SKU 事实。
- 不扩建通用审核、Playwright、AI/LLM 或搜索基础设施。

## Verification contract

- 研究正文自然中文不少于 4,000 Unicode 字符，并明确资料边界。
- pack 只更新已存在的 Parker 180 canonical；owned checkpoint 首次发布与 replay noop。
- 通过 `recordEntityContentReview` + `publishEntity`，读回四项当前 hash review、来源、spec evidence、primary media 和唯一 `made_by`。
- 定向 test、TypeScript、Biome、`git diff --check` 通过，真实库哈希不变。
