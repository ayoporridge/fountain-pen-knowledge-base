---
phase: 114-aurora-88-family-and-ottantotto-resina-800
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/content-research/aurora-88-family-phase114.md
  - .planning/content-research/aurora-ottantotto-resina-800-phase114.md
  - scripts/data/phase114-aurora-88-family-ottantotto-resina-800.ts
  - scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content.ts
  - tests/content/phase114-aurora-88-family-ottantotto-resina-800.test.ts
  - src/lib/entity-redirects.ts
  - public/images/library/site-original/phase114/aurora/aurora-88-family.svg
  - public/images/library/site-original/phase114/aurora/aurora-ottantotto-resina-800.svg
autonomous: true
requirements:
  - QUICK-260721-KDM
must_haves:
  truths:
    - "Aurora 88 的既有稳定身份 s41AURORA88 被原位重分类为 /article/aurora-88 系列导航；旧 /pen/aurora-88 永久跳转到该 article，且 article 没有 made_by/reverse 或 pen-only payload。"
    - "Aurora Ottantotto Resina (800) 以唯一新 pen 身份 phase114-aurora-ottantotto-resina-800、slug aurora-ottantotto-resina-800 发布，并只连接既有 Aurora brand CJXe8UpnkHLJ。"
    - "两个 2,000+ Unicode 字符页面互相链接；1947-to-modern family、2026-07-21 current official listing 与 2007 800/C sample 的证据 scope 不混用。"
    - "Phase 41/48 Aurora brand 与 Optima 内容保持不变；maker topology 改变后 Aurora brand 只在精确 post-topology current hash 上重审并重新发布。"
    - "全部写入只发生在 caller-owned checkpoint copy；首次 apply 发布、pristine replay noop、tampered terminal state fail closed，真实 catalog main/WAL/SHM 不变。"
    - "唯一产品提交精确包含 frontmatter 的八个产品路径；PLAN/SUMMARY/docs 后置，unrelated dirty/untracked 原样保留，并如实声明 partial batch。"
  artifacts:
    - path: "scripts/data/phase114-aurora-88-family-ottantotto-resina-800.ts"
      provides: "锁定 IDs/slugs、family/current/sample sources、双 scope、exact 800 CuratedEntityPack 与两个 SVG contracts"
    - path: "scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content.ts"
      provides: "phase-local authority、reclassification、topology、brand re-review、pen install/publish 与 terminal noop"
    - path: "tests/content/phase114-aurora-88-family-ottantotto-resina-800.test.ts"
      provides: "Phase 41/48 baseline、route、identity、scope、publication、tamper/noop 与 protected-catalog integration regression"
    - path: "src/lib/entity-redirects.ts"
      provides: "pen/aurora-88 -> /article/aurora-88 的 308 allowlist"
  key_links:
    - from: "src/lib/entity-redirects.ts"
      to: "src/middleware.ts"
      via: "既有 getReclassifiedArticlePath middleware 分支"
      pattern: "pen/aurora-88.*article/aurora-88"
    - from: "scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content.ts"
      to: "scripts/data/phase114-aurora-88-family-ottantotto-resina-800.ts"
      via: "locked constants、article sources 与 loadCuratedEntityPack"
      pattern: "PHASE114_|loadCuratedEntityPack"
    - from: "Aurora 88 article"
      to: "Aurora Ottantotto Resina 800 pen"
      via: "正文 /pen/aurora-ottantotto-resina-800；pen 正文反向链接 /article/aurora-88"
      pattern: "aurora-(88|ottantotto-resina-800)"
---

<objective>
把 Phase 41/48 错当成单一 `pen` 的 Aurora 88 原位改成 1947 至今的 family/article 导航，同时新建并发布当前具体 Aurora Ottantotto Resina (800) canonical pen。

