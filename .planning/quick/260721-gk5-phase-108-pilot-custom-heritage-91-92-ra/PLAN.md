---
phase: quick
plan: 260721-gk5
slug: phase-108-pilot-custom-heritage-91-92-raw-identity-publication
type: execute
status: ready
wave: 1
depends_on: []
autonomous: true
created_at: 2026-07-21
files_modified:
  - .planning/content-research/pilot-custom-heritage-91-phase108.md
  - .planning/content-research/pilot-custom-heritage-92-phase108.md
  - scripts/data/phase108-pilot-custom-heritage-91-92.ts
  - scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts
  - tests/content/phase108-pilot-custom-heritage-91-92.test.ts
  - public/images/library/site-original/phase108/pilot/pilot-custom-heritage-91.svg
  - public/images/library/site-original/phase108/pilot/pilot-custom-heritage-92.svg
must_haves:
  truths:
    - "Custom Heritage 91 复用 raw ID NpJibLHczSl9 并规范为 pilot-custom-heritage-91；Custom Heritage 92 复用 raw ID -Oa7pDNi4UnI 并规范为 pilot-custom-heritage-92，仓库中不出现同型号 duplicate identity。"
    - "91 明确是 FKVHN-12SR、14K No.5、cartridge/converter；92 明确是 FKVH-15SRS、14K No.5、内置 piston，正文、spec、variant、care 与图示均不互抄上墨结构。"
    - "两页各有自然中文完整正文、可定位官方主来源、独立实测、字段级 evidence 与各自唯一的本站原创主图；2025 price PDF 只作为 2025-10 生效的历史价格快照。"
    - "两实体保留各自现有且唯一的 made_by -> Pilot Zt-PbXkE7UHM；Pilot 品牌反向公开型号查询出现两条新页面，但品牌正文、来源、review、publication 与既有 Pilot 页面不被 Phase 108 重写。"
    - "两个 CuratedEntityPack 只在 caller-owned checkpoint/disposable copy 上安装，经 current-hash fact、language、media review 后仅由 publishEntity 进入 contract-v3 public_entities；重复执行精确 noop。"
    - "真实 data/fpkg.db main/WAL/SHM 始终不变；产品提交只含 frontmatter 的七个 owned 文件，并保留全部现有 dirty/untracked 内容。"
    - "SUMMARY 将 Phase 108 描述为 Custom Heritage 91/92 的局部交付，不宣称全量内容 goal 完成。"
  artifacts:
    - path: "scripts/data/phase108-pilot-custom-heritage-91-92.ts"
      provides: "两个 CuratedEntityPack、固定 raw/canonical identity、独立 source scope、claim/spec/variant/media 映射"
    - path: "scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts"
      provides: "owned-only identity canonicalization、legacy redirects、pack install、review/publish 与 noop 入口"
    - path: "tests/content/phase108-pilot-custom-heritage-91-92.test.ts"
      provides: "identity、91/92 规格隔离、品牌零扰动、authority、publication、幂等与真实目录保护回归"
    - path: "public/images/library/site-original/phase108/pilot/pilot-custom-heritage-91.svg"
      provides: "91 cartridge/converter 结构边界的本站原创示意图"
    - path: "public/images/library/site-original/phase108/pilot/pilot-custom-heritage-92.svg"
      provides: "92 内置 piston 结构边界的本站原创示意图"
  key_links:
    - from: "scripts/data/phase108-pilot-custom-heritage-91-92.ts"
      to: "scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts"
      via: "CuratedEntityPack、loadCuratedEntityPack 与 packId 的稳定 manifest/payload IDs"
    - from: "scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts"
      to: "src/lib/publication.ts"
      via: "recordEntityContentReview 后调用 publishEntity；不直接写 published lifecycle"
    - from: "NpJibLHczSl9 / -Oa7pDNi4UnI"
      to: "Zt-PbXkE7UHM"
      via: "保留既有唯一 made_by 行；品牌反向导航由 public_entities + made_by 查询生成"
    - from: "tests/content/phase108-pilot-custom-heritage-91-92.test.ts"
      to: "data/fpkg.db"
      via: "只做 snapshotCatalogFiles 与 checkpoint copy；全部 migrate/apply/query 写操作绑定 caller-owned copy"
---

# Quick 260721-gk5: Phase 108 Pilot Custom Heritage 91 / 92

