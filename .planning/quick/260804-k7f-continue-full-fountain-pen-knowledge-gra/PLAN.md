# Quick 260804-k7f：继续全量内容修复（Phase 490）

## 目标

在不重复建立实体、不触碰真实 `data/fpkg.db` 的前提下，深化三条已有但信息量偏低的 TWSBI 型号页：Diamond 580、Diamond 580ALR、GO。沿用 canonical identity，补齐来源化中文正文、规格与版本差异、上墨／维护、选购边界、主图、品牌关系、反向品牌导航和 v3 审核—发布状态。

## 明确范围

- Diamond 580：`V9IvGskSYan0` / `twsbi-diamond-580`
- Diamond 580ALR：`phase141-twsbi-diamond-580alr` / `twsbi-diamond-580alr`
- TWSBI GO：`LRlvQscC9w-i` / `twsbi-go`
- 资料正文：
  - `.planning/content-research/twsbi-diamond-580-phase490.md`
  - `.planning/content-research/twsbi-diamond-580alr-phase490.md`
  - `.planning/content-research/twsbi-go-phase490.md`
- 应用、数据包与定向回归：对应 `scripts/apply-phase490-*`、`scripts/data/phase490-*`、`tests/content/phase490-*`。

## 执行与保护

1. 复用 Phase 141 的 Diamond 580／580ALR 与 Phase 70 的 GO 基础包，不创建 duplicate entity，也不重做 Phase 487 的 VAC700R。
2. Diamond 580 以官方商品页、替换尖和内帽教程为锚点；580ALR 以官方 Nickel Gray／Prussian Blue 与两份独立评测交叉核对铝件和表面；GO 以官方 Clear、TWSBI Japan、Goulet 和独立评测交叉核对弹簧活塞与容量口径。
3. 试写仅进入本 quick 目录下的 owned checkpoint copy；应用脚本拒绝继承 Turso／远程数据库环境，并验证 032 taxonomy identity migration、非 symlink、数据库 inode 和受保护资料库快照。
4. 发布经过 `recordEntityContentReview` 的 fact/language/media 三项批准，再调用 `publishEntity`；不直接更新 `entity_publications` 为 published。
5. 重放必须返回 noop，真实资料库快照始终不变。暂不进行 Turso 远程迁移、部署或线上复查。

## 验证清单

- Phase 490 定向测试：正文长度、独立来源组、远程环境拒绝、身份／类型／slug、正文、引用、主图、maker/reverse 关系、四类审核、v3 publication hash、幂等重放和真实库快照。
- 持久 checkpoint：`PRAGMA integrity_check`、外键检查、library contract、全库 entity quality audit。
- 工具检查：定向 Biome、全量 TypeScript（记录既有基线错误）、`git diff --check`。
- 提交前只暂存本批 3 个 research 文件、应用脚本、data pack、定向测试及本 PLAN/SUMMARY；保留其他 agent 的 research、`.next-phase*`、checkpoint 和受保护 Montblanc quick 目录。

## 未包含在本 quick

这只是全量 goal 的一个批次，不代表所有品牌／型号、正式远程迁移、真人遍历、部署或线上逐条复查已经完成；后续仍须按库存和质量审计继续处理未覆盖内容。
