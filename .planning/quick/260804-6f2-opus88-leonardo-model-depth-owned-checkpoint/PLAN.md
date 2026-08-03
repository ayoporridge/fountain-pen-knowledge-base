# Phase 448：Opus 88 与 Leonardo 四个型号页深化

## 目标

在 Phase 447 owned checkpoint 上加深已有的 Opus 88 Demonstrator、Opus 88 Koloro、Leonardo Furore、Leonardo Momento Magico 四个 canonical 型号页。复用 Phase 57 的实体、来源、原创事实图和品牌关系，不重新建立 Demo/Kolora 或 Furore/Momento Magico 混名实体，不触碰真实 `data/fpkg.db`。

## 资料与身份边界

- Opus 88 Demonstrator 与 Koloro 分开：前者是大型透明／半透明亚克力、Jowo #6／Opus #12 和约 3.5 ml 级 Japanese-style eyedropper；后者是较小比例、#5／Opus #10 的双色树脂路线。旧资料的 Demo/Kolora 混写只保留为历史线索。
- Leonardo Furore 与 Momento Magico 分开：Furore 标准款是 2018 年 converter 系列，Furore Grande 的活塞和尺寸不回填；Momento Magico 是可视墨窗与工坊自制约 1.5 ml 活塞路线，钢／金尖和 feed 按配置记录。
- 官方产品／系列页确认身份和当前规格，可靠零售与专业评测补充测量和使用观察；单一样本的重量、颜色、库存和价格不扩展为全系列事实。

## 实施边界

1. 只从 Phase 447 checkpoint 复制本阶段 owned `checkpoint.db`；apply 拒绝 remote、符号链接、真实库和硬链接，并核验真实 catalog snapshot 不变。
2. 四个型号走现有 `CuratedEntityPack`、`recordEntityContentReview`（fact/language/media）与 `publishEntity` 路径，不直接写 publication 状态。
3. 只更新正文、来源 claims、scope 与 timeline；保留既有品牌、型号 ID、`made_by` 和反向导航，不重复建实体或产品照片。

## 验收

- 四份研究 markdown 至少 3500 字符，发布正文至少 2600 字符；每个型号至少四条 approved references、三组独立来源、一个 approved primary media，并保留完整规格证据。
- 四个型号 identity／slug／品牌关系正确，审核 hash 可回读，publication 为 published，第二次 replay 全部 noop；真实库 SHA-256 与阶段前一致。
- 定向测试、Biome、`git diff --check`、TypeScript 基线检查完成；quality audit 与 library contract 结果记录在 SUMMARY。
