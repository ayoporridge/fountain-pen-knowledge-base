---
phase: quick
plan: 260721-fxu
subsystem: content-publication
tags: [wancher, dream-pen, ebonite, contract-v3, sqlite, evidence-scope]
requires:
  - phase: 104
    provides: Wancher Dream Pen series-navigation article and legacy route reclassification
provides:
  - Contract-v3 Wancher companion brand content
  - Canonical Wancher Dream Pen True Ebonite Matte Black pen page
  - Current-listing and 2018 supplied-sample evidence separation
affects: [phase-23-content, wancher, dream-pen-navigation]
tech-stack:
  added: []
  patterns: [caller-owned checkpoint publication, brand-first CuratedEntityPack order, temporal sample conflict]
key-files:
  created:
    - .planning/content-research/wancher-brand-phase107.md
    - .planning/content-research/wancher-dream-pen-true-ebonite-matte-black-phase107.md
    - scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts
    - scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts
    - tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts
    - public/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg
  modified: []
key-decisions:
  - "Keep 2aoD07lwSYCV as the Phase 104 article and create a separate stable pen identity."
  - "Treat the 2026-07-21 matte listing and 2018 polished supplied sample as separate scopes."
  - "Publish the rebuilt Wancher brand before the pen after topology invalidation."
patterns-established:
  - "Exact SKU packs may link back to a protected series article without reusing or mutating its identity."
requirements-completed: []
coverage:
  - id: D1
    description: Wancher brand and True Ebonite Matte Black publish under contract-v3 on an owned copy
    verification:
      - kind: integration
        ref: tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts
        status: pass
    human_judgment: false
  - id: D2
    description: Phase 104 article, legacy route, Titanium boundary and protected catalog remain unchanged
    verification:
      - kind: integration
        ref: tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts
        status: pass
    human_judgment: false
duration: 13min
completed: 2026-07-21
status: complete
---

# Quick 260721-fxu: Phase 107 Wancher True Ebonite Summary

**Wancher companion brand 与独立 True Ebonite Matte Black SKU 在 disposable catalog 中按 contract-v3 发布，同时保持 Phase 104 系列文章和真实 catalog 不变。**

## Performance

- **Duration:** 13 min
- **Started:** 2026-07-21T03:38:32Z
- **Completed:** 2026-07-21T03:51:38Z
- **Tasks:** 3
- **Product files:** 6

## Identity Inventory

- Phase 104 baseline 中 Wancher brand 为 `eOfD77nOeENN`、slug `wancher`。
- Dream Pen donor `2aoD07lwSYCV` 已是 article、slug `wancher-dream-pen`；旧 `/pen/wancher万佳-dream-pen` 仍由既有 route 映射到 `/article/wancher-dream-pen`。
- Exact True Ebonite Matte Black 在 apply 前不存在；本包新建：
  - ID: `phase107-wancher-true-ebonite-matte-black`
  - slug: `wancher-dream-pen-true-ebonite-matte-black`
- 最终仅有 `pen -> eOfD77nOeENN made_by` 与 `eOfD77nOeENN -> pen reverse` 各一条；Titanium Black 未创建 Phase 107 entity、pack 或 relation。

## Source and Scope Boundaries

- **Brand companion:** Wancher Our Story、Dream Pen collection 与 exact official listing 建立品牌／系列边界；Pencilcase Blog 只提供一支 2018 supplied sample 的独立观察，不被推广为全品牌质量结论。
- **Current scope (`phase107-true-ebonite-current-listing`):** 2026-07-21 官方 listing 的 Japanese Ebonite、Matte Sandblast Treatment、European International cartridge/converter、nib/feed/cap/clip options；不保存易变价格、库存或未来可售性。
- **Historical scope (`phase107-true-ebonite-2018-supplied-sample`):** polished、clipless、non-posting、block threads、slip-seal inner cap、steel JoWo fine + Flexible Nib Factory ebonite feed 与作者写感；保留 Wancher supplied-product/no-affiliate disclosure。
- **Finish conflict:** `material` conflict 状态为 `resolved`；current matte sandblast 与 2018 polished sample 明确归因于不同时间／样品 scope，不宣称同批次，也不互相覆盖。
- 站内正文链接回 `/article/wancher-dream-pen`。原创 SVG 分面标注 current listing、2018 reviewed sample 与 source boundary，并声明非产品照片、非比例／颜色／表面复刻。

