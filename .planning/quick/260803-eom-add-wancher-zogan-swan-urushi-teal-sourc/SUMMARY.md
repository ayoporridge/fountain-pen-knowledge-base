# Phase 385 Summary — Wancher Dream Pen Zogan Swan – Urushi Teal

## Result

已为真实数据库中缺失的 Wancher 具体 SKU 建立来源化内容包：`Wancher Dream Pen Zogan – Urushi Teal`。它作为独立 `pen` 实体连接到既有 Wancher 品牌，不重复创建 Dream Pen 系列导航，也不合并 Sakura River、Momiji、Yuki Zuki 等相邻 Zogan SKU。

本包包含：

- `.planning/content-research/wancher-zogan-swan-urushi-teal-phase385.md`：自然中文正文、规格、限量/工艺/版本边界、维护、选购与证据边界；正文回读 5,240 字符。
- `public/images/library/site-original/phase385/wancher/zogan-swan.svg`：原创 factual SVG，明确非产品照片、非 Logo、非真实比例图、非颜色校样。
- `scripts/data/phase385-wancher-zogan-swan.ts`：Wancher 品牌导航扩展与 Zogan Swan `CuratedEntityPack`。
- `scripts/apply-phase385-wancher-zogan-swan-content.ts`：owned-copy guard、身份检查、`made_by`/`reverse` 拓扑与现有审核—发布路径。
- `tests/content/phase385-wancher-zogan-swan.test.ts`：定向回归。

## Research evidence

- Wancher official product：仅制作 10 支；ABS、Aizu Urushi、珍珠母贝 Zogan；国际墨囊/converter；#6 JoWo stainless、Keiryu、Keiryu Kodachi、Shogun 18K；气密帽、护理、包装与当前 $600 USD 标价。
- Wancher official Zogan collection：Swan 与 Sakura River、Momiji、Ada Zakura、Yuki Zuki 等是并列的具体 SKU。
- Wancher Dream Pen collection：Dream Pen 是跨材料与工艺的系列导航，不是一支共享固定规格的单型号。
- Wancher Testimonials：品牌自有页面托管 Zogan Swan 的外部体验摘录；仅作为体验线索，未当作独立规格证据。
- Figboot on Pens sitemap：公开列出 2026-05-25 的 `Wancher Zogan Swan Urushi Teal` review entry；因正文未展开，未从标题外推尺寸、线宽、耐久或写感。

未填入未经证实的尺寸、重量、编号规则、完整制造地、尖幅线宽、漆层工序或耐久寿命；商品页的 `Size & Shape` 仅以图片呈现。

## Verification

定向测试：

```text
pnpm exec tsx --test tests/content/phase385-wancher-zogan-swan.test.ts
1 pass, 0 fail
```

测试覆盖：

- inherited remote URL rejection；
- owned non-symlink/non-hard-link checkpoint；
- Wancher brand + Zogan Swan identity and exact slug/name；
- fact/language/media/publication 四项 approved reviews；
- 4 个尖材变体、6 个型号来源、1 primary media；
- `made_by` 与 brand reverse navigation 各 1 条；
- professional secondary source group >= 1；
- 0 fact conflicts；
- replay 返回 `noop`；
- 真实 `data/fpkg.db` catalog snapshot 未变化。

持久 owned checkpoint：

`.planning/quick/260803-eom-add-wancher-zogan-swan-urushi-teal-sourc/checkpoint/fpkg-copy.db`

CLI apply 回读：

```json
{
  "entities": [
    {"entityId":"eOfD77nOeENN","outcome":"published","contentHash":"sha256:v3:c6af55f26c3de04d02dfeb83960dff97f9294006c64278ed87c6416196d2e9cd"},
    {"entityId":"phase385-pen-wancher-zogan-swan","outcome":"published","contentHash":"sha256:v3:535d95955a1b4b67b5905cbe2ec3758d6eccc77601a4754771d51cd946c921a7"}
  ]
}
```

checkpoint readback：`951 entities`、`905 public`、`643 published`；目标实体名/slug 正确；body `5240` 字符；4 项 review approved；6 references；source groups `primary/archive=1`、`professional_secondary=1`；0 conflicts；`PRAGMA integrity_check = ok`。

checkpoint 全库检查：

- `audit-entity-quality.ts`：660 inventory entities，638 active，22 retired lineage excluded，duplicate name groups 0，suspicious pen articles 0，thin brand/model entities 0，made_by blockers 0。
- `check-library-contract.ts`：sources 2236、sourceItems 3946、claims 3396、citations 9645、stories 688、events 822、media 956；`Library contract OK`。

保护证据：

- apply 前源快照写入 `checkpoint/source-snapshot.json`，真实 DB SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。
- apply 后真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。
- checkpoint DB SHA-256：`3d67e075322ccc18c487fe5eba3446ac8ae3ff2e2ff9c2afbbef80f90c78b7ad`。
- checkpoint DB 与 source snapshot 未纳入 Git staging；真实库未迁移、未宣称线上已更新。

## Remaining

本 Phase 只完成一个 Wancher 当前具体 SKU 的 checkpoint 验证。全量 goal 仍未完成：还需继续处理真实缺失品牌/型号与低质量页，完成批次级 checkpoint 集成、正式迁移、全量自动检查、真人遍历、部署与线上逐页复查；在这些证据齐全前不能标记 goal complete。
