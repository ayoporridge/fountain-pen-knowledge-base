---
phase: 123-platinum-izumo-family-and-piz-80000n
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/content-research/platinum-izumo-family-phase123.md
  - .planning/content-research/platinum-izumo-piz-80000n-phase123.md
  - scripts/data/phase123-platinum-izumo-piz-80000n.ts
  - scripts/apply-phase123-platinum-izumo-piz-80000n-content.ts
  - tests/content/phase123-platinum-izumo-piz-80000n.test.ts
  - public/images/library/site-original/phase123/platinum/platinum-izumo-family.svg
  - public/images/library/site-original/phase123/platinum/platinum-izumo-piz-80000n.svg
  - src/lib/entity-redirects.ts
autonomous: true
requirements:
  - QUICK-260722-CLT
must_haves:
  truths:
    - "既有 draft `OOumUrtFoAqu` 原位成为 reviewed/published article `Platinum Izumo 系列`（slug `platinum-izumo`），旧 canonical name 与两个既有 aliases 都保留为 aliases；`/pen/白金-platinum-出云-izumo` 通过既有静态 reclassified-article redirect 映射到 `/article/platinum-izumo`，且没有第二个 generic Izumo。"
    - "唯一新建具体 pen 为 `phase123-platinum-izumo-piz-80000n`／`platinum-izumo-piz-80000n`／`Platinum Izumo PIZ-80000N 八云涂`，current variants 精确且仅有 `#91 Ginsen Yakumo` 与 `#92 Togi Yakumo`。"
    - "Izumo article 对官网重复图片卡去重后只呈现锁定的 11 个 SKU families；这些 sibling 名称仅作 2026-07-22 navigation snapshot，不成为额外 entities、target variants 或可共享 specs，2025 Precious Wood news 仍是 dated sibling announcement。"
    - "article 清除旧 pen-only maker/spec/claim/commercial payload且不再有 made_by/reverse；一个 topology transaction 删除 `tvedLyJyl6UZ`／`rev-tvedLyJyl6UZ` 并新增且仅新增 PIZ pen 到 Platinum `e51tJpejEkXY` 的 exact made_by/reverse pair。"
    - "Platinum brand non-topology payload不变、reverse target只从旧 Izumo shell换到新 PIZ pen；topology 后 current hash 经 recordEntityContentReview + publishEntity 重审发布，不重放 brand pack，也不直接写 lifecycle tables。"
    - "article 与 pen 各有 60-160 Unicode summary、至少 2,000 Unicode body、互相链接与唯一 site-original factual SVG；两实体各自只在 current hash 通过 review APIs 并发布。"
    - "官网 product/catalog/manual、Leigh Reyes ambiguous older sample 与 FPN community exact Ginsen sample均有逐文档 locator 和不可跨接 scope；retailer/customer review 不参与 publication readiness。"
    - "Phase 42/78/121/122 Platinum、#3776 `ekPMWnot9inz`、Curidas `BoZ4C2WSqk0K`、Procyon `phase121-platinum-procyon-pns-5000`、President `a1t4DNomp4Ge` 与真实 `data/fpkg.db` main/WAL/SHM 保持不变。"
    - "首写只接受 exact raw + new-absent 或 exact terminal；首写返回 article/pen 两个 published（可附 brand republish audit），pristine replay精确返回两个 noop，partial/tampered/alternate authority/source/topology/content状态均在写入或 noop 前 fail closed。"
    - "唯一产品提交 subject 精确为 `feat(content): reclassify Platinum Izumo and publish PIZ-80000N` 且只含 frontmatter 八路径；PLAN不进入产品提交，产品提交后创建 prefixed、status complete、未提交 SUMMARY，并明确 full-corpus goal remains active。"
  artifacts:
    - path: "scripts/data/phase123-platinum-izumo-piz-80000n.ts"
      provides: "锁定 article/pen/brand/protected identities、11-family navigation snapshot、two current variants、source metadata/locators/scopes、article descriptor、PIZ curated pack 与 two SVG contracts"
    - path: "scripts/apply-phase123-platinum-izumo-piz-80000n-content.ts"
      provides: "exact raw-or-terminal inspection、same-ID article reclassification、one-transaction topology replacement、three current-hash publications 与 terminal/noop authority"
    - path: "tests/content/phase123-platinum-izumo-piz-80000n.test.ts"
      provides: "single caller-owned checkpoint 上 Phase42/78/121/122 prerequisite chain、identity/content/source/topology/publication/tamper/noop/protected catalog regression"
    - path: "public/images/library/site-original/phase123/platinum/platinum-izumo-family.svg"
      provides: "11-family lineup/navigation 与 no-shared-spec boundary factual diagram"
    - path: "public/images/library/site-original/phase123/platinum/platinum-izumo-piz-80000n.svg"
      provides: "PIZ exact product/variants/spec/maintenance/sample boundary factual diagram"
  key_links:
    - from: "scripts/apply-phase123-platinum-izumo-piz-80000n-content.ts"
      to: "scripts/data/phase123-platinum-izumo-piz-80000n.ts"
      via: "locked IDs, legacy inventory, 11-family set, PIZ pack, source scopes and SVG paths"
      pattern: "PHASE123_|loadPhase123"
    - from: "OOumUrtFoAqu old pen route"
      to: "OOumUrtFoAqu canonical article route"
      via: "taxonomy batch/action plus existing static reclassified-article route map"
      pattern: "getReclassifiedArticlePath|白金-platinum-出云-izumo.*article/platinum-izumo"
    - from: "Platinum brand topology"
      to: "phase123-platinum-izumo-piz-80000n"
      via: "delete legacy article maker pair, insert one exact pen pair, compute post-topology hash, record reviews and publish"
      pattern: "computePublicationContentHash|recordEntityContentReview|publishEntity"
    - from: "article body"
      to: "PIZ pen body"
      via: "canonical route links in both directions without extra entity_links"
      pattern: "article/platinum-izumo|pen/platinum-izumo-piz-80000n"
