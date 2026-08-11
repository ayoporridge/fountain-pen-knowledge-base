---
status: complete
quick_id: 260811-ior
scope: direct-content-repair
source_commit: 97f9da15
---

# Phase 588：发布 Pineider Arco 与 Rock

本 quick 在 Phase 587 owned candidate 的后继 copy 上新增 Pineider Arco 与 Rock 两个来源化型号，并升级既有 Pineider 品牌导航。Turso 未被访问，真实 `data/fpkg.db` 未被写入；full corpus goal 仍为 active。

## 已交付

- 复用 canonical Pineider 品牌 `phase140-brand-pineider`，品牌页现在链接 Avatar UR、Arco、Rock 三个公开型号。
- 新增 Arco `PP5901/617`：以当前官方系列页为主，隔离 2019 Oak 限量样本，不把它误写成 OMAS Arco celluloid。
- 新增 Rock `PP4901/426`：以当前官方页和较新的零售档案确认 piston filling；旧 gift guide 的 converter 说法作为 rejected conflict 保留，不进入 current model spec。
- 两个型号均有自然中文正文、完整规格／历史／版本／维护／选购段落、来源链和各自独立的 1600×900 原创事实示意图。
- 全部内容经 fact／language／media review 与 `publishEntity` 发布路径；首次 apply 为 Pineider 品牌 +2 型号发布，第二次 3/3 全部 `noop`。

## 离线验收

- 输入候选 SHA-256：`a4de9c8f2ce0cb7b3f9d1d0c1ffaf20ee9d0c461782cd537a282db43739b463e`。
- 输出候选 SHA-256：`38aa7567e78d88800d0d5a2a48ae13a3dd1dda7a614320f3ff9cfd692daf0e90`。
- 真实库 SHA-256：`acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`，前后不变。
- 定向回归 1/1 通过；TypeScript、精确 Biome format、diff check、SQLite integrity／foreign-key、library contract、production build 全部通过。
- readiness：817 个 inventory、793 个 current public、793 个 content-ready，published/public blocker 均为 0；24 个 backlog 均为保留的 retired lineage，因此总审计的 `content_complete` 仍如实为 false。
- entity quality：793 个 active entity 无 thin brand/model、made_by blocker、duplicate-name group 或 suspicious pen article；24 个 retired lineage 被明确排除。
- media audit 为 809/809 healthy，全部 current public primary media path 重复组为 0；两张新图已人工查看，无裁切、溢出或错位。
- 本地 production readback：`/brand/pineider`、`/pen/pineider-arco-fountain-pen`、`/pen/pineider-rock-fountain-pen` 与两张 SVG 均 HTTP 200，品牌页包含两个新增型号链接。
- checkpoint、readiness 与 media evidence 只在本 quick 本地保留，不提交 Git。

## 下一步

继续从现有 research、wrapper 与 Phase 588 candidate 推导真正尚未覆盖的重要型号，离线完成来源化正文、身份、关系、图片和回归。内容封板后再统一迁移真实本地库并真人遍历；Turso 额度恢复后才进行云端同步、生产部署和线上逐条复查。
