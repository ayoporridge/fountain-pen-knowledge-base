# Phase 20: 百科页面 Renderer - Research

**Researched:** 2026-07-18  
**Scope:** 品牌/型号详情页的 published-content query、server renderer、responsive UX 与定向验证  
**Requirements:** PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, PAGE-07, PAGE-08

## User Constraints (locked)

- Phase 20 只做 Renderer、content query 与 UI；不回改 Phase 19 fixture、readiness/lifecycle 或真实库存数据。
- `public_entities` 继续是唯一公开授权边界。Renderer 不建立第二套“是否公开”判断。
- 不用网络模型补内容，不部署，不运行 monolithic wrapper。
- 规划必须以当前代码和 Phase 19 已落地的 evidence/readiness contract 为准。
- 真实 305 条品牌/型号当前仍是 `public=0`；页面验收必须使用 disposable renderer fixture，不能把 fixture 成功描述成真实内容已发布。

## Phase Requirements

| Requirement | Renderer 必须兑现的可见结果 | 主要实现边界 |
|---|---|---|
| PAGE-01 | 品牌/型号页均展示 60–160 字自然中文摘要，且正文仍完整存在 | `public_entities` 中当前实体摘要；页面 shell 中固定 summary 区，不再排除 `brand`/`pen` |
| PAGE-02 | 只展示当前 publication payload 中唯一 `published` 的 `brand_story`/`model_story` | 以 `public_entities` 为授权锚点，按实体类型精确查询 expected story；禁止 `entities.body_md` fallback |
| PAGE-03 | 型号页只展示有逐字段证据的规格、合格 variants、来源和主图；未知模块直接省略 | evidence-scoped page query；组件对空数据 `return null`，不渲染“暂无…”块 |
| PAGE-04 | 品牌页有正式正文、至少两个 approved timeline events、至少一个已发布型号、来源和品牌图 | published brand story + approved timeline + `getBrandPublicModels` 等价的全量关系查询 |
| PAGE-05 | 主图实体准确、许可/attribution 完整、路径稳定；示意图不冒充实物图 | renderer-specific primary-media contract，不能仅取“第一张可公开媒体” |
| PAGE-06 | 型号正式正文完整呈现规定主题和归因，不被摘要、legacy source material 或截断替代 | 完整渲染 published `model_story.body_md`；章节导航来自同一正文 headings |
| PAGE-07 | desktop/mobile 章节、表格、来源、图片、variants、关系均可用且无横向溢出 | 一个共享响应式 shell；定向 desktop/mobile Playwright 验收 |
| PAGE-08 | 品牌页显示全部已发布型号及准确数量；型号页只显示唯一 canonical 品牌 | `public_entities + entity_links(made_by)` 精确关系；推荐内容单独标识且不参与关系数量 |

## Executive Summary

Phase 19 已经解决“谁可以公开”：`public_entities` 只暴露当前 hash、当前 review、无 readiness blocker 的实体。Phase 20 不应重写这套 gate，而应解决下一层问题：**一次性把已授权实体的当前 published story、evidence-backed structured data、qualified sources、entity-exact media 和 canonical relations 组装成一个类型安全的 page view model，再由品牌/型号 renderer 完整呈现。**

当前详情页的主要问题不是样式，而是读取契约仍停留在旧模型：品牌/型号摘要被刻意隐藏，正式 story 没有查询，型号正文仍可能来自 legacy `entities.body_md`，variants 未呈现，来源和媒体的查询条件弱于 Phase 19 evidence contract，空模块还会公开显示“暂无…”占位。若直接在现有组件上继续堆查询，PAGE-02/03/05 会产生多套真相且难以验证。

推荐最小架构是：