---

<objective>
把误建为单支 pen 的 Platinum Izumo 稳定身份原位重分类为系列文章，并发布唯一具体 PIZ-80000N 八云涂 canonical pen。

Purpose: 纠正 family/SKU 身份与 maker topology，同时把 current lineup、exact product specs、dated catalog、model maintenance 和两类 sample observations放进可审计的独立证据边界。
Output: 两份 reviewed research copy、一个 phase-local data pack、一个 guarded apply、一个 single-checkpoint integration test、两张 factual SVG、一条静态 article redirect 映射，以及精确八文件产品提交。
</objective>

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/STATE.md
@.planning/content-research/wancher-dream-pen-navigation.md
@scripts/apply-phase104-wancher-dream-pen-navigation-content.ts
@tests/content/phase104-wancher-dream-pen-navigation.test.ts
@.planning/quick/260721-phase-117-aurora-optima-family-current-pens/PLAN.md
@.planning/quick/260721-phase-117-aurora-optima-family-current-pens/SUMMARY.md
@scripts/data/phase117-aurora-optima-family-current-pens.ts
@scripts/apply-phase117-aurora-optima-family-current-pens-content.ts
@tests/content/phase117-aurora-optima-family-current-pens.test.ts
@.planning/quick/260722-ba3-publish-the-missing-platinum-procyon-pns/260722-ba3-PLAN.md
@.planning/quick/260722-ba3-publish-the-missing-platinum-procyon-pns/260722-ba3-SUMMARY.md
@scripts/data/phase121-platinum-procyon-pns-5000.ts
@scripts/apply-phase121-platinum-procyon-pns-5000-content.ts
@tests/content/phase121-platinum-procyon-pns-5000.test.ts
@.planning/quick/260722-bxs-reclassify-platinum-president-ptb-20000p/260722-bxs-PLAN.md
@.planning/quick/260722-bxs-reclassify-platinum-president-ptb-20000p/260722-bxs-SUMMARY.md
@scripts/data/phase122-platinum-president-ptb-20000p.ts
@scripts/apply-phase122-platinum-president-ptb-20000p-content.ts
@tests/content/phase122-platinum-president-ptb-20000p.test.ts
@src/lib/publication.ts

