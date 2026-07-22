---
phase: quick
plan: 260722-awm
slug: publish-the-missing-wancher-shizuku-glas
type: execute
status: ready
wave: 1
depends_on: []
autonomous: true
created_at: 2026-07-22
requirements:
  - QUICK-260722-AWM
files_modified:
  - .planning/content-research/wancher-shizuku-glass-nib-phase120.md
  - scripts/data/phase120-wancher-shizuku-glass-nib.ts
  - scripts/apply-phase120-wancher-shizuku-glass-nib-content.ts
  - tests/content/phase120-wancher-shizuku-glass-nib.test.ts
  - public/images/library/site-original/phase120/wancher/wancher-shizuku-glass-nib.svg
must_haves:
  truths:
    - "Wancher Shizuku Glass Nib Fountain Pen 以 stable ID `phase120-wancher-shizuku-glass-nib`、slug `wancher-shizuku-glass-nib`、canonical name `Wancher Shizuku Glass Nib Fountain Pen` 发布为唯一 canonical pen；collection 卡片只成为 variants，不创建 sibling pen entities。"
    - "2026-07-22 官方 collection 的 14 个去重 public product-card 名称成为 retrieved-listing variants：Black Eye、Orion Nebula、Eclipse、Solis、Blue Moon、Adrastea、Mars、Pluto、Andromeda、Gaia、Saturn、Jupiter、Earth、Venus；重复渲染、AS IS/outlet cards 不产生 variants，sold-out 只作为 mutable listing snapshot。"
    - "官方 family scope 支持 Shizuku 系列历史/设计、handmade glass nib、converter mechanism、Duralumin/anodization，以及 2025 Black Eye/Orion Nebula/Adrastea 语境；这些 family facts 不把每张卡片宣称为仍在生产或同规格。"
    - "Solis exact current scope 独占 Duralumin、screw cap、clear/black glass nib、EF/F/M、154 mm capped、128 mm uncapped、12 mm ring、约 25 g 与 international converter；不得把 Solis exact fields 泛化为所有 variants。"
    - "Susan M. Pigott 2019-08-30 Pen Addict review 独立保存为 Wancher-free-supplied Earth sample scope：Duralumin、26.5 g capped、137/120 mm、cap non-posting、grip/step、glass-nib feel/flow、八个 preorder names和价格均是 dated sample/history，不覆盖 current Solis 或 2025 variants。"
    - "Earth 可以同时出现在 current retrieved card set 与 2019 sample scope，但两条证据链、日期和语义严格分离；历史 preorder set 不能被误当作当前 variant 枚举来源。"
    - "目标 pen 只有一条 `made_by` 指向既有 Wancher brand `eOfD77nOeENN` 与一条对应 `reverse`；新增 topology 后 Wancher 只按 post-topology current hash 经 `recordEntityContentReview` 与 `publishEntity` 恢复，不 replay 旧 brand pack。"
    - "所有 migration、apply、review、publish、replay、tamper 与查询写入只发生在 caller-owned checkpoint copy；真实 `data/fpkg.db` main/WAL/SHM snapshot 全程不变。"
    - "首次 pristine apply 返回一个 published，第二次返回一个 exact noop；alternate identity/alias/source owner、partial terminal、variant/scope/media/link/review/publication/hash tamper 均 fail closed 且不自动修复。"
    - "Phase 104 Dream Pen article、Phase 107 Wancher/True Ebonite、Phase 112 Titanium Black、Phase 113 Aka Tamenuri、Phase 119 PuChiCo 的 payload、topology 与 publication 受保护；Wancher non-topology payload保持不变。"
    - "唯一产品提交精确包含五个 owned 产品文件，subject 精确为 `feat(content): publish Wancher Shizuku Glass Nib Fountain Pen`；PLAN/SUMMARY 单独处理，unrelated dirty/untracked 原样保留，本轮明确为 full corpus goal 的 partial batch。"
  artifacts:
    - path: ".planning/content-research/wancher-shizuku-glass-nib-phase120.md"
      provides: "60-160 Unicode 字符 summary 与至少 2,000 Unicode 字符的自然中文正文，清楚拆分 canonical/family/current-card/Solis-exact/2019-Earth scopes"
    - path: "scripts/data/phase120-wancher-shizuku-glass-nib.ts"
      provides: "单一 Shizuku CuratedEntityPack、stable identity、14 个去重 variants、source/scope/claim/spec/rejected-evidence/timeline/media 映射"
    - path: "scripts/apply-phase120-wancher-shizuku-glass-nib-content.ts"
      provides: "caller-owned authority、DB/alias/source-owner duplicate preflight、exact topology、Wancher current-hash recovery、target publication 与 guarded noop"
    - path: "tests/content/phase120-wancher-shizuku-glass-nib.test.ts"
      provides: "单 setup Phase 104/107/112/113/119 baseline、variant/sample/Solis scope、brand hash、authority、tamper/noop、protected catalog 与 exact commit contract 回归"
    - path: "public/images/library/site-original/phase120/wancher/wancher-shizuku-glass-nib.svg"
      provides: "Shizuku mechanism、14-card snapshot、Solis exact 与 2019 Earth exclusion 的唯一本站原创 factual SVG"
  key_links:
    - from: "scripts/data/phase120-wancher-shizuku-glass-nib.ts"
      to: "scripts/apply-phase120-wancher-shizuku-glass-nib-content.ts"
      via: "CuratedEntityPack loader、stable source marker 与 pack-owned IDs"
    - from: "scripts/apply-phase120-wancher-shizuku-glass-nib-content.ts"
      to: "src/lib/publication.ts"
      via: "topology 固定后为 Wancher 与 Shizuku 的 current hash 写 fact/language/media approvals，再调用 publishEntity"
    - from: "phase120-wancher-shizuku-glass-nib"
      to: "eOfD77nOeENN"
      via: "唯一 pen -> Wancher made_by 与 Wancher -> pen reverse pair"
    - from: "official collection cards / Solis exact / 2019 Earth review"
      to: "variants / current exact specs / historical sample evidence"
      via: "三条不可互相补字段的 citation-locator-scope chains"
