# Phase 411 summary — Franklin-Christoph Model 20 Marietta

## Result

既有 `p73FRCMODEL20`（`franklin-christoph-model-20-marietta`）已完成来源化深化，没有新增重复实体。正文把全尺寸 Marietta 的 slip-cap、recessed nib、#6 单元、三种上墨、尺寸重量、颜色／尖型／pocket 20 边界、维护和购买条件分开说明；价格与 Jade 库存保留为检索日期快照，独立评测的量测被标为样本而非全系硬规格。

正文回读 8,267 Unicode 字符，采用 13 个独立来源组和既有原创 factual SVG；正文明确标注非产品照片、非 logo、非比例图、非颜色证明。

## Checkpoint evidence

持久 owned checkpoint：
`.planning/quick/260803-qg8-deepen-franklin-christoph-model-20-marietta/checkpoint/fpkg.db`

- `PRAGMA integrity_check`：`ok`。
- `public_entities`：id `p73FRCMODEL20`、slug `franklin-christoph-model-20-marietta`、name `Franklin-Christoph Model 20 Marietta`、body length `8267`；source marker 以 `curated-content:phase411-franklin-christoph-model20-refresh-v1:` 开头。
- 首次 apply 返回 `published`；再次 apply 返回 `noop`，hash `sha256:v3:557955c00e201f68bf58e436e331c0f54f1b4ff277559da5ed63db09bfcb2ad3` 保持不变。
- 当前 hash 的 `fact`／`language`／`media`／`publication` 四项 review 均为 `approved`；`public_entity_readiness` 为 `blocker_count=0`、`blockers_json=[]`、`publishable=1`。
- `entity_references` 为 `13` 条、`13` 个独立来源组；variants 为 `edition_group=4`、`color=1`、`nib=1`；Franklin-Christoph → Model 20 及 Model 20 → Franklin-Christoph 导航关系各唯一。
- 规格读回为 Franklin-Christoph 品牌、#6、短国际墨囊／converter／eyedropper、acrylic、138.43 mm／150 mm、19.28 g、USD 155 起价和当前集合状态；品牌 publication 仍为 `published`。
- 真实 `data/fpkg.db` 在 copy、apply 和读回后 SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；本批没有把 checkpoint DB 加入 Git。

## Verification

- `pnpm exec tsx --test tests/content/phase411-franklin-christoph-model20-refresh.test.ts`：1/1 通过（约 93 秒）；覆盖 owned-copy、远程环境拒绝、来源／媒体／6 个变体、审核发布门禁、readiness、身份关系、SQLite integrity 和 replay noop。
- `pnpm exec tsc --noEmit`：只剩仓库既有三条基线诊断：phase346 Jinhao 测试两个 `TS7022`，Turso migration test 一个 `TS2741`；Phase 411 无新增诊断。
- 适用文件 `biome check`：通过；`git diff --check`：通过。

## Remaining

本批只完成一个既有型号的内容深化，不代表全量 goal 完成。其余薄页、缺失品牌／型号、正式迁移、全站自动检查、真人遍历、部署和线上逐条复查仍需继续。