<interfaces>
- Locked identities: Platinum brand `e51tJpejEkXY`; #3776 `ekPMWnot9inz`; Curidas `BoZ4C2WSqk0K`; Procyon `phase121-platinum-procyon-pns-5000`; President `a1t4DNomp4Ge`; Izumo donor/article `OOumUrtFoAqu`; new PIZ pen `phase123-platinum-izumo-piz-80000n`.
- Exact raw identity: type `pen`, name `白金 Platinum Izumo 出云`, slug `白金-platinum-出云-izumo`, summary length 67, body length 248, source null, aliases `alias-OOumUrtFoAqu-en-Platinum Izumo:Platinum Izumo:en` and `alias-OOumUrtFoAqu-zh-白金 出云 Izumo:白金 出云 Izumo:zh`.
- Exact raw topology/payload: made_by `tvedLyJyl6UZ`, reverse `rev-tvedLyJyl6UZ`; story `story-model-platinum-izumo-research`; spec `spec-platinum-izumo-research`; claim `claim-platinum-izumo-source-boundary`; references `22c69d1a-6013-474a-9cac-a6a0ff370795`, `afe7edae-cf04-4a12-aa84-f8430350b93d`, `eref-commerce-1954fe77d81a4c`, `reference-model-gap-OOumUrtFoAqu-source-platinum-izumo-public-search`; media `media-commerce-82fe9226299f2b`; draft publication with null approved hash and no old redirect.
- Canonical article: keep ID `OOumUrtFoAqu`, type `article`, name `Platinum Izumo 系列`, slug `platinum-izumo`; preserve the two existing aliases and add the old exact canonical name `白金 Platinum Izumo 出云` as an alias. Add one surgical `RECLASSIFIED_ARTICLE_PATHS` mapping in `src/lib/entity-redirects.ts` from `pen/白金-platinum-出云-izumo` to `/article/platinum-izumo`; migration 032 forbids `/article/*` targets in `entity_redirects`, so apply must not bypass that CHECK or write an invalid DB redirect.
- Canonical pen: ID `phase123-platinum-izumo-piz-80000n`, type `pen`, name `Platinum Izumo PIZ-80000N 八云涂`, slug `platinum-izumo-piz-80000n`; use stable exact link IDs `phase123-platinum-izumo-piz-80000n-made-by` and `phase123-platinum-izumo-piz-80000n-reverse` unless an existing phase-local stable-ID convention produces equivalent deterministic exported constants.
- Publication contract: use `computePublicationContentHash`, `recordEntityContentReview` for fact/language/media, and `publishEntity` for article, pen and post-topology brand. No pack replay and no direct DML to reviews, entity_publications or public_entities.
- Authority contract: reuse Phase121/122 verified CodeBuddy/Documents canonical repo pair, non-empty reviewer, empty remote selectors, caller-owned non-symlink/non-hardlink migrated checkpoint copy, PRAGMA path binding and protected main/WAL/SHM snapshots.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 锁定 Phase123 single-checkpoint identity、evidence、topology 与 publication regression</name>
  <files>tests/content/phase123-platinum-izumo-piz-80000n.test.ts</files>
  <behavior>
    - Test 1: 一个 top-level setup 只调用一次 `copyCheckpointedCatalogToDisposableCopy`，迁移 caller-owned copy 后按 Phase42 -> Phase78 -> Phase121 -> Phase122 建立 published Platinum prerequisites；首写前 `OOumUrtFoAqu` 是 exact raw，new PIZ ID absent。
    - Test 2: raw inventory逐字段锁定 identity、67/248 lengths、两个aliases、maker/reverse IDs、story/spec/claim、四个reference IDs、commercial media、draft publication和redirect absent；任何差异写前拒绝。
    - Test 3: same ID 成为 reviewed/published article `Platinum Izumo 系列`，三个 legacy names均为aliases，旧route永久转向article；不存在第二个 generic Izumo，article无 model spec/variant 或 made_by/reverse。
    - Test 4: new PIZ ID/slug/name唯一，只有一个 made_by Platinum和一个brand reverse；topology delta精确为remove legacy pair/add new pair，Platinum reverse target由article换成PIZ，brand non-topology digest不变。
    - Test 5: article的lineup snapshot精确去重为11 families，重复image cards不增加数量；2025 Precious Wood news只作为dated sibling announcement，11 siblings不创建entity/variant/spec/topology。
    - Test 6: PIZ current variants精确为#91/#92；JP-only ¥165,000是2026-07-22 snapshot，official stable specs只含large 18K(18-21) two-tone/rhodium-selective F/M/B、ebonite、Yakumonuri、#92 polished/togidashi boundary、154x18mm、33g、pen kimono、Converter-800A、blue-black cartridge和Izumo paulownia box。
    - Test 7: official brand、JP/EN product、2019-2020 catalog和maintenance PDF各自拥有非泛化 locator/source/scope/evidence chain；catalog只作dated corroboration，maintenance只支撑约每3个月拆下墨囊/上墨器并用水或温水冲洗笔尖及使用Platinum replacement products。
    - Test 8: Leigh Reyes 2013 older Yakumonuri sample不猜#91/#92，section threads、older President engraving、Fine feel/reliability/appearance均sample-only；FPN columela 2017 exact Ginsen/M/C-C/large size与feel/line只属于community sample且不能充当professional publication core。
    - Test 9: 两文summary 60-160、body各至少2,000 Unicode，双向canonical链接；两张unique approved primary SVG XML合法、hash不同，且无官网摄影/logo/实物颜色饰面承诺。
    - Test 10: article、pen和brand的post-write current hash各有四类approved reviews并公开；brand hash必须因topology变化且旧hash reviews不授权新hash，brand pack从未replay。
    - Test 11: first apply entities结果为article/pen两个published，允许独立brand republish audit字段；pristine replay entities精确为两个noop。terminal任一identity/alias/redirect/source owner/marker/11-list/variant/spec/scope/media/review/publication/topology tamper均拒绝且不repair。
    - Test 12: wrong prerequisite、duplicate/alias/source URL owner、retailer evidence、remote env、third repo、empty reviewer、protected/symlink/hard-link/path/PRAGMA/migration mismatch均fail closed；#3776/Curidas/Procyon/President digests与真实main/WAL/SHM snapshots不变。
  </behavior>
  <action>
