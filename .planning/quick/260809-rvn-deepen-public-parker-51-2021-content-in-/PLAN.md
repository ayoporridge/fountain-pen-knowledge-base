---
name: deepen-public-parker-51-2021-content-in-owned-checkpoint
created: 2026-08-09
status: complete
---

# Deepen Parker 51 (2021) in an owned checkpoint

## Objective

Replace the short, structurally valid body for the existing `派克-parker-51复刻` entity with a source-backed Chinese model page that clearly separates the 2021 modern reissue from vintage Parker 51, covers product facts, history, versions, care, and buying checks, and preserves the existing entity identity and Parker relationship.

## Scope and ownership

- Owned new files: this quick-task plan, a curated data pack, its apply script, its focused test, and a research note if needed.
- Trial database: a caller-owned checkpoint copy under this quick-task directory only.
- Protected: `data/fpkg.db`, all existing untracked research, `.next-phase*`, and unrelated quick-task directories.
- No new generic readiness, Playwright, search, or LLM infrastructure.

## Execution

1. Verify the existing entity ID, slug, brand link, and current content package; do not create a duplicate.
2. Use Parker official product/history/catalogue sources plus one authoritative secondary source only for clearly labeled context.
3. Implement the pack through `recordEntityContentReview` and `publishEntity`, following the existing `CuratedEntityPack` replay pattern.
4. Apply and replay on the owned checkpoint; assert identity, content depth, source/citation coverage, publication, and navigation parity.
5. Run the focused test, TypeScript, formatting/diff checks, and inspect `git status`; stage only owned files and commit atomically.

## Acceptance evidence

- Existing Parker 51 (2021) identity is unchanged and no duplicate is inserted.
- Checkpoint replay is idempotent and the real `data/fpkg.db` hash is unchanged.
- The page contains natural Chinese sections for identity, specifications, 1941/2021 history boundary, variants, filling/nib, maintenance, selection, and source notes.
- Publication review uses the project guard path; no direct `entity_publications` bypass.
