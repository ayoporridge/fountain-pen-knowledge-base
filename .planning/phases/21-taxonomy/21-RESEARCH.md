# Phase 21: Taxonomy 与身份归一 - Research

**Researched:** 2026-07-19
**Domain:** canonical identity、taxonomy migration、publication invalidation
**Confidence:** HIGH

## Summary

Phase 21 不缺新的外网研究，而是缺一条可审计、可回滚的身份迁移路径。109 项是处理矩阵，不是新增页数；原矩阵已经包含 alias、split 与 identity-gate，且基线固定为 P0/P1/P2/P3 = 13/54/40/2。[VERIFIED: codebase/.planning/research/V1.2-MODEL-COVERAGE.md:18-34,208-220] 最新八品牌官网差额已经进入单独的补充研究，包含 Capless/Decimo、1911 Standard/Large、Waterman 混合页、Parker 51 与 M800 重复项；它们必须作为 `out_of_matrix_actions` 单列，不能静默改变 109 的分母。[VERIFIED: codebase/.planning/research/V1.2-OFFICIAL-COVERAGE-GAPS-2026-07-18.md:52-74,108-130,238-241,273-304]

实现前有两个 blocker：其一，现有 alias 只有文本、语言和 registry 级来源，无法表达 regional/historic/licensed、市场与有效期；旧 URL 又只存在于手写 TypeScript map，不能从迁移账本验证完整性。[VERIFIED: codebase/migrations/011_library_schema.sql:83-91; codebase/src/lib/entity-redirects.ts:77-96] 其二，publication v2 的 canonical payload 和 invalidation 只覆盖 `made_by` 关系，没有覆盖 alias、tag 和其他 taxonomy relation；因此一次 taxonomy 编辑可能不改变 hash，也不会撤销旧审核。[VERIFIED: codebase/src/lib/publication.ts:168-367,571-588; codebase/migrations/031_evidence_readiness_v2.sql:246-345,1926-1959]

**Primary recommendation:** 先用一个 schema migration 补齐 taxonomy ledger/alias/redirect/variant contract 与 publication invalidation，再由一个 checked-in 109-row manifest 驱动单事务迁移；任何受影响 entity 都退回 draft/in_review，禁止继承旧 review 或自动 republish。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| 109 项决策账本与净动作计算 | Offline TypeScript | SQLite | manifest 是可 review 的输入，DB 只保存批次与 lineage 结果。 |
| canonical/alias/merge/split/retire | SQLite transaction | Offline TypeScript | FK、unique、immutability 与 publication trigger 都在 DB 层执行。[VERIFIED: codebase/migrations/004_links.sql:4-45; codebase/migrations/031_evidence_readiness_v2.sql:2325-2493] |
| 旧 URL redirect | Generated static artifact | SQLite ledger | middleware 与 entity page 当前同步读取静态 map；DB ledger 提供审计，生成文件供 Edge/runtime 使用。[VERIFIED: codebase/src/middleware.ts:79-79; codebase/src/lib/entity-redirects.ts:77-96] |
| hash/review/publication invalidation | SQLite + publication library | Frontend public readers | `public_entities` 是公开授权集合，`publishEntity` 是唯一 server publish path。[VERIFIED: codebase/migrations/031_evidence_readiness_v2.sql:1243-1279; codebase/src/lib/publication.ts:691-755] |
| 品牌页型号反向列表 | Frontend query | SQLite `made_by` | renderer 只从 public pen 的 `made_by` 关系生成品牌型号列表。[VERIFIED: codebase/src/lib/entity-page.ts:278-296] |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|---|---|---|
| TAX-01 | Asvine、MR/Cocoon、Elabo/Falcon 等归一并保留 alias | alias schema、identity case table、redirect contract |
| TAX-02 | Waterman、Opus 88、Leonardo 混合页拆分并迁移证据 | split 拓扑、逐表映射、旧 URL 决策 |
| TAX-03 | PGS family/variant，配色不重复建页 | variant hierarchy 最小扩展与 PGS mapping |
| TAX-04 | Aurora 泛称替换为 88/Optima | retire/split action 与 brand redirect |
| TAX-05 | SKB/Penton、Wing Sung/JunLai 未决时保持 draft | conflict + scoped relation + fail-closed publication |
| TAX-06 | 旧 URL、关系、标签、来源、媒体、引用无断链 | 完整 dependency topology 与 full audit |
| EXP-01 | 重算 109 项 create/merge/split/rename/alias/retire 净量 | immutable denominator 与集合差算法 |
| EXP-05 | 颜色/镀层/普通尖宽/地区限定默认 variant | entity-vs-variant decision rule |

