---
quick_id: 260908-mz8
status: complete
description: 只读检索 Phase 21 四组 locked split 的八个 Phase 19 payload slots，并在无法证明 immutable ID 时记录 fail-closed 边界
---

# Quick Plan: Phase 21 payload slot 只读解析

## Scope

- 只检查 `gwKClNnwt3V3`、`dTCUDu03vrI6`、`s0HAxT1gsHxh`、`G9ptvLpfyzNQ` 四个 donor 对应的八个 `phase19-slot`。
- 在仓库内已有的 caller-owned checkpoint、backup、build artifact 和其他 SQLite 副本中只读检索 exact donor、media、source、review 行及 slot/checksum。
- 不猜测旧行 ID，不把当前 media/review/source 行替代缺失的 Phase 19 行，不修改 manifest 的 `itemId`。
- 明确排除真实 `data/fpkg.db`、Turso、生产环境和任何受保护 catalog 写入。

## Acceptance

- [ ] 从 `data/taxonomy/v1.2-phase21.json` 解析出八个 slot，均保持 `itemId: null`、`targetId: null`、`pending_conflict` 和 `requiresOwnedCopyResolution: true`。
- [ ] 对仓库内数据库副本完成只读候选扫描，记录候选数、打开数、donor 完整快照数、payload 表可读数、签名组和结构不完整副本。
- [ ] 对八个完整 `evidenceChecksum` 与稳定 `slotKey` 做数据库文件 byte-level exact search；任何 0 命中都必须 fail closed，不能生成替代 ID。
- [ ] 记录 donor 当前可见的 media/source/review 形态，证明它们不能唯一还原八个缺失 slot；真实 catalog SHA-256 保持不变。

## Verification

- `node` 只读解析 manifest slot parity。
- `node` 只读扫描 `*.db`、`*.sqlite`、`*.sqlite3`（排除 `.git`、`node_modules` 和 `data/fpkg.db`）。
- `git diff --check`。

## Output

`.planning/quick/260908-mz8-phase21-unresolved-phase19-payload-slots/SUMMARY.md` 和 `evidence/phase21-slot-resolution.json`