---

# Quick Task 260722-awm: Publish Wancher Shizuku Glass Nib Fountain Pen

<objective>
发布缺失的 Wancher Shizuku Glass Nib Fountain Pen：一个 canonical pen 承载官方 collection 当前公开的去重 variant cards，同时把 family/current-card facts、Solis exact current specs 与 2019 Earth supplied sample 拆成不可混用的证据 scope。发布只在 caller-owned checkpoint copy 完成，新增 Wancher topology 后按 current hash 重审恢复品牌，且不改变既有 Wancher/Dream Pen/PuChiCo 页面。

Purpose: 让读者能从一页理解 Shizuku 如何把 handmade glass nib 与 converter 结合、当前官网列出哪些外观卡片、Solis 精确规格是什么，以及 2019 Earth 样品为何只能作为历史实测；避免把 sibling/sample 数据拼成虚假的全系规格。
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
@scripts/data/phase119-wancher-puchico.ts
@scripts/apply-phase119-wancher-puchico-content.ts
@tests/content/phase119-wancher-puchico.test.ts
@scripts/data/phase117-aurora-optima-family-current-pens.ts
@scripts/apply-phase117-aurora-optima-family-current-pens-content.ts
@tests/content/phase117-aurora-optima-family-current-pens.test.ts
@scripts/lib/curated-content-pack.ts
@src/lib/audit/read-only-catalog.ts
@src/lib/publication.ts