Purpose: 修复系列与具体 SKU 的身份污染，让旧链接可达、证据 scope 可审计，并保持既有 Aurora brand／Optima 与真实 catalog 安全。
Output: 两篇 sourced content、两个原创 SVG、phase-local data/apply/integration test、一个精确 route-map 条目与八文件产品提交。
</objective>

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@scripts/apply-phase41-identity-cleanup-content.ts
@scripts/data/phase41-identity-cleanup.ts
@tests/content/phase41-identity-cleanup.test.ts
@scripts/apply-phase48-waterman-aurora-content.ts
@scripts/data/phase48-waterman-aurora.ts
@tests/content/phase48-waterman-aurora.test.ts
@scripts/apply-phase104-wancher-dream-pen-navigation-content.ts
@tests/content/phase104-wancher-dream-pen-navigation.test.ts
@scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts
@tests/content/phase112-wancher-dream-pen-titanium-black.test.ts
@scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content.ts
@src/lib/entity-redirects.ts
@src/middleware.ts

<interfaces>
- Existing identities: Aurora brand `CJXe8UpnkHLJ`; Aurora 88 donor/family `s41AURORA88`; Optima `5waoVLPHU2Pt`.
- Locked Phase 114 identity: article keeps `s41AURORA88` and slug `aurora-88`; exact pen uses ID `phase114-aurora-ottantotto-resina-800`, slug `aurora-ottantotto-resina-800`, canonical name `Aurora Ottantotto Resina (800)`.
- Route contract: add only `"pen/aurora-88": "/article/aurora-88"` to `RECLASSIFIED_ARTICLE_PATHS`; middleware already emits 308 before public visibility lookup.
- Publication contract: articles without `entity_publications` use the existing non-brand/non-pen branch of `public_entities`; brands/pens require contract-v3 current-hash reviews and `publishEntity`.
- Authority contract: accept only CodeBuddy/Documents repo inputs whose realpath and git top-level resolve to `/Users/xz/Documents/fountain-pen-graph`; database authority remains caller-owned copy + protected snapshot.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 锁定 Phase 114 单次 setup integration regression</name>
  <files>tests/content/phase114-aurora-88-family-ottantotto-resina-800.test.ts</files>
  <behavior>
    - Test 1: 一个 top-level setup 从 `copyCheckpointedCatalogToDisposableCopy` 建立并迁移 owned copy，按 Phase 41 -> Phase 48 顺序建立公开 Aurora/88/Optima baseline；确认 exact 800 target 尚不存在后，首次 Phase 114 apply 返回 article 与 pen published。
    - Test 2: `s41AURORA88` 原位变为公开 article `aurora-88`，没有 entity_publications、made_by/reverse、model spec/variant 或其它 pen-only payload；`getReclassifiedArticlePath("pen", "aurora-88")` 精确返回 `/article/aurora-88`，无数据库 redirect row。
    - Test 3: exact target ID/slug/name 唯一，只有 target -> Aurora made_by 与 Aurora -> target reverse；Aurora brand/Optima 非 topology payload与 Phase 48 source markers不变，旧 family maker pair消失。
    - Test 4: article 与 pen 各有 2,000+ Unicode 字符、唯一 approved primary SVG、approved references；article 链接 `/pen/aurora-ottantotto-resina-800`，pen 链接 `/article/aurora-88`。
    - Test 5: official history只支撑 1947 Marcello Nizzoli、跨代延续；current scope只支撑 exact 800 黑树脂、金色饰件、piston、EF/F/M/B 与 retrieved-date availability；FAQ 的 14K 只能在精确 locator 足够时进入 qualified current claim，否则停留在 family/high-end scope。
    - Test 6: 2007 FPN 800/C chrome-trim sample 独立保存 dated sample scope；chrome trim、claimed 1.8 ml、尺寸、手感和写感均不出现在 current 800 stable specs/claims。
    - Test 7: maker topology 变化后 Aurora brand hash 精确变化，旧 reviews 不复用；current hash 四类 review/public membership恢复。article/pen、Optima 和 brand 均满足 terminal assertions后 pristine replay才返回 noop。
    - Test 8: alternate exact identity/slug/alias/official URL owner、route collision、wrong family baseline、source/scope/media/link/review/publication tamper、remote selector、第三 repo root、protected/symlink/hard-link/path mismatch均在写入或 noop 前 fail closed；真实 main/WAL/SHM snapshot不变。
  </behavior>
  <action>
