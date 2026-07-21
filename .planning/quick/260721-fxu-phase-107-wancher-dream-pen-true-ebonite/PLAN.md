---
phase: quick
plan: 260721-fxu
slug: phase-107-wancher-dream-pen-true-ebonite-matte-black
type: execute
status: ready
wave: 1
depends_on: []
autonomous: true
created_at: 2026-07-21
files_modified:
  - .planning/content-research/wancher-brand-phase107.md
  - .planning/content-research/wancher-dream-pen-true-ebonite-matte-black-phase107.md
  - scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts
  - scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts
  - tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts
  - public/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg
must_haves:
  truths:
    - "Wancher Dream Pen True Ebonite Matte Black 以独立 canonical pen 身份发布；它不复用已被 Phase 104 重分类为系列文章的 2aoD07lwSYCV。"
    - "既有 /article/wancher-dream-pen、article ID、正文、来源、媒体、taxonomy 记录与旧 pen route 到 article 的跳转保持不变；具体 SKU 正文明确链接回该系列导航。"
    - "现有 Wancher brand ID eOfD77nOeENN 保持不变，并以有信息量的自然中文 brand pack 通过 contract-v3；不得仅为解除 made_by_brand_not_public 而机械发布旧 270 字品牌稿。"
    - "具体 SKU 的 current 官方事实与 2018 Pencilcase Blog 受测样本分属不同 scope：当前 matte sandblast、选配笔尖/feed/clip 和历史 polished、无夹、steel JoWo + ebonite feed 体验不互相泛化。"
    - "Wancher brand 与具体 SKU 只在 caller-owned checkpoint/disposable copy 中完成 current-hash fact、language、media、publication 四类审核；品牌先公开，SKU 后由 publishEntity 公开，重复执行均为 noop。"
    - "具体 SKU 唯一 made_by 指向 Wancher，Wancher 唯一对应 reverse 指向该 SKU；品牌反向公开型号集合只增加该页，Titanium Black 不产生 Phase 107 entity、pack 或关系。"
    - "真实 data/fpkg.db main/WAL/SHM 始终不变；唯一产品提交精确包含本计划六个 owned 文件，并保留所有无关 research、.next-phase*、Phase 105 quick 记录及 260719-665 quick 目录。"
  artifacts:
    - path: "scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts"
      provides: "Wancher companion brand 与 True Ebonite Matte Black 两个 CuratedEntityPack、稳定 identity、双时态 scope、claim/spec/media 映射"
    - path: "scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts"
      provides: "owned-copy authority、身份/topology preflight、brand-first contract-v3 review/publish 与 exact noop 入口"
    - path: "tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts"
      provides: "Phase 104 导航保护、身份新建判定、双 scope 证据、品牌依赖、权限拒绝、幂等性与 protected catalog 回归"
    - path: "public/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg"
      provides: "区分 current listing 与 2018 review sample、明确非产品照片的本站原创事实示意图"
  key_links:
    - from: "scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts"
      to: "scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts"
      via: "CuratedEntityPack、loadCuratedEntityPack、packId、eOfD77nOeENN 与稳定 Phase 107 pen ID"
    - from: "scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts"
      to: "src/lib/publication.ts"
      via: "topology 固定后逐实体 recordEntityContentReview；先 publishEntity(brand)，再 publishEntity(pen)"
    - from: "Wancher Dream Pen True Ebonite Matte Black body_md"
      to: "/article/wancher-dream-pen"
      via: "正文中的站内 Markdown 链接；不改变 Phase 104 article identity 或 route"
    - from: "public Wancher brand navigation"
      to: "Phase 107 True Ebonite pen"
      via: "public_entities + 唯一 made_by/reverse pair；不把 series article 或 Titanium Black 冒充公开型号"
---

# Quick Task 260721-fxu: Phase 107 Wancher Dream Pen True Ebonite Matte Black

