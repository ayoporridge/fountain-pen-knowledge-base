---
phase: quick
plan: 260721-ifj
slug: phase-111-pilot-elabo-metal-fe-25sr-elabo-resin-fe-18sr-custom-ns-lightive
type: execute
status: ready
wave: 1
depends_on: []
autonomous: true
created_at: 2026-07-21
requirements:
  - QUICK-260721-IFJ
files_modified:
  - scripts/data/phase111-pilot-elabo-metal-resin-custom-ns-lightive.ts
  - scripts/apply-phase111-pilot-elabo-metal-resin-custom-ns-lightive-content.ts
  - tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts
  - public/images/library/site-original/phase111/pilot/pilot-elabo-metal-fe-25sr.svg
  - public/images/library/site-original/phase111/pilot/pilot-elabo-resin-fe-18sr.svg
  - public/images/library/site-original/phase111/pilot/pilot-custom-ns.svg
  - public/images/library/site-original/phase111/pilot/pilot-lightive.svg
must_haves:
  truths:
    - "Pilot Elabo 金属轴 FE-25SR、Elabo 树脂轴 FE-18SR、Custom NS FKNS-1 与 Lightive P-FLT-1 分别以四个稳定 ID 和四个唯一 canonical slug 公开；四者是 sibling pages，不因 Elabo/Falcon family 叙述或旧 synthetic taxonomy 自动合并。"
    - "首写前 exact identity preflight 覆盖 entity name/slug、aliases、market SKU、reference/source-item URL，以及 legacy synthetic `pilot-elabo`/generic Elabo/Falcon ambiguity；任何另一实体命中都 fail closed，不选择 metal 或 resin 作为猜测 survivor。"
    - "FE-25SR current facts 只来自 metal catalog/warranty scope，FE-18SR current facts 只来自 resin catalog/warranty scope；两页可解释 Elabo/Falcon 地区名关系，但不得互抄材质、重量、converter、颜色或把 Custom FA nib 当成成品 Falcon。"
    - "Custom NS current facts 精确绑定 FKNS-1 与执行日 Pilot catalog；Pencilcase 2020 review 只描述当时送测样本/旧 lineup，不覆盖 current refresh、官方规格或颜色。"
    - "Lightive current facts 精确绑定 P-FLT-1 与执行日 Pilot catalog；kamitopen 的 2021 sample、2025/2026 update、独立干燥测试和旧颜色均按日期/scope 归因，不被写成 Pilot 的通用保证。"
    - "四页各有不少于 2,000 Unicode 字符的自然中文正文、完整 CuratedEntityPack、qualified official + independent evidence、完整 current spec evidence，以及四张构图和事实重点均不相同的 approved primary SVG。"
    - "四页各有且仅有一条 made_by 指向 Pilot Zt-PbXkE7UHM；四条 canonical topology 使 Pilot brand contract hash 按 Phase 110 模式改变后，Phase 84 非 topology payload/source marker 保持不变，品牌在新的 post-topology current hash 上完成 fact/language/media review 并经 publishEntity 恢复公开。"
    - "所有 fixture、preflight、migration、apply、review、publish、tamper 与 replay 只在 caller-owned checkpoint copy；真实 data/fpkg.db main/WAL/SHM、shared infrastructure、非目标 Pilot pages 和所有无关 dirty/untracked 内容不变。"
    - "第二次执行四目标均为精确 noop；缺失/篡改任一 made_by、identity、SKU、source marker、review 或 publication guard 时 fail closed；唯一产品提交精确只含本计划七个 owned files，PLAN/SUMMARY 等 docs 后续另行处理。"
  artifacts:
    - path: "scripts/data/phase111-pilot-elabo-metal-resin-custom-ns-lightive.ts"
      provides: "四个稳定 canonical identities、2k+ reviewed copy、四个 CuratedEntityPacks、exact ambiguity markers 与 source/scope/claim/spec/variant/media contracts"
    - path: "scripts/apply-phase111-pilot-elabo-metal-resin-custom-ns-lightive-content.ts"
      provides: "caller-owned authority、exact duplicate/legacy ambiguity preflight、identity/topology transaction、Pilot brand post-topology review/publish、四页 publication 与 terminal noop"
    - path: "tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts"
      provides: "Phase 84 brand-first baseline、四型号 identity/source boundaries、legacy pilot-elabo collision、brand hash/tamper、review guard、noop 与 protected-catalog regression"
    - path: "public/images/library/site-original/phase111/pilot/pilot-elabo-metal-fe-25sr.svg"
      provides: "FE-25SR metal/brass body、33g、CON-70N 与 soft-nib safety boundary 的专属事实图"
    - path: "public/images/library/site-original/phase111/pilot/pilot-elabo-resin-fe-18sr.svg"
      provides: "FE-18SR resin body、轻量/CON-40 与 metal sibling 分界的专属事实图"
    - path: "public/images/library/site-original/phase111/pilot/pilot-custom-ns.svg"
      provides: "FKNS-1 special-alloy steel nib、current converter/lineup 与 2020 sample 分界图"
    - path: "public/images/library/site-original/phase111/pilot/pilot-lightive.svg"
      provides: "P-FLT-1 current cap/body/converter、current colors 与 2021 sample 分界图"
  key_links:
    - from: "tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts"
      to: "scripts/data/phase84-platinum-pilot-p0-v3.ts"
      via: "在 Phase 111 before-snapshot 前安装完整 Pilot brand pack + 一个既有 Pilot pen pack，建立 published/readiness contract-v3 baseline"
      pattern: "phase84PlatinumPilotP0V3BrandPacks"
    - from: "scripts/apply-phase111-pilot-elabo-metal-resin-custom-ns-lightive-content.ts"
      to: "entities/entity_aliases/model_variants/entity references/source items"
      via: "首写前 exact name/slug/SKU/normalized source URL inventory，generic pilot-elabo/Falcon 只产生 ambiguity failure，绝不自动 merge sibling SKUs"
      pattern: "assertIdentityPreflight"
    - from: "four new Pilot pens"
      to: "Pilot brand Zt-PbXkE7UHM"
      via: "每页唯一 made_by；精确四 links 改变包含 topology 的 Pilot contract hash，随后对新 current hash review 并 publishEntity"
      pattern: "computePublicationContentHash|recordEntityContentReview|publishEntity"
    - from: "four CuratedEntityPacks"
      to: "public_entities"
      via: "loadCuratedEntityPack 后逐页 current-hash fact/language/media approvals，再由 publishEntity 安装 publication review/snapshot"
      pattern: "loadCuratedEntityPack|recordEntityContentReview|publishEntity"