这些 requirement 文本来自 Phase 21 的锁定范围。[VERIFIED: codebase/.planning/REQUIREMENTS.md:58-74; codebase/.planning/ROADMAP.md:245-256]
</phase_requirements>

## Standard Stack

### Core

| Library/Layer | Current Version | Use |
|---|---:|---|
| TypeScript + `tsx` | TS ^5 / tsx ^4.22.3 | manifest validation、planning/report CLI |
| `@libsql/client` | ^0.17.3 | bounded write transaction 与 SQLite contract |
| Next.js | 15.5.18 | generated redirect map 与 canonical route |

全部已经在仓库中，不安装新 package。[VERIFIED: codebase/package.json:74-106] migration 必须继续由 `migrateDatabase` 按文件顺序、checksum 和单文件事务管理，不能由 taxonomy script 自建 migrations 表或重写已应用 SQL。[VERIFIED: codebase/src/lib/db.ts:349-426]

## Package Legitimacy Audit

不适用：本阶段不新增外部 package。

## Architecture Patterns

### Recommended project structure

```text
migrations/032_taxonomy_identity.sql       # schema, triggers, publication contract
data/taxonomy/v1.2-phase21.json            # reviewed 109-row manifest + addendum
scripts/apply-taxonomy-v1.2.ts             # dry-run and one bounded write transaction
scripts/check-taxonomy-contract.ts         # fixture/full disposable-copy verifier
src/generated/entity-redirects.ts          # generated runtime redirect map
tests/e2e/taxonomy.spec.ts                 # route and public-surface regression
```

### Two blocking contract changes

#### Blocker 1 — Identity substrate 不足

Migration 032 应一次完成以下最小 schema：

1. `entity_aliases` 增加 `alias_kind`（`regional_name|historic_name|former_mark|search_only|misspelling`）、`market`、`valid_from`、`valid_to`、`source_item_id`、`review_status`；保留现有 stable ID，并增加 ID immutability trigger。现有表只有 `alias/language/source_id`，而 `source_id` 指向 source registry，不是具体 source item。[VERIFIED: codebase/migrations/011_library_schema.sql:83-91]
2. 新增 `taxonomy_batches`、`taxonomy_actions`、`entity_lineage`、`entity_redirects`。action 必须保存 `batch_id/source_row_key/action_kind/source_entity_id/target_entity_id/decision_source/checksum`；lineage 支持一对一 merge/rename 与一对多 split；redirect 以 `(old_type, old_slug)` 唯一，并指向 canonical entity 或明确的 fallback path。
3. 由 ledger 生成 `src/generated/entity-redirects.ts`，`src/lib/entity-redirects.ts` 只组合该文件与 article reclassification。原因是 middleware 当前使用同步静态函数，不能把 Edge redirect 改成每请求查数据库。[VERIFIED: codebase/src/lib/entity-redirects.ts:64-96; codebase/src/middleware.ts:79-79]
4. `model_variants` 增加 `variant_kind`（`edition_group|color|material|nib_option|market_sku`）、`parent_variant_id`、`product_code`、`market`。现表是 flat list，只有名称、年份、note、source item，无法表达 PGS 的 edition group → color variant。[VERIFIED: codebase/migrations/011_library_schema.sql:252-264]

不要新增 public `family` page type。Phase 21 用 `model_specs.series_name` 表示系列，以一个 canonical pen page 表示 PGS Slim，并用 hierarchical variants 表示四季织/配色；现有 entity type 也没有 `family`。[VERIFIED: codebase/migrations/002_schema.sql:3-5; codebase/migrations/011_library_schema.sql:231-264]

#### Blocker 2 — Taxonomy 变化没有完整进入 publication hash

Migration 032 与 `readPublicationContentPayload` 必须同步纳入：reviewed aliases、entity tags、用户可见 taxonomy links（至少 `made_by`、`member_of_series`、`marketed_under_licensed_brand`）以及新增 variant hierarchy 字段。现 payload 明确读取 entity、published story、spec、variant、claim/citation、scope/evidence/conflict、reference/source、approved timeline、qualified primary media 和 `made_by`，没有 aliases/tags/其他 link query。[VERIFIED: codebase/src/lib/publication.ts:168-367,571-588]

