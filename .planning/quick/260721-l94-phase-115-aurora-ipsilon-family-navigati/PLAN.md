---
phase: 115-aurora-ipsilon-family-navigation-and-current-pens
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/content-research/aurora-ipsilon-family-phase115.md
  - .planning/content-research/aurora-ipsilon-demo-colors-phase115.md
  - .planning/content-research/aurora-ipsilon-resin-b11-n-phase115.md
  - scripts/data/phase115-aurora-ipsilon-family-current-pens.ts
  - scripts/apply-phase115-aurora-ipsilon-family-current-pens-content.ts
  - tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts
  - public/images/library/site-original/phase115/aurora/aurora-ipsilon-family.svg
  - public/images/library/site-original/phase115/aurora/aurora-ipsilon-demo-colors.svg
  - public/images/library/site-original/phase115/aurora/aurora-ipsilon-resin-b11-n.svg
autonomous: true
requirements:
  - QUICK-260721-L94
must_haves:
  truths:
    - "Aurora Ipsilon 以新 article `aurora-ipsilon` 发布为家族导航，明确 Demo、Resin、Italia、Quadra 等是规格不可互借的 sibling lines；article 没有 made_by、reverse、entity_publications 或 pen-only payload。"
    - "Aurora Ipsilon Demo Colors 与 Aurora Ipsilon Resin B11-N 是两个互不吞并的 current canonical pen；前者保存六色与两组饰件/钢尖，后者保存 exact B11-N 黑树脂、C/C、金/铬选项和检索日 availability。"
    - "三个页面各有 2,000+ Unicode 字符、各有唯一 approved primary SVG，并在正文中链接另外两个页面；Demo 2020 lineup/gift 与 Resin 2011 community sample 均不升级为 current stable facts。"
    - "两个 pen 各有且仅有一条 made_by 指向既有 Aurora `CJXe8UpnkHLJ`；article 不连 maker，Aurora brand 仅在精确 post-topology current hash 上重审并重新发布。"
    - "既有 Aurora brand、Optima、Aurora 88 family 与 Ottantotto Resina (800) 的非 topology payload、source markers 和互相 topology 保持不变；route allowlist 也保持不变。"
    - "全部写入只发生在 caller-owned checkpoint copy；首次 apply 发布三页、pristine replay 返回三项 noop、tampered terminal state fail closed，真实 catalog main/WAL/SHM 不变。"
    - "唯一产品提交精确包含 frontmatter 的九个产品路径；PLAN/SUMMARY/docs 后置，unrelated dirty/untracked 原样保留，并如实声明 Phase 115 是 partial batch。"
  artifacts:
    - path: "scripts/data/phase115-aurora-ipsilon-family-current-pens.ts"
      provides: "锁定三 identities/slugs、官方与独立来源、current/datetime/community scopes、article descriptor、两个 CuratedEntityPacks 和三 SVG contracts"
    - path: "scripts/apply-phase115-aurora-ipsilon-family-current-pens-content.ts"
      provides: "phase-local repo/DB authority、exact duplicate preflight、article/pen install、maker topology、Aurora re-review/publish 与 terminal noop"
    - path: "tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts"
      provides: "Phase 114 baseline、三页 identity/source boundary、body navigation、publication、tamper/noop 与 protected-catalog integration regression"
  key_links:
    - from: "scripts/apply-phase115-aurora-ipsilon-family-current-pens-content.ts"
      to: "scripts/data/phase115-aurora-ipsilon-family-current-pens.ts"
      via: "locked IDs/slugs/source markers、article descriptor 与 target-owned pack loaders"
      pattern: "PHASE115_|loadPhase115"
    - from: "Ipsilon family article"
      to: "Demo Colors and Resin B11-N pens"
      via: "正文 `/pen/aurora-ipsilon-demo-colors` 与 `/pen/aurora-ipsilon-resin-b11-n`；两 pen 正文同时链接 article 与 sibling pen"
      pattern: "aurora-ipsilon(-demo-colors|-resin-b11-n)?"
    - from: "two Ipsilon pens"
      to: "Aurora brand CJXe8UpnkHLJ"
      via: "每 pen 唯一 made_by；两个 exact topology additions 改变 brand contract hash，随后对 current hash review 并 publishEntity"
      pattern: "made_by|CJXe8UpnkHLJ"
---

