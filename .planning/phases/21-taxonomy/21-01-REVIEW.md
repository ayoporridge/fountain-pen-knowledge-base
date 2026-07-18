---
phase: 21-taxonomy
reviewed: 2026-07-18T17:38:31Z
depth: deep
files_reviewed: 4
files_reviewed_list:
  - migrations/032_taxonomy_identity.sql
  - src/lib/publication.ts
  - src/lib/db.ts
  - tests/taxonomy/taxonomy-substrate.test.ts
findings:
  critical: 3
  warning: 0
  info: 0
  total: 3
resolved_findings: 3
resolution_commits:
  - 6716874
  - 3766ee7
  - 202c67f
  - bbe5139
status: resolved
---

# Phase 21 Plan 01: Code Review Report

**Reviewed:** 2026-07-19
**Depth:** deep
**Files Reviewed:** 4
**Status:** resolved

## Narrative Findings (AI reviewer)

初审时迁移 fresh/replay 窄测试 4/4 通过、migration 031 checksum 未变化，但发现三条会破坏 publication/taxonomy 审计边界的 P1 缺口。三项现已按下方证据修复，扩展后的窄测试为 5/5，可继续进入后续独立验证。

## Resolved Critical Issues

### CR-01: Alias provenance 不属于 publication owner graph，来源失效不会撤销公开 alias

**Classification:** BLOCKER (P1)

**File:** `/Users/xz/CodeBuddy/fountain-pen-graph/migrations/032_taxonomy_identity.sql:659-684`

**Issue:** `publication_source_item_entities` 覆盖 claim、citation、variant、timeline、media、reference，却漏掉 `entity_aliases.source_item_id`。与此同时 canonical payload 在 `src/lib/publication.ts:343-351,377-390` 会公开 approved alias，但只会通过该 owner view 读取并 hash `source_items`。结果是：某个 source item 只为 approved alias 提供 provenance 时，之后把该 source 改为 `rejected`、改 URL/作者/许可或 independence metadata，都不会命中 `publication_source_item_update` 的 owner 查询（`migrations/032_taxonomy_identity.sql:1921-1947`），不会 revision++/revoke reviews，且 alias 仍保持 approved 并继续公开。这违反“reviewed alias with provenance 进入 current hash”以及来源变更 fail-closed 的核心约束。

**Fix:** 在 `publication_source_item_entities` 增加 approved alias owner 分支，例如：

```sql
UNION
SELECT alias.source_item_id, alias.entity_id
FROM entity_aliases alias
WHERE alias.source_item_id IS NOT NULL
  AND alias.review_status = 'approved'
```

并增加回归测试：发布一个仅由 alias 引用的 source，修改该 source 的 `review_status`/provenance 后，断言 alias owner 的 `content_revision + 1`、reviews revoked、`public_entities` 移除；同时 pending/rejected alias 不应形成 owner。

### CR-02: 任意 v3 review 可被改写成伪造的 immutable v2 history

**Classification:** BLOCKER (P1)

**File:** `/Users/xz/CodeBuddy/fountain-pen-graph/migrations/032_taxonomy_identity.sql:176-181`

**Issue:** legacy update guard 只检查 `OLD.content_hash`。因此一个合法 v3 review 可以执行 `UPDATE ... SET content_hash='sha256:v2:...', status='revoked'`；table CHECK 会接受该行（`migrations/032_taxonomy_identity.sql:121-130`），而 guard 因 OLD 是 v3 不会拦截。该行随后会被当作不可变 legacy history。这样 migration copy 之外仍可制造/改写 v2 审计记录，直接违背“v2 rows only through table-copy；legacy history immutable”的约束，并造成真实 v3 审核记录的数据丢失。

**Fix:** update guard 同时拒绝 NEW 进入非-v3 hash，并继续冻结 OLD legacy 行：

```sql
WHEN substr(OLD.content_hash, 1, 10) != 'sha256:v3:'
  OR substr(NEW.content_hash, 1, 10) != 'sha256:v3:'
```

补测试从一条 v3 revoked/approved row 尝试改成 v2 revoked，必须失败；现有测试只覆盖 v2 INSERT 和旧 v2 row 的 UPDATE/DELETE，未覆盖这条转换路径。

### CR-03: Lineage/redirect 可以跨 taxonomy batch 绑定错误 action

**Classification:** BLOCKER (P1)

**File:** `/Users/xz/CodeBuddy/fountain-pen-graph/migrations/032_taxonomy_identity.sql:353-381`

**Issue:** `entity_lineage.batch_id` 与 `entity_redirects.batch_id` 分别引用 batch，但它们的 `action_id` 只按单列引用 `taxonomy_actions(id)`；数据库没有约束 action 必须属于同一个 batch。于是 batch A 的 lineage/redirect 可以指向 batch B 的 action，破坏 replay ledger、source-row 归因和回滚审计。Phase 21-02 即将按 batch/action 写入全量 identity manifest，这个缺口会让持久化 substrate 接受内部矛盾的审计记录。

**Fix:** 给 `taxonomy_actions` 增加可引用的 `UNIQUE(batch_id, id)`，并将两张表改为 composite FK `FOREIGN KEY (batch_id, action_id) REFERENCES taxonomy_actions(batch_id, id)`；若保留 nullable `action_id`，可用 insert/update trigger 在非 NULL 时验证 batch 一致。补一条两个 batch 的 adversarial test，跨 batch lineage 与 redirect 都必须失败。

## Resolution Evidence

- **CR-01 resolved by:** `6716874` and formatting follow-up `bbe5139`. Approved aliases now project their `source_item_id` into `publication_source_item_entities`; the existing canonical payload query therefore hashes the alias-owned source and source/source-registry mutations use the same owner graph. The regression proves approved alias sources invalidate revision, revoke reviews, and remove the public row, while pending/rejected aliases do not own their sources.
- **CR-02 resolved by:** `3766ee7`. The legacy update guard rejects both an OLD non-v3 row and any NEW non-v3 hash. Regressions prove runtime v3 rows in approved and revoked states cannot be rewritten into v2 revoked history and remain unchanged after rejection.
- **CR-03 resolved by:** `202c67f`. Insert/update guards require every non-null lineage/redirect action to share the row's batch, and a referenced action cannot move batches. Two-batch adversarial coverage rejects cross-batch inserts and updates for both tables.
- `pnpm exec tsx --test tests/taxonomy/taxonomy-substrate.test.ts` passed 5/5.
- `pnpm exec tsc --noEmit` passed.
- `pnpm exec biome check tests/taxonomy/taxonomy-substrate.test.ts src/lib/publication.ts` passed; `git diff --check` passed before each source commit.
- `src/lib/publication.ts` and `src/lib/db.ts` required no implementation changes. No real catalog, Phase 19 wrapper, broad suite, remote database, or deployment target was used.

---

_Reviewed: 2026-07-19_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
_Resolved: 2026-07-18T17:46:17Z_
