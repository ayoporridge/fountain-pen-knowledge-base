---
phase: quick
plan: 260721-h68
slug: phase-109-pilot-raw-cavalier-prera-kakuno-cocoon-publication
type: execute
status: ready
wave: 1
depends_on: []
autonomous: true
created_at: 2026-07-21
requirements:
  - QUICK-260721-H68
files_modified:
  - scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon.ts
  - scripts/apply-phase109-pilot-cavalier-prera-kakuno-cocoon-content.ts
  - tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts
  - public/images/library/site-original/phase109/pilot/pilot-cavalier.svg
  - public/images/library/site-original/phase109/pilot/pilot-prera.svg
  - public/images/library/site-original/phase109/pilot/pilot-kakuno.svg
  - public/images/library/site-original/phase109/pilot/pilot-cocoon.svg
must_haves:
  truths:
    - "Cavalier 复用 BM2fNJ2-fP0T、Prera 复用 UrbBB-onjGnF、Kakuno 复用 U6w1BK0N4u0f、Cocoon 复用 1dtEi80xLCZ1；四个 raw 条目原位规范化，仓库中不出现同型号 duplicate identity。"
    - "四个 canonical slugs 分别为 pilot-cavalier、pilot-prera、pilot-kakuno、pilot-cocoon；四条既有 raw route 都得到精确 permanent redirect，canonical route 唯一且 replay 不增生 redirect。"
    - "四页各有至少 2,000 个 Unicode 字符的自然中文正文、可定位的 Pilot 当前官方主来源、至少一个独立实测来源、字段级 evidence 和各自唯一的本站原创 SVG。"
    - "current specs 只由执行日可读的 Pilot live catalog、产品页、说明书或官方新闻稿支撑；旧评测中的 CON-20/CON-50 只描述当年评测样本，不能进入 current spec 或 current compatibility claim。"
    - "Prera Iro-ai 与 2025 新色只作为有 scope 的 variant/sibling；Kakuno 笔尖笑脸只作为 nib feature；Cocoon 是日本 canonical，Metropolitan/MR 只承担地区 sibling/alias 边界，欧洲 MR 的 standard-international 供墨不泛化到 Cocoon。"
    - "四个既有且唯一的 made_by -> Pilot Zt-PbXkE7UHM 行在 Phase 109 前后按 id/source_id/target_id/link_type/reason 保持完全相同；任一 prerequisite 不精确则首个 Phase 109 写事务前 fail closed。"
    - "测试只在 caller-owned checkpoint/disposable copy 上迁移和写入；Phase 109 apply 不接受默认数据库路径，不写 data/fpkg.db，也不触碰其 WAL/SHM。"
    - "Pilot brand 只在测试 fixture 阶段用 Phase 84 pack 建立 published baseline；Phase 109 apply 不重放、不安装、不改写 Pilot brand，品牌 payload/review/publication/hash 保持不变。"
    - "四个 CuratedEntityPack 经同一 current content hash 下的 fact、language、media 审核后只由 publishEntity 生成 publication review 并进入 contract-v3 public_entities；第二次执行四项均为精确 noop。"
    - "产品提交只包含 frontmatter 的七个 owned 文件；所有既有及执行中出现的无关 dirty/untracked 文件保持未暂存、未覆盖、未删除。"
    - "SUMMARY 明确 Phase 109 只是 Cavalier、Prera、Kakuno、Cocoon 四页的局部交付，不宣称 Pilot 全品牌或全量内容 goal 完成。"
  artifacts:
    - path: "scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon.ts"
      provides: "四个 CuratedEntityPack、四份 2k+ 中文正文、固定 raw/canonical identities、source/scope/claim/spec/variant/media 映射"
    - path: "scripts/apply-phase109-pilot-cavalier-prera-kakuno-cocoon-content.ts"
      provides: "owned-only preflight、原位 canonicalization、legacy redirects、pack install、current-hash review/publish 与 terminal noop"
    - path: "tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts"
      provides: "四 identity、来源边界、品牌/拓扑零扰动、authority、publication、幂等与 protected catalog 回归"
    - path: "public/images/library/site-original/phase109/pilot/pilot-cavalier.svg"
      provides: "Cavalier 细杆金属结构与 current filling boundary 的本站原创事实图"
    - path: "public/images/library/site-original/phase109/pilot/pilot-prera.svg"
      provides: "Prera 短尺寸、snap cap 与 current Pilot filling boundary 的本站原创事实图"
    - path: "public/images/library/site-original/phase109/pilot/pilot-kakuno.svg"
      provides: "Kakuno 握持引导、笑脸尖方向提示但非独立实体的本站原创事实图"
    - path: "public/images/library/site-original/phase109/pilot/pilot-cocoon.svg"
      provides: "日本 Cocoon 金属笔身与地区命名/供墨边界的本站原创事实图"
  key_links:
    - from: "scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon.ts"
      to: "scripts/apply-phase109-pilot-cavalier-prera-kakuno-cocoon-content.ts"
      via: "四个 CuratedEntityPack、loadCuratedEntityPack 与 packId 的稳定 manifest/payload IDs"
    - from: "scripts/apply-phase109-pilot-cavalier-prera-kakuno-cocoon-content.ts"
      to: "src/lib/publication.ts"
      via: "recordEntityContentReview 后调用 publishEntity；不直接写 published lifecycle 或 public_entities"
    - from: "BM2fNJ2-fP0T / UrbBB-onjGnF / U6w1BK0N4u0f / 1dtEi80xLCZ1"
      to: "Zt-PbXkE7UHM"
      via: "保留四条既有 made_by 行；Pilot brand 反向导航由 public_entities + made_by 查询自然生成"
    - from: "tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts"
      to: "data/fpkg.db"
      via: "只做 snapshotCatalogFiles 与 copyCheckpointedCatalogToDisposableCopy；所有 migration/apply 写连接绑定 caller-owned copy"
