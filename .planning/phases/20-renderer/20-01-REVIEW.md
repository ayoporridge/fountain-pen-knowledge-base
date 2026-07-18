---
phase: 20-renderer
plan: 20-01
reviewed: 2026-07-18T15:45:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - scripts/lib/renderer-fixture.ts
  - tests/renderer/entity-page.test.ts
  - src/lib/entity-page.ts
  - .planning/phases/20-renderer/20-01-SUMMARY.md
findings:
  critical: 1
  warning: 0
  info: 0
  total: 1
resolved_findings: 1
resolution_commit: f0c8a96
status: resolved
---

# Phase 20 Plan 20-01: Code Review Report

**Reviewed:** 2026-07-18T15:45:00Z  
**Depth:** standard  
**Files Reviewed:** 4  
**Status:** resolved

## Narrative Findings (AI reviewer)

## Resolved Critical Issues

### CR-01: Remote-only media can re-enter through the image-proxy fallback

**Classification:** BLOCKER  
**File:** `src/lib/entity-page.ts:502-518`

**Issue:** `decodePrimaryMedia` passes the media `id` to `getPublicMediaUrl`. That helper returns `/api/image-proxy?id=...` whenever none of `localPath`, `thumbnailUrl`, or `imageUrl` normalizes to an on-site path. The SQL-side filter treats any non-null `local_path` as sufficient, so a publication-qualified row with `local_path = 'https://remote.invalid/p.jpg'` and a remote `image_url` reaches this decoder and becomes an apparently on-site proxy URL. This violates the Plan 20-01 requirement that primary media have a stable local/on-site path and that remote-only media never be promoted. It will be rendered as the hero image in Plan 20-02.

The focused probe reproduced the fallback directly:

```text
getPublicMediaUrl({ id: "remote-only", localPath: "https://remote.invalid/p.jpg", imageUrl: "https://remote.invalid/p.jpg" })
=> /api/image-proxy?id=remote-only
```

The existing remote-media fixture does not expose this case because it leaves `local_path` null, so the SQL filter removes it before decoding.

**Fix:** Resolve the public path without supplying `id`, or explicitly reject the proxy fallback, and tighten the SQL predicate to require a normalizable local/on-site raw path. Add a regression fixture whose non-null `local_path` is not `public/...` or `/...` and whose URLs are remote-only.

```ts
const publicUrl = getPublicMediaUrl({
  localPath,
  imageUrl,
  thumbnailUrl,
});

if (publicUrl === null) {
  malformed(type, slug, "primary media has no stable on-site URL");
}
```

## Resolution Evidence

- **Resolved by:** `f0c8a96` (`fix(20): CR-01 reject proxy fallback for primary media`).
- `decodePrimaryMedia` no longer supplies the media `id` to `getPublicMediaUrl`, so it cannot synthesize `/api/image-proxy?id=...` when every raw path is remote or malformed.
- The single-snapshot SQL now admits a primary-media row only when at least one raw `local_path`, `thumbnail_url`, or `image_url` has the exact `/...` (but not `//...`) or `public/...` shape understood by the decoder. The existing strict path decoder remains the final fail-closed check for backslashes and control characters.
- The renderer fixture now contains `local_path = 'renderer-not-a-public-path'` paired with `image_url = 'https://remote.invalid/renderer.jpg'`. Before the fix, the focused test failed with `invalid-primary-media-cardinality` after receiving two candidate rows; after the fix, the poisoned row is absent and no proxy URL is returned.
- `pnpm exec tsx --test --test-name-pattern "qualified content" tests/renderer/entity-page.test.ts` passed 4/4, including the new junk-local-path regression.
- `pnpm exec tsc --noEmit` passed.
- `pnpm exec biome check src/lib/entity-page.ts tests/renderer/entity-page.test.ts scripts/lib/renderer-fixture.ts` passed, and `git diff --check` passed for the same three files.
- No Phase 19 wrapper, broad suite, protected/real catalog, remote database, or deployment target was used.

## Original Review Verification Notes

- At review time, `pnpm exec tsx --test --test-name-pattern "qualified content" tests/renderer/entity-page.test.ts` passed 3/3; that original three-test set did not yet cover CR-01.
- The original review did not run Phase 19 wrappers, open the protected catalog, run broad suites, or access production/remote databases.

---

_Reviewed: 2026-07-18T15:45:00Z_  
_Reviewer: gsd-code-reviewer_  
_Depth: standard_  
_Resolved by `f0c8a96`_