<objective>
在 Phase 104 已建立的 Dream Pen 系列导航旁新增一个证据边界清楚的 True Ebonite Matte Black 具体产品页，并补齐其发布所必需的 Wancher companion brand pack。具体产品页以当前 Wancher 官方 listing 为产品事实主来源，以 Pencilcase Blog 2018 年受测样本为独立历史实测；两者的表面处理、笔夹、笔尖与 feed 只在各自 scope 内陈述。

Purpose: 让读者能从宽泛的 Dream Pen 系列入口进入一个可核实的具体产品，同时不把旧受测样本、当前选项或 Titanium Black 的事实混成全系列规格。
Output: 两份 reviewed Markdown、两个 CuratedEntityPack、一个 owned-copy apply 入口、一份定向回归和一张本站原创双时态事实图。
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
@scripts/data/phase105-pilot-custom-urushi.ts
@scripts/apply-phase105-pilot-custom-urushi-content.ts
@tests/content/phase105-pilot-custom-urushi.test.ts
@scripts/data/phase106-sheaffer-connaisseur-imperial-icon.ts
@scripts/apply-phase106-sheaffer-connaisseur-imperial-icon-content.ts
@tests/content/phase106-sheaffer-connaisseur-imperial-icon.test.ts
@scripts/lib/curated-content-pack.ts
@src/lib/publication.ts

<interfaces>
- `CuratedEntityPack` 通过 `markdownFile` 加载 `## summary`、`## body_md` 与可选 `## model_specs`；`loadCuratedEntityPack(workspaceRoot, pack)` 生成 digest/sourceMarker，`packId(pack, surface, key)` 生成稳定 payload ID。
- `recordEntityContentReview(db, { entityId, reviewKind, reviewer, status, notes })` 只接受 fact/language/media；`publishEntity(db, { entityId, reviewer })` 在独立事务中生成 publication review 并安装 contract-v3 snapshot。
- Phase 104 固定 Wancher brand ID `eOfD77nOeENN`、Dream Pen article ID `2aoD07lwSYCV`、article slug `wancher-dream-pen`，并把旧 `/pen/wancher万佳-dream-pen` 重分类到 `/article/wancher-dream-pen`。
- 2026-07-21 caller-owned checkpoint inventory 在 migrate 032 后只发现 Wancher brand 与宽泛 Dream Pen donor；执行 Phase 104 后 donor 成为 article，未发现名称、slug 或 source URL 精确对应 True Ebonite Matte Black 的独立 pen。因此 Phase 107 使用新稳定 ID `phase107-wancher-true-ebonite-matte-black` 与 slug `wancher-dream-pen-true-ebonite-matte-black`；若执行时出现同产品的其他 ID，必须 fail closed 并重新审计，不能制造 duplicate。
- 同一 inventory 显示 Wancher brand 只有 24 字 summary、无 entity body、一个 270 字 deprecated story、一条无 tier/independence 的官网 reference、pending claim 和 gallery-only media。Phase 107 必须以完整 brand pack 替换这些低信息 payload，并保留 brand ID；不能只补 review metadata。
- 官方产品页 `https://www.wancherpen.com/products/true-ebonite-matte-black` 当前列出 Japanese Ebonite、Matte Sandblast Treatment、European International cartridge/converter、#6 JoWo steel／Wancher 18K／Keiryu-Kodachi／Shogun nib、plastic／black ebonite／red ebonite feed、air-tight cap 与 clip 选项。价格、库存与选项可售性是易变快照，不写成稳定 model spec。
- 独立实测 `https://www.pencilcaseblog.com/2018/10/review-wancher-dream-pen-true-ebonite.html` 明确披露样笔由 Wancher 提供；它描述 2018 production sample 的 polished black ebonite、无夹不后插、block threads、inner slip seal、steel JoWo fine + Flexible Nib Factory ebonite feed 与作者体验。该文不证明当前 matte sandblast SKU 的全部选项或结构。
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 先锁定身份新建、brand-first 发布与 Phase 104 零扰动回归</name>
  <files>tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts</files>
  <behavior>
    - Test 1: 从 `copyCheckpointedCatalogToDisposableCopy` 创建并迁移至 032 的 owned copy，先调用 Phase 104 helper 建立已公开 article baseline；盘点 Wancher 名称/slug/reference URL 后确认只有 brand + article、没有 exact True Ebonite pen，再执行 Phase 107，返回 brand published 与 pen published。
    - Test 2: Wancher ID 仍为 eOfD77nOeENN，brand 与 pen 均有 60-160 Unicode 字符 summary、至少 2,000 Unicode 字符自然中文 body、qualified core claim、primary/professional-secondary 独立来源组、approved primary SVG 与四类 current-hash review；publication contract/version/hash/revision 字段一致。
    - Test 3: pen ID/slug 精确为 Phase 107 常量，唯一 made_by 指向 Wancher，唯一 reverse 从 Wancher 指向 pen；品牌反向公开 pen 查询只新增该页。identity/topology transaction 完成后先发布 brand 再发布 pen，最终 readiness 均 blocker_count=0。
    - Test 4: Phase 104 article 的 entity/story/source/reference/media/taxonomy/publication 摘要、`/article/wancher-dream-pen` 可见性以及旧 pen route 跳转在 Phase 107 前后完全一致；新 pen body 含该 article 的站内链接，但没有把 article 改回 pen 或复用其 ID。
    - Test 5: current 官方 scope 只承载 matte sandblast、当前 nib/feed/filling/cap/clip listing；2018 historical sample scope 才承载 polished、无夹、不后插、block threads、inner seal、steel JoWo fine + ebonite feed 与主观体验。resolved finish conflict 明确归因时间/样本差异，价格、库存、可售性不进入稳定 spec。
    - Test 6: Phase 107 两个 manifest、目标 entity payload 与新增 topology 中没有 Titanium Black entity/pack/relation；Phase 104 article 既有 Titanium 边界段和引用保持原样，不用全库 file-wide absence 断言误伤既有内容。
    - Test 7: remote env、空 reviewer、owned-root 外路径、symlink/hard-link alias、protected path、client/path mismatch、未迁移 copy、错误 brand/article identity、exact-product alternate ID 或 slug collision 都在首个写事务前 fail closed，并以 disposable row digests 证明零部分写入。
    - Test 8: 第二次 apply 两个 outcome 均为 noop，hash/revision/review/link counts 不变；finally 后真实 data/fpkg.db main/WAL/SHM snapshot 与测试前完全一致。
  </behavior>
  <action>
