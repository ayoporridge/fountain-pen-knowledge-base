---
captured_at: 2026-07-13T06:03:26+08:00
head: 63c4e4db71d14c7d3bb49994b14fee7779c167f3
branch: master
upstream: origin/master
tracked_modified: 16
untracked_files: 13
diff_check: clean
---

# 260713-7u5 实施前基线清单

本清单在任何本轮产品文件编辑前创建。它用于证明既有未提交优化被完整保留；本轮禁止 `reset`、`checkout --`、删除未跟踪文件或用 `HEAD` 整文件覆盖当前内容。

## Git 身份

- HEAD: `63c4e4db71d14c7d3bb49994b14fee7779c167f3`
- branch: `master`
- upstream: `origin/master`
- tracked diff: `570 insertions(+), 133 deletions(-)` across 16 files
- `git diff --check`: 通过，无空白错误

## 精确 status 基线

以下为 `git status --porcelain=v1 -uall` 的逐文件记录：

```text
 M .planning/STATE.md
 M migrations/009_brands_and_concepts.sql
 M scripts/export-to-d1-safe.ts
 M src/app/[type]/[slug]/page.tsx
 M src/app/api/chat/route.ts
 M src/app/by/[dimension]/page.tsx
 M src/app/chat/page.tsx
 M src/app/compare/page.tsx
 M src/app/library/page.tsx
 M src/app/sitemap.ts
 M src/components/MobileNav.tsx
 M src/components/library/BrandMuseum.tsx
 M src/components/library/ModelArchive.tsx
 M src/components/library/SourceCards.tsx
 M src/lib/ai/chat-pipeline.ts
 M src/lib/publicText.ts
?? .planning/quick/20260702-full-site-optimization/PLAN.md
?? .planning/quick/20260702-full-site-optimization/SUMMARY.md
?? .planning/quick/20260702-reader-facing-content-cleanup/PLAN.md
?? .planning/quick/20260702-reader-facing-content-cleanup/SUMMARY.md
?? .planning/quick/260703-9p5-fix-truncated-japanese-pocket-pens-artic/PLAN.md
?? .planning/quick/260703-9p5-fix-truncated-japanese-pocket-pens-artic/SUMMARY.md
?? .planning/quick/260703-9u2-scan-and-repair-all-truncated-articles/PLAN.md
?? .planning/quick/260703-9u2-scan-and-repair-all-truncated-articles/SUMMARY.md
?? .planning/quick/260713-7u5-fountain-pen-graph-seo-vercel/260713-7u5-PLAN.md
?? scripts/apply-full-site-optimization-content-fixes.ts
?? scripts/apply-reader-facing-content-cleanup.ts
?? scripts/audit-truncated-articles.ts
?? scripts/fix-japanese-pocket-pens-article.ts
```

## Tracked diff name-status 与 stat

```text
M .planning/STATE.md                                      12 ++-
M migrations/009_brands_and_concepts.sql                 12 +--
M scripts/export-to-d1-safe.ts                            34 ++++++--
M src/app/[type]/[slug]/page.tsx                         147 ++++++++++++++++++++++++++++++--
M src/app/api/chat/route.ts                                6 ++
M src/app/by/[dimension]/page.tsx                         91 +++++++++++++++-----
M src/app/chat/page.tsx                                  101 ++++++++++++++++------
M src/app/compare/page.tsx                                49 +++++++++--
M src/app/library/page.tsx                                 6 +-
M src/app/sitemap.ts                                      34 ++++++++
M src/components/MobileNav.tsx                            30 ++++++-
M src/components/library/BrandMuseum.tsx                   3 +-
M src/components/library/ModelArchive.tsx                 10 +++
M src/components/library/SourceCards.tsx                 147 ++++++++++++++++++++------------
M src/lib/ai/chat-pipeline.ts                             10 ++-
M src/lib/publicText.ts                                   11 +++
```

## 未跟踪文件 SHA-256