<interfaces>
- `CuratedEntityPack` 从 `markdownFile` 加载 `## summary` 与 `## body_md`；`loadCuratedEntityPack(workspaceRoot, pack)` 产生 stable source marker，pack-owned payload IDs 必须可重复计算。
- `recordEntityContentReview(client, { entityId, reviewKind, reviewer, status, notes })` 写 fact/language/media review；`publishEntity(client, { entityId, reviewer })` 生成 publication review并安装 contract-v3 snapshot。禁止 direct lifecycle/review/publication/public SQL。
- Wancher brand固定为 `eOfD77nOeENN`；Phase 104 Dream Pen article固定为 `2aoD07lwSYCV`；Phase 107 pen固定为 `phase107-wancher-true-ebonite-matte-black`；Phase 112 pen固定为 `phase112-wancher-dream-pen-titanium-black`；Phase 113 pen固定为 `phase113-wancher-dream-pen-true-urushi-aka-tamenuri`；Phase 119 pen固定为 `phase119-wancher-puchico`。
- Phase 120 target固定 ID `phase120-wancher-shizuku-glass-nib`、slug `wancher-shizuku-glass-nib`、name `Wancher Shizuku Glass Nib Fountain Pen`。任何 card name、Earth sample 或 Solis 都不能成为第二 pen entity。
- 2026-07-22 repo查重未发现 Shizuku pack/identity。执行时仍须在首写前盘点 entities、aliases、references/source owners、source markers、repo content-pack files 与相同 canonical/normalized names；若发现 alternate identity、alias、source owner或同 URL 的非 target pen owner，停止并报告，禁止 merge/redirect/retire/猜 survivor。
- 官方 family source锁定 `https://www.wancherpen.com/collections/shizuku-pen/keiryu`；若请求重定向/规范化到 `https://www.wancherpen.com/collections/shizuku-pen`，保留 requested URL、resolved canonical URL 与 retrieved `2026-07-22`，source-owner preflight覆盖两者。它支持 Shizuku name/design、handmade glass nib、converter mechanism、Duralumin/anodization、2025 Black Eye/Orion Nebula/Adrastea context 与当日 collection cards。
- collection去重后的 14 cards 精确是 Black Eye、Orion Nebula、Eclipse、Solis、Blue Moon、Adrastea、Mars、Pluto、Andromeda、Gaia、Saturn、Jupiter、Earth、Venus。页面模板的 image/title双重渲染不重复计数；AS IS/outlet duplicates不计入；sold-out只记录 `retrieved=2026-07-22` 的 mutable availability，不能推断 discontinued/current production。
- 官方 exact current source锁定 `https://www.wancherpen.com/products/shizuku-pen-solis`，只支持 Solis：Duralumin、screw cap、glass nib clear/black、EF/F/M、154 mm capped、128 mm uncapped、12 mm ring、approx. 25 g、international converter。商品页 sold-out/price 是 mutable commerce state，不进入 stable model spec。
- 日本官方 collection/product仅可用于同一字段的 corroboration，必须归入同一 `wancher-official` independence group，不能伪造第二个独立来源，也不能借 JP sibling 补 Solis/全系未支持字段。
- 独立专业来源锁定 `https://www.penaddict.com/blog/2019/8/30/wancher-shizuku-glass-nib-fountain-pen-a-review`；Susan M. Pigott，posted `2019-08-30`，Wancher免费提供 Earth review sample。Duralumin、26.5 g capped/18 g uncapped、137/120 mm、non-posting、10 mm grip、step/seam、glass-nib feel/flow/no-skip与当时preorder options/price只属于该 dated sample/history scope。
- 2019 preorder names为 Blue Moon、Saturn、Earth、Mars、Venus、Pluto、Eclipse、Jupiter；它们可与 current retrieved card names重叠，但不能作为 current card枚举的来源。Earth current card与Earth reviewed sample共享显示名，不共享scope、尺寸、重量、availability或体验结论。
- repo authority只接受 `/Users/xz/CodeBuddy/fountain-pen-graph` 与 `/Users/xz/Documents/fountain-pen-graph` 输入，且两者 `realpath` 和 `git rev-parse --show-toplevel` 都落到 `/Users/xz/Documents/fountain-pen-graph`。DB authority另验证 caller-owned containment、no symlink/hard-link、protected main/WAL/SHM snapshot、PRAGMA client/path 与 migration 032。