<objective>
发布一个 Aurora Ipsilon 家族导航 article，以及两个身份、来源与规格边界清晰的 current pen：Ipsilon Demo Colors 和 Ipsilon Resin B11-N。

Purpose: 让读者从 Ipsilon 家族进入两个当前可验证型号，同时避免把 sibling line、历史 lineup、赠品、community sample 或可变库存误写成共享的当前规格。
Output: 三篇 2,000+ 中文 sourced content、三张原创 SVG、phase-local data/apply/integration test，以及精确九文件产品提交；不改 route allowlist 或任何既有产品文件。
</objective>

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/quick/260721-kdm-phase-114-reclassify-aurora-88-as-family/PLAN.md
@.planning/quick/260721-kdm-phase-114-reclassify-aurora-88-as-family/SUMMARY.md
@scripts/data/phase114-aurora-88-family-ottantotto-resina-800.ts
@scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content.ts
@tests/content/phase114-aurora-88-family-ottantotto-resina-800.test.ts
@scripts/apply-phase48-waterman-aurora-content.ts
@scripts/data/phase48-waterman-aurora.ts
@src/lib/entity-redirects.ts

<interfaces>
- Existing protected identities: Aurora brand `CJXe8UpnkHLJ`; Optima `5waoVLPHU2Pt`; Aurora 88 family/article `s41AURORA88`; Ottantotto Resina (800) `phase114-aurora-ottantotto-resina-800`.
- Locked Phase 115 identities: article ID `phase115-aurora-ipsilon-family`, slug `aurora-ipsilon`, canonical name `Aurora Ipsilon（系列导航）`; Demo pen ID `phase115-aurora-ipsilon-demo-colors`, slug `aurora-ipsilon-demo-colors`, canonical name `Aurora Ipsilon Demo Colors`; Resin pen ID `phase115-aurora-ipsilon-resin-b11-n`, slug `aurora-ipsilon-resin-b11-n`, canonical name `Aurora Ipsilon Resin B11-N`.
- Phase 114 authority contract: `ApplyPhase114Options = ApplyPhase22Options`; accept only CodeBuddy/Documents repo inputs resolving by realpath and git top-level to `/Users/xz/Documents/fountain-pen-graph`; database authority separately requires a caller-owned, non-symlink/non-hard-link migrated copy plus protected catalog snapshot.
- Phase 114 publication contract: article uses the existing article visibility branch and has no `entity_publications`; brands/pens require current contract-hash content reviews and `publishEntity`. Capture brand non-topology payload before adding links; never replay a prior brand pack after topology changes.
- Route contract: `RECLASSIFIED_ARTICLE_PATHS` is only for a real legacy namespace that must redirect. Phase 115 has no legacy Ipsilon entity or route, so `src/lib/entity-redirects.ts` is protected and `/pen/aurora-ipsilon` is not invented.
</interfaces>
</context>

<decisions>

