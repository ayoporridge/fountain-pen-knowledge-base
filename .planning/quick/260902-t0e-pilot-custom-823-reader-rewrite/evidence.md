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

## 尚未完成的后续边界

本证据只覆盖 Phase 615 的本地 owned-copy 回归。真实本地库的 formal migration、完整本地 post-migration gates、生产 Turso 同步、线上动态路由全量复查和真人全页面遍历仍需在全量 goal 中继续完成；Turso 当前读配额阻塞时不得虚报线上完成。
