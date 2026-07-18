---
phase: 21
slug: taxonomy
status: draft
shadcn_initialized: false
preset: none
created: 2026-07-19
inherits: 20-renderer/20-UI-SPEC.md
---

# Phase 21 — UI Design Contract

> Taxonomy 与身份归一对现有百科页的可见合同。Phase 21 只校正用户看到的名称、层级、关系和 canonical 到达结果；视觉与交互继续由 Phase 20 Warm Pen Atlas 合同治理。

---

## Contract Intent

用户无论从 canonical URL、旧 slug、地区名或历史别名进入，最终只看到一个可信实体：页面 H1、面包屑、metadata、品牌归属和站内导航使用同一 canonical 身份；alias、地区名、edition 和 variant 只解释身份，不制造重复页面。

### Governing Inputs

| Input | Locked contract |
|---|---|
| `21-IDENTITY-RESEARCH.md` | MR/Metropolitan/Cocoon、Elabo/Falcon、Moonman/Majohn、PGS/四季织、JunLai/Wing Sung 630、Asvine P36 的 canonical 与层级结论 |
| `REQUIREMENTS.md` TAX-01–06、EXP-05 | alias 归一、merge/split/rename/retire、family/edition/variant、争议身份 fail closed |
| `REQUIREMENTS.md` PUB-03/04/07、PAGE-08 | `public_entities` 为唯一公开集合；品牌全部型号与型号唯一品牌双向一致 |
| `20-UI-SPEC.md` | Warm Pen Atlas 视觉 token、百科 shell、44px 触控、mobile 无横向溢出、无空状态卡 |

---

## No-New-Surface Boundary

Phase 21 **不新增任何公开 surface**。允许的 UI 变化只有现有百科 shell 内的身份文本、层级文本、canonical 链接和已有 `版本差异` 内容。

| In scope | Explicitly out of scope |
|---|---|
| 修正现有 H1、breadcrumb、metadata、JSON-LD 与 canonical URL | 新页面模板、alias 详情页、edition/variant 独立页 |
| 在现有 header 增加可省略的 `亦称` / `地区名称` / `曾用名` 文本行 | 搜索、搜索建议、LLM/Chat、AI 解释 |
| 在现有 breadcrumb / `版本差异` 中表达 family → model → edition → variant | taxonomy 管理后台、审核队列、争议说明页 |
| 旧 URL 永久重定向到现有 canonical 页面或最接近的现有 canonical 父页面 | redirect 选择页、迁移提示页、toast、modal |
| 去重品牌型号列表、关系入口和探索链接 | 新 palette、字体、icon library、component registry 或动效语言 |

不存在独立 route 的 family、edition 或 variant 只显示为非链接层级文本或现有 `版本差异` 条目；不得为了让层级“可点击”而创建空壳页。

---

## Design System

| Property | Value |
|---|---|
| Tool | Manual Tailwind CSS 4 + 现有 CSS tokens |
| Preset | not applicable |
| Component library | 现有 project React components；不初始化 shadcn |
| Icon library | `@phosphor-icons/react` SSR icons；Phase 21 不新增 icon |
| Font | `--font-serif` / `--font-heading` / `--font-display` / `--font-label` |
| Visual identity | Warm Pen Atlas：暖纸面、白色 raised surface、棕色 accent、轻边框 |

`components.json` 不存在；本阶段复用 `EncyclopediaShell`、`EntityHeader`、`BrandMuseum`、`ModelArchive` 与 Phase 20 的 server-rendered view model。不得引入新设计系统或第三方 registry。

---

## Spacing Scale

与 Phase 20 完全一致，只使用 4 的倍数：

| Token | Value | Usage |
|---|---:|---|
| xs | 4px | identity label 与值的近邻间隔 |
| sm | 8px | 多条 alias / hierarchy item 间隔 |
| md | 16px | mobile gutter、默认间距、panel padding |
| lg | 24px | desktop panel padding |
| xl | 32px | 模块间距、desktop grid gap |
| 2xl | 48px | story / facts / explore major break |
| 3xl | 64px | desktop page breathing room |

Exceptions: 站内链接、breadcrumb link、品牌/型号 link 和 CTA 最小触控高度 44px。纯文本 alias、地区名和层级 label 不是伪按钮，不强制 44px，也不得绘制 chip/button 外观。