以 Phase 105 的单实体 contract-v3 回归和 Phase 106 的 brand/protected-canonical 隔离回归为模式新增 Phase 107 test。测试的 owned copy 先执行 Phase 104 helper，随后拍摄 article 全 payload、Wancher brand 旧 payload、公开反向集合和 protected catalog snapshot；这一步是测试基线准备，不属于 Phase 107 apply。把本轮已经得到的身份结论编码为明确断言：`2aoD07lwSYCV` 是 article，不能当 SKU donor；exact True Ebonite identity 不存在，所以新建稳定 Phase 107 ID。若 fixture 出现另一 exact identity，测试必须失败并报告候选，而不是按名称模糊复用。

先写失败回归，证明旧仓库缺少 companion brand contract-v3、具体 SKU、双 scope evidence、唯一 maker/reverse 和发布顺序。对 article、brand 与 protected catalog 使用结构化 before/after digests；article 必须 byte-stable，brand 只允许被 Phase 107 brand pack 与新增 reverse 有意改变。所有 authority case 只能绑定临时目录中的 disposable files；不要添加 Playwright、general acceptance、search、LLM、通用 fixture 或 shared runner。
  </action>
  <verify>
    <automated>node --import tsx --test tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts</automated>
  </verify>
  <done>失败测试完整锁定新 identity、brand-first contract-v3、双 scope、Phase 104 article 零扰动、Titanium 排除、authority fail-closed、noop 与真实目录不变契约。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: 编写 Wancher companion brand、True Ebonite SKU pack 与原创事实图</name>
  <files>.planning/content-research/wancher-brand-phase107.md, .planning/content-research/wancher-dream-pen-true-ebonite-matte-black-phase107.md, scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts, public/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg</files>
  <behavior>
    - Test 1: 两份 reviewed Markdown 均满足 60-160 字 summary 与至少 2,000 Unicode 字符 body；品牌正文有独立信息结构，不能把 SKU 正文复制成品牌页或复用旧 deprecated story。
    - Test 2: brand pack 复用 eOfD77nOeENN，以 Wancher Our Story／Dream Pen collection 等官方页面建立品牌身份、所在地与产品/工艺边界，以 Pencilcase Blog 2018 review 只证明外部作者当时观察到的 Dream Pen 项目与受测样本；不把营销定位写成普遍质量结论。
    - Test 3: pen pack 使用新稳定 ID/slug，current source/scope 精确绑定官方产品页；historical sample source/scope 精确绑定 Pencilcase Blog，并保留 supplied-review disclosure。每个 approved claim、spec field、variant 与 conflict 都有 locator/citation/scope 链。
    - Test 4: model spec 保存 Japanese Ebonite + matte sandblast、European International cartridge/converter、当前页面列出的 nib/feed/cap 范围与 Wancher brand ID；不补猜 SKU code、数值尺寸/重量，不把 mutable price/stock 或 2018 sample 的 polished/无夹/steel fine 配置写成当前固定规格。
    - Test 5: SVG 用分面和文字标注区分 current official listing、2018 reviewed sample 与 source-boundary，声明本站原创、示意图、非产品照片、非比例/颜色/表面复刻；同一资产作为 brand 与 pen primary media 时有各自准确 title/attribution/scope。
  </behavior>
  <action>
