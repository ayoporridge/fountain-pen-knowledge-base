---
phase: quick
plan: 260721-hoh
slug: phase-110-pilot-canonical-justus-95-silvern-grance
type: execute
status: ready
wave: 1
depends_on: []
autonomous: true
created_at: 2026-07-21
requirements:
  - QUICK-260721-HOH
files_modified:
  - scripts/data/phase110-pilot-justus-95-silvern-grance.ts
  - scripts/apply-phase110-pilot-justus-95-silvern-grance-content.ts
  - tests/content/phase110-pilot-justus-95-silvern-grance.test.ts
  - public/images/library/site-original/phase110/pilot/pilot-justus-95.svg
  - public/images/library/site-original/phase110/pilot/pilot-silvern.svg
  - public/images/library/site-original/phase110/pilot/pilot-grance.svg
must_haves:
  truths:
    - "Pilot Justus 95、Silvern 与 Grance 分别以新稳定 ID 和唯一 canonical slug 公开；首写前对 exact name、slug、SKU 与 source URL 做全库 identity preflight，任何 alternate exact identity 都 fail closed。"
    - "Justus 95 current facts 精确绑定 FJ-3MR/FJ-3MRR、H/S 书写张力调节与 CON-70N；H/S 不被写成传统 flex 保证，Tim Hofmann、Scrively 与 Pencilcase 的体验只属于各自样本。"
    - "Silvern current canonical 只覆盖 FK-5MS、sterling silver、18K inset nib 与 Pilot 当前标准纹样；The Pen Addict 2024 loaned Jaguar sample、Jaguar 及其它 special editions 不被并入 current standard variants。"
    - "Grance current canonical 只覆盖 FGRC-12SR、14K No.3、CON-40 与 Pilot 当前 variants；The Pen Addict gifted sample、Well-Appointed Desk sample 及旧 sterling/marbled families 均保留来源、年代和样本边界。"
    - "三页各有不少于 2,000 Unicode 字符的自然中文正文、完整 CuratedEntityPack、qualified official + independent professional evidence，以及各不相同的 approved primary factual SVG。"
    - "三页各有且仅有一条 made_by 指向 Pilot Zt-PbXkE7UHM，品牌 reverse public navigation 只新增这三页；新增 topology 使品牌失效后，Phase 84 非 topology 内容 payload/source marker 保持不变，Pilot contract hash 预期因三条 canonical links 改变，并按 Phase 106 对新的 post-topology current hash 重做 fact/language/media review 后通过 publishEntity 恢复公开。"
    - "所有 fixture、preflight、migration、apply、review、publish 与 replay 只发生在 caller-owned checkpoint copy；真实 data/fpkg.db main/WAL/SHM、shared infrastructure、非目标 Pilot payload 与所有无关 dirty/untracked 内容不变。"
    - "第二次执行三个目标均为精确 noop；唯一产品提交只含本计划六个 owned 文件，SUMMARY 只报告 Phase 110 局部交付。"
  artifacts:
    - path: "scripts/data/phase110-pilot-justus-95-silvern-grance.ts"
      provides: "三个新 canonical IDs/slugs、2k+ reviewed copy、三个 CuratedEntityPacks、source/scope/claim/spec/variant/media contract"
    - path: "scripts/apply-phase110-pilot-justus-95-silvern-grance-content.ts"
      provides: "owned authority、exact duplicate preflight、identity/topology transaction、Pilot brand current-hash re-review、pen review/publish 与 terminal noop"
    - path: "tests/content/phase110-pilot-justus-95-silvern-grance.test.ts"
      provides: "Phase 84 brand-first fixture、Phase 106 brand invalidation/republication、source boundary、duplicate fail-closed、protected-catalog 与 replay regression"
    - path: "public/images/library/site-original/phase110/pilot/pilot-justus-95.svg"
      provides: "Justus 95 H/S controller 与非传统 flex 保证边界的型号专属事实图"
    - path: "public/images/library/site-original/phase110/pilot/pilot-silvern.svg"
      provides: "Silvern sterling/18K inset/current standard pattern 与 Jaguar special-sample 分界图"
    - path: "public/images/library/site-original/phase110/pilot/pilot-grance.svg"
      provides: "Grance current FGRC-12SR/No.3/CON-40 与旧 family 分界图"
  key_links:
    - from: "tests/content/phase110-pilot-justus-95-silvern-grance.test.ts"
      to: "scripts/data/phase84-platinum-pilot-p0-v3.ts"
      via: "测试在 before-snapshot 前安装完整 Pilot brand pack + 一个既有 Pilot pen pack，建立真实 contract-v3 品牌基线"
      pattern: "phase84PlatinumPilotP0V3BrandPacks"
    - from: "scripts/apply-phase110-pilot-justus-95-silvern-grance-content.ts"
      to: "entity identity/source tables"
      via: "任何写事务前精确比对 name、slug、variant SKU、entity reference/source-item URL 与稳定 target IDs"
      pattern: "assertIdentityPreflight"
    - from: "three new Pilot pens"
      to: "Pilot brand Zt-PbXkE7UHM"
      via: "每页唯一 made_by；migration 032 触发品牌失效并合法改变包含 topology 的 contract hash，随后对新的 post-topology current hash 重做审核并 publishEntity"
      pattern: "recordEntityContentReview|publishEntity"
    - from: "three CuratedEntityPacks"
      to: "public_entities"
      via: "loadCuratedEntityPack 后逐页 current-hash fact/language/media approvals，再由 publishEntity 安装 publication review/snapshot"
      pattern: "computePublicationContentHash|recordEntityContentReview|publishEntity"