---

# Quick 260721-h68: Phase 109 Pilot Cavalier / Prera / Kakuno / Cocoon

## Objective

把四个既有 raw Pilot 条目原位规范为来源化、可公开且身份边界清楚的 Cavalier、Prera、Kakuno 与 Cocoon 页面。Phase 109 复用 `BM2fNJ2-fP0T`、`UrbBB-onjGnF`、`U6w1BK0N4u0f`、`1dtEi80xLCZ1`，补齐 canonical routes、四份完整中文内容、字段级证据、四张独立原创事实图与 contract-v3 publication；不新建替代 ID，不改共享 ingestion/publication 基础设施，不修改真实 catalog。

Purpose: 让用户能从 Pilot 品牌页进入四个真实且互不混淆的钢尖日用型号，并区分细杆办公、小型随身、新手引导、日系金属入门四条使用路径及其地区/年代边界。

Output: 四个 CuratedEntityPack、四份 2k+ 中文正文、四张型号专属 SVG、一个 caller-owned apply 入口、一份定向集成回归和一个精确七文件产品提交。

## Planning Findings and Locked Decisions

- **D-01 — 固定逻辑工作区。** 本 Phase 只允许在 `/Users/xz/CodeBuddy/fountain-pen-graph` 下读取和产出；init 返回的 `/Users/xz/Documents/fountain-pen-graph` 是错误 `project_root`，执行器不得以该路径调用任何命令、写入文件或构造提交。所有命令先设置并验证逻辑根 `/Users/xz/CodeBuddy/fountain-pen-graph`，计划、测试和提交路径都以该根为准。
- **D-02 — 四个 raw identity 原位复用。** 2026-07-21 对 protected catalog 的只读盘点确认：`BM2fNJ2-fP0T`=`百乐-pilot-cavalier`、`UrbBB-onjGnF`=`百乐-pilot-prera`、`U6w1BK0N4u0f`=`百乐-pilot-笑脸-kakuno`、`1dtEi80xLCZ1`=`百乐-pilot-贵妃-cocoon`，均为 `pen`。canonical slugs 固定为 `pilot-cavalier`、`pilot-prera`、`pilot-kakuno`、`pilot-cocoon`；不得创建新的 entity ID 或把任何 donor 条目复活为第二身份。
- **D-03 — maker 行不可变。** 四个目标当前各有且仅有一条 `made_by -> Zt-PbXkE7UHM`：`gdeaI7HOpLik`、`4TswGKGMqm3S`、`pnDEDK7tXk9c`、`7Wrmq6XovsYR`，当前 `reason` 均为 NULL。Phase 109 把完整五列值视作 immutable prerequisite；任一数量、ID、target、type 或 reason 不精确时首写前停止，不做 delete/insert/update repair。
- **D-04 — Pilot brand 只作 fixture prerequisite。** Phase 84 已提供 Pilot brand CuratedEntityPack。测试按 Phase 105/108 模式，在 caller-owned copy 上先用 Phase 84 brand + 一个既有 Pilot pen pack 建立 published/readiness=1 基线，再拍 Phase 109 before-snapshot。fixture setup 不计入 Phase 109 outcome；Phase 109 manifest 和 apply 都不得包含、重放或修改 brand pack。
- **D-05 — current 与 historical 严格分层。** Pilot 当前 web catalog 类目仍列出 Cavalier、Prera、Prera Iro-ai、Cocoon 与 Kakuno。执行时必须重新打开每个产品页、对应 catalog PDF/说明书和适用的官方新闻稿，以执行日 live 内容生成 current claims/spec evidence。The Pen Addict、A Better Desk、Well-Appointed Desk 等旧评测中的 CON-20/CON-50 只能描述作者当年样本，不能覆盖 current Pilot compatibility。若 live official 与计划或 donor 文案冲突，停止并报告，不用零售页或旧评测覆盖官网。
- **D-06 — Cavalier 旧样本诚实归因。** The Pen Addict 2011 Cavalier 文章明确是 Brian Gushikawa 修复过的 used pen；握持、平衡、笔尖/供墨观察只能标为该旧修复样本。其 CON-20 与对 CON-50/CON-70 的不确定猜测不得进入 current spec。早期 import scripts 仅提供 raw identity 和低质量 donor 线索，不复制其正文、来源等级或 current facts。
- **D-07 — Prera variant/sibling 边界。** Pilot 当前 Prera 产品页承担 base current specs；Pilot 2025-03-07 新色新闻稿的四种颜色按带发布日期和市场 scope 的 `market_sku` variants 记录。Prera Iro-ai 是相邻透明变体/系列 sibling，不新建 Phase 109 entity，也不把它的透明结构、颜色或 SKU 泛化到 base Prera。Pen Addict 2011/2026、Parka Blogs 与 Gentleman Stationer 2025 只提供各自样本体验；旧 CON-20/CON-50 为历史语境，current converter 以官网为准。
- **D-08 — Kakuno feature 不实体化。** Pilot current product page、catalog PDF 与 `kakuno_en.pdf` 负责 current positioning、材质、尺寸、尖号、cartridge/converter 和“笑脸朝上”的使用说明。A Better Desk 与 The Pen Addict 是具体样本观察。笑脸只是 nib engraving/orientation feature，不创建 smiley nib entity，不把赠测或作者样本的顺滑、耐用、线宽泛化为全系列保证。
- **D-09 — Cocoon 日本 canonical 与地区供墨边界。** Phase 109 canonical 是日本 Pilot Cocoon，current specs 只取日本 Pilot `FCO-*` 产品页/catalog/说明书。Well-Appointed Desk 2013 的 Cocoon 与 Metropolitan 比较、CON-50 和价格属于当年样本。Metropolitan/MR 只进入带地区 scope 的 sibling/alias boundary；不得创建 Metropolitan duplicate，不得把欧洲 MR 的 standard-international cartridge/配件体系泛化为日本 Cocoon current compatibility。
- **D-10 — caller-owned publication。** 所有 migration、canonicalization、pack install、review、publish 和 replay 只在 caller-owned checkpoint/disposable copy 上发生。apply 要求显式 options，不提供默认 local/remote runner；拒绝 remote env、protected main/sidecars、symlink/hard-link alias、owned-root 外路径、client/path mismatch、空 reviewer 和未迁移 032 的副本。四个实体必须对 current content hash 依次取得 fact/language/media approval，再由 `publishEntity` 产生 publication review 和 contract-v3 public snapshot。
- **D-11 — 只改 phase-local 产品文件。** 不修改 `scripts/lib/curated-content-pack.ts`、`src/lib/publication.ts`、`src/lib/audit/read-only-catalog.ts`、migrations、Phase 84/105/108 文件、shared config、Playwright/search/LLM/general runner。现有 dirty/untracked 均受保护；最终产品 commit 精确为 frontmatter 七文件，PLAN 与 SUMMARY 不进入该产品 commit。
- **D-12 — 局部交付。** Phase 109 的完成只代表 Cavalier、Prera、Kakuno、Cocoon 四页交付；SUMMARY 不得宣称 Pilot 全品牌、Phase 23 内容库存或项目全量 goal 完成。

