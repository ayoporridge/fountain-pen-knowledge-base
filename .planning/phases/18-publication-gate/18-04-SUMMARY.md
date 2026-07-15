---
phase: 18-publication-gate
plan: "04"
subsystem: public-boundary
tags: [nextjs, publication, metadata, sitemap, api, no-store]

requires:
  - phase: 18-publication-gate
    plan: "03"
    provides: strict public_entities view and guarded publication lifecycle
provides:
  - canonical server-side public entity lookup for detail and metadata
  - fail-closed dynamic sitemap and middleware delegation
  - exact no-store list/detail/preview entity APIs
  - disposable local migration runner regression and isolated boundary fixtures
affects: [18-05, 18-06, 18-07, detail-pages, sitemap, entity-apis]

tech-stack:
  added: []
  patterns:
    - server-only public lookup backed by public_entities
    - middleware routes while database-backed pages authorize
    - exact public DTO allowlists with explicit no-store responses

key-files:
  created:
    - .planning/phases/18-publication-gate/18-04-SUMMARY.md
  modified:
    - scripts/migrate.ts
    - scripts/check-public-boundary.ts
    - src/lib/public-visibility.ts
    - src/app/[type]/[slug]/page.tsx
    - src/app/sitemap.ts
    - src/middleware.ts
    - src/app/api/entities/route.ts
    - src/app/api/entities/[slug]/route.ts
    - src/app/api/entities/[slug]/preview/route.ts

key-decisions:
  - "Local migration now resolves the same FPKG_DATABASE_URL contract as the application; fixture mode rejects the real catalog path."
  - "Middleware no longer imports database-backed visibility code or authorizes content slugs; canonical pages and APIs decide visibility from public_entities."
  - "Public entity APIs return exact existing DTOs, omit database/publication internals, and attach no-store to both success and 404 responses."

patterns-established:
  - "Core page equivalence: canonical redirect first, then exact type/slug lookup in public_entities, otherwise notFound."
  - "Core API equivalence: complete list equality, per-ID detail/preview equality, exact keys, no-store."

requirements-completed: []

coverage:
  - id: D1
    description: "Local migrate honors the disposable database override; detail, metadata, sitemap, redirects, and middleware are fail-closed against public_entities."
    requirement: PUB-03, PUB-04, PUB-05
    verification:
      - kind: integration
        ref: "pnpm check:public-boundary -- --core-detail"
        status: pass
      - kind: build
        ref: "FPKG_DATABASE_URL=<disposable DB> PUBLICATION_GATE_FIXTURE=1 pnpm build"
        status: pass
    human_judgment: false
  - id: D2
    description: "Entity list, detail, and preview APIs are equivalent to public_entities, exact-key allowlisted, no-store, and return draft fixtures as 404."
    requirement: PUB-03, PUB-04, PUB-05
    verification:
      - kind: integration
        ref: "pnpm check:public-boundary -- --core-api-cache"
        status: pass
    human_judgment: false

duration: 32 min
completed: 2026-07-15
status: complete
---

# Phase 18 Plan 04: Core Public Boundary Summary

**Detail pages, metadata, sitemap, middleware, and the three public entity APIs now share the `public_entities` authorization universe and fail closed without response caching.**

## Performance

- **Duration:** 32 min
- **Completed:** 2026-07-15
- **Tasks:** 2
- **Implementation files modified:** 9

## Accomplishments

- Replaced raw brand/pen visibility checks with an explicit `public_entities` lookup. Detail pages and metadata redirect known aliases first, then return `notFound()` when the canonical target is not published.
- Made entity detail and sitemap dynamic, removed fallback sitemap behavior, and moved content authorization out of Edge middleware so server-only database code is never bundled into middleware.
- Changed entity list/detail/preview GET routes to read only the canonical public view, return exact DTOs, omit IDs and publication internals, and send `Cache-Control: no-store` for both 200 and 404 responses.
- Fixed `scripts/migrate.ts` to honor `FPKG_DATABASE_URL` and `PUBLICATION_GATE_FIXTURE`. The boundary checker now launches the real migration command against a disposable file, proves migration 030 landed there, compares the real catalog main/WAL/SHM snapshot, and removes the fixture.
- Added isolated page/API integration fixtures covering published and draft brand/pen rows, a legacy alias whose canonical target remains draft, sitemap membership, middleware delegation, DTO equality, denylisted fields, and cache headers.

