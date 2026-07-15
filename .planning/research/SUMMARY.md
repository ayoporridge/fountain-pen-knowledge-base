# Research Summary: v1.2 内容百科化与型号扩容

> 综合日期：2026-07-15<br>
> 综合范围：内容基线、发布契约、品牌/型号覆盖矩阵与项目目标<br>
> 核心结论：**先建立统一发布门槛，逐条修复或退出现有 296 个公开品牌/型号，再扩充 P0、P1；不得批量复活 deprecated 旧稿。**

## Executive Summary

v1.2 首先是一次**发布系统修复**，其次才是内容扩容。当前数据库并不缺少 row，但“记录存在”“审核通过”“页面真正显示”“达到百科内容门槛”被旧系统混成了同一件事：pen/brand 只要不在手工隐藏名单中就能公开；renderer 又会隐藏大量 summary、story、spec、claim 和 media；旧 audit 则把 deprecated、pending、needs_source、candidate、draft 也计为完成。结果是技术上可访问的页面很多，用户可读内容却大量缺失。

当前严格公开集合为 65 个品牌、231 个型号，共 296 页。其中 243 页没有可见叙述正文，222 个型号没有可见规格，56 页没有可见来源，228 页没有公开图片，294 页没有可见时间线。没有任何型号同时具备“可见正文＋可见规格”，也没有任何型号同时具备“正文＋规格＋来源＋图片”。仅有的 53 篇可见型号长文全部来自 Richard’s Pens 同一历史资料批次，不能代表现代产品覆盖，也不能自动通过新的来源、版权和语言门槛。

Montblanc 149 不是孤立坏数据，而是这一系统错位的完整缩影：58 字 summary 被隐藏，266 字 legacy body 因无 `source_url` 且过短而不显示，2020 字 `model_story` 已被明确标记为 `deprecated`，spec 为 `needs_source`，claim 为 `pending`，三张媒体均未通过严格公开过滤。旧 coverage audit 因只数 raw rows 给它 90 分，按实际可见内容只剩两条 reference，约 10 分。

因此 roadmap 不能从“新增 109 个型号”开始。正确顺序是：

1. 建立 `entity_publications`、`public_entity_readiness` 和唯一 `public_entities` 集合，让所有公开入口共享同一门槛。
2. 修正 audit、renderer、逐字段 citation、来源独立性、版本 scope、媒体许可和 content review。
3. 对现有 296 页逐条清账：每条要么达到 published 契约，要么保持 draft/retired 并完全退出公开面。
4. 先处理现有 taxonomy 错误和 Montblanc 149 等核心空壳，再修完其余现有品牌/型号。
5. 现有库存清账完成后，才处理覆盖矩阵 P0 13 项和 P1 54 项；P2 40 项应是后续批次，P3 2 项没有通过身份/来源门禁就继续隐藏。

现有 296 篇 deprecated brand/model story 是 migration 有意退役的 batch-generated narrative。**禁止以批量改 status 的方式恢复公开。** 旧稿最多只能作为研究线索；每一篇都必须重新查证、重写、完成事实与中文审核、生成新的 content hash，再以原子事务发布。

## 1. 当前真实基线

### 1.1 库存与严格公开集合

| 指标 | 品牌 | 型号 | 合计 |
|---|---:|---:|---:|
| 数据库实体 | 69 | 236 | 305 |
| 当前严格公开实体 | 65 | 231 | 296 |
| 有可见叙述正文 | 0 | 53 | 53 |
| 无可见叙述正文 | 65 | 178 | 243 |
| 有可见结构化规格 | 不适用 | 9 | 9 |
| 有可见来源 | 50 | 190 | 240 |
| 无可见来源 | 15 | 41 | 56 |
| 有严格公开图片 | 60 | 8 | 68 |
| 无严格公开图片 | 5 | 223 | 228 |
| 有可见时间线 | 2 | 0 | 2 |
| 无可见时间线 | 63 | 231 | 294 |

这组数字使用 `src/lib/public-visibility.ts` 与当前 renderer 的真实条件，而不是数据库行数。需要特别区分：

