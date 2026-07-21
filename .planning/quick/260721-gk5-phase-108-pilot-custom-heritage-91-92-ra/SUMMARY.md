---
phase: quick
plan: 260721-gk5
subsystem: content-publication
tags: [sqlite, contract-v3, curated-content, pilot, raw-identity, owned-checkpoint]
requires:
  - phase: 18-19
    provides: contract-v3 publication gate, evidence graph, and protected checkpoint helpers
  - phase: 84
    provides: reviewed Pilot brand fixture and existing published Pilot pen prerequisite
provides:
  - Canonical Pilot Custom Heritage 91 and 92 pages reusing two existing raw entity IDs
  - Two fill-system-isolated CuratedEntityPacks and independent site-original factual SVGs
  - Owned-copy-only raw canonicalization, review, publication, replay, and Pilot-brand-isolation regression
affects: [phase-23-content, pilot-models, taxonomy-identity, publication-verification]
tech-stack:
  added: []
  patterns: [immutable made_by prerequisite, in-place raw identity canonicalization, phase-local dual-pack installer]
key-files:
  created:
    - .planning/content-research/pilot-custom-heritage-91-phase108.md
    - .planning/content-research/pilot-custom-heritage-92-phase108.md
    - scripts/data/phase108-pilot-custom-heritage-91-92.ts
    - scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts
    - tests/content/phase108-pilot-custom-heritage-91-92.test.ts
    - public/images/library/site-original/phase108/pilot/pilot-custom-heritage-91.svg
    - public/images/library/site-original/phase108/pilot/pilot-custom-heritage-92.svg
  modified: []
key-decisions:
  - "复用 NpJibLHczSl9 与 -Oa7pDNi4UnI，在原 ID 上 canonicalize；不创建替代实体。"
  - "两个既有 made_by -> Zt-PbXkE7UHM 只作不可变 prerequisite，不删除、更新或重插。"
  - "2025-10 官方调价 PDF 只进入 historical_price_2025_10 scope，不代表 2026 当前售价。"
patterns-established:
  - "双 raw identity 在同一 identity transaction 中原位规范并安装稳定 permanent redirects。"
  - "terminal noop 同时检查 source marker、route、maker、primary media、current hash、四类 review、readiness 与 public membership。"
requirements-completed: []
coverage:
  - id: D1
    description: "Custom Heritage 91/92 复用两个 raw ID，形成唯一 canonical route 和永久 legacy route。"
    verification:
      - kind: integration
        ref: "tests/content/phase108-pilot-custom-heritage-91-92.test.ts#raw identity, canonical route and redirect assertions"
        status: pass
    human_judgment: false
  - id: D2
    description: "91 的 FKVHN-12SR c/c 与 92 的 FKVH-15SRS 内置 piston 在内容、claims、spec、variant、care 和 SVG 中严格隔离。"
    verification:
      - kind: integration
        ref: "tests/content/phase108-pilot-custom-heritage-91-92.test.ts#pack fill-system positive and cross-negative assertions"
        status: pass
    human_judgment: false
  - id: D3
    description: "两个实体在 caller-owned copy 上完成四类 current-hash review、readiness 和 contract-v3 publication，replay 精确 noop。"
    verification:
      - kind: integration
        ref: "tests/content/phase108-pilot-custom-heritage-91-92.test.ts#publication and replay assertions"
        status: pass
    human_judgment: false
  - id: D4
    description: "Pilot brand 与非目标 Pilot 页面保持不变，真实 catalog main/WAL/SHM 快照保持不变。"
    verification:
      - kind: integration
        ref: "tests/content/phase108-pilot-custom-heritage-91-92.test.ts#brand digest, non-target summary and protected snapshot assertions"
        status: pass
    human_judgment: false
duration: 17min
completed: 2026-07-21
status: complete
---

# Quick 260721-gk5: Phase 108 Pilot Custom Heritage 91 / 92 Summary

**Pilot Custom Heritage 91 与 92 现以两个既有 raw ID 原位规范为来源化公开页面，在不改 made_by、不重放 Pilot 品牌且不写真实 catalog 的前提下完成 contract-v3 发布回归。**

## Scope

