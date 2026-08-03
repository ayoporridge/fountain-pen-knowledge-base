---
status: in_progress
---

# Phase 453：深化 Parker Premier vintage、modern 与 The Parker VP

## 目标

在 Phase 452 的 owned checkpoint copy 上，补足三个已有 Parker 型号页的自然中文内容与来源化事实，保持现有 canonical identity、slug、品牌关系和图片边界不变；通过既有 `recordEntityContentReview` 与 `publishEntity` 审核发布路径，不直接写真实 `data/fpkg.db`。

## 执行任务

1. 深化三个研究文档：补充代际、规格边界、版本差异、维护与选购建议，正文达到现有内容门槛。
2. 基于 Phase 40 与 Phase 156 的既有来源包创建 `CuratedEntityPack` 刷新包，新增可核验 claims、scopes 与 timeline，不新建重复实体。
3. 编写只接受 owned checkpoint 的 apply 脚本，严格校验数据库路径、迁移版本、`made_by` 身份关系、审核记录和发布 hash；重复运行必须 noop。
4. 编写定向回归，覆盖内容长度、来源／媒体、身份关系、发布契约、远程数据库拒绝和真实资料库 hash 不变。
5. 在本轮 checkpoint 上运行定向测试、TypeScript、Biome、diff／完整性检查，记录 hash 与结果后只提交本包文件。

## 验收

- 三个目标实体的 canonical id 与 slug 不变，各有自然中文正文、至少 4 个来源引用和 1 个本站原创示意图。
- 每个实体恰有一个 `made_by` 与 Parker 品牌的反向关系；审核 fact/language/media 三项均 approved；publication 为 published 且 contractVersion 为 3。
- apply 首次成功、第二次 replay noop；远程／真实数据库路径被拒绝，真实 `data/fpkg.db` hash 不变。
- 现有未跟踪 research、`.next-phase*` 和其他 quick checkpoint 不被修改或暂存。