按 D-01 至 D-14 先写失败的单文件 integration test。直接复用 Phase 104 的 same-ID article reclassification/route semantics，以及 Phase 112/113 的 verified repo pair、caller-owned DB、brand pre/post hash、tamper/noop 和 single-setup组织方式；不要新增 hooks、第二 migration runner、Playwright、search、LLM 或 shared helper。

setup 只迁移一次并在同一 owned checkpoint copy 上执行 Phase 41、Phase 48、Phase 114；fault scenarios 从已准备 checkpoint 派生。baseline digest 必须覆盖 Aurora brand entity/story/source/reference/spec/media与 public reverse、`s41AURORA88` 全 payload/topology/publication、Optima 全 payload/topology/publication和 protected main/WAL/SHM。duplicate inventory 必须区分 official exact 800 URL 被旧 family/article引用的导航证据与任何 `pen` owner；只有 article reference可 allowlist，alternate pen identity必须拒绝。

把证据隔离写成结构断言而非只查正文关键词：current exact 800 scope与 2007 800/C sample scope具有不同 scope/source/citation/evidence；sample-only chrome trim、claimed capacity、measurements与体验不得 qualify current fields。测试也必须证明 two-way body navigation不是 topology，article 不获得 maker relation。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase114-aurora-88-family-ottantotto-resina-800.test.ts</automated>
  </verify>
  <done>失败回归完整锁定 same-ID article、exact 800 identity、route、双 scope、Aurora post-topology review、Optima保护、tamper/noop与 caller-owned safety。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: 编写 family/current/sample 证据包与两张原创事实图</name>
  <files>.planning/content-research/aurora-88-family-phase114.md, .planning/content-research/aurora-ottantotto-resina-800-phase114.md, scripts/data/phase114-aurora-88-family-ottantotto-resina-800.ts, public/images/library/site-original/phase114/aurora/aurora-88-family.svg, public/images/library/site-original/phase114/aurora/aurora-ottantotto-resina-800.svg</files>
  <behavior>
    - Test 1: 两篇 summary 为 60-160 Unicode 字符，body 各至少 2,000 Unicode 字符，并包含互相可达的 canonical route。
    - Test 2: family article以 Aurora official history与 Ottantotto category为主，准确写出 1947、Marcello Nizzoli、历史延续和当代 lineup导航，不制造跨世代共享 specs。
    - Test 3: exact pen只把 official exact listing的 SKU 800、黑色树脂、金色饰件、piston、EF/F/M/B作为 current facts；2026-07-21 availability只作可变快照，价格/库存不作 stable spec。
    - Test 4: FAQ/category 对 14K、high-end、piston/hidden reserve的陈述保留原 locator与适用层级；没有 exact 800 支撑时不得把 line-level 14K硬写进 exact stable nib field。
    - Test 5: FPN 2007 review明确标为 800/C chrome-trim sample；capacity、measurement、feel与writing experience只能是 sample-qualified narrative。
    - Test 6: 两张 1600x900 site-original SVG path、title、content hash不同，分别表达 family timeline/navigation和 exact-current-vs-2007-sample boundary；均非 logo、产品照片、比例图、颜色或 finish proof。
  </behavior>
  <action>
