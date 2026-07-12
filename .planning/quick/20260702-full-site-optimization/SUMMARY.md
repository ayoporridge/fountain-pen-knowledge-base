---
status: complete
completed_at: 2026-07-02
---

# Full Site Optimization Summary

## Completed

- Fixed concept detail pages by removing the invalid `concept_rules.concept_id`
  lookup path.
- Added chat configuration status handling and disabled the public chat UI when
  AI credentials are not configured.
- Restricted chat retrieval to public entities and changed the prompt to avoid
  unsupported factual claims.
- Added missing sitemap entries for chat, compare, coverage, and dimension pages.
- Corrected library module links for brand, model, and diagrams destinations.
- Fixed brand detail anchors so `#sources` points to real source cards.
- Prioritized entity-specific product images in detail page hero areas and added
  evidence badges.
- Added reading hints for long article/body pages.
- Converted `/by/brand` into a real brand index.
- Expanded mobile dimension navigation.
- Improved compare empty state.
- Marked Bing search placeholders as non-clickable "待补证线索" in source cards.
- Corrected high-risk brand wording in migrations and synced local/remote content
  with `scripts/apply-full-site-optimization-content-fixes.ts`.

## Verification

- `pnpm lint` passed with existing CSS warnings.
- `pnpm build` passed.
- Full `pnpm test:e2e` ran: 41 passed, 12 skipped, 33 failed. Failures are
  concentrated in legacy seed/content expectations and media/story batches, with
  one model caption issue fixed afterward.
- Targeted smoke for this optimization passed 8/8:
  concept page rendering, chat disabled state, sitemap entries, library module
  links, Majohn wording, brand dimension index, model image captions, and Bing
  placeholder rendering.