- 296 个公开 brand/pen 的 summary 都非空，但当前全部被 pen/brand 页面隐藏。
- 296 个公开实体各有一篇 deprecated `brand_story/model_story`；全库包含隐藏实体在内共有 313 篇，全部 deprecated。
- 231 个公开型号都有 model spec，但只有 9 个在旧规则下可见；207 个为 `needs_source`，15 个为 `pending`。
- 公开实体关联 365 条 claim，只有 13 条 approved；283 个实体没有 approved claim，而且当前详情页也不渲染 claim。
- 296 个公开实体都有 media row，但严格过滤后只有 68 个实体有图片。225 个型号虽有 nominal approved image，217 个仍因许可、remote-only、本地文件、usage 或其他公开条件被挡住，真正通过的只有 8 个。
- 65 个公开品牌中，Graphomatic、Monteverde、Duke、Aurora 没有合格的公开代表型号；Aurora 的泛称占位不能冒充具体型号。

### 1.2 内容结构的系统性偏斜

- 仅有的 53 个可见型号长正文全部来自 `richardspens.com`，长度 1891–19657 字，平均 5912.8 字，内容明显偏向欧美历史老笔。
- 现代常见型号大多只剩标题、标签、关系、来源链接或空状态提示。
- 94 个型号的可见来源只有 retailer；169 个型号既没有官方来源，也没有 high-reliability 来源；41 个型号没有任何可见来源。
- 9 个旧规则下 approved 的 spec 仍使用 row-level queue anchor，没有证明每个公开字段。按 v1.2 逐字段 citation 契约，它们不能自动视为合格。
- 目前没有任何型号同时具备可见正文与可见规格，也没有任何型号达到“正文、规格、来源、图片”四项完整标准。

这意味着引入新 publication gate 后，初始可发布集合可能非常小，甚至为零。确切数量必须由新的 readiness audit 全量计算，不能从旧 coverage score 推断。

## 2. Montblanc 149：系统性根因的回归样板

目标页：`/pen/万宝龙-montblanc-大班149-meisterst-ck`

| 层 | 数据现状 | 当前公开结果 |
|---|---|---|
| Identity | canonical 实体存在，但无 alias / external ID | 仅能显示标题与关系 |
| Summary | 58 字 | pen/brand summary 被 renderer 隐藏 |
| Legacy body | 266 字，`source_url = null` | 不满足当前长文放行条件，也不能承担未来正式 story |
| Story | 2020 字 `model_story`，`deprecated` | 页面不读取；状态也不允许公开 |
| Spec | `needs_source`；1 条有效 row citation | 因 spec 状态不合格而隐藏；未来还缺逐字段证据 |
| Claim | 1 条，`pending` | 计零且当前不渲染 |
| Reference | 2 条 approved | 页面唯一真正有效的内容资产 |
| Media | 3 张；两张 pending/candidate，一张 approved 但 remote-only | `publicMediaFilter` 后为 0 |
| Timeline / diagram | 无 timeline；diagram 为 draft | 均不可见 |

旧 audit 给出 90 分，是因为把 deprecated story、needs_source spec、pending claim、不可公开 media 和 draft diagram 全部当作“已有”。严格按实际公开条件只剩 reference，约 10 分。

Montblanc 149 应作为首个 A 档修复和精确回归 fixture，但修复动作不能是恢复旧 story：必须重新建立跨年代 scope、current/vintage generation 差异、逐字段规格证据、两个以上独立来源组、准确主图和自然中文正文。

## 3. Publication Gate：唯一公开真相

### 3.1 数据与 surface 契约

新增 `entity_publications`，至少记录：

- `status = draft | in_review | published | retired`
- `depth_tier = A | B | C`
- `quality_score`、`blockers_json`
- `content_hash`、reviewer、reviewed/published time

建立两个派生 view：

```text
public_entity_readiness
  = 按类型计算正文、来源、证据、版本、媒体、语言审核和 blocker

public_entities
  = publication.status = published
  AND readiness.publishable = 1
  AND blockers = 0
```

detail、metadata、sitemap、browse、facets、graph、recommendations、品牌全部型号列表和公开 API 必须读取同一个 `public_entities` 授权集合。品牌型号列表按 reverse `made_by` 完整枚举，不做代表性截断。未达标 slug 直接返回 404，并从所有公开入口消失；如需编辑预览，使用受保护、`noindex` 的 preview route。

所有新 publication 默认 `draft`。补全与发布必须是原子操作，不能先公开壳页再慢慢补内容。summary、story、spec、claim、citation、variant 或 primary media 变化时，旧 content review 因 hash 失效而不能继续授权公开。

### 3.2 唯一有效审核状态

