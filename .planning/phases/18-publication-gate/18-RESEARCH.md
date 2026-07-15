---
phase: 18-publication-gate
status: complete
researched: 2026-07-15
requirements:
  - PUB-01
  - PUB-02
  - PUB-03
  - PUB-04
  - PUB-05
  - PUB-06
---

# Phase 18 Research — Unified Publication Gate

## Research question

How should the project establish one fail-closed public entity universe for every
brand and pen surface without breaking the existing public behavior of articles,
concepts, nibs, and other entity types?

## Executive conclusion

The empty Montblanc 149 page is not an isolated rendering defect. The current
contract equates “entity row exists and is not on a manual blacklist” with
“publishable.” It does not require an approved narrative, usable specifications,
independent sources, licensed media, or a current editorial review. The same
fail-open predicate is copied across detail pages, browse, sitemap, graph, APIs,
recommendations, and secondary library surfaces.

Phase 18 should introduce a database-backed publication state and one canonical
`public_entities` universe. For brand and pen entities, absence of a publication
record, any non-published state, a readiness blocker, or a stale content revision
must exclude the entity everywhere. Existing brand and pen rows are backfilled as
`draft`; none are grandfathered into public visibility. Non-brand/pen behavior is
preserved exactly unless an explicit publication record is later added.

Before adding migration `030`, Phase 18 must remove legacy migration runners from
import and seed scripts. Eleven current scripts can record a migration as applied
without executing its SQL. Adding a gate before fixing those runners could produce
a remote database that claims the gate exists while its tables and views are absent.

Phase 18 is local-only. It creates and verifies the contract on disposable local
databases. Phase 19 expands the evidence/readiness rules; Phase 26 reconciles the
known Turso schema drift, validates staging, migrates production, and deploys.

## Current failure model

### Existing public truth

`src/lib/public-visibility.ts` currently owns the old predicate:

- `publicEntityFilter(alias)` excludes a small set of hard-coded brand, concept,
  article, and duplicate slugs.
- `PUBLIC_ENTITY_FILTER_SQL` hard-codes the alias `e`.
- `isPublicEntity()` returns true for normal brand/pen rows even if their content is
  draft, deprecated, pending review, or absent.
- `publicMediaFilter()` checks media licensing but does not prove that the owning
  entity is public.

The detail renderer then hides the raw `entities.summary`/body for brand and pen
pages and only renders approved story/spec components. The result is a route that
passes the old visibility predicate while displaying “暂无可公开规格” and little or
no substantive content.

### Baseline impact

The milestone baseline found 296 currently public brand/pen pages. None satisfies
the complete narrative + specifications + sources + image contract. All 313
brand/model stories are deprecated, most model specifications are `needs_source`,
and existing audit scripts count non-public workflow states as complete. Phase 18
therefore must fail closed rather than retain the current page count as a quality KPI.

### Brand-model relationship baseline

The 2026-07-15 local raw database already contains many `made_by` links, so the
problem is both data quality and rendering, not total absence of relations:

- 236 raw pen rows; 231 have at least one `made_by`, five have none;
- one pen (`英雄派迪-一体尖`) points at two brands;
- 69 raw brands; 62 have at least one reverse-linked pen, seven have none;
- Majohn A1 is already linked to the Majohn brand;
- `getBrandRepresentativeModels()` applies `LIMIT 24` and then `.slice(0, 12)`,
  while `BrandMuseum` labels the section “代表型号”. Even correct relationships are
  therefore intentionally hidden from the brand page.

Phase 18 must enforce exactly one public canonical brand for a public pen and replace
the representative slice with the complete public reverse set. Phase 23 performs the
full raw inventory repair for the five missing, one multi-brand, seven empty-brand,
and any semantically wrong links discovered by source-backed review.

## Migration blocker: false-applied migrations

### Canonical runner

`src/lib/db.ts::migrateDatabase()` executes each SQL file and writes its marker in
one libSQL write transaction, recording a checksum. This is the only migration
implementation that should remain.

