# Phase 19: 真实审计与证据契约 - Research

**Researched:** 2026-07-15  
**Scope:** 只研究 Phase 19 的本地实现；不写 305 条百科正文，不连接 Turso，不部署。  
**Confidence:** HIGH（现有 schema、publication transaction、fixture 和 public-surface oracle 已逐文件核对；SQLite 迁移与只读行为使用官方文档复核）。

<user_constraints>
## User Constraints (locked)

### D-01 全量库存口径
- 审计集合固定为执行开始时真实数据库中的全部 `brand` 与 `pen` raw rows，当前已知是 69 个品牌、236 个型号，共 305 条；旧 65+231 公开基线只作为可追溯字段，不能替代或缩小审计范围。
- 台账必须明确列出额外 4 个品牌和 5 个型号的身份与 disposition，不能因其曾隐藏、重复、占位或未达标而漏审。
- 当前 `public_entities` 可能为 0；`published blockers = 0` 不能单独代表内容完成，报告必须同时显示 raw inventory、旧公开基线、published set 和完整 backlog。

### D-02 零抽样与确定性产物
- NDJSON 与 CSV 一行对应一个 raw brand/pen identity，identity 集合双向等于 live inventory；不得抽样、分页漏项或用代表条目替代全库。
- `--limit` 只能限制终端展示，不能改变扫描集合、汇总、退出码、artifact 行数或 pass/fail 判定。
- 相同数据库与 contract version 重跑，排序、blocker code、统计和 machine-readable 产物必须确定性一致；时间戳等运行元数据不得污染内容判等。

### D-03 证据和来源门槛
- 每个可公开规格/核心事实必须拥有独立 approved citation 与可定位 evidence locator，并记录适用的 model/variant、地区和时间范围；row-level queue anchor 或来源列表不能替代逐字段证据。
- source registry 必须记录 source kind/tier、independence group、allowed use、retrieved date 和必要的 archive/locator；镜像、转载和同源页面只算一个独立来源组。
- 身份与核心规格至少需要一手来源或同期档案，加一个独立专业二手来源；retailer、社区讨论和搜索结果只能辅助，不能单独解锁发布。
- 本阶段只定义并验证证据契约与 fixture，不开始大规模网络采集；实际逐条检索、写作和补证在 Phase 22–25 执行。

### D-04 scope、冲突与审核
- 事实必须能区分现售/历史、地区、年代、笔尖、材料、尺寸和特别版等 scope；家族事实不能由一个当前特别版反向证明。
- 同一 scope 的 unresolved conflict 阻止该字段进入公开规格；涉及 canonical identity 或唯一品牌归属的 unresolved conflict 阻止整条实体发布。
- 事实审核、中文自然度审核、媒体相关性/许可审核和最终 publication review 分开记录；每一种审核都必须绑定当前 canonical content hash，内容变化后不能沿用旧结论。

### D-05 fail-closed readiness v2
- Phase 18 的 `public_entities` 继续作为唯一公开授权集合；Phase 19 只收紧 readiness，不建立旁路或第二套 public predicate。
- deprecated story、pending claim、needs_source spec、无逐字段 citation、来源独立性不足、unresolved conflict、缺少相应 hash-bound review 任一存在时均产生明确硬 blocker；总分或其他优点不能抵消。
- 迁移中的现有数据默认不因 schema 新增而获得资格；contract version 升级后旧 review 失效，只有完整 fixture 可重新原子发布。

### D-06 安全边界
- 真实本地 catalog 只允许 immutable/read-only 盘点；所有 migration、写入、发布、fixture 与 browser 检查必须使用任务自己创建的 disposable database，并比较真实 catalog main/WAL/SHM 前后状态。
- 本阶段禁止远程 Turso migration/write、push、Vercel deployment 和生产数据变更；它们统一留到 Phase 26 的 staged rollout。
- 禁止硬编码凭据；任何环境配置继续通过既有环境变量与 fail-closed resolver。