---

<objective>
新增 Pilot Elabo metal FE-25SR、Elabo resin FE-18SR、Custom NS FKNS-1 与 Lightive P-FLT-1 四个来源充分、身份互不吞并的 current canonical pages，并安全恢复四条新 `made_by` 使 Pilot brand publication 失效后的新 topology contract。

Purpose: 补齐 Pilot current catalog 的下一批四个缺页，同时消除 generic `pilot-elabo` synthetic taxonomy 对 metal/resin sibling identity 的误导，防止 current/sample、旧/新 lineup、converter 与 soft/flex 叙述串线。
Output: 四个 2k+ 中文 CuratedEntityPacks、四张独立 factual SVG、一个 caller-owned apply 入口、一份定向集成测试，以及精确七文件产品提交；这是 Phase 111 局部批次，不代表 Pilot、Phase 23 或全库完成。
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
@.planning/phases/21-taxonomy/21-IDENTITY-RESEARCH.md
@data/taxonomy/v1.2-phase21.json
@tests/taxonomy/taxonomy-canonical.test.ts
@.planning/quick/260721-hoh-phase-110-pilot-canonical-justus-95-silv/PLAN.md
@.planning/quick/260721-hoh-phase-110-pilot-canonical-justus-95-silv/SUMMARY.md
@scripts/data/phase110-pilot-justus-95-silvern-grance.ts
@scripts/apply-phase110-pilot-justus-95-silvern-grance-content.ts
@tests/content/phase110-pilot-justus-95-silvern-grance.test.ts
@scripts/data/phase84-platinum-pilot-p0-v3.ts
@scripts/lib/curated-content-pack.ts
@src/lib/publication.ts