| 数据 | 可计入发布门槛的状态 |
|---|---|
| Entity | `published` |
| Brand/model story | `published` |
| Claim | `approved` |
| Model spec | `approved`，且每个公开字段有 approved citation |
| Entity reference / source | relation 与 source item 均 `approved` |
| Timeline / variant | 自身与来源均 `approved` |
| Media | `approved` + `primary/gallery` + 可复用许可 + 实体匹配 |
| Content/language review | `approved` 且绑定当前 content hash |

`reviewed`、`pending`、`needs_source`、`needs_review`、`needs_license`、`candidate`、`draft`、`deprecated`、`rejected`、`hidden` 全部计零，不能靠总分或其他模块补偿。`reviewed` 只表示进入审核流程，不等于面向公众发布。

### 3.3 型号页硬门槛

每个公开型号必须同时满足：

1. **身份**：canonical name、slug、品牌关系清楚；alias、重复、型号/variant 边界和身份冲突已解决。
2. **摘要**：60–160 个中文可见字符，能独立说明产品身份与最重要特征，无模板句和编辑话术。
3. **正式正文**：只有 `published model_story` 计入。
   - A 档经典型号：2000–3500 字。
   - B 档主流型号：1000–1800 字。
   - C 档长尾、入门或资料较少型号：500–900 字。
4. **主题覆盖**：身份与产品线位置；历史与重要性；外形、尺寸、材料与握持；笔尖、出水或有归因的体验；上墨、清洗与维护；版本、现售/停产边界和购买检查点。
5. **结构化规格**：至少 5 个公开字段；品牌、时代/年份、笔尖、上墨、材质为核心，尺寸或重量至少一项。每个字段必须有独立 approved citation 与 evidence locator；未知值不展示，不写占位语。
6. **来源**：至少两个独立来源组；至少一个一手来源或同期档案，同时至少一个独立专业二手来源。
7. **版本边界**：已知年代、市场、尖号、材料或特别版差异必须建 approved scope/variant；未解决冲突阻止发布。
8. **主图**：至少一张确实对应当前型号、许可与 attribution 完整、可稳定加载的 approved primary image。
9. **公开体验**：不得出现“暂无规格/来源/图片/时间线”等占位块。必需模块缺失时整条不公开。

A/B/C 只区分正文深度与研究优先级，不是事实、来源、媒体或语言质量豁免。Montblanc 149、Parker 51、LAMY 2000、Pilot Custom 823 等标志性型号按 A 档处理。

### 3.4 品牌页硬门槛

每个公开品牌必须同时满足：

- 60–160 字自然中文摘要和一篇 `published brand_story`。
- 说明起源、制造者/公司身份、发展节点、代表设计或技术及当前状态。
- 至少一个已经达标并公开的代表型号。
- 至少两个 approved timeline 节点；重要品牌应更完整。
- 至少两个独立可靠来源，其中至少一个一手或档案来源。
- 至少一张对应品牌、许可完整的 approved primary image。
- 创立年份、产地、所有权和关键历史节点均有 approved claim/citation。

极小或消失品牌可以采用 C 档正文，但不能免除身份、来源、代表型号和媒体门槛。

### 3.5 来源与证据硬门槛

覆盖矩阵的 S1–S4 适合描述 research lead，publication contract 的 A–D 则描述可支撑的事实用途。实施时应归一化为 `source_kind/source_tier`、`independence_group`、`allowed_use`、`retrieved_at` 和 evidence locator，不能只存一个模糊等级。

- 官方现行页可证明当前型号与当前规格，但不能自动证明历史版本。
- 官方目录、手册、专利、同期广告和档案优先支持历史与版本事实。
- 独立专业资料可支持历史、辨识与有归因的体验；retailer 更适合当前在售版本和价格快照。
- 同一新闻稿、商品文案的镜像或地区站点只算一个 independence group。
- S4/社区资料只能用于发现线索、常见问题和明确归因的体验，不能独立证明身份、材质、笔尖、年代或上墨机制。
- `link_only`、`metadata_only` 或 `forbidden` 来源不能支撑技术 claim/spec；查询必须检查 allowed-use，而非只检查 source 是否 approved。
- 来源冲突按 entity + predicate + variant/region/date scope 处理；未解决值不得进入规格卡，身份级冲突阻止整个实体发布。

覆盖矩阵提出的“一份 S1/S2 或两份 S3”应视为**进入研究队列的最低资料可得性**，不能替代最终发布门槛。最终公开必须执行更严格的“两独立来源组＋一手/档案＋专业二手”规则；否则两份 retailer 或只有一份官网仍可能制造单源脆弱页面。

