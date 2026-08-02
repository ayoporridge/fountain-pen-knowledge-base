# Unified pending-pack integration — evidence

## Local owned copy and formal migration

- Sequentially replayed `scripts/apply-phase339-esterbrook-j-series-content.ts` through `scripts/apply-phase367-pilot-capless-families.ts` into `checkpoint/fpkg-copy.db`; every package returned published outcomes and no identity conflict.
- Integrated copy: 948 entities, 663 publications, 657 audited brand/pen rows; 635 public active rows; 22 retired backlog rows.
- Coverage audit: 115/119 brands ready and 520/538 pens ready; the 4 brand + 16 pen gaps are retired legacy rows, not public blockers.
- Entity quality: duplicate groups 0, suspicious pen articles 0, thin entities 0, broken links 0, public blockers 0, published blockers 0.
- Library contract: sources 2,221; source items 3,926; claims 3,357; citations 9,573; stories 685; media 953; aliases 2,178; contract passed.
- Evidence readiness/publish contract passed; local media audit scanned 650 public assets, 650 healthy, 0 failed.
- Before formal local migration: real/protected hash `526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`.
- Formal local migration: `data/fpkg.db` now hash `c281ffbc41205cf0060b14cbfdb3563c04bc4ab94631ce03bd76a79c72d2b963`; `PRAGMA integrity_check` returned `ok`; backup is `checkpoint/formal-local-backup/fpkg-before-formal-migration.db`.

## Turso migration

- The original full-table dry-run consumed 362.8M Starter rows-read and was stopped before any write. No hanging process remains.
- Added an opt-in, migration-specific `--assume-stable-identities` path: remote schema + primary/UNIQUE key columns only, stable entity-ID guard, natural-key mappings, remote/local UNIQUE intersection for upsert, 100-row bounded transactions. The default full diff path remains unchanged.
- Bounded dry-run passed with 51,954 local source rows, 948 remote entity primary keys, 1,226 natural-key mappings, and 574 matching publication snapshots; no remote writes in the dry-run.
- Formal bounded sync completed: `Remote upsert rows: 46055`; `Publication restore: published=66 skipped=574 non-published=23`; protected local snapshot unchanged.
- Direct remote readback: `entities=948`; `entity_publications`: `published=640`, `retired=23`; `public_entities=902` with `brand=115`, `pen=520`, `article=255`, `concept=10`, `nib=2`.
- Full `public_entities` ID/slug/type set comparison: local 902, remote 902, local-only 0, remote-only 0.
- Full publication snapshot comparison (`entity_id,status,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version`): local 663, remote 663, local-only 0, remote-only 0.
- Every current local approved fact/language/media review key was present remotely; remote retains 9 historical approved review keys absent from the local snapshot and no local current review was missing.
- The remote readiness view is too expensive for a full aggregation on the current Turso resource (`SQLITE_NOMEM` even with entity filter); this is recorded as an outstanding online-readback limitation, not reported as a pass.

## Not complete

This evidence covers this migration batch only. The overall content-repair goal remains active: Fly deployment/login, full human traversal, production online recheck, and additional gap research/coverage are still required.
