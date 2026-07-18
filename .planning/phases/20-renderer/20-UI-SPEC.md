---
phase: 20
slug: renderer
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-18
reviewed_at: 2026-07-18T14:06:56Z
---

# Phase 20 — UI Design Contract

> 品牌与型号百科页的视觉、信息层级和交互合同。由 gsd-ui-researcher 生成，待 gsd-ui-checker 验证。

---

## Contract Intent

本阶段不是视觉重做。它把现有 Warm Pen Atlas 的页面外观收敛为一套可验证的百科 renderer：用户看到的摘要、正文、规格、版本、时间线、来源、图片与品牌—型号关系，必须共同属于当前获准公开的页面数据；页面不以旧稿、示意封面、推荐结果或“暂无……”占位补洞。

### Governing Decisions

| Decision | Contract | Source |
|---|---|---|
| 产品范围 | 只保留分类与关系漫游；不增加搜索、搜索建议、Chat 或 LLM 入口 | 用户锁定方向；REQUIREMENTS.md Out of Scope |
| 视觉连续性 | 保留 Warm Pen Atlas 的暖纸面、白色 raised surface、棕色 accent、现有字体与轻边框；禁止 broad redesign | 用户锁定方向；`src/app/globals.css` |
| 公开内容 | 品牌/型号页只呈现 current-public page view model 中唯一 published story；摘要与正文同时存在 | PAGE-01/02；20-RESEARCH.md |
| 空数据 | optional module 没有合格数据时整体省略，不显示空卡、占位图或“暂无……”文案 | PAGE-03；用户锁定方向 |
| 图片 | hero 只能使用当前实体的 exact primary media，并持续显示 attribution、license 与来源；通用封面和示意图不能冒充实物图 | PAGE-05；20-RESEARCH.md |
| 关系 | 品牌页列出全部已发布型号和准确数量；型号页只链接唯一 canonical 品牌；推荐/图谱不得代替 canonical relation | PAGE-08；20-RESEARCH.md |
| 响应式 | desktop 与 mobile 都是一级验收面；正文、目录、表格、图片、来源和关系均不得造成 page-level 横向溢出 | PAGE-07；用户锁定方向 |
| 文案 | 使用自然、具体的中文标签与说明，不显示内部状态、字段名、模板腔或 AI 生成提示 | 用户锁定方向；CONT-05 |

### Non-goals

- 不改首页、browse、Header、Footer 或全站导航的视觉体系。
- 不引入新的 design system、第三方 registry、字体、图标库或动画语言。
- 不在 renderer 中生成、补写、摘要或推断内容；不把 legacy `body_md` 重新包装为正式 story。
- 不为数据缺口设计公开 backlog、审核状态或诊断 UI。
- 不用 pagination、carousel、随机推荐或“加载更多”缩短品牌的全部型号列表。

---

## Design System

| Property | Value |
|---|---|
| Tool | Manual Tailwind CSS 4 + CSS tokens（现有项目系统） |
| Preset | not applicable |
| Component library | 现有 project React components；不使用 shadcn/Radix/Base UI registry blocks |
| Icon library | `@phosphor-icons/react` SSR icons |
| Font | 正文 `--font-serif`；章节标题 `--font-heading`；页面标题 `--font-display`；label `--font-label` |
| Visual identity | Warm Pen Atlas：暖纸面、白色 raised panels、低对比边框、棕色 ink accent |

`components.json` 不存在，Phase 20 明确不初始化 shadcn。所有新 renderer 样式必须复用 `src/app/globals.css` 的 token；不得在组件内另建一套 palette、shadow 或 radius system。

### Continuity Rules