### 3.6 评分与 blocker

评分只用于排序，不能替代硬门槛。发布必须同时满足总分 ≥80、各类别达到下限、必需项齐全、blocker 为 0、status 为 `published`。

| 类别 | 满分 | 硬下限 |
|---|---:|---:|
| 身份与版本 scope | 15 | 12 |
| 正文与摘要 | 25 | 20 |
| 结构化事实 / 品牌时间线 | 20 | 14 |
| 证据链与来源独立性 | 20 | 16 |
| 版本差异与冲突处理 | 10 | 7 |
| 媒体真实性和权利 | 5 | 5 |
| 中文自然度人工审核 | 5 | 5 |

## 4. 109 项覆盖矩阵：不是 109 个新页面

覆盖矩阵共记录 109 个 canonical model / taxonomy 处理项：

| 优先级 | 数量 | 含义 | 执行时点 |
|---|---:|---|---|
| P0 | 13 | 全球核心产品空洞、结构或身份问题 | 现有 296 清账完成后，作为第一扩容批次；其中现有 taxonomy 修复提前处理 |
| P1 | 54 | 主要品牌、区域与产品梯级 | P0 通过全量验收后分地区执行 |
| P2 | 40 | 入门、中端、旗舰与地域多样性补齐 | 建议作为 v1.2 stretch 或后续 milestone |
| P3 | 2 | Graphomatic Inkmaker、Duke 551 等资料弱/身份复杂项 | 来源或 identity gate 未通过就保持 draft/hidden |

109 是处理项，不是净新增页数，其中包含 missing model、brand+model missing、split/correction、alias/normalization 与 identity gate。实际新建数量只有完成 taxonomy 批次后才能确定。

### 4.1 P0 组成

13 个 P0 处理项为：Pilot Custom Urushi、Platinum Preppy、Sailor Pro Gear Slim、Montblanc 145、Caran d’Ache Léman、Aurora 88、Aurora Optima、Leonardo Momento Zero、S.T. Dupont Line D Eternity、Waterman Hémisphère、Opus 88 Demo、Opus 88 Koloro、Asvine P36。

其中 Sailor Pro Gear Slim、Waterman Hémisphère、Opus 88 Demo/Koloro、Asvine P36 涉及现有实体纠正或拆分，不应简单再建一页。Aurora 88 还承担替换泛称占位的任务。因此在修现有 296 的 taxonomy 阶段会提前消化一部分 P0，后续 P0 “扩容”净新增数必然小于 13。

### 4.2 关键 taxonomy 风险

| 风险类型 | 代表条目 | 规则 |
|---|---|---|
| 地区名 / alias 重复 | Pilot Metropolitan / Cocoon；Elabo / Falcon | 同一稳定产品家族只保留一个 canonical entity，地区名进入 alias |
| 品牌归属错误 | 意斯华 P36 → Asvine P36 | 纠正品牌、slug 与 alias，不创建重复型号 |
| 混合页需拆分 | Waterman Charleston / Hémisphère；Opus 88 Demo/Koloro；Leonardo Furore/Momento Magico | 机制、稳定型号名或购买决策不同则拆页，并迁移证据与关系 |
| 衍生款冒充家族页 | “四季织 1224”与 Sailor Pro Gear Slim | 先建 canonical family，再把配色/系列挂为 variant |
| 品牌介绍冒充型号 | Aurora 泛称占位 | 用真实 Aurora 88/Optima 替换，泛称页不得公开 |
| 商标/生产方冲突 | 台湾 SKB 与 Penton/SIKIB；Wing Sung / JunLai 630 | identity gate 未解决前不得发布或错误挂靠 |
| 资料弱历史条目 | Graphomatic Inkmaker、Duke 551 | 不能为解决“品牌零型号”而降低来源门槛 |

独立建页的依据应是稳定官方型号名，以及机制、笔尖系统、尺寸、定位或价位确实改变使用与购买决策。普通颜色、镀层、地区限定和 nib width 默认是 variant；中文俗称、旧译名、地区名和品牌旧名默认是 alias。

## 5. 建议 Roadmap Phases

以下顺序把“修发布边界”“修现有库存”“扩容”分开，避免一边新增空壳、一边继续用失真的 audit 验收。

