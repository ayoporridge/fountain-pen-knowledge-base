---
phase: quick
plan: 260721-j51
slug: phase-112-wancher-dream-pen-titanium-black
type: execute
status: ready
wave: 1
depends_on: []
autonomous: true
created_at: 2026-07-21
requirements:
  - QUICK-260721-J51
files_modified:
  - .planning/content-research/wancher-dream-pen-titanium-black-phase112.md
  - scripts/data/phase112-wancher-dream-pen-titanium-black.ts
  - scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts
  - tests/content/phase112-wancher-dream-pen-titanium-black.test.ts
  - public/images/library/site-original/phase112/wancher/wancher-dream-pen-titanium-black.svg
must_haves:
  truths:
    - "Wancher Dream Pen Titanium Black 以新建且唯一的 canonical pen 身份发布；它复用既有 Wancher brand，但不复用、改写或重新分类 Phase 104 的 Dream Pen 系列导航 article。"
    - "读者能从 Titanium Black 正文进入 /article/wancher-dream-pen；该站内导航只存在于正文，不制造 article made_by、reverse 或产品同一性关系。"
    - "2026-07-21 官方 listing 的 titanium／black PVD、European International cartridge-converter、#6 JoWo matte-black steel nib、feed options 与 sold-out 状态只属于 retrieved-date current-listing scope；价格、库存和未来可售性不进入稳定 model spec。"
    - "kamitopen 2024 sample 的 154 mm、66.4 g、不后插、偏重与个人体验只属于披露 affiliate relationship 的 dated review scope；其 apparent original-titanium-nib configuration 与 current JoWo-only listing 保持未合并的 temporal/sample conflict。"
    - "新增 made_by topology 后，既有 Wancher brand 的非 topology payload 与 Phase 107 source marker 不变；reviews 绑定 post-topology current hash，再由 publishEntity 恢复品牌，不能 replay Phase 107 brand pack。"
    - "所有迁移、写入、review、publish、tamper 与 replay 只发生在 caller-owned checkpoint/disposable copy；首次 apply 发布一页，第二次 exact noop，真实 data/fpkg.db main/WAL/SHM 始终不变。"
    - "唯一产品提交精确包含本计划五个 owned 产品文件；PLAN/SUMMARY/docs 后续另行处理，所有 unrelated dirty/untracked 原样保留，并明确本轮只是 partial batch。"
  artifacts:
    - path: ".planning/content-research/wancher-dream-pen-titanium-black-phase112.md"
      provides: "至少 2,000 Unicode 字符的来源化中文 reviewed copy，含 current listing、2024 sample、temporal conflict 与系列导航"
    - path: "scripts/data/phase112-wancher-dream-pen-titanium-black.ts"
      provides: "单一 Titanium Black CuratedEntityPack、稳定 identity、source/scope/claim/spec/conflict/media 映射"
    - path: "scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts"
      provides: "verified repo pair + caller-owned DB authority、exact identity/source duplicate preflight、topology、brand/pen review-publish 与 terminal noop"
    - path: "tests/content/phase112-wancher-dream-pen-titanium-black.test.ts"
      provides: "Phase 104/107 baseline、scope conflict、brand hash recovery、tamper/noop、authority、protected catalog 与 exact commit contract 回归"
    - path: "public/images/library/site-original/phase112/wancher/wancher-dream-pen-titanium-black.svg"
      provides: "区分 current official listing 与 2024 reviewed sample 的本站原创事实示意图"
  key_links:
    - from: "scripts/data/phase112-wancher-dream-pen-titanium-black.ts"
      to: "scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts"
      via: "CuratedEntityPack、loadCuratedEntityPack、packId 与稳定 Phase 112 identity/source marker"
    - from: "scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts"
      to: "src/lib/publication.ts"
      via: "topology 固定后 recordEntityContentReview(fact/language/media) + publishEntity；Wancher brand 先恢复，Titanium Black 后发布"
    - from: "Wancher Dream Pen Titanium Black body_md"
      to: "/article/wancher-dream-pen"
      via: "正文中的站内 Markdown 链接；Phase 104 article payload、identity、route 与 taxonomy byte/logically stable"
    - from: "phase112-wancher-dream-pen-titanium-black"
      to: "eOfD77nOeENN"
      via: "唯一 pen -> Wancher made_by 与 Wancher -> pen reverse pair；public Wancher reverse 集合只新增 Titanium Black"
---

# Quick Task 260721-j51: Phase 112 Wancher Dream Pen Titanium Black