## Objective

把两个既有 raw Pilot 条目规范为来源化、可公开且严格分立的 Custom Heritage 91 与 92 页面。Phase 108 复用 `NpJibLHczSl9` 和 `-Oa7pDNi4UnI`，补齐 canonical route、两份完整中文内容、证据图、独立原创主图与 contract-v3 publication；不新建替代 ID，不重做 Pilot 品牌页，不修改共享 ingestion/publication 基础设施。

Purpose: 让用户能从 Pilot 品牌页进入两个真实型号，并一眼分清相同 No.5 金尖下的 cartridge/converter 与内置 piston 两条路线。

Output: 两份 reviewed Markdown、两个 CuratedEntityPack、两张型号专属 SVG、一个 owned-copy apply 入口及一份定向集成回归。

## Planning Findings and Locked Boundaries

- 2026-07-21 对 protected catalog 的只读盘点确认：`NpJibLHczSl9` 是 pen/raw slug `百乐-pilot-heritage-91`，`-Oa7pDNi4UnI` 是 pen/raw slug `百乐-pilot-heritage-92`；两者当前各有且仅有一条 `made_by -> Zt-PbXkE7UHM`，不得删除再插入。
- Phase 84 的 pack/target 集合只覆盖 Platinum 四页与 Pilot Capless、Custom 823、Custom Heritage 912；它只在 912 边界中提到 91/92，没有处理这两个 raw ID。
- protected catalog 中 Pilot brand 当前仍是 draft 且是 130 字旧正文；仓库同时已有 Phase 84 的完整 Pilot brand CuratedEntityPack 与来源稿。Phase 108 测试基线应按 Phase 105 的 `preparePublishedPilotBrand` 模式，在 owned copy 上复用 Phase 84 brand + 一个既有 Pilot pen pack 形成已完成品牌 publication，然后再拍 brand snapshot。Phase 108 不新增 companion brand pack，也不把旧 130 字品牌稿直接发布。
- Phase 106 证明 migration 032 会在 made_by insert/update/delete 时失效 source 与 target brand。由于 91/92 的正确 maker 已存在，Phase 108 必须把该行视为 immutable prerequisite；若数量或 target 不符则在首个写事务前停止，若精确则拍摄并保持既有 link ID/reason/row digest，不以“修复”为名触发 Pilot brand re-review。
- Phase 108 安装前后 Pilot brand 的 entity/story/source/reference/media/review/publication/content hash 必须相同；允许的品牌侧变化只有反向公开 pen 查询在两目标发布后新增 canonical 91/92。
- 官方 live 入口为 `https://www.pilot-custom.jp/en/lineup/heritage.html`；91/92 各自 warranty/use-care 页面、该入口解析出的当前 Pilot catalog product link，以及 `https://www.pilot.co.jp/information/2025.10%20price_list.pdf` 共同承担型号、维护和时间化价格证据。执行时必须重新核验 live 内容与 locator，不能只信本计划摘录。
- 91 的独立实测优先使用 `https://scrively.org/video-review-pilot-custom-heritage-91/`；若使用 Fountain Pen Network，只能在 live 正文可访问且能定位作者/样本时作为 community context，403/search snippet 不得升级为 qualified professional source。92 使用 `https://www.parkablogs.com/picture/review-pilot-custom-heritage-92-fountain-pen`，可再以 Gentleman Stationer 的 2016 或 2026 实测交叉核对。

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/content-research/research-pilot-pelikan-raw-2026-07-20.md
@.planning/content-research/pilot-brand-publishable-content-2026-07-19.md
@.planning/quick/260720-nhl-phase-105-pilot-custom-urushi-owned-chec/260720-nhl-PLAN.md
@.planning/quick/260720-nhl-phase-105-pilot-custom-urushi-owned-chec/260720-nhl-SUMMARY.md
@.planning/quick/260721-da2-phase-106-sheaffer-connaisseur-imperial-/260721-da2-SUMMARY.md
@scripts/data/phase84-platinum-pilot-p0-v3.ts
@tests/content/phase105-pilot-custom-urushi.test.ts
@scripts/lib/curated-content-pack.ts
@src/lib/publication.ts
@src/lib/audit/read-only-catalog.ts
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 先锁定双 raw identity、品牌基线与 owned-copy 零扰动回归</name>
  <files>tests/content/phase108-pilot-custom-heritage-91-92.test.ts</files>
  <behavior>
    - Test 1: 从 `snapshotCatalogFiles` + `copyCheckpointedCatalogToDisposableCopy` 创建 caller-owned copy，迁移至 032；按 Phase 105 fixture 模式从 `phase84PlatinumPilotP0V3BrandPacks` 选 Pilot brand、从 Phase 84 选一个既有 Pilot pen，使用 `applyCuratedContentPacks` 建立完整且 published/readiness=1 的 Pilot 基线。该准备发生在 Phase 108 before-snapshot 之前，不计入 Phase 108 apply outcome。
    - Test 2: preflight 恰好找到 `NpJibLHczSl9`/raw 91 与 `-Oa7pDNi4UnI`/raw 92，均为 pen、无 alternate canonical slug/name/source collision、各有唯一且原样指向 `Zt-PbXkE7UHM` 的 made_by；canonicalization 后仍是同一 ID，并各有 raw `/pen/...` 到 canonical `/pen/...` 的 permanent entity_redirect。
    - Test 3: 91 为 FKVHN-12SR、14K No.5、cartridge/converter，92 为 FKVH-15SRS、14K No.5、内置 piston；分别校验 claim、scope、spec field evidence、market_sku variant、care 文案与 primary SVG，且 91 pack 不含 92 的 piston/固定墨仓字段，92 pack 不含 cartridge/converter 兼容字段。
    - Test 4: 两页 body_md 各至少 2,000 个 Unicode 字符；每页都有 qualified official primary + professional secondary independence group、current scope、2025-10 historical price scope、approved primary site-original SVG、current-hash fact/language/media/publication 四类 review、publishable=1、blocker_count=0 与 public membership。
    - Test 5: Pilot brand 的 entity/story/source/reference/media/review/publication/hash 在 Phase 108 前后完全相同；除 91/92 public reverse navigation 新增外，Phase 84 的 Capless/823/912、已完成 Pilot 页面以及其他 Pilot entity payload/publication 摘要均不变，不重放 brand pack。
    - Test 6: 继承任一远端选择变量、空 reviewer、protected path、symlink/hard-link alias、owned-root 外路径、client/path mismatch、未迁移 copy、错误 raw identity、alternate canonical collision 或 maker prerequisite 不精确时均在首个 Phase 108 写事务前 fail closed，并比较 disposable state 不变；危险 case 的 client 永不绑定 data/fpkg.db。
    - Test 7: 第二次执行只返回两个 noop，content hash/revision/review/redirect/made_by counts 不变；finally 后 protected main/WAL/SHM snapshot 与测试前完全相同。
  </behavior>
  <action>
