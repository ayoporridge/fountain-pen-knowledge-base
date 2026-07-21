---
phase: quick
plan: 260721-jxc
slug: phase-113-wancher-dream-pen-true-urushi-aka-tamenuri
type: execute
status: ready
wave: 1
depends_on: []
autonomous: true
created_at: 2026-07-21
requirements:
  - QUICK-260721-JXC
files_modified:
  - .planning/content-research/wancher-dream-pen-true-urushi-aka-tamenuri-phase113.md
  - scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.ts
  - scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content.ts
  - tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts
  - public/images/library/site-original/phase113/wancher/wancher-dream-pen-true-urushi-aka-tamenuri.svg
must_haves:
  truths:
    - "Wancher Dream Pen True Urushi Aka Tamenuri 以新建且唯一的 canonical pen 身份发布；它复用既有 Wancher brand 与 Dream Pen 导航 article，但不创建 generic True Urushi series，不合并其它颜色。"
    - "读者能从 Aka Tamenuri 正文进入 /article/wancher-dream-pen；该正文导航不制造 article made_by、reverse、产品同一性或系列实体。"
    - "2026-07-21 官方 exact listing 的 ebonite + urushi、Wajima hand-work、至少三个月品牌流程、European International C/C、#6 JoWo steel／Wancher 18K、plastic／ebonite feed 与 clip options 均保留 Wancher 自述和 current-listing scope；价格、库存与 add-to-cart 状态不进入稳定 model specs。"
    - "Pencilcase Blog 2019 production-order evidence 只证明作者和父亲订购量产笔、父亲所选 Aka-Tamenuri、随单证书所示 Taya Shikkiten 归因及作者对可能较少漆层的明确 hypothesis；不能把 hypothesis 改写成事实，也不能把单次订单证书推广为所有现售单元的独立产地证明。"
    - "2018 Pencilcase Blog 与 Ed Jelley 的黑色 prototype 只作为 Dream Pen／urushi family prototype history；loaned／Wancher-supplied 样本、黑色外观和非 Aka 身份明确披露，其测量、重量、steel nib 或体验绝不迁移到 current Aka stable specs。"
    - "新增 made_by topology 后，既有 Wancher brand 的非 topology payload 与 Phase 107 source marker 不变；reviews 绑定 post-topology current hash，再由 publishEntity 恢复品牌，不能 replay Phase 107 brand pack。"
    - "所有 fixture、迁移、写入、review、publish、tamper 与 replay 只发生在 caller-owned checkpoint/disposable copy；测试只做一次 setup/migration chain，首次 apply 发布一页，第二次 exact noop，真实 data/fpkg.db main/WAL/SHM 始终不变。"
    - "唯一产品提交精确包含本计划五个 owned 产品文件；PLAN/SUMMARY/docs 后续另行处理，所有 unrelated dirty/untracked 原样保留，并明确本轮只是 partial batch。"
  artifacts:
    - path: ".planning/content-research/wancher-dream-pen-true-urushi-aka-tamenuri-phase113.md"
      provides: "至少 2,000 Unicode 字符的来源化中文 reviewed copy，含 current listing、2019 production evidence、2018 prototype family history 与系列导航"
    - path: "scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.ts"
      provides: "单一 Aka Tamenuri CuratedEntityPack、稳定 identity、source/scope/claim/spec/hypothesis/timeline/media 映射"
    - path: "scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content.ts"
      provides: "verified repo pair + caller-owned DB authority、exact identity/source duplicate preflight、topology、brand/pen review-publish 与 terminal noop"
    - path: "tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts"
      provides: "单 setup Phase 104/107 baseline、official URL 例外、production/prototype scope、brand hash recovery、tamper/noop、authority、protected catalog 与 exact commit contract 回归"
    - path: "public/images/library/site-original/phase113/wancher/wancher-dream-pen-true-urushi-aka-tamenuri.svg"
      provides: "区分 current brand claims、2019 production-order evidence 与 2018 black prototypes 的本站原创证据示意图"
  key_links:
    - from: "scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.ts"
      to: "scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content.ts"
      via: "CuratedEntityPack、loadCuratedEntityPack、packId 与稳定 Phase 113 identity/source marker"
    - from: "scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content.ts"
      to: "src/lib/publication.ts"
      via: "topology 固定后 recordEntityContentReview(fact/language/media) + publishEntity；Wancher brand 先恢复，Aka Tamenuri 后发布"
    - from: "Wancher Dream Pen True Urushi Aka Tamenuri body_md"
      to: "/article/wancher-dream-pen"
      via: "正文中的站内 Markdown 链接；Phase 104 article payload、identity、route 与 taxonomy byte/logically stable"
    - from: "phase113-wancher-dream-pen-true-urushi-aka-tamenuri"
      to: "eOfD77nOeENN"
      via: "唯一 pen -> Wancher made_by 与 Wancher -> pen reverse pair；public Wancher reverse 集合只新增 Aka Tamenuri"