### D-07 品牌—型号可审计性
- 每个型号必须在台账中记录 canonical `made_by` 状态：恰好一个、缺失、多重或指向非 canonical/不可发布品牌；不得只检查少数示例。
- 每个品牌同时记录 reverse model raw set、public set 与差异；后续 Majohn A1 达标发布时，必须自动出现在末匠品牌页完整型号列表中。
- Phase 19 不直接修复 taxonomy 争议或批量补正文，但必须为每一项生成稳定 blocker/disposition，供 Phase 21 和 Phase 23 逐条消化。

### the agent's Discretion
- 新表和列的精确命名、normalized schema 细节、audit module 的内部拆分、CSV 字段顺序与 fixture ID 命名，在满足上述可验证契约和现有 SQLite/TypeScript 风格的前提下由执行者决定。

## Deferred Ideas

- 品牌/型号最终百科 renderer 与公开页面排版 — Phase 20。
- alias、merge、split、rename、variant 与争议身份实质修复 — Phase 21。
- Montblanc 149 全新研究与 A 档正文 — Phase 22。
- 305 条实际库存逐条网络检索、写作、规格/来源/媒体补齐与 publication — Phase 23。
- P0/P1 新品牌与型号扩容 — Phase 24–25。
- 远程 Turso、Vercel 与正式域名发布验收 — Phase 26。

上述约束逐字取自阶段上下文；规划不得弱化或扩展它们。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`]
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | 本阶段必须落地的可验证能力 | 研究结论 |
|---|---|---|
| EVID-01 | 每个公开规格字段有 approved citation、locator、scope | 新建逐字段 evidence mapping；非空核心字段逐项计算 blocker，禁止 row-level citation 代替。[VERIFIED: `.planning/REQUIREMENTS.md`; `migrations/011_library_schema.sql`] |
| EVID-02 | source kind/tier/group/use/retrieved/archive | 保留现有 `source_type`/`allowed_use`/`source_items.retrieved_at`，新增 tier、independence group、archive/locator 字段，并纳入 hash。[VERIFIED: `src/lib/publication.ts`; `migrations/011_library_schema.sql`] |
| EVID-03 | variant/scope | 新建规范化 scope 表，证据映射必须指向 scope；family 与 variant 不允许隐式继承。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`] |
| EVID-04 | 冲突与 resolution | 新建 conflict header/member；同 scope 未解决字段冲突屏蔽字段，identity/made_by 冲突屏蔽实体。[VERIFIED: `.planning/REQUIREMENTS.md`] |
| EVID-05 | 四类独立、hash-bound review | 新建 review ledger，唯一键为 entity + review kind + content hash；v2 要求 fact/language/media/publication 四类 approved。[VERIFIED: `.planning/REQUIREMENTS.md`; `src/lib/publication.ts`] |
| EVID-06 | primary/archive + independent professional secondary | 以 source tier + independence group 计数；retailer/community/search-only 永远不足以解锁 identity/core specs。[VERIFIED: `.planning/REQUIREMENTS.md`] |
| AUD-01 | 69 brand + 236 pen 的 305 行 NDJSON/CSV | 一个 canonical inventory query 产出两种格式；集合双向等于 raw inventory，旧 65+231 只是列。[VERIFIED: `.planning/REQUIREMENTS.md`] |
| AUD-02 | 只按真正合格状态计数 | 所有 coverage 聚合改用 centralized qualifying views，过滤 deprecated/pending/needs_source/candidate/draft。[VERIFIED: `scripts/audit-entity-quality.ts`; `src/lib/library.ts`] |
| AUD-03 | 任一 blocker 即失败 | 删除“两项理由才算 thin”和总分抵消；`blocker_count > 0` 是唯一失败条件。[VERIFIED: `scripts/audit-entity-quality.ts`; `.planning/REQUIREMENTS.md`] |
| AUD-04 | publication + backlog；limit 仅展示 | 完整 ledger、summary、exit code 先计算并写出，再对 console rows 做 slice。[VERIFIED: `scripts/audit-entity-quality.ts`; `scripts/audit-library-coverage.ts`] |
| AUD-05 | public blocker 0 + surface exact parity | 复用 Phase 18 的 `public_entities` 与四语义 parity oracle；新增真实 ledger release check，不复制 predicate。[VERIFIED: `scripts/check-public-boundary.ts`; `.planning/phases/18-publication-gate/18-VERIFICATION.md`] |
| QA-01 | 负例和完整正例 fixture | 在 disposable DB 覆盖 context 指定的 10 类 fixture，并验证直接 SQL 与 API transaction 都 fail closed。[VERIFIED: `.planning/REQUIREMENTS.md`; `scripts/check-publication-gate.ts`] |
</phase_requirements>

