# Baseline Audit

Date: 2026-06-24

This audit records the current local experience before product and UI changes. It follows the ChatGPT shared optimization plan's first goal: establish a real baseline before changing behavior.

## Environment

- Branch: `master`
- Local app: `http://localhost:3000`
- Package manager in repo: `pnpm-lock.yaml` exists, scripts were verified with `npm` because existing workflow exposes npm scripts.
- Database: `data/fpkg.db` present
- Framework: Next.js 15.5.18, React 19, Tailwind CSS 4

## Verification Commands

| Check | Result | Notes |
|---|---:|---|
| `npm run build` | PASS | Next build completed and generated 23 app routes. |
| `npm run lint` | FAIL | Biome config schema is pinned to 2.0.0 while installed CLI is 2.4.15. `organizeImports` is now an unknown top-level key. |

## Route Map

| Route | Status | Notes |
|---|---:|---|
| `/` | 200 | Homepage loads. Current ink/reveal animation can leave first screenshot blurred. |
| `/browse` | 200 | Browse page loads. Desktop facets visible; mobile filtering needs a drawer. |
| `/search` | 200 | Search page loads. Search API still needs query escaping and safer highlights. |
| `/compare` | 200 | Compare page loads. Needs end-to-end flow validation from entry cards/buttons. |
| `/chat` | 200 | AI page loads. Grounding/source UX still minimal. |
| `/new` | 307 | Redirects to `/`; public create page is disabled. |
| `/by/nib` | 200 | Dimension route exists through friendly slug. |
| `/by/fill` | 200 | Dimension route exists through friendly slug. |
| `/by/origin` | 200 | Dimension route exists. |
| `/by/price` | 200 | Dimension route exists. |
| `/pen/sheaffer-s-snorkel` | 200 | Entity page loads. Long page depends heavily on remote images. |
| `/pen/sheaffer-s-snorkel/edit` | 200 | Public edit page is still reachable and should be disabled. |

## Data Snapshot

Tables present:

`concept_matches`, `concept_rules`, `entities`, `entities_fts`, `entity_attributes`, `entity_links`, `entity_tags`, `migrations`, `tag_compositions`, `tag_hierarchy`, `tags`, plus FTS support tables.

Entity counts:

| Type | Count |
|---|---:|
| article | 183 |
| brand | 69 |
| concept | 13 |
| fill_system | 14 |
| nib | 34 |
| pen | 269 |

## Screenshots

Desktop and mobile screenshots are stored in `docs/audit/assets/`.

| Area | Desktop | Mobile |
|---|---|---|
| Home | `assets/home-desktop.png` | `assets/home-mobile.png` |
| Search | `assets/search-desktop.png` | `assets/search-mobile.png` |
| Browse | `assets/browse-desktop.png` | `assets/browse-mobile.png` |
| Entity | `assets/entity-desktop.png` | `assets/entity-mobile.png` |
| Graph | `assets/graph-desktop.png` | `assets/graph-mobile.png` |
| Chat | `assets/chat-desktop.png` | `assets/chat-mobile.png` |
| Compare | `assets/compare-desktop.png` | `assets/compare-mobile.png` |

## Major Baseline Issues

1. Visual style is over-decorated for a knowledge product. The current medieval manuscript direction, thin body weight, large letter spacing, shimmer/ink animations, and blurred reveal effects reduce readability.
2. Homepage search is a link-like CTA instead of an actual input. Users cannot search from the hero without first navigating away.
3. Homepage task framing is weak. It does not clearly separate "newbie choosing", "understanding terms", "model comparison", and "graph roaming".
4. Public editing is still partially reachable. `/new` redirects, but entity edit pages still return 200.
5. Search highlight uses a raw query inside `RegExp`, so regex metacharacters can break highlighting or produce unsafe output patterns.
6. Browse mobile lacks an equivalent filter experience. The desktop sidebar is hidden on small screens.
7. Entity pages are very long and hard to scan. They need quick facts, source/trust information, and table-of-contents navigation.
8. Graph area can remain visually blank or ambiguous during load/settling. It needs a stable loading state, legend, controls, and a non-canvas relationship list.
9. Long articles depend on remote image availability. The baseline route can load before images finish, and `networkidle` timed out on an image-heavy entity page.
10. Tooling is slightly inconsistent. The repo has `pnpm-lock.yaml`, while commands are currently verified with npm scripts; Biome config also needs migration.

## First Follow-Up Targets

The next implementation batch should address:

1. Disable public edit pages.
2. Migrate/fix Biome config enough for `npm run lint` to execute.
3. Refresh design tokens toward "Warm Pen Atlas": calmer fonts, readable body weight, reduced decoration, stronger focus states.
4. Replace homepage hero CTA with a real search form and task entry cards.
5. Harden search query escaping and highlight HTML generation.

