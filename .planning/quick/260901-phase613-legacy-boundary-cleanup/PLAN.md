# Phase 613 — legacy public-boundary cleanup

## Objective

在不触碰真实 `data/fpkg.db`、Turso 或生产环境的前提下，修复 Phase 612
checkpoint 的全量 public-boundary 历史遗留项：品牌实体误挂 `model_specs`、
公开型号页暴露无日期的 `price_range/status`、以及缺失的规范反向关系。
所有发布状态变化必须通过 `recordEntityContentReview` 与 `publishEntity`，不
绕过 publication guard。

## Owned inputs and outputs

- 输入：`.planning/quick/260813-x80-phase611-33-family-owned-checkpoint-turs/checkpoint-final/catalog.db`
- 输出：本目录下新的 `checkpoint-final/catalog.db`、审计证据、定向测试和
  `scripts/apply-phase613-legacy-boundary-cleanup.ts`。
- 保护：真实 `data/fpkg.db`、Turso、其他 agent 的 research/quick 文件和
  `.next-phase*` 目录。只选择性暂存本计划明确拥有的文件。

## Tasks and verification

1. 复制并锁定 owned checkpoint；检查源/真实数据库 SHA、无非空 WAL/SHM、
   migration 032 已安装，拒绝远程 selector。
2. 预检并固定目标清单：两个非 pen 品牌的误挂规格、所有 active/public pen
   specs 中的 `price_range/status` 计数（当前 Phase 612 checkpoint 实测 508 条含快照字段；
   不沿用旧审计中的 398 条）、七个已知
   内部 placeholder 字段、缺失 canonical `rev-<id>` 反向行（预期 42）。
3. 在单个或有界 caller-owned write transaction 中：删除两个品牌规格及其
   evidence/citation 依赖；清空 pen `price_range/status`；补齐 `rev-<id>`
   反向行；随后对受影响的公开实体重新记录 fact/language/media review 并
   用 `publishEntity` 发布。不得直接更新 `entity_publications.status`。
4. 重放同一脚本必须 noop；checkpoint 关闭时执行 WAL truncate/busy 检查并
   确认无 sidecar。
5. 验证：对 owned checkpoint 运行与 `check-public-boundary --legacy` 同口径的
   direct SQL boundary 检查（非 pen specs、公开型号快照字段、canonical reverse
   行均为 0）；再做 integrity/FK、entity-quality、library-contract、public-media、
   TypeScript、定向测试、Biome/diff/build 和公开页面 readback。记录 23 个已知
   retired lineage 仍是单独 backlog，不将其误报为本清理已解决。
6. 只提交本 Phase 的脚本、测试、研究/计划与必要证据；提交前再次检查
   `git status --short` 和 staged diff。

## Success criteria

- 候选 checkpoint 的 legacy boundary findings 为 0（23 个 retired lineage 仅
  保留为非公开历史）；真实 DB/Turso SHA 完全不变。
- 508 个公开 pen 规格不再暴露无日期 price/status；两个品牌不再拥有
  `model_specs`；42 个缺失反向关系全部存在且可回放。
- 所有被规格修改影响的公开实体仍是 `published`、readiness 无 blocker，且
  publication review 记录与当前 hash 一致。