<decisions>
- D-01：只建一个 locked canonical Shizuku pen；所有 product cards 与 Earth sample 均不是 sibling entities。
- D-02：14 个 current public listing cards去重成为 variants；重复模板/AS IS排除，sold-out仅为 retrieval snapshot。
- D-03：official family/current-card、Solis exact current、2019 Earth sample/history分别建 scope与完整 citation chain。
- D-04：Solis precise fields只属于 Solis exact scope，不泛化全系；price/stock/sold-out不进入 stable spec。
- D-05：2019 Earth尺寸、重量、结构、写感/流量与preorder set只属于 supplied sample/history，不覆盖current。
- D-06：官方国际站与可选日本站属于同一 independence group；Pen Addict是独立 professional secondary。
- D-07：写 2k+自然中文、60-160 summary与唯一 factual SVG；正文和图必须显式教读者区分 scopes。
- D-08：只新增一对 Shizuku-Wancher made_by/reverse；Wancher在post-topology current hash重审发布，不 replay brand pack。
- D-09：保护 Phase104/107/112/113/119 全量payload/topology/publication及Wancher non-topology payload。
- D-10：所有执行与测试写入仅在caller-owned checkpoint copy，真实main/WAL/SHM不变。
- D-11：首写前做DB/alias/source owner/repo marker duplicate preflight；不安全状态fail closed。
- D-12：first publish、exact noop与tamper/partial fail-closed均由单setup targeted regression证明。
- D-13：产品commit精确五文件与精确subject；PLAN/SUMMARY独立，保留unrelated worktree。
- D-14：不扩shared runner/readiness/Playwright/search/LLM/schema/package；本轮是full corpus goal中的partial batch。
</decisions>
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 先锁定单一 identity、14-card variant、三 scope 与 current-hash 契约</name>
  <files>tests/content/phase120-wancher-shizuku-glass-nib.test.ts</files>
  <behavior>
    - Test 1: 一个 top-level test 只建立一次 caller-owned checkpoint copy，迁移到 032 后依次 apply Phase 104、107、112、113、119 prerequisites；保存五个 protected entities与Wancher baseline digest/hash/reverse set，确认Shizuku identity/alias/source owner/repo marker为零，再执行首次Phase120 apply得到唯一published。
    - Test 2: target ID/slug/name精确，summary 60-160 Unicode、body至少2,000 Unicode，只有一个Shizuku canonical pen；Solis/Earth/14 card names均无独立entity。
    - Test 3: variants精确等于14个去重official collection cards；每个variant连接official retrieved-listing source，重复render与AS IS不计，sold-out/availability标为mutable而非production status。
    - Test 4: official family scope保存handmade glass nib、converter mechanism、Duralumin/anodization与2025 Black Eye/Orion Nebula/Adrastea context；不得把这些营销/系列事实自动变成每一variant exact specs。
    - Test 5: Solis exact current scope精确保存Duralumin、screw cap、clear/black glass nib、EF/F/M、154/128 mm、12 mm、approx.25 g、international converter；stable values不含current price/stock/sold-out，也不声称14 variants共享这些数值。
    - Test 6: Earth historical sample scope保存Susan M. Pigott、2019-08-30、Wancher supplied free、Earth identity、26.5/18 g、137/120 mm、non-posting、10 mm grip、seam/step、nib feel/flow与八个preorder names；这些字段以sample/history claims或qualifies=false evidence存在。
    - Test 7: Earth在14-card set中恰有一个variant，同时2019 Earth scope独立存在；current card citation来自official collection，sample citation来自Pen Addict，不能互补缺失字段。
    - Test 8: Shizuku只有一对`made_by`/`reverse`连接`eOfD77nOeENN`；Wancher reverse set只新增Shizuku，non-topology digest不变，brand hash精确变化且reviews/publication绑定post-topology current hash。
    - Test 9: Phase104 article、Phase107 True Ebonite、Phase112 Titanium Black、Phase113 Aka Tamenuri、Phase119 PuChiCo的full digests与publications前后相等；任何旧Wancher brand/pen pack均未replay。
    - Test 10: alternate ID/slug/name/alias、requested/resolved collection URL或exact/review URL的非target owner、source marker collision、额外maker、partial terminal、variant/scope/source/media/review/hash/publication tamper全部fail closed且失败前后owned digest相等。
    - Test 11: remote env、空reviewer、第三repo root、owned-root外路径、protected main/sidecar、symlink/hard-link、client/path mismatch与未迁移copy全部拒绝；pristine replay exact noop，finally证明真实main/WAL/SHM snapshot不变。
  </behavior>
  <action>
按 D-01 至 D-14 先写失败 integration regression。复用 Phase119 的单实体variant/sample隔离、single setup、authority、duplicate/source-owner、protected digest与noop/tamper结构，并从 Phase117复用“topology变化后以current hash重审品牌”的断言；不得复制出第二套shared harness。

preflight测试必须同时覆盖SQLite inventory与repo inventory：locked ID/slug/name、normalized Shizuku aliases、14 card names、requested/resolved collection URLs、Solis URL、Pen Addict URL、source marker及`scripts/data`/apply/test/research/media中的既有Shizuku pack。首次状态只接受全部absent；terminal只接受locked target + exact marker/owners。任何其它owner在首个write transaction前拒绝，不能把旧generic Dream Pen、Solis、Earth或collection card当donor/survivor。

用scope/citation/spec-evidence结构断言阻止泛化，不以正文negative keyword count替代wiring。Solis值逐字段绑定exact official scope；2019样品值逐字段绑定Earth scope并qualifies=false用于current spec。Earth显示名重叠由scope/source/date消歧，而不是删掉current variant或把sample提升成variant来源。

SVG检查要求1600x900、site-original/factual/non-photo/non-logo/not-to-scale/not-colour-proof/not-finish-proof声明，SHA-256不同于Phase107/112/113/119四张Wancher SVG；测试不联网、不读取外部图片。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase120-wancher-shizuku-glass-nib.test.ts</automated>
  </verify>
  <done>失败测试完整锁定单一canonical pen、14去重variants、family/Solis/Earth三scope、exact topology/current-hash、first publish/noop/tamper、Phase104/107/112/113/119保护与真实catalog不变。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: 编写 Shizuku evidence pack、2k+中文与唯一 factual SVG</name>
  <files>.planning/content-research/wancher-shizuku-glass-nib-phase120.md, scripts/data/phase120-wancher-shizuku-glass-nib.ts, public/images/library/site-original/phase120/wancher/wancher-shizuku-glass-nib.svg</files>
  <behavior>
    - Test 1: Markdown summary 60-160 Unicode、body至少2,000 Unicode；自然区分一个canonical model、retrieved public cards、Solis exact current与2019 Earth supplied sample。
    - Test 2: pack只定义一个pen并导出locked constants/URLs/scopes/14-name set；variant set从official collection去重，availability mutable，AS IS/repeated cards excluded。
    - Test 3: family scope、Solis exact scope与Earth history scope各自有完整source/citation/evidence；JP official（若用）不增加independence count。
    - Test 4: Solis exact specs逐字段qualify；Earth 26.5/18g、137/120mm、non-posting、feel/flow、preorder/price等只作sample/history claims或rejected current evidence。
    - Test 5: SVG以全新构图表达glass-nib-to-converter机制、14-card listing、Solis exact box与2019 Earth exclusion；不复刻Wancher logo、外站图片或既有Wancher SVG。
  </behavior>
  <action>