- D-01: repo 输入只接受 `/Users/xz/CodeBuddy/fountain-pen-graph` 与 `/Users/xz/Documents/fountain-pen-graph`，两者必须解析到 Documents canonical git root；DB 仍只允许 caller-owned checkpoint copy，真实 catalog/sidecars 受快照保护。
- D-02: 三个 stable identities 使用 `<interfaces>` 的 IDs/slugs/names。现有 catalog 预期没有任何 Ipsilon entity；首次执行前仍必须对 ID、slug、canonical/alternate names、aliases、source_url、official reference ownership、source marker 和 route map 做 exact duplicate inventory，任何真实 collision 都 fail closed，不猜测 merge/survivor。
- D-03: family article 说明 Demo、Resin、Italia／Stagioni d'Italia、Quadra 等是 sibling lines，不是共享 finish、nib、filling、尺寸或 availability 的 variants；本批只为 Demo Colors 与 Resin B11-N 建 pen entity，不能凭导航提及创建其它 sibling entities。
- D-04: Demo current authority 为 Aurora official current category `https://aurorapen.it/categoria-prodotto/medio-di-gamma/ipsilon/ipsilon-demo-colors/` 与 official PDF `https://aurorapen.it/wp-content/uploads/2025/07/IPSILON-Demo-Colours.pdf`。只据此写 glossy colored resin、clear grip section、six colors，以及 red/purple/turquoise 的 chrome trim + stainless-steel nib、green/orange/yellow 的 gold trim + gold-plated steel nib；availability 是 `2026-07-21` snapshot，不虚构尺寸。
- D-05: Bertram's Inkwell `https://blog.bertramsinkwell.com/aurora-ipsilon-demo-colors/` 标记 author Adam L.、published `2020-08-06`、professional dated scope；它只支撑当时 lineup、cartridge/converter、steel nib、EF/F/M/B/italic 与 matching ink gift。旧颜色命名、赠墨、尖宽或当时库存不得转移成 2026 current listing事实。
- D-06: Resin exact authority 为 `https://aurorapen.it/shop/ipsilon-resin-stilografica/` 与其 official current Ipsilon category。exact scope只写 SKU B11-N、black resin、cartridge/converter、gold/chrome finish options 与 `2026-07-21` availability；价格/库存为可变快照，不制造尺寸、重量或使用体验。
- D-07: Pen Boutique `https://www.penboutique.com/blogs/blog/a-faithful-companion-with-personality-the-aurora-ipsilon` 标记 Laura Petix、published `2024-07-30`、professional family/sibling context；其具体 Resin、Demo、Quadra等配置按文章日期和样本严格分 scope。2011 FPN Resin sample若纳入，只能是 community sample narrative，不得冒充 professional corroboration 或 exact current B11-N 规格。
- D-08: 三页 summary 各 60-160 Unicode 字符，body 各至少 2,000 Unicode 字符；每页正文链接另两页。三张 1600x900 unique site-original SVG 只表达 family navigation、Demo six-color/trim boundary、Resin exact-current/source boundary，不充当 logo、产品照片、比例、颜色、finish 或尺寸证据。
- D-09: article 无 maker/reverse 和 pen-only payload；两个 pen 各有且仅有一个 `made_by -> CJXe8UpnkHLJ`，Aurora 的 reverse navigation由既有 topology/publication机制生成，不写正文链接为 topology。
- D-10: Phase 114 的 Aurora brand、Optima、Aurora 88 family、Ottantotto Resina (800) 保持不变。两条 new maker links 合法改变 Aurora contract hash后，验证 brand 非 topology payload/source marker不变，再对 post-topology current hash写 fact/language/media reviews并 `publishEntity`；禁止 brand pack replay或直接 SQL 写 lifecycle/review/public tables。
- D-11: 使用单一 setup/migration integration fixture；首次 apply、fault fixtures、review/publish、tamper 与 replay只在 caller-owned copies。terminal noop须完整验证 identity、sources/scopes、media、links、hash/reviews/publication与 protected snapshots；tampered terminal state不自动 repair/reload/re-review。
- D-12: 因没有 legacy Ipsilon entity/route，不修改 `src/lib/entity-redirects.ts`，也不添加虚构 `/pen/aurora-ipsilon` redirect。若 preflight 发现真实 legacy owner或 route collision，停止并报告，不能把 route file条件性塞入提交。
- D-13: 保护开始前及执行期间全部 unrelated dirty/untracked；index预先非空则停止。只显式 stage frontmatter九路径，唯一产品提交信息 `feat(content): publish Aurora Ipsilon family and current pens`；PLAN/SUMMARY/docs后续另行记录。
- D-14: 不修改任何既有 product file，不新增 shared infra、Playwright、generic readiness/search/LLM、package、migration或 production catalog rollout；如实报告 Phase 115 partial batch，不代表 Aurora、Ipsilon、Phase 23 或全站完成。