---

## Typography

| Role | Size | Weight | Line Height | Usage |
|---|---:|---:|---:|---|
| Label | 14px | 600 | 1.5 | `亦称`、`地区名称`、`曾用名`、`产品层级` |
| Body | 16px | 400 | 1.8 | identity value、breadcrumb、summary、版本层级 |
| Heading | 20px | 600 | 1.2 | 既有 section heading |
| Display | 32px | 600 | 1.2 | 唯一 canonical H1 |

仅使用 400 与 600。canonical H1、长地区名和层级路径允许自然换行，不使用 line clamp、ellipsis 或缩小字号掩盖溢出。

---

## Color

| Role | Value | Usage |
|---|---|---|
| Dominant (60%) | `#F7F5F0` / `--color-surface` | 页面背景与阅读留白 |
| Secondary (30%) | `#FFFFFF` / `--color-surface-raised` | 既有 hero、facts、TOC、source cards |
| Accent (10% max) | `#9A5B22` / `--color-accent` | 可点击 canonical link、当前目录、focus ring |
| Destructive | not used | Phase 21 无 destructive action |

Accent reserved for: 可点击链接、focus-visible outline、当前目录状态与既有 section icon。alias、地区名、层级 label、draft 状态不得用 accent 制造链接或 badge 假象。Dark mode 继续使用既有 token remapping。

---

## Canonical Identity Presentation

### Header Order

现有 `EntityHeader` 的可见顺序固定为：

1. canonical breadcrumb；
2. type kicker；
3. 唯一 canonical H1；
4. 可选 identity lines：`地区名称` → `亦称` → `曾用名`；
5. 60–160 字 summary；
6. 型号唯一 `品牌：{canonical brand}` 链接；
7. 其余 Phase 20 模块。

Identity line 是 header 内的语义 `<dl>` / description rows，不新建 card、accordion 或 sidebar。某一类没有 approved 值时整行省略，不显示 `暂无别名`、`未知地区` 或空 label。

### Title, Alias and Region Rules

- H1 只显示 canonical 中文展示名；地区名、旧名和市场俗称不得与 H1 并列成多个标题。
- `地区名称` 格式为 `{地区}：{名称}`，多项以 ` · ` 分隔，例如 `日本：Cocoon · 海外：Metropolitan · 中国：88G`。
- `亦称` 只显示已审核、确实指向同一实体的 public aliases；`曾用名` 只显示历史品牌名或旧商标。
- canonical 名本身、仅大小写/全半角/标点不同的重复项、内部 key、错误 alias 与未决候选必须去重或排除。
- alias 是解释文本，不是第二条 canonical link；旧 alias URL 的可达性由 redirect 实现。
- licensed marketing name 不是第二 canonical 品牌。仅在身份已解决并公开后，可用普通文本 `授权销售名：{name}（{scope/date}）`；它不得进入型号页的 `品牌` 区。

### Metadata and Structured Data

- `<title>`、description 所引用名称、`alternates.canonical`、Open Graph、Twitter、JSON-LD `name` 与当前 H1 使用同一 canonical entity。
- JSON-LD `alternateName` 可包含 approved aliases；错误 alias、draft 候选和内部别名不得进入。
- Breadcrumb HTML 与 Breadcrumb JSON-LD 使用 canonical name/path；旧 slug、旧 H1 和 alias 不得残留为当前页 crumb。
- 所有内部链接只输出 canonical URL。页面不得通过 canonical tag 掩盖仍返回 200 的重复 alias 页面。

---

## Redirect Contract

Redirect 在 metadata 和页面 HTML 生成前完成；旧 route 不得先渲染旧标题再跳转。

| Migration type | Visible behavior |
|---|---|
| alias / rename / merge | 旧 URL 返回 permanent redirect（Next.js `permanentRedirect` / 308）到唯一公开 canonical URL |
| edition / color / nib option 被降级 | 旧 URL redirect 到所属 canonical model 的稳定 fragment；目标仍是现有型号页 |
| split，旧 slug 可唯一对应一个子型号 | redirect 到该 canonical child model |
| split，旧混合页不能诚实选择一个 child | redirect 到现有 canonical brand parent；品牌页必须同时列出拆分后的全部公开 child models，不新增选择页 |
| retired generic placeholder | 不擅自指向某一真实型号；有合适 canonical brand parent 时 redirect 到品牌页，否则 404 |
| target 仍为 draft / identity dispute | 旧 URL 与 canonical candidate 都返回 404；不得 redirect 到隐藏页或公开迁移诊断 |

