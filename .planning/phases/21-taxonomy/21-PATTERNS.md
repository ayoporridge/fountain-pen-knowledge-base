# Phase 21: Taxonomy 与身份归一 - Pattern Map

**Mapped:** 2026-07-19
**Files analyzed:** 10 likely new/modified files plus deterministic artifacts
**Analogs found:** 8 / 10（operation ledger 与 ambiguous split redirect 无现成 analog）

## Scope Decision

Phase 21 应只做身份与引用迁移，不提前承担 Phase 22–25 的外网内容补全：

1. 用一个追加 migration 完成 alias、rename、merge、split、retire、variant/family 归位；不改写 migration 001–031。
2. 保留 canonical entity 的稳定 `id`；旧实体行保留作研究记录，并把其 `entity_publications.status` 置为 `retired`。所有新 split entity 使用新 ID，禁止改主键。
3. `entity_aliases` 只表达别名，不负责旧 URL。既有旧路由继续用 `src/lib/entity-redirects.ts` 的显式永久 redirect map。
4. 迁移所有拥有者引用后再 retire 源实体；默认不 hard delete。split 时按事实归属逐条 move/clone，不能把旧 payload 整体复制到两个新实体。
5. taxonomy migration 不自动发布。任何受影响实体先 fail closed，迁移后重新计算 current hash、重新 review，再由既有 publication transaction 发布。
6. 只在受管临时 SQLite/libSQL fixture 上验收 migration；不得运行 Phase 19 真实 catalog 流程，也不得把自动化边界负面 case 扩成 Phase 21 的主任务。
7. 审计全量输出 operation ledger、109 项覆盖矩阵和 before/after canonical inventory；CLI 的 `--limit` 只能限制终端展示，不能限制审计或 artifact。

## Locked Identity Semantics

| Situation | Canonical action | What must not happen |
|---|---|---|
| Pilot MR / Metropolitan / Cocoon / 88G | one family/model identity plus regional aliases/variants | 将 Cocoon 继续显示成“贵妃”或生成多个同义型号页 |
| Pilot Elabo / Falcon | one canonical model plus regional alias | 两个页面各自保留一套事实 |
| Moonman / Majohn A1 | Majohn A1 canonical; Moonman is historical brand alias/provenance | 把历史品牌名当成第二个当前型号 |
| JunLai 630 / Wing Sung | keep brands distinct; encode only the evidenced scoped licence relationship | global brand merge or two `made_by` canonical brands |
| Sailor PGS / SHIKIORI | family → model → edition/color variant | 每个颜色或限定配色建独立型号页 |
| Mixed model pages | split only when mechanism, nib system, dimensions, positioning or buying decision differs | 为凑数量拆页，或把同一旧事实无差别复制给所有 children |
| Disputed identity | remain `draft` with evidence | 在证据不足时挂错 brand 或进入 `public_entities` |

## File Classification

| New/Modified File | Action | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|---|
| `migrations/032_taxonomy_identity_normalization.sql` | create | migration/model | batch transform + event-driven invalidation | `migrations/012_public_identity_cleanup.sql`; `migrations/021_public_specs_and_relations.sql` | exact role + flow |
| `src/lib/entity-redirects.ts` | modify | utility/router contract | request-response | existing `CANONICAL_ENTITY_PATHS` in same file | exact |
| `src/lib/taxonomy/identity-plan.ts` | create | model/config | deterministic transform | coverage matrix + explicit lists in publication/audit fixtures | partial; no operation-ledger analog |
| `src/lib/audit/taxonomy-audit.ts` | create | service/utility | full-set batch transform | `src/lib/audit/readiness-audit.ts` | role/data-flow match |
| `scripts/audit-taxonomy.ts` | create | controller/CLI | batch + file I/O | `scripts/audit-readiness-v2.ts` | exact role + flow |
| `scripts/lib/taxonomy-fixture.ts` | create | test fixture | disposable DB CRUD + migration | `scripts/lib/renderer-fixture.ts` | exact role + flow |
| `tests/taxonomy/taxonomy-migration.test.ts` | create | test | batch CRUD + referential-integrity assertions | `scripts/check-migration-safety.ts`; `tests/renderer/entity-page.test.ts` | role/data-flow composite |
| `tests/taxonomy/taxonomy-redirects.test.ts` | create | test | request-response | redirect assertions in `scripts/check-public-boundary.ts` | role-match |
| `package.json` | modify | config | command routing | existing `audit:*` and `check:*` entries | exact |
| `.planning/phases/21-taxonomy/artifacts/*.{ndjson,csv,json}` | generate | audit artifact | deterministic file I/O | Phase 19 readiness artifacts | role-match |

