---
phase: quick
plan: 260722-adq
slug: publish-the-missing-wancher-puchico-mode
type: execute
status: ready
wave: 1
depends_on: []
autonomous: true
created_at: 2026-07-22
requirements:
  - QUICK-260722-ADQ
files_modified:
  - .planning/content-research/wancher-puchico-phase119.md
  - scripts/data/phase119-wancher-puchico.ts
  - scripts/apply-phase119-wancher-puchico-content.ts
  - tests/content/phase119-wancher-puchico.test.ts
  - public/images/library/site-original/phase119/wancher/wancher-puchico.svg
must_haves:
  truths:
    - "Wancher PuChiCo 以 stable ID `phase119-wancher-puchico`、slug `wancher-puchico`、canonical name `Wancher PuChiCo` 发布为唯一 canonical pen；颜色只作为该 pen 的 variants，不产生颜色实体。"
    - "2026-07-22 官方 collection 支持的 65 mm capped-before-posting、acrylic shavings/cutting、eyedropper 与 current color listing 被准确记录；stock、price 和 availability 只保留 retrieval snapshot/mutable 边界。"
    - "当前 collection 的 11 个 PuChiCo pen cards 精确成为 variants：Lime Sherbet、Lilac Mist、White Snow、Hawaiian Blue、Black Chocolate Orange、Arctic Blue、Peony Pink、Frosty Sepia、Tropical Green、Milky Soda、Penguin Black；3 个 Petite Charm Case 不得成为 pen variants。"
    - "Sarah Read 2024-07-25 的 JetPens-supplied sample 与 Kimberly Lau 2025-06-20 的 self-purchased Black Chocolate Orange sample 分属两个 professional sample scopes；作者、日期、取得方式和具体样品身份都可审计。"
    - "两篇评测中的约 0.5 ml、flight/leak/burp、nib feel、posting/hand-fit、价格、颜色与耐久观察不进入全系 current stable specs；只有官方同样支持的字段才可进入 current model facts。"
    - "PuChiCo 只有 `made_by` 指向既有 Wancher brand `eOfD77nOeENN`，并有唯一 Wancher `reverse`；新增 topology 后品牌只按 post-topology current hash 经 `recordEntityContentReview` 与 `publishEntity` 恢复，不 replay 任何旧 brand pack。"
    - "所有 migration、apply、review、publish、replay、tamper 与查询写入只发生在 caller-owned checkpoint copy；真实 `data/fpkg.db` main/WAL/SHM snapshot 始终不变。"
    - "首次 pristine apply 返回一个 published，第二次返回一个 exact noop；alternate identity/source owner、partial terminal 或 topology/evidence/review/publication tamper 全部 fail closed 且不自动修复。"
    - "Phase 104 Dream Pen article、Phase 107 Wancher/True Ebonite、Phase 112 Titanium Black、Phase 113 Aka Tamenuri 的 payload/topology/publication 均受保护；Wancher non-topology payload保持不变。"
    - "唯一产品提交精确包含五个 owned 产品文件，subject 精确为 `feat(content): publish Wancher PuChiCo`；PLAN/SUMMARY 单独处理，unrelated dirty/untracked 原样保留，本轮明确为 full corpus goal 中的 partial batch。"
  artifacts:
    - path: ".planning/content-research/wancher-puchico-phase119.md"
      provides: "60-160 Unicode 字符 summary 与至少 2,000 Unicode 字符的自然中文来源化正文，含 canonical/variant、official current 与两个 sample scopes"
    - path: "scripts/data/phase119-wancher-puchico.ts"
      provides: "单一 PuChiCo CuratedEntityPack、稳定 identity、11 个 color variants、source/scope/claim/spec/rejected-evidence/timeline/media 映射"
    - path: "scripts/apply-phase119-wancher-puchico-content.ts"
      provides: "caller-owned authority、duplicate/source-owner preflight、exact topology、Wancher current-hash recovery、target publish 与 guarded noop"
    - path: "tests/content/phase119-wancher-puchico.test.ts"
      provides: "单 setup Phase 104/107/112/113 baseline、sample-scope、variant、brand hash、authority、tamper/noop、protected catalog 与 exact commit contract 回归"
    - path: "public/images/library/site-original/phase119/wancher/wancher-puchico.svg"
      provides: "PuChiCo exact facts、11 色 snapshot 与 2024/2025 sample exclusions 的唯一本站原创 factual SVG"
  key_links:
    - from: "scripts/data/phase119-wancher-puchico.ts"
      to: "scripts/apply-phase119-wancher-puchico-content.ts"
      via: "CuratedEntityPack loader、stable source marker 与 pack-owned IDs"
    - from: "scripts/apply-phase119-wancher-puchico-content.ts"
      to: "src/lib/publication.ts"
      via: "topology 固定后为 Wancher 与 PuChiCo 的 current hash 写 fact/language/media approvals，再调用 publishEntity"
    - from: "phase119-wancher-puchico"
      to: "eOfD77nOeENN"
      via: "唯一 pen -> Wancher made_by 与 Wancher -> pen reverse pair"
    - from: "official collection PuChiCo product cards"
      to: "model_variants for phase119-wancher-puchico"
      via: "retrieved-date 11-name exact set；availability mutable，Petite Charm Case excluded"
