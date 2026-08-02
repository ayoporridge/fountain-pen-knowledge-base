# Phase 347：Tibaldi Bononia 内容包

## 目标

在不重复现有实体的前提下，新增 Tibaldi 品牌与 Bononia 型号；正文自然中文、保留来源与不确定性，补充一张本站原创 factual SVG，并在 owned checkpoint copy 中通过既有 `recordEntityContentReview` + `publishEntity` 路径回放。

## 明确范围

- owned files：本目录的 `PLAN.md`、`SOURCES.md`、`brand.md`，`.planning/content-research/tibaldi-bononia-phase347.md`，`tibaldi-bononia-phase347.md`，Phase347 data/apply/test 脚本，Phase347 SVG。
- 不触碰：`data/fpkg.db`、现有 research 文件、其他 agent 的 `.next-phase*` 与 quick 目录。
- 不把评测样本的尺寸、书写感或颜色提升为全品牌或全型号规则。

## 验收

1. 既有 Tibaldi slug／型号不存在，新增实体只建立一条 `made_by` 与一条反向关系。
2. 品牌正文 ≥1200 Unicode chars，型号正文 ≥2000 Unicode chars，均含自然中文、规格／历史／版本／维护／选购和来源。
3. 每个 pack 至少 5 个独立来源组，primary media 为本站原创、明确非产品照片且可追溯。
4. owned checkpoint 首次回放结果为 published，第二次为 noop；事实、语言、媒体、publication reviews 均 approved。
5. 定向 test、TypeScript、Biome 与 `git diff --check` 全部通过，提交前只暂存本 Phase 明确拥有的文件。
