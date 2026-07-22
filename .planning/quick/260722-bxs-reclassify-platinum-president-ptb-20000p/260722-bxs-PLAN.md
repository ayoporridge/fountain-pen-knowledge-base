---
phase: quick
plan: 260722-bxs
slug: reclassify-platinum-president-ptb-20000p
type: execute
status: ready
wave: 1
depends_on: []
autonomous: true
created_at: 2026-07-22
requirements:
  - QUICK-260722-BXS
files_modified:
  - .planning/content-research/platinum-president-ptb-20000p-phase122.md
  - scripts/data/phase122-platinum-president-ptb-20000p.ts
  - scripts/apply-phase122-platinum-president-ptb-20000p-content.ts
  - tests/content/phase122-platinum-president-ptb-20000p.test.ts
  - public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg
must_haves:
  truths:
    - "既有 draft pen `a1t4DNomp4Ge` 原位改名为 `Platinum President PTB-20000P`、slug 改为 `platinum-president-ptb-20000p` 并发布；不创建第二个 President entity。"
    - "旧 route `/pen/白金-platinum-总统-president` 通过既有 DB `entity_redirects` permanent pattern 指向新 route；原有 aliases `Platinum President`、`白金 总统 President` 保留，旧 canonical name `白金 Platinum 总统 President` 作为 alias 保留。"
    - "2026-07-22 日本官网产品页的当前快照精确形成三个 variants：`#1 Black`、`#10 Wine Red`、`#59 Blue`；¥74,800 与在售展示仅是该文档/日期的 snapshot，不外推为永久 availability。"
    - "PTB-20000P 的 18K（18-21）双色/局部镀铑尖、UEF/EF/F/M/B/C、AS 树脂、142 mm × 16 mm、21 g、Converter-800A 与蓝黑墨囊均由 exact official product locator 支撑。"
    - "President brand 页只支撑 line positioning、18K long nib、重心偏后，以及该页所示 PTB-20000P Black/Wine Red 与 separate PTB-25000PR Black；其 two-card navigation 与产品页 Blue 是 document-specific current snapshots，不被写成冲突或长期承诺。"
    - "2019-2020 official catalog 的 PTB-20000P 三色/规格只进入 dated historical scope，不能证明 2026 availability。"
    - "PenHero 只支撑其 2025-10-31 `1994-Present` 文章的 revival/timeline、AS resin、nib range、measurements 与带不确定性的历史 #11/#59/#67、PTB-28000P、USA discontinuation boundary；loaned pens 未书写，因此观察仅属 collection/inspection scope。"
    - "Andrew Lensky 2023-03 只支撑一支 Red Wine、18K、页面自身 EF/UEF 标识不一致的 exact sample；保留歧义而不猜解，143/123/13.4/11 mm、21.6 g dry、1.25 turns、供墨与所有线条/流量/书写观察都只属于调整后的该样笔。"
    - "PTB-25000PR、President Kaga Maki-e/ballpoints、historical PTB-28000P、PTW-15000P 与 colour editions 只作 sibling/history exclusions，不成为目标 variant、alias、spec 或 entity。"
    - "自然中文 summary 为 60-160 Unicode 字符、body 至少 2,000 Unicode 字符；唯一 site-original factual SVG 以独有构图清晰表达 current/document/history/sample 四类边界。"
    - "目标继续保有且仅保有原来的一对关系：pen `a1t4DNomp4Ge` `made_by` Platinum `e51tJpejEkXY`，以及 Platinum 到该 ID 的 `reverse`；Phase 122 不新增、删除或重建 brand topology，Platinum、#3776、Curidas、Procyon 保持保护状态。"
    - "apply 只接受 exact raw initial state 或 exact Phase 122 terminal state；identity、aliases、legacy owner IDs、五个 source URLs、source marker、redirect、pack paths、scopes、variants、media、reviews/publication 任一 alternate/partial/tampered 状态都在写入或 noop 前 fail closed。"
    - "所有 migration、apply、review、publish、replay、tamper 与查询写入只发生在 caller-owned checkpoint copy；真实 `data/fpkg.db` main/WAL/SHM 全程 byte-for-byte 不变。"
    - "唯一产品提交精确包含五个 frontmatter paths，subject 精确为 `feat(content): reclassify Platinum President PTB-20000P`；其后创建带 prefixed filename 的未提交 SUMMARY，并声明本轮只是 active full-corpus goal 的 partial batch。"
  artifacts:
    - path: ".planning/content-research/platinum-president-ptb-20000p-phase122.md"
      provides: "60-160 字 summary、2,000+ 自然中文正文、逐字段 source ledger，以及 current/document/history/sample/exclusion 边界"
    - path: "scripts/data/phase122-platinum-president-ptb-20000p.ts"
      provides: "same-ID identity、legacy aliases、五个 authoritative sources、three current variants、scopes/claims/spec evidence/rejected evidence/timeline/media contract"
    - path: "scripts/apply-phase122-platinum-president-ptb-20000p-content.ts"
      provides: "exact raw-or-terminal authority、same-ID rename、DB permanent redirect、legacy payload replacement、current-hash review/publish 与 guarded noop"
    - path: "tests/content/phase122-platinum-president-ptb-20000p.test.ts"
      provides: "single-setup same-ID/old-route/source-scope/topology/protected entities/first-noop-tamper/real-catalog regression"
    - path: "public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg"
      provides: "current product、brand navigation、dated history 与 adjusted sample 四边界的唯一原创 factual SVG"
  key_links:
    - from: "scripts/data/phase122-platinum-president-ptb-20000p.ts"
      to: "scripts/apply-phase122-platinum-president-ptb-20000p-content.ts"
      via: "CuratedEntityPack、locked raw/canonical constants、source/scope keys 与 stable pack marker"
    - from: "/pen/白金-platinum-总统-president"
      to: "/pen/platinum-president-ptb-20000p"
      via: "same identity transaction 内写入的 permanent entity_redirects row"
    - from: "a1t4DNomp4Ge"
      to: "e51tJpejEkXY"
      via: "既有且不变的唯一 made_by/reverse pair；不是 Phase 122 新 topology"
    - from: "official product / brand navigation / dated catalog / PenHero / Lensky"
      to: "current exact variants and specs / document snapshot / history / inspection / adjusted-sample claims"
      via: "不可跨接的 citation-locator-scope-spec-evidence chains"