新增一份单文件定向集成测试，先写上述失败断言，再实现后续任务。复用 Phase 105 的 published Pilot fixture 方式，但不要导出或改写 Phase 105 helper：在本测试内选择现成 Phase 84 Pilot brand/pen packs，并明确把 fixture setup 与 Phase 108 apply 结果分开。before-snapshot 应覆盖 Pilot brand 全 payload/current-hash review/publication、两个目标原始 identity/made_by 行、所有非目标 Pilot 页面摘要和 protected catalog 三文件快照。

所有数据库写入只允许发生在临时 caller-owned copy。authority rejection 必须比较调用前后 disposable 数据摘要，证明没有先写后抛；真实 catalog 只通过项目 snapshot/checkpoint helper 读取。测试不要新增共享 fixture、通用 runner、Playwright/general acceptance、search 或 LLM 路径。
  </action>
  <verify>
    <automated>node --import tsx --test tests/content/phase108-pilot-custom-heritage-91-92.test.ts</automated>
  </verify>
  <done>失败测试完整锁定 raw ID 复用、91/92 规格隔离、Phase 84 品牌基线、不触碰既有 maker、legacy route、四类审核、Pilot 零扰动、authority fail-closed、replay noop 与 protected catalog 不变。</done>
</task>

<task type="auto">
  <name>Task 2: 编写两份 live-source 内容包与两张型号专属事实图</name>
  <files>.planning/content-research/pilot-custom-heritage-91-phase108.md, .planning/content-research/pilot-custom-heritage-92-phase108.md, scripts/data/phase108-pilot-custom-heritage-91-92.ts, public/images/library/site-original/phase108/pilot/pilot-custom-heritage-91.svg, public/images/library/site-original/phase108/pilot/pilot-custom-heritage-92.svg</files>
  <action>
