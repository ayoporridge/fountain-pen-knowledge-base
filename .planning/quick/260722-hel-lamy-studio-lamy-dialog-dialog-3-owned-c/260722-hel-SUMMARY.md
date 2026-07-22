---
phase: 132-lamy-studio-dialog
plan: 01
subsystem: content
tags: [lamy, studio, dialog, taxonomy, publication]
requires:
  - phase68 LAMY brand and Safari/AL-star checkpoint baseline
  - migration 032 taxonomy identity
provides:
  - canonical LAMY studio and LAMY dialog packs on existing raw identities
  - permanent old-route redirects and guarded review/publication regression
affects: [lamy-brand, studio, dialog, public-entities]
tech-stack:
  added: []
  patterns: [CuratedEntityPack, recordEntityContentReview, publishEntity]
key-files:
  created:
    - scripts/data/phase132-lamy-studio-dialog.ts
    - scripts/apply-phase132-lamy-studio-dialog-content.ts
    - tests/content/phase132-lamy-studio-dialog.test.ts
  modified: []
key-decisions:
  - "studio steel-nib and gold-nib current SKUs remain separate scopes; professional measurements and impressions remain sample scoped."
  - "Current LAMY dialog and former/product-family Dialog 3 naming share one identity designed by Franco Clivio; dialog cc remains a separate sibling."
  - "The schema's made_by insertion supplies the reverse edge, so validation locks exact topology rather than a trigger-owned reverse-link ID."
patterns-established:
  - "When a relationship trigger owns the inverse row ID, content migrations assert the exact source/target/type pair instead of replacing trigger identity."
requirements-completed: [QUICK-260722-HEL]
duration: 38min
completed: 2026-07-22
---

# Quick 260722-hel Summary

LAMY studio 与 LAMY dialog 已在两个既有 raw 实体上原位规范化并形成完整来源化内容包。旧中文混合 slug 均保留永久跳转；Safari、AL-star 与 dialog cc 没有重做或混入。所有试验写入只发生在 caller-owned checkpoint copy，真实资料库未迁移。

## Outcome

- `/pen/lamy-studio` 以当前 black steel-F SKU `54395071594840` 为规格锚点，并将 palladium 14 ct gold-nib SKU 与 2022 Terracotta steel-M 评测样本分开。
- `/pen/lamy-dialog` 采用当前产品标题；`LAMY dialog 3`／`Dialog 3` 保留为 former/product-family alias，设计者修正为 Franco Clivio。
- dialog 的旋转伸缩笔尖、笔夹联动和球阀由当前官方页支持；2016 Broad 样笔的约 45 g、四个月密封观察和 VP 比较不外推。
- studio 正文 2,487 Unicode，dialog 正文 2,846 Unicode；各配一张 unique 1600×900 site-original factual SVG。
- 两支 pen 均保留唯一 LAMY `made_by/reverse` 拓扑；旧路由分别跳转 canonical slug。
- LAMY brand 与两个目标只按 post-topology current hash，经 fact/language/media review 和 `publishEntity` 发布。
- pristine replay 为 noop；partial identity、alias tamper、remote selection 与 hardlink 均 fail closed。

## Verification

- `node --import tsx --test tests/content/phase132-lamy-studio-dialog.test.ts` — PASS 1/1（约 39 秒）
- `pnpm exec tsc --noEmit --pretty false` — PASS
- `pnpm exec biome check tests/content/phase132-lamy-studio-dialog.test.ts scripts/apply-phase132-lamy-studio-dialog-content.ts` — PASS
- CuratedEntityPack validation — PASS（studio：summary 103、body 2,487、5 sources、4 claims、3 variants；dialog：summary 113、body 2,846、4 sources、4 claims、2 variants）
- `xmllint --noout`（两张 Phase132 SVG）— PASS
- `git diff --cached --check` / `git diff --check` — PASS
- `data/fpkg.db` SHA-256 保持 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`
- Product commit: `dcea82b feat(content): publish LAMY studio and dialog`

## Scope Note

Phase132 只完成两个 LAMY raw 型号的内容与身份批次，不代表全量 goal 完成。真实数据库仍未写入；全量内容完成后才进入正式迁移、全站自动检查、真人遍历、部署与线上逐条复查。