新增两份自然中文 reviewed copy。Wancher brand 正文使用官方 `https://www.wancherpen.com/pages/our-story-page`、Dream Pen collection、True Ebonite 官方页与 Pencilcase Blog 评测建立可核实的品牌、产品线、材料/工艺叙事和证据边界；正文必须让读者获得独立于具体 SKU 的品牌认识，同时诚实说明独立来源是获赠样品的 2018 产品实测，不能证明品牌所有产品质量。复用 brand ID，但清理旧 deprecated story/pending claim/弱 provenance，并由 brand pack 重建 source/reference/claim/story/media；不建立 brand model spec，不复制 Wancher logo 或外站图片。

True Ebonite 正文以“当前 Matte Black listing”和“2018 True Ebonite sample”两条时间线写作。官方页支持 Japanese Ebonite、Matte Sandblast Treatment、European International cartridge/converter、页面列出的 nib/feed、air-tight cap、包装和手工尺寸轻微差异；clip 的无夹/镀铬/镀金选项只作为 2026-07-21 listing snapshot，不承诺库存。Pencilcase Blog 的 polished finish、无夹不后插、block threads/偶发 cross-thread、slip seal、steel JoWo fine + Flexible Nib Factory ebonite feed、写感与价格判断全部限制在 2018 supplied sample，并记录披露。使用 `CuratedConflict` 把 polished 与 current matte 的表面差异解析为 temporal/sample scope，不强行宣称同一批次或把文章当 current finish 的独立交叉证明。正文必须链接 `/article/wancher-dream-pen`；不为 Titanium Black 定义 pack、entity、source payload、claim、variant 或 topology。

