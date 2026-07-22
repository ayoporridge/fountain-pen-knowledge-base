---
phase: quick
plan: 260722-bxs
subsystem: content-publication
tags: [platinum, president, ptb-20000p, same-id, sqlite, curated-content]
requires:
  - phase: quick-260719-4a2
    provides: locked Platinum brand and #3776 Century publication
  - phase: phase78
    provides: same-ID canonical route and permanent redirect pattern
  - phase: quick-260722-ba3
    provides: locked Platinum Procyon prerequisite and caller-owned publication pattern
provides:
  - same-ID canonical Platinum President PTB-20000P publication pack
  - exact current three with document/history/inspection/adjusted-sample boundaries
  - old-route permanent redirect with preserved legacy aliases and maker topology
  - caller-owned first/noop/tamper regression protecting the real catalog
affects: [full-corpus-content-goal, platinum-navigation, phase23-content]
tech-stack:
  added: []
  patterns:
    - exact raw-or-terminal same-ID reclassification
    - target-only current-hash review and publication
key-files:
  created:
    - .planning/content-research/platinum-president-ptb-20000p-phase122.md
    - scripts/data/phase122-platinum-president-ptb-20000p.ts
    - scripts/apply-phase122-platinum-president-ptb-20000p-content.ts
    - tests/content/phase122-platinum-president-ptb-20000p.test.ts
    - public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg
  modified: []
key-decisions:
  - "Keep a1t4DNomp4Ge as the sole President identity and preserve both original relationship rows byte-for-byte."
  - "Treat product, brand navigation, dated catalog, PenHero inspection, and Lensky adjusted sample as non-joinable evidence scopes."
  - "Represent the same-ID rename with a taxonomy action and permanent redirect because migration 032 rejects self-lineage rows."
patterns-established:
  - "Raw/terminal dichotomy: every hybrid identity, owner, route, scope, media, review, or publication state fails closed."
  - "Protected Platinum topology and sibling entities are compared before and after target-only publication."
requirements-completed:
  - QUICK-260722-BXS
coverage:
  - id: D1
    description: "Reclassify and publish the existing President ID as Platinum President PTB-20000P with preserved old names, route, and topology."
    requirement: QUICK-260722-BXS
    verification:
      - kind: integration
        ref: "tests/content/phase122-platinum-president-ptb-20000p.test.ts#Phase 122 reclassifies the same President ID with exact evidence boundaries and protected topology"
        status: pass
    human_judgment: false
  - id: D2
    description: "Ship exact current-three evidence plus isolated brand, catalog, PenHero, Lensky, rejected-sibling, and factual-SVG boundaries."
    requirement: QUICK-260722-BXS
    verification:
      - kind: integration
        ref: "tests/content/phase122-platinum-president-ptb-20000p.test.ts#structured source/scope/spec/media assertions"
        status: pass
      - kind: other
        ref: "xmllint --noout public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg"
        status: pass
    human_judgment: false
duration: 20min
completed: 2026-07-22
status: complete
---

# Quick 260722-bxs: Platinum President PTB-20000P Summary

**既有 `a1t4DNomp4Ge` 原位成为唯一 Platinum President PTB-20000P，保留旧名称、旧路由与 maker rows，并以五类不可跨接证据完成 target-only 发布。**

## Batch Status

本轮 Phase 122 只是 active full-corpus goal 中的 **partial batch**。President PTB-20000P 本批交付已完成，但 **full corpus goal remains active**；其它 Platinum 条目、生产 rollout、full-site acceptance 与全量内容清账均未在本轮完成。

## Performance

- **Duration:** 20 min
- **Started:** 2026-07-22T00:42:38Z
- **Completed:** 2026-07-22T01:02:35Z
- **Tasks:** 3
- **Product files:** 5
- **Product commit:** `3f71b380c4bfc16253e6bbf612268c3176f2640a`

## Accomplishments

