# Phase 23: 现有 305 条库存清账 - Context

**Gathered:** 2026-07-19
**Status:** Ready for planning
**Source:** 用户在本任务中的连续指令与 Phase 19 全量审计

<domain>
## Phase Boundary

本阶段只处理 2026-07-15/18 已锁定的实际库存：69 个品牌、236 个钢笔型号，共 305 条。每条都必须得到可信终态：内容达标后发布，或记录明确 blocker 并完全退出公开面。品牌页必须反向列出其所有已达标型号；型号页必须有完整正文、规格、来源、图片和唯一 canonical `made_by` 品牌链接。

本阶段不新增 Phase 24/25 覆盖矩阵中的品牌或型号，不上线搜索、LLM、语义检索或 AI chat。生产迁移、Vercel 部署和正式域名零抽样浏览器复查属于 Phase 26。

</domain>

<decisions>
## Implementation Decisions

### D-01 全量而非抽样
- 305 条 inventory 必须逐条进入台账和执行批次；任何“抽样通过”都不能代表本阶段完成。
- 每批完成后更新累计 published / draft-blocked / retired 数量和剩余条目，不用模糊百分比。

### D-02 内容优先
- 首要工作是外网检索、事实核对、正文撰写、规格证据、图片与品牌关系；不得再以自动化框架、负例扩展或浏览器 runner 改造占用主要时间。
- 只保留复用 Phase 22 content pack 所需的最小数据校验：来源、逐字段规格证据、图片许可、品牌先于型号、隔离副本可重放、真实 catalog 不变。

### D-03 来源门槛
- 来源优先顺序：品牌官网与官方目录、官方历史档案/说明书、博物馆与图书馆、可靠专业钢笔资料与收藏研究、可靠零售商；论坛与社区只能补充使用体验和发现线索。
- 每个公开型号至少包含一手/档案来源与一个独立专业来源组；镜像与转载不能冒充独立来源。
- 无法外部归档的来源只可保存项目自己的转述事实与精确 locator，不保存受版权保护的原文，也不升级来源等级。

### D-04 不猜信息
- 未能可靠核实的尺寸、重量、年代、产地、材质、容量或兼容性保持未知，并在正文解释证据边界。
- 跨年代同名型号必须按 scope/variant 拆开；现行规格不能覆盖历史版本，实物样本数据不能伪装为全系列统一规格。
- 遇到官方内部冲突时同时记录冲突与采用理由，不捏造精确答案。

### D-05 中文内容标准
- 型号正文至少覆盖：身份与品牌内定位、历史/生产状态、现行与历史版本差异、已核实规格、书写与上墨/维护、相邻型号对比、购买和二手检查、适合与不适合的人、来源。
- 品牌正文至少覆盖：身份与历史时间线、制造/产地证据、核心产品体系、如何选择、所有已达标型号入口、来源。
- 删除机器翻译腔、AI 套话、空泛赞美、重复段落、错误第一人称和模板占位；文本必须像中文钢笔爱好者真正会读的百科说明。

### D-06 品牌与型号关系
- 品牌必须先达到发布条件，之后其型号才能公开。
- 每个公开型号恰好有一个 canonical `made_by`；每个公开品牌页必须完整、无重复地列出所有公开型号链接。
- collection、exhibit、nib taxonomy、颜色/镀层 variant 不得伪装为 canonical model。Writers Edition、Patron of Art 等现有混合条目必须纠正类型或保持不公开。

### D-07 媒体
- 每个公开条目至少有一张主体准确、许可可复用、作者/许可/来源/本地路径完整的主图。
- 禁止 AI 生成产品图、来源不明零售图、白边截图、错型号图和同图重复冒充不同实体。
- 历史样本图必须在可见图注标明年代/版本，不能代表现行 SKU。

### D-08 批次顺序
- 第一批完成 Montblanc：品牌、现有 144/146/149/No.22、Writers Edition/Patron of Art 类型纠正，并把缺失 145/StarWalker 的研究交给 Phase 24；149 已完成，146/144/No.22 研究正在进行。
- 后续按品牌成批处理，优先处理型号多、用户价值高、关系问题明显或已有可靠来源基础的品牌；不能把品牌正文和型号正文拆成长期互相等待的两条线。
- 每批都交付可复用内容文件、typed manifest 和隔离副本结果，不直接碰真实本地库或远程生产库。

### D-09 搜索与 AI 范围
- 当前版本只做分类展示与知识漫游，站内搜索入口、LLM 处理、在线 AI 查询均不在本阶段恢复。
- 外网资料检索是编辑研究流程，不等于产品内搜索或 LLM 功能。

### the agent's Discretion
- 在不降低全量和内容门槛的前提下，具体品牌批次大小、同一批内的并行研究分工、manifest 文件拆分方式。
- 对资料极弱条目选择 draft-blocked 或 retired，但必须记录证据化理由，不能静默丢失。

</decisions>

<canonical_refs>
## Canonical References

### 全量库存与缺口
- `.planning/phases/19-real-audit-evidence/artifacts/inventory-readiness-v2.ndjson` — 305 条实际库存、ID、slug、原始 made_by 与 blocker 的唯一全量基线。
- `.planning/phases/19-real-audit-evidence/artifacts/inventory-readiness-v2.csv` — 人工核对用平面台账。
- `.planning/research/V1.2-CONTENT-BASELINE.md` — 可见内容、正文、来源、规格、媒体的真实基线与最低标准。

### 来源与新增边界
- `.planning/research/V1.2-MODEL-COVERAGE.md` — 109 项覆盖矩阵与 canonical/alias/variant/identity gate 边界。
- `.planning/research/V1.2-OFFICIAL-COVERAGE-GAPS-2026-07-18.md` — 八个核心品牌的官网型号差额；Phase 23 仅用于识别现有混合条目，新增项留给 Phase 24/25。

### 发布与首个样板
- `.planning/research/V1.2-PUBLICATION-CONTRACT.md` — 当前公开资格、证据链和内容 hash 契约。
- `.planning/phases/22-montblanc-149/22-01-SUMMARY.md` — Phase 22 已通过的数据/内容样板、允许复用的最小模式及明确停止的浏览器 runner 支线。
- `scripts/data/phase22-montblanc.ts` — typed source/claim/scope/spec/media pack 参考。
- `scripts/apply-phase22-content.ts` — 仅允许隔离副本写入、品牌先于型号、幂等重放的现有路径。

</canonical_refs>

<specifics>
## Specific Ideas

- 对用户指出的 149 与 Majohn A1 空页设为显式回归条目，但不把两个示例当作全量完成证据。
- 优先通过同一品牌批次复用官网目录、品牌历史与保养来源，减少重复检索；每个型号仍保留精确产品/档案 locator。
- Phase 23 的进度报告使用绝对数字，例如“已完成 2/69 品牌、7/236 型号”，并同时说明研究完成、隔离落库完成、生产上线三个不同阶段。

</specifics>

<deferred>
## Deferred Ideas

- Phase 24：P0 缺失品牌/型号、split/identity 修复与 145、StarWalker 等净新增条目。
- Phase 25：P1 54 项分地区扩容。
- Phase 26：真实本地/远程迁移、Vercel 部署、正式域名 desktop/mobile 全量页面与链接复查。
- 产品内搜索、FTS、vector search、LLM 和 AI chat 均不属于当前版本。

</deferred>

---

*Phase: 23-305*
*Context gathered: 2026-07-19 from explicit user instructions and live audit artifacts*