### Embedded legacy runners

The following eleven import/library scripts contain a compatibility path that, when `entities`
already exists, writes pending migration names into `migrations` without executing
their SQL:

1. `scripts/import-brand-completion-sources.ts`
2. `scripts/import-exhibit-content.ts`
3. `scripts/import-model-gap-sources.ts`
4. `scripts/import-official-brand-sources.ts`
5. `scripts/import-official-brand-stories.ts`
6. `scripts/import-official-model-diagrams.ts`
7. `scripts/import-official-model-sources.ts`
8. `scripts/import-research-gap-sources.ts`
9. `scripts/import-warm-pen-atlas-media.ts`
10. `scripts/import-wikidata-brands.ts`
11. `scripts/seed-library-samples.ts`

The same ownership guard must also cover `scripts/seed-concepts.ts`, which executes
migrations and writes markers, plus `scripts/import-csv.ts` and
`scripts/import-markdown.ts`, which independently read and split migration SQL.

Because the resulting marker has a null checksum, the canonical runner later fills
the checksum and skips the SQL. The migration can remain permanently false-applied.

`scripts/seed.ts` and `scripts/seed-tags.ts` also have independent, non-atomic,
checksum-free migration runners.

### Required remediation order

1. Importers stop migrating and call `assertDatabaseReady()` before writing data.
2. Seed entry points call the canonical `migrateDatabase()` implementation.
3. A static guard rejects writes to the `migrations` table outside `src/lib/db.ts`
   and dedicated migration tests.
4. A regression test proves that an importer facing a missing `030` fails without
   creating a marker.
5. Only then add `migrations/030_publication_gate.sql`.

## Recommended schema

### `entity_publications`

One row per explicitly governed entity:

| Field | Contract |
|---|---|
| `entity_id` | PK/FK to `entities`, cascade delete |
| `status` | `draft`, `in_review`, `published`, `retired`; default `draft` |
| `depth_tier` | nullable `A`, `B`, `C` |
| `quality_score` | nullable integer 0–100; diagnostic only |
| `blockers_json` | valid JSON array snapshot; never an authorization source |
| `approved_content_hash` | nullable `sha256:v1:<64 lowercase hex>` for the last approved snapshot |
| `content_revision` | monotonic non-negative integer |
| `reviewed_content_revision` | revision approved by reviewer |
| `reviewed_contract_version` | readiness contract version |
| review metadata | reviewer, reviewed/published timestamps, notes |

Do not enforce hash freshness in a table-level `published` CHECK. A content edit
must be allowed to commit and then make the entity disappear from the public view;
rejecting the edit would preserve stale public content.

### `publication_blockers`

Store one normalized blocker per entity so readiness can be audited and compared
without parsing an application-produced JSON blob. Suggested key:
`(entity_id, contract_version, blocker_code, subject_type, subject_id)`.

The Phase 18 v1 fixture contract should cover structural blockers only:

- missing publication record;
- missing usable summary;
- missing or duplicate published story of the correct brand/model type;
- pen missing or having multiple `made_by` relationships;
- missing content hash;
- reviewed revision not equal to current revision;
- reviewed contract version not equal to v1;
- missing reviewer/review timestamp.

Phase 19 extends this with the full evidence, spec, source independence, media,
variant, conflict, and layered review rules, then increments the contract version.
Any row still reviewed under v1 fails closed once v2 becomes current.

### `public_entity_readiness` view

Produces per-entity diagnostics such as `blocker_count`, stable blocker ordering,
and `publishable`. Publication status is not itself a readiness blocker; this lets
review complete before a transaction switches the row to `published`.

### `public_entities` view

This is the only public authorization universe. It should expose public entity
columns needed by readers, not reviewer notes or internal blocker details.

Rules:

1. Brand/pen: require an `entity_publications` row with `status='published'`,
   v1 readiness true, zero blockers, current reviewed revision, and current hash.
2. Non-brand/pen without a publication row: preserve the old public visibility
   predicate exactly.