按 D-02 至 D-08 创建两篇 reviewed Markdown、两个 unique SVG与一个 phase-local data module。官方来源锁定 retrieval date `2026-07-21`：`https://aurorapen.it/la-nostra-storia/` 定位 1947 Marcello Nizzoli 与仍在生产的 family history；`https://aurorapen.it/categoria-prodotto/penne/ottantotto/` 定位 current collection/navigation；`https://aurorapen.it/shop/ottantotto-resina-stilografica/` 定位 exact 800、黑树脂、金色饰件、piston、EF/F/M/B 与当日 available；`https://aurorapen.it/faq/` 只按其明确的 high-end/88 14K 与 piston/hidden-reserve scope使用。FPN `https://www.fountainpennetwork.com/forum/topic/45704-aurora-88-modern/` 标记 published=2007、independent sample、800/C/chrome trim，403/live-fetch limitation记录在 locator，不伪装成 current product evidence。

data module导出 locked family/brand/Optima/target IDs与 slugs、source URLs、scope keys、article descriptor和 exact pen `CuratedEntityPack`/loader。current 800 spec只写被 exact source直接支撑的值；14K若只能由 FAQ 的系列层级支撑，写成 qualified family claim并从 exact stable nib field排除。正文不用第一人称拥有/实测口吻，也不把官方 marketing、2007 sample observation或 mutable availability升级为跨期事实。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase114-aurora-88-family-ottantotto-resina-800.test.ts &amp;&amp; pnpm exec biome check scripts/data/phase114-aurora-88-family-ottantotto-resina-800.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase114/aurora/aurora-88-family.svg public/images/library/site-original/phase114/aurora/aurora-ottantotto-resina-800.svg</automated>
  </verify>
  <done>family 与 exact 800 两篇 2k+ sourced content、双向链接、current/sample隔离和两张唯一原创 SVG 满足回归。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 原子重分类、重建 maker topology、current-hash 发布并精确提交八文件</name>
  <files>scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content.ts, src/lib/entity-redirects.ts</files>
  <behavior>
    - Test 1: repo/root/reviewer/env/path/migration、Phase 41/48 baseline、route与duplicate prerequisites全部在首写前完成；失败时 owned row digest不变。
    - Test 2: 单一 identity/topology transaction把 `s41AURORA88` 原位改成 article `aurora-88`，清除全部 donor-owned pen payload/publication/maker links，创建 exact target并建立唯一 maker/reverse pair；不改 Optima或 Aurora brand非 topology payload。
    - Test 3: transaction 后 Aurora contract hash只因 family pair移除与 target pair加入而变；用 current hash写 fact/language/media reviews并 `publishEntity`，不得 replay Phase 41/48 brand pack或直接 SQL 写 lifecycle/review/public tables。
    - Test 4: article安装 sourced story/reference/primary SVG与 taxonomy batch/action，保持无 entity_publications；exact pen用 loader安装自身 pack，current-hash review + `publishEntity`，route map只增加一个 308 pair。
    - Test 5: terminal state逐项验证 identities、source markers、no article maker/spec/publication、exact links、scopes/exclusions、unique media、current reviews/readiness/public membership、Optima/brand protection与 protected snapshots；完全满足才 noop。
  </behavior>
  <action>
按 D-01、D-09 至 D-14，以 Phase 104 same-ID reclassification和 Phase 112/113 guarded publication为直接 analog实现 phase-local apply；不抽取或修改 shared publication/curated-content infrastructure。repo authority只接受 CodeBuddy/Documents输入并解析到 Documents canonical root；DB authority另外拒绝 remote selectors、空 reviewer、owned-root外路径、protected main/sidecar、database symlink/hard-link、PRAGMA client/path mismatch与未迁移032副本。

preflight 精确验证 Aurora `CJXe8UpnkHLJ`、family donor `s41AURORA88`、Optima `5waoVLPHU2Pt` 的 Phase 48 terminal baseline，以及 target ID/slug/name/alias、official exact URL owner、route collision和 Phase 114 markers。首次只接受旧 family 是 `pen/aurora-88`且 target absent；replay只接受完整 terminal article+target。禁止模糊 donor、alternate merge、自动 repair/retire/redirect。