---

# Quick Task 260722-adq: Publish Wancher PuChiCo

<objective>
发布缺失的 Wancher PuChiCo：一个 canonical pen 承载官方 collection 的颜色 variants，并把官方 current facts、Sarah Read 2024 sample 与 Kimberly Lau 2025 sample 拆成三个不可混用的证据 scope。发布只在 caller-owned checkpoint copy 完成，新增 brand topology 后按 current hash 重审恢复 Wancher，且不改变既有 Wancher/Dream Pen 页面。

Purpose: 让读者能从一页准确理解 PuChiCo 的极短尺寸、acrylic/eyedropper 结构、颜色选择与两个真实使用样本，同时不会把单支样品的容量、飞行表现、写感、价格或颜色体验错误推广到整条产品线。
Output: 一份 2k+ 中文 reviewed copy、一个单实体 CuratedEntityPack、一个 phase-local caller-owned apply、一个单 setup targeted integration regression 与一张独有 factual SVG。
</objective>

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/STATE.md
@scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts
@scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts
@tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts
@scripts/data/phase112-wancher-dream-pen-titanium-black.ts
@scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts
@tests/content/phase112-wancher-dream-pen-titanium-black.test.ts
@scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.ts
@scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content.ts
@tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts
@scripts/data/phase117-aurora-optima-family-current-pens.ts
@scripts/apply-phase117-aurora-optima-family-current-pens-content.ts
@tests/content/phase117-aurora-optima-family-current-pens.test.ts
@scripts/lib/curated-content-pack.ts
@src/lib/audit/read-only-catalog.ts
@src/lib/publication.ts

