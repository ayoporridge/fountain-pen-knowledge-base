# Phase 358：Waterman Edson 内容包

## 目标

新增当前实体库中不存在的 Waterman Edson 独立型号页，补齐 Waterman 品牌导航，保持 Edson 与 Carène、Expert、Hémisphère、Allure 及同名 rollerball／ballpoint 的身份边界。

## 实施边界

- 仅新增 `phase358-waterman-edson` / `waterman-edson`，不重写已有 Waterman 型号。
- 采用 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity` 的既有审核—发布链路。
- 所有写入只在本批 owned checkpoint copy；真实 `data/fpkg.db` 保持只读。
- 图片使用本站原创 factual SVG，明确不是产品照片、Logo、比例图或颜色校样。

## 验证

1. 定向 Node test 在 checkpoint copy 迁移并 apply 两次：首次 published，重放 noop。
2. 检查模型正文、品牌导航、maker/reverse 关系、6 个 variants、spec evidence、引用、四类 review 状态。
3. 运行 Biome、TypeScript 和 `git diff --check`；记录与本批无关的基线错误，不扩大范围。