`identity-plan.ts` is the recommended single checked-in manifest for operation type, old identity, canonical target(s), redirect decision and 109-matrix row. The SQL remains the mutation surface; the migration test must prove every manifest row reached the declared after-state. Do not add an admin/runtime ledger table unless a later product requirement needs one.

## Reference-only / Forbidden Files

| File or path | Reuse | Why it must not be modified in Phase 21 |
|---|---|---|
| `migrations/001_*.sql` … `migrations/031_evidence_readiness_v2.sql` | schema, trigger and migration analogs | Applied migration checksums are immutable; Phase 21 is migration 032 only. |
| `data/fpkg.db`, `data/fpkg.db-wal`, `data/fpkg.db-shm` | none | Protected real catalog. Planning and tests use owned temporary fixtures only. |
| `.planning/phases/19-real-audit-evidence/artifacts/*` | historical format analog | Frozen Phase 19 evidence; Phase 21 inventory has different counts and must emit new artifacts. |
| `scripts/lib/phase19-fixtures.ts` and Phase 19 wrappers | safety ideas only | Do not run or extend the real-catalog copy/lock workflow for taxonomy unit acceptance. |
| `src/lib/publication.ts` | hash/publish semantics | Taxonomy must satisfy the existing v2 contract, not weaken or special-case it. |
| `src/lib/entity-page.ts`, `scripts/lib/renderer-fixture.ts`, `tests/renderer/*` | reverse-model and fixture analogs | Analog-only; create Phase 21-owned tests to avoid interfering with renderer work. |
| `src/lib/entity-identity.ts` | none | `entityIdentityKey()` is only a display-list dedupe heuristic (`22-45`), not a canonical merge engine or persistent identity registry. |

## Pattern Assignments

### `migrations/032_taxonomy_identity_normalization.sql` — identity and reference migration

**Primary analog:** `migrations/012_public_identity_cleanup.sql`.

Preserve the canonical row ID while renaming identity fields:

```sql
-- migrations/012_public_identity_cleanup.sql:5-15
UPDATE entities
SET slug = 'parker-duofold-centennial-big-red',
    name = 'Parker Duofold Centennial Big Red',
    ...
WHERE id = 'pen-parker-duofold-centennial-big-red';
```

Copy set-valued references idempotently before retiring a duplicate:

```sql
-- migrations/012_public_identity_cleanup.sql:112-147
INSERT OR IGNORE INTO entity_tags (entity_id, tag_id)
SELECT 'canonical-id', tag_id
FROM entity_tags
WHERE entity_id = 'duplicate-id';
```

Retain only compatible facts. Migration 012 first removes specs/variants/attributes/tags from wrongly typed records (`19-81`), then selectively copies approved tags, source references, source-owned media and aliases (`112-238`). Phase 21 must apply the same evidence-by-evidence discipline; a merge is not `UPDATE every child SET entity_id = target`.

**`made_by` and reverse-edge analog:** `migrations/021_public_specs_and_relations.sql`.

```sql
-- migrations/021_public_specs_and_relations.sql:120-154 (shape abridged)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, description)
SELECT ..., pen.id, brand.id, 'made_by', ...
FROM ...;

DELETE FROM entity_links
WHERE link_type = 'brand_model' OR ...;
```

After deleting/repointing links, explicitly restore reverse rows as migration 021 does at `165-178`. `entity_links` has insert/delete reverse triggers (`migrations/004_links.sql:17-46`), but deleting a forward row can remove a shared reverse row during a batch. Final invariants are:

- forward brand relation is `pen --made_by--> brand`;
- every canonical public pen has exactly one direct public canonical brand;
- every non-`reverse` edge has `rev-${forward_id}` with swapped endpoints;
- license/provenance relations are not additional `made_by` brands.

#### Required mutation order

1. Resolve stable source/target IDs from the checked-in identity plan; abort if actual type/slug differs from the expected before-state.
2. Set all affected existing publication rows to `draft`/`in_review`; set publication rows being removed from use to `retired`. Do this before changing children so old ownership is still visible to invalidation views. The `entities` table itself has no lifecycle column.
3. Insert new split/canonical entities and their `entity_publications` rows as `draft`. Never inherit `published` or an old review/hash.
4. Rename stable canonical rows in place. Add aliases and redirect declarations separately.
5. Move or clone stories/specs/variants/claims/citations/evidence/media/tags/references according to an explicit per-child assignment. New clones receive new immutable IDs.
6. Rebuild canonical `made_by` edges, delete obsolete forward edges, then restore/check reverse rows.
7. Keep merge-source rows and their historical evidence as `retired`; do not hard-delete merely to remove duplicate public pages.
8. End with `PRAGMA foreign_key_check`, semantic orphan checks for polymorphic/JSON references, operation-plan parity, and zero unintended `public_entities` membership.