按 D-01 至 D-14 先写单文件 failing integration regression。直接复用 Phase122 的 exact raw-or-terminal、single-setup、target current-hash与commit-safety测试结构，复用 Phase104/117 的 static article redirect 与 remove-one/add-one brand topology hash重审结构；不要增加 shared helper、runner、migration、schema、Playwright、search、LLM或package。

setup必须让全部positive、fault和tamper assertions只写同一个 top-level caller-owned checkpoint copy；每个故障注入都在该copy内精确恢复后继续，不创建第二数据库copy、第二migration runner，也不得打开真实catalog client。baseline digests覆盖Platinum brand全部non-topology payload与reverse set、Phase42 #3776、Phase78 Curidas、Phase121 Procyon、Phase122 President及其publications，以及real main/WAL/SHM。为raw rows使用完整字段/row-ID断言，不能只比长度或ID；source-owner collision扫描必须覆盖ID/slug/name/alias/entity.source_url/entity_references、phase marker、11-family labels和PIZ exact product URLs。

把所有source boundary验证落在source metadata、fact_scopes、claims/citations、model_specs/model_variants evidence上，而非正文关键词。测试显式证明article navigation不产生graph links、retailer/customer sources不计入review readiness、JP与EN同属Platinum official independence group而不双算独立性，以及完整terminal之前绝不返回noop。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase123-platinum-izumo-piz-80000n.test.ts</automated>
  </verify>
  <done>失败回归完整锁定 exact raw、same-ID article、one new pen、11-family/2-variant evidence、one-pair topology replacement、three current-hash publications、tamper/noop与protected catalog。</done>
</task>

<task type="auto">
  <name>Task 2: 编写 Izumo family 与 PIZ-80000N 两份自然中文 reviewed copy</name>
  <files>.planning/content-research/platinum-izumo-family-phase123.md, .planning/content-research/platinum-izumo-piz-80000n-phase123.md</files>
  <action>
按 D-05 至 D-11 写两份 Markdown，各固定 `## summary` 与 `## body_md`，summary 60-160 Unicode字符、body至少2,000 Unicode字符；article正文链接 `/pen/platinum-izumo-piz-80000n`，pen正文反链 `/article/platinum-izumo`。文风自然、具体，不冒充亲测或拥有，不把official marketing、dated catalog、maintenance instruction、independent sample和community sample混成同一证据层。

family以官方 `https://www.platinum-pen.co.jp/en/brands/detail/?pid=70`（retrieved 2026-07-22）的 `IZUMO'S LINEUP` heading和逐卡label为locator，对重复图片卡去重后逐字呈现：PIZ-600000 Takisansui；PIZ-500000 Hama no Matsu limited；PIZ-300000 Hama no Matsu limited；PIZ-300000 Urokomon；PIZ-300000A Aurora；PBA-120000G Takeami；PBA-120000Y Takeami；PIZ-100000 Yakumo Byakudan；PIZ-80000N Ginsen/Togi Yakumo；PIZ-50000T Tagayasan；PIZ-55000 Tamenuri。说明这是当前检索页面的11-family navigation snapshot，不是共享spec table；2025 Precious Wood news只作为dated sibling announcement，不能静默加入该snapshot。除PIZ target外不创建兄弟实体。

PIZ文稿以JP `https://www.platinum-pen.co.jp/products/fountain-pen/2064/` 与EN `https://www.platinum-pen.co.jp/en/products/detail/?pid=2064`（retrieved 2026-07-22）为current primary。locator必须具体到breadcrumb/product code、JP price/description与 `ペン先／ペン種／仕様／サイズ／付属品／化粧箱` labels、EN descriptive paragraph与 `Nib／Base Material／Surface Finish／Size／Weight` labels，以及#91/#92 code tables；JP唯一支持¥165,000 snapshot。正文精确区分#91 Ginsen Yakumo与#92 Togi Yakumo，并只给#92使用togidashi/polished说明。

