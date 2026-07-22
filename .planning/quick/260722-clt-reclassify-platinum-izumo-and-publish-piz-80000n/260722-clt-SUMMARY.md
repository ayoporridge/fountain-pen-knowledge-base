---
phase: 123-platinum-izumo-family-and-piz-80000n
plan: 01
subsystem: content-publication
tags: [platinum, izumo, taxonomy, sqlite, publication-v3, evidence-boundaries]
requires:
  - phase: 42-78-121-122
    provides: published Platinum brand, #3776 Century, Curidas, Procyon PNS-5000, and President PTB-20000P prerequisites
provides:
  - Same-ID reviewed/published Platinum Izumo family article with legacy route continuity
  - Exact reviewed/published PIZ-80000N pen with #91/#92 variants
  - Remove-one/add-one Platinum maker topology and post-topology current-hash republication
affects: [platinum-navigation, phase-23-content-batches, full-corpus-publication]
tech-stack:
  added: []
  patterns: [single caller-owned checkpoint, exact raw-or-terminal apply, static pen-to-article reclassification redirect]
key-files:
  created:
    - .planning/content-research/platinum-izumo-family-phase123.md
    - .planning/content-research/platinum-izumo-piz-80000n-phase123.md
    - scripts/data/phase123-platinum-izumo-piz-80000n.ts
    - scripts/apply-phase123-platinum-izumo-piz-80000n-content.ts
    - tests/content/phase123-platinum-izumo-piz-80000n.test.ts
    - public/images/library/site-original/phase123/platinum/platinum-izumo-family.svg
    - public/images/library/site-original/phase123/platinum/platinum-izumo-piz-80000n.svg
  modified:
    - src/lib/entity-redirects.ts
key-decisions:
  - "Keep OOumUrtFoAqu as the sole generic Izumo identity, reclassified from pen to article, and create exactly one new PIZ-80000N pen."
  - "Use the existing static reclassified-article route map because migration-032 intentionally constrains database permanent redirects to /brand and /pen targets."
  - "Treat the 11 lineup labels as a retrieved navigation snapshot and keep catalog, maintenance, Leigh, and FPN evidence in non-crossable scopes."
patterns-established:
  - "Family-to-SKU split: navigation article has no maker/spec/variant payload; exact pen owns product facts and maker topology."
  - "Topology changes republish the unchanged brand payload only at its post-topology current hash via review APIs."
requirements-completed: [QUICK-260722-CLT]
coverage:
  - id: D1
    description: "Same-ID Izumo family article, exact PIZ pen, route continuity, evidence scopes, topology replacement, publication, noop/tamper, and catalog safety"
    requirement: QUICK-260722-CLT
    verification:
      - kind: integration
        ref: "tests/content/phase123-platinum-izumo-piz-80000n.test.ts"
        status: pass
      - kind: other
        ref: "pnpm exec tsc --noEmit --pretty false; Biome; xmllint; exact commit path proof"
        status: pass
    human_judgment: false
duration: 39min
completed: 2026-07-22
status: complete
---

# Phase 123 Plan 01: Platinum Izumo family and PIZ-80000N Summary

**Platinum Izumo 以原 ID 成为 11-family 系列导航文章，PIZ-80000N 作为唯一具体钢笔发布，并以 post-topology current hash 重审 Platinum 品牌。**

## Performance

- **Duration:** 39 min
- **Started:** 2026-07-22T01:13:24Z
- **Completed:** 2026-07-22T01:36:10Z
- **Tasks:** 3
- **Files modified:** 8 product files；本 SUMMARY 后置且未提交

## Accomplishments

- `OOumUrtFoAqu` 原位从 raw pen 重分类为 `Platinum Izumo 系列` article；保留三个旧名称 aliases，并由既有 `RECLASSIFIED_ARTICLE_PATHS` 将 `/pen/白金-platinum-出云-izumo` 永久导向 `/article/platinum-izumo`。
- 新建唯一 `phase123-platinum-izumo-piz-80000n` pen，current variants 精确为 `#91 Ginsen Yakumo` 与 `#92 Togi Yakumo`；#92 的 togidashi/polished 边界不外溢到 #91。
- 在一个 identity/payload/topology transaction 中删除 legacy `tvedLyJyl6UZ`／`rev-tvedLyJyl6UZ`，新增 deterministic PIZ made_by/reverse pair；article 不保留 maker、model spec 或 model variant。
- Platinum non-topology payload 未改变；brand、article、pen 分别通过 `recordEntityContentReview` 与 `publishEntity` 在各自 post-write current hash 获得四类 approved reviews 和 public membership，没有 replay brand pack 或直接写 lifecycle tables。