按 D-01 至 D-07 创建Markdown、data与SVG。正文从“同一个Earth名字可以同时出现在今天的listing和2019样品里，但事实不能穿越时间线”切入，依次解释Shizuku命名与glass nib/converter设计、Duralumin/anodization、14个去重public cards、2025三款语境、Solis exact规格、Susan M. Pigott Earth实测、八个preorder历史名单、current/history阅读方法与证据限制。保持自然中文，不写数据库/runner操作说明，不宣称全系/全品牌/全corpus完成。

data导出`PHASE120_WANCHER_ID`、Phase104/107/112/113/119 protected IDs、`PHASE120_SHIZUKU_ID`、`PHASE120_SHIZUKU_SLUG`、三个locked URLs、resolved canonical collection URL、三个scope keys与14-name exact set。official family与Solis sources归`wancher-official`同一independence group；Pen Addict为`professional_secondary`且明确author/date/free-sample disclosure；SVG为editorial primary media。所有live URLs诚实记录`live-source-not-frozen`、retrieved date与locator。

variants只依据retrieved official collection：Black Eye、Orion Nebula、Eclipse、Solis、Blue Moon、Adrastea、Mars、Pluto、Andromeda、Gaia、Saturn、Jupiter、Earth、Venus。每项notes写明public-card snapshot与availability mutable；sold-out不等于retired/discontinued。页面重复的image/title card用name去重；AS IS/outlet不建variant。2019八个preorder names放history scope/timeline/claim，不作为第二套variants。

spec的line-level稳定字段只保留family可以安全支持的handmade glass nib + converter机制；Solis exact字段用scope-aware object/claim与evidence清楚标注“仅Solis”，不可让`model_specs`读成14款共同尺寸。若现有schema只能保存一组values，数值字段写成“Solis exact listing: ...; not asserted line-wide”，并为每项绑定Solis scope。Earth差异全部作为sample-only claim与`qualifies:false` evidence，不以“冲突解决”为由选择一个数值覆盖另一个。

SVG为本站原创信息图：左侧glass nib→converter工作概念，中部14-card名称矩阵并标出availability snapshot，右侧上下分成Solis exact与2019 Earth sample。标注non-photo/non-logo/not-to-scale/not-colour-proof/not-finish-proof；颜色只用于版式分区，不证明阳极氧化实物颜色。不得复制网页图片、logo、商品轮廓或旧SVG路径。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase120-wancher-shizuku-glass-nib.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase120/wancher/wancher-shizuku-glass-nib.svg</automated>
  </verify>
  <done>checked-in copy、pack与SVG完整表达一个canonical Shizuku、14-card snapshot、Solis exact与2019 Earth sample边界；2k+中文、source independence、rejected evidence与unique media断言通过。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现caller-owned apply，按current hash发布并提交精确五文件</name>
  <files>scripts/apply-phase120-wancher-shizuku-glass-nib-content.ts</files>
  <behavior>
    - Test 1: repo/root/reviewer/env/path/inode/migration032及Phase104/107/112/113/119 baseline在首写前通过，真实catalog snapshot不变。
    - Test 2: first状态严格要求target、aliases、source owners、marker与repo pack absent；一个identity/topology transaction只创建target与一对made_by/reverse。
    - Test 3: Wancher non-topology digest不变、reverse set精确add-one、hash变化；brand只在post-topology current hash经review APIs + publishEntity恢复。
    - Test 4: target pack安装后source/scope/variant/spec/media/reviews/readiness/public membership完整；只有完整terminal才noop，任何partial/tamper不自动repair。
    - Test 5:产品commit path set精确等于frontmatter五文件且subject精确；PLAN/SUMMARY与unrelated worktree不进入commit。
  </behavior>
  <action>
按 D-08 至 D-14 创建phase-local apply，以Phase119为直接Wancher single-pen analog、Phase117为post-topology current-hash analog；只调用既有curated pack/publication/read-only catalog APIs，不修改shared publication、curated-content、readiness、migration/schema、runner、Playwright、search或LLM。