## Discovery Level

**Level 0 — established internal pattern.** Phase 108 已完整证明 raw identity 原位规范、immutable `made_by` prerequisite、Phase 84 Pilot fixture、caller-owned checkpoint、current-hash reviews、`publishEntity`、brand isolation 与 exact noop。Phase 109 不新增 package、schema、外部 API 或共享接口；外部网页只作为执行时内容来源核验，不构成新技术集成。

## Dependency and Interface Context

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/quick/260721-gk5-phase-108-pilot-custom-heritage-91-92-ra/PLAN.md
@.planning/quick/260721-gk5-phase-108-pilot-custom-heritage-91-92-ra/SUMMARY.md
@scripts/data/phase84-platinum-pilot-p0-v3.ts
@tests/content/phase105-pilot-custom-urushi.test.ts
@scripts/data/phase108-pilot-custom-heritage-91-92.ts
@scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts
@tests/content/phase108-pilot-custom-heritage-91-92.test.ts
@scripts/lib/curated-content-pack.ts
@src/lib/publication.ts
@src/lib/audit/read-only-catalog.ts

<interfaces>
- `CuratedEntityPack` / `LoadedCuratedEntityPack`, `loadCuratedEntityPack(workspaceRoot, pack)`, `packId(pack, surface, key)` 来自 `scripts/lib/curated-content-pack.ts`；四个 pack 使用稳定且互不碰撞的 source/scope/claim/spec/variant/media IDs。
- `snapshotCatalogFiles(databasePath)`, `assertCatalogSnapshotUnchanged(snapshot)` 与 `copyCheckpointedCatalogToDisposableCopy(source, destination, ownedRoot, options)` 来自 `src/lib/audit/read-only-catalog.ts`；真实 catalog 只通过这些接口快照和复制。
- `computePublicationContentHash`, `recordEntityContentReview`, `publishEntity` 来自 `src/lib/publication.ts`；允许的 review kinds 为 fact、language、media、publication，contract version 固定为 3。
- Phase 108 的 `ApplyPhase108Options = ApplyPhase22Options`、`assertOwnedCatalog`、identity preflight、pack validation、terminal hash/noop 与 phase-local apply 是本 Phase 的最近接口模式；复制模式并改为四目标，不导入 Phase 108 私有 helper。
</interfaces>
</context>

