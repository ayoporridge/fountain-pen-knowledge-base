# Phase 18: 统一发布门禁 - Pattern Map

**Mapped:** 2026-07-15
**Scope:** publication schema/transition、migration ownership、runtime public gate、全部公开 surface、独立 parity 与 browser regression
**Files classified:** 42 个预期新增/修改路径（按职责分组）
**Core analog coverage:** 7 个可复用模式；4 个关键能力无现成 analog

## 结论先行

Phase 18 不需要发明新的工程框架。仓库已经有四块应直接复用的骨架：

1. `src/lib/db.ts::migrateDatabase()` 的**单 migration 写事务 + checksum + rollback**；
2. `src/lib/db.ts::assertDatabaseReady()` / `createReadinessGuard()` 的**只读、fail-closed schema guard**；
3. `src/lib/public-visibility.ts::publicEntityFilter(alias)` 的**alias 校验 + 单一 SQL helper**；
4. `scripts/check-migration-safety.ts` 与 `tests/e2e/site-quality.spec.ts` 的**临时数据库 fixture、全量批处理、汇总失败后一次退出**。

但不能复用旧 predicate 的业务内容、现有 cache TTL、现有 coverage score 或现有 boundary oracle。它们正是本阶段要替换的失真点。仓库目前也没有 SQLite view migration、canonical content hash、publication transaction、`revalidatePath`/`revalidateTag` purge 或独立 surface-set oracle 的现成实现；这些部分应按 `18-RESEARCH.md` 契约新增最小实现。

## File Classification

| New/Modified File(s) | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `migrations/030_publication_gate.sql` | migration/schema | batch DDL + backfill + trigger invalidation | `migrations/011_library_schema.sql`; `004_links.sql`; `006_fts.sql` | role-match；无 view analog |
| `src/lib/db.ts` | service/guard | request preflight + explicit write transaction | 同文件 `migrateDatabase()`, `assertDatabaseReady()`, `createReadinessGuard()` | exact |
| 10 个 import script | batch importer | guard → write | 目标模式为 `assertDatabaseReady(client)`；当前 `runMigrations()` 是反模式 | partial |
| `scripts/seed.ts`, `seed-tags.ts`, `seed-concepts.ts`, `seed-library-samples.ts` | seed entry point | migrate → seed | `scripts/migrate.ts` 调用 canonical runner | role-match |
| 新 publication/hash/transition helper（planner 决定放入 `src/lib/publication.ts` 或邻近模块） | service/utility | deterministic transform + bounded transaction | `src/lib/db.ts` 的 SHA-256 与 write-transaction skeleton | partial；无 stable JSON analog |
| `src/lib/public-visibility.ts` | authorization utility | SQL predicate/request-response | 当前 `publicEntityFilter(alias)` | structural exact；predicate 必须重写 |
| detail/browse/sitemap/graph/API/discovery/library surfaces | route/service/component | request-response + read joins | 当前各 surface 的 `publicEntityFilter(alias)` 调用点 | role-match；需统一改为 view/helper |
| cache policy / publication invalidation | cache boundary | write → purge / request-response | 仅有固定 ISR/HTTP TTL；无 purge analog | none |
| `scripts/check-migration-safety.ts` | static + migration contract | file scan + isolated DB | 当前临时 migration fixture | exact skeleton |
| `scripts/check-publication-gate.ts` | DB contract test | isolated fixture matrix | `scripts/check-migration-safety.ts`; `check-library-contract.ts` | role-match |
| `scripts/check-public-boundary.ts` | independent parity audit | full-set compare | 当前 failures 聚合结构 | structural match；oracle 必须重写 |
| `tests/e2e/publication-gate.spec.ts`, `site-quality.spec.ts` | browser/API regression | request-response + full traversal | `site-quality.spec.ts` 全 sitemap 批处理和 API allowlist tests | role-match |
| `package.json` | config | command routing | existing `check:*` scripts | exact |