成功 redirect 后，地址栏、H1、breadcrumb、canonical metadata 与 JSON-LD 全部反映目标实体。不得有 redirect chain、loop、alias 页面 200 或一个旧 URL 随机落到多个目标之一。

---

## Family / Model / Edition / Variant Hierarchy

### Visible Levels

| Level | Public UI contract |
|---|---|
| Family | 可在 model breadcrumb 后半或 header 的 `产品层级` 中显示；没有既有 public route 时为纯文本 |
| Model | 唯一可出现在品牌 `全部型号（{count}）` 中的基础产品层；拥有 canonical H1 与 URL |
| Edition group | 在现有 `版本差异` section 内显示，带稳定 fragment ID；不计为品牌型号，不建新页面 |
| Variant | edition/model 下的颜色、镀层、普通尖宽、地区配置；在对应版本条目内显示，不进主导航或品牌型号数 |

产品层级使用语义有序列表或可换行的 inline trail：`family › model › edition › variant`。不可点击的 level 不画 underline，不使用 link color；可点击 level 必须指向已经存在且公开的 canonical 页面。

### Hierarchy Rules

- 机制、笔尖系统、尺寸、定位或购买决策明显不同并经 taxonomy 决议后，才可成为 sibling model。
- 普通色、镀层、普通尖宽、地区包装与同平台限定色默认留在 edition/variant。
- model 页面 H1 不随选中 edition/variant 改写，metadata 也不生成 edition/variant 的伪独立页。
- fragment target 使用稳定 canonical key；redirect 到 fragment 后，目标条目可用既有 focus/target 样式提示，但不弹 toast、不自动开 accordion。
- mobile 不使用深层树状缩进；每一级换行显示 label/value，最大仅保留 8px 视觉缩进。

---

## Brand–Model Relations and Duplicate-Free Navigation

### Brand Page

- `全部型号（{count}）` 只列该品牌下全部 **public canonical model**，按 canonical entity ID 去重。
- `count` 必须等于实际 link 数；alias、redirect source、family、edition、variant、draft、retired 和 unresolved entity 均不计数。
- merge 后只留 target 一项；split 后每个合格 child model 各一项；同一型号的地区名不得重复占位。
- 每个 link 的文案与目标型号 canonical H1 一致，href 直接使用 canonical slug，不经过旧 redirect。

### Model Page

- `品牌` 区恰好显示一个 public canonical brand link；0 或多于 1 条时沿用 Phase 20 fail-closed，拒绝渲染 partial page。
- 历史商标、授权销售标和制造者关系不能冒充第二 canonical brand；如需呈现，只能作为已审核的普通 identity/fact 文本。
- family/edition/variant 关系不能进入 `品牌` 区，也不能被 graph/recommendation 当作品牌归属证明。

### Navigation Dedupe

- breadcrumb、全部型号、关联词条、graph 和 recommendations 在输出前按 canonical target ID 去重；不能只按当前 name 或 slug 去重。
- alias route、redirect source 和已 merge entity 不能作为导航节点。
- 一个 canonical target 在同一区域只出现一次；canonical relation 与 `继续探索` 仍按 Phase 20 分区，探索结果不改变权威计数。

---

## Disputed and Draft Identity

身份冲突未解决时，公开 UI 的正确状态是 **不存在**，不是“展示争议”。

- draft / unresolved entity 不出现在 detail、brand models、browse、sitemap、graph、recommendations、metadata 或 JSON-LD。
- 直接访问返回既有 404：`这个页面不存在`；不得显示 `身份待确认`、内部 blocker、候选品牌或审核状态。
- 不给 draft target 建 public redirect。只有身份解决、唯一 canonical brand 建立、内容重新审核并进入 `public_entities` 后，旧 URL 才能启用 permanent redirect。
- 争议关系不得暂时取第一条品牌；型号品牌 cardinality 不是可降级展示项。

---

## Exact Before / After Examples

