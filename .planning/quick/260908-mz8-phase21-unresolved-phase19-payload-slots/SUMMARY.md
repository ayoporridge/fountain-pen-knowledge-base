---
quick_id: 260908-mz8
status: complete
description: 只读检索 Phase 21 四组 locked split 的八个 Phase 19 payload slots，并在无法证明 immutable ID 时记录 fail-closed 边界
completed: 2026-09-08
---

# Quick Task Summary: Phase 21 payload slot 只读解析

## Outcome

已对仓库内可见的 SQLite 副本完成只读检索。Phase 21 manifest 的八个 `phase19-slot` 均没有找到可证明的 immutable payload row ID，因此保持 unresolved；没有生成猜测 ID，也没有放行真实 split。

## Read-only inventory

- 扫描 342 个数据库候选（`*.db`、`*.sqlite`、`*.sqlite3`），全部以 read-only 方式打开。
- 335 个副本同时包含四个 locked donor；334 个副本可读取 donor 的 payload 表并形成可比对快照；另有 1 个副本缺少 `media_assets`，6 个文件不是 catalog schema，1 个副本不含四个 donor。
- donor 快照归并为 7 组签名。Waterman 在历史副本中出现旧版正文/media/review 组合和多个新版组合；Opus 88、Leonardo 的可见 donor 各只有现有单张 media；Aurora generic 在绝大多数副本没有 media/review，最早 backup 另有一张 pending Commons candidate。这些均不能唯一对应 Phase 19 的缺失 slot。
- 八个完整 checksum 和八个稳定 `slotKey` 在 342 个候选数据库文件中均为 0 byte-level exact hit；未发现可回填的 slot item ID。

## Fail-closed boundary

- `data/taxonomy/v1.2-phase21.json` 的八行仍是 `itemId: null`、`targetId: null`、`disposition: pending_conflict`、`requiresOwnedCopyResolution: true`。
- `data/fpkg.db` 未被访问或写入；当前 SHA-256 仍为 `753a341691b15669f0225169a1646603c6071e75a836d921ffa8b98b7808dea5`。
- 未访问 Turso、production 或受保护 catalog；未执行 `reconcileTaxonomyPlan(..., { requireResolvedPayloads: true })` 的真实 apply。
- 下一次可执行 split 仍需要一份能保留原始 row ID 的 pre-031 owned checkpoint 或 Phase 19 payload ledger。仅凭当前 donor 的不同 media/review/source 行不得回填。

## Evidence

详见 `evidence/phase21-slot-resolution.json`，其中记录扫描范围、结构不完整文件、7 组代表性签名、8 个 slot 的 0 命中结果和数据库边界。

## Verification

- manifest slot parity：8/8，全部 null/pending/owned-copy gated。
- database scan：342 candidates / 342 opened read-only / 335 donor-complete / 334 payload-surface complete / 7 signatures。
- exact checksum search：8/8 zero hits；exact slot-key search：8/8 zero hits。
- `git diff --check`：通过。

## Deferred scope

这项 quick task 只完成 slot resolution 的证据化边界；Phase 21 Plan 04 的真实 split、完整 dependency/JSON closure、hierarchy manifest 和 conditional redirect consumer 仍按既有 Phase 21 blocker 保持未执行。