#### Rename / alias / merge / split / retire rules

| Operation | Entity row | Payload/reference handling | Route handling |
|---|---|---|---|
| `rename` | keep ID; update canonical slug/name | same owner IDs remain, but embedded slugs must be rewritten | old path → new canonical path |
| `alias` | no new entity | insert alias metadata; no payload duplication | redirect only if the alias was previously a public route |
| `merge` | keep target and source entity IDs; mark source publication retired | copy/move only compatible rows; source publication row stays retired | every old source path → target canonical path |
| `split` | keep old row retired; create one ID per stable child | assign each fact/media/source to the correct child; clone only facts supported for multiple children | old mixed path is ambiguous; no automatic redirect without an explicit chosen landing target |
| `retire` | keep entity row; set publication status retired | preserve provenance/history; remove from canonical relations | redirect only when a true successor exists; otherwise hard 404 |
| `variant` | keep one pen entity; add `model_variants`/family relation | evidence attaches to variant scope where appropriate | no model route per ordinary color/nib width |

### Complete entity-reference migration matrix

No entity-related foreign key declares `ON UPDATE`; SQLite therefore defaults to `NO ACTION`. Migration 031 additionally rejects primary-ID updates for entities and all publication payload IDs (`2325-2449`). **Never update an ID.** Repoint foreign-key columns, or insert a new child row and migrate its evidence graph.

| Reference | FK behavior on entity/source delete | Phase 21 explicit action | Main failure if omitted |
|---|---|---|---|
| `entity_attributes.entity_id` | `CASCADE` | copy compatible attributes, remove model-incompatible ones | hard delete destroys facts |
| `entity_tags.entity_id` | `CASCADE` | `INSERT OR IGNORE` compatible tags; remove obsolete identity tags | lost tags or inherited false taxonomy |
| `concept_matches.entity_id` | `CASCADE` | re-point only matches valid for canonical child | stale concept classification |
| `entity_links.source_id/target_id` | `CASCADE` | rebuild forward edge IDs and reverse pairs; enforce `made_by` direction | brand page omits models or model has multiple brands |
| `entity_aliases.entity_id` | `CASCADE`; `source_id SET NULL` | copy/dedupe alias language/source provenance | alias disappears or loses evidence |
| `external_ids.entity_id` | `CASCADE` | move only external IDs that truly identify target; reject uniqueness collisions | external identity points to wrong model |
| `source_items.source_id` | registry delete `CASCADE` | preserve shared registry/item IDs; do not delete sources during identity migration | every dependent source owner is deleted or nulled |
| `stories.entity_id` | `CASCADE` | move on rename/merge; clone with new story ID only for an independently authored split story | duplicate generic story or no page story |
| `model_specs.entity_id` | `CASCADE`; `brand_entity_id SET NULL` | move/clone spec and explicitly set canonical brand; migrate field evidence/citations | spec survives with null/wrong brand or evidence targets old spec |
| `model_variants.model_entity_id` | `CASCADE`; source item `SET NULL` | re-parent valid variants; dedupe ordinary colors/nibs; preserve source | variants vanish or become duplicate model pages |
| `claims.subject_entity_id` | `CASCADE`; `object_entity_id SET NULL`; source item `SET NULL` | update both subject and object roles; clone claim + `claim_evidence` for supported split children | referenced object silently becomes null; claim evidence remains on old claim |
| `citations.target_id` | **no FK, polymorphic text**; claim/source `SET NULL` | rewrite/clone by `target_type` after final entity/story/spec/claim IDs are known | silent dangling citation with green FK check |
| `media_assets.entity_id` | `SET NULL`; source item `SET NULL` | reassign only provenance-supported media; ambiguous images remain with retired source/draft | orphan media or wrong product image |
| `timeline_events.entity_id` | `CASCADE`; source item `SET NULL` | move only model-specific events; brand/history events remain on correct owner | false history or lost timeline |
| `community_summaries.entity_id` | `CASCADE` | normally keep draft/research; explicitly reassign if identity-specific | unreviewed summary copied as canonical fact |
| `entity_references.entity_id/source_item_id` | both `CASCADE` | copy/dedupe approved source ownership; source item itself remains shared | canonical page loses provenance |
| `fact_scopes.entity_id` | `CASCADE`; `variant_id SET NULL` | clone/move scope with its fact owner; point to final variant | evidence degrades from variant-specific to generic |
| `spec_field_evidence` | spec/citation/scope all `CASCADE` | rebuild after spec/citation/scope IDs settle | approved value becomes unsupported |
| `claim_evidence` | claim/citation/scope all `CASCADE` | rebuild after claim/citation/scope IDs settle | claim becomes unpublished blocker |
| `fact_conflicts.entity_id` | `CASCADE`; scope `SET NULL` | preserve conflict and membership on correct canonical entity | disputed identity appears falsely resolved |
| `fact_conflict_members` | conflict/citation `CASCADE` | copy membership only with its conflict/citations | conflict has no evidence |
| `entity_content_reviews.entity_id` | `CASCADE` | never move/reuse; old hash reviews are invalid | stale review blesses changed identity |
| `entity_publications.entity_id` | `CASCADE`, PK immutable | source stays retired; target/new child gets its own lifecycle row and fresh current hash | publication state/history is reassigned incorrectly |
| `diagrams.entity_id` | `SET NULL` | reassign owner deliberately and rewrite hotspots | diagram survives but points to old path |
| `diagrams.hotspots_json` | **no FK, JSON** | parse/validate/rewrite embedded linked entity paths | permanent broken in-page links |
| `exhibit_sections.related_entity_slugs_json` | **no FK, JSON** | parse/validate/rewrite old slugs; do not regex-replace raw JSON | exhibits link to retired/non-canonical route |

