---
phase: 117-aurora-optima-family-and-current-pens
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/content-research/aurora-optima-family-phase117.md
  - .planning/content-research/aurora-optima-auroloide-996-dor-phase117.md
  - .planning/content-research/aurora-optima-resina-997-cn-phase117.md
  - scripts/data/phase117-aurora-optima-family-current-pens.ts
  - scripts/apply-phase117-aurora-optima-family-current-pens-content.ts
  - tests/content/phase117-aurora-optima-family-current-pens.test.ts
  - src/lib/entity-redirects.ts
  - public/images/library/site-original/phase117/aurora/aurora-optima-family.svg
  - public/images/library/site-original/phase117/aurora/aurora-optima-auroloide-996-dor.svg
  - public/images/library/site-original/phase117/aurora/aurora-optima-resina-997-cn.svg
autonomous: true
requirements:
  - QUICK-260721-PHASE117
must_haves:
  truths:
    - "既有 Aurora Optima 稳定身份 5waoVLPHU2Pt 与 slug aurora-optima 被原位重分类为公开 article `Aurora Optima（系列导航）`；旧 /pen/aurora-optima 308 到 /article/aurora-optima，且不存在第二个泛 Optima。"
    - "Aurora Optima Auroloide 996-DOR 与 Aurora Optima Resina 997-CN 分别以 phase117-aurora-optima-auroloide-996-dor／phase117-aurora-optima-resina-997-cn 两个 exact pen 身份公开。"
    - "三个页面各有 2,000+ Unicode 字符自然中文与一张唯一 factual SVG；三页互相导航，并清楚区分战前 Optima、1992 modern line、current exact SKU、sample context 与 Optima 366 limited boundary。"
    - "family article 没有 publication、maker/reverse、spec、variant、scope/claim/evidence 或其它 pen-only payload；两支 exact pen 各只有 made_by Aurora brand CJXe8UpnkHLJ 及其 exact reverse。"
    - "Aurora brand topology 的唯一 delta 是删除旧 Optima family reverse 并新增两个 exact pen reverse；brand non-topology payload 不变，随后仅对 post-topology current hash 用 recordEntityContentReview + publishEntity 恢复公开。"
    - "Phase 48 Aurora baseline、Phase 114 和 Phase 115 terminal prerequisites、Aurora 88 article/800、Ipsilon article/Demo/Resin 与真实 data/fpkg.db main/WAL/SHM 均保持不变。"
    - "首次 apply 发布三实体，pristine replay 返回三个 noop，任何 partial/tampered/alternate identity/source owner/route/authority 状态均在写入或 noop 前 fail closed。"
    - "唯一产品提交精确包含 frontmatter 的十个路径；PLAN/SUMMARY 后置，unrelated research、.next-phase*、quick 260719-665、Phase 105 与其它 dirty/untracked 原样保留，并明确这是 partial batch。"
  artifacts:
    - path: "scripts/data/phase117-aurora-optima-family-current-pens.ts"
      provides: "锁定 family/exact IDs、slugs、names、official/professional/sample/limited sources、scope keys、article descriptor、two CuratedEntityPack loaders 与 three SVG contracts"
    - path: "scripts/apply-phase117-aurora-optima-family-current-pens-content.ts"
      provides: "same-ID reclassification、safe source-owner migration、exact topology delta、post-topology Aurora review/publish、three-target terminal/noop 与 caller-owned authority"
    - path: "tests/content/phase117-aurora-optima-family-current-pens.test.ts"
      provides: "single owned checkpoint 上的 Phase 48 -> 114 -> 115 baseline、identity/source/route/scope/publication/tamper/noop/protected-catalog regression"
    - path: "src/lib/entity-redirects.ts"
      provides: "pen/aurora-optima -> /article/aurora-optima 的静态 308 allowlist"
  key_links:
    - from: "src/lib/entity-redirects.ts"
      to: "src/middleware.ts"
      via: "现有 getReclassifiedArticlePath middleware 分支在 visibility lookup 前处理旧 pen route"
      pattern: "pen/aurora-optima.*article/aurora-optima"
    - from: "scripts/apply-phase117-aurora-optima-family-current-pens-content.ts"
      to: "scripts/data/phase117-aurora-optima-family-current-pens.ts"
      via: "locked constants、article descriptor、two exact pack loaders 与 source/scope contracts"
      pattern: "PHASE117_|loadPhase117"
    - from: "Aurora Optima family article"
      to: "two exact current pens"
      via: "正文链接 /pen/aurora-optima-auroloide-996-dor 与 /pen/aurora-optima-resina-997-cn；两支 pen 反向链接 family 和 sibling"
      pattern: "aurora-optima-(auroloide-996-dor|resina-997-cn)"
    - from: "two exact pen made_by links"
      to: "Aurora brand publication"
      via: "expected remove-one/add-two topology delta 后计算 current hash、recordEntityContentReview、publishEntity"
      pattern: "computePublicationContentHash|recordEntityContentReview|publishEntity"
