# Phase 406 summary — Pilot Custom 742 sourced refresh

## Result

既有 Pilot Custom 742 实体 `x9Ds3bsbFIx2` 已在 caller-owned checkpoint copy 中完成来源化深化，并通过项目既有 `recordEntityContentReview` + `publishEntity` contract-v3 发布路径；没有写入真实 `data/fpkg.db`，也没有创建重复实体。全量 goal 仍然 active，Phase 406 不代表全站完成。

## Owned files

- `.planning/content-research/pilot-custom-742-phase406.md`
- `scripts/data/phase406-pilot-custom-742-refresh.ts`
- `scripts/apply-phase406-pilot-custom-742-refresh.ts`
- `tests/content/phase406-pilot-custom-742-refresh.test.ts`
- `.planning/quick/260803-lpk-refresh-pilot-custom-742-canonical-sourc/PLAN.md`
- `.planning/quick/260803-lpk-refresh-pilot-custom-742-canonical-sourc/SUMMARY.md`

checkpoint 数据库留在本 quick 目录中，不提交到 Git；使用的既有 `public/images/library/site-original/pilot-p0/custom-742.svg` 未被改写，其他 agent 的 research、`.next-phase*` 和 quick 目录未删除或暂存。

## Sourced content

- Pilot Japan Web Catalog exact `FKK-2000R-B`：14K No.10 F、螺纹嵌合、黑色树脂轴帽、CON-40/CON-70N、随附 CON-70N、全长 145.9 mm、最大径 φ15.7 mm、24 g、Z-CR-N3、含税 ¥49,500（税前 ¥45,000）；当前 lineup 展开 16 种尖号。
- 官方 Custom 742 支持页、国际保证清单、manual、目录分类、CUSTOM 标准型/历史与专业评测分别用于 c/c 清洗和装填、型号分立、Pilot 家族语境及试写边界；没有把 74、743、912 或 823 的结构回填到 742。
- 正文读回 8,991 Unicode 字符；pack 有 11 个来源组、17 个变体（1 个 `edition_group` + 16 个 `market_sku`），并把完整 FKK-2000R-B 尖号代码列回正文。

## Checkpoint evidence

Persistent checkpoint:
`.planning/quick/260803-lpk-refresh-pilot-custom-742-canonical-sourc/checkpoint/fpkg.db`

首次 apply 的持久副本 readback：

- `PRAGMA integrity_check` = `ok`。
- `public_entities` 中 slug 为 `pilot-custom-742`，body 长度 8,991，source marker 以 `curated-content:phase406-pilot-custom-742-refresh-v1:` 开头。
- `entity_publications` 为 `published`，content revision 与 reviewed revision 同为 325，reviewed contract version 为 3；当前内容 hash 为 `sha256:v3:a465753a237d0177c65131c0110a7e9b659c78fbb3cfbfe676597fc35c97a0c1`。
- 当前 hash 的 `fact/language/media/publication` 各有 1 条 approved；`public_entity_readiness` 为 `blocker_count=0`、`blockers_json=[]`、`publishable=1`。
- 来源引用为 11 条、独立组 11；变体为 `edition_group=1`、`market_sku=16`；正向 `made_by` 与 Pilot → 742 反向导航各只有 1 条。
- checkpoint totals 仍为 `entities=950 / public=904 / published=642`。

重放：

```text
noop x9Ds3bsbFIx2
contentHash sha256:v3:a465753a237d0177c65131c0110a7e9b659c78fbb3cfbfe676597fc35c97a0c1
```

真实库 SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。

## Verification

- `pnpm exec tsx --test tests/content/phase406-pilot-custom-742-refresh.test.ts`：通过（owned-copy 保护、远程环境拒绝、来源/规格/17 变体/媒体、审核发布门禁、readiness、身份关系和 replay noop）。第一次运行仅因正文未逐字列出 `FKK-2000R-B-FA` 与 `FKK-2000R-B-SU` 失败，补入官方代码清单后复跑通过。
- `pnpm exec tsc --noEmit`：只剩仓库既有的 3 个诊断：`phase346-jinhao-x450-x750.test.ts` 两个 TS7022、`sync-local-catalog-to-turso.test.ts` 一个 TS2741；Phase 406 无新增 TypeScript 诊断。
- `pnpm exec biome format --write ...` 与适用的 `biome check`：通过；checkpoint apply/replay 与 `git diff --check` 待提交前复核。

## Remaining work

仍需继续深化 Pilot Custom 743、Elite 95S、912 以及其他未充分覆盖的品牌/型号，随后才是统一正式迁移、全量自动检查、真人遍历、部署与线上逐条复查。该包没有调用 `update_goal({status:"complete"})`。