#### Source ownership rule

`source_registry` and `source_items` describe documents, not entity identity. Do not duplicate or rename a source item because an entity merged. Repoint/dedupe the owner edges (`entity_references`, claim/citation/media/timeline/variant links) while preserving source item IDs. For split facts, one source item may legitimately support multiple new claims/spec fields, but every new claim/citation/evidence row must have its own correct target and locator.

### Publication invalidation and current-hash contract

**Analog:** `src/lib/publication.ts` and migration 031.

The v2 canonical payload is assembled by `readPublicationContentPayload()` (`publication.ts:162-579`) and hashed at `581-589`. It includes entity content, the expected published story, specs, variants, claims, citations, scopes, evidence, conflicts, source ownership, approved timeline, strict primary media, and only `made_by` relations. Publish/review writes use one no-retry write transaction (`615-867`).

Migration 031 invalidates current content on entity/story/spec/variant/claim/citation/source/reference/timeline/media mutations and on `made_by` changes (`1340-1963`), then revokes reviews when revision changes (`2451-2462`). However:

- aliases, tags, external IDs and generic non-`made_by` links are not in the publication hash and have no automatic invalidation;
- `citations.target_id`, diagram hotspot paths and exhibit slug JSON are outside FK protection;
- changing `claims.object_entity_id` invalidates the claim's subject owner, not necessarily the referenced object entity;
- ownership views (`031...sql:368-473`) can no longer find the old owner if a parent is deleted/moved first;
- a published snapshot and its entity ID are immutable (`2464-2541`).

Therefore migration 032 must explicitly demote every affected existing entity **before** moving children, and it must not attempt to preserve or synthesize approval. After migration, the audit recomputes `computePublicationContentHash()` for targets and proves that only entities with a new approved review can return to `public_entities`.

### `src/lib/entity-redirects.ts` — old URL preservation

**Exact analog:** the two static maps already consumed by metadata, page and middleware.

```ts
// src/lib/entity-redirects.ts:77-96
const CANONICAL_ENTITY_PATHS: Readonly<Record<string, string>> = {
  "/pen/百乐-pilot-custom-823": "/pen/pilot-custom-823",
  ...
};

export function getCanonicalEntityPath(pathname: string) {
  return CANONICAL_ENTITY_PATHS[normalizeEntityPath(pathname)];
}
```

`src/middleware.ts:69-100` and `src/app/[type]/[slug]/page.tsx:190-203,437-446` already emit the permanent redirect before loading content. `src/lib/library.ts:370-377` canonicalizes embedded paths through the same helper.

Rules:

