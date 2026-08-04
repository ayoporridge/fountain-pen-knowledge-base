# Phase 474 Plan — deepen existing Pilot Silvern, Justus 95 and Grance

## Goal

复用 Phase 110 的三个 Pilot canonical 型号，补充 2026 当前官方规格、机械／材质边界、样本证据、版本差异、维护和选购建议；不新建实体、不写真实 catalog。

## Scope

- `pilot-justus-95` → `phase110-pilot-justus-95`
- `pilot-silvern` → `phase110-pilot-silvern`
- `pilot-grance` → `phase110-pilot-grance`

## Verification

1. 复查 Pilot Japan 当前产品目录、保修／护理资料和已有具名评测。
2. 从 Phase 473 owned checkpoint 复制 disposable catalog，迁移后发布并重放。
3. 检查 identity、Pilot 品牌关系、reverse navigation、来源、主媒体、四项审核和 publication contract v3。
4. 运行 SQLite 完整性、library contract、quality audit、定向 test、Biome、diff 和全仓 TypeScript。

## Guardrails

- 只使用本阶段 owned checkpoint；不连接 Turso，不写 `data/fpkg.db`。
- 不删除或暂存其他 agent 的 research、`.next-phase*`、Montblanc quick 或其它 checkpoint。
- 复用并保留 aliases、variants、媒体、maker relation 和历史 sample scopes。
