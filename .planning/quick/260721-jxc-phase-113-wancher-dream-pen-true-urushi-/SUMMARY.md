---
phase: quick
plan: 260721-jxc
subsystem: content-publication
tags: [wancher, dream-pen, urushi, aka-tamenuri, contract-v3, sqlite, evidence-scope]
requires:
  - phase-104 Dream Pen series-navigation article and route reclassification
  - phase-107 published Wancher brand and True Ebonite SKU
  - migration 032 topology-aware publication contract
provides:
  - canonical Wancher Dream Pen True Urushi Aka Tamenuri sourced content pack
  - current brand-claim, 2019 production-order and 2018 prototype scope separation
  - phase-local caller-owned apply with Wancher post-topology current-hash publication
  - exact identity, article-reference exception, authority, tamper and noop regression
affects:
  - Wancher public reverse model navigation
  - future Dream Pen True Urushi SKU batches
tech-stack:
  added: []
  patterns:
    - caller-owned checkpoint-copy integration verification
    - optional exact article-reference allowlist with pen-owner fail-closed duplicate detection
    - post-topology current-hash review and publish without brand-pack replay
key-files:
  created:
    - .planning/content-research/wancher-dream-pen-true-urushi-aka-tamenuri-phase113.md
    - scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.ts
    - scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content.ts
    - tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts
    - public/images/library/site-original/phase113/wancher/wancher-dream-pen-true-urushi-aka-tamenuri.svg
  modified: []
key-decisions:
  - "Phase 104 article 若引用 exact Aka URL，该引用是 allowlisted navigation evidence；零引用也符合当前实际 baseline，任何 pen owner 仍 fail closed。"
  - "Wajima hand-work 与至少三个月保留为 Wancher qualified claims；2019 certificate 只绑定 reviewed order，fewer-layers 保持 author hypothesis。"
  - "Wancher brand 只在新增 exact link pair 后按 current hash 重审并调用 publishEntity，不加载或 replay Phase 107 brand pack。"
patterns-established:
  - "Exact SKU 发布顺序固定为 authority/baseline/duplicate preflight -> topology -> brand current-hash publish -> target-owned payload -> target current-hash publish。"
requirements-completed: [QUICK-260721-JXC]
coverage:
  - id: D1
    description: "发布唯一 canonical Wancher Dream Pen True Urushi Aka Tamenuri，并保持 article、True Ebonite 与 brand 非 topology payload。"
    requirement: QUICK-260721-JXC
    verification:
      - kind: integration
        ref: "tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts#Phase 113 publishes exact True Urushi Aka Tamenuri, replays noop and fails closed"
        status: pass
    human_judgment: false
  - id: D2
    description: "将 current official、2019 production order／hypothesis 与两支 2018 non-Aka prototype 拆为可审计 scopes。"
    requirement: QUICK-260721-JXC
    verification:
      - kind: integration
        ref: "tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts#structured source scope assertions"
        status: pass
    human_judgment: false
  - id: D3
    description: "用 caller-owned copy 完成 Wancher/target current-hash review-publish、noop、tamper 和 protected-catalog 验证。"
    requirement: QUICK-260721-JXC
    verification:
      - kind: integration
        ref: "node --import tsx --test tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts"
        status: pass
    human_judgment: false
duration: 34 min
completed: 2026-07-21
status: complete
---

# Phase 113: Wancher Dream Pen True Urushi Aka Tamenuri Summary

Wancher Dream Pen True Urushi Aka Tamenuri 以唯一 canonical pen 发布，并把 current 品牌主张、2019 量产订单／作者 hypothesis 与两支 2018 non-Aka prototype 严格拆成四个证据 scope。

## Performance

- **Duration:** 34 min
- **Completed:** 2026-07-21T06:37:46Z
- **Tasks:** 3
- **Files:** 5 product files
- **Product commit:** `28fb611`

## Accomplishments

