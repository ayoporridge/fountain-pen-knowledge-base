# Phase 614 evidence

验证时间：2026-09-02T20:08:32+08:00

## owned checkpoint replay

- 副本来源：受保护的 `data/fpkg.db` 只读快照，经 `copyCheckpointedCatalogToDisposableCopy` 复制到临时 caller-owned 目录；脚本拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN` 和 `FPKG_DATABASE_URL`。
- 回放前确认三组品牌／型号的 `public_entities.body_md` 各有两行，且 `brand_story` 只有一条、品牌和型号的 `made_by`／`reverse` 关系均存在。
- 第一次回放：`entities=3, changed=3, noop=0`；三个品牌均经 fact/language/media 审核和 `publishEntity` 转为 published。
- 回放后：三组品牌故事分别与对应型号故事不同；型号正文、`entity_references`、`entity_links` 未改变；三个品牌均 public、readiness `blocker_count=0`、当前 hash 有 fact/language/media/publication 四类 approved review；全量 `public_entities` 重复 body 组为 0。
- 第二次回放：`entities=3, changed=0, noop=3`；`content_revision` 不再增加。
- 真实库 SHA-256 在测试前后保持 `00ddd2dc6e1a9bde275920eed3d0d82e251be1e7d8b48bb1e27b6619e080d4c4`，真实库快照未改变。

## 定向质量门

- `pnpm exec tsx --test tests/content/phase614-duplicate-brand-story-cleanup.test.ts`：通过（1 test；约 86 秒，含 publication hash 展开）。
- `pnpm exec tsc --noEmit --pretty false`：通过。
- `pnpm exec biome check scripts/apply-phase614-duplicate-brand-story-cleanup.ts tests/content/phase614-duplicate-brand-story-cleanup.test.ts`：通过。
- `git diff --check`：通过。

## 范围边界

本批只清理三组已确认的逐字重复品牌故事，不宣称全量内容目标完成。Turso 当前 rows-read 仍超出 Starter 限额，远端同步、Vercel 动态页面回读、真人全页面遍历和线上复查仍待额度恢复后执行。

## 正式本地迁移（2026-09-02）

- 以迁移前真实 `data/fpkg.db` 为来源制作 caller-owned checkpoint 和备份；两者在替换前 SHA-256 均为 `00ddd2dc6e1a9bde275920eed3d0d82e251be1e7d8b48bb1e27b6619e080d4c4`。
- 脚本仅在 `.planning/quick/260902-pyp-duplicate-brand-story-cleanup/formal-local/checkpoint/catalog.db` 上运行，远程数据库环境变量已清除；结果为 `entities=3, changed=3, noop=0`，三条新 hash 分别为 `0747b1bf36d9dc5c15575df489419a43ce353e17bc3922328e1cd737b8eb7e22`、`ea3a58f495baf1a5485ef4311e2c17f754ef9711468e0be6f82022cee39696fb`、`f4ecc50113ec47265e3f7392159bfe8dacaebc1b7a5509577186c9e7254ea7ea`。
- checkpoint 替换前后 `integrity_check=ok`、`foreign_key_check` 为空；确认无活动进程占用真实库后，通过临时文件原子替换 `data/fpkg.db`。替换后真实库 SHA-256 为 `5c9c47742ec217730908835fd0cd06448a09f77e6a7b8ba7927b4d2e394dddab`，未保留 WAL/SHM sidecar。
- 替换后实体计数为 article 276、brand 135、concept 13、nib 3、pen 794；publication 为 published 912、retired 23。三组品牌均 published/public、`revision=reviewed_revision`、`blocker_count=0`，全量公开正文重复组为 0。
- 为使受保护的 Phase 19 fixture 与正式库一致，仅更新了 `scripts/lib/phase19-fixtures.ts` 的 main size/inode/mtime/SHA 指纹；未改变其余 fixture 约束。

## 正式库本地回读门

- `pnpm check:data-contract`：pass（276/135/13/3/794）。
- `pnpm check:articles`：pass（256 个公开 article）。
- `pnpm check:public-boundary -- --all`：pass（published/list/per-id/aggregate/context/reverse diff 全为 0）。
- `pnpm check:library`：pass（4030 sources、6116 sourceItems、7303 claims、17487 citations、958 stories、1319 events、1228 media）。
- `pnpm check:evidence-contract -- --all`：pass；`pnpm check:publication-gate -- --all`：pass；`pnpm check:audit-readiness -- --inventory`：pass。
- `pnpm audit:public-media`：pass（922/922 healthy，0 failed，dry-run）；`pnpm audit:entity-quality --database-path data/fpkg.db`：pass（906 active、duplicate/thin/suspicious/made_by blockers 均为 0）。
- `pnpm audit:library-coverage --database-path data/fpkg.db` 的非零退出仅报告 3 个 retired brand 与 16 个 retired model lineage；active 132 brands、774 models 均 ready，未将 retired 行伪装成公开完成。
- `pnpm exec tsc --noEmit --pretty false` 与 `pnpm build`：pass（Next.js 15.5.18，18 个静态页面生成，standalone runtime 准备成功）。

正式本地迁移已完成，但不等于全量 goal 完成：Turso 远端同步、生产动态页面成功回读、1175 条公开路由在正常远端读权限下的逐条检查、真人全页面遍历及最终线上复查仍未完成。

## 本地动态路由遍历（2026-09-02）

- 使用正式本地 `data/fpkg.db`（显式 `FPKG_DATABASE_URL=file:...`，Turso 环境变量置空）启动生产构建，在 `http://127.0.0.1:4321` 逐条请求 1175 个 `public_entities` 路由。
- 第一轮并发 16 检查中，1175 个请求均返回 HTTP 200；8 个英文引号被 HTML 转义的 article 标题仅触发了原始字符串比较诊断，页面的 `<h1>` 与 `entity-summary` 均存在；25 个冷启动较慢页面在 7 秒预算下超时。
- 对这 25 个页面以 30 秒预算、并发 4 重试，全部通过（HTTP 200、`<h1>`、`entity-summary` 存在，且无数据库初始化／远端读阻断／Server Components 错误标记）。8 个标题转义样本复核后均为正常页面。
- 这次遍历证明本地正式库的动态页面可以完整渲染；它不替代 Turso 恢复后的生产逐条回读，也不替代真人浏览验收。
