# Phase 476 Plan — deepen existing Parker Ingenuity, Urban and Vector XL

## Goal

复用既有 Parker canonical 型号，补充当前官方 SKU 的材料、饰件、笔尖、书写模式、供墨、维护和选购边界；明确 Ingenuity／Urban／Vector XL 与相邻书写模式和经典 Vector 的身份差异，不新建实体、不写真实 catalog。

## Scope

- `parker-ingenuity-fountain-pen` → `b16OmQf7Jwfr`
- `parker-urban-fountain-pen` → `PbA7NulBdLC-`
- `parker-vector-xl-fountain-pen` → `P7LgZR6-DDPi`

## Verification

1. 复查 Parker 当前 Ingenuity 2213726、Urban 1931593、Vector XL 2159744 商品页及 Nib Exchange、Refills/Care 官方说明。
2. 从 Phase 475 owned checkpoint 复制 disposable catalog，迁移后用审核—发布链路 apply 并 replay。
3. 检查 exact identity、Parker maker/reverse navigation、来源、主媒体、四项审核和 publication contract v3。
4. 运行 SQLite 完整性、library contract、quality audit、定向 test、Biome、diff 和全仓 TypeScript。

## Guardrails

- 只使用本阶段 owned checkpoint；不连接 Turso，不写 `data/fpkg.db`。
- 不删除或暂存其他 agent 的 research、`.next-phase*`、Montblanc quick 或其它 checkpoint。
- 保留现有 Parker aliases、variants、primary diagrams、历史 Vector 分叉和品牌导航；当前 SKU 证据只追加，不覆盖相邻实体。
