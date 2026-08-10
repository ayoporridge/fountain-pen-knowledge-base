# Phase 565 Plan — deepen Wancher Kyoto Urushi Kasane-iro Asagao

## Objective

在不连接 Turso、不写入真实 `data/fpkg.db` 的前提下，加深现有 `phase519-wancher-kyoto-urushi-asagao` 内容包。保留官方 product JSON、商品页、Dream Pen 导航、Nib Guide、Product Care 与 Kasane no Irome 背景来源，补齐自然中文正文、颜色/夹子/尖/feed 身份边界、Urushi 使用维护与购买核验。

## Scope

- 只更新现有 Asagao exact product record 与其既有 pack；不新增同名实体，不触碰其他 Kyoto Urushi 颜色。
- 保留产品编号 `9324911526103`、三个 clip SKU、Ebonite / Urushi、JoWo / Wancher 18K / Keiryu / Kodachi / Shogun 18K、三种 feed 与欧规供墨事实。
- 用现有 `CuratedEntityPack` 审核—发布链路，在 owned checkpoint 上首次运行与 replay；真实库只做 hash 保护。

## Non-goals

- 不连接或写入 Turso，不迁移真实数据库，不部署，不做线上复查。
- 不把 No Clip、Chrome Clip、Gold Clip 拆成三个型号，不把 Kasane no Irome 背景写成固定色卡或漆液配方。
- 不修改其他 agent 的 research、checkpoint、`.next-phase*` 或受保护 quick 目录。

## Verification

1. 定向测试确认现有 canonical identity、唯一双向 Wancher 关系、既有变体与来源、正文无内部术语。
2. owned checkpoint 首次 `published`、第二次 `noop`，审核走 fact/language/media 与 `publishEntity`。
3. 运行 TypeScript、Biome、SVG XML、`git diff --check`、生产构建与离线 readiness / quality / library / data 审计；保留 23 个 retired donor backlog 的全量边界。
