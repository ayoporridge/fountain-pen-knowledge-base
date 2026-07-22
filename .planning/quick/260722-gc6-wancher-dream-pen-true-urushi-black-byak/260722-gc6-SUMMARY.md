---
phase: 128-wancher-dream-pen-urushi-skus
plan: 01
subsystem: content
tags: [wancher, dream-pen, urushi, byakudan, publication]
requires:
  - phase120 Wancher checkpoint baseline
  - migration 032 taxonomy identity
provides:
  - exact True Urushi Black content pack
  - exact Byakudan-nuri content pack
  - guarded add-two topology and publication regression
affects: [wancher-brand, dream-pen-navigation, public-entities]
tech-stack:
  added: []
  patterns: [CuratedEntityPack, recordEntityContentReview, publishEntity]
key-files:
  created:
    - scripts/data/phase128-wancher-dream-pen-urushi-skus.ts
    - scripts/apply-phase128-wancher-dream-pen-urushi-skus-content.ts
    - tests/content/phase128-wancher-dream-pen-urushi-skus.test.ts
  modified: []
key-decisions:
  - "True Urushi Black is an exact SKU; the 2018 black prototype remains a historical sample."
  - "Byakudan-nuri sold-out is a dated availability snapshot, not permanent retirement."
  - "Official customer reviews and AI-generated store summaries are excluded as independent evidence."
patterns-established:
  - "New sibling packs can protect an older public article that predates entity_publications while still requiring public visibility."
requirements-completed: [QUICK-260722-GC6]
duration: 28min
completed: 2026-07-22
---

# Quick 260722-gc6 Summary

Wancher Dream Pen 又补齐两个具体 SKU：True Urushi Black 与 Byakudan-nuri。所有试验仅发生在 caller-owned checkpoint copy，真实资料库未迁移。

## Outcome

- 新增 /pen/wancher-dream-pen-true-urushi-black，锁定硬橡胶＋真漆、轮岛手涂、欧标墨囊／上墨器、当前 #6 JoWo steel／Wancher 18K 与 feed 菜单。
- 新增 /pen/wancher-dream-pen-byakudan-nuri，锁定箔、透明漆、螺旋层次、抛光和官网称 Kintsugi art 的边缘装饰；sold-out 只记录为 2026-07-22 快照。
- 2018 black production prototype 与 2019 production samples 均隔离到历史 sample scope；不外推当前尖、导墨、写感或 Byakudan 工艺。
- 两份正文分别为 3,127／3,628 Unicode，配两张 unique 1600×900 site-original factual SVG。
- 两个新 pen 各新增一组 exact made_by/reverse；既有 Dream Pen article 和 Phase107/112/113/119/120 实体完整 digest 不变。
- Wancher brand 只按 post-topology current hash 重审发布；两个目标实体只走 fact/language/media review 与 publishEntity。

## Verification

- node --import tsx --test tests/content/phase128-wancher-dream-pen-urushi-skus.test.ts — PASS 1/1（约 82 秒）
- pnpm exec tsc --noEmit --pretty false — PASS
- pnpm exec biome check tests/content/phase128-wancher-dream-pen-urushi-skus.test.ts — PASS
- CuratedEntityPack validation — PASS 2/2
- xmllint --noout public/images/library/site-original/phase128/wancher/*.svg — PASS
- git diff --cached --check / git diff --check — PASS
- data/fpkg.db SHA-256 保持 85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc
- Product commit: 1a8f638 feat(content): add Wancher urushi Dream Pen SKUs

## Scope Note

Quick 260722-gc6 完成不代表全量 goal 完成。仍需继续补齐其它具体 SKU 与品牌／型号，之后才可正式迁移、全量自动检查、真人遍历、部署和线上逐条复查。
