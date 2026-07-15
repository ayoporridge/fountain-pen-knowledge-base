---
phase: 18-publication-gate
plan: "06"
subsystem: secondary-public-surfaces
tags: [nextjs, publication, recommendations, library, media, exhibits, timeline, no-store]

requires:
  - phase: 18-publication-gate
    plan: "05"
    provides: canonical public_entities discovery helpers, disposable parity fixtures, and conservative cache policy
provides:
  - public-only recommendation, concept materialization/readback, and wiki-link targets
  - complete reverse made_by public model lists with accurate per-brand counts and links
  - owner-aware source, media, image-proxy, diagram, exhibit, and timeline surfaces
  - force-dynamic/no-store secondary delivery with critical-edit and retire next-read checks
affects: [18-07, recommendations, brand-pages, library, media, exhibits, timeline]

tech-stack:
  added: []
  patterns:
    - every secondary candidate and entity-bearing owner resolves through public_entities at read time
    - non-entity library content remains visible while entity-owned rows fail closed
    - isolated next-read fixtures prove critical edits and retirement cannot wait for a TTL

key-files:
  created:
    - .planning/phases/18-publication-gate/18-06-SUMMARY.md
  modified:
    - src/lib/recommend.ts
    - src/lib/concept-engine.ts
    - src/components/MarkdownRenderer.tsx
    - src/lib/library.ts
    - src/components/library/BrandMuseum.tsx
    - src/app/[type]/[slug]/page.tsx
    - src/app/api/image-proxy/route.ts
    - src/app/exhibits/[slug]/page.tsx
    - scripts/check-public-boundary.ts

key-decisions:
  - "Brand pages enumerate the full canonical reverse made_by public-pen set without representative LIMIT or slice semantics."
  - "Entity-owned sources, media, diagrams, exhibit references, and timeline events require a current public owner; genuinely global diagrams and timeline events remain visible."
  - "Secondary entity-bearing pages and image responses remain force-dynamic/no-store until a unified active invalidation mechanism exists."

patterns-established:
  - "Secondary target gate: gate current entity, candidate, owner, and resolved path independently through public_entities."
  - "Transition check: mutate publication-critical content or retire an entity, then query each public surface again without recreating the module."

requirements-completed: []

coverage:
  - id: D1
    description: "Recommendations, concept matches, and wiki links emit only current public entity targets, including after a critical edit invalidates stale materialization."
    requirement: "PUB-03, PUB-04, PUB-05, PUB-07"
    verification:
      - kind: integration
        ref: "pnpm check:public-boundary -- --secondary-links"
        status: pass
    human_judgment: false
  - id: D2
    description: "Each brand page lists every reverse made_by public pen with an exact count, while source, media, image, and diagram owners and targets are public-only."
    requirement: "PUB-03, PUB-04, PUB-05, PUB-07"
    verification:
      - kind: integration
        ref: "pnpm check:public-boundary -- --secondary-library-media"
        status: pass
    human_judgment: false
  - id: D3
    description: "Exhibit and timeline embedded targets are public-only, secondary pages are dynamic, and critical edit or retirement disappears on the next no-store read."
    requirement: "PUB-03, PUB-04, PUB-05, PUB-07"
    verification:
      - kind: integration
        ref: "pnpm check:public-boundary -- --secondary-exhibit-timeline-cache"
        status: pass
    human_judgment: false

duration: 25 min
completed: 2026-07-15
status: complete
---

# Phase 18 Plan 06: Secondary Surface Publication Gate Summary

**Recommendations, brand-model navigation, library/media ownership, exhibits, and timelines now resolve every entity-bearing target through the current `public_entities` set with dynamic/no-store delivery.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-07-15T13:07:27Z
- **Completed:** 2026-07-15T13:32:13Z
- **Tasks:** 3
- **Implementation files modified:** 14

## Accomplishments

- Gated recommendation current/direct/model/tag/brand aliases, concept recomputation and stale reads, and Markdown wiki resolution so unpublished targets degrade to no result or readable non-link text.
- Replaced representative brand models with the complete reverse `made_by` public-pen set, stable ordering, accurate count, and a link for every model; the 15-model fixture proves there is no 12-item truncation.
- Made source usage, media indexes, primary images, image proxy authorization, diagram owners, and diagram hotspots owner/target aware; unpublished media now returns a no-store 404.
- Sanitized exhibit related-entity and diagram JSON after canonical resolution, gated entity-owned timeline events, preserved global non-entity content, and removed TTL/ISR from every Plan 06 entity-bearing surface.
- Added independent disposable checks proving a critical edit and `retired` transition immediately remove a target from recommendations, wiki links, brand models, media/image proxy, exhibits, and timeline on the next read.

## Task Commits

1. **Task 1: gate recommendations, concept cache, and wiki links** — `8ed72fe`, with checker follow-up `5a8085c`
2. **Task 2: list all brand models and gate library/source/diagram/media owners** — `ead0048`
3. **Task 3: gate exhibit/timeline embedded entities and secondary cache policy** — `bfd7ec6`

## Files Created/Modified