---

<objective>
把 Phase 48 错当成单支 pen 的 Aurora Optima 原位改成系列导航，并发布当前 exact Auroloide 996-DOR 与 Resina 997-CN 两支 canonical pens。

Purpose: 修复 family/SKU 身份污染与旧路由可达性，同时把 current exact、historical、professional/sample 与 limited-edition 证据保持在可审计边界内，不污染既有 Aurora 内容或真实 catalog。
Output: 三篇 sourced content、三张原创 factual SVG、phase-local data/apply/integration test、一个精确 route-map 条目与十文件产品提交。
</objective>

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/content-research/research-aurora-montegrappa-2026-07-20.md
@.planning/quick/260721-kdm-phase-114-reclassify-aurora-88-as-family/PLAN.md
@.planning/quick/260721-kdm-phase-114-reclassify-aurora-88-as-family/SUMMARY.md
@.planning/quick/260721-l94-phase-115-aurora-ipsilon-family-navigati/PLAN.md
@.planning/quick/260721-l94-phase-115-aurora-ipsilon-family-navigati/SUMMARY.md
@scripts/data/phase48-waterman-aurora.ts
@scripts/apply-phase48-waterman-aurora-content.ts
@tests/content/phase48-waterman-aurora.test.ts
@scripts/data/phase114-aurora-88-family-ottantotto-resina-800.ts
@scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content.ts
@tests/content/phase114-aurora-88-family-ottantotto-resina-800.test.ts
@scripts/data/phase115-aurora-ipsilon-family-current-pens.ts
@scripts/apply-phase115-aurora-ipsilon-family-current-pens-content.ts
@tests/content/phase115-aurora-ipsilon-family-current-pens.test.ts
@src/lib/entity-redirects.ts
@src/middleware.ts

