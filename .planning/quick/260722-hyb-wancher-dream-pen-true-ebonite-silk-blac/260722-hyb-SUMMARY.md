---
phase: 134-wancher-dream-pen-true-ebonite-silk-black
plan: 01
subsystem: content
tags: [wancher, dream-pen, true-ebonite, silk-black, publication]
requires:
  - phase104 Dream Pen series navigation
  - phase107 Wancher brand and True Ebonite Matte Black
  - migration 032 taxonomy identity
provides:
  - exact Wancher Dream Pen True Ebonite Silk Black content pack
  - guarded add-one and current/sample/AS-IS boundary regression
affects: [wancher-brand, dream-pen-navigation, true-ebonite-siblings]
tech-stack:
  added: []
  patterns: [CuratedEntityPack, recordEntityContentReview, publishEntity]
key-files:
  created:
    - scripts/data/phase134-wancher-dream-pen-true-ebonite-silk-black.ts
    - scripts/apply-phase134-wancher-dream-pen-true-ebonite-silk-black-content.ts
    - tests/content/phase134-wancher-dream-pen-true-ebonite-silk-black.test.ts
  modified: []
key-decisions:
  - "Silk Black is an exact repeated-polishing SKU and remains separate from the protected Matte Black sandblast sibling."
  - "The 2018 supplied polished sample and current normal-product menu are separate scopes; prototype-linked measurements are rejected."
  - "AS IS nicks, scrapes, streaks, option menu and return terms remain defect-inventory scope, never normal-product traits."
patterns-established:
  - "A normal SKU, historical supplied sample and AS IS defect listing can share identity context while retaining independent scopes and rejected spec evidence."
requirements-completed: [QUICK-260722-HYB]
duration: 34min
completed: 2026-07-22
---

# Quick 260722-hyb Summary

Wancher Dream Pen True Ebonite Silk Black 已作为独立 exact SKU 形成完整来源化内容包。当前正常商品的反复抛光、European International C/C 与 nib/feed/clip menu，2018 获赠样笔，以及 AS IS 瑕疵库存被严格分开；Matte Black 的 sandblast 表面没有被复制。所有试验写入只发生在 caller-owned checkpoint copy，真实资料库未迁移。

## Outcome

- 新页面为 `/pen/wancher-dream-pen-true-ebonite-silk-black`，stable ID `phase134-wancher-true-ebonite-silk-black`。
- 正文链接既有 `/article/wancher-dream-pen` 系列导航与 Matte Black sibling，但实体拓扑只新增到 Wancher brand 的精确 made_by/reverse。
- 当前 normal listing 保留 Kanto repeated polishing、ebonite、European International cartridge/converter、三类 nib、三类 feed 与三种 clip variants。
- chrome／gold clip 的 unavailable 状态只记录为 2026-07-22 snapshot，不固化为永久售罄。
- 2018 supplied sample 的 polished／clipless／non-posting、block threads、steel JoWo fine + FNF ebonite feed 与体验全部停留在 sample scope。
- AS IS 的 nicks、scrapes、强光色差、旧菜单与退换边界只用于瑕疵品验收。
- 正文 4,026 Unicode，配 unique 1600×900 site-original factual SVG。
- Dream Pen article 与 Matte Black 完整 digest 不变；Wancher 非拓扑 payload 不变。
- Wancher brand 与 Silk Black 只按 post-topology current hash，经 fact/language/media review 和 `publishEntity` 发布。
- pristine replay 为 noop；partial identity、alias tamper、remote selection 与 hardlink 均 fail closed。

## Verification

- `node --import tsx --test tests/content/phase134-wancher-dream-pen-true-ebonite-silk-black.test.ts` — PASS 1/1（约 21 秒）
- `pnpm exec tsc --noEmit --pretty false` — PASS
- `pnpm exec biome check ...phase134...` — PASS（受 Biome include 规则约束的目标文件）
- CuratedEntityPack validation — PASS（summary 122；body 4,026；7 sources；3 scopes；6 claims；3 variants；1 media；3 timeline）
- `xmllint --noout public/images/library/site-original/phase134/wancher/dream-pen-true-ebonite-silk-black.svg` — PASS
- `git diff --cached --check` / `git diff --check` — PASS
- `data/fpkg.db` SHA-256 保持 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`
- Product commit: `60cff1f feat(content): publish Wancher Silk Black`

## Scope Note

Phase134 只完成一个 Wancher True Ebonite 具体 SKU，不代表全量 goal 完成。真实数据库仍未写入；其余 Pilot、Wancher 与全站缺口仍需继续，全部内容包完成后才进入正式迁移、全站自动检查、真人遍历、部署与线上逐条复查。
