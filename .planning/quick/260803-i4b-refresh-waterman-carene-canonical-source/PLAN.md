# Phase 395 Plan — Refresh Waterman Carène canonical content

## Goal

在不新建 Waterman 或 Carène 实体的前提下，刷新现有 `waterman-carene` 页：把 1997 年官方历史锚点、当前 Carène collection、嵌入式 18K 尖、七种尖幅、饰面／市场 SKU、cartridge/converter、法国手工组装和清洗边界写成自然中文，并明确 Carène 与 Expert、Hémisphère、Allure 及滚珠／圆珠版本的身份关系。

## Owned files

- `.planning/content-research/waterman-carene-phase395.md`
- `scripts/data/phase395-waterman-carene-refresh.ts`
- `scripts/apply-phase395-waterman-carene-refresh.ts`
- `tests/content/phase395-waterman-carene-refresh.test.ts`
- `.planning/quick/260803-i4b-refresh-waterman-carene-canonical-source/SUMMARY.md`

## Guardrails

- 只在 `copyCheckpointedCatalogToDisposableCopy` 创建的 owned checkpoint copy 上迁移和发布。
- 禁止继承 Turso/远程数据库环境，绝不连接或改写 `data/fpkg.db`。
- 复用现有 `qsuRSNYKpI6-` 与 Waterman 品牌关系，不创建同名 Carène；使用事实／语言／媒体审核和 `publishEntity` 发布路径。
- 保留其他 agent 的 research、`.next-phase*` 与既有 checkpoint。

## Verification

1. 资料包正文至少 8,000 字符，来源至少 7 个独立组，版本和规格证据完整，主图明确为非产品照片。
2. owned copy 读回 Carène 已发布、公开、四项当前审核通过；现有 Waterman `made_by` 与品牌反向导航唯一；重放为 noop。
3. `PRAGMA integrity_check`、定向测试、TypeScript（仅允许已知基线）、Biome、`git diff --check` 通过；真实数据库快照哈希不变。