- 新建稳定 identity `phase113-wancher-dream-pen-true-urushi-aka-tamenuri`、同名 slug 与 canonical name `Wancher Dream Pen True Urushi Aka Tamenuri`；只通过一对 `made_by`／`reverse` 连接既有 Wancher `eOfD77nOeENN`。
- reviewed Markdown 超过 2,000 Unicode 字符，正文链接 `/article/wancher-dream-pen`，但不创建 article topology、generic True Urushi series、其它颜色 identity 或产品合并。
- exact current listing、2019 production order、两篇 2018 black prototype 与本站原创 SVG 分别使用独立 source/scope/citation wiring。
- 首次 apply 发布一个 target；pristine replay 返回 exact noop；alternate pen identity、authority selector 与 topology tamper 均 fail closed。
- 新增 made_by topology 后只对 Wancher post-topology current hash 写三类 review 并调用 `publishEntity`，Phase 107 brand pack 未加载或 replay。

## Source and Scope Record

### Current official listing

- URL: `https://www.wancherpen.com/products/dream-pen-true-urushi-akatamenuri`
- Retrieved: `2026-07-21`
- Locator: exact product title；ebonite + urushi；About True Urushi/Wajima hand-work and process copy；European International cartridge/converter；#6 JoWo steel／Wancher 18K；plastic／ebonite feed 与 clip selectors。
- Boundary: Wajima hand-work 与至少三个月是 Wancher qualified brand claims；价格、库存、add-to-cart 和未来可售性是 mutable commerce state，不进入 stable specs。live source 明确标记为 `live-source-not-frozen`。

### 2019 production-order evidence

- URL: `https://www.pencilcaseblog.com/2019/08/revisiting-wancher-dream-pen-urushi.html`
- Locator: 作者与父亲自费订购 production pens；父亲选择 Aka-Tamenuri；随单证书命名 Taya Shikkiten；页面 no-affiliate-links disclosure；作者提出 possible fewer-layers explanation。
- Boundary: certificate 只支持该 reviewed order context，不能推广为所有 current units 的独立 provenance；fewer-layers 以 `author_hypothesis_fewer_urushi_layers`、editorial fact class 和低于 1 的 confidence 保存，不是确定层数或官方流程反证。

### 2018 prototype family history

- Pencilcase Blog: `https://www.pencilcaseblog.com/2018/02/wancher-dream-pen-urushi-fountain-pen.html` — loaned black prototype，non-Aka。
- Ed Jelley: `https://edjelley.com/2018/01/25/wancher-ebonite-urushi-dream-pen-kickstarter-fountain-pen-review/` — Wancher-supplied black prototype，non-Aka。
- Boundary: 两支样本的尺寸、重量、steel nib、finish 与 writing experience 均以 rejected spec evidence 保存，不能进入 current Aka model specs 或 configuration。

## Article URL Exception and Identity Guard

当前 Phase 104 runner 实际未写入 Aka exact official URL，因此 preflight 接受零个既有 owner；integration fixture 另行给 Phase 104 article seed 一条 navigation-only reference，证明该 article reference 可以保留并通过。无论 URL 是否被 article 引用，任何 `pen` owner、exact name／slug／alias／source-marker collision、generic True Urushi pen 或 sibling-colour pen 都在首个 Phase 113 write transaction 前 fail closed。

article `2aoD07lwSYCV` 不是 product donor。其 entity、story、source/reference、media、taxonomy、route、publication 与 topology digest 在 Phase 113 前后保持不变；正文链接只提供导航。

## Wancher Post-Topology Publication

apply 在 topology 前捕获 Wancher non-topology digest/source marker、Phase 104 article full digest、Phase 107 True Ebonite full digest与 Wancher contract hash。随后只新增 exact Aka `made_by`／Wancher `reverse` link pair，并验证：

- Wancher 非 topology payload与 Phase 107 source marker byte/logically unchanged。
- Wancher current hash 只因 expected topology 增量改变。
- fact/language/media approvals 绑定 post-topology current hash。
- `publishEntity` 恢复 Wancher public membership。
- Phase 107 Wancher pack 没有被加载、安装或 replay。