<objective>
在 Phase 104 的 Dream Pen 系列导航和 Phase 107 已公开 Wancher brand／True Ebonite 旁，新建并发布一个证据边界清楚的 Wancher Dream Pen Titanium Black 具体 SKU。官方 current listing 与 2024 日本评测样本分别保留自身时间、配置和体验 scope；当前 JoWo steel 配置不能与评测中的 apparent original titanium nib 混成一组规格。

Purpose: 让读者能从 Dream Pen 系列岔路进入一支可核实的钛金属／black PVD 产品，同时保持品牌、系列 article、历史样本和当前售罄 listing 的身份与时间边界。
Output: 一份 reviewed Markdown、一个 CuratedEntityPack、一个 caller-owned apply 入口、一份定向 integration 回归和一张本站原创双 scope 事实图。
</objective>

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/content-research/wancher-dream-pen-navigation.md
@scripts/apply-phase104-wancher-dream-pen-navigation-content.ts
@tests/content/phase104-wancher-dream-pen-navigation.test.ts
@.planning/quick/260721-fxu-phase-107-wancher-dream-pen-true-ebonite/260721-fxu-SUMMARY.md
@scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts
@scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts
@tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts
@.planning/quick/260721-ifj-phase-111-pilot-elabo-metal-fe-25sr-elab/SUMMARY.md
@scripts/apply-phase111-pilot-elabo-metal-resin-custom-ns-lightive-content.ts
@tests/content/phase111-pilot-elabo-metal-resin-custom-ns-lightive.test.ts
@scripts/lib/curated-content-pack.ts
@src/lib/publication.ts