同时为 aliases、entity_tags 和上述 link types 增加 insert/update/delete invalidation。现有 trigger family 对 entity link 只处理 `made_by`；content revision 变化会撤销所有 approved reviews，published snapshot 也不能在保持 published 时被改写。[VERIFIED: codebase/migrations/031_evidence_readiness_v2.sql:1926-1959,2451-2493]

**强制行为：** taxonomy batch 后，每个 survivor/new output/受影响 brand 的 `content_revision` 至少变化一次、状态不得为 `published`、旧 `fact/language/media/publication` approvals 均为 revoked；必须重新计算 hash、重新独立 review，再通过 `publishEntity` 发布。[VERIFIED: codebase/migrations/031_evidence_readiness_v2.sql:2451-2462; codebase/src/lib/publication.ts:610-688,691-755]

## 109-Row Manifest and Net-Action Algorithm

### Canonical source

manifest 只从 coverage 文档的七个地理表抽取 109 rows；“P0 数据结构与身份问题”是重复摘要，不再导入。[VERIFIED: codebase/.planning/research/V1.2-MODEL-COVERAGE.md:63-205,208-220] 固定 preflight totals：

| Dimension | Expected |
|---|---:|
| priority | P0 13 / P1 54 / P2 40 / P3 2 |
| status | A 1 / BM 42 / BM-A 1 / G-M 1 / M 55 / S 5 / S-M 4 |
| total | 109 |

status totals 是对原表 109 行的全量解析结果。[VERIFIED: codebase/.planning/research/V1.2-MODEL-COVERAGE.md:63-205]

每行至少包含：`source_row_key`、原始标题/地区/priority/status、`input_entity_ids`、`atomic_actions[]`、`output_entity_ids`、`aliases[]`、`redirects[]`、`evidence_refs[]`、`publication_disposition`。`source_row_key` 使用稳定的 `region + normalized item name`，并对整行 canonical JSON 存 checksum；运行时不靠模糊 slug/name 选择 survivor。现有 `entityIdentityKey` 只是字符压缩去重，会把语义决策退化为文本相似度，不能用于自动 merge/split。[VERIFIED: codebase/src/lib/entity-identity.ts:7-44]

最新官网差额写入同一 manifest 的 `out_of_matrix_actions[]`，保留其来源与优先级，但 `matrix_total` 始终还是 109。[VERIFIED: codebase/.planning/research/V1.2-OFFICIAL-COVERAGE-GAPS-2026-07-18.md:52-74,108-130,238-241,273-304]

### Counting semantics

所有计数都对 stable entity ID/alias tuple 做 `Set` 去重，不按 matrix row 数计数：

```ts
// Proposed reconciliation; IDs come only from the reviewed manifest.
const netCanonicalDelta = activeCanonicalAfter.size - activeCanonicalBefore.size;
const reconciledDelta =
  createIds.size +
  splitNewOutputIds.size -
  mergeDonorIds.size -
  splitRemovedSourceIds.size -
  retireWithoutSuccessorIds.size;
assert.equal(netCanonicalDelta, reconciledDelta);
```

| Metric | Exact unit | Effect on net delta |
|---|---|---:|
| create | new canonical ID caused by a missing matrix item | +1 |
| merge | distinct donor ID mapped to exactly one survivor | -1 |
| split | distinct source ID mapped to 2+ outputs | report event only |
| split new outputs | newly allocated output IDs | +1 each |
| split removed source | source ID not retained as an output | -1 |
| rename | surviving ID whose canonical name or slug changes | 0 |
| alias | distinct `(target, normalized alias, language, kind, market, validity)` inserted | 0 |
| retire | active ID removed without successor | -1 |

报告同时输出 brand/pen 两个 delta、109 内 action counts、out-of-matrix action counts、总 canonical delta；三者必须能集合差复算。一个 row 可以产生多个 atomic actions，所以 `109 != sum(actions) != net new pages`。[VERIFIED: codebase/.planning/REQUIREMENTS.md:69-69]

## Transaction Protocol

### Preflight — transaction 外、只读

1. 校验 manifest schema/checksum、109 totals/status totals、out-of-matrix 分区、所有 action 的 source/target cardinality。
2. 校验输入 ID 与预期 slug/type 一致、target slug/redirect 唯一、alias normalization 无 collision、每个 split payload row 都有明确 destination。
3. 计算 dependency closure：source/survivor/output entities、其 canonical brands、所有 inbound/outbound links、polymorphic citations 与 exhibit JSON references。
4. 只从 Phase 19 checkpoint 创建 caller-owned disposable copy，再 migrate 到最新 schema；不得 SQLite-open protected source。[VERIFIED: codebase/src/lib/audit/read-only-catalog.ts:549-618; codebase/.planning/phases/19-real-audit-evidence/19-VERIFICATION.md:141-146]
5. dry-run 产出 action plan、before counts、expected after counts 和所有阻断；任何 unmapped row、ambiguous split、unexpected slug/ID 都 fail closed。