2019-2020 catalog必须记录PDF printed page、section/table heading和row/column labels，只作dated specs/variants corroboration；maintenance PDF必须记录printed page、step/heading与原文附近短locator，只支撑model-scoped cleaning cadence/process和Platinum replacements，不扩写性能、耐久或一般漆面护理。Leigh Reyes `A pen with a sea of clouds`固定published `2013-06-25`，保留older Yakumonuri但不判#91/#92；threads、older President engraving、Fine writing/reliability/appearance均dated sample observation。FPN `Platinum Izumo Yagunomuri Ginsen. A Serene Giant Pen`固定author `columela`、published `2017-08-05`、community/user_generated tier，只支撑exact Ginsen sample、M、cartridge/converter、large size与个人feel/line observations。禁止用retailer/customer reviews补publication evidence。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; test -s .planning/content-research/platinum-izumo-family-phase123.md &amp;&amp; test -s .planning/content-research/platinum-izumo-piz-80000n-phase123.md &amp;&amp; node --import tsx --test tests/content/phase123-platinum-izumo-piz-80000n.test.ts</automated>
  </verify>
  <done>两份2k+ reviewed copy完成11-family navigation与PIZ exact product/maintenance/sample边界，互相可达且没有共享spec或额外sibling身份。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 原子重分类与topology replacement、current-hash发布并精确提交八文件</name>
  <files>scripts/data/phase123-platinum-izumo-piz-80000n.ts, scripts/apply-phase123-platinum-izumo-piz-80000n-content.ts, public/images/library/site-original/phase123/platinum/platinum-izumo-family.svg, public/images/library/site-original/phase123/platinum/platinum-izumo-piz-80000n.svg, src/lib/entity-redirects.ts</files>
  <behavior>
    - Test 1: data module导出全部locked IDs/names/slugs/aliases/legacy row IDs/protected IDs、11-family exact set、#91/#92 exact set、source URLs/dates/tiers/locators/scopes、article descriptor、PIZ CuratedEntityPack loader与two SVG paths。
    - Test 2: SVG均为1600x900、unique title/content/hash、XML合法；family图表达11-family/no-shared-spec，PIZ图表达exact variants/spec/maintenance/sample，并明确non-photo/non-logo/not-to-scale/not-colour-proof/not-finish-proof。
    - Test 3: verified repo/DB authority、Phase42/78/121/122 baseline、raw-or-terminal、alternate/source-owner/route检查都在first write前完成；失败时owned digest不变。
    - Test 4: 单一identity/payload/topology transaction保留OOumUrtFoAqu、替换legacy payload、创建PIZ、写taxonomy action、删除旧maker pair并添加一对new links；静态route helper精确返回article target，brand non-topology payload和protected entities不变。
    - Test 5: transaction后article/pen payload、sources/scopes/media完整；随后article、pen、brand各在自己的current hash经review API + publishEntity公开。terminal全契约完整才noop，tamper不自动repair。
  </behavior>
  <action>
按 D-01 至 D-14 创建 phase-local data/apply 与两张SVG。data对article使用Phase104/117 family descriptor模式，对pen使用Phase121/122 `CuratedEntityPack`模式；官网brand/product/catalog/manual共享Platinum official registry/independence group但保留独立document items和locators，Leigh使用independent professional/personal publication group，FPN使用community user-generated group。current stable specs只有D-06官方逐字段allowlist；catalog、maintenance、older ambiguous sample与community exact sample各自分scope，所有不能成为stable current facts的字段用`qualifies:false` evidence保存。

apply首写前验证canonical repo pair、reviewer、remote env、caller-owned DB containment/realpath/nlink/inode/PRAGMA/migration032、protected snapshots、Phase42/78/121/122 exact terminal prerequisites、raw article inventory与new target absent，或完整terminal。扫描alternate identities、aliases、source URLs/owners、phase markers和redirect collisions；只允许两种完整状态，不接纳hybrid。

first state在一个write transaction内：清除OOumUrtFoAqu附着的legacy story/spec/claim/four references/commercial media和旧content owners，保留并补齐aliases；原位改type/name/slug/source marker和reviewed article payload；写stable same-ID taxonomy batch/action；创建唯一PIZ entity并安装pack；删除 `tvedLyJyl6UZ`/`rev-tvedLyJyl6UZ`，添加且仅添加锁定的new made_by/reverse pair。article不得留下任何made_by/reverse或model spec/variant，PIZ不得获得11 siblings为variants/specs。transaction前后比较Platinum non-topology payload、完整reverse set与四个protected digests，delta只能是旧Izumo target替换为PIZ target。旧route由`src/lib/entity-redirects.ts`的单条静态映射处理；禁止绕过migration-032 CHECK写`/article/*`数据库redirect。

