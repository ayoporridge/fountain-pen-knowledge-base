---
phase: quick
plan: 260721-j51
subsystem: content-publication
tags: [wancher, dream-pen, titanium, contract-v3, sqlite, evidence-scope]
requires:
  - phase-104 Dream Pen series-navigation article and route reclassification
  - phase-107 published Wancher brand and True Ebonite SKU
  - migration 032 topology-aware publication contract
provides:
  - canonical Wancher Dream Pen Titanium Black sourced content pack
  - current-listing and 2024 reviewed-sample scope separation
  - phase-local caller-owned apply with Wancher post-topology republish
  - exact duplicate, authority, tamper and noop integration regression
affects:
  - Wancher public reverse model navigation
  - future Dream Pen SKU batches
tech-stack:
  added: []
  patterns:
    - caller-owned checkpoint-copy integration verification
    - exact article-reference allowlist with pen-owner fail-closed duplicate detection
    - post-topology current-hash review and publish without brand-pack replay
key-files:
  created:
    - .planning/content-research/wancher-dream-pen-titanium-black-phase112.md
    - scripts/data/phase112-wancher-dream-pen-titanium-black.ts
    - scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts
    - tests/content/phase112-wancher-dream-pen-titanium-black.test.ts
    - public/images/library/site-original/phase112/wancher/wancher-dream-pen-titanium-black.svg
  modified: []
key-decisions:
  - "Phase 104 article 对 official Titanium URL 的引用是 allowlisted 系列证据；只有 pen ownership 才构成产品 collision。"
  - "数据库 conflict 枚举以 resolved 表示编辑处理已由 non-merging 与 scope separation 完成；配置 revision chronology 仍明确 unknown。"
  - "Wancher brand 只在新增 exact link pair 后按 current hash 重审并调用 publishEntity，不加载或 replay Phase 107 brand pack。"
patterns-established:
  - "一个 exact SKU 的首次发布顺序为 authority/baseline/duplicate preflight -> topology -> brand current-hash publish -> target-owned payload -> target current-hash publish。"
requirements-completed: [QUICK-260721-J51]
duration: 26 min
completed: 2026-07-21
status: complete
---

# Phase 112: Wancher Dream Pen Titanium Black Summary

Wancher Dream Pen Titanium Black 以唯一 canonical pen 发布：current JoWo steel listing 与 2024 affiliate-disclosed apparent titanium-nib sample 被保留为分离 scope，Wancher 则在新增 topology 后按 contract-v3 current hash 恢复公开。

## Performance

- **Duration:** 26 min
- **Started:** 2026-07-21T05:52:44Z
- **Completed:** 2026-07-21T06:18:46Z
- **Tasks:** 3
- **Files:** 5 product files
- **Product commit:** `12c619b`

## Accomplishments

- 新建稳定 identity `phase112-wancher-dream-pen-titanium-black`、slug `wancher-dream-pen-titanium-black` 与 canonical name `Wancher Dream Pen Titanium Black`；只通过一对 `made_by`／`reverse` 连接既有 Wancher `eOfD77nOeENN`。
- 写成 4,768 字符 reviewed Markdown，正文链接 `/article/wancher-dream-pen`，同时保持 Phase 104 article 的 entity、story、source/reference、media、taxonomy、route 与 topology 不变。
- current official scope 只承载 titanium、black PVD、European International cartridge/converter、#6 JoWo matte-black steel nib、feed options 和 2026-07-21 sold-out snapshot；价格、库存数量与未来可售性未进入稳定 spec。
- kamitopen 2024 scope 单独承载 154 mm、66.4 g、不后插、偏重、个人写感与 affiliate disclosure；apparent original titanium nib 不被补猜为 current option。
- 新增独立构图的本站原创双 scope SVG，明确非产品照片、非比例、非颜色/PVD 表面或商标复刻。
- 首次 apply 只发布一个 target；pristine replay 返回 exact noop；authority、alternate pen collision 与 topology tamper 均 fail closed。

## Source and Scope Record

### Current official listing

- URL: `https://www.wancherpen.com/products/dream-pen-titanium-black`
- Retrieved: `2026-07-21`
- Locator: exact product title and current specifications/options covering titanium body, black PVD, European International cartridge/converter, #6 JoWo matte-black stainless-steel nib, feed choices and sold-out state.
- Boundary: live source is honestly marked `live-source-not-frozen`; price, inventory quantity and future availability are mutable.

### 2024 reviewed sample

- URL: `https://kamitopen.jp/fountain-pen/wancher-dream-pen-titan-fountain-pen/`
- Date/scope: 2024 reviewed sample.
- Locator: 154 mm, 66.4 g, non-posting, author weight/writing impressions, apparent original titanium-nib description and retained affiliate disclosure.
- Boundary: measurements and subjective experience describe that sample only and do not populate current model specs.

## Identity and Duplicate Handling

Phase 104 already stores the official Titanium URL as a source reference owned by article `2aoD07lwSYCV`. Phase 112 explicitly requires and preserves that reference as series-navigation evidence. It is not treated as an existing product donor.

Preflight rejects any alternate `pen` owner of the URL, exact name/slug/alias collision, target stable-ID collision or Phase 112 source-marker ownership by another entity before the first write. Replay accepts only the locked target with its exact source marker and terminal contract state; it never merges, redirects, retires or repairs an alternate identity.

## Temporal Nib Conflict

