# Phase 578 — deepen Wancher Tsuikin Kanhizakura

## Objective

在不连接 Turso、且绝不写入真实 `data/fpkg.db` 的前提下，深化已经存在的
`phase388-pen-wancher-tsuikin-kanhizakura` canonical 型号。合并 Phase 388 的
工艺、植物、护理与身份边界资料和 Phase 519 的最新官方 product JSON 记录，
不新造重复实体、不改变受保护的其他工作。

## Owned files

- `scripts/data/phase578-wancher-tsuikin-kanhizakura-depth.ts`
- `scripts/apply-phase578-wancher-tsuikin-kanhizakura-depth.ts`
- `tests/content/phase578-wancher-tsuikin-kanhizakura-depth.test.ts`
- `.planning/content-research/wancher-tsuikin-kanhizakura-phase578.md`
- 本目录中的 PLAN、SUMMARY 和验证日志；checkpoint copy 不纳入提交

## Verification contract

1. 只把 Phase 577 owned checkpoint 复制到本目录的 caller-owned checkpoint root。
2. wrapper 必须拒绝非空 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、
   `FPKG_DATABASE_URL`，并验证数据库路径、migration 032 与 protected snapshot。
3. 先在 owned copy 发布，再重放为 noop；审核必须走
   `recordEntityContentReview` 与 `publishEntity`。
4. 证明型号身份、Wancher `made_by`/反向导航唯一、正文和来源/变体/媒体有效，
   SQLite integrity/foreign key、定向测试、TypeScript、格式和 diff 检查通过。
5. 真实 `data/fpkg.db` 的 SHA-256 前后相同；不把本批或单一 Phase 当作全量 goal 完成。

## Out of scope

Turso 正式迁移、生产部署、线上复查和剩余品牌/型号缺口继续留在总 goal 的后续工作中。
