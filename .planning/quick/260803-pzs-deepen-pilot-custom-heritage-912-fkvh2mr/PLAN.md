---
phase: quick
id: 260803-pzs
status: complete
created: 2026-08-03
---

# Deepen Pilot Custom Heritage 912 FKVH2MR sourced content

## Goal

深化既有 `pilot-custom-heritage-912` 型号页，依据 Pilot Japan 当前目录与官方支持资料补齐 FKVH2MR-BF 的精确作用域、14K No.10、供墨、规格、价格、维护、相邻型号边界和 15 个官方尖号 market SKU；不创建重复实体，也不写入真实 `data/fpkg.db`。

## Scope

- 保留既有 Pilot 品牌与 Custom Heritage 912 身份；PO、FA、WA、SU 等作为同一型号的尖号入口与 variant，不拆成独立实体。
- 正文必须区分 912 与 Custom 742、743、823、845、URUSHI、Heritage 91/92、Capless；不因共享 No.10 或 converter 合并身份。
- 所有试写只进入本 quick 的 caller-owned checkpoint copy；通过 `recordEntityContentReview` 与 `publishEntity` 的现有审核—发布路径，不直接写 publication 状态。

## Acceptance

1. Pilot exact product card、support、manual、category、warranty、price list 与可靠专业资料形成至少 10 个独立来源组。
2. 正文至少 8,000 Unicode 字符，涵盖身份、15 个尖号代码、规格、供墨、版本／市场价格边界、维护、选购和非产品照片声明。
3. checkpoint 首次 apply 发布，`fact/language/media/publication` 四项审核均 approved；readiness 无 blocker；品牌 `made_by` 与 reverse 导航各唯一；replay 返回同 hash 的 `noop`。
4. 定向测试、TypeScript、Biome、`git diff --check` 通过；只暂存本批文件，不触碰其他 research、`.next-phase*` 或旧 quick 目录。
