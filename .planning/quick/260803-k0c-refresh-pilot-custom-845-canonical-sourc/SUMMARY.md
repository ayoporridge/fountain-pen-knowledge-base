# Phase 401 summary — Pilot Custom 845 canonical sourced refresh

## Result

既有 Pilot Custom 845 实体 `2_L9OS-kqqQV` 已在 caller-owned checkpoint copy 中完成来源化深化并通过 contract-v3 发布；没有写入真实 `data/fpkg.db`，也没有迁移 Turso、部署或线上复查。全量 goal 仍然 active，Phase 401 不代表全站完成。

## Owned files

- `.planning/content-research/pilot-custom-845-phase401.md`
- `scripts/data/phase401-pilot-custom-845-refresh.ts`
- `scripts/apply-phase401-pilot-custom-845-refresh.ts`
- `tests/content/phase401-pilot-custom-845-refresh.test.ts`
- `public/images/library/site-original/pilot-p0/custom-845.svg`（修正既有示意图的 14K → 18K 笔尖事实）
- `.planning/quick/260803-k0c-refresh-pilot-custom-845-canonical-sourc/PLAN.md`
- `.planning/quick/260803-k0c-refresh-pilot-custom-845-canonical-sourc/SUMMARY.md`

checkpoint 数据库留在本 quick 目录中，不提交到 Git；其他 agent 的 research、`.next-phase*` 和 quick 目录未删除或暂存。

## Sourced content

- Pilot 日本 Web Catalog exact SKU `FKV-5MR-B-F`：18K No.15、ebonite/蝋色漆、CON-40/CON-70N、全长 147 mm、最大径 φ15.9 mm、重量 28 g、含税建议零售价 ¥132,000（税前 ¥120,000）。同一官方页面展开漆黑、朱、紺青三组与 F/M/B/BB 十二个 market SKU。
- Pilot CUSTOM 官方历史将 `CUSTOM845 FKV-5MR` 放在 2002 年，并把它与 823、743、2016 年 URUSHI 分开；官方支持和通用说明书覆盖墨囊、CON-40、CON-70N、清水吸排、帽/轴不可浸洗、漆面溶剂与颜料墨水边界。
- Goulet、The Gentleman Stationer、Fountain Pen Network、Scrively 只用于系列比较与主观试写边界，未替代官方型号、规格或维护事实。

Pack 共有 12 个独立来源组、15 个变体（3 个 `edition_group` + 12 个 `market_sku`），正文读回 8,176 Unicode 字符；原创 SVG 明确标注“非产品照片”，并已修正笔尖材质文字。

## Checkpoint evidence

Persistent checkpoint:
`.planning/quick/260803-k0c-refresh-pilot-custom-845-canonical-sourc/checkpoint/fpkg.db`

首次 apply 的持久副本 readback：

- `PRAGMA integrity_check` = `ok`。
- `public_entities` 中 845 为 `pilot-custom-845`，body 长度 8,176，source marker 以 `curated-content:phase401-pilot-custom-845-refresh-v1:` 开头。
- `entity_publications` 为 `published`，content revision 与 reviewed revision 同为 341，reviewed contract version 为 3；当前内容 hash 为 `sha256:v3:aaaee6036256d2fb0bdf7a5b2e4922fa707e10cb4c14903e261267dd64c30259`。
- 当前 hash 的 `fact/language/media/publication` 四项各有 1 条 approved；`public_entity_readiness` 为 `blocker_count=0`、`blockers_json=[]`、`publishable=1`。
- 来源引用为 12 条、独立组 12；变体为 `edition_group=3`、`market_sku=12`；正向 `made_by` 和 Pilot → 845 反向导航各只有 1 条。
- checkpoint totals 仍为 `entities=950 / public=904 / published=642`。

重放：

```text
noop 2_L9OS-kqqQV
contentHash sha256:v3:aaaee6036256d2fb0bdf7a5b2e4922fa707e10cb4c14903e261267dd64c30259
```

## Verification

- `pnpm exec tsx --test tests/content/phase401-pilot-custom-845-refresh.test.ts`：通过；覆盖 owned-copy 保护、远程环境拒绝、来源/规格/15 变体/媒体、审核发布门禁、readiness、身份关系和 replay noop。
- `pnpm exec tsc --noEmit`：只剩仓库既有的 3 个诊断：`phase346-jinhao-x450-x750.test.ts` 两个 TS7022、`sync-local-catalog-to-turso.test.ts` 一个 TS2741；Phase 401 无新增 TypeScript 诊断。
- `pnpm exec biome format --write ...` 后，适用的 Phase 401 apply/test 检查通过；`scripts/data` 按仓库 Biome include 配置不纳入 lint，但由 TypeScript 编译覆盖。
- `git diff --check`：通过。
- 真实库快照保持 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`（size `59924480`）；真实库未试写。

## Remaining work

仍需继续审计和深化真实未充分覆盖的 Pilot Capless／Wancher 具体 SKU 及其他品牌型号，随后才是统一的正式迁移、全量自动检查、真人遍历、部署与线上逐条复查。该包没有调用 `update_goal({status:"complete"})`。
