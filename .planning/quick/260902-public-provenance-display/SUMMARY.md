---
status: complete
completed: 2026-09-02
---

# Public source provenance display cleanup

Implemented a reader-facing archive-locator formatter for the shared
encyclopedia renderer. Public source cards retain useful section locators and
evidence-snapshot labels, while suppressing pipeline state and asset-bookkeeping
flags such as `live-source-not-frozen`, `external_archive`,
`raw_source_stored`, and `project-public-asset`.

## Verification

- `git diff --check` passed.
- Biome check passed for the three changed source/test files.
- `pnpm exec tsx --test tests/renderer/components.test.tsx` passed: 17/17.
- `pnpm exec tsc --noEmit` and `pnpm run build` passed.
- Candidate readback for Pilot URUSHI, Pilot 742, Pilot brand, Wancher Dream
  Pen navigation, and YSTUDIO found no internal provenance flags in visible
  text; redirects for `/search` and `/chat` remained intact.
- Public-boundary, publication-gate, evidence-contract, and audit-readiness
  checks passed against the owned candidate checkpoint.

No database files were written.