- Page background 使用 `--color-surface`；事实卡、目录和来源卡使用 `--color-surface-raised`；弱分组背景使用 `--color-surface-dim`。
- Panel 复用 `.library-panel` 的 1px border、8px radius 与 `--shadow-raised`。正文主体保持安静，不把每个段落装进 card。
- 阅读栏复用 `.reading-measure`，最大宽度 72ch；所有 grid child 必须 `min-width: 0`。
- 正文复用现有 Markdown sanitation 与 `.prose-body`；禁止 raw HTML bypass。
- Dark mode 仅使用现有 `.dark` token remapping；不得写只适配 light mode 的 literal surface/ink colors。
- 不增加装饰性 hero gradient、玻璃拟态、大面积 accent block 或自动播放动画。

---

## Spacing Scale

Declared values（Phase 20 新增或重写的 renderer 只使用以下间距）：

| Token | Value | Usage |
|---|---:|---|
| xs | 4px | icon 与 label 的内联间隔、紧邻 metadata |
| sm | 8px | chip 间距、紧凑列表、card 内部次级间隔 |
| md | 16px | mobile gutter、默认 element gap、mobile panel padding |
| lg | 24px | desktop panel padding、title/summary 与主图内边距 |
| xl | 32px | desktop grid gap、相邻内容模块间距 |
| 2xl | 48px | story 与事实层、事实层与继续探索之间的 major break |
| 3xl | 64px | page top/bottom breathing room（desktop） |

Exceptions:

- 所有可点击 chip、model link、source link 和 CTA 的最小触控高度为 44px；这是 accessibility target，不作为通用 spacing token。
- 现有未触及组件里的 12px/20px utility 不要求在本阶段全站迁移；Phase 20 renderer 新代码不得继续扩散这些值。

### Layout Measurements

| Area | Contract |
|---|---|
| Page container | 最大 1152px；mobile 左右 gutter 16px，desktop 左右 gutter 24px |
| Desktop content | `>=1024px` 使用 8/4 column main/rail，gap 32px；正文列最大 72ch |
| Tablet/mobile | `<1024px` 单列；不把正文压成窄栏，不保留空 sidebar |
| Section rhythm | 同组内 16–24px；主模块之间 32px；story 与后续事实层之间 48px |
| Panel padding | mobile 16px，desktop 24px |

---

## Typography

Phase 20 renderer 只声明四个字号和两个字重。中英文混排沿用现有 font stacks，不引入宋体或新 webfont。

| Role | Size | Weight | Line Height | Usage |
|---|---:|---:|---:|---|
| Label | 14px | 600 | 1.5 | type label、field label、attribution、source metadata、TOC item |
| Body | 16px | 400 | 1.8 | summary、正文、timeline、spec value、source title |
| Heading | 20px | 600 | 1.2 | H2/H3、module heading、fact section heading |
| Display | 32px | 600 | 1.2 | 唯一页面 H1 |

Rules:

- 只使用 `400` 与 `600`；不得用更粗字重把证据 badge、来源或 CTA 变成视觉主角。
- H1 每页恰好一个。published story 的首个 Markdown H1 不重复渲染；正文从 H2 开始，H3 只能位于所属 H2 下。
- Summary 使用 Body，不使用 display size、italic 或 line clamp；60–160 个汉字完整显示。
- 正文不截断、不折叠、不放进固定高度滚动区。段落行高固定为 1.8。
- Source URL、attribution、table cell 和长英文型号使用 `overflow-wrap:anywhere`；不通过缩小字号解决溢出。

---

## Color

### Light Theme — 60/30/10 Contract

| Role | Value | Usage |
|---|---|---|
| Dominant (60%) | `#F7F5F0` / `--color-surface` | 页面背景、正文阅读面、模块间留白 |
| Secondary (30%) | `#FFFFFF` / `--color-surface-raised` | hero frame、fact cards、TOC、source cards；弱分组可用 `#EDEAE3` / `--color-surface-dim` |
| Accent (10% max) | `#9A5B22` / `--color-accent` | 当前目录项、正文/来源链接、focus ring、section icon、少量 evidence marker |
| Destructive | not used | Phase 20 是只读页面，无 destructive action |

Accent reserved for: 当前章节状态、可点击文字链接、focus-visible outline、section icon、evidence/source marker。页面标题、正文、普通 metadata、全部型号名称和大面积 panel 背景不得使用 accent。