3. Any non-brand/pen with an explicit publication row: use the strict new gate.

Migration backfill is dynamic:

```sql
INSERT OR IGNORE INTO entity_publications (
  entity_id, status, blockers_json
)
SELECT id, 'draft', '["publication_draft"]'
FROM entities
WHERE type IN ('brand', 'pen');
```

No deprecated story is promoted or rewritten. The current production-shaped local
database is expected to produce zero published brand/pen rows after migration.

### Hash and invalidation

Compute a canonical JSON hash in TypeScript. The format specification must define
fixed keys, explicit nulls, type conversion, Unicode NFC, newline normalization,
array sort keys, duplicate handling, and schema version. At minimum include:

- entity type, slug, name, and summary;
- correct published brand/model story;
- model specification and variants;
- publication-critical claims and citations;
- approved primary media;
- pen `made_by` relationship.

The invalidation dependency matrix must additionally cover changes to
`source_items` review/allowed-use, `source_registry` reliability/license,
`entity_references`, and any published timeline input used by the active contract.
Phase 19 migrations must add equivalent invalidation for new conflict, field
citation, scope, and content-review tables before switching to v2.

SQLite row triggers increment `content_revision` on insert/update/delete of these
inputs and move a currently published row back to `in_review`. The old approved hash
remains as audit evidence, while the revision mismatch removes the entity from
`public_entities` immediately. Entity creation as brand/pen should create a draft
publication row. Conversion into brand/pen and brand↔pen changes must reset
approval/hash state so an unrelated prior approval cannot revive. Leaving brand/pen
must retain an explicit non-published publication row; deleting it would fall through
to the non-brand legacy branch and could make the converted entity public.

The publish function is a dedicated server-only write transaction. A database
transition trigger must independently reject direct SQL attempts to enter
`published` unless current readiness, revision, contract version, hash format,
reviewer, and timestamps are valid.

The controlled transaction:

1. Read stable inputs and compute canonical hash.
2. Write review metadata, hash, reviewed revision, and contract version.
3. Re-query readiness.
4. Switch to `published` only with zero blockers.
5. Assert the entity entered `public_entities`.
6. Roll back on any failure; do not retry this write transaction implicitly.

## Complete public surface inventory

All of the following must consume the same view/helper. A surface is not complete
until every entity alias in its SQL is gated, including graph neighbors and parent
brands.

### Primary routes and APIs

- `src/app/[type]/[slug]/page.tsx`: metadata, detail lookup, related entities,
  pen parent brand.
- `src/lib/browse-data.ts`: rows, counts, facets, type counts; used by SSR browse
  and `/api/browse`.
- `src/app/sitemap.ts`: dynamic entity URLs.
- `src/app/graph/page.tsx`: hubs, selected entity, neighbor-limited degree.
- `src/app/api/links/route.ts`: center, forward/backlink, and two-hop aliases.
- `src/app/api/entities/route.ts`: entity list.
- `src/app/api/entities/[slug]/route.ts`: entity detail.
- `src/app/api/entities/[slug]/preview/route.ts`: public hover preview, not an
  editorial preview.

### Discovery and relationship surfaces

- `src/lib/recommend.ts`: current entity, direct/model/tag candidates, brand alias.
- `src/app/page.tsx`: statistics, featured entities, per-type stars.
- `src/app/by/[dimension]/page.tsx`: brand list and entity/pen counts.
- `src/lib/concept-engine.ts`: cached public entity index and concept matches.
- `src/components/MarkdownRenderer.tsx`: wiki-link slug resolution.
- `src/lib/library.ts`: complete brand models, featured brands, parent brand,
  exhibit/timeline/diagram links, source index references.
- `src/app/api/image-proxy/route.ts`: owner-aware access for media IDs.

### Preserve as non-public/admin helpers

`getLibraryCoverageReport()` intentionally scans the full backlog and should not be
converted to the public view. It must remain unreachable from public routes. The
retired media/community/coverage helpers need explicit private naming or wrappers so
future reuse cannot silently become a public surface.