data 文件导出 `PHASE107_WANCHER_ID`、`PHASE107_DREAM_ARTICLE_ID`、`PHASE107_TRUE_EBONITE_ID`、`PHASE107_TRUE_EBONITE_SLUG` 与两个 `CuratedEntityPack`。官方 documents 使用 `wancher-official` independence group，Pencilcase Blog 使用独立 professional-secondary group，本站 SVG 使用独立 editorial group；每个 archiveLocator 诚实标记 live-source-not-frozen 与 retrieved date，不把 live URL 伪称冻结 archive。两包共享 source definitions 时仍保持 pack payload、scope 和 media attribution 可独立审计。
  </action>
  <verify>
    <automated>node --import tsx --test tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts</automated>
  </verify>
  <done>Wancher brand 与具体 SKU 两份正文、两个 evidence-complete pack 和一张原创双时态 SVG 通过 readiness 回归；当前 listing、2018 sample、系列导航与 Titanium 边界没有混写。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现 owned-only 双包发布、exact noop 并精确提交</name>
  <files>scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts</files>
  <behavior>
    - Test 1: remote selection、reviewer、owned authority、migration 032、brand/article identity 与 target collision checks 全部在首个 write transaction 前完成；任一失败不改变 disposable copy。
    - Test 2: identity/topology transaction 新建或确认唯一 Phase 107 pen，保留 Phase 104 article，规范 pen -> Wancher made_by 与 Wancher -> pen reverse；不得增加 article maker、article reverse 或 Titanium topology。
    - Test 3: topology 稳定后安装 brand/pen 自有 pack payload，分别完成 fact/language/media current-hash approvals；先由 publishEntity 发布 Wancher brand，再由 publishEntity 发布 pen，不直接写 published lifecycle。
    - Test 4: exact terminal state 才返回两个 noop；任一 source marker、hash、review、readiness、public membership、article protection、identity 或 topology 条件缺失时必须修复或 fail closed，不能假报 noop。
  </behavior>
  <action>