1. 新增一个 server-only `getPublishedEntityPage(type, slug)` loader，以 `public_entities` 为唯一入口，在同一数据库 snapshot 中返回 `BrandPageData | ModelPageData`。
2. loader 精确选择 expected published story，并按 Phase 19 qualified views 组装 specs/evidence、variants、sources、timeline、primary media 与 canonical relations；不读 legacy body。
3. 路由只负责 metadata/not-found 和选择品牌/型号 renderer；所有可见模块消费同一 view model，不在组件内继续发散 SQL。
4. 用独立 disposable renderer fixture 覆盖完整/缺省/非法媒体/15+ 型号/mobile overflow；不改 Phase 19 lifecycle fixture，不跑全套 wrapper。

## Current Codebase Findings

### 1. Public authorization 已存在，Renderer 应复用而非复制

- `src/lib/public-visibility.ts::getPublicEntityBySlug` 从 `public_entities` 读取；`publicEntityFilter` 也把 public relation 限制到同一视图。
- `migrations/031_evidence_readiness_v2.sql::public_entities` 已绑定 `entity_publications.approved_content_hash`、当前 content review、strict readiness v2 和 published status。
- `stories` 本身没有 `content_hash` 列。PAGE-02 的“当前 hash 下”应理解为：story 是 canonical publication payload 的一部分；先由 `public_entities` 证明该 payload 当前有效，再在**同一 read snapshot**中取 expected published story。
- mutation triggers 会让关键内容变化后的实体退出 public view，但当前页面采用多次独立查询，仍可能在并发变更时发生短暂 TOCTOU。实现不能在 gate 查询后再跨多个不一致 snapshot 拼页面。

### 2. 当前详情路由没有渲染正式品牌/型号 story

`src/app/[type]/[slug]/page.tsx` 的关键现状：

- `EntityPage` 先调用 `getPublicEntityBySlug`，授权入口正确。
- `generateMetadata` 对品牌/型号使用通用描述，没有消费页面摘要；没有实体图时还会使用通用 library hero，容易让非实体图片进入分享卡。
- summary 区显式排除了 `brand` 和 `pen`，直接缺失 PAGE-01。
- `publicBody` 来自 legacy `entity.body_md`；品牌/型号分支实际只渲染 `BrandMuseum` / `ModelArchive`，没有查询 `brand_story` / `model_story`。
- section nav 根据旧模块硬编码，没有从正式正文 headings 建立导航。
- 主图用 `getPrimaryProductImage`；无图时显示“暂无可公开复用的对应图片”，违反未知字段/模块省略原则。
- `site-original` 虽有“原创示意图”说明，仍占据 hero 位置；这不能证明其为当前实体实拍图。
- 型号 canonical brand 查询使用 `LIMIT 1`。它隐藏重复关系，而不是验证唯一关系；页面 view model 应保留精确 cardinality invariant。
- 关系、graph 和 recommendations 同时存在，视觉上必须明确区分；随机/推荐结果不能承担 PAGE-08 的 canonical relation。

### 3. 现有品牌/型号组件仍是 archive UI，不是 encyclopedic renderer

`src/components/library/BrandMuseum.tsx::BrandMuseum`：

- 在组件内部并行查询 timeline、全部 public models、references、aliases、external IDs。
- `getBrandPublicModels` 的查询口径正确：通过 public brand/model 与 `made_by` 返回全量已发布型号，现有 15 型号测试也证明没有 top-12 截断。
- timeline、models、sources 为空时仍渲染“当前没有…”或“暂无…”块。
- 没有正式 brand story 和 summary/image contract。

`src/components/library/ModelArchive.tsx::ModelArchive`：

- `sourceBody` 来自 legacy `entities.body_md`，并作为“来源正文/第三方资料”渲染，不是 published `model_story`。
- `getModelSpec` 可省略没有证据的字段，这是可复用的核心方向。
- 未使用已有 `getModelVariants`，因此 PAGE-03 的版本差异缺失。
- specs、source material、sources 为空时都有公开占位文案。