### Redirect and middleware behavior

Canonical identity redirects remain valid. Resolve a known legacy identity first,
then let the canonical target return 404 if not published. Middleware blacklists
must not remain a second brand/pen truth source. No `generateStaticParams` exists;
future static enumeration must query `public_entities`.

## Runtime helper design

Keep the public SQL condition alias-safe and centralized:

- `publicEntityFilter(alias)`: an `EXISTS` against `public_entities` for list/join
  queries. It must not interpolate untrusted aliases; accept only validated internal
  SQL identifiers.
- `getPublicEntityBySlug(type, slug)`: direct detail/metadata/API lookup from the
  public view.
- `isPublicEntity()` should no longer authorize brand/pen objects fetched from raw
  `entities`; at most retain it for deterministic non-brand/pen compatibility.

The public API payload allowlist must not expose publication status, review metadata,
content hashes, blocker JSON, or readiness internals.

## Cache invalidation

Database fail-closed behavior is insufficient if cached pages remain public:

- many pages use `revalidate = 600`;
- `/api/browse` allows ten minutes fresh plus one hour stale-while-revalidate;
- successful image proxy responses cache for thirty days.

Offline import scripts and SQLite triggers cannot invoke Next.js cache purge. Phase
18 therefore changes every entity-bearing page/API to dynamic/no-store, including
owner-bound image proxy responses. This is the only architecture that makes an
offline critical edit immediately fail closed without introducing a new authenticated
publication service and outbox. Tests must demonstrate that a published fixture
disappears on the next request after a critical edit or retirement. A later phase may
restore tagged caching once all publication writes share one server-only entry point.

## SQLite and Turso compatibility

The project currently uses legacy `@libsql/client` against SQLite 3.45.1, where
tables, indexes, views, row triggers, CTEs, and JSON1 are available. Keep `030` to
plain DDL plus a small dynamic backfill. Avoid:

- `CREATE OR REPLACE VIEW` (drop/recreate instead);
- `ALTER TABLE ... ADD CONSTRAINT`;
- CHECK subqueries, statement-level triggers, and `DROP ... CASCADE`;
- PostgreSQL enums/booleans/JSONB;
- SHA computation inside SQLite;
- an outer `BEGIN/COMMIT` in the migration file.

Official references:

