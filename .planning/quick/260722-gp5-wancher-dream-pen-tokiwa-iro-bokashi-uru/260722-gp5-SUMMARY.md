---
phase: 129-wancher-dream-pen-tokiwa-bokashi
plan: 01
subsystem: content
tags: [wancher, dream-pen, tokiwa, bokashi, publication]
requires:
  - phase128 Wancher checkpoint baseline
  - migration 032 taxonomy identity
provides:
  - exact Tokiwa-iro content pack
  - exact Bokashi Urushi Lunar Eclipse content pack
  - guarded add-two topology and publication regression
affects: [wancher-brand, dream-pen-navigation, public-entities]
tech-stack:
  added: []
  patterns: [CuratedEntityPack, recordEntityContentReview, publishEntity]
key-files:
  created:
    - scripts/data/phase129-wancher-dream-pen-tokiwa-bokashi.ts
    - scripts/apply-phase129-wancher-dream-pen-tokiwa-bokashi-content.ts
    - tests/content/phase129-wancher-dream-pen-tokiwa-bokashi.test.ts
  modified: []
key-decisions:
  - "Tokiwa-iro is the first-ten-year 30-piece exact SKU, not a generic green Tsugaru Urushi node."
  - "Lunar Eclipse is distinct from Sunset, Sunrise and Solar Eclipse Bokashi designs."
  - "The 2019 Shu/Aka-Tamenuri review is an exclusion scope, not evidence for either Phase 129 finish or writing behaviour."
patterns-established:
  - "A professional family review may satisfy source diversity only when its non-matching sample identities are explicitly isolated and rejected for exact-SKU claims."
requirements-completed: [QUICK-260722-GP5]
duration: 52min
completed: 2026-07-22
---

# Quick 260722-gp5 Summary

Wancher Dream Pen 又补齐两个具体 SKU：Tokiwa-iro 与 Bokashi Urushi Lunar Eclipse。所有试验仅发生在 caller-owned checkpoint copy，真实资料库未迁移。

## Outcome

- 新增 `/pen/wancher-dream-pen-tokiwa-iro`，锁定品牌首个十周年、30 支限量、青森 Tsugaru Urushi、Kara-nuri／Midori-age 与 3–6 个月工序。
- 新增 `/pen/wancher-dream-pen-bokashi-urushi-lunar-eclipse`，锁定轮岛 Bokashi-nuri、天然红黑漆渐变和手工个体差异；不混入 Sunset、Sunrise、Solar Eclipse。
- 两个 exact page 均记录 European International cartridge／converter、#6 JoWo steel 或 Wancher 18K、feed 菜单与 compact air-tight cap；价格和 available／sold-out 只作 2026-07-22 快照。
- The Pencil Case Blog 2019 回访只进入 Shu／Aka-Tamenuri production-sample 排除 scope，不为两支 Phase 129 产品补漆面、配置或写感。
- 两份正文为 3,432／3,382 Unicode，配两张 unique 1600×900 site-original factual SVG。
- 两个新 pen 各新增一组 exact made_by/reverse；既有 Dream Pen article 与 Phase107/112/113/119/120/128 实体完整 digest 不变。
- Wancher brand 只按 post-topology current hash 重审发布；目标实体只走 fact/language/media review 与 publishEntity。

## Verification

- `node --import tsx --test tests/content/phase129-wancher-dream-pen-tokiwa-bokashi.test.ts` — PASS 1/1（约 106 秒）
- `pnpm exec tsc --noEmit --pretty false` — PASS
- `pnpm exec biome check tests/content/phase129-wancher-dream-pen-tokiwa-bokashi.test.ts` — PASS
- CuratedEntityPack validation — PASS 2/2（summary 113／103；body 3,432／3,382）
- `xmllint --noout public/images/library/site-original/phase129/wancher/*.svg` — PASS
- `git diff --cached --check` / `git diff --check` — PASS
- `data/fpkg.db` SHA-256 保持 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`
- Product commit: `c87ff81 feat(content): add Wancher Tokiwa and Bokashi SKUs`

## Scope Note

Quick 260722-gp5 完成不代表全量 goal 完成。仍需继续补齐其它具体 SKU 与品牌／型号，之后才可正式迁移、全量自动检查、真人遍历、部署和线上逐条复查。