结论：不要让这两个组件继续自行查询。它们应改成纯展示组件，或由新的 `BrandEncyclopediaPage` / `ModelEncyclopediaPage` 替代；二选一即可，避免两套 renderer 并存。

### 4. Query primitives 有可复用部分，但不能直接拼成 PAGE contract

`src/lib/library.ts`：

- `getStoriesForEntity` 明确排除了 `brand_story` / `model_story`，不能用于 PAGE-02。
- `getModelSpec` 通过 `publication_v2_field_evidence` 只返回 evidence-backed 字段，这是 PAGE-03 的正确过滤基础；但返回值不含 field-level source、locator、scope，页面无法对“逐字段有证据”做可见归因。
- `getModelVariants` 只按 `model_entity_id` 返回 rows，没有 public owner、review status、qualified source 或 variant scope 过滤，不能直接公开使用。
- `getEntityReferences` 只要求 entity reference 和 source item 为 approved，没有加入 `publication_v2_qualified_source_items` 的 tier、retrieval、archive、usage 等完整来源资格。
- `getTimelineForEntity` 已限制 entity public、event approved、source approved，排序稳定；品牌 renderer 还需要保证只显示合格来源，并在 contract test 中覆盖至少两个节点。
- `getBrandPublicModels` 已符合 PAGE-08 的全量 published relation 口径，应保留等价 SQL 和准确 `count`。
- `getPrimaryProductImage` 会在没有 primary 时回退 gallery，并且 query contract 没有要求 attribution 文本完整；这不足以承担 PAGE-05 的“主图”语义。

`migrations/031_evidence_readiness_v2.sql` 提供应优先复用的事实层：

- `publication_v2_qualified_source_items`
- `publication_v2_qualified_field_evidence`
- `publication_v2_qualified_core_claims`
- `publication_v2_qualified_primary_media`
- `publication_source_item_entities`

其中 `publication_v2_qualified_primary_media` 证明 readiness 所需的 approved primary media，但它允许只有 `source_url` 且没有 attribution 的行；`src/lib/public-media.ts::publicMediaFilter` 又要求本地/站内 URL。二者存在 renderer gap。Phase 20 不能回改 Phase 19 gate，但必须在页面 query 中采用更严格的可显示 contract，并通过测试暴露“已 public 但无可展示主图”的不变量失败，绝不能回退外链、gallery 或占位图。

### 5. 当前测试没有覆盖 Renderer 的核心风险

- `tests/e2e/publication-gate.spec.ts` 已覆盖 hard 404、critical edit/republish lifecycle、15 个型号全量关系和 canonical brand link；这些属于 Phase 19 基线，不应在 Phase 20 改写。
- 该 spec 没有断言 60–160 字摘要、published story vs legacy body、variants、逐字段 citation、timeline 至少两个、来源无 placeholder、图片 attribution 或手机端完整布局。
- `tests/e2e/site-quality.spec.ts` 有 `expectNoHorizontalOverflow` helper 和 mobile project，但默认 fixture 没有公开 brand/pen，所以 sitemap/mobile 测试没有真正走到百科 renderer。
- 真实库存当前 public 为 0。Phase 20 不能靠真实页面做浏览器验收，必须自建 renderer fixture，并在测试结束后清理。

## Recommended Architecture

### 1. One public page loader, one snapshot, one authorization truth

新增 server-only module（建议 `src/lib/entity-page.ts`；命名可随现有习惯调整），导出：

```ts
type PublishedPageData = BrandPageData | ModelPageData;

async function getPublishedEntityPage(
  type: "brand" | "pen",
  slug: string,
): Promise<PublishedPageData | null>;
```

必须满足：