- [SQLite CREATE VIEW](https://sqlite.org/lang_createview.html)
- [SQLite ALTER TABLE](https://sqlite.org/lang_altertable.html)
- [SQLite omitted features](https://sqlite.org/omitted.html)
- [Turso TypeScript SDK reference](https://docs.turso.tech/sdk/ts/reference)
- [Turso SQLite compatibility](https://docs.turso.tech/sql-reference/compatibility)

Turso interactive write transactions have a short execution window, so the publish
transaction must be bounded and must not run batch research/hash work. The newer
Turso Database engine documents different view/trigger support; changing SDK/engine
requires a fresh compatibility review.

## Known remote drift and deployment boundary

The live Turso schema is not equivalent to a clean local replay despite complete
migration markers:

- remote `entities` has an extra `image_url` and lacks the local type CHECK;
- several core tables lack local FK/CHECK constraints;
- migration `006` is marked applied but `entities_fts` is absent;
- no views currently exist remotely.

`assertDatabaseReady()` therefore needs a critical `sqlite_schema` object check, not
only marker/checksum verification. Legacy bulk import/fix scripts must not be used as
a deployment migration path. Phase 18 does not mutate remote data. Phase 26 will use
a staging clone, schema diff, migration rehearsal, smoke test, and only then production.

## Validation architecture

### Fast task-level feedback

Use deterministic script checks rather than a browser for the database contract:

- migration ownership/static guard;
- migration replay/upgrade/idempotency fixture;
- publication schema and view contract;
- content revision invalidation matrix;
- public boundary and surface parity SQL/API checks.

Target feedback latency is under 30 seconds per task. Browser tests remain a wave/end
gate because starting Next.js and Playwright is slower.

### Required migration matrix

1. Full replay from an empty database.
2. Upgrade a copy of the current local database through `030`.
3. Second run is idempotent and checksum-clean.
4. `PRAGMA quick_check` is `ok`; `foreign_key_check` is empty.
5. Required table/view/index/trigger definitions exist in `sqlite_schema`.
6. All existing brand/pen entities receive draft rows; zero become published.
7. Deprecated stories and unrelated content are unchanged.
8. Illegal status/JSON/hash/revision writes are rejected.
9. Each critical INSERT/UPDATE/DELETE increments revision and invalidates visibility.
10. Non-brand/pen old vs new public sets have zero rows in both `EXCEPT` directions.

### Publication fixtures

Create isolated fixtures covering:

- missing publication row;
- draft, in-review, retired;
- missing blocker prerequisites;
- stale hash/revision/contract;
- valid v1 published brand and pen;
- Montblanc 149 as a deliberate draft/no-content regression fixture.

The current local production-shaped rows remain draft. `src/lib/db.ts` must accept a
server-only test database URL/path override, and Playwright must launch Next against
that disposable database. Tests must not publish real catalog rows or rely on
Pilot/LAMY as permanent fixtures.

### Surface parity

`scripts/check-public-boundary.ts` must independently compare the canonical view with
the complete public surface universe. It must not compute both expected and actual
sets with the same helper (the current tautology). Compare at least:

- complete lists (browse, sitemap, entity list API): bidirectional equality;
- detail/metadata/detail API/preview: per-ID reachability equivalence;
- facets/statistics: aggregate equivalence;
- graph hubs/neighbors and recommendation candidates: strict public subset;
- homepage/by-dimension/complete brand-model discovery;
- wiki, exhibit, timeline, diagram, source, and media links.

Replace `sitemap > 500` with exact set equality. Also assert that unpublished pages
do not emit canonical, Open Graph, or JSON-LD metadata, and that API payloads do not
leak publication internals.

### Full phase gate

After each wave: migration safety, data contract, public boundary, library contract,
lint, build, then desktop/mobile Playwright coverage. Phase completion requires an
independent verifier to prove PUB-01 through PUB-07 against code and fresh databases.

## Planning decomposition

Recommended plans:

1. **Importer migration ownership** — remove the ten false-apply importer runners
   and add the full scripts ownership/static behavior gate.
2. **Seed/import runner cleanup and isolated fixtures** — route four seed entry
   points through the canonical runner, make CSV/Markdown readiness-only, and add
   injectable local/Playwright database harnesses.
3. **`030` publication contract** — tables/views/triggers, version-aware schema
   readiness, canonical hash, server-only publish transaction, state transitions,
   replay and DB fixtures.
4. **Core runtime gate** — canonical public helper, detail/metadata, sitemap,
   entity list/detail/preview APIs, middleware, and no-store on every changed surface.
5. **Primary discovery surfaces** — browse/home/by-dimension, graph and links API,
   including list/aggregate/subset semantics and no-store.
6. **Secondary discovery surfaces** — recommendations, concept/wiki resolution,
   complete brand-model enumeration, library/source/media/exhibit/timeline owner
   gates and no-store.
7. **Independent parity and browser regression** — Montblanc 149 and Majohn A1
   fail-closed cases, complete brand-model reverse parity,
   bidirectional/per-ID/aggregate/subset checks, API leak checks, old E2E rewrite,
   and the complete local phase gate.

Run all seven plans sequentially because schema, fixture and shared checker
dependencies are strict. Each plan and task owns fewer than fifteen modified files;
fixtures are established in Plan 02 rather than postponed to the final plan.

## What not to do

- Do not promote existing records to preserve route count.
- Do not display placeholders as a substitute for publication quality.
- Do not copy readiness conditions into every query.
- Do not trust migration markers without critical schema objects.
- Do not calculate or bulk-refresh hashes inside migration `030`.
- Do not deploy the local fail-closed intermediate state to production.
- Do not start full content publishing until Phase 19 has versioned the complete
  evidence contract.
