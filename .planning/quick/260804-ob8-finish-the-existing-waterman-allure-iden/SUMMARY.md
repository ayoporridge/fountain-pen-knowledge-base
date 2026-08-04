---
phase: 501
slug: finish-the-existing-waterman-allure-iden
status: complete
---

# Phase 501 summary

## Delivered

Finished the existing Waterman Allure identity merge on an owned checkpoint:

- `phase83-pen-waterman-allure` remains the published canonical survivor.
- `p244WatermanAllure` remains retired with `blockers_json='["taxonomy_merged"]'`.
- The donor's preserved factual media row
  `curated-media-0af25cd3e41db964d69131c1` is now `hidden`, so it no longer
  participates in public primary-media selection or duplicate-path counts.
- The canonical media row, source item, aliases, maker links, merge lineage,
  and permanent redirect were not rewritten or deleted.
- Any donor retirement transition is routed through
  `setEntityPublicationStatus`; this phase contains no direct publication
  status assignment.

## Evidence

- Targeted test: `tests/content/phase501-waterman-allure-identity-finish.test.ts`
  — 1/1 passed. It covered remote-selection rejection, owned-copy authority,
  donor/canonical identity, lineage and redirect preservation, media hide,
  canonical content-hash stability, replay, integrity/FK checks, and the
  protected catalog snapshot.
- CLI first apply returned `changed: true`, with canonical hash
  `sha256:v3:d7b4c51cdda9eb78539643782aad8edf28b13beb86103d83fb8b695227e27cb7`.
- CLI replay returned `changed: false` with the same canonical hash.
- Readback: donor `retired`/`taxonomy_merged`, canonical `published`/`[]`,
  old route permanently redirects to `/pen/waterman-allure`, and the former
  duplicate path has exactly one approved primary row.
- `PRAGMA integrity_check` returned `ok`; `PRAGMA foreign_key_check` returned
  no rows.
- Biome passed for the script and test; `git diff --check` passed. TypeScript
  still reports only the known baseline three errors in
  `phase346-jinhao-x450-x750.test.ts` and
  `tests/migration/sync-local-catalog-to-turso.test.ts`; Phase 501 adds none.
- Protected real catalog SHA-256 remained
  `e8c914b89685b399f24a9debae7f5ee9954020c4f0d7dff80bf8f4cf8f4f2299`.

## Boundary

This is a bounded local identity/media repair only. It has not been formally
migrated to `data/fpkg.db`, Turso, or production. The full-content goal remains
active; uncovered brand/model content, remaining identity/media audits, formal
migration, deployment, and full automated/human/online verification are still
pending.