---

<objective>
在 Pilot 已完成的 brand-first fixture 上新增 Justus 95、Silvern 与 Grance 三个来源充分、边界明确的 canonical pen 页面，并安全处理三条新 `made_by` 对 Pilot brand publication 的必然失效。

Purpose: 补齐 Pilot 当前目录中三个不能折入现有型号的关键产品，同时防止 duplicate identity、特殊样本泛化、旧家族混写和 publication guard 绕过。
Output: 三个 2k+ 中文 CuratedEntityPacks、三张独立 factual SVG、一个 owned-copy apply 入口、一份定向集成测试，以及精确六文件产品提交。
</objective>

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/content-research/research-pilot-pelikan-raw-2026-07-20.md
@.planning/research/V1.2-OFFICIAL-COVERAGE-GAPS-2026-07-18.md
@.planning/quick/260721-da2-phase-106-sheaffer-connaisseur-imperial-/260721-da2-SUMMARY.md
@.planning/quick/260721-gk5-phase-108-pilot-custom-heritage-91-92-ra/PLAN.md
@.planning/quick/260721-gk5-phase-108-pilot-custom-heritage-91-92-ra/SUMMARY.md
@.planning/quick/260721-h68-phase-109-pilot-raw-bm2fnj2-fp0t-cavalie/PLAN.md
@.planning/quick/260721-h68-phase-109-pilot-raw-bm2fnj2-fp0t-cavalie/SUMMARY.md
@scripts/data/phase84-platinum-pilot-p0-v3.ts
@scripts/apply-phase106-sheaffer-connaisseur-imperial-icon-content.ts
@scripts/apply-phase109-pilot-cavalier-prera-kakuno-cocoon-content.ts
@tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts
@scripts/lib/curated-content-pack.ts
@src/lib/publication.ts

Locked decisions:
- D-01: 所有命令和逻辑根固定为 `/Users/xz/CodeBuddy/fountain-pen-graph`；忽略 init 返回的 `/Users/xz/Documents/...` project_root，任何 authority check 解析到该错误 logical root 都停止。
- D-02: 新建稳定 identity `phase110-pilot-justus-95` / `pilot-justus-95`、`phase110-pilot-silvern` / `pilot-silvern`、`phase110-pilot-grance` / `pilot-grance`；首写前 exact name/slug/SKU/source URL preflight，已有 exact identity 时 fail closed 重新审计，绝不盲建或自动 merge。
- D-03: Justus 95 current authority 为 Pilot FJ-3MR/FJ-3MRR catalog/warranty/use-care，包含 H/S tension/feel adjustment 与 CON-70N；不得保证 traditional flex。
- D-04: Silvern current authority 为 Pilot FK-5MS catalog/warranty，标准页只含 sterling silver、18K inset nib 与当期 standard patterns；Jaguar 和其它 special editions 分离。
- D-05: Grance current authority 为 Pilot FGRC-12SR catalog/warranty，标准页只含 14K No.3、CON-40 与当期 variants；旧 sterling/marbled families 分离。
- D-06: 独立来源必须按具体样本披露：Justus 的 Tim Hofmann/Scrively/Pencilcase；Silvern 的 The Pen Addict 2024 loaned Jaguar；Grance 的 The Pen Addict gifted sample 与 Well-Appointed Desk sample。
- D-07: 三份正文各 2k+、三个独立 packs、三张不复用构图的独立 SVG；new identities/slugs，不借相邻 Pilot 型号或外站图片充数。
- D-08: 每个新 pen 唯一 made_by 指向 Pilot `Zt-PbXkE7UHM`，reverse navigation 由 public_entities + made_by 派生；不写显式 brand reverse payload。
- D-09: owned fixture 先用 Phase 84 完整 Pilot brand pack 建可发布 baseline；三条 canonical made_by 固定后，Phase 84 brand 的 entity/story/source/reference/spec/media 非 topology payload 与 pack/source marker 必须不变，但 `computePublicationContentHash` 预期因 topology 纳入 contract 而从 pre-topology hash 变成新的 post-topology current hash。按 Phase 106 对这个新 hash 重做 fact/language/media review 并用 publishEntity 恢复公开。不得 replay companion brand pack；非 topology payload/source marker 改变、hash 未按 exact links 改变或 hash 与 exact topology 不一致时均 fail closed，不能机械发布旧短文或静默 replay。
- D-10: 所有写入只到 caller-owned checkpoint copy，真实 `data/fpkg.db` main/WAL/SHM 不写；拒绝 remote selectors、protected alias、owned-root 外路径、symlink/hard-link alias、client/path mismatch 与未迁移副本。
- D-11: 只做定向 test、TypeScript、Biome、SVG XML 与 diff/allowlist 回归；不改 shared infra，不扩通用 fixture/runner，不重做既有 Pilot 页面。
- D-12: 保护所有既有和执行期间出现的 dirty/untracked；index 预先非空则停止，显式 stage 六个 owned paths，单一精确产品 commit，PLAN/SUMMARY 不进入产品 commit，只报告局部交付。

