# Quick 260804-iz2：继续全量内容修复（Phase 487）

## 目标

在不重复建立实体、不触碰真实 `data/fpkg.db` 的前提下，深化下一批已有但信息量偏低的型号页：TWSBI VAC700R、Noodler's Nib Creaper、Jinhao 9019 Dadao。每个型号必须沿用现有 canonical entity，补齐来源化中文正文、规格与版本差异、使用维护、选购边界、主图、品牌关系、反向品牌导航和 v3 审核—发布状态。

## 明确范围

- TWSBI VAC700R：`16So7O06Q6K1` / `twsbi-vac700r`
- Noodler's Nib Creaper：`dLplUlM5weWq` / `noodlers-nib-creaper`
- Jinhao 9019 Dadao：`phase90-pen-jinhao-9019` / `jinhao-9019-dadao`
- 资料正文：
  - `.planning/content-research/twsbi-vac700r-phase487.md`
  - `.planning/content-research/noodlers-nib-creaper-phase487.md`
  - `.planning/content-research/jinhao-9019-phase487.md`
- 应用、数据包与定向回归：对应 `scripts/apply-phase487-*`、`scripts/data/phase487-*`、`tests/content/phase487-*`。

## 执行与保护

1. 先确认三者均为已有实体，并复用既有 Phase 70、214、90 base pack；禁止重复建实体。
2. 资料优先使用品牌官网、产品页、可靠零售商、专业评测与钢笔资料站；研究文件记录来源分组和事实边界。
3. 试写仅允许进入本 quick 目录下的 owned checkpoint copy；应用脚本拒绝继承 Turso/远程数据库环境，并验证 032 taxonomy identity migration、非 symlink、数据库 inode 和受保护资料库快照。
4. 发布必须经过 `recordEntityContentReview` 的 fact/language/media 三项批准，再调用 `publishEntity`；不得直接更新 `entity_publications` 为 published。
5. 重放必须返回 noop，且真实资料库快照始终不变。暂不进行 Turso 远程迁移、部署或线上复查。

## 验证清单

- Phase 487 定向测试：内容长度、独立来源组、远程环境拒绝、身份/类型/slug、正文、引用、主图、maker/reverse 关系、四类审核、v3 publication hash、幂等重放和真实库快照。
- checkpoint：`PRAGMA integrity_check`、外键检查、library contract、全库 entity quality audit。
- 工具检查：定向 Biome、全量 TypeScript（记录既有基线错误）、`git diff --check`。
- 提交前只暂存本批 3 个 research 文件、应用脚本、data pack、定向测试及本 PLAN/SUMMARY；保留其他 agent 的 research、`.next-phase*`、checkpoint 和受保护 Montblanc quick 目录。

## 未包含在本 quick

这只是全量 goal 的一个批次，不代表所有品牌/型号、正式远程迁移、真人遍历、部署或线上逐条复查已经完成；后续仍须按库存和质量审计继续处理未覆盖内容。
