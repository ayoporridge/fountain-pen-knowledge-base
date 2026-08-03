---
phase: 459
quick_id: 260804-947
status: complete
---

# Phase 459 完成记录

## 本批内容

在 Phase 458 checkpoint 的 owned copy 上深化三个已有 canonical 实体，没有创建重复品牌或型号：

- 末匠 Majohn 品牌（`TfXerdAZ5iWg`，`majohn`）：正文文件 4,179 字符，发布 body 3,465 字符，5 个来源、7 条合格核心 claim、1 张 primary factual SVG；补足商标与名称沿革、A1 机构证据、品牌／型号／SKU 分层、导航规则和跨型号维护边界。
- 末匠 Majohn P140（`GxLe3PSmZALi`，`末匠-majohn-p140`）：正文文件 3,502 字符，发布 body 3,202 字符，5 个来源、9 条合格核心 claim、1 张 primary factual SVG；补足透明活塞、#8 尖、样本尺寸重量、清洗、旅行、二手核对及 P141 分流。
- 末匠 Majohn P141（`gC8zhkSOlQiH`，`末匠-majohn-p141-钛合金`）：正文文件 3,510 字符，发布 body 3,185 字符，5 个来源、9 条合格核心 claim、1 张 primary factual SVG；补足钛合金范围、内部件批次差异、大尖面、金属维护、购买核对及 P140 分流。

## 发布哈希

- Majohn 品牌：`sha256:v3:f0867cebed4081941bf4f561dd3f72b63be1cdef43664775f938004409711486`
- Majohn P140：`sha256:v3:09a8442870d9928771b976ab7977580576f4e48ee4c43a64c37d8af501fdce47`
- Majohn P141：`sha256:v3:ca2817dfd28f1f7a2813eba5406a79ff7f6bfccd27a553d52619314a06007a58`

首次 apply 三项均为 `published`；定向测试中的不同 reviewer 重放三项均为 `noop`。品牌页保持 `made_by=not_applicable`，P140/P141 各保持唯一 `made_by` 与品牌到型号的唯一 `reverse` 导航。

## 验收证据

- 定向测试：`pnpm exec tsx --test tests/content/phase459-majohn-brand-p140-p141-depth.test.ts` 通过（1/1，约 33 秒）。覆盖 owned disposable copy、远端环境拒绝、canonical identity、正文与内部词检查、来源／media、品牌和型号关系、四类内容审核、contract v3/hash、幂等重放及真实资料库快照保护。
- checkpoint `PRAGMA integrity_check`：`ok`；`PRAGMA foreign_key_check`：空集。
- library contract：通过；sources 2,733、sourceItems 4,477、claims 4,307、citations 11,290、stories 718、events 930、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2,405、commonsMedia 4。
- entity quality：690 inventory（119 brands、571 pens），668 public/content-ready/published，22 retired backlog；duplicate groups 0、suspicious pen articles 0、thin entities 0、made_by blockers 0。
- coverage：brands 119/115 ready/4 gap，pens 571/553 ready/2 starter/16 gap，平均分均为 97；这只是当前 checkpoint 的审计快照，不代表全量 goal 完成。
- TypeScript：仍只有既有 3 个错误（`phase346-jinhao-x450-x750.test.ts` 两个 TS7022；`sync-local-catalog-to-turso.test.ts` 一个 TS2741），Phase 459 未新增错误。
- Biome（owned scripts/test）、`git diff --check`：通过。

## 数据库保护

- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，前后未变。
- 本批 owned checkpoint SHA-256：`de28c6fe47e028d238ddf837627aa5e241da95bf003953a16c3b63d899bfdb2f`。
- 本批只在 `.planning/quick/260804-947-objective-deepen-majohn-brand-p140-p141/checkpoint.db` 写入；没有连接 Turso、生产数据库或线上站点。审计 JSON 留在本批 quick 目录，未进入提交。

## 后续未完成

全量内容 goal 仍在继续：尚未完成全部公开品牌／型号的逐条补齐、正式迁移真实资料库、全站自动检查、真人遍历、生产部署和线上逐条复查；本 Phase 只证明 Majohn 品牌／P140／P141 这一批在 owned checkpoint 上达到当前发布门槛。