## Executive Summary

Phase 19 应实现成三个共享同一 SQL truth source 的部件：`migration 031 + readiness v2`、`canonical inventory/readiness audit`、`disposable contract fixtures`。不要继续给现有三个 audit script 分别补条件，否则状态语义还会漂移。[VERIFIED: `scripts/audit-entity-quality.ts`; `scripts/audit-library-coverage.ts`; `src/lib/library.ts`]

现有 Phase 18 授权架构可保留：`entity_publications` 管 lifecycle，`publication_blockers` 汇总硬 blocker，`public_entity_readiness` 给诊断，`public_entities` 是唯一公开集合，`publishEntity()` 在单次 write transaction 中计算 hash、写 review、检查 readiness、发布并复核 membership。[VERIFIED: `migrations/030_publication_gate.sql`; `src/lib/publication.ts`; `.planning/phases/18-publication-gate/18-VERIFICATION.md`]

需要升级的是资格内容而非公开面：v1 当前只硬性检查摘要、正确类型的 published story、hash/revision/reviewer 与 pen 的 `made_by`；canonical payload 虽读取 specs、variants、claims、citations、sources、references、timeline 和 primary media，却没有用 v2 的逐字段证据、来源独立性、scope、冲突和四类审核决定资格。[VERIFIED: `migrations/030_publication_gate.sql`; `src/lib/publication.ts`]

## Current Codebase Findings

1. `audit-entity-quality.ts` 扫全表，但 story/claim 没有 status filter，thin entity 必须同时命中两个原因才进入失败清单，且报告本身不设置失败退出；`--limit` 截断机器可读明细。[VERIFIED: `scripts/audit-entity-quality.ts`]
2. `getLibraryCoverageReport()` 的 joins 可让 deprecated story、pending claim、needs_source spec 和 candidate media 增加覆盖分；它提供摘要和 priority slice，不是 305 行事实台账。[VERIFIED: `src/lib/library.ts`; `scripts/audit-library-coverage.ts`]
3. `audit-read-first-rewrite.ts` 使用 inner join、无 status filter 且硬截 120 行；它不能作为全库存 oracle。[VERIFIED: `scripts/audit-read-first-rewrite.ts`]
4. `audit-public-media.ts` 只审已选 media row，不证明每个 raw entity 是否有合格主图，失败路径也不适合作为 release gate。[VERIFIED: `scripts/audit-public-media.ts`]
5. Phase 18 的默认 publication/public-boundary checks 使用任务生成的 fixture；`--legacy` 才读取真实 catalog，且不能证明 305 行 inventory 已盘点。因此 Phase 19 必须新增真实只读 ledger gate，同时继续保留 fixture oracle。[VERIFIED: `scripts/check-publication-gate.ts`; `scripts/check-public-boundary.ts`]
6. 当前 DB resolver 可受 `TURSO_DATABASE_URL` 影响；真实 audit 不应调用隐式 `getDb()`，必须走显式本地只读入口并主动拒绝 remote URL。[VERIFIED: `src/lib/db.ts`; `scripts/audit-entity-quality.ts`]

## Recommended Architecture

### 1. Migration `031_evidence_readiness_v2.sql`

只新增 migration 031，绝不改写已记录 checksum 的 030。[VERIFIED: `src/lib/db.ts`; `scripts/check-publication-gate.ts`]

建议最小规范化 schema 如下；名称可调整，但职责不可合并：[ASSUMED]