<interfaces>
- `CuratedEntityPack` 通过 `markdownFile` 加载 `## summary`、`## body_md` 与可选 `## model_specs`；`loadCuratedEntityPack(workspaceRoot, pack)` 产生 digest/sourceMarker，`packId(pack, surface, key)` 产生稳定 payload ID。
- `recordEntityContentReview(db, { entityId, reviewKind, reviewer, status, notes })` 只写 fact/language/media；`publishEntity(db, { entityId, reviewer })` 生成 publication review 并安装 contract-v3 snapshot。禁止直接写 lifecycle、review、publication 或 public tables。
- Phase 104 固定 Wancher brand ID `eOfD77nOeENN`、Dream Pen article ID `2aoD07lwSYCV`、article slug `wancher-dream-pen` 与旧 `/pen/wancher万佳-dream-pen` 到 `/article/wancher-dream-pen` 的 route reclassification。
- Phase 104 已把 `https://www.wancherpen.com/products/dream-pen-titanium-black` 作为系列边界 source reference。Phase 112 duplicate preflight 必须允许该 exact URL 被既有 article 引用，但若任何既有 `pen` identity、pen alias/reference/source marker 或 target stable ID/slug 已代表 Titanium Black，则在首写前 fail closed；不能把 article 当 product donor，也不能创建 duplicate。
- Phase 107 已将 Wancher brand 按 contract-v3 发布，并建立 True Ebonite SKU。Phase 112 新增 made_by/reverse 会使 Wancher topology hash 改变；apply 必须保留 Phase 107 brand 非 topology payload/source marker，只为 expected post-topology current hash 重写 fact/language/media approvals 并调用 `publishEntity`，不得 replay brand pack。
- Phase 112 使用稳定 ID `phase112-wancher-dream-pen-titanium-black`、slug `wancher-dream-pen-titanium-black`、canonical name `Wancher Dream Pen Titanium Black`。若执行时 inventory 出现 alternate exact pen，停止并报告候选，不自动 merge、redirect、retire 或选 survivor。
- 官方 current source `https://www.wancherpen.com/products/dream-pen-titanium-black` 在 2026-07-21 listing 写明 titanium／black PVD、European International cartridge-converter、#6 JoWo matte-black steel nib 与 feed options；当前为 sold out。库存、价格、选项可售性均是 retrieved-date snapshot，不是稳定 spec 或未来承诺。
- 独立日文 review `https://kamitopen.jp/fountain-pen/wancher-dream-pen-titan-fountain-pen/` 是 2024 dated sample，带 affiliate disclosure；其 154 mm、66.4 g、不后插、偏重和写用体验只描述该样本。文章 apparent original-titanium-nib configuration 与当前 official JoWo-only listing 不同；在没有 revision evidence 前保留 unresolved temporal/sample conflict，绝不合并为 current spec。
- Repo authority 只接受已核验的输入 pair `/Users/xz/CodeBuddy/fountain-pen-graph` 与 `/Users/xz/Documents/fountain-pen-graph`，并要求 `realpath` 和 `git rev-parse --show-toplevel` 都落到 Documents canonical root。数据库 authority 独立验证 caller-owned containment、no symlink/hard-link、protected main/WAL/SHM snapshot、PRAGMA client/path 与 migration 032。
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 先锁定 exact identity、双时态 scope、Wancher hash 恢复与保护回归</name>
  <files>tests/content/phase112-wancher-dream-pen-titanium-black.test.ts</files>
  <behavior>
    - Test 1: 从 `copyCheckpointedCatalogToDisposableCopy` 建立并迁移至 032 的 owned copy，依次执行 Phase 104 与 Phase 107 fixture；确认 Wancher、Dream Pen article、True Ebonite 均已公开，official Titanium URL 只被 article 引用，catalog 中没有 exact Titanium Black pen，然后首次 Phase 112 apply 返回一项 published。
    - Test 2: 新 pen ID/slug/name 精确等于 Phase 112 常量，具有 60-160 Unicode 字符 summary、至少 2,000 Unicode 字符自然中文 body、qualified core claim、primary + professional-secondary 独立来源组、approved unique primary SVG 与 current-hash fact/language/media/publication reviews；readiness blocker_count=0。
    - Test 3: current official scope 只承载 titanium／black PVD、European International cartridge-converter、#6 JoWo matte-black steel nib、feed options 与 2026-07-21 sold-out snapshot；price/stock 不进入稳定 model spec。2024 review scope 才承载 154 mm、66.4 g、不后插、偏重和个人体验，并保存 affiliate disclosure。
    - Test 4: current JoWo steel 与 2024 sample apparent original titanium nib 建立 explicit temporal/sample conflict，保持 unresolved/uncertain 并分属不同 scope；sample measurements、nib 和主观体验不进入 current model specs，也不从当前页反推 2024 sample 的配置。
    - Test 5: Phase 104 article 的 entity/story/source/reference/media/taxonomy/publication digest、article route 与旧 pen route redirect 在 Phase 112 前后完全一致；新正文含 `/article/wancher-dream-pen` 链接，但 article 没有 made_by/reverse 或 target ownership 变化。
    - Test 6: Titanium Black 唯一 made_by 指向 `eOfD77nOeENN`，唯一 reverse 从 Wancher 指向该 pen；Wancher public reverse 集合相对 Phase 107 baseline 只新增 Titanium Black，True Ebonite topology 保持不变。
    - Test 7: topology transaction 前后 Wancher entity/story/source/reference/spec/media/source-marker 非 topology digest byte/logically equal；contract hash 仅因一个 exact link pair 改变，fact/language/media approvals 绑定 expected post-topology hash，随后 `publishEntity` 恢复品牌，不调用 Phase 107 pack loader。
    - Test 8: official URL 的既有 article reference 不触发 false duplicate；但 alternate exact pen name/slug/alias/source URL/marker、stable ID collision、错误 brand/article/True Ebonite baseline 或额外 maker 均在首个写事务前 fail closed，并用 disposable row digest 证明零部分写入。
    - Test 9: remote env、空 reviewer、第三个 repo root、repo pair 不能解析到同一 canonical git root、owned-root 外路径、protected path/sidecar、symlink/hard-link alias、client/path mismatch 与未迁移 copy 全部拒绝；只接受用户锁定的 CodeBuddy/Documents pair。
    - Test 10: maker、identity/source marker、scope/evidence、primary media、review/hash/publication 任一 tamper 都失败且不假报修复；第二次 pristine apply 返回 exact noop，hash/revision/review/link counts 不变；finally 后真实 data/fpkg.db main/WAL/SHM snapshot 不变。
  </behavior>
  <action>
按 D-01 至 D-13 先写失败 integration regression，以 Phase 107 的 Wancher/series fixture 与 Phase 111 的 repo-authority、brand post-topology hash、tamper/noop 模式为直接 analog。测试只在 caller-owned checkpoint/disposable copy 中执行 Phase 104、Phase 107 与 Phase 112；拍摄 article 全 payload、Wancher 非 topology payload/source marker、True Ebonite topology、public reverse 集合和 protected main/WAL/SHM before snapshots。不要运行或写回真实 catalog。

把 exact duplicate 语义写成结构断言：Phase 104 article 对 official Titanium URL 的 `entity_references` 是允许且必须保留的 series-navigation evidence，不是 existing product；任何 `pen` 对同 URL 的 entity/source/reference/alias/source-marker ownership 才是 alternate product collision。新 target 只能用锁定 stable ID/slug 首次创建，不能复用 `2aoD07lwSYCV`、True Ebonite 或任何模糊 Dream Pen donor。

