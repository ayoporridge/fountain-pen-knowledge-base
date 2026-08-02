# Sailor Phase 368–369 post-reset checkpoint

## Scope

在 Turso 配额重置后的本地续作中，把已通过各自定向回归的 Sailor Professional Gear Realo（11-3926）与 Lecoule Clear（11-0313）顺序重放到 caller-owned checkpoint copy。此记录不代表全量内容 goal 完成。

## Checkpoint evidence

- 源库：`data/fpkg.db`；重放前只读快照仍为 948 entities、640 published、902 public entities。
- 副本：`checkpoint/fpkg-copy.db`，未使用符号链接或 hard-link；`PRAGMA integrity_check` 返回 `ok`。
- Phase 368 首次 apply：brand + Realo 均通过既有 `recordEntityContentReview`／`publishEntity` 路径发布。
- Phase 369 首次 apply：brand + Lecoule Clear 均通过既有 `recordEntityContentReview`／`publishEntity` 路径发布。
- 合并后副本：950 entities、642 published、904 public entities。
- 新增公开型号：`sailor-professional-gear-realo`、`sailor-lecoule-clear`；每个均保留唯一 `made_by` 与 Sailor brand `reverse` 导航关系。
- 两个内容包均包含官方规格、独立资料组、引用、使用维护与选购边界，以及带 `non-photo`／`non-logo`／`not-to-scale`／`non-colour-proof` 标记的原创示意图。

## Migration boundary

本批已完成本地正式迁移与 Turso bounded sync。正式替换前备份位于 `checkpoint/formal-local-backup/`：旧库 SHA-256 为 `c281ffbc41205cf0060b14cbfdb3563c04bc4ab94631ce03bd76a79c72d2b963`；当前 `data/fpkg.db` SHA-256 为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。远端 upsert 为 46,247 行，publication restore 初始结果为 `published=13 / skipped=629 / non-published=23`。

正式迁移后检查：`PRAGMA integrity_check=ok`；`pnpm check:articles`、`pnpm check:data-contract`、`pnpm check:library`、`pnpm check:public-boundary` 均通过；公开媒体审计为 652/652 healthy。contract-v2 readiness audit 汇总为 659 inventory、637 active/content-ready/published、0 published/public blockers、0 duplicate groups、0 suspicious pen articles、0 thin entities、0 broken links、22 retired backlog。四个品牌与十六个型号 gap 均为 retired lineage，不是公开阻塞项。

`check:evidence-contract --all` 未作为本次通过证据：该测试包含 Phase 19 的旧真实库 fingerprint 锁，正式迁移后按设计报告 fingerprint mismatch；未改写该锁，也未把失败冒充通过。其他 agent 的 research、`.next-phase*` 目录和既有 quick 目录均未纳入。

同步后远端历史残留由相邻 quick `260803-6k5-remote-cardinality-cleanup-for-the-four-` 收敛：最终远端为 950 entities、642 published、904 public entities；公开 story/media 重复均为 0；新两条 Sailor 型号均可读回为 published。

当前 Vercel 线上读回（Fly 尚未部署）也已抽查：`/pen/sailor-professional-gear-realo`、`/pen/sailor-lecoule-clear`、`/brand/sailor` 均 HTTP 200，页面包含对应 11-3926／11-0313 与品牌导航文字，未出现 `invalid-story-card`、`invalid-primary-media-cardinality`、`not found` 或 application error 标记。