这是 Phase 108 对 **Pilot Custom Heritage 91 / 92 两个型号的局部交付**。它不代表 Pilot 全品牌、Phase 23 内容库存或项目全量 goal 已完成。

## Performance

- **Duration:** 17 min
- **Started:** 2026-07-21T04:01:55Z
- **Completed:** 2026-07-21T04:18:15Z
- **Tasks:** 3
- **Product files:** 7

## Raw / Canonical Identity

| Model | Reused raw ID | Raw slug | Canonical slug | Legacy route | Canonical route |
|---|---|---|---|---|---|
| Custom Heritage 91 | `NpJibLHczSl9` | `百乐-pilot-heritage-91` | `pilot-custom-heritage-91` | `/pen/百乐-pilot-heritage-91` | `/pen/pilot-custom-heritage-91` |
| Custom Heritage 92 | `-Oa7pDNi4UnI` | `百乐-pilot-heritage-92` | `pilot-custom-heritage-92` | `/pen/百乐-pilot-heritage-92` | `/pen/pilot-custom-heritage-92` |

两个 legacy route 均为 `permanent`，source/target 精确匹配；实体总数没有因 Phase 108 新增替代 ID。两个原有且唯一的 `made_by -> Zt-PbXkE7UHM` 行在 apply 前后按 `id/source_id/target_id/link_type/reason` 深比较完全相同。

## Live Source Retrieval and Locators

执行日为 2026-07-21。以下采用来源均重新打开并可读；`archiveUrl` 使用当前真实 live URL，`archiveLocator` 明确写为 `live-source-not-frozen`，未臆造外部归档。

| Source | Status | Exact locator / use |
|---|---|---|
| Pilot Custom Heritage lineup | HTTP/readable | 91：live lines 73-86，FKVHN-12SR、14K No.5、九种尖；92：lines 90-103，FKVH-15SRS、14K No.5、尾栓吸墨；`summary_only` |
| Pilot 91 web catalog | HTTP/readable | title/SKU；spec table lines 32-60，CON-40、CON-70N、树脂、137 mm、15.7 g；`summary_only` |
| Pilot 92 web catalog | HTTP/readable | FKVH15SRS-NCF product feature/spec table，内置回转吸入、1.2 ml、透明树脂、137 mm、20 g；`summary_only` |
| Pilot 91 warranty/use-care | HTTP/readable | product FKVHN-12SR 与 cartridge/converter use-care sections；`summary_only` |
| Pilot 92 warranty/use-care + PDF | HTTP/readable | product FKVH-15SRS；PDF P0 lines 0-34，piston 操作、清水吸排、润滑痕迹、尾栓、气压与 Tsuwairo 边界；`summary_only` |
| Pilot 2025-10 price PDF | HTTP 200 / PDF readable | PDF page 1 (viewer P0) line 15：91 / FKVHN12SR / 27,500 円；line 16：92 / FKVH15SRS / 33,000 円；仅 `historical_price_2025_10` |
| Scrively 91 | HTTP/readable | lines 38-57，2026-05-10 橙色样本、c/c、铑色 14K、soft response 与明确 not-flex 边界；`summary_only` |
| Parka Blogs 92 | HTTP/readable | lines 36-69，Teoh Yi Chie / 2015-02-21、内置 piston 样本、平衡与写感；拆尖清洗未升级为官方规范；`summary_only` |
| Gentleman Stationer 92 | HTTP/readable | lines 41-52、60-74，Joe Crace / 2026-06-06，自用样本、posted 偏好、No.5 M 与平衡；`summary_only` |

计划中的真实官方价格 URL `https://www.pilot.co.jp/information/2025.10%20price_list.pdf` 当前可达，因此没有替换或虚构 PDF URL。Fountain Pen Network 候选未获得可稳定定位的完整正文，未进入 qualified evidence。

## Fill-System Isolation

- **91:** `FKVHN-12SR`、14K No.5 rhodium-finished、Pilot cartridge／CON-40／CON-70N；正文、核心 claim、spec evidence、market SKU variant、care 与 SVG 都按可拆换供墨路线组织。
- **92:** `FKVH-15SRS`、14K No.5、透明树脂、1.2 ml fixed reservoir 与 built-in piston；正文、核心 claim、spec evidence、market SKU variant、care 与 SVG 都明确禁止 cartridge/converter。
- 交叉负断言证明 91 pack 不含 92-only `built-in piston/fixed reservoir/1.2 ml`，92 pack 不含 `CON-40/CON-70N` 或正向 cartridge 兼容。
- Scrively、Parka 与 Gentleman Stationer 的顺滑、反馈、弹性、平衡和 posted 体验全部限定为作者样本；未泛化为全型号保证。