---

# Quick Task 260722-bxs: Reclassify Platinum President PTB-20000P

<objective>
把已有 raw President 草稿 `a1t4DNomp4Ge` 原位收敛为唯一 canonical `Platinum President PTB-20000P`，保留旧名称与旧路由入口，以官网当前产品事实为主轴，并把品牌导航、历史目录、PenHero 历史观察和 Lensky 调整后样笔严格隔离后发布。

Purpose: 让读者得到可核验的当前 PTB-20000P 页面，同时避免把不同文档的 colour cards、历史 SKU、地区停售信息和单支调整后样笔观察拼成错误的永久产品承诺。
Output: 一份 2k+ reviewed copy、一个 same-ID CuratedEntityPack、一个 phase-local guarded apply、一项 single-setup targeted integration regression 与一张独有 factual SVG。
</objective>

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/STATE.md
@.planning/quick/260719-4a2-lamy-platinum-content/260719-4a2-PLAN.md
@.planning/quick/260719-4a2-lamy-platinum-content/260719-4a2-SUMMARY.md
@scripts/data/phase42-lamy-platinum.ts
@scripts/apply-phase42-lamy-platinum-content.ts
@tests/content/phase42-lamy-platinum.test.ts
@.planning/content-research/platinum-curidas-phase78.md
@scripts/data/phase78-platinum-curidas.ts
@scripts/apply-phase78-platinum-curidas-content.ts
@tests/content/phase78-platinum-curidas.test.ts
@.planning/quick/260721-phase-117-aurora-optima-family-current-pens/PLAN.md
@.planning/quick/260721-phase-117-aurora-optima-family-current-pens/SUMMARY.md
@scripts/apply-phase117-aurora-optima-family-current-pens-content.ts
@tests/content/phase117-aurora-optima-family-current-pens.test.ts
@.planning/quick/260722-ba3-publish-the-missing-platinum-procyon-pns/260722-ba3-PLAN.md
@.planning/quick/260722-ba3-publish-the-missing-platinum-procyon-pns/260722-ba3-SUMMARY.md
@scripts/data/phase121-platinum-procyon-pns-5000.ts
@scripts/apply-phase121-platinum-procyon-pns-5000-content.ts
@tests/content/phase121-platinum-procyon-pns-5000.test.ts
@scripts/import-model-gap-sources.ts
@scripts/import-read-first-b-mainstream-articles.ts
@scripts/lib/curated-content-pack.ts
@src/lib/audit/read-only-catalog.ts
@src/lib/publication.ts

