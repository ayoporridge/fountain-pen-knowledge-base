# Phase 462：深化 Wancher PuChiCo、Shizuku 与 Pilot Cavalier

## 目标

在 Phase 461 checkpoint copy 上继续修复三个已有 canonical pen entity：补足 Wancher PuChiCo 的眼滴与样品边界、Shizuku 的玻璃尖／Solis exact SKU、Pilot Cavalier 的日本 FCAN-5SR 与旧修复样本边界。不得创建颜色重复实体或改写真实 `data/fpkg.db`。

## 交付

- 更新 PuChiCo、Shizuku 研究正文，并新增 Pilot Cavalier 的自然中文正文与来源。
- 复用原有 entity ID、slug、品牌关系和原创示意图；通过 `recordEntityContentReview` 与 `publishEntity` 发布。
- 定向回归覆盖 owned checkpoint、远程选择拒绝、身份、正文、独立来源组、审核/发布 hash、品牌正反向关系、幂等重放和真实 catalog snapshot。
- 跑 integrity/FK/library contract、三项全库审计、TypeScript、Biome 与 diff 检查。

## 边界

- 仅在本目录的 `checkpoint.db` 与测试临时 copy 写入。
- 保留其他 agent 的 research、`.next-phase*` 和 Montblanc quick 目录，不顺手清理。
- 审计 JSON、checkpoint 数据库和非本批文件不提交。

## 验收

1. 三个目标实体各有至少 3500 个 JavaScript Unicode 字符的研究文件、至少三组独立来源、至少四个 approved references 和一张 primary media。
2. 三个实体保持原身份、exactly one `made_by` 与 exactly one品牌反向导航，publication 为 published 且无 blocker。
3. fact/language/media/publication reviews 均对应最新 content hash；二次 apply 全部 noop。
4. 真实资料库 SHA-256 与 snapshot 前后不变；integrity/FK/library contract 通过。
5. 记录实际 checkpoint hash、审计统计、目标行指标和既有 TypeScript 基线错误；本批提交只包含明确拥有的文件。