### One bounded write transaction — no retry

1. 插入 `taxonomy_batches(status='applying')`，拒绝已成功应用的 checksum。
2. 创建 split/create outputs，分配永久新 ID，全部 `draft`；先不公开。
3. 更新 survivor 的 canonical name/slug；在旧 slug 消失前写 redirect + lineage。永远不 UPDATE semantic payload primary key，因为 v2 对 entity/story/spec/variant/claim/citation/source/media/link/evidence 等 ID 有 immutability triggers。[VERIFIED: codebase/migrations/031_evidence_readiness_v2.sql:2325-2448]
4. 按下节 topology 迁移 dependencies；每个 conflict 由 manifest 决策或 `fact_conflicts(status='open')` 表达，禁止 last-write-wins。
5. 只重建 forward `entity_links`，让现有 trigger 生成 `reverse`；先去除 merge 后 self-link，再按 `(source,target,type)` 去重。[VERIFIED: codebase/migrations/004_links.sql:4-45]
6. donor/split source 设置 `entity_publications.status='retired'`；survivor/new output/affected brand 保持 `draft|in_review`。不复制 `entity_content_reviews` 或 approved hash。
7. 在 transaction 内执行 FK/uniqueness/lineage/redirect/publication assertions；写 batch counts 与 `status='applied'` 后 commit。任一步失败 rollback，不 retry；现 publication path 同样坚持 bounded transaction/no retry。[VERIFIED: codebase/src/lib/publication.ts:591-597,691-707]

### Dependency migration topology

| Order | Tables/content | Merge/rename | Split |
|---:|---|---|---|
| 1 | `entity_aliases`, `external_ids`, `entity_attributes`, `entity_tags` | insert-on-conflict/dedupe 到 survivor；保留 provenance | 每行必须映射到一个 output；地区 alias 可带 scope，不能复制到所有 outputs |
| 2 | `stories` | 只保留一个符合 type 的 published story；其余改 draft/deprecated 或人工合并 | 按段落/主题分配或重写；不得把混合正文复制两份；renderer 要求 exactly one published story。[VERIFIED: codebase/src/lib/entity-page.ts:629-629] |
| 3 | `model_specs` | target 唯一；逐 field merge，冲突进 `fact_conflicts` | 每个 output 新建 spec ID；不能共享一条 spec。`entity_id` 有 UNIQUE。[VERIFIED: codebase/migrations/011_library_schema.sql:231-250] |
| 4 | `model_variants`, `fact_scopes` | collision-free 时改 owner；collision 时保留/clone 并 remap scope | 按 variant identity 分配；shared market/time context 可 clone 为新 IDs |
| 5 | `claims` | 同时迁移 `subject_entity_id` 与 inbound `object_entity_id`；不改 claim ID | 按事实适用对象 clone 新 claim ID；含混 claim 留 source retired 或变 pending，禁止双投 |
| 6 | `citations` | moved target 的 ID 未变则无需改；entity target 改 survivor | `target_id` 是 polymorphic TEXT、无 FK，必须按 story/spec/claim/entity mapping 手工 retarget/clone。[VERIFIED: codebase/migrations/011_library_schema.sql:129-150] |
| 7 | `spec_field_evidence`, `claim_evidence`, `fact_conflicts`, members | 使用 spec/claim/citation/scope mapping 重连 | 所有四类 mapping 完整后插入；不得悬空或跨 output 串证据。[VERIFIED: codebase/migrations/031_evidence_readiness_v2.sql:86-179] |
| 8 | `entity_references`, `timeline_events`, `media_assets`, `diagrams`, `community_summaries` | dedupe 后迁移 owner | 逐条分类；media 只能给证据支持的 output，caption/logo provenance 不改写。[VERIFIED: codebase/migrations/011_library_schema.sql:152-177,200-229,266-312] |
| 9 | exhibit sections / JSON slug references | patch old slug to canonical route | ambiguous split 指向 brand/disambiguation destination；全量 JSON scan |
| 10 | `entity_links` | survivor 替换两端，去 self/duplicate | 每个 output 恢复且只恢复正确 links；每个 pen 最终 exactly one canonical `made_by` brand。[VERIFIED: codebase/src/lib/entity-page.ts:278-296] |
| 11 | redirects, lineage, publications/reviews | old path → survivor；donor retired | old mixed path 使用下述 deterministic rule；outputs draft，旧 approvals 不迁移 |

