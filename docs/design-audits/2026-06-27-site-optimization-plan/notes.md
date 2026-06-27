# Site Optimization Audit Notes

Date: 2026-06-27
Target: https://fountain-pen-graph.vercel.app/

## Captured Screens

1. `01-home.png` — homepage / product entry
2. `02-browse.png` — browse and filtering
3. `03-pen-detail.png` — pen detail page
4. `04-brand-detail.png` — brand detail page
5. `05-exhibit-detail.png` — exhibit detail page
6. `06-article-detail.png` — article detail page
7. `07-sources.png` — source index
8. `08-coverage.png` — coverage report

## Evidence Summary

- The current typography is explicitly configured as Songti-style serif for body, heading, and display.
- The homepage reads as a card index rather than a memorable library entrance.
- Pen and brand detail pages expose raw evidence statuses such as `待补来源` in the main reading flow.
- Detail pages have useful data, but the hierarchy resembles database output: archive fields, claims, story, variants, diagrams, sources, graph, and recommendations are stacked with similar visual weight.
- Exhibit pages are now the strongest content model: sourced sections, related paths, and narrative copy.
- Article pages have improved media rendering, but the shared graph/metadata/source surfaces still feel tool-like.
- Coverage and source pages are useful internally, but should be treated as librarian/admin surfaces rather than primary user destinations.

## Design Direction

- Replace Songti-style serif with a handwriting-compatible but readable font system.
- Make the product feel like a fountain pen library: manuscript warmth, archival trust, and practical comparison tools.
- Move raw data status language out of primary public reading flows.
- Establish distinct templates for pen detail, brand/history, article, exhibit, and internal evidence surfaces.