以 Phase 105 的 phase-local loader/installer/terminal-state 与 Phase 106 的多实体 publish ordering 为直接模式实现 Phase 107。首个写事务前拒绝继承的 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`，并拒绝空 reviewer、protected file/hard-link alias、symlink、owned-root 外路径、client/path 不一致和未迁移 032 的副本；每次 protected 检查使用 caller 传入 snapshot。完整 preflight Wancher brand、Phase 104 article、旧 route、候选 exact-name/slug/source URL 和新 stable ID；若另一 ID 已精确代表该 SKU则停止，不能自动吞并或重复创建。

在单个 identity/topology transaction 中创建或确认新 pen，删除其错误 maker/reverse 后只保留 `pen -> eOfD77nOeENN made_by` 与 `eOfD77nOeENN -> pen reverse`。不要更新 `2aoD07lwSYCV` 的 entity/story/source/reference/media/taxonomy/publication，不把旧 raw route 从 article 改指 SKU，也不创建 Titanium identity。注意 migration 032 的 made_by trigger 会 invalidates source pen 与 target brand：因此 topology 必须先固定，再使用 `loadCuratedEntityPack`/`packId` 安装 brand 与 pen 自有 story/source/reference/alias/scope/claim/citation/evidence/spec/variant/conflict/timeline/media，随后分别 record fact/language/media review，先 `publishEntity` brand 再 `publishEntity` pen。不要修改 `scripts/apply-phase22-content.ts`、`scripts/lib/curated-content-pack.ts`、`src/lib/publication.ts` 或 Phase 104/105/106 文件。

CLI 只接受显式 `--database`、`--owned-root`、`--protected-catalog` 与可选 reviewer，并清空远端选择变量。定向测试通过后，运行本包三个 TypeScript 文件的 Biome、项目 `tsc --noEmit`、SVG `xmllint`、owned-file `git diff --check`。开始 staging 前要求 index 为空；只 stage frontmatter 的六个产品文件，用固定排序 allowlist 与 `git diff --cached --name-only` 精确比较并运行 `git diff --cached --check`，集合不一致则只撤销本包路径的 staging 后停止。不得 stage 计划/SUMMARY、任何其他 `.planning/content-research/*`、`.next-phase*`、`.planning/quick/260720-nhl-phase-105-pilot-custom-urushi-owned-chec/` 或 `.planning/quick/260719-665-montblanc-writers-edition-patron-of-art-/`。提交信息使用 `feat(content): publish Wancher True Ebonite Matte Black`，提交后核对 HEAD path set 恰为六文件且所有无关 worktree 内容仍原样存在。本 Phase 只交付 Wancher brand + 这一具体 SKU，不得把它报告为全量内容 goal 完成。
  </action>
  <verify>
    <automated>node --import tsx --test tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts &amp;&amp; pnpm exec biome check scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; xmllint --noout public/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg &amp;&amp; git diff --check -- .planning/content-research/wancher-brand-phase107.md .planning/content-research/wancher-dream-pen-true-ebonite-matte-black-phase107.md public/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts &amp;&amp; git diff --cached --check &amp;&amp; phase107_expected=$(printf '%s\n' .planning/content-research/wancher-brand-phase107.md .planning/content-research/wancher-dream-pen-true-ebonite-matte-black-phase107.md public/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts | sort) &amp;&amp; phase107_actual=$(git show --format= --name-only HEAD | sed '/^$/d' | sort) &amp;&amp; test "$phase107_actual" = "$phase107_expected"</automated>
  </verify>
  <done>Wancher brand 与 True Ebonite SKU 在 owned copy 中经 current-hash 四类审核公开且 replay noop；Phase 104 article 与真实 catalog 不变；唯一产品 commit 精确包含六个 owned 文件，Phase 107 被准确报告为局部交付。</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|---|---|
| protected catalog -> caller-owned copy | 真实 SQLite main/WAL/SHM 只允许 snapshot/checkpoint copy；migrate、inventory、apply 与 query client 全部绑定 owned file。 |
| official current listing / 2018 supplied sample -> curated claims | 两份外部来源跨越时间、finish 和 sample configuration；每条 claim/spec 必须绑定正确 source、locator 与 scope。 |
| Phase 104 series article -> Phase 107 concrete pen | 旧 donor 已成为 article；新 SKU 只能新建独立 identity 并通过正文链接回导航，不能偷换旧 route。 |
| draft Wancher brand -> published pen | made_by target 必须先通过完整 brand content/reviews 公开；禁止用低信息旧稿或直接 lifecycle SQL 绕过。 |
| dirty working tree -> product commit | 大量无关 research、next-phase 和 quick records 与六个 owned 文件共享 worktree，staging 必须精确 allowlist。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-107-01 | Tampering | catalog authority | critical | mitigate | 首个写事务前验证 remote env、owned root、realpath/inode、symlink、PRAGMA database_list、migration 032 与 protected snapshot；拒绝时比较 disposable state。 |
| T-107-02 | Spoofing | canonical identity | high | mitigate | owned-copy inventory 固定 article/brand IDs 与 exact-product absence；alternate exact ID 或 slug/source collision fail closed，不复用 series article。 |
| T-107-03 | Elevation of privilege | publication lifecycle | high | mitigate | topology 先稳定；两包分别完成 current-hash 内容审核，只由 publishEntity 按 brand -> pen 顺序安装 contract-v3 publication。 |
| T-107-04 | Spoofing | current vs historical evidence | high | mitigate | current official 与 2018 supplied sample 使用不同 scope；resolved finish conflict、sample disclosure 与字段级 locator 阻止跨时态泛化。 |
| T-107-05 | Tampering | Phase 104 navigation and Titanium boundary | high | mitigate | article 全 payload/route digest 前后相等；新增 topology 只含 brand + True Ebonite，Titanium 既有 article 内容保持只读。 |
| T-107-06 | Tampering | git staging boundary | high | mitigate | staging 前要求空 index，commit 前后用固定六文件排序集合和 diff checks 验证，禁止纳入任何无关工作树内容。 |
</threat_model>

<verification>
- `node --import tsx --test tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts`
- `pnpm exec biome check scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts`
- `pnpm exec tsc --noEmit --pretty false`
- `xmllint --noout public/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg`
- `git diff --check --` 只覆盖六个 owned 产品文件；commit 前另运行 `git diff --cached --check`。
- 定向测试自行证明真实 `data/fpkg.db` main/WAL/SHM 前后 snapshot 完全一致；执行阶段不运行任何真实 catalog 写入命令。
- 产品 commit path set 必须与 frontmatter 六文件 allowlist 精确相等；计划与 SUMMARY 不进入产品 commit。
</verification>

<success_criteria>
- Wancher brand 复用 eOfD77nOeENN 并获得完整、来源化、非机械过门禁的中文页面；具体 SKU 使用独立 Phase 107 ID/slug。
- official current 与 2018 supplied sample 的事实/体验按 scope 分离，finish conflict 被诚实解释，SKU spec 不含猜测或易变价格/库存。
- brand/pen 四类 current-hash review 与 contract-v3 publication 一致，唯一 made_by/reverse 完整，重放均 noop。
- `/article/wancher-dream-pen` 与其全部 payload/route 保持不变；Titanium Black 不进入 Phase 107 包。
- 真实 catalog 不变；唯一产品 commit 只含六个 owned 文件，所有无关 worktree 内容仍原样存在。
- SUMMARY 明确本 Phase 只完成 Wancher brand + True Ebonite Matte Black，不能宣称全量内容 goal 完成。
</success_criteria>

## Source Coverage Audit

| SOURCE | ID | Feature/Requirement | Plan | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 新增/修复 Wancher Dream Pen True Ebonite Matte Black 具体 SKU，并保留系列导航 | 260721-fxu | COVERED | Tasks 1-3 覆盖新 identity、内容、导航保护、发布与提交。 |
| REQ | — | Quick task 未分配 ROADMAP requirement ID | 260721-fxu | COVERED | 无遗漏 phase_req_ids。 |
| RESEARCH | — | 官方 current listing：Japanese Ebonite、matte sandblast、c/c、nib/feed/cap/clip options | 260721-fxu | COVERED | Task 2 绑定 current scope，并排除 mutable price/stock。 |
| RESEARCH | — | Pencilcase Blog 2018 supplied sample：polished、无夹、threads/seal、steel JoWo + ebonite feed 与作者体验 | 260721-fxu | COVERED | Tasks 1-2 绑定 historical sample scope 与 disclosure。 |
| CONTEXT | C-01 | 先在 caller-owned checkpoint copy 盘点身份，决定复用/新建 | 260721-fxu | COVERED | Inventory 已确认 brand/article 可复用、具体 pen 不存在；Task 1 编码新建决策。 |
| CONTEXT | C-02 | 保留 /article/wancher-dream-pen 系列导航 | 260721-fxu | COVERED | Tasks 1、3 对 article 全 payload/route 做零扰动回归，SKU 正文链接返回。 |
| CONTEXT | C-03 | 遵循 CuratedEntityPack、recordEntityContentReview、publishEntity | 260721-fxu | COVERED | Tasks 2-3 使用两个 pack 与 brand-first shared publication lifecycle。 |
| CONTEXT | C-04 | 正确 Wancher made_by 和反向关系 | 260721-fxu | COVERED | Tasks 1、3 锁定唯一 pen->brand 与 brand->pen pair。 |
| CONTEXT | C-05 | 自然中文完整正文、来源、准确原创示意图 | 260721-fxu | COVERED | Task 2 交付两份 2,000+ 字正文、字段证据与 factual SVG。 |
| CONTEXT | C-06 | Titanium Black 因独立证据不足不进入此包 | 260721-fxu | COVERED | Tasks 1-3 禁止新增 Titanium pack/entity/payload/topology，同时保护 Phase 104 既有边界内容。 |
| CONTEXT | C-07 | 绝不写 data/fpkg.db；定向回归、TS、Biome、diff/格式 | 260721-fxu | COVERED | Tasks 1、3 与 T-107-01；verification 列出所有 scoped gates。 |
| CONTEXT | C-08 | 保护全部现有 research、.next-phase*、Phase 105 与 260719-665 quick 目录，只提交 owned 文件 | 260721-fxu | COVERED | Task 3 固定六文件 staging/commit allowlist。 |
| CONTEXT | C-09 | 不把本 Phase 当全量 goal 完成 | 260721-fxu | COVERED | Task 3、success criteria 与 SUMMARY contract 明确局部交付。 |

<output>
执行完成后在本 quick 目录创建 `260721-fxu-SUMMARY.md`，记录身份 inventory、新 pen ID/slug、brand companion 来源、current/historical scopes、finish conflict、四类 review/readiness、Phase 104 article digest、protected snapshot、noop、测试结果和产品 commit 六文件 allowlist；SUMMARY 不得并入产品 commit，并必须把结果描述为 Phase 107 局部交付。
</output>
