---
quick_id: 260722-itm
status: complete
date: 2026-07-22
description: 批量补齐并发布 Conklin 当代 All American、Mark Twain Crescent Filler、Endura Deco Crest、1898 Misto 四个型号，共享 owned checkpoint、品牌拓扑与定向回归
---

# Quick Task 260722-itm: Conklin 当代四型号批次

## Task 1: 四个来源化内容包

- **files:** 四份 `.planning/content-research/conklin-*-phase137.md`、四张 `public/images/library/site-original/phase137/conklin/*.svg`、`scripts/data/phase137-conklin-contemporary-batch.ts`
- **action:** 分别以 Conklin 当前 family/exact product 页面建立 All American、Mark Twain Crescent Filler、Endura Deco Crest、1898 Misto canonical pack；每个型号绑定一个独立专业评测 scope，写自然中文正文、规格、历史、版本、维护、选购与图片说明。颜色只作 variants；历史同名产品、ballpoint/rollerball、special edition 不混入。
- **verify:** 每页正文不少于 2,000 Unicode 字符；每包至少含官方 primary 与独立 professional secondary；官方疑似包装尺寸或明显错误字段以 rejected evidence 留存，不进入 current stable specs。
- **done:** 四个 pack 均可独立验证，身份、SKU、材料与评测样本边界明确。

## Task 2: 一个批量发布脚本

- **files:** `scripts/apply-phase137-conklin-contemporary-batch-content.ts`
- **action:** 在 Phase 99 + Phase 136 已发布基线上一次新增四个 pen 与精确 made_by/reverse；保护 Conklin brand 非拓扑 payload、Nozac、Glider、Duragraph 全 payload；统一执行 collision preflight、fact/language/media reviews 与 `publishEntity`。
- **verify:** 首次四项均 `published`，重放四项均 `noop`；只允许 verified repo pair 和 caller-owned non-link DB；remote、symlink、hardlink、partial terminal 均 fail closed。
- **done:** 品牌 reverse 精确增加四项，旧实体 digest 不变，五个当代/历史型号均保持 current publication hash。

## Task 3: 一个 owned checkpoint 定向回归与原子提交

- **files:** `tests/content/phase137-conklin-contemporary-batch.test.ts`、quick SUMMARY、`.planning/STATE.md`
- **action:** 测试在单一 owned disposable copy 中重放 Phase 99、Phase 136 后应用本批，逐包验证正文、source group、scopes、variants、rejected evidence、media、topology、review、noop/tamper 与真实 DB 快照；运行 TypeScript、Biome、SVG XML、diff 检查。
- **verify:** 定向 test、静态检查全部通过；真实 DB SHA-256 不变；提交前只精确暂存本批文件。
- **done:** 一次产品提交覆盖四个型号，一次 docs 提交记录批次；full corpus goal 保持 active。

## Result

- 产品提交：`6386940 feat(content): publish four contemporary Conklin models`
- 定向回归：`pnpm exec tsx --test tests/content/phase137-conklin-contemporary-batch.test.ts`，1/1 PASS；首次四项 `published`，重放四项 `noop`。
- 静态检查：TypeScript、Biome（纳入配置的测试文件）、SVG XML、`git diff --check` 全部通过。
- 数据库隔离：只在 caller-owned disposable checkpoint copy 写入；真实 `data/fpkg.db` SHA-256 保持 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`。
