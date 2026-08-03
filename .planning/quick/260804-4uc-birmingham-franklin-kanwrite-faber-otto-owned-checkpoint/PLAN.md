# Phase 443：五个品牌页深化

## 目标

在不写入真实 `data/fpkg.db`、不新增重复实体的前提下，深化 Birmingham Pen Company、Franklin-Christoph、Kanwrite、Faber-Castell、Otto Hutt 五个已有品牌页。沿用已有代表型号包与可靠来源，补足品牌历史、系列／笔类／材料分层、批次边界、维护、选购和下一轮研究入口，并通过既有审核—发布链路写入 owned checkpoint copy。

## 来源与身份边界

- Birmingham / Franklin-Christoph：复用 Phase 142 品牌与代表型号包；品牌页额外挂接 Alumina、converter、Model 20、FP Nib Info 来源化 claims，保持 3+ 独立来源组。
- Kanwrite：复用 Phase 259 Heritage／About Us／产品目录与原创事实图，区分 Kanpur Writers、OEM 背景、Heritage、Legacy、Desire 等自有路线。
- Faber-Castell：复用 Phase 58 官方历史、Fine Writing 产品导航、FAQ、PenHero 旁证与原创图，区分普通 Fine Writing 与 Graf von Faber-Castell。
- Otto Hutt：复用 Phase 144 官方历史、design04/design07、独立评测和原创图，区分 design 编号、fountain pen／rollerball／ballpoint 与 finish。

## 实施边界

1. 只加载五个已有品牌实体，保持公开型号、canonical slug 和 `made_by` 关系。
2. 通过 `recordEntityContentReview` 的 fact/language/media 审核，再调用 `publishEntity`；不直接改写 published 状态。
3. apply 脚本强制 owned copy、非 symlink、非 remote，并在前后核验真实数据库 catalog snapshot 不变。
4. 定向测试在 disposable copy 中运行；本目录的 `checkpoint.db` 只作阶段证据，不提交。

## 验收

- 五个品牌正文来自新的 Phase 443 markdown，文件长度至少 3500 字符，发布正文至少 2600 字符。
- 每个品牌至少四条 approved references、三组独立来源、一个 approved primary media；发布状态与 content hash 对齐。
- 每个已有 published 型号都有且仅有一条品牌反向导航；不产生 duplicate 或新的实体。
- 定向测试、Biome、`git diff --check`、TypeScript 基线检查完成；真实 `data/fpkg.db` SHA-256 保持不变。