在一个 identity/topology transaction中清除 family donor自有旧 story/reference/source marker/alias/claim/citation/evidence/spec/variant/timeline/media/publication与 maker/reverse，保留同一 entity ID并写为 article；创建 exact pen identity和唯一 target <-> Aurora pair，同时写 taxonomy batch/action。随后安装 article导航 payload与 exact pen pack。捕获 Aurora pre-hash、非 topology digest、Optima digest；transaction后验证只有预期两个 topology delta，再对 post-topology Aurora hash重写三类 content review并调用 `publishEntity`，exact pen同样走 current-hash reviews + `publishEntity`。article保持无 publication row并依既有 article visibility branch公开。

在 `RECLASSIFIED_ARTICLE_PATHS` 只增加 `pen/aurora-88` 到 `/article/aurora-88`，不新增 redirect subsystem。定向测试、tsc、owned TS Biome、双 SVG XML与八路径 diff check全部通过后处理 Git：要求 index预先为空，仅显式 stage frontmatter八路径；若 `scripts/data/` 被 unanchored ignore命中，只对该 exact data file使用 `git add -f`。比较 cached path set与 cached diff，异常时只撤销本包八路径 staging并停止。禁止 `git add .`、glob add、stash、clean、reset、checkout、force或覆盖 unrelated dirty/untracked。

提交 `feat(content): reclassify Aurora 88 family and publish Resina 800`，再用 `git show --name-only --format=` 证明唯一产品 commit恰含八个 frontmatter paths。PLAN、SUMMARY与其它 docs不进产品提交；产品提交后才按 execute workflow写本 quick目录 `SUMMARY.md`，记录 IDs/routes/source locators、family/current/sample boundaries、brand hash/no replay、single setup、tamper/noop、protected snapshot、验证命令、commit hash与 partial-batch声明。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase114-aurora-88-family-ottantotto-resina-800.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase114-aurora-88-family-ottantotto-resina-800.ts scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content.ts tests/content/phase114-aurora-88-family-ottantotto-resina-800.test.ts src/lib/entity-redirects.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase114/aurora/aurora-88-family.svg public/images/library/site-original/phase114/aurora/aurora-ottantotto-resina-800.svg &amp;&amp; git diff --check -- .planning/content-research/aurora-88-family-phase114.md .planning/content-research/aurora-ottantotto-resina-800-phase114.md scripts/data/phase114-aurora-88-family-ottantotto-resina-800.ts scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content.ts tests/content/phase114-aurora-88-family-ottantotto-resina-800.test.ts src/lib/entity-redirects.ts public/images/library/site-original/phase114/aurora/aurora-88-family.svg public/images/library/site-original/phase114/aurora/aurora-ottantotto-resina-800.svg</automated>
  </verify>
  <done>same-ID article、exact 800、route、Aurora current-hash恢复、single-setup tamper/noop与 protected catalog均通过；唯一产品 commit精确八文件。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Official history/category -> family | 1947 origin与current collection说明不能被压成一支跨世代共享规格的 pen。 |