1. 首个 CTE/table 是 `public_entities`，并同时匹配 `type + slug`；无记录返回 `null`，路由 `notFound()`。
2. 根据类型只接受一个 expected story：brand → `brand_story`，pen → `model_story`，且 `status='published'`。
3. story count 不是 1、summary 不在 60–160 字、brand published models 为空、pen canonical public brand count 不是 1 等情况，属于“public row 与 renderer contract 不一致”。它们应产生明确 invariant/test failure，不能改读 legacy 字段或悄悄截取第一条。
4. 所有数据在同一 consistent snapshot 中读取。优先一个 CTE/JSON aggregation statement；若当前 libSQL driver 支持显式 read transaction，也可在 transaction 中发出若干参数化查询。规划阶段先验证 driver API，不要假设某个 transaction 方法存在。
5. page loader 只接受绑定参数，不拼接 slug/type/ID；不把 SQL 或内部 evidence IDs 暴露到 client。
6. `public_entities` 决定可见性，renderer invariant 只发现不可能状态，不得另建“差一点也公开”的 eligibility 分支。

### 2. Discriminated view model

建议最小 shape：

```ts
interface PageBase {
  entity: { id: string; type: "brand" | "pen"; slug: string; name: string };
  summary: string;
  story: { id: string; bodyMd: string; headings: PageHeading[] };
  primaryImage: PrimaryImage | null;
  sources: PageSource[];
  tags: PageTag[];
  relations: PageRelation[];
}

interface BrandPageData extends PageBase {
  entity: PageBase["entity"] & { type: "brand" };
  timeline: TimelineEvent[];
  models: PublishedModelLink[]; // 全量、稳定排序
}

interface ModelPageData extends PageBase {
  entity: PageBase["entity"] & { type: "pen" };
  brand: PublishedBrandLink; // exactly one
  specs: EvidenceBackedSpec[];
  variants: QualifiedVariant[];
}
```

约束：

- `summary` 只取当前 public entity 的摘要，不从正文自动截断生成。
- `story.bodyMd` 只取 expected published story；删除 `preparePublicBody` / `penSourceBody` 对品牌/型号的正式正文职责。
- headings 从同一 `bodyMd` 解析，slug 去重且稳定；导航与正文不能分别维护标题。
- optional collection 可以为空，但组件为空即不渲染；不得输出“暂无规格/来源/图片/型号”等公开占位。
- required cardinality 不靠 UI 猜：brand timeline 最少 2、brand models 最少 1、model brand 恰好 1、expected story 恰好 1。测试应直接覆盖这些 invariants。

### 3. Exact query contracts

#### Story and summary

- `public_entities pe`
- `JOIN stories s ON s.entity_id = pe.id`
- `s.story_type = CASE pe.type ...`
- `s.status = 'published'`
- 不查询 `entities.body_md`，不接受 `reviewed`，不接受其他 story type，不接受 deprecated。
- current-hash 绑定来自同一 snapshot 的 `public_entities`；不要新增一个无法与 canonical payload 保持同步的 story hash 字段。

#### Model specs and field evidence

- 以 `model_specs.review_status='approved'` 和 public owner 为基础。
- 每个可见字段必须 `JOIN publication_v2_qualified_field_evidence`，匹配 `model_entity_id + spec_id + field_name`。
- 每项返回显示值、field name、citation locator、source title/url、source tier；若同一字段多条 evidence，稳定排序并去重 source link。
- 没有 qualified evidence 的字段不进 view model，UI 不渲染空行。
- 规格表不应把 `0` 误判为空；只省略 `null`/空字符串。

#### Variants

- 不能直接调用现有 `getModelVariants`。
- 必须要求 `model_variants.review_status='approved'`、owner 在 `public_entities`、关联 source item 在 `publication_v2_qualified_source_items`。
- 若展示的差异来自 scoped claim/field evidence，关联 `fact_scopes(scope_type='variant')` 或 qualified core claims，确保 variant 名称和差异有可追踪来源。
- 只呈现证据支持的差异；缺失年份/notes 时省略对应字段，不造默认值。

#### Sources

