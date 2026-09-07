# Phase 615 证据：Pilot Custom 823 读者正文重写

## 资料与内容

- 研究稿：`.planning/content-research/pilot-custom-823-phase615-reader.md`
- 官方事实锚点：Pilot CUSTOM lineup（FKK-3MRP、14K No.15、F/M/B/S）、CUSTOM history（2000 年上市、plunger、约 1.5 ml）、日本 Web Catalog（NC/TB/BN、尺寸重量）、Pilot 支持页（尾栓、清洗和气压运输）。
- 辅助场景资料：The Pen Addict 的 Pilot Custom 823 review；仅用于书写场景，不替代官方规格。
- 本次更新对象是既有 canonical entity `oJyaQy9bEc8V`（`pilot-custom-823`）及 published model story `curated-story-c657ece5bb5d123e4c76e2f3`。旧 slug `百乐-pilot-custom-823` 对应实体保持 retired。

## 代码与安全边界

- 应用脚本：`scripts/apply-phase615-pilot-custom-823-reader-rewrite.ts`
- 定向测试：`tests/content/phase615-pilot-custom-823-reader-rewrite.test.ts`
- 测试先对真实 `data/fpkg.db` 做 snapshot/SHA-256，再用 `copyCheckpointedCatalogToDisposableCopy` 创建独立 caller-owned copy；脚本拒绝继承的远程数据库环境，并检查数据库不是 symlink/hard-link、迁移已到 032。
- 测试结束后真实库 snapshot 与 SHA-256 均保持不变；没有对 Turso 发起读取或写入。

## 定向回归结果

执行：

```text
pnpm exec biome check --write scripts/apply-phase615-pilot-custom-823-reader-rewrite.ts tests/content/phase615-pilot-custom-823-reader-rewrite.test.ts
pnpm exec biome check scripts/apply-phase615-pilot-custom-823-reader-rewrite.ts tests/content/phase615-pilot-custom-823-reader-rewrite.test.ts
pnpm exec tsc --noEmit --pretty false
git diff --check
pnpm exec tsx --test tests/content/phase615-pilot-custom-823-reader-rewrite.test.ts
```

结果：

- Biome：通过，无待修复格式问题。
- TypeScript：通过。
- `git diff --check`：通过。
- 定向测试：1/1 通过，首次结果 `outcome=published, changed=true`；重放结果 `outcome=noop, changed=false`，revision/hash 不变。
- 新正文包含 FKK-3MRP、`## 先把 823 认清`、`## 清洗和运输`，并不含 `当前页面`、`当前档案`、`资料不足`、`研究队列`、`型号档案记录了`、`现有来源包括` 等模板短语。
- canonical entity/story 正文与摘要一致；四项 current-hash review（fact/language/media/publication）均为 approved；publication revision 与 reviewed revision 一致；readiness blocker 为 0、publishable 为 1、canonical public membership 为 1。
- entity links、references、media、model_specs、model_variants 指纹保持不变；退休重复实体正文不变且没有 public membership；全局 public body duplicate groups 为 0。

## Formal local migration

- 迁移前真实库 SHA-256：`5c9c47742ec217730908835fd0cd06448a09f77e6a7b8ba7927b4d2e394dddab`。
- 自有迁移目录：`.planning/quick/260902-t0e-pilot-custom-823-reader-rewrite/formal-local/`；`backup-before.db` 保留迁移前副本，`checkpoint/catalog.db` 先在 caller-owned copy 上重放。
- checkpoint 重放结果：`outcome=published`、`changed=true`、content hash `sha256:v3:417240c5d3f213124930f9b8f6626165e6539817ec7fdc440005e123a04cabc1`；`PRAGMA integrity_check` 为 `ok`；revision 605；readiness blocker=0、publishable=1；四项审核均为 approved；全局 public body duplicate groups=0。
- 通过 `lsof` 确认真实库无活动持有者后，将 checkpoint 复制到精确临时文件并以 `mv -f` 原子替换 `data/fpkg.db`。替换后真实库 SHA-256：`530cd921c86b87be2a1f32ba749536cfd565e3bd7961a6eb9ed3f1bf6fe573f0`；大小 93,921,280 bytes；fixture 已更新为 inode `88117342`、mtimeNs `1788353764669696356`。
- 真实库的 WAL/SHM 只保留 SQLite 正常 sidecar（WAL 0 bytes、SHM 32,768 bytes，SHA 与受控 fixture 相符），没有试验性远程写入。

## 正式迁移后本地门禁

- `check:data-contract`：276 article、135 brand、13 concept、3 nib、794 pen；通过。
- `check:articles`：256 个 public article；通过。
- `check:public-boundary -- --all`：published blockers=0，list/per-id/aggregate/context/reverse diff=0；通过。
- `check:library`：4030 sources、6116 sourceItems、7303 claims、17487 citations、958 stories、1319 events、1228 media；通过。
- `check:evidence-contract -- --all`、`check:publication-gate -- --all`、`check:audit-readiness -- --inventory`：通过完整 migration、review、rollback、readiness 与隔离矩阵。
- `audit:public-media`：922/922 healthy，0 failed；通过。
- `audit:entity-quality -- --database-path data/fpkg.db`：929 entities，906 active，23 retired lineage；duplicate name groups=0、suspicious pen articles=0、thin brand/model entities=0、made_by blockers=0。
- `tsc --noEmit` 与 `pnpm build`：通过；Next.js 生成 18 个静态页并准备 standalone libsql native runtime。
- `audit:library-coverage -- --database-path data/fpkg.db` 仍以非零退出明确保留边界：132/135 brand、774/794 model 已 ready；3 个品牌与 16 个型号属于退休 lineage 的故意缺口，不能把该命令的非零结果隐藏成全量完成。

## 本地动态路由遍历（2026-09-07）

- 使用显式本地环境启动 production server：`TURSO_DATABASE_URL='' TURSO_AUTH_TOKEN='' FPKG_DATABASE_URL=file:/Users/xz/Documents/fountain-pen-graph/data/fpkg.db PORT=4321 pnpm start`；没有读取 Turso。
- 从正式迁移后的 `public_entities` 生成 1,175 个公开实体路由，以 16 并发逐页检查 HTTP 200、`<h1>`、`data-testid="entity-summary"` 和数据库阻塞标记。
- 首轮 1,174 页立即通过；`/brand/nahvalur` 首轮超过 15 秒上限，单独以 60 秒重试得到 HTTP 200、208,570 bytes、h1/summary 均存在且无阻塞标记。最终 1,175/1,175 路由均有可渲染页面。
- 这是一轮本地自动化渲染遍历，不冒充生产线上回读或真人逐页审阅；后两项仍是全量 goal 的未完成工作。

## 尚未完成的后续边界

本证据覆盖 Phase 615 的本地 owned-copy 回归、真实本地 formal migration 与 post-migration gates。生产 Turso 同步、线上动态路由全量复查和真人全页面遍历仍需在全量 goal 中继续完成；Turso 当前读配额阻塞时不得虚报线上完成。