### Supporting Colors

| Token | Value | Contract |
|---|---|---|
| Primary ink | `#1A1814` / `--color-ink` | H1、heading、核心值 |
| Secondary ink | `#4A4640` / `--color-ink-light` | summary、辅助说明 |
| Muted ink | `#716B62` / `--color-ink-muted` | attribution、label、source metadata；不得用于长篇正文 |
| Border | `#D9D2C6` / `--color-border` | panel/frame；一次边界即可，不叠多重描边 |
| Light border | `#E9E3D8` / `--color-border-light` | card 内部分隔、caption 分隔 |

Dark mode 对应使用既有 `--color-*-dark` token。信息层级与 accent 保留比例不变；不得用 opacity 让正文或 source metadata 低于可读对比度。链接不能只靠颜色区分：正文和来源链接同时使用 underline 或明确 link shape。

---

## Page Anatomy

### Shared Server-rendered Shell

两类页面共用同一 shell 和同一 current-public view model。DOM 顺序必须先满足 mobile/assistive technology，再用 desktop grid 改变视觉布局：

1. Breadcrumb：`首页 › 品牌/唯一 canonical 品牌 › 当前词条`。
2. Entity header：type label、唯一 H1、60–160 字完整 summary。
3. Canonical relation：型号页在 summary 下显示 `品牌：{品牌名}` 的站内链接；品牌页不制造对称的“代表型号”捷径。
4. Exact primary media：图、alt、attribution、license、source link；不得与标题区域抢占同等视觉权重。
5. Section navigation：仅由当前 published story headings 与实际存在的 modules 生成。
6. Full published story：页面主内容；summary、spec cards 或 legacy source material不能替代。
7. Type-specific fact modules：brand timeline/models，或 model specs/variants。
8. Qualified sources。
9. Canonical relations and related taxonomy links。
10. `继续探索`：graph/recommendations 作为 tertiary zone，和 canonical relation 清楚分区。

Breadcrumb、header、summary、story 和 canonical relation 必须存在于 server HTML；不得等待 client hydration 或 IntersectionObserver 才变得可见。

### Required vs Optional Modules

| Module | Brand | Model | Empty behavior |
|---|---|---|---|
| 60–160 字 summary | required | required | required invariant 失败则 fail closed，不渲染 partial page |
| Expected published story | exactly 1 `brand_story` | exactly 1 `model_story` | required invariant 失败则 fail closed；禁止 legacy fallback |
| Exact primary media | required by public page contract | required by public page contract | 不显示 generic/illustration placeholder；contract mismatch fail closed |
| Qualified sources | required | required | 不显示空来源卡；contract mismatch fail closed |
| Timeline | 至少 2 个 approved nodes | not applicable | brand invariant 失败则 fail closed |
| Published models | 至少 1，且全量 | not applicable | brand invariant 失败则 fail closed；不得显示 0 型号空态 |
| Canonical brand | not applicable | exactly 1 | missing/duplicate 均 fail closed；不得 `LIMIT 1` 掩盖错误 |
| Evidence-backed specs | not applicable | required fact set | 无 qualified evidence 的 field 单独省略；整个 required set 不足则 fail closed |
| Qualified variants | not applicable | optional | collection 为空时 section `return null` |
| Tags/aliases/external IDs | optional | optional | 空 collection 时 section `return null` |
| Graph/recommendations | optional | optional | 无结果时 section `return null`；不得显示空容器 |

“Fail closed” 是 renderer invariant，不是新 eligibility system：公开用户不得看到 stack trace、review status 或数据诊断；路由使用现有 404/error boundary。optional module 不存在时，SectionNav 也不得保留对应 anchor。

---

## Brand Page Contract

### Content Order

1. H1 + summary。
2. Entity-exact brand image + visible attribution。
3. Full `brand_story`。
4. `品牌时间线`：至少两个节点。
5. `全部型号（{count}）`：全量 canonical relation。
6. `来源`。
7. Optional taxonomy relations。
8. `继续探索` graph/recommendations。

