# Phase 19: 真实审计与证据契约 - Context

**Gathered:** 2026-07-15
**Status:** Ready for planning
**Source:** 用户连续要求全量遍历、逐条补齐、可靠检索和品牌—型号完整关联；Phase 18 验证与 2026-07-15 live inventory 复核

<domain>
## Phase Boundary

本阶段不批量撰写 305 个条目的最终百科正文，也不把任何旧稿直接恢复为公开内容；它建立后续逐条补内容所必需的真实库存清单、逐字段证据/版本/冲突/审核数据契约、fail-closed readiness v2 与零抽样审计。阶段完成时，每个现有品牌和型号都必须在台账中有且只有一条记录，并能解释为什么当前可发布或不可发布。

</domain>

<decisions>
## Implementation Decisions

- **D-01:** 以 69 个品牌、236 个型号共 305 条 raw inventory 为全量审计集合，旧 65+231 基线只作追溯，额外 9 条不得漏审。
- **D-02:** NDJSON/CSV 零抽样且确定；`--limit` 只能改变终端展示，不能改变扫描、artifact、summary、exit 或判定。
- **D-03:** 公开规格与核心事实必须逐项绑定 approved citation、locator、scope 和满足 tier/independence/allowed-use 的 source-item provenance。
- **D-04:** scope、字段/身份冲突和 fact/language/media/publication 四类 current-hash review 必须分别可判定。
- **D-05:** readiness contract v2 fail closed，`public_entities` 继续是唯一公开授权集合，任何硬 blocker 不可被总分抵消。
- **D-06:** 真实 catalog 仅显式只读并受 main/WAL/SHM 快照保护；所有 migration、写入、fixture、build 与 browser DB 均为 owned disposable，禁止远程与部署。
- **D-07:** 全部型号逐条记录 made_by 状态，全部品牌记录完整 reverse raw/public 型号集合；Phase 19 只审计，不静默修 taxonomy/content。

### D-01 全量库存口径
- 审计集合固定为执行开始时真实数据库中的全部 `brand` 与 `pen` raw rows，当前已知是 69 个品牌、236 个型号，共 305 条；旧 65+231 公开基线只作为可追溯字段，不能替代或缩小审计范围。
- 台账必须明确列出额外 4 个品牌和 5 个型号的身份与 disposition，不能因其曾隐藏、重复、占位或未达标而漏审。
- 当前 `public_entities` 可能为 0；`published blockers = 0` 不能单独代表内容完成，报告必须同时显示 raw inventory、旧公开基线、published set 和完整 backlog。

### D-02 零抽样与确定性产物
- NDJSON 与 CSV 一行对应一个 raw brand/pen identity，identity 集合双向等于 live inventory；不得抽样、分页漏项或用代表条目替代全库。
- `--limit` 只能限制终端展示，不能改变扫描集合、汇总、退出码、artifact 行数或 pass/fail 判定。
- 相同数据库与 contract version 重跑，排序、blocker code、统计和 machine-readable 产物必须确定性一致；时间戳等运行元数据不得污染内容判等。

### D-03 证据和来源门槛
- 每个可公开规格/核心事实必须拥有独立 approved citation 与可定位 evidence locator，并记录适用的 model/variant、地区和时间范围；row-level queue anchor 或来源列表不能替代逐字段证据。
- source registry 必须记录 source kind/tier、independence group、allowed use、retrieved date 和必要的 archive/locator；镜像、转载和同源页面只算一个独立来源组。
- 身份与核心规格至少需要一手来源或同期档案，加一个独立专业二手来源；retailer、社区讨论和搜索结果只能辅助，不能单独解锁发布。
- 本阶段只定义并验证证据契约与 fixture，不开始大规模网络采集；实际逐条检索、写作和补证在 Phase 22–25 执行。

### D-04 scope、冲突与审核
- 事实必须能区分现售/历史、地区、年代、笔尖、材料、尺寸和特别版等 scope；家族事实不能由一个当前特别版反向证明。
- 同一 scope 的 unresolved conflict 阻止该字段进入公开规格；涉及 canonical identity 或唯一品牌归属的 unresolved conflict 阻止整条实体发布。
- 事实审核、中文自然度审核、媒体相关性/许可审核和最终 publication review 分开记录；每一种审核都必须绑定当前 canonical content hash，内容变化后不能沿用旧结论。