- add every historical route listed by `identity-plan.ts`, including encoded Chinese variants after normalization;
- target only one canonical `/brand|pen/{slug}` route and assert there are no redirect chains or loops;
- `entity_aliases` (`migrations/011_library_schema.sql:83-91`) has no slug/route/source-path field and is not read by route resolution; inserting an alias alone does **not** preserve a URL;
- merge/rename may 308 directly to one target; an old mixed page split into two models has no existing multi-target redirect analog, so the plan must name a deliberate landing target or keep a hard 404. Never silently choose a child in test code.

**Test analog:** `scripts/check-public-boundary.ts:667-688` proves legacy metadata redirects while an unpublished canonical target remains unavailable; `620-744` exercises metadata, page, middleware and sitemap in a disposable fixture.

### `src/lib/taxonomy/identity-plan.ts` — operation and coverage source of truth

There is no existing first-class operation ledger. Use a small typed manifest rather than inferring merge/split semantics from final row counts:

```ts
export type TaxonomyDecision = {
  matrixId: string;
  disposition: "create" | "merge" | "split" | "rename" | "alias" | "retire" | "variant" | "gated" | "defer";
  appliedInPhase21: boolean;
  before: readonly { id: string; type: "brand" | "pen"; slug: string }[];
  after: readonly { id: string; type: "brand" | "pen"; slug: string }[];
  redirect?: { from: string; to: string };
  publication?: "draft" | "retired";
};
```

Manifest requirements:

- exactly 109 unique matrix IDs, each with priority/status from `V1.2-MODEL-COVERAGE.md`;
- distinguish matrix items from net page deltas; `alias`, `variant`, `gated` and `defer` add zero Phase 21 canonical pages;
- include all P0/P1/P2/P3 rows, but mark future or evidence-insufficient rows `defer`/`gated` instead of pretending they were migrated;
- record old IDs/slugs as preconditions so migration drift fails visibly;
- keep external research URLs/evidence in the research document or source tables, not in route code.

### `src/lib/audit/taxonomy-audit.ts` and `scripts/audit-taxonomy.ts` — full-set proof

**Inventory analog:** `readRawInventory()` in `src/lib/audit/readiness-audit.ts:243-290` reads every raw brand/pen row, sorts deterministically and computes a snapshot hash. Reuse full-set semantics, not the Phase 19 locked 305-row baseline (`999-1093`), because Phase 21 intentionally changes identity inventory.

Audit all manifest operations and emit:

- exact 109-row coverage with no missing/duplicate matrix IDs;
- before/after raw identity sets, manifest-declared active canonical sets, and publication status sets;
- counts by disposition and a separate applied/deferred split;
- net canonical brand/pen/page delta derived from sets, not `109`;
- alias uniqueness and canonical owner;
- redirect target existence, no loop/chain, and old-route completeness;
- zero stale old IDs/slugs in FK, polymorphic or JSON reference surfaces;
- one direct public canonical `made_by` brand per public pen and complete brand reverse-model sets;
- `PRAGMA quick_check = ok`, zero `foreign_key_check`, zero missing reverse rows;
- affected source publication rows retired and affected target/new publication rows draft until fresh review.

**Serialization analog:** `src/lib/audit/readiness-audit.ts:1095-1186` provides deterministic NDJSON, stable CSV columns, formula-injection protection and quoting. `scripts/audit-readiness-v2.ts:267-305` writes temp files then atomically renames them; `535-584` computes artifacts from the complete result before applying console presentation limits.

Recommended artifacts:

```text
.planning/phases/21-taxonomy/artifacts/
├── taxonomy-operations.ndjson
├── taxonomy-coverage.csv
└── taxonomy-summary.json
```

### `scripts/lib/taxonomy-fixture.ts` and taxonomy tests — bounded acceptance

Copy renderer fixture safety, not the protected Phase 19 catalog workflow:

```ts
// scripts/lib/renderer-fixture.ts:138-158
if (env.RENDERER_FIXTURE !== "1") throw new Error(...);
if (env.TURSO_DATABASE_URL?.trim() || env.TURSO_AUTH_TOKEN?.trim()) throw new Error(...);
if (configuredPath === canonicalizePotentialPath(PROTECTED_CATALOG_PATH)) throw new Error(...);
```

Create an owned temp root, bind a local `file:` URL, run the canonical `migrateDatabase()` and clean only registered owned roots (`renderer-fixture.ts:185-232,686-702`). Use a Phase 21-specific env flag such as `TAXONOMY_FIXTURE=1`; never reuse `RENDERER_FIXTURE` as authority.