```text
db299d2ff6f3d9308f0fedfa2a80b31b1e6b0cf1886dc10f26771fc24391f95b  .planning/quick/20260702-full-site-optimization/PLAN.md
f4e08a98e6a40f3624ce7dbbd9d34b6bfc5091ea98b9839f1776da74eb176448  .planning/quick/20260702-full-site-optimization/SUMMARY.md
063452ca2d80ce0202e24e989b51e01fdb870da200051d24ad591e14538540d8  .planning/quick/20260702-reader-facing-content-cleanup/PLAN.md
40e41ad20f9aad3ab3a088f935052fadc8fde6289a8cc95bc8c292c154532556  .planning/quick/20260702-reader-facing-content-cleanup/SUMMARY.md
e1761228dfa3fb074f55aa71bb65fe7cc760797d9464a974a32b208b5b998a29  .planning/quick/260703-9p5-fix-truncated-japanese-pocket-pens-artic/PLAN.md
95d2b3dfd2c2fe5a4033267cc75b1cc315906a53918af7d9dda12bebbe4483b4  .planning/quick/260703-9p5-fix-truncated-japanese-pocket-pens-artic/SUMMARY.md
244d1eae368049596bb192c34c38a7949772ace9f652e153647dd42441351d37  .planning/quick/260703-9u2-scan-and-repair-all-truncated-articles/PLAN.md
17064283f63f887d12ffe25b3fd2be3d6afc2719832ede89ca7db23f584c2d14  .planning/quick/260703-9u2-scan-and-repair-all-truncated-articles/SUMMARY.md
cd98d36bcf472b29993b948c5476f83865a4b12c9ebb205ac38c3d88425268a7  .planning/quick/260713-7u5-fountain-pen-graph-seo-vercel/260713-7u5-PLAN.md
b7370b9d4ed031469a5ee743cbedc1a0c93206beecfc7cf8484e98fc73f0e251  scripts/apply-full-site-optimization-content-fixes.ts
6c536418822439cc1de05592f8b8c87fabea4914e72d4993c6219ed16e3ae7b9  scripts/apply-reader-facing-content-cleanup.ts
4fa8a592290da62c605282556e0848e2e537729a7bde861206a24f9807188f11  scripts/audit-truncated-articles.ts
e5e23cb6df6a25b435f339339cf7c40f6d1c2a0e7f8f2a1cdc0f1f3737d6ea24  scripts/fix-japanese-pocket-pens-article.ts
```

## 既有成果语义 marker

这些内容属于本轮输入基线，后续只能增量合并：

- concept rule 修复：`migrations/009_brands_and_concepts.sql` 中 concept entity/rule 的 `INSERT OR IGNORE` 结构仍在。
- chat 配置门禁与公开实体过滤：`src/app/api/chat/route.ts` 保留配置检查；`src/lib/ai/chat-pipeline.ts` 引用 `PUBLIC_ENTITY_FILTER_SQL`。
- 真实品牌索引：`src/app/by/[dimension]/page.tsx` 的 brand 分支直接查询公开 brand entity 与 `model_specs.brand_entity_id`。
- compare 空状态：`src/app/compare/page.tsx` 保留未选择实体时的策展入口。
- library 路由：`src/app/library/page.tsx` 馆区入口指向 `/browse?type=brand`、`/library/*`；`src/components/MobileNav.tsx` 保留图书馆与维度导航。
- sitemap 扩充：`src/app/sitemap.ts` 已包含 library 子页并应用公开实体过滤。
- 移动维度导航：`src/components/MobileNav.tsx` 保留 `/by/brand` 等维度入口。
- 来源占位处理：`src/components/library/SourceCards.tsx` 使用 `isPlaceholderSourceUrl`，`src/lib/publicText.ts` 提供公开显示清理。
- 产品图/证据徽章：`src/components/library/ModelArchive.tsx` 保留产品图；`src/app/[type]/[slug]/page.tsx` 保留 `productImage` 与 `evidenceBadges`。
- D1 长文导出防截断：`scripts/export-to-d1-safe.ts` 保留拆分 oversized `body_md` SQL literal 的逻辑；`scripts/audit-truncated-articles.ts` 与两个 apply/fix 脚本完整保留。

## Baseline E2E

在任何本轮产品编辑前，先执行 `pnpm build`，再由 Playwright 在独立 `127.0.0.1:3107` 启动 `next start`；`reuseExistingServer=false`，只运行 `desktop` 单 project，不复用 `:3000` 的 dev server。

- build: passed
- expected/passed: 43
- unexpected/failed: 31
- skipped: 12
- flaky: 0
- duration: 215089 ms

唯一 skip 源码声明集合（后续门禁按此集合比较，不按 desktop/mobile project 展开后的原始数量比较）：

```text
tests/e2e/library.spec.ts:477  under-documented brand pages reuse existing fallback artwork
tests/e2e/library.spec.ts:491  research-gap pages show sourced draft stories and review status
tests/e2e/library.spec.ts:507  remaining low-source brands render research queue copy
tests/e2e/library.spec.ts:527  priority model gap pages render research-queue archives
tests/e2e/library.spec.ts:584  second priority model gap pages render official anchors and boundaries
tests/e2e/library.spec.ts:655  third priority model gap pages render research archives
tests/e2e/library.spec.ts:715  fourth priority model gap pages render research archives
tests/e2e/library.spec.ts:775  fifth priority model gap pages render research archives
tests/e2e/library.spec.ts:830  sixth priority model gap pages render Wing Sung and Parker archives
tests/e2e/library.spec.ts:892  seventh priority model gap pages render Parker Sheaffer and Platinum archives
tests/e2e/library.spec.ts:952  eighth priority model gap pages render Snowhite and Pilot archives
tests/e2e/library.spec.ts:1012 ninth priority model gap pages render Pilot and Pelikan archives
```

Baseline 失败主要来自旧 seed/样式/文案断言与当前完整数据库、Warm Pen Atlas 页面不一致；本轮不得通过新增 skip 或删行为断言来掩盖。