| Case | Before（禁止继续出现） | After（可见合同） |
|---|---|---|
| Cocoon ≠ 贵妃 | H1 `百乐 Pilot 贵妃 Cocoon`；把 `贵妃` 当 Cocoon alias；Cocoon/Metropolitan/88G 重复型号 | 单一 H1 `百乐 MR／Metropolitan（日本名 Cocoon，中国名 88G）`；breadcrumb 为 `首页 › 百乐 Pilot › {canonical H1}`；`地区名称：日本：Cocoon · 海外：Metropolitan · 中国：88G`；title/OG/JSON-LD 均用 canonical H1；`贵妃` 在 H1、alias、breadcrumb、metadata、JSON-LD 中全部缺席；旧错误 slug permanent redirect 到 canonical model；FP-60R 卡利贵妃保持独立身份 |
| Elabo / Falcon | 两个重复型号、两个品牌列表项或把 Falcon nib 当成 Falcon 成品型号 | 单一 H1 `百乐 Elabo（海外名 Falcon）万年笔`；breadcrumb 为 `首页 › 百乐 Pilot › {canonical H1}`；`地区名称：日本：Elabo · 海外：Falcon`；Elabo/Falcon 旧 route 都 redirect 到同一 canonical URL/metadata；百乐品牌页只计一个 model；FA/Falcon nib 只作技术关系 |
| PGS 四季织 | `写乐 Sailor 四季织 1224` 被计为基础 model；四个配色各自进入品牌全部型号 | 品牌页只列一次 `写乐 Professional Gear Slim（PGS）万年笔`；redirect 后 breadcrumb 为 `首页 › 写乐 Sailor › {PGS canonical H1}`；现有 `版本差异` 中显示 `Professional Gear › Professional Gear Slim › SHIKIORI／四季织 11-1224 › {配色}`；旧四季织 route redirect 到 PGS canonical page 的 `#shikiori-11-1224`；H1 与 metadata 仍为 PGS canonical model，edition/color 不增加型号 count |
| JunLai 630 | 同时出现 `Wing Sung 630` 与 `JunLai 630`；或未经解决就挂到 Wing Sung 品牌 | 当前中等置信度/授权冲突未完成 publication 前，两条 route 均 404，所有发现入口与 metadata 均无该项。未来只有在身份解决并重新发布后，才显示单一 H1 `君来 JunLai 630`；`Wing Sung／永生 630` 仅作有时间与 6 系 scope 的授权销售名，旧 route redirect 到 JunLai canonical；绝不把 JunLai 与 Wing Sung 全局品牌合并 |

---

## Responsive and Accessibility Contract

### Desktop (`>=1024px`)

- 延续 Phase 20 最大 1152px、8/4 main/rail、32px gap、72ch story。
- identity rows 位于 H1 与 summary 之间，最大宽度 72ch；不得挤进 right rail。
- product hierarchy 可横向排列但必须自然换行；不得产生独立横向滚动区。

### Mobile / Tablet (`<1024px`)

- 顺序固定为 breadcrumb → H1 → identity rows → summary → canonical brand → hero → 既有内容。
- page gutter 16px；alias、地区名、breadcrumb、层级路径与长型号名使用 `overflow-wrap:anywhere`，不截断。
- family/model/edition/variant 改为逐行 label/value；不使用深层缩进、横向树图或 hover-only tooltip。
- 页面级 `scrollWidth <= clientWidth`；只有 Phase 20 已允许的 story table/pre/mobile TOC 可局部滚动。
- 只有真正的 link 才获得 44px target、underline/focus ring；纯文本 alias 和层级不可伪装成可点元素。

### Server and Assistive Technology

- canonical H1、identity rows、breadcrumb、品牌关系和层级必须在 server HTML；不得等 hydration 后改名或去重。
- breadcrumb 使用 `nav[aria-label="面包屑"]`；产品层级若单独成行使用 `nav[aria-label="产品层级"]` 或语义 `<ol>`。
- redirect target 的 focus 顺序从 canonical 页面顶部开始；fragment target 使用 `scroll-margin-top: 96px`。
- reduced motion 下 fragment 跳转不强制 smooth scroll。

---

## Copywriting Contract

### Added Identity Labels