Locked decisions:
- D-01: repo authority 明确允许且只允许已核验的路径对：用户指定 alias `/Users/xz/CodeBuddy/fountain-pen-graph` 与其 canonical git root `/Users/xz/Documents/fountain-pen-graph`。命令可从 alias 进入，`realpath`/git root/init 解析为该 canonical root 属于合法同一仓库，不得因此阻塞；解析到这两个路径之外的任何 workspace/root 才首写前停止。此 repo-path 例外不适用于数据库：protected `data/fpkg.db` 的 canonical realpath/inode 与 main/WAL/SHM 永远不能成为 writable target。
- D-02: 创建四个稳定 identities：`phase111-pilot-elabo-metal-fe-25sr` / `pilot-elabo-metal-fe-25sr`、`phase111-pilot-elabo-resin-fe-18sr` / `pilot-elabo-resin-fe-18sr`、`phase111-pilot-custom-ns` / `pilot-custom-ns`、`phase111-pilot-lightive` / `pilot-lightive`。Elabo metal/resin 是 sibling canonical pages；不得 merge、retire 或将其中一页 redirect 到另一页。
- D-03: legacy synthetic `pilot-elabo`、generic `百乐 Pilot Elabo`、unqualified `Elabo`/`Falcon` 与 `elabopen0001` 只作为 ambiguity/collision markers。若 caller-owned catalog 中真实存在这些 identity/aliases，preflight 必须列出候选并 fail closed，不能猜测 survivor、复用 synthetic fixture ID 或创建 generic redirect。checked-in taxonomy/test fixture 只提供风险背景，不授权数据库 mutation。
- D-04: identity preflight 在首写前跨 exact normalized name/slug、aliases、market SKU 与 entity reference/source-item URL；四个 fileDownload URLs 是 model-unique markers，共享 category/warranty index 不作 unique marker。只规范 fragment、尾斜杠和无语义 tracking 参数；禁止 substring/fuzzy merge。
- D-05: FE-25SR current authority 使用 Pilot catalog PDF `https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016447&volumeName=00004` 与 metal warranty `https://www.pilot.co.jp/support/warranty/en/fountain/elabo.html`；FE-18SR 使用 `fileID=t010000016450` 与锁定 warranty `https://www.pilot.co.jp/support/warranty/en/fountain/elabo_2.html`。共同 category 为 `https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004`。两页分别建 current scopes，不交叉使用材质、重量、converter、颜色或 product code。
- D-06: metal independent sources 固定 The Pen Addict `https://www.penaddict.com/blog/2013/5/30/my-fountain-pen-education-the-pilot-metal-falcon` 与 Pencilcase `https://www.pencilcaseblog.com/2015/01/pilot-metal-falcon.html`；分别保留 Thomas-owned loaned sample 与 Pilot free-of-charge sample disclosure、尖宽、年代、重量/握持/写感边界，不把作者的 flex 术语写成厂商保证。
- D-07: resin independent source 固定 fpen149 `https://www.fpen149.com/pilot-elabo-review/`；只描述作者自购 FE-18SR SEF、2024 日期、CON-40 使用与其个人书写观察。页面引用的 custom Namiki video/nib 不能成为 stock FE-18SR 规格或性能保证。
- D-08: Custom NS current authority 为 `https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016458&volumeName=00004` 与 shared category；独立 source 为 Pencilcase `https://www.pencilcaseblog.com/2020/01/review-pilot-custom-ns-fountain-pen.html`。current FKNS-1/2025+ lineup 与 2020 Casa Della Stilografica sent sample/当时颜色、价格、converter 观察必须分 scope；不得借 Custom 74/92 金尖或旧 SKU 填空。
- D-09: Lightive current authority 为 `https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016927&volumeName=00004` 与 shared category；独立 source 为 kamitopen `https://kamitopen.jp/fountain-pen/lightive-fountain-pen/`。current P-FLT-1 与 2021 active-yellow sample、2025 refresh/update、作者自行干燥测试分 scope；不能把个案测试变成 Pilot warranty 或 current 全色事实。
- D-10: 四份正文各 2k+、四个完整独立 packs、四张不复用构图的 unique SVG。所有 source item 必须记录执行日 retrievedAt、title、author/date、locator、readability/status、allowedUse、archiveUrl/archiveLocator 与 independenceGroup；direct PDF 若拒绝自动访问，必须有同 fileID 的可读 archive/PDP/category locator 才可 qualified，否则停止，不用 search snippet/商店转述替代。
- D-11: 每页唯一 made_by 指向 Pilot `Zt-PbXkE7UHM`，reverse navigation 由 public_entities + made_by 派生；不写显式 brand reverse payload。Phase 84 brand 非 topology payload/source marker 不变，四条 links 合法改变 brand contract hash；按 Phase 110 在新 current hash 上重做 fact/language/media review 并 `publishEntity`，禁止 brand pack replay、旧短文复活或直接写 lifecycle/review/public tables。
- D-12: 所有数据库写入只到 caller-owned temp root 下的 checkpoint copy；真实 `data/fpkg.db` canonical realpath/inode 及 main/WAL/SHM 不写。repo 路径只接受 D-01 的 verified alias/canonical pair；database/owned-root authority 仍拒绝 remote selectors、protected path 或 sidecar、owned-root 外路径、checkpoint symlink/hard-link alias、client/path mismatch、其它 workspace root 与未迁移 032 copy。只做定向 Node test、TypeScript、Biome、SVG XML、diff/allowlist；不新增 shared infra、Playwright、generic readiness/search/LLM。
- D-13: 保护所有开始前和执行期间出现的 unrelated dirty/untracked；index 预先非空则停止。显式 stage 七个 owned product paths，唯一提交信息 `feat(content): publish Pilot Elabo siblings Custom NS and Lightive`；PLAN/SUMMARY/docs 后续另行处理且不进入产品 commit，只报告 Phase 111 partial batch。