---

# Quick Task 260721-jxc: Phase 113 Wancher Dream Pen True Urushi Aka Tamenuri

<objective>
在 Phase 104 的 Dream Pen 系列导航与 Phase 107 已公开 Wancher brand／True Ebonite 旁，新建并发布一个证据边界清楚的 Wancher Dream Pen True Urushi Aka Tamenuri 具体 SKU。官方 current listing、2019 production-order evidence 与两篇 2018 black prototype 记录各自保留主体、时间、样本和确信度，不创建 generic True Urushi series，也不把其它颜色或 prototype 配置拼进当前 Aka。

Purpose: 让读者得到一页可核查的 Aka Tamenuri 产品知识：既看见品牌对材料、漆艺、流程和可选配置的当前说法，也看见独立量产订单中的证书线索与明确 hypothesis，同时理解 2018 prototype 只能说明家族前史。
Output: 一份 reviewed Markdown、一个 CuratedEntityPack、一个 caller-owned apply 入口、一份单 setup 定向 integration 回归和一张本站原创三层 evidence-boundary SVG。
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
@.planning/quick/260721-j51-phase-112-wancher-dream-pen-titanium-bla/PLAN.md
@scripts/lib/curated-content-pack.ts
@src/lib/publication.ts

<interfaces>
- `CuratedEntityPack` 通过 `markdownFile` 加载 `## summary`、`## body_md` 与可选 `## model_specs`；`loadCuratedEntityPack(workspaceRoot, pack)` 产生 digest/sourceMarker，`packId(pack, surface, key)` 产生稳定 payload ID。
- `recordEntityContentReview(db, { entityId, reviewKind, reviewer, status, notes })` 只写 fact/language/media；`publishEntity(db, { entityId, reviewer })` 生成 publication review并安装 contract-v3 snapshot。禁止直接写 lifecycle、review、publication 或 public tables。
- Phase 104 固定 Wancher brand ID `eOfD77nOeENN`、Dream Pen article ID `2aoD07lwSYCV`、article slug `wancher-dream-pen` 与旧 `/pen/wancher万佳-dream-pen` 到 `/article/wancher-dream-pen` 的 route reclassification。
- 按 Phase 112 的 exact article URL exception：Phase 104 若已将 `https://www.wancherpen.com/products/dream-pen-true-urushi-akatamenuri` 作为系列边界 source reference，Phase 113 duplicate preflight 必须允许并保持该 article reference；但任何既有 `pen` identity、pen alias/reference/source marker 或 target stable ID/slug 已代表 Aka Tamenuri 时，必须在首写前 fail closed。article 不能作为 product donor。
- Phase 107 已将 Wancher brand 按 contract-v3 发布，并建立 True Ebonite SKU。Phase 113 新增 made_by/reverse 会使 Wancher topology hash 改变；apply 必须保留 Phase 107 brand 非 topology payload/source marker，只为 expected post-topology current hash 重写 fact/language/media approvals 并调用 `publishEntity`，不得 replay brand pack。
- Phase 113 使用稳定 ID `phase113-wancher-dream-pen-true-urushi-aka-tamenuri`、slug `wancher-dream-pen-true-urushi-aka-tamenuri`、canonical name `Wancher Dream Pen True Urushi Aka Tamenuri`。若 inventory 出现 alternate exact pen、generic True Urushi series 或其它颜色 identity，停止并报告候选，不自动 merge、redirect、retire、建 series 或选 survivor。
- 官方 current source `https://www.wancherpen.com/products/dream-pen-true-urushi-akatamenuri` 在 2026-07-21 可 add-to-cart，并写明 ebonite + urushi、Wajima hand-work、品牌称流程至少三个月、European International cartridge/converter、#6 JoWo steel 或 Wancher 18K、plastic／ebonite feed 与 clip options。Wajima 与工时属于 qualified brand claims；价格、库存、add-to-cart 和未来可售性是 mutable snapshot，不进入 stable model specs。
- 独立 production source `https://www.pencilcaseblog.com/2019/08/revisiting-wancher-dream-pen-urushi.html` 记录作者与父亲自费订购 production pens、父亲选择 Aka-Tamenuri、订单所附证书命名 Taya Shikkiten，且作者明确把“漆层可能更少”写成 hypothesis；页面声明没有 affiliate links。证书只支持该 reviewed order context，hypothesis 保持 hypothesis。
- 历史 prototype sources `https://www.pencilcaseblog.com/2018/02/wancher-dream-pen-urushi-fountain-pen.html` 与 `https://edjelley.com/2018/01/25/wancher-ebonite-urushi-dream-pen-kickstarter-fountain-pen-review/` 分别是 loaned black prototype 与 Wancher-supplied black prototype，均不是 Aka。它们只能进入 historical-family/prototype scope；任何 measurements、weight、steel nib、writing experience 或 prototype finish 不能进入 current Aka stable specs。
- Repo authority 只接受已核验的输入 pair `/Users/xz/CodeBuddy/fountain-pen-graph` 与 `/Users/xz/Documents/fountain-pen-graph`，并要求 `realpath` 和 `git rev-parse --show-toplevel` 都落到 Documents canonical root。数据库 authority 独立验证 caller-owned containment、no symlink/hard-link、protected main/WAL/SHM snapshot、PRAGMA client/path 与 migration 032。
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 先用单一 setup 锁定 exact SKU、三层 evidence scope、Wancher hash 恢复与保护回归</name>
  <files>tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts</files>
  <behavior>
    - Test 1: 仅在一个 top-level `test` 中调用一次 `copyCheckpointedCatalogToDisposableCopy`、一次 migration-to-032 chain，并依次准备 Phase 104/107 baseline；所有 success/failure/tamper/replay 子场景复用该 setup 或从其 checkpoint 派生 owned fixture，不通过 `beforeEach`、嵌套 runner 或重复 setup 再跑同一 migration。确认 Wancher、Dream Pen article、True Ebonite 已公开，official Aka URL 至多只被 article 引用，catalog 没有 exact Aka pen，然后首次 Phase 113 apply 返回一项 published。
    - Test 2: 新 pen ID/slug/name 精确等于 Phase 113 常量，具有 60-160 Unicode 字符 summary、至少 2,000 Unicode 字符自然中文 body、qualified core claim、official primary + independent production secondary + historical prototype source groups、approved unique primary SVG 与 current-hash fact/language/media/publication reviews；readiness blocker_count=0。
    - Test 3: official-current scope 只承载 ebonite + urushi、Wancher 所称 Wajima hand-work／至少三个月流程、European International C/C、#6 JoWo steel／Wancher 18K、plastic／ebonite feed 与 clip options；price/stock/add-to-cart 不进入 stable specs或未来承诺。
    - Test 4: 2019 production-order scope 精确表达作者与父亲自费订购、父亲 Aka-Tamenuri、随单证书命名 Taya Shikkiten、no-affiliate-links disclosure；“漆层可能更少”具有 hypothesis/qualified status 和作者归因，不能成为 approved stable fact、官方流程反证或全量产品结论。
    - Test 5: 2018 两个 historical scopes 分别保存 loaned black prototype 与 Wancher-supplied black prototype disclosure，并结构化证明两者都不是 Aka；prototype measurement/weight/steel nib/experience 不出现在 current specs、current claims 或 Aka product configuration。
    - Test 6: Phase 104 article 的 entity/story/source/reference/media/taxonomy/publication digest、article route 与旧 pen redirect 前后完全一致；新正文含 `/article/wancher-dream-pen` 链接，但 article 没有 made_by/reverse 或 target ownership 变化，也没有 generic True Urushi series entity/link。
    - Test 7: Aka 唯一 made_by 指向 `eOfD77nOeENN`，唯一 reverse 从 Wancher 指向该 pen；Wancher public reverse 集合相对 Phase 107 baseline 只新增 Aka，True Ebonite topology 保持不变，任何其它颜色不被创建、合并或链接为同一 SKU。
    - Test 8: topology transaction 前后 Wancher entity/story/source/reference/spec/media/source-marker 非 topology digest byte/logically equal；contract hash 仅因一个 exact link pair 改变，fact/language/media approvals 绑定 expected post-topology hash，随后 `publishEntity` 恢复品牌，不调用 Phase 107 pack loader。
    - Test 9: official URL 的既有 article reference 不触发 false duplicate；但 alternate exact pen name/slug/alias/source URL/marker、stable ID collision、generic-series collision、错误 brand/article/True Ebonite baseline 或额外 maker 均在首个写事务前 fail closed，并用 disposable row digest 证明零部分写入。
    - Test 10: remote env、空 reviewer、第三个 repo root、repo pair 不能解析到同一 canonical git root、owned-root 外路径、protected path/sidecar、symlink/hard-link alias、client/path mismatch 与未迁移 copy 全部拒绝；maker、identity/source marker、scope/evidence/media/review/hash/publication 任一 tamper 失败且不假报修复；pristine replay exact noop，finally 后真实 data/fpkg.db main/WAL/SHM snapshot 不变。
  </behavior>
  <action>