首写前依次验证：CodeBuddy/Documents repo pair与clean authority input；reviewer非空且无remote DB env；database真实位于caller-owned root且不是protected main/WAL/SHM、symlink、hard-link或client/path mismatch；migration=032；Phase104/107/112/113/119 exact terminal；target ID/slug/name/aliases absent；requested/resolved collection、Solis与Pen Addict source owner absent；target marker/repo pack无alternate。任一失败都必须在首个write transaction前抛错并保持owned digest不变。

在一个identity/topology transaction创建唯一pen与精确一对made_by/reverse。捕获Wancher pre-hash、non-topology digest与reverse set，提交后验证only-add-target delta与brand hash变化；随后只为post-topology current hash调用`recordEntityContentReview`的fact/language/media与`publishEntity`。不得调用Phase107/112/113/119 brand pack loader进行恢复，不得direct SQL写brand/target reviews、lifecycle、entity_publications或public_entities。

安装Phase120 pack后为target当前hash写fact/language/media approvals并调用`publishEntity`。terminal断言覆盖identity、exact source owners、三个scopes、14 variants、Solis exact/rejected Earth evidence、unique primary media、made_by/reverse、current-hash四reviews、readiness与public membership，以及全部protected digests；只有每项完整才返回noop。partial/tampered状态必须拒绝并不修复。

完成后运行targeted test、TypeScript、owned TS Biome、SVG XML与五路径diff check。Git处理前要求index为空，并记录unrelated dirty/untracked path/status snapshot；仅显式stage frontmatter五路径。若`scripts/data/` exact file被既有unanchored ignore命中，只对该文件使用`git add -f`。比较cached path set、`git diff --cached --check`与no-deletion；异常时只unstage本包五路径并停止。禁止wide/glob add、stash、clean、reset、checkout、force或改动/删除任何unrelated内容，尤其当前`.planning/content-research/research-*`、`.next-phase*`与其它quick目录。

提交subject精确为`feat(content): publish Wancher Shizuku Glass Nib Fountain Pen`，再用`git show --name-only --format=`证明产品commit恰含五个frontmatter paths。PLAN与SUMMARY不进产品commit；产品commit后才按execute workflow创建本quick目录`260722-awm-SUMMARY.md`，记录identity、14 variants、sources/dates/scopes、Solis/Earth exclusions、Wancher pre/post hash/no replay、single setup、tamper/noop、protected snapshots、验证命令、commit hash及partial-batch声明。不要提交SUMMARY，也不要更新STATE/ROADMAP或扩大到production rollout。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase120-wancher-shizuku-glass-nib.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase120-wancher-shizuku-glass-nib.ts scripts/apply-phase120-wancher-shizuku-glass-nib-content.ts tests/content/phase120-wancher-shizuku-glass-nib.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase120/wancher/wancher-shizuku-glass-nib.svg &amp;&amp; git diff --check -- .planning/content-research/wancher-shizuku-glass-nib-phase120.md scripts/data/phase120-wancher-shizuku-glass-nib.ts scripts/apply-phase120-wancher-shizuku-glass-nib-content.ts tests/content/phase120-wancher-shizuku-glass-nib.test.ts public/images/library/site-original/phase120/wancher/wancher-shizuku-glass-nib.svg</automated>
  </verify>
  <done>single owned checkpoint上first publish、exact noop、tamper fail-closed、Wancher current-hash恢复与protected catalog全部通过；唯一产品commit精确五文件且full corpus goal保持active。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Collection card -> canonical model | 14个cards是一个pen的variants；模板重复、AS IS与卡片名不得变成第二实体。 |
