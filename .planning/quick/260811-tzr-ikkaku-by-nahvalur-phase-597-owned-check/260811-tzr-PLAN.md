---
quick_id: 260811-tzr
status: complete
implementation_commit: e9dbcc84
completed_at: "2026-08-12T17:12:09+08:00"
scope: direct-content-repair
source_checkpoint: .planning/quick/260811-ryz-nahvalur-key-west-pen-of-the-year-triad-/checkpoint/catalog.db
source_checkpoint_sha256: 50f8ae9c81999e5341d788426af2c6333fe5e6affd9919fd198b1c213a3b701b
phase_number: 598
---

# Phase 598：收口 IKKAKU by Nahvalur 身份与全产品覆盖

## Objective

以 Nahvalur 官网 collection、Shopify product data／sitemap、历史存档和可靠钢笔媒体／零售资料为依据，完成 IKKAKU by Nahvalur 的身份判断、公开产品清单、自然中文内容、媒体和 Nahvalur 品牌关系。所有试验只在 Phase 597 caller-owned checkpoint 的新 copy 上进行；不得打开或写入真实 `data/fpkg.db`，不得访问 Turso。

## Identity decision

现有证据把 IKKAKU 表述为 “IKKAKU by Nahvalur”、Nahvalur 的 luxury／premium series；官方 Shopify vendor 仍为 Nahvalur，The Pen Addict 也称其为 IKKAKU series／premium offering。除非后续一手证据证明它拥有独立制造品牌身份，本批不得新增第二个 brand：建立 `/article/ikkaku-by-nahvalur` 系列导航，所有具体钢笔继续 `made_by` Nahvalur。

## Must haves

- 冻结官网当前 collection 的九个具体产品：Ye-Yu、Pan-Long、Blue Moon、Dragonfly、Cherry Blossom、Year of the Snake、Green Moon、Blood Moon、Year of the Horse。
- 继续追查 2024 Gradient Urushi Collection 等已从官网当前 collection 退出、但由专业媒体和可靠零售存档证明曾公开销售的产品；不得把 current collection 当作历史全量。
- 当前九个产品分别保留官方 F／M SKU、availability、工艺、材料、笔尖、上墨、尺寸与限量时态；Moon Trilogy 和生肖系列只建 family 关系，不合并产品身份。
- Gradient Urushi 若缺乏三个颜色拥有独立型号身份的充分证据，则建一个 canonical family page，并以 edition-group／market-SKU 保存 Zhu-Dan、Yan-Zhi、Cong-Lu 三色，而不是制造三个重复正文页。
- 系列导航与具体型号都要有自然中文正文、历史、版本／工艺边界、使用维护、选购核验、本站原创非产品照片示意图及具名来源。
- Nahvalur 品牌页链接所有 Phase 597 既有型号和本批具体型号；系列导航不伪装成 brand，也不计入 made_by 型号数量。
- 发布走既有 `recordEntityContentReview` 与 `publishEntity` 门槛；wrapper 拒绝 remote selectors、真实库、source checkpoint、链接／inode／collision 风险。
- first apply 发布新增目标，完整 replay 全部 noop；Phase 597 source family 和真实库 family 前后不变。

## Task 1 — 外部库存封板与来源化正文

**Owned files:**

- `.planning/content-research/ikkaku-*-phase598.md`
- `.planning/content-research/nahvalur-brand-phase598.md`

**Action:** 核对官网 sitemap、current collection、每个 product JSON、专业媒体与可靠零售存档，形成 current／historical／rejected 三分清单。为系列导航和每个 canonical 产品写完整中文正文；明确 IKKAKU 不是独立 brand 的证据边界。

**Verify:** 当前 collection 九个产品无遗漏；历史 Gradient Urushi 三色有可追溯证据；每项关键规格至少有官方一手来源和一组可靠二级交叉来源或明确 publication blocker，不用营销文案推导事实。

## Task 2 — 媒体与 CuratedEntityPack

**Owned files:**

- `public/images/library/site-original/phase598/nahvalur/*.svg`
- `scripts/data/phase598-ikkaku-by-nahvalur.ts`
- `scripts/apply-phase598-ikkaku-by-nahvalur-content.ts`

**Action:** 为系列导航和 canonical 产品制作互不相同的 1600×900 factual SVG，并实现一个合并的 Phase 598 data pack 与 fail-closed wrapper。使用 article 系列导航、Nahvalur made_by、必要的 edition-group／market-SKU 拓扑和显式时态／冲突证据。

**Verify:** TypeScript、目标 Biome、SVG `xmllint` 通过；身份／slug／alias／type collision fail closed；不改通用 infrastructure。

## Task 3 — Owned checkpoint 回放与离线验收

**Owned file:**

- `tests/content/phase598-ikkaku-by-nahvalur.test.ts`

**Action:** 只通过 `copyCheckpointedCatalogToDisposableCopy` 从 Phase 597 source 建立临时和持久 Phase 598 copy；覆盖 first apply、replay、品牌链接 delta、系列导航、SKU topology、availability、reviews/publication 与 source/real snapshots。随后串行跑 readiness、entity quality、library、media、SQLite integrity、production build 和目标页面 readback。

**Verify:** 定向测试通过；新增公开实体无 blocker；duplicate/thin/suspicious/made_by 与 current-public primary duplicate group 均为 0；系列与所有型号 URL HTTP 200；只暂存本计划声明的实现文件。

## Non-goals

- 不把 IKKAKU 创建成独立 brand，除非新发现的一手证据推翻当前 series／premium-offering 判断。
- 不复用官网或零售商产品照片作为未授权主图；本站原创 SVG 不充当精确颜色、漆艺或比例证据。
- 不正式迁移 `data/fpkg.db`，不访问 Turso，不部署生产。
- 不新增通用 runner、Playwright 或 readiness 基础设施。
- 不删除、覆盖或提交其他 research、`.next-phase*`、checkpoint/evidence 或受保护 Montblanc quick 目录。
