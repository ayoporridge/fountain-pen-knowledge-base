---
status: complete
created: 2026-09-02
---

# Public source provenance display cleanup

## Objective

Keep reader-facing source attribution and archive links while removing internal
pipeline flags from public entity pages.

## Scope

- Normalize `archiveLocator` for the shared encyclopedia source cards.
- Preserve human-readable locator text and evidence-snapshot labeling.
- Add focused renderer regression coverage for internal provenance redaction.
- Run TypeScript, focused renderer tests, build, and a candidate-page readback.

## Guardrails

- No database writes; use the existing owned checkpoint for readback.
- Do not modify or stage unrelated research/checkpoint artifacts.

## Acceptance

- Public HTML contains no `live-source-not-frozen`, `external_archive`,
  `raw_source_stored`, `project-public-asset`, or `site-original` provenance
  flags in the source metadata card.
- Existing archive/evidence link labels and source URLs remain unchanged.