</decisions>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 先锁定三身份、证据隔离、Aurora topology 与 protected-copy 回归</name>
  <files>tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts</files>
  <behavior>
    - Test 1: 一个 top-level setup 从 `copyCheckpointedCatalogToDisposableCopy` 创建并迁移 owned copy，按 Phase 41 -> Phase 48 -> Phase 114 建立公开 Aurora/Optima/88 family/Resina 800 baseline；证明三个 Phase 115 IDs/slugs/names尚不存在，首次 apply返回 article + two pens published。
    - Test 2: exact duplicate inventory覆盖三 IDs/slugs/names、`Ipsilon`/`Aurora Ipsilon`/`Demo Colors`/`B11-N` qualified aliases、两个 official exact URLs与 PDF reference owners、Phase 115 markers、entity redirect rows和 static route map；alternate owner、ambiguous generic owner或 route collision首写前 fail closed。
    - Test 3: family 是公开 article、无 entity_publications/made_by/reverse/spec/variant；两个 pens 身份不同，各只有 target -> Aurora made_by与 Aurora -> target reverse。`getReclassifiedArticlePath("pen", "aurora-ipsilon")` 保持 null，route map digest不变。
    - Test 4: 三页 summary/body满足长度，每页有独立 approved primary SVG并正文链接另外两页；body navigation不产生 article topology，也不产生 pen-to-pen topology。
    - Test 5: Demo official current/PDF scope结构化保存 six colors、clear section与两组 trim/nib；2020 Bertram scope单独保存 C/C、EF/F/M/B/italic、then-lineup与matching-ink gift，后者不 qualify current claims/specs/variants/availability。
    - Test 6: Resin exact current scope保存 B11-N、black resin、C/C、gold/chrome options与retrieved-date availability；Pen Boutique family/sibling scope和可选2011 FPN community sample分离，sample details不 qualify exact stable fields。
    - Test 7: 两条 maker topology加入后 Aurora hash按 exact delta改变，Phase 114 brand非 topology payload/source marker不变；旧reviews不复用，post-topology current hash四类 review/public membership恢复。Optima、88 family、Resina 800 full digests不变。
    - Test 8: wrong source ownership/scope qualification/media/body link、missing/extra topology、review hash/publication guard tamper、remote selector、第三 repo root、protected/symlink/hard-link/path mismatch均在写入或noop前fail closed；真实 main/WAL/SHM snapshot不变。
    - Test 9: 第二次 pristine apply返回三项 noop，identity/source/link/hash/revision/reviews/public counts、Aurora post-topology snapshot与 protected entities全部不变。
  </behavior>
  <action>
按 D-01 至 D-14 先写失败的单文件 integration test。直接复制 Phase 114 的 verified repo pair、Phase 41/48/114 baseline chain、article visibility、brand pre/post topology digest、caller-owned authority、tamper/noop和 single-setup pattern；不要抽 shared helper。setup只迁移一次，所有 fault fixtures从准备好的 checkpoint派生，且所有失败分支同时断言 first-write rows或terminal digests未改变。

duplicate preflight必须查询 entities、entity_aliases、entity_references/source_items、source_url、source markers、entity_redirects和 `RECLASSIFIED_ARTICLE_PATHS`。generic family词只能作为 collision marker；若真实 row命中则列出候选并拒绝，不能把“先前扫描没发现”当作跳过 live preflight 的理由。Demo category/PDF被family article导航引用若由本批自身产生可接受，但首次执行前任何 pen/article owner都必须报告；Resin exact URL不能被alternate pen拥有。

证据边界用 fact_scopes、claims/citations/evidence、model_specs/model_variants与source locator断言，不只grep正文。保护 digest覆盖 Aurora/Optima/88 family/Resina 800 entity/story/source/reference/alias/scope/claim/spec/media/publication/topology；route module以静态返回值和文件hash锁定不变。测试不得写真实catalog、修改产品文件、启动Playwright/search/LLM或引入第二runner。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts</automated>
  </verify>
  <done>失败回归完整锁定三个 exact-new identities、source scopes、three-way navigation、maker topology、Aurora current-hash review、protected entities、tamper/noop与 caller-owned safety。</done>
</task>

<task type="auto">
  <name>Task 2: 编写 Ipsilon family、Demo current/datetime 与 Resin exact/sample 三份证据文稿</name>
  <files>.planning/content-research/aurora-ipsilon-family-phase115.md, .planning/content-research/aurora-ipsilon-demo-colors-phase115.md, .planning/content-research/aurora-ipsilon-resin-b11-n-phase115.md</files>
  <action>
按 D-03 至 D-08 写三份 reviewed Markdown，每份固定 `## summary` 与 `## body_md`，summary 60-160 Unicode字符、body至少2,000 Unicode字符，并在正文使用 canonical routes链接另外两页。family从“同一 Ipsilon 名下为什么不能共用规格”展开：用官方 current navigation和Pen Boutique 2024专业文章说明 Demo、Resin、Italia／Stagioni d'Italia、Quadra等是 siblings；只导航、不创建未计划实体，不把2024八类列表或某支样本配置宣布为永恒完整taxonomy。

Demo文稿以 official current page/PDF 为 current authority，准确说明 glossy colored resin、clear grip、six colors与两组trim/nib；availability明确标为2026-07-21检索快照。Bertram 2020单列“当时资料”：C/C、steel nib、EF/F/M/B/italic、当时lineup和matching ink gift均带日期，不能用来补写当前缺失字段；不写未获来源直接支撑的尺寸、重量、容量或个人实测。

