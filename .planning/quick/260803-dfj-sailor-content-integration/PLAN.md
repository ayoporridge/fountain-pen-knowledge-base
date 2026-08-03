# Quick 260803-dfj：Sailor 370–382 内容包整合 checkpoint

## 目标

把已经分别通过定向回归的 Sailor 370–382 内容包顺序重放到新的 caller-owned checkpoint copy，验证跨包身份、公开计数、审核—发布状态、媒体与真实目录保护边界，为后续正式迁移提供可复核输入。

## 任务

- [x] 从当前真实 `data/fpkg.db` 创建独立 checkpoint copy，并确认迁移版本与源快照。
- [x] 按 370 → 382 顺序重放所有 Sailor 内容包；只允许 apply 既有审核—发布链路。
- [x] 读回新增实体、品牌关系、公开计数、来源／媒体／审核与 fact conflict。
- [x] 执行内容边界、完整性、快照和 diff 检查；不写真实库、不写 Turso。
- [x] 保存 checkpoint SHA 与报告；只有明确属于本 quick 的文档可提交。

## 验收记录（2026-08-03）

- checkpoint：`.planning/quick/260803-dfj-sailor-content-integration/checkpoint/fpkg-copy.db`
- 源真实库快照 SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`
- checkpoint SHA-256：`06b41722c45efcd959134c45331eb01c2dfab1950c17f9d96afcad8171bdce31`
- 真实库复核 SHA-256：仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；本 quick 未写 `data/fpkg.db`，未调用 Turso。
- 顺序回放：370、371、372、373、374、375、376、377、378、379、380、381、382 全部成功；新增 20 个型号实体，全部 `published`。
- 计数：checkpoint `entities=970`、`entity_publications=685`、`public_entities=924`；真实库保持 `950/665/904`。
- 新增实体正文长度均为 2,939–3,919 字符；20/20 有一条 `made_by` 指向 Sailor（`ce2dcqixqSCx`）。
- 审核：20 个型号均有 `fact/language/media/publication` 四项各一条且全部 `approved`；新增 172 条 entity references 全部 approved，对应 172 个 source items、141 个 source records，source items 也全部 approved；新增 20 条媒体全部 `approved/primary`。
- fact conflict：新增 2 条，均为 `resolved`（HIROSHIMA モミジ 10-1116 英文页材质串页与重量四舍五入差异），没有 open conflict。
- SQLite：checkpoint 与真实库 `PRAGMA integrity_check` 均返回 `ok`。
- 新增型号：SHIKIORI 野山の唄、SHIKIORI おとぎばなし、SHIKIORI 草遊び、SHIKIORI 山水、SHIKIORI ひさかた、SHIKIORI 月夜の水面、SHIKIORI 雨音、SHIKIORI 五周年纪念 穣、Profit Casual L 三规格、115 周年 HIROSHIMA 寄木细工／モミジ、EBONITE ETERNAL FLOW、Black Micarta、DREAMSCAPE TRIP CELESTIAL TEMPLE、Wabi Sabi KIWAMI、King of Pen Shakkyo、KOP Horibe Yahei Kanemaru、x Kamawanu。

## 不在本 quick

- 不正式迁移 `data/fpkg.db` 或 Turso。
- 不删除或提交其他 agent 的 research、`.next-phase*`、旧 quick 目录。
- 不扩建通用验收、Playwright 或 AI/LLM 功能。
