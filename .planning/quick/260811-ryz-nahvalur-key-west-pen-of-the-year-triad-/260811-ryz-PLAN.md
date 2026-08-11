---
quick_id: 260811-ryz
status: complete
scope: direct-content-repair
source_checkpoint: .planning/quick/260811-q86-add-sourced-nahvalur-original-horizon-vo/checkpoint/catalog.db
source_checkpoint_sha256: 81bf7975b41e9820b86546ac9406bf82b04eaadcf6761e6041241c7ece4dc5b3
phase_number: 597
---

# Phase 597：补齐 Nahvalur Key West、Triad 与 Pen of the Year 2022–2026

## Objective

以 Nahvalur 官网、官方 Shopify product data、官方历史文章和可靠专业零售／评测资料为依据，在 Phase 596 caller-owned checkpoint 的新 copy 上发布七个不混名的 canonical 型号：Key West、Triad、Tiger 2022、Rabbit 2023、Dragon 2024、Snake 2025、Horse 2026；同步深化 Nahvalur 品牌页关系与导航。任何试验不得打开或写入真实 `data/fpkg.db`，不得访问 Turso。

## Must Haves

- Key West 仅作为一个基础型号，Key Largo、Islamorada 与 Pride 2024 保持 edition／颜色范围；八个 2021 SKU 已售罄，不冒充 current available。
- Triad 仅收录 fountain-pen F／M market SKU；同页 RollerBall 变体必须明确排除。2025 四色与 2026 新增四色分别有时态证据。
- Pen of the Year 五个年度版本各自为 canonical pen：Tiger 222、Rabbit 223、Dragon 224、Snake 888、Horse 999 的限量、材料、笔尖与机构只绑定对应年份；来源冲突被显式记录。
- 品牌页链接 Phase 596 的七个既有型号和本批七个新增型号；所有 made_by 关系完整，既有型号 digest 不变。
- 品牌与七个型号均有自然中文正文、规格、历史／时态、版本边界、使用维护、选购核验、原创非产品照片示意图及具名来源。
- 所有发布均走 `recordEntityContentReview` 与 `publishEntity`；wrapper 拒绝 remote selectors、真实库、source checkpoint、链接／inode／collision 风险。
- 第一次 apply 后品牌与七个型号 published，完整 replay 全部 noop；输入 Phase 596 family 和真实库 family 前后不变。

## Task 1 — 来源研究、中文正文与媒体

**Owned files:**

- `.planning/content-research/nahvalur-brand-phase597.md`
- `.planning/content-research/nahvalur-key-west-phase597.md`
- `.planning/content-research/nahvalur-triad-phase597.md`
- `.planning/content-research/nahvalur-pen-of-the-year-tiger-2022-phase597.md`
- `.planning/content-research/nahvalur-pen-of-the-year-rabbit-2023-phase597.md`
- `.planning/content-research/nahvalur-pen-of-the-year-dragon-2024-phase597.md`
- `.planning/content-research/nahvalur-pen-of-the-year-snake-2025-phase597.md`
- `.planning/content-research/nahvalur-pen-of-the-year-horse-2026-phase597.md`
- `public/images/library/site-original/phase597/nahvalur/*.svg`（七张）

**Action:** 写完八篇来源化研究／正文文件和七张互不相同的 1600×900 SVG；图片必须标明本站原创示意图、非产品照片，不能伪装产品颜色、树脂、比例或商标证据。

**Verify:** 正文层有足够信息密度；来源 URL 可追溯；`xmllint` 通过；七张 SVG hash 互不相同并目视无裁切。

## Task 2 — Curated packs 与受保护发布链路

**Owned files:**

- `scripts/data/phase597-nahvalur-key-west-triad-pen-of-year.ts`
- `scripts/apply-phase597-nahvalur-key-west-triad-pen-of-year-content.ts`

**Action:** 按现有 `CuratedEntityPack`、review gate 与 protected wrapper 模式实现品牌刷新和七个型号。为 current Triad F／M 建 edition-group → market-SKU topology；Key West 与年度售罄/历史代码保留为 unavailable evidence，不创建 current children。显式处理官方页面、Shopify 数据和零售测量之间的冲突。

**Verify:** TypeScript 与目标 Biome 通过；collision、type、slug、alias、brand 关系和 publication intent fail closed；不改通用 infrastructure。

## Task 3 — Owned checkpoint 回放与离线全量验收

**Owned file:**

- `tests/content/phase597-nahvalur-key-west-triad-pen-of-year.test.ts`

**Action:** 只通过 `copyCheckpointedCatalogToDisposableCopy` 从 Phase 596 source 建立临时和持久 Phase 597 copy；覆盖 first apply、完整 replay、baseline +7、品牌 7→14、SKU topology、unavailable/rollerball 拒绝、reviews/publication 与 source/real snapshot。随后串行跑 readiness、entity quality、library、media、SQLite integrity、production build 和页面 readback。

**Verify:** 定向测试通过；Phase 597 checkpoint 可重放；published/public blockers、duplicate/thin/suspicious/made_by 与 current-public primary duplicate group 均为 0；七个新型号和品牌 URL HTTP 200；只暂存本计划声明的实现文件。

## Non-goals

- 不处理 IKKAKU by Nahvalur；其品牌／子品牌身份和漆艺产品另开下一批。
- 不正式迁移 `data/fpkg.db`，不访问 Turso，不部署生产。
- 不新增通用 runner、Playwright 或 readiness 基础设施。
- 不删除、覆盖或提交其他 research、`.next-phase*`、checkpoint/evidence 或受保护 Montblanc quick 目录。