Resin文稿以 official exact page/current category锁定 B11-N、black resin、C/C、gold/chrome finish options与检索日availability。Pen Boutique只支撑2024 family/sibling与其文章内明确配置；如采用2011 FPN，只写有归属的community sample观察，不称专业来源、不迁移到B11-N current specs。三文均区分官方marketing、professional context、community observation与编辑推论，禁用虚构第一人称拥有/试写口吻。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; test -s .planning/content-research/aurora-ipsilon-family-phase115.md &amp;&amp; test -s .planning/content-research/aurora-ipsilon-demo-colors-phase115.md &amp;&amp; test -s .planning/content-research/aurora-ipsilon-resin-b11-n-phase115.md &amp;&amp; rg -l '/pen/aurora-ipsilon-demo-colors' .planning/content-research/aurora-ipsilon-family-phase115.md .planning/content-research/aurora-ipsilon-resin-b11-n-phase115.md | wc -l | tr -d ' ' | grep -qx '2' &amp;&amp; rg -l '/pen/aurora-ipsilon-resin-b11-n' .planning/content-research/aurora-ipsilon-family-phase115.md .planning/content-research/aurora-ipsilon-demo-colors-phase115.md | wc -l | tr -d ' ' | grep -qx '2' &amp;&amp; rg -l '/article/aurora-ipsilon' .planning/content-research/aurora-ipsilon-demo-colors-phase115.md .planning/content-research/aurora-ipsilon-resin-b11-n-phase115.md | wc -l | tr -d ' ' | grep -qx '2'</automated>
  </verify>
  <done>三份2k+中文文稿建立完整三向导航，并把family siblings、Demo current/2020、Resin exact/professional/community边界写清。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 建立三份数据包与事实图，原子安装 topology，按 current hash 发布并精确提交九文件</name>
  <files>scripts/data/phase115-aurora-ipsilon-family-current-pens.ts, scripts/apply-phase115-aurora-ipsilon-family-current-pens-content.ts, public/images/library/site-original/phase115/aurora/aurora-ipsilon-family.svg, public/images/library/site-original/phase115/aurora/aurora-ipsilon-demo-colors.svg, public/images/library/site-original/phase115/aurora/aurora-ipsilon-resin-b11-n.svg</files>
  <behavior>
    - Test 1: data module导出locked identities/slugs/names、source URLs、scope keys、article descriptor、两个CuratedEntityPack loaders和三条SVG paths；source locators/tiers/dates与D-04至D-07一致。
    - Test 2: 三张1600x900 SVG的path/title/content hash不同，分别表达family sibling map、Demo six-color/two-trim matrix、Resin current/source boundary；均明确non-photo/non-logo/non-scale/non-color-proof/non-finish-proof。
    - Test 3: repo/root/reviewer/env/path/migration、Phase 114 baseline、route与duplicate prerequisites首写前完成；失败时owned digest不变。
    - Test 4: 一个identity/topology transaction创建article和two pens，只建立两个pens各自唯一made_by；随后article payload和两个target-owned packs安装，三页current-hash reviews/publication按各自contract完成。
    - Test 5: Aurora non-topology digest不变且hash只由exact two links改变；对post-topology hash review/publish，无brand replay。terminal state完整才noop，tampered state不修复。
  </behavior>
  <action>
按 D-01 至 D-14 创建 phase-local data/apply modules与三张unique factual SVG。data source registry固定retrieved=`2026-07-21`：Demo official category + PDF同属Aurora official independence group；Bertram标 professional_secondary、Adam L.、2020-08-06；Resin exact/current category同属Aurora official；Pen Boutique标 professional_secondary、Laura Petix、2024-07-30；FPN若使用则标forum/community、2011 sample。可变availability与dated lineup使用独立scope，不进入跨期stable spec。

apply以Phase 114为直接analog，不修改shared publication/curated-content/redirect infrastructure。首写前完成verified repo pair、caller-owned DB、migration032、Phase114 terminal baseline、三目标exact duplicate/URL owner/source marker/route preflight与protected digests。首次只接受三目标全部absent；replay只接受三目标完整terminal。任何partial、alternate、generic Ipsilon owner或legacy route都fail closed。

