---
phase: 116-montegrappa-zero-standard-current
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/content-research/phase116-montegrappa-zero.md
  - scripts/data/phase116-montegrappa-zero.ts
  - scripts/apply-phase116-montegrappa-zero-content.ts
  - tests/content/phase116-montegrappa-zero.test.ts
  - public/images/library/site-original/phase116/montegrappa/montegrappa-zero.svg
autonomous: true
requirements:
  - QUICK-260721-LYS
must_haves:
  truths:
    - "Montegrappa Zero 以一个新 canonical pen `phase116-pen-montegrappa-zero` / `montegrappa-zero` 发布，只代表 current factory-standard Zero，不吞并 Zero Custom、Caduceus、Zodiac、Right To Play 或其他主题／合作款。"
    - "当前稳定规格只由 2026-07-21 检索的官方 current page 与 catalog 支撑：resin、stainless-steel trims、cartridge/converter、随附两支墨囊与 converter、143 mm、14 mm、32 g、steel／14K gold／14K gold flex 选项及 EF/F/M/B/ST1/ST5。"
    - "March 2020 official brochure 的 Br8 bronze launch-era 描述与 2020-11-09 The Pencilcase Blog 借测 black/ruthenium sample 保持独立 dated scopes；Br8 bronze、129 mm uncapped、约 10.5 mm section、JoWo-made、feedback 与 unposted balance 不晋升为 current stable specs。"
    - "Zero 有 60-160 Unicode 字符 summary、2,000+ Unicode 字符自然中文正文与一张唯一 approved primary SVG；正文明确 standard/Custom/theme boundary、维护与选购边界，并链接 Montegrappa brand 与已公开相关型号。"
    - "Zero 各有且仅有一条 `made_by -> phase85-brand-montegrappa`；Montegrappa brand 新增且仅新增一条指向 Zero 的 reverse navigation，并在 post-topology current hash 上重新完成 fact/language/media review 与 publishEntity。"
    - "Phase 85 -> 86 -> 87 baseline 的 Montegrappa brand、Elmo 01、Elmo 02、Elmo 02 Plus 与 Extra 1930 非 topology payload 和 source markers 保持不变；不得 replay 旧 brand pack，也不得修改 route allowlist。"
    - "全部写入只发生在 caller-owned checkpoint copy；首次 apply 发布 Zero，pristine replay 返回 noop，duplicate/tampered terminal state fail closed，真实 catalog main/WAL/SHM 不变。"
    - "唯一产品提交精确包含 frontmatter 五个产品路径；PLAN/SUMMARY/docs 后置，unrelated dirty/untracked 原样保留，并如实声明 Phase 116 只是 partial batch。"
  artifacts:
    - path: "scripts/data/phase116-montegrappa-zero.ts"
      provides: "锁定 Zero identity、current/launch/review sources、三个 scopes、current specs、dated rejected evidence、Br8-vs-stainless conflict 与原创 SVG contract"
    - path: "scripts/apply-phase116-montegrappa-zero-content.ts"
      provides: "verified repo pair、owned-copy authority、exact duplicate preflight、target-only pack apply、exact topology delta、brand current-hash review/publish 与 terminal noop"
    - path: "tests/content/phase116-montegrappa-zero.test.ts"
      provides: "Phase 85-87 baseline、source-scope conflict、publication/topology、tamper/noop、commit-path and protected-catalog integration regression"
  key_links:
    - from: "scripts/apply-phase116-montegrappa-zero-content.ts"
      to: "scripts/data/phase116-montegrappa-zero.ts"
      via: "locked identity/source markers、CuratedEntityPack loader、conflict and media contracts"
      pattern: "PHASE116_|loadPhase116"
    - from: "Montegrappa Zero"
      to: "Montegrappa brand phase85-brand-montegrappa"
      via: "exact one made_by plus trigger/idempotent reverse; brand current content hash is then reviewed and published"
      pattern: "made_by|reverse|recordEntityContentReview|publishEntity"
    - from: "current official scope"
      to: "launch brochure and 2020 review scopes"
      via: "fact_scopes + rejected spec evidence + fact_conflicts prevent dated/sample values from qualifying current fields"
      pattern: "phase116-zero-(current|launch-2020|review-2020)"
---