| Exact official listing -> current 800 | availability/price会变化；nib material若只有FAQ系列级支撑，不能冒充 exact SKU stable fact。 |
| 2007 FPN sample -> current 800 | 800/C chrome-trim sample的capacity、measurement与体验不能迁移到2026 gold-trim 800。 |
| Family reclassification -> public route | 同一 slug换 namespace；旧 `/pen/aurora-88` 必须先308，不能被 visibility 404吞掉。 |
| Maker topology -> Aurora publication | 移除 family maker并新增 exact maker会改变 brand contract hash，旧 approvals不能复用。 |
| Caller/repo alias -> catalog | repo alias、DB path、snapshot、reviewer/env由caller输入；错误authority可能污染真实catalog。 |
| Dirty worktree -> product commit | unrelated modified/untracked已存在；宽泛staging会污染交付。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-114-01 | Tampering | family identity | critical | mitigate | Tasks 1/3锁定同一 `s41AURORA88`、清除pen-only payload与maker、记录taxonomy action并验证article terminal。 |
| T-114-02 | Spoofing | official current facts | high | mitigate | Task 2锁定exact URL/retrieved date/locators；mutable availability不进入stable spec。 |
| T-114-03 | Tampering | 14K claim | high | mitigate | Tasks 1/2要求exact支撑才qualify current nib；否则只保留FAQ family/high-end scope。 |
| T-114-04 | Tampering | 2007 800/C sample | critical | mitigate | Tasks 1/2结构隔离sample scope并排除chrome trim、1.8 ml、measurements与体验迁移。 |
| T-114-05 | Tampering | identity/source collision | critical | mitigate | Tasks 1/3仅allowlist family/article reference；任何alternate pen ID/slug/alias/URL/marker首写前fail closed。 |
| T-114-06 | Elevation of Privilege | Aurora/pen publication | critical | mitigate | Task 3验证精确 topology delta与brand非 topology不变，再以current hash review + `publishEntity`；禁止brand replay和direct publication writes。 |
| T-114-07 | Spoofing | legacy route | high | mitigate | Tasks 1/3只增一个route-map pair并测试middleware contract、无DB redirect row。 |
| T-114-08 | Information Disclosure | remote credentials | high | mitigate | apply拒绝remote selectors，不读取/打印token，本计划不新增secret。 |
| T-114-09 | Denial of Service | duplicate setup/migration | medium | mitigate | Task 1单top-level setup/migration，fault scenarios从checkpoint派生。 |
| T-114-10 | Tampering | exact product commit | high | mitigate | Task 3空index、八路径allowlist、cached diff和post-commit path proof；docs later并保护dirty/untracked。 |
| T-114-11 | Denial of Service | scope expansion | low | accept | partial batch只含family+exact 800与定向integration；不加shared infra、Playwright、search或LLM。 |
| T-114-SC | Tampering | package supply chain | low | accept | 不安装/升级npm、pip、cargo package；若出现安装需求立即停止并重新规划。 |

</threat_model>

## Source Coverage Audit

| SOURCE | ID | Feature / Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 将错误Aurora 88 pen改为family article并发布exact current 800 | 1-3 | COVERED | identity/content/media/route/topology/publication/guards完整覆盖。 |
| REQ | QUICK-260721-KDM | Phase 114 partial-batch交付 | 1-3 | COVERED | 单计划三任务。 |
| RESEARCH | R-01 | Phase 104 same-ID article与legacy route analog | 1,3 | COVERED | `s41AURORA88`原位重分类，route map 308。 |
| RESEARCH | R-02 | Phase 112/113 single-setup、repo alias、brand post-topology hash、tamper/noop | 1,3 | COVERED | caller-owned与current-hash publication。 |
| RESEARCH | R-03 | Phase 41/48 IDs、Aurora brand/Optima baseline | 1,3 | COVERED | preserve brand/Optima，修复旧88 donor。 |
| CONTEXT | D-01 | family保留ID `s41AURORA88`，canonical article slug `aurora-88` | 1,3 | COVERED | 不换 identity。 |
| CONTEXT | D-02 | legacy `/pen/aurora-88` -> `/article/aurora-88` | 1,3 | COVERED | route map单条308。 |
| CONTEXT | D-03 | exact pen ID/slug/name锁定 | 1-3 | COVERED | `phase114-aurora-ottantotto-resina-800`。 |
| CONTEXT | D-04 | family与exact pen各2k+ sourced content并双向链接 | 1,2 | COVERED | article/pen正文导航。 |
| CONTEXT | D-05 | official 1947 Marcello Nizzoli family history | 1,2 | COVERED | history source定位。 |
| CONTEXT | D-06 | exact current 800黑树脂/金饰/piston/EF-F-M-B/availability | 1,2 | COVERED | current scope，availability dated mutable。 |
| CONTEXT | D-07 | FAQ/category的lineup/14K只在精确支撑时使用 | 1,2 | COVERED | qualified family或exact evidence gate。 |
| CONTEXT | D-08 | 2007 800/C sample不向current稳定规格迁移 | 1,2 | COVERED |独立sample scope与结构排除。 |
| CONTEXT | D-09 | 两张unique SVG | 1,2 | COVERED | family图与evidence-boundary图。 |
| CONTEXT | D-10 | maker Aurora；article无maker；保留Optima/brand | 1,3 | COVERED | exact topology与digest guards。 |
| CONTEXT | D-11 | brand post-topology current-hash re-review/publish | 1,3 | COVERED | 不replay brand pack。 |
| CONTEXT | D-12 | caller-owned、single setup、tamper/noop、protected catalog | 1,3 | COVERED | authority与terminal contract。 |
| CONTEXT | D-13 | no shared infra/Playwright/search/LLM；protect dirty/untracked | 1-3 | COVERED | phase-local与exact staging。 |
| CONTEXT | D-14 | exact八文件product commit，docs later，partial batch | 3 | COVERED | post-commit path proof与SUMMARY后置。 |

