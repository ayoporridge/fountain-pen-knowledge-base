---
phase: 21-taxonomy
plan: 21-01
fixed_at: 2026-07-18T17:46:17Z
review_path: .planning/phases/21-taxonomy/21-01-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 21 Plan 21-01: Code Review Fix Report

**Fixed at:** 2026-07-18T17:46:17Z  
**Source review:** `.planning/phases/21-taxonomy/21-01-REVIEW.md`  
**Iteration:** 1

**Summary:**

- Findings in scope: 3
- Fixed: 3
- Skipped: 0

## Fixed Issues

### CR-01: Alias provenance 不属于 publication owner graph，来源失效不会撤销公开 alias

**Status:** fixed: requires human verification  
**Files modified:** `migrations/032_taxonomy_identity.sql`, `tests/taxonomy/taxonomy-substrate.test.ts`  
**Commits:** `6716874`, `bbe5139`  
**Applied fix:** 把 approved alias 的 `source_item_id` 纳入 `publication_source_item_entities`，复用现有 canonical payload 和 source invalidation owner graph；新增 alias-only source 回归，验证 approved source 变化会 revision++、撤销 reviews、移除 public row，pending/rejected alias 不形成 owner。

### CR-02: 任意 v3 review 可被改写成伪造的 immutable v2 history

**Status:** fixed: requires human verification  
**Files modified:** `migrations/032_taxonomy_identity.sql`, `tests/taxonomy/taxonomy-substrate.test.ts`  
**Commit:** `3766ee7`  
**Applied fix:** legacy update guard 同时检查 OLD 与 NEW hash，任何运行时写入都不能进入非-v3 hash；新增 approved/revoked v3 review 降级到 v2 revoked 的拒绝回归，并验证失败后原记录不变。

### CR-03: Lineage/redirect 可以跨 taxonomy batch 绑定错误 action

**Status:** fixed: requires human verification  
**Files modified:** `migrations/032_taxonomy_identity.sql`, `tests/taxonomy/taxonomy-substrate.test.ts`  
**Commit:** `202c67f`  
**Applied fix:** 为 lineage/redirect 的 insert/update 增加 non-null action 同 batch guard，并冻结已被引用 action 的 batch；新增两个 batch 的跨 batch insert/update adversarial 回归。

## Verification

- `taxonomy-substrate.test.ts`: 5/5 passed.
- TypeScript: passed.
- Targeted Biome: passed.
- No real catalog, Phase 19 wrapper, broad suite, remote database, or deployment command was run.

---

_Fixed: 2026-07-18T17:46:17Z_  
_Fixer: the agent (gsd-code-fixer)_  
_Iteration: 1_