## Task Graph

| Task | Needs | Creates | Checkpoint |
|---|---|---|---|
| 1. 定向失败测试 | Phase 84 fixture、Phase 108 pattern、四 raw catalog facts | 单文件完整行为合同 | no |
| 2. 四 pack、正文与 SVG | Task 1 assertions、live official/review sources | 四个内容包与四张原创事实图 | no |
| 3. owned apply 与产品提交 | Tasks 1-2 contracts/artifacts | canonicalization、review/publish/noop 入口与精确 commit | no |

三项顺序执行；它们分别独占 test、data/media、apply 文件，没有平行写冲突。

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 先锁定四个 raw identity、来源边界、品牌基线与 protected-catalog 回归</name>
  <files>tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts</files>
  <behavior>
    - Test 1: per D-01/D-10，测试显式使用 `/Users/xz/CodeBuddy/fountain-pen-graph` 作为逻辑 workspace；从 `snapshotCatalogFiles` + `copyCheckpointedCatalogToDisposableCopy` 创建 caller-owned copy 并迁移至 032。按 Phase 105/108 fixture 模式从 `phase84PlatinumPilotP0V3BrandPacks` 选择 Pilot brand、从 Phase 84 选择一个既有 Pilot pen pack，先建立 published/readiness=1 的 Pilot 基线；该 setup 完成后才拍 Phase 109 before-snapshot。
    - Test 2: per D-02，preflight 恰好找到四个指定 raw IDs/type/slugs，无 alternate canonical ID/slug/name collision；apply 后仍是原 ID，canonical slugs 精确，四个 raw `/pen/...` 路径各有一个指向对应 canonical path 的 permanent redirect，entity 总数不因 Phase 109 增加。
    - Test 3: per D-03，四条 made_by 行分别精确为 `gdeaI7HOpLik`、`4TswGKGMqm3S`、`pnDEDK7tXk9c`、`7Wrmq6XovsYR` 且 target 为 `Zt-PbXkE7UHM`、reason 为 NULL；apply 前后五列深比较完全相同。任一行缺失、重复、ID/target/reason 改变时在首个 Phase 109 write transaction 前失败且 disposable state 不变。
    - Test 4: per D-05/D-06，Cavalier current specs、current converter compatibility 与 current variants 只引用 Pilot live official scope；Pen Addict 2011 source 明确 `historical_repaired_sample`，其 used/repaired disclosure 和 CON-20 历史边界可检索，不能支撑 current converter/spec fields。
    - Test 5: per D-05/D-07，Prera base current spec 与 Iro-ai/2025 colors 分 scope；2025 四新色有官方 release/market variants，Iro-ai 是 variant/sibling 而非第五实体。Pen Addict/Parka/Gentleman Stationer 的样本体验均有作者/日期/sample scope，CON-20/CON-50 不进入 current spec/compatibility。
    - Test 6: per D-05/D-08，Kakuno current pack 用 Pilot official page/catalog/manual 支撑 beginner positioning、smiley-up orientation 与 filling；A Better Desk/Pen Addict 主观结论限定为各自样本。数据库中不因 Phase 109 新增 smile/smiley/nib-feature entity 或 relationship。
    - Test 7: per D-05/D-09，Cocoon current specs 指向日本 Pilot FCO product scope；Metropolitan/MR 只出现在 region-scoped alias/sibling evidence，不成为 current Japanese SKU，也没有 standard-international current claim。Well-Appointed Desk 2013 的 CON-50/价格明确是 historical sample context。
    - Test 8: 四个 body_md 各至少 2,000 个 Unicode 字符；每 pack 都有 qualified Pilot official primary + 独立 professional secondary independence group、current product scope、字段级 spec evidence、至少一个 qualified core claim、各自唯一 approved primary SVG、fact/language/media/publication 四类同 current-hash review、publishable=1、blocker_count=0 与 public membership。
    - Test 9: per D-04/D-11，Pilot brand 的 entity/story/source/reference/media/review/publication/hash 在 Phase 109 前后完全相同；Phase 84/105/108 已完成 Pilot pages 及其他非目标 Pilot payload/publication 摘要不变。允许的 brand-side observation 只有 public reverse query 新增四个 canonical target pages。
    - Test 10: 继承任一 remote selection env、空 reviewer、protected path/sidecar、symlink/hard-link alias、owned-root 外路径、client/path mismatch、未迁移 copy、错误 raw identity、canonical collision、redirect collision 或 brand/maker prerequisite 不精确时都首写前 fail closed；危险 client 从未绑定 `data/fpkg.db`，调用前后 disposable 摘要相同。
    - Test 11: 第二次执行返回四个 noop；content hashes、revisions、reviews、redirects、made_by rows、brand snapshot 和 entity count 不变。finally 关闭所有 clients 后 protected main/WAL/SHM snapshot 与测试开始前完全相同。
  </behavior>
  <action>