<interfaces>
- `CuratedEntityPack` 从 `markdownFile` 加载 `## summary` 与 `## body_md`；`loadCuratedEntityPack(workspaceRoot, pack)` 产生 stable source marker，pack-owned payload IDs 必须可重复计算。
- `recordEntityContentReview(client, { entityId, reviewKind, reviewer, status, notes })` 写 fact/language/media review；`publishEntity(client, { entityId, reviewer })` 生成 publication review并安装 contract-v3 snapshot。不得直接 SQL 修改 lifecycle、review、publication 或 public tables。
- Wancher brand 固定为 `eOfD77nOeENN`；Phase 104 Dream Pen article 固定为 `2aoD07lwSYCV`；Phase 107 pen 固定为 `phase107-wancher-true-ebonite-matte-black`；Phase 112 pen 固定为 `phase112-wancher-dream-pen-titanium-black`；Phase 113 pen 固定为 `phase113-wancher-dream-pen-true-urushi-aka-tamenuri`。
- Phase 119 target 固定为 ID `phase119-wancher-puchico`、slug `wancher-puchico`、name `Wancher PuChiCo`。颜色是 `model_variants`，不能创建 Lime Sherbet、White Snow、Black Chocolate Orange 等独立 entities。
- 2026-07-22 duplicate audit 在 checkpoint copy 中得到：PuChiCo identity/alias/source owner 为零；真实 inventory 只有 Wancher brand 与旧 generic Dream Pen，repo 无 PuChiCo pack。若执行时发现已有 PuChiCo pack、alternate pen identity、alias、source owner 或同一 collection/product URL 的非 target pen owner，首写前停止并报告，禁止重复发布、merge、redirect、retire 或猜 survivor。
- 官方 collection：`https://www.wancherpen.com/collections/puchico`。retrieved `2026-07-22`，支持 PuChiCo collection、65 mm capped-before-posting、cap posting、eyedropper、acrylic shavings/cutting、normal-sized iridium-point stainless-steel nib 与当日 color cards。collection 同时含 3 个 Petite Charm Case，不能当 pen variants。
- 2026-07-22 collection pen-card set：Lime Sherbet、Lilac Mist、White Snow、Hawaiian Blue、Black Chocolate Orange、Arctic Blue、Peony Pink、Frosty Sepia、Tropical Green、Milky Soda、Penguin Black。stock、price、in-stock/out-of-stock count 与稍后 availability 都是 mutable commerce state。
- 可选 exact product `https://www.wancherpen.com/products/puchico-whitesnow` 只能证明 White Snow variant 的 retrieved-date snapshot；它不能代表全系材质、nib、价格、库存或其它颜色。若页面不可取得，collection card 已足以支持 variant name，不得编造 exact-product fields。
- Sarah Read source：`https://www.penaddict.com/blog/2024/7/25/wancher-puchico-mini-fountain-pen`，posted `2024-07-25`，JetPens 免费提供 review sample。6.5 cm capped、约 0.5 ml、数周随身无 leak、nib/threads/clip/comfort 与当时价格均为该 supplied sample 的 professional observations。
- Kimberly Lau source：`https://www.penaddict.com/blog/2025/6/19/wancher-puchico-a-pen-for-ants`，posted `2025-06-20`；作者在 2024 SF Pen Show 向 Kirk Speer 全价购买 Black Chocolate Orange/Fine sample。约 0.5 ml、EF/F availability、dozen flights 无 burp、Fine feel、60 mm unposted/90 mm posted、cap security、hand-fit、价格与 retailer colors 均为该 self-purchased sample scope。
- 两篇 Pen Addict 文虽同属 publication，但作者、日期、取得方式和样品不同；data 中用两个独立 professional sample source items/scopes 保留 Sarah Read/2024 与 Kimberly Lau/2025 provenance。不能用其中一篇修补另一篇缺失字段，也不能把 sample observations 写成所有 current variants 的 stable specs。
- repo authority 只接受 `/Users/xz/CodeBuddy/fountain-pen-graph` 与 `/Users/xz/Documents/fountain-pen-graph` 输入，且两者 `realpath` 和 `git rev-parse --show-toplevel` 都落到 `/Users/xz/Documents/fountain-pen-graph`。DB authority另验证 caller-owned containment、no symlink/hard-link、protected main/WAL/SHM snapshot、PRAGMA client/path 与 migration 032。
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 先锁定 canonical/variant、三 source scopes、current-hash 与保护契约</name>
  <files>tests/content/phase119-wancher-puchico.test.ts</files>
  <behavior>
    - Test 1: 一个 top-level test 只建立一次 caller-owned checkpoint setup，migration 到 032 后依次 apply Phase 104、107、112、113 prerequisites；确认五个 prerequisite identities/publications 正确、PuChiCo identity/alias/source owner 为零，再执行首次 Phase 119 apply并得到唯一 published outcome。
    - Test 2: target 的 ID/slug/name 精确为 Phase 119 constants，summary 60-160 Unicode、body 至少 2,000 Unicode，唯一 canonical pen，且没有任何颜色名 entity 或第二个 PuChiCo pen。
    - Test 3: variants 精确等于 11 个官方 PuChiCo pen cards；每个 variant source 指向 retrieved-date official collection/exact variant snapshot，availability 标明 mutable；3 个 Petite Charm Case 不在 variants。
    - Test 4: current official scope 支持 65 mm capped-before-posting、posted use、eyedropper、acrylic shavings/cutting 与 stainless-steel nib；price、stock 和 availability 不进入 stable model specs。
    - Test 5: 2024 scope 保存 Sarah Read、2024-07-25、JetPens supplied disclosure；2025 scope保存 Kimberly Lau、2025-06-20、self-purchased Black Chocolate Orange/Fine disclosure。两个 source items/scopes 独立存在。
    - Test 6: 约 0.5 ml、leak/burp/flight、nib feel、posting security、hand comfort、review price 与 sample color 均以 sample-only claims或 rejected spec evidence存在，且不出现在 official-current model values或 line-wide claim。
    - Test 7: PuChiCo 只有一对 `made_by`/`reverse` 连接 `eOfD77nOeENN`；Wancher reverse set只新增 PuChiCo，non-topology digest不变，contract hash精确变化后 reviews绑定 post-topology current hash并由 `publishEntity` 恢复。
    - Test 8: Phase 104 article、Phase 107 True Ebonite、Phase 112 Titanium Black、Phase 113 Aka Tamenuri 的 full digests、topology与publications前后相等；Phase 107/112/113 brand packs不 replay。
    - Test 9: alternate target ID/slug/name/alias、collection或exact-product的非 target pen owner、source marker collision、额外 maker、partial terminal、缺 scope/variant/media/review/hash/publication 均 fail closed，失败前后 owned row digest相等。
    - Test 10: remote env、空 reviewer、第三 repo root、owned-root 外路径、protected main/sidecar、symlink/hard-link、client/path mismatch与未迁移 copy全部拒绝；pristine replay exact noop，link/source/scope/review tamper不修复，finally 证明真实 main/WAL/SHM snapshot不变。
  </behavior>
  <action>