<interfaces>
- `CuratedEntityPack` 通过 `markdownFile` 读取 `## summary` 与 `## body_md`；`loadCuratedEntityPack(workspaceRoot, pack)` 产生 stable source marker，所有 pack-owned payload IDs 必须稳定且可重放。
- `recordEntityContentReview(client, { entityId, reviewKind, reviewer, status, notes })` 只用于 fact/language/media approvals；`publishEntity(client, { entityId, reviewer })` 负责 publication review/current snapshot。禁止 direct lifecycle/review/publication/public SQL。
- existing DB route pattern 是在 identity transaction 内写 `entity_redirects(source_path,target_path,redirect_kind='permanent')`，并拒绝 conflicting owner；Phase 78 Curidas、Phase 42 #3776 与 Phase 50 等均为直接 analog，因此无需修改 `src/lib/entity-redirects.ts`。
- locked target raw state：ID `a1t4DNomp4Ge`、type `pen`、slug `白金-platinum-总统-president`、name `白金 Platinum 总统 President`、summary Unicode length 92、body Unicode length 173、aliases 精确含 `Platinum President` 与 `白金 总统 President`；legacy marker IDs 含 `source-platinum-president-public-search`、`spec-platinum-president-research`、`claim-platinum-president-source-boundary`、`story-model-platinum-president-research`。执行器须在 owned copy 上把完整 raw row/payload/owner set 锁成 baseline digest，不能只按长度判断。
- locked terminal identity：仍是 ID `a1t4DNomp4Ge`，name `Platinum President PTB-20000P`，slug `platinum-president-ptb-20000p`；原有两个 aliases 原样保留，并新增旧 exact canonical name `白金 Platinum 总统 President` 为 alias。不得创建第二 President、PTB-20000P、颜色或 review-sample entity。
- locked topology：`a1t4DNomp4Ge` 仅有一条 `made_by` 指向 Platinum `e51tJpejEkXY`，Platinum 仅有一条对应 `reverse` 指回同一 ID。Phase 122 必须验证并保留现有 relationship row IDs/reasons，不能 delete/reinsert，也不能触发 brand hash/review/publication变化。
- protected entities：Platinum brand `e51tJpejEkXY`、#3776 Century `ekPMWnot9inz`、Curidas `BoZ4C2WSqk0K`、Procyon `phase121-platinum-procyon-pns-5000`。除 target 本身外，其 full payload/topology/publication digest均须前后相等。
- repo authority只接受 `/Users/xz/CodeBuddy/fountain-pen-graph` 与 `/Users/xz/Documents/fountain-pen-graph`，两者 `realpath` 与 `git rev-parse --show-toplevel` 必须指向同一 canonical repo；DB authority另验证 caller-owned containment、无 symlink/hard-link、protected main/WAL/SHM snapshot、PRAGMA client/path 与 migration 032。

