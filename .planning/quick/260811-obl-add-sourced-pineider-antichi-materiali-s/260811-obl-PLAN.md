---
quick_id: 260811-obl
status: complete
scope: direct-content-repair
date: 2026-08-11
source_candidate: .planning/quick/260811-njm-add-sourced-pineider-avatar-anniversary-/checkpoint/catalog.db
source_candidate_sha256: 88a61dfce0b208cba2a871d1259106291078f91c641335cddf51ee9897565c08
output_checkpoint_sha256: d799dd0e07d68a27bcad31a8685088bacde5937bf0534075fd27ed42a6a212e8
implementation_commit: 02fb726e07c3c3ec0408c13b54a53a11e9ef838b
completed_at: 2026-08-11T18:04:51+08:00
autonomous: true
---

# Deepen Pineider Avatar UR PP2101／600 and add Egosphere 1056／1058

在 Phase 593 owned candidate 的新 caller-owned checkpoint 上重写现有 Pineider Avatar UR 的模板化页面，并新增一个 Egosphere canonical 型号页。Pineider 品牌导航从十三个公开型号扩为十四个。只做内容、身份、媒体与直接回归；不访问 Turso，不恢复 search／LLM，不扩建通用验收设施，不 SQLite-open 或试写 source candidate 与 `data/fpkg.db`。

## Task 1: 固化 Avatar UR 与 Egosphere 的 exact identity、时态和正文

- **Files:** `.planning/content-research/pineider-brand-phase594.md`、`.planning/content-research/pineider-avatar-ur-phase594.md`、`.planning/content-research/pineider-egosphere-phase594.md`、`public/images/library/site-original/phase594/pineider/pineider-egosphere.svg`。
- **Avatar UR sources:** Pineider 当前 `PP2101 / 600` exact page 与可选项 HTML、Pineider Avatar collection／官方维护说明，以及 The Well-Appointed Desk、The Poor Penman、Penthusiast 的具名样笔文章。官网负责 current identity、24 个可选 child SKU、148 mm／Ø14.2 mm、UltraResin、palladium-plated steel EF／F／M、Magnetic Lock 与 cartridge／converter；第三方只用于样笔尺寸、重量、出墨、重心、磁吸帽维护等使用语境。
- **Avatar UR boundaries:** 保留实体 `phase140-pineider-avatar-ur` 与 slug `/pen/pineider-avatar-ur`，不新建 duplicate。当前选择器八色限定为 Orange 039、Riace Bronze 422、Abalone Green 423、Devil Red 420、Graphene Black 421、Foresta 325、Angel Skin 419、Neptune Blue 424，各有 EF／F／M。HTML 中存在但当前选择器未命名的 381／597／681 隐藏代码不得擅自归色；Avatar UR Deluxe 14K、Demo／Demo Metal、Black Edition、Twin Tank Touchdown 与 Mini 均不并入。
- **Egosphere sources:** Pineider 当前 Black `S000S008445056 / 1056` 与 Green `S000S088831060 / 1058` exact pages、Luigi Trenti 设计档案、Museo del Design Toscano 对 Trenti 的专业访谈、Pineider 历史目录，以及专业拍卖目录的旧样本。官网负责当前两条 product code、颜色、意大利产地、1056 的实心树脂／925 银中环／铑镀层／压印珐琅与 1058 的托斯卡纳城垛／厄尔巴岛碧玉语境；设计档案负责 1999 morphing 概念与设计者。
- **Egosphere boundaries:** 1056 与官网误拼 `Egopshere` 的 1058 是同一 Egosphere canonical 型号的两个 edition child，不建重复实体。两页在 2026-08-11 可访问但均标为 out of stock，不能写成停产或在产保证。当前官网未公开尺寸、重量、笔尖和上墨，旧拍卖样本的 18K、piston、150×17 mm 与 100 支编号均只保存为 rejected／sample scope，绝不补成当前通用规格。
- **Content/media:** 两个型号各写至少 2,500 Unicode 字符的自然中文正文，覆盖身份、规格、历史与时态、版本差异、使用维护、选购核验、图片边界和具名来源。Avatar UR 沿用已审核且路径唯一的 Phase 140 原创事实图；Egosphere 新增一张 1600×900 SVG，带 title／desc／role，明确“本站原创示意图／非产品照片”，不复制 logo、商品照片、真实颜色或比例。

## Task 2: 建立 Phase 594 CuratedEntityPack 与 fail-closed 发布 wrapper

- **Files:** `scripts/data/phase594-pineider-avatar-ur-egosphere.ts`、`scripts/apply-phase594-pineider-avatar-ur-egosphere-content.ts`。
- 从 Phase 593 brand pack 继承 canonical Pineider，只新增 brand refresh、Avatar UR 原位 refresh 与 Egosphere 三包；不得重放或改写另外十二条既有 Pineider model pack。
- Avatar UR 保持原 ID／slug／maker 拓扑，重建 current story、spec、24 个 selector-backed market SKU、evidence／conflict／review；其 approved primary media 继续使用 `/images/library/site-original/phase140/pineider/avatar-ur.svg`，不得制造重复路径。
- Egosphere 建立唯一实体、slug、spec、primary media、`made_by` 与品牌 `reverse`；1056／1058 建 edition children。官方未披露字段以明确未知状态进入 spec evidence，不用旧样本补值；current/out-of-stock 与 historic sample scope 分离。
- 所有事实通过现有 fact／language／media review 与 `publishEntity`。写前拒绝任何非空 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`；校验 reviewer、realpath、regular-file、symlink／hard-link／inode、protected snapshot、client binding 与 migration 032。entity／slug／name／alias collision 全部 fail closed；十二条非目标 Pineider model 的完整 digest 前后不变；完整三包 replay 必须全部 `noop`。

## Task 3: 在 Phase 593 后继 owned checkpoint 执行定向与全量离线验收

- **File:** `tests/content/phase594-pineider-avatar-ur-egosphere.test.ts`；checkpoint／evidence 只保留在本 quick 本地，不提交。
- 先 snapshot `data/fpkg.db` 与 Phase 593 source family，只用 `copyCheckpointedCatalogToDisposableCopy` 创建本批 owned copy；所有 migrate、apply、query、audit、build 和 readback 仅指向新 copy 或临时后继 copy。
- 定向测试覆盖四类 Egosphere identity collision、三个 remote selector、source／real family 不变、baseline +1、Pineider 13→14、Avatar UR ID／slug 不变、24 个 selector-backed SKU、三个隐藏色码拒绝、Egosphere 两个 edition child、未知字段与旧样本隔离、唯一关系、四类 current-hash approved review、首次发布与 replay noop。
- 运行 targeted test、TypeScript、精确 Biome、xmllint、七路径 diff-check、SQLite integrity／foreign key、readiness、entity quality、library contract、public media、production build，以及品牌页、两个型号页和两张 SVG 的本地 HTTP readback。
- 实现提交只允许精确暂存三篇 research、一张新 SVG、data pack、wrapper 和定向测试七个文件。PLAN／SUMMARY／STATE 单独文档提交；所有其他 research、`.next-phase*`、checkpoint／evidence 与受保护 Montblanc quick 均不得暂存。

## Completion boundary

本 quick 只证明 Avatar UR 与 Egosphere 在 Phase 594 offline candidate 上完成。它不代表 full corpus、真实本地迁移、真人全页面遍历、Turso 同步、生产部署或线上复查完成；大 goal 必须继续 active。
