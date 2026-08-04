# Phase 478 Summary

## 交付对象

本批更新三个已有实体，没有新建重复型号：

- Faber-Castell Grip 2011（官方 140900 Silver M）；
- Faber-Castell HEXO（官方 150540 Blue M）；
- KACO SKY 百锋第一代（2016 发布窗口）。

Grip 正文保留三角握位、软点、M 不锈钢尖和 C/C 版本边界；HEXO 正文保留六角铝杆、150540 M 尖、颜色/SKU 边界；SKY 正文保留 PC、EF 不锈钢明尖、欧规墨囊/吸墨器，并将 SKY II 的 Makrolon/Schmidt 尖作为独立代际。

## 验证证据

- 定向测试：`tests/content/phase478-faber-castell-grip-hexo-kaco-sky-depth.test.ts` 通过；覆盖 owned checkpoint、远程数据库拒绝、身份/品牌关系、来源/正文阈值、媒体、四项当前审核、publication gate、replay noop 与真实 DB 快照保护。
- 最终持久 apply：三项均 `published`；随后 replay 三项均 `noop`。
- 最终正文与 hash：
  - Grip：2,835 字符，9 个 approved references，1 个 primary media，`sha256:v3:a1eb0a938a9a06fe03aa983351c7ddb9b0cb2073ad87d0bd2b0f140866468608`；
  - HEXO：2,823 字符，9 个 approved references，1 个 primary media，`sha256:v3:2de0d510945d469f19db91d9db36d3198623c75cf14884146430cbde583d1af0`；
  - SKY：3,087 字符，13 个 approved references，1 个 primary media，`sha256:v3:40a7552dcfdafd0b46566cd59d86d5c2dcc6d187a8b674bcd693150dfd06d693`。
- library contract：sources 2,762；sourceItems 4,520；claims 4,598；citations 11,730；stories 718；events 986；diagrams 9；media 986；community 2；exhibits 6；externalIds 61；aliases 2,405；commonsMedia 4，检查通过。
- 质量审计（同一 owned migrated copy）：entities 690，active 668，retiredExcluded 22，duplicateGroups 0，suspiciousPenArticles 0，thinEntities 0，brokenLinks 0；content_ready 668，published 668，public_entities 668，published_blockers 0，public_blockers 0，backlog 22。
- 覆盖审计：brands 119（ready 115、gap 4），pens 571（ready 553、starter 2、gap 16）；总 published/public 仍为 668，无发布阻塞。
- SQLite：`integrity_check = ok`；`foreign_key_check` 无行。
- 全量 TypeScript 检查仍只有仓库原有 3 个基线错误，Phase 478 未新增错误。
- 真实 `data/fpkg.db` 未写入，apply 前后快照一致。

## 未完成范围

全量内容修复仍未完成；真实资料库正式迁移、公开页面真人遍历、生产部署与线上逐条复查仍待后续批次和最终 ship 阶段。