对 current listing、2024 sample、affiliate disclosure、measurements、non-posting/heavy/personal experience 和 apparent titanium-nib conflict 使用 scope/citation/spec-level assertions，不用正文关键词数量代替 evidence wiring。测试必须证明 Wancher brand 在单 link-pair topology 后对 expected current hash 重审并经 publish API 恢复，且 Phase 107 brand pack 未 replay。不要添加 shared test runner、Playwright、search、LLM、generic readiness、full-site acceptance 或 production migration。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase112-wancher-dream-pen-titanium-black.test.ts</automated>
  </verify>
  <done>失败测试完整锁定新 SKU identity、article URL 例外、双时态 evidence、brand post-topology publish、repo/DB authority、tamper/noop、protected catalog 与 partial-batch 边界。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: 编写 Titanium Black evidence pack、2k+ 中文与唯一原创事实图</name>
  <files>.planning/content-research/wancher-dream-pen-titanium-black-phase112.md, scripts/data/phase112-wancher-dream-pen-titanium-black.ts, public/images/library/site-original/phase112/wancher/wancher-dream-pen-titanium-black.svg</files>
  <behavior>
    - Test 1: reviewed Markdown 满足 60-160 Unicode 字符 summary 与至少 2,000 Unicode 字符 body；正文自然、具体，并链接 `/article/wancher-dream-pen`，不复制 Phase 104 navigation 或 Phase 107 True Ebonite 正文。
    - Test 2: pack 只定义一个 exact Titanium Black pen；official document 使用 `wancher-official` primary independence group，kamitopen 使用独立 professional-secondary group并记录 2024 日期、sample context、affiliate disclosure，SVG 使用 editorial group。
    - Test 3: current model spec 只含 official current page 可稳定支持的 titanium/PVD、European International cartridge-converter、#6 JoWo matte-black steel nib 与 feed choices；sold-out 是 retrieved-date fact，mutable price/stock/future availability 不进入稳定 spec。
    - Test 4: 154 mm、66.4 g、non-posting、heavy 与个人写感只在 2024 sample scope；apparent original titanium nib 与 current JoWo steel 分别有 locator/citation/scope，并通过 explicit unresolved temporal/sample conflict 相连而不合并。
    - Test 5: SVG 以独立构图表现 current titanium/PVD/JoWo listing、2024 measured heavy non-posting sample 与 nib-configuration boundary；显著声明本站原创示意、非产品照片、非比例/颜色/表面复刻，不能只替换 Phase 107 图的标题或复制 Wancher logo/外站图片。
  </behavior>
  <action>
按 D-05 至 D-08 写一份来源化中文 reviewed copy。开头从黑色 PVD 钛笔身和“当前售罄页面仍能证明什么”切入，随后分开 current official listing、2024 kamitopen sample、两套笔尖叙述冲突、重量/不后插的使用含义、购买与二手核对、系列导航。官方 current facts 以 retrieval date `2026-07-21` 限定；sold out 可写成当日页面状态，价格不写具体数字，也不承诺恢复销售。review 的 154 mm/66.4 g、重感、不后插和写感只归因作者当时样本与个人体验，affiliate disclosure 不能省略或弱化。

data 文件按 D-02/D-03 导出 `PHASE112_WANCHER_ID`、`PHASE112_DREAM_ARTICLE_ID`、`PHASE112_TRUE_EBONITE_ID`、`PHASE112_TITANIUM_BLACK_ID`、`PHASE112_TITANIUM_BLACK_SLUG`、official/review URLs 与单一 `CuratedEntityPack`。每个 approved claim/spec/conflict/media 都有 source item、locator、citation、scope 和 independence metadata。official archiveLocator 诚实标记 `live-source-not-frozen;retrieved=2026-07-21`；review locator 保留日期与 affiliate disclosure，不把 live URL 伪称 frozen archive。