按 D-01 至 D-14 先写失败 integration regression。直接复用 Phase 113 的 Wancher exact-pen baseline/protection与 Phase 117 的 current-hash/noop/tamper pattern，但测试只使用一个 setup/migration chain，避免重复跑 prerequisite runners。fault cases 从同一 owned checkpoint 状态派生或在同一 owned client 内串行构造；任何测试都不能 SQLite-open 真实 catalog。

把 duplicate/source-owner preflight写成结构断言：ID、slug、canonical name、aliases、PuChiCo collection URL、可选 White Snow URL、source marker 与现有 content-pack files 都必须盘点。首次状态只能是 absent；terminal 状态只能是 locked target + exact marker。任何其它 owner在首个 write transaction 前拒绝，不能把旧 generic Dream Pen、颜色、collection card或 article当 donor。

用 scope/spec-evidence 断言阻止泛化，不以正文 negative keyword count 代替 wiring。2024 与 2025 review必须分别断言 author/date/acquisition/sample identity；sample capacity、flight/leak、nib feel、price、posting/hand fit和颜色只能在对应 scope中出现。测试另校验新 SVG 为 1600x900、含 site-original/non-photo/non-logo 声明，且 SHA-256 不等于 Phase 107/112/113 三张 Wancher SVG。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase119-wancher-puchico.test.ts</automated>
  </verify>
  <done>失败测试完整锁定单一 canonical pen、11 variants、两个 sample scopes、exact topology/current-hash、first publish/noop/tamper、prerequisite protection与真实 catalog不变。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: 编写 PuChiCo evidence pack、2k+ 中文与唯一 factual SVG</name>
  <files>.planning/content-research/wancher-puchico-phase119.md, scripts/data/phase119-wancher-puchico.ts, public/images/library/site-original/phase119/wancher/wancher-puchico.svg</files>
  <behavior>
    - Test 1: Markdown summary 60-160 Unicode、body 至少 2,000 Unicode；正文自然区分 canonical model、color variants、official facts、2024 supplied sample与2025 self-purchased sample。
    - Test 2: pack只定义一个 PuChiCo entity并导出稳定 constants/URLs；11 variants exact set来自 official collection，cases excluded，availability mutable。
    - Test 3: official current model values只含 collection支持的 identity、65 mm capped-before-posting、eyedropper、acrylic/process与 stainless-steel nib；optional White Snow仅为variant snapshot。
    - Test 4: Sarah Read 与 Kimberly Lau 分别具有独立 source/scopes/citations和provenance；所有 sample-only容量、flight/leak、nib feel、price、color、posting/hand-fit字段均不能qualify line-wide specs。
    - Test 5: SVG以全新构图区分 official model/variant snapshot、2024 sample与2025 sample exclusions；显著声明本站原创、non-photo、non-logo、not-to-scale、not-colour-proof，不复刻 Wancher logo、外站图片或既有 Wancher SVG。
  </behavior>
  <action>
