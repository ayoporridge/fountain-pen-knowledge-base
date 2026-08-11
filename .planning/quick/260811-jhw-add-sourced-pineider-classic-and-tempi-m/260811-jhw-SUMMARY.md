---
status: complete
quick_id: 260811-jhw
scope: direct-content-repair
source_commit: fa692811
---

# Phase 589：发布 Pineider Classic Palladium 与 Tempi Moderni

本 quick 在 Phase 588 owned candidate 的后继 copy 上新增 Pineider Classic Palladium PP5801／779 与 Tempi Moderni PP6001／614，并升级既有 Pineider 品牌导航。Turso 未被查询，真实 `data/fpkg.db` 未被写入；full corpus goal 仍为 active。

## 已交付

- 复用 canonical Pineider 品牌 `phase140-brand-pineider`，品牌页现在链接 Avatar UR、Arco、Rock、Classic Palladium、Tempi Moderni 五个公开型号。
- Classic Palladium 锁定当前官网 PP5801／779：144 mm、直径 15.5 mm、钢尖 EF／F／M、磁吸封帽、活塞上墨。Rose Gold 零售档案的 cartridge／converter 被保留为 sibling 冲突，不回填到当前 Palladium 规格。
- Tempi Moderni 锁定当前官网 PP6001／614：155 mm、直径 17.3 mm、UltraResin、钢尖 EF／F／M、磁吸 Lock System、活塞上墨，并用 2023 官方发布资料说明圆角三角截面与产品线起点。
- 两个型号均有自然中文正文、规格／历史／版本／维护／选购段落、来源链和各自独立的 1600×900 原创事实示意图。
- 全部内容经 fact／language／media review 与 `publishEntity` 发布路径；持久化 candidate 重放时品牌与两个型号均为 `noop`，定向回归同时覆盖首次发布与幂等重放。

## 离线验收

- 输入候选 SHA-256：`38aa7567e78d88800d0d5a2a48ae13a3dd1dda7a614320f3ff9cfd692daf0e90`。
- 输出候选 SHA-256：`1df98914365416065be29ddca9d4b4a1c919a5617aeacc8a6e9c9b2394825960`。
- 真实库 SHA-256：`acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`，前后不变。
- 定向回归 1／1 通过；TypeScript、精确 Biome format、diff check、SQLite integrity／foreign-key、library contract、production build 全部通过。
- readiness：819 个 inventory、795 个 current public、795 个 content-ready，published／public blocker 均为 0；24 个 backlog 均为保留的 retired lineage，因此总审计的 `content_complete` 仍如实为 false。
- entity quality：795 个 active entity 无 thin brand/model、made_by blocker、duplicate-name group 或 suspicious pen article；24 个 retired lineage 被明确排除。
- media audit 为 811／811 healthy，全部 current public primary media path 重复组为 0；两张新图已人工查看，无裁切、溢出或错位。
- 本地 production readback：`/brand/pineider`、两个新型号页与两张 SVG 均 HTTP 200，品牌页包含两个新增型号链接，型号页能读回 exact SKU 与正文标记。
- checkpoint、readiness 与 media evidence 只在本 quick 本地保留，不提交 Git。

## 下一步

继续从现有 research、wrapper 与 Phase 589 candidate 推导真正尚未覆盖的重要型号，离线完成来源化正文、身份、关系、图片和回归。内容封板后再统一迁移真实本地库并真人遍历；Turso 额度恢复后才进行云端同步、生产部署和线上逐条复查。