按 D-01 至 D-14 先写失败 integration regression，以 Phase 112 的 article URL exception、verified repo pair、brand post-topology hash、tamper/noop 模式为直接 analog，但修正测试结构为一个 top-level setup：只创建/迁移一次 Phase 113 baseline，随后在同一 test 内串行做 initial apply、terminal assertions、checkpoint-derived fault cases 与 replay。不得用多个 test hooks 重复执行 Phase 104/107 migration runner，以免触发 duplicate migration runner 问题。所有数据库变体都来自 caller-owned root，真实 catalog 只做 before/final snapshot。

把 exact duplicate 语义写成结构断言：Phase 104 article 对 official Aka URL 的 `entity_references` 是允许且必须保留的 series-navigation evidence，不是 existing product；任何 `pen` 对同 URL 的 entity/source/reference/alias/source-marker ownership才是 alternate product collision。新 target 只能用锁定 stable ID/slug 首次创建，不能复用 `2aoD07lwSYCV`、True Ebonite、generic True Urushi 或其它颜色 donor。

对 official brand claims、2019 production order/certificate/hypothesis/no-affiliate disclosure 与两篇 2018 black prototype disclosures 使用 scope/citation/claim/spec-level assertions，不用正文关键词数量代替 evidence wiring。测试必须证明 prototype measurements、weight、steel nib 和体验不能越界进入 current Aka specs；Wancher brand 在单 link-pair topology 后对 expected current hash 重审并经 publish API 恢复，且 Phase 107 brand pack 未 replay。不要添加 shared runner、Playwright、search、LLM、generic readiness、full-site acceptance 或 production migration。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts</automated>
  </verify>
  <done>失败测试以单一 setup 完整锁定 exact-new SKU、article URL 例外、production/prototype evidence 边界、brand post-topology publish、repo/DB authority、tamper/noop、protected catalog 与 partial-batch 边界。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: 编写 Aka Tamenuri evidence pack、2k+ 中文与唯一原创事实图</name>
  <files>.planning/content-research/wancher-dream-pen-true-urushi-aka-tamenuri-phase113.md, scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.ts, public/images/library/site-original/phase113/wancher/wancher-dream-pen-true-urushi-aka-tamenuri.svg</files>
  <behavior>
    - Test 1: reviewed Markdown 满足 60-160 Unicode 字符 summary 与至少 2,000 Unicode 字符 body；正文自然、具体，并链接 `/article/wancher-dream-pen`，不复制 Phase 104 navigation、Phase 107 True Ebonite 或其它颜色正文。
    - Test 2: pack 只定义一个 exact Aka Tamenuri pen；official page 使用 `wancher-official` primary group，2019 Pencilcase Blog production order 使用独立 secondary group并保存 no-affiliate disclosure，两篇 2018 prototype source 各保存 sample-provenance metadata，SVG 使用 editorial group。
    - Test 3: current model specs 只含 official current page 可支持的 ebonite/urushi、European International C/C、nib/feed/clip options；Wajima hand-work 和至少三个月流程作为 qualified brand claims；price/stock/add-to-cart/future availability 不进入 stable specs。
    - Test 4: 2019 order 的 father Aka-Tamenuri、Taya Shikkiten certificate attribution 与 no-affiliate disclosure 只在 production-order scope；fewer-layers 只作为作者 hypothesis，不能升级为 conflict resolution、确定层数或现售 Aka 的普遍事实。
    - Test 5: 2018 loaned/supplied black prototypes 只在 historical-family scopes；任何 prototype dimensions、weight、steel nib、writing feel 都不能出现在 current Aka model specs。SVG 用独立构图区分 current brand claims、2019 production evidence 与 2018 non-Aka prototypes，并显著声明本站原创示意、非产品照片、非比例/色漆/层数复刻。
  </behavior>
  <action>