### Importer ownership scope

以下 10 个 importer 当前各自拥有 false-apply runner，必须改为“创建 client → `assertDatabaseReady(client)` → 写入”，不得调用 migration runner：

- `scripts/import-brand-completion-sources.ts`
- `scripts/import-exhibit-content.ts`
- `scripts/import-model-gap-sources.ts`
- `scripts/import-official-brand-sources.ts`
- `scripts/import-official-brand-stories.ts`
- `scripts/import-official-model-diagrams.ts`
- `scripts/import-official-model-sources.ts`
- `scripts/import-research-gap-sources.ts`
- `scripts/import-warm-pen-atlas-media.ts`
- `scripts/import-wikidata-brands.ts`

四个 seed entry point 应调用 `migrateDatabase(client)`，而不是自行读 SQL/写 marker：`scripts/seed.ts`、`scripts/seed-tags.ts`、`scripts/seed-concepts.ts`、`scripts/seed-library-samples.ts`。

此外，`scripts/import-csv.ts` 与 `scripts/import-markdown.ts` 也会自行读取并拆分 migration SQL；ownership guard 必须禁止这些旁路。`seed-library-samples.ts` 同时具有 false-apply 和 seed 两种角色，所以完整风险清单是 11 个 false-apply script，而不是 10 个独立 importer。

## Pattern Assignments

### 1. Canonical migration runner 与 publication write transaction

**Primary analog:** `src/lib/db.ts:123-228`

应直接复用的约束：

- migration 文件按文件名排序（`migrationFiles()`，123-132）；
- SHA-256 checksum（144-146）；
- 每个 migration 在 `db.transaction("write")` 内执行 SQL 和 marker（185-220）；
- 任意失败 rollback，且不对 write 自动 retry（221-224）；
- 已应用 SQL 被改写时硬失败（196-207）。

**Transaction skeleton** (`src/lib/db.ts:185-224`):

```ts
const transaction = await db.transaction("write");
try {
  await transaction.executeMultiple(removeOuterTransaction(sql));
  await transaction.execute({
    sql: "INSERT INTO migrations (name, applied_at, checksum) VALUES (?, datetime('now'), ?)",
    args: [file, checksum],
  });
  await transaction.commit();
} catch (error) {
  await rollbackQuietly(transaction);
  throw new Error(`Migration failed: ${file}`, { cause: error });
}
```

**Apply to Plan 01:**

- `030` 只写普通 DDL、indexes、row triggers 和小规模 `INSERT OR IGNORE ... SELECT` backfill；不要在 migration 文件中包 outer `BEGIN/COMMIT`。
- publish transition 复用同一个 bounded transaction/rollback 结构，但不能复用 migration marker 逻辑，也不能经过 `retryTransientDatabaseRead()`。
- `migrations/011_library_schema.sql:5-51,105-127,180-199,231-264` 是 enum `CHECK`、FK、default、index 的最近 schema 样板。
- `migrations/004_links.sql:18-46` 是 `BEFORE/AFTER INSERT/DELETE` + `RAISE(ABORT)` 的 row-trigger 样板；`migrations/006_fts.sql:19-34` 是 INSERT/UPDATE/DELETE 三态同步 trigger 样板。
- `migrations/023_retire_template_stories.sql:1-7` 明确保留并 deprecated 旧 story；`030` 不得反向更新这些 rows。

**Do not copy:** embedded runners。代表性错误位于 `scripts/import-official-model-sources.ts:2209-2251`：当 `entities` 已存在时，它直接把未执行的 migration 写入 marker。`scripts/seed-library-samples.ts:30-73` 复制了同一模式；`scripts/seed.ts:17-36` 则是 checksum-free、SQL 与 marker 非原子的另一套 runner。

### 2. Readiness guard：扩展现有 guard，不另造启动路径

**Primary analog:** `src/lib/db.ts:69-82,230-282`

