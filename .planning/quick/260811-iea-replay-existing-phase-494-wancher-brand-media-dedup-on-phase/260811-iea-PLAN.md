---
quick_id: 260811-iea
status: complete
date: 2026-08-11
---

# Replay existing Phase 494 media dedup on the Phase 586 candidate

不新增实体、不改现有内容包代码，也不访问 Turso。把已经提交的 Phase 494 scoped media dedup wrapper 重放到 Phase 586 owned checkpoint 的下一份 owned copy，修复 Wancher 品牌页与 True Ebonite Matte Black 型号页共用主图的遗漏集成。

## Task 1: 建立下一份 owned checkpoint

- **Input:** Phase 586 checkpoint；真实 `data/fpkg.db` 只作为受保护 hash／snapshot 对象。
- **Action:** 使用项目 checkpoint helper 生成新 copy，确认 source／target／real catalog 不同 inode，迁移版本完整。
- **Verify:** SQLite integrity 与 foreign-key check 通过，真实库 hash 不变。

## Task 2: 重放既有 Phase 494 wrapper

- **Files:** 只读取既有 `scripts/apply-phase494-media-dedup.ts` 与已有 SVG；不修改它们。
- **Action:** 在新 checkpoint 首次执行并再次重放；预期 Wancher 品牌从旧型号图切换到 `/images/library/site-original/wancher/wancher-brand-family.svg`，其余已应用目标保持当前值。
- **Verify:** 首次仅必要实体为 `published`，第二次全部为 `noop`；审核、publication hash 与 public view 一致。

## Task 3: 定向与全局离线复查

- **Action:** 查询全部 current public primary media path，运行 media audit、readiness、production build，并本地读回 Wancher 品牌页和具体型号页。
- **Verify:** 公开主图路径重复组为 0；两页各自引用唯一正确主图；current public blocker 为 0；真实库 hash 不变。
- **Done:** checkpoint 与 evidence 留在本 quick 本地且不提交；只提交 PLAN／SUMMARY／STATE，full corpus goal 继续 active。
