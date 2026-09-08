---
quick_id: 260907-k3s
status: complete
completed: 2026-09-07
---

# Phase 621 Summary — Nettuno 1911 与 N-E 2.0 Pelagos Matte

## Result

基于可复核的品牌历史、现行目录、专业零售和独立资料，新增 Nettuno 1911 品牌与
Nettuno N-E 2.0 Pelagos Matte 型号。品牌正文为 2,962 个 Unicode 字符，型号正文为
3,582 个 Unicode 字符；两页各有一张本站原创、明确标注为事实示意图的 approved
primary media。型号的 canonical `made_by` 只有 Nettuno 1911，并建立品牌到型号的
反向导航。Maiora 的商标许可／生产背景只在有来源和 scope 的正文、claim 中说明，未
在当前没有范围字段的 schema 中伪造第二条 maker 关系。

## Owned-copy verification

- `tests/content/phase621-nettuno-1911.test.ts`：1/1 通过。覆盖 remote selector 拒绝、
  alias 冲突、首次发布、replay 幂等、publication/readiness、reviews、spec、media、
  maker/reverse topology 和受保护 catalog snapshot。
- 首次 apply 的两个目标均为 `published`，replay 两个目标均为 `noop`；目标正文、
  approved hash、review kinds (`fact/language/media/publication`) 和 1 个 primary media
  均回读一致。
- owned checkpoint：`.planning/quick/260907-k3s/checkpoint/catalog.db`，最终 SHA-256
  `753a341691b15669f0225169a1646603c6071e75a836d921ffa8b98b7808dea5`。
- readiness：931 个实体（136 brand、795 pen），908 个 current published/public/content-
  ready，published/public blockers 均为 0；23 条 backlog 是既有 retired lineage，因此
  `inventory_complete=true`、`public_clean=true`、`content_complete=false`。
- entity quality：duplicate/suspicious/thin/made_by blockers 均为 0；public media 924/924
  healthy；library、evidence、data、article、publication、public-boundary、migration、
  markdown contract 均通过。readiness 与 coverage 的原始输出保存在本 quick 的
  `evidence/` 和 `formal-local/` 目录。

## Formal local install and route readback

在安装前保存了真实主库和 sidecar：
`.planning/quick/260907-k3s/formal-local/real-preinstall-fpkg.db*`。原子替换后真实
`data/fpkg.db` SHA-256 与 owned checkpoint 同为
`753a341691b15669f0225169a1646603c6071e75a836d921ffa8b98b7808dea5`，旧主库 SHA 为
`f4137c9afd278fef6d267b9aadc3213836ba18e80838f12976e36343e4fd0739`。安装后 SQLite
integrity、foreign-key、quick-check 与完整本地门禁均通过；`scripts/lib/phase19-fixtures.ts`
只更新了本地真实 catalog 的锁定 fingerprint。

使用该正式本地库构建 Next.js 15.5.18 成功（18 routes）。实际本地生产服务回读：

- `/brand/nettuno-1911`、`/pen/nettuno-ne-2-0-pelagos-matte`：HTTP 200；
- `/api/entities/nettuno-1911`、`/api/entities/nettuno-ne-2-0-pelagos-matte`：HTTP 200；
- `/sitemap.xml`：HTTP 200，包含两个新 slug；
- 页面中可回读 `Nettuno 1911`、`Pelagos`、`NE78179`、`ruthenium` 及对应原创 SVG。
- HTTP 级 sitemap 全量扫查覆盖 1,196 个 URL：首轮并发在 20 秒内完成 1,192 个，
  `/library/sources`、`/timeline`、`/brand/nahvalur`、`/brand/pineider` 仅因并发冷
  渲染超时；逐条以 90 秒重试后四者均为 HTTP 200、唯一 `h1` 且有 `main` 和非空正文。