Interfaces and established patterns:
- `phase84PlatinumPilotP0V3BrandPacks` 提供完整 Pilot brand pack；`phase84PlatinumPilotP0V3Packs` 提供可用于品牌发布 prerequisite 的既有 Pilot pen pack。
- Phase 109 `preparePublishedPilotBrand` 展示 fixture 顺序：先在 caller-owned copy 准备 Pilot pen identity/made_by，再用 Phase 84 brand + pen packs 建立 published/readiness baseline；fixture 必须发生在 Phase 110 before-snapshot 之前。
- Phase 106 `republishUnchangedBrandAfterTopologyChange` 展示 topology-only invalidation 的正确处理：保持 brand 非 topology payload 不变，在 canonical links 改变 contract hash 后，对新的 current hash 写 fact/language/media approved review，再调用 `publishEntity`；不重装 brand payload、不直接写 lifecycle/public tables。
- `CuratedEntityPack` 承载 sources/scopes/claims/evidence/spec/variants/timeline/media；`computePublicationContentHash`、`recordEntityContentReview` 与 `publishEntity` 是唯一允许的 contract-v3 review/publication 路径。
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 先锁定 exact-new identities、Pilot brand 失效恢复与 owned-copy 回归</name>
  <files>tests/content/phase110-pilot-justus-95-silvern-grance.test.ts</files>
  <behavior>
    - Test 1: 用 `snapshotCatalogFiles` 与 `copyCheckpointedCatalogToDisposableCopy` 创建 caller-owned copy 并迁移到 032；在 Phase 110 before-snapshot 前从 Phase 84 选择完整 Pilot brand pack + 一个既有 Pilot pen pack，建立 Pilot published/readiness=1 的完整品牌基线。
    - Test 2: preflight 在全库 entity names/slugs、aliases、model variant SKUs、entity references/source-item URLs 中均找不到 Justus 95/FJ-3MR/FJ-3MRR、Silvern/FK-5MS、Grance/FGRC-12SR 的 alternate exact identity；三个稳定 IDs/slug 也未被其它身份占用，首次 apply 才允许创建三页。
    - Test 3: 为任一目标注入 alternate exact name、canonical slug、任一锁定 SKU 或任一 official source URL 后，apply 在首个写事务前拒绝；错误消息列出 criterion、candidate entity ID/type/slug/source locator，数据库摘要零变化。稳定 target ID 精确存在只允许作为 replay terminal candidate，不能把另一 ID 自动吞并。
    - Test 4: 首次 topology transaction 只创建三个目标和三条唯一 `made_by -> Zt-PbXkE7UHM`；migration 032 使 Pilot brand reviews/public snapshot 失效。品牌 entity/story/source/reference/spec/media 非 topology payload、Phase 84 pack/source marker 与 revision-owned content 前后完全相同，但 `computePublicationContentHash` 的 post-topology 值必须不同于 pre-topology baseline，因为 exact canonical links 是 publication contract 的一部分。
    - Test 5: brand invalidation 后，fact/language/media approvals 都精确绑定新的 post-topology current hash，`publishEntity` 恢复同一 Pilot brand 的 contract-v3 public snapshot；旧 130 字稿不被加载，Phase 84 brand pack 不被 replay。非 topology payload/source marker 变化、post hash 未变化或 hash 与三条 exact links 不一致时，apply fail closed，不继续发布三 pen。
    - Test 6: 在独立 caller-owned fault fixture 中，成功建立 Phase 110 terminal state 后删除任一新 made_by 或把任一 link target/type 改错；重新计算的 Pilot hash 必须偏离已发布的 exact-topology hash，publication/readiness invalidation 可观测，随后 apply fail closed 而不是修复 link、重审品牌或假报 noop。故障注入前后除该 link 与 contract-derived review/publication 状态外，所有 brand 非 topology payload 保持相同。
    - Test 7: 三页各自 2k+、qualified official + independent professional group、完整 current spec evidence、唯一 approved primary SVG、四类 current-hash review、readiness blocker_count=0、public membership；Pilot public reverse diff 恰好新增三个 canonical IDs/slugs。
    - Test 8: Justus 的 H/S 非 flex 保证、Silvern standard/special separation、Grance current/old-family separation 均由结构化 scope/claim/spec/variant assertions 锁定；独立来源的 loaned/gifted/sample disclosure 不丢失。
    - Test 9: remote env、错误 logical root、空 reviewer、owned-root 外路径、protected path/sidecar、symlink/hard-link alias、client/path mismatch 与未迁移 copy 均在首写前 fail closed；finally 后真实 data/fpkg.db main/WAL/SHM snapshot 不变。
    - Test 10: 第二次 apply 三个 pen outcomes 均为 noop，identity/link/source/hash/revision/review/publication/reverse counts 与品牌 post-topology public snapshot 不变；非目标 Pilot 与 Phase 84/108/109 页面摘要前后相同。
  </behavior>
  <action>
