---
quick_id: 260908-nlr
status: complete
description: 审计 Cypress Crown Mini 覆盖并在证据不足时保持历史型号 defer
---

# Quick Plan: Cypress Crown Mini 覆盖审计

## Scope

- 对照 Phase 21 taxonomy matrix，确认 `台湾::Cypress Crown Mini` 的当前 catalog 覆盖和既有 `defer` 状态。
- 只读检查真实本地 catalog，不写 `data/fpkg.db`，不写 Turso，也不创建未经身份锁定的实体。
- 核验 Cypress 官方商店页与 2020 台湾 Giftionery preview PDF 的身份、时态和可用规格边界。
- 将“历史型号存在，但当前可发布身份／规格／主图证据不足”的结论固化为可复核 evidence，供后续恢复配额后再审。

## Acceptance

- [x] Phase 21 row、taxonomy checksum 与本地 catalog absence query 均有记录。
- [x] 官方商店页与历史 PDF 的抓取状态、hash、页码和关键摘录均有记录，并区分现行品牌证据与历史型号证据。
- [x] 明确列出阻止正式安装的身份、规格、时态和媒体证据，不把历史资料升级为现行公开页。
- [x] 真实 catalog SHA-256 保持不变，未执行本地或远端 mutation。

## Verification

- `node` 解析 taxonomy row 并计算文件 SHA-256。
- `sqlite3 'file:data/fpkg.db?mode=ro'` 统计实体并执行 Cypress/Crown Mini exact-name/slug absence query。
- `curl` / `pdftotext` 读取来源快照并核对 PDF 元数据、页码和摘录。
- `node` 解析 evidence JSON；`git diff --check`；显式 staged-path 检查。

## Output

`.planning/quick/260908-nlr-audit-cypress-crown-mini-coverage-with-s/evidence/cypress-crown-mini-audit.json`