<objective>
发布 Montegrappa Zero 标准现行钢笔页，并把 current stainless-steel specification、March 2020 Br8 bronze launch material 与 2020 借测样笔观察保留在可审计而不可串用的来源范围内。

Purpose: 补齐 Montegrappa 当前目录中尚缺的 Zero 标准版，同时避免把 Custom 配置、主题合作款、发布初期资料或单支样笔体验写成同一当前 SKU 的稳定事实。
Output: 一篇 2,000+ 中文 sourced content、一张原创 SVG、phase-local data/apply/integration test，以及精确五文件产品提交；不改既有 Montegrappa 产品文件、route allowlist 或 shared infrastructure。
</objective>

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/quick/260721-l94-phase-115-aurora-ipsilon-family-navigati/PLAN.md
@.planning/quick/260721-l94-phase-115-aurora-ipsilon-family-navigati/SUMMARY.md
@.planning/content-research/research-aurora-montegrappa-2026-07-20.md
@scripts/data/phase85-montegrappa-elmo.ts
@scripts/apply-phase85-montegrappa-elmo-content.ts
@tests/content/phase85-montegrappa-elmo.test.ts
@scripts/data/phase86-montegrappa-elmo-family.ts
@scripts/apply-phase86-montegrappa-elmo-family-content.ts
@tests/content/phase86-montegrappa-elmo-family.test.ts
@scripts/data/phase87-montegrappa-extra-1930.ts
@scripts/apply-phase87-montegrappa-extra-1930-content.ts
@tests/content/phase87-montegrappa-extra-1930.test.ts
@src/lib/publication.ts

<interfaces>
- Existing protected identities: Montegrappa brand `phase85-brand-montegrappa`; Elmo 01 `phase85-pen-montegrappa-elmo-01`; Elmo 02 `phase86-pen-montegrappa-elmo-02`; Elmo 02 Plus `phase86-pen-montegrappa-elmo-02-plus`; Extra 1930 `phase87-pen-montegrappa-extra-1930`.
- Locked Phase 116 identity: pen ID `phase116-pen-montegrappa-zero`, slug `montegrappa-zero`, canonical name `Montegrappa Zero`; canonical route `/pen/montegrappa-zero`.
- Authority contract: repo input only `/Users/xz/CodeBuddy/fountain-pen-graph` or `/Users/xz/Documents/fountain-pen-graph`, both resolving by realpath and git top-level to `/Users/xz/Documents/fountain-pen-graph`; DB must be a migrated caller-owned, non-symlink, non-hard-link checkpoint copy whose main file matches `PRAGMA database_list`.
- Publication contract: use `recordEntityContentReview` for fact/language/media and `publishEntity`; never update lifecycle/review/publication status directly. Adding Zero changes the brand contract hash, so reviews bind only the exact post-topology hash.
- Product commit contract: exactly the five `files_modified` paths and subject `feat(content): publish Montegrappa Zero`; PLAN and later SUMMARY are separate documentation state.
</interfaces>
</context>

<decisions>

