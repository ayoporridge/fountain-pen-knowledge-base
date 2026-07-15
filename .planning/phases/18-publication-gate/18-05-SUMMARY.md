---
phase: 18-publication-gate
plan: "05"
subsystem: public-discovery
tags: [nextjs, publication, browse, graph, no-store, parity]

requires:
  - phase: 18-publication-gate
    plan: "04"
    provides: canonical public_entities helper, isolated boundary fixture, and core no-store surfaces
provides:
  - exact public-only browse rows, facets, home statistics, featured entries, and by-dimension aggregates
  - public-neighbor graph degrees and public-only one-hop/two-hop link responses
  - force-dynamic discovery pages and no-store discovery APIs
affects: [18-06, 18-07, browse, homepage, dimensions, graph, links-api]

tech-stack:
  added: []
  patterns:
    - explicit discovery DTO helpers backed by alias-safe public_entities filters
    - independent disposable parity oracle using direct public_entities reads
    - contextual graph validation as a public subset with independently recomputed degree

key-files:
  created:
    - .planning/phases/18-publication-gate/18-05-SUMMARY.md
  modified:
    - src/lib/browse-data.ts
    - src/app/page.tsx
    - src/app/browse/page.tsx
    - src/app/by/[dimension]/page.tsx
    - src/app/api/browse/route.ts
    - src/app/graph/page.tsx
    - src/app/api/links/route.ts
    - scripts/check-public-boundary.ts

key-decisions:
  - "Homepage and dimension discovery queries live beside browse data as explicit DTO helpers so pages and the independent checker exercise the same actual surface code."
  - "Graph hubs keep contextual LIMIT semantics; the checker proves every returned hub is public and independently recomputes degree from public neighbors instead of comparing against an unlimited universe."
  - "All Plan 05 discovery pages are force-dynamic and public GET APIs are no-store until a unified publication cache-invalidation path exists."

patterns-established:
  - "List parity: bidirectional identity equality plus keyed facet/statistic equality against direct public_entities oracle queries."
  - "Graph parity: returned centers/endpoints/neighbors/two-hop rows are public subsets; unpublished fixtures must not alter degree or appear in serialized responses."

requirements-completed: []

coverage:
  - id: D1
    description: "Browse, browse API, homepage, and by-dimension rows and aggregates are exact projections of public_entities and use conservative cache policy."
    requirement: "PUB-03, PUB-04, PUB-05"
    verification:
      - kind: integration
        ref: "pnpm check:public-boundary -- --discovery-lists"
        status: pass
    human_judgment: false
  - id: D2
    description: "Graph hubs/degrees and every links center, endpoint, neighbor, and second-hop alias are public-only and no-store."
    requirement: "PUB-03, PUB-04, PUB-05"
    verification:
      - kind: integration
        ref: "pnpm check:public-boundary -- --discovery-graph"
        status: pass
    human_judgment: false

duration: 12 min
completed: 2026-07-15
status: complete
---

# Phase 18 Plan 05: Primary Discovery Publication Gate Summary

**Browse/home/dimension discovery now matches `public_entities` exactly, while graph and links expose only public contextual neighbors with dynamic/no-store delivery.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-15T12:54:08Z
- **Completed:** 2026-07-15T13:06:09Z
- **Tasks:** 2
- **Implementation files modified:** 8

## Accomplishments

- Centralized homepage and dimension data in explicit discovery DTO helpers; browse rows, totals, facets, type counts, featured entries, stars, brand counts, tag counts, and totals now all derive from the canonical public universe.
- Changed home, browse, by-dimension, and graph pages to `force-dynamic`; changed browse and links GET responses to `Cache-Control: no-store`, including links 400 and 404 responses.
- Gated graph hub/selected degree by the public neighbor alias, and verified links center, source, target, neighbor, forward/backlink, and second-hop aliases against a direct `public_entities` oracle.
- Added isolated fixtures where draft pens and brands share tags and links with public entities, proving they cannot inflate aggregates, graph degree, or one-hop/two-hop responses.

## Task Commits

1. **Task 1: 统一 browse、home 与 by-dimension 列表/聚合** — `a02cb54`
2. **Task 2: gate graph 与 links API 的全部 entity aliases** — `b6a8591`

## Files Created/Modified