<decisions>
- D-01：原位保留 `a1t4DNomp4Ge`，canonicalize 为 `Platinum President PTB-20000P` / `platinum-president-ptb-20000p`，不建第二 President。
- D-02：保留两个旧 aliases，并把旧 exact entity name 加为 alias；旧 raw route 用 DB permanent redirect 指向新 route。
- D-03：current variants 精确三色 #1/#10/#59；¥74,800 和 availability 仅是 retrieved 2026-07-22 product-page snapshot。
- D-04：产品稳定规格只从 exact official product locator 进入 qualifying evidence。
- D-05：brand page 的 two-card view 与 product page 的 Blue 并列为 document snapshots；PTB-25000PR 是 separate sibling。
- D-06：2019-2020 catalog 只支撑 dated history/spec，不证明 2026 availability。
- D-07：PenHero 只支撑标明 uncertainty/USA boundary 的 history/inspection；loaned pens 未书写，不产生 writing-sample claims。
- D-08：Lensky 页面 EF/UEF 标识冲突原样保存为 ambiguity；尺寸、cap turns 与 writing observations 均限 adjusted Red Wine sample。
- D-09：PTB-25000PR、Kaga Maki-e/ballpoints、PTB-28000P、PTW-15000P 与 colour editions 是 sibling/history exclusions，不扩成 variants/entities。
- D-10：summary 60-160、body 2k+、unique factual SVG，正文与图都表达 current/document/history/sample boundaries。
- D-11：保留 exact relationship rows；不改 Platinum topology，不重审/重发 brand，不 replay Phase42/78/121 packs。
- D-12：只接受 exact raw 或 exact terminal；identity/alias/source-owner/marker/redirect/payload/review/publication tamper fail closed，不自动 repair。
- D-13：所有写入仅在 caller-owned checkpoint copy；single setup 证明 first/noop/tamper 与真实 main/WAL/SHM 不变。
- D-14：exact five-file product commit + exact subject；后置未提交 prefixed SUMMARY；不扩 shared infra、Playwright、search/LLM、schema/package，本轮仅为 active full-corpus goal partial batch。
</decisions>
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 先锁定 same-ID raw-or-terminal、source scopes、旧路由与保护边界</name>
  <files>tests/content/phase122-platinum-president-ptb-20000p.test.ts</files>
  <behavior>
    - Test 1: 一个 top-level setup 只创建一次 caller-owned checkpoint copy，迁移到032，并用现有 Phase42/78/121 apply 建立或确认 locked Platinum/#3776/Curidas/Procyon prerequisites；真实 main/WAL/SHM bytes 在首个 DB client 前快照。
    - Test 2: 首次入口精确匹配 raw ID/type/name/slug、92/173 lengths、legacy payload IDs、两个 aliases、draft/publication状态、source/reference owners与原 made_by/reverse row IDs/reasons；alternate state在首写前拒绝且 owned digest不变。
    - Test 3: first apply 后仍只有 ID `a1t4DNomp4Ge` 一个 President/PTB-20000P pen；canonical name/slug精确，旧两个 aliases与旧 exact name alias均存在，无 sibling/history/sample entity。
    - Test 4: `/pen/白金-platinum-总统-president` 只有一条 permanent DB redirect指向新 route；canonical route可由 published pen解析，conflicting/duplicate redirect fail closed。
    - Test 5: current variants精确是 #1 Black/#10 Wine Red/#59 Blue并绑定2026-07-22 product source；brand-page Black/Wine Red cards和PTB-25000PR、catalog三色均存于各自scope，不能改变current exact set。
    - Test 6: official stable specs逐字段有direct citation；product price/current listing、brand navigation和catalog availability全部带document/date qualifier。
    - Test 7: PenHero保存author/title/published date、1994 revival、history/measurements/uncertainty/USA boundary与no-writing scope；Lensky保存2023-03、Red Wine、18K、EF/UEF ambiguity、adjusted-before-test、exact measurements/cap/filling和sample-only writing observations。
    - Test 8: PTB-25000PR、Kaga Maki-e/ballpoints、PTB-28000P、PTW-15000P与colour editions进入rejected/sibling/history evidence且不qualify target variant/spec/alias/entity。
    - Test 9: target made_by/reverse row IDs/reasons和exact pair前后相等；Platinum、#3776、Curidas、Procyon full digests/publications前后相等，Phase42/78/121 brand packs没有replay。
    - Test 10: source URL被third owner占用、alternate alias/ID/slug/name/source marker/repo pack、legacy owner缺失、partial terminal、scope/variant/spec/media/review/hash/publication tamper全部fail closed且不自动修复。
    - Test 11: pristine replay返回target exact noop且owned digest不变；remote env、空reviewer、第三repo root、owned-root外路径、protected main/sidecar、symlink/hard-link、client/path mismatch、未迁移copy全部拒绝；finally验证真实main/WAL/SHM不变。
  </behavior>
  <action>
按 D-01 至 D-14 先写失败 integration regression。以 Phase78 的 same-ID canonical slug + DB redirect 为identity analog、Phase121 的 single-target/source-scope/authority/noop/tamper为publication analog、Phase117 的 strict terminal current-hash assertions为fail-closed analog；只建立一个setup/migration/prerequisite chain，不扩shared harness或增加browser test。

raw gate不能只检查92/173长度：同时锁定entity字段、draft/publication、两个alias rows、legacy story/spec/claim/source/reference/media owner IDs、source markers、made_by/reverse row IDs/reasons、目标URL当前owners和目标五个repo paths absent。terminal gate则要求locked canonical identity、exact three aliases、single redirect、Phase122 marker/owners、完整scope/variant/spec/media/current-hash reviews/publication。两者之外任何hybrid状态都在首个write transaction前拒绝。