`INSERT OR REPLACE` 禁用：它可能先 DELETE 再 INSERT，破坏 FK、reverse-link 和 immutable IDs。使用显式 `INSERT ... ON CONFLICT DO NOTHING/UPDATE`，并逐冲突记录选择理由。既有 migration 012 只迁移部分 approved media 与 aliases，不能当作 Phase 21 的完整拓扑模板。[VERIFIED: codebase/migrations/012_public_identity_cleanup.sql:205-238]

### Deterministic old-URL rule for split

- 若原 source ID 被明确保留为某一个 output，且 manifest 证明 story/spec/claim/media 的 canonical payload 都属于该 output，则旧 URL permanent redirect 到该 output。
- 否则 source ID retired，旧 mixed URL redirect 到已能列出全部 outputs 的 canonical brand page，并记录 `redirect_reason='split_disambiguation'`；不得凭名称顺序随便挑一个型号。
- brand page 只有在 outputs 重新发布后才会列出它们，因为 renderer 过滤 `public_entities`；这保证迁移阶段不会暴露空壳。[VERIFIED: codebase/src/lib/entity-page.ts:278-296; codebase/migrations/031_evidence_readiness_v2.sql:1243-1279]

## Identity Action Matrix

| Case | Required canonical action | Publication disposition |
|---|---|---|
| Pilot MR / Metropolitan / Cocoon / 88G | 一个 canonical model；四个地区名是 scoped aliases/SKU variants。删除“贵妃”alias；FP-60R 卡利贵妃独立。旧错误 slug 仍 redirect，但 redirect 不等于 alias。[VERIFIED: codebase/.planning/phases/21-taxonomy/21-IDENTITY-RESEARCH.md:47-96] | survivor/output re-review；错误 identity conflict 关闭时写 resolution note |
| Pilot Elabo / Falcon | 一个 canonical model；Elabo/Falcon 是市场名；树脂/金属、FE-18SR/FE-25SR 为 variants；Custom FA nib 仅为 nib relation，不能 merge。[VERIFIED: codebase/.planning/phases/21-taxonomy/21-IDENTITY-RESEARCH.md:101-140] | draft/in_review，按 market scope 重审 |
| Moonman / Majohn + A1 | Majohn canonical brand；Moonman `former_mark/historic_alias`；A1 一个 model，clip/clipless/color/nib 为 variants。历史图片 logo/caption 不改。[VERIFIED: codebase/.planning/phases/21-taxonomy/21-IDENTITY-RESEARCH.md:145-187] | brand、A1、受影响 model 全部重新 hash/review |
| Wing Sung / JunLai 630 | 禁止全局 brand merge；630 单一 identity，但 `marketed_under_licensed_brand` 必须有 series/time scope。因证据冲突，保持 draft；2028 是 review boundary，不是自动真值。[VERIFIED: codebase/.planning/phases/21-taxonomy/21-IDENTITY-RESEARCH.md:191-233; codebase/.planning/REQUIREMENTS.md:64-64] | draft + open identity conflict；不得 publish |
| Sailor Pro Gear Slim / SHIKIORI | PGS Slim 一个 model；`Professional Gear` 放 `series_name`；四季织 11-1224 为 `edition_group`，普通颜色为 child variants；Slim 21 等机制/规格差异明显者保留 sibling model。[VERIFIED: codebase/.planning/phases/21-taxonomy/21-IDENTITY-RESEARCH.md:237-310] | family/model/variant payload 全部重审 |
| Asvine P36 | 一个 Asvine P36 model；现有“意斯华”做 rename/alias，不新建第二个 P36；nib unit/width 是 options/variants。[VERIFIED: codebase/.planning/phases/21-taxonomy/21-IDENTITY-RESEARCH.md:312-348] | existing ID 优先保留，rename 后 re-review |
| Waterman Charleston / Hémisphère | 拆成现行 Hémisphère 与历史 Charleston；先做 row-level payload mapping，再按 deterministic URL rule 选择 retained ID/fallback。[VERIFIED: codebase/.planning/REQUIREMENTS.md:61-61; codebase/.planning/research/V1.2-OFFICIAL-COVERAGE-GAPS-2026-07-18.md:226-241] | 两页分别 draft；禁止复制混合正文 |
| Sailor Pro Gear duplicates | 明确选择一个 survivor，其他 donor merge/retire；redirect/alias 指向 survivor。选择写进 manifest，不能依赖 slug heuristic。[VERIFIED: codebase/.planning/research/V1.2-OFFICIAL-COVERAGE-GAPS-2026-07-18.md:108-130] | survivor re-review，donors retired |
| Sailor 1911 / Profit | mixed record 拆为 1911 Standard 与 1911 Large；Profit 作为有市场范围的 alias，不保留笼统 mixed model page。[VERIFIED: codebase/.planning/research/V1.2-OFFICIAL-COVERAGE-GAPS-2026-07-18.md:108-125] | outputs draft；旧 mixed URL → brand unless one continuity winner is proven |
| Opus 88 / Leonardo / Aurora | Demo/Koloro、Furore/Momento Magico 各自 split；Aurora 泛称 pen retire，88/Optima 建真实 model。所有旧 mixed URL 使用同一 split rule。[VERIFIED: codebase/.planning/REQUIREMENTS.md:61-64] | outputs draft，generic/mixed donors retired |