按 D-04 至 D-08 写一份来源化中文 reviewed copy。开头从 Aka Tamenuri 深浅漆色只能由实物呈现、本站不以示意图复刻色泽切入，随后分开 official current claims、2019 production-order evidence、certificate 能证明到哪里、fewer-layers hypothesis 的边界、2018 prototype family history、当前配置核对与 Dream Pen 系列导航。官方 facts 以 retrieval date `2026-07-21` 限定；add-to-cart 可写成当日页面状态，但价格、库存与未来可售性不写入 stable specs或购买承诺。

data 文件按 D-01/D-02 导出 `PHASE113_WANCHER_ID`、`PHASE113_DREAM_ARTICLE_ID`、`PHASE113_TRUE_EBONITE_ID`、`PHASE113_AKA_TAMENURI_ID`、`PHASE113_AKA_TAMENURI_SLUG`、四个 exact source URLs 与单一 `CuratedEntityPack`。每个 approved claim/spec/media 都有 source item、locator、citation、scope 和 independence metadata。official archiveLocator 诚实标记 `live-source-not-frozen;retrieved=2026-07-21`；2019 页面标记 production-order/no-affiliate context；2018 页面分别标记 loaned 与 Wancher-supplied prototype，不把 live URL 伪称 frozen archive。

Wajima hand-work 和至少三个月流程必须以“Wancher 表示”呈现，不能借 2019 certificate 自动独立验证全部 current units。Taya Shikkiten 只绑定 reviewed order/certificate context；fewer-layers 使用 hypothesis/qualified evidence，不创建虚假的已解决冲突或确定层数。两篇 2018 来源只用于 timeline/family context，禁止把它们的黑色 prototype 外观、测量、重量、steel nib 或体验写入 current Aka model spec。SVG 必须是本 SKU 独有的 evidence-boundary diagram，不复制 Wancher logo、外站图片或 Phase 107/112 构图。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; pnpm exec biome check scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase113/wancher/wancher-dream-pen-true-urushi-aka-tamenuri.svg &amp;&amp; node --import tsx --test tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts</automated>
  </verify>
  <done>单一 Aka Tamenuri pack、2k+ 中文、qualified official claims、production-order/certificate/hypothesis evidence、non-Aka prototype history 与唯一 SVG 通过定向 contract-v3 回归。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现 caller-owned 发布、Wancher current-hash 恢复、guarded noop 与精确五文件提交</name>
  <files>scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content.ts</files>
  <behavior>
    - Test 1: repo/root/reviewer/remote/path/migration、Phase 104/107 baseline 与 exact target duplicate prerequisites 全部在首个 write transaction 前完成；失败时 owned copy row digest 不变。
    - Test 2: identity/topology transaction 只创建或确认 Phase 113 target，建立唯一 pen -> Wancher made_by 与 Wancher -> pen reverse；不改变 article、True Ebonite、其它颜色或其它 Wancher topology，也不创建 generic True Urushi entity。
    - Test 3: topology 前后 Wancher 非 topology payload/Phase 107 marker unchanged，contract hash 精确变为 one-link-pair post-topology current hash；fact/language/media approvals 写给新 hash，再由 `publishEntity` 恢复品牌，不 replay brand pack。
    - Test 4: Aka pack 在独立 transaction 安装 target-owned payload，随后 current-hash fact/language/media review + `publishEntity`；article URL 只作为正文导航和 source evidence，不产生 article topology。
    - Test 5: terminal state 同时核对 identity、source marker、exact maker/reverse、official/production/prototype scopes、hypothesis status、prototype-spec exclusions、唯一 primary media、current hash/revision、四类 reviews、readiness/public membership、Wancher exact post-topology publication、article/True Ebonite protection与 protected snapshot；全部满足才返回一项 noop。
  </behavior>
  <action>