## Task Commit

1. **Tasks 1–3: integration contract, reviewed copy, atomic reclassification/publication** — `1c462cc3f1c7ecbc2ca1cf6b4f0de2da571c6196` (`feat`)

产品 commit subject 精确为 `feat(content): reclassify Platinum Izumo and publish PIZ-80000N`，且 commit path set 精确等于 PLAN frontmatter 的 8 个产品文件，无删除。PLAN 与本 SUMMARY 均不在产品 commit 内。

## Identity, Navigation, and Topology

- Article：`OOumUrtFoAqu` / `article` / `platinum-izumo` / `Platinum Izumo 系列`。
- Pen：`phase123-platinum-izumo-piz-80000n` / `pen` / `platinum-izumo-piz-80000n` / `Platinum Izumo PIZ-80000N 八云涂`。
- Static legacy route：`pen/白金-platinum-出云-izumo` → `/article/platinum-izumo`。
- Article aliases：`Platinum Izumo`、`白金 出云 Izumo`、`白金 Platinum Izumo 出云`。
- Topology delta：Platinum reverse target 仅从 donor article 替换为 PIZ pen；其余 reverse set 与 brand non-topology digest 不变。
- Exact new link IDs：`phase123-platinum-izumo-piz-80000n-made-by` 与 migration-004 deterministic reverse `rev-phase123-platinum-izumo-piz-80000n-made-by`。

## Navigation and Evidence Boundaries

- Family source locator：Platinum `IZUMO'S LINEUP` heading 与逐卡 label；重复图片卡去重后精确 11 项。2025 Precious Wood news 只保留为 dated sibling announcement。
- 11 个 sibling labels 仅在 article navigation scope 中出现，不创建额外 entity、variant、spec 或 graph link。
- JP product locator：breadcrumb/code、¥165,000 snapshot、description，以及 `ペン先／ペン種／仕様／サイズ／付属品／化粧箱` 与 #91/#92 table。
- EN product locator：descriptive paragraph、`Nib／Base Material／Surface Finish／Size／Weight` 与 #91/#92 table。JP/EN document items同属 `platinum-official` independence group，不双算独立性。
- 2019–2020 catalog：printed page 14、Izumo/PIZ-80000N table 与 row/column labels；只作 dated corroboration。
- Izumo manual：printed page 1、long-term-use heading、约三个月拆下 cartridge/converter、用水或温水冲洗 nib、使用 Platinum replacement products；不扩写耐久或一般漆面护理。
- Leigh Reyes（2013-06-25）：older ambiguous Yakumonuri sample，section threads、President engraving、Fine/reliability/appearance 均 sample-only，不猜 #91/#92。
- FPN columela（2017-08-05）：community/user-generated exact Ginsen sample，M、cartridge/converter、large size 与个人 feel/line；不构成 professional publication core。
- Retailer/customer reviews 没有进入 pack，也不参与 readiness。

## Publication Audit Hashes

single-checkpoint integration run 输出并验证：

- Article：`sha256:v3:f361809e925b4240ba95d03ec5872993f801bf98003f15eadf6a79f6f2697ddc`
- Pen：`sha256:v3:9b2da3411fec73056c0eecfdf765c11d061300cf56210efef97356df46b10015`
- Platinum brand post-topology：`sha256:v3:5487536b123cbec8ac0aa201773490cdacc3583a548e73bb1b3eed412f503624`

这些 hash 属于同一 migrated caller-owned checkpoint 的 locked prerequisite state。测试同时证明 brand pre/post hash 不同、旧 hash reviews 不授权新 topology hash，且 pristine replay 精确返回 article/pen 两个 noop。

## Verification

- `node --import tsx --test tests/content/phase123-platinum-izumo-piz-80000n.test.ts` — PASS；单一 top-level `copyCheckpointedCatalogToDisposableCopy`，Phase42 → Phase78 → Phase121 → Phase122 prerequisites，first/noop/tamper/authority/protected regression 全通过。
- `pnpm exec tsc --noEmit --pretty false` — PASS。
- `pnpm exec biome check ...`（owned TypeScript + route map）— PASS。
- `xmllint --noout`（两张 1600×900 site-original SVG）— PASS；两图 hash 不同。
- 8-path `git diff --check`、cached exact path set、no-deletion、post-commit subject/path proof — PASS。
- 真实 `data/fpkg.db` triplet 前后精确一致：main `24723456/1784118828/46507656/1`，WAL `0/1784431646/71055243/1`，SHM `32768/1784682449/71055244/1`（size/mtime/inode/nlink）。