先新增单文件定向集成测试并观察 RED，再实现 Tasks 2-3。复用 Phase 108 的 snapshot、fixture、brand digest、non-target Pilot digest、fail-closed state digest 与 public reverse diff 结构，但不要改写或导出共享 helper。测试中的 workspace、database、ownedRoot、protected snapshot 与 reviewer 全部显式传入；不使用 init 的错误 project_root，不让 `process.cwd()` 默默决定可写目标（D-01）。

fixture setup 与 Phase 109 outcome 分开计量：fixture 可在 owned copy 上安装 Phase 84 Pilot brand/pen prerequisite，before-snapshot 必须发生在 fixture 完成之后；被测 apply 不允许接收或调用 brand pack（D-04）。对旧表可能不存在的读取采用 Phase 108 已验证的 optional-read 方式，但任何真实断言失败不得被默认值吞掉。不要新增共享 fixture、general runner、Playwright、search、LLM 或全库验收（D-11）。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts</automated>
  </verify>
  <done>失败测试完整锁定四 raw ID 原位复用、四 legacy redirects、四条 maker byte-stable、四型号来源/年代/地区边界、Phase 84 品牌基线、四类审核、authority fail-closed、replay noop 与 protected catalog 不变。</done>
</task>

<task type="auto">
  <name>Task 2: 编写四个 live-source CuratedEntityPack、四份自然中文正文与四张独立事实图</name>
  <files>scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon.ts, public/images/library/site-original/phase109/pilot/pilot-cavalier.svg, public/images/library/site-original/phase109/pilot/pilot-prera.svg, public/images/library/site-original/phase109/pilot/pilot-kakuno.svg, public/images/library/site-original/phase109/pilot/pilot-cocoon.svg</files>
  <action>
在 `scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon.ts` 定义 Pilot brand ID、四个 raw IDs/raw slugs/canonical slugs 和四个 `CuratedEntityPack`。每个 pack 内嵌独立 summary/bodyMd，正文各不少于 2,000 个 Unicode 字符，使用自然中文叙述具体结构、握持、供墨、维护、版本与适用场景；不复制早期 `import-read-first-*` 或 `import-model-gap-sources.ts` donor prose（D-02/D-11）。四包必须使用不同的 source/scope/claim/spec/variant/media key namespaces；共享 Pilot official independence group 可以，但不得共享型号专属 current claims 或 sample claims。

写作前逐一重新打开并记录执行日 `retrievedAt`、HTTP/可读状态、页面标题、作者/发布日期、精确 locator、allowedUse、archiveUrl/archiveLocator 与 independenceGroup（D-05）：Pilot fountain-pen category；四个 live web catalog product pages及其 catalog PDF；Pilot 支持页中实际适用于该型号的说明书/视频；Prera 2025-03-07 官方新色新闻稿；Cavalier The Pen Addict 2011；Prera The Pen Addict 2011 和 2026、Parka Blogs、Gentleman Stationer 2025；Kakuno A Better Desk 2015、The Pen Addict 2022；Cocoon The Well-Appointed Desk 2013。未能打开或精确定位的来源不得成为 qualified evidence；若 official current facts 与锁定身份冲突，停止并报告。不得把搜索摘要、商店参数、早期 import source cards 或不可读页面升级为官方事实。

Cavalier 按 D-06 明确分开 current official product 与 2011 repaired-used sample；细杆、材质、尺寸、尖号、current filling 和 current variants 以官网为准，作者对握持/平衡/写感的观察带旧修复样本 scope。Prera 按 D-07 把 base、Iro-ai 和 2025 四新色拆成 scopes/variants；当前规格只取官网，四篇独立来源各自归因，价格只在带日期的 sample/market scope 中出现。Kakuno 按 D-08 把笑脸记录为 nib engraving/orientation feature 和说明书使用提示，绝不生成 entity/link；成人/儿童定位、尺寸、材料和 current filling 取官网，独立评测只承担具体样本。Cocoon 按 D-09 固定日本 FCO canonical；Metropolitan/MR 使用清楚的 region alias/sibling notes，不写硬件全同，也不生成 duplicate/redirect；欧洲 MR standard-international 信息只能作为明确排除的地区边界。

四个 pack 均包含 aliases、current product scope、必要的 historical/sample/region scopes、qualified claims、claim citations/evidence、全部必需 spec field evidence、market_sku variants、timeline/source-boundary events 与唯一 primary media。旧 CON-20/CON-50 只允许出现在名称明确的 historical sample claim/scope，且 `qualifies=false` 或不参与 current spec evidence；current converter/filling 只能由当前 Pilot official source item 支撑（D-05）。四页不写“本页/当前档案/待核验/研究队列”等后台策展口吻，不把单个作者感受写成品牌承诺。