- D-01: accept only the verified CodeBuddy/Documents repo pair resolving to one canonical git root; reject inherited remote selectors, empty reviewer, protected/sidecar paths, symlink/hard-link aliases, client/path mismatch and unmigrated copies before any write.
- D-02: create exactly `phase116-pen-montegrappa-zero` / `montegrappa-zero` / `Montegrappa Zero`. Before first write, inspect IDs, slugs, canonical/alternate names, aliases, `source_url`, official/reference URL owners, Phase 116 source markers, `entity_redirects` and static route map. Any real owner/collision fails closed; do not guess merge, survivor or redirect.
- D-03: Zero standard is one current pen. IP Palladium, IP Ultra-Black and IP Yellow Gold are finish/trim choices under standard Zero, not separate base models. Zero Custom is a configurator path, while Zero Caduceus, Zero Zodiac, Right To Play and other themed/collaboration pens remain distinct excluded entities; do not create or merge them in this batch.
- D-04: current authority is `https://www.montegrappa.com/en/collections/edizioni-continuative/zero-1176.html`, retrieved `2026-07-21`, plus `https://www.montegrappa.com/en/catalog/`. Qualifying current fields are resin, stainless-steel trims, cartridge/converter, included two cartridges + converter, 143 mm, 14 mm, 32 g, steel/14K gold/14K gold flex and EF/F/M/B/ST1/ST5. Availability/price are mutable snapshots and do not become stable specs.
- D-05: official current engineering language may state that Montegrappa says the CNC-machined stainless-steel ruzzolino clip was stress-tested beyond 20,000 actions. Attribute it to the manufacturer; do not convert it into a durability guarantee or infer service life.
- D-06: official March 2020 launch brochure `https://montegrappa.com.ua/wp-content/uploads/2020/03/zero_eng.pdf` is a separate dated official scope. Its Br8 bronze material/trim description conflicts with the 2026 current stainless-steel listing and must be preserved through rejected current spec evidence plus a structured fact conflict; do not silently overwrite either source or generalize launch material to every current SKU.
- D-07: The Pencilcase Blog, “REVIEW: MONTEGRAPPA ZERO FOUNTAIN PEN”, published `2020-11-09`, `https://www.pencilcaseblog.com/2020/11/review-montegrappa-zero-fountain-pen.html`, is `professional_secondary` for one loaned black/ruthenium sample. Only capped 14.3 cm and 32 g corroborate current official values. 12.9 cm uncapped, section about 10.5 mm, JoWo-made attribution, steel Fine experience, feedback and subjective unposted balance remain dated sample observations and have rejected current-field qualification.
- D-08: Zero summary is 60-160 Unicode characters and body is at least 2,000 Unicode characters. Body must cover verifiable introduction/specs, 2020-to-current material boundary, standard/Custom/theme differences, attributed clip claim, conservative C/C cleaning, Flex-pressure caution and selection order without invented first-person ownership or universal comfort claims.
- D-09: create one 1600x900 unique site-original SVG at the locked Phase 116 path. It may diagram standard-vs-Custom/theme boundaries, C/C/nib options and current-vs-2020 source scopes; it is not a logo, product photo, scale, colour, finish, nib, material or durability proof.
- D-10: Zero has exactly one `made_by -> phase85-brand-montegrappa`; brand has the matching reverse link. Capture Montegrappa non-topology payload and exact pre-topology link set/hash, apply only the target pack/link, assert exactly one reverse delta, then write fact/language/media reviews and call `publishEntity` for the brand's current post-topology hash. Never replay Phase 85/86/87 brand packs.
- D-11: integration uses one top-level migrated setup chained Phase 85 -> 86 -> 87, with fault fixtures derived from caller-owned checkpoints. First apply publishes Zero; pristine second apply is noop with stable hashes/counts. A terminal target missing/wrong source scope, conflict, media, maker/reverse, review hash or public membership fails closed without automatic repair.
- D-12: the real catalog main/WAL/SHM snapshots and the five protected Phase 85-87 entities remain byte/row equivalent except the expected brand topology/hash/review/publication delta inside the owned copy. No production migration occurs.
- D-13: no legacy Zero route is known, so do not modify `src/lib/entity-redirects.ts`. If live preflight finds a legacy owner or route collision, stop and report rather than conditionally adding a sixth product file.
- D-14: preserve all unrelated dirty/untracked content; stop if the index is non-empty. Stage only the five frontmatter product paths, prove cached path equality/no deletions/diff-check, create the exact product commit, and leave PLAN/SUMMARY/docs outside it.
- D-15: do not add packages, migrations, shared runners/helpers, Playwright/readiness infrastructure, search or LLM. Phase 116 is a partial Montegrappa content batch, not completion of Montegrappa, all brands, the production catalog or the full-site goal.

