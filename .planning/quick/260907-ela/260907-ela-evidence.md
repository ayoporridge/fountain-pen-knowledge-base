# Phase 616 evidence: Parker Vector XL reader-copy repair

日期：2026-09-07  
目标：把已经存在于 `model_specs`、approved claim 与来源关系中的 Teal `2159746` 规格补回公开正文；不改 links、references、media、specs、variants 或 retired lineage。

## 目标与来源

- entity：`P7LgZR6-DDPi` / `parker-vector-xl-fountain-pen`
- story：`curated-story-97b95ce7ec0256c7a429c051`
- reviewed copy：`.planning/content-research/parker-vector-xl-publishable-content-2026-07-19.md`
- approved source boundary：Parker 2022/2024 catalogues、Parker current XL page、Pen Heaven `2159746` page、Parker care guide、经典 Vector secondary boundary。
- resulting source marker：`curated-content:phase616-parker-vector-xl-reader-rewrite:347a47239fb72023e32d299081a3a2893c79fb3e672cf6a67de65daad24b95f8`

## Disposable-copy test

Command：

```text
pnpm exec tsx --test tests/content/phase616-parker-vector-xl-reader-rewrite.test.ts
```

Result：1/1 passed，约 32 秒。

测试在 disposable copy 中先写入 legacy sentinel，再验证真实迁移路径：

- remote `TURSO_DATABASE_URL` selection rejected;
- first apply `published`, `changed=true`, content hash `sha256:v3:0529652c40a9f26eae4a78d0e7ed3f896906d6793a0e0fecd103418c5d426e68`;
- public story/entity body parity 保持；`2159746`、135/157 mm、11.5 mm、20 g、converter 需另购均存在；`2159744`/`2159748`/`2159771Z` 的 SKU 边界仍存在；template phrases 未出现；
- links、references、media、model_specs、model_variants fingerprint unchanged;
- blocker=0、publishable=1、public=1、四类当前 review approved、public duplicate body groups=0;
- replay `noop`, `changed=false`, revision 不变；真实库 SHA 未改变。

## Formal local migration

- pre-migration real/backup SHA256：`530cd921c86b87be2a1f32ba749536cfd565e3bd7961a6eb9ed3f1bf6fe573f0`
- checkpoint：`.planning/quick/260907-ela/formal-local/checkpoint/catalog.db`
- checkpoint apply：`published`, hash 同上测试结果；`PRAGMA integrity_check = ok`；public body length 3,579；revision 332；四类当前 review approved。
- 原子替换前确认真实库没有 open handle，且 `-wal`/`-shm` 不存在；真实库先保留在 `formal-local/backup-before.db`。
- post-migration real/checkpoint SHA256：`6dc8fd18d7f75afa43a93696b7ba33eb279472fcef0cc0ce82be0ab4c5f54597`
- post-migration public body：3,579 Unicode chars；`has2159746=true`、`hasDims=true`、`hasConverter=true`。
- real database fixture fingerprint 更新在 `scripts/lib/phase19-fixtures.ts`，main inode `89306370`、mtimeNs `1788748577737691385`；不存在的 sidecars 仍按 optional 处理。

## Local gates

通过：

- `check:data-contract`：article 276 / brand 135 / concept 13 / nib 3 / pen 794；
- `check:articles`：256 public articles；
- `check:public-boundary --all`：published blockers 0，list/per-id/aggregate/context/reverse diff 全 0；
- `check:library-contract`：sources 4030、sourceItems 6116、claims 7303、citations 17487、stories 958、events 1319、diagrams 9、media 1228、community 2、exhibits 6、externalIds 61、aliases 3202；
- `check:evidence-contract --all`：migration/schema/hash/invalidation/readiness contracts 全绿；
- `check:publication-gate --all`：migration-full、invalidation、publish、compatibility 全绿；
- `audit:entity-quality --database-path data/fpkg.db`：929 entities，906 active，23 retired；duplicate/suspicious/thin/made_by blockers 全 0；
- `audit:public-media`：922/922 healthy，dry-run，无写入；
- `audit-readiness-v2 --inventory-only`：inventory 929、content_ready 906、published 906、published_blockers 0、backlog 23；
- `pnpm build`：Next.js 15.5.18，18 static pages；
- `biome`、`tsc --noEmit`、focused test 全通过。

coverage audit 的 `content_complete=false` / backlog 23 仍明确保留：这是 retired lineage 的故意边界，不将退休记录伪装成可发布内容。

## Local route readback

本地生产 server 使用显式 `FPKG_DATABASE_URL=file:/Users/xz/Documents/fountain-pen-graph/data/fpkg.db` 启动；请求：

```text
GET /pen/parker-vector-xl-fountain-pen
```

回读文件：`.planning/quick/260907-ela/formal-local/parker-vector-xl.html`，106,059 bytes，SHA256 `a086601dc4a5da1211496e32180f69bfb287bba34da0a01c272897581fd6e262`。HTML 实际正文包含 `2159746`、`135 mm`、`157 mm`、`11.5 mm`、`20 g` 和 `需另购`。

## 未覆盖边界

本轮没有宣称 Turso/线上动态页面已验证，也没有宣称人工逐页遍历 1,175 条路由已完成。既有本地自动 route sweep 仍为 1,175/1,175；线上继续受 rows-read quota 限制。
