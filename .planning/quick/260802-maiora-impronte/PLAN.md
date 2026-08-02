# Phase 348：Maiora Impronte 内容包

## 目标

新增 Maiora 品牌、Impronte 标准款和 Impronte Oversize 两个型号实体，修正 standard／oversize 身份边界；正文涵盖来源、结构、版本、维护、选购与样本测量，补充原创 factual SVG，并在 owned checkpoint copy 中使用既有审核—发布路径。

## 明确范围

- owned files：本目录的 `PLAN.md`、`SOURCES.md`、`SUMMARY.md`、`brand.md`，`.planning/content-research/research-maiora-impronte-2026-08-02.md`、两个型号 markdown，Phase348 data/apply/test 脚本和 SVG。
- 不触碰：`data/fpkg.db`、现有 research 文件、其他 agent 的 `.next-phase*` 与 quick 目录。
- 评测尺寸、颜色和书写感按样本／变体归因，不外推为全系列恒定值。

## 验收

1. 既有 Maiora、Impronte、Impronte Oversize slug 均不存在；只新增一个品牌、两个型号及各一条 `made_by`／反向关系。
2. 品牌正文 ≥1200 Unicode chars，两个型号正文各 ≥2000 Unicode chars，含自然中文、规格／历史／版本／维护／选购和来源。
3. 每个 pack 至少 5 个独立来源组，primary media 为本站原创并标明非产品照片。
4. owned checkpoint 首次回放为 published，第二次为 noop；两个型号各有 10 条 approved spec evidence，四类内容 reviews 均 approved。
5. 定向 test、TypeScript、Biome、`git diff --check` 全部通过，提交前只暂存本 Phase 明确拥有的文件。
