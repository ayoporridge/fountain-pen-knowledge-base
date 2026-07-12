---
status: complete
completed_at: 2026-07-03
---

# Scan and Repair All Truncated Articles Summary

## Completed

- Added `scripts/audit-truncated-articles.ts` to audit all article entity
  bodies and summaries for `[内容已截断]`, plus suspicious body lengths near the
  old 50KB export boundary.
- Audited both local SQLite and remote Turso: both contain 206 article entities,
  with zero truncation markers and zero near-limit suspicious articles.
- Rebuilt `better-sqlite3` for the current Node runtime so the legacy export
  script can run locally again.
- Updated `scripts/export-to-d1-safe.ts` so oversized `entities.body_md` values
  are exported as split SQL string literals joined with `||`, preserving full
  article bodies instead of truncating them.
- Added `D1_SAFE_OUTPUT_DIR` support to verify exports in a temporary directory
  without touching the existing generated export folder.

## Verification

- Local audit: `articleCount=206`, `markerCount=0`, `nearLimitCount=0`.
- Remote audit: `articleCount=206`, `markerCount=0`, `nearLimitCount=0`.
- Repository scan only finds `[内容已截断]` in repair/audit/export scripts, not in
  article data.
- Temporary D1-safe export completed successfully into
  `/tmp/fpkg-d1-safe-export-test`.
- Temporary export scan found no `[内容已截断]` marker.
- The `japanese-pocket-pens` export statement is split with SQL concatenation,
  preserving the long body instead of cutting it.
- `pnpm lint` passed with existing CSS `!important` warnings.
- `pnpm build` passed.
