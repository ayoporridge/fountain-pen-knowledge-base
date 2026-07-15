# Phase 19: 真实审计与证据契约 - Pattern Map

**Mapped:** 2026-07-15  
**Files analyzed:** 16 likely new/modified files plus deterministic artifacts  
**Strong analog families:** 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `migrations/031_evidence_readiness_v2.sql` | migration/model | schema rebuild, derived views, event-driven invalidation | `migrations/030_publication_gate.sql`; table-copy mechanics in `migrations/008_fix_fk.sql` | exact role + flow |
| `src/lib/db.ts` | config/service | schema readiness, connection resolution | existing `PUBLICATION_SCHEMA_MANIFEST` and `assertDatabaseReady()` in same file | exact |
| `src/lib/publication.ts` | service | canonical transform + transactional CRUD | existing v1 payload/hash/publish flow in same file | exact |
| `src/lib/audit/read-only-catalog.ts` | adapter/utility | local read-only DB I/O | `scripts/check-article-content.ts`; resolver guard in `src/lib/db.ts` | partial; hardening is new |
| `src/lib/audit/readiness-audit.ts` | service/model | full-set batch query + deterministic transform | `scripts/check-public-boundary.ts` set helpers; `src/lib/publication.ts` canonical normalization | role-match |
| `scripts/audit-readiness-v2.ts` | controller/CLI | file I/O + batch report | `scripts/audit-public-media.ts` | role-match |
| `scripts/check-evidence-contract.ts` | test/controller | disposable CRUD fixtures | `scripts/check-publication-gate.ts` | exact |
| `scripts/check-audit-readiness.ts` | test/controller | fixture batch + artifact comparison | `scripts/check-publication-gate.ts`; `scripts/check-public-boundary.ts` | role-match |
| `scripts/check-publication-gate.ts` | test/controller | migration, invalidation, atomic publish fixtures | existing migration-full/invalidation matrix in same file | exact |
| `scripts/check-public-boundary.ts` | test/controller | request-response parity + set equality | existing `runIndependentAllParity()` in same file | exact |
| `scripts/audit-entity-quality.ts` | legacy CLI adapter | batch report | replace local raw-row logic with shared `readiness-audit` result; retain CLI shape | role-match |
| `scripts/audit-library-coverage.ts` | legacy CLI adapter | batch report | replace `getLibraryCoverageReport()` dependency with shared audit summary | role-match |
| `src/lib/library.ts` | service/query | read-only projection | existing `public_entities` query pattern; remove raw coverage scoring as release truth | role-match |
| `tests/e2e/publication-gate.spec.ts` | browser integration test | disposable request-response lifecycle | existing publication fixture lifecycle in same file | exact |
| `package.json` | config | command routing | existing `check:*`/`audit:*` scripts | exact |
| `.planning/phases/19-real-audit-evidence/artifacts/*.{ndjson,csv,json}` | generated audit artifacts | deterministic file I/O | JSON report writing in `scripts/audit-public-media.ts` | partial; NDJSON/CSV is new |

## Pattern Assignments

### `migrations/031_evidence_readiness_v2.sql` (migration/model, schema + event-driven)

**Primary analog:** `migrations/030_publication_gate.sql`

Copy the normalized lifecycle/check/index style, not the v1 eligibility details:

```sql
-- migrations/030_publication_gate.sql:5-42
CREATE TABLE IF NOT EXISTS entity_publications (
  entity_id TEXT PRIMARY KEY NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'in_review', 'published', 'retired')
  ),
  ...
);

CREATE INDEX IF NOT EXISTS idx_entity_publications_status
  ON entity_publications(status);
```

For the v2 hash CHECK, use a transaction-safe generalized table rebuild. The closest repository mechanics are:

```sql
-- migrations/008_fix_fk.sql:34-45
CREATE TABLE IF NOT EXISTS entity_links_new (...);
INSERT OR IGNORE INTO entity_links_new SELECT * FROM entity_links;
DROP TABLE IF EXISTS entity_links;
ALTER TABLE entity_links_new RENAME TO entity_links;
```