当前 #6 JoWo matte-black steel nib 只属于 official-current scope。kamitopen 对 original titanium nib 的叙述使用保守限定，进入 dated sample scope；若原文无法证明其 exact material/configuration，claim 保持 qualified/uncertain，不能补猜供应商、尖幅或 revision。用 `CuratedConflict` 保留 unresolved temporal/sample divergence，禁止把 2024 sample measurements 写入 current model spec，禁止声称 current listing 与 review 是同一生产批次。SVG 必须是本 SKU 独有的 editorial diagram，作为唯一 approved primary media。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; pnpm exec biome check scripts/data/phase112-wancher-dream-pen-titanium-black.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase112/wancher/wancher-dream-pen-titanium-black.svg &amp;&amp; node --import tsx --test tests/content/phase112-wancher-dream-pen-titanium-black.test.ts</automated>
  </verify>
  <done>单一 Titanium Black pack、2k+ 中文、qualified official + affiliate-disclosed review evidence、未合并的 nib conflict 与唯一 SVG 通过定向 contract-v3 回归。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现 caller-owned 发布、Wancher current-hash 恢复、guarded noop 与精确五文件提交</name>
  <files>scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts</files>
  <behavior>
    - Test 1: repo/root/reviewer/remote/path/migration、Phase 104/107 baseline 与 exact target duplicate prerequisites 全部在首个 write transaction 前完成；失败时 owned copy row digest 不变。
    - Test 2: identity/topology transaction 只创建或确认 Phase 112 target，建立唯一 pen -> Wancher made_by 与 Wancher -> pen reverse；不改变 article、True Ebonite 或其它 Wancher topology。
    - Test 3: topology 前后 Wancher 非 topology payload/Phase 107 marker unchanged，contract hash 精确变为 one-link-pair post-topology current hash；fact/language/media approvals 写给新 hash，再由 `publishEntity` 恢复品牌，不 replay brand pack。
    - Test 4: Titanium pack 在独立 transaction 安装 target-owned payload，随后 current-hash fact/language/media review + `publishEntity`；article URL 只作为正文导航和 source evidence，不产生 article topology。
    - Test 5: terminal state 同时核对 identity、source marker、exact maker/reverse、current/sample scopes、nib conflict、唯一 primary media、current hash/revision、四类 reviews、readiness/public membership、Wancher exact post-topology publication、article/True Ebonite protection与 protected snapshot；全部满足才返回一项 noop。
  </behavior>
  <action>
按 D-01/D-02/D-09 至 D-13，以 Phase 111 apply 为直接模式实现 phase-local options/constants/authority/preflight/brand digest/topology/install/review/publish/terminal flow；不要修改或抽取 shared infra。repo authority 仅接受 `/Users/xz/CodeBuddy/fountain-pen-graph` 和 `/Users/xz/Documents/fountain-pen-graph` 两个输入，且 `realpath` 与 `git -C <input> rev-parse --show-toplevel` 均须等于 Documents canonical root；不能把正常 symlink canonicalization 当 blocker，也不能接受第三个路径。

CLI 只接受显式 `--database`、`--owned-root`、`--protected-catalog` 与可选 reviewer。首写前拒绝 inherited `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`，空 reviewer、owned-root 外路径、protected main/sidecar、database symlink/hard-link、PRAGMA client/path mismatch 和未迁移 032 copy；每个 protected check 使用 caller 传入 snapshot，repo authority 与 DB authority 分开验证。

preflight 先验证 Wancher `eOfD77nOeENN`、Dream article `2aoD07lwSYCV`、Phase 104 reclassification、Phase 107 True Ebonite identity/source marker/publication。精确盘点 target ID/slug/name/alias、official product URL 的 entity/source/reference ownership 与 Phase 112 source marker：article reference 是 expected allowlisted navigation evidence；任何 pen owner 或 alternate exact identity 则 fail closed。首次只允许 target absent；replay 只允许 marker 精确属于 locked target terminal row。禁止自动 merge/redirect/retire/repair alternate identity。

在单一 identity/topology transaction 新建 target 并只保留 `target -> eOfD77nOeENN made_by` 与 `eOfD77nOeENN -> target reverse`。transaction 前捕获 Wancher current hash、Phase 107 source marker、entity/story/reference/spec/media 非 topology digest、article full digest、True Ebonite digest/relation；transaction 后要求 brand digest、article 和 True Ebonite byte/logically equal，brand post hash 只由 exact new pair 导致。对新 brand hash 调用 `recordEntityContentReview` 三类 review 后 `publishEntity`；不得调用 Phase 107 brand pack、不得直接 SQL 写 review/lifecycle/publication/public tables。

用 `loadCuratedEntityPack`/`packId` 在 target-owned transaction 安装 story/source/reference/alias/scope/claim/citation/evidence/spec/conflict/timeline/media，随后写 fact/language/media review 并调用 `publishEntity`。terminal noop 必须 fail closed 检查所有 identity/evidence/topology/review/publication/protection 条件，不能在 tampered terminal state 自动 reload、repair 或 re-review。

