# Quick 260804-jg0：继续全量内容修复（Phase 488）

## 目标

在不重复建立实体、不触碰真实 `data/fpkg.db` 的前提下，深化三条已有但信息量偏低的型号页：Platinum Izumo PIZ-150000PW、HongDian 1843 Voyager、Caran d’Ache Léman。每页沿用既有 canonical entity，补齐来源化中文正文、规格与版本差异、使用维护、选购边界、主图、品牌关系、反向品牌导航和 v3 审核—发布状态。

## 明确范围

- Platinum Izumo PIZ-150000PW：`phase311-platinum-izumo-piz-150000pw` / `platinum-izumo-piz-150000pw`
- HongDian 1843 Voyager：`_tLM8vJHVGyr` / `弘典-hongdian-远航者`
- Caran d’Ache Léman：`phase139-caran-dache-leman` / `caran-dache-leman`
- 资料正文：
  - `.planning/content-research/platinum-izumo-piz-150000pw-phase488.md`
  - `.planning/content-research/hongdian-voyager-phase488.md`
  - `.planning/content-research/caran-dache-leman-phase488.md`
- 应用、数据包与定向回归：对应 `scripts/apply-phase488-*`、`scripts/data/phase488-*`、`tests/content/phase488-*`。

## 执行与保护

1. 先确认三者均为已有实体，复用 Phase 311、205、139 base pack；不新建重复实体。
2. Platinum 与 Caran d’Ache 以官方产品页为规格锚点；HongDian 当前官网没有 1843 完整规格，因此保留 Etsy、TSAMSA、MySKU 等独立来源的字段冲突，不把新款页面回填到旧型号。
3. 试写仅进入本 quick 目录下的 owned checkpoint copy；应用脚本拒绝继承 Turso／远程数据库环境，并验证 032 taxonomy identity migration、非 symlink、数据库 inode 和受保护资料库快照。
4. 发布经过 `recordEntityContentReview` 的 fact/language/media 三项批准，再调用 `publishEntity`；不直接更新 `entity_publications` 为 published。
5. 重放必须返回 noop，真实资料库快照始终不变。暂不进行 Turso 远程迁移、部署或线上复查。

## 验证清单

- Phase 488 定向测试：内容长度、独立来源组、远程环境拒绝、身份／类型／slug、正文、引用、主图、maker/reverse 关系、四类审核、v3 publication hash、幂等重放和真实库快照。
- checkpoint：`PRAGMA integrity_check`、外键检查、library contract、全库 entity quality audit。
- 工具检查：定向 Biome、全量 TypeScript（记录既有基线错误）、`git diff --check`。
- 提交前只暂存本批 3 个 research 文件、应用脚本、data pack、定向测试及本 PLAN/SUMMARY；保留其他 agent 的 research、`.next-phase*`、checkpoint 和受保护 Montblanc quick 目录。

## 未包含在本 quick

这只是全量 goal 的一个批次，不代表所有品牌／型号、正式远程迁移、真人遍历、部署或线上逐条复查已经完成；后续仍须按库存和质量审计继续处理未覆盖内容。