`createReadinessGuard()` 已经具备正确的并发语义：并发调用共享一个 pending promise；检查失败会清空 promise，允许下次重新检查；成功后在进程内缓存结果。

```ts
if (!pending) {
  pending = check().catch((error) => {
    pending = null;
    throw error;
  });
}
return pending;
```

`assertDatabaseReady()` 已经只读检查 marker 与 checksum，缺 schema 或 pending migration 时 fail closed（`src/lib/db.ts:234-277`）。Plan 01 应在这个函数中继续增加 `sqlite_schema` critical-object 检查，而不是新增一个旁路 readiness 函数。

**Schema-object analogs:**

- `scripts/check-library-contract.ts:3-42`：常量列出 required tables → 读 schema → 算 missing set → 非零退出；
- `scripts/check-data-contract.ts:39-45`：读取建表 SQL并核对 constraint 内容。

实现时把查询改为契约要求的 `sqlite_schema`，并同时核对 table/view/index/trigger 的 `type + name`。至少覆盖 `entity_publications`、`publication_blockers`、`public_entity_readiness`、`public_entities` 和 `030` 的关键 indexes/triggers；marker 完整但对象缺失必须失败。

**Retry boundary:** `databaseReady` 在 `src/lib/db.ts:280-282` 仅把只读 readiness 查询放入 `retryTransientDatabaseRead()`；`execute()` 在 356-363 没有 retry。保持这个边界：migration、import write、publication transition 都不自动 retry。

### 3. Alias-safe canonical public filter

**Primary analog:** `src/lib/public-visibility.ts:73-105`

保留 alias validation 和 SQL-fragment API；替换 predicate 内容：

```ts
export function publicEntityFilter(alias = "e"): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(alias)) {
    throw new Error(`Invalid entity SQL alias: ${alias}`);
  }
  // Phase 18: EXISTS against public_entities for this alias.
}
```

**Apply to Plan 02:**

- `publicEntityFilter(alias)` 应变成 alias-safe `EXISTS` against `public_entities`；所有 list/join 查询继续传内部常量 alias。
- 增加 `getPublicEntityBySlug(type, slug)`（或等价 direct-view helper），让 metadata、detail 与 public entity API 直接从同一 view 获取，而不是 raw `entities` + JS 判断。
- `PUBLIC_ENTITY_FILTER_SQL` (`src/lib/public-visibility.ts:104-105`) 已标记 deprecated；`src/app/page.tsx:77-145` 与 `src/app/sitemap.ts:63-87` 仍在使用，应迁移为显式 alias helper。
- `isPublicEntity()` (`src/lib/public-visibility.ts:107-142`) 只能保留 non-brand/pen compatibility 或 redirect 辅助；不得授权 raw brand/pen row。

`public_entities` view 自身负责三分支兼容规则：brand/pen 严格 publication gate；没有 publication row 的非 brand/pen 保留旧 predicate；任何显式有 publication row 的类型走严格 gate。不要把这三分支复制进 TypeScript surface。

### 4. Canonical redirect 先于 publication 404

**Primary analog:** `src/app/[type]/[slug]/page.tsx:56-85,317-339`

当前 metadata 与 page 都先调用 `getCanonicalEntityPath(type, slug)`，命中后 `permanentRedirect()`；之后才查询实体和执行 404。这一顺序符合 Phase 18：legacy identity 仍可 redirect，但 canonical target 若未发布会由目标 route 404。

Plan 02 只需把后半段从 raw query + `isPublicEntity()` 改成 canonical public lookup：

- 当前 metadata raw lookup：`page.tsx:65-80`；
- 当前 detail raw `SELECT *` + JS gate：`page.tsx:323-333`；
- related aliases：`page.tsx:353-376`；
- pen parent brand alias：`page.tsx:445-459`。

metadata 与 detail 必须调用同一 lookup。unpublished fixture 不应生成 canonical、Open Graph 或 JSON-LD；当前 JSON-LD 生成点在 `page.tsx:543-628`，只有通过 canonical lookup 后才可到达。