分别绘制四张 1600x900 site-original SVG，显著写明“本站原创示意图，非产品照片”以及非比例、非颜色/表面复刻，不使用 Pilot Logo 或外站图片：Cavalier 以细杆金属比例和供墨组件为主；Prera 以短身、snap cap、base/variant 边界为主；Kakuno 以握持引导和“笑脸朝上”功能标注为主并明确笑脸非独立部件实体；Cocoon 以日本金属笔身、FCO scope 和地区供墨边界为主。四图不能是同一轮廓换标题/颜色；每个 pack 只能将自己的 SVG 设为唯一 `approved primary` media。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; tmp_fmt=$(mktemp) &amp;&amp; pnpm exec biome format --stdin-file-path scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon.ts &lt; scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon.ts &gt; "$tmp_fmt" &amp;&amp; cmp -s "$tmp_fmt" scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase109/pilot/pilot-cavalier.svg public/images/library/site-original/phase109/pilot/pilot-prera.svg public/images/library/site-original/phase109/pilot/pilot-kakuno.svg public/images/library/site-original/phase109/pilot/pilot-cocoon.svg &amp;&amp; node --import tsx --test tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts</automated>
  </verify>
  <done>四个原 ID 各自拥有 2k+ 自然中文正文、live-verified official/professional evidence、current/history/variant/region 边界、严格分立的 CuratedEntityPack 与四张构图独立的原创主图。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现四目标 owned-only canonicalization、current-hash review/publish、noop 与精确产品提交</name>
  <files>scripts/apply-phase109-pilot-cavalier-prera-kakuno-cocoon-content.ts</files>
  <behavior>
    - Test 1: 首次 apply 只返回四个指定 IDs 的 published outcomes；canonical slug/name/source marker 和 raw permanent routes 精确，未创建 entity、maker 或 Metropolitan/Iro-ai/smiley 替代实体。
    - Test 2: identity transaction 不执行四条目标 made_by 的 delete/insert/update；四行完整摘要、Pilot brand current hash/reviews/publication 和非目标 Pilot pages 不变。
    - Test 3: pack install 后四实体各自产生 fact/language/media current-hash approvals，`publishEntity` 产生 publication review 并原子安装 contract-v3 public snapshot。
    - Test 4: terminal state 精确匹配时返回四个 noop，不重做 content reviews、publication、redirect、identity 或 topology。
  </behavior>
  <action>
以 Phase 108 phase-local installer 为直接模式实现 `ApplyPhase109Options`、四 target constants、pack validation、authority preflight、identity/route transaction、pack install、review/publish 和 exact terminal hash。只接受调用者显式传入的 workspaceRoot、reviewer、databasePath、ownedRoot、protectedCatalogPath、protectedCatalogSnapshot 和 env；per D-01 所有仓库文件定位从 `/Users/xz/CodeBuddy/fountain-pen-graph` 逻辑根开始，拒绝使用 init 的 Documents project_root。per D-10 在首个写事务前拒绝 remote selectors、空 reviewer、protected main/sidecars 或 inode alias、symlink、owned-root 外路径、client/path mismatch、未迁移 032 copy，并用 `PRAGMA database_list` 确认连接绑定授权副本。

preflight 固定 Pilot brand `Zt-PbXkE7UHM` 的 type/slug/public/readiness，四 raw IDs/type/slugs、四 canonical slugs 无其他 ID 占用，以及 D-03 的四条完整 made_by rows。检查顺序先 identity，再 maker/route，最后 brand readiness，以便 maker 被破坏并触发 brand invalidation 时仍报告具体 prerequisite。maker 或 brand 不精确则停止，不做 topology repair、brand re-review 或 brand pack replay（D-03/D-04）。

单个 identity/route transaction 只规范四目标的 slug/name/source identity marker，并为 `/pen/百乐-pilot-cavalier`、`/pen/百乐-pilot-prera`、`/pen/百乐-pilot-笑脸-kakuno`、`/pen/百乐-pilot-贵妃-cocoon` 建立到四 canonical paths 的 permanent `entity_redirects`，使用稳定 batch/action IDs。已存在 route 必须精确匹配，否则 fail closed。不要写 `entity_links`，不要创建显式 brand reverse payload；品牌反向导航由现有 made_by 与 public_entities 自然产生（D-02/D-03）。

用 `loadCuratedEntityPack`/`packId` 在包级事务中替换四目标自有 story/source/reference/alias/scope/claim/citation/evidence/spec/spec evidence/variant/timeline/media，并保持非公开 current revision；随后逐实体对 `computePublicationContentHash` 调用 `recordEntityContentReview` 写 fact/language/media approved reviews，再调用 `publishEntity`。不得直接 update lifecycle 为 published、直接写 publication review 或 public_entities（D-10）。terminal noop 同时核对 identity、source marker、redirect、完整 maker row、唯一 primary media、current hash、四类唯一 approvals、reviewed contract/revision、readiness/public membership，以及不存在 D-07/D-08/D-09 禁止的额外实体。

