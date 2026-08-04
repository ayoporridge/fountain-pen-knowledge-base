# Phase 470：深化 Waterman Ideal No. 52、No. 7

## 目标

在 Phase 469 owned checkpoint 上深化两个已有 Waterman 早期编号型号页：Ideal No. 52 与 Ideal No. 7。复用 Phase 162 的 canonical 实体、Waterman 品牌关系、Richard’s Pens、USPTO 专利与官方 heritage 来源和原创示意图，不新建重复型号，也不把 52V、No. 5、No. 7 的颜色笔尖或相邻型号混为统一规格。

## 实施边界

1. 只在本目录的 owned `checkpoint.db` 上试写；apply 拒绝 remote、符号链接、真实库和硬链接别名，并验证迁移 032。
2. 使用 `CuratedEntityPack` 刷新包，补充编号体系、材料／尖端／杠杆结构边界、维修与选购 claims 和时间线；保留原有 identity、slug、Waterman `made_by` 与反向导航。
3. 通过 `recordEntityContentReview` 的 fact/language/media 三项审核与 `publishEntity` 发布，不直接写 publication 状态。

## 验收

- 两个 canonical entity id/slug 不变；研究文件达到 3500 字符，正文达到 2600 字符；每页至少四条 approved references、三组独立来源和一个 approved primary media。
- 两页均为 published、readiness blocker 为 0，review hash 与 publication hash 一致；各保持恰好一条 `made_by` 与一条 reverse 导航。
- 首次 apply 成功，第二次 replay 全部 noop；checkpoint integrity/FK/library contract/quality audit 通过，真实 `data/fpkg.db` SHA-256 前后不变。
- 定向测试、Biome、`git diff --check` 和 TypeScript 基线检查完成；不触碰其他 agent 的 research、`.next-phase*`、旧 quick 目录或受保护的 Montblanc quick 目录。
