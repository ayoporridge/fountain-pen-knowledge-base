# Phase 400 summary — Pilot Custom URUSHI canonical sourced refresh

## Result

Pilot Custom URUSHI 的既有实体 `s105PILOT_URUSHI` 已在 caller-owned checkpoint copy 中完成一次来源化深化并通过 contract-v3 发布；没有写入真实 `data/fpkg.db`，也没有迁移 Turso、部署或线上复查。全量 goal 仍然 active，Phase 400 不代表全站完成。

## Owned files

- `.planning/content-research/pilot-custom-urushi-phase400.md`
- `scripts/data/phase400-pilot-custom-urushi-refresh.ts`
- `scripts/apply-phase400-pilot-custom-urushi-refresh.ts`
- `tests/content/phase400-pilot-custom-urushi-refresh.test.ts`
- `.planning/quick/260803-jhi-refresh-pilot-custom-urushi-canonical-so/PLAN.md`
- `.planning/quick/260803-jhi-refresh-pilot-custom-urushi-canonical-so/SUMMARY.md`

既有原创 SVG `/public/images/library/site-original/pilot/custom-urushi.svg` 被复用，没有新增产品照片，也没有改动其他 agent 的 research、`.next-phase*` 或 quick 目录。checkpoint 数据库留在本 quick 目录中，不提交到 Git。

## Sourced content

- 当前 Pilot Web Catalog exact SKU：FKV-88SR-LFM；确认 18K No.30 FM、硬橡胶/蝋色漆、CON-40/CON-70N、随附 CON-70N、155 mm、最大径 20 mm、44 g、含税 ¥165,000 以及黑/朱/紺青的 FM/M/B 产品号。
- Pilot 2024-10-23 新闻稿确认紺青于 2024-11 上市，是既有 Custom URUSHI 的颜色 variant。
- Pilot FKV-88SR 支持页与通用说明书确认墨囊、CON-40、CON-70N 的装填顺序，长期停用清水吸排、帽/轴不可浸洗、不可自行维修、避开溶剂和颜料墨水“强色”等边界。
- Pilot CUSTOM 专题提供 Luccanite/硬橡胶漆工艺语境，并把 FKV-88SR 的 No.30 与 Custom 845 的 No.15 分开。
- The Gentleman Stationer、Goulet 与 Andrew Lensky 作为专业二手资料，补充 2016 型号起点、No.30 体量/书写体验和 823/845/743/912 sibling 边界；主观体验未写成统一规格。

Pack 现有 12 个独立来源组、12 个变体（3 个颜色 edition group + 9 个现行 market SKU），正文 `loadCuratedEntityPack` 读取为 8,115 Unicode 字符；主图明确标注“非产品照片”。

## Checkpoint evidence

Persistent checkpoint:
`.planning/quick/260803-jhi-refresh-pilot-custom-urushi-canonical-so/checkpoint/fpkg.db`

首次 apply：

```text
published s105PILOT_URUSHI
contentHash sha256:v3:29cc18ce8a9b32f064bfe2c495f81f4e34ead7e3cd3135f3e639b77bdbfd1eaf
```

重放：

```text
noop s105PILOT_URUSHI
contentHash sha256:v3:29cc18ce8a9b32f064bfe2c495f81f4e34ead7e3cd3135f3e639b77bdbfd1eaf
```

持久副本 readback：

- `PRAGMA integrity_check` = `ok`。
- Pilot brand `Zt-PbXkE7UHM` 仍为 `百乐 Pilot`；URUSHI slug 为 `pilot-custom-urushi`，public body 长度 8,115；Pilot brand body 未被正文包替换。
- URUSHI 来源引用 12 条、独立组 12；变体为 `edition_group=3`、`market_sku=9`。
- 当前内容 hash 的 `fact/language/media/publication` 四项均各 1 条 approved；旧 hash 的 revoked rows 仅保留审计历史。
- `public_entity_readiness` = `blocker_count=0`、`blockers_json=[]`、`publishable=1`。
- 正向 `made_by` 只有 `s105PILOT_URUSHI → Zt-PbXkE7UHM` 一条；Pilot → URUSHI 反向导航只有一条。
- checkpoint totals 仍为 `entities=950 / public=904 / published=642`。

## Verification

- `pnpm exec tsx --test tests/content/phase400-pilot-custom-urushi-refresh.test.ts`：通过；测试覆盖 owned-copy 保护、远程环境拒绝、来源/规格/12 变体/媒体、审核发布门禁、readiness、身份关系和 replay noop。
- `pnpm exec tsc --noEmit`：只剩仓库既有的 3 个诊断：`phase346-jinhao-x450-x750.test.ts` 两个 TS7022、`sync-local-catalog-to-turso.test.ts` 一个 TS2741；Phase 400 无新增 TypeScript 诊断。
- `pnpm exec biome format --write tests/content/phase400-pilot-custom-urushi-refresh.test.ts` 后，适用的 Phase 400 apply/test 检查通过；`scripts/data` 按仓库 Biome include 配置不纳入 lint，但由 TypeScript 编译覆盖。
- `git diff --check`：通过。
- 真实库快照保持 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；真实库未试写。

## Remaining work

仍需继续审计和深化真实未充分覆盖的 Pilot/Wancher 具体 SKU 及其他品牌型号，随后才是统一的正式迁移、全量自动检查、真人遍历、部署与线上逐条复查。该包没有调用 `update_goal({status:"complete"})`。
