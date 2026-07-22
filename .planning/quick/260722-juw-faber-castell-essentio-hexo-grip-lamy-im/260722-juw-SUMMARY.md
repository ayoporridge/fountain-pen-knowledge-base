---
quick_id: 260722-juw
status: complete
date: 2026-07-22
product_commit: c2f5d85
---

# 德语区与瑞士九型号批次总结

一次补齐九个现行型号：Faber-Castell Essentio、HEXO、Grip 2011，LAMY imporium、abc，Kaweco Supra、DIA2，Schneider Ray 与 Caran d’Ache Léman。连同三个既有品牌更新、Schneider 品牌升级和新建 Caran d’Ache 品牌，本批共形成十四个可重放发布包。九个型号页均有超过 2,000 Unicode 字符的自然中文正文、官方 primary、独立 professional secondary、规格与版本边界、维护和选购建议，以及明确标注为非产品照片的本站原创事实图。

## 关键身份与证据决策

- Faber-Castell 三款分别锚定 Essentio 148420、HEXO 150540、Grip 2011 140900，不用不同材质或地区 SKU 的重量互相覆盖。
- LAMY imporium 以 Black-Gold 4027926 为 exact SKU，abc 以 Black L09BKA 为当前锚点；颜色和地区配置保留为 variants／scope，不拆成重复实体。
- Kaweco Supra Black F 11000107 与 DIA2 Chrome F 10000557 分开；Supra 的可拆中段属于核心结构，不与 Sport 系列混名。
- Schneider Ray 以右手 M+ 168213 为基准，左手 L 168496 的握位与笔尖差异作为 replacement variant，不冒充同一配置。
- Caran d’Ache Léman 标准版与 Slim 明确分层：本页标准版采用 141 mm、14.8 mm、52 g，Slim Grand Bleu 的 10.6 mm、38 g 不混入。

## 发布与保护结果

Phase 139 只在一个 caller-owned checkpoint 内重放必要 prerequisites，然后按五个品牌组应用十四个内容包。新增九个 pen、一个 brand 及精确 `made_by`／reverse 关系；既有公开型号完整 digest 受保护。所有实体按当前 content hash 记录 fact、language、media review 后，通过既有 `publishEntity` 路径发布；终态重放为 noop，tamper 检查 fail closed。

## 验证

- Phase 139 定向测试：PASS 1/1（约 237 秒）
- TypeScript `--noEmit`：PASS
- Biome 定向检查：PASS（仓库配置覆盖 content test；data/apply scripts 由 TypeScript 与 diff 检查覆盖）
- 十一张 SVG XML：PASS
- cached diff：PASS
- 真实 DB SHA-256 保持 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`
- 产品提交：`c2f5d85 feat(content): publish German and Swiss current model batch`

该批次证明同证据结构的 8–15 型号批处理可以显著减少重复事务成本，但不代表 full corpus goal 完成。其余差集、正式迁移、全量自动检查、真人页面遍历、部署和线上复查仍未完成。