写作前逐一打开并核验 live 页面：Pilot Heritage lineup、91/92 各自 warranty/use-care、lineup 当前解析出的 catalog product link、2025-10 price PDF，以及 Scrively 91、Parka Blogs 92；Gentleman Stationer 可作为 92 的第二实测。对每个来源记录实际执行日的 retrievedAt、HTTP/可读状态、标题/作者/日期、精确 locator、allowedUse、archiveUrl 与 independenceGroup。若官方 live 内容不再支持锁定的产品号或上墨结构，停止并报告冲突，不用商店摘要覆盖官方事实。FPN 若仍不可读只记录为未采用候选，不把 snippet 写入 qualified evidence。

两份 Markdown 都提供 `## summary`、`## body_md` 与来源审校区，正文各不少于 2,000 个 Unicode 字符，采用自然中文而非参数堆砌。91 围绕 FKVHN-12SR、14K No.5 rhodium nib、平顶银色调、Pilot cartridge/CON-40/CON-70N 的官方兼容和独立样本手感展开；主观弹性/反馈只归因于 Scrively 的具体样本，不泛化为 flex。92 围绕 FKVH-15SRS、14K No.5、透明树脂与内置 piston/固定墨仓的官方操作维护展开；Parka/Gentleman Stationer 的顺滑、平衡、posted 使用和清洗体验只作为作者样本观察。官方 2025-10 PDF 中的价格必须放进 `historical_price_2025_10` scope，明确不是 2026 当前售价；不要保存易变库存或店铺价格。

data manifest 定义 `PHASE108_PILOT_ID`、两个锁定 raw IDs、raw/canonical slugs 及两个 CuratedEntityPack。每个 pack 均包含 aliases、current product scope、2025 historical price scope、至少一个 qualified core claim、claim citation/evidence、必需 spec field evidence、market_sku variant、timeline/source boundary 与独立 primary media。91 与 92 使用分开的 source keys、scope keys、spec/variant IDs 与 care claims；共享 Pilot 官方 registry 可以，但不得共享上墨 claim/evidence。禁止加入 Pilot brand CuratedEntityPack，也不要修改 Phase 26/84/105 数据文件。

分别绘制 1600x900 的 site-original factual SVG：91 图展示可拆换 Pilot cartridge/converter 路线与 No.5 尖；92 图展示尾端旋钮、内置 piston/墨仓与 No.5 尖。两图都显著写明“本站原创示意图，非产品照片”，以及非比例、非颜色/表面复刻；不得使用 Pilot Logo、外站图片或把 91/92 轮廓做成同一张换字模板。每个 pack 只能把自己的 SVG 设为唯一 approved primary media。
  </action>
  <verify>
    <automated>pnpm exec biome check scripts/data/phase108-pilot-custom-heritage-91-92.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase108/pilot/pilot-custom-heritage-91.svg public/images/library/site-original/phase108/pilot/pilot-custom-heritage-92.svg &amp;&amp; node --import tsx --test tests/content/phase108-pilot-custom-heritage-91-92.test.ts</automated>
  </verify>
  <done>91/92 各自拥有完整中文正文、live-verified official/professional evidence、时间化 2025 price scope、严格分离的 CuratedEntityPack 和不复用构图的原创主图。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现 owned-only canonicalization、review/publish、noop 与精确提交</name>
  <files>scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts</files>
  <behavior>
    - Test 1: 首次 apply 只返回 NpJibLHczSl9 与 -Oa7pDNi4UnI 两个 published outcome，canonical slug/name 与 raw permanent routes 精确，未创建新 entity ID。
    - Test 2: identity transaction 不执行目标 made_by 的 delete/insert/update；原 link row 摘要不变，Pilot brand publication snapshot 不失效。
    - Test 3: pack install 后两个实体各自产生 fact/language/media current-hash approvals，publishEntity 产生 publication review 并原子安装 contract-v3 public snapshot。
    - Test 4: terminal state 精确匹配时返回两个 noop，不重做 content review、publication、redirect 或 topology。
  </behavior>
  <action>