<interfaces>
- Existing locked identities: Aurora brand `CJXe8UpnkHLJ`; Optima donor/family `5waoVLPHU2Pt`; Aurora 88 family `s41AURORA88`; Ottantotto Resina 800 `phase114-aurora-ottantotto-resina-800`; Ipsilon family/Demo/Resin are the Phase 115 IDs exported from its data module.
- Phase 117 locked family identity: keep ID `5waoVLPHU2Pt`, slug `aurora-optima`, canonical article name `Aurora Optima（系列导航）`; do not create another generic Optima entity.
- Phase 117 exact identities: ID `phase117-aurora-optima-auroloide-996-dor`, slug `aurora-optima-auroloide-996-dor`, canonical name `Aurora Optima Auroloide 996-DOR`; ID `phase117-aurora-optima-resina-997-cn`, slug `aurora-optima-resina-997-cn`, canonical name `Aurora Optima Resina 997-CN`.
- Route contract: add only `["pen/aurora-optima", "/article/aurora-optima"]` to `RECLASSIFIED_ARTICLE_PATHS`; middleware already emits the permanent redirect before public visibility lookup, and no database redirect row is created.
- Publication contract: article stays without `entity_publications` and uses the existing article public branch; Aurora and both pens require current-hash fact/language/media reviews via `recordEntityContentReview`, then `publishEntity` supplies the publication review and public membership.
- Source ownership contract: Phase 48 Optima currently owns the exact official Auroloide/Resina URLs as family references. First-write preflight may allow only that locked donor ownership, then the identity/topology transaction must delete donor references with the old pen payload and install explicit family/exact references for the three new scopes. Any other entity owner, alternate exact pen, alias, source marker or route collision fails closed.
- Authority contract: reuse Phase 114/115 verified CodeBuddy/Documents repo pair and caller-owned checkpoint DB controls; the protected catalog and sidecars remain read-only snapshots.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 锁定 Phase 117 single-checkpoint identity、source migration 与 publication regression</name>
  <files>tests/content/phase117-aurora-optima-family-current-pens.test.ts</files>
  <behavior>
    - Test 1: 一个 top-level setup 从 `copyCheckpointedCatalogToDisposableCopy` 建立、迁移 caller-owned copy，并按 Phase 41 seed -> Phase 48 Aurora baseline -> Phase 114 -> Phase 115 顺序建立 prerequisite terminal state；Phase 117 三目标首写前只有 Optima donor 存在，两 exact targets 不存在。
    - Test 2: `5waoVLPHU2Pt` 原位成为公开 article `aurora-optima`，稳定 ID/slug 保留，name 精确为 `Aurora Optima（系列导航）`；没有第二个 generic Optima、entity_publications、maker/reverse、model spec/variant、fact scope/claim/evidence 或其它 pen-only payload。
    - Test 3: `getReclassifiedArticlePath("pen", "aurora-optima")` 精确返回 `/article/aurora-optima`，数据库无 `/pen/aurora-optima` redirect row；静态 route map 只增加该 pair，既有 route digest 除该预期差异外不变。
    - Test 4: two exact IDs/slugs/names 唯一，每支仅一条 made_by Aurora 与对应 reverse；Aurora topology exact delta 是旧 family pair 删除、新增 two pen pairs，Aurora non-topology payload与 Phase 48 brand marker字节不变。
    - Test 5: Phase 48 donor 对两个 exact official URLs 的 reference ownership 是唯一可迁移旧 owner；first write 后 family、Auroloide、Resina 各自拥有计划声明的 source references，旧 donor pen reference/source marker无残留，任何 third owner/alternate identity/alias/source URL/source marker collision在写入前拒绝。
    - Test 6: 三文 summary 60-160、body各 2,000+ Unicode字符、各有唯一 approved primary SVG；每页链接另外两页，正文导航不创建 article/pen-to-pen topology。
    - Test 7: family scope区分 1930s roots、战前 Optima、1992 modern line、current Auroloide/Resina siblings和366 limited；Auroloide exact只接受996-DOR、Auroloide、14K white gold、hidden-reserve piston、screw cap、EF/F/M/B与2026-07-21 availability；Resina exact只接受997-CN、black resin、chrome trim、piston、EF/F/M/B与dated availability。
    - Test 8: PenHero只支撑1992 modern line和早期 Auroloide/resin chronology；Laura Petix 2024-10-12 Pen Boutique只支撑dated professional family/sample context；2016-11-30 Pen Addict只支撑blue Auroloide sample。Resina 的14K/hidden reserve/dimensions以及两笔共用的127 mm/21.55 g、清洁、hand feel均保持 rejected/sample/datetime scope，除非 exact current Aurora source提供逐SKU locator。
    - Test 9: topology mutation使 Aurora hash变化，旧 reviews不复用；Aurora与two pens的 current hash均有四类 approved reviews并公开。article、two pens、brand与所有 protected entities完整后 pristine replay才返回三个 noop。
    - Test 10: partial/terminal tamper、wrong prerequisite baseline、duplicate/alias/source owner/route collision、remote selector、第三 repo root、空 reviewer、protected/symlink/hard-link/path/PRAGMA/migration mismatch均在写入或 noop 前 fail closed；真实 data/fpkg.db main/WAL/SHM snapshots不变。
  </behavior>
  <action>
按 D-01 至 D-14 先写单文件 failing integration regression。直接复用 Phase 114 的 same-ID article/route/source-owner pattern与 Phase 115 的 three-entity/single-setup/current-hash pattern；不要新增 second migration runner、global hooks、shared helper、Playwright、search、LLM 或 readiness infra。

setup 只迁移一次，全部 positive/fault assertions从同一 prepared caller-owned checkpoint或其明确派生副本运行；不得再对真实 catalog 建 client。baseline/protected digests覆盖 Aurora brand entity/story/source/reference/spec/media与全部 reverse、Optima donor全 payload/topology/publication、Aurora 88 article/800、Ipsilon article/Demo/Resin、route file及 main/WAL/SHM。source-owner preflight必须把 Phase 48 donor 对 exact official URLs 的旧 reference ownership列成唯一 migration allowlist，而不是把它误判成 alternate pen；除此以外的 ID/slug/name/alias/entity.source_url/reference owner/phase source marker均拒绝。

把 source scope 断言落在 sources/scopes/claims/citations/spec evidence结构上，不只检查正文关键词。Resina 不得从 sibling或family自动获得 Auroloide 的14K、hidden reserve、screw cap、尺寸、重量或主观体验；Pen Boutique 的127 mm/21.55 g、cleaning、hand feel与 Pen Addict 的 blue sample observation只能留在明确 dated/sample context。测试还要证明 three-way body navigation不是 graph topology、article 没有 maker/publication，并验证 limited 366 明确隔离于 regular exact pens。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase117-aurora-optima-family-current-pens.test.ts</automated>
  </verify>
  <done>失败回归完整锁定 Phase 48 -> 114 -> 115 prerequisite chain、same-ID article、two exact pens、source-owner migration、evidence scopes、route、Aurora post-topology review、tamper/noop与 protected catalog。</done>
</task>

