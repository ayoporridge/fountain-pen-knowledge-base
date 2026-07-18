# Phase 20: 百科页面 Renderer - Pattern Map

**Mapped:** 2026-07-18  
**Files analyzed:** 9 new/modified files  
**Analogs found:** 9 / 9（其中 page loader 与 same-AST TOC 只有组合 analog）

## Scope Decision

Phase 20 采用一条实现路径，避免新旧 renderer 并存：

1. 新建一个 `getPublishedEntityPage(type, slug)` server loader，以 `public_entities` 为唯一授权入口，并优先用单条 parameterized SQL/CTE 取得同一 snapshot 的 publication payload。
2. 新建一个纯 props `EncyclopediaShell`，集中 shared header/media/story/nav/sources/canonical/explore；现有 `BrandMuseum`、`ModelArchive` 分别收敛为纯 `BrandFacts` / `ModelFacts` 展示组件。
3. 扩展现有 Markdown pipeline，让一次 AST traversal 同时产出 sanitized HTML 与 headings/IDs；不新增第二套 Markdown parser。
4. 新建独立 `renderer.spec.ts`，只借用现有 disposable server seam 和测试写法；不修改 `publication-gate.spec.ts`、Phase 19 fixture/lifecycle、migration/readiness 或真实库存。

## File Classification

| New/Modified File | Action | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|---|
| `src/lib/entity-page.ts` | create | service/query loader | request-response + transform | `src/lib/public-visibility.ts`, `src/lib/library.ts`, migration 031 qualified views | role/data-flow composite |
| `src/lib/markdown.ts` | modify | utility | transform | existing `renderMarkdown` + `rehypeNormalizeHeadings` | exact role, feature extension |
| `src/components/library/EncyclopediaShell.tsx` | create | server component | transform | current detail route + `src/app/exhibits/[slug]/page.tsx` | role-match |
| `src/components/library/BrandMuseum.tsx` | modify | component | transform | current `BrandMuseum` | exact; pure-props replacement |
| `src/components/library/ModelArchive.tsx` | modify | component | transform | current `ModelArchive` | exact; pure-props replacement |
| `src/app/[type]/[slug]/page.tsx` | modify | route/controller | request-response | current `EntityPage` / `generateMetadata` | exact |
| `src/app/globals.css` | modify | config/style | transform | existing Warm Pen Atlas tokens, panel/prose/responsive rules | exact |
| `tests/e2e/renderer.spec.ts` | create | test | request-response + fixture CRUD | `publication-gate.spec.ts`, `site-quality.spec.ts`, `article-quality.spec.ts` | role/data-flow composite |
| `playwright.config.ts` | modify | test config | event-driven orchestration | existing desktop/mobile projects | exact |

## Reference-only Files — Do Not Modify in Phase 20

| File | Reuse | No-edit reason |
|---|---|---|
| `src/lib/public-visibility.ts` | `public_entities`, `publicEntityFilter` semantics | Do not create a second eligibility/publication predicate. |
| `src/lib/public-media.ts` | `publicMediaFilter` | Renderer adds entity/primary/attribution constraints in its own query. |
| `src/lib/media-url.ts` | `getPublicMediaUrl` | URL formatting is not media qualification. |
| `src/lib/library.ts` | Safe SQL fragments only | Existing helpers have weaker contracts or limits; components must not keep calling them. |
| `src/lib/db.ts` | `queryOne` / connection guard | Selected default is one SQL statement, so no DB infrastructure edit is needed. If implementation proves that impossible, plan a separate explicit read-transaction helper rather than assuming batched reads share a snapshot. |
| `src/components/MarkdownHtml.tsx` | Existing sanitized HTML boundary | Reuse with already-rendered story HTML; never bypass the server sanitizer. |
| `tests/e2e/publication-gate.spec.ts` | Test structure and 15-model assertion as analog | Phase 19 lifecycle regression is frozen; run it only as focused regression. |
| `tests/e2e/site-quality.spec.ts` | Overflow helper only | Do not claim its default no-brand/no-pen fixture validates the renderer. |
| `migrations/031_evidence_readiness_v2.sql` | Qualified facts/views | No migration in renderer scope. |

## Pattern Assignments

### `src/lib/entity-page.ts` — service/query loader