target payload 在独立 transaction 安装；其后同样按 current hash 完成 fact/language/media review 和 `publishEntity`。

## Single-Setup and Protected Catalog

integration regression 只有一个 top-level `test` 和一次 `setup()`：它调用一次 `copyCheckpointedCatalogToDisposableCopy`、一次 migration chain，随后在同一 caller-owned fixture 中准备 Phase 104/107 baseline、article exception、initial publish、authority failure、alternate identity、noop 与 tamper 场景。

apply 拒绝 inherited `TURSO_DATABASE_URL`／`TURSO_AUTH_TOKEN`／`FPKG_DATABASE_URL`、空 reviewer、第三 repo root、owned-root 外路径、symlink/hard-link alias、client/path mismatch 和未迁移 032 copy。所有 Phase 104、Phase 107、Phase 113、review、publish、tamper 与 replay 写入只发生在 caller-owned disposable database；finally 的 main/WAL/SHM snapshot 比对证明真实 `data/fpkg.db` 未改变。

## Verification

- `node --import tsx --test tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts` — PASS，TAP 1/1，0 failed，0 skipped。
- `pnpm exec tsc --noEmit --pretty false` — PASS。
- `pnpm exec biome check scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.ts scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content.ts tests/content/phase113-wancher-dream-pen-true-urushi-aka-tamenuri.test.ts` — PASS。
- `xmllint --noout public/images/library/site-original/phase113/wancher/wancher-dream-pen-true-urushi-aka-tamenuri.svg` — PASS。
- Five-path working-tree and cached `git diff --check` — PASS。
- `git show --name-only --format= 28fb611` — exact five planned product paths；PLAN、SUMMARY 与 unrelated worktree files 均不在产品提交。

## Deviations from Plan

None - plan executed within the stated Phase 112 analog and the plan's optional article-reference interface. The current Phase 104 zero-reference baseline and the seeded article-reference exception are both covered without modifying Phase 104.

## Issues Encountered

- 首轮 article exception fixture 在 Phase 104 runner 之前 seed，随后被 baseline identity flow 清除，导致 count 断言失败。将 seed 移到 Phase 104/107 baseline 完成后，targeted integration 通过。
- 首轮 cached diff gate发现 reviewed Markdown、data file 与 SVG 末尾各多一个空行；提交前只修正这三个 owned 文件，重跑 cached path set 与 diff gate 后通过。
- pnpm 输出现有配置 warning：package.json 的 `pnpm.onlyBuiltDependencies` 不再由当前 pnpm 读取。它是 unrelated pre-existing tooling warning，本计划未修改 package config。

## Authentication Gates

None.

## Known Stubs

None. 五个 product files 中无 TODO、FIXME、placeholder 或 coming-soon 内容；唯一 primary media 已绑定 checked-in site-original SVG。

## Threat Flags

None beyond the plan threat model。新增的本地 DB apply surface、repo alias validation、外部 source scope、article URL exception 与 exact Git staging 均由 T-113-01 至 T-113-12 覆盖。

## Partial-Batch Boundary

本次只交付 Wancher Dream Pen True Urushi Aka Tamenuri 这一支 exact SKU。它不代表 generic True Urushi series、其它漆色、剩余 Wancher／Dream Pen catalog、Phase 23 全量内容、production migration、full-site acceptance 或整体 milestone 已完成。没有对生产 catalog 执行 rollout。

## Self-Check: PASSED

- 五个 planned product files 均存在。
- 产品提交 `28fb611` 存在且恰好包含这五个 paths，无删除。
- SUMMARY 位于本 quick-task 目录，并按上游要求保持 uncommitted。
- targeted integration、TypeScript、Biome、SVG XML、working/cached diff gates 均通过。
- real catalog snapshot protection、current-hash publication、exact noop 与 tamper failure 已由 passing integration test 覆盖。