- `src/lib/browse-data.ts` — canonical browse, homepage, and dimension DTO queries.
- `src/app/page.tsx`, `src/app/browse/page.tsx`, `src/app/by/[dimension]/page.tsx` — consume shared discovery helpers and render dynamically.
- `src/app/api/browse/route.ts` — dynamic no-store browse response.
- `src/app/graph/page.tsx` — public-neighbor-aware hub and selected degree.
- `src/app/api/links/route.ts` — dynamic no-store public graph GET responses.
- `scripts/check-public-boundary.ts` — disposable list/aggregate and graph-subset oracles with real-catalog snapshots.

## Decisions Made

- Kept contextual graph results as subsets rather than requiring a LIMIT result to equal the full public universe. Each returned hub is checked for public membership and its displayed degree is independently recomputed from public neighbors.
- Kept database IDs inside server-rendering queries only. Browse and links public DTOs remain explicit and publication internals are rejected recursively by the checker.
- Did not mark PUB-03 or PUB-04 complete. Plan 06 still owns secondary discovery/media/library surfaces, and Plan 07 owns independent all-surface parity and browser verification. PUB-05 was already completed by the publication invalidation plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prevented a public filter alias collision in the new dimension query**

- **Found during:** Task 1 first `--discovery-lists` fixture run.
- **Issue:** Naming the outer entity alias `public_entity` collided with the helper's internal alias, reducing the correlated `EXISTS` to self-equality and counting a draft tagged pen (expected 1, actual 2).
- **Fix:** Renamed the outer alias to `dimension_entity`; the independent oracle then proved tag rows and totals exclude drafts.
- **Files modified:** `src/lib/browse-data.ts`
- **Verification:** `pnpm check:public-boundary -- --discovery-lists`
- **Committed in:** `a02cb54`

---

**Total deviations:** 1 auto-fixed bug.
**Impact on plan:** The fix was required for the exact public aggregate contract and added no surface outside Plan 05.

## Issues Encountered

- Next.js App Router rejects arbitrary named exports from `page.tsx`. The graph query helper remains private, and the checker exercises the actual page function then traverses its React result to verify hub identities and displayed degrees.
- The legacy no-flag `pnpm check:public-boundary` path still opens `data/fpkg.db`, which this execution was explicitly forbidden to access after the recorded migration incident. Instead, all four isolated branches (`--core-detail`, `--core-api-cache`, `--discovery-lists`, `--discovery-graph`) ran and passed; each snapshots the real main/WAL/SHM files before and after.
- Full lint exited successfully with one pre-existing `globals.css` `!important` warning. No unrelated CSS was changed.

## Verification

- `pnpm check:public-boundary -- --core-detail` — passed on a disposable database.
- `pnpm check:public-boundary -- --core-api-cache` — passed on a disposable database.
- `pnpm check:public-boundary -- --discovery-lists` — passed; exact rows, keyed facets/counts, home/by parity, cache policy, cleanup, and real-catalog snapshot.
- `pnpm check:public-boundary -- --discovery-graph` — passed; public hub degree, selected center, every links alias, no-store responses, cleanup, and real-catalog snapshot.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm lint` — passed with one pre-existing CSS warning.
- `pnpm build` — passed after all 30 migrations were applied to a fresh disposable database with Turso variables empty and `PUBLICATION_GATE_FIXTURE=1`; all six Plan 05 page/API routes were reported dynamic.
- `git diff --check` — passed.
- Real catalog stayed byte-identical: main database SHA-256 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`, size 24,723,456 bytes, unchanged inode/mtime; WAL and SHM remained absent.

## Known Stubs

None. Empty arrays in links and checker code are request-scoped accumulators, not UI or data-source placeholders.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 18-06 can gate recommendations, concept/wiki resolution, complete brand-model enumeration, library/source/media ownership, image proxy, exhibit, and timeline surfaces using the same fixture and cache policy.
- Plan 18-07 must still prove full independent parity and browser behavior before PUB-03/PUB-04 can be completed.
- Remote Turso migration, push, deployment, and production changes remain untouched.

## Self-Check: PASSED

- Task commits `a02cb54` and `b6a8591` exist with no tracked deletions.
- All eight implementation files and this Summary exist.
- Both task-level checks, both prior core regressions, TypeScript, full lint, disposable production build, fixture cleanup, and real-catalog snapshot checks passed.

---
*Phase: 18-publication-gate*
*Completed: 2026-07-15*