**Primary analogs:**

- `src/lib/public-visibility.ts:96-134` — public filter and bound slug lookup.
- `src/lib/library.ts:440-508,521-542` — evidence-backed specs and all published models.
- `migrations/031_evidence_readiness_v2.sql:448-597,848-877,1243-1279` — source dependency, qualified source/field/claim/media, and public authorization views.
- `src/lib/db.ts:594-608` — `queryAll` / `queryOne` call convention.

**Authorization/import pattern** (`public-visibility.ts:111-134`):

```ts
import { queryOne } from "@/lib/db";

return await queryOne(
  `SELECT ...
   FROM public_entities
   WHERE type = ? AND slug = ?`,
  [type, slug],
);
```

Apply exactly once at the root of the loader. `public_entities` proves publication; renderer invariants only reject impossible partial payloads.

**Expected story pattern** (`library.ts:1088-1098`, adapted):

```sql
JOIN stories story
  ON story.entity_id = pe.id
 AND story.status = 'published'
 AND story.story_type = CASE pe.type
   WHEN 'brand' THEN 'brand_story'
   ELSE 'model_story'
 END
```

Select the complete `story.body_md`. Count must be exactly one. Never call `getStoriesForEntity` (`library.ts:268-285`): it accepts `reviewed` and excludes the two story types required here.

**Evidence-backed field pattern** (`library.ts:440-508`, enhanced):

```sql
JOIN publication_v2_field_evidence evidence
  ON evidence.model_entity_id = pe.id
 AND evidence.model_spec_id = spec.id
JOIN citations citation ON citation.id = evidence.citation_id
JOIN source_items item ON item.id = evidence.source_item_id
JOIN publication_v2_qualified_source_items qualified
  ON qualified.source_item_id = item.id
```

Important live-code name: the actual migration view is `publication_v2_field_evidence` (`031...sql:513-558`), not `publication_v2_qualified_field_evidence`. Return display value plus human-readable source title/URL and `evidence_locator`; do not expose claim/evidence IDs or internal enum values.

**All published models pattern** (`library.ts:521-542`):

```sql
FROM public_entities public_brand
JOIN entity_links relation
  ON relation.target_id = public_brand.id
 AND relation.link_type = 'made_by'
JOIN public_entities public_pen
  ON public_pen.id = relation.source_id
 AND public_pen.type = 'pen'
WHERE public_brand.id = ?
  AND public_brand.type = 'brand'
GROUP BY public_pen.id
ORDER BY public_pen.name, public_pen.slug
```

No business `LIMIT`; `count` is `models.length`. For a model, return every public `made_by` brand candidate and assert length exactly one.

**Qualified source pattern** (`031...sql:448-511`):

```sql
FROM publication_source_item_entities owner
JOIN publication_v2_qualified_source_items qualified
  ON qualified.source_item_id = owner.source_item_id
JOIN source_items item ON item.id = qualified.source_item_id
JOIN source_registry registry ON registry.id = item.source_id
WHERE owner.entity_id = ?
```

Deduplicate by canonical URL/source item using stable ordering. Do not substitute `getEntityReferences` (`library.ts:545-572`), which is only approved-reference + `LIMIT`.

**Primary media pattern** (`public-media.ts:38-61`, `031...sql:848-877`):

```sql
JOIN publication_v2_qualified_primary_media qualified_media
  ON qualified_media.media_id = media.id
 AND qualified_media.entity_id = pe.id
WHERE media.entity_id = pe.id
  AND media.usage_status = 'primary'
  AND /* publicMediaFilter("media") */
  AND NULLIF(TRIM(media.attribution_text), '') IS NOT NULL
```

The qualified view alone permits source-URL-only rows and does not require attribution. Intersect it with `publicMediaFilter`, require a stable local/on-site image path, public license, visible attribution, and entity ownership. Never call `getPrimaryProductImage` (`library.ts:878-896`): it promotes gallery media and silently selects one row.

**View-model/invariant seam:**

```ts
export type PublishedPageData = BrandPageData | ModelPageData;

export async function getPublishedEntityPage(
  type: "brand" | "pen",
  slug: string,
): Promise<PublishedPageData | null>;
```

