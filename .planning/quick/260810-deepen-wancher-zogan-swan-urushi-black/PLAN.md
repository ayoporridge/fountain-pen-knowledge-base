# Phase 564 Plan — deepen Wancher Zogan Swan Urushi Black

## Objective

在不连接 Turso、不写入真实 `data/fpkg.db` 的前提下，加深现有 `phase519-wancher-zogan-swan-urushi-black` 内容包。保留官方产品 JSON、商品页、Dream Pen 导航、Nib Guide、Product Care 与京都国立博物馆的来源边界，补齐自然中文正文、版本身份、工艺、供墨、维护、选购和到手核验。

## Scope

- 只更新现有 Zogan Swan Urushi Black 实体与其现有 pack；不新增同名实体，不触碰 Teal 或其他 Swan SKU。
- 保留官方产品编号 `9339187134679`、SKU `WF-AIUR-DR-ZOBK-HKU`、ABS / Urushi / Zogan、JoWo / Keiryu / Kodachi / Shogun 18K、Ebonite / Plastic feed、converter / European International Standard cartridge 等已核实字段。
- 用现有 `CuratedEntityPack` 的审核—发布链路，在 owned checkpoint 上首次运行与 replay；真实库只做 hash 保护。

## Non-goals

- 不连接或写入 Turso，不迁移真实数据库，不部署，不做线上复查。
- 不把 Urushi Black、Urushi Teal 或其他颜色拆成新的实体，不把京都博物馆的工艺背景写成 Black SKU 的供应链证明。
- 不修改其他 agent 的 research、checkpoint、`.next-phase*` 或受保护 quick 目录。

## Verification

1. 定向测试确认现有 canonical identity、唯一双向 Wancher 关系、既有变体与来源、正文无内部术语。
2. owned checkpoint 首次 `published`、第二次 `noop`，审核走 fact/language/media 与 `publishEntity`。
3. 运行 TypeScript、Biome、SVG XML、`git diff --check`、生产构建与离线 readiness / quality / library / data 审计；保留 23 个 retired donor backlog 的全量边界。