在单一identity/topology transaction创建article与two pens，article没有maker；每pen只插入`made_by -> CJXe8UpnkHLJ`并依现有机制核对reverse。随后安装article sourced story/reference/media/taxonomy和两个target-owned packs；三页分别写fact/language/media review，pens调用`publishEntity`，article沿既有article public branch。捕获Aurora pre-hash与non-topology digest，加入exact two links后验证expected delta，再对post-topology Aurora hash重做reviews并`publishEntity`；不得调用Phase48/114 brand pack、不得直接SQL写review/lifecycle/public tables。terminal assertions覆盖三identity、sources/scopes/exclusions、three-way body links、unique primary media、topology、hash/reviews/publication、route unchanged及四个protected entities，完全满足才返回三项noop。

三张SVG为本站原创信息图，不能临摹官方产品图或logo；family显示sibling branches，Demo显示六色分为chrome/stainless与gold/gold-plated-steel两组，Resin显示exact B11-N current facts和外部dated/sample边界。颜色仅作版式编码，不宣称真实产品色准。

定向test、tsc、owned TS Biome、三SVG XML与九路径diff check通过后处理Git：要求index预先为空，只显式stage frontmatter九路径；若` scripts/data/`的exact file被既有unanchored ignore命中，只对该文件使用`git add -f`。比较cached path set与cached diff，异常时只撤销本包九路径staging并停止。禁止wide add、glob add、stash、clean、reset、checkout、force或覆盖unrelated dirty/untracked。

提交`feat(content): publish Aurora Ipsilon family and current pens`，再以`git show --name-only --format=`证明唯一产品commit恰含九个frontmatter paths。PLAN、SUMMARY与其它docs不进产品提交；产品提交后才按execute workflow写本quick目录`SUMMARY.md`，记录IDs/routes、source locators与scope exclusions、Aurora pre/post hash/no replay、single setup、tamper/noop、protected snapshots、验证命令、commit hash及partial-batch声明。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase115-aurora-ipsilon-family-current-pens.ts scripts/apply-phase115-aurora-ipsilon-family-current-pens-content.ts tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase115/aurora/aurora-ipsilon-family.svg public/images/library/site-original/phase115/aurora/aurora-ipsilon-demo-colors.svg public/images/library/site-original/phase115/aurora/aurora-ipsilon-resin-b11-n.svg &amp;&amp; git diff --check -- .planning/content-research/aurora-ipsilon-family-phase115.md .planning/content-research/aurora-ipsilon-demo-colors-phase115.md .planning/content-research/aurora-ipsilon-resin-b11-n-phase115.md scripts/data/phase115-aurora-ipsilon-family-current-pens.ts scripts/apply-phase115-aurora-ipsilon-family-current-pens-content.ts tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts public/images/library/site-original/phase115/aurora/aurora-ipsilon-family.svg public/images/library/site-original/phase115/aurora/aurora-ipsilon-demo-colors.svg public/images/library/site-original/phase115/aurora/aurora-ipsilon-resin-b11-n.svg</automated>
  </verify>
  <done>三页、三图、双maker topology、Aurora current-hash恢复、single-setup tamper/noop与protected catalog全部通过；唯一产品commit精确九文件。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Ipsilon family -> sibling pens | 同名家族的Demo、Resin、Italia、Quadra不能被压成共享规格的单一pen或variants。 |