- Non-public type/slug: `null`.
- Public row with summary outside 60–160 Chinese characters, expected story count != 1, required qualified source/media absent: explicit server invariant; route fails closed.
- Brand: timeline >= 2 and models >= 1.
- Model: canonical brand count == 1; only qualified spec fields; variants optional but must be approved + qualified source/scope.
- Prefer one parameterized SQL statement with CTE/JSON aggregation so all visible facts share one SQLite snapshot. Do not rely on several `queryAll` calls or internal read batching to imply snapshot consistency.

**Test seam:** export only the public loader and stable view-model types. Contract tests seed invalid rows and assert `null`, invariant rejection, or exact omission without injecting a second authorization predicate.

---

### `src/lib/markdown.ts` — one AST, HTML + headings

**Analog:** current `rehypeNormalizeHeadings` (`markdown.ts:652-686`) and `renderMarkdown` pipeline (`markdown.ts:903-996`).

**Keep this order:**

```ts
const result = await remark()
  .use(remarkGfm)
  .use(remarkWikiLink, ...)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeImageRows)
  .use(rehypeImageFigures)
  .use(rehypeNormalizeHeadings)
  .use(rehypeSanitizeUrls)
  .use(rehypeStringify)
  .process(processed);
```

Insert a heading-ID/collection plugin after normalization and before stringify. The same traversal must assign IDs and collect navigation data:

```ts
export type StoryHeading = {
  id: string;
  level: 2 | 3;
  label: string;
};

export type RenderedMarkdownDocument = {
  html: string;
  headings: StoryHeading[];
};
```

Slugging must be deterministic, preserve usable Chinese text, and append `-2`, `-3` for duplicates. Preserve the existing URL/image sanitation. Do not add a regex TOC parser or a second Markdown parse; do not assume `rehype-slug`/`github-slugger` is installed.

**Test seam:** duplicate Chinese headings yield stable unique IDs; body contains no H1; first body heading is H2; TOC hrefs exactly match emitted IDs.

---

### `src/components/library/EncyclopediaShell.tsx` — shared pure renderer

**Analogs:**

- `src/app/[type]/[slug]/page.tsx:600-622` — semantic breadcrumb.
- `src/app/exhibits/[slug]/page.tsx:21-31,46-55,87-103` — small server page loading once and passing pure props.
- `src/components/MarkdownHtml.tsx:30-36` — sanitized `.prose-body` HTML boundary.

**Composition pattern:**

```text
EncyclopediaShell
├── EntityHeader
├── PrimaryMedia
├── SectionNav
├── StoryArticle
├── BrandMuseum | ModelArchive
├── QualifiedSources
├── CanonicalRelations
└── ExploreMore
```

All children receive `PublishedPageData`; none accepts an entity ID in order to query again. DOM order follows mobile/assistive reading order, with desktop grid applied only through CSS. `StoryArticle` renders the pre-sanitized document through `MarkdownHtml`.

**Conditional rendering pattern:**

```tsx
{data.variants.length > 0 ? <Variants items={data.variants} /> : null}
```

Required invariants are resolved before rendering. Optional empty modules and their nav anchors both return `null`; never render an empty panel or “暂无/未知/待补充”.

**SectionNav pattern:** derive from `story.headings` plus actually-present modules. Omit when only one navigable item exists. Desktop rail and mobile chips use the same links. If active-section tracking is added, isolate only that behavior as a small client component; content remains server rendered.

**Primary media pattern:** semantic `<figure>`, intrinsic dimensions, `object-fit: contain`, entity-specific alt, visible attribution/license/source. No gallery/generic/illustration/broken-image fallback and no generic Open Graph image.

**No-go from current route:** hard-coded nav (`page.tsx:497-513`), hero placeholder (`737-799`), brand/pen story exclusion (`834-880`), and canonical facts in sidebar (`884-955`).

---

### `src/components/library/BrandMuseum.tsx` — pure BrandFacts

**Analog:** current file, especially model list (`35-56`) and timeline composition (`64-79`).

**Convert, do not coexist:**

```tsx
export function BrandMuseum({
  timeline,
  models,
}: Pick<BrandPageData, "timeline" | "models">) {
  return (...);
}
```

Remove the async DB block (`14-23`) and source/identifier ownership from this component. Reuse the two-column list shape but add `min-h-11`, natural wrapping, semantic list markup, and exact heading `全部型号（{models.length}）`.