- 页面 sources 应从 `publication_source_item_entities` 与 `publication_v2_qualified_source_items` 取当前 entity 的 publication dependency 全集，再连接 registry/item 输出 title、URL、tier、archive/retrieved metadata。
- 合并 story citations、spec field evidence、variant/timeline sources后按 canonical URL/source item 去重，稳定排序。
- 不仅依赖 `entity_references`；approved reference 不等于完整 qualified source。
- 外链使用现有安全属性；页面不显示内部状态字段或数据库 locator 的原始实现细节，但可显示人类可读的页码/章节定位。

#### Primary media

- owner 必须是当前 entity，`usage_status='primary'`，`review_status='approved'`，且通过 `publication_v2_qualified_primary_media` 与 `publicMediaFilter` 的共同安全条件。
- 必须有稳定本地或受控托管路径；不得用 remote `source_url` 作为 `<img src>` fallback。
- license 在 public whitelist 中，`attribution_text` 非空；renderer 明确显示 attribution、license 和 source link（如有）。
- 不允许 gallery 自动升级为主图，不允许通用 library hero 进入实体主图或 social image。
- 当前 schema 没有可靠的 “illustration vs exact product photo” 字段；`site-original` 只能说明版权来源，不能证明实体准确。Phase 20 最安全的 UI contract 是：不能证明 entity-exact 的素材不进入 primary hero，可在明确标注的“示意图”辅助模块展示。不要仅凭 license 猜测它是实拍或示意。

#### Canonical relations

- 品牌 models：沿用 `getBrandPublicModels` 的 public brand → `made_by` → public pen 全量查询；不加业务 LIMIT，返回 `models.length` 作为显示数量。
- 型号 brand：查询所有 public `made_by` brand，要求 count exactly 1；不能 `LIMIT 1` 吞掉重复。
- 推荐、相似内容、graph 属于“继续探索”，视觉和数据结构均与 canonical relations 分离。

### 4. Renderer composition

建议路由保持 server component，结构如下：

```text
EntityPage
└── getPublishedEntityPage(type, slug)
    └── EncyclopediaShell
        ├── EntityHeader (name + 60–160 summary + canonical relation)
        ├── PrimaryMedia (optional, with attribution)
        ├── StoryArticle (full published story + heading anchors)
        ├── BrandFacts | ModelFacts
        │   ├── Timeline / EvidenceSpecTable
        │   ├── AllPublishedModels / Variants
        │   └── QualifiedSources
        ├── CanonicalRelations
        └── ExploreMore (graph/recommendations, clearly secondary)
```

- `BrandMuseum` / `ModelArchive` 改为纯 props component，或替换成新的 renderer；不要让新旧组件都保留数据库读取能力。
- 正文使用现有 Markdown sanitation/rendering path；不要引入 raw HTML bypass。
- story 是主内容，summary 是导语，structured facts 是可扫描证据层；三者不可互相替代。
- 章节 anchor 应有 `scroll-margin-top`，中文/重复 heading 需要 deterministic unique IDs。
- metadata/JSON-LD 与页面共用 loader 的 `summary` 和 entity-exact `primaryImage`；无合格图时省略 `image`，不回退通用封面。

### 5. Desktop and mobile UX contract

**Desktop**

- 主栏优先显示 summary、hero、正式正文；右侧可 sticky 显示章节导航/关键事实，但不把正文压缩到难读宽度。
- specs/variants 用语义表格时，容器必须 `min-width: 0`；较宽表格可局部横向滚动，整页不能横向溢出。
- sources 的长 URL、attribution、citation locator 必须可换行；图片保持比例，不裁切笔身关键区域。

**Mobile**

- 单列顺序固定：标题与摘要 → 主图 → 正文 → specs/timeline → variants/models → sources → canonical relations → explore。
- 章节导航改为可横向滑动的 sticky chips 或折叠目录；每个 target 可键盘/触摸到达，触控目标至少约 44px。
- 规格表在窄屏优先转为 key/value cards；若保持 table，只允许 table 容器滚动。
- 任何图片、pre、table、长 URL、关系标签都不得把 viewport 撑宽。
- JS 禁用/客户端 hydration 未完成时，正文、summary、sources、canonical links 仍由 server HTML 完整提供。