transaction commit后分别计算article、pen和brand current hash；对每个调用`recordEntityContentReview`的fact/language/media并用`publishEntity`完成publication review/public membership。不得重放Phase42/78/121/122或brand pack，不得直接SQL写reviews/entity_publications/public_entities，不得修改shared publication/curated-content/readiness、schema/migrations、runner、Playwright/search/LLM。first result只把article/pen列为published targets；如既有result type能无共享改动表达audit，再附brand republish audit。terminal assertion覆盖all identities/aliases/redirect/source owners/markers/11-list/variants/specs/scopes/media/current-hash reviews/publication/topology/protected digests；完整才返回article/pen两个noop。

定向test、tsc、owned-file Biome、两个SVG XML和eight-path diff通过后才处理Git。要求index为空并记录现有unrelated dirty/untracked path/status snapshot；只显式stage frontmatter八路径，若phase data文件命中既有ignore仅对该exact文件用`git add -f`。验证cached path set精确、`git diff --cached --check`通过且无deletion；异常只unstage本包八路径并停止。禁止wide/glob add、stash、clean、reset、checkout、force或修改无关worktree。

产品commit subject精确为 `feat(content): reclassify Platinum Izumo and publish PIZ-80000N`，用post-commit path proof确认唯一产品commit恰含八个frontmatter files。PLAN不进产品commit；提交后创建 `.planning/quick/260722-clt-reclassify-platinum-izumo-and-publish-piz-80000n/260722-clt-SUMMARY.md`，frontmatter含`status: complete`，记录same-ID article/new pen/routes、11 families、#91/#92、source locators/scopes、brand republish hash、single setup、tamper/noop、protected entities/catalog、验证命令、commit hash与partial-batch声明。SUMMARY保持uncommitted，full-corpus goal stays active。
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase123-platinum-izumo-piz-80000n.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase123-platinum-izumo-piz-80000n.ts scripts/apply-phase123-platinum-izumo-piz-80000n-content.ts tests/content/phase123-platinum-izumo-piz-80000n.test.ts src/lib/entity-redirects.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase123/platinum/platinum-izumo-family.svg public/images/library/site-original/phase123/platinum/platinum-izumo-piz-80000n.svg &amp;&amp; git diff --check -- .planning/content-research/platinum-izumo-family-phase123.md .planning/content-research/platinum-izumo-piz-80000n-phase123.md scripts/data/phase123-platinum-izumo-piz-80000n.ts scripts/apply-phase123-platinum-izumo-piz-80000n-content.ts tests/content/phase123-platinum-izumo-piz-80000n.test.ts public/images/library/site-original/phase123/platinum/platinum-izumo-family.svg public/images/library/site-original/phase123/platinum/platinum-izumo-piz-80000n.svg src/lib/entity-redirects.ts</automated>
  </verify>
  <done>same-ID article、one exact pen、static article redirect、one-pair topology replacement、three current-hash publications、exact noop/tamper与protected catalog全部通过；唯一产品commit精确八文件，prefixed status-complete SUMMARY已创建但未提交。</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|---|---|