### D-05 fail-closed readiness v2
- Phase 18 的 `public_entities` 继续作为唯一公开授权集合；Phase 19 只收紧 readiness，不建立旁路或第二套 public predicate。
- deprecated story、pending claim、needs_source spec、无逐字段 citation、来源独立性不足、unresolved conflict、缺少相应 hash-bound review 任一存在时均产生明确硬 blocker；总分或其他优点不能抵消。
- 迁移中的现有数据默认不因 schema 新增而获得资格；contract version 升级后旧 review 失效，只有完整 fixture 可重新原子发布。

### D-06 安全边界
- 真实本地 catalog 只允许 immutable/read-only 盘点；所有 migration、写入、发布、fixture 与 browser 检查必须使用任务自己创建的 disposable database，并比较真实 catalog main/WAL/SHM 前后状态。
- 本阶段禁止远程 Turso migration/write、push、Vercel deployment 和生产数据变更；它们统一留到 Phase 26 的 staged rollout。
- 禁止硬编码凭据；任何环境配置继续通过既有环境变量与 fail-closed resolver。

### D-07 品牌—型号可审计性
- 每个型号必须在台账中记录 canonical `made_by` 状态：恰好一个、缺失、多重或指向非 canonical/不可发布品牌；不得只检查少数示例。
- 每个品牌同时记录 reverse model raw set、public set 与差异；后续 Majohn A1 达标发布时，必须自动出现在末匠品牌页完整型号列表中。
- Phase 19 不直接修复 taxonomy 争议或批量补正文，但必须为每一项生成稳定 blocker/disposition，供 Phase 21 和 Phase 23 逐条消化。

### the agent's Discretion
- 新表和列的精确命名、normalized schema 细节、audit module 的内部拆分、CSV 字段顺序与 fixture ID 命名，在满足上述可验证契约和现有 SQLite/TypeScript 风格的前提下由执行者决定。

</decisions>

<canonical_refs>
## Canonical References

### 用户与里程碑范围
- `.planning/PROJECT.md` — 当前内容优先目标、去搜索/LLM边界与公开质量要求。
- `.planning/REQUIREMENTS.md` — Phase 19 的 EVID-01..06、AUD-01..05、QA-01 唯一 requirement 文本。
- `.planning/ROADMAP.md` — Phase 19 成功标准以及 Phase 22–26 的后续职责边界。

### 已落地公开门禁
- `.planning/phases/18-publication-gate/18-CONTEXT.md` — publication gate 的原始用户决策和不可退让边界。
- `.planning/phases/18-publication-gate/18-VERIFICATION.md` — Phase 18 已独立通过的 16 项公开边界契约。
- `migrations/030_publication_gate.sql` — 当前 publication/readiness/public universe schema 与 invalidation/transition guards。
- `src/lib/publication.ts` — canonical hash、publication transaction 与 status mutation 实现。
- `scripts/check-publication-gate.ts` — disposable migration/publication fixture 模式。
- `scripts/check-public-boundary.ts` — 四类 public-surface parity oracle。

### 当前内容与审计实现
- `scripts/check-data-contract.ts` — 当前 raw inventory/data-contract 计数和已知硬编码风险。
- `scripts/audit-entity-quality.ts` — 当前 entity quality 判定和 artifact 输出。
- `scripts/audit-library-coverage.ts` — 当前 library/source coverage 判定。
- `src/lib/db.ts` — 本地/远程数据库 resolver 与 schema manifest。

</canonical_refs>

<specifics>
## Specific Ideas

- 305 行 inventory manifest 应显式带 `inventory_snapshot_id`、`in_legacy_public_baseline`、`publication_status`、`readiness_contract_version`、稳定 blocker codes、made_by/reverse-set 结果与证据/审核计数，方便 Phase 23 逐条清账。
- fixture 至少覆盖：deprecated story、pending claim、needs_source spec、镜像同组、无逐字段 citation、retailer-only、unresolved field conflict、identity conflict、stale hash review 和一条完整合格实体。
- 审计报告把“公开面干净”和“库存已完成”分开：前者可以在 0 published 时通过，后者必须显示 305/305 已盘点但仍可能 0/305 可发布。

</specifics>

<deferred>
## Deferred Ideas

- 品牌/型号最终百科 renderer 与公开页面排版 — Phase 20。
- alias、merge、split、rename、variant 与争议身份实质修复 — Phase 21。
- Montblanc 149 全新研究与 A 档正文 — Phase 22。
- 305 条实际库存逐条网络检索、写作、规格/来源/媒体补齐与 publication — Phase 23。
- P0/P1 新品牌与型号扩容 — Phase 24–25。
- 远程 Turso、Vercel 与正式域名发布验收 — Phase 26。

</deferred>

---

*Phase: 19-real-audit-evidence*
*Context gathered: 2026-07-15 in autonomous execution mode*