按 D-01 至 D-05 写 `.planning/content-research/wancher-puchico-phase119.md`。正文从“65 mm capped并不等于所有使用体验相同”切入，依次说明一个型号/多颜色、official collection 的设计与 eyedropper、11 色 retrieved snapshot、Sarah Read supplied sample、Kimberly Lau self-purchased sample、哪些观察不能跨样品、如何阅读 variant availability。保留 full corpus goal 仍在进行的边界，不宣称 Wancher 或全库完成。

data 文件导出 `PHASE119_WANCHER_ID`、Phase 104/107/112/113 protected IDs、`PHASE119_PUCHICO_ID`、`PHASE119_PUCHICO_SLUG`、三个 locked source URLs与单一 `CuratedEntityPack`。official source用 primary `wancher-official`；两篇 review各自保存 professional secondary author/date/acquisition metadata与独立 sample scope；SVG使用 editorial source。所有 live URLs的 archive locator诚实记录 `live-source-not-frozen` 与 retrieval date。

官方 facts只写 collection实际支持的字段。11 个 color variants逐项建立 `model_variants`，notes 明确 retrieved-date listing与availability mutable；不要为 cases建 variant。White Snow exact page只在可取得时作为该 variant snapshot，不能给其它 colors或全系补字段。两篇 review的约 0.5 ml、飞行/漏墨、nib feel、价格、sample color、posting与hand fit建立 sample-only claims和/或 `qualifies: false` spec evidence，不进入 current stable values。SVG以事实卡与边界线表达，不画仿真产品、logo或色准样本。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; pnpm exec biome check scripts/data/phase119-wancher-puchico.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase119/wancher/wancher-puchico.svg &amp;&amp; node --import tsx --test tests/content/phase119-wancher-puchico.test.ts</automated>
  </verify>
  <done>单一 PuChiCo pack、11 color variants、2k+ 中文、official current facts、两个 sample scopes/rejected evidence与唯一 SVG 通过定向回归。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现 caller-owned 发布、Wancher post-topology恢复与精确五文件提交</name>
  <files>scripts/apply-phase119-wancher-puchico-content.ts</files>
  <behavior>
    - Test 1: repo/DB authority、migration、Phase 104/107/112/113 baseline、repo pack scan与 exact duplicate/source-owner checks 全在首个 write transaction前完成；失败零部分写入。
    - Test 2: identity/topology transaction只新建 PuChiCo并写唯一 PuChiCo -> Wancher made_by和Wancher -> PuChiCo reverse；不改 protected entities或其它 Wancher links。
    - Test 3: Wancher non-topology payload/source marker unchanged，hash只因 exact link pair改变；fact/language/media approvals绑定expected current hash，随后调用publishEntity恢复品牌，不 replay旧 pack。
    - Test 4: target-owned payload安装后，PuChiCo按current hash完成fact/language/media review与publishEntity；terminal断言覆盖identity、variants、scopes、rejected evidence、media、topology、reviews、readiness/public membership和brand publication。
    - Test 5:完整 terminal才返回noop；partial/tampered terminal不reload、不re-review、不repair。产品commit只含五个frontmatter paths，subject精确匹配锁定值。
  </behavior>
  <action>
按 D-06 至 D-14 以 Phase 113 apply为Wancher topology直接 analog、Phase 117为current-hash terminal analog，实现phase-local authority/preflight/topology/install/review/publish/noop flow；不要修改、抽取或扩建 shared runner、readiness、Playwright、search或LLM。

CLI只接受显式 `--database`、`--owned-root`、`--protected-catalog`与可选 reviewer。首写前拒绝 inherited remote selectors、空 reviewer、未核验 repo root、owned-root外路径、protected main/WAL/SHM、symlink/hard-link、PRAGMA client/path mismatch与未迁移032。真实catalog只通过 `snapshotCatalogFiles` 与 `copyCheckpointedCatalogToDisposableCopy`参与，不能直接打开或写入。

baseline必须验证 Phase 104 article、Phase 107 Wancher/True Ebonite、Phase 112 Titanium Black、Phase 113 Aka Tamenuri exact identities/source/publication/topology。捕获四个protected entity full digests、Wancher non-topology digest/current hash与完整reverse set。duplicate scan覆盖target identity/name/slug/aliases、collection/exact product source owner、Phase119 marker和repo PuChiCo pack；发现alternate或既有包立即fail closed。

