---
phase: 133-lamy-logo
plan: 01
subsystem: content
tags: [lamy, logo, taxonomy, publication]
requires:
  - phase68 LAMY brand checkpoint baseline
  - migration 032 taxonomy identity
provides:
  - canonical LAMY logo pack on the existing raw identity
  - permanent old-route redirect and guarded review/publication regression
affects: [lamy-brand, lamy-logo, public-entities]
tech-stack:
  added: []
  patterns: [CuratedEntityPack, recordEntityContentReview, publishEntity]
key-files:
  created:
    - scripts/data/phase133-lamy-logo.ts
    - scripts/apply-phase133-lamy-logo-content.ts
    - tests/content/phase133-lamy-logo.test.ts
  modified: []
key-decisions:
  - "The current global fountain-pen category establishes LAMY logo presence, while Logo 005 FP specifications and bundle contents remain Philippines-regional scope."
  - "Goulet's 18 g sample remains sample scoped, and its aluminium wording does not override the current regional official stainless-steel material."
  - "Logo ballpoint, M+, Lx, cp1, studio and Safari are explicit siblings or exclusions, not variants of this fountain-pen entity."
patterns-established:
  - "A current category listing can establish model presence without granting exact-SKU fields; regional official configuration stays separately scoped."
requirements-completed: [QUICK-260722-HR0]
duration: 31min
completed: 2026-07-22
---

# Quick 260722-hr0 Summary

LAMY logo 已在既有 raw 实体上原位规范化并形成完整来源化内容包。全球 LAMY 钢笔分类仍列一个 Logo 产品，因此本页按当前型号发布；Logo 005 FP 的具体钢尖、表面、供墨和盒内物只按菲律宾区域官方页面表达。所有试验写入只发生在 caller-owned checkpoint copy，真实资料库未迁移。

## Outcome

- `/pen/lamy-logo` 沿用 raw ID `aHnnbObkUsOe`，旧 `/pen/凌美-lamy-logo` 永久跳转。
- 当前全球分类 presence 与区域 Logo 005 FP 分 scope，不从无法稳定打开的无 variant handle 推断全球统一 SKU。
- brushed／cyclical-matt stainless-steel finishes 是同一钢笔产品线 variants；ballpoint、M+、Lx 和 cp1 等均排除。
- 2011 M 尖样笔的写感与 2014 约 18 g 样本均被隔离；后者的 aluminium 表述不覆盖区域官方 stainless steel 字段。
- 正文 2,696 Unicode，配 unique 1600×900 site-original factual SVG。
- 目标保持唯一 LAMY made_by/reverse；全体既有 LAMY 目标完整 digest 不变。
- LAMY brand 与 Logo 只按 post-topology current hash，经 fact/language/media review 和 `publishEntity` 发布。
- pristine replay 为 noop；partial identity、alias tamper、remote selection 与 hardlink 均 fail closed。

## Verification

- `node --import tsx --test tests/content/phase133-lamy-logo.test.ts` — PASS 1/1（约 24 秒）
- `pnpm exec tsc --noEmit --pretty false` — PASS
- `pnpm exec biome check tests/content/phase133-lamy-logo.test.ts scripts/apply-phase133-lamy-logo-content.ts` — PASS
- CuratedEntityPack validation — PASS（summary 97；body 2,696；6 sources；4 scopes；5 claims；2 variants；1 media）
- `xmllint --noout public/images/library/site-original/phase133/lamy/lamy-logo.svg` — PASS
- `git diff --cached --check` / `git diff --check` — PASS
- `data/fpkg.db` SHA-256 保持 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`
- Product commit: `4afc52a feat(content): publish LAMY logo`

## Scope Note

Phase133 只完成最后一个已知 LAMY raw 型号的内容与身份批次，不代表全量 goal 完成。真实数据库仍未写入；全量内容完成后才进入正式迁移、全站自动检查、真人遍历、部署与线上逐条复查。