| Demo official current/PDF -> dated professional article | 当前六色/饰件与2020 C/C、尖宽、赠墨属于不同日期与authority；旧资料不能补写当前缺口。 |
| Resin exact listing -> family/professional/community context | B11-N current facts只能来自exact official scope；2024 sibling文章和2011 sample不能冒充exact配置。 |
| Body navigation -> graph topology | 三页互链是正文导航；只有two pens -> Aurora是maker topology，article与pen-to-pen不得产生关系边。 |
| Maker topology -> Aurora publication | 两条新增关系改变brand contract hash，旧reviews不能复用，亦不能replay旧brand pack覆盖现状。 |
| Caller/repo alias -> catalog | repo alias、DB path、reviewer/env与owned root来自caller；错误authority可能污染真实catalog。 |
| Dirty worktree -> product commit | 工作树已有unrelated modified/untracked；宽泛staging会把用户内容带入产品提交。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-115-01 | Spoofing | exact Ipsilon identities/source owners | high | mitigate | Task 1/3在首写前对ID/slug/name/alias/source_url/reference owner/source marker/route做exact inventory；任何alternate或generic owner fail closed。 |
| T-115-02 | Tampering | source scope qualification | high | mitigate | Task 1/2/3以结构化scope/citation/evidence区分current、2020、2024与2011；dated/sample facts不能qualify current fields。 |
| T-115-03 | Repudiation | reviews/publication | high | mitigate | Task 3记录reviewer与current content hash，Aurora和two pens只经review APIs + publishEntity发布；SUMMARY记录hash、commands与commit。 |
| T-115-04 | Information Disclosure | dirty/untracked worktree | medium | mitigate | Task 3只stage九个owned paths，并核对cached path set；不读取、提交或清理unrelated内容。 |
| T-115-05 | Denial of Service | terminal replay/tamper | medium | mitigate | Task 1/3要求完整terminal才noop；partial/tampered state fail closed且不自动repair/review，避免反复扩大写集。 |
| T-115-06 | Elevation of Privilege | repo/database authority | critical | mitigate | Task 1/3验证CodeBuddy/Documents pair、caller-owned containment、realpath/inode、PRAGMA path、migration032与protected main/WAL/SHM snapshots。 |
| T-115-07 | Tampering | Aurora post-topology publication | critical | mitigate | Task 1/3验证non-topology digest不变、exact two-link delta与post-topology hash，再重审publish；禁止brand replay/direct lifecycle writes。 |
| T-115-08 | Tampering | product commit | high | mitigate | Task 3要求空index、精确stage九路径、cached diff审计与post-commit path proof；异常只unstage owned paths并停止。 |
| T-115-SC | Tampering | package supply chain | low | accept | 本计划无package install或dependency变更；保留现有lockfile与工具链不变。 |

</threat_model>

<source_audit>

| SOURCE | ID | Feature/Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 一个Ipsilon family article + Demo Colors与Resin B11-N两个current pens，完整导航和安全发布 | 1-3 | COVERED | identity、content、media、topology、review/publish、noop、catalog/commit protection全覆盖。 |
| REQ | QUICK-260721-L94 | Phase 115 Aurora Ipsilon family navigation/current pens partial batch | 1-3 | COVERED | frontmatter requirement映射到全部tasks。 |
| RESEARCH | R-01 | Demo official current page/PDF的six colors、clear section、two trim/nib groups、availability snapshot | 1-3 | COVERED | D-04 current scope，无虚构尺寸。 |
| RESEARCH | R-02 | Bertram 2020 C/C、steel nib、EF/F/M/B/italic、matching ink gift需dated隔离 | 1-3 | COVERED | D-05，禁止转移旧lineup/gift/current stock。 |
| RESEARCH | R-03 | Resin official exact B11-N black resin、C/C、gold/chrome options与availability | 1-3 | COVERED | D-06 exact current scope。 |
| RESEARCH | R-04 | Pen Boutique professional family/sibling context；FPN 2011仅community sample | 1-3 | COVERED | D-07，配置保持exact/datetime/sample scope。 |
| RESEARCH | R-05 | Phase 114 article visibility、caller-owned authority与Aurora post-topology review/publish pattern | 1,3 | COVERED | direct analog，不抽shared infra。 |
| CONTEXT | D-01 | verified repo pair + caller-owned protected DB | 1,3 | COVERED | authority与snapshots。 |
| CONTEXT | D-02 | 三exact-new identities + live duplicate preflight | 1,3 | COVERED | collision fail closed。 |
| CONTEXT | D-03 | sibling lines而非共享spec variants | 1-3 | COVERED | family导航和scope assertions。 |
| CONTEXT | D-04 | Demo official current facts | 1-3 | COVERED | official/PDF exact locators。 |
| CONTEXT | D-05 | Demo professional dated boundary | 1-3 | COVERED | 2020 facts不升级。 |
| CONTEXT | D-06 | Resin B11-N official exact facts | 1-3 | COVERED | current scope和mutable availability。 |
| CONTEXT | D-07 | Resin professional/community boundary | 1-3 | COVERED | Pen Boutique/FPN tiers分离。 |
| CONTEXT | D-08 | three 2k+ pages、all-links、three unique SVGs | 1-3 | COVERED | content/media contracts。 |
| CONTEXT | D-09 | article no maker；two pens made_by Aurora | 1,3 | COVERED | exact two-link topology。 |
| CONTEXT | D-10 | protected Aurora pages + brand post-topology re-review/publish | 1,3 | COVERED | non-topology digest/no replay。 |
| CONTEXT | D-11 | single-setup、tamper/noop | 1,3 | COVERED | caller-owned fixtures。 |
| CONTEXT | D-12 | no legacy route means route allowlist unchanged | 1,3 | COVERED | collision stops instead of inventingredirect。 |
| CONTEXT | D-13 | dirty protection + exact nine-file product commit | 3 | COVERED | PLAN/SUMMARY后置。 |
| CONTEXT | D-14 | no product/shared infra/Playwright/search/LLM；partial batch | 1-3 | COVERED | scope exclusions明确。 |