| Object | Required columns / constraints | Purpose |
|---|---|---|
| `fact_scopes` | `id`, `entity_id`, optional `variant_id`, `market`, `valid_from`, `valid_to`, `production_state`, `nib_scope`, `material_scope`, `edition_scope`; stable unique `scope_key` | 显式描述事实适用范围；空值代表 deliberately broad，不代表未知继承。[ASSUMED] |
| `spec_field_evidence` | `id`, `model_spec_id`, whitelisted `field_key`, `citation_id`, `scope_id`, `evidence_locator`, `review_status`; unique semantic tuple | 把 citation 从整行锚点降到字段级；每个非空核心字段独立验收。[ASSUMED] |
| `fact_conflicts` | `id`, `entity_id`, optional `field_key/scope_id`, `conflict_kind`, `status`, `resolution_note`, timestamps | 区分 field 与 identity/made_by conflict；resolved 必须有 note。[ASSUMED] |
| `fact_conflict_members` | `conflict_id`, `citation_id`, `asserted_value` | 保存互相冲突的证据，不覆盖历史结论。[ASSUMED] |
| `entity_content_reviews` | `id`, `entity_id`, `review_kind`, `content_hash`, `status`, reviewer/time/note; unique `(entity_id, review_kind, content_hash)` | 分开 fact/language/media/publication review，并绑定 canonical v2 hash。[ASSUMED] |

在现有 source schema 上最小增量：`source_registry` 增 `source_tier`、`independence_group`；`source_items` 保留现有 `retrieved_at`，增 `archive_url`（必要时 `archive_locator`）；逐字段 locator 放在 `spec_field_evidence`，不要把页面级 URL 冒充页内定位。[VERIFIED: `migrations/011_library_schema.sql`; `src/lib/publication.ts`] [ASSUMED]

`entity_publications.approved_content_hash` 当前 CHECK 只接受 `sha256:v1:`，而 `PUBLICATION_CONTRACT_VERSION` 也是 1。v2 若使用 `sha256:v2:`，031 必须按 SQLite 官方 generalized ALTER TABLE procedure 重建该表，并重建依赖 index/view/trigger；不能直接改 CHECK，也不能编辑 030。[VERIFIED: `migrations/030_publication_gate.sql`; `src/lib/publication.ts`] [CITED: https://www.sqlite.org/lang_altertable.html]

迁移 backfill 必须是保守的：复制 lifecycle rows但统一降为 `draft`（或至少清空 review/hash 并禁止 published），`reviewed_contract_version` 不得自动改为 2；新增 evidence/review 表不做“推断式 approved” backfill。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`] [ASSUMED]

### 2. Central status-truth views

031 应提供一层只供 readiness/audit 复用的 qualifying views，而不是在 TypeScript 中重复十几套 status 条件：[ASSUMED]

- `publication_v2_qualified_stories`: 仅正确 story type 且 `status='published'`；任何 entity-owned deprecated story另产生 blocker。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`]
- `publication_v2_qualified_specs`: 仅 `review_status='approved'`；`needs_source` 或 pending 另产生 blocker。[VERIFIED: `.planning/REQUIREMENTS.md`]
- `publication_v2_field_evidence`: evidence mapping、citation、source item 与 source registry 全链 approved/allowed，locator 非空，scope 有效。[ASSUMED]
- `publication_v2_source_groups`: 对 `independence_group` 去重后，分别证明 primary/archive 与 professional-secondary；retailer/community/search 只记辅助数。[ASSUMED]
- `publication_v2_reviews`: 四种 review 均为 approved 且 hash 等于当前 canonical hash；review rows 本身不得进入 content hash，否则形成自引用循环。[ASSUMED]
- `publication_v2_conflicts`: unresolved field/identity/made_by conflict 直接输出稳定 blocker code。[ASSUMED]

