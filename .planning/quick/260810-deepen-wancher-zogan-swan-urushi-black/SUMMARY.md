# Phase 564 Summary — deepen Wancher Zogan Swan Urushi Black

## 状态

本批离线内容包已完成并准备提交。未连接 Turso，未写入真实 `data/fpkg.db`，未部署或做线上复查；全量 Fountain Pen Knowledge Graph goal 仍未完成。

## 交付

- 只更新现有 `phase519-wancher-zogan-swan-urushi-black` canonical 型号，不新造同名实体，也不改动 Urushi Teal 或其他 Swan SKU。
- 正文把官方 product id `9339187134679`、SKU `WF-AIUR-DR-ZOBK-HKU`、黑色 Urushi、珍珠母贝 Zogan、ABS 基材、JoWo / Keiryu / Keiryu Kodachi / Shogun 18K 尖材、Ebonite / Plastic feed、converter / European International Standard cartridge 与包装附件分开说明。
- 补齐 Black 与 Teal 的版本边界、手工表面差异、没有公布的尺寸／重量／限量信息、收藏与试写边界、Urushi／母贝／feed 保养、购买与二手到手核验；正文不填入缺乏证据的工匠、层数、供应链或书写承诺。
- 保留现有本站原创 factual SVG，明确非产品照片、非 Logo、不按比例、不作色卡或库存证明；来源包括 Wancher exact product JSON / 商品页、Dream Pen 集合、Nib Guide、Product Care 与京都国立博物馆螺钿背景资料。

## 验证证据

- owned checkpoint 首次运行返回 `published`，内容 hash `sha256:v3:c77ee39e775b5f14fa44b9635216febc7ec68b8d09aa786edae96c11594a94c9`；replay 返回 `noop`，hash 保持不变。
- checkpoint 读回：实体和 public row 均为 pen / `wancher-dream-pen-zogan-swan-urushi-black`，正文 4288 字符，`published`、`publishable=1`、`blocker_count=0`，8 个变体、1 份规格、1 张 primary 媒体、7 个已批准来源；Wancher `made_by` 与品牌 reverse 导航各唯一 1 条。
- 审核链读回包含 fact / language / media / publication 的当前 `approved` 记录；测试同时验证远端环境变量拒绝、真实库 hash 和 catalog snapshot 未变化。
- `pnpm exec tsx --test tests/content/phase564-wancher-zogan-swan-urushi-black.test.ts`、`pnpm exec tsc --noEmit`、Biome、SVG XML、`git diff --check`、生产 `pnpm run build` 全部通过。
- 离线 readiness / coverage / quality / library / data 审计：809 个实体（119 brands、690 pens），786 个公开且可发布，0 个 published/public blocker；23 个 backlog 仍是既有 retired donor。coverage 仍有 4 个品牌 gap 与 16 个型号 gap；quality 为 0 duplicate groups、0 suspicious pen articles、0 thin active entities、0 broken links。全量 verdict 仍为 `content_complete=false`、`complete=false`。
- 真实 `data/fpkg.db` SHA-256 保持 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。

## 边界

本批只证明现有 Zogan Swan Urushi Black 内容在受保护副本中可以经审核—发布链路更新并可重放，不证明真实库已经迁移、Turso 已回读、生产站点已部署，也不证明全站内容修复完成。额度恢复前继续处理其他缺失或证据不足型号；之后再进行正式迁移、远端读回、部署、真人遍历和线上逐页复查。
