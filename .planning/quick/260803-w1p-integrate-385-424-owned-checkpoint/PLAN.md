# Phase 368–425 owned checkpoint integration

## Scope

- Start from the read-only snapshot of `data/fpkg.db`.
- Replay the already-reviewed content packages in this quick: Sailor/HongDian/Jinhao 368–384, Wancher 385–393, Pilot/Waterman 394–409, Aurora/Franklin-Christoph/Platinum/Pelikan 410–421, Wancher/Faber-Castell 422–424, and the brand-depth refresh 425.
- Write only to the caller-owned checkpoint under this directory. Never select Turso or `data/fpkg.db` as the write target.
- Repair only the reverse navigation rows required for the five refreshed brand pages; do not create duplicate entities.

## Verification contract

1. Every phase apply must complete through the existing `recordEntityContentReview`/`publishEntity` path or its narrow brand-only equivalent using the same publication guard.
2. `PRAGMA integrity_check` must return `ok`.
3. Every batch output must be `published`; re-running the same package must be `noop` where replay was tested.
4. `scripts/audit-entity-quality.ts` and `scripts/check-library-contract.ts` must pass on the checkpoint.
5. The protected real catalog snapshot must remain unchanged.

## Explicit boundary

This quick is integration evidence only. It is not formal migration to `data/fpkg.db`, Turso synchronization, production deployment, human traversal, or final online acceptance. The full goal remains active.