Do not copy model empty state (`57-60`) or source empty state (`97-103`). The loader already guarantees at least one model and two qualified timeline nodes; count must equal rendered link count. Timeline stays a single semantic `<ol>` at all widths with visible source link per event.

**Test seam:** 15 fixture models produce heading count 15 and exactly 15 unique `/pen/...` links; no carousel, pagination, top-12, load-more, or recommendation links inside canonical count.

---

### `src/components/library/ModelArchive.tsx` — pure ModelFacts

**Analog:** current spec grid (`78-116`) and canonical `next/link` (`103-109`).

**Convert, do not coexist:**

```tsx
export function ModelArchive({
  specs,
  variants,
}: Pick<ModelPageData, "specs" | "variants">) {
  return (...);
}
```

Remove component queries (`32-47`), `prepareSourceMaterial` (`23-30`), legacy source body (`124-164`), and every empty-state branch (`117-121,182-190`). Canonical brand is rendered once by the shared header/relation zone, not duplicated inside specs.

Each visible spec uses semantic `<dl>`/cards and shows label, value, `来源：{source title}` plus optional locator. Treat numeric `0` as present; omit only `null`, empty string, or unqualified fields. Qualified variants are a vertical list and the whole section is absent when empty.

**Test seam:** unqualified spec/variant sentinels absent; field source/locator visible; model page contains exactly one canonical brand relation even when Explore has other brand links.

---

### `src/app/[type]/[slug]/page.tsx` — thin route + metadata

**Analog:** current canonical redirect/fail-closed flow (`301-308`):

```tsx
const canonicalPath = getCanonicalEntityPath(type, slug);
if (canonicalPath) permanentRedirect(canonicalPath);

const data = await getPublishedEntityPage(type, slug);
if (!data) notFound();
```

For `brand`/`pen`, route, `generateMetadata`, JSON-LD and renderer all consume the same loader result. Preserve current behavior for other entity types without broad refactor.

Metadata uses `data.summary` and the exact qualified primary image. If no qualified image survives the loader, omit `images`; remove generic library hero fallback (`97-115`). Keep current safe JSON-LD serialization pattern (`584-599`) and semantic breadcrumb (`600-622`).

Delete brand/pen ownership of `preparePublicBody`, weak source/spec/image calls, `LIMIT 1` canonical brand query (`417-430`), `penSourceBody`, placeholder hero, and hard-coded section list. Do not add client fetch or hydration-dependent content.

**Test seam:** GET response HTML already contains summary, full story, sources and canonical relation; invalid renderer invariant uses existing fail-closed route/error behavior and never leaks stack/review state.

---

### `src/app/globals.css` — Warm Pen Atlas renderer styles

**Reuse exactly:**

```css
/* globals.css:187-208 */
.library-panel {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-raised);
}

.reading-measure {
  min-width: 0;
  width: 100%;
  max-width: 72ch;
}
```

Also reuse tokens/dark remap (`5-95`), focus ring (`341-347`), prose wrapping (`389-463`), local `pre` overflow (`476-491`), responsive images (`493-499,606-624`), local table overflow (`515-542`), and reduced motion (`926-955`).

Add only renderer-specific rules needed by the UI contract: 1152px max container; `>=1024px` 8/4 grid + 32px gap; `<1024px` one column + horizontally scrolling mobile nav; sticky desktop TOC at 96px; heading `scroll-margin-top:96px`; all grid children `min-width:0`; URL/caption/model wrapping.

No literal light-only palette, page-level horizontal scrolling, reveal animation dependency, hover-only citations, or decorative card movement.

---

### `tests/e2e/renderer.spec.ts` — independent renderer fixture

**Analogs:**

- `publication-gate.spec.ts:1-18,170-215` — imports, parameterized fixture inserts, owned-prefix cleanup.
- `publication-gate.spec.ts:469-512` — serial describe, explicit env guard, setup/cleanup.
- `publication-gate.spec.ts:647-699` — 15-model/count/canonical-brand assertions.
- `site-quality.spec.ts:89-95` — page overflow assertion.
- `article-quality.spec.ts:176-207` — `.prose-body`, one H1 and heading-level checks.