## Exact Files and Symbols for Planning

| File | Symbol/area | Phase 20 action |
|---|---|---|
| `src/lib/entity-page.ts` (new, suggested) | `getPublishedEntityPage`, view-model types, renderer invariants | 建立唯一 page query contract 和 snapshot；集中 story/evidence/media/relation 查询 |
| `src/app/[type]/[slug]/page.tsx` | `generateMetadata`, `EntityPage`, summary/hero/nav/brand-pen branches | 只消费 page loader；删除品牌/型号 legacy body、placeholder 和 generic social-image fallback |
| `src/components/library/BrandMuseum.tsx` | `BrandMuseum` | 改为纯 props renderer 或由 `BrandEncyclopediaPage` 替换；正式 story、timeline、全量 models、sources |
| `src/components/library/ModelArchive.tsx` | `ModelArchive`, `prepareSourceMaterial` | 移除 legacy body 职责；改为 specs/evidence/variants/sources 纯展示或替换 |
| `src/lib/library.ts` | `getModelSpec`, `getModelVariants`, `getEntityReferences`, `getTimelineForEntity`, `getBrandPublicModels`, `getPrimaryProductImage` | 复用安全 SQL 片段；不要从组件继续调用弱 contract helper。只在确有多消费者时扩展公共 helper |
| `src/lib/public-visibility.ts` | `getPublicEntityBySlug`, `publicEntityFilter` | 保持 public authorization 语义；避免复制新的 eligibility filter |
| `src/lib/public-media.ts` | `publicMediaFilter`, `getPublicMediaUrl` | 复用 stable public URL 防线；renderer 再加 primary/attribution/entity-exact contract |
| Markdown renderer/helper (现有实现文件) | heading rendering / sanitization | 只做 headings/anchor/TOC 所需的最小扩展，保持现有 sanitation |
| `tests/e2e/renderer.spec.ts` (new, suggested) | disposable renderer fixture + desktop/mobile assertions | 独立覆盖 PAGE-01..08，不改 Phase 19 lifecycle spec |
| `tests/e2e/site-quality.spec.ts` | `expectNoHorizontalOverflow` | 可提取/复用 helper；不要依赖默认无 brand/pen fixture 证明 renderer mobile 合格 |

不需要新 migration，除非实现阶段证明现有 schema 无法表达 entity-exact media。若遇到该问题，应先记录为 data-contract gap，再决定是否单独规划；不要在 Renderer 任务中顺手扩张 taxonomy/media schema。

## Validation Architecture

### Wave 0 — contract tests before UI

先建立 disposable renderer fixture 和 page-loader tests，再改页面。fixture 最少包含：

1. 一个 public brand：60–160 字中文摘要、唯一 published `brand_story`、两条 approved timeline、qualified sources、合格 primary image、15 个 public models。
2. 一个 public pen：60–160 字中文摘要、唯一 published `model_story`、唯一 canonical brand、若干 evidence-backed specs、至少两个 qualified variants、qualified sources、合格 primary image。
3. legacy `entities.body_md` 与 deprecated/非 expected story 中放入醒目的 sentinel 文本，断言页面永不出现。
4. 无证据 spec、unapproved/unqualified variant、unqualified source、gallery-only media、remote-only media、missing attribution media，各放一条 sentinel，断言不进入 view model/页面。
5. 一个 optional-data-empty case，用于断言模块被省略且全页不出现“暂无规格/暂无来源/暂无图片”等文案；它不应被当作满足 PAGE-04 必备数据的品牌 happy path。