## Task Commits

1. **Task 1: 修复隔离 migration 入口并接通 helper/detail/metadata/sitemap/middleware** — `48df7e1`
2. **Task 2: 接通 entity list/detail/preview APIs 与 core checks** — `6f79035`

Planning correction for the discovered migration target hazard: `08c8ba1`.

## Decisions Made

- Kept `getPublicEntityBySlug()` server-only. Middleware no longer imports `public-visibility.ts`; it handles namespaces, disabled tools, and canonical redirects while the page performs database authorization.
- Kept API response shapes backward-compatible instead of exposing the richer view row. The checker treats any ID, status, blocker, hash, revision, reviewer, or timestamp key as a failure.
- Did not mark PUB-03 or PUB-04 complete at this plan boundary. This plan closes the core surfaces only; discovery and secondary surfaces remain in Plans 18-05 and 18-06.

## Deviations from Plan

- The original Plan 04 omitted `scripts/migrate.ts`, but its hardcoded local path was discovered while building the required isolated fixture. Plan and validation documents were amended before the safety fix.
- The first executor invoked that pre-fix script with an override it ignored, which applied migration 030 to local `data/fpkg.db`. Execution stopped immediately. Read-only forensics showed SQLite integrity `ok`; only the migration marker, publication schema objects, and 305 draft publication rows were added. Migration 030 contains no update/delete against `entities` or `stories`, and no remote database or deployment was touched.
- The only available backup predates current work by nearly three weeks. A destructive restore or rollback would risk losing newer local content, so the safest non-destructive disposition was to retain the local 030 schema, avoid opening the catalog thereafter, fix the runner, and require snapshot-protected disposable fixtures. This disposition remains explicitly recorded rather than described as zero deviation.

## Issues Encountered

- Directly importing the new server lookup through middleware caused Next's Edge bundle to pull `node:fs`, `node:crypto`, `node:path`, and `node:url`. Removing content blacklist authorization from middleware fixed the architectural boundary; the disposable production build then passed.
- A first disposable build inherited `TURSO_DATABASE_URL` from `.env.local`, correctly triggering the mutual-exclusion guard. Subsequent isolated builds set the Turso variables to empty explicitly and passed.
- Calling the page component directly under `tsx` lacked Next's JSX runtime injection. The checker installs React only inside its disposable integration process; application code was not changed for this test-runner detail.

## Verification

- `pnpm check:public-boundary -- --core-detail` — passed; disposable migrate, helper/page/metadata, canonical redirect, draft 404, sitemap equality, middleware delegation, cleanup, and real-catalog snapshot.
- `pnpm check:public-boundary -- --core-api-cache` — passed; list equality, detail/preview per-ID behavior, exact DTOs, denylist, no-store 200/404, cleanup, and real-catalog snapshot.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm exec biome check ...` for all Plan 04 implementation files — passed.
- `pnpm build` — passed against a freshly migrated disposable database with Turso disabled and `PUBLICATION_GATE_FIXTURE=1`.
- `git diff --check` — passed.

## Next Phase Readiness

- Plan 18-05 can replace browse/home/by/graph/links readers with the same canonical view and extend `check-public-boundary.ts` using the established fixture lifecycle.
- Plan 18-06 can gate the remaining recommendation, concept, library, brand-model, media, exhibit, and timeline surfaces.
- The real local catalog must not be used for further fixtures; all remaining Phase 18 checks use disposable databases. Remote migration, push, and deployment remain deferred to Phase 26.

## Self-Check: PASSED

- Implementation commits `48df7e1` and `6f79035` exist.
- All nine implementation files and this Summary exist.
- Both task-level boundary commands, TypeScript, Biome, disposable production build, cleanup checks, and real catalog snapshot checks passed.

---
*Phase: 18-publication-gate*
*Completed: 2026-07-15*