- Playwright CLI 对品牌页、型号页和关系图谱做了真实浏览器快照，正文、规格、来源卡片和
  `made_by` 关系可见；随后在正确的 `next start`（正式本地库、非 standalone 静态壳）下完成
  sitemap 的 1,196/1,196 页浏览器级逐页回读。全部页面 HTTP 200、唯一 H1、至少一个非空
  `main`、无 `data-testid="entity-detail-loading"` 和无可见应用错误；证据见
  `evidence/playwright-full-local-v3.json`。一次页面的瞬时 502 console 报告已单页重试为 200
  且无 console error。该自动浏览器回读不宣称线上或人工逐页阅读已完成。

## Validation boundary

- `pnpm lint`（脚本为 `biome check .`）未进入源码检查：扫描到既有 quick 证据目录中的嵌套
  `biome.json` 后即因 root configuration 冲突退出，退出码 1。
- 为区分本 quick 与历史资产，另行执行 `pnpm exec biome check src scripts tests`；该范围仍有
  73 个 errors、3 个 warnings，且未改动这些 legacy 文件，不能宣称全局 lint 通过。
- 2026-09-08 对正式 `data/fpkg.db` 做无写入门禁复核：公开文章 256 条、data contract、
  entity quality（duplicate/suspicious/thin/made_by 均为 0）均通过；实体 931 条、active
  908 条、retired lineage 23 条，coverage 仍如实保留 3 个品牌 gap 与 16 个型号 gap。摘要
  和数据库 hash 见 `evidence/local-gates-recheck-20260908.json`。

## Production deployment and online boundary

- 已将本地 `master` 的部署代码推送到 GitHub（代码提交 `c7582e9f`，验收文档随后至 `fbb7c9cb`），并通过
  Vercel CLI 完成 production deployment `dpl_7v4YCjGFjNtQDSztvSdXXxBveD2y`；构建日志为
  Next.js 15.5.18、`READY`，别名已指向 `https://fountain-pen-graph.vercel.app`。
- 生产运行时真实日志显示 `/sitemap.xml`、`/api/entities/nettuno-1911` 和 `/graph`
  的根因均为 Turso `BLOCKED: Operation was blocked: SQL read operations are forbidden`；
  应用随后报“Database schema is not initialized”，这是读取被禁用后的包装错误，不是本地
  schema 检查结论。
- Turso CLI `db inspect fpkg` 回读到 rows read `1,768,884,845`、rows written `374,410`；
  直接 libSQL SQL 读取和 `turso db export` 都被同一 rows-read 配额阻断，因而没有远端
  schema、目标行或迁移后的内容证据，也没有执行远端写入。
- 2026-09-08 无写入复核中，`turso db inspect` 另返回 API `EOF`，而从 production env
  执行 `select 1` 仍明确返回同一 `SQL read operations are forbidden`；完整输出见
  `evidence/remote-read-recheck-20260908.json`。
- 全量线上 URL 回读证据保存在
  `.planning/quick/260907-k3s/online-production/online-sweep-summary.json`：以正式本地库
  生成的 1,177 个实体、6 个展览和 13 个静态页共 1,196 条 URL，低并发逐条 GET 无网络
  错误；HTTP `200=1,178`、`500=18`，全部 1,196 条带 RSC error digest，1,177 条实体
  页停留在 loading shell，正文 marker 仅 19 条（错误静态壳中的导航文字）。两个目标页
  `/brand/nettuno-1911` 与 `/pen/nettuno-ne-2-0-pelagos-matte` 均为 `200` 但无正文
  marker；故线上内容验收不通过。

## Boundary

本 quick 已完成真实本地 SQLite 的正式安装、构建、本地回读、GitHub 推送和 Vercel
production 部署；没有写入 Turso。本地正式库的 1,196 页浏览器级逐页回读已完成，但这不
替代线上或人工审阅。由于 Turso rows-read 配额仍阻断，远端迁移／catalog sync 无法安全
执行，生产动态页面也无法完成内容读取；线上 200 只是错误 loading shell，不能视为内容
上线。全局内容修复目标仍保持 active；既有 23 条 retired backlog、coverage 报告中的 3
个无公开内容品牌和 16 个无公开内容型号继续按身份／来源门禁处理，不能用占位正文强行复活。
恢复 Turso 读权限后，必须先做远端 schema/行级回读，再按既有 guarded sync path 迁移，
最后重跑 1196 条线上 URL 和人工全页面遍历。