### Timeline

- 使用语义 `<ol>`；每个节点显示可读日期/年代、事件标题、简洁说明和可见来源链接。
- 桌面与 mobile 都使用单列纵向时间线；不得靠 hover 才显示事件内容或 citation。
- 同日/同年节点保持 loader 的稳定排序。未知月份/日期不补 `01-01`，只显示已获准的精度。
- 时间线 line 和 dot 使用 border/secondary ink；accent 只标记当前 focus/linked source，不把每个 dot 都做成高饱和装饰。

### All Published Models

- Heading 固定为 `全部型号（{count}）`；`count` 必须等于页面渲染的全部 link 数量。
- 排序由 canonical loader 稳定提供；UI 不随机、不按推荐分、不截前 12 个。
- Mobile 单列；desktop 两列。每项至少 44px 高，完整型号名可换行，不使用 line clamp。
- 每项是直接站内链接，visible focus ring；不在同一项内嵌第二个 click target。
- 不使用 pagination、carousel、折叠区或 `加载更多`。长列表是 PAGE-08 的必要内容，不是性能异常。

---

## Model Page Contract

### Content Order

1. H1 + summary + `品牌：{canonical brand}`。
2. Entity-exact product image + visible attribution。
3. Full `model_story`。
4. `核心规格`。
5. Optional `版本差异`。
6. `来源`。
7. Optional taxonomy relations。
8. `继续探索` graph/recommendations。

### Canonical Brand Link

- 放在 summary 后、hero 前，使用 label `品牌` 与完整品牌名；整行链接最小高度 44px。
- 它是 PAGE-08 的 canonical relation，不得和 `关联词条`、推荐卡或 graph node 混为一组。
- 页面只渲染一条。若 view model 返回 0 或多条，拒绝渲染页面，不能取第一条。

### Evidence-backed Specs

- Section heading 固定为 `核心规格`。
- 每个 field card 同时呈现：中文 label、获准 value、`来源：{source title}`；有 locator 时追加 `· {page/chapter/section}`。
- Source/evidence 行必须是可见文字，不能只放 tooltip、hover popover 或无 label 图标。
- Desktop 使用两列 definition-list cards；mobile 转为单列 key/value cards。不得让整个页面随 table 横向滚动。
- `0` 是有效值；只省略 `null`、空字符串或未 qualified 的 field。省略后不留 `—`、`未知`、`待补充`。
- 不向用户显示 `field_name`、claim ID、review status、tier enum 或数据库 locator 原值。

### Qualified Variants

- Section heading 固定为 `版本差异`；仅当至少一个 qualified variant 存在时渲染。
- 每项依次显示 variant name、已获准的年代/地区范围、实际差异、source link。缺失的 optional subfield 直接省略。
- 不用 tabs 隐藏内容；用纵向 list/card，server HTML 一次输出完整差异。
- 普通颜色、镀层、尖宽不是独立购买差异时，不在 renderer 里擅自升级为主版本。

---

## Story and Section Navigation

### Full Story

- Story 是页面最高优先级内容，位于 summary/hero 后、facts 前；不放进 sidebar。
- 完整渲染 `bodyMd`，禁止 `line-clamp`、read-more、固定高度、client-only accordion 或摘要替代。
- Story 内的 image、table、blockquote、footnote、list 继续使用现有 `.prose-body` 规则。
- Markdown table 和 `pre` 只能在自身容器横向滚动；`body`, page container 与 grid 不得产生横向滚动。
- Story 中第三方体验必须保留明确归因。renderer 不添加“我们实测”“本站认为”等作者身份。

### Heading-derived Navigation

