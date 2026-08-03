# Phase 463：深化 Pilot 78G、88G MR1 与 88G MR2

## 目标

在上一批已验证的 owned checkpoint copy 上，补齐三个既有 Pilot 型号的自然中文正文、型号身份、地区版本、供墨、维护和选购边界；不创建重复实体，不写入真实 `data/fpkg.db`。

## 交付

- 更新三个既有研究文件，保留来源边界与可核实的产品号、变体及样品限制。
- 用 `CuratedEntityPack` 追加来源化 claims 与时间线，并复用既有实体、品牌关系和媒体。
- 通过 `recordEntityContentReview` 的 fact/language/media 审核与 `publishEntity` 发布路径。
- 在本批 owned checkpoint 上执行定向回归、完整性、准备度、类型检查与 diff 检查。
- 只提交本批拥有的研究文件、pack、apply、test、PLAN 和 SUMMARY。

## 验收

1. 三个目标实体均精确对应既有 slug/id，`made_by` 恰好一条，品牌反向导航恰好一条。
2. 正文、来源组、审核状态、approved hash、primary media 和 references 达到定向测试门槛。
3. 重放返回 `noop`，真实 `data/fpkg.db` 快照保持不变，checkpoint 外键与审计通过。
4. TypeScript 仅保留仓库已知基线错误；Biome 与 `git diff --check` 通过。
