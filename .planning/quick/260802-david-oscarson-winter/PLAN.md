# Phase 349：David Oscarson Winter 内容包

## 目标

新增 David Oscarson 品牌与 Winter Collection fountain pen 系列入口；写清限量数量、Guilloché／热珐琅、贵金属、尖与三种供墨，分开 fountain pen／roller ball 身份，并在 owned checkpoint copy 中完成审核—发布回放。

## 明确范围

- owned files：本目录的 `PLAN.md`、`SOURCES.md`、`SUMMARY.md`、`brand.md`，`.planning/content-research/research-david-oscarson-winter-2026-08-02.md`、`david-oscarson-winter-phase349.md`，Phase349 data/apply/test 脚本和 SVG。
- 不触碰：`data/fpkg.db`、现有 research 文件、其他 agent 的 `.next-phase*` 与 quick 目录。
- 不把 Winter 的每色总配额误写成 fountain pen 单独数量，不伪造尺寸／重量／价格。

## 验收

1. 既有 David Oscarson 与 Winter slug 均不存在；新增一个品牌、一个系列入口和一条 `made_by`／反向关系。
2. 品牌正文 ≥1200 Unicode chars，Winter 正文 ≥2000 Unicode chars，包含工艺、规格、历史、版本、供墨维护、选购和来源。
3. 每个 pack 至少 5 个来源组，primary media 为本站原创 factual SVG，明确非产品照片。
4. owned checkpoint 首次回放为 published，第二次为 noop；型号 10 条 approved spec evidence，四类内容 reviews 均 approved。
5. 定向 test、TypeScript、Biome、`git diff --check` 全部通过，提交前只暂存本 Phase 明确拥有的文件。