**Fixture lifecycle pattern** (adapted; do not import/extend Phase 19 lifecycle fixture):

```ts
test.describe("renderer contract", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    // Require the explicit disposable local FPKG_DATABASE_URL.
    // Seed only renderer-* IDs and PAGE-01..08 sentinels.
  });

  test.afterAll(async () => {
    // Delete only renderer-* rows, close the client, verify cleanup.
  });
});
```

Do not import `seedQualifiedPublicationFixture`, alter `publication-gate.spec.ts`, or depend on its test order/lifecycle. The renderer fixture must own distinct IDs/slugs and include: brand + 15 models, model, exact expected stories, legacy/deprecated sentinels, 2+ timeline events, qualified field evidence/variants/sources/media, deliberately unqualified rows, and optional-empty case.

**Overflow pattern** (`site-quality.spec.ts:89-95`):

```ts
const dimensions = await page.evaluate(() => ({
  viewport: document.documentElement.clientWidth,
  page: document.documentElement.scrollWidth,
}));
expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
```

**Required test groups / grep seams:**

- `page loader`: non-public null; expected story 0/2 invariant; canonical brand 0/2 invariant; 15 models exact.
- `qualified content`: legacy/deprecated/unqualified sentinels absent; every visible spec has evidence source; gallery/remote/missing-attribution media absent.
- `encyclopedia content`: summary 60–160, full story/sections, one H1, TOC IDs, timeline/models/specs/sources.
- `evidence modules`: optional module and nav item absent; no `暂无|未知|待补充`; exact hero attribution/license/source.
- mobile project: page-level no overflow, local table/pre/nav scroll, 44px targets, focus and reduced-motion behavior.

Use server response HTML assertions for progressive rendering; fixture screenshots/evidence prove only the renderer, never real 305-row publication.

---

### `playwright.config.ts` — expose renderer to both projects

**Analog:** desktop/mobile project definitions (`20-40`). Current mobile project is limited to:

```ts
// playwright.config.ts:31-33
{
  name: "mobile",
  testMatch: /site-quality\.spec\.ts/,
}
```

Extend only `testMatch` so `renderer.spec.ts` runs under mobile while preserving existing viewport/touch/user-agent settings, for example:

```ts
testMatch: [
  /site-quality\.spec\.ts/,
  /renderer\.spec\.ts/,
],
```

Do not change or run the Phase 19 monolithic regression wrapper. The existing config’s narrow `--serve-e2e` mode may remain the disposable server provider; renderer rows/lifecycle stay isolated inside the new spec. Do not add renderer cases to `publication-gate.spec.ts`.

## Shared Patterns

### Public authorization

**Source:** `src/lib/public-visibility.ts:96-134`, migration 031 `public_entities:1243-1279`  
**Apply to:** page loader, canonical relations, wiki-link targets, sources/media owner checks.

`public_entities` is the authorization boundary. Never reproduce publication status/hash/readiness SQL in renderer code.

### Parameterized SQL and snapshot

**Source:** `src/lib/db.ts:594-608`  
**Apply to:** all loader inputs.

Slug, type and IDs are bound parameters. Prefer one statement. Never concatenate slug/type into SQL and never assume several independent helpers share a snapshot.

### Error handling

**Source:** current route `notFound()` pattern (`page.tsx:301-308`).  
**Apply to:** missing public rows and required invariant mismatch.

Public response is existing 404/error behavior; diagnostics stay server-side. Optional collections are omitted, not errors.

### Pure server rendering

**Source:** `src/app/exhibits/[slug]/page.tsx:21-31,46-55,87-103`, `MarkdownHtml.tsx:30-36`.  
**Apply to:** shell, story, facts, sources and canonical links.

Only active TOC tracking may be a client island. Required content must exist before hydration.

### External links

**Source:** current detail media/source links (`page.tsx:770-776`, `ModelArchive.tsx:150-158`).  
**Apply to:** source cards, field evidence, timeline citations, image source.

Use readable link text plus `target="_blank" rel="noopener noreferrer"`, visible underline/focus, and wrapping.

## Reuse vs Replacement Matrix