## Rollback and Raw-305 Protection

当前 305-row artifact 是 Phase 19 对 `69 brands + 236 pens` 的 checked-in snapshot，且当时 305/305 都是 draft、blocked、not public；它是 Phase 21 preflight 的 inventory evidence，不是允许直接写 protected catalog 的授权。[VERIFIED: codebase/.planning/phases/19-real-audit-evidence/19-VERIFICATION.md:31-35,61-66]

- **事务前/事务内失败：** rollback 当前 write transaction；batch 不得留下 `applied` marker。
- **disposable copy commit 后发现差错：** 删除 agent-owned disposable copy，重新从同一 snapshot/checksum checkpoint copy 并重放；不要写“反向 SQL”去猜复杂 split。
- **真实/远程环境：** Phase 21 不执行。远程 Turso、deployment 和 production full gate 在 Phase 26，且要求 local/remote migration 与 data contract 全绿后才部署。[VERIFIED: codebase/.planning/ROADMAP.md:326-341]
- **迁移文件：** 已应用 SQL checksum 不得改；修复只能新增 forward migration。`migrateDatabase` 会拒绝 checksum mismatch。[VERIFIED: codebase/src/lib/db.ts:411-427]

## Validation Architecture

nyquist validation 与 security enforcement 都已开启。[VERIFIED: codebase/.planning/config.json:15-42]

### Test Framework

| Property | Value |
|---|---|
| Framework | TypeScript contract scripts + disposable SQLite + Playwright |
| Existing config | `package.json`, `playwright.config.ts` |
| Quick run | `pnpm exec tsx scripts/check-taxonomy-contract.ts --fixture` |
| Full phase gate | `pnpm exec tsx scripts/check-taxonomy-contract.ts --all && pnpm check:evidence-contract -- --all && pnpm check:public-boundary -- --all && pnpm exec tsc --noEmit` |

现有 Phase 19 已用相同的 disposable SQLite/contract/Playwright 架构验证 migration、hash、rollback、full inventory 与 public boundary。[VERIFIED: codebase/.planning/phases/19-real-audit-evidence/19-VALIDATION.md:15-55]

### Requirements → Tests

| Req | Automated assertion |
|---|---|
| TAX-01 | 每个 alias 唯一命中一个 canonical ID；Cocoon aliases 中无 贵妃/FP-60R；Elabo/Falcon、P36、Moonman/Majohn resolve 正确 |
| TAX-02/06 | synthetic merge/split fixture 覆盖 topology 每一张表；old paths 100% resolve；`foreign_key_check` 空；polymorphic citation/exhibit scan 零 orphan |
| TAX-03/EXP-05 | PGS edition/color hierarchy；颜色/镀层/尖宽不会生成 pen entity；明显机制/尺寸差异 fixture 会生成 sibling model |
| TAX-04/05 | Aurora generic 不在 active canonical set；Wing Sung/JunLai 与其他 unresolved identity 都是 draft 且不进任何 public surface |
| EXP-01 | manifest exact 109、priority/status totals、ID-set action counts、delta reconciliation、out-of-matrix 隔离 |

### Full-catalog gate — exhaustive, not sampled