</decisions>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 锁定 Zero identity、dated conflict、brand current-hash 与 owned-copy 回归</name>
  <files>tests/content/phase116-montegrappa-zero.test.ts</files>
  <behavior>
    - Test 1: one top-level setup snapshots the real catalog, creates/migrates one caller-owned copy, applies Phase 85 -> 86 -> 87, and proves the exact public Montegrappa/Elmo/Extra baseline before Phase 116.
    - Test 2: live duplicate inventory covers ID/slug/name/qualified aliases, official current/catalog/brochure/review URL owners, Phase 116 markers, database redirects and static route map; alternate or ambiguous owner fails before first write.
    - Test 3: first apply publishes only the Zero target; Zero is a pen with the locked route, 60-160 summary, 2,000+ body, one unique approved primary SVG and exactly one maker/reverse pair.
    - Test 4: current scope qualifies resin/stainless/C/C/accessories/143 mm/14 mm/32 g/nib options and grades; launch scope retains Br8 bronze and a structured unresolved-or-scoped conflict without qualifying current material.
    - Test 5: review scope stores author/title/date/loaned black-ruthenium sample; only 143 mm and 32 g may corroborate current values, while uncapped/section/JoWo/feedback/balance evidence is rejected for current stable fields.
    - Test 6: standard finishes stay variants; Custom, Caduceus, Zodiac, Right To Play and themed pens create no extra entity/alias/topology and no fields leak into standard Zero.
    - Test 7: exactly one new Montegrappa reverse link changes the brand publication hash; its non-topology payload/source marker remains identical, old review hashes are not reused, and the exact current hash is approved/published through lifecycle APIs.
    - Test 8: wrong repo/root/reviewer/env/path/migration, protected/symlink/hard-link, client mismatch, source ownership/scope qualification/conflict/media/topology/review/publication tamper all fail closed without changing the fault fixture or protected catalog.
    - Test 9: pristine replay returns one noop with identical Zero payload/hash/revision/counts, identical brand post-topology digest and unchanged protected Elmo/Extra entities and real main/WAL/SHM snapshots.
  </behavior>
  <action>
Per D-01 through D-15, write the failing single-file integration regression before implementation. Reuse the verified repo-pair, payload digest, exact target inspection, post-topology brand review/publish and terminal-noop pattern from Phase 115, but keep all helpers local to the Phase 116 test. Establish the existing Montegrappa baseline with the actual Phase 85, 86 and 87 apply functions on the same owned setup; do not fake rows or write the protected catalog.

Inventory entities, entity_aliases, entity_references/source_items, source_url/source markers, entity_redirects and the static route resolver before creation. Protect full entity/story/reference/alias/scope/claim/spec/conflict/media/publication/topology digests for brand and the four existing pens. Assert evidence boundaries through fact_scopes, citations, claim/spec evidence status and fact_conflicts rather than relying only on prose greps.

For fault cases, derive disposable owned copies from a prepared checkpoint and assert that rejected execution does not mutate first-write state or terminal digests. Keep one test declaration/top-level setup so the chain is not repeated; no new generic runner, shared test helper, Playwright, search or LLM path.
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase116-montegrappa-zero.test.ts</automated>
  </verify>
  <done>The failing regression completely defines exact-new identity, current/launch/review evidence, Br8 conflict, one-link topology delta, brand current-hash publication, tamper/noop and protected-copy safety.</done>
</task>

<task type="auto">
  <name>Task 2: 写完整 Zero 标准版中文正文并保持 current/2020/Custom/theme 边界</name>
  <files>.planning/content-research/phase116-montegrappa-zero.md</files>
  <action>
Per D-03 through D-08, create reviewed Markdown with exactly `## summary` and `## body_md`. Keep summary at 60-160 Unicode characters and body at least 2,000 Unicode characters. Open with why “Zero” cannot be treated as every pen sharing the silhouette, then cover the current official standard configuration, finish/nib purchasing sequence, dated launch-material change, C/C maintenance and attributed engineering language in natural Chinese.

Use the 2026-07-21 official current page for resin/stainless/C/C/accessories/dimensions/weight/nib choices and grades. Mark the March 2020 brochure as launch-era and state the Br8 bronze vs current stainless conflict without choosing an unsupported universal answer. Attribute The Pencilcase Blog to its 2020-11-09 loaned black/ruthenium sample; capped length and weight can corroborate, while uncapped length, section estimate, JoWo attribution and writing/balance impressions remain explicitly sample-specific.