定向测试、`tsc --noEmit`、计划内 TypeScript Biome、SVG XML 和五路径 `git diff --check` 全部通过后才处理 Git。要求 index 预先为空；仅显式 stage frontmatter 五个产品路径，注意仓库 unanchored `data/` ignore 可能要求只对本计划的 `scripts/data/phase112-wancher-dream-pen-titanium-black.ts` 使用精确 `git add -f`。排序比较 cached path set、运行 cached diff check；集合异常只撤销本包五路径 staging 后停止。禁止 `git add .`、glob add、stash、clean、reset、checkout、force、删除或覆盖 unrelated dirty/untracked。

提交 `feat(content): publish Wancher Dream Pen Titanium Black`，再用 `git show --name-only --format=` 证明唯一产品 commit 恰含五个 frontmatter product paths。PLAN、SUMMARY 与其它 docs 不进入产品提交；产品提交完成后再按 execute workflow 写本 quick 目录 `SUMMARY.md`，记录 source locators/retrieval date、article URL duplicate exception、identity、nib temporal conflict、brand hash/no-replay、tamper/noop、protected snapshot、验证命令、commit hash及 partial-batch 声明。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase112-wancher-dream-pen-titanium-black.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase112-wancher-dream-pen-titanium-black.ts scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts tests/content/phase112-wancher-dream-pen-titanium-black.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase112/wancher/wancher-dream-pen-titanium-black.svg &amp;&amp; git diff --check -- .planning/content-research/wancher-dream-pen-titanium-black-phase112.md scripts/data/phase112-wancher-dream-pen-titanium-black.ts scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts tests/content/phase112-wancher-dream-pen-titanium-black.test.ts public/images/library/site-original/phase112/wancher/wancher-dream-pen-titanium-black.svg</automated>
  </verify>
  <done>Titanium Black 在 caller-owned copy 经 current-hash reviews/publish，Wancher brand 以 post-topology hash 恢复且不 replay，tamper/noop/protected catalog/alias gates 通过，唯一产品 commit 精确五文件。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Live official page -> current pack | 当前 Wancher listing 的产品事实、sold-out 状态、价格和选项会变化；只有 retrieved-date 可定位事实能进入 current scope。 |
| Japanese review -> dated sample | 2024 review 含 affiliate disclosure、样本测量与个人体验，其 apparent original titanium nib configuration 与当前 JoWo-only listing 不一致。 |
| Series article -> exact product identity | Phase 104 article 已引用 exact official URL；article evidence 必须保留，但不能被误当 SKU donor 或绕过 pen duplicate preflight。 |
| New made_by pair -> Wancher publication | migration 032 将 topology 纳入品牌 contract；旧 Phase 107 approvals 不能覆盖 post-topology hash。 |
| Caller/repo alias -> phase-local apply | repo root、database path、owned root、protected snapshot、reviewer/env 由 caller 提供；错误 alias 或 path 可能写入真实 catalog。 |
| Dirty worktree -> exact product commit | 工作区已有 unrelated modified/untracked；宽泛 staging 会污染产品提交或覆盖他人工作。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-112-01 | Spoofing | current official listing | high | mitigate | Task 2 锁定 exact Wancher URL、retrieved=2026-07-21 和 locators；价格/库存不进稳定 spec，sold-out 只作当日状态。 |
| T-112-02 | Spoofing | kamitopen review/sample | high | mitigate | Task 2 锁定 exact Japanese URL、2024 date、sample measurements、affiliate disclosure 与 professional-secondary independence group；主观体验明确归因作者。 |
| T-112-03 | Tampering | current/review nib configuration | high | mitigate | Tasks 1/2 用分离 scopes + unresolved `CuratedConflict` 保存 current JoWo steel 与 apparent original titanium nib；不补猜 revision/supplier，不合并规格。 |
| T-112-04 | Tampering | article URL duplicate exception | critical | mitigate | Tasks 1/3 allowlist Phase 104 article reference，但对任何 pen owner、alternate target ID/slug/alias/source marker 首写前 fail closed；article payload/route digest 必须不变。 |
| T-112-05 | Tampering | repo/database authority | critical | mitigate | Tasks 1/3 只接受 verified CodeBuddy/Documents pair；DB 另以 caller-owned containment、realpath/inode、no symlink/hard-link、PRAGMA path、migration 032 与 protected main/WAL/SHM snapshots 拒绝越权。 |
| T-112-06 | Elevation of Privilege | Wancher/pen publication | critical | mitigate | Task 3 验证 brand non-topology unchanged + exact post-topology hash，再对 current hash review并用 `publishEntity`；target 同路径，禁止 direct lifecycle/review/public writes 和 Phase 107 brand replay。 |
| T-112-07 | Repudiation | measurement/weight/non-posting claims | medium | mitigate | Tasks 1/2 要求 154 mm、66.4 g、heavy/non-posting/personal experience 全部绑定 2024 sample citation/scope，不能进入 current spec 或品牌普遍结论。 |
| T-112-08 | Information Disclosure | remote credentials | high | mitigate | apply 拒绝 remote selectors，不读取或打印 token；本 Phase 不消费凭据、不新增 secret。 |
| T-112-09 | Denial of Service | scope expansion | low | accept | 仅单一 integration test、tsc、owned-file Biome/XML/diff；不增加 Playwright、search、LLM、shared infra、full-site acceptance 或 production rollout。 |
| T-112-10 | Tampering | exact product commit | high | mitigate | 空 index、五文件显式 allowlist、cached diff 与 post-commit path proof；PLAN/SUMMARY/docs later，unrelated dirty/untracked 原样保留。 |
| T-112-SC | Tampering | package supply chain | low | accept | Phase 112 不安装或升级 npm、pip、cargo package；若执行中出现 package install 需求即停止并重新规划。 |

