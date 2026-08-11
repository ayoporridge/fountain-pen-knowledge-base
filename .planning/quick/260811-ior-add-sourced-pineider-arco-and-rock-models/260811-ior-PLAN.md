---
quick_id: 260811-ior
status: complete
date: 2026-08-11
---

# Add sourced Pineider Arco and Rock model packages

在 Phase 587 owned candidate 的下一份 owned copy 上新增 Pineider Arco 与 Rock 两个重要产品线；复用现有 Pineider 品牌实体和 Phase 428 品牌深度包，不访问 Turso，不写 `data/fpkg.db`，不扩建通用验收基础设施。

## Task 1: 固化身份、来源和自然中文正文

- **Files:** `.planning/content-research/pineider-{brand,arco,rock}-phase588.md`、`public/images/library/site-original/phase588/pineider/*.svg`
- **Action:** 以 Pineider 当前官方 collection／商品页为主，分别用 The Pencilcase Blog、Pen Chalet 的具名评测或商品档案交叉；写清 Arco 当前 family 与 2019 Oak 样本边界，以及 Rock 当前 piston release 与官方 gift guide 旧 converter 说法的冲突。
- **Verify:** 两个型号正文各不少于 2,000 Unicode 字符；品牌正文链接 Avatar UR、Arco、Rock；两张 1600×900 原创示意图互不重复且明示非产品照片。

## Task 2: 建立可重放审核—发布包

- **Files:** `scripts/data/phase588-pineider-arco-rock.ts`、`scripts/apply-phase588-pineider-arco-rock-content.ts`
- **Action:** 新建 `pineider-arco-fountain-pen` 与 `pineider-rock-fountain-pen`，补唯一 `made_by` 与品牌 reverse；品牌包升级为 Phase 588 导航正文；全部经 fact/language/media review 与 `publishEntity`。
- **Verify:** entity／slug／name／alias 无冲突；Rock fill-system 冲突显式解决，旧 converter 证据不进入 current model spec；首次 apply 为品牌 +2 型号发布，重放全部 noop。

## Task 3: 定向和全局离线验收

- **Files:** `tests/content/phase588-pineider-arco-rock.test.ts`、本 quick 未提交 checkpoint/evidence、SUMMARY/STATE。
- **Action:** 在 Phase 587 后继 owned checkpoint 上执行定向测试、TypeScript、Biome、diff、SQLite、readiness、media、library contract、production build 与本地页面读回。
- **Verify:** Pineider 公开型号从 1 增到 3；current public 增加 2、blocker 0、主图重复组 0；真实库 hash 不变；只提交本批明确拥有的源码和计划文档。
- **Done:** 内容源码已提交为 `97f9da15`；Phase 588 owned candidate 完成首次 apply、全 noop 重放及全部离线验收，checkpoint／evidence 保留在本 quick 且不提交，full corpus goal 继续 active。