## Original Media

- `pilot-custom-heritage-91.svg`：1600×900，分解展示 No.5、握位接口、Pilot cartridge、CON-40 与 CON-70N。
- `pilot-custom-heritage-92.svg`：1600×900，剖面展示 No.5、透明固定墨仓、piston 与尾端旋钮。

两张图构图不同，各自是唯一 `approved primary` media，并显著标注“本站原创示意图，非产品照片”、非比例、非颜色／表面复刻、不含 Pilot Logo。

## Publication and Isolation Results

- 首次 apply outcomes：`NpJibLHczSl9=published`、`-Oa7pDNi4UnI=published`。
- 两实体均得到同一 current content hash 下唯一的 `fact`、`language`、`media`、`publication` approvals。
- 两实体均为 `reviewed_contract_version=3`、`publishable=1`、`blocker_count=0`，且进入 `public_entities`。
- 第二次 apply outcomes：两个实体均为 `noop`；content hash、revision、reviews、redirect 与 made_by 摘要完全不变。
- Pilot brand before/after digest：比较对象覆盖 entity、story、source reference、media、current-hash reviews、publication 与 `computePublicationContentHash`；`deepEqual=true`。
- 非目标 Pilot entity/publication 摘要 before/after：`deepEqual=true`，包括 Phase 84 已完成的 Capless、Custom 823、Custom Heritage 912 fixture 范围。
- Pilot public reverse diff 只新增：`NpJibLHczSl9 / pilot-custom-heritage-91` 与 `-Oa7pDNi4UnI / pilot-custom-heritage-92`。
- protected catalog：`data/fpkg.db` main/WAL/SHM 测试前后 snapshot `deepEqual=true`；所有 migration、fixture、apply 与查询写连接均绑定 caller-owned disposable copy。

## Verification

- `node --import tsx --test tests/content/phase108-pilot-custom-heritage-91-92.test.ts` — PASS (1/1, final run 55.2 s)
- `pnpm exec tsc --noEmit --pretty false` — PASS
- `xmllint --noout` 两张 Phase 108 SVG — PASS
- `pnpm exec biome check tests/content/phase108-pilot-custom-heritage-91-92.test.ts` — PASS
- 两个 scripts 使用 `biome format --stdin-file-path ... | cmp` — PASS，输出与 checked-in 文件 byte-identical
- 七文件 `git diff --check` 与 staged `git diff --cached --check` — PASS
- staged path set 与固定七文件 allowlist — exact match
- `git show --name-only 5224b2a` 与固定七文件 allowlist — exact match

项目 `biome.json` 的 `files.includes` 当前不包含 `scripts/**`，所以计划原样的 `biome check scripts/...` 会报告 `0 files processed`。Phase 108 没有修改 shared config；改用 Biome stdin formatter 的 byte comparison 对两个脚本进行真实解析与格式一致性验证。

## Product Commit

`5224b2a` — `feat(content): publish Pilot Custom Heritage 91 and 92`

### Exact Product Commit Allowlist

- `.planning/content-research/pilot-custom-heritage-91-phase108.md`
- `.planning/content-research/pilot-custom-heritage-92-phase108.md`
- `public/images/library/site-original/phase108/pilot/pilot-custom-heritage-91.svg`
- `public/images/library/site-original/phase108/pilot/pilot-custom-heritage-92.svg`
- `scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts`
- `scripts/data/phase108-pilot-custom-heritage-91-92.ts`
- `tests/content/phase108-pilot-custom-heritage-91-92.test.ts`

PLAN 与本 SUMMARY 均未进入产品 commit。提交前 index 为空；提交后 index 再次为空。全部既有及执行期间出现的无关 modified/untracked 文件保持未暂存、未清理、未覆盖。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test bug] 兼容未迁移 copy 的 fail-closed state snapshot**

