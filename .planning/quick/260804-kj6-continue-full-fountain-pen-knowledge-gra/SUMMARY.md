# Phase 491 Summary: deepen Eversharp representatives

## Result

本批深化三个已有 canonical 型号，没有新增实体、没有新增产品照片，也没有写入真实 `data/fpkg.db`：

- `WrCQ5ThC02bH` / `the-eversharp-envoy`：约 1948 年全金填流线、1/10 14K Y.G.F.、14K 短型尖、杠杆墨囊、1948 广告和 1951—1952 清仓边界。
- `DhUCJ0JY981I` / `the-eversharp-coronet`：1936 年末 Art Deco、全覆盖／half-Coronet、Safety Ink Shut-Off、1939 目录命名与透明 section 维修边界。
- `0TKGvP8286P4` / `the-eversharp-bantam`：约 1933 年产品语境、尾端 bulb filler、赛璐珞圆杆／棱面版本、Century of Progress、尖材和老球囊维护边界。

研究正文和 pack 均保留官方 Wahl-Eversharp 历史、PenHero、Vintage Pens、FountainPen.it、Collectors Weekly、Peyton Street Pens 等来源的作用域；三页继续使用原有本站原创 factual SVG。

## Verification evidence

- 定向测试：`pnpm exec tsx --test tests/content/phase491-eversharp-depth.test.ts` 通过；覆盖正文长度／敏感实现词、独立来源、远端变量拒绝、首次审核—`publishEntity`、身份／slug、来源、主图、品牌关系、四项 review、revision/hash 对齐、重放 noop 和真实目录快照不变。
- 持久 owned checkpoint：`.planning/quick/260804-kj6-continue-full-fountain-pen-knowledge-gra/checkpoint/checkpoint.db`。首次 apply 三个均 `published`，replay 三个均 `noop`；hash 分别为 `sha256:v3:3c08e6b0e6f5914503b55bdf59c5df1da1ff6b09832c25bc183f236cea443e6c`、`sha256:v3:0a954d5d5f8a85a2b7946774ff8c95f8a961c7be054261a909b15812b13e702c`、`sha256:v3:af9d1a2b69d134c1fab13861fac10713413a39c81a821cb5c35709d5e52cf3db`。
- Checkpoint `PRAGMA integrity_check` 为 `ok`，`PRAGMA foreign_key_check` 为 0 条。Envoy／Coronet／Bantam 正文长度约 2801／2903／2831，approved reference 15／15／12，approved primary media 各 1，`made_by` 与 reverse 各 1，publication revision 对齐且 contract version 3。
- `check-library-contract.ts` 在 checkpoint copy 输出 `Library contract OK`；读取计数 sources 2800、sourceItems 4565、claims 4657、citations 11866、media 986、aliases 2409。工具自身临时 workspace cleanup 仍返回 `cleanup failed closed` 尾码，但 contract 核心检查已输出 OK，真实目录快照未改变。
- 直接对已迁移 checkpoint 执行 readiness audit（避免工具临时 workspace cleanup 尾码）：690 entities、668 active、22 retired、668 content-ready/published/public、published/public blockers 0、backlog 22；质量计数 duplicateGroups 0、suspiciousPenArticles 0、thinEntities 0、brokenLinks 0。
- 新文件 targeted Biome 通过。完整 `pnpm exec tsc --noEmit` 仍只有既有 baseline：`tests/content/phase346-jinhao-x450-x750.test.ts:183-184` TS7022、`tests/migration/sync-local-catalog-to-turso.test.ts:76` TS2741；本批文件无新增 TypeScript 错误。

## Commit boundary

提交前必须再次检查 `git status --short`，只暂存本批 research、data/apply/test 和本 quick 目录的 `PLAN.md`／`SUMMARY.md`；所有其他 research、`.next-phase*`、旧 checkpoint 与 Montblanc 保护目录保持未跟踪或原状态。此 Phase 491 不代表全量 goal 完成；远程 Turso 迁移、剩余 backlog、全量真人遍历、部署和线上逐条复查仍未完成。