1. 在 checkpointed disposable copy 应用 migration + manifest 两次：第一次成功，第二次必须 deterministic no-op；before/after source fingerprint 不变。
2. 对全部 affected dependency closure 跑 FK、unique、self-link、reverse-link、alias collision、one-made-by、story/spec cardinality、polymorphic target 和 exhibit slug checks。
3. 对 manifest 全部旧 URL 逐条执行 redirect resolution，检测 loop、chain、404 和 draft target；最终 redirect 最多一跳到 canonical/fallback。
4. 验证所有 affected IDs 在 fresh review 前都不属于 `public_entities`；对一个 isolated positive fixture 完成新 hash 的 fact/language/media review 后调用 `publishEntity`，证明 republish path，而不是批量自动批准。
5. 重新生成 full inventory 与 taxonomy report，断言 109 rows、out-of-matrix rows、action sets、brand/model before-after sets 与 net delta 全部相等。
6. 跑 brand page contract：每个 published brand 的 published models 与 `made_by` reverse set 完全相等；每个 published pen exactly one public canonical brand。[VERIFIED: codebase/src/lib/entity-page.ts:278-296]

### Wave 0 Gaps

- [ ] `migrations/032_taxonomy_identity.sql` — 两个 blocker 的 schema/hash/invalidation contract
- [ ] `data/taxonomy/v1.2-phase21.json` — 109 rows + `out_of_matrix_actions`
- [ ] `scripts/apply-taxonomy-v1.2.ts` — preflight/dry-run/single transaction/no retry
- [ ] `scripts/check-taxonomy-contract.ts` — fixture + full disposable-copy audit
- [ ] `src/generated/entity-redirects.ts` — ledger-derived runtime redirect artifact
- [ ] `tests/e2e/taxonomy.spec.ts` — canonical/old URL/brand↔model/draft 404 paths

## Common Pitfalls

| Pitfall | Detection / prevention |
|---|---|
| 把 109 当新增页数 | exact denominator + ID-set reconciliation；row/action/net 三列分开 |
| 只改 slug/name | dependency closure 必须覆盖 story/spec/claim/citation/evidence/source/media/tags/links/reviews/publications |
| split 时复制整份正文/证据 | manifest 要求每个 payload row 一个 destination；ambiguous row blocks transaction |
| merge 时更新 primary key | immutability trigger 应让 fixture 失败；保留 survivor ID、移动 FK 或 clone 新 payload ID |
| 直接迁移 reverse links | 只插 forward links，让 trigger 生成 reverse；检查 self/duplicate |
| alias/tag 改了但 review 仍 current | hash payload/invalidation fixture 对每种 taxonomy mutation 验证 old review revoked |
| donor reviews 继承到 survivor | full audit 断言 old review IDs/hash 不被复制，fresh publish 前 affected set 全非公开 |
| 打开 raw305 SQLite | 只使用 checkpointed copy helper；source main/WAL/SHM fingerprint 前后一致 |

## Don't Hand-Roll

| Problem | Don't build | Use instead |
|---|---|---|
| identity decision | slug/name fuzzy auto-merge | reviewed manifest + official identity research |
| migration runner | script-owned migrations table/transaction retry | canonical `migrateDatabase` + one bounded taxonomy transaction |
| public eligibility | ad-hoc `status='published'` query | sole `public_entities` authorization view |
| publication | direct SQL status flip / copied reviews | `recordEntityContentReview` + `publishEntity` |
| reverse graph | manually clone reverse rows | existing forward-link triggers |

## Code Examples

```ts
// Proposed execution shell: validation before transaction, no retry wrapper.
const plan = validateAndResolveManifest(manifest, inventorySnapshot);
if (plan.blockers.length > 0) throw new Error(formatBlockers(plan.blockers));

const tx = await db.transaction("write");
try {
  await applyResolvedTaxonomyPlan(tx, plan);
  await assertTaxonomyPostconditions(tx, plan);
  await tx.commit();
} catch (error) {
  await tx.rollback();
  throw error;
}
```

`publishEntity` 已采用同样的 one write transaction / catch rollback / no retry 边界，taxonomy executor 应复用这个控制流，不复用其 publication 权限。[VERIFIED: codebase/src/lib/publication.ts:691-707]

## Runtime State Inventory