### 5. Public API allowlist 与 stable public identity

**Strong analogs:**

- `src/app/api/entities/route.ts:8-39`：GET 明确 `SELECT type, slug, name, summary`，再映射 DTO；
- `src/app/api/entities/[slug]/route.ts:8-33`：detail GET 返回固定四键；
- `src/app/api/links/route.ts:7-20`：`PUBLIC_LINK_SELECT` 只暴露 `type/slug/name/link_type/reason`，public graph 不暴露 database id；
- `src/lib/browse-data.ts:32-50,318-349`：public interface 与最终 mapping 明确排除 query 内部字段。

```ts
return NextResponse.json({
  type: entity.type,
  slug: entity.slug,
  name: entity.name,
  summary: cleanPublicText(entity.summary),
});
```

**Apply to Plan 02/03:**

- public GET 可以在 SQL 内部读取 `id` 做 join，但 response DTO 不得 spread raw row。
- 新增 publication 列一律不加入 public DTO：至少阻止 `entity_id`、`status`、`depth_tier`、`quality_score`、`blockers_json`、`approved_content_hash`、`content_revision`、`reviewed_content_revision`、`reviewed_contract_version`、reviewer/timestamps/notes。
- protected POST/PUT 目前可返回 internal data；不要把其 `SELECT *` 模式复制到 public GET。
- `tests/e2e/site-quality.spec.ts:427-483` 已对 entity 与 browse payload 做 exact-key allowlist；扩展该测试，同时增加 publication 字段 denylist。links API 同样断言无 source/target database ids。

### 6. Isolated migration fixture 与 cleanup

**Primary analog:** `scripts/check-migration-safety.ts:7-116`

现有 fixture 已提供 Plan 01/03 所需的大部分壳：

- `mkdtempSync()` + 独立 migrations dir + file database（8-22）；
- 首次 apply、第二次 idempotent（25-35）；
- checksum drift rejection（37-54）；
- migration 中途失败后 marker 与前序 write 均 rollback（56-83）；
- pending migration 被 readiness guard 拒绝（85-95）；
- 全量 fresh replay + `foreign_key_check`（97-110）；
- `finally` 关闭 client、删除 temp root（108-116）。

**Apply to Plan 01:** extend `check-migration-safety.ts` with migration-writer ownership scan，白名单只允许 `src/lib/db.ts` 与 dedicated migration test fixtures 写 `migrations` table。该 guard 必须扫描全量 source files，不执行 importer SQL。

**Apply to Plan 01/03:** new `scripts/check-publication-gate.ts` 复用相同 temp-root lifecycle，但使用 synthetic entities，不修改 `data/fpkg.db`。覆盖 empty replay、current-local-copy upgrade、second run、`quick_check`、`foreign_key_check`、schema objects、draft backfill、deprecated story invariance、illegal writes、critical INSERT/UPDATE/DELETE invalidation、non-brand/pen bidirectional `EXCEPT`。

仓库没有“复制 current DB 后 upgrade”或 publication fixture analog；这一段按 validation matrix 新增，不要改写真实 catalog rows。

### 7. Failure aggregation 与全量 traversal

**Script analog:** `scripts/check-public-boundary.ts:31-38,285-298`

脚本先累计所有 `failures`，最后逐条打印并一次 `process.exit(1)`，适合 parity audit；`scripts/check-library-contract.ts:44-45,263-276` 使用相同模式。不要遇到第一条 surface mismatch 就停止，否则无法看到全集差异。

**Browser analog:** `tests/e2e/site-quality.spec.ts:901-1022,1234-1291`

- 从 sitemap 构造完整 URL/path 集合；
- 以 `AUDIT_BATCH_SIZE` 分批并发；
- 收集所有失败；
- `finally` 关闭并发 pages；
- 最后 `expect(failures).toEqual([])`。