<task type="auto">
  <name>Task 2: 编写 Optima family、996-DOR exact 与 997-CN exact 三份 sourced content</name>
  <files>.planning/content-research/aurora-optima-family-phase117.md, .planning/content-research/aurora-optima-auroloide-996-dor-phase117.md, .planning/content-research/aurora-optima-resina-997-cn-phase117.md</files>
  <action>
按 D-03 至 D-08 写三份 reviewed Markdown，每份固定 `## summary` 与 `## body_md`，summary为60-160 Unicode字符、body至少2,000 Unicode字符，并在正文链接另外两条 canonical routes。文风为自然、具体的中文，不冒充作者拥有或亲测；官方 marketing、historical/professional record、dated sample与编辑解释分别归属。

family文稿以 `https://aurorapen.it/categoria-prodotto/alto-di-gamma/optima/` 为 primary：明确1930年代设计根源、当代再诠释与 Auroloide/Resina sibling navigation；战前 Optima不能共享现代规格。PenHero `https://www.penhero.com/PenGallery/Aurora/AuroraPrimavera.htm` 只用于1992 modern line与早期 Auroloide/resin chronology。Laura Petix 的 Pen Boutique `https://www.penboutique.com/blogs/blog/optima-art-deco-elegance-from-aurora` 固定为 professional_secondary、published `2024-10-12`，只作dated family/sample context。沿用 exact official Optima 366 PDF时只说明其limited、编号与明确18K边界，不能回填regular 996-DOR/997-CN。

Auroloide文稿以 `https://aurorapen.it/shop/optima-auroloide-stilografica/` 锁定 SKU 996-DOR、Auroloide、14K white gold、hidden-reserve piston、screw cap、EF/F/M/B与2026-07-21 current availability snapshot；价格/库存只作mutable snapshot。The Pen Addict `https://www.penaddict.com/blog/2016/11/30/aurora-optima-blue-auroloide-fountain-pen-review` 固定published `2016-11-30`、independent dated blue sample，所有主观手感、样本尺寸/重量或蓝色版本参数不得泛化到全部 Auroloide或 sibling。

Resina文稿以 `https://aurorapen.it/shop/optima-resina-stilografica/` 锁定 SKU 997-CN、black resin、chrome trim、piston、EF/F/M/B与2026-07-21 availability snapshot。除非 executor从 Aurora FAQ或current catalog找到逐字指向 exact 997-CN 的 locator并在 source registry/scope/citation中明确保存，否则不写14K、hidden reserve、screw cap、尺寸、重量或容量；Pen Boutique 的127 mm/21.55 g、cleaning和hand feel仍只能作为2024 article/sample context。三文通过“战前收藏笔／modern family／current exact SKU／366 limited”边界和三向导航完成可达性，不创建其它 sibling实体。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; test -s .planning/content-research/aurora-optima-family-phase117.md &amp;&amp; test -s .planning/content-research/aurora-optima-auroloide-996-dor-phase117.md &amp;&amp; test -s .planning/content-research/aurora-optima-resina-997-cn-phase117.md &amp;&amp; node --import tsx --test tests/content/phase117-aurora-optima-family-current-pens.test.ts</automated>
  </verify>
  <done>三份 2k+ 中文文稿建立完整三向导航，并严格隔离战前／1992 modern／current exact／professional/sample／366 limited证据。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 原子重分类、迁移 source ownership、重建 topology、current-hash 发布并精确提交十文件</name>
  <files>scripts/data/phase117-aurora-optima-family-current-pens.ts, scripts/apply-phase117-aurora-optima-family-current-pens-content.ts, src/lib/entity-redirects.ts, public/images/library/site-original/phase117/aurora/aurora-optima-family.svg, public/images/library/site-original/phase117/aurora/aurora-optima-auroloide-996-dor.svg, public/images/library/site-original/phase117/aurora/aurora-optima-resina-997-cn.svg</files>
  <behavior>
    - Test 1: data module导出 locked family/brand/protected/exact IDs、slugs、names、source URLs/dates/tiers、scope keys、article descriptor、two CuratedEntityPack loaders与three SVG paths；所有 source locator和qualification符合 D-03至D-08。
    - Test 2: 三张1600x900 SVG path/title/content hash不同，分别表达family chronology/sibling navigation、996-DOR exact current/sample boundary、997-CN exact current/evidence exclusions；均明确non-photo/non-logo/non-scale/non-colour-proof/non-finish-proof。
    - Test 3: repo/root/reviewer/env/path/migration、Phase 48/114/115 baseline、source-owner/duplicate/alias/route prerequisites首写前完成；失败时所有 owned entity digest不变。
    - Test 4: 单一 identity/topology transaction清除 donor旧 pen payload与publication/reviews/maker pair，保留5waoVLPHU2Pt并写article，创建two exact pens，只建立two exact maker/reverse pairs并安全迁移source ownership；不改protected entities或Aurora non-topology payload。
    - Test 5: Aurora hash只因remove-one/add-two topology delta改变；post-topology hash用review API + publishEntity恢复。article payload和two target-owned packs安装后，各自source/scope/media/review/publication完整；terminal完整才noop，tamper不自动repair。
  </behavior>
  <action>