按 D-01/D-02/D-08/D-09/D-10 先写单文件失败集成测试。复用 Phase 109 测试内的 Phase 84 brand-first fixture 结构，但不要导出或修改现有 helper，也不要建立 shared fixture。fixture setup 完成后再拍 Pilot brand 全 payload/hash/reviews/publication、所有非目标 Pilot 摘要、候选 identity/source inventory、public reverse 和 protected catalog snapshots；明确区分 fixture 写入与 Phase 110 apply outcomes。

把 exact duplicate 定义成可审计的等值条件，而非模糊搜索：目标 canonical/常见精确名称、目标 canonical slug、锁定产品号中任一个、或锁定 official document URL 中任一个已绑定到另一 pen identity。查询必须覆盖 entities、entity_aliases、model_variants 以及 entity reference/source-item 的规范化 URL；只允许剥离 URL fragment、尾斜杠和无语义追踪参数，不能用包含匹配自动判同。每个 fail-closed case 比较数据库完整摘要，证明没有“先创建再发现冲突”（D-02）。

对三条 made_by row、Pilot contract hash 与 brand public lifecycle 建分阶段断言：topology 前 brand published 并捕获 pre-topology hash；topology 后品牌因 trigger 失效，非 topology payload/Phase 84 source marker unchanged，而包含 canonical links 的 post-topology hash 必须改变；brand 三类 approvals 全部指向这个新 hash，`publishEntity` 后恢复；三 pen 再 review/publish。测试明确断言没有 Phase 84 brand pack replay 的 source marker/revision变化。增加独立 fault fixture，分别删除或篡改三条新 links，证明 hash 偏离、publication/readiness 失效并由 apply fail closed 捕获，且 brand 其它 payload 没有变化。按 D-09，若 hash 不随 exact topology 呈现预期变化，或非 topology payload/source marker 变化，让测试失败并报告 prerequisite，不静默增加 companion replay。

按 D-03 至 D-07 用结构化断言证明来源/样本/家族边界，而不是只 grep 正文关键词。所有数据库写入只绑定临时 caller-owned root；测试不得新增 Playwright、search、LLM、通用 acceptance 或 shared runner（D-10/D-11）。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase110-pilot-justus-95-silvern-grance.test.ts</automated>
  </verify>
  <done>失败回归完整锁定 exact-new identity、三条 made_by、Phase 84 非 topology baseline、Phase 106 post-topology-new-hash brand re-review、link removal/tamper hash detection、三型号来源边界、authority fail-closed、replay noop 与 protected catalog 不变。</done>
</task>

<task type="auto">
  <name>Task 2: 编写三份 2k+ Pilot packs 与三张型号专属事实图</name>
  <files>scripts/data/phase110-pilot-justus-95-silvern-grance.ts, public/images/library/site-original/phase110/pilot/pilot-justus-95.svg, public/images/library/site-original/phase110/pilot/pilot-silvern.svg, public/images/library/site-original/phase110/pilot/pilot-grance.svg</files>
  <action>
写作前逐一重新打开来源，记录执行日 `retrievedAt`、HTTP/可读状态、页面 title/author/date、精确 locator、allowedUse、archiveUrl/archiveLocator 与 independenceGroup。official 集合至少包含 Pilot fountain warranty/category、Justus 95 FJ-3MR/FJ-3MRR warranty/use-care 与 2013 release/current catalog、Silvern FK-5MS current catalog/warranty/Pilot catalog PDF、Grance FGRC-12SR current catalog/warranty/Pilot catalog PDF。独立集合按 D-06 使用 Justus 的 Tim Hofmann、Scrively、Pencilcase；Silvern 的 The Pen Addict 2024 review；Grance 的 The Pen Addict 与 Well-Appointed Desk reviews。不可读页面、search snippet、商店转述与旧 import cards 不得成为 qualified evidence；official current identity/SKU 冲突时停止并报告（D-02 至 D-06）。

在 data module 中导出 Pilot ID、三个 stable IDs/slugs、exact-name/SKU/source-URL preflight markers 与三个 `CuratedEntityPack`。沿用 Phase 109 的 checked-in embedded reviewed-copy 模式：三份正文在模块内可独立审阅，并仅在 caller-owned execution root materialize 后交给 pack loader；不新增 repository Markdown 或触碰真实 catalog。每份 `summary` 为 60–160 Unicode 字符，`body_md` 不少于 2,000 Unicode 字符，具备 source/scope/claim/citation/evidence/spec/spec-evidence/variant/timeline/media 完整链路；不得加入 Pilot brand pack（D-07/D-09）。

