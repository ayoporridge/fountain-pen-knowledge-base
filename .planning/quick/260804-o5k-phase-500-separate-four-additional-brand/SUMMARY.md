---
phase: 500
slug: phase-500-separate-four-additional-brand
status: complete
---

# Phase 500 summary

## Delivered

Separated four audited brand/model primary-media collisions on an owned
checkpoint copy, without changing the sourced model rows:

- David Oscarson / Winter Collection
- Bexley / Original
- Gioia / Capodimonte Kawari
- Danitrio / Densho

Each brand now has its own site-original factual SVG, approved source item,
approved fact/language/media reviews, and a blocker-free published record via
`publishEntity`. No entity, model prose, model identity, or model primary
media was created or rewritten.

## Evidence

- Targeted test: `tests/content/phase500-four-brand-media.test.ts` — 1/1
  passed. It covered remote-selection rejection, owned-copy authority,
  source/media/review/publication assertions, model-row equality, duplicate
  path removal, replay idempotency, integrity/FK checks, and the protected
  catalog snapshot.
- CLI first apply on
  `.planning/quick/260804-o5k-phase-500-separate-four-additional-brand/checkpoint/catalog.db`
  returned `changed: true` and four `published` outcomes with hashes:
  - `phase349-david-oscarson-brand` —
    `sha256:v3:25f3f00e51bf596707bbdf6de328dbc5f7b2d4acc50347252e461b963862c182`
  - `phase350-bexley-brand` —
    `sha256:v3:759431a5154f9770408289147005fd298dc6d6923f1411ba6e5d9fa9a8f2dc8b`
  - `phase351-gioia-brand` —
    `sha256:v3:dc4824f89c00b480ed9ddd407b46795b380dc6de20dbfe63da73cb42700279bb`
  - `phase352-danitrio-brand` —
    `sha256:v3:2fc90a644596e3910c4cc398d5b935626c68cfa51ee39e1a81795df31b96f76f`
- CLI replay returned `changed: false`; all four outcomes were `noop` and
  hashes were stable.
- Readback showed all four brands `published`, `blockers_json='[]'`,
  `review_status='approved'`, and `usage_status='primary'` on their new
  Phase 500 paths. Each former model path has exactly one approved primary
  row; none remains a duplicate group.
- `PRAGMA integrity_check` returned `ok`; `PRAGMA foreign_key_check` returned
  no rows.
- `git diff --check` passed. TypeScript remains at the known baseline three
  errors in `phase346-jinhao-x450-x750.test.ts` and
  `tests/migration/sync-local-catalog-to-turso.test.ts`; Phase 500 adds none.
- Protected real catalog SHA-256 remained
  `e8c914b89685b399f24a9debae7f5ee9954020c4f0d7dff80bf8f4cf8f4f2299`.

## Boundary

This is a bounded checkpoint package only. It has not been formally migrated
to `data/fpkg.db`, Turso, or production. The full-content goal remains active;
other uncovered content, identity merges, formal migration, deployment, and
full automated/human/online verification are still pending.