Established interfaces:
- Phase 110 已验证 `phase84PlatinumPilotP0V3BrandPacks` + 一个既有 Pilot pen pack 的 brand-first fixture、exact duplicate inventory、`brandNonTopologyPayload`、topology-driven hash change、current-hash review + `publishEntity`、tamper rejection 与 terminal noop。Phase 111 直接复制 phase-local 模式，不抽 shared helper。
- `CuratedEntityPack` 承载 source/scope/claim/citation/evidence/spec/spec-evidence/variant/timeline/media；`loadCuratedEntityPack`、`computePublicationContentHash`、`recordEntityContentReview` 与 `publishEntity` 是唯一允许的 pack/review/publication 路径。
- Phase 21 `pilot-elabo`/`elabopen0001` 是 synthetic test/taxonomy construct，且 executable hierarchy manifest 当时未完成；本 Phase 的四页锁定决定优先，旧 synthetic artifact 只用于 duplicate-ambiguity negative case。
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 先锁定四个 exact-new identities、legacy Elabo ambiguity、品牌 topology 与 protected-copy 回归</name>
  <files>tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts</files>
  <behavior>
    - Test 1: 用 `snapshotCatalogFiles` 与 `copyCheckpointedCatalogToDisposableCopy` 创建 caller-owned copy 并迁移到 032；在 Phase 111 before-snapshot 前从 Phase 84 安装完整 Pilot brand pack + 一个既有 Pilot pen pack，Pilot brand 为 published/readiness=1。
    - Test 2: 首次 preflight 证明四个 stable IDs/slugs、canonical/body-qualified names、四个 locked SKUs 与四个 unique fileDownload URLs 均无 alternate catalog identity；四页才可创建。
    - Test 3: 注入 `pilot-elabo`、`百乐 Pilot Elabo`、generic `Elabo`/`Falcon` alias、synthetic `elabopen0001`、任一 FE SKU/source URL collision，均在首写前 fail closed，错误列出 criterion/candidate ID/type/slug/source locator；数据库完整摘要零变化，metal/resin 不互相 merge/redirect。
    - Test 4: 四个 catalog/warranty/independent source scopes 一一精确：FE-25SR 与 FE-18SR material/weight/converter/current variants 不串线，Custom NS 2020 sample 不覆盖 FKNS-1 current refresh，Lightive 2021 sample/独立 dry test 不覆盖 P-FLT-1 current claims。
    - Test 5: topology transaction 只创建四 targets 与四条唯一 `made_by -> Zt-PbXkE7UHM`；Pilot brand 非 topology payload、Phase 84 source marker/revision content 不变，brand contract hash 从 pre-topology 变为由 exact four links 决定的 post-topology hash。
    - Test 6: brand fact/language/media approvals 全部绑定 post-topology current hash，再由 `publishEntity` 恢复 contract-v3 public snapshot；无 Phase 84 replay。hash 未变化、payload/source marker 变化、review hash 错配或 direct lifecycle/public SQL 时测试失败。
    - Test 7: 独立 caller-owned fault fixtures 在 terminal state 删除/篡改任一新 made_by，或篡改任一 target identity/source marker/review/publication guard；对应 hash/readiness/public state 漂移可观测，apply fail closed，不修复 topology、不重审品牌、不假报 noop。
    - Test 8: 四页各 2k+、qualified official + independent group、完整 current spec evidence、唯一 approved primary SVG、四类 current-hash reviews、readiness blocker_count=0/public membership；Pilot reverse public diff 恰好新增四 IDs/slugs。
    - Test 9: CodeBuddy alias 与 Documents canonical git root 被证明为同一 repo 后两种输入均通过 repo authority；任何第三个 workspace/root、remote env、空 reviewer、caller-owned temp root 外路径、protected catalog canonical path/inode/main/WAL/SHM、checkpoint symlink/hard-link alias、client/path mismatch 与未迁移 copy 均首写前失败。finally 后 protected data/fpkg.db main/WAL/SHM snapshot 不变。
    - Test 10: 第二次 apply 返回四个 noop；identity/SKU/source/link/hash/revision/review/publication/reverse counts、Pilot post-topology snapshot、非目标 Pilot digests 全部不变。
  </behavior>
  <action>
按 D-01 至 D-13 先写单文件失败集成测试。复制 Phase 110 phase-local fixture 与 snapshot 结构，不导出 helper、不修改旧测试或 shared runner。fixture 完成后再拍 before-snapshot，明确 fixture mutation 不计入 Phase 111 diff。

将 D-03/D-04 的 preflight 写成 exact equality contract：覆盖 entities、entity_aliases、model_variants、entity reference/source-item normalized URLs；shared category 与 warranty index 可由 packs 共享但不能作为 unique identity marker，四个 fileDownload URLs 与 SKU 必须 unique。专门注入 legacy `pilot-elabo`/`elabopen0001` 及 generic Elabo/Falcon collisions，证明它们产生 auditable ambiguity 而不是 silent survivor choice。不得修改 Phase 21 artifacts 或把 taxonomy test fixture 当成 live row。

分阶段断言 Pilot pre-topology published baseline、四 links 后 invalidation/hash change、brand non-topology byte/logical equality、新 hash reviews + publish、四 pens review/publish、terminal replay。source-boundary assertions 使用结构化 scopes/claims/spec evidence/variants，而非只 grep 正文。tamper fixtures 分别覆盖 link、identity/source marker 与 review/publication guard。全部数据库写入绑定临时 caller-owned root；测试不得引入 Playwright、search、LLM、generic readiness 或 full-suite runner（D-11/D-12）。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts</automated>
  </verify>
  <done>失败回归完整锁定四 distinct identities、legacy pilot-elabo ambiguity、SKU/source scopes、四条 made_by、品牌 topology hash review/publish、tamper/review guards、noop 与 protected catalog。</done>
</task>

<task type="auto">
  <name>Task 2: 编写四份 2k+ evidence-complete packs 与四张型号专属事实图</name>
  <files>scripts/data/phase111-pilot-elabo-metal-resin-custom-ns-lightive.ts, public/images/library/site-original/phase111/pilot/pilot-elabo-metal-fe-25sr.svg, public/images/library/site-original/phase111/pilot/pilot-elabo-resin-fe-18sr.svg, public/images/library/site-original/phase111/pilot/pilot-custom-ns.svg, public/images/library/site-original/phase111/pilot/pilot-lightive.svg</files>
  <action>
按 D-05 至 D-10 在写作前逐一重开锁定来源并记录执行日 metadata。official 必须包含 shared Pilot category、四个 exact fileDownload URLs、FE-25SR `elabo.html` 与 FE-18SR `elabo_2.html`；独立来源必须包含 Pen Addict metal、Pencilcase metal、fpen149 resin、Pencilcase Custom NS、kamitopen Lightive。若 direct catalog file 返回 access denial，只有同 exact fileID 的 archive/PDP/category 可读定位才能保留 qualified；无法精确核对 current SKU/spec 时停止。禁止 search snippet、商店页或相邻 Pilot page替代。

