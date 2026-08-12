# Quick 260813-8nd Summary

## Outcome

完成最后一次外部品牌／代表型号覆盖冻结，并提交 `1846cf97 feat(content): freeze final external coverage`。新增 PENLUX、Ferris Wheel Press、Tom's Studio、Radius 1934、Hinze Pen Company 五个品牌及各一个代表型号；Kakimori、Traveler's Company、Zebra、Nettuno 1911 与区域单店／单人工作室保留为未来扩展，不阻断当前全量收口。最终统一 checkpoint、全量自动检查与 1130 个公开页面的本地真人遍历均已完成。全量 goal 仍保持 active，尚需正式迁移、生产部署和线上逐条复查。

## Safety

- 所有试验与发布只发生在 caller-owned checkpoint copy；未访问 Turso。
- `data/fpkg.db` SHA-256 前后均为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。
- Phase 604 source SHA-256 前后均为 `2ed0e5040e68167b529cc675793f5d8e1711e2de3605804355359256f0133ece`。
- Phase 605 checkpoint SHA-256 为 `9306b2af8dd16c4d5fa86fe953da4b9d469096b6182e5b42d8cd4af28d7e7389`。
- 保护的未跟踪 research、`.next-phase*` 与 `260719-665` quick 均未删除、覆盖或提交。

## Verification

- 定向回归 1/1 PASS，`388724 ms`；覆盖 id/slug/name/alias collision、三类 remote selector 拒绝、baseline +10、四类 review、公开状态、品牌双向导航、既有实体 digest、不变 source/real family 与 replay 10/10 noop。
- TypeScript、Biome、10 个 SVG `xmllint`、SQLite integrity/foreign key、cached diff check 均通过。
- readiness：884 inventory，861 published/content-ready/public，published/public blockers 0；23 条为 retired lineage/redirect 证据。
- entity quality：861 active；duplicate groups、thin、suspicious、broken links 全 0。
- library contract OK；public media 877/877 healthy。
- production build PASS，18/18 static pages，standalone libsql runtime prepared。
- 10 张 1600×900 原创事实图目视无裁切、错位或重复。
- 10 个新品牌／型号 URL 全部 HTTP 200，标题、代表型号链接与关键规格回读通过。

## Final candidate and full-page traversal

- 最终候选固化在 `checkpoint-final/catalog.db`，SHA-256 为 `9306b2af8dd16c4d5fa86fe953da4b9d469096b6182e5b42d8cd4af28d7e7389`。
- 权威 `public_entities` 实际包含 1130 个公开页面：256 article、121 brand、10 concept、3 nib、740 pen；861 仅是 active brand/pen readiness 口径，不能代表全站页面数。
- 使用现有本地 production build 与 in-app browser 逐条打开 1130 个 authoritative URL：导航／渲染错误 0、缺 H1 0、空 title 0、可见 main 正文低于 500 字符 0。
- 全量主图 audit 为 877/877 healthy；37 篇 published story 中引用的 31 个唯一站内图片路径全部存在。
- 历史文章中的外部原图经 `/api/image-proxy` 懒加载；抽查 Richard's Pens 代理返回 200 `image/jpeg`，浏览器等待 3 秒后 7/7 解码成功。80 ms 首轮读取产生的 `naturalWidth=0` 属于懒加载等待不足，不记为坏图。
- `next start` 正常站点方式可返回源码 `public/` 静态资源；直接从仓库根运行 standalone server 不会自动复制全部 public assets，因此不作为图片验收服务器。

## Remote migration blocker

- `GODEBUG=http2client=0 turso auth whoami` 成功，账号为 `arjoxu`；`turso db show fpkg` 可读取数据库元信息。
- 最终 checkpoint 的 append/upsert-only 同步器 dry-run 在第一次远端 SQL 读取即被 Turso 拒绝：`BLOCKED: SQL read operations are forbidden (reads are blocked, do you need to upgrade your plan?)`。
- 此次没有远端写入，也没有执行 `--apply --ack-remote-write`。正式迁移、部署和线上逐条复查仍未完成，full-corpus goal 必须保持 active。
- Turso Starter 当前 rows read 为 `748.5M / 500M`（150%），overages disabled；CLI 明示配额于 `2026-09-01 08:00 CST` 重置。在此之前无法完成迁移所必需的远端只读差异检查。

## Migration and production readiness

- `tests/migration/sync-local-catalog-to-turso.test.ts` 当前 2/2 PASS：同步器只接受 owned checkpoint source，生成受保护的 append/upsert-only 写入且没有 destructive SQL。
- GitHub `origin/master` 为 `75ceb972`，当前本地 `master` 为 `1846cf97`；远端是本地祖先，本地领先 315 个提交。正式上线不能把旧 GitHub revision 当作本次成品。
- Vercel CLI 当前登录为 `ayoporridge`，本地绑定项目 `aljo233/fountain-pen-graph`；Production 已配置 hidden `TURSO_DATABASE_URL` 与 sensitive `TURSO_AUTH_TOKEN`。
- 当前 production alias `https://fountain-pen-graph.vercel.app` 指向 2026-07-28 的 Ready deployment，尚未包含最终本地内容。配额恢复后必须先迁移 Turso、完成远端只读审计，再从当前本地 `master` 显式 production deploy。
- 最终执行顺序固定为：hash/test 复核 → Turso dry-run → 显式 apply → 远端数据库全量审计 → Vercel production deploy → alias readback → 1130 URL 线上逐条复查 → requirement-by-requirement 最终审计。
