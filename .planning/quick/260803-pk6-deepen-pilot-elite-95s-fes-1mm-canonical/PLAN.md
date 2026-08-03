# Quick Task: Deepen Pilot Elite 95S FES-1MM canonical sourced content

## Scope

- Reuse the existing Pilot Elite 95S entity `3bijtqhOXplP`; do not create a duplicate or merge historical Elite samples into it.
- Replace the short public copy with natural Chinese content covering FES-1MM identity, short/capped writing geometry, EF/F/M SKU variants, 14K nib, cartridge/CON-40 filling, maintenance, travel, history and second-hand boundaries.
- Use the current Japanese Pilot Web Catalog card, lineup/category, Japanese support page, manual, official history, international product list, CUSTOM history, professional review and the existing site-original factual SVG.
- Publish only through `recordEntityContentReview` and `publishEntity` on an owned checkpoint copy.

## Acceptance

- [x] Existing entity remains `pen` / `pilot-elite-95s` / `百乐 Pilot Elite 95S`.
- [x] Body is at least 8,000 Unicode characters and keeps current EF SKU numbers scoped to the Japanese card.
- [x] Pack contains 10 independent source groups and 4 variants: one edition group plus EF/F/M market SKU entries.
- [x] Fact/language/media/publication reviews pass; contract version 3 readiness has no blockers and the public row is published.
- [x] Pilot `made_by` and reverse brand-navigation relations are unambiguous.
- [x] First apply publishes and replay returns `noop` with the same content hash.
- [x] Real `data/fpkg.db` remains unchanged.

## Verification commands

```text
pnpm exec tsx --test tests/content/phase408-pilot-elite-95s-refresh.test.ts
pnpm exec tsx scripts/apply-phase408-pilot-elite-95s-refresh.ts --database <owned-checkpoint> --owned-root <owned-root> --protected-catalog data/fpkg.db --reviewer phase408-pilot-elite-95s-refresh
pnpm exec biome check scripts/apply-phase408-pilot-elite-95s-refresh.ts tests/content/phase408-pilot-elite-95s-refresh.test.ts
pnpm exec tsc --noEmit
git diff --check
```
