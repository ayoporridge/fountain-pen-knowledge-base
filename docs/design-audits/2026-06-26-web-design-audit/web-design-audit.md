# Web Design Audit: Fountain Pen Graph

Date: 2026-06-26

Scope: public visitor flow across homepage, library, browse, pen detail, and article pages.

Viewports captured:
- Desktop: 1440 x 1000
- Mobile: 390 x 844

Evidence folder: `screenshots/`

## Step List

1. Homepage desktop: Healthy foundation, but under-positioned for the new library ambition.
   - Evidence: `screenshots/01-home-desktop.png`

2. Library desktop: Strongest screen in the current product. It clearly communicates the "library" idea.
   - Evidence: `screenshots/02-library-desktop.png`

3. Browse desktop: Functional, but visually weak and low-trust because many default cards look like numbered placeholders.
   - Evidence: `screenshots/03-browse-desktop.png`

4. Pen detail desktop: Information-rich, but needs stronger hierarchy and section navigation.
   - Evidence: `screenshots/17-pen-detail-top-desktop-accepted.png`, `screenshots/10-pen-detail-archive-desktop.png`, `screenshots/11-pen-detail-diagrams-desktop.png`, `screenshots/12-pen-detail-graph-desktop.png`

5. Article desktop: Much improved over raw Markdown, but summary text still leaks Markdown-like fragments and the reading layout needs more editorial polish.
   - Evidence: `screenshots/18-article-top-desktop-accepted.png`, `screenshots/14-article-body-desktop.png`

6. Homepage mobile: Usable and calm, but the first screen is mostly hero card and does not surface the richer library modules.
   - Evidence: `screenshots/06-home-mobile.png`

7. Library mobile: Good visual direction. The data counters are readable, but the page needs clearer primary next actions.
   - Evidence: `screenshots/07-library-mobile.png`

8. Pen detail mobile: Responsive enough, but long-form detail pages need local navigation and stronger hierarchy.
   - Evidence: `screenshots/19-pen-detail-top-mobile-accepted.png`, `screenshots/16-pen-detail-archive-mobile.png`

## Strengths

- The site now has a distinctive visual world: warm paper surface, brown ink accent, serif typography, and archival imagery.
- The Library page is the clearest expression of the intended product. It feels like a steel-pen research atlas rather than a generic database.
- Detail pages expose source boundaries, citations, diagrams, and status labels, which builds trust for a research-heavy site.
- Mobile layouts reflow without obvious overlap in the captured screens.
- The design already has tokens for color, shadows, typography, dark mode, and focus rings, so refinement can build on existing foundations.

## UX Risks

1. The homepage does not yet match the new product.
   - It still reads as a recommendation/search landing page: "找一支适合你的钢笔".
   - The Library page is now more mature than the homepage, so first-time visitors may miss the real value of the product.

2. The primary information architecture is split across competing mental models.
   - Homepage suggests "search and choose a pen".
   - Library suggests "browse a research archive".
   - Browse page mixes articles, brands, and pens in one undifferentiated grid.

3. Browse defaults reduce perceived quality.
   - The first results are article cards with beige placeholder blocks and large numbers.
   - That makes the site feel unfinished even when the underlying data is rich.

4. Detail pages are content-rich but not guided.
   - Users see title, chips, model archive, metadata, tags, evidence, stories, diagrams, source cards, graph, and recommendations.
   - Without a local table of contents or "what this page is good for" summary, the page feels like a stack of modules instead of a curated article.

5. "待核验" appears frequently without enough visual hierarchy.
   - This is honest and useful, but when it appears in many chips/cards it can make the page feel unfinished rather than carefully sourced.

6. Article pages still show formatting leakage in summaries.
   - The Baguio article summary includes Markdown-like fragments such as `--- ![The U.S. Ambassad`.
   - This damages editorial credibility quickly because it appears near the title.

7. Relationship graph is too low in the narrative.
   - It is a signature feature of the product, but on detail pages it appears after several content sections.
   - Users who arrived for "knowledge graph" may not discover it early enough.

8. Mobile long pages need wayfinding.
   - The captured mobile detail page is readable, but after the hero and chips, the user is entering a very long page with no section jump controls.

## Accessibility Risks

- A reusable focus style exists, but many links and buttons do not appear to consistently use a visible focus class.
- Some small metadata labels, badges, and source pills may be difficult to read because they combine small type, muted color, and low-contrast backgrounds.
- Icon-only controls such as theme and menu have labels in code, which is good, but visible target size and focus visibility should be verified with keyboard testing.
- Dense serif body text gives the site personality, but for long factual content it may need a more readable mixed typography system: serif for headings/editorial moments, sans-serif for labels, metadata, filters, and dense UI.
- Screenshot review cannot confirm screen-reader order, keyboard trap behavior in the mobile drawer, or full WCAG compliance.