- TOC 与 heading ID 必须从同一 published story AST/headings 生成；禁止维护另一份硬编码 section list。
- Heading slug 必须 deterministic，中文可用，重复 heading 追加稳定序号。
- 每个 target 使用 `scroll-margin-top: 96px`，避免被 sticky header/TOC 遮挡。
- 只有一个可导航 heading 时省略 TOC；不存在的 module 不进入 nav。
- Desktop `>=1024px`：right rail 中纵向 sticky TOC，`top: 96px`，可用高度内局部滚动。
- Mobile `<1024px`：hero 后使用横向 scroll chips；组件自身滚动、页面不滚动，单个 chip 高度至少 44px。
- 当前章节可用 accent + font weight 表示，但不能只靠颜色；同时提供 `aria-current="location"`。
- 用户启用 reduced motion 时使用 instant jump；不得强制 smooth scroll。

---

## Primary Media and Attribution

### Hero Figure

- `<figure>` 宽度不超过 content area，背景 `--color-surface-dim`，border `--color-border`，8px radius。
- Image 使用固有宽高和 `object-fit: contain`；最大高度 560px。禁止为了填满容器裁掉笔帽、笔尖、品牌标志或笔身两端。
- Mobile image 宽度 100%、高度 auto；caption 在图下自然换行。
- `alt` 必须说明当前实体与可见视角/细节，例如 `{型号名} 钢笔侧面全貌`；禁止通用 `资料图片`。
- Caption 使用 14px label size，按顺序显示 attribution text、license label、`查看图片来源`。长 attribution 可换行。
- Source link 新窗口打开时使用 `target="_blank" rel="noopener noreferrer"`，并提供可读的 external-link label/icon。

### Forbidden Fallbacks

- 无合格 hero 时不显示渐变资料卡、通用 library hero、品牌气氛图、broken-image box 或“暂无图片”。
- Gallery media 不得自动升为 primary；remote-only URL 不得直接进入 `<img src>`。
- `site-original` 只说明权利来源，不证明 entity-exact。无法证明当前实体准确性的图片不能进入 hero。
- 如后续确需展示机制示意图，只能放在正文后的独立 `示意图` module，并明确写 `示意图，不代表当前实体实物`；它不参与 PAGE-05 主图资格。
- Metadata/Open Graph 与页面共用同一 exact image；无合格图时省略 image，不回退通用封面。

---

## Sources and Evidence Presentation

- Section heading 固定为 `来源`；只呈现 current publication dependency 中 qualified sources，按 loader 稳定顺序去重。
- 每张 source card 显示 human-readable title、source/publisher、来源类型中文 label、retrieved/archive date（有则显示）、citation locator（有则显示）及 `查看来源`。
- 不把 raw URL 当主要标题；域名可作为辅助 metadata。所有 URL/标题必须可换行。
- Tier/independence/allowed-use 等内部 enum 不直接展示。若用户需要理解来源性质，使用 `官方资料`、`同期档案`、`专业资料` 等已审核中文 label。
- Field evidence 可在 spec/variant/timeline 项内链接同一 source；页面底部 source list 仍保留完整条目。重复 source link 不产生重复 source count。
- Source link 具有 underline、44px 可点击行或等价 padding、visible focus ring；external state 不能只靠图标表达。
- 没有 source collection 时整个 section 和 nav item 都不存在；禁止 `暂无可公开展示的来源资料`。

---

## Canonical Relations vs Explore

Canonical relation 是事实，Explore 是继续漫游；两者必须在视觉、heading 与计数上分开。

| Zone | Heading/label | Includes | Must not include |
|---|---|---|---|
| Canonical brand | `品牌` | 型号唯一 canonical brand | 推荐品牌、相似品牌、第二品牌候选 |
| Canonical models | `全部型号（{count}）` | 品牌全部已发布型号 | 代表型号截断、random result、draft model |
| Related facts | `关联词条` | 有明确关系类型的 public entities | canonical brand/model count |
| Explore | `继续探索` | graph、recommendations | authoritative count、品牌归属证明 |

Explore 位于页面末端，顶部留 48px major break。Graph CTA 使用 `继续探索关系图谱`；推荐结果为空时不显示 heading 或空 panel。

---

## Responsive Contract

### Desktop (`>=1024px`)