Phase 19 must improve this older analog in four ways: explicitly drop/recreate dependent publication views/triggers, copy columns by name, preserve foreign keys, and run the migration only on disposable databases. Do not edit migration 030 and do not use `writable_schema`.

Keep blocker truth normalized before aggregation:

```sql
-- migrations/030_publication_gate.sql:336-350
CREATE VIEW publication_blockers (...) AS
SELECT entity_id, contract_version, blocker_code, subject_type, subject_id
FROM publication_base_blockers
UNION ALL ...;
```

Create the research-prescribed objects with fail-closed defaults:

- `fact_scopes`
- `spec_field_evidence`
- `fact_conflicts`
- `fact_conflict_members`
- `entity_content_reviews`
- source tier/group/archive columns
- qualifying v2 views for stories, field evidence, source groups, conflicts and reviews

No new row may default to approved. Existing publication reviews remain v1/stale and must not be grandfathered into v2.

Invalidation must follow the current monotonic pattern:

```sql
-- migrations/030_publication_gate.sql:598-606
CREATE TRIGGER publication_model_spec_insert
AFTER INSERT ON model_specs
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.entity_id;
END;
```

Apply this to scope/evidence/conflict mutations. Review rows are different: they point to a hash and must not participate in that hash or increment `content_revision`; a revoked/deleted current review should affect readiness immediately and may demote a published lifecycle row without creating a hash-review loop.

---

### `src/lib/db.ts` (config/service, schema readiness)

**Analog:** the existing publication schema manifest.

```ts
// src/lib/db.ts:213-224
const PUBLICATION_SCHEMA_MANIFEST = [
  ["table", "entity_publications"],
  ["index", "idx_entity_publications_status"],
  ...
  ["view", "public_entity_readiness"],
  ["view", "public_entities"],
] as const;
```

Add every v2 table, index, qualifying view and trigger. Preserve checksum-before-object validation:

```ts
// src/lib/db.ts:424-440
const schemaRows = await db.execute({
  sql: `SELECT type, name FROM sqlite_schema WHERE name IN (${placeholders})`,
  args: names,
});
...
if (missingObjects.length > 0) {
  throw new Error(`Database publication schema is incomplete (...)`);
}
```

Do not put the real-catalog audit behind `getDb()`: `resolveDatabaseConnection()` intentionally honors Turso environment state (`src/lib/db.ts:136-173`), which violates Phase 19's explicit-local-only audit boundary.

---

### `src/lib/publication.ts` (service, canonical transform + transactional CRUD)

**Analog:** the existing v1 canonical payload and atomic publish path.

Retain normalization and stable serialization:

```ts
// src/lib/publication.ts:37-73
function normalizeText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value).replace(/\r\n?/g, "\n").normalize("NFC");
}

function stableStringify(value: CanonicalValue): string {
  ...
  const entries = Object.entries(value).sort(...);
  ...
}
```

Extend `readPublicationContentPayload()` rather than creating a second hash path. Include fixed keys and explicit nulls for source tier/group/archive, scopes, field evidence, conflict rows and all publication-critical approved media. Sort/deduplicate arrays using stable IDs or semantic keys. Exclude `entity_content_reviews` to avoid self-reference.

```ts
// src/lib/publication.ts:442-449
const payload = await readPublicationContentPayload(db, entityId);
return `${PUBLICATION_HASH_PREFIX}${createHash("sha256")
  .update(stableStringify(payload))
  .digest("hex")}`;
```

Keep one bounded transaction and no retry:

```ts
// src/lib/publication.ts:477-495, 520-560, 573-577
const transaction = await db.transaction("write");
try {
  const contentHash = await computePublicationContentHash(transaction, entityId);
  ...
  const readinessRows = await rows(transaction, `SELECT ... FROM public_entity_readiness ...`);
  ...
  await transaction.execute({
    sql: "UPDATE entity_publications SET status = 'published' WHERE entity_id = ?",
    args: [entityId],
  });
  ...
  await transaction.commit();
} catch (error) {
  await rollbackQuietly(transaction);
  throw error;
}
```