按 D-01 至 D-03、D-09 至 D-14，以 Phase 112 apply 为直接模式实现 phase-local options/constants/authority/preflight/brand digest/topology/install/review/publish/terminal flow；不要修改或抽取 shared infra。repo authority 仅接受 `/Users/xz/CodeBuddy/fountain-pen-graph` 和 `/Users/xz/Documents/fountain-pen-graph` 两个输入，且 `realpath` 与 `git -C &lt;input&gt; rev-parse --show-toplevel` 均须等于 Documents canonical root；不能把正常 symlink canonicalization 当 blocker，也不能接受第三个路径。

CLI 只接受显式 `--database`、`--owned-root`、`--protected-catalog` 与可选 reviewer。首写前拒绝 inherited `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`，空 reviewer、owned-root 外路径、protected main/sidecar、database symlink/hard-link、PRAGMA client/path mismatch 和未迁移 032 copy；每个 protected check 使用 caller 传入 snapshot，repo authority 与 DB authority 分开验证。

preflight 先验证 Wancher `eOfD77nOeENN`、Dream article `2aoD07lwSYCV`、Phase 104 reclassification、Phase 107 True Ebonite identity/source marker/publication。精确盘点 target ID/slug/name/alias、official Aka product URL 的 entity/source/reference ownership 与 Phase 113 source marker：article reference 是 expected allowlisted navigation evidence；任何 pen owner、generic True Urushi product/series collision 或 alternate exact identity 则 fail closed。首次只允许 target absent；replay 只允许 marker 精确属于 locked target terminal row。禁止自动 merge/redirect/retire/repair alternate identity。

在单一 identity/topology transaction 新建 target 并只保留 `target -> eOfD77nOeENN made_by` 与 `eOfD77nOeENN -> target reverse`。transaction 前捕获 Wancher current hash、Phase 107 source marker、entity/story/reference/spec/media 非 topology digest、article full digest、True Ebonite digest/relation；transaction 后要求 brand digest、article 和 True Ebonite byte/logically equal，brand post hash 只由 exact new pair 导致。对新 brand hash 调用 `recordEntityContentReview` 三类 review 后 `publishEntity`；不得调用 Phase 107 brand pack、不得直接 SQL 写 review/lifecycle/publication/public tables。

用 `loadCuratedEntityPack`/`packId` 在 target-owned transaction 安装 story/source/reference/alias/scope/claim/citation/evidence/spec/timeline/media，随后写 fact/language/media review 并调用 `publishEntity`。terminal noop 必须 fail closed 检查所有 identity/evidence/topology/hypothesis/prototype-exclusion/review/publication/protection 条件，不能在 tampered terminal state 自动 reload、repair 或 re-review。