- 同一 ID `a1t4DNomp4Ge` 从 raw `白金 Platinum 总统 President` 原位 canonicalize 为 `Platinum President PTB-20000P`／`platinum-president-ptb-20000p`，未创建第二个 President。
- 保留原 aliases `Platinum President`、`白金 总统 President`，新增旧 exact canonical name alias；旧 `/pen/白金-platinum-总统-president` 以 DB permanent redirect 指向 `/pen/platinum-president-ptb-20000p`。
- current variants 精确为 `#1 Black`、`#10 Wine Red`、`#59 Blue`；官网稳定规格、brand two-card view、dated catalog、PenHero history/inspection 与 Lensky adjusted sample 均有独立 citation-locator-scope chain。
- 单一 caller-owned setup 证明 exact raw first apply、pristine noop，以及 authority、source owner、redirect、source marker、alias、media、review、variant 与 partial terminal tamper fail closed。

## Sources, Dates, and Evidence Boundaries

- exact product page `https://www.platinum-pen.co.jp/products/fountain-pen/2158/`，retrieved 2026-07-22：只支撑 current #1/#10/#59、¥74,800 snapshot、18K（18-21）双色局部镀铑尖、UEF/EF/F/M/B/C、AS 树脂、142 × 16 mm、21 g、Converter-800A 与蓝黑墨囊。
- President brand page `https://www.platinum-pen.co.jp/brands/president/`，retrieved 2026-07-22：只支撑 line positioning、long 18K nib、rearward balance、PTB-20000P Black/Wine Red 与 separate PTB-25000PR Black；two-card view 不否定 product-page Blue。
- 2019–2020 official catalog：只作 dated three-colour/spec history，不证明 2026 availability。
- Jim Mamoulides／PenHero，published 2025-10-31：保留 1994 revival、历史颜色与 USA boundary 的 uncertainty；loaned pens 未书写，观察只属 collection/inspection。
- Andrew Lensky，published 2023-03：只描述一支调整后的 Red Wine 18K sample；页面 EF/UEF 标识冲突原样保留，143/123/13.4/11 mm、21.6 g dry、1.25 turns 及 writing/flow 均不泛化。
- PTB-25000PR、Kaga Maki-e/ballpoints、PTB-28000P、PTW-15000P 与历史 colour editions 均以 `qualifies:false` 保存，不成为 target variant、alias、spec 或 entity。

## Identity, Topology, and Publication Audit

- 原 `made_by` row：`CQFuH9Ba8VV6`，`a1t4DNomp4Ge → e51tJpejEkXY`，reason 仍为 `null`。
- 原 `reverse` row：`rev-CQFuH9Ba8VV6`，`e51tJpejEkXY → a1t4DNomp4Ge`，reason 仍为 `null`。
- identity transaction 不删除、不插入、不重建上述 rows；Platinum reverse set 与 brand hash/publication未改变。
- target 的 fact/language/media 只经 `recordEntityContentReview`，publication 只经 `publishEntity`，四项 approvals 均绑定 target current hash；未 review/publish Platinum brand，未 replay Phase42/78/121 packs。
- Platinum `e51tJpejEkXY`、#3776 Century `ekPMWnot9inz`、Curidas `BoZ4C2WSqk0K`、Procyon `phase121-platinum-procyon-pns-5000` full payload/topology/publication digests前后完全相等。

## Protected Catalog and Safety

- migration、Phase42/78/121 prerequisites、Phase122 first/noop/tamper、reviews、publish 与所有查询写入只发生在一个 caller-owned checkpoint copy。
- targeted regression 在首个 DB client 前快照真实 `data/fpkg.db` main/WAL/SHM，并在 finally 再比较；三者 byte-for-byte 不变。
- 最终只显式 stage 五个 frontmatter product paths；ignored data file 仅用 exact `git add -f scripts/data/phase122-platinum-president-ptb-20000p.ts`。
- cached path allowlist、`git diff --cached --check`、no-deletion、commit subject 与 post-commit five-path proof均通过；unrelated dirty/untracked 与 PLAN均未进入产品提交。

## Verification

- `node --import tsx --test tests/content/phase122-platinum-president-ptb-20000p.test.ts` — PASS（single setup，72.8s final run）
- `pnpm exec tsc --noEmit --pretty false` — PASS
- `pnpm exec biome check scripts/data/phase122-platinum-president-ptb-20000p.ts scripts/apply-phase122-platinum-president-ptb-20000p-content.ts tests/content/phase122-platinum-president-ptb-20000p.test.ts` — PASS
- `xmllint --noout public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg` — PASS
- five-path `git diff --check` — PASS
- product commit subject/path set、cached diff/no-deletion 与 post-commit path proof — PASS