fixture 必须使用独立 ID/slug，测试前后显式清理；不要修改 `tests/e2e/publication-gate.spec.ts` 的 lifecycle sequence，也不要依赖测试执行顺序。

### Query-contract assertions

直接测试 `getPublishedEntityPage` 或其 SQL seam：

- 非 public slug → `null`。
- public brand/pen → story type/status 恰好正确，legacy/deprecated sentinel 缺席。
- duplicate/missing expected story → explicit invariant，不能回退。
- specs 逐字段都带 qualified evidence/source；unsupported fields 缺席。
- variants 只含 approved + qualified source/scope rows。
- primary image 必须 primary、stable、attributed、current-entity；gallery/remote/generic fallback 缺席。
- brand model count 与返回全量一致（使用 15 条证明没有 12 条截断）。
- model canonical brand count exactly 1；重复关系不能被 `LIMIT 1` 隐藏。

### Browser requirement matrix

| Requirement | Desktop assertion | Mobile assertion |
|---|---|---|
| PAGE-01 | summary 可见、字符数 60–160、正文另有 article | 同内容完整、首屏不遮挡 |
| PAGE-02 | published story sentinel 可见；legacy/deprecated sentinel 不可见 | server HTML/移动页相同 |
| PAGE-03 | supported specs、variants、sources、primary image 可见；unknown placeholder 不可见 | facts cards/table 可操作且不撑宽 |
| PAGE-04 | brand story、2+ timeline、1+ model、sources、brand image | 模块顺序正确、timeline 可读 |
| PAGE-05 | image URL 为本地/受控，license/attribution 可见，示意 sentinel 不当 hero | 图片不溢出，caption 可换行 |
| PAGE-06 | 完整 story 各章节及归因 source links 可达，无截断 | TOC 跳转每个 heading，正文无缺段 |
| PAGE-07 | section nav、tables、sources、variants、relations 可用；整页无 overflow | `expectNoHorizontalOverflow` + 触控/焦点/导航检查 |
| PAGE-08 | 15 个型号名称/链接全部存在且计数 15；型号只有一个 canonical brand link | 同样全量，不以 carousel/recommendations 代替 |

### Targeted commands

实现期按风险从窄到宽运行，不使用 Phase 19 monolithic wrapper：

```bash
pnpm exec playwright test tests/e2e/renderer.spec.ts --project=desktop
pnpm exec playwright test tests/e2e/renderer.spec.ts --project=mobile
pnpm exec tsc --noEmit
pnpm biome check <本阶段实际改动文件>
```

若需要确认没有破坏既有公开边界，只补跑现有定向 spec：

```bash
pnpm exec playwright test tests/e2e/publication-gate.spec.ts --project=desktop
```

这项回归是只读验证，不应借机修改 Phase 19 fixture/lifecycle。全量 `pnpm test:e2e` 留给后续集成阶段，不是 Phase 20 日常循环。

### Manual acceptance

在 renderer fixture 上保存四类证据：brand desktop、brand mobile、pen desktop、pen mobile。每张证据应能看到 summary + 正文 + 至少一个结构化事实/关系模块；另记录页面宽度与 `scrollWidth <= clientWidth`。由于真实 public 为 0，必须在验收说明中明确“这是 renderer fixture evidence，不是 305 条真实库存发布证据”。

## Implementation Order

### Plan 20-01 — Published page query contract

1. 建立 `BrandPageData | ModelPageData` 与 `getPublishedEntityPage`。
2. 以 `public_entities` + expected published story 实现同 snapshot 读取。
3. 接入 qualified specs/evidence、variants、sources、timeline、media、canonical relations。
4. 先写 query-contract tests，证明 legacy/deprecated/unqualified 数据不会泄漏。

**Verify:** PAGE-02/03/05/08 的数据层断言全部通过；没有 UI fallback 能绕过 loader。

### Plan 20-02 — Brand/model encyclopedic renderer