断言基于结构化scope/citation/spec evidence，不用正文keyword数量替代wiring。SVG必须1600x900、site-original/factual/non-photo/non-logo/not-to-scale/not-colour-proof/not-finish-proof，SHA-256不同于Phase42/78/121及全部已有site-original SVG；测试不联网、不下载或读取外部图片。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase122-platinum-president-ptb-20000p.test.ts</automated>
  </verify>
  <done>失败测试完整锁定same-ID raw-or-terminal、旧alias/route、current exact three、history/sample/rejected evidence、unchanged topology、first/noop/tamper、四个protected实体与真实catalog安全。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: 编写 President evidence pack、2k+中文与唯一 factual SVG</name>
  <files>.planning/content-research/platinum-president-ptb-20000p-phase122.md, scripts/data/phase122-platinum-president-ptb-20000p.ts, public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg</files>
  <behavior>
    - Test 1: Markdown summary 60-160 Unicode、body至少2,000 Unicode，语气自然且清楚区分current product、brand-document view、dated history、inspection与adjusted sample。
    - Test 2: pack只绑定既有target ID，导出raw/canonical identity、legacy aliases/owner IDs、protected IDs、五个source URLs、scope keys、exact current set与rejected boundaries。
    - Test 3: current three、official stable specs、brand two-card document view、catalog dated scope、PenHero history/inspection及Lensky adjusted sample各自有完整citation-locator-scope chain。
    - Test 4: SVG是唯一primary media、路径与hash独有、XML合法，并以事实结构而非仿logo/产品照片/真实颜色饰面承诺表达四类边界。
  </behavior>
  <action>
按 D-03 至 D-10 创建一份curated research Markdown、一个单实体data pack和一张unique SVG。source registry精确记录：Japanese official product `https://www.platinum-pen.co.jp/products/fountain-pen/2158/` retrieved 2026-07-22；official President brand `https://www.platinum-pen.co.jp/brands/president/` retrieved 2026-07-22；official catalog `https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf`并记录PDF page/table locator；Jim Mamoulides/PenHero `https://penhero.com/PenGallery/Platinum/PlatinumPresident.htm` published 2025-10-31；Andrew Lensky `https://lenskiy.org/2023/03/modern-platinum-president/` published 2023-03。官网三文档共享Platinum official registry但保留document metadata；PenHero和Lensky使用各自professional_secondary independence groups。

data pack只定义 target `a1t4DNomp4Ge`。current product scope精确写#1/#10/#59、¥74,800 snapshot、18K（18-21）双色/局部镀铑尖、UEF/EF/F/M/B/C、AS resin、142×16mm、21g、Converter-800A与蓝黑墨囊。brand-navigation scope写rearward balance/long nib/line positioning、PTB-20000P Black/Wine Red与separate PTB-25000PR Black，并明确不能否定产品页Blue。catalog只作2019-2020 dated corroboration。

PenHero scope把1994 revival、AS resin、nib range、measurements、#11/#59/#67、PTB-28000P、USA discontinuation边界逐项保存其certainty，不把loaned/inspection写成试写；Lensky scope把页面展示的EF/UEF冲突存为显式ambiguity，所有尺寸、dry weight、1.25 turns、cartridge/converter和adjusted writing/flow只属于该Red Wine sample。所有 sibling/history exclusions用`qualifies:false` spec evidence防止进入current stable fields。

SVG以四个明显分区表达current product table、brand-card snapshot、dated timeline与adjusted sample，标注不按比例、非照片、非logo、颜色/饰面不作实物证明；不得复制官网摄影、Platinum logo或现有Phase42/78/121构图。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase122-platinum-president-ptb-20000p.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg</automated>
  </verify>
  <done>research/data/SVG完整提供自然中文、exact current three、逐文档时态、PenHero inspection与Lensky adjusted-sample边界，且所有 sibling/history 字段被结构化拒绝为target current facts。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现 guarded same-ID reclassification、target-only publication 与 exact product commit</name>
  <files>scripts/apply-phase122-platinum-president-ptb-20000p-content.ts</files>
  <behavior>
    - Test 1: exact raw state在一个identity transaction内原位rename，保留原relationship rows，写same-ID taxonomy action/lineage、旧name alias和old-route permanent redirect。
    - Test 2: legacy raw payload被显式替换为Phase122 marker/owners，无orphan search-only claim/spec/story/source ownership；安装pack后仅target走fact/language/media reviews + publishEntity。
    - Test 3: exact terminal replay在任何写入前完成全契约验证并返回noop；任一partial/tampered状态拒绝且不修复。
    - Test 4:产品commit path set与subject精确，unrelated dirty/untracked、PLAN和后置SUMMARY不进入commit。
  </behavior>
  <action>
按 D-01、D-02、D-11 至 D-14 创建phase-local apply。复用Phase121的repo/database authority、raw/terminal inspect、target current-hash approvals与terminal assertion结构，但将absent/create改为exact raw same-ID rename；复用Phase78的taxonomy rename + DB permanent redirect pattern。只调用现有curated pack/publication/read-only catalog APIs，不修改shared publication、curated-content、readiness、migration/schema、runner、Playwright、search或LLM。

