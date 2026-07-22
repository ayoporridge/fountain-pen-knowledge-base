---
quick_id: 260722-juw
status: complete
date: 2026-07-22
description: 批量补齐德语区与瑞士九个现行型号：Faber-Castell Essentio、HEXO、Grip，LAMY imporium、abc，Kaweco Supra、Dia2，Schneider Ray 与 Caran d’Ache Léman
---

# Quick Task 260722-juw: 德语区与瑞士九型号批次

## Task 1: 官网与独立来源核验、身份边界

- **scope:** Faber-Castell Essentio、HEXO、Grip；LAMY imporium、abc；Kaweco Supra、Dia2；Schneider Ray；Caran d’Ache Léman。
- **action:** 逐项以当前品牌官网或官方目录确认 canonical 名称、材料、笔尖、供墨、尺寸、版本与当前状态，再用可靠专业评测或零售资料限定使用体验和样笔量测。确认前八项在既有品牌下无准确 sibling；Caran d’Ache 作为新品牌与 Léman 一并建立。
- **verify:** 不把普通颜色拆成实体，不把灵感年份写成上市年，不跨材质／SKU 套重量或图片；每个型号至少有 official primary 与独立 professional secondary，冲突字段留作 rejected/resolved evidence。

## Task 2: 九份型号正文、品牌正文、十四个 CuratedEntityPack 与原创事实图

- **action:** 为九个型号分别写不少于 2,000 Unicode 字符的自然中文正文，覆盖介绍、当前规格、历史与版本、维护、选购和验货；为既有但尚无发布内容包的 Schneider 与全新 Caran d’Ache 分别写品牌正文，并更新 Faber-Castell、LAMY、Kaweco 三个既有品牌包。十四个公开实体配置准确来源、claims、scopes、specs、variants、timeline；新增十一张明确标为非产品照片的 site-original SVG，三个既有品牌沿用已有图。
- **verify:** 所有 pack 通过 `validatePack`；品牌关系与 slug 无 collision；图片不重复、不冒充商品照片；搜索与 LLM 保持撤下。

## Task 3: 品牌分组发布、owned checkpoint 回归与精确提交

- **action:** 复用并更新 Faber-Castell、LAMY、Kaweco 已有 canonical 品牌内容包，原位升级既有 Schneider brand 并新增 Ray；新建 Caran d’Ache brand 与 Léman。保护旧公开型号完整 digest，并从 prerequisites 完成后的状态校验本批精确 reverse 增量；记录 fact/language/media review 后调用 `publishEntity`。
- **verify:** caller-owned checkpoint 首次十四项 published、重放 noop；remote、symlink、hardlink、collision、partial terminal 与 tamper fail closed；TypeScript、定向 test、Biome、SVG XML、diff 检查通过；真实 `data/fpkg.db` 快照不变。

## Completion Boundary

本批完成只核销九个真实缺口，不代表 305 条旧库存、P0/P1 扩容、正式迁移、全量页面遍历、部署或线上复查完成；full corpus goal 必须继续 active。