| Raw generic pen -> article + exact pen | 只能从锁定raw payload拆成同ID article与一个新PIZ identity；partial migration或duplicate必须拒绝。 |
| Brand lineup -> target facts | 11-family页面只证明navigation/current cards，不能共享PIZ specs或创建兄弟实体。 |
| Product/catalog/manual -> stable scope | current JP/EN product、dated catalog与maintenance instruction有不同时间和claim范围。 |
| Independent/community sample -> current facts | Leigh型号不明的older sample和FPN exact community sample均不能泛化或解锁publication。 |
| Topology -> brand authorization | 删除旧article maker、添加new pen maker会改变brand hash，必须post-topology重审。 |
| Caller/repo alias -> catalog | 错误repo/path/env/client可能污染真实catalog或伪造terminal。 |
| Dirty worktree -> product commit | 工作树已有大量无关research/next-phase内容，宽泛stage会夹带用户工作。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-123-01 | Spoofing | Izumo identities/aliases | critical | mitigate | Task1/3以exact raw-or-terminal inventory锁定ID、name、slug、aliases、legacy rows、new-absent/terminal；alternate拒绝。 |
| T-123-02 | Tampering | 11-family/current variants | high | mitigate | Task1-3把deduplicated 11 set与#91/#92 set写成exported constants和结构断言；siblings不可进入target pack。 |
| T-123-03 | Tampering | source qualification | high | mitigate | Task1-3按official current/catalog/manual/ambiguous sample/community sample拆scope、locator与qualifies evidence。 |
| T-123-04 | Repudiation | content reviews/publication | high | mitigate | Task3对article/pen/brand记录reviewer/current hash并只经review APIs/publishEntity发布；SUMMARY记录hash、命令和commit。 |
| T-123-05 | Tampering | maker topology/brand hash | critical | mitigate | Task1/3锁定remove old pair/add one new pair、brand non-topology digest、reverse-set delta和post-topology current hash；禁止brand replay/direct lifecycle SQL。 |
| T-123-06 | Elevation of Privilege | repo/database authority | critical | mitigate | Task1/3验证canonical repo pair、owned containment、realpath/nlink/inode/PRAGMA/migration032与protected main/WAL/SHM snapshots。 |
| T-123-07 | Denial of Service | terminal replay/tamper | medium | mitigate | Task1/3仅完整terminal可noop；任何hybrid/source/scope/media/review/publication/topology tamper失败且不repair。 |
| T-123-08 | Information Disclosure | retailer/customer evidence | medium | mitigate | Task1-3移除legacy commercial attachment并拒绝retailer/customer review作为core evidence或publication unlock。 |
| T-123-09 | Tampering | product commit | high | mitigate | Task3要求空index、exact eight-path cached set、cached diff/no-deletion与post-commit proof；异常只unstage owned paths。 |
| T-123-SC | Tampering | package supply chain | low | accept | 本计划无package install或dependency变更，现有lockfile和工具链不变。 |

</threat_model>

<source_audit>

| SOURCE | ID | Feature/Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | same-ID Izumo article + one PIZ-80000N published partial batch | 1-3 | COVERED | identity/content/route/topology/publication/safety完整。 |
| REQ | QUICK-260722-CLT | Phase123 reclassify Platinum Izumo and publish PIZ-80000N | 1-3 | COVERED | frontmatter requirement映射全部tasks。 |
| RESEARCH | R-01 | Phase104 series navigation/no shared specs | 1-3 | COVERED | article descriptor与navigation-only siblings。 |
| RESEARCH | R-02 | Phase117 topology change/current-hash brand republish | 1,3 | COVERED | one transaction + no brand pack replay。 |
| RESEARCH | R-03 | Phase121/122 pack/authority/single-checkpoint/raw-terminal patterns | 1,3 | COVERED | exact test/apply architecture。 |
| RESEARCH | R-04 | official Izumo 11-family page + 2025 sibling exclusion | 1-3 | COVERED | exact deduplicated constant。 |
| RESEARCH | R-05 | official JP/EN PIZ exact variants/specs/price | 1-3 | COVERED | per-document locator and scope。 |
| RESEARCH | R-06 | catalog dated corroboration + Izumo maintenance | 1-3 | COVERED | printed-page/section locators, narrow scopes。 |
| RESEARCH | R-07 | Leigh ambiguous older sample + FPN community exact sample | 1-3 | COVERED | sample-only/non-core boundaries。 |
| CONTEXT | D-01 | same donor ID article and exactly one stable new pen | 1,3 | COVERED | locked identities。 |
| CONTEXT | D-02 | preserve old names and static article redirect | 1,3 | COVERED | three aliases + exact route map。 |
| CONTEXT | D-03 | remove legacy pair/add exact PIZ pair in one transaction | 1,3 | COVERED | exact topology delta。 |
| CONTEXT | D-04 | brand/article/pen current-hash API publication and protected pens | 1,3 | COVERED | no replay/direct lifecycle SQL。 |
| CONTEXT | D-05 | exact 11 families, duplicate cards deduped, 2025 excluded | 1-3 | COVERED | navigation snapshot only。 |
| CONTEXT | D-06 | PIZ #91/#92 and official exact spec/price allowlist | 1-3 | COVERED | current target pack。 |
| CONTEXT | D-07 | 2019-2020 catalog dated only | 1-3 | COVERED | no current availability inference。 |
| CONTEXT | D-08 | maintenance model-scoped only | 1-3 | COVERED | cadence/process/replacement boundary。 |
| CONTEXT | D-09 | Leigh sample ambiguity | 1-3 | COVERED | no #91/#92 guess。 |
| CONTEXT | D-10 | FPN community sample, no retailer/customer unlock | 1-3 | COVERED | source tier and publication exclusion。 |
| CONTEXT | D-11 | two natural Chinese copies + two unique SVGs | 1-3 | COVERED | length/media assertions。 |
| CONTEXT | D-12 | single caller-owned checkpoint; exact raw/terminal/noop/tamper | 1,3 | COVERED | authority and protected triplet。 |
| CONTEXT | D-13 | exact eight product files/subject/uncommitted prefixed SUMMARY | 3 | COVERED | git allowlist/output contract。 |
| CONTEXT | D-14 | partial batch only; no shared infra/package/schema | 1-3 | COVERED | full goal remains active。 |