- Page 最大 1152px；main 8 columns、right rail 4 columns，gap 32px。
- H1/summary/hero 可跨 main content width；正式 story 始终保持 72ch 阅读宽度。
- Right rail 仅承载 TOC 与短 metadata，不把 sources、models 或 story 塞进窄栏。
- TOC 可 sticky；任何其他模块不得使用 sticky 造成双滚动区。
- Model specs 两列，brand models 两列，sources 一至两列；内容高度不对齐时自然流动。

### Mobile and Tablet (`<1024px`)

- DOM 与视觉顺序一致：title/summary → canonical brand（model）→ image → mobile TOC → story → facts → variants/models → sources → relations → explore。
- 全部单列；page gutter 16px，panel padding 16px，module gap 32px。
- Mobile TOC 横向滚动但不得隐藏 scrollbar/focus target 到不可发现；keyboard focus 自动滚入 component viewport。
- Spec 改为 cards；story table/pre 保留局部 scroll。关系 chip、source title、attribution 和长型号名允许换行。
- Hero、graph canvas、table、pre、URL、model grid 和 caption 都必须满足 `scrollWidth <= clientWidth` at page level。
- 任何 hover affordance 都必须有等价 focus/touch behavior；没有 hover 才能发现的内容。

### Progressive Rendering

- Summary、story、facts、sources 与 canonical links 必须 server-rendered；JS disabled/hydration pending 时仍可读和可导航。
- 不为 server page 增加 skeleton carousel 或 client fetch spinner。
- Layout shift 由图片固有宽高控制；caption 和 source metadata 不绝对定位。

---

## Interaction and Accessibility

| Interaction | Contract |
|---|---|
| Focus | 复用 3px `--color-accent` outline、3px offset；不得移除 outline |
| Hover | 只改变 background/border/text color；不得移动布局或让文字消失 |
| Touch | 所有导航、source、model、brand 和 CTA target 至少 44px 高 |
| Anchors | Stable IDs、96px scroll margin、可用 keyboard/assistive tech 到达 |
| External links | visible text + optional external icon；新窗口属性安全且行为可理解 |
| Images | entity-specific alt；纯装饰 icon `aria-hidden`；caption 不替代 alt |
| Lists | timeline/models/sources 使用语义 list；specs 使用 `<dl>` 或语义 table/card |
| Current state | TOC 使用 `aria-current="location"`，不只靠 accent color |
| Motion | 遵循 `prefers-reduced-motion`; 内容初始即 visible，不依赖 reveal animation |
| Dark mode | 使用现有 tokens；focus、link、caption 和 border 均保持可辨识 |

---

## Copywriting Contract

### Fixed Interface Copy

| Element | Copy |
|---|---|
| Summary kicker | `内容提要` |
| Model canonical relation | `品牌：{品牌名}` |
| Story nav item | `正文` |
| Model facts | `核心规格` |
| Variants | `版本差异` |
| Brand timeline | `品牌时间线` |
| Brand models | `全部型号（{count}）` |
| Sources | `来源` |
| Related facts | `关联词条` |
| Explore zone | `继续探索` |
| Primary CTA | `继续探索关系图谱` |
| Field evidence | `来源：{source title} · {locator}`（locator 不存在时省略后半） |
| Image attribution | `{attribution text} · 许可：{license label} · 查看图片来源` |

### State Copy

| Element | Copy |
|---|---|
| Empty state heading | 不显示：optional module 为空时整体不进入 DOM |
| Empty state body | 不显示：不得出现“暂无规格/来源/图片/型号”“待补充”等占位 |
| Error heading | `这个页面不存在`（复用全站 404） |
| Error body | `可能是链接有误，或者页面已经被移除了` |
| Error actions | `回到首页`；`浏览全部` |
| Destructive confirmation | 不适用：Phase 20 无 destructive action |

### Tone and Terminology