导出 D-02 的四 IDs/slugs、Pilot ID、D-03/D-04 exact/legacy ambiguity markers 和四个 `CuratedEntityPack`。采用 Phase 110 embedded reviewed-copy + caller-owned materialization 模式；不得在 repo root 生成 `phase111-content/`。每份 summary 60–160 Unicode 字符、正文不少于 2,000 Unicode 字符，具备独立 source/scope/claim/citation/evidence/spec/spec-evidence/market_sku variant/timeline/media namespaces；不得加入 Pilot brand pack或复制相邻型号正文。

FE-25SR pack 按 D-05/D-06 只写 official metal body/brass、14K soft nib codes、metal 尺寸重量、current colors 与 CON-40/CON-70N 范围。Pen Addict 2013 是 Thomas 的 pen/SEF sample，Pencilcase 2015 是 Pilot free-of-charge metal sample；作者对重量、平衡、反馈、line variation、旧价格和 converter 的叙述分别归因。soft nib 不写成 true/traditional flex 保证，不鼓励过压。

FE-18SR pack 按 D-05/D-07 只写 official resin body、14K soft nib codes、resin 尺寸重量、current colors 与 CON-40 范围。fpen149 只承担作者 2024 自购 FE-18SR SEF、个人笔感/线宽/使用观察；其 embedded customized Namiki video、对 metal 的比较与个人结论不成为 current spec。Elabo/Falcon 可作为地区命名说明，但 generic alias 不绑定任一 sibling canonical；FA/Falcon nib option 只作明确排除。

Custom NS pack 按 D-08 以 current PDF/category 锁定 FKNS-1、special-alloy steel nib、EF/F/M/B、body/material、CON-70N supplied/compatible converters、尺寸重量和执行日 variants。Pencilcase 2020 sent sample 独立成 `professional_sample_2020_pre_refresh`；当时颜色、CON-40、欧洲/日本/美国价格与作者对 steel nib/握持的感受不覆盖 current lineup，也不借 Custom 74/92 的 gold-nib spec。

Lightive pack 按 D-09 以 current PDF/category 锁定 P-FLT-1、F/M、body/material、CON-40/CON-70N、尺寸重量和 current variants。kamitopen 明确拆 `review_sample_2021_active_yellow`、`author_update_2025_2026` 与 `independent_dry_test` scopes；旧 active-yellow/旧价格不进 current variants，作者的一年 dry test、轻重与 cap 体验不写成 Pilot guarantee。

分别绘制四张 1600x900 site-original SVG：metal 用金属轴/重量/CON-70N/soft-nib pressure boundary；resin 用轻量树脂/CON-40/与 metal sibling 并列但不合并；Custom NS 用 special-alloy steel nib/current FKNS-1 与 2020 sample 分栏；Lightive 用 current P-FLT-1 cap/converter/current colors 与旧 sample 分栏。四图构图、色板、信息层级与笔轮廓均不可模板换标题；显著声明本站原创示意、非产品照片、非比例/颜色/表面复刻，不用 Pilot logo/外站图片。每 pack 只能批准自己的 SVG 为唯一 primary media。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; pnpm exec biome check scripts/data/phase111-pilot-elabo-metal-resin-custom-ns-lightive.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase111/pilot/pilot-elabo-metal-fe-25sr.svg public/images/library/site-original/phase111/pilot/pilot-elabo-resin-fe-18sr.svg public/images/library/site-original/phase111/pilot/pilot-custom-ns.svg public/images/library/site-original/phase111/pilot/pilot-lightive.svg &amp;&amp; node --import tsx --test tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts</automated>
  </verify>
  <done>四个 sibling/current identities 各有 2k+ 自然中文、qualified official + independent evidence、精确 current/sample scopes、完整 packs 与四张独立 approved primary SVG。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现 caller-owned 四页发布、Pilot brand post-topology 恢复、guarded noop 与精确七文件提交</name>
  <files>scripts/apply-phase111-pilot-elabo-metal-resin-custom-ns-lightive-content.ts</files>
  <behavior>
    - Test 1: remote/root/reviewer/path/migration 与 exact identity/legacy ambiguity prerequisites 全部在首个 write transaction 前完成；失败时 caller-owned copy 摘要不变。
    - Test 2: identity/topology transaction 只创建或确认四 target IDs/slugs 与四条唯一 made_by；generic pilot-elabo、alternate exact identity、错误 target payload、SKU/source collision 或额外 maker 均 fail closed，不 merge/repair/redirect sibling pages。
    - Test 3: 四 links 固定后 Pilot brand 非 topology payload/Phase 84 marker unchanged，contract hash 精确变为 post-topology current hash；fact/language/media approvals 写给新 hash，再由 publishEntity 恢复品牌，无 Phase 84 replay或 direct publication writes。
    - Test 4: 四 packs 各自 transaction 安装 target-owned payload，随后逐页 current-hash fact/language/media review + publishEntity；public reverse 只新增四 target pages。
    - Test 5: terminal state 同时核对 identity/SKU/source marker、四 exact made_by、唯一 primary media、current hash/revision、四类 reviews、readiness/public membership、Pilot brand exact post-topology publication 与所有 source boundaries；任一 tamper/guard mismatch 失败，全部满足才返回四 noop。
  </behavior>
  <action>
