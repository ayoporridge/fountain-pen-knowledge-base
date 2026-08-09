---
name: refresh-existing-schneider-ray
status: complete
completed: 2026-08-09
---

# Phase 551 summary

## Result

在不新建实体的前提下刷新了已有 Schneider Ray 型号 `phase139-schneider-ray`。内容锚定 Schneider 美国官网 Article No. 168213：pistacchio、右手 M+、GTIN 4004675183279；补齐橡胶化握区、不锈钢 iridium 尖、标准墨囊、piston converter、随附 royal-blue 可擦墨囊、可替换前端，以及左手 L 同时改变笔尖与握区的边界。地区页面“当前不可用”仅保留为库存观察，没有推导全球停产；尺寸和重量继续标为官网未公布。

## Verification evidence

- 资料文件：`.planning/content-research/schneider-ray-current-depth-publishable-content-2026-08-09.md`，5,002 字符；发布正文读回 4,344 字符。
- 官方来源：
  - https://schneiderpen.com/us/fountain-pen/ray/168213
  - https://schneiderpen.com/de/produkte/ersatz-vorderteil-fuer-fuellhalter/ray/168496
- owned checkpoint：`checkpoint/catalog-551.db`，由既有 `catalog-2.db` 复制，未使用 Turso。
- 首次 CLI 应用：品牌 `4RLQzNpb6WbN` 与型号 `phase139-schneider-ray` 均 `published`；型号 hash `sha256:v3:7f5cae1474b19f19668b85485edb70a6d1350cd618b6520b3a24b0af9facb8b0`。
- CLI replay：品牌与型号均 `noop`，hash 不变。
- SQLite 读回：型号 `published`，`content_revision=147`、审核 revision 相等、contract version 3；当前 hash 对应 fact/language/media/publication 四项均 `approved`；5 条 approved references；1 个 model spec、10 条 approved spec evidence；1 个 primary media；唯一 `made_by -> 4RLQzNpb6WbN`；`PRAGMA integrity_check` 为 `ok`。
- 定向测试：`pnpm exec tsx --test tests/content/phase551-schneider-ray-current-depth.test.ts` 通过（1/1，约 50 秒）。
- TypeScript：`pnpm exec tsc --noEmit` 通过。
- Biome：定向检查通过；`git diff --check` 通过。
- 真实库保护：`data/fpkg.db` SHA-256 仍为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`；本阶段没有正式迁移、没有远端写入。

## Remaining boundary

本批只完成 Schneider Ray 的可重放内容包。全量 goal 仍未完成：其他低信息量/缺失型号、全站正式迁移、全量自动检查、真人遍历、部署和线上逐条复查仍需继续推进。