Plan 03 应复用 traversal/aggregation 结构，但不能复用当前数量 KPI：`site-quality.spec.ts:911` 的 `> 500` 和 1290 的 `>= 550` 必须改成 exact set equality。

## Complete Surface Anchor Map

Plan 02 必须逐个处理以下 alias；“主实体被 gate”不代表 neighbor/owner/parent 自动安全。

| Surface | Current anchor | Required Phase 18 change |
|---|---|---|
| metadata + detail | `src/app/[type]/[slug]/page.tsx:56-130,317-460` | canonical lookup；related entity 与 parent brand 也 gate |
| browse rows/count/facets/type counts | `src/lib/browse-data.ts:118-350` | 四组查询统一 view；保留 explicit DTO |
| browse API cache | `src/app/api/browse/route.ts:4-10` | canonical data helper；处理 stale cache |
| sitemap | `src/app/sitemap.ts:63-100` | dynamic rows只来自 view；parity test 不接受 catch 掩盖错误 |
| graph page | `src/app/graph/page.tsx:30-58` | hubs、selected、degree/neighbor aliases 全 gate |
| links API | `src/app/api/links/route.ts:21-119` | center、source、target、neighbor、second-hop 全 gate |
| entities list/detail/preview APIs | `src/app/api/entities/route.ts:8-39`; `[slug]/route.ts:8-33`; `preview/route.ts:5-55` | direct public lookup；preview tags保持 allowlist |
| recommendations | `src/lib/recommend.ts:63-174` | current entity 也 gate；direct/model/tag candidate 全 gate |
| homepage | `src/app/page.tsx:77-145` | stats、featured、per-type stars 改用 alias helper/view |
| by dimension | `src/app/by/[dimension]/page.tsx:70-126` | brands、pens、counts 中每个 alias gate |
| concept cache | `src/lib/concept-engine.ts:14-116` | recompute 只缓存 public pen + public concept；read 时再次 gate |
| wiki links | `src/components/MarkdownRenderer.tsx:10-21` | resolve only canonical public entity |
| representative models | `src/lib/library.ts:387-403` | candidate pen from view；caller brand 也必须已 public |
| source indexes | `src/lib/library.ts:555-660` | citation usage 必须追溯并 gate owning entity；当前第二个 UNION 未 gate owner |
| media index/primary media | `src/lib/library.ts:663-704` | owner-aware public gate；不能只检查 media policy |
| featured brands / exhibit links | `src/lib/library.ts:916-993` | featured、related entity paths 统一 view；section JSON 中的 slug 解析后 gate |
| image proxy | `src/app/api/image-proxy/route.ts:21-91` | media id 查询 join owner public set；retired/unpublished owner 404 |
| middleware | `src/middleware.ts:8-25,59-96` | 只保留 namespace/工具屏蔽；brand/pen publication 不再由 path blacklist 授权 |

### Explicit private exception

`src/lib/library.ts::getLibraryCoverageReport()` (`860-914`) 故意扫描 raw `brand`/`pen` backlog。它不是 public helper，不能改成 `public_entities`；应保持不可由 public route 触达，并在命名/包装上明确 private/admin。其 raw-row score (`764-823`) 也不能用作 publication authorization。

## Cache / Revalidation Pattern Map

仓库没有可复用的 active invalidation pattern：全仓搜索不到 `revalidatePath`、`revalidateTag` 或 `unstable_cache` 调用。当前只有 TTL：

- detail、home、browse page、by、graph 等：`export const revalidate = 600`，例如 `src/app/[type]/[slug]/page.tsx:1`；
- browse API：`s-maxage=600, stale-while-revalidate=3600` (`src/app/api/browse/route.ts:4-10`)；
- image proxy success：`s-maxage=2592000` (`src/app/api/image-proxy/route.ts:82-91`)；
- E2E 甚至要求 browse 可缓存 (`tests/e2e/site-quality.spec.ts:879-899`)。