| Category | Items Found | Action Required |
|---|---|---|
| Stored data | SQLite entity graph, evidence, lifecycle and committed 305-row audit artifact | migrate only disposable copy in Phase 21; preserve snapshot/checksum and emit before/after sets.[VERIFIED: codebase/.planning/phases/19-real-audit-evidence/19-VERIFICATION.md:31-35] |
| Live service config | Remote Turso/Vercel are Phase 26, not Phase 21 | no remote command, credential or deployment mutation.[VERIFIED: codebase/.planning/ROADMAP.md:326-341] |
| OS-registered state | None declared by project scripts/config | no action; taxonomy execution stays process-local.[VERIFIED: codebase/package.json:5-72] |
| Secrets/env vars | No new secret required; remote DB env is out of scope | never select `--remote`; keep all credentials environment-only. |
| Build artifacts | generated redirect TypeScript and taxonomy reports | regenerate from manifest/ledger, diff-check, then test middleware/page resolution. |

## Security Domain

| ASVS Category | Applies | Control |
|---|---|---|
| V2 Authentication | no | no admin/user auth change in this phase |
| V3 Session Management | no | no session state |
| V4 Access Control | yes | only `public_entities` may authorize public brand/pen reads.[VERIFIED: codebase/migrations/031_evidence_readiness_v2.sql:1243-1279] |
| V5 Validation | yes | manifest schema/checksum, parameterized SQL, strict ID/slug/action enums, fail-closed unmapped rows |
| V6 Cryptography | yes | reuse Node `createHash('sha256')` and existing `sha256:v2` stable payload; do not design custom crypto.[VERIFIED: codebase/src/lib/publication.ts:581-588] |

Threats to test: manifest tampering/replay, redirect open-path injection/loop, SQL injection through alias/slug, confused-deputy global brand merge, stale published authorization, path escape/symlink/hardlink against protected catalog, and ambiguous rollback.

## Project Constraints (from AGENTS.md)

- 规划在本机、执行在远程，因此 every task must include exact files, commands, assertions and rollback.[VERIFIED: codebase/AGENTS.md:10-15]
- 内容优先；new canonical output remains draft until evidence/content/media/review gate passes.[VERIFIED: codebase/AGENTS.md:12-15]
- 标签保持细颗粒度；market/time/variant scopes 不应粗暴折叠。[VERIFIED: codebase/AGENTS.md:12-15]
- 不做 destructive file deletion/force push；敏感凭据只从环境读取。[VERIFIED: session AGENTS.md instructions]

## Assumptions Log

| # | Claim | Risk if Wrong |
|---|---|---|
| — | None. Identity conclusions use the checked-in research; implementation decisions above are explicit recommendations. | — |

## Open Questions

没有需要继续外网扩搜的 phase-level question。每个 mixed source 的 continuity winner 必须由 execution preflight 对 story/spec/claim/media 做逐行 mapping 决定；没有完整 mapping 就阻断该 action，而不是阻断其他独立 rows。

## Environment Availability

| Dependency | Available | Version | Fallback |
|---|---:|---:|---|
| Node.js | ✓ | v22.13.1 | — |
| pnpm | ✓ | 11.5.2 | — |
| git | ✓ | 2.42.0 | — |

版本由本机命令在 2026-07-19 验证。[VERIFIED: local commands `node --version`, `pnpm --version`, `git --version`]

## Sources

### Primary — HIGH confidence

- `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md` — Phase 21 scope and acceptance contract.
- `.planning/phases/21-taxonomy/21-IDENTITY-RESEARCH.md` — six reviewed identity decisions and evidence boundary.
- `.planning/research/V1.2-MODEL-COVERAGE.md` — immutable 109-row denominator.
- `.planning/research/V1.2-OFFICIAL-COVERAGE-GAPS-2026-07-18.md` — official-source addendum and extra split/merge gaps.
- `migrations/004`, `011`, `031`; `src/lib/publication.ts`, `entity-page.ts`, `entity-redirects.ts`, `audit/read-only-catalog.ts` — live schema/runtime contracts.
- `.planning/phases/19-real-audit-evidence/19-VALIDATION.md` and `19-VERIFICATION.md` — protected-source and full-audit boundaries.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — live package/migration code inspected.
- Architecture: HIGH — recommendations map directly to current FK, trigger, hash and public-reader contracts.
- Identity decisions: HIGH for checked-in high-confidence cases; Wing Sung/JunLai remains deliberately draft at MEDIUM evidence confidence.
- Pitfalls/validation: HIGH — derived from current immutability, publication and protected-copy behavior.

**Research date:** 2026-07-19
**Valid until:** 2026-08-18 or any change to migration 031/publication v2, whichever comes first.
