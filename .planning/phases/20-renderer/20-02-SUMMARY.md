---
phase: 20-renderer
plan: "02"
subsystem: ui
tags: [nextjs, react-server-components, markdown, accessibility, publication-gate]

requires:
  - phase: 20-renderer
    provides: Plan 20-01 current-public entity page loader and qualified page view model
provides:
  - Same-AST sanitized Markdown documents with stable Chinese heading IDs
  - Shared pure server encyclopedia shell for published brand and model pages
  - Evidence-aware brand timelines, complete model relations, specs, and variants
  - Request-cached fail-closed brand/model detail rendering and metadata
affects: [20-03, 20-04, entity-pages, metadata]

tech-stack:
  added: []
  patterns:
    - One sanitized Markdown AST owns both emitted heading IDs and navigation data
    - Pure server components project one qualified page view model without component SQL
    - React cache shares the publication-gated snapshot across metadata and page rendering

key-files:
  created:
    - src/components/library/EncyclopediaShell.tsx
    - tests/renderer/components.test.tsx
  modified:
    - src/lib/markdown.ts
    - src/components/library/BrandMuseum.tsx
    - src/components/library/ModelArchive.tsx
    - src/app/[type]/[slug]/page.tsx

key-decisions:
  - "Use one Markdown AST traversal for sanitized HTML IDs and section navigation; keep renderMarkdown as a compatibility delegate."
  - "Treat BrandMuseum and ModelArchive as synchronous projections of PublishedPageData, with no database access or public empty states."
  - "Fail closed for brand/model publication invariants and expose diagnostic context only in server logs."

patterns-established:
  - "Qualified page snapshot: visible page, metadata, JSON-LD, media, sources, and relations derive from one loader result."
  - "Optional evidence modules disappear completely, including their navigation targets, when no qualified data exists."

requirements-completed: [PAGE-01, PAGE-04, PAGE-06]

coverage:
  - id: D1
    description: "Published brand and model pages server-render a distinct reviewed summary plus the complete sanitized story with matching heading navigation."
    requirement: PAGE-01
    verification:
      - kind: integration
        ref: "tests/renderer/components.test.tsx#same-AST headings and server markup"
        status: pass
    human_judgment: false
  - id: D2
    description: "Brand pages render exact media, sourced timeline nodes, all published model links, and qualified sources."
    requirement: PAGE-04
    verification:
      - kind: integration
        ref: "tests/renderer/components.test.tsx#evidence modules"
        status: pass
    human_judgment: false
  - id: D3
    description: "Model pages render all eight PAGE-06 topics, evidence-backed specs, qualified variants, sources, and one canonical brand."
    requirement: PAGE-06
    verification:
      - kind: integration
        ref: "tests/renderer/components.test.tsx#route markup and PAGE-06 topics"
        status: pass
    human_judgment: false

duration: 15min
completed: 2026-07-18
status: complete
---

# Phase 20 Plan 02: Encyclopedia Renderer Summary

**One sanitized Markdown document now powers a pure server encyclopedia shell whose published brand and model pages share exact media, evidence modules, metadata, JSON-LD, and canonical relations from one cached qualified snapshot.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-07-18T15:32:42Z
- **Completed:** 2026-07-18T15:47:42Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Added stable Unicode-friendly H2/H3 IDs and navigation data inside the same sanitized Markdown AST, including deterministic duplicate suffixes.
- Replaced querying brand/model archives with pure evidence-aware server components that render exact qualified facts and omit empty optional modules.
- Routed published brand/model pages, metadata, JSON-LD, exact media, and canonical relations through one request-cached, fail-closed page snapshot.
- Covered each of the eight PAGE-06 story topics independently so tail truncation or summary substitution cannot satisfy the contract.

## Task Commits

Each task was committed atomically with its TDD RED and GREEN gates:

1. **Task 1: Add same-AST heading IDs and the shared pure server shell**
   - `4523414` — test: add failing encyclopedia shell contracts
   - `c739406` — feat: add same-AST encyclopedia shell