所有 blocker 先输出“一实体一 code 一 detail_key”的普通行，再由 diagnostic view 聚合；排序必须在聚合输入或 aggregate 内显式指定，不能依赖 SQLite 未指定的行顺序。[CITED: https://www.sqlite.org/lang_aggfunc.html]

建议稳定 blocker code 至少包括：`deprecated_story_present`、`pending_claim_present`、`spec_needs_source`、`missing_field_evidence:<field>`（artifact 中 code 与 field 分列，SQL code 保持低基数）、`missing_primary_or_archive_group`、`missing_professional_secondary_group`、`unresolved_field_conflict`、`unresolved_identity_conflict`、`missing_fact_review`、`missing_language_review`、`missing_media_review`、`missing_publication_review`、`missing_approved_primary_media`，并保留 Phase 18 的 summary/story/hash/revision/made_by blockers。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`; `migrations/030_publication_gate.sql`] [ASSUMED]

`public_entities` 仍只引用 readiness v2，不复制 SQL predicate；legacy non-brand/pen 分支必须保持 Phase 18 compatibility oracle，除非 entity 已有显式 publication row。[VERIFIED: `migrations/030_publication_gate.sql`; `scripts/check-publication-gate.ts`]

### 3. Canonical content hash and atomic publish

扩展 `readPublicationContentPayload()`，纳入 source tier/group/archive、scope、field evidence、conflicts、approved media等内容；所有数组按 stable ID/semantic key 排序，文本继续 NFC/newline normalization。[VERIFIED: `src/lib/publication.ts`] [ASSUMED]

不要把 `entity_content_reviews` 本身纳入 hash。正确顺序是：计算 content hash → 要求 fact/language/media reviews 已对该 hash approved → transaction 内写/更新 publication review → 查询 v2 blockers → blockers 为零才转 published → 复核 `public_entities` membership → commit；任一步失败全部 rollback且不 retry。[VERIFIED: `src/lib/publication.ts`; `scripts/check-publication-gate.ts`] [ASSUMED]

任何会改变 v2 payload 的表必须进入 invalidation trigger matrix；对 reviews 表只读取 hash match，不触发 content revision，否则会出现“审核本身使审核失效”的循环。[VERIFIED: `migrations/030_publication_gate.sql`] [ASSUMED]

### 4. Full inventory ledger

新增独立 module（建议 `src/lib/audit/readiness-audit.ts`）只接受显式 DB adapter，返回完整、已排序、不可分页的 `InventoryAudit`；CLI（建议 `scripts/audit-readiness-v2.ts`）只负责参数、序列化、终端显示和 exit code。[ASSUMED]

canonical universe SQL 必须从 raw `entities WHERE type IN ('brand','pen')` 开始，按 `type, slug, id` 稳定排序；不得从 `stories`、`entity_publications`、`public_entities` 或 inner join 起步。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`]

每行至少包含：[ASSUMED]

`inventory_snapshot_id`, `entity_id`, `type`, `slug`, `name`, `in_legacy_public_baseline`, `publication_status`, `readiness_contract_version`, `is_public`, `blocker_codes`, `blocker_details`, summary/story/spec/claim/reference/source/media counts by qualifying status, `made_by_status`, canonical brand id/slug, raw/public reverse-model ids/counts, evidence field totals/approved/missing, independent source group counts by tier, unresolved conflict counts, four current-hash review states, `disposition`。

`inventory_snapshot_id` 应由排序后的 `(id,type,slug)` canonical JSON 做 SHA-256 得出，而不是时间戳；run timestamp、host 和 output path放 sidecar metadata，不能进入 NDJSON/CSV 内容判等。[ASSUMED]

NDJSON 是 canonical machine artifact；CSV 使用固定列顺序和经过 fixture 测试的 RFC 4180 escaping 派生，不引入新 package。两者都必须恰好 305 data rows且 identity set相等；实际执行开始若 live counts/IDs 与已锁 snapshot 不同，应 fail并要求显式更新 baseline，而不是静默接受。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`] [ASSUMED]

`--limit=N` 的实现必须在 `audit` 对象和 artifacts/exit code完成之后，仅对 console renderer 使用 `rows.slice(0,N)`；验证时比较 `--limit=1` 与无限制的 artifact hash、summary 和 exit code完全相同。[ASSUMED]

### 5. Read-only real-catalog adapter

真实 audit 使用现有 `better-sqlite3` 的独立显式 adapter，要求 absolute local path、file exists、read-only open，并执行 `PRAGMA query_only=ON`；adapter 直接拒绝 `libsql://`、`https://`、Turso env selection与任何 migration API。[VERIFIED: `package.json`; `src/lib/db.ts`] [ASSUMED]