`fact_conflicts.status` follows the existing schema enum and is `resolved` because the editorial conflict is handled by non-merging and strict scope separation. The resolution does not claim a historical answer: current JoWo steel and the 2024 apparent titanium-nib sample are both retained, configuration chronology remains unknown, and no current titanium-nib option or exact revision date is inferred.

## Wancher Post-Topology Publication

Before topology, the apply records Wancher non-topology payload/source marker, Phase 104 article payload and Phase 107 True Ebonite payload/topology. It then adds only the exact Titanium Black link pair and verifies:

- Wancher non-topology payload and Phase 107 source marker are unchanged.
- Wancher contract hash changes from the exact topology addition.
- Phase 104 article and Phase 107 True Ebonite digests remain unchanged.
- fact/language/media approvals bind the post-topology current hash.
- `publishEntity` restores Wancher publication; the Phase 107 brand pack is never loaded or replayed.

## Database and Repository Authority

- Repo authority accepts only `/Users/xz/CodeBuddy/fountain-pen-graph` and `/Users/xz/Documents/fountain-pen-graph`; both `realpath` and `git rev-parse --show-toplevel` must resolve to the Documents canonical root.
- Database authority independently rejects remote selectors, blank reviewer, outside-owned-root paths, protected main/WAL/SHM paths, symlink/hard-link aliases, client/path mismatch and copies not migrated through 032.
- Tests use `copyCheckpointedCatalogToDisposableCopy`; all Phase 104, Phase 107, Phase 112, replay and tamper writes occur on caller-owned temporary copies.
- `finally` checks prove the real `data/fpkg.db` main/WAL/SHM snapshot remains unchanged.

## Verification

- `node --import tsx --test tests/content/phase112-wancher-dream-pen-titanium-black.test.ts` — PASS, TAP 1/1, 0 failed, 0 skipped.
- `pnpm exec tsc --noEmit --pretty false` — PASS.
- `pnpm exec biome check scripts/data/phase112-wancher-dream-pen-titanium-black.ts scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts tests/content/phase112-wancher-dream-pen-titanium-black.test.ts` — PASS.
- `xmllint --noout public/images/library/site-original/phase112/wancher/wancher-dream-pen-titanium-black.svg` — PASS.
- Five-path `git diff --check` and cached diff check — PASS.
- `git show --name-only --format= 12c619b` — exactly the five planned product paths; PLAN, SUMMARY and unrelated worktree files are absent.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Accepted migration-generated reverse link without duplicate insertion**

- **Found during:** Task 3 integration GREEN.
- **Issue:** Migration 032 creates the reverse topology row when the exact `made_by` relation is inserted; an additional plain reverse insert hit the unique `(source_id,target_id,link_type)` constraint.
- **Fix:** The explicit reverse step uses `INSERT OR IGNORE`, followed by an exact two-row terminal topology assertion. No duplicate or ambiguous topology is accepted.
- **Files modified:** `scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts`
- **Verification:** Targeted integration test PASS.
- **Commit:** `12c619b`

**2. [Rule 3 - Blocking] Added phase-local target installer to preserve no-replay contract**

- **Found during:** Task 3 integration GREEN.
- **Issue:** The shared Phase 22 installer requires a pack set containing one brand plus at least one pen; using it for target-only payload would require replaying the Phase 107 Wancher brand pack.
- **Fix:** Added a phase-local target-owned installer mirroring existing contract-v3 rows while leaving shared infra untouched. Brand recovery remains review/publish-only on its post-topology current hash.
- **Files modified:** `scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts`
- **Verification:** Wancher non-topology digest/source marker unchanged and integration test PASS.
- **Commit:** `12c619b`

**3. [Rule 1 - Schema alignment] Represented the open chronology through scoped resolution semantics**

- **Found during:** Task 2 TypeScript verification.
- **Issue:** `CuratedConflict.status` only supports `resolved | dismissed`; the planned literal `unresolved` is not a valid contract-v3 value.
- **Fix:** Used `resolved` solely for the editorial act of non-merging/scope separation, with `resolution_note` explicitly stating chronology remains unknown and no revision/current titanium option is inferred.
- **Files modified:** `scripts/data/phase112-wancher-dream-pen-titanium-black.ts`, `tests/content/phase112-wancher-dream-pen-titanium-black.test.ts`
- **Verification:** `tsc`, structured conflict assertions and integration test PASS.
- **Commit:** `12c619b`

**Total deviations:** 3 auto-fixed (2 blocking issues, 1 schema-alignment bug). **Impact:** All fixes preserve the planned trust boundaries; no scope expansion, shared-infra change, package install or protected-catalog write occurred.

## Authentication Gates

None.

## Known Stubs

None. No TODO/FIXME/placeholder/coming-soon content exists in the five product files, and the primary media is wired to the checked-in SVG.

## Threat Flags

None beyond the plan threat model. The new local database apply surface, repository alias validation, external-source boundaries and exact Git staging are all covered by T-112-01 through T-112-10.

## Partial-Batch Boundary

This completion covers only Wancher Dream Pen Titanium Black. It does not mean the remaining Wancher/Dream Pen catalog, Phase 23 content work, production migration, full-site acceptance or the overall milestone is complete. No production rollout was performed.

## Self-Check: PASSED

- All five planned product files exist.
- Product commit `12c619b` exists and contains exactly those five paths.
- SUMMARY exists at the planned quick-task path and remains uncommitted as requested.
- Real catalog snapshot protection, current-hash publication, exact noop and tamper failure are covered by the passing integration test.