V2 sequence: compute hash → verify approved fact/language/media reviews for that hash → write/update publication review inside the transaction → query v2 readiness → publish → assert `public_entities` membership → commit.

---

### `src/lib/audit/read-only-catalog.ts` (adapter, local read-only DB I/O)

**Closest partial analog:** `scripts/check-article-content.ts`.

```ts
// scripts/check-article-content.ts:24-39, 92-94
const database = new Database(path.join(process.cwd(), "data/fpkg.db"), {
  readonly: true,
});
try {
  const articles = database.prepare(`SELECT ... ORDER BY e.slug`).all();
  ...
} finally {
  database.close();
}
```

Use the stricter existing open option from `scripts/generate-article-summary-migration.ts:28`:

```ts
new Database(DATABASE_PATH, { readonly: true, fileMustExist: true });
```

The new adapter must additionally canonicalize an explicit absolute local path, reject `libsql://`, `https://`, Turso selection and migration/write methods, execute `PRAGMA query_only=ON`, and expose only read/query/close operations. Snapshot real main/WAL/SHM before and after using the publication-gate pattern (`scripts/check-publication-gate.ts:148-153, 285-331`).

There is no exact hardened adapter analog; do not copy `getDb()` or `audit-entity-quality.ts`'s environment-sensitive client selection.

---

### `src/lib/audit/readiness-audit.ts` and `scripts/audit-readiness-v2.ts` (service + CLI, full batch/file I/O)

**Set semantics analog:** `scripts/check-public-boundary.ts`.

```ts
// scripts/check-public-boundary.ts:180-200
function assertSetEqual(actualValues, expectedValues, label): void {
  const actual = new Set(actualValues);
  const expected = new Set(expectedValues);
  const actualOnly = sortedUnique([...actual].filter((value) => !expected.has(value)));
  const expectedOnly = sortedUnique([...expected].filter((value) => !actual.has(value)));
  assertCondition(actualOnly.length === 0 && expectedOnly.length === 0, ...);
}
```

The service must accept an explicit DB adapter and query its universe from raw `entities WHERE type IN ('brand','pen') ORDER BY type, slug, id`. It returns the complete sorted `InventoryAudit`; it does no console slicing and no implicit connection resolution.

**Report/CLI analog:** `scripts/audit-public-media.ts`.

```ts
// scripts/audit-public-media.ts:204-218
await Promise.all([
  fs.mkdir(path.dirname(jsonPath), { recursive: true }),
  fs.mkdir(path.dirname(markdownPath), { recursive: true }),
]);
await Promise.all([
  fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`),
  fs.writeFile(markdownPath, toMarkdown(rows, metadata)),
]);
```

Copy its separation of argument parsing, audit, report writing, concise JSON console result and `process.exitCode = 1` error handling (`scripts/audit-public-media.ts:34-51, 204-233, 263-280`). Do not copy its timestamped filenames or `checked_at` into canonical artifacts: NDJSON/CSV equality must remain stable across identical runs.

Implementation order inside the CLI must be:

1. compute full audit and pass/fail;
2. serialize all rows to canonical NDJSON and fixed-column CSV;
3. write artifacts;
4. apply `rows.slice(0, limit)` only to terminal rendering;
5. set exit code from the complete audit, never the slice.

`inventory_snapshot_id` comes from stable sorted `(id,type,slug)` canonical JSON, not a clock. Runtime time/host/path belongs in a separate non-canonical metadata sidecar.

---

### `scripts/check-evidence-contract.ts`, `scripts/check-audit-readiness.ts`, and `scripts/check-publication-gate.ts` (tests, disposable CRUD)

**Primary analog:** `scripts/check-publication-gate.ts`.

Reuse its temp-root/client lifecycle rather than inventing ad hoc cleanup:

```ts
// scripts/check-publication-gate.ts:213-246
async function createFixture(...) {
  const tempRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  const databasePath = path.join(tempRoot, "fixture.db");
  const client = createClient({ url: `file:${databasePath}` });
  ...
  await migrateDatabase(client);
}

