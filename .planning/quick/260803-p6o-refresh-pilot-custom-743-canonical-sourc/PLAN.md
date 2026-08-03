# Quick Task: Refresh Pilot Custom 743 canonical sourced content

## Scope

- Reuse the existing Pilot Custom 743 entity; do not create a duplicate model.
- Replace the shallow public copy with sourced Chinese content covering identity, No.15 nib platform, c/c filling, current Japanese SKU scope, nib lineup, sibling-model boundaries, care, selection and second-hand checks.
- Record the official FKK-3000R-B-M product card, support/warranty/manual/category pages, existing series/history sources and the site-original factual SVG through the normal curated pack path.
- Preserve the Pilot brand relation and reverse navigation link, and publish only through `recordEntityContentReview` plus `publishEntity`.
- Apply and replay only on a persistent owned checkpoint copy; never write `data/fpkg.db`.

## Acceptance

- [x] Existing entity `qYCN9Mhl_0UC` remains `pen` / `pilot-custom-743` / `百乐 Pilot Custom 743`.
- [x] Body is at least 8,000 Unicode characters and contains the official product-code, nib, filling, dimensions, price, care, sibling and media-boundary details.
- [x] Pack has 11 independent source groups and 15 variants: one edition group plus 14 official market-SKU nib entries.
- [x] Publication review gate passes with fact/language/media/publication approvals, contract version 3, no readiness blockers and a published public entity.
- [x] Pilot `made_by` and brand reverse navigation relations are unambiguous.
- [x] First apply publishes and replay returns `noop` without changing the publication row.
- [x] The real catalog snapshot remains unchanged.

## Verification commands

```text
pnpm exec tsx --test tests/content/phase407-pilot-custom-743-refresh.test.ts
pnpm exec tsx scripts/apply-phase407-pilot-custom-743-refresh.ts --database <owned-checkpoint> --owned-root <owned-root> --protected-catalog data/fpkg.db --reviewer phase407-pilot-custom-743-refresh
pnpm exec biome check scripts/apply-phase407-pilot-custom-743-refresh.ts tests/content/phase407-pilot-custom-743-refresh.test.ts
pnpm exec tsc --noEmit
git diff --check
```
