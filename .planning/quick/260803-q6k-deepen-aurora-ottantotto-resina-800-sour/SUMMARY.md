# Phase 410 summary — Aurora Ottantotto Resina 800

## Result

既有 `Aurora Ottantotto Resina (800)` 实体（`aurora-ottantotto-resina-800`）已完成来源化深化，没有新增重复的 Aurora 88 型号。正文固定在当前商品号 800：黑色树脂笔帽与笔身、金色饰件、活塞供墨、EF/F/M/B 选项；意大利官网检索日价格为 €650，价格注明只适用于意大利市场且不含运费。官方 FAQ 与高端目录把 88／800 路线置于 14K、隐藏备用墨仓和 Aurora 自制笔尖语境，但未将无 exact SKU 证据的容量、尺寸和重量写成当前硬规格。

正文读回 8,501 Unicode 字符，分开说明 1947 年 Marcello Nizzoli 的家族历史、Ottantotto Millerighe／800-C／Ebanite／Black Mamba／Optima 边界、2007 800/C chrome-trim 历史样本、活塞清洗、价格库存快照、二手核对和非产品照片声明。

## Checkpoint evidence

持久 owned checkpoint：
`.planning/quick/260803-q6k-deepen-aurora-ottantotto-resina-800-sour/checkpoint/fpkg.db`

- `PRAGMA integrity_check`：`ok`。
- `public_entities`：id `phase114-aurora-ottantotto-resina-800`、slug `aurora-ottantotto-resina-800`、name `Aurora Ottantotto Resina (800)`、body length `8501`；source marker 以 `curated-content:phase410-aurora-ottantotto-resina-800-refresh-v1:` 开头。
- `entity_publications`：`published`，content revision 与 reviewed revision 均为 `225`，contract version `3`；content hash `sha256:v3:ce5ae0d1354efa6fa4b55f81ef67bc4f541365dec7259ba2ad19428d07339233`。
- 当前 hash 的 `fact`／`language`／`media`／`publication` 四项 review 均为 `approved`；`public_entity_readiness` 为 `blocker_count=0`、`blockers_json=[]`、`publishable=1`。
- `entity_references` 为 `13` 条、`13` 个独立来源组；variants 为 `edition_group=1`、`market_sku=4`；Aurora → 800 及 800 → Aurora 导航关系各唯一。
- 规格读回为 Aurora 品牌、EF/F/M/B 与 14K 作用域、活塞、黑色树脂／金色饰件、€650 意大利快照和检索日 `Disponibile`；Aurora 品牌 publication 仍为 `published`。
- checkpoint totals：`entities=950 / public=904 / published=642 / sources=3953 / claims=3388 / citations=9643 / media=955`。
- 首次 apply 返回 `published`；重复 apply 返回 `noop`，hash 与首次相同。
- 真实 `data/fpkg.db` 在 copy、apply 和读回后 SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；本批没有把 checkpoint DB 加入 Git。

## Verification

- `pnpm exec tsx --test tests/content/phase410-aurora-ottantotto-resina-800-refresh.test.ts`：1/1 通过（约 95 秒）；覆盖 owned-copy、远程环境拒绝、来源／媒体／5 个变体、审核发布门禁、readiness、身份关系、SQLite integrity 和 replay noop。
- `pnpm exec tsc --noEmit`：Phase 410 修复后只剩仓库既有三条基线诊断：phase346 Jinhao 测试两个 `TS7022`，Turso migration test 一个 `TS2741`。
- `pnpm exec biome format --write ...` 与适用文件 `biome check`：通过；`git diff --check`：通过。

## Remaining

Phase 410 只完成一个既有 Aurora 型号的 checkpoint 内容深化；全量 goal 仍 active。尚有其他低信息量／未覆盖品牌与型号、批次级正式迁移、全量自动检查、真人全页面遍历、部署和线上逐条复查；在这些证据齐全前不能标记 goal complete。