首写前验证canonical repo pair、reviewer/remote env、caller-owned DB containment/realpath/inode/PRAGMA/migration032、protected snapshots、Phase42/78/121 exact prerequisites，以及raw或terminal完整状态。raw状态下用一个identity/payload transaction更新同一entity name/slug，写stable taxonomy batch/action/lineage、保留两个旧aliases并加入旧exact name alias、写old-route permanent redirect；conflicting alias/slug/redirect/source owner全部拒绝。显式删除仅属于target的legacy search-only/story/spec/claim/reference/source/media/review/publication payload，再安装Phase122 pack；不得碰made_by/reverse rows，transaction前后比较row IDs/reasons和Platinum reverse set完全相等。

pack安装后只对target当前hash调用`recordEntityContentReview`的fact/language/media与`publishEntity`。不得重审或publish Platinum brand，不得replay Phase42/78/121 packs，不得direct SQL写target/brand lifecycle、reviews、entity_publications或public_entities。terminal assertion必须覆盖identity/aliases/redirect、source owners/markers、scope/current variants/rejected evidence/spec/media、current-hash四reviews/readiness/public membership、exact unchanged relationship rows、四个protected digests；全部完整才返回单target noop。

定向test、tsc、owned TS Biome、SVG XML与five-path diff check通过后处理Git。先要求index为空并记录unrelated dirty/untracked path/status snapshot；只显式stage frontmatter五路径，若exact data文件被既有ignore命中仅对该文件使用`git add -f`。比较cached path set、`git diff --cached --check`和no-deletion；异常只unstage本包五路径并停止。禁止wide/glob add、stash、clean、reset、checkout、force或修改现有unrelated worktree内容。

提交subject精确为 `feat(content): reclassify Platinum President PTB-20000P`，用`git show --name-only --format=`证明唯一产品commit恰含五个frontmatter paths。PLAN不进产品commit；产品commit后才创建 `.planning/quick/260722-bxs-reclassify-platinum-president-ptb-20000p/260722-bxs-SUMMARY.md`，记录same ID/old+new routes、source locators/dates、EF/UEF ambiguity、relationship rows unchanged、protected entities、single setup、tamper/noop、验证命令、commit hash与partial-batch声明。SUMMARY保持uncommitted，不把本批描述成full corpus完成。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase122-platinum-president-ptb-20000p.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase122-platinum-president-ptb-20000p.ts scripts/apply-phase122-platinum-president-ptb-20000p-content.ts tests/content/phase122-platinum-president-ptb-20000p.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg &amp;&amp; git diff --check -- .planning/content-research/platinum-president-ptb-20000p-phase122.md scripts/data/phase122-platinum-president-ptb-20000p.ts scripts/apply-phase122-platinum-president-ptb-20000p-content.ts tests/content/phase122-platinum-president-ptb-20000p.test.ts public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg</automated>
  </verify>
  <done>same-ID canonical rename、旧alias/route、Phase122 payload、target-only current-hash publication、exact noop/tamper、unchanged relationship/protected entities与真实catalog均通过；唯一产品commit精确五文件，prefixed SUMMARY已创建但未提交。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Raw draft -> canonical published pen | 同一stable ID必须从唯一精确raw状态转换；不能新建第二President或接受partial migration。 |