Explain that IP Palladium/Ultra-Black/Yellow Gold are standard finish choices, Zero Custom is a configurator route, and Caduceus/Zodiac/Right To Play are separately sourced themed/collaboration products not included here. Include links to `/brand/montegrappa`, `/pen/montegrappa-elmo-01`, `/pen/montegrappa-elmo-02`, `/pen/montegrappa-elmo-02-plus` and `/pen/montegrappa-extra-1930` where editorially useful. Do not invent current price/stock, exact launch-day universality, flex range, personal ownership, service-life claims or dimensions absent from the current official page.
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; test -s .planning/content-research/phase116-montegrappa-zero.md &amp;&amp; rg -q '^## summary$' .planning/content-research/phase116-montegrappa-zero.md &amp;&amp; rg -q '^## body_md$' .planning/content-research/phase116-montegrappa-zero.md &amp;&amp; rg -q 'Br8 bronze|Br8 青铜' .planning/content-research/phase116-montegrappa-zero.md &amp;&amp; rg -q '/brand/montegrappa' .planning/content-research/phase116-montegrappa-zero.md</automated>
  </verify>
  <done>One source-bounded 2k+ Chinese page explains current Zero, dated conflict, sample-only observations, care and buying choices without merging Custom or themed pens.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 构建 Zero pack/SVG，安全安装单一 topology，按 current hash 发布并精确提交五文件</name>
  <files>scripts/data/phase116-montegrappa-zero.ts, scripts/apply-phase116-montegrappa-zero-content.ts, public/images/library/site-original/phase116/montegrappa/montegrappa-zero.svg</files>
  <behavior>
    - Test 1: data module exports locked ID/slug/name, URLs, scope keys, SVG path and a loader returning one publish-intent CuratedEntityPack whose source metadata matches D-04/D-06/D-07.
    - Test 2: the 1600x900 SVG is unique and explicitly non-photo/non-logo/non-scale/non-colour/non-finish/non-material/non-durability proof.
    - Test 3: current spec evidence qualifies only official current fields; launch and review-only values are structured in dated scopes, rejected current evidence and a material/trim conflict.
    - Test 4: apply performs authority/baseline/duplicate/terminal inspection before writes, installs only Zero payload and exact maker topology, then recomputes/reviews/publishes Montegrappa on its post-topology current hash without brand-pack replay.
    - Test 5: exact five-path cached diff and commit isolation succeeds while every unrelated modified/untracked path remains unstaged.
  </behavior>
  <action>
Per D-01 through D-15, implement the data module as one target-only CuratedEntityPack loaded from the reviewed Markdown. Give official current/catalog, official March 2020 brochure, dated professional review and site-original SVG distinct registry/source keys and independence groups. Model current, launch-2020 and review-2020 scopes explicitly; use rejected spec evidence and `fact_conflicts` for Br8 bronze vs current stainless. Keep review narrative core enough for source independence/readiness while rejecting sample-only fields from current spec qualification.

Implement the apply module with Phase 115's verified repo pair and owned DB authority. Require the exact Phase 87 public baseline and preflight all identity/source/route owners. On absent state, create only the Zero identity/publication row and exact maker/reverse topology, apply the cloned target pack through the existing curated-content mechanism, verify the brand non-topology digest and exact one-link delta, then call `recordEntityContentReview` for fact/language/media and `publishEntity` on the Montegrappa brand current hash. On terminal state, validate everything before returning one noop; any partial/tampered terminal state fails closed rather than deleting/reloading/re-reviewing.

Draw one factual SVG showing the source/scope and standard-vs-Custom/theme boundary, not a product likeness. Run targeted TAP to explicit 1/1 PASS, TypeScript, Biome on the three TypeScript files, `xmllint --noout`, and `git diff --check`. Before staging, require an empty index and capture `git status --short`; stage exactly the five frontmatter paths, compare cached names byte-for-byte to the allowlist, reject deletions, run cached diff check, commit exactly `feat(content): publish Montegrappa Zero`, prove the commit path set, and leave all unrelated research/`.next-phase*`/protected quick directories untouched. Do not stage this PLAN or later SUMMARY with the product commit.
  </action>
  <verify>
    <automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase116-montegrappa-zero.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check scripts/data/phase116-montegrappa-zero.ts scripts/apply-phase116-montegrappa-zero-content.ts tests/content/phase116-montegrappa-zero.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase116/montegrappa/montegrappa-zero.svg &amp;&amp; git diff --check</automated>
  </verify>
  <done>Zero is safely published on owned copies with scoped conflict evidence and exact brand topology/current-hash review; targeted checks pass and the product commit contains exactly five owned files.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|---|---|
