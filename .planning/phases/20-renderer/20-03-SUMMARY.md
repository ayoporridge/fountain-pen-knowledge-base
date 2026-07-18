---
phase: 20-renderer
plan: "03"
subsystem: ui
tags: [react, css, responsive-layout, accessibility, server-rendering]

requires:
  - phase: 20-renderer
    provides: Evidence-aware pure encyclopedia renderer from Plan 20-02
provides:
  - Exact 1152px desktop container with a 12-column 8/4 story-and-TOC layout
  - Single-column mobile renderer with a locally scrolling TOC at the 1024px breakpoint
  - Shared same-story desktop/mobile navigation and focused PAGE-07 contracts
affects: [20-04-browser-evidence, encyclopedia-renderer, responsive-ui]

tech-stack:
  added: []
  patterns:
    - One server-rendered navigation item set is projected into desktop and mobile semantic navs
    - Horizontal overflow is localized to Markdown tables, pre blocks, and the mobile TOC

key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/components/library/EncyclopediaShell.tsx
    - tests/renderer/components.test.tsx

key-decisions:
  - "Use one navigationItems result for both desktop and mobile TOCs so href sets cannot drift."
  - "Keep the complete story and evidence modules in one server-rendered main column; only the desktop TOC enters the rail."

patterns-established:
  - "Responsive encyclopedia shell: mobile-first single column, then a 12-column 8/4 grid at exactly 1024px."
  - "Optional module navigation is derived from the same present data that controls module rendering."

requirements-completed: [PAGE-07]

coverage:
  - id: D1
    description: Exact desktop/mobile layout selectors, local overflow, and accessible shared navigation
    requirement: PAGE-07
    verification:
      - kind: unit
        ref: tests/renderer/components.test.tsx#responsive selectors and navigation
        status: pass
      - kind: integration
        ref: pnpm exec tsx --test tests/renderer/components.test.tsx
        status: pass
    human_judgment: false
  - id: D2
    description: Real viewport geometry and page-level scrollWidth proof
    requirement: PAGE-07
    verification: []
    human_judgment: true
    rationale: Plan 20-04 owns independent desktop/mobile browser fixture evidence.

duration: 9min
completed: 2026-07-18
status: complete
---

# Phase 20 Plan 03: Responsive Encyclopedia Layout Summary

**A mobile-first encyclopedia shell with exact 8/4 desktop geometry, shared semantic TOCs, localized overflow, and visible server-rendered evidence.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-07-18T15:43:30Z
- **Completed:** 2026-07-18T15:52:34Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- Added the exact 1152px container, 1024px breakpoint, 32px gap, 8/4 desktop grid, 16px/24px gutters, and 96px sticky/anchor offsets.
- Rendered desktop and mobile TOCs from one item array, with identical heading/module targets, semantic lists, a visible current-location state, and 44px targets.
- Kept story, facts, variants/models, sources, attribution, and canonical links in initial server HTML while restricting horizontal scrolling to local content surfaces.
- Added focused tests for responsive selectors, optional-module navigation removal, semantic markup, external-link safety, and absence of hydration/truncation gates.

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement the exact desktop/mobile layout and local overflow contract** - `017c989` (feat)

## Files Created/Modified

- `src/app/globals.css` - Adds token-based responsive renderer layout, sticky/mobile TOCs, local overflow, wrapping, and breakpoint contracts.
- `src/components/library/EncyclopediaShell.tsx` - Emits shared desktop/mobile semantic navigation, responsive main/rail structure, present-module targets, and labeled safe external links.
- `tests/renderer/components.test.tsx` - Verifies CSS geometry, matching TOC hrefs, exact targets, optional-module omission, semantic HTML, and progressive server markup.

## Decisions Made

- The TOC includes a stable `正文` target before story headings and modules; both viewport variants reuse the exact same derived item array.
- The desktop rail contains only the sticky TOC. Story and evidence modules stay in the 8-column main area and preserve mobile DOM order.
- Existing `.image-row` content wraps instead of creating a fourth horizontal scrolling surface.

## Deviations from Plan

None - plan executed as specified. Browser viewport geometry remains intentionally owned by Plan 20-04.

## Issues Encountered

- Biome continues to report the pre-existing `.ink-underline` `!important` warning. It is outside this plan's selectors and does not fail the check.

## User Setup Required

None - no external service configuration required.

## Verification

- `pnpm exec tsx --test tests/renderer/components.test.tsx` — 14/14 passed.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm biome check src/app/globals.css src/components/library/EncyclopediaShell.tsx tests/renderer/components.test.tsx` — passed with one pre-existing CSS warning.

## Next Phase Readiness

- Plan 20-04 can now measure desktop/mobile `scrollWidth`, sticky TOC geometry, focus targets, and screenshots against the independent browser fixture.
- No schema, migration, dependency, production catalog, deployment, or content data changed.

## Self-Check: PASSED

- All three implementation/test files exist and task commit `017c989` is present.
- Focused and complete component suites, TypeScript, and Biome checks passed.

---
*Phase: 20-renderer*
*Completed: 2026-07-18*