按 D-01 至 D-14 创建 phase-local data/apply modules、三张unique factual SVG并精确修改 route map；以 Phase 114 apply为same-ID/source migration直接 analog，以 Phase 115 apply为two target/current-hash analog，不修改 shared publication、curated-content、readiness、middleware或数据库 schema。

data source registry固定retrieved=`2026-07-21`。family official category、two exact official pages与366 official PDF共享 Aurora official independence group；PenHero标 professional_secondary并只支撑1992/early chronology；Pen Boutique标 professional_secondary、author `Laura Petix`、published `2024-10-12`；Pen Addict标 professional_secondary或独立 review、published `2016-11-30`、blue-sample-only。为 current exact、historical family、2024 professional sample、2016 blue sample与366 limited建立分离scope/citation/spec evidence；Resina 未获 exact 支撑的14K/hidden-reserve/dimensions和跨笔127 mm/21.55 g等必须 rejected，不能进入stable spec values。

apply首写前完成 verified repo pair、caller-owned DB/migration032、Phase48/114/115 exact terminal baseline、protected digests、three-target ID/slug/name/alias/source URL/reference/source marker/route inventory。首次只接受 donor仍是Phase48 `pen/aurora-optima`、two targets absent、两个 official exact URL只由该 donor的Phase48 reference持有；replay只接受三目标完整terminal。任何 partial、alternate pen、second generic Optima或third source owner均fail closed。

在一个 identity/topology transaction中清除 donor-owned story/reference/alias/scope/claim/citation/evidence/spec/variant/timeline/media/content-review/publication与旧 maker/reverse；将同一entity ID更新为 article，删除type-trigger生成的draft lifecycle row，创建two exact pen identities与两个 made_by，核对trigger生成或`INSERT OR IGNORE`的exact reverse。写入taxonomy batch/action记录same-ID reclassification及two exact creations。随后安装family article sources/story/reference/primary SVG和two exact packs；source item可以按稳定key复用，但entity_references最终owner必须与family/exact scope一致，不能保留旧 donor pen marker或隐式复制exact ownership。

捕获 Aurora pre-hash、non-topology digest与reverse set；transaction后验证expected reverse set等于旧集合删除5waoVLPHU2Pt、加入two exact IDs，brand hash必须变化。仅对post-topology current hash调用 `recordEntityContentReview` 的fact/language/media和 `publishEntity`；不得 replay Phase48/114/115 brand pack，也不得直接SQL写brand/pen review、lifecycle或public tables。two pens各自走同样current-hash APIs；article保持无publication并依现有article branch公开。terminal assertions完整覆盖identity、source migration、scope/exclusions、three-way links、unique media、topology、current reviews/readiness/public membership、static route与全部protected digests后才允许noop。

在 `RECLASSIFIED_ARTICLE_PATHS` 只增加`pen/aurora-optima`到`/article/aurora-optima`。三张SVG为本站原创信息图：family显示战前／1992／current siblings／366 limited；Auroloide显示996-DOR exact facts与2016 blue sample边界；Resina显示997-CN exact facts与未获exact支持字段。颜色只作版式编码，不证明实物颜色/饰面。

定向test、tsc、owned TS Biome、three SVG XML与ten-path diff check通过后处理Git。先要求index为空并记录unrelated dirty/untracked path/status snapshot；只显式stage frontmatter十路径，若`scripts/data/` exact file被既有unanchored ignore命中，仅对该文件使用`git add -f`。比较cached path set、`git diff --cached --check`与no-deletion；异常时只unstage本包十路径并停止。禁止wide/glob add、stash、clean、reset、checkout、force或覆盖任何unrelated内容，尤其是 `.planning/content-research/research-aurora-montegrappa-2026-07-20.md`、其它research、`.next-phase*`、`.planning/quick/260719-665-montblanc-writers-edition-patron-of-art-/` 与 `.planning/quick/260720-nhl-phase-105-pilot-custom-urushi-owned-chec/`。