以 Phase 105 phase-local installer 和 Phase 106 raw canonical route 为模式实现 Phase 108 入口。首个写事务前拒绝 TURSO_DATABASE_URL、TURSO_AUTH_TOKEN、FPKG_DATABASE_URL、空 reviewer、protected file/sidecar 或 hard-link alias、symlink、owned-root 外路径、client/path 不一致、未迁移 032 的副本；使用调用者传入的 protected snapshot，并检查 PRAGMA database_list 实际绑定路径。preflight 固定 Pilot brand `Zt-PbXkE7UHM` 的 type/slug/public/readiness，两个 raw ID/type/slug，canonical slug 无其他 ID 占用，以及每个目标恰有一条既有 made_by 指向 Pilot。maker 行不是精确 prerequisite 时直接停止，不做 topology repair 或 brand re-review。

在单个 identity/route transaction 中仅把两目标的 slug/name 规范为 canonical，并为 `/pen/百乐-pilot-heritage-91`、`/pen/百乐-pilot-heritage-92` 建立到对应 canonical path 的 permanent `entity_redirects`，配套稳定 identity batch/action IDs。若 route 已存在则必须精确等于预期，否则 fail closed。不要触碰 entity_links，不增加显式 brand reverse payload；品牌反向导航由现有 made_by 与 public_entities 查询自然产生。

用 `loadCuratedEntityPack`/`packId` 在包级事务中替换两个目标自有 story/source/reference/alias/scope/claim/citation/evidence/spec/spec evidence/variant/timeline/media，并保持非公开 current revision；随后逐实体调用 `recordEntityContentReview` 写 fact/language/media current-hash approvals，最后逐实体调用 `publishEntity`。精确 terminal-state 检查需包含 source marker、canonical route、approved hash/revision、四类 reviews、readiness、public membership、maker row 与 primary media，全部满足才返回 noop。不要修改 `scripts/apply-phase22-content.ts`、`scripts/lib/curated-content-pack.ts`、`src/lib/publication.ts`、Phase 84/105/106/107 文件或任何 shared infrastructure。

CLI 只接受显式 `--database`、`--owned-root`、`--protected-catalog` 和可选 reviewer，并清空远端选择变量。定向测试通过后运行本包三个 TypeScript 文件的 Biome、项目 `tsc --noEmit`、两张 SVG 的 xmllint 与七个 owned 文件的 `git diff --check`；不运行 Playwright/general acceptance/search/LLM，也不以 data/fpkg.db 作为 database 参数。

产品提交前要求 index 为空，只 stage frontmatter 中七个产品文件，用固定排序 allowlist 与 `git diff --cached --name-only` 精确比较并运行 `git diff --cached --check`；集合不一致时只撤销本包路径的 staging 并停止，不能清理或修改无关文件。计划文件与 SUMMARY 不进入产品 commit。提交信息使用 `feat(content): publish Pilot Custom Heritage 91 and 92`；提交后验证 HEAD path set 精确等于七文件 allowlist。保留当前及执行期间出现的所有无关 modified/untracked 文件，尤其 `.planning/content-research/*`、`.next-phase*`、Phase 105 quick 与 `260719-665` quick 目录。
  </action>
  <verify>
    <automated>node --import tsx --test tests/content/phase108-pilot-custom-heritage-91-92.test.ts &amp;&amp; pnpm exec biome check scripts/data/phase108-pilot-custom-heritage-91-92.ts scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts tests/content/phase108-pilot-custom-heritage-91-92.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; xmllint --noout public/images/library/site-original/phase108/pilot/pilot-custom-heritage-91.svg public/images/library/site-original/phase108/pilot/pilot-custom-heritage-92.svg &amp;&amp; git diff --check -- .planning/content-research/pilot-custom-heritage-91-phase108.md .planning/content-research/pilot-custom-heritage-92-phase108.md scripts/data/phase108-pilot-custom-heritage-91-92.ts scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts tests/content/phase108-pilot-custom-heritage-91-92.test.ts public/images/library/site-original/phase108/pilot/pilot-custom-heritage-91.svg public/images/library/site-original/phase108/pilot/pilot-custom-heritage-92.svg &amp;&amp; git diff --cached --check &amp;&amp; phase108_expected=$(printf '%s\n' .planning/content-research/pilot-custom-heritage-91-phase108.md .planning/content-research/pilot-custom-heritage-92-phase108.md public/images/library/site-original/phase108/pilot/pilot-custom-heritage-91.svg public/images/library/site-original/phase108/pilot/pilot-custom-heritage-92.svg scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts scripts/data/phase108-pilot-custom-heritage-91-92.ts tests/content/phase108-pilot-custom-heritage-91-92.test.ts | sort) &amp;&amp; phase108_actual=$(git show --format= --name-only HEAD | sed '/^$/d' | sort) &amp;&amp; test "$phase108_actual" = "$phase108_expected"</automated>
  </verify>
  <done>两个锁定 raw ID 在 owned copy 中经 current-hash 四类审核公开且 replay noop；Pilot brand/既有页面与 protected catalog 不变；唯一产品 commit 精确包含七个 owned 文件。</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|---|---|
