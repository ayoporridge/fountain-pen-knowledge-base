# Phase 566 Plan — deepen Wancher Oita Urushi Kurozan

## Objective

在不连接 Turso、不写入真实 `data/fpkg.db` 的前提下，深化既有 canonical 型号 `phase521-wancher-oita-urushi-kurozan`。复用已核实的 Wancher exact product、JSON、Dream Pen、Nib Guide、Product Care 与 Kyoto National Museum 资料，补齐版本/市场边界、配置兼容、使用维护、写感证据边界与购买核对。

## Scope

- 只更新 `phase521-wancher-oita-urushi-kurozan` 的既有正文和 pack，不新增同名实体，不重新启用 Phase 545 已退休的重复身份。
- 保留 product id `9241757057239`、handle、SKU `WF-DR-OTA-KZ-BARA`、Ebonite/Oita Urushi、炭粉/朱红纹理、JoWo/Keiryu/Kodachi/18K Shogun 与 feed 兼容边界。
- 使用项目已有 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity` 审核—发布路径，在 owned checkpoint 上首次发布与 replay。

## Non-goals

- 不连接或写入 Turso，不迁移真实数据库，不部署，不做线上复查。
- 不把 Oita Urushi 写成政府地理认证，不把 JSON 价格字段写成永久全球价格，不从图片补尺寸、重量、漆层配方或独立写感。
- 不修改其他 agent 的 research、checkpoint、`.next-phase*` 或受保护 quick 目录。

## Verification

1. 定向测试确认 canonical identity、唯一 Wancher 关系、正文与来源/变体/规格/媒体边界。
2. owned checkpoint 首次 `published`、第二次 `noop`，审核走 fact/language/media 与 `publishEntity`。
3. 运行 TypeScript、Biome、SVG XML、`git diff --check`、生产构建与离线 readiness / coverage / quality / library / data 审计；记录 retired donor backlog，不把本批视为全量 goal 完成。