提交subject精确为 `feat(content): reclassify Aurora Optima family and publish current pens`，再用`git show --name-only --format=`证明唯一产品commit恰含十个frontmatter paths。PLAN、SUMMARY与其它docs不进产品commit；产品commit后才按execute workflow写本quick目录`SUMMARY.md`，记录IDs/routes、source locators/dates与exclusions、source ownership迁移、Aurora pre/post hash/no replay、single setup、tamper/noop、protected snapshots、验证命令、commit hash及partial-batch声明。不要提交SUMMARY或扩大到production rollout。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase117-aurora-optima-family-current-pens.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase117-aurora-optima-family-current-pens.ts scripts/apply-phase117-aurora-optima-family-current-pens-content.ts tests/content/phase117-aurora-optima-family-current-pens.test.ts src/lib/entity-redirects.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase117/aurora/aurora-optima-family.svg public/images/library/site-original/phase117/aurora/aurora-optima-auroloide-996-dor.svg public/images/library/site-original/phase117/aurora/aurora-optima-resina-997-cn.svg &amp;&amp; git diff --check -- .planning/content-research/aurora-optima-family-phase117.md .planning/content-research/aurora-optima-auroloide-996-dor-phase117.md .planning/content-research/aurora-optima-resina-997-cn-phase117.md scripts/data/phase117-aurora-optima-family-current-pens.ts scripts/apply-phase117-aurora-optima-family-current-pens-content.ts tests/content/phase117-aurora-optima-family-current-pens.test.ts src/lib/entity-redirects.ts public/images/library/site-original/phase117/aurora/aurora-optima-family.svg public/images/library/site-original/phase117/aurora/aurora-optima-auroloide-996-dor.svg public/images/library/site-original/phase117/aurora/aurora-optima-resina-997-cn.svg</automated>
  </verify>
  <done>same-ID family article、two exact current pens、explicit source migration、route、Aurora current-hash恢复、single-setup tamper/noop与 protected catalog全部通过；唯一产品commit精确十文件。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Phase 48 Optima pen -> family article | 同一stable ID/slug换type与public namespace；旧pen payload和publication必须清除，不能另建第二generic Optima。 |
| Family-owned exact URLs -> three new source owners | Phase 48 donor已引用两个exact official URLs；迁移必须只允许locked donor并显式重建family/exact references，不能制造隐藏duplicate owner。 |
| Family/history -> current exact pens | 1930s roots、战前Optima与1992 modern chronology不能回填current SKU稳定规格。 |
| Auroloide exact -> Resina exact | 996-DOR的14K white gold、hidden reserve和screw cap不能自动转移到997-CN。 |
| Professional/sample -> exact current | 2024 Pen Boutique尺寸/体验与2016 blue Auroloide sample不能冒充两个current exact SKU的共同稳定事实。 |
| Body navigation -> graph topology | 三页互链是正文导航；只有two pens -> Aurora是maker topology，article与pen-to-pen不得产生关系边。 |
| Maker topology -> Aurora publication | 删除旧family link并新增two exact links改变brand contract hash；旧reviews不可复用，旧brand pack不可replay。 |
| Caller/repo alias -> catalog | repo alias、DB path、reviewer/env和owned root来自caller；错误authority可能污染真实catalog。 |
| Dirty worktree -> product commit | unrelated research、next-phase与quick artifacts已存在；宽泛staging会把用户内容带入产品commit。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-117-01 | Spoofing | Optima donor/two exact identities | high | mitigate | Task 1/3在首写前对ID/slug/name/alias/source URL/source marker/route做exact inventory；只接受locked donor加two absent targets。 |
| T-117-02 | Tampering | source ownership migration | critical | mitigate | Task 1/3只allow Phase48 donor旧references，在identity transaction清除并重建三实体owner；third owner或partial migration fail closed。 |
| T-117-03 | Tampering | source scope qualification | high | mitigate | Task 1-3以独立scope/citation/rejected evidence隔离战前、1992、current、2024、2016与366；sibling/sample字段不得进入exact stable specs。 |
| T-117-04 | Repudiation | reviews/publication | high | mitigate | Task 3记录reviewer/current hash并只经review APIs + publishEntity发布Aurora/two pens；SUMMARY记录hash、命令与commit。 |
| T-117-05 | Information Disclosure | dirty/untracked worktree | medium | mitigate | Task 3只stage十个owned paths并比较cached set；不读取、提交、移动或清理unrelated内容。 |
| T-117-06 | Denial of Service | terminal replay/tamper | medium | mitigate | Task 1/3要求三实体及brand完整terminal才noop；partial/tampered状态不自动repair/review。 |
| T-117-07 | Elevation of Privilege | repo/database authority | critical | mitigate | Task 1/3验证CodeBuddy/Documents pair、caller-owned containment、realpath/inode、PRAGMA path、migration032与protected main/WAL/SHM snapshots。 |
| T-117-08 | Tampering | Aurora post-topology publication | critical | mitigate | Task 1/3验证non-topology digest与exact remove-one/add-two delta，再在post-topology hash重审publish；禁止brand replay/direct lifecycle SQL。 |
| T-117-09 | Tampering | product commit | high | mitigate | Task 3要求空index、精确stage十路径、cached diff/no-deletion审计与post-commit path proof；异常只unstage owned paths并停止。 |
| T-117-SC | Tampering | package supply chain | low | accept | 本计划无package install或dependency变更；现有lockfile和工具链保持不变。 |