验证通过后只 stage frontmatter 七个绝对 owned paths，先比较 staged path set 与固定 allowlist，再运行 staged diff check，使用 `feat(content): publish Pilot Cavalier Prera Kakuno and Cocoon` 创建一个产品 commit。提交前后都确认 index 不含其他路径；若 index 预先非空则停止并报告，不覆盖他人的 staged work。禁止 `git add .`、glob add、stash、clean、reset、checkout、force 或修改任何现有 dirty/untracked 文件（D-11）。用 `git show --name-only --format=` 再次证明 commit path set 精确。随后按模板写 SUMMARY（不加入产品 commit），记录 live source locator、四 raw/canonical routes、source boundary、hash/review/publication/noop 结果、protected snapshot、测试命令、产品 commit hash和局部交付声明（D-12）。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts &amp;&amp; git diff --check -- scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon.ts scripts/apply-phase109-pilot-cavalier-prera-kakuno-cocoon-content.ts tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts public/images/library/site-original/phase109/pilot/pilot-cavalier.svg public/images/library/site-original/phase109/pilot/pilot-prera.svg public/images/library/site-original/phase109/pilot/pilot-kakuno.svg public/images/library/site-original/phase109/pilot/pilot-cocoon.svg</automated>
  </verify>
  <done>四 raw IDs 在 caller-owned copy 上原位规范并发布，maker/brand/non-target/protected catalog 零扰动，replay 四项 noop；产品 commit 只含七个 owned 文件，SUMMARY 准确报告 Phase 109 局部交付。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Live web -> curated pack | 外部网页内容进入来源、claims、specs、variants 和中文正文；页面可能过时、改版或包含地区/年代歧义。 |
| Caller -> phase-local apply | 调用者提供 database path、owned root、workspace root、reviewer、env 与 protected snapshot；错误路径可能把写操作导向真实 catalog。 |
| Raw catalog -> canonical identity | 四个既有 identity、legacy routes 与 made_by topology 被规范；错误合并会制造 duplicate、断链或品牌失效。 |
| Curated pack -> public contract | 内容 hash、reviews、readiness 与 publication 决定公开可见状态；绕过 gate 会发布未经审核内容。 |
| Dirty worktree -> product commit | 工作区含其他 agent/user 的 modified/untracked 文件；宽泛 staging 会污染或覆盖他人工作。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-109-01 | Spoofing | official/professional source identity | medium | mitigate | Task 2 记录 live URL、title、author/date、locator、retrievedAt、allowedUse、archive fields 与 independenceGroup；不可读页面或 search snippet 不进入 qualified evidence。 |
| T-109-02 | Tampering | database path and protected catalog | critical | mitigate | Task 1/3 使用 protected snapshot、caller-owned root、real path/inode/sidecar/PRAGMA checks，在首写前拒绝 remote、protected、alias、mismatch 与未迁移副本。 |
| T-109-03 | Tampering | immutable made_by topology | high | mitigate | Task 1/3 精确核对四条五列 row digests；不执行 topology repair，任何偏差首写前 fail closed，brand digest 前后深比较。 |
| T-109-04 | Repudiation | historical/current and region claims | medium | mitigate | D-05 至 D-09 要求 current official scopes、historical repaired/sample scopes、Prera variant scopes 与 Cocoon region boundary；字段 evidence 可追溯到具体 locator。 |
| T-109-05 | Information Disclosure | remote credentials | high | mitigate | apply 拒绝继承 remote database selectors，计划不读取或输出 token；所有敏感凭据只允许环境变量存在且本 Phase 不消费。 |
| T-109-06 | Denial of Service | broad/full-suite regression | low | accept | 本 Phase 只运行一个定向 integration test、TypeScript 和 owned-file format/XML checks；不扩张全库/浏览器测试，风险局限于 phase-local 执行。 |
| T-109-07 | Elevation of Privilege | direct publication writes | high | mitigate | Task 3 只通过 current-hash `recordEntityContentReview` 与 `publishEntity`；测试断言四类 review、contract-v3 readiness 和 public snapshot，禁止直接 lifecycle/public table 写入。 |
| T-109-08 | Tampering | exact product commit | high | mitigate | Task 3 使用固定七文件 allowlist、预先空 index、显式 path staging、cached diff 与 post-commit path-set proof；绝不 stash/clean/reset/覆盖 dirty 文件。 |
| T-109-SC | Tampering | package supply chain | low | accept | Phase 109 不安装或升级 npm/pip/cargo package，不产生 package-manager trust crossing；若执行中出现安装需求即停止并重新规划。 |

</threat_model>

## Source Coverage Audit

