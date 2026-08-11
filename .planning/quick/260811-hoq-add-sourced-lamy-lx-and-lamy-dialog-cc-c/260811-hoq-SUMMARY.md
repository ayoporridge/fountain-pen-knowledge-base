---
status: complete
quick_id: 260811-hoq
scope: direct-content-repair
source_commit: 2568e069
---

# Phase 586: LAMY Lx 与 LAMY dialog cc

本 quick 只完成两个 LAMY 独立型号的来源化内容包，不代表 Fountain Pen Knowledge Graph 全量 goal 完成。Turso 未被访问，真实 `data/fpkg.db` 未被写入。

## 已交付

- 新增 `LAMY Lx` 与 `LAMY dialog cc` 两篇自然中文正文，覆盖可核实介绍、规格、历史、版本边界、维护、选购建议与来源。
- 新增两张 1600×900、互不重复且明示“本站原创示意图／非产品照片”的 SVG 主图。
- 新增两个 `CuratedEntityPack`，复用既有 LAMY 品牌包，建立唯一 `made_by` 与品牌反向关系。
- 通过 fact、language、media 三项 review 与 `publishEntity` 发布；没有直接修改 `entity_publications.status`。
- 来源内容提交：`2568e069 feat(content): add LAMY Lx and dialog cc`。

## 离线验收证据

- owned checkpoint：`checkpoint/catalog.db`，从 Phase 585 r4 候选复制后应用；首次发布成功，第二次重放全部为 `noop`。
- 候选 SHA-256：`c1b611dd9d20e6dad77bc4f3c04f4ea9ab8400bc4d8e808cababaa3969409fd3`。
- 真实库前后 SHA-256：`acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`，保持不变。
- 定向测试：1/1 通过；TypeScript、Biome、diff check 与 SQLite `integrity_check` 通过。
- current public：791 个实体全部 content-ready，published/public blocker 均为 0；另外保留 24 个 retired lineage，不计入当前公开缺陷。
- library contract 通过；media audit 807/807 healthy；production build 通过。
- 本地 production readback：`/pen/lamy-lx`、`/pen/lamy-dialog-cc`、`/brand/lamy` 与两张 SVG 均为 HTTP 200；品牌页包含两个型号链接。
- checkpoint、readiness 与 media evidence 仅作为本地试验材料保留，不提交 Git。

## 仍未完成

- Phase 585 已存在一个全局主图复用：Wancher 品牌页与 `wancher-dream-pen-true-ebonite-matte-black` 共用 `/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg`。它不是 Phase 586 引入，下一批应直接修复。
- 继续从现有内容包与 research 推导真实缺口，补齐剩余品牌／型号；不重做库存盘点。
- 内容封板后统一迁移真实数据库、全量本地真人遍历；Turso 额度恢复后再同步、部署并线上逐条复查。