定向单 setup 测试、`tsc --noEmit`、计划内 TypeScript Biome、SVG XML 和五路径 `git diff --check` 全部通过后才处理 Git。要求 index 预先为空；仅显式 stage frontmatter 五个产品路径，注意仓库 unanchored `data/` ignore 可能要求只对本计划的 `scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.ts` 使用精确 `git add -f`。排序比较 cached path set、运行 cached diff check；集合异常只撤销本包五路径 staging 后停止。禁止 `git add .`、glob add、stash、clean、reset、checkout、force、删除或覆盖 unrelated dirty/untracked。

提交 `feat(content): publish Wancher Dream Pen True Urushi Aka Tamenuri`，再用 `git show --name-only --format=` 证明唯一产品 commit 恰含五个 frontmatter product paths。PLAN、SUMMARY 与其它 docs 不进入产品提交；产品提交完成后再按 execute workflow 写本 quick 目录 `SUMMARY.md`，记录 source locators/retrieval date、article URL exception、identity、brand-claim/production/hypothesis/prototype boundaries、brand hash/no-replay、single-setup test、tamper/noop、protected snapshot、验证命令、commit hash及 partial-batch 声明。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.ts scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content.ts tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase113/wancher/wancher-dream-pen-true-urushi-aka-tamenuri.svg &amp;&amp; git diff --check -- .planning/content-research/wancher-dream-pen-true-urushi-aka-tamenuri-phase113.md scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.ts scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content.ts tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts public/images/library/site-original/phase113/wancher/wancher-dream-pen-true-urushi-aka-tamenuri.svg</automated>
  </verify>
  <done>Aka Tamenuri 在 caller-owned copy 经 current-hash reviews/publish，Wancher brand 以 post-topology hash 恢复且不 replay，single-setup、tamper/noop/protected catalog/alias gates 通过，唯一产品 commit 精确五文件。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Live official page -> current pack | 当前 Wancher exact listing 的品牌事实、配置、价格、库存和 add-to-cart 会变化；只有 retrieved-date 可定位且正确归因的内容能进入 current scope。 |
| Brand claim -> independent fact | Wajima hand-work 与至少三个月流程来自 Wancher；2019 certificate evidence 不能自动把全部 current units 的品牌主张升级为独立事实。 |
| 2019 review -> production-order evidence | 作者和父亲的量产订单、父亲 Aka、Taya Shikkiten certificate 与 fewer-layers hypothesis 具有单一订单和作者推测边界。 |
| 2018 reviews -> historical family context | 两篇文章都是 black prototypes 且分别为 loaned／Wancher-supplied，不是 Aka；其配置、测量与体验不能流入 current SKU。 |
| Series article -> exact product identity | Phase 104 article 可能已引用 exact official URL；article evidence 必须保留，但不能被误当 SKU donor 或绕过 pen duplicate preflight。 |
| New made_by pair -> Wancher publication | migration 032 将 topology 纳入品牌 contract；旧 Phase 107 approvals 不能覆盖 post-topology hash。 |
| Caller/repo alias -> phase-local apply | repo root、database path、owned root、protected snapshot、reviewer/env 由 caller 提供；错误 alias 或 path 可能写入真实 catalog。 |
| Dirty worktree -> exact product commit | 工作区已有 unrelated modified/untracked；宽泛 staging 会污染产品提交或覆盖他人工作。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-113-01 | Spoofing | current official listing | high | mitigate | Task 2 锁定 exact Wancher URL、retrieved=2026-07-21 与 locators；brand claims 保留归因，price/stock/add-to-cart 不进 stable specs。 |
| T-113-02 | Spoofing | 2019 production-order evidence | high | mitigate | Tasks 1/2 锁定 exact Pencilcase URL、production-order/father-Aka/certificate/no-affiliate scope；证书不推广到全部 current units。 |
| T-113-03 | Tampering | fewer-layers hypothesis | high | mitigate | Tasks 1/2 要求 hypothesis/qualified status 与作者归因；禁止变成确定层数、官方流程反证或 current stable fact。 |
| T-113-04 | Tampering | 2018 prototype transfer | critical | mitigate | Tasks 1/2 分离 loaned 与 supplied black prototype scopes，并结构排除 measurements/weight/steel nib/experience 从 current Aka claims/specs。 |
| T-113-05 | Tampering | article URL duplicate exception | critical | mitigate | Tasks 1/3 allowlist Phase 104 article reference，但对任何 pen owner、alternate target ID/slug/alias/source marker 首写前 fail closed；article payload/route digest 必须不变。 |
| T-113-06 | Tampering | repo/database authority | critical | mitigate | Tasks 1/3 只接受 verified CodeBuddy/Documents pair；DB 另以 caller-owned containment、realpath/inode、no symlink/hard-link、PRAGMA path、migration 032 与 protected main/WAL/SHM snapshots 拒绝越权。 |
| T-113-07 | Elevation of Privilege | Wancher/pen publication | critical | mitigate | Task 3 验证 brand non-topology unchanged + exact post-topology hash，再对 current hash review并用 `publishEntity`；target 同路径，禁止 direct lifecycle/review/public writes 与 brand replay。 |
| T-113-08 | Repudiation | prototype provenance | medium | mitigate | Tasks 1/2 保存 loaned 与 Wancher-supplied disclosures、black/non-Aka identity 与 source-specific locators，不伪装成 production Aka ownership evidence。 |
| T-113-09 | Information Disclosure | remote credentials | high | mitigate | apply 拒绝 remote selectors，不读取或打印 token；本 Phase 不消费凭据、不新增 secret。 |
| T-113-10 | Denial of Service | duplicate migration runner | medium | mitigate | Task 1 使用单个 top-level setup/migration chain，fault cases 从 owned checkpoint 派生；不以 hooks 重跑 Phase 104/107 migration。 |
| T-113-11 | Denial of Service | scope expansion | low | accept | 本次只做单 SKU、单 integration test、tsc、owned-file Biome/XML/diff；不增加 Playwright、search、LLM、shared infra 或 full-site acceptance。 |
| T-113-12 | Tampering | exact product commit | high | mitigate | 空 index、五文件显式 allowlist、cached diff 与 post-commit path proof；PLAN/SUMMARY/docs later，unrelated dirty/untracked 原样保留。 |
| T-113-SC | Tampering | package supply chain | low | accept | Phase 113 不安装或升级 npm、pip、cargo package；若执行中出现 package install 需求即停止并重新规划。 |