</threat_model>

<source_audit>

| SOURCE | ID | Feature/Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | Optima same-ID family article + exact 996-DOR/997-CN current pens、安全迁移与发布 | 1-3 | COVERED | identity、content、media、source ownership、topology、review/publish、noop、catalog/commit protection全覆盖。 |
| REQ | QUICK-260721-PHASE117 | Phase 117 Aurora Optima partial batch | 1-3 | COVERED | frontmatter requirement映射到全部tasks。 |
| RESEARCH | R-01 | 官方family页的1930s roots、current reinterpretation、Auroloide/Resina siblings | 1-3 | COVERED | family primary与cross-era exclusion。 |
| RESEARCH | R-02 | 996-DOR exact current：Auroloide、14K white gold、hidden-reserve piston、screw cap、EF/F/M/B、availability | 1-3 | COVERED | exact scope + mutable snapshot。 |
| RESEARCH | R-03 | 997-CN exact current：black resin、chrome trim、piston、EF/F/M/B、availability | 1-3 | COVERED | exact scope；未获exact支持字段不补。 |
| RESEARCH | R-04 | PenHero仅1992 modern line/early material chronology | 1-3 | COVERED | historical/professional scope。 |
| RESEARCH | R-05 | Laura Petix Pen Boutique published 2024-10-12，仅dated family/sample；127mm/21.55g、cleaning、hand feel不跨SKU泛化 | 1-3 | COVERED | professional_secondary scope与rejected exact evidence。 |
| RESEARCH | R-06 | Pen Addict published 2016-11-30，仅blue Auroloide sample | 1-3 | COVERED | dated sample scope。 |
| RESEARCH | R-07 | Phase48 Optima含366 limited边界与旧exact URL ownership；Phase114/115提供same-ID、two-target、brand hash模式 | 1,3 | COVERED | explicit migration + limited isolation + direct implementation analogs。 |
| CONTEXT | D-01 | 保留5waoVLPHU2Pt/aurora-optima，原地pen->article，不建第二generic | 1,3 | COVERED | identity、cleanup、article branch。 |
| CONTEXT | D-02 | 两个锁定exact new identities | 1,3 | COVERED | exact duplicate/alias preflight。 |
| CONTEXT | D-03 | family official source与sibling/history边界 | 1-3 | COVERED | family article/source scopes。 |
| CONTEXT | D-04 | Auroloide exact current facts | 1-3 | COVERED | 996-DOR pack。 |
| CONTEXT | D-05 | Resina exact current facts与禁止sibling补字段 | 1-3 | COVERED | 997-CN pack/rejected evidence。 |
| CONTEXT | D-06 | PenHero/Pen Boutique/Pen Addict日期、authority与sample边界 | 1-3 | COVERED | source metadata和scope isolation。 |
| CONTEXT | D-07 | 三篇2k+、three unique SVG、三向导航、war/prewar-modern-current-limited边界 | 1-3 | COVERED | content/media contracts。 |
| CONTEXT | D-08 | exact two made_by，brand remove-one/add-two delta/current-hash re-review | 1,3 | COVERED | topology/publication contract。 |
| CONTEXT | D-09 | 保护Aurora 88/800、Ipsilon family/Demo/Resin与Phase48 brand | 1,3 | COVERED | full protected digests。 |
| CONTEXT | D-10 | Phase48 -> 114 -> 115 single owned checkpoint | 1 | COVERED | one migration/setup chain。 |
| CONTEXT | D-11 | exact duplicate/alias/source owner/route preflight与source ownership安全迁移 | 1,3 | COVERED | fail-closed allowlist与terminal assertions。 |
| CONTEXT | D-12 | first apply/replay noop/tamper fail closed、真实catalog不变 | 1,3 | COVERED | caller-owned fixtures/snapshots。 |
| CONTEXT | D-13 | exact ten-file commit、PLAN/SUMMARY后置、保护dirty/untracked | 3 | COVERED | path allowlist/cached diff/post-commit proof。 |
| CONTEXT | D-14 | 不扩shared infra/Playwright/search/LLM/readiness，partial batch | 1-3 | COVERED | scope exclusion明确。 |