- UI label 短而具体；不使用“资料卡”“档案待完善”“智能生成”“AI 总结”等抽象模板词。
- Summary 与 story 内容原样消费已审核自然中文；renderer 不自动拼接 `「{name}」是一款……` 模板。
- 不展示 `published`、`approved`、`needs_source`、`review_status`、snake_case field 或 evidence ID。
- 第三方体验必须在正文或 citation 中明确归因，不把原作者第一人称变成本站亲历。
- 型号与品牌专名不擅自翻译；中文 label、数字与单位遵循正文已审核格式。

---

## Component Inventory

| Component responsibility | Contract |
|---|---|
| `EncyclopediaShell` | shared semantic shell、responsive grid、module ordering；只消费 view model |
| `EntityHeader` | type、H1、60–160 字 summary、model canonical brand |
| `PrimaryMedia` | exact hero + alt + attribution + license + source；无 fallback |
| `StoryArticle` | full published Markdown、stable heading IDs、72ch measure |
| `SectionNav` | 从 same story headings 与 present modules 派生；desktop rail/mobile chips |
| `BrandFacts` | timeline + complete published model list |
| `ModelFacts` | evidence-backed spec cards + optional qualified variants |
| `QualifiedSources` | deduplicated source cards 与 external link behavior |
| `CanonicalRelations` | authoritative brand/model links，和 Explore 分离 |
| `ExploreMore` | optional graph/recommendations；tertiary only |

`BrandMuseum` / `ModelArchive` 必须成为纯 props renderer 或被以上组件替换。它们不得继续各自查询数据库、读取 legacy body 或定义独立空态；同一页面不能保留新旧两套 renderer。

---

## Visual and Interaction State Matrix

| State | Expected UI |
|---|---|
| Complete brand | summary + exact image + full story + 2+ timeline nodes + all models/count + sources + optional explore |
| Complete model | summary + canonical brand + exact image + full story + evidence specs + optional variants + sources + optional explore |
| Optional variants absent | `版本差异` heading、panel 和 TOC item 均不存在；相邻 section spacing 正常 |
| Optional graph absent | `继续探索`/graph CTA 不产生空容器；canonical links 仍完整 |
| Unqualified spec/source/media | 对应 item 不进入 DOM；不得显示 sentinel、dash、unknown 或 fallback |
| Required invariant missing | 不输出 partial encyclopedia page；使用 existing fail-closed route/error behavior |
| Long model/source name | 自然换行，target 保持 44px，page 无横向 overflow |
| Dark mode | same hierarchy、readability、focus and attribution；无 hard-coded light surface |
| Reduced motion | 全部内容立即可见，anchor instant jump，无 reveal dependency |

---

## Verification Contract

UI checker 与 executor 至少验证以下可见结果：

- Brand desktop、brand mobile、model desktop、model mobile 四种 fixture evidence 均可同时看到 summary、完整 story、一个事实模块与 canonical relation。
- Summary 完整显示且长度 60–160 字；story sentinel 可见，legacy/deprecated sentinel 不可见。
- Hero URL 为稳定本地/受控路径；alt、attribution、license 与 source link 同时可见；generic/illustration sentinel 不得成为 hero。
- 每个 visible spec/variant/timeline item 的 source affordance 可见、可键盘访问。
- 15 个品牌型号 fixture 显示 15 个名称/链接，heading count 为 15，无 carousel/load-more/top-12 截断。
- Model 只显示一个 canonical brand link；推荐或 graph link 不计入品牌关系。
- optional empty case 中不存在 `暂无`、`待补充`、`未知`、空 heading 或空 panel。
- Mobile page-level `scrollWidth <= clientWidth`；table/pre/mobile TOC 只在自身容器滚动。
- JS disabled 或 hydration pending 时，summary、story、sources 与 canonical links 仍在 server HTML。
- Light/dark、keyboard focus、touch target、reduced motion 均通过定向检查。

Fixture evidence 只能证明 renderer，不能表述为真实 305 条库存已经发布。

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|---|---|---|
| shadcn official | none | not applicable — shadcn not initialized — 2026-07-18 |
| Third-party registries | none | not applicable — no registry code enters Phase 20 — 2026-07-18 |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-07-18