</threat_model>

## Source Coverage Audit

| SOURCE | ID | Feature / Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 一个 exact Wancher Dream Pen True Urushi Aka Tamenuri canonical page，链接既有 brand/article，证据 scope 与发布安全闭环 | 1-3 | COVERED | identity、content、media、topology、review/publish、noop、catalog/commit protection 全覆盖。 |
| REQ | QUICK-260721-JXC | Phase 113 Aka Tamenuri partial-batch 交付 | 1-3 | COVERED | 单计划三任务完整覆盖。 |
| RESEARCH | R-01 | Phase 104 article identity/route 与 exact official Aka URL navigation reference 保持不变 | 1,3 | COVERED | article URL 例外 + pen duplicate fail-closed。 |
| RESEARCH | R-02 | Phase 107 Wancher brand/True Ebonite baseline、CuratedEntityPack 与 exact SKU-to-series pattern | 1-3 | COVERED | 复用 brand，不 replay；body 链接 article。 |
| RESEARCH | R-03 | Phase 112 exact URL exception、verified repo alias、post-topology brand current-hash recovery 与五文件提交 | 1,3 | COVERED | repo/DB authority 分离、non-topology digest、review/publish/noop。 |
| CONTEXT | D-01 | exact stable Aka Tamenuri ID/slug/name；不复用或合并其它 identity | 1-3 | COVERED | exact new pen identity。 |
| CONTEXT | D-02 | 复用 Wancher brand 与 Dream Pen article；不建 generic True Urushi series或合并其它颜色 | 1-3 | COVERED | made_by/reverse + body navigation；article/其它颜色不变。 |
| CONTEXT | D-03 | official exact URL article-reference exception + pen identity/source duplicate fail-closed | 1,3 | COVERED | article evidence allowlisted，pen duplicate拒绝。 |
| CONTEXT | D-04 | official ebonite/urushi、Wajima、三个月、C/C、nib/feed/clip current claims | 1,2 | COVERED | stable specs与 qualified brand claims分离。 |
| CONTEXT | D-05 | mutable price/stock/add-to-cart 不进 stable specs | 1,2 | COVERED | retrieved-date snapshot only。 |
| CONTEXT | D-06 | 2019 production order、father Aka、Taya Shikkiten certificate、no affiliate | 1,2 | COVERED | 独立 production-order scope。 |
| CONTEXT | D-07 | fewer-layers 必须保留为作者 hypothesis | 1,2 | COVERED | qualified/hypothesis evidence，不升级事实。 |
| CONTEXT | D-08 | 2018 black prototypes 只作 family history，禁止 measurements/weight/steel nib transfer | 1,2 | COVERED | loaned/supplied disclosures与 current-spec exclusions。 |
| CONTEXT | D-09 | Wancher post-topology current-hash review/publish；不 replay brand pack | 1,3 | COVERED | Phase 107 non-topology baseline保持。 |
| CONTEXT | D-10 | caller-owned DB、protected catalog、tamper/noop | 1,3 | COVERED | migration 032、current hashes、protected snapshots。 |
| CONTEXT | D-11 | single-setup test，避免 duplicate migration runner | 1,3 | COVERED | one top-level fixture/migration chain。 |
| CONTEXT | D-12 | no shared infra/Playwright/search/LLM | 1-3 | COVERED | phase-local implementation与定向验证。 |
| CONTEXT | D-13 | protect dirty/untracked、exact five-file product commit、docs later | 3 | COVERED | 五文件 allowlist与 post-commit proof。 |
| CONTEXT | D-14 | partial batch only | 3 | COVERED | SUMMARY 不声称 Wancher/Phase 23/全站完成。 |

