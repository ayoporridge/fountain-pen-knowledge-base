# Phase 402 summary — Pilot Capless Kasuri canonical sourced refresh

## Result

既有 Pilot Capless 絣实体 `phase367-pilot-capless-kasuri` 已在 caller-owned checkpoint copy 中完成来源化深化，并通过项目既有 `recordEntityContentReview` + `publishEntity` contract-v3 发布路径；没有写入真实 `data/fpkg.db`，也没有创建重复实体。全量 goal 仍然 active，Phase 402 不代表全站完成。

## Owned files

- `.planning/content-research/pilot-capless-kasuri-phase402.md`
- `scripts/data/phase402-pilot-capless-kasuri-refresh.ts`
- `scripts/apply-phase402-pilot-capless-kasuri-refresh.ts`
- `tests/content/phase402-pilot-capless-kasuri-refresh.test.ts`
- `.planning/quick/260803-kgm-refresh-pilot-capless-kasuri-canonical-s/PLAN.md`
- `.planning/quick/260803-kgm-refresh-pilot-capless-kasuri-canonical-s/SUMMARY.md`

checkpoint 数据库留在本 quick 目录中，不提交到 Git；其他 agent 的 research、`.next-phase*` 和 quick 目录未删除或暂存。

## Sourced content

- Pilot Japan Web Catalog exact SKU `FCN-2MR-KB-F`：18K F、CON-40、按动式、全长 140 mm、最大径 φ13.4 mm、重量 30 g、使用盒 Z-CR-N3；同页 lineup 列出 KB/KL × F/M 四个完整 SKU。
- Pilot 官方护理页覆盖按动伸缩、收尖后拆装、墨囊/CON-40、清水吸排、head 与轴的清洗边界，以及溶剂、气压和自行拆修警告。
- 2026-07-01 官方价目表把 FCN-2MR 从含税 ¥35,200 修订为 ¥38,500；正文将商品页旧快照与新日期作用域明确分开。
- 官方保证清单、目录分类、Pilot manual、CUSTOM 历史与 The Pen Addict 仅用于产品线边界、供墨/维护和普通 Capless 使用背景，没有把相邻型号回填为絣的材质或尖材。

正文读回 8,108 Unicode 字符；pack 有 10 个独立来源组、6 个变体（2 个 `edition_group` + 4 个 `market_sku`），原创 SVG 继续明确 `non-photo`、`non-logo`、`not-to-scale`、`non-colour-proof`。

## Checkpoint evidence

Persistent checkpoint:
`.planning/quick/260803-kgm-refresh-pilot-capless-kasuri-canonical-s/checkpoint/fpkg.db`

首次 apply 的持久副本 readback：

- `PRAGMA integrity_check` = `ok`。
- `public_entities` 中 Kasuri 为 `pilot-capless-kasuri`，body 长度 8,108，source marker 以 `curated-content:phase402-pilot-capless-kasuri-refresh-v1:` 开头。
- `entity_publications` 为 `published`，content revision 与 reviewed revision 同为 258，reviewed contract version 为 3；当前内容 hash 为 `sha256:v3:df61cd8e057ec41990218297f215e76bd710e82dca4f1e405fe61038d5980be1`。
- 当前 hash 的 `fact/language/media/publication` 各有 1 条 approved；`public_entity_readiness` 为 `blocker_count=0`、`blockers_json=[]`、`publishable=1`。旧内容的 revoked review 记录保留为历史，未计入当前 hash。
- 来源引用为 10 条、独立组 10；变体为 `edition_group=2`、`market_sku=4`；正向 `made_by` 与 Pilot → Kasuri 反向导航各只有 1 条。
- checkpoint totals 仍为 `entities=950 / public=904 / published=642`。

重放：

```text
noop phase367-pilot-capless-kasuri
contentHash sha256:v3:df61cd8e057ec41990218297f215e76bd710e82dca4f1e405fe61038d5980be1
```

## Verification

- `pnpm exec tsx --test tests/content/phase402-pilot-capless-kasuri-refresh.test.ts`：通过；覆盖 owned-copy 保护、远程环境拒绝、来源/规格/6 变体/媒体、审核发布门禁、readiness、身份关系和 replay noop。
- `pnpm exec tsc --noEmit`：只剩仓库既有的 3 个诊断：`phase346-jinhao-x450-x750.test.ts` 两个 TS7022、`sync-local-catalog-to-turso.test.ts` 一个 TS2741；Phase 402 无新增 TypeScript 诊断。
- `pnpm exec biome format --write ...` 后，适用的 Phase 402 apply/test 检查通过；`scripts/data` 按仓库 Biome include 配置不纳入 lint，但由 TypeScript 编译覆盖。
- `git diff --check`：通过。
- 真实库快照仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；真实库未试写。

## Remaining work

仍需继续审计和深化 Pilot Capless 的 Stripe、SE、特殊合金等未充分覆盖实体，以及 Wancher 具体 SKU 和其他品牌型号，随后才是统一的正式迁移、全量自动检查、真人遍历、部署与线上逐条复查。该包没有调用 `update_goal({status:"complete"})`。