| protected catalog -> caller-owned checkpoint copy | 真实 SQLite main/WAL/SHM 只允许 snapshot/checkpoint copy；migrate、fixture、apply 与查询写操作全部绑定 owned file。 |
| live official/review pages -> curated claims | 外部页面会变化，产品号、上墨结构、样本体验与 2025 历史价格必须有 retrieved date、locator 和 scope。 |
| raw identity -> canonical public route | 两个已知 raw ID 必须原位改名并保留 legacy route；任何 alternate identity/collision 都可能造成 duplicate。 |
| existing made_by -> public Pilot reverse navigation | 关系已经正确；错误的 delete/reinsert 会触发 migration 032 使 Pilot brand publication 失效。 |
| dirty working tree -> product commit | 大量无关 research、next-phase 与 quick records 和七个 owned 文件共存，staging 必须使用精确 allowlist。 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-108-01 | Tampering | catalog authority | critical | mitigate | 首个写事务前验证 remote env、owned root、realpath/inode、symlink/hard-link、PRAGMA database_list、migration 032 与 protected snapshot；每个拒绝路径比较 disposable state。 |
| T-108-02 | Spoofing | raw/canonical identity | high | mitigate | 固定两个 raw IDs 和 raw slugs，检查 canonical collision，原位 canonicalize 并建立精确 permanent routes；禁止创建替代 ID。 |
| T-108-03 | Tampering | 91/92 specification boundary | high | mitigate | 两个 pack 使用独立 scope/claim/spec/evidence/media IDs；测试同时正向断言各自 fill system 并交叉断言不含 sibling 结构。 |
| T-108-04 | Elevation of privilege | publication lifecycle | high | mitigate | pack 保持非公开，fact/language/media current-hash approvals 后仅由 publishEntity 生成 publication review/snapshot。 |
| T-108-05 | Tampering | Pilot brand publication | high | mitigate | Phase 84 只用于 before-snapshot fixture；Phase 108 将现有 maker row 设为 immutable prerequisite，品牌全 payload/hash/reviews/publication 前后相等。 |
| T-108-06 | Spoofing | live/current vs historical evidence | medium | mitigate | executor 重新核验 live pages；2025 price PDF 单列 historical scope，独立评测只约束作者样本，不把价格/手感泛化为当前官方规格。 |
| T-108-07 | Tampering | git staging boundary | high | mitigate | 空 index 前提、固定七路径 staged/HEAD 集合与 diff checks；不清理或暂存任何无关 worktree 内容。 |
</threat_model>

<verification>
- `node --import tsx --test tests/content/phase108-pilot-custom-heritage-91-92.test.ts`
- `pnpm exec biome check` 只覆盖 Phase 108 的 data/apply/test 三个 TypeScript 文件。
- `pnpm exec tsc --noEmit --pretty false`
- `xmllint --noout` 覆盖两张 Phase 108 SVG。
- 七个 owned 产品文件 `git diff --check`；提交前另运行 `git diff --cached --check` 与精确 staged path-set 比较。
- 定向测试自行证明真实 `data/fpkg.db` main/WAL/SHM 前后 snapshot 完全一致；执行阶段不运行任何真实 catalog 写入命令。
- 产品 commit path set 必须与 frontmatter 七文件 allowlist 精确相等；PLAN 与 SUMMARY 不进入产品 commit。
</verification>