| Element | Exact copy |
|---|---|
| Generic alias | `亦称` |
| Market-scoped name | `地区名称` |
| Historical brand/mark | `曾用名` |
| Product hierarchy | `产品层级` |
| Scoped licensed name | `授权销售名` |
| Canonical brand | 沿用 Phase 20：`品牌：{品牌名}` |
| Brand model list | 沿用 Phase 20：`全部型号（{count}）` |
| Variant section | 沿用 Phase 20：`版本差异` |

Primary CTA 继续沿用 `继续探索关系图谱`；Phase 21 不增加 CTA。Optional identity line 为空时不显示任何 empty copy。404 沿用 `这个页面不存在` / `可能是链接有误，或者页面已经被移除了`。无 destructive action。

文案不得出现 `canonical`、`same_as`、`regional_variant_of`、`draft`、`unresolved`、`made_by`、review status 或 migration note。界面只用用户能理解的自然中文身份关系。

---

## Existing Component Responsibilities

| Existing responsibility | Phase 21 extension |
|---|---|
| `PublishedPageData` / loader | 只返回 canonical root、approved public aliases/scopes、唯一 brand 与去重 hierarchy；继续从 `public_entities` 授权 |
| `EntityHeader` | canonical H1；可选 identity rows；canonical breadcrumb，不查询或推断 identity |
| `BrandMuseum` | 按 canonical entity ID 输出全部 public models 与准确 count；不显示 editions/aliases |
| `ModelArchive` | 在既有 `版本差异` 中输出 edition/variant 层级与稳定 fragment；不创建独立页 |
| route metadata | redirect 优先；所有 metadata/JSON-LD 使用 canonical root；approved alias 仅进入 `alternateName` |
| graph/recommendations | 只消费 canonical public targets 并去重；不得复活 redirect source 或 draft candidate |

组件保持纯 props renderer；Phase 21 不新增组件内 SQL、client identity fetch 或运行时名称猜测。

---

## Visual State Matrix

| State | Expected UI |
|---|---|
| Canonical model with regional names | 一个 H1 + 一行 `地区名称` + 一条 canonical brand link |
| Canonical model without alias | identity rows 全部省略，H1 与 summary 间距仍为 Phase 20 节奏 |
| Alias/rename/merge old URL | 一次 permanent redirect；只渲染 canonical target |
| Edition/color old URL | redirect 到 model + stable fragment；版本条目可见，H1/metadata 不变成 edition |
| Split old mixed URL | 到既有 canonical parent；两个 public child 在 `全部型号` 各出现一次 |
| Draft/unresolved identity | 404；所有公开入口、metadata、JSON-LD、关系和计数均不存在 |
| Long multilingual identity | 自然换行，无省略号、无 page-level overflow |

---

## Verification Contract

UI checker、planner 与 executor至少验证：

- 任一 alias/rename/merge fixture 的旧 URL 只发生一次 permanent redirect，最终 H1、breadcrumb、canonical link、OG/JSON-LD name 和地址栏一致。
- Cocoon fixture 中 `贵妃` 在 alias、breadcrumb、metadata 和关系中为 0 次；Cocoon/Metropolitan/88G 只对应一个 canonical model。
- Elabo/Falcon 在百乐品牌 `全部型号` 中只出现一个 link，型号页只有一个 canonical brand。
- PGS 四季织 fixture 的 edition/colors 只出现在 `版本差异` hierarchy，不增加品牌 model count；旧 slug 到达稳定 fragment。
- JunLai 630 unresolved fixture 在 detail、brand models、browse、sitemap、graph、recommendations、metadata/JSON-LD 中均不可见；两条 direct route 都是 404。
- merge 后同一 canonical target 在 breadcrumb/models/relations/explore 的同一区域只出现一次；split child 各出现一次且 href 已 canonicalize。
- brand model heading count 等于实际 canonical model links；model canonical brand link 恰好 1 条。
- desktop 与 mobile 上长中英文 H1、地区名称、层级路径和型号列表均完整可读，page-level `scrollWidth <= clientWidth`。
- JS disabled / hydration pending 时 canonical name、identity lines、breadcrumb、hierarchy 与 canonical relations 已存在于 server HTML。

测试 fixture 只能证明 taxonomy UI 合同，不能表述为真实 305 条库存已经完成身份迁移或公开。

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|---|---|---|
| shadcn official | none | not applicable — shadcn not initialized — 2026-07-19 |
| Third-party registries | none | not applicable — no registry code enters Phase 21 — 2026-07-19 |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