</threat_model>

## Source Coverage Audit

| SOURCE | ID | Feature / Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 一个 exact Wancher Dream Pen Titanium Black canonical page，链接既有 brand/article，证据 scope 与发布安全闭环 | 1-3 | COVERED | identity、content、media、topology、review/publish、noop、catalog/commit protection 全覆盖。 |
| REQ | QUICK-260721-J51 | Phase 112 Titanium Black partial-batch 交付 | 1-3 | COVERED | 单计划三任务完整覆盖。 |
| RESEARCH | R-01 | Phase 104 article identity/route 与 official Titanium URL navigation reference 保持不变 | 1,3 | COVERED | article URL 例外 + pen duplicate fail-closed。 |
| RESEARCH | R-02 | Phase 107 Wancher brand/True Ebonite baseline、CuratedEntityPack 与 exact SKU-to-series pattern | 1-3 | COVERED | 复用 brand，不 replay；body 链接 article。 |
| RESEARCH | R-03 | Phase 111 verified repo alias/canonical pair 与 post-topology brand current-hash recovery | 1,3 | COVERED | repo/DB authority 分离、non-topology digest、review/publish/noop。 |
| CONTEXT | D-01 | 仅允许 verified CodeBuddy alias / Documents canonical repo pair | 1,3 | COVERED | realpath + git-root proof；其它 root 拒绝。 |
| CONTEXT | D-02 | 新 stable Titanium Black ID/slug，不复用 article/True Ebonite | 1-3 | COVERED | exact new pen identity。 |
| CONTEXT | D-03 | exact name/slug/alias/source URL/source marker duplicate preflight | 1,3 | COVERED | article reference allowlisted，pen duplicate fail closed。 |
| CONTEXT | D-04 | 复用 Wancher brand 与 Dream Pen series-navigation article，不新建 series | 1,3 | COVERED | made_by/reverse + body navigation，article 不变。 |
| CONTEXT | D-05 | official titanium/PVD、European International C/C、#6 JoWo matte-black steel、feed options | 1,2 | COVERED | current official scope + stable specs。 |
| CONTEXT | D-06 | sold-out/current price instability 的 retrieval-date scope | 1,2 | COVERED | sold-out 作 2026-07-21 fact；价格/库存不作稳定 spec。 |
| CONTEXT | D-07 | kamitopen 2024 sample、affiliate disclosure、154 mm/66.4 g、non-posting/heavy/personal experience | 1,2 | COVERED | dated sample + professional-secondary scope。 |
| CONTEXT | D-08 | apparent original titanium nib 与 current JoWo-only 的 temporal/sample conflict，不合并 spec | 1,2 | COVERED | explicit unresolved/uncertain CuratedConflict。 |
| CONTEXT | D-09 | 2k+ natural Chinese CuratedEntityPack + unique SVG | 1,2 | COVERED | 单页 pack、qualified evidence、独立主图。 |
| CONTEXT | D-10 | caller-owned DB、review/publish APIs、tamper/noop/protected catalog | 1,3 | COVERED | migration 032、current hashes、protected snapshots。 |
| CONTEXT | D-11 | no shared infra/Playwright/search/LLM | 1-3 | COVERED | phase-local implementation与定向验证。 |
| CONTEXT | D-12 | protect all dirty/untracked、exact product commit、docs later | 3 | COVERED | 五文件 allowlist与 post-commit proof。 |
| CONTEXT | D-13 | partial batch only | 3 | COVERED | SUMMARY 明示不代表 Wancher/Phase 23/全站完成。 |

