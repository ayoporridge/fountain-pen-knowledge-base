---
name: formally-migrate-the-verified-phases-493-through-503
description: Formally migrate the verified phases 493 through 503 checkpoint into the local catalog
status: complete
created: 2026-08-04
---

# Plan: formally migrate verified 493–503 checkpoint

## Scope

- Use the already verified checkpoint from `.planning/quick/260804-oek-integrate-committed-phases-493-through-5/checkpoint/catalog.db` as the only replacement source.
- Capture the exact pre-migration `data/fpkg.db` main/WAL/SHM snapshot and a recoverable backup under this task directory.
- Atomically replace the local catalog only after verifying the checkpoint and source hashes, then restore the checkpoint sidecars as applicable.
- Run post-migration integrity, contract, quality/readiness, publication, and media checks; keep Turso and production untouched.

## Safety

- Do not write to the source checkpoint during migration.
- Do not stage or modify unrelated research files, `.next-phase*` directories, the protected Montblanc quick directory, or other quick checkpoints.
- If the source hash or protected local snapshot changes before replacement, stop without changing `data/fpkg.db`.

## Acceptance

1. Backup exists and contains the exact pre-migration main database and any existing sidecars.
2. Post-migration local main hash equals the verified checkpoint hash; integrity and FK checks pass.
3. Post-migration content/readiness/library/publication checks reproduce the checkpoint evidence and show no new blockers.
4. A summary records the remaining 22-record readiness backlog and explicitly keeps the full global goal active.
