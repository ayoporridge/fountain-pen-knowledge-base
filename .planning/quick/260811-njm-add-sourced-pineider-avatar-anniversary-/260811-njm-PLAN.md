---
quick_id: 260811-njm
status: complete
scope: direct-content-repair
date: 2026-08-11
source_candidate: .planning/quick/260811-mn7-add-sourced-pineider-alba-classic-pp7701/checkpoint/catalog.db
source_candidate_sha256: 443c1bf9320f477eaf28b71d8373f4b006d5eb8abbd2437dbbaeefb9c901740c
autonomous: true
implementation_commit: f7ccafa374460372ef3077beb775f1c35cfddfe2
output_checkpoint_sha256: 88a61dfce0b208cba2a871d1259106291078f91c641335cddf51ee9897565c08
completed_at: 2026-08-11T09:27:26Z
---

# Add sourced Pineider Avatar Anniversary PP7301／1026 and Avatar UR Mini SPP6801／941

在 Phase 592 owned candidate 的新 caller-owned checkpoint 上新增两个当前官网仍列出的 Pineider Avatar 家族钢笔型号，并把 Pineider 品牌导航从十一条公开型号扩为十三条。只做内容、身份、媒体与直接回归；不访问 Turso，不恢复 search／LLM，不扩建通用验收设施，不 SQLite-open 或试写 source candidate 与 `data/fpkg.db`。

## Task 1: 固化两个 exact identity、版本差异、正文与原创媒体

- **Files:** `.planning/content-research/pineider-brand-phase593.md`、`.planning/content-research/pineider-avatar-anniversary-phase593.md`、`.planning/content-research/pineider-avatar-ur-mini-phase593.md`、两张 `public/images/library/site-original/phase593/pineider/*.svg`。
- **Sources:** Pineider Anniversary collection／exact `PP7301 / 1026` 页面、Avatar collection／exact `SPP6801 / 941` 页面，以及 Zegarki i Pióra 的 Anniversary 实笔文章与 Pen Chalet 的 Avatar UR Mini 专业规格页。商品身份、current child SKU、官方尺寸、颜色、饰件与上墨以 Pineider exact page 为准；第三方只交叉材料、实测尺寸／重量、笔尖和使用语境。
- **Identity:** Anniversary child SKU 精确限定为 `SPP7301E056`／`F056`／`M056` 与 `SPP7301E374`／`F374`／`M374`，对应 Black 056、Pineider Green 374、EF／F／M、148 mm／Ø14.2 mm、gold-colour trim 与 cartridge／converter。Avatar UR Mini child SKU 精确限定为 `SPP6801F056`／`M056`、`F644`／`M644`、`F645`／`M645`、`F646`／`M646`、`F647`／`M647`，对应官网五色、F／M、120 mm／Ø13.4 mm、nickel-free palladium finish 与 cartridge／converter。
- **Boundaries:** Anniversary 是 Avatar 基础上的 250 周年产品，不声称有限编号；rollerball／ballpoint 不是钢笔 variant。UR Mini `SPP6801 / 941` 不得与 full-size Avatar UR、Alba Mini、已失效的 generic Mini `SPP7201 / 1063` 或当前另一组未核实 exact code 的 Yellow／Mint／Dust／Peach Mini 合并。Pen Chalet 的 121.9 mm／22.68 g／#6／Lux 属第三方样本，不覆盖官网 120 mm、五色与 current child SKU。
- **Content/media:** 每个型号写至少 2,000 Unicode 字符的自然中文正文，覆盖身份、规格、历史与时态、版本差异、使用维护、选购核验、图片边界和具名来源。两张 1600×900 SVG 必须构图与 SHA-256 独立，带 title／desc／role，明确“本站原创示意图／非产品照片”，不复制 logo、商品照片、真实笔形、纹理、颜色或比例。

## Task 2: 建立 Phase 593 CuratedEntityPack 与 fail-closed 发布 wrapper

- **Files:** `scripts/data/phase593-pineider-avatar-anniversary-mini.ts`、`scripts/apply-phase593-pineider-avatar-anniversary-mini-content.ts`。
- 从 Phase 592 brand pack 继承 canonical Pineider，只新增 brand refresh、Anniversary 与 Avatar UR Mini 三包；不得重放或改写十一条既有 Pineider model pack。
- 两个型号分别建立唯一实体、slug、spec、primary media、`made_by` 与品牌 `reverse`；所有事实进入 exact scope、field evidence、timeline 和 resolved boundary conflicts，再通过现有 fact／language／media review 与 `publishEntity`。
- 写前拒绝任何非空 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`；校验 reviewer、realpath、regular-file、symlink／hard-link／inode、protected snapshot、client binding 与 migration 032。entity／slug／name／alias collision 全部 fail closed；十一条既有 Pineider model 的完整 digest 前后不变；完整三包 replay 必须全部 `noop`。

## Task 3: 在 Phase 592 后继 owned checkpoint 执行定向与全量离线验收

- **File:** `tests/content/phase593-pineider-avatar-anniversary-mini.test.ts`；checkpoint／evidence 只保留在本 quick 本地，不提交。
- 先 snapshot `data/fpkg.db` 与 Phase 592 source family，只用 `copyCheckpointedCatalogToDisposableCopy` 创建本批 owned copy；所有 migrate、apply、query、audit、build 和 readback 仅指向新 copy 或临时后继 copy。
- 定向测试覆盖四类 identity collision、三个 remote selector、source／real family 不变、baseline＋2、Pineider 11→13、两组 child SKU、两款的尺寸／尖幅／颜色／饰件／上墨隔离、唯一关系、四类 current-hash approved review、首次发布与 replay noop。
- 运行 targeted test、TypeScript、精确 Biome、xmllint、八路径 diff-check、SQLite integrity／foreign key、readiness、entity quality、library contract、public media、production build，以及品牌页、两个型号页、两张 SVG 的本地 HTTP readback。
- 实现提交只允许精确暂存三篇 research、两张 SVG、data pack、wrapper 和定向测试八个文件。PLAN／SUMMARY／STATE 单独文档提交；所有其他 research、`.next-phase*`、checkpoint／evidence 与受保护 Montblanc quick 均不得暂存。

## Completion boundary

本 quick 只证明 Avatar Anniversary 与 Avatar UR Mini 在 Phase 593 offline candidate 上完成。它不代表 full corpus、真实本地迁移、真人全页面遍历、Turso 同步、生产部署或线上复查完成；大 goal 必须继续 active。