## Task Commit

1. **Tasks 1–3: same-ID President regression, evidence pack, guarded apply, and factual SVG** — `3f71b38` (`feat(content): reclassify Platinum President PTB-20000P`)

The product commit contains exactly:

- `.planning/content-research/platinum-president-ptb-20000p-phase122.md`
- `public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg`
- `scripts/apply-phase122-platinum-president-ptb-20000p-content.ts`
- `scripts/data/phase122-platinum-president-ptb-20000p.ts`
- `tests/content/phase122-platinum-president-ptb-20000p.test.ts`

PLAN、后置 SUMMARY 与 unrelated dirty/untracked paths 均未进入产品 commit。

## Decisions Made

- official product page 是 current exact set 与稳定规格的唯一 qualifying current source；brand cards 与 catalog 均不覆盖它。
- PenHero uncertainty/no-writing 与 Lensky adjusted EF/UEF sample 被结构化限制，拒绝 cross-model 和 line-wide generalization。
- same-ID rename 保留原 relationship row IDs/reasons；只审 target current hash，brand 与三份 prerequisite pack不重放。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Schema correctness] 用 taxonomy action 代替非法 self-lineage row**

- **Found during:** Task 3 integration regression
- **Issue:** Migration 032 对 `entity_lineage` 强制 `source_entity_id != target_entity_id`；计划中的 same-ID self-lineage insert 会触发 CHECK constraint，并且创建第二实体会违反核心身份约束。
- **Fix:** 保留 `taxonomy_batches` + same-ID `taxonomy_actions` 审计记录，并由 permanent `entity_redirects` 保存旧入口；不插入非法 self-lineage，也不创建 donor/duplicate entity。
- **Files modified:** `scripts/apply-phase122-platinum-president-ptb-20000p-content.ts`
- **Verification:** targeted regression first/noop/route/unique-ID assertions通过。
- **Committed in:** `3f71b38`

**2. [Rule 1 - Expected shared source ownership] 允许 protected Procyon 共用官方 catalog document**

- **Found during:** Task 3 first-write source-owner gate
- **Issue:** Procyon prerequisite已合法引用相同 Platinum 2019–2020 official catalog；把它当 third-party collision 会错误拒绝 locked baseline。
- **Fix:** 仅白名单四个 protected prerequisite IDs的既有共享官方 document ownership；任意其它 entity owner仍 fail closed，且有显式 tamper regression。
- **Files modified:** `scripts/apply-phase122-platinum-president-ptb-20000p-content.ts`, `tests/content/phase122-platinum-president-ptb-20000p.test.ts`
- **Verification:** protected Procyon baseline通过，伪造 third owner 被拒绝且 owned digest不变。
- **Committed in:** `3f71b38`

---

**Total deviations:** 2 auto-fixed（2 Rule 1 correctness fixes）。
**Impact on plan:** 保持 same-ID、protected prerequisites与fail-closed目标，无 scope expansion。

## Issues Encountered

- 增强 tamper fixture 初次使用了 schema 不允许的 media `usage_status='secondary'`；改为合法的非 primary 状态 `candidate` 后，验证正确覆盖 media tamper 并通过。

## Known Stubs

None.

## User Setup Required

None - 无 dependency、schema、环境变量、远程服务或生产数据库操作。

## Next Phase Readiness

Platinum President PTB-20000P 可供后续 Platinum navigation 与 full-corpus content batches 使用。本轮没有更新 STATE.md／ROADMAP.md，也没有执行生产迁移或 full-site acceptance；active full-corpus goal 继续进行。

## Self-Check: PASSED

- 五个 product files 均存在。
- commit `3f71b380c4bfc16253e6bbf612268c3176f2640a` 存在，subject 与 five-path set 精确且无删除。
- SUMMARY 只在产品 commit 后创建，并保持未提交；PLAN同样未提交。
- STATE.md、ROADMAP.md、真实 `data/fpkg.db` main/WAL/SHM 与 unrelated worktree均未修改。