这些是 Phase 18 的反模式，不是 analog。Plan 02 必须二选一并用测试固定：

1. 建立单一 publication/content-revision write path，并在 commit 成功后 purge detail + 全部 discovery surfaces；或
2. 在统一 purge 尚未完成前，将所有 entity-bearing response 改为 conservative cache policy。

无论哪种方案，publication transaction rollback 时不得 purge；成功后必须证明 critical edit 或 retire 后 fixture 立即从 detail、browse、sitemap、graph/API 消失，而不是等待 TTL。owner-aware image access 也必须纳入该证明。

## Anti-Patterns to Remove or Contain

| Anti-pattern | Anchor | Why it fails Phase 18 |
|---|---|---|
| importer 自写 migration marker | `import-official-model-sources.ts:2209-2251` 及 10 个同类 runner | SQL 未执行也可能标记 applied；无 checksum/atomicity |
| seed 独立 migration runner | `seed.ts:17-36`, `seed-tags.ts`, `seed-concepts.ts`, `seed-library-samples.ts:30-73` | 多 migration owner；行为分叉 |
| raw entity + JS authorization | `page.tsx:65-80,323-333`; `public-visibility.ts:107-142` | metadata/detail 与 SQL surfaces 可漂移；brand/pen fail open |
| 手工 slug 双真相 | `public-visibility.ts:9-61`; `middleware.ts:8-25` | publication 状态/hash/readiness 改变时名单不会同步 |
| hard-coded alias constant | `PUBLIC_ENTITY_FILTER_SQL`; `sitemap.ts:3,69`; `app/page.tsx:19` | join alias 易错；无法统一多个 alias |
| boundary oracle 复用 runtime predicate | `check-public-boundary.ts:2-6,40-50` | expected 与 actual 同源，形成 tautology |
| 只数 raw rows/总分抵消 blocker | `audit-entity-quality.ts:52-63,85-115`; `library.ts:764-914` | deprecated/pending/needs_source 也计完成；非 publication truth |
| public owner 未 gate | `library.ts:555-684`; `image-proxy/route.ts:32-48` | source/media 可从 unpublished owner 间接泄漏 |
| 固定 TTL/SWR | 上述 cache anchors | edit/retire 后旧页面仍公开 |
| hard-coded real catalog fixture | `site-quality.spec.ts:36-90,427-483` | 当前 DB 内容变化即失真；研究明确禁止把 Pilot/LAMY 当 permanent publication fixture |
| sitemap 数量 KPI | `site-quality.spec.ts:911,1290` | 奖励页面数量，不能证明集合相等 |
| sitemap catch-all fallback | `src/app/sitemap.ts:97-100` | DB/gate 错误可能被静默降级；full parity 应暴露失败 |

## No Analog Found

| Needed capability | Search result | Planner guidance |
|---|---|---|
| SQLite `public_entity_readiness` / `public_entities` views | `migrations/` 中无 `CREATE VIEW` / `DROP VIEW` | 按 research 给出的 plain SQLite/Turso-compatible DDL 新增；显式列名，勿 `SELECT *` 暴露 internals |
| canonical JSON + `sha256:v1:` content hash | 只有 `db.ts:144-146` 的 raw SQL checksum | 可复用 `node:crypto`；新建固定 keys、显式 null、稳定 array sort 的 serializer，并用 deterministic fixture 固定 |
| publish transition service | 只有 migration transaction skeleton | 新建 bounded write transaction；read inputs → hash/review → readiness → published → assert view → commit |
| active cache purge | 无 `revalidatePath`/`revalidateTag`/tagged cache | 计划必须显式创建，或选择 conservative no-stale policy；不能默认 TTL 足够 |
| independent public-universe parity oracle | 当前 checker 导入 runtime helper | expected side 用独立 contract SQL/fixture，actual side 调各 surface；禁止共享 authorization predicate |

## Guidance for the Four Plans