| Current listing -> production status | retrieved public card与sold-out是快照，不证明持续生产或永久退市。 |
| Family -> Solis exact | family机制/材质语境与Solis数值规格必须分开；Solis exact不能泛化到siblings。 |
| Current Earth card -> 2019 Earth sample | 同名但来源、日期、尺寸、重量、availability与体验不同，必须用scope隔离。 |
| Official international -> JP official | 同属Wancher independence group；corroboration不能增加独立来源数。 |
| New maker topology -> Wancher publication | reverse link改变brand contract hash；旧reviews不可复用，旧brand pack不可replay。 |
| Caller/repo alias -> catalog | repo alias、DB path、reviewer/env和owned root来自caller；错误authority可能污染真实catalog。 |
| Dirty worktree -> product commit | 已有unrelated research/next-phase/quick artifacts；宽泛staging会把用户内容带入产品commit。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-120-01 | Spoofing | Shizuku identity/aliases | high | mitigate | Task1/3首写前对ID/slug/name/aliases/repo marker做exact inventory；只接受全absent或完整terminal。 |
| T-120-02 | Tampering | source ownership | critical | mitigate | Task1/3盘点requested/resolved collection、Solis与Pen Addict URLs及markers；任何非target owner首写前fail closed。 |
| T-120-03 | Tampering | variant enumeration | high | mitigate | Task1/2断言14-name exact set、按name去重、AS IS排除；availability只作retrieval metadata。 |
| T-120-04 | Tampering | scope/spec qualification | critical | mitigate | Task1/2用family/Solis/Earth独立scope与qualifies=false sample evidence，禁止cross-scope field stitching。 |
| T-120-05 | Repudiation | reviews/publication | high | mitigate | Task3记录reviewer/current hash并只经review APIs + publishEntity发布brand/target；SUMMARY记录hash、命令与commit。 |
| T-120-06 | Information Disclosure | dirty/untracked worktree | medium | mitigate | Task3只stage五个owned paths并比较cached set；不读取、提交、移动或清理unrelated内容。 |
| T-120-07 | Denial of Service | terminal replay/tamper | medium | mitigate | Task1/3要求target与brand完整terminal才noop；partial/tampered状态不自动repair/review。 |
| T-120-08 | Elevation of Privilege | repo/database authority | critical | mitigate | Task1/3验证repo pair、caller-owned containment、realpath/inode、PRAGMA path、migration032与protected main/WAL/SHM snapshots。 |
| T-120-09 | Tampering | Wancher post-topology publication | critical | mitigate | Task1/3验证non-topology digest与exact add-one delta，再在post-topology hash重审publish；禁止brand replay/direct lifecycle SQL。 |
| T-120-10 | Tampering | product commit | high | mitigate | Task3要求空index、精确stage五路径、cached diff/no-deletion审计与post-commit path proof；异常只unstage owned paths并停止。 |
| T-120-SC | Tampering | package supply chain | low | accept | 本计划无package install或dependency变更；现有lockfile和工具链保持不变。 |

</threat_model>

<source_audit>

| SOURCE | ID | Feature/Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 一个canonical Shizuku、当前官方variants、Solis exact、2019 Earth隔离、安全current-hash发布 | 1-3 | COVERED | identity/content/media/topology/review/publish/noop/catalog/commit全覆盖。 |
| REQ | QUICK-260722-AWM | Publish missing Wancher Shizuku Glass Nib Fountain Pen | 1-3 | COVERED | frontmatter requirement映射到全部tasks。 |
| RESEARCH | R-01 | official family history/design、handmade glass nib、converter、Duralumin/anodization | 1-2 | COVERED | family scope。 |
| RESEARCH | R-02 | 2025 Black Eye/Orion Nebula/Adrastea context | 1-2 | COVERED | dated family/current-card context，不冒充全系发布年。 |
| RESEARCH | R-03 | collection 14 public cards、template去重、AS IS排除、sold-out mutable | 1-3 | COVERED | exact variant set与retrieval metadata。 |
| RESEARCH | R-04 | Solis exact Duralumin/screw/clear-black/EF-F-M/154-128/12mm/~25g/international converter | 1-3 | COVERED | exact current scope only。 |
| RESEARCH | R-05 | Susan M. Pigott 2019 Earth supplied sample与dated observations | 1-3 | COVERED | historical sample scope + rejected current evidence。 |
| RESEARCH | R-06 | Phase107/112/113/119 Wancher analog与Phase117 current-hash analog | 1,3 | COVERED | implementation/protection patterns。 |
| CONTEXT | D-01 | one canonical pen | 1-3 | COVERED | locked identity。 |
| CONTEXT | D-02 | exact 14 retrieved variants + exclusions | 1-3 | COVERED | exact set。 |
| CONTEXT | D-03 | three evidence scopes | 1-3 | COVERED | citation chains。 |
| CONTEXT | D-04 | Solis exact only | 1-3 | COVERED | no sibling generalization。 |
| CONTEXT | D-05 | 2019 Earth sample/history only | 1-3 | COVERED | sample facts rejected as current。 |
| CONTEXT | D-06 | source independence grouping | 1-2 | COVERED | JP official same group。 |
| CONTEXT | D-07 | 2k+ Chinese + unique SVG | 1-2 | COVERED | copy/media contract。 |
| CONTEXT | D-08 | exact Wancher topology/current-hash | 1,3 | COVERED | one pair + current review APIs。 |
| CONTEXT | D-09 | protect Phase104/107/112/113/119 | 1,3 | COVERED | full digests。 |
| CONTEXT | D-10 | caller-owned checkpoint only | 1,3 | COVERED | authority/snapshot gates。 |
| CONTEXT | D-11 | DB/alias/source-owner/repo duplicate preflight | 1,3 | COVERED | pre-write fail closed。 |
| CONTEXT | D-12 | first/noop/tamper regression | 1,3 | COVERED | single setup。 |
| CONTEXT | D-13 | exact commit + worktree preservation | 3 | COVERED | five-path allowlist。 |
| CONTEXT | D-14 | no shared expansion + partial batch | 1-3 | COVERED | scope fence。 |

