---
status: complete
phase: 18-publication-gate
source:
  - 18-01-SUMMARY.md
  - 18-02-SUMMARY.md
  - 18-03-SUMMARY.md
  - 18-04-SUMMARY.md
  - 18-05-SUMMARY.md
  - 18-06-SUMMARY.md
  - 18-07-SUMMARY.md
started: 2026-07-15T14:21:58Z
updated: 2026-07-15T14:21:58Z
---

## Current Test

[testing complete]

## Tests

### 1. Importers fail closed before business writes
expected: All source and content importers use the canonical readiness guard.
result: pass
source: automated
coverage_id: 18-01-D1

### 2. Migration ownership has one enforceable owner
expected: The ownership scan rejects bypasses and preserves catalog data when migrations are pending.
result: pass
source: automated
coverage_id: 18-01-D2

### 3. Seeds and imports share the canonical migration boundary
expected: Seeds delegate migration while CSV and Markdown imports only perform readiness preflight.
result: pass
source: automated
coverage_id: 18-02-D1

### 4. Publication fixtures cannot reach the real catalog
expected: Disposable file databases reject real-catalog and mixed Turso configuration and clean up on every exit path.
result: pass
source: automated
coverage_id: 18-02-D2

### 5. Local browser tests start from an isolated database
expected: Playwright and production builds use an explicit disposable database without changing external E2E behavior.
result: pass
source: automated
coverage_id: 18-02-D3

### 6. Publication migration defaults every brand and pen to draft
expected: Migration 030 installs readiness, strict public membership, reset triggers and exact maker ownership without reviving old stories.
result: pass
source: automated
coverage_id: 18-03-D1

### 7. Every publication-critical change invalidates review
expected: INSERT, UPDATE and DELETE across all twelve governed tables invalidate stale approval.
result: pass
source: automated
coverage_id: 18-03-D2

### 8. Publishing is guarded and atomic
expected: Direct incomplete transitions fail and valid brand and pen fixtures publish in one no-retry transaction.
result: pass
source: automated
coverage_id: 18-03-D3

### 9. Core routes are fail closed
expected: Detail, metadata, sitemap, canonical redirects and middleware authorize only public_entities and return hard 404 for drafts.
result: pass
source: automated
coverage_id: 18-04-D1

### 10. Entity APIs expose only approved public fields
expected: List, detail and preview APIs equal public_entities, use no-store and hide draft fixtures.
result: pass
source: automated
coverage_id: 18-04-D2

### 11. Discovery lists and aggregates use the public set
expected: Browse, homepage and dimension pages are exact public projections with conservative caching.
result: pass
source: automated
coverage_id: 18-05-D1

### 12. Graph and link aliases contain no private entity
expected: Every graph node, edge, center, neighbor and second-hop alias is a public subset and no-store.
result: pass
source: automated
coverage_id: 18-05-D2

### 13. Recommendations, concepts and wiki links fail closed
expected: Secondary links contain only current public targets, including immediately after invalidation.
result: pass
source: automated
coverage_id: 18-06-D1

### 14. Brand pages enumerate every public model
expected: Reverse made_by equality gives each brand its complete public model list and exact count; media and source targets are public-only.
result: pass
source: automated
coverage_id: 18-06-D2

### 15. Exhibits and timelines hide invalidated targets
expected: Embedded targets are public-only and disappear on the next no-store read after edit or retirement.
result: pass
source: automated
coverage_id: 18-06-D3

### 16. Full migration and compatibility matrices pass
expected: Fresh, upgrade, replay, rollback, invalidation and non-brand compatibility checks pass on disposable databases.
result: pass
source: automated
coverage_id: 18-07-E1

### 17. Independent public-boundary oracle agrees everywhere
expected: Lists, per-ID surfaces, aggregates, contextual subsets and reverse brand-model sets match an oracle that does not reuse runtime authorization.
result: pass
source: automated
coverage_id: 18-07-E2

### 18. Hard-404 and lifecycle browser behavior is exact
expected: Majohn A1 and Montblanc 149 remain hard-404 drafts while fifteen valid models publish, invalidate, retire and re-review correctly.
result: pass
source: automated
coverage_id: 18-07-E3

## Summary

total: 18
passed: 18
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
