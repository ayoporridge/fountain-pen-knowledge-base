# Phase 479 Summary

## 交付对象

本批更新三个已有 pen 实体，没有新建颜色、代际或相邻型号重复记录：

- Pelikan Twist P457（`pelikan-twist`）；
- Majohn Wancai 丸彩（`末匠-majohn-丸彩`）；
- Asvine V126（`asvine-v126`）。

正文分别保留 P457 的扭转三角握位、墨囊与 Calligraphy/rollerball 边界；Wancai 的短粗帖帽、直灌、O 形圈和树脂代际边界；V126 的真空杆、尾端止墨阀、清洗/携带动作与 P36/V200/Custom 823 对照边界。示意图继续复用既有 factual SVG，不冒充 exact-model 实拍。

## 验证证据

- 定向测试 `tests/content/phase479-pelikan-twist-majohn-wancai-asvine-v126-depth.test.ts` 通过；覆盖 owned checkpoint、远程数据库拒绝、身份/品牌关系、正文/来源阈值、媒体、四项当前审核、publication gate、replay noop 与真实 DB 快照保护。
- 持久 apply：三项均 `published`；随后 replay：三项均 `noop`。
- 最终实体、正文、references、primary media 与 publication hash：
  - Pelikan Twist：SQL 正文 2,943 字符、11 个 approved references、1 个 primary media，`sha256:v3:79fcc105d04f229f15a91a5cf2b9a526978db7eb969161ff1faf902c64db70aa`；
  - Majohn Wancai：SQL 正文 2,806 字符、9 个 approved references、1 个 primary media，`sha256:v3:917fb03518956f8c4e74bb6ce0d3a2921e469ab4b5b43f5b1bf99201c82911f6`；
  - Asvine V126：SQL 正文 3,029 字符、8 个 approved references、1 个 primary media，`sha256:v3:585691e0f37a2b78f53887b4f7fc5cea6245bab7d2d1821fb72c2fe0e8681848`。
- library contract：sources 2,777；sourceItems 4,539；claims 4,618；citations 11,779；stories 718；events 989；diagrams 9；media 986；community 2；exhibits 6；externalIds 61；aliases 2,405；commonsMedia 4，检查通过。
- 质量审计（同一 owned migrated copy）：entities 690，active 668，retiredExcluded 22，duplicateGroups 0，suspiciousPenArticles 0，thinEntities 0，brokenLinks 0；content_ready 668，published 668，public_entities 668，published_blockers 0，public_blockers 0，backlog 22。
- 覆盖审计：brands 119（ready 115、gap 4），pens 571（ready 553、starter 2、gap 16）；全站现状仍有缺口，覆盖脚本按既有规则返回非零，不将其误报为本批失败。
- SQLite：`integrity_check = ok`；`foreign_key_check` 无行。
- 全量 TypeScript 检查仍只有仓库原有 3 个基线错误（phase346 两个 TS7022、Turso sync 测试缺 NODE_ENV）；本批未新增错误。
- 真实 `data/fpkg.db` 未写入，apply 前后目录快照一致。

## 未完成范围

全量内容修复仍未完成；未覆盖的品牌/型号缺口、正式迁移到真实资料库、公开页面真人遍历、生产部署与线上逐条复查，均待后续批次和最终 ship 阶段。
