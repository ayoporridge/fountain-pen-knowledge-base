# Phase 473 Plan — deepen existing Pilot Kakuno, Prera and Cocoon

## Goal

在不新建实体、不写真实 `data/fpkg.db` 的前提下，复用 Phase 109 的三个 Pilot canonical 型号，把当前官方规格、使用维护、版本差异、地区边界和选购建议补成可发布正文。

## Scope

- `pilot-kakuno` → `U6w1BK0N4u0f`
- `pilot-prera` → `UrbBB-onjGnF`
- `pilot-cocoon` → `1dtEi80xLCZ1`

## Verification

1. 复查 Pilot 当前日本目录、官方使用／护理资料与已有具名评测来源。
2. 在 Phase 472 final checkpoint 的 disposable copy 上迁移并发布，拒绝远程环境变量。
3. 检查 canonical identity、Pilot 品牌关系、反向导航、来源、主媒体、四项审核与 publication contract v3。
4. 重放确认三包均为 noop；运行 `PRAGMA integrity_check`、`foreign_key_check`、library contract、quality/coverage audit、Biome、`git diff --check` 和全仓 TypeScript。

## Guardrails

- 不写真实 `data/fpkg.db`，不接 Turso。
- 不删除或暂存其他 agent 的 research、`.next-phase*` 或其他 quick/checkpoint 文件。
- 只更新现有实体的正文和来源化内容，保留 aliases、made_by、媒体和已有系列边界。