## Recommendations

### Priority 1: Reposition the homepage

Make the homepage the front door to the library, not only a search/recommendation page.

Recommended structure:
- Hero: "钢笔图书馆" or "一座可追溯的钢笔资料馆"
- Three primary tasks:
  - 找一支笔
  - 读品牌与历史
  - 看结构与图谱
- Search remains prominent, but it should be framed as "search the archive".
- Bring the strongest Library modules onto the homepage: 历史展览, 品牌馆, 型号档案, 图示馆.

### Priority 2: Redesign Browse around content types

The default browse page should not mix everything equally.

Recommended changes:
- Add prominent tabs or segmented controls: 全部, 钢笔, 品牌, 文章, 工艺/概念.
- Default to either "钢笔" or a curated "推荐入口", not raw all-content sorting.
- Replace numeric placeholder cards with content-type-specific thumbnails:
  - Articles: document/essay preview with source/date
  - Brands: brand archive card
  - Pens: pen photo or warm fallback image
- Keep filters, but make the left rail less visually dominant than the results.

### Priority 3: Give detail pages a curator's structure

The current detail page has the right ingredients. It needs a stronger story order.

Recommended detail page layout:
- Hero image + title
- "一句话判断" or "你需要知道的三件事"
- Trust/status strip: 已核验 / 待核验 / 来源数量
- Local section nav: 档案, 故事, 图示, 关系图谱, 来源
- Model specs as a compact table, not large repeated cards on desktop
- Evidence boundaries grouped into one trust panel instead of scattered badges
- Graph preview moved higher, with a "展开关系图谱" action

### Priority 4: Make source status feel authoritative, not unfinished

Keep the honesty, change the presentation.

Recommended language and UI:
- Replace many repeated "待核验" pills with a single page-level "证据状态".
- Use status tiers:
  - 已有官方来源
  - 有社区/二级来源
  - 待补一手来源
- Add short explanatory copy: "这不是错误，而是资料馆对证据边界的标注。"

### Priority 5: Tighten article typography

Article pages should feel like essays in a library, not imported Markdown.

Recommended changes:
- Clean summary generation so Markdown images, separators, and source syntax never leak into the intro.
- Narrow long-form text measure to roughly 68-76 Chinese characters per line on desktop.
- Give images consistent caption treatment and source treatment.
- Add article metadata near the title: source, topic, reading time, evidence status.
- Use a more editorial table-of-contents or related-history rail for long articles.

### Priority 6: Strengthen mobile wayfinding

Recommended changes:
- Add a sticky local section bar on entity pages: 档案 / 故事 / 图示 / 图谱 / 来源.
- Collapse large spec groups by default after the first few key facts.
- Put primary action below hero: "看关系图谱", "看来源", "加入对比".
- Consider bottom navigation for core paths if mobile traffic matters: 图书馆, 搜索, 浏览, 图谱/AI.

### Priority 7: Harden the design system

Recommended system decisions:
- Define a small set of page templates:
  - Library index
  - Browse index
  - Entity detail
  - Article
  - Exhibit
- Define card variants instead of ad hoc cards:
  - Entry card
  - Archive card
  - Fact card
  - Source card
  - Article card
  - Media card
- Use radius, padding, border, and type scale consistently across those variants.
- Use real or curated fallback imagery, not numbered beige placeholders, for public-facing browse cards.

## Suggested Implementation Order

1. Quick credibility pass:
   - Fix article summary Markdown leakage.
   - Add browse type tabs.
   - Replace numbered placeholder cards.
   - Ensure visible focus states on header, cards, buttons, and search.

2. Homepage and library alignment:
   - Reposition homepage around "steel-pen library".
   - Bring Library modules and stats into homepage.
   - Make the Library page the visual standard for other pages.

3. Entity detail redesign:
   - Add section nav.
   - Move graph preview higher.
   - Convert specs to a denser desktop table and cleaner mobile accordion.
   - Consolidate evidence status.

4. Editorial article pass:
   - Clean summary extraction.
   - Refine article width, captions, source rail, and related links.

5. Accessibility QA:
   - Keyboard walkthrough.
   - Focus visibility audit.
   - Contrast check for muted labels and badges.
   - Screen-reader order check for mobile drawer and detail-page section nav.

## Evidence Limits

This audit is based on current screenshots, selected code inspection, and visible browser behavior. It does not certify WCAG compliance, full keyboard navigation, screen-reader output, dark mode contrast, or performance. Those should be checked in a dedicated accessibility QA pass.