首次 topology transaction只插入locked target与exact link pair。transaction后证明protected digests与Wancher non-topology payload相等、reverse set只增加PuChiCo、brand hash发生expected改变；为该 current hash调用三类`recordEntityContentReview`再`publishEntity`。禁止direct lifecycle SQL、品牌pack replay或沿用旧hash approvals。

以pack-owned transaction安装source/reference/alias/variant/scope/claim/citation/spec evidence/timeline/media，再对target current hashreview/publish。terminal/noop核对11 variants exact set、case exclusion、两个sample scopes/provenance、rejected evidence、唯一primary media、exact topology、四类reviews、contract-v3 readiness/public membership、Wancher current approved hash及所有protected digests；任何偏差只报错。

验证通过后处理Git：先要求index为空；只显式stage五个frontmatter product paths，`scripts/data/phase119-wancher-puchico.ts`如受repo ignore影响只对该精确路径使用`git add -f`。比较cached path exact set并运行cached diff check；异常只撤销本包五路径staging后停止。禁止`git add .`、glob add、stash、clean、reset、checkout、force或改动unrelated files。提交subject精确为`feat(content): publish Wancher PuChiCo`，再用`git show --name-only --format=`证明恰好五路径。PLAN与SUMMARY不进产品提交；之后写本quick目录SUMMARY，记录sources/scopes、hash/no-replay、single setup、tamper/noop、real snapshot、commit hash及partial-batch/full-corpus-active声明。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase119-wancher-puchico.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase119-wancher-puchico.ts scripts/apply-phase119-wancher-puchico-content.ts tests/content/phase119-wancher-puchico.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase119/wancher/wancher-puchico.svg &amp;&amp; git diff --check -- .planning/content-research/wancher-puchico-phase119.md scripts/data/phase119-wancher-puchico.ts scripts/apply-phase119-wancher-puchico-content.ts tests/content/phase119-wancher-puchico.test.ts public/images/library/site-original/phase119/wancher/wancher-puchico.svg</automated>
  </verify>
  <done>PuChiCo在owned copy首次发布并exact noop，Wancher按post-topology current hash恢复且不replay，protected/tamper/catalog/alias gates通过，唯一产品commit精确五文件。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Live Wancher collection -> current pack | collection产品卡、availability与commerce字段会变化；只将retrieved-date可定位事实写入对应scope。 |
| Collection cards -> canonical identity | 多个颜色商品卡必须归入一个PuChiCo model的variants，cases和颜色不能误建entities。 |
| 2024 review -> supplied sample | Sarah Read的容量、漏墨、写感、comfort和价格属于JetPens-supplied sample。 |
| 2025 review -> self-purchased sample | Kimberly Lau的Black Chocolate Orange/Fine、flight/burp、posting和hand-fit属于self-purchased sample。 |
| New topology -> Wancher publication | contract hash包含brand reverse links；旧reviews不能授权新增PuChiCo后的brand状态。 |
| Caller/repo alias -> local apply | repo root、DB path、owned root、reviewer/env由caller提供，错误selector可能触达真实catalog。 |
| Dirty worktree -> product commit | 已有大量unrelated dirty/untracked；宽泛staging会污染产品提交。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-119-01 | Spoofing | official collection/exact product | high | mitigate | Tasks 1/2锁定URLs、retrieval date、exact locators与11 pen-card set；exact product仅variant snapshot。 |
| T-119-02 | Tampering | canonical/variant mapping | critical | mitigate | Tasks 1-3断言一个pen、11 variants、零case variants/颜色entities；alternate identity/source owner首写前拒绝。 |
| T-119-03 | Tampering | 2024 sample generalization | high | mitigate | Tasks 1/2保存Sarah Read/JetPens disclosure并将容量、leak、nib feel、price、comfort限定为sample-only/rejected evidence。 |
| T-119-04 | Tampering | 2025 sample generalization | high | mitigate | Tasks 1/2保存Kimberly Lau/self-purchased Black Chocolate Orange/Fine disclosure并隔离flight/burp/posting/hand-fit/price/color。 |
| T-119-05 | Tampering | prerequisite entities | critical | mitigate | Tasks 1/3对Phase104/107/112/113做full digest/topology/publication protection并要求Wancher non-topology payload不变。 |
| T-119-06 | Elevation of Privilege | publication lifecycle | critical | mitigate | Task 3只对exact current hash调用review API与publishEntity；禁止direct lifecycle/public SQL与brand replay。 |
| T-119-07 | Tampering | repo/database authority | critical | mitigate | Tasks 1/3验证repo pair、caller-owned containment、inode/symlink、PRAGMA path、migration032与protected main/WAL/SHM snapshots。 |
| T-119-08 | Repudiation | source/sample provenance | medium | mitigate | Tasks 1/2保存author、posted date、acquisition、sample color/nib和source-specific locators。 |
| T-119-09 | Information Disclosure | remote credentials | high | mitigate | apply拒绝remote selectors，不读取或打印tokens；本任务不需要credentials。 |
| T-119-10 | Denial of Service | repeated prerequisite setup | medium | mitigate | Task 1单top-level setup/migration chain，faults复用owned fixture，避免重复执行Phase104/107/112/113。 |
| T-119-11 | Denial of Service | scope expansion | low | accept | 本批只改五个phase-local product files并运行targeted test/tsc/Biome/XML/diff；不扩shared surfaces。 |
| T-119-12 | Tampering | exact Git commit | high | mitigate | Task 3空index、五路径allowlist、cached diff与post-commit path proof；PLAN/SUMMARY分离，unrelated保留。 |
| T-119-SC | Tampering | package supply chain | low | accept | 本任务不安装或升级npm/pip/cargo package；若出现install需求，停止并重新规划。 |