Justus 95 正文严格依据 D-03：current variants 绑定 FJ-3MR/FJ-3MRR，写明 controller 在 H/S 间改变 nib tension/书写感与官方 CON-70N 操作。H/S 是可调软硬/弹性感，不承诺传统 flex、任意压尖或统一 line variation；Tim Hofmann 的借测后自购经历、Scrively 与 Pencilcase 的具体尖宽/手感/尺寸观察分别进入 author/date/sample scopes，不互相拼成 current spec。

Silvern 正文严格依据 D-04/D-06：current canonical 绑定 FK-5MS、sterling silver、18K inset nib、CON-40 与执行日 Pilot catalog 明列的 standard patterns/笔尖组合。The Pen Addict 2024 明确是 Chatterly Luxuries loaned Jaguar sample；其 Jaguar 图案、edition 数量、价格、平衡与写感只进入 `special_sample_2024_jaguar`，不能证明 2026 standard SKU/库存。Jaguar、Dragon/Turtle/Pokémon 等 special editions 不生成 Phase 110 entity，也不混入 standard variant 表。

Grance 正文严格依据 D-05/D-06：current canonical 绑定 FGRC-12SR、14K No.3、CON-40 与执行日官方 variants。The Pen Addict 免费提供样本与 Well-Appointed Desk sample 的颜色、重量、价格、配件、握持、套帽和写感均保留作者/年代/样本披露；不得覆盖 current official spec。旧 sterling、marbled 或其它历史 Grance families 只进入 historical-family boundary，不成为 FGRC-12SR aliases/variants，也不把 Cavalier/Metropolitan 规格借入。

绘制三张 1600x900 site-original factual SVG（D-07）：Justus 图聚焦 H/S controller、控制片与“非传统 flex 保证”；Silvern 图聚焦 sterling shell、inset nib、current standard patterns 与 Jaguar special-sample 分栏；Grance 图聚焦 No.3/CON-40/current variant 与 historical-family 分界。每张构图、色板与信息层级独立，显著声明本站原创示意、非产品照片、非比例/颜色/表面复刻；不使用 Pilot logo、外站图片或把同一模板换标题。每个 pack 只能批准自己的 SVG 为唯一 primary media。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; pnpm exec biome check scripts/data/phase110-pilot-justus-95-silvern-grance.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase110/pilot/pilot-justus-95.svg public/images/library/site-original/phase110/pilot/pilot-silvern.svg public/images/library/site-original/phase110/pilot/pilot-grance.svg</automated>
  </verify>
  <done>三个新 stable identity 各有 2k+ 自然中文、evidence-complete pack 与独立主图；current、sample、special edition 和 historical-family scope 不串线。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现 owned-only 三页发布、Pilot brand current-hash 恢复、noop 与精确提交</name>
  <files>scripts/apply-phase110-pilot-justus-95-silvern-grance-content.ts</files>
  <behavior>
    - Test 1: 所有 remote/root/reviewer/path/migration 与 exact identity prerequisites 都在首个 write transaction 前完成；任一失败不改变 caller-owned copy。
    - Test 2: identity/topology transaction 只创建或确认三个 target IDs/slugs 与三条唯一 made_by；alternate exact identity、错误 target-ID payload、slug/source collision 或额外 maker 均 fail closed，不自动修复/合并。
    - Test 3: topology 固定后 Pilot brand 非 topology payload 与 Phase 84 source marker unchanged，contract hash 预期从 pre-topology 值改变为由三条 exact links 决定的 post-topology current hash；fact/language/media approvals 精确写给新 hash，再由 publishEntity 恢复 brand。不 replay Phase 84 pack、不直接写 publication review、lifecycle 或 public_entities。
    - Test 4: 三个 packs 各自在 package transaction 安装自有 payload，随后逐页 current-hash fact/language/media review，再由 publishEntity 发布；public reverse 只新增三页。
    - Test 5: terminal state 同时核对 identity/SKU/source marker、三条 exact made_by、唯一 primary media、current hash/revision、四类 review、readiness/public membership、Pilot brand post-topology current publication 与所有 scope boundaries；缺失/篡改任一新 link 时 hash mismatch 必须 fail closed，全部满足才返回三个 noop。
  </behavior>
  <action>
