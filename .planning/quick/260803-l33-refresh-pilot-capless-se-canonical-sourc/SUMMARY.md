# Phase 404 summary — Pilot Capless SE canonical sourced refresh

## Result

既有 Pilot Capless SE 实体 `phase367-pilot-capless-se` 已在 caller-owned checkpoint copy 中完成来源化深化，并通过项目既有 `recordEntityContentReview` + `publishEntity` contract-v3 发布路径；没有写入真实 `data/fpkg.db`，也没有创建重复实体。全量 goal 仍然 active，Phase 404 不代表全站完成。

## Owned files

- `.planning/content-research/pilot-capless-se-phase404.md`
- `scripts/data/phase404-pilot-capless-se-refresh.ts`
- `scripts/apply-phase404-pilot-capless-se-refresh.ts`
- `tests/content/phase404-pilot-capless-se-refresh.test.ts`
- `.planning/quick/260803-l33-refresh-pilot-capless-se-canonical-s/PLAN.md`
- `.planning/quick/260803-l33-refresh-pilot-capless-se-canonical-s/SUMMARY.md`

checkpoint 数据库留在本 quick 目录中，不提交到 Git；其他 agent 的 research、`.next-phase*` 和 quick 目录未删除或暂存。

## Sourced content

- Pilot Japan Web Catalog exact SKU `FCSE-3MR-MAR-F`：18K F、ノブノック式、轴为氨基甲酸酯树脂、CON-40、全长 140 mm、最大径 φ14 mm、重量 26 g、使用盒 Z-CR-N3、含税 ¥44,000；lineup 列 MAB/MAL/MAG/MAR/MAO 五色，每色 F/M。
- 官方 exact page 说明「SE」来自法语 `Seul`，并强调大理石纹理每支不会完全相同；正文把纹理差异与产品身份、代码和笔况分开。
- Pilot 护理、国际保证清单、manual、目录分类、新闻稿、CUSTOM 历史与 The Pen Addict 用于按动、供墨、维护、Custom Heritage SE 和相邻路线边界；没有把其他 Capless 的材质或尖材回填到 SE。

正文读回 8,342 Unicode 字符；pack 有 10 个独立来源组、11 个变体（1 个 `edition_group` + 10 个 `market_sku`），原创 SVG 继续明确 `Non-photo`、`non-logo`、`not-to-scale`、`non-colour-proof`。

## Checkpoint evidence

Persistent checkpoint:
`.planning/quick/260803-l33-refresh-pilot-capless-se-canonical-sourc/checkpoint/fpkg.db`

首次 apply 的持久副本 readback：

- `PRAGMA integrity_check` = `ok`。
- `public_entities` 中 SE 为 `pilot-capless-se`，body 长度 8,342，source marker 以 `curated-content:phase404-pilot-capless-se-refresh-v1:` 开头。
- `entity_publications` 为 `published`，content revision 与 reviewed revision 同为 274，reviewed contract version 为 3；当前内容 hash 为 `sha256:v3:dfb6c6a3d3ab0ca4a218fd17b7c8a3923f198e904b657555ff90a095d715af9a`。
- 当前 hash 的 `fact/language/media/publication` 各有 1 条 approved；`public_entity_readiness` 为 `blocker_count=0`、`blockers_json=[]`、`publishable=1`。
- 来源引用为 10 条、独立组 10；变体为 `edition_group=1`、`market_sku=10`；正向 `made_by` 与 Pilot → SE 反向导航各只有 1 条。
- checkpoint totals 仍为 `entities=950 / public=904 / published=642`。

重放：

```text
noop phase367-pilot-capless-se
contentHash sha256:v3:dfb6c6a3d3ab0ca4a218fd17b7c8a3923f198e904b657555ff90a095d715af9a
```

## Verification

- `pnpm exec tsx --test tests/content/phase404-pilot-capless-se-refresh.test.ts`：通过；覆盖 owned-copy 保护、远程环境拒绝、来源/规格/11 变体/媒体、审核发布门禁、readiness、身份关系和 replay noop。第一次运行只因正文含内部词 `canonical` 失败，改成面向读者的「标准身份」后复跑通过。
- `pnpm exec tsc --noEmit`：只剩仓库既有的 3 个诊断：`phase346-jinhao-x450-x750.test.ts` 两个 TS7022、`sync-local-catalog-to-turso.test.ts` 一个 TS2741；Phase 404 无新增 TypeScript 诊断。
- `pnpm exec biome format --write ...` 后，适用的 Phase 404 apply/test 检查通过；`scripts/data` 按仓库 Biome include 配置不纳入 lint，但由 TypeScript 编译覆盖。
- `git diff --check`：通过。
- 真实库快照仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；真实库未试写。

## Remaining work

仍需继续审计和深化 Pilot Capless 特殊合金等未充分覆盖实体，以及 Wancher 具体 SKU 和其他品牌型号，随后才是统一的正式迁移、全量自动检查、真人遍历、部署与线上逐条复查。该包没有调用 `update_goal({status:"complete"})`。