SQLite 官方支持 URI `mode=ro`；`immutable=1` 会跳过锁与 change detection，若文件实际上变化可能返回错误结果。因此真实 catalog 不应在活跃写入期间盲用 `immutable=1`；应采用 OS/driver read-only + `query_only`，并在运行前后比较 main/WAL/SHM 的 exists/size/hash/metadata，发现变化即 fail。[CITED: https://www.sqlite.org/uri.html] [CITED: https://www.sqlite.org/pragma.html#pragma_query_only]

所有 migration、trigger、publish与 QA fixture继续使用现有 `mkdtemp` disposable DB生命周期，并清空 remote env；复用 Phase 18 success/failure/SIGTERM cleanup和 real-catalog snapshot assertions。[VERIFIED: `scripts/check-publication-gate.ts`; `scripts/check-public-boundary.ts`]

## Runtime State Inventory

1. **Persisted state:** raw catalog tables、migration checksum、new evidence/scope/conflict/review tables、publication lifecycle rows，以及提交到 phase artifact目录的 deterministic NDJSON/CSV。[VERIFIED: `src/lib/db.ts`] [ASSUMED]
2. **In-flight state:** `publishEntity()` 单次 write transaction、fixture temp DB、CLI 内存中的完整 305-row audit object；失败必须 rollback/cleanup。[VERIFIED: `src/lib/publication.ts`; `scripts/check-publication-gate.ts`]
3. **Derived state:** v2 qualifying views、blocker rows、readiness/public view、inventory summary、CSV；全部可从 persisted truth重建，不单独回写真实 catalog。[ASSUMED]
4. **External state:** 本阶段无 Turso、Vercel、LLM、搜索或网络采集写入；唯一外部技术依据是只读官方文档。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`]
5. **Configuration/secrets:** `FPKG_DATABASE_URL`/Turso env继续由 resolver管理；real audit必须显式 local path并拒绝 remote，凭据不写代码或 artifact。[VERIFIED: `src/lib/db.ts`; `AGENTS.md`]

## Validation Architecture

项目没有 Vitest/Jest 依赖；现有约定是 `tsx` contract scripts + disposable SQLite + Playwright。Phase 19 不应为此引入新 test runner。[VERIFIED: `package.json`; `scripts/check-publication-gate.ts`]

### Wave 0 — test seams first

先建立以下缺失 seam，再实现 schema/readiness；否则无法安全演进 migration 031：[ASSUMED]

- `check:evidence-contract`：fresh、pre-031 upgrade、idempotent replay、schema manifest、FK/quick_check、v1 review invalidation。
- `check:audit-readiness`：pure fixture ledger、NDJSON/CSV equality、limit invariance、determinism、exit semantics。
- shared fixture builders：source groups、field evidence、scope、conflict、four reviews；禁止复制 runtime predicate作为 expected oracle。
- real-catalog `--inventory-only --readonly` check：只生成 artifact并比较 main/WAL/SHM前后；不得 migrate。

### Fixture matrix

| Case | Expected blocker/result |
|---|---|
| deprecated story | `deprecated_story_present`; not public |
| pending claim | `pending_claim_present`; not public |
| needs_source spec | `spec_needs_source`; not public |
| mirror/repost same group | independent group count remains 1 |
| non-null field without field citation/locator | `missing_field_evidence`; not public |
| retailer-only sources | primary/professional tier blockers remain |
| unresolved same-scope field conflict | field conflict blocker; field not qualified |
| identity or made_by conflict | entity-level blocker |
| stale review hash | corresponding review blocker |
| fully qualified brand + pen | atomic publish succeeds; pen exactly one public brand; reverse brand list updates |

该矩阵直接覆盖 QA-01，并补齐 D-03/D-04 中明确但 QA-01 简写未列出的 retailer-only、identity conflict和四类 stale review。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`; `.planning/REQUIREMENTS.md`]

### Test layers and commands