Deferred/excluded: 为每个Shizuku card创建独立pen实体、从AS IS/outlet生成variants、推断sold-out等于discontinued、把Solis数值泛化全系、把2019 preorder set当current列表、生产catalog写入/部署、full-site验收、shared publication/readiness/search/LLM/Playwright/schema/package改造，以及unrelated research/quick/next-phase工作均不属于本partial batch。Source audit无缺项。

</source_audit>

<pre_mortem>

1. **最可能失败：collection模板把同一卡片的image/title重复渲染算成多个variant，或把AS IS卡片带入。** Mitigation: Task1/2以14-name exact set和official collection source path双重断言，name去重并显式排除outlet。
2. **最可能失败：Solis 154/128 mm、25 g覆盖2019 Earth 137/120 mm、26.5 g，或反向把Earth写成当前全系规格。** Mitigation: 三scope、逐字段citation与qualifies=false sample evidence；测试同时断言两组值存在但不共享qualification。
3. **最可能失败：Earth同时出现在当前card与2019 review，执行器误删一个或把review当current variant来源。** Mitigation: variant citation锁official collection，sample claim锁Pen Addict，按source/date/scope而非display name区分。
4. **最可能失败：新增reverse后Wancher hash变化，却复用Phase119 review或replay旧brand pack。** Mitigation: brand pre/post hash、non-topology digest、exact add-one reverse delta、current-hash review APIs + publishEntity、no-replay assertion。
5. **最可能失败：测试或提交污染真实catalog及unrelated research/quick work。** Mitigation: verified repo pair、single caller-owned checkpoint、protected sidecar snapshots、空index、显式五路径allowlist与post-commit proof。

Reachability is complete: real migration-032 catalog -> caller-owned checkpoint copy -> Phase104/107/112/113/119 terminal prerequisites -> Shizuku DB/alias/source-owner/repo preflight -> one canonical pen + exact maker pair -> three scoped evidence chains + 14 variants + unique media -> Wancher post-topology current-hash reviews/publication -> target current-hash reviews/publication -> `/pen/wancher-shizuku-glass-nib` public route and Wancher reverse navigation. No artifact depends on shared-infra changes, a second Shizuku entity, package install, production catalog write or later rollout.

</pre_mortem>

<verification>

1. `node --import tsx --test tests/content/phase120-wancher-shizuku-glass-nib.test.ts` passes on one caller-owned checkpoint setup and proves protected main/WAL/SHM equality。
2. `phase120-wancher-shizuku-glass-nib` is the only Shizuku pen identity and is public at `/pen/wancher-shizuku-glass-nib`; Solis、Earth与其它cards不是entities。
3. Exactly 14 official retrieved-listing variants exist after name dedupe；重复render/AS IS排除，sold-out只作为mutable snapshot。
4. Family/current-card、Solis exact current与2019 Earth supplied sample/history scopes结构分离；Solis和Earth两组尺寸/重量/体验没有cross-qualification。
5. Exactly one made_by/reverse pair connects Shizuku and Wancher；brand non-topology payload byte-identical，reviews/publication bind exact post-topology current hash。
6. First apply publishes one target；pristine replay returns one noop；identity/alias/source-owner/variant/scope/media/link/review/publication/hash与authority tamper均fail closed。
7. Phase104/107/112/113/119 protected digests与publications不变；`tsc`、owned-file Biome、SVG XML和five-path diff checks通过。
8. Product commit subject exactly `feat(content): publish Wancher Shizuku Glass Nib Fountain Pen`；path set equals frontmatter five files，PLAN/SUMMARY/unrelated dirty/untracked保持在commit外。

</verification>

<success_criteria>

- Wancher Shizuku Glass Nib Fountain Pen以一个canonical public page呈现，14个official public cards作为variants可审计且无重复/AS IS污染。
- Solis exact current与2019 Earth supplied sample/history事实保持完整、可读、不可互相覆盖；官方与独立来源边界诚实。
- only one maker pair连接Wancher；brand在新增topology后的current hash重审恢复，Phase104/107/112/113/119保持不变。
- caller-owned safety、duplicate/source-owner preflight、single setup、first/noop/tamper、TypeScript/Biome/XML/diff与repo alias gates全部通过。
- 唯一产品提交精确五文件；PLAN/SUMMARY独立且本轮如实声明为full corpus goal中的partial batch。

</success_criteria>

<output>
Create `.planning/quick/260722-awm-publish-the-missing-wancher-shizuku-glas/260722-awm-SUMMARY.md` only after the product commit; keep PLAN/SUMMARY/docs outside that product commit and do not commit the summary in this execution.
</output>