- **Found during:** Task 1 authority regression
- **Issue:** 测试摘要在调用 apply 前读取 migration 032 才创建的 `entity_redirects`，导致未迁移 case 在被测 preflight 前失败。
- **Fix:** 仅对可能不存在的旧 schema 表使用 optional read；仍比较调用前后 disposable state。
- **Files modified:** `tests/content/phase108-pilot-custom-heritage-91-92.test.ts`
- **Verification:** 未迁移 case 命中 `owned copy must be migrated through 032`，state 不变。
- **Committed in:** `5224b2a`

**2. [Rule 1 - Validation bug] 区分 92 的负向 cartridge 边界与正向兼容声明**

- **Found during:** Task 2 pack isolation
- **Issue:** 初始交叉正则把“92 cannot use cartridge/converter”误判成 91-only 兼容事实。
- **Fix:** 只拒绝 `CON-40/CON-70N` 或明确正向 supports/compatible 声明，保留必要的禁止兼容证据。
- **Files modified:** `scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts`, `tests/content/phase108-pilot-custom-heritage-91-92.test.ts`
- **Verification:** 规格交叉负断言与完整 publication test 通过。
- **Committed in:** `5224b2a`

**3. [Rule 1 - Diagnostic ordering] maker prerequisite 先于 brand readiness 报告**

- **Found during:** Task 3 maker fail-closed regression
- **Issue:** 故意破坏 made_by 会由 migration 032 同时使 Pilot brand 失效，早期 brand 检查遮蔽更具体的 maker 错误。
- **Fix:** 先确认 Pilot identity，再检查两个 immutable maker rows，最后检查 Pilot publication/readiness。
- **Files modified:** `scripts/apply-phase108-pilot-custom-heritage-91-92-content.ts`
- **Verification:** maker case 在首写前以精确错误拒绝，disposable state 不变。
- **Committed in:** `5224b2a`

**4. [Rule 2 - Missing Critical] 将 Parka piston 样本接入 92 core evidence chain**

- **Found during:** Task 3 publication readiness
- **Issue:** 92 虽有 professional sources，但 core claim 最初只有 pilot-official 证据，触发 `missing_professional_secondary_group`。
- **Fix:** 用 Parka 实物样本仅交叉核对 built-in reservoir/piston；1.2 ml 与 care 仍由 Pilot 官方限定。
- **Files modified:** `scripts/data/phase108-pilot-custom-heritage-91-92.ts`
- **Verification:** 92 得到 `publishable=1`、`blocker_count=0` 和四类 current-hash approvals。
- **Committed in:** `5224b2a`

**5. [Rule 3 - Verification blocker] Biome scripts include 边界**

- **Found during:** Overall verification
- **Issue:** shared `biome.json` 不包含 `scripts/**`，计划原样命令对两个新增 scripts 报告零文件。
- **Fix:** 不修改 shared infra；对 scripts 使用 Biome stdin formatter 并以 byte-identical `cmp` 验证，test 文件仍走标准 `biome check`。
- **Files modified:** None beyond formatter-normalized owned files
- **Verification:** stdin parse/format comparisons、TypeScript、focused test 全部通过。
- **Committed in:** `5224b2a`

---

**Total deviations:** 5 auto-fixed（3 Rule 1、1 Rule 2、1 Rule 3）。
**Impact on plan:** 均为测试准确性、evidence readiness 或 scoped verification 所需；没有扩展 shared infrastructure、数据库 schema 或产品范围。

## Known Stubs

None. 七个产品文件没有 TODO/FIXME、空数据占位、mock feed 或未接线 UI 数据源。

## Threat Flags

None. 新入口仅接受 caller-owned local SQLite copy；没有新增网络 endpoint、认证路径、production schema 或真实 catalog 写路径。

## Self-Check: PASSED

- 七个产品文件均存在。
- 产品 commit `5224b2a` 存在，message 与七文件 path set 精确匹配。
- SUMMARY 位于 quick 目录且未进入产品 commit。
- focused test、TypeScript、Biome scoped checks、SVG XML、diff checks、noop、Pilot isolation 与 protected snapshot 均通过。
- Phase 108 只声明 Custom Heritage 91/92 的局部交付，不声称全量 goal 完成。
