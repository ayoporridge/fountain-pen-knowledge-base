---
phase: 131-waterman-exception
plan: 01
subsystem: content
tags: [waterman, exception, taxonomy, publication]
requires:
  - phase83 Waterman current-series checkpoint baseline
  - migration 032 taxonomy identity
provides:
  - exact Waterman Exception series pack anchored to SAP_2214314 Blue CT
  - guarded add-one Waterman topology and publication regression
affects: [waterman-brand, exception-series, public-entities]
tech-stack:
  added: []
  patterns: [CuratedEntityPack, recordEntityContentReview, publishEntity]
key-files:
  created:
    - scripts/data/phase131-waterman-exception.ts
    - scripts/apply-phase131-waterman-exception-content.ts
    - tests/content/phase131-waterman-exception.test.ts
  modified: []
key-decisions:
  - "Allure is already fully implemented by Phase83 and is explicitly excluded from this batch."
  - "SAP_2214314 Blue CT is the current exact anchor; Slim L’Essence du Bleu and Night & Day owner measurements remain separate version/sample scopes."
  - "The current SKU receives no borrowed family-wide dimensions, weight, closure or box-content claims."
patterns-established:
  - "A professional review of a named Slim/themed version may establish that version only and cannot backfill a sibling current SKU."
requirements-completed: [QUICK-260722-H6W]
duration: 32min
completed: 2026-07-22
---

# Quick 260722-h6w Summary

Waterman Exception 已新增为独立系列页，以当前 Blue CT `SAP_2214314` 为 exact SKU 锚点。Allure 已由 Phase83 实现，本批没有重复建模。所有试验仅发生在 caller-owned checkpoint copy，真实资料库未迁移。

## Outcome

- 新增 `/pen/waterman-exception`，区分 Carène、Expert、Hémisphère 与 Allure。
- 当前 scope 只采用 SAP_2214314 的 Blue CT、方形轮廓与 rhodium-plated 18K gold nib 信息。
- Scrively 2024 评测被限定为 Exception Slim L’Essence du Bleu 样本；材料、供墨、尖幅和附带 converter 不外推。
- Night & Day platinum-trim 的 57.4 g 仅作为历史 owner sample，用来阻止全系重量与尺寸误填。
- 正文 3,611 Unicode，配 unique 1600×900 site-original factual SVG。
- 新 pen 新增 exact made_by/reverse；Phase83 Carène、Expert、Hémisphère、Allure 完整 digest 不变。
- Waterman brand 只按 post-topology current hash 重审发布；Exception 只走 fact/language/media review 与 publishEntity。

## Verification

- `node --import tsx --test tests/content/phase131-waterman-exception.test.ts` — PASS 1/1（约 42 秒）
- `pnpm exec tsc --noEmit --pretty false` — PASS
- `pnpm exec biome check tests/content/phase131-waterman-exception.test.ts` — PASS
- CuratedEntityPack validation — PASS（summary 124；body 3,611；6 sources；4 scopes；5 claims；3 variants）
- `xmllint --noout public/images/library/site-original/phase131/waterman/waterman-exception.svg` — PASS
- `git diff --cached --check` / `git diff --check` — PASS
- `data/fpkg.db` SHA-256 保持 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`
- Product commit: `c186cbd feat(content): add Waterman Exception`

## Scope Note

Quick 260722-h6w 最初描述包含 Allure；实施前发现 Phase83 已完整覆盖，因此计划明确修正为 Exception-only。Phase131 完成不代表全量 goal 完成，仍需继续其它未覆盖型号，之后才可正式迁移、全量自动检查、真人遍历、部署和线上逐条复查。