Deferred/excluded: other Optima colours/limited editions as entities, historical pre-war entity creation, full Aurora/Optima corpus, production migration/deploy, full-site acceptance, shared publication/readiness/search/LLM infrastructure, Playwright, package installs and unrelated research/quick/next-phase work are outside this partial batch. Source audit has no missing items.

</source_audit>

<pre_mortem>

1. **最可能失败：Phase 48 donor已拥有exact official URLs，preflight把合法旧owner误判duplicate，或迁移后残留旧reference。** Mitigation: Task 1/3建立唯一donor allowlist，首写前列明owner，transaction后断言三实体source ownership和旧marker/reference清零。
2. **最可能失败：Auroloide的14K/hidden reserve或Pen Boutique尺寸被复制到Resina。** Mitigation: D-04至D-06独立scope、exact field allowlist与rejected spec evidence；Resina current values只接受exact listing。
3. **最可能失败：article仍保留publication/maker/spec，或三向正文链接被实现为topology。** Mitigation: Task 1/3逐表count与exact topology set assertions，static/body navigation和entity_links分开验收。
4. **最可能失败：remove-one/add-two后Aurora hash变化，却复用Phase115 review或replay旧brand pack。** Mitigation: brand pre/post hash、non-topology digest、exact reverse delta、current-hash review APIs + publishEntity、no-replay assertion。
5. **最可能失败：测试或提交污染真实catalog及unrelated research/quick work。** Mitigation: verified repo pair、single caller-owned checkpoint、protected sidecar snapshots、空index、显式十路径allowlist与post-commit proof。

Reachability is complete: Phase 41 seed -> Phase 48 public Aurora/Optima baseline -> Phase 114 and Phase 115 terminal prerequisites -> exact donor/source-owner preflight -> same-ID family article + two exact pens -> three scoped content/media payloads -> remove-one/add-two Aurora topology -> post-topology current-hash reviews/publication -> article public branch + two governed pen routes -> static old-route redirect + three-way body navigation. No artifact depends on shared-infra changes, a second generic Optima, package install, production catalog write or later rollout.

</pre_mortem>

<verification>

1. `node --import tsx --test tests/content/phase117-aurora-optima-family-current-pens.test.ts` passes on a single caller-owned checkpoint setup and proves protected main/WAL/SHM equality.
2. Existing ID `5waoVLPHU2Pt` is the only generic Optima and is public at `/article/aurora-optima`; `/pen/aurora-optima` maps to it statically, with no database redirect or article pen-only payload.
3. Two exact IDs/routes are public; each of the three bodies is 2,000+ Unicode characters, has one unique approved primary SVG and links the other two pages.
4. Historical/family, Auroloide exact, Resina exact, 2024 professional, 2016 sample and 366 limited scopes remain structurally separate; no sibling/sample-only field qualifies the wrong current spec.
5. Exactly two made_by pairs connect the pens to Aurora; the old family pair is absent. Aurora non-topology payload stays byte-identical and publication reviews bind the exact post-topology current hash.
6. First apply publishes three targets; pristine replay returns three noop outcomes; duplicate/alias/source-owner/route/identity/source/scope/media/link/review/publication and authority tamper fixtures fail closed.
7. `tsc`, owned-file Biome, three SVG XML checks and ten-path diff checks pass; Aurora 88/800、Ipsilon family/Demo/Resin、Phase48 brand及真实catalog digests不变。
8. Product commit subject is exactly `feat(content): reclassify Aurora Optima family and publish current pens`; its path set equals the ten frontmatter paths, while PLAN/SUMMARY、unrelated research、`.next-phase*`、quick 260719-665与Phase105 remain outside the commit and unchanged.

</verification>

<success_criteria>

- Aurora Optima family article、Auroloide 996-DOR与Resina 997-CN以三条canonical routes公开且互相可达，旧pen route永久到family article。
- 官方current、historical/professional、dated sample与limited edition证据保持可审计边界；未把Auroloide或sample字段泛化到Resina。
- only two exact pens connect Aurora；brand在remove-one/add-two后的current hash重审恢复，所有既有Aurora页面与non-topology payload保持保护状态。
- caller-owned safety、single-setup、explicit source ownership migration、tamper/noop、TypeScript/Biome/XML/diff与repo alias gates全部通过。
- 唯一产品提交精确十文件；PLAN/SUMMARY后置且Phase117如实声明为partial batch。

</success_criteria>

<output>
Create `.planning/quick/260721-phase-117-aurora-optima-family-current-pens/SUMMARY.md` only after the product commit; keep PLAN/SUMMARY/docs outside that product commit and do not commit the summary in this execution.
</output>