2. **Task 2: Convert BrandMuseum and ModelArchive into evidence-aware pure facts**
   - `888775c` — test: add failing evidence module contracts
   - `360222e` — feat: render evidence-aware brand and model facts
3. **Task 3: Make the detail route a thin cached loader and renderer controller**
   - `60fed85` — test: add failing thin-route contracts
   - `5bd7ffb` — feat: route published entities through one cached snapshot
4. **Security hardening discovered during final review**
   - `e2cd5c6` — fix: harden executable raw markup boundary

## Files Created/Modified

- `src/lib/markdown.ts` — returns sanitized HTML and matching heading metadata from one AST while preserving the existing API.
- `src/components/library/EncyclopediaShell.tsx` — composes all required publication-qualified content as initial server HTML.
- `src/components/library/BrandMuseum.tsx` — renders sourced timeline facts and the complete stable model-link set from props.
- `src/components/library/ModelArchive.tsx` — renders sourced specs and optional qualified variants without public empty states.
- `src/app/[type]/[slug]/page.tsx` — uses one cached publication-gated loader for brand/model metadata and visible rendering while preserving other entity paths.
- `tests/renderer/components.test.tsx` — proves same-AST IDs, sanitation, pure evidence modules, route wiring, and all PAGE-06 topic sentinels.

## Decisions Made

- Kept `renderMarkdown` compatible by delegating to `renderMarkdownDocument`; existing consumers retain the same string return type and sanitation boundary.
- Used the loader-qualified same-origin primary image directly and omitted generic brand/model hero or social fallbacks.
- Preserved the existing non-brand/non-pen route branch surgically; the new publication-gated branch returns before any legacy brand/model queries or fallback rendering.
- Kept presentation verification within focused renderer tests. Cross-page visual judgment remains the explicit responsibility of later Phase 20 visual/UAT work.

## Verification

- `pnpm exec tsx --test tests/renderer/components.test.tsx` — 10/10 passed.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm biome check src/lib/markdown.ts src/components/library/EncyclopediaShell.tsx src/components/library/BrandMuseum.tsx src/components/library/ModelArchive.tsx 'src/app/[type]/[slug]/page.tsx' tests/renderer/components.test.tsx` — passed.
- `git diff --check` — passed.
- Phase 19 preflight: `.planning/phases/19-real-audit-evidence/19-VERIFICATION.md` reported `passed` (5/5); its wrapper was not rerun.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Security] Blocked additional executable raw-markup surfaces**

- **Found during:** Final Task 3 review
- **Issue:** The initial hostile-markup cases covered scripts and JavaScript URLs but left other executable or interactive raw HTML surfaces insufficiently explicit.
- **Fix:** Expanded the existing AST sanitation boundary to reject dangerous style, embedded, form-control, SVG, and MathML tags; stripped event-handler properties and kept dangerous URLs inert.
- **Files modified:** `src/lib/markdown.ts`, `tests/renderer/components.test.tsx`
- **Verification:** Focused hostile raw HTML and JavaScript URL tests plus full renderer regression passed.
- **Committed in:** `e2cd5c6`

---

**Total deviations:** 1 auto-fixed (1 Rule 2 security requirement)

**Impact on plan:** The fix stayed inside the planned Markdown trust boundary and added no package, parser, route, or product scope.

## Issues Encountered

None. The focused implementation and regressions completed without authentication, package, schema, deployment, or real-catalog changes.

## Known Stubs

None in the new brand/model renderer path. Pre-existing fallback and placeholder code remains only in the intentionally preserved non-brand/non-pen route branch.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 20-03 can style stable semantic class hooks without changing data ownership or publication invariants.
- Plan 20-04 can perform full-route and visual/UAT checks against the shared server renderer.
- No blocker remains in Plan 20-02. Real catalog enrichment and external-source research were intentionally outside this renderer plan.

## Self-Check: PASSED

- All six owned implementation/test files and this summary exist.
- All seven task and deviation commits are present in Git history.
- Stub scan found no goal-blocking stub in the new brand/model renderer path; matches were initialized collections, sanitizer mutations, test sentinels, or preserved non-brand/non-pen legacy code.

---

*Phase: 20-renderer*
*Completed: 2026-07-18*
