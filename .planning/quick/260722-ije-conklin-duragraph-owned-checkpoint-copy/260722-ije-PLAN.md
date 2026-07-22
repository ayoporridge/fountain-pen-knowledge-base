---
quick_id: 260722-ije
status: in_progress
date: 2026-07-22
description: 补齐并发布 Conklin Duragraph 当代型号内容包，限定当前家族事实与历史评测样本边界，在 owned checkpoint copy 定向验证并原子提交
---

# Quick Task 260722-ije: Conklin Duragraph

## Task 1: 建立来源化内容包

- **files:** `.planning/content-research/conklin-duragraph-phase136.md`, `public/images/library/site-original/phase136/conklin/conklin-duragraph.svg`, `scripts/data/phase136-conklin-duragraph.ts`
- **action:** 以 Conklin 当前 Duragraph collection/spec 页面为 current scope，以 2018 Gentleman Stationer 与 2014 Well-Appointed Desk 的具体 Cracked Ice 样笔为 review scope，写自然中文正文、规格、维护、选购、版本边界和本站原创事实图。历史 Nozac/Glider 与现代 Duragraph 不共享规格。
- **verify:** pack validation 通过；正文不少于 2,000 个 Unicode 字符；current specs 不吸收旧评测的重量、笔尖表现或售价。
- **done:** pack 具备 official primary 与独立 professional secondary 来源组，且没有把当前颜色清单拆成无证据独立实体。

## Task 2: 实现受保护的新增与发布链路

- **files:** `scripts/apply-phase136-conklin-duragraph-content.ts`
- **action:** 只允许 verified repo pair 与 caller-owned、非 symlink/非 hardlink checkpoint DB；在 Phase 99 Conklin baseline 上新增 Duragraph 和精确 made_by/reverse；保护 Conklin brand 非拓扑 payload、Nozac 与 Glider 全 payload；对 brand 与新 pen 依次记录 fact/language/media review，再调用 `publishEntity`。
- **verify:** 首次结果为 `published`，重放为 `noop`，remote selection/真实库/硬链接/局部终态均 fail closed。
- **done:** public view 可见新型号，brand 只新增一个 reverse，所有 publication hash 当前且 contract v3。

## Task 3: 定向回归与原子提交

- **files:** `tests/content/phase136-conklin-duragraph.test.ts`, `.planning/STATE.md`, quick SUMMARY
- **action:** 在测试创建的 owned disposable checkpoint copy 上重放 Phase 99 后执行 Phase 136；验证正文、来源、scope、spec evidence、图片、拓扑、审核、noop/tamper 和真实 DB 快照不变。运行定向 test、TypeScript、Biome、XML/SVG 与 diff 检查。
- **verify:** 所有定向检查通过；提交前 `git status --short` 仅精确暂存本批文件，保护所有既有未跟踪 research、`.next-phase*` 与指定 quick 目录。
- **done:** 产品提交和 GSD docs 提交均原子完成；全量 goal 保持 active。