以 Phase 110 apply 为直接模式实现 phase-local options/constants/authority/preflight/brand digest/topology/review/publish/terminal flow，不抽 shared infra（D-11/D-12）。CLI 只接受显式 `--database`、`--owned-root`、`--protected-catalog` 与 reviewer；repo authority 同时接受 D-01 已核验的 CodeBuddy alias 和 Documents canonical git root，并用 `realpath` + `git rev-parse --show-toplevel` 证明二者指向同一仓库，不能把正常 canonicalization 当 blocker；任何其它 root 才拒绝。清空/拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`。数据库 authority 与 repo alias 规则分开：owned checkpoint 必须位于 caller-owned temp root 内且自身不是 symlink/hard-link；首写前验证 protected catalog canonical realpath/inode/main/WAL/SHM snapshots、owned containment、PRAGMA database_list、client/path 与 migration 032，任何 protected target/sidecar/alias 均拒绝。

实现 D-03/D-04 `assertIdentityPreflight`。首次运行要求四 target IDs 及 unique markers absent；replay 只允许 marker 精确属于对应 target terminal row。generic `pilot-elabo`/Elabo/Falcon 或 `elabopen0001` 在 live catalog 出现即抛含候选证据的 ambiguity error；绝不将其 retire、merge、redirect或分配给任一 sibling。四 target stable IDs 若已承载其它 identity、或任一 SKU/file URL 绑定另一 pen，也首写前失败。

在单个 identity/topology transaction 创建四 canonical pens并各插入唯一 `made_by -> Zt-PbXkE7UHM`；不创建 generic Elabo route、sibling redirect或显式 brand reverse。transaction 前捕获 Pilot pre-topology hash、entity/story/source/reference/spec/media 与 Phase 84 marker 非 topology digest；transaction 后要求 digest byte/logically equal 且 post hash 因 exact four links 不同。按 Phase 110 对新 brand hash 写 fact/language/media approvals，再 `publishEntity`。不调用 Phase 84 loader、不直接 SQL 写 review/lifecycle/public tables；hash/link/payload 任一不符合预期即 fail closed（D-11）。

用 `loadCuratedEntityPack` 在各自 transaction 安装四 target-owned payload；逐页 `recordEntityContentReview` fact/language/media，再 `publishEntity`。terminal noop 必须校验四 identities/SKUs/unique URLs、无 generic collision、exact made_by、unique primary media、hash/revision/four reviews/readiness/public membership、Pilot brand post-topology review/public snapshot、reverse diff、non-target Pilot digest 与 protected snapshot。terminal 后 link/identity/source/review/publication drift 只报错，不 repair、re-review或重复 load。

定向验证全部通过后才处理 Git（D-13）。要求 index 预先为空；只显式 stage frontmatter 七路径，排序比较 cached path set、运行 cached diff check，集合异常仅撤销本包七路径 staging 后停止。禁止 `git add .`、glob add、stash、clean、reset、checkout、force、删除或覆盖任何 unrelated dirty/untracked。提交 `feat(content): publish Pilot Elabo siblings Custom NS and Lightive`，再用 `git show --name-only --format=` 证明唯一产品 commit 恰含七文件。PLAN/SUMMARY/docs 不进该 commit；产品提交完成后再按执行 workflow 另写 SUMMARY，记录 source locators、legacy ambiguity、四 identities、brand hash/review/no-replay、tamper/noop、protected snapshot、验证命令、commit hash 与 partial-batch 声明。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase111-pilot-elabo-metal-resin-custom-ns-lightive.ts scripts/apply-phase111-pilot-elabo-metal-resin-custom-ns-lightive-content.ts tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase111/pilot/pilot-elabo-metal-fe-25sr.svg public/images/library/site-original/phase111/pilot/pilot-elabo-resin-fe-18sr.svg public/images/library/site-original/phase111/pilot/pilot-custom-ns.svg public/images/library/site-original/phase111/pilot/pilot-lightive.svg &amp;&amp; git diff --check -- scripts/data/phase111-pilot-elabo-metal-resin-custom-ns-lightive.ts scripts/apply-phase111-pilot-elabo-metal-resin-custom-ns-lightive-content.ts tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts public/images/library/site-original/phase111/pilot/pilot-elabo-metal-fe-25sr.svg public/images/library/site-original/phase111/pilot/pilot-elabo-resin-fe-18sr.svg public/images/library/site-original/phase111/pilot/pilot-custom-ns.svg public/images/library/site-original/phase111/pilot/pilot-lightive.svg</automated>
  </verify>
  <done>四个 Pilot current pages 在 caller-owned copy 经 current-hash reviews/publish 并 replay noop；Pilot brand 按 exact four-link topology 恢复且不 replay/改写，tamper/guard drift fail closed，真实 catalog/shared infra/dirty worktree 不变，产品 commit 精确七文件。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Live web -> four curated packs | Pilot catalog/warranty 与独立 reviews 进入 current facts、sample scopes、claims/specs/variants 和中文正文；PDF 可能拒绝自动访问，reviews 可能跨旧 lineup、赠测或个人测试。 |
| Legacy taxonomy -> canonical identities | synthetic `pilot-elabo` 与旧 family-level research 可能诱导把 FE-25SR/FE-18SR merge；本 Phase 锁定四 sibling pages，catalog collision 只能 fail closed。 |
| Caller -> phase-local apply | database/owned root/protected snapshot/reviewer/env 由 caller 提供；错误 root/path 或 alias 可能写入真实 catalog。 |
| Four made_by links -> Pilot publication | migration 032 把 topology 纳入 brand contract；错误 hash、旧 review 或 direct lifecycle write 会发布未经 current-hash 审核的 brand/pen。 |
| Dirty worktree -> product commit | 工作区含 unrelated modified/untracked；宽泛 staging 会污染产品提交或覆盖他人工作。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-111-01 | Spoofing | official/current source identity | high | mitigate | Task 2 重开四 exact fileDownload URLs、两个 Elabo warranty 与 category，记录 locator/status/archive；不可定位 PDF 不作 qualified，SKU/spec 冲突停止。 |
| T-111-02 | Spoofing | independent sample scope | high | mitigate | D-06 至 D-09 锁定 URL、作者/日期/loan/free/self-purchase/update disclosures；旧 sample/价格/颜色/测试不覆盖 current official claims。 |
| T-111-03 | Tampering | legacy pilot-elabo identity | critical | mitigate | Tasks 1/3 对 synthetic ID/slug/generic aliases 建 exact collision fixtures；任何 live candidate 首写前 fail closed，禁止 automatic merge/redirect/survivor choice。 |
| T-111-04 | Tampering | repo/database authority separation | critical | mitigate | Tasks 1/3 允许且仅允许 verified CodeBuddy alias + Documents canonical git-root pair；数据库另以 protected realpath/inode/main-WAL-SHM immutable snapshots、caller-owned temp containment、no symlink/hard-link 与 PRAGMA client/path checks 拒绝 remote、protected、outside-root 和 alias writes。 |
| T-111-05 | Tampering | Pilot made_by/reverse topology | high | mitigate | Task 3 单 transaction 只创建四条唯一 pen->Pilot links；无 generic Elabo reverse/redirect，public reverse diff 精确四 targets。 |
| T-111-06 | Elevation of Privilege | brand/pen publication guard | critical | mitigate | Pilot non-topology digest unchanged + exact post-topology hash，然后 current-hash reviews + publishEntity；四 pens 同路径，tamper/review mismatch fail closed，不直接写 review/lifecycle/public tables。 |
| T-111-07 | Repudiation | metal/resin/current/history boundaries | high | mitigate | 每页独立 current/sample/update scopes、SKU-specific spec evidence、structural tests；soft nib 不等于 traditional flex，Custom/Lightive 旧 lineup 不覆盖 current。 |
| T-111-08 | Information Disclosure | remote credentials | high | mitigate | apply 拒绝 remote selectors，不读取/打印 token；不新增 secret，所有敏感凭据只能来自 env 且本 Phase 不消费。 |
| T-111-09 | Denial of Service | broad test/infrastructure expansion | low | accept | 仅一个定向 integration test、tsc、owned-file Biome/XML/diff；不新增 Playwright、search/LLM、generic readiness 或 full-suite runner。 |
| T-111-10 | Tampering | exact product commit | high | mitigate | 空 index、七文件显式 allowlist、cached diff 与 post-commit path-set proof；unrelated dirty/untracked 原样保留，docs 后续另行处理。 |
| T-111-SC | Tampering | package supply chain | low | accept | Phase 111 不安装/升级 npm、pip 或 cargo package；若执行中出现 package install 需求即停止并重新规划。 |

</threat_model>

## Source Coverage Audit

| SOURCE | ID | Feature / Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 四个 distinct Pilot current pages，exact source/identity scopes，brand topology review/publish，partial batch | 1-3 | COVERED | identity、内容、media、publication、noop、protected copy 与提交闭环。 |
| REQ | QUICK-260721-IFJ | Phase 111 Pilot Elabo siblings/Custom NS/Lightive 局部交付 | 1-3 | COVERED | 单计划三任务完整覆盖。 |
| RESEARCH | R-01 | Phase 110 brand-first fixture、non-topology digest、topology hash change、review/publish/tamper/noop | 1,3 | COVERED | phase-local reuse，无 shared infra 修改。 |
| RESEARCH | R-02 | Pilot current gaps 指向 FE-25SR、FE-18SR、FKNS-1、P-FLT-1 与 official catalog | 1,2 | COVERED | 四个 exact PDF + warranty/category。 |
| RESEARCH | R-03 | Phase 21 legacy Elabo/Falcon family/synthetic pilot-elabo ambiguity | 1,3 | COVERED | 作为 negative preflight risk，不覆盖本 Phase locked siblings。 |
| CONTEXT | D-01 | 允许 verified CodeBuddy alias / Documents canonical git-root pair；拒绝其它 repo roots | 1,3 | COVERED | canonicalization 本身不阻塞，database authority 独立严格执行。 |
| CONTEXT | D-02 | 四 stable IDs/slugs，Elabo metal/resin 不 merge | 1-3 | COVERED | 四 canonical pages 与 four-link reverse。 |
| CONTEXT | D-03 | legacy pilot-elabo/generic Falcon ambiguity fail closed | 1,3 | COVERED | exact collision fixtures，无 generic redirect。 |
| CONTEXT | D-04 | name/slug/SKU/source URL exact preflight | 1,3 | COVERED | unique vs shared source contract。 |
| CONTEXT | D-05 | FE-25SR/FE-18SR official catalog/warranty scopes | 1,2 | COVERED | body/converter/material/current variants 分开。 |
| CONTEXT | D-06 | Pen Addict + Pencilcase metal samples | 1,2 | COVERED | loan/free sample 与 soft/flex边界。 |
| CONTEXT | D-07 | fpen149 resin sample | 1,2 | COVERED | self-purchased FE-18SR SEF scope。 |
| CONTEXT | D-08 | Custom NS exact current + Pencilcase 2020 boundary | 1,2 | COVERED | current FKNS-1 与 pre-refresh sample 分开。 |
| CONTEXT | D-09 | Lightive exact current + kamitopen dated scopes | 1,2 | COVERED | current P-FLT-1、2021 sample、update/test 分开。 |
| CONTEXT | D-10 | 四份 2k+ packs、source metadata、unique SVG | 1,2 | COVERED | qualified evidence与四张主图。 |
| CONTEXT | D-11 | 四 made_by、brand post-topology hash review/publish/no replay | 1,3 | COVERED | exact hash/links/non-topology gate。 |
| CONTEXT | D-12 | caller-owned only、protected catalog、no shared infra/Playwright/readiness/search/LLM | 1-3 | COVERED | authority + focused verification。 |
| CONTEXT | D-13 | dirty/untracked 保护、exact product commit、docs later、partial batch | 3 | COVERED | 七文件 allowlist与局部声明。 |

Deferred ideas: production migration, full-site acceptance, generic readiness/search/LLM, Playwright and remaining Pilot/content backlog are outside this partial batch. Source audit has no missing items.

## Pre-Mortem and Reachability Check

1. **最可能失败：旧 `pilot-elabo` family 设计吞并 metal/resin sibling。** Mitigation: exact synthetic/generic ambiguity fixtures；live collision 首写前 fail closed，两个 SKU 使用 body-qualified IDs/slugs且无 generic redirect。
2. **最可能失败：FE-25SR 与 FE-18SR 的 converter/重量/材质或 Falcon/FA 概念串线。** Mitigation: SKU-specific official scopes/spec evidence、separate source URLs、structural cross-negative assertions。
3. **最可能失败：Custom NS/Lightive 的旧独立评测覆盖 current refreshed lineup。** Mitigation: current official scopes 与 dated sample/update/test scopes 分离；旧颜色、价格和个人 dry test 禁止进入 current variants/guarantees。
4. **最可能失败：topology hash 或 review guard 被旧 review/noop 掩盖。** Mitigation: pre/post brand hashes、non-topology digest、exact four-link hash、current-hash reviews、link/identity/source/review/publication tamper fixtures。
5. **最可能失败：测试或提交污染真实 catalog/dirty worktree。** Mitigation: protected main/WAL/SHM snapshots、authority rejection、空 index、显式七文件 allowlist和 post-commit proof。

Reachability is complete: Phase 84 Pilot fixture -> pre-topology brand digest/hash -> exact absence + legacy ambiguity preflight -> four stable canonical identities -> four unique made_by links -> Pilot invalidation + expected post-topology hash -> reviews on new hash + publishEntity -> four CuratedEntityPacks -> pen current-hash reviews + publishEntity -> public_entities -> derived Pilot reverse navigation. No artifact depends on generic Elabo routing, new package, shared-infra mutation, protected-catalog write or a later production rollout.

<verification>

1. `node --import tsx --test tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts` passes entirely on caller-owned checkpoint copies and proves protected main/WAL/SHM equality.
2. `pnpm exec tsc --noEmit --pretty false` passes; Biome passes the three Phase 111 TypeScript files.
3. Four SVGs pass `xmllint --noout`; all seven owned paths pass `git diff --check`, cached allowlist and post-commit path-set checks.
4. Four bodies each exceed 2,000 Unicode characters, each has qualified official + independent evidence, current spec evidence, one unique primary SVG and four current-hash reviews.
5. Legacy `pilot-elabo`/generic Elabo/Falcon and exact name/slug/SKU/source collisions fail before write; first apply publishes four distinct pages and restores Pilot brand; second apply returns four exact noops.
6. Pilot non-topology payload/Phase 84 marker remain unchanged; post-topology hash changes for exactly four links, link/identity/source/review/publication tamper is rejected, reverse diff contains only four targets, non-target/protected digests remain unchanged.
7. `git show --name-only --format=` proves the only product commit contains exactly seven frontmatter paths; PLAN/SUMMARY/docs and unrelated dirty/untracked are absent.

</verification>

<success_criteria>

- Elabo metal FE-25SR、Elabo resin FE-18SR、Custom NS FKNS-1 与 Lightive P-FLT-1 是四个 unique canonical identities；legacy generic/synthetic ambiguity 不产生 merge、redirect或第五公开页。
- 四页均为 2k+ natural Chinese、evidence-complete、unique SVG、contract-v3 published；metal/resin/current/sample/refresh/test boundaries 满足 D-05 至 D-10。
- 四条唯一 made_by 只产生四个 Pilot reverse links；Pilot brand non-topology payload/source marker unchanged，contract hash按 exact topology 合法改变，并对新 current hash review后经 publishEntity恢复，无 brand replay/guard bypass。
- tamper/noop、TypeScript、Biome、SVG XML、diff、protected snapshot和 exact commit allowlist全部通过。
- 唯一产品提交精确七文件；后续 docs/SUMMARY不混入产品提交，并诚实报告 Phase 111 partial batch。

</success_criteria>

<output>
Create `.planning/quick/260721-ifj-phase-111-pilot-elabo-metal-fe-25sr-elab/SUMMARY.md` after the exact seven-file product commit completes. Do not include PLAN.md, SUMMARY.md or any other docs in the product commit.
</output>