## Protected Entities

integration digest 证明以下已发布 prerequisite 的 identity、content、topology、reviews 与 publication 未被 Phase123 改写：

- Platinum #3776 Century `ekPMWnot9inz`
- Curidas `BoZ4C2WSqk0K`
- Procyon PNS-5000 `phase121-platinum-procyon-pns-5000`
- President PTB-20000P `a1t4DNomp4Ge`

Platinum brand仅 topology hash 改变；non-topology payload digest 保持一致。

## Decisions Made

- 同 ID 保留 generic Izumo 的历史连续性，只创建一个证据完备的 exact PIZ pen。
- 采用现有 static reclassified-article route mapping，而不是向 migration-032 的 `/brand/*|/pen/*` DB redirect constraint 写入非法 `/article/*` target，也不扩建 schema/migration。
- Official current、dated catalog、model maintenance、ambiguous professional sample 与 community exact sample 均使用独立 source item、locator 和 fact scope；不以正文关键词代替 evidence chain。

## Deviations from Original Plan

### Auto-fixed Issues

**1. [Rule 1 - Schema correctness] 将 article redirect 从 DB row 调整为既有静态 reclassification mapping**

- **Found during:** Task 3 first integration write
- **Issue:** migration-032 的 `entity_redirects` CHECK 只允许 permanent target `/brand/*` 或 `/pen/*`；原计划的 `/article/platinum-izumo` DB target 会被 schema 正确拒绝。
- **Fix:** 不绕过 CHECK、不修改 schema/migration；在现有 `src/lib/entity-redirects.ts` 增加单条 surgical mapping，并由 integration test 直接断言 `getReclassifiedArticlePath`。PLAN 已同步为 8 个产品文件。
- **Verification:** route resolver assertion、target regression、TypeScript、Biome 与 exact 8-path commit proof 通过。
- **Committed in:** `1c462cc`

**2. [Rule 1 - Deterministic reverse identity] 使用 migration-004 自动生成的 exact reverse ID**

- **Found during:** Task 3 topology transaction
- **Issue:** 插入 made_by 会由既有 trigger 自动生成 `rev-${madeById}`；再插入第二个 reverse 会违反唯一 topology constraint。
- **Fix:** 导出并锁定 trigger-compatible deterministic reverse ID `rev-phase123-platinum-izumo-piz-80000n-made-by`，只插入 made_by，仍在同一 transaction 获得 exact pair。
- **Verification:** integration test 对两个 link IDs、方向、类型和 remove-one/add-one brand reverse delta 作精确断言。
- **Committed in:** `1c462cc`

---

**Total deviations:** 2 auto-fixed Rule 1 correctness adjustments。
**Impact on plan:** 保持 same-ID article、旧路由可达、exact topology 与 8-file surgical scope；没有绕过数据库约束或扩建 shared infrastructure。

## Issues Encountered

- 手写 phase-local installer 的 source/citation placeholder 数量与 community reliability enum 在首轮 GREEN 中被 SQLite constraint 捕获；按现有 Phase121/122 schema contract 修正后，完整 regression 连续通过。

## Known Stubs

None.

## User Setup Required

None - 无新增 package、schema、migration、环境变量、远程服务或 production catalog 操作。

## Next Phase Readiness

Phase123 只是 Platinum/full-corpus 的一个 partial batch。Izumo family 与 PIZ-80000N 已可供后续 Platinum navigation 和内容批次引用；未执行 production catalog mutation/deploy/full-site acceptance，full-corpus goal remains active。

本批明确不更新 `.planning/STATE.md` 或 `.planning/ROADMAP.md`。

## Self-Check: PASSED

- 8 个 product files 与本 prefixed SUMMARY 均存在。
- commit `1c462cc3f1c7ecbc2ca1cf6b4f0de2da571c6196` 存在，subject/path set 精确且无删除。
- SUMMARY 只在最终产品 commit 后创建，并保持未提交；PLAN 同样不在产品 commit 内。
- 真实 catalog main/WAL/SHM 与 unrelated dirty/untracked worktree 均未修改。

---
*Phase: 123-platinum-izumo-family-and-piz-80000n*
*Completed: 2026-07-22*