| Existing symbol | Decision | Reason |
|---|---|---|
| `getPublicEntityBySlug` / `publicEntityFilter` | reuse semantics | Correct authorization truth. |
| `getBrandPublicModels` SQL | reuse equivalent query | Correct public/full/stable relationship query. |
| `getModelSpec` | copy and strengthen | Correct field gating direction, missing visible evidence/source metadata. |
| `getTimelineForEntity` | copy and strengthen | Stable order, but approved source is weaker than qualified source and default limit is wrong. |
| `getStoriesForEntity` | reject | Excludes required story types and accepts `reviewed`. |
| `getModelVariants` | replace | No public owner, qualification or scope gate. |
| `getEntityReferences` | replace for renderer | Approved reference + limit is not the publication dependency set. |
| `getPrimaryProductImage` | replace | Gallery fallback and `LIMIT 1` violate exact primary media contract. |
| `BrandMuseum` / `ModelArchive` DB reads | remove | Page must consume one view model/snapshot. |
| `BrandMuseum` list/timeline and `ModelArchive` cards | reuse presentation shape | Add semantic markup, evidence, touch/wrap rules; remove empty states. |
| `renderMarkdown` sanitation | reuse/extend | Same pipeline must own HTML and heading IDs. |
| hard-coded `SectionNav` | replace | Must derive from same story AST and present modules. |
| generic hero/social image | remove | Exact entity media only. |

## No Analog / Novel Seams

No current file implements these contracts exactly; planner must use the research/UI contract while building on the analogs above:

| Seam | Closest partial analog | Required implementation |
|---|---|---|
| Current-public whole-page snapshot | `getPublicEntityBySlug` + individual `library.ts` helpers | One statement/explicit read snapshot returning the discriminated page model. |
| Same-AST heading IDs + TOC | `rehypeNormalizeHeadings` | One plugin traversal that assigns IDs and returns headings with sanitized HTML. |
| Entity-exact attributed primary hero | qualified media view + `publicMediaFilter` | Intersection plus primary/entity/stable-path/attribution invariants; no fallback. |
| Desktop rail + mobile TOC chips | current horizontal `SectionNav` | Same server links, responsive presentation, 96px offsets and optional active client island. |

## No-go Patterns

1. Reading `entities.body_md` or deprecated/reviewed story when the expected published story is absent.
2. Gate query followed by independently timed component SQL queries.
3. Treating `approved` as equivalent to Phase 19 `qualified`.
4. Gallery, remote-only, generic library hero, illustration, or `site-original` license as proof of exact primary media.
5. `LIMIT 1` to hide duplicate story/media/canonical-brand rows.
6. Pagination, carousel, random/recommended top-N, or `加载更多` for canonical brand models.
7. Public `暂无/未知/待补充/—` placeholders for optional data.
8. Regex/line-based story cleanup or a second Markdown/TOC parse.
9. Client fetch, accordion, fixed-height story, line clamp, or hydration gate for required content.
10. Page-level horizontal scrolling; only `table`, `pre`, and mobile nav may scroll locally.
11. Editing or importing Phase 19 lifecycle fixture, migration/readiness code, or the protected real catalog.
12. Running `pnpm test:e2e` or the Phase 19 monolithic wrapper during Phase 20 task loops.

## Focused Verification Commands

```bash
pnpm exec playwright test tests/e2e/renderer.spec.ts --project=desktop --grep "page loader"
pnpm exec playwright test tests/e2e/renderer.spec.ts --project=desktop --grep "qualified content"
pnpm exec playwright test tests/e2e/renderer.spec.ts --project=desktop
pnpm exec playwright test tests/e2e/renderer.spec.ts --project=mobile
pnpm exec tsc --noEmit
pnpm biome check <phase-20-changed-files>
```

Final focused regression only:

```bash
pnpm exec playwright test tests/e2e/publication-gate.spec.ts --project=desktop
```

Do not run monolithic tests from pattern mapping/planning.

## Metadata

**Analog search scope:** `src/app/[type]/[slug]`, `src/components`, `src/lib`, `migrations/031_evidence_readiness_v2.sql`, focused E2E/config files  
**Strong analog groups:** 5 (authorization/query, qualified facts/media, server UI, Markdown/CSS, renderer E2E)  
**Pattern extraction date:** 2026-07-18  
**Phase 19 boundary:** reference-only; no harness, lifecycle, readiness, migration, or real-inventory edits
