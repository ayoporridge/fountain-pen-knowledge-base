# Phase 18: 统一发布门禁 - Context

**Gathered:** 2026-07-15
**Status:** Ready for planning
**Source:** v1.2 publication contract express path

<domain>
## Phase Boundary

本阶段只建立 publication 状态、readiness 结果与唯一公开实体集合，并让所有公开 surface 统一消费该集合。它不负责重写 296 个既有品牌/型号，也不负责逐字段证据、完整 renderer 或扩充新型号；这些分别属于 Phase 19–25。

阶段结束时，本地应用允许品牌/型号公开的唯一条件必须是显式 publication 记录仍然有效且 readiness 无 blocker。现有品牌和型号默认进入 draft/backlog；本阶段不把这一中间状态提前部署到正式站，正式站切换留到内容批次和生产验收完成后。

</domain>

<decisions>
## Implementation Decisions

### Publication lifecycle
- 新增 `entity_publications`，状态只能是 `draft`、`in_review`、`published`、`retired`；品牌/型号记录创建时默认 `draft`。
- migration 对现有 brand/pen 只建立 draft/backlog，不批量发布，也不改变 313 篇 deprecated story 的状态。
- canonical merge 的旧路径继续走显式 redirect；未达标、retired 或身份未决的直接 URL 返回 404，不返回可索引空壳 200。

### Readiness and invalidation
- `public_entity_readiness` 负责给出 `publishable` 和当前 contract version 的 blockers；Phase 18 建立 fail-closed 授权机制与 v1 结构门槛，Phase 19 以 v2 补齐逐字段证据、来源独立性、版本冲突和分层内容审核；未升级到当前版本的数据保持隐藏。
- `public_entities` 是唯一公开集合；publication 不是靠总分或实体存在自动获得。
- publication 记录保存 `approved_content_hash` 与审核/发布时间；summary、published story、spec、claim/citation、source、variant、`made_by` 或 primary media 等关键输入变化时，数据库 trigger 原子递增 revision，旧审核立即失效；重新审核才计算并保存新 hash。
- `published` transition 必须同时受 server-only transaction 和数据库 trigger 约束，直接 SQL 不能绕过 readiness、revision、contract version、hash 与 reviewer/timestamp 检查。
- entity type 进入 brand/pen 时创建或重置 draft publication；brand↔pen 重置审核；离开 brand/pen 时保留显式非 published 记录，不能因删除 publication row 落回 legacy 非品牌可见路径。
- 本阶段采用 fail-closed：readiness 无法计算、publication 缺失或 hash 不匹配时一律不公开。

### Public surface parity
- detail、metadata、browse、facets、sitemap、graph、recommendations、品牌代表型号和公开 API 必须共享同一个 SQL/public helper，不得各自复制隐藏规则。
- 完整列表做双向集合相等；detail/metadata 做逐 ID 可达性等价；facets/统计做聚合等价；graph、recommendations、代表型号等上下文结果只要求为 `public_entities` 的严格子集且不泄漏非公开实体。
- `isPublicEntity()` 与手工 slug 黑名单只能保留为过渡兼容或 canonical redirect 辅助，不能继续充当 brand/pen 的最终公开真相。
- 新的公共查询必须避免把内部 publication 字段、blocker 或数据库 id 暴露到浏览 API。

### Rollout safety
- 本地 SQLite migration、migration replay、数据契约、build 和全量公开集合测试通过后才完成 Phase 18。
- Phase 18 不建立远程发布 UI；所有承载实体的页面/API 采用 dynamic/no-store，避免离线导入无法触发 Next cache purge。缓存优化等统一写入口成熟后再恢复。
- Playwright 与 migration 正向 fixture 必须使用可注入的隔离数据库路径，不得修改 `data/fpkg.db`，也不得依赖 Pilot/LAMY 等真实目录行天然公开。
- 远程 Turso migration 和正式部署不属于本阶段；Phase 26 才进行最终生产切换。
- migration、write 和 publication transition 不使用自动重试；现有只读瞬时错误恢复规则保持不变。

### the agent's Discretion
- 具体使用 SQLite view、CTE 或 query helper 的组合，只要所有公开 surface 读取同一集合且测试可证明集合相等。
- content hash 的序列化与哈希算法，只要确定性、跨本地/Turso 一致，并明确纳入哪些 publication-critical 数据。
- readiness blocker 的内部编码形式，只要稳定、可机器审计且不泄露到公开 API。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and acceptance contract
- `.planning/ROADMAP.md` — Phase 18 goal、依赖与四条 observable success criteria。
- `.planning/REQUIREMENTS.md` — PUB-01 至 PUB-06 的原子验收要求。
- `.planning/research/V1.2-PUBLICATION-CONTRACT.md` — publication lifecycle、唯一公开集合、硬门槛与迁移原则。
- `.planning/research/V1.2-CONTENT-BASELINE.md` — 65 品牌、231 型号的真实公开基线及旧 audit 假阳性。
- `.planning/research/SUMMARY.md` — v1.2 阶段依赖、research flags 与禁止批量复活旧稿的总决策。

### Existing implementation
- `src/lib/public-visibility.ts` — 当前手工隐藏规则及需被 publication gate 替代的边界。
- `src/app/[type]/[slug]/page.tsx` — detail/metadata 当前公开判断。
- `src/app/api/browse/route.ts` — browse API 与 facets 的公开集合入口。
- `src/app/sitemap.ts` — sitemap 公开实体查询。
- `src/lib/library.ts` — graph、recommendations、品牌代表型号和其他公共查询中的公开过滤。
- `src/lib/db.ts` — 本地/Turso 读写、只读 retry 与 micro-batching 约束。
- `migrations/` — 顺序 migration、checksum 和远程显式迁移惯例。
- `scripts/check-public-boundary.ts` — 当前公开边界检查及 Phase 18 需要增强的集合相等门禁。
- `tests/e2e/site-quality.spec.ts` — 全量公开路由和 sitemap 测试入口。

</canonical_refs>

<specifics>
## Specific Ideas

- Montblanc 149 必须作为 fail-closed fixture：在 publication 缺失或 draft 时，不得出现在 browse/sitemap/graph/API，直接访问不返回公开 200。
- 合格 fixture 必须证明 publication 状态、hash 和 readiness 同时通过后，同一个实体才会出现在所有公开 surface。
- migration 后真实 brand/pen 的初始 published 数量固定为 0；Phase 19 用全量 readiness audit 计算 v2 下的 publishable backlog。
- 保留 article、concept、tag 等非 brand/pen 现有公开行为，除非它们明确走新的 publication 记录；本阶段不无意缩小与需求无关的内容面。

</specifics>

<deferred>
## Deferred Ideas

- 逐字段 citation、source tier/independence、variant scope、冲突与分层 content review schema — Phase 19；Phase 18 仅提供 publication-level review/hash 和可升级 contract version。
- brand/model summary、published story、规格、版本和媒体的新 renderer — Phase 20。
- taxonomy merge/split/alias — Phase 21。
- Montblanc 149 与全量内容补写 — Phase 22–23。
- 远程 Turso migration、生产部署与线上全量验真 — Phase 26。

</deferred>

---

*Phase: 18-publication-gate*
*Context gathered: 2026-07-15 via v1.2 publication contract express path*