## Publication Audit

在 caller-owned checkpoint copy（migration 032）中，先固定 topology，再按 brand → pen 顺序安装 pack、完成 fact/language/media review，并由 `publishEntity` 写入 publication review：

| Entity | Contract | Revision | Approved hash | Result |
|---|---:|---:|---|---|
| `eOfD77nOeENN` | 3 | 31/31 | `sha256:v3:0089e7bd4f3ead5a9cebe9c54c6c727ca966168276e9b60a789d11b027de60bc` | published |
| `phase107-wancher-true-ebonite-matte-black` | 3 | 60/60 | `sha256:v3:b81149567a2c4a109ff8a4fd511ff5777e1e59309b38cfda0e419d5a27a85c11` | published |

两实体在 current hash 上均恰有 fact、language、media、publication 四类 approved review，readiness `publishable=1`、`blocker_count=0`。第二次 apply 返回 `noop` / `noop`，hash、revision、reviews 与 topology 不变。

## Protection Audit

- Phase 104 article 全 payload digest：
  - before: `42bf0a0a4e3d1d86bfa78ff070a54e0680a2d9eb0efb22b7f43538fac7fce524`
  - after: `42bf0a0a4e3d1d86bfa78ff070a54e0680a2d9eb0efb22b7f43538fac7fce524`
- Protected `data/fpkg.db` snapshot 在每次测试／audit 前后完全一致：
  - main SHA-256: `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`
  - WAL SHA-256: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
  - SHM SHA-256: `fd4c9fda9cd3f9ae7c962b0ddf37232294d55580e1aa165aa06129b8549389eb`
- Remote env、空 reviewer、owned-root 外路径、protected path、symlink、hard-link alias、client/path mismatch、未迁移 copy、错误 brand/article identity 与 alternate exact-product collision 均在 Phase 107 首次写事务前 fail closed。

## Verification

- `node --import tsx --test tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts` — PASS (1/1)
- `pnpm exec biome check ...`（本包三个 TypeScript 文件）— PASS
- `pnpm exec tsc --noEmit --pretty false` — PASS
- `xmllint --noout ...wancher-dream-pen-true-ebonite-matte-black.svg` — PASS
- 六个 owned 产品文件的 `git diff --check`、cached path-set comparison 与 `git diff --cached --check` — PASS

## Product Commit Allowlist

Commit `ee5758c` (`feat(content): publish Wancher True Ebonite Matte Black`) 精确包含：

1. `.planning/content-research/wancher-brand-phase107.md`
2. `.planning/content-research/wancher-dream-pen-true-ebonite-matte-black-phase107.md`
3. `public/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg`
4. `scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts`
5. `scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black.ts`
6. `tests/content/phase107-wancher-dream-pen-true-ebonite-matte-black.test.ts`

计划文件、本 SUMMARY、其它 research、`.next-phase*`、Phase 105 quick 目录与 `260719-665` quick 目录均未进入产品提交。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- 仓库 `.gitignore` 的 unanchored `data/` 规则会忽略新建的 `scripts/data/*`；为满足计划的精确六文件提交，单独对明确 allowlist 中的 Phase 107 data pack 使用 `git add -f`，未 force-stage 任何其它文件。
- 初次 cached diff check 发现两份 Markdown 末尾多空行；删除空行、重新定向暂存后通过。

## Known Stubs

None. 两份正文、两个 packs、apply、测试与 SVG 均已完整接线；没有阻断本计划目标的 TODO、placeholder 或 mock data。

## Next Phase Readiness

Phase 107 只完成 Wancher companion brand 与 Dream Pen True Ebonite Matte Black 这一具体 SKU。它没有完成全量内容 goal，也没有发布 Titanium Black；后续 Wancher 型号仍需各自取得独立证据后分包处理。

## Self-Check: PASSED

- 六个产品文件与本 SUMMARY 均存在。
- 产品 commit `ee5758c` 存在，HEAD path set 精确等于六文件 allowlist。
- SUMMARY 未进入产品 commit，且当前 index 为空。

---
*Quick: 260721-fxu*
*Completed: 2026-07-21*
