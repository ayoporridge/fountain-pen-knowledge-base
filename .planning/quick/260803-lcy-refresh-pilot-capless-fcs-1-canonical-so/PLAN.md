---
phase: quick
id: 260803-lcy
status: complete
created: 2026-08-03
---

# Refresh Pilot Capless FCS-1 sourced content

## Goal

深化既有 `phase367-pilot-capless-special-alloy` 实体，补齐 Pilot Japan FCS-1 特殊合金尖、四种哑光颜色、八个市场 SKU、规格、维护和相邻路线边界；不创建重复实体，也不写入受保护资料库。

## Tasks

1. 复核 FCS-1 exact Web Catalog、官方护理/保证/说明、目录分类、新闻稿和专业评测边界。
2. 写入自然中文研究正文，并以 `CuratedEntityPack` 表达 FCS-1 身份、组件材料、特殊合金与 18K 分界及四颜色 F/M 变体。
3. 只在 caller-owned checkpoint copy 通过现有审核—发布路径应用，读回关系、来源、规格、readiness 并重放确认 noop。
4. 运行定向回归、TypeScript、Biome、diff 检查，随后只提交本批拥有的文件。

## Acceptance

- 既有 FCS-1 身份与 Pilot maker relation 保持单一；不新增 duplicate entity。
- 正文至少 8,000 Unicode 字符，明确特殊合金并区分 FC-18SR、Stripe、絣、SE、Decimo、LS、Raden、Wood 与 Custom。
- FCS-1-MS/MCO/MDG/MAL × F/M 八个 `market_sku` 与一个 `edition_group` 有官方来源，且规格含 CON-40、140 mm、φ13.4 mm、30 g 和 ¥17,600 价格作用域。
- 首次 apply 通过 fact/language/media/publication 审核并发布；重放为 noop；真实资料库快照保持不变。