`migrateDatabase()` already sorts files, verifies checksums and wraps each migration plus its marker in one libSQL write transaction (`src/lib/db.ts:349-449`). `scripts/migrate.ts` is the sole production migration CLI. Do not create another runner and do not put `BEGIN/COMMIT` ownership in the test.

**Migration test analog:** `scripts/check-migration-safety.ts:236-343` proves first apply, idempotent replay, checksum drift rejection, rollback on failure, readiness and `foreign_key_check` on a fresh DB.

Required Phase 21 test cases:

1. one rename with old-route redirect and alias;
2. one merge with tags, approved reference, media, object claim and citation target migration;
3. one split whose two children receive different specs/claims/media and new child IDs;
4. one ordinary edition/color that remains a `model_variants` row;
5. one disputed identity that remains draft and absent from `public_entities`;
6. forward/reverse `made_by` reconstruction and exactly one canonical brand per public pen;
7. stale polymorphic citation and JSON-slug sentinels are all removed;
8. source reviews/hashes are not moved and changed targets cannot publish without fresh current-hash reviews;
9. second migration run is a no-op and audit artifacts are byte-for-byte deterministic;
10. hostile remote/real-catalog environment fails before a temp path or database write is created.

For renderer-level reverse-link assertions, copy the direct SQL oracle in `tests/renderer/entity-page.test.ts:76-100` and loader checks at `200-215`. Browser-wide proof already exists at `tests/e2e/publication-gate.spec.ts:647-720`; Phase 21 should add only focused redirect/taxonomy checks, not rerun or expand the entire publication negative-case matrix.

## Shared Patterns

### SQLite/libSQL transactions

- One new numbered migration, applied by `migrateDatabase()`.
- Bound parameters in runtime/tests; static IDs in deterministic migration SQL are acceptable only with exact before-state guards.
- `INSERT OR IGNORE` for set-valued copy, followed by exact cardinality assertions.
- No ID updates, no `writable_schema`, no disabled FK mode, no best-effort retry.
- `quick_check`, `foreign_key_check`, reverse-edge and polymorphic/JSON orphan checks are all required; FK green alone is insufficient.

### Error handling / fail closed

- Missing expected old identity, unexpected duplicate canonical target, redirect ambiguity or manifest drift aborts the transaction/test.
- New/split identities default draft.
- A failed migration receives no migration marker (`scripts/check-migration-safety.ts:290-317`).
- Audit reports every row and exits non-zero on any unresolved operation; it does not hide failures behind sample output.

### Public brand ↔ model completeness

`src/lib/entity-page.ts:278-297` reads brand models by reverse `made_by`; `decodeBrand()` requires at least one public model (`675-707`), while `decodeModel()` requires exactly one public canonical brand (`710-766`). Preserve this contract. The strongest exact-set analog is:

```sql
-- tests/renderer/entity-page.test.ts:79-96
FROM public_entities public_brand
JOIN entity_links relation
  ON relation.target_id = public_brand.id AND relation.link_type = 'made_by'
JOIN public_entities public_pen
  ON public_pen.id = relation.source_id AND public_pen.type = 'pen'
WHERE public_brand.id = ?
```

Do not introduce a separate brand-model join table or a UI-only list. Correct `made_by` data is the one source for brand detail links, model canonical brand, API and graph surfaces.

## No Analog Found / Planner Decision Required

| Concern | Existing gap | Required decision |
|---|---|---|
| First-class create/merge/split/rename/alias/retire ledger | No schema or typed manifest represents an identity operation | Use the proposed checked-in `identity-plan.ts`; test SQL outcome against it. Avoid adding a runtime table without a product need. |
| One old mixed URL after a true split | Static redirects accept exactly one target | Explicitly choose a disambiguation/landing target or retain hard 404; do not choose arbitrarily. |
| DB-backed alias/redirect resolution | `entity_aliases` is metadata only; middleware uses a static map | Keep finite Phase 21 redirect entries in `entity-redirects.ts`. A DB-backed redirect store is a separate architecture change. |
| Embedded JSON identity migration | No shared utility safely rewrites `hotspots_json` / related slug arrays | Add a narrow parse/validate/re-serialize helper inside the migration audit/test boundary; never raw substring-replace JSON. |

## Metadata

**Analog search scope:** `migrations/`, `src/lib/`, `src/app/`, `src/middleware.ts`, `scripts/`, `tests/`, Phase 12/19/20 planning artifacts
**Primary analogs:** migrations 012/021/031, entity redirects, publication hash/invalidation, readiness audit, migration safety, renderer fixture/tests
**Pattern extraction date:** 2026-07-19