async function withFixture(run) {
  const fixture = await createFixture();
  try { return await run(fixture); }
  finally { await cleanupFixture(fixture); }
}
```

Keep schema/integrity checks together:

```ts
// scripts/check-publication-gate.ts:741-777
const quickCheck = await client.execute("PRAGMA quick_check");
const foreignKeyCheck = await client.execute("PRAGMA foreign_key_check");
...
await assertDatabaseReady(client, { migrationsDir });
await assertMigrationChecksum(client, migrationsDir);
```

Extend the existing `runMigrationFullContract()` matrix (`scripts/check-publication-gate.ts:955-966`) with fresh 031, pre-031 upgrade, idempotent replay, v1 fail-closed invalidation, table-rebuild integrity and all new trigger fan-out. Preserve the invalidation assertion:

```ts
// scripts/check-publication-gate.ts:1091-1114
const before = await publicationState(client, entityId);
await mutate();
const after = await publicationState(client, entityId);
assertCondition(after.revision > before.revision, ...);
assertCondition(after.status === "in_review", ...);
assertCondition(after.approvedHash === before.approvedHash, ...);
await assertNotPublic(client, entityId);
```

The evidence fixture matrix must cover every context case and one fully qualified brand+pen. The audit fixture must assert NDJSON/CSV identity equality, determinism, `--limit` invariance, exact extra-nine disposition and failure on any blocker. Keep success/failure/SIGTERM cleanup and cleared remote env from `scripts/check-publication-gate.ts:1835-1993`.

---

### `scripts/check-public-boundary.ts` and `tests/e2e/publication-gate.spec.ts` (parity/browser tests)

**Analog:** `runIndependentAllParity()`.

```ts
// scripts/check-public-boundary.ts:2801-2822
const before = realDatabaseSnapshot();
const tempRoot = fs.realpathSync.native(fs.mkdtempSync(...));
const fixtureDb = createClient({ url: databaseUrl });
process.env.TURSO_DATABASE_URL = "";
process.env.TURSO_AUTH_TOKEN = "";
process.env.FPKG_DATABASE_URL = databaseUrl;
...
await migrateDatabase(fixtureDb);
await seedBoundaryFixtures(fixtureDb);
```

Use direct `public_entities` as actual truth and an independently seeded known-ID oracle as expected truth:

```ts
// scripts/check-public-boundary.ts:2863-2876
const viewRows = await fixtureDb.execute(
  "SELECT id, type, slug FROM public_entities ORDER BY id",
);
assertSetEqual(viewRows.rows.map((row) => String(row.id)), expectedIds, ...);
assertSetEqual(viewRows.rows.map(entityIdentity), expectedIdentities, ...);
```

Continue checking browse, sitemap, entity API, detail/metadata, graph, recommendations and brand reverse-model lists as projections of the one public view. Do not import the readiness/audit predicate into the expected oracle. A fully qualified Majohn-like fixture should prove that publication changes both pen membership and the complete reverse brand model set.

---

### Legacy audit integration: `audit-entity-quality.ts`, `audit-library-coverage.ts`, `src/lib/library.ts`

The existing raw-row logic is an anti-pattern for release truth:

```ts
// scripts/audit-entity-quality.ts:85-94, 107-110
FROM entities e
LEFT JOIN stories s ON s.entity_id = e.id
LEFT JOIN claims c ON c.subject_entity_id = e.id
...
const thinEntities = entities
  .map(...)
  .filter((item) => item.reasons.length >= 2);