| external sources -> curated pack | Current official, launch brochure and independent sample claims cross into structured facts with different dates and qualification rights. |
| repo alias -> canonical checkout | Only two verified input strings may resolve to the single canonical git root. |
| caller-owned copy -> protected SQLite catalog | All writes must stay inside a disposable owned root; protected main/WAL/SHM are read-only evidence. |
| topology -> publication lifecycle | A new reverse edge changes the brand hash and invalidates previous review bindings until lifecycle APIs approve the new current hash. |
| dirty worktree -> product commit | Only five owned paths may enter the index/commit; unrelated research and next-phase artifacts belong to others. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-116-01 | Spoofing | repo/database authority | high | mitigate | D-01 realpath + git-root allowlist, PRAGMA binding, inode/path/remote-selector and migration checks before any write. |
| T-116-02 | Tampering | existing identity/source owner | high | mitigate | D-02 live duplicate/source/route preflight and fail-closed collision reporting. |
| T-116-03 | Tampering | dated evidence qualification | high | mitigate | D-04/D-06/D-07 separate scopes, rejected current evidence and structured Br8/stainless conflict assertions. |
| T-116-04 | Repudiation | review/publication binding | high | mitigate | D-10 record all three review kinds and publish through lifecycle APIs on the recomputed post-topology hash. |
| T-116-05 | Information Disclosure | credentials/remote selectors | medium | mitigate | Refuse non-empty remote database environment variables; no credentials are printed or committed. |
| T-116-06 | Denial of Service | repeated migration/test chain | low | accept | One top-level setup and checkpoint-derived fault fixtures bound the targeted regression cost. |
| T-116-07 | Elevation of Privilege | protected catalog or alternate checkout write | critical | mitigate | D-01/D-12 reject protected/sidecar/symlink/hard-link/mismatched-client paths and compare protected snapshots after all cases. |
| T-116-08 | Tampering | git index/commit | high | mitigate | D-14 empty-index gate, exact five-path staging, cached path equality, no-deletion and post-commit path proof. |
| T-116-SC | Tampering | package installs | low | accept | No package-manager install is in scope; existing project dependencies only. |
</threat_model>

<source_audit>

| SOURCE | ID | Feature/Requirement | Task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | Publish source-complete standard current Montegrappa Zero without merging Custom/themed pens | 1-3 | COVERED | Identity, prose, media, evidence conflict, topology, publication, safety and commit isolation are planned. |
| REQ | QUICK-260721-LYS | Phase 116 Montegrappa Zero partial content batch | 1-3 | COVERED | Requirement appears in frontmatter and every task contributes to it. |
| RESEARCH | R-01 | Current official resin/stainless/C/C/143x14 mm/32 g/nib options | 1-3 | COVERED | D-04 exact current scope. |
| RESEARCH | R-02 | Manufacturer 20,000-action clip claim remains attributed | 1-3 | COVERED | D-05 blocks durability extrapolation. |
| RESEARCH | R-03 | Standard finishes vs Custom and themed/collaboration identities | 1-3 | COVERED | D-03 keeps excluded products separate and creates no extra entities. |
| RESEARCH | R-04 | March 2020 brochure Br8 bronze conflicts with current stainless | 1-3 | COVERED | D-06 requires dated scope, rejected qualification and fact conflict. |
| RESEARCH | R-05 | 2020 Pencilcase loaned sample only partially corroborates current specs | 1-3 | COVERED | D-07 locks author/date/sample scope and rejected sample-only fields. |
| RESEARCH | R-06 | Existing Phase 85-87 Montegrappa chain and Phase 115 post-topology publication pattern | 1,3 | COVERED | Baseline/digest/current-hash review are direct local analogs without shared refactor. |
| CONTEXT | D-01 | Verified repo pair and caller-owned DB authority | 1,3 | COVERED | Prewrite gates and protected snapshots. |
| CONTEXT | D-02 | Exact-new identity and duplicate inventory | 1,3 | COVERED | Any owner collision stops. |
| CONTEXT | D-03 | Standard/Custom/theme identity boundary | 1-3 | COVERED | One pen only. |
| CONTEXT | D-04 | Current official fields | 1-3 | COVERED | Structured current qualification. |
| CONTEXT | D-05 | Attributed clip engineering claim | 1-3 | COVERED | No service-life inference. |
| CONTEXT | D-06 | Launch Br8 conflict | 1-3 | COVERED | Conflict remains queryable. |
| CONTEXT | D-07 | Professional sample boundary | 1-3 | COVERED | Only matching capped length/weight corroborate. |
| CONTEXT | D-08 | 2k+ natural Chinese page | 1-3 | COVERED | Content and DB length assertions. |
| CONTEXT | D-09 | Unique factual SVG | 1,3 | COVERED | Media contract and XML check. |
| CONTEXT | D-10 | Exact topology delta and brand post-hash publication | 1,3 | COVERED | No old brand pack replay. |
| CONTEXT | D-11 | Single setup, noop and tamper | 1,3 | COVERED | Caller-owned checkpoint fixtures. |
| CONTEXT | D-12 | Protected existing entities/catalog | 1,3 | COVERED | Full digests and sidecar snapshots. |
| CONTEXT | D-13 | No invented redirect | 1,3 | COVERED | Route collision fails closed. |
| CONTEXT | D-14 | Exact five-file commit isolation | 3 | COVERED | PLAN/SUMMARY separate. |
| CONTEXT | D-15 | No infra/search/LLM expansion; partial batch | 1-3 | COVERED | Scope boundary is explicit. |