| Phase | 交付目标 | 关键依赖 | Exit gate |
|---|---|---|---|
| 1. Publication Foundation | 新增 publication/status、readiness/public views；所有公开 surface 统一过滤；新实体默认 draft | 当前 schema 与公开 surface 枚举 | `public view parity failures = 0`；未达标实体从所有公开入口消失并返回 404 |
| 2. Measurement & Evidence | 生成 296 条 NDJSON/CSV 台账；重写 quality/coverage audits；增加逐字段 citation、source tier/independence/allowed-use、variant/conflict、content review/hash 与 fixture matrix | Phase 1 的统一 view | published blocker、unsupported spec field、unresolved conflict 均为 0；audit 不再把 raw row 当完成 |
| 3. Renderer & Review Pipeline | pen/brand 显示 summary 与唯一 published story；渲染 approved spec/variant/source/media；去除公开“暂无”块；增加语言、重复模板和媒体 audit | Phase 1–2 数据契约 | representative fixtures 全部通过；content hash 变化会使旧 review 失效 |
| 4. Existing 296 Repair | 先做 taxonomy 批次，再以 Montblanc 149 为 A 档回归样板；按 no-core-content、核心热门空壳、品牌零型号、缺正文/规格/来源/媒体顺序修完现有库存 | Phase 1–3 完成 | 296 条全部有终态：published 且达标，或 draft/retired 且完全退出公开面；不得有未盘点条目 |
| 5. Coverage P0 | 处理矩阵 13 个 P0；已在 Phase 4 纠正的项复用 canonical 结果，其余按 draft → research → review → atomic publish 新建 | Phase 4 全量清账、taxonomy 稳定 | P0 identity/canonical/alias 全通过；每个新公开页 blocker = 0；生产全量验收通过 |
| 6. Coverage P1 | 54 项按地区与品牌产品梯级分批；每批限制规模并独立验收 | Phase 5；稳定 importer/audit | 每批本地、远程数据库、正式站验收均通过后才进入下一批 |
| 7. P2/P3 & Milestone Closeout | P2 40 项作为 stretch/后续阶段；P3 2 项只在来源充分时发布；完成全库与 production 验真 | P0/P1 完成 | sitemap/public view 精确相等；全量 E2E 零重试；媒体、语言、链接和日志零失败 |

### Phase 4 的内部批次建议

1. **Taxonomy batch 0**：Asvine、Waterman、Opus 88、Leonardo、Sailor Pro Gear Slim、SKB/Penton、Pilot Metropolitan/Cocoon、Aurora 占位。
2. **A 档回归**：Montblanc 149 首先完成；随后处理 Parker 51、LAMY 2000、Pilot Custom 823 等标志性型号与主要品牌。
3. **B 档主流**：优先修 178 个无可见 narrative 的型号、222 个无可见 spec 的型号，以及来源/媒体高风险条目。
4. **C 档长尾**：补足较小或历史品牌/型号；资料不足的保持 draft，不为维持 URL 数量放宽门槛。
5. **品牌闭环**：品牌 story、时间线、claims、primary media 与至少一个已发布代表型号必须一起完成。

每个批次固定执行：dry-run/readiness → 写入 draft → facts/spec/story/media review → local audit/build/E2E → remote Turso audit → production deploy → 正式 URL 全量 live verify。新增或重写内容不能以抽样通过代替全量通过。

## 6. Research Flags、Confidence 与 Gaps

### 6.1 必须在实施前固定的 research flags

| Flag | 研究结论 | 实施动作 |
|---|---|---|
| `media_count_semantics` | publication contract 的 225 支型号“有公开图片”实际是 nominal approved；严格 `publicMediaFilter` 只有 8 支通过 | readiness 与所有报告只复用严格 media predicate，并把 nominal/backlog 分栏 |
| `legacy_body_renderer` | 基线观察到 53 个 pen legacy longform 被当前条件放行；contract 又明确正式 pen/brand 正文只能是 published story | 先核对当前 renderer；迁移后 `entities.body_md` 不再为 pen/brand 提供发布资格 |
| `source_gate_mismatch` | 覆盖矩阵的 S1/S2 或双 S3 比最终 publication gate 宽松 | 前者只作为 research intake；公开以双独立来源＋一手/档案＋专业二手为准 |
| `tier_mapping` | S1–S4 与 A–D 不是一一对应，尤其 S3 同时混合专业资料与 retailer | 建立结构化 source kind、reliability、independence、allowed-use，而非机械换算等级 |
| `future_ready_count` | 9 个旧 approved spec 缺逐字段 citation；53 个可见 longform 也不是 published story | 新 view 上线前全量模拟，报告精确 initial publishable count；不得假定现有样板可直接 grandfather |
| `coverage_net_count` | 109 含 alias、split、correction、identity gate，不等于新增实体数 | taxonomy batch 完成后重新计算 create/update/merge/retire 数量 |
| `single_source_longform` | 53 篇 Richard’s Pens 长文的 allowed-use、独立来源和站内正文身份尚未证明 | 逐篇审查许可与用途；必要时仅作 source material，重写为有多源证据的站内 story |
| `media_acquisition_scale` | 223 个公开型号没有严格公开图片，媒体是大规模阻塞项 | 内容批次从研究开始同步处理准确型号图、许可、落地文件、attribution 与实体匹配 |