</threat_model>

## Source Coverage Audit

| SOURCE | ID | Feature / Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 发布缺失的Wancher PuChiCo canonical pen、color variants与安全publication闭环 | 1-3 | COVERED | identity/content/media/topology/hash/noop/catalog/commit全部覆盖。 |
| REQ | QUICK-260722-ADQ | Phase119 PuChiCo partial content batch | 1-3 | COVERED | 单计划三任务。 |
| RESEARCH | R-01 | Phase107/112/113 Wancher exact-pen与post-topology pattern | 1-3 | COVERED | brand non-topology protection、current-hash review/publish、no replay。 |
| RESEARCH | R-02 | Phase117 current-hash/noop/tamper/protected-copy analog | 1,3 | COVERED | terminal fail-closed与owned checkpoint。 |
| RESEARCH | R-03 | 2026-07-22 duplicate audit：无PuChiCo identity/owner/pack | 1,3 | COVERED | execution重跑preflight，发现既有包立即停止。 |
| CONTEXT | D-01 | stable ID/slug/name；一个canonical pen | 1-3 | COVERED | exact identity。 |
| CONTEXT | D-02 | colors来自official current collection且只作variants；availability mutable | 1-3 | COVERED | 11 pen cards，3 cases excluded。 |
| CONTEXT | D-03 | official collection/exact variant + 2024/2025 independent professional scopes | 1,2 | COVERED | sources/provenance/scopes齐全。 |
| CONTEXT | D-04 | 不泛化0.5ml、flight/leak、nib feel、price、color | 1,2 | COVERED | sample-only claims + rejected spec evidence。 |
| CONTEXT | D-05 | 2k+中文与unique factual SVG | 1,2 | COVERED | length、unique hash与non-photo contract。 |
| CONTEXT | D-06 | exact Wancher made_by/reverse only | 1,3 | COVERED | 单link pair。 |
| CONTEXT | D-07 | post-topology current-hash review/publish；no direct SQL/no replay | 1,3 | COVERED | publication API path。 |
| CONTEXT | D-08 | caller-owned checkpoint，真实main/WAL/SHM不变 | 1,3 | COVERED | before/final snapshots。 |
| CONTEXT | D-09 | duplicate/source-owner/repo-pack preflight | 1,3 | COVERED | alternate或existing pack fail closed。 |
| CONTEXT | D-10 | first published、pristine noop、tamper fail closed | 1,3 | COVERED | terminal contract。 |
| CONTEXT | D-11 | protect Phase104/107/112/113 entities | 1,3 | COVERED | full digests/topology/publications。 |
| CONTEXT | D-12 | no shared runner/readiness/Playwright/search/LLM | 1-3 | COVERED | phase-local only。 |
| CONTEXT | D-13 | exact five files/commit subject，PLAN/SUMMARY separate，preserve unrelated | 3 | COVERED | explicit staging/path proof。 |
| CONTEXT | D-14 | partial batch，full corpus goal active | 2,3 | COVERED |正文与SUMMARY保持边界。 |

