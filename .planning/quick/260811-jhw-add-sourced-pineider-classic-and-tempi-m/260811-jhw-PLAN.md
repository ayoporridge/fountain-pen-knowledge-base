---
quick_id: 260811-jhw
status: complete
date: 2026-08-11
---

# Add sourced Pineider Classic Palladium and Tempi Moderni model packages

在 Phase 588 owned candidate 的下一份 owned copy 上补齐 Pineider 当前官网明确列出的 Classic Palladium PP5801／779 与 Tempi Moderni PP6001／614；复用 canonical Pineider 品牌，不访问 Turso，不写 `data/fpkg.db`，不扩建通用验收基础设施。

## Task 1: 固化 exact SKU、来源边界与自然中文正文

- **Files:** `.planning/content-research/pineider-{brand,classic-palladium,tempi-moderni}-phase589.md`、`public/images/library/site-original/phase589/pineider/*.svg`
- **Action:** 以 Pineider 当前商品／collection／2023 发布资料为 primary，分别用 Fahrney's、Pen Savings、Pens.it 的具名商品档案交叉；把 Classic Palladium 当前官网 piston 与 Classic Rose Gold 零售档案 cartridge/converter 明确拆为 sibling 冲突，不合并成二选一规格。
- **Verify:** 两个型号正文各不少于 2,000 Unicode 字符；品牌正文链接 Avatar UR、Arco、Rock、Classic Palladium、Tempi Moderni；两张 1600×900 原创事实图互不重复且明示非产品照片。

## Task 2: 建立可重放审核—发布包

- **Files:** `scripts/data/phase589-pineider-classic-tempi-moderni.ts`、`scripts/apply-phase589-pineider-classic-tempi-moderni-content.ts`
- **Action:** 新建 `pineider-classic-palladium-pp5801-779` 与 `pineider-tempi-moderni-pp6001-614`，补唯一 `made_by` 与品牌 reverse；品牌包升级为 Phase 589 导航正文；全部经 fact／language／media review 与 `publishEntity`。
- **Verify:** entity／slug／name／alias 无冲突；Classic 上墨冲突显式解决；首次 apply 为品牌 +2 型号发布，重放全部 noop，既有 Pineider 三个公开型号不变。

## Task 3: 定向与全局离线验收

- **Files:** `tests/content/phase589-pineider-classic-tempi-moderni.test.ts`、本 quick 未提交 checkpoint/evidence、SUMMARY/STATE。
- **Action:** 在 Phase 588 后继 owned checkpoint 上执行定向测试、TypeScript、精确格式、diff、SQLite、readiness、media、entity quality、library contract、production build 与本地页面读回。
- **Verify:** Pineider 公开型号从 3 增到 5；current public 增加 2、blocker 0、主图重复组 0；真实库 hash 不变；只提交本批明确拥有的源码和计划文档。
- **Done:** 内容源码已提交为 `fa692811`；Phase 589 owned candidate 完成发布门重放、全局离线审计、图片目检、生产构建与本地页面读回。checkpoint／evidence 只在本 quick 本地保留，full corpus goal 继续 active。