Deferred: 其它 Aurora 88/Ottantotto SKU、全站Aurora修复、production rollout、shared infra、Playwright、search/LLM与full-site acceptance不属于本partial batch。Source audit无缺项。

## Pre-Mortem and Reachability Check

1. **旧 `aurora-88` 同时是slug与旧pen route，重分类后被middleware visibility 404。** Mitigation: route allowlist在visibility前308，integration直接测 helper与public article。
2. **旧family maker移除、新800 maker加入后Aurora hash变化却沿用Phase48 approvals。** Mitigation: pre/post hash、精确link delta、current-hash reviews + `publishEntity`，禁止brand replay。
3. **2007 chrome-trim 800/C 的1.8 ml、尺寸或写感进入current gold-trim 800。** Mitigation:独立sample scope/citations与current-field exclusion断言。
4. **FAQ的系列级14K被写成exact SKU直接规格。** Mitigation: exact locator gate；证据不足时只作为family/high-end qualified claim。
5. **测试或提交污染真实catalog/dirty worktree。** Mitigation: verified repo pair、caller-owned copy、protected sidecar snapshots、single setup、空index与八路径allowlist。

Reachability: Phase 41/48 baseline -> exact inventory -> same-ID article + exact target topology transaction -> Aurora post-topology current-hash review/publish -> article sourced navigation + exact pen CuratedEntityPack/review/publish -> `public_entities` -> middleware 308 + mutual body links。所有路径均在本计划八文件与既有接口内可达。

<verification>

1. Phase 114定向integration在一个caller-owned setup/migration链通过，并证明真实main/WAL/SHM不变。
2. `s41AURORA88`公开为`/article/aurora-88`且无maker、publication或pen-only payload；旧pen route 308。
3. exact 800唯一公开、maker/reverse精确，双向正文链接与两个unique SVG可达。
4. official current、family history、2007 sample scopes可审计且禁止sample-to-current transfer；14K obeys exact-evidence gate。
5. Aurora brand在精确post-topology hash重审恢复，Optima与brand非 topology payload不变；tamper fail closed、replay noop。
6. TypeScript、Biome、XML与八路径diff通过；唯一产品commit精确八文件，docs后置且partial-batch表述准确。

</verification>

<success_criteria>

- Aurora 88成为保留原ID的系列导航article，旧pen URL可靠跳转；Aurora Ottantotto Resina (800)成为独立canonical pen。
- 两篇2k+ sourced content、两张唯一SVG、family/current/sample evidence boundaries与互链全部成立。
- Aurora maker topology与current-hash publication正确，article无maker，Phase41/48 Aurora brand和Optima无非预期变化。
- single-setup、authority、protected catalog、tamper/noop、route、TypeScript/Biome/XML/diff与精确八文件commit guards全部通过。

</success_criteria>

<output>
Create `.planning/quick/260721-kdm-phase-114-reclassify-aurora-88-as-family/SUMMARY.md` only after the exact eight-file product commit completes. Do not include PLAN.md, SUMMARY.md or any other docs in the product commit.
</output>