| Old name/slug -> aliases/redirect | 名称保存由alias负责，route保存由DB permanent redirect负责；冲突owner必须首写前拒绝。 |
| Official product -> current facts | 产品页的三色、价格与availability是retrieved snapshot；brand cards和dated catalog不能覆盖它。 |
| History/inspection/sample -> stable specs | PenHero uncertainty/no-writing与Lensky adjusted EF/UEF sample均不能被泛化成全型号事实。 |
| Existing maker topology -> target publication | Phase122只改target content hash，不得删除重建relationship或改变Platinum hash/publication。 |
| Caller/repo alias -> catalog | repo alias、DB path、reviewer/env来自caller；错误authority可能污染真实catalog。 |
| Dirty worktree -> product commit | unrelated research/next-phase/quick artifacts已存在；宽泛stage会夹带用户工作。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-122-01 | Spoofing | President identity/aliases | critical | mitigate | Task1/3首写前对ID/type/name/slug/aliases/raw owner IDs/source markers做exact raw-or-terminal inventory；alternate/partial拒绝。 |
| T-122-02 | Tampering | old route | high | mitigate | Task1/3只允许exact DB permanent redirect；duplicate/conflicting source owner fail closed，test验证解析目标。 |
| T-122-03 | Tampering | source qualification | high | mitigate | Task1/2以独立product/brand/catalog/history/inspection/sample scopes和qualifies:false evidence隔离字段。 |
| T-122-04 | Repudiation | content reviews/publication | high | mitigate | Task3记录reviewer/current hash并仅经recordEntityContentReview + publishEntity发布target；SUMMARY记录命令/commit。 |
| T-122-05 | Tampering | maker topology | critical | mitigate | Task1/3比较relationship IDs/reasons与Platinum reverse set前后完全相等；禁止delete/reinsert与brand re-review。 |
| T-122-06 | Elevation of Privilege | repo/database authority | critical | mitigate | Task1/3验证canonical repo pair、owned containment、realpath/inode/PRAGMA/migration032和protected main/WAL/SHM snapshots。 |
| T-122-07 | Denial of Service | terminal replay/tamper | medium | mitigate | Task1/3仅完整terminal可noop；任何hybrid/source/scope/media/review/publication tamper失败且不repair。 |
| T-122-08 | Information Disclosure | dirty/untracked worktree | medium | mitigate | Task3只读取status/path集合并显式stage五个owned files，不移动、提交或清理unrelated内容。 |
| T-122-09 | Tampering | product commit | high | mitigate | Task3要求空index、exact cached path set、cached diff/no-deletion与post-commit path proof；异常只unstageowned paths。 |
| T-122-SC | Tampering | package supply chain | low | accept | 本计划无package install或dependency变更；现有lockfile和工具链不变。 |

</threat_model>

<source_audit>

| SOURCE | ID | Feature/Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 原位重分类并发布唯一 Platinum President PTB-20000P，保留旧入口与证据边界 | 1-3 | COVERED | identity/content/route/topology/publication/safety完整。 |
| REQ | QUICK-260722-BXS | Phase122 President partial batch | 1-3 | COVERED | frontmatter requirement映射到全部tasks。 |
| RESEARCH | R-01 | official product exact PTB-20000P/current three/price/nib/spec/filling | 1-3 | COVERED | direct product citations + snapshot qualifier。 |
| RESEARCH | R-02 | official brand positioning/two-card snapshot/PTB-25000PR boundary | 1-3 | COVERED | independent document scope。 |
| RESEARCH | R-03 | 2019-2020 catalog dated three colours/specs | 1-3 | COVERED | historical only。 |
| RESEARCH | R-04 | PenHero 1994 revival/history/uncertainty/USA/no-writing boundary | 1-3 | COVERED | professional inspection scope。 |
| RESEARCH | R-05 | Lensky adjusted Red Wine sample/EF-UEF ambiguity/measurements/writing | 1-3 | COVERED | sample-only claims。 |
| RESEARCH | R-06 | Phase42/78/117/121 identity, redirect, terminal, publication and protection analogs | 1,3 | COVERED | implementation patterns。 |
| CONTEXT | D-01 | same ID canonical identity, no duplicate | 1,3 | COVERED | exact raw-or-terminal gate。 |
| CONTEXT | D-02 | old aliases/name/route preservation | 1,3 | COVERED | alias rows + DB redirect。 |
| CONTEXT | D-03 | exact current #1/#10/#59 and snapshot boundary | 1-3 | COVERED | variants + date qualifier。 |
| CONTEXT | D-04 | official stable spec allowlist | 1-3 | COVERED | per-field direct evidence。 |
| CONTEXT | D-05 | brand two-card/current product document distinction | 1-3 | COVERED | non-conflict scope。 |
| CONTEXT | D-06 | catalog cannot prove 2026 availability | 1-3 | COVERED | dated history scope。 |
| CONTEXT | D-07 | PenHero history/inspection/no-writing/uncertainty | 1-3 | COVERED | explicit exclusions。 |
| CONTEXT | D-08 | Lensky EF/UEF ambiguity and adjusted-sample limit | 1-3 | COVERED | no guessing/generalization。 |
| CONTEXT | D-09 | sibling/history exclusions | 1-3 | COVERED | rejected evidence, no entities。 |
| CONTEXT | D-10 | 2k+ Chinese + unique factual SVG | 1-3 | COVERED | length/media contracts。 |
| CONTEXT | D-11 | preserve relationship pair, protect Platinum/#3776/Curidas/Procyon | 1,3 | COVERED | exact unchanged digests/rows。 |
| CONTEXT | D-12 | exact raw/terminal only, noop/tamper fail closed | 1,3 | COVERED | authority + terminal contract。 |
| CONTEXT | D-13 | caller-owned single setup and real DB unchanged | 1,3 | COVERED | protected triplet snapshots。 |
| CONTEXT | D-14 | exact five-file commit/uncommitted prefixed SUMMARY/no infra expansion/partial batch | 3 | COVERED | git allowlist + scope fence。 |