Deferred ideas: generic True Urushi series、其它漆色、production migration、remaining Wancher/Dream Pen models、full-site acceptance、generic readiness/search/LLM、Playwright and shared infrastructure are outside this partial batch. Source audit has no missing items.

## Pre-Mortem and Reachability Check

1. **最可能失败：Phase 104 article 已引用 exact product URL，preflight 把它误判为已有 SKU。** Mitigation: 显式 allowlist article reference，同时对任何 pen ownership/alternate identity fail closed；article digest/route 不变。
2. **最可能失败：2019 作者 hypothesis 被写成漆层事实，或证书被推广成所有 current units 的 provenance。** Mitigation: hypothesis status、author attribution、order-scoped certificate 与 brand-claim separation 的结构断言。
3. **最可能失败：2018 black prototype 的重量、测量或 steel nib 被复制到当前 Aka。** Mitigation: source-specific prototype scopes、non-Aka assertions与 current-spec cross-exclusion tests。
4. **最可能失败：新增 made_by 使 Wancher hash 变化，却沿用旧 review 或 replay Phase 107 pack。** Mitigation: brand pre/post hash、non-topology digest、expected exact link pair、current-hash reviews + `publishEntity`、no-replay assertion。
5. **最可能失败：多个 hooks 重跑迁移触发 duplicate migration runner，或测试/提交碰到真实 catalog/脏工作树。** Mitigation: 单 top-level setup、checkpoint-derived faults、verified repo pair、caller-owned DB gates、protected sidecar snapshots、空 index与五文件 allowlist。

Reachability is complete: Phase 104 navigation fixture + Phase 107 Wancher/True Ebonite baseline -> exact target/source inventory with article-reference exception -> new stable Aka identity -> unique made_by/reverse pair -> Wancher expected post-topology hash -> current-hash reviews + publishEntity -> Aka CuratedEntityPack -> current-hash reviews + publishEntity -> public_entities -> Wancher reverse navigation and body link to `/article/wancher-dream-pen`. No artifact depends on a generic series, another color, shared-infra change, package install, protected-catalog write or later production rollout.

<verification>

1. `node --import tsx --test tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts` passes as one top-level setup/migration chain entirely on caller-owned checkpoint copies and proves protected main/WAL/SHM equality.
2. `pnpm exec tsc --noEmit --pretty false` passes; Biome passes the three Phase 113 TypeScript files; the SVG passes `xmllint --noout`.
3. Body exceeds 2,000 Unicode characters and has qualified official claims, independent 2019 production-order evidence, explicit no-affiliate disclosure, hypothesis status, two disclosed prototype scopes and one unique approved primary SVG.
4. Exact product preflight allows the Phase 104 article URL reference but rejects any alternate pen identity/slug/alias/source URL/marker or generic-series collision before write; article and True Ebonite digests remain unchanged。
5. First apply publishes one target and restores Wancher on the exact post-topology hash without pack replay；tampered identity/link/source/scope/hypothesis/media/review/publication states fail closed；pristine replay returns one noop。
6. No 2018 prototype measurement、weight、steel nib or experience appears in current Aka stable specs；no other color or generic True Urushi entity is created。
7. CodeBuddy alias and Documents canonical root both pass repo authority while any third root fails；all DB writes stay in owned copies and protected catalog snapshots remain unchanged。
8. `git show --name-only --format=` proves the only product commit contains exactly five frontmatter paths；PLAN/SUMMARY/docs and unrelated dirty/untracked are absent。

</verification>

<success_criteria>

- Wancher Dream Pen True Urushi Aka Tamenuri 是一个 unique canonical pen，并只通过唯一 made_by/reverse pair 连接既有 Wancher；它通过正文链接既有 Dream Pen article，但不建 generic True Urushi series、不改 article、不合并其它颜色。
- current official listing、2019 production-order evidence 与两篇 2018 non-Aka prototype sources 各自具有可审计 source/scope/citation；brand claims、certificate 与 hypothesis 不越权，prototype 配置不进入 current stable specs。
- 2k+ 中文、CuratedEntityPack、唯一原创 SVG、current-hash fact/language/media/publication reviews 与 public membership 全部通过。
- Wancher non-topology Phase 107 payload/source marker unchanged，contract hash只按 exact new topology 合法改变并重审恢复；single-setup、protected catalog、tamper/noop、TypeScript/Biome/XML/diff 与 repo alias gates 全部通过。
- 唯一产品提交精确五文件；PLAN/SUMMARY/docs 后续另行记录，并诚实声明 Phase 113 是 partial batch。

</success_criteria>

<output>
Create `.planning/quick/260721-jxc-phase-113-wancher-dream-pen-true-urushi-/SUMMARY.md` only after the exact five-file product commit completes. Do not include PLAN.md, SUMMARY.md or any other docs in the product commit.
</output>
