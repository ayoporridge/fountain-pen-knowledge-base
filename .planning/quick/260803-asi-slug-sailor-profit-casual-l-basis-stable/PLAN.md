# Quick Plan：Sailor Profit Casual L 三个新型号

## 目标

在不触碰 `data/fpkg.db` 的前提下，用 Sailor 官方 11-0820、11-0822、11-0825 产品页、上市资料和可靠零售交叉核验，新增三个独立的 Profit Casual L 型号页；四种颜色和五种尖幅只建为各自型号的变体。

## 验收

1. 每页正文包含身份、规格、版本差异、上市／价格边界、补墨维护、选购建议和来源；明确 Gold IP 不等于金尖。
2. 11-0820 为无帽环、PMMA 大先、19.8 g；11-0822 为帽环、PMMA 大先、19.8 g；11-0825 为黄铜 Gold IP 大先、23.9 g；不互相覆盖。
3. 所有试写在本 quick 目录的 checkpoint copy；首轮发布、重复 replay `noop`、品牌 `made_by` 与反向导航通过定向测试。
4. TypeScript、Biome、`git diff --check` 完成；只暂存本批文件，不动其他 research、`.next-phase*` 或旧 quick 目录。

## 计划步骤

- [x] 写三份来源化研究／正文与原创事实 SVG。
- [x] 写 Phase 375 data/apply/test，接入现有 `recordEntityContentReview`／`publishEntity` 路径。
- [x] 创建 checkpoint copy，运行定向测试与 TypeScript／Biome 检查。
- [x] 检查工作树，提交本批明确拥有的文件。