Deferred ideas: production migration, remaining Wancher/Dream Pen models, full-site acceptance, generic readiness/search/LLM, Playwright and shared infrastructure are outside this partial batch. Source audit has no missing items.

## Pre-Mortem and Reachability Check

1. **最可能失败：Phase 104 article 已引用 product URL，preflight 把它误判为已有 SKU。** Mitigation: 显式 allowlist article reference，同时对任何 pen ownership/alternate identity fail closed；article digest/route 不变。
2. **最可能失败：2024 apparent titanium nib 与 current JoWo steel 被拼成“可选双笔尖”。** Mitigation: separate dated scopes、unresolved conflict、cross-negative spec tests；无 revision evidence 不解释为 current option。
3. **最可能失败：154 mm/66.4 g 和 heavy/non-posting 被当成 current listing 或系列普遍规格。** Mitigation: sample-only citations/claims、禁止进入 current model spec，正文归因作者样本。
4. **最可能失败：新增 made_by 使 Wancher hash 变化，却沿用旧 review 或 replay Phase 107 pack。** Mitigation: brand pre/post hash、non-topology digest、expected exact link pair、current-hash reviews + `publishEntity`、no-replay assertion。
5. **最可能失败：测试/提交写到真实 catalog 或带入脏工作树。** Mitigation: verified repo pair、caller-owned DB gates、protected sidecar snapshots、空 index、显式五文件 allowlist与 post-commit proof。

Reachability is complete: Phase 104 navigation fixture + Phase 107 Wancher/True Ebonite baseline -> exact target/source inventory with article-reference exception -> new stable Titanium identity -> unique made_by/reverse pair -> Wancher expected post-topology hash -> current-hash reviews + publishEntity -> Titanium CuratedEntityPack -> current-hash reviews + publishEntity -> public_entities -> Wancher reverse navigation and body link to `/article/wancher-dream-pen`. No artifact depends on a new series, shared-infra change, package install, protected-catalog write or later production rollout.

<verification>

1. `node --import tsx --test tests/content/phase112-wancher-dream-pen-titanium-black.test.ts` passes entirely on caller-owned checkpoint copies and proves protected main/WAL/SHM equality.
2. `pnpm exec tsc --noEmit --pretty false` passes; Biome passes the three Phase 112 TypeScript files; the SVG passes `xmllint --noout`.
3. Body exceeds 2,000 Unicode characters and has qualified official + professional-secondary evidence, explicit affiliate disclosure, current/sample scope separation, one unique approved primary SVG and four current-hash reviews.
4. Exact product preflight allows the Phase 104 article URL reference but rejects any alternate pen identity/slug/alias/source URL/marker before write; article and True Ebonite digests remain unchanged.
5. First apply publishes one target and restores Wancher on the exact post-topology hash without pack replay; tampered identity/link/source/scope/media/review/publication states fail closed; pristine replay returns one noop.
6. CodeBuddy alias and Documents canonical root both pass repo authority while any third root fails; all DB writes stay in owned copies and protected catalog snapshots remain unchanged.
7. `git show --name-only --format=` proves the only product commit contains exactly five frontmatter paths; PLAN/SUMMARY/docs and unrelated dirty/untracked are absent.

</verification>

<success_criteria>

- Wancher Dream Pen Titanium Black 是一个 unique canonical pen，并只通过唯一 made_by/reverse pair 连接既有 Wancher；它通过正文链接既有 Dream Pen article，但不新建 series、不改 article identity/route/payload。
- current official listing 与 2024 affiliate-disclosed sample 各自具有可审计 source/scope/citation；current JoWo steel 与 apparent original titanium nib 保持 temporal/sample conflict，154 mm/66.4 g 和主观体验不越界。
- 2k+ 中文、CuratedEntityPack、唯一原创 SVG、current-hash fact/language/media/publication reviews 与 public membership 全部通过。
- Wancher non-topology Phase 107 payload/source marker unchanged，contract hash只按 exact new topology 合法改变并重审恢复；protected catalog、tamper/noop、TypeScript/Biome/XML/diff 与 repo alias gates 全部通过。
- 唯一产品提交精确五文件；PLAN/SUMMARY/docs 后续另行记录，并诚实声明 Phase 112 是 partial batch。

</success_criteria>

<output>
Create `.planning/quick/260721-j51-phase-112-wancher-dream-pen-titanium-bla/SUMMARY.md` only after the exact five-file product commit completes. Do not include PLAN.md, SUMMARY.md or any other docs in the product commit.
</output>
