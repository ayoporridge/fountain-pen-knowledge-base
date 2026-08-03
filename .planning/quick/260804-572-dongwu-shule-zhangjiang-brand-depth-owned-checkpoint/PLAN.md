# Phase 444：东吴、书乐、长江品牌页深化

## 目标

在不写入真实 `data/fpkg.db`、不新增重复实体的前提下，深化已有 DongWu、ShuLe、ZhangJiang 三个品牌页。以已有 948、2398、988 型号包为唯一公开型号入口，加入可追踪的品牌导航正文、型号相邻线索和证据范围；不把相邻型号、英文转写或社区推测合并为身份关系。

## 来源与边界

- 三个品牌沿用 Phase 235 的白丁 Alan 具体型号评测与原创事实图。
- DongWu 与 ZhangJiang 额外使用 The Fountain Pen Network 中国品牌名录，说明旧国产品牌资料稀疏和转写风险；不从名录推导法人、工厂或成立年份。
- ShuLe 额外使用 Fountain Pen Network 的 ShuLe 2212 讨论，明确 2212 与 2398 是相邻型号线索，不把金属／气囊／0.5 mm 样本规格写到 2398。
- ZhangJiang 额外使用 Reddit 的长江旧笔讨论，只作 Changjiang／Type 28 命名线索，不把它升级为 ZhangJiang 988 的别名或规格。

## 实施边界

1. 只加载三个已有品牌实体，保持 canonical slug、已有公开型号和 `made_by` 关系。
2. 通过 `recordEntityContentReview` 的 fact/language/media 审核，再调用 `publishEntity`；不直接修改 published 状态。
3. apply 脚本强制 owned copy、非 symlink、非 remote，并核验真实 catalog snapshot 不变。
4. 定向测试在 disposable copy 中运行；本目录的 `checkpoint.db` 只作阶段证据，不提交。

## 验收

- 三个 markdown 文件长度至少 3500 字符，发布正文至少 2600 字符；每个品牌至少四条 approved references、三组独立来源、一个 approved primary media。
- 只补正文和来源化 claims，不创建品牌或型号重复实体；三个品牌已有 published 型号的反向导航恰好一条。
- 定向测试、Biome、`git diff --check`、TypeScript 基线检查完成；真实 `data/fpkg.db` SHA-256 保持不变。