Deferred/excluded: Zero Custom configurations, Caduceus, Zodiac, Right To Play and other themed/collaboration entities; production catalog migration; complete Montegrappa/all-brand coverage; generic runner/readiness/Playwright/search/LLM/package/shared-infra changes. These are explicit scope exclusions, not missing items. Source audit has no unplanned item.

</source_audit>

<pre_mortem>

1. **Likely failure: an existing generic `Zero` alias or official URL owner causes a duplicate.** Mitigation: D-02 inventories qualified names, aliases, references, source markers and routes before creation and fails closed with candidates.
2. **Likely failure: 2020 Br8 bronze or JoWo/sample measurements overwrite current official stainless specs.** Mitigation: D-06/D-07 dated scopes, rejected field evidence, explicit conflict rows and structured integration assertions.
3. **Likely failure: brand remains publicly stale after the new reverse edge changes its hash.** Mitigation: D-10 exact link delta, non-topology digest, recomputed current hash, three reviews and publishEntity without old pack replay.
4. **Likely failure: replay repairs a tampered terminal state and hides drift.** Mitigation: D-11 terminal inspection precedes mutation; only pristine terminal returns noop, all partial states fail unchanged.
5. **Likely failure: the product commit captures another agent's research or next-phase files.** Mitigation: D-14 empty-index gate, explicit five-path stage, cached equality/no-deletion proof and post-commit path audit.

Reachability is complete: Phase 85-87 public baseline -> live duplicate/source/route preflight -> one exact Zero identity -> reviewed Markdown + target pack + unique SVG -> one made_by/reverse pair -> Montegrappa expected topology/hash delta -> current-hash reviews + publishEntity -> Zero and brand navigation visible. No artifact depends on a production write, legacy redirect, extra themed entity, package, shared infrastructure or later rollout.

</pre_mortem>

<verification>

1. `node --import tsx --test tests/content/phase116-montegrappa-zero.test.ts` passes as explicit TAP 1/1 on caller-owned copies and protects real main/WAL/SHM.
2. Zero is public at `/pen/montegrappa-zero`, with 60-160 summary, 2,000+ body, one unique approved SVG and exactly one Montegrappa maker/reverse pair.
3. Current official, March 2020 launch and 2020-11-09 professional sample scopes remain structurally distinct; Br8 vs stainless is retained as a conflict and sample-only fields are rejected for current specs.
4. Montegrappa gains exactly one reverse link, retains identical non-topology content/source marker and is reviewed/published on its recomputed post-topology current hash; all four prior pens stay unchanged.
5. First apply publishes, pristine replay returns one noop, and authority/duplicate/source/scope/conflict/media/topology/review/publication tamper cases fail closed.
6. TypeScript, owned-file Biome, SVG XML and diff checks pass; the product commit subject/path set is exact and unrelated dirty/untracked files remain untouched.

</verification>

<success_criteria>

- Standard current Montegrappa Zero is a distinct, source-complete public pen page and brand navigation reaches it.
- Current stainless/C/C/nib specifications, launch Br8 material and 2020 loaned-sample observations remain auditable without cross-scope promotion.
- Brand topology/current-hash lifecycle, existing Montegrappa entities, caller-owned DB safety, tamper/noop and protected catalog checks all pass.
- Exactly five owned product files are committed with no unrelated paths; docs remain separate and Phase 116 is reported as partial.

</success_criteria>

<output>
Create `.planning/quick/260721-lys-phase-116-montegrappa-zero-standard-current/SUMMARY.md` only after the product commit; keep PLAN/SUMMARY/docs outside that product commit.
</output>