1. 让 route/metadata/JSON-LD 共用 page view model。
2. 渲染 60–160 字 summary 与完整 published story。
3. 将 BrandMuseum/ModelArchive 收敛成纯展示组件或一次性替换。
4. 加入 evidence specs、variants、timeline、qualified sources、attributed primary image、全量/canonical relations。
5. 空 optional module 省略，required invariant 不静默降级。

**Verify:** desktop renderer spec 覆盖 PAGE-01..06、PAGE-08；legacy sentinel 和所有“暂无…”占位均缺席。

### Plan 20-03 — Responsive navigation and content integrity

1. 从 story headings 生成稳定章节导航。
2. 完成 desktop sticky TOC 与 mobile 可操作目录。
3. 处理 table、URL、image、variant、relation 的局部 overflow/focus/touch states。
4. 用 brand/pen 两种 viewport 执行完整页面与无横向溢出验证。

**Verify:** renderer desktop/mobile specs 均通过 PAGE-07；正文/来源/关系在 server HTML 中完整存在。

### Plan 20-04 — Focused regression and evidence handoff

1. 跑 renderer 两个 project、typecheck、changed-file Biome。
2. 定向跑既有 publication gate spec，确认 public 404/lifecycle/full-model relation 未回归。
3. 记录 fixture evidence 与真实 public=0 的边界，不声称内容 rollout 完成。

**Verify:** 只提交 Phase 20 renderer/query/UI/tests；Phase 19 fixture、migration/readiness 和真实 inventory 无 diff。

## Failure Modes to Plan Against

1. **Legacy fallback 掩盖缺失 story**：页面看似有正文，但违反 PAGE-02。缺 story 必须 invariant，不得读 `body_md`。
2. **先 gate 后多次独立查询的 race**：critical edit 已 demote publication，页面却混出旧授权与新内容。用同 snapshot loader。
3. **把 approved 当 qualified**：references/variants 有 approved 状态但缺 retrieval/archive/tier/scope。公开 query 必须 join qualified views。
4. **把 gallery 或 generic cover 当 primary image**：有图不等于实体准确主图；禁止 fallback 升级。
5. **license 被误当成图像语义**：`site-original` 不等于“实拍当前型号”。没有 entity-exact 证据就不放 hero。
6. **UI 用 `LIMIT 1` 隐藏坏 cardinality**：重复 canonical brand 必须测试失败，不能静默取第一条。
7. **品牌型号列表被推荐/分页截断**：PAGE-08 是全量 canonical relation；性能优化也不能把准确计数变成当前页长度。
8. **空模块公开占位**：`暂无…` 暴露数据缺口并违背 PAGE-03；optional module 直接省略。
9. **摘要替代正文**：summary 和 article 都必须存在且语义角色不同。
10. **TOC 与 Markdown headings 分叉**：硬编码导航会失效；从同一 story AST/headings 生成。
11. **局部 table 修好但整页仍 overflow**：长 URL、attribution、relation chips、pre/image 都要进入 mobile matrix。
12. **fixture 被误报为真实内容证据**：Phase 20 只证明 renderer；305 条内容生产和发布属于后续 phases。

## Planning Handoff

Phase 20 的计划不应以“美化现有详情页”为任务表述。正确的依赖顺序是：**先锁定 current-public page query → 再建立 brand/model view model → 再渲染正式 story 与 evidence modules → 最后做 responsive/E2E。** 只要 story、source、media、relation 仍由不同组件独立查询，PAGE-02/03/05/08 就无法形成可证明的一致页面。

本阶段最关键的完成定义：对同一个 disposable public entity，页面读取的每一项正式内容都能追溯到同一 current publication snapshot；没有任何 legacy/deprecated/unqualified fallback；品牌与型号在 desktop/mobile 都完整可读。真实库存仍为 public=0 是已知输入，不是 Phase 20 可以通过生成内容解决的问题。

## RESEARCH COMPLETE
