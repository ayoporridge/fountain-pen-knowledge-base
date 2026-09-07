# Visconti Homo Sapiens Dark Crystal 本地迁移证据

日期：2026-09-07  
目标：把已核验的 Phase 549 Dark Crystal 深度正文与 Visconti 品牌导航，从 caller-owned checkpoint 正式提升到本地 `data/fpkg.db`；同时修正旧 factual SVG 与来源注释中把当前闭合方式写成 `Hook Safe` 的残留，统一为当前官方页的 `bayonet`。不新建实体、alias、关系或图片。

## 内容与身份

- canonical pen：`s49VISDARK` / `visconti-homo-sapiens-dark-crystal`
- canonical brand：`5BZDt2fQusMf` / `visconti`
- Dark Crystal 正文：3,855 Unicode chars；品牌正文：2,957 Unicode chars。
- 当前 source marker：`curated-content:phase549-visconti-dark-crystal-depth-v1:53058e21d8f95cacdd99dd29c5db2182c65694cf76c50d2dd8420ad11cb4cb17`
- 当前正文保留官方商品介绍的 `18kt ruthenium-plated Giotto nib` 与 characteristics 的 `Au 14kt (large)` 冲突，以及 `Over`、`EF/F/M/B/S`、`Double Reservoir Power Filler`、`bayonet`；没有把固定长度、直径或重量补进空字段。
- Dark Crystal 的 8 条 approved references、唯一 `made_by`（指向 Visconti）、primary factual SVG 与 model spec 均保留；reference/media 说明已不再把该页写成 `Hook Safe`。

## Owned checkpoint

- checkpoint：`.planning/quick/260907-f3s-visconti-dark-crystal-local-promotion/checkpoint/catalog.db`
- focused test：`pnpm exec tsx --test tests/content/phase549-visconti-dark-crystal-depth.test.ts` → 1/1 passed（约 61 秒）。测试验证远端 selector 拒绝、首次发布、完整 replay `noop`、身份/关系/媒体/审核与旧 `Hook Safe` 注释边界。
- checkpoint 最终 SHA-256：`fac34821b4cd738b45bf42b3045487900a4ea9bcba95945efee441ba2d781d83`；size `93,921,280` bytes；独立 regular file，空 WAL/SHM。
- checkpoint `PRAGMA integrity_check`：`ok`；`PRAGMA foreign_key_check`：空结果。
- checkpoint/readiness：inventory 929、active/public 906、published 906、published blockers 0、backlog 23；Dark Crystal 与 Visconti 均 `blocker_count=0`、`publishable=1`。
- checkpoint media dry-run：922/922 healthy，0 failed。

## Formal local migration

- 迁移前真实主库：SHA-256 `6dc8fd18d7f75afa43a93696b7ba33eb279472fcef0cc0ce82be0ab4c5f54597`；size `93,921,280`；inode `89306370`；主文件 mtimeNs `1788748577737691385`。
- 迁移前 WAL/SHM 内容：WAL 0 bytes、SHA `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`；SHM 32,768 bytes、SHA `fd4c9fda9cd3f9ae7c962b0ddf37232294d55580e1aa165aa06129b8549389eb`。
- rollback 资产：`formal-local/backup-before-main.db` 与迁移前主库 byte-identical（同 SHA），`PRAGMA integrity_check=ok`；另保留 `formal-local/backup-before.db` 的 SQLite logical backup（完整性为 `ok`，其物理页布局 SHA 不同）。
- 无真实库 open handle 后，以 `formal-local/new-catalog.db` 作同卷 atomic `mv` 替换 `data/fpkg.db`；未访问 Turso，也没有对线上库写入。
- 迁移后真实主库：SHA-256 `fac34821b4cd738b45bf42b3045487900a4ea9bcba95945efee441ba2d781d83`；size `93,921,280`；inode `89358221`；mtimeNs `1788750715684483780`。
- 迁移后 SQLite：`PRAGMA integrity_check=ok`，`PRAGMA foreign_key_check` 为空；WAL 仍 0 bytes，SHM 32,768 bytes，二者 SHA 与迁移前一致。
- 迁移后 publication：brand revision `506/506`、Dark Crystal revision `398/398`，两者 contract version `3`、status `published`；Dark Crystal content hash：`sha256:v3:2607a56d5a6be0e72df8e86c34a90b2c96fda0c4f476b0bf81d88d70be7b511f`；四类 current-hash review 均 `approved`。

## Formal local gates

通过：

- `check:data-contract`：276 article / 135 brand / 13 concept / 3 nib / 794 pen；
- `check:articles`：256 public articles；
- `check:public-boundary -- --all`：published blockers、list/per-id/aggregate/context/reverse diff 全为 0；
- `check:library`：4,031 sources、6,118 sourceItems、7,307 claims、17,491 citations、958 stories、1,320 events、1,228 media；
- `check:evidence-contract -- --all` 与 `check:publication-gate -- --all`：完整 migration、evidence、review、rollback、publication 矩阵通过；
- `audit:entity-quality --database-path data/fpkg.db`：929 entities，906 active，23 retired；duplicate/suspicious/thin/`made_by` blockers 全为 0；
- `audit:public-media`：922/922 healthy，0 failed，dry-run；
- `audit-readiness-v2`：inventory 929、content_ready/published/public 906、published/public blockers 0、backlog 23；`content_complete=false` 仅表示保留的 23 条 retired lineage，不将其伪装成可发布内容；
- targeted Biome、`tsc --noEmit --pretty false`、`git diff --check`：通过。

## Local production route readback

以显式 `FPKG_DATABASE_URL=file:/Users/xz/Documents/fountain-pen-graph/data/fpkg.db` 启动本地 production server，实际回读：

- `GET /pen/visconti-homo-sapiens-dark-crystal`：HTTP 200，97,351 bytes，SHA-256 `633e16e34949d28bcb545a29c47bbf422c2be3a53cbb04cb77e8048ab654d26f`；`<h1>` 为“维斯康蒂 Visconti Homo Sapiens Dark Crystal”；正文命中烟熏透明树脂、Double Reservoir、bayonet、18K、Au 14K、EF/F/M/B/S，未命中 `Hook Safe`。
- `GET /brand/visconti`：HTTP 200，78,793 bytes，SHA-256 `a1f6e5065fcff778b0445c229072201fd097646bb882a9ee9255cf1df0ab9197`；`<h1>` 为“维斯康蒂 Visconti”，品牌导航实际可渲染。

这两条是本轮目标路由的真实本地页面回读，不冒充线上部署、Turso 动态读取或人工逐页审阅。

## 未覆盖边界

本 quick 没有声明 Turso/线上同步、生产部署、人工逐页遍历或全量内容完成。全局库存仍明确显示 23 条 retired lineage backlog；后续继续内容修复时应沿用 caller-owned checkpoint → gates → backup → atomic local migration 的闭环。