| SOURCE | ID | Feature / Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 四个 Pilot raw 条目原位成为来源化公开页面 | 1-3 | COVERED | identity、内容、媒体、publication 与提交闭环 |
| REQ | QUICK-260721-H68 | Phase 109 Pilot Cavalier/Prera/Kakuno/Cocoon 局部交付 | 1-3 | COVERED | quick requirement 由本单计划完整覆盖 |
| RESEARCH | R-01 | Phase 108 caller-owned/raw canonicalization 模式 | 1,3 | COVERED | 复用模式，不修改 Phase 108 |
| RESEARCH | R-02 | Pilot current catalog/产品页/说明书/新闻稿为 current authority | 1,2 | COVERED | live 执行日核验，冲突停止 |
| RESEARCH | R-03 | 独立实测按作者、年代、样本状态归因 | 1,2 | COVERED | Cavalier repaired sample 等边界均测试 |
| RESEARCH | R-04 | 早期 import scripts 只作 donor/identity clues | 2 | COVERED | 禁止复制正文或复活身份 |
| CONTEXT | D-01 | 固定 CodeBuddy root，拒绝错误 Documents project_root | 1,3 | COVERED | explicit logical root 与命令路径 |
| CONTEXT | D-02 | 四个 raw ID 原位复用、规范 slugs/redirects、无 duplicate | 1,3 | COVERED | 四 IDs/slugs/routes/entity-count assertions |
| CONTEXT | D-03 | 四条 made_by byte-stable，偏差首写前失败 | 1,3 | COVERED | exact five-column digests |
| CONTEXT | D-04 | Phase 84 Pilot fixture baseline，Phase 109 不重放品牌 | 1,3 | COVERED | fixture-before-snapshot 与 brand digest |
| CONTEXT | D-05 | current official 优先，旧 converter 仅历史 | 1,2 | COVERED | current/history scope 与 evidence qualification |
| CONTEXT | D-06 | Cavalier Pen Addict 是旧修复样本 | 1,2 | COVERED | historical_repaired_sample |
| CONTEXT | D-07 | Prera Iro-ai/2025 new colors 为 variant/sibling | 1,2 | COVERED | scoped variants，无新实体 |
| CONTEXT | D-08 | Kakuno 笑脸尖不是实体 | 1,2,3 | COVERED | feature-only content 与 entity-count assertion |
| CONTEXT | D-09 | Cocoon 日本 canonical，MR/Metropolitan 地区边界 | 1,2,3 | COVERED | region scope、无 duplicate、无 EU fill generalization |
| CONTEXT | D-10 | caller-owned checkpoint、current-hash review + publishEntity | 1,3 | COVERED | authority and publication gates |
| CONTEXT | D-11 | 定向回归、shared infra 不变、dirty 保护、七文件提交 | 1-3 | COVERED | phase-local ownership 与 exact allowlist |
| CONTEXT | D-12 | 只报告局部交付 | 3 | COVERED | SUMMARY handoff contract |

Deferred ideas: none supplied. Source audit has no missing items.

## Pre-Mortem and Reachability Check

1. **最可能失败：旧评测 converter 被误当 current。** Mitigation: Task 1 对 current spec evidence source IDs 做正向断言，并对 CON-20/CON-50 current claims 做负向结构断言；Task 2 要求 historical sample scopes。
2. **最可能失败：maker/brand 因 identity 操作失效。** Mitigation: maker 五列 prerequisite 在首写前锁定，identity transaction 禁止触碰 links，brand full digest 和 non-target digest 前后深比较。
3. **最可能失败：Cocoon/Metropolitan 或 Prera/Iro-ai 被错误合并/复制。** Mitigation: variant/region scopes、固定四 entity count、禁止第五 identity/redirect、current SKU source separation。
4. **最可能失败：测试或提交污染真实 catalog/dirty worktree。** Mitigation: caller-owned authority rejection、protected main/WAL/SHM snapshot、显式七文件 staging 和 commit path-set proof。

Reachability is complete: existing raw entity -> canonical slug transaction -> permanent legacy redirect -> CuratedEntityPack install -> current-hash reviews -> `publishEntity` -> `public_entities` -> existing made_by reverse navigation from Pilot brand. No artifact depends on an unplanned route, entity, config flag or shared-infra change.

<verification>

1. `node --import tsx --test tests/content/phase109-pilot-cavalier-prera-kakuno-cocoon.test.ts` passes on a caller-owned checkpoint copy and proves protected main/WAL/SHM unchanged.
2. `pnpm exec tsc --noEmit --pretty false` passes.
3. The phase data/apply scripts are parsed and byte-compared against Biome stdin formatter output; the focused test passes `biome check`; all four SVGs pass `xmllint --noout`.
4. Four bodies each have at least 2,000 Unicode characters, one qualified official + one independent professional group, complete current spec evidence, one unique approved primary SVG and four current-hash approvals.
5. First apply produces exactly four published outcomes; second apply produces exactly four noop outcomes with stable hashes/revisions/reviews/routes/maker rows.
6. Pilot brand and non-target Pilot digests are byte/logically unchanged; public reverse diff contains only the four target canonical pages.
7. `git diff --check`, staged allowlist comparison and post-commit `git show --name-only` prove the product commit contains exactly the seven frontmatter files.

</verification>

<success_criteria>

- Four specified raw IDs are the only Cavalier/Prera/Kakuno/Cocoon identities and resolve through canonical + permanent legacy routes.
- All four pages are source-qualified, 2k+ natural Chinese, independently illustrated and contract-v3 published on a disposable catalog copy.
- Current, historical, repaired-sample, variant and region boundaries match D-05 through D-09 without converter or identity leakage.
- Existing made_by rows, Pilot brand, other Pilot pages, shared infrastructure, protected catalog and unrelated dirty/untracked files remain unchanged.
- One exact seven-file product commit exists; SUMMARY truthfully records a local Phase 109 delivery.

</success_criteria>

<output>
Create `.planning/quick/260721-h68-phase-109-pilot-raw-bm2fnj2-fp0t-cavalie/SUMMARY.md` when execution is done. Do not include PLAN.md or SUMMARY.md in the seven-file product commit.
</output>