```

```ts
// src/lib/library.ts:1039-1063
SELECT e.id, ...,
       COUNT(DISTINCT s.id) as story_count,
       COUNT(DISTINCT c.id) as claim_count,
       ...
FROM entities e
LEFT JOIN stories s ON s.entity_id = e.id
...
```

Replace these release-gate calculations with projections from the shared readiness audit/qualifying views. Preserve user-facing summary formatting only. One blocker must fail; pending/deprecated/needs_source/candidate rows remain backlog counts and never completion counts. `--limit` may affect console rows only.

`getModelSpec()` currently accepts any one row-level citation (`src/lib/library.ts:436-456`); Phase 19 should route public spec fields through `publication_v2_field_evidence` instead.

---

### `package.json` (config)

Follow the existing direct `tsx` command routing (`package.json:56-65`):

```json
"audit:library-coverage": "tsx scripts/audit-library-coverage.ts",
"audit:entity-quality": "tsx scripts/audit-entity-quality.ts",
"check:public-boundary": "tsx scripts/check-public-boundary.ts",
"check:publication-gate": "tsx scripts/check-publication-gate.ts"
```

Add `audit:readiness-v2`, `check:evidence-contract`, and `check:audit-readiness`. Do not add a new test runner or dependency.

## Shared Patterns

### Fail-closed authorization

- `public_entities` remains the sole public authorization universe.
- Audit helpers diagnose it but never become a second public predicate.
- DB transition guard + transaction readiness + final membership assertion all remain required.

### Deterministic sets and serialization

- Every SQL collection has an explicit `ORDER BY`.
- Every identity comparison is bidirectional set equality, not count equality.
- Blocker details sort by `(blocker_code, subject_type, subject_id/detail_key)` before aggregation.
- Canonical artifacts contain no run clock, hostname or output path.

### Database safety

- Real catalog: explicit absolute local path, `better-sqlite3` readonly + fileMustExist + `query_only`, before/after main/WAL/SHM snapshots, no migration/write API.
- Schema/write/publish/browser tests: task-owned `mkdtemp` database only, remote env cleared, cleanup on success/failure/SIGTERM.
- No Turso, Vercel, network collection, credential logging or deployment in Phase 19.

### Error handling

- Contract checks aggregate independent failures where useful, then exit non-zero.
- Resource owners close clients and temp roots in `finally`.
- Publication transaction rolls back quietly and rethrows the original error; it does not retry ambiguous writes.

## No Exact Analog Found

| File/Concern | Reason | Planner Guidance |
|---|---|---|
| `src/lib/audit/read-only-catalog.ts` | Existing readonly scripts do not combine canonical path validation, remote rejection, `fileMustExist`, `query_only`, and main/WAL/SHM invariance | Compose the partial patterns above and test the adapter before schema work |
| RFC 4180 CSV serializer | No current repository utility provides deterministic quoting plus spreadsheet-formula safety | Implement a small pure serializer with a fixed column list and fixture cases for comma, quote, CR/LF and `= + - @` prefixes |
| normalized scope/evidence/conflict/review schema | Phase 18 has lifecycle/blockers but no equivalent domain tables | Follow research object responsibilities exactly; do not collapse them back into citations JSON or model-spec notes |
| canonical NDJSON inventory artifact | Existing report writers emit timestamped JSON/Markdown, not one deterministic identity per line | Make NDJSON canonical; derive CSV from the same already-sorted rows |

## Metadata

**Analog search scope:** `migrations`, `src/lib`, `scripts`, `tests/e2e`, `package.json`  
**Primary analogs:** `migrations/030_publication_gate.sql`, `src/lib/publication.ts`, `scripts/check-publication-gate.ts`, `scripts/check-public-boundary.ts`, `scripts/audit-public-media.ts`  
**Supporting partial analogs:** `migrations/008_fix_fk.sql`, `scripts/check-article-content.ts`, `scripts/generate-article-summary-migration.ts`, existing legacy audit files  
**Pattern extraction date:** 2026-07-15
