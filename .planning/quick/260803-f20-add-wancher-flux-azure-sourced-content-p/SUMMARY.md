# Phase 386 Summary — Wancher FLUX – Azure

## Result

已为真实数据库中缺失的 Wancher FLUX – Azure 建立来源化型号内容包。它作为独立 `pen` 实体连接到既有 Wancher 品牌，不重复创建 FLUX 系列集合，也不把其三角握位、再生棉复合材料或规格挪到 Dream Pen、World Tree、Urushi 或其他 Wancher 型号。

本包包含：

- `.planning/content-research/wancher-flux-azure-phase386.md`：自然中文正文、结构/材料/尺寸/重量/供墨、维护、选购、RE:FLUX 与证据边界；正文回读 4,788 字符。
- `public/images/library/site-original/phase386/wancher/flux-azure.svg`：原创 factual SVG，明确非产品照片、非 Logo、非真实比例图、非颜色校样。
- `scripts/data/phase386-wancher-flux-azure.ts`：Wancher 品牌导航扩展与 FLUX Azure `CuratedEntityPack`。
- `scripts/apply-phase386-wancher-flux-azure-content.ts`：owned-copy guard、身份检查、`made_by`/`reverse` 拓扑与现有审核—发布路径。
- `tests/content/phase386-wancher-flux-azure.test.ts`：定向回归。

## Research evidence

- Wancher international product：圆角三角形、可旋转握位、平底、Upcycled Cotton、brass grip、JoWo/Keiryu/Shogun 18K、converter、尺寸重量、电子证书与 $150 USD 当前标价。
- Wancher Japan official：日文名称、再生棉材质、JOWO/Keiryu/Shogun、欧洲/セーラー converter、螺旋帽、17.4 mm、147.3/91.8/25.2 mm、49/38 g。
- Wancher FLUX collection：系列位置、recycled cotton 语境与 RE:FLUX 回收计划。
- David Figboot YouTube：官方商品页嵌入的独立 FLUX review video 入口；没有从未读取的完整视频外推线宽、耐久或写感。
- Wancher official Rakuten shop：日本地区销售窗口和价格语境，不当作独立评测或全球 MSRP。

未填入未经证实的棉纤维比例、树脂配方、碳足迹、完整制造地、尖幅线宽或所有国家的回收条件；用户评价中的“大笔”“偏湿”仅保留为单支体验边界。

## Verification

定向测试：

```text
pnpm exec tsx --test tests/content/phase386-wancher-flux-azure.test.ts
1 pass, 0 fail
```

测试覆盖：

- inherited remote URL rejection；
- owned non-symlink/non-hard-link checkpoint；
- Wancher brand + FLUX Azure exact identity/slug/name；
- fact/language/media/publication 四项 approved reviews；
- 3 个尖材变体、6 个型号来源、1 primary media；
- `made_by` 与 brand reverse navigation 各 1 条；
- professional secondary source group >= 1；
- 0 fact conflicts；
- replay 返回 `noop`；
- 真实 `data/fpkg.db` catalog snapshot 未变化。

持久 owned checkpoint 同时重放 Phase 385 Swan 与 Phase 386 FLUX：

`.planning/quick/260803-f20-add-wancher-flux-azure-sourced-content-p/checkpoint/fpkg-copy.db`

回读：`952 entities`、`906 public`、`644 published`；Wancher、Zogan Swan、FLUX Azure 三个身份均正确；Swan body `5240` 字符，FLUX body `4788` 字符；两个型号各 4 项 review approved；各 6 references；source groups：Swan `primary/archive=1, professional_secondary=1`，FLUX `primary/archive=3, professional_secondary=1`；0 conflicts；`PRAGMA integrity_check = ok`。

checkpoint 全库检查：

- `audit-entity-quality.ts`：661 inventory entities，639 active，22 retired lineage excluded，duplicate name groups 0，suspicious pen articles 0，thin brand/model entities 0，made_by blockers 0。
- `check-library-contract.ts`：sources 2242、sourceItems 3952、claims 3412、citations 9672、stories 689、events 822、media 957；`Library contract OK`。

保护证据：

- `checkpoint/source-snapshot.json` 记录真实 DB SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。
- apply 后真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。
- Phase 386 checkpoint DB SHA-256：`2405124ed2b32f13885397262c76e43f9a9ffa9fd9ea746cb4d5c97d10f72799`。
- checkpoint DB/source snapshot 未纳入 Git staging；真实库未迁移、线上未更新。

## Remaining

Phase 386 只完成一个 Wancher 当前具体 SKU 的 checkpoint 验证。全量 goal 仍未完成：还需继续处理其他缺失品牌/型号与低质量页，完成批次 checkpoint 集成、正式迁移、全量自动检查、真人遍历、部署和线上逐页复查；在这些证据齐全前不能标记 goal complete。