Deferred/excluded: legacy redirect creation without a real legacy owner, other Ipsilon sibling entities, production migration, full Aurora/Ipsilon corpus, full-site acceptance, shared readiness/search/LLM, Playwright, package installs and shared infrastructure are outside this partial batch. Source audit has no missing items.

</source_audit>

<pre_mortem>

1. **最可能失败：generic Ipsilon 名称或official URL已有隐藏owner，首次apply制造duplicate。** Mitigation: Task 1/3对entities/aliases/references/source markers/routes做live exact inventory，候选逐项报告并首写前fail closed。
2. **最可能失败：2020赠墨/尖宽或2011样本细节被写成2026 current稳定规格。** Mitigation: D-04至D-07的独立scope、structured qualification tests与current-field exclusion。
3. **最可能失败：三向正文链接被误实现为graph topology，或article获得maker。** Mitigation: Task 1/3对正文routes与entity_links分别计数，terminal只接受two exact maker pairs。
4. **最可能失败：新增maker使Aurora hash变化，却复用Phase 114 review或replay旧brand pack。** Mitigation: brand pre/post hash、non-topology digest、expected two-link delta、current-hash reviews + publishEntity、no-replay assertion。
5. **最可能失败：测试或提交污染真实catalog/脏工作树。** Mitigation: verified repo pair、caller-owned DB gates、protected sidecar snapshots、空index、显式九路径allowlist与post-commit proof。

Reachability is complete: Phase 114 public Aurora baseline -> exact three-target duplicate preflight -> new family article + two distinct pen identities -> three reviewed content/media payloads -> exact two made_by links -> Aurora expected post-topology hash -> current-hash reviews + publishEntity -> article visibility and pen public_entities -> three-way body navigation. No artifact depends on a legacy route, new sibling entity, shared-infra change, package install, protected-catalog write or later production rollout.

</pre_mortem>

<verification>

1. `node --import tsx --test tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts` passes entirely on caller-owned checkpoint copies and proves protected main/WAL/SHM equality.
2. Three unique identities/routes are public; each body is at least 2,000 Unicode characters, each summary is 60-160, each has one unique approved primary SVG, and every page links the other two.
3. Demo current and 2020 scopes, Resin exact/professional/community scopes remain structurally separate; no dated/sample-only field qualifies a current stable spec or availability.
4. Exactly two made_by pairs connect the pens to Aurora; article and pen-to-pen topology are absent. Aurora non-topology payload is unchanged and publication reviews bind the exact post-topology current hash.
5. First apply publishes three targets; pristine replay returns three noop outcomes; duplicate, identity/source/scope/media/link/review/publication and authority tamper fixtures fail closed.
6. `tsc`, owned-file Biome, three SVG XML checks and nine-path diff checks pass; `src/lib/entity-redirects.ts` and all existing product files remain unchanged.
7. The product commit subject is exactly `feat(content): publish Aurora Ipsilon family and current pens`, its path set equals the nine frontmatter paths, and unrelated dirty/untracked content remains unstaged and unchanged.

</verification>

<success_criteria>

- Aurora Ipsilon family article、Demo Colors current pen与Resin B11-N current pen以三条新canonical routes公开且互相可达。
- 官方current、professional dated/family与community sample证据保持可审计边界；没有虚构尺寸或跨line共享spec。
- 只有two pens连接Aurora；brand在post-topology hash重审恢复，Aurora/Optima/88 family/Resina 800与route allowlist保持保护状态。
- caller-owned safety、single-setup、tamper/noop、TypeScript/Biome/XML/diff与repo alias gates全部通过。
- 唯一产品提交精确九文件；PLAN/SUMMARY/docs后续另行记录，并诚实声明Phase 115是partial batch。

</success_criteria>

<output>
Create `.planning/quick/260721-l94-phase-115-aurora-ipsilon-family-navigati/SUMMARY.md` after the product commit; keep PLAN/SUMMARY/docs outside that product commit.
</output>