Deferred/excluded: PTB-25000PR、President Kaga Maki-e/ballpoints、PTB-28000P、PTW-15000P、colour editions、其它President entities、full Platinum/full corpus completion、production migration/deploy、full-site acceptance、shared publication/readiness/search/LLM infrastructure、Playwright、schema/package changes及unrelated dirty/untracked work均不在本partial batch。Source audit无missing items。

</source_audit>

<pre_mortem>

1. **最可能失败：仅按ID和长度接受已被篡改的raw草稿。** Mitigation: Task1/3锁定完整raw payload/owner/alias/topology digest及legacy IDs，只允许exact raw或exact terminal。
2. **最可能失败：brand页只有两张PTB-20000P card，于是误删产品页Blue或把PTB-25000PR并入variants。** Mitigation: D-03/D-05分离document scopes，current exact set以product page三色为准，brand cards不作全集。
3. **最可能失败：PenHero历史颜色或Lensky调整后写感被写成当前全型号事实。** Mitigation: D-07至D-09使用history/inspection/sample scopes与rejected spec evidence，EF/UEF冲突原样保留。
4. **最可能失败：原位改名时delete/reinsert maker pair导致Platinum hash变化，再错误重放brand pack。** Mitigation: Task1/3锁定relationship row IDs/reasons与reverse set完全不变，只审target current hash。
5. **最可能失败：测试或提交污染真实catalog和unrelated worktree。** Mitigation: single caller-owned checkpoint、protected sidecar snapshots、空index、显式five-path allowlist和post-commit proof。

Reachability is complete: real migration-032 catalog -> caller-owned checkpoint copy -> Phase42/78/121 exact Platinum prerequisites -> exact President raw/terminal inventory -> same-ID rename + legacy alias/DB redirect -> scoped official/history/sample pack + unique media -> target-only current-hash reviews/publication -> canonical public route plus old route resolution -> exact noop/tamper and protected entity/catalog proofs. No artifact depends on shared-infra changes, a second President entity, package install, production catalog write or later rollout.

</pre_mortem>

<verification>

1. `node --import tsx --test tests/content/phase122-platinum-president-ptb-20000p.test.ts` passes on one caller-owned checkpoint setup and proves protected main/WAL/SHM equality.
2. ID `a1t4DNomp4Ge` is the only President/PTB-20000P pen, public at `/pen/platinum-president-ptb-20000p`; old route resolves permanently and all three legacy names remain aliases.
3. Current variants equal #1 Black/#10 Wine Red/#59 Blue; product/brand/catalog document snapshots remain distinct, and all sibling/history/sample exclusions are structurally non-qualifying.
4. PenHero uncertainty/no-writing and Lensky adjusted EF/UEF sample boundaries are preserved without cross-model generalization.
5. Existing made_by/reverse row IDs/reasons, Platinum reverse set, Platinum/#3776/Curidas/Procyon digests/publications remain unchanged; only target is reviewed and published at its current hash.
6. First apply publishes target, pristine replay returns one noop, and raw/terminal identity/alias/source-owner/marker/redirect/scope/variant/spec/media/review/publication/authority tamper fixtures fail closed.
7. `tsc`、owned-file Biome、SVG XML与five-path diff checks通过；产品commit subject/path set精确，PLAN和prefixed SUMMARY保持在commit之外。

</verification>

<success_criteria>

- Platinum President PTB-20000P以same ID和唯一canonical route公开，旧name/aliases/route全部可追溯。
- exact current three、official specs、brand document view、dated catalog、PenHero history/inspection与Lensky adjusted sample均有不可跨接的证据边界。
- 原made_by/reverse pair未被重建，Platinum、#3776、Curidas、Procyon与真实catalog完全受保护。
- exact raw/terminal authority、single-setup first/noop/tamper、TypeScript/Biome/XML/diff与commit gates全部通过。
- 唯一产品commit精确五文件；prefixed SUMMARY后置未提交，并明确full-corpus goal remains active。

</success_criteria>

<output>
Create `.planning/quick/260722-bxs-reclassify-platinum-president-ptb-20000p/260722-bxs-SUMMARY.md` only after the product commit; keep PLAN/SUMMARY outside that product commit, leave the prefixed SUMMARY uncommitted, and state that this Phase122 delivery is only a partial batch in the active full-corpus goal.
</output>