- `src/lib/recommend.ts`, `src/lib/concept-engine.ts`, `src/components/MarkdownRenderer.tsx` — public-only secondary candidate, cache, and wiki resolution.
- `src/lib/library.ts` — complete brand models plus owner-aware source, media, diagram, exhibit, and timeline queries.
- `src/components/library/BrandMuseum.tsx`, `src/app/[type]/[slug]/page.tsx` — accurate “全部型号” count and links, plus a public parent-brand relation.
- `src/app/api/image-proxy/route.ts` — current public-owner authorization and no-store responses.
- `src/app/library/page.tsx`, `src/app/library/sources/page.tsx`, `src/app/library/diagrams/page.tsx` — force-dynamic library surfaces.
- `src/app/exhibits/page.tsx`, `src/app/exhibits/[slug]/page.tsx`, `src/app/timeline/page.tsx` — force-dynamic exhibit/timeline surfaces consuming sanitized data.
- `scripts/check-public-boundary.ts` — three disposable Plan 06 oracles, transition checks, cache-policy scan, cleanup, and real-catalog snapshots.

## Decisions Made

- Treated canonical reverse `made_by` as the only brand-to-model membership relation. Legacy bidirectional `brand_model` inference and representative limits are not accepted by the public brand page.
- Gated both the secondary record and its entity owner/target. A reviewed media, diagram, source use, exhibit reference, or timeline row cannot become public merely because its own workflow status is public.
- Preserved genuinely global diagrams and timeline events because they are non-entity content; only entity-owned rows require a current public owner.
- Kept all affected pages and image responses conservative (`force-dynamic`/`no-store`) because the project still has no unified cache purge path.
- Left `requirements-completed` empty. PUB-05 and PUB-07 were completed earlier; PUB-03 and PUB-04 remain pending until Plan 07 independent all-surface parity and browser verification.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Gated direct per-entity timeline reads in addition to the global timeline**

- **Found during:** Task 3 initial `--secondary-exhibit-timeline-cache` RED run.
- **Issue:** `getTimelineForEntity()` returned an approved event owned by a draft pen even though the global timeline already filtered its owner.
- **Fix:** Joined the per-entity timeline reader to `public_entities` and added an explicit draft-owner regression.
- **Files modified:** `src/lib/library.ts`, `scripts/check-public-boundary.ts`
- **Verification:** `pnpm check:public-boundary -- --secondary-exhibit-timeline-cache`
- **Committed in:** `bfd7ec6`

---

**Total deviations:** 1 auto-fixed bug.
**Impact on plan:** The additional gate closes the same planned timeline disclosure path and adds no surface outside Plan 06.

## Issues Encountered

- The no-flag legacy `check:public-boundary` and the library contract script default to `data/fpkg.db`. To honor the no-real-catalog rule, all boundary branches used explicit disposable fixture URLs; the library contract script ran from a disposable working directory whose `data/fpkg.db` was freshly migrated.
- Full lint passed with the pre-existing `src/app/globals.css:834` `!important` warning. No unrelated CSS was changed.
- The first combined verification shell intentionally cleaned its fixture via `trap` but placed the cleanup assertion before the trap ran. The corrected run explicitly removed and asserted the temporary directory, then exited successfully.

## Verification

- `pnpm check:public-boundary -- --secondary-links` — passed on an isolated disposable database.
- `pnpm check:public-boundary -- --secondary-library-media` — passed; 15/15 reverse models, exact count/link set, owner-aware sources/media/diagrams, and no-store image behavior.
- `pnpm check:public-boundary -- --secondary-exhibit-timeline-cache` — passed; draft targets excluded and critical edit/retire disappeared on the next read while global content remained.
- `pnpm exec tsc --noEmit` — passed.
- Library contract — passed after all 30 migrations on a fresh disposable database; only expected empty-fixture seed-count warnings were emitted.
- `pnpm lint` — passed with one pre-existing CSS warning.
- `pnpm build` — passed with Turso variables empty, explicit disposable `FPKG_DATABASE_URL`, and `PUBLICATION_GATE_FIXTURE=1`; library, source, diagram, exhibit, timeline, image, and detail routes were dynamic where required.
- `git diff --check` — passed.
- Real catalog stayed byte-identical: main database SHA-256 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`, size 24,723,456 bytes, unchanged inode/mtime; WAL and SHM remained absent.

## Known Stubs

None. Empty arrays in the isolated checker are request-scoped accumulators or expected authorization results, not public UI/data placeholders.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 18-07 can now run the independent all-surface parity and browser matrix over the canonical primary and secondary gates.
- PUB-03 and PUB-04 must remain pending until that final independent verification succeeds; this plan does not claim their completion.
- Remote migration, Turso writes, push, deployment, and production verification remain untouched.

## Self-Check: PASSED

- Task commits `8ed72fe`, `5a8085c`, `ead0048`, and `bfd7ec6` exist with no tracked deletions.
- All 14 implementation files and this Summary exist.
- All three Plan 06 boundary branches, TypeScript, library contract, full lint, disposable production build, fixture cleanup, and real-catalog snapshot checks passed.

---
*Phase: 18-publication-gate*
*Completed: 2026-07-15*