以 Phase 109 的 phase-local authority/installer/terminal-state 为主体、Phase 106 的 `republishUnchangedBrandAfterTopologyChange` 为 brand invalidation 模式实现 apply。CLI 只接受显式 `--database`、`--owned-root`、`--protected-catalog` 与可选 reviewer；固定 logical workspace 为 D-01 的 CodeBuddy 路径，并清空/拒绝继承 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`。在首写前验证 protected snapshot、realpath/inode/sidecars、symlink/hard-link、owned containment、PRAGMA database_list、client/path 与 migration 032（D-01/D-10）。

实现 `assertIdentityPreflight`，按 Task 1 的 exact equality contract 一次性收集三型号 candidates；首次运行必须证明 target IDs 与所有 exact markers 均 absent，replay 必须证明恰为目标自身的 exact terminal rows。任何另一 entity 命中 exact name/slug/SKU/source URL，或 target stable ID 已承载不同 identity，均抛出包含候选证据的错误并停止。不要用 name substring、品牌归属或相邻产品系列猜测复用（D-02）。

在单个 identity/topology transaction 中创建三个 canonical pens 并各插入唯一 `made_by -> Zt-PbXkE7UHM`；不创建显式 reverse links，反向导航由查询派生（D-08）。transaction 前捕获 Pilot pre-topology contract hash 与 entity/story/source/reference/spec/media、Phase 84 pack/source marker 等非 topology digest；transaction 后重新计算 post-topology hash并深比较非 topology digest。正确终态必须同时满足：非 topology payload/source marker 完全相同、三条 canonical links 精确、post-topology hash 不等于 pre-topology hash。随后按 Phase 106 将 fact/language/media approvals 精确记录到新的 post-topology current hash，再调用 `publishEntity` 恢复品牌。不要调用 Phase 84 pack loader、不要读旧 130 字 brand story、不要直接 SQL 写 review/lifecycle/public tables；非 topology digest 改变、hash 未改变或 hash/link 关系不符合预期时 fail closed（D-09）。

随后用 `loadCuratedEntityPack`/`packId` 在各自事务替换三目标自有 story/source/reference/alias/scope/claim/citation/evidence/spec/spec evidence/variant/conflict/timeline/media，保持非公开 current revision；逐实体调用 `recordEntityContentReview` 完成 fact/language/media approvals，再调用 `publishEntity`。terminal noop 除三页自身外还必须验证 Pilot brand exact link set、post-topology hash/reviews/public snapshot、非 topology payload/source marker、reverse diff、非目标 Pilot digest 与 protected snapshot。若 target identities 已存在但任一新 link 缺失/变更，必须 fail closed，不做 topology repair、brand re-review 或 pack install；不得修改任何 Phase 84/106/108/109 文件、`scripts/lib/curated-content-pack.ts`、`src/lib/publication.ts` 或 shared infra（D-09 至 D-11）。

定向回归全部通过后才处理 Git。开始 staging 前要求 index 为空；只用六个显式 paths stage frontmatter allowlist，比较排序后的 `git diff --cached --name-only`，运行 cached diff check，集合不一致时只撤销本包六个路径的 staging 后停止。禁止 `git add .`、glob add、stash、clean、reset、checkout、force 或覆盖任何 dirty/untracked 文件。提交信息为 `feat(content): publish Pilot Justus 95 Silvern and Grance`；提交后用 `git show --name-only --format=` 证明 HEAD 恰含六文件。PLAN 与 SUMMARY 不进产品 commit；执行完在本 quick 目录写 SUMMARY，记录 live source locators、duplicate preflight、三 identities/slugs、source boundaries、brand hash/re-review/no-replay、reverse diff、protected snapshot、noop、验证命令和 product commit，并按 D-12 声明只是 Phase 110 局部交付。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase110-pilot-justus-95-silvern-grance.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase110-pilot-justus-95-silvern-grance.ts scripts/apply-phase110-pilot-justus-95-silvern-grance-content.ts tests/content/phase110-pilot-justus-95-silvern-grance.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase110/pilot/pilot-justus-95.svg public/images/library/site-original/phase110/pilot/pilot-silvern.svg public/images/library/site-original/phase110/pilot/pilot-grance.svg &amp;&amp; git diff --check -- scripts/data/phase110-pilot-justus-95-silvern-grance.ts scripts/apply-phase110-pilot-justus-95-silvern-grance-content.ts tests/content/phase110-pilot-justus-95-silvern-grance.test.ts public/images/library/site-original/phase110/pilot/pilot-justus-95.svg public/images/library/site-original/phase110/pilot/pilot-silvern.svg public/images/library/site-original/phase110/pilot/pilot-grance.svg</automated>
  </verify>
  <done>三个新 Pilot canonical pages 在 caller-owned copy 通过 current-hash review/publish 并 replay noop；Pilot brand 按 Phase 106 恢复且未 replay/改写，真实 catalog/shared infra/dirty worktree 不变，产品 commit 精确含六文件。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Live web -> curated packs | Pilot official pages 与独立 reviews 进入 current facts、sample scopes、claims/specs/variants 和中文正文；页面会改版，review 样本可能是 loaned/gifted/special edition。 |
| Caller -> phase-local apply | caller 提供 database、owned root、protected catalog snapshot、reviewer 与环境；错误 root/path 可能把写操作导向真实 catalog 或错误 Documents logical root。 |
| Existing catalog -> new canonical identities | exact name/slug/SKU/source URL 与 stable IDs 决定是否允许新建；漏查会产生 duplicate，模糊 merge 会破坏既有 identity。 |
| New made_by topology -> Pilot publication | migration 032 会 invalidates 新 pen 与 target brand；错误顺序、旧短文 replay 或直接 lifecycle 写入会绕过 contract-v3。 |
| Dirty worktree -> product commit | 共享工作区已有大量 modified/untracked；宽泛 staging 会污染提交或覆盖他人工作。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-110-01 | Spoofing | official/current source identity | high | mitigate | Task 2 重新打开 Pilot warranty/catalog/PDF，记录 title/locator/retrievedAt；不可读页面和 snippet 不进入 qualified evidence，SKU/current conflict 停止。 |
| T-110-02 | Spoofing | canonical pen identity | critical | mitigate | Tasks 1/3 在首写前跨 entity/alias/variant/reference/source URL 做 exact preflight；alternate exact ID fail closed 并报告证据，不盲建或自动 merge。 |
| T-110-03 | Tampering | protected catalog/root authority | critical | mitigate | Tasks 1/3 使用 caller-owned checkpoint、CodeBuddy logical root、realpath/inode/sidecar/PRAGMA checks 与 protected snapshot；拒绝 remote、Documents root、alias、outside-root 和 client mismatch。 |
| T-110-04 | Tampering | Pilot made_by and reverse topology | high | mitigate | Task 3 单事务只创建三条唯一 pen->Pilot made_by；测试断言无显式 reverse、无额外 maker、public reverse diff 恰为三目标。 |
| T-110-05 | Elevation of Privilege | brand/pen publication lifecycle | critical | mitigate | Task 3 验证 brand 非 topology payload/source marker unchanged、post-topology hash 因 exact links 合法改变，再对新 hash review + publishEntity；三 pen 同样只走 public API，不直接写 review/lifecycle/public tables。 |
| T-110-06 | Repudiation | current/special/historical/sample claims | high | mitigate | D-03 至 D-06 为 Justus H/S、Silvern Jaguar、Grance旧家族及 loaned/gifted samples 建独立 scopes、citations、evidence 与 disclosure assertions。 |
| T-110-07 | Information Disclosure | remote credentials | high | mitigate | apply 拒绝继承 remote selectors，不读取或输出 token；计划不新增 secret，任何凭据只允许通过环境变量且本 Phase 不消费。 |
| T-110-08 | Denial of Service | broad regression expansion | low | accept | 本 Phase 仅运行一个定向 integration test、tsc、owned-file Biome/XML/diff；不扩 full-suite/browser runner，风险局限在 phase-local content path。 |
| T-110-09 | Tampering | exact product commit | high | mitigate | Task 3 要求预先空 index、六文件显式 allowlist、cached diff 与 post-commit path-set proof；所有无关 dirty/untracked 原样保留。 |
| T-110-SC | Tampering | package supply chain | low | accept | Phase 110 不安装或升级 npm/pip/cargo package；若执行中出现安装需求立即停止并重新规划。 |

</threat_model>

## Source Coverage Audit

| SOURCE | ID | Feature / Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 新增 Pilot Justus 95、Silvern、Grance 三个来源化 canonical pages，并安全恢复因 links 失效的 Pilot brand | 1-3 | COVERED | identity、内容、media、topology、brand/pen publication 与提交闭环。 |
| REQ | QUICK-260721-HOH | Phase 110 三型号 caller-owned 局部交付 | 1-3 | COVERED | 单计划三任务完整覆盖。 |
| RESEARCH | R-01 | Pilot current-missing-models 建议：Justus 95/FJ-3MR、Silvern/FK-5MS、Grance/FGRC-12SR 独立建页 | 1-3 | COVERED | 仓库 research 与 live Level-1 verification 一致。 |
| RESEARCH | R-02 | Phase 108/109 Pilot fixture：Phase 84 完整品牌基线、owned checkpoint、定向回归 | 1,3 | COVERED | fixture 在 before-snapshot 前完成。 |
| RESEARCH | R-03 | Phase 106 topology invalidation：非 topology brand payload 不变，canonical links 改变 contract hash，对新 current hash 重新 review + publishEntity | 1,3 | COVERED | 明确 no replay；hash/link 或 payload/source-marker 行为异常则 fail closed。 |
| CONTEXT | D-01 | CodeBuddy logical root，拒绝 init Documents project_root | 1,3 | COVERED | authority 与所有 verify 命令固定 root。 |
| CONTEXT | D-02 | 三个 new IDs/slugs；name/slug/SKU/source URL exact duplicate preflight | 1,3 | COVERED | alternate exact identity 首写前失败。 |
| CONTEXT | D-03 | Justus FJ-3MR/FJ-3MRR、H/S、CON-70N，非 traditional flex 保证 | 1,2 | COVERED | official + sample scopes 与结构断言。 |
| CONTEXT | D-04 | Silvern FK-5MS/current standard patterns 与 Jaguar/special editions 分离 | 1,2 | COVERED | 2024 loaned Jaguar 独立 scope。 |
| CONTEXT | D-05 | Grance FGRC-12SR/14K No.3/CON-40/current variants 与旧 families 分离 | 1,2 | COVERED | current/historical family scopes。 |
| CONTEXT | D-06 | Justus/Silvern/Grance 独立样本披露 | 1,2 | COVERED | Tim/Scrively/Pencilcase、Pen Addict、WAD 分组。 |
| CONTEXT | D-07 | 三份 2k+、三个 packs、三张独立 SVG | 1,2 | COVERED | 每页唯一主图与完整 evidence chain。 |
| CONTEXT | D-08 | 唯一 made_by Pilot 与 derived reverse | 1,3 | COVERED | 三条 link + reverse diff。 |
| CONTEXT | D-09 | Phase 84 非 topology baseline；Phase 106 post-topology-new-hash brand re-review/publish；不机械旧稿/绕 guard | 1,3 | COVERED | no companion replay；exact links/hash/payload 偏差 fail closed。 |
| CONTEXT | D-10 | caller-owned writes，真实 catalog 不写 | 1,3 | COVERED | authority cases 与 main/WAL/SHM snapshot。 |
| CONTEXT | D-11 | 定向 TS/Biome/SVG/diff，不改 shared infra | 1-3 | COVERED | 六个 phase-local product files。 |
| CONTEXT | D-12 | dirty/untracked 保护、精确 owned commit、局部交付 | 3 | COVERED | index/allowlist/post-commit/SUMMARY gates。 |

Deferred ideas: none supplied. Source audit has no missing items.

## Pre-Mortem and Reachability Check

1. **最可能失败：库中已有另一 exact SKU/source identity，却按“没看到同名”盲建。** Mitigation: Task 1/3 跨 name/slug/alias/SKU/source URL 做首写前 exact inventory，并注入四类 collision tests。
2. **最可能失败：把 topology 引起的合法 hash 变化误判为内容污染，或反过来忽略 link 被删改后的 hash 漂移。** Mitigation: Phase 84 baseline 分离非 topology payload digest 与 pre hash；精确三 links 后要求 post hash 改变并对新 hash review/publish；删除/篡改 link 的 fault fixture 必须检测 hash 偏离并 fail closed。
3. **最可能失败：把 Silvern Jaguar 或旧 Grance/Justus 样本写成 current family 事实。** Mitigation: 每个 independent source 都有 author/date/sample/disclosure scope；current spec/variant evidence 只接受对应 Pilot official source。
4. **最可能失败：测试/提交污染真实 catalog 或他人 dirty worktree。** Mitigation: protected main/WAL/SHM snapshots、owned authority rejection、空 index、显式六文件 allowlist 和 post-commit proof。

Reachability is complete: Phase 84 complete Pilot fixture -> capture non-topology digest + pre-topology hash -> exact absence preflight -> three stable canonical identities -> three unique made_by links -> Pilot brand invalidation + expected post-topology hash change -> approvals on the new current hash + publishEntity -> three CuratedEntityPacks -> pen current-hash reviews + publishEntity -> public_entities -> existing Pilot brand reverse navigation. No artifact depends on an unplanned route, new package, shared-infra change or protected-catalog write.

<verification>

1. `node --import tsx --test tests/content/phase110-pilot-justus-95-silvern-grance.test.ts` passes entirely on caller-owned checkpoint copies and proves protected main/WAL/SHM equality.
2. `pnpm exec tsc --noEmit --pretty false` passes; Biome passes for the three TypeScript files.
3. All three SVGs pass `xmllint --noout`; owned paths pass `git diff --check` and cached allowlist checks.
4. Three bodies each exceed 2,000 Unicode characters and have qualified official + independent evidence, complete current spec evidence, unique primary SVG and four current-hash reviews.
5. Exact duplicate negative fixtures fail before any write; first apply publishes three pens and restores Pilot brand through Phase 106 current-hash flow; second apply returns three exact noops.
6. Pilot brand non-topology payload and Phase 84 source marker remain unchanged; post-topology hash differs from pre-topology because of exactly three canonical links, link removal/tamper changes it again and is rejected, reverse public diff contains only the three targets, and all non-target Pilot/protected catalog digests remain unchanged.
7. Post-commit `git show --name-only` proves the product commit contains exactly the six frontmatter files; PLAN/SUMMARY and unrelated dirty/untracked are absent.

</verification>

<success_criteria>

- Justus 95、Silvern、Grance 是唯一 exact identities，stable IDs/slugs 与 Pilot current SKUs 一一对应，没有 duplicate 或猜测性 merge。
- 三页均为 2k+ 自然中文、evidence-complete、独立 SVG、contract-v3 published；current 与 sample/special/historical boundaries 满足 D-03 至 D-07。
- 三条唯一 made_by 产生且只产生三个 Pilot reverse links；Pilot brand 非 topology payload/source marker 不变，contract hash 按 exact topology 合法改变，并对新的 current hash 重新审核后经 publishEntity 恢复；无 brand pack replay、旧短文复活或 guard bypass。
- replay、TypeScript、Biome、SVG XML、diff、protected snapshot 与 exact commit allowlist 全部通过。
- SUMMARY 准确称为 Phase 110 本地 caller-owned 局部交付，不声称 Pilot 或全库内容 goal 完成。

</success_criteria>

<output>
Create `.planning/quick/260721-hoh-phase-110-pilot-canonical-justus-95-silv/SUMMARY.md` when execution is done. Do not include PLAN.md or SUMMARY.md in the six-file product commit.
</output>