Deferred/excluded: separate color entities、Petite Charm Case entities、PoChaCo/Mofu、production catalog rollout、shared runner/readiness、Playwright、search、LLM、full-site acceptance与full corpus completion。Source audit无missing项。

## Pre-Mortem and Reachability Check

1. **最可能失败：collection的颜色商品卡被建成多个pen或把Charm Case算作variant。** Mitigation: exact 11-name set、one-entity invariant、case exclusion与source-owner preflight。
2. **最可能失败：两篇评测的0.5ml、flight/leak、写感或价格被写进全系spec。** Mitigation: separate author/acquisition scopes、sample-only claims、rejected spec evidence与cross-scope assertions。
3. **最可能失败：新增reverse后Wancher沿用旧approval或replay旧brand pack。** Mitigation: pre/post brand hash、non-topology digest、exact reverse delta、current-hash reviews + publishEntity、no-replay assertion。
4. **最可能失败：terminal部分损坏时runner自动补写，掩盖tamper。** Mitigation: absent/complete-terminal二态机；partial identity/source/topology/evidence/review/publication一律fail closed。
5. **最可能失败：测试或Git污染真实catalog与当前dirty work。** Mitigation: single owned checkpoint、protected sidecar snapshots、空index、五路径allowlist、cached/post-commit proof。

Reachability完整：Phase104 -> Phase107 -> Phase112 -> Phase113 owned baseline -> PuChiCo duplicate/source-owner absent preflight -> stable canonical identity + exact made_by/reverse -> Wancher post-topology current hash reviews/publish -> target-owned 11 variants + three evidence scopes + unique SVG -> target current-hash reviews/publish -> public_entities + Wancher reverse navigation。无需shared infra、package install、真实catalog write或后续rollout。

<verification>

1. `node --import tsx --test tests/content/phase119-wancher-puchico.test.ts` 在单一caller-owned setup上通过，并证明真实main/WAL/SHM snapshots不变。
2. `pnpm exec tsc --noEmit --pretty false`、三个owned TypeScript Biome检查、SVG `xmllint --noout`与五路径diff check通过。
3. 唯一public target为`phase119-wancher-puchico`/`wancher-puchico`/`Wancher PuChiCo`；11 variants exact set存在，3 cases与颜色entities不存在。
4. official current、Sarah Read 2024 supplied sample、Kimberly Lau 2025 self-purchased sample均有独立source/scope/citation；sample observations不qualify line-wide specs。
5. PuChiCo只有exact Wancher link pair；Wancher non-topology payload不变，brand与target approvals均绑定各自current hash并通过publishEntity发布。
6. Phase104/107/112/113 protected digests不变；首次apply published、pristine replay noop、duplicate/source-owner与tamper fail closed。
7. 产品commit subject精确为`feat(content): publish Wancher PuChiCo`且只含五个frontmatter paths；PLAN/SUMMARY和unrelated工作树不在其中。

</verification>

<success_criteria>

- Wancher PuChiCo以一个canonical pen和11个retrieved-date color variants公开；case、颜色与review samples不产生额外pen身份。
- 65 mm capped-before-posting、acrylic/eyedropper官方facts与两个professional sample scopes可审计，所有sample-only容量、flight/leak、nib feel、price、color与hand-fit保持边界。
- 唯一原创SVG、2k+中文、current-hash reviews/publication、exact topology、first/noop/tamper与protected catalog验证全部通过。
- Phase104/107/112/113与Wancher non-topology payload保持不变；不扩shared surfaces，不触碰真实catalog。
- 唯一产品提交精确五文件；PLAN/SUMMARY分离并明确本任务只是full corpus goal中的partial batch。

</success_criteria>

<output>
Create `.planning/quick/260722-adq-publish-the-missing-wancher-puchico-mode/SUMMARY.md` only after the exact five-file product commit. Keep PLAN/SUMMARY outside the product commit and record that the broader corpus goal remains active.
</output>