### 6.2 Confidence

| 结论 | Confidence | 依据 |
|---|---|---|
| 当前 296 页的严格可见性基线与 Montblanc 149 根因 | High | 2026-07-15 全库、非抽样审计，并按当前 public filter/renderer 计算 |
| 必须先建立统一 publication gate，再修现有库存 | High | 三份研究在根因、旧 audit 假阳性和公开集合错位上结论一致 |
| 109 项矩阵的方向、区域覆盖和 P0/P1 优先级 | Medium-High | 已用官方、档案、博物馆和专业资料 live 核验，但部分 identity gate 尚未解决 |
| A/B/C 字数、80 分及分类硬下限 | Medium | 是清晰可执行的编辑政策，仍需用少量完成页校准可读性与实际研究成本 |
| P2/P3 的 milestone 归属与总工期 | Low-Medium | 未提供单页研究/写作/媒体平均工时，且净新增数量尚未完成 taxonomy 归并 |

### 6.3 尚未解决的 gaps

- 新 gate 下 initial publishable entity 的精确数量尚未计算；预期会远低于当前 296。
- 109 项最终会产生多少 create、merge、split、rename、alias 和 retire，需 taxonomy batch 后才能给出。
- 品牌 story 的 A/B/C 篇幅尚未像型号页一样给出清晰区间；实施前应补充品牌深度 tier。
- 大规模合法实物图片的取得成本、可用来源和人工 subject review 吞吐量尚无估算。
- Richard’s Pens 53 篇长文的版权/allowed-use 与可否继续全文展示尚未逐篇确认。
- 现有公开 URL 被 gate 隐藏后的 SEO/redirect 策略未展开；canonical merge 应有 redirect，未达标内容则按契约返回 404。
- 矩阵外部 URL 是 2026-07-15 live source 快照；实现时必须保存 retrieved_at、必要的 archive/evidence locator，并重新确认在售状态。
- 没有可靠工期估算。Phase 5/6 不应在 Phase 4 完成前并行写入新实体，否则会放大 backlog 与验收压力。

## 7. Sources

本摘要综合以下四份项目资料，决议优先级为：项目目标定义范围，内容基线定义 live truth，publication contract 定义最终公开标准，coverage matrix 定义扩容候选与 taxonomy 动作。

1. [PROJECT.md](../PROJECT.md) — v1.2 目标、约束、已验证能力与 scope。
2. [V1.2-CONTENT-BASELINE.md](./V1.2-CONTENT-BASELINE.md) — 2026-07-15 `data/fpkg.db` 全量、非抽样公开可见性审计。
3. [V1.2-PUBLICATION-CONTRACT.md](./V1.2-PUBLICATION-CONTRACT.md) — 内容职责、审核状态、来源/媒体/版本规则、数据迁移、audit、E2E 与完成定义。
4. [V1.2-MODEL-COVERAGE.md](./V1.2-MODEL-COVERAGE.md) — 109 项 canonical/taxonomy 覆盖矩阵、P0–P3 优先级与 direct source links。

研究直接依赖的实现证据包括 `data/fpkg.db`、`src/lib/public-visibility.ts`、`migrations/023_retire_template_stories.sql`、当前 detail renderer，以及现有 entity quality/library coverage audits。外部品牌与型号来源的 direct URLs、S1–S4 等级和地区分组保留在覆盖矩阵中，不在本摘要重复 109 组链接。

---

*Last updated: 2026-07-15 after synthesizing v1.2 content baseline, publication contract, and model coverage research.*