<success_criteria>
- 91/92 各自复用指定 raw ID，canonical slug 与 legacy permanent route 唯一，没有 duplicate entity。
- FKVHN-12SR c/c 与 FKVH-15SRS 内置 piston 在正文、claim、spec、care、variant 和 SVG 六个层面严格分开。
- 两页来源满足 official primary + independent professional secondary，2025 price 只作历史 scope；两份正文和两张主图均完整、自然、可审计。
- Pilot brand 使用 Phase 84 已完成内容作为测试 prerequisite，不新增 companion pack、不 re-review、不重写；品牌反向公开导航新增且只新增 91/92。
- 两实体 contract-v3 四类 current-hash review、readiness、public membership 与 replay noop 全部通过，真实 catalog 不变。
- 唯一产品 commit 只含七个 Phase 108 文件，所有无关 dirty/untracked 内容保持原样。
- SUMMARY 明确 Phase 108 只交付 Pilot Custom Heritage 91/92，不代表全量 goal 完成。
</success_criteria>

## Source Coverage Audit

| SOURCE | ID | Feature/Requirement | Plan | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | 发布来源化 Custom Heritage 91/92，同时复用 raw identity 并保护现有 Pilot 内容 | 260721-gk5 | COVERED | Tasks 1-3 覆盖 identity、内容、publication、隔离与提交。 |
| REQ | — | Quick task 未分配 ROADMAP requirement ID | 260721-gk5 | COVERED | 无遗漏 phase_req_ids。 |
| RESEARCH | — | Pilot Heritage lineup、warranty/catalog 与 2025-10 price PDF 的 live locator/scope | 260721-gk5 | COVERED | Task 2 要求 executor 重新核验并保存定位；价格为 historical scope。 |
| RESEARCH | — | 91 使用 Scrively/FPN，92 使用 Parka Blogs/Gentleman Stationer 的独立样本 | 260721-gk5 | COVERED | Task 2 规定 source qualification、403 边界与样本归因。 |
| CONTEXT | C-01 | Phase 84 未处理 91/92；复用 NpJibLHczSl9 与 -Oa7pDNi4UnI，绝不新建 duplicate | 260721-gk5 | COVERED | Findings 与 Tasks 1/3 固定 ID、collision preflight 和原位 canonicalization。 |
| CONTEXT | C-02 | 91=FKVHN-12SR/14K No.5/c-c；92=FKVH-15SRS/14K No.5/piston，严禁互抄 | 260721-gk5 | COVERED | Tasks 1/2 以正向+交叉断言、独立 scopes/spec/media 锁定。 |
| CONTEXT | C-03 | canonical slug、legacy route、唯一 made_by Pilot 与品牌反向 | 260721-gk5 | COVERED | Tasks 1/3 保留 maker row、建立 permanent routes 并验证 derived reverse navigation。 |
| CONTEXT | C-04 | 两份自然中文完整正文、来源与唯一原创示意图 | 260721-gk5 | COVERED | Task 2 交付两份 2,000+ 字 Markdown 与两张专属 site-original SVG。 |
| CONTEXT | C-05 | CuratedEntityPack + recordEntityContentReview + publishEntity | 260721-gk5 | COVERED | Tasks 2/3 使用两个 packs 与 shared lifecycle APIs。 |
| CONTEXT | C-06 | 只在 caller-owned checkpoint copy；绝不写 data/fpkg.db | 260721-gk5 | COVERED | Tasks 1/3、T-108-01 与 verification 锁定 authority/snapshot。 |
| CONTEXT | C-07 | 定向回归，不扩 shared infra，不重做已完成 Pilot 页面 | 260721-gk5 | COVERED | Phase 84 仅作 fixture prerequisite；Phase 108 product 只含 phase-local files。 |
| CONTEXT | C-08 | 保护全部 dirty/untracked；产品提交只含明确 owned 文件 | 260721-gk5 | COVERED | Task 3 固定七文件 staged/HEAD allowlist。 |
| CONTEXT | C-09 | Phase 108 是局部交付，不等于全量 goal 完成 | 260721-gk5 | COVERED | Objective、Task 3、success criteria 与 SUMMARY contract 明确限制。 |

<output>
执行完成后在本 quick 目录创建 `SUMMARY.md`，记录两个 raw/canonical identity、legacy routes、live source retrieval/locators、91/92 fill-system isolation、两张 SVG、四类 review/readiness、Pilot brand before/after digest、public reverse diff、protected snapshot、noop、测试结果与七文件产品 commit allowlist；SUMMARY 不得进入产品 commit，并必须把结果描述为 Phase 108 局部交付。
</output>
