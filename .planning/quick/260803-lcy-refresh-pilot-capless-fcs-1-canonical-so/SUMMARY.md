# Phase 405 summary — Pilot Capless FCS-1 sourced refresh

## Result

既有 Pilot Capless 特殊合金实体 `phase367-pilot-capless-special-alloy` 已在 caller-owned checkpoint copy 中完成来源化深化，并通过项目既有 `recordEntityContentReview` + `publishEntity` contract-v3 发布路径；没有写入真实 `data/fpkg.db`，也没有创建重复实体。全量 goal 仍然 active，Phase 405 不代表全站完成。

## Owned files

- `.planning/content-research/pilot-capless-special-alloy-phase405.md`
- `scripts/data/phase405-pilot-capless-special-alloy-refresh.ts`
- `scripts/apply-phase405-pilot-capless-special-alloy-refresh.ts`
- `tests/content/phase405-pilot-capless-special-alloy-refresh.test.ts`
- `.planning/quick/260803-lcy-refresh-pilot-capless-fcs-1-canonical-so/PLAN.md`
- `.planning/quick/260803-lcy-refresh-pilot-capless-fcs-1-canonical-so/SUMMARY.md`

checkpoint 数据库留在本 quick 目录中，不提交到 Git；其他 agent 的 research、`.next-phase*` 和 quick 目录未删除或暂存。

## Sourced content

- Pilot Japan Web Catalog exact SKU `FCS-1-MS-F`：特殊合金 F、哑光银、黄铜＋涂装轴、head 不锈钢、clip 铁钢、CON-40、全长 140 mm、最大径 φ13.4 mm、重量 30 g、专用ケース、含税 ¥17,600；lineup 列 MS/MCO/MDG/MAL 四色，每色 F/M。
- 官方护理、国际保证清单、manual、目录分类、新闻稿、CUSTOM 历史与 The Pen Addict 用于按动、供墨、清洗、气压/溶剂警告和相邻 Capless 路线边界；正文不把普通 18K 字段回填到 FCS-1。
- 正文读回 8,070 Unicode 字符；pack 有 11 个来源组、9 个变体（1 个 `edition_group` + 8 个 `market_sku`），原创 SVG 明确 `non-photo`、`non-logo`、`not-to-scale`、`non-colour-proof`。

## Checkpoint evidence

Persistent checkpoint:
`.planning/quick/260803-lcy-refresh-pilot-capless-fcs-1-canonical-so/checkpoint/fpkg.db`

首次 apply 的持久副本 readback：

- `PRAGMA integrity_check` = `ok`。
- `public_entities` 中 FCS-1 slug 为 `pilot-capless-special-alloy`，body 长度 8,070，source marker 以 `curated-content:phase405-pilot-capless-special-alloy-refresh-v1:` 开头。
- `entity_publications` 为 `published`，content revision 与 reviewed revision 同为 273，reviewed contract version 为 3；当前内容 hash 为 `sha256:v3:98b5134a9afc2b440f8e8fe39fb90202daba2d36da1eaef72618e8e09a80105e`。
- 当前 hash 的 `fact/language/media/publication` 各有 1 条 approved；`public_entity_readiness` 为 `blocker_count=0`、`blockers_json=[]`、`publishable=1`。
- 来源引用为 11 条、独立组 11；变体为 `edition_group=1`、`market_sku=8`；正向 `made_by` 与 Pilot → FCS-1 反向导航各只有 1 条。
- checkpoint totals 仍为 `entities=950 / public=904 / published=642`。

重放：

```text
noop phase367-pilot-capless-special-alloy
contentHash sha256:v3:98b5134a9afc2b440f8e8fe39fb90202daba2d36da1eaef72618e8e09a80105e
```

真实库 SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。

## Verification

- `pnpm exec tsx --test tests/content/phase405-pilot-capless-special-alloy-refresh.test.ts`：通过（owned-copy 保护、远程环境拒绝、来源/规格/9 变体/媒体、审核发布门禁、readiness、身份关系和 replay noop）。
- `pnpm exec tsc --noEmit`：只剩仓库既有的 3 个诊断：`phase346-jinhao-x450-x750.test.ts` 两个 TS7022、`sync-local-catalog-to-turso.test.ts` 一个 TS2741；Phase 405 无新增 TypeScript 诊断。
- `pnpm exec biome format --write ...` 与适用的 `biome check`：通过；`git diff --check` 待提交前复核。

## Remaining work

仍需继续深化 Pilot Custom/Capless 其他未充分覆盖实体、Wancher 具体 SKU 和其他品牌型号，随后才是统一正式迁移、全量自动检查、真人遍历、部署与线上逐条复查。该包没有调用 `update_goal({status:"complete"})`。
