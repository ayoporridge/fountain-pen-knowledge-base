# Phase 475 Plan — deepen existing Wancher Temari, Sakura Zukiyo and Kyoto Ume

## Goal

复用 Phase 138 的三个 Wancher regional Urushi canonical 型号，补充当前官方商品页对基体、漆艺术语、笔尖/feed、供墨、帽盖与附件的可核实信息，写出自然中文正文并明确相邻 SKU 的身份边界；不新建实体、不写真实 catalog。

## Scope

- `wancher-dream-pen-echizen-urushi-temari` → `phase138-wancher-echizen-temari`
- `wancher-dream-pen-echizen-urushi-sakura-zukiyo` → `phase138-wancher-echizen-sakura-zukiyo`
- `wancher-dream-pen-kyoto-urushi-kasane-no-iro-ume` → `phase138-wancher-kyoto-ume`

## Verification

1. 复查 Wancher 当前 exact product pages 与已有越前／京都地域来源，保留商品字段和工艺背景的证据边界。
2. 从 Phase 474 owned checkpoint 复制 disposable catalog，迁移后用 `recordEntityContentReview` 与 `publishEntity` 发布并重放。
3. 检查 exact identity、Wancher `made_by`／reverse navigation、来源、主媒体、四项审核和 publication contract v3。
4. 运行 SQLite 完整性、library contract、quality audit、定向 test、Biome、diff 和全仓 TypeScript。

## Guardrails

- 只使用本阶段 owned checkpoint；不连接 Turso，不写 `data/fpkg.db`。
- 不删除或暂存其他 agent 的 research、`.next-phase*`、Montblanc quick 或其它 checkpoint。
- 复用并保留 Phase 138 的 aliases、variants、媒体、maker relation、regional scopes 和 exact SKU 身份。
