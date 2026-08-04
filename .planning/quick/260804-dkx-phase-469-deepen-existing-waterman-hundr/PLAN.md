# Phase 469：深化 Waterman Hundred Year、Ink-Vue、X-Pen

## 目标

在 Phase 468 owned checkpoint 上深化三个已有 Waterman 历史型号页：Hundred Year Pen、Ink-Vue、X-Pen。复用 Phase 161 的 canonical 实体、Waterman 品牌关系、可靠来源和原创示意图，不新建重复型号，也不把 Emblem、Patrician、Parker 61 或其他相邻路线合并进来。

## 实施边界

1. 只在本目录的 owned `checkpoint.db` 上试写；apply 拒绝 remote、符号链接、真实库和硬链接别名，并验证迁移 032。
2. 使用 `CuratedEntityPack` 刷新包，补充正文、材料／机制／版本边界、维修与选购 claims 和时间线；保留原有 identity、slug、Waterman `made_by` 与反向导航。
3. 通过 `recordEntityContentReview` 的 fact/language/media 三项审核与 `publishEntity` 发布，不直接写 publication 状态。

## 验收

- 三个 canonical entity id/slug 不变；研究文件达到 3500 字符，正文达到 2600 字符；每页至少四条 approved references、三组独立来源和一个 approved primary media。
- 三页均为 published、readiness blocker 为 0，review hash 与 publication hash 一致；各保持恰好一条 `made_by` 与一条 reverse 导航。
- 首次 apply 成功，第二次 replay 全部 noop；checkpoint integrity/FK/library contract/quality audit 通过，真实 `data/fpkg.db` SHA-256 前后不变。
- 定向测试、Biome、`git diff --check` 和 TypeScript 基线检查完成；不触碰其他 agent 的 research、`.next-phase*`、旧 quick 目录或受保护的 Montblanc quick 目录。
