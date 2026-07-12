---
status: in_progress
created_at: 2026-07-02
mode: manual-gsd-fallback
---

# Reader-Facing Content Cleanup

The old `gsd-sdk` command is not available in this environment. The task started
as a manual GSD fallback, then `open-gsd/gsd-core` was installed for Codex; the
working CLI entry is `~/.codex/gsd-core/bin/gsd-tools.cjs`.

## Objective

Remove remaining agent-facing and source-process phrasing from public reader
pages, especially brand pages, pen introductions, and nib/spec pages.

## Scope

- The PenBBS gold nib / 大明尖 page reported by the user.
- All `brand` stories that still read like generic analysis scaffolding.
- All `pen` introductions that use source-led phrasing such as `公开资料提到...说明...`.
- Nib pages that present internal classification language instead of reader-facing context.
- Local SQLite content and remote Turso content used by the live Vercel site.

## Success Criteria

- The reported PenBBS page reads like a reader-facing entry about PenBBS, related
  models, gold nib / 大明尖 context, and buying/reading judgment.
- The exact HongDian 6013 awkward sentence is replaced with natural reader prose.
- Full scan of public `brand`, `pen`, and `nib` story/entity text no longer finds
  the old agent-facing phrases targeted by this task.
- Local and remote databases are updated by the same script.
- Key live pages are reloaded and verified after sync.
