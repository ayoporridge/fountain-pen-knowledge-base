# Phase 480 Summary

## 交付对象

本批更新三个已有 pen 实体，没有新建颜色、代际或相邻型号重复记录：

- Diplomat Excellence A2（`diplomat-excellence-a2`）；
- Nahvalur Schuylkill（原 Narwhal，`nahvalur-schuylkill`）；
- Delike Element（`delike-element`）。

正文分别保留 A2 的 Soft Sliding Click 按压帽、黄铜 Lapis 锚点、钢尖/14K 前段和 A+ 螺纹帽边界；Schuylkill 的 2020 Philadelphia Pen Show 首发窗口、专属树脂、差动活塞、墨窗、No.6 尖和 Narwhal/Nahvalur 过渡刻字；Element 的无夹实心黄铜、旋帽后插、converter 接口、重心与 Alpha/Kaweco 相邻边界。示意图复用既有 factual SVG，不冒充产品照片。

## 验证证据

- 定向测试 `tests/content/phase480-diplomat-a2-nahvalur-schuylkill-delike-element-depth.test.ts` 通过；覆盖 owned checkpoint、远程数据库拒绝、exact identity、品牌关系、正文/来源阈值、媒体、四项当前审核、publication gate、replay noop 与真实 DB 快照保护。
- 持久 apply：三项均 `published`；随后 replay：三项均 `noop`。
- 最终实体、正文、approved references、primary media 与 publication hash：
  - Diplomat Excellence A2：SQL 正文 2,843 字符、10 个 approved references、1 个 primary media，`sha256:v3:92d752223c435e327ef9c078ff057a873b30ac60e096ed04aea9e695ab28e774`；
  - Nahvalur Schuylkill：SQL 正文 2,865 字符、11 个 approved references、1 个 primary media，`sha256:v3:1f8de2eb9cd2109fc75990fb636140458f3f2be5f105e0912f68be3fd0f268e4`；
  - Delike Element：SQL 正文 2,862 字符、8 个 approved references、1 个 primary media，`sha256:v3:cb286d60d302cb72abf0c8704842db90a8f5d1422f212078cc4ac01901529891`。
- library contract：sources 2,788；sourceItems 4,553；claims 4,636；citations 11,816；stories 718；events 992；diagrams 9；media 986；community 2；exhibits 6；externalIds 61；aliases 2,406；commonsMedia 4，检查通过。
- 质量审计（同一 owned migrated copy）：entities 690，active 668，retiredExcluded 22，duplicateGroups 0，suspiciousPenArticles 0，thinEntities 0，brokenLinks 0；content_ready 668，published 668，public_entities 668，published_blockers 0，public_blockers 0，backlog 22。
- 覆盖审计：brands 119（ready 115、gap 4），pens 571（ready 553、starter 2、gap 16）；这些是全站 raw inventory 的既有缺口，本批没有新增 gap，覆盖脚本仍按既有规则报告非零缺口。
- SQLite：`integrity_check = ok`；`foreign_key_check` 无行。
- 全量 TypeScript 检查仍只有仓库原有 3 个基线错误（phase346 两个 TS7022、Turso sync 测试缺 NODE_ENV）；本批未新增错误。
- 真实 `data/fpkg.db` 未写入，apply 前后目录快照一致。

## 未完成范围

全量内容修复仍未完成；raw inventory 缺口、其他低信息量页面、真实资料库正式迁移、公开页面真人遍历、生产部署与线上逐条复查，均待后续批次和最终 ship 阶段。