Excluded by explicit scope: sibling SKU entities/variants/specs, 2025 Precious Wood as a 12th current card, retailer/customer reviews, additional Izumo pens, full Platinum/full-corpus completion, production catalog mutation/deploy, shared publication/readiness/curated-content changes, Playwright/search/LLM/schema/migration/runner/package work, and unrelated dirty/untracked files. Source audit has no missing items.

</source_audit>

<pre_mortem>

1. **最可能失败：raw草稿只按ID/长度验证，legacy reference或maker已被改仍自动迁移。** Mitigation: Task1/3锁定完整identity、aliases、relationship IDs、story/spec/claim、四references、media、publication与redirect inventory。
2. **最可能失败：重复图片卡或2025 news被算进lineup，兄弟规格又流入PIZ。** Mitigation: exact 11-family exported constant、#91/#92 independent set、navigation-only assertions和qualifies:false evidence。
3. **最可能失败：#92 togidashi、catalog旧字段或sample写感被泛化到#91/current family。** Mitigation: per-document/per-variant scopes、exact locators与sample/community tiers。
4. **最可能失败：删除old reverse后brand hash变化，但旧review或brand pack replay掩盖授权失效。** Mitigation: 对比pre/post hash，禁止replay，post-topology仅用recordEntityContentReview + publishEntity。
5. **最可能失败：测试或提交污染真实catalog与无关worktree。** Mitigation: single owned checkpoint、protected sidecar snapshots、空index、显式eight-path allowlist和post-commit proof。

Reachability is complete: migrated caller-owned checkpoint -> Phase42/78/121/122 published Platinum prerequisites -> exact Izumo raw/new-absent inspection -> same-ID article + static article redirect + one PIZ pen -> old-pair/new-pair topology transaction -> scoped sources/copy/two media -> article/pen/brand current-hash review APIs -> canonical and legacy routes -> exact terminal noop/tamper proofs -> exact eight-file product commit and uncommitted status-complete SUMMARY. No link depends on shared infra, extra sibling entities, production DB writes, packages or later rollout.

</pre_mortem>

<verification>

1. `node --import tsx --test tests/content/phase123-platinum-izumo-piz-80000n.test.ts` passes from one caller-owned checkpoint setup and proves protected main/WAL/SHM equality.
2. `OOumUrtFoAqu` is the only generic Izumo article and old route redirects permanently; `phase123-platinum-izumo-piz-80000n` is the only target pen with exact #91/#92.
3. Article contains exactly the locked 11-family navigation snapshot with no shared specs/entities; PIZ facts preserve official current, catalog, maintenance, ambiguous sample and community sample scopes.
4. Article has no maker; Platinum topology delta is exactly old pair removed/new pair added, brand non-topology payload unchanged, and all three current hashes are reviewed/published through APIs.
5. First apply returns two published targets, pristine replay two noops, and raw/terminal authority/identity/source/redirect/content/topology/publication tamper fixtures fail closed.
6. #3776、Curidas、Procyon、President和真实catalog完全受保护；retailer/customer evidence不解锁publication。
7. `tsc`、owned Biome、two SVG XML、eight-path diff/commit checks通过；commit subject/path set精确，PLAN与prefixed SUMMARY保持在产品commit之外。

</verification>

<success_criteria>

- Platinum Izumo以same ID成为可公开漫游的系列文章，旧names/route可追溯；唯一PIZ-80000N exact pen公开且反链article。
- 11-family lineup、#91/#92、official specs、dated catalog、maintenance与两类sample都有不可跨接的证据边界。
- legacy article maker pair被唯一PIZ pair替换，Platinum在post-topology current hash重审，四个protected pens与真实catalog不变。
- exact raw/terminal、single setup、first/noop/tamper、TypeScript/Biome/XML/diff/commit gates全部通过。
- 唯一产品commit精确八文件；prefixed status-complete SUMMARY后置未提交，并明确full-corpus goal remains active。

</success_criteria>

<output>
Create `.planning/quick/260722-clt-reclassify-platinum-izumo-and-publish-piz-80000n/260722-clt-SUMMARY.md` only after the product commit; set SUMMARY frontmatter `status: complete`, keep PLAN/SUMMARY outside the product commit, leave the prefixed SUMMARY uncommitted, and state that Phase123 is only a partial batch while the full-corpus goal remains active.
</output>