### Plan 01 — Migration ownership and isolated fixtures

严格顺序：

1. 删除全部 embedded runner，write mode 前直接 `assertDatabaseReady(client)`；四个 seed entry point 改调 `migrateDatabase(client)`；CSV/Markdown importer 不再执行 migration。
2. 扩展 `check-migration-safety.ts` 的静态 ownership guard，并先证明 missing `030` 时 importer 失败且不会写 marker。
3. 让 `src/lib/db.ts` 与 Playwright 支持 server-only 的隔离数据库路径，不修改 `data/fpkg.db`。
4. 先建 `check-publication-gate.ts` 的临时库生命周期与 synthetic fixture 壳，供后续计划共享。

### Plan 02 — `030` publication contract

1. 扩展 `assertDatabaseReady()` 的版本感知 critical `sqlite_schema` object check。
2. 新增 `030_publication_gate.sql`：tables/checks/indexes/views/state-machine/invalidation/publish-guard triggers + brand/pen draft backfill；不 publish、不改 deprecated story。
3. 新增 canonical hash 与 bounded server-only publish transaction；所有 write 失败 rollback、无 retry，direct SQL 不能绕过。
4. 用 isolated DB 覆盖 replay/upgrade/idempotency/constraints/invalidation/publish 与 type transition。

避免把 publication `status='published'` 与 hash freshness 写成阻止内容更新的 table-level CHECK；内容更新必须成功，然后因 revision mismatch 立即退出 view。

### Plan 03 — Runtime gate and every public surface

1. 先完成 `publicEntityFilter(alias)` → `EXISTS(public_entities)` 和 direct public lookup。
2. 按上面的 Surface Anchor Map 逐文件替换；每个 query 审计所有 entity aliases，不只主表。
3. metadata/detail 保持 redirect-first，之后 direct public lookup；unpublished 一律 404 且无 indexable metadata。
4. public API 保持 explicit projections/exact DTO；增加 publication internals leak guard。
5. source/media/exhibit/wiki/concept cache 等间接链接也必须 owner-aware gate。
6. 明确保留 `getLibraryCoverageReport()` 为 private backlog helper。
7. 将所有 entity-bearing page/API 统一改为 dynamic/no-store；离线写入存在时不采用无法可靠触发的 purge。

### Plan 04 — Independent parity and browser regression

1. `check-publication-gate.ts` 使用 synthetic valid brand/pen + missing/draft/in-review/retired/stale/hash/contract/blocker fixtures；Montblanc 149 作为 deliberate draft/no-content regression，不 publish 真实 catalog row。
2. `check-public-boundary.ts` expected side 独立读取 `public_entities`/contract SQL：完整列表双向相等、detail/metadata 逐 ID 等价、聚合值等价、graph/recommend/library discovery 只允许 public 子集。
3. `publication-gate.spec.ts` 验证 404、各入口缺席、valid fixture 全 surface 同现、critical edit/retire 立即消失、metadata/JSON-LD 不泄漏、API allowlist。
4. 复用 sitemap 批处理和 failure aggregation，但删除 `>500`/`>=550` 数量断言。
5. 最终按 `18-VALIDATION.md` 顺序运行 migration safety → data/publication contracts → public boundary → library → lint/build → desktop/mobile；Phase 18 不运行 remote migration 或 production deploy。

## Metadata

**Analog search scope:** `src/lib`, `src/app`, `src/components`, `scripts`, `tests/e2e`, `migrations`, `package.json`
**Strong analogs read:** `src/lib/db.ts`, `src/lib/public-visibility.ts`, `src/lib/browse-data.ts`, public API routes, `src/lib/library.ts`, `scripts/check-migration-safety.ts`, `scripts/check-public-boundary.ts`, `scripts/check-library-contract.ts`, `tests/e2e/site-quality.spec.ts`, representative migrations/importers/seeds
**Pattern extraction date:** 2026-07-15