| Layer | Command (planned) | Must prove |
|---|---|---|
| Fast (<30s target) | `pnpm check:evidence-contract -- --fixture` | status filters、field evidence、groups、scope/conflict、hash-bound reviews。[ASSUMED] |
| Audit | `pnpm check:audit-readiness -- --fixture` | complete set、limit invariance、deterministic NDJSON/CSV、one blocker fails。[ASSUMED] |
| Migration | `pnpm check:publication-gate -- --migration-full` extended for 031 | fresh/upgrade/idempotent/integrity/invalidation/direct SQL/rollback。[VERIFIED: `scripts/check-publication-gate.ts`] |
| Public parity | `pnpm check:public-boundary -- --all` | list、per-ID、aggregate、context subset、brand reverse set仍只来自 `public_entities`。[VERIFIED: `scripts/check-public-boundary.ts`] |
| Read-only catalog | planned `pnpm audit:readiness-v2 -- --inventory-only --out ...` | 69+236/305 ledger，extra 9显式，DB snapshots unchanged。[ASSUMED] |
| Full regression | `pnpm lint && pnpm build && pnpm test:e2e:desktop && pnpm test:e2e:mobile` | compile与现有公开面无回归。[VERIFIED: `package.json`] |

Release acceptance必须分别报告：(a) inventory audited 305/305；(b) content-ready N/305；(c) published P；(d) published blocker count 0；(e) all public surfaces exact parity。允许 (d) 在 P=0 时通过，但不得把它表述成 inventory/content完成。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`]

## Security Domain (ASVS Level 1)

- **Authorization / fail closed:** publication transition继续由 DB trigger + transaction + `public_entities` membership共同约束；任何 audit helper不得成为公开授权 predicate。[VERIFIED: `migrations/030_publication_gate.sql`; `src/lib/publication.ts`]
- **Input validation:** CLI limit必须是有界正整数；DB/output path必须 canonicalize并限制到显式位置；`field_key`, `review_kind`, source tier和status使用 CHECK/whitelist，SQL values参数化，动态 identifier不得来自用户输入。[VERIFIED: `src/lib/db.ts`] [ASSUMED]
- **Integrity:** canonical SHA-256用于内容变更检测，不用于密码学身份认证；hash version、contract version和review hash必须一致。[VERIFIED: `src/lib/publication.ts`]
- **Data safety:** real catalog adapter无 write API，远程 URL fail closed，fixture始终 disposable，main/WAL/SHM before/after不变。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`; `scripts/check-publication-gate.ts`]
- **Output safety:** CSV固定列并正确转义逗号、引号、换行；若 artifact会由 spreadsheet打开，display CSV对以 `= + - @` 开头的自由文本做公式安全编码，canonical NDJSON保留原值。[ASSUMED]
- **Secrets:** 不记录 auth token、环境变量内容或 source-site credential；本阶段无远程调用。[VERIFIED: `AGENTS.md`; `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`]
- ASVS authentication/session/upload/browser-security类别不适用于本阶段的本地 schema/audit CLI；Next public boundary regression仍由既有 tests覆盖。[ASSUMED]

## Implementation Order

1. **Wave 0 + read-only adapter:** 建 shared fixture和real DB snapshot seam；先证明不触碰catalog。[ASSUMED]
2. **Migration 031:** 新 evidence/scope/conflict/review schema，重建 publication table以支持v2 hash，重建manifest/views/triggers，保守失效旧review。[ASSUMED]
3. **Canonical payload + readiness v2:** 扩hash、集中qualifying views/blockers、升级atomic publish；跑migration/publish fixtures。[ASSUMED]
4. **Full audit module/artifacts:** 一次完整扫描生成305行NDJSON/CSV/summary；将旧quality/library checks改为调用共享结果或退役其release-gate角色。[ASSUMED]
5. **Parity/release regression:** 扩Phase18 fixture matrix、执行public-boundary、build/e2e；只提交本地代码、migration、tests和deterministic artifacts，不部署。[ASSUMED]

## Common Pitfalls

- 从 `stories` inner join起步会漏掉最需要审计的空壳页；universe只能从raw entities开始。[VERIFIED: `scripts/audit-read-first-rewrite.ts`]
- 只比较数量会掩盖“漏一条又多一条”；所有集合都要双向 `EXCEPT`/set equality。[VERIFIED: `scripts/check-publication-gate.ts`; `scripts/check-public-boundary.ts`]
- 把review rows纳入hash会造成hash-review循环；review指向hash，不参与hash。[ASSUMED]
- 把citation挂到整行spec会让一个来源解锁全部字段；必须field mapping + locator + scope。[VERIFIED: `.planning/REQUIREMENTS.md`]
- 以URL host判断独立来源会把镜像/转载误计为独立；必须使用人工可审核的independence group。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`]
- 在031中编辑030或使用`writable_schema`捷径会破坏migration checksum/依赖对象安全；按官方table rebuild流程重建并做FK/quick_check。[VERIFIED: `src/lib/db.ts`] [CITED: https://www.sqlite.org/lang_altertable.html]
- 默认调用`getDb()`可能被Turso env劫持；real audit必须显式local read-only adapter。[VERIFIED: `src/lib/db.ts`]
- 把zero published blockers当作“全站内容完成”会在public set为空时真空通过；必须同时断言305-row inventory coverage和backlog。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`]

## Dependencies and Environment

无需新增 package。现有 Node/TypeScript、`tsx`, `@libsql/client`, `better-sqlite3`, Node `crypto/fs`和Playwright已覆盖migration、只读audit、deterministic serialization与fixture需要。[VERIFIED: `package.json`]

环境可用性检查标记为 **SKIPPED**：本阶段没有需要额外安装或登录的外部工具/服务，且明确禁止remote/Turso/deploy/search/LLM；执行计划应只使用repo现有runtime。[VERIFIED: `.planning/phases/19-real-audit-evidence/19-CONTEXT.md`; `package.json`]

项目级 `.codex/skills` 与 `.agents/skills` 未发现可改变本阶段实现的 project skill，按现有 GSD/AGENTS约束规划即可。[VERIFIED: workspace skill discovery]

## Sources and Confidence

### Primary codebase sources (HIGH)

- `migrations/030_publication_gate.sql` — v1 schema、blockers、public view、guards与invalidation matrix。[VERIFIED]
- `src/lib/publication.ts` — canonical payload/hash和atomic publish transaction。[VERIFIED]
- `src/lib/db.ts` — resolver、migration checksum、schema manifest和readiness guard。[VERIFIED]
- `scripts/check-publication-gate.ts` — disposable migration/publish/snapshot fixtures。[VERIFIED]
- `scripts/check-public-boundary.ts` — public surface四语义oracle与完整reverse brand-model fixture。[VERIFIED]
- `scripts/audit-entity-quality.ts`, `scripts/audit-library-coverage.ts`, `src/lib/library.ts` — 当前audit/coverage语义缺口。[VERIFIED]

### Official external sources (HIGH)

- SQLite ALTER TABLE / generalized rebuild procedure: https://www.sqlite.org/lang_altertable.html [CITED]
- SQLite URI filenames, `mode=ro`, `immutable=1` caveat: https://www.sqlite.org/uri.html [CITED]
- SQLite `PRAGMA query_only`: https://www.sqlite.org/pragma.html#pragma_query_only [CITED]
- SQLite aggregate ordering: https://www.sqlite.org/lang_aggfunc.html [CITED]

### Confidence limits

精确table/column命名和CSV列序属于agent discretion；上面的名称是prescriptive recommendation而非既存事实。[ASSUMED] `better-sqlite3` read-only adapter在本项目环境中的main/WAL/SHM行为必须由Wave 0 snapshot probe确认后才能用于real catalog命令。[ASSUMED]

## Planning Handoff

建议拆成五个可独立验收的plan：`19-01 test seams/read-only adapter`、`19-02 migration 031 schema`、`19-03 hash/readiness/publish v2`、`19-04 full inventory artifacts`、`19-05 fixture/parity/full regression`。每个plan都必须写明“real catalog read-only、writes disposable、no remote/no deploy/no content bulk writing”。[ASSUMED]
